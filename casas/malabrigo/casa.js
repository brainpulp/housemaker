/* Casita de Malabrigo 3D — arma las piezas con el armador genérico del motor (armador.js) a partir de modelo.js y arranca los módulos del motor.
   Lo propio de esta casa: la planta en dos variantes (modelo(D)), los tirantes inclinados y las clavaderas del techo de chapa, la hamaca
   paraguaya entre los postes, el cielorraso opcional y el cómputo de materiales. */
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
import { equipMalabrigo } from './equipamiento-malabrigo.js';
import { initTours } from './tours.js';
import { TOURS_MALABRIGO, ESCALERAS_MALABRIGO } from './tours-malabrigo.js';
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

const f2 = cm => (cm / 100).toFixed(2).replace('.', ',');
const f1 = v => (+v).toFixed(1).replace('.', ',');
const NIV = Object.fromEntries(Object.entries(M.NIVELES).map(([k, v]) => [k, v.nombre]));
const { box, box8 } = geo;

const params = [
  { id: 'planta', label: 'Planta de la habitación', type: 'select', value: '400', quick: true, group: 'Casita', options: [['400', '4,00 × 4,00 (interior)'], ['300', '4,00 × 3,00 (interior)']],
    help: 'El pedido es 4 × 3 o 4 × 4 (D-02). El frente a la galería es siempre de 4,00; cambia el fondo. Los muebles cambian de escenario con la planta.' },
  { id: 'cielorraso', label: 'Cielorraso de machimbre con lana', type: 'check', value: false, quick: true, group: 'Casita', help: 'Machimbre de ½″ clavado bajo los tirantes, con lana de vidrio de 50 mm encima (D-06). Sin esto la chapa queda a la vista.' },
  { id: 'hamaca', label: 'Hamaca paraguaya', type: 'check', value: true, quick: true, group: 'Casita', help: 'Colgada de ganchos a 1,90 en la cara interna de los dos postes de la galería (D-07).' },
  { id: 'techos', label: 'Techo (chapa y clavaderas)', type: 'check', value: true, quick: true, group: 'Ver', help: 'Apagalo para ver la estructura: tirantes, viga y postes.' },
  { id: 'equip', label: 'Equipamiento (escenarios)', type: 'check', value: true, quick: true, group: 'Ver' },
  { id: 'carp', label: 'Carpinterías', type: 'check', value: true, quick: true, group: 'Ver', help: 'Vidrios de ventanas y hoja de la puerta, cerradas.' },
  { id: 'corte', label: 'Corte horizontal', type: 'select', value: '0', quick: true, group: 'Ver',
    options: [['0', 'Sin corte'], ['120', 'a +1,20 (mesada y cama)'], ['200', 'a +2,00 (bajo la viga)']], help: 'Saca todo lo que está por encima de esa altura, como una planta.' },
];

/* hamaca paraguaya: tela de hilo tendida entre los dos postes, con la panza a 0,60 del piso; ganchos a 1,90 en la cara interna de cada poste */
function hamacaGeos(MM) {
  /* medidas de una hamaca paraguaya común: tela de 2,00 × 1,40, cabeceras de hilos de ~0,80 por lado; ganchos a 1,90 en la cara interna de los postes */
  const yP = MM.yP, yc = yP - 60, zH = 190, xa = 100, xb = 300, zE = 128, panza = 62, W = 140, n = 24;
  const P = []; for (let i = 0; i <= n; i++) { const t = i / n, x = xa + (xb - xa) * t, s = Math.sin(Math.PI * t), z = zE - panza * 4 * t * (1 - t), w = W * (.78 + .22 * s), up = 34 * (.55 + .45 * s);
    P.push([[x, z + up, yc - w / 2], [x, z + up * .3, yc - w / 4], [x, z, yc], [x, z + up * .3, yc + w / 4], [x, z + up, yc + w / 2]]); }
  const v = []; for (let i = 0; i < n; i++) for (let k = 0; k < 4; k++) { const a = P[i][k], b = P[i + 1][k], c = P[i + 1][k + 1], d = P[i][k + 1]; v.push(...a, ...b, ...c, ...a, ...c, ...d); }
  const tela = new THREE.BufferGeometry(); tela.setAttribute('position', new THREE.BufferAttribute(new Float32Array(v), 3)); tela.computeVertexNormals();
  /* cabeceras: siete hilos de cada gancho a puntos repartidos en el borde de la tela */
  const sogas = []; for (const [xg, xt, E] of [[-8, xa, P[0]], [408, xb, P[n]]]) { const [e0, , , , e4] = E; for (let k = 0; k < 7; k++) { const t = k / 6; const y = e0[2] + (e4[2] - e0[2]) * t, z = e0[1] - (e0[1] - E[2][1]) * Math.sin(Math.PI * t); sogas.push(geo.rod([xg, zH, yP], [xt, z, y], .6, 6)); } }
  const ganchos = [geo.rod([-8, zH, yP], [-2, zH, yP], 1, 6), geo.rod([408, zH, yP], [402, zH, yP], 1, 6)];
  return { tela: [tela], sogas, ganchos };
}

