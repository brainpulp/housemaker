/* Equipamiento de Arcos: ambientes y escenarios de partida. El motor (motor/equipamiento.js) es el mismo de Carhué; acá sólo van los datos de esta casa.
   Maxi 21/10: «M-33 delimita un baño (hacia la calle) y una despensa (hacia el jardín), equipalas como tales. En el foso del living va un grueso
   sillón en L, contra los lados norte y este, y una mesa baja rectangular. No uses esos muebles boxy, usá muebles buenos, como los de Carhué»:
   todo lo que tiene modelo 3D real (motor/modelos.js) va con el modelo; quedan de cajas sólo la alfombra y las reposeras.
   Ojo con el volumen alto del SketchUp sobre la cocina (duda D-15: x 0,18–2,40, y 26,64–27,31, de +3,16 al techo): atraviesa el entrepiso y el 2P, los muebles lo esquivan.
   Ejes: x de sur a norte (medianera S en 0, N en 865), y de oeste (jardín) a este (Arcos, fachada en 3902). Pisos medidos en el modelo.
   Giro r: 0 = el frente del mueble mira al este (calle), 180 = al jardín, 90 = al norte, −90 = al sur.
   Los baños de 1P y 2P no van: ya están amueblados (SketchUp de Maxi y baño de 2P de la obra). La cocina sale de la página Cocinas (5/11). */
