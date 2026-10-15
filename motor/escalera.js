/* Escalera compensada, traída del visor «Escalera compensada» (otra conversación) y puesta como acceso al entrepiso.
   Geometría local original: el tramo existente sube en +X desde X=0 (primera pedada a +105); el giro (2 compensadas) en
   X -95…5; el tramo bajo (3 escalones) baja hacia +Z. Acá el tramo existente sigue hasta el piso del entrepiso (+262,5,
   15 alzadas de 17,5), con 9 pedadas en vez de las 6 que mostraba aquel visor. */
export function escaleraCompensada(geo){
const {THREE,prism,box,rod,clip,minus,extent,f1,f0}=geo;

/* Escalera compensada (primera escalera): giro a la derecha, 3 escalones rectos + 2 compensadas
   hasta la primera pedada existente a +105. Geometría tomada del modelo original. */
const R=17.5, G=24, k=R/G, TH=5, NOSE=1, EXP=2.5, SD=30;
const cosT=G/Math.hypot(G,R), sinT=R/Math.hypot(G,R), VD=SD/cosT;
const y=i=>i*R, uC1=y(4)-TH, uC2=y(5)-TH, BD=19, o=2.5*Math.SQRT2, S2=Math.SQRT1_2;
function beam(p0,p1,w,y0,h){const dx=p1[0]-p0[0],dz=p1[1]-p0[1],L=Math.hypot(dx,dz);const g=new THREE.BoxGeometry(L,h,w);g.rotateY(Math.atan2(-dz,dx));g.translate((p0[0]+p1[0])/2,y0+h/2,(p0[1]+p1[1])/2);return g;}
function stringerPoly(treads,sHigh,opt){const t0=treads[0];const top=s=>t0.yt-EXP+k*(s-t0.sf);const bot=s=>top(s)-VD;
  const pts=[[sHigh,bot(sHigh)]];
  if(opt.cap!=null&&top(sHigh)>opt.cap){pts.push([sHigh,opt.cap]);pts.push([t0.sf+(opt.cap-(t0.yt-EXP))/k,opt.cap]);}else pts.push([sHigh,top(sHigh)]);
  const tr=treads.filter(t=>t.sb<=sHigh+1e-6);
  for(let i=tr.length-1;i>=0;i--){const t=tr[i];pts.push([t.sf+EXP/k,t.yt],[t.sb,t.yt],[t.sb,t.yu],[t.sf,t.yu]);if(i>0)pts.push([t.sf,t.yt-EXP]);}
  const sLow=tr[0].sf;
  if(opt.low==='floor')pts.push([sLow,0],[t0.sf+(VD-(t0.yt-EXP))/k,0]);else pts.push([sLow,opt.tongueTop],[sLow-opt.tongue,opt.tongueTop],[sLow-opt.tongue,bot(sLow-opt.tongue)]);
  return {pts,top,bot};}
const GROUPS={'Estructura del giro':['P1','P2','P3','P4','V1','V2','V3','V4','V5','L1'],'Tramo bajo':['Z1','Z2','E1','E2','E3'],'Compensadas':['C1','C2','T1','T2'],'Herrajes':['H1','H2','B1'],'Existente':['ZE1','ZE2','TE']};
const TAGS={P1:['postes'],P2:['postes'],P3:['postes'],P4:['postes'],V1:['vigas'],V2:['vigas'],V3:['vigas'],V5:['vigas'],Z1:['zancas'],Z2:['zancas'],E1:['pedadas'],E2:['pedadas'],E3:['pedadas'],C1:['compensadas'],C2:['compensadas'],T1:['travesaños'],T2:['travesaños']};
const params=[];
const parts=[];function P(id,name,cat,geos,info){parts.push({id,name,cat,geos:[].concat(geos),info});}
// Existente: zanca recta = capa exterior lisa (3,5) + capa interior (1,5) con las muescas de encaje
function stringerPlain(treads,sHigh,opt){const t0=treads[0];const top=s=>t0.yt-EXP+k*(s-t0.sf);const bot=s=>top(s)-VD;
  const pts=[[sHigh,bot(sHigh)]];
  if(opt.cap!=null&&top(sHigh)>opt.cap){pts.push([sHigh,opt.cap],[t0.sf+(opt.cap-(t0.yt-EXP))/k,opt.cap]);}else pts.push([sHigh,top(sHigh)]);
  const sLow=t0.sf;pts.push([sLow,top(sLow)]);
  if(opt.low==='floor')pts.push([sLow,0],[t0.sf+(VD-(t0.yt-EXP))/k,0]);
  else pts.push([sLow,opt.tongueTop],[sLow-opt.tongue,opt.tongueTop],[sLow-opt.tongue,bot(sLow-opt.tongue)]);
  return pts;}
const XL=215, exTreads=[];for(let j=0;j<9;j++)exTreads.push({sf:24*j-NOSE,sb:24*j+G,yu:y(6+j)-TH,yt:y(6+j)});
const exOpt={low:'tongue',tongue:-4.5,tongueTop:uC2};
const exS=stringerPoly(exTreads,XL,exOpt), exP=stringerPlain(exTreads,XL,exOpt);
P('ZE1','ZE1 · Zanca existente, lado fondo','exist',[prism(exP,-5,-1.5,'XY'),prism(exS.pts,-1.5,0,'XY')],{fn:'Zanca del tramo existente, lado opuesto a la cámara de la foto 2.',sec:'2″×12″ (≈5×30), a verificar',med:'Recorte: a plomo a ras del frente de la primera pedada hasta +82,5; debajo se retira 4,5 (asienta sobre P2) y deja la espiga de 1,5 que entra en el poste',u:'U1'});
P('ZE2','ZE2 · Zanca existente, lado cámara','exist',[prism(exS.pts,90,91.5,'XY'),prism(exP,91.5,95,'XY')],{fn:'Zanca interior del giro (lado de la cámara de la foto 2).',sec:'2″×12″ (≈5×30), a verificar',med:'Mismo recorte que ZE1; asienta sobre P1',u:'U1'});
P('TE','Pedadas existentes','exist',exTreads.map(t=>box(t.sf,t.sb,t.yu,t.yt,-1.5,91.5)),{fn:'Tramo existente. La primera pedada queda a +105.',sec:'2″ × 25',med:'93 de largo, encajadas 1,5 en cada zanca',u:'—'});

// Postes centrados en las esquinas del cuadrado
const B=2;
const P1r=[-5,5,85,95], P2r=[-5,5,-5,5], P3r=[-95,-85,-5,5], P4r=[-95,-85,85,95];
const CH=3.6;
const p3plan=[[P3r[0],P3r[2]],[P3r[1],P3r[2]],[P3r[1],P3r[3]-CH],[P3r[1]-CH,P3r[3]],[P3r[0],P3r[3]]];
const p1plan=[[P1r[0]+CH,P1r[2]],[P1r[1],P1r[2]],[P1r[1],P1r[3]],[P1r[0],P1r[3]],[P1r[0],P1r[2]+CH]];
P('P1','P1 · Poste de giro (interior)','poste',[box(P1r[0],P1r[1],B,uC2-BD,P1r[2],P1r[3]),prism(p1plan,uC2-BD,uC2,'XZ')],{fn:'Ángulo interior del giro. ZE2 asienta en su cabeza; recibe V2, V4 (en el chaflán) y Z1. Atraviesa E3 y C1.',sec:'4″×4″ (10×10)',med:'80,5 (de +2 a +82,5). Chaflán de 3,6 en la arista que mira al giro, de +63,5 a +82,5',u:'U1 · U2 · U3 · U6 · U9'});
P('P2','P2 · Poste bajo zanca del fondo','poste',box(P2r[0],P2r[1],B,uC2,P2r[2],P2r[3]),{fn:'ZE1 asienta en su cabeza; recibe V1 y V2. C2 apoya encima.',sec:'4″×4″ (10×10)',med:'80,5 (de +2 a +82,5)',u:'U1 · U2 · U9'});
P('P3','P3 · Poste esquina exterior','poste',[box(P3r[0],P3r[1],B,uC2-BD,P3r[2],P3r[3]),prism(p3plan,uC2-BD,uC2,'XZ')],{fn:'Esquina exterior del giro. Recibe V1, V3 y V4 (en el chaflán). Atraviesa C1 y lleva C2 encima.',sec:'4″×4″ (10×10)',med:'80,5. Chaflán de 3,6 en la arista que mira al giro, de +63,5 a +82,5',u:'U2 · U3 · U9'});
P('P4','P4 · Poste lado jardín','poste',box(P4r[0],P4r[1],B,uC1,P4r[2],P4r[3]),{fn:'Recibe V3 y Z2 desde lados opuestos, atados con una varilla pasante. C1 apoya encima; atraviesa E3.',sec:'4″×4″ (10×10)',med:'63 (de +2 a +65)',u:'U2 · U6 · U9'});

// Vigas 2"x8" en el plano de las zancas
P('V1','V1 · Viga de borde, lado fondo','viga',box(P3r[1],P2r[0],uC2-BD,uC2,-5,0),{fn:'Lleva el borde exterior de C2. Queda en el mismo plano que la zanca existente ZE1.',sec:'2″×8″ (5×19)',med:`${f1(P2r[0]-P3r[1]+3)} = ${f1(P2r[0]-P3r[1])} libre + 2 cajas de 1,5. Canto superior +82,5`,u:'U2'});
P('V2','V2 · Cabezal bajo el primer escalón','viga',box(-5,0,uC2-BD,uC2,P2r[3],P1r[2]),{fn:'Lleva el borde trasero de C2, bajo la nariz de la primera pedada existente.',sec:'2″×8″ (5×19)',med:`${f1(P1r[2]-P2r[3]+3)}. Canto superior +82,5`,u:'U2'});
P('V3','V3 · Viga de borde, lado jardín','viga',box(-95,-90,uC1-BD,uC1,P3r[3],P4r[2]),{fn:'Lleva el borde exterior de C1. Queda en el mismo plano que la zanca Z2.',sec:'2″×8″ (5×19)',med:`${f1(P4r[2]-P3r[3]+3)}. Canto superior +65`,u:'U2 · U6'});
P('V5','V5 · Viga de frente de C1','viga',prism([[P4r[1],uC1-BD],[P1r[0],uC1-BD],[P1r[0],uC2-BD],[P1r[0]-7,uC2-BD],[P1r[0]-7,uC1],[P4r[1],uC1]],85,90,'XY'),{fn:'Lleva el frente (nariz) de C1, donde terminan sus tablas diagonales.',sec:'2″×8″ (5×19)',med:`${f1(P1r[0]-P4r[1]+3)}. Canto superior +65. Rebaje de 1,5 × 7 en la punta de P1 para pasar bajo V4`,u:'U2'});
const dA=[P3r[1],P3r[3]], dB=[P1r[0],P1r[2]], dSpan=Math.hypot(dB[0]-dA[0],dB[1]-dA[1]), dEnd=CH*S2+1.5;
let dPoly=[[-130,-130+90-o],[40,40+90-o],[40,40+90+o],[-130,-130+90+o]];
dPoly=clip(dPoly,S2,S2,-S2*(dA[0]+dA[1])+dEnd);
dPoly=clip(dPoly,-S2,-S2,S2*(dB[0]+dB[1])+dEnd);
const dLen=extent(dPoly,[S2,S2]).L;
P('V4','V4 · Diagonal (contrahuella estructural)','diag',prism(dPoly,uC2-BD,uC2,'XZ'),{fn:'Pieza clave del giro: lleva la nariz de C2 encima y, en su otra cara, el listón donde apoya C1. Su cara del lado de C1 es la contrahuella entre las dos compensadas.',sec:'2″×8″ (5×19)',med:`${f1(dLen)}, testas a escuadra. Entra 1,5 en el chaflán de P3 y de P1`,u:'U3'});
let lPoly=[[-130,-130+90+o],[40,40+90+o],[40,40+90+o+5*Math.SQRT2],[-130,-130+90+o+5*Math.SQRT2]];
lPoly=clip(lPoly,1,0,-P3r[1]); lPoly=clip(lPoly,-1,0,P1r[0]); lPoly=clip(lPoly,0,-1,85);
const lLen=extent(lPoly,[S2,S2]).L;
P('L1','L1 · Listón de apoyo de C1','liston',prism(lPoly,uC1-5,uC1,'XZ'),{fn:'Atornillado a la cara de V4. Lleva el borde trasero (diagonal) de C1.',sec:'2″×2″ (5×5)',med:`${f1(lLen)}, extremos a 45°. Canto superior +65, a ras de V3`,u:'U4'});

// Tramo bajo
const lowTreads=[{sf:-163,sb:-138,yu:y(1)-TH,yt:y(1)},{sf:-139,sb:-114,yu:y(2)-TH,yt:y(2)},{sf:-115,sb:-90,yu:y(3)-TH,yt:y(3)}];
const zOpt={low:'floor',cap:uC1};
const zS=stringerPoly(lowTreads,-93.5,zOpt), zP=stringerPlain(lowTreads,-93.5,zOpt);
const zPts=zS.pts.map(p=>[-p[0],p[1]]), zPP=zP.map(p=>[-p[0],p[1]]);
const zLen=(()=>{let a=1e9,b=-1e9;for(const p of zP){const u=p[0]*cosT+p[1]*sinT;a=Math.min(a,u);b=Math.max(b,u);}return b-a;})();
const sFloor=lowTreads[0].sf+(VD-(lowTreads[0].yt-EXP))/k, floorCut=sFloor-lowTreads[0].sf;
P('Z1','Z1 · Zanca interior, tramo bajo','zanca',[prism(zPts,0,1.5,'ZY'),prism(zPP,1.5,5,'ZY')],{fn:'Lado interior (hacia el ambiente). Arriba entra 1,5 en P1, abajo apoya en el piso.',sec:'2″×12″ (5×30)',med:`Tabla de ≈${f0(zLen+4)}. Cabeza a nivel +65, corte de piso de ${f1(floorCut)}, 3 muescas de encaje de 1,5 de profundidad en la cara interior`,u:'U6 · U7 · U8'});
P('Z2','Z2 · Zanca exterior, tramo bajo','zanca',[prism(zPts,-91.5,-90,'ZY'),prism(zPP,-95,-91.5,'ZY')],{fn:'Lado jardín. Arriba entra 1,5 en P4, abajo apoya en el piso.',sec:'2″×12″ (5×30)',med:'Igual a Z1, en espejo',u:'U6 · U7 · U8'});
const E3poly=minus([[-91.5,90],[1.5,90],[1.5,115],[-91.5,115]],[P1r,P4r]);
P('E1','E1 · Pedada +17,5','pedada',box(-91.5,1.5,y(1)-TH,y(1),138,163),{fn:'Primer escalón desde el piso.',sec:'2″×10″ (5×25)',med:'93 de largo: 90 libre + 1,5 encajado en cada zanca. 24 de pedada + 1 de nariz',u:'U7'});
P('E2','E2 · Pedada +35','pedada',box(-91.5,1.5,y(2)-TH,y(2),114,139),{fn:'Segundo escalón.',sec:'2″×10″ (5×25)',med:'93 de largo',u:'U7'});
P('E3','E3 · Pedada +52,5','pedada',E3poly.map(q=>prism(q,y(3)-TH,y(3),'XZ')),{fn:'Tercer escalón, el último recto antes del giro. Su borde trasero queda bajo la nariz de C1 y se escotea alrededor de P1 y P4.',sec:'2″×10″ (5×25)',med:'93 de largo, escotaduras de 6,5 × 5 en las esquinas traseras',u:'U7'});

// Compensadas: sin vuelo al costado, a ras de la cara exterior de V3 y V1
let c1=[[-95,0],[0,0],[0,90+NOSE],[-95,90+NOSE]]; c1=clip(c1,-1,1,-(90+o));
const sMin=-(2.5+NOSE), sMax=95*S2, stp=(sMax-sMin)/3;
const c1Strips=[[sMin-stp,-2.5],[sMin-2*stp,sMin-stp],[sMin-3*stp,sMin-2*stp]].map(([s0,s1])=>{let q=clip(c1,S2,-S2,90*S2-s0);q=clip(q,-S2,S2,-90*S2+s1);return q;}).filter(q=>q.length>2);
const c1Boards=[];c1Strips.forEach(st=>minus(st,[P3r,P1r]).forEach(q=>c1Boards.push(q)));
const c1Info=c1Strips.map(q=>extent(q,[S2,S2]));
P('C1','C1 · Compensada baja +70','c1',c1Boards.map(p=>prism(p,uC1,y(4),'XZ')),{fn:'Primera compensada (45°). Mitad del panel cuadrado común con C2. Apoya en V3, V5, L1 y P4. Se escotea alrededor de P3 y P1. Al costado queda a ras de la cara exterior de V3.',sec:'Tablas de 2″ (5), veta paralela a la diagonal',med:`3 tablas de ${f1(stp)}, alineadas con las de C2. Nariz de 1 sobre E3`,u:'U5'});
let c2=[[-90,-5],[0,-5],[0,90],[-90,90]]; c2=clip(c2,1,-1,90+o+Math.SQRT2);
const c2Strips=[0,1,2].map(i=>{const s0=sMin+i*stp,s1=sMin+(i+1)*stp;let p=clip(c2,S2,-S2,90*S2-s0);p=clip(p,-S2,S2,-90*S2+s1);return p;}).filter(p=>p.length>2);
const c2Info=c2Strips.map(p=>extent(p,[S2,S2]));
const c2Boards=c2Strips;
P('C2','C2 · Compensada alta +87,5','c2',c2Boards.map(p=>prism(p,uC2,y(5),'XZ')),{fn:'Segunda compensada (45°). Mitad del panel cuadrado común con C1. Apoya en V1, V2, V4 y en la cabeza de P1, P2 y P3. Vuela 1 sobre la cara de V4; al costado queda a ras de la cara exterior de V1.',sec:'Tablas de 2″ (5), veta paralela a la nariz diagonal',med:`3 tablas de ${f1(stp)} de ancho`,u:'U5'});
{const M=[-45,45],n=[S2,-S2];P('T1','Travesaño bajo C1','liston',beam([M[0]-9*n[0],M[1]-9*n[1]],[M[0]-45*n[0],M[1]-45*n[1]],2.5,uC1-7.5,7.5),{fn:'Mantiene unidas las tablas de C1, perpendicular a ellas. No es estructural.',sec:'1″×3″ (2,5×7,5)',med:'36',u:'U5'});}
{const M=[-45,45],n=[S2,-S2];P('T2','Travesaño bajo C2','liston',beam([M[0]+3*n[0],M[1]+3*n[1]],[M[0]+45*n[0],M[1]+45*n[1]],2.5,uC2-7.5,7.5),{fn:'Mantiene unidas las tablas de C2, perpendicular a ellas. No es estructural.',sec:'1″×3″ (2,5×7,5)',med:'42',u:'U5'});}

// Herrajes y bulonería
const hw=[];
for(const r of [P1r,P2r,P3r,P4r]){const cx=(r[0]+r[1])/2,cz=(r[2]+r[3])/2;hw.push(box(cx-6,cx+6,0,0.6,cz-6,cz+6),box(cx-4,cx+4,0,14,cz+5,cz+5.5),box(cx-4,cx+4,0,14,cz-5.5,cz-5),box(cx-1.5,cx+1.5,0.6,B,cz-5,cz+5));}
P('H1','Herrajes de base de postes','herraje',hw,{fn:'Separan el poste 2 cm del piso y lo anclan.',sec:'Chapa 3/16″ (4,8 mm) doblada en U',med:'Base 12×12, alas de 14. 2 brocas Ø10 al piso; 2 bulones M10 por poste',u:'U9'});
P('H2','Ángulos de pie de zanca','herraje',[box(5,5.5,0,8,140,150),box(5,10,0,0.5,140,150),box(-95.5,-95,0,8,140,150),box(-100,-95,0,0.5,140,150)],{fn:'Anclan el pie de Z1 y Z2 al piso, del lado de afuera.',sec:'Ángulo 2″×3/16″',med:'10 de largo, 2 tirafondos 5/16″ a la zanca, 2 brocas Ø8 al piso',u:'U8'});
const r12=0.6,r10=0.5,bl=[],u=[S2,S2];
bl.push(rod([-20,80,-2.5],[12,80,-2.5],r12));                 // P2: varilla pasante V1-P2-ZE1
bl.push(rod([-2.5,70,-5.4],[-2.5,70,20],r12));                // P2: V2
bl.push(rod([-5.4,80,92.5],[12,80,92.5],r12));                // P1: ZE2
bl.push(rod([-2.5,70,95.4],[-2.5,70,70],r12));                // P1: V2
bl.push(rod([P1r[1]+0.3,75,P1r[3]+0.3],[dB[0]-10*u[0],75,dB[1]-10*u[1]],r12)); // P1: V4
bl.push(rod([2.5,45,84.6],[2.5,45,110],r12));                 // P1: Z1
bl.push(rod([-95.4,75,-2.5],[-70,75,-2.5],r12),rod([-92.5,55,-5.4],[-92.5,55,20],r12)); // P3: V1, V3
bl.push(rod([P3r[0]-0.3,68,P3r[2]-0.3],[dA[0]+10*u[0],68,dA[1]+10*u[1]],r12)); // P3: V4
bl.push(rod([-92.5,50,70],[-92.5,50,108],r12));
bl.push(rod([-95.4,55,87.5],[-70,55,87.5],r12),rod([5.4,55,87.5],[-20,55,87.5],r12)); // V5               // P4: varilla pasante V3-P4-Z2
bl.push(rod([-95.4,40,102],[5.4,40,102],r10),rod([-95.4,20,126],[5.4,20,126],r10),rod([-95.4,6,150],[5.4,6,150],r10));
P('B1','Bulones, pernos y varillas','perno',bl,{fn:'Toda la bulonería del giro. Tocando la pieza se ve el largo de cada varilla.',sec:'M12 (pernos y bulones), Ø10 (varillas bajo pedadas)',med:'Ver pestaña Despiece',u:'U1 · U2 · U3 · U6 · U7'});
return parts;}
