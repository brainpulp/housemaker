/* Casita de Malabrigo (Santa Fe) — vivienda mínima para trabajadores de campo. Modelo de datos: única fuente de verdad, el visor dibuja todo a partir de esto.
   Pedido (Maxi, 5/11/2026, para un amigo): una habitación de 4 × 3 o 4 × 4 con una cama, sin baño, con una bacha, y una galería chica
   para sentarse a tomar mate cocido o colgar una hamaca paraguaya.
   Unidades: cm. Ejes: x de sur a norte, y de oeste a este; 0,0 en la esquina interior SO de la habitación; z sobre el piso terminado de la
   habitación. En el visor 3D: X = x, Y = z, Z = y. La galería está al ESTE (sol de la mañana, sombra a la tarde; supuesto, duda D-01).
   Todo es proyecto (estado 'proyecto'): no hay plano ni terreno todavía. Lo supuesto va con conf:'supuesto' y preguntado en DUDAS.

   La planta tiene dos variantes (4 × 4 y 4 × 3): las tablas salen de modelo(D), con D = fondo interior de la habitación (y).
   Las exportaciones fijas (MUROS, LOSAS…) son la variante por defecto (4 × 4); casa.js arma la que esté elegida en «Planta». */

export const META = { nombre: 'Casita de Malabrigo', version: '0.1.0', fecha: '2026-11-05',
  resumen: 'Casita de 4 × 4 (o 4 × 3) para trabajadores de campo en Malabrigo: una habitación con cama y bacha, sin baño, y una galería de 2,00 al este bajo el mismo techo de chapa a un agua, con lugar para la hamaca paraguaya.',
  ejes: 'x de sur a norte, y de oeste a este; 0,0 en la esquina interior SO de la habitación; alturas sobre el piso terminado. Galería al este (D-01).',
  planta: { vb: { x: -250, y: -250, w: 1000, h: 1150 }, casa: { cx: 200, cy: 320, w: 600, h: 800 }, lote: { cx: 200, cy: 320, w: 900, h: 1100 }, ejesExt: { x0: -120, x1: 520, y0: -120, y1: 760 }, ghost: 'PB',
    nivelesOrden: ['PB', 'TE'], spec: 'habitación <b>4,00 × 4,00</b> · galería <b>4,40 × 2,00</b> · chapa a un agua, 12 %' } };

export const NIVELES = { PB: { nombre: 'Planta', z: 0, conf: 'supuesto', nota: 'Piso terminado de la habitación. El terreno queda 0,15 más abajo (D-05).' }, TE: { nombre: 'Techo', z: 0 } };

/* ---------- geometría del techo (una sola agua, baja hacia la galería) ---------- */
export const PEND = 0.12;            /* 12 %: lo mínimo cómodo para chapa sinusoidal (D-04) */
export const ZB = 336;               /* cara de arriba de los tirantes sobre el eje del muro del fondo (y −10): con esto el fondo de la viga de la galería queda a +2,25 */
export const TIR = { b: 7.5, h: 15, sep: 60 };          /* tirantes 3″ × 6″ de pino, cada 0,60 */
export const CLAV = { b: 5, h: 5, sep: 95 };            /* clavaderas 2″ × 2″, cada ~0,95 */
export const POSTE = 12, VIGA = { b: 7.5, h: 20 };      /* postes 12 × 12 de madera dura; viga de la galería 3″ × 8″ */
export const E = 20;                                     /* muros: ladrillo cerámico hueco de 18 revocado (D-04) */
export const GAL = 200;                                  /* galería: del muro al eje de los postes */
/* cara de arriba de los tirantes a lo largo de y (plano del techo) */
export const zT = y => ZB - PEND * (y + 10);

