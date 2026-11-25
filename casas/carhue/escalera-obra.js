/* Escalera al entrepiso «como está en obra» (Maxi, 11/11/2026). La armó Maxi en dos módulos de limones de 2″ con huellas de 2″×10″
   encastradas: el tramo de arriba ya está fijo (8 huellas, alzada 18, la última alzada hasta el entrepiso también 18); el de abajo
   gira 90° hacia la pileta. Entre los dos va un descanso compensado de 2 triángulos. Medido en obra con los dos módulos nivelados:
   34 cm entre el nivel del descanso y la huella de arriba del módulo de abajo → 2 alzadas de 17, no de 18. El alisado sube el piso 2–3 cm.
   Arranque decidido por Maxi el 12/11: triángulos a 17 + 17; módulo de abajo de 3 huellas apoyado en el contrapiso; el primer escalón queda en 15.
   Alturas desde el piso terminado (z 0); contrapiso a −3. Se arma desde el piso hacia arriba: con 8 huellas arriba llega a +2,47,
   y Maxi midió el entrepiso a 2,67 sobre el piso de PB actual (25/11; en el modelo +2,66): la diferencia de ~19 es una alzada que falta en algún lado.
   Postecito de 3″×3″ en la esquina interior del giro: se abulona de costado al limón de arriba y después al de abajo. El armazón del descanso (vigas, poste exterior, apoyo en la columna C-01) es una propuesta.
   geo: el de motor/visor3d.js; Pt(id,nombre,cat,geos,info,ex); o = {X0,X1,YE,H_EP,COL}. Coordenadas de Carhué (cm), z hacia arriba. */
