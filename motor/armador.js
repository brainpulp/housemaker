/* Armador genérico: arma las piezas 3D de una casa a partir de las tablas de su modelo.js.
   Nació con Arcos 4264 (primer paso de DEUDA.md punto 2). Carhué todavía usa su casa.js propio.

   Tablas que entiende (unidades cm; planta x,y; altura z; en 3D X = x, Y = z, Z = y):
     NIVELES  {id:{nombre,z}}
     MUROS    {id,nivel,a,b,e,tipo,z0?,top?: número | [en a, en b],modulos?,travesanos?}
     ABERTURAS{id,muro,d,w,h,s,tipo}          (s y h desde la base del muro)
     LOSAS    {id,nivel,poly,huecos?,z,e}      (z = cara superior)
     CLARABOYAS {id,poly,z}
     ESCALERAS  {id,nivel,x:[x0,x1],y:[y0,y1],z:[z0,z1],n}   (y0 = primera alzada, y1 = última)
     BARANDAS   {id,pts,z,h,sigue?}
     ESTRUCTURA {tipo:'columna',pos,sec,z:[z0,z1]} · {tipo:'viga',a,b,sec,z}
     TECHOS     {id,poly,z:[alto,bajo],baja,e}
     IMPLANTACION {id,tipo,poly,z}
   Cada función devuelve geometrías; casa.js decide ids, categorías y grupos. */
import { geo } from './visor3d.js';
const { THREE, box8, box, mapGeo } = geo;

const SEC = s => { const m = String(s || '').match(/(\d+(?:[.,]\d+)?)\s*[×x]\s*(\d+(?:[.,]\d+)?)/); return m ? [parseFloat(m[1].replace(',', '.')), parseFloat(m[2].replace(',', '.'))] : [20, 20]; };
function flip(g) { const g2 = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(g2.attributes)) { const A = g2.attributes[k], n = A.itemSize; for (let i = 0; i < A.count; i += 3) for (let c = 0; c < n; c++) { const t = A.array[(i + 1) * n + c]; A.array[(i + 1) * n + c] = A.array[(i + 2) * n + c]; A.array[(i + 2) * n + c] = t; } A.needsUpdate = true; } g2.computeVertexNormals(); return g2; }
const shape = (pts, holes) => { const s = new THREE.Shape(pts.map(p => new THREE.Vector2(p[0], p[1]))); for (const h of holes || []) s.holes.push(new THREE.Path(h.map(p => new THREE.Vector2(p[0], p[1])))); return s; };

/* polígono en planta extruido entre z0 y z1, con huecos */
export function losa(poly, holes, z0, z1) {
  const g = new THREE.ExtrudeGeometry(shape(poly, holes), { depth: z1 - z0, bevelEnabled: false, curveSegments: 1 });
  return flip(mapGeo(g, (u, v, w) => [u, z0 + w, v]));
}

export const zBase = (M, m) => m.z0 ?? (M.NIVELES[m.nivel] || {}).z ?? 0;
export function zTope(M, m, t) {
  if (Array.isArray(m.top)) return m.top[0] + (m.top[1] - m.top[0]) * t;
  if (m.top != null) return m.top;
  return zBase(M, m) + (m.h || 260);
}

