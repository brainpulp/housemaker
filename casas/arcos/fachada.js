/* Fachada E como está hoy (foto de Street View que mandó Maxi, 15/10): revoque blanco, persianas de enrollar cerradas,
   puerta de entrada de dos hojas con tablillas, balcón con la punta S redondeada y baranda de caños horizontales, buñas
   horizontales, baranda de caños arriba de la terraza y cerco al frente (pilares blancos, portón de malla negro y muro bajo
   con baranda de caños). Devuelve piezas {id, nombre, cat, geos, info}. Ejes de la casa: x (S→N), y (O→E), z altura. */
export function fachadaArcos(THREE, M, A) {
  const P = [], box = (x0, x1, z0, z1, y0, y1) => { const g = new THREE.BoxGeometry(x1 - x0, z1 - z0, y1 - y0); g.translate((x0 + x1) / 2, (z0 + z1) / 2, (y0 + y1) / 2); return g; };
  const tubo = (a, b, r) => { const A3 = new THREE.Vector3(...a), B3 = new THREE.Vector3(...b), L = A3.distanceTo(B3); const g = new THREE.CylinderGeometry(r, r, L, 10); g.translate(0, L / 2, 0);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B3.clone().sub(A3).normalize())); g.translate(...a); return g; };
  const F = M.MUROS.find(m => m.id === 'M-11'), YE = F.a[1] + F.e / 2, z0F = F.z0 ?? 0;   /* cara exterior de la fachada */
  const ab = id => { const a = M.ABERTURAS.find(o => o.id === id); const x0 = F.a[0] + a.d; return { x0, x1: x0 + a.w, z0: z0F + (a.s || 0), z1: z0F + (a.s || 0) + a.h, a }; };

  /* persianas de enrollar cerradas: tablillas de 5 con su guía a cada lado */
  for (const id of ['V-01', 'V-02', 'V-03']) { const { x0, x1, z0, z1, a } = ab(id), g = [], y = YE - 4;
    for (let z = z0; z < z1 - 1; z += 5) g.push(box(x0 + 2, x1 - 2, z + .4, Math.min(z + 4.6, z1), y - .8, y + .8));
    g.push(box(x0, x0 + 3, z0, z1, y - 2, y + 2), box(x1 - 3, x1, z0, z1, y - 2, y + 2));
    P.push({ id: id + 'p', nombre: `${id} · persiana de enrollar`, cat: 'persiana', geos: g, info: { fn: `${a.nombre}: persiana de enrollar de PVC blanco, cerrada, como en la foto.`, sec: 'tablillas de 5', med: `${(a.w / 100).toFixed(2).replace('.', ',')} × ${(a.h / 100).toFixed(2).replace('.', ',')}` } }); }

  /* entrada: dos hojas blancas con tablillas horizontales y zócalo ciego */
  { const { x0, x1, z0, z1, a } = ab('P-03'), y = YE - 5, xm = (x0 + x1) / 2, g = [];
    g.push(box(x0, x1, z0, z1, y - 3, y - 1));                                  /* fondo de las hojas */
    for (const [u0, u1] of [[x0, x0 + 6], [xm - 3, xm + 3], [x1 - 6, x1]]) g.push(box(u0, u1, z0, z1, y - 3, y + 2));   /* parantes */
    g.push(box(x0, x1, z1 - 6, z1, y - 3, y + 2), box(x0, x1, z0, z0 + 30, y - 3, y + 1.5));                          /* travesaño y zócalo */
    for (let z = z0 + 34; z < z1 - 8; z += 9) for (const [u0, u1] of [[x0 + 6, xm - 3], [xm + 3, x1 - 6]]) g.push(box(u0, u1, z, z + 5, y - 1, y + 1.5));
    P.push({ id: 'P-03h', nombre: 'P-03 · hojas de la entrada', cat: 'persiana', geos: g, info: { fn: 'Puerta de entrada de dos hojas, blanca, con tablillas horizontales y zócalo ciego, como en la foto.', sec: '', med: `${(a.w / 100).toFixed(2).replace('.', ',')} × ${(a.h / 100).toFixed(2).replace('.', ',')}` } }); }

  /* buñas horizontales: sobre la PB y bajo la terraza */
  P.push({ id: 'FE-B', nombre: 'Buñas y cornisa de la fachada E', cat: 'fachada', geos: [box(0, 865, 386, 398, YE, YE + 3), box(0, 865, 712, 742, YE, YE + 10)],
    info: { fn: 'Buña sobre la planta baja y cornisa saliente bajo la baranda de la terraza, como en la foto.', sec: '', med: '' } });

  /* baranda del balcón: caños horizontales siguiendo el frente y la curva de la punta S */
  { const L = M.LOSAS.find(l => l.id === 'LO-06'), zb = L.z, path = [], R = 85, yF = Math.max(...L.poly.map(p => p[1])) - 4, xN = Math.max(...L.poly.map(p => p[0])) - 4, xS = Math.min(...L.poly.map(p => p[0])) + 4, cx = xS + R;
    path.push([xN, yF]); for (let k = 0; k <= 8; k++) { const t = Math.PI / 2 + k / 8 * Math.PI / 2; path.push([cx + R * Math.cos(t), YE + (yF - YE) * Math.sin(t)]); }
    const g = [];
    for (const h of [18, 34, 50, 66, 82, 98]) for (let i = 0; i < path.length - 1; i++) g.push(tubo([path[i][0], zb + h, path[i][1]], [path[i + 1][0], zb + h, path[i + 1][1]], h === 98 ? 2.4 : 1.3));
    for (const [x, y] of [path[0], path[1], [(path[0][0] + path[1][0]) / 2, yF], path[4], path[path.length - 1]]) g.push(tubo([x, zb, y], [x, zb + 98, y], 1.8));
    P.push({ id: 'LO-06b', nombre: 'LO-06 · baranda del balcón E', cat: 'caño', geos: g, info: { fn: 'Baranda de caños horizontales que sigue el frente y la curva de la punta S del balcón, a 1,00 (foto de la fachada; contesta D-04).', sec: 'caño Ø2,5 y Ø5', med: '1,00 de alto' } }); }

  /* baranda de la terraza, sobre la cornisa */
  { const g = [], z = 742, y = YE - 4; for (const h of [50, 100]) g.push(tubo([15, z + h, y], [850, z + h, y], h === 100 ? 2.4 : 1.3));
    for (let x = 15; x <= 851; x += 167) g.push(tubo([Math.min(x, 850), z, y], [Math.min(x, 850), z + 100, y], 1.8));
    P.push({ id: 'FE-T', nombre: 'Baranda de la terraza sobre la fachada E', cat: 'caño', geos: g, info: { fn: 'Baranda de caños sobre el borde de la terraza, como en la foto.', sec: 'caño', med: '1,00 de alto' } }); }

  /* cerco al frente, sobre la línea municipal */
  { const yL = 4516, g = [], gm = [], gr = [];
    for (const [x0, x1] of [[30, 70], [328, 372]]) g.push(box(x0, x1, 0, 165, yL - 40, yL));           /* pilares */
    g.push(box(372, 865, 0, 95, yL - 20, yL));                                                           /* muro bajo */
    for (const [x0, x1] of [[70, 199], [199, 328]]) { for (let x = x0 + 6; x < x1 - 3; x += 6) gm.push(box(x - .25, x + .25, 12, 141, yL - 20.3, yL - 19.7));
      for (let z = 18; z < 140; z += 6) gm.push(box(x0 + 4, x1 - 4, z - .25, z + .25, yL - 20.3, yL - 19.7));
      for (const u of [x0 + 2, x1 - 2]) gm.push(box(u - 2, u + 2, 8, 145, yL - 22, yL - 18)); gm.push(box(x0, x1, 141, 145, yL - 22, yL - 18), box(x0, x1, 8, 12, yL - 22, yL - 18)); }
    for (const h of [118, 140]) gr.push(tubo([372, h, yL - 10], [865, h, yL - 10], h === 140 ? 2.4 : 1.3));
    for (let x = 400; x <= 860; x += 154) gr.push(tubo([x, 95, yL - 10], [x, 140, yL - 10], 1.8));
    P.push({ id: 'CE-1', nombre: 'Cerco: pilares y muro bajo', cat: 'fachada', geos: g, info: { fn: 'Dos pilares blancos a los lados del portón y muro bajo hacia la medianera N, como en la foto.', sec: '', med: 'pilares 1,65; muro 0,95' } });
    P.push({ id: 'CE-2', nombre: 'Cerco: portón de dos hojas', cat: 'herreria', geos: gm, info: { fn: 'Portón de dos hojas de caño negro con malla, frente a la entrada.', sec: '', med: '2,58 × 1,37' } });
    P.push({ id: 'CE-3', nombre: 'Cerco: baranda del muro bajo', cat: 'caño', geos: gr, info: { fn: 'Baranda de caños horizontales sobre el muro bajo, como en la foto.', sec: 'caño', med: 'hasta 1,40' } }); }
  return P;
}
