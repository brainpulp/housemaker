/* Equipamiento de Arcos: ambientes y escenarios de partida. El motor (motor/equipamiento.js) es el mismo de Carhué; acá sólo van los datos de esta casa.
   Maxi 21/10: «M-33 delimita un baño (hacia la calle) y una despensa (hacia el jardín), equipalas como tales. En el foso del living va un grueso
   sillón en L, contra los lados norte y este, y una mesa baja rectangular. No uses esos muebles boxy, usá muebles buenos, como los de Carhué»:
   todo lo que tiene modelo 3D real (motor/modelos.js) va con el modelo; quedan de cajas sólo la alfombra y las reposeras.
   Ojo con el volumen alto del SketchUp sobre la cocina (duda D-15: x 0,18–2,40, y 26,64–27,31, de +3,16 al techo): atraviesa el entrepiso y el 2P, los muebles lo esquivan.
   Ejes: x de sur a norte (medianera S en 0, N en 865), y de oeste (jardín) a este (Arcos, fachada en 3902). Pisos medidos en el modelo.
   Giro r: 0 = el frente del mueble mira al este (calle), 180 = al jardín, 90 = al norte, −90 = al sur.
   La cocina y los baños de 1P y 2P no van: ya están amueblados (SketchUp de Maxi y baño de 2P de la obra). */
export function equipArcos({ itA }) {
  const PB = 72.3, HUND = 22.3, EP = 329, P1 = 417.3, P2 = 613.3, TZ = 757;
  /* sillas alrededor de una mesa rectangular a lo ancho (r 0): n por lado */
  const sillas = (I, cx, cy, L, D, n, t = 'sillaCover') => [...Array(n)].flatMap((_, k) => { const x = cx - L / 2 + L * (k + .5) / n; return [I(t, x, cy - D / 2 - 28, 0), I(t, x, cy + D / 2 + 28, 180)]; });
  const AMB = {
    living: { n: 'Living (PB)', piso: PB, vista: { p: [520, 650, 3150], t: [520, 90, 3600] }, esc: () => { const I = itA('living'); return {
      A: { nombre: 'Estar mirando a la calle', items: [I('alfombra', 520, 3650, 0, { L: 300, D: 220 }), I('sofaRaffey', 520, 3515, 0, { L: 260, D: 99 }), I('ratonaJoco', 520, 3670, 0, { L: 140, D: 115 }),
        I('butacaAm', 320, 3770, 135, { tela: 'lino' }), I('butacaAm', 720, 3770, -135, { tela: 'mostaza' })] },
      B: { nombre: 'Comedor + estar', items: [I('mesaComedor', 520, 3250, 0, { L: 220, D: 95 }), ...sillas(I, 520, 3250, 220, 95, 3),
        I('alfombra', 560, 3730, 0, { L: 280, D: 200 }), I('sofaRaffey', 560, 3590, 0, { L: 240, D: 99 }), I('ratonaJoco', 560, 3740, 0, { L: 130, D: 105 }), I('butacaAm', 330, 3800, 135, { tela: 'mostaza' })] },
      C: { nombre: 'Vacío', items: [] } }; } },
    estar: { n: 'Estar hundido (foso del living)', piso: HUND, vista: { p: [520, 560, 2350], t: [600, 40, 2720] }, esc: () => { const I = itA('estar'); return {
      /* el foso va de x 3,85 a 8,30 y de y 24,25 a 28,63: el sillón en L apoya el respaldo largo contra el lado este y la chaise contra el norte */
      A: { nombre: 'Sillón en L y mesa baja', items: [I('sofaLcb', 622, 2745, 180, { L: 410, D: 230, H: 78, lado: 'izq' }), I('mesaBaja', 560, 2660, 0, { L: 130, D: 70, H: 40 })] },
      B: { nombre: 'Comedor mirando al jardín', items: [I('mesaComedor', 590, 2650, 0, { L: 220, D: 95 }), ...sillas(I, 590, 2650, 220, 95, 3)] },
      C: { nombre: 'Vacío', items: [] } }; } },
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
  return { inicial: 'living', AMB, orden: Object.keys(AMB), alMezclar };
}
