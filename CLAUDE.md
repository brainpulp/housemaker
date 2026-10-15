# housemaker: instrucciones para Claude

- **Antes de diseñar o cambiar una casa,** leer `docs/GUIAS-DE-DISENO.md`. La primera regla es simplificar siempre que se pueda.
- **Arquitectura y flujo de trabajo:** `README.md`, `docs/ARQUITECTURA.md` y `docs/CASA-NUEVA.md`.
- **Qué va dónde:** lo común a todas las casas va en `motor/`; lo propio de cada casa, en `casas/<casa>/`.
- **Por cada publicación,** agregar una entrada en `CAMBIOS` de `casas/<casa>/modelo.js` y subir `META.version`.
- **Antes de publicar,** armar con `bash herramientas/armar.sh <casa>` y correr las pruebas de `herramientas/pruebas/`.
- **Con Maxi:** castellano rioplatense, respuestas cortas y honestas, sin especular. Él no toca git: commit y push los hace Claude.
- **Antes de commitear,** hacer `git pull --rebase`, porque puede haber otras sesiones trabajando en otras casas.
