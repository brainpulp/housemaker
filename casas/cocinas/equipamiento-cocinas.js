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
        I('heladera', 52.5, 1250.5, 0, { L: 65, D: 65, H: 190, col: 'negro' }), I('mesada', 48.5, 1469, 90, { L: 362, D: 62, fr: 'negro', top: 'granito', huecos: [[161, 80, 50]] }), I('bachaFarm', 55.5, 1308, 90, { L: 80, D: 50 }),
        I('salpicadero', 18.5, 1423, 90, { L: 270, H: 10 }), I('salpicadero', 17.5, 1393, 90, { L: 30, H: 108, caja: 10 }, 92), I('campanaIsla', 210, 1570, 180, { L: 90, D: 60 }),
        I('isla', 210, 1595, 180, { L: 260, D: 110, vol: 30, fr: 'roble', top: 'granito', top2: 'madRust', corte: 60 }), I('anafe', 210, 1570, 180, { L: 90, D: 52, n: 5 }),
        I('banqueta', 138, 1672, 0, { mad: 'roble' }), I('banqueta', 198, 1672, 0, { mad: 'roble' }), I('banqueta', 258, 1672, 0, { mad: 'roble' }), I('banqueta', 318, 1672, 0, { mad: 'roble' })] },
      B: { nombre: 'Como está hoy (15/10): verde, heladera roja', items: [
        I('heladera', 52.5, 1250.5, 0, { L: 65, D: 65, H: 190, col: 'rojo' }), I('mesada', 48.5, 1469, 90, { L: 362, D: 62, fr: 'verde', top: 'granito' }), I('isla', 210, 1595, 180, { L: 260, D: 110, vol: 30, fr: 'verde', top: 'granito' }), I('anafe', 198, 1580, 180, { L: 75, D: 52 }),
        I('banqueta', 138, 1672, 0), I('banqueta', 198, 1672, 0), I('banqueta', 258, 1672, 0), I('banqueta', 318, 1672, 0)] },
      C: { nombre: 'Vacía', items: [] } }; } },
    arcos: { n: 'Arcos', piso: 51, ver: p => p.verAR !== false, vista: { p: [640, 250, 2130], t: [120, 130, 2440] }, esc: () => { const I = itA('arcos'); return {
      A: { nombre: 'Propuesta 2/11: granito negro, petiribí, isla con hornallas', items: [
        I('heladera', 52, 2158, 90, { L: 75, D: 70, H: 190, col: 'negro' }), I('mesada', 46, 2378, 90, { L: 362, D: 62, fr: 'madClara', top: 'granito' }), I('bacha', 48, 2290, 90, { L: 80 }),
        I('columna', 46, 2588, 90, { L: 58, D: 62, H: 228, fr: 'madClara' }),
        I('alacena', 32.5, 2257, 90, { L: 120, D: 35, H: 78, fr: 'negro' }), I('alacena', 32.5, 2378, 90, { L: 120, D: 35, H: 78, fr: 'negro' }), I('alacena', 32.5, 2499, 90, { L: 120, D: 35, H: 78, fr: 'negro' }),
        I('isla', 227, 2378, -90, { L: 200, D: 90, vol: 0, fr: 'madClara', top: 'granito' }), I('anafe', 227, 2378, -90, { L: 90, D: 52, n: 5 }), I('campanaIsla', 227, 2378, -90, { L: 90, D: 60 }),
        I('mesada', 227, 2243, -90, { L: 70, D: 90, H: 90, fr: 'madRust', top: 'madRust' })] },
      B: { nombre: 'Vacía', items: [] } }; } },
    mocoreta: { n: 'Mocoretá', piso: 0, ver: p => p.verMO !== false, vista: { p: [740, 330, 80], t: [200, 70, 300] }, esc: () => { const I = itA('mocoreta'); return {
      A: { nombre: 'Como está hoy (croquis 3/11)', items: [
        I('mesada', 124, 42.5, 0, { L: 248, D: 85, H: 90, fr: 'madClara', top: 'granito' }), I('anafe', 125, 44, 0, { L: 60, D: 52 }), I('heladera', 291.5, 36, 0, { L: 65, D: 70, H: 190, col: 'acero' }),
        I('mesada', 32.5, 300, 90, { L: 300, D: 65, H: 90, fr: 'madClara', top: 'granito' }), I('bacha', 34.5, 192, 90, { L: 80 }),
        I('isla', 235, 240, 0, { L: 220, D: 90, vol: 0, fr: 'madRust', top: 'madRust' }),
        I('mesaComedor', 267, 530, 0, { L: 200, D: 95 }), ...sillas(I, 267, 530, 200, 95, 3)] },
      B: { nombre: 'Vacía', items: [] } }; } },
  };
  return { inicial: 'carhue', AMB, orden: ['mocoreta', 'carhue', 'arcos'] };
}
