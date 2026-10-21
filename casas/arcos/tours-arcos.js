/* Tours de Arcos: caminatas a la altura de los ojos y vuelos de dron. El motor (motor/tours.js) es el mismo de Carhué.
   Coordenadas del plano: x de sur a norte, y de oeste (jardín) a este (calle); lvl = piso aproximado del tramo (el tour lee el piso real con rayos). */
export const TOURS_ARCOS = [
  { id: 'jardin-living', n: 'Caminata: del jardín al estar hundido y al living', tipo: 'walk', seg: [
    { walk: [[430, 1900], [430, 2250]], lvl: 0 }, { look: [430, 150, 2700], t: 2 },
    { walk: [[480, 2450], [520, 2800]], lvl: 22 }, { look: [200, 330, 2700], t: 2.5 }, { look: [520, 170, 3500], t: 2 },
    { walk: [[520, 3200], [520, 3600]], lvl: 72 }, { look: [520, 160, 3950], t: 2 }] },
  { id: 'subir-2p', n: 'Caminata: del primer piso al dormitorio del 2P', tipo: 'walk', seg: [
    { walk: [[640, 3300], [805, 3180]], lvl: 417 }, { stair: 'p2' },
    { walk: [[720, 2779], [560, 2779], [350, 2650]], lvl: 613 }, { look: [300, 700, 2380], t: 3 }] },
  { id: 'subir-terraza', n: 'Caminata: del 2P a la terraza', tipo: 'walk', seg: [
    { walk: [[760, 2760], [703, 2850]], lvl: 613 }, { stair: 'tz' },
    { walk: [[703, 3200], [720, 3450], [540, 3600]], lvl: 757 }, { look: [540, 800, 3950], t: 2.5 }, { look: [300, 820, 3300], t: 2 }] },
  { id: 'dron-vuelta', n: 'Dron: vuelta alrededor de la casa', tipo: 'orbit', c: [432, 400, 3100], r: 2200, h: 1600, dur: 40, a0: 0 },
  { id: 'dron-jardin-calle', n: 'Dron: del jardín, por arriba del techo, a la calle', tipo: 'fly', dur: 28, k: [
    [[430, 700, 1200], [430, 300, 2400]], [[430, 1300, 2300], [430, 500, 3100]], [[430, 1150, 4300], [430, 450, 3600]], [[430, 450, 4800], [430, 350, 3800]]] },
];
/* qué piezas son las pedadas de cada escalera que sube un tour */
export const ESCALERAS_ARCOS = { p2: p => p.id === 'E-04', tz: p => p.id === 'E-05' };
