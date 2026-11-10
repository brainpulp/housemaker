/* Cocinas — escena compuesta con los cortes de las tres cocinas de Maxi (Carhué, Mocoretá y Arcos), como «islas» sin techo, para
   diseñarlas en detalle con el mismo motor que las casas.
   No es una copia: Carhué y Arcos se recortan ACÁ, al cargar, desde sus modelo.js reales (fuente-carhue.js y fuente-arcos.js; en el
   repo son re-exportaciones de casas/carhue y casas/arcos, y al armar, armar-extra.sh pone las copias reales en dist/cocinas).
   Así las paredes, aberturas y estructura de cada cocina siguen a su casa. Mocoretá no tiene modelo: sale de mocoreta.js (croquis).
   Lo que se diseña (muebles, mesadas, alacenas, luces) vive en equipamiento-cocinas.js y en la base de esta página.

   Ejes de la escena (cm): x de sur a norte, y de oeste a este, z altura; piso terminado de cada cocina en 0. Las tres van una al lado
   de la otra a lo largo de y, con 3 m entre caja y caja (1 m entre Carhué y Arcos desde el 7/11): Mocoretá (y 0–6,30), Carhué (y 9,30–19,10), Arcos (y 20,10–27,55).
   Las tres tienen la mesada principal contra su pared sur, así que se dejan con su norte real; se comparan mirando desde el norte.
   Códigos: los de cada casa con prefijo MO: / CH: / AR: (CH:M-20 es la M-20 de Carhué). */
import * as CARHUE from './fuente-carhue.js';
import * as ARCOS from './fuente-arcos.js';
import { MO } from './mocoreta.js';

export const META = { nombre: 'Cocinas', version: '0.1.47', fecha: '2026-11-08',
  resumen: 'Las tres cocinas (Carhué, Mocoretá, Arcos) recortadas de sus casas y puestas en una misma escena, sin techo, para diseñarlas en detalle.',
  ejes: 'x de sur a norte, y de oeste a este; piso de Mocoretá y Carhué en 0, el de Arcos en +0,51 (su estar hundido en +0,01). Mocoretá en y 0–6,30, Carhué en 9,30–19,10, Arcos en 20,10–27,55. Cada pieza lleva el prefijo de su casa: MO:, CH:, AR:.',
  planta: { vb: { x: -200, y: -150, w: 1000, h: 3050 }, casa: { cx: 280, cy: 1370, w: 900, h: 2900 }, lote: { cx: 280, cy: 1370, w: 900, h: 2900 }, ejesExt: { x0: -60, x1: 600, y0: -60, y1: 2800 }, ghost: 'PB',
    nivelesOrden: ['PB', 'EP', 'TE'], spec: 'tres cocinas · <b>Mocoretá</b> · <b>Carhué</b> · <b>Arcos</b>' } };

/* ---------- las tres casas: de dónde sale cada una, qué caja se recorta y cómo se traslada ---------- */
/* caja: lista de rectángulos (unión) en los ejes de la casa de origen; d: traslado a la escena (x, y, z); topes: alturas de muros
   que en la casa de origen no están en las tablas (Carhué las fija en su casa.js); tope: altura máxima de corte de los muros. */
export const CASAS = [
  { pre: 'MO', nombre: 'Mocoretá', fuente: 'croquis de Maxi (3/11/2026)', M: MO, caja: [{ x: [-10, 545], y: [-20, 640] }], d: [0, 0, 0], niveles: ['PB'], tope: 260, techosPropios: true,
    piso: 0, caja_escena: { x: [-10, 545], y: [-20, 640] } },
  { pre: 'CH', nombre: 'Carhué', fuente: 'casas/carhue/modelo.js', M: CARHUE, caja: [{ x: [1817, 2097], y: [-645, 360] }, { x: [2036, 2382], y: [-340, 360] }, { x: [1567, 1817], y: [0, 360] }] /* Maxi 7/11: 2 m más de living hacia el este (antes hasta 160), para otra mesa; y 2,50 del living al sur de la cocina, para que se vea que la pared sur (M-20) termina ahí porque la casa dobla: sigue M-02 hacia el sur */, d: [-1817, 1550, 0], niveles: ['PB'], ocultar: ['MES-1', 'HEL-1'],
    /* opciones de diseño de Carhué que tocan la cocina (Maxi 7/11): la puerta del baño piletero P-26 va en M-24, mirando al sur (la variante «m24» de casa.js); la escalera al altillo es la variante por defecto de Carhué (desde el 9/11, el caracol S) con sus valores de siempre (casa.js) */
    ajustes: { 'P-26': { muro: 'M-24', d: 134, w: 78 } },
    topes: { 'M-20': 292, 'M-22': 302, 'M-26': 335, 'M-02': 255, 'M-03': 255, 'M-24': 262, 'M-28': 262, 'M-25': 262, 'M-23': 262, 'M-29': 262 }, tope: 340, piso: 0, caja_escena: { x: [-250, 565], y: [905, 1910] } },
  { pre: 'AR', nombre: 'Arcos', fuente: 'casas/arcos/modelo.js', M: ARCOS, caja: [{ x: [-20, 540], y: [2340, 3085] }],/* hasta 70 pasado el borde de la fosa (x 470, medido 5/11), para ver el escalón */ d: [0, -330, -21], niveles: ['PB', 'EP'], techoNiveles: ['P2'], tope: 592,
    piso: 51, caja_escena: { x: [-20, 470], y: [2010, 2755] } },
];

/* ---------- recorte ---------- */
const MIN_SEG = 25;      /* un tramo de muro o viga más corto que esto, si no es el muro entero, se descarta (astilla del corte) */
const MIN_AREA = 5000;   /* 0,5 m²: idem para polígonos */
const enCaja = (c, x, y) => x >= c.x[0] && x <= c.x[1] && y >= c.y[0] && y <= c.y[1];
const enCajas = (cajas, x, y) => cajas.some(c => enCaja(c, x, y));
/* intervalo paramétrico [t0,t1] de un segmento dentro de un rectángulo (Liang–Barsky) */
function clipSegRect(a, b, c) { let t0 = 0, t1 = 1; const dx = b[0] - a[0], dy = b[1] - a[1];
  for (const [p, q] of [[-dx, a[0] - c.x[0]], [dx, c.x[1] - a[0]], [-dy, a[1] - c.y[0]], [dy, c.y[1] - a[1]]]) {
    if (p === 0) { if (q < 0) return null; continue; } const r = q / p; if (p < 0) { if (r > t1) return null; if (r > t0) t0 = r; } else { if (r < t0) return null; if (r < t1) t1 = r; } }
  return [t0, t1]; }
