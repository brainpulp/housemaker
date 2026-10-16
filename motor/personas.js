/* Personas de 1,70 para controlar alturas libres y pasos: se arrastran sobre cualquier piso (deck, entrepiso, escalones)
   y, con «Caminan solas», pasean evitando paredes, desniveles de más de 25 cm y caídas. Quedan guardadas en este navegador. */
export function initPersonas(visor){
  const {THREE,scene,camera}=visor;const V=THREE.Vector3;
  const view=document.getElementById('view');
  const G=new THREE.Group();G.name='personas';scene.add(G);
  const LSK='carhue-personas';const ls={get(){try{return JSON.parse(localStorage.getItem(LSK)||'null');}catch(e){return null;}},set(v){try{localStorage.setItem(LSK,JSON.stringify(v));}catch(e){}}};
  const H=170;/* alto total */
  /* figuras elegidas por Maxi (Microsoft Rocketbox, licencia MIT) y «el ruso» (Ready Player Me, de los ejemplos de three.js).
     Cada una trae su caminar y su quieta, ya pasadas a su esqueleto (rotación por hueso en el espacio del mundo, alineando la dirección de cada hueso).
     Se cargan sólo cuando aparecen (2 a 5 MB cada una); mientras tanto la persona es una cápsula gris. Todas se llevan a 1,70. */
  const FIGS=[['m03','Señor de saco'],['m16','Chico de remera'],['fp02','Mujer de vestido'],['sf02','Mujer de musculosa'],['bm04','Hombre de chaleco'],['sf01','Mujer en bikini'],['ruso','El ruso']];
  const FN=Object.fromEntries(FIGS);
  const BASE={},LOAD={};let SU=null;
  function cargar(f){if(LOAD[f])return LOAD[f];LOAD[f]=(async()=>{const [{B64},{GLTFLoader}]=await Promise.all([import(`./personas-${f}.js`),import('three/addons/loaders/GLTFLoader.js')]);if(!SU)SU=await import('three/addons/utils/SkeletonUtils.js');
      const bin=Uint8Array.from(atob(B64),c=>c.charCodeAt(0));const gl=await new Promise((res,rej)=>new GLTFLoader().parse(bin.buffer,'',res,rej));
      const b=gl.scene;b.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;}});
      b.userData.k=1;b.userData.y0=0;/* ya viene en 1,70 con los pies en 0 */BASE[f]={scene:b,clips:gl.animations};
      objs.forEach(g=>{if(g.userData.f===f)vestir(g);});})();return LOAD[f];}
  function vestir(g){const B=BASE[g.userData.f];if(!B||g.userData.fig)return;
    const f=SU.clone(B.scene);f.scale.setScalar(B.scene.userData.k);f.position.y=B.scene.userData.y0*B.scene.userData.k;g.add(f);g.userData.fig=f;g.userData.ph.visible=false;
    const mx=new THREE.AnimationMixer(f);const A={};for(const c of B.clips)A[c.name]=mx.clipAction(c);if(A.idle){A.idle.play();A.idle.time=Math.random()*2;}g.userData.mx=mx;g.userData.A=A;g.userData.cur='idle';}
  function figura(f){const g=new THREE.Group();g.userData.persona=true;g.userData.f=f;
    const ph=new THREE.Mesh(new THREE.CapsuleGeometry(20,H-40,3,10),new THREE.MeshStandardMaterial({color:'#9aa0a6',roughness:.9}));ph.position.y=H/2;ph.castShadow=true;g.add(ph);g.userData.ph=ph;
    const pick=new THREE.Mesh(new THREE.CylinderGeometry(25,25,H,10),new THREE.MeshBasicMaterial({visible:false}));pick.position.y=H/2;g.add(pick);g.userData.pick=pick;
    if(BASE[f])vestir(g);else cargar(f);return g;}
  const anim=(g,nm)=>{if(!g.userData.A||g.userData.cur===nm)return;const a=g.userData.A[nm],b=g.userData.A[g.userData.cur];a.reset().play();b.crossFadeTo(a,.35,false);g.userData.cur=nm;};

  let walk0=false;try{walk0=localStorage.getItem('carhue-personas-caminan')==='1';}catch(e){}/* valor viejo, global: pasa a cada persona */
  let list=(ls.get()||[]).map((p,i)=>({...p,f:FN[p.f]?p.f:FIGS[i%FIGS.length][0],w:p.w??walk0}));const objs=[];
  const save=()=>ls.set(list.map(p=>({x:Math.round(p.x),y:Math.round(p.y),z:Math.round(p.z),r:+p.r.toFixed(2),f:p.f,w:!!p.w})));
  function sync(){while(objs.length>list.length){const o=objs.pop();if(o)G.remove(o);}
    list.forEach((p,i)=>{if(objs[i]&&objs[i].userData.f!==p.f){G.remove(objs[i]);objs[i]=null;}});
    for(let i=0;i<list.length;i++)if(!objs[i]){const o=figura(list[i].f);G.add(o);objs[i]=o;}
    list.forEach((p,i)=>{objs[i].position.set(p.x,p.y,p.z);objs[i].rotation.y=p.r;objs[i].userData.i=i;});}

  /* qué se puede pisar o chocar: las piezas visibles (sin follaje ni vidrios muy transparentes) y el terreno */
  const NOPISA=new Set(['techo','chapa','chapon','lucernario','cabio']);/* los techos no cuentan: nadie camina por ahí y tapan los pisos */
  let msCache=null,msParts=null,msT=0;
  function meshes(){const now=performance.now();if(msCache&&msParts===visor.parts&&now-msT<1500)return msCache;msParts=visor.parts;msT=now;const ms=[];
    for(const p of visor.parts){if(!p.grp||p.grp.visible===false||p.cat==='follaje'||NOPISA.has(p.cat)||(p.tags||[]).some(t=>t==='techos'||t==='TE'))continue;const agua=p.cat==='agua'||p.cat==='pileta'||p.id==='PIL-1';/* PIL-2 es el deck elevado: se pisa */p.grp.traverse(o=>{if(o.isMesh&&o.visible!==false){o.userData.agua=agua;ms.push(o);}});}
    scene.traverse(o=>{if(o.isMesh&&(o.userData.ground||o.geometry&&o.geometry.type==='PlaneGeometry'&&o.rotation.x<-1.5))ms.push(o);});return msCache=ms;}
  const rc=new THREE.Raycaster();
  function floorAt(x,z,yFrom,maxDown=400){rc.set(new V(x,yFrom,z),new V(0,-1,0));rc.far=maxDown;const h=rc.intersectObjects(meshes(),false).find(h=>!h.face||h.face.normal.clone().transformDirection(h.object.matrixWorld).y>.5);return h&&!h.object.userData.agua?h.point.y:null;/* la pileta no se pisa */}

  /* arrastrar: la persona sigue al cursor sobre la primera superficie horizontal que tocás */
  const mv=new THREE.Vector2();const setRay=e=>{const r=view.getBoundingClientRect();mv.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);rc.setFromCamera(mv,camera);rc.far=Infinity;};
  let dr=null;
  view.addEventListener('pointerdown',e=>{if(e.button!==0||!objs.length)return;setRay(e);const h=rc.intersectObjects(objs.map(o=>o.userData.pick),false)[0];if(!h)return;
    const g=h.object.parent;if(!g)return;e.stopPropagation();e.preventDefault();view.setPointerCapture(e.pointerId);visor.controls.enabled=false;
    dr={i:g.userData.i,x0:e.clientX,rot:e.shiftKey};hint(`Persona ${dr.i+1}: arrastrala por el piso · Shift: girarla`);},true);
  view.addEventListener('pointermove',e=>{if(!dr)return;e.stopPropagation();const p=list[dr.i];
    if(dr.rot||e.shiftKey){p.r+=(e.clientX-dr.x0)*.02;dr.x0=e.clientX;sync();return;}
    setRay(e);const hs=rc.intersectObjects(meshes(),false);const h=hs.find(h=>h.face&&h.face.normal.clone().transformDirection(h.object.matrixWorld).y>.7);
    if(h){p.x=h.point.x;p.z=h.point.z;p.y=h.point.y;sync();hint(`Persona ${dr.i+1} · piso a ${(p.y/100).toFixed(2)} m · coronilla a ${((p.y+H)/100).toFixed(2)} m`);}},true);
  const end=e=>{if(!dr)return;e.stopPropagation();dr=null;visor.controls.enabled=true;save();};
  view.addEventListener('pointerup',end,true);view.addEventListener('pointercancel',end,true);
  function hint(t){const st=document.getElementById('stTool');if(st)st.innerHTML=t;}

  /* caminar solas: 1,1 m/s; giran al encontrar pared (a 45 cm), escalón de más de 25 o caída */
  /* zona de paseo: la caja de los muros más 6 m (se recalcula si cambia el modelo) */
  let zP=null,zParts=null;function zona(){if(zP&&zParts===visor.parts)return zP;zParts=visor.parts;const b=new THREE.Box3();for(const q of visor.parts||[])if(q.grp&&/^M-/.test(q.id))b.expandByObject(q.grp);if(b.isEmpty())return zP=null;const m=600;return zP={x0:b.min.x-m,x1:b.max.x+m,z0:b.min.z-m,z1:b.max.z+m,cx:(b.min.x+b.max.x)/2,cz:(b.min.z+b.max.z)/2};}
  const SPD=105,STEP=25;let last=performance.now();
  /* muebles: el cuerpo (radio 22) no entra en la caja de ningún mueble que esté a la altura del cuerpo (Maxi 15/10: los rayos pasaban entre las patas de mesas y sillas y por arriba de los muebles bajos) */
  const R=22;function choca(p,nx,nz){const bs=visor.equip&&visor.equip.cajasMue?visor.equip.cajasMue():[];for(const b of bs){if(b.max.y<p.y+6||b.min.y>p.y+165)continue;const dentro=(x,z)=>x>b.min.x-R&&x<b.max.x+R&&z>b.min.z-R&&z<b.max.z+R;if(dentro(nx,nz)&&!dentro(p.x,p.z))return true;}return false;}
  function blocked(p,dir){const o=new V(p.x,p.y+STEP+10,p.z);for(const hh of [0,60,120]){o.y=p.y+STEP+10+hh;rc.set(o,dir);rc.far=45;if(rc.intersectObjects(meshes(),false).length)return true;/* muebles del equipamiento: no los atraviesan */const mu=visor.equip&&visor.equip.mallasMue?visor.equip.mallasMue():[];if(mu.length&&rc.intersectObjects(mu,false).length)return true;}return false;}
  function tick(now){requestAnimationFrame(tick);const dt=Math.min(.05,(now-last)/1000);last=now;/* reposo (Maxi 14/10): sin actividad las personas se quedan quietas donde están hasta que vuelva a haber movimiento */if(!dr&&now-(window.__act||0)>2500)return;objs.forEach((o,i)=>{if(o&&o.userData.mx){o.userData.mx.update(dt);if(!list[i]||!list[i].w||dr)anim(o,'idle');}});if(dr||!list.some(p=>p.w))return;
    list.forEach((p,i)=>{if(!p.w)return;const dir=new V(Math.sin(p.r),0,Math.cos(p.r));
      if(Math.random()<dt*.25)p.r+=(Math.random()-.5)*1.2;/* cada tanto cambia un poco de rumbo */
      /* Maxi 16/10: «la gente se va caminando lejos de la casa, hacé que siempre vuelvan»: fuera de la casa más 6 m, giran hacia el centro */
      {const z=zona();if(z&&(p.x<z.x0||p.x>z.x1||p.z<z.z0||p.z>z.z1)){const r0=Math.atan2(z.cx-p.x,z.cz-p.z);let d=r0-p.r;d=Math.atan2(Math.sin(d),Math.cos(d));p.r+=Math.max(-2*dt,Math.min(2*dt,d));}}
      if(blocked(p,dir)||choca(p,p.x+dir.x*(SPD*dt+4),p.z+dir.z*(SPD*dt+4))){p.r+=Math.PI*(.5+Math.random());return;}
      const nx=p.x+dir.x*SPD*dt,nz=p.z+dir.z*SPD*dt,fy=floorAt(nx,nz,p.y+STEP+5,STEP*2+10);
      if(fy===null||Math.abs(fy-p.y)>STEP){p.r+=Math.PI*(.6+Math.random()*.8);return;}
      p.x=nx;p.z=nz;p.y=fy;anim(objs[i],'walk');});
    sync();if(now%2000<20)save();}
  requestAnimationFrame(tick);

  function add(fig){/* en el centro de la pantalla, sobre el piso que se vea ahí */rc.setFromCamera(new THREE.Vector2(0,0),camera);rc.far=Infinity;const hs=rc.intersectObjects(meshes(),false);const h=hs.find(h=>h.face&&h.face.normal.clone().transformDirection(h.object.matrixWorld).y>.7);
    const t=h?h.point:visor.controls.target.clone();list.push({x:t.x,y:h?t.y:(floorAt(t.x,t.z,t.y+300,800)??0),z:t.z,r:Math.random()*6.28,f:fig||FIGS[list.length%FIGS.length][0],w:false});sync();save();}
  let nuevaFig=FIGS[0][0];
  function renderInto(el,close){el.style.width='300px';el.style.maxHeight='calc(100vh - 16px)';el.style.overflow='auto';const opts=f=>FIGS.map(([k,n])=>`<option value="${k}"${k===f?' selected':''}>${n}</option>`).join('');
    const draw=()=>{el.innerHTML=`<div class="fyg">Personas de 1,70</div>`+(list.length?list.map((p,i)=>`<div class="fyi"><button class="fyb" data-go="${i}">${i+1}</button><select data-fig="${i}" style="flex:1;min-width:0">${opts(p.f)}</select><label title="Camina sola" style="display:flex;align-items:center;gap:2px;font-size:11px"><input type="checkbox" data-w="${i}" ${p.w?'checked':''}>camina</label><button class="fyx" data-del="${i}" data-tip="Quitar">×</button></div>`).join(''):'<div class="fye">Ninguna todavía. Se agregan en el centro de la vista.</div>')+
      `<div class="fysep"></div><div class="fyi" style="gap:4px"><select data-newfig style="flex:1;min-width:0">${opts(nuevaFig)}</select><button class="fyb fyacc" data-add="" style="flex:none">＋ Agregar</button></div>`+`<div style="display:flex;gap:4px"><button class="fyb" data-todas="1">Caminan todas</button><button class="fyb" data-todas="0">Quietas todas</button></div><div class="fye">Arrastralas sobre cualquier piso; con Shift las girás. «camina» la hace pasear sola (no pisa la pileta). El número la muestra de cerca.</div>`;};
    draw();el.onclick=e=>{const t=e.target;const td=t.closest('[data-todas]');if(td){list.forEach(p=>p.w=td.dataset.todas==='1');save();draw();return;}const a=t.closest('[data-add]');if(a){add(a.dataset.add||nuevaFig);draw();return;}const d=t.closest('[data-del]');if(d){list.splice(+d.dataset.del,1);const o=objs.splice(+d.dataset.del,1)[0];if(o)G.remove(o);sync();save();draw();return;}
      const g=t.closest('[data-go]');if(g){const p=list[+g.dataset.go];close&&close();visor.fly([p.x+250,p.y+220,p.z+250],[p.x,p.y+100,p.z]);}};
    el.onchange=e=>{if(e.target.matches('[data-newfig]')){nuevaFig=e.target.value;return;}if(e.target.dataset.w!=null){list[+e.target.dataset.w].w=e.target.checked;save();}
      if(e.target.dataset.fig){list[+e.target.dataset.fig].f=e.target.value;sync();save();}};}
  sync();
  const api={renderInto,add,get list(){return list;},setWalk(v){list.forEach(p=>p.w=!!v);save();}};visor.personas=api;return api;
}
