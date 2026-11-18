/* Explicaciones animadas (Maxi 18/11): «una animación explicativa de cómo es el armado y el funcionamiento, con movimientos de cámara
   como si fueran slides en 3D, gatillada desde el menú de variantes».
   Cada casa da sus explicaciones: initExplicaciones(visor, { explicaciones: { id: { titulo, params, pasos: [...] } } }).
   Una zona de variantes con `explica: '<id>'` muestra el botón «▶ Ver cómo se arma y funciona».
   Paso: { titulo, texto (HTML corto), cam: [x, alto, y], mira: [x, alto, y], dur (s, lo que queda en pantalla),
           params: {…} (se aplican al entrar), ocultar: RegExp (piezas que no se ven), solo: RegExp (las demás quedan fantasma),
           fantasma: RegExp, resaltar: RegExp (se tiñen), armar: [RegExp, …] (aparecen bajando, en ese orden),
           mover: [hoja, de, a] (mueve una corrediza de motor/corredizas.js), pos: [hoja, valor] (la deja ahí al entrar) }.
   Coordenadas en planta, como el resto: x (norte), y (este), alto. Al salir vuelve todo como estaba: variantes, cámara y piezas. */
export function initExplicaciones(visor, { explicaciones = {}, stage: st = null } = {}) {
  const { THREE, camera, controls } = visor, V = THREE.Vector3, stage = st || visor.stage;
  let E = null, i = 0, pausa = false, t0 = 0, raf = 0, P0 = null, cam0 = null, ui = null, cam = null, tw = [];
  const wake = () => window.__despertar && window.__despertar();
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const v3 = a => new V(a[0], a[1], a[2]);
  const ghost = new Map(), hl = new Map();
  function mallas(p, f) { p.grp.traverse(o => { if (o.isMesh) f(o); }); }
  /* deja cada pieza como estaba */
  function limpiar() { for (const p of visor.parts || []) mallas(p, o => { if (o.userData._exM) { o.material = o.userData._exM; delete o.userData._exM; } if (o.userData._exV != null) { o.visible = o.userData._exV; delete o.userData._exV; } });
    for (const t of tw) if (t.grp && t.y0 != null) t.grp.position.y = t.y0; tw = [];
    for (const [g, v] of eqV) g.visible = v; eqV.clear(); }
  /* en los cortes (paso con `solo`) también se esconden los muebles, las luces y la vegetación */
  const eqV = new Map();
  /* el visor puede volver a prender los muebles en cada cuadro (capas): se esconden ítem por ítem, y se repite en cada cuadro */
  function sinEquipo() { for (const n of ['equipamiento', 'vegetacion']) { const G = visor.scene.getObjectByName(n); if (!G) continue; for (const g of G.children) { if (!g.userData.item && n === 'equipamiento') continue; if (!eqV.has(g)) eqV.set(g, g.visible); g.visible = false; } } }
  function matFantasma(m) { if (!ghost.has(m)) { const g = m.clone(); g.transparent = true; g.opacity = .08; g.depthWrite = false; ghost.set(m, g); } return ghost.get(m); }
  function matResalte(m) { if (!hl.has(m)) { const g = m.clone(); if (g.emissive) { g.emissive = new THREE.Color(0xc0461f); g.emissiveIntensity = .55; } else if (g.color) g.color = new THREE.Color(0xd8642f); hl.set(m, g); } return hl.get(m); }
  function aplicarVista(s, armarOcultas) {
    for (const p of visor.parts || []) { const id = p.id || '';
      const oc = (s.ocultar && s.ocultar.test(id)) || armarOcultas.has(p), fa = !oc && ((s.solo && !s.solo.test(id)) || (s.fantasma && s.fantasma.test(id))), re = !oc && !fa && s.resaltar && s.resaltar.test(id);
      mallas(p, o => { if (oc) { if (o.userData._exV == null) o.userData._exV = o.visible; o.visible = false; }
        else if (fa || re) { if (!o.userData._exM) o.userData._exM = o.material; const m = o.userData._exM; o.material = Array.isArray(m) ? m.map(fa ? matFantasma : matResalte) : (fa ? matFantasma : matResalte)(m); } }); } }
  function paso(n) {
    limpiar(); i = Math.max(0, Math.min(E.pasos.length - 1, n)); const s = E.pasos[i];
    if (s.params) visor.setParams(s.params);
    if (s.pos && window.__corredizas) window.__corredizas.set(s.pos[0], s.pos[1]);
    /* armar: las piezas aparecen bajando, una tras otra */
    const ord = []; for (const r of s.armar || []) for (const p of visor.parts || []) if (r.test(p.id || '') && !ord.includes(p)) ord.push(p);
    const ocultas = new Set(ord); aplicarVista(s, ocultas); if (s.solo || s.sinEquipo) sinEquipo();
    const ahora = performance.now(), dCam = s.cam ? 1700 : 0;
    ord.forEach((p, k) => tw.push({ grp: p.grp, part: p, y0: p.grp.position.y, ini: ahora + dCam + 250 + k * 900, dur: 800, ocultas }));
    cam = s.cam ? { p0: camera.position.clone(), q0: controls.target.clone(), p1: v3(s.cam), q1: v3(s.mira || s.cam), ini: ahora, dur: dCam } : null;
    if (s.mover && window.__corredizas) { const [k, a, b] = s.mover; window.__corredizas.set(k, a); tw.push({ mover: [k, a, b], ini: ahora + dCam + 200, dur: (s.durMover || 5) * 1000 }); }
    t0 = ahora; pintarUI(); wake(); }
  function cuadro() { if (!E) return; const ahora = performance.now();
    if (cam) { const u = Math.min(1, (ahora - cam.ini) / Math.max(1, cam.dur)), e = ease(u); camera.position.lerpVectors(cam.p0, cam.p1, e); controls.target.lerpVectors(cam.q0, cam.q1, e); controls.update(); if (u >= 1) cam = null; }
    for (const t of tw) { const u = (ahora - t.ini) / t.dur; if (u < 0) continue; const e = ease(Math.min(1, u));
      if (t.mover) { const [k, a, b] = t.mover; window.__corredizas.set(k, a + (b - a) * e); continue; }
      if (t.ocultas.has(t.part)) { t.ocultas.delete(t.part); mallas(t.part, o => { if (o.userData._exV != null) { o.visible = o.userData._exV; delete o.userData._exV; } }); }
      t.grp.position.y = t.y0 + 140 * (1 - e); }
    if (E.pasos[i].solo || E.pasos[i].sinEquipo) sinEquipo();
    const s = E.pasos[i], dur = (s.dur || 7) * 1000 + (s.cam ? 1700 : 0) + Math.max(0, ...tw.map(t => t.ini + t.dur - t0));
    const bar = ui && ui.querySelector('[data-ex=bar]'); if (bar) bar.style.width = (pausa ? (ui._pct || 0) : (ui._pct = Math.min(100, (ahora - t0) / dur * 100))) + '%';
    if (pausa) t0 += 16; else if (ahora - t0 > dur) { if (i < E.pasos.length - 1) paso(i + 1); else { pausa = true; pintarUI(); } }
    wake(); raf = requestAnimationFrame(cuadro); }
  function pintarUI() {
    if (!ui) { ui = document.createElement('div'); ui.id = 'explicaUI';
      ui.style.cssText = 'position:absolute;left:50%;bottom:44px;transform:translateX(-50%);width:min(620px,calc(100% - 120px));background:rgba(250,248,244,.96);border:1px solid rgba(0,0,0,.12);border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.18);padding:12px 14px 10px;font:13px/1.45 var(--f-sans,system-ui);color:#222;z-index:40';
      (stage || document.body).appendChild(ui);
      ui.addEventListener('click', e => { const b = e.target.closest('[data-exb]'); if (!b) return; const k = b.dataset.exb;
        if (k === 'x') parar(); else if (k === 'p') { pausa = !pausa; pintarUI(); } else if (k === 'a') { pausa = false; paso(i - 1); } else if (k === 's') { pausa = false; if (i < E.pasos.length - 1) paso(i + 1); } }); }
    const s = E.pasos[i];
    ui.innerHTML = `<div style="display:flex;align-items:baseline;gap:8px"><b style="font-size:14px">${s.titulo || ''}</b><span style="margin-left:auto;font:500 10.5px var(--f-mono,monospace);color:#777">${E.titulo} · ${i + 1}/${E.pasos.length}</span></div>
      <div style="margin:6px 0 8px">${s.texto || ''}</div>
      <div style="height:2px;background:rgba(0,0,0,.08);border-radius:2px;margin-bottom:8px"><div data-ex="bar" style="height:2px;width:0;background:#c0461f;border-radius:2px"></div></div>
      <div style="display:flex;gap:6px"><button class="btn mini" data-exb="a" ${i ? '' : 'disabled'}>◀ anterior</button><button class="btn mini" data-exb="p">${pausa ? '▶ seguir' : '❚❚ pausa'}</button><button class="btn mini" data-exb="s" ${i < E.pasos.length - 1 ? '' : 'disabled'}>siguiente ▶</button><button class="btn mini" data-exb="x" style="margin-left:auto">✕ salir</button></div>`; }
  function teclas(e) { if (!E) return; if (e.key === 'Escape') parar(); else if (e.key === 'ArrowRight') { pausa = false; if (i < E.pasos.length - 1) paso(i + 1); } else if (e.key === 'ArrowLeft') { pausa = false; paso(i - 1); } else if (e.key === ' ') { pausa = !pausa; pintarUI(); e.preventDefault(); } }
  function iniciar(id) {
    const X = explicaciones[id]; if (!X) return; if (E) parar();
    E = X; i = 0; pausa = false; P0 = { ...visor.params }; cam0 = { p: camera.position.clone(), q: controls.target.clone() };
    const d3 = document.querySelector('[data-modo="3d"]'); if (d3 && !d3.classList.contains('on') && d3.getAttribute('aria-pressed') !== 'true') d3.click();
    if (X.params) visor.setParams(typeof X.params === 'function' ? X.params(visor.params) : X.params);
    addEventListener('keydown', teclas); paso(0); cancelAnimationFrame(raf); raf = requestAnimationFrame(cuadro); }
  function parar() {
    if (!E) return; cancelAnimationFrame(raf); limpiar(); removeEventListener('keydown', teclas);
    const vuelta = {}; for (const k in P0) if (String(P0[k]) !== String(visor.params[k])) vuelta[k] = P0[k]; if (Object.keys(vuelta).length) visor.setParams(vuelta);
    if (cam0) { camera.position.copy(cam0.p); controls.target.copy(cam0.q); controls.update(); }
    if (ui) { ui.remove(); ui = null; } E = null; wake(); }
  const api = { iniciar, parar, activa: () => !!E, lista: () => Object.keys(explicaciones) };
  visor.explica = api; window.__explica = api; return api;
}
