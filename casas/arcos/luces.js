/* Luces de Arcos (Maxi, 15/10): downlights en todos los ambientes, repartidos en grilla, y proyectores hacia los dos jardines.
   Devuelve los artefactos (geometría, para verlos) y las fuentes para noche.js. Programas: interiores al atardecer −15 min hasta 23:30;
   exteriores al atardecer hasta la 01:00. */
const SEP = 330;               /* separación máxima entre downlights */
/* altura del cielorraso (donde va el artefacto) por ambiente; f(x, y) para los que tienen dos alturas */
const TECHO = { 'L-B1': 55, 'L-B4': 389, 'L-B3': 317, 'L-B2': (x, y) => (y > 2858 && x < 659 ? 317 : 560), 'L-B5': 295, 'L-B6': 295, 'L-B7': 587,
  'L-B8': 700, 'L-B9': 700, 'L-B10': 700, 'L-B11': 700, 'L-B12': 860, 'L-B13': 860, 'L-B14': 1080 };
const dentro = (x, y, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };

/* techo(x, y, zPiso): z del primer cielorraso, losa, viga o cabio que hay arriba de ese punto (lo da casa.js mirando la geometría ya armada),
   o null; si se corre para no quedar bajo un vidrio, devuelve {z, x, y}. Sin él se usa la tabla TECHO. */
export function lucesArcos(THREE, M, techo = null) {
  const art = [], fuentes = [], cw = new THREE.Color(0xffe2b8), cx = new THREE.Color(0xfff1d6);
  const disco = (x, z, y, r) => { const g = new THREE.CylinderGeometry(r, r, 2, 20); g.translate(x, z - 1, y); return g; };
  /* interiores */
  for (const l of M.LOCALES) { const T = TECHO[l.id]; if (T == null) continue;
    const xs = l.poly.map(p => p[0]), ys = l.poly.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const nx = Math.max(1, Math.ceil((x1 - x0) / SEP)), ny = Math.max(1, Math.ceil((y1 - y0) / SEP)), geos = []; let n = 0;
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { const x = x0 + (x1 - x0) * (i + .5) / nx, y = y0 + (y1 - y0) * (j + .5) / ny; if (!dentro(x, y, l.poly)) continue;
      let z = typeof T === 'function' ? T(x, y) : T, X = x, Y = y;
      if (techo) { const h = techo(x, y, (M.NIVELES[l.nivel] || {}).z ?? 0); if (h == null) continue; if (typeof h === 'number') z = h; else ({ z, x: X, y: Y } = h); }
      geos.push(disco(X, z, Y, 6));
      fuentes.push({ t: 'spot', p: new THREE.Vector3(X, z - 2, Y), d: new THREE.Vector3(0, -1, 0), lm: 900, beam: 100, col: cw, id: 'LZ-' + l.id, prog: { modo: 'prog', on: { t: 'atardecer', m: -15 }, off: { t: 'hora', h: '23:30' } } }); n++; }
    if (geos.length) art.push({ id: 'LZ-' + l.id.slice(2), nivel: l.nivel, nombre: `Downlights de ${l.nombre}`, geos, info: { fn: `${n} downlight${n > 1 ? 's' : ''} empotrado${n > 1 ? 's' : ''} de 900 lm, luz cálida. Prenden al atardecer y apagan a las 23:30.`, sec: 'Ø12', med: techo ? 'al cielorraso, losa o viga que tiene arriba' : `cielorraso a +${((typeof T === 'function' ? T(x0, y0) : T) / 100).toFixed(2).replace('.', ',')}` } }); }
  /* exteriores: proyectores en pared, apuntando a cada jardín */
  const proy = (id, nombre, nivel, ps, d, lm, beam, fn) => { const geos = [], dv = new THREE.Vector3(...d).normalize();
    for (const [x, z, y] of ps) { const g = new THREE.BoxGeometry(14, 10, 10); g.translate(x, z, y); geos.push(g);
      fuentes.push({ t: 'spot', p: new THREE.Vector3(x, z, y).addScaledVector(dv, 8), d: dv.clone(), lm, beam, col: cx, id, prog: { modo: 'prog', on: { t: 'atardecer', m: 0 }, off: { t: 'hora', h: '01:00' } } }); }
    art.push({ id, nivel, nombre, geos, info: { fn, sec: 'proyector LED', med: `${ps.length} × ${lm} lm, apertura ${beam}°` } }); };
  proy('LZ-JE', 'Proyectores al jardín E (frente)', 'PB', [[150, 300, 3925], [432, 300, 3925], [715, 300, 3925]], [0, -.7, .7], 2000, 70,
    'En la fachada E a +3,00, iluminan el jardín del frente. Prenden al atardecer y apagan a la 01:00.');
  proy('LZ-JO', 'Proyectores al jardín O (fondo)', 'PB', [[150, 380, 2245], [432, 380, 2245], [715, 380, 2245]], [0, -.55, -.83], 3000, 70,
    'Bajo la losa de 2P, sobre la galería del contrafrente O, a +3,80: iluminan el jardín del fondo. Prenden al atardecer y apagan a la 01:00.');
  /* medianeras S y N, alternadas a lo largo del jardín O, apuntando al centro */
  { const ps = [[30, 330, 1500, 1], [835, 330, 1000, -1], [30, 330, 500, 1]], geos = [];
    for (const [x, z, y, s] of ps) { const g = new THREE.BoxGeometry(10, 10, 14); g.translate(x, z, y); geos.push(g); const dv = new THREE.Vector3(s, -.6, 0).normalize();
      fuentes.push({ t: 'spot', p: new THREE.Vector3(x, z, y).addScaledVector(dv, 8), d: dv, lm: 2500, beam: 80, col: cx, id: 'LZ-JM', prog: { modo: 'prog', on: { t: 'atardecer', m: 0 }, off: { t: 'hora', h: '01:00' } } }); }
    art.push({ id: 'LZ-JM', nivel: 'PB', nombre: 'Proyectores de medianera en el jardín O', geos, info: { fn: 'En las medianeras S y N a +3,30, alternados a lo largo del jardín del fondo, apuntan al centro. Prenden al atardecer y apagan a la 01:00.', sec: 'proyector LED', med: '3 × 2500 lm, apertura 80°' } }); }
  /* balcón E */
  { const g = new THREE.BoxGeometry(14, 8, 8); g.translate(617, 640, 3915);
    fuentes.push({ t: 'spot', p: new THREE.Vector3(617, 630, 3925), d: new THREE.Vector3(0, -1, .25).normalize(), lm: 700, beam: 90, col: cw, id: 'LZ-BAL', prog: { modo: 'prog', on: { t: 'atardecer', m: 0 }, off: { t: 'hora', h: '23:30' } } });
    art.push({ id: 'LZ-BAL', nivel: 'P1', nombre: 'Aplique del balcón E', geos: [g], info: { fn: 'Aplique sobre la puerta del balcón. Prende al atardecer y apaga a las 23:30.', sec: '', med: '700 lm' } }); }
  return { art, fuentes };
}
