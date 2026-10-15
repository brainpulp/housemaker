/* Editar en el 3D, estilo SketchUp: seleccionar, mover (arrastrar), estirar caras de muros (empujar/tirar) y borrar.
   Todo se guarda como «ediciones» (ver ediciones.js), así que también se ve en la planta y yo lo leo. */
import * as M from './modelo.js';
import * as ED from './ediciones.js';

export function initEditor(visor,stage,WALL_TOP,H_EP){
  const {THREE}=visor;const view=stage.querySelector('#view');
  const base=id=>id?id.replace(/[a-z]$/,''):id;
  let tool=null,drag=null,snap=5,lastPrev=0;
  const fmt=v=>(v/100).toFixed(2).replace('.',',');
  /* panel */
  const bt=document.createElement('button');bt.className='btn';bt.id='editarTg';bt.textContent='✥ Editar';bt.title='Mover, estirar y borrar piezas';
  document.getElementById('topright').prepend(bt);
  const P=document.createElement('div');P.id='edPanel';P.hidden=true;stage.appendChild(P);
  P.innerHTML=`<div class="mh"><b>Editar</b><span class="mx" id="edX">×</span></div>
   <div class="mrow seg"><button class="btn" data-tool="">Seleccionar</button><button class="btn" data-tool="mover">Mover</button><button class="btn" data-tool="estirar">Estirar caras</button><button class="btn" data-tool="ab">Punto a punto</button><button class="btn" data-tool="quitar">Borrar partes</button><button class="btn" id="edUndoAll" title="Deshacer (Ctrl/Cmd+Z)">↶ Deshacer</button></div>
   <div class="mrow" id="edAxes"><span class="s">mover solo en:</span><label><input type="checkbox" data-ax="x" checked> x</label><label><input type="checkbox" data-ax="y" checked> y</label><label><input type="checkbox" data-ax="z" checked> alto</label></div>
   <div class="mhint" id="edHint"></div>
   <div class="mrow"><label>ajuste <select id="edSnap"><option value="1">1 cm</option><option value="5" selected>5 cm</option><option value="10">10 cm</option><option value="25">25 cm</option></select></label></div>
   <div id="edForm"></div>
   <div class="mh2">Cambios hechos <span class="s" id="edN"></span></div><div class="mlist" id="edList"></div><div class="mmsg" id="edMsg"></div>`;
  const q=id=>P.querySelector('#'+id);
  const HINT={'':'Tocá una pieza para elegirla. Abajo podés cambiar sus medidas a mano, moverla o borrarla.',
    mover:'Arrastrá una flecha del gizmo para mover solo en ese eje (rojo x, verde alto, azul y), o arrastrá la pieza: se mueve sobre el piso; con Shift sube o baja. Soltá para guardar.',
    quitar:'Tocá cualquier parte suelta de una pieza (un cabio, un tirante, un vidrio, un tramo de muro) y se borra solo esa. ↶ Deshacer o Ctrl/Cmd+Z la vuelve a poner.',
    ab:'Tocá un punto de la pieza elegida (origen) y después el punto donde tiene que quedar (destino), en cualquier pieza: se mueve para que coincidan. Los puntos se pegan a los vértices cercanos. Con las casillas de abajo podés copiar solo algunos ejes.',
    estirar:'Arrastrá cualquier cara plana de la pieza elegida para empujarla o tirarla. En muros: la punta los alarga, el costado cambia el espesor, la cara de arriba la altura.'};
  const setTool=t=>{tool=t||null;P.querySelectorAll('[data-tool]').forEach(b=>b.setAttribute('aria-pressed',(b.dataset.tool||null)===tool));q('edHint').textContent=HINT[tool||''];stage.classList.toggle('editando',!!tool);};
  const setOn=v=>{P.hidden=!v;bt.setAttribute('aria-pressed',v);if(!v)setTool(null);else{setTool(tool);form();lista();}};
  bt.addEventListener('click',()=>setOn(P.hidden));q('edX').addEventListener('click',()=>setOn(false));
  P.querySelectorAll('[data-tool]').forEach(b=>b.addEventListener('click',()=>setTool(b.dataset.tool)));
  q('edSnap').addEventListener('change',e=>snap=+e.target.value);
  addEventListener('keydown',e=>{if(P.hidden||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;const k=e.key.toLowerCase();
    if(k==='m')setTool('mover');else if(k==='p')setTool('estirar');else if(k===' '&&tool){}else if((k==='delete'||k==='backspace')&&visor.selected){e.preventDefault();borrar(base(visor.selected));}});
  const sn=v=>Math.round(v/snap)*snap;

  /* formulario de la pieza elegida */
  function form(){const id=base(visor.selected);const el=q('edForm');if(!id){el.innerHTML='<p class="s">Ninguna pieza elegida.</p>';return;}
    const f=ED.find(id);const d=f&&f.d;let h=`<div class="edsel"><b>${id}</b> <span class="s">${d&&d.nombre?d.nombre:''}</span></div>`;const num=(k,l,v)=>`<label class="ednum">${l}<input type="number" step="1" data-k="${k}" value="${Math.round(v)}"></label>`;
    if(f&&f.k==='MUROS'){const L=Math.hypot(d.b[0]-d.a[0],d.b[1]-d.a[1]);h+=`<div class="mrow">${num('L','largo',L)}${num('e','espesor',d.e)}${num('top','alto',d.top??WALL_TOP[id]??(d.nivel==='EP'?420:H_EP))}</div>`;}
    else if(f&&f.k==='ABERTURAS')h+=`<div class="mrow">${num('d','posición',d.d)}${num('w','ancho',d.w)}${num('h','alto',d.h)}${num('s','antepecho',d.s||0)}</div>`;
    else if(f&&f.k==='ESTRUCTURA'&&d.tipo==='columna')h+=`<div class="mrow">${num('px','x',d.pos[0])}${num('py','y',d.pos[1])}</div>`;
    if(f&&(f.k==='MUROS'||f.k==='ABERTURAS'||(f.k==='ESTRUCTURA'&&d.tipo==='columna')))h+=`<div class="mrow"><button class="btn" id="edAplicar">Aplicar medidas</button><span class="s">cm</span></div>`;
    h+=`<div class="mrow"><label class="ednum">mover x<input type="number" id="edDx" value="0"></label><label class="ednum">y<input type="number" id="edDy" value="0"></label><label class="ednum">alto<input type="number" id="edDz" value="0"></label><button class="btn" id="edMov">Mover</button></div>
      <div class="mrow"><button class="btn" id="edDel">Borrar ${id}</button>${ED.E[id]?`<button class="btn" id="edUndo">Volver al original</button>`:''}</div>`;
    el.innerHTML=h;
    const ap=el.querySelector('#edAplicar');if(ap)ap.addEventListener('click',()=>{const v={};el.querySelectorAll('[data-k]').forEach(i=>v[i.dataset.k]=+i.value);const set={};
      if(f.k==='MUROS'){const L0=Math.hypot(d.b[0]-d.a[0],d.b[1]-d.a[1]);const ux=(d.b[0]-d.a[0])/L0,uy=(d.b[1]-d.a[1])/L0;set.b=[Math.round(d.a[0]+ux*v.L),Math.round(d.a[1]+uy*v.L)];set.e=v.e;set.top=v.top;}
      else if(f.k==='ABERTURAS'){set.d=v.d;set.w=v.w;set.h=v.h;set.s=v.s;}else set.pos=[v.px,v.py];
      guardar(id,{set});});
    el.querySelector('#edMov').addEventListener('click',()=>guardar(id,{mov:{x:+el.querySelector('#edDx').value,y:+el.querySelector('#edDy').value,z:+el.querySelector('#edDz').value}}));
    el.querySelector('#edDel').addEventListener('click',()=>borrar(id));
    const u=el.querySelector('#edUndo');if(u)u.addEventListener('click',async()=>{await ED.deshacer(id);msg(id+' vuelve a como estaba.');});}
  function lista(){const L=ED.lista();q('edN').textContent=L.length?`(${L.length})`:'';
    q('edList').innerHTML=L.length?L.map(e=>`<div class="mitem"><b>${e.id}</b> <span class="s">${e.borrado?'borrada':[e.mov?'movida':'',e.set?'medidas':'',e.caras?'caras':'',e.quitar?`${e.quitar.length} parte(s) borrada(s)`:''].filter(Boolean).join(' · ')}</span><button class="btn mini" data-edver="${e.id}" title="Elegir">ver</button><button class="btn mini" data-edundo="${e.id}" title="Volver al original">↺</button></div>`).join(''):'<p class="s">Ninguno todavía.</p>';
    q('edList').querySelectorAll('[data-edundo]').forEach(b=>b.addEventListener('click',()=>ED.deshacer(b.dataset.edundo)));
    q('edList').querySelectorAll('[data-edver]').forEach(b=>b.addEventListener('click',()=>{if(!ED.E[b.dataset.edver]?.borrado)visor.highlight(b.dataset.edver);}));}
  const msg=t=>{q('edMsg').textContent=t;};
  async function guardar(id,patch){const ok=await ED.editar(id,patch);msg(ok?`${id} guardado: lo veo yo también.`:`${id} cambiado en este navegador.`);}
  async function borrar(id){visor.resetSel();await guardar(id,{borrado:true});msg(`${id} borrada. ↺ en la lista la vuelve a poner.`);}
  ED.onChange(()=>{lista();});
  /* refrescar el formulario cuando cambia la selección */
  let lastSel=null;setInterval(()=>{if(P.hidden)return;if(visor.selected!==lastSel){lastSel=visor.selected;form();}},250);

  /* arrastre */
  const ray=new THREE.Raycaster(),mv=new THREE.Vector2();
  const setRay=e=>{const r=visor.renderer.domElement.getBoundingClientRect();mv.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mv,visor.camera);};
  const selParts=()=>{const b=base(visor.selected);return visor.parts.filter(p=>base(p.id)===b);};
  const hitSel=e=>{setRay(e);const ms=[];for(const p of selParts())p.grp.traverse(o=>{if(o.isMesh)ms.push(o);});const cps=visor.renderer.clippingPlanes;
    return ray.intersectObjects(ms,false).find(h=>!cps.length||cps.every(pl=>pl.distanceToPoint(h.point)>=0));};
  const closestT=(P0,n,R0,d)=>{const w0=P0.clone().sub(R0);const a=n.dot(n),b=n.dot(d),c=d.dot(d),dd=n.dot(w0),ee=d.dot(w0);const den=a*c-b*b;return Math.abs(den)<1e-9?0:(b*ee-c*dd)/den;};
  const tip=document.createElement('div');tip.className='edtip';tip.hidden=true;stage.appendChild(tip);
  const showTip=(e,t)=>{const r=stage.getBoundingClientRect();tip.hidden=false;tip.textContent=t;tip.style.left=(e.clientX-r.left+14)+'px';tip.style.top=(e.clientY-r.top+14)+'px';};
  /* puntos y aristas con código: al tocar la pieza elegida en «Seleccionar», muestra el punto o arista más cercano */
  const refBox=document.createElement('div');refBox.className='edref';P.insertBefore(refBox,q('edForm'));
  const mkRef=new THREE.Mesh(new THREE.SphereGeometry(4,12,8),new THREE.MeshBasicMaterial({color:0xff7a00,depthTest:false}));mkRef.renderOrder=2002;mkRef.visible=false;visor.scene.add(mkRef);
  const lnRef=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0xff7a00,depthTest:false}));lnRef.renderOrder=2002;lnRef.visible=false;visor.scene.add(lnRef);
  const R1=v=>Math.round(v*10)/10;
  function topo(id){const ps=visor.parts.filter(p=>base(p.id)===id);const V=new Map(),E=new Map();const key=v=>`${R1(v.x)},${R1(v.y)},${R1(v.z)}`;
    for(const p of ps)p.grp.traverse(o=>{if(!o.geometry)return;const A=o.geometry.attributes.position;if(!A)return;const w=new THREE.Vector3();
      if(o.isMesh)for(let i=0;i<A.count;i++){w.fromBufferAttribute(A,i).applyMatrix4(o.matrixWorld);V.set(key(w),w.clone());}
      if(o.isLineSegments)for(let i=0;i<A.count;i+=2){const a=new THREE.Vector3().fromBufferAttribute(A,i).applyMatrix4(o.matrixWorld),b=new THREE.Vector3().fromBufferAttribute(A,i+1).applyMatrix4(o.matrixWorld);const k=[key(a),key(b)].sort().join('|');E.set(k,[a,b]);}});
    const srt=(p,q)=>p.x-q.x||p.z-q.z||p.y-q.y;const pts=[...V.values()].sort(srt);const pidx=v=>pts.findIndex(q=>q.distanceTo(v)<.2)+1;
    const eds=[...E.values()].sort((m,n)=>srt(m[0].clone().add(m[1]),n[0].clone().add(n[1])));return {pts,eds,pidx};}
  const f2=v=>(v/100).toFixed(2).replace('.',',');const crd=v=>`x ${f2(v.x)} · y ${f2(v.z)} · alto ${f2(v.y)}`;
  view.addEventListener('pointerup',e=>{if(P.hidden||tool)return;setTimeout(()=>{const id=base(visor.selected);if(!id){refBox.innerHTML='';mkRef.visible=lnRef.visible=false;return;}
    const h=hitSel(e);if(!h)return;const T=topo(id);const r=visor.renderer.domElement.getBoundingClientRect();const sp=v=>{const q=v.clone().project(visor.camera);return [(q.x+1)/2*r.width+r.left,(1-q.y)/2*r.height+r.top];};
    let best=null,bd=14;T.pts.forEach((v,i)=>{const s=sp(v);const d=Math.hypot(s[0]-e.clientX,s[1]-e.clientY);if(d<bd){bd=d;best={k:'p',i,v};}});
    if(!best){let be=null,bde=10;T.eds.forEach((ed,i)=>{const a=sp(ed[0]),b=sp(ed[1]);const dx=b[0]-a[0],dy=b[1]-a[1],l2=dx*dx+dy*dy||1;let t=((e.clientX-a[0])*dx+(e.clientY-a[1])*dy)/l2;t=Math.max(0,Math.min(1,t));const d=Math.hypot(a[0]+t*dx-e.clientX,a[1]+t*dy-e.clientY);if(d<bde){bde=d;be={k:'a',i,ed};}});best=be;}
    mkRef.visible=lnRef.visible=false;if(!best){refBox.innerHTML=`<span class="s">Tocá cerca de un vértice o de una arista de ${id} para ver su código.</span>`;return;}
    if(best.k==='p'){mkRef.position.copy(best.v);mkRef.visible=true;refBox.innerHTML=`<b>${id}.p${best.i+1}</b> <span class="s">punto · ${crd(best.v)} m</span>`;}
    else{const [a,b]=best.ed;lnRef.geometry.setFromPoints([a,b]);lnRef.visible=true;refBox.innerHTML=`<b>${id}.a${best.i+1}</b> <span class="s">arista de ${id}.p${T.pidx(a)} a ${id}.p${T.pidx(b)} · largo ${f2(a.distanceTo(b))} m</span>`;}},30);});
  const doUndo=async()=>{const id=await ED.undo();msg(id?`Deshecho el último cambio en ${id}.`:'No hay nada para deshacer.');};
  q('edUndoAll').addEventListener('click',doUndo);
  addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&!e.shiftKey&&e.key.toLowerCase()==='z'&&!/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)&&!document.getElementById('modo-3d').hidden){if(document.getElementById('marcasPanel')&&!document.getElementById('marcasPanel').hidden)return;e.preventDefault();doUndo();}});
  /* borrar partes sueltas de una pieza */
  view.addEventListener('pointerdown',async e=>{if(P.hidden||tool!=='quitar'||e.button!==0)return;const h=hitAny(e);if(!h)return;e.stopImmediatePropagation();e.preventDefault();
    const pid=h.object.userData.id;const pp=visor.parts.find(p=>p.id===pid);if(!pp)return;const meshes=[];pp.grp.traverse(o=>{if(o.isMesh)meshes.push(o);});let k=meshes.indexOf(h.object);if(k<0)return;const rg=h.object.userData.ranges;let nG=meshes.length;
    if(rg){nG=rg.length;const vi=h.faceIndex*3;k=rg.findIndex(([a,n])=>vi>=a&&vi<a+n);if(k<0)return;}
    const prevQ=(ED.E[pid]&&ED.E[pid].quitar)||[];const orig=[...Array(nG+prevQ.length).keys()].filter(i=>!prevQ.includes(i));const idx=orig[k];
    await guardar(pid,{quitar:[idx]});msg(`Borrada una parte de ${pid}. ↶ para volverla.`);},true);
  const mask=()=>{const m={};P.querySelectorAll('[data-ax]').forEach(c=>m[c.dataset.ax]=c.checked);return m;};
  /* gizmo de ejes */
  const GZ=new THREE.Group();GZ.visible=false;visor.scene.add(GZ);const AX={x:[new THREE.Vector3(1,0,0),0xd23b2a],z:[new THREE.Vector3(0,1,0),0x2f9e44],y:[new THREE.Vector3(0,0,1),0x1f6fd1]};
  for(const [k,[d,c]] of Object.entries(AX)){const m=new THREE.MeshBasicMaterial({color:c,depthTest:false,transparent:true});const g=new THREE.Group();g.userData.ax=k;
    const sh=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,60,8),m);sh.position.y=30;const hd=new THREE.Mesh(new THREE.ConeGeometry(5,14,12),m);hd.position.y=66;const hit=new THREE.Mesh(new THREE.CylinderGeometry(7,7,80,6),new THREE.MeshBasicMaterial({visible:false}));hit.position.y=40;
    for(const o of [sh,hd,hit]){o.renderOrder=2000;o.userData.ax=k;g.add(o);}g.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d);GZ.add(g);}
  const gzCenter=()=>{const ps=selParts();if(!ps.length)return null;const bb=new THREE.Box3();for(const p of ps){const b=p.bb.clone();b.translate(p.grp.position);bb.union(b);}return bb.getCenter(new THREE.Vector3()).setY(bb.max.y+10);};
  (function gl(){const show=!P.hidden&&tool==='mover'&&visor.selected;GZ.visible=!!show;if(show){const c=gzCenter();if(c){GZ.position.copy(c);GZ.scale.setScalar(visor.camera.position.distanceTo(c)/700);}}requestAnimationFrame(gl);})();
  /* punto a punto */
  const ab={a:null};const mkDot=c=>{const m=new THREE.Mesh(new THREE.SphereGeometry(5,12,8),new THREE.MeshBasicMaterial({color:c,depthTest:false}));m.renderOrder=2001;m.visible=false;visor.scene.add(m);return m;};const dotA=mkDot(0xd23b2a),dotB=mkDot(0x1f6fd1);
  const snapPt=h=>{const P0=h.object.geometry.attributes.position,f=h.face;let best=h.point.clone(),bd=1e9;for(const i of [f.a,f.b,f.c]){const v=new THREE.Vector3().fromBufferAttribute(P0,i).applyMatrix4(h.object.matrixWorld);const d=v.distanceTo(h.point);if(d<bd){bd=d;best=v;}}
    const dist=visor.camera.position.distanceTo(h.point);return bd<Math.max(8,dist*.02)?best:h.point.clone();};
  const hitAny=e=>{setRay(e);const ms=[];for(const p of visor.parts)if(p.grp.visible!==false)p.grp.traverse(o=>{if(o.isMesh&&o.material&&o.material.visible!==false&&(o.material.opacity??1)>.1)ms.push(o);});const cps=visor.renderer.clippingPlanes;return ray.intersectObjects(ms,false).find(h=>!cps.length||cps.every(pl=>pl.distanceToPoint(h.point)>=0));};
  view.addEventListener('pointerdown',async e=>{if(P.hidden||tool!=='ab'||e.button!==0||!visor.selected)return;const id=base(visor.selected);
    if(!ab.a){const h=hitSel(e);if(!h)return;e.stopImmediatePropagation();e.preventDefault();ab.a=snapPt(h);dotA.position.copy(ab.a);dotA.visible=true;msg(`Origen en ${id}. Ahora tocá el destino.`);return;}
    const h=hitAny(e);if(!h)return;e.stopImmediatePropagation();e.preventDefault();const b=snapPt(h);dotB.position.copy(b);dotB.visible=true;const m=mask();const d=b.clone().sub(ab.a);
    const mv={x:m.x?Math.round(d.x):0,y:m.y?Math.round(d.z):0,z:m.z?Math.round(d.y):0};ab.a=null;setTimeout(()=>{dotA.visible=dotB.visible=false;},900);
    if(mv.x||mv.y||mv.z)await guardar(id,{mov:mv});msg(`${id} movida ${fmt(mv.x)} · ${fmt(mv.y)} · alto ${fmt(mv.z)} m.`);},true);
  addEventListener('keydown',e=>{if(e.key==='Escape'&&ab.a){ab.a=null;dotA.visible=false;msg('Punto a punto cancelado.');}});
  view.addEventListener('pointerdown',e=>{if(P.hidden||tool!=='mover'||!visor.selected||e.button!==0||!GZ.visible)return;setRay(e);const hs=ray.intersectObjects(GZ.children,true);if(!hs.length)return;
    e.stopImmediatePropagation();e.preventDefault();view.setPointerCapture(e.pointerId);visor.controls.enabled=false;const k=hs[0].object.userData.ax;
    drag={kind:'eje',ax:k,dir:AX[k][0].clone(),id:base(visor.selected),p0:GZ.position.clone(),sx:e.clientX,sy:e.clientY,parts:selParts(),dv:new THREE.Vector3()};},true);
  view.addEventListener('pointerdown',e=>{if(!tool||tool==='ab'||P.hidden||!visor.selected||e.button!==0)return;const h=hitSel(e);if(!h)return;
    e.stopImmediatePropagation();e.preventDefault();view.setPointerCapture(e.pointerId);visor.controls.enabled=false;const id=base(visor.selected);
    if(tool==='mover'){drag={kind:'mover',id,p0:h.point.clone(),plane:new THREE.Plane(new THREE.Vector3(0,1,0),-h.point.y),parts:selParts(),dv:new THREE.Vector3()};return;}
    const f=ED.find(id);const ESP=['M-04','M-21','M-10','M-09','M-26','M-20','M-22','M-06'];
    if(!f||f.k!=='MUROS'||f.d.nivel!=='PB'||ESP.includes(id)){/* cualquier pieza con caras planas: se corre la cara tocada */
      const pos=h.object.geometry.attributes.position,fa=h.face;const va=new THREE.Vector3().fromBufferAttribute(pos,fa.a),vb=new THREE.Vector3().fromBufferAttribute(pos,fa.b),vc=new THREE.Vector3().fromBufferAttribute(pos,fa.c);
      const nl=new THREE.Vector3().subVectors(vb,va).cross(new THREE.Vector3().subVectors(vc,va)).normalize();const nw=nl.clone().transformDirection(h.object.matrixWorld).normalize();
      const n=[+nw.x.toFixed(4),+nw.y.toFixed(4),+nw.z.toFixed(4)];const pw=va.clone().applyMatrix4(h.object.matrixWorld);const dd=n[0]*pw.x+n[1]*pw.y+n[2]*pw.z;
      drag={kind:'cara',id,dir:nw,p0:h.point.clone(),sx:e.clientX,sy:e.clientY,last:0,n,dd,base:JSON.parse(JSON.stringify((ED.E[id]&&ED.E[id].caras)||[]))};return;}
    const n=h.face.normal.clone().transformDirection(h.object.matrixWorld).normalize();const d=JSON.parse(JSON.stringify(f.d));
    const L=Math.hypot(d.b[0]-d.a[0],d.b[1]-d.a[1]);const ax=new THREE.Vector3((d.b[0]-d.a[0])/L,0,(d.b[1]-d.a[1])/L);
    let kind,dir;if(n.y>.7){kind='top';dir=new THREE.Vector3(0,1,0);}else if(Math.abs(n.dot(ax))>.7){kind=n.dot(ax)>0?'finB':'finA';dir=n.dot(ax)>0?ax.clone():ax.clone().negate();}
    else if(Math.abs(n.y)<.3){kind='lado';dir=new THREE.Vector3(n.x,0,n.z).normalize();}else{visor.controls.enabled=true;return;}
    drag={kind,id,d,ax,dir,p0:h.point.clone(),sx:e.clientX,sy:e.clientY,top0:d.top??WALL_TOP[id]??(d.nivel==='EP'?420:H_EP),last:0};},true);
  view.addEventListener('pointermove',e=>{if(!drag)return;e.stopPropagation();setRay(e);
    if(drag.kind==='mover'){let p;if(e.shiftKey){const n=new THREE.Vector3().subVectors(visor.camera.position,drag.p0);n.y=0;n.normalize();const pl=new THREE.Plane().setFromNormalAndCoplanarPoint(n,drag.p0);p=ray.ray.intersectPlane(pl,new THREE.Vector3());if(p){p.x=drag.p0.x;p.z=drag.p0.z;}}else p=ray.ray.intersectPlane(drag.plane,new THREE.Vector3());
      if(!p)return;const dv=p.sub(drag.p0);const mk=mask();dv.set(mk.x?sn(dv.x):0,mk.z?sn(dv.y):0,mk.y?sn(dv.z):0);drag.dv.copy(dv);for(const pp of drag.parts)pp.grp.position.copy(dv);
      showTip(e,`x ${dv.x>=0?'+':''}${fmt(dv.x)} · y ${dv.z>=0?'+':''}${fmt(dv.z)}${dv.y?` · alto ${dv.y>=0?'+':''}${fmt(dv.y)}`:''} m`);return;}
    if(drag.kind==='eje'){const r=visor.renderer.domElement.getBoundingClientRect(),cam=visor.camera;const pj=v=>{const q=v.clone().project(cam);return [(q.x+1)/2*r.width,(1-q.y)/2*r.height];};
      const a=pj(drag.p0),b=pj(drag.p0.clone().addScaledVector(drag.dir,100));const sv=[b[0]-a[0],b[1]-a[1]],l2=sv[0]*sv[0]+sv[1]*sv[1]||1;const t=sn(((e.clientX-drag.sx)*sv[0]+(e.clientY-drag.sy)*sv[1])/l2*100);
      drag.dv.copy(drag.dir).multiplyScalar(t);for(const pp of drag.parts)pp.grp.position.copy(drag.dv);showTip(e,`${drag.ax==='z'?'alto':drag.ax} ${t>=0?'+':''}${fmt(t)} m`);return;}
    const r=visor.renderer.domElement.getBoundingClientRect(),cam=visor.camera;const proj=v=>{const q=v.clone().project(cam);return [(q.x+1)/2*r.width,(1-q.y)/2*r.height];};
    const s0=proj(drag.p0),s1=proj(drag.p0.clone().addScaledVector(drag.dir,100));const sv=[s1[0]-s0[0],s1[1]-s0[1]],sl2=sv[0]*sv[0]+sv[1]*sv[1];const mx=e.clientX-drag.sx,my=e.clientY-drag.sy;
    let tt;if(sl2>400)tt=(mx*sv[0]+my*sv[1])/sl2*100;else{const dist=cam.position.distanceTo(drag.p0);const wpp=2*dist*Math.tan(cam.fov*Math.PI/360)/r.height;tt=-my*wpp;}
    const t=sn(tt);if(t===drag.last)return;drag.last=t;
    showTip(e,`${t>=0?'+':''}${fmt(t)} m`);const now=performance.now();if(now-lastPrev>90){lastPrev=now;ED.editar(drag.id,patchFor(drag,t),false);}},true);
  const end=async e=>{if(!drag)return;e.stopPropagation();const d=drag;drag=null;tip.hidden=true;visor.controls.enabled=true;
    if(d.kind==='mover'||d.kind==='eje'){for(const pp of d.parts)pp.grp.position.set(0,0,0);if(d.dv.lengthSq())await guardar(d.id,{mov:{x:d.dv.x,y:d.dv.z,z:d.dv.y}});return;}
    await guardar(d.id,patchFor(d,d.last));};
  const patchFor=(dr,t)=>dr.kind==='cara'?{caras:[...dr.base,{n:dr.n,d:Math.round(dr.dd*10)/10,t}]}:{set:setFor(dr,t)};
  view.addEventListener('pointerup',end,true);view.addEventListener('pointercancel',end,true);
  function setFor(dr,t){if(dr.kind==='cara')return null;const d=dr.d;if(dr.kind==='top')return {top:Math.max(20,Math.round(dr.top0+t))};
    if(dr.kind==='finB')return {b:[Math.round(d.b[0]+dr.ax.x*t),Math.round(d.b[1]+dr.ax.z*t)]};
    if(dr.kind==='finA')return {a:[Math.round(d.a[0]-dr.ax.x*t),Math.round(d.a[1]-dr.ax.z*t)]};
    const e=Math.max(2,d.e+t),sx=dr.dir.x*t/2,sy=dr.dir.z*t/2;return {e:Math.round(e),a:[Math.round(d.a[0]+sx),Math.round(d.a[1]+sy)],b:[Math.round(d.b[0]+sx),Math.round(d.b[1]+sy)]};}
}
