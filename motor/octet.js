/* Octet truss (Maxi 4/11/2026, la mesa de vidrio sobre tubos de aluminio): estructura espacial de tubos iguales y nodos.
   Es la retícula FCC: cada nodo tiene 12 vecinos a la misma distancia L (el largo base), 4 en su capa y 4 en cada capa vecina.
   Este módulo es puro (sin DOM): la retícula, qué conexiones valen, la geometría de nodos y tubos y la lista de materiales.
   Lo usan el editor (octet-editor.js), la escena casas/octet y el mueble «octet» de muebles.js (para llevar un modelo a cualquier casa).

   Coordenadas de retícula (a, b, k), enteras, con a ≡ b ≡ k (mod 2):
     x = a · L/2    z = b · L/2    y (altura) = k · L/√2
   Así las capas son horizontales (k) y en cada capa los tubos forman una grilla cuadrada de paso L alineada con x y z, como en la mesa.
   Las 12 direcciones: 4 en la capa (±2,0,0) (0,±2,0) y 8 inclinadas (±1,±1,±1).
   Un tubo puede saltear nodos (n = 2, 3…): va de un nodo a otro sobre una misma dirección, a n·L.

   Nodos: el sólido natural de la FCC es el dodecaedro rómbico, 12 caras rómbicas, cada una perpendicular a un vecino, a distancia R del centro.
     full: las 12 caras. half: el mismo sólido cortado por un plano horizontal, con 8 caras útiles (4 de la capa y 4 de un solo lado) y una cara plana
     en el otro lado, que sirve de asiento (apoyo del vidrio arriba, regatón abajo). El tipo sale de qué tubos llegan, salvo que el nodo lo fije.
   Supuesto (DUDA a Maxi): la forma real del nodo, R, Ø del tubo y cuánto se descuenta del largo nominal salen de la foto; hace falta un nodo y una punta
   de tubo medidos con calibre. Por ahora: R = 2,6, tubo Ø 1,6 y el tubo va de cara a cara (largo de corte = n·L − 2R − descuento).

   Modelo (lo que se guarda): { v:1, nombre, L, d, R, desc, nodos:{ 'a,b,k': {t?: 'full'|'arriba'|'abajo'} }, struts:[ ['a,b,k','a,b,k'] ],
                                tapa:{on,e,vuelo,disco,ancho,fondo,dx,dz}, pies:{on,h} }   (ancho y fondo 0 = sale de los nodos más el vuelo) */

export const S2 = Math.SQRT1_2;
/* las 12 direcciones, en (a,b,k) */
export const DIRS = [[2, 0, 0], [-2, 0, 0], [0, 2, 0], [0, -2, 0],
  [1, 1, 1], [1, -1, 1], [-1, 1, 1], [-1, -1, 1], [1, 1, -1], [1, -1, -1], [-1, 1, -1], [-1, -1, -1]];
export const NOMBRE_DIR = ['+x', '−x', '+z', '−z', '↑ +x+z', '↑ +x−z', '↑ −x+z', '↑ −x−z', '↓ +x+z', '↓ +x−z', '↓ −x+z', '↓ −x−z'];

export const key = (a, b, k) => `${a},${b},${k}`;
export const parse = s => s.split(',').map(Number);
export const esNodo = (a, b, k) => Number.isInteger(a) && Number.isInteger(b) && Number.isInteger(k) && ((a - b) % 2 === 0) && ((a - k) % 2 === 0);
export const pos = (a, b, k, L) => [a * L / 2, k * L * S2, b * L / 2];   /* [x, y, z] en cm */
export const posK = (s, L) => pos(...parse(s), L);
/* B − A = n · dir → { dir (índice), n }; null si no están sobre una dirección de la retícula */
export function dirEntre(A, B) { const a = parse(A), b = parse(B), d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  for (let i = 0; i < 12; i++) { const D = DIRS[i]; let n = null, ok = true;
    for (let c = 0; c < 3; c++) { if (D[c] === 0) { if (d[c] !== 0) { ok = false; break; } continue; } const q = d[c] / D[c]; if (!Number.isInteger(q) || q <= 0 || (n != null && q !== n)) { ok = false; break; } n = q; }
    if (ok && n) return { dir: i, n }; } return null; }
