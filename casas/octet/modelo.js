/* Octet — escena para diseñar estructuras espaciales de tubos y nodos (octet truss, retícula FCC) con el motor de housemaker.
   Los modelos (nodos, tubos, L, Ø, R, tapa, regatones) no viven acá: se editan en la página y se guardan en la base del artifact (colección «octet»).
   Esta tabla sólo tiene lo que el motor espera de toda casa (META, NIVELES, LOCALES, DUDAS, CAMBIOS) y el modelo semilla con que arranca una base vacía. */
export const META = { nombre: 'Octet', version: '0.1.1', fecha: '2026-11-04', lugar: 'Ingeniero Maschwitz' };
export const NIVELES = { PB: { nombre: 'Piso', z: 0 } };
export const LOCALES = [];
export const DUDAS = [
  { id: 'D-O1', ref: ['nodos'], q: 'El nodo real: la foto del 4/11 muestra nodos chicos de aluminio fundido y tubos finos, pero no alcanza para medirlos. Hace falta un nodo y una punta de tubo con calibre (diámetro del tubo, cómo entra al nodo, cuánto se descuenta del largo). Hasta entonces el nodo es un dodecaedro rómbico de R = 2,6 y el tubo Ø 1,6, cortado de cara a cara.', conf: 'supuesto' },
  { id: 'D-O2', ref: ['L'], q: 'El largo base L de la mesa de la foto: se estimó 50 cm mirando la foto. ¿Cuánto mide de nodo a nodo?', conf: 'supuesto' },
];
/* modelo semilla: la mesa de la foto del 4/11, como se entiende de la foto (grilla de arriba de 3 × 2 celdas, capa del medio al centro de cada celda, abajo sólo los nodos interiores; D-O2) */
export const SEMILLA = { v: 1, nombre: 'Mesa de la foto', L: 50, d: 1.6, R: 2.6, desc: 0, tapa: { on: true, e: 1, vuelo: 6, disco: 1.5 }, pies: { on: true, h: 1.5 },
  capas: [{ k: 2, a: [0, 2, 4, 6], b: [0, 2, 4] }, { k: 1, a: [1, 3, 5], b: [1, 3] }, { k: 0, a: [2, 4], b: [2] }] };
export const CAMBIOS = [
  { fecha: '4/11/2026', v: '0.1.1', txt: 'Vidrio con medidas: ancho, fondo y corrido en x y z (en 0, sigue saliendo de los nodos más el vuelo).' },
  { fecha: '4/11/2026', v: '0.1.0', txt: 'Primera versión: editor de octet truss (agregar, quitar y mover tubos y nodos sobre la retícula, nodos full y half, bloque semilla, lista de materiales, modelos guardados) con el visor, las vistas y la barra del motor.' },
];
