/* Inspector (Maxi 14/10, rehecho entero): barra a la derecha, angosta y de letra chica con dos partes y nada repetido de otros paneles.
   · Selección: qué es la pieza elegida (código, nombre, tipo, medidas, sección, caja y posición), su función y tu nota; renombrar, esconder, encuadrar.
   · Outliner: todas las piezas por grupo, con buscador, ojito para mostrar/esconder (pieza o grupo entero), doble clic para renombrar.
   Los nombres y notas van a la base del artifact (los mismos alias de siempre). Reemplaza a la barra lateral. */
import * as N from './nombres.js';
export function initInspector(visor){
  const M3=document.getElementById('modo-3d');if(!M3)return;const stage=M3.querySelector('.stage'),aside=M3.querySelector('aside');
  const css=document.createElement('style');css.textContent=`#modo-3d.sinaside{grid-template-columns:minmax(0,1fr) 0 0!important}#modo-3d.sinaside .gutter,#modo-3d.sinaside>aside,#modo-3d.sinaside aside{display:none!important}
#modo-3d.sinaside .bottombar{grid-column:1/-1;border-radius:0 0 4px 4px}#modo-3d.sinaside .stage{border-radius:4px 4px 0 0}
#modo-3d.sinaside.inspon{grid-template-columns:minmax(0,1fr) 0 216px!important}#modo-3d.sinaside.inspon .stage{border-radius:4px 0 0 0}#modo-3d.sinaside.inspon .bottombar{grid-column:1;border-radius:0 0 0 4px}#insp #varCard{font-size:10.5px;margin:5px 6px;padding:5px 6px}#insp #varCard select{font-size:10.5px}#insp #varCard .vzh b{font-size:11px}
#insp{grid-column:3;grid-row:1/3;min-height:0;display:flex;flex-direction:column;background:var(--panel);border:1px solid var(--rule);border-left:0;border-radius:0 4px 4px 0;font-size:10.5px;overflow:hidden}
#insp .ih{display:flex;align-items:center;gap:2px;padding:3px 3px 3px 8px;border-bottom:1px solid var(--rule);user-select:none;flex:none}
#insp .ih b{flex:1;font:600 10px var(--f-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
#insp .ib{background:none;border:0;cursor:pointer;color:var(--muted);padding:2px 5px;border-radius:3px;font-size:12px;line-height:16px}#insp .ib:hover{background:var(--accent-soft);color:var(--ink,inherit)}
#insp .sel{padding:6px 8px;border-bottom:1px solid var(--rule);flex:none;max-height:46%;overflow:auto}
#insp .st{display:flex;align-items:center;gap:6px}#insp .chip{font:600 10px var(--f-mono);background:var(--accent-soft);color:var(--accent,#c0461f);padding:1px 6px;border-radius:3px;flex:none}
#insp .nm{flex:1;min-width:0;font-weight:600;font-size:11.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#insp .nm input{width:100%;font:inherit;padding:1px 3px}
#insp dl{display:grid;grid-template-columns:50px 1fr;gap:2px 6px;margin:6px 0 0}#insp dt{color:var(--muted);font-size:10px}#insp dd{margin:0;font-size:10.5px;min-width:0;overflow-wrap:anywhere}
#insp .fn{margin-top:6px;font-size:10px;line-height:1.4;color:var(--muted)}#insp .fn.cut{max-height:3.2em;overflow:hidden;cursor:pointer}
#insp textarea{width:100%;box-sizing:border-box;margin-top:5px;font:10.5px inherit;min-height:34px;resize:vertical;padding:3px 5px}
#insp .acts{display:flex;gap:4px;margin-top:6px}#insp .acts .ib{border:1px solid var(--rule);font-size:10px;padding:1px 4px}
#insp .ol{display:flex;flex-direction:column;min-height:120px;flex:1 1 auto}#insp .os{padding:6px 8px;border-bottom:1px solid var(--rule);flex:none}#insp .os input{width:100%;box-sizing:border-box;padding:2px 5px;font-size:10.5px}
#insp .tree{overflow:auto;flex:1 1 auto;padding:2px 0 6px}#insp .g{display:flex;align-items:center;gap:4px;padding:4px 6px 2px;font:600 10px var(--f-mono);letter-spacing:.05em;text-transform:uppercase;color:var(--muted);cursor:pointer;position:sticky;top:0;background:var(--panel)}
#insp .r{display:flex;align-items:center;gap:4px;padding:0 4px 0 6px;cursor:pointer;white-space:nowrap}#insp .r:hover{background:var(--accent-soft)}#insp .r.on{background:var(--accent-soft);box-shadow:inset 2px 0 0 var(--accent,#c0461f)}
#insp .r.off .rn,#insp .r.off .rid{opacity:.4}#insp .rid{font:9.5px var(--f-mono);color:var(--muted);flex:none;min-width:46px}#insp .rn{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis}#insp .rn input{width:100%;font:inherit;padding:0 3px}
#insp .eye{flex:none;width:18px;text-align:center;color:var(--muted);opacity:.75}#insp .eye:hover{opacity:1}#insp .r.off .eye{opacity:.35}#insp .cnt{margin-left:auto;font-weight:400}`;
  document.head.appendChild(css);M3.classList.add('sinaside');M3.classList.remove('noaside','flotaside');
  const E='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  const EO='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.9 4.2A10 10 0 0 1 12 4c6.5 0 10 8 10 8a17 17 0 0 1-2.2 3.2M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="m2 2 20 20"/></svg>';
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const txt=h=>{const d=document.createElement('div');d.innerHTML=h||'';return d.textContent||'';};
  const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
  const el=document.createElement('div');el.id='insp';M3.appendChild(el);
  el.innerHTML=`<div class="ih"><b>Inspector</b><button class="ib" data-a="fold" title="Plegar el outliner">▾</button><button class="ib" data-a="x" title="Cerrar">×</button></div><div class="sel" hidden></div><div class="ol"><div class="os"><input type="search" placeholder="Buscar pieza (código o nombre)…"></div><div class="tree"></div></div>`;
  const selEl=el.querySelector('.sel'),tree=el.querySelector('.tree'),q=el.querySelector('.os input'),ol=el.querySelector('.ol');
  /* opciones de diseño (tarjeta de variantes de la barra): vive dentro del inspector, debajo de la selección; al aparecer abre el inspector */
  /* opciones de diseño: sección propia de la barra (sidebar.js) */
  
  let abierto=LS.get('carhue-insp-on',false);const cerr=LS.get('carhue-insp-grp',{});let olFold=LS.get('carhue-insp-olfold',false);
  const show=v=>{abierto=v;LS.set('carhue-insp-on',v);pintar(true);window.__side&&window.__side.sync();};
  const T=document.getElementById('asideTg');if(T){const T2=T.cloneNode(true);T.replaceWith(T2);T2.title='Inspector y outliner';T2.addEventListener('click',()=>show(!abierto));}
  const foldOl=()=>{ol.style.display=olFold?'none':'flex';el.querySelector('[data-a="fold"]').textContent=olFold?'▸':'▾';};foldOl();

  /* ---------- datos ---------- */
  const byId=()=>{const m={};for(const p of visor.parts||[])m[p.id]=p;return m;};
  const nombre=p=>{const al=N.alias(p.id);if(al)return al;return (p.name||'').replace(/^[A-Za-z0-9-]+\s*·\s*/,'')||p.id;};
  const CAT={muro:'muro',ladrillo:'ladrillo',tabique:'tabique',glass:'vidrio',madera:'madera',roble:'roble',acero:'acero',techo:'techo',chapa:'chapa',cabio:'cabio',ep:'entrepiso',piso:'piso',deck:'deck',agua:'agua',pileta:'pileta',corteza:'árbol'};
  const f2=v=>(v/100).toFixed(2).replace('.',',');
  let ren=null,fnOpen=false;
  function pintarSel(){const id=visor.selected,p=id&&byId()[id];if(!p){selEl.hidden=true;return;}selEl.hidden=false;const i=p.info||{};const bb=p.bb;let caja='',posi='';
    if(bb&&!bb.isEmpty()){caja=`${f2(bb.max.x-bb.min.x)} × ${f2(bb.max.z-bb.min.z)} × ${f2(bb.max.y-bb.min.y)} m`;posi=`x ${f2(bb.min.x)}…${f2(bb.max.x)} · y ${f2(bb.min.z)}…${f2(bb.max.z)} · z ${f2(bb.min.y)}…${f2(bb.max.y)}`;}
    const oculto=visor.isHidden(id);const fn=txt(i.fn).replace(/^Tu nota:.*?(?=[A-ZÁÉÍÓÚ¿])/,'').trim();
    selEl.innerHTML=`<div class="st"><span class="chip">${esc(p.id)}</span><span class="nm" title="Doble clic para renombrar">${ren===p.id?`<input value="${esc(N.alias(p.id)||nombre(p))}">`:esc(nombre(p))}</span><button class="ib" data-a="ren" title="Renombrar">✎</button></div>
      <dl><dt>Tipo</dt><dd>${esc(CAT[p.cat]||p.cat||'—')}${p.group?` · ${esc(p.group)}`:''}</dd>${i.med?`<dt>Medidas</dt><dd>${esc(txt(i.med))}</dd>`:''}${i.sec?`<dt>Sección</dt><dd>${esc(txt(i.sec))}</dd>`:''}${caja?`<dt>Caja</dt><dd>${caja}</dd><dt>Posición</dt><dd style="font-size:11px">${posi}</dd>`:''}</dl>
      ${fn?`<div class="fn${fnOpen?'':' cut'}" data-a="fn" title="${fnOpen?'':'Ver todo'}">${esc(fn)}</div>`:''}
      <textarea placeholder="Tu nota sobre ${esc(p.id)}…" data-nota>${esc(N.nota(p.id))}</textarea>
      ${visor.borrarPieza?`<div class="acts"><button class="ib" data-a="del" title="Se puede deshacer (Ctrl/⌘ Z)">Borrar pieza</button>${visor.parteTocada&&visor.parteTocada(p.id)?`<button class="ib" data-a="delp" title="Sólo la parte que tocaste (se puede deshacer)">Borrar sólo esta parte</button>`:''}</div>`:''}
      <div class="acts"><button class="ib" data-a="eye">${oculto?EO+' Mostrar':E+' Esconder'}</button><button class="ib" data-a="fit" title="Encuadrar (F)">◎ Encuadrar</button><span style="flex:1"></span><button class="ib" data-a="desel" title="Soltar la selección (Esc)">✕</button></div>`;
    const inp=selEl.querySelector('.nm input');if(inp){inp.focus();inp.select();}}
  function pintarTree(){const f=(q.value||'').trim().toLowerCase();const G=new Map();
    for(const p of visor.parts||[]){if(!p.geos&&!p.grp)continue;const g=p.group||'Otros';const nm=nombre(p);if(f&&!(p.id.toLowerCase().includes(f)||nm.toLowerCase().includes(f)))continue;if(!G.has(g))G.set(g,[]);G.get(g).push(p);}
    const sel=visor.selected;let h='';
    for(const [g,L] of G){const off=L.every(p=>visor.isHidden(p.id)),c=!f&&cerr[g];
      h+=`<div class="g" data-g="${esc(g)}"><span>${c?'▸':'▾'}</span><span class="eye" data-ge="${esc(g)}" title="${off?'Mostrar':'Esconder'} el grupo">${off?EO:E}</span>${esc(g)}<span class="cnt">${L.length}</span></div>`;
      if(c)continue;for(const p of L){const hid=visor.isHidden(p.id);h+=`<div class="r${p.id===sel?' on':''}${hid?' off':''}" data-id="${esc(p.id)}"><span class="eye" data-e="${esc(p.id)}" title="${hid?'Mostrar':'Esconder'}">${hid?EO:E}</span><span class="rid">${esc(p.id)}</span><span class="rn">${ren===p.id?`<input value="${esc(N.alias(p.id)||nombre(p))}">`:esc(nombre(p))}</span></div>`;}}
    tree.innerHTML=h||'<div style="padding:8px 10px;color:var(--muted)">Nada con ese nombre.</div>';
    const inp=tree.querySelector('.rn input');if(inp){inp.focus();inp.select();}}
  function pintar(scroll){pintarSel();if(!abierto)return;pintarTree();if(scroll){const r=tree.querySelector('.r.on');if(r)r.scrollIntoView({block:'nearest'});}}

  /* ---------- acciones ---------- */
  async function renombrar(id,v){ren=null;const p=byId()[id];if(p&&v!=null){const base=(p.name||'').replace(/^[A-Za-z0-9-]+\s*·\s*/,'');const al=v.trim()===base?'':v.trim();const r=await N.guardar(id,{alias:al,nota:N.nota(id)});if(r&&!r.ok&&r.motivo)hint(r.motivo);}pintar();}
  function hint(t){const st=document.getElementById('stTool');if(st)st.textContent=t;}
  function fit(id){const p=byId()[id];if(!p||!p.bb)return;const T3=visor.THREE;const c=p.bb.getCenter(new T3.Vector3()),r=Math.max(60,p.bb.getSize(new T3.Vector3()).length()*.5);const d=visor.camera.position.clone().sub(visor.controls.target).normalize();visor.fly(c.clone().addScaledVector(d,r*2.2).toArray(),c.toArray());}
  el.addEventListener('click',e=>{const a=e.target.closest('[data-a]');const id=visor.selected;
    if(a){const k=a.dataset.a;if(k==='x')return show(false);if(k==='fold'){olFold=!olFold;LS.set('carhue-insp-olfold',olFold);foldOl();return;}
      if(k==='ren'){ren=id;pintar();return;}if(k==='fn'){fnOpen=!fnOpen;pintarSel();return;}if(k==='eye'&&id){visor.toggleHidden(id,!visor.isHidden(id));pintar();return;}
      if(k==='del'&&id&&visor.borrarPieza){visor.borrarPieza(id);return;}if(k==='delp'&&id&&visor.borrarParte){visor.borrarParte(id);return;}
      if(k==='fit'&&id)return fit(id);if(k==='desel'){visor.resetSel();pintar();return;}}
    const ge=e.target.closest('[data-ge]');if(ge){const g=ge.dataset.ge;const L=(visor.parts||[]).filter(p=>(p.group||'Otros')===g);const off=L.every(p=>visor.isHidden(p.id));const H=new Set(visor.hidden);for(const p of L){if(off)H.delete(p.id);else H.add(p.id);}visor.setHidden([...H]);pintar();return;}
    const ey=e.target.closest('[data-e]');if(ey){const i=ey.dataset.e;visor.toggleHidden(i,!visor.isHidden(i));pintar();return;}
    const g=e.target.closest('.g');if(g){cerr[g.dataset.g]=!cerr[g.dataset.g];LS.set('carhue-insp-grp',cerr);pintarTree();return;}
    const r=e.target.closest('.r');if(r&&!e.target.closest('input')){visor.showPart(r.dataset.id);pintar();}});
  el.addEventListener('dblclick',e=>{const r=e.target.closest('.r');if(r){ren=r.dataset.id;pintarTree();return;}if(e.target.closest('.nm')){ren=visor.selected;pintarSel();}});
  el.addEventListener('keydown',e=>{e.stopPropagation();const t=e.target;if(t.matches('.rn input,.nm input')){if(e.key==='Enter')renombrar(ren,t.value);if(e.key==='Escape'){ren=null;pintar();}}});
  el.addEventListener('focusout',e=>{const t=e.target;if(t.matches('.rn input,.nm input')&&ren)renombrar(ren,t.value);if(t.matches('[data-nota]')){const id=visor.selected;if(id&&t.value!==N.nota(id))N.guardar(id,{alias:N.alias(id),nota:t.value});}});
  q.addEventListener('input',()=>pintarTree());
  /* ---------- seguir cambios: selección, piezas, escondidas, nombres ---------- */
  let lastSel=null,lastParts=null,lastHid='';
  setInterval(()=>{const s=visor.selected,h=visor.hidden.join(',');if(s!==lastSel){lastSel=s;if(!ren)pintar(true);window.__side&&window.__side.sync();}else if(visor.parts!==lastParts||h!==lastHid){if(!ren&&!el.contains(document.activeElement))pintar();}lastParts=visor.parts;lastHid=h;},250);
  N.onChange(()=>{if(!ren&&!el.contains(document.activeElement))pintar();});
  setTimeout(()=>dispatchEvent(new Event('resize')),50);
  show(abierto);
  visor.inspector={show,get abierto(){return abierto;}};
}