export const mover = (s, dir, n = 1) => { const [a, b, k] = parse(s), D = DIRS[dir]; return key(a + D[0] * n, b + D[1] * n, k + D[2] * n); };
export const strutKey = (A, B) => (A < B ? A + '|' + B : B + '|' + A);
export const nodoEnStrut = (st, s) => { const [A, B] = st.split('|'); return A === s || B === s; };
/* un strut de n > 1 pasa por nodos intermedios: se devuelven (para marcar que no se puede poner un nodo ahí sin cortar el tubo) */
export function intermedios(st) { const [A, B] = st.split('|'), r = dirEntre(A, B); if (!r || r.n < 2) return []; const out = []; for (let i = 1; i < r.n; i++) out.push(mover(A, r.dir, i)); return out; }

/* ---------- modelo ---------- */
export const vacio = (nombre = 'Nuevo') => ({ v: 1, nombre, L: 50, d: 1.6, R: 2.6, desc: 0, nodos: {}, struts: [], tapa: { on: false, e: 1, vuelo: 5, disco: 1.5, ancho: 0, fondo: 0, dx: 0, dz: 0 }, pies: { on: true, h: 1.5 } });
export function normalizar(m) { const o = { ...vacio(m && m.nombre), ...(m || {}) }; o.nodos = { ...(o.nodos || {}) }; o.struts = [...new Set((o.struts || []).map(s => Array.isArray(s) ? strutKey(s[0], s[1]) : s))];
  o.tapa = { ...vacio().tapa, ...(o.tapa || {}) }; o.pies = { ...vacio().pies, ...(o.pies || {}) };
  for (const st of o.struts) for (const s of st.split('|')) if (!o.nodos[s]) o.nodos[s] = {};
  /* atajo para escribir modelos a mano: capas:[{k, a:[…], b:[…]}] pone esos nodos y los une con todos los tubos entre vecinos */
  if (Array.isArray(o.capas)) { for (const c of o.capas) for (const a of c.a) for (const b of c.b) if (esNodo(a, b, c.k)) o.nodos[key(a, b, c.k)] = o.nodos[key(a, b, c.k)] || {}; const u = conectar(o); o.struts = u.struts; delete o.capas; }
  return o; }
export const copiar = m => JSON.parse(JSON.stringify(m));
/* qué struts llegan a cada nodo, por dirección (índice 0..11 → strut o undefined) */
export const INV = DIRS.map(D => DIRS.findIndex(E => E[0] === -D[0] && E[1] === -D[1] && E[2] === -D[2]));   /* índice de la dirección opuesta */
export function incidencia(m) { const I = {}; for (const s in m.nodos) I[s] = new Array(12).fill(undefined);
  for (const st of m.struts) { const [A, B] = st.split('|'), r = dirEntre(A, B); if (!r) continue; if (I[A]) I[A][r.dir] = st; if (I[B]) I[B][INV[r.dir]] = st; }
  return I; }
/* tipo de nodo: fijado en m.nodos[s].t, o deducido: con tubos arriba y abajo es full; si no, half mirando hacia donde tiene tubos (si no tiene inclinados, half «arriba» por defecto) */
export function tipoNodo(m, s, I) { const t = m.nodos[s] && m.nodos[s].t; if (t && t !== 'auto') return t; const inc = (I || incidencia(m))[s] || [];
  const up = inc.slice(4, 8).some(Boolean), dn = inc.slice(8, 12).some(Boolean); return up && dn ? 'full' : dn ? 'abajo' : 'arriba'; }
