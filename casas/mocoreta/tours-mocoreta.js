/* Tours de Mocoretá: por ahora sólo un vuelo de dron alrededor de la casa. Las caminatas llegan cuando estén las escaleras y el interior.
   Ejes: x de sur a norte, y de oeste a este. El motor (motor/tours.js) es el mismo de las casas. */
export const TOURS_MOCORETA = [
  { id: 'dron-vuelta', n: 'Dron: vuelta alrededor de la casa', tipo: 'orbit', c: [350, 100, 1150], r: 2600, h: 900, dur: 45, a0: 0 },
];
export const ESCALERAS_MOCORETA = {};
