/* Visor 3D de despiece — reutilizable.
   Un modelo describe piezas, uniones, pasos de armado y variables; el visor se ocupa del resto:
   escena, selección con medidas de cada arista, explosión, cotas, piezas clickeables en el texto,
   armado paso a paso en 3D, variables que reconstruyen el modelo y tema claro/oscuro.

   Uso:
     import { createVisor, geo } from './visor3d.js';
     createVisor({ model, colors, lift });
   model = {
     params: [{id,label,type:'number'|'select'|'check',value,min,max,step,options:[[v,label]],quick,group,help}],
     build(p, geo) -> {
       parts: [{id,name,cat,geos,info:{fn,sec,med,u},group,tags,opt:{op,noEdges,dedupeAll}}],
       views: {nombre:{p:[x,y,z],t:[x,y,z]}},  default: 'iso',
       dims(api),            // api.tag(text,pos,cls) · api.dimLine(a,b,tick,text)
       joints: [{code,name,parts:[tokens],body}],
       steps:  [{title,text,parts:[tokens]}],
       panes:  {id: html},   // pestañas propias del modelo
       spec:   html          // línea bajo el título
     }
   }
   Tokens: id de pieza o cualquier etiqueta de p.tags. En el texto, toda aparición de un token se vuelve clickeable. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

/* ---------- geometría ---------- */
/* une muchas geometrías en una sola (un solo dibujado): árboles, arbustos */
function mergeAll(gs){const L=gs.map(g=>g.index?g.toNonIndexed():g);const col=L.some(g=>g.attributes.color);let n=0;for(const g of L)n+=g.attributes.position.count;
  const P=new Float32Array(n*3),N=new Float32Array(n*3),C=col?new Float32Array(n*3).fill(1):null,hasUV=L.every(g=>g.attributes.uv),U=hasUV?new Float32Array(n*2):null;let o=0;
  for(const g of L){if(!g.attributes.normal)g.computeVertexNormals();P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);if(C&&g.attributes.color&&g.attributes.color.itemSize===3)C.set(g.attributes.color.array,o*3);if(U)U.set(g.attributes.uv.array,o*2);o+=g.attributes.position.count;}
  const m=new THREE.BufferGeometry();m.setAttribute('position',new THREE.BufferAttribute(P,3));m.setAttribute('normal',new THREE.BufferAttribute(N,3));if(C)m.setAttribute('color',new THREE.BufferAttribute(C,3));if(U)m.setAttribute('uv',new THREE.BufferAttribute(U,2));return m;}
function mapGeo(g,fn){const p=g.attributes.position;for(let i=0;i<p.count;i++){const r=fn(p.getX(i),p.getY(i),p.getZ(i));p.setXYZ(i,r[0],r[1],r[2]);}g.computeVertexNormals();return g;}
function dedupe(pts){const out=[];for(const p of pts){const q=out[out.length-1];if(!q||Math.hypot(p[0]-q[0],p[1]-q[1])>1e-6)out.push(p);}if(out.length>2){const a=out[0],b=out[out.length-1];if(Math.hypot(a[0]-b[0],a[1]-b[1])<1e-6)out.pop();}return out;}
function flipW(g){/* invierte el sentido de las caras (para mapeos en espejo) */const g2=g.index?g.toNonIndexed():g;for(const k of Object.keys(g2.attributes)){const A=g2.attributes[k],n=A.itemSize;for(let i=0;i<A.count;i+=3)for(let c=0;c<n;c++){const t=A.array[(i+1)*n+c];A.array[(i+1)*n+c]=A.array[(i+2)*n+c];A.array[(i+2)*n+c]=t;}A.needsUpdate=true;}g2.computeVertexNormals();return g2;}
function prism(pts,a,b,plane){pts=dedupe(pts);const s=new THREE.Shape(pts.map(p=>new THREE.Vector2(p[0],p[1])));const g=new THREE.ExtrudeGeometry(s,{depth:b-a,bevelEnabled:false,curveSegments:1});
  if(plane==='XY')return mapGeo(g,(u,v,w)=>[u,v,a+w]);if(plane==='ZY')return flipW(mapGeo(g,(u,v,w)=>[a+w,v,u]));return flipW(mapGeo(g,(u,v,w)=>[u,a+w,v]));}
function box(x0,x1,y0,y1,z0,z1){const g=new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0);g.translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);return g;}
function rod(a,b,r,seg=14){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b);const L=A.distanceTo(B);const g=new THREE.CylinderGeometry(r,r,L,seg);g.translate(0,L/2,0);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),B.clone().sub(A).normalize()));g.translate(A.x,A.y,A.z);g.userData={rod:true,a:A,b:B,L};return g;}
/* sólido de 8 vértices: abajo b0..b3, arriba t0..t3 en el mismo orden */
function box8(v){const V=v.map(q=>q.isVector3?q:new THREE.Vector3(...q));let F=[[0,2,1],[0,3,2],[4,5,6],[4,6,7],[0,1,5],[0,5,4],[1,2,6],[1,6,5],[2,3,7],[2,7,6],[3,0,4],[3,4,7]];
  /* caras siempre hacia afuera, venga como venga el orden de los vértices */const C=V.reduce((a,b)=>a.clone().add(b),new THREE.Vector3()).multiplyScalar(1/8);
  F=F.map(([a,b,c])=>{const n=V[b].clone().sub(V[a]).cross(V[c].clone().sub(V[a]));const m=V[a].clone().add(V[b]).add(V[c]).multiplyScalar(1/3).sub(C);return n.dot(m)<0?[a,c,b]:[a,b,c];});
  const g=new THREE.BufferGeometry().setFromPoints(F.flat().map(i=>V[i]));g.computeVertexNormals();
  const uv=[];F.flat().forEach(i=>{const j=i%4;uv.push(j===1||j===2?1:0,i>=4?1:0);});g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));return g;}
/* panel delgado: p = [abajo-inicio, abajo-fin, arriba-fin, arriba-inicio] */
function quad(p,thick,n){const N=new THREE.Vector3(...n).normalize().multiplyScalar(thick/2);const V=p.map(q=>new THREE.Vector3(...q));
  return box8([V[0].clone().sub(N),V[1].clone().sub(N),V[1].clone().add(N),V[0].clone().add(N),V[3].clone().sub(N),V[2].clone().sub(N),V[2].clone().add(N),V[3].clone().add(N)]);}