/* unión de los intervalos del segmento en todas las cajas */
function clipSeg(a, b, cajas) { const iv = cajas.map(c => clipSegRect(a, b, c)).filter(Boolean).sort((p, q) => p[0] - q[0]); const out = [];
  for (const [t0, t1] of iv) { const u = out[out.length - 1]; if (u && t0 <= u[1] + 1e-9) u[1] = Math.max(u[1], t1); else out.push([t0, t1]); } return out; }
/* Sutherland–Hodgman contra un rectángulo */
function clipPolyRect(poly, c) { let P = poly;
  for (const [ax, val, keepLess] of [[0, c.x[0], false], [0, c.x[1], true], [1, c.y[0], false], [1, c.y[1], true]]) { if (!P.length) return [];
    const inside = p => keepLess ? p[ax] <= val : p[ax] >= val, Q = [];
    for (let i = 0; i < P.length; i++) { const s = P[i], e = P[(i + 1) % P.length], si = inside(s), ei = inside(e);
      const cross = () => { const t = (val - s[ax]) / (e[ax] - s[ax]); return [s[0] + (e[0] - s[0]) * t, s[1] + (e[1] - s[1]) * t]; };
      if (si && ei) Q.push(e); else if (si && !ei) Q.push(cross()); else if (!si && ei) { Q.push(cross()); Q.push(e); } }
    P = Q; }
  return P.map(p => [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10]); }
const area = p => Math.abs(p.reduce((s, [x, y], i) => { const [x2, y2] = p[(i + 1) % p.length]; return s + x * y2 - x2 * y; }, 0)) / 2;
const dentroPoly = (poly, c) => poly.every(p => enCaja(c, ...p));
/* polígono recortado por la unión de cajas: si entra entero en una, va una vez; si no, un pedazo por caja (se solapan en la franja común) */
function clipPoly(poly, cajas) { if (!poly || !poly.length) return [];
  if (cajas.some(c => dentroPoly(poly, c))) return [poly];
  const out = []; for (const c of cajas) { const q = clipPolyRect(poly, c); if (q.length >= 3 && area(q) >= MIN_AREA) out.push(q); }
  /* dos pedazos que son el mismo (caja repetida) → uno */
  return out.filter((q, i) => out.findIndex(r => JSON.stringify(r) === JSON.stringify(q)) === i); }

