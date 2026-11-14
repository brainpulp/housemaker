/* Mocoretá — la casa de Maxi en Ingeniero Maschwitz. Modelo de datos: única fuente de verdad, el visor dibuja todo a partir de esto.
   Fuente: la descripción verbal de Maxi del 14/11/2026 (no hay plano ni calco cargado; el esqueleto existe en Onshape, documento «Mocoretá»).
   Casa de madera sobre pilotes: 14 columnas en dos filas de 7, cada 4,00 a lo largo (E–O) y a 5,50 entre filas (N–S); 24,00 de largo más
   1,00 en voladizo al oeste. Ventanales de 2,00 × 2,70 en casi todo el perímetro, deck de 4,00 al norte y deck chico al sur.
   Unidades: cm. Ejes: x de sur a norte (0 en el eje de la fila sur de columnas), y de oeste a este (0 en el eje del último par de columnas,
   el del oeste; el voladizo va de y −100 a 0). z: 0 en el piso interior terminado. En el visor 3D: X = x, Y = z, Z = y.
   Módulos: 6, de 4,00, numerados de ESTE a OESTE (Maxi): el módulo k va del par de columnas k al k+1. El par 1 está en y 2400 y el 7 en y 0.
   Lo que Maxi dijo va con conf 'estimado' (él dio medidas aproximadas); lo que supuse yo va con conf 'supuesto' y preguntado en DUDAS. */

export const META = { nombre: 'Mocoretá', version: '0.1.0', fecha: '2026-11-14',
  resumen: 'Casa de madera sobre pilotes en Ingeniero Maschwitz: 24,00 × 5,50 más 1,00 en voladizo al oeste, ventanales en casi todo el perímetro, deck de 4,00 al norte, deck chico al sur y chapa a un agua. Primera etapa: esqueleto y envolvente, según la descripción de Maxi.',
  ejes: 'x de sur a norte (0 en la fila sur de columnas), y de oeste a este (0 en el par de columnas del oeste); alturas sobre el piso interior.',
  planta: { vb: { x: -500, y: -350, w: 1700, h: 3000 }, casa: { cx: 275, cy: 1150, w: 560, h: 2510 }, lote: { cx: 300, cy: 1150, w: 1500, h: 2900 }, ejesExt: { x0: -330, x1: 1030, y0: -180, y1: 2480 }, ghost: 'PB',
    nivelesOrden: ['PB', 'TE'], spec: 'casa <b>25,00 × 5,50</b> · deck norte <b>4,00</b> · chapa a un agua' } };

export const NIVELES = { PB: { nombre: 'Planta', z: 0, conf: 'estimado', nota: 'Piso interior terminado. El terreno queda 1,50 más abajo: 1,20 hasta el fondo de la viga perimetral, que mide 0,30 (D-01).' }, TE: { nombre: 'Techo', z: 0 } };

/* ---------- medidas ---------- */
export const PASO = 400, ANCHO = 550, NPAR = 7, LARGO = PASO * (NPAR - 1), VOL = 100;   /* Maxi: 4,00 entre columnas, 5,50 entre filas, 1,00 de voladizo al oeste */
export const TERR = -150;                    /* terreno: 1,20 bajo el fondo de la viga del piso (D-01) */
export const VP = { b: 10, h: 30 };          /* viga perimetral 30 × 10 (Maxi), abajo y arriba (gemelas) */
export const VT = { b: 7, h: 25 };           /* viga transversal 25 × 7 en cada par de columnas (Maxi) */
export const COL = 15, FC = 10;              /* columna 15 × 15 y falsa columna 10 × 10: supuestos (D-02) */
export const HV = 270, HC = 300;             /* ventanal de 2,70; cielorraso a 3,00 (Maxi) */
export const ANTE = 100;                     /* «de la cintura para abajo es madera»: 1,00, supuesto (D-08) */
export const TIRP = { b: 5, h: 15, sep: 50 }, TIRC = { b: 5, h: 15, sep: 60 };   /* tirantes de piso y de cielorraso: tentativos (Maxi: «lo ajustamos más tarde», D-05) */
export const TABLA = 2.5, CIELO = 2;
export const DECKN = 400, DECKS = { fondo: 250, y: [800, 1600] };   /* deck norte de 4,00 en todo el largo; deck sur 2,50 × 8,00 */
export const ALERO = 30, CAMARA = 50;        /* chapa: vuela 0,30 a los cuatro lados; 0,50 más alta al norte que al sur */
const XS = -VP.b / 2, XN = ANCHO + VP.b / 2, YO = -VOL - VP.b / 2, YE = LARGO + VP.b / 2;   /* caras de afuera de la casa */
/* cara de abajo de la chapa: apoya sobre el cielorraso en la cara sur y sube 0,50 hasta la cara norte */
export const zR = x => HC + CIELO + CAMARA * (x - XS) / (XN - XS);
export const yPar = k => LARGO - (k - 1) * PASO;          /* y del par de columnas k (1 = este … 7 = oeste) */
export const modulo = k => [yPar(k + 1), yPar(k)];        /* [y oeste, y este] del módulo k */