function clip(poly,a,b,c){const out=[];for(let i=0;i<poly.length;i++){const P=poly[i],Q=poly[(i+1)%poly.length];const fp=a*P[0]+b*P[1]+c,fq=a*Q[0]+b*Q[1]+c;if(fp>=-1e-9)out.push(P);if((fp>=-1e-9)!==(fq>=-1e-9)){const t=fp/(fp-fq);out.push([P[0]+t*(Q[0]-P[0]),P[1]+t*(Q[1]-P[1])]);}}return out;}
function minus(poly,rects){const CL=window.ClipperLib;const SC=1000,toP=p=>p.map(q=>({X:Math.round(q[0]*SC),Y:Math.round(q[1]*SC)}));const c=new CL.Clipper();c.AddPath(toP(poly),CL.PolyType.ptSubject,true);
  for(const [x0,x1,z0,z1] of rects)c.AddPath(toP([[x0,z0],[x1,z0],[x1,z1],[x0,z1]]),CL.PolyType.ptClip,true);const sol=new CL.Paths();c.Execute(CL.ClipType.ctDifference,sol,CL.PolyFillType.pftNonZero,CL.PolyFillType.pftNonZero);
  return sol.map(pth=>pth.map(q=>[q.X/SC,q.Y/SC])).filter(p=>p.length>2);}
function extent(poly,dir){const n=[-dir[1],dir[0]];let a=1e9,b=-1e9,c=1e9,d=-1e9;for(const p of poly){const u=p[0]*dir[0]+p[1]*dir[1],v=p[0]*n[0]+p[1]*n[1];a=Math.min(a,u);b=Math.max(b,u);c=Math.min(c,v);d=Math.max(d,v);}return {L:b-a,W:d-c};}
const f1=n=>(Math.round(n*10)/10).toFixed(1).replace('.',',').replace(/,0$/,'');
const f0=n=>Math.round(n).toString();
export const geo={THREE,mapGeo,dedupe,prism,box,rod,box8,quad,clip,minus,extent,f1,f0};