/* ---------- composición ---------- */
const mv = (d, p) => [Math.round((p[0] + d[0]) * 10) / 10, Math.round((p[1] + d[1]) * 10) / 10];
const T = {}; for (const k of ['MUROS', 'ABERTURAS', 'LOCALES', 'LOSAS', 'ESTRUCTURA', 'ESCALERAS', 'BARANDAS', 'TECHOS', 'CHIMENEAS', 'DECK', 'IMPLANTACION', 'CLARABOYAS', 'DUDAS']) T[k] = [];
const ids = new Set();
for (const H of CASAS) {
  const { pre, M, caja, d } = H, dz = d[2], P = id => `${pre}:${id}`, niv = new Set(H.niveles), nivTecho = new Set(H.techoNiveles || []);
  const top = m => { let t = m.top ?? (H.topes || {})[m.id] ?? null; if (t == null) t = (m.z0 ?? (M.NIVELES[m.nivel] || {}).z ?? 0) + (m.h || 260); return t; };
  const nivelOk = r => !r.nivel || niv.has(r.nivel);
  const casa = { casa: pre };
  const AB = H.ajustes ? M.ABERTURAS.map(o => H.ajustes[o.id] ? { ...o, ...H.ajustes[o.id] } : o) : M.ABERTURAS;   /* variantes de la casa que no están en sus tablas */
  /* muros y sus aberturas */
  for (const m of M.MUROS) { if (!nivelOk(m)) continue; const L = Math.hypot(m.b[0] - m.a[0], m.b[1] - m.a[1]); if (!L) continue;
    const tramos = clipSeg(m.a, m.b, caja); const t0 = Array.isArray(top(m)) ? top(m) : null;
    tramos.forEach(([u0, u1], k) => { const Lk = (u1 - u0) * L, entero = u0 < 1e-6 && u1 > 1 - 1e-6; if (!entero && Lk < MIN_SEG) return;
      const a = [m.a[0] + (m.b[0] - m.a[0]) * u0, m.a[1] + (m.b[1] - m.a[1]) * u0], b = [m.a[0] + (m.b[0] - m.a[0]) * u1, m.a[1] + (m.b[1] - m.a[1]) * u1];
      let tp = t0 ? [t0[0] + (t0[1] - t0[0]) * u0, t0[0] + (t0[1] - t0[0]) * u1] : top(m);
      tp = Array.isArray(tp) ? tp.map(v => Math.min(v + dz, H.tope)) : Math.min(tp + dz, H.tope);
      if (Array.isArray(tp) && Math.abs(tp[0] - tp[1]) < .5) tp = tp[0];
      const id = P(m.id) + (tramos.length > 1 ? String.fromCharCode(65 + k) : ''); ids.add(id);
      const z0 = (m.z0 ?? (M.NIVELES[m.nivel] || {}).z ?? 0) + dz;
      const row = { ...m, ...casa, id, nivel: 'PB', a: mv(d, a), b: mv(d, b), z0, top: tp, h: undefined, niveles: undefined, nota: `${H.nombre}${entero ? '' : ' (recortado)'}: ${m.nota || ''}` };
      if (!entero) row.conf = m.conf;
      T.MUROS.push(row);
      for (const o of AB.filter(o => o.muro === m.id)) { const d0 = o.d, d1 = o.d + o.w, c0 = u0 * L, c1 = u1 * L; const q0 = Math.max(d0, c0), q1 = Math.min(d1, c1); if (q1 - q0 < 10) continue;
        T.ABERTURAS.push({ ...o, ...casa, id: P(o.id), muro: id, d: Math.round((q0 - c0) * 10) / 10, w: Math.round((q1 - q0) * 10) / 10, nota: `${H.nombre}: ${o.nota || ''}` }); ids.add(P(o.id)); } }); }
  /* polígonos: locales, losas, deck, implantación */
  const polys = (tabla, destino, extra = r => ({})) => { for (const r of M[tabla] || []) { if (!nivelOk(r) || !r.poly) continue; const qs = clipPoly(r.poly, caja); if (!qs.length) continue;
    qs.forEach((q, k) => { const id = P(r.id) + (qs.length > 1 ? String.fromCharCode(65 + k) : ''); ids.add(id);
      const row = { ...r, ...casa, id, poly: q.map(p => mv(d, p)), nota: `${H.nombre}: ${r.nota || ''}`, ...extra(r) };
      if (r.huecos) row.huecos = r.huecos.map(h => clipPoly(h, caja)).flat().map(h => h.map(p => mv(d, p)));
      T[destino].push(row); }); } };
  polys('LOCALES', 'LOCALES'); polys('DECK', 'DECK', r => ({ z: (r.z || 0) + dz })); polys('IMPLANTACION', 'IMPLANTACION', r => ({ z: (r.z || 0) + dz }));
  /* losas de los niveles de la casa y, como «techo» de la isla, las del nivel que está arriba (techoNiveles) */
  for (const l of M.LOSAS || []) { const esTecho = nivTecho.has(l.nivel); if (!nivelOk(l) && !esTecho) continue; const qs = clipPoly(l.poly, caja); if (!qs.length) continue;
    qs.forEach((q, k) => { const id = P(l.id) + (qs.length > 1 ? String.fromCharCode(65 + k) : ''); ids.add(id);
      T.LOSAS.push({ ...l, ...casa, id, nivel: esTecho ? 'TE' : l.nivel, z: l.z + dz, poly: q.map(p => mv(d, p)), huecos: (l.huecos || []).map(h => clipPoly(h, caja)).flat().map(h => h.map(p => mv(d, p))), techo: esTecho || undefined, nota: `${H.nombre}: ${l.nota || ''}` }); }); }
  if (!T.LOSAS.some(l => l.casa === pre && l.nivel === 'PB')) for (const l of T.LOCALES.filter(l => l.casa === pre && l.nivel === 'PB')) T.LOSAS.push({ id: l.id.replace(/^(\w+):/, '$1:PISO-'), casa: pre, nivel: 'PB', nombre: `Piso de ${l.nombre}`, z: 0, e: 10, poly: l.poly, estado: l.estado, conf: 'estimado', nota: `${H.nombre}: piso del local, armado desde su contorno (la casa no trae losas en sus tablas).` });
  /* estructura: columnas y tensores por posición, vigas recortadas */
  for (const s of M.ESTRUCTURA || []) { const esTecho = nivTecho.has(s.nivel); if (!nivelOk(s) && !esTecho) continue; if (!['columna', 'viga', 'tensor'].includes(s.tipo)) continue;
    if (s.pos) { if (!Array.isArray(s.z)) continue; if (!enCajas(caja, ...s.pos)) continue; const z = Array.isArray(s.z) ? [s.z[0] + dz, Math.min(s.z[1] + dz, H.tope)] : s.z; if (Array.isArray(z) && z[1] - z[0] < 5) continue;
      T.ESTRUCTURA.push({ ...s, ...casa, id: P(s.id), pos: mv(d, s.pos), z, nivel: esTecho ? 'TE' : s.nivel, techo: esTecho || undefined, nota: `${H.nombre}: ${s.nota || ''}` }); ids.add(P(s.id)); continue; }
    if (s.a && s.b && typeof s.z === 'number') { const L = Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]); const tr = clipSeg(s.a, s.b, caja);
      tr.forEach(([u0, u1], k) => { if ((u1 - u0) * L < MIN_SEG && !(u0 < 1e-6 && u1 > 1 - 1e-6)) return;
        const a = [s.a[0] + (s.b[0] - s.a[0]) * u0, s.a[1] + (s.b[1] - s.a[1]) * u0], b = [s.a[0] + (s.b[0] - s.a[0]) * u1, s.a[1] + (s.b[1] - s.a[1]) * u1];
        const id = P(s.id) + (tr.length > 1 ? String.fromCharCode(65 + k) : ''); ids.add(id);
        const corte = (u0 > 1e-6 ? 'a' : '') + (u1 < 1 - 1e-6 ? 'b' : '');   /* la punta cortada por la caja sigue en la casa real: apoyos.mjs no la revisa */
        T.ESTRUCTURA.push({ ...s, ...casa, id, a: mv(d, a), b: mv(d, b), z: typeof s.z === 'number' ? s.z + dz : s.z, nivel: esTecho ? 'TE' : s.nivel, techo: esTecho || undefined, corte: corte || undefined, nota: `${H.nombre}${corte ? ' (recortada: sigue fuera de la caja)' : ''}: ${s.nota || ''}` }); }); } }
  /* barandas: polilínea recortada tramo a tramo */
  for (const b of M.BARANDAS || []) { if (!nivelOk(b)) continue; const pts = [];
    for (let i = 0; i < b.pts.length - 1; i++) for (const [u0, u1] of clipSeg(b.pts[i], b.pts[i + 1], caja)) { const a = b.pts[i], c = b.pts[i + 1];
      const p0 = [a[0] + (c[0] - a[0]) * u0, a[1] + (c[1] - a[1]) * u0], p1 = [a[0] + (c[0] - a[0]) * u1, a[1] + (c[1] - a[1]) * u1];
      if (!pts.length || Math.hypot(pts[pts.length - 1][0] - p0[0], pts[pts.length - 1][1] - p0[1]) > .5) pts.push(p0); pts.push(p1); }
    if (pts.length >= 2) { T.BARANDAS.push({ ...b, ...casa, id: P(b.id), pts: pts.map(p => mv(d, p)), z: b.z + dz, sigue: undefined, nota: `${H.nombre}: ${b.nota || ''}` }); ids.add(P(b.id)); } }
  /* escaleras: enteras si caen en la caja */
  for (const e of M.ESCALERAS || []) { if (!nivelOk(e) || !Array.isArray(e.x) || !Array.isArray(e.y) || !Array.isArray(e.z)) continue; if (!enCajas(caja, e.x[0], e.y[0]) || !enCajas(caja, e.x[1], e.y[1])) continue;
    T.ESCALERAS.push({ ...e, ...casa, id: P(e.id), x: [e.x[0] + d[0], e.x[1] + d[0]], y: [e.y[0] + d[1], e.y[1] + d[1]], z: [e.z[0] + dz, e.z[1] + dz], poly: e.poly ? e.poly.map(p => mv(d, p)) : undefined }); ids.add(P(e.id)); }
  /* muebles fijos y hogares que la casa tiene en CHIMENEAS (cajas) */
  for (const c of M.CHIMENEAS || []) { if (!c.box || !enCajas(caja, (c.box[0] + c.box[1]) / 2, (c.box[4] + c.box[5]) / 2)) continue; if ((H.ocultar || []).includes(c.id)) continue;
    T.CHIMENEAS.push({ ...c, ...casa, id: P(c.id), pos: mv(d, c.pos || [(c.box[0] + c.box[1]) / 2, (c.box[4] + c.box[5]) / 2]), box: [c.box[0] + d[0], c.box[1] + d[0], c.box[2] + dz, c.box[3] + dz, c.box[4] + d[1], c.box[5] + d[1]], nota: `${H.nombre}: ${c.nota || ''}` }); ids.add(P(c.id)); }
  /* techos propios (Mocoretá); los de Carhué y Arcos se arman aparte, abajo */
  if (H.techosPropios) for (const t of M.TECHOS || []) { if (!t.poly || !t.z) continue; const qs = clipPoly(t.poly, caja); qs.forEach((q, k) => { T.TECHOS.push({ ...t, ...casa, id: P(t.id) + (qs.length > 1 ? String.fromCharCode(65 + k) : ''), poly: q.map(p => mv(d, p)), z: [t.z[0] + dz, t.z[1] + dz], nota: `${H.nombre}: ${t.nota || ''}` }); ids.add(P(t.id)); }); }
  /* dudas de la casa que tocan piezas recortadas */
  for (const u of M.DUDAS || []) { const ref = u.ref.map(P).filter(r => ids.has(r) || [...ids].some(i => i.startsWith(r))); if (!ref.length) continue;
    T.DUDAS.push({ ...u, ...casa, id: pre === 'MO' ? u.id : `D-${pre[0]}${u.id.replace(/^D-/, '')}`, ref, q: `${H.nombre} · ${u.id}: ${u.q}` }); }
}

