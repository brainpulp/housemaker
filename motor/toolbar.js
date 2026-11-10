/* Interfaz del CAD (3D):
   · Barra de herramientas a la izquierda, en grupos, con íconos (icons.js) y subcomandos desplegables (▸).
   · Tooltips propios, a los 250 ms: nombre, atajo y qué hace.
   · Capas: inspector flotante, arrastrable y plegable.
   · Cortes y Vistas: desplegables de la barra.
   · Variantes: tarjeta en el panel derecho cuando lo elegido pertenece a una zona con opciones; lista de zonas en la barra.
   · Barra de abajo: sólo estado (herramienta activa, qué hacer, GLB, fps).
   · Planta / 3D arriba a la izquierda; pestañas del panel derecho plegables. */
import { icon } from './icons.js';
import { initCaminar } from './caminar.js';

export function initToolbar(stage,visor,{vistas,zonas=[]}={}){
  const $=id=>document.getElementById(id);
  const M3=$('modo-3d');
  const LS={get:(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};

  /* ---------- tooltips ---------- */
  const tip=document.createElement('div');tip.id='tip';tip.hidden=true;document.body.appendChild(tip);let tT=null,tEl=null;
  const tipOf=el=>{if(el.title){el.dataset.tip=el.dataset.tip||el.title;el.removeAttribute('title');}return el.dataset.tip;};
  function showTip(el){const t=tipOf(el);if(!t)return;const [h,...rest]=t.split('|');const k=el.dataset.key;
    tip.innerHTML=`<b>${h}</b>${k?`<kbd>${k}</kbd>`:''}${rest.length?`<div>${rest.join('|')}</div>`:''}`;tip.hidden=false;
    const r=el.getBoundingClientRect(),tw=tip.offsetWidth,th=tip.offsetHeight;let x,y;
    if(el.closest('#toolbar3d,#tbFly')){x=r.right+8;y=r.top+r.height/2-th/2;}else{x=r.left+r.width/2-tw/2;y=r.bottom+6;if(y+th>innerHeight-4)y=r.top-th-6;}
    tip.style.left=Math.max(4,Math.min(innerWidth-tw-4,x))+'px';tip.style.top=Math.max(4,y)+'px';}
  const hideTip=()=>{clearTimeout(tT);tT=null;tEl=null;tip.hidden=true;};
  document.addEventListener('pointerover',e=>{if(e.pointerType==='touch')return;const el=e.target.closest&&e.target.closest('[data-tip],[title]');if(!el||!M3.contains(el)&&!el.closest('#tbFly,#capasPanel'))return;if(el===tEl)return;hideTip();tEl=el;tipOf(el);tT=setTimeout(()=>showTip(el),250);});
  document.addEventListener('pointerout',e=>{if(tEl&&!tEl.contains(e.relatedTarget))hideTip();});
  document.addEventListener('pointerdown',hideTip,true);addEventListener('keydown',hideTip,true);

  /* ---------- herramientas ---------- */
  const click=id=>{const b=$(id);if(b)b.click();};
  const PAN={editarTg:'edPanel',senalarTg:'senPanel',marcarTg:'marcasPanel',medirTg:'medPanel'};
  const isOpen=id=>{const p=$(PAN[id]);return p&&!p.hidden;};
  const open=id=>{if(!isOpen(id))click(id);},close=id=>{if(isOpen(id))click(id);};
  const ALL=Object.keys(PAN),only=id=>{ALL.filter(x=>x!==id).forEach(close);open(id);};
  const edTool=t=>{['senalarTg','marcarTg','medirTg'].forEach(close);open('editarTg');const b=document.querySelector(`#edPanel [data-tool="${t}"]`);if(b)b.click();};
  const T={
    nav:{ic:'nav',n:'Navegar',k:'Esc',d:'Orbitar, desplazar y hacer zoom (hacia el cursor). Cierra la herramienta activa.',run:()=>ALL.forEach(close)},
    caminar:{ic:'persona',n:'Caminar hasta acá',k:'W',d:'Cada clic es un destino: si estás en el aire, baja; después camina hasta ahí con los ojos a 1,70 m. W (tocada) prende y apaga; mantenida, avanza.',run:()=>CAM.set(true)},
    sel:{ic:'sel',n:'Seleccionar',d:'Tocá una pieza: ves su ficha, sus variantes y los códigos de puntos y aristas.',run:()=>edTool('')},
    mover:{ic:'mover',n:'Mover',k:'M',d:'Arrastrá una flecha para mover en ese eje, o la pieza sobre el piso (Shift: sube o baja).',run:()=>edTool('mover')},
    ab:{ic:'ab',n:'Mover punto a punto',d:'Un punto de la pieza elegida y el punto donde tiene que quedar.',run:()=>edTool('ab')},
    estirar:{ic:'estirar',n:'Estirar',k:'T',d:'Empujá o tirá una cara plana de la pieza elegida.',run:()=>edTool('estirar')},
    undo:{ic:'undo',n:'Deshacer',k:'Ctrl/⌘ Z',d:'Deshace el último cambio de las herramientas de edición.',run:()=>{open('editarTg');click('edUndoAll');}},
    medir:{ic:'medir',n:'Medir',d:'Dos puntos: distancia real y lo que avanza en x, y y altura.',run:()=>only('medirTg')},
    senalar:{ic:'senalar',n:'Vértices, aristas y caras',d:'Como en un CAD: elegí vértices, aristas o caras (Shift suma). Coordenadas, largos, áreas; con dos, distancia o ángulo. Códigos para pasármelos.',run:()=>only('senalarTg')},
    marcar:{ic:'marcar',n:'Marcar',d:'Dibujá líneas y puntos con una nota; quedan guardados (K-xx).',run:()=>only('marcarTg')},
  };
  const CAM=initCaminar(visor,{activo:()=>!M3.hidden});CAM.alPrender=()=>{ALL.forEach(close);closeFly&&closeFly();};CAM.alCambiar=()=>sync();
  /* la barra: herramientas sueltas y grupos con subcomandos; los paneles (vistas, cortes, capas, variantes) al final */
  const BAR=[['nav'],['caminar'],['sel'],'filtros',['mover','ab'],['estirar'],['undo'],'|',['medir'],['marcar'],'|','capas','vistas','variantes','equip','luces','termica','estructura','personas'];
  const PANELS={filtros:{ic:'filtro',n:'Filtros de selección',d:'Qué toma el toque: objeto entero, vértice, arista o cara. Después se suman otros filtros.'},
    vistas:{ic:'video',n:'Vistas',d:'Perspectiva o paralela, lente (ojo de pez, gran angular, normal, tele) y vistas fijas, de ambientes y guardadas.'},
    corte:{ic:'corte',n:'Cortes',d:'Corte horizontal por nivel y cortes verticales norte–sur y este–oeste.'},
    capas:{ic:'capas',n:'Capas',d:'Techos, entrepiso, entorno, muebles, foliage, cotas, mostrar lo escondido, luz, explotar.'},
    variantes:{ic:'variantes',n:'Variantes de diseño',d:'Zonas con opciones (escalera al altillo…): ir a una y ver sus variantes.'},
    equip:{ic:'sofa',n:'Equipamiento',d:'Muebles por ambiente con escenarios intercambiables: elegir, mover, girar, agregar, duplicar. Se guarda solo.'},
    luces:{ic:'lampara',n:'Luces',d:'Artefactos de iluminación por ambiente (sets de spots, tiras LED, colgantes, apliques, lámparas, exterior) con escenarios; prende la noche.'},
    termica:{ic:'termometro',n:'Térmica',d:'Simulación térmica por ambiente: temperaturas a lo largo del día, mapa en 3D, consumo de cada sistema (capa «Calor»).'},
    estructura:{ic:'viga',n:'Estructura',d:'Cálculo estructural (prototipo): vigas de acero con sus apoyos y cargas de techo; % de uso por pieza, diagramas y mapa de uso en el 3D.'},
    personas:{ic:'persona',n:'Personas',d:'Figuras de 1,70 para controlar alturas libres: se arrastran por cualquier piso y pueden caminar solas.'},
    proy:{ic:'proy',n:'Perspectiva / paralela',k:'P',d:'Cambia entre perspectiva y proyección paralela (axonométrica). P tocada hace lo mismo; P mantenida + rueda o dos dedos cambia el lente (en paralela, el zoom).'}};
  const cur=LS.get('carhue-tb-cur',{});
  const bar=document.createElement('div');bar.id='toolbar3d';bar.setAttribute('role','toolbar');bar.setAttribute('aria-label','Herramientas');
  const btn=(k,d,extra='')=>`<button class="tb${extra}" data-k="${k}" data-tip="${d.n}|${d.d}"${d.k?` data-key="${d.k}"`:''} aria-label="${d.n}">${icon(d.ic)}</button>`;
  bar.innerHTML=BAR.map(g=>{if(g==='|')return '<span class="tbsep"></span>';if(typeof g==='string')return btn(g,PANELS[g],' tbpanel');
    const k=g.length>1&&g.includes(cur[g[0]])?cur[g[0]]:g[0];return g.length>1?`<span class="tbg" data-g="${g[0]}">${btn(k,T[k],' tbfly')}</span>`:btn(k,T[k]);}).join('');
  stage.appendChild(bar);
  const group=k=>BAR.find(g=>Array.isArray(g)&&g.includes(k));

  /* ---------- desplegable junto a la barra ---------- */
  const fly=document.createElement('div');fly.id='tbFly';fly.hidden=true;document.body.appendChild(fly);let flyFor=null;
  function openFly(b,fill){if(typeof corteBox!=='undefined'&&fly.contains(corteBox))corteHold.appendChild(corteBox);fly.innerHTML='';fly.className='';fly.style.cssText='';fill(fly);fly.hidden=false;flyFor=b;const r=b.getBoundingClientRect();
    fly.style.left=(r.right+6)+'px';fly.style.top=Math.max(6,Math.min(innerHeight-fly.offsetHeight-8,r.top-4))+'px';bar.querySelectorAll('.tb').forEach(x=>x.classList.toggle('flyon',x===b));}
  const closeFly=()=>{if(typeof corteBox!=='undefined'&&fly.contains(corteBox))corteHold.appendChild(corteBox);fly.hidden=true;flyFor=null;bar.querySelectorAll('.flyon').forEach(x=>x.classList.remove('flyon'));};
  document.addEventListener('pointerdown',e=>{if(!fly.hidden&&!fly.contains(e.target)&&!bar.contains(e.target))closeFly();});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!fly.hidden)closeFly();});
  addEventListener('resize',closeFly);

  function subMenu(b,g){openFly(b,el=>{el.className='fymenu';el.innerHTML=g.map(k=>`<button class="fyb fyrow${k===b.dataset.k?' on':''}" data-sub="${k}"${T[k].k?` data-key="${T[k].k}"`:''}>${icon(T[k].ic,16)}<span>${T[k].n}</span>${T[k].k?`<kbd>${T[k].k}</kbd>`:''}</button>`).join('');
    el.onclick=e=>{const s=e.target.closest('[data-sub]');if(!s)return;closeFly();setSub(g,s.dataset.sub);T[s.dataset.sub].run();sync();};});}
  function setSub(g,k){cur[g[0]]=k;LS.set('carhue-tb-cur',cur);const w=bar.querySelector(`.tbg[data-g="${g[0]}"]`);if(w){w.innerHTML=btn(k,T[k],' tbfly');}}

  /* cortes: muevo acá los controles que ya existen (corte por nivel y cortes X / Y) */
  const corteBox=document.createElement('div');corteBox.className='fypanel';const corteHold=document.createElement('div');corteHold.hidden=true;corteHold.appendChild(corteBox);stage.appendChild(corteHold);visor.corteBox=corteBox;
  {const lv=$('q-corte');const l=lv&&lv.closest('label');
    corteBox.innerHTML='<div class="fyg">Corte horizontal</div><div class="fyrowc" id="cLv"></div><div class="fyg">Cortes por eje</div><div class="fyrowc" id="cXY"></div><p class="fyh">Seis cortes, dos por eje: X de sur a norte (fondo → pileta), Y de oeste a este (patio → jardín), Z en altura. Lo que queda es lo que está entre «desde» y «hasta». En Vistas → Ambientes, cada local se aísla solo.</p>';
    if(l){l.firstChild&&l.firstChild.nodeType===3&&(l.firstChild.textContent='Nivel ');corteBox.querySelector('#cLv').appendChild(l);}
    document.querySelectorAll('#modo-3d .bottombar .clip').forEach(s=>corteBox.querySelector('#cXY').appendChild(s));}
  const corteActivo=()=>{const v=$('q-corte');return (v&&v.value!=='0')||!!document.querySelector('.clip input[type=checkbox]:checked');};

  /* ---------- capas: inspector flotante ---------- */
  const cp=document.createElement('div');cp.id='capasPanel';cp.hidden=!LS.get('carhue-capas-on',false);
  cp.innerHTML=`<div class="cph"><b>Capas</b><button class="cpb" data-cp="x" data-tip="Cerrar">${icon('x',14)}</button></div><div class="cpbody"><div class="cpg">Mostrar</div><div class="cplist" id="cpShow"></div><div class="cpg">Ver</div><div class="cplist" id="cpVer"></div></div>`;
  stage.appendChild(cp);
  {const take=(id,where,txt)=>{const el=$(id);const l=el&&el.closest('label');if(!l)return;if(txt){[...l.childNodes].filter(n=>n.nodeType===3).forEach(n=>n.remove());l.append(' '+txt);}cp.querySelector(where).appendChild(l);};
    take('q-techos','#cpShow','Techos');{const l=document.createElement('label');l.innerHTML='<input type="checkbox" id="cpMarcas"> Marcas (K-xx)';cp.querySelector('#cpShow').appendChild(l);const c=l.querySelector('input');const G=visor.marcasGrp;c.checked=!G||G.visible;c.addEventListener('change',()=>{if(visor.marcasGrp)visor.marcasGrp.visible=c.checked;try{localStorage.setItem('carhue-marcas-ver',c.checked?'1':'0');}catch(e){}});}take('q-ep','#cpShow','Entrepiso');take('q-ext','#cpShow','Deck, pileta y entorno');take('q-equip','#cpShow','Muebles');
    {const l=document.createElement('label');l.innerHTML='<input type="checkbox" id="cpVeg"> Foliage';cp.querySelector('#cpShow').appendChild(l);const c=l.querySelector('input');const sy=()=>{c.checked=!!(visor.equip&&visor.equip.vegOn&&visor.equip.vegOn());};setTimeout(sy,800);c.addEventListener('change',()=>{visor.equip&&visor.equip.vegTodo&&visor.equip.vegTodo(c.checked);});}
    {const ql=$('q-calco');const l=ql&&ql.closest('label');if(l)l.style.display='none';}take('tgDim','#cpShow','Cotas');
    {const d=document.createElement('div');d.style.cssText='padding:4px 0 2px';d.innerHTML='<button class="btn mini" id="cpTodo" style="width:100%">Mostrar todo lo escondido</button>';cp.querySelector('#cpShow').after(d);
      const b=d.querySelector('button');const up=()=>{const n=(visor.hidden||[]).length+((visor.equip&&visor.equip.ocultos)?visor.equip.ocultos():0);b.textContent=n?`Mostrar todo (${n} escondida${n>1?'s':''})`:'Mostrar todo';b.disabled=!n;};setInterval(()=>{if(!cp.hidden)up();},800);b.addEventListener('click',()=>{visor.setHidden([]);visor.equip&&visor.equip.mostrarOcultos&&visor.equip.mostrarOcultos();up();});}
    take('luzReal','#cpVer','Luz realista');const ex=$('explode');if(ex){const l=ex.closest('label');cp.querySelector('#cpVer').appendChild(l);}
    /* el resto de las variables rápidas de la casa (las que no tomó nadie arriba) también van al panel: las del grupo «Ver» bajo «Ver», las demás bajo un título con el nombre de su grupo
       (Maxi 3/11: las llaves por cocina de Cocinas no aparecían en ningún lado; #quick está escondido) */
    {const q=$('quick');if(q){const ver=cp.querySelector('#cpVer'),secs={};for(const l of [...q.querySelectorAll('label')]){if(l.style.display==='none')continue;const g=l.dataset.group||'';{const i=l.querySelector('input[type=checkbox]');if(i)l.prepend(i);}/* casilla adelante, como las demás del panel */
        if(!g||g==='Ver'||g==='General'){ver.appendChild(l);continue;}
        if(!secs[g]){const h=document.createElement('div');h.className='cpg';h.textContent=g;const box=document.createElement('div');box.className='cplist';ver.parentNode.append(h,box);secs[g]=box;}secs[g].appendChild(l);}}}}
  /* «en transparencia» por capa (Maxi 14/10): ◐ al lado de cada una; sirve sobre todo para ver adentro con los techos puestos */
  {const TR=LS.get('carhue-transp',{});const CAPAS={techos:p=>p.group==='Techos'||(p.tags||[]).includes('techos'),ep:p=>p.group==='Entrepiso',ext:p=>p.group==='Exterior',equip:null,veg:null};
    const setOp=(o,on)=>{const ms=Array.isArray(o.material)?o.material:[o.material];for(const m of ms){if(!m)continue;if(m.userData.op0==null){m.userData.op0=m.opacity;m.userData.tr0=m.transparent;m.userData.dw0=m.depthWrite;}
      if(on){m.transparent=true;m.opacity=Math.min(m.userData.op0,.22);m.depthWrite=false;}else{m.opacity=m.userData.op0;m.transparent=m.userData.tr0;m.depthWrite=m.userData.dw0;}m.needsUpdate=true;}};
    function aplicar(){for(const p of visor.parts||[]){let on=false;for(const k of ['techos','ep','ext'])if(TR[k]&&CAPAS[k](p))on=true;p.grp.traverse(o=>{if(o.isMesh)setOp(o,on);});}
      const eq=visor.scene.getObjectByName('equipamiento');if(eq)eq.traverse(o=>{if(o.isMesh)setOp(o,!!TR.equip);});const vg=visor.scene.getObjectByName('vegetacion');if(vg)vg.traverse(o=>{if(o.isMesh)setOp(o,!!TR.veg);});}
    const ids={techos:'q-techos',ep:'q-ep',ext:'q-ext',equip:'q-equip',veg:'cpVeg'};
    for(const [k,id] of Object.entries(ids)){const inp=document.getElementById(id);const l=inp&&inp.closest('label');if(!l)continue;l.style.display='flex';const b=document.createElement('button');b.type='button';b.className='cpb';b.textContent='◐';b.dataset.tip='En transparencia';b.style.cssText='margin-left:auto;font-size:13px;opacity:'+(TR[k]?1:.35);
      b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();TR[k]=!TR[k];LS.set('carhue-transp',TR);b.style.opacity=TR[k]?1:.35;aplicar();});l.appendChild(b);}
    let lp=null,lc=0;setInterval(()=>{if(!Object.values(TR).some(Boolean))return;const eq=visor.scene.getObjectByName('equipamiento'),vg=visor.scene.getObjectByName('vegetacion');const c=(eq?eq.children.length:0)+(vg?vg.children.length:0);if(visor.parts!==lp||c!==lc){lp=visor.parts;lc=c;aplicar();}},500);}
  /* capas al lado de la barra, a la altura de su botón (Maxi 15/10: «la opción de capas debe aparecer al lado del toolbar, no en el inspector») */
  const posCp=()=>{const b=document.querySelector('#toolbar3d .tb[data-k="capas"]'),tb=$('toolbar3d');if(!b||!tb)return;const s=stage.getBoundingClientRect(),r=b.getBoundingClientRect(),t=tb.getBoundingClientRect();
    cp.style.left=(t.right-s.left+8)+'px';cp.style.right='auto';const h=cp.offsetHeight||300;cp.style.top=Math.max(8,Math.min(s.height-h-8,r.top-s.top-6))+'px';};
  addEventListener('resize',()=>{if(!cp.hidden)posCp();});requestAnimationFrame(()=>{if(!cp.hidden)posCp();});
  cp.querySelector('.cph').style.cursor='default';
  /* tocar afuera cierra el panel de capas (Maxi 19/10); no cuando está metido en el inspector, ni al tocar su botón */
  document.addEventListener('pointerdown',e=>{if(cp.hidden||cp.closest('#insp'))return;const t=e.target;if(cp.contains(t)||(t.closest&&t.closest('#toolbar3d .tb[data-k="capas"]')))return;cp.hidden=true;LS.set('carhue-capas-on',false);sync();},true);
  cp.addEventListener('click',e=>{const b=e.target.closest('[data-cp]');if(!b)return;if(b.dataset.cp==='x'){cp.hidden=true;LS.set('carhue-capas-on',false);}else{cp.classList.toggle('fold');LS.set('carhue-capas-fold',cp.classList.contains('fold'));}sync();});

  /* ---------- variantes: tarjeta en el panel derecho + lista ---------- */
  const card=document.createElement('div');card.id='varCard';card.hidden=true;const selEl=M3.querySelector('#sel');selEl.after(card);
  const zBox={};let zShown=null,zPinned=null;
  for(const z of zonas){const box=document.createElement('div');box.className='vzbody';box.hidden=true;
    for(const pid of z.params){const el=$('q-'+pid);const l=el&&el.closest('label');if(l)box.appendChild(l);}
    if(z.info){const i=$(z.info);if(i)box.appendChild(i);}
    const pr=document.createElement('label');pr.className='vzpred';pr.innerHTML=`<input type="checkbox" data-pred="${z.params[0]}"> abrir siempre con esta variante`;box.appendChild(pr);
    pr.querySelector('input').addEventListener('change',e=>{visor.togglePred&&visor.togglePred(z.params[0],e.target.checked);});
    zBox[z.id]=box;}
  card.innerHTML=`<div class="vzh">${icon('variantes',14)}<b id="vzName"></b><button class="cpb" id="vzX" data-tip="Cerrar">${icon('x',14)}</button></div>`;Object.values(zBox).forEach(b=>card.appendChild(b));
  $('vzX').addEventListener('click',()=>{zPinned=null;showZone(null,true);});
  function showZone(z){zShown=z;card.hidden=!z;for(const [id,b] of Object.entries(zBox))b.hidden=!z||id!==z.id;if(z){$('vzName').textContent=z.nombre;visor.syncPred&&visor.syncPred();}}
  const zoneOf=id=>id&&zonas.find(z=>z.piezas.test(id));
  /* botón de alternativas junto a la pieza elegida (Maxi 14/10): un desplegable por variante de su zona, ahí nomás */
  {const vb=document.createElement('div');vb.id='varChip';vb.hidden=true;stage.appendChild(vb);
    const st=document.createElement('style');st.textContent=`#varChip{position:absolute;z-index:8;transform:translate(-50%,-100%);display:flex;gap:4px;align-items:center;background:var(--panel);border:1px solid var(--accent,#c0461f);border-radius:14px;padding:2px 4px 2px 8px;box-shadow:0 3px 10px rgba(0,0,0,.2);font-size:11px;white-space:nowrap;pointer-events:auto}
#varChip b{font:600 10px var(--f-mono);color:var(--accent,#c0461f);letter-spacing:.04em}#varChip select{font-size:11px;max-width:210px;border:0;background:var(--accent-soft);border-radius:10px;padding:2px 4px;cursor:pointer}`;document.head.appendChild(st);
    let zc=null,idc=null;const V3=new visor.THREE.Vector3();
    function armarChip(z){vb.innerHTML=`<b title="Opciones de diseño de ${z.nombre}">⇄</b>`+z.params.map(pid=>{const src=$('q-'+pid);if(!src||src.tagName!=='SELECT')return '';/* Maxi 10/11: una variante puede valer sólo para algunas piezas de la zona (z.solo={param:/regex de piezas/}) */if(z.solo&&z.solo[pid]&&!z.solo[pid].test(visor.selected||''))return '';const l=src.closest('label');if(l&&l.style.display==='none')return '';return `<select data-p="${pid}" title="${(src.closest('label')?.textContent||pid).trim().slice(0,60)}">${[...src.options].map(o=>`<option value="${o.value}"${o.value===src.value?' selected':''}>${o.textContent}</option>`).join('')}</select>`;}).join('');
      vb.querySelectorAll('select').forEach(s=>s.addEventListener('change',()=>{const src=$('q-'+s.dataset.p);if(!src)return;src.value=s.value;src.dispatchEvent(new Event('change',{bubbles:true}));setTimeout(()=>{const z2=zoneOf(visor.selected);if(z2)armarChip(z2);},60);}));
      ['pointerdown','wheel','keydown'].forEach(ev=>vb.addEventListener(ev,e=>e.stopPropagation()));}
    (function loop(){requestAnimationFrame(loop);const id=visor.selected,z=id&&zoneOf(id);if(!z||!(M3&&!M3.hidden)){if(!vb.hidden)vb.hidden=true;zc=null;return;}
      if(z!==zc||id!==idc){zc=z;idc=id;armarChip(z);}if(!vb.querySelector('select')){vb.hidden=true;return;}
      const p=(visor.parts||[]).find(q=>q.id===id);if(!p||!p.bb||p.bb.isEmpty()){vb.hidden=true;return;}
      V3.set((p.bb.min.x+p.bb.max.x)/2,p.bb.max.y,(p.bb.min.z+p.bb.max.z)/2).project(visor.camera);if(V3.z>1){vb.hidden=true;return;}
      const r=stage.getBoundingClientRect(),cv=visor.renderer.domElement.getBoundingClientRect();let x=cv.left-r.left+(V3.x+1)/2*cv.width,y=cv.top-r.top+(1-V3.y)/2*cv.height-10;
      x=Math.max(110,Math.min(r.width-110,x));y=Math.max(40,Math.min(r.height-10,y));vb.style.left=x+'px';vb.style.top=y+'px';if(vb.hidden)vb.hidden=false;})();}
  let lastSel;setInterval(()=>{const s=visor.selected;if(s===lastSel)return;lastSel=s;const z=zoneOf(s);if(z){zPinned=null;showZone(z);}else if(!zPinned)showZone(null);},250);
  function zonasMenu(b){openFly(b,el=>{el.className='fymenu';el.innerHTML='<div class="fyg">Zonas con variantes</div>'+zonas.map(z=>{const p=visor.params[z.params[0]];const q=(z.label||{})[p]||p;return `<button class="fyb fyrow" data-z="${z.id}">${icon('variantes',16)}<span>${z.nombre}<small>${q}</small></span></button>`;}).join('');
    el.onclick=e=>{const t=e.target.closest('[data-z]');if(!t)return;closeFly();const z=zonas.find(x=>x.id===t.dataset.z);zPinned=z;showZone(z);if(M3.classList.contains('noaside'))click('asideTg');if(z.vista)visor.fly(z.vista.p,z.vista.t);};});}

  /* ---------- vistas y tours arriba a la derecha, sobre el 3D (Maxi 15/10) ---------- */
  {const tr=document.getElementById('topright');if(tr){const st=document.createElement('style');st.textContent=`#trPop{position:absolute;z-index:20;background:var(--panel);border:1px solid var(--rule);border-radius:8px;box-shadow:0 6px 20px rgba(0,0,0,.18);padding:4px;max-height:calc(100% - 60px);overflow:auto;min-width:220px;font-size:12px}#topright .trb{display:flex;align-items:center;gap:4px}#topright .trb[aria-pressed=true]{background:var(--accent-soft)}`;document.head.appendChild(st);
    /* mismo estilo que el desplegable de la barra: copio sus reglas de #tbFly a #trPop */try{const add=[];for(const ss of document.styleSheets){let rs;try{rs=ss.cssRules;}catch(e){continue;}for(const r of rs)if(r.selectorText&&r.selectorText.includes('#tbFly')&&!r.selectorText.startsWith('#tbFly{')&&r.selectorText!=='#tbFly')add.push(r.cssText.replace(/#tbFly/g,'#trPop'));}const s2=document.createElement('style');s2.textContent=add.join('\n');document.head.appendChild(s2);}catch(e){}
    const pop=document.createElement('div');pop.id='trPop';pop.hidden=true;stage.appendChild(pop);let popFor=null;
    const mk=(k,txt,ic)=>{const b=document.createElement('button');b.className='btn trb';b.dataset.tr=k;b.innerHTML=icon(ic,15)+' '+txt;tr.prepend(b);return b;};
    const bT=mk('tours','Tours','camera'),bV=document.createElement('button');tr.prepend(bT);
    const cerrar=()=>{pop.hidden=true;popFor=null;bV.setAttribute('aria-pressed','false');bT.setAttribute('aria-pressed','false');};
    const abrir=(b,fill)=>{if(popFor===b){cerrar();return;}cerrar();pop.innerHTML='';pop.className='fymenu fyvistas';fill(pop);pop.hidden=false;popFor=b;b.setAttribute('aria-pressed','true');
      const s=stage.getBoundingClientRect(),r=b.getBoundingClientRect();pop.style.top=(r.bottom-s.top+6)+'px';pop.style.right=Math.max(6,s.right-r.right)+'px';};
    bV.addEventListener('click',()=>abrir(bV,el=>{vistas&&vistas.renderInto(el,cerrar);}));
    bT.addEventListener('click',()=>abrir(bT,el=>{visor.tours&&visor.tours.appendInto(el,cerrar);}));
    document.addEventListener('pointerdown',e=>{if(!pop.hidden&&!pop.contains(e.target)&&!tr.contains(e.target))cerrar();});}}
  /* ---------- filtros de selección (Maxi 9/11): íconos chicos bajo un ícono de filtro; manejan el filtro de senalar.js (#selFiltro, que queda escondido) ---------- */
  const FIL=[['obj','fobj','Objeto','La pieza entera'],['p','fver','Vértice','Toma el punto más cercano'],['a','fari','Arista','Toma la arista'],['c','fcar','Cara','Toma la cara']];
  function filtroActual(){const b=document.querySelector('#selFiltro [aria-checked=true]');return b?b.dataset.f:'obj';}
  function filtrosMenu(b){openFly(b,el=>{el.className='fymenu fyfil';const pinta=()=>{const a=filtroActual();el.innerHTML='<div class="fyg">Seleccionar</div><div class="fyicons">'+FIL.map(([k,ic,n,d])=>`<button class="fyic${k===a?' on':''}" data-fil="${k}" data-tip="${n}|${d}" aria-label="${n}" aria-pressed="${k===a}">${icon(ic,18)}</button>`).join('')+'</div>';};pinta();
    el.onclick=e=>{const t=e.target.closest('[data-fil]');if(!t)return;const f=document.querySelector(`#selFiltro [data-f="${t.dataset.fil}"]`);if(f)f.click();pinta();sync();};});}
  {const s2=document.createElement('style');s2.textContent=`#selFiltro{display:none!important}#tbFly.fyfil{min-width:0}#tbFly .fyicons{display:flex;gap:2px;padding:2px 4px 4px}#tbFly .fyic{width:30px;height:30px;display:grid;place-items:center;border:1px solid transparent;border-radius:5px;background:none;color:var(--ink);cursor:pointer;padding:0}#tbFly .fyic:hover{background:var(--soft)}#tbFly .fyic.on{background:var(--accent);color:#fff}
#capasPanel{font-size:12px}#capasPanel label{font-size:12px}#capasPanel .cpbody{max-height:calc(100vh - 140px);overflow:auto}#capasPanel .cpseg{display:flex;border:1px solid var(--rule);border-radius:6px;overflow:hidden}#capasPanel .cpseg button{flex:1;border:0;background:none;padding:3px 6px;font:inherit;font-size:12px;cursor:pointer;color:var(--muted)}#capasPanel .cpseg button+button{border-left:1px solid var(--rule)}#capasPanel .cpseg button[aria-pressed=true]{background:var(--ink);color:var(--panel)}
#capasPanel details>summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:4px;padding:2px 0}#capasPanel details>summary::-webkit-details-marker{display:none}#capasPanel details>summary::before{content:'▸';font-size:10px;color:var(--muted);width:10px}#capasPanel details[open]>summary::before{content:'▾'}
#capasPanel .cpvis summary.cpg{margin:6px 0 2px}#capasPanel .cpsub{margin-left:8px}#capasPanel .cpsub>summary{font-size:12px;color:var(--ink)}
#capasPanel .cpvl .fyi{display:flex;align-items:center}#capasPanel .cpvl .fyb{flex:1;text-align:left;background:none;border:0;padding:2px 6px;border-radius:4px;cursor:pointer;color:var(--ink);font:inherit;font-size:12px;line-height:1.3}#capasPanel .cpvl .fyb:hover{background:var(--soft)}#capasPanel .cpvl .fyx{background:none;border:0;color:var(--muted);cursor:pointer;font-size:12px;padding:0 4px}#capasPanel .cpvl .fyx:hover{color:var(--accent)}#capasPanel .cpvl .fye{color:var(--muted);padding:1px 6px 3px;font-size:11.5px}#capasPanel .cpvl .fyacc{color:var(--accent);width:100%;text-align:left}`;document.head.appendChild(s2);}
  /* ---------- Vistas: panel propio al lado de la barra (Maxi 9/11: «separá capas de vistas en el toolbar»): proyección, lente y vistas ---------- */
  const vp=document.createElement('div');vp.id='vistasPanel';vp.hidden=true;vp.innerHTML='<div class="cph"><b>Vistas</b><button class="cpb" data-vp="x" data-tip="Cerrar">'+icon('x',14)+'</button></div><div class="cpbody"></div>';stage.appendChild(vp);
  {/* mismas reglas de estilo que Capas */try{const add=[];for(const ss of document.styleSheets){let rs;try{rs=ss.cssRules;}catch(e){continue;}for(const r of rs)if(r.selectorText&&r.selectorText.includes('#capasPanel'))add.push(r.cssText.replace(/#capasPanel/g,'#vistasPanel'));}const s3=document.createElement('style');s3.textContent=add.join('\n')+'#vistasPanel{width:230px}#vistasPanel .cpseg button{padding:3px 2px;font-size:11px}#vistasPanel .cpseg button:disabled{opacity:.4;cursor:default}';document.head.appendChild(s3);}catch(e){}
    const body=vp.querySelector('.cpbody');
    const pr=document.createElement('div');pr.innerHTML='<div class="cpg">Proyección</div><div class="cpseg" id="cpProy"><button type="button" data-pj="0" data-tip="Perspectiva|P cambia; P mantenida + rueda cambia el lente">Perspectiva</button><button type="button" data-pj="1" data-tip="Paralela (axonométrica)|P cambia; en paralela, la rueda hace zoom">Paralela</button></div>'
      +'<div class="cpg">Lente</div><div class="cpseg" id="cpLente">'+[[110,'Ojo de pez','110° · 6 mm'],[75,'Gran angular','75° · 16 mm'],[45,'Normal','45° · 29 mm'],[20,'Tele','20° · 68 mm']].map(([f,n,d])=>`<button type="button" data-fov="${f}" data-tip="${n}|Campo vertical de ${d} (equivalente 35 mm)">${n}</button>`).join('')+'</div>';body.appendChild(pr);
    const syP=()=>{const on=!!(visor.esParalela&&visor.esParalela());pr.querySelectorAll('[data-pj]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.pj==='1')===on)));const fv=visor.camera.fov;pr.querySelectorAll('[data-fov]').forEach(b=>{b.disabled=on;b.setAttribute('aria-pressed',String(!on&&Math.abs(+b.dataset.fov-fv)<1));});};syP();setInterval(()=>{if(!vp.hidden)syP();},500);
    pr.addEventListener('click',e=>{const b=e.target.closest('[data-pj]');if(b){const want=b.dataset.pj==='1';if(visor.setParalela&&visor.esParalela()!==want)visor.setParalela(want);syP();return;}
      const f=e.target.closest('[data-fov]');if(f&&visor.setFov){visor.setFov(+f.dataset.fov);syP();}});
    if(vistas&&vistas.grupos){const vd=document.createElement('div');vd.innerHTML='<div class="cpg">Vistas</div><div class="cpvl"></div>';body.appendChild(vd);
      const box=vd.querySelector('.cpvl');const abiertos=LS.get('carhue-cp-vgr',{'Vistas fijas':true});
      const pintar=()=>{vistas.renderGrupos(box,()=>setTimeout(pintar,400),abiertos,()=>LS.set('carhue-cp-vgr',abiertos));};pintar();visor.__pintarVistas=pintar;
      new MutationObserver(()=>{if(!vp.hidden)pintar();}).observe(document.getElementById('vistasSel'),{childList:true,subtree:true});}
    if(visor.tours){const tw=document.createElement('div');tw.innerHTML='<div class="cpg">Tours</div><div class="cpvl cptours"></div>';body.appendChild(tw);try{visor.tours.appendInto(tw.querySelector('.cptours'),()=>{});}catch(e){}}
    vp.addEventListener('click',e=>{if(e.target.closest('[data-vp="x"]')){vp.hidden=true;sync();}});
    document.addEventListener('pointerdown',e=>{if(vp.hidden)return;const t=e.target;if(vp.contains(t)||(t.closest&&t.closest('#toolbar3d .tb[data-k="vistas"]')))return;vp.hidden=true;sync();},true);}
  const posVp=()=>{const b=document.querySelector('#toolbar3d .tb[data-k="vistas"]'),tb=$('toolbar3d');if(!b||!tb)return;const s=stage.getBoundingClientRect(),r=b.getBoundingClientRect(),t=tb.getBoundingClientRect();
    vp.style.left=(t.right-s.left+8)+'px';vp.style.right='auto';vp.style.position='absolute';vp.style.zIndex=6;const h=vp.offsetHeight||300;vp.style.top=Math.max(8,Math.min(s.height-h-8,r.top-s.top-6))+'px';};
  /* ---------- clics en la barra ---------- */
  let hold=null;
  bar.addEventListener('pointerdown',e=>{const b=e.target.closest('.tbfly');if(!b)return;hold=setTimeout(()=>{hold='open';subMenu(b,group(b.dataset.k));},350);});
  bar.addEventListener('pointerup',()=>{if(hold&&hold!=='open')clearTimeout(hold);});
  bar.addEventListener('contextmenu',e=>{const b=e.target.closest('.tbfly');if(!b)return;e.preventDefault();subMenu(b,group(b.dataset.k));});
  bar.addEventListener('click',e=>{const b=e.target.closest('.tb');if(!b)return;const k=b.dataset.k;
    if(hold==='open'){hold=null;return;}hold=null;if(k!=='caminar')CAM.set(false);
    if(b.classList.contains('tbfly')){const r=b.getBoundingClientRect();if(e.clientX>r.right-11&&e.clientY>r.bottom-11){subMenu(b,group(k));return;}}
    if(PANELS[k]){if(flyFor===b){closeFly();return;}
      if(k==='vistas'){closeFly();if(!cp.hidden){cp.hidden=true;LS.set('carhue-capas-on',false);}vp.hidden=!vp.hidden;if(!vp.hidden){visor.__pintarVistas&&visor.__pintarVistas();posVp();}}
      else if(k==='corte'){closeFly();if(window.__side)window.__side.toggle('corte');else openFly(b,el=>{el.className='fypanelw';el.appendChild(corteBox);});}
      else if(k==='variantes')zonasMenu(b);
      else if(k==='equip'){closeFly();visor.equip&&visor.equip.toggle('mue');sync();}
      else if(k==='luces'){closeFly();if(visor.equip){const o=visor.equip.toggle('luz');if(o&&visor.noche&&visor.noche.sol.alt>-4){visor.noche.irA((visor.noche.horas.ss??1200)+60);}}sync();}
      else if(k==='termica'){closeFly();visor.termica&&visor.termica.toggle();sync();}
      else if(k==='estructura'){closeFly();visor.estructura&&visor.estructura.toggle();sync();}
      else if(k==='personas'){closeFly();if(window.__side)window.__side.toggle('personas');}
      else if(k==='filtros')filtrosMenu(b);
      else if(k==='proy'){closeFly();visor.setParalela&&visor.setParalela(!visor.esParalela());sync();}
      else if(k==='capas'){closeFly();vp.hidden=true;cp.hidden=!cp.hidden;LS.set('carhue-capas-on',!cp.hidden);if(!cp.hidden)posCp();}
      sync();return;}
    closeFly();T[k].run();sync();});

  /* ---------- barra de estado ---------- */
  const bb=document.querySelector('#modo-3d .bottombar');
  const st=document.createElement('span');st.id='stTool';bb.prepend(st);
  {const f=$('fps');if(f)bb.appendChild(f);const q=$('quick');if(q)q.style.display='none';}
  const HINT={nav:'Arrastrá para orbitar, botón derecho para desplazar, rueda para acercarte al cursor. W A S D Q E para moverte; W tocada: caminar hasta donde hagas clic.',caminar:T.caminar.d,
    sel:'Tocá una pieza para ver su ficha.',mover:T.mover.d,ab:T.ab.d,estirar:T.estirar.d,medir:T.medir.d,senalar:T.senalar.d,marcar:T.marcar.d};
  function active(){const on=id=>isOpen(id);if(CAM.on&&ALL.some(isOpen))CAM.set(false);if(CAM.on)return 'caminar';if(on('medirTg'))return 'medir';if(on('senalarTg'))return 'senalar';if(on('marcarTg'))return 'marcar';
    if(on('editarTg')){const p=document.querySelector('#edPanel [data-tool][aria-pressed=true]');const t=p?p.dataset.tool:'';return ({'':'sel',mover:'mover',estirar:'estirar',ab:'ab'})[t]||'sel';}return 'nav';}
  function sync(){const a=active();
    const g=group(a);if(g&&g.length>1&&cur[g[0]]!==a)setSub(g,a);
    bar.querySelectorAll('.tb').forEach(b=>{const k=b.dataset.k;b.setAttribute('aria-pressed',PANELS[k]?(k==='capas'?!cp.hidden:k==='vistas'?!vp.hidden:k==='corte'?!!corteActivo():k==='variantes'?!card.hidden:k==='equip'?!!(visor.equip&&visor.equip.open&&visor.equip.capa==='mue'):k==='luces'?!!(visor.equip&&visor.equip.open&&visor.equip.capa==='luz'):k==='termica'?!!(visor.termica&&visor.termica.abierta):k==='estructura'?!!(visor.estructura&&visor.estructura.abierta):k==='personas'?!!(window.__side&&window.__side.isOn('personas')):k==='proy'?!!(visor.esParalela&&visor.esParalela()):k==='filtros'?filtroActual()!=='obj':'false'):String(k===a));});
    st.innerHTML=`<b>${T[a].n}</b> ${HINT[a]||''}`;stage.classList.toggle('conpanel',a!=='nav'&&a!=='caminar');}
  setInterval(sync,400);sync();

  /* ---------- Planta / 3D arriba a la izquierda; panel derecho ---------- */
  const ms=document.createElement('div');ms.id='modeSw';ms.setAttribute('role','tablist');
  ms.innerHTML='<button data-m="planta" data-tip="Planta|El plano de la casa, con medidas">Planta</button><button data-m="3d" aria-pressed="true">3D</button>';stage.appendChild(ms);
  ms.addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(b&&b.dataset.m==='planta'&&window.__setModo)window.__setModo('planta');});
  const tabs=document.querySelector('#modo-3d aside .tabs');
  if(tabs){const fb=document.createElement('button');fb.className='tabfold';fb.dataset.tip='Plegar o desplegar las pestañas';fb.innerHTML=icon('chev',14);tabs.appendChild(fb);
    const aside=tabs.closest('aside');const setF=v=>{aside.classList.toggle('tabsfold',v);LS.set('carhue-tabs-fold',v);};setF(LS.get('carhue-tabs-fold',false));
    fb.addEventListener('click',()=>setF(!aside.classList.contains('tabsfold')));
    tabs.addEventListener('click',e=>{if(e.target.closest('.tab')&&aside.classList.contains('tabsfold'))setF(false);});}
  const at=$('asideTg');if(at){at.innerHTML=icon('panel',15);at.dataset.tip='Panel de la derecha|Mostrar u ocultar la ficha, las piezas y las pestañas';at.removeAttribute('title');}
}
