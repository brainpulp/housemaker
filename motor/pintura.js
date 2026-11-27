/* Pintura (Maxi 27/11: «poder cambiar el color de lo que selecciono… con doble clic lo desagrupo y elijo una superficie…
   y una paleta de materiales con vetas, con todos los que usaste»).
   El inspector muestra, debajo de los datos de la pieza, la paleta de materiales (las mismas texturas del modo realista)
   y un selector de color. Sin doble clic se pinta la pieza entera; con doble clic sobre la pieza ya elegida se pinta
   sólo la parte tocada (un cabio, una tabla, un vidrio…); otro clic en la misma pieza elige otra parte.
   Lo pintado se guarda en la base del artifact (estado/pintura, por casa) y en el navegador, y se vuelve a aplicar
   cada vez que el visor rearma. Claves: «ID» = pieza entera, «ID#k» = parte k. Valor: {m: textura | null (liso), c: '#color'}.
   El color multiplica la textura (blanco = la textura tal cual). */
export function initPintura(visor,{T,boxUV,tin,stone}){
  const {THREE}=visor;
  const NOM={madera:'Madera',maderaPared:'Madera de paredes',pino:'Pino (machimbre)',roble:'Roble',eucalipto:'Eucalipto',deck:'Deck',
    revoque:'Revoque',tabique:'Tabique',blanco:'Blanco',ladrillo:'Ladrillo',cemento:'Cemento',piedra:'Piedra',chapa:'Chapa',zincalum:'Zincalum',chapaNegra:'Chapa negra',acero:'Acero'};
  const SZ={madera:120,maderaPared:120,pino:120,roble:80,eucalipto:72,deck:160,revoque:200,tabique:200,blanco:200,ladrillo:100,cemento:300,piedra:330,chapa:76,zincalum:76,chapaNegra:60,acero:100};
  const RM={chapa:[.55,.35],chapaNegra:[.55,.35],zincalum:[.55,0],acero:[.5,0]};
  const TX={...T};if(stone)TX.piedra=stone;
  const lista=()=>Object.keys(NOM).filter(k=>TX[k]&&(k!=='piedra'||(stone&&stone.image)));
  /* ---- guardado ---- */
  const LK='hm-pintura:'+(window.__casa||location.pathname);let O={};try{O=JSON.parse(localStorage.getItem(LK)||'{}')||{};}catch(e){}
  let db=null;
  const guardar=()=>{try{localStorage.setItem(LK,JSON.stringify(O));}catch(e){}if(db)db.collection('estado').doc('pintura').set({o:O,ts:new Date().toISOString()}).catch(()=>{});};
  import('./nombres.js').then(N=>N.getDb()).then(d=>{db=d;if(!d)return;d.collection('estado').doc('pintura').onSnapshot(x=>{if(!x.exists)return;const o=(x.data()||{}).o;if(!o||typeof o!=='object')return;
    if(JSON.stringify(o)===JSON.stringify(O))return;O=o;try{localStorage.setItem(LK,JSON.stringify(O));}catch(e){}aplicar();refrescar();},()=>{});}).catch(()=>{});
  /* ---- texturas a la escala de la pieza ---- */
  const CACHE={};
  function tex(m,s0){const t=TX[m];if(!t)return null;const r=(s0||SZ[m])/SZ[m];if(Math.abs(r-1)<.01&&m!=='piedra')return t;const key=m+'|'+r.toFixed(3);
    if(!CACHE[key]){const c=t.clone();c.wrapS=c.wrapT=THREE.RepeatWrapping;if(m==='piedra')c.repeat.set(r*200/330,r);else c.repeat.set(r,r);c.needsUpdate=true;CACHE[key]=c;}return CACHE[key];}
  const mallas=p=>{const ms=[];if(p&&p.grp)p.grp.traverse(o=>{if(o.isMesh&&o.userData.id===p.id)ms.push(o);});return ms;};
  function conUV(ms,m){for(const o of ms)if(!o.userData.uv){o.geometry=boxUV(o.geometry,SZ[m],m==='chapa'||m==='zincalum',m==='deck'||m==='eucalipto');o.userData.uv=true;o.userData.uvS=SZ[m];}}
  function pintaMat(mat,o,ms){
    if(!mat.userData.pint0)mat.userData.pint0={map:mat.map,color:'#'+mat.color.getHexString(),r:mat.roughness,mt:mat.metalness,vc:mat.vertexColors};
    const b=mat.userData.pint0;
    if('m' in o){if(o.m&&TX[o.m]){conUV(ms,o.m);const s0=(ms[0]&&ms[0].userData.uvS)||SZ[o.m];mat.map=tex(o.m,s0);const rm=RM[o.m]||[.9,0];mat.roughness=rm[0];mat.metalness=rm[1];}
      else{mat.map=null;mat.roughness=.85;mat.metalness=0;}mat.vertexColors=false;}
    mat.color.set(o.c||('m' in o?(o.m?tin()[o.m]||'#ffffff':b.color):b.color));
    mat.userData.pint=true;mat.needsUpdate=true;}
  function restaura(mat){const b=mat&&mat.userData.pint0;if(!b)return;mat.map=b.map;mat.color.set(b.color);mat.roughness=b.r;mat.metalness=b.mt;mat.vertexColors=b.vc;delete mat.userData.pint0;delete mat.userData.pint;mat.needsUpdate=true;}
  /* ---- partes ---- */
  let SUBS=[];/* materiales de partes: siguen a los de la pieza (transparencia, resaltado, corte) */
  function nPartes(p){const ms=mallas(p);if(!ms.length)return 0;if(ms.length===1){const rg=ms[0].userData.ranges;return rg?rg.length:1;}return ms.length;}
  const separable=p=>{const ms=mallas(p);return nPartes(p)>1&&!ms.some(o=>Array.isArray(o.material)&&!o.geometry.userData.pintG);};
  function matParte(p,o,ms){const m=p.mat.clone();if(p.mat.userData.pint0){/* la base de la parte es la pieza sin pintar */const b=p.mat.userData.pint0;m.map=b.map;m.color.set(b.color);m.roughness=b.r;m.metalness=b.mt;m.vertexColors=b.vc;}
    m.userData={};pintaMat(m,o,ms);m.userData.pint=true;SUBS.push({m,p});return m;}
  function aplicar(){
    const parts=visor.parts||[];for(const {m} of SUBS)m.dispose();SUBS=[];
    for(const p of parts){if(!p.mat)continue;restaura(p.mat);for(const o of mallas(p)){if(o.geometry.userData.pintG){o.geometry.clearGroups();o.geometry.userData.pintG=false;o.material=p.mat;}if(o.userData.pintSub){o.material=p.mat;o.userData.pintSub=false;}}}
    const porPieza={};for(const k of Object.keys(O)){const i=k.indexOf('#');const pid=i<0?k:k.slice(0,i);(porPieza[pid]=porPieza[pid]||[]).push(k);}
    for(const p of parts){const ks=porPieza[p.id];if(!ks||!p.mat)continue;const ms=mallas(p);
      if(O[p.id])pintaMat(p.mat,O[p.id],ms);
      const subs=ks.filter(k=>k!==p.id);if(!subs.length||!separable(p))continue;
      if(ms.length===1&&ms[0].userData.ranges){const o=ms[0],g=o.geometry,rg=o.userData.ranges,mats=[p.mat];g.clearGroups();
        rg.forEach(([a,n],i)=>{const v=O[p.id+'#'+i];let mi=0;if(v){mats.push(matParte(p,v,[o]));mi=mats.length-1;}g.addGroup(a,n,mi);});
        if(mats.length>1){g.userData.pintG=true;o.material=mats;}else g.clearGroups();}
      else ms.forEach((o,i)=>{const v=O[p.id+'#'+i];if(v){o.material=matParte(p,v,[o]);o.userData.pintSub=true;}});}
    marca();window.__despertar&&window.__despertar();}
  /* las partes pintadas copian de la pieza la transparencia, el resaltado de selección y el corte por nivel */
  (function sync(){let ch=false;for(const {m,p} of SUBS){const a=p.mat;if(m.opacity!==a.opacity){m.opacity=a.opacity;ch=true;}if(m.transparent!==a.transparent||m.depthWrite!==a.depthWrite||m.clippingPlanes!==a.clippingPlanes){m.transparent=a.transparent;m.depthWrite=a.depthWrite;m.clippingPlanes=a.clippingPlanes;m.needsUpdate=true;ch=true;}
      if(!m.emissive.equals(a.emissive)||m.emissiveIntensity!==a.emissiveIntensity){m.emissive.copy(a.emissive);m.emissiveIntensity=a.emissiveIntensity;ch=true;}}
    if(ch&&window.__despertar)window.__despertar();requestAnimationFrame(sync);})();
  /* ---- parte elegida con doble clic ---- */
  let sub=null,ov=null;
  function parteDe(h){const pid=h.object.userData.id;const p=(visor.parts||[]).find(q=>q.id===pid);if(!p)return null;const ms=mallas(p);let k=ms.indexOf(h.object);if(k<0)return null;const rg=h.object.userData.ranges;let nG=ms.length;
    if(rg&&ms.length===1){nG=rg.length;const vi=h.faceIndex*3;k=rg.findIndex(([a,n])=>vi>=a&&vi<a+n);if(k<0)return null;}return {pid,k,nG};}
  function marca(){if(ov){ov.parent&&ov.parent.remove(ov);ov.geometry.dispose();ov=null;}if(!sub)return;const p=(visor.parts||[]).find(q=>q.id===sub.pid);if(!p){sub=null;return;}const ms=mallas(p);
    let o=ms[0],a=0,n=null;if(ms.length===1&&o.userData.ranges){[a,n]=o.userData.ranges[sub.k]||[0,0];}else o=ms[sub.k];if(!o)return;
    const g=o.geometry,g2=new THREE.BufferGeometry();g2.setAttribute('position',g.attributes.position);if(g.index)g2.setIndex(g.index);if(n!=null)g2.setDrawRange(a,n);
    ov=new THREE.Mesh(g2,new THREE.MeshBasicMaterial({color:0xff7a00,transparent:true,opacity:.45,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));ov.renderOrder=5;ov.raycast=()=>{};o.add(ov);
    window.__despertar&&window.__despertar();}
  const el=visor.renderer.domElement;
  el.addEventListener('dblclick',()=>{const t=visor.__toque;if(!t||!t.h||t.pid!==visor.selected)return;const p=(visor.parts||[]).find(q=>q.id===t.pid);if(!p||!separable(p))return;const r=parteDe(t.h);if(!r||r.nG<2)return;sub=r;marca();refrescar();});
  let pd=null;el.addEventListener('pointerdown',e=>{pd=[e.clientX,e.clientY];});
  el.addEventListener('click',e=>{if(pd&&Math.hypot(e.clientX-pd[0],e.clientY-pd[1])>4)return;setTimeout(()=>{const t=visor.__toque;if(!sub)return;if(!t||!t.h||t.pid!==sub.pid||visor.selected!==sub.pid){sub=null;marca();refrescar();return;}const r=parteDe(t.h);if(r&&r.k!==sub.k){sub=r;marca();refrescar();}},0);});
  /* ---- panel en el inspector ---- */
  let mini={};
  function muestra(m){if(mini[m])return mini[m];const im=TX[m]&&TX[m].image;if(!im||!(im.width||im.naturalWidth))return '';try{const c=document.createElement('canvas');c.width=c.height=40;const x=c.getContext('2d');x.drawImage(im,0,0,Math.min(im.width,im.height)/2,Math.min(im.width,im.height)/2,0,0,40,40);
      if(tin()[m]&&tin()[m]!=='#ffffff'){x.globalCompositeOperation='multiply';x.fillStyle=tin()[m];x.fillRect(0,0,40,40);}return mini[m]=c.toDataURL();}catch(e){return '';}}
  if(!document.getElementById('pintCss')){const s=document.createElement('style');s.id='pintCss';s.textContent=`.pint{margin:6px 0;padding:6px 0;border-top:1px solid var(--rule)}.pint .pint-h{display:flex;align-items:center;gap:6px;margin-bottom:5px;font-size:11px}.pint .pint-h b{flex:1}
.pint .pint-sw{display:flex;flex-wrap:wrap;gap:4px;width:100%}.pint .pint-sw button{display:inline-block;flex:0 0 26px;width:26px;height:26px;min-width:0;margin:0;border:1px solid var(--rule);border-radius:3px;background-size:cover;cursor:pointer;padding:0}.pint .pint-sw button.on{outline:2px solid var(--accent);outline-offset:1px}
.pint .pint-sw .liso{background:repeating-linear-gradient(45deg,#fff 0 4px,#ddd 4px 8px)}.pint .pint-cl{display:flex;align-items:center;gap:6px;margin-top:5px;font-size:11px}.pint .pint-cl input{width:40px;height:22px;padding:0;border:0}.pint .pint-hint{font-size:10.5px;opacity:.7;margin-top:4px}`;document.head.appendChild(s);}
  const clave=id=>sub&&sub.pid===id?id+'#'+sub.k:id;
  function actual(id){const p=(visor.parts||[]).find(q=>q.id===id);if(!p)return {};const k=clave(id),v=O[k];
    const mat=p.mat;
    const tk=v&&'m' in v?v.m:(mat.map?(Object.keys(TX).find(t=>TX[t]===mat.map||(mat.map.source&&TX[t].source===mat.map.source))||null):null);
    return {v,tk,c:(v&&v.c)||'#'+mat.color.getHexString()};}
  function html(id){const p=(visor.parts||[]).find(q=>q.id===id);if(!p||!p.mat||p.cat==='glass')return '';const n=nPartes(p),sep=separable(p),es=sub&&sub.pid===id;const a=actual(id);
    return `<div class="pint" id="pintBox"><div class="pint-h"><b>Color y material · ${es?`parte ${sub.k+1} de ${sub.nG}`:'pieza entera'}</b>${es?'<button class="ib" data-pint="todo" title="Volver a pintar la pieza entera">pieza entera</button>':''}${a.v?'<button class="ib" data-pint="x" title="Vuelve al color original">quitar</button>':''}</div>
      <div class="pint-sw">${lista().map(m=>`<button data-pint="m" data-m="${m}" title="${NOM[m]}" class="${a.tk===m?'on':''}" style="background-image:url(${muestra(m)})"></button>`).join('')}<button data-pint="m" data-m="" title="Liso (sin textura)" class="liso${a.v&&'m' in a.v&&!a.v.m?' on':''}"></button></div>
      <label class="pint-cl">Color <input type="color" data-pint="c" value="${a.c}"><code>${a.c}</code><span style="flex:1"></span></label>
      ${!es&&n>1&&sep?`<div class="pint-hint">Doble clic en la pieza para pintar sólo la parte que tocás.</div>`:''}${es?`<div class="pint-hint">Clic en otra parte de la pieza para cambiar de parte.</div>`:''}</div>`;}
  function refrescar(){const b=document.getElementById('pintBox');if(!b)return;const id=visor.selected;const h=id?html(id):'';if(!h){b.remove();return;}const t=document.createElement('div');t.innerHTML=h;b.replaceWith(t.firstElementChild);}
  document.addEventListener('click',e=>{const b=e.target.closest('[data-pint]');if(!b||!b.closest('#pintBox'))return;const id=visor.selected;if(!id)return;const k=clave(id),a=b.dataset.pint;
    if(a==='todo'){sub=null;marca();refrescar();return;}
    if(a==='x'){delete O[k];guardar();aplicar();refrescar();return;}
    if(a==='m'){const m=b.dataset.m||null;O[k]={m,c:m?(tin()[m]||'#ffffff'):actual(id).c};guardar();aplicar();refrescar();}});
  document.addEventListener('input',e=>{const t=e.target;if(t.dataset.pint!=='c'||!t.closest('#pintBox'))return;const id=visor.selected;if(!id)return;const k=clave(id);O[k]={...(O[k]||{}),c:t.value};const cd=t.parentNode.querySelector('code');if(cd)cd.textContent=t.value;aplicar();});
  document.addEventListener('change',e=>{const t=e.target;if(t.dataset.pint!=='c'||!t.closest('#pintBox'))return;guardar();refrescar();});
  let last=null;(function loop(){if(visor.parts!==last){last=visor.parts;if(sub&&!(visor.parts||[]).some(q=>q.id===sub.pid))sub=null;}requestAnimationFrame(loop);})();
  const api={html,aplicar,get datos(){return O;}};window.__pintura=api;return api;
}
