/* Muebles hechos con modelos 3D reales (Maxi 16/10: «¿otra vez muebles geométricos? cambiá el método»).
   Salen de Objaverse (Allen AI), que reúne modelos publicados en Sketchfab; los eligió Maxi de una hoja de opciones.
   Cada GLB se pasó a metal/rugosidad, texturas webp de 1024 y meshopt, y va en base64 en motor/mueble-<clave>.js
   (como las personas: el artifact no sirve binarios sueltos). Se carga sólo cuando aparece el mueble; mientras tanto se ve una caja gris.
   El modelo se lleva a la medida del mueble: largo (L, x local), fondo (D, z local) y alto (H); el frente mira a +z local.
   Licencia CC BY 4.0: el autor figura acá y en el catálogo. */
export const MODELOS={
  sofaLcb:{n:'Sillón en L, tela gris (C&B Lounge II)',cat:'estar',p:{L:340,D:172,H:73,lado:'izq'},ui:[['L','largo','num'],['D','fondo','num'],['H','alto','num'],['lado','chaise',['izq','der']]],
    titulo:'C&B++ Lounge II 2-piece Sectional',autor:'gham3d',uid:'0a05df5d02574dd9a678c835237704bc',
    /* el modelo trae la chaise a la izquierda (−x), hacia adelante; «der» la espeja */caja:p=>{const d=Math.min(p.D,Math.max(70,p.D*.55));return [[-p.L/2,p.L/2,-p.D/2,-p.D/2+d],[-p.L/2,-p.L/2+p.L*.3,-p.D/2+d,p.D/2]];}},
  sofaRaffey:{n:'Sofá largo, tela gris',cat:'estar',p:{L:300,D:99,H:81},titulo:'Grey Sofa',autor:'Raffey',uid:'e94e15859aff4c5ebf4791c46ab8ba42'},
  butacaAm:{n:'Butaca tapizada de respaldo alto',cat:'estar',p:{L:82,D:77,H:86,tela:'tela'},ui:[['L','largo','num'],['D','fondo','num'],['H','alto','num'],['tela','tela',['tela','lino','grafito','petroleo','mostaza','cuero']]],
    /* el original es de cuero suela; Maxi la eligió vista en gris: el tapizado toma la tela elegida («cuero» deja el original) */tapiz:/leather/i,titulo:'armchair',autor:'gurbetoglu61',uid:'60afe0998936456e803f6a469c7f1482'},
  sillaCover:{n:'Silla de roble con apoyabrazos (tipo Cover)',cat:'comedor',p:{L:56,D:51,H:76},titulo:'Cover Chair',autor:'rocio133',uid:'86c6d5e7bb954a949b9977decbd3009b'},
  sillaDSW:{n:'Silla de cáscara blanca con patas de madera',cat:'comedor',p:{L:47,D:54,H:81},titulo:'chair 3d Vitra',autor:'3d-dca',uid:'bdf18bc95bcb437180d896c164aa97f2'},
  ratonaJoco:{n:'Mesas ratonas redondas encastradas (par)',cat:'estar',p:{L:160,D:130,H:32},titulo:'Side table Joco Stone',autor:'lep511',uid:'4037cdd7d3b047de93618f24f9a0b663',
    /* la chica adelante a la izquierda, la grande atrás a la derecha */caja:p=>[[-p.L/2,-p.L/2+p.L*.47,-p.D/2+p.D*.42,p.D/2],[p.L/2-p.L*.58,p.L/2,-p.D/2,-p.D/2+p.D*.71]]},
};
export const fuente=k=>`https://sketchfab.com/3d-models/${MODELOS[k].uid}`;

const BASE={},LOAD={},CRUDO={};
export const modeloListo=k=>!!BASE[k];
/* el GLB tal como viene (se guarda; cada uso lo clona) */
export function cargarCrudo(THREE,k){if(CRUDO[k])return CRUDO[k];
  CRUDO[k]=(async()=>{const [{B64},{GLTFLoader},{MeshoptDecoder}]=await Promise.all([import(`./mueble-${k}.js`),import('three/addons/loaders/GLTFLoader.js'),import('three/addons/libs/meshopt_decoder.module.js')]);
    const bin=Uint8Array.from(atob(B64),c=>c.charCodeAt(0));const L=new GLTFLoader();L.setMeshoptDecoder(MeshoptDecoder);
    const gl=await new Promise((res,rej)=>L.parse(bin.buffer,'',res,rej));return gl.scene;})();
  return CRUDO[k];}
