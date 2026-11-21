# Cocina de Arcos: muebles (diagrama + despiece)

Va en la misma página que la de Carhué: https://claude.ai/artifact/SLXfWvDJuVMAwdyqUZSrTC («Cocinas de Carhué y Arcos: muebles», 20/11/2026), con pestañas Carhué / Arcos y un render 3D de cada cocina.

- `python3 gen.py <arcos.json>`: medidas del escenario A de `casas/arcos/equipamiento-arcos.js` (mesada de 3,92 con 4 columnas de 93,75 + bandejero de 17, columna del horno de 58, alacenas, bloque de la isla con 2 columnas de 76) y materiales de la tabla de Compras de Obras.
- `python3 armar.py <carhue.html> <arcos.json> <salida.html>`: parte de la página de Carhué sola (la que deja `casas/carhue/cocina-muebles/page.py`, sin el envoltorio `<!doctype…<body>` del artifact) y le suma las pestañas, los renders y Arcos.
- Renders: `herramientas/render-cocina.mjs` → `render-carhue.jpg` y `render-arcos.jpg`, publicados como archivos de la página.

Pendientes que la página marca: el horno de 60 no entra en la columna de 58 (adentro quedan ~54); el cajón de arriba de la isla queda bajo el anafe (en Carhué ahí va un frente fijo de 0,14); tiradores (el modelo tiene barras negras).
