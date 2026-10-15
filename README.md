# housemaker

Motor de CAD / visor 3D de casas, hecho con Three.js. Cada casa se publica como su propio artifact de claude.ai. Nació con la casa del Pasaje Carhué, en Ingeniero Maschwitz (`casas/carhue`).

Maxi no toca git: los cambios los hace Claude, que sigue la skill **housemaker**.

## Qué hace el motor

- **Visor:** visor 3D de piezas con código, con selección, outliner, capas, cortes, vistas, medir, señalar, marcas y edición (mover, estirar, borrar).
- **Opciones de diseño:** variantes por zona. Al elegir una pieza aparece un desplegable de alternativas junto a ella.
- **Equipamiento por ambiente:** muebles, luces y plantas, con escenarios intercambiables y guardados en la base del artifact.
- **Asoleamiento:** fecha, hora y lugar, con luces programadas tipo smart home y un switch día/noche.
- **Simulación térmica:** por ambiente, con calefactores y escenarios.
- **Recorridos y entorno:** tours a pie (suben escaleras) y en dron, personas que caminan sin atravesar muebles, y vegetación con estaciones (ez-tree).
- **Interfaz:** barra derecha en acordeón de ancho variable, sin paneles flotantes.
- **Gráficos:** cuatro niveles de calidad y modo reposo cuando no se toca nada.

## Estructura

```
motor/            lo común a todas las casas (se copia tal cual)
casas/<casa>/     lo propio de cada casa:
  <casa>.html       la página (import map de three@0.160.0 por CDN)
  modelo.js         datos: muros, aberturas, locales, techos, estructura… (única fuente de verdad)
  casa.js           arma las piezas 3D desde modelo.js y arranca los módulos del motor
  ARTIFACT.md       URL del artifact publicado y notas de publicación
herramientas/
  armar.sh          arma dist/<casa>/ plano (motor + casa) para publicar o probar
  pruebas/*.mjs     pruebas headless (Playwright): techos, lucarnas/dormers, térmica, barra, alternativas
docs/             arquitectura, cómo hacer una casa nueva, deuda (lo que falta generalizar)
```

## Uso

```bash
npm i                                   # three 0.160.0 y playwright (sólo para probar)
bash herramientas/armar.sh carhue --prueba
python3 -m http.server 8765 --directory dist &
URL=http://localhost:8765/carhue/_prueba.html node herramientas/pruebas/techos.mjs 0,j,c
```

Para publicar, se publica `dist/<casa>/<casa>.html` en el artifact de la casa y se pasan los demás archivos de `dist/<casa>/` como `files`. La URL del artifact está en `casas/<casa>/ARTIFACT.md`.

Más detalle: [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) · [docs/CASA-NUEVA.md](docs/CASA-NUEVA.md) · [docs/DEUDA.md](docs/DEUDA.md)
