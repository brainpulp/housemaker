/* Marcas: Maxi dibuja puntos y líneas sobre el 3D para pasarme ideas.
   Cada marca tiene código K-xx, puntos en cm (X, altura, Y de planta), una nota y la pieza que tocó.
   Se guardan en la base del artifact (colección «marcas»): las ve cualquiera que abra la página y yo las leo. */
import * as N from './nombres.js';
export function initMarcas(visor,stage){
  const {THREE}=visor;const G=new THREE.Group();G.name='marcas';visor.scene.add(G);{let v=true;try{v=localStorage.getItem('carhue-marcas-ver')!=='0';}catch(e){}G.visible=v;}visor.marcasGrp=G;
  let M=[],db=null,on=false,modo='linea',cur=null,snap=5,sel=null;
  const col=['#e2462b','#1f6fd1','#1c9a5a','#c98a00','#8a3fd1'];
  const fmt=v=>(v/100).toFixed(2).replace('.',',');
  const nextId=()=>{let n=Math.max(0,+(localStorage.getItem('carhue-marcas-max')||0),...M.map(m=>+(m.id.match(/\d+/)||[0])[0]))+1;try{localStorage.setItem('carhue-marcas-max',n);}catch(e){}return 'K-'+String(n).padStart(2,'0');};
  /* panel */
  const btn=document.createElement('button');btn.className='btn';btn.id='marcarTg';btn.textContent='✎ Marcar';btn.title='Dibujar puntos y líneas sobre el modelo';
  document.getElementById('topright').prepend(btn);
  const P=document.createElement('div');P.id='marcasPanel';P.hidden=true;stage.appendChild(P);
  P.innerHTML=`<div class="mh"><b>Marcas</b><span class="mx" id="mkClose" title="Cerrar">×</span></div>
   <div class="mrow"><label><input type="radio" name="mkModo" value="linea" checked> Línea</label><label><input type="radio" name="mkModo" value="punto"> Punto</label>
   <label title="Redondea las coordenadas">ajuste <select id="mkSnap"><option value="1">1 cm</option><option value="5" selected>5 cm</option><option value="10">10 cm</option><option value="25">25 cm</option></select></label></div>
   <div class="mhint" id="mkHint">Tocá el modelo para poner puntos. En línea, cada toque agrega un vértice; Enter o «Terminar» la cierra. Mover la cámara no agrega puntos.</div>
   <div class="mrow"><input type="text" id="mkNota" placeholder="nota para esta marca (opcional)" maxlength="300"></div>
   <div class="mrow"><button class="btn" id="mkFin">Terminar</button><button class="btn" id="mkUndo">Deshacer punto</button><button class="btn" id="mkCancel">Descartar</button></div>
   <div class="mlist" id="mkList"></div><div class="mmsg" id="mkMsg"></div>`;
  const $=id=>P.querySelector('#'+id);
  /* marcar con la capa apagada confunde (Maxi 15/10): al activar Marcar se prende la capa, y si se apaga la capa, Marcar se cierra */
  const capaOn=()=>{G.visible=true;try{localStorage.setItem('carhue-marcas-ver','1');}catch(e){}const c=document.getElementById('cpMarcas');if(c)c.checked=true;};
  setInterval(()=>{if(on&&!G.visible)setOn(false);},300);
  const setOn=v=>{if(v&&!G.visible)capaOn();on=v;P.hidden=!v;btn.setAttribute('aria-pressed',v);stage.classList.toggle('marcando',v);if(!v)finish(false);};
  btn.addEventListener('click',()=>setOn(!on));$('mkClose').addEventListener('click',()=>setOn(false));
  P.querySelectorAll('input[name=mkModo]').forEach(r=>r.addEventListener('change',()=>{finish(true);modo=r.value;}));
  $('mkSnap').addEventListener('change',e=>snap=+e.target.value);
  $('mkFin').addEventListener('click',()=>finish(true));$('mkCancel').addEventListener('click',()=>finish(false));
  $('mkUndo').addEventListener('click',()=>{if(cur&&cur.pts.length){cur.pts.pop();cur.piezas.pop();draw();}});
  document.addEventListener('keydown',e=>{if(!on||e.target.tagName==='INPUT')return;if(e.key==='Enter')finish(true);if(e.key==='Escape')finish(false);if((e.key==='z'||e.key==='Z')&&(e.metaKey||e.ctrlKey)){e.preventDefault();$('mkUndo').click();}});
  /* pick */
  const ground=new THREE.Plane(new THREE.Vector3(0,1,0),0),_g=new THREE.Vector3();
  visor.pick=(hit,ray)=>{if(!on)return false;let p=hit?hit.point.clone():(ray.ray.intersectPlane(ground,_g)?_g.clone():null);if(!p)return true;
    const r=v=>Math.round(v/snap)*snap;const q=[r(p.x),r(p.y),r(p.z)];const pz=hit?hit.object.userData.id:'suelo';
    if(!cur)cur={id:nextId(),tipo:modo,pts:[],piezas:[],color:col[M.length%col.length]};
    cur.pts.push(q);cur.piezas.push(pz);if(modo==='punto')finish(true);else draw();return true;};
  async function finish(save){if(!cur){return;}const c=cur;cur=null;
    if(save&&c.pts.length&&(c.tipo==='punto'||c.pts.length>=2)){c.nota=($('mkNota').value||'').trim();c.ts=new Date().toISOString();c.piezas=[...new Set(c.piezas)];c.vista=visor.getView();
      M.push(c);$('mkNota').value='';await store(c);}else if(save&&c.pts.length===1&&c.tipo==='linea'){c.tipo='punto';c.nota=($('mkNota').value||'').trim();c.ts=new Date().toISOString();c.piezas=[...new Set(c.piezas)];c.vista=visor.getView();M.push(c);$('mkNota').value='';await store(c);}
    draw();}
  async function store(c){const {id,...body}=c;body.pts=c.pts.map(p=>({x:p[0],h:p[1],y:p[2]}));let msg='Guardada en este navegador.';
    c._local=true;if(db){try{await db.doc('marcas/'+id).set(body);delete c._local;msg=`${id} guardada: la puedo leer.`;}catch(e){msg='Guardada solo en este navegador ('+(e&&e.code||'sin permiso')+').';}}
    local();$('mkMsg').textContent=msg;}
  async function borrar(id){M=M.filter(m=>m.id!==id);local();draw();if(db)try{await db.doc('marcas/'+id).delete();$('mkMsg').textContent=id+' borrada.';}catch(e){$('mkMsg').textContent='No pude borrar '+id+' de la base ('+(e&&e.code||'error')+').';}}
  const local=()=>{try{localStorage.setItem('carhue-marcas',JSON.stringify(M));}catch(e){}};
  try{M=JSON.parse(localStorage.getItem('carhue-marcas')||'[]');}catch(e){M=[];}
  /* dibujo */
  const label=(txt,color)=>{const c=document.createElement('canvas');c.width=128;c.height=48;const x=c.getContext('2d');x.fillStyle=color;x.beginPath();if(x.roundRect)x.roundRect(2,6,124,36,8);else x.rect(2,6,124,36);x.fill();x.fillStyle='#fff';x.font='bold 26px system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,64,25);
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true}));sp.scale.set(64,24,1);sp.renderOrder=1001;return sp;};
  function drawMark(m,live){const g=new THREE.Group();const color=new THREE.Color(m.color);const V=m.pts.map(p=>new THREE.Vector3(...p));
    const mat=new THREE.MeshBasicMaterial({color,depthTest:false,transparent:true,opacity:.95});
    for(const v of V){const s=new THREE.Mesh(new THREE.SphereGeometry(live?5:4,12,8),mat);s.position.copy(v);s.renderOrder=1000;g.add(s);}
    if(V.length>1){const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(V),new THREE.LineBasicMaterial({color,depthTest:false,transparent:true,linewidth:2}));l.renderOrder=999;g.add(l);
      for(let i=0;i<V.length-1;i++){const d=V[i].distanceTo(V[i+1]);if(d<20)continue;const t=label(fmt(d),'rgba(20,20,20,.75)');t.scale.set(48,18,1);t.position.copy(V[i]).lerp(V[i+1],.5);g.add(t);}}
    if(V.length){const t=label(live?'…':m.id,m.color);t.position.copy(V[V.length-1]).add(new THREE.Vector3(0,22,0));g.add(t);}
    if(sel===m.id)g.traverse(o=>{if(o.isMesh)o.scale.setScalar(1.6);});G.add(g);}
  function draw(){while(G.children.length){const c=G.children.pop();c.traverse(o=>{o.geometry&&o.geometry.dispose();o.material&&(o.material.map&&o.material.map.dispose(),o.material.dispose());});}
    for(const m of M)drawMark(m,false);if(cur&&cur.pts.length)drawMark(cur,true);
    $('mkHint').textContent=cur&&cur.pts.length?`${cur.id}: ${cur.pts.length} punto(s). Último ${cur.pts.at(-1).map(fmt).join(' · ')} m (X · altura · Y), sobre ${cur.piezas.at(-1)}.`:'Tocá el modelo para poner puntos. En línea, cada toque agrega un vértice; Enter o «Terminar» la cierra. Mover la cámara no agrega puntos.';
    $('mkList').innerHTML=M.length?M.map(m=>`<div class="mitem" data-mk="${m.id}"><span class="sw" style="background:${m.color}"></span><b>${m.id}</b> <span class="s">${m.tipo} · ${m.pts.length} pto${m.nota?' · '+m.nota.replace(/</g,'&lt;'):''}</span><button class="btn mini" data-mkver="${m.id}" title="Ir a la vista">ver</button><button class="btn mini" data-mkdel="${m.id}" title="Borrar">×</button></div>`).join(''):'<p class="s">Sin marcas todavía.</p>';
    $('mkList').querySelectorAll('[data-mkdel]').forEach(b=>b.addEventListener('click',()=>borrar(b.dataset.mkdel)));
    $('mkList').querySelectorAll('[data-mkver]').forEach(b=>b.addEventListener('click',()=>{const m=M.find(x=>x.id===b.dataset.mkver);sel=m.id;if(m.vista)visor.fly(m.vista.p,m.vista.t);draw();}));}
  draw();
  N.getDb().then(d=>{db=d;if(!d)return;d.collection('marcas').onSnapshot(snap=>{const R=[];snap.docs.forEach(x=>{if(!x.exists)return;const b=x.data();R.push({id:x.id,...b,pts:(b.pts||[]).map(p=>Array.isArray(p)?p:[p.x,p.h,p.y])});});
    const ids=new Set(R.map(r=>r.id));M=[...R,...M.filter(m=>m._local&&!ids.has(m.id))].sort((a,b)=>a.id.localeCompare(b.id));local();draw();},()=>{});});
}
