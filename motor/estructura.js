/* Estructura (Maxi 14/10, primer prototipo del motor de cálculo): vigas continuas de acero sobre apoyos puntuales.
   Flujo: barras (salen del modelo) → apoyos (columnas y muros que tocan la barra, más los que agregue el usuario) →
   cargas (áreas tributarias × casos D y Lr, peso propio, puntuales) → combinaciones (CIRSOC 301, LRFD) →
   solver de vigas por rigidez (Euler-Bernoulli, 2 GDL por nodo) → M, V, flecha → verificación (flexión, corte, flecha) → % de uso.
   Lo que se muestra: sección «Estructura» en la barra derecha (barras con su % de uso, esquema, diagramas y datos editables)
   y mapa de uso en el 3D (verde → amarillo → rojo). Todo lo supuesto se marca «supuesto». No reemplaza el cálculo firmado. */
import * as N from './nombres.js';
export const PERFILES={/* IPE (Euronorm 19-57): h, b, tw, tf mm · A cm² · Ix cm⁴ · Wx, Zx cm³ · kg/m */
  IPE160:{h:160,b:82,tw:5.0,tf:7.4,A:20.1,Ix:869,Wx:109,Zx:124,kg:15.8},IPE180:{h:180,b:91,tw:5.3,tf:8.0,A:23.9,Ix:1317,Wx:146,Zx:166,kg:18.8},
  IPE200:{h:200,b:100,tw:5.6,tf:8.5,A:28.5,Ix:1943,Wx:194,Zx:221,kg:22.4},IPE220:{h:220,b:110,tw:5.9,tf:9.2,A:33.4,Ix:2772,Wx:252,Zx:285,kg:26.2},
  IPE240:{h:240,b:120,tw:6.2,tf:9.8,A:39.1,Ix:3892,Wx:324,Zx:367,kg:30.7},IPE270:{h:270,b:135,tw:6.6,tf:10.2,A:45.9,Ix:5790,Wx:429,Zx:484,kg:36.1},
  IPE300:{h:300,b:150,tw:7.1,tf:10.7,A:53.8,Ix:8356,Wx:557,Zx:628,kg:42.2},IPE330:{h:330,b:160,tw:7.5,tf:11.5,A:62.6,Ix:11770,Wx:713,Zx:804,kg:49.1}};
export const ACEROS={'F-24':{Fy:235,E:200000},'F-36':{Fy:355,E:200000}};/* MPa */

