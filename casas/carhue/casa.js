/* Carhué 3D — construye las piezas del visor 3D a partir de modelo-carhue.js.
   Marco: X = x del plano (cm), Y = altura (cm), Z = y del plano (cm, crece hacia el jardín). */
import { createVisor, geo } from './visor3d.js';
import { initSenalar } from './senalar.js';
import { initToolbar } from './toolbar.js';
import { initCandado } from './candado.js';
import { initMedir } from './medir.js';
import { initVistasUI } from './vistasui.js';
import { escaleraCompensada } from './escalera.js';
import * as M from './modelo.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as N from './nombres.js';
import { videoHTML } from './video.js';
import { initMarcas } from './marcas.js';
import * as ED from './ediciones.js';
import { initEditor } from './editor3d.js';
import { initRealismo } from './realismo.js';
import { initLuz } from './luz.js';
import { initPersonas } from './personas.js';
import { initEquipamiento } from './equipamiento.js';
import { initArboles } from './arboles.js';
import { initNoche } from './noche.js';
import { initTours } from './tours.js';
import { initCalidad } from './calidad.js';
import { initInspector } from './inspector.js';
import { initSidebar } from './sidebar.js';
import { initEstructura } from './estructura.js';
import { initViewCube } from './viewcube.js';
import { initTermica } from './termica.js';
import { GLB64 } from './casa-carhue-glb.js';
const {THREE,prism,box,rod,box8,f1}=geo;

const H_EP=262;                       // cara superior del piso del entrepiso
const ROOF={ridge:[352,507],front:[738,344],backRaised:[-81,478],backLiving:[-2,255],glass:[[581,407],[941,246]]};
const lin=(p,q,y)=>p[1]+(q[1]-p[1])*(y-p[0])/(q[0]-p[0]);
const wingZ=x=>497-Math.abs(x-2103)*(238/332);
/* dormers (Maxi 14/10): DM-1 y DM-2 al jardín entre cabios dobles de CAB-3 (cada 65 desde x 0,32); DM-3 en el faldón norte del ala */
const DORM_ON=p=>['j','ja','c','ca'].includes(p.dormers),DORM_ALT=p=>p.dormAlt==='1'||['ja','ca'].includes(p.dormers),DORM_Y0=358,DORM_SKIP=p=>['c','ca'].includes(p.dormers)?['LU-1','LU-2']:DORM_ON(p)?['LU-1']:[];
const DORM_J2=[{id:'DM-1',xl:97,xr:357,local:'dormitorio secundario (L-25), en lugar de LU-1'},{id:'DM-2',xl:747,xr:942,local:'dormitorio principal (L-21); 1,8 m para no tocar LU-2'}].map(d=>({...d,xa:d.xl+7.5,xb:d.xr-7.5}));
/* dormer corrido (Maxi 14/10): un solo frente de x 0 (cara de afuera de la pared del fondo M-04, donde apoya su lateral) a 9,42 sobre el dormitorio secundario, el baño y el principal; reemplaza LU-1 y LU-2; el cabezal largo apoya en dos postes sobre los tabiques M-40 y M-41 */
const DORM_C=[{id:'DM-C',xl:0,xr:942,local:'dormitorio secundario, baño y dormitorio principal (corrido, de punta a punta: Maxi 14/10)',ventanas:[[50,380],[430,540],[600,925]],postes:[400,570],integrada:true}].map(d=>({...d,xa:d.xl+7.5,xb:d.xr-7.5}));
const DORM_J_=p=>['c','ca'].includes(p.dormers)?DORM_C:DORM_J2;
/* lucarnas corredizas hacia el costado (Maxi 14/10): cada hoja sube 12 y corre a lo largo del faldón (paralela a la cumbrera) hacia el lado que esté libre.
   Se elige el lado sin chocar otra lucarna (con su hoja corrida), un dormer ni el borde del faldón; si ningún lado tiene lugar, esa lucarna queda corrediza hacia arriba. */
const LU_FRAME=10.5,LU_CARRERA=w=>w+4;
function luLados(M,p){const out={},occ=[];const skip=DORM_SKIP(p);const LUs=M.TECHOS.filter(l=>/^LU-/.test(l.id)&&!skip.includes(l.id));
  if(DORM_ON(p))for(const d of DORM_J_(p))occ.push([d.xl-5,d.xr+5]);
  const fr=l=>{const xs=l.poly.map(q=>q[0]);return [Math.min(...xs)-LU_FRAME,Math.max(...xs)+LU_FRAME];};for(const l of LUs)occ.push(fr(l));
  /* los reflectores del alero van debajo de la chapa (equipamiento los baja solo): no se cruzan con las hojas, que corren por encima */
  const libre=(a,b)=>a>=-35&&b<=2515&&!occ.some(([u,v])=>a<v&&b>u);
  for(const l of LUs){const [a,b]=fr(l),w=LU_CARRERA(b-a);let s=0;if(libre(b+1,b+w+3))s=1;else if(libre(a-w-3,a-1))s=-1;out[l.id]=s;if(s)occ.push(s>0?[b+1,b+w+3]:[a-w-3,a-1]);}
  return out;}
const DORM_A={id:'DM-3',x0:2115,xf:2340,y0:-700,y1:-400};/* 3 m de ancho (Maxi 14/10) */   // techo del ala: cumbrera x 2103 a +4,97, aleros a +2,59
/* altura del techo principal sobre un y de planta, según tramo */
function roofZ(y,x){const [ry,rz]=ROOF.ridge;
  if(y>=ry)return lin(ROOF.ridge,ROOF.front,y);
  return x<1322?lin(ROOF.ridge,ROOF.backRaised,y):lin(ROOF.ridge,ROOF.backLiving,y);}
/* losa inclinada entre dos líneas (y0,z0)→(y1,z1), de x0 a x1, espesor t (vertical) */
const slabY=(x0,x1,[y0,z0],[y1,z1],t)=>box8([[x0,z0,y0],[x1,z0,y0],[x1,z1,y1],[x0,z1,y1],[x0,z0+t,y0],[x1,z0+t,y0],[x1,z1+t,y1],[x0,z1+t,y1]]);
const slabX=(y0,y1,[x0,z0],[x1,z1],t)=>box8([[x0,z0,y0],[x1,z1,y0],[x1,z1,y1],[x0,z0,y1],[x0,z0+t,y0],[x1,z1+t,y0],[x1,z1+t,y1],[x0,z0+t,y1]]);
/* árbol procedural: tronco, ramas recursivas y copa de racimos (determinista, misma forma en cada carga) */
let _hojaTex=null;function hojaTex(){if(_hojaTex)return _hojaTex;const S=256,cv=document.createElement('canvas');cv.width=cv.height=S;const x=cv.getContext('2d');let sd=11;const r=()=>{sd=(sd*1664525+1013904223)%4294967296;return sd/4294967296;};
  /* manojo de hojas: denso en el centro, ralo hacia el borde (el recorte alfa da la silueta) */
  for(let i=0;i<420;i++){const a=r()*Math.PI*2,d=Math.pow(r(),.6)*S*.47,px=S/2+Math.cos(a)*d,py=S/2+Math.sin(a)*d,l=7+r()*9,w=l*(.4+r()*.2),g=150+r()*80|0;
    x.save();x.translate(px,py);x.rotate(r()*Math.PI*2);x.fillStyle=`rgb(${g*.78|0},${g},${g*.62|0})`;x.beginPath();x.ellipse(0,0,l,w,0,0,Math.PI*2);x.fill();x.strokeStyle='rgba(40,60,30,.35)';x.lineWidth=1;x.beginPath();x.moveTo(-l,0);x.lineTo(l,0);x.stroke();x.restore();}
  x.fillStyle='rgb(150,180,120)';x.beginPath();x.arc(S/2,S/2,S*.12,0,Math.PI*2);x.fill();
  const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;_hojaTex=t;return t;}
function arbol(cx,cz,r0,sd=0,lod=false){let seed=7+sd*7919;/* lod: árboles lejanos con menos detalle (fps) */const rnd=()=>{seed=(seed*1664525+1013904223)%4294967296;return seed/4294967296;};
  const ramas=[],hojas=[];const V=THREE.Vector3;
  const seg=(a,b,r)=>{if(lod&&r<4)return;ramas.push(rod([a.x,a.y,a.z],[b.x,b.y,b.z],r,lod?5:8));};
  /* copa: tarjetas de hojas (textura con recorte alfa) mirando hacia afuera, con normales redondeadas desde el centro del manojo, y un núcleo oscuro; barato en triángulos */
  const copa=(pnt,rad)=>{const k=.8+rnd()*.3,nC=lod?6:10,P=[],N=[],U=[],C=[];const hue=rnd()*.08-.04;
    const put=(v,nr,u,w,sh)=>{P.push(v.x,v.y,v.z);N.push(nr.x,nr.y,nr.z);U.push(u,w);C.push((.42+hue)*k*sh,.62*k*sh,(.30-hue)*k*sh);};
    for(let i=0;i<nC;i++){const u=rnd()*2-1,th=rnd()*Math.PI*2,s=Math.sqrt(1-u*u);const d=new V(s*Math.cos(th),u*.75+.2,s*Math.sin(th)).normalize();
      const c=pnt.clone().addScaledVector(d,rad*(.3+rnd()*.45)),sz=rad*(.95+rnd()*.55);
      const nr=d.clone().add(new V(rnd()-.5,rnd()-.5,rnd()-.5).multiplyScalar(.8)).normalize();
      let t1=new V().crossVectors(nr,Math.abs(nr.y)<.9?new V(0,1,0):new V(1,0,0)).normalize();const a=rnd()*Math.PI*2,t2b=new V().crossVectors(nr,t1);t1=t1.multiplyScalar(Math.cos(a)).addScaledVector(t2b,Math.sin(a));const t2=new V().crossVectors(nr,t1);
      const cs=[[-1,-1,0,0],[1,-1,1,0],[1,1,1,1],[-1,-1,0,0],[1,1,1,1],[-1,1,0,1]];
      for(const [a1,a2,uu,ww] of cs){const v=c.clone().addScaledVector(t1,a1*sz/2).addScaledVector(t2,a2*sz/2);const r=v.clone().sub(pnt);const nv=r.clone().normalize().add(new V(0,.35,0)).normalize();
        const sh=.62+.38*Math.min(1,Math.max(0,(r.y/rad+.9)/1.6));put(v,nv,uu,ww,sh);}}
    const core=new THREE.IcosahedronGeometry(rad*.55,0);core.translate(pnt.x,pnt.y,pnt.z);const cp=core.attributes.position;
    for(let i=0;i<cp.count;i++){const v=new V().fromBufferAttribute(cp,i);const nv=v.clone().sub(pnt).normalize();put(v,nv,.5,.5,.5);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));hojas.push(g);};
  const rama=(p,dir,len,r,depth)=>{const q=p.clone().addScaledVector(dir,len);if(len>0)seg(p,q,r);
    if(depth>=(lod?3:4)||r<3){copa(q,70+rnd()*60);copa(q.clone().addScaledVector(dir,-len*.3).add(new V(rnd()*60-30,-30-rnd()*50,rnd()*60-30)),60+rnd()*50);return;}
    if(depth>=2&&rnd()<.6)copa(q.clone().add(new V(rnd()*40-20,-20,rnd()*40-20)),55+rnd()*45);
    const n=depth===0?4:2+(rnd()<.5?1:0);for(let i=0;i<n;i++){const yaw=(i/n)*Math.PI*2+rnd()*1.2,pitch=depth===0?.55+rnd()*.35:.25+rnd()*.5;
      const d=new V(Math.cos(yaw)*Math.cos(pitch),Math.sin(pitch),Math.sin(yaw)*Math.cos(pitch)).lerp(dir,.35).normalize();
      rama(q,d,(depth===0?300:len)*(.62+rnd()*.18)*(depth===0?1.4:1),r*(.6+rnd()*.1),depth+1);}};
  const base=new V(cx,0,cz),top=new V(cx+12,420,cz-8);seg(base,top,r0);seg(base,base.clone().setY(40),r0*1.25);
  rama(top,new V(.05,1,-.03).normalize(),0,r0*.95,0);return {ramas,hojas};}
/* muro con aberturas: cajas a lo largo del eje, dintel y antepecho */
function wallGeos(m,top,topFn){const [ax,ay]=m.a,[bx,by]=m.b;const horiz=Math.abs(bx-ax)>=Math.abs(by-ay);const L=horiz?bx-ax:by-ay;const e=m.e;
  const seg=(d0,d1,z0,z1)=>{if(!(topFn&&z1===top))return horiz?box(ax+d0,ax+d1,z0,z1,ay-e/2,ay+e/2):box(ax-e/2,ax+e/2,z0,z1,ay+d0,ay+d1);
    const c=horiz?[[ax+d0,ay-e/2],[ax+d1,ay-e/2],[ax+d1,ay+e/2],[ax+d0,ay+e/2]]:[[ax-e/2,ay+d0],[ax+e/2,ay+d0],[ax+e/2,ay+d1],[ax-e/2,ay+d1]];
    return box8([...c.map(([x,y])=>[x,z0,y]),...c.map(([x,y])=>[x,topFn(x,y),y])]);};
  const ops=M.ABERTURAS.filter(a=>a.muro===m.id).sort((p,q)=>p.d-q.d);const g=[];let cur=0;
  const D0=m._d0||0;for(const a0 of ops){const a={...a0,d:a0.d-D0};if(a.d>cur)g.push(seg(cur,a.d,0,top));const s=a.s||0,h=Math.min(top,s+a.h);
    if(s>0)g.push(seg(a.d,a.d+a.w,0,s));if(h<top)g.push(seg(a.d,a.d+a.w,h,top));cur=a.d+a.w;}
  if(cur<L)g.push(seg(cur,L,0,top));return g;}
const H_BAJO_EP=240;   // tope de los muros de PB bajo el entrepiso: debajo de los tirantes (240–260) y el piso de 20 mm (260–262)
const WALL_TOP={'M-01':H_BAJO_EP,'M-02':255,'M-03':255,'M-05':261,'M-27':362,'M-06':362,'M-07':260,'M-11':H_BAJO_EP,'M-12':H_BAJO_EP,'M-13':H_BAJO_EP,'M-14':H_BAJO_EP,'M-15':H_BAJO_EP,'M-16':H_BAJO_EP,'M-17':260,'M-20':292,'M-22':302,'M-34':420,'M-26':335};
const NIV={PB:'Planta baja',EP:'Entrepiso',TE:'Techos'};

const params=[
  {id:'techos',label:'Techos',type:'check',value:true,quick:true,group:'Ver'},
  {id:'ep',label:'Entrepiso',type:'check',value:true,quick:true,group:'Ver'},
  {id:'calco',label:'Calco GLB',type:'check',value:false,quick:true,group:'Ver',help:'Tu modelo de Onshape, en gris transparente, superpuesto al mío.'},
  {id:'ext',label:'Deck, pileta y árbol',type:'check',value:true,quick:true,group:'Ver'},
  {id:'equip',label:'Equipamiento (escenarios)',type:'check',value:true,quick:true,group:'Ver'},
  {id:'escB2k',label:'B2 escalones arriba',type:'select',value:'7',quick:true,showIf:P=>P.escAlt==='B2',group:'Ver',options:[['2','2'],['3','3'],['4','4'],['5','5'],['6','6'],['7','7']],help:'Cuántas alzadas baja el puentecito respecto de la puerta.'},
  {id:'escAlt',label:'Escalera al altillo',type:'select',value:'B3',quick:true,group:'Ver',options:[['0','Altillo: sin escalera'],['A','Altillo A · paso alternado'],['D','Altillo D · de barco 60°'],['E','Altillo E · recta 40°'],['B2','Altillo B2 · recta contra M-22 + puentecito más bajo'],['B3','Altillo B3 · como B2, más empinada y puentecito más largo'],['S','Altillo S · caracol bajo la cumbrera']],help:'Escaleras al altillo por la puerta P-34. Todas salen derecho bajo la cumbrera: es la única franja con altura libre.'},
  {id:'ventJ',label:'Ventanas al jardín (P-05, P-06)',type:'select',value:'proy',quick:true,group:'Ver',options:[['proy','Proyectante (una hoja)'],['pleg','Plegable tipo garage (dos hojas)'],['barn','Corrediza de vidrio tipo granero']]},
  {id:'p26',label:'Puerta del baño piletero',type:'select',value:'m26',quick:true,group:'Ver',options:[['m26','P-26 en M-26 (desde la cocina norte)'],['m24','P-26 en M-24, lado este (desde la cocina)']]},
  {id:'ventV7',label:'Ventana V-07',type:'select',value:'proy',quick:true,group:'Ver',options:[['proy','V-07 proyectante (una hoja)'],['pleg','V-07 plegable tipo garage'],['barn','V-07 corrediza tipo granero']]},
  {id:'p03Est',label:'Puerta al patio',type:'select',value:'tablas',quick:true,group:'Ver',options:[['tablas','Tablas verticales'],['hierro','Hierro y vidrio entero'],['kumiko','Kumiko japonés con washi'],['chapa','Chapa óxido con tajos'],['ojo','Maciza con ojo de buey'],['listonH','Listones horizontales']]},
  {id:'m43Est',label:'Hojas de M-43',type:'select',value:'lisa',quick:true,group:'Ver',options:[['lisa','Lisa (fenólico)'],['shoji','Japonesa (shoji)'],['tubo','Tubo cuadrado y vidrio esmerilado'],['listones','Listones verticales']]},
  {id:'escTipo',label:'Escalera al entrepiso',type:'select',value:'p',quick:true,group:'Ver',options:[['p','Variable'],['orig','Compensada original (fija)']]},
  {id:'escN',label:'Alzadas',type:'number',slider:true,value:15,min:13,max:17,step:1,quick:true,showIf:P=>P.escTipo!=='orig',group:'Ver',help:'Cantidad de alzadas hasta el piso del entrepiso (+2,62).'},
  {id:'escAlto',label:'Pedadas arriba',type:'number',slider:true,value:9,min:1,max:15,step:1,quick:true,showIf:P=>P.escTipo!=='orig',group:'Ver',help:'Pedadas del tramo que llega al entrepiso; las que sobran van abajo del giro. Fija dónde cae el giro.'},
  {id:'escDy',label:'Corrimiento este–oeste',type:'number',slider:true,value:0,min:-120,max:120,step:1,unit:'cm',quick:true,showIf:P=>P.escTipo!=='orig',group:'Ver',help:'Corre toda la escalera hacia el jardín (+) o hacia el patio (−); el borde del entrepiso la acompaña.'},
  {id:'escGiro',label:'Giro',type:'select',value:'comp',quick:true,showIf:P=>P.escTipo!=='orig',group:'Ver',options:[['comp','2 compensadas'],['desc','Descanso'],['recto','Sin giro']]},
  {id:'dormers',label:'Dormers',type:'select',value:'0',quick:true,group:'Ver',options:[['0','Sin dormers (lucarnas)'],['j','Dos dormers al jardín'],['c','Dormer corrido (dormitorios + baño)']],help:'Dormers de un agua (Maxi 14/10): dos al jardín al ras de la fachada (DM-1 en el dormitorio secundario, en lugar de LU-1; DM-2 en el dormitorio principal) y uno en el altillo hacia el norte (la pileta).'},
  {id:'dormAlt',label:'Dormer del altillo',type:'select',value:'0',quick:true,group:'Ver',options:[['0','Sin dormer (techo a dos aguas)'],['1','Dormer de una agua a la pileta (3 m)']],help:'DM-3: en el faldón norte del ala, hacia la pileta (Maxi 14/10).'},
  {id:'luTipo',label:'Lucarnas',type:'select',value:'1',quick:true,group:'Ver',options:[['1','Una hoja'],['2','Dos hojas plegables (tipo garage)'],['3','Corrediza hacia arriba (una hoja)'],['4','Corrediza hacia el costado (una hoja)']],help:'Marco móvil de una pieza que gira sobre el borde de arriba, o partido en dos hojas que se pliegan.'},
  {id:'escB3G',label:'B3 huella',type:'number',slider:true,value:20,min:16,max:26,step:1,unit:'cm',quick:true,showIf:P=>P.escAlt==='B3',group:'Ver',help:'Profundidad de cada escalón del tramo recto. Menos = más empinada.'},
  {id:'escB3n',label:'B3 alzadas',type:'number',slider:true,value:14,min:12,max:16,step:1,quick:true,showIf:P=>P.escAlt==='B3',group:'Ver',help:'Cantidad total de alzadas hasta +2,62.'},
  {id:'escB3k',label:'B3 escalones arriba',type:'number',slider:true,value:5,min:1,max:7,step:1,quick:true,showIf:P=>P.escAlt==='B3',group:'Ver',help:'Alzadas del puentecito a la puerta. Menos = puentecito más alto y más largo (y menos altura libre en el rincón).'},
  {id:'corte',label:'Corte horizontal',type:'select',value:'0',quick:true,group:'Ver',options:[['0','Sin corte'],['120','a +1,20 (planta baja)'],['400','a +4,00 (entrepiso)'],['270','a +2,70 (bajo el techo)']],help:'Saca todo lo que está por encima de esa altura, como una planta.'},
];

