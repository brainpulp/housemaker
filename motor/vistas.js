/* Vistas y cortes, iguales en todas las casas (Maxi 20/10: «eso debe ser del motor y el motor debe ser el mismo para ambos proyectos, SIEMPRE»).
   · Seis cortes ajustables, dos por eje (X sur→norte, Y oeste→este, Z altura), más el corte horizontal por nivel (parámetro «corte» de la casa).
   · Vistas: fijas (las del visor), ambientes (cada local aislado con sus seis cortes y una cámara desde arriba en diagonal) y guardadas.
     Todas son entradas de la colección «vistas» de la base del artifact: se siembran una vez y después se actualizan, se editan sus cortes o se borran.
     Si movés un corte mientras estás en una vista, queda guardado en ella.
   Uso desde la casa (antes de initToolbar, que muda los cortes a su panel):
     const VI = initVistas(visor, { M, root, pref: 'arcos', rango: { x: [-100, 950], y: [-50, 4600], z: [-250, 1100] }, caja: L => ({...}), params: ['techos', ...] });
     VI.applyClips() después de reconstruir si hace falta. */
import * as N from './nombres.js';

export function initVistas(visor, { M, root, pref = 'casa', rango = {}, caja = null, ambDef = {}, params = ['techos'], dirAmb = [-.45, .95], alAplicar = null } = {}) {
  const $ = id => document.getElementById(id);
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const [x0, x1] = rango.x || [-100, 4700], [y0, y1] = rango.y || [-1000, 2000], [z0, z1] = rango.z || [-100, 900];

  /* ---------- seis cortes ---------- */
  const C6 = [['xmin', 'X desde', 'x', 1, x0, x1, x0], ['xmax', 'X hasta', 'x', -1, x0, x1, x1], ['ymin', 'Y desde', 'z', 1, y0, y1, y0], ['ymax', 'Y hasta', 'z', -1, y0, y1, y1], ['zmin', 'Z desde', 'y', 1, z0, z1, z0], ['zmax', 'Z hasta', 'y', -1, z0, z1, z1]]
    .map(([k, n, axis, side, mn, mx, v]) => ({ k, n, axis, side, mn, mx, v, on: false }));
  const CL = Object.fromEntries(C6.map(c => [c.k, c]));
  { const bb = document.querySelector('#modo-3d .bottombar'), sp = document.createElement('span'); sp.className = 'clip clip6';
    sp.innerHTML = C6.map(c => `<div class="c6r"><label><input type="checkbox" data-c6on="${c.k}"> ${c.n}</label><input type="range" data-c6v="${c.k}" min="${c.mn}" max="${c.mx}" step="5" value="${c.v}"><span class="clipv" data-c6l="${c.k}"></span></div>`).join('') +
      '<div class="c6r"><button class="btn mini" data-c6all="0">Sin cortes</button></div><div id="c6vista" style="font-size:10.5px;color:var(--muted);line-height:1.35;margin-top:3px"></div>';
    const st = document.createElement('style'); st.textContent = '.clip6{display:flex;flex-direction:column;gap:3px}.c6r{display:flex;align-items:center;gap:5px}.c6r label{width:62px;flex:none;white-space:nowrap}.c6r input[type=range]{flex:1;min-width:60px}.c6r .clipv{width:46px;text-align:right;font-variant-numeric:tabular-nums}'; document.head.appendChild(st);
    if (bb) bb.appendChild(sp);
    sp.addEventListener('input', e => { const k = e.target.dataset.c6v; if (k) { CL[k].v = +e.target.value; CL[k].on = true; syncC6(); applyClips(); guardarCortesVista(); } });
    sp.addEventListener('change', e => { const k = e.target.dataset.c6on; if (k) { CL[k].on = e.target.checked; applyClips(); guardarCortesVista(); } });
    sp.addEventListener('click', e => { if (e.target.closest('[data-c6rest]')) { e.preventDefault(); restablecerCortesVista(); return; }
      if (e.target.closest('[data-c6all]')) { C6.forEach(c => c.on = false); setTimeout(guardarCortesVista, 0); corteNivel('0'); syncC6(); applyClips(); } }); }
  function syncC6() { for (const c of C6) { const a = document.querySelector(`[data-c6on="${c.k}"]`), b = document.querySelector(`[data-c6v="${c.k}"]`), l = document.querySelector(`[data-c6l="${c.k}"]`);
    if (a) a.checked = c.on; if (b) b.value = c.v; if (l) l.textContent = (c.v / 100).toFixed(2).replace('.', ','); } }
  function applyClips() { const list = []; const h = +visor.params.corte; if (h) list.push({ axis: 'y', value: h, side: -1 });
    for (const c of C6) if (c.on) list.push({ axis: c.axis, value: c.v, side: c.side }); syncC6(); visor.setClips(list); window.__despertar && window.__despertar(); }
  const corteNivel = v => { if (visor.params.corte == null) return; visor.params.corte = v; ['q-corte', 'v-corte'].forEach(id => { const el = $(id); if (el) el.value = v; }); };
  if (root) root.addEventListener('change', e => { if (e.target.id === 'q-corte' || e.target.id === 'v-corte') applyClips(); });
  syncC6();

  /* ---------- cortes de cada ambiente ---------- */
  const NZ = Object.values(M.NIVELES || {}).map(n => n && n.z).filter(z => typeof z === 'number');
  function cajaDef(L) { if (ambDef[L.id]) return { ...ambDef[L.id] }; if (caja) { const c = caja(L); if (c) return c; }
    const xs = L.poly.map(q => q[0]), ys = L.poly.map(q => q[1]), f = (M.NIVELES[L.nivel] || {}).z ?? 0, m = 25, sig = NZ.filter(z => z > f + 50).sort((a, b) => a - b)[0];
    return { xmin: Math.min(...xs) - m, xmax: Math.max(...xs) + m, ymin: Math.min(...ys) - m, ymax: Math.max(...ys) + m, zmin: f - 25, zmax: Math.min(f + 235, sig != null ? sig - 22 : f + 235) }; }
  let CORTES_V = LS.get(pref + '-cortes-vistas', {}); /* versión vieja de Carhué: cortes por vista guardados aparte */
  function cortesDef(vid) { if (vid.startsWith('__amb:')) { const L = M.LOCALES.find(l => l.id === vid.slice(6)); return L && L.poly ? cajaDef(L) : {}; } return {}; }
  function ponerCortes(cs) { for (const c of C6) { c.on = cs[c.k] != null; if (c.on) c.v = Math.round(cs[c.k] / 5) * 5; } applyClips(); }
  const volarA = (cs, L) => { const a = cs.xmin ?? 0, b = cs.xmax ?? 0, c = cs.ymin ?? 0, d = cs.ymax ?? 0, f = (cs.zmin ?? (((M.NIVELES[L && L.nivel] || {}).z ?? 0) - 25)) + 25;
    const cx = (a + b) / 2, cy = (c + d) / 2, R = Math.max(b - a, d - c, 300); visor.fly([cx + R * dirAmb[0], f + R * .95 + 180, cy + R * dirAmb[1]], [cx, f + 60, cy]); };

  /* ---------- vistas ---------- */
  let VISTAS = LS.get(pref + '-vistas', []), vdb = null, curVista = null, cvT = 0, sembrando = false;
  const persistLocal = () => LS.set(pref + '-vistas', VISTAS);
  const GORD = { fijas: 0, ambientes: 1, guardadas: 2 };
  const ordenVistas = L => [...L].sort((a, b) => (GORD[a.grupo || 'guardadas'] - GORD[b.grupo || 'guardadas']) || ((a.ord ?? 999) - (b.ord ?? 999)) || (a.ts || '').localeCompare(b.ts || ''));
  const escribirDb = v => { if (vdb) try { const { id: _i, ...body } = v; return vdb.doc('vistas/' + v.id).set(body); } catch (e) {} return Promise.resolve(); };
  function guardarCortesVista() { if (!curVista) return; const v = VISTAS.find(x => x.id === curVista); if (!v) return;
    v.c6 = Object.fromEntries(C6.filter(c => c.on).map(c => [c.k, c.v])); v.ts2 = new Date().toISOString(); persistLocal(); clearTimeout(cvT); cvT = setTimeout(() => escribirDb(v), 600); pintarCV(); }
  function restablecerCortesVista() { if (!curVista) return; const v = VISTAS.find(x => x.id === curVista); if (!v) return; v.c6 = v.amb ? cortesDef('__amb:' + v.amb) : {}; persistLocal(); escribirDb(v); ponerCortes(v.c6); pintarCV(); }
  function pintarCV() { const el = $('c6vista'); if (!el) return; const v = curVista && VISTAS.find(x => x.id === curVista);
    el.innerHTML = v ? `Cortes de la vista <b>${esc(v.nombre)}</b>: lo que muevas queda guardado en ella${v.amb ? ' · <a href="#" data-c6rest>volver a los del ambiente</a>' : ' · <a href="#" data-c6rest>sin cortes</a>'}` : 'Ninguna vista elegida: estos cortes no se guardan (elegí una vista o guardá la actual).'; }
  const snapshot = () => ({ cam: visor.getView(), corte: visor.params.corte, c6: Object.fromEntries(C6.filter(c => c.on).map(c => [c.k, c.v])), hidden: visor.hidden, params: Object.fromEntries(params.map(k => [k, visor.params[k]])) });
  function applyParams(pp) { const o = {}; for (const k of params) if (pp && pp[k] != null && visor.params[k] !== pp[k]) o[k] = pp[k]; if (Object.keys(o).length) visor.setParams(o); }
  function applySnapshot(v) { applyParams(v.params); corteNivel(v.corte || '0'); for (const c of C6) c.on = false;
    if (v.c6) for (const [k, val] of Object.entries(v.c6)) if (CL[k]) { CL[k].on = true; CL[k].v = val; }
    /* vistas viejas con cortes X / Y de un lado */ for (const [o, ax] of [['cx', 'x'], ['cy', 'y']]) { const q = v[o]; if (q) { const c = CL[ax + (q.side > 0 ? 'min' : 'max')]; c.on = true; c.v = q.v; } }
    applyClips(); alAplicar && alAplicar(); visor.setHidden(v.hidden || []); if (v.cam) visor.fly(v.cam.p, v.cam.t); renderVistas(); }
  function aplicarEntrada(v) { curVista = v.id;
    if (!v.cam && v.amb) { const L = M.LOCALES.find(l => l.id === v.amb); if (v.params) applyParams(v.params); else if (visor.params.techos !== false) visor.setParams({ techos: false });
      corteNivel('0'); const cs = v.c6 || cortesDef('__amb:' + v.amb); ponerCortes(cs); alAplicar && alAplicar(); volarA(cs, L); }
    else if (!v.cam && v.preset) { const b = document.querySelector(`#viewbar [data-view="${v.preset}"]`); if (b) b.click(); if (v.params) applyParams(v.params); ponerCortes(v.c6 || {}); alAplicar && alAplicar(); }
    else applySnapshot(v);
    pintarCV(); }
  async function guardarEntrada(v) { const i = VISTAS.findIndex(x => x.id === v.id); if (i >= 0) VISTAS[i] = v; else VISTAS.push(v); persistLocal(); await escribirDb(v); }
  async function sembrarVistas() { if (sembrando) return; if (VISTAS.some(v => v.grupo === 'fijas' || v.grupo === 'ambientes')) return;
    if (vdb) { try { const d = await vdb.doc('estado/vistasSembradas').get(); if (d && d.exists) return; } catch (e) {} } else if (LS.get(pref + '-vistas-sembradas', null)) return;
    sembrando = true; const t0 = Date.now(); let k = 0; const FIX = [...document.querySelectorAll('#viewbar [data-view]')].map(b => [b.dataset.view, b.textContent]);
    for (const [pr, nm] of FIX) await guardarEntrada({ id: 'p-' + pr, nombre: nm, grupo: 'fijas', preset: pr, ord: k++, ts: new Date(t0 + k).toISOString(), ...(CORTES_V['__v:' + pr] ? { c6: CORTES_V['__v:' + pr] } : {}) });
    for (const L of M.LOCALES.filter(l => l.poly)) await guardarEntrada({ id: 'p-amb-' + L.id, nombre: L.nombre || L.id, grupo: 'ambientes', amb: L.id, ord: k++, ts: new Date(t0 + k).toISOString(), c6: CORTES_V['__amb:' + L.id] || cortesDef('__amb:' + L.id), params: { techos: false } });
    LS.set(pref + '-vistas-sembradas', 1); if (vdb) try { await vdb.doc('estado/vistasSembradas').set({ ts: new Date().toISOString() }); } catch (e) {}
    sembrando = false; renderVistas(); }
  async function guardarVista(nombre) { const id = 'v' + Date.now().toString(36); const v = { id, nombre: nombre || ('Vista ' + (VISTAS.length + 1)), ts: new Date().toISOString(), ...snapshot() }; VISTAS.push(v); curVista = id;
    let msg = 'Guardada en este navegador.'; if (vdb) { try { await escribirDb(v); msg = 'Guardada.'; } catch (e) { msg = 'Guardada sólo en este navegador (' + (e && e.code || 'sin permiso') + ').'; } }
    persistLocal(); renderVistas(); const sel = $('vistasSel'); if (sel) { sel.value = id; sel.dataset.cur = id; } pintarCV(); return msg; }
  /* «Actualizar»: la vista toma la cámara, cortes y capas de ahora; conserva nombre, grupo e id */
  async function actualizarVista(id) { const i = VISTAS.findIndex(x => x.id === id); if (i < 0) return 'No encontré esa vista.'; const v = { ...VISTAS[i], ts: new Date().toISOString(), ...snapshot() }; VISTAS[i] = v;
    let msg = 'Actualizada en este navegador.'; if (vdb) { try { await escribirDb(v); msg = 'Actualizada.'; } catch (e) { msg = 'Actualizada sólo en este navegador (' + (e && e.code || 'sin permiso') + ').'; } }
    persistLocal(); renderVistas(); aviso('«' + v.nombre + '» actualizada'); return msg; }
  async function borrarVista(id) { VISTAS = VISTAS.filter(x => x.id !== id); if (curVista === id) curVista = null; persistLocal(); renderVistas(); pintarCV(); if (vdb) try { await vdb.doc('vistas/' + id).delete(); } catch (e) {} }
  let toast = null; const aviso = t => { if (!toast) { toast = document.createElement('div'); toast.style.cssText = 'position:fixed;top:56px;left:50%;transform:translateX(-50%);background:var(--panel);border:1px solid var(--accent);border-radius:3px;padding:4px 10px;font-size:12px;z-index:50'; document.body.appendChild(toast); } toast.textContent = t; toast.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => toast.hidden = true, 2500); };

  function renderVistas() { const sel = $('vistasSel');
    if (sel) { const cur = sel.dataset.cur || ''; const G3 = g => ordenVistas(VISTAS.filter(v => (v.grupo || 'guardadas') === g)).map(v => `<option value="${esc(v.id)}">${esc(v.nombre)}</option>`).join('');
      /* mientras no se sembraron, las fijas y los ambientes salen de la casa */
      const FIX = VISTAS.some(v => v.grupo === 'fijas') ? '' : [...document.querySelectorAll('#viewbar [data-view]')].map(b => `<option value="__v:${esc(b.dataset.view)}">${esc(b.textContent)}</option>`).join('');
      const AMB = VISTAS.some(v => v.grupo === 'ambientes') ? '' : M.LOCALES.filter(l => l.poly).map(l => `<option value="__amb:${esc(l.id)}">${esc(l.nombre || l.id)}</option>`).join('');
      sel.innerHTML = '<option value="">Vistas…</option><optgroup label="Vistas fijas">' + G3('fijas') + FIX + '<option value="__all">Ver todo</option></optgroup><optgroup label="Ambientes (aislados con los cortes)">' + G3('ambientes') + AMB + '</optgroup><optgroup label="Guardadas">' + G3('guardadas') + '</optgroup><option disabled>──────</option><option value="__save">＋ Guardar vista actual…</option><option value="__del">− Borrar la vista elegida…</option><option value="__upd" hidden>Actualizar</option><option value="__cut" hidden>Cortes</option>';
      sel.value = VISTAS.some(v => v.id === cur) ? cur : ''; vistaForm(sel); }
    const el = $('pane-vistas'); if (!el) return; const hid = visor.hidden;
    el.innerHTML = `<p class="intro">Una vista guarda cámara, cortes, capas y piezas ocultas. Queda en la base de la página: la ves vos y la leo yo.</p><div class="renrow"><input type="text" id="vistaNombre" placeholder="nombre de la vista" maxlength="60"><button class="btn" id="vistaGuardar">Guardar</button></div><div class="renmsg" id="vistaMsg"></div>` +
      (VISTAS.length ? ordenVistas(VISTAS).map(v => `<div class="row vrow" data-vista="${esc(v.id)}"><div style="flex:1;min-width:0"><div class="t"><b>${esc(v.nombre)}</b></div><div class="s">${v.c6 && Object.keys(v.c6).length ? Object.keys(v.c6).length + ' cortes · ' : ''}${(v.hidden || []).length ? (v.hidden.length + ' ocultas · ') : ''}${(v.ts || '').slice(0, 10)}</div></div><button class="btn" data-vupd="${esc(v.id)}" title="Actualizar con la vista de ahora">⟳</button><button class="btn" data-vdel="${esc(v.id)}" title="Borrar">×</button></div>`).join('') : '<p class="s">Todavía no hay vistas guardadas.</p>') +
      `<h3>Piezas ocultas <span class="n">${hid.length}</span></h3>` + (hid.length ? hid.map(id => `<div class="row"><div class="t">${esc(id)}</div><button class="btn" data-vshow="${esc(id)}">mostrar</button></div>`).join('') + `<button class="btn" data-showall style="margin-top:6px">Mostrar todo</button>` : '<p class="s">Ninguna.</p>');
    el.querySelectorAll('.vrow').forEach(r => r.addEventListener('click', e => { if (e.target.closest('[data-vdel],[data-vupd]')) return; const v = VISTAS.find(x => x.id === r.dataset.vista); if (v) aplicarEntrada(v); }));
    el.querySelectorAll('[data-vdel]').forEach(b => b.addEventListener('click', () => borrarVista(b.dataset.vdel)));
    el.querySelectorAll('[data-vupd]').forEach(b => b.addEventListener('click', () => actualizarVista(b.dataset.vupd)));
    el.querySelectorAll('[data-vshow]').forEach(b => b.addEventListener('click', () => { visor.toggleHidden(b.dataset.vshow, false); renderVistas(); }));
    const sa = el.querySelector('[data-showall]'); if (sa) sa.addEventListener('click', () => { visor.setHidden([]); renderVistas(); });
    $('vistaGuardar').addEventListener('click', async () => { const msg = await guardarVista(($('vistaNombre').value || '').trim()); const m = $('vistaMsg'); if (m) m.textContent = msg; }); }
  function vistaForm(sel) { if (sel.dataset.bound) return; sel.dataset.bound = '1';
    const F = document.createElement('div'); F.id = 'vistaForm'; F.hidden = true; F.innerHTML = '<span id="vfLbl"></span><input type="text" id="vfNom" maxlength="60" placeholder="nombre de la vista"><button class="btn" id="vfOk">Guardar</button><button class="btn" id="vfNo">×</button>'; sel.parentNode.insertBefore(F, sel.nextSibling);
    const nom = F.querySelector('#vfNom'), ok = F.querySelector('#vfOk'), lbl = F.querySelector('#vfLbl'); let modo = null;
    const cerrar = () => { F.hidden = true; modo = null; sel.hidden = false; sel.value = ''; };
    const abrir = m => { modo = m; F.hidden = false; if (m === 'save') { lbl.textContent = ''; nom.hidden = false; nom.value = ''; ok.textContent = 'Guardar'; setTimeout(() => nom.focus(), 0); } else { const v = VISTAS.find(x => x.id === sel.dataset.cur); if (!v) { cerrar(); aviso('Primero elegí una vista'); return; } lbl.textContent = '¿Borrar «' + v.nombre + '»?'; nom.hidden = true; ok.textContent = 'Borrar'; } };
    ok.addEventListener('click', async () => { const m = modo, cur = sel.dataset.cur, nm = nom.value.trim(); cerrar(); if (m === 'save') aviso(await guardarVista(nm)); else if (m === 'del') { sel.dataset.cur = ''; await borrarVista(cur); aviso('Borrada.'); } });
    F.querySelector('#vfNo').addEventListener('click', cerrar); nom.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') ok.click(); if (e.key === 'Escape') cerrar(); });
    sel.addEventListener('change', async () => { const val = sel.value;
      if (val.startsWith('__amb:')) { const id = val.slice(6); const v = VISTAS.find(x => x.amb === id) || { id: 'p-amb-' + id, amb: id, nombre: id }; aplicarEntrada(v); sel.value = ''; return; }
      if (val.startsWith('__v:')) { curVista = null; const b = document.querySelector(`#viewbar [data-view="${val.slice(4)}"]`); if (b) b.click(); ponerCortes({}); pintarCV(); sel.value = ''; return; }
      if (val === '__all') { curVista = null; const b = $('clearSel'); if (b) b.click(); ponerCortes({}); pintarCV(); sel.value = ''; return; }
      if (val === '__save') return abrir('save');
      if (val === '__del') return abrir('del');
      if (val === '__upd') { const id = sel.dataset.cur; aviso(await actualizarVista(id)); sel.value = VISTAS.some(x => x.id === id) ? id : ''; return; }
      if (val === '__cut') { const v = VISTAS.find(x => x.id === sel.dataset.cur); if (v) { aplicarEntrada(v); if (window.__side) window.__side.toggle('corte', true); } sel.value = ''; return; }
      sel.dataset.cur = val; const v = VISTAS.find(x => x.id === val); if (v) aplicarEntrada(v); }); }

  renderVistas(); setTimeout(pintarCV, 0);
  N.getDb().then(db => { vdb = db; if (!db) { setTimeout(sembrarVistas, 500); return; } let primera = true;
    db.collection('estado').doc('cortesVistas').onSnapshot(x => { if (x.exists) { const v = { ...x.data() }; delete v.ts; CORTES_V = { ...CORTES_V, ...v }; } }, () => {});
    db.collection('vistas').onSnapshot(snap => { const remote = []; snap.docs.forEach(d => { if (d.exists) remote.push({ id: d.id, ...d.data() }); });
      if (remote.length || VISTAS.length === 0) { VISTAS = remote.sort((a, b) => (a.ts || '').localeCompare(b.ts || '')); persistLocal(); }
      renderVistas(); if (primera) { primera = false; setTimeout(sembrarVistas, 300); } }, () => {}); });

  const api = { applyClips, ponerCortes, aplicarEntrada, renderVistas, get vistas() { return VISTAS; }, get actual() { return curVista; } };
  visor.vistas = api; return api;
}
