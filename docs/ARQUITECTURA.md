# Arquitectura

## Convenciones

- **Unidades:** cm.
- **Ejes de planta:** `x` y `y`. En Carhué, x apunta al norte y y al este. El desvío respecto del norte verdadero se fija en el asoleamiento.
- **3D:** `X = x`, `Y = altura`, `Z = y`. La altura se mide desde el piso de planta baja (0).
- **Códigos de pieza:** cada pieza tiene uno: `M-xx` muros, `V-`/`P-` aberturas, `L-xx` locales, `T-xx` techos, `CAB-` cabios, `LU-` lucarnas, `DM-` dormers, etc. Son los que se ven en el outliner y los que se usan para hablar de la casa.
- **Idioma:** textos de la interfaz y comentarios en castellano rioplatense.

## Datos de la casa: `casas/<casa>/modelo.js`

Es la única fuente de verdad. Exporta tablas:

`META, NIVELES, EJES, MUROS, ABERTURAS, LOCALES, ESTRUCTURA, ESCALERAS, DECK, TECHOS, CHIMENEAS, IMPLANTACION, DUDAS, VIDEO, CAMBIOS`

- Cada fila lleva `id`, `nombre`, `estado` (existente / nuevo / proyecto), `conf` (medido / modelo / estimado / supuesto) y `nota`.
- `CAMBIOS` es el registro que ve el usuario: se agrega una entrada `{fecha, v, txt}` arriba por cada publicación y se sube `META.version`.

## Armado 3D: `casas/<casa>/casa.js`

Hoy contiene tres cosas:

- **Las piezas.** `Pt(id, nombre, cat, geos, info, {group, tags})` arma cada pieza a partir de las tablas.
- **Las variantes de diseño.** `params` (selects y checks) y `ZONAS` (qué piezas abren qué variantes).
- **El arranque de los módulos del motor.** Van en este orden: marcas, realismo, luz, calidad, personas, equipamiento, árboles, noche, tours, térmica, editor, señalar, medir, vistas, barra, inspector y sidebar. Cada uno va en su `try{}`, así uno roto no tumba a los demás.

En `casa.js` también hay mucho específico de Carhué: lucarnas, dormers, la corrediza M-43, la cercha M-21, la escalera, el quincho. La deuda que hay que resolver para generalizarlo está en [DEUDA.md](DEUDA.md).

## Motor: `motor/`

| módulo | qué hace |
|---|---|
| `visor3d.js` | escena, cámara, selección, partes, `setParams`, `fly`, ocultar. Lazo de dibujo con **reposo**: sin actividad por 2,5 s dibuja 2 veces por segundo. Hay que llamar a `window.__despertar()` en toda animación. |
| `equipamiento.js`, `tours.js`, `termica.js` | muebles, luces, calefacción y plantas por escenarios; caminatas y vuelos; simulación térmica por zonas. El motor es el mismo para todas las casas: los datos (ambientes y escenarios, tours y escaleras, zonas y clima) los pasa cada casa (`casas/<casa>/equipamiento-<casa>.js`, `tours-<casa>.js` y las opciones de `initTermica`) |
| `vistas.js` | vistas fijas, ambientes aislados y guardadas, con los seis cortes ajustables que se guardan en cada vista; la usan todas las casas (`initVistas`) |
| `toolbar.js` | barra de herramientas, capas (◐ transparencia), cortes, variantes, chip de alternativas junto a la pieza elegida |
| `sidebar.js` | barra derecha en acordeón. Adopta los paneles por id (`varCard`, `capasPanel`, `eqCard`, `termCard`, `medPanel`, `senPanel`, `edPanel`, `marcasPanel`, el pop del sol, cortes, personas). Un panel nuevo **no** se hace flotante: se le agrega una sección acá. |
| `inspector.js` | selección (ficha, renombrar, nota) y outliner |
| `equipamiento.js` | capas mue/luz/veg/cal con escenarios por ambiente (`AMB`), migraciones `MIG` (agregar) y `MUT` (corregir), y la base del artifact |
| `muebles.js` | catálogo de muebles por parámetros, independiente de la casa (lo usa `equipamiento.js` y la página `casas/catalogo`) |
| `modelos.js`, `mueble-*.js` | muebles hechos con modelos 3D reales (GLB de Objaverse/Sketchfab, CC BY, en base64); se cargan al aparecer y se llevan a la medida L × D × H |
| `luminarias.js` | catálogo de artefactos con sus luces reales; los de techo copian la pendiente del cielorraso y los de pie se acortan |
| `calefaccion.js` | catálogo de calefactores (salamandra, tiro balanceado, fancoil, losa radiante, caldera) |
| `termica.js` | simulación por zonas (un nodo por local, paso de 5 min, sol, vidrios, envolvente) |
| `noche.js` | sol (NOAA) para fecha, hora y lugar, cielo, luces programadas, pool de luces |
| `tours.js` | caminatas y vuelos de dron; recorrido «al abrir» guardado en la base |
| `personas.js`, `personas-*.js` | figuras de 1,70 que caminan sin atravesar muebles |
| `arboles.js`, `eztree/` | vegetación con estaciones |
| `calidad.js` | niveles de gráficos (alto, medio, liviano, mínimo) |
| `visor-planta.js` | planta en SVG navegable |
| `ediciones.js`, `editor3d.js` | ediciones del usuario guardadas encima del modelo |
| `nombres.js`, `marcas.js`, `medir.js`, `senalar.js`, `vistasui.js`, `luz.js`, `realismo.js`, `escalera.js`, `icons.js` | utilidades del visor |

## Persistencia

El artifact declara la capacidad `db`. Las colecciones son: `nombres`, `ediciones`, `marcas`, `vistas`, `estado`, `equipamiento`, `iluminacion`, `vegetacion` y `calefaccion`. Las preferencias de cada usuario van en `localStorage`, siempre dentro de try/catch.

Al cambiar escenarios de fábrica con datos ya guardados, se agrega una entrada en `MIG` o `MUT` (en `equipamiento.js`) con una bandera única. Así se corrige lo guardado una sola vez sin pisar lo que el usuario cambió.

## Reglas que salieron de Carhué

- **Revisar colisiones antes de publicar.** Correr `pruebas/techos.mjs` (artefactos que atraviesan el techo, en todos los escenarios) y `pruebas/lucarnas-dormers.mjs` con cada configuración de dormers.
- **Mecanismos realizables.** Bisagras, rieles, amortiguadores y alturas libres tienen que ser reales.
- **Nada flotante.** Todo panel va en la barra derecha.
- **Rendimiento.** Respetar el reposo y no dejar lazos que despierten el visor sin necesidad.
- **Exactitud.** Nada de especular: lo que se supone se marca `conf:'supuesto'` y se le pregunta al usuario.
