/* Baño de 2P (L-B12) como está en la obra (foto de Maxi del 16/10, sacada de SE a NO, y sus respuestas del 17/10):
   bañadera de mampostería a lo ancho contra el ventanal O, con un escalón al frente y un cajón de placa verde arriba;
   inodoro y bidet contra la pared de la escalera (E, M-52); bacha de apoyo sobre una mesada con estructura de caño
   contra la medianera N. Las medidas de los artefactos son las comerciales; las de la bañadera y el cajón, estimadas de la foto.
   Devuelve piezas {id, nombre, cat, geos, info}. Ejes de la casa: x (S→N), y (O→E), z altura. */
export function banio2P(THREE, M) {
  const L = M.LOCALES.find(l => l.id === 'L-B12'), z0 = M.NIVELES.P2.z;
  const xs = L.poly.map(p => p[0]), ys = L.poly.map(p => p[1]);
  const XS = Math.min(...xs), XN = Math.max(...xs), YO = Math.max(Math.min(...ys), 2357), YE = 2704;   /* caras interiores */
  const box = (x0, x1, za, zb, y0, y1) => { const g = new THREE.BoxGeometry(x1 - x0, zb - za, y1 - y0); g.translate((x0 + x1) / 2, (za + zb) / 2, (y0 + y1) / 2); return g; };
  const cil = (x, y, r, za, zb, sx = 1, sy = 1) => { const g = new THREE.CylinderGeometry(r, r * .92, zb - za, 28); g.scale(sx, 1, sy); g.translate(x, (za + zb) / 2, y); return g; };
  const P = [], f2 = v => (v / 100).toFixed(2).replace('.', ',');

  /* bañadera de mampostería: caja de 0,55 con hueco, escalón de 0,22 al frente */
  { const yb = YO + 80, t = 10, zt = z0 + 55, g = [];
    g.push(box(XS, XN, z0, z0 + 6, YO, yb));                                          /* fondo */
    g.push(box(XS, XN, z0, zt, YO, YO + t), box(XS, XN, z0, zt, yb - t, yb));          /* lados largos */
    g.push(box(XS, XS + t, z0, zt, YO, yb), box(XN - t, XN, z0, zt, YO, yb));          /* cabeceras */
    g.push(box(XS, XN, z0, z0 + 22, yb, yb + 25));                                     /* escalón */
    P.push({ id: 'B2-BA', nombre: 'Bañadera de mampostería', cat: 'losa', geos: g, info: { fn: 'Bañadera de mampostería a lo ancho del baño, contra el ventanal O, con un escalón al frente (foto de Maxi, 16/10).', sec: 'mampostería revocada', med: `${f2(XN - XS)} × 0,80 × 0,55 (estimado de la foto)` } }); }
  /* cajón de placa verde sobre la bañadera (pasan los caños; tapa de inspección del lado N) */
  { const za = z0 + 230, zb = z0 + 290;
    P.push({ id: 'B2-CJ', nombre: 'Cajón de placa sobre la bañadera', cat: 'placa', geos: [box(XS, XN, za, zb, YO, YO + 105)], info: { fn: 'Cajón de placa de yeso verde (resistente a la humedad) sobre la bañadera, con tapa de inspección del lado N por donde pasan los caños (foto de Maxi).', sec: 'placa verde', med: `de +${f2(za)} a +${f2(zb)} (estimado)` } }); }
  /* inodoro y bidet contra la pared de la escalera (E), mirando al O */
  const sanit = (x, id, nombre, mochila) => { const g = [], yp = YE;
    g.push(cil(x, yp - 33, 15, z0, z0 + 28, 1, 1.25));            /* pie */
    g.push(cil(x, yp - 36, 19, z0 + 28, z0 + 40, 1, 1.4));        /* taza */
    g.push(box(x - 18, x + 18, z0 + 22, z0 + 40, yp - 14, yp));   /* respaldo contra la pared */
    if (mochila) g.push(box(x - 19, x + 19, z0 + 40, z0 + 78, yp - 18, yp));
    P.push({ id, nombre, cat: 'artefacto', geos: g, info: { fn: `${nombre} contra la pared de la escalera (E), mirando a la bañadera (Maxi, 17/10).`, sec: '', med: mochila ? '0,38 × 0,65, mochila apoyada' : '0,36 × 0,55' } }); };
  const xm = (XS + XN) / 2;
  sanit(xm + 42, 'B2-IN', 'Inodoro', true);
  sanit(xm - 12, 'B2-BI', 'Bidet', false);
  /* bacha de apoyo sobre mesada con estructura de caño, contra la medianera N */
  { const yc = (YO + 105 + YE) / 2 - 20, g = [], gf = [], zm = z0 + 85;
    g.push(box(XN - 50, XN, zm - 3, zm, yc - 45, yc + 45));                             /* tapa */
    g.push(box(XN - 45, XN - 5, zm, zm + 15, yc - 22, yc + 22));                        /* bacha */
    for (const [x, y] of [[XN - 47, yc - 42], [XN - 47, yc + 42], [XN - 3, yc - 42], [XN - 3, yc + 42]]) gf.push(box(x - 1.5, x + 1.5, z0, zm - 3, y - 1.5, y + 1.5));
    for (const zz of [z0 + 20, zm - 6]) gf.push(box(XN - 48, XN - 2, zz, zz + 3, yc - 43.5, yc - 40.5), box(XN - 48, XN - 2, zz, zz + 3, yc + 40.5, yc + 43.5),
      box(XN - 48.5, XN - 45.5, zz, zz + 3, yc - 42, yc + 42), box(XN - 4.5, XN - 1.5, zz, zz + 3, yc - 42, yc + 42));      /* marcos abajo y bajo la tapa */
    P.push({ id: 'B2-BC', nombre: 'Bacha de apoyo y mesada', cat: 'artefacto', geos: g, info: { fn: 'Bacha de apoyo cuadrada sobre una mesada, contra la medianera N (foto de Maxi).', sec: '', med: `mesada 0,90 × 0,50 a +${f2(zm - z0)}` } });
    P.push({ id: 'B2-ES', nombre: 'Estructura de la mesada', cat: 'herreria', geos: gf, info: { fn: 'Estructura de caño de la mesada de la bacha.', sec: 'caño 30 × 30', med: '' } }); }
  return P;
}