/* Carhué: el techo a dos aguas del ala (T-06, 72 %, cumbrera en x 21,03) recortado a la caja, como dos faldones (armador: una pendiente por pieza).
   Alturas: alero sobre M-20 a 2,92 en x 18,17 → cumbrera 2,92 + 0,72 × 2,86 = 4,98; del otro lado baja hasta 2,97 en x 23,82 (M-22 llega a 3,02). */
{ const H = CASAS.find(c => c.pre === 'CH'), d = H.d, z = x => Math.round(292 + .72 * (x - 1817)), cum = 2103, Q = q => q.map(p => mv(d, p));
  const com = { casa: 'CH', pend: '72 %', mat: 'chapa acanalada', e: 12, estado: 'existente', conf: 'modelo' };
  T.TECHOS.push({ ...com, id: 'CH:T-06A', poly: Q([[1817, -340], [cum, -340], [cum, 160], [1817, 160]]), baja: '−x', z: [z(cum), z(1817)], nombre: 'Techo del ala, faldón sur (sobre la cocina)', nota: 'Carhué: T-06 recortado. Es el cielorraso real de la cocina: la chapa sobre cabios, de 2,92 en la pared sur (M-20) a 4,98 en la cumbrera. Se ve con «Techos» prendido.' });
  T.TECHOS.push({ ...com, id: 'CH:T-06C', poly: Q([[1817, -645], [2097, -645], [2097, -340], [1817, -340]]), baja: '−x', z: [z(2097), z(1817)], nombre: 'Techo del ala, faldón sur (fondo de la cocina)', nota: 'Carhué: T-06 recortado, tramo sobre el fondo de la cocina (al sur de M-26), hasta el tabique M-24.' });
  T.TECHOS.push({ ...com, id: 'CH:T-06B', poly: Q([[cum, -340], [2382, -340], [2382, 160], [cum, 160]]), baja: '+x', z: [z(cum), z(cum) - Math.round(.72 * (2382 - cum))], nombre: 'Techo del ala, faldón norte', nota: 'Carhué: T-06 recortado, de la cumbrera a la pared norte (M-22, 3,02).' }); }

/* Arcos: la losa de PB está 0,72 sobre la vereda (acá 0,51 sobre el suelo de la escena): debajo va un relleno hasta el suelo, para que la isla no flote */
{ const l = T.LOSAS.find(q => q.id === 'AR:LO-02'); if (l) T.LOSAS.push({ id: 'AR:RELLENO', casa: 'AR', nivel: 'PB', nombre: 'Relleno bajo la losa de PB', z: l.z - l.e - .5, e: l.z - l.e - .5, poly: l.poly, huecos: l.huecos, estado: 'existente', conf: 'estimado', nota: 'Arcos: la losa de planta baja está 0,72 sobre la vereda; en la escena, 0,51 sobre el suelo. Este bloque es el terreno y contrapiso que hay debajo, sólo para que la cocina no quede flotando.' }); }

