/* Escalera al altillo de Carhué, variantes B2 y B3 (recta contra M-22 + puentecito contra M-26 hasta la puerta P-34). Antes vivía en casa.js;
   pasó a su archivo el 7/11 para que la escena Cocinas (que recorta Carhué desde su modelo) la arme igual (Maxi: «en la cocina de Carhué
   debe estar incluida la escalera al altillo»). Coordenadas de Carhué (cm); quien la usa en otra escena traslada las geometrías en su Pt.
   geo: el de motor/visor3d.js; M: el modelo de Carhué; Pt(id,nombre,cat,geos,info,ex); p: parámetros (escAlt 'B2'|'B3', escB3n, escB3G, escB3k, escB2k). */
export const wingZ=x=>497-Math.abs(x-2103)*(238/332);   /* altura del cielorraso del ala (chapa a dos aguas) en x */
export function escaleraAltilloB(geo,M,Pt,p){const {box,prism,rod,f1}=geo;
  if(p.escAlt==='B3')return escaleraAltilloB3(geo,M,Pt,p);
  const B3=p.escAlt==='B3',ID=B3?'ESC-B3':'ESC-B2',v=M.ABERTURAS.find(o=>o.id==='P-34'),dx0=1817+(v?v.d:246),dx1=dx0+(v?v.w:80),HZ=262,WF=-332.5,XE=2364,R=HZ/(B3?(+p.escB3n||14):14),G=B3?(+p.escB3G||20):23,k=B3?Math.max(1,+p.escB3k||5):(+p.escB2k||5),hL=HZ-k*R,u=x=>wingZ(x)-19;
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
    Pt(ID+'r',`${ID} · baranda`,'acero',rods,{fn:'Pasamanos y parantes.'},{group:'Escalera',tags:['PB','escalera']});
}

/* B3 (Maxi 8/11): descanso quebrado. En lugar del descanso plano del rincón y el puentecito, el giro se hace con 4 escalones compensados
   alrededor de un pilarote en la esquina interior, y del rincón a la puerta los escalones siguen subiendo contra M-26 hasta la plataforma de P-34.
   Gana altura libre (ya no hay tramo plano alto bajo el faldón) y el tramo contra M-22 queda corto y bajo: no tapa la ventana V-24 como el descanso a +1,7. */
