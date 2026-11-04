/* Modelos de octet truss para poner en las casas como mueble «octet» (muebles.js). Se diseñan en la página casas/octet (editor) y se guardan en su base
   (colección «octet»); yo los copio acá tal cual (ArtifactData, octet/<id>) cuando Maxi los quiere en una casa. El formato es el de octet.js;
   «capas» es el atajo para escribirlos a mano: pone esos nodos y los une con todos los tubos entre vecinos. */
export const MODELOS = {
  /* la mesa de la foto del 4/11/2026, como se entiende de la foto (L = 50 supuesto, D-O2 de la escena octet) */
  'mesa-de-la-foto': { v: 1, nombre: 'Mesa de la foto', L: 50, d: 1.6, R: 2.6, desc: 0, tapa: { on: true, e: 1, vuelo: 6, disco: 1.5 }, pies: { on: true, h: 1.5 },
    capas: [{ k: 2, a: [0, 2, 4, 6], b: [0, 2, 4] }, { k: 1, a: [1, 3, 5], b: [1, 3] }, { k: 0, a: [2, 4], b: [2] }] },
};
