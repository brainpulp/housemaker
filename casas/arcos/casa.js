/* Arcos 4264 3D — arma las piezas con el armador genérico del motor (armador.js) a partir de modelo.js
   y arranca los módulos del motor. Lo propio de esta casa: categorías, vistas, cotas y el calco del SketchUp. */
import * as THREE from 'three';
import { createVisor, geo } from './visor3d.js';
import { escaleraGiro, DISENOS } from './escalera-giro.js';
import { tablones } from './tablones.js';
import { lucesArcos } from './luces.js';
import { fachadaArcos } from './fachada.js';
import { ventanalArcos } from './ventanal.js';
const LUCES = lucesArcos(THREE, M);
import { initSenalar } from './senalar.js';
import { initToolbar } from './toolbar.js';
import { initMedir } from './medir.js';
import { initVistasUI } from './vistasui.js';
import * as M from './modelo.js';
import * as A from './armador.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as N from './nombres.js';
import { videoHTML } from './video.js';
import { initMarcas } from './marcas.js';
import * as ED from './ediciones.js';
import { initEditor } from './editor3d.js';
import { initRealismo } from './realismo.js';
import { initLuz } from './luz.js';
import { initNoche } from './noche.js';
import { initCalidad } from './calidad.js';
import { initInspector } from './inspector.js';
import { initSidebar } from './sidebar.js';
import { CALCO3D } from './calco-3d.js';
import { DETALLE, COLORES, ESCALA } from './detalle-su.js';

/* detalle del SketchUp: triángulos ya en ejes del modelo; se decodifican una vez */
/* sin los pisos del SketchUp en PB, 1P y 2P (triángulos horizontales a ras de piso): ahí va el piso de tablones */
const PISOS_Z = [72, 409, 607], esPiso = (a, b, c) => Math.max(a, b, c) - Math.min(a, b, c) < 0.5 && PISOS_Z.some(z => a > z - 4 && a < z + 12);
const DET = DETALLE.map(d => { const b = Uint8Array.from(atob(d.b64), c => c.charCodeAt(0)); const q = new Int16Array(b.buffer); const f = [];
  const fuera = (a, b, c) => (d.id === 'SU-01' && Math.max(a, b, c) < 2480) || (d.id === 'SU-04' && Math.min(a, b, c) > 4440); /* ventanal O (va ventanal.js) y cerco del frente (va fachada.js) */
  for (let i = 0; i < q.length; i += 9) { if (esPiso(q[i + 1] / ESCALA, q[i + 4] / ESCALA, q[i + 7] / ESCALA) || fuera(q[i + 2] / ESCALA, q[i + 5] / ESCALA, q[i + 8] / ESCALA)) continue; for (let k = 0; k < 9; k++) f.push(q[i + k] / ESCALA); }
  return { ...d, pos: new Float32Array(f) }; }).filter(d => d.pos.length);
const detGeo = d => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(d.pos, 3)); g.computeVertexNormals(); return g; };

const NIV = Object.fromEntries(Object.entries(M.NIVELES).map(([k, v]) => [k, v.nombre]));
const f2 = cm => (cm / 100).toFixed(2).replace('.', ',');
const zN = k => (M.NIVELES[k] || {}).z ?? 0;

const params = [
  { id: 'techos', label: 'Techos', type: 'check', value: true, quick: true, group: 'Ver' },
  { id: 'carp', label: 'Carpinterías', type: 'check', value: true, quick: true, group: 'Ver', help: 'Vidrios de ventanas y hojas de puertas, cerradas.' },
  { id: 'detalle', label: 'Detalle del SketchUp', type: 'check', value: true, quick: true, group: 'Ver', help: 'Carpinterías, terraza, tanque, jardín del frente, cocina y baños tal como están en tu SketchUp.' },
  { id: 'baranda', label: 'Baranda de la E-02', type: 'select', value: 'cables', group: 'Escalera', options: DISENOS.map(d => [d.id, d.name]), help: 'Los diseños de la conversación del 11/10. El de cables es el que elegiste.' },
  { id: 'calco', label: 'Calco SketchUp', type: 'check', value: false, quick: true, group: 'Ver', help: 'Tu modelo Arcos_55.dae, en gris transparente, alineado al plano.' },
  { id: 'ext', label: 'Jardines y vereda', type: 'check', value: true, quick: true, group: 'Ver' },
  { id: 'corte', label: 'Corte horizontal', type: 'select', value: '0', quick: true, group: 'Ver',
    options: [['0', 'Sin corte'], ['-80', 'a −0,80 (subsuelo)'], ['190', 'a +1,90 (planta baja)'], ['400', 'a +4,00 (entrepiso)'], ['560', 'a +5,60 (primer piso)'], ['740', 'a +7,40 (segundo piso)'], ['900', 'a +9,00 (terraza)']],
    help: 'Saca todo lo que está por encima de esa altura, como una planta.' },
];

