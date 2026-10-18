/* ◎ Seleccionar vértices, aristas y caras, como en un CAD (Maxi 18/10; antes «Señalar»).
   Filtro: Auto (lo más cercano: vértice, si no arista, si no cara), Vértice, Arista o Cara. Al pasar el mouse se ilumina lo que tomaría;
   el toque lo elige y Shift + toque lo suma a la selección. Con uno elegido da sus datos (coordenadas, largo, área y orientación);
   con dos, lo que los relaciona (distancia, ángulo, separación entre caras paralelas). Los códigos (M-04.p3, M-04.a7, M-04.c2)
   usan la misma numeración que el editor y quedan en una lista que se copia de un toque para pegarla en el chat. */
export function initSenalar(visor,stage){
  const {THREE}=visor;const view=stage.querySelector('#view');const V3=THREE.Vector3;
  const base=id=>id?id.replace(/[a-z]$/,''):id;
  const bt=document.createElement('button');bt.className='btn';bt.id='senalarTg';bt.textContent='◎ Vértices, aristas, caras';bt.title='Elegí vértices, aristas o caras como en un CAD';
  document.getElementById('topright').prepend(bt);
  const P=document.createElement('div');P.id='senPanel';P.hidden=true;stage.appendChild(P);
  let modo='auto';try{modo=localStorage.getItem('carhue-sel-modo')||'auto';}catch(e){}
  /* filtro de selección siempre a la vista, como en un CAD (Maxi 18/10: «sólo puedo seleccionar objetos»): Objeto es la selección de siempre */
  const FB=document.createElement('div');FB.id='selFiltro';FB.setAttribute('role','radiogroup');FB.setAttribute('aria-label','Qué se selecciona');
  FB.innerHTML=[['obj','Objeto'],['p','Vértice'],['a','Arista'],['c','Cara']].map(([k,t])=>`<button type="button" data-f="${k}">${t}</button>`).join('');stage.appendChild(FB);
  {const st=document.createElement('style');st.textContent=`#selFiltro{position:absolute;top:8px;left:50%;transform:translateX(-50%);z-index:7;display:flex;background:var(--panel,#fff);border:1px solid var(--rule,#ccc);border-radius:7px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}
#selFiltro button{border:0;background:none;padding:5px 11px;font:12px var(--f-mono,monospace);color:var(--muted,#777);cursor:pointer}#selFiltro button+button{border-left:1px solid var(--rule,#ccc)}
#selFiltro button[aria-checked=true]{background:var(--ink,#222);color:var(--panel,#fff)}#selFiltro button:focus-visible{outline:2px solid var(--accent,#c0461f);outline-offset:-2px}`;document.head.appendChild(st);}
  const pintarFiltro=()=>FB.querySelectorAll('[data-f]').forEach(b=>b.setAttribute('aria-checked',String(P.hidden?b.dataset.f==='obj':b.dataset.f===(modo==='auto'?'':modo))));
  FB.onclick=e=>{const b=e.target.closest('[data-f]');if(!b)return;if(b.dataset.f==='obj'){on(false);}else{modo=b.dataset.f;try{localStorage.setItem('carhue-sel-modo',modo);}catch(x){}pintarModo();if(P.hidden)on(true);}pintarFiltro();};
  P.innerHTML=`<div class="mh"><b>Vértices, aristas y caras</b><span class="mx" title="Cerrar">×</span></div>
   <div class="mrow" id="senModo">${[['auto','Auto'],['p','Vértice'],['a','Arista'],['c','Cara']].map(([k,t])=>`<button class="btn mini" data-m="${k}">${t}</button>`).join('')}</div>
   <p class="s">Pasá el mouse: se ilumina lo que tomaría. Tocá para elegir; <b>Shift</b> + toque suma a la selección (con dos elegidos te doy distancia o ángulo). Esc limpia.</p>
   <div id="senCur" class="edref"></div>
   <div class="mrow"><button class="btn mini" id="senCopy">Copiar lista</button><button class="btn mini" id="senClear">Vaciar</button><span id="senMsg" class="s"></span></div>
   <div id="senList"></div>`;
  const q=id=>P.querySelector('#'+id);
  const pintarModo=()=>{q('senModo').querySelectorAll('[data-m]').forEach(b=>{const on=b.dataset.m===modo;b.style.background=on?'var(--ink)':'';b.style.color=on?'var(--panel)':'';});if(typeof pintarFiltro==='function')pintarFiltro();};pintarModo();
  q('senModo').onclick=e=>{const b=e.target.closest('[data-m]');if(!b)return;modo=b.dataset.m;try{localStorage.setItem('carhue-sel-modo',modo);}catch(x){}pintarModo();};
  let L=[];try{L=JSON.parse(localStorage.getItem('carhue-senales')||'[]');}catch(e){}
  const save=()=>{try{localStorage.setItem('carhue-senales',JSON.stringify(L));}catch(e){}};
  const lineTxt=s=>`${s.code} — ${s.txt}`;
  const draw=()=>{q('senList').innerHTML=L.length?L.map((s,i)=>`<div class="mitem"><b>${s.code}</b><span class="s">${s.txt}</span><button class="btn mini" data-sx="${i}" title="Quitar">×</button></div>`).join(''):'<p class="s">Todavía nada.</p>';};
  draw();
  const on=v=>{P.hidden=!v;bt.setAttribute('aria-pressed',v?'true':'false');pintarFiltro();if(!v){limpiar();vaciar(hov);}
    if(v){for(const id of ['edPanel','marcasPanel','medPanel']){const x=document.getElementById(id);if(x&&!x.hidden){const c=x.querySelector('.mx');if(c)c.click();}}}};
  bt.onclick=()=>on(P.hidden);P.querySelector('.mx').onclick=()=>on(false);
  q('senClear').onclick=()=>{L=[];save();draw();limpiar();};
  q('senList').onclick=e=>{const b=e.target.closest('[data-sx]');if(!b)return;L.splice(+b.dataset.sx,1);save();draw();};
  q('senCopy').onclick=async()=>{const t=L.map(lineTxt).join('\n');let ok=false;try{await navigator.clipboard.writeText(t);ok=true;}catch(e){}
    if(!ok){const ta=document.createElement('textarea');ta.value=t;P.appendChild(ta);ta.select();try{ok=document.execCommand('copy');}catch(e){}ta.remove();}
    q('senMsg').textContent=ok?'Copiado.':'No pude copiar: seleccioná el texto de la lista.';setTimeout(()=>q('senMsg').textContent='',2500);};

  /* marcadores: la selección en naranja fuerte, el «pasar el mouse» en celeste */
  const G=new THREE.Group();G.renderOrder=2003;visor.scene.add(G);
  const hov=new THREE.Group();hov.renderOrder=2003;visor.scene.add(hov);
  function marcador(it,col,op){const g=new THREE.Group();
    if(it.k==='p'){const m=new THREE.Mesh(new THREE.SphereGeometry(4,12,8),new THREE.MeshBasicMaterial({color:col,depthTest:false}));m.position.copy(it.v);g.add(m);}
    else if(it.k==='a'){const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(it.ed),new THREE.LineBasicMaterial({color:col,depthTest:false}));g.add(l);
      for(const v of it.ed){const m=new THREE.Mesh(new THREE.SphereGeometry(2.2,8,6),new THREE.MeshBasicMaterial({color:col,depthTest:false}));m.position.copy(v);g.add(m);}}
    else{const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(it.c.tris,3));g.add(new THREE.Mesh(ge,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op,side:THREE.DoubleSide,depthTest:false})));}
    g.traverse(o=>{o.renderOrder=2003;});return g;}
  const vaciar=g=>{for(const c of [...g.children]){g.remove(c);c.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});}};
  let SEL=[];
  function limpiar(){SEL=[];vaciar(G);q('senCur').innerHTML='';}

  /* topología de la pieza (misma numeración que el editor), guardada mientras no cambie el modelo */
  const R1=v=>Math.round(v*10)/10;const TC=new Map();let tcParts=null;
  function topo(id){if(tcParts!==visor.parts){TC.clear();tcParts=visor.parts;}if(TC.has(id))return TC.get(id);
    const ps=visor.parts.filter(p=>base(p.id)===id);const Vm=new Map(),E=new Map(),F=new Map();const key=v=>`${R1(v.x)},${R1(v.y)},${R1(v.z)}`;
    const a=new V3(),b=new V3(),c=new V3(),n=new V3();
    for(const p of ps)p.grp.traverse(o=>{if(!o.geometry)return;const A=o.geometry.attributes.position;if(!A)return;o.updateMatrixWorld();const w=new V3();
      if(o.isMesh){for(let i=0;i<A.count;i++){w.fromBufferAttribute(A,i).applyMatrix4(o.matrixWorld);Vm.set(key(w),w.clone());}
        const I=o.geometry.index;const nt=I?I.count/3:A.count/3;const vi=k=>I?I.getX(k):k;
        for(let t=0;t<nt;t++){a.fromBufferAttribute(A,vi(3*t)).applyMatrix4(o.matrixWorld);b.fromBufferAttribute(A,vi(3*t+1)).applyMatrix4(o.matrixWorld);c.fromBufferAttribute(A,vi(3*t+2)).applyMatrix4(o.matrixWorld);
          n.subVectors(c,b).cross(new V3().subVectors(a,b));if(n.lengthSq()<1e-6)continue;n.normalize();
          const nk=[n.x,n.y,n.z].map(x=>Math.round(x*100)/100),d=Math.round(n.dot(a)*2)/2;const k=nk.join(',')+'|'+d;
          if(!F.has(k))F.set(k,{n:new V3(...nk).normalize(),d,tris:[]});F.get(k).tris.push(a.x,a.y,a.z,b.x,b.y,b.z,c.x,c.y,c.z);}}
      if(o.isMesh){/* aristas «de verdad» de la malla (donde cambia la cara más de 20°), para las piezas que no traen líneas */const eg=new THREE.EdgesGeometry(o.geometry,20),EA=eg.attributes.position;for(let i=0;i<EA.count;i+=2){const p1=new V3().fromBufferAttribute(EA,i).applyMatrix4(o.matrixWorld),p2=new V3().fromBufferAttribute(EA,i+1).applyMatrix4(o.matrixWorld);E.set([key(p1),key(p2)].sort().join('|'),[p1,p2]);}eg.dispose();}
      if(o.isLineSegments)for(let i=0;i<A.count;i+=2){const p1=new V3().fromBufferAttribute(A,i).applyMatrix4(o.matrixWorld),p2=new V3().fromBufferAttribute(A,i+1).applyMatrix4(o.matrixWorld);E.set([key(p1),key(p2)].sort().join('|'),[p1,p2]);}});
    const srt=(p,q)=>p.x-q.x||p.z-q.z||p.y-q.y;const pts=[...Vm.values()].sort(srt);const pidx=v=>pts.findIndex(q=>q.distanceTo(v)<.2)+1;
    const eds=[...E.values()].sort((m,k)=>srt(m[0].clone().add(m[1]),k[0].clone().add(k[1])));
    const caras=[...F.values()].sort((m,k)=>(k.n.y-m.n.y)||(m.n.x-k.n.x)||(m.n.z-k.n.z)||(m.d-k.d));
    const T={pts,eds,pidx,caras};TC.set(id,T);return T;}

  const f2=v=>(v/100).toFixed(2).replace('.',',');const crd=v=>`x ${f2(v.x)} · y ${f2(v.z)} · alto ${f2(v.y)} m`;
  const gr=r=>(r*180/Math.PI).toFixed(1).replace('.',',')+'°';
  const orient=n=>{const ax=Math.abs(n.x),ay=Math.abs(n.y),az=Math.abs(n.z);if(ay>.9)return n.y>0?'mira arriba':'mira abajo';
    if(ay<.1){if(ax>az)return n.x>0?'mira a la pileta (norte, +x)':'mira al fondo (sur, −x)';return n.z>0?'mira al jardín (este, +y)':'mira al patio (oeste, −y)';}return n.y>0?'inclinada, hacia arriba':'inclinada, hacia abajo';};
  const ray=new THREE.Raycaster(),mv=new THREE.Vector2();
  const hit=e=>{const r=visor.renderer.domElement.getBoundingClientRect();mv.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mv,visor.camera);
    const ms=[];for(const p of visor.parts)if(p.grp.visible!==false)p.grp.traverse(o=>{if(o.isMesh&&o.visible!==false&&o.material&&o.material.visible!==false&&(o.material.opacity??1)>.1)ms.push(o);});
    const cps=visor.renderer.clippingPlanes||[];return ray.intersectObjects(ms,false).find(h=>!cps.length||cps.every(pl=>pl.distanceToPoint(h.point)>=0));};

  /* qué toma el toque según el filtro */
  function elegir(e){const h=hit(e);if(!h)return null;const id=base(h.object.userData.id);if(!id)return null;const T=topo(id);const r=visor.renderer.domElement.getBoundingClientRect();
    const sp=v=>{const p=v.clone().project(visor.camera);return [(p.x+1)/2*r.width+r.left,(1-p.y)/2*r.height+r.top];};
    const vert=lim=>{let best=null,bd=lim;T.pts.forEach((v,i)=>{const s=sp(v);const d=Math.hypot(s[0]-e.clientX,s[1]-e.clientY);if(d<bd){bd=d;best={k:'p',i,v};}});return best;};
    const arista=lim=>{let best=null,bd=lim;T.eds.forEach((ed,i)=>{const a=sp(ed[0]),b=sp(ed[1]);const dx=b[0]-a[0],dy=b[1]-a[1],l2=dx*dx+dy*dy||1;let t=((e.clientX-a[0])*dx+(e.clientY-a[1])*dy)/l2;t=Math.max(0,Math.min(1,t));const d=Math.hypot(a[0]+t*dx-e.clientX,a[1]+t*dy-e.clientY);if(d<bd){bd=d;best={k:'a',i,ed};}});return best;};
    const cara=()=>{if(!h.face)return null;const n=h.face.normal.clone().transformDirection(h.object.matrixWorld).normalize();const d=n.dot(h.point);
      let bi=-1,bs=1e9;T.caras.forEach((c,i)=>{const s=(1-c.n.dot(n))*1000+Math.abs(c.d-d);if(s<bs){bs=s;bi=i;}});return bi>=0?{k:'c',i:bi,c:T.caras[bi]}:null;};
    const best=modo==='p'?vert(60):modo==='a'?arista(40):modo==='c'?cara():(vert(16)||arista(10)||cara());
    if(!best)return null;best.id=id;best.T=T;best.h=h.point.clone();return best;}
  const codigo=it=>`${it.id}.${it.k}${it.i+1}`;
  function datos(it){if(it.k==='p')return `vértice · ${crd(it.v)}`;
    if(it.k==='a'){const [a,b]=it.ed;const d=b.clone().sub(a);const inc=Math.atan2(Math.abs(d.y),Math.hypot(d.x,d.z));return `arista de ${it.id}.p${it.T.pidx(a)} a ${it.id}.p${it.T.pidx(b)} · largo ${f2(a.distanceTo(b))} m${inc>.01&&inc<1.56?` · pendiente ${gr(inc)}`:''}`;}
    let area=0;const A=new V3(),B=new V3(),C=new V3(),t=it.c.tris;for(let i=0;i<t.length;i+=9){A.fromArray(t,i);B.fromArray(t,i+3);C.fromArray(t,i+6);area+=B.clone().sub(A).cross(C.clone().sub(A)).length()/2;}
    return `cara · ${orient(it.c.n)} · ${(area/1e4).toFixed(2).replace('.',',')} m²`;}
  /* lo que relaciona a dos elementos */
  const dir=it=>it.k==='a'?it.ed[1].clone().sub(it.ed[0]).normalize():it.c.n.clone();
  const puntoDe=it=>it.k==='p'?it.v:it.k==='a'?it.ed[0].clone().add(it.ed[1]).multiplyScalar(.5):it.h;
  function relacion(a,b){
    if(a.k==='p'&&b.k==='p'){const d=b.v.clone().sub(a.v);return `distancia ${f2(d.length())} m · en x ${f2(Math.abs(d.x))} · en y ${f2(Math.abs(d.z))} · en altura ${f2(Math.abs(d.y))}`;}
    if(a.k==='c'&&b.k==='c'){const ang=Math.acos(Math.min(1,Math.abs(a.c.n.dot(b.c.n))));if(ang<.01)return `caras paralelas · separación ${f2(Math.abs(a.c.d-b.c.n.dot(a.c.n)*b.c.d))} m`;return `ángulo entre caras ${gr(ang)}`;}
    if(a.k==='a'&&b.k==='a'){const ang=Math.acos(Math.min(1,Math.abs(dir(a).dot(dir(b)))));if(ang>.01)return `ángulo entre aristas ${gr(ang)}`;
      const p=b.ed[0].clone().sub(a.ed[0]);const u=dir(a);return `aristas paralelas · separación ${f2(p.sub(u.multiplyScalar(p.dot(u))).length())} m`;}
    const [c,o]=a.k==='c'?[a,b]:b.k==='c'?[b,a]:[null,null];
    if(c&&o.k==='p')return `el vértice está a ${f2(Math.abs(c.c.n.dot(o.v)-c.c.d))} m del plano de la cara`;
    if(c&&o.k==='a'){const s=Math.abs(c.c.n.dot(dir(o)));return s<.01?`arista paralela a la cara, a ${f2(Math.abs(c.c.n.dot(o.ed[0])-c.c.d))} m`:`ángulo de la arista con la cara ${gr(Math.asin(Math.min(1,s)))}`;}
    const [ar,pt]=a.k==='a'?[a,b]:[b,a];const u=dir(ar),w=pt.v.clone().sub(ar.ed[0]);return `el vértice está a ${f2(w.sub(u.multiplyScalar(w.dot(u))).length())} m de la recta de la arista`;}
  function mostrar(){vaciar(G);for(const it of SEL)G.add(marcador(it,0xff7a00,.45));
    const pr=SEL.map(it=>`<div><b>${codigo(it)}</b> <span class="s">${datos(it)}</span></div>`).join('');
    const rel=SEL.length===2?`<div style="margin-top:4px"><b>${codigo(SEL[0])} ↔ ${codigo(SEL[1])}</b> <span class="s">${relacion(SEL[0],SEL[1])}</span></div>`:SEL.length>2?`<div class="s" style="margin-top:4px">${SEL.length} elegidos (la relación sale con dos)</div>`:'';
    q('senCur').innerHTML=pr+rel;}

  let down=null,hT=0;
  view.addEventListener('pointerdown',e=>{if(P.hidden||e.button!==0)return;down=[e.clientX,e.clientY];},true);
  view.addEventListener('pointermove',e=>{if(P.hidden||down)return;const now=performance.now();if(now-hT<60)return;hT=now;/* resalta lo que tomaría */
    const it=elegir(e);vaciar(hov);if(it&&!SEL.some(s=>codigo(s)===codigo(it)))hov.add(marcador(it,0x2b8fd6,.25));window.__despertar&&window.__despertar();});
  view.addEventListener('pointerup',e=>{if(P.hidden||e.button!==0||!down)return;const moved=Math.hypot(e.clientX-down[0],e.clientY-down[1]);down=null;if(moved>5)return;
    const it=elegir(e);if(!it){if(!e.shiftKey){limpiar();q('senCur').innerHTML='<span class="s">No toqué ninguna pieza.</span>';}return;}
    const c=codigo(it);const ya=SEL.findIndex(s=>codigo(s)===c);
    if(e.shiftKey){if(ya>=0)SEL.splice(ya,1);else SEL.push(it);}else SEL=[it];
    vaciar(hov);mostrar();window.__despertar&&window.__despertar();
    if(ya<0&&!L.some(s=>s.code===c)){L.push({code:c,txt:datos(it)});save();draw();}},true);
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!P.hidden){if(SEL.length)limpiar();else on(false);}});
}
