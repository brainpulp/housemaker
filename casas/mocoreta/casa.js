/* Mocoretá 3D — arma las piezas con el armador genérico del motor (armador.js) a partir de modelo.js y arranca los módulos del motor.
   Lo propio de esta casa: los tirantes por conjunto (TIRANTES) y la cenefa que cierra la cámara del techo. */
import * as THREE from 'three';
import { createVisor, geo } from './visor3d.js';
import { initSenalar } from './senalar.js';
import { initToolbar } from './toolbar.js';
import { initMedir } from './medir.js';
import { initVistasUI } from './vistasui.js';
import { initVistas } from './vistas.js';
import { initViewCube } from './viewcube.js';
import { initPersonas } from './personas.js';
import { initEquipamiento } from './equipamiento.js';
import { equipMocoreta } from './equipamiento-mocoreta.js';
import { initTours } from './tours.js';
import { TOURS_MOCORETA, ESCALERAS_MOCORETA } from './tours-mocoreta.js';
import { initTermica } from './termica.js';
import * as M from './modelo.js';
import * as A from './armador.js';
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
import { tablones } from './tablones.js';
import { initCorredizas } from './corredizas.js';
let CORR = null;
/* hojas corredizas: 0 = cerrada; corren en y (a lo largo de la fachada) hasta dy */
const HOJAS = Object.fromEntries(M.MUROS.filter(m => m.corrediza).map(m => { const h = M.HOJA[m.a[0] > M.ANCHO / 2 ? 'N' : 'S']; return [m.id, { nombre: m.nombre, eje: 'y', min: Math.min(0, h.dy), max: Math.max(0, h.dy) }]; }));

const f2 = cm => (cm / 100).toFixed(2).replace('.', ',');
const f1 = v => (+v).toFixed(1).replace('.', ',');
const NIV = Object.fromEntries(Object.entries(M.NIVELES).map(([k, v]) => [k, v.nombre]));
const { box, box8 } = geo;

const params = [
  { id: 'altura', label: 'Altura de la casa', type: 'select', value: 'hoy', quick: true, group: 'Hipótesis', options: [['hoy', 'Como hoy (piso a 1,47)'], ['alta', 'Elevada (piso a 2,90, planta baja habitable)']], help: 'Hipótesis de proyecto: levantar la casa sobre los zancos para habitar la planta al nivel del terreno. El deck sube con la casa y la plataforma norte queda siempre a media altura (D-15).' },
  { id: 'piso2', label: 'Segundo piso', type: 'select', value: 'no', quick: true, group: 'Hipótesis', options: [['no', 'Sin segundo piso (como hoy)'], ['A', 'Planta A: galería sur']], help: 'Hipótesis de proyecto: piso alto sobre los módulos 1 a 3 (oficina, doble altura, dormitorio y baño), terraza sobre el 5 y el 6 y ensanche de 2,00 al sur con la escalera; frente norte inclinado 30° con vidrio repartido, 2,60 de altura (D-14).' },
  { id: 'sillon', label: 'Sillón en C del desnivel', type: 'check', value: true, quick: true, group: 'Ver' },
  { id: 'techos', label: 'Techo (chapa y cenefa)', type: 'check', value: true, quick: true, group: 'Ver', help: 'Apagalo para ver la cámara y el cielorraso desde arriba.' },
  { id: 'cielo', label: 'Cielorraso', type: 'check', value: true, quick: true, group: 'Ver', help: 'Apagalo (con el techo) para ver los tirantes y las vigas transversales desde arriba.' },
  { id: 'tirantes', label: 'Tirantes (tentativos)', type: 'check', value: true, quick: true, group: 'Ver', help: 'Tirantes del piso, del cielorraso y de los decks. Sección y separación supuestas (D-05).' },
  { id: 'pisos', label: 'Pisos y decks', type: 'check', value: true, quick: true, group: 'Ver', help: 'Apagalo para ver los tirantes del piso.' },
  { id: 'carp', label: 'Vidrios', type: 'check', value: true, quick: true, group: 'Ver', help: 'Ventanales, puertas corredizas y vidrios fijos.' },
  { id: 'equip', label: 'Equipamiento (escenarios)', type: 'check', value: true, quick: true, group: 'Ver' },
  { id: 'corte', label: 'Corte horizontal', type: 'select', value: '0', quick: true, group: 'Ver',
    options: [['0', 'Sin corte'], ['120', 'a +1,20'], ['260', 'a +2,60 (bajo la viga de arriba)']], help: 'Saca todo lo que está por encima de esa altura, como una planta.' },
];

