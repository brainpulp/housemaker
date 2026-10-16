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

const BASE={},LOAD={};
export const modeloListo=k=>!!BASE[k];
/* carga, saca pisos y sombras planas que traen algunos modelos, y deja el modelo centrado en planta con la base en 0 */
export function cargarModelo(THREE,k){if(BASE[k])return Promise.resolve(BASE[k]);if(LOAD[k])return LOAD[k];
  LOAD[k]=(async()=>{const [{B64},{GLTFLoader},{MeshoptDecoder}]=await Promise.all([import(`./mueble-${k}.js`),import('three/addons/loaders/GLTFLoader.js'),import('three/addons/libs/meshopt_decoder.module.js')]);
    const bin=Uint8Array.from(atob(B64),c=>c.charCodeAt(0));const L=new GLTFLoader();L.setMeshoptDecoder(MeshoptDecoder);
    const gl=await new Promise((res,rej)=>L.parse(bin.buffer,'',res,rej));const o=gl.scene;o.updateMatrixWorld(true);
    let bb=new THREE.Box3().setFromObject(o),sz=bb.getSize(new THREE.Vector3());const big=Math.max(sz.x,sz.z),fuera=[];
    o.traverse(m=>{if(!m.isMesh)return;const b=new THREE.Box3().setFromObject(m),s=b.getSize(new THREE.Vector3());if(s.y<sz.y*.03&&Math.max(s.x,s.z)>big*.6&&b.min.y<=bb.min.y+sz.y*.03)fuera.push(m);});
    fuera.forEach(m=>m.parent.remove(m));
    bb=new THREE.Box3().setFromObject(o);sz=bb.getSize(new THREE.Vector3());const c=bb.getCenter(new THREE.Vector3());
    o.position.x-=c.x;o.position.y-=bb.min.y;o.position.z-=c.z;
    const w=new THREE.Group();w.add(o);w.userData.nat=sz.clone();
    w.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;m.userData.glb=true;}});
    BASE[k]=w;return w;})();
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
  const P={};for(const [k,d] of Object.entries(MODELOS)){P[k]={n:d.n,cat:d.cat,p:{...d.p},glb:k,autor:d.autor,titulo:d.titulo,...(d.ui?{ui:d.ui}:{}),
    g:p=>(d.caja?d.caja(p):[[-p.L/2,p.L/2,-p.D/2,p.D/2]]).map(([x0,x1,z0,z1])=>{const s=p.lado==='der'?-1:1;const a=Math.min(s*x0,s*x1),bx=Math.max(s*x0,s*x1);return [B(a,bx,0,p.H*.7,z0,z1),'tela'];})};}
  return P;}
