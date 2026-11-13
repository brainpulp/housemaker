/* Ventana proyectante de madera para fabricar (Maxi 13/11: «como para un ingeniero, con todas las especificaciones»).
   Hoja que cuelga de una bisagra piano continua en la cara de afuera y se abre hacia afuera por abajo, sostenida por dos
   pistones a gas. Lo común a cualquier casa: la casa pone el vano, el plano de la cara de afuera y el eje de la bisagra.

   Ejes de la escena (los de geo.box): x a lo ancho del vano, altura z, y perpendicular al vano.
   o = {
     x0,x1        cantos de la hoja (el vano libre del marco menos 3 mm de luz por lado)
     zb           canto de abajo de la hoja
     hz, hy       eje de la bisagra: canto de arriba de la hoja, en la cara de afuera
     out          +1 si afuera es +y, −1 si afuera es −y
     ang          apertura en grados (0 cerrada; la limita la carrera del pistón)
     f, D         cara y profundidad de los perfiles de la hoja (cm); por defecto 5,5 × 4,5
     cMarco       cuánto hacia adentro del eje está la cara de adentro del marco (donde se atornilla el soporte fijo)
     tope         {z0}: si viene, se dibuja el tope del marco con su burlete (z0: canto de abajo del vano)
   }
   Devuelve {hoja,vidrio,herraje,herrajeF,piston,tope,info,max,spec}: geometrías ya en su lugar (la hoja y sus herrajes, rotados). */

/* pistón a gas estándar 10/22 (vástago Ø10, cuerpo Ø22): cerrado 350, extendido 550, carrera 200; terminales con rótula M8 */
const PIST={L0:35,L1:55,cuerpo:30.5,dv:1.0,dc:2.2};
const FUERZAS=[100,150,200,250,300,350,400,450,500];/* N, de a 50 como se venden */

