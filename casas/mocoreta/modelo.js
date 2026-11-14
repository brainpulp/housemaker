/* Mocoretá — la casa de Maxi en Ingeniero Maschwitz. Modelo de datos: única fuente de verdad, el visor dibuja todo a partir de esto.
   Fuente: la descripción verbal de Maxi del 14/11/2026 (no hay plano ni calco cargado; el esqueleto existe en Onshape, documento «Mocoretá»).
   Casa de madera sobre pilotes: 14 columnas en dos filas de 7, cada 4,00 a lo largo (E–O) y a 5,50 entre filas (N–S); 24,00 de largo más
   1,00 en voladizo al oeste. Ventanales de 2,00 × 2,70 en casi todo el perímetro, deck de 4,00 al norte y deck chico al sur.
   Unidades: cm. Ejes: x de sur a norte (0 en el eje de la fila sur de columnas), y de oeste a este (0 en el eje del último par de columnas,
   el del oeste; el voladizo va de y −100 a 0). z: 0 en el piso interior terminado. En el visor 3D: X = x, Y = z, Z = y.
   Módulos: 6, de 4,00, numerados de ESTE a OESTE (Maxi): el módulo k va del par de columnas k al k+1. El par 1 está en y 2400 y el 7 en y 0.
   Lo que Maxi dijo va con conf 'estimado' (él dio medidas aproximadas); lo que supuse yo va con conf 'supuesto' y preguntado en DUDAS. */

export const META = { nombre: 'Mocoretá', version: '0.3.1', fecha: '2026-11-14',
  resumen: 'Casa de madera sobre pilotes en Ingeniero Maschwitz: 24,00 × 5,50 más 1,00 en voladizo al oeste, ventanales en casi todo el perímetro, deck de 4,00 al norte, deck chico al sur y chapa a un agua. Primera etapa: esqueleto y envolvente, según la descripción de Maxi.',
  ejes: 'x de sur a norte (0 en la fila sur de columnas), y de oeste a este (0 en el par de columnas del oeste); alturas sobre el piso interior.',
  planta: { vb: { x: -500, y: -350, w: 2100, h: 3000 }, casa: { cx: 275, cy: 1150, w: 560, h: 2510 }, lote: { cx: 500, cy: 1150, w: 1900, h: 2900 }, ejesExt: { x0: -330, x1: 1480, y0: -180, y1: 2480 }, ghost: 'PB',
    nivelesOrden: ['PB', 'TE'], spec: 'casa <b>25,00 × 5,50</b> · deck norte <b>4,00</b> · chapa a un agua' } };

export const NIVELES = { PB: { nombre: 'Planta', z: 0, conf: 'estimado', nota: 'Piso interior terminado. La viga perimetral del piso sobresale 3 cm sobre el piso (Maxi 14/11). El terreno queda 1,47 más abajo: 1,20 hasta el fondo de esa viga, que mide 0,30 (D-01).' }, TE: { nombre: 'Techo', z: 0 } };

/* ---------- medidas ---------- */
export const PASO = 400, ANCHO = 550, NPAR = 7, LARGO = PASO * (NPAR - 1), VOL = 100;   /* Maxi: 4,00 entre columnas, 5,50 entre filas, 1,00 de voladizo al oeste */
/* Encuentro de fachada (Maxi 14/11, segunda tanda), de afuera hacia adentro en la fila sur (la norte es su espejo):
   columna real 15 × 15 por FUERA de las vigas (eje en x 0; cara interior en x 7,5) · viga del piso de 15 de ancho con la cara de afuera en x 7,5
   (coplanar con las falsas columnas y 1 cm por fuera del vidrio) · vidrio en x 8,5 · viga de arriba de 7, centrada en el vidrio.
   Con los ejes de columnas a 5,50 quedan 5,33 entre vidrios: coincide con los 5,35 que Maxi midió en la cocina (croquis del 3/11). */