function build(p){
  /* Maxi 15/10: opción de diseño para la puerta del baño piletero P-26: en M-26 (desde la cocina norte, como está) o en el tramo este de M-24 (desde la cocina, frente al baño) */
  {const a=M.ABERTURAS.find(o=>o.id==='P-26');if(a){if(!a._orig)a._orig={muro:a.muro,d:a.d,w:a.w};Object.assign(a,p.p26==='m24'?{muro:'M-24',d:134,w:78,_var:'m24'}:{...a._orig,_var:''});}}
  const parts=[];const Pt=(id,name,cat,geos,info,ex={})=>{const al=N.alias(id);parts.push({id,name:al?`${id} · ${al}`:name,alias:al,cat,geos:[].concat(geos),info:{...info,fn:(N.nota(id)?`<b>Tu nota:</b> ${N.nota(id)}<br>`:'')+(info.fn||'')},...ex});};
  const ex=d=>({group:d.nivel?NIV[d.nivel]:undefined,opt:{op:d.estado==='proyecto'?.35:d.estado==='demoler'?.45:undefined}});
  const base=d=>({fn:d.nota||'',sec:'',med:'',u:[...M.DUDAS.filter(x=>x.ref.includes(d.id)).map(x=>x.id)].join(' · ')||''});

  /* muros */
  /* esquinas limpias: cada punta de muro se recorta contra la cara del muro que toca (unión en T) o, en esquina,
     el más grueso (o el que corre en x, si son iguales) llega hasta la cara exterior y el otro se recorta */
  const ADJ=new Map();{const W=M.MUROS.filter(w=>w.tipo!=='vidrio'&&w.tipo!=='corrediza'&&w.a&&w.b);
    const geo=w=>{const L=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]);const u=[(w.b[0]-w.a[0])/L,(w.b[1]-w.a[1])/L];return {L,u,n:[-u[1],u[0]]};};
    for(const w of W){const G=geo(w);let a=[...w.a],b=[...w.b],d0=0;
      for(const end of ['a','b']){const P=w[end],wo=end==='a'?[-G.u[0],-G.u[1]]:G.u;
        for(const v of W){if(v===w||v.nivel!==w.nivel)continue;const H=geo(v);if(Math.abs(G.u[0]*H.u[0]+G.u[1]*H.u[1])>.9)continue;
          const rel=[P[0]-v.a[0],P[1]-v.a[1]],t=rel[0]*H.u[0]+rel[1]*H.u[1],dp=rel[0]*H.n[0]+rel[1]*H.n[1];
          if(Math.abs(dp)>v.e/2+1||t<-v.e/2-1||t>H.L+v.e/2+1)continue;const wn=wo[0]*H.n[0]+wo[1]*H.n[1];if(Math.abs(wn)<.3)continue;const sg=Math.sign(wn);
          const interior=t>v.e/2+1&&t<H.L-v.e/2-1;const gana=!interior&&(w.e>v.e+.5||(Math.abs(w.e-v.e)<=.5&&Math.abs(G.u[0])>=Math.abs(G.u[1])));
          const k=((gana?sg:-sg)*v.e/2-dp)/wn;if(end==='a'){a=[P[0]+wo[0]*k,P[1]+wo[1]*k];d0=-k;}else b=[P[0]+wo[0]*k,P[1]+wo[1]*k];break;}}
      if(a[0]!==w.a[0]||a[1]!==w.a[1]||b[0]!==w.b[0]||b[1]!==w.b[1])ADJ.set(w.id,{...w,a,b,_d0:d0});}}
  for(const m0 of M.MUROS){const m=ADJ.get(m0.id)||m0;if(m.nivel==='EP'&&!p.ep)continue;
    let top=m.top??WALL_TOP[m.id]??(m.nivel==='EP'?420:H_EP);let g;
    if(m.id==='M-04'){const ya=m.a[1],yb=m.b[1],yo=ya-(m._d0||0);const sh=new THREE.Shape([[ya,0],[yb,0],[yb,roofZ(yb,0)],[352,507],[yo,roofZ(yo,0)],[yo,H_BAJO_EP],[ya,H_BAJO_EP]].map(q=>new THREE.Vector2(q[0],q[1])));
      /* huecos de las aberturas de M-04 (V-04) atraviesan el muro */
      for(const a of M.ABERTURAS.filter(a=>a.muro==='M-04')){const y0=ya+a.d-(m._d0||0),y1=y0+a.w,z0=a.s||0,z1=z0+a.h;const tz=y=>a.techo?roofZ(y,0)-a.techo:z1;const top=[[y1,tz(y1)],...(a.techo&&y0<352&&y1>352?[[352,507-a.techo]]:[]),[y0,tz(y0)]];sh.holes.push(new THREE.Path([[y0,z0],[y1,z0],...top].reverse().map(q=>new THREE.Vector2(q[0],q[1]))));}
      g=[geo.mapGeo(new THREE.ExtrudeGeometry(sh,{depth:35,bevelEnabled:false,curveSegments:1}),(u,v,w)=>[35-w,v,u])];}
    else if(m.id==='M-21'){/* Maxi 14/10: de ladrillo hasta el piso del altillo; arriba el hastial es una cercha de madera vidriada */
      const zf=H_EP,e1=Math.max(zf+1,wingZ(1800)-4),e2=Math.max(zf+1,wingZ(2400)-4),R=[2103,493];
      g=[prism([[1800,0],[2400,0],[2400,zf],[1800,zf]],-792,-757,'XY')];
      if(p.ep!==false){const bar=(a,b,t)=>{const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),nx=dz/L*t,nz=-dx/L*t;return prism([a,b,[b[0]+nx,b[1]+nz],[a[0]+nx,a[1]+nz]],-784,-766,'XY');};
        const zb=zf+15,mid=(a,b,u)=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u];const pL=mid([1800,e1],R,.5),pR=mid(R,[2400,e2],.5);
        const cr=[bar([1800,zb],[2400,zb],15),bar([1800,e1],R,15),bar(R,[2400,e2],15),bar([2099,zb],[2099,R[1]-14],-8),bar([2099,zb],[pL[0]+6,pL[1]-14],-8),bar([2107,zb],[pR[0]-6,pR[1]-14],8)];
        Pt('M-21c','M-21 · cercha del hastial','madera',cr,{fn:'Cercha de madera del hastial oeste del altillo: tirante de 7,5 × 15 sobre el muro, pares bajo el techo, pendolón en la cumbrera y dos tornapuntas; los paños entre barras son de vidrio.',sec:'madera 7,5 × 15 (pares y tirante), 8 × 15 (pendolón y tornapuntas)'},{group:'Entrepiso',tags:['EP','M-21']});
        Pt('M-21v','M-21 · hastial vidriado','glass',[prism([[1800,zf],[2400,zf],[2400,e2],R,[1800,e1]],-775.6,-774.4,'XY')],{fn:'Vidrio del hastial oeste del altillo, entre las barras de la cercha.'},{group:'Entrepiso',tags:['EP','M-21'],opt:{noEdges:true}});}}
    else if(m.id==='M-06'){g=wallGeos(m,top,(x,y)=>lin(ROOF.ridge,ROOF.front,y)-6);}
    else if(m.id==='M-26'){/* una sola pieza: contorno con escotaduras abajo (A-30, P-26) y arriba (P-34), huecos para lo demás; tope plano a +3,35 recortado por el techo */
      top=335;const [ax,ay]=m.a,[bx]=m.b,e=m.e,TOP=335,rz=x=>Math.min(TOP,wingZ(x)-4),xa=2103-(497-4-TOP)/(238/332),xb=2103+(497-4-TOP)/(238/332);
      const ax0=ax-(m._d0||0);const ops=M.ABERTURAS.filter(o=>o.muro===m.id).map(o=>({x0:ax0+o.d,x1:ax0+o.d+o.w,z0:o.s||0,z1:(o.s||0)+o.h})).sort((p,q)=>p.x0-q.x0);
      const bot=ops.filter(o=>o.z0<=0),upp=ops.filter(o=>o.z0>0&&o.z1>=TOP),mid=ops.filter(o=>o.z0>0&&o.z1<TOP);
      const pts=[[ax,0]];for(const o of bot)pts.push([o.x0,0],[o.x0,o.z1],[o.x1,o.z1],[o.x1,0]);pts.push([bx,0],[bx,rz(bx)]);
      const tops=[xa,xb,...upp.flatMap(o=>[o.x0,o.x1])].filter(x=>x>ax&&x<bx).sort((p,q)=>q-p);
      for(const x of tops){const u=upp.find(o=>o.x1===x),d=upp.find(o=>o.x0===x);if(u)pts.push([x,rz(x)],[x,u.z0]);else if(d)pts.push([x,d.z0],[x,rz(x)]);else pts.push([x,rz(x)]);}
      pts.push([ax,rz(ax)]);const sh=new THREE.Shape(pts.map(q=>new THREE.Vector2(q[0],q[1])));
      for(const o of mid)sh.holes.push(new THREE.Path([[o.x0,o.z0],[o.x0,o.z1],[o.x1,o.z1],[o.x1,o.z0]].map(q=>new THREE.Vector2(q[0],q[1]))));
      g=[geo.mapGeo(new THREE.ExtrudeGeometry(sh,{depth:e,bevelEnabled:false,curveSegments:1}),(u,v,w)=>[u,v,ay-e/2+w])];}
    else if(m.id==='M-20'||m.id==='M-22'){top=wingZ(m.a[0]);g=wallGeos(m,top,(x,y)=>wingZ(x)-4);}
    else if(m.id==='M-10'){g=[box(2511,2531,241,261,8,937),box(2511,2531,0,3,8,937),prism([[8,261],[937,261],[937,246],[738,344],[352,507],[8,262]],2515,2527,'ZY')];}
    else if(m.id==='M-09'){/* sólo los rieles del retorno (Maxi: no es un muro): abajo a ras del piso y arriba sobre los paños */g=[box(1329,1342,0,1.5,638.5,918.5),box(1329,1342,241,244,638.5,918.5)];}
    else if(m.id==='M-35'){g=[box(0,1323,388,472,-91,-77)];}
    else if(m.id==='M-43'){const lu4=M.TECHOS.find(t=>t.id==='LU-4'),DXH=lu4?Math.min(...lu4.poly.map(q=>q[0]))-(m.a[0]+1):0,x0=m.a[0]+DXH,HT=472,/* toda la corrediza (4 hojas, riel y relleno) cae donde empieza la lucarna LU-4 (Maxi) */u2=y=>468+(y+46)*(27/397),u3=y=>490-(y-352)*(140/332),under=y=>y<352?u2(y):u3(y),hp=y=>Math.min(HT,under(y))-1;
      const Y0=27,W=(625-27)/4/* arranca en la cara de M-42, no adentro (Maxi 15/10) */,yC=352+(490-HT)/(140/332);
      const quad=(xa,xb,a0,a1,z0f,z1f)=>box8([[xa,z0f(a0),a0],[xb,z0f(a0),a0],[xb,z0f(a1),a1],[xa,z0f(a1),a1],[xa,z1f(a0),a0],[xb,z1f(a0),a0],[xb,z1f(a1),a1],[xa,z1f(a1),a1]]);
      /* riel horizontal a +4,72 y relleno fijo entre el riel y el techo */
      const tr=[box(x0-25,x0+3,HT,HT+5,Y0,yC)],inf=[];const y86=-46+(HT+5-468)*(397/27),yB=352+(490-(HT+5))/(140/332);
      inf.push(quad(x0-1.5,x0+1.5,y86,352,()=>HT+5,y=>under(y)),quad(x0-1.5,x0+1.5,352,yB,()=>HT+5,y=>under(y)));
      Pt(m.id,`${m.id} · ${m.nombre}`,'madera',[...tr,...inf],{...base(m),sec:'riel horizontal a +4,72 y relleno fijo hasta el techo',med:`4 hojas H-1…H-4 · ancho ${f1(W/100)} m c/u`},{...ex(m),tags:[m.nivel,'muros'],group:'Entrepiso'});
            /* Estética de las hojas (variantes, Maxi 13/10): lisa, japonesa (shoji), tubo cuadrado con vidrio esmerilado, listones verticales */
      const EST=p.m43Est||'lisa',ZOC=6,z0=H_EP+1+ZOC;/* las hojas arrancan sobre un zócalo de aluminio de 6 que lleva ruedas, poleas y cable (Maxi 14/10) */
      const Q=(xa,xb,a0,a1,zb,zt)=>{const c=[a0,...(a0<yC&&a1>yC?[yC]:[]),a1],r=[];for(let k=0;k<c.length-1;k++)r.push(quad(xa,xb,c[k],c[k+1],zb,zt));return r;};
      const spans=(ya,yb,zh)=>{/* tramos de y donde la hoja llega por encima de zh */const r=[];let st=null;for(let y=ya;y<=yb+.01;y+=2){const ok=hp(Math.min(y,yb))>=zh;if(ok&&st==null)st=y;if((!ok||y>=yb)&&st!=null){r.push([st,Math.min(y,yb)]);st=null;}}if(st!=null)r.push([st,yb]);return r.filter(q=>q[1]-q[0]>3);};
      const hRail=(xa,xb,ya,yb,zh,t)=>spans(ya,yb,zh+t).flatMap(([a,b])=>Q(xa,xb,a,b,()=>zh,()=>zh+t));
      const vBar=(xa,xb,y1,y2,zb)=>Q(xa,xb,y1,y2,()=>zb,hp);
      const leafGeo=(xa,xb,ya,yb)=>{const xm=(xa+xb)/2,fr=[],fi=[];
        if(EST==='shoji'){const f=4.5,kh=16;/* bastidor, zócalo de madera (koshi-ita), kumiko cada ~25 × 30 y papel washi */
          fr.push(...vBar(xa,xb,ya,ya+f,z0),...vBar(xa,xb,yb-f,yb,z0),...Q(xa,xb,ya+f,yb-f,()=>z0,()=>z0+kh),...Q(xa,xb,ya+f,yb-f,y=>hp(y)-f,hp));
          const nv=Math.max(2,Math.round((yb-ya-2*f)/25));for(let k=1;k<nv;k++){const y=ya+f+(yb-ya-2*f)*k/nv;fr.push(...Q(xm-.8,xm+.8,y-.7,y+.7,()=>z0+kh,y2=>hp(y2)-f));}
          for(let zh=z0+kh+30;zh<z0+400;zh+=30)fr.push(...hRail(xm-.8,xm+.8,ya+f,yb-f,zh,1.4).filter(()=>true));
          fi.push(...Q(xm-.15,xm+.15,ya+f,yb-f,()=>z0+kh,y=>hp(y)-f));return {fr,fi,cat:'washi',op:.72,frCat:'madera',sec:'shoji: bastidor de madera 4,5, kumiko de 1,4 cada ~25 × 30, papel washi; zócalo de madera de 16'};}
        if(EST==='tubo'){const f=4;/* tubo de 4 × 4 negro, dos travesaños, vidrio esmerilado */
          fr.push(...vBar(xa,xb,ya,ya+f,z0),...vBar(xa,xb,yb-f,yb,z0),...Q(xa,xb,ya+f,yb-f,()=>z0,()=>z0+f),...Q(xa,xb,ya+f,yb-f,y=>hp(y)-f,hp));
          for(const zh of [z0+70,z0+140])fr.push(...hRail(xa,xb,ya+f,yb-f,zh,f));
          fi.push(...Q(xm-.3,xm+.3,ya+f,yb-f,()=>z0+f,y=>hp(y)-f));return {fr,fi,cat:'esmerilado',op:.6,frCat:'acero',sec:'tubo cuadrado de 40 × 40 negro, vidrio esmerilado de 5 mm'};}
        if(EST==='listones'){const r=6,sw=4,gp=3;/* listones verticales de 4 con luz de 3 entre travesaños de 6: se ve a través */
          fr.push(...Q(xa,xb,ya,yb,()=>z0,()=>z0+r),...Q(xa,xb,ya,yb,y=>hp(y)-r,hp));
          for(let y=ya;y+sw<=yb+.01;y+=sw+gp)fr.push(...Q(xa,xb,y,y+sw,()=>z0+r,y2=>hp(y2)-r));return {fr,fi,cat:'madera',op:1,frCat:'madera',sec:'listones verticales de 4 con luz de 3, travesaños de 6'};}
        /* lisa: placa doble hueca (torsion box): dos caras de fenólico de 6 sobre bastidor y nido de abeja de 38 = 5 cm; ~11 kg/m², no se tuerce como una placa maciza de 3 */
        fr.push(...Q(xa,xb,ya,yb,()=>z0,hp));const tir=n=>[];return {fr,fi,cat:'madera',op:1,frCat:'madera',sec:'placa doble hueca de 5 cm: caras de fenólico de 6 mm sobre bastidor perimetral y nido de abeja de 38 (~11 kg/m², ~35 kg por hoja)'};};
      for(let n=1;n<=4;n++){const ya=Y0+(4-n)*W-(n<4?4:0),yb=Y0+(5-n)*W,xa=x0-22+(4-n)*6,xb=xa+5,o=HOJAS['H-'+n]||0;const L=leafGeo(xa,xb,ya,yb);
        L.fr.forEach(q=>q.translate(0,0,o));L.fi.forEach(q=>q.translate(0,0,o));
        Pt('H-'+n,`H-${n} · Hoja ${n} de M-43${n===4?' (fija)':''}`,L.frCat,L.fr,{fn:n===4?'Hoja fija, contra la galería; las otras tres se apilan sobre ella.':`Hoja corrediza ${n}: arrastrala hacia la galería para abrir; las tres corredizas se mueven juntas (corrida ${f1(-o/100)} m).`,sec:L.sec,med:`${f1(W/100)} m de ancho · ${n<=2?'tope siguiendo el techo hasta +4,72':'tope horizontal +4,72'}`},{group:'Entrepiso',tags:['EP','M-43']});
        if(L.fi.length)Pt('H-'+n+'v',`H-${n} · ${L.cat==='washi'?'papel washi':'vidrio esmerilado'}`,L.cat,L.fi,{fn:'Relleno translúcido de la hoja.'},{group:'Entrepiso',tags:['EP','M-43'],opt:{op:L.op,noEdges:true}});}
      /* Herrajes (Maxi 13/10, rehecho 14/10 «de vanguardia, sutil y con detalle»): telescópica sincronizada que rueda abajo.
         - Abajo: un riel de acero inoxidable embutido al ras por hoja (se ve sólo una ranura de 1,2). Cada hoja apoya en dos carros
           con ruedas de poliamida dentro de su zócalo: un perfil de aluminio anodizado bronce de 6 de alto, del espesor de la hoja.
         - Sincronismo: en el zócalo de H-3 y de H-2 hay dos poleas de acero pulido Ø5 con rulemán; un cable de acero de 2 mm forrado
           va de la hoja de atrás a la de adelante pasando por ellas (H-3: de H-4 a H-2; H-2: de H-3 a H-1). Cada hoja corre lo mismo
           respecto de la de atrás: H-3 1×, H-2 2×, H-1 3×. El zócalo tiene una ventana de 2,5 a lo largo en las dos caras:
           se ven pasar las poleas y el cable (el único gesto visible del mecanismo).
         - Arriba: perfil U de aluminio embutido en el cabezal, con rodillos guía en el canto de la hoja (sin peso).
         - Amortiguadores de cierre suave en los dos extremos de cada riel y tope de goma; el tirador de H-1 es un canal vertical fresado en el canto. */
      {const rl=[],gd=[],pl=[],cb=[],zc=[],am=[];const T5=5,xp=n=>x0-22+(4-n)*6+T5/2,yS=Y0-2,off=n=>n===4?0:(HOJAS['H-'+n]||0),ya=n=>Y0+(4-n)*W-(n<4?4:0)+off(n),yb=n=>Y0+(5-n)*W+off(n);
        const zb=H_EP+1,zM=zb+3.4;/* altura del eje de poleas, en la ventana del zócalo */
        for(const n of [1,2,3]){rl.push(box(xp(n)-.6,xp(n)+.6,H_EP-1.5,H_EP+.05,yS,625));gd.push(box(xp(n)-1,xp(n)+1,HT-.6,HT,Y0,yC));
          for(const y of [Y0+4,621])am.push(rod([xp(n),H_EP+1.6,y-3],[xp(n),H_EP+1.6,y+3],.9,10));}
        /* zócalos: base + dos labios por cara, con ventana entre zb+2 y zb+4,5 */
        for(let n=1;n<=4;n++){const xa=xp(n)-T5/2,xb=xp(n)+T5/2,y0=ya(n),y1=yb(n);
          zc.push(box(xa,xb,zb,zb+1.2,y0,y1),box(xa,xb,zb+4.8,zb+ZOC,y0,y1));for(const [u0,u1] of [[xa,xa+.3],[xb-.3,xb]])zc.push(box(u0,u1,zb+1.2,zb+2,y0,y1),box(u0,u1,zb+4.4,zb+4.8,y0,y1));
          for(const y of [y0+3,y1-3])zc.push(box(xa+.3,xb-.3,zb+1.2,zb+4.8,y-1.5,y+1.5));}
        for(const n of [3,2]){for(const y of [ya(n)+8,yb(n)-8]){pl.push(rod([xp(n)-1.2,zM,y],[xp(n)+1.2,zM,y],2.5,24),rod([xp(n)-1.6,zM,y],[xp(n)+1.6,zM,y],.6,10));}
          const a=n===3?4:3,b=n===3?2:1,r=1.15;
          cb.push(rod([xp(n),zM+r,yb(a)-8],[xp(n),zM+r,ya(n)+8],.1,5),rod([xp(n),zM-r,ya(n)+8],[xp(n),zM-r,ya(b)+8],.1,5),
                  rod([xp(n),zM-r,ya(a)+8],[xp(n),zM-r,yb(n)-8],.1,5),rod([xp(n),zM+r,yb(n)-8],[xp(n),zM+r,yb(b)-8],.1,5));}
        /* tirador de H-1: canal fresado en el canto de cierre */
        const xa1=xp(1)-T5/2,yb1=yb(1);zc.push(box(xa1+1.4,xa1+3.6,zb+90,zb+150,yb1-.3,yb1+.01));
        Pt('M-43r','M-43 · rieles, guías y amortiguadores','acero',[...rl,...gd,...am],{fn:'Riel de inoxidable embutido al ras del piso por hoja (sólo se ve la ranura de 1,2), perfil U embutido en el cabezal como guía de arriba, y amortiguadores de cierre suave en los dos extremos de cada riel.',sec:'riel inoxidable embutido · guía U de aluminio · amortiguadores de cierre suave'},{group:'Entrepiso',tags:['EP','M-43']});
        Pt('M-43z','M-43 · zócalos de las hojas','chapa',zc,{fn:'Zócalo de aluminio anodizado bronce de 6 × 5 en cada hoja: guarda los carros, las poleas y el cable; una ventana de 2,5 a lo largo deja ver el mecanismo. En H-1, el tirador fresado en el canto.',sec:'aluminio anodizado bronce'},{group:'Entrepiso',tags:['EP','M-43']});
        Pt('M-43p','M-43 · poleas y cable','acero',[...pl,...cb],{fn:'Sincronismo telescópico: dos poleas Ø5 de acero pulido con rulemán en los zócalos de H-3 y H-2, y cable de 2 mm forrado atado a la hoja de atrás y a la de adelante. Se ven por la ventana del zócalo.',sec:'poleas Ø5 pulidas · cable Ø2 mm'},{group:'Entrepiso',tags:['EP','M-43']});}
      top=HT;continue;}
    else if(m.nivel==='EP'){const rt=(x,y)=>Math.min(roofZ(y,x),m.top??999)-H_EP;const vert=Math.abs(m.b[1]-m.a[1])>Math.abs(m.b[0]-m.a[0]);const ry=ROOF.ridge[0];
      const hasOp=M.ABERTURAS.some(a=>a.muro===m.id);let parts=[m];
      if(vert&&!hasOp&&Math.min(m.a[1],m.b[1])<ry&&Math.max(m.a[1],m.b[1])>ry)parts=[{...m,b:[m.a[0]+(m.b[0]-m.a[0])*(ry-m.a[1])/(m.b[1]-m.a[1]),ry]},{...m,a:[m.a[0]+(m.b[0]-m.a[0])*(ry-m.a[1])/(m.b[1]-m.a[1]),ry]}];
      g=parts.flatMap(q=>wallGeos(q,300,rt)).map(q=>q.translate(0,H_EP,0));top=H_EP+rt((m.a[0]+m.b[0])/2,(m.a[1]+m.b[1])/2);}
    else g=wallGeos(m,top);
    const cat=m.tipo==='vidrio'?'glass':m.tipo==='ladrillo'?'muro':'tabique';
    Pt(m.id,`${m.id} · ${m.nombre}`,cat,g,{...base(m),sec:`${m.tipo} · ${m.e} cm${m.carga?' · portante':''}`,med:`largo ${f1(Math.hypot(m.b[0]-m.a[0],m.b[1]-m.a[1])/100)} m · alto ${f1((m.id==='M-04'?507:top)/100)} m`},{...ex(m),tags:[m.nivel,'muros']});}
  /* aberturas: vidrio en ventanas y puertas balcón, hoja de madera en puertas */
  for(const a of M.ABERTURAS){const m=M.MUROS.find(w=>w.id===a.muro);if(!m||(m.nivel==='EP'&&!p.ep))continue;
    if(a.techo&&m.id==='M-04'){/* vano que copia la línea del techo a a.techo cm (V-04) */const y0=m.a[1]+a.d,y1=y0+a.w,z0=a.s||0,tz=y=>roofZ(y,0)-a.techo,X0=0,X1=35,f=5;
      const slab=(ya,yb,za,zb,xa,xb,t)=>box8([[xa,za,ya],[xb,za,ya],[xb,zb,yb],[xa,zb,yb],[xa,za+t,ya],[xb,za+t,ya],[xb,zb+t,yb],[xa,zb+t,yb]]);
      const fr=[box(X0,X1,z0,tz(y0),y0,y0+f),box(X0,X1,z0,tz(y1),y1-f,y1),box(X0,X1,z0,z0+f,y0,y1),slab(y0,y1,tz(y0)-f,tz(y1)-f,X0,X1,f),box(X0,X1,232,267,y0,y1)];/* travesaño grueso a la altura del entrepiso (Maxi) */
      Pt(a.id+'m',`${a.id} · marco de roble`,'roble',fr,{fn:'Marco de madera color roble en todo el contorno del vano.',sec:'roble 5 cm'},{group:'Aberturas',tags:[m.nivel,'aberturas']});
      Pt(a.id,`${a.id} · ${a.nombre}`,'glass',[box8([[16,z0+f,y0+f],[18,z0+f,y0+f],[18,z0+f,y1-f],[16,z0+f,y1-f],[16,tz(y0+f)-f,y0+f],[18,tz(y0+f)-f,y0+f],[18,tz(y1-f)-f,y1-f],[16,tz(y1-f)-f,y1-f]])],{...base(a),sec:a.tipo,med:`${f1(a.w/100)} m de ancho · de +${f1(z0/100)} hasta ${f1(a.techo/100)} bajo el techo`},{...ex(a),group:'Aberturas',tags:[m.nivel,'aberturas'],opt:{noEdges:true}});continue;}const [ax,ay]=m.a,[bx,by]=m.b;const horiz=Math.abs(bx-ax)>=Math.abs(by-ay);
    const zoff=m.nivel==='EP'?H_EP:0;const s0=a.s||0;const amx=horiz?ax+a.d+a.w/2:ax,amy=horiz?ay:ay+a.d+a.w/2;const s1=Math.min(s0+a.h,m.nivel==='EP'?Math.min(roofZ(amy,amx),m.top??999)-H_EP:(m.top??WALL_TOP[m.id]??H_EP));const th=a.tipo==='ventana'?2:4;const t0=-th/2,t1=th/2;
    const pane=(d0,d1,z0,z1)=>horiz?box(ax+d0,ax+d1,z0,z1,ay+t0,ay+t1):box(ax+t0,ax+t1,z0,z1,ay+d0,ay+d1);
    const frame=(d0,d1,z0,z1,w)=>horiz?[box(ax+d0,ax+d0+w,z0,z1,ay-(m.e/2+1),ay+(m.e/2+1)),box(ax+d1-w,ax+d1,z0,z1,ay-(m.e/2+1),ay+(m.e/2+1)),box(ax+d0,ax+d1,z1-w,z1,ay-(m.e/2+1),ay+(m.e/2+1))]:[box(ax-(m.e/2+1),ax+(m.e/2+1),z0,z1,ay+d0,ay+d0+w),box(ax-(m.e/2+1),ax+(m.e/2+1),z0,z1,ay+d1-w,ay+d1),box(ax-(m.e/2+1),ax+(m.e/2+1),z1-w,z1,ay+d0,ay+d1)];
    if(a.id==='P-34')continue;
    if(a.id==='P-03'&&horiz){/* Puerta al patio (Maxi, 13/10): una sola hoja pivotante, eje vertical a 1/3 del ancho; seis estéticas a elegir */
      Pt(a.id+'m',`${a.id} · marco`,'roble',frame(a.d,a.d+a.w,s0,s1,5),{fn:'Marco del vano.'},{group:'Aberturas',tags:[m.nivel,'aberturas',a.id]});
      const X0=ax+a.d+5.5,X1=ax+a.d+a.w-5.5,Z0=1,Z1=s1-5.5,Wd=X1-X0,Hd=Z1-Z0,yc=ay,T=5,xp=X0+Wd/3,EST=p.p03Est||'tablas';
      const angD=Math.max(-90,Math.min(90,LUZ[a.id]||0)),MR=new THREE.Matrix4().makeTranslation(xp,0,yc).multiply(new THREE.Matrix4().makeRotationY(angD*Math.PI/180)).multiply(new THREE.Matrix4().makeTranslation(-xp,0,-yc));
      const B=(x0,x1,z0,z1,t0=-T/2,t1=T/2)=>box(x0,x1,z0,z1,yc+t0,yc+t1).applyMatrix4(MR);
      const fr=[],fi=[];let cat='madera',fcat='glass',fop=.28,sec='';
      const marco=(f)=>{fr.push(B(X0,X0+f,Z0,Z1),B(X1-f,X1,Z0,Z1),B(X0+f,X1-f,Z0,Z0+f),B(X0+f,X1-f,Z1-f,Z1));};
      if(EST==='tablas'){const bw=12,gp=.6;for(let x=X0;x<X1-.1;x+=bw)fr.push(B(x,Math.min(X1,x+bw-gp),Z0,Z1));for(const zb of [Z0+25,Z1-25])fr.push(B(X0+8,X1-8,zb-6,zb+6,T/2,T/2+2.5),B(X0+8,X1-8,zb-6,zb+6,-T/2-2.5,-T/2));sec='tablas verticales de 12 machihembradas, dos travesaños de 12 por cara';}
      else if(EST==='hierro'){cat='acero';marco(5);fi.push(B(X0+5,X1-5,Z0+5,Z1-5,-.4,.4));sec='bastidor de tubo 50 × 50 negro, vidrio entero de 8 mm';}
      else if(EST==='kumiko'){marco(6);const st=15;for(let x=X0+6+st;x<X1-6-1;x+=st)fr.push(B(x-.7,x+.7,Z0+6,Z1-6,-1,1));for(let z=Z0+6+st;z<Z1-6-1;z+=st)fr.push(B(X0+6,X1-6,z-.7,z+.7,-1,1));fi.push(B(X0+6,X1-6,Z0+6,Z1-6,-.15,.15));fcat='washi';fop=.72;sec='bastidor de 6, kumiko cuadrado cada 15, papel washi';}
      else if(EST==='chapa'){cat='col';const f=8,sl=3,bd=9;fr.push(B(X0,X0+f,Z0,Z1),B(X1-f,X1,Z0,Z1),B(X0+f,X1-f,Z0,Z0+30),B(X0+f,X1-f,Z1-20,Z1));for(let z=Z0+30;z<Z1-20-bd;z+=bd+sl)fr.push(B(X0+f,X1-f,z,z+bd));sec='chapa plegada color óxido con tajos horizontales de 3 cada 12';}
      else if(EST==='ojo'){const r=22,cx=(X0+X1)/2,cz=Z0+Hd*.62,dz=3;for(let z=Z0;z<Z1-.1;z+=dz){const z1=Math.min(Z1,z+dz),zm=(z+z1)/2,h=Math.abs(zm-cz)<r?Math.sqrt(r*r-(zm-cz)**2):0;if(h>0){fr.push(B(X0,cx-h,z,z1),B(cx+h,X1,z,z1));}else fr.push(B(X0,X1,z,z1));}
        fi.push(new THREE.CylinderGeometry(r,r,1,40).rotateX(Math.PI/2).translate(cx,cz,yc).applyMatrix4(MR));fr.push(...[0,1].map(k=>new THREE.TorusGeometry(r+1.5,1.5,8,40).translate(cx,cz,yc+(k?T/2:-T/2)).applyMatrix4(MR)));sec='hoja maciza con ojo de buey de Ø44, aro de bronce';}
      else if(EST==='listonH'){marco(6);const lh=6,gp=3;for(let z=Z0+6;z+lh<=Z1-6;z+=lh+gp)fr.push(B(X0+6,X1-6,z,z+lh,-1.5,1.5));sec='bastidor de 6 y listones horizontales de 6 con luz de 3';}
      const hk=[];for(const sgn of [-1,1])hk.push(rod([X1-12,Z0+80,yc+sgn*(T/2+5)],[X1-12,Z0+140,yc+sgn*(T/2+5)],1.2,10).applyMatrix4(MR),rod([X1-12,Z0+85,yc+sgn*T/2],[X1-12,Z0+85,yc+sgn*(T/2+5)],.8,8).applyMatrix4(MR),rod([X1-12,Z0+135,yc+sgn*T/2],[X1-12,Z0+135,yc+sgn*(T/2+5)],.8,8).applyMatrix4(MR));
      hk.push(rod([xp,Z1,yc],[xp,Z1+5,yc],1,10),rod([xp,0,yc],[xp,Z0,yc],1,10));
      const nm={tablas:'tablas verticales',hierro:'hierro y vidrio',kumiko:'kumiko japonés',chapa:'chapa con tajos',ojo:'ojo de buey',listonH:'listones horizontales'}[EST];
      Pt(a.id+'h',`${a.id} · hoja pivotante (${nm})`,cat,fr,{...base(a),fn:'Puerta al patio de una sola hoja pivotante: el eje vertical está a 1/3 del ancho. Arrastrala a los costados para girarla.',sec,med:`${f1(Wd/100)} × ${f1(Hd/100)} m · eje a ${f1((xp-X0)/100)} m del borde`},{...ex(a),group:'Aberturas',tags:[m.nivel,'aberturas',a.id]});
      if(fi.length)Pt(a.id+'v',`${a.id} · ${fcat==='washi'?'papel washi':'vidrio'}`,fcat,fi,{fn:'Relleno de la hoja.'},{group:'Aberturas',tags:[m.nivel,'aberturas',a.id],opt:{op:fop,noEdges:true}});
      Pt(a.id+'k',`${a.id} · tiradores y pivotes`,'acero',hk,{fn:'Tiradores de barra de los dos lados y pivotes arriba y abajo.'},{group:'Aberturas',tags:[m.nivel,'aberturas',a.id]});
      HINGE[a.id]={axisY:true,x:xp,y:yc,s:1,min:-90,max:90,parts:[a.id+'h',a.id+'v',a.id+'k'],ang:angD};continue;}
    const balcon=['P-03','P-05','P-06'].includes(a.id);const g=[...frame(a.d,a.d+a.w,s0,s1,5)];
    if((a.tipo==='ventana'||balcon)&&!a.abre){g.push(pane(a.d+5,a.d+a.w-5,s0+(a.tipo==='ventana'?5:0),s1-5));if(a.w>150&&!a.panos)g.push(pane(a.d+a.w/2-2,a.d+a.w/2+2,s0,s1));
      if(a.panos>1){/* parantes de madera que reparten el vidrio en paños iguales (Maxi 14/10: V-44 en tres) */const pr=[];for(let k=1;k<a.panos;k++){const d=a.d+a.w*k/a.panos;pr.push(horiz?box(ax+d-2.5,ax+d+2.5,s0+zoff,s1+zoff,ay-(m.e/2+1),ay+(m.e/2+1)):box(ax-(m.e/2+1),ax+(m.e/2+1),s0+zoff,s1+zoff,ay+d-2.5,ay+d+2.5));}
        Pt(a.id+'p',`${a.id} · parantes`,'roble',pr,{fn:`Parantes de 5 que reparten el vidrio en ${a.panos} paños de ${f1(a.w/a.panos/100)} m.`},{group:'Aberturas',tags:[m.nivel,'aberturas',a.id]});}}
    else if(a.tipo==='puerta')g.push(pane(a.d+5,a.d+a.w-5,0,s1-5));
    if(s0>0)g.push(...(horiz?[box(ax+a.d,ax+a.d+a.w,s0,s0+5,ay-(m.e/2+1),ay+(m.e/2+1))]:[box(ax-(m.e/2+1),ax+(m.e/2+1),s0,s0+5,ay+a.d,ay+a.d+a.w)]));
    if(zoff)g.forEach(q=>q.translate(0,zoff,0));const nfr=3+(s0>0?1:0);const fr=[...g.slice(0,3),...(s0>0?[g[g.length-1]]:[])];const rest=g.slice(3,s0>0?g.length-1:g.length);
    Pt(a.id+'m',`${a.id} · marco de roble`,'roble',fr,{fn:'Marco de madera color roble en todo el contorno del vano.',sec:'roble 5 cm'},{group:'Aberturas',tags:[m.nivel,'aberturas']});g.length=0;g.push(...rest);
    if(a.abre==='batiente'&&horiz){/* puerta-ventana de dos hojas que abren hacia afuera, bisagras en los parantes (Maxi: por acá se entra y se sale) */
      const out=a.afuera||1,yo=ay+out*(m.e/2-3),ang=(LUZ[a.id]||0)*Math.PI/180,xa=ax+a.d+5,xb=ax+a.d+a.w-5,xm=(xa+xb)/2,za=s0+1+zoff,zb=s1-5+zoff,f=6;
      const leaf=(x0,x1,hx,sg)=>{const M4=new THREE.Matrix4().makeTranslation(hx,0,yo+out*3).multiply(new THREE.Matrix4().makeRotationY(sg*out*ang)).multiply(new THREE.Matrix4().makeTranslation(-hx,0,-(yo+out*3)));const b=(p0,p1,q0,q1,t0,t1)=>box(p0,p1,q0,q1,yo+t0,yo+t1).applyMatrix4(M4);
        return {fr:[b(x0,x0+f,za,zb,-3,3),b(x1-f,x1,za,zb,-3,3),b(x0,x1,zb-f,zb,-3,3),b(x0,x1,za,za+10,-3,3),b(sg>0?x1-f-2:x0+f,sg>0?x1-f:x0+f+2,za+95,za+125,3,6)],gl:b(x0+f,x1-f,za+10,zb-f,-.5,.5)};};
      const L=leaf(xa,xm-.5,xa,-1),Rr=leaf(xm+.5,xb,xb,1);
      Pt(a.id+'h',`${a.id} · hojas de abrir`,'roble',[...L.fr,...Rr.fr],{fn:'Dos hojas de roble con vidrio que abren hacia afuera. Tocalas para abrir o cerrar.'},{group:'Aberturas',tags:[m.nivel,'aberturas',a.id]});
      Pt(a.id,`${a.id} · ${a.nombre}`,'glass',[L.gl,Rr.gl],{...base(a),sec:'puerta-ventana de abrir hacia afuera',med:`${f1(a.w/100)} × ${f1((s1-s0)/100)} m, 2 hojas`},{...ex(a),group:'Aberturas',tags:[m.nivel,'aberturas'],opt:{noEdges:true}});continue;}
    const vJ=a.id==='V-07'?(p.ventV7||'proy'):p.ventJ;
    if(a.abre==='proyectante'&&horiz&&(vJ==='pleg'||vJ==='barn')){/* Ventanas al jardín (P-05, P-06, V-07), variantes (Maxi, 13/10) */
      const out=a.afuera||1,yW=ay+out*m.e/2,T26=a.hoja==='2x6';
      /* local: x a lo largo del muro, h hacia afuera desde la cara del muro, t hacia abajo desde el borde de arriba de las hojas */
      if(vJ==='pleg'){/* Dos hojas plegables tipo garage, montadas POR AFUERA del muro (pisan 5 cm el contorno del vano), separadas 3 cm de la pared.
          Las tres líneas de giro están en la arista de adentro (h = 3): A arriba (fija a un listón sobre el dintel), J entre hojas, B abajo (rueditas en los cajones
          de las jambas). Con A, J y B en la misma línea, la de arriba gira -q en A y la de abajo +q en J: B sube derecho pegado a la pared y las hojas nunca tocan
          el muro; a 90° quedan apiladas en horizontal, la de arriba por encima de la línea de A y la de abajo debajo, caras de adentro enfrentadas.
          Contrapeso fijo: el centro de gravedad de las dos hojas sube siempre la mitad de lo que sube B, así que un contrapeso igual al peso de UNA hoja
          las equilibra en cualquier ángulo. Va repartido en dos (uno por jamba) y con aparejo 2:1 (la mitad de recorrido, el doble de peso): cada uno pesa una hoja. */
        const DP=T26?15:6,f=5,sO=3,ov=5,X0=ax+a.d-ov,X1=ax+a.d+a.w+ov,zT=s1+ov+zoff,zB=(s0>0?s0-ov:s0+1.5)+zoff,L=zT-zB,ell=L/2;
        const W=(x,h,t)=>new THREE.Vector3(x,zT-t,yW+out*h);
        const bl=(x0,x1,h0,h1,t0,t1,M)=>{const P=[[x0,h0,t0],[x1,h0,t0],[x1,h0,t1],[x0,h0,t1],[x0,h1,t0],[x1,h1,t0],[x1,h1,t1],[x0,h1,t1]].map(([x,h,t])=>{const v=new THREE.Vector3(x,h,t);if(M)v.applyMatrix4(M);return W(v.x,v.y,v.z);});return box8(P);};
        const RXl=(q,h,tt)=>new THREE.Matrix4().makeTranslation(0,h,tt).multiply(new THREE.Matrix4().makeRotationX(q)).multiply(new THREE.Matrix4().makeTranslation(0,-h,-tt));
        const angD=Math.max(0,Math.min(LUZ[a.id]||0,90)),q=angD*Math.PI/180,MU=RXl(-q,sO,0),j=new THREE.Vector3(0,sO,ell).applyMatrix4(MU),ML=new THREE.Matrix4().makeTranslation(0,j.y-sO,j.z-ell).multiply(RXl(q,sO,ell));
        const h0=sO,h1=sO+DP,frm=(t0,t1,M)=>[bl(X0,X0+f,h0,h1,t0,t1,M),bl(X1-f,X1,h0,h1,t0,t1,M),bl(X0+f,X1-f,h0,h1,t0,t0+f,M),bl(X0+f,X1-f,h0,h1,t1-f,t1,M)];
        const gl=(t0,t1,M)=>bl(X0+f,X1-f,(h0+h1)/2-.3,(h0+h1)/2+.3,t0+f,t1-f,M);
        /* pesos: madera ~0,65 g/cm³, vidrio 6 mm 2,5 g/cm³, plomo 11,3 g/cm³ */
        const Wd=X1-X0,mH=(2*f*DP*ell+2*f*DP*(Wd-2*f))*.65/1000+(Wd-2*f)*(ell-2*f)*.6*2.5/1000,cwL=Math.ceil(mH*1000/11.3/64);
        const sec=T26?'tirantes de 2″×6″ de canto (5 de frente, 15 de fondo)':'roble 5 × 6';
        Pt(a.id+'h',`${a.id} · hoja de arriba`,'roble',frm(0,ell,MU),{fn:'Hoja de arriba: cuelga de bisagras en su arista de adentro, atornilladas a un listón sobre el dintel. Arrastrá hacia arriba para abrir (hasta 90°).',sec,med:`${f1(Wd/100)} × ${f1(ell/100)} m · ~${Math.round(mH)} kg`},{group:'Aberturas',tags:[m.nivel,'aberturas',a.id]});
        Pt(a.id,`${a.id} · ${a.nombre}`,'glass',[gl(0,ell,MU)],{...base(a),sec:'plegable tipo garage, 2 hojas por afuera del muro, contrapesada',med:`${f1(Wd/100)} × ${f1(L/100)} m`},{...ex(a),group:'Aberturas',tags:[m.nivel,'aberturas'],opt:{noEdges:true}});
        Pt(a.id+'h2',`${a.id} · hoja de abajo`,'roble',frm(ell,L,ML),{fn:'Hoja de abajo: cuelga de las bisagras del medio (arista de adentro); su borde de abajo sube con rueditas por los cajones de las jambas.',sec,med:`~${Math.round(mH)} kg`},{group:'Aberturas',tags:[m.nivel,'aberturas',a.id]});
        Pt(a.id+'v2',`${a.id} · vidrio de abajo`,'glass',[gl(ell,L,ML)],{fn:'Vidrio de la hoja de abajo.'},{group:'Aberturas',tags:[m.nivel,'aberturas',a.id],opt:{noEdges:true}});
        /* fijo: listón de las bisagras de arriba y cajones de las jambas (10 × 10, de arriba a abajo) con el contrapeso adentro */
        const BW=10,cj=[bl(X0,X1,0,sO,-12,0)];for(const xc of [X0-BW-1,X1+1])cj.push(bl(xc,xc+BW,0,BW,-14,L));
        Pt(a.id+'c',`${a.id} · cajones de contrapeso`,'roble',cj,{fn:`Listón de 3 sobre el dintel para las bisagras de arriba y dos cajones de 10 × 10 a los lados del vano: adentro corren las rueditas de B y cuelga el contrapeso. La ranura del lado de la hoja deja pasar el eje de las rueditas.`},{group:'Aberturas',tags:[m.nivel,'aberturas',a.id]});
        const tB=2*ell*Math.cos(q),tc=4+(L-tB)/2,cw=[];
        for(const xc of [X0-BW-1,X1+1]){cw.push(bl(xc+1,xc+BW-1,1,BW-1,tc,tc+cwL));cw.push(rod(W(xc+BW/2,BW/2,-8).toArray(),W(xc+BW/2,BW/2,tc).toArray(),.25,6));
          cw.push(new THREE.CylinderGeometry(3.5,3.5,1.5,16).rotateZ(Math.PI/2).translate(...W(xc+BW/2,BW/2,-8).toArray()));}
        Pt(a.id+'p',`${a.id} · contrapesos (adentro de los cajones)`,'acero',cw,{fn:`Contrapeso fijo de plomo, uno por jamba, con aparejo 2:1: el cable sale de la ruedita de B, sube a la roldana de arriba del cajón, baja a la roldana del contrapeso y vuelve arriba. Cada uno pesa lo que una hoja (~${Math.round(mH)} kg): las hojas quedan equilibradas en cualquier ángulo.`,sec:`plomo 8 × 8 × ${cwL}`,med:`~${Math.round(mH)} kg c/u · recorre ${f1(L/200)} m`},{group:'Aberturas',tags:[m.nivel,'aberturas',a.id]});
        const nh=Math.max(2,Math.round(Wd/70)),hxs=[...Array(nh)].map((_,k)=>X0+15+(Wd-30-10)*(nh===1?.5:k/(nh-1)));
        const hk=[],hk2=[];for(const xh of hxs){hk.push(bl(xh,xh+10,sO-.25,sO,-6,0),bl(xh,xh+10,sO,sO+.25,0,6,MU),bl(xh,xh+10,sO-.6,sO+.6,-.6,.6));
          hk.push(bl(xh,xh+10,sO,sO+.25,ell-6,ell,MU),bl(xh,xh+10,sO-.6,sO+.6,ell-.6,ell+.6,MU));hk2.push(bl(xh,xh+10,sO,sO+.25,ell,ell+6,ML));}
        for(const [xw,xe] of [[X0-BW/2-1,X0],[X1,X1+BW/2+1]]){hk2.push(bl(Math.min(xw,xe),Math.max(xw,xe),sO-.6,sO+.6,L-6.6,L-5.4,ML));const c=new THREE.Vector3(0,sO,L-6).applyMatrix4(ML);hk2.push(new THREE.CylinderGeometry(2.5,2.5,1.5,16).rotateZ(Math.PI/2).translate(...W(xw<X0?X0-BW/2-1:X1+BW/2+1,c.y,c.z).toArray()));}
        Pt(a.id+'k',`${a.id} · bisagras`,'acero',hk,{fn:'Bisagras de arriba (fijas al listón) y del medio, todas con el nudo en la arista de adentro.'},{group:'Aberturas',tags:[m.nivel,'aberturas',a.id]});
        Pt(a.id+'k2',`${a.id} · bisagras y rueditas (hoja de abajo)`,'acero',hk2,{fn:'Mitad de abajo de las bisagras del medio y ejes con rueditas en las esquinas de abajo, que corren dentro de los cajones.'},{group:'Aberturas',tags:[m.nivel,'aberturas',a.id]});
        const Aw=W(0,sO,0),Jw=W(0,sO,ell);HINGE[a.id]={y:Aw.z,z:Aw.y,s:-out,max:90,parts:[a.id+'h',a.id,a.id+'k'],ang:angD,fold:{parts:[a.id+'h2',a.id+'v2',a.id+'k2'],y:Jw.z,z:Jw.y}};}
      else{/* corrediza tipo granero de un paño: bastidor de tirantes 2″×6″ acostados (la cara de 15 contra la pared, 5 de espesor) con vidrio, colgado por afuera;
          el riel es una planchuela justo arriba del vano, escondida detrás del travesaño de arriba de la hoja (que pisa 10 sobre el dintel); corre hacia el lado libre */
        /* corre hacia el lado con lugar: sin pisar otras aberturas del muro ni pasarse del final del muro (ahí arrancan el ventanal o el retorno) */
        const ops=M.ABERTURAS.filter(o=>o.muro===a.muro&&o.id!==a.id).map(o=>[ax+o.d,ax+o.d+o.w]),ovS=10,Wp=a.w+2*ovS,wMin=Math.min(m.a[0],m.b[0]),wMax=Math.max(m.a[0],m.b[0]);
        const xL=ax+a.d-ovS,xR=xL+Wp,limR=Math.min(wMax,...ops.filter(([o0])=>o0>=ax+a.d+a.w).map(([o0])=>o0-3)),limL=Math.max(wMin,...ops.filter(([,o1])=>o1<=ax+a.d).map(([,o1])=>o1+3));
        const roomR=limR-xR,roomL=xL-limL,dir=a.corre&&(a.corre>0?roomR:roomL)>=Wp-1?a.corre:roomR>=Wp?1:roomL>=Wp?-1:roomR>=roomL?1:-1,trav=Math.max(0,Math.min(Wp,dir>0?roomR:roomL));
        const pa=Math.max(0,Math.min(100,LUZ[a.id]||0)),dx=dir*pa/100*trav,X0=xL,X1=xR,Z0=(s0>0?s0-ovS:1.5)+zoff,Z1=s1+ovS+zoff,F=15,TH=5,hI=4;
        const yh=h=>yW+out*h,B=(x0,x1,z0,z1,h0,h1)=>box(x0,x1,z0,z1,Math.min(yh(h0),yh(h1)),Math.max(yh(h0),yh(h1)));
        const fr=[B(X0+dx,X0+F+dx,Z0,Z1,hI,hI+TH),B(X1-F+dx,X1+dx,Z0,Z1,hI,hI+TH),B(X0+F+dx,X1-F+dx,Z1-F,Z1,hI,hI+TH),B(X0+F+dx,X1-F+dx,Z0,Z0+F,hI,hI+TH)];
        const gl=B(X0+F-1+dx,X1-F+1+dx,Z0+F-1,Z1-F+1,hI+2.2,hI+2.8);
        const xr0=Math.min(X0,X0+dir*trav),xr1=Math.max(X1,X1+dir*trav),zr=s1+zoff+2,tr=[B(xr0,xr1,zr,zr+4,1,2)];for(let x=xr0+10;x<xr1-5;x+=60)tr.push(B(x-2,x+2,zr,zr+4,0,1));
        tr.push(B(xr0,xr1,Z0-1.5,Z0-.5,hI+TH+.5,hI+TH+1.5));/* guía baja: un pernito en el piso a cada lado del travesaño de abajo */
        const cl=[];for(const xc of [X0+F+20,X1-F-20]){cl.push(B(xc-3+dx,xc+3+dx,zr-2,Z1-2,3,hI),rod([xc+dx,zr+6,yh(.8)],[xc+dx,zr+6,yh(3)],2.2,16));}
        Pt(a.id+'h',`${a.id} · bastidor de la corrediza`,'roble',fr,{fn:'Bastidor de tirantes de 2″×6″ acostados: la cara de 15 mira a la pared y al jardín, 5 de espesor. Pisa 10 cm el contorno del vano y su travesaño de arriba tapa el riel. Arrastrala de costado para correrla.',sec:'2″×6″ acostado (15 × 5)',med:`${f1(Wp/100)} × ${f1((Z1-Z0)/100)} m · corre ${f1(Wp/100)} hacia ${dir>0?'el norte':'el sur'}`},{group:'Aberturas',tags:[m.nivel,'aberturas',a.id]});
        Pt(a.id,`${a.id} · ${a.nombre} (corrediza)`,'glass',[gl],{...base(a),sec:'corrediza tipo granero, bastidor 2″×6″ y vidrio',med:`${f1(Wp/100)} × ${f1((Z1-Z0)/100)} m`},{...ex(a),group:'Aberturas',tags:[m.nivel,'aberturas'],opt:{noEdges:true}});
        Pt(a.id+'d',`${a.id} · carros`,'acero',cl,{fn:'Dos carros atornillados por detrás del travesaño de arriba: la rueda corre sobre la planchuela, oculta detrás del bastidor.'},{group:'Aberturas',tags:[m.nivel,'aberturas',a.id]});
        Pt(a.id+'k',`${a.id} · riel y guía`,'acero',tr,{fn:'Planchuela de 4 × 1 sobre separadores, pegada al dintel (+'+f1((zr-zoff)/100)+'), y guía baja. Con la hoja cerrada queda tapada por el travesaño de arriba.'},{group:'Aberturas',tags:[m.nivel,'aberturas',a.id]});
        HINGE[a.id]={vec:v=>new THREE.Vector3(dir*v/100*trav,0,0),max:100,parts:[a.id,a.id+'h',a.id+'d'],ang:pa,horizDrag:dir};}
      continue;}
    if(a.abre==='proyectante'&&horiz){/* hoja proyectante: cuelga del dintel y abre hacia afuera por abajo, con dos amortiguadores (Maxi) */
      const H25=a.hoja==='2x5'||a.hoja==='2x6',DP=a.hoja==='2x6'?15:H25?12.7:6,out=a.afuera||1,yo=ay+out*(m.e/2-DP/2-.5),ang=(LUZ[a.id]||0)*Math.PI/180,hz=s1-5+zoff,M4=new THREE.Matrix4().makeTranslation(0,hz,yo).multiply(new THREE.Matrix4().makeRotationX(-out*ang)).multiply(new THREE.Matrix4().makeTranslation(0,-hz,-yo));HINGE[a.id]={y:yo,z:hz,s:-out,max:100,parts:[a.id+'h',a.id],dm:a.id+'d',ang:LUZ[a.id]||0};
      const xa=ax+a.d+5,xb=ax+a.d+a.w-5,za=s0+(s0>0?5:1)+zoff,zb=s1-5+zoff,f=H25?5:6,bx=(x0,x1,z0,z1,t0,t1)=>box(x0,x1,z0,z1,yo+t0,yo+t1).applyMatrix4(M4);/* hoja de 2″×5″: 5 de frente, 12,7 de profundidad (Maxi) */
      Pt(a.id+'h',`${a.id} · hoja proyectante`,'roble',[bx(xa,xa+f,za,zb,-DP/2,DP/2),bx(xb-f,xb,za,zb,-DP/2,DP/2),bx(xa,xb,zb-f,zb,-DP/2,DP/2),bx(xa,xb,za,za+f,-DP/2,DP/2)],{fn:'Hoja de roble que cuelga del dintel y se proyecta hacia afuera'+(H25?', con marco de 2″×5″ de canto (12,7 hacia adentro/afuera) para que no flexione al levantarse':'')+'. Arrastrala hacia arriba para abrirla y hacia abajo para cerrarla.',sec:H25?'2″×5″ de canto':'roble 6 cm'},{group:'Aberturas',tags:[m.nivel,'aberturas',a.id]});
      Pt(a.id,`${a.id} · ${a.nombre}`,'glass',[bx(xa+f,xb-f,za+f,zb-f,-.5,.5)],{...base(a),sec:'proyectante',med:`${f1(a.w/100)} × ${f1((s1-s0)/100)} m`},{...ex(a),group:'Aberturas',tags:[m.nivel,'aberturas'],opt:{noEdges:true}});
      if(ang>.01){const dm=[];for(const xd of [xa+3,xb-3]){const p0=new THREE.Vector3(xd,za+(zb-za)*.35,yo);const p1=new THREE.Vector3(xd,za+(zb-za)*.6,yo+out*3).applyMatrix4(M4);dm.push(rod(p0.toArray(),p1.toArray(),1.2,8));}
        Pt(a.id+'d',`${a.id} · amortiguadores`,'acero',dm,{fn:'Pistones a gas que sostienen la hoja abierta.'},{group:'Aberturas',tags:[m.nivel,'aberturas',a.id]});}
      continue;}
    if(!g.length)continue;
    Pt(a.id,`${a.id} · ${a.nombre}`,(a.tipo==='ventana'||balcon)?'glass':a.tipo==='puerta'?'madera':'obj',g,{...base(a),sec:a.tipo,med:`${f1(a.w/100)} × ${f1((s1-s0)/100)} m${s0?` · antepecho ${f1(s0/100)}`:''}`},{...ex(a),group:'Aberturas',tags:[m.nivel,'aberturas'],opt:{noEdges:a.tipo==='ventana'||balcon}});}
  /* puerta-ventanas del ventanal (6 paños de 2,00 en tres rieles), del tímpano norte (4 de 2,00) y el retorno sur */
  {/* paños corredizos grandes (Maxi, 13/10): bastidor de 70 × 70 de madera; los cantos de todo el perímetro llevan chapa de 3 mm */
    const pane=(id,nombre,x0,x1,y0,y1,z0,z1,nota,out=1)=>{const horiz=Math.abs(x1-x0)>Math.abs(y1-y0);const f=7,t=.3;
      /* coordenadas locales: u a lo largo del paño, w en el espesor (w0 cara interior, w1 cara exterior) */
      const u0=horiz?x0:y0,u1=horiz?x1:y1,c0=horiz?y0:x0,c1=horiz?y1:x1;const ext=out>0?c1:c0,inn=out>0?c0:c1,sg=out>0?1:-1;
      const bx=(a0,a1,h0,h1,b0,b1)=>horiz?box(a0,a1,h0,h1,Math.min(b0,b1),Math.max(b0,b1)):box(Math.min(b0,b1),Math.max(b0,b1),h0,h1,a0,a1);
      /* madera en todo el espesor; chapa sólo en los cantos de todo el perímetro (Maxi: PV-06.c10 metal, el resto madera) */
      const wood=[bx(u0+t,u0+f,z0+t,z1-t,inn,ext),bx(u1-f,u1-t,z0+t,z1-t,inn,ext),bx(u0+f,u1-f,z1-f,z1-t,inn,ext),bx(u0+f,u1-f,z0+t,z0+f,inn,ext)];
      const met=[bx(u0,u0+t,z0,z1,inn,ext),bx(u1-t,u1,z0,z1,inn,ext),bx(u0+t,u1-t,z1-t,z1,inn,ext),bx(u0+t,u1-t,z0,z0+t,inn,ext)];
      Pt(id,`${id} · ${nombre}`,'roble',wood,{fn:nota,sec:'bastidor de madera 70 × 70; cantos de todo el perímetro con chapa de 3 mm; vidrio 6 mm',med:`${f1((u1-u0)/100)} × ${f1((z1-z0)/100)} m`},{group:'Aberturas',tags:['PB','aberturas','ventanal']});
      Pt(id+'m',`${id} · chapa de los cantos`,'acero',met,{fn:'Chapa de 3 mm en los cantos de todo el perímetro del bastidor (arriba, abajo y los dos laterales); las caras de adentro y de afuera son de madera.'},{group:'Aberturas',tags:['PB','aberturas','ventanal',id]});
      const wm=(c0+c1)/2;Pt(id+'v',`${id} · vidrio`,'glass',[bx(u0+f,u1-f,z0+f,z1-f,wm-.3,wm+.3)],{fn:'Paño de vidrio de '+id},{group:'Aberturas',tags:['PB','aberturas','ventanal',id],opt:{noEdges:true}});};
    const planos=[918,926,934];   // tres rieles escalonados, del modelo
    for(let i=0;i<6;i++){const o=HOJAS[`PV-0${i+1}`]||0,x0=1353+i*195+o,x1=x0+195,yp=planos[Math.floor(i/2)];pane(`PV-0${i+1}`,`Puerta-ventana ${i+1} del frente`,x0,x1,yp-3.5,yp+3.5,3,222,`Paño corredizo ${i+1} de 6 del ventanal M-08, de sur a norte; riel ${Math.floor(i/2)+1}.`);}
    for(let i=0;i<4;i++){const o=HOJAS[`PV-${String(7+i).padStart(2,'0')}`]||0,y0=115+i*198.75+o,y1=y0+198.75;pane(`PV-${String(7+i).padStart(2,'0')}`,`Puerta-ventana ${7+i}, tímpano norte`,2527,2534,y0,y1,3,241,`Paño corredizo ${i+1} de 4 del tímpano vidriado M-10, del patio hacia el jardín. Corre por afuera de la línea de M-10 y sigue 2 m más allá de M-03, hacia la puerta del baño piletero (Maxi).`);}
    /* riel del tímpano por afuera (x 25,28–25,34), prolongado 2 m más allá de M-03 sobre el deck D-3, con un poste al final (Maxi, 13/10) */
    Pt('PV-RT','PV-RT · riel del tímpano prolongado','acero',[box(2526,2536,241,247,-95,912),box(2526,2536,0,1.5,-95,912),box(2527,2535,0,247,-101,-93)],{fn:'Riel superior de planchuela y guía baja de los paños PV-07…10, por afuera de la línea del tímpano: pasan por delante del extremo de M-03 y siguen 2 m más hacia la puerta del baño piletero (P-23). Al final, un poste de 8 × 8 sostiene el riel.',sec:'riel de acero, poste 8 × 8',med:'riel de y −0,95 a 9,12'},{group:'Aberturas',tags:['PB','aberturas','ventanal']});
    pane('PV-11','Paño fijo del retorno sur',1328,1335,638.5,778.5,3,241,'Paño fijo junto al muro M-07, en el retorno sur (M-09).',-1);
    {const o=HOJAS['PV-12']||0;pane('PV-12','Paño corredizo del retorno sur · entrada principal',1336,1343,778.5+o,918.5+o,3,241,'Corre por delante del paño fijo PV-11 hacia el muro. Podría ser la entrada principal, con cerradura desde afuera.',-1);
      Pt('PV-12k','PV-12 · cerradura y tirador','acero',[box(1327,1336,105,135,902.5+o,907.5+o),box(1343,1347,105,135,902.5+o,907.5+o)],{fn:'Cerradura con llave desde afuera y tirador.'},{group:'Aberturas',tags:['PB','aberturas','PV-12']});}}

  /* locales: piso fino para poder tocarlos */
  /* borde del entrepiso sobre la escalera: se corre con ESC-1 (corrimiento este–oeste) */
  const DYE=p.escTipo!=='orig'?(+p.escDy||0):0,YEDGE=411.5+DYE;{const l27=M.LOCALES.find(l=>l.id==='L-27');if(l27){if(!l27._p0)l27._p0=l27.poly.map(q=>q.slice());l27.poly=l27._p0.map(([x,y])=>[x,y===411.5?YEDGE:y]);}}
  for(const l of M.LOCALES){const isEP=l.nivel==='EP';if(isEP&&!p.ep)continue;const z=isEP?H_EP-2:0;const t=isEP?2:1.5;/* piso del entrepiso: 20 mm (Maxi) */
    const xs=l.poly.map(q=>q[0]),ys=l.poly.map(q=>q[1]);const w=Math.max(...xs)-Math.min(...xs),d=Math.max(...ys)-Math.min(...ys);
    const A=Math.abs(l.poly.reduce((s,[x,y],i)=>{const [x2,y2]=l.poly[(i+1)%l.poly.length];return s+x*y2-x2*y;},0))/2/1e4;
    Pt(l.id,`${l.id} · ${l.nombre}`,isEP?'ep':l.id==='L-23'?'deck':'piso',prism(l.poly,z,z+t,'XZ'),{...base(l),med:`${f1(w/100)} × ${f1(d/100)} m · ${f1(A)} m²`},{...ex(l),tags:[l.nivel,'locales']});}

  /* escalera de acceso al entrepiso (la «Escalera compensada»): el tramo sube hacia el patio y llega al estudio L-27 en y 2,25 */
  /* ESC-1 variable (Maxi, 13/10): llega al borde del entrepiso (y 4,115) entre x 13,42 y 14,42; se eligen las alzadas, cuántas pedadas
     tiene el tramo de arriba (eso fija dónde está el giro), el tipo de giro y hacia dónde baja el tramo de abajo. */
  if(p.ep&&p.escTipo!=='orig'){const N=Math.max(12,+p.escN||15),R=H_EP/N,G=24,ti=5,f=5,X0=1342,X1=1442,WD=X1-X0,YE=YEDGE,giro=p.escGiro||'comp';
    const w=giro==='comp'?2:giro==='desc'?1:0;let u=Math.max(1,Math.min(N-1-w,+p.escAlto||9));const nL=N-1-u-w;
    const yT=YE+u*G,tr=[],st=[],po=[],rods=[];const kT=N-u-1;/* nivel de la primera pedada del giro */
    const slabX=(y0,y1,[xa,za],[xb,zb],th)=>box8([[xa,za,y0],[xb,zb,y0],[xb,zb,y1],[xa,za,y1],[xa,za+th,y0],[xb,zb+th,y0],[xb,zb+th,y1],[xa,za+th,y1]]);
    /* tramo de arriba: baja hacia el jardín (+y) desde el borde del entrepiso */
    for(let i=1;i<=u;i++){const k=N-i;tr.push(box(X0+f,X1-f,k*R-ti,k*R,YE+(i-1)*G-1,YE+i*G));}
    const zTop=H_EP,zLow=(N-u)*R;for(const xa of [X0,X1-f])st.push(slabY(xa,xa+f,[YE,zTop-30],[yT,zLow-30],35));
    let fp={x0:X0,x1:X1,y0:YE,y1:yT};
    if(giro!=='recto'){/* giro a la izquierda del que baja: hacia la pileta (+x) */
      if(giro==='comp'){tr.push(prism([[X0,yT],[X1,yT],[X0,yT+WD]],kT*R-ti,kT*R,'XZ'),prism([[X1,yT],[X1,yT+WD],[X0,yT+WD]],(kT-1)*R-ti,(kT-1)*R,'XZ'));}
      else tr.push(box(X0,X1,kT*R-ti,kT*R,yT,yT+WD));
      const zp=kT*R;for(const [x,y] of [[X0,yT+WD-9],[X1-9,yT+WD-9],[X0,yT],[X1-9,yT]])po.push(box(x,x+9,0,zp-ti,y,y+9));/* cuarto poste en la esquina del vacío (Maxi 14/10): ahí apoyan las puntas de las dos compensadas */
      const k0=kT-w;/* primera pedada del tramo de abajo = k0 */
      for(let j=1;j<=nL;j++){const k=k0-j+1;tr.push(box(X1+(j-1)*G,X1+j*G+1,k*R-ti,k*R,yT+f,yT+WD-f));}
      if(nL>0){for(const ya of [yT,yT+WD-f])st.push(slabX(ya,ya+f,[X1,k0*R-30],[X1+nL*G,(k0-nL+1)*R-30],35));}
      fp={x0:X0,x1:X1+nL*G,y0:YE,y1:yT+WD};}
    else{for(let j=1;j<=nL;j++){const k=N-u-j;tr.push(box(X0+f,X1-f,k*R-ti,k*R,yT+(j-1)*G-1,yT+j*G));}
      if(nL>0)for(const xa of [X0,X1-f])st.push(slabY(xa,xa+f,[yT,zLow-30],[yT+nL*G,R-30],35));fp={x0:X0,x1:X1,y0:YE,y1:yT+nL*G};}
    /* pasamanos del lado del vacío */
    rods.push(rod([X1-2.5,zTop+90,YE],[X1-2.5,zLow+90,yT],2,10));
    /* choques en planta con lo que está cerca */
    const hits=[];const ov=(a,b)=>a.x0<b.x1&&a.x1>b.x0&&a.y0<b.y1&&a.y1>b.y0;
    if(ov(fp,{x0:1342,x1:1353,y0:627.5,y1:638.5}))hits.push('C1');if(ov(fp,{x0:1329,x1:1342,y0:638.5,y1:918.5}))hits.push('retorno');if(fp.y1>918)hits.push('ventanal');
    const ang=Math.round(Math.atan(R/G)*180/Math.PI),bl=2*R+G;
    const info=`${N} alzadas de ${f1(R)} · huella ${G} · ${ang}° · 2a+p ${f1(bl)} · arriba ${u} pedadas · ${giro==='comp'?'2 compensadas':giro==='desc'?'descanso':'sin giro'} · abajo ${nL}${giro!=='recto'?' hacia la pileta':''} · ocupa hasta y ${f1(fp.y1/100)}, x ${f1(fp.x1/100)}${hits.length?' · ⚠ choca con '+hits.join(', '):''}`;
    window.__escInfo1=info;{const el=typeof document!=='undefined'&&document.getElementById('escInfo1');if(el)el.textContent=info;}
    Pt('ESC1-T','ESC-1 · pedadas','ep',tr,{fn:'Escalera al entrepiso, variable: '+info,sec:'pedadas de 2″',med:info},{group:'Escalera',tags:['PB','escalera']});
    Pt('ESC1-Z','ESC-1 · zancas','cabio',st,{fn:'Zancas de 2″×12″ a los dos lados de cada tramo.'},{group:'Escalera',tags:['PB','escalera']});
    if(po.length)Pt('ESC1-P','ESC-1 · postes del giro','cabio',po,{fn:'Postes de 9 × 9 en las cuatro esquinas del giro.'},{group:'Escalera',tags:['PB','escalera']});
    Pt('ESC1-B','ESC-1 · pasamanos','acero',rods,{fn:'Pasamanos del lado del vacío.'},{group:'Escalera',tags:['PB','escalera']});}
  {const es=M.ESCALERAS&&M.ESCALERAS.find(e=>e.id==='ESC-1');if(es&&p.ep&&p.escTipo==='orig'){const [ex,ey]=es.pos,rot=(es.rot??90)*Math.PI/180;let ps=[];try{ps=escaleraCompensada(geo);}catch(e){console.error('escalera',e);}
    const MAT=new THREE.Matrix4().makeTranslation(ex,0,ey).multiply(new THREE.Matrix4().makeRotationY(rot));
    const CAT={herraje:'acero',perno:'acero',pedada:'ep',c1:'ep',c2:'ep',exist:'cabio'};
    for(const q of ps){const gs=q.geos.map(g=>g.clone().applyMatrix4(MAT));Pt(`ESC-${q.id}`,`ESC-1 · ${q.name}`,CAT[q.cat]||'cabio',gs,{fn:(q.info&&q.info.fn)||'',sec:q.info&&q.info.sec,med:q.info&&q.info.med},{group:'Escalera',tags:['PB','escalera']});}}}
  /* S · caracol Ø1,60 frente a la puerta, centrado bajo la cumbrera (es donde hay altura); el último escalón apunta a la puerta */
  if(p.escAlt==='S'){const v=M.ABERTURAS.find(o=>o.id==='P-34'),HZ=262,WF=-332.5,n=14,Rz=HZ/n,RO=80,RI=6,cx=1817+(v?v.d+v.w/2:286),cy=WF+RO+2,da=22.5*Math.PI/180,u=x=>wingZ(x)-19,t=[],rods=[];
    let hmin=1e9,hwhere='';const rw=RO*2/3;
    for(let i=1;i<n;i++){const am=-Math.PI/2-(n-1-i)*da,a0=am-da/2,a1=am+da/2,pts=[];for(let k=0;k<=4;k++){const a=a0+(a1-a0)*k/4;pts.push([cx+RO*Math.cos(a),cy+RO*Math.sin(a)]);}
      pts.push([cx+RI*Math.cos(a1),cy+RI*Math.sin(a1)],[cx+RI*Math.cos(a0),cy+RI*Math.sin(a0)]);t.push(prism(pts,i*Rz-4,i*Rz,'XZ'));
      const hx=u(cx+rw*Math.cos(am))-i*Rz;if(hx<hmin){hmin=hx;hwhere='escalón '+i;}
      const px=cx+(RO-3)*Math.cos(am),py=cy+(RO-3)*Math.sin(am);if(i%2)rods.push(rod([px,i*Rz,py],[px,i*Rz+90,py],1.4,8));
      if(i>1){const ap=am-da;rods.push(rod([cx+(RO-3)*Math.cos(ap),(i-1)*Rz+90,cy+(RO-3)*Math.sin(ap)],[px,i*Rz+90,py],1.8,8));}}
    rods.push(rod([cx,0,cy],[cx,HZ+20,cy],5.5,16));const hd=(v?v.s+v.h:440)-HZ;if(hd<hmin){hmin=hd;hwhere='la puerta P-34';}
    Pt('ESC-S','ESC-S · Escalera caracol al altillo','ep',t,{fn:`Caracol de Ø1,60 frente a la puerta P-34, con la columna bajo la cumbrera de T-06 (la única franja con altura). 13 escalones en abanico de 22,5° y la última alzada entra por la puerta. Arranca mirando al norte. Altura libre mínima sobre la línea de paso: ${f1(hmin/100)} m (${hwhere}).`,sec:'huellas de 2″ en abanico, columna central de caño Ø11',med:`14 alzadas de ${f1(Rz)} · 22,5° por escalón · huella en la línea de paso ${f1(rw*da)} · ocupa 1,60 × 1,62`},{group:'Escalera',tags:['PB','escalera']});
    Pt('ESC-Sr','ESC-S · columna y baranda','acero',rods,{fn:'Columna central y baranda helicoidal de hierro.'},{group:'Escalera',tags:['PB','escalera']});}
  /* B2 (Maxi): la primera versión —tramo recto contra M-22 y puentecito contra M-26— con el puentecito más bajo y unos escalones
     junto a la puerta, para ganar altura libre en el rincón. Se calcula la altura libre en cada punto del recorrido. */
  /* B3 (Maxi, 13/10): segunda versión de B2, más empinada y con menos escalones arriba (puentecito más largo). Huella, alzadas y
     escalones del puentecito se ajustan en vivo (barra de abajo, con B3 elegida). */
  if(p.escAlt==='B2'||p.escAlt==='B3'){const B3=p.escAlt==='B3',ID=B3?'ESC-B3':'ESC-B2',v=M.ABERTURAS.find(o=>o.id==='P-34'),dx0=1817+(v?v.d:246),dx1=dx0+(v?v.w:80),HZ=262,WF=-332.5,XE=2364,R=HZ/(B3?(+p.escB3n||14):14),G=B3?(+p.escB3G||20):23,k=B3?Math.max(1,+p.escB3k||5):(+p.escB2k||5),hL=HZ-k*R,u=x=>wingZ(x)-19;
    const t=[],st=[],rods=[],pl=[],post=(x,y,z0,z1)=>rods.push(rod([x,z0,y],[x,z1,y],1.6,8)),rail=(a,b)=>rods.push(rod(a,b,2,10));
    /* tramo 1 contra M-22: sube hacia M-26 hasta el descanso del rincón (hL) */
    const n1=Math.round(hL/R),R1=hL/n1,xa=XE-95,ytop=WF+95;for(let i=1;i<n1;i++){const y0=ytop+(n1-1-i)*G;t.push(box(xa+4,XE,i*R1-4,i*R1,y0,y0+G+2));}
    const yb=ytop+(n1-1)*G,sl=hL/(yb-ytop),zN=y=>hL*(yb+G-y)/(yb+G-ytop),Dv=25/Math.cos(Math.atan(sl));
    st.push(prism([[yb+G+6/sl,0],[ytop,zN(ytop)+6],[ytop,zN(ytop)+6-Dv],[yb+G+(6-Dv)/sl,0]],xa,xa+4,'ZY'),prism([[yb+G+6/sl,0],[ytop,zN(ytop)+6],[ytop,zN(ytop)+6-Dv],[yb+G+(6-Dv)/sl,0]],XE-4,XE,'ZY'));
    rail([xa+2,zN(yb)+90,yb],[xa+2,hL+90,ytop]);post(xa+2,yb,zN(yb),zN(yb)+90);
    /* descanso del rincón + puentecito a hL, y k escalones subiendo hacia la puerta, que llegan a la plataforma frente a P-34 (+2,62) */
    const xs=dx1+(k-1)*G;pl.push(box(xs,XE,hL-4,hL,WF,WF+95));st.push(box(xs,XE,hL-24,hL-4,WF+90,WF+95));
    for(let i=1;i<k;i++){const x0=dx1+(k-1-i)*G;t.push(box(x0,x0+G+2,hL+i*R-4,hL+i*R,WF,WF+90));}
    pl.push(box(dx0-10,dx1,HZ-4,HZ,WF,WF+90));st.push(box(dx0-10,dx1,HZ-24,HZ-4,WF+85,WF+90),prism([[xs+5,hL-24],[xs+5,hL],[dx1,HZ],[dx1,HZ-24]].map(([x,z])=>[x,z]),WF+85,WF+90,'XY'));
    for(const x of [dx0-8,dx1,xs,(xs+XE-95)/2,XE-95]){const h=x<=dx1?HZ:x>=xs?hL:hL+(xs-x)/G*R;post(x,WF+92,h,h+90);}
    rail([dx0-8,HZ+90,WF+92],[dx1,HZ+90,WF+92]);rail([dx1,HZ+90,WF+92],[xs,hL+90,WF+92]);rail([xs,hL+90,WF+92],[XE-95,hL+90,WF+92]);rail([dx0-8,HZ+90,WF+3],[dx0-8,HZ+90,WF+92]);
    /* altura libre: tramo 1 (en el borde contra la pared, x XE), descanso, puentecito y escalones */
    const H=[];for(let i=1;i<n1;i++)H.push([u(xa+47)-i*R1,`tramo, escalón ${i}`]);for(let x=xs;x<=XE-47;x+=10)H.push([u(x)-hL,`puentecito en x ${f1(x/100)}`]);for(let i=1;i<k;i++){const x=dx1+(k-1-i)*G+G;H.push([u(x)-(hL+i*R),`escalón ${i} del puentecito`]);}H.push([u(dx1)-HZ,'plataforma de la puerta']);
    const hm=H.reduce((a,b)=>b[0]<a[0]?b:a,H[0]);const hc=u(XE-50)-hL;
    {const el=typeof document!=='undefined'&&document.getElementById('escInfo');window.__escInfo=B3?`${Math.round(Math.atan(R/G)*180/Math.PI)}° · alzada ${f1(R)} · descanso +${f1(hL/100)} · libre en el rincón ${f1(hc/100)} m · mínima ${f1(hm[0]/100)} m`:'';if(el&&B3)el.textContent=`${Math.round(Math.atan(R/G)*180/Math.PI)}° · alzada ${f1(R)} · descanso +${f1(hL/100)} · libre en el rincón ${f1(hc/100)} m · mínima ${f1(hm[0]/100)} m`;}
    Pt(ID,`${ID} · Recta contra M-22 + puentecito más bajo${B3?' (más empinada)':''}`,'ep',t,{fn:`Tramo recto contra M-22 hasta un descanso en el rincón a +${f1(hL/100)}; de ahí el puentecito contra M-26 y ${k-1} escalones más una alzada hasta la plataforma de la puerta. Altura libre en el rincón (centro del descanso): ${f1(hc/100)} m. Mínima sobre la línea de paso (por el centro): ${f1(hm[0]/100)} m (${hm[1]}); contra la pared M-22, ${f1((u(XE)-hL)/100)} m.`,sec:'huellas de 2″',med:`${n1} alzadas de ${f1(R1)} + ${k} de ${f1(R)} · huella ${G} · ${Math.round(Math.atan(R/G)*180/Math.PI)}° · descanso a +${f1(hL/100)}`},{group:'Escalera',tags:['PB','escalera']});
    Pt(ID+'z',`${ID} · zancas y vigas`,'cabio',st,{fn:'Zancas del tramo y vigas del puentecito.'},{group:'Escalera',tags:['PB','escalera']});
    Pt('PAS-1','PAS-1 · Puentecito al altillo','ep',pl,{fn:'Descanso del rincón y puentecito contra M-26.'},{group:'Escalera',tags:['PB','escalera']});
    Pt(ID+'r',`${ID} · baranda`,'acero',rods,{fn:'Pasamanos y parantes.'},{group:'Escalera',tags:['PB','escalera']});}
  /* escaleras al altillo: con el techo T-06 bajando a los costados, la única franja con altura libre está bajo la cumbrera,
     así que todas salen derecho desde la puerta P-34 (centrada bajo la cumbrera) hacia la cocina. Se informa la altura libre mínima. */
  if(p.escAlt&&p.escAlt!=='0'){const v=M.ABERTURAS.find(o=>o.id==='P-34'),xc=1817+(v?v.d+v.w/2:286),HZ=262,WF=-332.5,dintel=HZ+(v?v.h:178),u=x=>wingZ(x)-14-5;
    const OPT={A:{n:13,go:9,td:24,w:64,alt:true,nom:'paso alternado',fn:'Paso alternado (~66°): se sube de frente, agarrado de los dos pasamanos; cada pie tiene su media huella.'},
               D:{n:13,go:11.6,td:16,w:70,nom:'escalera de barco (60°)',fn:'Escalera de barco: huellas enteras de 16, sin contrahuella; se baja de espaldas.'},
               E:{n:14,go:23,td:25,w:86,nom:'recta (40°)',fn:'Escalera recta normal, cómoda para el uso diario. Es la que más cocina ocupa.'}};
    const o=OPT[p.escAlt];if(o){const R=HZ/o.n,xa=xc-o.w/2,xb=xc+o.w/2,t=[],st=[],rods=[];const yT=WF,yB=WF+(o.n-1)*o.go+o.td;
      for(let i=1;i<o.n;i++){const y0=WF+(o.n-1-i)*o.go,z=i*R;if(o.alt){const lf=i%2;t.push(box(lf?xa:xc,lf?xc:xb,z-4,z,y0,y0+o.td));}else t.push(box(xa,xb,z-4,z,y0,y0+o.td));}
      const sl=Math.atan2(HZ,yB-yT),D=22/Math.cos(sl);/* zancas: canto superior pasa por las narices */
      const zN=y=>HZ*(yB-y)/(yB-yT);const strPts=[[yB,0],[yB-D*Math.cos(sl)*Math.sin(sl)*0+0.01,0],[yT,HZ+4],[yT,HZ+4-D],[yB-(D)/Math.tan(sl),0]];
      /* zanca de canto parejo: borde de arriba paralelo a la línea de narices, mismo alto en todo el largo; corte a nivel en el piso y a plomo en la pared */
      const Uz=y=>zN(y)+6,Dv=D,yU0=yB+(Uz(yB))/(HZ/(yB-yT)),yL0=yB+(Uz(yB)-Dv)/(HZ/(yB-yT));
      for(const [a,b] of [[xa-4,xa],[xb,xb+4]])st.push(prism([[yU0,0],[yT,Uz(yT)],[yT,Uz(yT)-Dv],[Math.min(yL0,yU0-1),0]],a,b,'ZY'));
      for(const x of [xa-2,xb+2]){rods.push(rod([x,zN(yB-12)+90,yB-12],[x,HZ+92,yT+4],2,10),rod([x,0,yB-8],[x,zN(yB-12)+90,yB-12],1.6,8));}
      /* altura libre mínima: sobre cada nariz, a la vertical, hasta el techo (en los bordes de la escalera) o hasta el dintel de la puerta */
      let hmin=1e9;for(let i=1;i<o.n;i++){const y0=WF+(o.n-1-i)*o.go,z=i*R;hmin=Math.min(hmin,Math.min(u(xa),u(xb))-z);}hmin=Math.min(hmin,dintel-HZ);
      Pt('ESC-'+p.escAlt,`ESC-${p.escAlt} · Escalera al altillo, ${o.nom}`,'ep',t,{fn:o.fn+` Ocupa ${f1((o.w+8)/100)} × ${f1((yB-yT)/100)} m frente a la puerta.`,sec:'huellas de 2″',med:`${o.n} alzadas de ${f1(R)} · avance ${f1(o.go)} · altura libre mínima ${f1(hmin/100)} m (la puerta P-34 tiene 1,78)`},{group:'Escalera',tags:['PB','escalera']});
      Pt('ESC-'+p.escAlt+'z',`ESC-${p.escAlt} · zancas`,'cabio',st,{fn:'Zancas de 2″×10″.'},{group:'Escalera',tags:['PB','escalera']});
      Pt('ESC-'+p.escAlt+'r',`ESC-${p.escAlt} · pasamanos`,'acero',rods,{fn:'Pasamanos de caño a ambos lados.'},{group:'Escalera',tags:['PB','escalera']});}}
  /* estructura */
  for(const s of M.ESTRUCTURA){if(s.id==='V-03')continue;
        if(s.id==='CR-1'||s.id==='CR-2'||s.id==='CR-3')continue;
    if(s.id==='CER-2'){if(p.techos){const x0=2515.5,x1=2530.5,D=5,zg=y=>407-(y-581)*(161/360)-1,rz=y=>y<352?255+(y+2)*(252/354)-6:y<690?lin(ROOF.ridge,ROOF.front,y)-6:zg(y);
        const par=(y0,y1)=>{const z0=rz(y0),z1=rz(y1),a=Math.atan2(Math.abs(z1-z0),Math.abs(y1-y0)),d=D/Math.cos(a);return box8([[x0,z0-d,y0],[x1,z0-d,y0],[x1,z1-d,y1],[x0,z1-d,y1],[x0,z0,y0],[x1,z0,y0],[x1,z1,y1],[x0,z1,y1]]);};
        const mont=y=>box(x0,x1,255,rz(y)-D,y-2.5,y+2.5);
        Pt(s.id,`${s.id} · ${s.nombre}`,'cabio',[box(x0,x1,250,255,25,925),par(25,352),par(352,690),par(690,925),mont(352),mont(130),mont(575)],{...base(s),sec:s.sec,med:'tirante 9,0 m · todo 2″×6″ de canto'},{group:'Techos',tags:['TE','estructura','techos']});}continue;}
    if(s.id==='CER-1'){if(p.techos){/* foto 12: todo 2″×6″ con la cara ancha abajo (15 en el espesor de la pared, 5 de alto/ancho visto). Tirante apoyado sobre M-26,
        cortado por la puerta P-34 y sólo donde entra bajo los cabios; un poste a cada lado de la puerta (el derecho llega a la cumbrera) con dintel; un montante más afuera a cada lado. */
        const v=M.ABERTURAS.find(o=>o.id==='P-34'),Y0=-347.5,Y1=-332.5,T=335,u=x=>wingZ(x)-14,vx0=1817+(v?v.d:213),vx1=vx0+(v?v.w:80),vz1=(v?v.s+v.h:417),xr=(497-14-T-5)/(238/332),ta=Math.max(1835,2103-xr),tb=Math.min(2365,2103+xr);
        const post=(xc)=>box8([[xc-2.5,T,Y0],[xc+2.5,T,Y0],[xc+2.5,T,Y1],[xc-2.5,T,Y1],[xc-2.5,u(xc-2.5),Y0],[xc+2.5,u(xc+2.5),Y0],[xc+2.5,u(xc+2.5),Y1],[xc-2.5,u(xc-2.5),Y1]]);
        const dg=(xa,xb)=>box8([[xa,u(xa)-5,Y0],[xb,u(xb)-5,Y0],[xb,u(xb)-5,Y1],[xa,u(xa)-5,Y1],[xa,u(xa),Y0],[xb,u(xb),Y0],[xb,u(xb),Y1],[xa,u(xa),Y1]]);
        Pt(s.id,`${s.id} · ${s.nombre}`,'cabio',[dg(ta,2103),dg(2103,tb),box(ta,vx0-5,T,T+5,Y0,Y1),box(vx1+5,tb,T,T+5,Y0,Y1),post(vx0-2.5),post(vx1+2.5),box(vx0,vx1,vz1,vz1+5,Y0,Y1),post(1932),post(2274)],{...base(s),sec:s.sec,med:`tirante ${f1((tb-ta)/100)} m cortado por la puerta`},{group:'Techos',tags:['TE','estructura','techos']});}continue;}
    if(s.id==='TBL-1')continue;
    if(s.id==='POR-1'||s.id==='VQ-1'){if(!p.techos)continue;const zN=y=>lin([38,283],[352,507],y),zS=y=>lin(ROOF.ridge,ROOF.front,y);
      if(s.id==='POR-1'){const g=[],D=15,uP=y=>lin([38,283],[352,507],y)-2.5,uJ=y=>lin(ROOF.ridge,ROOF.front,y)-2.5;
        const par=(x,y0,y1,u)=>{const z0=u(y0),z1=u(y1),d=D/Math.cos(Math.atan2(Math.abs(z1-z0),Math.abs(y1-y0)));return box8([[x-2.5,z0-d,y0],[x+2.5,z0-d,y0],[x+2.5,z1-d,y1],[x-2.5,z1-d,y1],[x-2.5,z0,y0],[x+2.5,z0,y0],[x+2.5,z1,y1],[x-2.5,z1,y1]]);};
        for(let x=2555;x<=2946;x+=65){g.push(par(x,38,352,uP),par(x,352,690,uJ));}
        Pt(s.id,`${s.id} · ${s.nombre}`,'cabio',g,{...base(s),sec:s.sec,med:`${g.length/2} cabios continuos, cada 0,65`},{group:'Techos',tags:['TE','estructura','techos']});
        const tb=M.ESTRUCTURA.find(t=>t.id==='TBL-1');if(tb)Pt('TBL-1','TBL-1 · '+tb.nombre,'madera',[slabY(2523,2951,[38,uP(38)],[352,uP(352)],2.5),slabY(2523,2951,[352,uJ(352)],[690,uJ(690)],2.5)],{...base(tb),sec:tb.sec,med:'2 faldones'},{group:'Techos',tags:['TE','techos']});}
      else Pt(s.id,`${s.id} · ${s.nombre}`,'madera',[box(2523,2951,235,250,33,43)],{...base(s),sec:s.sec,med:'4,5 m'},{group:'Estructura',tags:['estructura']});continue;}
    if(s.id==='MON-1'){if(p.ep){const g=[];const zc=y=>468+(y+46)*(27/397),under=(x,y)=>{for(let r=32;r<=1332;r+=65)if(Math.abs(r-x)<5)return zc(y);return 478+(y+81)*(29/433);};
      for(let x=30;x<=1300;x+=240)g.push(box8([[x-2.5,367,-94],[x+2.5,367,-94],[x+2.5,367,-79],[x-2.5,367,-79],[x-2.5,under(x,-94),-94],[x+2.5,under(x,-94),-94],[x+2.5,under(x,-79),-79],[x-2.5,under(x,-79),-79]]));Pt(s.id,`${s.id} · ${s.nombre}`,'cabio',g,{...base(s),sec:s.sec,med:`${Math.floor((1300-30)/240)+1} parantes`},{group:'Entrepiso',tags:['EP','estructura']});}continue;}
    if(s.tipo==='columna'){const z0=s.id==='C-05'||s.id==='C-06'?-46:0,z1=s.id==='C-04'?242:s.id==='C-05'||s.id==='C-06'?255:350;const h=s.id==='C-04'?3:5.5;
      Pt(s.id,`${s.id} · ${s.nombre}`,'col',box(s.pos[0]-h,s.pos[0]+h,z0,z1,s.pos[1]-h,s.pos[1]+h),{...base(s),sec:s.sec,med:`alto ${f1((z1-z0)/100)} m`},{group:'Estructura',tags:['estructura']});}
    else if(s.id==='V-10'&&p.techos){const g=[];const z3=y=>255+(y+2)*(252/354);for(let x=1398;x<=2503;x+=65){const yv=(x>1771&&x<2442)?4+334*(1-Math.abs(x-2103)/332):28;g.push(slabY(x-2.5,x+2.5,[yv,z3(yv)-13],[352,492],13));}Pt(s.id,`${s.id} · ${s.nombre}`,'cabio',g,{...base(s),sec:s.sec,med:'18 cabios'},{group:'Techos',tags:['TE','estructura','techos']});}
    else if(s.id==='V-11'&&p.techos){const zg=y=>407-(y-581)*(161/360);const tail=x=>965;const g=[];const xs=[];for(let x=1350;x<=2920;x+=130)xs.push(x);xs.push(2946);for(const x of xs)g.push(slabY(x-3,x+3,[581,389],[tail(x),zg(tail(x))-18],17));Pt(s.id,`${s.id} · ${s.nombre}`,'cabio',g,{...base(s),sec:s.sec,med:'14 cabios; colas de 0,30 más allá de los paños, hasta el final del quincho'},{group:'Techos',tags:['TE','estructura','techos']});
      const th=Math.atan2(161,360);for(const [cid,cy] of [['CR-1',808],['CR-2',692],['CR-3',925]]){const cd=M.ESTRUCTURA.find(t=>t.id===cid);const cg=new THREE.BoxGeometry(2951-1347,17,6);cg.translate((1347+2951)/2,0,0);cg.rotateX(th);cg.translate(0,zg(cy)-8.5*Math.cos(th),cy-8.5*Math.sin(th));Pt(cid,`${cid} · ${cd.nombre}`,'cabio',[cg],{...base(cd),sec:cd.sec,med:'16,3 m'},{group:'Techos',tags:['TE','estructura','techos']});}}
    else if(s.id==='RA-1'){Pt(s.id,`${s.id} · ${s.nombre}`,'acero',[box(1353,2523,222,232,913,937)],{...base(s),sec:s.sec,med:'11,9 m'},{group:'Estructura',tags:['estructura']});}
    else if(s.id==='W-1'){Pt(s.id,`${s.id} · ${s.nombre}`,'acero',[box(900,2951,350,370,628,632),box(900,2951,350,353,622,638),box(900,2951,367,370,622,638)],{...base(s),sec:s.sec,med:'19,94 m'},{group:'Estructura',tags:['estructura']});}
    else if(s.tipo==='parante-ep'&&p.ep&&['c','ca'].includes(p.dormers)&&s.a[0]>DORM_C[0].xl-10&&s.a[0]<DORM_C[0].xr+10){/* con el dormer corrido el frente es el del dormer: los parantes de la franja quedarían delante del vidrio o atravesando la chapa */}
    else if(s.tipo==='parante-ep'&&p.ep){/* parante de 2″×6″ entre ventanas, canto chico hacia afuera y adentro (Maxi) */const x=s.a[0],y=s.a[1],z0=s.z||261,zt=lin([352,490],[684,350],Math.min(y,684))-2;
      Pt(s.id,`${s.id} · ${s.nombre}`,'cabio',[box(x-2.5,x+2.5,z0,zt,y+17.5-15,y+17.5)],{...base(s),sec:s.sec},{group:'Entrepiso',tags:['EP','aberturas']});}
    else if(s.tipo==='ventana-ep'&&p.ep&&['c','ca'].includes(p.dormers)&&['VE-1','VE-2','VE-3'].includes(s.id)){/* con el dormer corrido, la franja baja queda integrada a sus ventanas (Maxi 14/10) */}
    else if(s.tipo==='ventana-ep'&&p.ep){/* franja del entrepiso al jardín: contramarco fijo y hoja proyectante que abre hacia afuera, con amortiguadores */
      const x0=s.a[0],x1=s.b[0],y=s.a[1],z0=s.z||261,zt=lin([352,490],[684,350],Math.min(y,684))-2,f=6,yo=y+17.5-6;
      Pt(s.id+'m',`${s.id} · contramarco de roble`,'roble',[box(x0,x1,z0,z0+f,yo-4,yo+4),box(x0,x1,zt-f,zt,yo-4,yo+4),box(x0,x0+f,z0,zt,yo-4,yo+4),box(x1-f,x1,z0,zt,yo-4,yo+4)],{fn:'Contramarco fijo de madera color roble.',sec:'roble 6 cm'},{group:'Entrepiso',tags:['EP','aberturas',s.id]});
      const ang=(LUZ[s.id]||0)*Math.PI/180,hy=yo+4,hz=zt-f,M4=new THREE.Matrix4().makeTranslation(0,hz,hy).multiply(new THREE.Matrix4().makeRotationX(-ang)).multiply(new THREE.Matrix4().makeTranslation(0,-hz,-hy));HINGE[s.id]={y:hy,z:hz,s:-1,max:100,parts:[s.id+'h',s.id],dm:s.id+'d',ang:LUZ[s.id]||0};
      const sa=x0+f+.5,sb=x1-f-.5,za=z0+f+.5,zb=zt-f-.5,h=5,bx=(xa,xb,ya,yb)=>box(xa,xb,ya,yb,yo-2,yo+3).applyMatrix4(M4);
      Pt(s.id+'h',`${s.id} · hoja proyectante`,'roble',[bx(sa,sa+h,za,zb),bx(sb-h,sb,za,zb),bx(sa,sb,zb-h,zb),bx(sa,sb,za,za+h)],{fn:'Hoja de roble que cuelga de arriba y se proyecta hacia afuera. Arrastrala hacia arriba para abrirla y hacia abajo para cerrarla.',sec:'roble 5 cm'},{group:'Entrepiso',tags:['EP','aberturas',s.id]});
      Pt(s.id,`${s.id} · ${s.nombre}`,'glass',[box(sa+h,sb-h,za+h,zb-h,yo,yo+1).applyMatrix4(M4)],{...base(s),sec:'proyectante',med:`${f1((x1-x0)/100)} × ${f1((zt-z0)/100)} m`},{...ex(s),group:'Entrepiso',tags:['EP','aberturas'],opt:{noEdges:true}});
      if(ang>.01){const dm=[];for(const xd of [sa+3,sb-3]){const p0=new THREE.Vector3(xd,za+(zb-za)*.2,yo-4);const p1=new THREE.Vector3(xd,za+(zb-za)*.5,yo+3).applyMatrix4(M4);dm.push(rod(p0.toArray(),p1.toArray(),1,8));}
        Pt(s.id+'d',`${s.id} · amortiguadores`,'acero',dm,{fn:'Pistones a gas que sostienen la hoja abierta.'},{group:'Entrepiso',tags:['EP','aberturas',s.id]});}}
    else if(s.tipo==='ventana-gal'&&p.ep){/* galería sobre el patio (Maxi, 13/10): entre montantes, sobre el parapeto, un solo paño proyectante que abre hacia afuera (hacia el patio, −y), con amortiguadores */
      const x0=s.a[0],x1=s.b[0],z0=s.z||367,zt=478+(-94+81)*(29/433)-2,f=5,yo=-90;/* contramarco: de y −94 (cara de afuera de los montantes) a −86 */
      Pt(s.id+'m',`${s.id} · contramarco`,'roble',[box(x0,x1,z0,z0+f,yo-4,yo+4),box(x0,x1,zt-f,zt,yo-4,yo+4),box(x0,x0+f,z0,zt,yo-4,yo+4),box(x1-f,x1,z0,zt,yo-4,yo+4)],{fn:'Contramarco fijo entre montantes, sobre la tapa del parapeto.',sec:'roble 5 cm'},{group:'Entrepiso',tags:['EP','aberturas',s.id]});
      const ang=(LUZ[s.id]||0)*Math.PI/180,hy=yo-4,hz=zt-f,M4=new THREE.Matrix4().makeTranslation(0,hz,hy).multiply(new THREE.Matrix4().makeRotationX(ang)).multiply(new THREE.Matrix4().makeTranslation(0,-hz,-hy));HINGE[s.id]={y:hy,z:hz,s:1,max:100,parts:[s.id+'h',s.id],dm:s.id+'d',ang:LUZ[s.id]||0};
      const sa=x0+f+.5,sb=x1-f-.5,za=z0+f+.5,zb=zt-f-.5,h=5,bx=(xa,xb,ya,yb)=>box(xa,xb,ya,yb,yo-3,yo+2).applyMatrix4(M4);
      Pt(s.id+'h',`${s.id} · hoja proyectante`,'roble',[bx(sa,sa+h,za,zb),bx(sb-h,sb,za,zb),bx(sa,sb,zb-h,zb),bx(sa,sb,za,za+h)],{fn:'Hoja de un paño que cuelga de bisagras arriba (cara de afuera) y se proyecta hacia el patio. Arrastrala hacia arriba para abrirla.',sec:'roble 5 cm'},{group:'Entrepiso',tags:['EP','aberturas',s.id]});
      Pt(s.id,`${s.id} · ${s.nombre}`,'glass',[box(sa+h,sb-h,za+h,zb-h,yo-1,yo).applyMatrix4(M4)],{...base(s),sec:'proyectante de un paño',med:`${f1((x1-x0)/100)} × ${f1((zt-z0)/100)} m`},{...ex(s),group:'Entrepiso',tags:['EP','aberturas'],opt:{noEdges:true}});
      if(ang>.01){const dm=[];for(const xd of [sa+3,sb-3]){const p0=new THREE.Vector3(xd,za+(zb-za)*.2,yo+4);const p1=new THREE.Vector3(xd,za+(zb-za)*.5,yo-3).applyMatrix4(M4);dm.push(rod(p0.toArray(),p1.toArray(),1,8));}
        Pt(s.id+'d',`${s.id} · amortiguadores`,'acero',dm,{fn:'Pistones a gas que sostienen la hoja abierta.'},{group:'Entrepiso',tags:['EP','aberturas',s.id]});}}
    else if(s.id==='CIE-1'&&p.ep){const zu=y=>478+(y+81)*(29/433)-.5;const gl=box8([[-1,367,-96],[1,367,-96],[1,367,7.5],[-1,367,7.5],[-1,zu(-96),-96],[1,zu(-96),-96],[1,zu(7.5),7.5],[-1,zu(7.5),7.5]]);
      Pt(s.id,`${s.id} · ${s.nombre}`,'chapa',[box(-2,0,240,367,-98,7.5)],{...base(s),sec:s.sec,med:'1,05 de chapa + ventana hasta el techo'},{...ex(s),group:'Entrepiso',tags:['EP','estructura']});
      Pt('CIE-1v','CIE-1 · ventana','glass',[gl],{fn:'Ventana sobre el parapeto, del alto de la baranda hasta el techo.'},{group:'Entrepiso',tags:['EP','aberturas','CIE-1'],opt:{noEdges:true}});
      Pt('CIE-1m','CIE-1 · marco de roble','roble',[box(-2.5,2.5,367,372,-96,7.5),box(-2.5,2.5,367,zu(-96),-96,-91),box(-2.5,2.5,367,zu(7.5),2.5,7.5)],{fn:'Marco de la ventana del extremo sur.'},{group:'Entrepiso',tags:['EP','aberturas','CIE-1']});}
    else if(s.id==='CIE-2'&&p.ep){const zu=y=>478+(y+81)*(29/433)-.5;const ch=M.CHIMENEAS.find(c=>c.id==='CH-1'),xc=ch?ch.pos[0]-ch.w/2:1332.5,yc=ch?ch.pos[1]-ch.dp/2:40;Pt(s.id,`${s.id} · ${s.nombre}`,'chapa',[box8([[xc-2,240,-98],[xc,240,-98],[xc,240,yc],[xc-2,240,yc],[xc-2,zu(-98),-98],[xc,zu(-98),-98],[xc,zu(yc),yc],[xc-2,zu(yc),yc]]),box(1323,xc,240,262,-98,-77)],{...base(s),sec:s.sec,med:'del piso de la galería al techo'},{...ex(s),group:'Entrepiso',tags:['EP','estructura']});}
    else if(s.id==='BAR-1'&&p.ep){Pt(s.id,`${s.id} · ${s.nombre}`,'chapa',[box(0,1323,240,367,-98,-96)],{...base(s),sec:s.sec,med:'13,2 m · 1,05 de alto'},{...ex(s),group:'Entrepiso',tags:['EP','estructura']});Pt('BAR-1i','BAR-1 · cara interior de fenólico y tapa','ep',[box(0,1323,262,367,-79,-77),box(0,1323,367,370,-94,-75)],{fn:'Fenólico del lado de la galería y tabla de remate sobre el parapeto.',sec:'fenólico 18 mm · tapa 2″×8″'},{group:'Entrepiso',tags:['EP','estructura','BAR-1']});}
    else if(s.id==='TIR-1'&&p.ep){const g=[];const yEnd=x=>x<=993?690:x<=1318?620:YEDGE;for(let x=65;x<=1410;x+=61)g.push(box(x-2.5,x+2.5,240,260,25,yEnd(x)));/* tirante de borde bajo el canto del voladizo, al ras de la cara norte de ESC-ZE2 (Maxi) */g.push(box(1437,1442,240,260,25,YEDGE));Pt(s.id,`${s.id} · ${s.nombre}`,'cabio',g,{...base(s),sec:s.sec,med:`${Math.floor((1499-132)/61)+1} tirantes; terminan dentro de la fachada (M-05 / M-07)`},{group:'Entrepiso',tags:['EP','estructura']});}
    else if(s.id==='COS-1'&&p.ep){const g=[];for(let x=30;x<=1300;x+=61)g.push(box(x-2.5,x+2.5,246,260,-95,100));Pt(s.id,`${s.id} · ${s.nombre}`,'cabio',g,{...base(s),sec:s.sec,med:`${Math.floor((1300-30)/61)+1} tirantes`},{group:'Entrepiso',tags:['EP','estructura']});}
    else if(s.id==='MON-1'&&p.ep){const g=[];for(let x=30;x<=1300;x+=61)g.push(box(x-2.5,x+2.5,262,roofZ(-82,0)-8,-82,-77));Pt(s.id,`${s.id} · ${s.nombre}`,'cabio',g,{...base(s),sec:s.sec},{group:'Entrepiso',tags:['EP','estructura']});}
    else if(s.id==='CAB-2'&&p.techos){const g=[];const zc=y=>468+(y+46)*(27/397),yE=-124;for(let x=32;x<=1332;x+=65)g.push(slabY(x-2.5,x+2.5,[yE,zc(yE)],[351,495],7));Pt(s.id,`${s.id} · ${s.nombre}`,'cabio',g,{...base(s),sec:s.sec,med:'21 cabios'},{group:'Techos',tags:['TE','estructura','techos']});}
    else if(s.id==='CAB-3'&&p.techos){const g=[],rb=y=>lin([352,490],[684,350],y),LUs=M.TECHOS.filter(l=>/^LU-/.test(l.id)&&!DORM_SKIP(p).includes(l.id)),LU=LUs.map(l=>{const xs=l.poly.map(q=>q[0]),ys=l.poly.map(q=>q[1]);return [Math.min(...xs)-6,Math.max(...xs)+6,Math.min(...ys)-6,Math.max(...ys)+6];});
      if(DORM_ON(p))for(const d of DORM_J_(p))LU.push([d.xl+3,d.xr-3,300,760]);/* los cabios del medio se sacan enteros: los reemplaza el dormer */
      for(let x=32;x<=1332;x+=65){let segs=[[352,684]];for(const [a,b,c,d] of LU)if(x+2.5>a&&x-2.5<b)segs=segs.flatMap(([u,v])=>d<=u||c>=v?[[u,v]]:[[u,c],[d,v]].filter(([p,q])=>q-p>5));for(const [u,v] of segs)g.push(slabY(x-2.5,x+2.5,[u,rb(u)],[v,rb(v)],12));}
      LU.forEach(([a,b,c,d],i)=>{if(!LUs[i]||['LU-1','LU-2'].includes(LUs[i].id))return;/* Maxi: sin cabezales en LU-1 y LU-2 */const xa=32+65*Math.floor((a-32)/65)-2.5,xb=32+65*Math.ceil((b-32)/65)+2.5;Pt(LUs[i].id+'k',`${LUs[i].id} · cabezales`,'cabio',[slabY(xa,xb,[c-5,rb(c-5)],[c,rb(c)],12),slabY(xa,xb,[d,rb(d)],[d+5,rb(d+5)],12)],{fn:`Cabezales arriba y abajo del agujero de ${LUs[i].id}: reciben los cabios de CAB-3 que se cortaron para la lucarna y descargan en los cabios enteros de cada lado.`,sec:'misma sección que los cabios',med:`${f1((xb-xa)/100)} m c/u`},{group:'Techos',tags:['TE','estructura','techos',LUs[i].id]});});Pt(s.id,`${s.id} · ${s.nombre}`,'cabio',g,{...base(s),sec:s.sec,med:'21 cabios'},{group:'Techos',tags:['TE','estructura','techos']});}}

  /* ---------- cabios que faltaban (Maxi 14/10, fotos 10 y 13): living (los dos faldones) y ala, cada 65 como CAB-2/CAB-3, y limahoyas ---------- */
  if(p.techos){const TEc={group:'Techos',tags:['TE','estructura','techos']};const rb=y=>lin([352,490],[684,350],y),z3=y=>255+(y+2)*(252/354);
    const yv=x=>x<2103?4+(x-1771)*(334/332):4+(2442-x)*(334/339);
    /* faldón al jardín sobre el living (sigue a CAB-3) */const g4=[];for(let x=32+65*Math.ceil((1340-32)/65);x<=2520;x+=65)g4.push(slabY(x-2.5,x+2.5,[352,rb(352)],[684,rb(684)],12));
    Pt('CAB-4','CAB-4 · Cabios del faldón al jardín sobre el living','cabio',g4,{fn:'Cabios cada 65 de la cumbrera al alero, como CAB-3; a la vista desde el living con el machimbre encima (foto 13).',sec:'5 × 12 cada 65',med:`${g4.length} cabios`},TEc);
    /* faldón al patio sobre el living: entre x 17,71 y 24,42 los corta la limahoya del techo del ala */const g5=[];for(let x=1330;x<=2520;x+=65){const y0=(x>1771&&x<2442)?Math.max(-2,yv(x)):-2;if(352-y0<20)continue;g5.push(slabY(x-2.5,x+2.5,[y0,z3(y0)-12],[352,z3(352)-12],12));}
    Pt('CAB-5','CAB-5 · Cabios del faldón al patio sobre el living','cabio',g5,{fn:'Cabios cada 65 del alero del patio a la cumbrera; entre el ala y el living mueren contra las limahoyas.',sec:'5 × 12 cada 65',med:`${g5.length} cabios`},TEc);
    /* techo a dos aguas del ala: cabios a lo ancho (en x), cada 65 a lo largo; en el tramo de la limahoya van de la limahoya a la cumbrera */
    const g6=[],D=DORM_A,alt=DORM_ALT(p),seg=(y,x0,x1)=>{if(x1-x0>15)g6.push(slabX(y-2.5,y+2.5,[x0,wingZ(x0)-12],[x1,wingZ(x1)-12],12));};
    for(let y=-825;y<336;y+=65){const xl=y>4?1771+(y-4)*(332/334):1771,xr=y>4?2442-(y-4)*(339/334):2442;seg(y,xl,2098);
      if(alt&&y>D.y0-12&&y<D.y1+12){seg(y,2108,D.x0);seg(y,D.xf+5,xr);}else seg(y,2108,xr);}
    Pt('CAB-6','CAB-6 · Cabios del techo del ala (dos aguas)','cabio',g6,{fn:'Cabios cada 65 a los dos lados de la cumbrera CU-2; entre la cocina y el living llegan a las limahoyas. Medidas supuestas iguales al resto (5 × 12): verificar en obra.',sec:'5 × 12 cada 65 (supuesto)',med:`${g6.length} tramos`},TEc);
    const lim=(a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy),nx=-dy/L*4,ny=dx/L*4,za=z3(a[1])-20,zb=z3(b[1])-20;return box8([[a[0]+nx,za,a[1]+ny],[a[0]-nx,za,a[1]-ny],[b[0]-nx,zb,b[1]-ny],[b[0]+nx,zb,b[1]+ny],[a[0]+nx,za+20,a[1]+ny],[a[0]-nx,za+20,a[1]-ny],[b[0]-nx,zb+20,b[1]-ny],[b[0]+nx,zb+20,b[1]+ny]]);};
    Pt('LIM-1','LIM-1 · Limahoyas del living y el ala','cabio',[lim([1771,4],[2103,338]),lim([2442,4],[2103,338])],{fn:'Las dos vigas en diagonal donde se encuentran el faldón al patio del living y el techo del ala (foto 13): reciben los cabios cortados de los dos techos.',sec:'8 × 20'},TEc);}
  /* ---------- dormers: un agua, con su esqueleto ---------- */
  if(p.techos&&DORM_ON(p)){const TE={group:'Techos',tags:['TE','techos','dormers']};
    const wYZ=(x0,x1,y0,y1,zb,zt)=>box8([[x0,zb(y0),y0],[x1,zb(y0),y0],[x1,zb(y1),y1],[x0,zb(y1),y1],[x0,zt(y0),y0],[x1,zt(y0),y0],[x1,zt(y1),y1],[x0,zt(y1),y1]]);
    const wXZ=(y0,y1,x0,x1,zb,zt)=>box8([[x0,zb(x0),y0],[x1,zb(x1),y0],[x1,zb(x1),y1],[x0,zb(x0),y1],[x0,zt(x0),y0],[x1,zt(x1),y0],[x1,zt(x1),y1],[x0,zt(x0),y1]]);
    const RT=y=>lin(ROOF.ridge,ROOF.front,y)+6,rb=y=>lin([352,490],[684,350],y),T4=Math.tan(4*Math.PI/180);
    for(const d of DORM_J_(p)){const {xa,xb,xl,xr}=d,DT=y=>502-(y-352)*T4,DU=y=>DT(y)-15,YF=690,Z0=d.integrada?262:350,zw0=d.integrada?268:362,zw1=445,zwt=d.integrada?348:405,W2=d.ventanas||[[xa+15,xb-15]];
      const es=[],ch=[],gl=[],mk=[],tc=[],fl=[];
      /* 1 · cabios dobles a cada lado (al existente se le atornilla uno nuevo) y cabezal doble contra la cumbrera */
      for(const x of [xl+5,xr-5])es.push(slabY(x-2.5,x+2.5,[352,rb(352)],[684,rb(684)],12));
      es.push(box(xl+7.5,xr-7.5,rb(352),rb(352)+12,352,362));
      /* 2 · frente: solera baja sobre la viga de borde de la fachada, montantes de 2″×4″ cada 40, dintel doble y solera alta doble */
      es.push(box(xa-7.5,xb+7.5,Z0,Z0+5,YF-7,YF+5),box(xa-7.5,xb+7.5,DU(YF)-10,DU(YF),YF-7,YF+5));for(const [xw0,xw1] of W2)es.push(box(xw0-5,xw1+5,zw1,zw1+15,YF-7,YF+5));
      for(const xp of d.postes||[])es.push(box(xp-5,xp+5,262,rb(357),352,362));/* postes bajo el cabezal largo, sobre los tabiques */
      const sx=[xa-7.5];for(let x=xa;x<xb;x+=40)sx.push(x);sx.push(xb+2.5);
      for(const x of sx){const inW=W2.some(([xw0,xw1])=>x>xw0-5&&x<xw1);if(!inW)es.push(box(x,x+5,Z0+5,DU(YF)-10,YF-7,YF+5));else es.push(box(x,x+5,Z0+5,zw0-5,YF-7,YF+5),box(x,x+5,zw1+15,DU(YF)-10,YF-7,YF+5));}
      for(const [xw0,xw1] of W2)es.push(box(xw0-10,xw0-5,Z0+5,zw1,YF-7,YF+5),box(xw1+5,xw1+10,Z0+5,zw1,YF-7,YF+5),box(xw0-5,xw1+5,zw0-5,zw0,YF-7,YF+5));
      /* 3 · laterales: solera inclinada sobre el cabio doble, montantes cada 40 hasta los cabios del dormer */
      for(const x of [xa-7.5,xb+2.5]){es.push(wYZ(x,x+5,362,YF-7,y=>rb(y)+12,y=>rb(y)+17));for(let y=400;y<YF-10;y+=40){const zb=rb(y)+17,zt=DU(y);if(zt-zb>8)es.push(box(x,x+5,zb,zt,y-2.5,y+2.5));}}
      /* 4 · cabios del dormer 2″×6″ cada ~50, del cabezal al frente con 25 de alero */
      const nr=Math.max(2,Math.round((xb-xa)/50));for(let i=0;i<=nr;i++){const x=xa-5+(xb-xa+10)*i/nr;es.push(slabY(x-2.5,x+2.5,[357,DU(357)],[YF+25,DU(YF+25)],15));}
      /* 5 · machimbre, aislación y chapa (4°), babetas y cupertina */
      const punta=xa-7.5<=5,xt0=punta?-43:xa-15;/* Maxi 15/10: si el dormer llega a la pared del fondo, su chapa vuela como el alero del hastial (x −0,43) y no queda una tira de faldón al costado */
      tc.push(slabY(xt0,xb+15,[350,DT(350)+3],[YF+30,DT(YF+30)+3],3));es.push(slabY(punta?-40:xa-12,xb+12,[352,DT(352)],[YF+28,DT(YF+28)],2.5));
      for(const [x0,x1] of [[xa-9,xa-7.5],[xb+7.5,xb+9]])ch.push(wYZ(x0,x1,352,YF+5,RT,DT));
      ch.push(box(xa-9,xb+9,Z0,zw0,YF+5,YF+6.5),box(xa-9,xb+9,zw1,DT(YF+6),YF+5,YF+6.5));{let px=xa-9;for(const [xw0,xw1] of W2){if(xw0-px>1)ch.push(box(px,xw0,zw0,zw1,YF+5,YF+6.5));px=xw1;}if(xb+9-px>1)ch.push(box(px,xb+9,zw0,zw1,YF+5,YF+6.5));}
      for(const [x0,x1] of punta?[[xb+9,xb+14]]:[[xa-14,xa-9],[xb+9,xb+14]])fl.push(wYZ(x0,x1,352,YF,RT,y=>RT(y)+10));fl.push(box(punta?-43:xa-12,xb+12,DT(YF+30)-2,DT(YF+30)+4,YF+29,YF+31));
      /* 6 · ventana: paño fijo arriba y hoja proyectante abajo, marco de roble */
      for(const [xw0,xw1] of W2){mk.push(box(xw0,xw1,zw0,zw0+5,YF+1,YF+6),box(xw0,xw1,zw1-5,zw1,YF+1,YF+6),box(xw0,xw0+5,zw0,zw1,YF+1,YF+6),box(xw1-5,xw1,zw0,zw1,YF+1,YF+6),box(xw0,xw1,zwt-2.5,zwt+2.5,YF+1,YF+6));
      gl.push(box(xw0+5,xw1-5,zw0+5,zwt-2.5,YF+3,YF+3.6));if(!d.integrada)gl.push(box(xw0+5,xw1-5,zwt+2.5,zw1-5,YF+3,YF+3.6));}
      if(d.integrada)W2.forEach(([xw0,xw1],k)=>{/* Maxi 14/10: en el dormer corrido el paño de arriba es una hoja proyectante (cuelga de arriba, abre hacia el jardín) y el de abajo queda fijo */
        const id=`${d.id}p${k+1}`,hy=YF+6,hz=zw1-5,ang=(LUZ[id]||0)*Math.PI/180,M4=new THREE.Matrix4().makeTranslation(0,hz,hy).multiply(new THREE.Matrix4().makeRotationX(-ang)).multiply(new THREE.Matrix4().makeTranslation(0,-hz,-hy));
        HINGE[id]={y:hy,z:hz,s:-1,max:100,parts:[id+'h',id],dm:id+'d',ang:LUZ[id]||0};
        const sa=xw0+5.5,sb=xw1-5.5,za=zwt+3,zb=zw1-5.5,h=5,bq=(xa,xb,ya,yb)=>box(xa,xb,ya,yb,YF+1.5,YF+5.5).applyMatrix4(M4);
        Pt(id+'h',`${id} · hoja proyectante`,'roble',[bq(sa,sa+h,za,zb),bq(sb-h,sb,za,zb),bq(sa,sb,zb-h,zb),bq(sa,sb,za,za+h)],{fn:'Hoja de roble del paño de arriba: cuelga de bisagras en el travesaño alto y se proyecta hacia el jardín. Arrastrala hacia arriba para abrirla y hacia abajo para cerrarla.',sec:'roble 5 cm',med:`${f1((sb-sa)/100)} × ${f1((zb-za)/100)} m`},{...TE,tags:[...TE.tags,id]});
        Pt(id,`${id} · vidrio de la hoja proyectante`,'glass',[box(sa+h,sb-h,za+h,zb-h,YF+3,YF+3.6).applyMatrix4(M4)],{fn:'Vidrio de la hoja proyectante de arriba; el paño de abajo es fijo.'},{...TE,tags:[...TE.tags,id],opt:{noEdges:true}});
        if(ang>.01){const dm=[];for(const xd of [sa+4,sb-4]){const p0=new THREE.Vector3(xd,zwt-8,YF+5.5),p1=new THREE.Vector3(xd,za+(zb-za)*.45,YF+1.5).applyMatrix4(M4);dm.push(rod(p0.toArray(),p1.toArray(),1,8));}
          Pt(id+'d',`${id} · amortiguadores`,'acero',dm,{fn:'Dos pistones a gas por adentro: abajo en el travesaño del medio, arriba en la hoja.'},{...TE,tags:[...TE.tags,id]});}});
      const W=f1((xb-xa)/100),hf=f1((DU(YF)-262)/100);
      Pt(d.id,`${d.id} · Dormer al jardín`,'chapa',ch,{fn:`Dormer de un agua sobre el ${d.local}, al ras de la fachada. Laterales y frente revestidos en chapa negra. Alto libre adentro: ${f1((DU(400)-262)/100)} junto a la cumbrera, ${hf} en el frente.`,sec:'chapa lisa negra sobre fenólico',med:`${W} m de ancho libre · techo a 4°`},{...TE});
      Pt(d.id+'e',`${d.id} · esqueleto`,'cabio',es,{fn:`Cómo se arma (en este orden): 1) atornillar un cabio nuevo a cada cabio que queda de borde (x ${f1(xl/100)} y ${f1(xr/100)}): cabios dobles; 2) cabezal doble de 2″×6″ contra la cumbrera, entre los dobles; 3) sacar los cabios del medio; 4) solera baja sobre la viga de borde de la fachada (verificar que tome el frente: ~${Math.round((xb-xa)/100*180)} kg), montantes de 2″×4″ cada 40, dintel doble sobre la ventana y solera alta doble; 5) laterales: solera inclinada sobre cada cabio doble y montantes cada 40; 6) cabios del dormer de 2″×6″ cada ~50, colgados del cabezal con estribos y apoyados en la solera alta, 25 de alero; 7) machimbre, barrera de vapor, aislación de 50, fenólico y chapa; babetas a los costados y cupertina al frente.`,sec:'2″×6″ cabios, cabezal y dobles · 2″×4″ montantes y soleras',med:`${nr+1} cabios de dormer · ${sx.length} montantes al frente`},{...TE});
      Pt(d.id+'t',`${d.id} · techo de chapa`,'techo',tc,{fn:'Chapa sinusoidal como el resto, a 4° (pendiente mínima con solape de una onda y sellador).'},{...TE});
      Pt(d.id+'z',`${d.id} · zinguería`,'acero',fl,{fn:'Babetas a los dos costados (chapa plegada bajo la chapa del faldón y contra el lateral) y cupertina al frente.'},{...TE});
      Pt(d.id+'m',`${d.id} · marco de la ventana`,'roble',mk,{fn:d.integrada?'Contramarco de las ventanas del dormer corrido, de piso a techo: paño fijo abajo y hoja proyectante arriba.':'Ventana del dormer: paño fijo arriba y hoja proyectante abajo, sobre la franja de ventanas VE de la fachada.'},{...TE});
      Pt(d.id+'v',`${d.id} · vidrios`,'glass',gl,{fn:'Vidrios del dormer.'},{...TE,opt:{noEdges:true}});
      if(d.integrada&&xa-7.5>31)Pt(d.id+'f',`${d.id} · cierre de la punta sur`,'chapa',[box(30,xa-7.5,262,352,YF-7,YF+6)],{fn:'Con el dormer corrido la franja VE-1…3 se reemplaza por las ventanas del dormer, de piso a techo; este paño cierra lo que queda de VE-1 al sur.'},{...TE});}
    if(DORM_ALT(p)){/* DM-3: altillo, faldón norte del ala (hacia la pileta), un agua a 6° */
      const D=DORM_A,T6=Math.tan(6*Math.PI/180),DT=x=>495-(x-D.x0)*T6,DU=x=>DT(x)-15,RW=x=>wingZ(x)+6,RU=x=>wingZ(x)-15,XF=D.xf,ym=(D.y0+D.y1)/2,yw0=ym-120,yw1=ym+120,zw0=350,zw1=440;
      const es=[],ch=[],gl=[],mk=[],tc=[],fl=[];
      for(const y of [D.y0-5,D.y1+5])es.push(slabX(y-5,y+5,[2103,RU(2103)],[2442,RU(2442)],15));/* cabios dobles del ala (supuestos 2″×6″) a los lados */
      es.push(box(D.x0-10,D.x0,RU(D.x0),RU(D.x0)+15,D.y0,D.y1));/* cabezal doble arriba */
      es.push(box(XF-7,XF+5,RW(XF)-2,RW(XF)+3,D.y0-10,D.y1+10),box(XF-7,XF+5,DU(XF)-10,DU(XF),D.y0-10,D.y1+10),box(XF-7,XF+5,zw1,zw1+15,yw0-5,yw1+5),box(XF-7,XF+5,zw0-5,zw0,yw0-5,yw1+5));
      for(let y=D.y0-10;y<=D.y1+5;y+=40){const inW=y>yw0-5&&y<yw1;if(!inW)es.push(box(XF-7,XF+5,RW(XF)+3,DU(XF)-10,y,y+5));else es.push(box(XF-7,XF+5,RW(XF)+3,zw0-5,y,y+5),box(XF-7,XF+5,zw1+15,DU(XF)-10,y,y+5));}
      es.push(box(XF-7,XF+5,RW(XF)+3,zw1,yw0-10,yw0-5),box(XF-7,XF+5,RW(XF)+3,zw1,yw1+5,yw1+10));
      for(const y of [D.y0-10,D.y1+5]){es.push(wXZ(y,y+5,D.x0,XF-7,x=>RW(x),x=>RW(x)+5));for(let x=D.x0+40;x<XF-10;x+=40){const zb=RW(x)+5,zt=DU(x);if(zt-zb>8)es.push(box(x-2.5,x+2.5,zb,zt,y,y+5));}}
      const nr=Math.max(2,Math.round((D.y1-D.y0)/50));for(let i=0;i<=nr;i++){const y=D.y0-5+(D.y1-D.y0+10)*i/nr;es.push(slabX(y-2.5,y+2.5,[D.x0,DU(D.x0)],[XF+25,DU(XF+25)],15));}
      es.push(slabX(D.y0-12,D.y1+12,[D.x0,DT(D.x0)],[XF+28,DT(XF+28)],2.5));tc.push(slabX(D.y0-15,D.y1+15,[D.x0-8,DT(D.x0-8)+3],[XF+30,DT(XF+30)+3],3));
      for(const [y0,y1] of [[D.y0-12,D.y0-10],[D.y1+10,D.y1+12]])ch.push(wXZ(y0,y1,D.x0,XF+5,RW,DT));
      ch.push(box(XF+5,XF+6.5,RW(XF),zw0,D.y0-12,D.y1+12),box(XF+5,XF+6.5,zw1,DT(XF+6),D.y0-12,D.y1+12),box(XF+5,XF+6.5,zw0,zw1,D.y0-12,yw0),box(XF+5,XF+6.5,zw0,zw1,yw1,D.y1+12));
      for(const [y0,y1] of [[D.y0-17,D.y0-12],[D.y1+12,D.y1+17]])fl.push(wXZ(y0,y1,D.x0-8,XF+5,RW,x=>RW(x)+10));fl.push(box(XF+5,XF+12,RW(XF),RW(XF)+12,D.y0-15,D.y1+15),box(XF+29,XF+31,DT(XF+30)-2,DT(XF+30)+4,D.y0-15,D.y1+15));
      mk.push(box(XF+1,XF+6,zw0,zw0+5,yw0,yw1),box(XF+1,XF+6,zw1-5,zw1,yw0,yw1),box(XF+1,XF+6,zw0,zw1,yw0,yw0+5),box(XF+1,XF+6,zw0,zw1,yw1-5,yw1));gl.push(box(XF+3,XF+3.6,zw0+5,zw1-5,yw0+5,yw1-5));
      Pt(D.id,`${D.id} · Dormer del altillo (a la pileta)`,'chapa',ch,{fn:`Dormer de un agua en el faldón norte del ala, mirando a la pileta (queda adelante a la derecha). Frente retirado ${f1((2442-XF)/100)} del alero. Alto libre adentro: ${f1((DU(XF)-262)/100)} en el frente; la ventana tiene antepecho de ${f1((zw0-262)/100)}.`,sec:'chapa lisa negra sobre fenólico',med:`${f1((D.y1-D.y0)/100)} m de ancho libre · techo a 6°`},{...TE,tags:['TE','techos','dormers','altillo']});
      Pt(D.id+'e',`${D.id} · esqueleto`,'cabio',es,{fn:'Cómo se arma: 1) cabios dobles del ala a cada lado del hueco (los del ala no están relevados: supongo 2″×6″ cada ~60; medirlos antes); 2) cabezal doble bajo la cumbrera; 3) cortar los cabios del medio y colgarlos del cabezal; 4) frente sobre el faldón: solera sobre los cabios, montantes de 2″×4″ cada 40, dintel doble, solera alta doble; 5) laterales con solera inclinada y montantes cada 40; 6) cabios del dormer de 2″×6″ cada ~50 con 25 de alero; 7) machimbre, aislación, fenólico, chapa, babetas, cupertina y la babeta de pie al frente.',sec:'2″×6″ y 2″×4″'},{...TE,tags:['TE','techos','dormers','altillo']});
      Pt(D.id+'t',`${D.id} · techo de chapa`,'techo',tc,{fn:'Chapa a 6°.'},{...TE});Pt(D.id+'z',`${D.id} · zinguería`,'acero',fl,{fn:'Babetas a los costados, babeta de pie al frente (donde el frente apoya en el faldón) y cupertina.'},{...TE});
      Pt(D.id+'m',`${D.id} · marco de la ventana`,'roble',mk,{fn:'Ventana de 2,40 × 0,90, paño fijo o proyectante.'},{...TE});Pt(D.id+'v',`${D.id} · vidrio`,'glass',gl,{fn:'Vidrio del dormer del altillo.'},{...TE,opt:{noEdges:true}});}}
  /* techos */
  const zT2=y=>478+(y+81)*(29/433);   // cara inferior de T-02 (faldón al patio)
  if(p.techos){for(const t of M.TECHOS){if(t.linea)continue;let g;const [x0,x1]=[Math.min(...t.poly.map(q=>q[0])),Math.max(...t.poly.map(q=>q[0]))];
    if(t.id==='T-01'){/* faldón con los agujeros de las lucarnas (siguen a las lucarnas si se mueven) */let tp=t.poly;if(DORM_ON(p)){/* dormers al ras de la fachada: el faldón se corta de la cumbrera al borde, alero incluido */const n=[];for(const q of t.poly){n.push(q);}tp=[[-43,352],[2523,352],[2523,690],[993,690],[993,738],...[...DORM_J_(p)].reverse().flatMap(d=>d.xa-7.5<=5?[[d.xb+7.5,738],[d.xb+7.5,DORM_Y0],[-43,DORM_Y0]]:[[d.xb+7.5,738],[d.xb+7.5,DORM_Y0],[d.xa-7.5,DORM_Y0],[d.xa-7.5,738]]),...(DORM_J_(p).some(d=>d.xa-7.5<=5)?[]:[[-43,738]])];}const sh=new THREE.Shape(tp.map(q=>new THREE.Vector2(q[0],-q[1])));
      for(const l of M.TECHOS.filter(l=>/^LU-/.test(l.id)&&!DORM_SKIP(p).includes(l.id))){const xs=l.poly.map(q=>q[0]),ys=l.poly.map(q=>q[1]);/* el agujero nunca toca el borde del faldón */const eave=Math.max(...xs)>993?690:738;if(Math.max(...ys)>eave-10)ys.push(...ys.map(()=>eave-10)),ys.splice(0,ys.length,...ys.map(y=>Math.min(y,eave-10)));if(Math.min(...xs)<x0+10||Math.max(...xs)>x1-10)continue;sh.holes.push(new THREE.Path([[Math.min(...xs),Math.min(...ys)],[Math.min(...xs),Math.max(...ys)],[Math.max(...xs),Math.max(...ys)],[Math.max(...xs),Math.min(...ys)]].map(q=>new THREE.Vector2(q[0],-q[1]))));}
      g=[geo.mapGeo(new THREE.ExtrudeGeometry(sh,{depth:6,bevelEnabled:false,curveSegments:1}),(u,v,w)=>[u,lin(ROOF.ridge,ROOF.front,-v)+w,-v])];}
    else if(t.id==='T-02'){const y0=Math.min(...t.poly.map(q=>q[1]));g=slabY(x0,x1,[y0,zT2(y0)],[352,507],6);}
    else if(t.id==='T-03'){const z3=y=>255+(y+2)*(252/354);const q=pts=>box8([...pts.map(([x,y])=>[x,z3(y),y]),...pts.map(([x,y])=>[x,z3(y)+6,y])]);g=[slabY(1322,1771,[-2,255],[352,507],6),slabY(2442,2523,[-2,255],[352,507],6),q([[1771,4],[2103,338],[2103,352],[1771,352]]),q([[2103,338],[2442,4],[2442,352],[2103,352]])];}
    else if(t.id==='T-04'||t.id==='T-07'){/* vidrios sueltos: uno por tramo entre cabios (cada 1,30) y dos a lo largo, cortados en la correa CR-1 (y 8,08) */
      const zg=y=>407-(y-581)*(161/360)+1;const xs=[];for(let x=1350;x<=2920;x+=130)xs.push(x);xs.push(2946);const xr=xs.filter(x=>x>=x0-1&&x<=x1+1);if(xr[0]>x0+1)xr.unshift(x0);if(xr[xr.length-1]<x1-1)xr.push(x1);g=[];
      for(let i=0;i<xr.length-1;i++)if(xr[i+1]-xr[i]>12)for(const [ya,yb] of [[690,807],[809,965]])g.push(slabY(xr[i]+3.5,xr[i+1]-3.5,[ya,zg(ya)],[yb,zg(yb)],1));}
    else if(t.id==='T-05')g=[slabY(2523,2951,[352,507],[690,lin(ROOF.ridge,ROOF.front,690)],6),slabY(2523,2951,[38,283],[352,507],6)];
    else if(t.id==='T-06'){const q=(pts)=>box8([...pts.map(([x,y])=>[x,wingZ(x),y]),...pts.map(([x,y])=>[x,wingZ(x)+6,y])]);g=[q([[1771,-828],[2103,-828],[2103,338],[1771,4]])];
      if(DORM_ALT(p)){const D=DORM_A;g.push(q([[2103,-828],[2442,-828],[2442,D.y0-7.5],[2103,D.y0-7.5]]),q([[2103,D.y1+7.5],[2442,D.y1+7.5],[2442,4],[2103,338]]),q([[2103,D.y0-7.5],[D.x0,D.y0-7.5],[D.x0,D.y1+7.5],[2103,D.y1+7.5]]),q([[D.xf+8,D.y0-7.5],[2442,D.y0-7.5],[2442,D.y1+7.5],[D.xf+8,D.y1+7.5]]));}
      else g.push(q([[2103,-828],[2442,-828],[2442,4],[2103,338]]));}
    else if(DORM_SKIP(p).includes(t.id))continue;
    else if(t.id.startsWith('LU')){/* Lucarna (Maxi, 13/10). Todo se arma en el plano del faldón (cortes a escuadra, nada a plomo):
        x a lo largo de la cumbrera, t pendiente abajo, h perpendicular al faldón (0 = cara de la chapa).
        · Marco fijo: 2″×6″ de canto alrededor del agujero, de h −6 a h 14.
        · Marco móvil: 2″×6″ de canto por AFUERA del fijo (luz 0,5), de h 3 a h 17; vidrio de 1 cm apoyado en su canto, al ras de los lados.
        · Listón de 1″×1″ adentro del móvil, con burlete de 0,5 abajo: al cerrar apoya en el canto del fijo, así el vidrio queda 3 cm por encima del fijo.
        · Bisagras: un cabezal de 7,5 × 3 sobre la chapa, del lado de la cumbrera; bisagras de libro con el eje en la arista donde se juntan
          la cara de arriba del cabezal y la cara de afuera del faldón del móvil (h 3). Una hoja de la bisagra va atornillada arriba del cabezal y la otra
          en la cara de afuera del móvil. Al abrir, el faldón del móvil se aleja de la chapa (no la toca).
        · Dos hojas (tipo garage): la de arriba gira en esas bisagras; la de abajo cuelga de bisagras en la arista de abajo de la junta (h 3, del lado de adentro),
          así las dos hojas se pliegan en Λ sin que los faldones se choquen; el borde de abajo corre con rueditas por dos rieles a los lados (h 3). */
      const xs=t.poly.map(q=>q[0]),ys=t.poly.map(q=>q[1]),X0=Math.min(...xs),X1=Math.max(...xs),Y0=Math.min(...ys),Y1=Math.max(...ys),zr=y=>lin(ROOF.ridge,ROOF.front,y)+6;
      const al=Math.atan2(ROOF.ridge[1]-ROOF.front[1],ROOF.front[0]-ROOF.ridge[0]),ca=Math.cos(al),sa=Math.sin(al);
      const B=new THREE.Matrix4().makeBasis(new THREE.Vector3(1,0,0),new THREE.Vector3(0,ca,sa),new THREE.Vector3(0,-sa,ca)).setPosition(0,zr(Y0),Y0);
      const W=(h,tt)=>new THREE.Vector3(0,h,tt).applyMatrix4(B);/* punto local → mundo (y,z del eje) */
      const T=(Y1-Y0)/ca,c=5,H=14,gap=.5,f=5,FH=14,L1=2.5,WS=.5,GL=1,top=H+WS+L1,hb=top-FH;
      const bx=(xa,xb,h0,h1,t0,t1,M)=>{const g0=box(xa,xb,h0,h1,t0,t1);return M?g0.applyMatrix4(new THREE.Matrix4().multiplyMatrices(B,M)):g0.applyMatrix4(B);};
      Pt(t.id+'z',`${t.id} · marco fijo`,'roble',[bx(X0-c,X0,-6,H,-c,T+c),bx(X1,X1+c,-6,H,-c,T+c),bx(X0,X1,-6,H,-c,0),bx(X0,X1,-6,H,T,T+c)],{fn:'Marco fijo de 2″×6″ de canto alrededor del agujero del faldón, cortado a escuadra. Su canto de arriba recibe el listón con burlete del marco móvil.',sec:'2″×6″ de canto'},{group:'Techos',tags:['TE','techos',t.id]});
      const ox0=X0-c-gap-f,ox1=X1+c+gap+f,ot0=-c-gap-f,ot1=T+c+gap+f,two=p.luTipo==='2',tm=(ot0+ot1)/2;
      const lado=p.luTipo==='4'?(luLados(M,p)[t.id]||0):0,costado=!!lado,slide=p.luTipo==='3'||(p.luTipo==='4'&&!lado);const angDeg=Math.min(LUZ[t.id]||0,slide||costado?100:two?85:LU_ABRE),ang=(slide||costado?0:angDeg)*Math.PI/180;
      const RXl=(a,h,tt)=>new THREE.Matrix4().makeTranslation(0,h,tt).multiply(new THREE.Matrix4().makeRotationX(a)).multiply(new THREE.Matrix4().makeTranslation(0,-h,-tt));
      const MU=RXl(-ang,hb,ot0);/* hoja de arriba (o única): gira en el eje de las bisagras (t ot0, h 3) */
      const jm=new THREE.Vector3(0,hb,tm).applyMatrix4(MU);const ML=new THREE.Matrix4().makeTranslation(0,jm.y-hb,jm.z-tm).multiply(RXl(ang,hb,tm));
      const nh=Math.max(2,Math.round((ox1-ox0)/70));const hxs=[...Array(nh)].map((_,k)=>ox0+12+(ox1-ox0-24)*(nh===1?.5:k/(nh-1)));
      const leaf=(ta,tb,M,sub,shB)=>{/* shB: travesaño de abajo sin faldón (sólo de h 14,5 a 17) para que pase por arriba del marco fijo al plegarse */const fr=[bx(ox0,ox0+f,hb,top,ta,tb,M),bx(ox1-f,ox1,hb,top,ta,tb,M),bx(ox0+f,ox1-f,hb,top,ta,ta+f,M),bx(ox0+f,ox1-f,shB?H+WS:hb,top,tb-f,tb,M)];
        const ix0=ox0+f,ix1=ox1-f,st=[],ws=[],sT=ta<=ot0+.1,sB=tb>=ot1-.1,it0=sT?ta+f:ta+f,it1=sB?tb-f:tb-f;
        st.push(bx(ix0,ix0+L1,top-L1,top,it0,it1,M),bx(ix1-L1,ix1,top-L1,top,it0,it1,M));ws.push(bx(ix0,ix0+L1,H,H+WS,it0,it1,M),bx(ix1-L1,ix1,H,H+WS,it0,it1,M));
        if(sT){st.push(bx(ix0+L1,ix1-L1,top-L1,top,it0,it0+L1,M));ws.push(bx(ix0+L1,ix1-L1,H,H+WS,it0,it0+L1,M));}
        if(sB){st.push(bx(ix0+L1,ix1-L1,top-L1,top,it1-L1,it1,M));ws.push(bx(ix0+L1,ix1-L1,H,H+WS,it1-L1,it1,M));}
        Pt(t.id+'m'+sub,`${t.id} · marco móvil${two?(sub?' de abajo':' de arriba'):''}`,'roble',[...fr,...st],{fn:'Marco móvil de 2″×6″ de canto que calza por afuera del fijo, cortado a escuadra; adentro, listón de 1″×1″ que al cerrar apoya en el canto del fijo. Arrastralo hacia arriba para abrir y hacia abajo para cerrar.',sec:'2″×6″ de canto + listón 1″×1″',med:`${f1((ox1-ox0)/100)} × ${f1((tb-ta)/100)} m (exterior, medido sobre el faldón)`},{group:'Techos',tags:['TE','techos',t.id]});
        Pt(t.id+'w'+sub,`${t.id} · burlete${two?(sub?' (abajo)':' (arriba)'):''}`,'acero',ws,{fn:'Burlete de goma bajo el listón de 1″×1″: sella contra el canto del marco fijo.'},{group:'Techos',tags:['TE','techos',t.id]});
        return bx(ox0,ox1,top,top+GL,ta,tb,M);};
      /* bisagras de la cumbrera: cabezal fijo + hoja fija (estáticos) y hoja móvil + nudo (se mueven con el marco) */
      const fixedH=[bx(ox0,ox1,0,hb,ot0-7.5,ot0)],movH=[];for(const xh of hxs){fixedH.push(bx(xh-5,xh+5,hb,hb+.25,ot0-4,ot0-.6));movH.push(bx(xh-5,xh+5,hb,hb+4,ot0-.25,ot0,MU),bx(xh-5,xh+5,hb-.6,hb+.6,ot0-.6,ot0+.0,MU));}
      if(costado){/* corrediza hacia el costado: sube 12 (rampa al final de los rieles) y corre paralela a la cumbrera; rieles arriba y abajo de la hoja, sobre postes a la chapa */
        const W0=ox1-ox0,CR=LU_CARRERA(W0),LIFT=12,off=a=>({h:Math.min(a/12,1)*LIFT,x:lado*Math.max(0,(a-12)/88)*CR});const o0=off(angDeg);
        const MS=new THREE.Matrix4().makeTranslation(o0.x,o0.h,0);g=[leaf(ot0,ot1,MS,'')];
        const wh=[];for(const tt of [ot0-2.5,ot1+2.5])for(const xr of [ox0+18,ox1-18])wh.push(bx(xr-3,xr+3,hb+5,hb+10,tt-1.5,tt+1.5,MS));
        Pt(t.id+'k',`${t.id} · ruedas`,'acero',wh,{fn:'Cuatro ruedas, dos arriba y dos abajo de la hoja: trepan la rampa del final del riel (sube 12, despega del burlete) y corren de costado.'},{group:'Techos',tags:['TE','techos',t.id]});
        const rh0=hb+LIFT+5-3,rh1=hb+LIFT+5,xa=lado>0?ox0+10:ox0-CR-2,xb=lado>0?ox1+CR+2:ox1-10,rl=[];
        for(const tt of [ot0-2.5,ot1+2.5]){rl.push(bx(xa,xb,rh0,rh1,tt-2,tt+2));for(let xx=xa+8;xx<xb;xx+=Math.max(60,(xb-xa-16)/Math.ceil((xb-xa-16)/90))){const w0=new THREE.Vector3(xx,rh0,tt).applyMatrix4(B);const zr0=roofZ(w0.z,xx)+6;rl.push(box(xx-2,xx+2,zr0,w0.y,w0.z-2,w0.z+2));}}
        fixedH.length=0;fixedH.push(...rl);
        const nv=new THREE.Vector3(0,ca,sa);HINGE[t.id]={vec:a=>{const o=off(a);return nv.clone().multiplyScalar(o.h).add(new THREE.Vector3(o.x,0,0));},max:100,parts:[t.id+'m',t.id+'w',t.id,t.id+'k'],ang:angDeg};}
      else if(!two&&!slide){const gl=leaf(ot0,ot1,MU,'');g=[gl];
        Pt(t.id+'k',`${t.id} · bisagras (parte móvil)`,'acero',movH,{fn:'Hojas de las bisagras atornilladas a la cara de afuera del marco móvil, con el nudo en la arista de abajo.'},{group:'Techos',tags:['TE','techos',t.id]});
        const A=W(hb,ot0);HINGE[t.id]={y:A.z,z:A.y,s:-1,max:LU_ABRE,parts:[t.id+'m',t.id+'w',t.id,t.id+'k'],dm:t.id+'d',ang:angDeg};
        if(ang>.01){const dm=[];for(const [xd,xo] of [[ox0-2,ox0],[ox1+2,ox1]]){const a=W(1.5,T*.55),b=new THREE.Vector3(xd,hb+5,ot0+(ot1-ot0)*.35).applyMatrix4(new THREE.Matrix4().multiplyMatrices(B,MU));a.x=xd;dm.push(rod(a.toArray(),b.toArray(),1.3,8));}
          Pt(t.id+'d',`${t.id} · amortiguadores a gas`,'acero',dm,{fn:'Dos pistones a gas por afuera de los costados: abajo en un taco sobre la chapa, arriba en la cara de afuera del marco móvil.'},{group:'Techos',tags:['TE','techos',t.id]});}}
      else if(two){g=[leaf(ot0,tm,MU,'')];const gl2=leaf(tm,ot1,ML,'2',true);Pt(t.id+'v2',`${t.id} · vidrio de abajo`,'glass',[gl2],{fn:'Vidrio de la hoja de abajo, apoyado en el canto del marco móvil, al ras de los lados.'},{group:'Techos',tags:['TE','techos',t.id]});
        /* bisagras del medio: nudo en la arista de abajo de la junta (h 3); una hoja en la cara de abajo de cada travesaño */
        const mu=[],ml=[];for(const xh of hxs){mu.push(bx(xh-5,xh+5,hb-.25,hb,tm-4,tm,MU),bx(xh-5,xh+5,hb-.6,hb+.6,tm-.6,tm+.6,MU));ml.push(bx(xh-5,xh+5,hb-.25,hb,tm,tm+4,ML));}
        /* rueditas en el borde de abajo y rieles a los lados */
        const rd=[],rl=[];for(const xr of [ox0-1.5,ox1+1.5]){rd.push(bx(xr-1.5,xr+1.5,hb-2,hb+1,ot1-6,ot1-2,ML));rl.push(bx(xr-1.5,xr+1.5,0,hb-2,ot0+10,ot1));}
        Pt(t.id+'k',`${t.id} · bisagras (hoja de arriba)`,'acero',[...movH,...mu],{fn:'Bisagras de la cumbrera (parte móvil) y de la junta entre hojas.'},{group:'Techos',tags:['TE','techos',t.id]});
        Pt(t.id+'k2',`${t.id} · bisagras y rueditas (hoja de abajo)`,'acero',[...ml,...rd],{fn:'Hoja inferior de las bisagras de la junta y rueditas que corren por los rieles.'},{group:'Techos',tags:['TE','techos',t.id]});
        fixedH.push(...rl);
        const A=W(hb,ot0),J=W(hb,tm);HINGE[t.id]={y:A.z,z:A.y,s:-1,max:85,parts:[t.id+'m',t.id+'w',t.id,t.id+'k'],ang:angDeg,fold:{parts:[t.id+'m2',t.id+'w2',t.id+'v2',t.id+'k2'],y:J.z,z:J.y}};}
      else{/* corrediza hacia arriba: primero sube 12 (las ruedas trepan una rampa al final del riel) y después corre hacia la cumbrera, por rieles que siguen en voladizo más allá de la cumbrera */
        const LS=ot1-ot0+5,LIFT=12,off=a=>({h:Math.min(a/12,1)*LIFT,t:-Math.max(0,(a-12)/88)*LS});const o0=off(angDeg);
        const MS=new THREE.Matrix4().makeTranslation(0,o0.h,o0.t);g=[leaf(ot0,ot1,MS,'')];
        const wh=[];for(const xr of [ox0-2.5,ox1+2.5])for(const tt of [ot0+15,ot1-15])wh.push(bx(xr-1.5,xr+1.5,hb+5,hb+10,tt-3,tt+3,MS));
        Pt(t.id+'k',`${t.id} · ruedas`,'acero',wh,{fn:'Cuatro ruedas en los costados del marco móvil: trepan la rampa del final del riel (sube 12) y después corren hacia la cumbrera.'},{group:'Techos',tags:['TE','techos',t.id]});
        const rh0=hb+LIFT+5-3,rh1=hb+LIFT+5,ta0=ot0-LS-5,rl=[];for(const xr of [ox0-2.5,ox1+2.5]){rl.push(bx(xr-2,xr+2,rh0,rh1,ta0,ot1-20),bx(xr-2,xr+2,hb+2,hb+5,ot1-20,ot1+2));
          for(let tt=ot1-30;tt>ta0;tt-=90){const w0=new THREE.Vector3(xr,rh0,tt).applyMatrix4(B);const zr0=roofZ(w0.z,xr)+6;rl.push(box(xr-2,xr+2,zr0,w0.y,w0.z-2,w0.z+2));}}
        fixedH.length=0;fixedH.push(...rl);
        const nv=new THREE.Vector3(0,ca,sa),sv=new THREE.Vector3(0,-sa,ca);HINGE[t.id]={vec:a=>{const o=off(a);return nv.clone().multiplyScalar(o.h).add(sv.clone().multiplyScalar(o.t));},max:100,parts:[t.id+'m',t.id+'w',t.id,t.id+'k'],ang:angDeg};}
      Pt(t.id+'b',costado?`${t.id} · rieles laterales`:slide?`${t.id} · rieles en voladizo`:`${t.id} · cabezal de bisagras${two?' y rieles':''}`,'roble',fixedH,{fn:'Cabezal de 7,5 × 3 sobre la chapa del lado de la cumbrera, con la hoja fija de cada bisagra arriba'+(two?'; rieles a los lados para las rueditas de la hoja de abajo':'')+'.'},{group:'Techos',tags:['TE','techos',t.id]});
      const yo=W(0,ot0-7.5);Pt(t.id+'c',`${t.id} · chapón de cumbrera`,'chapon',[slabY(ox0-12,ox1+12,[352,zr(352)+.6],[yo.z,zr(yo.z)+.6],.8)],{fn:'Chapa lisa desde la cumbrera hasta el cabezal de las bisagras, montada sobre la chapa acanalada; el cabezal y el faldón del marco móvil la cubren.'},{group:'Techos',tags:['TE','techos',t.id]});}
    else{const y0=Math.min(...t.poly.map(q=>q[1])),y1=Math.max(...t.poly.map(q=>q[1]));g=[slabY(x0,x1,[y0,roofZ(y0,x0)+8],[y1,roofZ(y1,x0)+8],3),slabY(x0,x0+6,[y0,roofZ(y0,x0)+6],[y1,roofZ(y1,x0)+6],10),slabY(x1-6,x1,[y0,roofZ(y0,x0)+6],[y1,roofZ(y1,x0)+6],10)];}
    const cat=(t.id==='T-04'||t.id==='T-07'||t.id.startsWith('LU'))?'glass':'techo';
    Pt(t.id,`${t.id} · ${t.nombre}`,cat,g,{...base(t),sec:`${t.mat||''}${t.pend?' · pendiente '+t.pend:''}`,med:`${f1((x1-x0)/100)} m de largo`},{...ex(t),group:'Techos',tags:['TE','techos']});}
    Pt('CU-1','CU-1 · Cumbrera principal','cabio',box(-43,2951,497,507,347,357),{fn:M.TECHOS.find(t=>t.id==='CU-1').nota,med:'30,1 m a +5,07 (sigue sobre el quincho)'},{group:'Techos',tags:['TE','techos']});
    Pt('CU-2','CU-2 · Cumbrera del ala','cabio',box(2098,2108,487,497,-828,337),{fn:'+4,97',med:'11,6 m'},{group:'Techos',tags:['TE','techos']});}

  /* objetos */
  {const sal=M.CHIMENEAS.find(c=>c.id==='SAL-1');if(sal&&p.techos){/* tiraje de la salamandra (Maxi): sube, corre junto al perfil W-1, atraviesa la cercha CER-2 y sube al pasar el final del quincho */
    const [sx,sy]=sal.pos,y=652,z=360,xe=2978,r=7.5;const pts=[[sx,200,y],[sx,z,y],[xe,z,y],[xe,585,y]];const g=[];for(let i=0;i<pts.length-1;i++)g.push(rod(pts[i],pts[i+1],r,16));
    g.push(rod([xe,585,y],[xe,600,y],r+3,16),box(xe-16,xe+16,605,608,y-16,y+16));Pt('TIR-SAL','TIR-SAL · tiraje de la salamandra','acero',g,{fn:'Caño de Ø15: sube de SAL-1, corre junto al perfil W-1, sale por la cercha CER-2 y sube al pasar el final del quincho, hasta +6,05 con sombrerete.',sec:'caño de acero Ø15'},{group:'Objetos',tags:['PB','objetos','SAL-1']});}}
  for(const c of M.CHIMENEAS){if(p.equip!==false&&(c.id==='MES-1'||c.id==='HEL-1'))continue;/* con equipamiento, la cocina la arma el escenario activo */let g;if(c.id==='SAL-1'){/* foto 11: cilindro verde con hombros redondeados arriba y abajo (cápsula) */const R=40,F=18,z0=30,z1=200,pr=[new THREE.Vector2(0,z0)];
      for(let i=0;i<=8;i++){const t=-Math.PI/2+i/8*Math.PI/2;pr.push(new THREE.Vector2(R-F+F*Math.cos(t),z0+F+F*Math.sin(t)));}
      for(let i=0;i<=8;i++){const t=i/8*Math.PI/2;pr.push(new THREE.Vector2(R-F+F*Math.cos(t),z1-F+F*Math.sin(t)));}
      pr.push(new THREE.Vector2(0,z1));const lg=new THREE.LatheGeometry(pr,32);lg.translate(c.pos[0],0,c.pos[1]);g=lg;}
    else if(c.tipo==='hogar'&&c.box){const [x0,x1,z0,z1,y0,y1]=c.box;g=[box(x0,x1,0,20,y0,y1),box(x0,x1,20,110,y0,y0+20),box(x0,x1,20,110,y1-20,y1),box(x0,x1,110,150,y0,y1),box(x0,x0+(x1-x0)*.6,150,z1,y0+15,y1-15),box(x0,x0+12,20,110,y0+20,y1-20)];}
    else if(c.tipo==='hogar'){/* fotos 13 y 19 + video seg. 102: macizo de ladrillo saliente hasta el techo; boca baja al sur con dintel de ladrillo;
        al norte, nicho bajo arqueado para leña, mesada de madera y caja de estantes de madera embutida; ladrillo arriba hasta el techo */
      const Y0=46,Y1=100,zt=y=>255+(y+2)*(252/354)-6,top=(xa,xb,z0)=>box8([[xa,z0,Y0],[xb,z0,Y0],[xb,z0,Y1],[xa,z0,Y1],[xa,zt(Y0),Y0],[xb,zt(Y0),Y0],[xb,zt(Y1),Y1],[xa,zt(Y1),Y1]]);
      g=[box(1500,1700,0,20,Y0,Y1+8),box(1500,1555,20,110,Y0,Y1),box(1645,1700,20,110,Y0,Y1),box(1550,1650,110,122,Y0,Y1+2),top(1500,1700,122),
         box(1700,1712,0,95,Y0,Y1),box(1823,1835,0,95,Y0,Y1),box(1712,1823,78,95,58,Y1),top(1700,1835,230),box(1700,1705,95,230,Y0,Y1),box(1825,1835,95,230,Y0,Y1)];
      const est=[box(1700,1835,95,101,Y0,Y1+8),box(1705,1710,101,230,Y0,Y1),box(1825,1830,101,230,Y0,Y1),box(1705,1830,222,230,Y0,Y1),box(1710,1825,101,222,Y0,52),box(1710,1825,145,148,52,Y1-4),box(1710,1825,185,188,52,Y1-4)];
      Pt(c.id+'h',`${c.id} · fondo de la boca y del nicho de leña`,'acero',[box(1555,1645,20,110,Y0,56),box(1712,1823,0,78,Y0,58)],{fn:'Fondo ennegrecido de la boca del hogar y del nicho de leña.'},{group:'Objetos',tags:['PB','objetos',c.id]});
      Pt(c.id+'e',`${c.id} · mesada y estantes de madera`,'madera',est,{fn:'Caja de madera oscura embutida en el macizo del hogar, con dos estantes, sobre una mesada que asoma (foto 19).'},{group:'Objetos',tags:['PB','objetos',c.id]});}
    else if(c.id==='HEL-1'){/* heladera roja (fotos 12 y 13): cuerpo, puerta de freezer arriba, puerta grande abajo, manijas y patas; frente hacia la cocina (+x) */
      const [x0,x1,z0,z1,y0,y1]=c.box,zf=z1-55;g=[box(x0,x1-3,z0+4,z1-2,y0,y1),box(x0+2,x1-5,z1-2,z1,y0+2,y1-2),box(x1-3,x1,zf+1,z1-3,y0+1,y1-1),box(x1-3,x1,z0+5,zf-1,y0+1,y1-1)];
      Pt(c.id+'k',`${c.id} · manijas, burletes y patas`,'acero',[box(x1,x1+3,zf+8,zf+38,y0+6,y0+9),box(x1,x1+3,zf-50,zf-6,y0+6,y0+9),box(x1-3.2,x1+.2,zf-1,zf+1,y0+1,y1-1),box(x0+3,x0+8,z0,z0+4,y0+3,y0+8),box(x0+3,x0+8,z0,z0+4,y1-8,y1-3),box(x1-10,x1-5,z0,z0+4,y0+3,y0+8),box(x1-10,x1-5,z0,z0+4,y1-8,y1-3)],{fn:'Manijas, burlete entre puertas y patas de la heladera.'},{group:'Objetos',tags:['PB','objetos',c.id]});}
    else if(c.id==='MES-1'){/* mesada: zócalo, bajo mesada con frentes de madera (cajones arriba, puertas abajo) y tapa; frente hacia la cocina (+x) */
      const [x0,x1,z0,z1,y0,y1]=c.box,xf=x1-4,mods=Math.max(1,Math.round((y1-y0)/60)),mw=(y1-y0)/mods;g=[box(x0,xf-6,z0,z0+10,y0,y1),box(x0,xf,z0+10,z1-4,y0,y1)];
      const fr=[],hd=[];for(let i=0;i<mods;i++){const a=y0+i*mw+.3,b=y0+(i+1)*mw-.3;fr.push(box(xf,x1-1,z1-20,z1-5,a,b),box(xf,x1-1,z0+11,z1-21,a,b));hd.push(box(x1-1,x1+1.5,z1-14,z1-11,(a+b)/2-6,(a+b)/2+6),box(x1-1,x1+1.5,z1-32,z1-24,i%2?a+4:b-6,i%2?a+6:b-4));}
      Pt(c.id+'f',`${c.id} · frentes de madera`,'roble',fr,{fn:'Cajones arriba y puertas abajo, de madera.'},{group:'Objetos',tags:['PB','objetos',c.id]});
      Pt(c.id+'k',`${c.id} · tiradores`,'acero',hd,{fn:'Tiradores de cajones y puertas.'},{group:'Objetos',tags:['PB','objetos',c.id]});
      Pt(c.id+'t',`${c.id} · tapa`,'piso',[box(x0,x1+2,z1-4,z1,y0,y1)],{fn:'Tapa de la mesada.'},{group:'Objetos',tags:['PB','objetos',c.id]});}
    else if(c.tipo==='mueble'){const b=c.box;g=box(b[0],b[1],b[2],b[3],b[4],b[5]);}
    else if(c.tipo==='chimenea'&&c.id==='CH-2'){/* chimenea de la pared del fondo: relieve de ladrillo por fuera de M-04, desde el suelo, y conducto sobre el techo (Maxi) */const w=c.w||60,dp=c.dp||90,y0=c.pos[1]-dp/2,y1=c.pos[1]+dp/2,zt=c.alto||600;
      g=[box(-32,0,-20,Math.min(roofZ(y0,0),roofZ(y1,0))+2,y0,y1),box(-32,c.pos[0]+w/2,Math.min(roofZ(y0,0),roofZ(y1,0))-60,zt,y0,y1),box(-38,c.pos[0]+w/2+6,zt,zt+8,y0-6,y1+6)];}
    else if(c.tipo==='chimenea'){if(!p.techos)continue;const w=c.w||90,dp=c.dp||50;const rz=Math.min(roofZ(c.pos[1]-dp/2,c.pos[0]),roofZ(c.pos[1]+dp/2,c.pos[0]))+20;const zt=c.alto||rz+150;g=[box(c.pos[0]-w/2,c.pos[0]+w/2,rz-60,zt,c.pos[1]-dp/2,c.pos[1]+dp/2),box(c.pos[0]-w/2-6,c.pos[0]+w/2+6,zt,zt+8,c.pos[1]-dp/2-6,c.pos[1]+dp/2+6)];}
    else if(c.id==='OBJ-1')g=[box(1500,1512,48,255,310,561),box(1588,1600,48,255,310,561),box(1500,1600,240,255,310,561)];
    else g=box(2032,2577,199,408,627,649);   // (sin uso)
    Pt(c.id,`${c.id} · ${c.nombre}`,(c.tipo==='hogar'||c.tipo==='chimenea')?'ladrillo':c.id==='HEL-1'?'heladera':c.tipo==='mueble'?'mesada':'obj',g,{...base(c)},{group:'Objetos',tags:['PB','objetos'],opt:{op:c.id==='SAL-1'||c.tipo==='hogar'||c.tipo==='chimenea'||c.tipo==='mueble'?1:.5,noEdges:c.id==='SAL-1'}});}

  /* exterior */
  /* terreno: el deck queda ~20 cm sobre el pasto, que baja otros ~20 cm al alejarse de la casa (Maxi) */
  window.__terreno={t:p.ext?-20:-0.05,c:p.ext?20:0};
  if(p.ext)Pt('PLA-1','PLA-1 · platea y zócalo de la casa','piso',[box(-1,1342,-21,-.6,7,708),box(1322,2530,-21,-.6,8,935),box(1799,2400,-21,-.6,-810,8)],{fn:'Platea de la casa: el piso interior está ~20 cm sobre el terreno.'},{group:'Exterior',tags:['exterior']});
  if(p.ext){for(const d of M.DECK)Pt(d.id,`${d.id} · ${d.nombre}`,'deck',prism(d.poly,-20,d.z||0,'XZ'),{...base(d),sec:'tablas de 19 cm con 1 cm de luz',med:d.z?`+${d.z} sobre el deck`:'~20 cm sobre el terreno'},{group:'Exterior',tags:['exterior']});
    {/* LAV-1 (Maxi, 13/10): afuera, contra M-20 bajo las ventanas de la cocina (V-21, V-38), mesada de 3 m con pileta de lavadero; piso del patio a −0,03 */
      const L1={id:'LAV-1',nombre:'Mesada de lavadero con pileta',estado:'proyecto',nota:'Maxi: pileta de lavadero del lado de afuera de las ventanas de la cocina, en el patio, con una mesada de 3 m. Tapa a +0,87 (0,90 sobre el piso de ladrillos), 10 cm debajo del antepecho de las ventanas.'};
      const xw=1799.5,D=60,x0=xw-D,y0=-330,y1=-30,zf=-3,zt=zf+90,tt=4,py0=-242-30,py1=-242+30,px0=x0+6,px1=xw-8,pz=zt-35;
      const tapa=[box(x0,xw,zt-tt,zt,y0,py0),box(x0,xw,zt-tt,zt,py1,y1),box(x0,px0,zt-tt,zt,py0,py1),box(px1,xw,zt-tt,zt,py0,py1)];
      const pil=[box(px0,px1,pz,pz+3,py0,py1),box(px0,px0+3,pz,zt-tt,py0,py1),box(px1-3,px1,pz,zt-tt,py0,py1),box(px0,px1,pz,zt-tt,py0,py0+3),box(px0,px1,pz,zt-tt,py1-3,py1)];
      const pies=[];for(const y of [y0+5,py0-8,py1+8,y1-5])pies.push(box(x0+5,xw,zf,zt-tt,y-6,y+6));pies.push(box(x0+5,xw,zf+15,zf+18,y0+5,y1-5));
      Pt('LAV-1',`LAV-1 · mesada de lavadero (3 m)`,'mesada',tapa,{...base(L1),sec:'tapa de hormigón alisado de 4 cm sobre pilares de ladrillo y estante bajo',med:'3,00 × 0,60 · tapa a +0,87'},{group:'Exterior',tags:['exterior','LAV-1']});
      Pt('LAV-1p',`LAV-1 · pileta de lavadero`,'acero',[...pil,rod([xw,zt+8,-242],[xw-16,zt+8,-242],1.2,10),rod([xw-16,zt+8,-242],[xw-16,zt+2,-242],1.2,10)],{fn:'Pileta de acero inoxidable de 60 × 50, 35 de hondo, embutida en la tapa bajo V-21, con la canilla en la pared, justo debajo del antepecho.',sec:'acero inoxidable',med:'60 × 50 × 35'},{group:'Exterior',tags:['exterior','LAV-1']});
      Pt('LAV-1b',`LAV-1 · pilares y estante`,'ladrillo',pies,{fn:'Pilares de ladrillo de 12 y estante bajo de hormigón a 15 cm del piso.'},{group:'Exterior',tags:['exterior','LAV-1']});}
    for(const o of M.IMPLANTACION){if(o.tipo==='patio'){/* piso de ladrillos, a ras del terreno */Pt(o.id,`${o.id} · ${o.nombre}`,'ladrillo',[prism(o.poly,-21,-3,'XZ')],{...base(o),sec:'ladrillo común de plano, junta tomada',med:'piso de ladrillos'},{group:'Exterior',tags:['exterior']});continue;}
      if(o.tipo==='arboleda'||o.tipo==='arbol')continue;/* árboles y arbustos: los arma arboles.js con ez-tree (Maxi 14/10: follaje mejor, sin cotas) */
      if(o.tipo==='arboleda'){const ra=[],ho=[];const a=[(o.poly[0][0]+o.poly[3][0])/2,(o.poly[0][1]+o.poly[3][1])/2],b=[(o.poly[1][0]+o.poly[2][0])/2,(o.poly[1][1]+o.poly[2][1])/2],n=o.n||12;for(let i=0;i<n;i++){const t=(i+.5)/n,cx=a[0]+(b[0]-a[0])*t+((i*37)%11-5)*20,cz=a[1]+(b[1]-a[1])*t+((i*53)%13-6)*25;const tr=arbol(cx,cz,16+(i*7)%9,i+1,true);ra.push(...tr.ramas);ho.push(...tr.hojas);}
        ra.forEach(q=>q.translate(0,-38,0));ho.forEach(q=>q.translate(0,-38,0));Pt(o.id,`${o.id} · ${o.nombre}`,'corteza',ra,{...base(o)},{group:'Exterior',tags:['exterior'],opt:{noEdges:true,merge:true}});Pt(o.id+'f',`${o.id} · follaje`,'follaje',ho,{fn:o.nombre},{group:'Exterior',tags:['exterior'],opt:{noEdges:true,op:1,vcol:true,merge:true,map:hojaTex(),alphaTest:.45,smooth:true}});
        /* arbustos desde el suelo, a lo largo de la fila */const bu=[];const L=Math.hypot(b[0]-a[0],b[1]-a[1]),nb=Math.round(L/110);for(let i=0;i<nb;i++){const t=(i+.5)/nb,j=((i*7919)%97)/97,k=((i*104729)%89)/89;const r=70+j*80,cx=a[0]+(b[0]-a[0])*t,cz=a[1]+(b[1]-a[1])*t+(k-.5)*260;
          const gg=new THREE.IcosahedronGeometry(r,1);gg.scale(1.25,.85,1.1);gg.translate(cx,r*.75,cz);bu.push(gg);if(j>.4){const g2=new THREE.IcosahedronGeometry(r*.7,1);g2.translate(cx+r*.6,r*1.3,cz-r*.3);bu.push(g2);}}
        bu.forEach(q=>q.translate(0,-38,0));Pt(o.id+'b',`${o.id} · arbustos`,'arbusto',bu,{fn:'Arbustos bajo la fila de árboles, desde el suelo.'},{group:'Exterior',tags:['exterior',o.id],opt:{noEdges:true,merge:true}});continue;}
      if(o.tipo==='cerco'){/* cerco: postes cada 2,50 y tablas de 2,5 cm, del terreno a o.h */const g=[],z0=-20,H=o.h||200;
        for(let i=0;i<o.linea.length-1;i++){const [ax,ay]=o.linea[i],[bx,by]=o.linea[i+1],L=Math.hypot(bx-ax,by-ay),n=Math.max(1,Math.round(L/250));
          const hx=Math.abs(bx-ax)>=Math.abs(by-ay);g.push(hx?box(Math.min(ax,bx),Math.max(ax,bx),z0+8,z0+H,ay-1.25,ay+1.25):box(ax-1.25,ax+1.25,z0+8,z0+H,Math.min(ay,by),Math.max(ay,by)));
          for(let k=0;k<=n;k++){const x=ax+(bx-ax)*k/n,y=ay+(by-ay)*k/n;g.push(box(x-4,x+4,z0,z0+H+5,y-4,y+4));}}
        Pt(o.id,`${o.id} · ${o.nombre}`,'madera',g,{...base(o),sec:'postes de 8 × 8 cada 2,50 y tablas',med:`alto ${f1(H/100)} m`},{group:'Exterior',tags:['exterior'],opt:{merge:true}});continue;}
      if(o.tipo==='vecina'){const xs=o.poly.map(q=>q[0]),ys=o.poly.map(q=>q[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),hw=o.h||280,hr=o.hr||430,ym=(y0+y1)/2;Pt(o.id,`${o.id} · ${o.nombre}`,'ladrillo',[box(x0,x1,-35,hw,y0,y1),prism([[y0,hw],[y1,hw],[ym,hr]],x0,x0+1,'ZY'),prism([[y0,hw],[y1,hw],[ym,hr]],x1-1,x1,'ZY')],{...base(o)},{group:'Exterior',tags:['exterior']});
        Pt(o.id+'t',`${o.id} · techo`,'techo',[slabY(x0-30,x1+30,[y0-30,hw-14],[ym,hr],5),slabY(x0-30,x1+30,[y1+30,hw-14],[ym,hr],5)],{fn:'Techo a dos aguas (volumen supuesto).'},{group:'Exterior',tags:['exterior']});continue;}
      if(o.tipo==='arbol'){const t=arbol(o.pos[0],o.pos[1],o.r);Pt(o.id,`${o.id} · ${o.nombre}`,'corteza',t.ramas,{...base(o),med:'tronco ø 0,7 · alto ~16 m · copa ~14 m'},{group:'Exterior',tags:['exterior'],opt:{noEdges:true,merge:true}});Pt(o.id+'f',`${o.id} · follaje`,'follaje',t.hojas,{fn:'Copa del árbol AR-1, estimada del video.'},{group:'Exterior',tags:['exterior'],opt:{noEdges:true,op:1,vcol:true,merge:true,map:hojaTex(),alphaTest:.45,smooth:true}});}
      else if(o.tipo==='pileta'){const xs=o.poly.map(q=>q[0]),ys=o.poly.map(q=>q[1]),X0=Math.min(...xs),X1=Math.max(...xs),Y0=Math.min(...ys),Y1=Math.max(...ys),B=15,P=150,e=10;
        /* foto 10 y foto 1: pileta rectangular al norte del quincho, rodeada de deck; espejo de agua a -0,20, borde de 15 cm */
        Pt(o.id,`${o.id} · ${o.nombre}`,'agua',[box(X0,X1,-22,-20,Y0,Y1)],{...base(o),med:`${f1((X1-X0)/100)} × ${f1((Y1-Y0)/100)} m de espejo · ~1,5 de hondo (supuesto)`},{group:'Exterior',tags:['exterior'],opt:{op:.75,noEdges:true,hueco:o.poly}});
        Pt(o.id+'c',`${o.id} · vaso`,'pileta',[box(X0,X1,-P-e,-P,Y0,Y1),box(X0-e,X0,-P,0,Y0,Y1),box(X1,X1+e,-P,0,Y0,Y1),box(X0,X1,-P,0,Y0-e,Y0),box(X0,X1,-P,0,Y1,Y1+e)],{fn:'Paredes y fondo del vaso de la pileta.'},{group:'Exterior',tags:['exterior',o.id]});
        Pt(o.id+'b',`${o.id} · borde`,'piso',[box(X0-B,X1+B,0,4,Y0-B,Y0),box(X0-B,X1+B,0,4,Y1,Y1+B),box(X0-B,X0,0,4,Y0,Y1),box(X1,X1+B,0,4,Y0,Y1)],{fn:'Borde (solado) de 15 cm alrededor del espejo de agua.'},{group:'Exterior',tags:['exterior',o.id]});}
      else if(o.tipo==='deckAlto'){/* deck elevado junto a la pileta (Maxi 14/10): tablas de 19 + 1 sobre vigas 2×6 y postes de 10 × 10 */
        const xs=o.poly.map(q=>q[0]),ys=o.poly.map(q=>q[1]),X0=Math.min(...xs),X1=Math.max(...xs),Y0=Math.min(...ys),Y1=Math.max(...ys),H=o.h||100,tg=['exterior',o.id],grp={group:'Exterior',tags:tg};
        Pt(o.id,`${o.id} · ${o.nombre}`,'deck',[box(X0,X1,H-4,H,Y0,Y1)],{...base(o),med:`${f1((X1-X0)/100)} × ${f1((Y1-Y0)/100)} m a +${f1(H/100)}`,sec:'tablas de 19 cm con 1 cm de luz'},grp);
        const est=[];const nX=Math.ceil((X1-X0)/190);for(let i=0;i<=nX;i++){const x=X0+5+(X1-X0-10)*i/nX;for(const y of [Y0+5,Y1-20])est.push(box(x-5,x+5,0,H-19,y-5,y+5));}
        for(const y of [Y0+5,Y1-20])est.push(box(X0,X1,H-19,H-4,y-2.5,y+2.5));for(let x=X0+2.5;x<X1;x+=40)est.push(box(x-2.5,x+2.5,H-19,H-4,Y0,Y1));
        est.push(box(X0,X1,H-19,H-4,Y0,Y0+2),box(X0,X1,H-19,H-4,Y1-2,Y1),box(X1-2,X1,H-19,H-4,Y0,Y1));
        Pt(o.id+'e',`${o.id} · estructura`,'madera',est,{fn:'Postes de 10 × 10 cada ~1,9 m sobre el deck, vigas de 2″×6″ de canto y tirantes cada 40 cm; frentes de 2 cm.'},grp);
        /* escalera hacia la casa (sur, −x): 6 alzadas de H/6, pedada 28, ancho 100 */
        const n=6,ri=H/n,pd=28,ya=Y0+30,yb=ya+100,es=[];for(let k=1;k<n;k++){const z=ri*k,x1=X0-pd*(n-1-k),x0=x1-pd;es.push(box(x0,x1+1,z-4,z,ya,yb));}
        for(const y of [ya,yb-4]){const a=[X0-pd*(n-1)-10,0],b=[X0,H-4];const L=Math.hypot(b[0]-a[0],b[1]-a[1]),ang=Math.atan2(b[1]-a[1],b[0]-a[0]);const g=new THREE.BoxGeometry(L,20,4);g.rotateZ(ang);g.translate((a[0]+b[0])/2,(a[1]+b[1])/2+2,y+2);es.push(g);}
        Pt(o.id+'s',`${o.id} · escalera`,'madera',es,{fn:`Escalera hacia la casa: ${n} alzadas de ${f1(ri)} cm y pedadas de ${pd}, ancho 1,00, zancas de 2″×8″.`},grp);
        /* barandas: atrás (oeste, y = Y0) y al norte (x = X1); postes de 7 × 7, pasamanos a +1,00 sobre el deck y varillas cada 11 cm */
        const ba=[],Hb=H+100;const lado=(ax,ay,bx,by)=>{const L=Math.hypot(bx-ax,by-ay),nP=Math.ceil(L/150);for(let i=0;i<=nP;i++){const t=i/nP,x=ax+(bx-ax)*t,y=ay+(by-ay)*t;ba.push(box(x-3.5,x+3.5,H,Hb,y-3.5,y+3.5));}
          const hor=Math.abs(bx-ax)>Math.abs(by-ay);if(hor){ba.push(box(Math.min(ax,bx),Math.max(ax,bx),Hb,Hb+4,ay-4,ay+4),box(Math.min(ax,bx),Math.max(ax,bx),H+8,H+12,ay-2,ay+2));for(let x=Math.min(ax,bx)+11;x<Math.max(ax,bx)-5;x+=11)ba.push(box(x-1,x+1,H+12,Hb,ay-1,ay+1));}
          else{ba.push(box(ax-4,ax+4,Hb,Hb+4,Math.min(ay,by),Math.max(ay,by)),box(ax-2,ax+2,H+8,H+12,Math.min(ay,by),Math.max(ay,by)));for(let y=Math.min(ay,by)+11;y<Math.max(ay,by)-5;y+=11)ba.push(box(ax-1,ax+1,H+12,Hb,y-1,y+1));}};
        lado(X0+4,Y0+4,X1-4,Y0+4);lado(X1-4,Y0+4,X1-4,Y1-4);
        Pt(o.id+'b',`${o.id} · barandas`,'madera',ba,{fn:'Barandas al oeste (atrás) y al norte: pasamanos a +1,00 sobre el deck, varillas cada 11 cm (pasa menos de 10 cm). El sur queda libre para la escalera y el este para el trampolín.'},grp);
        /* trampolín: tabla de 2,40 × 0,50, base atornillada al deck y fulcro; vuela ~1,9 m sobre el agua */
        const xc=(X0+X1)/2,yb0=Y1-50,yb1=yb0+240,tilt=3*Math.PI/180,pv=new THREE.Vector3(xc,H+8,yb0);
        const tb=box(xc-25,xc+25,H+6,H+11,yb0,yb1);tb.translate(-pv.x,-pv.y,-pv.z);tb.rotateX(-tilt);tb.translate(pv.x,pv.y,pv.z);
        Pt(o.id+'t',`${o.id} · trampolín`,'tabique',[tb],{fn:'Trampolín (springboard) de 2,40 × 0,50 con superficie antideslizante, inclinado 3° hacia arriba; vuela ~1,9 m sobre el espejo.'},grp);
        Pt(o.id+'f',`${o.id} · base del trampolín`,'acero',[box(xc-28,xc+28,H,H+3,yb0-5,yb0+48),box(xc-27,xc-23,H,H+16,yb0+30,yb0+40),box(xc+23,xc+27,H,H+16,yb0+30,yb0+40),rod([xc-27,H+15,yb0+35],[xc+27,H+15,yb0+35],2,10),box(xc-27,xc+27,H,H+7,yb0-5,yb0+3)],{fn:'Base de acero galvanizado atornillada a la estructura del deck: anclaje trasero y fulcro regulable.'},grp);}
      else Pt(o.id,`${o.id} · ${o.nombre}`,'tabique',[prism(o.poly,0,124,'XZ'),prism(o.poly,193,198,'XZ')],{...base(o)},{group:'Exterior',tags:['exterior']});}}

  const panes={video3d:videoHTML(),ayuda:`<h3>Qué es cada cosa</h3><p>Lo que ves en color es mi modelo, armado desde la misma base que la planta: los mismos códigos, los mismos locales, las mismas aberturas. En gris transparente va tu GLB de Onshape (<b>Calco GLB</b>): donde no coinciden, manda el GLB.</p>
    <h3>Cómo usarlo</h3><ul><li>Tocá una pieza: te muestra qué es, medidas, y las cotas en azul de cada arista.</li><li>Los códigos en cualquier texto (por ejemplo M-08, T-04, L-07) también la seleccionan.</li><li><b>Corte horizontal</b> saca lo que está arriba de una altura: a +1,20 ves la planta baja como un plano; a +4,00, el entrepiso.</li><li><b>Explotar</b> levanta techos y entrepiso para ver adentro.</li><li>Las vistas de arriba son fijas: Planta, Jardín, Patio, Norte, Sur.</li><li><b>Teclado</b>: W/S avanzar y retroceder hacia donde mirás, A/D de costado, Q/E bajar y subir, flechas para girar la vista; Shift + ↑/↓ sube y baja la cámara.</li></ul>
    <h3>Alturas que usé</h3><ul><li>Cumbrera +5,07 · alero al jardín +3,44 · faldón al patio del ala dormitorios de +5,07 a +4,78 · sobre el living baja a +2,55.</li><li>Techo de vidrio de +4,07 a +2,46. Ventanal y tímpano vidriado hasta +2,41 y el hastial de vidrio hasta el techo.</li><li>Entrepiso a +2,62 (piso). Fachada al jardín hasta +2,64 con la franja alta hasta +3,45.</li><li>Ala al patio: cumbrera +4,97, aleros +2,59.</li></ul><p>Todas salen del GLB. Lo que no está ahí (pared sur hasta el techo, muros interiores hasta +2,62) es supuesto.</p>`};
  const spec=`<span>v<b>${M.META.version}</b> · ${M.META.fecha}</span><span>${parts.length} piezas</span><span>cumbrera <b>+5,07</b></span><span>entrepiso <b>+2,62</b></span><span>cotas en m</span>`;
  /* ediciones de Maxi que no viven en los datos: borrar o mover piezas armadas a mano */
  {const bid=id=>id.replace(/[a-z]$/,'');for(let i=parts.length-1;i>=0;i--){const pp=parts[i],b=bid(pp.id);const qt=ED.E[pp.id]&&ED.E[pp.id].quitar;if(qt&&qt.length){pp.geos=pp.geos.filter((g,k)=>!qt.includes(k));if(!pp.geos.length){parts.splice(i,1);continue;}}const e=ED.E[b]||ED.E[pp.id];if(!e)continue;const datos=ED.enDatos(b);
    if(!datos&&e.borrado){parts.splice(i,1);continue;}if(!datos&&e.mov){const {x=0,y=0,z=0}=e.mov;pp.geos=pp.geos.map(g=>{const c=g.clone();c.translate(x,z,y);return c;});}
    /* caras estiradas (empujar/tirar): se corren los vértices que están sobre el plano de la cara */
    if(e.caras&&e.caras.length){pp.geos=pp.geos.map(g=>{const c=g.clone();const P=c.attributes.position;for(const f of e.caras){const [nx,ny,nz]=f.n;for(let k=0;k<P.count;k++){const x=P.getX(k),y=P.getY(k),z=P.getZ(k);if(Math.abs(nx*x+ny*y+nz*z-f.d)<0.6)P.setXYZ(k,x+nx*f.t,y+ny*f.t,z+nz*f.t);}}
      P.needsUpdate=true;c.computeVertexNormals();c.computeBoundingBox();return c;});}}}
  return {parts,panes,spec,joints:[],steps:[],selExtra:pp=>`<div class="renrow"><button class="btn" data-hide="${pp.id}">Ocultar pieza</button><button class="btn" data-showall>Mostrar todo</button></div>`+N.editorHTML(pp.id),
    selIntro:'<div class="k">Selección</div><h2>Tocá una pieza</h2><p style="margin:0;color:var(--muted);font-size:13px">O un código en cualquier texto. Las cotas en azul son el largo real de cada arista.</p>',
    defaultView:'iso',
    views:{iso:{label:'Iso',p:[4600,2400,3900],t:[1350,120,250]},planta:{label:'Planta',p:[1400,5200,250.1],t:[1400,0,250]},jardin:{label:'Jardín (E)',p:[1300,420,4600],t:[1300,180,300]},patio:{label:'Patio (O)',p:[1300,520,-4200],t:[1300,180,0]},norte:{label:'Pileta (N)',p:[6600,700,400],t:[1600,150,300]},sur:{label:'Fondo (S)',p:[-3800,700,300],t:[1200,150,300]}},
    dims:({tag,dimLine})=>{dimLine([0,2,-140],[2523,2,-140],[0,0,-8],'25,23');dimLine([-120,2,8],[-120,2,708],[-8,0,0],'7,00');dimLine([-60,0,8],[-60,507,8],[-8,0,0],'5,07');dimLine([2600,0,937],[2600,241,937],[8,0,0],'2,41');dimLine([1800,2,-840],[2400,2,-840],[0,0,-8],'6,00');dimLine([2460,2,-792],[2460,2,8],[8,0,0],'8,00');
      /* etiquetas de nombre: sólo al seleccionar (Maxi, 12/10) */}};
}