function build(p) {
  const D = +p.planta || 400, MM = { ...M, ...M.modelo(D) };
  const parts = [];
  const Pt = (id, name, cat, geos, info, ex = {}) => { const al = N.alias(id); geos = [].concat(geos).filter(Boolean); if (!geos.length) return;
    parts.push({ id, name: al ? `${id} · ${al}` : name, alias: al, cat, geos, info: { ...info, fn: (N.nota(id) ? `<b>Tu nota:</b> ${N.nota(id)}<br>` : '') + (info.fn || '') }, ...ex }); };
  const ex = d => ({ group: d.nivel ? NIV[d.nivel] : 'Exterior', opt: {} });
  const base = d => ({ fn: d.nota || '', sec: '', med: '', u: MM.DUDAS.filter(x => x.ref.includes(d.id)).map(x => x.id).join(' · ') });
  const comp = { muroM2: 0, abM2: 0, chapaM2: 0, tirM: 0, clavM: 0, vigaM: 0, posteM: 0, plateaM2: 0, cieloM2: 0 };

  /* muros */
  for (const m of MM.MUROS) {
    const L = Math.hypot(m.b[0] - m.a[0], m.b[1] - m.a[1]), t0 = A.zTope(MM, m, 0), t1 = A.zTope(MM, m, 1), z0 = A.zBase(MM, m);
    comp.muroM2 += L * ((t0 + t1) / 2 - z0) / 1e4;
    const med = `${f2(L)} × ${f2(m.e)} · de ${f2(z0)} a ${Array.isArray(m.top) ? f2(m.top[0]) + '/' + f2(m.top[1]) : f2(t0)}`;
    Pt(m.id, `${m.id} · ${m.nombre}`, 'muro', A.muroGeos(MM, m), { ...base(m), med }, ex(m));
  }
  /* aberturas: hoja cerrada (vidrio o panel) */
  for (const a of MM.ABERTURAS) { const m = MM.MUROS.find(w => w.id === a.muro); if (!m) continue; comp.abM2 += a.w * a.h / 1e4; if (!p.carp) continue;
    const vid = a.tipo === 'ventana';
    Pt(a.id, `${a.id} · ${a.nombre}`, vid ? 'glass' : 'puerta', A.hojaGeo(MM, a, vid ? 2 : 4), { ...base(a), med: `${f2(a.w)} × ${f2(a.h)} · antepecho ${f2(a.s || 0)}` }, ex(m)); }
  /* pisos */
  for (const l of MM.LOSAS) { const xs = l.poly.map(q => q[0]), ys = l.poly.map(q => q[1]); comp.plateaM2 += (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys)) / 1e4;
    Pt(l.id, `${l.id} · ${l.nombre}`, 'losa', A.losa(l.poly, l.huecos, l.z - l.e, l.z), { ...base(l), med: `${l.z >= 0 ? '+' : '−'}${f2(Math.abs(l.z))} · ${f2(l.e)} de espesor` }, ex(l)); }
  /* estructura: postes, viga, tirantes inclinados, clavaderas */
  for (const s of MM.ESTRUCTURA) {
    if (s.tipo === 'columna') { comp.posteM += (s.z[1] - s.z[0]) / 100; Pt(s.id, `${s.id} · ${s.nombre}`, 'poste', A.columnaGeo(s), { ...base(s), sec: s.sec, med: `de ${f2(s.z[0])} a +${f2(s.z[1])}` }, ex(s)); continue; }
    if (s.tipo === 'viga') { const L = Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]); comp.vigaM += L / 100;
      Pt(s.id, `${s.id} · ${s.nombre}`, 'viga', A.vigaGeo(s), { ...base(s), sec: s.sec, med: `${f2(L)} de largo · cara de arriba a +${f2(s.z)}, fondo a +${f2(s.z - M.VIGA.h)}` }, ex(s)); continue; }
    if (s.tipo === 'tirante') { const [x, y0] = s.a, y1 = s.b[1], b = M.TIR.b / 2, h = M.TIR.h, [za, zb] = s.zt; comp.tirM += Math.hypot(y1 - y0, zb - za) / 100;
      const g = box8([[x - b, za - h, y0], [x - b, zb - h, y1], [x + b, zb - h, y1], [x + b, za - h, y0], [x - b, za, y0], [x - b, zb, y1], [x + b, zb, y1], [x + b, za, y0]]);
      Pt(s.id, `${s.id} · ${s.nombre}`, 'madera', g, { ...base(s), sec: s.sec, med: `${f2(Math.hypot(y1 - y0, zb - za))} de largo · cara de arriba de +${f2(za)} a +${f2(zb)}` }, { group: 'Techo' }); continue; }
    if (s.tipo === 'clavadera') { comp.clavM += (s.b[0] - s.a[0]) / 100; if (!p.techos) continue;
      Pt(s.id, `${s.id} · ${s.nombre}`, 'madera', box(s.a[0], s.b[0], s.zt, s.zt + M.CLAV.h, s.a[1] - M.CLAV.b / 2, s.a[1] + M.CLAV.b / 2), { ...base(s), sec: s.sec, med: `${f2(s.b[0] - s.a[0])} de largo · a +${f2(s.zt)}` }, { group: 'Techo' }); continue; }
  }
  /* chapa */
  for (const t of MM.TECHOS) { const xs = t.poly.map(q => q[0]), ys = t.poly.map(q => q[1]); comp.chapaM2 += (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys)) * Math.sqrt(1 + M.PEND * M.PEND) / 1e4;
    if (!p.techos) continue;
    Pt(t.id, `${t.id} · ${t.nombre}`, 'techo', A.techoGeo(t), { ...base(t), med: `${t.pend} · de +${f2(t.z[0])} (fondo) a +${f2(t.z[1])} (galería)` }, { group: 'Techo', opt: { noEdges: true } }); }
  /* cielorraso opcional: machimbre bajo los tirantes, sólo en la habitación (la lana va encima, entre tirantes; no se dibuja) */
  { const l = MM.LOCALES[0], poly = l.poly, zt0 = M.zT(0) - M.TIR.h, zt1 = M.zT(D) - M.TIR.h; comp.cieloM2 = 4 * D / 1e4 * Math.sqrt(1 + M.PEND * M.PEND);
    if (p.cielorraso) Pt('CI-01', 'CI-01 · Cielorraso de machimbre', 'madera', A.techoGeo({ poly, baja: '+y', z: [zt0, zt1], e: 2 }), { fn: 'Machimbre de ½″ clavado por debajo de los tirantes, siguiendo la pendiente; lana de vidrio de 50 mm encima. Opción de D-06.', sec: 'machimbre ½″', med: `${f1(comp.cieloM2)} m²` }, { group: 'Techo', opt: { noEdges: true } }); }
  /* hamaca */
  if (p.hamaca) { const h = hamacaGeos(MM);
    Pt('HA-1', 'HA-1 · Hamaca paraguaya', 'tela', h.tela, { fn: 'Hamaca de hilo entre los dos postes, ganchos a 1,90, panza a 0,60 del piso. Largo total con sogas: 4,22 (D-07).', sec: '', med: 'tela 2,00 × 1,40 + cabeceras' }, { group: NIV.PB, opt: { noEdges: true } });
    Pt('HA-1s', 'HA-1 · sogas y ganchos', 'soga', [...h.sogas, ...h.ganchos], { fn: 'Sogas de las cabeceras y ganchos de hierro atornillados en la cara interna de los postes.', sec: 'gancho Ø 10', med: '' }, { group: NIV.PB, opt: { noEdges: true } }); }

  /* ediciones guardadas (borrar, mover, estirar) */
  { const bid = id => id.replace(/[a-z]$/, ''); for (let i = parts.length - 1; i >= 0; i--) { const pp = parts[i], b = bid(pp.id); const e = ED.E[b] || ED.E[pp.id]; if (!e) continue; const datos = ED.enDatos(b);
      if (!datos && e.borrado) { parts.splice(i, 1); continue; } if (!datos && e.mov) { const { x = 0, y = 0, z = 0 } = e.mov; pp.geos = pp.geos.map(g => { const c = g.clone(); c.translate(x, z, y); return c; }); } } }

  /* cómputo aproximado, sacado del modelo */
  const nTir = MM.ESTRUCTURA.filter(s => s.tipo === 'tirante').length, nCl = MM.ESTRUCTURA.filter(s => s.tipo === 'clavadera').length, mamp = comp.muroM2 - comp.abM2;
  const fila = (q, v, n = '') => `<tr><td><b>${q}</b></td><td>${v}${n ? `<br><small style="color:var(--muted)">${n}</small>` : ''}</td></tr>`;
  const materiales = `<h3>Cómputo aproximado (planta ${D === 400 ? '4 × 4' : '4 × 3'})</h3><p style="color:var(--muted);font-size:12px">Sale del modelo, sin desperdicio. Es para tener una idea; el que construya lo ajusta.</p><table><tbody>
    ${fila('Platea y piso de galería', `${f1(comp.plateaM2)} m² · ${f1(comp.plateaM2 * .12)} m³ de hormigón`, 'Platea de 12 (D-05). Sin vigas de fundación: depende del suelo.')}
    ${fila('Mampostería', `${f1(mamp)} m² · unos ${Math.round(mamp * 16.5)} ladrillos huecos de 18 × 18 × 33`, 'Descontadas puerta y ventanas. Más dinteles y encadenado superior (no dibujados).')}
    ${fila('Revoque', `${f1(mamp * 2)} m²`, 'Las dos caras.')}
    ${fila('Chapa', `${f1(comp.chapaM2)} m²`, 'Sinusoidal galvanizada al 12 %, con los voladizos. Más cumbrera-babeta contra nada: es un agua, lleva sólo canaleta al frente.')}
    ${fila('Tirantes 3″ × 6″', `${nTir} de ${f1(comp.tirM / nTir)} m · ${f1(comp.tirM)} m`, 'Pino, cada 0,60.')}
    ${fila('Clavaderas 2″ × 2″', `${nCl} de 4,70 m · ${f1(comp.clavM)} m`, 'Pino.')}
    ${fila('Viga de galería 3″ × 8″', `${f1(comp.vigaM)} m`, 'Madera dura (D-04).')}
    ${fila('Postes 12 × 12', `2 de ${f1(comp.posteM / 2)} m`, 'Madera dura, empotrados en el piso de la galería.')}
    ${p.cielorraso ? fila('Cielorraso', `${f1(comp.cieloM2)} m² de machimbre ½″ + lana de vidrio 50 mm`, 'Opción de D-06.') : ''}
    ${fila('Aberturas', MM.ABERTURAS.map(a => `${a.id} ${f2(a.w)} × ${f2(a.h)}`).join(' · '), 'Sin mosquiteros ni rejas (D-08).')}
  </tbody></table>`;
  const panes = { video3d: videoHTML(), materiales, ayuda: `<h3>Qué es esto</h3><p>Una casita para trabajadores de campo en Malabrigo (Santa Fe), pedida el 5/11/2026: una habitación de 4 × 4 (o 4 × 3) con una cama, una mesada con bacha y sin baño, y una galería de 2,00 al este bajo el mismo techo de chapa a un agua, para tomar mate cocido o colgar la hamaca paraguaya.</p>
    <p>Todo es <b>proyecto y supuesto</b>: no hay terreno ni plano todavía. Las decisiones que faltan están en <b>Dudas</b> (D-01 a D-09), en el modo Planta.</p>
    <h3>Ejes</h3><p>x de sur a norte, y de oeste a este; 0,0 en la esquina interior SO de la habitación. El fondo (muro ciego) mira al oeste; la galería, al este (D-01). Alturas sobre el piso terminado de la habitación, que queda 0,15 sobre el terreno.</p>
    <h3>Cómo usarlo</h3><ul><li>Tocá una pieza: te muestra qué es y sus medidas.</li><li>En <b>Ver</b> cambiás la planta (4 × 4 / 4 × 3), prendés el cielorraso o sacás la hamaca; <b>Techo</b> apagado deja ver tirantes, viga y postes.</li><li><b>Equipamiento</b>: la habitación tiene escenarios (una cama, cucheta, 4 × 3) y la galería el banco; podés mover y cambiar muebles.</li><li><b>Cómputo</b>: metros y cantidades que salen del modelo.</li><li><b>Teclado</b>: W/S avanzar y retroceder, A/D de costado, Q/E bajar y subir, flechas para girar.</li></ul>` };
  const spec = `<span>v<b>${M.META.version}</b> · ${M.META.fecha}</span><span>${parts.length} piezas</span><span>habitación <b>4,00 × ${f2(D)}</b></span><span>galería <b>4,40 × 2,00</b></span><span>${M.DUDAS.length} dudas</span><span>cotas en m</span>`;
  const cx = 200, cy = (MM.yP - 20) / 2;
  return { parts, panes, spec, joints: [], steps: [],
    selExtra: pp => `<div class="renrow"><button class="btn" data-hide="${pp.id}">Ocultar pieza</button><button class="btn" data-showall>Mostrar todo</button></div>` + N.editorHTML(pp.id),
    selIntro: '<div class="k">Selección</div><h2>Tocá una pieza</h2><p style="margin:0;color:var(--muted);font-size:13px">O un código en cualquier texto.</p>',
    defaultView: 'iso',
    views: { iso: { label: 'Iso (desde el NE)', p: [cx + 750, 520, cy + 950], t: [cx, 120, cy] }, frente: { label: 'Galería (desde el E)', p: [cx, 170, MM.yP + 900], t: [cx, 150, MM.yP] },
      galeria: { label: 'En la galería', p: [-160, 165, MM.yP + 160], t: [330, 95, MM.yP - 130] }, adentro: { label: 'Adentro (desde la puerta)', p: [25, 160, D - 15], t: [330, 85, 40] },
      planta: { label: 'Planta', p: [cx, 1900, cy + .1], t: [cx, 0, cy] }, fondo: { label: 'Fondo (desde el O)', p: [cx, 200, -900], t: [cx, 150, 0] } },
    dims: ({ dimLine }) => { dimLine([0, 2, -60], [400, 2, -60], [0, 0, -8], '4,00'); dimLine([-60, 2, 0], [-60, 2, D], [-8, 0, 0], f2(D)); dimLine([-60, 2, D + 20], [-60, 2, MM.yP], [-8, 0, 0], '2,00');
      dimLine([440, -3, MM.yP], [440, MM.zVigaBot, MM.yP], [8, 0, 0], f2(MM.zVigaBot + 3)); } };
}