function build(p) {
  const parts = [];
  const Pt = (id, name, cat, geos, info, ex = {}) => { const al = N.alias(id); geos = [].concat(geos).filter(Boolean); if (!geos.length) return;
    parts.push({ id, name: al ? `${id} · ${al}` : name, alias: al, cat, geos, info: { ...info, fn: (N.nota(id) ? `<b>Tu nota:</b> ${N.nota(id)}<br>` : '') + (info.fn || '') }, ...ex }); };
  const ex = d => ({ group: d.nivel ? NIV[d.nivel] : 'Exterior', opt: { op: d.estado === 'proyecto' ? .35 : undefined } });
  const base = d => ({ fn: d.nota || '', sec: '', med: '', u: M.DUDAS.filter(x => x.ref.includes(d.id)).map(x => x.id).join(' · ') });

  /* muros */
  for (const m of M.MUROS) {
    const L = Math.hypot(m.b[0] - m.a[0], m.b[1] - m.a[1]);
    const med = `${f2(L)} × ${f2(m.e)} · de ${f2(A.zBase(M, m))} a ${Array.isArray(m.top) ? f2(m.top[0]) + '/' + f2(m.top[1]) : f2(A.zTope(M, m, 0))}`;
    if (m.tipo === 'vidrio') { if (p.detalle) continue; const g = A.vidrioGeos(M, m);
      Pt(m.id, `${m.id} · ${m.nombre}`, 'glass', g.vidrio, { ...base(m), med }, ex(m));
      Pt(m.id + 'p', `${m.id} · perfiles`, 'perfil', g.perfiles, { ...base(m), med }, ex(m)); continue; }
    if (/^M-4[4-6]$/.test(m.id)) continue; /* el balcón tiene baranda de caños (fachada.js), no muro */
    const cat = m.id === 'M-11' ? 'fachada' : m.tipo === 'tabique' ? 'tabique' : m.tipo === 'cerco' ? 'cerco' : /^M-0[5-9]$/.test(m.id) ? 'medianera' : 'muro';
    Pt(m.id, `${m.id} · ${m.nombre}`, cat, A.muroGeos(M, m), { ...base(m), med }, ex(m));
  }
  /* aberturas: hoja cerrada (vidrio o panel) */
  if (p.carp) for (const a of M.ABERTURAS) { const m = M.MUROS.find(w => w.id === a.muro); if (!m || a.tipo === 'vano' || a.id === 'P-03') continue;
    const vid = a.tipo === 'ventana';
    Pt(a.id, `${a.id} · ${a.nombre}`, vid ? 'glass' : a.tipo === 'portón' ? 'cerco' : 'puerta', A.hojaGeo(M, a, vid ? 2 : 4), { ...base(a), med: `${f2(a.w)} × ${f2(a.h)} · antepecho ${f2(a.s || 0)}` }, ex(m)); }
  /* losas */
  /* LO-12 es el giro de la E-02, que se arma pieza por pieza abajo.
     LO-01 abre el suelo sobre el subsuelo y la escalera descubierta, para que se vea (nota en M-22). */
  const HUECO_SS = [[297, 2868], [850, 2868], [850, 4216], [745, 4216], [745, 3887], [297, 3887]];
  for (const l of M.LOSAS) { if (l.id === 'LO-12') continue; const e = ex(l); if (l.id === 'LO-01') e.opt = { ...e.opt, hueco: HUECO_SS };
    Pt(l.id, `${l.id} · ${l.nombre}`, /^LO-(04|11|13)$/.test(l.id) ? 'madera' : 'losa', A.losa(l.poly, l.huecos, l.z - l.e, l.z), { ...base(l), med: `+${f2(l.z)} · ${f2(l.e)} de espesor` }, e); }
  for (const c of M.CLARABOYAS || []) {
    const g = [A.losa(c.poly, null, c.z - 1, c.z)]; const xs = c.poly.map(q => q[0]), ys = c.poly.map(q => q[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), zb = zN('TZ'), e = 10;
    const cord = [A.losa([[x0 - e, y0 - e], [x1 + e, y0 - e], [x1 + e, y0], [x0 - e, y0]], null, zb, c.z), A.losa([[x0 - e, y1], [x1 + e, y1], [x1 + e, y1 + e], [x0 - e, y1 + e]], null, zb, c.z),
      A.losa([[x0 - e, y0], [x0, y0], [x0, y1], [x0 - e, y1]], null, zb, c.z), A.losa([[x1, y0], [x1 + e, y0], [x1 + e, y1], [x1, y1]], null, zb, c.z)];
    Pt(c.id, `${c.id} · ${c.nombre}`, 'glass', g, base(c), ex(c)); Pt(c.id + 'b', `${c.id} · cuello`, 'muro', cord, base(c), ex(c)); }
  /* pisos de tablones de 20, transversales (de medianera a medianera), en PB, 1P y 2P (Maxi, 15/10) */
  { const PISOS = [['PB', ['LO-02', 'LO-03']], ['P1', ['LO-05']], ['P2', ['LO-07']]];
    for (const [nv, ids] of PISOS) { const T = [[], [], []]; ids.forEach((id, k) => { const l = M.LOSAS.find(x => x.id === id); if (!l) return;
        tablones(geo, A, { poly: l.poly, huecos: l.huecos || [], z: l.z, seed: k + nv.length * 7 + l.z }).forEach((g, i) => T[i].push(...g)); });
      T.forEach((g, i) => Pt(`PT-${nv}${'abc'[i]}`, `PT-${nv} · Piso de tablones de ${NIV[nv].toLowerCase()}`, 'tabla' + (i + 1), g, { fn: 'Tablones de 20 de ancho, transversales: corren de medianera a medianera (S–N), con juntas escalonadas.', sec: 'tablón 20 × 2', med: '' }, { group: NIV[nv], tags: ['pisos'], opt: { noEdges: true } })); } }
  /* escalón del estar hundido: cierra el frente entre su piso (+0,19) y la losa de PB (15 de espesor) */
  { const l3 = M.LOSAS.find(x => x.id === 'LO-03'), l2 = M.LOSAS.find(x => x.id === 'LO-02');
    if (l3 && l2) { const xs = l3.poly.map(q => q[0]), ys = l3.poly.map(q => q[1]), a0 = Math.min(...xs), a1 = Math.max(...xs), b0 = Math.min(...ys), b1 = Math.max(...ys), t = 3, zb = l3.z, zt = l2.z - l2.e + 0.5;
      Pt('LO-03e', 'LO-03 · Escalón del estar hundido', 'losa', [[a0, a1, b0, b0 + t], [a0, a1, b1 - t, b1], [a0, a0 + t, b0, b1], [a1 - t, a1, b0, b1]].map(([x0, x1, y0, y1]) => A.losa([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], null, zb, zt)), { fn: 'Frente del escalón entre el piso del estar hundido y la losa de PB.', sec: '', med: `de +${f2(zb)} a +${f2(l2.z)}` }, { group: NIV.PB }); } }
  /* dinteles de hierro (pintados con antióxido) sobre los vanos sin hoja, como en las fotos F39-20 a F39-22 */
  for (const a of M.ABERTURAS) { if (a.tipo !== 'vano') continue; const m = M.MUROS.find(w => w.id === a.muro); if (!m) continue;
    const L = Math.hypot(m.b[0] - m.a[0], m.b[1] - m.a[1]), ux = (m.b[0] - m.a[0]) / L, uy = (m.b[1] - m.a[1]) / L, z = A.zBase(M, m) + (a.s || 0) + a.h;
    const d0 = a.d - 15, d1 = a.d + a.w + 15, w = m.e / 2 + .5, nx = -uy, ny = ux, P = (d, s) => [m.a[0] + ux * d + nx * s, m.a[1] + uy * d + ny * s];
    const q = [P(d0, -w), P(d1, -w), P(d1, w), P(d0, w)];
    Pt(a.id + 'd', `${a.id} · dintel de hierro`, 'dintel', A.losa(q, null, z, z + 16), { fn: 'Perfil de hierro sobre el vano, con antióxido naranja, como se ve en las fotos.', sec: 'perfil 16', med: `${f2(a.w + 30)} de largo` }, ex(m)); }
  /* fachada E como en la foto */
  for (const f of fachadaArcos(THREE, M, A)) Pt(f.id, `${f.id} · ${f.nombre.replace(/^[A-Z0-9-]+ · /, '')}`, f.cat, f.geos, f.info, { group: 'Fachada E', tags: ['fachada'], opt: { noEdges: /caño|herreria/.test(f.cat) } });
  /* ventanal O paño por paño */
  for (const f of ventanalArcos(THREE)) Pt(f.id, `${f.id} · ${f.nombre}`, f.cat, f.geos, f.info, { group: 'Ventanal O', tags: ['ventanal', /VO-C|VO-B/.test(f.id) ? 'corrediza' : 'fija'] });
  /* luces: artefactos (las fuentes las maneja noche.js) */
  for (const a of LUCES.art) Pt(a.id, `${a.id} · ${a.nombre}`, 'artefacto', a.geos.map(g => g.clone()), a.info, { group: 'Luces', tags: ['luces', a.nivel], opt: { noEdges: true } });
  /* escaleras y barandas */
  for (const e of M.ESCALERAS) { if (e.id === 'E-02') continue; const g = A.escaleraGeos(e);
    Pt(e.id, `${e.id} · ${e.nombre}`, e.exterior ? 'escext' : 'escalera', g.ped, { ...base(e), med: `${e.n} alzadas · de ${f2(e.z[0])} a ${f2(e.z[1])}` }, ex(e));
    Pt(e.id + 'z', `${e.id} · zancas`, 'zanca', g.zan, base(e), ex(e)); }
  for (const b of M.BARANDAS || []) { if (b.id === 'BA-2') continue; const E = b.sigue ? M.ESCALERAS.find(e => e.id === b.sigue) : null;
    Pt(b.id, `${b.id} · ${b.nombre}`, b.tipo === 'madera' ? 'madera' : 'perfil', A.barandaGeos(b, E), base(b), ex(b)); }
  /* E-02 al detalle (escalera-giro.js): ejes de la escalera → ejes de la casa. Tramo contra la medianera N (z 92 = x 850),
     sube hacia el fondo; el fondo del giro queda en y 2825. 15 alzadas de PB al entrepiso. */
  { const E2 = M.ESCALERAS.find(e => e.id === 'E-02'), nA = 15, R = (zN('EP') - zN('PB')) / nA, X0 = 758, Y0 = 2825 + 12 * 24 + 92;
    const eg = escaleraGiro(geo, { N: nA, R, G: 24, zF: -20, LR4: 850 - 659, design: p.baranda });
    const map = g => { const h = geo.mapGeo(g, (x, y, z) => [X0 + z, zN('PB') + y, Y0 - x]); delete h.userData.rod; return h; };
    for (const q of eg.parts) Pt('E2-' + q.id, `E2-${q.id.replace(/(t|pi|b|f|s)$/, '')} · ${q.name.replace(/^[A-Z0-9]+ · /, '')}`, q.cat, q.geos.map(map), { ...q.info, fn: (q.info.fn || '') + ' <i>Diseño del 11/10 («Escalera al entrepiso»).</i>', u: [q.info.u, 'D-11'].filter(Boolean).join(' · ') }, { group: 'Escalera E-02', tags: ['E-02'], opt: { noEdges: /^(inox|steel|glass)$/.test(q.cat) } }); }
  /* estructura */
  for (const s of M.ESTRUCTURA) { const g = s.tipo === 'columna' ? A.columnaGeo(s) : s.tipo === 'viga' ? A.vigaGeo(s) : null;
    Pt(s.id, `${s.id} · ${s.nombre}`, 'col', g, { ...base(s), sec: s.sec || '' }, ex(s)); }
  /* techos */
  if (p.techos) for (const t of M.TECHOS) if (!(p.detalle && t.id === 'T-01')) Pt(t.id, `${t.id} · ${t.nombre}`, 'techo', A.techoGeo(t), { ...base(t), med: `${t.pend} · de ${f2(t.z[0])} a ${f2(t.z[1])}` }, { group: 'Techos' });
  /* jardines y vereda */
  if (p.ext) for (const o of M.IMPLANTACION) if (o.poly) Pt(o.id, `${o.id} · ${o.nombre}`, o.tipo === 'vereda' ? 'vereda' : 'pasto', A.losa(o.poly, null, (o.z || 0) - 30, o.z || 0), base(o), { group: 'Exterior' });

  /* detalle del SketchUp: una pieza por grupo y color */
  if (p.detalle) { const seen = {}; for (const d of DET) { if (d.id === 'SU-13' && !p.techos) continue; if (d.id === 'SU-11') continue; if (d.id === 'SU-04' && d.cat === 'sub58a5a') continue; /* cerco de listones del SketchUp: va el de la foto */ /* el piso de tablas pasa a LO-02 */ const k = (seen[d.id] = (seen[d.id] || 0) + 1); Pt(k > 1 ? `${d.id}${String.fromCharCode(96 + k)}` : d.id, `${d.id} · ${d.nombre}`, d.cat, detGeo(d), { fn: 'Tal como está en tu SketchUp (Arcos_55.dae).', sec: '', med: '' }, { group: 'Detalle del SketchUp', opt: { noEdges: true } }); } }

  /* ediciones guardadas por Maxi (borrar, mover, estirar) */
  { const bid = id => id.replace(/[a-z]$/, ''); for (let i = parts.length - 1; i >= 0; i--) { const pp = parts[i], b = bid(pp.id); const e = ED.E[b] || ED.E[pp.id]; if (!e) continue; const datos = ED.enDatos(b);
      if (!datos && e.borrado) { parts.splice(i, 1); continue; } if (!datos && e.mov) { const { x = 0, y = 0, z = 0 } = e.mov; pp.geos = pp.geos.map(g => { const c = g.clone(); c.translate(x, z, y); return c; }); } } }

  const panes = { video3d: videoHTML(), ayuda: `<h3>Qué es cada cosa</h3><p>Lo que ves en color sale de tu SketchUp (Arcos_55.dae): niveles, fachada, balcón, entrepiso, escaleras, vestidor, techo y ventanal, con los mismos códigos que la planta (muros M-xx, aberturas P-/V-xx, losas LO-xx, escaleras E-xx, techos T-xx). Lo que el SketchUp no trae (medianeras, tabiques, subsuelo, claraboyas) sale del plano de regularización y está marcado así en cada pieza.</p>
    <p><b>Detalle del SketchUp</b> (SU-xx) son los grupos de tu modelo tal cual: ventanal repartido, terraza, tanque, jardín del frente, cocina y baños. <b>Calco SketchUp</b> pone tu modelo entero en gris transparente, para comparar.</p>
    <h3>Costados y ejes</h3><p>Fachada <b>E</b> (calle Arcos), jardín <b>O</b>, medianera <b>S</b> (a la izquierda mirando desde Arcos) y medianera <b>N</b>. x: desde el eje medianero S hacia el N. y: desde el fondo del lote hacia Arcos; la línea municipal está en 45,16. Alturas sobre el ±0,00 del plano.</p>
    <h3>Niveles</h3><ul>${Object.entries(M.NIVELES).filter(([k]) => k !== 'TE').map(([k, v]) => `<li><b>${k}</b> ${v.nombre}: ${v.z >= 0 ? '+' : ''}${f2(v.z)}${v.nota ? ' · ' + v.nota : ''}</li>`).join('')}<li>Techo de chapa al 10,8 %: +10,13 a +9,31.</li></ul>
    <h3>Cómo usarlo</h3><ul><li>Tocá una pieza: te muestra qué es y sus medidas.</li><li><b>Corte horizontal</b> saca lo que está arriba de una altura: así se ve cada planta.</li><li><b>Teclado</b>: W/S avanzar y retroceder, A/D de costado, Q/E bajar y subir, flechas para girar.</li></ul>` };
  const spec = `<span>v<b>${M.META.version}</b> · ${M.META.fecha}</span><span>${parts.length} piezas</span><span>lote <b>8,65 × 45,16</b></span><span>${M.DUDAS.length} dudas</span><span>cotas en m</span>`;
  const cx = 432, cy = 3100;
  return { parts, panes, spec, joints: [], steps: [],
    selExtra: pp => `<div class="renrow"><button class="btn" data-hide="${pp.id}">Ocultar pieza</button><button class="btn" data-showall>Mostrar todo</button></div>` + N.editorHTML(pp.id),
    selIntro: '<div class="k">Selección</div><h2>Tocá una pieza</h2><p style="margin:0;color:var(--muted);font-size:13px">O un código en cualquier texto.</p>',
    defaultView: 'iso',
    views: { iso: { label: 'Iso', p: [cx + 2600, 2000, cy + 2600], t: [cx, 380, cy] }, planta: { label: 'Planta', p: [cx, 5600, cy + 0.1], t: [cx, 0, cy] },
      frente: { label: 'Fachada E', p: [cx, 500, 4516 + 2600], t: [cx, 450, 3800] }, fondo: { label: 'Jardín O', p: [cx, 500, 300], t: [cx, 450, 2700] },
      izq: { label: 'Medianera S', p: [-2600, 700, cy], t: [cx, 350, cy] } },
    dims: ({ dimLine }) => { dimLine([0, 2, 4516 + 140], [865, 2, 4516 + 140], [0, 0, 8], '8,65'); dimLine([-120, 0, 3887], [-120, 857, 3887], [-8, 0, 0], '8,57'); dimLine([-120, -198, 3700], [-120, 72, 3700], [-8, 0, 0], '2,70'); } };
}

const COL = { ...COLORES, muro: '#d8d2c6', medianera: '#c9c2b4', tabique: '#e6e0d4', cerco: '#6b6f72', glass: '#9fc4cf', perfil: '#2f3438', puerta: '#8a6a4a', losa: '#cfcac0', piso: '#b9a07a',
  escalera: '#a8865c', escext: '#9a9a96', zanca: '#8f6a45', madera: '#a8865c', col: '#9a948a', techo: '#6f767c', pasto: '#7f9d5f', vereda: '#b7b4ad',
  artefacto: '#f3f0e8', dintel: '#c4552b', fachada: '#f1efe9', persiana: '#e4e2dc', 'caño': '#e9e9e5', herreria: '#24282b', tabla1: '#b59672', tabla2: '#9c7c5b', tabla3: '#8a7765', poste: '#7f4429', viga: '#ad6338', diag: '#c0522c', c1: '#e6b57a', c2: '#cc8f55', deck: '#d9a86f', liston: '#b9784a', herraje: '#59616a', wood: '#9b5a33', wood2: '#b06f42', steel: '#2f3438', inox: '#9aa3aa' };
const root = document.getElementById('modo-3d');
const visor = createVisor({ model: { params, build }, colors: COL, lift: { techo: 300 }, root, radial: 0, far: 40000 });

/* calco del SketchUp: GLB ya pasado a los ejes del modelo (cm, Y arriba) */
const calco = new THREE.Group(); calco.name = 'calco'; visor.scene.add(calco);
const calcoMsg = t => { const n = document.getElementById('calcoState'); if (n) n.textContent = t; };
function applyCalco() { calco.visible = !!visor.params.calco; window.__despertar && window.__despertar(); }
try { const bin = Uint8Array.from(atob(CALCO3D), c => c.charCodeAt(0)).buffer;
  new GLTFLoader().parse(bin, '', g => { const mat = new THREE.MeshStandardMaterial({ color: 0x6b7a86, transparent: true, opacity: .28, depthWrite: false, roughness: .9, side: THREE.DoubleSide });
    g.scene.traverse(o => { if (o.isMesh) { o.material = mat; o.userData.calco = true; } }); calco.add(g.scene); applyCalco(); calcoMsg('calco listo'); setTimeout(() => calcoMsg(''), 4000); },
    e => { console.error(e); calcoMsg('no se pudo leer el calco'); }); } catch (e) { console.error(e); calcoMsg('sin calco'); }
root.addEventListener('change', e => { if (/^(q|v)-calco$/.test(e.target.id)) setTimeout(applyCalco, 0); });

/* cortes */
const $ = id => document.getElementById(id);
const CL = { x: { on: $('cxOn'), v: $('cxV'), side: -1, axis: 'x' }, y: { on: $('cyOn'), v: $('cyV'), side: -1, axis: 'z' } };
function applyClips() { const list = []; const h = +visor.params.corte; if (h) list.push({ axis: 'y', value: h, side: -1 });
  for (const k of ['x', 'y']) { const c = CL[k]; if (c.on.checked) list.push({ axis: c.axis, value: +c.v.value, side: c.side }); $('c' + k + 'Lbl').textContent = (+c.v.value / 100).toFixed(2).replace('.', ',') + ' m'; }
  visor.setClips(list); }
for (const k of ['x', 'y']) { CL[k].on.addEventListener('change', applyClips); CL[k].v.addEventListener('input', () => { CL[k].on.checked = true; applyClips(); }); $('c' + k + 'Flip').addEventListener('click', () => { CL[k].side *= -1; CL[k].on.checked = true; applyClips(); }); }
root.addEventListener('change', e => { if (e.target.id === 'q-corte' || e.target.id === 'v-corte') applyClips(); });
root.addEventListener('click', e => { const h = e.target.closest('[data-hide]'); if (h) { visor.toggleHidden(h.dataset.hide, true); visor.resetSel(); return; } if (e.target.closest('[data-showall]')) visor.setHidden([]); });

/* vistas guardadas: en la base (colección «vistas») y en este navegador */
let VISTAS = [], vdb = null;
const snapshot = () => ({ cam: visor.getView(), corte: visor.params.corte, cx: CL.x.on.checked ? { v: +CL.x.v.value, side: CL.x.side } : null, cy: CL.y.on.checked ? { v: +CL.y.v.value, side: CL.y.side } : null, hidden: visor.hidden, params: { techos: visor.params.techos, calco: visor.params.calco, ext: visor.params.ext, carp: visor.params.carp } });
function applySnapshot(v) { if (v.params) visor.setParams(v.params); visor.params.corte = v.corte || '0'; ['q-corte', 'v-corte'].forEach(id => { const el = $(id); if (el) el.value = visor.params.corte; });
  for (const k of ['x', 'y']) { const c = v['c' + k]; CL[k].on.checked = !!c; if (c) { CL[k].v.value = c.v; CL[k].side = c.side; } } applyClips(); applyCalco(); visor.setHidden(v.hidden || []); if (v.cam) visor.fly(v.cam.p, v.cam.t); }
function persistLocal() { try { localStorage.setItem('arcos-vistas', JSON.stringify(VISTAS)); } catch (e) {} }
try { VISTAS = JSON.parse(localStorage.getItem('arcos-vistas') || '[]'); } catch (e) { VISTAS = []; }
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function renderVistas() { const sel = $('vistasSel');
  if (sel) { const cur = sel.dataset.cur || ''; const FIX = [...document.querySelectorAll('#viewbar [data-view]')].map(b => [b.dataset.view, b.textContent]);
    sel.innerHTML = '<option value="">Vistas…</option><optgroup label="Vistas fijas">' + FIX.map(([k, l]) => `<option value="__v:${esc(k)}">${esc(l)}</option>`).join('') + '</optgroup><optgroup label="Guardadas">' + VISTAS.map(v => `<option value="${esc(v.id)}">${esc(v.nombre)}</option>`).join('') + '</optgroup><option value="__save">＋ Guardar vista actual…</option><option value="__del" hidden>Borrar</option><option value="__upd" hidden>Actualizar</option><option value="__cut" hidden>Cortes</option>';
    sel.value = VISTAS.some(v => v.id === cur) ? cur : ''; vistaForm(sel); }
  const el = $('pane-vistas'); if (!el) return;
  el.innerHTML = `<p class="intro">Una vista guarda cámara, cortes, capas y piezas ocultas. Queda en la base de la página: la ves vos y la leo yo.</p><div class="renrow"><input type="text" id="vistaNombre" placeholder="nombre de la vista" maxlength="60"><button class="btn" id="vistaGuardar">Guardar</button></div><div class="renmsg" id="vistaMsg"></div>` +
    (VISTAS.length ? VISTAS.map(v => `<div class="row vrow" data-vista="${esc(v.id)}"><div style="flex:1;min-width:0"><div class="t"><b>${esc(v.nombre)}</b></div><div class="s">${(v.ts || '').slice(0, 10)}</div></div><button class="btn" data-vupd="${esc(v.id)}" title="Actualizar con la vista de ahora">⟳</button><button class="btn" data-vdel="${esc(v.id)}" title="Borrar">×</button></div>`).join('') : '<p class="s">Todavía no hay vistas guardadas.</p>');
  el.querySelectorAll('.vrow').forEach(r => r.addEventListener('click', e => { if (e.target.closest('[data-vdel],[data-vupd]')) return; const v = VISTAS.find(x => x.id === r.dataset.vista); if (v) applySnapshot(v); }));
  el.querySelectorAll('[data-vdel]').forEach(b => b.addEventListener('click', () => borrarVista(b.dataset.vdel)));
  el.querySelectorAll('[data-vupd]').forEach(b => b.addEventListener('click', () => actualizarVista(b.dataset.vupd)));
  $('vistaGuardar').addEventListener('click', async () => { const msg = await guardarVista(($('vistaNombre').value || '').trim()); const m = $('vistaMsg'); if (m) m.textContent = msg; }); }
async function escribir(v, ok) { persistLocal(); renderVistas(); if (!vdb) return ok + ' en este navegador.'; try { const { id: _i, ...body } = v; await vdb.doc('vistas/' + v.id).set(body); return ok + '.'; } catch (e) { return ok + ' sólo en este navegador (' + (e && e.code || 'sin permiso') + ').'; } }
async function guardarVista(nombre) { const id = 'v' + Date.now().toString(36); const v = { id, nombre: nombre || ('Vista ' + (VISTAS.length + 1)), ts: new Date().toISOString(), ...snapshot() }; VISTAS.push(v); const sel = $('vistasSel'); if (sel) sel.dataset.cur = id; return escribir(v, 'Guardada'); }
async function actualizarVista(id) { const i = VISTAS.findIndex(x => x.id === id); if (i < 0) return 'No encontré esa vista.'; VISTAS[i] = { ...VISTAS[i], ts: new Date().toISOString(), ...snapshot() }; return escribir(VISTAS[i], 'Actualizada'); }
async function borrarVista(id) { VISTAS = VISTAS.filter(x => x.id !== id); persistLocal(); renderVistas(); if (vdb) try { await vdb.doc('vistas/' + id).delete(); } catch (e) {} }
/* el desplegable de la barra: ir, guardar (pide nombre), actualizar, borrar (pide confirmación) */
let toast = null; const aviso = t => { if (!toast) { toast = document.createElement('div'); toast.style.cssText = 'position:fixed;top:56px;left:50%;transform:translateX(-50%);background:var(--panel);border:1px solid var(--accent);border-radius:3px;padding:4px 10px;font-size:12px;z-index:50'; document.body.appendChild(toast); } toast.textContent = t; toast.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => toast.hidden = true, 3000); };
function vistaForm(sel) { if (sel.dataset.bound) return; sel.dataset.bound = '1';
  const F = document.createElement('div'); F.id = 'vistaForm'; F.hidden = true; F.innerHTML = '<span id="vfLbl"></span><input type="text" id="vfNom" maxlength="60" placeholder="nombre de la vista"><button class="btn" id="vfOk">Guardar</button><button class="btn" id="vfNo">×</button>'; sel.parentNode.insertBefore(F, sel.nextSibling);
  const nom = F.querySelector('#vfNom'), ok = F.querySelector('#vfOk'), lbl = F.querySelector('#vfLbl'); let modo = null;
  const cerrar = () => { F.hidden = true; modo = null; sel.value = ''; };
  const abrir = m => { modo = m; F.hidden = false; if (m === 'save') { lbl.textContent = ''; nom.hidden = false; nom.value = ''; ok.textContent = 'Guardar'; setTimeout(() => nom.focus(), 0); } else { const v = VISTAS.find(x => x.id === sel.dataset.cur); if (!v) return cerrar(); lbl.textContent = '¿Borrar «' + v.nombre + '»?'; nom.hidden = true; ok.textContent = 'Borrar'; } };
  ok.addEventListener('click', async () => { const m = modo, cur = sel.dataset.cur; const nm = nom.value.trim(); cerrar(); if (m === 'save') aviso(await guardarVista(nm)); else if (m === 'del') { await borrarVista(cur); aviso('Borrada.'); } });
  F.querySelector('#vfNo').addEventListener('click', cerrar); nom.addEventListener('keydown', e => { if (e.key === 'Enter') ok.click(); if (e.key === 'Escape') cerrar(); });
  sel.addEventListener('change', async () => { const val = sel.value;
    if (val.startsWith('__v:')) { const b = document.querySelector(`#viewbar [data-view="${val.slice(4)}"]`); if (b) b.click(); sel.value = ''; return; }
    if (val === '__save') return abrir('save');
    if (val === '__del') return abrir('del');
    if (val === '__upd') { aviso(await actualizarVista(sel.dataset.cur)); return; }
    if (val === '__cut') { const v = VISTAS.find(x => x.id === sel.dataset.cur); if (v) { applySnapshot(v); if (window.__side) window.__side.toggle('corte', true); } sel.value = ''; return; }
    const v = VISTAS.find(x => x.id === val); if (v) { sel.dataset.cur = val; applySnapshot(v); } }); }