const COL={washi:'#f3eee2',esmerilado:'#e3ecef',muro:'#cdc5b7',tabique:'#e2dbcf',glass:'#9fc4cf',techo:'#737a80',lucernario:'#8fa6b0',cabio:'#a9743f',ep:'#d9b98a',piso:'#eceae4',col:'#7f4429',deck:'#c7a56f',agua:'#6fb6d6',chapon:'#17191b',arbusto:'#4f7438',pileta:'#a8d8e8',arbol:'#5c8a4f',corteza:'#6b5a48',ladrillo:'#a0705a',roble:'#8a5a32',heladera:'#b8322a',mesada:'#8fae94',follaje:'#5f8a46',obj:'#8a8f8c',madera:'#b58a5a',acero:'#3a3f44',chapa:'#2a2e31'};
const LIFT={techo:380,lucernario:380,cabio:380,glass:0,ep:170};
const root=document.getElementById('modo-3d');
/* hojas de M-43: corrimiento guardado en este navegador */
/* lucarnas: abren 20° más allá de la horizontal (Maxi); el faldón tiene ~23° */
const LU_ABRE=Math.round(Math.atan2(ROOF.ridge[1]-ROOF.front[1],ROOF.front[0]-ROOF.ridge[0])*180/Math.PI)+20;
const HINGE={};window.__HINGE=HINGE;/* bisagras de hojas proyectantes y lucarnas, para arrastrarlas (se llena en build) */
const LUZ=(()=>{try{return JSON.parse(localStorage.getItem('carhue-lucarnas')||'{}');}catch(e){return {};}})();
const HOJAS=(()=>{try{return JSON.parse(localStorage.getItem('carhue-hojas')||'{}');}catch(e){return {};}})();
const visor=createVisor({model:{params,build},colors:COL,lift:LIFT,root,radial:0,far:40000});
{const d=visor.params.dormers;if(d==='ja'||d==='ca')visor.setParams({dormers:d[0],dormAlt:'1'});}/* antes el altillo iba junto con los del jardín */
/* corte horizontal */
const clipSel=()=>{const v=+visor.params.corte;visor.setClip(v>0?v:null);};
root.addEventListener('change',e=>{if(e.target.id==='q-corte'||e.target.id==='v-corte')clipSel();});
/* calco GLB */
const calco=new THREE.Group();calco.name='calco';visor.scene.add(calco);
const T=new THREE.Matrix4().set(100,0,0,2896, 0,0,100,0, 0,-100,0,492, 0,0,0,1);
const calcoMsg=t=>{const n=document.getElementById('calcoState');if(n)n.textContent=t;};
try{const bin=Uint8Array.from(atob(GLB64),c=>c.charCodeAt(0)).buffer;
  new GLTFLoader().parse(bin,'',g=>{const mat=new THREE.MeshStandardMaterial({color:0x6b7a86,transparent:true,opacity:.28,depthWrite:false,roughness:.9,side:THREE.DoubleSide});
    g.scene.traverse(o=>{if(o.isMesh){o.material=mat;o.userData.calco=true;}});g.scene.applyMatrix4(T);calco.add(g.scene);applyCalco();calcoMsg('calco GLB listo');setTimeout(()=>calcoMsg(''),4000);},
    e=>{console.error(e);calcoMsg('no se pudo leer el GLB');});}
