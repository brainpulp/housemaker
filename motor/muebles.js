/* Catálogo de muebles de housemaker (Maxi 15/10): modelos según sus referencias de interiores (docs/ESTILO.md):
   bajos, madera maciza, lino, piedra oscura, negro mate, cantos redondeados en lo tapizado, zócalos rehundidos y tiradores finos.
   Reutilizable en cualquier casa y en la página de catálogo. Cada pieza: {n, cat (familia), p (parámetros por defecto, cm), g(p,ctx) → [[geometría, material]]}.
   Coordenadas locales: origen en el piso, al centro de la planta; x = largo (L), z = fondo (D) con el frente hacia +z, y = altura. */
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { armar as armarOctet } from './octet.js';
import { MODELOS as OCTET } from './octet-modelos.js';

/* materiales que usan las piezas (el visor los crea con MeshStandardMaterial) */
export const MATERIALES={roble:['#b98a5a',.7],madOsc:['#6e4a2e',.7],madRust:['#8a6142',.85],petiribi:['#b98654',.7],suela:['#9a5a2b',.6],madClara:['#c79f72',.7],lino:['#c9c1b3',.95],tela:['#8a8f96',.95],
  mostaza:['#b88a3a',.95],petroleo:['#3e5a63',.95],sabana:['#efece6',.95],almohada:['#f6f3ee',.95],yute:['#b39a6c',1],negro:['#161718',.35],grafito:['#3b3e40',.55],
  piedra:['#d9d4cb',.35],granito:['#2f2f30',.3],pizarra:['#2c2f31',.75],loza:['#f4f3f0',.25],blanco:['#ece9e2',.5],verde:['#5f7a5a',.6],rojo:['#b3342b',.4],acero:['#d8dbde',.28,.45]/* Maxi 5/11: menos metálico, para que se lea como inox también sin el cielo de la luz realista */,
  junta:['#2a2622',.9],espejo:['#dfe6ea',.04,1],grifo:['#2a2b2d',.3,.6],alfombra:['#b9ad98',1],vidrioN:['#101214',.08,.2],aluminio:['#d3d6d9',.38,.25],aluFund:['#a9acaf',.6,.2],gomaN:['#1b1c1d',.9],cantoVidrio:['#8fb3a6',.15],ledCalido:['#f3d9a8',.7,0,'#ffb85a'],marfil:['#ebe2cf',.32]/* Maxi 8/11: loza color marfil (bacha farm) */,hierroN:['#1f2022',.8,.15]/* parrillas de los quemadores */};
/* [color, rugosidad, metal, emisivo] */

/* Paleta para elegir materiales en la ficha de cada mueble (Maxi 5/11): clave del material → etiqueta. Las claves de parámetro que son material: fr (frentes), top/top2 (tapa), mad (madera), mat (material), col (color de electrodoméstico), pint (pintura). */
export const PALETA={acero:'inox',granito:'piedra negra',pizarra:'pizarra',loza:'loza blanca',roble:'roble',madClara:'madera clara',petiribi:'petiribí',suela:'cuero suela',madOsc:'madera oscura',nogal:'nogal oscuro',madRust:'ibirapitá',negro:'negro mate',grafito:'grafito',blanco:'blanco',verde:'verde',rojo:'rojo'};
export const PARAM_MAT={fr:'frentes',top:'tapa',top2:'tapa 2',mad:'madera',mat:'material',col:'color',pint:'pintura'};
/* pinturas para sillas y piezas pintadas (Maxi 5/11: «las sillas hacelas pintadas»): nombre → color; 'natural' deja el material del modelo */
export const PINTURAS={natural:null,negro:'#1f1f20',blanco:'#e9e6df',rojo:'#9b3a2a',verde:'#5d6b3f',azul:'#2f4a5c',mostaza:'#c99a3a',terracota:'#b5633f',gris:'#8a8d8f'};
/* Maderas con veta (Maxi 4/11: «mejorá mucho las texturas de las maderas»). Texturas procedurales en canvas, sin imágenes externas:
   anillos finos de madera tardía deformados con ruido, poro fino a lo largo, variación de tabla; el mismo cálculo da el mapa de rugosidad.
   Paño de 160 × 80 cm; las UV se proyectan por caja en coordenadas locales de la pieza (uvMadera), así la veta corre a lo largo (x) de cada pieza
   cualquiera sea su tamaño o giro. [madera temprana, madera tardía, anillos por paño, contraste] */
export const MADERAS={roble:['#c9a06c','#8a6137',30,.5],madClara:['#d8b58a','#a8824f',26,.4],madOsc:['#7e5637','#5a3b26',32,.42]/* Maxi 5/11: mismo tono, la veta oscura más clara y menos contraste */,madRust:['#ad7349','#643820',28,.65],
  /* Maxi 7/11: petiribí (fondo dorado grisáceo con vetas negras irregulares; el quinto valor es la fuerza de esas rayas) y nogal oscuro para la tapa de la isla */
  petiribi:['#ab8459','#6a4628',44,.38,1,.25],nogal:['#5e3a22','#3a2314',26,.5,.35,.6]};
const _texMad={};
export function texturaMadera(THREE,k){if(_texMad[k])return _texMad[k];const d=MADERAS[k];if(!d)return null;const W=1024,H=512;
  const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');const img=x.createImageData(W,H),px=img.data;
  const cr=document.createElement('canvas');cr.width=W;cr.height=H;const xr=cr.getContext('2d');const imr=xr.createImageData(W,H),pr=imr.data;
  /* ruido de valor periódico (tabla de permutación de 256) */
  const perm=new Uint8Array(512);let s=97+k.length*131;for(let i=0;i<256;i++)perm[i]=i;for(let i=255;i>0;i--){s=(s*16807)%2147483647;const j=s%(i+1);const t=perm[i];perm[i]=perm[j];perm[j]=t;}for(let i=0;i<256;i++)perm[256+i]=perm[i];
  const hash=(i,j)=>perm[(perm[i&255]+j)&255]/255,sm=t=>t*t*(3-2*t);
  const noise=(u,v)=>{const i=Math.floor(u),j=Math.floor(v),fu=sm(u-i),fv=sm(v-j),a=hash(i,j),b=hash(i+1,j),c2=hash(i,j+1),d2=hash(i+1,j+1);return a+(b-a)*fu+(c2-a)*fv+(a-b-c2+d2)*fu*fv;};
  const fbm=(u,v,o)=>{let r=0,a=.5,n=0;for(let i=0;i<o;i++){r+=a*noise(u,v);n+=a;u*=2;v*=2;a*=.5;}return r/n;};
  const col=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];const E=col(d[0]),Lc=col(d[1]),R=d[2],con=d[3];
  for(let j=0;j<H;j++)for(let i=0;i<W;i++){const u=i/W,v=j/H;
    const w=(fbm(u*2,v*9,3)-.5)*.9+(fbm(u*7+7,v*22+3,2)-.5)*.2;/* ondulación: el espaciado entre anillos varía */
    const arc=(1-Math.cos(2*Math.PI*(u+(fbm(v*3+9,u*2,2)-.5)*.3)))*1.6*(d[5]??1);/* el sexto valor baja los arcos de catedral: veta más recta */const ring=v*R+w*R*.22+arc,f=ring-Math.floor(ring);/* todo periódico en el paño: frecuencias enteras, para que no se vea el empalme *//* anillos a lo largo, con arcos de catedral (tabla cortada plana) */
    const late=Math.pow(Math.max(0,1-Math.abs(f-.8)*5.5),1.3)*(.45+fbm(u*24+5,v*48,2)*1.1);/* línea fina de madera tardía, que se afina y se corta */
    const poro=(fbm(u*140,v*6+11,2)-.5);/* poro fino, estirado a lo largo */
    const tabla=(fbm(u*2+3,v*2+5,2)-.5);/* variación lenta de color */
    const t=Math.min(1,Math.max(0,(.22*f+late)*con+tabla*.25));
    /* rayas oscuras irregulares (petiribí, nogal): bandas que siguen la veta, aparecen y se cortan */
    const raya=d[4]?Math.pow(Math.max(0,fbm(u*3+13,v*46+2,3)-.56)*3.2,1.4)*Math.min(1,Math.max(0,fbm(u*5+21,v*3,2)*2.2-.6))*d[4]:0;
    const o=(j*W+i)*4;for(let q=0;q<3;q++){const e=E[q]*(1+tabla*.12);const base=e+(Lc[q]-e)*t+poro*26;px[o+q]=Math.max(0,Math.min(255,base*(1-Math.min(.85,raya))));}px[o+3]=255;
    const rg=Math.round(165+late*con*60+poro*70);pr[o]=pr[o+1]=pr[o+2]=Math.max(0,Math.min(255,rg));pr[o+3]=255;}
  x.putImageData(img,0,0);xr.putImageData(imr,0,0);
  const mk=(cv,srgb)=>{const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;};
  return _texMad[k]={map:mk(c,true),rough:mk(cr,false),pano:[160,80]};}
