/* Apoyos: que nada flote ni atraviese lo que no debe (guía de diseño 9, «Entender el edificio»).
   Lee casas/<casa>/modelo.js y revisa el camino de las cargas:
   - columnas y postes: el pie apoya en una losa, una viga o el terreno, y la cabeza llega al fondo de una losa o viga;
   - tensores: cuelgan de una viga o losa y toman una viga;
   - vigas: cada punta apoya en un muro, una columna u otra viga, o tiene un tensor/columna a menos de 1,20 (voladizo);
   - muros que no arrancan del terreno: apoyan en una losa o viga;
   - escaleras: el pie apoya en el piso de abajo y la cabeza llega al borde del piso de arriba;
   - columnas, tensores y escaleras no se cruzan entre sí.
   Uso: node herramientas/pruebas/apoyos.mjs <casa>   (sale con código 1 si algo no apoya) */
import path from 'path';
import { pathToFileURL } from 'url';
const casa = process.argv[2] || 'arcos';
const M = await import(pathToFileURL(path.resolve('casas', casa, 'modelo.js')).href);
const TOL = 2.5, sec = s => { const m = String(s || '').match(/(\d+(?:[.,]\d+)?)\s*[×x]\s*(\d+(?:[.,]\d+)?)/); return m ? [+m[1].replace(',', '.'), +m[2].replace(',', '.')] : [20, 20]; };
const dentro = (x, y, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
const enLosa = (l, x, y) => dentro(x, y, l.poly) && !(l.huecos || []).some(h => dentro(x, y, h));
const nz = n => (M.NIVELES[n] || {}).z ?? 0;
const LOSAS = M.LOSAS || [], EST = M.ESTRUCTURA || [], MUROS = M.MUROS || [], ESC = M.ESCALERAS || [];
const COL = EST.filter(s => s.tipo === 'columna' && s.z), TEN = EST.filter(s => s.tipo === 'tensor' && s.z);
const SUELO = (M.IMPLANTACION || []).filter(o => o.poly);
/* sólo las vigas con sección («20×60») y altura: las que describen un conjunto («cabios cada 65») no se pueden revisar */
const seRevisa = v => /^\s*\d+(?:[.,]\d+)?\s*[×x]\s*\d/.test(String(v.sec || '')) && typeof v.z === 'number';
const sinDatos = EST.filter(s => s.tipo === 'viga' && !seRevisa(s)).map(s => s.id);
const VIG = EST.filter(s => s.tipo === 'viga' && seRevisa(s)).map(v => { const [w, h] = sec(v.sec), L = Math.hypot(v.b[0] - v.a[0], v.b[1] - v.a[1]), ux = (v.b[0] - v.a[0]) / L, uy = (v.b[1] - v.a[1]) / L;
  return { ...v, w, h, L, ux, uy, bot: v.z - h, tiene: (x, y, m = 0) => { const dx = x - v.a[0], dy = y - v.a[1], t = dx * ux + dy * uy, n = Math.abs(-dx * uy + dy * ux); return t >= -m && t <= L + m && n <= w / 2 + m; } }; });
const segDist = (x, y, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy))); return Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy); };
const muroZ = m => { const z0 = m.z0 ?? nz(m.nivel), top = Array.isArray(m.top) ? Math.max(...m.top) : (m.top ?? z0 + 260); return [z0, top]; };
const errores = [], ok = [];
/* lo que ya está preguntado en DUDAS queda como pendiente, no como error: se resuelve con la respuesta */
const DUDA = id => (M.DUDAS || []).find(d => (d.ref || []).includes(id));
const pendientes = [];
const mal = (id, q) => { const d = DUDA(id); (d ? pendientes : errores).push(`${id}: ${q}${d ? ` (pregunta ${d.id})` : ''}`); };

/* lo que hay en un punto a una altura: arriba de algo (apoyo) o debajo de algo (techo) */
const apoyoEn = (x, y, z, m = 0) => {
  if (z <= 0.5) return 'terreno';
  for (const o of SUELO) if (Math.abs((o.z || 0) - z) <= TOL && dentro(x, y, o.poly)) return o.id;
  for (const l of LOSAS) if (Math.abs(l.z - z) <= TOL && enLosa(l, x, y)) return l.id;
  for (const v of VIG) if (Math.abs(v.z - z) <= TOL && v.tiene(x, y, m)) return v.id;
  for (const w of MUROS) { const [, t] = muroZ(w); if (Math.abs(t - z) <= TOL && segDist(x, y, w.a, w.b) <= w.e / 2 + m) return w.id; }
  return null; };
const techoEn = (x, y, z, m = 0) => {
  for (const l of LOSAS) if (Math.abs(l.z - l.e - z) <= TOL && enLosa(l, x, y)) return l.id;
  for (const v of VIG) if (Math.abs(v.bot - z) <= TOL && v.tiene(x, y, m)) return v.id;
  return null; };

/* columnas */
for (const c of COL) { const [w, d] = sec(c.sec), [x, y] = c.pos, [z0, z1] = c.z;
  const pie = apoyoEn(x, y, z0, Math.min(w, d) / 2), cab = techoEn(x, y, z1, Math.min(w, d) / 2);
  if (!pie) mal(c.id, `el pie (+${(z0 / 100).toFixed(2)}) no apoya en ninguna losa, viga ni muro`);
  if (!cab) mal(c.id, `la cabeza (+${(z1 / 100).toFixed(2)}) no llega al fondo de ninguna losa ni viga`);
  if (pie && cab) ok.push(`${c.id} ${pie} → ${cab}`); }