function build(p) {
  const H2 = p.piso2 === 'A', V = M.modelo({ terr: p.altura === 'alta' ? M.TERR_ALTA : M.TERR, deckS: H2 ? [800, 1200] : null }), MM = { ...M, ...V }, parts = [];
  window.__terreno = { t: MM.TERR, c: 0 };
  const Pt = (id, name, cat, geos, info, ex = {}) => { const al = N.alias(id); geos = [].concat(geos).filter(Boolean); if (!geos.length) return;
    parts.push({ id, name: al ? `${id} · ${al}` : name, alias: al, cat, geos, info: { ...info, fn: (N.nota(id) ? `<b>Tu nota:</b> ${N.nota(id)}<br>` : '') + (info.fn || '') }, ...ex }); };
  const G = { fach: 'Fachadas', est: 'Estructura', piso: 'Pisos y decks', techo: 'Techo' };
  const base = d => ({ fn: (d.conf === 'supuesto' ? '<b>Supuesto.</b> ' : '') + (d.nota || ''), sec: '', med: '', u: MM.DUDAS.filter(x => x.ref.includes(d.id)).map(x => x.id).join(' · ') });

  /* fachadas: ventanales (vidrio + marco), puertas corredizas y paños de madera con vidrio arriba */
  const SACA = H2 ? new Set(['MS-03', 'MS-04', 'MS-05', 'MS-06', 'V-S03', 'V-S04', 'V-S06', 'FC-2S', 'FC-3S']) : new Set();   /* el ensanche sur de los módulos 2 y 3 abre esa fachada */
  for (const m of MM.MUROS) { if (SACA.has(m.id)) continue; const L = Math.hypot(m.b[0] - m.a[0], m.b[1] - m.a[1]), med = `${f2(L)} × ${f2(A.zTope(MM, m, 0) - A.zBase(MM, m))}`;
    if (m.corrediza) { /* hoja corrediza de hierro, fuera del plano del vidrio (N por dentro, S colgada por fuera). Se dibuja cerrada: la corre motor/corredizas.js al arrastrarla */
      const f = m.a[0] > MM.ANCHO / 2 ? 'N' : 'S', H = MM.HOJA, h = H[f], w = H.perfil;
      const y0 = f === 'N' ? m.a[1] - 2.5 : m.a[1] - 5, y1 = f === 'N' ? m.b[1] + 3 : m.b[1] - .5, z0 = f === 'N' ? MM.Z0 + .5 : 1.5, z1 = MM.ZV - .5, xa = h.x - H.e / 2, xb = h.x + H.e / 2;
      const marco = [box(xa, xb, z0, z1, y0, y0 + w), box(xa, xb, z0, z1, y1 - w, y1), box(xa, xb, z0, z0 + w, y0 + w, y1 - w), box(xa, xb, z1 - w, z1, y0 + w, y1 - w)];
      /* riel: cubre la hoja cerrada y abierta, y no más. El del sur va atornillado a la cara de afuera de la viga de arriba; el del norte, por dentro, bajo la viga */
      const ya = y0 + Math.min(0, h.dy), yb = y1 + Math.max(0, h.dy);
      const riel = f === 'S' ? box(MM.XS - 3, MM.XS, MM.ZV + 1, MM.ZV + 6, ya, yb) : box(xa, xb, MM.ZV, MM.ZV + 3, ya, yb);
      if (p.carp) Pt(m.id, `${m.id} · ${m.nombre}`, 'glass', box(h.x - .5, h.x + .5, z0 + w, z1 - w, y0 + w, y1 - w), { ...base(m), med }, { group: G.fach, opt: {} });
      Pt(m.id + 'h', `${m.id} · hoja de hierro`, 'hierro', marco, { ...base(m), med, sec: 'hierro oxidado' }, { group: G.fach, opt: {} });
      Pt(`RL-${f}`, `RL-${f} · Riel de la corrediza ${f === 'N' ? 'de entrada' : 'de atrás'}`, 'hierro', riel, { fn: f === 'S' ? 'Riel de hierro por fuera, sobre la viga de arriba: la hoja cuelga de él.' : 'Riel de hierro por dentro, bajo la viga de arriba.', sec: 'hierro', med: `${f2(yb - ya)} de largo`, u: 'D-06' }, { group: G.fach, opt: {} }); continue; }
    if (m.tipo === 'vidrio') { const g = A.vidrioGeos(MM, m);
      if (p.carp) Pt(m.id, `${m.id} · ${m.nombre}`, 'glass', g.vidrio, { ...base(m), med }, { group: G.fach, opt: {} });
      Pt(m.id + 'm', `${m.id} · marco`, 'marco', g.perfiles, { ...base(m), med, sec: 'marco' }, { group: G.fach, opt: {} }); }
    else Pt(m.id, `${m.id} · ${m.nombre}`, 'muro', A.muroGeos(MM, m), { ...base(m), med, sec: `madera, ${m.e} cm` }, { group: G.fach, opt: {} }); }
  if (p.carp) for (const a of MM.ABERTURAS) if (!SACA.has(a.id)) Pt(a.id, `${a.id} · ${a.nombre}`, 'glass', A.hojaGeo(MM, a, 2), { ...base(a), med: `${f2(a.w)} × ${f2(a.h)} · antepecho ${f2(a.s || 0)}` }, { group: G.fach, opt: {} });
  /* pisos */
  if (p.pisos) for (const l of MM.LOSAS) { if (l.tablon) { /* deck de tablones de 19, ininterrumpidos y transversales a la casa (corren de sur a norte) */
      const T = tablones(geo, A, { poly: l.poly, huecos: [], z: l.z, ancho: l.tablon, junta: .5, esp: l.e, entero: true, seed: l.id.charCodeAt(4) });
      T.forEach((g, i) => Pt(`${l.id}${'abc'[i]}`, `${l.id} · ${l.nombre}`, 'tabla' + (i + 1), g, { ...base(l), sec: `tablones de ${l.tablon}, enteros y transversales`, med: `a +${f2(l.z)} · ${f1(l.e)} cm de espesor` }, { group: G.piso, opt: {} })); continue; }
    Pt(l.id, `${l.id} · ${l.nombre}`, 'deck', A.losa(l.poly, l.huecos, l.z - l.e, l.z), { ...base(l), med: `a +${f2(l.z)} · ${f1(l.e)} cm de espesor` }, { group: G.piso, opt: {} }); }
  /* estructura */
  for (const s of MM.ESTRUCTURA) {
    if (SACA.has(s.id)) continue;
    if (s.tipo === 'columna') Pt(s.id, `${s.id} · ${s.nombre}`, s.cat === 'falsa' ? 'falsa' : 'poste', A.columnaGeo(s), { ...base(s), sec: s.sec, med: `de ${s.z[0] < 0 ? '−' : '+'}${f2(Math.abs(s.z[0]))} a ${s.z[1] < 0 ? '−' : '+'}${f2(Math.abs(s.z[1]))}` }, { group: G.est, opt: {} });
    else if (s.tipo === 'viga') { const L = Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]); Pt(s.id, `${s.id} · ${s.nombre}`, 'viga', A.vigaGeo(s), { ...base(s), sec: s.sec, med: `${f2(L)} de largo · cara de arriba a +${f2(s.z)}` }, { group: G.est, opt: {} }); } }
  /* desnivel del módulo 2 (pozo de dos alzadas) con su sillón en C: interpretación de la descripción de Maxi (D-12) */
  { const D = MM.DES, [x0, x1] = D.x, [y0, y1] = D.y, zf = D.z, t = MM.TABLA, xc = D.xc, R = D.R, fn = '<b>Interpretación (D-12).</b> ';
    /* tabicas que cierran el pozo, siguiendo su contorno; al norte, bajo la viga perimetral */
    if (p.pisos) Pt('DS-01', 'DS-01 · Tabicas del desnivel', 'madera', [box(x0 - t, x0, zf - t, -t, y0, y1), box(x0 - t, xc, zf - t, -t, y0 - t, y0), box(x0 - t, xc, zf - t, -t, y1, y1 + t),
        box(xc, xc + t, zf - t, -t, y0 - t, y0 + R - t), box(xc, xc + t, zf - t, -t, y1 - R + t, y1 + t), box(xc, x1, zf - t, -t, y0 + R - t, y0 + R), box(xc, x1, zf - t, -t, y1 - R, y1 - R + t), box(x1, x1 + t, zf - t, MM.RES - MM.VP.h, y0 + R, y1 - R)],
      { fn: fn + 'Tablas que cierran los costados del desnivel.', sec: 'tabla', med: `baja ${f2(-zf)}`, u: 'D-12' }, { group: G.piso, opt: {} });
    /* escalones: uno intermedio de cada lado, en el tramo de 1,50 que dejan libres los brazos del sillón; arrancan en la línea del asiento, no en la del respaldo */
    Pt('ES-01', 'ES-01 · Escalón este del desnivel', 'madera', box(xc, x1, zf, zf + MM.ALZ, y1 - R - D.pedada, y1 - R), { fn: fn + 'Maxi 14/11: el escalón arranca junto con el asiento del sillón. Dos alzadas de 0,17: del piso al escalón y del escalón al piso del desnivel.', sec: `pedada ${D.pedada}`, med: `${f2(x1 - xc)} de ancho`, u: 'D-12' }, { group: G.piso, opt: {} });
    Pt('ES-02', 'ES-02 · Escalón oeste del desnivel', 'madera', box(xc, x1, zf, zf + MM.ALZ, y0 + R, y0 + R + D.pedada), { fn: fn + 'Espejo del ES-01.', sec: `pedada ${D.pedada}`, med: `${f2(x1 - xc)} de ancho`, u: 'D-12' }, { group: G.piso, opt: {} });
    if (p.sillon) { const v = D.vuelo, r = D.resp - v, a = D.asiento, zr = zf + D.hResp, zc = zr - D.eRep, za = zf + D.hAs;
      /* respaldo: cajón de madera; del asiento para arriba, la cara donde uno se apoya va inclinada 20° de la vertical (abajo llega a R del borde del pozo; arriba, a r).
         Repisa de 40: tapa que vuela 6 cm hacia afuera, sobre el piso alto. Lomo al sur, brazos al este y al oeste hasta 1,50 del ventanal norte */
      const cu = (q, tp) => box8([...q.map(([x, y]) => [x, za, y]), ...tp.map(([x, y]) => [x, zc, y])]);
      const resp = [box(x0, x0 + R, zf, za, y0, y1), box(x0, xc, zf, za, y0, y0 + R), box(x0, xc, zf, za, y1 - R, y1),
        cu([[x0, y0], [x0 + R, y0], [x0 + R, y1], [x0, y1]], [[x0, y0], [x0 + r, y0], [x0 + r, y1], [x0, y1]]),
        cu([[x0, y0], [xc, y0], [xc, y0 + R], [x0, y0 + R]], [[x0, y0], [xc, y0], [xc, y0 + r], [x0, y0 + r]]),
        cu([[x0, y1 - R], [xc, y1 - R], [xc, y1], [x0, y1]], [[x0, y1 - r], [xc, y1 - r], [xc, y1], [x0, y1]])];
      Pt('SC-01', 'SC-01 · Sillón en C: respaldo', 'madera', resp,
        { fn: fn + 'Maxi 14/11: respaldo de madera inclinado unos 20° de la vertical; los dos brazos (este y oeste) se interrumpen a 1,50 del ventanal norte.', sec: `respaldo a ${D.ang}°`, med: `de ${f2(D.hAs)} a ${f2(D.hResp)} del piso del desnivel`, u: 'D-12' }, { group: G.piso, opt: {} });
      Pt('SC-03', 'SC-03 · Sillón en C: repisa del respaldo', 'madera', [box(x0 - v, x0 + r, zc, zr, y0 - v, y1 + v), box(x0 + r, xc, zc, zr, y0 - v, y0 + r), box(x0 + r, xc, zc, zr, y1 - r, y1 + v)],
        { fn: fn + 'Maxi 14/11: el respaldo termina en una repisa de 0,40 de ancho que sobresale 6 cm hacia afuera, volando sobre el piso alto de la casa. Altura y espesor supuestos.', sec: `repisa de ${D.resp} · vuela ${v}`, med: `a ${f2(D.hResp)} del piso del desnivel (+${f2(zr)})`, u: 'D-12' }, { group: G.piso, opt: {} });
      Pt('SC-02', 'SC-02 · Sillón en C: asientos', 'tela', [box(x0 + R, x0 + R + a, zf, za, y0 + R, y1 - R), box(x0 + R + a, xc, zf, za, y0 + R, y0 + R + a), box(x0 + R + a, xc, zf, za, y1 - R - a, y1 - R)],
        { fn: fn + 'Maxi 14/11: asiento a 0,35 del piso del desnivel. Fondo de 0,60 supuesto.', sec: `fondo ${a}`, med: `asiento a ${f2(D.hAs)} del piso del desnivel (+${f2(za)})`, u: 'D-12' }, { group: G.piso, opt: {} }); } }
  /* escalones de la plataforma norte: macizos (cajones), a todo lo largo de cada borde. La plataforma está a media altura: nAlz alzadas para subir al deck y nAlz para bajar al terreno */
  if (p.pisos) { const P = MM.PLA, [x0, x1] = P.x, [y0, y1] = P.y, g = P.pedada, r = P.alz, n = P.nAlz - 1, u = 'D-13', K = [...Array(n)].map((_, i) => i);
    Pt('EP-01', 'EP-01 · Escalones del deck a la plataforma', 'madera', K.map(i => box(x0 + i * g, x0 + (i + 1) * g, P.z, -(i + 1) * r, y0, y1)),
      { fn: `Maxi 14/11: todo el borde compartido entre el deck y la plataforma es escalones. ${P.nAlz} alzadas de ${f1(r)} cm; pedada de 0,28 supuesta.`, sec: `pedada ${g} · alzada ${f1(r)}`, med: `${f2(y1 - y0)} de largo`, u }, { group: G.piso, opt: {} });
    const zk = k => P.z - k * r;
    Pt('EP-02', 'EP-02 · Escalones de la plataforma al terreno, norte', 'madera', K.map(i => box(x1 + i * g, x1 + (i + 1) * g, MM.TERR, zk(i + 1), y0, y1 + (i + 1) * g)),
      { fn: `Maxi 14/11: escalones hacia el norte para bajar al terreno: ${n} escalones, ${P.nAlz} alzadas de ${f1(r)} cm.`, sec: `pedada ${g} · alzada ${f1(r)}`, med: `${f2(y1 - y0)} de largo`, u }, { group: G.piso, opt: {} });
    Pt('EP-03', 'EP-03 · Escalones de la plataforma al terreno, este', 'madera', K.map(i => box(x0, x1 + i * g, MM.TERR, zk(i + 1), y1 + i * g, y1 + (i + 1) * g)),   /* cada escalón del este llega hasta el del norte del mismo nivel: la esquina cierra en L */
      { fn: `Maxi 14/11: escalones hacia el este para bajar al terreno. Alzadas de ${f1(r)} cm.`, sec: `pedada ${g} · alzada ${f1(r)}`, med: `${f2(x1 - x0)} de largo`, u }, { group: G.piso, opt: {} }); }
  /* ---------- hipótesis: casa elevada ---------- */
  if (p.altura === 'alta') Pt('H1-01', 'H1-01 · Piso de la planta baja (hipótesis)', 'piso', A.losa([[-7.5, MM.CYO], [557.5, MM.CYO], [557.5, MM.CYE], [-7.5, MM.CYE]], null, MM.TERR, MM.TERR + 8),
    { fn: '<b>Hipótesis «casa elevada».</b> Con el piso de la casa a 2,90 quedan 2,60 libres bajo la viga: la planta al nivel del terreno se puede habitar. Dibujé sólo un piso; no hay cerramientos (D-15).', sec: 'piso sobre el terreno', med: `2,60 libres`, u: 'D-15' }, { group: 'Hipótesis', opt: {} });
  /* ---------- hipótesis: segundo piso, planta A ---------- */
  if (H2) { const Z2 = 310, ZT = 570, e2 = 7, XE = -200, xs = MM.XS, xn = MM.XN, gs = MM.GS, gn = MM.GN, ye = MM.YE, gal = 115, INC = 30, dI = (ZT - Z2) * Math.tan(INC * Math.PI / 180), xT = gn - dI, GH = 'Hipótesis', fn = '<b>Hipótesis «segundo piso, planta A» (D-14).</b> ', u = 'D-14';
    const H = (id, nombre, cat, geos, txt, med = '', opt = {}) => Pt(id, `${id} · ${nombre}`, cat, geos, { fn: fn + txt, sec: 'proyecto', med, u }, { group: GH, opt });
    const L = (x0, x1, y0, y1, z = Z2, e = e2) => A.losa([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], null, z - e, z);
    /* frente norte del piso alto: inclinado 30° hacia el sur (Maxi 14/11). xi(z) = dónde está el plano inclinado a cada altura */
    const xi = z => gn - (z - Z2) * Math.tan(INC * Math.PI / 180);
    const inc = (y0, y1, e, za = Z2, zb = ZT) => box8([[xi(za) - e, za, y0], [xi(za) + e, za, y0], [xi(za) + e, za, y1], [xi(za) - e, za, y1], [xi(zb) - e, zb, y0], [xi(zb) + e, zb, y0], [xi(zb) + e, zb, y1], [xi(zb) - e, zb, y1]]);
    const trap = (y, xa, z0 = Z2, z1 = ZT, e = 3) => box8([[xa, z0, y - e], [xi(z0), z0, y - e], [xi(z0), z0, y + e], [xa, z0, y + e], [xa, z1, y - e], [xi(z1), z1, y - e], [xi(z1), z1, y + e], [xa, z1, y + e]]);
    /* entrepiso: oficina (módulo 1), galería al sur del vacío (módulo 2), dormitorio (módulo 3), baño y descanso en el ensanche */
    H('H2-01', 'Entrepiso: oficina, galería, dormitorio, baño', 'deck', [L(xs, xn, 2000, ye), L(xs, gal, 1600, 2000), L(xs, xn, 1200, 1600), L(XE, xs, 1204, 1460), L(XE, xs, 1900, 2000)],
      'Piso alto a +3,10 sobre los módulos 1 y 3; el módulo 2 queda en doble altura, con una galería de 1,10 al sur que une la oficina con el dormitorio.', `piso alto a +${f2(Z2)}`);
    H('H2-02', 'Terraza sobre los módulos 5 y 6', 'tabla2', L(xs, xn, MM.YO, 800), 'Maxi 14/11: la terraza va sobre los últimos dos módulos, el 5 y el 6 (con el metro del voladizo). El módulo 4 conserva su techo de chapa.', '9,00 × 5,40');
    H('H2-14', 'Pasarela del dormitorio a la terraza', 'tabla2', L(xs, 105, 800, 1200, Z2 + 10, 5), 'Entre el dormitorio (módulo 3) y la terraza (módulos 5 y 6) queda el techo del módulo 4: lo crucé con una pasarela de 1,00 por el lado sur, donde la chapa está más baja; queda 10 cm sobre el piso alto. Es una solución mía: falta definir qué pasa sobre el módulo 4.', '4,00 × 1,00');
    H('H2-03', 'Piso del ensanche sur (planta baja)', 'deck', L(XE, 7.5, 1212, 2000, 0, 2.5), 'Ensanche de 2,00 al sur en los módulos 2 y 3: lleva la escalera y le da aire a la planta baja. La viga perimetral del piso queda como un umbral de 3 cm.', '7,90 × 2,00');
    /* escalera recta en el ensanche, contra la pared sur: sube de oeste a este y llega al descanso junto a la galería */
    { const E = A.escaleraGeos({ x: [XE + 6, XE + 106], y: [1468, 1900], z: [0, Z2], n: 17 }); H('H2-04', 'Escalera (17 alzadas de 18,2)', 'madera', [...E.ped, ...E.zan], 'Escalera recta de 1,00 de ancho en el ensanche, contra la pared sur. Una sola escalera para oficina y dormitorio.', 'pedada 27'); }
    /* postes: los del ensanche bajan al terreno; arriba, las columnas siguen hasta el techo nuevo */
    H('H2-05', 'Columnas del piso alto y del ensanche', 'poste', [...[1200, 1600, 2000].map(y => box(XE - 15, XE, MM.TERR, ZT, y - 7.5, y + 7.5)), ...[1200, 1600, 2000, 2400].map(y => box(542.5, 557.5, MM.ZA, Z2, y - 7.5, y + 7.5)), ...[1200, 1600, 2000, 2400].map(y => inc(y - 7.5, y + 7.5, 7.5)), ...[2000, 2400].map(y => box(-7.5, 7.5, MM.ZA, ZT, y - 7.5, y + 7.5))],
      'Las columnas del sur siguen hasta el techo nuevo; las del norte, arriba, se inclinan 30° con el frente vidriado. El ensanche lleva tres columnas propias hasta el terreno.');
    /* cerramientos de madera */
    const mx = (x, y0, y1, z0, z1) => box(x - 3, x + 3, z0, z1, y0, y1), my = (y, x0, x1, z0, z1) => box(x0, x1, z0, z1, y - 3, y + 3);
    H('H2-06', 'Paredes de madera', 'muro', [trap(2400, gs), mx(gs, 2000, 2400, Z2, ZT), my(2000, XE, gs - 3, MM.Z0, ZT), mx(XE + 3, 1204, 1700, MM.Z0, ZT), mx(XE + 3, 1900, 2000, MM.Z0, ZT), mx(XE + 3, 1700, 1900, MM.Z0, 100),
        my(1200, XE, gs - 3, Z2, ZT), my(1200, XE, -110, MM.Z0, Z2 - e2), trap(1600, gal), my(1460, XE + 6, gs - 3, Z2, ZT), mx(gs, 1300, 1460, Z2, ZT), my(1200, -110, gs - 3, 215, Z2 - e2), mx(gs, 1460, 1600, Z2, ZT)],
      'Cabecera este, sur de la oficina, ensanche (con un paño de vidrio junto a la escalera) y baño. La pared entre el dormitorio y el vacío es ciega; se entra desde la galería.');
    /* vidrio repartido: 2 paños de ancho × 3 de alto por semimódulo (Maxi 14/11), de 1,00 × 1,00 sobre el plano inclinado */
    { const zr = [1, 2].map(k => Z2 + (ZT - Z2) * k / 3), ys = [...Array(11)].map((_, i) => 1300 + i * 100).filter(y => y % 400 !== 0);
      H('H2-12', 'Carpintería del frente norte inclinado', 'marco', [...ys.map(y => inc(y - 2.5, y + 2.5, 3)), ...[Z2 + 3, ...zr, ZT - 3].map(z => box(xi(z) - 3, xi(z) + 3, z - 3, z + 3, 1200, 2400)), box(gn - 3, gn + 3, MM.ZA, Z2, 1600, 2000)],
        'Maxi 14/11: las ventanas del segundo piso no van a plomo: se inclinan unos 30° hacia el sur, con vidrio repartido en paños de alrededor de 1,00, repartido de 2 paños de ancho por 3 de alto en cada semimódulo: quedan de 1,00 × 1,00 sobre el plano inclinado.', `inclinado ${INC}° · paños de 1,00 × ${f2(Math.hypot(dI, ZT - Z2) / 3)}`);
      const xsO = [...Array(5)].map((_, i) => gs + 100 + i * ((gn - gs) / 5.4)).filter(x => x < gn - 20), zTop = x => Math.min(ZT, Z2 + (gn - x) / Math.tan(INC * Math.PI / 180));
      H('H2-13', 'Carpintería del dormitorio a la terraza', 'marco', [...xsO.map(x => box(x - 2.5, x + 2.5, Z2, zTop(x), 1197, 1203)), ...zr.map(z => box(gs, xi(z), z - 2.5, z + 2.5, 1197, 1203))], 'Mismo vidrio repartido, a plomo, en el frente del dormitorio hacia la terraza.', 'paños de ~1,00');
      if (p.carp) H('H2-07', 'Vidrios', 'glass', [inc(1200, 2400, 1), trap(1200, gs, Z2, ZT - 3, 1), mx(XE + 3, 1700, 1900, 100, ZT - 3), my(1200, -110, gs - 3, MM.Z0, 215)],
        'Frente norte inclinado del piso alto (en el módulo 2 cierra la doble altura), frente del dormitorio a la terraza, paño del ensanche junto a la escalera y la puerta de atrás, que pasa al costado oeste del ensanche.', '', { noEdges: false }); }
    /* oficina sobre el vacío: balcón con baranda y paneles corredizos tipo japonés (dos de cuatro, a medio abrir) */
    H('H2-08', 'Balcón de la oficina: baranda', 'madera', A.barandaGeos({ pts: [[gal, 2000], [xi(Z2 + 100) - 4, 2000]], z: Z2, h: 100 }), 'La oficina balconea sobre la doble altura.', 'baranda de 1,00', { noEdges: true });
    H('H2-09', 'Paneles corredizos tipo japonés', 'shoji', [my(2006, gal, gal + 107, Z2, ZT - 6), my(2012, gal + 60, gal + 167, Z2, ZT - 6)], 'Cuatro paneles corredizos para cerrar la oficina cuando hace falta privacidad; dibujé dos, a medio abrir.', '4 × 1,07', { op: .7 });
    H('H2-10', 'Barandas de la galería y de la terraza', 'madera', [...A.barandaGeos({ pts: [[gal, 1600], [gal, 2000]], z: Z2, h: 100 }), ...A.barandaGeos({ pts: [[gs, 1600], [gs, 1900]], z: Z2, h: 100 }), ...A.barandaGeos({ pts: [[105, 800], [xn, 800], [xn, MM.YO], [xs, MM.YO], [xs, 800]], z: Z2, h: 100 }), ...A.barandaGeos({ pts: [[105, 800], [105, 1200]], z: Z2 + 10, h: 100 }), ...A.barandaGeos({ pts: [[xs, 800], [xs, 1200]], z: Z2 + 10, h: 100 })], 'Baranda de 1,00 hacia el vacío, en la terraza y a los dos lados de la pasarela.', '', { noEdges: true });
    /* techo nuevo: chapa a un agua con la misma lógica, alta al norte, sobre los módulos 1 a 3 y el ensanche */
    if (p.techos) { const X0 = XE - 50, X1 = xT + 35, zt = x => ZT + 6 + 30 * (x - XE) / (xT - XE);   /* arranca en la cabeza del frente inclinado; 0,30 de caída, baja al sur */
      H('H2-11', 'Techo del piso alto (zincalum)', 'techo', A.techoGeo({ poly: [[X0, 1165], [X1, 1165], [X1, MM.CYE + 35], [MM.CXS - 35, MM.CYE + 35], [MM.CXS - 35, 2035], [X0, 2035]], baja: '-x', z: [zt(X1), zt(X0)], e: 1 }), 'Chapa acanalada a un agua, alta al norte, sobre los módulos 1 a 3 y el ensanche; arranca en la cabeza del frente inclinado, así que el techo es más angosto que la planta. Altura interior de 2,60 (Maxi). Sin cielorraso ni estructura dibujados.', '', { noEdges: true }); } }
  /* tirantes: una pieza por conjunto */
  if (p.tirantes) for (const t of MM.TIRANTES) { const { b, h } = t.S, geos = [];
    const tramos = H2 && t.id === 'TC-01' ? t.tramos.filter(([a0, a1]) => a1 < 1600 || a0 > 2000) : t.tramos;   /* doble altura en el módulo 2 */
    for (const q of t.pos) for (const [a0, a1] of tramos) geos.push(t.dir === 'x' ? box(a0, a1, t.zt - h, t.zt, q - b / 2, q + b / 2) : box(q - b / 2, q + b / 2, t.zt - h, t.zt, a0, a1));
    Pt(t.id, `${t.id} · ${t.nombre} (${geos.length})`, 'madera', geos, { ...base(t), sec: `${b}×${h}`, med: `${geos.length} piezas · cara de arriba a ${t.zt < 0 ? '−' : '+'}${f2(Math.abs(t.zt))}` }, { group: G.est, opt: { dedupeAll: true } }); }
  /* cielorraso y chapa */
  for (const t of MM.TECHOS) { const esCielo = t.mat === 'cielorraso'; if (esCielo ? !p.cielo : !p.techos) continue;
    const xs = t.poly.map(q => q[0]), ys = t.poly.map(q => q[1]), X0 = Math.min(...xs), X1 = Math.max(...xs), Y0 = Math.min(...ys), Y1 = Math.max(...ys), rc = (y0, y1) => [[X0, y0], [X1, y0], [X1, y1], [X0, y1]];
    /* con el segundo piso: el cielorraso se abre en el módulo 2 (doble altura) y la chapa de hoy queda sólo sobre el módulo 4 (la terraza va sobre el 5 y el 6) */
    const polys = !H2 ? [t.poly] : esCielo ? [rc(Y0, 1600 - 3.5), rc(2000 + 3.5, Y1)] : [rc(800, 1200)];
    Pt(t.id, `${t.id} · ${t.nombre}`, esCielo ? 'cielo' : 'techo', polys.map(q => A.techoGeo({ ...t, poly: q })), { ...base(t), med: esCielo ? `cara de abajo a +${f2(MM.HC)}` : `${t.pend} · de +${f2(t.z[0])} (norte) a +${f2(t.z[1])} (sur)` }, { group: G.techo, opt: { noEdges: !esCielo } }); }
  /* cenefa: cierra la cámara entre el cielorraso y la chapa (frente norte y los dos costados en cuña) */
  if (p.techos) { const xs = MM.CXS, xn = MM.CXN, yo = H2 ? 800 : MM.CYO, ye = H2 ? 1200 : MM.CYE, z0 = MM.ZA, zs = MM.zR(xs), zn = MM.zR(xn), e = 2.5;
    const cuna = (ya, yb) => box8([[xs, z0, ya], [xn, z0, ya], [xn, z0, yb], [xs, z0, yb], [xs, zs + .1, ya], [xn, zn, ya], [xn, zn, yb], [xs, zs + .1, yb]]);
    /* frente norte, dos costados en cuña y el fondo de la franja que sobresale de la viga de arriba, al norte y al sur (al sur, en cuña bajo la chapa) */
    const fs = (ya, yb) => box8([[xs, z0, ya], [MM.XS, z0, ya], [MM.XS, z0, yb], [xs, z0, yb], [xs, zs + .1, ya], [MM.XS, MM.zR(MM.XS), ya], [MM.XS, MM.zR(MM.XS), yb], [xs, zs + .1, yb]]);
    const geos = [box(xn - e, xn, z0, zn, yo, ye), cuna(yo, yo + e), cuna(ye - e, ye), box(MM.XN, xn - e, z0, z0 + e, yo + e, ye - e), fs(yo + e, ye - e)];
    Pt('CE-01', 'CE-01 · Panel de la cámara del techo', 'madera', geos,
      { fn: 'Maxi 14/11: el panel que cierra la cámara sobresale hasta quedar coplanar con la cara de afuera de las columnas; desde ahí la chapa vuela 0,35. Mide 0,50 en el frente norte y se cierra en cuña hacia el sur. En el este y el oeste lo puse a plomo con la punta de la viga del piso (D-11).', sec: 'tabla', med: `de +${f2(z0)} a +${f2(zn)} en el norte`, u: 'D-11' }, { group: G.techo, opt: {} }); }

  /* ediciones guardadas (borrar, mover, estirar) */
  { const bid = id => id.replace(/[a-z]$/, ''); for (let i = parts.length - 1; i >= 0; i--) { const pp = parts[i], b = bid(pp.id); const e = ED.E[b] || ED.E[pp.id]; if (!e) continue; const datos = ED.enDatos(b);
      if (!datos && e.borrado) { parts.splice(i, 1); continue; } if (!datos && e.mov) { const { x = 0, y = 0, z = 0 } = e.mov; pp.geos = pp.geos.map(g => { const c = g.clone(); c.translate(x, z, y); return c; }); } } }

  const dudas = `<h3>Dudas (${MM.DUDAS.length})</h3><ul>${MM.DUDAS.map(d => `<li><b>${d.id}</b> · ${d.q}</li>`).join('')}</ul>`;
  const panes = { video3d: videoHTML(), materiales: dudas, ayuda: `<h3>Qué es esto</h3><p>Mocoretá, la casa de Maxi en Ingeniero Maschwitz, modelada a partir de su descripción verbal del 14/11/2026. Primera etapa: el esqueleto (pilotes, columnas, vigas perimetrales y transversales), la envolvente (ventanales, paños de madera, puertas corredizas), los decks y el techo.</p>
    <p>Lo que Maxi dijo figura como <b>estimado</b>; lo que no dijo está marcado <b>supuesto</b> y preguntado en las dudas (D-01 a D-11).</p>
    <h3>Ejes</h3><p>x de sur a norte (0 en la fila sur de columnas), y de oeste a este (0 en el par de columnas del oeste; el voladizo va de −1,00 a 0). Los módulos se numeran de este a oeste, del 1 al 6. Alturas sobre el piso interior; el terreno está 1,47 abajo.</p>
    <h3>Cómo usarlo</h3><ul><li>Tocá una pieza: te muestra qué es, sus medidas y de dónde salió.</li><li>Las dos puertas corredizas se abren <b>arrastrándolas</b> (o con el deslizador «Abrir» de su ficha).</li><li>Las <b>hipótesis de proyecto</b> (segundo piso, casa elevada) están en el botón <b>Variantes de diseño</b> de la barra de herramientas; también aparecen al tocar el techo o una columna.</li><li>En <b>Ver</b> apagás techo, cielorraso, pisos, vidrios o tirantes para ver la estructura.</li><li><b>Teclado</b>: W/S avanzar y retroceder, A/D de costado, Q/E bajar y subir, flechas para girar.</li></ul>` + dudas };
  const spec = `<span>v<b>${MM.META.version}</b> · ${MM.META.fecha}</span><span>${parts.length} piezas</span><span>casa <b>25,00 × 5,50</b></span><span>deck norte <b>4,00</b></span><span>${MM.DUDAS.length} dudas</span><span>cotas en m</span>`;
  const cx = 300, cy = 1150;
  return { parts, panes, spec, joints: [], steps: [],
    selExtra: pp => (CORR ? CORR.html(pp.id) : '') + `<div class="renrow"><button class="btn" data-hide="${pp.id}">Ocultar pieza</button><button class="btn" data-showall>Mostrar todo</button></div>` + N.editorHTML(pp.id),
    selIntro: '<div class="k">Selección</div><h2>Tocá una pieza</h2><p style="margin:0;color:var(--muted);font-size:13px">O un código en cualquier texto.</p>',
    defaultView: 'iso',
    views: { iso: { label: 'Iso (desde el NE)', p: [cx + 2300, 1200, cy + 2300], t: [cx + 200, 60, cy] }, norte: { label: 'Frente norte', p: [3300, 250, cy], t: [550, 100, cy] }, sur: { label: 'Contrafrente sur', p: [-2900, 250, cy], t: [0, 100, cy] },
      este: { label: 'Desde el este', p: [cx, 200, 4300], t: [cx, 100, 2400] }, oeste: { label: 'Desde el oeste', p: [cx, 200, -2000], t: [cx, 100, -100] }, so: { label: 'Iso (desde el SO)', p: [cx - 1900, 1000, cy - 2300], t: [cx, 60, cy] },
      deck: { label: 'En el deck norte', p: [850, 165, 2250], t: [560, 130, 1000] }, adentro: { label: 'Adentro (desde el este)', p: [275, 165, 2330], t: [275, 140, 600] },
      planta: { label: 'Planta', p: [cx, 4200, cy + .1], t: [cx, 0, cy] } },
    dims: ({ dimLine }) => { const zt = MM.TERR + 2; dimLine([-80, zt, 0], [-80, zt, MM.LARGO], [-8, 0, 0], '24,00'); dimLine([-80, zt, -MM.VOL], [-80, zt, 0], [-8, 0, 0], '1,00');
      dimLine([0, zt, MM.LARGO + 120], [MM.ANCHO, zt, MM.LARGO + 120], [0, 0, 8], '5,50'); dimLine([MM.ANCHO, zt, MM.LARGO + 120], [MM.ANCHO + MM.DECKN, zt, MM.LARGO + 120], [0, 0, 8], '4,00');
      dimLine([-40, MM.TERR, MM.LARGO + 60], [-40, 0, MM.LARGO + 60], [-8, 0, 0], f2(-MM.TERR)); dimLine([-40, 0, MM.LARGO + 60], [-40, MM.HC, MM.LARGO + 60], [-8, 0, 0], f2(MM.HC)); } };
}

