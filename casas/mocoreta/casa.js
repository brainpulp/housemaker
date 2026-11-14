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

const f2 = cm => (cm / 100).toFixed(2).replace('.', ',');
const f1 = v => (+v).toFixed(1).replace('.', ',');
const NIV = Object.fromEntries(Object.entries(M.NIVELES).map(([k, v]) => [k, v.nombre]));
const { box, box8 } = geo;

const params = [
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
    if (m.tipo === 'vidrio') { const g = A.vidrioGeos(MM, m);
      if (p.carp) Pt(m.id, `${m.id} · ${m.nombre}`, 'glass', g.vidrio, { ...base(m), med }, { group: G.fach, opt: {} });
      Pt(m.id + 'm', `${m.id} · marco`, m.corrediza ? 'puerta' : 'marco', g.perfiles, { ...base(m), med, sec: m.corrediza ? 'hoja corrediza' : 'marco' }, { group: G.fach, opt: {} }); }
    else Pt(m.id, `${m.id} · ${m.nombre}`, 'muro', A.muroGeos(MM, m), { ...base(m), med, sec: `madera, ${m.e} cm` }, { group: G.fach, opt: {} }); }
  if (p.carp) for (const a of MM.ABERTURAS) Pt(a.id, `${a.id} · ${a.nombre}`, 'glass', A.hojaGeo(MM, a, 2), { ...base(a), med: `${f2(a.w)} × ${f2(a.h)} · antepecho ${f2(a.s || 0)}` }, { group: G.fach, opt: {} });
  /* pisos */
  if (p.pisos) for (const l of MM.LOSAS) Pt(l.id, `${l.id} · ${l.nombre}`, 'deck', A.losa(l.poly, l.huecos, l.z - l.e, l.z), { ...base(l), med: `a +${f2(l.z)} · ${f1(l.e)} cm de espesor` }, { group: G.piso, opt: {} });
  /* estructura */
  for (const s of MM.ESTRUCTURA) {
    if (s.tipo === 'columna') Pt(s.id, `${s.id} · ${s.nombre}`, s.cat === 'falsa' ? 'falsa' : 'poste', A.columnaGeo(s), { ...base(s), sec: s.sec, med: `de ${s.z[0] < 0 ? '−' : '+'}${f2(Math.abs(s.z[0]))} a ${s.z[1] < 0 ? '−' : '+'}${f2(Math.abs(s.z[1]))}` }, { group: G.est, opt: {} });
    else if (s.tipo === 'viga') { const L = Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]); Pt(s.id, `${s.id} · ${s.nombre}`, 'viga', A.vigaGeo(s), { ...base(s), sec: s.sec, med: `${f2(L)} de largo · cara de arriba a +${f2(s.z)}` }, { group: G.est, opt: {} }); } }
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
    views: { iso: { label: 'Iso (desde el NE)', p: [cx + 1900, 1100, cy + 2300], t: [cx, 60, cy] }, norte: { label: 'Frente norte', p: [3300, 250, cy], t: [550, 100, cy] }, sur: { label: 'Contrafrente sur', p: [-2900, 250, cy], t: [0, 100, cy] },
      este: { label: 'Desde el este', p: [cx, 200, 4300], t: [cx, 100, 2400] }, oeste: { label: 'Desde el oeste', p: [cx, 200, -2000], t: [cx, 100, -100] }, so: { label: 'Iso (desde el SO)', p: [cx - 1900, 1000, cy - 2300], t: [cx, 60, cy] },
      deck: { label: 'En el deck norte', p: [850, 165, 2250], t: [560, 130, 1000] }, adentro: { label: 'Adentro (desde el este)', p: [275, 165, 2330], t: [275, 140, 600] },
      planta: { label: 'Planta', p: [cx, 4200, cy + .1], t: [cx, 0, cy] } },
    dims: ({ dimLine }) => { const zt = M.TERR + 2; dimLine([-80, zt, 0], [-80, zt, M.LARGO], [-8, 0, 0], '24,00'); dimLine([-80, zt, -M.VOL], [-80, zt, 0], [-8, 0, 0], '1,00');
      dimLine([0, zt, M.LARGO + 120], [M.ANCHO, zt, M.LARGO + 120], [0, 0, 8], '5,50'); dimLine([M.ANCHO, zt, M.LARGO + 120], [M.ANCHO + M.DECKN, zt, M.LARGO + 120], [0, 0, 8], '4,00');
      dimLine([-40, M.TERR, M.LARGO + 60], [-40, 0, M.LARGO + 60], [-8, 0, 0], f2(-M.TERR)); dimLine([-40, 0, M.LARGO + 60], [-40, M.HC, M.LARGO + 60], [-8, 0, 0], f2(M.HC)); } };
}

const COL = { muro: '#b98a5a', glass: '#9fc4cf', puerta: '#3a3a3a', marco: '#8a5a34', deck: '#b58e62', madera: '#c9a46e', viga: '#8a5a34', poste: '#6e4a2e', falsa: '#8a5a34', techo: '#c9cfd3', cielo: '#d9c3a0' };
/* el terreno es el suelo del visor (pasto), 1,47 abajo del piso interior (TE-01 en modelo.js) */
window.__terreno = { t: (M.IMPLANTACION[0] || {}).z ?? -147, c: 0 };
/* encastre declarado: la viga de arriba (7, centrada en el vidrio) entra 2,5 cm en la cara interior de las columnas, que van por fuera (D-02) */
window.__encastres = [['C-', 'VA-']];
const root = document.getElementById('modo-3d');
const visor = createVisor({ model: { params, build }, colors: COL, lift: { techo: 300 }, root, radial: 0, far: 60000 });
{ const l = new THREE.DirectionalLight(0xfff6ec, .45); l.position.set(300, -1000, 500); visor.scene.add(l); }

/* cortes y vistas: del motor (motor/vistas.js), iguales en todas las casas */
const VI = initVistas(visor, { M, root, pref: 'mocoreta', rango: { x: [-500, 1200], y: [-400, 2700], z: [-200, 420] }, params: ['techos', 'cielo', 'tirantes', 'pisos', 'carp'], dirAmb: [.55, .85] });
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