renderVistas();
N.getDb().then(db => { vdb = db; if (!db) return; db.collection('vistas').onSnapshot(snap => { const remote = []; snap.docs.forEach(d => { if (d.exists) remote.push({ id: d.id, ...d.data() }); }); if (remote.length || VISTAS.length === 0) { VISTAS = remote.sort((a, b) => (a.ts || '').localeCompare(b.ts || '')); persistLocal(); } renderVistas(); }, () => {}); });

/* variables de diseño en la base (todas menos las de «Ver») */
const PDES = new Set(params.filter(q => (q.group || '') !== 'Ver').map(q => q.id)); const pdes = P => Object.fromEntries(Object.entries(P).filter(([k]) => PDES.has(k)));
visor.onParam = P => { applyCalco(); if (vdb && PDES.size) vdb.doc('estado/params').set({ p: pdes(P), ts: new Date().toISOString() }).catch(() => {}); };

/* nombres propios y ediciones: al cambiar, se reconstruye */
N.bindEditor(root, () => {}); N.onChange(() => { visor.rebuild(); applyClips(); }); ED.onChange(() => { visor.rebuild(); applyClips(); });

/* teclado: WASD, Q/E, flechas (Shift = rápido) */
{ const keys = new Set(); const K = ['w', 'a', 's', 'd', 'q', 'e', 'arrowleft', 'arrowright', 'arrowup', 'arrowdown'];
  const busy = t => t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
  addEventListener('keydown', e => { const k = e.key.toLowerCase(); if (root.hidden || busy(e.target) || e.metaKey || e.ctrlKey || !K.includes(k)) return; e.preventDefault(); keys.add(k); if (e.shiftKey) keys.add('shift'); window.__despertar && window.__despertar(); });
  addEventListener('keyup', e => { keys.delete(e.key.toLowerCase()); if (!e.shiftKey) keys.delete('shift'); }); addEventListener('blur', () => keys.clear());
  let last = performance.now(); const V = THREE.Vector3, f = new V(), r = new V(), up = new V(0, 1, 0), d = new V();
  const tick = t => { const dt = Math.min(.05, (t - last) / 1000); last = t; if (keys.size) { window.__despertar && window.__despertar(); const cam = visor.camera, tg = visor.controls.target; const sp = Math.max(120, Math.min(1500, cam.position.distanceTo(tg) * .5)) * dt;
      f.copy(tg).sub(cam.position).normalize(); r.crossVectors(f, up); if (r.lengthSq() < 1e-6) r.set(1, 0, 0); r.normalize(); d.set(0, 0, 0);
      if (keys.has('w')) d.add(f); if (keys.has('s')) d.sub(f); if (keys.has('d')) d.add(r); if (keys.has('a')) d.sub(r); if (keys.has('e')) d.y += 1; if (keys.has('q')) d.y -= 1;
      if (d.lengthSq()) { d.normalize().multiplyScalar(sp); cam.position.add(d); tg.add(d); }
      const yaw = ((keys.has('arrowleft') ? 1 : 0) - (keys.has('arrowright') ? 1 : 0)) * 1.4 * dt, pit = ((keys.has('arrowup') ? 1 : 0) - (keys.has('arrowdown') ? 1 : 0)) * 1.0 * dt;
      if (yaw || pit) { const v = tg.clone().sub(cam.position); if (yaw) v.applyAxisAngle(up, yaw); if (pit) { const ax = new V().crossVectors(v, up).normalize(); const nv = v.clone().applyAxisAngle(ax, pit); if (Math.abs(Math.asin(nv.clone().normalize().y)) < 1.45) v.copy(nv); } tg.copy(cam.position).add(v); }
      visor.controls.update(); } requestAnimationFrame(tick); }; requestAnimationFrame(tick); }

