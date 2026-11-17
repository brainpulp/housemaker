# Mocoretá: resumen para arrancar una conversación nueva (17/11/2026, v0.10.7)

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
  - Módulo 2: desnivel (pozo de dos alzadas) con piso de laja, sillón en C de madera con almohadones y salamandra centrada en la columna del medio del módulo (con el segundo piso, su caño sube paralelo al frente inclinado y sale por el techo).
  - Cocina en el módulo 4, con la mesa de pinotea en el 3.
  - Biblioteca contra la pared este.
- Jardín: pinos, árboles y cerco tomados de una foto y un video, a ojo. Pileta, pérgola y tanque al oeste, también a ojo.

## Hipótesis de rediseño (alternativas del menú «Variantes», no son la casa de hoy)
- **Segundo piso, planta A** (la elegida; la B, que enroca escalera y puente, queda como opción):
  - Piso alto a +3,28 sobre los módulos 1 (oficina) y 3 (dormitorio). El módulo 2 queda en doble altura, con una galería al sur.
  - Terraza sobre los módulos 4 y 5. El 6 sigue con su chapa.
  - Frente norte de vidrio inclinado 30° hacia el sur, con vidrio repartido. Las ventanas son corredizas o proyectantes, según la opción. Las proyectantes se abren arrastrándolas hasta 95°: bisagra de piano por fuera, dos amortiguadores a gas de 1.300 N y 0,50 de carrera por dentro, correa de cierre.
  - Ensanche de 1,40 al sur en los módulos 2 y 3, con la escalera (18 alzadas, pedada 24) y un baño arriba.
  - Estructura completa, predimensionada sin calcular: en cada par, dos UPN 220 en sándwich apoyados sobre la casa; columnas de acero de 100 × 100 en el ensanche; techo de dos UPN 120 inclinados con correas y tensores; pisos de fenólico como diafragma. Ver D-20.
- **Casa elevada**: piso a 2,90 para habitar abajo.
- **Sistema para subir y bajar la casa** (Maxi 16 y 17/11, D-21; va junto con «Altura de la casa»: hoy, media maniobra a 2,20, elevada a 2,90). El detalle completo, con cálculos, lista de materiales, costos y plan de obra, está en el documento de Claude «Mocoretá: sistema para subir y bajar la casa»:
  - La idea de Maxi: elevar la casa sin arrepentirse, con un sistema que también la pueda bajar. Se va a mover pocas veces; abajo no se construye nada alto.
  - Un HEB 160 de 3,00 por fuera de cada una de las 14 columnas, a 17 cm y con un ala de frente a la madera (de canto contra el viento de la fachada larga). De su cabeza cuelga un husillo Tr 40 × 7 FIJO (no gira), escondido entre la columna vieja y la nueva. Un gato de husillo de 50 kN de tuerca giratoria (0,25 mm por vuelta), abulonado a la columna vieja justo debajo de las vigas del deck, trepa por él: el gato viaja con la casa. Dos abrazaderas de guía por columna con perno de traba; dado de hormigón propio.
  - Accionamiento: los siete gatos de cada fila unidos con un eje que VIAJA CON LA CASA, inmediatamente por debajo de la línea del deck (Maxi 17/11: escondido y sin cortar el paso; piensa en la circulación). Un motorreductor de 2 HP con variador por fila, colgado junto a la columna del par 6, con cable flexible. Abajo sólo quedan los HEB. Historia: primero el gato iba fijo arriba del HEB con el eje a 3 m (a la vista), después con el eje a 0,60 del suelo (cortaba el paso); Maxi rechazó las dos. Se descartó un motor por par: dos filas derechas no pueden alabear la casa. Maxi sospecha que 2 HP por fila es demasiado: son 5 HP instalados en total porque el gato rinde un 11–13 %; la alternativa es 1 HP por fila a mitad de velocidad.
  - Las columnas viejas se cortan a ras del terreno y suben con la casa; al bajar vuelven a apoyar en sus zapatas (cubos de ~1 m³ de hormigón, 1 m de profundidad, según Maxi).
  - Decks: postes fijos de acero 100 × 150 en el BORDE (Maxi 17/11: retirados sobresalían en medio del deck), de 3,00, con un husillo fijo colgado de su cabeza y un gato de 25 kN que trepa, colgado de la viga doble; eje y motor de 1/2 HP por deck, que viajan con el deck, pegados por debajo; la pinza de las vigas se abre 1 cm por lado, la primera línea de tirantes se corre afuera del HEB y la última, adentro de los postes.
  - Por qué HEB y no UPN/IPN: cuenta de viento con CIRSOC 102 (46 m/s, ~100 m² de fachada larga, 14 columnas, 1,43 de tramo libre): 560 a 810 kg por columna, 400 a 1.150 kg·m. HEB 160 en su eje flojo admite ~1.600 kg·m; UPN 180 o IPN 180 por fuera, ~300. Maxi cree que igual es imposible que falle; aceptó el HEB.
  - Sin decidir: zapatas, servicios (cloaca, agua, gas, electricidad), plataforma y escalinata con la casa arriba, baranda del deck. Peso de la casa estimado en 30 t, sin pesar. No convive todavía con el ensanche sur del segundo piso.

## Dudas abiertas importantes (ver DUDAS en modelo.js)
- **D-01:** ¿el 1,20 sobre el terreno se mide al piso o a la viga?
- **D-12:** ¿el desnivel baja o sube?
- **D-04:** la estructura del deck no está decidida.
- **D-20:** la estructura del segundo piso tiene que verla un ingeniero.
- **D-21:** el sistema de elevación tiene que verlo un calculista (perfil, zapatas, media maniobra) y falta decidir el accionamiento.
- **D-17 / D-18 / D-19:** techo corredizo, deck perimetral y jardín, pendientes de medidas.
- Con la casa elevada, la escalinata de la plataforma llega a la fila de pinos.

## Cómo publicar
- Armar con `bash herramientas/armar.sh mocoreta --prueba` y correr las pruebas de `herramientas/pruebas/`.
- Las pruebas de cruces sólo cubren la casa de hoy. Para las alternativas: copiar `dist/mocoreta` con `piso2` en `'A'` y correr `intersecciones.mjs` contra esa copia. Lo mismo para el sistema de elevación: `elev` en `'si'` y `altura` en `'hoy'`, `'media'` y `'alta'` (17/11: 0 cruces en las tres).
- Publicar el hub con `bash herramientas/armar-hub.sh`, en el artifact housemaker (ver `ARTIFACT.md`).