export const COL = 15, FC = 10;              /* columna 15 × 15 (Maxi); falsa columna: 10 de fondo, supuesto (D-02) */
export const VP = { b: 15, h: 30 };          /* viga perimetral del piso: 30 de alto (Maxi), «diría 15» de ancho */
export const VA = { b: 7, h: 30 };           /* viga perimetral de arriba: 7 de ancho, centrada en el vidrio */
export const VT = { b: 7, h: 25 };           /* viga transversal 25 × 7 en cada par de columnas (Maxi) */
export const VD = { b: 10, h: 27 };          /* vigas de los decks: supuestas (D-04) */
export const PDK = 6;                        /* postes exteriores de los decks: mucho más delgados, «algo así como 6 × 6» (Maxi) */
export const RES = 3;                        /* el piso (interior y deck) queda 3 cm por debajo de la viga perimetral del piso */
export const HV = 270, HC = 300;             /* ventanal de 2,70; cielorraso a 3,00 (Maxi) */
export const Z0 = RES, ZV = RES + HV, ZA = ZV + VA.h;   /* el vidrio va de la viga del piso (+0,03) a la de arriba (+2,73); tope de la viga de arriba +3,03 */
export const TERR = RES - VP.h - 120;        /* terreno: 1,20 bajo el fondo de la viga del piso (D-01) */
export const ANTE = 100;                     /* «de la cintura para abajo es madera»: 1,00 sobre el piso, supuesto (D-08) */
export const TIRP = { b: 5, h: 15, sep: 50 }, TIRC = { b: 5, h: 15, sep: 60 };   /* tirantes de piso y de cielorraso: tentativos (D-05) */
export const TABLA = 2.5, CIELO = 2;
export const DECKN = 400, DECKS = { fondo: 250, y: [1200, 2000] };   /* deck norte de 4,00 en todo el largo; deck sur 2,50 × 8,00 */
export const ALERO = 35, CAMARA = 50;        /* chapa: vuela 0,35 desde el panel de la cámara (Maxi 14/11, sobre la captura); 0,50 más alta al norte que al sur */
const CI = COL / 2;                                          /* cara interior de las columnas = cara de afuera de la viga del piso y de las falsas columnas */
export const GS = CI + 1, GN = ANCHO - CI - 1;               /* planos del vidrio sur y norte */
const PS0 = CI + VP.b / 2, PN0 = ANCHO - PS0;                /* ejes de las vigas del piso sur y norte */
const FS0 = CI + FC / 2, FN0 = ANCHO - FS0;                  /* ejes de las falsas columnas */
const PIS = CI + VP.b, PIN = ANCHO - PIS;                    /* caras interiores de las vigas del piso */
const AIS = GS + VA.b / 2, AIN = ANCHO - AIS;                /* caras interiores de las vigas de arriba */
export const XS = GS - VA.b / 2, XN = ANCHO - XS, YO = -VOL - VA.b / 2, YE = LARGO + VA.b / 2;   /* caras de afuera de las vigas de arriba: de ahí vuela la chapa */
const PYO = -VOL - VP.b / 2, PYE = LARGO + VP.b / 2;         /* puntas de las vigas del piso */
/* panel (cenefa) de la cámara del techo: sobresale hasta quedar coplanar con la cara de AFUERA de las columnas (Maxi 14/11); de ahí vuela la chapa */
export const CXS = -CI, CXN = ANCHO + CI, CYO = PYO, CYE = PYE;
/* cara de abajo de la chapa: arranca sobre la viga de arriba en la cara sur del panel y sube 0,50 hasta la cara norte */
export const zR = x => ZA + CAMARA * (x - CXS) / (CXN - CXS);
export const yPar = k => LARGO - (k - 1) * PASO;          /* y del par de columnas k (1 = este … 7 = oeste) */
export const modulo = k => [yPar(k + 1), yPar(k)];        /* [y oeste, y este] del módulo k */

/* ---------- desnivel del módulo 2 y sillón en C (Maxi 14/11) ---------- */
/* «En el módulo 2 hay un desnivel en el piso de dos alzadas que ocupa todo el módulo, menos un pasillo sur de 80 cm». Lo entendí como un pozo
   (baja dos alzadas), con el sillón en C adentro, contra los lados sur, este y oeste, abierto al ventanal norte (D-12). */
export const ALZ = 17;                                   /* alzada supuesta: 17 cm → el desnivel baja 0,34 */
const [m2o, m2e] = [LARGO - 2 * PASO, LARGO - PASO];     /* módulo 2: y 1600–2000 */
export const DES = { x: [PIS + 80, PIN], y: [m2o, m2e], z: -2 * ALZ,
  resp: 45,          /* respaldo que termina en una repisa de 45 de ancho (Maxi) */
  asiento: 60, hAs: 42, hResp: 80,   /* fondo del asiento, altura del asiento y de la repisa sobre el piso del pozo: supuestos */
  corte: 150,        /* los brazos este y oeste se interrumpen a 1,50 del ventanal norte (Maxi) */
  pedada: 28 };      /* pedada supuesta del escalón intermedio */
/* corredizas de hierro (oxidado): la del norte corre por dentro; la del sur cuelga por fuera (Maxi 14/11). x = eje de la hoja; dy = hacia dónde abre (D-06) */
export const HOJA = { e: 3, perfil: 4, N: { x: ANCHO - CI - FC - 2.5, dy: 192 }, S: { x: CI - 2.5, dy: -192 } };

/* ---------- fachadas ---------- */
/* Sur, por módulo (Maxi): 1 ventanal · 2 y 3 vidrio de la cintura para arriba · 4 ventanal (con la puerta de atrás) · 5 y 6 de la cintura para arriba. */
const SUR = { 1: 'vidrio', 2: 'medio', 3: 'medio', 4: 'vidrio', 5: 'medio', 6: 'medio' };
const PUERTA_N = 6, PUERTA_S = 5;   /* paño 6: mitad oeste del módulo 3, pegado al cuarto par (y 1200–1400). Paño 5: mitad ESTE del módulo 3 (y 1400–1600), Maxi 14/11 (D-06) */
const MUROS = [], ABERTURAS = [];
/* paños: 12 de 2,00 (dos por módulo, numerados de este a oeste) y el 13, de 1,00, en el voladizo */
/* las columnas reales quedan por fuera y tapan la junta: los paños llegan al ancho de la columna (el marco entra 2 cm más afuera que su cara interior); en las falsas columnas, a su cara */
const pano = i => { if (i === 13) return [-VOL - 3, -CI];
  const yE = LARGO - (i - 1) * 200, yW = yE - 200, borde = y => (y % PASO === 0 ? COL : FC) / 2; return [yW + borde(yW), yE - borde(yE)]; };
