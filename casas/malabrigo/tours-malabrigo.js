/* Tours de la casita: una caminata desde el campo a la galería y adentro, y un vuelo de dron. El motor (motor/tours.js) es el mismo de las casas.
   Ejes: x de sur a norte, y de oeste (fondo) a este (galería); lvl = piso aproximado del tramo (el tour lee el piso real con rayos). */
export const TOURS_MALABRIGO = [
  { id: 'campo-galeria', n: 'Caminata: del campo a la galería y adentro', tipo: 'walk', seg: [
    { walk: [[200, 1200], [200, 760]], lvl: -15 }, { look: [200, 170, 420], t: 2 },
    { walk: [[200, 560], [90, 500]], lvl: -3 }, { look: [250, 160, 540], t: 2 },
    { walk: [[85, 440], [85, 330], [200, 250]], lvl: 0 }, { look: [350, 120, 100], t: 2.5 }, { look: [170, 150, 30], t: 2 }] },
  { id: 'dron-vuelta', n: 'Dron: vuelta alrededor de la casita', tipo: 'orbit', c: [200, 150, 300], r: 1100, h: 650, dur: 36, a0: 0 },
];
export const ESCALERAS_MALABRIGO = {};
