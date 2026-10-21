/* Catálogo de artefactos de iluminación (Maxi, 14/10) y escenarios de luz de partida por ambiente.
   Cada artefacto: geometría local (cm) + fuentes de luz reales («spot», «point», «rect»).
   Montaje: «techo» = el origen se apoya en el cielorraso que haya arriba (se busca solo) y el artefacto cuelga hacia −y;
   «pared» y «piso» = el origen está a la altura p.z sobre el piso. Frente hacia +z local. */
export function kelvin(K){/* aproximación de Tanner Helland, devuelve [r,g,b] 0..1 */const t=K/100;let r,g,b;
  r=t<=66?255:329.698727446*Math.pow(t-60,-0.1332047592);g=t<=66?99.4708025861*Math.log(t)-161.1195681661:288.1221695283*Math.pow(t-60,-0.0755148492);b=t>=66?255:t<=19?0:138.5177312231*Math.log(t-10)-305.0447927307;
  const c=v=>Math.min(255,Math.max(0,v))/255;return [c(r),c(g),c(b)];}

export function catalogoLuces(THREE,B,CYL){
  const rotX=(g,a,y=0,z=0)=>{g.translate(0,-y,-z);g.rotateX(a);g.translate(0,y,z);return g;};
  const ACAB=['negro','blanco','acero'];
  const K=['K',' color',[2700,3000,4000]],DIM=['dim','dimmer %','num'],LM=['lm','lúmenes c/u','num'];
  /* spot cilíndrico apuntando según tilt (grados, hacia +z local); devuelve geometrías y dirección */
  function spot(x,y,tilt,ac,r=3.2,len=10){const a=tilt*Math.PI/180;const c=CYL(r,-len,0,0,0,16);const e=CYL(r*.75,-len-.2,-len+.4,0,0,16);
    for(const g of [c,e]){g.rotateX(-a);g.translate(x,y,0);}const d=[0,-Math.cos(a),Math.sin(a)];const p=[x,y-len*Math.cos(a),len*Math.sin(a)];return {geo:[[c,ac],[e,'@']],p,d};}
  const C={
    riel:{n:'Riel con 2–4 spots',mount:'techo',p:{n:3,L:150,lm:450,beam:36,tilt:15,K:3000,dim:100,acab:'negro'},
      ui:[['n','spots',[2,3,4]],['L','largo','num'],LM,['beam','apertura °',[15,24,36,60]],['tilt','inclinación °','num'],K,DIM,['acab','terminación',ACAB]],
      g:p=>{const out={geo:[[B(-p.L/2,p.L/2,-3.5,0,-1.7,1.7),p.acab]],luz:[]};for(let i=0;i<p.n;i++){const x=-p.L/2+p.L*(i+.5)/p.n;out.geo.push([B(x-1,x+1,-6,-3.5,-1,1),p.acab]);const s=spot(x,-6,p.tilt,p.acab);out.geo.push(...s.geo);out.luz.push({t:'spot',p:s.p,d:s.d,lm:p.lm,beam:p.beam});}return out;}},
    emb:{n:'Embutidos en línea (2–4)',mount:'techo',p:{n:3,sep:90,lm:550,beam:40,K:3000,dim:100,acab:'blanco'},
      ui:[['n','spots',[2,3,4]],['sep','separación','num'],LM,['beam','apertura °',[24,40,60]],K,DIM,['acab','aro',ACAB]],
      g:p=>{const out={geo:[],luz:[]};for(let i=0;i<p.n;i++){const x=(i-(p.n-1)/2)*p.sep;out.geo.push([CYL(5,-.6,0,x,0,20),p.acab],[CYL(3.6,-.9,-.5,x,0,20),'@']);out.luz.push({t:'spot',p:[x,-1.2,0],d:[0,-1,0],lm:p.lm,beam:p.beam});}return out;}},
    cuadro:{n:'Spots en cuadro (4)',mount:'techo',p:{sep:120,lm:550,beam:40,K:3000,dim:100,acab:'blanco'},
      ui:[['sep','lado','num'],LM,['beam','apertura °',[24,40,60]],K,DIM,['acab','aro',ACAB]],
      g:p=>{const out={geo:[],luz:[]};for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]]){const x=a*p.sep/2,z=b*p.sep/2;out.geo.push([CYL(5,-.6,0,x,z,20),p.acab],[CYL(3.6,-.9,-.5,x,z,20),'@']);out.luz.push({t:'spot',p:[x,-1.2,z],d:[0,-1,0],lm:p.lm,beam:p.beam});}return out;}},
    tira:{n:'Tira LED en perfil',mount:'pared',p:{L:200,lmm:900,dir:'abajo',z:148,K:3000,dim:100},
      ui:[['L','largo','num'],['lmm','lúmenes por metro','num'],['dir','luz hacia',['abajo','arriba','frente']],['z','altura','num'],K,DIM],
      g:p=>{const d=p.dir==='arriba'?[0,1,0]:p.dir==='frente'?[0,0,1]:[0,-1,0];const ey=p.dir==='arriba'?1.6:-.1,ez=p.dir==='frente'?2.2:2;
        return {geo:[[B(-p.L/2,p.L/2,-.2,1.5,0,2.2),'acero'],[p.dir==='frente'?B(-p.L/2+1,p.L/2-1,0,1.3,2.1,2.3):B(-p.L/2+1,p.L/2-1,ey-.1,ey+.1,.4,1.8),'@']],
          luz:[{t:'rect',p:[0,p.dir==='arriba'?1.8:p.dir==='frente'?.65:-.3,p.dir==='frente'?2.4:1.1],d,w:p.L-2,h:1.6,lm:p.lmm*p.L/100}]};}},
    colgante:{n:'Colgante (campana)',mount:'techo',p:{drop:90,diam:35,lm:900,K:2700,dim:100,acab:'negro'},
      ui:[['drop','caída','num'],['diam','diámetro','num'],LM,K,DIM,['acab','terminación',ACAB]],
      g:p=>{const r=p.diam/2;const sh=new THREE.CylinderGeometry(r*.25,r,r*.7,28,1,true);sh.translate(0,-p.drop+r*.35,0);
        return {geo:[[CYL(.3,-p.drop+r*.7,0,0,0,6),'negro'],[CYL(5,-1.5,0,0,0,16),p.acab],[sh,p.acab],[new THREE.SphereGeometry(4,16,10).translate(0,-p.drop+r*.25,0),'@']],
          luz:[{t:'spot',p:[0,-p.drop+r*.1,0],d:[0,-1,0],lm:p.lm,beam:110}]};}},
    galponera:{n:'Galponera (campana industrial)',mount:'techo',p:{drop:190,diam:45,lm:1800,K:2700,dim:100,acab:'negro'},
      ui:[['drop','caída','num'],['diam','diámetro','num'],['lm','lúmenes','num'],K,DIM,['acab','terminación',ACAB]],
      g:p=>{const r=p.diam/2,hh=r*.62;const dm=new THREE.CylinderGeometry(5,r,hh,32,1,true);dm.translate(0,-p.drop+hh/2,0);const cu=new THREE.CylinderGeometry(5.5,5.5,9,16);cu.translate(0,-p.drop+hh+4.5,0);
        return {geo:[[CYL(.35,-p.drop+hh+9,0,0,0,6),'negro'],[CYL(6,-2,0,0,0,16),p.acab],[dm,p.acab],[cu,p.acab],[new THREE.SphereGeometry(6,16,10).translate(0,-p.drop+hh*.35,0),'@']],
          luz:[{t:'spot',p:[0,-p.drop+hh*.2,0],d:[0,-1,0],lm:p.lm,beam:110}]};}},
    linea:{n:'Colgante lineal (sobre mesa)',mount:'techo',p:{L:150,drop:80,lm:2600,K:3000,dim:100,acab:'negro'},
      ui:[['L','largo','num'],['drop','caída','num'],['lm','lúmenes','num'],K,DIM,['acab','terminación',ACAB]],
      g:p=>({geo:[[B(-p.L/2,p.L/2,-p.drop-4,-p.drop,-3,3),p.acab],[B(-p.L/2+2,p.L/2-2,-p.drop-4.2,-p.drop-3.9,-2.2,2.2),'@'],[CYL(.25,-p.drop,0,-p.L/2+10,0,6),'negro'],[CYL(.25,-p.drop,0,p.L/2-10,0,6),'negro']],
        luz:[{t:'rect',p:[0,-p.drop-4.5,0],d:[0,-1,0],w:p.L-4,h:4.4,lm:p.lm}]})},
    /* de las referencias de Maxi (14/10) */
    farol:{n:'Farol de papel (esfera)',mount:'techo',p:{drop:90,diam:45,lm:800,K:2700,dim:100},ui:[['drop','caída','num'],['diam','diámetro','num'],LM,K,DIM],
      g:p=>{const r=p.diam/2;const sp=new THREE.SphereGeometry(r,32,18);sp.scale(1,.92,1);sp.translate(0,-p.drop-r*.92,0);const out={geo:[[CYL(.3,-p.drop,0,0,0,6),'negro'],[CYL(4,-1.2,0,0,0,16),'negro'],[sp,'pantalla']],luz:[{t:'point',p:[0,-p.drop-r,0],lm:p.lm,dist:700}]};
        for(let i=1;i<6;i++){const y=-p.drop-r*.92+r*.92*Math.cos(i*Math.PI/6),rr=r*Math.sin(i*Math.PI/6);const t=new THREE.TorusGeometry(rr,.18,4,40);t.rotateX(Math.PI/2);t.translate(0,y,0);out.geo.push([t,'negro']);}/* nervaduras del papel */return out;}},
    tubo:{n:'Colgante tubo vertical',mount:'techo',p:{drop:120,L:45,lm:400,K:2700,dim:100,acab:'negro'},ui:[['drop','caída','num'],['L','largo','num'],LM,K,DIM,['acab','terminación',ACAB]],
      g:p=>({geo:[[CYL(.3,-p.drop+p.L,0,0,0,6),'negro'],[CYL(3,-1.2,0,0,0,16),p.acab],[CYL(1.4,-p.drop,-p.drop+p.L,0,0,12),'@'],[CYL(1.6,-p.drop+p.L-3,-p.drop+p.L,0,0,12),p.acab]],luz:[{t:'point',p:[0,-p.drop+p.L/2,0],lm:p.lm,dist:500}]})},
    apliqueGlobo:{n:'Aplique con globo de vidrio',mount:'pared',p:{z:185,lm:300,K:2700,dim:100,acab:'negro'},ui:[['z','altura','num'],LM,K,DIM,['acab','terminación',ACAB]],
      g:p=>{const gl=new THREE.SphereGeometry(7,20,14);gl.scale(1,1.3,1);gl.translate(0,0,14);return {geo:[[CYL(5,0,1.2,0,0,20).rotateX(Math.PI/2),p.acab],[B(-1,1,-1,1,0,9),p.acab],[CYL(4.5,6,9,0,14,16),p.acab],[CYL(4.5,-10,-7,0,14,16),p.acab],[gl,'pantalla']],luz:[{t:'point',p:[0,0,14],lm:p.lm,dist:500}]};}},
    plafon:{n:'Plafón',mount:'techo',p:{diam:40,lm:1800,K:3000,dim:100},ui:[['diam','diámetro','num'],['lm','lúmenes','num'],K,DIM],
      g:p=>({geo:[[CYL(p.diam/2,-6,0,0,0,32),'blanco'],[CYL(p.diam/2-1.5,-6.3,-5.9,0,0,32),'@']],luz:[{t:'rect',p:[0,-6.6,0],d:[0,-1,0],w:p.diam*.8,h:p.diam*.8,lm:p.lm}]})},
    aplique:{n:'Aplique de pared arriba/abajo',mount:'pared',p:{z:190,lm:350,beam:40,K:3000,dim:100,acab:'negro'},ui:[['z','altura','num'],LM,['beam','apertura °',[15,24,40,60]],K,DIM,['acab','terminación',ACAB]],
      g:p=>({geo:[[B(-4,4,-10,10,0,9),p.acab],[CYL(2.8,9.9,10.3,0,5,12),'@'],[CYL(2.8,-10.3,-9.9,0,5,12),'@']],luz:[{t:'spot',p:[0,10.5,5],d:[0,1,0],lm:p.lm,beam:p.beam},{t:'spot',p:[0,-10.5,5],d:[0,-1,0],lm:p.lm,beam:p.beam}]})},
    pie:{n:'Lámpara de pie',mount:'piso',p:{z:0,lm:1300,K:2700,dim:100},ui:[['lm','lúmenes','num'],K,DIM],
      g:p=>{/* bajo un techo en pendiente se acorta para quedar 10 por debajo del cielorraso */const top=Math.max(95,Math.min(167,(p._techo??999)-(p.z||0)-10)),yc=top-15;const sh=new THREE.CylinderGeometry(20,23,30,28,1,true);sh.translate(0,yc,0);return {geo:[[CYL(15,0,2,0,0,24),'negro'],[CYL(1,2,yc-12,0,0,8),'negro'],[sh,'pantalla'],[new THREE.SphereGeometry(5,14,10).translate(0,yc-2,0),'@']],luz:[{t:'point',p:[0,yc-2,0],lm:p.lm,dist:900}]};}},
    velador:{n:'Lámpara de mesa / velador',mount:'piso',p:{z:55,lm:450,K:2700,dim:100},ui:[['z','apoyada a','num'],['lm','lúmenes','num'],K,DIM],
      g:p=>{const sh=new THREE.CylinderGeometry(12,15,18,24,1,true);sh.translate(0,38,0);return {geo:[[CYL(7,0,26,0,0,20),'piedra'],[sh,'pantalla'],[new THREE.SphereGeometry(3.5,12,8).translate(0,36,0),'@']],luz:[{t:'point',p:[0,36,0],lm:p.lm,dist:600}]};}},
    baliza:{n:'Baliza de jardín',mount:'piso',p:{z:0,lm:180,K:3000,dim:100},ui:[['lm','lúmenes','num'],K,DIM],
      g:p=>({geo:[[B(-5,5,0,55,-5,5),'grafito'],[B(-5.5,5.5,55,58,-5.5,5.5),'grafito'],[B(-4.5,4.5,47,55,-4.6,4.6),'@']],luz:[{t:'point',p:[0,51,0],lm:p.lm,dist:500}]})},
    proyector:{n:'Proyector (árbol, pared)',mount:'piso',p:{z:0,lm:1500,beam:24,tilt:15,K:3000,dim:100},ui:[LM,['beam','apertura °',[10,24,40,60]],['tilt','inclinación °','num'],K,DIM],
      g:p=>{const t=p.tilt*Math.PI/180;const c=CYL(5,-12,0,0,0,16),e=CYL(4,-12.3,-11.8,0,0,16);for(const g of [c,e]){g.rotateX(Math.PI+t);g.translate(0,4,0);}
        const d=[0,Math.cos(t),Math.sin(t)];return {geo:[[B(-6,6,0,4,-6,6),'grafito'],[c,'grafito'],[e,'@']],luz:[{t:'spot',p:[0,4+12.6*d[1],12.6*d[2]],d,lm:p.lm,beam:p.beam}]};}},
    reflector:{n:'Reflector LED de pared',mount:'pared',p:{z:280,W:200,lmW:100,beam:60,tilt:15,K:4000,dim:100},ui:[['W','watts','num'],['lmW','lm por watt','num'],['beam','apertura °',[30,60,90,120]],['tilt','hacia abajo °','num'],['z','altura','num'],K,DIM],
      g:p=>{const t=p.tilt*Math.PI/180,d=[0,-Math.sin(t),Math.cos(t)];const c=B(-17,17,-12,12,4,11),e=B(-15,15,-10,10,10.9,11.3);const ctr=[0,0,7.5];for(const g of [c,e]){g.translate(0,0,-7.5);g.rotateX(t);g.translate(0,0,7.5);}
        return {geo:[[B(-3,3,-4,4,0,4),'grafito'],[c,'grafito'],[e,'@']],luz:[{t:'spot',p:[0,-4*Math.sin(t),7.5+4*Math.cos(t)],d,lm:p.W*p.lmW,beam:p.beam}]};}},
    pileta:{n:'Luz de pileta',mount:'pared',p:{z:-45,lm:1800,beam:90,K:4000,dim:100},ui:[['z','altura','num'],LM,['beam','apertura °',[60,90,120]],K,DIM],
      g:p=>({geo:[[CYL(12,0,2,0,0,24).rotateX(Math.PI/2),'acero'],[CYL(10,1.9,2.3,0,0,24).rotateX(Math.PI/2),'@']],luz:[{t:'spot',p:[0,0,3],d:[0,0,1],lm:p.lm,beam:p.beam}]})},
    guirnalda:{n:'Guirnalda de lamparitas',mount:'pared',p:{L:500,z:250,sep:50,lm:60,K:2200,dim:100},ui:[['L','largo','num'],['z','altura','num'],['sep','separación','num'],['lm','lúmenes c/u','num'],K,DIM],
      g:p=>{const out={geo:[],luz:[]};const n=Math.max(2,Math.round(p.L/p.sep)+1),sag=p.L*.05;const Y=x=>-sag*(1-Math.pow(2*x/p.L,2));
        const pts=[];for(let i=0;i<=40;i++){const x=-p.L/2+p.L*i/40;pts.push(new THREE.Vector3(x,Y(x),0));}out.geo.push([new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),60,.25,4,false),'negro']);
        for(let i=0;i<n;i++){const x=-p.L/2+p.L*i/(n-1);out.geo.push([new THREE.SphereGeometry(2.6,10,8).translate(x,Y(x)-5,0),'@'],[CYL(.6,Y(x)-2.5,Y(x),x,0,6),'negro']);}
        const k=Math.min(3,n);for(let i=0;i<k;i++){const x=-p.L/2+p.L*(i+.5)/k;out.luz.push({t:'point',p:[x,Y(x)-6,0],lm:p.lm*n/k,dist:800});}return out;}},
  };
  return C;
}

/* escenarios de luz de partida (I = itA(ambiente)) */
