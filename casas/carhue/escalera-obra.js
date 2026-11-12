/* Escalera al entrepiso «como está en obra» (Maxi, 11/11/2026). La armó Maxi en dos módulos de limones de 2″ con huellas de 2″×10″
   encastradas: el tramo de arriba ya está fijo (8 huellas, alzada 18, la última alzada hasta el entrepiso también 18); el de abajo
   gira 90° hacia la pileta. Entre los dos va un descanso compensado de 2 triángulos. Medido en obra con los dos módulos nivelados:
   34 cm entre el nivel del descanso y la huella de arriba del módulo de abajo → 2 alzadas de 17, no de 18. El alisado sube el piso 2–3 cm.
   Variantes (p.escObra):
     '17'     — como está: módulo de abajo de 3 huellas apoyado en el contrapiso; triángulos a 17 + 17; el primer escalón queda en 15.
     'tarima' — módulo de abajo recortado a 2 huellas sobre una tarima de 1 × 1 m; todas las alzadas en 18 y sólo la de la tarima en 13.
   Alturas desde el piso terminado (z 0); contrapiso a −3. Se arma desde el piso hacia arriba: con 8 huellas arriba llega a +2,47,
   y el entrepiso del modelo está a +2,62 (diferencia a medir: o el modelo está alto, o el tramo de arriba tiene otra cantidad de huellas).
   Postecito de 3″×3″ en la esquina interior del giro: se abulona de costado al limón de arriba y después al de abajo. El armazón del descanso (vigas, poste exterior, apoyo en la columna C-01) es una propuesta.
   geo: el de motor/visor3d.js; Pt(id,nombre,cat,geos,info,ex); o = {X0,X1,YE,H_EP,COL}. Coordenadas de Carhué (cm), z hacia arriba. */
