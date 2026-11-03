/* Mocoretá: la cocina de la casa de Maxi, según su croquis a mano del 3/11/2026 (no hay modelo 3D de la casa).
   Ejes propios (cm): x de sur a norte, 0 en la cara interior del ventanal S; y de oeste a este, 0 en la cara interior de la pared O.
   modelo.js la traslada a la escena compuesta.
   Lo que Maxi dijo: 5,35 entre los dos ventanales (N y S); pasillo de 2,00 pegado al ventanal N; mesada 1 contra la pared O,
   sólo hasta la heladera; heladera en un tabique; mesada 2 de 3,00 bajo el ventanal S con la bacha; isla de ibirapitá de 2,20 × 0,90.
   Lo supuesto (conf:'supuesto', preguntado en DUDAS): ancho E–O 6,30; techo a 2,60; ventanales de piso a techo; borde E abierto. */
export const MO = {
  NIVELES: { PB: { nombre: 'Planta baja', z: 0 } },
  MUROS: [
    { id: 'M-01', nivel: 'PB', a: [-3, 0], b: [-3, 630], e: 6, tipo: 'vidrio', top: 260, modulos: 3, estado: 'existente', conf: 'supuesto', nombre: 'Ventanal S', nota: 'Croquis 3/11: «ventanal» en toda la pared sur. Supuse de piso a techo (D-M2) y 6,30 de largo (D-M1).' },
    { id: 'M-02', nivel: 'PB', a: [538, 0], b: [538, 630], e: 6, tipo: 'vidrio', top: 260, modulos: 3, estado: 'existente', conf: 'supuesto', nombre: 'Ventanal N (pasillo)', nota: 'Croquis 3/11: «ventanal» en toda la pared norte, del lado del pasillo. Mismos supuestos que M-01.' },
    { id: 'M-03', nivel: 'PB', a: [0, -7.5], b: [335, -7.5], e: 15, tipo: 'ladrillo', carga: true, top: 260, estado: 'existente', conf: 'medido', nombre: 'Pared O', nota: 'Croquis 3/11: desde el ventanal S hasta el pasillo (5,35 − 2,00 = 3,35). Espesor supuesto 15.' },
    { id: 'M-04', nivel: 'PB', a: [330, 0], b: [330, 90], e: 10, tipo: 'tabique', carga: false, top: 260, estado: 'existente', conf: 'estimado', nombre: 'Tabique de la heladera, lado del pasillo', nota: 'Maxi 3/11: «falta un tabique que rodea a H». Lado norte, contra el pasillo. Altura supuesta hasta el techo (D-M4).' },
    { id: 'M-05', nivel: 'PB', a: [253, 0], b: [253, 90], e: 10, tipo: 'tabique', carga: false, top: 260, estado: 'existente', conf: 'estimado', nombre: 'Tabique de la heladera, lado de la mesada', nota: 'Maxi 3/11: «el tabique está bien». Lo armé como nicho: tabique al norte (pasillo) y al sur (contra la punta de la mesada 1), y la heladera abre hacia el este, a la cocina. Si el tabique del lado este existe de verdad, la heladera no abre: por eso lo pregunto (D-M7).' },
  ],
  ABERTURAS: [],
  LOCALES: [
    { id: 'L-01', nivel: 'PB', nombre: 'Cocina', poly: [[0, 0], [335, 0], [335, 630], [0, 630]], estado: 'existente', conf: 'estimado', nota: 'Entre el ventanal S y el pasillo. El lado E (y 6,30) es un supuesto: la casa sigue (D-M1, D-M3).' },
    { id: 'L-02', nivel: 'PB', nombre: 'Pasillo', poly: [[335, 0], [535, 0], [535, 630], [335, 630]], estado: 'existente', conf: 'medido', nota: 'Croquis 3/11: 2,00 de ancho, contra el ventanal N. Sigue hacia el oeste más allá de la pared O (D-M5).' },
  ],
  LOSAS: [
    { id: 'LO-01', nivel: 'PB', nombre: 'Piso', z: 0, e: 10, poly: [[-6, -15], [541, -15], [541, 630], [-6, 630]], conf: 'estimado' },
  ],
  TECHOS: [
    { id: 'T-01', poly: [[-6, -15], [541, -15], [541, 630], [-6, 630]], baja: '+y', pend: '0 %', mat: 'cielorraso', z: [260, 260], e: 12, estado: 'existente', conf: 'supuesto', nombre: 'Cielorraso a 2,60 (supuesto)', nota: 'Altura supuesta (D-M2). Se ve sólo con «Techos» prendido.' },
  ],
  ESTRUCTURA: [], ESCALERAS: [], BARANDAS: [], CHIMENEAS: [], DECK: [], IMPLANTACION: [],
  DUDAS: [
    { id: 'D-M1', ref: ['L-01', 'M-01', 'M-02'], q: 'Mocoretá: ¿cuánto mide la cocina de oeste a este? Del croquis, a escala, saqué 6,30; es un supuesto.' },
    { id: 'D-M2', ref: ['M-01', 'M-02', 'T-01'], q: 'Mocoretá: ¿alto de techo? Puse 2,60. ¿Los ventanales N y S van de piso a techo, o tienen antepecho y dintel?' },
    { id: 'D-M3', ref: ['L-01'], q: 'Mocoretá: en el borde este la casa sigue. ¿Hay pared, o la cocina queda abierta al resto?' },
    { id: 'D-M4', ref: ['M-04', 'M-05'], q: 'Mocoretá: el tabique de la heladera, ¿llega al techo o remata a la altura de la heladera?' },
    { id: 'D-M5', ref: ['L-02', 'M-03'], q: 'Mocoretá: el pasillo sigue hacia el oeste pasando la pared O. ¿Hasta dónde, y el ventanal N sigue con él?' },
    { id: 'D-M6', ref: ['L-01'], q: 'Mocoretá: medidas de la mesa del comedor y de las mesadas (fondo) que no están en el croquis. Puse mesa de 2,00 × 0,95 y mesadas de 0,85 (O) y 0,65 (S).' },
    { id: 'D-M7', ref: ['M-04', 'M-05'], q: 'Mocoretá: el tabique de la heladera lo armé como nicho abierto al este (tabiques al norte y al sur, la puerta de la heladera mira a la cocina). En mi dibujo anterior el lado este estaba punteado: si de verdad hay tabique al este, ¿hacia dónde abre la heladera?' },
  ],
};
