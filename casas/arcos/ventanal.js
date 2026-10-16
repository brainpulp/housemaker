/* Ventanal del contrafrente O, paño por paño (Maxi, 15/10), con la grilla del SketchUp (SU-01):
   cuatro módulos y tres filas. Abajo, cuatro hojas altas corredizas (todas se mueven); al medio, una fila de paños fijos;
   arriba, las dos del medio corredizas y las de los costados fijas; y una ventilación chica corrediza en el baño de 2P.
   Las corredizas van en dos rieles (se ven corridas 4 cm hacia adentro, alternadas). */
export function ventanalArcos(THREE) {
  const Y = 2345, X = [20, 232, 442, 645, 850], FILA = { baja: [88, 486], media: [512, 607], alta: [622, 949] };
  const box = (x0, x1, z0, z1, y0, y1) => { const g = new THREE.BoxGeometry(x1 - x0, z1 - z0, y1 - y0); g.translate((x0 + x1) / 2, (z0 + z1) / 2, (y0 + y1) / 2); return g; };
  const P = [], marco = [];
  /* marco fijo: parantes entre módulos, travesaños entre filas, contorno */
  for (const x of X) marco.push(box(x - 3, x + 3, 72, 622, Y - 5, Y + 5), box(x - 3, x + 3, 622, 956, Y - 5, Y + 5));
  for (const [z0, z1] of [[72, 88], [486, 512], [607, 622], [949, 956]]) marco.push(box(X[0] - 3, X[4] + 3, z0, z1, Y - 5, Y + 5));
  P.push({ id: 'VO-M', nombre: 'Ventanal O: marco y parantes', cat: 'perfil', geos: marco, info: { fn: 'Marco fijo de hierro: cuatro módulos y tres filas, como en tu SketchUp.', sec: 'perfil de hierro', med: `${((X[4] - X[0]) / 100).toFixed(2).replace('.', ',')} de ancho, de +0,72 a +9,56` } });
  /* una hoja: vidrio + bastidor + palillos horizontales */
  const hoja = (x0, x1, z0, z1, dy, palillos = []) => { const y = Y + dy, g = [box(x0 + 4, x1 - 4, z0 + 4, z1 - 4, y - .6, y + .6)], f = [];
    f.push(box(x0, x1, z0, z0 + 4, y - 2.5, y + 2.5), box(x0, x1, z1 - 4, z1, y - 2.5, y + 2.5), box(x0, x0 + 4, z0, z1, y - 2.5, y + 2.5), box(x1 - 4, x1, z0, z1, y - 2.5, y + 2.5));
    for (const z of palillos) if (z > z0 + 6 && z < z1 - 6) f.push(box(x0 + 4, x1 - 4, z - 1.2, z + 1.2, y - 1.5, y + 1.5));
    return { g, f }; };
  const pieza = (id, nombre, fn, hs) => { P.push({ id, nombre: nombre + ' (vidrio)', cat: 'glass', geos: hs.flatMap(h => h.g), info: { fn, sec: '', med: '' } });
    P.push({ id: id + 'f', nombre: nombre + ' (bastidor)', cat: 'perfil', geos: hs.flatMap(h => h.f), info: { fn, sec: 'perfil de hierro', med: '' } }); };
  const m = i => [X[i] + 3, X[i + 1] - 3];
  /* fila baja: cuatro corredizas altas */
  for (let i = 0; i < 4; i++) { const [a, b] = m(i); pieza(`VO-C${i + 1}`, `Ventanal O: hoja corrediza baja ${i + 1}`, 'Hoja alta corrediza de la planta baja; las cuatro se mueven.', [hoja(a, b, FILA.baja[0], FILA.baja[1], i % 2 ? -4 : 0, [188, 286, 385])]); }
  /* fila media: fijos */
  pieza('VO-F', 'Ventanal O: paños fijos del medio', 'Fila de paños fijos entre la planta baja y el segundo piso.', [0, 1, 2, 3].map(i => { const [a, b] = m(i); return hoja(a, b, FILA.media[0], FILA.media[1], 0); }));
  /* fila alta: fijos a los costados, corredizas al medio; ventilación del baño en el módulo N */
  const pal = [716, 810, 904];
  { const [a0, b0] = m(0), [a3, b3] = m(3);
    pieza('VO-S', 'Ventanal O: paños altos fijos de los costados', 'Paños fijos junto a las medianeras S y N, en el segundo piso (en el módulo N, arriba y abajo de la ventilación del baño).',
      [hoja(a0, b0, FILA.alta[0], FILA.alta[1], 0, pal), hoja(a3, b3, FILA.alta[0], 750, 0, pal), hoja(a3, b3, 846, FILA.alta[1], 0, pal)]); }
  for (const i of [1, 2]) { const [a, b] = m(i); pieza(`VO-C${i + 4}`, `Ventanal O: hoja corrediza alta ${i}`, 'Hoja corrediza del segundo piso; se mueven las dos del medio.', [hoja(a, b, FILA.alta[0], FILA.alta[1], i % 2 ? -4 : 0, pal)]); }
  { const [a, b] = m(3); pieza('VO-B', 'Ventanal O: ventilación del baño de 2P', 'Paño chico corredizo del baño de 2P (alto y posición supuestos dentro del módulo N).', [hoja(a, b, 750, 846, -4)]); }
  /* la fila alta está inclinada hacia adentro (SketchUp: de y 23,70 a +6,22 a y 24,66 a +9,47, unos 16°) */
  const K = (2466 - 2370) / (947 - 622), inclina = g => { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getY(i); if (z > 618) p.setZ(i, p.getZ(i) + 25 + (z - 622) * K); } g.computeVertexNormals(); return g; };
  for (const q of P) q.geos.forEach(inclina);
  return P;
}