const COL = { muro: '#ddd6c8', glass: '#9fc4cf', puerta: '#8a6a4a', losa: '#cfcac0', madera: '#c9a46e', viga: '#8a5a34', poste: '#6e4a2e', techo: '#9aa0a4', tela: '#d9c9a3', soga: '#9a7a4a' };
/* el terreno es el suelo del visor (pasto), 0,15 abajo del piso de la habitación (TE-01 en modelo.js) */
window.__terreno = { t: (M.IMPLANTACION[0] || {}).z ?? -15, c: 0 };
const root = document.getElementById('modo-3d');
const visor = createVisor({ model: { params, build }, colors: COL, lift: { techo: 300 }, root, radial: 0, far: 40000 });
{ const l = new THREE.DirectionalLight(0xfff6ec, .45); l.position.set(300, -1000, 500); visor.scene.add(l); }

/* cortes y vistas: del motor (motor/vistas.js), iguales en todas las casas */
const VI = initVistas(visor, { M, root, pref: 'malabrigo', rango: { x: [-150, 560], y: [-150, 900], z: [-40, 420] }, params: ['techos', 'carp', 'hamaca', 'cielorraso'], dirAmb: [.55, .85] });
const applyClips = () => VI.applyClips(), renderVistas = () => VI.renderVistas();
root.addEventListener('click', e => { const h = e.target.closest('[data-hide]'); if (h) { visor.toggleHidden(h.dataset.hide, true); visor.resetSel(); renderVistas(); return; } if (e.target.closest('[data-showall]')) visor.setHidden([]); });