/* material de madera con veta (cacheado por THREE: una instancia por página) */
const _matMad=new WeakMap();
export function materialMadera(THREE,k){let m=_matMad.get(THREE);if(!m)_matMad.set(THREE,m={});if(m[k])return m[k];const t=texturaMadera(THREE,k);if(!t)return null;
  return m[k]=new THREE.MeshStandardMaterial({color:'#ffffff',map:t.map,roughnessMap:t.rough,roughness:1,metalness:0});}
/* UV por proyección de caja en coordenadas locales (cm): la veta corre a lo largo de x; en las caras de testa (normal x), a lo largo de z */
export function uvMadera(THREE,geo,pano=[160,80]){const P=geo.attributes.position,N=geo.attributes.normal;if(!P||!N||geo.userData.uvMad)return geo;const uv=new Float32Array(P.count*2);
    /* Maxi 5/11: la veta va siempre horizontal en las caras verticales (frentes, laterales, patas), también en las piezas altas */
  for(let i=0;i<P.count;i++){const nx=Math.abs(N.getX(i)),ny=Math.abs(N.getY(i)),nz=Math.abs(N.getZ(i)),x=P.getX(i),y=P.getY(i),z=P.getZ(i);let u,v;
    if(ny>=nx&&ny>=nz){u=x;v=z;}else if(nz>=nx){u=x;v=y;}else{u=z;v=y;}uv[i*2]=u/pano[0];uv[i*2+1]=v/pano[1];}
  geo.setAttribute('uv',new THREE.BufferAttribute(uv,2));geo.userData.uvMad=true;return geo;}

