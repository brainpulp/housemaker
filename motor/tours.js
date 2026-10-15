/* Tours (Maxi, 14/10): caminatas a la altura de los ojos (1,60), subiendo escaleras, y vuelos de dron.
   Se eligen en el menú de Vistas (sección «Tours»). Un link con #tour=<id> abre el 3D y lo reproduce; al terminar
   (o al tocar la vista, la rueda o una tecla) se detiene y queda todo interactivo.
   Las escaleras no están escritas a mano: se leen de las pedadas de la variante que esté puesta (sus caras horizontales),
   así el tour sube por la escalera que haya. Coordenadas: plano x (norte), y (este); 3D X = x, Y = alto, Z = y. */
import * as N from './nombres.js';
export function initTours(visor){
  const {THREE,camera,controls}=visor;const V=THREE.Vector3;
  const OJO=160,VEL=105,PEDADA_T=.55;
  /* ---------- tours ---------- */
  const TOURS=[
    {id:'patio-cocina',n:'Caminata: del patio al living y la cocina',tipo:'walk',seg:[
      {walk:[[1409,-330],[1409,-60],[1409,30],[1420,170]],lvl:0},{look:[2000,170,700],t:2.5},
      {walk:[[1600,420],[1880,780]],lvl:0},{look:[1950,160,1500],t:2.5},
      {walk:[[2150,560],[2150,250],[1950,70],[1935,-120]],lvl:0},{look:[1866,120,-170],t:2},{walk:[[1935,-420]],lvl:0},{look:[1935,150,-700],t:1.5}]},
    {id:'entrepiso',n:'Caminata: subir al entrepiso',tipo:'walk',seg:[
      {walk:[[1900,420],[1650,560]],lvl:0},{stair:'ep'},{look:[2000,150,450],t:2.5},{walk:[[1250,330],[1120,250]],lvl:262},{look:[750,170,350],t:2}]},
    {id:'altillo',n:'Caminata: subir al altillo',tipo:'walk',seg:[
      {walk:[[1950,250],[2050,-30],[2250,-60]],lvl:0},{stair:'alt'},{walk:[[2103,-310],[2103,-420],[2100,-560]],lvl:262},{look:[1900,330,-700],t:2},{look:[2300,330,-450],t:2}]},
    {id:'jardin-pileta',n:'Caminata: jardín, quincho y pileta',tipo:'walk',seg:[
      {walk:[[1500,1070]],lvl:0},{look:[1750,250,500],t:2.5},{walk:[[2300,1080],[2700,760]],lvl:0},{look:[2746,230,250],t:2},
      {walk:[[3200,640],[3480,90]],lvl:0},{stair:'pil2'},{walk:[[3950,110],[4136,140]],lvl:100},{look:[4136,0,1300],t:3}]},
    {id:'dron-vuelta',n:'Dron: vuelta alrededor de la casa',tipo:'orbit',c:[1550,150,150],r:2700,h:950,dur:42,a0:0},
    {id:'dron-jardin',n:'Dron: del jardín, por arriba del techo, a la pileta',tipo:'fly',dur:34,k:[
      [[700,170,2500],[700,140,690]],[[1500,300,1800],[1650,200,700]],[[2050,950,1150],[2050,250,300]],[[2900,1150,200],[3500,0,700]],[[3700,520,-250],[4100,40,700]],[[4140,260,-300],[4140,60,1000]]]},
    {id:'dron-ventanal',n:'Dron: entra por el ventanal al living',tipo:'fly',dur:26,k:[
      [[1900,260,2700],[1900,200,900]],[[1900,220,1300],[1900,200,600]],[[1880,200,860],[1700,240,300]],[[1800,430,520],[1200,320,400]],[[1650,480,260],[2000,120,-250]]]},
  ];

  /* ---------- geometría: piso y pedadas ---------- */
  const rc=new THREE.Raycaster();
  function mallas(){const ms=[];for(const p of visor.parts||[]){if(p.cat==='glass'||p.grp.visible===false)continue;p.grp.traverse(o=>{if(o.isMesh&&o.visible)ms.push(o);});}visor.scene.traverse(o=>{if(o.isMesh&&o.userData.ground)ms.push(o);});return ms;}
  function piso(x,y,lvl,ms){rc.set(new V(x,lvl+140,y),new V(0,-1,0));rc.far=260;const h=rc.intersectObjects(ms,false).find(i=>{const m=Array.isArray(i.object.material)?i.object.material[0]:i.object.material;return !(m&&m.transparent&&m.opacity<.6);});return h?h.point.y:(lvl>0?lvl:-20);}
  const RX={ep:p=>/^(ESC1-T|ESC-(ZE\d|TE|E\d|P\d|T\d|H\d|L\d))$/.test(p.id)&&(p.cat==='ep'||p.cat==='madera'),alt:p=>(/^ESC-(A|D|E|S|B2|B3)$/.test(p.id)||p.id==='PAS-1')&&(p.cat==='ep'||p.cat==='madera'),pil2:p=>p.id==='PIL-2s'};
  function pedadas(k){const C=new Map();const a=new V(),b=new V(),c=new V(),n=new V();
    for(const p of visor.parts||[]){if(!RX[k](p)||p.grp.visible===false)continue;p.grp.updateMatrixWorld(true);p.grp.traverse(o=>{if(!o.isMesh)return;const P=o.geometry.attributes.position,I=o.geometry.index,cnt=I?I.count:P.count;
      for(let i=0;i<cnt;i+=3){const ia=I?I.getX(i):i,ib=I?I.getX(i+1):i+1,ic=I?I.getX(i+2):i+2;a.fromBufferAttribute(P,ia).applyMatrix4(o.matrixWorld);b.fromBufferAttribute(P,ib).applyMatrix4(o.matrixWorld);c.fromBufferAttribute(P,ic).applyMatrix4(o.matrixWorld);
        n.subVectors(b,a).cross(c.clone().sub(a));const ar=n.length()/2;if(ar<1)continue;n.normalize();if(n.y<.95)continue;const key=Math.round(a.y/3);let q=C.get(key);if(!q){q={x:0,y:0,z:0,A:0};C.set(key,q);}
        q.x+=(a.x+b.x+c.x)/3*ar;q.y+=(a.y+b.y+c.y)/3*ar;q.z+=(a.z+b.z+c.z)/3*ar;q.A+=ar;}});}
    return [...C.values()].filter(q=>q.A>250).map(q=>new V(q.x/q.A,q.y/q.A,q.z/q.A)).sort((u,v)=>u.y-v.y);}

  /* ---------- compilar un tour a cuadros {t, p, q} ---------- */
  function compilar(T){const F=[];let t=0,last=null,ms=mallas();
    const push=(p,q,dt)=>{t+=dt;F.push({t,p:p.clone(),q:q.clone()});last={p:p.clone(),q:q.clone()};};
    const tramo=(pts,velo)=>{/* pts: Vector3 ojos; mira 150 adelante */for(let i=0;i<pts.length;i++){const p=pts[i];const prev=last?last.p:p;const d=prev.distanceTo(p);
        const ah=pts[Math.min(pts.length-1,i+3)]||p;let q=ah.clone();if(q.distanceToSquared(p)<100){q=last?last.q.clone():p.clone().add(new V(0,0,100));}else{q.sub(p).setY(0).setLength(150).add(p);q.y=p.y-8;}
        push(p,q,last?d/velo:0);}};
    const andar=(xy,lvl)=>{if(!xy.length)return;const pts=[];let from=last?[last.p.x,last.p.z]:xy[0];const all=last?[from,...xy]:xy;
      for(let s=0;s<all.length-1;s++){const [x0,y0]=all[s],[x1,y1]=all[s+1],L=Math.hypot(x1-x0,y1-y0),n=Math.max(1,Math.ceil(L/25));for(let k=s===0&&last?1:0;k<=n;k++){const x=x0+(x1-x0)*k/n,y=y0+(y1-y0)*k/n;pts.push(new V(x,piso(x,y,lvl,ms)+OJO,y));}}
      if(all.length===1)pts.push(new V(all[0][0],piso(all[0][0],all[0][1],lvl,ms)+OJO,all[0][1]));tramo(pts,VEL);};
    if(T.tipo==='walk'){for(const s of T.seg){
        if(s.walk)andar(s.walk,s.lvl||0);
        else if(s.look){if(!last)continue;const q=new V(...s.look);const p=last.p.clone();push(p,q,1.3);push(p,q,s.t||2);}
        else if(s.stair){const P=pedadas(s.stair);if(P.length<2)continue;const d0=new V().subVectors(P[1],P[0]).setY(0).normalize(),d1=new V().subVectors(P[P.length-1],P[P.length-2]).setY(0).normalize();
          const pie=P[0].clone().addScaledVector(d0,-70);andar([[pie.x,pie.z]],Math.max(0,P[0].y-40));
          const pts=P.map(v=>new V(v.x,v.y+OJO,v.z));const top=P[P.length-1].clone().addScaledVector(d1,70);pts.push(new V(top.x,P[P.length-1].y+OJO,top.z));
          for(const p of pts){const d=last?last.p.distanceTo(p):0;const q=p.clone().add(d1.clone().lerp(new V().subVectors(p,last?last.p:p).setY(0).normalize(),.6).setLength(150));q.y=p.y+25;push(p,q,Math.max(PEDADA_T,d/VEL));}}}
      return {F,dur:t,walk:true};}
    if(T.tipo==='orbit'){const n=96;const c=new V(...T.c);for(let i=0;i<=n;i++){const a=T.a0+i/n*Math.PI*2;F.push({t:i/n*T.dur,p:new V(c.x+Math.cos(a)*T.r,T.h,c.z+Math.sin(a)*T.r),q:c.clone()});}return {F,dur:T.dur};}
    const cp=new THREE.CatmullRomCurve3(T.k.map(k=>new V(...k[0])),false,'centripetal'),cq=new THREE.CatmullRomCurve3(T.k.map(k=>new V(...k[1])),false,'centripetal');const n=240;
    for(let i=0;i<=n;i++){const u=i/n,e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;F.push({t:u*T.dur,p:cp.getPoint(e),q:cq.getPoint(e)});}return {F,dur:T.dur};}

  /* ---------- reproducir ---------- */
  let run=null;const view=document.getElementById('view')||visor.renderer.domElement;
  const bar=document.createElement('div');bar.style.cssText='position:absolute;top:10px;left:50%;transform:translateX(-50%);z-index:9;display:none;background:rgba(20,22,24,.86);color:#fff;border-radius:16px;padding:5px 8px 5px 14px;font:12px var(--f-mono,monospace);align-items:center;gap:8px;box-shadow:0 4px 14px rgba(0,0,0,.25)';
  bar.innerHTML='<span data-n></span><span style="width:90px;height:3px;background:rgba(255,255,255,.25);border-radius:2px;overflow:hidden"><i data-p style="display:block;height:100%;width:0;background:#e0a21c"></i></span><button data-pp style="background:none;border:0;color:#fff;cursor:pointer;font-size:13px">❚❚</button><button data-x style="background:none;border:0;color:#fff;cursor:pointer;font-size:14px" title="Terminar y tomar el control">✕</button>';
  (document.querySelector('#modo-3d .stage')||document.body).appendChild(bar);
  const fov0={v:camera.fov};
  function play(id){const T=TOURS.find(x=>x.id===id);if(!T)return;stop(true);let C;try{C=compilar(T);}catch(e){console.error('tour',e);return;}if(!C.F.length)return;
    run={T,C,t:0,last:performance.now(),pausa:false,p:C.F[0].p.clone(),q:C.F[0].q.clone()};controls.enabled=false;fov0.v=camera.fov;camera.fov=C.walk?62:45;camera.updateProjectionMatrix();
    bar.style.display='flex';bar.querySelector('[data-n]').textContent=T.n;bar.querySelector('[data-pp]').textContent='❚❚';requestAnimationFrame(paso);}
  function stop(silent){if(!run)return;run=null;bar.style.display='none';controls.enabled=true;camera.fov=fov0.v;camera.updateProjectionMatrix();if(!silent){const st=document.getElementById('stTool');if(st)st.textContent='Tour terminado: ya podés moverte.';}}
  function paso(now){if(!run)return;requestAnimationFrame(paso);window.__despertar&&window.__despertar();const dt=Math.min(.1,(now-run.last)/1000);run.last=now;if(!run.pausa)run.t+=dt;const {F,dur,walk}=run.C;
    if(run.t>=dur){stop();return;}let i=1;while(i<F.length-1&&F[i].t<run.t)i++;const A=F[i-1],B=F[i],u=B.t>A.t?Math.min(1,Math.max(0,(run.t-A.t)/(B.t-A.t))):1;
    const p=A.p.clone().lerp(B.p,u),q=A.q.clone().lerp(B.q,u);if(walk){run.p.lerp(p,1-Math.exp(-dt*9));run.q.lerp(q,1-Math.exp(-dt*3.5));}else{run.p.copy(p);run.q.copy(q);}
    camera.position.copy(run.p);controls.target.copy(run.q);camera.lookAt(run.q);bar.querySelector('[data-p]').style.width=(run.t/dur*100).toFixed(1)+'%';}
  bar.addEventListener('click',e=>{if(e.target.closest('[data-x]'))stop();else if(e.target.closest('[data-pp]')&&run){run.pausa=!run.pausa;e.target.textContent=run.pausa?'▶':'❚❚';}});
  for(const ev of ['pointerdown','wheel'])view.addEventListener(ev,()=>{if(run)stop();},true);
  addEventListener('keydown',e=>{if(!run)return;if(e.key===' '){run.pausa=!run.pausa;bar.querySelector('[data-pp]').textContent=run.pausa?'▶':'❚❚';e.preventDefault();return;}if(!e.metaKey&&!e.ctrlKey)stop();},true);

  /* ---------- link ----------
     claude.ai no le pasa a la página el #… ni el ?… del link, así que el «link a un tour» funciona así: marcás un tour como
     «al abrir» (queda en la base del artifact) y mandás el link de siempre; quien lo abre lo ve una vez (por navegador)
     y después queda libre. Vos (dueño) no lo ves al abrir, salvo con ▶. En una copia local sí anda #tour=<id>. */
  const BASE='https://claude.ai/artifact/Y88Y892Rach7aXSqSN5zpc';
  let alAbrir=null,db=null;
  const listo=f=>{const go=()=>{if(window.__ok3d&&visor.parts&&visor.parts.length)setTimeout(f,1800);else setTimeout(go,300);};go();};
  const m0=(location.hash+'&'+location.search).match(/tour=([\w-]+)/);if(m0)listo(()=>play(m0[1]));
  N.getDb().then(async d=>{db=d;if(!d)return;try{const x=await d.doc('estado/tourInicio').get();alAbrir=x.exists?x.data():null;}catch(e){return;}
    if(!alAbrir||!alAbrir.id||m0)return;let visto='';try{visto=localStorage.getItem('carhue-tour-visto')||'';}catch(e){}if(visto===alAbrir.ts)return;
    let duenio=false;try{const u=window.claude&&await window.claude.use('user');duenio=!!(u&&u.isOwner&&u.isOwner());}catch(e){}if(duenio)return;
    listo(()=>{play(alAbrir.id);try{localStorage.setItem('carhue-tour-visto',alAbrir.ts);}catch(e){}});});
  async function marcar(id){const on=!(alAbrir&&alAbrir.id===id);alAbrir=on?{id,ts:new Date().toISOString()}:null;if(db){try{await db.doc('estado/tourInicio').set(alAbrir||{id:null,ts:new Date().toISOString()});}catch(e){return false;}}return on;}

  /* ---------- menú (dentro de Vistas) ---------- */
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function appendInto(el,close){const box=document.createElement('div');
    box.innerHTML=`<div class="fysep"></div><div class="fyg">Tours</div>${TOURS.map(T=>{const on=alAbrir&&alAbrir.id===T.id;return `<div class="fyi"><button class="fyb" data-tour="${T.id}">${T.tipo==='walk'?'🚶':'🛸'} ${esc(T.n.replace(/^(Caminata|Dron): /,''))}</button><button class="fyx" data-link="${T.id}" data-tip="${on?'Es el tour al abrir el link · tocá para sacarlo':'Que este tour arranque solo al abrir el link · copia el link'}" style="${on?'color:#c98a00':''}">${on?'★':'🔗'}</button></div>`;}).join('')}
      <p class="fyh" style="padding:4px 8px;margin:0;font-size:10px;color:var(--muted)">🔗 marca el tour que ve quien abre el link (una vez) y copia el link.</p>`;
    el.appendChild(box);box.addEventListener('click',async e=>{const b=e.target.closest('[data-tour],[data-link]');if(!b)return;e.stopPropagation();
      if(b.dataset.tour){close&&close();play(b.dataset.tour);return;}
      const on=await marcar(b.dataset.link);if(on===false){b.textContent='✗';return;}
      let ok=false;if(on){try{await navigator.clipboard.writeText(BASE);ok=true;}catch(err){}if(!ok){const ta=document.createElement('textarea');ta.value=BASE;document.body.appendChild(ta);ta.select();try{ok=document.execCommand('copy');}catch(err){}ta.remove();}}
      const st=document.getElementById('stTool');if(st)st.textContent=on?`Al abrir el link arranca «${TOURS.find(t=>t.id===b.dataset.link).n}» (una vez por persona).${ok?' Link copiado.':' Link: '+BASE}`:'Ningún tour al abrir el link.';
      box.remove();appendInto(el,close);});}
  const api={TOURS,play,stop,appendInto,get corriendo(){return !!run;},_compilar:compilar,_pedadas:pedadas};visor.tours=api;return api;
}