export function equipArcos({ itA }) {
  const PB = 72.3, HUND = 22.3, EP = 329, P1 = 417.3, P2 = 613.3, TZ = 757;
  /* sillas alrededor de una mesa rectangular a lo ancho (r 0): n por lado */
  const sillas = (I, cx, cy, L, D, n, t = 'sillaCover') => [...Array(n)].flatMap((_, k) => { const x = cx - L / 2 + L * (k + .5) / n; return [I(t, x, cy - D / 2 - 28, 0), I(t, x, cy + D / 2 + 28, 180)]; });
  /* sillas alrededor de una mesa cuadrada de lado L: n por lado, en los cuatro lados */
  const sillas4 = (I, cx, cy, L, n, t = 'sillaCover') => [...Array(n)].flatMap((_, k) => { const d = -L / 2 + L * (k + .5) / n, e = L / 2 + 28;
    return [I(t, cx + d, cy - e, 0), I(t, cx + d, cy + e, 180), I(t, cx - e, cy + d, 90), I(t, cx + e, cy + d, -90)]; });
  const AMB = {
    living: { n: 'Living (PB)', piso: PB, vista: { p: [520, 650, 3150], t: [520, 90, 3600] }, esc: () => { const I = itA('living'); return {
      /* Maxi 4/11 y 5/11: su mesa octet va en el escenario de entrada (A) (la diseñó en la página octet: 3 × 3 celdas de L 45, vidrio 2,05 × 2,05 con 35 de vuelo; motor/octet-modelos.js), con dos sillas por lado afuera del vidrio */
      A: { nombre: 'Comedor + estar', items: [I('octet', 520, 3250, 0, { modelo: 'mesa-konstandt' }), ...sillas4(I, 520, 3250, 205, 2),
        I('alfombra', 560, 3730, 0, { L: 280, D: 200 }), I('sofaRaffey', 560, 3590, 0, { L: 240, D: 99 }), I('ratonaJoco', 560, 3740, 0, { L: 130, D: 105 }), I('butacaAm', 330, 3800, 135, { tela: 'mostaza' })] },
      B: { nombre: 'Estar mirando a la calle', items: [I('alfombra', 520, 3650, 0, { L: 300, D: 220 }), I('sofaRaffey', 520, 3515, 0, { L: 260, D: 99 }), I('ratonaJoco', 520, 3670, 0, { L: 140, D: 115 }),
        I('butacaAm', 320, 3770, 135, { tela: 'lino' }), I('butacaAm', 720, 3770, -135, { tela: 'mostaza' })] },
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
        /* Maxi 6/11: la mesada crece a 3,92 (la mesa y los bancos se corren hacia el ventanal): cinco módulos de 75 más un bandejero de 17 en la punta oeste, junto al banco; puertas batientes bajo la bacha (módulo 3 desde el este) */ I('mesada', 46, 2735, 90, { L: 392, D: 62, fr: 'petiribi', top: 'granito', mod: 75, band: 17, puertas: [3] }), /* Maxi 5/11: la pared detrás de la mesada, de inox (paño de 1,5 mm entre la tapa y las alacenas) */ I('revestimiento', 16.5, 2735, 90, { L: 392, H: 60, e: 1.5, mat: 'acero' }, 90) /* Maxi 4/11: bajo la bacha, puertas batientes con bisagras cazoleta; el resto, cajones con guías telescópicas */, I('bacha', 48, 2668.5, 90, { L: 70 }),
        /* Maxi 6/11: cuatro puertas proyectadas de 0,90 sobre los 3,62: dos alacenas de 1,81 con dos puertas cada una */ I('alacena', 32.5, 2659.5, 90, { L: 181, D: 35, H: 78, fr: 'negro' }), /* Maxi 6/11: estante de 15 de fondo, 20 cm abajo de las alacenas (a 1,30), a lo largo de ellas */ I('estante', 16.5, 2750, 90, { L: 362, D: 15, e: 2, mat: 'petiribi' }, 130), I('alacena', 32.5, 2840.5, 90, { L: 181, D: 35, H: 78, fr: 'negro' }),
        /* el banco del lado de la ventana es de 1,50 y arranca a 25 de la medianera, porque ahí está el parante del ventanal (10 × 10 contra la pared); su respaldo inclinado queda a 9 del vidrio O (SU-01); pegado al vidrio se ganarían 15 cm más de mesada */ I('mesaMaciza', 95, 2460, 0, { L: 160, D: 70, H: 75, mad: 'petiribi' }), /* Maxi 4/11: mesita baja, con bancos bajos de tabla con respaldo en ángulo, uno por lado, de dos cuerpos */ I('bancoTabla', 100, 2404, 0, { L: 150, D: 38, H: 45, mad: 'madClara' }), I('bancoTabla', 95, 2516, 180, { L: 160, D: 38, H: 45, mad: 'madClara' }),
        /* Maxi 4/11: un solo rectángulo de 3,80 × 1,20 en dos materiales (pieza «islaMesa»): bloque de cocinar de piedra de 1,60 × 0,70 a 0,90 en la punta este, del lado de la mesada,
           y mesa de madera a 0,75 en L: 2,20 de ancho completo al oeste más la tira de 0,50 que sigue junto al bloque hasta su punta este (ahí se sienta gente frente a la mesada negra).
           Cara sur en x 182 (pasillo de 1,05 a la mesada); sillas sólo del lado del estar y en la punta. El escalón del estar hundido está a x 386 (a medir). */
        /* Maxi 6/11: la isla/mesa 30 cm más al este, con sus sillas, el anafe y la campana */ I('islaMesa', 242, 2800, -90, { L: 380, D: 120, Lb: 160, Db: 70, H: 75, Hb: 90, fr: 'petiribi', top: 'granito', mad: 'nogal', mod: 76 }) /* Maxi 7/11: tapa de nogal oscuro, frentes de petiribí */ /* Maxi 6/11: dos columnas de cajones anchos en el bloque, no tres */, I('anafe', 217, 2910, -90, { L: 90, D: 52, n: 5 }), I('campanaIsla', 217, 2910, -90, { L: 90, D: 60 }),
        /* Maxi 5/11: sillas pintadas de negro (el color se elige en la ficha) */ I('sillaCover', 330, 2660, -90, { pint: 'negro' }), I('sillaCover', 330, 2760, -90, { pint: 'negro' }), I('sillaCover', 330, 2860, -90, { pint: 'negro' }), I('sillaCover', 330, 2960, -90, { pint: 'negro' }), I('sillaCover', 242, 2585, 0, { pint: 'negro' })] },
      B: { nombre: 'Vacía', items: [] } }; } },
    toilette: { n: 'Baño de PB (M-33, hacia la calle)', piso: PB, vista: { p: [300, 330, 3500], t: [100, 80, 3360] }, esc: () => { const I = itA('toilette'); return {
      A: { nombre: 'Inodoro y lavatorio', items: [I('inodoroK', 55, 3330, 90, { L: 45, D: 75, H: 78 }), I('lavatorioS', 140, 3311, 0, { L: 55, D: 45, H: 50 }, 35)] },
      B: { nombre: 'Vacío', items: [] } }; } },
    despensa: { n: 'Despensa (M-33, hacia el jardín)', piso: PB, vista: { p: [300, 360, 3000], t: [100, 120, 3180] }, esc: () => { const I = itA('despensa'); return {
      A: { nombre: 'Tres alacenas altas', items: [I('alacenaV', 36, 3127, 90, { L: 95, D: 40, H: 204 }), I('alacenaV', 36, 3226, 90, { L: 95, D: 40, H: 204 }), I('alacenaV', 140, 3255, 180, { L: 95, D: 40, H: 204 })] },
      B: { nombre: 'Vacía', items: [] } }; } },
    escritorio: { n: 'Escritorio (entrepiso)', nivel: 'EP', piso: EP, vista: { p: [560, 640, 2500], t: [170, 340, 2800] }, esc: () => { const I = itA('escritorio'); return {
      A: { nombre: 'Contra la medianera sur', items: [I('escritorioM', 55, 2560, 90, { L: 150, D: 70 }), I('sillaCover', 125, 2560, -90), I('estanteM', 400, 3018, 180), I('estanteM', 490, 3018, 180)] },
      B: { nombre: 'Mirando al estar', items: [I('escritorioM', 270, 2560, -90, { L: 150, D: 70 }), I('sillaCover', 200, 2560, 90), I('estanteM', 400, 3018, 180), I('estanteM', 490, 3018, 180), I('butacaAm', 120, 2950, 135, { tela: 'lino' })] },
      C: { nombre: 'Vacío', items: [] } }; } },
    /* el cuarto SE ya tiene placard en tu SketchUp (frente de 3,05 en y 34,00, del lado del baño): no se suman roperos */
    cuartoSE: { n: 'Cuarto SE (1P)', piso: P1, vista: { p: [400, 760, 3300], t: [200, 420, 3650] }, esc: () => { const I = itA('cuartoSE'); return {
      A: { nombre: 'Matrimonial', items: [I('camaDoble', 125, 3600, 90, { L: 240, D: 215 })] },
      B: { nombre: 'Dos camas', items: [I('camaSimple', 118, 3470, 90), I('camaSimple', 118, 3730, 90), I('mesaLuzM', 40, 3600, 90)] },
      C: { nombre: 'Vacío', items: [] } }; } },
    cuartoNE: { n: 'Cuarto NE (1P)', piso: P1, vista: { p: [480, 760, 3350], t: [700, 420, 3680] }, esc: () => { const I = itA('cuartoNE'); return {
      A: { nombre: 'Cama contra la medianera N', items: [I('camaDoble', 740, 3592, -90, { L: 240, D: 215 }), I('comodaB', 497, 3868, 180, { L: 120, D: 50 })] },
      B: { nombre: 'Estudio', items: [I('escritorioM', 813, 3640, -90, { L: 150, D: 70 }), I('sillaCover', 745, 3640, 90), I('sofaRaffey', 485, 3670, 90, { L: 200, D: 99 }), I('estanteM', 490, 3872, 180)] },
      C: { nombre: 'Vacío', items: [] } }; } },
    dormitorio: { n: 'Dormitorio O (2P)', nivel: 'P2', piso: P2, vista: { p: [560, 930, 3050], t: [300, 620, 2650] }, esc: () => { const I = itA('dormitorio'); return {
      A: { nombre: 'Cabecera a la medianera sur', items: [I('camaDoble', 125, 2865, 90, { L: 170, D: 215 }), I('butacaAm', 420, 2480, 180, { tela: 'lino' })] },
      B: { nombre: 'Mirando al jardín', items: [I('camaDoble', 400, 2970, 180, { L: 220, D: 215 }), I('butacaAm', 150, 2500, 135, { tela: 'mostaza' })] },
      C: { nombre: 'Vacío', items: [] } }; } },
    vestidor: { n: 'Vestidor (terraza)', piso: TZ, vista: { p: [300, 1000, 3200], t: [100, 760, 3400] }, esc: () => { const I = itA('vestidor'); return {
      A: { nombre: 'Roperos a lo largo', items: [I('roperoA', 46, 3255, 90), I('roperoA', 46, 3367, 90), I('roperoA', 46, 3479, 90)] },
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
