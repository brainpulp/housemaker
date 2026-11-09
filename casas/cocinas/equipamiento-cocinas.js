/* Equipamiento de las tres cocinas: un ambiente por cocina, con escenarios de partida. El motor (motor/equipamiento.js) es el mismo de las casas.
   Ejes de la escena: x de sur a norte, y de oeste a este (ver modelo.js). Giro r: 0 = el frente del mueble mira al este, 90 = al norte, 180 = al oeste, −90 = al sur.
   · Carhué: los escenarios A (como está) y D (versión del 2/11) de casas/carhue/equipamiento-carhue.js, trasladados (x −1817, y +1550).
   · Arcos: la propuesta de materiales del 2/11 («Materiales para cocinas y mesas») sobre la planta de tu SketchUp (SU-05): mueble contra la
     medianera S de 4,20 (heladera en la punta del ventanal, 3,62 de mesada, columna de horno en la punta del depósito), alacenas de 1,50 a 2,28,
     isla de 2,00 × 0,90 con el anafe de 5 hornallas. Granito negro, frentes de petiribí (acá «madClara»), barra de ibirapitá en la punta de la isla
     (hoy un bloque de madera aparte: el catálogo todavía no tiene la isla con cajones de los dos lados ni la barra a la punta, duda D-02).
   · Mocoretá: como está hoy, según el croquis del 3/11 (medidas supuestas en D-M6). */
