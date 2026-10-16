# Guías de diseño

Estas son las reglas de Maxi para proponer y modelar cualquier cosa en una casa de housemaker. Se leen antes de diseñar y se cumplen siempre.

1. **Simplificar siempre que se pueda.** Ante dos soluciones que resuelven lo mismo, gana la que tiene menos piezas, menos encuentros y menos materiales. Nada de remates, tiras, aleros o piezas que no cumplan una función.
   - Ejemplo de Carhué (15/10/2026): el dormer corrido llegaba a la pared del fondo y dejaba al costado una tira de faldón de 43 cm. Esa tira se saca y la chapa del dormer vuela hasta donde llegaba el alero.
   - Ejemplo de Carhué (15/10/2026): dos ventanas contiguas separadas por un parante pasan a ser una sola.
2. **Nada sin razón.** Cada pieza que se agrega dice para qué está: estructura, agua, luz, uso.
3. **Mecanismos realizables.** Bisagras, rieles, amortiguadores, poleas y alturas libres tienen que ser reales y construibles, con su esqueleto constructivo cuando corresponde.
4. **Opciones, no decisiones.** Las alternativas de diseño se modelan como variantes que se pueden cambiar desde la pieza (`params` + `ZONAS`), no como cambios definitivos.
5. **Sin colisiones.** Antes de publicar se revisan muebles, artefactos, techos, lucarnas, dormers y mecanismos con las pruebas. Si algo no entra, se dice; no se esconde.
6. **Exactitud.** Nada de especular. Lo supuesto se marca `conf:'supuesto'` y va a `DUDAS` como pregunta.
7. **Interfaz sobria.** Nada flotante: todo panel va en la barra derecha, con letra chica. Las alternativas aparecen junto a la pieza elegida.
8. **Lenguaje de interiores.** Seguir [ESTILO.md](ESTILO.md): bajo, cálido, madera maciza, lino, piedra oscura, negro mate, luz cálida y baja.
9. **Entender el edificio antes de dibujarlo.** Una casa no es un montón de piezas: es un camino de cargas. Antes de tocar estructura, escaleras o entrepisos se lee el plano de estructura (plantas de cada nivel, planillas de columnas, vigas y losas) y se entiende qué apoya en qué, de arriba hasta la fundación. Las medidas salen del plano; el SketchUp y las fotos confirman o corrigen, y lo que no cierra va a `DUDAS`.
   - **Nada flota.** Cada columna nace en una losa, una viga o la fundación, y su cabeza llega al fondo de una losa o viga. Cada viga apoya en sus dos puntas (muro, columna u otra viga) o cuelga de tensores. Cada muro que no arranca del terreno apoya en una losa o viga. Si el plano dibuja una columna que «nace» en un nivel (cuadrado con cruz), arranca ahí y no antes.
   - **Nada atraviesa lo que no debe.** Una columna no pasa por una escalera ni por un paso; un tensor no perfora una losa; una viga no deja menos de 2,00 de paso libre sobre una escalera o un piso.
   - **Escaleras:** las zancas apoyan con corte horizontal sobre el piso de abajo y con corte a plomo contra el borde (o la viga) del piso de arriba. La última pedada queda a ras del piso de llegada.
   - **Entrepisos de madera:** tablas clavadas directo sobre cabios de canto; los cabios van de viga a viga; las vigas empotran en el muro o cuelgan de tensores. Sin huecos entre capas.
   - **Elementos embutidos** (columnas dentro de medianeras) se modelan dentro del muro, no sobresaliendo hacia una escalera o un ambiente.
   - **Se prueba, no se mira.** Antes de publicar se corre `node herramientas/pruebas/apoyos.mjs <casa>`: revisa columnas, tensores, vigas, muros y escaleras, y los cruces entre ellos. Lo que no apoya es un error; lo que no apoya y ya está preguntado en `DUDAS` queda como pendiente.
   - Ejemplo de Arcos (16/10/2026): la columna CN4 de la escalera arrancaba en el entrepiso (+3,29) en el aire, atravesaba la E-03 y no llegaba a la losa del 2P. Según el plano de estructura nace en la losa de 1P, al lado de la escalera, y lleva el borde del 2P. El entrepiso, que parecía apoyado en un poste, cuelga de cinco tensores Ø16 de las vigas del 2P.