export function modelo(D = 400) {
  const yF = D + 10;                    /* eje del muro del frente (E) */
  const yP = D + 20 + GAL;              /* eje de los postes */
  const sup = D === 400 ? '4,00 × 4,00' : '4,00 × 3,00';
  const topFondo = zT(0) - TIR.h;                 /* el tirante apoya en el borde interior del muro del fondo (el más bajo del plano inclinado); afuera queda 2,4 cm de mezcla */
  const topFrente = zT(D + 20) - TIR.h;           /* idem en el borde exterior del muro del frente */
  const topLado = [zT(-20) - TIR.h, zT(D + 20) - TIR.h];   /* los laterales siguen la pendiente */
  const zVigaTop = zT(yP) - TIR.h, zVigaBot = zVigaTop - VIGA.h;
  const MUROS = [
    { id: 'M-01', nivel: 'PB', a: [-10, -20], b: [-10, D + 20], e: E, tipo: 'ladrillo', carga: true, top: topLado, estado: 'proyecto', conf: 'supuesto', nombre: 'Muro sur', nota: 'Ladrillo cerámico hueco de 18 revocado (D-04). El tope sigue la pendiente del techo.' },
    { id: 'M-02', nivel: 'PB', a: [-20, -10], b: [420, -10], e: E, tipo: 'ladrillo', carga: true, top: topFondo, estado: 'proyecto', conf: 'supuesto', nombre: 'Muro del fondo (oeste)', nota: 'El más alto. Lleva la ventana de la bacha (V-02).' },
    { id: 'M-03', nivel: 'PB', a: [410, -20], b: [410, D + 20], e: E, tipo: 'ladrillo', carga: true, top: topLado, estado: 'proyecto', conf: 'supuesto', nombre: 'Muro norte', nota: 'La cama va contra este muro.' },
    { id: 'M-04', nivel: 'PB', a: [-20, yF], b: [420, yF], e: E, tipo: 'ladrillo', carga: true, top: topFrente, estado: 'proyecto', conf: 'supuesto', nombre: 'Muro del frente (este, a la galería)', nota: 'Puerta y ventana a la galería.' },
  ];
  const ABERTURAS = [
    { id: 'P-01', muro: 'M-04', d: 60, w: 90, h: 205, s: 0, tipo: 'puerta', estado: 'proyecto', conf: 'supuesto', nombre: 'Puerta a la galería', nota: '0,90 × 2,05, abre hacia adentro. En el tramo sur del frente; la ventana queda del lado de la cama.' },
    { id: 'V-01', muro: 'M-04', d: 250, w: 120, h: 110, s: 100, tipo: 'ventana', estado: 'proyecto', conf: 'supuesto', nombre: 'Ventana a la galería', nota: '1,20 × 1,10, antepecho 1,00. Con la V-02 enfrente hace la ventilación cruzada E–O (D-08).' },
    { id: 'V-02', muro: 'M-02', d: 150, w: 100, h: 100, s: 110, tipo: 'ventana', estado: 'proyecto', conf: 'supuesto', nombre: 'Ventana sobre la bacha', nota: '1,00 × 1,00, antepecho 1,10 (sobre la mesada de 0,90).' },
  ];
  const LOCALES = [
    { id: 'L-01', nivel: 'PB', nombre: 'Habitación', poly: [[0, 0], [400, 0], [400, D], [0, D]], estado: 'proyecto', conf: 'supuesto', nota: `${sup} interior: cama, mesa, mesada con bacha, placard. Sin baño (pedido).` },
    { id: 'L-02', nivel: 'PB', nombre: 'Galería', poly: [[-20, D + 20], [420, D + 20], [420, yP], [-20, yP]], estado: 'proyecto', conf: 'supuesto', nota: '4,40 × 2,00 (del muro al eje de los postes), bajo el mismo techo. Piso 3 cm más bajo que la habitación. Hamaca entre los dos postes (4,22 libres).' },
  ];
  const LOSAS = [
    { id: 'LO-01', nivel: 'PB', nombre: 'Platea de la habitación', z: 0, e: 12, poly: [[-20, -20], [420, -20], [420, D + 20], [-20, D + 20]], estado: 'proyecto', conf: 'supuesto', nota: 'Platea de hormigón de 12 con carpeta, 0,15 sobre el terreno (D-05: la fundación depende del suelo).' },
    { id: 'LO-02', nivel: 'PB', nombre: 'Piso de la galería', z: -3, e: 12, poly: [[-20, D + 20], [420, D + 20], [420, yP + 10], [-20, yP + 10]], estado: 'proyecto', conf: 'supuesto', nota: 'Cemento alisado, 3 cm más bajo que la habitación para que no entre el agua. Los postes apoyan acá.' },
  ];
  /* estructura del techo: tirantes a lo largo de la pendiente (y) apoyados en los dos muros y en la viga de la galería; clavaderas cruzadas; chapa */
  const ESTRUCTURA = [
    { id: 'PO-1', tipo: 'columna', pos: [-14, yP], sec: `${POSTE}×${POSTE}`, z: [-3, zVigaBot], cat: 'poste', estado: 'proyecto', conf: 'supuesto', nombre: 'Poste sur de la galería', nota: 'Madera dura (quebracho o urunday) 12 × 12, a ras del muro sur. Gancho de la hamaca a 1,90 (D-07).' },
    { id: 'PO-2', tipo: 'columna', pos: [414, yP], sec: `${POSTE}×${POSTE}`, z: [-3, zVigaBot], cat: 'poste', estado: 'proyecto', conf: 'supuesto', nombre: 'Poste norte de la galería', nota: 'Idem PO-1. Entre los dos postes quedan 4,22 libres para la hamaca.' },
    { id: 'VG-1', tipo: 'viga', a: [-20, yP], b: [420, yP], sec: `${VIGA.b}×${VIGA.h}`, z: zVigaTop, estado: 'proyecto', conf: 'supuesto', nombre: 'Viga de la galería', nota: 'Madera dura 3″ × 8″ de poste a poste (4,40 de largo, 4,28 de luz). Recibe los tirantes. Sección a verificar (D-04).' },
  ];
  const nT = Math.round(420 / TIR.sep), dT = 420 / nT;
  for (let k = 0; k <= nT; k++) { const x = -10 + k * dT, y0 = -40, y1 = yP + VIGA.b / 2;
    ESTRUCTURA.push({ id: `TI-${k + 1}`, nivel: 'TE', tipo: 'tirante', a: [x, y0], b: [x, y1], sec: `${TIR.b}×${TIR.h}`, zt: [zT(y0), zT(y1)], estado: 'proyecto', conf: 'supuesto', nombre: `Tirante ${k + 1} de ${nT + 1}`, nota: `Pino 3″ × 6″ a lo largo de la pendiente, cada ${(dT / 100).toFixed(2).replace('.', ',')}; apoya en el muro del fondo, en el del frente y en la viga de la galería. Vuela 0,20 atrás del muro del fondo.` }); }
  const nC = Math.round((yP + 15 - (-35)) / CLAV.sep), dC = (yP + 15 + 35) / nC;
  for (let k = 0; k <= nC; k++) { const y = -35 + k * dC;
    ESTRUCTURA.push({ id: `CL-${k + 1}`, nivel: 'TE', tipo: 'clavadera', a: [-35, y], b: [435, y], sec: `${CLAV.b}×${CLAV.h}`, zt: zT(y), estado: 'proyecto', conf: 'supuesto', nombre: `Clavadera ${k + 1} de ${nC + 1}`, nota: `Pino 2″ × 2″ cruzada sobre los tirantes, cada ~${(dC / 100).toFixed(2).replace('.', ',')}; la chapa se fija a ellas. Vuela 0,15 a cada lado.` }); }
  const TECHOS = [
    { id: 'T-01', poly: [[-35, -40], [435, -40], [435, yP + 30], [-35, yP + 30]], baja: '+y', pend: '12 %', mat: 'chapa', z: [zT(-40) + CLAV.h + 1, zT(yP + 30) + CLAV.h + 1], e: 1, estado: 'proyecto', conf: 'supuesto', nombre: 'Chapa a un agua', nota: 'Chapa sinusoidal galvanizada sobre las clavaderas, al 12 %, bajando hacia la galería. Vuela 0,20 atrás, 0,15 a los lados y 0,30 adelante de los postes. Canaleta en el frente (no dibujada).' },
  ];
  const IMPLANTACION = [
    { id: 'TE-01', tipo: 'pasto', nombre: 'Terreno', poly: [[-700, -700], [1100, -700], [1100, yP + 900], [-700, yP + 900]], z: -15, estado: 'existente', conf: 'supuesto', nota: 'Campo. La casita queda 0,15 sobre el terreno natural (D-05).' },
  ];
  const EJES = [
    { id: '1', dir: 'v', pos: -10, nota: 'Eje del muro sur' }, { id: '2', dir: 'v', pos: 410, nota: 'Eje del muro norte · 4,20' },
    { id: 'A', dir: 'h', pos: -10, nota: 'Eje del muro del fondo (O)' }, { id: 'B', dir: 'h', pos: yF, nota: `Eje del muro del frente (E) · ${((yF + 10) / 100).toFixed(2).replace('.', ',')}` }, { id: 'C', dir: 'h', pos: yP, nota: 'Eje de los postes de la galería · 2,00 del muro' },
  ];
  const COTAS = [
    { a: [0, 0], b: [400, 0], off: -70, txt: '4,00' }, { a: [0, 0], b: [0, D], off: -70, txt: (D / 100).toFixed(2).replace('.', ',') },
    { a: [0, D + 20], b: [0, yP], off: -70, txt: '2,00' },
  ];
  return { D, yF, yP, zVigaTop, zVigaBot, MUROS, ABERTURAS, LOCALES, LOSAS, ESTRUCTURA, TECHOS, IMPLANTACION, EJES, COTAS };
}

