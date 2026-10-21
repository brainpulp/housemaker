/* Arcos 4264 3D — arma las piezas con el armador genérico del motor (armador.js) a partir de modelo.js
   y arranca los módulos del motor. Lo propio de esta casa: categorías, vistas, cotas y el calco del SketchUp. */
import * as THREE from 'three';
import { createVisor, geo } from './visor3d.js';
import { escaleraGiro, DISENOS } from './escalera-giro.js';
import { tablones } from './tablones.js';
import { lucesArcos } from './luces.js';
import { fachadaArcos } from './fachada.js';
import { banio2P } from './banio2p.js';
import { HOJAS, partirSU01, initMovibles } from './movibles.js';
import { initCandado } from './candado.js';
let MOVS = null;
let LUCES = null;   /* se arman en el primer build, mirando la geometría (cada luz va al techo que tiene arriba) */
import { initSenalar } from './senalar.js';
import { initToolbar } from './toolbar.js';
import { initMedir } from './medir.js';
import { initVistasUI } from './vistasui.js';
import { initVistas } from './vistas.js';
import { initViewCube } from './viewcube.js';
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
const SEC2 = s => String(s).split('×').map(v => parseFloat(v.replace(',', '.')));
const PISOS_Z = [72, 409, 607], esPiso = (a, b, c) => Math.max(a, b, c) - Math.min(a, b, c) < 0.5 && PISOS_Z.some(z => a > z - 4 && a < z + 12);
const DZ_SU = { 'SU-02': 23, 'SU-03': 23, 'SU-07': 8, 'SU-08': 6, 'SU-10': 7, 'SU-13': y => (M.NIVELES.P2.z + 396 - 0.12 * (4516 - y - 1425)) - (1013 - 0.108 * (4516 - y - 1425)) };
const DET = DETALLE.map(d => { const b = Uint8Array.from(atob(d.b64), c => c.charCodeAt(0)); const q = new Int16Array(b.buffer); const f = [];
  const fuera = (a, b, c) => (d.id === 'SU-04' && Math.min(a, b, c) > 4440); /* cerco del frente: va el de fachada.js */
  for (let i = 0; i < q.length; i += 9) { if (esPiso(q[i + 1] / ESCALA, q[i + 4] / ESCALA, q[i + 7] / ESCALA) || fuera(q[i + 2] / ESCALA, q[i + 5] / ESCALA, q[i + 8] / ESCALA)) continue; for (let k = 0; k < 9; k++) f.push(q[i + k] / ESCALA); }
  /* niveles del plano (Maxi 16/10): lo que queda del SketchUp se sube a su nivel. El SketchUp tenía 1P +4,09, 2P +6,07,
     terraza +7,34 y el techo +10,13 al 10,8 %; el plano da +4,17, +6,13, +7,57 y el techo 3,81 sobre el 2P al 12 %. */
  const dz = DZ_SU[d.id]; if (dz) for (let i = 0; i < f.length; i += 3) f[i + 1] += typeof dz === 'function' ? dz(f[i + 2]) : dz;
  return { ...d, pos: new Float32Array(f) }; }).filter(d => d.pos.length);
/* SU-01 (ventanal O) partido en sus hojas móviles, sin tocar la geometría */
for (let i = DET.length - 1; i >= 0; i--) { const d = DET[i]; if (d.id !== 'SU-01') continue; const g = partirSU01(d.pos); DET.splice(i, 1, ...Object.entries(g).map(([k, pos]) => k === 'resto' ? { ...d, pos } : { ...d, id: k, nombre: HOJAS[k].nombre, pos, movil: true })); }
/* marcos del ventanal O (contrafrente) en gris oscuro casi negro (Maxi 20/10): todo lo que no es vidrio de SU-01 y sus hojas, salvo las ventanas de 2P a la terraza (y > 24,80) */
for (let i = DET.length - 1; i >= 0; i--) { const d = DET[i]; if (!(d.id === 'SU-01' || HOJAS[d.id]) || d.cat === 'glass') continue;
  const si = [], no = []; for (let t = 0; t < d.pos.length; t += 9) ((d.pos[t + 2] + d.pos[t + 5] + d.pos[t + 8]) / 3 <= 2480 ? si : no).push(...d.pos.subarray(t, t + 9));
  const out = []; if (si.length) out.push({ ...d, cat: 'marcoO', pos: new Float32Array(si) }); if (no.length) out.push({ ...d, pos: new Float32Array(no) }); DET.splice(i, 1, ...out); }
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

