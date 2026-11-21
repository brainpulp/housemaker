/* Mocoretá · columna de elevación — detalle de UNA columna del sistema para subir y bajar la casa (la del par 6, norte, que lleva el motor de la fila).
   Es un modelo de detalle para el ingeniero, aparte del modelo de la casa: las piezas están a medida de catálogo o de cálculo, no esquemáticas.
   Coordenadas en cm: x hacia afuera de la casa (0 = cara exterior de la columna vieja), y hacia arriba (0 = terreno), z a lo largo de la fila (0 = eje de la columna). */
export const META = { nombre: 'Mocoretá · columna', version: '0.1.3', fecha: '2026-11-21', lugar: 'Ingeniero Maschwitz',
  resumen: 'Detalle para el ingeniero de una columna del sistema para subir y bajar Mocoretá: columna doble con ranura, husillo a tracción, gato, ejes, motor y uniones a la madera.' };
export const NIVELES = { PB: { nombre: 'Terreno', z: 0 } };
export const LOCALES = [];
export const DUDAS = [
  { id: 'D-C1', ref: ['C-08'], q: 'Gato: dibujé la envolvente del SWL5 (50 kN, Tr 40 × 7) según las tablas de la norma china JB/T 8809 (A 212, B 155, eje de entrada Ø 20 k6 con chaveta 6 × 6 × 45) y la distancia entre ejes de 63 mm de los gatos europeos de 50 kN. Las tablas no dicen qué mide cada letra: la caja real se confirma con el plano del proveedor.', conf: 'supuesto' },
  { id: 'D-C2', ref: ['C-03'], q: 'Columna: 2 UPN 140 (A-36 o F-24) con 4 cm de ranura entre almas. Es predimensionado: carga de maniobra hasta 35 kN por columna y el viento del cálculo de la memoria; lo verifica el ingeniero, sobre todo el pandeo de cada UPN entre el pie y el cabezal (3,00 m) y la unión del cabezal, que ata los dos.', conf: 'supuesto' },
  { id: 'D-C3', ref: ['C-09', 'C-10'], q: 'Ménsula del gato: el gato queda 29,5 cm afuera del eje de la columna vieja, así que la ménsula le pasa a la madera un momento de unos 10 kN·m durante la maniobra. Dibujé cachetes de 12 mm a los dos lados de la columna con 3 bulones pasantes M20; el ingeniero tiene que verificar el aplastamiento de la madera y si hace falta tomar también la viga de piso (el jabalcón ayuda).', conf: 'supuesto' },
  { id: 'D-C4', ref: ['C-17'], q: 'Motorreductor: envolvente aproximada de un NMRV063 (eje de salida hueco Ø 25, entre ejes 63) con motor IEC 90L de 1,5 kW en brida B14. Confirmar con el que se compre.', conf: 'supuesto' },
  { id: 'D-C5', ref: ['M-01', 'M-02', 'M-03'], q: 'Madera: columna vieja de 15 × 15 y viga perimetral de 15 × 30 (Maxi); viga transversal de piso 7 × 25 (Maxi). Las uniones existentes no se conocen (55 años).', conf: 'estimado' },
];
export const CAMBIOS = [
  { fecha: '21/11/2026', v: '0.1.3', txt: 'Se mueve arrastrando: agarrá la madera, el gato, la ménsula, el motor o los ejes y arrastrá hacia arriba o hacia abajo; la casa sube y baja con todo lo que viaja con ella, y el husillo y la columna doble quedan fijos.' },
  { fecha: '21/11/2026', v: '0.1.2', txt: 'Arranca en dibujo Técnico (caras claras, aristas negras). El modo se cambia en la barra de abajo, «Dibujo», junto a «Gráficos».' },
  { fecha: '21/11/2026', v: '0.1.1', txt: 'Dibujo con aristas (Maxi 21/11: «que se vean más claramente las aristas»): en Vistas → Dibujo hay tres modos. Normal, como siempre; Aristas, el mismo render con todas las aristas marcadas; Técnico, caras claras sin texturas ni sombras y aristas negras. Está en todas las casas.' },
  { fecha: '20/11/2026', v: '0.1.0', txt: 'Primera versión (Maxi 20/11: «husillo a tracción, perfiles finos, un 3D de detalle para el ingeniero»). Columna doble de 2 UPN 140 con ranura de 4 cm a 2 cm de la madera; husillo Tr 40 × 7 colgado del cabezal, a tracción; gato SWL5 afuera de los perfiles, bajo las vigas del deck; ménsula que pasa por la ranura; perno de traba a doble corte en las almas; ejes de fila con acoples L110; motorreductor del par 6; abrazaderas, jabalcón y herraje de nudo. Se sube y se baja desde el menú de variantes.' },
];