export const NIVELES = { PB: { nombre: 'Planta baja', z: 0, nota: 'Mocoretá y Carhué con el piso en 0. Arcos bajado 0,21: su estar hundido queda en +0,01 (apenas sobre el suelo de la escena, que está en 0) y el piso de la cocina en +0,51; así el escalón se ve.' }, EP: { nombre: 'Entrepiso (Arcos)', z: 308, nota: 'El entrepiso de Arcos sobre su cocina: +3,29 en la casa, 2,57 sobre el piso de la cocina (que acá está en +0,51).' }, TE: { nombre: 'Techos', z: 0 } };
export const EJES = [
  { id: 'MO', dir: 'h', pos: 0, nota: 'Mocoretá: cara interior de la pared O' }, { id: 'CH', dir: 'h', pos: 930, nota: 'Carhué: pared sur del ala (M-20), eje' }, { id: 'AR', dir: 'h', pos: 2010, nota: 'Arcos: fondo de la caja (ventanal O en 2021)' },
  { id: 'S', dir: 'v', pos: 0, nota: 'Pared sur de las tres cocinas (eje)' },
];
export const MUROS = T.MUROS, ABERTURAS = T.ABERTURAS, LOCALES = T.LOCALES, LOSAS = T.LOSAS, ESTRUCTURA = T.ESTRUCTURA, ESCALERAS = T.ESCALERAS, BARANDAS = T.BARANDAS, TECHOS = T.TECHOS;
export const CHIMENEAS = T.CHIMENEAS, DECK = T.DECK, IMPLANTACION = T.IMPLANTACION, CLARABOYAS = [], COTAS = [
  { a: [0, 0], b: [535, 0], off: -60, txt: '5,35' }, { a: [0, -7.5], b: [335, -7.5], off: -100, txt: '3,35' }, { a: [335, 0], b: [535, 0], off: -100, txt: '2,00' },
];
export const VIDEO = [];
export const DUDAS = [
  ...T.DUDAS,
  { id: 'D-01', ref: ['AR:L-B3'], q: 'Arcos: con la fosa a 4,55 de la medianera (medido 5/11) la cocina tiene 4,55 de ancho: mesada 0,62 + paso 1,05 + isla 1,20 + sillas 0,45 + 1,23 hasta el escalón. ¿La isla queda donde está, o la corremos hacia el estar para ensanchar el paso de trabajo (hasta 1,30–1,40 sin acercar las sillas a menos de 0,90 del borde)?' },
  { id: 'D-02', ref: ['CH:L-08', 'AR:L-B3', 'MO:L-01'], q: 'Los muebles de cocina del catálogo todavía no hacen todo lo que pediste: isla con cajones de los dos lados, barra de ibirapitá en la punta de la isla (hoy la tapa doble va a lo ancho, no a lo largo), alacenas proyectantes. Son piezas nuevas del motor; las sumo cuando confirmes la planta.' },
];
/* ---------- inventario de materiales de Maxi (3/11/2026), para repartir entre las tres cocinas ---------- */
/* Lo dicho por Maxi, tal cual; «uso» es la asignación que se va decidiendo (vacío = sin asignar). Las fotos llegan después. */
export const INVENTARIO = {
  fecha: '2026-11-04',
  tiene: [
    { id: 'I-01', que: 'Bachas de loza grandes', n: 3, nota: 'Para cocinas.', uso: '' },
    { id: 'I-02', que: 'Bachas de loza chicas', n: 2, nota: 'Para baños.', uso: '' },
    { id: 'I-03', que: 'Bachas de acero inoxidable para cocina', n: 2, nota: '', uso: '' },
    { id: 'I-04', que: 'Tablones de madera clara para mesas de vanitory', n: 3, nota: 'Dos con borde vivo y uno de ibirapitá unido.', uso: '' },
    { id: 'I-05', que: 'Tablón gigante de ibirapitá de 4″', n: 1, nota: 'Para mesada, desayunador o isla. Los dos bordes vivos. Medidas: faltan.', uso: '' },
    { id: 'I-06', que: 'Tablón gigante de ibirapitá de 2″, 5,30 × 0,80', n: 1, nota: 'Para mesada, desayunador o isla. Los dos bordes vivos.', uso: '' },
    { id: 'I-07', que: 'Tablones grandes de ibirapitá de 2″, 1,70 × 0,90', n: 2, nota: 'Para mesada, desayunador o isla. Los dos bordes vivos; se pueden cortar rectos si hace falta (tenerlo como posibilidad).', uso: '' },
    { id: 'I-08', que: 'Anafe para embutir de 5 quemadores', n: 1, nota: '', uso: '' },
    { id: 'I-09', que: 'Anafe con vidrio de 3 quemadores', n: 1, nota: 'También se le puede sacar el vidrio y embutirlo.', uso: '' },
    { id: 'I-10', que: 'Set de 4 quemadores industriales individuales, embutidos en una mesada de acero grueso', n: 1, nota: '', uso: '' },
    { id: 'I-11', que: 'Anafe industrial de 4 quemadores', n: 1, nota: 'Está en el Delta.', uso: '' },
    { id: 'I-12', que: 'Griferías de cocina con resorte', n: 2, nota: '', uso: '' },
    { id: 'I-13', que: 'Griferías de baño', n: 3, nota: 'Contando la de Mocoretá. Había más, por ahora perdidas.', uso: '' },
    { id: 'I-14', que: 'Grifería con caño flexible', n: 1, nota: 'La de Mocoretá.', uso: '' },
    { id: 'I-15', que: 'Laja San Luis de 1,00 × 2,50, 2½″ de espesor', n: 1, nota: 'Maxi 4/11: espectacular para una mesa de comedor en Carhué; necesita una base de metal bien robusta, con ruedas.', uso: '' },
  ],
  comprar: [
    { id: 'C-01', que: 'Granito negro mate' },
    { id: 'C-02', que: 'Acero inoxidable' },
    { id: 'C-03', que: 'Acero dulce grueso, recapado, plegado y protegido contra el óxido' },
    { id: 'C-04', que: 'Porcelanato con el borde protegido con cuarta caña de aluminio' },
  ],
};