const n2 = i => String(i).padStart(2, '0');
for (const [f, x] of [['N', GN], ['S', GS]]) for (let i = 1; i <= 13; i++) {
  const [y0, y1] = pano(i), k = Math.min(7, Math.ceil(i / 2)), id = `M${f}-${n2(i)}`, lado = f === 'N' ? 'norte' : 'sur', mod = i === 13 ? 'voladizo' : `módulo ${k}`;
  const puerta = (f === 'N' && i === PUERTA_N) || (f === 'S' && i === PUERTA_S), tipo = i === 13 ? 'ciego' : f === 'N' || puerta ? 'vidrio' : SUR[k];
  /* el metro del voladizo oeste es ciego, de madera, al norte y al sur (Maxi 14/11) */
  if (tipo === 'ciego') { MUROS.push({ id, nivel: 'PB', a: [x, y0], b: [x, y1], e: 6, tipo: 'madera', z0: Z0, top: ZV, estado: 'existente', conf: 'estimado', nombre: `Paño ciego del voladizo oeste, ${lado}`, nota: 'Maxi 14/11: el paño angosto del voladizo oeste es ciego, de madera, tanto al norte como al sur.' }); continue; }
  if (tipo === 'vidrio') MUROS.push({ id, nivel: 'PB', a: [x, y0], b: [x, y1], e: 6, tipo: 'vidrio', z0: Z0, top: ZV, modulos: 1, corrediza: puerta, estado: 'existente', conf: i === 13 ? 'supuesto' : 'estimado',
    nombre: puerta ? `Puerta corrediza ${f === 'N' ? 'de entrada (al deck norte)' : 'de atrás (al deck sur)'}` : `Ventanal ${lado}, ${mod}`,
    nota: puerta ? (f === 'N' ? 'Maxi 14/11: uno de los vidrios se transforma en corredizo, justo a la izquierda de la cuarta columna mirando de norte a sur, más o menos en el centro de la casa. Hoja de hierro (oxidado) que corre por DENTRO. Supuse que abre hacia el este (D-06).' : 'Maxi 14/11: la puerta de atrás está en el módulo 3 y el panel móvil es su mitad este; da al deck sur. Hoja de hierro (oxidado) que cuelga por FUERA, de un riel sobre la viga de arriba; abre hacia el oeste, porque al este está la columna del par 3 (D-06).')
      : i === 13 ? 'El metro del voladizo: supuse que el ventanal sigue (D-07).' : 'Maxi 14/11: ventanal de 2,00 × 2,70 entre falsa columna y falsa columna; las columnas reales quedan por fuera del vidrio.' });
  else { MUROS.push({ id, nivel: 'PB', a: [x, y0], b: [x, y1], e: 6, tipo: 'madera', z0: Z0, top: ZV, estado: 'existente', conf: i === 13 ? 'supuesto' : 'estimado', nombre: `Paño sur, ${mod}: madera abajo y vidrio arriba`,
      nota: `Maxi 14/11: «de la cintura para arriba es vidrio, de la cintura para abajo es madera». Altura de la madera supuesta en ${ANTE / 100} m (D-08).` });
    ABERTURAS.push({ id: `V-S${n2(i)}`, muro: id, d: 0, w: y1 - y0, h: HV - ANTE + RES, s: ANTE - RES, tipo: 'ventana', estado: 'existente', conf: 'supuesto', nombre: `Vidrio fijo sur, ${mod}`, nota: 'De la cintura al dintel (D-08).' }); }
}
/* este (Maxi 14/11, tercera tanda): madera ciega con una ventana de piso a techo de 1,00 de ancho en la punta norte. Oeste: madera ciega con una ventana de 1,00 × 1,50, antepecho 0,75 */
{ const L = GN - GS - 6;
  MUROS.push({ id: 'ME-01', nivel: 'PB', a: [GS + 3, LARGO], b: [GN - 3, LARGO], e: 6, tipo: 'madera', z0: Z0, top: ZV, estado: 'existente', conf: 'estimado', nombre: 'Pared este', nota: 'Maxi 14/11: madera ciega, salvo una ventana de piso a techo de 1,00 de ancho en el lado norte de la cara este.' });
  ABERTURAS.push({ id: 'V-E01', muro: 'ME-01', d: L - 100, w: 100, h: HV, s: 0, tipo: 'ventana', estado: 'existente', conf: 'estimado', nombre: 'Ventana este, de piso a techo', nota: 'Maxi 14/11: 1,00 de ancho, de piso a techo, en el lado norte de la cara este. La pegué a la esquina norte (D-09).' });
  const a0 = GS + 3, a1 = GN - 3;
  MUROS.push({ id: 'MO-01', nivel: 'PB', a: [a0, -VOL], b: [a1, -VOL], e: 6, tipo: 'madera', z0: Z0, top: ZV, estado: 'existente', conf: 'estimado', nombre: 'Pared oeste', nota: 'Maxi 14/11: el lado oeste no tiene ventanal, sólo una ventana pequeña; el resto es madera ciega.' });
  ABERTURAS.push({ id: 'V-O01', muro: 'MO-01', d: (a1 - a0 - 100) / 2, w: 100, h: 150, s: 75 - RES, tipo: 'ventana', estado: 'existente', conf: 'estimado', nombre: 'Ventana oeste', nota: 'Maxi 14/11: 1,00 de ancho por 1,50 de alto, antepecho a 0,75. La centré en la pared: la posición es supuesta (D-07).' }); }

/* ---------- estructura ---------- */
const ESTRUCTURA = [];
const col = (id, x, y, sec, z, nombre, nota, conf = 'supuesto', cat = 'columna') => ESTRUCTURA.push({ id, nivel: 'PB', tipo: 'columna', pos: [x, y], sec: `${sec}×${sec}`, z, cat, estado: 'existente', conf, nombre, nota });
const viga = (id, a, b, S, z, nombre, nota, conf = 'estimado') => ESTRUCTURA.push({ id, nivel: 'PB', tipo: 'viga', a, b, sec: `${S.b}×${S.h}`, z, estado: 'existente', conf, nombre, nota });
for (let k = 1; k <= NPAR; k++) for (const [f, x] of [['S', 0], ['N', ANCHO]])
  col(`C-${k}${f}`, x, yPar(k), COL, [TERR, ZA], `Columna ${k} ${f === 'S' ? 'sur' : 'norte'}`, 'Maxi 14/11: 14 columnas de 15 × 15, dos filas de 7, cada 4,00 y a 5,50 entre filas. Van por FUERA de las vigas perimetrales: la cara interior queda casi a plomo con el vidrio y sobresalen 15 hacia afuera. De una pieza, de la tierra hasta abajo del panel de la cámara del techo, que sobresale hasta su cara de afuera.', 'estimado');