export function escaleraObra(geo,Pt,p,o){const {box,prism,rod,minus,f1}=geo;
  const {X0,X1,YE,H_EP,COL}=o,v=p.escObra==='tarima'?'tarima':'17';
  const R=18,G=24,TD=25,TT=4.5,F=5,D=25,ALI=3,ZC=-ALI,PS=7.5;/* alzada, avance, huella, espesor de huella, limón 2″ de 25 de alto, alisado, poste 3″ */
  const ZD2=88+ZC;/* nivel del descanso (triángulo alto) = 85: 3 alzadas de 18 + 34 desde el contrapiso */
  const RW=v==='tarima'?R:17,ZD1=ZD2-RW,nUp=8,ZTOP=ZD2+R*(nUp+1);/* triángulo bajo; llegada real arriba */
  const nLo=v==='tarima'?2:3,ZT=13+0,ZBASE=v==='tarima'?ZT:ZC;/* huellas del módulo de abajo; tarima de 13 */
  const yT=YE+nUp*G,W=X1-X0,yE2=yT+W;/* el descanso ocupa x X0..X1, y yT..yT+W; esquina interior (X1,yT), exterior (X0,yT+W) */
  const PO=[X1-F-PS,X1-F,yT+F,yT+F+PS];/* postecito (Maxi 11/11, con la foto): al sur del limón de arriba, contra su cara de adentro; el limón de abajo pasa por debajo de la punta del de arriba y se le abulona de costado */
  const T=[],Z=[],P=[],V=[],H=[],K=[],TA=[];
  const rodK=(a,b,r=.6)=>K.push(rod(a,b,r,8));
  /* tramo de arriba: huella j (desde arriba) a ZTOP−18j, entre y YE+(j−1)G e YE+jG (+1 de vuelo de nariz) */
  for(let j=1;j<=nUp;j++){const z=ZTOP-R*j,y0=YE+(j-1)*G-1;T.push(box(X0+F,X1-F,z-TT,z,y0,y0+TD));}
  const kU=R/G,topU=y=>ZTOP-R*(y-YE)/G+5,dU=D*Math.hypot(1,kU),zMinU=ZD1-RW+21;/* la punta del limón de arriba queda 21 sobre la huella de arriba del módulo de abajo (foto) */
  for(const [xa,inner] of [[X0,false],[X1-F,true]]){const yEnd=inner?PO[3]:yT;/* el del giro sigue hasta tapar el postecito, que se le abulona */
    const pr=[[YE,topU(YE)],[yEnd,topU(yEnd)],[yEnd,Math.max(zMinU,topU(yEnd)-dU)],[YE,topU(YE)-dU]];
    const yq=YE+(ZTOP+5-dU-zMinU)*G/R;if(yq<yEnd)pr.splice(3,0,[yq,zMinU]);Z.push(prism(pr,xa,xa+F,'ZY'));}
  /* descanso compensado: triángulo alto (entra del tramo de arriba) y bajo (sale al módulo de abajo); la diagonal va de la esquina interior a la exterior */
  const huecos=[[PO[0],X1,yT,PO[3]]];if(COL)huecos.push([COL.x0,COL.x1,COL.y0,COL.y1]);
  const tri2=[[X0,yT],[X1,yT],[X0,yE2]],tri1=[[X1,yT],[X1,yE2],[X0,yE2]];
  const losa=(pl,z,hs,dest)=>{for(const q of minus(pl,hs))dest.push(prism(q,z-TT,z,'XZ'));};
  losa(tri2,ZD2,huecos,T);losa(tri1,ZD1,huecos,T);
  /* armazón del descanso (propuesta): vigas de 2″×8″ en los bordes, la diagonal hace de contrahuella entre los dos triángulos */
  const BD=19;
  for(const [a,b] of COL&&COL.x0<X0+F&&COL.y0>yT?[[yT,COL.y0],[COL.y1,yE2-PS]]:[[yT,yE2-PS]])V.push(box(X0+F,X0+2*F,ZD2-TT-BD,ZD2-TT,a,b));/* V1: borde de afuera del triángulo alto, junto a C-01 */
  V.push(box(X0+2*F,PO[0],ZD2-TT-BD,ZD2-TT,yT,yT+F));/* V2: cabezal bajo la entrada del triángulo alto, entre los limones de arriba */
  V.push(box(X0+PS,X1,ZD1-TT-BD,ZD1-TT,yE2-F,yE2));/* V3: borde de afuera del triángulo bajo */
  {/* V4: diagonal de 2″ de la esquina interior al poste de afuera; su cara es la contrahuella entre los triángulos */
    const a=[PO[0]-3,PO[3]+3],b=[X0+PS+3,yE2-PS-3],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=[(b[1]-a[1])/L*F/2,-(b[0]-a[0])/L*F/2];
    V.push(prism([[a[0]-n[0],a[1]-n[1]],[b[0]-n[0],b[1]-n[1]],[b[0]+n[0],b[1]+n[1]],[a[0]+n[0],a[1]+n[1]]],ZD1-TT-BD,ZD2-TT,'XZ'));}
  /* postes: el postecito real (esquina interior) y el de afuera (propuesta), desde el contrapiso */
  P.push(box(PO[0],PO[1],ZC,ZD2-TT,PO[2],PO[3]));
  V.push(box(X0,X0+PS,ZC,ZD2-TT,yE2-PS,yE2));
  /* módulo de abajo: baja hacia la pileta (+x); huella k (desde arriba) a ZD1−RW−18(k−1), entre x X1+(k−1)G y X1+(k−1)G+TD */
  const zLo=k=>ZD1-RW-R*(k-1);for(let k=1;k<=nLo;k++){const x0=X1+(k-1)*G;losa([[x0,yT+F],[x0+TD,yT+F],[x0+TD,yE2-F],[x0,yE2-F]],zLo(k),[[PO[0],PO[1],PO[2],PO[3]]],T);}
  const xN=X1+G,topL=x=>zLo(1)-R*(x-xN)/G+5,dL=D*Math.hypot(1,R/G),zCap=ZD1-TT;
  const xb=xN+(zLo(1)+5-ZBASE)*G/R,xbB=xN+(zLo(1)+5-dL-ZBASE)*G/R;
  for(const [ya,near] of [[yT,true],[yE2-F,false]]){const xs=near?PO[0]:X1,sh=[[xs,Math.min(zCap,topL(xs))]];
    if(topL(xs)>zCap){const xq=xN+(zLo(1)+5-zCap)*G/R;if(xq>xs)sh.push([xq,zCap]);}
    sh.push([xb,ZBASE]);if(xbB>xs)sh.push([xbB,ZBASE]);else sh.push([xs,ZBASE]);if(xbB>xs)sh.push([xs,Math.max(ZBASE,topL(xs)-dL)]);
    Z.push(prism(sh,ya,ya+F,'XY'));
    /* pie: ángulo de 2″×3/16″ por fuera, 2 tirafondos al limón y 2 brocas al piso o a la tarima */
    const xq=Math.max(xs,xbB)+6;if(near)H.push(box(xq,xq+10,ZBASE,ZBASE+8,ya-.5,ya),box(xq,xq+10,ZBASE,ZBASE+.5,ya-5,ya-.5));else H.push(box(xq,xq+10,ZBASE,ZBASE+8,ya+F,ya+F+.5),box(xq,xq+10,ZBASE,ZBASE+.5,ya+F+.5,ya+F+5));}
  const xNos=X1+nLo*G;/* nariz de la huella más baja */
  /* tarima: 1 m por delante de la huella más baja, 13 de alto sobre el piso terminado; bastidor de 2″×4″ y tapa de 1″ */
  const xT0=Math.min(xbB,xNos)-8,xT1=xNos+100;
  if(v==='tarima'){TA.push(box(xT0,xT1,ZT-2.5,ZT,yT-5,yE2+5));
    for(const [a,b] of [[yT-5,yT],[yE2,yE2+5],[yT+47.5,yT+52.5]])TA.push(box(xT0,xT1,0,ZT-2.5,a,b));for(const [a,b] of [[xT0,xT0+5],[xT1-5,xT1]])TA.push(box(a,b,0,ZT-2.5,yT,yT+47.5),box(a,b,0,ZT-2.5,yT+52.5,yE2));}
  /* bulones de 3/8″: limón de arriba ↔ postecito (pasantes en x), limón de abajo ↔ postecito (pasantes en y), diagonal ↔ poste de afuera */
  const cx=(PO[0]+PO[1])/2,cy=(PO[2]+PO[3])/2;
  for(const z of [zMinU+2.5,ZD2-TT-2.5])rodK([PO[0]-.6,z,cy],[X1+.6,z,cy]);
  for(const z of [ZD1-TT-3,ZD1-TT-10])rodK([cx,z,yT-.6],[cx,z,PO[3]+.6]);
  for(const z of [ZD1-TT-5,ZD1-TT-14])rodK([X0-.6,z,yE2-PS/2],[X0+PS+.6,z,yE2-PS/2]);
  /* pie del postecito: estribo de chapa en U (2 brocas Ø10) */H.push(box(PO[0]-1,PO[1]+1,ZC,ZC+.5,PO[2]-1,PO[3]+1),box(PO[0],PO[1],ZC+.5,ZC+12,PO[3],PO[3]+.5));
  /* resumen */
  const rs=v==='tarima'?`tarima 13 · ${nLo}×18 · triángulos 18 + 18 · ${nUp+1}×18`:`1er escalón ${f1(zLo(nLo)-TT+TT)} desde el piso terminado (18 desde el contrapiso) · ${nLo-1}×18 · triángulos 17 + 17 · ${nUp+1}×18`;
  const dif=H_EP-ZTOP;
  const info=`Como está en obra · ${v==='tarima'?'con tarima':'triángulos a 17'} · ${rs} · llega a +${(ZTOP/100).toFixed(2).replace(".",",")}${Math.abs(dif)>1?` · ⚠ el entrepiso del modelo está a +${(H_EP/100).toFixed(2).replace(".",",")}: ${f1(dif)} cm de diferencia, a medir`:''}`;
  const G1={group:'Escalera',tags:['PB','escalera']};
  Pt('ESC1-T','ESC-1 · huellas y triángulos','ep',T,{fn:`Escalera al entrepiso como está en obra. Huellas de 2″×10″ encastradas en los limones; descanso compensado de 2 triángulos: el alto a +${f1(ZD2)} (nivel del rebaje del limón de arriba) y el bajo a +${f1(ZD1)}. ${info}.`,sec:'huellas de 2″',med:info},G1);
  Pt('ESC1-Z','ESC-1 · limones','cabio',Z,{fn:`Limones de 2″ (5 × 25). Arriba, ${nUp} huellas a 18; el limón del lado del giro sigue hasta el postecito y se le atornilla de costado. Abajo, ${nLo} huellas a 18${v==='tarima'?' (el módulo se recorta: pierde la huella de abajo) apoyado sobre la tarima':', apoyado en el contrapiso'}; el limón de este lado también se atornilla al postecito.`},G1);
  Pt('ESC1-P','ESC-1 · postecito','cabio',P,{fn:'Postecito de 3″×3″ que Maxi atornilló al limón de arriba, en la esquina interior del giro; ahí se atornilla también el limón de abajo. Del contrapiso al triángulo alto, con estribo de chapa al pie.',sec:'3″ × 3″'},G1);
  Pt('ESC1-V','ESC-1 · armazón del descanso (propuesta)','cabio',V,{fn:'Propuesta, no está hecho: vigas de 2″×8″ en el borde de afuera de cada triángulo (la del triángulo alto se abulona a la columna C-01), cabezal bajo la entrada del triángulo alto y una diagonal de 2″ del postecito al poste de afuera, cuya cara es la contrahuella entre los dos triángulos. Poste de 3″×3″ en la esquina de afuera.'},G1);
  Pt('ESC1-H','ESC-1 · herrajes','herraje',H,{fn:'Ángulos de 2″×3/16″ al pie de los limones de abajo (2 tirafondos de 5/16″ al limón y 2 brocas Ø8 al piso o a la tarima) y estribo de chapa en U al pie del postecito.'},G1);
  Pt('ESC1-K','ESC-1 · bulones','perno',K,{fn:'Bulones pasantes de 3/8″ con arandelas grandes: 2 del limón de arriba al postecito, 2 del limón de abajo al postecito, 2 de la viga de afuera a la columna C-01 y 2 de la diagonal al poste de afuera.'},G1);
  if(TA.length)Pt('ESC1-R','ESC-1 · tarima de arranque','ep',TA,{fn:'Tarima de 1 × 1 m y 13 de alto sobre el piso terminado (medir después del alisado): bastidor de 2″×4″ con un travesaño al medio y tapa de tablas de 1″ o fenólico de 18. El módulo de abajo se apoya y se fija encima. Borde con contraste para que se vea al bajar.',med:'100 × 100 × 13'},G1);
  return {info,fp:{x0:X0,x1:v==='tarima'?xT1:xb,y0:YE,y1:yE2}};
}
