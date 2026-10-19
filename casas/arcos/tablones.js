/* Piso de tablones: tablas de ANCHO cm que corren en x (de medianera a medianera, transversales a la casa), con juntas
   escalonadas y tres tonos, recortadas al polígono de la losa y a sus huecos (rectángulos). Devuelve geometrías por tono. */
export function tablones(geo, A, { poly, huecos = [], z, ancho = 20, junta = 0.4, esp = 2, seed = 1 }) {
  const { box8, clip } = geo;
  let r = seed * 9301 + 49297; const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
  const xs = poly.map(p => p[0]), ys = poly.map(p => p[1]);
  const X0 = Math.min(...xs), X1 = Math.max(...xs), Y0 = Math.min(...ys), Y1 = Math.max(...ys);
  const area = q => { let a = 0; for (let i = 0; i < q.length; i++) { const [x0, y0] = q[i], [x1, y1] = q[(i + 1) % q.length]; a += x0 * y1 - x1 * y0; } return Math.abs(a) / 2; };
  /* rectángulo menos rectángulos (huecos): partes que quedan afuera */
  const menos = (R, H) => { let out = [R]; for (const h of H) { const hx = h.map(p => p[0]), hy = h.map(p => p[1]); const a0 = Math.min(...hx), a1 = Math.max(...hx), b0 = Math.min(...hy), b1 = Math.max(...hy); const nx = [];
      for (const [x0, x1, y0, y1] of out) { if (x1 <= a0 || x0 >= a1 || y1 <= b0 || y0 >= b1) { nx.push([x0, x1, y0, y1]); continue; }
        if (x0 < a0) nx.push([x0, a0, y0, y1]); if (x1 > a1) nx.push([a1, x1, y0, y1]); const c0 = Math.max(x0, a0), c1 = Math.min(x1, a1);
        if (y0 < b0) nx.push([c0, c1, y0, b0]); if (y1 > b1) nx.push([c0, c1, b1, y1]); } out = nx; } return out; };
  const tonos = [[], [], []], z0 = z - esp + 0.3, z1 = z + 0.3;
  const CL = typeof globalThis !== 'undefined' && globalThis.ClipperLib, S = 100;
  const recorte = (x0, x1, y0, y1) => {
    if (!CL) { let q = clip(poly, 1, 0, -x0); q = clip(q, -1, 0, x1); q = clip(q, 0, 1, -y0); q = clip(q, 0, -1, y1); return q.length > 2 ? [q] : []; }
    const c = new CL.Clipper(), sol = new CL.Paths();
    c.AddPath(poly.map(([x, y]) => ({ X: Math.round(x * S), Y: Math.round(y * S) })), CL.PolyType.ptSubject, true);
    c.AddPath([[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y]) => ({ X: Math.round(x * S), Y: Math.round(y * S) })), CL.PolyType.ptClip, true);
    c.Execute(CL.ClipType.ctIntersection, sol, CL.PolyFillType.pftNonZero, CL.PolyFillType.pftNonZero);
    return sol.map(pa => pa.map(pt => [pt.X / S, pt.Y / S])); };
  for (let y = Y0; y < Y1 - 0.5; y += ancho) { const ya = y + junta / 2, yb = Math.min(y + ancho, Y1) - junta / 2; if (yb - ya < 1) continue;
    let x = X0 - rnd() * 180;
    while (x < X1) { const L = 120 + rnd() * 180, xa = Math.max(x, X0) + junta / 2, xb = Math.min(x + L, X1) - junta / 2, t = Math.floor(rnd() * 3); x += L;
      if (xb - xa < 2) continue;
      for (const [x0, x1, y0, y1] of menos([xa, xb, ya, yb], huecos)) { if (x1 - x0 < 1 || y1 - y0 < 1) continue;
        /* recorte de la tabla contra la losa: con Clipper, porque la losa puede ser cóncava (el estar hundido es una muesca)
           y el recorte por semiplanos une los dos lados de una muesca con una tira que vuela sobre el hueco */
        const full = (x1 - x0) * (y1 - y0);
        for (const q of recorte(x0, x1, y0, y1)) { const a = area(q); if (a < 1) continue;
          tonos[t].push(a > full - 0.5 ? box8([[x0, z0, y0], [x1, z0, y0], [x1, z0, y1], [x0, z0, y1], [x0, z1, y0], [x1, z1, y0], [x1, z1, y1], [x0, z1, y1]]) : A.losa(q, null, z0, z1)); } } } }
  return tonos;
}