/* lo que falta para que la conexión sea válida: null si está bien */
export function validarStrut(m, A, B) { const r = dirEntre(A, B); if (!r) return 'los dos nodos no están sobre una dirección de la retícula';
  if (!esNodo(...parse(A)) || !esNodo(...parse(B))) return 'nodo fuera de la retícula'; if (m.struts.includes(strutKey(A, B))) return 'ya existe';
  for (const q of intermedios(strutKey(A, B))) if (m.nodos[q]) return `pasa por el nodo ${q}`; return null; }

/* ---------- operaciones (devuelven un modelo nuevo; el editor guarda el anterior para deshacer) ---------- */
export function agregarStrut(m, A, B) { const err = validarStrut(m, A, B); if (err) return { m, err }; const o = copiar(m); o.nodos[A] = o.nodos[A] || {}; o.nodos[B] = o.nodos[B] || {}; o.struts.push(strutKey(A, B)); return { m: o }; }
export function quitarStrut(m, st, limpiar = true) { const o = copiar(m); o.struts = o.struts.filter(x => x !== st);
  if (limpiar) for (const s of st.split('|')) if (!o.struts.some(x => nodoEnStrut(x, s))) delete o.nodos[s]; return { m: o }; }
export function quitarNodo(m, s) { const o = copiar(m); o.struts = o.struts.filter(x => !nodoEnStrut(x, s)); delete o.nodos[s];
  for (const q of Object.keys(o.nodos)) if (q !== s && !o.struts.some(x => nodoEnStrut(x, q))) delete o.nodos[q]; return { m: o }; }
export function agregarNodo(m, s) { if (!esNodo(...parse(s))) return { m, err: 'fuera de la retícula' }; const o = copiar(m); o.nodos[s] = o.nodos[s] || {}; return { m: o }; }
/* trasladar un conjunto de nodos por un vector de la retícula (d con d0 ≡ d1 ≡ d2 mod 2); los tubos entre dos nodos movidos se mueven, los que unen uno movido con uno quieto se rehacen si siguen sobre una dirección y si no se pierden (se avisa) */
export function trasladar(m, keys, d) { if (!esNodo(...d)) return { m, err: 'ese paso no es de la retícula' }; const S = new Set(keys), mv = s => { const [a, b, k] = parse(s); return key(a + d[0], b + d[1], k + d[2]); };
  const o = copiar(m); const nodos = {}; for (const s in o.nodos) { const t = S.has(s) ? mv(s) : s; if (nodos[t]) return { m, err: `el nodo ${t} ya está ocupado` }; nodos[t] = o.nodos[s]; }
  const struts = [], perdidos = []; for (const st of o.struts) { const [A, B] = st.split('|'); const A2 = S.has(A) ? mv(A) : A, B2 = S.has(B) ? mv(B) : B; if (A2 === B2) { perdidos.push(st); continue; }
    if (!dirEntre(A2, B2)) { perdidos.push(st); continue; } const k2 = strutKey(A2, B2); if (!struts.includes(k2)) struts.push(k2); }
  o.nodos = nodos; o.struts = struts; const ok = normalizar(o); return { m: ok, perdidos }; }
/* une con tubos (n = 1) todos los pares de nodos vecinos que existen y no están unidos */
export function conectar(m) { const o = copiar(m); for (const s in o.nodos) for (let i = 0; i < 12; i++) { const q = mover(s, i); if (!o.nodos[q]) continue; const st = strutKey(s, q); if (!o.struts.includes(st)) o.struts.push(st); } return o; }
/* bloque entero de nx × nz celdas y nc capas (desde k0), con todos los tubos entre vecinos */
export function bloque(m, nx, nz, nc, k0 = 0, a0 = 0, b0 = 0) { const o = copiar(m); const en = (a, b, k) => a >= a0 && a <= a0 + 2 * nx && b >= b0 && b <= b0 + 2 * nz && k >= k0 && k < k0 + nc;
  const keys = []; for (let k = k0; k < k0 + nc; k++) for (let a = a0; a <= a0 + 2 * nx; a++) for (let b = b0; b <= b0 + 2 * nz; b++) if (esNodo(a, b, k)) { keys.push(key(a, b, k)); o.nodos[key(a, b, k)] = o.nodos[key(a, b, k)] || {}; }
  for (const s of keys) for (let i = 0; i < 12; i++) { const q = mover(s, i); const [a, b, k] = parse(q); if (!en(a, b, k)) continue; const st = strutKey(s, q); if (!o.struts.includes(st)) o.struts.push(st); }
  return o; }