const T = modelo(400);
export const MUROS = T.MUROS, ABERTURAS = T.ABERTURAS, LOCALES = T.LOCALES, LOSAS = T.LOSAS, ESTRUCTURA = T.ESTRUCTURA, TECHOS = T.TECHOS, IMPLANTACION = T.IMPLANTACION, EJES = T.EJES, COTAS = T.COTAS;
export const ESCALERAS = [], BARANDAS = [], DECK = [], CHIMENEAS = [], CLARABOYAS = [];
export const VIDEO = [];

export const DUDAS = [
  { id: 'D-01', ref: ['L-02', 'PO-1', 'PO-2'], q: 'Orientación: puse la galería al este (sol de la mañana para el mate cocido, sombra a la tarde, el muro ciego al oeste que es el que más calienta). ¿Hay algo en el terreno (camino, árboles, vista, viento) que pida otra cosa?' },
  { id: 'D-02', ref: ['L-01'], q: '¿4,00 × 4,00 o 4,00 × 3,00? Las dos están en «Planta». Con 4 × 4 entran cama, mesa con dos sillas, mesada con bacha y placard sin apretar; con 4 × 3 la mesa queda al lado de la cama.' },
  { id: 'D-03', ref: ['V-02', 'L-01'], q: 'Bacha: ¿hay agua (red, pozo, tanque) y adónde desagota? Puse la mesada bajo la ventana del fondo; si el agua viene de otro lado conviene correrla.' },
  { id: 'D-04', ref: ['M-01', 'M-02', 'M-03', 'M-04', 'T-01', 'VG-1', 'TI-1'], q: 'Materiales supuestos: ladrillo cerámico hueco de 18 revocado, chapa sinusoidal al 12 % sobre tirantes de pino 3″ × 6″ cada 0,60 y clavaderas 2″ × 2″, viga de galería de madera dura 3″ × 8″ y postes 12 × 12. ¿Es lo que se consigue allá? La sección de la viga (4,28 de luz) la tiene que verificar quien construya.' },
  { id: 'D-05', ref: ['LO-01', 'LO-02', 'TE-01'], q: 'Fundación: dibujé una platea de 12 con el piso 0,15 sobre el terreno. Depende del suelo de Malabrigo (si es arcilloso hace falta más): lo define quien construya.' },
  { id: 'D-06', ref: ['T-01', 'CI-01'], q: 'Calor: chapa sola sin cielorraso es un horno en enero. Puse como opción («Cielorraso») machimbre con lana de vidrio bajo los tirantes. ¿Va, o se resuelve con chapa aislada (sándwich)?' },
  { id: 'D-07', ref: ['PO-1', 'PO-2', 'HA-1'], q: 'Hamaca: colgada de ganchos a 1,90 en la cara interna de los dos postes, con 4,22 libres entre ellos. Una hamaca paraguaya pide de 3,50 a 4,50 entre ganchos: entra. ¿Queda bien a lo largo del frente, o la prefieren de un poste a la pared?' },
  { id: 'D-08', ref: ['V-01', 'V-02', 'P-01'], q: 'Ventanas y puerta: ¿con mosquitero y reja? ¿Postigones? No están dibujados.' },
  { id: 'D-09', ref: ['L-01'], q: '¿Cuántas personas? El escenario A tiene una cama de una plaza; el B, una cucheta para dos.' },
];

export const CAMBIOS = [
  { fecha: '2026-11-05', v: '0.1.0', txt: 'Primera versión de la casita (Maxi 5/11, para un amigo): habitación de 4 × 4 (variante 4 × 3), sin baño, con mesada y bacha bajo la ventana del fondo, puerta y ventana a la galería; galería de 2,00 al este bajo el mismo techo de chapa a un agua (12 %), con dos postes de madera dura, viga 3″ × 8″, tirantes 3″ × 6″ cada 0,60 y clavaderas; hamaca paraguaya entre los postes; opción de cielorraso de machimbre con lana. Muebles de partida (A: una cama; B: cucheta), recorrido a pie y vuelo de dron, asoleamiento de Malabrigo y térmica con el clima de Reconquista. Todo es supuesto: nueve dudas para el amigo.' },
];
