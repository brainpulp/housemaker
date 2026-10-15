/* ◎ Señalar: tocá cualquier pieza y te da el código del punto, arista o cara más cercana
   (M-04.p3, M-04.a7, M-04.c2). Quedan en una lista que se copia de un toque para pegarla en el chat.
   Los puntos y aristas usan la misma numeración que el editor. */
export function initSenalar(visor,stage){
  const {THREE}=visor;const view=stage.querySelector('#view');
  const base=id=>id?id.replace(/[a-z]$/,''):id;
  const bt=document.createElement('button');bt.className='btn';bt.id='senalarTg';bt.textContent='◎ Señalar';bt.title='Tocá un punto, una arista o una cara y te doy su código';
  document.getElementById('topright').prepend(bt);
  const P=document.createElement('div');P.id='senPanel';P.hidden=true;stage.appendChild(P);
  P.innerHTML=`<div class="mh"><b>Señalar puntos, aristas y caras</b><span class="mx" title="Cerrar">×</span></div>
   <p class="s">Tocá cerca de un vértice (punto), de un borde (arista) o en medio de una superficie (cara). Se agrega abajo; «Copiar» y lo pegás en el chat.</p>
   <div id="senCur" class="edref"></div>
   <div class="mrow"><button class="btn mini" id="senCopy">Copiar lista</button><button class="btn mini" id="senClear">Vaciar</button><span id="senMsg" class="s"></span></div>
   <div id="senList"></div>`;
  const q=id=>P.querySelector('#'+id);
  let L=[];try{L=JSON.parse(localStorage.getItem('carhue-senales')||'[]');}catch(e){}
  const save=()=>{try{localStorage.setItem('carhue-senales',JSON.stringify(L));}catch(e){}};
  const lineTxt=s=>`${s.code} — ${s.txt}`;
  const draw=()=>{q('senList').innerHTML=L.length?L.map((s,i)=>`<div class="mitem"><b>${s.code}</b><span class="s">${s.txt}</span><button class="btn mini" data-sx="${i}" title="Quitar">×</button></div>`).join(''):'<p class="s">Todavía nada.</p>';};
  draw();
  const on=v=>{P.hidden=!v;bt.setAttribute('aria-pressed',v?'true':'false');if(!v)clearMk();
    if(v){for(const id of ['edPanel','marcasPanel']){const x=document.getElementById(id);if(x&&!x.hidden){const c=x.querySelector('.mx');if(c)c.click();}}}};
  bt.onclick=()=>on(P.hidden);P.querySelector('.mx').onclick=()=>on(false);
  q('senClear').onclick=()=>{L=[];save();draw();};
  q('senList').onclick=e=>{const b=e.target.closest('[data-sx]');if(!b)return;L.splice(+b.dataset.sx,1);save();draw();};
  q('senCopy').onclick=async()=>{const t=L.map(lineTxt).join('\n');let ok=false;try{await navigator.clipboard.writeText(t);ok=true;}catch(e){}
    if(!ok){const ta=document.createElement('textarea');ta.value=t;P.appendChild(ta);ta.select();try{ok=document.execCommand('copy');}catch(e){}ta.remove();}
    q('senMsg').textContent=ok?'Copiado.':'No pude copiar: seleccioná el texto de la lista.';setTimeout(()=>q('senMsg').textContent='',2500);};

  /* marcadores */
  const ov=new THREE.MeshBasicMaterial({color:0xff7a00,transparent:true,opacity:.45,side:THREE.DoubleSide,depthTest:false});
  const mkP=new THREE.Mesh(new THREE.SphereGeometry(4,12,8),new THREE.MeshBasicMaterial({color:0xff7a00,depthTest:false}));
  const mkA=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0xff7a00,depthTest:false}));
  const mkC=new THREE.Mesh(new THREE.BufferGeometry(),ov);
  for(const o of [mkP,mkA,mkC]){o.renderOrder=2003;o.visible=false;visor.scene.add(o);}
  function clearMk(){mkP.visible=mkA.visible=mkC.visible=false;}

  /* topología de la pieza (misma numeración que el editor) */
  const R1=v=>Math.round(v*10)/10;
  function topo(id){const ps=visor.parts.filter(p=>base(p.id)===id);const V=new Map(),E=new Map(),F=new Map();const key=v=>`${R1(v.x)},${R1(v.y)},${R1(v.z)}`;
    const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),n=new THREE.Vector3();
    for(const p of ps)p.grp.traverse(o=>{if(!o.geometry)return;const A=o.geometry.attributes.position;if(!A)return;o.updateMatrixWorld();const w=new THREE.Vector3();
      if(o.isMesh){for(let i=0;i<A.count;i++){w.fromBufferAttribute(A,i).applyMatrix4(o.matrixWorld);V.set(key(w),w.clone());}
        const I=o.geometry.index;const nt=I?I.count/3:A.count/3;const vi=k=>I?I.getX(k):k;
        for(let t=0;t<nt;t++){a.fromBufferAttribute(A,vi(3*t)).applyMatrix4(o.matrixWorld);b.fromBufferAttribute(A,vi(3*t+1)).applyMatrix4(o.matrixWorld);c.fromBufferAttribute(A,vi(3*t+2)).applyMatrix4(o.matrixWorld);
          n.subVectors(c,b).cross(new THREE.Vector3().subVectors(a,b));if(n.lengthSq()<1e-6)continue;n.normalize();
          const nk=[n.x,n.y,n.z].map(x=>Math.round(x*100)/100),d=Math.round(n.dot(a)*2)/2;const k=nk.join(',')+'|'+d;
          if(!F.has(k))F.set(k,{n:new THREE.Vector3(...nk),d,tris:[]});F.get(k).tris.push(a.x,a.y,a.z,b.x,b.y,b.z,c.x,c.y,c.z);}}
      if(o.isLineSegments)for(let i=0;i<A.count;i+=2){const p1=new THREE.Vector3().fromBufferAttribute(A,i).applyMatrix4(o.matrixWorld),p2=new THREE.Vector3().fromBufferAttribute(A,i+1).applyMatrix4(o.matrixWorld);E.set([key(p1),key(p2)].sort().join('|'),[p1,p2]);}});
    const srt=(p,q)=>p.x-q.x||p.z-q.z||p.y-q.y;const pts=[...V.values()].sort(srt);const pidx=v=>pts.findIndex(q=>q.distanceTo(v)<.2)+1;
    const eds=[...E.values()].sort((m,k)=>srt(m[0].clone().add(m[1]),k[0].clone().add(k[1])));
    const caras=[...F.values()].sort((m,k)=>(k.n.y-m.n.y)||(m.n.x-k.n.x)||(m.n.z-k.n.z)||(m.d-k.d));
    return {pts,eds,pidx,caras};}

  const f2=v=>(v/100).toFixed(2).replace('.',',');const crd=v=>`x ${f2(v.x)} · y ${f2(v.z)} · alto ${f2(v.y)} m`;
  const orient=n=>{const ax=Math.abs(n.x),ay=Math.abs(n.y),az=Math.abs(n.z);if(ay>.9)return n.y>0?'mira arriba':'mira abajo';
    if(ay<.1){if(ax>az)return n.x>0?'mira a la pileta (norte, +x)':'mira al fondo (sur, −x)';return n.z>0?'mira al jardín (este, +y)':'mira al patio (oeste, −y)';}return n.y>0?'inclinada, hacia arriba':'inclinada, hacia abajo';};
  const ray=new THREE.Raycaster(),mv=new THREE.Vector2();
  const hit=e=>{const r=visor.renderer.domElement.getBoundingClientRect();mv.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mv,visor.camera);
    const ms=[];for(const p of visor.parts)if(p.grp.visible!==false)p.grp.traverse(o=>{if(o.isMesh&&o.visible!==false&&o.material&&o.material.visible!==false&&(o.material.opacity??1)>.1)ms.push(o);});
    const cps=visor.renderer.clippingPlanes||[];return ray.intersectObjects(ms,false).find(h=>!cps.length||cps.every(pl=>pl.distanceToPoint(h.point)>=0));};

  let down=null;
  view.addEventListener('pointerdown',e=>{if(P.hidden||e.button!==0)return;down=[e.clientX,e.clientY];},true);
  view.addEventListener('pointerup',e=>{if(P.hidden||e.button!==0||!down)return;const moved=Math.hypot(e.clientX-down[0],e.clientY-down[1]);down=null;if(moved>5)return;
    const h=hit(e);if(!h){clearMk();q('senCur').innerHTML='<span class="s">No toqué ninguna pieza.</span>';return;}
    const id=base(h.object.userData.id);if(!id)return;const T=topo(id);const r=visor.renderer.domElement.getBoundingClientRect();
    const sp=v=>{const p=v.clone().project(visor.camera);return [(p.x+1)/2*r.width+r.left,(1-p.y)/2*r.height+r.top];};
    let best=null,bd=12;T.pts.forEach((v,i)=>{const s=sp(v);const d=Math.hypot(s[0]-e.clientX,s[1]-e.clientY);if(d<bd){bd=d;best={k:'p',i,v};}});
    if(!best){let bde=7;T.eds.forEach((ed,i)=>{const a=sp(ed[0]),b=sp(ed[1]);const dx=b[0]-a[0],dy=b[1]-a[1],l2=dx*dx+dy*dy||1;let t=((e.clientX-a[0])*dx+(e.clientY-a[1])*dy)/l2;t=Math.max(0,Math.min(1,t));const d=Math.hypot(a[0]+t*dx-e.clientX,a[1]+t*dy-e.clientY);if(d<bde){bde=d;best={k:'a',i,ed};}});}
    if(!best&&h.face){const n=h.face.normal.clone().transformDirection(h.object.matrixWorld).normalize();const d=n.dot(h.point);
      let bi=-1,bs=1e9;T.caras.forEach((c,i)=>{const s=(1-c.n.dot(n))*1000+Math.abs(c.d-d);if(s<bs){bs=s;bi=i;}});if(bi>=0)best={k:'c',i:bi,c:T.caras[bi]};}
    if(!best)return;clearMk();let code,txt;
    if(best.k==='p'){mkP.position.copy(best.v);mkP.visible=true;code=`${id}.p${best.i+1}`;txt=`punto · ${crd(best.v)}`;}
    else if(best.k==='a'){const [a,b]=best.ed;mkA.geometry.setFromPoints([a,b]);mkA.visible=true;code=`${id}.a${best.i+1}`;txt=`arista de ${id}.p${T.pidx(a)} a ${id}.p${T.pidx(b)} · largo ${f2(a.distanceTo(b))} m`;}
    else{const c=best.c;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(c.tris,3));mkC.geometry.dispose();mkC.geometry=g;mkC.visible=true;
      let area=0;const A=new THREE.Vector3(),B=new THREE.Vector3(),C=new THREE.Vector3();for(let i=0;i<c.tris.length;i+=9){A.fromArray(c.tris,i);B.fromArray(c.tris,i+3);C.fromArray(c.tris,i+6);area+=B.clone().sub(A).cross(C.clone().sub(A)).length()/2;}
      code=`${id}.c${best.i+1}`;txt=`cara · ${orient(c.n)} · ${(area/1e4).toFixed(2).replace('.',',')} m² · tocada en ${crd(h.point)}`;}
    q('senCur').innerHTML=`<b>${code}</b> <span class="s">${txt}</span>`;
    if(!L.some(s=>s.code===code)){L.push({code,txt});save();draw();}},true);
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!P.hidden)on(false);});
}
