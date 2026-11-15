/* Equipamiento de Mocoretá. El motor (motor/equipamiento.js) es el mismo de las casas. Ejes: x de sur a norte, y de oeste a este.
   Giro r: 0 = el frente del mueble mira al este, 90 = al norte, 180 = al oeste, −90 = al sur.
   Interior: la cocina como está hoy, del croquis de Maxi del 3/11 (la misma de casas/cocinas/equipamiento-cocinas.js), trasladada al origen COC del modelo
   (cara interior del ventanal sur, cara este de la pared O). Lo demás del interior todavía no tiene muebles (D-10). */
import { COC } from './modelo.js';
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
    deckN: { n: 'Deck norte', piso: 0, vista: { p: [1500, 350, 1800], t: [750, 60, 1200] }, esc: vacio },
    deckS: { n: 'Deck sur', piso: 0, vista: { p: [-900, 300, 1500], t: [-120, 60, 1200] }, esc: vacio },
  };
  const sin = n => () => ({ A: { nombre: n, items: [] } });
  return { inicial: 'interior', AMB, orden: ['interior', 'deckN', 'deckS'], luces: sin('Sin luces'), cal: sin('Sin calefacción') };
}
