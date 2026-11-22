/* Editor de octet truss (Maxi 4/11/2026): agregar, quitar y mover tubos y nodos respetando la retícula, con los modelos guardados en la base
   (colección «octet», un documento por modelo) para llevarlos después a cualquier casa como mueble «octet».
   Todo va en la barra derecha (sección «Octet»); nada flotante. La retícula y la geometría están en octet.js.

   Herramientas:
   · Agregar: tocá un nodo y aparecen en naranja las direcciones libres (a n·L); tocá una y queda el tubo (y el nodo de la punta si no estaba).
   · Quitar: tocá un tubo y se va; tocá un nodo y se va con sus tubos.
   · Mover: tocá nodos (Shift suma) y movelos con los botones, de a un paso de la retícula; los tubos siguen.
   · Sembrar un bloque entero (nx × nz celdas, c capas) y después sacarle lo que sobra.
   Uso: const OE = initOctet(visor, stage, { pref:'octet', inicial, alCambiar: m => visor.rebuild() }); las piezas las arma la escena con octet.armar(). */
import * as O from './octet.js';
import * as N from './nombres.js';

export function initOctet(visor, stage, { pref = 'octet', inicial = null, alCambiar = null, colNodo = 'N:', colStrut = 'S:' } = {}) {
  const { THREE } = visor; const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const fl = v => (+v).toFixed(1).replace('.', ',').replace(/,0$/, '');
  const slug = s => (s || 'modelo').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'modelo';

  /* ---------- estado ---------- */
  let MOD = {}, cur = LS.get(pref + '-cur', null), m = O.normalizar(inicial || O.vacio('Mesa')), hist = [], tool = '', sel = new Set(), fuente = null, nLargo = 1, db = null, saveT = 0, shift = false, msgT = 0;
  const fire = () => { if (alCambiar) try { alCambiar(m); } catch (e) { console.error(e); } pintar(); marcar(); fantasmas(); };
  function set(nuevo, { guardar = true, undo = true } = {}) { if (undo) { hist.push(O.copiar(m)); if (hist.length > 100) hist.shift(); } m = O.normalizar(nuevo); for (const s of [...sel]) if (!m.nodos[s]) sel.delete(s); if (fuente && !m.nodos[fuente]) fuente = null; fire(); if (guardar) persistir(); }
  const msg = t => { const el = q('octMsg'); if (!el) return; el.textContent = t || ''; clearTimeout(msgT); if (t) msgT = setTimeout(() => { el.textContent = ''; }, 4000); };

  /* ---------- base ---------- */
  const guardarYa = async () => { clearTimeout(saveT); saveT = 0; const id = cur || (cur = slug(m.nombre)); m.ts = new Date().toISOString(); const body = O.copiar(m); MOD[id] = body; LS.set(pref + '-cur', id); LS.set(pref + '-modelos', MOD);
    if (db) { try { await db.collection('octet').doc(id).set(body); } catch (e) { console.error('octet guardar', e); } } lista(); };
  const persistir = () => { clearTimeout(saveT); saveT = setTimeout(guardarYa, 500); };
  /* antes de cambiar de modelo se guarda lo pendiente (si no, un cambio rápido de modelo lo perdía) */
  const cerrarPendiente = () => { if (saveT) guardarYa(); };
  MOD = LS.get(pref + '-modelos', {}); if (cur && MOD[cur]) m = O.normalizar(MOD[cur]); else if (!cur) { cur = slug(m.nombre); MOD[cur] = O.copiar(m); } /* sin nada guardado, la semilla es el primer modelo */
  N.getDb().then(d => { db = d; if (!d) return; d.collection('octet').onSnapshot(snap => { const R = {}; snap.docs.forEach(x => { if (x.exists) R[x.id] = x.data(); });
    if (!Object.keys(R).length) { persistir(); return; } /* base vacía: se guarda lo que hay (la semilla) y el próximo aviso trae la lista */
    MOD = R; LS.set(pref + '-modelos', MOD); /* la base manda sobre lo local */
    if (!cur || !R[cur]) abrir(Object.keys(R).sort()[0]); else if (!saveT && R[cur].ts && R[cur].ts !== (m.ts || '')) { m = O.normalizar(R[cur]); fire(); } /* cambiado desde otro navegador */
    lista(); pintar(); }, () => {}); });
  function abrir(id) { if (!MOD[id]) return; cerrarPendiente(); cur = id; LS.set(pref + '-cur', id); hist = []; sel.clear(); fuente = null; m = O.normalizar(MOD[id]); fire(); }
  function nuevo(nombre, base) { cerrarPendiente(); const n = (nombre || '').trim() || 'Nuevo'; let id = slug(n), i = 2; while (MOD[id]) id = slug(n) + '-' + i++; cur = id; hist = []; sel.clear(); fuente = null; m = O.normalizar(base ? { ...O.copiar(base), nombre: n } : O.vacio(n)); fire(); persistir(); }
  async function borrar(id) { if (!MOD[id]) return; if (cur !== id) cerrarPendiente(); else { clearTimeout(saveT); saveT = 0; } delete MOD[id]; LS.set(pref + '-modelos', MOD); if (db) { try { await db.collection('octet').doc(id).delete(); } catch (e) {} } if (cur === id) { cur = null; const k = Object.keys(MOD).sort()[0]; if (k) abrir(k); else nuevo('Nuevo'); } lista(); }

  /* ---------- panel ---------- */
  /* Maxi 22/11: panel ordenado como formulario (etiqueta a la izquierda, campo a la derecha), con margen, secciones separadas y ayudas cortas */
  const css = document.createElement('style'); css.textContent = `
#octPanel{padding:6px 12px 10px;font-size:11px;line-height:1.4}#octPanel .mh{display:none}
#octPanel .mh2{margin:12px 0 5px;font:600 10px var(--f-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--muted);border-top:1px solid var(--rule);padding-top:8px;display:flex;align-items:center;gap:8px}
#octPanel .mh2:first-of-type{margin-top:4px;border-top:0;padding-top:0}#octPanel .mh2 label{font:inherit;text-transform:none;letter-spacing:0;color:var(--ink);display:inline-flex;align-items:center;gap:4px;margin-left:auto}
#octPanel .mrow{display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin:5px 0}#octPanel .seg .btn[aria-pressed=true]{background:var(--accent);color:#fff;border-color:var(--accent)}
#octPanel .herr{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin:4px 0}#octPanel .herr .btn{padding:3px 4px;font-size:11px;line-height:1.3;text-align:center}
#octPanel .tres{display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin:5px 0}#octPanel .tres .btn{padding:2px 4px;font-size:10.5px}
#octPanel .f{display:grid;grid-template-columns:1fr 62px;gap:4px 8px;align-items:center;margin:4px 0}#octPanel .f label{color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#octPanel .f input[type=number],#octPanel .f select{width:100%;box-sizing:border-box;font-size:11px;padding:2px 4px;text-align:right}#octPanel .f select{text-align:left}
#octPanel .f.off label,#octPanel .f.off input{opacity:.45}
#octPanel .mhint,#octPanel .mmsg,#octPanel .s{color:var(--muted);font-size:10.5px;line-height:1.4;margin:3px 0}#octPanel .mmsg:empty{display:none}#octPanel .mmsg{color:var(--accent);font-weight:600}
#octPanel select{font-size:11px;max-width:100%}#octPanel #octSel{width:100%;box-sizing:border-box;padding:3px 4px}#octPanel input[type=text]{width:100%;box-sizing:border-box;font-size:11px;padding:3px 5px}
#octPanel .btn.mini{padding:2px 7px;font-size:10.5px;line-height:16px}#octPanel textarea{width:100%;box-sizing:border-box;font:10px var(--f-mono);height:70px;margin-top:4px}
#octPanel .octBom{border-collapse:collapse;font-size:11px;margin:2px 0 4px;width:100%}#octPanel .octBom td{padding:3px 6px 3px 0;border-bottom:1px solid var(--rule);vertical-align:top}#octPanel .octBom td:first-child{white-space:nowrap;color:var(--muted)}#octPanel .octBom tr:first-child td{color:var(--ink)}
#octPanel .flechas{display:grid;grid-template-columns:repeat(3,28px);gap:3px}#octPanel .flechas .btn{padding:0;height:24px;font-size:13px}
#octPanel .cmd{display:flex;gap:4px;flex-wrap:wrap;margin:5px 0}
#octPanel #octLista{border:1px solid var(--rule);border-radius:3px;margin:2px 0 4px;max-height:150px;overflow:auto}#octPanel .mi{display:flex;align-items:baseline;gap:6px;padding:3px 7px;cursor:pointer;border-bottom:1px solid var(--rule)}#octPanel .mi:last-child{border-bottom:0}
#octPanel .mi:hover{background:var(--accent-soft)}#octPanel .mi.on{background:var(--accent-soft);box-shadow:inset 2px 0 0 var(--accent);font-weight:600}#octPanel .mi .n{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#octPanel .mi .s{margin:0;white-space:nowrap}
#octPanel label.chk{display:flex;align-items:flex-start;gap:5px;font-size:10.5px;color:var(--muted);margin:3px 0 5px}#octPanel label.chk input{margin:1px 0 0}
#octPanel [hidden]{display:none!important}#octPanel .f.w{grid-template-columns:1fr 118px}
#modo-3d .stage.octet-edit #view{cursor:crosshair}`; document.head.appendChild(css);
  const bt = document.createElement('button'); bt.className = 'btn'; bt.id = 'octetTg'; bt.textContent = '⬡ Octet'; bt.title = 'Editar la estructura: agregar, quitar y mover tubos y nodos'; const tr = document.getElementById('topright'); if (tr) tr.prepend(bt);
  const P = document.createElement('div'); P.id = 'octPanel'; P.hidden = true; stage.appendChild(P);
  P.innerHTML = `<div class="mh"><b>Octet</b><span class="mx" id="octX" title="Cerrar">×</span></div>
   <div class="mh2">Modelos guardados</div>
   <div id="octLista" title="Tocá uno para abrirlo"></div>
   <label class="chk"><input type="checkbox" id="octTodos"> Ver todos juntos (los otros en gris, al lado; tocá uno para abrirlo)</label>
   <div class="tres"><button class="btn mini" id="octNuevo" title="Modelo nuevo, vacío">Nuevo</button><button class="btn mini" id="octDup" title="Copiar este modelo con otro nombre">Duplicar</button><button class="btn mini" id="octBorrar" title="Borrar este modelo">Borrar</button></div>
   <input type="text" id="octNombre" placeholder="nombre del modelo" maxlength="60" title="Nombre del modelo">
   <div class="s" id="octEstado"></div>
   <div class="mh2">Herramienta</div>
   <div class="herr seg"><button class="btn" data-tool="">Navegar</button><button class="btn" data-tool="agregar">Agregar tubo</button><button class="btn" data-tool="quitar">Quitar</button><button class="btn" data-tool="mover">Elegir y mover</button></div>
   <div class="mhint" id="octHint"></div>
   <div class="f" id="octLargoRow"><label for="octLargo">Largo del tubo nuevo</label><select id="octLargo"><option value="1">L</option><option value="2">2 L</option><option value="3">3 L</option></select></div>
   <div id="octMover" hidden><div class="mrow"><span class="s" id="octSelN" style="flex:1"></span><button class="btn mini" id="octSelTodo">Todos</button><button class="btn mini" id="octSelNada">Ninguno</button></div>
     <div class="mrow"><div class="flechas"><span></span><button class="btn" data-mv="0,2,0" title="+z (atrás)">▲</button><span></span><button class="btn" data-mv="-2,0,0" title="−x">◀</button><span></span><button class="btn" data-mv="2,0,0" title="+x">▶</button><span></span><button class="btn" data-mv="0,-2,0" title="−z (adelante)">▼</button><span></span></div>
       <div class="flechas"><button class="btn" data-mv="1,1,1" title="una capa arriba, corrido a +x +z">⇗</button><button class="btn" data-mv="0,0,2" title="dos capas arriba, en el mismo lugar">⇈</button><button class="btn" data-mv="-1,-1,1" title="una capa arriba, corrido a −x −z">⇖</button><button class="btn" data-mv="1,-1,-1" title="una capa abajo, corrido a +x −z">⇘</button><button class="btn" data-mv="0,0,-2" title="dos capas abajo, en el mismo lugar">⇊</button><button class="btn" data-mv="-1,1,-1" title="una capa abajo, corrido a −x +z">⇙</button></div></div>
     <div class="mhint">Flechas: un paso en la capa. Diagonales: una capa arriba o abajo, corrido media celda. ⇈ ⇊: dos capas, en el mismo lugar.</div>
     <div class="f w"><label for="octTipo">Tipo de nodo</label><select id="octTipo"><option value="auto">según los tubos</option><option value="full">full (12)</option><option value="arriba">half, tubos arriba</option><option value="abajo">half, tubos abajo</option></select></div>
     <div class="cmd"><button class="btn mini" id="octQuitarSel">Quitar los elegidos</button></div></div>
   <div class="cmd"><button class="btn mini" id="octUndo" title="Deshacer (Ctrl/⌘ Z)">↶ Deshacer</button></div>
   <div class="mh2">Retícula (cm)</div>
   <div class="f"><label for="octL" title="De centro de nodo a centro de nodo">Largo L, nodo a nodo</label><input type="number" id="octL" step="0.5" min="5" max="500"><label for="octD">Ø del tubo</label><input type="number" id="octD" step="0.1" min="0.3" max="20"><label for="octR" title="Del centro del nodo a cada cara">R del nodo</label><input type="number" id="octR" step="0.1" min="0.5" max="30"><label for="octDesc" title="Lo que se resta al corte además de 2R">Descuento de corte</label><input type="number" id="octDesc" step="0.1" min="0" max="20"></div>
   <div class="mhint">Cada tubo se corta a n·L − 2R − descuento. R y Ø son supuestos hasta medir el nodo real.</div>
   <div class="mh2">Vidrio (cm)<label><input type="checkbox" id="octTapaOn"> lleva</label></div>
   <div class="f" id="octTapaF"><label for="octTapaE">Espesor</label><input type="number" id="octTapaE" step="0.1" min="0.3" max="10"><label for="octTapaV">Vuelo sobre los nodos</label><input type="number" id="octTapaV" step="1" min="0" max="100"><label for="octTapaDisco">Disco de apoyo, alto</label><input type="number" id="octTapaDisco" step="0.1" min="0" max="10"><label for="octTapaAn" title="0: sale de los nodos de arriba más el vuelo">Ancho (0 = automático)</label><input type="number" id="octTapaAn" step="1" min="0" max="600"><label for="octTapaFo" title="0: sale de los nodos de arriba más el vuelo">Fondo (0 = automático)</label><input type="number" id="octTapaFo" step="1" min="0" max="600"><label for="octTapaDx">Corrido en x</label><input type="number" id="octTapaDx" step="1" min="-300" max="300"><label for="octTapaDz">Corrido en z</label><input type="number" id="octTapaDz" step="1" min="-300" max="300"></div>
   <div class="mhint">Con ancho y fondo en 0, el vidrio sale de los nodos de arriba más el vuelo.</div>
   <div class="mh2">Regatones (cm)<label><input type="checkbox" id="octPiesOn"> llevan</label></div>
   <div class="f" id="octPiesF"><label for="octPiesH">Alto</label><input type="number" id="octPiesH" step="0.1" min="0" max="10"></div>
   <div class="mh2">Sembrar un bloque</div>
   <div class="f"><label for="octBx">Celdas en x</label><input type="number" id="octBx" value="3" min="1" max="20" step="1"><label for="octBz">Celdas en z</label><input type="number" id="octBz" value="2" min="1" max="20" step="1"><label for="octBc">Capas</label><input type="number" id="octBc" value="3" min="1" max="12" step="1"></div>
   <div class="cmd"><button class="btn mini" id="octBloque">Agregar bloque</button><button class="btn mini" id="octVaciar">Vaciar todo</button></div>
   <div class="mhint">Celdas de L × L; las capas van a L/√2. Lo agrega desde el origen con todos los tubos; después quitás lo que sobra.</div>
   <div class="mh2">Lista de materiales</div><div id="octBom"></div>
   <div class="mh2">Copiar o pegar el modelo</div>
   <div class="cmd"><button class="btn mini" id="octCopiar">Copiar JSON</button><button class="btn mini" id="octPegar">Pegar JSON…</button></div><div id="octJson" hidden><textarea id="octTa"></textarea><div class="cmd"><button class="btn mini" id="octImportar">Importar</button><button class="btn mini" id="octJsonX">Cerrar</button></div></div>
   <div class="mhint">Lo guardado acá lo leo yo y lo pongo como mueble «octet» en la casa que digas.</div>
   <div class="mmsg" id="octMsg"></div>`;
  const q = id => P.querySelector('#' + id);
  const HINT = { '': 'Tocá cualquier pieza para ver su ficha. Elegí una herramienta para editar.', agregar: 'Tocá un nodo: aparecen en naranja las direcciones libres. Tocá una y queda el tubo (y el nodo de la punta). Tocá el vacío para soltar el nodo.',
    quitar: 'Tocá un tubo y se va. Tocá un nodo y se va con todos sus tubos. ↶ lo vuelve a poner.', mover: 'Tocá nodos para elegirlos (Shift suma). Movelos con las flechas, de a un paso de la retícula: los tubos siguen. También podés fijarles el tipo o quitarlos.' };
  const setTool = t => { tool = t || ''; fuente = null; P.querySelectorAll('[data-tool]').forEach(b => b.setAttribute('aria-pressed', (b.dataset.tool || '') === tool)); q('octHint').textContent = HINT[tool]; q('octMover').hidden = tool !== 'mover'; q('octLargoRow').hidden = tool !== 'agregar'; stage.classList.toggle('octet-edit', !!tool); if (tool !== 'mover') { sel.clear(); marcar(); } fantasmas(); };
  const setOn = v => { P.hidden = !v; bt.setAttribute('aria-pressed', v); if (!v) setTool(''); else { setTool(tool); pintar(); } window.__side && window.__side.sync(); };
  bt.addEventListener('click', () => setOn(P.hidden)); q('octX').addEventListener('click', () => setOn(false));
  P.querySelectorAll('[data-tool]').forEach(b => b.addEventListener('click', () => setTool(b.dataset.tool)));
  q('octLargo').addEventListener('change', e => { nLargo = +e.target.value; fantasmas(); });
  q('octUndo').addEventListener('click', deshacer); function deshacer() { const h = hist.pop(); if (!h) { msg('Nada que deshacer.'); return; } m = O.normalizar(h); fire(); persistir(); }
  addEventListener('keydown', e => { if (e.key === 'Shift') shift = true; if (P.hidden || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return; if ((e.key === 'z' || e.key === 'Z') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); deshacer(); } if (e.key === 'Escape') { fuente = null; fantasmas(); } });
  addEventListener('keyup', e => { if (e.key === 'Shift') shift = false; }); addEventListener('blur', () => { shift = false; });
  /* modelos */
  q('octLista').addEventListener('click', e => { const r = e.target.closest('.mi'); if (r && r.dataset.id !== cur) abrir(r.dataset.id); });
  let todos = !!LS.get(pref + '-todos', false); q('octTodos').checked = todos; q('octTodos').addEventListener('change', e => { todos = e.target.checked; LS.set(pref + '-todos', todos); fire(); });
  q('octNuevo').addEventListener('click', () => { const n = prompt('Nombre del modelo nuevo', 'Nuevo'); if (n != null) nuevo(n); });
  q('octDup').addEventListener('click', () => { const n = prompt('Nombre de la copia', m.nombre + ' copia'); if (n != null) nuevo(n, m); });
  q('octBorrar').addEventListener('click', () => { if (cur && confirm(`¿Borrar «${m.nombre}»? No se puede deshacer.`)) borrar(cur); });
  q('octNombre').addEventListener('change', e => { const n = e.target.value.trim(); if (!n) return; set({ ...m, nombre: n }, { undo: false }); });
  /* parámetros */
  const num = (id, fn) => q(id).addEventListener('change', e => { const v = +e.target.value; if (isNaN(v)) return; set(fn(O.copiar(m), v)); });
  num('octL', (o, v) => { o.L = v; return o; }); num('octD', (o, v) => { o.d = v; return o; }); num('octR', (o, v) => { o.R = v; return o; }); num('octDesc', (o, v) => { o.desc = v; return o; });
  num('octTapaE', (o, v) => { o.tapa.e = v; return o; }); num('octTapaV', (o, v) => { o.tapa.vuelo = v; return o; }); num('octTapaDisco', (o, v) => { o.tapa.disco = v; return o; }); num('octTapaAn', (o, v) => { o.tapa.ancho = v; return o; }); num('octTapaFo', (o, v) => { o.tapa.fondo = v; return o; }); num('octTapaDx', (o, v) => { o.tapa.dx = v; return o; }); num('octTapaDz', (o, v) => { o.tapa.dz = v; return o; }); num('octPiesH', (o, v) => { o.pies.h = v; return o; });
  q('octTapaOn').addEventListener('change', e => { const o = O.copiar(m); o.tapa.on = e.target.checked; set(o); }); q('octPiesOn').addEventListener('change', e => { const o = O.copiar(m); o.pies.on = e.target.checked; set(o); });
  /* bloque */
  q('octBloque').addEventListener('click', () => { const nx = +q('octBx').value || 1, nz = +q('octBz').value || 1, nc = +q('octBc').value || 1; set(O.bloque(m, nx, nz, nc)); msg(`Bloque de ${nx} × ${nz} × ${nc} agregado.`); });
  q('octVaciar').addEventListener('click', () => { if (!m.struts.length && !Object.keys(m.nodos).length) return; if (confirm('¿Vaciar el modelo? ↶ lo vuelve a traer.')) set({ ...O.copiar(m), nodos: {}, struts: [] }); });
  /* mover */
  q('octSelTodo').addEventListener('click', () => { sel = new Set(Object.keys(m.nodos)); marcar(); pintar(); }); q('octSelNada').addEventListener('click', () => { sel.clear(); marcar(); pintar(); });
  P.querySelectorAll('[data-mv]').forEach(b => b.addEventListener('click', () => { if (!sel.size) { msg('Elegí nodos primero.'); return; } const d = b.dataset.mv.split(',').map(Number); const r = O.trasladar(m, [...sel], d); if (r.err) { msg(r.err); return; }
    const nv = new Set([...sel].map(s => { const [a, bb, k] = O.parse(s); return O.key(a + d[0], bb + d[1], k + d[2]); })); set(r.m); sel = nv; marcar(); pintar(); if (r.perdidos.length) msg(`${r.perdidos.length} tubo(s) se perdieron: ya no caían sobre la retícula.`); }));
  q('octTipo').addEventListener('change', e => { if (!sel.size) { msg('Elegí nodos primero.'); return; } const o = O.copiar(m); for (const s of sel) { if (!o.nodos[s]) continue; if (e.target.value === 'auto') delete o.nodos[s].t; else o.nodos[s].t = e.target.value; } set(o); });
  q('octQuitarSel').addEventListener('click', () => { if (!sel.size) return; let o = m; for (const s of sel) o = O.quitarNodo(o, s).m; sel.clear(); set(o); });
  /* json */
  q('octCopiar').addEventListener('click', async () => { const t = JSON.stringify(O.copiar(m)); let ok = false; try { await navigator.clipboard.writeText(t); ok = true; } catch (e) {} if (!ok) { q('octJson').hidden = false; q('octTa').value = t; q('octTa').select(); } msg(ok ? 'Copiado.' : 'No pude copiar: seleccioná el texto.'); });
  q('octPegar').addEventListener('click', () => { q('octJson').hidden = false; q('octTa').value = ''; q('octTa').focus(); }); q('octJsonX').addEventListener('click', () => { q('octJson').hidden = true; });
  q('octImportar').addEventListener('click', () => { try { const o = JSON.parse(q('octTa').value); if (!o || typeof o !== 'object') throw 0; set({ ...O.copiar(m), ...o }); q('octJson').hidden = true; msg('Importado.'); } catch (e) { msg('Ese texto no es un modelo.'); } });

  function lista() { const el = q('octLista'); const ids = Object.keys(MOD).sort((a, b) => (MOD[a].nombre || a).localeCompare(MOD[b].nombre || b));
    el.innerHTML = ids.map(id => { const x = MOD[id]; const n = x.nodos ? Object.keys(x.nodos).length : 0, t = x.struts ? x.struts.length : 0; return `<div class="mi${id === cur ? ' on' : ''}" data-id="${esc(id)}"><span class="n">${esc(x.nombre || id)}</span><span class="s">${n} n · ${t} t</span></div>`; }).join('') || '<div class="mi"><span class="n s">(sin modelos)</span></div>'; }
  let ult = null; function pintar() { if (P.hidden) return; const A = ult = O.armar(THREE, m); q('octBom').innerHTML = O.bomHTML(A.bom, m, A.caja); if (document.activeElement !== q('octNombre')) q('octNombre').value = m.nombre || '';
    for (const [id, v] of [['octL', m.L], ['octD', m.d], ['octR', m.R], ['octDesc', m.desc || 0], ['octTapaE', m.tapa.e], ['octTapaV', m.tapa.vuelo], ['octTapaDisco', m.tapa.disco], ['octTapaAn', m.tapa.ancho || 0], ['octTapaFo', m.tapa.fondo || 0], ['octTapaDx', m.tapa.dx || 0], ['octTapaDz', m.tapa.dz || 0], ['octPiesH', m.pies.h]]) { const el = q(id); if (document.activeElement !== el) el.value = v; }
    q('octTapaOn').checked = !!m.tapa.on; q('octPiesOn').checked = !!m.pies.on; q('octTapaF').classList.toggle('off', !m.tapa.on); q('octPiesF').classList.toggle('off', !m.pies.on); q('octSelN').textContent = sel.size ? `${sel.size} nodo(s) elegido(s)` : 'ningún nodo elegido';
    q('octEstado').textContent = `${Object.keys(m.nodos).length} nodos · ${m.struts.length} tubos · ${fl(A.caja.x[1] - A.caja.x[0])} × ${fl(A.caja.z[1] - A.caja.z[0])} × ${fl(A.caja.y[1])}${db ? '' : ' · sin base: queda en este navegador'}`; lista(); }

  /* ---------- 3D: fantasmas y selección ---------- */
  const G = new THREE.Group(); G.name = 'octet-fantasmas'; G.renderOrder = 2002; visor.scene.add(G);
  const matF = new THREE.MeshBasicMaterial({ color: 0xe2462b, transparent: true, opacity: .45, depthTest: false }), matH = new THREE.MeshBasicMaterial({ color: 0xe2462b, transparent: true, opacity: .9, depthTest: false });
  const vaciar = g => { for (const c of [...g.children]) { g.remove(c); if (c.geometry) c.geometry.dispose(); } };
  function fantasmas() { vaciar(G); if (tool !== 'agregar' || !fuente || !m.nodos[fuente]) { window.__despertar && window.__despertar(); return; } const A = O.marco(m); const T = A.T, I = A.I[fuente] || [];
    for (let i = 0; i < 12; i++) { if (I[i]) continue; const dest = O.mover(fuente, i, nLargo); if (O.validarStrut(m, fuente, dest)) continue; const a = T(A.P[fuente]), b = T(O.posK(dest, m.L));
      const g = new THREE.CylinderGeometry(m.d * .9, m.d * .9, 1, 8); const av = new THREE.Vector3(...a), bv = new THREE.Vector3(...b), L = av.distanceTo(bv); g.scale(1, L, 1); g.translate(0, L / 2, 0); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), bv.clone().sub(av).normalize())); g.translate(av.x, av.y, av.z);
      const mesh = new THREE.Mesh(g, matF.clone()); mesh.userData.oct = { a: fuente, b: dest }; mesh.renderOrder = 2002; G.add(mesh);
      const sp = new THREE.Mesh(new THREE.SphereGeometry(m.R * .9, 10, 8), mesh.material); sp.position.copy(bv); sp.userData.oct = mesh.userData.oct; sp.renderOrder = 2002; G.add(sp); }
    window.__despertar && window.__despertar(); }
  /* nodos elegidos: resaltados en naranja (emisivo de su material); se vuelve a aplicar después de cada reconstrucción */
  function marcar() { for (const p of visor.parts) { if (!p.id.startsWith(colNodo) || !p.mat) continue; const on = sel.has(p.id.slice(colNodo.length)); p.mat.emissive.set(on ? '#e2462b' : '#000000'); p.mat.emissiveIntensity = on ? .55 : 0; } window.__despertar && window.__despertar(); }
  const ray = new THREE.Raycaster(), mv = new THREE.Vector2();
  const setRay = e => { const r = visor.renderer.domElement.getBoundingClientRect(); mv.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(mv, visor.camera); };
  visor.renderer.domElement.addEventListener('pointermove', e => { if (!G.children.length) return; setRay(e); const h = ray.intersectObjects(G.children, false)[0]; let ch = false; for (const c of G.children) { const on = h && c.userData.oct === h.object.userData.oct; const op = on ? .9 : .45; if (c.material.opacity !== op) { c.material.opacity = op; ch = true; } } if (ch) window.__despertar && window.__despertar(); });
  /* con una herramienta, el vidrio y los apoyos no tapan: se busca el nodo o el tubo que hay debajo */
  const bajoVidrio = (hit, r) => { if (!hit || !String(hit.object.userData.id || '').startsWith('X:')) return hit; const ms = []; for (const p of visor.parts) if ((p.id.startsWith(colNodo) || p.id.startsWith(colStrut)) && p.grp.visible !== false) p.grp.traverse(o => { if (o.isMesh) ms.push(o); });
    const cps = visor.renderer.clippingPlanes || []; return r.intersectObjects(ms, false).find(h => !cps.length || cps.every(pl => pl.distanceToPoint(h.point) >= 0)) || null; };
  { const prev = visor.pick; visor.pick = (hit0, r) => { if (P.hidden || !tool) return prev ? prev(hit0, r) : false; const hit = bajoVidrio(hit0, r);
    const id = hit && hit.object.userData.id; const nodo = id && id.startsWith(colNodo) ? id.slice(colNodo.length) : null, strut = id && id.startsWith(colStrut) ? id.slice(colStrut.length) : null;
    if (tool === 'agregar') { if (G.children.length) { const hg = r.intersectObjects(G.children, false)[0]; if (hg && (!hit || hg.distance < hit.distance + .5)) { const { a, b } = hg.object.userData.oct; const res = O.agregarStrut(m, a, b); if (res.err) msg(res.err); else { set(res.m); fuente = a; fantasmas(); } return true; } }
      if (nodo) { fuente = nodo; fantasmas(); } else { fuente = null; fantasmas(); } return true; }
    if (tool === 'quitar') { if (strut) set(O.quitarStrut(m, strut).m); else if (nodo) set(O.quitarNodo(m, nodo).m); return true; }
    if (tool === 'mover') { if (nodo) { if (shift) { if (sel.has(nodo)) sel.delete(nodo); else sel.add(nodo); } else { sel.clear(); sel.add(nodo); } } else if (strut) { const [a, b] = strut.split('|'); if (!shift) sel.clear(); sel.add(a); sel.add(b); } else if (!shift) sel.clear(); marcar(); pintar(); return true; }
    return prev ? prev(hit, r) : false; }; }

  /* la barra derecha (sidebar.js) adopta el panel cuando existe */
  const enganchar = () => { if (window.__side && window.__side.add) { window.__side.add('oct', 'Octet', P, () => !P.hidden, () => setOn(false)); return true; } return false; };
  if (!enganchar()) { let n = 0; const t = setInterval(() => { if (enganchar() || ++n > 40) clearInterval(t); }, 250); }
  setTool(''); pintar(); fire();
  const api = { get modelo() { return m; }, get armado() { return ult; }, get modelos() { return MOD; }, get cur() { return cur; }, get todos() { return todos; }, abrir, nuevo, set, setTool, toggle: v => setOn(v == null ? P.hidden : v), get abierto() { return !P.hidden; } };
  visor.octet = api; window.__octet = api; return api;
}
