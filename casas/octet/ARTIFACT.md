# Octet

- **Qué es:** editor de octet truss (estructuras espaciales de tubos iguales y nodos, retícula FCC): la mesa de vidrio de Maxi (foto del 4/11/2026) y lo que quiera armar con ese sistema. Los modelos se guardan en la base y se llevan a cualquier casa como mueble «octet» (`motor/octet-modelos.js`).
- **Artifact:** https://claude.ai/artifact/229ZEa1sF8HG1WGm1BwmWX
- **Versión publicada:** 0.1.4 (6/11/2026). Se publican sólo los archivos que importa la página (casa.js, modelo.js, octet.js, octet-editor.js y el visor con vistas, cortes, medir, señalar, marcas, inspector y barra; sin equipamiento, personas, árboles ni térmica).
- **Capacidades:** `db` (colección `octet`, un documento por modelo; más `nombres`, `marcas`, `vistas`, `estado`, como todas).
- **Página:** `octet.html`. Archivos propios: `modelo.js` (META, DUDAS, CAMBIOS y la semilla), `casa.js`. Del motor: `octet.js` (retícula y geometría) y `octet-editor.js` (edición y panel).
- **Para pasar un modelo a una casa:** leer `octet/<id>` con ArtifactData, copiarlo en `MODELOS` de `motor/octet-modelos.js` y ponerlo en el escenario de muebles de la casa como `{t:'octet', p:{modelo:'<id>'}}`.
- **Motor publicado:** 71ad49c (commit del último cambio en `motor/` que tiene el artifact; lo actualiza quien publica y la tarea nocturna).
