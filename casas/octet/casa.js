/* Octet 3D — arma nodos, tubos, vidrio y regatones del modelo elegido (motor/octet.js) como piezas del visor y arranca los módulos del motor:
   vistas, cortes, medir, señalar, marcas, inspector y barra derecha, iguales que en las casas. La edición la hace motor/octet-editor.js. */
import * as THREE from 'three';
import { createVisor, geo } from './visor3d.js';
import { initSenalar } from './senalar.js';
import { initToolbar } from './toolbar.js';
import { initMedir } from './medir.js';
import { initVistasUI } from './vistasui.js';
import { initVistas } from './vistas.js';
import { initViewCube } from './viewcube.js';
import * as M from './modelo.js';
import * as N from './nombres.js';
import * as O from './octet.js';
import { initOctet } from './octet-editor.js';
import { initMarcas } from './marcas.js';
import { initRealismo } from './realismo.js';
import { initLuz } from './luz.js';
import { initNoche } from './noche.js';
import { initCalidad } from './calidad.js';
import { initInspector } from './inspector.js';
import { initSidebar } from './sidebar.js';

const f2 = cm => (cm / 100).toFixed(2).replace('.', ',');
const fl = v => (+v).toFixed(1).replace('.', ',').replace(/,0$/, '');
/* la semilla: capas de nodos → nodos, unidos con todos los tubos entre vecinos */
const semilla = O.normalizar(M.SEMILLA);
let OE = null;   /* el editor, cuando existe; antes se dibuja la semilla */

const params = [
  { id: 'etq', label: 'Códigos de nodo', type: 'check', value: false, quick: true, group: 'Ver', help: 'Muestra el código (a,b,k) de cada nodo sobre el modelo. Son las coordenadas de la retícula: x = a·L/2, z = b·L/2, altura = k·L/√2.' },
  { id: 'tubos', label: 'Tubos', type: 'check', value: true, quick: true, group: 'Ver' },
  { id: 'nodos', label: 'Nodos', type: 'check', value: true, quick: true, group: 'Ver' },
  { id: 'extras', label: 'Vidrio y regatones', type: 'check', value: true, quick: true, group: 'Ver' },
];