export function escaleraObra(geo,Pt,p,o){const {box,prism,rod,minus,f1}=geo;
  const {X0,X1,YE,H_EP,COL}=o;
  const R=18,G=24,TD=25,TT=4.5,F=5,D=25,ALI=3,ZC=-ALI,PS=7.5;/* alzada, avance, huella, espesor de huella, limón 2″ de 25 de alto, alisado, poste 3″ */
  const ZD2=88+ZC;/* nivel del descanso (triángulo alto) = 85: 3 alzadas de 18 + 34 desde el contrapiso */
  const RW=17,ZD1=ZD2-RW,nUp=8,ZTOP=ZD2+R*(nUp+1);/* triángulo bajo; llegada real arriba */
  const nLo=3,ZBASE=ZC;/* huellas del módulo de abajo */
  const yT=YE+nUp*G,W=X1-X0,yE2=yT+W;/* el descanso ocupa x X0..X1, y yT..yT+W; esquina interior (X1,yT), exterior (X0,yT+W) */
  const PO=[X1-F-PS,X1-F,yT+F,yT+F+PS];/* postecito (Maxi 11/11, con la foto): al sur del limón de arriba, contra su cara de adentro; el limón de abajo pasa por debajo de la punta del de arriba y se le abulona de costado */
  /* piezas separadas para la animación de armado (Maxi 18/11): huellas, limones, postes, vigas, herrajes y bulones de cada etapa */
  const Tu=[],Td=[],T2=[],T1=[],Zu=[],Zd=[],P=[],Va=[],Vp=[],Vd=[],Vb=[],Ha=[],Hb=[],Ka=[],Kb=[],Kc=[];
  const rodK=(K,a,b,r=.6)=>K.push(rod(a,b,r,8));
  /* tramo de arriba: huella j (desde arriba) a ZTOP−18j, entre y YE+(j−1)G e YE+jG (+1 de vuelo de nariz) */
  for(let j=1;j<=nUp;j++){const z=ZTOP-R*j,y0=YE+(j-1)*G-1;Tu.push(box(X0+F,X1-F,z-TT,z,y0,y0+TD));}
  const kU=R/G,topU=y=>ZTOP-R*(y-YE)/G+5,dU=D*Math.hypot(1,kU),zMinU=ZD1-RW+21;/* la punta del limón de arriba queda 21 sobre la huella de arriba del módulo de abajo (foto) */
  for(const [xa,inner] of [[X0,false],[X1-F,true]]){const yEnd=inner?PO[3]:yT;/* el del giro sigue hasta tapar el postecito, que se le abulona */
    const pr=[[YE,topU(YE)],[yEnd,topU(yEnd)],[yEnd,Math.max(zMinU,topU(yEnd)-dU)],[YE,topU(YE)-dU]];
    const yq=YE+(ZTOP+5-dU-zMinU)*G/R;if(yq<yEnd)pr.splice(3,0,[yq,zMinU]);Zu.push(prism(pr,xa,xa+F,'ZY'));}
  /* descanso compensado: triángulo alto (entra del tramo de arriba) y bajo (sale al módulo de abajo); la diagonal va de la esquina interior a la exterior */
  const huecos=[[PO[0],X1,yT,PO[3]]];if(COL)huecos.push([COL.x0,COL.x1,COL.y0,COL.y1]);
  const tri2=[[X0,yT],[X1,yT],[X0,yE2]],tri1=[[X1,yT],[X1,yE2],[X0,yE2]];
  const losa=(pl,z,hs,dest)=>{for(const q of minus(pl,hs))dest.push(prism(q,z-TT,z,'XZ'));};
  /* Maxi 25/11: cada triángulo va de 3 tablones con la veta paralela a la diagonal (s = (x−X0)+(y−yT) constante); 4 mm de junta entre tablones */
  const cut=(pl,f)=>{const o=[];for(let i=0;i<pl.length;i++){const P=pl[i],Q=pl[(i+1)%pl.length],fp=f(P),fq=f(Q);if(fp>=-1e-9)o.push(P);if((fp>=-1e-9)!==(fq>=-1e-9)){const t=fp/(fp-fq);o.push([P[0]+t*(Q[0]-P[0]),P[1]+t*(Q[1]-P[1])]);}}return o;};
  const sOf=q=>(q[0]-X0)+(q[1]-yT),JT=.4*Math.SQRT2;
  const tablones=(pl,sa,sb,z,dest)=>{const n=3,st=(sb-sa)/n;for(let i=0;i<n;i++){const a0=sa+i*st+(i?JT/2:0),b0=sa+(i+1)*st-(i<n-1?JT/2:0);const b=cut(cut(pl,q=>sOf(q)-a0),q=>b0-sOf(q));if(b.length>2)losa(b,z,huecos,dest);}};
  tablones(tri2,0,W,ZD2,T2);tablones(tri1,W,2*W,ZD1,T1);
  /* armazón del descanso (propuesta): vigas de 2″×8″ en los bordes, la diagonal hace de contrahuella entre los dos triángulos */
  const BD=19;
  for(const [a,b] of COL&&COL.x0<X0+F&&COL.y0>yT?[[yT,COL.y0],[COL.y1,yE2-PS]]:[[yT,yE2-PS]])Va.push(box(X0+F,X0+2*F,ZD2-TT-BD,ZD2-TT,a,b));/* V1: borde de afuera del triángulo alto, junto a C-01 */
  Va.push(box(X0+2*F,PO[0],ZD2-TT-BD,ZD2-TT,yT,yT+F));/* V2: cabezal bajo la entrada del triángulo alto, entre los limones de arriba */
  Vb.push(box(X0+PS,X1,ZD1-TT-BD,ZD1-TT,yE2-F,yE2));/* V3: borde de afuera del triángulo bajo */
  {/* V4: diagonal de 2″ de la esquina interior al poste de afuera; su cara es la contrahuella entre los triángulos */
    const a=[PO[0]-3,PO[3]+3],b=[X0+PS+3,yE2-PS-3],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=[(b[1]-a[1])/L*F/2,-(b[0]-a[0])/L*F/2];
    Vd.push(prism([[a[0]-n[0],a[1]-n[1]],[b[0]-n[0],b[1]-n[1]],[b[0]+n[0],b[1]+n[1]],[a[0]+n[0],a[1]+n[1]]],ZD1-TT-BD,ZD2-TT,'XZ'));}
  /* postes: el postecito real (esquina interior) y el de afuera (propuesta), desde el contrapiso */
  P.push(box(PO[0],PO[1],ZC,ZD2-TT,PO[2],PO[3]));
  Vp.push(box(X0,X0+PS,ZC,ZD2-TT,yE2-PS,yE2));
  /* módulo de abajo: baja hacia la pileta (+x); huella k (desde arriba) a ZD1−RW−18(k−1), entre x X1+(k−1)G y X1+(k−1)G+TD */
  const zLo=k=>ZD1-RW-R*(k-1);for(let k=1;k<=nLo;k++){const x0=X1+(k-1)*G;losa([[x0,yT+F],[x0+TD,yT+F],[x0+TD,yE2-F],[x0,yE2-F]],zLo(k),[[PO[0],PO[1],PO[2],PO[3]]],Td);}
  const xN=X1+G,topL=x=>zLo(1)-R*(x-xN)/G+5,dL=D*Math.hypot(1,R/G),zCap=ZD1-TT;
  const xb=xN+(zLo(1)+5-ZBASE)*G/R,xbB=xN+(zLo(1)+5-dL-ZBASE)*G/R;
  for(const [ya,near] of [[yT,true],[yE2-F,false]]){const xs=near?PO[0]:X1,sh=[[xs,Math.min(zCap,topL(xs))]];
    if(topL(xs)>zCap){const xq=xN+(zLo(1)+5-zCap)*G/R;if(xq>xs)sh.push([xq,zCap]);}
    sh.push([xb,ZBASE]);if(xbB>xs)sh.push([xbB,ZBASE]);else sh.push([xs,ZBASE]);if(xbB>xs)sh.push([xs,Math.max(ZBASE,topL(xs)-dL)]);
    Zd.push(prism(sh,ya,ya+F,'XY'));
    /* pie: ángulo de 2″×3/16″ por fuera, 2 tirafondos al limón y 2 brocas al piso */
    const xq=Math.max(xs,xbB)+6;if(near)Ha.push(box(xq,xq+10,ZBASE,ZBASE+8,ya-.5,ya),box(xq,xq+10,ZBASE,ZBASE+.5,ya-5,ya-.5));else Ha.push(box(xq,xq+10,ZBASE,ZBASE+8,ya+F,ya+F+.5),box(xq,xq+10,ZBASE,ZBASE+.5,ya+F+.5,ya+F+5));}
  /* bulones de 3/8″: limón de arriba ↔ postecito (pasantes en x), limón de abajo ↔ postecito (pasantes en y), diagonal ↔ poste de afuera */
  const cx=(PO[0]+PO[1])/2,cy=(PO[2]+PO[3])/2;
  for(const z of [zMinU+2.5,ZD2-TT-2.5])rodK(Ka,[PO[0]-.6,z,cy],[X1+.6,z,cy]);
  for(const z of [ZD1-TT-3,ZD1-TT-10])rodK(Kb,[cx,z,yT-.6],[cx,z,PO[3]+.6]);
  for(const z of [ZD1-TT-5,ZD1-TT-14])rodK(Kc,[X0-.6,z,yE2-PS/2],[X0+PS+.6,z,yE2-PS/2]);
  /* pie del postecito: estribo de chapa en U (2 brocas Ø10) */Hb.push(box(PO[0]-1,PO[1]+1,ZC,ZC+.5,PO[2]-1,PO[3]+1),box(PO[0],PO[1],ZC+.5,ZC+12,PO[3],PO[3]+.5));
  /* resumen */
  const rs=`1er escalón ${f1(zLo(nLo)-TT+TT)} desde el piso terminado (18 desde el contrapiso) · ${nLo-1}×18 · triángulos 17 + 17 · ${nUp+1}×18`;
  const dif=H_EP-ZTOP;
  const info=`Como está en obra · triángulos a 17 · ${rs} · llega a +${(ZTOP/100).toFixed(2).replace(".",",")}${Math.abs(dif)>1?` · ⚠ el entrepiso del modelo está a +${(H_EP/100).toFixed(2).replace(".",",")}: ${f1(dif)} cm de diferencia, a medir`:''}`;
  const G1={group:'Escalera',tags:['PB','escalera']};
  Pt('ESC1-Tu','ESC-1 · huellas de arriba','ep',Tu,{fn:`Escalera al entrepiso como está en obra. Tramo de arriba: ${nUp} huellas de 2″×10″ encastradas en los limones, a 18. ${info}.`,sec:'huellas de 2″',med:info},G1);
  Pt('ESC1-T2','ESC-1 · triángulo alto del descanso','ep',T2,{fn:`Triángulo alto del descanso compensado, a +${f1(ZD2)} (nivel del rebaje del limón de arriba): 3 tablones de 2″ con la veta paralela a la diagonal, sobre el cabezal, la viga de afuera y la diagonal.`,sec:'tablas de 2″'},G1);
  Pt('ESC1-T1','ESC-1 · triángulo bajo del descanso','ep',T1,{fn:`Triángulo bajo del descanso compensado, a +${f1(ZD1)}: 3 tablones de 2″ con la veta paralela a la diagonal, sobre la diagonal y la viga de afuera del lado de la pileta.`,sec:'tablas de 2″'},G1);
  Pt('ESC1-Td','ESC-1 · huellas de abajo','ep',Td,{fn:`Módulo de abajo: ${nLo} huellas de 2″×10″ a 18, bajando hacia la pileta.`,sec:'huellas de 2″'},G1);
  Pt('ESC1-Zu','ESC-1 · limones de arriba','cabio',Zu,{fn:`Limones de 2″ (5 × 25) del tramo de arriba, ${nUp} huellas a 18; el del lado del giro sigue hasta el postecito y se le abulona de costado.`},G1);
  Pt('ESC1-Zd','ESC-1 · limones de abajo','cabio',Zd,{fn:`Limones de 2″ (5 × 25) del módulo de abajo, ${nLo} huellas a 18, apoyados en el contrapiso; el de este lado se abulona al postecito.`},G1);
  Pt('ESC1-P','ESC-1 · postecito','cabio',P,{fn:'Postecito de 3″×3″ que Maxi atornilló al limón de arriba, en la esquina interior del giro; ahí se abulona también el limón de abajo. Del contrapiso al triángulo alto.',sec:'3″ × 3″'},G1);
  Pt('ESC1-Va','ESC-1 · vigas del triángulo alto (propuesta)','cabio',Va,{fn:'Propuesta: viga de 2″×8″ en el borde de afuera del triángulo alto (corta en la columna C-01, a la que se abulona) y cabezal bajo la entrada del triángulo alto, entre los limones de arriba.'},G1);
  Pt('ESC1-Vp','ESC-1 · poste de afuera (propuesta)','cabio',Vp,{fn:'Propuesta: poste de 3″×3″ en la esquina de afuera del descanso, del contrapiso al triángulo alto.',sec:'3″ × 3″'},G1);
  Pt('ESC1-Vd','ESC-1 · diagonal (propuesta)','cabio',Vd,{fn:'Propuesta: diagonal de 2″ del postecito al poste de afuera; su cara es la contrahuella entre los dos triángulos y lleva el borde de los dos.'},G1);
  Pt('ESC1-Vb','ESC-1 · viga del triángulo bajo (propuesta)','cabio',Vb,{fn:'Propuesta: viga de 2″×8″ en el borde de afuera del triángulo bajo (lado de la pileta), del poste de afuera al limón de abajo.'},G1);
  Pt('ESC1-Ka','ESC-1 · bulones limón de arriba–postecito','perno',Ka,{fn:'2 bulones pasantes de 3/8″ con arandelas grandes del limón de arriba al postecito.'},G1);
  Pt('ESC1-Kb','ESC-1 · bulones limón de abajo–postecito','perno',Kb,{fn:'2 bulones pasantes de 3/8″ con arandelas grandes del limón de abajo al postecito.'},G1);
  Pt('ESC1-Kc','ESC-1 · bulones de la diagonal','perno',Kc,{fn:'2 bulones pasantes de 3/8″ de la diagonal al poste de afuera.'},G1);
  return {info,fp:{x0:X0,x1:xb,y0:YE,y1:yE2}};
}
