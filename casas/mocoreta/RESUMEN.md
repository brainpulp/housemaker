# Mocoretá: resumen para arrancar una conversación nueva (21/11/2026, v0.10.41)

Leer esto en lugar de toda la conversación. El detalle de cada pieza está en `modelo.js` (constantes, `CAMBIOS`, `DUDAS`) y en `casa.js` (piezas 3D). Reglas de trabajo: `CLAUDE.md` y `docs/GUIAS-DE-DISENO.md`.

## La casa de hoy
- Casa de madera dura (columnas y vigas de virapitá, o caña fístola, u otra madera dura; no eucalipto) sobre pilotes en Ingeniero Maschwitz. Mide 24,00 × 5,50, más 1,00 en voladizo al oeste. El piso está a 1,47 del terreno.
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
  - Frente norte de vidrio inclinado 30° hacia el sur, con vidrio repartido. Cabecera este de la oficina: ventanal con el mismo repartido, la fila de abajo de madera (Maxi 21/11). Las ventanas son corredizas o proyectantes, según la opción. Las proyectantes se abren arrastrándolas hasta 95°: bisagra de piano por fuera, dos amortiguadores a gas de 1.300 N y 0,50 de carrera por dentro, correa de cierre.
  - Ensanche de 1,40 al sur en los módulos 2 y 3, con la escalera (18 alzadas, pedada 24) y un baño arriba.
  - Estructura completa, predimensionada sin calcular: en cada par, dos UPN 220 en sándwich apoyados sobre la casa; columnas de acero de 100 × 100 en el ensanche; techo de dos UPN 120 inclinados con correas y tensores; pisos de fenólico como diafragma. Ver D-20.
- **Lucarna sobre la doble altura** (Maxi 21/11, con el segundo piso): 2,00 × 2,00 en el módulo 2 (prendida con el segundo piso); variante larga de 1,95 × 3,40, vidrio DVH laminado a 10° sobre marco de madera; no puede ir más al norte porque ahí sale el caño de la salamandra.
- **Deck que rodea la casa** (decidido: de toda la vuelta, Maxi 22/11): por el sur y el oeste, o de toda la vuelta (Maxi 21/11: sur, oeste y este de 2,00; con el segundo piso rodea el ensanche por afuera).
- **Escalera de dos tramos** (Maxi 22/11, para subir y bajar la casa): dos tramos iguales alineados con la casa abajo (parecen una escalera); arriba, uno corre 2,24 al norte y el otro 1,14 al este y quedan en línea. La casa sube 1,47 (D-22).
- **Casa elevada**: piso a 2,90 para habitar abajo.
- **Sistema para subir y bajar la casa** (Maxi 16 y 17/11, D-21; va junto con «Altura de la casa»: hoy, media maniobra a 2,20, elevada a 2,90). El detalle completo, con cálculos, lista de materiales, costos y plan de obra, está en el documento de Claude «Mocoretá: sistema para subir y bajar la casa»:
  - La idea de Maxi: elevar la casa sin arrepentirse, con un sistema que también la pueda bajar. Se va a mover pocas veces; abajo no se construye nada alto.
  - COLUMNA DOBLE (Maxi 20/11, aprobada 22/11: «A it is»): por fuera de cada una de las 14 columnas, dos UPN 140 enfrentados por el alma con 4 cm de ranura, a 2 cm de la madera. Reemplazó al HEB 180 porque el gato real (SWL5, caja 212 × 155) no entraba en el hueco del HEB (152 mm). Del cabezal cuelga un husillo Tr 40 × 7 FIJO, que no gira y trabaja SIEMPRE a tracción (Maxi: «de ninguna manera confío en un husillo a compresión»), 22 cm afuera de la madera. El gato (caja reductora con la tuerca adentro; pedirlo con husillo pasante) va sentado en una ménsula que abraza la columna vieja con 3 M20 y pasa por la ranura; queda justo debajo de las vigas del deck. Perno de traba Ø 32 a doble corte. Presillas en la ranura sólo fuera del recorrido de la ménsula (Maxi 22/11 preguntó si no iban soldados): entre 0,40 y 2,25 m los dos UPN van sueltos, punto a verificar. Contra: el gato queda 29,5 cm afuera del eje de la columna vieja → ~10 kN·m a la madera durante la maniobra. Detalle de una columna para el ingeniero: casa `columna` del hub («Mocoretá · columna»). Historia: 3 cm, 17/16 cm, 7 cm con HEB 180; todo descartado.
  - Empuje lateral (intuición de Maxi, 17/11, y tenía razón): hoy las columnas están empotradas en el suelo; al cortarlas, el tramo que cuelga bajo el piso pasa a ser la palanca que une la casa con el acero, y nadie sabe cómo es la unión columna–viga (la casa tiene unos 55 años, no 15; la madera es durísima y está sana, pero las piezas están arrimadas y no se ve el empalme). Maxi prefirió agregar herrajes antes que subir los HEB a media altura de la casa. Quedó: tercera abrazadera a la altura de la viga del piso, un jabalcón de acero por columna hasta la viga de piso transversal (65 cm adentro) y una planchuela con bulones pasantes en cada nudo. Las columnas nuevas siguen en 3,00.
  - Accionamiento: los siete gatos de cada fila unidos con un eje que VIAJA CON LA CASA, inmediatamente por debajo de la línea del deck (Maxi 17/11: escondido y sin cortar el paso; piensa en la circulación). Un motorreductor de 2 HP con variador por fila, colgado junto a la columna del par 6, con cable flexible. Abajo sólo quedan las columnas dobles. Historia: primero el gato iba fijo arriba del HEB con el eje a 3 m (a la vista), después con el eje a 0,60 del suelo (cortaba el paso); Maxi rechazó las dos. Se descartó un motor por par: dos filas derechas no pueden alabear la casa. Maxi sospecha que 2 HP por fila es demasiado: son 5 HP instalados en total porque el gato rinde un 11–13 %; la alternativa es 1 HP por fila a mitad de velocidad.
  - Las columnas viejas se cortan a ras del terreno y suben con la casa; al bajar vuelven a apoyar en sus zapatas (cubos de ~1 m³ de hormigón, 1 m de profundidad, según Maxi).
  - Decks: postes fijos de acero 100 × 150 en el BORDE (Maxi 17/11: retirados sobresalían en medio del deck), de 3,00, con un husillo fijo colgado de su cabeza y un gato de 25 kN que trepa, colgado de la viga doble; eje y motor de 1/2 HP por deck, que viajan con el deck, pegados por debajo; la pinza de las vigas se abre 1 cm por lado, la primera línea de tirantes se corre afuera de la columna doble y el husillo y la última, adentro de los postes.
  - Viento (CIRSOC 102, 46 m/s): 400 a 1.150 kg·m por columna. La columna doble trabaja de canto (eje fuerte de los UPN, admite ~2.490 kg·m): con la excentricidad del husillo (13 cm, ~460 kg·m) llega al 51–65 %. Antes: HEB 180 en eje flojo, 2.170. Maxi 22/11 descartó el gato fijo con husillo girando y tuerca viajera porque el eje de fila fijo cortaría el paso (arriba cruza la casa, abajo el jardín): el gato y el eje tienen que viajar con la casa.
  - Sin decidir: zapatas, servicios (cloaca, agua, gas, electricidad), plataforma y escalinata con la casa arriba, baranda del deck. Peso de la casa estimado en 30 t, sin pesar. No convive todavía con el ensanche sur del segundo piso.