try { initMarcas(visor, document.querySelector('#modo-3d .stage')); } catch (e) { console.error('marcas', e); }
try { initRealismo(visor, { piedra: [], ladrillo: [], blanco: [], cats: { madera: ['madera', 120], medianera: ['revoque', 200], losa: ['cemento', 300], escalera: ['madera', 120], zanca: ['madera', 120], escext: ['cemento', 200], pasto: ['pasto', 300], vereda: ['cemento', 200] } }); } catch (e) { console.error('realismo', e); }
try { initLuz(visor); } catch (e) { console.error('luz', e); }
try { initCalidad(visor); } catch (e) { console.error('calidad', e); }
/* sol: Núñez; el eje x del modelo apunta a ~320° (el norte del croquis está 40° a la derecha de «hacia la calle»… ver noche.js) */
try { initNoche(visor, { lugar: 'Núñez (CABA)', lat: -34.545, lon: -58.468, tz: -3, norte: -40, inicioDia: true, max: 32 }); visor.noche && visor.noche.setFuentes(LUCES.fuentes); } catch (e) { console.error('noche', e); }
/* cámara: se recuerda en este navegador */
{ try { const v = JSON.parse(localStorage.getItem('arcos-cam') || 'null'); if (v && v.p && v.t) { visor.camera.position.set(...v.p); visor.controls.target.set(...v.t); visor.controls.update(); } } catch (e) {}
  let last = ''; setInterval(() => { const v = visor.getView(); const k = JSON.stringify(v); if (k !== last) { last = k; try { localStorage.setItem('arcos-cam', k); } catch (e) {} } }, 1000); }
try { initEditor(visor, document.querySelector('#modo-3d .stage'), {}, zN('EP')); } catch (e) { console.error('editor', e); }
try { initSenalar(visor, document.querySelector('#modo-3d .stage')); } catch (e) { console.error('senalar', e); }
try { initMedir(visor, document.querySelector('#modo-3d .stage')); } catch (e) { console.error('medir', e); }
{ let vu = null; try { vu = initVistasUI(); } catch (e) { console.error('vistas', e); }
  try { initToolbar(document.querySelector('#modo-3d .stage'), visor, { vistas: vu, zonas: [] }); } catch (e) { console.error('toolbar', e); } }
try { initInspector(visor); } catch (e) { console.error('inspector', e); }
try { initSidebar(visor); } catch (e) { console.error('sidebar', e); }
window.__ok3d = true;