/* variables de diseño en la base (las del grupo «Casita») y el escenario de muebles que sigue a la planta */
let vdb = null; N.getDb().then(d => { vdb = d; });
const PDES = new Set(params.filter(q => q.group === 'Casita').map(q => q.id)); const pdes = P => Object.fromEntries(Object.entries(P).filter(([k]) => PDES.has(k)));
let planta0 = '400';
visor.onParam = P => { if (P.planta !== planta0) { planta0 = P.planta; try { const ST = visor.equip && visor.equip.ST.mue; if (ST) { let cambio = false;
      const pasar = (st, quiere) => { if (st && st.activo !== quiere && st.esc[quiere]) { st.activo = quiere; cambio = true; } };
      if (ST.habitacion) pasar(ST.habitacion, P.planta === '300' ? 'C' : (ST.habitacion.activo === 'C' ? 'A' : ST.habitacion.activo));
      if (ST.galeria) pasar(ST.galeria, P.planta === '300' ? (ST.galeria.activo === 'A' ? 'B' : ST.galeria.activo) : (ST.galeria.activo === 'B' ? 'A' : ST.galeria.activo));
      if (cambio) visor.equip.rearmar(); } } catch (e) {} }
  if (vdb) vdb.doc('estado/params').set({ p: pdes(P), ts: new Date().toISOString() }).catch(() => {}); };

