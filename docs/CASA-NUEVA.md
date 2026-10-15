# Casa nueva

1. **Material del usuario:** planos con cotas (del trámite, en PDF o DWG), fotos y video, y un calco 3D exportado desde SketchUp (*Archivo → Exportar → Modelo 3D* como .dae u .obj) u Onshape (.glb). Las cotas de los planos mandan sobre el calco.
2. **Copiar la casa base:** `casas/carhue` → `casas/<casa>`. Renombrar el html a `<casa>.html`, cambiar el título y vaciar las tablas de `modelo.js`, dejando el formato.
3. **Cargar `modelo.js` por etapas, mostrándole cada una al usuario:**
   1. Ejes y niveles.
   2. Muros (con espesor y tipo).
   3. Aberturas.
   4. Locales.
   5. Estructura.
   6. Techos.
   7. Escaleras y deck.
   8. Implantación.

   Lo que no esté claro va a `DUDAS` como pregunta, con `conf:'supuesto'`.
4. **Ajustar `casa.js`:** sacar las piezas especiales de Carhué que no apliquen y dejar los `params` y `ZONAS` de esta casa.
5. **Mientras no esté resuelto el punto 1 de [DEUDA.md](DEUDA.md):** poner en el motor (o en la casa, si ya se separó) los ambientes, escenarios, lugar y clima de la casa nueva.
6. **Armar y probar:** `bash herramientas/armar.sh <casa> --prueba`, servir `dist/` y correr las pruebas (techos y barra).
7. **Publicar:** artifact nuevo con `dist/<casa>/<casa>.html` y los demás archivos como `files`, con la capacidad `db`. Anotar la URL en `casas/<casa>/ARTIFACT.md`.
8. **Si en el camino se mejoró algo del motor:** subirlo a `motor/` (y no a la casa), anotarlo en el commit y, si cambia cómo se trabaja, proponer la actualización de la skill.