catch(e){console.error(e);calcoMsg('no se pudo leer el GLB');}
function applyCalco(){calco.visible=!!visor.params.calco;}
root.addEventListener('change',e=>{if(e.target.id==='q-calco'||e.target.id==='v-calco')applyCalco();});
/* ---------- cortes dinámicos ---------- */
const $=id=>document.getElementById(id);
/* seis cortes (Maxi 15/10): dos opuestos por eje para aislar una porción de la casa. X sur→norte, Y oeste→este (planta), Z altura. */
const C6=[['xmin','X desde','x',1,-100,4700,0],['xmax','X hasta','x',-1,-100,4700,3000],['ymin','Y desde','z',1,-1000,2000,-800],['ymax','Y hasta','z',-1,-1000,2000,1000],['zmin','Z desde','y',1,-100,900,0],['zmax','Z hasta','y',-1,-100,900,500]].map(([k,n,axis,side,mn,mx,v])=>({k,n,axis,side,mn,mx,v,on:false}));
const CL=Object.fromEntries(C6.map(c=>[c.k,c]));
{const bb=document.querySelector('#modo-3d .bottombar');const sp=document.createElement('span');sp.className='clip clip6';
  sp.innerHTML=C6.map(c=>`<div class="c6r"><label><input type="checkbox" data-c6on="${c.k}"> ${c.n}</label><input type="range" data-c6v="${c.k}" min="${c.mn}" max="${c.mx}" step="5" value="${c.v}"><span class="clipv" data-c6l="${c.k}"></span></div>`).join('')+'<div class="c6r"><button class="btn mini" data-c6all="0">Sin cortes</button></div><div id="c6vista" style="font-size:10.5px;color:var(--muted);line-height:1.35;margin-top:3px"></div>';
  const st=document.createElement('style');st.textContent='.clip6{display:flex;flex-direction:column;gap:3px}.c6r{display:flex;align-items:center;gap:5px}.c6r label{width:62px;flex:none;white-space:nowrap}.c6r input[type=range]{flex:1;min-width:60px}.c6r .clipv{width:46px;text-align:right;font-variant-numeric:tabular-nums}';document.head.appendChild(st);
  if(bb)bb.appendChild(sp);
  sp.addEventListener('input',e=>{const k=e.target.dataset.c6v;if(k){CL[k].v=+e.target.value;CL[k].on=true;syncC6();applyClips();guardarCortesVista();}});
  sp.addEventListener('change',e=>{const k=e.target.dataset.c6on;if(k){CL[k].on=e.target.checked;applyClips();guardarCortesVista();}});
  sp.addEventListener('click',e=>{if(e.target.closest('[data-c6rest]')){e.preventDefault();restablecerCortesVista();return;}if(e.target.closest('[data-c6all]')){C6.forEach(c=>c.on=false);setTimeout(guardarCortesVista,0);visor.params.corte='0';['q-corte','v-corte'].forEach(id=>{const el=$(id);if(el)el.value='0';});syncC6();applyClips();}});}
