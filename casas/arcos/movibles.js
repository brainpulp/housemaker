/* Partes que se mueven (Maxi, 16/10): las hojas del ventanal O de tu SketchUp (SU-01, paños de 1 × 1) separadas sin
   rehacerlas, y las persianas de la fachada E. Las hojas se corren en x dentro de su riel; las persianas se enrollan.
   El estado queda en este navegador y se aplica después de cada armado. */
export const HOJAS = {
  'VO-H1': { nombre: 'Hoja corrediza 1 de la PB (S)', min: 0, max: 615 },
  'VO-H2': { nombre: 'Hoja corrediza 2 de la PB', min: -209, max: 405 },
  'VO-H3': { nombre: 'Hoja corrediza 3 de la PB', min: -564, max: 50 },
  'VO-H4': { nombre: 'Hoja corrediza 4 de la PB (N)', min: -614, max: 0 },
  'VO-A': { nombre: 'Hoja corrediza alta S (2P)', min: -190, max: 0, dz: 6 },
  'VO-B': { nombre: 'Hoja corrediza alta N (2P)', min: 0, max: 200, dz: 6 },
  'VO-V': { nombre: 'Ventilación corrediza del baño de 2P', min: -35, max: 61, dz: 3 },
};
/* qué hoja es cada triángulo de SU-01: por pieza conectada (bbox) y, en el marco blanco de las dos hojas altas del medio, por x */
export function partirSU01(pos) {
  const nT = pos.length / 9, par = Int32Array.from({ length: nT }, (_, i) => i), f = i => { while (par[i] !== i) { par[i] = par[par[i]]; i = par[i]; } return i; }, vk = new Map();
  for (let t = 0; t < nT; t++) for (let k = 0; k < 3; k++) { const o = t * 9 + k * 3, key = `${Math.round(pos[o] * 4)},${Math.round(pos[o + 1] * 4)},${Math.round(pos[o + 2] * 4)}`; const u = vk.get(key); if (u !== undefined) par[f(t)] = f(u); else vk.set(key, t); }
  const bb = new Map(); for (let t = 0; t < nT; t++) { const r = f(t); let b = bb.get(r); if (!b) bb.set(r, b = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9]);
    for (let k = 0; k < 3; k++) for (let a = 0; a < 3; a++) { const v = pos[t * 9 + k * 3 + a]; b[a] = Math.min(b[a], v); b[a + 3] = Math.max(b[a + 3], v); } }
  const grupo = t => { const b = bb.get(f(t)), [x0, z0, y0, x1, z1, y1] = b;
    if (y1 > 2480) return null;                                         /* ventanas de 2P a la terraza: quedan en SU-01 */
    if (z1 < 495 && z1 > 90) { const ym = Math.round(y0); return ym >= 2354 ? 'VO-H1' : ym >= 2348 ? 'VO-H2' : ym >= 2342 ? 'VO-H3' : 'VO-H4'; }
    if (z0 > 612) { if (x0 > 670 && x1 < 790 && z0 > 710 && z1 < 815) return 'VO-V';
      if (x0 > 215 && x1 < 645) { if (x1 - x0 > 300) { const cx = (pos[t * 9] + pos[t * 9 + 3] + pos[t * 9 + 6]) / 3; return cx < 431 ? 'VO-A' : 'VO-B'; } return (x0 + x1) / 2 < 431 ? 'VO-A' : 'VO-B'; } }
    return null; };
  const out = {}; for (let t = 0; t < nT; t++) { const g = grupo(t) || 'resto'; (out[g] = out[g] || []).push(...pos.subarray(t * 9, t * 9 + 9)); }
  for (const k in out) out[k] = new Float32Array(out[k]); return out;
}