export function proyectante(geo,THREE,o){const {box,rod}=geo;
  const f=o.f??5.5,D=o.D??4.5,out=o.out??1,x0=o.x0,x1=o.x1,zb=o.zb,hz=o.hz,hy=o.hy,B=x1-x0,L=hz-zb;
  /* peso: laminado 3+3 (15 kg/m²) + roble (750 kg/m³) */
  const vidA=(B-2*f+2)*(L-2*f+2)/1e4,kgV=vidA*15,kgM=(2*(B+L)-4*f)*f*D/1e6*750,kg=kgV+kgM;
  /* ubicación de los pistones: cerrado mide L0; busca el punto fijo (a bajo el eje) y el de la hoja (r) para abrir ~70° */
  const c=(o.cMarco??D+0.5)+1.5;/* el eje del pistón queda 1,5 por dentro de la cara de adentro del marco */
  const P=(r,t)=>[r*Math.sin(t)-c*Math.cos(t),-r*Math.cos(t)-c*Math.sin(t)];/* (afuera, arriba) respecto del eje */
  let best=null;
  for(let a=20;a<=L-8;a+=.5)for(let r=8;r<a-5;r+=.5){const F0=[-c,-a],l0=Math.hypot(P(r,0)[0]-F0[0],P(r,0)[1]-F0[1]);if(Math.abs(l0-PIST.L0)>.3)continue;
    let t=0;while(t<2.1&&Math.hypot(P(r,t)[0]-F0[0],P(r,t)[1]-F0[1])<PIST.L1)t+=.005;const e=Math.abs(t*180/Math.PI-70);if(!best||e<best.e)best={e,a,r,max:Math.floor(t*180/Math.PI)};}
  const {a,r,max}=best||{a:.69*L,r:.3*L,max:70};
  /* fuerza: la menor que sostiene la hoja abierta al máximo (con 10 % de margen) y que cerrada la sigue tirando para adentro */
  const torque=(Fn,deg)=>{const t=deg*Math.PI/180,p=P(r,t),F0=[-c,-a],d=Math.hypot(p[0]-F0[0],p[1]-F0[1]),u=[(p[0]-F0[0])/d,(p[1]-F0[1])/d],Fs=2*Fn*(1+.3*(PIST.L1-d)/(PIST.L1-PIST.L0));
    return (p[0]*u[1]-p[1]*u[0])*Fs/100-kg*9.81*L/200*Math.sin(t);};
  const Fn=FUERZAS.find(F=>torque(F,max-1)>=kg*9.81*L/200*Math.sin((max-1)*Math.PI/180)*.1)||FUERZAS[FUERZAS.length-1];
  let suelta=0;for(let d=0;d<=max;d++)if(torque(Fn,d)<0)suelta=d+1;else break;/* hasta acá la hoja vuelve sola a cerrarse */
  /* transformación de la hoja */
  const ang=Math.min(o.ang||0,max)*Math.PI/180,M4=new THREE.Matrix4().makeTranslation(0,hz,hy).multiply(new THREE.Matrix4().makeRotationX(-out*ang)).multiply(new THREE.Matrix4().makeTranslation(0,-hz,-hy));
  const Y=w=>hy+out*w;/* w: hacia afuera desde el plano de la bisagra (negativo, hacia adentro) */
  const bw=(xa,xb,za,zz,wa,wb)=>{const ya=Y(wa),yb=Y(wb);return box(xa,xb,za,zz,Math.min(ya,yb),Math.max(ya,yb));};
  const H=(g)=>g.applyMatrix4(M4);
  const hoja=[],vidrio=[],herraje=[],herrajeF=[],piston=[],tope=[];/* herraje: se mueve con la hoja; herrajeF: fijo al marco */
  /* hoja: montantes de largo completo, travesaños entre montantes (caja y espiga) */
  hoja.push(H(bw(x0,x0+f,zb,hz,-D,0)),H(bw(x1-f,x1,zb,hz,-D,0)),H(bw(x0+f,x1-f,hz-f,hz,-D,0)),H(bw(x0+f,x1-f,zb,zb+f,-D,0)));
  /* vidrio laminado 3+3 en galce de 1,0 × 1,8 desde adentro; contravidrio de 1,2 × 1,8 */
  const wg=-D+1.8;vidrio.push(H(bw(x0+f-1,x1-f+1,zb+f-1,hz-f+1,wg-.64,wg)));
  const cv=[[x0+f,x0+f+1.2,zb+f,hz-f],[x1-f-1.2,x1-f,zb+f,hz-f],[x0+f+1.2,x1-f-1.2,hz-f-1.2,hz-f],[x0+f+1.2,x1-f-1.2,zb+f,zb+f+1.2]];
  for(const [xa,xb,za,zz] of cv)hoja.push(H(bw(xa,xb,za,zz,-D,wg-.64)));
  /* bisagra piano inox: ala fija sobre el marco (arriba del eje), ala móvil sobre la hoja, y el nudo */
  herrajeF.push(bw(x0+1,x1-1,hz,hz+3.2,0,.15),rod([x0+1,hz,Y(.3)],[x1-1,hz,Y(.3)],.35,8));herraje.push(H(bw(x0+1,x1-1,hz-3.2,hz,0,.15)));
  /* cierres: dos fallebas de leva en el travesaño de abajo, a un cuarto de cada punta; contracierre en el marco */
  for(const xc of [x0+B/4,x1-B/4]){herraje.push(H(bw(xc-1.5,xc+1.5,zb+1,zb+4.5,-D-1,-D)),H(bw(xc-.5,xc+.5,zb+2,zb+3,-D-4,-D-1)));if(o.tope)herrajeF.push(bw(xc-2,xc+2,zb-1.5,zb-.3,-D-1,-D-.2));}
  /* pistones: el cuerpo va del lado de la hoja y el vástago hacia abajo, al punto fijo */
  const xs=[x0+f/2+.5,x1-f/2-.5];
  for(const xp of xs){const pf=new THREE.Vector3(xp,hz-a,Y(-c)),ph=new THREE.Vector3(xp,hz-r,Y(-c)).applyMatrix4(M4),dir=pf.clone().sub(ph),len=dir.length();dir.normalize();
    const pc=ph.clone().add(dir.clone().multiplyScalar(Math.min(PIST.cuerpo,len-2)));
    piston.push(rod(ph.toArray(),pc.toArray(),PIST.dc/2,10),rod(pc.toArray(),pf.toArray(),PIST.dv/2,8));
    /* soportes: ángulo de 2 mm con perno de bola M8 — en la hoja, en la cara de adentro del montante; el fijo, en la cara de adentro del marco */
    herraje.push(H(bw(xp-1.5,xp+1.5,hz-r-2.5,hz-r+2.5,-c-.8,-D)));herrajeF.push(bw(xp-1.5,xp+1.5,hz-a-2.5,hz-a+2.5,-c-.8,-(o.cMarco??D+.5)));}
  /* tope del marco con burlete EPDM tipo D de 9 × 7 */
  if(o.tope){const t0=o.tope.z0,tw=1.2,wa=-(o.cMarco??D+.5),wb=-D;
    for(const g of [bw(x0-.3,x0-.3+tw+.3,t0,hz,wa,wb),bw(x1+.3-tw-.3,x1+.3,t0,hz,wa,wb),bw(x0-.3,x1+.3,t0,t0+tw+.3,wa,wb)])tope.push(g);
    herrajeF.push(bw(x0-.3+tw,x0-.3+tw+.9,t0+tw,hz,wb,wb+.7),bw(x1+.3-tw-.9,x1+.3-tw,t0+tw,hz,wb,wb+.7),bw(x0-.3+tw,x1+.3-tw,t0+tw,t0+tw+.9,wb,wb+.7));}
  const k1=v=>(Math.round(v*10)/10).toLocaleString('es-AR');
  const spec={
    hoja:`Hoja de ${k1(B)} × ${k1(L)} cm. Perfiles de roble macizo cepillado de ${k1(f*10)} × ${k1(D*10)} mm (de tirante de 2½″ × 2″), sin nudos, secado a 12 %. Esquinas a caja y espiga pasante (espiga de 1/3 del espesor, 40 mm), encoladas con cola PU D4 y 2 tarugos de Ø10. Montantes de largo completo; travesaños entre montantes. Galce para el vidrio de 10 × 18 mm por adentro. Abajo, ranura goterón de 8 × 8 mm a 15 mm de la cara de afuera. Peso: ${k1(kg)} kg (vidrio ${k1(kgV)} + madera ${k1(kgM)}).`,
    vidrio:`Laminado 3+3 incoloro (6,4 mm, 15 kg/m²; obligatorio porque la hoja abierta queda sobre gente), ${k1(B-2*f+2)} × ${k1(L-2*f+2)} cm. Calzos de EPDM de 3 mm en los cuartos de abajo; silicona neutra en las dos caras; contravidrio de roble de 12 × 18 mm por adentro con tornillos inox 3 × 25 cada 20 cm (se cambia el vidrio sin desmontar la hoja).`,
    bisagra:`Bisagra piano continua de acero inoxidable 304, 1,5 mm, alas de 32 + 32 mm, de ${k1(B-2)} cm de largo, en la cara de afuera: un ala en el marco y otra en la hoja, nudo hacia afuera, tornillos inox cabeza fresada 4 × 25 cada 10 cm (alternados). Queda bajo el alero; el canto de arriba del marco lleva tapajunta de chapa negra plegada sobre el nudo.`,
    piston:`2 pistones a gas 10/22 (vástago Ø10, cuerpo Ø22), 550 mm extendido, 350 cerrado, carrera 200, de ${Fn} N cada uno, con rótulas M8 y pernos de bola de Ø10. Se colocan con el vástago hacia abajo. Por adentro, uno en cada montante a ${k1(xs[0]-x0)} cm del canto, en un plano ${k1(c)} cm por dentro del eje de la bisagra. Punto de la hoja: ${k1(r)} cm debajo del eje, en un ángulo de chapa de 2 mm en la cara de adentro del montante. Punto fijo: ${k1(a)} cm debajo del eje, en un ángulo de chapa de 2 mm en la cara de adentro del marco. Con esta geometría la hoja abre hasta ${max}°; hasta los ${suelta}° vuelve sola a cerrarse y desde ahí se abre sola y queda abierta.`,
    cierre:`2 fallebas de leva (cierre de presión) en la cara de adentro del travesaño de abajo, a ${k1(B/4)} cm de cada punta, con contracierre en el marco. Cierran contra el burlete.`,
    marco:`Marco de roble con tope de 12 mm por adentro y burlete EPDM tipo D de 9 × 7 mm en todo el perímetro; luz de 3 mm entre hoja y marco. Travesaño de abajo del vano con pendiente de 10° hacia afuera y goterón.`};
  const info=Object.values(spec).join(' ');
  return {hoja,vidrio,herraje,herrajeF,piston,tope,info,spec,max,kg,Fn,a,r};}