function syncC6(){for(const c of C6){const a=document.querySelector(`[data-c6on="${c.k}"]`),b=document.querySelector(`[data-c6v="${c.k}"]`),l=document.querySelector(`[data-c6l="${c.k}"]`);if(a)a.checked=c.on;if(b)b.value=c.v;if(l)l.textContent=(c.v/100).toFixed(2).replace('.',',');}}
function applyClips(){const list=[];const h=+visor.params.corte;if(h>0)list.push({axis:'y',value:h,side:-1});
  for(const c of C6)if(c.on)list.push({axis:c.axis,value:c.v,side:c.side});syncC6();visor.setClips(list);window.__despertar&&window.__despertar();}
syncC6();
/* aislar un ambiente: los seis cortes alrededor del local (paredes incluidas) y una cámara que lo mira desde arriba en diagonal */
/* vistas predeterminadas con cortes propios (Maxi 15/10): cada vista fija y cada ambiente tiene sus seis cortes; al cambiar de vista cambian los cortes;
   si movés un corte mientras estás en una vista predeterminada, queda guardado como parámetro de esa vista (base del artifact) */
const AMB_DEF={'L-08':{xmin:1810,xmax:2390,ymin:-360,ymax:140,zmin:-25,zmax:235}};/* cocina: L-08 + L-12 + desayunador */
let CORTES_V={};try{CORTES_V=JSON.parse(localStorage.getItem('carhue-cortes-vistas')||'{}');}catch(e){}
let curVista=null,cvDb=null,cvT=0;N.getDb().then(d=>{cvDb=d;if(!d)return;d.collection('estado').doc('cortesVistas').onSnapshot(x=>{if(x.exists){const v={...x.data()};delete v.ts;CORTES_V={...CORTES_V,...v};}},()=>{});});
function cortesDef(vid){if(vid.startsWith('__amb:')){const id=vid.slice(6);if(AMB_DEF[id])return {...AMB_DEF[id]};const L=M.LOCALES.find(l=>l.id===id);if(!L)return {};const xs=L.poly.map(q=>q[0]),ys=L.poly.map(q=>q[1]);const f=L.nivel==='EP'?H_EP:0,m=25;
    return {xmin:Math.min(...xs)-m,xmax:Math.max(...xs)+m,ymin:Math.min(...ys)-m,ymax:Math.max(...ys)+m,zmin:f-25,zmax:f+235};}return {};}
