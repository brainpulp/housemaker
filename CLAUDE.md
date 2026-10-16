# housemaker: instrucciones para Claude

- **Antes de diseñar o cambiar una casa,** leer `docs/GUIAS-DE-DISENO.md`. La primera regla es simplificar siempre que se pueda.
- **Arquitectura y flujo de trabajo:** `README.md`, `docs/ARQUITECTURA.md` y `docs/CASA-NUEVA.md`.
- **Qué va dónde:** lo común a todas las casas va en `motor/`; lo propio de cada casa, en `casas/<casa>/`.
- **Por cada publicación,** agregar una entrada en `CAMBIOS` de `casas/<casa>/modelo.js` y subir `META.version`.
- **Antes de publicar,** armar con `bash herramientas/armar.sh <casa>` y correr las pruebas de `herramientas/pruebas/`. Siempre `node herramientas/pruebas/apoyos.mjs <casa>`: nada flota ni atraviesa (guía 9, «Entender el edificio»).
- **Con Maxi:** castellano rioplatense, respuestas cortas y honestas, sin especular. Él no toca git: commit y push los hace Claude.
- **Antes de commitear,** hacer `git pull --rebase`, porque puede haber otras sesiones trabajando en otras casas.
- **Motor compartido:** las casas no cargan el motor de GitHub (claude.ai no deja que un artifact cargue código de otro; probado el 16/10/2026). Si se toca `motor/`, en la misma sesión se arman y publican **todas** las casas (`casas/*/ARTIFACT.md`), sólo con los archivos que cambiaron respecto de lo publicado, y se anota el commit en «Motor publicado» de cada `ARTIFACT.md`.
- **Tarea nocturna «housemaker: republicar casas»** (4:00, hora de Buenos Aires): hace lo mismo con las casas cuyo «Motor publicado» quedó atrás. Si una publicación choca con una versión que no leyó, integra los cambios; si no puede sin pisar trabajo ajeno, no publica esa casa y avisa.

