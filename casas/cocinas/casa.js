/* Cocinas 3D — arma las tres islas con el armador genérico del motor (armador.js) a partir de modelo.js (que recorta Carhué y Arcos y suma
   Mocoretá) y arranca los módulos del motor. Lo propio de esta escena: una «casa» (grupo) por cocina, vistas por cocina y el equipamiento. */
import * as THREE from 'three';
import { createVisor, geo } from './visor3d.js';
import { tablones } from './tablones.js';
import { initSenalar } from './senalar.js';
import { initToolbar } from './toolbar.js';
import { initMedir } from './medir.js';
import { initVistasUI } from './vistasui.js';
import { initVistas } from './vistas.js';
import { initViewCube } from './viewcube.js';
import { initEquipamiento } from './equipamiento.js';
import { equipCocinas } from './equipamiento-cocinas.js';
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
const zN = k => (M.NIVELES[k] || {}).z ?? 0;
const CASA = Object.fromEntries(M.CASAS.map(c => [c.pre, c]));
const casaDe = r => CASA[r.casa] || CASA[String(r.id).split(':')[0]];
const grupo = r => (casaDe(r) || {}).nombre || 'Escena';

const params = [
  ...M.CASAS.map(c => ({ id: 'ver' + c.pre, label: c.nombre, type: 'check', value: true, quick: true, group: 'Cocinas', help: `Muestra u oculta ${c.nombre} entera: paredes, pisos, estructura y muebles.` })),
  { id: 'techos', label: 'Techos y cielorrasos', type: 'check', value: false, quick: true, group: 'Ver', help: 'Las tres cocinas van sin techo (islas). Prendelo para ver el cielorraso real de cada una: la chapa del ala en Carhué, la losa del 2P en Arcos, el cielorraso supuesto en Mocoretá.' },
  { id: 'ep', label: 'Entrepiso de Arcos (tablas y cabios)', type: 'check', value: false, quick: true, group: 'Ver', help: 'Apagado, del entrepiso sobre la cocina de Arcos queda sólo el perímetro (una faja de 10 a +2,57), las vigas y la baranda, para ver la cocina desde arriba. Prendido, se ven las tablas y los cabios.' },
  { id: 'equip', label: 'Equipamiento (escenarios)', type: 'check', value: true, quick: true, group: 'Ver' },
  { id: 'carp', label: 'Carpinterías', type: 'check', value: true, quick: true, group: 'Ver', help: 'Vidrios de ventanas y hojas de puertas, cerradas.' },
  { id: 'corte', label: 'Corte horizontal', type: 'select', value: '0', quick: true, group: 'Ver',
    options: [['0', 'Sin corte'], ['120', 'a +1,20 (mesadas)'], ['190', 'a +1,90 (bajo las alacenas altas)'], ['300', 'a +3,00 (bajo el entrepiso de Arcos)']], help: 'Saca todo lo que está por encima de esa altura, como una planta.' },
];