const cortesDe=vid=>CORTES_V[vid]||cortesDef(vid);
function ponerCortes(cs){for(const c of C6){c.on=cs[c.k]!=null;if(c.on)c.v=Math.round(cs[c.k]/5)*5;}applyClips();}
function guardarCortesVista(){if(!curVista)return;const v=VISTAS.find(x=>x.id===curVista);if(!v)return;v.c6=Object.fromEntries(C6.filter(c=>c.on).map(c=>[c.k,c.v]));v.ts2=new Date().toISOString();persistLocal();clearTimeout(cvT);cvT=setTimeout(()=>{if(vdb)try{const {id:_i,...body}=v;vdb.doc('vistas/'+v.id).set(body);}catch(e){}},600);pintarCV();}
function restablecerCortesVista(){if(!curVista)return;const v=VISTAS.find(x=>x.id===curVista);if(!v)return;v.c6=v.amb?cortesDef('__amb:'+v.amb):{};persistLocal();if(vdb)try{const {id:_i,...body}=v;vdb.doc('vistas/'+v.id).set(body);}catch(e){}ponerCortes(v.c6);pintarCV();}
function nombreVista(vid){if(vid.startsWith('__amb:')){const L=M.LOCALES.find(l=>l.id===vid.slice(6));return L?`${L.id} · ${L.nombre}`:vid;}const b=document.querySelector(`#viewbar [data-view="${vid.slice(4)}"]`);return b?b.textContent:vid.slice(4);}
function pintarCV(){const el=document.getElementById('c6vista');if(!el)return;const v=curVista&&VISTAS.find(x=>x.id===curVista);el.innerHTML=v?`Cortes de la vista <b>${v.nombre}</b>: lo que muevas queda guardado en ella${v.amb?' · <a href="#" data-c6rest>volver a los del ambiente</a>':' · <a href="#" data-c6rest>sin cortes</a>'}`:'Ninguna vista elegida: estos cortes no se guardan (elegí una vista o guardá la actual).';}
setTimeout(()=>pintarCV(),0);
function irVista(vid){curVista=vid;if(vid.startsWith('__v:')){const b=document.querySelector(`#viewbar [data-view="${vid.slice(4)}"]`);if(b)b.click();ponerCortes(cortesDe(vid));}else aislar(vid.slice(6));pintarCV();}
/* aislar un ambiente: sus seis cortes (paredes incluidas, de piso a techo, o los que guardaste) y una cámara que lo mira desde arriba en diagonal */
function aislar(id){const L=M.LOCALES.find(l=>l.id===id);if(!L)return;const vid='__amb:'+id;curVista=vid;const cs=cortesDe(vid);
  visor.params.corte='0';['q-corte','v-corte'].forEach(e=>{const el=$(e);if(el)el.value='0';});
  /* el techo en pendiente no se deja cortar a una altura: para ver adentro se esconde la capa de techos */if(visor.params.techos!==false){visor.setParams({techos:false});}ponerCortes(cs);
  const x0=cs.xmin??0,x1=cs.xmax??0,y0=cs.ymin??0,y1=cs.ymax??0,f=(cs.zmin??0)+25;const cx=(x0+x1)/2,cy=(y0+y1)/2,R=Math.max(x1-x0,y1-y0,300);visor.fly([cx-R*.45,f+R*.95+180,cy+R*.95],[cx,f+60,cy]);pintarCV();}
