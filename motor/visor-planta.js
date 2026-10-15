/* Visor de planta — dibuja el modelo (modelo-carhue.js) como SVG y lo hace navegable.
   Todo elemento del modelo tiene código; tocarlo en el dibujo o en cualquier texto lo selecciona. */
import * as M from './modelo.js';
import { CALCO } from './calco-glb.js';
import * as N from './nombres.js';
import { renderVideo } from './video.js';
import * as ED from './ediciones.js';

const NS='http://www.w3.org/2000/svg';
const $=id=>document.getElementById(id);
const f1=n=>(Math.round(n*10)/10).toFixed(1).replace('.',',').replace(/,0$/,'');
const fm=cm=>(Math.round(cm)/100).toFixed(2).replace('.',',');   // cm → "4,70"
const el=(tag,attrs={},parent)=>{const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))if(v!=null)e.setAttribute(k,v);parent&&parent.appendChild(e);return e;};
const area=p=>Math.abs(p.reduce((s,[x,y],i)=>{const [x2,y2]=p[(i+1)%p.length];return s+x*y2-x2*y;},0))/2;
const bboxOf=p=>{let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const [x,y] of p){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}return {x0,y0,x1,y1,w:x1-x0,h:y1-y0,cx:(x0+x1)/2,cy:(y0+y1)/2};};
const pts=p=>p.map(q=>q.join(',')).join(' ');

/* ---------- registro de elementos ---------- */
const REG={};   // id → {id,cat,nombre,nivel,data,bbox,el}
const CATS={muro:'Muros',abertura:'Aberturas',local:'Locales',estructura:'Estructura',escalera:'Escaleras',deck:'Deck',techo:'Techos',chimenea:'Chimeneas y hogar',implantacion:'Implantación',eje:'Ejes'};
function reg(id,cat,data,bbox){REG[id]={id,cat,data,bbox,nombre:data.nombre||id,nivel:data.nivel||(cat==='techo'?'TE':'PB')};return REG[id];}

/* ---------- estado ---------- */
const S={nivel:'PB',sel:null,hover:null,measure:false,mpts:[],vb:{x:-350,y:-400,w:3400,h:1800},
  capas:{muros:true,aberturas:true,locales:true,estructura:true,escaleras:true,deck:true,techos:true,cotas:true,ejes:true,etiquetas:true,implantacion:true,calco:true}};
try{const s=JSON.parse(localStorage.getItem('carhue-vista')||'null');if(s&&s.capas)Object.assign(S.capas,s.capas);if(s&&s.nivel)S.nivel=s.nivel;}catch(e){}
function persist(){try{localStorage.setItem('carhue-vista',JSON.stringify({capas:S.capas,nivel:S.nivel}));}catch(e){}}

/* ---------- construcción del SVG ---------- */
const PR=document.getElementById('modo-planta');
const svg=$('plano');
const root=el('g',{id:'root'},svg);
const L={};   // capas
for(const k of ['implantacion','techos','locales','deck','calco','muros_ghost','muros','aberturas','estructura','escaleras','chimeneas','ejes','cotas','etiquetas','medir','marcas','hi'])L[k]=el('g',{class:'ly ly-'+k,'data-ly':k},root);

function wallPoly(m){const [ax,ay]=m.a,[bx,by]=m.b;const dx=bx-ax,dy=by-ay,len=Math.hypot(dx,dy);const nx=-dy/len*m.e/2,ny=dx/len*m.e/2;return [[ax+nx,ay+ny],[bx+nx,by+ny],[bx-nx,by-ny],[ax-nx,ay-ny]];}
function wallFrame(m){const [ax,ay]=m.a,[bx,by]=m.b;const dx=bx-ax,dy=by-ay,len=Math.hypot(dx,dy);return {ux:dx/len,uy:dy/len,nx:-dy/len,ny:dx/len,len};}
const cls=d=>`e-${d.estado||'existente'} c-${d.conf||'estimado'}`;
const BELOW=new Set(['M-05','M-07','M-08','M-15','M-26','M-35']);   // muros cuya etiqueta va del lado +y