/* muro: cajas a lo largo del eje, con huecos para sus aberturas; el tope puede ser inclinado */
export function muroGeos(M, m) {
  const [ax, ay] = m.a, [bx, by] = m.b, L = Math.hypot(bx - ax, by - ay);
  const ux = (bx - ax) / L, uy = (by - ay) / L, nx = -uy * m.e / 2, ny = ux * m.e / 2;
  const z0 = zBase(M, m);
  const P = d => [ax + ux * d, ay + uy * d];
  const seg = (d0, d1, zlo, zhi) => {
    if (d1 - d0 < 0.5) return null;
    const [x0, y0] = P(d0), [x1, y1] = P(d1);
    const h0 = zhi ?? zTope(M, m, d0 / L), h1 = zhi ?? zTope(M, m, d1 / L);
    if (h0 - zlo < 0.5 && h1 - zlo < 0.5) return null;
    return box8([[x0 + nx, zlo, y0 + ny], [x1 + nx, zlo, y1 + ny], [x1 - nx, zlo, y1 - ny], [x0 - nx, zlo, y0 - ny],
                 [x0 + nx, h0, y0 + ny], [x1 + nx, h1, y1 + ny], [x1 - nx, h1, y1 - ny], [x0 - nx, h0, y0 - ny]]);
  };
  const ops = M.ABERTURAS.filter(a => a.muro === m.id).sort((p, q) => p.d - q.d);
  const g = []; let cur = 0;
  for (const a of ops) {
    if (a.d > cur) g.push(seg(cur, a.d, z0, null));
    const s = z0 + (a.s || 0), h = s + a.h, top = Math.min(zTope(M, m, a.d / L), zTope(M, m, (a.d + a.w) / L));
    if (s > z0) g.push(seg(a.d, a.d + a.w, z0, s));
    if (h < top) { const [x0, y0] = P(a.d), [x1, y1] = P(a.d + a.w); const t0 = zTope(M, m, a.d / L), t1 = zTope(M, m, (a.d + a.w) / L);
      g.push(box8([[x0 + nx, h, y0 + ny], [x1 + nx, h, y1 + ny], [x1 - nx, h, y1 - ny], [x0 - nx, h, y0 - ny], [x0 + nx, t0, y0 + ny], [x1 + nx, t1, y1 + ny], [x1 - nx, t1, y1 - ny], [x0 - nx, t0, y0 - ny]])); }
    cur = a.d + a.w;
  }
  if (cur < L) g.push(seg(cur, L, z0, null));
  return g.filter(Boolean);
}

/* paño vidriado (muro tipo vidrio): vidrio al medio + montantes y travesaños */
export function vidrioGeos(M, m) {
  const [ax, ay] = m.a, [bx, by] = m.b, L = Math.hypot(bx - ax, by - ay);
  const ux = (bx - ax) / L, uy = (by - ay) / L;
  const z0 = zBase(M, m), z1 = zTope(M, m, 0);
  const P = d => [ax + ux * d, ay + uy * d];
  const prof = (d0, d1, zlo, zhi, e) => { const [x0, y0] = P(d0), [x1, y1] = P(d1), nx = -uy * e / 2, ny = ux * e / 2;
    return box8([[x0 + nx, zlo, y0 + ny], [x1 + nx, zlo, y1 + ny], [x1 - nx, zlo, y1 - ny], [x0 - nx, zlo, y0 - ny], [x0 + nx, zhi, y0 + ny], [x1 + nx, zhi, y1 + ny], [x1 - nx, zhi, y1 - ny], [x0 - nx, zhi, y0 - ny]]); };
  const vidrio = [prof(0, L, z0, z1, 1.2)];
  const perfiles = []; const n = m.modulos || Math.max(1, Math.round(L / 200)); const w = 6;
  for (let i = 0; i <= n; i++) { const d = Math.min(L - w, Math.max(0, i * L / n - w / 2)); perfiles.push(prof(d, d + w, z0, z1, m.e)); }
  for (const t of [z0, ...(m.travesanos || []), z1 - w]) perfiles.push(prof(0, L, t, t + w, m.e));
  return { vidrio, perfiles };
}

/* hoja de una abertura (vidrio para ventanas, panel para puertas), cerrada, centrada en el muro */
export function hojaGeo(M, a, esp = 4) {
  const m = M.MUROS.find(w => w.id === a.muro); if (!m) return null;
  const [ax, ay] = m.a, [bx, by] = m.b, L = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / L, uy = (by - ay) / L;
  const z = zBase(M, m) + (a.s || 0), nx = -uy * esp / 2, ny = ux * esp / 2;
  const x0 = ax + ux * a.d, y0 = ay + uy * a.d, x1 = ax + ux * (a.d + a.w), y1 = ay + uy * (a.d + a.w);
  return box8([[x0 + nx, z, y0 + ny], [x1 + nx, z, y1 + ny], [x1 - nx, z, y1 - ny], [x0 - nx, z, y0 - ny], [x0 + nx, z + a.h, y0 + ny], [x1 + nx, z + a.h, y1 + ny], [x1 - nx, z + a.h, y1 - ny], [x0 - nx, z + a.h, y0 - ny]]);
}