/* cara interior del ventanal O a la altura z: corte de los triángulos de sus vidrios y marcos con el plano horizontal z
   (los paños son planos entre filas de marcos: no alcanza con mirar vértices) */
const VID = DET.filter(d => d.id === 'SU-01' || HOJAS[d.id]);
const yVid = z => { let m = -1e9; for (const d of VID) { const q = d.pos; for (let t = 0; t < q.length; t += 9) for (let e = 0; e < 3; e++) {
      const a = t + e * 3, b = t + ((e + 1) % 3) * 3, za = q[a + 1], zb = q[b + 1];
      const ok = (x, y) => x > 640 && x < 870 && y < 2700;   /* sólo el ventanal O, en el ancho del baño */
      if (Math.abs(za - z) < .5 && ok(q[a], q[a + 2])) m = Math.max(m, q[a + 2]);
      if ((za - z) * (zb - z) < 0) { const u = (z - za) / (zb - za), x = q[a] + u * (q[b] - q[a]), y = q[a + 2] + u * (q[b + 2] - q[a + 2]); if (ok(x, y)) m = Math.max(m, y); } } }
  return m; };
/* tabiques que llegan al ventanal O: la punta sigue la inclinación del vidrio (Maxi 20/10: M-51 atravesaba el ventanal) */
const AL_VENTANAL = new Set(['M-51']);
const cortarAlVentanal = (m, geos) => { const L = Math.hypot(m.b[0] - m.a[0], m.b[1] - m.a[1]), z0 = A.zBase(M, m);
  for (const g of geos) { const P = g.attributes.position; for (let i = 0; i < P.count; i++) { let y = P.getZ(i), z = P.getY(i); const top = z > z0 + 1;
      for (let k = 0; k < 4; k++) { const yv = yVid(z) + 0.5; if (y >= yv - 0.01) break; y = yv; if (top) z = A.zTope(M, m, Math.min(1, Math.abs(y - m.a[1]) / L)); }
      P.setZ(i, y); P.setY(i, z); } P.needsUpdate = true; g.computeVertexNormals(); g.computeBoundingBox(); g.computeBoundingSphere(); }
  return geos; };
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
    Pt(m.id, `${m.id} · ${m.nombre}`, cat, AL_VENTANAL.has(m.id) ? cortarAlVentanal(m, A.muroGeos(M, m)) : A.muroGeos(M, m), { ...base(m), med }, ex(m));
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
  for (const a of M.ABERTURAS) { if (a.tipo !== 'vano' || a.dintel === false) continue; /* dintel:false = sin perfil a la vista (revocado) */ const m = M.MUROS.find(w => w.id === a.muro); if (!m) continue;
    const L = Math.hypot(m.b[0] - m.a[0], m.b[1] - m.a[1]), ux = (m.b[0] - m.a[0]) / L, uy = (m.b[1] - m.a[1]) / L, z = A.zBase(M, m) + (a.s || 0) + a.h;
    const d0 = a.d - 15, d1 = a.d + a.w + 15, w = m.e / 2 + .5, nx = -uy, ny = ux, P = (d, s) => [m.a[0] + ux * d + nx * s, m.a[1] + uy * d + ny * s];
    const q = [P(d0, -w), P(d1, -w), P(d1, w), P(d0, w)];
    Pt(a.id + 'd', `${a.id} · dintel de hierro`, 'dintel', A.losa(q, null, z, z + 16), { fn: 'Perfil de hierro sobre el vano, con antióxido naranja, como se ve en las fotos.', sec: 'perfil 16', med: `${f2(a.w + 30)} de largo` }, ex(m)); }
  /* cabios del entrepiso (plano de estructura, +3,29): de canto, clavados directo bajo las tablas; van de viga a viga
     (las vigas de madera VE-… cortan el tramo) y del lado de la medianera entran en ella */
  { const vm = M.ESTRUCTURA.filter(s => s.tipo === 'viga' && s.cat === 'madera');
    for (const l of M.LOSAS) { const c = l.cabios; if (!c) continue;
      const [b, h] = c.sec.split('×').map(v => parseFloat(v.replace(',', '.'))), zt = l.z - l.e, g = [];
      const xs = l.poly.map(q => q[0]), ys = l.poly.map(q => q[1]), X0 = Math.min(...xs), X1 = Math.max(...xs), Y0 = Math.min(...ys), Y1 = Math.max(...ys);
      const [u0, u1, v0, v1] = c.dir === 'y' ? [X0, X1, Y0, Y1] : [Y0, Y1, X0, X1];
      /* cortes: vigas que cruzan el tramo (perpendiculares a los cabios) */
      const cortes = vm.filter(s => c.dir === 'y' ? s.a[1] === s.b[1] : s.a[0] === s.b[0]).map(s => { const w = parseFloat(s.sec) / 2, v = c.dir === 'y' ? s.a[1] : s.a[0]; return [v - w, v + w]; }).filter(([a, b2]) => b2 > v0 && a < v1).sort((a, b2) => a[0] - b2[0]);
      const tramos = []; let v = v0; for (const [a, b2] of cortes) { if (a > v + 1) tramos.push([v, a]); v = Math.max(v, b2); } if (v1 > v + 1) tramos.push([v, v1]);
      const n = Math.max(1, Math.round((u1 - u0) / c.sep)), du = (u1 - u0) / n;
      for (let k = 0; k <= n; k++) { const u = Math.min(u1 - b / 2, Math.max(u0 + b / 2, u0 + k * du));
        for (const [a, b2] of tramos) { const q = c.dir === 'y' ? [[u - b / 2, a], [u + b / 2, a], [u + b / 2, b2], [u - b / 2, b2]] : [[a, u - b / 2], [b2, u - b / 2], [b2, u + b / 2], [a, u + b / 2]]; g.push(A.losa(q, null, zt - h, zt)); } }
      Pt(l.id + 'c', `${l.id} · cabios`, 'madera', g, { fn: `Cabios de ${c.sec.replace('×', ' × ')} de canto, cada ~${f2(du)}, clavados directo bajo las tablas de ${l.e}; van de viga a viga (plano de estructura, +3,29).`, sec: c.sec, med: `${n + 1} cabios` }, { group: NIV[l.nivel] || NIV.EP }); } }
  /* fachada E como en la foto */
  /* cara interior del ventanal O (hojas del SketchUp) a cada altura, en el ancho del baño de 2P: la máxima y por franja de 10 */
  /* fondo de la estructura del techo (SU-13) sobre una franja de y: el cajón del baño queda por debajo */
  const zEstrTecho = (y0, y1) => { let m = 1e9; for (const d of DET) if (d.id === 'SU-13') { const q = d.pos; for (let i = 0; i < q.length; i += 3) if (q[i + 2] > y0 - 30 && q[i + 2] < y1 + 30) m = Math.min(m, q[i + 1]); } return m; };
  for (const f of banio2P(THREE, M, { yVid, zEstrTecho })) Pt(f.id, `${f.id} · ${f.nombre}`, f.cat, f.geos, f.info, { group: NIV.P2, tags: ['baño 2P'], opt: { noEdges: f.cat === 'herreria' } });
  for (const f of fachadaArcos(THREE, M, A)) Pt(f.id, `${f.id} · ${f.nombre.replace(/^[A-Z0-9-]+ · /, '')}`, f.cat, f.geos, f.info, { group: 'Fachada E', tags: ['fachada'], opt: { noEdges: /caño|herreria/.test(f.cat) } });
  /* luces: artefactos (las fuentes las maneja noche.js) */
  /* escaleras y barandas */
  for (const e of M.ESCALERAS) { if (e.id === 'E-02') continue; const g = A.escaleraGeos(e);
    Pt(e.id, `${e.id} · ${e.nombre}`, e.exterior ? 'escext' : 'escalera', g.ped, { ...base(e), med: `${e.n} alzadas · de ${f2(e.z[0])} a ${f2(e.z[1])}` }, ex(e));
    Pt(e.id + 'z', `${e.id} · zancas`, 'zanca', g.zan, base(e), ex(e)); }
  for (const b of M.BARANDAS || []) { if (b.id === 'BA-2') continue; const E = b.sigue ? M.ESCALERAS.find(e => e.id === b.sigue) : null;
    Pt(b.id, `${b.id} · ${b.nombre}`, b.tipo === 'madera' ? 'madera' : 'perfil', A.barandaGeos(b, E), base(b), ex(b)); }
  /* E-02 al detalle (escalera-giro.js): ejes de la escalera → ejes de la casa. Tramo contra la medianera N (z 92 = x 850),
     sube hacia el fondo; el fondo del giro queda en y 2825. 15 alzadas de PB al entrepiso. */
  { const E2 = M.ESCALERAS.find(e => e.id === 'E-02'), nA = 15, R = (zN('EP') - zN('PB')) / nA, X0 = 758, Y0 = 2825 + 12 * 24 + 92;
    const eg = escaleraGiro(geo, { N: nA, R, G: 24, zF: -20, LR4: 850 - 666, design: p.baranda });
    const map = g => { const h = geo.mapGeo(g, (x, y, z) => [X0 + z, zN('PB') + y, Y0 - x]); delete h.userData.rod; return h; };
    for (const q of eg.parts) Pt('E2-' + q.id, `E2-${q.id.replace(/(t|pi|b|f|s)$/, '')} · ${q.name.replace(/^[A-Z0-9]+ · /, '')}`, q.cat, q.geos.map(map), { ...q.info, fn: (q.info.fn || '') + ' <i>Diseño del 11/10 («Escalera al entrepiso»).</i>', u: [q.info.u, 'D-11'].filter(Boolean).join(' · ') }, { group: 'Escalera E-02', tags: ['E-02'], opt: { noEdges: /^(inox|steel|glass)$/.test(q.cat) } }); }
  /* estructura */
  for (const s of M.ESTRUCTURA) { const g = s.tipo === 'columna' ? A.columnaGeo(s) : s.tipo === 'viga' ? A.vigaGeo(s) : s.tipo === 'tensor' ? geo.rod([s.pos[0], s.z[0], s.pos[1]], [s.pos[0], s.z[1], s.pos[1]], 0.8, 8) : null;
    Pt(s.id, `${s.id} · ${s.nombre}`, s.cat || (s.tipo === 'tensor' ? 'herreria' : s.tipo === 'viga' ? 'viga' : 'col'), g, { ...base(s), sec: s.sec || '', med: s.tipo === 'viga' ? `${f2(Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]))} de largo, fondo a +${f2(s.z - SEC2(s.sec)[1])}` : s.z ? `de +${f2(s.z[0])} a +${f2(s.z[1])}` : '' }, ex(s)); }
  /* techos */
  if (p.techos) for (const t of M.TECHOS) if (!(p.detalle && t.id === 'T-01')) Pt(t.id, `${t.id} · ${t.nombre}`, 'techo', A.techoGeo(t), { ...base(t), med: `${t.pend} · de ${f2(t.z[0])} a ${f2(t.z[1])}` }, { group: 'Techos' });
  /* jardines y vereda */
  if (p.ext) for (const o of M.IMPLANTACION) if (o.poly) Pt(o.id, `${o.id} · ${o.nombre}`, o.tipo === 'vereda' ? 'vereda' : 'pasto', A.losa(o.poly, null, (o.z || 0) - 30, o.z || 0), base(o), { group: 'Exterior' });

  /* detalle del SketchUp: una pieza por grupo y color */
  if (p.detalle) { const seen = {}; for (const d of DET) { if (d.id === 'SU-13' && !p.techos) continue; if (d.id === 'SU-11' || d.id === 'SU-09' || d.id === 'SU-08') continue; if (d.id === 'SU-06' || (d.id === 'SU-07' && d.cat === 'su000000')) continue; /* SU-06: caja del toilette del SketchUp, que llegaba a la losa vieja y atravesaba V301 (el toilette sale del video, M-30 a M-33); SU-07 negro: placa a nivel de piso en todo el 1P, debajo de los tablones */ /* SU-08: baño de 2P del SketchUp (ducha al ventanal): va el de la obra, banio2p.js */ /* SU-09: pasamanos del SketchUp, de las escaleras viejas; van las barandas del modelo */ if (d.id === 'SU-04' && d.cat === 'sub58a5a') continue; /* cerco de listones del SketchUp: va el de la foto */ /* el piso de tablas pasa a LO-02 */ const k = (seen[d.id] = (seen[d.id] || 0) + 1); if (d.id === 'VO-H1' && !seen['VO-H1r']) { seen['VO-H1r'] = 1; /* rieles de la puerta chica, del lado de adentro de la hoja 1: arriba un perfil U, abajo una guía */ Pt('VO-H1r', 'VO-H1r · Rieles de la puerta chica', 'marcoO', [geo.box(32.8, 235.8, 287.5, 291.5, 2360.5, 2368), geo.box(32.8, 235.8, 84, 87.6, 2360.5, 2368)], { fn: 'Rieles sobre la hoja grande: la puerta chica corre por ellos (Maxi, 20/10).', sec: 'perfil U de aluminio', med: '2,03 m' }, { group: 'Ventanal O', opt: { noEdges: true } }); }
      Pt(k > 1 ? `${d.id}${String.fromCharCode(96 + k)}` : d.id, `${d.id} · ${d.nombre}`, d.cat, detGeo(d), { fn: d.movil ? 'Hoja del ventanal de tu SketchUp (paños de 1 × 1). Se corre con «Correr», acá abajo.' : 'Tal como está en tu SketchUp (Arcos_55.dae).', sec: '', med: '' }, { group: d.movil ? 'Ventanal O' : 'Detalle del SketchUp', opt: { noEdges: true } }); } }

  /* luces: cada downlight va al primer techo real que tiene arriba (losa, viga, cabio, cielorraso); si arriba hay vidrio
     (el ventanal O se inclina hacia adentro), se corre hacia adentro hasta salir de abajo del vidrio. Las fuentes las maneja noche.js. */
  if (!LUCES) { const rc = new THREE.Raycaster(), UP = new THREE.Vector3(0, 1, 0), mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
    const NO = /^(artefacto|pasto|vereda|calco)/, meshes = []; for (const q of parts) if (!NO.test(q.cat || '')) for (const g of q.geos) { const m = new THREE.Mesh(g, mat); m.userData.q = q; m.updateMatrixWorld(); meshes.push(m); }
    const esVidrio = q => /^(SU-01|VO-)/.test(q.id) || q.cat === 'glass';
    const TECHO_OK = /^(losa|madera|viga|placa|techo|mamposteria|tabla)/, esTecho = q => TECHO_OK.test(q.cat || '') || /^(LO-|T-|SU-13)/.test(q.id);
    /* primer techo arriba del punto; si antes (a menos de 25 del techo) se cruza otra cosa —un revestimiento, un mueble alto— la luz no va ahí */
    const golpe = (x, y, z0) => { rc.set(new THREE.Vector3(x, z0 + 120, y), UP); const H = rc.intersectObjects(meshes, false); for (const h of H) { const q = h.object.userData.q;
        if (esVidrio(q)) return { z: h.point.y, q }; if (!esTecho(q) || !h.face || Math.abs(h.face.normal.y) < .7) continue;
        const estorbo = H.some(o => o.distance < h.distance - .5 && h.point.y - o.point.y < 40);   /* cualquier cosa justo debajo del techo: cerchas, revestimientos, muebles altos */
        return { z: h.point.y, q, estorbo }; } return null; };
    /* rayos: el centro y dos anillos (3,5 y 7,5) que cubren el disco de 6 de radio con margen */
    const ANILLO = [[0, 0], ...[...Array(6)].map((_, i) => [3.5 * Math.cos(i * Math.PI / 3), 3.5 * Math.sin(i * Math.PI / 3)]), ...[...Array(12)].map((_, i) => [7.5 * Math.cos(i * Math.PI / 6), 7.5 * Math.sin(i * Math.PI / 6)])];
    /* corrimientos que se prueban, del punto de la grilla hacia afuera (no acumulativos) */
    const CORR = [[0, 0]]; for (const r of [10, 20, 30, 45]) for (let i = 0; i < 8; i++) CORR.push([Math.round(r * Math.cos(i * Math.PI / 4)), Math.round(r * Math.sin(i * Math.PI / 4))]);
    const techo = (x0g, y0g, z0) => { for (let k = 0; k < CORR.length; k++) { const x = x0g + CORR[k][0], y = y0g + CORR[k][1]; const hs = ANILLO.map(([dx, dy]) => golpe(x + dx, y + dy, z0)); if (hs.some(h => !h)) return null;
        if (hs.some(h => esVidrio(h.q) || h.estorbo)) continue;
        /* sólo sobre una superficie plana: si los cinco rayos no pegan a la misma altura (borde de viga, cabio, cercha), se corre */
        const zs = hs.map(h => h.z), inclinado = hs.every(h => /^(SU-13|T-)/.test(h.q.id) || h.q.cat === 'techo'), sp = Math.max(...zs) - Math.min(...zs);
        if (sp > (inclinado ? 4 : .5)) continue;
        const z = Math.min(...zs) - (inclinado ? 2.5 : 0);   /* bajo chapa ondulada, 2,5 más abajo */
        /* y lejos de las caras verticales (revestimientos, muros): rayos horizontales desde el borde de arriba del disco */
        const pared = [...Array(24)].some((_, i) => { rc.set(new THREE.Vector3(x, z - [.2, 1, 1.8][i % 3], y), new THREE.Vector3(Math.cos((i >> 0) * Math.PI / 12), 0, Math.sin((i >> 0) * Math.PI / 12))); rc.far = 8; const h = rc.intersectObjects(meshes, false)[0]; rc.far = Infinity; return !!h; });
        if (pared) continue;
        return { z, x, y }; } return null; };   /* sin lugar limpio después de 8 intentos: esa luz no va */
    LUCES = lucesArcos(THREE, M, techo); }
  for (const a of LUCES.art) Pt(a.id, `${a.id} · ${a.nombre}`, 'artefacto', a.geos.map(g => g.clone()), a.info, { group: 'Luces', tags: ['luces', a.nivel], opt: { noEdges: true } });

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
    selExtra: pp => (MOVS ? MOVS.html(pp.id) : '') + `<div class="renrow"><button class="btn" data-hide="${pp.id}">Ocultar pieza</button><button class="btn" data-showall>Mostrar todo</button></div>` + N.editorHTML(pp.id),
    selIntro: '<div class="k">Selección</div><h2>Tocá una pieza</h2><p style="margin:0;color:var(--muted);font-size:13px">O un código en cualquier texto.</p>',
    defaultView: 'iso',
    views: { iso: { label: 'Iso', p: [cx + 2600, 2000, cy + 2600], t: [cx, 380, cy] }, planta: { label: 'Planta', p: [cx, 5600, cy + 0.1], t: [cx, 0, cy] },
      frente: { label: 'Fachada E', p: [cx, 500, 4516 + 2600], t: [cx, 450, 3800] }, fondo: { label: 'Jardín O', p: [cx, 500, 300], t: [cx, 450, 2700] },
      izq: { label: 'Medianera S', p: [-2600, 700, cy], t: [cx, 350, cy] } },
    dims: ({ dimLine }) => { dimLine([0, 2, 4516 + 140], [865, 2, 4516 + 140], [0, 0, 8], '8,65'); dimLine([-120, 0, 3887], [-120, 857, 3887], [-8, 0, 0], '8,57'); dimLine([-120, -198, 3700], [-120, 72, 3700], [-8, 0, 0], '2,70'); } };
}