function build(){
  for(const k in L)L[k].replaceChildren();for(const k in REG)delete REG[k];
  const niv=S.nivel, show=k=>S.capas[k];
  const lblW=(id,txt,x,y,o={})=>{if(!show('etiquetas'))return;const g=el('g',{class:'lbl '+(o.cls||''),'data-for':id,transform:`translate(${x} ${y})${o.rot?` rotate(${o.rot})`:''}`},L.etiquetas);
    const t=el('text',{'text-anchor':o.anchor||'middle','dominant-baseline':'middle'},g);
    (Array.isArray(txt)?txt:[txt]).forEach((ln,i)=>{const ts=el('tspan',{x:0,dy:i?'1.25em':0,class:i?(o.nm===i?'nm':'sub'):'main'},t);ts.textContent=ln;});return g;};

  /* calco del GLB */
  if(show('calco'))for(const c of (CALCO[niv]||[]))el('polygon',{points:pts(c.pts),class:'calco'},L.calco).appendChild(Object.assign(document.createElementNS(NS,'title'),{textContent:'GLB · '+c.part}));

  /* implantación */
  if(show('implantacion'))for(const o of M.IMPLANTACION){let e;
    if(o.pos){e=el('circle',{cx:o.pos[0],cy:o.pos[1],r:o.r||40,class:'impl arbol '+cls(o),'data-id':o.id},L.implantacion);el('circle',{cx:o.pos[0],cy:o.pos[1],r:(o.r||40)*3.2,class:'copa'},L.implantacion);reg(o.id,'implantacion',o,{x0:o.pos[0]-o.r,y0:o.pos[1]-o.r,x1:o.pos[0]+o.r,y1:o.pos[1]+o.r,cx:o.pos[0],cy:o.pos[1],w:2*o.r,h:2*o.r});lblW(o.id,o.id,o.pos[0],o.pos[1]-(o.r||40)-30,{cls:'small'});}
    else{e=el('polygon',{points:pts(o.poly),class:`impl ${o.tipo} `+cls(o),'data-id':o.id},L.implantacion);const b=bboxOf(o.poly);reg(o.id,'implantacion',o,b);lblW(o.id,[o.id,o.nombre],b.cx,b.cy,{cls:'impl'});}}

  /* techos (solo en nivel TE) */
  if(niv==='TE'&&show('techos'))for(const t of M.TECHOS){
    if(t.linea){el('polyline',{points:pts(t.linea),class:'cumbrera '+cls(t),'data-id':t.id},L.techos);const b=bboxOf(t.linea);reg(t.id,'techo',t,b);lblW(t.id,t.id,b.cx,b.cy-26,{cls:'small'});continue;}
    el('polygon',{points:pts(t.poly),class:`techo m-${(t.mat||'').split(' ')[0]} `+cls(t),'data-id':t.id},L.techos);const b=bboxOf(t.poly);reg(t.id,'techo',t,b);
    // flecha de pendiente
    const dir={'+y':[0,1],'−y':[0,-1],'+x':[1,0],'−x':[-1,0]}[t.baja]||[0,1];const L0=Math.min(b.w,b.h)*0.3;
    el('line',{x1:b.cx-dir[0]*L0/2,y1:b.cy-dir[1]*L0/2,x2:b.cx+dir[0]*L0/2,y2:b.cy+dir[1]*L0/2,class:'pend','marker-end':'url(#arr)'},L.techos);
    lblW(t.id,[t.id,`${t.nombre} · ${t.mat}`],b.cx,t.id==='T-03'?b.y1+70:b.cy-L0/2-40);}

  /* locales */
  if(show('locales'))for(const l of M.LOCALES){if(l.nivel!==niv)continue;const b=bboxOf(l.poly),A=area(l.poly)/1e4;
    el('polygon',{points:pts(l.poly),class:'local '+cls(l),'data-id':l.id},L.locales);reg(l.id,'local',l,b);
    lblW(l.id,[l.id,N.alias(l.id)||l.nombre,`${fm(b.w)} × ${fm(b.h)} · ${f1(A)} m²`],b.cx,b.cy,{cls:'local',nm:1});}

  /* deck */
  if(show('deck')&&niv!=='TE')for(const d of M.DECK){el('polygon',{points:pts(d.poly),class:'deck '+cls(d),'data-id':d.id},L.deck);const b=bboxOf(d.poly);reg(d.id,'deck',d,b);lblW(d.id,[d.id,d.nombre],1800,1045,{cls:'local'});}

  /* muros: los del nivel en firme; los de PB en gris cuando estamos en EP o TE */
  const wallsHere=M.MUROS.filter(m=>m.nivel===niv),ghosts=niv==='PB'?[]:M.MUROS.filter(m=>m.nivel==='PB');
  if(show('muros')){for(const m of ghosts)el('polygon',{points:pts(wallPoly(m)),class:'muro ghost'},L.muros_ghost);
    for(const m of wallsHere){const p=wallPoly(m),b=bboxOf(p);el('polygon',{points:pts(p),class:`muro t-${m.tipo} `+cls(m),'data-id':m.id},L.muros);reg(m.id,'muro',m,b);
      const fr=wallFrame(m),mx=(m.a[0]+m.b[0])/2,my=(m.a[1]+m.b[1])/2,off=m.e/2+22;const vert=Math.abs(fr.uy)>.5;
      // etiqueta del lado libre: arriba para horizontales (abajo en el ventanal y en M-07), a la izquierda para verticales
      const sgn=BELOW.has(m.id)?1:-1;
      if(vert)lblW(m.id,m.id,mx-off,my,{cls:'muro small',rot:-90});else lblW(m.id,m.id,mx,my+off*sgn,{cls:'muro small'});}}
  /* aberturas: en los muros del nivel */
  if(show('aberturas'))for(const a of M.ABERTURAS){const m=M.MUROS.find(w=>w.id===a.muro);if(!m||m.nivel!==niv)continue;const fr=wallFrame(m);
    const p0=[m.a[0]+fr.ux*a.d,m.a[1]+fr.uy*a.d],p1=[m.a[0]+fr.ux*(a.d+a.w),m.a[1]+fr.uy*(a.d+a.w)];const n=[fr.nx*m.e/2,fr.ny*m.e/2];
    const g=el('g',{class:`abertura t-${a.tipo} `+cls(a),'data-id':a.id},L.aberturas);
    el('polygon',{points:pts([[p0[0]+n[0],p0[1]+n[1]],[p1[0]+n[0],p1[1]+n[1]],[p1[0]-n[0],p1[1]-n[1]],[p0[0]-n[0],p0[1]-n[1]]]),class:'hueco'},g);
    if(a.tipo==='ventana'){for(const k of [-0.3,0.3])el('line',{x1:p0[0]+n[0]*k,y1:p0[1]+n[1]*k,x2:p1[0]+n[0]*k,y2:p1[1]+n[1]*k,class:'vidrio'},g);}
    else if(a.tipo==='puerta'){const s=(a.lado||1);const lf=[p0[0]+fr.nx*a.w*s,p0[1]+fr.ny*a.w*s];el('line',{x1:p0[0],y1:p0[1],x2:lf[0],y2:lf[1],class:'hoja'},g);
      el('path',{d:`M ${lf[0]} ${lf[1]} A ${a.w} ${a.w} 0 0 ${s>0?1:0} ${p1[0]} ${p1[1]}`,class:'arco'},g);}
    else{el('line',{x1:p0[0],y1:p0[1],x2:p1[0],y2:p1[1],class:'vano'},g);}
    const cx=(p0[0]+p1[0])/2,cy=(p0[1]+p1[1])/2;reg(a.id,'abertura',a,{x0:Math.min(p0[0],p1[0])-m.e,y0:Math.min(p0[1],p1[1])-m.e,x1:Math.max(p0[0],p1[0])+m.e,y1:Math.max(p0[1],p1[1])+m.e,cx,cy,w:a.w,h:a.w});
    const vert=Math.abs(fr.uy)>.5,sg=BELOW.has(m.id)?1:-1;
    if(vert)lblW(a.id,a.id,cx-m.e/2-16,cy,{cls:'small',rot:-90});else lblW(a.id,a.id,cx,cy+(m.e/2+16)*sg,{cls:'small'});}

  /* estructura */
  if(show('estructura'))for(const s of M.ESTRUCTURA){if((s.nivel||'PB')!==niv&&!(niv==='EP'&&s.nivel==='EP'))continue;
    const AREA={'TIR-1':61,'COS-1':61,'CAB-2':65,'CAB-3':65,'V-10':65,'V-11':130,'POR-1':65,'TBL-1':0,'MON-1':0,'BAR-1':0};
    if(s.a&&s.b&&s.id in AREA&&Math.abs(s.b[0]-s.a[0])>30&&Math.abs(s.b[1]-s.a[1])>30){const x0=Math.min(s.a[0],s.b[0]),x1=Math.max(s.a[0],s.b[0]),y0=Math.min(s.a[1],s.b[1]),y1=Math.max(s.a[1],s.b[1]);const g=el('g',{class:'zona '+cls(s),'data-id':s.id},L.estructura);
      el('rect',{x:x0,y:y0,width:x1-x0,height:y1-y0,class:'zonarect'},g);if(AREA[s.id])for(let x=x0;x<=x1+.1;x+=AREA[s.id])el('line',{x1:x,y1:y0,x2:x,y2:y1,class:'zonaline'},g);
      const b=bboxOf([[x0,y0],[x1,y1]]);reg(s.id,'estructura',s,b);lblW(s.id,s.id,b.cx,b.cy,{cls:'small estr'});}
    else if(s.a&&s.b){el('line',{x1:s.a[0],y1:s.a[1],x2:s.b[0],y2:s.b[1],class:'viga '+cls(s),'data-id':s.id},L.estructura);const b=bboxOf([s.a,s.b]);reg(s.id,'estructura',s,b);const vert=Math.abs(s.b[1]-s.a[1])>Math.abs(s.b[0]-s.a[0]);lblW(s.id,s.id,b.cx+(vert?18:0),b.cy+(vert?0:-18),{cls:'small estr',rot:vert?-90:0});}
    else if(s.tipo==='columna'){el('rect',{x:s.pos[0]-6,y:s.pos[1]-6,width:12,height:12,class:'col '+cls(s),'data-id':s.id},L.estructura);reg(s.id,'estructura',s,{x0:s.pos[0]-20,y0:s.pos[1]-20,x1:s.pos[0]+20,y1:s.pos[1]+20,cx:s.pos[0],cy:s.pos[1],w:40,h:40});lblW(s.id,s.id,s.pos[0]+8,s.pos[1]-16,{cls:'small estr',anchor:'start'});}
    else{el('polygon',{points:pts([[s.pos[0]-120,s.pos[1]+60],[s.pos[0],s.pos[1]-60],[s.pos[0]+120,s.pos[1]+60]]),class:'apunt '+cls(s),'data-id':s.id},L.estructura);reg(s.id,'estructura',s,{x0:s.pos[0]-120,y0:s.pos[1]-60,x1:s.pos[0]+120,y1:s.pos[1]+60,cx:s.pos[0],cy:s.pos[1],w:240,h:120});lblW(s.id,s.id,s.pos[0],s.pos[1]+85,{cls:'small estr'});}}

  /* escaleras */
  if(show('escaleras')&&niv!=='TE')for(const e of M.ESCALERAS){const g=el('g',{class:'esc '+cls(e),'data-id':e.id},L.escaleras);
    el('polygon',{points:pts(e.poly),class:'tramo'},g);if(e.giro)el('polygon',{points:pts(e.giro),class:'giro'},g);
    const b=bboxOf(e.poly);const n=Math.round(b.h/24);for(let i=1;i<n;i++)el('line',{x1:b.x0,y1:b.y0+i*24,x2:b.x1,y2:b.y0+i*24,class:'pedada'},g);
    const up=e.sube==='+y';el('line',{x1:b.cx,y1:up?b.y0+20:b.y1-20,x2:b.cx,y2:up?b.y1-10:b.y0+10,class:'flecha','marker-end':'url(#arr)'},g);
    reg(e.id,'escalera',e,bboxOf([...e.poly,...(e.giro||[])]));lblW(e.id,[e.id,'sube ↓'],b.cx,b.y0-40,{cls:'small'});}

  /* chimeneas y hogar */
  if(niv!=='EP')for(const c of M.CHIMENEAS){const hog=c.tipo==='hogar';const sal=c.id==='SAL-1';if(hog&&niv==='TE')continue;if(sal&&niv==='TE')continue;if(c.tipo==='chimenea'&&niv!=='TE')continue;if(c.tipo==='mueble'&&niv!=='PB')continue;if(!hog&&!c.box&&!show('estructura'))continue;
    if(c.box){el('rect',{x:c.box[0],y:c.box[4],width:c.box[1]-c.box[0],height:c.box[5]-c.box[4],class:'mueble '+cls(c),'data-id':c.id},L.chimeneas);reg(c.id,'chimenea',c,bboxOf([[c.box[0],c.box[4]],[c.box[1],c.box[5]]]));lblW(c.id,c.id,(c.box[0]+c.box[1])/2,(c.box[4]+c.box[5])/2,{cls:'small'});continue;}
    if(hog)el('rect',{x:c.pos[0]-75,y:c.pos[1],width:150,height:60,class:'hogar '+cls(c),'data-id':c.id},L.chimeneas);
    else el('rect',{x:c.pos[0]-35,y:c.pos[1]-35,width:70,height:70,class:'chim '+cls(c),'data-id':c.id},L.chimeneas);
    reg(c.id,'chimenea',c,{x0:c.pos[0]-100,y0:c.pos[1]-40,x1:c.pos[0]+100,y1:c.pos[1]+40,cx:c.pos[0],cy:c.pos[1],w:200,h:80});lblW(c.id,c.id,c.pos[0],c.pos[1]+(hog?55:-52),{cls:hog?'small':''});}

  /* ejes */
  if(show('ejes')){const ext=S.capas.implantacion?{x0:-260,x1:4050,y0:-920,y1:1930}:{x0:-260,x1:3050,y0:-920,y1:1300};
    for(const e of M.EJES){const v=e.dir==='v';el('line',{x1:v?e.pos:ext.x0,y1:v?ext.y0:e.pos,x2:v?e.pos:ext.x1,y2:v?ext.y1:e.pos,class:'eje'},L.ejes);
      const bx=v?e.pos:ext.x0,by=v?ext.y0:e.pos;const g=el('g',{class:'ejeb','data-id':e.id,transform:`translate(${bx} ${by})`},L.ejes);el('circle',{r:22},g);const t=el('text',{'text-anchor':'middle','dominant-baseline':'central'},g);t.textContent=e.id;
      reg(e.id,'eje',{...e,nombre:`Eje ${e.id}`,nivel:niv},{x0:bx-22,y0:by-22,x1:bx+22,y1:by+22,cx:bx,cy:by,w:44,h:44});}}

  /* cotas generales */
  if(show('cotas')){const dim=(a,b,off,txt)=>{const [ax,ay]=a,[bx,by]=b;const v=Math.abs(bx-ax)<1;const ox=v?off:0,oy=v?0:off;const g=el('g',{class:'cota'},L.cotas);
      el('line',{x1:ax+ox,y1:ay+oy,x2:bx+ox,y2:by+oy},g);el('line',{x1:ax,y1:ay,x2:ax+ox*1.15,y2:ay+oy*1.15,class:'ext'},g);el('line',{x1:bx,y1:by,x2:bx+ox*1.15,y2:by+oy*1.15,class:'ext'},g);
      for(const [x,y] of [[ax+ox,ay+oy],[bx+ox,by+oy]])el('line',{x1:x-8,y1:y+8,x2:x+8,y2:y-8,class:'tick'},g);
      const t=el('text',{x:(ax+bx)/2+ox+(v?-10:0),y:(ay+by)/2+oy+(v?0:-9),'text-anchor':'middle',transform:v?`rotate(-90 ${(ax+bx)/2+ox-10} ${(ay+by)/2+oy})`:null},g);t.textContent=txt||fm(Math.hypot(bx-ax,by-ay));};
    if(niv!=='TE'){dim([0,8],[2527,8],-900);dim([0,8],[1322,8],-150);dim([1322,8],[1800,8],-150);dim([2400,8],[2527,8],-150);
      dim([0,8],[0,708],-120);dim([1336,620],[1336,937],-60);dim([1800,-792],[1800,8],-120);dim([1800,-792],[2400,-792],-80);
      dim([2541,-128],[3837,-128],-70);dim([3967,-128],[3967,1864],90);dim([1027,1150],[2541,1150],70);dim([3068,210],[3837,210],-60);dim([3837,210],[3837,1747],80);}
    else{dim([-43,-81],[-43,352],-120);dim([-43,352],[-43,738],-120);dim([1336,581],[1336,941],-60);dim([-43,738],[2523,738],60);dim([2523,38],[2903,38],-60);dim([1771,-828],[2442,-828],-60);}}

  /* medición */
  drawMeasure();
  applyView();applySel();
  bindHits();
}