root.addEventListener('change',e=>{if(e.target.id==='q-corte'||e.target.id==='v-corte')applyClips();});
/* ocultar / mostrar piezas */
root.addEventListener('click',e=>{const h=e.target.closest('[data-hide]');if(h){visor.toggleHidden(h.dataset.hide,true);visor.resetSel();renderVistas();return;}if(e.target.closest('[data-showall]')){visor.setHidden([]);renderVistas();}});
/* ---------- vistas guardadas ---------- */
let VISTAS=[];let vdb=null;
function snapshot(){return {cam:visor.getView(),corte:visor.params.corte,c6:Object.fromEntries(C6.filter(c=>c.on).map(c=>[c.k,c.v])),hidden:visor.hidden,params:{techos:visor.params.techos,ep:visor.params.ep,calco:visor.params.calco,ext:visor.params.ext}};}
function applySnapshot(v){for(const k of ['techos','ep','calco','ext']){if(v.params&&v.params[k]!=null&&visor.params[k]!==v.params[k]){visor.params[k]=v.params[k];['q-','v-'].forEach(pre=>{const el=$(pre+k);if(el)el.checked=v.params[k];});}}
  visor.params.corte=v.corte||'0';['q-corte','v-corte'].forEach(id=>{const el=$(id);if(el)el.value=visor.params.corte;});visor.rebuild();applyCalco();
  for(const c of C6){c.on=false;}if(v.c6)for(const [k,val] of Object.entries(v.c6)){CL[k].on=true;CL[k].v=val;}
  /* vistas viejas con cortes X / Y de un lado */for(const [o,ax] of [['cx','x'],['cy','y']]){const q=v[o];if(q){const c=CL[ax+(q.side>0?'min':'max')];c.on=true;c.v=q.v;}}applyClips();
  visor.setHidden(v.hidden||[]);if(v.cam)visor.fly(v.cam.p,v.cam.t);renderVistas();}
function renderVistas(){const sel=document.getElementById('vistasSel');if(sel){const cur=sel.value;const FIX=[...document.querySelectorAll('#viewbar [data-view]')].map(b=>[b.dataset.view,b.textContent]);const fixOpts=(FIX.length?FIX:[['iso','Iso'],['planta','Planta'],['jardin','Jardín (E)'],['patio','Patio (O)'],['norte','Pileta (N)'],['sur','Fondo (S)']]).map(([k,l])=>`<option value="__v:${k}">${l}</option>`).join('')+'<option value="__all">Ver todo</option>';const ambOpts=M.LOCALES.filter(l=>l.poly).map(l=>`<option value="__amb:${l.id}">${l.id} · ${l.nombre}</option>`).join('');
    const G3=g=>ordenVistas(VISTAS.filter(v=>(v.grupo||'guardadas')===g)).map(v=>`<option value="${v.id}">${v.nombre}</option>`).join('');
    sel.innerHTML='<option value="">Vistas…</option><optgroup label="Vistas fijas">'+G3('fijas')+'<option value="__all">Ver todo</option></optgroup><optgroup label="Ambientes (aislados con los cortes)">'+G3('ambientes')+'</optgroup><optgroup label="Guardadas">'+G3('guardadas')+'</optgroup><option disabled>──────</option><option value="__save">＋ Guardar vista actual…</option><option value="__del">− Borrar la vista elegida…</option><option value="__upd" hidden>Actualizar</option><option value="__cut" hidden>Cortes</option>';sel.value=VISTAS.some(v=>v.id===cur)?cur:'';if(!sel.dataset.bound){sel.dataset.bound='1';
      const F=document.createElement('div');F.id='vistaForm';F.hidden=true;F.innerHTML='<span id="vfLbl"></span><input type="text" id="vfNom" maxlength="60" placeholder="nombre de la vista"><button class="btn" id="vfOk">Guardar</button><button class="btn" id="vfNo">×</button>';sel.parentNode.insertBefore(F,sel.nextSibling);
      const vfNom=F.querySelector('#vfNom'),vfOk=F.querySelector('#vfOk'),vfLbl=F.querySelector('#vfLbl');let fMode=null;
      const closeF=()=>{F.hidden=true;fMode=null;sel.hidden=false;sel.value=sel.dataset.cur||'';};
      const openF=(mode)=>{fMode=mode;F.hidden=false;sel.hidden=true;if(mode==='save'){vfLbl.textContent='';vfNom.hidden=false;vfNom.value='';vfOk.textContent='Guardar';setTimeout(()=>vfNom.focus(),0);}else{const v=VISTAS.find(x=>x.id===sel.dataset.cur);vfLbl.textContent='¿Borrar «'+v.nombre+'»?';vfNom.hidden=true;vfOk.textContent='Borrar';}};
      vfOk.addEventListener('click',async()=>{if(fMode==='save'){const nm=vfNom.value.trim();closeF();await guardarVista(nm);}else if(fMode==='del'){const cur=sel.dataset.cur;VISTAS=VISTAS.filter(x=>x.id!==cur);if(vdb)try{await vdb.doc('vistas/'+cur).delete();}catch(e){}persistLocal();sel.dataset.cur='';closeF();renderVistas();}});
      F.querySelector('#vfNo').addEventListener('click',closeF);vfNom.addEventListener('keydown',e=>{if(e.key==='Enter')vfOk.click();if(e.key==='Escape')closeF();});
      sel.addEventListener('change',()=>{const val=sel.value;if(val.startsWith('__amb:')||val.startsWith('__v:')){irVista(val);sel.value='';return;}if(val.startsWith('__v:')){const b=document.querySelector(`#viewbar [data-view="${val.slice(4)}"]`);if(b)b.click();sel.value='';return;}if(val==='__all'){const b=document.getElementById('clearSel');if(b)b.click();sel.value='';return;}if(val==='__save'){openF('save');return;}
      if(val==='__upd'){const id=sel.dataset.cur;actualizarVista(id);sel.value=VISTAS.some(x=>x.id===id)?id:'';return;}
      if(val==='__del'){if(!VISTAS.find(x=>x.id===sel.dataset.cur)){sel.value='';const o=sel.querySelector('option[value="__del"]');o.textContent='− Primero elegí una vista';setTimeout(()=>{o.textContent='− Borrar la vista elegida…';},2500);return;}openF('del');return;}
      if(val==='__cut'){const v=VISTAS.find(x=>x.id===sel.dataset.cur);if(v){aplicarEntrada(v);if(window.__side)window.__side.toggle('corte',true);}sel.value='';return;}
      sel.dataset.cur=val;const v=VISTAS.find(x=>x.id===val);if(v)aplicarEntrada(v);});}}
  const el=$('pane-vistas');if(!el)return;const hid=visor.hidden;
  el.innerHTML=`<p class="intro">Una vista guarda cámara, cortes, capas y piezas ocultas. Queda en la base de la página: la ves vos y la leo yo.</p><div class="renrow"><input type="text" id="vistaNombre" placeholder="nombre de la vista" maxlength="60"><button class="btn" id="vistaGuardar">Guardar</button></div><div class="renmsg" id="vistaMsg"></div>`+
    (VISTAS.length?VISTAS.map(v=>`<div class="row vrow" data-vista="${v.id}"><div style="flex:1;min-width:0"><div class="t"><b>${v.nombre}</b></div><div class="s">${v.cx?'corte X · ':''}${v.cy?'corte Y · ':''}${v.corte&&v.corte!=='0'?'corte a +'+(v.corte/100).toFixed(2).replace('.',',')+' · ':''}${(v.hidden||[]).length?(v.hidden.length+' ocultas · '):''}${(v.ts||'').slice(0,10)}</div></div><button class="btn" data-vupd="${v.id}" title="Actualizar con la vista de ahora">⟳</button><button class="btn" data-vdel="${v.id}" title="Borrar">×</button></div>`).join(''):'<p class="s">Todavía no hay vistas guardadas.</p>')+
    `<h3>Piezas ocultas <span class="n">${hid.length}</span></h3>`+(hid.length?hid.map(id=>`<div class="row"><div class="t">${id}</div><button class="btn" data-vshow="${id}">mostrar</button></div>`).join('')+`<button class="btn" data-showall style="margin-top:6px">Mostrar todo</button>`:'<p class="s">Ninguna. En el panel de una pieza seleccionada está «Ocultar pieza».</p>');
  el.querySelectorAll('.vrow').forEach(r=>r.addEventListener('click',e=>{if(e.target.closest('[data-vdel],[data-vupd]'))return;const v=VISTAS.find(x=>x.id===r.dataset.vista);if(v)applySnapshot(v);}));
  el.querySelectorAll('[data-vdel]').forEach(b=>b.addEventListener('click',async()=>{const id=b.dataset.vdel;VISTAS=VISTAS.filter(x=>x.id!==id);if(vdb)try{await vdb.doc('vistas/'+id).delete();}catch(e){}persistLocal();renderVistas();}));
  el.querySelectorAll('[data-vupd]').forEach(b=>b.addEventListener('click',()=>actualizarVista(b.dataset.vupd)));
  el.querySelectorAll('[data-vshow]').forEach(b=>b.addEventListener('click',()=>{visor.toggleHidden(b.dataset.vshow,false);renderVistas();}));
  $('vistaGuardar').addEventListener('click',async()=>{const msg=await guardarVista(($('vistaNombre').value||'').trim());const m=$('vistaMsg');if(m)m.textContent=msg;});}
