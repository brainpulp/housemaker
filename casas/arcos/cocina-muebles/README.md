# Cocina de Arcos: muebles (diagrama + despiece)

Va en la misma página que la de Carhué: https://claude.ai/artifact/SLXfWvDJuVMAwdyqUZSrTC («Cocinas de Carhué y Arcos: muebles», 20/11/2026), con pestañas Carhué / Arcos y un render 3D de cada cocina.

- `python3 gen.py <arcos.json>`: medidas del escenario A de `casas/arcos/equipamiento-arcos.js` (mesada de 3,92 con 4 columnas de 93,75 + bandejero de 17, columna del horno de 60, módulo de basura en la columna 2, cajas en melamina blanca con los costados a la vista como los frentes, alacenas, bloque de la isla con 2 columnas de 76) y materiales de la tabla de Compras de Obras.
- `python3 armar.py <carhue.html> <arcos.json> <salida.html>`: parte de la página de Carhué sola (la que deja `casas/carhue/cocina-muebles/page.py`, sin el envoltorio `<!doctype…<body>` del artifact) y le suma las pestañas, los renders y Arcos.
- Renders: `herramientas/render-cocina.mjs` → `render-carhue.jpg` y `render-arcos.jpg`, publicados como archivos de la página.

Pendientes que la página marca: color del tapacanto de las cajas blancas (blanco o negro); el cajón de arriba de la isla queda bajo el anafe (en Carhué ahí va un frente fijo de 0,14); tiradores (el modelo tiene barras negras).

Para republicar sólo Arcos sin tocar Carhué: bajar el `index.html` publicado, reemplazar desde `<section id="v-ar-carpintero"` hasta `</main>` por el `html` de `gen.py` (con el render) y el `ar:` del `const CSV` por su `csv` (así se hizo el 25/11/2026).

## Lista de corte para el cortero (Sólido)

`corte.py` arma la lista de corte de placas (sin el petiribí macizo, que hace el carpintero): una fila por medida, cantos por lado
(L1 L2 A1 A2) con su color, veta en la texturada, y las piezas de la alacena sobre la heladera marcadas como provisorias.
`corte_page.py` arma la página para compartir (artifact https://claude.ai/artifact/CurWLRA1ALVqAonwFHCPSS, publicado desde archivos).

    python3 gen.py /tmp/cm/arcos.json && python3 corte.py /tmp/cm/arcos.json /tmp/corte && python3 corte_page.py /tmp/corte/arcos-cocina-corte-placas.json index.html

La planilla (xlsx y csv) va a /mnt/project-files/arcos/.