/* nombres propios y ediciones: al cambiar, se reconstruye */
N.bindEditor(root, () => {}); N.onChange(() => { visor.rebuild(); applyClips(); }); ED.onChange(() => { visor.rebuild(); applyClips(); });

/* teclado (WASD, flechas) y «caminar hasta acá» (W): motor/caminar.js, lo prende la barra de herramientas */

const stage = document.querySelector('#modo-3d .stage');
try { initMarcas(visor, stage); } catch (e) { console.error('marcas', e); }
try { initRealismo(visor, { piedra: [], ladrillo: [], blanco: [], cats: { muro: ['revoque', 200], losa: ['cemento', 300], madera: ['madera', 120], viga: ['madera', 120], poste: ['madera', 120] } }); } catch (e) { console.error('realismo', e); }
try { initLuz(visor); } catch (e) { console.error('luz', e); }
try { initCalidad(visor); } catch (e) { console.error('calidad', e); }
try { initPersonas(visor); } catch (e) { console.error('personas', e); }
try { initEquipamiento(visor, stage, { datos: equipMalabrigo, piso: 0 }); } catch (e) { console.error('equipamiento', e); }
/* sol: Malabrigo, Santa Fe (29°21′ S, 59°58′ O); x apunta al norte real (la galería al este es un supuesto, D-01) */
try { initNoche(visor, { lugar: 'Malabrigo (Santa Fe)', lat: -29.35, lon: -59.97, tz: -3, norte: 0, inicioDia: true, max: 32 }); } catch (e) { console.error('noche', e); }
/* cámara: se recuerda en este navegador */
{ try { const v = JSON.parse(localStorage.getItem('malabrigo-cam') || 'null'); if (v && v.p && v.t) { visor.camera.position.set(...v.p); visor.controls.target.set(...v.t); visor.controls.update(); } } catch (e) {}
  let last = ''; setInterval(() => { const v = visor.getView(); const k = JSON.stringify(v); if (k !== last) { last = k; try { localStorage.setItem('malabrigo-cam', k); } catch (e) {} } }, 1000); }
