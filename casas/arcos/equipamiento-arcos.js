/* Equipamiento de Arcos: ambientes y escenarios de partida (propuesta para que Maxi corrija; Maxi 20/10: «dale»).
   El motor (motor/equipamiento.js) es el mismo de Carhué; acá sólo van los datos de esta casa.
   Ojo con el volumen alto del SketchUp sobre la cocina (duda D-15: x 0,18–2,40, y 26,64–27,31, de +3,16 al techo): atraviesa el entrepiso y el 2P, los muebles lo esquivan.
   Ejes: x de sur a norte (medianera S en 0, N en 865), y de oeste (jardín) a este (Arcos, fachada en 3902). Pisos medidos en el modelo.
   Giro r: 0 = el frente del mueble mira al este (calle), 180 = al jardín, 90 = al norte, −90 = al sur.
   La cocina, los baños y el toilette no van: ya están amueblados (SketchUp de Maxi y baño de 2P de la obra). */
export function equipArcos({ itA }) {
  const PB = 72.3, HUND = 22.3, EP = 329, P1 = 417.3, P2 = 613.3, TZ = 757;
  /* sillas alrededor de una mesa rectangular a lo ancho (r 0): n por lado */
  const sillas = (I, cx, cy, L, D, n, t = 'silla') => [...Array(n)].flatMap((_, k) => { const x = cx - L / 2 + L * (k + .5) / n; return [I(t, x, cy - D / 2 - 22, 0), I(t, x, cy + D / 2 + 22, 180)]; });
  const AMB = {
    living: { n: 'Living (PB)', piso: PB, vista: { p: [520, 650, 3150], t: [520, 90, 3600] }, esc: () => { const I = itA('living'); return {
      A: { nombre: 'Estar mirando a la calle', items: [I('alfombra', 520, 3640, 0, { L: 300, D: 220 }), I('sofa', 520, 3510, 0, { L: 260, D: 95, tela: 'lino' }), I('ratona', 520, 3650, 0, { L: 120, D: 60 }),
        I('butaca', 320, 3770, 135, { tela: 'lino' }), I('butaca', 720, 3770, -135, { tela: 'mostaza' })] },
      B: { nombre: 'Comedor + estar', items: [I('mesa', 520, 3250, 0, { L: 220, D: 95 }), ...sillas(I, 520, 3250, 220, 95, 3),
        I('alfombra', 560, 3720, 0, { L: 280, D: 200 }), I('sofa', 560, 3580, 0, { L: 240, D: 95, tela: 'lino' }), I('ratona', 560, 3730, 0, { L: 110, D: 55 }), I('butaca', 330, 3790, 135, { tela: 'mostaza' })] },
      C: { nombre: 'Vacío', items: [] } }; } },
    estar: { n: 'Estar hundido (PB)', piso: HUND, vista: { p: [560, 600, 3150], t: [560, 40, 2600] }, esc: () => { const I = itA('estar'); return {
      A: { nombre: 'Estar mirando al jardín', items: [I('alfombraYute', 560, 2640, 0, { L: 300, D: 220 }), I('sofaPlat', 560, 2770, 180, { L: 280, D: 100, tela: 'lino', mad: 'roble' }),
        I('ratonaBaja', 560, 2640, 0, { L: 110 }), I('butaca', 440, 2560, 90, { tela: 'lino' }), I('butaca', 700, 2560, -90, { tela: 'mostaza' })] },
      B: { nombre: 'Comedor mirando al jardín', items: [I('mesaMaciza', 570, 2680, 0, { L: 240, D: 95 }), ...sillas(I, 570, 2680, 240, 95, 3, 'sillaCurva')] },
      C: { nombre: 'Vacío', items: [] } }; } },
    escritorio: { n: 'Escritorio (entrepiso)', nivel: 'EP', piso: EP, vista: { p: [560, 640, 2500], t: [170, 340, 2800] }, esc: () => { const I = itA('escritorio'); return {
      A: { nombre: 'Contra la medianera sur', items: [I('escritorio', 55, 2560, 90, { L: 160, D: 70 }), I('silla', 120, 2560, -90), I('biblioteca', 450, 3020, 180, { L: 200, D: 32, H: 200 })] },
      B: { nombre: 'Mirando al estar', items: [I('escritorio', 270, 2560, -90, { L: 160, D: 70 }), I('silla', 205, 2560, 90), I('biblioteca', 450, 3020, 180, { L: 200, D: 32, H: 200 }), I('butaca', 120, 2950, 135, { tela: 'lino' })] },
      C: { nombre: 'Vacío', items: [] } }; } },
    cuartoSE: { n: 'Cuarto SE (1P)', piso: P1, vista: { p: [400, 760, 3300], t: [200, 420, 3650] }, esc: () => { const I = itA('cuartoSE'); return {
      A: { nombre: 'Matrimonial', items: [I('cama', 117, 3600, 90, { L: 160, D: 200 }), I('mesaLuz', 42, 3490, 90), I('mesaLuz', 42, 3710, 90), I('placard', 250, 3326, 0, { L: 200, D: 60 })] },
      B: { nombre: 'Dos camas', items: [I('cama', 112, 3470, 90, { L: 90, D: 190 }), I('cama', 112, 3730, 90, { L: 90, D: 190 }), I('mesaLuz', 42, 3600, 90, { L: 40 }), I('placard', 250, 3326, 0, { L: 200, D: 60 })] },
      C: { nombre: 'Vacío', items: [] } }; } },
    cuartoNE: { n: 'Cuarto NE (1P)', piso: P1, vista: { p: [480, 760, 3350], t: [700, 420, 3680] }, esc: () => { const I = itA('cuartoNE'); return {
      A: { nombre: 'Cama contra la medianera N', items: [I('cama', 748, 3570, -90, { L: 160, D: 200 }), I('mesaLuz', 825, 3680, -90), I('comoda', 461, 3835, 90, { L: 100, D: 50 })] },
      B: { nombre: 'Estudio', items: [I('escritorio', 813, 3640, -90, { L: 160, D: 70 }), I('silla', 748, 3640, 90), I('sofa', 470 + 48, 3670, 90, { L: 200, D: 95, tela: 'petroleo' }), I('biblioteca', 452, 3835, 90, { L: 110, D: 32, H: 200 })] },
      C: { nombre: 'Vacío', items: [] } }; } },
    dormitorio: { n: 'Dormitorio O (2P)', nivel: 'P2', piso: P2, vista: { p: [560, 930, 3050], t: [300, 620, 2650] }, esc: () => { const I = itA('dormitorio'); return {
      A: { nombre: 'Cabecera a la medianera sur', items: [I('cama', 117, 2870, 90, { L: 160, D: 200 }), I('mesaLuz', 42, 2760, 90, { L: 40 }), I('mesaLuz', 42, 2980, 90, { L: 40 }), I('butaca', 420, 2480, 180, { tela: 'lino' })] },
      B: { nombre: 'Mirando al jardín', items: [I('cama', 400, 2975, 180, { L: 180, D: 200 }), I('mesaLuz', 280, 3050, 180), I('mesaLuz', 520, 3050, 180), I('butaca', 150, 2500, 135, { tela: 'mostaza' })] },
      C: { nombre: 'Vacío', items: [] } }; } },
    vestidor: { n: 'Vestidor (terraza)', piso: TZ, vista: { p: [300, 1000, 3200], t: [100, 760, 3400] }, esc: () => { const I = itA('vestidor'); return {
      A: { nombre: 'Placard a lo largo', items: [I('placard', 47, 3400, 90, { L: 300, D: 60, H: 230 })] },
      B: { nombre: 'Vacío', items: [] } }; } },
    terraza: { n: 'Terraza', piso: TZ, vista: { p: [700, 1150, 3150], t: [520, 760, 3600] }, esc: () => { const I = itA('terraza'); return {
      A: { nombre: 'Mesa afuera + reposeras', items: [I('mesa', 560, 3650, 0, { L: 180, D: 90 }), ...sillas(I, 560, 3650, 180, 90, 2), I('reposera', 330, 3500, 0), I('reposera', 410, 3500, 0)] },
      B: { nombre: 'Estar afuera', items: [I('sofa', 560, 3780, 180, { L: 240, D: 95, tela: 'petroleo' }), I('ratona', 560, 3620, 0, { L: 120, D: 60 }), I('butaca', 380, 3560, 90, { tela: 'lino' }), I('butaca', 740, 3560, -90, { tela: 'lino' })] },
      C: { nombre: 'Vacía', items: [] } }; } },
  };
  return { inicial: 'living', AMB, orden: Object.keys(AMB) };
}