/* ---------- visor ---------- */
export function createVisor({model,colors={},lift={},root=null,radial=.3,far=9000}){
  const R=root||document;const $=id=>(root&&root.querySelector('#'+id))||(root?null:document.getElementById(id));
  const view=$('view'),lab=$('labels'),selEl=$('sel');
  const renderer=new THREE.WebGLRenderer({antialias:true,logarithmicDepthBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));view.appendChild(renderer.domElement);
  const lr=new CSS2DRenderer();lab.appendChild(lr.domElement);
  const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(35,1,5,far);
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;/* sin inercia: la inercia de un desplazamiento anterior seguía moviendo la vista durante la órbita */controls.maxPolarAngle=Math.PI-0.01;/* el límite de inclinación lo pone la órbita propia (abajo); si OrbitControls también limitaba, corría la cámara y el pivote parecía moverse */controls.minDistance=1;controls.zoomToCursor=true;
  scene.add(new THREE.HemisphereLight(0xffffff,0x8a8070,1.1));
  [[-200,500,-300,1.5],[300,200,-200,.55],[100,150,400,.4]].forEach(([x,y,z,i])=>{const l=new THREE.DirectionalLight(0xffffff,i);l.position.set(x,y,z);scene.add(l);});
  const css=()=>getComputedStyle(document.documentElement);
  let TC={};const readTheme=()=>{const c=css();TC={stage:c.getPropertyValue('--stage').trim(),accent:c.getPropertyValue('--accent').trim(),dim:c.getPropertyValue('--dim').trim()};};readTheme();
  scene.background=new THREE.Color(TC.stage);
  const floorM=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshStandardMaterial({color:0xc2b8a6,roughness:1}));floorM.rotation.x=-Math.PI/2;scene.add(floorM);
  let grid=null;
  const edgeMat=new THREE.LineBasicMaterial({color:0x2a2420,transparent:true,opacity:.55});
  const dimMat=new THREE.LineBasicMaterial({color:new THREE.Color(TC.dim)});
  const hiEdge=new THREE.LineBasicMaterial({color:new THREE.Color(TC.dim),depthTest:false,transparent:true});
  /* predeterminadas: el valor marcado con ☑ «predeterminada» en Variables reemplaza al del código (queda en este navegador) */
  let PRED={};try{PRED=JSON.parse(localStorage.getItem('carhue-pred')||'{}');}catch(e){}
  /* además, todo cambio de variable queda guardado (Maxi 14/10: «la escalera no persistió»): carhue-params en este navegador; el modelo lo sube a la base para las variables de diseño */
  let SAVED={};try{SAVED=JSON.parse(localStorage.getItem('carhue-params')||'{}');}catch(e){}
  const okVal=(q,v)=>v!==undefined&&v!==null&&(q.type!=='select'||q.options.some(([o])=>String(o)===String(v)));
  const P={};for(const q of model.params){P[q.id]=q.value;if(okVal(q,PRED[q.id]))P[q.id]=PRED[q.id];if(okVal(q,SAVED[q.id]))P[q.id]=SAVED[q.id];}
  const saveParams=()=>{try{localStorage.setItem('carhue-params',JSON.stringify(P));}catch(e){}if(hooksP.onParam)try{hooksP.onParam({...P});}catch(e){}};const hooksP={onParam:null};
  function setParams(obj){let ch=false;for(const q of model.params){if(!(q.id in obj))continue;let v=obj[q.id];if(!okVal(q,v))continue;if(String(P[q.id])!==String(v)){P[q.id]=v;syncParams(q.id);ch=true;}}if(ch){try{localStorage.setItem('carhue-params',JSON.stringify(P));}catch(e){}showIfs();syncPred();rebuild();}}
  let out=null,parts=[],byId={},tokens={},G0=null,dims=null,curDims=null,focusSet=null,selId=null,stepIdx=-1,stepMode=false,ex=0,tween=null;const hidden=new Set();const hooks={render:null};

  /* ----- variables ----- */
  function paramInput(q,prefix){const id=prefix+q.id;
    if(q.type==='select')return `<select id="${id}">${q.options.map(([v,l])=>`<option value="${v}"${String(v)===String(P[q.id])?' selected':''}>${l}</option>`).join('')}</select>`;
    if(q.type==='check')return `<input type="checkbox" id="${id}"${P[q.id]?' checked':''}>`;
    if(q.slider)return `<input type="range" id="${id}" min="${q.min}" max="${q.max}" step="${q.step||1}" value="${P[q.id]}"><output id="${id}-o" class="rv">${P[q.id]}${q.unit||''}</output>`;
    return `<input type="number" id="${id}" min="${q.min}" max="${q.max}" step="${q.step||1}" value="${P[q.id]}">`;}
  function bindParam(q,prefix){const el=$(prefix+q.id);if(!el)return;if(q.slider)el.addEventListener('input',()=>{for(const pre of ['q-','v-']){const o=$(pre+q.id+'-o');if(o)o.textContent=el.value+(q.unit||'');}});el.addEventListener('change',()=>{let v=q.type==='check'?el.checked:q.type==='number'?+el.value:el.value;
    if(q.type==='number'){if(isNaN(v))v=q.value;v=Math.max(q.min,Math.min(q.max,v));el.value=v;}if(q.type==='select'&&typeof q.value==='number')v=+v;P[q.id]=v;syncParams(q.id);showIfs();syncPred();saveParams();rebuild(q.recam);});}
  function syncParams(changed){for(const pre of ['q-','v-']){const el=$(pre+changed);if(!el)continue;if(el.type==='checkbox')el.checked=!!P[changed];else el.value=P[changed];const o=$(pre+changed+'-o');if(o){const q=model.params.find(x=>x.id===changed);o.textContent=P[changed]+(q&&q.unit||'');}}}
  function showIfs(){for(const q of model.params){if(!q.showIf)continue;const on=!!q.showIf(P);const a=$('q-'+q.id);if(a){const l=a.closest('label');if(l)l.style.display=on?'':'none';}const b=$('v-'+q.id);if(b){const r=b.closest('.vrowp');if(r)r.style.display=on?'':'none';}}}
  function syncPred(){document.querySelectorAll('[data-pred]').forEach(c=>{const id=c.dataset.pred;c.checked=PRED[id]!==undefined&&String(PRED[id])===String(P[id]);});}
  function renderParams(){
    const quick=$('quick');if(quick){quick.innerHTML=model.params.filter(q=>q.quick).map(q=>`<label class="ctl" for="q-${q.id}">${q.label} ${paramInput(q,'q-')}</label>`).join('');model.params.filter(q=>q.quick).forEach(q=>bindParam(q,'q-'));}
    const pv=$('pane-variables');if(!pv)return;const groups=[...new Set(model.params.map(q=>q.group||'General'))];
    pv.innerHTML=groups.map(g=>`<h3>${g}</h3><div class="vgrid">`+model.params.filter(q=>(q.group||'General')===g).map(q=>`<div class="vrowp"><label for="v-${q.id}">${q.label}</label><div>${paramInput(q,'v-')} <label class="pred" title="Usar este valor al abrir la página"><input type="checkbox" data-pred="${q.id}"> predeterminada</label>${q.help?`<div class="vh">${q.help}</div>`:''}</div></div>`).join('')+`</div>`).join('')+`<div id="calcOut"></div>`;
    model.params.forEach(q=>bindParam(q,'v-'));
    pv.querySelectorAll('[data-pred]').forEach(c=>c.addEventListener('change',()=>{const id=c.dataset.pred;if(c.checked)PRED[id]=P[id];else delete PRED[id];try{localStorage.setItem('carhue-pred',JSON.stringify(PRED));}catch(e){}syncPred();}));
    syncPred();showIfs();}

  /* ----- montaje ----- */
  /* Etiquetas: el CSS2DObject mueve un contenedor; la escala y la visibilidad se aplican al hijo (ver declutter). */
  const PRI={'lvl tag pick':5,'lvl tag':4,lvl:3,dim:2,edge:1};
  function tag(text,pos,cls='lvl',parent=dims,w=0,part=null){const el=document.createElement('div');el.style.pointerEvents='none';const inn=document.createElement('div');inn.className=cls;inn.innerHTML=text;inn.style.transition='opacity .15s';el.appendChild(inn);
    const ob=new CSS2DObject(el);ob.position.set(...pos);ob.userData.lbl={inn,pri:PRI[cls]??2,w,sz:null,on:true,part};parent.add(ob);if(part&&hidden.has(part))ob.visible=false;lblDirty=true;return ob;}
  /* Legibilidad: cada etiqueta se achica con la distancia (entre K0 y K1 de su tamaño); si choca con otra
     de mayor prioridad, se achica más hasta K0 y recién ahí se oculta. Prioridad: niveles > cotas > aristas, y entre aristas la más larga. */
  let lblDirty=true;const lastCam=new THREE.Matrix4(),_v=new THREE.Vector3(),_dir=new THREE.Vector3(),_ray=new THREE.Raycaster(),K0=.6,K1=1.1,PXREF=2;
  function declutter(){camera.updateMatrixWorld();if(!lblDirty&&lastCam.equals(camera.matrixWorld))return;lastCam.copy(camera.matrixWorld);lblDirty=false;
    const W=view.clientWidth,H=view.clientHeight,tf=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));const L=[];
    scene.traverseVisible(ob=>{if(!ob.isCSS2DObject||!ob.userData.lbl)return;if(ob.element.style.display==='none')return;L.push(ob);});
    const occ=[];if(G0)G0.traverse(o=>{if(o.isMesh&&o.userData.id&&o.parent.visible){const pp=byId[o.userData.id];if(pp&&pp.mat.opacity>.5)occ.push(o);}});const cps=renderer.clippingPlanes;
    for(const ob of L){const d=ob.userData.lbl;ob.getWorldPosition(_v);const dist=_v.distanceTo(camera.position);
      d.occ=false;if(cps.length&&!cps.every(pl=>pl.distanceToPoint(_v)>=0))d.occ=true;
      if(!d.occ&&!d.noOcc&&occ.length){_dir.copy(_v).sub(camera.position).normalize();_ray.set(camera.position,_dir);_ray.far=dist-6;_ray.near=1;const hits=_ray.intersectObjects(occ,false);d.occ=hits.some(h=>cps.every(pl=>pl.distanceToPoint(h.point)>=0));}
      _v.project(camera);
      d.x=(_v.x+1)/2*W;d.y=(1-_v.y)/2*H;d.k=Math.max(K0,Math.min(K1,H/(2*dist*tf)/PXREF));
      if(!d.sz||!d.sz[0]){d.sz=[d.inn.offsetWidth,d.inn.offsetHeight];}}
    L.sort((a,b)=>{const A=a.userData.lbl,B=b.userData.lbl;return B.pri-A.pri||B.w-A.w;});
    const placed=[];
    // si choca, se prueba más chica (hasta K0) antes de ocultarla
    const rect=(d,k)=>{const hw=d.sz[0]*k/2+1.5,hh=d.sz[1]*k/2+.5;return [d.x-hw,d.y-hh,d.x+hw,d.y+hh];};
    const free=r=>!placed.some(q=>r[0]<q[2]&&r[2]>q[0]&&r[1]<q[3]&&r[3]>q[1]);
    for(const ob of L){const d=ob.userData.lbl;let k=d.k,r=rect(d,k);
      while(!d.occ&&!free(r)&&k>K0+1e-3){k=Math.max(K0,k*.9);r=rect(d,k);}
      const hit=d.occ||!free(r);if(!hit)placed.push(r);d.inn.style.transform=`scale(${k.toFixed(3)})`;if(d.on===hit){d.on=!hit;d.inn.style.opacity=hit?'0':'';}}}
  function dimLine(a,b,tick,text){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),T=new THREE.Vector3(...tick);
    dims.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([A,B,A.clone().add(T),A.clone().sub(T),B.clone().add(T),B.clone().sub(T)]),dimMat));tag(text??f1(A.distanceTo(B)),A.clone().add(B).multiplyScalar(.5).toArray(),'dim',dims,A.distanceTo(B));}
  function mount(){
    if(G0){G0.traverse(ob=>{if(ob.isCSS2DObject&&ob.element)ob.element.remove();if(ob.geometry)ob.geometry.dispose();});scene.remove(G0);}
    G0=new THREE.Group();scene.add(G0);parts=out.parts;byId={};tokens={};
    const all=new THREE.Box3();
    for(const p of parts){byId[p.id]=p;p.opt=p.opt||{};p.tags=p.tags||[];
      for(const t of [p.id,...p.tags])(tokens[t]=tokens[t]||[]).push(p.id);
      const isEx=p.cat==='exist',metal=['herraje','perno','steel','inox'].includes(p.cat);const op=p.opt.op??(isEx?.3:p.cat==='glass'?.28:1);
      p.mat=new THREE.MeshStandardMaterial({color:colors[p.cat]||'#999',roughness:metal?.4:.82,metalness:metal?.55:0,flatShading:true,transparent:true,opacity:op,side:THREE.DoubleSide,depthWrite:op>.5});
      if(p.opt.vcol){p.mat.vertexColors=true;p.mat.color.set('#ffffff');}
      if(p.opt.map){p.mat.map=p.opt.map;p.mat.color.set('#ffffff');p.mat.alphaTest=p.opt.alphaTest??.3;p.mat.transparent=false;p.mat.depthWrite=true;if(p.opt.smooth)p.mat.flatShading=false;}
      p.base=op;p.emat=edgeMat.clone();if(isEx)p.emat.opacity=.22;
      const grp=new THREE.Group();const bb=new THREE.Box3();
      /* fps: cada pieza se dibuja como una sola malla (y un solo juego de aristas); se guarda qué tramo es cada parte para «borrar partes» */
      let ranges=null;if(p.geos.length>1&&!(p.opt&&p.opt.noMerge)){ranges=[];let o=0;for(const g of p.geos){const n=(g.index?g.index.count:g.attributes.position.count);ranges.push([o,n]);o+=n;}p.geos=[mergeAll(p.geos)];}
      for(const g of p.geos){const m=new THREE.Mesh(g,p.mat);m.userData.id=p.id;if(ranges)m.userData.ranges=ranges;grp.add(m);
        if(!p.opt.noEdges&&!['perno','glass','mesh'].includes(p.cat))grp.add(new THREE.LineSegments(new THREE.EdgesGeometry(g,25),p.emat));
        g.computeBoundingBox();bb.union(g.boundingBox);}
      p.bb=bb;if(!isEx)all.union(bb);p.grp=grp;G0.add(grp);}
    const c=all.getCenter(new THREE.Vector3()),sz=all.getSize(new THREE.Vector3());
    for(const p of parts){const pc=p.bb.getCenter(new THREE.Vector3());const d=new THREE.Vector3(pc.x-c.x,0,pc.z-c.z).multiplyScalar(radial);if(p.cat==='exist'||p.cat==='perno')d.set(0,0,0);d.y=lift[p.cat]??0;p.ex=d;}
    floorM.scale.set(Math.max(sz.x,sz.z)*3+400,Math.max(sz.x,sz.z)*3+400,1);const TER=window.__terreno||{t:-0.05,c:0};floorM.position.set(c.x,TER.t,c.z);
    {/* huecos en el piso (pileta): piezas con opt.hueco = polígono en planta [[x,y],…] */const S=Math.max(sz.x,sz.z)*3+400,hs=parts.filter(q=>q.opt&&q.opt.hueco).map(q=>q.opt.hueco);
      const key=JSON.stringify([S,c.x,c.z,hs,TER.c]);if(floorM.userData.hk!==key){floorM.userData.hk=key;const sh=new THREE.Shape([[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]].map(q=>new THREE.Vector2(...q)));
        for(const h of hs)sh.holes.push(new THREE.Path(h.map(([x,y])=>new THREE.Vector2((x-c.x)/S,-(y-c.z)/S))));
        const ng=new THREE.ShapeGeometry(sh);if(TER.c){const P=ng.attributes.position;for(let i=0;i<P.count;i++){if(Math.abs(P.getX(i))>.49||Math.abs(P.getY(i))>.49)P.setZ(i,-TER.c);}ng.computeVertexNormals();}const uv=ng.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)+.5,uv.getY(i)+.5);floorM.geometry.dispose();floorM.geometry=ng;floorM.userData.ground=true;floorM.userData.real=false;}}
    if(grid)scene.remove(grid);const gs=Math.ceil((Math.max(sz.x,sz.z)*2.5+300)/100)*100;grid=new THREE.GridHelper(gs,gs/10,0x9a9282,0xb0a898);grid.position.set(c.x,0,c.z);scene.add(grid);
    dims=new THREE.Group();G0.add(dims);out.dims&&out.dims({tag,dimLine,add:ob=>dims.add(ob),accent:TC.accent,THREE});
    applyVis();applyExplode();applyFocus();}

  /* ----- visibilidad, explosión, foco ----- */
  const tgExist=$('tgExist'),tgDim=$('tgDim'),exEl=$('explode');
  function applyVis(){lblDirty=true;for(const p of parts){let v=true;if(p.cat==='exist'&&tgExist&&!tgExist.checked)v=false;if(stepMode&&p.step!=null&&p.step>stepIdx)v=false;if(hidden.has(p.id))v=false;p.grp.visible=v;}
    if(dims)dims.traverse(ob=>{if(ob.isCSS2DObject&&ob.userData.lbl&&ob.userData.lbl.part)ob.visible=!hidden.has(ob.userData.lbl.part);});
    if(dims){const dv=(!tgDim||tgDim.checked)&&!stepMode;dims.visible=dv;dims.traverse(ob=>{if(ob.isCSS2DObject)ob.visible=dv&&!stepMode;});}}
  function applyExplode(){lblDirty=true;for(const p of parts)p.grp.position.copy(p.ex).multiplyScalar(ex);}
  tgExist&&tgExist.addEventListener('change',applyVis);tgDim&&tgDim.addEventListener('change',applyVis);
  exEl&&exEl.addEventListener('input',()=>{ex=+exEl.value;applyExplode();});
  function applyFocus(){const cur=stepMode&&out.steps[stepIdx]?resolve(out.steps[stepIdx].parts):null;
    for(const p of parts){const on=!focusSet||focusSet.includes(p.id);p.mat.opacity=on?p.base:Math.min(.07,p.base);p.emat.opacity=on?(p.cat==='exist'?.22:.55):.04;
      const hot=p.id===selId||(cur&&cur.includes(p.id));p.mat.emissive.set(hot?TC.accent:'#000000');p.mat.emissiveIntensity=hot?(p.id===selId?.32:.22):0;}
    R.querySelectorAll('.row').forEach(r=>r.classList.toggle('on',r.dataset.id===selId));}
  const resolve=list=>[...new Set((list||[]).flatMap(t=>tokens[t]||[]))];

  /* ----- cámara ----- */
  function resize(){const w=view.clientWidth,h=view.clientHeight;renderer.setSize(w,h);lr.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();lblDirty=true;}
  new ResizeObserver(resize).observe(view);resize();
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Órbita alrededor de lo que tocás (Maxi): al apretar, el rayo del cursor da el punto de giro; si no toca nada (cielo), queda el último.
     Cámara y objetivo giran juntos alrededor de ese punto, así la vista no salta. F encuadra la pieza elegida. */
  {controls.enableRotate=false;const el=renderer.domElement,rc=new THREE.Raycaster(),m2=new THREE.Vector2(),pivot=new THREE.Vector3(),UP=new THREE.Vector3(0,1,0);
    /* indicador del punto de giro: ícono chico de rotación 3D (Lucide rotate-3d), sin fondo, siempre del mismo tamaño en pantalla */
    const dotTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
      const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const img=new Image();img.onload=()=>{x.drawImage(img,0,0,128,128);t.needsUpdate=true;};
      img.src='data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="#e2462b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M16.466 7.5C15.643 4.237 13.952 2 12 2 9.239 2 7 6.477 7 12s2.239 10 5 10c.342 0 .677-.069 1-.2"/><path d="m15.194 13.707 3.814 1.86-1.86 3.814"/><path d="M19 15.57c-1.804.885-4.274 1.43-7 1.43-5.523 0-10-2.239-10-5s4.477-5 10-5c4.838 0 8.873 1.718 9.8 4"/></svg>');return t;})();
    const dot=new THREE.Sprite(new THREE.SpriteMaterial({map:dotTex,depthTest:false,transparent:true,sizeAttenuation:false,opacity:.75}));dot.scale.set(.022,.022,1);dot.renderOrder=3000;dot.visible=false;scene.add(dot);
    let orb=null,touches=0;
    const pick=e=>{const r=el.getBoundingClientRect();m2.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);rc.setFromCamera(m2,camera);
      const ms=[];for(const p of parts)if(p.grp.visible!==false)p.grp.traverse(o=>{if(o.isMesh&&o.visible!==false&&o.material&&(Array.isArray(o.material)||o.material.opacity>.3))ms.push(o);});ms.push(floorM);
      const cps=renderer.clippingPlanes||[];return rc.intersectObjects(ms,false).find(h=>!cps.length||cps.every(pl=>pl.distanceToPoint(h.point)>=0));};
    el.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){touches++;if(touches>1){orb=null;dot.visible=false;return;}}/* sólo dedos: con el mouse el contador se desfasaba si se soltaba fuera del lienzo y la órbita dejaba de andar */if(e.button!==0||!controls.enabled)return;try{el.setPointerCapture(e.pointerId);}catch(_){}
      const h=pick(e);if(h)pivot.copy(h.point);else pivot.copy(controls.target);
      orb={x:e.clientX,y:e.clientY,id:e.pointerId};dot.position.copy(pivot);/* Maxi: sin ícono de órbita */});
    const rot=(q)=>{camera.position.sub(pivot).applyQuaternion(q).add(pivot);controls.target.sub(pivot).applyQuaternion(q).add(pivot);camera.quaternion.premultiply(q);};
    el.addEventListener('pointermove',e=>{if(!orb||e.pointerId!==orb.id)return;const dx=e.clientX-orb.x,dy=e.clientY-orb.y;orb.x=e.clientX;orb.y=e.clientY;
      const k=2*Math.PI/el.clientHeight;
      rot(new THREE.Quaternion().setFromAxisAngle(UP,-dx*k));
      const dir=new THREE.Vector3().subVectors(controls.target,camera.position).normalize(),right=dir.clone().cross(UP).normalize();
      const el0=Math.asin(Math.max(-1,Math.min(1,dir.y))),el1=Math.max(-1.52,Math.min(.03,el0-dy*k));
      if(right.lengthSq()>.5&&Math.abs(el1-el0)>1e-6)rot(new THREE.Quaternion().setFromAxisAngle(right,el1-el0));
      if(camera.position.y<25){const d=25-camera.position.y;camera.position.y+=d;controls.target.y+=d;}});
    const up=e=>{if(e.pointerType==='touch')touches=Math.max(0,touches-1);if(orb&&e.pointerId===orb.id){orb=null;dot.visible=false;}};
    el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
    /* rueda: avanza cámara y objetivo juntos por el rayo del cursor, un 18 % de la distancia a lo que está debajo (mínimo 8 cm),
       así no se frena al acercarse al objetivo de la órbita y, ya pegado a una superficie, la atraviesa (Maxi: «la rueda deja de acercar») */
    (el.parentElement||el).addEventListener('wheel',e=>{if(!controls.enabled||e.target!==el)return;e.preventDefault();e.stopPropagation();
      const h=pick(e),dir=rc.ray.direction.clone(),d=h?h.distance:camera.position.distanceTo(controls.target);
      const amt=Math.min(Math.abs(e.deltaY)*(e.deltaMode===1?33:1),240)/100,zin=e.deltaY<0;
      let step=Math.max(8,d*.18)*amt;if(zin&&d>40)step=Math.min(step,d-25);
      const v=dir.multiplyScalar(zin?step:-step);camera.position.add(v);controls.target.add(v);
      if(camera.position.y<25){const k=25-camera.position.y;camera.position.y+=k;controls.target.y+=k;}},{capture:true,passive:false});
    /* clic derecho sin arrastrar: menú para esconder lo que está bajo el cursor (arrastrando con el derecho sigue siendo desplazar); Y esconde lo elegido, Shift+Y muestra todo (Maxi 14/10) */
    let rdown=null,cm=null;const closeCm=()=>{if(cm){cm.remove();cm=null;}};
    el.addEventListener('contextmenu',e=>e.preventDefault());
    el.addEventListener('pointerdown',e=>{closeCm();if(e.button===2)rdown=[e.clientX,e.clientY];});
    el.addEventListener('pointerup',e=>{if(e.button!==2||!rdown)return;const moved=Math.hypot(e.clientX-rdown[0],e.clientY-rdown[1]);rdown=null;if(moved>5)return;
      const h=pick(e),id=h&&h.object&&h.object.userData&&h.object.userData.id,p=id&&byId[id];const items=[];
      const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
      if(p)items.push(['hide',id,`Esconder ${esc(p.name||id)}`],['sel',id,`Elegir ${esc(id)}`]);
      if(selId&&selId!==id&&byId[selId])items.push(['hide',selId,`Esconder lo elegido (${esc(selId)})`]);
      if(hidden.size)items.push(['all','',`Mostrar todo lo escondido (${hidden.size})`]);
      if(!items.length)return;
      cm=document.createElement('div');cm.style.cssText=`position:fixed;left:${e.clientX+2}px;top:${e.clientY+2}px;z-index:50;background:var(--panel,#fff);color:var(--ink,#222);border:1px solid var(--rule,#ccc);border-radius:4px;box-shadow:0 4px 14px rgba(0,0,0,.2);padding:3px;font-size:12px;min-width:180px`;
      cm.innerHTML=items.map(([a,i,t])=>`<div data-a="${a}" data-i="${esc(i)}" style="padding:5px 9px;cursor:pointer;border-radius:3px" onmouseover="this.style.background='var(--soft,#eee)'" onmouseout="this.style.background=''">${t}</div>`).join('')+'<div style="padding:3px 9px;color:var(--muted,#888);font-size:11px">Y esconde lo elegido · Shift+Y muestra todo</div>';
      document.body.appendChild(cm);
      cm.addEventListener('pointerdown',ev=>{ev.stopPropagation();const d=ev.target.closest('[data-a]');if(!d)return;const a=d.dataset.a,i=d.dataset.i;
        if(a==='hide'){toggleHidden(i,true);if(selId===i)resetSel();}else if(a==='sel')showPart(i);else if(a==='all')setHidden([]);closeCm();});});
    addEventListener('pointerdown',e=>{if(cm&&!cm.contains(e.target))closeCm();},true);
    addEventListener('keydown',e=>{if(/INPUT|SELECT|TEXTAREA/.test((e.target.tagName||''))||e.metaKey||e.ctrlKey||e.altKey)return;
      if(e.key==='y'&&selId&&byId[selId]){const i=selId;toggleHidden(i,true);resetSel();}
      else if(e.key==='Y'&&hidden.size){setHidden([]);}
      else if(e.key==='Escape')closeCm();});
    addEventListener('keydown',e=>{if((e.key==='f'||e.key==='F')&&!e.metaKey&&!e.ctrlKey&&!/INPUT|SELECT|TEXTAREA/.test((e.target.tagName||''))&&selId&&byId[selId]){const p=byId[selId];const b=new THREE.Box3().setFromObject(p.grp);const c=b.getCenter(new THREE.Vector3()),r=Math.max(60,b.getSize(new THREE.Vector3()).length()*.9);
      const d=new THREE.Vector3().subVectors(camera.position,controls.target).normalize();fly(c.clone().addScaledVector(d,r*1.6).toArray(),c.toArray());}});}
  function fly(p,t){const P1=new THREE.Vector3(...p),T1=new THREE.Vector3(...t);if(reduce){camera.position.copy(P1);controls.target.copy(T1);return;}tween={P0:camera.position.clone(),T0:controls.target.clone(),P1,T1,t0:performance.now(),d:650};}
  function fitTo(ids,keepDir=true){const bb=new THREE.Box3();ids.forEach(id=>byId[id]&&bb.union(byId[id].bb));if(bb.isEmpty())return;
    const c=bb.getCenter(new THREE.Vector3()),r=Math.max(60,bb.getSize(new THREE.Vector3()).length()*.5);
    const dir=keepDir?camera.position.clone().sub(controls.target).normalize():new THREE.Vector3(1,.7,-1).normalize();
    const dist=r/Math.sin(THREE.MathUtils.degToRad(camera.fov/2))*1.05;fly(c.clone().add(dir.multiplyScalar(dist)).toArray(),c.toArray());}
  function renderViews(){const vb=$('viewbar');if(!vb)return;vb.innerHTML=Object.keys(out.views).map(k=>`<button class="btn" data-view="${k}" aria-pressed="${k===(out.defaultView||'iso')}">${out.views[k].label||k}</button>`).join('')+`<button class="btn" id="clearSel">Ver todo</button>`;
    vb.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{vb.querySelectorAll('[data-view]').forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));const v=out.views[b.dataset.view];fly(v.p,v.t);}));
    $('clearSel').addEventListener('click',()=>{resetSel();const v=out.views[out.defaultView||'iso'];fly(v.p,v.t);});}

  /* ----- selección y medidas por arista ----- */
  function clearEdgeDims(){lblDirty=true;if(curDims){curDims.traverse(ob=>{if(ob.isCSS2DObject&&ob.element)ob.element.remove();});curDims.parent&&curDims.parent.remove(curDims);curDims=null;}}
  function edgeDims(ids){const g0=new THREE.Group();const seen=new Set();const segs=[];
    for(const id of ids){const p=byId[id];if(!p)continue;p.geos.forEach((g,gi)=>{
      if(g.userData&&g.userData.rod){const {a,b,L}=g.userData;segs.push(a,b);const key=id+'r'+L.toFixed(1);if(p.opt.dedupeAll&&seen.has(key))return;seen.add(key);tag(f1(L),a.clone().add(b).multiplyScalar(.5).toArray(),'edge',g0,L);return;}
      const e=new THREE.EdgesGeometry(g,25).attributes.position;
      for(let i=0;i<e.count;i+=2){const A=new THREE.Vector3(e.getX(i),e.getY(i),e.getZ(i)),B=new THREE.Vector3(e.getX(i+1),e.getY(i+1),e.getZ(i+1));const L=A.distanceTo(B);if(L<0.8)continue;segs.push(A,B);
        const d=B.clone().sub(A).normalize();const sg=Math.abs(d.x)>1e-3?Math.sign(d.x):Math.abs(d.y)>1e-3?Math.sign(d.y):Math.sign(d.z);d.multiplyScalar(sg);
        const key=`${id}|${p.opt.dedupeAll?'':gi}|${d.x.toFixed(2)},${d.y.toFixed(2)},${d.z.toFixed(2)}|${L.toFixed(1)}`;if(seen.has(key))continue;seen.add(key);
        tag(f1(L),A.clone().add(B).multiplyScalar(.5).toArray(),'edge',g0,L);}});}
    if(segs.length){const ls=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(segs),hiEdge);ls.renderOrder=11;g0.add(ls);}
    if(ids[0]&&byId[ids[0]])g0.position.copy(byId[ids[0]].grp.position);G0.add(g0);return g0;}
  function showPart(id){const p=byId[id];if(!p)return;selId=id;clearEdgeDims();curDims=edgeDims([id]);const i=p.info||{};
    {const c=p.bb.getCenter(new THREE.Vector3());const nm=(p.name||'').replace(/^[A-Za-z0-9-]+\s*·\s*/,'');const t=tag(`<b>${p.id}</b>${p.alias?' · '+p.alias:''}${nm&&nm!==p.alias?`<span class="nm">${nm}</span>`:''}`,[c.x,p.bb.max.y+14,c.z],'lvl tag pick',curDims,1e6);t.userData.lbl.noOcc=true;t.element.style.pointerEvents='auto';}
    selEl.innerHTML=`<div class="k">Pieza</div><h2>${p.name}</h2><dl>${i.fn?`<dt>Función</dt><dd>${i.fn}</dd>`:''}${i.sec?`<dt>Sección</dt><dd>${i.sec}</dd>`:''}${i.med?`<dt>Medidas</dt><dd>${i.med}</dd>`:''}${i.u?`<dt>Uniones</dt><dd class="mono">${i.u}</dd>`:''}</dl><div class="dimnote">Las cotas en azul son el largo real de cada arista de esta pieza.</div>${out.selExtra?out.selExtra(p):''}`;
    linkify(selEl);applyFocus();}
  function highlight(tok){const ids=resolve([tok]);if(!ids.length)return;if(ids.length===1){focusSet=null;showPart(ids[0]);}else{selId=null;clearEdgeDims();focusSet=ids;curDims=edgeDims(ids);
      selEl.innerHTML=`<div class="k">Conjunto</div><h2>${tok}</h2><p style="margin:0;font-size:13px">${ids.map(i=>byId[i].name).join(' · ')}</p><div class="dimnote">Medidas de cada arista de las piezas resaltadas.</div>`;linkify(selEl);applyFocus();}
    if(stepMode&&ids.some(i=>byId[i].step!=null&&byId[i].step>stepIdx)){}fitTo(ids);}
  function resetSel(){focusSet=null;selId=null;clearEdgeDims();selEl.innerHTML=out.selIntro||'<div class="k">Selección</div><h2>Tocá una pieza</h2>';applyFocus();}
  const ray=new THREE.Raycaster(),mv=new THREE.Vector2();let down=null;
  renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];});
  renderer.domElement.addEventListener('pointerup',e=>{if(!down)return;const moved=Math.hypot(e.clientX-down[0],e.clientY-down[1])>5;down=null;if(moved)return;
    const r=renderer.domElement.getBoundingClientRect();mv.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mv,camera);
    const ms=[];G0.traverse(ob=>{if(ob.isMesh&&ob.userData.id&&ob.parent.visible){const p=byId[ob.userData.id];if(p&&p.mat.opacity>.1&&!p.opt.noPick)ms.push(ob);}});
    const cps=renderer.clippingPlanes;const hit=ray.intersectObjects(ms,false).find(h=>!cps.length||cps.every(pl=>pl.distanceToPoint(h.point)>=0));if(api.pick&&api.pick(hit,ray))return;if(hit){focusSet=null;showPart(hit.object.userData.id);}else{/* cielo o pasto: deselecciona todo (Maxi 15/10) */resetSel();dispatchEvent(new CustomEvent('hm:deseleccionar'));}});

  /* ----- piezas clickeables en el texto ----- */
  function linkify(root){const toks=Object.keys(tokens).filter(t=>t.length>1).sort((a,b)=>b.length-a.length);if(!toks.length)return;
    const re=new RegExp('(^|[^\\wÁÉÍÓÚáéíóúñ])('+toks.map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')(?![\\wÁÉÍÓÚáéíóúñ])','g');
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement.closest('button,select,option,label,h2,.pt,input')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    for(const n of nodes){const s=n.nodeValue;re.lastIndex=0;if(!re.test(s))continue;re.lastIndex=0;const frag=document.createDocumentFragment();let last=0,m;
      while((m=re.exec(s))){const st=m.index+m[1].length;frag.appendChild(document.createTextNode(s.slice(last,st)));const b=document.createElement('button');b.className='pt';b.dataset.tok=m[2];b.textContent=m[2];frag.appendChild(b);last=st+m[2].length;}
      frag.appendChild(document.createTextNode(s.slice(last)));n.parentNode.replaceChild(frag,n);}}
  document.addEventListener('click',e=>{const b=e.target.closest('.pt');if(b&&R.contains(b)){e.preventDefault();highlight(b.dataset.tok);}});

  /* ----- pestañas genéricas: uniones, armado, piezas ----- */
  function renderPanes(){
    $('spec')&&( $('spec').innerHTML=out.spec||'');
    for(const [id,html] of Object.entries(out.panes||{})){const el=$('pane-'+id);if(el){el.innerHTML=html;}}
    const pu=$('pane-uniones');if(pu&&out.joints){pu.innerHTML=out.joints.map((j,i)=>`<div class="joint"><div class="hd" tabindex="0" data-j="${i}"><span class="code">${j.code}</span><span class="nm">${j.name}</span><span class="go">ver ↗</span></div>${j.body}</div>`).join('');
      pu.querySelectorAll('.hd').forEach(h=>{const go=()=>{const j=out.joints[+h.dataset.j];const ids=resolve(j.parts);selId=null;clearEdgeDims();focusSet=ids;selEl.innerHTML=`<div class="k">Unión ${j.code}</div><h2>${j.name}</h2><p style="margin:0;font-size:12.5px;color:var(--muted)">Tocá una pieza resaltada, en el 3D o en el texto, para ver sus medidas.</p>`;applyFocus();fitTo(ids);};h.addEventListener('click',go);h.addEventListener('keydown',e=>{if(e.key==='Enter')go();});});}
    const pa=$('pane-armado');if(pa&&out.steps){pa.innerHTML=`<p style="font-size:13px;margin-top:0">El modelo muestra solo lo que ya está colocado hasta cada paso; lo que se coloca en ese paso aparece resaltado. Usá ◀ ▶ abajo del 3D o tocá un paso.</p><ol class="steps">`+out.steps.map((s,i)=>`<li data-s="${i}" tabindex="0"><b>${s.title}</b><div>${s.text||''}</div></li>`).join('')+`</ol>`;
      pa.querySelectorAll('[data-s]').forEach(li=>{const go=e=>{if(e.target.closest('.pt'))return;setStep(+li.dataset.s);};li.addEventListener('click',go);li.addEventListener('keydown',e=>{if(e.key==='Enter')setStep(+li.dataset.s);});});}
    const pp=$('pane-piezas');if(pp){const groups=[...new Set(parts.map(p=>p.group||'Otras'))];pp.innerHTML=groups.map(g=>`<h3>${g}</h3>`+parts.filter(p=>(p.group||'Otras')===g).map(p=>`<div class="row" tabindex="0" data-id="${p.id}"><span class="sw" style="background:${colors[p.cat]||'#999'}"></span><div><div class="t">${p.name}</div><div class="s">${(p.info&&p.info.sec)||''}</div></div></div>`).join('')).join('');
      pp.querySelectorAll('.row').forEach(r=>{const go=()=>{focusSet=null;showPart(r.dataset.id);fitTo([r.dataset.id]);};r.addEventListener('click',go);r.addEventListener('keydown',e=>{if(e.key==='Enter')go();});});}
    const co=$('calcOut');if(co)co.innerHTML=out.calc||'';
    R.querySelectorAll('.pane').forEach(el=>{if(el.id!=='pane-piezas'&&el.id!=='pane-variables')linkify(el);});
    const co2=$('calcOut');co2&&linkify(co2);
    if(stepMode)setStep(Math.min(stepIdx,out.steps.length-1),true);}

  /* ----- armado paso a paso ----- */
  const sb=$('stepbar');let playT=null;
  function setStep(i,silent){stepMode=true;stepIdx=Math.max(0,Math.min(out.steps.length-1,i));focusSet=null;selId=null;clearEdgeDims();
    const s=out.steps[stepIdx];if(sb){sb.hidden=false;sb.querySelector('.st').innerHTML=`<b>Paso ${stepIdx+1} de ${out.steps.length}</b> · ${s.title}`;}
    R.querySelectorAll('.steps [data-s]').forEach(li=>li.classList.toggle('on',+li.dataset.s===stepIdx));
    applyVis();applyFocus();if(!silent){const ids=resolve(s.parts);if(ids.length)fitTo(ids);}}
  function exitSteps(){stepMode=false;if(playT){clearInterval(playT);playT=null;}if(sb)sb.hidden=true;applyVis();applyFocus();}
  if(sb){sb.querySelector('.prev').addEventListener('click',()=>setStep(stepIdx-1));sb.querySelector('.next').addEventListener('click',()=>setStep(stepIdx+1));
    sb.querySelector('.play').addEventListener('click',e=>{if(playT){clearInterval(playT);playT=null;e.currentTarget.textContent='▶ Reproducir';return;}if(stepIdx>=out.steps.length-1)setStep(0);e.currentTarget.textContent='❚❚ Pausa';const btn=e.currentTarget;playT=setInterval(()=>{if(stepIdx>=out.steps.length-1){clearInterval(playT);playT=null;btn.textContent='▶ Reproducir';return;}setStep(stepIdx+1);},2200);});
    sb.querySelector('.close').addEventListener('click',exitSteps);}
  R.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{R.querySelectorAll('.tab').forEach(x=>x.setAttribute('aria-selected',x===t?'true':'false'));R.querySelectorAll('.pane').forEach(p=>p.hidden=p.id!=='pane-'+t.dataset.tab);
    if(t.dataset.tab==='armado')setStep(stepMode?stepIdx:0);else if(stepMode)exitSteps();}));

  /* ----- reconstrucción ----- */
  function rebuild(recam){const keep=selId;out=model.build({...P},geo);
    (out.steps||[]).forEach((s,i)=>{for(const id of resolveIn(s.parts))if(out.parts.find(p=>p.id===id&&p.step==null))out.parts.find(p=>p.id===id).step=i;});
    mount();renderViews();renderPanes();if(keep&&byId[keep])showPart(keep);else resetSel();if(recam){const v=out.views[out.defaultView||'iso'];fly(v.p,v.t);}}
  function resolveIn(list){const tk={};for(const p of out.parts){for(const t of [p.id,...(p.tags||[])])(tk[t]=tk[t]||[]).push(p.id);}return [...new Set((list||[]).flatMap(t=>tk[t]||[]))];}
  function retheme(){readTheme();scene.background.set(TC.stage);dimMat.color.set(TC.dim);hiEdge.color.set(TC.dim);applyFocus();}
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change',retheme);
  new MutationObserver(retheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});

  renderParams();rebuild();
  {const v=out.views[out.defaultView||'iso'];camera.position.set(...v.p);controls.target.set(...v.t);}
  const FPS={n:0,t:performance.now()};
  const LR={t:0,on:true};window.__act=performance.now();window.__despertar=()=>{window.__act=performance.now();};
  for(const ev of ['pointermove','pointerdown','wheel','keydown','resize'])addEventListener(ev,()=>{window.__act=performance.now();},{passive:true,capture:true});
  (function loop(now){requestAnimationFrame(loop);if(tween){const u=Math.min(1,(now-tween.t0)/tween.d),e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;camera.position.lerpVectors(tween.P0,tween.P1,e);controls.target.lerpVectors(tween.T0,tween.T1,e);if(u>=1)tween=null;}controls.update();if(controls.target.y<0){controls.target.y=0;}if(camera.position.y<25){camera.position.y=25;}
    /* reposo (Maxi 14/10, el ventilador de la placa): sin actividad por 2,5 s se dibuja 2 veces por segundo; cualquier toque, rueda, tecla o animación lo despierta */
    {const act=tween||now-(window.__act||0)<2500;if(!act&&now-LR.t<500)return;LR.t=now;LR.on=!!act;}
    if(hooks.render)hooks.render();else renderer.render(scene,camera);lr.render(scene,camera);declutter();
    /* fps */FPS.n++;if(now-FPS.t>500){const f=Math.round(FPS.n*1000/(now-FPS.t));FPS.n=0;FPS.t=now;const el=document.getElementById('fps');if(el){const i=renderer.info.render;el.textContent=LR.on?`${f} fps`:'reposo';el.title=`${i.calls} dibujos · ${Math.round(i.triangles/1000)}k triángulos`;el.classList.toggle('lento',LR.on&&f<30);}}})(performance.now());
  function setClip(y){setClips(y==null?[]:[{axis:'y',value:y,side:-1}]);}
  /* cortes: {axis:'x'|'y'|'z', value, side:+1|-1} — se conserva el lado hacia donde apunta side */
  function setClips(list){renderer.clippingPlanes=(list||[]).map(c=>{const n=new THREE.Vector3(c.axis==='x'?1:0,c.axis==='y'?1:0,c.axis==='z'?1:0).multiplyScalar(c.side||-1);return new THREE.Plane(n,-n.dot(new THREE.Vector3(c.axis==='x'?c.value:0,c.axis==='y'?c.value:0,c.axis==='z'?c.value:0)));});curClips=list||[];lblDirty=true;}
  let curClips=[];
  function getView(){return {p:camera.position.toArray().map(v=>Math.round(v)),t:controls.target.toArray().map(v=>Math.round(v))};}
  function setHidden(ids){hidden.clear();(ids||[]).forEach(i=>hidden.add(i));applyVis();}
  function toggleHidden(id,on){if(on==null)on=!hidden.has(id);if(on)hidden.add(id);else hidden.delete(id);applyVis();}
  const api={setParams,get onParam(){return hooksP.onParam;},set onParam(f){hooksP.onParam=f;},rebuild,setStep,exitSteps,highlight,showPart,resetSel,setClip,setClips,get clips(){return curClips;},fly,getView,setHidden,toggleHidden,get hidden(){return [...hidden];},isHidden:id=>hidden.has(id),scene,renderer,camera,controls,THREE,params:P,get parts(){return parts;},get selected(){return selId;},get renderHook(){return hooks.render;},togglePred(id,on){if(on)PRED[id]=P[id];else delete PRED[id];try{localStorage.setItem('carhue-pred',JSON.stringify(PRED));}catch(e){}syncPred();},syncPred(){syncPred();},set renderHook(f){hooks.render=f;}};window.__visor=api;return api;
}
