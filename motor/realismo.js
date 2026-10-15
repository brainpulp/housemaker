/* Aspecto realista: texturas procedurales (revoque, ladrillo visto, chapa, madera, deck, pasto…),
   cielo nublado, luz suave con sombras, como en las fotos. Se aplica sobre lo que arma el visor,
   sin tocar el modelo. Las texturas se dibujan en canvas: no hay imágenes externas. */
/* datos (de la casa): {piedra,ladrillo,blanco} = ids de muros con esa terminación; sin datos, los de Carhué. cats = categoría → textura extra. */
export function initRealismo(visor,datos={}){
  const {THREE,scene,renderer}=visor;
  /* ---------- texturas ---------- */
  let seed=11;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  const mk=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;};
  const noise=(x,w,h,n,a,col)=>{for(let i=0;i<n;i++){x.fillStyle=col(rnd());x.globalAlpha=a*rnd();const r=1+rnd()*w/40;x.beginPath();x.arc(rnd()*w,rnd()*h,r,0,7);x.fill();}x.globalAlpha=1;};
  const T={
    revoque:mk(512,512,(x,w,h)=>{x.fillStyle='#b8b3aa';x.fillRect(0,0,w,h);noise(x,w,h,2500,.18,v=>v>.5?'#9d978d':'#cdc8bf');noise(x,w,h,60,.10,()=> '#7f7a72');}),
    tabique:mk(512,512,(x,w,h)=>{x.fillStyle='#d6d1c7';x.fillRect(0,0,w,h);noise(x,w,h,1800,.12,v=>v>.5?'#c2bcb1':'#e4e0d8');}),
    ladrillo:mk(512,512,(x,w,h)=>{x.fillStyle='#8f8a80';x.fillRect(0,0,w,h);const bw=w/4,bh=h/8;for(let r=0;r<8;r++)for(let c=-1;c<5;c++){const off=r%2?bw/2:0;const k=rnd();x.fillStyle=`rgb(${120+k*45|0},${62+k*25|0},${44+k*18|0})`;x.fillRect(c*bw+off+3,r*bh+3,bw-6,bh-6);
      x.globalAlpha=.25;x.fillStyle=k>.5?'#3d2a22':'#c99a7e';x.fillRect(c*bw+off+3+rnd()*bw*.6,r*bh+3,bw*.3,bh-6);x.globalAlpha=1;}noise(x,w,h,900,.12,()=>'#2e2622');}),
    chapa:mk(256,256,(x,w,h)=>{const g=x.createLinearGradient(0,0,w/8,0);g.addColorStop(0,'#2c3034');g.addColorStop(.5,'#4b5056');g.addColorStop(1,'#2c3034');for(let i=0;i<8;i++){x.save();x.translate(i*w/8,0);x.fillStyle=g;x.fillRect(0,0,w/8,h);x.restore();}noise(x,w,h,300,.08,()=>'#6d7277');}),
    chapaNegra:mk(256,256,(x,w,h)=>{const g=x.createLinearGradient(0,0,w/8,0);g.addColorStop(0,'#141618');g.addColorStop(.5,'#2e3236');g.addColorStop(1,'#141618');for(let i=0;i<8;i++){x.save();x.translate(i*w/8,0);x.fillStyle=g;x.fillRect(0,0,w/8,h);x.restore();}}),
    madera:mk(512,512,(x,w,h)=>{x.fillStyle='#b98250';x.fillRect(0,0,w,h);for(let i=0;i<70;i++){x.strokeStyle=rnd()>.5?'#9a6638':'#cf9a63';x.globalAlpha=.35*rnd()+.1;x.lineWidth=1+rnd()*3;x.beginPath();const y=rnd()*h;x.moveTo(0,y);for(let t=0;t<=w;t+=32)x.lineTo(t,y+Math.sin(t/60+i)*4*rnd());x.stroke();}x.globalAlpha=1;}),
    pino:mk(512,512,(x,w,h)=>{x.fillStyle='#d9b27a';x.fillRect(0,0,w,h);for(let i=0;i<60;i++){x.strokeStyle=rnd()>.5?'#c0904f':'#e8c792';x.globalAlpha=.4*rnd()+.1;x.lineWidth=1+rnd()*2;x.beginPath();const y=rnd()*h;x.moveTo(0,y);for(let t=0;t<=w;t+=32)x.lineTo(t,y+Math.sin(t/50+i)*3);x.stroke();}x.globalAlpha=1;}),
    deck:mk(512,512,(x,w,h)=>{const n=8;for(let i=0;i<n;i++){const k=rnd();x.fillStyle=`rgb(${118+k*30|0},${70+k*18|0},${44+k*12|0})`;x.fillRect(0,i*h/n,w,h/n-3);x.fillStyle='#2a1c14';x.fillRect(0,(i+1)*h/n-3,w,3);
      for(let j=0;j<12;j++){x.strokeStyle='#5a3a26';x.globalAlpha=.3;x.beginPath();const y=i*h/n+rnd()*(h/n-6);x.moveTo(0,y);x.lineTo(w,y+rnd()*4-2);x.stroke();}x.globalAlpha=1;}}),
    cemento:mk(512,512,(x,w,h)=>{x.fillStyle='#b5b2ab';x.fillRect(0,0,w,h);noise(x,w,h,3000,.10,v=>v>.5?'#a29f98':'#c6c3bc');noise(x,w,h,40,.08,()=>'#8c8983');}),
    eucalipto:mk(512,512,(x,w,h)=>{const n=6;for(let i=0;i<n;i++){const k=rnd();x.fillStyle=`rgb(${176+k*20|0},${150+k*16|0},${126+k*14|0})`;x.fillRect(i*w/n,0,w/n-2,h);x.fillStyle='#8f7a66';x.fillRect((i+1)*w/n-2,0,2,h);
      for(let j=0;j<10;j++){x.strokeStyle='#9c836b';x.globalAlpha=.25;x.beginPath();const xx=i*w/n+rnd()*(w/n);x.moveTo(xx,0);x.lineTo(xx+rnd()*6-3,h);x.stroke();}x.globalAlpha=1;}}),
    roble:mk(512,512,(x,w,h)=>{x.fillStyle='#8a5a32';x.fillRect(0,0,w,h);for(let i=0;i<80;i++){x.strokeStyle=rnd()>.5?'#6e4423':'#a8743f';x.globalAlpha=.35*rnd()+.1;x.lineWidth=1+rnd()*2.5;x.beginPath();const y=rnd()*h;x.moveTo(0,y);for(let t=0;t<=w;t+=24)x.lineTo(t,y+Math.sin(t/40+i)*2.5);x.stroke();}x.globalAlpha=1;}),
    acero:mk(256,256,(x,w,h)=>{x.fillStyle='#3b3330';x.fillRect(0,0,w,h);noise(x,w,h,900,.25,v=>v>.6?'#7a4a2e':'#2a2522');}),
    pasto:mk(512,512,(x,w,h)=>{x.fillStyle='#6f8a46';x.fillRect(0,0,w,h);noise(x,w,h,5000,.25,v=>v>.66?'#566f33':v>.33?'#86a15a':'#9aa865');noise(x,w,h,80,.15,()=>'#8a7a55');}),
    blanco:mk(512,512,(x,w,h)=>{x.fillStyle='#ecebe6';x.fillRect(0,0,w,h);noise(x,w,h,2200,.10,v=>v>.5?'#dcdad3':'#f6f5f1');}),
    agua:mk(256,256,(x,w,h)=>{x.fillStyle='#3f8fbf';x.fillRect(0,0,w,h);noise(x,w,h,400,.15,()=>'#7fc0e0');}),
  };
  /* categoría → [textura, tamaño del paño en cm] */
  const PIEDRA=new Set(datos.piedra??['M-05','M-27','M-06','M-07','M-22']);/* M-22: misma terminación que M-05 en su cara de afuera (norte, +x) — Maxi 14/10 *//* piedra: textura sacada de la foto de Maxi (pared de piedra partida en junta seca), ~3,3 × 2,0 m por paño; la misma imagen da el relieve */
  const stoneTex=PIEDRA.size?new THREE.TextureLoader().load('vid/piedra.jpg'):new THREE.Texture();stoneTex.wrapS=stoneTex.wrapT=THREE.RepeatWrapping;stoneTex.colorSpace=THREE.SRGBColorSpace;stoneTex.anisotropy=8;stoneTex.repeat.set(200/330,1);
  const stoneBump=PIEDRA.size?new THREE.TextureLoader().load('vid/piedra.jpg'):new THREE.Texture();stoneBump.wrapS=stoneBump.wrapT=THREE.RepeatWrapping;stoneBump.repeat.set(200/330,1);
  const stoneMat=new THREE.MeshStandardMaterial({map:stoneTex,bumpMap:stoneBump,bumpScale:2.5,roughness:.95,color:0xffffff});
  const woodMat=new THREE.MeshStandardMaterial({map:T.pino,roughness:.85,color:0xffffff});
  const BRICK=new Set(datos.ladrillo??['M-01','M-02','M-21','HOG-1','CH-1','CH-2']);
  const BLANCO=new Set(datos.blanco??['M-03','M-22','M-20']);/* Maxi: M-03 y M-22 van blancos (M-22 por dentro; por fuera, piedra como M-05) */
  const pick=p=>{const b=p.id.replace(/[a-z]$/,'');if(BLANCO.has(b)&&(p.cat==='muro'||p.cat==='ladrillo'))return ['blanco',200];if(BRICK.has(b)&&(p.cat==='muro'||p.cat==='ladrillo'))return ['ladrillo',100];
    if(datos.cats&&datos.cats[p.cat])return datos.cats[p.cat];
    switch(p.cat){case 'muro':return ['revoque',200];case 'tabique':return ['tabique',200];case 'ladrillo':return ['ladrillo',100];case 'techo':return ['chapa',76];case 'chapa':return ['chapaNegra',60];
      case 'cabio':case 'madera':return ['madera',120];case 'ep':return [/^L-/.test(b)?'eucalipto':'pino',/^L-/.test(b)?72:120];case 'deck':return ['deck',160];case 'piso':return ['cemento',300];
      case 'acero':return ['acero',100];case 'roble':return ['roble',80];case 'agua':return ['agua',200];default:return null;}};
  /* UV por proyección de caja, en coordenadas del mundo (cm) */
  function boxUV(g,size,slope,rot){let geo=g;if(geo.index)geo=geo.toNonIndexed();const P=geo.attributes.position,n=P.count,uv=new Float32Array(n*2);const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),nn=new THREE.Vector3();
    for(let i=0;i<n;i+=3){a.fromBufferAttribute(P,i);b.fromBufferAttribute(P,i+1);c.fromBufferAttribute(P,i+2);nn.subVectors(b,a).cross(c.clone().sub(a));const ax=Math.abs(nn.x),ay=Math.abs(nn.y),az=Math.abs(nn.z);
      for(let k=0;k<3;k++){const v=k===0?a:k===1?b:c;let u,w;if(ay>=ax&&ay>=az){if((slope&&ax>az)||rot){u=v.z;w=v.x;}else{u=v.x;w=v.z;}}else if(ax>=az){u=v.z;w=v.y;}else{u=v.x;w=v.y;}uv[(i+k)*2]=u/size;uv[(i+k)*2+1]=w/size;}}
    geo.setAttribute('uv',new THREE.BufferAttribute(uv,2));return geo;}
  /* ---------- luz, cielo, suelo ---------- */
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  const old=[];scene.traverse(o=>{if(o.isLight)old.push(o);});old.forEach(l=>l.parent.remove(l));
  scene.add(new THREE.HemisphereLight(0xe4ebf0,0x5f6b45,1.35));
  const sun=new THREE.DirectionalLight(0xfff6e8,1.6);sun.position.set(1500+1800,3200,300-2600);sun.target.position.set(1500,0,300);scene.add(sun,sun.target);
  sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);const sc=sun.shadow.camera;sc.left=-2600;sc.right=2600;sc.top=2600;sc.bottom=-2600;sc.near=100;sc.far=9000;sun.shadow.bias=-0.0004;sun.shadow.normalBias=2;sun.shadow.radius=4;
  const fill=new THREE.DirectionalLight(0xdfe7ee,.45);fill.position.set(-1500,1200,2500);scene.add(fill);
  const sky=mk(16,256,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#c9d1d6');g.addColorStop(.6,'#e3e6e6');g.addColorStop(1,'#eef0ee');x.fillStyle=g;x.fillRect(0,0,w,h);});sky.wrapS=sky.wrapT=THREE.ClampToEdgeWrapping;
  /* ---------- aplicar a las piezas cada vez que el visor rearma ---------- */
  let last=null;
  function decorate(){scene.background=sky;scene.traverse(o=>{if(o.type==='GridHelper')o.visible=false;
      if(o.isMesh&&o.geometry&&(o.geometry.type==='PlaneGeometry'||o.userData.ground)&&o.rotation.x<-1.5&&!o.userData.real){o.userData.real=true;o.material.map=T.pasto;o.material.color.set('#ffffff');o.material.needsUpdate=true;
        const g=o.geometry;const s=o.scale.x/400;const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*s,uv.getY(i)*s);uv.needsUpdate=true;o.receiveShadow=true;}});
    for(const p of visor.parts){const pk=pick(p);const glass=p.cat==='glass';
      p.grp.traverse(o=>{if(!o.isMesh)return;o.castShadow=!glass&&p.mat.opacity>.5;o.receiveShadow=!glass;
        if(pk&&!o.userData.uv){o.geometry=boxUV(o.geometry,pk[1],pk[0]==='chapa',pk[0]==='deck'||pk[0]==='eucalipto');o.userData.uv=true;
          /* revestimiento de piedra en la cara al jardín (propuesta de Maxi) */
          /* techos de chapa: la cara de abajo (la que se ve desde adentro) en madera clara, como el machimbre */
          if(p.cat==='techo'){const P=o.geometry.attributes.position,a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();o.geometry.clearGroups();let cur=-1,st=0;
            o.geometry.computeBoundingBox();const ctr=o.geometry.boundingBox.getCenter(new THREE.Vector3());
            let inw=0;for(let i=0;i<P.count;i+=3){a.fromBufferAttribute(P,i);b.fromBufferAttribute(P,i+1);c.fromBufferAttribute(P,i+2);const n=b.clone().sub(a).cross(c.clone().sub(a));if(n.dot(a.clone().add(b).add(c).multiplyScalar(1/3).sub(ctr))<0)inw++;}const flip=1;/* box8 y prism ya salen con las caras hacia afuera *//* algunas losas tienen todas las caras al revés */
            for(let i=0;i<P.count;i+=3){a.fromBufferAttribute(P,i);b.fromBufferAttribute(P,i+1);c.fromBufferAttribute(P,i+2);const n=b.clone().sub(a).cross(c.clone().sub(a)).normalize().multiplyScalar(flip);const m=n.y<-.3?1:0;if(m!==cur){if(cur>=0)o.geometry.addGroup(st,i-st,cur);cur=m;st=i;}}
            o.geometry.addGroup(st,P.count-st,cur);o.material=[p.mat,woodMat];}
          const pb=p.id.replace(/[a-z]$/,'');if(PIEDRA.has(pb)){const P=o.geometry.attributes.position,a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();o.geometry.clearGroups();let cur=-1,st=0;
            for(let i=0;i<P.count;i+=3){a.fromBufferAttribute(P,i);b.fromBufferAttribute(P,i+1);c.fromBufferAttribute(P,i+2);const n=b.clone().sub(a).cross(c.clone().sub(a)).normalize();
              const m=(n.z>.7||(n.x>.7&&(pb==='M-06'||pb==='M-27'||pb==='M-22')))?1:0;if(m!==cur){if(cur>=0)o.geometry.addGroup(st,i-st,cur);cur=m;st=i;}}
            o.geometry.addGroup(st,P.count-st,cur);o.material=[p.mat,stoneMat];}}});
      if(pk&&p.mat&&!p.mat.userData.real){p.mat.userData.real=true;p.mat.map=T[pk[0]];p.mat.color.set('#ffffff');p.mat.roughness=pk[0]==='chapa'||pk[0]==='chapaNegra'?.55:pk[0]==='acero'?.5:.9;p.mat.metalness=pk[0]==='chapa'||pk[0]==='chapaNegra'?.35:0;p.mat.needsUpdate=true;}
      if(glass&&p.mat&&!p.mat.userData.real){p.mat.userData.real=true;p.mat.color.set('#a9c4cc');p.mat.roughness=.05;p.mat.metalness=.2;p.mat.opacity=Math.min(p.mat.opacity,.22);p.mat.needsUpdate=true;}}}
  (function loop(){if(visor.parts!==last){last=visor.parts;try{decorate();}catch(e){console.error('realismo',e);}}requestAnimationFrame(loop);})();
}