for (let k = 1; k < NPAR; k++) for (const [f, x] of [['S', FS0], ['N', FN0]])
  col(`FC-${k}${f}`, x, yPar(k) - PASO / 2, FC, [Z0, ZV], `Falsa columna del módulo ${k}, ${f === 'S' ? 'sur' : 'norte'}`, 'Maxi 14/11: parte en dos el módulo de 4,00; coplanar por fuera con la viga perimetral del piso (1 cm por fuera del vidrio). Fondo de 10 supuesto (D-02).', 'estimado', 'falsa');
/* el voladizo oeste no tiene parantes (Maxi 14/11: «si no, no sería voladizo»): los paños de madera se encuentran en la esquina */
{ const nota = 'Maxi 14/11: viga perimetral del piso, 30 de alto y unos 15 de ancho, a ~1,20 de la tierra; por fuera es coplanar con las falsas columnas (1 cm por fuera del vidrio) y el resto sobresale hacia adentro. El piso queda 3 cm por debajo de su cara de arriba. Acompaña el voladizo de 1,00 al oeste.';
  viga('VP-S', [PS0, PYO], [PS0, PYE], VP, RES, 'Viga perimetral del piso, sur', nota); viga('VP-N', [PN0, PYO], [PN0, PYE], VP, RES, 'Viga perimetral del piso, norte', nota);
  viga('VP-E', [PIS - 2.5, LARGO], [PIN + 2.5, LARGO], VP, RES, 'Viga perimetral del piso, este', nota + ' Encuentro de esquina supuesto (D-02).'); viga('VP-O', [PIS - 2.5, -VOL], [PIN + 2.5, -VOL], VP, RES, 'Viga perimetral del piso, oeste (punta del voladizo)', nota + ' Encuentro de esquina supuesto (D-02).'); }
{ const nota = 'Maxi 14/11: viga perimetral de arriba, sobre los vidrios: 7 de ancho, centrada en el vidrio (el vidrio toca el centro de su cara de abajo). Alto de 30 como la del piso.';
  viga('VA-S', [GS, YO], [GS, YE], VA, ZA, 'Viga perimetral de arriba, sur', nota); viga('VA-N', [GN, YO], [GN, YE], VA, ZA, 'Viga perimetral de arriba, norte', nota);
  viga('VA-E', [AIS - 3.5, LARGO], [AIN + 3.5, LARGO], VA, ZA, 'Viga perimetral de arriba, este', nota); viga('VA-O', [AIS - 3.5, -VOL], [AIN + 3.5, -VOL], VA, ZA, 'Viga perimetral de arriba, oeste', nota); }
for (let k = 2; k <= NPAR; k++) viga(`VT-${k}`, [AIS, yPar(k)], [AIN, yPar(k)], VT, HC, `Viga transversal del par ${k}`, 'Maxi 14/11: en cada par de columnas, una viga transversal de 25 × 7 del ancho de la casa. La puse arriba, con la cara superior a la altura del cielorraso; en el par 1 (este) ese lugar lo ocupa la viga perimetral (D-03).');
/* decks: Maxi dio las medidas del piso; la estructura (postes, vigas) es supuesta (D-04) */
const [dy0, dy1] = DECKS.y, xDN = ANCHO + DECKN, xDS = -DECKS.fondo, nd = 'Estructura del deck supuesta: Maxi sólo dio las medidas del piso (D-04).', npd = 'Maxi 14/11: las columnas exteriores del deck son mucho más delgadas, de unos 6 × 6. Cantidad y posición supuestas: una por cada par de columnas de la casa (D-04).';
const DN0 = ANCHO - CI, DS0 = CI;      /* los decks arrancan en la cara de afuera de la viga del piso; las columnas, que sobresalen 15, los atraviesan */
for (let k = 1; k <= NPAR; k++) col(`PD-${k}`, xDN, yPar(k), PDK, [TERR, -VD.h], `Poste ${k} del deck norte`, npd, 'estimado', 'pilote');
viga('VD-N', [xDN, -VOL - VD.b / 2], [xDN, LARGO + VD.b / 2], VD, 0, 'Viga de borde del deck norte', nd, 'supuesto');
viga('VD-E', [ANCHO + CI, LARGO], [xDN - VD.b / 2, LARGO], VD, 0, 'Viga este del deck norte', nd, 'supuesto'); viga('VD-O', [DN0, -VOL], [xDN - VD.b / 2, -VOL], VD, 0, 'Viga oeste del deck norte', nd, 'supuesto');
[dy0, (dy0 + dy1) / 2, dy1].forEach((y, i) => col(`PS-${i + 1}`, xDS, y, PDK, [TERR, -VD.h], `Poste ${i + 1} del deck sur`, npd, 'estimado', 'pilote'));
viga('VS-S', [xDS, dy0 - VD.b / 2], [xDS, dy1 + VD.b / 2], VD, 0, 'Viga de borde del deck sur', nd, 'supuesto');
viga('VS-E', [xDS + VD.b / 2, dy1], [-CI, dy1], VD, 0, 'Viga este del deck sur', nd, 'supuesto'); viga('VS-O', [xDS + VD.b / 2, dy0], [-CI, dy0], VD, 0, 'Viga oeste del deck sur', nd, 'supuesto');
/* plataforma norte (Maxi 14/11): ocupa los dos módulos centrales (3 y 4), se proyecta 4,00 al norte del deck principal y está 3 alzadas más abajo.
   Todo el borde compartido con el deck son escalones; al norte y al este tiene 3 escalones para bajar al terreno. Estructura supuesta (D-13). */