let MOV = {}; try { MOV = JSON.parse(localStorage.getItem('arcos-mov') || '{}'); } catch (e) {}
const guardar = () => { try { localStorage.setItem('arcos-mov', JSON.stringify(MOV)); } catch (e) {} };
const base = id => id.replace(/[a-z]$/, '').replace(/p$/, '');
export function initMovibles(visor, root, M) {
  const persiana = id => { const a = M.ABERTURAS.find(o => o.id === id), F = M.MUROS.find(m => m.id === a.muro); const z0 = (F.z0 ?? 0) + (a.s || 0); return { z0, z1: z0 + a.h }; };
  const aplicar = () => { for (const p of visor.parts || []) { if (!p.grp) continue;
      if (/^VO-/.test(p.id)) { const k = base(p.id), h = HOJAS[k]; if (!h) continue; const v = MOV[k] || 0; p.grp.position.x = v; p.grp.position.z = Math.abs(v) > 1 ? (h.dz || 0) : 0; }
      else if (/^V-0[1-3]p$/.test(p.id)) { const k = p.id.slice(0, 4), f = (MOV[k] || 0) / 100, { z1 } = persiana(k), s = Math.max(.04, 1 - f); p.grp.scale.y = s; p.grp.position.y = z1 * (1 - s); } }
    window.__despertar && window.__despertar(); };
  let ult = null; setInterval(() => { if (visor.parts !== ult) { ult = visor.parts; aplicar(); } }, 250);
  document.addEventListener('input', e => { const r = e.target.closest && e.target.closest('[data-mov]'); if (!r) return; MOV[r.dataset.mov] = +r.value; const o = document.querySelector(`[data-movv="${r.dataset.mov}"]`); if (o) o.textContent = r.dataset.fmt === '%' ? r.value + ' %' : (r.value / 100).toFixed(2).replace('.', ','); aplicar(); });
  document.addEventListener('change', e => { if (e.target.closest && e.target.closest('[data-mov]')) guardar(); });
  /* arrastrar (como en Carhué): las hojas corren en x por su riel; la persiana sube o baja. Respeta el interruptor «Mover: sí / no»
     y el candado de cada parte (motor/candado.js): bloqueada, arrastrar orbita y el toque la elige. */
  { const view = document.getElementById('view'), T = visor.THREE, ray = new T.Raycaster(), mv = new T.Vector2(); let dr = null;
    const setRay = e => { const r = visor.renderer.domElement.getBoundingClientRect(); mv.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(mv, visor.camera); };
    const ocupado = () => document.querySelector('#editarTg[aria-pressed=true],#edPanel:not([hidden]),#senPanel:not([hidden]),#medPanel:not([hidden]),#marcasPanel:not([hidden])');
    const clave = id => { const k = base(id); return HOJAS[k] ? k : /^V-0[1-3]p$/.test(id) ? id.slice(0, 4) : null; };
    const fmt = (k, v) => HOJAS[k] ? (v / 100).toFixed(2).replace('.', ',') + ' m' : Math.round(v) + ' %';
    if (view) {
      view.addEventListener('pointerdown', e => { if (e.button !== 0 || ocupado()) return; setRay(e); const ms = [];
        for (const p of visor.parts || []) if (p.grp && p.grp.visible !== false && clave(p.id)) p.grp.traverse(o => { if (o.isMesh) ms.push(o); });
        const h = ray.intersectObjects(ms, false)[0]; if (!h) return; const pid = h.object.userData.id, k = clave(pid); if (!k) return;
        if (visor.candado && visor.candado.bloqueada(k)) { visor.candado.mostrar(k, h.point); return; }
        e.stopPropagation(); view.setPointerCapture(e.pointerId); visor.controls.enabled = false;
        dr = { k, pid, sx: e.clientX, sy: e.clientY, moved: false, p0: h.point.clone(), v0: MOV[k] || 0, plane: new T.Plane(new T.Vector3(0, 0, 1), -h.point.z) }; }, true);
      view.addEventListener('pointermove', e => { if (!dr) return; e.stopPropagation();
        if (!dr.moved) { if (Math.hypot(e.clientX - dr.sx, e.clientY - dr.sy) < 4) return; dr.moved = true; visor.candado && visor.candado.mostrar(dr.k, dr.p0); }
        setRay(e); const q = ray.ray.intersectPlane(dr.plane, new T.Vector3()); if (!q) return; const H = HOJAS[dr.k];
        const v = H ? Math.max(H.min, Math.min(H.max, dr.v0 + (q.x - dr.p0.x))) : Math.max(0, Math.min(100, dr.v0 + (q.y - dr.p0.y) / (persiana(dr.k).z1 - persiana(dr.k).z0) * 100));
        MOV[dr.k] = Math.round(v); aplicar(); const st = document.getElementById('stTool'); if (st) st.innerHTML = `<b>${dr.k}</b> ${H ? 'corrida' : 'persiana'} ${fmt(dr.k, MOV[dr.k])}`; }, true);
      const fin = e => { if (!dr) return; e.stopPropagation(); visor.controls.enabled = true; const d = dr; dr = null;
        if (!d.moved) { visor.showPart && visor.showPart(d.pid); visor.candado && visor.candado.mostrar(d.k, d.p0); return; }
        visor.candado && visor.candado.mostrar(d.k); guardar(); };
      view.addEventListener('pointerup', fin, true); view.addEventListener('pointercancel', fin, true); } }
  /* control para el panel de la pieza */
  return { html(id) { const k = base(id);
    if (HOJAS[k]) { const h = HOJAS[k], v = MOV[k] || 0; return `<div class="renrow" style="align-items:center;gap:8px"><span>Correr</span><input type="range" data-mov="${k}" min="${h.min}" max="${h.max}" step="1" value="${v}" style="flex:1"><b data-movv="${k}">${(v / 100).toFixed(2).replace('.', ',')}</b></div>`; }
    if (/^V-0[1-3]$/.test(k)) { const v = MOV[k] || 0; return `<div class="renrow" style="align-items:center;gap:8px"><span>Persiana</span><input type="range" data-mov="${k}" data-fmt="%" min="0" max="100" step="1" value="${v}" style="flex:1"><b data-movv="${k}">${v} %</b></div>`; }
    return ''; } };
}