function build(p) {
  const parts = [];
  const Pt = (id, name, cat, geos, info, ex = {}) => { const al = N.alias(id); geos = [].concat(geos).filter(Boolean); if (!geos.length) return;
    { const pre = String(id).split(':')[0]; if (CASA[pre] && p['ver' + pre] === false) return; }   /* llave «Cocinas» por casa: esconde la casa entera */
    parts.push({ id, name: al ? `${id} · ${al}` : name, alias: al, cat, geos, info: { ...info, fn: (N.nota(id) ? `<b>Tu nota:</b> ${N.nota(id)}<br>` : '') + (info.fn || '') }, ...ex }); };
  const ex = d => ({ group: grupo(d), opt: { op: d.estado === 'proyecto' ? .35 : undefined } });
  const exT = d => ({ group: 'Techos', tags: ['techos', grupo(d)] });
  const base = d => ({ fn: d.nota || '', sec: '', med: '', u: M.DUDAS.filter(x => x.ref.includes(d.id)).map(x => x.id).join(' · ') });

  /* muros */
  for (const m of M.MUROS) {
    const L = Math.hypot(m.b[0] - m.a[0], m.b[1] - m.a[1]);
    const med = `${f2(L)} × ${f2(m.e)} · de ${f2(A.zBase(M, m))} a ${Array.isArray(m.top) ? f2(m.top[0]) + '/' + f2(m.top[1]) : f2(A.zTope(M, m, 0))}`;
    if (m.tipo === 'vidrio') { const g = A.vidrioGeos(M, m);
      Pt(m.id, `${m.id} · ${m.nombre}`, 'glass', g.vidrio, { ...base(m), med }, ex(m));
      Pt(m.id + 'p', `${m.id} · perfiles`, 'perfil', g.perfiles, { ...base(m), med }, ex(m)); continue; }
    const cat = m.tipo === 'tabique' ? 'tabique' : m.e >= 25 ? 'medianera' : 'muro';
    Pt(m.id, `${m.id} · ${m.nombre}`, cat, A.muroGeos(M, m), { ...base(m), med }, ex(m));
  }
  /* aberturas: hoja cerrada (vidrio o panel) */
  if (p.carp) for (const a of M.ABERTURAS) { const m = M.MUROS.find(w => w.id === a.muro); if (!m || a.tipo === 'vano') continue;
    const vid = a.tipo === 'ventana';
    Pt(a.id, `${a.id} · ${a.nombre}`, vid ? 'glass' : 'puerta', A.hojaGeo(M, a, vid ? 2 : 4), { ...base(a), med: `${f2(a.w)} × ${f2(a.h)} · antepecho ${f2(a.s || 0)}` }, ex(m)); }
  /* losas: pisos (PB), entrepiso de madera (EP) y, con «Techos», las losas que hacen de cielorraso */
  const faja = (poly, z0, z1, w = 10) => { const xs = poly.map(q => q[0]), ys = poly.map(q => q[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    return A.losa(poly, [[[x0 + w, y0 + w], [x1 - w, y0 + w], [x1 - w, y1 - w], [x0 + w, y1 - w]]], z0, z1); };   /* perímetro de una losa rectangular: faja de w con hueco adentro */
  for (const l of M.LOSAS) { if (l.techo && !p.techos) continue;
    const cat = l.techo ? 'techo' : l.nivel === 'EP' ? 'madera' : 'losa';
    if (l.nivel === 'EP' && !p.ep && l.poly.length === 4) { Pt(l.id, `${l.id} · ${l.nombre} (sólo el perímetro)`, 'madera', faja(l.poly, l.z - l.e, l.z), { ...base(l), fn: (l.nota || '') + ' <i>Apagado «Entrepiso de Arcos»: se dibuja sólo el borde, para ver la cocina desde arriba.</i>', med: `+${f2(l.z)} · ${f2(l.e)} de espesor` }, ex(l)); continue; }
    Pt(l.id, `${l.id} · ${l.nombre}`, cat, A.losa(l.poly, l.huecos, l.z - l.e, l.z), { ...base(l), med: `${l.z >= 0 ? '+' : '−'}${f2(Math.abs(l.z))} · ${f2(l.e)} de espesor` }, l.techo ? exT(l) : ex(l)); }
  /* piso de tablones en la cocina de Arcos, como en la casa (Maxi 4/11): tablas de 20 transversales, tres tonos, sobre la losa de PB y el piso del estar hundido */
  for (const l of M.LOSAS) { if (l.casa !== 'AR' || l.nivel !== 'PB' || l.techo || !/LO-0[23]$/.test(l.id)) continue;
    tablones(geo, A, { poly: l.poly, huecos: l.huecos || [], z: l.z, seed: 7 + l.z }).forEach((g, i) => g.length && Pt(`${l.id}-T${i + 1}`, `${l.id} · piso de tablones`, 'tabla' + (i + 1), g, { fn: 'Tablones de 20 de ancho, transversales, como en la casa de Arcos.', sec: 'tablón 20 × 2', med: '' }, { group: grupo(l), tags: ['pisos'], opt: { noEdges: true } })); }
  /* cabios bajo los entrepisos de madera (Arcos): de canto, clavados directo bajo las tablas; van de viga a viga */
  { const vm = M.ESTRUCTURA.filter(s => s.tipo === 'viga' && s.cat === 'madera');
    for (const l of M.LOSAS) { const c = l.cabios; if (!c || l.techo || (l.nivel === 'EP' && !p.ep)) continue;
      const [b, h] = c.sec.split('×').map(v => parseFloat(v.replace(',', '.'))), zt = l.z - l.e, g = [];
      const xs = l.poly.map(q => q[0]), ys = l.poly.map(q => q[1]), X0 = Math.min(...xs), X1 = Math.max(...xs), Y0 = Math.min(...ys), Y1 = Math.max(...ys);
      const [u0, u1, v0, v1] = c.dir === 'y' ? [X0, X1, Y0, Y1] : [Y0, Y1, X0, X1];
      const cortes = vm.filter(s => c.dir === 'y' ? s.a[1] === s.b[1] : s.a[0] === s.b[0]).map(s => { const w = parseFloat(s.sec) / 2, v = c.dir === 'y' ? s.a[1] : s.a[0]; return [v - w, v + w]; }).filter(([a, b2]) => b2 > v0 && a < v1).sort((a, b2) => a[0] - b2[0]);
      const tramos = []; let v = v0; for (const [a, b2] of cortes) { if (a > v + 1) tramos.push([v, a]); v = Math.max(v, b2); } if (v1 > v + 1) tramos.push([v, v1]);
      const n = Math.max(1, Math.round((u1 - u0) / c.sep)), du = (u1 - u0) / n;
      for (let k = 0; k <= n; k++) { const u = Math.min(u1 - b / 2, Math.max(u0 + b / 2, u0 + k * du));
        for (const [a, b2] of tramos) { const q = c.dir === 'y' ? [[u - b / 2, a], [u + b / 2, a], [u + b / 2, b2], [u - b / 2, b2]] : [[a, u - b / 2], [b2, u - b / 2], [b2, u + b / 2], [a, u + b / 2]]; g.push(A.losa(q, null, zt - h, zt)); } }
      Pt(l.id + 'c', `${l.id} · cabios`, 'madera', g, { fn: `Cabios de ${c.sec.replace('×', ' × ')} de canto, cada ~${f2(du)}, clavados directo bajo las tablas de ${l.e}; van de viga a viga.`, sec: c.sec, med: `${n + 1} cabios` }, ex(l)); } }
  /* estructura */
  for (const s of M.ESTRUCTURA) { if (s.techo && !p.techos) continue;
    const g = s.tipo === 'columna' ? A.columnaGeo(s) : s.tipo === 'viga' ? A.vigaGeo(s) : s.tipo === 'tensor' ? geo.rod([s.pos[0], s.z[0], s.pos[1]], [s.pos[0], s.z[1], s.pos[1]], 0.8, 8) : null;
    const cat = s.techo ? 'techo' : s.cat || (s.tipo === 'tensor' ? 'herreria' : s.tipo === 'viga' ? 'viga' : 'col');
    Pt(s.id, `${s.id} · ${s.nombre}`, cat, g, { ...base(s), sec: s.sec || '', med: s.tipo === 'viga' ? `${f2(Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]))} de largo, fondo a ${f2(s.z - (parseFloat(String(s.sec).split(/[×x]/)[1]) || 20))}` : Array.isArray(s.z) ? `de ${f2(s.z[0])} a ${f2(s.z[1])}` : '' }, s.techo ? exT(s) : ex(s)); }
  /* barandas */
  for (const b of M.BARANDAS) Pt(b.id, `${b.id} · ${b.nombre}`, b.tipo === 'madera' ? 'madera' : 'perfil', A.barandaGeos(b, null), base(b), ex(b));
  /* muebles fijos que trae la casa (tablero eléctrico de Carhué) */
  /* el tablero eléctrico de Carhué va dibujado al ras de la pared (1 cm): en la realidad sale 8; la puerta de pizarra del escenario D lo tapa, y así la prueba de muebles no lo cuenta como choque */
  for (const c of M.CHIMENEAS) if (c.box) { const b = c.box.slice(); if (/TAB-/.test(c.id)) { b[1] = b[0] + .4; b[0] -= .6; }
    Pt(c.id, `${c.id} · ${c.nombre}`, 'herraje', geo.box(b[0], b[1], b[2], b[3], b[4], b[5]), { ...base(c), med: /TAB-/.test(c.id) ? `${f2(c.box[5] - c.box[4])} × ${f2(c.box[3] - c.box[2])} · sale ${f2(c.box[1] - c.box[0])} de la pared (dibujado al ras)` : '' }, ex(c)); }
  /* techos y cielorrasos */
  if (p.techos) for (const t of M.TECHOS) Pt(t.id, `${t.id} · ${t.nombre}`, 'techo', A.techoGeo(t), { ...base(t), med: `${t.pend} · de ${f2(t.z[0])} a ${f2(t.z[1])}` }, exT(t));
  /* cartel con el nombre de cada cocina, en el piso al norte de la caja (de letras no hay: una placa fina con el código de la casa) */
  for (const c of M.CASAS) { const { x, y } = c.caja_escena; Pt(`${c.pre}:CAJA`, `${c.pre} · ${c.nombre}: caja del recorte`, 'cerco', [geo.box(x[0], x[1], -26, -25, y[0], y[1])], { fn: `Recorte de ${c.nombre} (${c.fuente}). Caja: x ${f2(x[0])} a ${f2(x[1])}, y ${f2(y[0])} a ${f2(y[1])}.`, sec: '', med: `${f2(x[1] - x[0])} × ${f2(y[1] - y[0])}` }, { group: c.nombre, opt: { noEdges: true } }); }

  /* ediciones guardadas por Maxi (borrar, mover, estirar) */
  { const bid = id => id.replace(/[a-z]$/, ''); for (let i = parts.length - 1; i >= 0; i--) { const pp = parts[i], b = bid(pp.id); const e = ED.E[b] || ED.E[pp.id]; if (!e) continue; const datos = ED.enDatos(b);
      if (!datos && e.borrado) { parts.splice(i, 1); continue; } if (!datos && e.mov) { const { x = 0, y = 0, z = 0 } = e.mov; pp.geos = pp.geos.map(g => { const c = g.clone(); c.translate(x, z, y); return c; }); } } }

  const esc = v => String(v ?? '').replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const materiales = `<h3>Lo que hay (inventario de Maxi, ${esc(M.INVENTARIO.fecha)})</h3><table><tbody>${M.INVENTARIO.tiene.map(i => `<tr><td><b>${i.n}</b></td><td>${esc(i.que)}${i.nota ? `<br><small style="color:var(--muted)">${esc(i.nota)}</small>` : ''}${i.uso ? `<br><small>→ ${esc(i.uso)}</small>` : ''}</td></tr>`).join('')}</tbody></table>
    <h3>Para comprar, si hace falta</h3><ul>${M.INVENTARIO.comprar.map(i => `<li>${esc(i.que)}</li>`).join('')}</ul><p style="color:var(--muted);font-size:12px">Las flechas (→) son la asignación a cada cocina: la decide Maxi, pieza por pieza. Faltan las fotos y las medidas del tablón de 4″.</p>`;
  const panes = { video3d: videoHTML(), materiales, ayuda: `<h3>Qué es esto</h3><p>Las tres cocinas de Maxi, una al lado de la otra y sin techo, para diseñarlas en detalle con el mismo motor que las casas. <b>Carhué</b> y <b>Arcos</b> no son copias: se recortan al cargar desde sus modelos reales, así que sus paredes, ventanas y estructura siguen a cada casa. <b>Mocoretá</b> no tiene modelo: sale del croquis del 3/11, con lo supuesto marcado en las dudas (D-M1 a D-M7).</p>
    <h3>Ejes</h3><p>x de sur a norte, y de oeste a este, piso de cada cocina en 0. Las tres tienen la mesada principal contra su pared sur: se comparan mirando desde el norte. De oeste a este: Mocoretá (y 0–6,30), Carhué (9,30–17,10), Arcos (20,10–27,55). Cada pieza lleva el prefijo de su casa: <b>MO:</b>, <b>CH:</b>, <b>AR:</b>.</p>
    <h3>Cómo usarlo</h3><ul><li>Tocá una pieza: te muestra qué es y sus medidas. Con <b>✥ Editar</b> la movés, le estirás una cara o la borrás; queda guardado y yo lo leo.</li><li><b>Equipamiento</b>: cada cocina tiene sus escenarios de muebles; podés moverlos, cambiarlos y agregar del catálogo.</li><li><b>Techos</b> prende el cielorraso real de cada cocina (el techo del ala en Carhué, la losa del 2P en Arcos, el supuesto de Mocoretá).</li><li><b>Teclado</b>: W/S avanzar y retroceder, A/D de costado, Q/E bajar y subir, flechas para girar.</li></ul>` };
  const spec = `<span>v<b>${M.META.version}</b> · ${M.META.fecha}</span><span>${parts.length} piezas</span><span>tres cocinas</span><span>${M.DUDAS.length} dudas</span><span>cotas en m</span>`;
  const V = {}; for (const c of M.CASAS) { const { x, y } = c.caja_escena, cx = (x[0] + x[1]) / 2, cy = (y[0] + y[1]) / 2, w = Math.max(x[1] - x[0], y[1] - y[0]);
    V[c.pre] = { label: c.nombre, p: [cx + w * 1.05, 330, cy + w * .85], t: [cx, 60, cy] }; }
  return { parts, panes, spec, joints: [], steps: [],
    selExtra: pp => `<div class="renrow"><button class="btn" data-hide="${pp.id}">Ocultar pieza</button><button class="btn" data-showall>Mostrar todo</button></div>` + N.editorHTML(pp.id),
    selIntro: '<div class="k">Selección</div><h2>Tocá una pieza</h2><p style="margin:0;color:var(--muted);font-size:13px">O un código en cualquier texto.</p>',
    defaultView: 'norte',
    views: { norte: { label: 'Las tres desde el norte', p: [3300, 1700, 1380], t: [200, 40, 1380] }, iso: { label: 'Iso', p: [1500, 1300, 3400], t: [250, 60, 1380] }, planta: { label: 'Planta', p: [280, 3200, 1380.1], t: [280, 0, 1380] }, ...V },
    dims: ({ dimLine }) => { dimLine([0, 2, -40], [535, 2, -40], [0, 0, -8], '5,35'); dimLine([-60, 2, 0], [-60, 2, 630], [-8, 0, 0], '6,30 ?'); dimLine([-60, 2, 930], [-60, 2, 1710], [-8, 0, 0], '7,80'); dimLine([-60, 2, 2021], [-60, 2, 2741.5], [-8, 0, 0], '7,21'); dimLine([15, 53, 2000], [315, 53, 2000], [0, 0, -8], '3,00'); } };
}

const COL = { muro: '#d8d2c6', medianera: '#c9c2b4', tabique: '#e6e0d4', cerco: '#9a9a96', glass: '#9fc4cf', perfil: '#2f3438', puerta: '#8a6a4a', losa: '#cfcac0', tabla1: '#b59672', tabla2: '#9c7c5b', tabla3: '#8a7765', madera: '#a8865c', col: '#9a948a', viga: '#ad6338', techo: '#6f767c', herreria: '#24282b', herraje: '#59616a' };
const root = document.getElementById('modo-3d');
const visor = createVisor({ model: { params, build }, colors: COL, lift: { techo: 300 }, root, radial: 0, far: 40000 });
/* relleno desde abajo: de día ilumina cielorrasos por dentro (noche.js lo maneja como luz de relleno y lo apaga de noche) */
{ const l = new THREE.DirectionalLight(0xfff6ec, .45); l.position.set(300, -1000, 500); visor.scene.add(l); }

/* cortes y vistas: del motor (motor/vistas.js), iguales en todas las casas */
const VI = initVistas(visor, { M, root, pref: 'cocinas', rango: { x: [-150, 700], y: [-150, 2900], z: [-100, 600] }, params: ['techos', 'ep', 'carp'], dirAmb: [.55, .85] });
const applyClips = () => VI.applyClips(), renderVistas = () => VI.renderVistas();
root.addEventListener('click', e => { const h = e.target.closest('[data-hide]'); if (h) { visor.toggleHidden(h.dataset.hide, true); visor.resetSel(); renderVistas(); return; } if (e.target.closest('[data-showall]')) visor.setHidden([]); });

/* nombres propios y ediciones: al cambiar, se reconstruye */
N.bindEditor(root, () => {}); N.onChange(() => { visor.rebuild(); applyClips(); }); ED.onChange(() => { visor.rebuild(); applyClips(); });

/* teclado (WASD, flechas) y «caminar hasta acá» (W): motor/caminar.js, lo prende la barra de herramientas */

try { initMarcas(visor, document.querySelector('#modo-3d .stage')); } catch (e) { console.error('marcas', e); }
try { initRealismo(visor, { piedra: [], ladrillo: [], blanco: [], cats: { madera: ['madera', 120], medianera: ['revoque', 200], muro: ['revoque', 200], losa: ['cemento', 300] } }); } catch (e) { console.error('realismo', e); }
try { initLuz(visor); } catch (e) { console.error('luz', e); }
try { initCalidad(visor); } catch (e) { console.error('calidad', e); }
try { initEquipamiento(visor, document.querySelector('#modo-3d .stage'), { datos: equipCocinas, piso: 0 }); } catch (e) { console.error('equipamiento', e); }
/* sol: Ingeniero Maschwitz (dos de las tres cocinas); x apunta al norte real */
try { initNoche(visor, { lugar: 'Ing. Maschwitz', lat: -34.381, lon: -58.741, tz: -3, norte: 0, inicioDia: true, max: 32 }); } catch (e) { console.error('noche', e); }
/* cámara: se recuerda en este navegador */
{ try { const v = JSON.parse(localStorage.getItem('cocinas-cam') || 'null'); if (v && v.p && v.t) { visor.camera.position.set(...v.p); visor.controls.target.set(...v.t); visor.controls.update(); } } catch (e) {}
  let last = ''; setInterval(() => { const v = visor.getView(); const k = JSON.stringify(v); if (k !== last) { last = k; try { localStorage.setItem('cocinas-cam', k); } catch (e) {} } }, 1000); }
try { initEditor(visor, document.querySelector('#modo-3d .stage'), {}, zN('EP')); } catch (e) { console.error('editor', e); }
try { initSenalar(visor, document.querySelector('#modo-3d .stage')); } catch (e) { console.error('senalar', e); }
try { initMedir(visor, document.querySelector('#modo-3d .stage')); } catch (e) { console.error('medir', e); }
{ let vu = null; try { vu = initVistasUI(); } catch (e) { console.error('vistas', e); }
  try { initToolbar(document.querySelector('#modo-3d .stage'), visor, { vistas: vu, zonas: [] }); } catch (e) { console.error('toolbar', e); } }
try { initViewCube(visor); } catch (e) { console.error('viewcube', e); }
try { initInspector(visor); } catch (e) { console.error('inspector', e); }
try { initSidebar(visor); } catch (e) { console.error('sidebar', e); }
window.__ok3d = true;