/* ---------- fachadas ---------- */
/* Sur, por módulo (Maxi): 1 ventanal · 2 y 3 vidrio de la cintura para arriba · 4 ventanal (con la puerta de atrás) · 5 y 6 de la cintura para arriba. */
const SUR = { 1: 'vidrio', 2: 'medio', 3: 'medio', 4: 'vidrio', 5: 'medio', 6: 'medio', 7: 'medio' };
const PUERTA_N = 6, PUERTA_S = 7;   /* paño 6: mitad oeste del módulo 3, pegado al cuarto par (y 1200–1400). Paño 7: su espejo del otro lado del par 4, en el módulo 4 (D-06) */
const MUROS = [], ABERTURAS = [];
/* paños: 12 de 2,00 (dos por módulo, numerados de este a oeste) y el 13, de 1,00, en el voladizo */
const pano = i => { if (i === 13) return [-VOL + FC / 2, -COL / 2];
  const yE = LARGO - (i - 1) * 200, yW = yE - 200, borde = y => (y % PASO === 0 ? COL : FC) / 2; return [yW + borde(yW), yE - borde(yE)]; };
const n2 = i => String(i).padStart(2, '0');
for (const [f, x] of [['N', ANCHO], ['S', 0]]) for (let i = 1; i <= 13; i++) {
  const [y0, y1] = pano(i), k = Math.min(7, Math.ceil(i / 2)), id = `M${f}-${n2(i)}`, lado = f === 'N' ? 'norte' : 'sur', mod = i === 13 ? 'voladizo' : `módulo ${k}`;
  const puerta = (f === 'N' && i === PUERTA_N) || (f === 'S' && i === PUERTA_S), tipo = f === 'N' ? 'vidrio' : SUR[k];
  if (tipo === 'vidrio') MUROS.push({ id, nivel: 'PB', a: [x, y0], b: [x, y1], e: 6, tipo: 'vidrio', z0: 0, top: HV, modulos: 1, corrediza: puerta, estado: 'existente', conf: i === 13 ? 'supuesto' : 'estimado',
    nombre: puerta ? `Puerta corrediza ${f === 'N' ? 'de entrada (al deck norte)' : 'de atrás (al deck sur)'}` : `Ventanal ${lado}, ${mod}`,
    nota: puerta ? (f === 'N' ? 'Maxi 14/11: uno de los vidrios se transforma en corredizo, justo a la izquierda de la cuarta columna mirando de norte a sur, más o menos en el centro de la casa (D-06).' : 'Maxi 14/11: «espejo de la entrada de adelante», da al deck sur. La puse del otro lado del cuarto par, en el módulo 4, que es ventanal completo (D-06).')
      : i === 13 ? 'El metro del voladizo: supuse que el ventanal sigue (D-07).' : 'Maxi 14/11: ventanal de 2,00 × 2,70 entre columna y falsa columna.' });
  else { MUROS.push({ id, nivel: 'PB', a: [x, y0], b: [x, y1], e: 8, tipo: 'madera', z0: 0, top: HV, estado: 'existente', conf: i === 13 ? 'supuesto' : 'estimado', nombre: `Paño sur, ${mod}: madera abajo y vidrio arriba`,
      nota: `Maxi 14/11: «de la cintura para arriba es vidrio, de la cintura para abajo es madera». Altura de la madera supuesta en ${ANTE / 100} m (D-08).` });
    ABERTURAS.push({ id: `V-S${n2(i)}`, muro: id, d: 0, w: y1 - y0, h: HV - ANTE, s: ANTE, tipo: 'ventana', estado: 'existente', conf: 'supuesto', nombre: `Vidrio fijo sur, ${mod}`, nota: 'De la cintura al dintel (D-08).' }); }
}
/* este: sin ventanal, una ventana rectangular (tentativa); oeste: Maxi no lo describió, supuse ventanal en dos paños (D-07) */
MUROS.push({ id: 'ME-01', nivel: 'PB', a: [COL / 2, LARGO], b: [ANCHO - COL / 2, LARGO], e: 8, tipo: 'madera', z0: 0, top: HV, estado: 'existente', conf: 'estimado', nombre: 'Pared este', nota: 'Maxi 14/11: hacia el este no hay ventanal, sólo una ventana rectangular.' });
ABERTURAS.push({ id: 'V-E01', muro: 'ME-01', d: 192.5, w: 150, h: 100, s: 100, tipo: 'ventana', estado: 'existente', conf: 'supuesto', nombre: 'Ventana este (tentativa)', nota: 'Maxi: «por ahora la podés modelar tentativamente y luego te daré las medidas correctas». Puse 1,50 × 1,00 centrada, antepecho 1,00 (D-09).' });
for (const [j, x0, x1] of [[1, FC / 2, ANCHO / 2 - FC / 2], [2, ANCHO / 2 + FC / 2, ANCHO - FC / 2]])
  MUROS.push({ id: `MO-0${j}`, nivel: 'PB', a: [x0, -VOL], b: [x1, -VOL], e: 6, tipo: 'vidrio', z0: 0, top: HV, modulos: 1, estado: 'existente', conf: 'supuesto', nombre: `Ventanal oeste ${j} de 2 (supuesto)`, nota: 'Maxi no describió el lado oeste. Como dijo que casi todo el perímetro es ventanal, lo dibujé vidriado en dos paños (D-07).' });