const COL = { ...COLORES, marcoO: '#2b2e31', muro: '#d8d2c6', medianera: '#c9c2b4', tabique: '#e6e0d4', cerco: '#6b6f72', glass: '#9fc4cf', perfil: '#2f3438', puerta: '#8a6a4a', losa: '#cfcac0', piso: '#b9a07a',
  escalera: '#a8865c', escext: '#9a9a96', zanca: '#8f6a45', madera: '#a8865c', col: '#9a948a', techo: '#6f767c', pasto: '#7f9d5f', vereda: '#b7b4ad',
  artefacto: '#f3f0e8', placa: '#a9bfa3', mamposteria: '#d6d1c7', dintel: '#c4552b', fachada: '#f1efe9', persiana: '#e4e2dc', 'caño': '#e9e9e5', herreria: '#24282b', tabla1: '#b59672', tabla2: '#9c7c5b', tabla3: '#8a7765', poste: '#7f4429', viga: '#ad6338', diag: '#c0522c', c1: '#e6b57a', c2: '#cc8f55', deck: '#d9a86f', liston: '#b9784a', herraje: '#59616a', wood: '#9b5a33', wood2: '#b06f42', steel: '#2f3438', inox: '#9aa3aa' };
const root = document.getElementById('modo-3d');
const visor = createVisor({ model: { params, build }, colors: COL, lift: { techo: 300 }, root, radial: 0, far: 40000 });
try { initCandado(visor); } catch (e) { console.error('candado', e); } /* interruptor «Mover: sí / no» arriba a la derecha y candado por parte, como en Carhué */
MOVS = initMovibles(visor, root, M);
visor.controlPieza = id => MOVS.html(id); /* el inspector muestra «Correr» / «Persiana» en las piezas que se mueven */
/* relleno desde abajo: de día ilumina cielorrasos y techos por dentro (noche.js lo maneja como luz de relleno y lo apaga de noche) */
{ const l = new THREE.DirectionalLight(0xfff6ec, .45); l.position.set(300, -1000, 500); visor.scene.add(l); }