/* ---------- interacción con el dibujo ---------- */
function bindHits(){svg.querySelectorAll('[data-id]').forEach(e=>{e.addEventListener('pointerenter',()=>{S.hover=e.dataset.id;applySel();});e.addEventListener('pointerleave',()=>{S.hover=null;applySel();});});}
function applySel(){svg.querySelectorAll('.sel').forEach(e=>e.classList.remove('sel'));svg.querySelectorAll('.hov').forEach(e=>e.classList.remove('hov'));L.hi.replaceChildren();
  const mark=(id,c)=>{svg.querySelectorAll(`[data-id="${id}"],[data-for="${id}"]`).forEach(e=>e.classList.add(c));};
  if(S.hover)mark(S.hover,'hov');
  if(S.sel){const ids=Array.isArray(S.sel)?S.sel:[S.sel];for(const id of ids){mark(id,'sel');const r=REG[id];if(r&&r.bbox)el('rect',{x:r.bbox.x0-6,y:r.bbox.y0-6,width:r.bbox.w+12,height:r.bbox.h+12,class:'hibox'},L.hi);}}}

/* vista: viewBox + unidades por px para que textos y líneas no cambien de tamaño */
function applyView(){const {x,y,w,h}=S.vb;if(!(w>0&&h>0))return;svg.setAttribute('viewBox',`${x} ${y} ${w} ${h}`);const u=w/Math.max(1,svg.clientWidth);root.style.setProperty('--u',u);root.classList.toggle('far',u>2.3);root.classList.toggle('vfar',u>4.8);}
let pendingFit=null;
function fit(b,pad=.08){const W=svg.clientWidth,H=svg.clientHeight;if(!W||!H){pendingFit=[b,pad];return;}const w=b.w*(1+2*pad),h=b.h*(1+2*pad);const k=Math.max(w/W,h/H);S.vb={w:W*k,h:H*k,x:b.cx-W*k/2,y:b.cy-H*k/2};applyView();}
const HOUSE={cx:1440,cy:120,w:3150,h:1900};
function fitAll(){const b=S.capas.implantacion?{cx:1900,cy:500,w:4350,h:2900}:HOUSE;fit(b,.03);}
function clientToWorld(cx,cy){const m=root.getScreenCTM?root.getScreenCTM():null;if(m){const pt=svg.createSVGPoint();pt.x=cx;pt.y=cy;const q=pt.matrixTransform(m.inverse());return [q.x,q.y];}const r=svg.getBoundingClientRect();return [S.vb.x+(cx-r.left)/r.width*S.vb.w,S.vb.y+(cy-r.top)/r.height*S.vb.h];}
{let drag=null,pinch=null;
  svg.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;svg.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY,vb:{...S.vb},moved:false};});
  svg.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id||pinch)return;const r=svg.getBoundingClientRect();const dx=(e.clientX-drag.x)/r.width*S.vb.w,dy=(e.clientY-drag.y)/r.height*S.vb.h;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>4)drag.moved=true;S.vb.x=drag.vb.x-dx;S.vb.y=drag.vb.y-dy;applyView();});
  svg.addEventListener('pointerup',e=>{if(!drag||e.pointerId!==drag.id)return;const moved=drag.moved;drag=null;if(moved)return;
    if(PM.on){PM.click(clientToWorld(e.clientX,e.clientY),e.shiftKey);return;}
    if(S.measure){const p=clientToWorld(e.clientX,e.clientY);if(S.mpts.length>=2)S.mpts=[];S.mpts.push(p);drawMeasure();return;}
    const t=e.target.closest('[data-id],[data-for]');if(t){select(t.dataset.id||t.dataset.for,false);}else{select(null);}});
  svg.addEventListener('pointercancel',()=>{drag=null;});
  svg.addEventListener('wheel',e=>{e.preventDefault();const [wx,wy]=clientToWorld(e.clientX,e.clientY);const k=Math.exp(e.deltaY*0.0015);zoomAt(wx,wy,k);},{passive:false});
  // pinch
  const tp=new Map();svg.addEventListener('touchstart',e=>{if(e.touches.length===2){pinch={d:Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY),vb:{...S.vb},c:[(e.touches[0].clientX+e.touches[1].clientX)/2,(e.touches[0].clientY+e.touches[1].clientY)/2]};}},{passive:true});
  svg.addEventListener('touchmove',e=>{if(pinch&&e.touches.length===2){e.preventDefault();const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);const k=pinch.d/d;const [wx,wy]=(()=>{const r=svg.getBoundingClientRect();return [pinch.vb.x+(pinch.c[0]-r.left)/r.width*pinch.vb.w,pinch.vb.y+(pinch.c[1]-r.top)/r.height*pinch.vb.h];})();S.vb={w:pinch.vb.w*k,h:pinch.vb.h*k,x:wx-(wx-pinch.vb.x)*k,y:wy-(wy-pinch.vb.y)*k};applyView();}},{passive:false});
  svg.addEventListener('touchend',e=>{if(e.touches.length<2)pinch=null;});
  new ResizeObserver(()=>{if(pendingFit&&svg.clientWidth){const [b,pad]=pendingFit;pendingFit=null;fit(b,pad);}else applyView();}).observe(svg);}
