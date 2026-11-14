/* Equipamiento de Mocoretá: todavía sin muebles (falta la distribución interior, D-10). Un ambiente por local, vacío.
   El motor (motor/equipamiento.js) es el mismo de las casas. Ejes: x de sur a norte, y de oeste a este. */
export function equipMocoreta() {
  const vacio = () => ({ A: { nombre: 'Vacío', items: [] } });
  const AMB = {
    interior: { n: 'Interior', piso: 0, vista: { p: [275, 600, 2900], t: [275, 100, 1400] }, esc: vacio },
    deckN: { n: 'Deck norte', piso: 0, vista: { p: [1500, 350, 1800], t: [750, 60, 1200] }, esc: vacio },
    deckS: { n: 'Deck sur', piso: 0, vista: { p: [-900, 300, 1500], t: [-120, 60, 1200] }, esc: vacio },
  };
  const sin = n => () => ({ A: { nombre: n, items: [] } });
  return { inicial: 'interior', AMB, orden: ['interior', 'deckN', 'deckS'], luces: sin('Sin luces'), cal: sin('Sin calefacción') };
}