const COL = { muro: '#b98a5a', glass: '#9fc4cf', puerta: '#3a3a3a', marco: '#8a5a34', deck: '#b58e62', madera: '#c9a46e', viga: '#8a5a34', poste: '#6e4a2e', falsa: '#8a5a34', techo: '#c9cfd3', tabla1: '#b58e62', tabla2: '#ad8558', tabla3: '#bd976c', hierro: '#6f4630', piso: '#b9b4a8', shoji: '#f3ecdc', tela: '#cdbfa6', cielo: '#d9c3a0' };
/* el terreno es el suelo del visor (pasto), 1,47 abajo del piso interior (TE-01 en modelo.js) */
window.__terreno = { t: M.TERR, c: 0 };   /* build() lo actualiza según la altura elegida */
/* encastre declarado: la viga de arriba (7, centrada en el vidrio) entra 2,5 cm en la cara interior de las columnas, que van por fuera (D-02) */
window.__encastres = [['C-', 'VA-']];
const root = document.getElementById('modo-3d');
const visor = createVisor({ model: { params, build }, colors: COL, lift: { techo: 300 }, root, radial: 0, far: 60000 });
{ const l = new THREE.DirectionalLight(0xfff6ec, .45); l.position.set(300, -1000, 500); visor.scene.add(l); }

