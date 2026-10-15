/* Cubo de vista (Maxi 15/10), como en los CAD pero chico: sigue la orientación de la cámara; tocar una cara, arista o esquina
   lleva la cámara a mirar desde ahí (sin mover el punto que mira). Caras: N/S en x (pileta / fondo), E/O en y de planta (jardín / patio), arriba/abajo. */
export function initViewCube(visor,opts={}){
  const T=visor.THREE,stage=document.querySelector('#modo-3d .stage');if(!stage)return null;
  const S=opts.size||66;const cv=document.createElement('canvas');cv.id='viewCube';cv.width=S*2;cv.height=S*2;
  cv.style.cssText=`position:absolute;right:10px;top:${opts.top||46}px;width:${S}px;height:${S}px;z-index:5;cursor:pointer;touch-action:none`;stage.appendChild(cv);
  const r=new T.WebGLRenderer({canvas:cv,alpha:true,antialias:true});r.setPixelRatio(1);r.setSize(S*2,S*2,false);
  const sc=new T.Scene(),cam=new T.OrthographicCamera(-1.7,1.7,1.7,-1.7,.1,20);
  const ink=getComputedStyle(document.documentElement).getPropertyValue('--ink').trim()||'#333';
  const L=opts.labels||{px:'N',nx:'S',pz:'E',nz:'O',py:'↑',ny:'↓'};
  const face=t=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#f4f2ee';x.fillRect(0,0,128,128);x.strokeStyle='#9a958c';x.lineWidth=6;x.strokeRect(3,3,122,122);
    x.fillStyle='#3b3e40';x.font='600 54px system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(t,64,68);const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;return new T.MeshBasicMaterial({map:tx});};
  /* orden de materiales de BoxGeometry: +x, −x, +y, −y, +z, −z */
  const cube=new T.Mesh(new T.BoxGeometry(1.6,1.6,1.6),[face(L.px),face(L.nx),face(L.py),face(L.ny),face(L.pz),face(L.nz)]);sc.add(cube);
  const hl=new T.Mesh(new T.BoxGeometry(.5,.5,.5),new T.MeshBasicMaterial({color:0xc0461f,transparent:true,opacity:.45,depthTest:false}));hl.visible=false;sc.add(hl);
  const q0=new T.Quaternion(),dir=new T.Vector3();let last='';
  function draw(force){visor.camera.getWorldDirection(dir);const k=dir.toArray().map(v=>v.toFixed(3)).join()+(hl.visible?hl.position.toArray().join():'');if(!force&&k===last)return;last=k;
    cam.position.copy(dir).multiplyScalar(-6);cam.up.copy(visor.camera.up);cam.lookAt(0,0,0);r.render(sc,cam);}
  (function loop(){requestAnimationFrame(loop);draw(false);})();
  const rc=new T.Raycaster(),m=new T.Vector2();
  const zona=e=>{const b=cv.getBoundingClientRect();m.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);rc.setFromCamera(m,cam);const h=rc.intersectObject(cube)[0];if(!h)return null;
    /* cara, arista o esquina según qué tan cerca del borde se tocó */const p=h.point;const v=new T.Vector3(...p.toArray().map(c=>Math.abs(c)>.48?Math.sign(c):0));return v.lengthSq()?v:null;};
  cv.addEventListener('pointermove',e=>{const v=zona(e);hl.visible=!!v;if(v){hl.position.copy(v).multiplyScalar(.6);hl.scale.set(v.x?.4:2.6,v.y?.4:2.6,v.z?.4:2.6);}draw(true);window.__act=performance.now();});
  cv.addEventListener('pointerleave',()=>{hl.visible=false;draw(true);});
  cv.addEventListener('click',e=>{const v=zona(e);if(!v)return;const t=visor.controls.target.clone(),d=visor.camera.position.distanceTo(t);
    const n=v.clone().normalize();if(Math.abs(n.y)>.999)n.x+=.001;/* desde arriba justo: un pelo de lado para que la órbita no se trabe */
    visor.fly(t.clone().addScaledVector(n.normalize(),d).toArray(),t.toArray());window.__despertar&&window.__despertar();});
  draw(true);return {el:cv,draw};
}