function zoomAt(wx,wy,k){k=Math.max(.12,Math.min(8,S.vb.w*k/3400))*3400/S.vb.w;S.vb={w:S.vb.w*k,h:S.vb.h*k,x:wx-(wx-S.vb.x)*k,y:wy-(wy-S.vb.y)*k};applyView();}
$('zin').addEventListener('click',()=>zoomAt(S.vb.x+S.vb.w/2,S.vb.y+S.vb.h/2,.75));
$('zout').addEventListener('click',()=>zoomAt(S.vb.x+S.vb.w/2,S.vb.y+S.vb.h/2,1.33));
$('fit').addEventListener('click',()=>{select(null);fitAll();});

/* medición */
function drawMeasure(){L.medir.replaceChildren();const [a,b]=S.mpts;if(a)el('circle',{cx:a[0],cy:a[1],r:5,class:'mp'},L.medir);
  if(a&&b){el('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],class:'ml'},L.medir);el('circle',{cx:b[0],cy:b[1],r:5,class:'mp'},L.medir);
    const d=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=Math.abs(b[0]-a[0]),dy=Math.abs(b[1]-a[1]);const g=el('g',{class:'lbl medida',transform:`translate(${(a[0]+b[0])/2} ${(a[1]+b[1])/2-14})`},L.medir);const t=el('text',{'text-anchor':'middle'},g);
    t.textContent=`${fm(d)} m${dx>2&&dy>2?`  (Δx ${fm(dx)} · Δy ${fm(dy)})`:''}`;$('mout').textContent=`${fm(d)} m`;}else $('mout').textContent='';}
$('medir').addEventListener('click',e=>{S.measure=!S.measure;S.mpts=[];drawMeasure();e.currentTarget.setAttribute('aria-pressed',S.measure);svg.classList.toggle('measuring',S.measure);$('mhint').hidden=!S.measure;});

/* ---------- selección y panel ---------- */
const ALL=()=>Object.keys(REG);
function allIds(){const s=new Set();for(const arr of [M.MUROS,M.ABERTURAS,M.LOCALES,M.ESTRUCTURA,M.ESCALERAS,M.DECK,M.TECHOS,M.CHIMENEAS,M.IMPLANTACION,M.DUDAS])for(const o of arr)s.add(o.id);for(const e of M.EJES)s.add('Eje '+e.id);return [...s];}
const findData=id=>{for(const [cat,arr] of [['muro',M.MUROS],['abertura',M.ABERTURAS],['local',M.LOCALES],['estructura',M.ESTRUCTURA],['escalera',M.ESCALERAS],['deck',M.DECK],['techo',M.TECHOS],['chimenea',M.CHIMENEAS],['implantacion',M.IMPLANTACION]]){const d=arr.find(o=>o.id===id);if(d)return {cat,d};}
  const e=M.EJES.find(x=>'Eje '+x.id===id||x.id===id);if(e)return {cat:'eje',d:{...e,id:e.id,nombre:'Eje '+e.id}};const du=M.DUDAS.find(x=>x.id===id);if(du)return {cat:'duda',d:du};return null;};
const nivelDe=(cat,d)=>d.nivel||(cat==='techo'?'TE':cat==='abertura'?(M.MUROS.find(m=>m.id===d.muro)||{}).nivel:'PB');

function select(id,zoom=true){
  if(id&&id.startsWith('D-')){const du=M.DUDAS.find(x=>x.id===id);if(du){S.sel=du.ref.slice();showDuda(du);const lv=du.ref.map(r=>{const f=findData(r);return f?nivelDe(f.cat,f.d):null;}).filter(Boolean);
      if(lv.length&&!lv.includes(S.nivel)){setNivel(lv[0],true);}applySel();if(zoom&&S.sel.length)zoomTo(S.sel);markDuda(id);return;}}
  markDuda(null);
  if(!id){S.sel=null;applySel();$('sel').innerHTML=INTRO;linkify($('sel'));return;}
  const f=findData(id);if(!f)return;const lv=nivelDe(f.cat,f.d);if(lv&&lv!==S.nivel&&f.cat!=='implantacion'&&f.cat!=='eje')setNivel(lv,true);
  if(f.cat==='implantacion'&&!S.capas.implantacion){S.capas.implantacion=true;syncCapas();build();}
  S.sel=id;applySel();showInfo(f.cat,f.d);if(zoom)zoomTo([id]);}
function zoomTo(ids){const bs=ids.map(i=>REG[i]&&REG[i].bbox).filter(Boolean);if(!bs.length)return;const x0=Math.min(...bs.map(b=>b.x0)),y0=Math.min(...bs.map(b=>b.y0)),x1=Math.max(...bs.map(b=>b.x1)),y1=Math.max(...bs.map(b=>b.y1));
  const b={x0,y0,x1,y1,w:Math.max(300,x1-x0),h:Math.max(300,y1-y0),cx:(x0+x1)/2,cy:(y0+y1)/2};if(b.w/b.h>S.vb.w/S.vb.h*0.9||b.w>S.vb.w*.8||b.h>S.vb.h*.8||b.w<S.vb.w*.15)fit(b,.35);else{S.vb.x=b.cx-S.vb.w/2;S.vb.y=b.cy-S.vb.h/2;applyView();}}

const EST={existente:'Existente',nuevo:'Construido nuevo',proyecto:'Proyecto (no construido)',demoler:'Provisorio / a demoler'};
const CONF={medido:'Medido en obra',modelo:'Del modelo de Onshape',estimado:'Estimado de foto o video',supuesto:'Supuesto: no lo vi, lo deduje'};
function showInfo(cat,d){const b=REG[d.id]&&REG[d.id].bbox;const rows=[];
  const add=(k,v)=>{if(v!=null&&v!=='')rows.push(`<dt>${k}</dt><dd>${v}</dd>`);};
  add('Qué es',CATS[cat]);add('Nivel',(M.NIVELES[nivelDe(cat,d)]||{}).nombre);
  if(cat==='muro'){add('Eje',`(${d.a.join(', ')}) → (${d.b.join(', ')})`);add('Largo',fm(Math.hypot(d.b[0]-d.a[0],d.b[1]-d.a[1]))+' m');add('Espesor',d.e+' cm · '+d.tipo);add('Portante',d.carga?'sí':'no');
    const ab=M.ABERTURAS.filter(a=>a.muro===d.id).map(a=>a.id).join(' · ');if(ab)add('Aberturas',ab);}
  if(cat==='abertura'){add('En el muro',d.muro);add('Posición',`a ${fm(d.d)} m del arranque del muro`);add('Ancho × alto',`${fm(d.w)} × ${fm(d.h)} m`);add('Tipo',d.tipo);}
  if(cat==='local'&&b){add('Medidas',`${fm(b.w)} × ${fm(b.h)} m`);add('Superficie',f1(area(d.poly)/1e4)+' m²');}
  if(cat==='estructura'){add('Tipo',d.tipo);add('Sección',d.sec);if(d.z!=null)add('Nivel inferior','+'+d.z+' cm');if(d.a)add('Largo',fm(Math.hypot(d.b[0]-d.a[0],d.b[1]-d.a[1]))+' m');if(d.pos)add('Posición',`(${d.pos.join(', ')})`);}
  if(cat==='escalera'&&b){add('Tramo',`${fm(b.w)} de ancho · sube hacia ${d.sube==='+y'?'el jardín':'el patio'}`);}
  if(cat==='deck'||cat==='techo'||cat==='implantacion'){if(d.poly){add('Superficie',f1(area(d.poly)/1e4)+' m²');add('Envolvente',`${fm(bboxOf(d.poly).w)} × ${fm(bboxOf(d.poly).h)} m`);}if(d.pend)add('Pendiente',`${d.pend}, baja hacia ${d.baja}`);if(d.mat)add('Material',d.mat);}
  if(cat==='chimenea'&&d.pos)add('Posición',`(${d.pos.join(', ')})`);
  if(cat==='eje'){add('Posición',(d.dir==='v'?'x = ':'y = ')+d.pos+' cm');}
  const dudas=M.DUDAS.filter(x=>x.ref.includes(d.id)).map(x=>x.id).join(' · ');if(dudas)add('Dudas',dudas);
  const al=N.alias(d.id),nt=N.nota(d.id);
  $('sel').innerHTML=`<div class="k">${d.id}</div><h2>${al?al+' <span class="orig">· '+(d.nombre||'')+'</span>':(d.nombre||d.id)}</h2>${nt?`<p class="nota"><b>Tu nota:</b> ${nt}</p>`:''}<div class="badges"><span class="bd e-${d.estado||'existente'}">${EST[d.estado||'existente']}</span><span class="bd c-${d.conf||'estimado'}">${CONF[d.conf||'estimado']}</span></div>
    <dl>${rows.join('')}</dl>${d.nota?`<p class="nota">${d.nota}</p>`:''}<p class="how">Para corregirlo decime, por ejemplo: «<b>${d.id}</b> mide 4,20» o «<b>${d.id}</b> está 60 cm más hacia el patio».</p>${N.editorHTML(d.id)}`;linkify($('sel'));}
function showDuda(du){$('sel').innerHTML=`<div class="k">${du.id} · duda</div><h2>${du.q}</h2>${du.ref.length?`<p class="nota">Elementos que dependen de la respuesta: ${du.ref.join(' · ')}</p>`:''}<p class="how">Respondé por número: «<b>${du.id}</b>: …».</p>`;linkify($('sel'));}
function markDuda(id){PR.querySelectorAll('.duda').forEach(e=>e.classList.toggle('on',e.dataset.id===id));}
const INTRO=`<div class="k">Selección</div><h2>Tocá cualquier cosa del plano</h2><p class="nota">O cualquier código en los textos. Todo lo dibujado tiene código: muros M-xx, puertas P-xx, ventanas V-xx, vanos A-xx, locales L-xx, vigas V-xx, columnas C-xx, escaleras ESC-x, techos T-xx, salamandra SAL-1, objetos a identificar OBJ-x, ejes 1…9 y A…E.</p>`;

/* códigos clickeables en el texto */
function linkify(rootEl){const toks=allIds().sort((a,b)=>b.length-a.length);const re=new RegExp('(^|[^\\w-])('+toks.map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')(?![\\w-])','g');
  const walker=document.createTreeWalker(rootEl,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement.closest('button,select,option,input,h2.noLink,.pt')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  for(const n of nodes){const s=n.nodeValue;re.lastIndex=0;if(!re.test(s))continue;re.lastIndex=0;const frag=document.createDocumentFragment();let last=0,m;
    while((m=re.exec(s))){const st=m.index+m[1].length;frag.appendChild(document.createTextNode(s.slice(last,st)));const b=document.createElement('button');b.className='pt';b.dataset.tok=m[2].replace(/^Eje /,'');b.textContent=m[2];frag.appendChild(b);last=st+m[2].length;}
    frag.appendChild(document.createTextNode(s.slice(last)));n.parentNode.replaceChild(frag,n);}}
document.addEventListener('click',e=>{const b=e.target.closest('.pt');if(b&&PR.contains(b)){e.preventDefault();select(b.dataset.tok);}});

/* ---------- paneles ---------- */
function renderLista(){const groups={};for(const [cat,arr] of [['muro',M.MUROS],['abertura',M.ABERTURAS],['local',M.LOCALES],['estructura',M.ESTRUCTURA],['escalera',M.ESCALERAS],['deck',M.DECK],['techo',M.TECHOS],['chimenea',M.CHIMENEAS],['implantacion',M.IMPLANTACION]])groups[cat]=arr;
  $('pane-lista').innerHTML=Object.entries(groups).map(([cat,arr])=>`<h3>${CATS[cat]} <span class="n">${arr.length}</span></h3>`+arr.map(d=>`<div class="row" tabindex="0" data-id="${d.id}"><span class="sw e-${d.estado||'existente'}"></span><div><div class="t"><b>${d.id}</b> ${N.alias(d.id)||d.nombre||''}</div><div class="s">${(M.NIVELES[nivelDe(cat,d)]||{}).nombre||''}${d.conf==='supuesto'?' · <i>supuesto</i>':''}</div></div></div>`).join('')).join('');
  $('pane-lista').querySelectorAll('.row').forEach(r=>{const go=()=>select(r.dataset.id);r.addEventListener('click',go);r.addEventListener('keydown',e=>{if(e.key==='Enter')go();});});}
function renderDudas(){$('pane-dudas').innerHTML=`<p class="intro">Numeradas para que puedas contestar por código, en el orden que quieras. Tocá una para ver en el plano qué cambia con la respuesta.</p>`+M.DUDAS.map(d=>`<div class="duda" tabindex="0" data-id="${d.id}"><span class="code">${d.id}</span><div>${d.q}${d.ref.length?`<div class="refs">${d.ref.join(' · ')}</div>`:''}</div></div>`).join('');
  $('pane-dudas').querySelectorAll('.duda').forEach(r=>{const go=e=>{if(e.target.closest('.pt'))return;select(r.dataset.id);};r.addEventListener('click',go);r.addEventListener('keydown',e=>{if(e.key==='Enter')go(e);});});linkify($('pane-dudas'));}
function renderCambios(){$('pane-cambios').innerHTML=`<h3>Cómo corregir</h3><ul><li>Por código: «M-03 mide 9,60», «L-05 es baño y L-04 dormitorio», «ESC-1 sube hacia el patio».</li><li>Por duda: «D-01: 23,40 × 7,80».</li><li>Con un croquis: foto de un papel con los ejes y las medidas; los cargo yo.</li><li>Lo que no esté construido lo marco como <span class="bd e-proyecto">proyecto</span>; lo que ya se hizo nuevo, como <span class="bd e-nuevo">nuevo</span>.</li></ul>
    <h3>Qué sigue</h3><ol><li>Vos corregís la planta (esta etapa).</li><li>Alturas y cortes: entrepiso, cumbrera, faldones.</li><li>Modelo 3D con el mismo visor de la escalera: piezas, explosión, cotas por arista.</li><li>Variantes de proyecto sobre lo no construido.</li></ol>
    <h3>Versiones</h3><table><tbody>${M.CAMBIOS.map(c=>`<tr><td class="n">${c.fecha}</td><td class="n">v${c.v}</td><td>${c.txt}</td></tr>`).join('')}</tbody></table>`;linkify($('pane-cambios'));}
function renderLeyenda(){$('pane-leyenda').innerHTML=`<h3>Estado</h3><div class="leg"><span class="sw e-existente"></span>Existente<span class="sw e-nuevo"></span>Construido nuevo<span class="sw e-proyecto"></span>Proyecto, no construido<span class="sw e-demoler"></span>Provisorio o a demoler</div>
  <h3>Confianza</h3><div class="leg"><span class="swl c-modelo"></span>Del modelo de Onshape (línea llena)<span class="swl c-estimado"></span>Estimado de foto o video (línea llena)<span class="swl c-supuesto"></span>Supuesto, no lo vi (línea de puntos)<span class="swl c-medido"></span>Medido en obra (línea gruesa)</div>
  <h3>Calco</h3><p>La capa «Calco GLB» dibuja en gris el corte horizontal del modelo de Onshape a 1,2 m (PB), 4,0 m (EP) y 4,6 m (TE). Si un muro mío no coincide con el calco, el calco tiene razón.</p>
  <h3>Sistema de ejes</h3><p>X corre a lo largo de la cumbrera, desde la fachada del extremo A (eje 1) hacia el extremo B. Y corre a lo ancho: 0 en la cara exterior de la pared del patio, creciendo hacia el jardín. Coordenadas y espesores en cm; medidas en el panel en metros.</p>
  <h3>Niveles</h3><p><b>PB</b> planta baja · <b>EP</b> entrepiso (los muros de PB quedan en gris) · <b>TE</b> techos, con la flecha hacia donde baja cada faldón.</p>`;}

/* niveles, capas, pestañas */
function setNivel(n,quiet){S.nivel=n;document.querySelectorAll('[data-nivel]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.nivel===n));persist();build();if(!quiet)select(null);}
document.querySelectorAll('[data-nivel]').forEach(b=>b.addEventListener('click',()=>setNivel(b.dataset.nivel)));
function syncCapas(){document.querySelectorAll('[data-capa]').forEach(c=>{c.checked=!!S.capas[c.dataset.capa];});}
document.querySelectorAll('[data-capa]').forEach(c=>c.addEventListener('change',()=>{S.capas[c.dataset.capa]=c.checked;persist();build();}));
PR.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{PR.querySelectorAll('.tab').forEach(x=>x.setAttribute('aria-selected',x===t?'true':'false'));PR.querySelectorAll('.pane').forEach(p=>p.hidden=p.id!=='pane-'+t.dataset.tab);}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){select(null);if(S.measure){S.mpts=[];drawMeasure();}}});

/* arranque */
$('spec').innerHTML=`<span>v<b>${M.META.version}</b> · ${M.META.fecha}</span><span>casa <b>25,2 × 7,0</b> + ala <b>6,0 × 8,0</b></span><span>entrepiso <b>${f1(area(M.LOCALES.find(l=>l.id==='L-21').poly)/1e4+area(M.LOCALES.find(l=>l.id==='L-20').poly)/1e4)} m²</b></span><span>${M.DUDAS.length} dudas abiertas</span><span>cotas en m · modelo en cm</span>`;
syncCapas();document.querySelectorAll('[data-nivel]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.nivel===S.nivel));
renderLista();renderDudas();renderCambios();renderLeyenda();renderVideo($('pane-video'));linkify($('pane-video'));$('sel').innerHTML=INTRO;linkify($('sel'));
/* ── Dibujar en la planta: polilíneas K-xx en el nivel visible, guardadas en la colección «marcas» (las mismas que el 3D) ── */
const PM=(()=>{const H={PB:5,EP:265,TE:520};let db=null,MK=[],cur=null,on=false;const col=['#e2462b','#1f6fd1','#1c9a5a','#c98a00','#8a3fd1'];
  try{MK=JSON.parse(localStorage.getItem('carhue-marcas')||'[]');}catch(e){}
  const f2=v=>(v/100).toFixed(2).replace('.',',');
  const tb=$('medir');const bt=document.createElement('button');bt.className='btn';bt.id='dibujar';bt.textContent='✎ Dibujar';bt.setAttribute('aria-pressed','false');tb.parentNode.insertBefore(bt,tb);
  const P=document.createElement('div');P.id='pmPanel';P.hidden=true;svg.parentNode.appendChild(P);
  P.innerHTML=`<div class="mh"><b>Dibujar en la planta</b><span class="mx" id="pmX">×</span></div><div class="mhint" id="pmHint"></div>
   <div class="mrow"><label>ajuste <select id="pmSnap"><option value="1">1 cm</option><option value="5" selected>5 cm</option><option value="10">10 cm</option><option value="25">25 cm</option></select></label><span class="s">Shift: a 90°</span></div>
   <div class="mrow"><input type="text" id="pmNota" placeholder="nota (opcional): «pared nueva», «escalera acá»…" maxlength="300"></div>
   <div class="mrow"><button class="btn" id="pmFin">Terminar</button><button class="btn" id="pmUndo">Deshacer punto</button><button class="btn" id="pmNo">Descartar</button></div>
   <div class="mlist" id="pmList"></div><div class="mmsg" id="pmMsg"></div>`;
  const q=id=>P.querySelector('#'+id);
  const setOn=v=>{on=v;P.hidden=!v;bt.setAttribute('aria-pressed',v);svg.classList.toggle('measuring',v);if(v&&S.measure)$('medir').click();if(!v)cur=null;draw();};
  bt.addEventListener('click',()=>setOn(!on));q('pmX').addEventListener('click',()=>setOn(false));
  q('pmFin').addEventListener('click',()=>fin());q('pmNo').addEventListener('click',()=>{cur=null;draw();});q('pmUndo').addEventListener('click',()=>{if(cur){cur.pts.pop();if(!cur.pts.length)cur=null;draw();}});
  document.addEventListener('keydown',e=>{if(!on||e.target.tagName==='INPUT')return;if(e.key==='Enter')fin();if(e.key==='Escape'){cur=null;draw();}});
  const nextId=()=>{let n=1;const u=new Set(MK.map(m=>m.id));while(u.has('K-'+String(n).padStart(2,'0')))n++;return 'K-'+String(n).padStart(2,'0');};
  function click(p,shift){const sn=+q('pmSnap').value;let [x,y]=p.map(v=>Math.round(v/sn)*sn);
    if(!cur)cur={id:nextId(),tipo:'plano',nivel:S.nivel,pts:[],color:col[MK.length%col.length]};
    const l=cur.pts.at(-1);if(shift&&l){if(Math.abs(x-l[0])>Math.abs(y-l[2]))y=l[2];else x=l[0];}
    cur.pts.push([x,H[S.nivel]||5,y]);draw();}
  async function fin(){if(!cur||!cur.pts.length){cur=null;draw();return;}const c=cur;cur=null;c.nota=(q('pmNota').value||'').trim();c.ts=new Date().toISOString();c.piezas=[];MK.push(c);q('pmNota').value='';
    const {id,...body}=c;body.pts=c.pts.map(p=>({x:p[0],h:p[1],y:p[2]}));let msg='Guardada en este navegador.';
    if(db){try{await db.doc('marcas/'+id).set(body);msg=id+' guardada: la puedo leer.';}catch(e){msg='Guardada solo en este navegador.';}}
    try{localStorage.setItem('carhue-marcas',JSON.stringify(MK));}catch(e){}q('pmMsg').textContent=msg;draw();}
  async function del(id){MK=MK.filter(m=>m.id!==id);if(db)try{await db.doc('marcas/'+id).delete();}catch(e){}try{localStorage.setItem('carhue-marcas',JSON.stringify(MK));}catch(e){}draw();}
  function drawOne(m,live){const vis=(m.nivel||'PB')===S.nivel||m.tipo!=='plano';const g=el('g',{class:'pm'+(vis?'':' pmfar')},L.marcas);const P2=m.pts.map(p=>[p[0],p[2]]);
    if(P2.length>1)el('polyline',{points:P2.map(p=>p.join(',')).join(' '),style:`stroke:${m.color}`,class:'pml'},g);
    for(const p of P2)el('circle',{cx:p[0],cy:p[1],r:6,style:`fill:${m.color}`,class:'pmp'},g);
    for(let i=0;i<P2.length-1;i++){const a=P2[i],b=P2[i+1],d=Math.hypot(b[0]-a[0],b[1]-a[1]);if(d<30)continue;const t=el('text',{x:(a[0]+b[0])/2,y:(a[1]+b[1])/2-8,class:'pmd','text-anchor':'middle'},g);t.textContent=f2(d);}
    if(P2.length){const a=P2.at(-1);const t=el('text',{x:a[0]+10,y:a[1]-10,class:'pmid',style:`fill:${m.color}`},g);t.textContent=live?'…':m.id+(m.tipo==='plano'?'':' (3D)');}}
  function draw(){if(!L.marcas)return;L.marcas.replaceChildren();for(const m of MK)drawOne(m,false);if(cur)drawOne(cur,true);
    q('pmHint').textContent=cur?`${cur.id} en ${cur.nivel}: ${cur.pts.length} punto(s). Enter o «Terminar» para cerrarla.`:`Tocá el plano para poner puntos en el nivel ${S.nivel}. Cada toque agrega un vértice; Enter cierra la línea. Arrastrar mueve el plano sin dibujar.`;
    q('pmList').innerHTML=MK.length?MK.map(m=>`<div class="mitem"><span class="sw" style="background:${m.color}"></span><b>${m.id}</b> <span class="s">${m.tipo==='plano'?(m.nivel||'PB'):'3D'} · ${m.pts.length} pto${m.nota?' · '+m.nota.replace(/</g,'&lt;'):''}</span><button class="btn mini" data-pmdel="${m.id}">×</button></div>`).join(''):'<p class="s">Sin marcas todavía.</p>';
    q('pmList').querySelectorAll('[data-pmdel]').forEach(b=>b.addEventListener('click',()=>del(b.dataset.pmdel)));}
  N.getDb().then(d=>{db=d;if(!d)return;d.collection('marcas').onSnapshot(snap=>{const R=[];snap.docs.forEach(x=>{if(!x.exists)return;const b=x.data();R.push({id:x.id,...b,pts:(b.pts||[]).map(p=>Array.isArray(p)?p:[p.x,p.h,p.y])});});const ids=new Set(R.map(r=>r.id));MK=[...R,...MK.filter(m=>!ids.has(m.id))].sort((a,b)=>a.id.localeCompare(b.id));draw();},()=>{});});
  return {get on(){return on;},click,draw};})();
{const _b=build;build=function(...a){const r=_b.apply(this,a);try{PM.draw();}catch(e){}return r;};}
build();fit(HOUSE,.04);
N.bindEditor(PR,()=>{});
ED.onChange(()=>{build();renderLista();});
N.onChange(()=>{build();renderLista();if(typeof S.sel==='string'){const f=findData(S.sel);if(f&&f.cat!=='duda')showInfo(f.cat,f.d);}});
window.__ok=true;
