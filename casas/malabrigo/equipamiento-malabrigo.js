/* Equipamiento de la casita: dos ambientes (habitación y galería) con escenarios de partida. El motor (motor/equipamiento.js) es el mismo de las casas.
   Ejes: x de sur a norte, y de oeste (fondo) a este (galería). Giro r: 0 = el frente del mueble mira al este, 90 = al norte, 180 = al oeste, −90 = al sur.
   La habitación tiene dos plantas («Planta» en Ver): en la habitación los escenarios A y B son para 4 × 4 y el C para 4 × 3; en la galería, A es 4 × 4 y B es 4 × 3. casa.js cambia el escenario al cambiar la planta.
   La hamaca no es un mueble del catálogo: es una pieza de la casa (casa.js, «Hamaca» en Ver). */
export function equipMalabrigo({ itA }) {
  const AMB = {
    habitacion: { n: 'Habitación', piso: 0, vista: { p: [-150, 230, 700], t: [220, 90, 180] }, esc: () => { const I = itA('habitacion');
      const cocina = [I('heladera', 35, 32, 0, { L: 60, D: 60, H: 150, col: 'acero' }), I('mesada', 145, 30, 0, { L: 150, D: 60, H: 90, fr: 'madClara', top: 'granito', puertas: [1] }), I('bacha', 185, 32, 0, { L: 60 }), I('anafe', 105, 30, 0, { L: 60, D: 52, n: 2 })];
      const mesa = [I('mesa', 35, 200, 90, { L: 110, D: 70, H: 76, mad: 'madClara' }), I('silla', 98, 172, 180), I('silla', 98, 228, 180)];
      return {
        A: { nombre: '4 × 4 · una cama', items: [...cocina, ...mesa, I('camaSimple', 350, 102.5, 0, { L: 100, D: 205, H: 90 }), I('placard', 372.5, 265, -90, { L: 100, D: 55, H: 200, fr: 'madClara' })] },
        B: { nombre: '4 × 4 · cucheta para dos', items: [...cocina, ...mesa, I('cucheta', 346, 100, 0, { L: 95, D: 195, mad: 'madClara' }), I('placard', 372.5, 265, -90, { L: 100, D: 55, H: 200, fr: 'madClara' })] },
        /* 4 × 3: el fondo es 3,00; la mesa va con la cabecera contra el muro sur y el placard, al pie de la cama */
        C: { nombre: '4 × 3 · una cama', items: [...cocina, I('mesa', 35, 165, 90, { L: 100, D: 65, H: 76, mad: 'madClara' }), I('silla', 95, 140, 180), I('silla', 95, 190, 180),
          I('camaSimple', 350, 102.5, 0, { L: 100, D: 205, H: 90 }), I('placard', 372.5, 250, -90, { L: 80, D: 55, H: 200, fr: 'madClara' })] },
        D: { nombre: 'Vacía', items: [] } }; } },
    galeria: { n: 'Galería', piso: -3, vista: { p: [-80, 200, 900], t: [200, 100, 480] }, esc: () => { const I = itA('galeria'); return {
      A: { nombre: '4 × 4 · banco contra la pared', items: [I('banco', 240, 439, 0, { L: 180, D: 38, H: 45, mad: 'madRust' })] },
      B: { nombre: '4 × 3 · banco contra la pared', items: [I('banco', 240, 339, 0, { L: 180, D: 38, H: 45, mad: 'madRust' })] },
      C: { nombre: 'Vacía', items: [] } }; } },
  };
  function escLuces(a, I) {
    switch (a) {
      case 'habitacion': return { A: { nombre: 'Plafón en el medio', items: [I('plafon', 200, 200, 0, { diam: 30, lm: 1500, K: 3000 })] }, B: { nombre: 'Sin luces', items: [] } };
      case 'galeria': return { A: { nombre: 'Aplique sobre la puerta', items: [I('aplique', 85, 421, 0, { z: 230, lm: 350, K: 2700 })] }, B: { nombre: 'Sin luces', items: [] } };
      default: return { A: { nombre: 'Sin luces', items: [] } };
    }
  }
  function escCal(a, I) {
    switch (a) {
      case 'habitacion': return { A: { nombre: 'Sin calefacción (clima cálido)', items: [] }, B: { nombre: 'Salamandra chica en el rincón SE', items: [I('salamandra', 45, 340, 90, { kW: 5, eta: 75 })] } };
      default: return { A: { nombre: 'Sin calefacción', items: [] } };
    }
  }
  return { inicial: 'habitacion', AMB, orden: ['habitacion', 'galeria'], luces: escLuces, cal: escCal };
}
