/* Arrastrar un parámetro (Maxi 21/11, en la columna de elevación: «hacé que lo pueda mover con drag and drop, así entiendo cómo funciona»).
   La casa declara qué piezas, al arrastrarlas hacia arriba o abajo, cambian un parámetro numérico:
     initArrastre(visor, [{ param: 'subida', piezas: /^C-(08|09)$/, activo?: P => bool, escala?: 1, eje?: 'x' | 'z' }])  (eje: arrastre horizontal en ese eje del visor; sin eje, vertical)
   Arrastrar verticalmente una de esas piezas cambia el parámetro en cm de pantalla-mundo (lo que sube el puntero en el plano vertical de la pieza)
   y el visor rearma en vivo (un rearme por cuadro como mucho). Un toque sin arrastre elige la pieza, como siempre.
   Respeta las herramientas abiertas (medir, señalar, marcas, editar) y el candado. */
export function initArrastre(visor, defs) {
  const view = document.getElementById('view'); if (!view || !defs || !defs.length) return;
  const T = visor.THREE, ray = new T.Raycaster(), mv = new T.Vector2();
  const base = id => (id || '').replace(/[a-z]$/, '');
  const setRay = e => { const r = visor.renderer.domElement.getBoundingClientRect(); mv.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(mv, visor.camera); };
  const ocupado = () => document.querySelector('#senPanel:not([hidden]),#medPanel:not([hidden]),#marcasPanel:not([hidden]),#edPanel:not([hidden])') || (visor.explica && visor.explica.activa && visor.explica.activa());
  const defDe = id => defs.find(d => d.piezas.test(id) && (!d.activo || d.activo(visor.params)));
  /* mínimo, máximo y paso del parámetro: los del deslizador de la barra (#q-<id>) */
  const qDe = id => { const el = document.getElementById('q-' + id); if (!el) return {}; const l = el.closest('label'); let lab = ''; if (l) { const c = l.cloneNode(true); c.querySelectorAll('input,select,output,b,span.v').forEach(x => x.remove()); lab = c.textContent.trim(); }
    const o = document.getElementById('q-' + id + '-o'); return { min: el.min !== '' ? +el.min : null, max: el.max !== '' ? +el.max : null, step: +el.step || 1, label: lab || id, unit: o ? o.textContent.replace(/^[\d.,\-\s]+/, ' ') : '' }; };
  let dr = null, pend = null, raf = 0;
  const empujar = () => { raf = 0; if (pend == null || !dr) return; const v = pend; pend = null; visor.setParams({ [dr.d.param]: v }); };
  const st = txt => { const s = document.getElementById('stTool'); if (s) s.innerHTML = txt; };
  view.addEventListener('pointerdown', e => {
    if (e.button !== 0 || ocupado()) return; setRay(e); const ms = [];
    for (const p of visor.parts || []) if (p.grp && p.grp.visible !== false) p.grp.traverse(o => { if (o.isMesh) ms.push(o); });
    const h = ray.intersectObjects(ms, false)[0]; if (!h) return; const pid = base(h.object.userData.id); const d = pid && defDe(pid); if (!d) return;
    if (visor.candado && visor.candado.bloqueada && visor.candado.bloqueada(pid)) return;
    const q = qDe(d.param); const v0 = +visor.params[d.param]; if (!isFinite(v0)) return;
    e.stopPropagation(); try { view.setPointerCapture(e.pointerId); } catch (_) {} visor.controls.enabled = false;
    /* plano vertical por el punto tocado, de frente a la cámara */
    const n = new T.Vector3(); visor.camera.getWorldDirection(n); n.y = 0; if (n.lengthSq() < 1e-6) n.set(0, 0, 1); n.normalize();
    /* d.eje (Maxi 22/11, escalera de dos tramos): 'x' o 'z' arrastra en horizontal, sobre el plano horizontal de la pieza; sin eje, en vertical */
    const ej = d.eje || 'y', pl = ej === 'y' ? new T.Plane().setFromNormalAndCoplanarPoint(n, h.point) : new T.Plane().setFromNormalAndCoplanarPoint(new T.Vector3(0, 1, 0), h.point);
    dr = { d, pid, q, v0, ej, sx: e.clientX, sy: e.clientY, moved: false, y0: h.point[ej], plane: pl };
  }, true);
  view.addEventListener('pointermove', e => {
    if (!dr) return; e.stopPropagation();
    if (!dr.moved) { if (Math.hypot(e.clientX - dr.sx, e.clientY - dr.sy) < 4) return; dr.moved = true; }
    setRay(e); const pt = ray.ray.intersectPlane(dr.plane, new T.Vector3()); if (!pt) return;
    const q = dr.q || {}, paso = +q.step || 1; let v = dr.v0 + (pt[dr.ej] - dr.y0) * (dr.d.escala || 1);
    v = Math.round(v / paso) * paso; if (q.min != null) v = Math.max(+q.min, v); if (q.max != null) v = Math.min(+q.max, v);
    if (v !== +visor.params[dr.d.param]) { pend = v; if (!raf) raf = requestAnimationFrame(empujar); }
    st(`<b>${(q.label || dr.d.param)}</b>: ${v}${q.unit || ''}`);
  }, true);
  const fin = e => { if (!dr) return; e.stopPropagation(); visor.controls.enabled = true; const d = dr; dr = null; if (raf) { cancelAnimationFrame(raf); raf = 0; } if (pend != null) { visor.setParams({ [d.d.param]: pend }); pend = null; }
    if (!d.moved) { visor.showPart && visor.showPart(d.pid); } };
  view.addEventListener('pointerup', fin, true); view.addEventListener('pointercancel', fin, true);
  visor.arrastre = { defs };
}