export function equipCocinas({ it, itA }) {
  const sillas = (I, cx, cy, L, D, n, t = 'sillaCover') => [...Array(n)].flatMap((_, k) => { const x = cx - L / 2 + L * (k + .5) / n; return [I(t, x, cy - D / 2 - 28, 0), I(t, x, cy + D / 2 + 28, 180)]; });
  const AMB = {
    carhue: { n: 'Carhué', piso: 0, ver: p => p.verCH !== false, vista: { p: [720, 260, 1790], t: [140, 80, 1400] }, esc: () => { const I = itA('carhue'); return {
      A: { nombre: 'Versión D (2/11): negro mate, piedra negra, roble', items: [/* Carhué, casas/carhue/equipamiento-carhue.js escenario D, trasladado */
        I('heladera', 52.5, 1059, 0, { L: 65, D: 65, H: 190, col: 'negro' }), I('mesada', 48.5, 1405.5, 90, { L: 235, D: 62, fr: 'negro', top: 'granito', huecos: [[-4.5, 80, 50]] }), /* Maxi 8/11: la bacha cerca del anafe; su borde a 50 del rincón de la L (la cara oeste del bloque) */ I('bachaFarm', 55.5, 1410, 90, { L: 80, D: 50 }),
        I('salpicadero', 18.5, 1405.5, 90, { L: 235, H: 10 }), I('salpicadero', 17.5, 1393, 90, { L: 30, H: 108, caja: 10 }, 92), I('campanaIsla', 210, 1570, 180, { L: 90, D: 60 }),
        I('isla', 210, 1595, 180, { L: 260, D: 110, vol: 30, fr: 'roble', top: 'granito', top2: 'madRust', corte: 60 }), I('anafe', 210, 1570, 180, { L: 90, D: 52, n: 5 }),
        I('banqueta', 138, 1672, 0, { mad: 'roble' }), I('banqueta', 198, 1672, 0, { mad: 'roble' }), I('banqueta', 258, 1672, 0, { mad: 'roble' }), I('banqueta', 318, 1672, 0, { mad: 'roble' })] },
      B: { nombre: 'Como está hoy (15/10): verde, heladera roja', items: [
        I('heladera', 52.5, 1059, 0, { L: 65, D: 65, H: 190, col: 'rojo' }), I('mesada', 48.5, 1469, 90, { L: 362, D: 62, fr: 'verde', top: 'granito' }), I('isla', 210, 1595, 180, { L: 260, D: 110, vol: 30, fr: 'verde', top: 'granito' }), I('anafe', 198, 1580, 180, { L: 75, D: 52 }),
        I('banqueta', 138, 1672, 0), I('banqueta', 198, 1672, 0), I('banqueta', 258, 1672, 0), I('banqueta', 318, 1672, 0)] },
      C: { nombre: 'Vacía', items: [] },
      D: { nombre: 'Croquis de Maxi (7/11): península negra + mesa de madera en L', items: [/* casas/carhue/equipamiento-carhue.js escenario E, trasladado (x −1817, y +1550): mesada negra contra la pared sur con la bacha bajo la ventana; península perpendicular: bloque negro con anafe de 4 pegado a la mesada y mesa de madera en L hacia el living (este) y el norte, con sillas */
        I('heladera', 52.5, 1059, 0, { L: 65, D: 65, H: 190, col: 'negro' }), I('mesada', 48.5, 1469, 90, { L: 362, D: 62, fr: 'negro', top: 'granito', huecos: [[161, 80, 50]] }), I('bachaFarm', 55.5, 1308, 90, { L: 80, D: 50 }),
        I('salpicadero', 18.5, 1423, 90, { L: 270, H: 10 }), I('salpicadero', 17.5, 1393, 90, { L: 30, H: 108, caja: 10 }, 92),
        /* Maxi 7/11 (2.ª vuelta): en L y no en T (cara este al ras de la punta de la mesada) y la madera cuadrada, 2,20 × 2,20, con el bloque sobre su esquina sudoeste */
        /* Maxi 7/11 (4.ª vuelta): la L de mesadas negras dobla justo donde termina la pared sur (y 1593, cara norte de M-02): mesada de 2,35 y el bloque negro de 1,60 × 0,70 en la esquina, de la pared hacia el norte; la mesa de madera (bordes rectos) sigue hacia el este pasando la pared y al norte del bloque */
        /* Maxi 7/11 (3.ª vuelta): «dije una L»: la península arranca en la pared sur pasada la punta este de la mesada; el bloque negro sigue a la mesada doblando hacia el norte y la madera, de bordes rectos, queda al este y al norte */
        /* Maxi 8/11: lo ajustó él acá (mesa de 2,60 × 1,50, anafe hacia la pared, cinco sillas) y pidió pasarlo a la casa tal cual */
        /* Maxi 8/11 (movido por él en la página): el bloque pisa 23 cm la punta este de la mesada, así las dos negras forman una sola L */ I('islaMesa', 147.5, 1575, 180, { L: 260, D: 150, Lb: 160, Db: 70, H: 75, Hb: 90, fr: 'negro', top: 'granito', mad: 'roble', mod: 76, canto: 'recto' }), I('anafe', 135, 1530, 180, { L: 60, D: 52, n: 4 }), I('campanaIsla', 105, 1525, 180, { L: 90, D: 60 }),
        I('sillaCover', 40, 1665, 180, { pint: 'negro' }), I('sillaCover', 110, 1665, 180, { pint: 'negro' }), I('sillaCover', 200, 1670, 180, { pint: 'negro' }), I('sillaCover', 285, 1565, -90, { pint: 'negro' }), I('sillaCover', 280, 1635, -90, { pint: 'negro' })] } }; } },

    arcos: { n: 'Arcos', piso: 51, ver: p => p.verAR !== false, vista: { p: [640, 250, 2130], t: [120, 130, 2440] }, esc: () => { const I = itA('arcos'); return {
      A: { nombre: 'Propuesta 2/11 + pared del 3/11', items: [/* Maxi 4/11: frentes de cajones oscuros (madOsc) en mesada, columna y bloque. Maxi 3/11: la heladera va entre el horno y la despensa (punta este, contra la pared del depósito); donde estaba, una mesita de desayuno con banquetas perpendicular a la medianera */
        I('heladera', 52, 2697, 90, { L: 75, D: 70, H: 190, col: 'negro' }), I('columna', 46, 2630, 90, { L: 58, D: 62, H: 228, fr: 'petiribi' }), /* Maxi 4/11: mueble sobre la heladera, continuación de la torre del horno (sin LED abajo) */ I('alacena', 46, 2697, 90, { L: 75, D: 62, H: 38, fr: 'petiribi', led: false }, 190),
        /* Maxi 6/11: la mesada crece a 3,92 (la mesa y los bancos se corren hacia el ventanal): cinco módulos de 75 más un bandejero de 17 en la punta oeste, junto al banco; puertas batientes bajo la bacha (módulo 3 desde el este) */ I('mesada', 46, 2405, 90, { L: 392, D: 62, fr: 'petiribi', top: 'granito', mod: 75, band: 17, puertas: [3] }), /* Maxi 5/11: la pared detrás de la mesada, de inox (paño de 1,5 mm entre la tapa y las alacenas) */ I('revestimiento', 16.5, 2405, 90, { L: 392, H: 60, e: 1.5, mat: 'acero' }, 90) /* Maxi 4/11: bajo la bacha, puertas batientes con bisagras cazoleta; el resto, cajones con guías telescópicas */, I('bacha', 48, 2338.5, 90, { L: 70 }),
        /* Maxi 6/11: cuatro puertas proyectadas de 0,90 sobre los 3,62: dos alacenas de 1,81 con dos puertas cada una */ I('alacena', 32.5, 2314.5, 90, { L: 211, D: 35, H: 78, fr: 'negro', band: 30 }) /* Maxi 7/11: bandejero vertical de 0,30 en la punta de la ventana, sobre el de la mesada; así las alacenas llegan a 3,92 */, /* Maxi 6/11: estante de 15 de fondo, 20 cm abajo de las alacenas (a 1,30), a lo largo de ellas */ I('estante', 16.5, 2405, 90, { L: 392, D: 15, e: 2, mat: 'petiribi' }, 130), I('alacena', 32.5, 2510.5, 90, { L: 181, D: 35, H: 78, fr: 'negro' }),
        /* Maxi 5/11: la mesa (#10) pasa a 1,60 con sus bancos; sigue arrancando en la medianera (x 15) y termina a 7 cm de la isla (x 182) */
        /* 6/11: el banco del lado de la ventana es de 1,50 y arranca a 25 de la medianera, porque ahí está el parante del ventanal (10 × 10 contra la pared); su respaldo inclinado queda a 9 del vidrio (que acá no se dibuja); pegado al vidrio se ganarían 15 cm más de mesada */ I('mesaMaciza', 95, 2130, 0, { L: 160, D: 70, H: 75, mad: 'petiribi' }), /* Maxi 4/11: mesita baja, con bancos bajos de tabla con respaldo en ángulo, uno por lado, de dos cuerpos */ I('bancoTabla', 100, 2074, 0, { L: 150, D: 38, H: 45, mad: 'madClara' }), I('bancoTabla', 95, 2186, 180, { L: 160, D: 38, H: 45, mad: 'madClara' }),
        /* Maxi 4/11: un solo rectángulo de 3,80 × 1,20 (desde el 8/11, 3,00 × 1,20) en dos materiales (pieza «islaMesa»): bloque de cocinar de piedra de 1,60 × 0,70 a 0,90 en la punta este, del lado de la mesada,
           y mesa de madera a 0,75 en L: 2,20 de ancho completo al oeste más la tira de 0,50 que sigue junto al bloque hasta su punta este (ahí se sienta gente frente a la mesada negra).
           Cara sur en x 182 (pasillo de 1,05 a la mesada); sillas sólo del lado del estar y en la punta. El escalón del estar hundido está a x 386 (a medir). */
        /* Maxi 6/11: la isla/mesa 30 cm más al este, con sus sillas, el anafe y la campana */ /* Maxi 8/11: la mesa de madera se acorta a 3,00 (de 3,80); el bloque de piedra queda donde estaba, en la punta este */ I('islaMesa', 242, 2510, -90, { L: 300, D: 120, Lb: 160, Db: 70, H: 75, Hb: 90, fr: 'petiribi', top: 'granito', mad: 'nogal', mod: 76 }) /* Maxi 7/11: tapa de nogal oscuro, frentes de petiribí */ /* Maxi 6/11: dos columnas de cajones anchos en el bloque, no tres */, I('anafe', 217, 2580, -90, { L: 90, D: 52, n: 5 }), I('campanaIsla', 217, 2580, -90, { L: 90, D: 60 }),
        I('sillaCover', 330, 2430, -90, { pint: 'negro' }), I('sillaCover', 330, 2530, -90, { pint: 'negro' }), I('sillaCover', 330, 2630, -90, { pint: 'negro' }), I('sillaCover', 242, 2335, 0, { pint: 'negro' })] },
      B: { nombre: 'Vacía', items: [] } }; } },
    mocoreta: { n: 'Mocoretá', piso: 0, ver: p => p.verMO !== false, vista: { p: [740, 330, 80], t: [200, 70, 300] }, esc: () => { const I = itA('mocoreta'); return {
      A: { nombre: 'Como está hoy (croquis 3/11)', items: [
        I('mesada', 124, 42.5, 0, { L: 248, D: 85, H: 90, fr: 'madClara', top: 'granito' }), I('anafe', 125, 44, 0, { L: 60, D: 52 }), I('heladera', 291.5, 36, 0, { L: 65, D: 70, H: 190, col: 'acero' }),
        I('mesada', 32.5, 300, 90, { L: 300, D: 65, H: 90, fr: 'madClara', top: 'granito' }), I('bacha', 34.5, 192, 90, { L: 80 }),
        I('isla', 235, 240, 0, { L: 220, D: 90, vol: 0, fr: 'madRust', top: 'madRust' }),
        /* Maxi 7/11: la mesa (#7) de 2,80 × 1,20 */ I('mesaComedor', 267, 530, 0, { L: 280, D: 120 }), ...sillas(I, 267, 530, 280, 120, 3),
        /* Maxi 7/11: alacenas altas sobre la mesada 1, contra la pared O (M-03): 2,48 en tres puertas proyectadas */ I('alacena', 124, 17.5, 0, { L: 248, D: 35, H: 70, fr: 'madClara' }, 150)] },
      B: { nombre: 'Vacía', items: [] } }; } },
  };
  return { inicial: 'carhue', AMB, orden: ['mocoreta', 'carhue', 'arcos'] };
}
