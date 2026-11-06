# Casita de Malabrigo

- **Casa:** vivienda mínima para trabajadores de campo en Malabrigo (Santa Fe), para un amigo de Maxi. Pedido del 5/11/2026: habitación de 4 × 3 o 4 × 4 con una cama, sin baño, con bacha, y una galería para tomar mate cocido o colgar la hamaca paraguaya.
- **Fuente:** el pedido de Maxi. No hay plano ni terreno todavía: todo es proyecto, con conf 'supuesto' y nueve dudas (D-01 a D-09).
- **Artifact:** https://claude.ai/artifact/7CRPa9SnWHdYSpH1i8XUaC
- **Versión publicada:** 0.1.4 (6/11/2026): motor 11ede6c. 0.1.1: arreglo: faltaba `calco-glb.js` (vacío) y la planta no abría. 0.1.0: primera versión. Habitación 4 × 4 (variante 4 × 3 en «Planta»), galería de 2,00 al este bajo el mismo techo de chapa a un agua (12 %), postes de madera dura, viga 3″ × 8″, tirantes 3″ × 6″ cada 0,60 y clavaderas; hamaca entre los postes; cielorraso opcional; escenarios de muebles (una cama / cucheta / 4 × 3); tours; sol de Malabrigo; térmica con el clima de Reconquista; cómputo aproximado. Se publican sólo los archivos que importa la casa.
- **Capacidades:** `db`.
- **Página:** `malabrigo.html`. Archivos propios: `modelo.js` (tablas; `modelo(D)` genera las dos plantas), `casa.js` (armado, tirantes inclinados, hamaca, cielorraso, cómputo), `equipamiento-malabrigo.js`, `tours-malabrigo.js`, `video.js`, `calco-glb.js` (vacío: el visor de planta lo importa siempre).
- **Pruebas (5/11/2026):** apoyos 2 bien / 0 mal; intersecciones 0 cruces (66 encuentros esperados); muebles 0 choques en los cuatro escenarios. Los tirantes y clavaderas son tipo 'tirante' / 'clavadera' en ESTRUCTURA: apoyos.mjs no los revisa (sólo vigas horizontales); se armaron para apoyar en los dos muros y la viga.
- **Motor publicado:** 575c326 (commit del último cambio en `motor/` que tiene el artifact; lo actualiza quien publica y la tarea nocturna).
