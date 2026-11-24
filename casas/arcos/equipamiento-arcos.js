/* Equipamiento de Arcos: ambientes y escenarios de partida. El motor (motor/equipamiento.js) es el mismo de Carhué; acá sólo van los datos de esta casa.
   Maxi 21/10: «M-33 delimita un baño (hacia la calle) y una despensa (hacia el jardín), equipalas como tales. En el foso del living va un grueso
   sillón en L, contra los lados norte y este, y una mesa baja rectangular. No uses esos muebles boxy, usá muebles buenos, como los de Carhué»:
   todo lo que tiene modelo 3D real (motor/modelos.js) va con el modelo; quedan de cajas sólo la alfombra y las reposeras.
   Ojo con el volumen alto del SketchUp sobre la cocina (duda D-15: x 0,18–2,40, y 26,64–27,31, de +3,16 al techo): atraviesa el entrepiso y el 2P, los muebles lo esquivan.
   Ejes: x de sur a norte (medianera S en 0, N en 865), y de oeste (jardín) a este (Arcos, fachada en 3902). Pisos medidos en el modelo.
   Giro r: 0 = el frente del mueble mira al este (calle), 180 = al jardín, 90 = al norte, −90 = al sur.
   Los baños de 1P y 2P no van: ya están amueblados (SketchUp de Maxi y baño de 2P de la obra). La cocina sale de la página Cocinas (5/11). */