/* ---------- geometría (three) ---------- */
function cil(THREE, A, B, r, seg = 12) { const a = new THREE.Vector3(...A), b = new THREE.Vector3(...B), L = a.distanceTo(b); const g = new THREE.CylinderGeometry(r, r, L, seg); g.translate(0, L / 2, 0);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize())); g.translate(a.x, a.y, a.z); g.userData = { rod: true, a, b, L }; return g; }
/* dodecaedro rómbico (o su mitad) en coordenadas de mundo, centrado en c. side: 0 full, +1 half con tubos arriba (corte abajo), −1 half con tubos abajo (corte arriba) */
export function geoNodo(THREE, c, R, side = 0) { const s = R * S2; const W = ([i, j, k]) => [c[0] + (i + j) * S2, c[1] + k, c[2] + (i - j) * S2]; /* retícula (i,j,k) → mundo */
  const tri = []; const push = (P, Q, T, n) => { /* orientada hacia n */ const u = [Q[0] - P[0], Q[1] - P[1], Q[2] - P[2]], v = [T[0] - P[0], T[1] - P[1], T[2] - P[2]], nn = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    if (nn[0] * n[0] + nn[1] * n[1] + nn[2] * n[2] < 0) tri.push(P, T, Q); else tri.push(P, Q, T); };
  for (let p = -1; p <= 1; p += 2) for (let q = -1; q <= 1; q += 2) for (const [u, v, w] of [[0, 1, 2], [0, 2, 1], [1, 2, 0]]) { const D = [0, 0, 0]; D[u] = p; D[v] = q; /* cara perpendicular a D, con eje nulo w */
    const V1 = [0, 0, 0]; V1[u] = 2 * s * p; const V3 = [0, 0, 0]; V3[v] = 2 * s * q; const V2 = [D[0] * s, D[1] * s, D[2] * s]; V2[w] = s; const V4 = [D[0] * s, D[1] * s, D[2] * s]; V4[w] = -s;
    if (side && D[2] === -side) { /* cara del lado cortado: se pierde el vértice del eje k (0,0,−2s·side) y queda un triángulo */ const q = u === 2 ? [V3, V2, V4] : [V1, V2, V4]; push(q[0], q[1], q[2], D); continue; }
    push(V1, V2, V3, D); push(V1, V3, V4, D); }
  if (side) { const z = -side * s, Q = [[s, s, z], [s, -s, z], [-s, -s, z], [-s, s, z]], n = [0, 0, -side]; push(Q[0], Q[1], Q[2], n); push(Q[0], Q[2], Q[3], n); }
  const g = new THREE.BufferGeometry().setFromPoints(tri.map(p => new THREE.Vector3(...W(p)))); g.computeVertexNormals(); return g; }

