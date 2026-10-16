/* ☀ Asoleamiento y luces programadas (Maxi, 14/10).
   Sol calculado para fecha, hora y lugar (Ing. Maschwitz, Pasaje Carhué, por defecto); x del modelo = norte, y = este (se puede corregir con «desvío del norte»).
   Cuando el sol está más de 4° bajo el horizonte: cielo negro, luna tenue y bloom sobre los emisores.
   Cada artefacto de la capa «Luces» tiene un programa como un sistema de casa inteligente: prende y apaga a una hora fija
   o al atardecer / amanecer ± minutos (o queda siempre prendido / apagado). Las que están prendidas son luces reales:
   spots (SpotLight con apertura y sombra), lámparas (PointLight) y tiras / lineales / plafones (RectAreaLight).
   Unidades: la escena está en cm; un spot de I candelas da I/d² lux con d en m → intensidad = cd·10⁴·EXPO.
   Un «pool» fijo de luces (no recompila shaders) se reparte entre las fuentes que más importan para la cámara. */
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const R=Math.PI/180;
/* posición del sol (algoritmo de baja precisión del Almanaque; ±0,3°): fecha local, minutos del día, huso (h), lat, lon → {alt, az} en grados, az desde el norte hacia el este */
export function solPos(fecha,min,tz,lat,lon){const [Y,M,D]=fecha.split('-').map(Number);const ut=Date.UTC(Y,M-1,D)+(min-tz*60)*60000;const n=ut/86400000+2440587.5-2451545.0;
  const L=(280.460+0.9856474*n)%360,g=(357.528+0.9856003*n)*R;const lam=(L+1.915*Math.sin(g)+0.020*Math.sin(2*g))*R,eps=(23.439-0.0000004*n)*R;
  const ra=Math.atan2(Math.cos(eps)*Math.sin(lam),Math.cos(lam)),dec=Math.asin(Math.sin(eps)*Math.sin(lam));
  const gmst=((18.697374558+24.06570982441908*n)%24+24)%24;const H=(gmst*15+lon)*R-ra;const la=lat*R;
  const alt=Math.asin(Math.sin(la)*Math.sin(dec)+Math.cos(la)*Math.cos(dec)*Math.cos(H));
  const az=Math.atan2(-Math.sin(H)*Math.cos(dec),Math.sin(dec)*Math.cos(la)-Math.cos(dec)*Math.cos(H)*Math.sin(la));
  return {alt:alt/R,az:((az/R)+360)%360};}
/* amanecer y atardecer (centro del sol a −0,833°), en minutos locales; null si no hay */
export function solHoras(fecha,tz,lat,lon){let sr=null,ss=null,prev=solPos(fecha,0,tz,lat,lon).alt+.833;
  for(let m=2;m<=1440;m+=2){const a=solPos(fecha,m,tz,lat,lon).alt+.833;if(prev<0&&a>=0&&sr==null)sr=m-2+2*(-prev)/(a-prev);if(prev>=0&&a<0)ss=m-2+2*prev/(prev-a);prev=a;}return {sr,ss};}
