/* Equipamiento de Mocoretá. El motor (motor/equipamiento.js) es el mismo de las casas. Ejes: x de sur a norte, y de oeste a este.
   Giro r: 0 = el frente del mueble mira al este, 90 = al norte, 180 = al oeste, −90 = al sur.
   Interior: la cocina como está hoy, del croquis de Maxi del 3/11 (la misma de casas/cocinas/equipamiento-cocinas.js), trasladada al origen COC del modelo
   (cara interior del ventanal sur, cara este de la pared O). Lo demás del interior todavía no tiene muebles (D-10). */
import { COC, TERR } from './modelo.js';
export function equipMocoreta({ itA }) {
  const vacio = () => ({ A: { nombre: 'Vacío', items: [] } });
  const sillas = (I, cx, cy, L, D, n, t = 'sillaCover') => [...Array(n)].flatMap((_, k) => { const x = cx - L / 2 + L * (k + .5) / n; return [I(t, x, cy - D / 2 - 28, 0), I(t, x, cy + D / 2 + 28, 180)]; });
  const AMB = {
    interior: { n: 'Interior', piso: 0, vista: { p: [620, 330, 880], t: [200, 70, 1100] }, esc: () => { const J = itA('cocina'), I = (t, x, y, r, p, z) => J(t, x + COC.x, y + COC.y, r, p, z); return {
      A: { nombre: 'Cocina como está hoy (croquis 3/11)', items: [
        I('mesada', 124, 42.5, 0, { L: 248, D: 85, H: 90, fr: 'madClara', top: 'granito' }), I('heladera', 291.5, 36, 0, { L: 65, D: 70, H: 190, col: 'acero' }),
        I('mesada', 32.5, 300, 90, { L: 300, D: 65, H: 90, fr: 'madClara', top: 'granito' }), I('bacha', 34.5, 192, 90, { L: 80 }),
        /* Maxi 10/11: isla de ibirapitá con cajones de frente negro y, en la punta sur, el agregado de 1,00 × 0,90 con el anafe de 5 */
        I('isla', 300, 265, 0, { L: 220, D: 90, vol: 0, fr: 'negro', top: 'madRust' }), I('mesada', 150, 265, 0, { L: 80, D: 90, H: 91, fr: 'negro', top: 'granito', puertas: [0], tapaMas: 20, tapaLado: 1, tapaD: 90 }), I('anafe', 158, 265, 0, { L: 90, D: 52, n: 5 }, 91),
        I('mesaTablas', 267, 530, 0, { L: 280, D: 120, P: 20, mad: 'pinotea' }), ...sillas(I, 267, 530, 280, 120, 3),
        I('alacena', 124, 17.5, 0, { L: 248, D: 35, H: 70, fr: 'madClara' }, 150)] },
      B: { nombre: 'Vacío', items: [] } }; } },
    /* piso alto (hipótesis del segundo piso; Maxi 15/11: «equipá el dormitorio de arriba y la oficina»). Sólo se ve con el segundo piso prendido. Medidas y ubicación supuestas */
    alto: { n: 'Piso alto (hipótesis)', piso: 328, ver: p => p.piso2 === 'A' || p.piso2 === 'B', vista: { p: [1500, 900, 2900], t: [300, 380, 1800] }, esc: () => { const I = itA('alto'); return {
      A: { nombre: 'Dormitorio y oficina', items: [
        I('cama', 300, 1492, 180, { L: 160, D: 200 }), I('mesaLuz', 190, 1572, 180), I('mesaLuz', 410, 1572, 180), I('alfombra', 300, 1440, 0, { L: 260, D: 170 }), I('placard', 45, 1380, 90, { L: 150, D: 60, H: 240 }),
        I('escritorio', 300, 2350, 180, { L: 160, D: 70 }), I('silla', 300, 2290, 0), I('biblioteca', 32, 2270, 90, { L: 200, D: 32, H: 200 }), I('butaca', 170, 2090, 90), I('alfombra', 260, 2200, 0, { L: 240, D: 170 })] },
      B: { nombre: 'Vacío', items: [] } }; } },
    /* el jardín: sin muebles; es el ambiente donde el motor pone la capa Plantas */
    exterior: { n: 'Jardín', piso: TERR, vista: { p: [3400, 250, 1500], t: [600, 400, 1450] }, esc: () => ({ A: { nombre: 'Sin muebles', items: [] } }) },
    deckN: { n: 'Deck norte', piso: 0, vista: { p: [1500, 350, 1800], t: [750, 60, 1200] }, esc: vacio },
    deckS: { n: 'Deck sur', piso: 0, vista: { p: [-900, 300, 1500], t: [-120, 60, 1200] }, esc: vacio },
  };
  const sin = n => () => ({ A: { nombre: n, items: [] } });
  /* plantas (Maxi 16/11: «así se ve la casa ahora desde el norte, agregá el foliage para que se parezca lo más posible»). Puestas a ojo desde una foto y un video tomados desde el norte (16/11):
     especies, alturas y lugares son aproximados; se mueven y se cambian desde la capa Plantas. x = norte, y = este; van al nivel del terreno de hoy */
  function escVeg() { const I = itA('V'), it = [], P = (t, x, y, esp, alto, seed) => { const f = t !== 'arbol' ? null : esp === 'Pino' ? { hojas: .6 } : { alto: Math.round(alto * 1.4), copa: .55, hojas: .4 };   /* Maxi 17/11: «demasiado frondosa; en la realidad la casa se ve a través de los árboles, y las copas arrancan demasiado abajo»: los de hoja ancha, 40 % más altos, con la copa desde la mitad del tronco y la mitad de hojas; los pinos, más ralos */
      it.push(I(t, x, y, (x * 7 + y * 3) % 360, { esp, alto, seed, ...(f || {}) }, TERR)); };
    /* la fila de pinos altos delante del deck, paralela a la casa (en el video del 16/11 se cuentan diez u once troncos en línea), y dos más adelantados */
    [[1500, 2330, 2000], [1470, 2190, 2200], [1520, 2050, 1900], [1480, 1900, 2100], [1500, 1760, 2000], [1470, 1620, 2200], [1540, 1490, 1900], [1490, 1350, 2100], [1500, 1200, 2000], [1470, 1050, 2200], [1520, 900, 1900], [1850, 1700, 2200], [1800, 2150, 2000]].forEach(([x, y, h], i) => P('arbol', x, y, 'Pino', h, 1 + i % 4));
    /* álamos y árbol llorón al este, con el matorral de ese lado */
    P('arbol', 1500, 2620, 'Aspen Medium', 1900, 1); P('arbol', 1250, 2800, 'Aspen Medium', 1700, 3); P('arbol', 1750, 2500, 'Ash Medium', 1300, 2); P('arbol', 700, 2950, 'Oak Medium', 1400, 1); P('arbol', 100, 3050, 'Ash Large', 1600, 2);
    for (const [x, y, h, s] of [[1250, 2450, 300, 1], [1400, 2560, 260, 2], [1100, 2600, 320, 3], [1550, 2760, 240, 1], [1000, 2750, 280, 2], [1320, 2900, 300, 3]]) P('arbusto', x, y, s % 2 ? 'Bush 2' : 'Bush 1', h, s);
    /* la masa de árboles de hoja ancha al oeste, que tapa esa punta de la casa y sigue hacia la pileta */
    for (const [x, y, e, h, s] of [[1650, 760, 'Oak Large', 1700, 2], [1350, 250, 'Ash Large', 1500, 1], [1900, 200, 'Oak Medium', 1300, 3], [1150, -250, 'Oak Large', 1600, 1], [1700, -400, 'Ash Large', 1500, 2], [800, -600, 'Ash Medium', 1200, 3], [-150, -650, 'Oak Medium', 1300, 2], [-250, -1800, 'Ash Large', 1700, 3]]) P('arbol', x, y, e, h, s);
    /* mata al pie de los pinos, el granado, y plantas bajas contra el borde del deck al oeste */
    P('arbusto', 1480, 1420, 'Bush 1', 260, 2); P('arbusto', 1420, 1700, 'Bush 2', 150, 1); P('arbusto', 1500, -50, 'Bush 1', 380, 3); P('arbusto', 1300, -350, 'Bush 2', 320, 1);
    /* del video: el granado junto al deck de la pileta y el cañaveral al fondo de la pileta */
    P('arbusto', 760, -380, 'Bush 1', 330, 2); for (let y = -2600; y <= -900; y += 170) P('arbusto', -60 - (y % 3) * 20, y, 'Bush 2', 450 + (y % 4) * 40, 1 + (y & 3));
    for (let y = 250; y <= 760; y += 85) P('bajo', 990 + (y % 3) * 15, y, 'Bush 3', 70 + (y % 4) * 12, 1 + y % 4);
    /* el fondo: árboles altos detrás de la casa, al sur */
    for (const [x, y, e, h, s] of [[-900, 2900, 'Ash Large', 1700, 2], [-900, 2500, 'Oak Large', 1800, 1], [-1100, 2000, 'Pino', 2100, 2], [-800, 1500, 'Ash Large', 1700, 3], [-1200, 1050, 'Pino', 2200, 4], [-900, 600, 'Oak Large', 1800, 2], [-1150, 100, 'Ash Large', 1600, 1], [-800, -350, 'Pino', 2000, 3], [-1000, -800, 'Oak Large', 1700, 3]]) P('arbol', x, y, e, h, s);
    return { A: { nombre: 'Jardín de hoy (desde la foto y el video del norte)', items: it }, B: { nombre: 'Sin plantas', items: [] } }; }
  return { inicial: 'interior', AMB, veg: escVeg, orden: ['interior', 'alto', 'deckN', 'deckS', 'exterior'], luces: sin('Sin luces'), cal: sin('Sin calefacción') };
}
