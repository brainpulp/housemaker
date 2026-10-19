# Laboratorio de muebles

- **Artifact:** https://claude.ai/artifact/2eXNBHhaeUysX8V3Bz6qhm
- **Capacidades:** `db` (colección `recetas`, un documento por mueble: `quitar`, `rot`, `espejo`, `p` {L,D,H}, `mats`).
- **Página:** `laboratorio.html`. Archivos: `modelos.js` y los `mueble-*.js` del motor.
- Para pasar una receta a la casa: leerla con ArtifactData (`recetas/<clave>`), copiarla como `receta` (y `p`) en `MODELOS[clave]` de `motor/modelos.js`, sacarle `crudo:true` si ya está lista, y publicar las casas y el catálogo.
- **Motor publicado:** efddb79