/* Laboratorio de muebles (Maxi 18/10): cada malla se parte en sus piezas sueltas (partes conectadas), con nombre estable
   «p<malla>_<n>» (n = de la más grande a la más chica). La receta de un mueble dice qué piezas se sacan, cómo se gira y qué color lleva cada material. */
export function partir(THREE,root){root.updateMatrixWorld(true);const ms=[];root.traverse(o=>{if(o.isMesh)ms.push(o);});const piezas=[];
  ms.forEach((m,mi)=>{const g=m.geometry,P=g.attributes.position,N=P.count;const I=g.index?g.index.array:Array.from({length:N},(_,i)=>i);const nt=I.length/3;
    g.computeBoundingBox();const bs=g.boundingBox.getSize(new THREE.Vector3());const q=Math.max(bs.x,bs.y,bs.z)*1e-5||1e-6;
    /* vértices soldados por posición (las costuras de UV no cortan una pieza) */const id=new Int32Array(N),mapa=new Map();
    for(let v=0;v<N;v++){const k=Math.round(P.getX(v)/q)+','+Math.round(P.getY(v)/q)+','+Math.round(P.getZ(v)/q);let r=mapa.get(k);if(r==null){r=mapa.size;mapa.set(k,r);}id[v]=r;}
    const par=new Int32Array(mapa.size).map((_,i)=>i);const raiz=x=>{while(par[x]!==x){par[x]=par[par[x]];x=par[x];}return x;};
    for(let t=0;t<nt;t++){const a=raiz(id[I[3*t]]),b=raiz(id[I[3*t+1]]),c=raiz(id[I[3*t+2]]);par[b]=a;par[raiz(c)]=raiz(a);}
    const grupos=new Map();for(let t=0;t<nt;t++){const r=raiz(id[I[3*t]]);let L=grupos.get(r);if(!L){L=[];grupos.set(r,L);}L.push(t);}
    const orden=[...grupos.values()].sort((x,y)=>y.length-x.length);
    if(orden.length===1){m.name=`p${mi}_0`;piezas.push({nombre:m.name,tris:nt,mesh:m});return;}
    const pad=m.parent;orden.forEach((tris,j)=>{const usa=new Map(),idx=[];for(const t of tris)for(let k=0;k<3;k++){const v=I[3*t+k];let n=usa.get(v);if(n==null){n=usa.size;usa.set(v,n);}idx.push(n);}
      const ng=new THREE.BufferGeometry();const get=(at,i,c)=>c===0?at.getX(i):c===1?at.getY(i):c===2?at.getZ(i):at.getW(i);/* con getX… (no el arreglo crudo): los GLB con meshopt traen atributos cuantizados y entrelazados */for(const [nom,at] of Object.entries(g.attributes)){const arr=new Float32Array(usa.size*at.itemSize);for(const [v,n] of usa)for(let c=0;c<at.itemSize;c++)arr[n*at.itemSize+c]=get(at,v,c);ng.setAttribute(nom,new THREE.BufferAttribute(arr,at.itemSize,false));}
      ng.setIndex(idx);const nm=new THREE.Mesh(ng,m.material);nm.name=`p${mi}_${j}`;nm.position.copy(m.position);nm.quaternion.copy(m.quaternion);nm.scale.copy(m.scale);pad.add(nm);piezas.push({nombre:nm.name,tris:tris.length,mesh:nm});});
    pad.remove(m);});
  return piezas;}
/* deja el modelo listo según su receta: saca piezas, gira (de a 90°), espeja, tiñe materiales; después lo centra en planta con la base en 0
   y saca los pisos y sombras planas que traen algunos modelos */
