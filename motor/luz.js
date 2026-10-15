/* ☀ Luz realista (switch abajo a la izquierda): cielo físico (Sky), iluminación por imagen del cielo
   (environment / IBL), sol con sombras más finas y oclusión ambiental (GTAO) en post.
   Apagado vuelve a la luz liviana de siempre. Queda recordado en este navegador. */
import { Sky } from 'three/addons/objects/Sky.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export function initLuz(visor){
  const {THREE,scene,renderer,camera}=visor;
  const bar=document.querySelector('#modo-3d .bottombar');
  const lb=document.createElement('label');lb.title='Cielo físico, luz del cielo, sombras finas y oclusión ambiental. Pide más a la placa de video.';
  lb.innerHTML='<input type="checkbox" id="luzReal"> Luz realista';if(bar)bar.prepend(lb);const ck=lb.querySelector('input');

  /* sol: misma dirección que la luz de siempre (≈45° de altura, desde el noroeste: norte = pileta, oeste = patio; en Argentina el sol va por el norte) */
  const SUN_DIR=new THREE.Vector3(1800,3200,-2600).normalize();
  const TGT=new THREE.Vector3(2150,0,100);
  const mkSky=()=>{const s=new Sky();s.scale.setScalar(30000);const u=s.material.uniforms;u.turbidity.value=4;u.rayleigh.value=1.1;u.mieCoefficient.value=.004;u.mieDirectionalG.value=.8;u.sunPosition.value.copy(SUN_DIR);s.userData.noPick=true;return s;};
  const sky=mkSky();sky.frustumCulled=false;
  let env=null;
  function buildEnv(){if(env)return env;const pm=new THREE.PMREMGenerator(renderer);const sc=new THREE.Scene();sc.add(mkSky());env=pm.fromScene(sc,0,10,60000).texture;pm.dispose();return env;}

  /* post: render con MSAA → GTAO → salida (tone mapping y sRGB) */
  let comp=null,gtao=null;const sz=new THREE.Vector2();
  function patchLogDepth(m){/* el visor usa logarithmicDepthBuffer: paso esa profundidad a la perspectiva que espera GTAO */
    m.fragmentShader=m.fragmentShader.replace('#include <packing>','#include <packing>\nuniform float lzNear;uniform float lzFar;\nfloat L2P(float d){float w=exp2(d*log2(lzFar+1.0))-1.0;return viewZToPerspectiveDepth(-w,lzNear,lzFar);}')
      .replace(/(textureLod|texelFetch)\(tDepth, uv\.xy, 0(\.0)?\)\.(DEPTH_SWIZZLING|a|r)/g,'L2P($&)');
    m.uniforms.lzNear={value:camera.near};m.uniforms.lzFar={value:camera.far};m.needsUpdate=true;}
  function buildComp(){renderer.getSize(sz);const pr=renderer.getPixelRatio();
    const rt=new THREE.WebGLRenderTarget(sz.x*pr,sz.y*pr,{type:THREE.HalfFloatType,samples:4});
    comp=new EffectComposer(renderer,rt);comp.setPixelRatio(pr);comp.setSize(sz.x,sz.y);
    comp.addPass(new RenderPass(scene,camera));
    gtao=new GTAOPass(scene,camera,sz.x*pr,sz.y*pr);
    gtao.updateGtaoMaterial({radius:80,distanceExponent:1.5,thickness:30,scale:1.6,samples:16,distanceFallOff:1,screenSpaceRadius:false});
    gtao.updatePdMaterial({lumaPhi:10,depthPhi:2,normalPhi:3,radius:6,rings:2,samples:16});
    gtao.blendIntensity=.9;patchLogDepth(gtao.gtaoMaterial);patchLogDepth(gtao.pdMaterial);
    /* vidrios, cielo y ayudas no tapan la oclusión */
    const ov=gtao.overrideVisibility.bind(gtao);gtao.overrideVisibility=function(){ov();this.scene.traverse(o=>{if(o===sky){o.visible=false;return;}if(!o.isMesh)return;const m=Array.isArray(o.material)?o.material[0]:o.material;if(m&&(m.transparent&&m.opacity<.6||m.depthTest===false))o.visible=false;});};
    comp.addPass(gtao);comp.addPass(new OutputPass());visor._gtao=gtao;gtao.enabled=!visor.calidad||['alto','medio'].includes(visor.calidad.modo);}

  let lights=null,on=false;
  function grabLights(){const L={hemi:[],dir:[]};scene.traverse(o=>{if(o.isHemisphereLight)L.hemi.push([o,o.intensity]);if(o.isDirectionalLight)L.dir.push([o,o.intensity,o.color.getHex(),o.position.clone(),o.visible]);});return L;}
  const sunOf=L=>{let b=null;for(const d of L.dir)if(d[0].castShadow)b=d;return b;};
  function setShadow(s,size,half){s.shadow.mapSize.set(size,size);const c=s.shadow.camera;c.left=-half;c.right=half;c.top=half;c.bottom=-half;c.updateProjectionMatrix();if(s.shadow.map){s.shadow.map.dispose();s.shadow.map=null;}}
  let oldBg=null;const ENV_I=.32;
  function envInt(k){scene.traverse(o=>{if(!o.isMesh)return;for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m&&'envMapIntensity' in m)m.envMapIntensity=k;});}
  function apply(v){on=v;try{localStorage.setItem('carhue-luz',v?'1':'0');}catch(e){}
    if(!lights)lights=grabLights();const sun=sunOf(lights);
    if(v){if(!comp)buildComp();scene.add(sky);scene.environment=buildEnv();
      for(const [h] of lights.hemi)h.intensity=.2;
      for(const d of lights.dir){if(d===sun)continue;d[0].visible=false;}
      if(sun){const s=sun[0];s.intensity=3.4;s.color.set(0xfff0d8);s.position.copy(TGT).addScaledVector(SUN_DIR,6000);s.target.position.copy(TGT);s.target.updateMatrixWorld();setShadow(s,4096,3000);s.shadow.camera.far=12000;s.shadow.camera.updateProjectionMatrix();s.shadow.normalBias=1.2;s.shadow.bias=-0.0002;}
      renderer.toneMappingExposure=.95;
      let lastParts=null;
      visor.renderHook=()=>{if(visor.parts!==lastParts){lastParts=visor.parts;envInt(ENV_I);}if(scene.background&&scene.background!==null){oldBg=scene.background;scene.background=null;}
        renderer.getSize(sz);const w=sz.x*renderer.getPixelRatio(),h=sz.y*renderer.getPixelRatio();if(comp.renderTarget1.width!==w||comp.renderTarget1.height!==h){comp.setPixelRatio(renderer.getPixelRatio());comp.setSize(sz.x,sz.y);}
        comp.render();};visor._luzHook=visor.renderHook;if(visor._solUpd)visor._solUpd();}
    else{visor.renderHook=null;scene.remove(sky);scene.environment=null;if(oldBg)scene.background=oldBg;
      for(const [h,i] of lights.hemi)h.intensity=i;
      for(const d of lights.dir){const [o,i,c,p,vis]=d;o.intensity=i;o.color.setHex(c);o.position.copy(p);o.visible=vis;}
      if(sun){setShadow(sun[0],2048,2600);sun[0].shadow.normalBias=2;sun[0].shadow.bias=-0.0004;sun[0].target.position.set(1500,0,300);sun[0].target.updateMatrixWorld();}
      renderer.toneMappingExposure=1.05;if(visor._solUpd)visor._solUpd();}
    ck.checked=v;}
  ck.addEventListener('change',()=>apply(ck.checked));
  let saved=false;try{saved=localStorage.getItem('carhue-luz')==='1';}catch(e){}
  /* esperar a que realismo haya puesto sus luces */
  setTimeout(()=>{if(saved)apply(true);},300);
  visor.luzReal=apply;
  /* asoleamiento (noche.js): mueve el sol del cielo físico y rehace la luz del cielo, con freno */
  let envT=null;
  visor.luzSol={sky,TGT,get on(){return on;},hook:()=>on?visor._luzHook:null,envInt,
    setDir(d){if(SUN_DIR.distanceToSquared(d)<1e-8)return;SUN_DIR.copy(d);sky.material.uniforms.sunPosition.value.copy(d);clearTimeout(envT);envT=setTimeout(()=>{if(env){env.dispose();env=null;}if(on&&scene.environment)scene.environment=buildEnv();},250);}};
}