/* escalera recta: n alzadas; pedadas de 4 cm y dos zancas */
export function escaleraGeos(e) {
  const [x0, x1] = e.x, [y0, y1] = e.y, [z0, z1] = e.z, n = e.n;
  const r = (z1 - z0) / n, g = (y1 - y0) / (n - 1);
  const ped = [], zan = [];
  for (let i = 0; i < n - 1; i++) { const ya = y0 + i * g, yb = y0 + (i + 1) * g, zt = z0 + (i + 1) * r;
    ped.push(box(x0 + 4, x1 - 4, zt - 4, zt, Math.min(ya, yb), Math.max(ya, yb))); }
  const dz = r > 0 ? 0 : 0, zs = [z0 + r - 22, z1 - 22];
  for (const xx of [x0, x1 - 4]) zan.push(box8([[xx, zs[0], y0], [xx + 4, zs[0], y0], [xx + 4, zs[1], y1], [xx, zs[1], y1], [xx, zs[0] + 26, y0], [xx + 4, zs[0] + 26, y0], [xx + 4, zs[1] + 26, y1], [xx, zs[1] + 26, y1]]));
  return { ped, zan, dz };
}
export function escaleraZ(e, y) { const [y0, y1] = e.y, [z0, z1] = e.z; const t = Math.max(0, Math.min(1, (y - y0) / (y1 - y0))); return z0 + (z1 - z0) * t; }

/* baranda: pasamanos, travesaño bajo y parantes cada ~1 m; si sigue una escalera, acompaña su pendiente */
export function barandaGeos(b, E) {
  const g = []; const zAt = (x, y) => E ? escaleraZ(E, y) + (E.z[1] - E.z[0]) / E.n : b.z;
  for (let i = 0; i < b.pts.length - 1; i++) {
    const [ax, ay] = b.pts[i], [bx, by] = b.pts[i + 1], L = Math.hypot(bx - ax, by - ay), k = Math.max(1, Math.round(L / 100));
    const za = zAt(ax, ay), zb = zAt(bx, by);
    g.push(geo.rod([ax, za + b.h, ay], [bx, zb + b.h, by], 2.5, 8));
    g.push(geo.rod([ax, za + 12, ay], [bx, zb + 12, by], 1.2, 6));
    for (let j = 0; j <= k; j++) { const t = j / k, x = ax + (bx - ax) * t, y = ay + (by - ay) * t, z = za + (zb - za) * t; g.push(geo.rod([x, z, y], [x, z + b.h, y], 1.5, 6)); }
  }
  return g;
}

/* techo plano inclinado: cara superior en z[0] sobre el borde alto y z[1] sobre el bajo */
export function techoGeo(t) {
  const ys = t.poly.map(p => p[1]), xs = t.poly.map(p => p[0]);
  const lo = { '−y': Math.min(...ys), '-y': Math.min(...ys), '+y': Math.max(...ys), '−x': Math.min(...xs), '-x': Math.min(...xs), '+x': Math.max(...xs) }[t.baja];
  const hi = { '−y': Math.max(...ys), '-y': Math.max(...ys), '+y': Math.min(...ys), '−x': Math.max(...xs), '-x': Math.max(...xs), '+x': Math.min(...xs) }[t.baja];
  const ejeY = /y/.test(t.baja), e = t.e || 15;
  const zf = (x, y) => { const s = ((ejeY ? y : x) - hi) / (lo - hi); return t.z[0] + (t.z[1] - t.z[0]) * s; };
  return mapGeo(losa(t.poly, null, -e, 0), (X, Yv, Z) => [X, Yv + zf(X, Z), Z]);
}

export function columnaGeo(c) { const [w, d] = SEC(c.sec); return box(c.pos[0] - w / 2, c.pos[0] + w / 2, c.z[0], c.z[1], c.pos[1] - d / 2, c.pos[1] + d / 2); }
export function vigaGeo(v) { const [w, h] = SEC(v.sec); const [ax, ay] = v.a, [bx, by] = v.b; const L = Math.hypot(bx - ax, by - ay), nx = -(by - ay) / L * w / 2, ny = (bx - ax) / L * w / 2;
  return box8([[ax + nx, v.z - h, ay + ny], [bx + nx, v.z - h, by + ny], [bx - nx, v.z - h, by - ny], [ax - nx, v.z - h, ay - ny], [ax + nx, v.z, ay + ny], [bx + nx, v.z, by + ny], [bx - nx, v.z, by - ny], [ax - nx, v.z, ay - ny]]); }