export const PLA = { x: [xDN + VD.b / 2, xDN + VD.b / 2 + 400], y: [yPar(5), yPar(3)], z: -3 * ALZ, pedada: 28, n: 3 };
{ const [px0, px1] = PLA.x, [py0, py1] = PLA.y, zb = PLA.z - TABLA, VPL = { b: 10, h: 20 }, np = 'Estructura de la plataforma supuesta: Maxi dio el tamaño, el nivel y los escalones (D-13).';
  const xa = px0 + 5, xb = px1 - 5, ya = py0 + 5, yb = py1 - 5;
  viga('VL-S', [xa, py0], [xa, py1], VPL, zb, 'Viga sur de la plataforma norte', np, 'supuesto'); viga('VL-N', [xb, py0], [xb, py1], VPL, zb, 'Viga norte de la plataforma norte', np, 'supuesto');
  viga('VL-O', [xa + 5, ya], [xb - 5, ya], VPL, zb, 'Viga oeste de la plataforma norte', np, 'supuesto'); viga('VL-E', [xa + 5, yb], [xb - 5, yb], VPL, zb, 'Viga este de la plataforma norte', np, 'supuesto');
  let k = 0; for (const x of [xa, xb]) for (const y of [ya, (py0 + py1) / 2, yb]) col(`PL-${++k}`, x, y, PDK, [TERR, zb - VPL.h], `Poste ${k} de la plataforma norte`, np, 'supuesto', 'pilote'); }
/* tirantes (tentativos): se dibujan por conjunto. dir = eje a lo largo del que corren; a/b = de dónde a dónde; pos = dónde va cada uno; zt = cara de arriba */
const serie = (a, b, sep) => { const n = Math.round((b - a) / sep), d = (b - a) / n; return [...Array(n - 1)].map((_, i) => a + (i + 1) * d); };
const medio = (a, b, sep) => { const o = []; for (let v = a + sep / 2; v < b; v += sep) o.push(v); return o; };   /* corridos medio paso: no caen sobre las columnas */
const tramosY = [[YO + VA.b, -VT.b / 2], ...[...Array(NPAR - 2)].map((_, i) => [i * PASO + VT.b / 2, (i + 1) * PASO - VT.b / 2]), [LARGO - PASO + VT.b / 2, YE - VA.b]];
const NTC = 5;   /* tirantes del cielorraso: 5 (Maxi) */
export const TIRANTES = [
  { id: 'TP-01', nombre: 'Tirantes del piso', dir: 'x', S: TIRP, zt: -TABLA, tramos: [[PIS, PIN]], pos: serie(-VOL, LARGO, TIRP.sep).filter(y => y < m2o || y > m2e).concat([m2o - 5, m2e + 5]), conf: 'supuesto', nota: 'Tentativos (Maxi: no recuerda frecuencia ni tamaño). Supuse 2″ × 6″ cada 0,50 de viga perimetral a viga perimetral (5,05 de luz); uno a cada lado del desnivel (D-05).' },
  { id: 'TP-02', nombre: 'Tirantes del piso, pasillo junto al desnivel', dir: 'x', S: TIRP, zt: -TABLA, tramos: [[PIS, DES.x[0] - TABLA]], pos: serie(m2o, m2e, TIRP.sep), conf: 'supuesto', nota: 'Tentativos: el pasillo sur de 0,80 junto al desnivel (D-05, D-12).' },
  { id: 'TP-03', nombre: 'Tirantes del desnivel', dir: 'x', S: TIRP, zt: DES.z - TABLA, tramos: [[DES.x[0], DES.x[1]]], pos: serie(m2o, m2e, TIRP.sep), conf: 'supuesto', nota: 'Tentativos: sostienen el piso del desnivel, 0,34 más abajo; quedan colgando por debajo de la viga perimetral. No sé cómo está resuelto (D-12).' },
  { id: 'TC-01', nombre: 'Tirantes del cielorraso', dir: 'y', S: TIRC, zt: HC, tramos: tramosY, pos: [...Array(NTC)].map((_, i) => AIS + (i + 1) * (AIN - AIS) / (NTC + 1)), conf: 'estimado', nota: 'Maxi 14/11: son 5 nada más. Los repartí parejos en el ancho (cada 0,88), de viga transversal a viga transversal (4,00). Sección 2″ × 6″ supuesta (D-05).' },
  { id: 'TD-01', nombre: 'Tirantes del deck norte', dir: 'x', S: TIRP, zt: -TABLA, tramos: [[DN0, xDN - VD.b / 2]], pos: medio(-VOL, LARGO, TIRP.sep), conf: 'supuesto', nota: nd },
  { id: 'TD-03', nombre: 'Tirantes de la plataforma norte', dir: 'x', S: TIRP, zt: PLA.z - TABLA, tramos: [[PLA.x[0] + 10, PLA.x[1] - 10]], pos: medio(PLA.y[0], PLA.y[1], TIRP.sep).filter(y => y > PLA.y[0] + 12 && y < PLA.y[1] - 12), conf: 'supuesto', nota: 'Tentativos (D-13).' },
  { id: 'TD-02', nombre: 'Tirantes del deck sur', dir: 'x', S: TIRP, zt: -TABLA, tramos: [[xDS + VD.b / 2, DS0]], pos: medio(dy0, dy1, TIRP.sep), conf: 'supuesto', nota: nd },
];

