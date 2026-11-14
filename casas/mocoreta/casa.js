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

const f2 = cm => (cm / 100).toFixed(2).replace('.', ',');
const f1 = v => (+v).toFixed(1).replace('.', ',');
const NIV = Object.fromEntries(Object.entries(M.NIVELES).map(([k, v]) => [k, v.nombre]));
const { box, box8 } = geo;

const params = [
  { id: 'puertaN', label: 'Entrada (norte) abierta', type: 'check', value: false, quick: true, group: 'Puertas', help: 'Corrediza de hierro de la entrada: corre por dentro, hacia el este.' },
  { id: 'puertaS', label: 'Puerta de atrás (sur) abierta', type: 'check', value: false, quick: true, group: 'Puertas', help: 'Corrediza de hierro del sur: cuelga por fuera de un riel y corre hacia el oeste.' },
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
  const MM = M, parts = [];
  const Pt = (id, name, cat, geos, info, ex = {}) => { const al = N.alias(id); geos = [].concat(geos).filter(Boolean); if (!geos.length) return;
    parts.push({ id, name: al ? `${id} · ${al}` : name, alias: al, cat, geos, info: { ...info, fn: (N.nota(id) ? `<b>Tu nota:</b> ${N.nota(id)}<br>` : '') + (info.fn || '') }, ...ex }); };
  const G = { fach: 'Fachadas', est: 'Estructura', piso: 'Pisos y decks', techo: 'Techo' };
  const base = d => ({ fn: (d.conf === 'supuesto' ? '<b>Supuesto.</b> ' : '') + (d.nota || ''), sec: '', med: '', u: MM.DUDAS.filter(x => x.ref.includes(d.id)).map(x => x.id).join(' · ') });

  /* fachadas: ventanales (vidrio + marco), puertas corredizas y paños de madera con vidrio arriba */
  for (const m of MM.MUROS) { const L = Math.hypot(m.b[0] - m.a[0], m.b[1] - m.a[1]), med = `${f2(L)} × ${f2(A.zTope(MM, m, 0) - A.zBase(MM, m))}`;
    if (m.corrediza) { /* hoja corrediza de hierro: fuera del plano del vidrio (N por dentro, S colgada por fuera) y desplazada si está abierta */
      const f = m.a[0] > M.ANCHO / 2 ? 'N' : 'S', H = M.HOJA, h = H[f], ab = f === 'N' ? p.puertaN : p.puertaS, d = ab ? h.dy : 0, w = H.perfil;
      const y0 = (f === 'N' ? m.a[1] - 2.5 : m.a[1] - 5) + d, y1 = (f === 'N' ? m.b[1] + 3 : m.b[1] - .5) + d, z0 = f === 'N' ? M.Z0 + .5 : 1.5, z1 = M.ZV - .5, xa = h.x - H.e / 2, xb = h.x + H.e / 2;
      const marco = [box(xa, xb, z0, z1, y0, y0 + w), box(xa, xb, z0, z1, y1 - w, y1), box(xa, xb, z0, z0 + w, y0 + w, y1 - w), box(xa, xb, z1 - w, z1, y0 + w, y1 - w)];
      /* riel: el del sur va atornillado a la cara de afuera de la viga de arriba; el del norte, por dentro, bajo la viga, de falsa columna a falsa columna */
      const ya = y0 - d + Math.min(0, h.dy), yb = y1 - d + Math.max(0, h.dy);   /* el riel cubre la hoja cerrada y abierta, y no más: del otro lado está la columna (S) o la viga transversal (N) */
      const riel = f === 'S' ? box(M.XS - 3, M.XS, M.ZV + 1, M.ZV + 6, ya, yb) : box(xa, xb, M.ZV, M.ZV + 3, ya, yb);
      if (p.carp) Pt(m.id, `${m.id} · ${m.nombre}`, 'glass', box(h.x - .5, h.x + .5, z0 + w, z1 - w, y0 + w, y1 - w), { ...base(m), med }, { group: G.fach, opt: {} });
      Pt(m.id + 'h', `${m.id} · hoja y riel de hierro`, 'hierro', [...marco, riel], { ...base(m), med, sec: `hierro oxidado · ${ab ? 'abierta' : 'cerrada'}` }, { group: G.fach, opt: {} }); continue; }
    if (m.tipo === 'vidrio') { const g = A.vidrioGeos(MM, m);
      if (p.carp) Pt(m.id, `${m.id} · ${m.nombre}`, 'glass', g.vidrio, { ...base(m), med }, { group: G.fach, opt: {} });
      Pt(m.id + 'm', `${m.id} · marco`, 'marco', g.perfiles, { ...base(m), med, sec: 'marco' }, { group: G.fach, opt: {} }); }
    else Pt(m.id, `${m.id} · ${m.nombre}`, 'muro', A.muroGeos(MM, m), { ...base(m), med, sec: `madera, ${m.e} cm` }, { group: G.fach, opt: {} }); }
  if (p.carp) for (const a of MM.ABERTURAS) Pt(a.id, `${a.id} · ${a.nombre}`, 'glass', A.hojaGeo(MM, a, 2), { ...base(a), med: `${f2(a.w)} × ${f2(a.h)} · antepecho ${f2(a.s || 0)}` }, { group: G.fach, opt: {} });
  /* pisos */
  if (p.pisos) for (const l of MM.LOSAS) { if (l.tablon) { /* deck de tablones de 14, transversales a la casa (corren de sur a norte) */
      const T = tablones(geo, A, { poly: l.poly, huecos: [], z: l.z, ancho: l.tablon, junta: .5, esp: l.e, seed: l.id.charCodeAt(4) });
      T.forEach((g, i) => Pt(`${l.id}${'abc'[i]}`, `${l.id} · ${l.nombre}`, 'tabla' + (i + 1), g, { ...base(l), sec: `tablones de ${l.tablon}, transversales`, med: `a +${f2(l.z)} · ${f1(l.e)} cm de espesor` }, { group: G.piso, opt: {} })); continue; }
    Pt(l.id, `${l.id} · ${l.nombre}`, 'deck', A.losa(l.poly, l.huecos, l.z - l.e, l.z), { ...base(l), med: `a +${f2(l.z)} · ${f1(l.e)} cm de espesor` }, { group: G.piso, opt: {} }); }
  /* estructura */
  for (const s of MM.ESTRUCTURA) {
    if (s.tipo === 'columna') Pt(s.id, `${s.id} · ${s.nombre}`, s.cat === 'falsa' ? 'falsa' : 'poste', A.columnaGeo(s), { ...base(s), sec: s.sec, med: `de ${s.z[0] < 0 ? '−' : '+'}${f2(Math.abs(s.z[0]))} a ${s.z[1] < 0 ? '−' : '+'}${f2(Math.abs(s.z[1]))}` }, { group: G.est, opt: {} });
    else if (s.tipo === 'viga') { const L = Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]); Pt(s.id, `${s.id} · ${s.nombre}`, 'viga', A.vigaGeo(s), { ...base(s), sec: s.sec, med: `${f2(L)} de largo · cara de arriba a +${f2(s.z)}` }, { group: G.est, opt: {} }); } }
  /* desnivel del módulo 2 (pozo de dos alzadas) con su sillón en C: interpretación de la descripción de Maxi (D-12) */
  { const D = M.DES, [x0, x1] = D.x, [y0, y1] = D.y, zf = D.z, t = M.TABLA, xc = M.GN - D.corte, fn = '<b>Interpretación (D-12).</b> ';
    /* tabicas que cierran el pozo: sur, este, oeste y, al norte, bajo la viga perimetral */
    if (p.pisos) Pt('DS-01', 'DS-01 · Tabicas del desnivel', 'madera', [box(x0 - t, x0, zf - t, -t, y0, y1), box(x0 - t, x1, zf - t, -t, y0 - t, y0), box(x0 - t, x1, zf - t, -t, y1, y1 + t), box(x1, x1 + t, zf - t, M.RES - M.VP.h, y0, y1)],
      { fn: fn + 'Tablas que cierran los costados del desnivel.', sec: 'tabla', med: `baja ${f2(-zf)}`, u: 'D-12' }, { group: G.piso, opt: {} });
    /* escalones: uno intermedio de cada lado, en el tramo de 1,50 que dejan libres los brazos del sillón */
    Pt('ES-01', 'ES-01 · Escalón este del desnivel', 'madera', box(xc, x1, zf, zf + M.ALZ, y1 - D.pedada, y1), { fn: fn + 'Dos alzadas de 0,17: del piso al escalón y del escalón al piso del desnivel.', sec: `pedada ${D.pedada}`, med: `${f2(x1 - xc)} de ancho`, u: 'D-12' }, { group: G.piso, opt: {} });
    Pt('ES-02', 'ES-02 · Escalón oeste del desnivel', 'madera', box(xc, x1, zf, zf + M.ALZ, y0, y0 + D.pedada), { fn: fn + 'Espejo del ES-01.', sec: `pedada ${D.pedada}`, med: `${f2(x1 - xc)} de ancho`, u: 'D-12' }, { group: G.piso, opt: {} });
    if (p.sillon) { const r = D.resp, a = D.asiento, zr = zf + D.hResp, za = zf + D.hAs;
      /* respaldo-repisa: cajón de madera de 45 de ancho cuya tapa es la repisa. Lomo al sur, brazos al este y al oeste hasta 1,50 del ventanal norte */
      Pt('SC-01', 'SC-01 · Sillón en C: respaldo con repisa', 'madera', [box(x0, x0 + r, zf, zr, y0, y1), box(x0 + r, xc, zf, zr, y0, y0 + r), box(x0 + r, xc, zf, zr, y1 - r, y1)],
        { fn: fn + 'Maxi 14/11: sillón en C con respaldo de madera que termina en una repisa de 0,45 de ancho; los dos brazos (este y oeste) se interrumpen a 1,50 del ventanal norte.', sec: `repisa de ${r}`, med: `repisa a ${f2(D.hResp)} del piso del desnivel (+${f2(zr)})`, u: 'D-12' }, { group: G.piso, opt: {} });
      Pt('SC-02', 'SC-02 · Sillón en C: asientos', 'tela', [box(x0 + r, x0 + r + a, zf, za, y0 + r, y1 - r), box(x0 + r + a, xc, zf, za, y0 + r, y0 + r + a), box(x0 + r + a, xc, zf, za, y1 - r - a, y1 - r)],
        { fn: fn + 'Asiento de 0,60 de fondo a 0,42 del piso del desnivel: medidas supuestas.', sec: `fondo ${a}`, med: `asiento a +${f2(za)}`, u: 'D-12' }, { group: G.piso, opt: {} }); } }
  /* escalones de la plataforma norte: macizos (cajones), a todo lo largo de cada borde */
  if (p.pisos) { const P = M.PLA, [x0, x1] = P.x, [y0, y1] = P.y, g = P.pedada, A1 = M.ALZ, u = 'D-13';
    /* del deck a la plataforma: 3 alzadas, dos escalones intermedios sobre la plataforma, en todo el borde compartido */
    Pt('EP-01', 'EP-01 · Escalones del deck a la plataforma', 'madera', [box(x0, x0 + g, P.z, P.z + 2 * A1, y0, y1), box(x0 + g, x0 + 2 * g, P.z, P.z + A1, y0, y1)],
      { fn: 'Maxi 14/11: todo el borde compartido entre el deck y la plataforma es escalones. Tres alzadas de 0,17; pedada de 0,28 supuesta.', sec: `pedada ${g}`, med: `${f2(y1 - y0)} de largo`, u }, { group: G.piso, opt: {} });
    /* de la plataforma al terreno: 3 escalones (4 alzadas) al norte y al este; los del norte dan vuelta la esquina */
    const n = P.n, r = (P.z - M.TERR) / (n + 1), zk = k => P.z - k * r;
    Pt('EP-02', 'EP-02 · Escalones de la plataforma al terreno, norte', 'madera', [...Array(n)].map((_, i) => box(x1 + i * g, x1 + (i + 1) * g, M.TERR, zk(i + 1), y0, y1 + (i + 1) * g)),
      { fn: `Maxi 14/11: 3 escalones hacia el norte para bajar al terreno. Con el terreno a −${f2(-M.TERR)} salen 4 alzadas de ${f1(r)} cm (D-13).`, sec: `pedada ${g} · alzada ${f1(r)}`, med: `${f2(y1 - y0)} de largo`, u }, { group: G.piso, opt: {} });
    Pt('EP-03', 'EP-03 · Escalones de la plataforma al terreno, este', 'madera', [...Array(n)].map((_, i) => box(x0, x1, M.TERR, zk(i + 1), y1 + i * g, y1 + (i + 1) * g)),
      { fn: `Maxi 14/11: 3 escalones hacia el este para bajar al terreno. Alzadas de ${f1(r)} cm (D-13).`, sec: `pedada ${g} · alzada ${f1(r)}`, med: `${f2(x1 - x0)} de largo`, u }, { group: G.piso, opt: {} }); }
  /* tirantes: una pieza por conjunto */
  if (p.tirantes) for (const t of M.TIRANTES) { const { b, h } = t.S, geos = [];
    for (const q of t.pos) for (const [a0, a1] of t.tramos) geos.push(t.dir === 'x' ? box(a0, a1, t.zt - h, t.zt, q - b / 2, q + b / 2) : box(q - b / 2, q + b / 2, t.zt - h, t.zt, a0, a1));
    Pt(t.id, `${t.id} · ${t.nombre} (${geos.length})`, 'madera', geos, { ...base(t), sec: `${b}×${h}`, med: `${geos.length} piezas · cara de arriba a ${t.zt < 0 ? '−' : '+'}${f2(Math.abs(t.zt))}` }, { group: G.est, opt: { dedupeAll: true } }); }
  /* cielorraso y chapa */
  for (const t of MM.TECHOS) { const esCielo = t.mat === 'cielorraso'; if (esCielo ? !p.cielo : !p.techos) continue;
    Pt(t.id, `${t.id} · ${t.nombre}`, esCielo ? 'cielo' : 'techo', A.techoGeo(t), { ...base(t), med: esCielo ? `cara de abajo a +${f2(M.HC)}` : `${t.pend} · de +${f2(t.z[0])} (norte) a +${f2(t.z[1])} (sur)` }, { group: G.techo, opt: { noEdges: !esCielo } }); }
  /* cenefa: cierra la cámara entre el cielorraso y la chapa (frente norte y los dos costados en cuña) */
  if (p.techos) { const xs = M.CXS, xn = M.CXN, yo = M.CYO, ye = M.CYE, z0 = M.ZA, zs = M.zR(xs), zn = M.zR(xn), e = 2.5;
    const cuna = (ya, yb) => box8([[xs, z0, ya], [xn, z0, ya], [xn, z0, yb], [xs, z0, yb], [xs, zs + .1, ya], [xn, zn, ya], [xn, zn, yb], [xs, zs + .1, yb]]);
    /* frente norte, dos costados en cuña y el fondo de la franja que sobresale de la viga de arriba, al norte y al sur (al sur, en cuña bajo la chapa) */
    const fs = (ya, yb) => box8([[xs, z0, ya], [M.XS, z0, ya], [M.XS, z0, yb], [xs, z0, yb], [xs, zs + .1, ya], [M.XS, M.zR(M.XS), ya], [M.XS, M.zR(M.XS), yb], [xs, zs + .1, yb]]);
    const geos = [box(xn - e, xn, z0, zn, yo, ye), cuna(yo, yo + e), cuna(ye - e, ye), box(M.XN, xn - e, z0, z0 + e, yo + e, ye - e), fs(yo + e, ye - e)];
    Pt('CE-01', 'CE-01 · Panel de la cámara del techo', 'madera', geos,
      { fn: 'Maxi 14/11: el panel que cierra la cámara sobresale hasta quedar coplanar con la cara de afuera de las columnas; desde ahí la chapa vuela 0,35. Mide 0,50 en el frente norte y se cierra en cuña hacia el sur. En el este y el oeste lo puse a plomo con la punta de la viga del piso (D-11).', sec: 'tabla', med: `de +${f2(z0)} a +${f2(zn)} en el norte`, u: 'D-11' }, { group: G.techo, opt: {} }); }

  /* ediciones guardadas (borrar, mover, estirar) */
  { const bid = id => id.replace(/[a-z]$/, ''); for (let i = parts.length - 1; i >= 0; i--) { const pp = parts[i], b = bid(pp.id); const e = ED.E[b] || ED.E[pp.id]; if (!e) continue; const datos = ED.enDatos(b);
      if (!datos && e.borrado) { parts.splice(i, 1); continue; } if (!datos && e.mov) { const { x = 0, y = 0, z = 0 } = e.mov; pp.geos = pp.geos.map(g => { const c = g.clone(); c.translate(x, z, y); return c; }); } } }

  const dudas = `<h3>Dudas (${M.DUDAS.length})</h3><ul>${M.DUDAS.map(d => `<li><b>${d.id}</b> · ${d.q}</li>`).join('')}</ul>`;
  const panes = { video3d: videoHTML(), materiales: dudas, ayuda: `<h3>Qué es esto</h3><p>Mocoretá, la casa de Maxi en Ingeniero Maschwitz, modelada a partir de su descripción verbal del 14/11/2026. Primera etapa: el esqueleto (pilotes, columnas, vigas perimetrales y transversales), la envolvente (ventanales, paños de madera, puertas corredizas), los decks y el techo.</p>
    <p>Lo que Maxi dijo figura como <b>estimado</b>; lo que no dijo está marcado <b>supuesto</b> y preguntado en las dudas (D-01 a D-11).</p>
    <h3>Ejes</h3><p>x de sur a norte (0 en la fila sur de columnas), y de oeste a este (0 en el par de columnas del oeste; el voladizo va de −1,00 a 0). Los módulos se numeran de este a oeste, del 1 al 6. Alturas sobre el piso interior; el terreno está 1,47 abajo.</p>
    <h3>Cómo usarlo</h3><ul><li>Tocá una pieza: te muestra qué es, sus medidas y de dónde salió.</li><li>En <b>Ver</b> apagás techo, cielorraso, pisos, vidrios o tirantes para ver la estructura.</li><li><b>Teclado</b>: W/S avanzar y retroceder, A/D de costado, Q/E bajar y subir, flechas para girar.</li></ul>` + dudas };
  const spec = `<span>v<b>${M.META.version}</b> · ${M.META.fecha}</span><span>${parts.length} piezas</span><span>casa <b>25,00 × 5,50</b></span><span>deck norte <b>4,00</b></span><span>${M.DUDAS.length} dudas</span><span>cotas en m</span>`;
  const cx = 300, cy = 1150;
  return { parts, panes, spec, joints: [], steps: [],
    selExtra: pp => `<div class="renrow"><button class="btn" data-hide="${pp.id}">Ocultar pieza</button><button class="btn" data-showall>Mostrar todo</button></div>` + N.editorHTML(pp.id),
    selIntro: '<div class="k">Selección</div><h2>Tocá una pieza</h2><p style="margin:0;color:var(--muted);font-size:13px">O un código en cualquier texto.</p>',
    defaultView: 'iso',
    views: { iso: { label: 'Iso (desde el NE)', p: [cx + 2300, 1200, cy + 2300], t: [cx + 200, 60, cy] }, norte: { label: 'Frente norte', p: [3300, 250, cy], t: [550, 100, cy] }, sur: { label: 'Contrafrente sur', p: [-2900, 250, cy], t: [0, 100, cy] },
      este: { label: 'Desde el este', p: [cx, 200, 4300], t: [cx, 100, 2400] }, oeste: { label: 'Desde el oeste', p: [cx, 200, -2000], t: [cx, 100, -100] }, so: { label: 'Iso (desde el SO)', p: [cx - 1900, 1000, cy - 2300], t: [cx, 60, cy] },
      deck: { label: 'En el deck norte', p: [850, 165, 2250], t: [560, 130, 1000] }, adentro: { label: 'Adentro (desde el este)', p: [275, 165, 2330], t: [275, 140, 600] },
      planta: { label: 'Planta', p: [cx, 4200, cy + .1], t: [cx, 0, cy] } },
    dims: ({ dimLine }) => { const zt = M.TERR + 2; dimLine([-80, zt, 0], [-80, zt, M.LARGO], [-8, 0, 0], '24,00'); dimLine([-80, zt, -M.VOL], [-80, zt, 0], [-8, 0, 0], '1,00');
      dimLine([0, zt, M.LARGO + 120], [M.ANCHO, zt, M.LARGO + 120], [0, 0, 8], '5,50'); dimLine([M.ANCHO, zt, M.LARGO + 120], [M.ANCHO + M.DECKN, zt, M.LARGO + 120], [0, 0, 8], '4,00');
      dimLine([-40, M.TERR, M.LARGO + 60], [-40, 0, M.LARGO + 60], [-8, 0, 0], f2(-M.TERR)); dimLine([-40, 0, M.LARGO + 60], [-40, M.HC, M.LARGO + 60], [-8, 0, 0], f2(M.HC)); } };
}

