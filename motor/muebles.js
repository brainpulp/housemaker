/* Catálogo de muebles de housemaker (Maxi 15/10): modelos según sus referencias de interiores (docs/ESTILO.md):
   bajos, madera maciza, lino, piedra oscura, negro mate, cantos redondeados en lo tapizado, zócalos rehundidos y tiradores finos.
   Reutilizable en cualquier casa y en la página de catálogo. Cada pieza: {n, cat (familia), p (parámetros por defecto, cm), g(p,ctx) → [[geometría, material]]}.
   Coordenadas locales: origen en el piso, al centro de la planta; x = largo (L), z = fondo (D) con el frente hacia +z, y = altura. */
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

/* materiales que usan las piezas (el visor los crea con MeshStandardMaterial) */
export const MATERIALES={roble:['#b98a5a',.7],madOsc:['#6e4a2e',.7],madRust:['#8a6142',.85],madClara:['#c79f72',.7],lino:['#c9c1b3',.95],tela:['#8a8f96',.95],
  mostaza:['#b88a3a',.95],petroleo:['#3e5a63',.95],sabana:['#efece6',.95],almohada:['#f6f3ee',.95],yute:['#b39a6c',1],negro:['#161718',.35],grafito:['#3b3e40',.55],
  piedra:['#d9d4cb',.35],granito:['#2f2f30',.3],pizarra:['#2c2f31',.75],loza:['#f4f3f0',.25],blanco:['#ece9e2',.5],verde:['#5f7a5a',.6],rojo:['#b3342b',.4],acero:['#c9cdd1',.3,.7],
  junta:['#2a2622',.9],espejo:['#dfe6ea',.04,1],grifo:['#2a2b2d',.3,.6],alfombra:['#b9ad98',1],vidrioN:['#101214',.08,.2],ledCalido:['#f3d9a8',.7,0,'#ffb85a']};
/* [color, rugosidad, metal, emisivo] */