/* ---------- solver: viga continua por rigidez (kN, m) ---------- */
export function resolverViga({L,EI,apoyos,w,P=[]}){if(new Set(apoyos.map(a=>a.toFixed(3))).size<2)return null;/* con apoyos simples hacen falta dos: si no, es un mecanismo *//* apoyos: [x] (desplazamiento vertical nulo); w: kN/m uniforme; P: [{x,F}] hacia abajo positivo */
  const xs=new Set([0,L,...apoyos,...P.map(p=>p.x)]);const n0=Math.max(40,Math.ceil(L/.1));for(let i=0;i<=n0;i++)xs.add(+(L*i/n0).toFixed(4));
  const X=[...xs].filter(x=>x>=-1e-9&&x<=L+1e-9).sort((a,b)=>a-b);const nn=X.length,nd=2*nn;
  const K=Array.from({length:nd},()=>new Float64Array(nd)),F=new Float64Array(nd);
  for(let e=0;e<nn-1;e++){const l=X[e+1]-X[e];if(l<1e-6)continue;const k=EI/l**3,m=[[12,6*l,-12,6*l],[6*l,4*l*l,-6*l,2*l*l],[-12,-6*l,12,-6*l],[6*l,2*l*l,-6*l,4*l*l]];
    const dof=[2*e,2*e+1,2*e+2,2*e+3];for(let i=0;i<4;i++)for(let j=0;j<4;j++)K[dof[i]][dof[j]]+=k*m[i][j];
    /* carga uniforme (hacia abajo): fuerzas nodales equivalentes */const q=-w;F[dof[0]]+=q*l/2;F[dof[1]]+=q*l*l/12;F[dof[2]]+=q*l/2;F[dof[3]]-=q*l*l/12;}
  for(const p of P){const i=X.findIndex(x=>Math.abs(x-p.x)<1e-6);if(i>=0)F[2*i]-=p.F;}
  const fijo=new Set(apoyos.map(a=>2*X.findIndex(x=>Math.abs(x-a)<1e-6)));
  const lib=[...Array(nd).keys()].filter(i=>!fijo.has(i));const n=lib.length;const A=lib.map(i=>Float64Array.from(lib.map(j=>K[i][j])));const b=Float64Array.from(lib.map(i=>F[i]));
  for(let c=0;c<n;c++){let p=c;for(let r=c+1;r<n;r++)if(Math.abs(A[r][c])>Math.abs(A[p][c]))p=r;if(Math.abs(A[p][c])<1e-14)return null;/* mecanismo: le faltan apoyos */
    [A[c],A[p]]=[A[p],A[c]];[b[c],b[p]]=[b[p],b[c]];for(let r=c+1;r<n;r++){const f=A[r][c]/A[c][c];if(!f)continue;for(let k=c;k<n;k++)A[r][k]-=f*A[c][k];b[r]-=f*b[c];}}
  const s=new Float64Array(n);for(let r=n-1;r>=0;r--){let t=b[r];for(let k=r+1;k<n;k++)t-=A[r][k]*s[k];s[r]=t/A[r][r];}
  const d=new Float64Array(nd);lib.forEach((i,k)=>d[i]=s[k]);
  /* reacciones = K·d − F en los GDL fijos */const R=apoyos.map(a=>{const i=2*X.findIndex(x=>Math.abs(x-a)<1e-6);let r=-F[i];for(let j=0;j<nd;j++)r+=K[i][j]*d[j];return {x:a,R:r};});
  /* esfuerzos: corte y momento barriendo desde la izquierda (convención: M positivo tracciona abajo) */
  const pts=[];let V=0,M=0;const cargaEn=x=>P.filter(p=>Math.abs(p.x-x)<1e-6).reduce((s,p)=>s+p.F,0),reacEn=x=>R.filter(r=>Math.abs(r.x-x)<1e-6).reduce((s,r)=>s+r.R,0);
  for(let i=0;i<nn;i++){if(i>0){const l=X[i]-X[i-1];M+=V*l-w*l*l/2;V-=w*l;}V+=reacEn(X[i])-cargaEn(X[i]);pts.push({x:X[i],V,M,y:d[2*i]});}
  return {X,pts,R};}

/* combinaciones CIRSOC 301 (LRFD) que mandan para techos sin viento: 1,4 D · 1,2 D + 1,6 Lr; servicio: D + Lr y Lr sola */
const COMB=[['1,4 D',1.4,0],['1,2 D + 1,6 Lr',1.2,1.6]];
/* sobrecarga de techo (CIRSOC 101, base ASCE 7): 0,96 kN/m² reducida por área tributaria, mínimo 0,58 */
export const Lr=At=>0.96*Math.max(.6,Math.min(1,At<=18.58?1:1.2-0.011*At));