export function equipArcos({ itA }) {
  const SS = -198, PB = 72.3, HUND = 22.3, EP = 329, P1 = 417.3, P2 = 613.3, TZ = 757;
  /* sillas alrededor de una mesa rectangular a lo ancho (r 0): n por lado */
  const sillas = (I, cx, cy, L, D, n, t = 'sillaCover') => [...Array(n)].flatMap((_, k) => { const x = cx - L / 2 + L * (k + .5) / n; return [I(t, x, cy - D / 2 - 28, 0), I(t, x, cy + D / 2 + 28, 180)]; });
  /* sillas alrededor de una mesa cuadrada de lado L: n por lado, en los cuatro lados */
  const sillas4 = (I, cx, cy, L, n, t = 'sillaCover') => [...Array(n)].flatMap((_, k) => { const d = -L / 2 + L * (k + .5) / n, e = L / 2 + 28;
    return [I(t, cx + d, cy - e, 0), I(t, cx + d, cy + e, 180), I(t, cx - e, cy + d, 90), I(t, cx + e, cy + d, -90)]; });
  const AMB = {
    living: { n: 'Living (PB)', piso: PB, vista: { p: [520, 650, 3150], t: [520, 90, 3600] }, esc: () => { const I = itA('living'); return {
      /* Maxi 4/11 y 5/11: su mesa octet va en el escenario de entrada (A) (la diseñó en la página octet: 3 × 3 celdas de L 45, vidrio 2,05 × 2,05 con 35 de vuelo; motor/octet-modelos.js), con dos sillas por lado afuera del vidrio */
      A: { nombre: 'Comedor + estar', items: [I('octet', 520, 3250, 0, { modelo: 'mesa-konstandt' }), ...sillas4(I, 520, 3250, 205, 2),
        I('alfombra', 560, 3730, 0, { L: 280, D: 200 }), I('sofaRaffey', 560, 3590, 0, { L: 240, D: 99 }), I('ratonaJoco', 560, 3740, 0, { L: 130, D: 105 }), I('butacaAm', 330, 3800, 135, { tela: 'mostaza' }), I('placard', 45, 3700, 90, { L: 200, D: 60, H: 240, fr: 'petiribi' })] },
      B: { nombre: 'Estar mirando a la calle', items: [I('alfombra', 520, 3650, 0, { L: 300, D: 220 }), I('sofaRaffey', 520, 3515, 0, { L: 260, D: 99 }), I('ratonaJoco', 520, 3670, 0, { L: 140, D: 115 }),
        I('butacaAm', 320, 3770, 135, { tela: 'lino' }), I('butacaAm', 720, 3770, -135, { tela: 'mostaza' }), I('placard', 45, 3700, 90, { L: 200, D: 60, H: 240, fr: 'petiribi' })] },
      C: { nombre: 'Vacío', items: [] } }; } },
    estar: { n: 'Estar hundido (foso del living)', piso: HUND, vista: { p: [520, 560, 2350], t: [600, 40, 2720] }, esc: () => { const I = itA('estar'); return {
      /* el foso va de x 4,70 (4,55 de la medianera S, Maxi 5/11) a 8,30 y de y 24,25 a 28,63: el sillón en L apoya el respaldo largo contra el lado este y la chaise corre todo el lado norte (Maxi 5/11) */
      A: { nombre: 'Sillón en L y mesa baja', items: [I('sofaLcb', 651, 2639, 180, { L: 355, D: 437, H: 78, lado: 'izq' }), I('mesaBaja', 600, 2575, 0, { L: 130, D: 70, H: 40 })] },
      /* Maxi 5/11: acá también va su mesa octet («mesa Konstandt», vidrio 2,05 × 2,05), con dos sillas por lado */
      B: { nombre: 'Comedor con la mesa Konstandt', items: [I('octet', 650, 2645, 0, { modelo: 'mesa-konstandt' }), ...sillas4(I, 650, 2645, 205, 2)] },
      C: { nombre: 'Vacío', items: [] } }; } },
    /* Maxi 5/11: la cocina diseñada en la página Cocinas (casas/cocinas/equipamiento-cocinas.js, escenario A), traída a los ejes de Arcos (y +330, la escena la corría −330).
       Reemplaza a la cocina del SketchUp (SU-05), que ya no se dibuja. */
    cocina: { n: 'Cocina (PB)', piso: PB, vista: { p: [640, 271, 2460], t: [120, 151, 2770] }, esc: () => { const I = itA('cocina'); return {
      A: { nombre: 'Propuesta 2/11 + pared del 3/11', items: [/* Maxi 4/11: frentes de cajones oscuros (madOsc) en mesada, columna y bloque. Maxi 3/11: la heladera va entre el horno y la despensa (punta este, contra la pared del depósito); donde estaba, una mesita de desayuno con banquetas perpendicular a la medianera */
        I('heladera', 52, 3027, 90, { L: 75, D: 70, H: 190, col: 'negro' }), I('columna', 46, 2960, 90, { L: 58, D: 62, H: 228, fr: 'petiribi' }), /* Maxi 4/11: mueble sobre la heladera, continuación de la torre del horno (sin LED abajo) */ I('alacena', 46, 3027, 90, { L: 75, D: 62, H: 38, fr: 'petiribi', led: false }, 190),
        /* Maxi 6/11: la mesada crece a 3,92 (la mesa y los bancos se corren hacia el ventanal): cinco módulos de 75 más un bandejero de 17 en la punta oeste, junto al banco; puertas batientes bajo la bacha (módulo 3 desde el este) */ /* Maxi 20/11: menos columnas y más anchas: cuatro de 0,94 (antes cinco de 0,75); la bacha queda centrada en la segunda desde el este, con puertas */ I('mesada', 46, 2735, 90, { L: 392, D: 62, fr: 'petiribi', top: 'granito', mod: 94, band: 17, puertas: [2] }), /* Maxi 5/11: la pared detrás de la mesada, de inox (paño de 1,5 mm entre la tapa y las alacenas) */ I('revestimiento', 16.5, 2735, 90, { L: 392, H: 60, e: 1.5, mat: 'acero' }, 90) /* Maxi 4/11: bajo la bacha, puertas batientes con bisagras cazoleta; el resto, cajones con guías telescópicas */, I('bacha', 48, 2696.6, 90, { L: 70 }),
        /* Maxi 6/11: cuatro puertas proyectadas de 0,90 sobre los 3,62: dos alacenas de 1,81 con dos puertas cada una */ I('alacena', 32.5, 2644.5, 90, { L: 211, D: 35, H: 78, fr: 'negro', band: 30 }) /* Maxi 7/11: bandejero vertical de 0,30 en la punta de la ventana, sobre el de la mesada; así las alacenas llegan a 3,92 */, /* Maxi 6/11: estante de 15 de fondo, 20 cm abajo de las alacenas (a 1,30), a lo largo de ellas */ I('estante', 16.5, 2735, 90, { L: 392, D: 15, e: 2, mat: 'petiribi' }, 130), I('alacena', 32.5, 2840.5, 90, { L: 181, D: 35, H: 78, fr: 'negro' }),
        /* el banco del lado de la ventana es de 1,50 y arranca a 25 de la medianera, porque ahí está el parante del ventanal (10 × 10 contra la pared); su respaldo inclinado queda a 9 del vidrio O (SU-01); pegado al vidrio se ganarían 15 cm más de mesada */ I('mesaMaciza', 95, 2460, 0, { L: 160, D: 70, H: 75, mad: 'petiribi' }), /* Maxi 4/11: mesita baja, con bancos bajos de tabla con respaldo en ángulo, uno por lado, de dos cuerpos */ I('bancoTabla', 100, 2404, 0, { L: 150, D: 38, H: 45, mad: 'madClara' }), I('bancoTabla', 95, 2516, 180, { L: 160, D: 38, H: 45, mad: 'madClara' }),
        /* Maxi 4/11: un solo rectángulo de 3,80 × 1,20 (desde el 8/11, 3,00 × 1,20) en dos materiales (pieza «islaMesa»): bloque de cocinar de piedra de 1,60 × 0,70 a 0,90 en la punta este, del lado de la mesada,
           y mesa de madera a 0,75 en L: 2,20 de ancho completo al oeste más la tira de 0,50 que sigue junto al bloque hasta su punta este (ahí se sienta gente frente a la mesada negra).
           Cara sur en x 182 (pasillo de 1,05 a la mesada); sillas sólo del lado del estar y en la punta. El escalón del estar hundido está a x 386 (a medir). */
        /* Maxi 6/11: la isla/mesa 30 cm más al este, con sus sillas, el anafe y la campana */ /* Maxi 8/11: la mesa de madera se acorta a 3,00 (de 3,80); el bloque de piedra queda donde estaba, en la punta este */ I('islaMesa', 242, 2840, -90, { L: 300, D: 120, Lb: 160, Db: 70, H: 75, Hb: 90, fr: 'petiribi', top: 'granito', mad: 'nogal', mod: 76 }) /* Maxi 7/11: tapa de nogal oscuro, frentes de petiribí */ /* Maxi 6/11: dos columnas de cajones anchos en el bloque, no tres */, I('anafe', 217, 2910, -90, { L: 90, D: 52, n: 5 }), I('campanaIsla', 217, 2910, -90, { L: 90, D: 60 }),
        /* Maxi 5/11: sillas pintadas de negro (el color se elige en la ficha) */ I('sillaCover', 330, 2760, -90, { pint: 'negro' }), I('sillaCover', 330, 2860, -90, { pint: 'negro' }), I('sillaCover', 330, 2960, -90, { pint: 'negro' }), I('sillaCover', 242, 2665, 0, { pint: 'negro' })] },
      B: { nombre: 'Vacía', items: [] } }; } },
    toilette: { n: 'Baño de PB (M-33, hacia la calle)', piso: PB, vista: { p: [300, 330, 3500], t: [100, 80, 3360] }, esc: () => { const I = itA('toilette'); return {
      A: { nombre: 'Inodoro y lavatorio', items: [I('inodoroK', 55, 3330, 90, { L: 45, D: 75, H: 78 }), I('lavatorioS', 140, 3311, 0, { L: 55, D: 45, H: 50 }, 35)] },
      B: { nombre: 'Vacío', items: [] } }; } },
    despensa: { n: 'Despensa (M-33, hacia el jardín)', piso: PB, vista: { p: [300, 360, 3000], t: [100, 120, 3180] }, esc: () => { const I = itA('despensa'); return {
      A: { nombre: 'Tres alacenas altas', items: [I('alacenaV', 36, 3127, 90, { L: 95, D: 40, H: 204 }), I('alacenaV', 36, 3226, 90, { L: 95, D: 40, H: 204 }), I('alacenaV', 140, 3255, 180, { L: 95, D: 40, H: 204 })] },
      B: { nombre: 'Vacía', items: [] } }; } },
    /* Maxi 23/11: a lo largo del entrepiso, contra la pared del lado del palier y el baño de 1P, un mueble bajo de puertas corredizas cuya tapa queda al nivel del
       piso de 1P (+4,17): une las dos alturas y sigue el piso del palier por el vano cuadrado (P-15). 6,25 de largo, de la medianera sur hasta antes del tensor T5 y la
       columna CN4, con el fondo contra el borde de la losa de 1P (y 30,64); va en dos módulos (2,96 y 3,25) con una luz de 4 cm entre ellos por donde pasa el tensor T4; la tapa
       puede ser una sola, con una muesca atrás para el tensor. Reemplaza a las dos bibliotecas que había contra esa pared. */
    escritorio: { n: 'Escritorio (entrepiso)', nivel: 'EP', piso: EP, vista: { p: [560, 640, 2500], t: [170, 340, 2800] }, esc: () => { const I = itA('escritorio'); return {
      A: { nombre: 'Contra la medianera sur', items: [I('escritorioM', 55, 2560, 90, { L: 150, D: 70 }), I('sillaCover', 125, 2560, -90), I('bajoCorredizo', 163, 3041.5, 180, { L: 296, D: 45, H: 88.3, hojas: 4, div: '74,148,222', mad: 'petiribi', fr: 'petiribi' }), I('bajoCorredizo', 477.5, 3041.5, 180, { L: 325, D: 45, H: 88.3, hojas: 4, div: '81,162,244', mad: 'petiribi', fr: 'petiribi' })] },
      B: { nombre: 'Mirando al estar', items: [I('escritorioM', 270, 2560, -90, { L: 150, D: 70 }), I('sillaCover', 200, 2560, 90), I('bajoCorredizo', 163, 3041.5, 180, { L: 296, D: 45, H: 88.3, hojas: 4, div: '74,148,222', mad: 'petiribi', fr: 'petiribi' }), I('bajoCorredizo', 477.5, 3041.5, 180, { L: 325, D: 45, H: 88.3, hojas: 4, div: '81,162,244', mad: 'petiribi', fr: 'petiribi' }), I('butacaAm', 120, 2950, 135, { tela: 'lino' })] },
      C: { nombre: 'Vacío', items: [] } }; } },
    /* Maxi 21/11: es el cuarto de Andrés (20 años). Dos propuestas para comparar: A, vestidor detrás del respaldo de la cama (tabique a 1,55 de la pared del baño,
       pasillo de 0,95 que también lleva al baño; la idea de «usar el respaldo para separar el vestidor» de IKEA); B, sin tabique: placard de piso a techo contra el baño
       y la cama contra la medianera sur, con un rincón de estar. El placard del SketchUp sale en las dos. Medidas de placard: fondo 0,60, colgado 0,94 / 1,88 (Houzz). */
    /* Maxi 23/11: placares que faltaban (propuesta para ver en 3D): ropa blanca en el palier de 1P y lavadero con estanterías en el sótano.
       El depósito ya tiene sus vitrinas en el SketchUp. El de abrigos de la entrada está en el living y el ropero chico del cuarto de Isolda, en ese cuarto. */
    palier: { n: 'Palier de 1P', piso: P1, vista: { p: [520, 640, 3130], t: [820, 500, 3330] }, esc: () => { const I = itA('palier'); return {
      /* contra la medianera norte, desde 1,28 del pie de la escalera a 2P (para dejar el arranque libre) hasta la pared del cuarto de Isolda */
      A: { nombre: 'Placard de ropa blanca contra la medianera', items: [I('placard', 820, 3328, -90, { L: 232, D: 60, H: 240, fr: 'petiribi' })] },
      B: { nombre: 'Vacío', items: [] } }; } },
    sotano: { n: 'Sótano', piso: SS, vista: { p: [700, -20, 3700], t: [380, -150, 3250] }, esc: () => { const I = itA('sotano'); return {
      /* lavadero contra el muro sur: lavarropas con el secarropas encima y un placard de limpieza al lado; estanterías contra el muro del frente (que en el SketchUp está en y 38,50 y tiene un murete en x 3,68–3,92), lejos de la puerta P-04 */
      A: { nombre: 'Lavadero y estanterías', items: [I('lavarropas', 358, 3150, 90), I('lavarropas', 358, 3150, 90, {}, 86), I('placard', 357.5, 3250, 90, { L: 120, D: 60, H: 220, fr: 'blanco' }),
        I('biblioteca', 500, 3830, 180, { L: 200, D: 40, H: 180, mad: 'blanco' }), I('biblioteca', 675, 3830, 180, { L: 140, D: 40, H: 180, mad: 'blanco' })] },
      B: { nombre: 'Vacío', items: [] } }; } },
    cuartoSE: { n: 'Cuarto de Andrés (1P)', piso: P1, vista: { p: [400, 760, 3300], t: [200, 420, 3650] }, esc: () => { const I = itA('cuartoSE'); return {
      A: { nombre: 'Con vestidor detrás de la cama', items: [/* el tabique es parte del edificio: lo pone la opción de diseño «Cuarto de Andrés» (casa.js) */
        I('vestidor', 170.5, 3325, 0, { L: 307, D: 60, H: 307, mods: 'largo:80|doble:100|cajones:60|zapatos:69', mad: 'petiribi', car: 'blanco', mal: 240 }),
        I('espejo', 16.5, 3401, 90, { L: 60, D: 3, H: 170 }, 30),
        I('camaDoble', 169.5, 3566, 0, { L: 170, D: 215 }), I('mesaLuzM', 62, 3480, 0, { L: 45, D: 40 }), I('mesaLuzM', 277, 3480, 0, { L: 45, D: 40 }),
        I('escritorioM', 194, 3859, 180, { L: 150, D: 70 }), I('sillaCover', 194, 3792, 0), I('biblioteca', 32, 3740, 90, { L: 120, D: 32, H: 200, mad: 'petiribi' }), I('butacaAm', 355, 3815, -135, { tela: 'lino' })] },
      B: { nombre: 'Con placard contra el baño', items: [I('placard', 170.5, 3325, 0, { L: 307, D: 60, H: 300, fr: 'petiribi' }),
        I('camaDoble', 122.5, 3610, 90, { L: 170, D: 215 }), I('mesaLuzM', 37, 3497, 90, { L: 45, D: 40 }), I('mesaLuzM', 37, 3723, 90, { L: 45, D: 40 }),
        I('escritorioM', 194, 3859, 180, { L: 150, D: 70 }), I('sillaCover', 194, 3792, 0), I('biblioteca', 403, 3510, -90, { L: 120, D: 32, H: 200, mad: 'petiribi' }), I('butacaAm', 330, 3560, -150, { tela: 'lino' })] },
      C: { nombre: 'Vacío', items: [] } }; } },
    /* Maxi 22/11: cuarto de Isolda (cuarto NE del 1P): de huéspedes, pero usado como sala de TV, con sofá cama. 4,16 × 4,36; la única pared llena es la medianera norte
       (al sur el arco a Andrés, al oeste el arco al chill, al este la puerta balcón). Dos propuestas: A, sala de TV con la tele y un mueble bajo sobre la medianera y el sofá
       cama suelto mirándola a ~2,9 m (75": distancia ≈ 1,5 veces la diagonal, ángulo de ~30°, SMPTE); B, sofá cama contra la medianera y pantalla enrollable de 100"
       sobre el arco a Andrés (con la plegadiza cerrada), proyector en el techo a ~3,5 m. Abierto, el sofá cama ocupa ~2,10 de fondo: la ratona se corre. */
    cuartoNE: { n: 'Cuarto de Isolda (1P)', piso: P1, vista: { p: [480, 760, 3350], t: [700, 420, 3680] }, esc: () => { const I = itA('cuartoNE'); return {
      A: { nombre: 'Sala de TV, tele sobre la medianera', items: [I('aparador', 827, 3676, -90, { L: 300, D: 45, H: 50 }), I('tele', 846, 3676, -90, { L: 167, H: 96, e: 4 }, 88),
        I('alfombra', 690, 3676, 0, { L: 240, D: 300 }), I('sofaRaffey', 560, 3676, 90, { L: 220, D: 99 }), I('ratonaJoco', 700, 3676, 90, { L: 110, D: 60 }),
        I('biblioteca', 499, 3877, 180, { L: 120, D: 32, H: 200, mad: 'petiribi' }), I('butacaAm', 785, 3535, -150, { tela: 'mostaza' }), I('placard', 488, 3486, 0, { L: 95, D: 55, H: 210, fr: 'petiribi' })] },
      B: { nombre: 'Sofá cama contra la medianera y proyector', items: [I('sofaRaffey', 800, 3676, -90, { L: 220, D: 99 }), I('ratonaJoco', 670, 3676, 90, { L: 110, D: 60 }),
        I('alfombra', 640, 3676, 0, { L: 240, D: 300 }), I('butacaAm', 795, 3510, -110, { tela: 'mostaza' }), I('butacaAm', 795, 3842, -70, { tela: 'lino' }),
        I('pantalla', 445, 3676, 90, { L: 240, H: 140 }, 75), I('proyector', 760, 3676, 90, { caida: 25 }, 270),
        I('biblioteca', 499, 3877, 180, { L: 120, D: 32, H: 200, mad: 'petiribi' }), I('placard', 488, 3486, 0, { L: 95, D: 55, H: 210, fr: 'petiribi' })] },
      C: { nombre: 'Vacío', items: [] } }; } },
    dormitorio: { n: 'Dormitorio principal (2P)', nivel: 'P2', piso: P2, vista: { p: [560, 930, 3050], t: [300, 620, 2650] }, esc: () => { const I = itA('dormitorio'); return {
      /* Maxi 22/11: armario bajo que hace de tabique, en isla (se pasa al vestidor por las dos puntas: 0,80 contra la pared del palier, cuya cara está en x 6,26
         como en el SketchUp, y del lado de la medianera sur, donde arranca la escalerita al vestidor de la terraza, E-06), con la cama queen apoyada del lado del jardín,
         mirando al oeste. Atrás, pasillo de 1,00 y un mueble bajo contra la ventana a la terraza. Los dos laqueados índigo y con la tapa a +7,57, el nivel de la
         terraza y del alféizar (Maxi): las tapas, macizas de 4 cm, hacen una pasarela junto a la ventana que llega al descanso de la escalerita.
         Adentro, divisiones de vestidor: colgar largo, estante con barral debajo, estantes, cajones y zapatero. */
      A: { nombre: 'Cama contra el armario-tabique, vestidor detrás', items: [I('armarioBajo', 375.5, 2899, 0, { L: 341, D: 60, H: 144, tapa: 4, mods: 'colgar:80|cajones:60|estantes:60|zapatos:60|colgarE:81', mad: 'indigo' }),
        I('camaDoble', 375.5, 2761.5, 180, { L: 170, D: 215 }), I('mesaLuzM', 268, 2848, 180, { L: 45, D: 40 }), I('mesaLuzM', 483, 2848, 180, { L: 45, D: 40 }),
        I('armarioBajo', 412.5, 3054, 180, { L: 415, D: 50, H: 144, tapa: 4, mods: 'estantes:70|cajones:70|zapatos:70|cajones:70|estantes:70|colgarE:65', mad: 'indigo' }),
        /* Maxi 22/11: cómodas que ya tiene, contra la medianera sur (la pared lejos de la puerta), dejando libre el paso al vestidor */
        I('comodaB', 41, 2520, 90, { L: 160, D: 50, H: 80 }), I('comodaB', 41, 2700, 90, { L: 160, D: 50, H: 80 }),
        I('butacaAm', 540, 2475, -135, { tela: 'lino' })] },
      B: { nombre: 'Cabecera a la medianera sur', items: [I('camaDoble', 125, 2865, 90, { L: 170, D: 215 }), I('butacaAm', 420, 2480, 180, { tela: 'lino' })] },
      C: { nombre: 'Mirando al jardín', items: [I('camaDoble', 400, 2970, 180, { L: 220, D: 215 }), I('butacaAm', 150, 2500, 135, { tela: 'mostaza' })] },
      D: { nombre: 'Vacío', items: [] } }; } },
    vestidor: { n: 'Vestidor (terraza)', piso: TZ, vista: { p: [300, 1000, 3200], t: [100, 760, 3400] }, esc: () => { const I = itA('vestidor'); return {
      /* Maxi 23/11: interior del vestidor de la terraza (1,88 × 5,42; se entra por la escalerita, en la punta sur-este). Contra la medianera, placard abierto de 0,60
         desde 0,75 de la pared de la puerta (ahí está la ventanita, que queda libre), con colgado largo, doble barral, cajones y zapatero; enfrente, estantes de 0,35 (desde 0,90 de la puerta, para que abra), pasillo de 0,93,
         y un espejo de cuerpo entero en el fondo. Barrales a 2,00, estante a 2,15 y maletero arriba hasta 2,40 (un cabio del techo pasa a 2,42 sobre la punta del placard). */
      A: { nombre: 'Placard abierto contra la medianera y estantes enfrente', items: [
        I('vestidor', 45, 3396.5, 90, { L: 473, D: 60, H: 240, mods: 'doble:100|cajones:80|largo:100|zapatos:80|doble:113', mad: 'petiribi', car: 'blanco', mal: 220 }),
        I('vestidor', 185.5, 3410, -90, { L: 440, D: 35, H: 240, mods: 'estantes:110|zapatos:110|estantes:110|estantes:110', mad: 'petiribi', car: 'blanco', mal: 220 }),
        I('espejo', 120, 3630, 180, { L: 60, D: 3, H: 170 }, 30)] },
      C: { nombre: 'Roperos a lo largo', items: [I('roperoA', 46, 3255, 90), I('roperoA', 46, 3367, 90), I('roperoA', 46, 3479, 90)] },
      B: { nombre: 'Vacío', items: [] } }; } },
    terraza: { n: 'Terraza', piso: TZ, vista: { p: [700, 1150, 3150], t: [520, 760, 3600] }, esc: () => { const I = itA('terraza'); return {
      A: { nombre: 'Mesa afuera + reposeras', items: [I('mesaComedor', 560, 3650, 0, { L: 180, D: 90 }), ...sillas(I, 560, 3650, 180, 90, 2, 'sillaDSW'), I('reposera', 330, 3500, 0), I('reposera', 410, 3500, 0)] },
      B: { nombre: 'Estar afuera', items: [I('sofaRaffey', 560, 3780, 180, { L: 240, D: 99 }), I('ratonaJoco', 560, 3615, 0, { L: 130, D: 105 }), I('butacaAm', 380, 3560, 90, { tela: 'lino' }), I('butacaAm', 740, 3560, -90, { tela: 'lino' })] },
      C: { nombre: 'Vacía', items: [] } }; } },
  };
  /* 21/10: los escenarios de la 0.10.17 eran de cajas; si ya quedaron guardados en la base, se reemplazan una vez por los de modelos 3D */
  const VIEJOS = new Set(['sofa', 'butaca', 'ratona', 'mesa', 'silla', 'cama', 'mesaLuz', 'comoda', 'placard', 'escritorio', 'biblioteca', 'sofaPlat', 'ratonaBaja', 'alfombraYute', 'mesaMaciza', 'sillaCurva']);
  const alMezclar = (a, k, s, migrar) => { if (k !== 'mue' || s.migr.includes('modelos2110') || !AMB[a]) return; s.migr.push('modelos2110');
    if (Object.values(s.esc).some(e => (e.items || []).some(m => VIEJOS.has(m.t)))) { s.esc = AMB[a].esc(); s.activo = Object.keys(s.esc)[0]; s.borrados = []; } migrar.push([a, k]); };
  /* 4/11: el comedor del living pasa a la mesa de nodos de Maxi; si el escenario B guardado todavía tiene la mesa de 2,20, se repone el B nuevo (una vez) */
  const alMezclar2 = (a, k, s, migrar) => { alMezclar(a, k, s, migrar); if (k !== 'mue' || a !== 'living' || s.migr.includes('mesaNodos0411')) return; s.migr.push('mesaNodos0411');
    if ((s.esc.B?.items || []).some(m => m.t === 'mesaComedor')) s.esc.B = AMB.living.esc().A; if (!migrar.some(([x, y]) => x === a && y === k)) migrar.push([a, k]); };
  /* 4/11 (noche): la mesa de nodos provisoria pasa a ser la mesa octet que diseñó Maxi; si el escenario B guardado tiene mesaNodos, se repone el B nuevo (una vez) */
  const alMezclar3 = (a, k, s, migrar) => { alMezclar2(a, k, s, migrar); if (k !== 'mue' || a !== 'living' || s.migr.includes('octet0411')) return; s.migr.push('octet0411');
    if ((s.esc.B?.items || []).some(m => m.t === 'mesaNodos')) s.esc.B = AMB.living.esc().A; if (!migrar.some(([x, y]) => x === a && y === k)) migrar.push([a, k]); };
  /* 5/11: el foso arranca a 4,55 de la medianera S (Maxi); si los escenarios guardados del estar son los de antes, se reponen (una vez) */
  const alMezclar4 = (a, k, s, migrar) => { alMezclar3(a, k, s, migrar); if (k !== 'mue' || a !== 'estar' || s.migr.includes('fosa0511')) return; s.migr.push('fosa0511');
    const nu = AMB.estar.esc(); for (const e of ['A', 'B']) if ((s.esc[e]?.items || []).some(m => m.t === 'sofaLcb' || m.t === 'mesaComedor')) s.esc[e] = nu[e]; if (!migrar.some(([x, y]) => x === a && y === k)) migrar.push([a, k]); };
  /* 5/11: el comedor del estar hundido pasa a la mesa Konstandt; si el B guardado tiene la mesa de comedor, se repone (una vez) */
  const alMezclar5 = (a, k, s, migrar) => { alMezclar4(a, k, s, migrar); if (k !== 'mue' || a !== 'estar' || s.migr.includes('konstandtFosa0511')) return; s.migr.push('konstandtFosa0511');
    if ((s.esc.B?.items || []).some(m => m.t === 'mesaComedor')) s.esc.B = AMB.estar.esc().B; if (!migrar.some(([x, y]) => x === a && y === k)) migrar.push([a, k]); };
  /* 5/11 (Maxi: «no está»): la mesa Konstandt pasa al escenario A del living, que es el que se ve; el A guardado sin la mesa pasa a ser el B (una vez) */
  const alMezclar6 = (a, k, s, migrar) => { alMezclar5(a, k, s, migrar); if (k !== 'mue' || a !== 'living' || s.migr.includes('konstandtA0511')) return; s.migr.push('konstandtA0511');
    if (!(s.esc.A?.items || []).some(m => m.t === 'octet')) { const nu = AMB.living.esc(); s.esc.B = s.esc.A ? { ...s.esc.A, nombre: nu.B.nombre } : nu.B; s.esc.A = nu.A; }
    s.activo = 'A'; if (!migrar.some(([x, y]) => x === a && y === k)) migrar.push([a, k]); };
  /* 5/11 (noche): la chaise del sillón del foso ocupa todo el lado norte; si el A guardado tiene el sillón de antes, se repone (una vez) */
  const alMezclar7 = (a, k, s, migrar) => { alMezclar6(a, k, s, migrar); if (k !== 'mue' || a !== 'estar' || s.migr.includes('chaiseNorte0511')) return; s.migr.push('chaiseNorte0511');
    if ((s.esc.A?.items || []).some(m => m.t === 'sofaLcb')) s.esc.A = AMB.estar.esc().A; if (!migrar.some(([x, y]) => x === a && y === k)) migrar.push([a, k]); };
  return { inicial: 'living', AMB, orden: Object.keys(AMB), alMezclar: alMezclar7 };
}
