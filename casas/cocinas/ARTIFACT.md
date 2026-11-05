# Cocinas

- **Qué es:** las tres cocinas de Maxi (Mocoretá, Carhué, Arcos) recortadas y puestas en una misma escena, sin techo, para diseñarlas en detalle (3/11/2026).
- **Fuentes:** Carhué y Arcos se recortan al cargar desde `casas/carhue/modelo.js` y `casas/arcos/modelo.js` (`fuente-*.js`; `armar-extra.sh` pone las copias reales en `dist/cocinas`). Mocoretá sale de `mocoreta.js` (croquis a mano del 3/11, con supuestos en DUDAS).
- **Artifact:** https://claude.ai/artifact/PcmnBfXDagDHZxJt98RGht
- **Versión publicada:** 0.1.16 (4/11/2026). Se publican sólo los archivos que importa la página (motor sin personas, árboles, tours ni térmica) más los `mueble-*.js` del catálogo.
- **Capacidades:** `db`.
- **Página:** `cocinas.html`. Archivos propios: `modelo.js` (composición y recortes), `mocoreta.js`, `casa.js`, `equipamiento-cocinas.js`, `video.js`, `fuente-carhue.js`, `fuente-arcos.js`, `armar-extra.sh`.
- **Motor publicado:** 578bd8b (commit del último cambio en `motor/` que tiene el artifact; lo actualiza quien publica y la tarea nocturna).
- **Para volcar lo diseñado a cada casa:** los muebles viven en `equipamiento-cocinas.js` y en la base de esta página; las coordenadas de la escena se vuelven a las de cada casa restando el traslado `d` de `CASAS` en `modelo.js` (Carhué: x +1817, y −1550; Arcos: y +330, z +21).