export function initEstructura(visor,M,opts={}){
  const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
  const DEF=opts.barras||{};/* datos de la casa por barra: {sec, acero, trib, D, apoyosExtra:[{x,nota}], nota} */
  let ED=LS.get('housemaker-estr',{});let db=null;
  /* barras: vigas de acero del modelo (sec con «perfil» o «acero») */
  const esAcero=s=>/perfil|acero/i.test(s.sec||'')&&!/ángulo|U de/i.test(s.sec||'');
  const barras=()=>M.ESTRUCTURA.filter(s=>s.tipo==='viga'&&s.a&&s.b&&esAcero(s)).map(s=>{const horiz=Math.abs(s.b[0]-s.a[0])>=Math.abs(s.b[1]-s.a[1]);
    const u=horiz?0:1,v=1-u,o=Math.min(s.a[u],s.b[u]),L=Math.abs(s.b[u]-s.a[u]),lin=s.a[v];
    /* apoyos automáticos: columnas sobre el eje (±15 cm) */const ap=M.ESTRUCTURA.filter(c=>c.tipo==='columna'&&c.pos&&Math.abs(c.pos[v]-lin)<15&&c.pos[u]>=o-5&&c.pos[u]<=o+L+5).map(c=>({x:(c.pos[u]-o)/100,id:c.id,nota:'columna'}));
    const d={...(DEF[s.id]||{}),...(ED[s.id]||{})};for(const e of d.apoyosExtra||[])if(!ap.some(a=>Math.abs(a.x-e.x)<.05))ap.push({...e,sup:e.sup!==false});
    ap.sort((a,b)=>a.x-b.x);return {id:s.id,s,u,o,L:L/100,lin,z:s.z,ap,d};});
  function calc(b){const d=b.d,sec=PERFILES[d.sec||'IPE240']||PERFILES.IPE240,ac=ACEROS[d.acero||'F-24'];const trib=d.trib??2,Dm2=d.D??.35;
    const At=trib*b.L,lr=Lr(At),pp=sec.kg*9.81/1000;const wD=Dm2*trib+pp,wL=lr*trib;const EI=ac.E*1e3*sec.Ix*1e-8;/* kN·m² */
    const ap=b.ap.map(a=>a.x);const r={sec,ac,trib,Dm2,At,lr,pp,wD,wL,comb:[]};
    for(const [n,cD,cL] of COMB){const s=resolverViga({L:b.L,EI,apoyos:ap,w:cD*wD+cL*wL});if(!s){r.mecanismo=true;return r;}r.comb.push({n,s});}
    const sv=resolverViga({L:b.L,EI,apoyos:ap,w:wD+wL}),sl=resolverViga({L:b.L,EI,apoyos:ap,w:wL});
    const env=k=>Math.max(...r.comb.flatMap(c=>c.s.pts.map(p=>Math.abs(p[k]))));const Mu=env('M'),Vu=env('V');
    const phiMn=.9*ac.Fy*1e3*sec.Zx*1e-6,phiVn=.9*.6*ac.Fy*1e3*(sec.h*sec.tw*1e-6);/* kN·m, kN */
    /* flecha: tramos entre apoyos ≤ L/250 (D+Lr) y ≤ L/300 (Lr); voladizos ≤ 2·Lv/250 */
    const tramos=[];const xs=[0,...ap,b.L].filter((x,i,a)=>i===0||x-a[i-1]>1e-6);for(let i=0;i<xs.length-1;i++){const a0=xs[i],a1=xs[i+1];if(a1-a0<.3)continue;/* puntas de menos de 30 cm: no cuentan */const vol=(i===0&&ap[0]>1e-6)||(i===xs.length-2&&ap[ap.length-1]<b.L-1e-6);const lim=(vol?2*(a1-a0):(a1-a0));
      const dmax=(S)=>Math.max(...S.pts.filter(p=>p.x>=a0-1e-6&&p.x<=a1+1e-6).map(p=>Math.abs(p.y)));tramos.push({a0,a1,vol,dT:dmax(sv),dL:dmax(sl),limT:lim/250,limL:lim/300});}
    const uF=tramos.reduce((m,t)=>Math.max(m,t.dT/t.limT,t.dL/t.limL),0);
    Object.assign(r,{Mu,Vu,phiMn,phiVn,uM:Mu/phiMn,uV:Vu/phiVn,uF,tramos,sv,R:r.comb[r.comb.length-1].s.R,Rsv:sv.R});r.uso=Math.max(r.uM,r.uV,r.uF);return r;}

  /* ---------- 3D: mapa de uso ---------- */
  const T=visor.THREE;const colUso=u=>{const c=new T.Color();if(u<=.6)c.setHSL(.33,.6,.42);else if(u<=1)c.setHSL(.33-(u-.6)/.4*.25,.75,.45);else c.setHSL(0,.8,.45);return c;};
  const mats=new Map();let mapa=LS.get('housemaker-estr-mapa',true);
  function pintar(){const on=abierta&&mapa;for(const q of visor.parts||[]){const r=RES[q.id];if(!q.grp)continue;q.grp.traverse(o=>{if(!o.isMesh)return;if(on&&r&&!r.mecanismo){if(!mats.has(o))mats.set(o,o.material);o.material=new T.MeshStandardMaterial({color:colUso(r.uso),roughness:.6,emissive:colUso(r.uso),emissiveIntensity:.25});}
      else if(mats.has(o)){o.material=mats.get(o);mats.delete(o);}});}window.__despertar&&window.__despertar();}

  /* ---------- panel ---------- */
  let abierta=false,selB=null,RES={},BS=[];const card=document.createElement('div');card.id='estrCard';card.style.cssText='display:none;padding:6px 9px;font-size:11px';{const st=document.createElement('style');st.textContent='#estrCard input,#estrCard select{width:100%;min-width:0;box-sizing:border-box;font-size:11px;padding:1px 3px}#estrCard td,#estrCard th{padding:1px 3px;vertical-align:top}';document.head.appendChild(st);}
  (document.querySelector('#modo-3d .stage')||document.body).appendChild(card);
  const f2=v=>(Math.round(v*100)/100).toLocaleString('es-AR'),f1=v=>(Math.round(v*10)/10).toLocaleString('es-AR'),pc=u=>Math.round(u*100)+' %';
  const barra=u=>`<span style="display:inline-block;width:46px;height:6px;border-radius:3px;background:var(--rule);vertical-align:middle;overflow:hidden"><span style="display:block;height:100%;width:${Math.min(100,u*100)}%;background:${colUso(u).getStyle()}"></span></span>`;
  function diag(r,b,k,tit,esc,uni){/* SVG: diagrama de la combinación que manda + esquema de apoyos */const W=300,H=58,S=r.comb[r.comb.length-1].s;const vals=k==='y'?r.sv.pts.map(p=>p.y*1000):S.pts.map(p=>p[k]);const mx=Math.max(1e-9,...vals.map(Math.abs));
    const X=x=>6+x/b.L*(W-12),Y=v=>H/2-(k==='M'?-v:v)/mx*(H/2-6);const path=S.pts.map((p,i)=>`${i?'L':'M'}${X(p.x).toFixed(1)},${Y(vals[i]).toFixed(1)}`).join('');
    const ex=vals.reduce((a,v,i)=>Math.abs(v)>Math.abs(a.v)?{v,i}:a,{v:0,i:0});
    return `<div style="color:var(--muted);margin-top:5px">${tit} · máx ${f1(Math.abs(ex.v))} ${uni} en x ${f2(S.pts[ex.i].x)}</div><svg viewBox="0 0 ${W} ${H}" style="width:100%;height:${H}px;display:block"><line x1="6" y1="${H/2}" x2="${W-6}" y2="${H/2}" stroke="currentColor" stroke-opacity=".35"/>
      <path d="${path}L${X(b.L)},${H/2}L${X(0)},${H/2}Z" fill="${esc}" fill-opacity=".18" stroke="${esc}" stroke-width="1.3"/>${b.ap.map(a=>`<path d="M${X(a.x)},${H/2}l-4,6h8z" fill="currentColor" fill-opacity=".6"/>`).join('')}</svg>`;}
  function panel(){if(!abierta)return;BS=barras();RES={};for(const b of BS)RES[b.id]=calc(b);if(!selB&&BS[0])selB=BS[0].id;const b=BS.find(x=>x.id===selB),r=b&&RES[b.id];
    let h=`<div style="color:var(--muted);line-height:1.4;margin-bottom:6px">Prototipo: vigas de acero continuas sobre apoyos puntuales, cargas de techo por área tributaria, CIRSOC 301 (LRFD) y 101. <b>Orientativo</b>: no reemplaza el cálculo firmado.</div>
      <label style="display:flex;gap:5px;align-items:center;margin-bottom:6px"><input type="checkbox" data-a="mapa"${mapa?' checked':''}> mapa de uso en el 3D</label>
      <table style="width:100%;border-collapse:collapse;margin-bottom:6px">${BS.map(x=>{const q=RES[x.id];return `<tr data-b="${x.id}" style="cursor:pointer;${x.id===selB?'background:var(--accent-soft)':''}"><td><b>${x.id}</b> <span style="color:var(--muted)">${(x.s.nombre||'').slice(0,22)}</span></td><td style="text-align:right;white-space:nowrap">${q.mecanismo?'<span style="color:#c0392b">sin apoyos</span>':barra(q.uso)+' '+pc(q.uso)}</td></tr>`;}).join('')||'<tr><td style="color:var(--muted)">No hay vigas de acero en el modelo.</td></tr>'}</table>`;
    if(b&&r){const sup=x=>`<span title="supuesto: confirmalo" style="background:#f6e7b4;color:#7a5b00;border-radius:3px;padding:0 3px;font-size:9.5px">${x}</span>`;const d=b.d;
      h+=`<div style="border-top:1px solid var(--rule);padding-top:6px"><b>${b.id}</b> · ${f2(b.L)} m · ${b.ap.length} apoyos</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 6px;margin:5px 0">
        <label style="display:flex;flex-direction:column;font-size:10px;color:var(--muted)">sección ${d.secOk?'':sup('supuesto')}<select data-k="sec">${Object.keys(PERFILES).map(k=>`<option${k===(d.sec||'IPE240')?' selected':''}>${k}</option>`).join('')}</select></label>
        <label style="display:flex;flex-direction:column;font-size:10px;color:var(--muted)">acero<select data-k="acero">${Object.keys(ACEROS).map(k=>`<option${k===(d.acero||'F-24')?' selected':''}>${k}</option>`).join('')}</select></label>
        <label style="display:flex;flex-direction:column;font-size:10px;color:var(--muted)">ancho tributario m ${d.tribOk?'':sup('supuesto')}<input data-k="trib" type="number" step=".1" value="${r.trib}"></label>
        <label style="display:flex;flex-direction:column;font-size:10px;color:var(--muted)">D techo kN/m² ${d.DOk?'':sup('supuesto')}<input data-k="D" type="number" step=".05" value="${r.Dm2}"></label></div>
      <div style="color:var(--muted);line-height:1.45">Cargas lineales: D ${f2(r.wD)} kN/m (incluye ${f2(r.pp)} de peso propio) · Lr ${f2(r.lr)} kN/m² × ${f1(r.trib)} m = ${f2(r.wL)} kN/m (área ${f1(r.At)} m²)</div>
      <div style="margin-top:4px">Apoyos: ${b.ap.map(a=>`<span title="${a.nota||''}" style="white-space:nowrap">${a.id||'x '+f2(a.x)}${a.id?'':' '+sup('supuesto')}${a.id?'':` <a href="#" data-q="${a.x}" title="Quitar este apoyo">×</a>`}</span>`).join(' · ')} <a href="#" data-a="addap" title="Agregar un apoyo">＋ apoyo</a></div>`;
      if(r.mecanismo)h+=`<div style="color:#c0392b;margin-top:6px">Con estos apoyos la viga es un mecanismo: agregale apoyos.</div>`;
      else{h+=`<table style="width:100%;margin-top:6px;border-collapse:collapse"><tr style="color:var(--muted);text-align:left"><th>verificación</th><th>pedido</th><th>resiste</th><th>uso</th></tr>
        <tr><td>flexión</td><td>${f1(r.Mu)} kN·m</td><td>${f1(r.phiMn)}</td><td>${barra(r.uM)} ${pc(r.uM)}</td></tr>
        <tr><td>corte</td><td>${f1(r.Vu)} kN</td><td>${f1(r.phiVn)}</td><td>${barra(r.uV)} ${pc(r.uV)}</td></tr>
        <tr><td>flecha</td><td colspan="2">${r.tramos.map(t=>`${t.vol?'vol.':'tramo'} ${f1(t.a1-t.a0)} m: ${f1(t.dT*1000)} mm (lím ${f1(t.limT*1000)})`).join('<br>')}</td><td>${barra(r.uF)} ${pc(r.uF)}</td></tr></table>
        ${diag(r,b,'M','Momento (1,2 D + 1,6 Lr)','#c0461f','kN·m')}${diag(r,b,'V','Corte','#2f6db3','kN')}${diag(r,b,'y','Flecha (D + Lr)','#2a9d5c','mm')}
        <div style="margin-top:5px;line-height:1.5"><b>Reacciones</b> (1,2 D + 1,6 Lr / servicio): ${r.R.map((x,i)=>`${(b.ap[i]&&b.ap[i].id)||'x '+f2(x.x)} ${f1(x.R)} / ${f1(r.Rsv[i].R)} kN`).join(' · ')}</div>
        <div style="color:var(--muted);margin-top:4px;line-height:1.35">Supone viga compacta y arriostrada lateralmente por los cabios (sin pandeo lateral-torsional), apoyos simples y sin viento. ${d.nota||''}</div>`;}}
    card.innerHTML=h;pintar();}
  function guardar(id,patch){ED[id]={...(ED[id]||{}),...patch};LS.set('housemaker-estr',ED);if(db)try{db.collection('estructura').doc(id).set(ED[id]);}catch(e){}panel();}
  card.addEventListener('click',e=>{const t=e.target;const tr=t.closest('[data-b]');if(tr){selB=tr.dataset.b;panel();const p=(visor.parts||[]).find(q=>q.id===selB);if(p&&visor.showPart)visor.showPart(selB);return;}
    const q=t.closest('[data-q]');if(q){e.preventDefault();const b=BS.find(x=>x.id===selB);const x=+q.dataset.q;guardar(selB,{apoyosExtra:(b.d.apoyosExtra||[]).filter(a=>Math.abs(a.x-x)>.01)});return;}
    const a=t.closest('[data-a]');if(a&&a.dataset.a==='addap'){e.preventDefault();const b=BS.find(x=>x.id===selB);/* sin diálogos: se agrega en el medio del tramo más largo y queda marcado como supuesto */
      const xs=[0,...b.ap.map(a=>a.x),b.L];let best=[0,0];for(let i=0;i<xs.length-1;i++)if(xs[i+1]-xs[i]>best[1]-best[0])best=[xs[i],xs[i+1]];const x=Math.round((best[0]+best[1])/2*100)/100;guardar(selB,{apoyosExtra:[...(b.d.apoyosExtra||[]),{x,nota:'agregado a mano'}]});}});
  card.addEventListener('change',e=>{const t=e.target;if(t.dataset.a==='mapa'){mapa=t.checked;LS.set('housemaker-estr-mapa',mapa);pintar();return;}const k=t.dataset.k;if(!k||!selB)return;
    const v=t.tagName==='SELECT'?t.value:+t.value;guardar(selB,{[k]:v,[k+'Ok']:true});});
  card.addEventListener('keydown',e=>e.stopPropagation());
  /* elegir una viga en el 3D la elige acá */setInterval(()=>{if(!abierta)return;const s=visor.selected;if(s&&s!==selB&&BS.some(b=>b.id===s)){selB=s;panel();}},400);
  let lp=null;setInterval(()=>{if(abierta&&visor.parts!==lp){lp=visor.parts;mats.clear();pintar();}},600);
  N.getDb().then(d=>{db=d;if(!d)return;d.collection('estructura').onSnapshot(sn=>{const R={};sn.docs.forEach(x=>{if(x.exists)R[x.id]=x.data();});ED={...ED,...R};LS.set('housemaker-estr',ED);panel();},()=>{});});
  const api={toggle(v){abierta=v==null?!abierta:v;card.style.display=abierta?'block':'none';if(abierta)panel();else pintar();window.__side&&window.__side.sync();return abierta;},get abierta(){return abierta;},calc,barras,resolverViga,el:card};
  visor.estructura=api;
  if(window.__side&&window.__side.add)window.__side.add('estr','Estructura',card,()=>abierta,()=>api.toggle(false));
  return api;
}
