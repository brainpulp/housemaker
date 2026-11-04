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
  const persistir = () => { clearTimeout(saveT); saveT = setTimeout(async () => { saveT = 0; const id = cur || (cur = slug(m.nombre)); m.ts = new Date().toISOString(); const body = O.copiar(m); MOD[id] = body; LS.set(pref + '-cur', id); LS.set(pref + '-modelos', MOD);
    if (db) { try { await db.collection('octet').doc(id).set(body); } catch (e) { console.error('octet guardar', e); } } lista(); }, 500); };
  MOD = LS.get(pref + '-modelos', {}); if (cur && MOD[cur]) m = O.normalizar(MOD[cur]); else if (!cur) { cur = slug(m.nombre); MOD[cur] = O.copiar(m); } /* sin nada guardado, la semilla es el primer modelo */
  N.getDb().then(d => { db = d; if (!d) return; d.collection('octet').onSnapshot(snap => { const R = {}; snap.docs.forEach(x => { if (x.exists) R[x.id] = x.data(); });
    if (!Object.keys(R).length) { persistir(); return; } /* base vacía: se guarda lo que hay (la semilla) y el próximo aviso trae la lista */
    MOD = R; LS.set(pref + '-modelos', MOD); /* la base manda sobre lo local */
    if (!cur || !R[cur]) abrir(Object.keys(R).sort()[0]); else if (!saveT && R[cur].ts && R[cur].ts !== (m.ts || '')) { m = O.normalizar(R[cur]); fire(); } /* cambiado desde otro navegador */
    lista(); pintar(); }, () => {}); });
  function abrir(id) { if (!MOD[id]) return; cur = id; LS.set(pref + '-cur', id); hist = []; sel.clear(); fuente = null; m = O.normalizar(MOD[id]); fire(); }
  function nuevo(nombre, base) { const n = (nombre || '').trim() || 'Nuevo'; let id = slug(n), i = 2; while (MOD[id]) id = slug(n) + '-' + i++; cur = id; hist = []; sel.clear(); fuente = null; m = O.normalizar(base ? { ...O.copiar(base), nombre: n } : O.vacio(n)); fire(); persistir(); }
  async function borrar(id) { if (!MOD[id]) return; delete MOD[id]; LS.set(pref + '-modelos', MOD); if (db) { try { await db.collection('octet').doc(id).delete(); } catch (e) {} } if (cur === id) { cur = null; const k = Object.keys(MOD).sort()[0]; if (k) abrir(k); else nuevo('Nuevo'); } lista(); }

  /* ---------- panel ---------- */
  const css = document.createElement('style'); css.textContent = `
#octPanel .mh{display:flex;justify-content:space-between;align-items:center}#octPanel .mx{cursor:pointer;font-size:16px}
#octPanel .mrow{display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin:4px 0}#octPanel .seg .btn[aria-pressed=true]{background:var(--accent);color:#fff;border-color:var(--accent)}
#octPanel .mh2{margin-top:8px;font:600 10px var(--f-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--muted);border-top:1px solid var(--rule);padding-top:5px}
#octPanel .mhint,#octPanel .mmsg,#octPanel .s{color:var(--muted);font-size:11px;line-height:1.35}#octPanel .mmsg:empty{display:none}
#octPanel label.n{display:inline-flex;align-items:center;gap:3px;font-size:11px}#octPanel label.n input[type=number]{width:46px;font-size:11px;padding:1px 3px}#octPanel input[type=text]{flex:1;min-width:0;font-size:11px;padding:2px 4px}
#octPanel select{font-size:11px;max-width:100%}#octPanel .btn.mini{padding:0 5px;font-size:10px;line-height:16px}#octPanel textarea{width:100%;box-sizing:border-box;font:10px var(--f-mono);height:70px}
#octPanel .octBom{border-collapse:collapse;font-size:11px;margin:3px 0}#octPanel .octBom td{padding:1px 6px 1px 0;border-bottom:1px solid var(--rule);vertical-align:top}
#octPanel .flechas{display:grid;grid-template-columns:repeat(3,26px);gap:2px}#octPanel .flechas .btn{padding:0;height:22px;font-size:12px}
#modo-3d .stage.octet-edit #view{cursor:crosshair}`; document.head.appendChild(css);
  const bt = document.createElement('button'); bt.className = 'btn'; bt.id = 'octetTg'; bt.textContent = '⬡ Octet'; bt.title = 'Editar la estructura: agregar, quitar y mover tubos y nodos'; const tr = document.getElementById('topright'); if (tr) tr.prepend(bt);
  const P = document.createElement('div'); P.id = 'octPanel'; P.hidden = true; stage.appendChild(P);
  P.innerHTML = `<div class="mh"><b>Octet</b><span class="mx" id="octX" title="Cerrar">×</span></div>
   <div class="mrow"><select id="octSel" title="Modelos guardados"></select><button class="btn mini" id="octNuevo" title="Modelo nuevo, vacío">Nuevo</button><button class="btn mini" id="octDup" title="Copiar este modelo con otro nombre">Duplicar</button><button class="btn mini" id="octBorrar" title="Borrar este modelo">Borrar</button></div>
   <div class="mrow"><input type="text" id="octNombre" placeholder="nombre" maxlength="60"><span class="s" id="octEstado"></span></div>
   <div class="mh2">Herramienta</div>
   <div class="mrow seg"><button class="btn mini" data-tool="">Navegar</button><button class="btn mini" data-tool="agregar">Agregar tubo</button><button class="btn mini" data-tool="quitar">Quitar</button><button class="btn mini" data-tool="mover">Elegir y mover</button><button class="btn mini" id="octUndo" title="Deshacer (Ctrl/⌘ Z)">↶</button></div>
   <div class="mhint" id="octHint"></div>
   <div class="mrow" id="octLargoRow"><label class="n">largo del tubo nuevo <select id="octLargo"><option value="1">L</option><option value="2">2 L</option><option value="3">3 L</option></select></label></div>
   <div id="octMover" hidden><div class="mrow"><span class="s" id="octSelN"></span><button class="btn mini" id="octSelTodo">Todos</button><button class="btn mini" id="octSelNada">Ninguno</button></div>
     <div class="mrow"><div class="flechas"><span></span><button class="btn" data-mv="0,2,0" title="+z (atrás)">▲</button><span></span><button class="btn" data-mv="-2,0,0" title="−x">◀</button><span></span><button class="btn" data-mv="2,0,0" title="+x">▶</button><span></span><button class="btn" data-mv="0,-2,0" title="−z (adelante)">▼</button><span></span></div>
       <div class="flechas"><button class="btn" data-mv="1,1,1" title="una capa arriba, corrido a +x +z">⇗</button><button class="btn" data-mv="0,0,2" title="dos capas arriba, en el mismo lugar">⇈</button><button class="btn" data-mv="-1,-1,1" title="una capa arriba, corrido a −x −z">⇖</button><button class="btn" data-mv="1,-1,-1" title="una capa abajo, corrido a +x −z">⇘</button><button class="btn" data-mv="0,0,-2" title="dos capas abajo, en el mismo lugar">⇊</button><button class="btn" data-mv="-1,1,-1" title="una capa abajo, corrido a −x +z">⇙</button></div></div>
     <div class="mrow"><label class="n">tipo de nodo <select id="octTipo"><option value="auto">según los tubos</option><option value="full">full (12)</option><option value="arriba">half, tubos arriba</option><option value="abajo">half, tubos abajo</option></select></label><button class="btn mini" id="octQuitarSel">Quitar elegidos</button></div></div>
   <div class="mh2">Retícula y piezas</div>
   <div class="mrow"><label class="n">L <input type="number" id="octL" step="0.5" min="5" max="500"></label><label class="n">Ø tubo <input type="number" id="octD" step="0.1" min="0.3" max="20"></label><label class="n">R nodo <input type="number" id="octR" step="0.1" min="0.5" max="30"></label><label class="n">descuento <input type="number" id="octDesc" step="0.1" min="0" max="20"></label></div>
   <div class="mrow"><label class="n"><input type="checkbox" id="octTapaOn"> vidrio</label><label class="n">esp. <input type="number" id="octTapaE" step="0.1" min="0.3" max="10"></label><label class="n">vuelo <input type="number" id="octTapaV" step="1" min="0" max="100"></label><label class="n">disco <input type="number" id="octTapaDisco" step="0.1" min="0" max="10"></label></div>
   <div class="mrow"><label class="n">ancho <input type="number" id="octTapaAn" step="1" min="0" max="600" title="0: sale de los nodos de arriba más el vuelo"></label><label class="n">fondo <input type="number" id="octTapaFo" step="1" min="0" max="600" title="0: sale de los nodos de arriba más el vuelo"></label><label class="n">corrido x <input type="number" id="octTapaDx" step="1" min="-300" max="300"></label><label class="n">z <input type="number" id="octTapaDz" step="1" min="-300" max="300"></label></div>
   <div class="mhint">Vidrio: con ancho y fondo en 0 sale de los nodos de arriba más el vuelo; con medidas, queda de ese tamaño centrado en los nodos (y corrido lo que digas).</div>
   <div class="mrow"><label class="n"><input type="checkbox" id="octPiesOn"> regatones</label><label class="n">alto <input type="number" id="octPiesH" step="0.1" min="0" max="10"></label></div>
   <div class="mhint">cm. L es de centro a centro de nodo; el tubo se corta a n·L − 2R − descuento. Supuesto hasta medir el nodo real.</div>
   <div class="mh2">Sembrar un bloque</div>
   <div class="mrow"><label class="n">x <input type="number" id="octBx" value="3" min="1" max="20" step="1"></label><label class="n">z <input type="number" id="octBz" value="2" min="1" max="20" step="1"></label><label class="n">capas <input type="number" id="octBc" value="3" min="1" max="12" step="1"></label><button class="btn mini" id="octBloque">Agregar bloque</button><button class="btn mini" id="octVaciar">Vaciar</button></div>
   <div class="mhint">Celdas de L × L por capa; las capas se apilan a L/√2. Lo agrega desde el origen con todos los tubos; después quitás lo que sobra.</div>
   <div class="mh2">Lista de materiales</div><div id="octBom"></div>
   <div class="mh2">Pasarlo a una casa</div>
   <div class="mhint">Lo guardado en este modelo lo leo yo y lo pongo como mueble «octet» en Carhué, Arcos o donde digas. Si querés copiarlo a mano:</div>
   <div class="mrow"><button class="btn mini" id="octCopiar">Copiar JSON</button><button class="btn mini" id="octPegar">Pegar JSON…</button></div><div id="octJson" hidden><textarea id="octTa"></textarea><div class="mrow"><button class="btn mini" id="octImportar">Importar</button><button class="btn mini" id="octJsonX">Cerrar</button></div></div>
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
  q('octSel').addEventListener('change', e => { if (e.target.value) abrir(e.target.value); });
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

  function lista() { const s = q('octSel'); const ids = Object.keys(MOD).sort((a, b) => (MOD[a].nombre || a).localeCompare(MOD[b].nombre || b)); s.innerHTML = ids.map(id => `<option value="${esc(id)}"${id === cur ? ' selected' : ''}>${esc(MOD[id].nombre || id)}</option>`).join('') || '<option value="">(sin modelos)</option>'; }
  let ult = null; function pintar() { if (P.hidden) return; const A = ult = O.armar(THREE, m); q('octBom').innerHTML = O.bomHTML(A.bom, m); if (document.activeElement !== q('octNombre')) q('octNombre').value = m.nombre || '';
    for (const [id, v] of [['octL', m.L], ['octD', m.d], ['octR', m.R], ['octDesc', m.desc || 0], ['octTapaE', m.tapa.e], ['octTapaV', m.tapa.vuelo], ['octTapaDisco', m.tapa.disco], ['octTapaAn', m.tapa.ancho || 0], ['octTapaFo', m.tapa.fondo || 0], ['octTapaDx', m.tapa.dx || 0], ['octTapaDz', m.tapa.dz || 0], ['octPiesH', m.pies.h]]) { const el = q(id); if (document.activeElement !== el) el.value = v; }
    q('octTapaOn').checked = !!m.tapa.on; q('octPiesOn').checked = !!m.pies.on; q('octSelN').textContent = sel.size ? `${sel.size} nodo(s) elegido(s)` : 'ningún nodo elegido';
    q('octEstado').textContent = `${Object.keys(m.nodos).length} nodos · ${m.struts.length} tubos${db ? '' : ' · sin base: queda en este navegador'}`; lista(); }

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
  const api = { get modelo() { return m; }, get armado() { return ult; }, get modelos() { return MOD; }, get cur() { return cur; }, abrir, nuevo, set, setTool, toggle: v => setOn(v == null ? P.hidden : v), get abierto() { return !P.hidden; } };
  visor.octet = api; window.__octet = api; return api;
}