/* todo lo que se dibuja: nodos, tubos, apoyos del vidrio, tapa y regatones; y la caja y la lista de materiales. Las coordenadas vienen con el piso en y = 0 (el punto más bajo) y centradas en x, z si centrar = true */
/* el marco de un modelo, sin geometría: posiciones P (cm, sin corregir), tipos, incidencia y la corrección T (piso en y = 0 y, si se pide, centrado en x y z) */
export function marco(m0, { centrar = false } = {}) { const m = normalizar(m0), L = m.L, R = m.R, I = incidencia(m), P = {}; for (const s in m.nodos) P[s] = pos(...parse(s), L);
  const ks = Object.keys(m.nodos).map(s => parse(s)[2]); const kmin = ks.length ? Math.min(...ks) : 0, kmax = ks.length ? Math.max(...ks) : 0;
  const tipos = {}; for (const s in m.nodos) tipos[s] = tipoNodo(m, s, I);
  /* piso: el punto más bajo de los nodos de la capa de abajo (half arriba apoya por su cara plana a R/√2 bajo el centro; full y half abajo llegan al vértice, a R·√2) más el regatón */
  const bajo = s => { const t = tipos[s]; return P[s][1] - R * (t === 'arriba' ? S2 : 2 * S2) - (m.pies.on && t === 'arriba' ? m.pies.h : 0); };
  const piso = ks.length ? Math.min(...Object.keys(m.nodos).filter(s => parse(s)[2] === kmin).map(bajo)) : 0;
  let dx = 0, dz = 0; if (centrar && ks.length) { const xs = Object.values(P).map(p => p[0]), zs = Object.values(P).map(p => p[2]); dx = -(Math.min(...xs) + Math.max(...xs)) / 2; dz = -(Math.min(...zs) + Math.max(...zs)) / 2; }
  const T = p => [p[0] + dx, p[1] - piso, p[2] + dz];
  return { m, L, R, I, P, tipos, kmin, kmax, piso, T }; }

export function armar(THREE, m0, opt = {}) { const { m, L, R, I, P, tipos, kmin, kmax, T } = marco(m0, opt); const nodos = [], struts = [], extra = [];
  for (const s in m.nodos) { const t = tipos[s], c = T(P[s]); nodos.push({ key: s, tipo: t, pos: c, geo: geoNodo(THREE, c, R, t === 'full' ? 0 : t === 'arriba' ? 1 : -1), n: (I[s] || []).filter(Boolean).length }); }
  for (const st of m.struts) { const [A, B] = st.split('|'), r = dirEntre(A, B); if (!r) continue; const a = T(P[A]), b = T(P[B]); const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], Lt = Math.hypot(...u); const un = u.map(v => v / Lt);
    const a2 = [a[0] + un[0] * R, a[1] + un[1] * R, a[2] + un[2] * R], b2 = [b[0] - un[0] * R, b[1] - un[1] * R, b[2] - un[2] * R]; const Lc = r.n * L - 2 * R - (m.desc || 0);
    struts.push({ key: st, a: A, b: B, dir: r.dir, n: r.n, Lc, geo: cil(THREE, a2, b2, m.d / 2) }); }
  /* arriba: los nodos de la capa más alta que miran hacia abajo tienen cara plana arriba: ahí van los discos y el vidrio */
  const arriba = Object.keys(m.nodos).filter(s => parse(s)[2] === kmax && tipos[s] === 'abajo'); let tapa = null;
  if (m.tapa.on && arriba.length) { const yc = T(P[arriba[0]])[1] + R * S2; for (const s of arriba) { const c = T(P[s]); const g = new THREE.CylinderGeometry(3.5, 3.5, m.tapa.disco, 20); g.translate(c[0], yc + m.tapa.disco / 2, c[2]); extra.push({ key: 'disco:' + s, cat: 'disco', geo: g }); }
    const xs = arriba.map(s => T(P[s])[0]), zs = arriba.map(s => T(P[s])[2]), v = m.tapa.vuelo, y0 = yc + m.tapa.disco;
    /* medidas: con ancho y fondo (cm) el vidrio tiene ese tamaño, centrado en los nodos de arriba y corrido dx, dz; sin ellas, la caja de los nodos más el vuelo */
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2 + (m.tapa.dx || 0), cz = (Math.min(...zs) + Math.max(...zs)) / 2 + (m.tapa.dz || 0), an = m.tapa.ancho > 0 ? m.tapa.ancho : Math.max(...xs) - Math.min(...xs) + 2 * v, fo = m.tapa.fondo > 0 ? m.tapa.fondo : Math.max(...zs) - Math.min(...zs) + 2 * v;
    const x0 = cx - an / 2, x1 = cx + an / 2, z0 = cz - fo / 2, z1 = cz + fo / 2;
    const g = new THREE.BoxGeometry(x1 - x0, m.tapa.e, z1 - z0); g.translate((x0 + x1) / 2, y0 + m.tapa.e / 2, (z0 + z1) / 2); tapa = { x0, x1, z0, z1, y0, e: m.tapa.e }; extra.push({ key: 'tapa', cat: 'vidrio', geo: g, info: tapa }); }
  const abajo = Object.keys(m.nodos).filter(s => parse(s)[2] === kmin && tipos[s] === 'arriba');
  if (m.pies.on) for (const s of abajo) { const c = T(P[s]); const g = new THREE.CylinderGeometry(1.6, 1.3, m.pies.h, 14); g.translate(c[0], c[1] - R * S2 - m.pies.h / 2, c[2]); extra.push({ key: 'pie:' + s, cat: 'goma', geo: g }); }
  /* lista de materiales */
  const porLargo = {}; for (const s of struts) { const k = s.Lc.toFixed(1); porLargo[k] = (porLargo[k] || 0) + 1; }
  const bom = { tubos: Object.entries(porLargo).map(([Lc, n]) => ({ Lc: +Lc, n })).sort((a, b) => a.Lc - b.Lc), full: nodos.filter(n => n.tipo === 'full').length, half: nodos.filter(n => n.tipo !== 'full').length, discos: m.tapa.on ? arriba.length : 0, pies: m.pies.on ? abajo.length : 0,
    tubosTotal: struts.length, metros: struts.reduce((a, s) => a + s.Lc, 0) / 100, tapa };
  const xs = nodos.map(n => n.pos[0]), ys = nodos.map(n => n.pos[1]), zs = nodos.map(n => n.pos[2]);
  const caja = nodos.length ? { x: [Math.min(...xs) - R, Math.max(...xs) + R], y: [0, (tapa ? tapa.y0 + tapa.e : Math.max(...ys) + R * 1.42)], z: [Math.min(...zs) - R, Math.max(...zs) + R] } : { x: [0, 0], y: [0, 0], z: [0, 0] };
  return { m, nodos, struts, extra, bom, caja, tipos, I, T, P };
}