/* cortes y vistas: del motor (motor/vistas.js), iguales en todas las casas */
const VI = initVistas(visor, { M, root, pref: 'mocoreta', rango: { x: [-500, 1600], y: [-400, 2700], z: [-320, 700] }, params: ['techos', 'cielo', 'tirantes', 'pisos', 'carp', 'sillon', 'altura', 'piso2'], dirAmb: [.55, .85] });
const applyClips = () => VI.applyClips(), renderVistas = () => VI.renderVistas();
root.addEventListener('click', e => { const h = e.target.closest('[data-hide]'); if (h) { visor.toggleHidden(h.dataset.hide, true); visor.resetSel(); renderVistas(); return; } if (e.target.closest('[data-showall]')) visor.setHidden([]); });

/* nombres propios y ediciones: al cambiar, se reconstruye */
N.bindEditor(root, () => {}); N.onChange(() => { visor.rebuild(); applyClips(); }); ED.onChange(() => { visor.rebuild(); applyClips(); });

/* teclado (WASD, flechas) y «caminar hasta acá» (W): motor/caminar.js, lo prende la barra de herramientas */

const stage = document.querySelector('#modo-3d .stage');
/* hipótesis de proyecto como zonas con variantes: aparecen en el botón «Variantes de diseño» de la barra y, al tocar una pieza de la zona, junto a ella */
const optsDe = id => Object.fromEntries(params.find(q => q.id === id).options);
const ZONAS = [
  { id: 'piso2', nombre: 'Segundo piso', piezas: /^(H2-\d+|T-0[12]|CE-01|VA-[NSEO]|VT-\d)$/, params: ['piso2'], label: optsDe('piso2'), vista: { p: [2300, 800, 3100], t: [350, 280, 1600] } },
  { id: 'altura', nombre: 'Altura de la casa', piezas: /^(C-\d[SN]|H1-01|VP-[NSEO])$/, params: ['altura'], label: optsDe('altura'), vista: { p: [2500, 900, 3300], t: [400, 0, 1400] } },
];
try { initMarcas(visor, stage); } catch (e) { console.error('marcas', e); }
try { initRealismo(visor, { piedra: [], ladrillo: [], blanco: [], cats: { techo: ['zincalum', 76], muro: ['madera', 120], deck: ['madera', 120], madera: ['madera', 120], viga: ['madera', 120], poste: ['madera', 120], falsa: ['madera', 120], cielo: ['madera', 120] } }); } catch (e) { console.error('realismo', e); }
try { initLuz(visor); } catch (e) { console.error('luz', e); }
try { initCalidad(visor); } catch (e) { console.error('calidad', e); }
try { initPersonas(visor); } catch (e) { console.error('personas', e); }
try { initEquipamiento(visor, stage, { datos: equipMocoreta, piso: 0 }); } catch (e) { console.error('equipamiento', e); }
/* sol: Ingeniero Maschwitz (34°23′ S, 58°44′ O); x apunta al norte tal como lo describió Maxi (sin desvío medido) */
try { initNoche(visor, { lugar: 'Ingeniero Maschwitz', lat: -34.38, lon: -58.74, tz: -3, norte: 0, inicioDia: true, max: 32 }); } catch (e) { console.error('noche', e); }
/* cámara: se recuerda en este navegador */
{ try { const v = JSON.parse(localStorage.getItem('mocoreta-cam') || 'null'); if (v && v.p && v.t) { visor.camera.position.set(...v.p); visor.controls.target.set(...v.t); visor.controls.update(); } } catch (e) {}
  let last = ''; setInterval(() => { const v = visor.getView(); const k = JSON.stringify(v); if (k !== last) { last = k; try { localStorage.setItem('mocoreta-cam', k); } catch (e) {} } }, 1000); }