/* ---------- estructura ---------- */
const ESTRUCTURA = [];
const col = (id, x, y, sec, z, nombre, nota, conf = 'supuesto', cat = 'columna') => ESTRUCTURA.push({ id, nivel: 'PB', tipo: 'columna', pos: [x, y], sec: `${sec}×${sec}`, z, cat, estado: 'existente', conf, nombre, nota });
const viga = (id, a, b, S, z, nombre, nota, conf = 'estimado') => ESTRUCTURA.push({ id, nivel: 'PB', tipo: 'viga', a, b, sec: `${S.b}×${S.h}`, z, estado: 'existente', conf, nombre, nota });
for (let k = 1; k <= NPAR; k++) for (const [f, x] of [['S', 0], ['N', ANCHO]]) {
  col(`PI-${k}${f}`, x, yPar(k), COL, [TERR, -VP.h], `Pilote ${k} ${f === 'S' ? 'sur' : 'norte'}`, 'Maxi 14/11: la casa se asienta sobre 14 columnas, dos filas de 7, cada 4,00 y a 5,50 entre filas; el piso queda a ~1,20 de la tierra. Sección supuesta (D-02).', 'estimado', 'pilote');
  col(`C-${k}${f}`, x, yPar(k), COL, [0, HV], `Columna ${k} ${f === 'S' ? 'sur' : 'norte'}`, 'La columna sigue desde la viga del piso hasta la viga de arriba (2,70). La dibujé en dos tramos, pilote y columna, con la viga perimetral pasante entre los dos: no sé cómo es el encuentro real (D-02).', 'estimado');
}
for (let k = 1; k < NPAR; k++) for (const [f, x] of [['S', 0], ['N', ANCHO]])
  col(`FC-${k}${f}`, x, yPar(k) - PASO / 2, FC, [0, HV], `Falsa columna del módulo ${k}, ${f === 'S' ? 'sur' : 'norte'}`, 'Maxi 14/11: entre cada par de columnas hay una falsa columna que parte los vidrios. Sección supuesta (D-02).', 'estimado', 'falsa');
for (const [s, x] of [['S', 0], ['M', ANCHO / 2], ['N', ANCHO]])
  col(`FC-O${s}`, x, -VOL, FC, [0, HV], `Parante del voladizo oeste (${s === 'M' ? 'medio' : s === 'S' ? 'esquina sur' : 'esquina norte'})`, 'Supuesto: el voladizo necesita esquinas donde cerrar los vidrios; Maxi no lo describió (D-07).', 'supuesto', 'falsa');
