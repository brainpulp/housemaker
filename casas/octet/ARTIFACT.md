# Octet

- **Qué es:** editor de octet truss (estructuras espaciales de tubos iguales y nodos, retícula FCC): la mesa de vidrio de Maxi (foto del 4/11/2026) y lo que quiera armar con ese sistema. Los modelos se guardan en la base y se llevan a cualquier casa como mueble «octet» (`motor/octet-modelos.js`).
- **Artifact:** (pendiente)
- **Capacidades:** `db` (colección `octet`, un documento por modelo; más `nombres`, `marcas`, `vistas`, `estado`, como todas).
- **Página:** `octet.html`. Archivos propios: `modelo.js` (META, DUDAS, CAMBIOS y la semilla), `casa.js`. Del motor: `octet.js` (retícula y geometría) y `octet-editor.js` (edición y panel).
- **Para pasar un modelo a una casa:** leer `octet/<id>` con ArtifactData, copiarlo en `MODELOS` de `motor/octet-modelos.js` y ponerlo en el escenario de muebles de la casa como `{t:'octet', p:{modelo:'<id>'}}`.
- **Motor publicado:** (pendiente)