function build(p) {
  const m = OE ? OE.modelo : semilla; const A = O.armar(THREE, m); const parts = [];
  const Pt = (id, name, cat, geos, info, ex = {}) => { const al = N.alias(id); parts.push({ id, name: al ? `${id} · ${al}` : name, alias: al, cat, geos: [].concat(geos), info: { ...info, fn: (N.nota(id) ? `<b>Tu nota:</b> ${N.nota(id)}<br>` : '') + (info.fn || '') }, ...ex }); };
  const TIPO = { full: 'full (12 caras)', arriba: 'half, tubos en la capa y arriba', abajo: 'half, tubos en la capa y abajo' };
  if (p.nodos) for (const n of A.nodos) Pt('N:' + n.key, `nodo ${n.key}`, 'steel', n.geo, { fn: `Nodo ${TIPO[n.tipo]}, ${n.n} tubo(s). ${n.tipo === 'full' ? 'Dodecaedro rómbico: cada cara mira a un vecino.' : 'El dodecaedro cortado: la cara plana es el asiento (vidrio arriba, regatón abajo).'}`, sec: n.tipo, med: `x ${f2(n.pos[0])} · z ${f2(n.pos[2])} · alto ${f2(n.pos[1])}` }, { group: 'Nodos' });
  if (p.tubos) for (const s of A.struts) Pt('S:' + s.key, `tubo ${s.a} → ${s.b}`, 'inox', s.geo, { fn: `Tubo ${O.NOMBRE_DIR[s.dir]}${s.n > 1 ? `, de ${s.n} L (saltea ${s.n - 1} nodo${s.n > 2 ? 's' : ''})` : ''}, de nodo ${s.a} a nodo ${s.b}.`, sec: `Ø ${fl(m.d)}`, med: `corte ${fl(s.Lc)} (de centro a centro ${fl(s.n * m.L)})` }, { group: 'Tubos', opt: { noEdges: true } });
  if (p.extras) for (const x of A.extra) { const t = x.info; Pt('X:' + x.key, x.cat === 'vidrio' ? 'vidrio' : x.cat === 'disco' ? `disco ${x.key.slice(6)}` : `regatón ${x.key.slice(4)}`, x.cat === 'vidrio' ? 'glass' : x.cat === 'disco' ? 'herraje' : 'goma', x.geo,
    x.cat === 'vidrio' ? { fn: 'Apoya en los discos de los nodos de arriba.', med: `${fl(t.x1 - t.x0)} × ${fl(t.z1 - t.z0)} × ${fl(t.e)} · cara de arriba a ${f2(t.y0 + t.e)}` } : x.cat === 'disco' ? { fn: 'Apoyo del vidrio sobre la cara plana del nodo.' } : { fn: 'Regatón bajo la cara plana del nodo.' }, { group: 'Vidrio y apoyos', opt: { noEdges: true } }); }
  const bom = A.bom; const panes = { ayuda: `<h3>Qué es esto</h3><p>Un editor de <b>octet truss</b>: la estructura espacial de tubos iguales y nodos de la mesa de vidrio (foto del 4/11/2026). Es la retícula FCC: cada nodo tiene 12 vecinos a la misma distancia L, 4 en su capa y 4 en cada capa vecina; las capas van a L/√2 y en cada capa los tubos forman una grilla cuadrada de paso L.</p>
    <h3>Cómo usarlo</h3><ul><li><b>⬡ Octet</b> (arriba a la derecha) abre el editor en la barra: herramientas, retícula, bloque semilla, lista de materiales y modelos guardados.</li><li><b>Agregar tubo</b>: tocá un nodo y aparecen en naranja las direcciones libres; tocá una. <b>Quitar</b>: tocá un tubo o un nodo. <b>Elegir y mover</b>: tocá nodos (Shift suma) y movelos con las flechas, de a un paso de la retícula.</li><li>Cada modelo se guarda solo en la base; yo lo leo y lo pongo como mueble en Carhué, Arcos o donde digas.</li><li>Lo demás es el visor de siempre: tocá una pieza para ver su ficha, vistas, cortes, medir, señalar, marcas. <b>Teclado</b>: W/S, A/D, Q/E, flechas.</li></ul>
    <h3>Nodos</h3><p><b>full</b>: 12 caras, una por vecino (dodecaedro rómbico). <b>half</b>: el mismo sólido cortado por un plano horizontal, con 8 caras útiles y una cara plana que hace de asiento: arriba apoya el vidrio sobre discos, abajo lleva regatón. El tipo sale de qué tubos llegan, salvo que lo fijes.</p>
    <h3>Supuestos</h3><ul>${M.DUDAS.map(d => `<li><b>${d.id}</b> ${d.q}</li>`).join('')}</ul>` };
  const spec = `<span>v<b>${M.META.version}</b> · ${M.META.fecha}</span><span><b>${m.nombre || ''}</b></span><span>${A.nodos.length} nodos · ${A.struts.length} tubos</span><span>L ${fl(m.L)}</span><span>${M.DUDAS.length} dudas</span><span>cotas en m</span>`;
  const c = A.caja, cx = (c.x[0] + c.x[1]) / 2, cz = (c.z[0] + c.z[1]) / 2, w = Math.max(80, c.x[1] - c.x[0], c.z[1] - c.z[0], c.y[1]);
  return { parts, panes, spec, joints: [], steps: [], defaultView: 'iso',
    selExtra: pp => `<div class="renrow"><button class="btn" data-hide="${pp.id}">Ocultar pieza</button><button class="btn" data-showall>Mostrar todo</button></div>` + N.editorHTML(pp.id),
    selIntro: '<div class="k">Selección</div><h2>Tocá una pieza</h2><p style="margin:0;color:var(--muted);font-size:13px">Un nodo o un tubo. Con ⬡ Octet editás la estructura.</p>',
    views: { iso: { label: 'Iso', p: [cx + w * 1.3, c.y[1] * .9 + w * .8, cz + w * 1.3], t: [cx, c.y[1] / 2, cz] }, frente: { label: 'Frente', p: [cx, c.y[1] / 2 + 10, cz + w * 2.6], t: [cx, c.y[1] / 2, cz] }, lado: { label: 'Lado', p: [cx + w * 2.6, c.y[1] / 2 + 10, cz], t: [cx, c.y[1] / 2, cz] }, planta: { label: 'Planta', p: [cx, w * 3, cz + .1], t: [cx, 0, cz] }, abajo: { label: 'Desde abajo', p: [cx + w * .6, 26, cz + w * 1.4], t: [cx, c.y[1] * .6, cz] } },
    dims: ({ tag }) => { if (p.etq) for (const n of A.nodos) tag(n.key, [n.pos[0], n.pos[1] + m.R * 1.6, n.pos[2]], 'edge', undefined, 0, 'N:' + n.key); } };
}

/* steel (nodos), inox (tubos) y herraje (discos) son las categorías metálicas del visor */
const COL = { steel: '#a9acaf', inox: '#d3d6d9', glass: '#9fc4cf', herraje: '#c9cdd1', goma: '#1b1c1d' };
const root = document.getElementById('modo-3d');
const visor = createVisor({ model: { params, build }, colors: COL, lift: {}, root, radial: 0, far: 20000 });
{ const l = new THREE.DirectionalLight(0xfff6ec, .35); l.position.set(300, -1000, 500); visor.scene.add(l); }

/* cortes y vistas: del motor */
const VI = initVistas(visor, { M, root, pref: 'octet', rango: { x: [-100, 600], y: [-100, 600], z: [-20, 300] }, params: ['etq', 'tubos', 'nodos', 'extras'], dirAmb: [.55, .85] });
const applyClips = () => VI.applyClips();
root.addEventListener('click', e => { const h = e.target.closest('[data-hide]'); if (h) { visor.toggleHidden(h.dataset.hide, true); visor.resetSel(); return; } if (e.target.closest('[data-showall]')) visor.setHidden([]); });
N.bindEditor(root, () => {}); N.onChange(() => { visor.rebuild(); applyClips(); });