for (const [n, z, S0] of [['P', 0, 'del piso'], ['A', HC, 'de arriba (sobre los vidrios)']]) {
  const nota = n === 'P' ? 'Maxi 14/11: viga perimetral de 30 × 10 a ~1,20 de la tierra; acompaña el voladizo de 1,00 al oeste.' : 'Maxi 14/11: «gemela de la viga perimetral del piso», por encima de los vidrios; por eso el ventanal mide 2,70 y no 3,00.';
  viga(`V${n}-S`, [0, YO], [0, YE], VP, z, `Viga perimetral ${S0}, sur`, nota); viga(`V${n}-N`, [ANCHO, YO], [ANCHO, YE], VP, z, `Viga perimetral ${S0}, norte`, nota);
  viga(`V${n}-E`, [VP.b / 2, LARGO], [ANCHO - VP.b / 2, LARGO], VP, z, `Viga perimetral ${S0}, este`, nota); viga(`V${n}-O`, [VP.b / 2, -VOL], [ANCHO - VP.b / 2, -VOL], VP, z, `Viga perimetral ${S0}, oeste (punta del voladizo)`, nota);
}
for (let k = 2; k <= NPAR; k++) viga(`VT-${k}`, [VP.b / 2, yPar(k)], [ANCHO - VP.b / 2, yPar(k)], VT, HC, `Viga transversal del par ${k}`, 'Maxi 14/11: en cada par de columnas, una viga transversal de 25 × 7 del ancho de la casa. La puse arriba, con la cara superior a la altura del cielorraso; en el par 1 (este) ese lugar lo ocupa la viga perimetral (D-03).');
/* decks: Maxi dio las medidas del piso; la estructura (postes, vigas) es supuesta (D-04) */
const [dy0, dy1] = DECKS.y, xDN = ANCHO + DECKN, xDS = -DECKS.fondo, nd = 'Estructura del deck supuesta: Maxi sólo dio las medidas del piso (D-04).';
for (let k = 1; k <= NPAR; k++) col(`PD-${k}`, xDN, yPar(k), COL, [TERR, -VP.h], `Poste ${k} del deck norte`, nd, 'supuesto', 'pilote');
viga('VD-N', [xDN, YO], [xDN, YE], VP, 0, 'Viga de borde del deck norte', nd, 'supuesto');
viga('VD-E', [XN, LARGO], [xDN - VP.b / 2, LARGO], VP, 0, 'Viga este del deck norte', nd, 'supuesto'); viga('VD-O', [XN, -VOL], [xDN - VP.b / 2, -VOL], VP, 0, 'Viga oeste del deck norte', nd, 'supuesto');
[dy0, (dy0 + dy1) / 2, dy1].forEach((y, i) => col(`PS-${i + 1}`, xDS, y, COL, [TERR, -VP.h], `Poste ${i + 1} del deck sur`, nd, 'supuesto', 'pilote'));
viga('VS-S', [xDS, dy0 - VP.b / 2], [xDS, dy1 + VP.b / 2], VP, 0, 'Viga de borde del deck sur', nd, 'supuesto');
viga('VS-E', [xDS + VP.b / 2, dy1], [XS, dy1], VP, 0, 'Viga este del deck sur', nd, 'supuesto'); viga('VS-O', [xDS + VP.b / 2, dy0], [XS, dy0], VP, 0, 'Viga oeste del deck sur', nd, 'supuesto');
/* tirantes (tentativos): se dibujan por conjunto. dir = eje a lo largo del que corren; a/b = de dónde a dónde; pos = dónde va cada uno; zt = cara de arriba */
const serie = (a, b, sep) => { const n = Math.round((b - a) / sep), d = (b - a) / n; return [...Array(n - 1)].map((_, i) => a + (i + 1) * d); };
const tramosY = [[YO + VP.b, -VT.b / 2], ...[...Array(NPAR - 2)].map((_, i) => [i * PASO + VT.b / 2, (i + 1) * PASO - VT.b / 2]), [LARGO - PASO + VT.b / 2, YE - VP.b]];
export const TIRANTES = [
  { id: 'TP-01', nombre: 'Tirantes del piso', dir: 'x', S: TIRP, zt: -TABLA, tramos: [[VP.b / 2, ANCHO - VP.b / 2]], pos: serie(-VOL, LARGO, TIRP.sep), conf: 'supuesto', nota: 'Tentativos (Maxi: no recuerda frecuencia ni tamaño). Supuse 2″ × 6″ cada 0,50 de viga perimetral a viga perimetral (5,40 de luz) (D-05).' },
  { id: 'TC-01', nombre: 'Tirantes del cielorraso', dir: 'y', S: TIRC, zt: HC, tramos: tramosY, pos: serie(VP.b / 2, ANCHO - VP.b / 2, TIRC.sep), conf: 'supuesto', nota: 'Tentativos. Supuse 2″ × 6″ cada 0,60 de viga transversal a viga transversal (4,00) (D-05).' },
  { id: 'TD-01', nombre: 'Tirantes del deck norte', dir: 'x', S: TIRP, zt: -TABLA, tramos: [[XN, xDN - VP.b / 2]], pos: serie(-VOL, LARGO, TIRP.sep), conf: 'supuesto', nota: nd },
  { id: 'TD-02', nombre: 'Tirantes del deck sur', dir: 'x', S: TIRP, zt: -TABLA, tramos: [[xDS + VP.b / 2, XS]], pos: serie(dy0, dy1, TIRP.sep), conf: 'supuesto', nota: nd },
];

