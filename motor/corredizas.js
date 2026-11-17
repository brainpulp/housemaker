/* Hojas corredizas que se abren arrastrándolas (motor; generaliza casas/arcos/movibles.js, que sigue siendo de Arcos por sus persianas y su SketchUp).
   La casa declara sus hojas: { 'MN-05': { nombre, eje: 'y' | 'x', min, max, pend? } } o, para las que giran (17/11: proyectantes, banderolas),
   { nombre, giro: { x, z, s? } | () => {…}, min, max, alMover?(v, visor) }: giran en grados alrededor de un eje horizontal paralelo a y que pasa por (x, z);
   alMover sirve para mover piezas que dependen de la hoja (amortiguadores, brazos). (cm, en ejes de planta; 0 = cerrada) y las piezas de cada hoja llevan ese id
   más una letra opcional (MN-05, MN-05h). Arrastrar una hoja la corre por su riel; el toque sin arrastre la elige. El estado queda en este navegador.
   Respeta el candado de cada parte (motor/candado.js) y no actúa mientras hay otra herramienta abierta. Devuelve { html(id) } con el deslizador para la ficha. */
export function initCorredizas(visor, HOJAS, pref = 'casa') {
  const KEY = pref + '-corredizas'; let MOV = {}; try { MOV = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
  const guardar = () => { try { localStorage.setItem(KEY, JSON.stringify(MOV)); } catch (e) {} };
  const base = id => id.replace(/[a-z]$/, ''), clave = id => HOJAS[base(id)] ? base(id) : null;
  const fmt = v => (Math.abs(v) / 100).toFixed(2).replace('.', ','), fmtK = (k, v) => HOJAS[k] && HOJAS[k].giro ? Math.round(v) + '°' : fmt(v) + ' m';
  const gir = H => typeof H.giro === 'function' ? H.giro() : H.giro;
  const aplicar = () => { for (const p of visor.parts || []) { const k = p.grp && clave(p.id); if (!k) continue; const v = MOV[k] || 0;
      if (HOJAS[k].giro) { const g = gir(HOJAS[k]); if (!g) continue; const a = v * Math.PI / 180 * (g.s || 1), c = Math.cos(a), sn = Math.sin(a); p.grp.rotation.z = a; p.grp.position.set(g.x - (c * g.x - sn * g.z), g.z - (sn * g.x + c * g.z), 0); continue; }
      if (HOJAS[k].eje === 'x') p.grp.position.x = v; else p.grp.position.z = v; if (HOJAS[k].pend) p.grp.position.y = v * HOJAS[k].pend;   /* pend: lo que sube por cada cm que corre (techo corredizo sobre una pendiente) */ }
    for (const k of Object.keys(HOJAS)) if (HOJAS[k].alMover) try { HOJAS[k].alMover(MOV[k] || 0, visor); } catch (e) {}
    window.__despertar && window.__despertar(); };
  let ult = null; setInterval(() => { if (visor.parts !== ult) { ult = visor.parts; aplicar(); } }, 250);
  document.addEventListener('input', e => { const r = e.target.closest && e.target.closest('[data-corr]'); if (!r) return; MOV[r.dataset.corr] = +r.value; const o = document.querySelector(`[data-corrv="${r.dataset.corr}"]`); if (o) o.textContent = fmtK(r.dataset.corr, +r.value); aplicar(); });
  document.addEventListener('change', e => { if (e.target.closest && e.target.closest('[data-corr]')) guardar(); });
  const view = document.getElementById('view'), T = visor.THREE, ray = new T.Raycaster(), mv = new T.Vector2(); let dr = null;
  const setRay = e => { const r = visor.renderer.domElement.getBoundingClientRect(); mv.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(mv, visor.camera); };
  const ocupado = () => /* 16/11: «editar muebles» prendido ya no bloquea las hojas (Maxi no las podía mover): si la hoja es lo primero que toca el rayo, no hay mueble delante */ document.querySelector('#senPanel:not([hidden]),#medPanel:not([hidden]),#marcasPanel:not([hidden])');
  if (view) {
    view.addEventListener('pointerdown', e => { if (e.button !== 0 || ocupado()) return; setRay(e); const ms = [];
      for (const p of visor.parts || []) if (p.grp && p.grp.visible !== false) p.grp.traverse(o => { if (o.isMesh) ms.push(o); });
      const h = ray.intersectObjects(ms, false)[0]; if (!h) return; const pid = h.object.userData.id, k = pid && clave(pid); if (!k) return;   /* sólo si la hoja es lo primero que toca el rayo */
      if (visor.candado && visor.candado.bloqueada(k)) { visor.candado.mostrar(k, h.point); return; }
      e.stopPropagation(); try { view.setPointerCapture(e.pointerId); } catch (_) {} visor.controls.enabled = false;
      /* plano horizontal a la altura del toque: la hoja corre en planta, así el arrastre sirve desde cualquier ángulo que no sea rasante */
      dr = { k, pid, sx: e.clientX, sy: e.clientY, moved: false, p0: h.point.clone(), v0: MOV[k] || 0, plane: new T.Plane(new T.Vector3(0, 1, 0), -h.point.y) }; }, true);
    view.addEventListener('pointermove', e => { if (!dr) return; e.stopPropagation();
      if (!dr.moved) { if (Math.hypot(e.clientX - dr.sx, e.clientY - dr.sy) < 4) return; dr.moved = true; }
      const H = HOJAS[dr.k]; let nv;
      if (H.giro) nv = dr.v0 + (dr.sy - e.clientY) * .4;   /* las que giran: arrastrar hacia arriba abre */
      else { setRay(e); const q = ray.ray.intersectPlane(dr.plane, new T.Vector3()); if (!q) return; nv = dr.v0 + (H.eje === 'x' ? q.x - dr.p0.x : q.z - dr.p0.z); }
      MOV[dr.k] = Math.round(Math.max(H.min, Math.min(H.max, nv))); aplicar(); const st = document.getElementById('stTool'); if (st) st.innerHTML = `<b>${dr.k}</b> abierta ${fmtK(dr.k, MOV[dr.k])}`; }, true);
    const fin = e => { if (!dr) return; e.stopPropagation(); visor.controls.enabled = true; const d = dr; dr = null; if (!d.moved) { visor.showPart && visor.showPart(d.pid); return; } guardar(); };
    view.addEventListener('pointerup', fin, true); view.addEventListener('pointercancel', fin, true); }
  return { aplicar, set(k, v) { if (HOJAS[k]) { MOV[k] = v; aplicar(); guardar(); } },
    html(id) { const k = clave(id); if (!k) return ''; const h = HOJAS[k], v = MOV[k] || 0;
      return `<div class="renrow" style="align-items:center;gap:8px"><span>Abrir</span><input type="range" data-corr="${k}" min="${h.min}" max="${h.max}" step="1" value="${v}" style="flex:1"><b data-corrv="${k}">${fmtK(k, v)}</b></div>`; } };
}
