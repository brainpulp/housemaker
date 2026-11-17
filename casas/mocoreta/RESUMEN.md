# Mocoretá: resumen para arrancar una conversación nueva (17/11/2026, v0.10.0)

Leer esto en lugar de toda la conversación. El detalle de cada pieza está en `modelo.js` (constantes, `CAMBIOS`, `DUDAS`) y en `casa.js` (piezas 3D). Reglas de trabajo: `CLAUDE.md` y `docs/GUIAS-DE-DISENO.md`.

## La casa de hoy
- Casa de madera (eucalipto) sobre pilotes en Ingeniero Maschwitz. Mide 24,00 × 5,50, más 1,00 en voladizo al oeste. El piso está a 1,47 del terreno.
- Coordenadas (cm): x de sur a norte (0 = fila sur de columnas), y de oeste a este (0 = primer par oeste), z = 0 en el piso interior.
- Siete pares de columnas de 15 × 15, cada 4,00. Los módulos se numeran del 1 al 6 de este a oeste: el par k está en y = 2400 − (k − 1)·400.
- Fachadas: ventanales de 2,00 × 2,70 al norte y al sur. Al este, madera con una ventana de piso a techo de 1,00. Al oeste, madera con una ventana chica.
- Techo de chapa a un agua, alto al norte, sobre una cámara de 0,50 y un cielorraso a 3,00.
- Exterior: deck norte de 4,00 de tablones, con una plataforma baja de 6,00 × 4,00 a media altura y escalones. Deck sur chico.
- Puerta de entrada corrediza al norte (abre al oeste) y puerta de atrás al sur. Las dos son de hierro.
- Interior:
  - Módulo 2: desnivel (pozo de dos alzadas) con piso de laja, sillón en C de madera con almohadones y salamandra.
  - Cocina en el módulo 4, con la mesa de pinotea en el 3.
  - Biblioteca contra la pared este.
- Jardín: pinos, árboles y cerco tomados de una foto y un video, a ojo. Pileta, pérgola y tanque al oeste, también a ojo.

## Hipótesis de rediseño (alternativas del menú «Variantes», no son la casa de hoy)
- **Segundo piso, planta A** (la elegida; la B, que enroca escalera y puente, queda como opción):
  - Piso alto a +3,28 sobre los módulos 1 (oficina) y 3 (dormitorio). El módulo 2 queda en doble altura, con una galería al sur.
  - Terraza sobre los módulos 4 y 5. El 6 sigue con su chapa.
  - Frente norte de vidrio inclinado 30° hacia el sur, con vidrio repartido. Las ventanas son corredizas o proyectantes, según la opción.
  - Ensanche de 1,40 al sur en los módulos 2 y 3, con la escalera (18 alzadas, pedada 24) y un baño arriba.
  - Estructura completa, predimensionada sin calcular: en cada par, dos UPN 220 en sándwich apoyados sobre la casa; columnas de acero de 100 × 100 en el ensanche; techo de dos UPN 120 inclinados con correas y tensores; pisos de fenólico como diafragma. Ver D-20.
- **Casa elevada**: piso a 2,90 para habitar abajo.
- **Sistema para subir y bajar la casa** (Maxi 16/11, D-21; se combina con «Altura de la casa»: hoy, media maniobra a 2,20, elevada a 2,90):
  - La idea de Maxi: elevar la casa sin arrepentirse, con un sistema que también la pueda bajar. Se va a mover pocas veces; abajo no se construye nada alto.
  - Un HEB 160 de 3,00 por fuera de cada una de las 14 columnas, girado: un hueco mira a la madera y esconde el tornillo (rosca trapecial, colgado de la cabeza, a tracción), el otro mira hacia afuera. Reductor al pie, tuerca en una ménsula abulonada a la columna vieja, dos abrazaderas de guía por columna con perno de traba, dado de hormigón propio.
  - Las columnas viejas se cortan a ras del terreno y suben con la casa; al bajar vuelven a apoyar en sus zapatas (cubos de ~1 m³ de hormigón, 1 m de profundidad, según Maxi).
  - Los decks suben con la casa: postes fijos de acero 100 × 150 retirados del borde (1,20 en el norte, para librar un tirante), con pernos de traba; la pinza de las vigas se abre 1 cm por lado y la primera línea de tirantes se corre afuera del HEB.
  - Por qué HEB y no UPN/IPN: cuenta de viento con CIRSOC 102 (46 m/s, ~100 m² de fachada larga, 14 columnas, 1,43 de tramo libre): 560 a 810 kg por columna, 400 a 1.150 kg·m. HEB 160 en su eje flojo admite ~1.600 kg·m; UPN 180 o IPN 180 por fuera, ~300. Maxi cree que igual es imposible que falle; se quedó con el HEB porque no le molesta.
  - Sin decidir: accionamiento (motor por par con eje, o 14 motores con control), cómo sube el borde de afuera de los decks, zapatas, servicios (cloaca, agua, gas, electricidad), plataforma y escalinata con la casa arriba. No convive todavía con el ensanche sur del segundo piso.
- **Techo corredizo** sobre el deck.
- **Deck que rodea la casa** por el sur y el oeste.
- **Sin plataforma baja**.

## Dudas abiertas importantes (ver DUDAS en modelo.js)
- **D-01:** ¿el 1,20 sobre el terreno se mide al piso o a la viga?
- **D-12:** ¿el desnivel baja o sube?
- **D-04:** la estructura del deck no está decidida.
- **D-20:** la estructura del segundo piso tiene que verla un ingeniero.
- **D-21:** el sistema de elevación tiene que verlo un calculista (perfil, zapatas, media maniobra) y falta decidir el accionamiento.
- **D-17 / D-18 / D-19:** techo corredizo, deck perimetral y jardín, pendientes de medidas.
- Con el segundo piso, el caño de la salamandra cruza el frente inclinado.
- Con la casa elevada, la escalinata de la plataforma llega a la fila de pinos.

## Cómo publicar
- Armar con `bash herramientas/armar.sh mocoreta --prueba` y correr las pruebas de `herramientas/pruebas/`.
- Las pruebas de cruces sólo cubren la casa de hoy. Para las alternativas: copiar `dist/mocoreta` con `piso2` en `'A'` y correr `intersecciones.mjs` contra esa copia. Lo mismo para el sistema de elevación: `elev` en `'si'` y `altura` en `'hoy'`, `'media'` y `'alta'` (17/11: 0 cruces en las tres).
- Publicar el hub con `bash herramientas/armar-hub.sh`, en el artifact housemaker (ver `ARTIFACT.md`).