try { initTours(visor, { tours: TOURS_MALABRIGO, escaleras: ESCALERAS_MALABRIGO }); } catch (e) { console.error('tours', e); }
/* térmica: una zona (la habitación, planta 4 × 4); clima de Reconquista Aero, máximas y mínimas medias 1991–2020 (la estación del SMN más cercana, 70 km) */
try { initTermica(visor, M, { zonas: l => l.id === 'L-01', piso: () => 0, terreno: () => true,
  clima: [[32.4, 21.0], [31.2, 20.4], [29.4, 18.8], [26.0, 15.8], [22.2, 12.6], [19.9, 10.1], [19.7, 8.7], [22.7, 10.0], [24.4, 12.1], [26.8, 15.4], [29.0, 17.4], [31.1, 19.7]] }); } catch (e) { console.error('termica', e); }
try { initEditor(visor, stage, {}, 0); } catch (e) { console.error('editor', e); }
try { initSenalar(visor, stage); } catch (e) { console.error('senalar', e); }
try { initMedir(visor, stage); } catch (e) { console.error('medir', e); }
{ let vu = null; try { vu = initVistasUI(); } catch (e) { console.error('vistas', e); }
  try { initToolbar(stage, visor, { vistas: vu, zonas: [] }); } catch (e) { console.error('toolbar', e); } }
try { initViewCube(visor); } catch (e) { console.error('viewcube', e); }
try { initInspector(visor); } catch (e) { console.error('inspector', e); }
try { initSidebar(visor); } catch (e) { console.error('sidebar', e); }
window.__ok3d = true;
