/* 📏 Medir: tocá dos puntos en el 3D (se pegan a los vértices cercanos) y te da la distancia real,
   y por separado lo que avanza en x, en y (planta) y en altura. Cada medida queda dibujada con su cota
   y en una lista para copiar. Esc o tocar otra herramienta la cierra. */
export function initMedir(visor,stage){
  const {THREE}=visor;const view=stage.querySelector('#view');
  const bt=document.createElement('button');bt.className='btn';bt.id='medirTg';bt.textContent='📏 Medir';bt.title='Medir entre dos puntos';
  document.getElementById('topright').prepend(bt);
  const P=document.createElement('div');P.id='medPanel';P.hidden=true;stage.appendChild(P);
  P.innerHTML=`<div class="mh"><b>Medir</b><span class="mx" title="Cerrar">×</span></div>
   <p class="s">Tocá el primer punto y después el segundo. Se pegan a los vértices de las piezas si estás cerca; si no, miden sobre la superficie que tocás. <label><input type="checkbox" id="medSnap" checked> pegar a vértices</label></p>
   <div id="medCur" class="edref"></div>
   <div class="mrow"><button class="btn mini" id="medCopy">Copiar</button><button class="btn mini" id="medClear">Borrar todas</button><span id="medMsg" class="s"></span></div>
   <div id="medList"></div>`;
  const q=id=>P.querySelector('#'+id);
  const f2=v=>(v/100).toFixed(2).replace('.',',');
  const grp=new THREE.Group();grp.renderOrder=2004;visor.scene.add(grp);
  const L=[];let A=null;
  const mkDot=p=>{const m=new THREE.Mesh(new THREE.SphereGeometry(3.5,12,8),new THREE.MeshBasicMaterial({color:0x1f5f8b,depthTest:false}));m.position.copy(p);m.renderOrder=2004;grp.add(m);return m;};
  const labels=[];
  function draw(){for(const c of [...grp.children])grp.remove(c);for(const l of labels)l.remove();labels.length=0;
    L.forEach((m,i)=>{mkDot(m.a);mkDot(m.b);const ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints([m.a,m.b]),new THREE.LineBasicMaterial({color:0x1f5f8b,depthTest:false}));ln.renderOrder=2004;grp.add(ln);
      const d=document.createElement('div');d.className='medlbl';d.textContent=`${i+1}: ${f2(m.a.distanceTo(m.b))} m`;stage.appendChild(d);labels.push(d);d._m=m;});
    if(A)mkDot(A);
    q('medList').innerHTML=L.length?L.map((m,i)=>`<div class="mitem"><b>${i+1}</b><span class="s">${txt(m)}</span><button class="btn mini" data-mx="${i}" title="Borrar">×</button></div>`).join(''):'<p class="s">Todavía nada.</p>';}
  const txt=m=>{const d=m.b.clone().sub(m.a);return `${f2(m.a.distanceTo(m.b))} m · en x ${f2(Math.abs(d.x))} · en y ${f2(Math.abs(d.z))} · en altura ${f2(Math.abs(d.y))}${m.ca?` · de ${m.ca} a ${m.cb}`:''}`;};
  (function loop(){requestAnimationFrame(loop);if(P.hidden&&!labels.length)return;const r=visor.renderer.domElement.getBoundingClientRect(),s=stage.getBoundingClientRect();
    for(const d of labels){const mid=d._m.a.clone().add(d._m.b).multiplyScalar(.5).project(visor.camera);const vis=mid.z<1&&!P.hidden;d.style.display=vis?'':'none';d.style.left=(r.left-s.left+(mid.x+1)/2*r.width)+'px';d.style.top=(r.top-s.top+(1-mid.y)/2*r.height)+'px';}})();
  const on=v=>{P.hidden=!v;bt.setAttribute('aria-pressed',v?'true':'false');A=null;draw();
    if(v){for(const id of ['edPanel','marcasPanel','senPanel']){const x=document.getElementById(id);if(x&&!x.hidden){const c=x.querySelector('.mx');if(c)c.click();}}}};
  bt.onclick=()=>on(P.hidden);P.querySelector('.mx').onclick=()=>on(false);
  q('medClear').onclick=()=>{L.length=0;A=null;draw();};
  q('medList').onclick=e=>{const b=e.target.closest('[data-mx]');if(!b)return;L.splice(+b.dataset.mx,1);draw();};
  q('medCopy').onclick=async()=>{const t=L.map((m,i)=>`${i+1}: ${txt(m)}`).join('\n');let ok=false;try{await navigator.clipboard.writeText(t);ok=true;}catch(e){}
    if(!ok){const ta=document.createElement('textarea');ta.value=t;P.appendChild(ta);ta.select();try{ok=document.execCommand('copy');}catch(e){}ta.remove();}
    q('medMsg').textContent=ok?'Copiado.':'No pude copiar.';setTimeout(()=>q('medMsg').textContent='',2500);};
  const ray=new THREE.Raycaster(),mv=new THREE.Vector2();
  function pick(e){const r=visor.renderer.domElement.getBoundingClientRect();mv.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mv,visor.camera);
    const ms=[];for(const p of visor.parts)if(p.grp.visible!==false)p.grp.traverse(o=>{if(o.isMesh&&o.visible!==false&&o.material)ms.push(o);});
    const cps=visor.renderer.clippingPlanes||[];const h=ray.intersectObjects(ms,false).find(h=>!cps.length||cps.every(pl=>pl.distanceToPoint(h.point)>=0));if(!h)return null;
    let pt=h.point.clone(),code=h.object.userData.id;
    if(q('medSnap').checked&&h.face){/* vértice más cercano del triángulo tocado, si está a menos de 14 px en pantalla */const G=h.object.geometry,Pa=G.attributes.position,ix=G.index;const ids=[h.face.a,h.face.b,h.face.c];let best=null,bd=14;
      for(const i of ids){const w=new THREE.Vector3().fromBufferAttribute(Pa,i).applyMatrix4(h.object.matrixWorld);const s=w.clone().project(visor.camera);const d=Math.hypot((s.x+1)/2*r.width+r.left-e.clientX,(1-s.y)/2*r.height+r.top-e.clientY);if(d<bd){bd=d;best=w;}}
      if(best)pt=best;}
    return {pt,code};}
  let down=null;
  view.addEventListener('pointerdown',e=>{if(P.hidden||e.button!==0)return;down=[e.clientX,e.clientY];},true);
  view.addEventListener('pointerup',e=>{if(P.hidden||e.button!==0||!down)return;const mvd=Math.hypot(e.clientX-down[0],e.clientY-down[1]);down=null;if(mvd>5)return;
    const k=pick(e);if(!k)return;
    if(!A){A=k.pt;A._c=k.code;q('medCur').innerHTML=`<span class="s">Primer punto en ${k.code}: x ${f2(A.x)} · y ${f2(A.z)} · alto ${f2(A.y)}. Tocá el segundo.</span>`;draw();}
    else{const m={a:A,b:k.pt,ca:A._c,cb:k.code};L.push(m);A=null;q('medCur').innerHTML=`<b>${L.length}: ${f2(m.a.distanceTo(m.b))} m</b> <span class="s">${txt(m)}</span>`;draw();}},true);
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!P.hidden){if(A){A=null;draw();}else on(false);}});
}