function escaleraAltilloB3(geo,M,Pt,p){const {box,prism,rod,f1}=geo;
  const ID='ESC-B3',v=M.ABERTURAS.find(o=>o.id==='P-34'),dx0=1817+(v?v.d:246),dx1=dx0+(v?v.w:80),HZ=262,WF=-332.5,XE=2364,xa=XE-95,ytop=WF+95,
    N=Math.max(12,+p.escB3n||14),R=HZ/N,G=+p.escB3G||20,W=4,m=6,a=N-1-W-m,G2=(xa-dx1)/m,u=x=>wingZ(x)-19,K=[xa,ytop-2.5];
  const t=[],st=[],rods=[],pl=[],post=(x,y,z0,z1)=>rods.push(rod([x,z0,y],[x,z1,y],1.6,8)),rail=(q,r)=>rods.push(rod(q,r,2,10)),H=[];
  /* tramo contra M-22: a escalones subiendo hacia M-26 */
  const yB=ytop+a*G;for(let i=1;i<=a;i++){const y0=ytop+(a-i)*G;t.push(box(xa+4,XE,i*R-4,i*R,y0,y0+G+2));H.push([u(xa+47)-i*R,`tramo, escalón ${i}`]);}
  if(a>0){const pz=[[yB,0],[ytop,a*R],[ytop,a*R-25],[Math.min(yB,yB+25*G/R),0]];st.push(prism(pz,xa,xa+4,'ZY'));}
  /* giro: 4 compensados en el cuadrado del rincón (x xa…XE, y WF…ytop), en abanico desde el pilarote */
  const borde=th=>{const c=Math.cos(th),s=Math.sin(th);const tx=c>1e-6?(XE-K[0])/c:1e9,ty=s<-1e-6?(WF-K[1])/s:1e9;const tt=Math.min(tx,ty);return [K[0]+c*tt,K[1]+s*tt];};
  for(let j=1;j<=W;j++){const t0=-(j-1)*Math.PI/2/W,t1=-j*Math.PI/2/W,pts=[K,borde(t0)];if(t0>-Math.PI/4&&t1<-Math.PI/4)pts.push([XE,WF]);pts.push(borde(t1));const z=(a+j)*R;t.push(prism(pts,z-4,z,'XZ'));
    const tm=(t0+t1)/2;H.push([u(K[0]+47*Math.cos(tm))-z,`compensado ${j}`]);}
  const zG=(a+W)*R;rods.push(rod([K[0],0,K[1]],[K[0],zG+90,K[1]],4.5,8));/* pilarote: sostiene los compensados y las dos barandas */
  /* contra M-26: m escalones hasta la plataforma de la puerta */
  for(let k=1;k<=m;k++){const z=zG+k*R,x0=xa-k*G2;t.push(box(x0,x0+G2+2,z-4,z,WF,WF+90));H.push([u(x0+G2/2)-z,`escalón ${k} contra M-26`]);}
  st.push(prism([[xa,zG],[dx1,HZ],[dx1,HZ-25],[xa,zG-25]],WF+85,WF+90,'XY'));
  pl.push(box(dx0-10,dx1,HZ-4,HZ,WF,WF+90));st.push(box(dx0-10,dx1,HZ-24,HZ-4,WF+85,WF+90));H.push([u(dx1)-HZ,'plataforma de la puerta']);
  /* barandas: tramo y M-26 del lado abierto, que se juntan en el pilarote */
  if(a>0){rail([xa+2,90,yB],[K[0],a*R+90,K[1]]);post(xa+2,yB,0,90);}
  rail([K[0],zG+90,K[1]],[dx1,HZ+90,WF+92]);for(let k=2;k<m;k+=2){const x=xa-k*G2;post(x,WF+92,zG+k*R,zG+k*R+90);}
  post(dx1,WF+92,HZ,HZ+90);post(dx0-8,WF+92,HZ,HZ+90);rail([dx0-8,HZ+90,WF+92],[dx1,HZ+90,WF+92]);rail([dx0-8,HZ+90,WF+3],[dx0-8,HZ+90,WF+92]);
  const hm=H.reduce((q,r)=>r[0]<q[0]?r:q,H[0]),ang=Math.round(Math.atan(R/Math.min(G,G2))*180/Math.PI);
  {const txt=`${ang}° · alzada ${f1(R)} · giro con 4 compensados · mínima ${f1(hm[0]/100)} m`;window.__escInfo=txt;const el=typeof document!=='undefined'&&document.getElementById('escInfo');if(el)el.textContent=txt;}
  Pt(ID,`${ID} · Recta contra M-22, giro compensado y tramo contra M-26`,'ep',t,{fn:`${a} escalones contra M-22, giro en el rincón con 4 escalones compensados (descanso quebrado) alrededor de un pilarote, y ${m} escalones contra M-26 hasta la plataforma de la puerta (+2,62). Sin descanso plano: el giro va de +${f1((a+1)*R/100)} a +${f1(zG/100)}, así no tapa la ventana V-24 y gana altura libre. Mínima sobre la línea de paso: ${f1(hm[0]/100)} m (${hm[1]}).`,sec:'huellas de 2″',med:`${N} alzadas de ${f1(R)} · huella ${G} contra M-22 y ${f1(G2)} contra M-26 · ${ang}°`},{group:'Escalera',tags:['PB','escalera']});
  Pt(ID+'z',`${ID} · zancas`,'cabio',st,{fn:'Zancas del lado abierto de los dos tramos y viga de la plataforma; del lado de la pared, los escalones van tomados al muro.'},{group:'Escalera',tags:['PB','escalera']});
  Pt('PAS-1','PAS-1 · Plataforma de la puerta del altillo','ep',pl,{fn:'Plataforma frente a P-34, a +2,62.'},{group:'Escalera',tags:['PB','escalera']});
  Pt(ID+'r',`${ID} · baranda`,'acero',rods,{fn:'Pilarote del giro, pasamanos y parantes.'},{group:'Escalera',tags:['PB','escalera']});
}