try { initTours(visor, { tours: TOURS_MOCORETA, escaleras: ESCALERAS_MOCORETA }); } catch (e) { console.error('tours', e); }
/* térmica: una zona (todo el interior, sin dividir todavía); el clima por defecto del motor es el de Ingeniero Maschwitz; piso elevado, no apoya en el terreno */
try { initTermica(visor, M, { zonas: l => l.id === 'L-01', piso: () => 0, terreno: () => false, liviano: () => true }); } catch (e) { console.error('termica', e); }
try { initEditor(visor, stage, {}, 0); } catch (e) { console.error('editor', e); }
try { initSenalar(visor, stage); } catch (e) { console.error('senalar', e); }
try { initMedir(visor, stage); } catch (e) { console.error('medir', e); }
{ let vu = null; try { vu = initVistasUI(); } catch (e) { console.error('vistas', e); }
  try { initToolbar(stage, visor, { vistas: vu, zonas: ZONAS }); } catch (e) { console.error('toolbar', e); } }
try { CORR = initCorredizas(visor, HOJAS, 'mocoreta'); visor.controlPieza = id => CORR.html(id); window.__corredizas = CORR; } catch (e) { console.error('corredizas', e); }
try { initViewCube(visor); } catch (e) { console.error('viewcube', e); }
try { initInspector(visor); } catch (e) { console.error('inspector', e); }
try { initSidebar(visor); } catch (e) { console.error('sidebar', e); }
window.__ok3d = true;
