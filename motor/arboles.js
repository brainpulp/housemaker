/* Vegetación con ez-tree (Dan Greenheck, MIT): ramas con corteza texturada, hojas con recorte alfa y vaivén con el viento.
   Es una biblioteca: las plantas las ubica la capa «Plantas» del equipamiento (se mueven, se agregan, se guardan).
   Pocas variantes por especie; cada planta reusa la geometría y el material de su variante.
   Calidad (visor.calidad.modo): alto = todo; medio = las hojas no tiran sombra y el viento va a la mitad;
   liviano = variante simplificada (menos ramas y hojas), sin sombras de follaje, viento lento;
   mínimo = cuerpos simples de color (copa y tronco), sin viento: casi gratis. */
import { Tree } from './eztree/tree.js';
export function initArboles(visor){
  const {THREE}=visor;
  const VAR={};const usados=new Set();
  const modo=()=>(visor.calidad&&visor.calidad.modo)||'alto';
  function variante(preset,seed,lod){const k=preset+'|'+seed+'|'+lod;if(VAR[k])return VAR[k];const t=new Tree();t.loadPreset(preset);t.options.seed=seed;
    if(lod==='baja'){const o=t.options;try{for(const s in o.branch.sections)o.branch.sections[s]=Math.max(3,Math.round(o.branch.sections[s]*.55));for(const s in o.branch.segments)o.branch.segments[s]=Math.max(3,Math.round(o.branch.segments[s]*.5));
      o.leaves.count=Math.max(2,Math.round(o.leaves.count*.45));o.leaves.size*=1.35;}catch(e){}}
    t.generate();const bb=new THREE.Box3().setFromObject(t);
    /* hojas en orden al azar (de a 6 índices), así la caída de otoño ralea parejo toda la copa */
    const lg=t.leavesMesh.geometry,I=lg.index;if(I){const arr=I.array,n6=Math.floor(arr.length/6);let sd=seed*9301+49297;const rnd=()=>{sd=(sd*1664525+1013904223)%4294967296;return sd/4294967296;};
      for(let i=n6-1;i>0;i--){const j=Math.floor(rnd()*(i+1));for(let k2=0;k2<6;k2++){const a1=i*6+k2,b1=j*6+k2,tmp=arr[a1];arr[a1]=arr[b1];arr[b1]=tmp;}}I.needsUpdate=true;}
    const caduco=!/^Bush/.test(preset);const uO={value:0},uC={value:new THREE.Color(1,.55,.12)};
    if(caduco){const mt=t.leavesMesh.material,orig=mt.onBeforeCompile;mt.onBeforeCompile=(sh,r)=>{if(orig)orig.call(mt,sh,r);sh.uniforms.uOto=uO;sh.uniforms.uOtoC=uC;
      sh.fragmentShader='uniform float uOto;uniform vec3 uOtoC;\n'+sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n{float l=dot(diffuseColor.rgb,vec3(.3,.59,.11));diffuseColor.rgb=mix(diffuseColor.rgb,uOtoC*(.35+l*1.6),uOto);}');};mt.needsUpdate=true;}
    return VAR[k]={uO,uC,t,h:bb.max.y-bb.min.y,y0:bb.min.y,r:Math.max(bb.max.x-bb.min.x,bb.max.z-bb.min.z)/2,caduco,n:I?I.count:0,tint:t.leavesMesh.material.color.clone()};}
  /* estaciones (Maxi 14/10): los árboles (robles, fresnos, álamos) son de hoja caduca; los arbustos no. Sigue la fecha del asoleamiento.
     Hemisferio sur: brotan en septiembre, copa llena de mediados de noviembre a mediados de marzo, amarillo y naranja en abril, peladas de junio a agosto. */
  const C=(r,g,b)=>new THREE.Color(r,g,b);const CV=C(1.25,1.3,.75),CS=C(1,1,1),CO=C(1.7,1.05,.32),CM=C(1.15,.62,.3);
  function estacion(){const nz=visor.noche;if(!nz||!nz.fecha)return {d:1,c:CS,nombre:'verano'};const [Y,M,D]=nz.fecha.split('-').map(Number);let doy=(Date.UTC(Y,M-1,D)-Date.UTC(Y,0,1))/864e5;if((nz.lat||-37)>0)doy=(doy+182)%365;
    const P=[[0,1,CS,0],[74,1,CS,0],[105,1,CO,.85],[130,.45,CM,.95],[151,0,CM,1],[243,0,CV,0],[274,.55,CV,0],[305,.9,CV,0],[319,1,CS,0],[365,1,CS,0]];/* [día del año, densidad, tinte, cuánto otoño] */
    let i=0;while(i<P.length-2&&doy>P[i+1][0])i++;const [d0,a0,c0,o0]=P[i],[d1,a1,c1,o1]=P[i+1],u=Math.min(1,Math.max(0,(doy-d0)/(d1-d0||1)));
    const nombre=doy<79?'verano':doy<171?'otoño':doy<265?'invierno':doy<355?'primavera':'verano';return {d:a0+(a1-a0)*u,c:c0.clone().lerp(c1,u),o:o0+(o1-o0)*u,nombre};}
  let estAct=null,estKey='';
  function aplicarEstacion(){const e=estacion();estAct=e;for(const k in VAR){const v=VAR[k];if(!v.caduco)continue;const m=v.t.leavesMesh;m.material.color.copy(v.tint).multiply(e.o>0?CS:e.c);v.uO.value=e.o||0;v.uC.value.set(e.o>.9?0xb5651d:0xe8892a);if(v.n)m.geometry.setDrawRange(0,Math.floor(v.n*e.d/6)*6);m.visible=e.d>.01;}
    IM.copaC.copy(IM.copa0).multiply(e.c);for(const mt of [IM.copa,IM.copa2])mt.color.copy(mt.userData.c0).lerp(new THREE.Color(0xc0782a),e.o||0);IM.dens=e.d;}
  /* mínimo: copa y tronco de colores, compartidos */
  const IM={copa:new THREE.MeshLambertMaterial({color:0x5d7a45,flatShading:true}),copa2:new THREE.MeshLambertMaterial({color:0x4f6b3c,flatShading:true}),tronco:new THREE.MeshLambertMaterial({color:0x5a4634})};
  IM.copa.userData.c0=IM.copa.color.clone();IM.copa2.userData.c0=IM.copa2.color.clone();IM.copa0=new THREE.Color(0x5d7a45);IM.copaC=new THREE.Color();IM.dens=1;
  const GEO={ico:new THREE.IcosahedronGeometry(1,1),cil:new THREE.CylinderGeometry(.6,1,1,6)};
  function planta(preset,seed,alto){const q=modo(),g=new THREE.Group();const arbol=!/^Bush/.test(preset);
    if(q==='minimo'){const m=(geo,mat,s,y)=>{const o=new THREE.Mesh(geo,mat);o.scale.set(...s);o.position.y=y;o.castShadow=false;o.receiveShadow=false;g.add(o);};
      if(arbol){m(GEO.cil,IM.tronco,[alto*.018,alto*.5,alto*.018],alto*.25);const cp=new THREE.Mesh(GEO.ico,seed%2?IM.copa:IM.copa2);cp.scale.set(alto*.3,alto*.26,alto*.3);cp.position.y=alto*.66;cp.userData.copa=1;cp.visible=IM.dens>.05;g.add(cp);g.userData.copa=cp;copas.add(cp);}
      else m(GEO.ico,seed%2?IM.copa:IM.copa2,[alto*.55,alto*.5,alto*.55],alto*.45);return g;}
    const v=variante(preset,seed,q==='liviano'?'baja':'alta');usados.add(v);const k=alto/v.h;
    for(const [m,hoja] of [[v.t.branchesMesh,false],[v.t.leavesMesh,true]]){const c=new THREE.Mesh(m.geometry,m.material);c.castShadow=q==='alto'||(q==='medio'&&!hoja);c.receiveShadow=q!=='liviano';c.scale.setScalar(k);c.position.y=-v.y0*k;g.add(c);}
    return g;}
  const copas=new Set();let n=0;const t0=performance.now();let tEst=0;
  (function loop(now){requestAnimationFrame(loop);if(now-tEst>700){tEst=now;const nz=visor.noche;const k=nz?nz.fecha+'|'+nz.lat+'|'+Object.keys(VAR).length:'';if(k!==estKey){estKey=k;aplicarEstacion();for(const c of copas){if(!c.parent){copas.delete(c);continue;}const s=Math.max(.05,IM.dens);c.visible=IM.dens>.05;}}}const q=modo();n++;const cada=q==='alto'?1:q==='medio'?2:q==='liviano'?6:0;if(!cada||n%cada)return;const s=(now-t0)/1000;for(const v of usados)v.t.update(s);})(performance.now());
  const api={planta,VAR,limpiar(){usados.clear();},get estacion(){return estAct||estacion();},calcEstacion:()=>estacion(),refrescar(){estKey='';}};visor.arboles=api;if(visor.equip)setTimeout(()=>visor.equip.rearmar(),0);return api;
}