export const hhmm=m=>{if(m==null)return '—';m=((Math.round(m)%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');};
const aMin=s=>{const [h,m]=String(s||'0:0').split(':').map(Number);return (h||0)*60+(m||0);};

/* programa de un artefacto → ¿prendido a los «min» minutos? */
const EXT=new Set(['baliza','proyector','pileta','guirnalda']);
export function progDef(tipo){if(tipo==='pileta')return {modo:'prog',on:{t:'atardecer',m:0},off:{t:'hora',h:'23:00'}};
  if(EXT.has(tipo))return {modo:'prog',on:{t:'atardecer',m:0},off:{t:'hora',h:'01:00'}};
  if(tipo==='reflector')return {modo:'prog',on:{t:'atardecer',m:0},off:{t:'hora',h:'00:00'}};
  if(tipo==='velador')return {modo:'prog',on:{t:'hora',h:'21:30'},off:{t:'hora',h:'00:30'}};
  return {modo:'prog',on:{t:'atardecer',m:-15},off:{t:'hora',h:'23:30'}};}
export function prendida(prog,min,sr,ss){const p=prog||{modo:'prog'};if(p.modo==='on')return true;if(p.modo==='off')return false;
  const ev=e=>e?.t==='hora'?aMin(e.h):e?.t==='amanecer'?(sr??360)+(+e.m||0):(ss??1200)+(+e.m||0);
  const a=((ev(p.on)%1440)+1440)%1440,b=((ev(p.off)%1440)+1440)%1440;if(a===b)return true;return a<b?(min>=a&&min<b):(min>=a||min<b);}

/* datos (de la casa): {lugar,lat,lon,tz,norte,inicioDia}: lugar por defecto y desvío del norte; sin datos, Ing. Maschwitz (Carhué). */
export function initNoche(visor,datos=null){
  const {THREE,scene,renderer,camera}=visor;
  const EXPO=1/70;/* lux → unidades de escena: ~150 lux sobre blanco queda bien expuesto */
  const hoy=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  const S={ev:0,luna:.35,sombras:4,bloom:.55,max:24,fecha:hoy(),min:new Date().getHours()*60+new Date().getMinutes(),lat:-34.381,lon:-58.741,tz:-3,norte:0,lugar:'Ing. Maschwitz',diaMin:780,nocheMin:1290};
  if(datos)Object.assign(S,datos);
  try{Object.assign(S,JSON.parse(localStorage.getItem('carhue-sol')||'{}'));}catch(e){}
  /* casas sin luces cargadas: arrancan siempre de día (13 h de hoy); de noche quedaría todo oscuro */
  if(datos&&datos.inicioDia){S.fecha=hoy();S.min=S.diaMin;delete S.inicioDia;}
  if(datos&&datos.max)S.max=Math.max(S.max,datos.max);/* casas con muchas luces: más lugares en el pool */
  if(!datos&&(S.lugar==='Carhué'||Math.abs(S.lat+37.178)<.01)){S.lat=-34.381;S.lon=-58.741;S.lugar='Ing. Maschwitz';}/* la casa está en el pasaje Carhué, en Ingeniero Maschwitz (Maxi 14/10) */
  const guardarS=()=>{try{localStorage.setItem('carhue-sol',JSON.stringify(S));}catch(e){}};
  /* prendida o no: toda la casa forzada (prender / apagar todo) o el programa de cada artefacto */
  const enc=prog=>S.forzar?S.forzar==='on':prendida(prog,S.min,horas.sr,horas.ss);
  let noche=false,fuentes=[],dirty=true,pool=null,usadas=0,sol={alt:45,az:0},horas={sr:null,ss:null},horasKey='',encendidas=0;
  RectAreaLightUniformsLib.init();

  /* ---------- pool de luces ---------- */
  function armarPool(){quitarPool();const nS=Math.round(S.max*.6),nP=Math.round(S.max*.25),nR=Math.max(2,S.max-nS-nP);pool={spot:[],point:[],rect:[]};
    for(let i=0;i<nS;i++){const l=new THREE.SpotLight(0xffffff,0,0,.5,.45,2);l.castShadow=i<S.sombras;if(l.castShadow){l.shadow.mapSize.set(1024,1024);l.shadow.camera.near=4;l.shadow.camera.far=2500;l.shadow.bias=-0.0006;l.shadow.normalBias=1.5;l.shadow.radius=3;}
      l.userData.noPick=true;scene.add(l,l.target);pool.spot.push(l);}
    for(let i=0;i<nP;i++){const l=new THREE.PointLight(0xffffff,0,0,2);l.userData.noPick=true;scene.add(l);pool.point.push(l);}
    for(let i=0;i<nR;i++){const l=new THREE.RectAreaLight(0xffffff,0,10,10);l.userData.noPick=true;scene.add(l);pool.rect.push(l);}
    dirty=true;}
  function quitarPool(){if(!pool)return;for(const l of [...pool.spot,...pool.point,...pool.rect]){scene.remove(l);if(l.target)scene.remove(l.target);if(l.shadow&&l.shadow.map){l.shadow.map.dispose();l.shadow.map=null;}l.dispose&&l.dispose();}pool=null;}

  /* ---------- reparto: las fuentes prendidas que más importan para la cámara ---------- */
  const fr=new THREE.Frustum(),pm=new THREE.Matrix4(),sph=new THREE.Sphere(),lastCam=new THREE.Vector3(1e9,0,0),tmp=new THREE.Vector3();
  function repartir(){if(!pool)return;camera.updateMatrixWorld();pm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);fr.setFromProjectionMatrix(pm);const cp=camera.position;
    const imp=f=>{const d2=f.p.distanceToSquared(cp);sph.set(f.p,Math.sqrt(f.lm)*12);return f.lm/(d2+4e4)*(fr.intersectsSphere(sph)?1:.2);};
    const by={spot:[],point:[],rect:[]};for(const f of fuentes){if(f.lm<=0||!f.on)continue;f._i=imp(f);(by[f.t]||by.point).push(f);}
    usadas=0;
    for(const k of ['spot','point','rect']){const L=by[k].sort((a,b)=>b._i-a._i);const P=pool[k];
      for(let i=0;i<P.length;i++){const l=P[i],f=L[i];if(!f){l.intensity=0;continue;}usadas++;l.color.copy(f.col);
        if(k==='spot'){const half=Math.min(Math.PI/2.05,(f.beam||40)/2*R*1.25);const cd=f.lm/(2*Math.PI*(1-Math.cos((f.beam||40)/2*R)));
          l.intensity=cd*1e4*EXPO;l.angle=half;l.penumbra=.5;l.position.copy(f.p);l.target.position.copy(f.p).addScaledVector(f.d,100);l.target.updateMatrixWorld();}
        else if(k==='point'){l.intensity=f.lm/(4*Math.PI)*1e4*EXPO;l.distance=f.dist||0;l.position.copy(f.p);}
        else{const A=Math.max(1,f.w)*Math.max(.5,f.h)/1e4;l.width=Math.max(1,f.w);l.height=Math.max(.5,f.h);l.intensity=f.lm/(Math.PI*A)*EXPO;l.position.copy(f.p);l.lookAt(tmp.copy(f.p).add(f.d));}}}
    dirty=false;lastCam.copy(cp);}

  /* ---------- luces de la escena (realismo / luz realista) ---------- */
  function L(){const o={hemi:[],sun:null,fill:[]};scene.traverse(x=>{if(pool&&(x.isSpotLight||x.isPointLight||x.isRectAreaLight))return;if(x.isHemisphereLight)o.hemi.push(x);else if(x.isDirectionalLight){if(x.castShadow)o.sun=x;else o.fill.push(x);}});return o;}
  const smooth=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
  const cDia=new THREE.Color(),cBajo=new THREE.Color(0xff9348),dirV=new THREE.Vector3();
  const cielo=new THREE.Color(0x000000);let bgDia=null;
  let comp=null,bloom=null;const sz=new THREE.Vector2();
  function armarComp(){renderer.getSize(sz);const pr=renderer.getPixelRatio();const rt=new THREE.WebGLRenderTarget(sz.x*pr,sz.y*pr,{type:THREE.HalfFloatType,samples:4});
    comp=new EffectComposer(renderer,rt);comp.setPixelRatio(pr);comp.setSize(sz.x,sz.y);comp.addPass(new RenderPass(scene,camera));
    bloom=new UnrealBloomPass(new THREE.Vector2(sz.x,sz.y),S.bloom,.5,1.0);comp.addPass(bloom);comp.addPass(new OutputPass());}
  const hookNoche=()=>{if(scene.background!==cielo)scene.background=cielo;if(dirty||camera.position.distanceToSquared(lastCam)>2500)repartir();
    renderer.getSize(sz);const w=sz.x*renderer.getPixelRatio(),h=sz.y*renderer.getPixelRatio();if(comp.renderTarget1.width!==w||comp.renderTarget1.height!==h){comp.setPixelRatio(renderer.getPixelRatio());comp.setSize(sz.x,sz.y);}
    bloom.strength=S.bloom;comp.render();};
  const hookDia=()=>{if(dirty||camera.position.distanceToSquared(lastCam)>2500)repartir();const lh=visor.luzSol&&visor.luzSol.hook();if(lh)lh();else renderer.render(scene,camera);};

  /* ---------- aplicar fecha / hora ---------- */
  function actualizar(){window.__despertar&&window.__despertar();
    const k=S.fecha+S.lat+S.lon+S.tz;if(k!==horasKey){horasKey=k;horas=solHoras(S.fecha,S.tz,S.lat,S.lon);}
    sol=solPos(S.fecha,S.min,S.tz,S.lat,S.lon);const az=(sol.az-S.norte)*R,al=sol.alt*R;dirV.set(Math.cos(al)*Math.cos(az),Math.sin(al),Math.cos(al)*Math.sin(az)).normalize();
    /* luces prendidas según su programa */
    encendidas=0;for(const f of fuentes){f.on=enc(f.prog);}
    const ids=new Set(fuentes.filter(f=>f.on).map(f=>f.id));encendidas=ids.size;
    const nueva=sol.alt<-4;const lz=visor.luzSol,luzOn=!!(lz&&lz.on);const l=L();
    if(nueva!==noche){noche=nueva;if(noche){if(!comp)armarComp();if(lz)scene.remove(lz.sky);bgDia=scene.background;scene.environment=null;}
      else{if(luzOn&&lz){scene.add(lz.sky);visor.luzReal(true);return;}scene.background=bgDia;}}
    if(noche){scene.background=cielo;scene.environment=null;if(lz)scene.remove(lz.sky);
      for(const h of l.hemi){h.intensity=S.luna*.22;h.color.set(0x6d7fa8);h.groundColor.set(0x14161a);}
      for(const f of l.fill)f.visible=false;
      if(l.sun){const s=l.sun;s.visible=S.luna>0;s.intensity=S.luna*.4;s.color.set(0xa9bde6);/* luna: alta, del norte */const t=s.target.position;s.position.set(t.x+3500,t.y+5000,t.z+800);}
      renderer.toneMappingExposure=Math.pow(2,S.ev);}
    else{/* de día: sol, cielo y relleno según la altura */
      const ks=smooth(-1,12,sol.alt),kh=.12+.88*smooth(-6,15,sol.alt);
      if(luzOn){for(const h of l.hemi){h.intensity=.2*kh;h.color.set(0xe4ebf0);h.groundColor.set(0x5f6b45);}for(const f of l.fill)f.visible=false;cDia.set(0xfff0d8);if(lz){lz.setDir(dirV);lz.envInt(.32*kh);}}
      else{for(const h of l.hemi){h.intensity=1.35*kh;h.color.set(0xe4ebf0);h.groundColor.set(0x5f6b45);}for(const f of l.fill){f.visible=true;f.intensity=.45*ks;}cDia.set(0xfff6e8);}
      if(l.sun){const s=l.sun;s.visible=sol.alt>-1;s.intensity=(luzOn?3.4:1.6)*ks;s.color.copy(cBajo).lerp(cDia,smooth(0,25,sol.alt));const t=s.target.position;s.position.copy(t).addScaledVector(dirV,6000);}
      renderer.toneMappingExposure=(luzOn?.95:1.05)*Math.pow(2,S.ev*smooth(15,-4,sol.alt));}
    /* pool: sólo si hay algo prendido */
    if(encendidas&&!pool)armarPool();if(!encendidas&&pool)quitarPool();dirty=true;
    visor.renderHook=noche?hookNoche:(pool||luzOn?hookDia:null);
    if(visor.equip)visor.equip.setNoche(noche?1:.35,id=>ids.has(id));
    pintarBarra();}
  visor._solUpd=()=>setTimeout(actualizar,0);

  /* ---------- barra: fecha, hora, ▶, lugar ---------- */
  const bar=document.querySelector('#modo-3d .bottombar');const box=document.createElement('span');box.style.cssText='display:inline-flex;align-items:center;gap:5px;white-space:nowrap';
  box.innerHTML=`<button class="btn mini" data-k="dn" title="Día / noche" style="min-width:26px">☾</button><input type="date" data-k="fecha" style="font-size:11px;padding:0 2px;width:112px"><input type="range" data-k="min" min="0" max="1439" step="5" style="width:110px"><b data-k="hora" style="min-width:36px"></b><button class="btn mini" data-k="play" title="Pasar el día">▶</button><button class="btn mini" data-k="lugar" title="Lugar, huso y norte">⚙</button><small data-k="info" style="color:var(--muted)"></small>`;
  if(bar){const lr=document.getElementById('luzReal');if(lr&&lr.parentElement&&lr.parentElement.parentElement===bar)lr.parentElement.after(box);else bar.prepend(box);}
  const q=k=>box.querySelector(`[data-k="${k}"]`);
  function pintarBarra(){q('fecha').value=S.fecha;q('min').value=S.min;q('hora').textContent=hhmm(S.min);const est=visor.arboles&&visor.arboles.calcEstacion&&visor.arboles.calcEstacion();q('info').textContent=`sol ${sol.alt.toFixed(0)}° · ↑${hhmm(horas.sr)} ↓${hhmm(horas.ss)}${est?` · ${est.nombre}`:''}${encendidas?` · ${encendidas} luces`:''}`;q('play').textContent=play?'❚❚':'▶';q('dn').textContent=noche?'☀':'☾';q('dn').title=noche?'Pasar a de día ('+hhmm(S.diaMin)+')':'Pasar a de noche ('+hhmm(S.nocheMin)+')';}
  let play=false,uT=0;
  const recordar=()=>{if(sol.alt<-4)S.nocheMin=S.min;else if(sol.alt>5)S.diaMin=S.min;};
  function diaNoche(){recordar();S.min=noche?S.diaMin:S.nocheMin;cambio();}
  const cambio=()=>{guardarS();actualizar();if(visor.equip&&visor.equip.open&&visor.equip.capa==='luz')visor.equip.panel();};
  q('fecha').addEventListener('change',e=>{if(e.target.value){S.fecha=e.target.value;cambio();}});
  q('min').addEventListener('input',e=>{S.min=+e.target.value;cancelAnimationFrame(uT);uT=requestAnimationFrame(()=>{actualizar();});});q('min').addEventListener('change',()=>{cambio();recordar();guardarS();});q('dn').addEventListener('click',()=>diaNoche());
  q('play').addEventListener('click',()=>{play=!play;pintarBarra();if(play)(function step(){if(!play)return;S.min=(S.min+.5)%1440;actualizar();requestAnimationFrame(step);})();else cambio();});
  /* lugar */
  const LUG={...(datos&&datos.lugar?{[datos.lugar]:[datos.lat,datos.lon,datos.tz??-3]}:{}),'Ing. Maschwitz':[-34.381,-58.741,-3],'Buenos Aires':[-34.603,-58.382,-3],'Bariloche':[-41.133,-71.31,-3],'Montevideo':[-34.901,-56.164,-3],'Madrid':[40.417,-3.704,2]};
  const pop=document.createElement('div');pop.hidden=true;pop.style.cssText='position:absolute;bottom:34px;left:8px;z-index:9;background:var(--panel);border:1px solid var(--rule);border-radius:4px;padding:8px 10px;font-size:12px;box-shadow:0 4px 14px rgba(0,0,0,.2);width:250px';
  (document.querySelector('#modo-3d .stage')||document.body).appendChild(pop);
  function pintarPop(){pop.innerHTML=`<div style="display:flex;margin-bottom:6px"><b style="flex:1">Lugar del asoleamiento</b><button class="btn mini" data-p="x">×</button></div>
    <label style="display:flex;gap:6px;margin-bottom:4px">Lugar <select data-p="lug" style="flex:1">${Object.keys(LUG).map(n=>`<option${n===S.lugar?' selected':''}>${n}</option>`).join('')}<option${LUG[S.lugar]?'':' selected'}>Otro</option></select></label>
    <label style="display:flex;gap:6px;margin-bottom:4px">Latitud <input data-p="lat" type="number" step=".001" value="${S.lat}" style="width:80px"> Long. <input data-p="lon" type="number" step=".001" value="${S.lon}" style="width:80px"></label>
    <label style="display:flex;gap:6px;margin-bottom:4px">Huso (h) <input data-p="tz" type="number" step="1" value="${S.tz}" style="width:50px"></label>
    <label style="display:flex;gap:6px;margin-bottom:4px" title="Cuántos grados está girado el eje x del modelo respecto del norte verdadero, en sentido horario">Desvío del norte <input data-p="norte" type="number" step="1" value="${S.norte}" style="width:56px">°</label>
    <div style="display:flex;gap:4px;margin-top:6px"><button class="btn mini" data-p="ahora">Ahora</button><button class="btn mini" data-p="21j">21 jun</button><button class="btn mini" data-p="21d">21 dic</button><button class="btn mini" data-p="eq">Equinoccio</button></div>`;}
  q('lugar').addEventListener('click',()=>{pop.hidden=!pop.hidden;if(!pop.hidden)pintarPop();});
  pop.addEventListener('change',e=>{const k=e.target.dataset.p;if(k==='lug'){const v=LUG[e.target.value];S.lugar=e.target.value;if(v){[S.lat,S.lon,S.tz]=v;}pintarPop();}else if(k){S[k]=+e.target.value;S.lugar='Otro';}cambio();});
  pop.addEventListener('click',e=>{const k=e.target.dataset.p;if(k==='x')pop.hidden=true;const y=S.fecha.slice(0,4);
    if(k==='ahora'){S.fecha=hoy();const d=new Date();S.min=d.getHours()*60+d.getMinutes();cambio();}if(k==='21j'){S.fecha=y+'-06-21';cambio();}if(k==='21d'){S.fecha=y+'-12-21';cambio();}if(k==='eq'){S.fecha=y+'-03-20';cambio();}});
  document.getElementById('luzReal')?.addEventListener('change',()=>setTimeout(actualizar,30));

  const api={pop,setFuentes(Ls){for(const f of Ls)f.on=enc(f.prog);fuentes=Ls;const n=new Set(Ls.filter(f=>f.on).map(f=>f.id)).size;if(!!n!==!!encendidas||n!==encendidas)actualizar();else dirty=true;},
    set(k,v){if(k==='exp')S.ev=v;else if(k==='luna')S.luna=v;else if(k==='bloom')S.bloom=v;else if(k==='som'){S.sombras=v;if(pool)armarPool();}else if(k==='max'){S.max=v;if(pool)armarPool();}guardarS();actualizar();},
    setMin(min){S.min=min;actualizar();},diaNoche:()=>diaNoche(),
    irA(min){S.min=((Math.round(min)%1440)+1440)%1440;cambio();},
    get fecha(){return S.fecha;},get lat(){return S.lat;},get lon(){return S.lon;},get noche(){return noche;},get on(){return noche;},get ev(){return S.ev;},get luna(){return S.luna;},get sombras(){return S.sombras;},get bloom(){return S.bloom;},get max(){return S.max;},get min(){return S.min;},get horas(){return horas;},get sol(){return sol;},
    prendida:prog=>enc(prog),get forzar(){return S.forzar||null;},setForzar(v){S.forzar=v||null;guardarS();actualizar();if(visor.equip&&visor.equip.open)visor.equip.panel();},progDef,hhmm,
    info:()=>`${hhmm(S.min)} · sol ${sol.alt.toFixed(0)}° · ${encendidas} prendidas${pool?` · ${usadas} en uso`:''}`};
  visor.noche=api;
  setTimeout(()=>{if(visor.equip)visor.equip.luces();actualizar();},600);
  return api;
}