export function catalogoMuebles(THREE){
  const B=(x0,x1,y0,y1,z0,z1)=>{const g=new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0);g.translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);return g;};
  const R=(x0,x1,y0,y1,z0,z1,r=3)=>{const w=x1-x0,h=y1-y0,d=z1-z0;const g=new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/2-.01,h/2-.01,d/2-.01));g.translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);return g;};
  const C=(r,y0,y1,x=0,z=0,s=20,r2)=>{const g=new THREE.CylinderGeometry(r2??r,r,y1-y0,s);g.translate(x,(y0+y1)/2,z);return g;};
  const VAR=(a,b,r,s=8)=>{/* varilla entre dos puntos */const A=new THREE.Vector3(...a),Bv=new THREE.Vector3(...b),d=Bv.clone().sub(A);const g=new THREE.CylinderGeometry(r,r,d.length(),s);g.translate(0,d.length()/2,0);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()));g.translate(...a);return g;};
  /* ranura de 4 mm (puertas y cajones) y tirador fino negro */
  const ran=(x0,x1,y0,y1,z)=>[B(x0,x1,y0,y1,z-.1,z+.05),'junta'];
  const tir=(x,y,z,l=16,vert=false)=>[vert?B(x-.6,x+.6,y-l/2,y+l/2,z,z+1.6):B(x-l/2,x+l/2,y-.6,y+.6,z,z+1.6),'negro'];
  /* tapa de mesada de 3 con huecos que llegan al frente (bacha farm): huecos = [[x centro, ancho, fondo desde el frente]] en cm del mueble */
  const tapaHuecos=(L,D,H,hs,m)=>{const z1=D/2+1;if(!hs||!hs.length)return [[B(-L/2,L/2,H-3,H,-D/2,z1),m]];const g=[],o=[...hs].sort((a,b)=>a[0]-b[0]);let x=-L/2;
    for(const [c,w,d] of o){const a=Math.max(-L/2,c-w/2),b=Math.min(L/2,c+w/2);if(a>x)g.push([B(x,a,H-3,H,-D/2,z1),m]);if(z1-d>-D/2)g.push([B(a,b,H-3,H,-D/2,z1-d),m]);x=b;}
    if(x<L/2)g.push([B(x,L/2,H-3,H,-D/2,z1),m]);return g;};
  /* frente de cajonera/puertas: n módulos, filas de cajones, zócalo rehundido */
  function frente(L,D,y0,y1,{mods=1,filas=1,tirador='h'}={}){const g=[],z=D/2;for(let i=1;i<mods;i++){const x=-L/2+L*i/mods;g.push(ran(x-.2,x+.2,y0,y1,z));}
    for(let j=1;j<filas;j++){const y=filaY(y0,y1,filas,j)[0];g.push(ran(-L/2+.5,L/2-.5,y-.2,y+.2,z));}
    for(let i=0;i<mods;i++)for(let j=0;j<filas;j++){const xc=-L/2+L*(i+.5)/mods,yt=filaY(y0,y1,filas,j)[1];g.push(tirador==='v'?tir(xc+(L/mods)/2-6,(y0+y1)/2,z,24,true):tir(xc,yt-4,z,Math.min(24,L/mods*.5)));}return g;}
  /* ---------- frentes que se abren, con sus herrajes (Maxi 4/11) ----------
     Una geometría puede llevar un tercer elemento {mov:{id,tipo:'desl'|'giro',eje:[x,y,z],max,pivot:[x,y,z]}}: el visor agrupa las piezas con el mismo id
     y, al tocarlas, las desliza (max en cm) o las gira (max en radianes) alrededor del pivote. El catálogo las dibuja cerradas. */
  const MEL='blanco',CAJ='madClara';
  const CZ=(r,z0,z1,x,y,s=16)=>{const g=new THREE.CylinderGeometry(r,r,z1-z0,s);g.rotateX(Math.PI/2);g.translate(x,y,(z0+z1)/2);return g;};/* cilindro con el eje en z */
  /* carcasa de melamina: laterales de 1,8 (los de afuera, del material del frente), piso, techo, fondo de 0,8 y divisorias entre módulos; el frente queda en zf */
  /* cortes entre módulos: «mods» es una cantidad (módulos iguales) o una lista de anchos de −x a +x (Maxi 6/11: módulos de 75 más un bandejero) */
  const cortes=(x0,x1,mods)=>{if(typeof mods==='number'){const c=[];for(let i=0;i<=mods;i++)c.push(x0+(x1-x0)*i/mods);return c;}const t=mods.reduce((a,b)=>a+b,0),c=[x0];let x=x0;for(const w of mods){x+=w*(x1-x0)/t;c.push(x);}return c;};
  const nMods=mods=>typeof mods==='number'?mods:mods.length;
  function carcasa(x0,x1,y0,y1,zb,zf,fr,mods,{techo=true,piso=true,extFr=true}={}){const g=[],e=1.8,c=cortes(x0,x1,mods);
    g.push([B(x0,x0+e,y0,y1,zb,zf),extFr?fr:MEL],[B(x1-e,x1,y0,y1,zb,zf),extFr?fr:MEL]);
    if(piso)g.push([B(x0+e,x1-e,y0,y0+e,zb,zf),MEL]);if(techo)g.push([B(x0+e,x1-e,y1-e,y1,zb,zf),MEL]);
    g.push([B(x0+e,x1-e,y0,y1,zb,zb+.8),MEL]);
    for(let i=1;i<c.length-1;i++){const x=c[i];g.push([B(x-.9,x+.9,y0,y1,zb+.8,zf),MEL]);}return g;}
  /* filas de cajones (Maxi 6/11): de arriba abajo, finos, medianos y altos (3 filas: 20 / 33 / 47 % del alto; 2 filas: 40 / 60 %), para cubiertos arriba y ollas abajo.
     REGLA (Maxi 8/11): el cajón grande siempre abajo y el finito arriba. y0 es abajo: la fila 0 es la más alta */
  const filaY=(y0,y1,filas,j)=>{const P=filas===3?[0,.47,.8,1]:filas===2?[0,.6,1]:null;const f=k=>P?P[k]:k/filas;return [y0+(y1-y0)*f(j),y0+(y1-y0)*f(j+1)];};
  /* módulo i: límites del frente (xl, xr) y luz interior entre laterales o divisorias (xa, xb) */
  const modX=(x0,x1,mods,i)=>{const c=cortes(x0,x1,mods),xl=c[i],xr=c[i+1];return [xl,xr,i===0?xl+1.8:xl+.9,i===c.length-2?xr-1.8:xr-.9];};
  /* bandejero: frente entero de la altura del módulo que sale con tres bandejas de alambre en un bastidor, sobre guías telescópicas abajo (igual que un cajón) */
  function bandejero(id,xl,xr,xa,xb,y0,y1,zb,zf,fr){const g=[],Dc=Math.max(20,zf-zb-2.3),mv={mov:{id,tipo:'desl',eje:[0,0,1],max:Dc*.9}};
    g.push([B(xl+.15,xr-.15,y0+.15,y1-.15,zf,zf+2),fr,mv]);
    const h=y1-y0;for(let k=0;k<3;k++){const y=y0+2+(h-14)*k/2;g.push([B(xa+2.4,xb-2.4,y,y+.6,zf-Dc,zf-.3),'acero',mv],[B(xa+2.4,xa+2.9,y,y+9,zf-Dc,zf-.3),'acero',mv],[B(xb-2.9,xb-2.4,y,y+9,zf-Dc,zf-.3),'acero',mv],[B(xa+2.4,xb-2.4,y,y+9,zf-Dc,zf-Dc+.5),'acero',mv]);}
    for(const [a,b] of [[xa+2.9,xa+3.5],[xb-3.5,xb-2.9]])g.push([B(a,b,y0+2,y1-2,zf-1.6,zf-.3),'acero',mv]);/* parantes que cuelgan las bandejas del frente */
    for(const [a,b] of [[xa,xa+1.3],[xb-1.3,xb]])g.push([B(a,b,y0+2,y0+6,zf-Dc,zf-.3),'acero']);
    for(const [a,b] of [[xa+1.3,xa+2.2],[xb-2.2,xb-1.3]])g.push([B(a,b,y0+2.5,y0+5.5,zf-Dc,zf-.3),'acero',mv]);
    g.push([...tir((xl+xr)/2,(y0+y1)/2,zf+2,30,true),mv]);return g;}
  /* cajón: frente de 2 con juntas de 3 mm, caja de madera clara (laterales, fondo y piso), guías telescópicas de acero: el perfil del mueble queda, el del cajón sale con él */
  function cajon(id,xl,xr,xa,xb,ya,yb,zb,zf,fr,tirador=true){const g=[],Dc=Math.max(20,zf-zb-2.3),mv={mov:{id,tipo:'desl',eje:[0,0,1],max:Dc*.9}};
    g.push([B(xl+.15,xr-.15,ya+.15,yb-.15,zf,zf+2),fr,mv]);
    const hb=Math.max(6,Math.min(yb-ya-6,24));
    g.push([B(xa+2.2,xa+3.8,ya+1.5,ya+1.5+hb,zf-Dc,zf-.3),CAJ,mv],[B(xb-3.8,xb-2.2,ya+1.5,ya+1.5+hb,zf-Dc,zf-.3),CAJ,mv],[B(xa+3.8,xb-3.8,ya+1.5,ya+1.5+hb,zf-Dc,zf-Dc+1.6),CAJ,mv],[B(xa+2.2,xb-2.2,ya+1.5,ya+2.5,zf-Dc,zf-.3),CAJ,mv]);
    for(const [a,b] of [[xa,xa+1.3],[xb-1.3,xb]])g.push([B(a,b,ya+2,ya+6,zf-Dc,zf-.3),'acero']);
    for(const [a,b] of [[xa+1.3,xa+2.2],[xb-2.2,xb-1.3]])g.push([B(a,b,ya+2.5,ya+5.5,zf-Dc,zf-.3),'acero',mv]);
    if(tirador)g.push([...tir((xl+xr)/2,yb-4,zf+2,Math.min(24,(xr-xl)*.5)),mv]);return g;}
  /* puerta batiente con bisagras cazoleta (Ø35 embutida en la puerta, brazo, base atornillada al lateral); lado −1: bisagras a la izquierda (−x) */
  function puerta(id,xl,xr,xa,xb,y0,y1,zf,fr,lado=-1,tirador=true){const g=[],hx=lado<0?xl+.15:xr-.15,xs=lado<0?xa:xb;
    const mv={mov:{id,tipo:'giro',eje:[0,1,0],max:(lado<0?-1:1)*100*Math.PI/180,pivot:[hx,0,zf]}};
    g.push([B(xl+.15,xr-.15,y0+.15,y1-.15,zf,zf+2),fr,mv]);
    const xcz=lado<0?hx+2.2:hx-2.2;/* centro de la cazoleta, a 22 mm del canto */
    for(const y of [y0+9,y1-9]){g.push([CZ(1.75,zf,zf+1.3,xcz,y),'acero',mv]);
      const a=Math.min(xs,xcz),b=Math.max(xs,xcz);g.push([B(a+(lado<0?.3:0),b-(lado<0?0:.3),y-.9,y+.9,zf-3.2,zf-1.4),'acero',mv]);/* brazo */
      g.push([B(lado<0?xs:xs-.3,lado<0?xs+.3:xs,y-2.5,y+2.5,zf-6.5,zf-2),'acero']);}/* base en el lateral */
    if(tirador)g.push([...tir(lado<0?xr-6:xl+6,(y0+y1)/2,zf+2,24,true),mv]);return g;}
  /* puerta de alacena proyectada hacia arriba: gira sobre su canto superior y queda horizontal adelante; brazos de elevación a los dos lados (base fija en el lateral, brazo en la puerta) */
  function puertaArriba(id,xl,xr,xa,xb,y0,y1,zf,fr){const g=[],mv={mov:{id,tipo:'giro',eje:[1,0,0],max:-100*Math.PI/180,pivot:[0,y1-.15,zf]}};
    g.push([B(xl+.15,xr-.15,y0+.15,y1-.15,zf,zf+2),fr,mv]);
    for(const [s,x] of [[1,xa],[-1,xb]]){g.push([B(x,x+s*1,y1-13,y1-4,zf-10,zf-2.5),'acero']);g.push([B(x+s*1,x+s*1.6,y0+5,y1-9,zf-1.6,zf-.2),'acero',mv]);}return g;}
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
  mesa:{n:'Mesa de madera maciza, patas cónicas',cat:'comedor',p:{L:180,D:90,H:76,mad:'madOsc'},g:p=>{const tapa=()=>{/* canto 'vivo' (Maxi 8/11): los dos cantos largos con el borde natural del tronco, ondulación irregular, tablón de 6; las puntas cortadas a escuadra */
      const sh=new THREE.Shape(),n=Math.max(10,Math.round(p.L/4)),ola=(x,f)=>1.8*Math.sin(x*.035+f)+1.0*Math.sin(x*.11+2.1*f)+.5*Math.sin(x*.37+f*3);
      for(let i=0;i<=n;i++){const x=-p.L/2+p.L*i/n,y=p.D/2-1.5-ola(x,.7);i?sh.lineTo(x,y):sh.moveTo(x,y);}
      for(let i=n;i>=0;i--){const x=-p.L/2+p.L*i/n;sh.lineTo(x,-p.D/2+1.5+ola(x,2.3));}
      const ge=new THREE.ExtrudeGeometry(sh,{depth:5.4,bevelEnabled:true,bevelThickness:.3,bevelSize:.5,bevelSegments:2,curveSegments:4});ge.rotateX(Math.PI/2);ge.translate(0,p.H-.3,0);return ge;};
    const g=[[p.canto==='vivo'?tapa():R(-p.L/2,p.L/2,p.H-5,p.H,-p.D/2,p.D/2,1),p.mad],[B(-p.L/2+12,p.L/2-12,p.H-12,p.H-5,-p.D/2+12,p.D/2-12),p.mad]];
    for(const sx of [-1,1])for(const sz of [-1,1])g.push([C(2.2,0,p.H-5,sx*(p.L/2-14),sz*(p.D/2-14),16,3.6),p.mad]);return g;}},
  /* Maxi 4/11: estructuras octet diseñadas en la página casas/octet (editor), copiadas en octet-modelos.js; con «modelo» se elige cuál. Nodos, tubos, discos, vidrio y regatones salen de octet.js */
  octet:{n:'Estructura octet (tubos y nodos, del editor Octet)',cat:'comedor',p:{modelo:Object.keys(OCTET)[0]||''},ui:[['modelo','modelo',Object.keys(OCTET)]],g:p=>{const m=OCTET[p.modelo];if(!m)return [[B(-20,20,0,2,-20,20),'rojo']];
    const A=armarOctet(THREE,m,{centrar:true});const MAT={vidrio:'vidrio',disco:'aluminio',goma:'gomaN'};return [...A.nodos.map(n=>[n.geo,'aluFund']),...A.struts.map(s=>[s.geo,'aluminio']),...A.extra.map(x=>[x.geo,MAT[x.cat]||'aluminio'])];}},
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
  mesada:{n:'Bajo mesada con zócalo rehundido',cat:'cocina',p:{L:240,D:62,H:90,fr:'madOsc',top:'granito',filas:3,mod:76,band:0},/* Maxi 4/11: tres cajones por columna; «puertas»: módulos con dos puertas batientes (p. ej. bajo la bacha).
    Maxi 6/11: «mod» = ancho de módulo buscado (los módulos salen iguales, redondeando la cantidad); «band» = ancho de un bandejero en la punta +x («bandLado:-1» lo pasa a la punta −x); los índices de «puertas» cuentan al bandejero */
    g:p=>{const zf=p.D/2-2,zb=-p.D/2,filas=p.filas??3,pu=p.puertas||[],y0=10,y1=p.H-3;
      const band=p.band||0,resto=p.L-band,n=Math.max(1,Math.round(resto/(p.mod||76)));let mods=Array(n).fill(resto/n),iB=-1;if(band>0){if((p.bandLado||1)<0){mods.unshift(band);iB=0;}else{mods.push(band);iB=n;}}
      const g=[[B(-p.L/2,p.L/2,0,10,zb,p.D/2-8),'negro'],...carcasa(-p.L/2,p.L/2,y0,y1,zb,zf,p.fr,mods),...tapaHuecos(p.L,p.D,p.H,p.huecos,p.top)];
      for(let i=0;i<mods.length;i++){const [xl,xr,xa,xb]=modX(-p.L/2,p.L/2,mods,i);
        if(i===iB){g.push(...bandejero('bj',xl,xr,xa,xb,y0,y1,zb,zf,p.fr));continue;}
        if(pu.includes(i)){const xm=(xl+xr)/2;g.push([B(xa,xb,(y0+y1)/2-.9,(y0+y1)/2+.9,zb+.8,zf-2),MEL],...puerta(`p${i}a`,xl,xm,xa,xb,y0,y1,zf,p.fr,-1),...puerta(`p${i}b`,xm,xr,xa,xb,y0,y1,zf,p.fr,1));continue;}
        for(let j=0;j<filas;j++){const [ya,yb]=filaY(y0,y1,filas,j);g.push(...cajon(`c${i}${j}`,xl,xr,xa,xb,ya,yb,zb,zf,p.fr));}}return g;}},
  isla:{n:'Isla con barra y laterales de piedra',cat:'cocina',p:{L:200,D:90,H:90,vol:30,fr:'madOsc',top:'granito',top2:'',corte:0,filas:3},g:p=>{const z0=-p.D/2+p.vol;
    /* tapa doble (top2): del lado de los cajones (+z) piedra en «corte» cm; del lado de la barra (−z) tablón de madera de 6 con canto rústico irregular, laterales de cada material */
    const zc=p.top2?p.D/2-(p.corte||p.D/2):-p.D/2,tapa=[];
    tapa.push([B(-p.L/2,p.L/2,p.H-4,p.H,zc,p.D/2),p.top],[B(-p.L/2,-p.L/2+4,0,p.H-4,zc,p.D/2),p.top],[B(p.L/2-4,p.L/2,0,p.H-4,zc,p.D/2),p.top]);
    if(p.top2){/* contorno del canto vivo: ondulación suave e irregular de ±2,5 cm, extruida 6 cm hacia abajo */const sh=new THREE.Shape(),n=Math.max(8,Math.round(p.L/4));sh.moveTo(-p.L/2,zc);sh.lineTo(p.L/2,zc);
      for(let i=n;i>=0;i--){const x=-p.L/2+p.L*i/n,e=1.6*Math.sin(x*.045+.7)+.9*Math.sin(x*.13+2.1)+.45*Math.sin(x*.41);sh.lineTo(x,-p.D/2-e-.5);}
      const ge=new THREE.ExtrudeGeometry(sh,{depth:6,bevelEnabled:true,bevelThickness:.6,bevelSize:.6,bevelSegments:2,curveSegments:4});ge.rotateX(Math.PI/2);ge.translate(0,p.H-.6,0);tapa.push([ge,p.top2]);
      tapa.push([B(-p.L/2,-p.L/2+4,0,p.H-6,-p.D/2,zc),p.top2],[B(p.L/2-4,p.L/2,0,p.H-6,-p.D/2,zc),p.top2]);}
    const zf=p.D/2-2,mods=Math.max(1,Math.round((p.L-8)/(p.mod||76))),filas=p.filas??3,y0=10,y1=p.H-(p.top2?6:4),g=[[B(-p.L/2+4,p.L/2-4,0,10,z0,p.D/2-8),'negro'],...carcasa(-p.L/2+4,p.L/2-4,y0,y1,z0,zf,p.fr,mods,{extFr:false}),...tapa];
    for(let i=0;i<mods;i++){const [xl,xr,xa,xb]=modX(-p.L/2+4,p.L/2-4,mods,i);for(let j=0;j<filas;j++){const [ya,yb]=filaY(y0,y1,filas,j);g.push(...cajon(`c${i}${j}`,xl,xr,xa,xb,ya,yb,z0,zf,p.fr));}}return g;}},
  alacena:{n:'Alacena alta, puertas proyectadas hacia arriba, con LED abajo',cat:'cocina',p:{L:120,D:35,H:70,fr:'madOsc'},z:150,/* Maxi 4/11: se abren hacia arriba con brazos de elevación */
    /* Maxi 7/11: «band» = ancho de un bandejero vertical (bandejas de alambre que salen hacia adelante) en la punta +x («bandLado:-1», en la −x); las puertas se reparten en el resto */
    g:p=>{const zf=p.D/2-2,zb=-p.D/2,band=p.band||0,resto=p.L-band,n=Math.max(1,Math.round(resto/90))/* Maxi 6/11: puertas anchas, una cada 0,90 (1,20 era mucho) */;
      let mods=Array(n).fill(resto/n),iB=-1;if(band>0){if((p.bandLado||1)<0){mods.unshift(band);iB=0;}else{mods.push(band);iB=n;}}
      const g=[...carcasa(-p.L/2,p.L/2,0,p.H,zb,zf,p.fr,mods)];
      for(let i=0;i<mods.length;i++){const [xl,xr,xa,xb]=modX(-p.L/2,p.L/2,mods,i);
        if(i===iB){g.push(...bandejero('bj',xl,xr,xa,xb,0,p.H,zb,zf,p.fr));continue;}
        if(p.H>40)g.push([B(xa,xb,p.H/2-.9,p.H/2+.9,zb+.8,zf-2),MEL]);g.push(...puertaArriba(`a${i}`,xl,xr,xa,xb,0,p.H,zf,p.fr));}
      if(p.led!==false)g.push([B(-p.L/2+2,p.L/2-2,-.5,0,-p.D/2+4,p.D/2-6),'ledCalido']);return g;}},
  columna:{n:'Columna con horno empotrado',cat:'cocina',p:{L:60,D:60,H:220,fr:'madOsc'},/* Maxi 4/11: abajo del horno, dos cajones; arriba, puerta con bisagras cazoleta */
    g:p=>{const zf=p.D/2-2,zb=-p.D/2,g=[[B(-p.L/2,p.L/2,0,10,zb,p.D/2-8),'negro'],...carcasa(-p.L/2,p.L/2,10,p.H,zb,zf,p.fr,1)];
      const [xl,xr,xa,xb]=modX(-p.L/2,p.L/2,1,0);
      g.push([B(xa,xb,79,80.8,zb+.8,zf),MEL],[B(xa,xb,140,141.8,zb+.8,zf),MEL]);/* estantes que enmarcan el horno */
      g.push([B(-p.L/2+3,p.L/2-3,81,139.5,zf,zf+1.5),'negro'],[B(-p.L/2+6,p.L/2-6,90,128,zf+1.5,zf+2),'vidrioN'],tir(0,134,zf+1.5,40));/* horno */
      g.push(...cajon('c0',xl,xr,xa,xb,10,51,zb,zf,p.fr),...cajon('c1',xl,xr,xa,xb,51,79,zb,zf,p.fr));/* grande abajo, finito arriba (Maxi 8/11) */
      if(p.H-142>20)g.push(...puerta('pa',xl,xr,xa,xb,142,p.H,zf,p.fr,-1));return g;}},
  heladera:{n:'Heladera con freezer abajo',cat:'cocina',p:{L:70,D:70,H:190,col:'acero'},g:p=>[[R(-p.L/2,p.L/2,2,p.H,-p.D/2,p.D/2,2.5),p.col],ran(-p.L/2+1,p.L/2-1,72,72.4,p.D/2),[B(p.L/2-6,p.L/2-4.5,85,140,p.D/2,p.D/2+3),'negro'],[B(p.L/2-6,p.L/2-4.5,40,66,p.D/2,p.D/2+3),'negro'],[B(-p.L/2+3,p.L/2-3,0,2,-p.D/2+3,p.D/2-3),'negro']]},
  bacha:{n:'Bacha bajo mesada con grifería negra',cat:'cocina',p:{L:80},z:90,g:p=>[[B(-p.L/2+6,p.L/2-6,-18,-17,-18,18),'acero'],[B(-p.L/2+6,p.L/2-6,-18,0,-18.5,-18),'acero'],[C(2,0,28,0,-24,14),'grifo'],[VAR([0,28,-24],[0,30,-8],1.1),'grifo'],[C(1.2,22,30,0,-8,10),'grifo']]},
  bachaFarm:{n:'Bacha farm de cerámica con frente a la vista',cat:'cocina',p:{L:80,D:50,P:24,col:'marfil'},z:90,g:p=>{/* origen arriba de la mesada, al centro; el frente (+z) queda al ras del canto de la tapa. Va con un hueco en la tapa de la mesada (huecos).
      Maxi 8/11: más redondeada, marfil y mejor modelada: cuba de paredes de 2,5 con esquinas redondeadas (anillo extruido con agujero), fondo con caída al desagüe, labio superior y frente (delantal) con los cantos redondeados; grifo cuello de cisne. */
    const X=p.L/2,Z=p.D/2,e=2.5,P=p.P,col=p.col||'marfil',g=[];
    const rr=(sh,x0,z0,x1,z1,r)=>{sh.moveTo(x0+r,z0);sh.lineTo(x1-r,z0);sh.quadraticCurveTo(x1,z0,x1,z0+r);sh.lineTo(x1,z1-r);sh.quadraticCurveTo(x1,z1,x1-r,z1);sh.lineTo(x0+r,z1);sh.quadraticCurveTo(x0,z1,x0,z1-r);sh.lineTo(x0,z0+r);sh.quadraticCurveTo(x0,z0,x0+r,z0);return sh;};
    const sh=rr(new THREE.Shape(),-X,-Z,X,Z,6);const ho=rr(new THREE.Path(),-X+e,-Z+e,X-e,Z-e,4);sh.holes.push(ho);
    const an=new THREE.ExtrudeGeometry(sh,{depth:P-e,bevelEnabled:false});an.rotateX(Math.PI/2);/* la extrusión (z de 0 a P−e) girada queda de y 0 a −(P−e): las paredes de la cuba */g.push([an,col]);
    /* fondo con caída suave hacia el centro: una placa redondeada un poco más baja en el medio (dos piezas inclinadas) */
    g.push([R(-X+e-.5,X-e+.5,-P,-P+e+.4,-Z+e-.5,Z-e+.5,1.5),col]);
    /* labio superior redondeado, 1,5 más ancho que la cuba, apenas sobre la tapa */
    { const lab=rr(new THREE.Shape(),-X-1.5,-Z-1.5,X+1.5,Z+1.5,7);lab.holes.push(rr(new THREE.Path(),-X+e,-Z+e,X-e,Z-e,4));const lg=new THREE.ExtrudeGeometry(lab,{depth:1.2,bevelEnabled:true,bevelThickness:.5,bevelSize:.5,bevelSegments:3});lg.rotateX(-Math.PI/2);lg.translate(0,-.6,0);g.push([lg,col]); }
    /* delantal: el frente a la vista, redondeado en sus cuatro cantos, 1 cm por delante de la cuba */
    g.push([R(-X-1.5,X+1.5,-P-1,1,Z-e,Z+1.5,2.2),col]);
    /* desagüe y grifería */
    g.push([C(2.4,-P+e-.2,-P+e+.6,0,0,20),'acero'],[C(1.1,-P+e+.4,-P+e+.7,0,0,16),'grafito']);
    g.push([C(2.2,0,26,0,-Z-6,16),'grifo'],[VAR([0,26,-Z-6],[0,33,-Z+2],1.3),'grifo'],[VAR([0,33,-Z+2],[0,30,-Z+12],1.3),'grifo'],[C(1.3,24,32,0,-Z+12,10),'grifo'],[C(1.6,0,10,7,-Z-6,12),'grifo']);
    return g;}},
  anafe:{n:'Quemadores individuales en la mesada',cat:'cocina',p:{L:60,D:52,n:4},z:90,g:p=>{/* Maxi 8/11: sin base unificadora: cada quemador va en su agujero de la mesada (un disco oscuro a ras, el cuerpo de aluminio fundido, la tapa esmaltada y su parrilla de hierro) */
    const g=[];const H4=[[-p.L/4,-p.D/4,9],[p.L/4,-p.D/4,7],[-p.L/4,p.D/4,7],[p.L/4,p.D/4,9]],H5=[[-p.L/3,-p.D/4,8],[-p.L/3,p.D/4,7],[0,0,12],[p.L/3,-p.D/4,7],[p.L/3,p.D/4,8]];/* 5: cuatro en las esquinas y una grande al medio */
    for(const [x,z,r] of (p.n===5?H5:H4)){const Rq=r+4;
      g.push([C(Rq,-1.2,.15,x,z,28),'grafito']);/* el agujero en la piedra: disco oscuro apenas hundido */
      g.push([C(r*.62,0,1.6,x,z,24,r*.55),'aluFund'],[C(r*.5,1.6,2.6,x,z,24,r*.46),'negro'],[C(r*.3,2.6,3.1,x,z,16),'negro']);/* cuerpo, corona de llama y tapa */
      { const t=new THREE.TorusGeometry(Rq-.6,.55,6,36);t.rotateX(Math.PI/2);t.translate(x,3.4,z);g.push([t,'hierroN']);/* aro de la parrilla */
        for(let k=0;k<4;k++){const a=Math.PI/4+k*Math.PI/2;const b=new THREE.BoxGeometry(Rq-r*.45+.6,1.1,1.2);b.translate((Rq+r*.45)/2-.3,0,0);b.rotateY(a);b.translate(x,3.4,z);g.push([b,'hierroN']);} }}
    return g;}},
  campana:{n:'Campana de pared negra',cat:'cocina',p:{L:60,D:50,H:100},z:155,g:p=>[[R(-p.L/2,p.L/2,0,5,-p.D/2,p.D/2,1),'negro'],[B(-12,12,5,p.H,-p.D/2,-p.D/2+22),'negro']]},
  campanaIsla:{n:'Campana de isla colgada del techo',cat:'cocina',p:{L:90,D:60},z:165,g:(p,ctx)=>{/* cuerpo negro a 1,65 sobre el piso (z fijo) y chimenea hasta el techo real sobre la isla */
    const T=ctx&&ctx.techoMin?ctx.techoMin(Math.max(p.L,p.D)/2):250,h=Math.max(25,Math.min(T-167,700));/* hasta lo más bajo del techo sobre toda la campana (cabios incluidos) */
    /* Maxi 8/11: luz abajo de la campana (panel LED cálido entre dos filtros de acero), para que se vea el anafe */
    return [[R(-p.L/2,p.L/2,0,7,-p.D/2,p.D/2,1),'negro'],[B(-p.L/2+8,p.L/2-8,7,20,-p.D/2+8,p.D/2-8),'negro'],[B(-13,13,20,h,-13,13),'negro'],[B(-p.L/2+4,-p.L/2+4+(p.L-8)*.3,-.3,0,-p.D/2+4,p.D/2-4),'acero'],[B(p.L/2-4-(p.L-8)*.3,p.L/2-4,-.3,0,-p.D/2+4,p.D/2-4),'acero'],[B(-p.L/2+4+(p.L-8)*.3,p.L/2-4-(p.L-8)*.3,-.6,0,-p.D/2+6,p.D/2-6),'ledCalido']];}},
  /* Maxi 5/11: paño de revestimiento de pared (inox detrás de la mesada de Arcos). Chapa de e cm apoyada en la pared, de z a z+H; el frente mira a +z. mat: cualquiera de la paleta */
  revestimiento:{n:'Revestimiento de pared (paño)',cat:'cocina',p:{L:200,H:60,e:1.5,mat:'acero'},z:90,g:p=>[[B(-p.L/2,p.L/2,0,p.H,-p.e,0),p.mat]]},
  /* Maxi 6/11: estante de pared angosto (especias, frascos) bajo las alacenas: tabla de «e» sobre ménsulas en L de planchuela cada ~0,80, la espalda en z 0 local, la tabla hacia +z (el ambiente) */
  estante:{n:'Estante de pared',cat:'cocina',p:{L:200,D:15,e:2,mat:'acero'},z:130,g:p=>{const g=[[B(-p.L/2,p.L/2,0,p.e,0,p.D),p.mat]],n=Math.max(2,Math.round(p.L/80)+1);
    for(let i=0;i<n;i++){const x=-p.L/2+6+(p.L-12)*i/(n-1);g.push([B(x-1.5,x+1.5,-10,0,0,.6),'acero'],[B(x-1.5,x+1.5,-.6,0,0,p.D-1.5),'acero']);}return g;}},
  salpicadero:{n:'Salpicadero de pizarra en lajas',cat:'cocina',p:{L:200,H:10,caja:0},z:90,g:p=>{/* lajas de pizarra en hiladas de 10, largos alternados y canto irregular; con caja > 0 es una puerta de pizarra separada de la pared (tapa un tablero, por ejemplo) */
    const g=[],c=p.caja||0,LS=[37,52,29,45,60,33,48],X=p.L/2;let k=0;
    if(c>0)g.push([B(-X,X,0,1.5,-1,c),'pizarra'],[B(-X,X,p.H-1.5,p.H,-1,c),'pizarra'],[B(-X,-X+1.5,0,p.H,-1,c),'pizarra'],[B(X-1.5,X,0,p.H,-1,c),'pizarra']);
    g.push([B(-X,X,0,p.H,c-1,c),'junta']);
    for(let y=0,r=0;y<p.H-.1;y+=10,r++){const yh=Math.min(10,p.H-y);let x=-X-(r%3)*13;
      while(x<X){const l=LS[k++%LS.length],x0=Math.max(x,-X),x1=Math.min(x+l-.5,X),d=1.2+((k*7)%5)*.25;if(x1>x0+1)g.push([B(x0,x1,y+.25,y+yh-.25,c,c+d),'pizarra']);x+=l;}}
    return g;}},
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
  baneraEmp:{n:'Bañera empotrada con faldón y grifería de pared',cat:'baño',p:{L:160,D:75,H:56},g:p=>{/* cáscara cerrada: faldón en los cuatro lados, borde de 7, cuenco hueco con fondo a 18; pico y monocomando en la pared del extremo +x */
    const t=7,e=2,c=1.5,X=p.L/2,Z=p.D/2,H=p.H,g=[];
    for(const s of [-1,1]){g.push([B(-X,X,0,H-4,s>0?Z-e:-Z,s>0?Z:-Z+e),'blanco'],[B(s>0?X-e:-X,s>0?X:-X+e,0,H-4,-Z+e,Z-e),'blanco']);/* faldón */
      g.push([B(-X,X,H-4,H,s>0?Z-t:-Z,s>0?Z:-Z+t),'loza'],[B(s>0?X-t:-X,s>0?X:-X+t,H-4,H,-Z+t,Z-t),'loza']);/* borde */
      g.push([B(-X+t,X-t,18,H-4,s>0?Z-t:-Z+t-c,s>0?Z-t+c:-Z+t),'loza'],[B(s>0?X-t:-X+t-c,s>0?X-t+c:-X+t,18,H-4,-Z+t,Z-t),'loza']);}/* paredes del cuenco */
    g.push([B(-X+t,X-t,16,18,-Z+t,Z-t),'loza'],[B(-X+t+8,X-t-8,18,18.3,-Z+t+6,Z-t-6),'blanco'],
      [VAR([X,H+18,0],[X-17,H+16,0],1.3),'grifo'],[(()=>{const md=new THREE.CylinderGeometry(3.5,3.5,1.5,20);md.rotateZ(Math.PI/2);md.translate(X-.75,H+29,0);return md;})(),'grifo'],[B(X-6,X-1,H+27,H+31,-1,1),'grifo']);
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
    ratonaTab:{n:'Mesa ratona de tablones',p:{L:160,D:90,H:38,mad:'madRust',e:9},
      g:p=>{const g=[],n=3,e=p.e||9,w=(p.D-2*(n-1))/n;for(let i=0;i<n;i++){const z0=-p.D/2+i*(w+2);g.push([B(-p.L/2,p.L/2,p.H-e,p.H,z0,z0+w),p.mad]);}for(const x of [-p.L/2+25,p.L/2-25])g.push([B(x-9,x+9,0,p.H-e,-p.D/2+12,p.D/2-12),p.mad]);return g;}},
    bkf:{n:'Sillón BKF (Hardoy) de cuero suela',p:{cuero:'suela'},
      g:p=>{/* Maxi 8/11: la geometría del BKF real, no una simplificación. Dos varillas macizas de 12 mm, cada una un lazo cerrado con cuatro horquillas:
         una punta de atrás, la punta de adelante del OTRO lado y dos patas (la de adelante del lado de su punta de atrás y la de atrás del otro lado).
         De costado se ve la X; atrás y adelante, las diagonales que cruzan. Medidas de la estructura fotografiada y acotada por Stefanos Cueros
         (puntas de atrás a 70, de adelante a 63, punta de atrás a punta de adelante 78, piernas a 74 a la altura de las puntas de adelante)
         y del plano de Muebles Lluesma (alto 91, ancho 79–82); las dos varillas se sueldan donde se cruzan de costado. Frente hacia +z. */
        const g=[],r=.6,RB=2.2;
        const PB=s=>[s*35,90,-36],PF=s=>[s*31.5,55,34],FF=s=>[s*41,0,30],FB=s=>[s*41,0,-30];
        const V3=a=>new THREE.Vector3(...a);
        const lazo=s=>{/* punta de atrás (lado s) → pata de adelante (lado s) → punta de adelante (lado −s) → pata de atrás (lado −s) → vuelve */
          const P=[PB(s),FF(s),PF(-s),FB(-s)].map(V3),cp=new THREE.CurvePath();const n=P.length;
          const ent=k=>{const a=P[k],b=P[(k+n-1)%n];return a.clone().add(b.clone().sub(a).setLength(RB*3));},sal=k=>{const a=P[k],b=P[(k+1)%n];return a.clone().add(b.clone().sub(a).setLength(RB*3));};
          for(let k=0;k<n;k++){cp.add(new THREE.QuadraticBezierCurve3(ent(k),P[k],sal(k)));cp.add(new THREE.LineCurve3(sal(k),ent((k+1)%n)));}
          return new THREE.TubeGeometry(cp,260,r,8,true);};
        g.push([lazo(1),'negro'],[lazo(-1),'negro']);
        /* cuero: cuelga de las cuatro puntas (los bolsillos las envuelven); el borde de los costados queda libre y el asiento baja a ~32 */
        const nu=14,nt=18,pos=[],idx=[],F=PF(1),Bk=PB(1);
        for(let j=0;j<=nt;j++){const t=j/nt,sn=Math.sin(Math.PI*t);for(let i=0;i<=nu;i++){const u=-1+2*i/nu;
          const w=F[0]+(Bk[0]-F[0])*t,y=F[1]+(Bk[1]-F[1])*t-27*sn-11*(1-u*u)*Math.sqrt(sn),z=F[2]+(Bk[2]-F[2])*t-4*sn;
          pos.push(u*w*(1-.2*sn),y,z);}}
        for(let j=0;j<nt;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;idx.push(a,c,b,b,c,d,a,b,c,b,d,c);}
        const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));sg.setIndex(idx);sg.computeVertexNormals();g.push([sg,p.cuero]);
        return g;}},
    ratonaBaja:{n:'Mesa ratona redonda baja',p:{L:110,H:30,mad:'roble'},g:p=>[[CYL(p.L/2,p.H-5,p.H,0,0,48),p.mad],[CYL(p.L/2-22,0,p.H-5,0,0,40),p.mad]]},
    camaPlat:{n:'Cama baja sobre tarima con cabecero de listones',p:{L:180,D:205,ala:35,mad:'roble',tela:'sabana'},
      g:p=>{const g=[],H0=16,W=p.L+2*p.ala;g.push([B(-W/2,W/2,0,H0,-p.D/2,p.D/2+p.ala),p.mad],[B(-p.L/2,p.L/2,H0,H0+22,-p.D/2+4,p.D/2),'sabana'],[B(-p.L/2-1,p.L/2+1,H0+18,H0+26,-p.D/2+60,p.D/2+1),p.tela]);
        for(const x of p.L>=120?[-p.L/4,p.L/4]:[0])g.push([B(x-p.L/4+6,x+p.L/4-6,H0+22,H0+36,-p.D/2+8,-p.D/2+45),'almohada']);
        for(let x=-W/2;x<=W/2-4;x+=9)g.push([B(x,x+4,0,150,-p.D/2-6,-p.D/2-2),p.mad]);g.push([B(-W/2,W/2,0,150,-p.D/2-9,-p.D/2-6),'madOsc']);return g;}},
    /* Maxi 7/11: patas centrales y livianas (antes eran dos paneles macizos en las puntas): dos montantes de tabla de 4 × 30 sobre el eje de la mesa, a 30 de cada punta,
       con un pie cruzado de 4 × 6 abajo y una viga longitudinal de 4 × 8 bajo la tapa que los une; las piernas pasan por los costados */
    mesaMaciza:{n:'Mesa maciza de tapa gruesa',p:{L:240,D:95,H:76,mad:'madOsc'},
      g:p=>{const g=[[B(-p.L/2,p.L/2,p.H-6,p.H,-p.D/2,p.D/2),p.mad]],xs=[-p.L/2+30,p.L/2-30],pf=Math.min(p.D-24,56);
        for(const x of xs)g.push([B(x-2,x+2,6,p.H-6,-15,15),p.mad],[B(x-2,x+2,0,6,-pf/2,pf/2),p.mad]);
        g.push([B(xs[0]-2,xs[1]+2,p.H-14,p.H-6,-4,4),p.mad]);return g;}},
    /* Maxi 4/11 (Arcos, mesita del ventanal): banco corrido de tabla con respaldo en ángulo, de dos cuerpos. H es la altura del asiento (45 para mesa de 0,75);
       el respaldo va atrás (−z), inclinado «inc» grados hacia atrás, y sube 40 sobre el asiento; patas panel en las puntas; con asiento alto (>55), travesaño apoyapiés adelante. */
    bancoTabla:{n:'Banco corrido de tabla con respaldo en ángulo',cat:'cocina',p:{L:120,D:38,H:45,inc:14,mad:'madOsc'},
      g:p=>{const g=[[B(-p.L/2,p.L/2,p.H-4,p.H,-p.D/2,p.D/2),p.mad]];const a=-p.inc*Math.PI/180,zr=-p.D/2+3;
        /* respaldo y sus dos montantes: armados verticales sobre el canto trasero del asiento y girados en x hacia atrás */
        const inc=(ge)=>{ge.translate(0,-(p.H-2),-zr);ge.rotateX(a);ge.translate(0,p.H-2,zr);return ge;};
        g.push([inc(B(-p.L/2,p.L/2,p.H+14,p.H+40,zr-3,zr)),p.mad]);for(const s of [-1,1]){const x0=s<0?-p.L/2+4:p.L/2-8;g.push([B(x0,x0+4,0,p.H-4,-p.D/2+2,p.D/2-2),p.mad],[inc(B(x0,x0+4,p.H-4,p.H+40,zr-3,zr+2)),p.mad]);}
        if(p.H>55)g.push([B(-p.L/2+8,p.L/2-8,p.H-45,p.H-41,p.D/2-10,p.D/2-6),p.mad]);return g;}},
    /* Maxi 4/11 (Arcos): isla en dos materiales, un solo rectángulo L × D. Bloque de cocinar de piedra en la punta +x (Lb × Db, alto Hb, frentes de cajones hacia +z),
       y mesa de madera a altura H que ocupa el resto en L: el tramo libre de ancho completo y la «tira» de ancho D−Db que sigue junto al bloque, del lado −z, hasta su punta.
       Patas panel de la mesa: en la punta −x (ancho completo) y en la punta +x de la tira; la tira también apoya en el bloque. */
    islaMesa:{n:'Isla de piedra con mesa de madera en L',cat:'cocina',p:{L:380,D:120,Lb:160,Db:70,H:75,Hb:90,fr:'madClara',top:'granito',mad:'madRust',filas:3,tim:45},/* tim: centro del timón desde la punta oeste */
      g:p=>{const xb=p.L/2-p.Lb,zb=p.D/2-p.Db,g=[];
        const zf=p.D/2-2,mods=Math.max(1,Math.round((p.Lb-8)/(p.mod||76)))/* Maxi 7/11: «mod» = ancho de columna buscado; 76 por defecto en todas las cocinas (cajones de 75–80) */,filas=p.filas??3;
        g.push([B(xb+4,p.L/2-4,0,10,zb+4,p.D/2-8),'negro'],...carcasa(xb+4,p.L/2-4,10,p.Hb-4,zb+4,zf,p.fr,mods,{extFr:false}),[B(xb,p.L/2,p.Hb-4,p.Hb,zb,p.D/2),p.top],[B(xb,xb+4,0,p.Hb-4,zb,p.D/2),p.top],[B(p.L/2-4,p.L/2,0,p.Hb-4,zb,p.D/2),p.top],[B(xb+4,p.L/2-4,0,p.Hb-4,zb,zb+4),p.top]);
        for(let i=0;i<mods;i++){const [xl,xr,xa,xq]=modX(xb+4,p.L/2-4,mods,i);for(let j=0;j<filas;j++){const [ya,yb]=filaY(10,p.Hb-4,filas,j);g.push(...cajon(`c${i}${j}`,xl,xr,xa,xq,ya,yb,zb+4,zf,p.fr));}}
        /* tapa en L de una pieza, con canto vivo irregular (±2,5 cm) en los dos bordes largos (Maxi 4/11: «borde vivo en ambos lados»); rectos: las puntas y el borde contra el bloque */
        {const e=p.canto==='recto'?()=>0:(x,f)=>1.6*Math.sin(x*.045+f)+.9*Math.sin(x*.13+2.1*f)+.45*Math.sin(x*.41+f)/* Maxi 7/11 (Carhué): canto:'recto' = bordes rectos, sin canto vivo */,n=Math.max(8,Math.round(p.L/4)),sh=new THREE.Shape();
          sh.moveTo(-p.L/2,-p.D/2-e(-p.L/2,.7));for(let i=1;i<=n;i++){const x=-p.L/2+p.L*i/n;sh.lineTo(x,-p.D/2-e(x,.7));}/* borde −z, largo entero */
          sh.lineTo(p.L/2,zb-.5);sh.lineTo(xb-.5,zb-.5);/* punta +x de la tira y borde contra el bloque */
          const n2=Math.max(6,Math.round((xb+p.L/2)/4));for(let i=0;i<=n2;i++){const x=xb-(xb+p.L/2)*i/n2;sh.lineTo(x,p.D/2+e(x,2.9));}/* borde +z del tramo libre */
          const ge=new THREE.ExtrudeGeometry(sh,{depth:7,bevelEnabled:true,bevelThickness:.6,bevelSize:.6,bevelSegments:2,curveSegments:4});ge.rotateX(Math.PI/2);ge.translate(0,p.H-.6,0);g.push([ge,p.mad]);}
        /* Maxi 5/11: la pata de la mesa es un «timón», chapón de acero de 1/2″ (1,27 cm) a lo largo de la mesa, de 50 × alto de mesa, que atraviesa la tapa por un tajo y asoma 3 mm arriba; la punta este no lleva pata: la tira se encaja en el bloque de piedra */
        const xt=-p.L/2+(p.tim??45);g.push([B(xt-25,xt+25,0,p.H+.3,-.635,.635),'acero']);return g;}},
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
  const FAM={bkf:'estar',desayunador:'cocina',ducha:'baño',sofaPlat:'estar',sofaMod:'estar',ratonaTab:'estar',ratonaBaja:'estar',camaPlat:'dormitorio',mesaMaciza:'comedor',sillaCurva:'comedor',vanitorioMad:'baño',taburete:'estar',alfombraYute:'estar'};
  for(const [k,v] of Object.entries(P))if(!v.cat)v.cat=FAM[k]||'otros';
  return P;
}