/* tensores */
for (const t of TEN) { const [x, y] = t.pos, [z0, z1] = t.z;
  const cuelga = techoEn(x, y, z1), toma = VIG.find(v => Math.abs(v.bot - z0) <= TOL && v.tiene(x, y, 1));
  if (!cuelga) mal(t.id, 'no cuelga de ninguna viga ni losa');
  if (!toma) mal(t.id, 'no toma ninguna viga abajo');
  if (cuelga && toma) ok.push(`${t.id} ${toma.id} ↑ ${cuelga}`); }
/* vigas: cada punta */
for (const v of VIG) for (const [px, py, k] of [[...v.a, 'a'], [...v.b, 'b']]) {
  const zr = [v.bot - TOL, v.z + TOL], m = 15;
  const col = COL.find(c => { const [w, d] = sec(c.sec); return Math.abs(c.pos[0] - px) <= w / 2 + m && Math.abs(c.pos[1] - py) <= d / 2 + m && c.z[1] >= zr[0] - TOL && c.z[0] <= zr[0]; });
  const muro = MUROS.find(w => { const [a, b] = muroZ(w); return segDist(px, py, w.a, w.b) <= w.e / 2 + m && a <= zr[0] + TOL && b >= zr[0]; });
  const viga = VIG.find(o => o !== v && o.tiene(px, py, 5) && o.bot <= v.bot + TOL && o.z >= v.bot - TOL);
  const cerca = [...TEN.filter(t => v.tiene(t.pos[0], t.pos[1], 1)), ...COL.filter(c => v.tiene(c.pos[0], c.pos[1], 10) && Math.abs(c.z[1] - v.bot) <= TOL)].some(s => Math.hypot(s.pos[0] - px, s.pos[1] - py) <= 120);
  if (!(col || muro || viga || cerca)) mal(v.id, `la punta ${k} (${px}, ${py}) no apoya: ni muro, ni columna, ni viga, ni tensor a menos de 1,20`); }
/* muros que no arrancan del terreno */
for (const w of MUROS) { const [z0] = muroZ(w); if (z0 <= nz('PB') + TOL) continue;
  const n = 5, pts = [...Array(n)].map((_, i) => [w.a[0] + (w.b[0] - w.a[0]) * (i + .5) / n, w.a[1] + (w.b[1] - w.a[1]) * (i + .5) / n]);
  const malos = pts.filter(([x, y]) => !apoyoEn(x, y, z0, w.e / 2)); if (malos.length) mal(w.id, `${malos.length} de ${n} tramos del pie (+${(z0 / 100).toFixed(2)}) sin losa ni viga abajo`); }
/* escaleras: el pie en el piso de abajo, la cabeza contra el borde del de arriba */
for (const e of ESC.filter(e => e.x && e.y && e.z)) { const [x0, x1] = e.x, [y0, y1] = e.y, [z0, z1] = e.z, xm = (x0 + x1) / 2, sg = Math.sign(y1 - y0);
  const [yb, zb, sb, yt, zt, st] = z1 > z0 ? [y0, z0, -sg, y1, z1, sg] : [y1, z1, sg, y0, z0, -sg];
  const pie = [x0 + 5, xm, x1 - 5].every(x => apoyoEn(x, yb + sb * 3, zb) || apoyoEn(x, yb - sb * 3, zb));
  const cab = e.llega ? LOSAS.some(l => l.id === e.llega) : [x0 + 5, xm, x1 - 5].every(x => LOSAS.some(l => Math.abs(l.z - zt) <= TOL && enLosa(l, x, yt + st * 3)) || SUELO.some(o => Math.abs((o.z || 0) - zt) <= TOL && dentro(x, yt + st * 3, o.poly)));
  if (!pie) mal(e.id, `el pie (+${(zb / 100).toFixed(2)}) no apoya en todo su ancho`);
  if (!cab) mal(e.id, `la cabeza (+${(zt / 100).toFixed(2)}) no llega al borde de una losa en todo su ancho`);
  if (pie && cab) ok.push(`${e.id} apoya`); }
/* cruces: columnas, tensores y escaleras */
const caja = s => { if (s.tipo === 'columna' || s.tipo === 'tensor') { const [w, d] = s.tipo === 'tensor' ? [2, 2] : sec(s.sec); return [s.pos[0] - w / 2, s.pos[0] + w / 2, s.pos[1] - d / 2, s.pos[1] + d / 2, s.z[0], s.z[1]]; }
  return [Math.min(...s.x), Math.max(...s.x), Math.min(...s.y), Math.max(...s.y), Math.min(...s.z), Math.max(...s.z)]; };
const cruza = (a, b) => a[0] < b[1] - .5 && b[0] < a[1] - .5 && a[2] < b[3] - .5 && b[2] < a[3] - .5 && a[4] < b[5] - .5 && b[4] < a[5] - .5;
const todo = [...COL, ...TEN, ...ESC];
for (let i = 0; i < todo.length; i++) for (let j = i + 1; j < todo.length; j++) if (cruza(caja(todo[i]), caja(todo[j]))) mal(todo[i].id, `se cruza con ${todo[j].id}`);

console.log(`apoyos de ${casa}: ${ok.length} bien, ${errores.length} mal, ${pendientes.length} pendientes de una duda`);
for (const e of errores) console.log('  ✗ ' + e);
for (const e of pendientes) console.log('  ? ' + e);
if (sinDatos.length) console.log(`  · sin sección o altura, no se revisan: ${sinDatos.join(', ')}`);
if (process.argv.includes('-v')) for (const o of ok) console.log('  ✓ ' + o);
process.exit(errores.length ? 1 : 0);