/* calco del SketchUp: GLB ya pasado a los ejes del modelo (cm, Y arriba) */
const calco = new THREE.Group(); calco.name = 'calco'; visor.scene.add(calco);
const calcoMsg = t => { const n = document.getElementById('calcoState'); if (n) n.textContent = t; };
function applyCalco() { calco.visible = !!visor.params.calco; window.__despertar && window.__despertar(); }
try { const bin = Uint8Array.from(atob(CALCO3D), c => c.charCodeAt(0)).buffer;
  new GLTFLoader().parse(bin, '', g => { const mat = new THREE.MeshStandardMaterial({ color: 0x6b7a86, transparent: true, opacity: .28, depthWrite: false, roughness: .9, side: THREE.DoubleSide });
    g.scene.traverse(o => { if (o.isMesh) { o.material = mat; o.userData.calco = true; } }); calco.add(g.scene); applyCalco(); calcoMsg('calco listo'); setTimeout(() => calcoMsg(''), 4000); },
    e => { console.error(e); calcoMsg('no se pudo leer el calco'); }); } catch (e) { console.error(e); calcoMsg('sin calco'); }
root.addEventListener('change', e => { if (/^(q|v)-calco$/.test(e.target.id)) setTimeout(applyCalco, 0); });

/* cortes y vistas: del motor (motor/vistas.js), iguales en todas las casas (Maxi 20/10) */
const $ = id => document.getElementById(id);
const VI = initVistas(visor, { M, root, pref: 'arcos', rango: { x: [-100, 965], y: [-50, 4600], z: [-250, 1100] }, params: ['techos', 'calco', 'ext', 'carp'], dirAmb: [.55, .85], alAplicar: () => applyCalco() });
const applyClips = () => VI.applyClips(), renderVistas = () => VI.renderVistas();
let vdb = null; N.getDb().then(d => { vdb = d; });
root.addEventListener('click', e => { const h = e.target.closest('[data-hide]'); if (h) { visor.toggleHidden(h.dataset.hide, true); visor.resetSel(); renderVistas(); return; } if (e.target.closest('[data-showall]')) visor.setHidden([]); });

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
window.__encastres = [['E2-ZE', 'E2-PA', 'la zanca ZE entra 1,5 en el poste PA (diseño del 11/10)'], ['E2-ZI', 'E2-C1', 'la nariz de la compensada C1 apoya 1 cm sobre el remate a plomo de la zanca ZI (diseño del 11/10)']];
try { initNoche(visor, { lugar: 'Núñez (CABA)', lat: -34.545, lon: -58.468, tz: -3, norte: -40, inicioDia: true, max: 32 }); visor.noche && visor.noche.setFuentes(LUCES.fuentes); } catch (e) { console.error('noche', e); }
/* cámara: se recuerda en este navegador */
{ try { const v = JSON.parse(localStorage.getItem('arcos-cam') || 'null'); if (v && v.p && v.t) { visor.camera.position.set(...v.p); visor.controls.target.set(...v.t); visor.controls.update(); } } catch (e) {}
  let last = ''; setInterval(() => { const v = visor.getView(); const k = JSON.stringify(v); if (k !== last) { last = k; try { localStorage.setItem('arcos-cam', k); } catch (e) {} } }, 1000); }
try { initEditor(visor, document.querySelector('#modo-3d .stage'), {}, zN('EP')); } catch (e) { console.error('editor', e); }
try { initSenalar(visor, document.querySelector('#modo-3d .stage')); } catch (e) { console.error('senalar', e); }
try { initMedir(visor, document.querySelector('#modo-3d .stage')); } catch (e) { console.error('medir', e); }
{ let vu = null; try { vu = initVistasUI(); } catch (e) { console.error('vistas', e); }
  try { initToolbar(document.querySelector('#modo-3d .stage'), visor, { vistas: vu, zonas: [] }); } catch (e) { console.error('toolbar', e); } }
try { initViewCube(visor); } catch (e) { console.error('viewcube', e); }
try { initInspector(visor); } catch (e) { console.error('inspector', e); }
try { initSidebar(visor); } catch (e) { console.error('sidebar', e); }
window.__ok3d = true;