export function prepararModelo(THREE,o,receta){const r=receta||{};const piezas=(r.quitar&&r.quitar.length)||r.partir?partir(THREE,o):[];
  if(r.quitar)for(const pz of piezas)if(r.quitar.includes(pz.nombre))pz.mesh.parent.remove(pz.mesh);
  if(r.mats){const hechos=new Map();o.traverse(m=>{if(!m.isMesh)return;const sw=x=>{const t=x&&r.mats[x.name];if(!t)return x;if(hechos.has(x))return hechos.get(x);const n=x.clone();if(t.color)n.color.set(t.color);if(t.rough!=null)n.roughness=t.rough;if(t.sinTextura){n.map=null;}n.needsUpdate=true;hechos.set(x,n);return n;};m.material=Array.isArray(m.material)?m.material.map(sw):sw(m.material);});}
  const g=new THREE.Group();g.add(o);g.rotation.y=(r.rot||0)*Math.PI/180;if(r.espejo)g.scale.x=-1;g.updateMatrixWorld(true);
  let bb=new THREE.Box3().setFromObject(g),sz=bb.getSize(new THREE.Vector3());const big=Math.max(sz.x,sz.z),fuera=[];
  g.traverse(m=>{if(!m.isMesh)return;const b=new THREE.Box3().setFromObject(m),s=b.getSize(new THREE.Vector3());if(s.y<sz.y*.03&&Math.max(s.x,s.z)>big*.6&&b.min.y<=bb.min.y+sz.y*.03)fuera.push(m);});
  fuera.forEach(m=>m.parent.remove(m));
  bb=new THREE.Box3().setFromObject(g);sz=bb.getSize(new THREE.Vector3());const c=bb.getCenter(new THREE.Vector3());
  g.position.set(-c.x,-bb.min.y,-c.z);
  const w=new THREE.Group();w.add(g);w.userData.nat=sz.clone();
  w.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;m.userData.glb=true;}});return w;}
export function cargarModelo(THREE,k){if(BASE[k])return Promise.resolve(BASE[k]);if(LOAD[k])return LOAD[k];
  LOAD[k]=(async()=>{const crudo=await cargarCrudo(THREE,k);BASE[k]=prepararModelo(THREE,crudo.clone(true),MODELOS[k].receta);return BASE[k];})();
  return LOAD[k];}

/* una copia del modelo, a la medida p (comparte geometrías y texturas con las demás copias) */
/* telas para el tapizado de los modelos que lo permiten (los mismos tonos que el equipamiento) */
export const TELAS={tela:'#8a8f96',lino:'#c9c1b3',grafito:'#3b3e40',petroleo:'#3e5a63',mostaza:'#b88a3a'};
const TAPIZ={};
export function vestirModelo(THREE,k,p){const b=BASE[k],d=MODELOS[k];if(!b)return null;const n=b.userData.nat,o=b.clone(true);
  o.scale.set(p.L/n.x*(p.lado==='der'?-1:1),p.H/n.y,p.D/n.z);
  if(d.tapiz&&TELAS[p.tela])o.traverse(m=>{if(!m.isMesh)return;const sw=x=>{if(!x||!d.tapiz.test(x.name||''))return x;const key=k+'|'+p.tela+'|'+x.uuid;
      return TAPIZ[key]||(TAPIZ[key]=new THREE.MeshStandardMaterial({color:new THREE.Color(TELAS[p.tela]),roughness:.95,metalness:0,normalMap:x.normalMap||null,name:x.name}));};
    m.material=Array.isArray(m.material)?m.material.map(sw):sw(m.material);});
  return o;}

/* entradas para el catálogo de equipamiento: mientras carga, una caja con la planta del mueble */
export function catalogoModelos(THREE){const B=(x0,x1,y0,y1,z0,z1)=>{const g=new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0);g.translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);return g;};
  const P={};for(const [k,d] of Object.entries(MODELOS)){if(d.crudo)continue;/* los que todavía están en el laboratorio no entran al catálogo */P[k]={n:d.n,cat:d.cat,p:{...d.p},glb:k,autor:d.autor,titulo:d.titulo,...(d.ui?{ui:d.ui}:{}),
    g:p=>(d.caja?d.caja(p):[[-p.L/2,p.L/2,-p.D/2,p.D/2]]).map(([x0,x1,z0,z1])=>{const s=p.lado==='der'?-1:1;const a=Math.min(s*x0,s*x1),bx=Math.max(s*x0,s*x1);return [B(a,bx,0,p.H*.7,z0,z1),'tela'];})};}
  return P;}