const COL = { muro: '#b98a5a', glass: '#9fc4cf', puerta: '#3a3a3a', marco: '#8a5a34', deck: '#b58e62', madera: '#c9a46e', viga: '#8a5a34', poste: '#6e4a2e', falsa: '#8a5a34', techo: '#c9cfd3', tabla1: '#b58e62', tabla2: '#ad8558', tabla3: '#bd976c', hierro: '#6f4630', tela: '#cdbfa6', cielo: '#d9c3a0' };
/* el terreno es el suelo del visor (pasto), 1,47 abajo del piso interior (TE-01 en modelo.js) */
window.__terreno = { t: (M.IMPLANTACION[0] || {}).z ?? -147, c: 0 };
/* encastre declarado: la viga de arriba (7, centrada en el vidrio) entra 2,5 cm en la cara interior de las columnas, que van por fuera (D-02) */
window.__encastres = [['C-', 'VA-']];
const root = document.getElementById('modo-3d');
const visor = createVisor({ model: { params, build }, colors: COL, lift: { techo: 300 }, root, radial: 0, far: 60000 });
{ const l = new THREE.DirectionalLight(0xfff6ec, .45); l.position.set(300, -1000, 500); visor.scene.add(l); }

/* cortes y vistas: del motor (motor/vistas.js), iguales en todas las casas */
const VI = initVistas(visor, { M, root, pref: 'mocoreta', rango: { x: [-500, 1600], y: [-400, 2700], z: [-200, 420] }, params: ['techos', 'cielo', 'tirantes', 'pisos', 'carp', 'sillon', 'puertaN', 'puertaS'], dirAmb: [.55, .85] });
const applyClips = () => VI.applyClips(), renderVistas = () => VI.renderVistas();
root.addEventListener('click', e => { const h = e.target.closest('[data-hide]'); if (h) { visor.toggleHidden(h.dataset.hide, true); visor.resetSel(); renderVistas(); return; } if (e.target.closest('[data-showall]')) visor.setHidden([]); });

/* nombres propios y ediciones: al cambiar, se reconstruye */
N.bindEditor(root, () => {}); N.onChange(() => { visor.rebuild(); applyClips(); }); ED.onChange(() => { visor.rebuild(); applyClips(); });

/* teclado (WASD, flechas) y «caminar hasta acá» (W): motor/caminar.js, lo prende la barra de herramientas */

const stage = document.querySelector('#modo-3d .stage');
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
  try { initToolbar(stage, visor, { vistas: vu, zonas: [] }); } catch (e) { console.error('toolbar', e); } }
try { initViewCube(visor); } catch (e) { console.error('viewcube', e); }
try { initInspector(visor); } catch (e) { console.error('inspector', e); }
try { initSidebar(visor); } catch (e) { console.error('sidebar', e); }
window.__ok3d = true;