## Dudas abiertas importantes (ver DUDAS en modelo.js)
- **D-01:** ¿el 1,20 sobre el terreno se mide al piso o a la viga?
- **D-12:** ¿el desnivel baja o sube?
- **D-04:** la estructura del deck no está decidida.
- **D-20:** la estructura del segundo piso tiene que verla un ingeniero.
- **D-21:** el sistema de elevación tiene que verlo un calculista (perfil, zapatas, media maniobra) y falta decidir el accionamiento.
- **D-17 / D-18 / D-19:** techo retráctil de la terraza (con segundo piso: corre por encima de la chapa, cubierta a 1 % al sur, se guarda bajo el deck elevado a +3,60, 32 cm sobre el cuarto con escalón de 16; sale al norte por una ranura en la tapa); techo corredizo (sin parantes: vuela 3,60 agarrado sólo de la casa; el tirón del carro de atrás va por UPN a las columnas), deck perimetral y jardín, pendientes de medidas. Escalera de la terraza al deck: descanso a nivel de la terraza y un tramo pegado a la fachada hacia el oeste.
- Con la casa elevada, la escalinata de la plataforma llega a la fila de pinos.

## Cómo publicar
- Armar con `bash herramientas/armar.sh mocoreta --prueba` y correr las pruebas de `herramientas/pruebas/`.
- Las pruebas de cruces sólo cubren la casa de hoy. Para las alternativas: copiar `dist/mocoreta` con `piso2` en `'A'` y correr `intersecciones.mjs` contra esa copia. Lo mismo para el sistema de elevación: `elev` en `'si'` y `altura` en `'hoy'`, `'media'` y `'alta'` (17/11: 0 cruces en las tres).
- Publicar el hub con `bash herramientas/armar-hub.sh`, en el artifact housemaker (ver `ARTIFACT.md`).