async function guardarVista(nombre){const nm=nombre||('Vista '+(VISTAS.length+1));const id='v'+Date.now().toString(36);const v={id,nombre:nm,ts:new Date().toISOString(),...snapshot()};VISTAS.push(v);
  let msg='Guardada en este navegador.';if(vdb){try{const {id:_i,...body}=v;await vdb.doc('vistas/'+id).set(body);msg='Guardada.';}catch(e){msg='Guardada solo en este navegador ('+(e&&e.code||'sin permiso')+').';}}persistLocal();renderVistas();const sel=document.getElementById('vistasSel');if(sel){sel.value=id;sel.dataset.cur=id;}return msg;}
/* «Actualizar»: la vista guardada toma la cámara, cortes y capas de ahora; conserva nombre e id */
async function actualizarVista(id){const i=VISTAS.findIndex(x=>x.id===id);if(i<0)return 'No encontré esa vista.';const v={...VISTAS[i],ts:new Date().toISOString(),...snapshot()};VISTAS[i]=v;
  let msg='Actualizada en este navegador.';if(vdb){try{const {id:_i,...body}=v;await vdb.doc('vistas/'+id).set(body);msg='Actualizada.';}catch(e){msg='Actualizada solo en este navegador ('+(e&&e.code||'sin permiso')+').';}}persistLocal();renderVistas();
  const b=document.getElementById('vistasBtn');if(b){b.textContent='✓ «'+v.nombre+'» actualizada';setTimeout(()=>{b.textContent='Vistas ▾';},2200);}return msg;}
/* todas las vistas son entradas guardadas (Maxi 15/10): las fijas y las de cada ambiente se siembran una vez y después se actualizan, se editan sus cortes o se borran como cualquier otra */
const GORD={fijas:0,ambientes:1,guardadas:2};const ordenVistas=L=>[...L].sort((a,b)=>(GORD[a.grupo||'guardadas']-GORD[b.grupo||'guardadas'])||((a.ord??999)-(b.ord??999))||(a.ts||'').localeCompare(b.ts||''));
function aplicarEntrada(v){curVista=v.id;
  if(!v.cam&&v.amb){const L=M.LOCALES.find(l=>l.id===v.amb);if(v.params)applyParams(v.params);else if(visor.params.techos!==false)visor.setParams({techos:false});visor.params.corte='0';['q-corte','v-corte'].forEach(e=>{const el=$(e);if(el)el.value='0';});ponerCortes(v.c6||cortesDef('__amb:'+v.amb));
    const cs=v.c6||{};const x0=cs.xmin??0,x1=cs.xmax??0,y0=cs.ymin??0,y1=cs.ymax??0,f=(cs.zmin??(L&&L.nivel==='EP'?H_EP-25:-25))+25;const cx=(x0+x1)/2,cy=(y0+y1)/2,R=Math.max(x1-x0,y1-y0,300);visor.fly([cx-R*.45,f+R*.95+180,cy+R*.95],[cx,f+60,cy]);}
  else if(!v.cam&&v.preset){const b=document.querySelector(`#viewbar [data-view="${v.preset}"]`);if(b)b.click();if(v.params)applyParams(v.params);ponerCortes(v.c6||{});}
  else applySnapshot(v);pintarCV();}
function applyParams(pp){const o={};for(const k of ['techos','ep','calco','ext'])if(pp[k]!=null&&visor.params[k]!==pp[k])o[k]=pp[k];if(Object.keys(o).length)visor.setParams(o);}
async function guardarEntrada(v){const i=VISTAS.findIndex(x=>x.id===v.id);if(i>=0)VISTAS[i]=v;else VISTAS.push(v);persistLocal();if(vdb)try{const {id:_i,...body}=v;await vdb.doc('vistas/'+v.id).set(body);}catch(e){}}
let sembrando=false;
async function sembrarVistas(){if(sembrando)return;const marca=localStorage.getItem('carhue-vistas-sembradas');if(VISTAS.some(v=>v.grupo==='fijas'||v.grupo==='ambientes'))return;
  if(vdb){try{const d=await vdb.doc('estado/vistasSembradas').get();if(d&&d.exists)return;}catch(e){}}else if(marca)return;
  sembrando=true;const t0=Date.now();let k=0;const FIX=[...document.querySelectorAll('#viewbar [data-view]')].map(b=>[b.dataset.view,b.textContent]);
  for(const [pr,nm] of FIX){const id='p-'+pr;await guardarEntrada({id,nombre:nm,grupo:'fijas',preset:pr,ord:k++,ts:new Date(t0+k).toISOString(),...(CORTES_V['__v:'+pr]?{c6:CORTES_V['__v:'+pr]}:{})});}
  for(const L of M.LOCALES.filter(l=>l.poly)){const id='p-amb-'+L.id;await guardarEntrada({id,nombre:`${L.id} · ${L.nombre}`,grupo:'ambientes',amb:L.id,ord:k++,ts:new Date(t0+k).toISOString(),c6:CORTES_V['__amb:'+L.id]||cortesDef('__amb:'+L.id),params:{techos:false}});}
  try{localStorage.setItem('carhue-vistas-sembradas','1');}catch(e){}if(vdb)try{await vdb.doc('estado/vistasSembradas').set({ts:new Date().toISOString()});}catch(e){}sembrando=false;renderVistas();}
function persistLocal(){try{localStorage.setItem('carhue-vistas',JSON.stringify(VISTAS));}catch(e){}}
try{VISTAS=JSON.parse(localStorage.getItem('carhue-vistas')||'[]');}catch(e){VISTAS=[];}
renderVistas();
try{initMarcas(visor,document.querySelector('#modo-3d .stage'));}catch(e){console.error('marcas',e);}
/* navegación con teclado: WASD avanza/retrocede/costados, Q/E baja/sube, flechas giran la vista (Shift = rápido) */
{const keys=new Set();const K=['w','a','s','d','q','e','arrowleft','arrowright','arrowup','arrowdown'];
  const busy=t=>t&&(t.tagName==='INPUT'||t.tagName==='SELECT'||t.tagName==='TEXTAREA'||t.isContentEditable);
  addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(document.getElementById('modo-3d').hidden||busy(e.target)||e.metaKey||e.ctrlKey||!K.includes(k))return;e.preventDefault();keys.add(k);if(e.shiftKey)keys.add('shift');});
  addEventListener('keyup',e=>{keys.delete(e.key.toLowerCase());if(!e.shiftKey)keys.delete('shift');});addEventListener('blur',()=>keys.clear());
  let last=performance.now();const V=visor.THREE.Vector3,f=new V(),r=new V(),up=new V(0,1,0),d=new V();
  const tick=t=>{const dt=Math.min(.05,(t-last)/1000);last=t;if(keys.size){const cam=visor.camera,tg=visor.controls.target;const sp=Math.max(120,Math.min(1500,cam.position.distanceTo(tg)*.5))*dt;
      f.copy(tg).sub(cam.position).normalize();r.crossVectors(f,up);if(r.lengthSq()<1e-6)r.set(1,0,0);r.normalize();d.set(0,0,0);
      if(keys.has('w'))d.add(f);if(keys.has('s'))d.sub(f);if(keys.has('d'))d.add(r);if(keys.has('a'))d.sub(r);if(keys.has('e'))d.y+=1;if(keys.has('q'))d.y-=1;const sh=keys.has('shift');if(sh&&keys.has('arrowup'))d.y+=1;if(sh&&keys.has('arrowdown'))d.y-=1;
      if(d.lengthSq()){d.normalize().multiplyScalar(sp);cam.position.add(d);tg.add(d);}
      const yaw=((keys.has('arrowleft')?1:0)-(keys.has('arrowright')?1:0))*1.4*dt,pit=sh?0:((keys.has('arrowup')?1:0)-(keys.has('arrowdown')?1:0))*1.0*dt;
      if(yaw||pit){const v=tg.clone().sub(cam.position);if(yaw)v.applyAxisAngle(up,yaw);if(pit){const ax=new V().crossVectors(v,up).normalize();const nv=v.clone().applyAxisAngle(ax,pit);const el=Math.asin(nv.clone().normalize().y);if(Math.abs(el)<1.45)v.copy(nv);}tg.copy(cam.position).add(v);}
      visor.controls.update();}
    requestAnimationFrame(tick);};requestAnimationFrame(tick);}
/* aberturas (hojas corredizas, proyectantes, lucarnas): quedan en la base del artifact, así se mantienen entre sesiones y dispositivos */
/* variables de diseño (todas menos las de «Ver») en la base: así los cambios valen en cualquier dispositivo (Maxi 14/10) */
const PDES=new Set(params.filter(q=>(q.group||'')!=='Ver').map(q=>q.id));const pdes=P=>Object.fromEntries(Object.entries(P).filter(([k])=>PDES.has(k)));
visor.onParam=P=>{if(vdb)vdb.doc('estado/params').set({p:pdes(P),ts:new Date().toISOString()}).catch(()=>{});};
N.getDb().then(db=>{if(!db)return;db.collection('estado').onSnapshot(snap=>{const d=snap.docs.find(x=>x.id==='params'&&x.exists);if(!d)return;const b=(d.data()||{}).p||{};
  const cur=pdes(visor.params);if(JSON.stringify(b)===JSON.stringify(Object.fromEntries(Object.keys(b).map(k=>[k,cur[k]]))))return;visor.setParams(b);},()=>{});});
function guardarAberturas(){if(vdb)vdb.doc('estado/aberturas').set({luz:LUZ,hojas:HOJAS,ts:new Date().toISOString()}).catch(()=>{});}
N.getDb().then(db=>{if(!db)return;db.collection('estado').onSnapshot(snap=>{const d=snap.docs.find(x=>x.id==='aberturas'&&x.exists);if(!d)return;const b=d.data()||{};
  const same=JSON.stringify(b.luz||{})===JSON.stringify(LUZ)&&JSON.stringify(b.hojas||{})===JSON.stringify(HOJAS);if(same)return;
  for(const k of Object.keys(LUZ))delete LUZ[k];Object.assign(LUZ,b.luz||{});for(const k of Object.keys(HOJAS))delete HOJAS[k];Object.assign(HOJAS,b.hojas||{});
  try{localStorage.setItem('carhue-lucarnas',JSON.stringify(LUZ));localStorage.setItem('carhue-hojas',JSON.stringify(HOJAS));}catch(e){}visor.rebuild();applyClips();},()=>{});});
N.getDb().then(db=>{vdb=db;if(!db)return;let primera=true;db.collection('vistas').onSnapshot(snap=>{const remote=[];snap.docs.forEach(d=>{if(d.exists)remote.push({id:d.id,...d.data()});});if(remote.length||VISTAS.length===0){VISTAS=remote.sort((a,b)=>(a.ts||'').localeCompare(b.ts||''));persistLocal();}renderVistas();if(primera){primera=false;setTimeout(sembrarVistas,300);}},()=>{});});
setTimeout(()=>{if(!vdb)sembrarVistas();},4000);
/* nombres propios: al cambiar, se reconstruye con los nombres nuevos */
N.bindEditor(root,()=>{});
N.onChange(()=>{visor.rebuild();applyClips();});
ED.onChange(()=>{visor.rebuild();applyClips();});
/* arrastrar las hojas H-1…H-3 a lo largo del riel (H-4 es fija) */
{const view=document.getElementById('view'),T=visor.THREE,ray=new T.Raycaster(),mv=new T.Vector2();let dr=null;const W=(625-27)/4,MIN={'H-1':-3*W,'H-2':-2*W,'H-3':-W,'H-4':0},MAX={};
  /* puerta-ventanas del ventanal (PV-01…06, corren en X sobre su riel) y del tímpano norte (PV-07…10, corren a lo ancho) */
  for(let i=0;i<6;i++){const x0=1353+i*195;MIN[`PV-0${i+1}`]=1353-x0;MAX[`PV-0${i+1}`]=2523-195-x0;}
  for(let i=0;i<4;i++){const y0=115+i*198.75,id=`PV-${String(7+i).padStart(2,'0')}`;MIN[id]=-85-y0;/* 2 m más allá de M-03 */MAX[id]=910-198.75-y0;}MIN['PV-12']=-140;MAX['PV-12']=0;
  const EJE=id=>/^PV-0[1-6]$/.test(id)?'x':'z';const base=id=>id.replace(/[vkm]$/,'');
  const setRay=e=>{const r=visor.renderer.domElement.getBoundingClientRect();mv.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mv,visor.camera);};
  const ocupado=()=>document.querySelector('#editarTg[aria-pressed=true],#senPanel:not([hidden]),#medPanel:not([hidden]),#marcasPanel:not([hidden])');
  view.addEventListener('pointerdown',e=>{if(e.button!==0||ocupado())return;setRay(e);const ms=[];for(const p of visor.parts)if(/^H-[123]v?$|^PV-(0[1-9]|1[02])[vkm]?$/.test(p.id)&&p.grp.visible!==false)p.grp.traverse(o=>{if(o.isMesh)ms.push(o);});
    const h=ray.intersectObjects(ms,false)[0];if(!h)return;const id=base(h.object.userData.id),ax=EJE(id),cid=/^H-[123]$/.test(id)?'M-43':id;
    /* bloqueada: no se mueve; la cámara orbita y el toque la elige (Maxi 15/10) */if(visor.candado&&visor.candado.bloqueada(cid)){visor.candado.mostrar(cid,h.point);return;}
    e.stopPropagation();view.setPointerCapture(e.pointerId);visor.controls.enabled=false;
    dr={id,cid,pid:h.object.userData.id,sx:e.clientX,sy:e.clientY,moved:false,ax,p0:h.point.clone(),o0:HOJAS[id]||0,plane:ax==='x'?new T.Plane(new T.Vector3(0,0,1),-h.point.z):new T.Plane(new T.Vector3(1,0,0),-h.point.x),grps:visor.parts.filter(p=>p.id===id||p.id===id+'v'||p.id===id+'k'||p.id===id+'m').map(p=>p.grp),o:HOJAS[id]||0};
    if(/^H-[123]$/.test(id)){/* corrediza telescópica: las tres hojas se mueven juntas, proporcional (1 : 2 : 3), por las poleas */dr.tele=['H-1','H-2','H-3'].map(h=>({h,o0:HOJAS[h]||0,o:HOJAS[h]||0,grps:visor.parts.filter(p=>p.id===h||p.id===h+'v').map(p=>p.grp)}));for(const q of visor.parts)if(q.id==='M-43p'||q.id==='M-43z')q.grp.visible=false;}},true);
  view.addEventListener('pointermove',e=>{if(!dr)return;e.stopPropagation();if(!dr.moved){if(Math.hypot(e.clientX-dr.sx,e.clientY-dr.sy)<4)return;dr.moved=true;visor.candado&&visor.candado.mostrar(dr.cid,dr.p0);}setRay(e);const q=ray.ray.intersectPlane(dr.plane,new T.Vector3());if(!q)return;let o=dr.o0+(q[dr.ax]-dr.p0[dr.ax]);o=Math.max(MIN[dr.id],Math.min(MAX[dr.id]||0,o));dr.o=Math.round(o);if(dr.tele){const k=Math.max(0,Math.min(1,dr.o/MIN[dr.id]));for(const t of dr.tele){t.o=Math.round(k*MIN[t.h]);for(const g of t.grps)g.position.z=t.o-t.o0;}const st=document.getElementById('stTool');if(st)st.innerHTML=`<b>M-43</b> abierta ${Math.round(k*100)}%`;return;}for(const g of dr.grps)g.position[dr.ax]=dr.o-dr.o0;},true);
  const end=e=>{if(!dr)return;e.stopPropagation();visor.controls.enabled=true;
    if(!dr.moved){/* toque sin arrastre: la elige y muestra su candado */const d=dr;dr=null;if(d.tele){visor.rebuild();applyClips();}visor.showPart(d.pid);visor.candado&&visor.candado.mostrar(d.cid,d.p0);return;}
    visor.candado&&visor.candado.mostrar(dr.cid);    if(dr.tele)for(const t of dr.tele)HOJAS[t.h]=t.o;else HOJAS[dr.id]=dr.o;try{localStorage.setItem('carhue-hojas',JSON.stringify(HOJAS));}catch(x){}guardarAberturas();dr=null;visor.rebuild();applyClips();};
  view.addEventListener('pointerup',end,true);view.addEventListener('pointercancel',end,true);}
/* hojas proyectantes y lucarnas: se abren arrastrando (arriba abre, abajo cierra), como las corredizas; al soltar queda guardado */
{const view=document.getElementById('view'),T=visor.THREE,ray=new T.Raycaster(),mv=new T.Vector2();let dr=null;
  const busy=()=>document.querySelector('#edPanel:not([hidden]),#senPanel:not([hidden]),#medPanel:not([hidden]),#marcasPanel:not([hidden])');
  view.addEventListener('pointerdown',e=>{if(e.button!==0||busy())return;
    const r=visor.renderer.domElement.getBoundingClientRect();mv.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mv,visor.camera);
    const ms=[];for(const q of visor.parts)if((/^LU-\d+(m|m2|w|w2|v2|k|k2)?$/.test(q.id)||/^(P-05|P-06|V-07|VE-\d|VG-\d)(h|d|h2|v2|k|k2)?$/.test(q.id)||/^P-03[hvk]$/.test(q.id)||/^DM-Cp\d+(h|d)?$/.test(q.id))&&q.grp.visible!==false)q.grp.traverse(o=>{if(o.isMesh)ms.push(o);});
    const h=ray.intersectObjects(ms,false)[0];if(!h)return;const id=h.object.userData.id.replace(/[a-z]\d?$/,'');const H=HINGE[id];if(!H)return;
    if(visor.candado&&visor.candado.bloqueada(id)){visor.candado.mostrar(id,h.point);return;}
    e.stopPropagation();view.setPointerCapture(e.pointerId);visor.controls.enabled=false;
    const grps=visor.parts.filter(p=>H.parts.includes(p.id)).map(p=>p.grp);const grps2=H.fold?visor.parts.filter(p=>H.fold.parts.includes(p.id)).map(p=>p.grp):[];grps2.forEach(g=>{g.userData.m0=g.matrix.clone();g.matrixAutoUpdate=false;});const dm=visor.parts.filter(p=>p.id===H.dm).map(p=>p.grp);dm.forEach(g=>g.visible=false);
    grps.forEach(g=>{g.userData.m0=g.matrix.clone();g.matrixAutoUpdate=false;});
    dr={id,H,y0:e.clientY,x0:e.clientX,a0:H.ang,a:H.ang,grps,grps2,pid:h.object.userData.id,p0:h.point.clone(),moved:false};},true);
  view.addEventListener('pointermove',e=>{if(!dr)return;e.stopPropagation();if(!dr.moved){if(Math.hypot(e.clientX-dr.x0,e.clientY-dr.y0)<4)return;dr.moved=true;visor.candado&&visor.candado.mostrar(dr.id,dr.p0);}const a=Math.max(dr.H.min??0,Math.min(dr.H.max,dr.a0+(dr.H.axisY?(e.clientX-dr.x0)*0.5:dr.H.horizDrag?(e.clientX-dr.x0)*0.4*dr.H.horizDrag:(dr.y0-e.clientY)*0.6)));dr.a=Math.round(a);
    if(dr.H.vec){const d=dr.H.vec(dr.a).sub(dr.H.vec(dr.H.ang)),M=new T.Matrix4().makeTranslation(d.x,d.y,d.z);for(const g of dr.grps){g.matrix.copy(M).multiply(g.userData.m0);g.matrixWorldNeedsUpdate=true;}const st=document.getElementById('stTool');if(st)st.innerHTML=`<b>${dr.id}</b> abierta ${dr.a}%`;return;}
    if(dr.H.axisY){const d=(dr.a-dr.H.ang)*Math.PI/180,M=new T.Matrix4().makeTranslation(dr.H.x,0,dr.H.y).multiply(new T.Matrix4().makeRotationY(d)).multiply(new T.Matrix4().makeTranslation(-dr.H.x,0,-dr.H.y));for(const g of dr.grps){g.matrix.copy(M).multiply(g.userData.m0);g.matrixWorldNeedsUpdate=true;}const st=document.getElementById('stTool');if(st)st.innerHTML=`<b>${dr.id}</b> girada ${dr.a}°`;return;}
    const d=(dr.a-dr.H.ang)*Math.PI/180*dr.H.s,M=new T.Matrix4().makeTranslation(0,dr.H.z,dr.H.y).multiply(new T.Matrix4().makeRotationX(d)).multiply(new T.Matrix4().makeTranslation(0,-dr.H.z,-dr.H.y));
    for(const g of dr.grps){g.matrix.copy(M).multiply(g.userData.m0);g.matrixWorldNeedsUpdate=true;}
    if(dr.H.fold&&dr.grps2.length){/* hoja de abajo: L(a)·L(a0)⁻¹, con L(a)=T(U(a)·Pm−Pm)·Rx(+a) alrededor de la bisagra del medio */
      const F=dr.H.fold,RXm=(a,y,z)=>new T.Matrix4().makeTranslation(0,z,y).multiply(new T.Matrix4().makeRotationX(a)).multiply(new T.Matrix4().makeTranslation(0,-z,-y));
      const sg=-(dr.H.s??-1),Lm=a=>{const r=a*Math.PI/180*sg,pm=new T.Vector3(0,F.z,F.y).applyMatrix4(RXm(-r,dr.H.y,dr.H.z));return new T.Matrix4().makeTranslation(0,pm.y-F.z,pm.z-F.y).multiply(RXm(r,F.y,F.z));};
      const M2=Lm(dr.a).multiply(Lm(dr.H.ang).invert());for(const g of dr.grps2){g.matrix.copy(M2).multiply(g.userData.m0);g.matrixWorldNeedsUpdate=true;}}
    const st=document.getElementById('stTool');if(st)st.innerHTML=`<b>${dr.id}</b> abierta ${dr.a}°`;},true);
  const end=e=>{if(!dr)return;e.stopPropagation();visor.controls.enabled=true;if(!dr.moved){const d=dr;dr=null;setTimeout(()=>{visor.rebuild();applyClips();visor.showPart(d.pid);visor.candado&&visor.candado.mostrar(d.id,d.p0);},0);return;}visor.candado&&visor.candado.mostrar(dr.id);const {id,a}=dr;dr=null;LUZ[id]=a;try{localStorage.setItem('carhue-lucarnas',JSON.stringify(LUZ));}catch(x){}guardarAberturas();setTimeout(()=>{visor.rebuild();applyClips();},0);};
  view.addEventListener('pointerup',end,true);view.addEventListener('pointercancel',end,true);}
try{initCandado(visor);}catch(e){console.error('candado',e);}
try{initRealismo(visor);}catch(e){console.error('realismo',e);}
try{initLuz(visor);}catch(e){console.error('luz',e);}
try{initCalidad(visor);}catch(e){console.error('calidad',e);}
try{initPersonas(visor);}catch(e){console.error('personas',e);}
try{initEquipamiento(visor,document.querySelector('#modo-3d .stage'));}catch(e){console.error('equipamiento',e);}
try{initArboles(visor,M);}catch(e){console.error('arboles',e);}
try{initNoche(visor);}catch(e){console.error('noche',e);}
try{initTours(visor);}catch(e){console.error('tours',e);}
try{initTermica(visor,M);}catch(e){console.error('termica',e);}
/* cámara: se recuerda en este navegador y vuelve al abrir la página */
{try{const v=JSON.parse(localStorage.getItem('carhue-cam')||'null');if(v&&v.p&&v.t){visor.camera.position.set(...v.p);visor.controls.target.set(...v.t);visor.controls.update();}}catch(e){}
  let last='';setInterval(()=>{const v=visor.getView();const k=JSON.stringify(v);if(k!==last){last=k;try{localStorage.setItem('carhue-cam',k);}catch(e){}}},1000);}
{const q=document.getElementById('quick');if(q){const s1=document.createElement('span');s1.id='escInfo1';s1.className='escInfoX';s1.textContent=window.__escInfo1||'';q.appendChild(s1);}}
{const q=document.getElementById('quick');if(q){const s=document.createElement('span');s.id='escInfo';s.textContent=window.__escInfo||'';{const a=document.getElementById('q-escB3k');const l=a&&a.closest('label');if(l)l.after(s);else q.appendChild(s);}const upd=()=>{s.style.display=visor.params.escAlt==='B3'?'':'none';};upd();document.addEventListener('change',upd);}}
try{initEditor(visor,document.querySelector('#modo-3d .stage'),WALL_TOP,H_EP);}catch(e){console.error('editor',e);}
try{initSenalar(visor,document.querySelector('#modo-3d .stage'));}catch(e){console.error('senalar',e);}
try{initMedir(visor,document.querySelector('#modo-3d .stage'));}catch(e){console.error('medir',e);}
/* zonas con variantes de diseño: la tarjeta aparece al elegir una de sus piezas */
const ZONAS=[{id:'esc-alt',nombre:'Escalera al altillo',piezas:/^(ESC-(A|D|E|S|B2|B3)[a-z]?|PAS-1|P-34)$/,params:['escAlt','escB3G','escB3n','escB3k','escB2k'],info:'escInfo',
  label:Object.fromEntries((params.find(q=>q.id==='escAlt').options)),vista:{p:[1850,330,330],t:[2230,170,-230]}},
  {id:'esc-ep',nombre:'Escalera al entrepiso',piezas:/^(ESC1-[TZPB]|ESC-(ZE\d|TE|Z\d|E\d|P\d|V\d|C\d|T\d|H\d|B\d|L\d))$/,params:['escTipo','escN','escAlto','escGiro','escDy'],info:'escInfo1',label:Object.fromEntries((params.find(q=>q.id==='escTipo').options)),vista:{p:[1950,520,1000],t:[1400,120,560]}},
  {id:'ventJ',nombre:'Ventanas al jardín (P-05, P-06)',piezas:/^(P-05|P-06)(h|d|h2|v2|k|k2|c|p|m)?$/,params:['ventJ'],label:Object.fromEntries((params.find(q=>q.id==='ventJ').options)),vista:{p:[700,240,1250],t:[650,120,690]}},
  {id:'p26',nombre:'Puerta del baño piletero',piezas:/^(P-26[a-z]*|M-24|M-26|L-11)$/,params:['p26'],label:Object.fromEntries(params.find(q=>q.id==='p26').options),vista:{p:[1700,600,-420],t:[2100,100,-420]}},
  {id:'ventV7',nombre:'Ventana V-07',piezas:/^V-07(h|d|h2|v2|k|k2|c|p|m)?$/,params:['ventV7'],label:Object.fromEntries((params.find(q=>q.id==='ventV7').options)),vista:{p:[1180,200,1000],t:[1100,110,620]}},
  {id:'p03',nombre:'Puerta al patio P-03',piezas:/^P-03[mhvk]?$/,params:['p03Est'],label:Object.fromEntries((params.find(q=>q.id==='p03Est').options)),vista:{p:[1410,170,420],t:[1410,100,27]}},
  {id:'m43',nombre:'Gran corrediza M-43',piezas:/^(H-[1-4]v?|M-43[rpz]?)$/,params:['m43Est'],label:Object.fromEntries((params.find(q=>q.id==='m43Est').options)),vista:{p:[1300,420,700],t:[1000,360,300]}},
  /* Maxi 14/10: los dormers son opciones del faldón donde van: tocando las lucarnas, sus dormers o el techo mismo; el del altillo, tocando el altillo o su techo */
  {id:'faldon',nombre:'Faldón al jardín: dormers y lucarnas',piezas:/^(T-01|CAB-3|LU-\d+(z|m|m2|w|w2|v2|d|b|c|k|k2)?|DM-(1|2|C)[a-z0-9]*|VE-\d[a-z]*)$/,params:['dormers','luTipo'],label:{...Object.fromEntries(params.find(q=>q.id==='dormers').options),...Object.fromEntries(params.find(q=>q.id==='luTipo').options)},vista:{p:[560,1050,1450],t:[560,430,560]}},
  {id:'altillo',nombre:'Altillo: dormer a la pileta',piezas:/^(T-06|CAB-6|CU-2|L-24|DM-3[a-z]*)$/,params:['dormAlt'],label:Object.fromEntries(params.find(q=>q.id==='dormAlt').options),vista:{p:[2550,900,-1500],t:[2150,380,-560]}}];
{let vu=null;try{vu=initVistasUI();}catch(e){console.error('vistas',e);}
try{initToolbar(document.querySelector('#modo-3d .stage'),visor,{vistas:vu,zonas:ZONAS});}catch(e){console.error('toolbar',e);}}
try{initInspector(visor);}catch(e){console.error('inspector',e);}
try{initViewCube(visor);}catch(e){console.error('viewcube',e);}
try{initSidebar(visor);}catch(e){console.error('sidebar',e);}
/* estructura (prototipo): datos de las barras de esta casa; lo no confirmado queda marcado como supuesto en el panel */
try{initEstructura(visor,M,{barras:{'W-1':{sec:'IPE240',acero:'F-24',trib:2.9,D:.35,apoyosExtra:[{x:0,nota:'extremo sur (x 9,00): ¿sobre qué apoya? supuesto'}],nota:'Ancho tributario supuesto: mitad del faldón hasta la cumbrera (1,4 m) + mitad del techo de vidrio hasta el riel RA-1 (1,5 m). D supuesto: chapa o vidrio + cabios + machimbre ≈ 0,35 kN/m². La sección real del perfil W no la tengo: elegí la más parecida o pasame sus medidas.'}}});}catch(e){console.error('estructura',e);}
window.__ok3d=true;