/* teclado: WASD, Q/E, flechas (Shift = rápido) */
{ const keys = new Set(); const K = ['w', 'a', 's', 'd', 'q', 'e', 'arrowleft', 'arrowright', 'arrowup', 'arrowdown'];
  const busy = t => t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
  addEventListener('keydown', e => { const k = e.key.toLowerCase(); if (root.hidden || busy(e.target) || e.metaKey || e.ctrlKey || !K.includes(k)) return; e.preventDefault(); keys.add(k); if (e.shiftKey) keys.add('shift'); window.__despertar && window.__despertar(); });
  addEventListener('keyup', e => { keys.delete(e.key.toLowerCase()); if (!e.shiftKey) keys.delete('shift'); }); addEventListener('blur', () => keys.clear());
  let last = performance.now(); const V = THREE.Vector3, f = new V(), r = new V(), up = new V(0, 1, 0), d = new V();
  const tick = t => { const dt = Math.min(.05, (t - last) / 1000); last = t; if (keys.size) { window.__despertar && window.__despertar(); const cam = visor.camera, tg = visor.controls.target; const sp = Math.max(60, Math.min(800, cam.position.distanceTo(tg) * .5)) * dt;
      f.copy(tg).sub(cam.position).normalize(); r.crossVectors(f, up); if (r.lengthSq() < 1e-6) r.set(1, 0, 0); r.normalize(); d.set(0, 0, 0);
      if (keys.has('w')) d.add(f); if (keys.has('s')) d.sub(f); if (keys.has('d')) d.add(r); if (keys.has('a')) d.sub(r); if (keys.has('e')) d.y += 1; if (keys.has('q')) d.y -= 1;
      if (d.lengthSq()) { d.normalize().multiplyScalar(sp); cam.position.add(d); tg.add(d); }
      const yaw = ((keys.has('arrowleft') ? 1 : 0) - (keys.has('arrowright') ? 1 : 0)) * 1.4 * dt, pit = ((keys.has('arrowup') ? 1 : 0) - (keys.has('arrowdown') ? 1 : 0)) * 1.0 * dt;
      if (yaw || pit) { const v = tg.clone().sub(cam.position); if (yaw) v.applyAxisAngle(up, yaw); if (pit) { const ax = new V().crossVectors(v, up).normalize(); const nv = v.clone().applyAxisAngle(ax, pit); if (Math.abs(Math.asin(nv.clone().normalize().y)) < 1.45) v.copy(nv); } tg.copy(cam.position).add(v); }
      visor.controls.update(); } requestAnimationFrame(tick); }; requestAnimationFrame(tick); }

const stage = document.querySelector('#modo-3d .stage');
try { initMarcas(visor, stage); } catch (e) { console.error('marcas', e); }
try { initRealismo(visor, { piedra: [], ladrillo: [], blanco: [], cats: {}, suelo: 'cemento' }); } catch (e) { console.error('realismo', e); }
try { initLuz(visor); } catch (e) { console.error('luz', e); }
try { initCalidad(visor); } catch (e) { console.error('calidad', e); }
try { initNoche(visor, { lugar: 'Ing. Maschwitz', lat: -34.381, lon: -58.741, tz: -3, norte: 0, inicioDia: true, max: 32 }); } catch (e) { console.error('noche', e); }
{ try { const v = JSON.parse(localStorage.getItem('octet-cam') || 'null'); if (v && v.p && v.t) { visor.camera.position.set(...v.p); visor.controls.target.set(...v.t); visor.controls.update(); } } catch (e) {}
  let last = ''; setInterval(() => { const v = visor.getView(); const k = JSON.stringify(v); if (k !== last) { last = k; try { localStorage.setItem('octet-cam', k); } catch (e) {} } }, 1000); }
/* el editor: cada cambio del modelo reconstruye las piezas */
try { OE = initOctet(visor, stage, { pref: 'octet', inicial: semilla, alCambiar: () => { visor.rebuild(); applyClips(); } }); } catch (e) { console.error('octet', e); }
try { initSenalar(visor, stage); } catch (e) { console.error('senalar', e); }
try { initMedir(visor, stage); } catch (e) { console.error('medir', e); }
{ let vu = null; try { vu = initVistasUI(); } catch (e) { console.error('vistas', e); }
  try { initToolbar(stage, visor, { vistas: vu, zonas: [] }); } catch (e) { console.error('toolbar', e); } }
try { initViewCube(visor); } catch (e) { console.error('viewcube', e); }
try { initInspector(visor); } catch (e) { console.error('inspector', e); }
try { initSidebar(visor); } catch (e) { console.error('sidebar', e); }
/* el editor abierto al entrar, que es para lo que está la página */
setTimeout(() => { try { if (OE && !OE.abierto) OE.toggle(true); } catch (e) {} }, 600);
window.__ok3d = true;
