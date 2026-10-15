/* Equipamiento e iluminación por ambiente, con escenarios intercambiables (Maxi, 13/10).
   Cada ambiente tiene varios escenarios con nombre; cada escenario es una lista de muebles del catálogo con posición y giro.
   Se elige el escenario activo, se arrastran los muebles (Shift: girar de a 15°, Alt: sin imán), se agregan, duplican y borran,
   y los escenarios se duplican, renombran y borran. Todo queda en la base del artifact (colección «equipamiento», un documento por ambiente).
   Plano: x hacia el norte, y hacia el este; en 3D X = x, Y = altura, Z = y. Muebles: origen en el centro de la planta, frente hacia +z local. */
import * as N from './nombres.js';
import { catalogoLuces, escLuces, kelvin } from './luminarias.js';
import { progDef, hhmm } from './noche.js';
import { catalogoCal, escCal } from './calefaccion.js';
import { catalogoMuebles, MATERIALES } from './muebles.js';

export function initEquipamiento(visor,stage){
  const {THREE,scene,camera}=visor;const view=document.getElementById('view');
  const G=new THREE.Group();G.name='equipamiento';scene.add(G);
  const PISO=1.5;/* piso terminado de planta baja */

  /* ---------- materiales ---------- */
  const M=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:o.r??.7,metalness:o.m??0,...(o.x||{})});
  const MAT={roble:M('#b98a5a'),blanco:M('#ece9e2',{r:.5}),verde:M('#5f7a5a',{r:.6}),grafito:M('#3b3e40',{r:.55}),granito:M('#2f2f30',{r:.3}),
    piedra:M('#d9d4cb',{r:.35}),acero:M('#c9cdd1',{r:.3,m:.7}),negro:M('#161718',{r:.25}),rojo:M('#b3342b',{r:.4}),tela:M('#8a8f96',{r:.95}),
    vidrioN:M('#101214',{r:.08,m:.2}),junta:M('#2a2622',{r:.9}),madOsc:M('#6e4a2e'),sabana:M('#efece6',{r:.95}),lino:M('#c9c1b3',{r:.95}),petroleo:M('#3e5a63',{r:.95}),mostaza:M('#b88a3a',{r:.95}),alfombra:M('#b9ad98',{r:1}),almohada:M('#f6f3ee',{r:.95}),loza:M('#f4f3f0',{r:.25}),espejo:M('#dfe6ea',{r:.04,m:1}),vidrio:M('#d8e6ea',{r:.05,x:{transparent:true,opacity:.28,depthWrite:false}}),grifo:M('#c9cdd1',{r:.15,m:1}),llama:M('#ff7a1a',{x:{emissive:new THREE.Color('#ff5a00'),emissiveIntensity:2.5}}),radiante:M('#e2462b',{x:{transparent:true,opacity:.18,depthWrite:false}}),
    /* referencias de Maxi (14/10, carpeta «muebles para housemaker»): madera rústica y oscura, lino, yute, pizarra, negro mate, luz cálida baja */
    madRust:M('#8a6142',{r:.85}),madClara:M('#c79f72',{r:.7}),pizarra:M('#2c2f31',{r:.75}),yute:M('#b39a6c',{r:1}),ledCalido:M('#f3d9a8',{x:{emissive:new THREE.Color('#ffb85a'),emissiveIntensity:1.2}})};
  const FR={blanco:'blanco',verde:'verde',roble:'roble',grafito:'grafito'};

  /* ---------- catálogo: cada tipo arma su geometría en coordenadas locales (cm) ---------- */
  const B=(x0,x1,y0,y1,z0,z1)=>{const g=new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0);g.translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);return g;};
  const CYL=(r,y0,y1,x=0,z=0,s=20)=>{const g=new THREE.CylinderGeometry(r,r,y1-y0,s);g.translate(x,(y0+y1)/2,z);return g;};
  function frente(L,D,y0,y1,mod,fr){/* puertas: ranuras de 4 mm cada «mod» cm en el frente */const g=[];const n=Math.max(1,Math.round(L/mod));for(let i=1;i<n;i++){const x=-L/2+L*i/n;g.push([B(x-.2,x+.2,y0,y1,D/2-.1,D/2+.05),'junta']);}
    g.push([B(-L/2+3,L/2-3,y1-.4,y1,D/2-.1,D/2+.05),'junta']);return g;}
  const CAT={
    mesada:{n:'Mesada con bajo mesada',p:{L:240,D:62,H:90,fr:'blanco',top:'granito'},
      g:p=>[[B(-p.L/2,p.L/2,0,10,-p.D/2,p.D/2-6),'negro'],[B(-p.L/2,p.L/2,10,p.H-4,-p.D/2,p.D/2-2),p.fr],[B(-p.L/2,p.L/2,p.H-4,p.H,-p.D/2,p.D/2+1),p.top],...frente(p.L,p.D-4,12,p.H-6,60,p.fr).map(([g,m])=>[g,m])]},
    isla:{n:'Isla con barra',p:{L:200,D:90,H:90,vol:30,fr:'roble',top:'piedra'},
      g:p=>[[B(-p.L/2,p.L/2,0,10,-p.D/2+p.vol,p.D/2-6),'negro'],[B(-p.L/2,p.L/2,10,p.H-4,-p.D/2+p.vol,p.D/2-2),p.fr],[B(-p.L/2-2,p.L/2+2,p.H-4,p.H,-p.D/2,p.D/2+1),p.top],...frente(p.L,p.D-4,12,p.H-6,60,p.fr)]},
    alacena:{n:'Alacena alta',p:{L:120,D:35,H:70,fr:'blanco'},z:150,
      g:p=>[[B(-p.L/2,p.L/2,0,p.H,-p.D/2,p.D/2-1),p.fr],...frente(p.L,p.D,1,p.H-1,60,p.fr)]},
    columna:{n:'Columna con horno',p:{L:60,D:62,H:220,fr:'blanco'},
      g:p=>[[B(-p.L/2,p.L/2,0,10,-p.D/2,p.D/2-6),'negro'],[B(-p.L/2,p.L/2,10,p.H,-p.D/2,p.D/2-1),p.fr],[B(-p.L/2+3,p.L/2-3,85,145,p.D/2-1,p.D/2+.5),'vidrioN'],[B(-p.L/2+8,p.L/2-8,140,142,p.D/2+.5,p.D/2+2.5),'acero'],[B(-p.L/2,p.L/2,150,150.4,p.D/2-1.1,p.D/2+.05),'junta']]},
    heladera:{n:'Heladera',p:{L:70,D:70,H:190,col:'acero'},
      g:p=>[[B(-p.L/2,p.L/2,2,p.H,-p.D/2,p.D/2-4),p.col],[B(-p.L/2,p.L/2,2,p.H,p.D/2-4,p.D/2),p.col],[B(-p.L/2,p.L/2,p.H*.66,p.H*.66+.5,p.D/2-.1,p.D/2+.1),'junta'],[B(p.L/2-6,p.L/2-4,p.H*.7,p.H*.9,p.D/2,p.D/2+3),'acero'],[B(p.L/2-6,p.L/2-4,p.H*.35,p.H*.6,p.D/2,p.D/2+3),'acero']]},
    bacha:{n:'Bacha con grifería',p:{L:80,D:45},z:90,
      g:p=>[[B(-p.L/2,p.L/2,0,.4,-p.D/2,p.D/2),'acero'],[B(-p.L/2+3,p.L/2-3,.4,.6,-p.D/2+3,p.D/2-3),'negro'],[CYL(1.8,0,30,0,-p.D/2-4,12),'acero'],[B(-1.5,1.5,28,31,-p.D/2-4,-p.D/2+12),'acero']]},
    anafe:{n:'Anafe',p:{L:60,D:52},z:90,
      g:p=>{const g=[[B(-p.L/2,p.L/2,0,.6,-p.D/2,p.D/2),'vidrioN']];for(const [x,z,r] of [[-14,-12,9],[14,-12,7],[-14,12,7],[14,12,9]]){const t=new THREE.TorusGeometry(r,.5,6,24);t.rotateX(Math.PI/2);t.translate(x,.7,z);g.push([t,'grafito']);}return g;}},
    campana:{n:'Campana',p:{L:60,D:50,H:100},z:155,
      g:p=>[[B(-p.L/2,p.L/2,0,6,-p.D/2,p.D/2),'acero'],[B(-13,13,6,p.H,-p.D/2,-p.D/2+26),'acero']]},
    banqueta:{n:'Banqueta alta',p:{H:75},
      g:p=>[[CYL(19,p.H-4,p.H,0,0,24),'roble'],[CYL(2,0,p.H-4,0,0,10),'negro'],[CYL(18,0,1.5,0,0,24),'negro'],[new THREE.TorusGeometry(15,.8,6,24).rotateX(Math.PI/2).translate(0,28,0),'negro']]},
    mesa:{n:'Mesa rectangular',p:{L:180,D:90,H:75,mad:'roble'},
      g:p=>{const g=[[B(-p.L/2,p.L/2,p.H-3,p.H,-p.D/2,p.D/2),p.mad]];for(const sx of [-1,1])for(const sz of [-1,1])g.push([B(sx*(p.L/2-8)-3,sx*(p.L/2-8)+3,0,p.H-3,sz*(p.D/2-8)-3,sz*(p.D/2-8)+3),p.mad]);return g;}},
    mesaR:{n:'Mesa redonda',p:{L:120,H:75,mad:'roble'},
      g:p=>[[CYL(p.L/2,p.H-3,p.H,0,0,40),p.mad],[CYL(5,0,p.H-3,0,0,16),p.mad],[CYL(28,0,2,0,0,32),p.mad]]},
    cama:{n:'Cama',p:{L:160,D:200,tela:'lino'},
      g:p=>[[B(-p.L/2,p.L/2,8,32,-p.D/2+6,p.D/2),'roble'],[B(-p.L/2+2,p.L/2-2,32,56,-p.D/2+8,p.D/2-2),'sabana'],[B(-p.L/2+1,p.L/2-1,50,58,-p.D/2+60,p.D/2),p.tela],
        [B(-p.L/2,p.L/2,0,105,-p.D/2,-p.D/2+6),'roble'],...(p.L>=120?[[B(-p.L/2+8,-4,56,68,-p.D/2+10,-p.D/2+45),'almohada'],[B(4,p.L/2-8,56,68,-p.D/2+10,-p.D/2+45),'almohada']]:[[B(-p.L/2+8,p.L/2-8,56,68,-p.D/2+10,-p.D/2+45),'almohada']]),
        ...[[-1,-1],[1,-1],[-1,1],[1,1]].map(([a,b])=>[B(a*(p.L/2-6)-3,a*(p.L/2-6)+3,0,8,b*(p.D/2-8)-3,b*(p.D/2-8)+3),'madOsc'])]},
    cucheta:{n:'Cucheta (dos camas single)',p:{L:90,D:190,H:165,tela:'petroleo'},g:p=>{const g=[];const W=p.L/2,Dd=p.D/2;for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]])g.push([B(a*(W+2)-3,a*(W+2)+3,0,p.H,b*(Dd)-3,b*(Dd)+3),'roble']);
      for(const y0 of [18,p.H-45]){g.push([B(-W-2,W+2,y0,y0+6,-Dd,Dd),'roble'],[B(-W+1,W-1,y0+6,y0+24,-Dd+2,Dd-2),'sabana'],[B(-W+1,W-1,y0+20,y0+26,-Dd+50,Dd-2),p.tela],[B(-W+8,W-8,y0+24,y0+36,-Dd+6,-Dd+40),'almohada']);}
      for(const a of [-1,1])g.push([B(a*(W+2)-1.5,a*(W+2)+1.5,p.H-20,p.H-16,-Dd,Dd),'roble']);
      /* escalera en un costado, del lado de los pies */for(let z=40;z<p.H-40;z+=28)g.push([B(W+3,W+6,z,z+3,Dd-45,Dd-5),'roble']);g.push([B(W+3,W+6,0,p.H-30,Dd-48,Dd-45),'roble'],[B(W+3,W+6,0,p.H-30,Dd-5,Dd-2),'roble']);return g;}},
    inodoro:{n:'Inodoro suspendido',p:{},g:()=>[[B(-18,18,30,42,-28,22),'loza'],[B(-17,17,42,44,-26,24),'loza'],[B(-22,22,0,110,-36,-28),'blanco'],[B(-9,9,95,104,-28.2,-27.8),'grifo']]},
    bidet:{n:'Bidet suspendido',p:{},g:()=>[[B(-18,18,30,42,-28,22),'loza'],[CYL(1.2,42,48,0,-20,10),'grifo']]},
    vanitorio:{n:'Vanitorio flotante con espejo',p:{L:110,D:50,H:85,fr:'roble',n:1},g:p=>{const g=[[B(-p.L/2,p.L/2,p.H-35,p.H-3,-p.D/2,p.D/2-2),p.fr],[B(-p.L/2,p.L/2,p.H-3,p.H,-p.D/2,p.D/2),'piedra'],[B(-p.L/2,p.L/2,p.H+20,p.H+100,-p.D/2,-p.D/2+1.5),'espejo']];
      const n=p.L>=140?2:1;for(let i=0;i<n;i++){const x=n===1?0:(i?1:-1)*p.L/4;g.push([B(x-22,x+22,p.H-.2,p.H+.3,-p.D/2+12,p.D/2-6),'loza'],[CYL(1.4,p.H,p.H+24,x,-p.D/2+6,12),'grifo'],[B(x-1.2,x+1.2,p.H+22,p.H+25,-p.D/2+6,-p.D/2+18),'grifo']);}return g;}},
    banera:{n:'Bañera',p:{L:160,D:75,H:55},g:p=>[[B(-p.L/2,p.L/2,0,p.H,-p.D/2,p.D/2),'loza'],[B(-p.L/2+8,p.L/2-8,p.H-.3,p.H+.05,-p.D/2+8,p.D/2-8),'piedra'],[CYL(1.5,p.H,p.H+20,-p.L/2+12,-p.D/2+5,12),'grifo']]},
    mesaLuz:{n:'Mesa de luz',p:{L:50,D:40,H:55,fr:'roble'},g:p=>[[B(-p.L/2,p.L/2,8,p.H,-p.D/2,p.D/2),p.fr],[B(-p.L/2+2,p.L/2-2,p.H-16,p.H-15.6,p.D/2-.1,p.D/2+.05),'junta'],...[[-1,-1],[1,-1],[-1,1],[1,1]].map(([a,b])=>[B(a*(p.L/2-3)-1.5,a*(p.L/2-3)+1.5,0,8,b*(p.D/2-3)-1.5,b*(p.D/2-3)+1.5),'madOsc'])]},
    placard:{n:'Placard',p:{L:240,D:60,H:240,fr:'blanco'},g:p=>[[B(-p.L/2,p.L/2,0,p.H,-p.D/2,p.D/2-1),p.fr],...frente(p.L,p.D,2,p.H-2,60,p.fr)]},
    comoda:{n:'Cómoda',p:{L:120,D:50,H:80,fr:'roble'},g:p=>{const g=[[B(-p.L/2,p.L/2,8,p.H,-p.D/2,p.D/2),p.fr]];for(let k=1;k<4;k++){const z=8+(p.H-8)*k/4;g.push([B(-p.L/2+2,p.L/2-2,z-.2,z+.2,p.D/2-.1,p.D/2+.05),'junta']);}for(const a of [-1,1])g.push([B(a*(p.L/2-4)-2,a*(p.L/2-4)+2,0,8,-p.D/2+4,p.D/2-4),'madOsc']);return g;}},
    aparador:{n:'Aparador',p:{L:200,D:45,H:80,fr:'roble'},g:p=>[[B(-p.L/2,p.L/2,15,p.H,-p.D/2,p.D/2),p.fr],...frente(p.L,p.D,17,p.H-2,50,p.fr),...[[-1,-1],[1,-1],[-1,1],[1,1]].map(([a,b])=>[B(a*(p.L/2-5)-2,a*(p.L/2-5)+2,0,15,b*(p.D/2-5)-2,b*(p.D/2-5)+2),'negro'])]},
    escritorio:{n:'Escritorio',p:{L:140,D:65,H:75,mad:'roble'},g:p=>[[B(-p.L/2,p.L/2,p.H-3,p.H,-p.D/2,p.D/2),p.mad],[B(-p.L/2,-p.L/2+3,0,p.H-3,-p.D/2,p.D/2),p.mad],[B(p.L/2-3,p.L/2,0,p.H-3,-p.D/2,p.D/2),p.mad],[B(-p.L/2+3,p.L/2-3,p.H-30,p.H-3,-p.D/2,-p.D/2+2),p.mad]]},
    biblioteca:{n:'Biblioteca',p:{L:180,D:35,H:200,mad:'roble'},g:p=>{const g=[[B(-p.L/2,-p.L/2+2.5,0,p.H,-p.D/2,p.D/2),p.mad],[B(p.L/2-2.5,p.L/2,0,p.H,-p.D/2,p.D/2),p.mad],[B(-p.L/2,p.L/2,0,p.H,-p.D/2,-p.D/2+1),p.mad]];for(let z=0;z<=p.H;z+=p.H/5)g.push([B(-p.L/2+2.5,p.L/2-2.5,Math.min(z,p.H-2.5),Math.min(z,p.H-2.5)+2.5,-p.D/2,p.D/2),p.mad]);return g;}},
    sofa:{n:'Sofá',p:{L:220,D:95,H:80,tela:'lino'},g:p=>{const g=[[B(-p.L/2,p.L/2,10,42,-p.D/2,p.D/2),p.tela],[B(-p.L/2,p.L/2,10,p.H,-p.D/2,-p.D/2+22),p.tela],[B(-p.L/2,-p.L/2+18,10,62,-p.D/2,p.D/2),p.tela],[B(p.L/2-18,p.L/2,10,62,-p.D/2,p.D/2),p.tela]];
      const n=Math.max(1,Math.round((p.L-36)/75));for(let i=0;i<n;i++){const x0=-p.L/2+18+(p.L-36)*i/n,x1=-p.L/2+18+(p.L-36)*(i+1)/n;g.push([B(x0+.5,x1-.5,42,52,-p.D/2+22,p.D/2-2),p.tela]);}
      for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]])g.push([B(a*(p.L/2-6)-2,a*(p.L/2-6)+2,0,10,b*(p.D/2-6)-2,b*(p.D/2-6)+2),'negro']);return g;}},
    butaca:{n:'Butaca',p:{L:80,D:85,H:78,tela:'mostaza'},g:p=>[[B(-p.L/2,p.L/2,12,42,-p.D/2,p.D/2),p.tela],[B(-p.L/2,p.L/2,12,p.H,-p.D/2,-p.D/2+18),p.tela],[B(-p.L/2,-p.L/2+12,12,60,-p.D/2,p.D/2),p.tela],[B(p.L/2-12,p.L/2,12,60,-p.D/2,p.D/2),p.tela],[B(-p.L/2+12,p.L/2-12,42,50,-p.D/2+18,p.D/2-2),p.tela],...[[-1,-1],[1,-1],[-1,1],[1,1]].map(([a,b])=>[B(a*(p.L/2-6)-2,a*(p.L/2-6)+2,0,12,b*(p.D/2-6)-2,b*(p.D/2-6)+2),'roble'])]},
    ratona:{n:'Mesa ratona',p:{L:120,D:60,H:40,mad:'roble'},g:p=>{const g=[[B(-p.L/2,p.L/2,p.H-4,p.H,-p.D/2,p.D/2),p.mad]];for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]])g.push([B(a*(p.L/2-6)-2.5,a*(p.L/2-6)+2.5,0,p.H-4,b*(p.D/2-6)-2.5,b*(p.D/2-6)+2.5),p.mad]);return g;}},
    alfombra:{n:'Alfombra',p:{L:300,D:200},g:p=>[[B(-p.L/2,p.L/2,0,1,-p.D/2,p.D/2),'alfombra']]},
    reposera:{n:'Reposera',p:{L:65,D:190},g:p=>{const g=[[B(-p.L/2,p.L/2,28,32,-p.D/2+60,p.D/2),'roble']];const t=new THREE.BoxGeometry(p.L,4,70);t.translate(0,0,-35);t.rotateX(-0.75);t.translate(0,32,-p.D/2+60);g.push([t,'roble']);for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]])g.push([B(a*(p.L/2-4)-2,a*(p.L/2-4)+2,0,28,b*(p.D/2-25)-2,b*(p.D/2-25)+2),'roble']);return g;}},
    banco:{n:'Banco',p:{L:180,D:38,H:45,mad:'roble'},g:p=>[[B(-p.L/2,p.L/2,p.H-5,p.H,-p.D/2,p.D/2),p.mad],[B(-p.L/2+10,-p.L/2+15,0,p.H-5,-p.D/2+3,p.D/2-3),p.mad],[B(p.L/2-15,p.L/2-10,0,p.H-5,-p.D/2+3,p.D/2-3),p.mad]]},
    silla:{n:'Silla',p:{mad:'roble'},
      g:p=>{const g=[[B(-22,22,43,46,-22,22),p.mad],[B(-22,22,46,86,-22,-19),p.mad]];for(const sx of [-1,1])for(const sz of [-1,1])g.push([B(sx*19-1.5,sx*19+1.5,0,43,sz*19-1.5,sz*19+1.5),p.mad]);return g;}},
  };
  /* catálogo de muebles refinado (motor/muebles.js, Maxi 15/10): reemplaza las piezas en bloque con las mismas claves y parámetros; lo que no está ahí queda como estaba */
  for(const [k,v] of Object.entries(MATERIALES))if(!MAT[k]||k==='grifo')MAT[k]=M(v[0],{r:v[1],m:v[2]||0,...(v[3]?{x:{emissive:new THREE.Color(v[3]),emissiveIntensity:1.2}}:{})});
  Object.assign(CAT,catalogoMuebles(THREE));

  /* ---------- ambientes y escenarios de partida ---------- */
  const R90=90;/* contra M-20 (cara interior x 1834,5), frente hacia el este */
  const xw=d=>1834.5+d/2;
  let uid=1;const it=(t,x,y,r,p={},z)=>({id:'m'+(uid++),t,x,y,r,p,...(z!=null?{z}:{})});
  const itA=a=>{let n=1;return (t,x,y,r,p={},z)=>({id:a+'_'+(n++),t,x:Math.round(x),y:Math.round(y),r,p,...(z!=null?{z}:{})});};
  const H_EP=262;/* cara superior del piso del entrepiso */
  const AMB={
    cocina:{n:'Cocina',vista:{p:[2330,430,240],t:[1935,60,-280]},esc:()=>({
      A:{nombre:'Como está + isla',items:[/* Maxi 15/10: heladera contra el metro de pared al sur de la arcada (de espaldas a M-26); mesada a lo largo de la pared sur; isla adosada a la punta este de la mesada, grande, con las hornallas y banquetas del lado este. Las calderas van al sucucho del oeste (capa Calor). */
        it('heladera',1869.5,-299.5,0,{L:65,D:65,H:190,col:'rojo'}),it('mesada',xw(62),-81,R90,{L:362,D:62,fr:'verde',top:'granito'}),it('isla',2027,45,180,{L:260,D:110,vol:30,fr:'verde',top:'granito'}),it('anafe',2015,30,180,{L:75,D:52}),
        it('banqueta',1955,122,0),it('banqueta',2015,122,0),it('banqueta',2075,122,0),it('banqueta',2135,122,0)]},
      B:{nombre:'Lineal + isla',items:[it('heladera',xw(70),-560,R90,{L:70,D:70}),it('columna',xw(62),-495,R90,{L:60}),it('mesada',xw(62),-237.5,R90,{L:455,fr:'blanco',top:'granito'}),
        it('bacha',xw(62)+2,-242,R90,{L:80}),it('anafe',xw(62)+4,-400,R90,{L:60}),it('campana',xw(50),-400,R90,{L:60}),it('alacena',xw(35),-395,R90,{L:130},150),
        it('isla',2165,-175,-90,{L:200,D:95,vol:30,fr:'roble',top:'piedra'}),it('banqueta',2232,-240,0),it('banqueta',2232,-175,0),it('banqueta',2232,-110,0)]},
      C:{nombre:'Lineal + mesa de comer',items:[it('heladera',xw(70),-640,R90,{L:70,D:70}),it('columna',xw(62),-705,R90,{L:60}),it('mesada',xw(62),-292.5,R90,{L:555,fr:'grafito',top:'piedra'}),
        it('bacha',xw(62)+2,-242,R90,{L:80}),it('anafe',xw(62)+4,-470,R90,{L:60}),it('campana',xw(50),-470,R90,{L:60}),it('alacena',xw(35),-455,R90,{L:200},150),
        it('mesaR',2200,-170,0,{L:120}),it('silla',2200,-250,0),it('silla',2200,-90,180),it('silla',2120,-170,90),it('silla',2280,-170,-90)]},
    }),ocultar:['MES-1','HEL-1'],piso:PISO},
    living:{n:'Living',piso:PISO,vista:{p:[1650,520,1250],t:[1640,60,330]},esc:()=>{const I=itA('living');return {
      A:{nombre:'Frente al hogar',items:[I('alfombra',1640,300,0,{L:320,D:240}),I('sofa',1640,455,180,{L:240,D:95,tela:'lino'}),I('butaca',1465,280,90,{tela:'mostaza'}),I('butaca',1815,280,-90,{tela:'mostaza'}),I('ratona',1640,290,0,{L:120,D:60})]},
      B:{nombre:'Sofás enfrentados',items:[I('alfombra',1640,360,90,{L:300,D:220}),I('sofa',1480,360,90,{L:220,D:95,tela:'petroleo'}),I('sofa',1800,360,-90,{L:220,D:95,tela:'petroleo'}),I('ratona',1640,360,90,{L:110,D:60}),I('butaca',1640,560,180,{tela:'lino'})]},
      C:{nombre:'Mirando al jardín',items:[I('alfombra',1660,690,0,{L:340,D:220}),I('sofa',1660,600,0,{L:260,D:95,tela:'lino'}),I('ratona',1660,740,0,{L:130,D:60}),I('butaca',1460,760,90,{tela:'petroleo'}),I('butaca',1860,760,-90,{tela:'petroleo'}),I('butaca',1700,180,180,{tela:'mostaza'})]},
      D:{nombre:'Bajo y cálido (referencias)',items:[I('alfombraYute',1640,320,0,{L:300,D:220}),I('sofaPlat',1640,475,180,{L:280,D:100,tela:'lino',mad:'roble'}),I('ratonaTab',1640,310,0,{L:150,D:80,H:36}),I('taburete',1450,300,0),I('taburete',1830,300,0)]}};}},
    comedor:{n:'Comedor',piso:PISO,vista:{p:[2250,480,1150],t:[2250,60,380]},esc:()=>{const I=itA('comedor');const sillasRect=(cx,cy,L,D,n)=>{const r=[];for(let i=0;i<n;i++){const yy=cy-L/2+L*(i+.5)/n;r.push(I('silla',cx-D/2-22,yy,90),I('silla',cx+D/2+22,yy,-90));}r.push(I('silla',cx,cy-L/2-22,0),I('silla',cx,cy+L/2+22,180));return r;};
      const ronda=(cx,cy,R,n)=>[...Array(n)].map((_,i)=>{const a=i/n*Math.PI*2;return I('silla',cx+Math.sin(a)*R,cy+Math.cos(a)*R,Math.round((a*180/Math.PI+180)%360));});return {
      A:{nombre:'Mesa larga',items:[I('mesa',2250,430,90,{L:240,D:100}),...sillasRect(2250,430,240,100,3),I('aparador',2445,68,0,{L:150,D:45})]},
      B:{nombre:'Mesa redonda',items:[I('mesaR',2250,420,0,{L:140}),...ronda(2250,420,95,6),I('aparador',2445,68,0,{L:150,D:45})]},
      C:{nombre:'Mesa maciza (referencias)',items:[I('mesaMaciza',2250,430,90,{L:240,D:95}),...sillasRect(2250,430,240,95,3).map(s=>({...s,t:'sillaCurva',p:{}})),I('aparador',2445,68,0,{L:150,D:45})]}};}},
    galeria:{n:'Galería (quincho)',piso:PISO,vista:{p:[3250,500,1350],t:[2746,60,500]},esc:()=>{const I=itA('galeria');const S=[];for(let i=0;i<4;i++){const yy=450-130+260*(i+.5)/4;S.push(I('silla',2746-50-22,yy,90),I('silla',2746+50+22,yy,-90));}return {
      A:{nombre:'Comedor afuera',items:[I('mesa',2746,450,90,{L:260,D:100}),...S,I('silla',2746,450-130-22,0),I('silla',2746,450+130+22,180)]},
      B:{nombre:'Estar afuera',items:[I('sofa',2746,250,0,{L:240,D:95,tela:'petroleo'}),I('butaca',2600,420,90,{tela:'lino'}),I('butaca',2892,420,-90,{tela:'lino'}),I('ratona',2746,410,0,{L:120,D:60}),I('reposera',2650,780,90),I('reposera',2650,870,90)]},
      C:{nombre:'Mesa + estar',items:[I('mesa',2746,700,90,{L:200,D:95}),I('banco',2746-48-25,700,90,{L:180}),I('banco',2746+48+25,700,-90,{L:180}),I('sofa',2746,200,0,{L:220,D:95,tela:'lino'}),I('ratona',2746,330,0,{L:110,D:55})]}};}},
    dorm1:{n:'Dormitorio 1 (PB)',piso:PISO,vista:{p:[210,520,1000],t:[210,40,360]},esc:()=>{const I=itA('dorm1');return {
      A:{nombre:'Cama contra el patio',items:[I('cama',210,143,0,{L:160,D:200}),I('mesaLuz',102,65,0),I('mesaLuz',318,65,0),I('placard',355,520,-90,{L:300,D:60}),I('escritorio',100,640,180,{L:120,D:60}),I('silla',100,585,0)]},
      B:{nombre:'Cama mirando al jardín',items:[I('cama',285,500,-90,{L:160,D:200}),I('mesaLuz',362,388,-90),I('mesaLuz',362,612,-90),I('placard',200,73,0,{L:300,D:60}),I('butaca',100,580,45,{tela:'petroleo'})]}};}},
    dorm2:{n:'Dormitorio 2 (PB)',piso:PISO,vista:{p:[860,520,1050],t:[860,40,500]},esc:()=>{const I=itA('dorm2');return {
      A:{nombre:'Matrimonial + escritorio',items:[I('cama',500,513,90,{L:160,D:200}),I('mesaLuz',425,395,90),I('mesaLuz',425,631,90),I('placard',580,385,0,{L:300,D:60}),I('escritorio',1100,570,180,{L:150,D:60}),I('silla',1100,515,0),I('butaca',1250,450,-90,{tela:'mostaza'})]},
      B:{nombre:'Dos camas + estar',items:[I('cama',495,430,90,{L:90,D:190}),I('cama',495,590,90,{L:90,D:190}),I('mesaLuz',425,510,90,{L:40}),I('placard',580,385,0,{L:300,D:60}),I('sofa',1150,555,180,{L:180,D:85,tela:'petroleo'}),I('ratona',1150,465,0,{L:100,D:50})]}};}},
    dorm3:{n:'Dormitorio 3 (ala)',piso:PISO,vista:{p:[2250,480,-250],t:[2200,40,-640]},esc:()=>{const I=itA('dorm3');return {
      A:{nombre:'Matrimonial',items:[I('cama',2230,-662,0,{L:140,D:190}),I('mesaLuz',2132,-737,0,{L:45}),I('mesaLuz',2328,-737,0,{L:45}),I('placard',2072,-680,90,{L:150,D:60})]},
      B:{nombre:'Simple + escritorio',items:[I('cama',2270,-700,-90,{L:90,D:190}),I('escritorio',2075,-680,90,{L:120,D:60}),I('silla',2130,-680,-90)]}};}},
    dormS:{n:'Dormitorio secundario (EP)',nivel:'EP',piso:H_EP,vista:{p:[220,640,980],t:[215,300,360]},esc:()=>{const I=itA('dormS');return {
      A:{nombre:'Cama a la pared del fondo',items:[I('cama',130,357,90,{L:140,D:190}),I('mesaLuz',58,257,90,{L:40}),I('mesaLuz',58,457,90,{L:40}),I('escritorio',363,600,-90,{L:120,D:60}),I('silla',310,600,90)]},
      B:{nombre:'Cama mirando al patio',items:[I('cama',215,590,180,{L:140,D:190}),I('mesaLuz',117,665,180,{L:40}),I('mesaLuz',313,665,180,{L:40}),I('comoda',368,250,-90,{L:120,D:50}),I('butaca',100,160,135,{tela:'lino'})]}};}},
    dormP:{n:'Dormitorio principal (EP)',nivel:'EP',piso:H_EP,vista:{p:[800,680,1000],t:[800,300,360]},esc:()=>{const I=itA('dormP');return {
      A:{nombre:'Cama a M-41',items:[I('cama',675,360,90,{L:180,D:200}),I('mesaLuz',600,242,90),I('mesaLuz',600,478,90),I('comoda',900,57,0,{L:140,D:50}),I('butaca',940,580,-135,{tela:'mostaza'})]},
      B:{nombre:'Cama al pasillo',items:[I('cama',800,127,0,{L:180,D:200}),I('mesaLuz',682,50,0),I('mesaLuz',918,50,0),I('escritorio',605,620,90,{L:120,D:60}),I('silla',660,620,-90),I('butaca',960,500,-90,{tela:'lino'})]}};}},
    banoEP:{n:'Baño + vestidor (EP, L-26)',nivel:'EP',piso:H_EP,vista:{p:[485,435,40],t:[485,330,520]},esc:()=>{const I=itA('banoEP');return {
      /* L-26: 1,60 libre entre M-40 (x 4,00) y M-41 (x 5,70), 6,65 de largo. Alto libre: 2,24 junto al pasillo, 2,43 en la cumbrera (y 3,40),
         2,05 en y 4,50, 1,57 en y 5,60, 1,06 contra la fachada; sobre x 5,06–5,65 entre y 4,23 y 7,41 está la lucarna LU-2 (alto de sobra).
         Lo que exige estar parado va en el tramo alto o bajo la lucarna; la bañera (se usa acostado) al fondo bajo el techo, frente a la ventana baja VE-2. */
      A:{nombre:'Vestidor + baño con bañera bajo el techo',items:[I('placard',435,160,90,{L:260,D:60,H:215}),I('biblioteca',550,200,-90,{L:180,D:30,H:200}),
        I('vanitorio',430,385,90,{L:110,D:50}),I('inodoro',433,485,90),I('ducha',527,495,-90,{L:75,D:110,H:200}),I('banera',486,645,180,{L:156,D:75})]},
      B:{nombre:'Baño grande, vanitorio doble (sin vestidor)',items:[I('vanitorio',430,200,90,{L:160,D:50}),I('inodoro',433,330,90),I('bidet',433,400,90),I('ducha',527,500,-90,{L:75,D:150,H:200}),I('banera',486,645,180,{L:156,D:75}),I('biblioteca',550,200,-90,{L:120,D:30,H:180})]},
      C:{nombre:'Vestidor grande + baño compacto',items:[I('placard',435,200,90,{L:340,D:60,H:215}),I('biblioteca',550,240,-90,{L:260,D:30,H:200}),I('vanitorio',430,425,90,{L:80,D:45}),I('inodoro',433,515,90),I('ducha',527,500,-90,{L:75,D:110,H:200}),I('banco',486,650,0,{L:150,D:38,H:40})]}};}},
    estudio:{n:'Estudio (EP)',nivel:'EP',piso:H_EP,vista:{p:[1750,620,760],t:[1200,330,300]},esc:()=>{const I=itA('estudio');return {
      /* L-27, entre la corrediza M-43 (x 10,27) y el balcón al living (x 14,42); el hueco de la escalera ocupa x 13,18–14,42, y 4,11–6,25. Maxi 14/10: es un escritorio. Pasando x 13,22 el techo del living (T-03) baja a menos de 1 m: el escritorio va antes */
      A:{nombre:'Escritorio mirando al living',items:[I('escritorio',1280,190,-90,{L:180,D:70}),I('silla',1215,190,90),I('biblioteca',1180,42,0,{L:220,D:32,H:80}),I('butaca',1110,520,45,{tela:'mostaza'}),I('ratona',1190,560,0,{L:50,D:50,H:45}),I('alfombra',1180,300,0,{L:200,D:260})]},
      B:{nombre:'Dos puestos enfrentados',items:[I('escritorio',1230,190,0,{L:160,D:70}),I('escritorio',1230,260,180,{L:160,D:70}),I('silla',1230,130,0),I('silla',1230,320,180),I('biblioteca',1180,42,0,{L:220,D:32,H:80}),I('butaca',1250,520,180,{tela:'petroleo'})]},
      C:{nombre:'Escritorio largo mirando al living',items:[I('escritorio',1285,215,-90,{L:300,D:60}),I('silla',1225,140,90),I('silla',1225,290,90),I('biblioteca',1180,42,0,{L:220,D:32,H:80}),I('sofa',1170,540,0,{L:180,D:85,tela:'lino'})]}};}},
    altillo:{n:'Altillo (EP)',nivel:'EP',piso:H_EP,vista:{p:[2550,700,-300],t:[2100,300,-560]},esc:()=>{const I=itA('altillo');return {
      /* el techo baja hacia x 1835 y x 2365 (cumbrera en x ≈ 2103, sobre P-34): alto libre: 2,25 en la cumbrera, 1,60 a 1 m de ella, bajo los cabios 0,49 a 30 cm de la pared, así que los pies quedan a 0,72 de la pared (Maxi 14/10: tocaban los cabios); las camas van de través con la cabecera hacia el centro (la cabeza bajo lo alto, los pies hacia el alero; Maxi 14/10) y la cucheta (1,65) sólo entra bajo la cumbrera, a lo largo (Maxi 14/10: cuarto de chicos; queen como opción) */
      A:{nombre:'Cuatro camas single, cabeceras al centro',items:[I('cama',1980,-690,-90,{L:90,D:190}),I('cama',1980,-480,-90,{L:90,D:190}),I('cama',2226,-690,90,{L:90,D:190}),I('cama',2226,-480,90,{L:90,D:190}),I('alfombra',2103,-560,90,{L:240,D:110}),I('comoda',2103,-730,0,{L:100,D:45})]},
      C:{nombre:'Cucheta bajo la cumbrera + dos single + juego',items:[I('cucheta',2103,-662,0,{L:90,D:190}),I('cama',1980,-700,-90,{L:90,D:190}),I('cama',2226,-700,90,{L:90,D:190}),I('alfombra',2103,-450,0,{L:220,D:150}),I('banco',1900,-440,90,{L:150,D:38,H:40}),I('biblioteca',2310,-440,-90,{L:150,D:30,H:80})]},
      J:{nombre:'Seis camas single (tres por lado)',items:[I('cama',1980,-705,-90,{L:90,D:190}),I('cama',1980,-597,-90,{L:90,D:190}),I('cama',1980,-489,-90,{L:90,D:190}),I('cama',2226,-705,90,{L:90,D:190}),I('cama',2226,-597,90,{L:90,D:190}),I('cama',2226,-489,90,{L:90,D:190})]},
      Q:{nombre:'Cama queen',items:[I('cama',2103,-657,0,{L:160,D:200}),I('mesaLuz',1993,-737,0),I('mesaLuz',2213,-737,0),I('comoda',2300,-450,-90,{L:120,D:50,H:60})]},
      B:{nombre:'Dos camas',items:[I('cama',1960,-662,0,{L:90,D:190}),I('cama',2240,-662,0,{L:90,D:190}),I('mesaLuz',2100,-737,0,{L:45}),I('comoda',1906,-500,90,{L:120,D:50,H:60})]}};}},
  };
  AMB.exterior={n:'Exterior (jardín y pileta)',piso:0,vista:{p:[3350,900,2300],t:[3000,0,600]},esc:()=>{const I=itA('exterior');return {A:{nombre:'Reposeras en el deck',items:[...[480,580,760,860,1040,1140].map(y=>I('reposera',3640,y,90)),I('reposera',3560,1340,90,{},25),I('reposera',3560,1440,90,{},25),I('ratona',3640,670,0,{L:50,D:50,H:40}),I('ratona',3640,950,0,{L:50,D:50,H:40})]},B:{nombre:'Sin muebles',items:[]}};}};
  const AMB_ORDEN=['cocina','comedor','living','galeria','dorm1','dorm2','dorm3','dormS','dormP','banoEP','estudio','altillo','exterior'];
  /* ---------- capas: muebles y luces, cada una con sus escenarios por ambiente ---------- */
  const CL=catalogoLuces(THREE,B,CYL);
  /* plantas (Maxi 14/10): tres capas que se prenden y apagan por separado (bajas, medias, árboles); se mueven como los muebles */
  const ESP_A=['Oak Large','Oak Medium','Ash Large','Ash Medium','Aspen Medium'],ESP_B=['Bush 1','Bush 2','Bush 3'],SEM=[1,2,3,4];
  const CV={bajo:{n:'Planta baja / cubresuelo',capaV:'bajo',p:{esp:'Bush 3',alto:55,seed:1},ui:[['esp','especie',ESP_B],['alto','alto','num'],['seed','variante',SEM]]},
    arbusto:{n:'Arbusto',capaV:'medio',p:{esp:'Bush 1',alto:180,seed:1},ui:[['esp','especie',ESP_B],['alto','alto','num'],['seed','variante',SEM]]},
    arbol:{n:'Árbol',capaV:'arbol',p:{esp:'Oak Medium',alto:1000,seed:1},ui:[['esp','especie',ESP_A],['alto','alto','num'],['seed','variante',SEM]]}};
  function escVeg(){const I=itA('V');const it=[I('arbol',2924,37,34,{esp:'Oak Large',alto:1600,seed:3})];
    /* filas de árboles del fondo y del sur (antes ARB-1 / ARB-2), con arbustos entre medio */
    const fila=(a,b,n,nb)=>{const P=[['Ash Large',1],['Oak Medium',2],['Ash Medium',3],['Oak Medium',4]];for(let i=0;i<n;i++){const t=(i+.5)/n,x=a[0]+(b[0]-a[0])*t+((i*37)%11-5)*20,y=a[1]+(b[1]-a[1])*t+((i*53)%13-6)*25;const [pr,sd]=P[(i*5)%4];it.push(I('arbol',x,y,Math.round((i*137)%360),{esp:pr,seed:sd,alto:1000+((i*7)%9)*70}));}
      for(let i=0;i<nb;i++){const t=(i+.5)/nb,k=((i*104729)%89)/89;it.push(I('arbusto',a[0]+(b[0]-a[0])*t+(k-.5)*200,a[1]+(b[1]-a[1])*t+(k-.5)*200,(i*97)%360,{esp:ESP_B[i%3],seed:1+i%3,alto:130+Math.round(((i*7919)%97)/97*120)}));}};
    fila([-900,-2950],[4200,-2850],14,22);fila([-3150,-3000],[-3150,3600],14,26);
    /* jardín: árboles sueltos */
    for(const [x,y,e,s,h] of [[-1600,1600,'Ash Large',1,1300],[-700,2700,'Oak Large',2,1500],[300,3200,'Aspen Medium',3,1100],[1300,2700,'Oak Medium',4,1150],[2400,3300,'Ash Medium',2,1050],[3300,2600,'Aspen Medium',1,1000],[4300,3200,'Oak Medium',3,1200],[-2500,400,'Ash Medium',4,1100],[-2700,2300,'Oak Medium',1,1250]])it.push(I('arbol',x,y,(x*7)%360,{esp:e,seed:s,alto:h}));
    /* arbustos contra la fachada del jardín (entre puertas) y matas bajas al borde del deck */
    for(const x of [60,160,450,550,850,940])it.push(I('arbusto',x,790,(x*3)%360,{esp:x%3?'Bush 1':'Bush 2',seed:1+x%4,alto:150+(x%5)*12}));
    for(let x=1400;x<=2500;x+=110)it.push(I('bajo',x,1195,(x*5)%360,{esp:'Bush 3',seed:1+(x/110)%4,alto:45+(x%3)*8}));
    for(let y=300;y<=1700;y+=130)it.push(I('bajo',4600,y,(y*3)%360,{esp:'Bush 2',seed:1+(y/130)%4,alto:60}));
    return {A:{nombre:'Jardín',items:it},B:{nombre:'Sin plantas',items:[]}};}
  const CCAL=catalogoCal(THREE,B,CYL);
  const CAPA={mue:{CAT,col:'equipamiento',esc:a=>AMB[a].esc()},luz:{CAT:CL,col:'iluminacion',esc:a=>escLuces(a,itA('L'+a))},veg:{CAT:CV,col:'vegetacion',esc:a=>a==='exterior'?escVeg():{A:{nombre:'Sin plantas',items:[]}}},cal:{CAT:CCAL,col:'calefaccion',esc:a=>escCal(a,itA('C'+a))}};
  let vegCapas={bajo:true,medio:true,arbol:true};try{Object.assign(vegCapas,JSON.parse(localStorage.getItem('carhue-veg-capas')||'{}'));}catch(e){}
  const catOf=(t,k)=>CAPA[k].CAT[t];
  const NOMBRE=(t,k='mue')=>catOf(t,k)?.n||t;

  /* ---------- estado: ST[capa][ambiente] = {activo, esc:{id:{nombre,items}}, borrados}; base del artifact ---------- */
  const ST={mue:{},luz:{},veg:{},cal:{}};for(const k in ST)for(const a of AMB_ORDEN)ST[k][a]={activo:'A',esc:CAPA[k].esc(a),borrados:[]};
  const GV=new THREE.Group();GV.name='vegetacion';scene.add(GV);
  let capa='mue',modo='',amb='cocina',sel=null,db=null,dr=null;const saveT={},dirty={};
  try{const c=localStorage.getItem('carhue-equip-capa');if(c==='luz'||c==='veg'||c==='cal')capa=c;}catch(e){}if(capa==='veg')amb='exterior';
  const lsPanel=()=>{try{return localStorage.getItem('carhue-equip-panel')==='1';}catch(e){return false;}};
  function cur(){return ST[capa][amb].esc[ST[capa][amb].activo];}
  function guardar(a=amb,k=capa){const key=k+a;dirty[key]=true;clearTimeout(saveT[key]);saveT[key]=setTimeout(async()=>{if(!db){dirty[key]=false;return;}const s=ST[k][a];
    try{await db.collection(CAPA[k].col).doc(a).set({activo:s.activo,esc:s.esc,borrados:s.borrados||[],migr:s.migr||[],ts:new Date().toISOString()});}catch(e){hint('No se pudo guardar: '+(e.message||e));}dirty[key]=false;},700);}
  /* agregados posteriores (Maxi 14/10): se suman una vez al escenario activo guardado, para que aparezcan aunque ya hubiera algo guardado */
  const MIG={luz:{exterior:[['reflectores200',()=>[{t:'reflector',x:2955,y:480,r:90,p:{tilt:12,beam:60}},{t:'reflector',x:2746,y:946,r:0,p:{tilt:15,beam:90}}]],['reflectoresDorm',()=>[{t:'reflector',x:22,y:732,r:20,p:{tilt:22,beam:90,z:318}},{t:'reflector',x:972,y:732,r:-20,p:{tilt:22,beam:90,z:318}}]]],
    living:[['galponeras',()=>[{t:'galponera',x:1540,y:352,r:0,p:{}},{t:'galponera',x:1740,y:352,r:0,p:{}}]]]}};
  const MUT_CAL=[['salExistente',items=>{for(let i=items.length-1;i>=0;i--){const m=items[i];if(m.t==='salamandra'&&Math.hypot(m.x-1960,m.y-600)<150)items.splice(i,1);}if(!items.some(m=>m.t==='salExist'))items.unshift({id:'Csal'+Date.now().toString(36),t:'salExist',x:2043,y:638,r:0,p:{}});}]];/* Maxi 14/10: la salamandra ya existe (SAL-1); la diseñada queda en el catálogo */
  const MUT_MUE={cocina:[['islaAdosada',items=>{const A=items.some(m=>m.t==='desayunador');if(!A)return;for(let i=items.length-1;i>=0;i--){const m=items[i];if(m.t==='desayunador'||(m.t==='banqueta'&&Math.abs(m.y-122)<3))items.splice(i,1);}
      const h=items.find(m=>m.t==='heladera');if(h){h.x=1869.5;h.y=-299.5;h.r=0;}const me=items.find(m=>m.t==='mesada');if(me){me.y=-81;me.p={...me.p,L:362};}const id=()=>'misla'+Math.random().toString(36).slice(2,8);
      items.push({id:id(),t:'isla',x:2027,y:45,r:180,p:{L:260,D:110,vol:30,fr:'verde',top:'granito'}},{id:id(),t:'anafe',x:2015,y:30,r:180,p:{L:75,D:52}},...[1955,2015,2075,2135].map(x=>({id:id(),t:'banqueta',x,y:122,r:0,p:{}})));}],['desayunador',items=>{/* la versión «como está» guardada: misma reubicación que en fábrica */const h=items.find(m=>m.t==='heladera'&&Math.abs(m.y+301.5)<5),me=items.find(m=>m.t==='mesada'&&Math.abs(m.y+83)<5&&(m.p?.L??0)===366);if(!h||!me)return;h.y=-207;me.y=-36;me.p={...me.p,L:272};
      if(!items.some(m=>m.t==='desayunador')){const id=()=>'mdes'+Math.random().toString(36).slice(2,8);items.push({id:id(),t:'desayunador',x:1972,y:75,r:0,p:{L:150,D:50}},{id:id(),t:'banqueta',x:1930,y:122,r:0,p:{}},{id:id(),t:'banqueta',x:1985,y:122,r:0,p:{}},{id:id(),t:'banqueta',x:2040,y:122,r:0,p:{}});}}]],altillo:[['comodasBajas',items=>{for(const m of items)if(m.t==='comoda'){if(Math.abs(m.x-2340)<6){m.x=2300;m.p={...(m.p||{}),H:60};}else if(Math.abs(m.x-1862)<6){m.x=1906;m.p={...(m.p||{}),H:60};}}}],['camasCentro',items=>{for(const m of items)if(m.t==='cama'&&(m.r===-90||m.r===90||m.r===270)){if(Math.abs(m.x-1955)<6)m.x=1980;else if(Math.abs(m.x-2251)<6)m.x=2226;}}]],
    estudio:[['escritorioBajoAlto',items=>{for(const m of items){if(m.t==='escritorio'&&Math.abs(m.x-1370)<6)m.x=1280;else if(m.t==='escritorio'&&Math.abs(m.x-1395)<6)m.x=1285;else if(m.t==='silla'&&Math.abs(m.x-1305)<6)m.x=1215;else if(m.t==='silla'&&Math.abs(m.x-1340)<6)m.x=1225;}}]]};
  const MUT={mue:MUT_MUE,cal:{living:MUT_CAL,cocina:[['calderas33',items=>{for(const m of items)if(m.t==='caldera'){m.p={...(m.p||{}),kW:38.4};}}],['calderasSucucho',items=>{/* Maxi 15/10: van al sucucho del extremo oeste (L-09), en la pared sur */for(const m of items)if(m.t==='caldera'&&Math.abs(m.x-1852)<5){if(Math.abs(m.y+310)<5)m.y=-730;else if(Math.abs(m.y+264)<5)m.y=-684;}}],['calderasSur',items=>{/* Maxi 15/10: van contra la pared sur, donde estaba la heladera */for(const m of items)if(m.t==='caldera'&&Math.abs(m.x-2015)<5){if(Math.abs(m.y+560)<5){m.x=1852;m.y=-310;m.r=90;}else if(Math.abs(m.y+505)<5){m.x=1852;m.y=-264;m.r=90;}}}]]},/* Maxi 14/10: calderas de 33.000 kcal/h */luz:{dormP:[['pieBajoAlto',items=>{for(const m of items)if(m.t==='pie'&&Math.abs(m.x-940)<6&&Math.abs(m.y-620)<6){m.x=990;m.y=455;}}]],estudio:[['linealBajoAlto',items=>{for(const m of items){if(m.t==='linea'&&Math.abs(m.x-1370)<6)m.x=1280;if(m.t==='velador'&&Math.abs(m.x-1400)<6&&Math.abs(m.y-110)<6){m.x=1290;m.y=115;}}}]],exterior:[['reflEsquinaSur',items=>{/* con el dormer corrido la ventana empieza en x 0,50: el reflector va en la esquina maciza */for(const m of items)if(m.t==='reflector'&&Math.abs(m.y-732)<30&&Math.abs(m.x-45)<15)m.x=22;}],['reflBajoTecho',items=>{for(const m of items){if(m.t!=='reflector')continue;if(Math.abs(m.x-2945)<30&&Math.abs(m.y-352)<30&&(m.p?.z??0)>480)m.p={...m.p,z:478};if(Math.abs(m.x-2746)<30&&Math.abs(m.y-946)<30&&((m.p?.z)??280)>222)m.p={...(m.p||{}),z:222};}}],['reflBajoAlero',items=>{for(const m of items)if(m.t==='reflector'&&Math.abs(m.y-732)<30&&(Math.abs(m.x-45)<40||Math.abs(m.x-972)<40)){m.p={...(m.p||{}),z:318};}}],['reflAleroPuntas',items=>{for(const m of items)if(m.t==='reflector'&&Math.abs(m.y-732)<30){if(Math.abs(m.x-250)<40){m.x=45;m.r=20;}else if(Math.abs(m.x-800)<40){m.x=972;m.r=-20;}}}],['reflCumbrera',items=>{for(const m of items)if(m.t==='reflector'&&Math.abs(m.x-2955)<40&&Math.abs(m.y-480)<40){m.x=2945;m.y=352;m.r=62;m.p={...(m.p||{}),z:515,tilt:22,beam:60};}}]]}};/* Maxi 14/10: el de la pileta va en la cumbrera, en la punta del quincho */
  const migrar=[];
  function mezclar(a,k,d){/* lo guardado manda; los escenarios nuevos de fábrica que no estén ni borrados se suman */const def=CAPA[k].esc(a);const s={activo:d.activo||'A',esc:{...(d.esc||{})},borrados:d.borrados||[],migr:[...(d.migr||[])]};
    for(const e in def)if(!s.esc[e]&&!s.borrados.includes(e))s.esc[e]=def[e];if(!s.esc[s.activo])s.activo=Object.keys(s.esc)[0];
    for(const [f,mk] of (MIG[k]&&MIG[k][a])||[]){if(s.migr.includes(f))continue;s.migr.push(f);const e=s.esc[s.activo];if(e&&!e.items.some(m=>mk().some(n=>n.t===m.t&&Math.abs(n.x-m.x)<30&&Math.abs(n.y-m.y)<30)))e.items.push(...mk().map((m,i)=>({id:(k==='luz'?'L':'m')+f.slice(0,4)+Date.now().toString(36)+i,...m})));migrar.push([a,k]);}
    for(const [f,fn] of (MUT[k]&&MUT[k][a])||[]){if(s.migr.includes(f))continue;s.migr.push(f);for(const e2 of Object.values(s.esc))fn(e2.items||[]);migrar.push([a,k]);}
    return s;}
  N.getDb().then(d=>{db=d;if(!d)return;for(const k in CAPA)for(const a of AMB_ORDEN)d.collection(CAPA[k].col).doc(a).onSnapshot(x=>{if(dr||dirty[k+a])return;if(x.exists){ST[k][a]=mezclar(a,k,x.data());armar();if(a===amb&&k===capa)panel();while(migrar.length){const [ma,mk]=migrar.shift();guardar(ma,mk);}}},()=>{});});

  /* ---------- cielorraso: lo primero que hay arriba del punto (losa del entrepiso, techo, cabio) ---------- */
  const rcT=new THREE.Raycaster();let tMeshes=null,tParts=null,tEp=null;const tCache=new Map();
  const visible=o=>{for(let q=o;q;q=q.parent)if(!q.visible)return false;return true;};
  let tMeshesV=[];
  function techo(x,y,piso,vid){if(visor.parts!==tParts||visor.params.ep!==tEp){tParts=visor.parts;tEp=visor.params.ep;tCache.clear();tMeshes=[];tMeshesV=[];
      for(const p of visor.parts||[]){p.grp.traverse(o=>{if(o.isMesh&&visible(o)){tMeshesV.push(o);if(p.cat!=='glass')tMeshes.push(o);}});}}
    const key=`${x|0},${y|0},${piso}${vid?'v':''}`;if(tCache.has(key))return tCache.get(key);
    rcT.set(new THREE.Vector3(x,piso+60,y),new THREE.Vector3(0,1,0));rcT.far=800;const h=rcT.intersectObjects(vid?tMeshesV:tMeshes,false).find(i=>{const m=Array.isArray(i.object.material)?i.object.material[0]:i.object.material;return !(m&&m.transparent&&m.opacity<.6);});
    const v=h?h.point.y-piso:250;tCache.set(key,v);return v;}

  /* suelo: el primer piso de menos de 1,5 m de alto debajo del punto (deck, tarima, terreno); los techos no cuentan */
  let gMeshes=null,gParts=null;const gCache=new Map();
  function sueloEn(x,y){if(visor.parts!==gParts){gParts=visor.parts;gCache.clear();gMeshes=[];for(const p of visor.parts||[]){if(p.cat==='glass'||p.cat==='agua')continue;p.grp.traverse(o=>{if(o.isMesh)gMeshes.push(o);});}
      scene.traverse(o=>{if(o.isMesh&&(o.userData.ground||o.geometry&&o.geometry.type==='PlaneGeometry'&&o.rotation.x<-1.5))gMeshes.push(o);});}
    const key=`${x|0},${y|0}`;if(gCache.has(key))return gCache.get(key);rcT.set(new THREE.Vector3(x,600,y),new THREE.Vector3(0,-1,0));rcT.far=1000;
    const h=rcT.intersectObjects(gMeshes,false).find(i=>i.point.y<150);const v=h?h.point.y:-20;gCache.set(key,v);return v;}
  /* ---------- 3D ---------- */
  const groups=new Map();let selBox=null,mueCache=null,cajCache=null;
  /* cajas de los muebles para que las personas no los atraviesen (Maxi 15/10): una por mueble, sin alfombras; no se cachea vacía */
  let cajT=0;function cajasMue(){const now=performance.now();if(cajCache&&cajCache.length&&now-cajT<1000)return cajCache;cajT=now;/* se rehace cada segundo: así sigue a los muebles que se mueven */const r=[];if(!G.visible)return r;for(const g of groups.values()){if(g.userData.capa!=='mue'||!g.visible)continue;const it=item(g.userData.item);if(it&&/^alfombra/.test(it.t))continue;const b=new THREE.Box3().setFromObject(g);if(b.isEmpty()||b.max.y-b.min.y<4)continue;r.push(b);}cajCache=r;return r;}
  function mallasMue(){if(mueCache&&mueCache.length)return mueCache;mueCache=[];if(!G.visible)return mueCache;for(const g of groups.values()){if(g.userData.capa!=='mue'||!g.visible)continue;const it=item(g.userData.item);if(it&&it.t==='alfombra')continue;g.traverse(o=>{if(o.isMesh)mueCache.push(o);});}return mueCache;}let nocheOn=false,nocheK=0,prendidaFn=()=>false;
  const EMIT=8;/* brillo del emisor de noche (lo agarra el bloom) */
  /* íconos de los artefactos: siempre encima, se tocan fácil aunque el artefacto esté a oscuras o tapado */
  function icoTex(col,ring){/* sólo líneas: lamparita (Maxi 14/10: chico, sin fondo) */const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.strokeStyle=ring||col;x.lineWidth=ring?7:5.5;x.lineCap=x.lineJoin='round';
    x.beginPath();x.arc(32,24,15,Math.PI*.8,Math.PI*2.2);x.lineTo(39,44);x.lineTo(25,44);x.closePath();x.stroke();x.beginPath();x.moveTo(25,51);x.lineTo(39,51);x.moveTo(28,58);x.lineTo(36,58);x.stroke();const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
  const ICO={on:new THREE.SpriteMaterial({map:icoTex('#e0a21c'),depthTest:false,depthWrite:false,sizeAttenuation:false}),off:new THREE.SpriteMaterial({map:icoTex('#aab0b6'),depthTest:false,depthWrite:false,sizeAttenuation:false}),
    selOn:new THREE.SpriteMaterial({map:icoTex('#e0a21c','#e2462b'),depthTest:false,depthWrite:false,sizeAttenuation:false}),selOff:new THREE.SpriteMaterial({map:icoTex('#aab0b6','#e2462b'),depthTest:false,depthWrite:false,sizeAttenuation:false})};
  let iconsOn=false;
  function icoMat(g){const on=prendidaFn(g.userData.item)||(visor.noche&&visor.noche.prendida(g.userData.prog));const s=g.userData.item===sel;return s?(on?ICO.selOn:ICO.selOff):(on?ICO.on:ICO.off);}
  function pintarIconos(){for(const g of groups.values())if(g.userData.ico){g.userData.ico.material=icoMat(g);g.userData.ico.visible=iconsOn;}}
  function armarItem(m,a,k){const c=catOf(m.t,k);if(!c)return null;const p={...c.p,...(m.p||{})};const g=new THREE.Group();g.userData.item=m.id;g.userData.amb=a;g.userData.capa=k;
    const piso=AMB[a].piso??PISO;
    if(k==='veg'){if(!visor.arboles)return null;const pl=visor.arboles.planta(p.esp,p.seed,Math.max(10,+p.alto||100));pl.traverse(o=>{if(o.isMesh)o.userData.item=m.id;});g.add(pl);g.userData.capaV=c.capaV;
      g.position.set(m.x,sueloEn(m.x,m.y),m.y);g.rotation.y=(m.r||0)*Math.PI/180;return g;}
    if(k==='mue'||k==='cal'){const ctx={techo:()=>techo(m.x,m.y,piso),/* el cielorraso más bajo sobre el mueble (radio r), vidrios incluidos */techoMin:r=>{let mn=Infinity;for(const dx of [-r,0,r])for(const dz of [-r,0,r])mn=Math.min(mn,techo(Math.round((m.x+dx)/4)*4,Math.round((m.y+dz)/4)*4,piso,true));return mn;}};for(const [geo,mk] of c.g(p,ctx)){const mesh=new THREE.Mesh(geo,MAT[mk]||MAT[FR[mk]]||MAT.blanco);mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.item=m.id;g.add(mesh);}
      g.position.set(m.x,piso+(m.z??c.z??0),m.y);}
    else{/* Maxi 14/10, artefactos que atravesaban el techo: los de pie se achican bajo el cielorraso; los de techo apoyan cada punto de arriba en el cielorraso real (cables y florones siguen la pendiente) */
      const tq=(x,y)=>techo(Math.round(x/4)*4,Math.round(y/4)*4,piso);const rr=(m.r||0)*Math.PI/180,cs=Math.cos(rr),sn=Math.sin(rr);
      let pp=p;if(c.mount==='piso'){let mn=Infinity;for(const [dx,dz] of [[0,0],[24,0],[-24,0],[0,24],[0,-24]])mn=Math.min(mn,tq(m.x+dx,m.y+dz));pp={...p,_techo:mn};}
      const out=c.g(pp);
      if(c.mount==='techo'){/* cada pieza que toca el plano de montaje se apoya en el cielorraso real que tiene encima: los cables se estiran (sólo sus puntas de arriba), florones, spots y rieles se trasladan enteros */
        const h0=tq(m.x,m.y);const at=(lx,lz)=>{const wx=m.x+lx*cs+lz*sn,wz=m.y-lx*sn+lz*cs;return Math.min(tq(wx,wz),tq(wx+5,wz),tq(wx-5,wz),tq(wx,wz+5),tq(wx,wz-5))-h0;};
        for(const [geo] of out.geo){const pa=geo.attributes&&geo.attributes.position;if(!pa)continue;geo.computeBoundingBox();const bb=geo.boundingBox;if(bb.max.y<-1.5)continue;
          const w=Math.max(bb.max.x-bb.min.x,bb.max.z-bb.min.z),h=bb.max.y-bb.min.y;
          if(w<2&&h>5){for(let i=0;i<pa.count;i++){const y=pa.getY(i);if(y<-.6)continue;const dz=at(pa.getX(i),pa.getZ(i));if(isFinite(dz)&&Math.abs(dz)<300)pa.setY(i,y+dz);}}
          else{const dz=at((bb.min.x+bb.max.x)/2,(bb.min.z+bb.max.z)/2);if(isFinite(dz)&&Math.abs(dz)>.2&&Math.abs(dz)<300)geo.translate(0,dz,0);}
          pa.needsUpdate=true;geo.computeBoundingBox();geo.computeBoundingSphere();}}
      const [r,gg,b]=kelvin(p.K||3000);const kc=new THREE.Color(r,gg,b);const dim=Math.max(0,Math.min(100,p.dim??100))/100;
      const em=new THREE.MeshStandardMaterial({color:0xf6f2ea,emissive:kc,emissiveIntensity:0,roughness:.4});em.userData.emit=EMIT*dim;
      const pan=new THREE.MeshStandardMaterial({color:0xe9e1d0,emissive:kc,emissiveIntensity:0,roughness:.9,side:THREE.DoubleSide});pan.userData.emit=.6*dim;
      g.userData.mats=[em,pan];
      for(const [geo,mk] of out.geo){const mat=mk==='@'?em:mk==='pantalla'?pan:(MAT[mk]||MAT.negro);const mesh=new THREE.Mesh(geo,mat);mesh.castShadow=mk!=='@';mesh.receiveShadow=true;mesh.userData.item=m.id;g.add(mesh);}
      g.userData.luz=out.luz.map(l=>({...l,K:p.K||3000,col:kc,lm:l.lm*dim}));
      g.userData.mount=c.mount;let zz=p.z??0;
      if(c.mount!=='techo'&&a!=='exterior'){/* de pared o de pie (adentro; los de afuera van a mano): nunca por encima del cielorraso (ni de un vidrio) que tenga arriba; si no entra, baja */let top=-Infinity;for(const ch of g.children){ch.geometry.computeBoundingBox();top=Math.max(top,ch.geometry.boundingBox.max.y);}
        let mn=Infinity;for(const [dx,dz] of [[0,0],[20,0],[-20,0],[0,20],[0,-20]])mn=Math.min(mn,techo(Math.round((m.x+dx)/4)*4,Math.round((m.y+dz)/4)*4,piso,true));
        if(isFinite(top)&&isFinite(mn)&&mn<790&&zz+top>mn-3){const z2=Math.max(0,mn-3-top);g.userData.zBaja=Math.round(zz-z2);zz=z2;}}
      g.position.set(m.x,piso+(c.mount==='techo'?techo(m.x,m.y,piso):zz),m.y);
      const bb=new THREE.Box3();for(const ch of g.children)bb.expandByObject(ch);const sp=new THREE.Sprite(ICO.off);sp.scale.set(.012,.012,1);sp.renderOrder=3000;sp.userData.item=m.id;sp.userData.ico=true;
      sp.position.set((bb.min.x+bb.max.x)/2,c.mount==='techo'?bb.min.y-6:bb.max.y+12,(bb.min.z+bb.max.z)/2);g.add(sp);g.userData.ico=sp;
      g.userData.prog=p.prog||progDef(m.t);const onI=prendidaFn(m.id);for(const mt of g.userData.mats)mt.emissiveIntensity=onI?mt.userData.emit*nocheK:0;}
    g.rotation.y=(m.r||0)*Math.PI/180;return g;}
  function armar(){window.__despertar&&window.__despertar();for(const g of groups.values()){G.remove(g);GV.remove(g);if(g.userData.capa!=='veg')g.traverse(o=>{if(o.geometry&&!o.isSprite)o.geometry.dispose();});if(g.userData.mats)g.userData.mats.forEach(m=>m.dispose());}groups.clear();
    for(const k in CAPA)for(const a of AMB_ORDEN){const s=ST[k][a];const e=s&&s.esc[s.activo];if(e)for(const m of e.items){const g=armarItem(m,a,k);if(g){(k==='veg'?GV:G).add(g);groups.set(m.id,g);}}}mueCache=null,cajCache=null;marcarSel();vis();pintarIconos();}
  function visOf(g){const k=g.userData.capa;if(k==='veg')return visor.params.ext!==false&&vegCapas[g.userData.capaV]!==false;return (AMB[g.userData.amb].nivel!=='EP'||visor.params.ep!==false)&&(k==='luz'?visor.params.equip!==false||nocheOn:k==='cal'?visor.params.equip!==false||!!(visor.termica&&visor.termica.abierta):visor.params.equip!==false);}
  function vis(){mueCache=null,cajCache=null;for(const g of groups.values())g.visible=visOf(g);luces();}
  /* fuentes de luz en coordenadas del mundo → motor de noche */
  const _v=new THREE.Vector3(),_d=new THREE.Vector3();
  function luces(){window.__despertar&&window.__despertar();const L=[];for(const g of groups.values()){if(g.userData.capa!=='luz'||!g.visible||!g.userData.luz)continue;g.updateMatrixWorld(true);
      for(const l of g.userData.luz){_v.fromArray(l.p).applyMatrix4(g.matrixWorld);const o={t:l.t,p:_v.clone(),lm:l.lm,col:l.col,beam:l.beam,dist:l.dist,w:l.w,h:l.h,id:g.userData.item,prog:g.userData.prog};
        if(l.d){_d.fromArray(l.d).transformDirection(g.matrixWorld);o.d=_d.clone();}L.push(o);}}
    if(visor.noche)visor.noche.setFuentes(L);}
  function setNoche(k,fn){setTimeout(pintarIconos,0);const was=nocheOn;nocheK=k;nocheOn=k>=1;if(fn)prendidaFn=fn;for(const g of groups.values())if(g.userData.mats){const on=prendidaFn(g.userData.item);for(const mt of g.userData.mats)mt.emissiveIntensity=on?mt.userData.emit*k:0;}
    if(was!==nocheOn){G.visible=visor.params.equip!==false||nocheOn;for(const g of groups.values())g.visible=visOf(g);}}
  function marcarSel(){pintarIconos();if(selBox){G.remove(selBox);selBox.geometry.dispose();selBox=null;}const g=sel&&groups.get(sel);if(!g)return;
    const bb=new THREE.Box3().setFromObject(g);bb.expandByScalar(1.5);selBox=new THREE.Box3Helper(bb,new THREE.Color('#e2462b'));selBox.material.depthTest=false;selBox.renderOrder=2000;G.add(selBox);}
  /* etiqueta del elegido: qué es y, si es una luz, lúmenes, color y si está prendida */
  const tag=document.createElement('div');tag.id='eqTag';tag.hidden=true;(stage||document.body).appendChild(tag);const _t=new THREE.Vector3();let tagTxt='';
  function ponerTag(){const g=sel&&groups.get(sel),m=g&&item(sel);if(!g||!m||card.hidden||!g.visible){tag.hidden=true;return;}const k=g.userData.capa;
    const txt=`${esc(nombreCorto(m,k))} · ${esc(AMB[g.userData.amb].n)}${k==='luz'?`<small>${resumen(m)}</small>`:''}`;if(txt!==tagTxt){tag.innerHTML=txt;tagTxt=txt;}
    const bb=new THREE.Box3();g.traverse(o=>{if(o.isMesh)bb.expandByObject(o);});_t.set((bb.min.x+bb.max.x)/2,bb.max.y+4,(bb.min.z+bb.max.z)/2).project(camera);
    if(_t.z>1){tag.hidden=true;return;}const r=view.getBoundingClientRect(),sr=(stage||document.body).getBoundingClientRect();tag.hidden=false;tag.style.left=(r.left-sr.left+(_t.x+1)/2*r.width)+'px';tag.style.top=(r.top-sr.top+(1-_t.y)/2*r.height-8)+'px';}
  let lastEp=null,lastEq=null,lastExt=null;requestAnimationFrame(function loop(){requestAnimationFrame(loop);const io=!card.hidden&&capa==='luz';if(io!==iconsOn){iconsOn=io;pintarIconos();}ponerTag();G.visible=visor.params.equip!==false||nocheOn;if(visor.params.ep!==lastEp||visor.params.equip!==lastEq||visor.params.ext!==lastExt){lastEp=visor.params.ep;lastEq=visor.params.equip;lastExt=visor.params.ext;tParts=null;vis();}});

  /* ---------- arrastrar / girar ---------- */
  const rc=new THREE.Raycaster(),mv=new THREE.Vector2();
  const setRay=e=>{const r=view.getBoundingClientRect();mv.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);rc.setFromCamera(mv,camera);};
  const item=id=>{const g=groups.get(id);if(!g)return null;const s=ST[g.userData.capa][g.userData.amb];return s&&s.esc[s.activo].items.find(m=>m.id===id);};
  /* elegir muebles y artefactos tocándolos aunque el panel esté cerrado (Maxi 15/10): gana lo que esté más cerca, respeta los cortes y las paredes que tapan */
  const okClip=h=>(visor.clips||[]).every(q=>{const v=q.axis==='x'?h.point.x:q.axis==='y'?h.point.y:h.point.z;return (q.side||-1)>0?v>=q.value-.5:v<=q.value+.5;});
  /* gizmo del elegido (Maxi 15/10: «dejame mover los muebles y girarlos, como me dejás mover otras cosas»): flechas en x y en y de planta, y un aro naranja para girar */
  const EG=new THREE.Group(),ER=new THREE.Group();EG.visible=ER.visible=false;scene.add(EG,ER);
  const gmat=c=>new THREE.MeshBasicMaterial({color:c,depthTest:false,transparent:true,opacity:.92});
  for(const [k,d,c] of [['x',new THREE.Vector3(1,0,0),0xd23b2a],['y',new THREE.Vector3(0,0,1),0x1f6fd1]])for(const sg of [1,-1]){const g=new THREE.Group(),m=gmat(c);
    const sh=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.4,40,8),m);sh.position.y=20;const hd=new THREE.Mesh(new THREE.ConeGeometry(5.5,14,12),m);hd.position.y=46;const hit=new THREE.Mesh(new THREE.CylinderGeometry(9,9,58,6),new THREE.MeshBasicMaterial({visible:false}));hit.position.y=29;
    for(const o of [sh,hd,hit]){o.renderOrder=2002;o.userData.eg=k;g.add(o);}g.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().multiplyScalar(sg));EG.add(g);}
  {const aro=new THREE.Mesh(new THREE.TorusGeometry(1,.022,8,72),gmat(0xe08a1e));const hit=new THREE.Mesh(new THREE.TorusGeometry(1,.09,6,48),new THREE.MeshBasicMaterial({visible:false}));
    for(const o of [aro,hit]){o.rotation.x=Math.PI/2;o.userData.eg='r';o.renderOrder=2002;ER.add(o);}}
  let egKey='';const egBB=new THREE.Box3(),egC=new THREE.Vector3(),egS=new THREE.Vector3();
  (function egl(){requestAnimationFrame(egl);const g=sel&&groups.get(sel);const on=!!(g&&g.visible&&!card.hidden);EG.visible=ER.visible=on;if(!on)return;
    const k=sel+g.position.toArray().join()+g.rotation.y;if(k!==egKey){egKey=k;egBB.setFromObject(g);egBB.getCenter(egC);egBB.getSize(egS);}
    EG.position.set(egC.x,egBB.max.y+6,egC.z);EG.scale.setScalar(Math.max(.3,camera.position.distanceTo(EG.position)/450));
    ER.position.set(g.position.x,egBB.min.y+2,g.position.z);ER.scale.setScalar(Math.max(egS.x,egS.z)/2+14);})();
  view.addEventListener('pointerdown',e=>{if(e.button!==0||!card)return;const abierto=!card.hidden&&(G.visible||capa==='veg');if(!abierto&&!G.visible)return;setRay(e);
    if(EG.visible){const hh=rc.intersectObjects([...EG.children,...ER.children],true)[0];const m=hh&&item(sel),g=hh&&groups.get(sel);
      if(m&&g){e.stopPropagation();e.preventDefault();view.setPointerCapture(e.pointerId);visor.controls.enabled=false;const pl=new THREE.Plane(new THREE.Vector3(0,1,0),-hh.point.y);const p0=hh.point.clone();rc.ray.intersectPlane(pl,p0);
        dr={id:sel,pl,eg:hh.object.userData.eg,p0,mx:m.x,my:m.y,r0:m.r||0,a0:Math.atan2(p0.z-g.position.z,p0.x-g.position.x),moved:false};return;}}
    const ics=[];if(abierto&&iconsOn)for(const g of groups.values())if(g.visible&&g.userData.ico)ics.push(g.userData.ico);let h=rc.intersectObjects(ics,false)[0];
    if(!h){const ms=[];for(const g of groups.values())if(g.visible&&(abierto?g.userData.capa===capa||g.userData.capa==='mue'||g.userData.capa==='luz':g.userData.capa==='mue'||g.userData.capa==='luz'))g.traverse(o=>{if(o.isMesh&&!o.isSprite)ms.push(o);});
      h=rc.intersectObjects(ms,false).find(okClip)||null;
      if(h){const pm=[];for(const q of visor.parts||[]){if(!q.grp||q.grp.visible===false)continue;q.grp.traverse(o=>{if(o.isMesh&&o.visible)pm.push(o);});}const hp=rc.intersectObjects(pm,false).find(x=>okClip(x)&&!(x.object.material&&x.object.material.transparent&&x.object.material.opacity<.6));if(hp&&hp.distance<h.distance-2)h=null;}}
    if(h&&card.hidden){card.hidden=false;try{localStorage.setItem('carhue-equip-panel','1');}catch(e){}}
    if(h){const gk=groups.get(h.object.userData.item)?.userData.capa;if(gk&&gk!==capa){capa=gk;modo='';}}
    if(!h){return;}const id=h.object.userData.item;const m=item(id);if(!m)return;{const ga=groups.get(id).userData.amb;if(ga!==amb){amb=ga;modo='';}}e.stopPropagation();e.preventDefault();view.setPointerCapture(e.pointerId);visor.controls.enabled=false;
    sel=id;marcarSel();panel();const y0=groups.get(id).position.y;const pl=new THREE.Plane(new THREE.Vector3(0,1,0),-y0);const p0=new THREE.Vector3();rc.ray.intersectPlane(pl,p0);
    dr={id,pl,dx:m.x-p0.x,dy:m.y-p0.z,x0:e.clientX,r0:m.r||0,rot:e.shiftKey,moved:false};},true);
  view.addEventListener('pointermove',e=>{if(!dr)return;e.stopPropagation();const m=item(dr.id),g=groups.get(dr.id);if(!m||!g)return;dr.moved=true;
    if(dr.eg){setRay(e);const p=new THREE.Vector3();if(!rc.ray.intersectPlane(dr.pl,p))return;
      if(dr.eg==='r'){const a=Math.atan2(p.z-g.position.z,p.x-g.position.x);let r=dr.r0-(a-dr.a0)*180/Math.PI;r=e.altKey?Math.round(r):Math.round(r/15)*15;m.r=((r%360)+360)%360;g.rotation.y=m.r*Math.PI/180;hint(`${NOMBRE(m.t,capa)} · giro ${m.r}°  (de a 15°; Alt: libre)`);marcarSel();luces();return;}
      let x=dr.mx,y=dr.my;if(dr.eg==='x')x+=p.x-dr.p0.x;else y+=p.z-dr.p0.z;if(!e.altKey){x=Math.round(x/5)*5;y=Math.round(y/5)*5;}else{x=Math.round(x);y=Math.round(y);}
      m.x=x;m.y=y;g.position.x=x;g.position.z=y;if(g.userData.mount==='techo'){const pz=AMB[g.userData.amb].piso??PISO;g.position.y=pz+techo(x,y,pz);}if(g.userData.capa==='veg')g.position.y=sueloEn(x,y);marcarSel();luces();hint(`${NOMBRE(m.t,capa)} · x ${(x/100).toFixed(2)} · y ${(y/100).toFixed(2)}  (imán 5 cm; Alt: libre)`);return;}
    if(dr.rot||e.shiftKey){let r=dr.r0+(e.clientX-dr.x0)*.5;if(!e.altKey)r=Math.round(r/15)*15;m.r=((r%360)+360)%360;g.rotation.y=m.r*Math.PI/180;hint(`${NOMBRE(m.t,capa)} · giro ${m.r}°`);marcarSel();luces();return;}
    setRay(e);const p=new THREE.Vector3();if(!rc.ray.intersectPlane(dr.pl,p))return;let x=p.x+dr.dx,y=p.z+dr.dy;if(!e.altKey){x=Math.round(x/5)*5;y=Math.round(y/5)*5;}
    m.x=x;m.y=y;g.position.x=x;g.position.z=y;if(g.userData.mount==='techo'){const pz=AMB[g.userData.amb].piso??PISO;g.position.y=pz+techo(x,y,pz);}if(g.userData.capa==='veg')g.position.y=sueloEn(x,y);marcarSel();luces();hint(`${NOMBRE(m.t,capa)} · x ${(x/100).toFixed(2)} · y ${(y/100).toFixed(2)}  (imán 5 cm; Alt: libre · Shift: girar)`);},true);
  const end=e=>{if(!dr)return;e.stopPropagation();const mvd=dr.moved,g=groups.get(dr.id);dr=null;visor.controls.enabled=true;if(mvd){if(g&&g.userData.mount==='techo')armar();guardar(amb);panel();}};
  view.addEventListener('pointerup',end,true);view.addEventListener('pointercancel',end,true);
  function hint(t){const st=document.getElementById('stTool');if(st)st.innerHTML=t;}

  /* ---------- panel ---------- */
  const card=document.createElement('div');card.id='eqCard';card.hidden=!lsPanel();
  card.style.cssText='position:absolute;top:44px;right:8px;z-index:6;width:262px;max-height:calc(100% - 100px);overflow:auto;background:var(--panel);border:1px solid var(--rule);border-radius:4px;padding:6px 8px;font-size:11px;box-shadow:0 4px 14px rgba(0,0,0,.18)';
  (stage||document.body).appendChild(card);
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const btn=(a,t,tip='')=>`<button class="btn" data-a="${a}" ${tip?`title="${esc(tip)}"`:''} style="padding:3px 7px;font-size:11px">${t}</button>`;
  const tab=(k,t)=>`<button class="btn" data-a="capa" data-k="${k}" style="padding:2px 5px;font-size:10.5px;${k===capa?'background:var(--accent-soft);font-weight:600':''}">${t}</button>`;
  const CSS=document.createElement('style');CSS.textContent=`#eqCard .eqg{display:grid;grid-template-columns:1fr 1fr;gap:4px 6px}#eqCard .eqg label{display:flex;flex-direction:column;gap:1px;font-size:10px;color:var(--muted);min-width:0}
#eqCard .eqg input,#eqCard .eqg select,#eqCard .eqr select,#eqCard .eqr input{width:100%;min-width:0;font-size:11px;padding:1px 3px;box-sizing:border-box}#eqCard .eqr{display:flex;gap:4px;align-items:center;margin-bottom:5px}
#eqCard .eqr>span{flex:none;color:var(--muted);font-size:10px;width:52px}#eqCard .eqi{display:flex;align-items:center;gap:5px;padding:2px 4px;border-radius:3px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#eqCard .eqi:hover{background:var(--accent-soft)}#eqCard .eqi.on{background:var(--accent-soft);font-weight:600}#eqCard .ib{padding:1px 5px;font-size:11px;line-height:16px}#eqCard input[type=range]{height:12px}
#eqTag{position:absolute;z-index:7;pointer-events:none;transform:translate(-50%,-100%);background:rgba(20,22,24,.88);color:#fff;font:11px/1.3 var(--f-mono,monospace);padding:3px 7px;border-radius:3px;white-space:nowrap}
#eqTag small{color:#d9c58a;display:block}`;document.head.appendChild(CSS);
  const UI_MUE=[['L','largo','num'],['D','fondo','num'],['H','alto','num']];
  const ib=(a,t,tip='')=>`<button class="btn ib" data-a="${a}" title="${esc(tip)}">${t}</button>`;
  function campos(m){const c=catOf(m.t,capa);const ui=c.ui||UI_MUE.filter(([k])=>c.p[k]!=null);
    return `<div class="eqg">${ui.map(([k,lab,ty])=>{const v=(m.p&&m.p[k])??c.p[k];if(Array.isArray(ty))return `<label>${lab.trim()}<select data-p="${k}">${ty.map(o=>`<option${String(o)===String(v)?' selected':''}>${o}</option>`).join('')}</select></label>`;
      if(ty==='time')return `<label>${lab.trim()}<input data-p="${k}" type="time" value="${v}"></label>`;
      return `<label>${lab.trim()}<input data-p="${k}" type="number" step="${k==='dim'||k==='tilt'?5:k==='lm'||k==='lmm'?50:5}" value="${v}"></label>`;}).join('')}</div>`+(capa==='luz'?programa(m):'');}
  function programa(m){const pr=(m.p&&m.p.prog)||progDef(m.t);const nz=visor.noche;const on=nz?nz.prendida(pr):false;const md=pr.modo||'prog';
    const ev=(k,lab)=>{const e=pr[k]||{t:'atardecer',m:0};return `<div class="eqr"><span>${lab}</span><select data-g="${k}.t" style="flex:1.3">${['atardecer','amanecer','hora'].map(o=>`<option${o===e.t?' selected':''}>${o}</option>`).join('')}</select>${e.t==='hora'?`<input data-g="${k}.h" type="time" value="${e.h||'19:00'}" style="flex:1">`:`<input data-g="${k}.m" type="number" step="5" value="${e.m||0}" title="minutos (− antes, + después)" style="flex:.8">`}</div>`;};
    return `<div style="border-top:1px dashed var(--rule);margin-top:6px;padding-top:5px"><div class="eqr"><span>Programa</span><select data-g="modo">${[['prog','programada'],['on','siempre'],['off','apagada']].map(([v,t])=>`<option value="${v}"${v===md?' selected':''}>${t}</option>`).join('')}</select><small style="flex:none;color:${on?'#c98a00':'var(--muted)'}">${on?'●':'○'}</small></div>
      ${md==='prog'?ev('on','Prende')+ev('off','Apaga'):''}</div>`;}
  function totales(){const e=cur();let lm=0;for(const m of e.items){const g=groups.get(m.id);if(g&&g.userData.luz)for(const l of g.userData.luz)lm+=l.lm;}return `${Math.round(lm).toLocaleString('es-AR')} lm · ≈ ${Math.round(lm/95)} W LED`;}
  const nombreCorto=(m,k=capa)=>{const p={...(catOf(m.t,k)?.p||{}),...(m.p||{})};if(k==='veg')return `${NOMBRE(m.t,k).replace(/ \/.*/,'')} · ${({'Oak Large':'roble grande','Oak Medium':'roble','Ash Large':'fresno grande','Ash Medium':'fresno','Aspen Medium':'álamo','Bush 1':'mata 1','Bush 2':'mata 2','Bush 3':'mata 3'})[p.esp]||p.esp} · ${(p.alto/100).toFixed(1)} m`;let n=NOMBRE(m.t,k).replace(/ \(.*\)$/,'').replace(/ con 2–4 spots| en línea \(2–4\)| \(4\)/,'');if(m.t==='riel')n+=` · ${p.n} spots`;else if(m.t==='emb')n+=` × ${p.n}`;else if(p.L&&k==='luz')n+=` ${p.L/100} m`;return n;};
  function resumen(m){const c=catOf(m.t,'luz');const p={...c.p,...(m.p||{})};const g=groups.get(m.id);let lm=0;if(g&&g.userData.luz)for(const l of g.userData.luz)lm+=l.lm;const on=visor.noche?visor.noche.prendida(p.prog||progDef(m.t)):false;
    return `${Math.round(lm)} lm · ${p.K} K${p.dim<100?` · ${p.dim}%`:''} · ${on?'● prendida':'○ apagada'}`;}
  let solOpen=false;
  function panel(){const s=ST[capa][amb],e=cur(),m=sel&&groups.get(sel)?.userData.capa===capa&&item(sel);const nz=visor.noche;
    card.innerHTML=`<div style="display:flex;align-items:center;gap:3px;margin-bottom:6px">${capa==='cal'?'':tab('mue','Muebles')+tab('luz','Luces')+tab('veg','Plantas')}<span style="flex:1"></span>${ib('ir','Ir','Ir a la vista del ambiente')}${ib('cerrar','×','Cerrar')}</div>
      ${capa==='luz'&&nz?`<div style="border:1px solid var(--rule);border-radius:3px;padding:4px 6px;margin-bottom:6px">
        <div class="eqr" style="margin:0;cursor:pointer" data-a="sol"><b style="flex:1;font-size:11px">☀ ${nz.info()}</b><span style="width:auto">${solOpen?'▴':'▾'}</span></div>
        <div class="eqr" style="margin:3px 0 0">${ib('dn',nz.noche?'☀':'☾',nz.noche?'Pasar a de día':'Pasar a de noche')}<input type="range" data-hora min="0" max="1439" step="5" value="${nz.min}" style="flex:1"><b data-horal style="font-size:11px">${nz.hhmm(nz.min)}</b></div>
        <div class="eqr" style="margin:5px 0 0"><span>Toda la casa</span>${['on','off',''].map(v=>{const f=nz.forzar||'';const t=v==='on'?'● todo':v==='off'?'○ nada':'⏱ programa';return `<button class="btn ib" data-a="fz${v||'p'}" style="${f===v?'background:var(--accent-soft);font-weight:600':''}" title="${v===''?'Cada artefacto según su programa (hora, atardecer…)':v==='on'?'Prende todos los artefactos de la casa':'Apaga todos'}">${t}</button>`;}).join('')}</div>
        ${solOpen?`<div style="display:flex;gap:3px;margin-top:4px;flex-wrap:wrap">${ib('h_ss','Atardecer')}${ib('h_ss30','+30′')}${ib('h_22','22:00')}${ib('h_01','01:00')}${ib('h_ahora','Ahora')}</div>
        <div class="eqr" style="margin:4px 0 2px"><span>Exposición</span><input type="range" data-n="exp" min="-3" max="3" step=".1" value="${nz.ev}"></div>
        <div class="eqr" style="margin-bottom:2px"><span>Luna</span><input type="range" data-n="luna" min="0" max="1" step=".05" value="${nz.luna}"></div>
        <div class="eqr" style="margin-bottom:2px"><span>Brillo</span><input type="range" data-n="bloom" min="0" max="1.5" step=".05" value="${nz.bloom}"></div>
        <div class="eqg" style="margin-top:3px"><label>Sombras de spots<select data-n="som">${[0,2,4,8].map(v=>`<option${v===nz.sombras?' selected':''}>${v}</option>`).join('')}</select></label><label>Luces a la vez<select data-n="max">${[16,24,32,48].map(v=>`<option${v===nz.max?' selected':''}>${v}</option>`).join('')}</select></label></div>`:''}</div>`:''}
      ${capa==='veg'?`<div class="eqr" style="gap:8px"><span>Capas</span>${[['bajo','bajas'],['medio','medias'],['arbol','árboles']].map(([k,t])=>`<label style="display:flex;gap:2px;align-items:center"><input type="checkbox" data-vc="${k}"${vegCapas[k]!==false?' checked':''}>${t}</label>`).join('')}</div>`:''}
      <div class="eqr"${capa==='veg'?' hidden':''}><span>Ambiente</span><select data-s="amb">${AMB_ORDEN.map(a=>`<option value="${a}"${a===amb?' selected':''}>${AMB[a].n}</option>`).join('')}</select></div>
      ${modo==='ren'?`<div class="eqr"><input data-ren value="${esc(e.nombre)}">${ib('renOk','OK')}${ib('no','✕')}</div>`:modo==='del'?`<div class="eqr"><span style="width:auto;flex:1">¿Borrar «${esc(e.nombre)}»?</span>${ib('delOk','Sí')}${ib('no','No')}</div>`:
        `<div class="eqr"><span>${capa==='luz'?'Escena':'Escenario'}</span><select data-s="esc">${Object.entries(s.esc).map(([k,v])=>`<option value="${k}"${k===s.activo?' selected':''}>${esc(v.nombre)}</option>`).join('')}</select>${ib('dup','⧉','Duplicar el escenario')}${ib('ren','✎','Renombrar')}${ib('del','🗑','Borrar el escenario')}</div>`}
      <div class="eqr"><span>＋</span><select data-s="add"><option value="">${capa==='luz'?'Agregar artefacto…':'Agregar mueble…'}</option>${Object.entries(CAPA[capa].CAT).map(([k,c])=>`<option value="${k}">${c.n}</option>`).join('')}</select></div>
      <div style="max-height:132px;overflow:auto;border:1px solid var(--rule);border-radius:3px;padding:2px;margin-bottom:4px">${e.items.length?e.items.map(it=>{const on=capa==='luz'&&visor.noche?visor.noche.prendida((it.p&&it.p.prog)||progDef(it.t)):null;
        return `<div class="eqi${it.id===sel?' on':''}" data-a="pick" data-id="${it.id}">${on==null?'':`<span data-a="tg" data-id="${it.id}" title="${on?'Apagar':'Prender'} (queda fijo; ⏱ vuelve al programa)" style="color:${on?'#d79a00':'var(--muted)'};cursor:pointer;padding:0 3px;font-size:13px">${on?'●':'○'}</span>`}${esc(nombreCorto(it))}</div>`;}).join(''):'<div style="color:var(--muted);padding:2px 4px">Vacío</div>'}</div>
      ${capa==='luz'?`<div class="eqr" style="margin-bottom:3px"><span>Este ambiente</span>${ib('amOn','● todo','Prender todos los artefactos de esta escena')}${ib('amOff','○ todo','Apagar todos')}${ib('amProg','⏱','Volver al programa de cada uno')}</div><div style="color:var(--muted);font-size:10px;margin-bottom:4px">${totales()} · tocá ● / ○ en la lista para prender o apagar uno</div>`:''}
      ${m?`<div style="border-top:1px solid var(--rule);padding-top:5px"><div style="display:flex;align-items:baseline;gap:4px"><b style="flex:1">${esc(nombreCorto(m))}</b></div>
        <div style="color:var(--muted);font-size:10px;margin:1px 0 5px">x ${(m.x/100).toFixed(2)} · y ${(m.y/100).toFixed(2)} · ${m.r||0}°${capa==='luz'&&catOf(m.t,'luz').mount==='techo'?' · al cielorraso':''}</div>
        ${campos(m)}
        <div style="display:flex;gap:3px;margin-top:6px">${ib('rotL','⟲','Girar 90° a la izquierda')}${ib('rotR','⟳','Girar 90° a la derecha')}${ib('dupM','⧉','Duplicar')}${ib('delM','🗑','Quitar')}${ib('irM','◎','Ir hasta el artefacto')}</div>
        <div style="color:var(--muted);font-size:10px;margin-top:4px">Arrastrá el mueble o sus flechas para moverlo; el aro naranja lo gira de a 15° (Alt: libre). Teclado: flechas 5 cm (Shift 1 cm).</div></div>`
       :`<div style="color:var(--muted);font-size:10px">Tocá un ${capa==='luz'?'ícono o artefacto':'mueble'} o elegilo de la lista. Arrastrá para moverlo (imán 5 cm; Alt libre).</div>`}`;}
  card.addEventListener('input',ev=>{const t=ev.target;if(t.matches('[data-hora]')&&visor.noche){const l=card.querySelector('[data-horal]');if(l)l.textContent=visor.noche.hhmm(+t.value);visor.noche.setMin(+t.value);return;}if(t.dataset.n&&visor.noche&&t.type==='range'){visor.noche.set(t.dataset.n,+t.value);const sm=t.parentElement.querySelector('small');if(sm&&t.dataset.n==='exp')sm.textContent=`${t.value>0?'+':''}${(+t.value).toFixed(1)} EV`;}});
  card.addEventListener('change',ev=>{const t=ev.target;
    if(t.matches('[data-hora]')&&visor.noche){visor.noche.irA(+t.value);return;}
    if(t.dataset.n&&visor.noche){visor.noche.set(t.dataset.n,+t.value);panel();return;}
    if(t.dataset.g){const m=item(sel);if(!m)return;const c=catOf(m.t,'luz');const pr=JSON.parse(JSON.stringify((m.p&&m.p.prog)||progDef(m.t)));const k=t.dataset.g,v=t.value;
      if(k==='modo')pr.modo=v;else{const [ev,f]=k.split('.');if(f==='t'){pr[ev]=v==='hora'?{t:'hora',h:pr[ev]?.h||(ev==='on'?'19:00':'23:30')}:{t:v,m:+(pr[ev]?.m||0)};}else if(f==='h')pr[ev]={t:'hora',h:v};else pr[ev]={...pr[ev],m:+v||0};}
      m.p={...(m.p||{}),prog:pr};armar();luces();panel();guardar();return;}
    if(t.dataset.s==='esc'){ST[capa][amb].activo=t.value;sel=null;armar();panel();guardar();return;}
    if(t.dataset.vc){vegCapas[t.dataset.vc]=t.checked;try{localStorage.setItem('carhue-veg-capas',JSON.stringify(vegCapas));}catch(e){}vis();return;}
    if(t.dataset.s==='amb'){amb=t.value;sel=null;armar();panel();return;}
    if(t.dataset.s==='add'&&t.value){const tg=visor.controls.target;const m={id:(capa==='luz'?'L':capa==='veg'?'V':capa==='cal'?'C':'m')+Date.now().toString(36),t:t.value,x:Math.round(tg.x/5)*5,y:Math.round(tg.z/5)*5,r:0,p:{}};cur().items.push(m);sel=m.id;armar();panel();guardar();return;}
    if(t.dataset.p&&t.type==='time'){const m=item(sel);if(!m)return;m.p={...(m.p||{}),[t.dataset.p]:t.value};armar();panel();guardar();return;}
    if(t.dataset.p){const m=item(sel);if(!m)return;const raw=t.value;const v=t.tagName==='SELECT'?(isNaN(+raw)?raw:+raw):(+raw||0);m.p={...(m.p||{}),[t.dataset.p]:t.tagName==='SELECT'?v:(['tilt','z'].includes(t.dataset.p)?v:Math.max(t.dataset.p==='dim'?0:1,v))};armar();panel();guardar();}});
  card.addEventListener('click',ev=>{const b=ev.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,s=ST[capa][amb];
    if(a==='capa'){capa=b.dataset.k;if(capa==='veg')amb='exterior';sel=null;modo='';try{localStorage.setItem('carhue-equip-capa',capa);}catch(e){}marcarSel();panel();return;}
    if(a==='sol'){solOpen=!solOpen;panel();return;}
    if(a==='dn'&&visor.noche){visor.noche.diaNoche();return;}
    if(a==='pick'){elegir(b.dataset.id,true);return;}
    if(a==='tg'&&visor.noche){const m=cur().items.find(x=>x.id===b.dataset.id);if(!m)return;const on=visor.noche.prendida((m.p&&m.p.prog)||progDef(m.t));const pr={...((m.p&&m.p.prog)||progDef(m.t)),modo:on?'off':'on'};m.p={...(m.p||{}),prog:pr};if(visor.noche.forzar)visor.noche.setForzar(null);armar();luces();panel();guardar();return;}
    if(a.startsWith('fz')&&visor.noche){visor.noche.setForzar(a==='fzon'?'on':a==='fzoff'?'off':null);armar();luces();panel();return;}
    if((a==='amOn'||a==='amOff'||a==='amProg')&&capa==='luz'){for(const m of cur().items){const pr={...((m.p&&m.p.prog)||progDef(m.t)),modo:a==='amOn'?'on':a==='amOff'?'off':'prog'};m.p={...(m.p||{}),prog:pr};}if(visor.noche&&visor.noche.forzar)visor.noche.setForzar(null);armar();luces();panel();guardar();return;}
    if(a.startsWith('h_')&&visor.noche){const nz=visor.noche,ss=nz.horas.ss??1200;const d=new Date();nz.irA(a==='h_ss'?ss:a==='h_ss30'?ss+30:a==='h_22'?1320:a==='h_01'?60:d.getHours()*60+d.getMinutes());return;}
    if(a==='cerrar'){card.hidden=true;try{localStorage.setItem('carhue-equip-panel','0');}catch(e){}sel=null;marcarSel();return;}
    if(a==='ir'){const v=AMB[amb].vista;visor.fly(v.p,v.t);return;}
    if(a==='dup'){const k='E'+Date.now().toString(36);const src=cur();s.esc[k]={nombre:src.nombre+' (copia)',items:JSON.parse(JSON.stringify(src.items)).map((m,i)=>({...m,id:(capa==='luz'?'L':'m')+Date.now().toString(36)+i}))};s.activo=k;sel=null;armar();panel();guardar();return;}
    if(a==='ren'){modo='ren';panel();const i=card.querySelector('[data-ren]');if(i){i.focus();i.select();}return;}
    if(a==='renOk'){const i=card.querySelector('[data-ren]');if(i&&i.value.trim()){cur().nombre=i.value.trim();guardar();}modo='';panel();return;}
    if(a==='del'){if(Object.keys(s.esc).length<2){hint('Tiene que quedar al menos un escenario.');return;}modo='del';panel();return;}
    if(a==='delOk'){delete s.esc[s.activo];(s.borrados=s.borrados||[]).push(s.activo);s.activo=Object.keys(s.esc)[0];sel=null;modo='';armar();panel();guardar();return;}
    if(a==='no'){modo='';panel();return;}
    const m=item(sel);if(!m)return;
    if(a==='irM'){elegir(sel,true);return;}
    if(a==='rotL'||a==='rotR'){m.r=(((m.r||0)+(a==='rotL'?90:-90))%360+360)%360;armar();panel();guardar();}
    if(a==='dupM'){const c={...JSON.parse(JSON.stringify(m)),id:(capa==='luz'?'L':'m')+Date.now().toString(36),x:m.x+30,y:m.y+30};cur().items.push(c);sel=c.id;armar();panel();guardar();}
    if(a==='delM'){cur().items=cur().items.filter(x=>x.id!==sel);sel=null;armar();panel();guardar();}});
  card.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('[data-ren]')){card.querySelector('[data-a="renOk"]').click();}});
  let nudT=null;
  function elegir(id,ir){const g=groups.get(id);if(!g)return;amb=g.userData.amb;capa=g.userData.capa;sel=id;modo='';card.hidden=false;marcarSel();panel();
    if(ir){const t=new THREE.Vector3();new THREE.Box3().setFromObject(g).getCenter(t);const d=camera.position.clone().sub(visor.controls.target);const dist=Math.min(Math.max(d.length(),250),450);d.setLength(dist);visor.fly(t.clone().add(d).toArray(),t.toArray());}}
  addEventListener('keydown',e=>{if(card.hidden||!sel||/INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName))return;
    if(/^Arrow/.test(e.key)){const m=item(sel),g=groups.get(sel);if(!m||!g)return;e.preventDefault();const st=e.shiftKey?1:5;const f=new THREE.Vector3();camera.getWorldDirection(f);f.y=0;
      const ax=Math.abs(f.x)>=Math.abs(f.z)?new THREE.Vector3(Math.sign(f.x),0,0):new THREE.Vector3(0,0,Math.sign(f.z));const rt=new THREE.Vector3(-ax.z,0,ax.x);
      const v=e.key==='ArrowUp'?ax:e.key==='ArrowDown'?ax.clone().negate():e.key==='ArrowRight'?rt:rt.clone().negate();m.x=Math.round(m.x+v.x*st);m.y=Math.round(m.y+v.z*st);
      g.position.x=m.x;g.position.z=m.y;if(g.userData.mount==='techo'){const pz=AMB[g.userData.amb].piso??PISO;g.position.y=pz+techo(m.x,m.y,pz);}marcarSel();luces();clearTimeout(nudT);nudT=setTimeout(()=>{panel();guardar(g.userData.amb,g.userData.capa);},400);return;}
    if(e.key==='Delete'||e.key==='Backspace'){cur().items=cur().items.filter(x=>x.id!==sel);sel=null;armar();panel();guardar();e.preventDefault();}
    if(e.key==='Escape'){sel=null;marcarSel();panel();}});

  armar();panel();
  setTimeout(()=>{/* las lucarnas corredizas de costado esquivan los reflectores del alero: se rearman cuando ya están */if(visor.params&&visor.params.luTipo==='4'&&visor.rebuild)visor.rebuild();},1500);
  const api={toggle(k){if(k&&k!==capa&&!card.hidden){capa=k;sel=null;try{localStorage.setItem('carhue-equip-capa',capa);}catch(e){}panel();return true;}if(k)capa=k;card.hidden=!card.hidden;try{localStorage.setItem('carhue-equip-panel',card.hidden?'0':'1');}catch(e){}if(card.hidden){sel=null;marcarSel();}else panel();return !card.hidden;},
    get open(){return !card.hidden;},get capa(){return capa;},CAT,CL,ST,setNoche,luces,panel,mallasMue,cajasMue,rearmar:()=>armar(),vis:()=>vis(),
    items(k){const r=[];for(const a of AMB_ORDEN){const s=ST[k]&&ST[k][a];const e=s&&s.esc[s.activo];if(!e)continue;for(const m of e.items){const c=catOf(m.t,k);if(!c)continue;r.push({id:m.id,t:m.t,amb:a,x:m.x,y:m.y,z:(AMB[a].piso??PISO),r:m.r||0,p:{...c.p,...(m.p||{})},n:c.n,sist:c.sist});}}return r;},
    escenarios(k){return Object.fromEntries(AMB_ORDEN.map(a=>[a,{activo:ST[k][a].activo,esc:Object.fromEntries(Object.entries(ST[k][a].esc).map(([i,v])=>[i,v.nombre]))}]));},
    setActivo(k,a,i){if(ST[k][a]&&ST[k][a].esc[i]){ST[k][a].activo=i;armar();guardar(a,k);if(!card.hidden)panel();}},vegOn:()=>Object.values(vegCapas).some(v=>v!==false),vegTodo(v){for(const k of ['bajo','medio','arbol'])vegCapas[k]=!!v;try{localStorage.setItem('carhue-veg-capas',JSON.stringify(vegCapas));}catch(e){}vis();if(!card.hidden&&capa==='veg')panel();}};
  visor.equip=api;return api;
}