/* texto de la lista de materiales, en castellano */
export function bomHTML(bom, m) { const f = v => (v / 100).toFixed(3).replace('.', ','); const fl = v => v.toFixed(1).replace('.', ',');
  const tubos = bom.tubos.map(t => `<tr><td>${t.n} tubos</td><td>Ø ${fl(m.d)} × <b>${fl(t.Lc)}</b> cm</td></tr>`).join('');
  return `<table class="octBom"><tbody>${tubos}<tr><td>${bom.full} nodos</td><td>full (12 caras)</td></tr><tr><td>${bom.half} nodos</td><td>half (8 caras)</td></tr>${bom.discos ? `<tr><td>${bom.discos} discos</td><td>apoyo del vidrio</td></tr>` : ''}${bom.pies ? `<tr><td>${bom.pies} regatones</td><td></td></tr>` : ''}${bom.tapa ? `<tr><td>vidrio</td><td>${fl(bom.tapa.x1 - bom.tapa.x0)} × ${fl(bom.tapa.z1 - bom.tapa.z0)} × ${fl(bom.tapa.e)}</td></tr>` : ''}</tbody></table>
  <div class="s">${bom.tubosTotal} tubos, ${f(bom.metros * 100)} m de tubo en total · largo base L = ${fl(m.L)}, R del nodo ${fl(m.R)}${m.desc ? `, descuento ${fl(m.desc)}` : ''}: cada tubo mide n·L − 2R${m.desc ? ' − descuento' : ''}.</div>`; }