export const CAMBIOS = [
  { fecha: '2026-11-09', v: '0.1.47', txt: 'Carhué: hogar como en la foto, mesada negra a lo largo de toda la pared de las ventanas con el lado corto de la L donde termina la pared, y la escalera al altillo es el caracol S (la variante por defecto).' },
  { fecha: '2026-11-09', v: '0.1.46', txt: 'Carhué con las medidas de Maxi (9/11): la cocina tiene 2,50 de ancho y llega 2 m más al fondo, hasta la pared de la arcada (1,20); la caja de Carhué se ensancha hasta la pared del baño y la heladera va contra la pared de la arcada en los tres escenarios.' },
  { fecha: '2026-11-08', v: '0.1.45', txt: 'Motor (Maxi 8/11): lo que escondés con el ojo ya no vuelve a aparecer con cada publicación; la lista de piezas escondidas se guarda en la base de la página (estado/ocultas), como los candados.' },
  { fecha: '2026-11-08', v: '0.1.44', txt: 'Motor (Maxi 8/11, regla): en todas las cajoneras el cajón grande va abajo y el finito arriba. Carhué: la escalera al altillo B3 gira con escalones compensados y sigue subiendo contra la pared hasta la puerta.' },
  { fecha: '2026-11-08', v: '0.1.43', txt: 'Arcos: la mesa de madera de la isla se acorta a 3,00 (era 3,80); el bloque de piedra queda en su lugar; tres sillas del lado del estar y una en la punta (Maxi 8/11).' },
  { fecha: '2026-11-08', v: '0.1.42', txt: 'Motor (Maxi 8/11): las vistas guardadas recuerdan el lente (fov) y si eran en perspectiva o paralela; al volver a una vista se restituyen.' },
  { fecha: '2026-11-08', v: '0.1.41', txt: 'Carhué, escenario D: queda como lo movió Maxi en la página (8/11, noche): la península negra pisa la punta este de la mesada y las dos forman una sola L (el anafe se corre con ella); la bacha, con su borde a 50 del rincón. Pasó igual a la casa de Carhué (escenario E) y a lo guardado en las dos páginas.' },
  { fecha: '2026-11-08', v: '0.1.40', txt: 'Maxi 8/11: en Carhué (escenario D) la bacha pasa junto al anafe, a 50 del rincón de la L. Motor: perspectiva/paralela (botón y tecla P; P + rueda cambia el lente), quemadores individuales en la mesada, luz bajo la campana, bacha farm redondeada color marfil, deshacer para los muebles, nombre del mueble al posar el puntero.' },
  { fecha: '2026-11-08', v: '0.1.39', txt: 'Carhué, escenario D: queda como lo ajustó Maxi en la página (8/11): mesa de madera de 2,60 × 1,50, anafe corrido hacia la pared, cinco sillas; pasó igual a la casa de Carhué.' },
  { fecha: '2026-11-07', v: '0.1.38', txt: 'Maxi 7/11: Carhué, escenario D en L de verdad: la mesada negra (2,35) dobla justo donde termina la pared sur, con el bloque negro de 1,60 × 0,70 en la esquina hacia el norte; la mesa de madera (bordes rectos, motor «canto: recto») sigue hacia el este pasando la pared y al norte del bloque.' },
  { fecha: '2026-11-07', v: '0.1.37', txt: 'Maxi 7/11, Mocoretá: sale el tabique M-05 (queda M-04, del lado del pasillo); piso de lapacho (tablas de 10); la mesa del comedor (#7) de 2,80 × 1,20; alacenas altas sobre la mesada 1, contra la pared O (2,48, tres puertas).' },
  { fecha: '2026-11-07', v: '0.1.36', txt: 'Maxi 7/11: Carhué, escenario D: mesada y península en L (no en T) y la mesa de madera cuadrada de 2,20 × 2,20. El recorte suma 2,50 del living al sur de la cocina: la pared sur termina porque la casa dobla ahí (sigue M-02 hacia el sur).' },
  { fecha: '2026-11-07', v: '0.1.35', txt: 'Maxi 7/11: Carhué, escenario D según su croquis: mesada negra con la bacha bajo la ventana y una península perpendicular (bloque negro con anafe de 4 pegado a la mesada, mesa de madera en L hacia el living) con sillas al este y en la punta norte.' },
  { fecha: '2026-11-07', v: '0.1.34', txt: 'Maxi 7/11: Carhué con las mismas opciones de diseño que la casa: la puerta del baño piletero P-26 en M-24, mirando al sur (antes en M-26, como en las tablas); la escalera al altillo B3 ya estaba.' },
  { fecha: '2026-11-07', v: '0.1.33', txt: 'Maxi 7/11: en Arcos, las alacenas llegan a 3,92 como la mesada: un bandejero vertical de 0,30 en la punta de la ventana (motor: «band» en la alacena, como en la mesada) y el estante de abajo también a 3,92.' },
  { fecha: '2026-11-07', v: '0.1.32', txt: 'Maxi 7/11: el piso de tablones de Arcos en un solo tono, eucalipto con cetol roble (más rojizo); antes tres tonos.' },
  { fecha: '2026-11-07', v: '0.1.31', txt: 'Maxi 7/11: cajones de 75–80 en las tres cocinas: el motor arma módulos de 76 por defecto (antes 60). Quedan Carhué 5 × 72 en la mesada y 3 × 84 en la isla; Mocoretá 3 × 83 y 4 × 75 en las mesadas y 3 × 71 en la isla; Arcos 5 × 75 y 2 × 76.' },
  {fecha:'2026-11-07', v:'0.1.30', txt:'Motor compartido (Maxi 7/11): «Caminar hasta acá». W tocada prende el modo (también desde la barra, debajo de Navegar); cada clic marca un destino: si la cámara está en el aire, aterriza cerca, y después camina hasta ahí con los ojos a 1,70 m. Se apaga con W, con Esc o eligiendo otra herramienta; W mantenida sigue avanzando como antes. El teclado (WASD, flechas) pasó del archivo de cada casa al motor.'},
  { fecha: '2026-11-07', v: '0.1.29', txt: 'Maxi 7/11: frentes de petiribí (veta recta con rayas negras, textura nueva) en mesada, columna, alacena de la heladera, bloque de la isla y estante; la tapa de la isla (#13) de nogal oscuro; la mesa de la ventana (#10) de petiribí, con patas centrales livianas (dos montantes de 4 × 30 sobre el eje, pie cruzado y viga bajo la tapa) para que pasen las piernas.' },
  { fecha: '2026-11-06', v: '0.1.28', txt: 'Maxi 6/11: filas de cajones escalonadas en todo el motor (arriba fino, medio mediano, abajo alto para ollas: 20 / 33 / 47 % del alto; en la columna del horno 28 / 41); la isla/mesa de Arcos 30 cm más al este, con sillas, anafe y campana.' },
  { fecha: '2026-11-06', v: '0.1.27', txt: 'Maxi 6/11: mesada de 3,92 con cinco módulos de 75 y un bandejero de 17 en la punta de la ventana (la mesa y los bancos se corren hacia el ventanal; el banco de la ventana pasa a 1,50 y arranca a 25 de la medianera por el parante del ventanal); puertas bajo la bacha, que pasa a 70; estante de 15 de fondo a 1,30 bajo las alacenas; el bloque de la isla con dos columnas de cajones anchos.' },
  { fecha: '2026-11-06', v: '0.1.26', txt: 'La mesa de la ventana y sus bancos, 15 cm más adentro (igual que en la casa Arcos, donde el banco tocaba el marco del ventanal). La cocina de Arcos quedó igual a ésta: inox, sillas negras, alacenas de cuatro puertas, mesa de 1,60.' },
  { fecha: '2026-11-06', v: '0.1.25', txt: 'Maxi 6/11: cuatro puertas proyectadas de 0,90 sobre la mesada de Arcos en vez de tres de 1,20 (dos alacenas de 1,81 con dos puertas cada una); el motor abre una puerta cada 0,90.' },
  { fecha: '2026-11-06', v: '0.1.24', txt: 'Maxi 6/11: las puertas proyectadas de las alacenas superiores, del doble de ancho (una cada 1,20): la mitad de puertas.' },
  { fecha: '2026-11-06', v: '0.1.23', txt: 'En el teléfono sólo se mira (Maxi 6/11): se van las herramientas de edición (mover, estirar, deshacer, medir, marcar, vértices, equipamiento, luces, térmica, estructura, personas) y el panel lateral; quedan navegar, seleccionar, capas, variantes, vistas, tours y Planta/3D.' },
  { fecha: '2026-11-06', v: '0.1.22', txt: 'Pantalla de teléfono (Maxi 6/11): en 3D se van los márgenes y las calles; la barra queda pegada al borde, el visor ocupa toda la pantalla y el panel sigue debajo. La página declara el viewport del teléfono.' },
  { fecha: '2026-11-05', v: '0.1.21', txt: 'Maxi 5/11: la mesa de la ventana de Arcos (#10) pasa a 1,60 de largo, con sus dos bancos; sigue arrancando en la medianera y termina a 7 cm de la isla.' },
  { fecha: '2026-11-05', v: '0.1.20', txt: 'Maxi 5/11: paño de inox detrás de la mesada de Arcos (pieza nueva «revestimiento», entre la tapa y las alacenas). En la ficha de cada mueble se eligen los materiales de la paleta (frentes, tapa, madera, material, color): inox, piedra negra, maderas, negro mate, etc. Sillas pintadas (negro de arranque; nueve colores a elegir). Al seleccionar un mueble aparece su etiqueta flotante con nombre y número. La mesa larga apoya en un timón de acero de 1/2″, 50 cm a lo largo de la mesa, que atraviesa la tapa; la tira este no lleva pata, se encaja en el bloque.' },
  { fecha: '2026-11-05', v: '0.1.19', txt: 'Motor 11ede6c: el sillón en L alarga sólo la chaise cuando cambia el fondo (el asiento y el respaldo quedan a su medida); la campana de isla sube hasta lo más bajo del techo sobre ella; el techo sobre un mueble se mide con una grilla más fina.' },
  { fecha: '2026-11-05', v: '0.1.18', txt: 'Motor (Maxi 5/11): los frentes se abren arrastrándolos, como las hojas de las ventanas (el cajón sigue a la mano; la puerta gira con el arrastre), y un toque seco abre o cierra del todo. Veta horizontal en todas las caras verticales, también en las piezas altas; madera oscura con la veta oscura más clara y menos contraste.' },
  { fecha: '2026-11-05', v: '0.1.17', txt: 'Arcos: la fosa del estar queda a 4,55 de la medianera S (medido en obra el 5/11; antes 3,71 del SketchUp), heredado del modelo de la casa (Arcos 0.10.26). El recorte de la cocina llega ahora hasta pasado el escalón. D-01 reformulada: sobra lugar, ¿se corre la isla hacia el estar?' },
  { fecha: '2026-11-05', v: '0.1.16', txt: 'Motor (Maxi 4/11): los frentes se abren al tocarlos, animados. Mesadas, islas y bloque: carcasa de melamina con divisorias, cajones con caja de madera y guías telescópicas (el perfil del mueble queda, el del cajón sale), frentes de 2 cm con juntas de 3 mm; módulos con dos puertas batientes y bisagras cazoleta (Ø35 en la puerta, brazo y base en el lateral); alacenas con puertas proyectadas hacia arriba con brazos de elevación; torre del horno con dos cajones abajo y puerta con cazoletas arriba. Arcos: puertas bajo la bacha.' },
  { fecha: '2026-11-04', v: '0.1.15', txt: 'Maxi 4/11: una vista guardada ya no muestra lo que escondiste (sólo suma lo suyo). Arcos: piso de tablones como en la casa (tablones.js pasó al motor); frentes de cajones oscuros; la mesa de la isla con canto vivo en los dos bordes largos (tapa en L de una pieza); mueble sobre la heladera, continuación de la torre del horno. Pendiente: cajones y alacenas que se abren, con herrajes.' },
  { fecha: '2026-11-04', v: '0.1.14', txt: 'Motor (Maxi 4/11): maderas con veta procedural a escala real (roble, petiribí/madClara, madOsc, ibirapitá/madRust) con rugosidad, veta a lo largo de cada pieza y vertical en paneles altos; cajones en tres filas; banco corrido bajo con respaldo en ángulo; pieza nueva «islaMesa»; lo escondido con el ojo del outliner queda guardado entre recargas (por navegador). Arcos: isla de 3,80 × 1,20 en dos materiales (bloque de piedra 1,60 × 0,70 a 0,90 + mesa de madera en L a 0,75 con la tira de 0,50 hasta la punta este), sillas del lado del estar y en la punta; mesita del ventanal baja (0,75) con bancos bajos.' },
  { fecha: '2026-11-04', v: '0.1.13', txt: 'Arcos (Maxi 4/11): entre la medianera y la fosa hay 3,71 y el desplazamiento no entra. Bloque y mesa en línea, mismo ancho 0,90, dos materiales (piedra a 0,90, madera de 2,20 a 0,75). Sillas sólo del lado del estar (tres) y en la punta. Falta medir el escalón en obra. Mesita del ventanal: banquetas corridas de tabla con respaldo, una por lado, de dos cuerpos (pieza nueva del catálogo, «bancoTabla»).' },
  { fecha: '2026-11-04', v: '0.1.12', txt: 'Arcos: punto de partida para ajustar en la página: mesa de 3,80 × 0,90 hasta la punta oeste del bloque de cocinar, corrida 0,50 hacia el estar; 2 sillas del lado de la mesada, 4 del lado del estar (dos frente al bloque) y una en la punta. El bloque sigue macizo: la mesa lo atraviesa hasta que se defina la medida y se haga el bloque hueco.' },
  { fecha: '2026-11-04', v: '0.1.11', txt: 'Motor: el mueble elegido muestra sus cotas (largo, fondo y alto, en cm) en las aristas del frente, como las partes del edificio.' },
  { fecha: '2026-11-04', v: '0.1.10', txt: 'Motor: la órbita ya no se desliza. Al girar, el objetivo pasaba bajo el piso y un tope lo subía cada cuadro (un desplazamiento disimulado); también se levantaba la cámara al tocar el piso. Ahora el objetivo puede quedar bajo el piso y, si el giro vertical dejara la cámara bajo 25 cm, se deshace. Inventario: laja San Luis (I-15).' },
  { fecha: '2026-11-04', v: '0.1.9', txt: 'Motor: con la herramienta Mover prendida, los muebles se arrastran directo (antes sólo con el panel Equipamiento abierto y en su capa); el panel se abre solo. Estirar caras sigue siendo para el edificio: el tamaño de un mueble se cambia en su panel (L, D, H).' },
  { fecha: '2026-11-03', v: '0.1.8', txt: 'Motor: la órbita vuelve a ser la de siempre (gira alrededor del punto bajo el cursor, como antes de hoy). Los cambios de hoy a la órbita se deshicieron (Maxi).' },
  { fecha: '2026-11-03', v: '0.1.7', txt: 'Motor: la órbita gira siempre alrededor del objetivo de la cámara, no del punto bajo el cursor; antes girar alrededor de un punto lejos del centro corría la escena como si fuera un desplazamiento (Maxi: «el orbit también hace pan»).' },
  { fecha: '2026-11-03', v: '0.1.6', txt: 'Arcos, isla en línea desplazada (Maxi): bloque de cocinar de 1,60 × 0,90 a 0,90 con el anafe de 5 y la campana, y mesa de ibirapitá de 2,20 × 0,90 a 0,75 corrida 0,30 hacia el estar, con sillas del lado de la mesada y en la punta. La punta de la mesa bajo la tapa del bloque queda para cuando el catálogo tenga el bloque hueco.' },
  { fecha: '2026-11-03', v: '0.1.5', txt: 'Arcos, pared (Maxi): la heladera pasa a la punta del depósito, entre el horno y la despensa; la mesada corre hacia el este (2,25 libres hasta el ventanal) y donde estaba la heladera va una mesita de desayuno de 1,20 × 0,70 a 0,90, perpendicular a la medianera, con cuatro banquetas. La isla queda como estaba hasta elegir concepto.' },
  { fecha: '2026-11-03', v: '0.1.4', txt: 'Las llaves por cocina (y Carpinterías) ahora están donde se ven: en el panel Capas del ícono de capas, bloque «Cocinas». Antes quedaban en una barra escondida (Maxi: «¿dónde está Ver?»). Es del motor: en Arcos aparecen ahí Carpinterías y Detalle del SketchUp.' },
  { fecha: '2026-11-03', v: '0.1.3', txt: 'Materiales: griferías (dos de cocina con resorte, tres de baño, una con caño flexible) y bordes vivos de los tablones de ibirapitá (los grandes se pueden cortar rectos). Sin asignar: eso lo decide Maxi.' },
  { fecha: '2026-11-03', v: '0.1.2', txt: 'Tres llaves en «Ver», grupo Cocinas (Maxi): cada una esconde su cocina entera, paredes y muebles. Motor: la órbita es determinística (arrastrar y volver deja la vista donde estaba) y gira alrededor de lo construido bajo el cursor, nunca del suelo.' },
  { fecha: '2026-11-03', v: '0.1.1', txt: 'Arcos: el entrepiso sobre la cocina va apagado por defecto y queda sólo su perímetro (faja de 10 a +2,57), con las vigas y la baranda, para ver la cocina desde arriba (Maxi). Se prende con «Entrepiso de Arcos». Debajo de la losa de PB va un relleno hasta el suelo de la escena: antes la cocina flotaba 0,36 y por abajo se veía el pasto.' },
  { fecha: '2026-11-03', v: '0.1.0', txt: 'Primera escena: Carhué (tramo de la cocina y el sector norte, sin dormitorio 3 ni baño piletero) y Arcos (franja de 3,00 contra la medianera S, del ventanal al depósito, con un pedazo del estar hundido y el entrepiso encima) recortadas de sus modelos; Mocoretá del croquis del 3/11 con los supuestos marcados (D-M1 a D-M6). Muebles: Carhué con la versión D del 2/11; Arcos con la propuesta de materiales del 2/11 (granito negro, isla con hornallas, petiribí); Mocoretá como está hoy.' },
];