/* ---------- pisos, techo, locales ---------- */
const rect = (x0, x1, y0, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const LOSAS = [
  { id: 'LO-01', nivel: 'PB', nombre: 'Piso interior (entablonado)', z: 0, e: TABLA, poly: rect(VP.b / 2, ANCHO - VP.b / 2, YO + VP.b, YE - VP.b), estado: 'existente', conf: 'supuesto', nota: 'Entablonado sobre los tirantes, a ras de la viga perimetral. Espesor supuesto.' },
  { id: 'LO-02', nivel: 'PB', nombre: 'Deck norte', z: 0, e: TABLA, poly: rect(XN, xDN - VP.b / 2, YO + VP.b, YE - VP.b), estado: 'existente', conf: 'estimado', nota: 'Maxi 14/11: deck en todo el frente norte, al nivel del piso interior, de 4,00 de ancho por todo el largo de la casa. Supuse que incluye el metro del voladizo (D-04).' },
  { id: 'LO-03', nivel: 'PB', nombre: 'Deck sur', z: 0, e: TABLA, poly: rect(xDS + VP.b / 2, XS, dy0 + VP.b / 2, dy1 - VP.b / 2), estado: 'existente', conf: 'estimado', nota: 'Maxi 14/11: deck chico de 2,50 × 8,00 al sur, entre tres columnas principales, al que da la puerta de atrás. Lo puse en los módulos 3 y 4 (D-06).' },
];
const LOCALES = [
  { id: 'L-01', nivel: 'PB', nombre: 'Interior (sin dividir todavía)', poly: rect(VP.b / 2, ANCHO - VP.b / 2, YO + VP.b, YE - VP.b), estado: 'existente', conf: 'estimado', nota: 'Falta la distribución: Maxi nombró un cuarto pequeño en el módulo 5 y un cuarto grande en el 6, todavía sin medidas (D-10).' },
  { id: 'L-02', nivel: 'PB', nombre: 'Deck norte', poly: rect(XN, xDN + VP.b / 2, YO, YE), estado: 'existente', conf: 'estimado', nota: '4,00 × el largo de la casa. Faltan las escaleras de entrada (D-04).' },
  { id: 'L-03', nivel: 'PB', nombre: 'Deck sur', poly: rect(xDS - VP.b / 2, XS, dy0 - VP.b / 2, dy1 + VP.b / 2), estado: 'existente', conf: 'estimado', nota: '2,50 × 8,00.' },
];
const TECHOS = [
  { id: 'T-01', poly: rect(XS - ALERO, XN + ALERO, YO - ALERO, YE + ALERO), baja: '-x', pend: `${(CAMARA / (XN - XS) * 100).toFixed(0)} %`, mat: 'chapa', z: [zR(XN + ALERO) + 1, zR(XS - ALERO) + 1], e: 1, estado: 'existente', conf: 'estimado', nombre: 'Chapa a un agua',
    nota: 'Maxi 14/11: techo de chapa a un agua, el lado alto al norte, unos 0,50 más alto que el sur; vuela 0,30 a los cuatro lados. No dibujé lo que sostiene la chapa (D-11).' },
  { id: 'T-02', poly: rect(XS, XN, YO, YE), baja: '-x', pend: '0 %', mat: 'cielorraso', z: [HC + CIELO, HC + CIELO], e: CIELO, estado: 'existente', conf: 'estimado', nombre: 'Cielorraso a 3,00', nota: 'Maxi 14/11: unos 3,00 hasta el cielorraso. Entre el cielorraso y la chapa queda una cámara de 0,50 al norte que se cierra hacia el sur.' },
];
const IMPLANTACION = [
  { id: 'TE-01', tipo: 'jardin', nombre: 'Terreno', poly: rect(-1500, 2200, -1500, 3900), z: TERR, estado: 'existente', conf: 'estimado', nota: 'Terreno a 1,50 bajo el piso interior (D-01). Sin niveles ni jardín todavía.' },
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
  { id: 'D-01', ref: ['TE-01', 'VP-S', 'VP-N'], q: 'Altura sobre la tierra: tomé 1,20 desde el terreno hasta el fondo de la viga perimetral (el piso queda a 1,50). ¿O el 1,20 es hasta el piso?' },
  { id: 'D-02', ref: ['PI-1S', 'C-1S', 'FC-1S'], q: 'Columnas: ¿qué sección tienen? Puse 15 × 15, y 10 × 10 las falsas. ¿Son una sola pieza de la tierra al techo, con las vigas perimetrales abulonadas al costado, o las vigas apoyan arriba de los pilotes como las dibujé? ¿Los 5,50 y los 4,00 son entre ejes?' },
  { id: 'D-03', ref: ['VT-2'], q: 'Vigas transversales de 25 × 7: las puse arriba, a la altura del cielorraso. ¿Hay también una en el piso en cada par de columnas?' },
  { id: 'D-04', ref: ['LO-02', 'LO-03', 'PD-1', 'PS-1', 'VD-N', 'VS-S'], q: 'Decks: ¿sobre qué apoyan (postes, cada cuánto)? ¿El deck norte incluye el metro del voladizo (25,00) o son 24,00? ¿Tienen baranda? Faltan las escaleras.' },
  { id: 'D-05', ref: ['TP-01', 'TC-01'], q: 'Tirantes del piso y del cielorraso: sección, separación y para qué lado corren. Están tentativos (2″ × 6″; los del piso de norte a sur cada 0,50, los del cielorraso de este a oeste cada 0,60).' },
  { id: 'D-06', ref: ['MN-06', 'MS-07', 'LO-03', 'MS-05', 'MS-06'], q: 'Puertas y deck sur: puse la entrada en el paño que está al este del cuarto par de columnas (módulo 3) y la de atrás en el paño del otro lado de ese par (módulo 4, que dijiste que es ventanal completo), con el deck sur en los módulos 3 y 4. Antes habías dicho que el ventanal sur eran los 8 metros de la puerta hacia el este; me quedé con tu lista por módulo (1 ventanal, 2 y 3 medio, 4 ventanal, 5 y 6 medio). ¿Está bien?' },
  { id: 'D-07', ref: ['MO-01', 'MO-02', 'MN-13', 'MS-13', 'FC-OS', 'FC-OM', 'FC-ON'], q: 'Lado oeste y voladizo: no lo describiste. Lo dibujé con ventanal al oeste (dos paños) y el metro del voladizo vidriado al norte y con madera abajo al sur. ¿Cómo es?' },
  { id: 'D-08', ref: ['MS-03', 'V-S03'], q: '«De la cintura para abajo es madera»: ¿a qué altura empieza el vidrio? Puse 1,00.' },
  { id: 'D-09', ref: ['ME-01', 'V-E01'], q: 'Ventana del este: medidas, antepecho y posición. Está tentativa: 1,50 × 1,00, centrada, antepecho 1,00.' },
  { id: 'D-10', ref: ['L-01'], q: 'Interior: faltan los tabiques y los ambientes (cuarto pequeño en el módulo 5, cuarto grande en el 6, cocina, baño).' },
  { id: 'D-11', ref: ['T-01', 'CE-01'], q: 'Techo: ¿qué sostiene la chapa sobre la cámara (cabios, clavaderas)? ¿La cámara está cerrada con una cenefa en el frente norte y en los costados, como la dibujé?' },
];

export const CAMBIOS = [
  { fecha: '2026-11-14', v: '0.1.0', txt: 'Primera versión de Mocoretá, según la descripción verbal de Maxi del 14/11: 14 columnas en dos filas de 7 (cada 4,00, a 5,50), vigas perimetrales de 30 × 10 abajo y arriba con el voladizo de 1,00 al oeste, falsas columnas, vigas transversales de 25 × 7, ventanales de 2,00 × 2,70, puerta corrediza de entrada al norte y de atrás al sur, paños sur con madera abajo según cada módulo, pared este con ventana tentativa, deck norte de 4,00 y deck sur de 2,50 × 8,00, cielorraso a 3,00 y chapa a un agua con 0,50 de cámara al norte. Tirantes de piso y cielorraso tentativos. Once dudas.' },
];