export function catalogoMuebles(THREE){
  const B=(x0,x1,y0,y1,z0,z1)=>{const g=new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0);g.translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);return g;};
  const R=(x0,x1,y0,y1,z0,z1,r=3)=>{const w=x1-x0,h=y1-y0,d=z1-z0;const g=new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/2-.01,h/2-.01,d/2-.01));g.translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);return g;};
  const C=(r,y0,y1,x=0,z=0,s=20,r2)=>{const g=new THREE.CylinderGeometry(r2??r,r,y1-y0,s);g.translate(x,(y0+y1)/2,z);return g;};
  const VAR=(a,b,r,s=8)=>{/* varilla entre dos puntos */const A=new THREE.Vector3(...a),Bv=new THREE.Vector3(...b),d=Bv.clone().sub(A);const g=new THREE.CylinderGeometry(r,r,d.length(),s);g.translate(0,d.length()/2,0);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()));g.translate(...a);return g;};
  /* ranura de 4 mm (puertas y cajones) y tirador fino negro */
  const ran=(x0,x1,y0,y1,z)=>[B(x0,x1,y0,y1,z-.1,z+.05),'junta'];
  const tir=(x,y,z,l=16,vert=false)=>[vert?B(x-.6,x+.6,y-l/2,y+l/2,z,z+1.6):B(x-l/2,x+l/2,y-.6,y+.6,z,z+1.6),'negro'];
  /* frente de cajonera/puertas: n módulos, filas de cajones, zócalo rehundido */
  function frente(L,D,y0,y1,{mods=1,filas=1,tirador='h'}={}){const g=[],z=D/2;for(let i=1;i<mods;i++){const x=-L/2+L*i/mods;g.push(ran(x-.2,x+.2,y0,y1,z));}
    for(let j=1;j<filas;j++){const y=y0+(y1-y0)*j/filas;g.push(ran(-L/2+.5,L/2-.5,y-.2,y+.2,z));}
    for(let i=0;i<mods;i++)for(let j=0;j<filas;j++){const xc=-L/2+L*(i+.5)/mods,yt=y0+(y1-y0)*(j+1)/filas;g.push(tirador==='v'?tir(xc+(L/mods)/2-6,(y0+y1)/2,z,24,true):tir(xc,yt-4,z,Math.min(24,L/mods*.5)));}return g;}
  const cojin=(x0,x1,y0,y1,z0,z1,m)=>[R(x0,x1,y0,y1,z0,z1,Math.min(6,(y1-y0)/2.2)),m];
  const CYL=C;
  const P={
  /* ---------- estar ---------- */
  sofa:{n:'Sofá bajo de lino sobre zócalo de madera',cat:'estar',p:{L:220,D:95,H:78,tela:'lino',mad:'roble'},g:p=>{const g=[[B(-p.L/2+4,p.L/2-4,0,10,-p.D/2+4,p.D/2-4),p.mad]],A=22;
    g.push(cojin(-p.L/2,-p.L/2+A,10,58,-p.D/2,p.D/2,p.tela),cojin(p.L/2-A,p.L/2,10,58,-p.D/2,p.D/2,p.tela),cojin(-p.L/2+A,p.L/2-A,10,24,-p.D/2,p.D/2,p.tela));
    const n=Math.max(1,Math.round((p.L-2*A)/80));for(let i=0;i<n;i++){const a=-p.L/2+A+(p.L-2*A)*i/n,b=-p.L/2+A+(p.L-2*A)*(i+1)/n;g.push(cojin(a+.5,b-.5,24,44,-p.D/2+24,p.D/2-1,p.tela),cojin(a+1,b-1,24,p.H,-p.D/2+2,-p.D/2+26,p.tela));}
    g.push(cojin(-p.L/2+A+4,-p.L/2+A+48,40,82,-p.D/2+22,-p.D/2+36,'almohada'));return g;}},
  butaca:{n:'Butaca baja de madera con almohadones',cat:'estar',p:{tela:'lino',mad:'roble'},g:p=>{const g=[],W=74,D=80;
    for(const s of [-1,1]){const x=s*(W/2-2.5);g.push([B(x-2.5,x+2.5,0,4,-D/2,D/2),p.mad],[B(x-2.5,x+2.5,4,52,D/2-6,D/2),p.mad],[B(x-2.5,x+2.5,4,70,-D/2,-D/2+6),p.mad],[B(x-2.5,x+2.5,48,52,-D/2,D/2),p.mad]);}
    g.push([B(-W/2+5,W/2-5,18,22,-D/2+6,D/2-6),p.mad],cojin(-W/2+5,W/2-5,22,38,-D/2+12,D/2-4,p.tela),cojin(-W/2+6,W/2-6,30,74,-D/2+4,-D/2+20,p.tela));return g;}},
  ratona:{n:'Mesa ratona maciza',cat:'estar',p:{L:120,D:60,H:38,mad:'madRust'},g:p=>[[R(-p.L/2,p.L/2,p.H-7,p.H,-p.D/2,p.D/2,1.5),p.mad],[B(-p.L/2+12,-p.L/2+24,0,p.H-7,-p.D/2+8,p.D/2-8),p.mad],[B(p.L/2-24,p.L/2-12,0,p.H-7,-p.D/2+8,p.D/2-8),p.mad]]},
  banco:{n:'Banco de madera maciza',cat:'estar',p:{L:180,D:38,H:45,mad:'roble'},g:p=>[[R(-p.L/2,p.L/2,p.H-6,p.H,-p.D/2,p.D/2,1),p.mad],[B(-p.L/2+14,-p.L/2+20,0,p.H-6,-p.D/2+4,p.D/2-4),p.mad],[B(p.L/2-20,p.L/2-14,0,p.H-6,-p.D/2+4,p.D/2-4),p.mad]]},
  alfombra:{n:'Alfombra de lana tejida',cat:'estar',p:{L:240,D:170},g:p=>[[R(-p.L/2,p.L/2,0,1,-p.D/2,p.D/2,.4),'alfombra']]},
  /* ---------- comedor ---------- */
  mesa:{n:'Mesa de madera maciza, patas cónicas',cat:'comedor',p:{L:180,D:90,H:76,mad:'madOsc'},g:p=>{const g=[[R(-p.L/2,p.L/2,p.H-5,p.H,-p.D/2,p.D/2,1),p.mad],[B(-p.L/2+12,p.L/2-12,p.H-12,p.H-5,-p.D/2+12,p.D/2-12),p.mad]];
    for(const sx of [-1,1])for(const sz of [-1,1])g.push([C(2.2,0,p.H-5,sx*(p.L/2-14),sz*(p.D/2-14),16,3.6),p.mad]);return g;}},
  mesaR:{n:'Mesa redonda de pie central',cat:'comedor',p:{L:120,H:76,mad:'madOsc'},g:p=>[[C(p.L/2,p.H-4,p.H,0,0,48),p.mad],[C(9,0,p.H-4,0,0,24,5),p.mad],[C(30,0,3,0,0,40,26),p.mad]]},
  silla:{n:'Silla de respaldo curvo, asiento de yute',cat:'comedor',p:{mad:'madOsc',tela:'yute'},g:p=>{const g=[[R(-22,22,43,47,-20,20,1.2),p.mad],[R(-20,20,47,49,-18,18,1),p.tela]];
    for(const sx of [-1,1])for(const sz of [-1,1])g.push([C(1.4,0,44,sx*18,sz*16,12,1.9),p.mad]);
    const arco=new THREE.TorusGeometry(21,1.6,8,28,Math.PI);arco.rotateX(Math.PI/2);arco.rotateY(Math.PI);arco.translate(0,73,-2);g.push([arco,p.mad]);for(const sx of [-1,1])g.push([C(1.3,47,73,sx*19,-11,10),p.mad]);return g;}},
  banqueta:{n:'Banqueta alta de madera y hierro',cat:'cocina',p:{H:75,mad:'roble'},g:p=>{const g=[[C(18,p.H-4,p.H,0,0,28),p.mad]];for(const [x,z] of [[1,1],[1,-1],[-1,1],[-1,-1]])g.push([VAR([x*11,0,z*11],[x*7,p.H-4,z*7],1.1),'negro']);
    const t=new THREE.TorusGeometry(10.5,.7,6,28);t.rotateX(Math.PI/2);t.translate(0,26,0);g.push([t,'negro']);return g;}},
  /* ---------- dormitorio ---------- */
  cama:{n:'Cama baja con cabecero tapizado',cat:'dormitorio',p:{L:160,D:200,tela:'lino',mad:'roble'},g:p=>{/* todo dentro de L × D (Maxi 15/10: chocaba con paredes y mesas de luz) */const x0=-p.L/2,x1=p.L/2,z0=-p.D/2,z1=p.D/2;
    const g=[[B(x0,x1,6,24,z0+8,z1),p.mad],[B(x0+6,x1-6,0,6,z0+18,z1-8),'negro'],[R(x0+4,x1-4,24,46,z0+10,z1-3,4),'sabana'],[R(x0+2,x1-2,40,49,z0+64,z1-1,3.5),p.tela==='lino'?'almohada':p.tela],[R(x0,x1,6,100,z0,z0+8,4),p.tela]];
    for(const x of p.L>=120?[-p.L/4,p.L/4]:[0])g.push(cojin(x-p.L/4+7,x+p.L/4-7,46,60,z0+14,z0+50,'almohada'));return g;}},
  cucheta:{n:'Cucheta de madera con escalera',cat:'dormitorio',p:{L:90,D:190,mad:'roble'},g:p=>{const g=[],H2=135;for(const sx of [-1,1])for(const sz of [-1,1])g.push([B(sx*(p.L/2)-(sx>0?5:0),sx*(p.L/2)+(sx<0?5:0),0,H2+40,sz*p.D/2-(sz>0?5:0),sz*p.D/2+(sz<0?5:0)),p.mad]);
    for(const y of [22,H2]){g.push([B(-p.L/2,p.L/2,y-6,y,-p.D/2,p.D/2),p.mad],[R(-p.L/2+3,p.L/2-3,y,y+18,-p.D/2+3,p.D/2-3,3),'sabana'],cojin(-p.L/2+8,p.L/2-8,y+18,y+30,-p.D/2+8,-p.D/2+40,'almohada'));}
    for(const y of [H2+20,H2+34])for(const sz of [-1,1])g.push([B(-p.L/2,p.L/2,y,y+5,sz*(p.D/2-2.5)-2.5,sz*(p.D/2-2.5)+2.5),p.mad]);
    for(const y of [35,65,95,125])g.push([B(p.L/2+1,p.L/2+4,y,y+3,p.D/2-50,p.D/2-12),p.mad]);g.push([B(p.L/2+1,p.L/2+4,0,H2+40,p.D/2-50,p.D/2-46),p.mad],[B(p.L/2+1,p.L/2+4,0,H2+40,p.D/2-16,p.D/2-12),p.mad]);return g;}},
  mesaLuz:{n:'Mesa de luz con cajón',cat:'dormitorio',p:{L:50,D:40,H:48,fr:'roble'},g:p=>[[R(-p.L/2,p.L/2,p.H-3,p.H,-p.D/2,p.D/2,.8),p.fr],[B(-p.L/2+1,p.L/2-1,22,p.H-3,-p.D/2+1,p.D/2-1),p.fr],ran(-p.L/2+2,p.L/2-2,p.H-14.2,p.H-13.8,p.D/2-1),
    ...[[-1,-1],[1,-1],[-1,1],[1,1]].map(([sx,sz])=>[C(1.2,0,22,sx*(p.L/2-4),sz*(p.D/2-4),10),'negro'])]},
  comoda:{n:'Cómoda de cajones sobre zócalo rehundido',cat:'dormitorio',p:{L:120,D:50,H:80,fr:'roble'},g:p=>[[B(-p.L/2+4,p.L/2-4,0,8,-p.D/2+4,p.D/2-6),'negro'],[R(-p.L/2,p.L/2,8,p.H,-p.D/2,p.D/2,.8),p.fr],...frente(p.L,p.D,8,p.H,{mods:2,filas:3})]},
  placard:{n:'Placard a medida, puertas lisas',cat:'dormitorio',p:{L:200,D:60,H:240,fr:'roble'},g:p=>[[B(-p.L/2+2,p.L/2-2,0,8,-p.D/2+2,p.D/2-5),'negro'],[B(-p.L/2,p.L/2,8,p.H,-p.D/2,p.D/2),p.fr],...frente(p.L,p.D,8,p.H,{mods:Math.max(2,Math.round(p.L/50)),tirador:'v'})]},
  /* ---------- trabajo y guardado ---------- */
  escritorio:{n:'Escritorio de tapa gruesa y patas panel',cat:'trabajo',p:{L:140,D:65,H:75,mad:'roble'},g:p=>[[R(-p.L/2,p.L/2,p.H-4,p.H,-p.D/2,p.D/2,.8),p.mad],[B(-p.L/2+3,-p.L/2+7,0,p.H-4,-p.D/2+3,p.D/2-3),p.mad],[B(p.L/2-7,p.L/2-3,0,p.H-4,-p.D/2+3,p.D/2-3),p.mad],
    [B(-p.L/2+7,p.L/2-7,p.H-14,p.H-4,-p.D/2+3,-p.D/2+5),p.mad],[B(p.L/2-47,p.L/2-7,p.H-15,p.H-4,-p.D/2+5,p.D/2-4),p.mad],tir(p.L/2-27,p.H-9.5,p.D/2-4,14)]},
  biblioteca:{n:'Biblioteca abierta de madera',cat:'trabajo',p:{L:160,D:32,H:200,mad:'roble'},g:p=>{const g=[[B(-p.L/2,-p.L/2+2.5,0,p.H,-p.D/2,p.D/2),p.mad],[B(p.L/2-2.5,p.L/2,0,p.H,-p.D/2,p.D/2),p.mad],[B(-p.L/2,p.L/2,0,6,-p.D/2,p.D/2-2),p.mad],[B(-p.L/2,p.L/2,p.H-2.5,p.H,-p.D/2,p.D/2),p.mad]];
    const nf=Math.max(1,Math.round((p.H-8)/36));for(let i=1;i<nf;i++){const y=6+(p.H-8)*i/nf;g.push([B(-p.L/2,p.L/2,y-1.25,y+1.25,-p.D/2,p.D/2),p.mad]);}
    const nc=Math.max(1,Math.round(p.L/80));for(let i=1;i<nc;i++){const x=-p.L/2+p.L*i/nc;g.push([B(x-1.25,x+1.25,6,p.H-2.5,-p.D/2,p.D/2),p.mad]);}g.push([B(-p.L/2,p.L/2,0,p.H,-p.D/2,-p.D/2+1),p.mad]);return g;}},
  aparador:{n:'Aparador bajo de listones sobre patas',cat:'comedor',p:{L:150,D:45,H:75,fr:'madOsc'},g:p=>{const g=[[R(-p.L/2,p.L/2,16,p.H,-p.D/2,p.D/2,.8),p.fr]];for(let x=-p.L/2+3;x<p.L/2-3;x+=4.5)g.push([B(x,x+.5,19,p.H-3,p.D/2-.1,p.D/2+.05),'junta']);
    g.push(ran(-.2,.2,19,p.H-3,p.D/2));for(const sx of [-1,1])for(const sz of [-1,1])g.push([C(1.3,0,16,sx*(p.L/2-8),sz*(p.D/2-7),10),'negro']);return g;}},
  /* ---------- cocina ---------- */
  mesada:{n:'Bajo mesada con zócalo rehundido',cat:'cocina',p:{L:240,D:62,H:90,fr:'madOsc',top:'granito'},g:p=>[[B(-p.L/2,p.L/2,0,10,-p.D/2,p.D/2-8),'negro'],[B(-p.L/2,p.L/2,10,p.H-3,-p.D/2,p.D/2-2),p.fr],[B(-p.L/2,p.L/2,p.H-3,p.H,-p.D/2,p.D/2+1),p.top],
    ...frente(p.L,p.D-2,10,p.H-3,{mods:Math.max(1,Math.round(p.L/60)),filas:2})]},
  isla:{n:'Isla con barra y laterales de piedra',cat:'cocina',p:{L:200,D:90,H:90,vol:30,fr:'madOsc',top:'granito'},g:p=>{const z0=-p.D/2+p.vol;return [[B(-p.L/2+4,p.L/2-4,0,10,z0,p.D/2-8),'negro'],[B(-p.L/2+4,p.L/2-4,10,p.H-4,z0,p.D/2-2),p.fr],
    [B(-p.L/2,p.L/2,p.H-4,p.H,-p.D/2,p.D/2),p.top],[B(-p.L/2,-p.L/2+4,0,p.H-4,-p.D/2,p.D/2),p.top],[B(p.L/2-4,p.L/2,0,p.H-4,-p.D/2,p.D/2),p.top],...frente(p.L-8,p.D-2,10,p.H-4,{mods:Math.max(1,Math.round((p.L-8)/60)),filas:2}).map(([g,m])=>[g.translate(0,0,0),m])];}},
  alacena:{n:'Alacena alta sin tiradores, con LED abajo',cat:'cocina',p:{L:120,D:35,H:70,fr:'madOsc'},z:150,g:p=>[[B(-p.L/2,p.L/2,0,p.H,-p.D/2,p.D/2-1),p.fr],...frente(p.L,p.D-1,0,p.H,{mods:Math.max(1,Math.round(p.L/60))}).filter(([,m])=>m!=='negro'),[B(-p.L/2+2,p.L/2-2,-.5,0,-p.D/2+4,p.D/2-6),'ledCalido']]},
  columna:{n:'Columna con horno empotrado',cat:'cocina',p:{L:60,D:60,H:220,fr:'madOsc'},g:p=>[[B(-p.L/2,p.L/2,0,10,-p.D/2,p.D/2-8),'negro'],[B(-p.L/2,p.L/2,10,p.H,-p.D/2,p.D/2-2),p.fr],[B(-p.L/2+3,p.L/2-3,80,140,p.D/2-2,p.D/2-.5),'negro'],[B(-p.L/2+6,p.L/2-6,90,128,p.D/2-.5,p.D/2),'vidrioN'],tir(0,134,p.D/2-.5,40),ran(-p.L/2+1,p.L/2-1,79.8,80.2,p.D/2-2),ran(-p.L/2+1,p.L/2-1,140,140.4,p.D/2-2)]},
  heladera:{n:'Heladera con freezer abajo',cat:'cocina',p:{L:70,D:70,H:190,col:'acero'},g:p=>[[R(-p.L/2,p.L/2,2,p.H,-p.D/2,p.D/2,2.5),p.col],ran(-p.L/2+1,p.L/2-1,72,72.4,p.D/2),[B(p.L/2-6,p.L/2-4.5,85,140,p.D/2,p.D/2+3),'negro'],[B(p.L/2-6,p.L/2-4.5,40,66,p.D/2,p.D/2+3),'negro'],[B(-p.L/2+3,p.L/2-3,0,2,-p.D/2+3,p.D/2-3),'negro']]},
  bacha:{n:'Bacha bajo mesada con grifería negra',cat:'cocina',p:{L:80},z:90,g:p=>[[B(-p.L/2+6,p.L/2-6,-18,-17,-18,18),'acero'],[B(-p.L/2+6,p.L/2-6,-18,0,-18.5,-18),'acero'],[C(2,0,28,0,-24,14),'grifo'],[VAR([0,28,-24],[0,30,-8],1.1),'grifo'],[C(1.2,22,30,0,-8,10),'grifo']]},
  anafe:{n:'Anafe vitrocerámico',cat:'cocina',p:{L:60,D:52},z:90,g:p=>{const g=[[R(-p.L/2,p.L/2,0,.7,-p.D/2,p.D/2,.3),'vidrioN']];for(const [x,z,r] of [[-p.L/4,-p.D/4,9],[p.L/4,-p.D/4,7],[-p.L/4,p.D/4,7],[p.L/4,p.D/4,9]]){const t=new THREE.TorusGeometry(r,.3,6,32);t.rotateX(Math.PI/2);t.translate(x,.75,z);g.push([t,'grafito']);}return g;}},
  campana:{n:'Campana de pared negra',cat:'cocina',p:{L:60,D:50,H:100},z:155,g:p=>[[R(-p.L/2,p.L/2,0,5,-p.D/2,p.D/2,1),'negro'],[B(-12,12,5,p.H,-p.D/2,-p.D/2+22),'negro']]},
  /* ---------- baño ---------- */
  vanitorio:{n:'Vanitorio de madera flotante con bacha de apoyo',cat:'baño',p:{L:110,D:50,H:85,fr:'madRust',n:1,tapa:'pizarra',bachaM:'piedra'},g:p=>{const z0=p.H-45,z1=p.H-3,g=[[B(-p.L/2,p.L/2,z0,z1,-p.D/2,p.D/2-1),p.fr],[R(-p.L/2,p.L/2,z1,p.H,-p.D/2,p.D/2+1,.6),p.tapa],[B(-p.L/2+3,p.L/2-3,z0-.5,z0,-p.D/2+4,p.D/2-6),'ledCalido'],ran(-p.L/2+2,p.L/2-2,(z0+z1)/2-.2,(z0+z1)/2+.2,p.D/2-1)];
    const xs=+p.n>1?[-p.L/4,p.L/4]:[0];for(const x of xs){const s=new THREE.SphereGeometry(20,28,12,0,Math.PI*2,Math.PI/2,Math.PI/2);s.scale(1,.6,1);s.translate(x,p.H+12,2);g.push([s,p.bachaM],[C(16,p.H+11.4,p.H+12,x,2,28),'loza']);
      g.push([B(x-1,x+1,p.H+26,p.H+28,-p.D/2,-p.D/2+16),'grifo'],[C(3,p.H+24.5,p.H+29.5,x,-p.D/2+3,16),'grifo'],[B(x-30,x+30,p.H+42,p.H+122,-p.D/2,-p.D/2+2),'negro'],[B(x-28,x+28,p.H+44,p.H+120,-p.D/2+2,-p.D/2+2.5),'espejo']);}return g;}},
  inodoro:{n:'Inodoro suspendido',cat:'baño',p:{},g:()=>{const s=new THREE.SphereGeometry(19,28,16);s.scale(1,.55,1.4);s.translate(0,30,4);return [[s,'loza'],[R(-18,18,38,41,-24,28,1.5),'loza'],[B(-20,20,20,80,-30,-24),'loza'],[B(-9,9,92,93,-29,-28),'grifo']];}},
  bidet:{n:'Bidet suspendido',cat:'baño',p:{},g:()=>{const s=new THREE.SphereGeometry(18,28,16);s.scale(1,.6,1.35);s.translate(0,30,4);return [[s,'loza'],[B(-18,18,22,40,-30,-24),'loza'],[C(1.5,40,46,0,-14,10),'grifo']];}},
  banera:{n:'Bañera exenta ovalada',cat:'baño',p:{L:160,D:75},g:p=>{const pts=[];for(let i=0;i<=12;i++){const t=i/12;pts.push(new THREE.Vector2(.92+.08*Math.sin(t*Math.PI/2),58*t));}const o=new THREE.LatheGeometry([new THREE.Vector2(0,0),new THREE.Vector2(.8,0),...pts,new THREE.Vector2(.9,58),new THREE.Vector2(.86,58)],40);
    const Lb=p.L-24;o.scale(Lb/2,1,p.D/2);o.translate(-12,0,0);const inn=new THREE.SphereGeometry(1,32,12,0,Math.PI*2,Math.PI/2,Math.PI/2);inn.scale(Lb/2-6,40,p.D/2-6);inn.translate(-12,57.5,0);return [[o,'loza'],[inn,'blanco'],[C(1.4,0,95,p.L/2-4,0,10),'grifo'],[VAR([p.L/2-4,95,0],[p.L/2-18,92,0],1.2),'grifo']];/* grifería exenta dentro del largo L */}},
  /* ---------- baño a medida (Maxi 31/10: «más detalle»; la ducha cuelga del set de pared, la mampara es fija con perfil y canal) ---------- */
  duchaPiso:{n:'Piso de ducha sin plato con rejilla lineal',cat:'baño',p:{L:100,D:110,rej:'izq'},g:p=>{/* piedra oscura al ras con 1 % hacia la rejilla; rejilla de acero de 6 a lo largo del lado de la pared (izq = −x) */
    const s=p.rej==='der'?1:-1,xr=s*(p.L/2-7);return [[B(-p.L/2,p.L/2,0,.8,-p.D/2,p.D/2),'pizarra'],[B(xr-3,xr+3,.8,1,-p.D/2+4,p.D/2-4),'acero'],[B(xr-2.2,xr+2.2,1,1.05,-p.D/2+5,p.D/2-5),'negro']];}},
  mampara:{n:'Mampara fija de vidrio templado 10 mm',cat:'baño',p:{L:110,H:200,perfil:'izq'},g:(p0,ctx)=>{/* vidrio de 10 en canal de piso (U de 2 × 2,4) y perfil de pared; baja si el cielorraso no da */
    const tm=ctx&&ctx.techoMin?ctx.techoMin(p0.L/2):999,H=Math.min(p0.H,tm-5),g=[[B(-p0.L/2,p0.L/2,1.5,H,-.5,.5),'vidrio'],[B(-p0.L/2,p0.L/2,0,2,-1.2,1.2),'negro']];
    if(p0.perfil==='izq'||p0.perfil==='ambos')g.push([B(-p0.L/2,-p0.L/2+2,0,H,-1.2,1.2),'negro']);if(p0.perfil==='der'||p0.perfil==='ambos')g.push([B(p0.L/2-2,p0.L/2,0,H,-1.2,1.2),'negro']);return g;}},
  baneraEmp:{n:'Bañera empotrada con faldón y grifería de pared',cat:'baño',p:{L:160,D:75,H:56},g:p=>{/* cáscara de 7 de borde, fondo a 18; faldón revestido al frente (+z); pico y monocomando en la pared del extremo +x */
    const t=7,g=[[B(-p.L/2,p.L/2,0,p.H-4,p.D/2-2,p.D/2),'blanco'],[B(-p.L/2,p.L/2,p.H-4,p.H,-p.D/2,p.D/2),'loza'],[B(-p.L/2+t,p.L/2-t,p.H-4.2,p.H+.05,-p.D/2+t,p.D/2-t),'blanco'],
      [B(-p.L/2+t,p.L/2-t,0,18,-p.D/2+t,p.D/2-t),'loza'],[B(-p.L/2+t+8,p.L/2-t-8,18,18.3,-p.D/2+t+6,p.D/2-t-6),'blanco'],
      [VAR([p.L/2,p.H+18,0],[p.L/2-17,p.H+16,0],1.3),'grifo'],[(()=>{const md=new THREE.CylinderGeometry(3.5,3.5,1.5,20);md.rotateZ(Math.PI/2);md.translate(p.L/2-.75,p.H+29,0);return md;})(),'grifo'],[B(p.L/2-6,p.L/2-1,p.H+27,p.H+31,-1,1),'grifo']];
    return g;}},
  toallero:{n:'Toallero escalera calefactor negro',cat:'baño',p:{L:50,D:8,H:110},z:35,g:p=>{const g=[];for(const s of [-1,1]){g.push([C(1.5,0,p.H,s*(p.L/2-1.5),0,12),'negro']);for(const y of [12,p.H-12])g.push([VAR([s*(p.L/2-1.5),y,0],[s*(p.L/2-1.5),y,-p.D/2],.8),'negro']);}
    for(let y=6;y<p.H-3;y+=11)g.push([VAR([-p.L/2+1.5,y,1],[p.L/2-1.5,y,1],1.1),'negro']);return g;}},
  espejo:{n:'Espejo con marco fino negro',cat:'baño',p:{L:80,D:3,H:90},z:105,g:p=>[[B(-p.L/2,p.L/2,0,p.H,-p.D/2,p.D/2-1),'negro'],[B(-p.L/2+1.5,p.L/2-1.5,1.5,p.H-1.5,p.D/2-1,p.D/2-.6),'espejo']]},
  /* ---------- exterior ---------- */
  reposera:{n:'Reposera de listones con colchoneta de lino',cat:'exterior',p:{L:65,D:190,mad:'madRust',tela:'lino'},g:q=>{/* L = ancho, D = largo; respaldo hacia −z */const p={...q,L:q.D,D:q.L},g=[];for(const sz of [-1,1])g.push([B(-p.L/2,p.L/2,10,16,sz*(p.D/2-3)-3,sz*(p.D/2-3)+3),p.mad]);
    for(const [x,z] of [[-1,-1],[-1,1],[1,-1],[1,1]])g.push([B(x*(p.L/2-6)-3,x*(p.L/2-6)+3,0,12,z*(p.D/2-3)-3,z*(p.D/2-3)+3),p.mad]);
    for(let x=-p.L/2+50;x<p.L/2-6;x+=9)g.push([B(x,x+6,16,18,-p.D/2+6,p.D/2-6),p.mad]);
    const a=.6,x0=-p.L/2+50,ca=Math.cos(a),sa=Math.sin(a);const resp=R(-31,31,-2,2,-p.D/2+6,p.D/2-6,1);resp.rotateZ(-a);resp.translate(x0-ca*31,18+sa*31,0);
    const c2=R(-30,30,-3,3,-p.D/2+7,p.D/2-7,2.5);c2.rotateZ(-a);c2.translate(x0-ca*31+sa*5,18+sa*31+ca*5,0);g.push([resp,p.mad],cojin(-p.L/2+52,p.L/2-4,18,24,-p.D/2+7,p.D/2-7,p.tela),[c2,p.tela]);for(const [geo] of g)geo.rotateY(-Math.PI/2);return g;}},
  /* ---------- piezas de las referencias de Maxi (14/10) y especiales, traídas de equipamiento.js ---------- */
    desayunador:{n:'Desayunador (barra en voladizo de la mesada)',p:{L:150,D:50,H:90,top:'granito',mad:'roble'},
      g:p=>[[B(-p.L/2,p.L/2,p.H-4,p.H,-p.D/2,p.D/2),p.top],[B(p.L/2-6,p.L/2-2,0,p.H-4,-p.D/2+4,p.D/2-4),p.mad],[B(p.L/2-30,p.L/2-6,2,4,-p.D/2+8,p.D/2-8),p.mad]]},/* tapa como la mesada, una pata panel en la punta y apoyapiés */
    ducha:{n:'Ducha (plato y mampara)',p:{L:80,D:120,H:200},g:(p0,ctx)=>{/* bajo techo en pendiente, mampara y lluvia bajan hasta 3 cm del cielorraso más bajo */const tm=ctx&&ctx.techoMin?ctx.techoMin(Math.max(p0.L,p0.D)/2):999;const p={...p0,H:Math.min(p0.H,tm-14)};return [[B(-p.L/2,p.L/2,0,4,-p.D/2,p.D/2),'loza'],[B(-p.L/2,-p.L/2+.8,4,p.H,-p.D/2,p.D/2),'vidrio'],[B(-p.L/2,p.L/2*.2,4,p.H,p.D/2-.8,p.D/2),'vidrio'],[CYL(12,p.H+2,p.H+3,0,0,24),'grifo'],[CYL(.9,p.H+3,p.H+10,0,0,8),'grifo'],[B(0,p.L/2-2,p.H+9,p.H+11,-.9,.9),'grifo'],[CYL(.9,110,p.H+11,p.L/2-2,0,8),'grifo']];}},/* lluvia con brazo a la pared (antes subía 40 al techo y bajo la lucarna lo atravesaba) */
    /* ---- catálogo de las referencias de Maxi (14/10): estilo cálido y bajo, madera maciza, lino, piedra oscura ---- */
    sofaPlat:{n:'Sofá bajo sobre plataforma de madera',p:{L:280,D:100,esq:0,Le:200,tela:'lino',mad:'roble'},
      g:p=>{/* tarima de madera maciza que sobresale 12 alrededor; almohadones de asiento y de respaldo sueltos; esq=1 arma la L hacia −x */const g=[],R=12,H0=18;
        const tramo=(x0,x1,z0,z1,dirZ)=>{g.push([B(x0-R,x1+R,0,H0,z0-R,z1+R),p.mad]);const n=Math.max(1,Math.round((x1-x0)/90));for(let i=0;i<n;i++){const a=x0+(x1-x0)*i/n,b=x0+(x1-x0)*(i+1)/n;g.push([B(a+.6,b-.6,H0,H0+20,z0+1,z1-1),p.tela],[B(a+1.5,b-1.5,H0+20,H0+62,dirZ<0?z0:z1-24,dirZ<0?z0+24:z1),p.tela]);}};
        tramo(-p.L/2,p.L/2,-p.D/2,p.D/2,-1);if(+p.esq){const x0=-p.L/2,x1=-p.L/2+p.D;g.push([B(x0-R,x1+R,0,H0,p.D/2,p.D/2+p.Le-p.D+R),p.mad]);const n=Math.max(1,Math.round((p.Le-p.D)/90));for(let i=0;i<n;i++){const a=p.D/2+(p.Le-p.D)*i/n,b=p.D/2+(p.Le-p.D)*(i+1)/n;g.push([B(x0+1,x1-1,H0,H0+20,a+.6,b-.6),p.tela],[B(x0,x0+24,H0+20,H0+62,a+1.5,b-1.5),p.tela]);}}
        for(const x of [-p.L/2+40,p.L/2-40])g.push([B(x-22,x+22,H0+20,H0+58,-p.D/2+18,-p.D/2+30),'almohada']);return g;}},
    sofaMod:{n:'Sofá modular de lino (bloques)',p:{n:3,mod:95,D:105,tela:'lino'},
      g:p=>{const g=[],L=p.n*p.mod;for(let i=0;i<p.n;i++){const x0=-L/2+i*p.mod;g.push([B(x0+.5,x0+p.mod-.5,4,44,-p.D/2+24,p.D/2),p.tela],[B(x0+.5,x0+p.mod-.5,4,78,-p.D/2,-p.D/2+24),p.tela]);}
        g.push([B(-L/2-26,-L/2,4,64,-p.D/2,p.D/2),p.tela],[B(L/2,L/2+26,4,64,-p.D/2,p.D/2),p.tela],[B(-L/2-26,L/2+26,0,4,-p.D/2+4,p.D/2-4),'madOsc']);return g;}},
    ratonaTab:{n:'Mesa ratona de tablones',p:{L:160,D:90,H:38,mad:'madRust'},
      g:p=>{const g=[],n=3,w=(p.D-2*(n-1))/n;for(let i=0;i<n;i++){const z0=-p.D/2+i*(w+2);g.push([B(-p.L/2,p.L/2,p.H-9,p.H,z0,z0+w),p.mad]);}for(const x of [-p.L/2+25,p.L/2-25])g.push([B(x-9,x+9,0,p.H-9,-p.D/2+12,p.D/2-12),p.mad]);return g;}},
    ratonaBaja:{n:'Mesa ratona redonda baja',p:{L:110,H:30,mad:'roble'},g:p=>[[CYL(p.L/2,p.H-5,p.H,0,0,48),p.mad],[CYL(p.L/2-22,0,p.H-5,0,0,40),p.mad]]},
    camaPlat:{n:'Cama baja sobre tarima con cabecero de listones',p:{L:180,D:205,ala:35,mad:'roble',tela:'sabana'},
      g:p=>{const g=[],H0=16,W=p.L+2*p.ala;g.push([B(-W/2,W/2,0,H0,-p.D/2,p.D/2+p.ala),p.mad],[B(-p.L/2,p.L/2,H0,H0+22,-p.D/2+4,p.D/2),'sabana'],[B(-p.L/2-1,p.L/2+1,H0+18,H0+26,-p.D/2+60,p.D/2+1),p.tela]);
        for(const x of p.L>=120?[-p.L/4,p.L/4]:[0])g.push([B(x-p.L/4+6,x+p.L/4-6,H0+22,H0+36,-p.D/2+8,-p.D/2+45),'almohada']);
        for(let x=-W/2;x<=W/2-4;x+=9)g.push([B(x,x+4,0,150,-p.D/2-6,-p.D/2-2),p.mad]);g.push([B(-W/2,W/2,0,150,-p.D/2-9,-p.D/2-6),'madOsc']);return g;}},
    mesaMaciza:{n:'Mesa maciza de tapa gruesa',p:{L:240,D:95,H:76,mad:'madOsc'},
      g:p=>[[B(-p.L/2,p.L/2,p.H-8,p.H,-p.D/2,p.D/2),p.mad],[B(-p.L/2+28,-p.L/2+38,0,p.H-8,-p.D/2+14,p.D/2-14),p.mad],[B(p.L/2-38,p.L/2-28,0,p.H-8,-p.D/2+14,p.D/2-14),p.mad]]},
    sillaCurva:{n:'Silla de respaldo curvo',p:{mad:'madOsc',tela:'lino'},
      g:p=>{const g=[[B(-22,22,42,46,-20,20),p.mad],[B(-20,20,46,48,-18,18),p.tela]];for(const sx of [-1,1])for(const sz of [-1,1])g.push([CYL(1.6,0,44,sx*18,sz*16,10),p.mad]);
        const arco=new THREE.TorusGeometry(22,1.8,8,24,Math.PI);arco.rotateX(Math.PI/2);arco.rotateY(Math.PI);arco.translate(0,74,0);/* el respaldo abraza: medio aro horizontal a 74 */g.push([arco,p.mad]);
        for(const sx of [-1,1])g.push([CYL(1.4,46,74,sx*19,-11,8),p.mad]);return g;}},
    vanitorioMad:{n:'Vanitorio de madera flotante con bacha de apoyo',p:{L:160,D:50,n:2,mad:'madRust',tapa:'pizarra',bacha:'negro'},
      g:p=>{const z0=40,z1=82,g=[[B(-p.L/2,p.L/2,z0,z1-4,-p.D/2,p.D/2-1),p.mad],[B(-p.L/2,p.L/2,z1-4,z1,-p.D/2,p.D/2+1),p.tapa],[B(-p.L/2+2,p.L/2-2,z0-.6,z0,-p.D/2+4,p.D/2-6),'ledCalido']];
        for(const zz of [z0+19])g.push([B(-p.L/2+2,p.L/2-2,zz-.4,zz+.4,p.D/2-1,p.D/2-.6),'junta']);for(const x of p.n>1?[-p.L/4,p.L/4]:[0]){g.push([B(x-.4,x+.4,z0+2,z1-6,p.D/2-1,p.D/2-.6),'junta']);
          const s=new THREE.SphereGeometry(21,28,12,0,Math.PI*2,Math.PI/2,Math.PI/2);s.scale(1,.55,1);s.translate(x,z1+11.5,2);g.push([s,p.bacha],[CYL(17,z1+11,z1+11.6,x,2,28),'loza']);
          g.push([B(x-1.1,x+1.1,z1+26,z1+28.2,-p.D/2,-p.D/2+15),'negro'],[CYL(3,z1+25,z1+29,x,-p.D/2+.5,16).rotateX(0),'negro'],/* grifería de pared negra */[B(x-30,x+30,z1+42,z1+122,-p.D/2-.5,-p.D/2+1),'negro'],[B(x-28,x+28,z1+44,z1+120,-p.D/2+1,-p.D/2+1.6),'espejo']);}return g;}},
    taburete:{n:'Taburete tronco',p:{H:45,mad:'madRust'},g:p=>[[CYL(18,0,p.H,0,0,20),p.mad]]},
    alfombraYute:{n:'Alfombra de yute',p:{L:240,D:170},g:p=>[[B(-p.L/2,p.L/2,0,.8,-p.D/2,p.D/2),'yute']]},
  };
  const FAM={desayunador:'cocina',ducha:'baño',sofaPlat:'estar',sofaMod:'estar',ratonaTab:'estar',ratonaBaja:'estar',camaPlat:'dormitorio',mesaMaciza:'comedor',sillaCurva:'comedor',vanitorioMad:'baño',taburete:'estar',alfombraYute:'estar'};
  for(const [k,v] of Object.entries(P))if(!v.cat)v.cat=FAM[k]||'otros';
  return P;
}