/* ---------- pisos, techo, locales ---------- */
const rect = (x0, x1, y0, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
/* piso de un deck: rectángulo con una muesca por cada columna que lo atraviesa. xc = borde contra la casa, xf = borde de afuera, dx = hacia dónde sobresalen las columnas */
const deckPoly = (xc, xf, y0, y1, dx) => { const P = [[xf, y0]]; let abierto = false;
  const ys = [...Array(NPAR)].map((_, i) => yPar(NPAR - i)).map(y => [Math.max(y0, y - CI), Math.min(y1, y + CI)]).filter(([a, b]) => b > a);
  let y = y0; for (const [a, b] of ys) { if (a > y) { P.push([xc, y], [xc, a]); } P.push([xc + dx * COL, a], [xc + dx * COL, b]); y = b; }
  if (y < y1) P.push([xc, y], [xc, y1]); P.push([xf, y1]); return P; };
const LOSAS = [
  { id: 'LO-01', nivel: 'PB', nombre: 'Piso interior (entablonado)', z: 0, e: TABLA, poly: rect(PIS, PIN, PYO + VP.b, PYE - VP.b), huecos: [rect(DES.x[0], DES.x[1], DES.y[0], DES.y[1])], estado: 'existente', conf: 'estimado', nota: 'Maxi 14/11: el piso queda unos 3 cm por debajo de la cara de arriba de la viga perimetral. Entablonado sobre los tirantes; espesor supuesto.' },
  { id: 'LO-02', nivel: 'PB', nombre: 'Deck norte', tablon: 14, z: 0, e: TABLA, poly: deckPoly(DN0, xDN - VD.b / 2, -VOL + VD.b / 2, LARGO - VD.b / 2, 1), estado: 'existente', conf: 'estimado', nota: 'Maxi 14/11: deck en todo el frente norte, al nivel del piso interior (3 cm bajo la viga perimetral), de tablones de 14 transversales, de 4,00 de ancho por todo el largo de la casa. Supuse que incluye el metro del voladizo (D-04).' },
  { id: 'LO-03', nivel: 'PB', nombre: 'Deck sur', tablon: 14, z: 0, e: TABLA, poly: deckPoly(DS0, xDS + VD.b / 2, dy0 + VD.b / 2, dy1 - VD.b / 2, -1), estado: 'existente', conf: 'estimado', nota: 'Maxi 14/11: deck chico de 2,50 × 8,00 al sur, entre tres columnas principales, al que da la puerta de atrás. Con la puerta de atrás en el módulo 3, lo puse en los módulos 3 y 2: «donde está la puerta de atrás y otro módulo de 4 metros hacia el este» (D-06).' },
];
LOSAS.push({ id: 'LO-04', nivel: 'PB', nombre: 'Piso del desnivel (módulo 2)', z: DES.z, e: TABLA, poly: rect(DES.x[0], DES.x[1], DES.y[0], DES.y[1]), estado: 'existente', conf: 'estimado', nota: 'Maxi 14/11: desnivel de dos alzadas que ocupa todo el módulo 2 menos un pasillo sur de 0,80. Lo dibujé hacia abajo, 0,34 (alzadas de 0,17 supuestas) (D-12).' });
LOSAS.push({ id: 'LO-05', nivel: 'PB', nombre: 'Plataforma norte', tablon: 14, z: PLA.z, e: TABLA, poly: rect(PLA.x[0], PLA.x[1], PLA.y[0], PLA.y[1]), estado: 'existente', conf: 'estimado', nota: 'Maxi 14/11: plataforma de deck al norte, en los dos módulos centrales, que se proyecta 4,00 al norte y está 3 alzadas por debajo del deck principal (0,51 con alzadas de 0,17). Tablones de 14 como el deck (D-13).' });
const LOCALES = [
  { id: 'L-01', nivel: 'PB', nombre: 'Interior (sin dividir todavía)', poly: rect(GS, GN, -VOL, LARGO), estado: 'existente', conf: 'estimado', nota: 'Falta la distribución: Maxi nombró un cuarto pequeño en el módulo 5 y un cuarto grande en el 6, todavía sin medidas (D-10).' },
  { id: 'L-04', nivel: 'PB', nombre: 'Desnivel con sillón en C (módulo 2)', poly: rect(DES.x[0], DES.x[1], DES.y[0], DES.y[1]), estado: 'existente', conf: 'estimado', nota: 'Dos alzadas más abajo que el resto; sillón en C contra los lados sur, este y oeste (D-12).' },
  { id: 'L-05', nivel: 'PB', nombre: 'Plataforma norte', poly: rect(PLA.x[0], PLA.x[1], PLA.y[0], PLA.y[1]), estado: 'existente', conf: 'estimado', nota: '8,00 × 4,00, tres alzadas bajo el deck; escalones al deck en todo el borde compartido y 3 escalones al terreno al norte y al este (D-13).' },
  { id: 'L-02', nivel: 'PB', nombre: 'Deck norte', poly: rect(DN0, xDN + VD.b / 2, -VOL - VD.b / 2, LARGO + VD.b / 2), estado: 'existente', conf: 'estimado', nota: '4,00 × el largo de la casa. Faltan las escaleras de entrada (D-04).' },
  { id: 'L-03', nivel: 'PB', nombre: 'Deck sur', poly: rect(xDS - VD.b / 2, DS0, dy0 - VD.b / 2, dy1 + VD.b / 2), estado: 'existente', conf: 'estimado', nota: '2,50 × 8,00.' },
];
const TECHOS = [
  { id: 'T-01', poly: rect(CXS - ALERO, CXN + ALERO, CYO - ALERO, CYE + ALERO), baja: '-x', pend: `${(CAMARA / (CXN - CXS) * 100).toFixed(0)} %`, mat: 'chapa acanalada de zincalum', z: [zR(CXN + ALERO) + 1, zR(CXS - ALERO) + 1], e: 1, estado: 'existente', conf: 'estimado', nombre: 'Chapa acanalada de zincalum, a un agua',
    nota: 'Maxi 14/11: techo de chapa acanalada tipo zincalum, a un agua, el lado alto al norte, unos 0,50 más alto que el sur. Vuela 0,35 medidos desde el panel de la cámara, que es coplanar con la cara de afuera de las columnas. No dibujé lo que sostiene la chapa (D-11).' },
  { id: 'T-02', poly: rect(AIS, AIN, YO + VA.b, YE - VA.b), baja: '-x', pend: '0 %', mat: 'cielorraso', z: [HC + CIELO, HC + CIELO], e: CIELO, estado: 'existente', conf: 'estimado', nombre: 'Cielorraso a 3,00', nota: 'Maxi 14/11: unos 3,00 hasta el cielorraso. Entre el cielorraso y la chapa queda una cámara de 0,50 al norte que se cierra hacia el sur.' },
];
const IMPLANTACION = [
  { id: 'TE-01', tipo: 'jardin', nombre: 'Terreno', poly: rect(-1500, 2200, -1500, 3900), z: TERR, estado: 'existente', conf: 'estimado', nota: 'Terreno a 1,47 bajo el piso interior (D-01). Sin niveles ni jardín todavía.' },
];
const EJES = [
  { id: 'S', dir: 'v', pos: 0, nota: 'Fila sur de columnas' }, { id: 'N', dir: 'v', pos: ANCHO, nota: 'Fila norte de columnas · 5,50' },
  ...[...Array(NPAR)].map((_, i) => ({ id: String(i + 1), dir: 'h', pos: yPar(i + 1), nota: `Par de columnas ${i + 1}${i === 0 ? ' (este)' : i === NPAR - 1 ? ' (oeste)' : ''}` })),
];
const COTAS = [
  { a: [0, 0], b: [0, LARGO], off: -330, txt: '24,00' }, { a: [0, -VOL], b: [0, 0], off: -330, txt: '1,00' }, { a: [0, LARGO], b: [ANCHO, LARGO], off: 120, txt: '5,50' },
  { a: [ANCHO, LARGO], b: [xDN, LARGO], off: 120, txt: '4,00' }, { a: [0, LARGO - PASO], b: [0, LARGO], off: -60, txt: '4,00' },
];
export { MUROS, ABERTURAS, ESTRUCTURA, LOSAS, LOCALES, TECHOS, IMPLANTACION, EJES, COTAS };
export const ESCALERAS = [], BARANDAS = [], DECK = [], CHIMENEAS = [], CLARABOYAS = [];
export const VIDEO = [];

export const DUDAS = [
  { id: 'D-01', ref: ['TE-01', 'VP-S', 'VP-N'], q: 'Altura sobre la tierra: tomé 1,20 desde el terreno hasta el fondo de la viga perimetral (el piso queda a 1,47). ¿O el 1,20 es hasta el piso?' },
  { id: 'D-02', ref: [...ESTRUCTURA.filter(e => /^(C|FC)-/.test(e.id)).map(e => e.id), 'VP-E', 'VP-O', 'VA-S', 'VA-N'], q: 'Encuentros de fachada. (a) La viga de arriba, de 7 y centrada en el vidrio, queda 2,5 cm metida en la cara interior de las columnas: ¿la columna tiene un rebaje, o la viga va un poco más adentro? (b) Falsas columnas: les puse 10 de fondo. (c) En el este y en la punta del voladizo, ¿cómo cierran las vigas contra las esquinas?' },
  { id: 'D-03', ref: ['VT-2'], q: 'Vigas transversales de 25 × 7: las puse arriba, a la altura del cielorraso. ¿Hay también una en el piso en cada par de columnas?' },
  { id: 'D-04', ref: ['LO-02', 'LO-03', 'PD-1', 'PS-1', 'VD-N', 'VS-S'], q: 'Decks: los postes exteriores van de 6 × 6; ¿cuántos son y cada cuánto? Puse uno por cada par de columnas de la casa. ¿Qué vigas tienen? ¿El deck norte incluye el metro del voladizo (25,00) o son 24,00? ¿Tienen baranda?' },
  { id: 'D-05', ref: ['TP-01', 'TC-01'], q: 'Tirantes del piso y del cielorraso: sección, separación y para qué lado corren. Están tentativos (2″ × 6″; los del piso de norte a sur cada 0,50, los del cielorraso son 5, de este a oeste, repartidos parejos).' },
  { id: 'D-06', ref: ['MN-06', 'MS-05', 'LO-03'], q: 'Puertas y deck sur. La de atrás quedó en la mitad este del módulo 3, colgada por fuera y abriendo hacia el oeste. La de entrada (norte) sigue en la mitad OESTE del módulo 3, pegada al cuarto par de columnas, por dentro y abriendo hacia el este: dijiste que la del sur es espejo de la del norte, ¿entonces la del norte también es la mitad este? El deck sur lo puse en los módulos 3 y 2 (de la puerta hacia el este): ¿o son el 3 y el 4?' },
  { id: 'D-07', ref: ['MO-01', 'V-O01'], q: 'Lado oeste: la ventana de 1,00 × 1,50, ¿dónde va a lo ancho? La puse centrada.' },
  { id: 'D-08', ref: ['MS-03', 'V-S03'], q: '«De la cintura para abajo es madera»: ¿a qué altura empieza el vidrio? Puse 1,00.' },
  { id: 'D-09', ref: ['ME-01', 'V-E01'], q: 'Ventana del este (1,00, de piso a techo, lado norte): ¿va pegada a la esquina norte, como la puse, o separada? ¿Es fija o se abre?' },
  { id: 'D-10', ref: ['L-01'], q: 'Interior: faltan los tabiques y los ambientes (cuarto pequeño en el módulo 5, cuarto grande en el 6, cocina, baño).' },
  { id: 'D-11', ref: ['T-01', 'CE-01'], q: 'Techo: ¿qué sostiene la chapa sobre la cámara (cabios, clavaderas)? El panel de la cámara lo llevé a plomo con la cara de afuera de las columnas al norte y al sur; en el este y el oeste, donde no hay columnas que sobresalgan, lo dejé a plomo con la punta de la viga del piso, y el volado de 0,35 lo puse igual en los cuatro lados. ¿Es así?' },
  { id: 'D-12', ref: ['LO-04', 'L-04', 'SC-01', 'SC-02', 'ES-01', 'ES-02', 'TP-03'], q: 'Desnivel del módulo 2: lo dibujé como un pozo que BAJA dos alzadas (0,34), con el sillón en C adentro: el lomo contra el pasillo sur y los dos brazos al este y al oeste, cortados a 1,50 del ventanal norte, y ahí un escalón intermedio de cada lado. ¿Baja o sube? ¿El sillón va adentro del desnivel? Supuse alzadas de 0,17, asiento de 0,60 de fondo a 0,42 y la repisa a 0,80 del piso del pozo. ¿Cómo está resuelto el piso del pozo por debajo?' },
  { id: 'D-13', ref: ['LO-05', 'L-05', 'EP-01', 'EP-02', 'EP-03', 'VL-S', 'PL-1', 'TD-03'], q: 'Plataforma norte: la puse en los módulos 3 y 4, pegada al deck, 0,51 más abajo (3 alzadas de 0,17), con dos escalones intermedios a todo lo largo del borde compartido. De la plataforma al terreno quedan 0,96 con el terreno donde lo tengo (D-01): con 3 escalones son 4 alzadas de 0,24, muy altas. Si el 1,20 fuera hasta el piso y no hasta la viga, serían 4 alzadas de 0,17, que cierra mejor: ¿cuál es? ¿Los 3 escalones al terreno dan vuelta la esquina noreste, como los dibujé? ¿Al oeste no hay nada? ¿Sobre qué apoya?' },
];

export const CAMBIOS = [
  { fecha: '2026-11-14', v: '0.3.1', txt: 'Plataforma norte (Maxi 14/11): deck de 8,00 × 4,00 frente a los dos módulos centrales, 3 alzadas más abajo que el deck principal, con escalones en todo el borde compartido y 3 escalones al terreno al norte y al este. Las vigas de borde de los decks quedan a ras de los tablones.' },
  { fecha: '2026-11-14', v: '0.3.0', txt: 'Corredizas de hierro oxidado que se abren y se cierran («Puertas» en Ver): la de entrada (norte) corre por dentro y la de atrás (sur) cuelga por fuera de un riel. Módulo 2: desnivel de dos alzadas en todo el módulo menos un pasillo sur de 0,80, con el sillón en C (respaldo de madera que termina en una repisa de 0,45) contra los lados sur, este y oeste; los brazos se cortan a 1,50 del ventanal norte y ahí va un escalón de cada lado. Lo dibujé como pozo: es una interpretación (D-12). La puerta de atrás pasa a la mitad este del módulo 3 y el deck sur a los módulos 3 y 2. Los decks pasan a tablones de 14, transversales. El voladizo oeste ya no tiene parantes en las esquinas. La cámara baja hasta el terreno.' },
  { fecha: '2026-11-14', v: '0.2.1', txt: 'Techo (Maxi 14/11, sobre una captura): el panel que cierra la cámara sobresale hasta quedar coplanar con la cara de afuera de las columnas, que llegan justo hasta abajo de él; recién desde ahí la chapa vuela 0,35. Los tirantes del cielorraso pasan a ser 5. La ventana oeste queda de 1,00 × 1,50 con antepecho a 0,75. El paño angosto del voladizo oeste es ciego, de madera, al norte y al sur. La chapa es acanalada de zincalum.' },
  { fecha: '2026-11-14', v: '0.2.0', txt: 'Encuentro de fachada corregido (Maxi 14/11): las columnas reales de 15 × 15 van por fuera de las vigas perimetrales, de una pieza desde la tierra, y sobresalen 15 hacia afuera; la viga del piso pasa a 15 de ancho, coplanar por fuera con las falsas columnas (1 cm por fuera del vidrio); la viga de arriba pasa a 7, centrada en el vidrio; el piso interior y los decks quedan 3 cm por debajo de la viga del piso. Con esto quedan 5,33 entre vidrios (la cocina medía 5,35). Los decks tienen las muescas de las columnas que los atraviesan. Tercera tanda: postes exteriores de los decks de 6 × 6; el oeste pasa a madera ciega con una ventana chica (tentativa); el este, madera ciega con una ventana de piso a techo de 1,00 en la punta norte.' },
  { fecha: '2026-11-14', v: '0.1.0', txt: 'Primera versión de Mocoretá, según la descripción verbal de Maxi del 14/11: 14 columnas en dos filas de 7 (cada 4,00, a 5,50), vigas perimetrales de 30 × 10 abajo y arriba con el voladizo de 1,00 al oeste, falsas columnas, vigas transversales de 25 × 7, ventanales de 2,00 × 2,70, puerta corrediza de entrada al norte y de atrás al sur, paños sur con madera abajo según cada módulo, pared este con ventana tentativa, deck norte de 4,00 y deck sur de 2,50 × 8,00, cielorraso a 3,00 y chapa a un agua con 0,50 de cámara al norte. Tirantes de piso y cielorraso tentativos. Once dudas.' },
];
