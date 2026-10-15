/* Arcos 4264 (Núñez, CABA) — modelo de datos de la casa. Única fuente de verdad: el visor dibuja todo a partir de esto.
   Unidades: cm. x: 0 en el eje medianero izquierdo mirando desde Arcos, crece hacia la derecha (medianera derecha en 865).
   y: 0 en el fondo del lote, crece hacia Arcos; la línea municipal está en y 4516 (lote de 45,16 según el croquis).
   z: sobre el ±0,00 del plano (vereda). En el visor 3D: X = x, Y = z, Z = y.
   v0.2: lo que trae tu SketchUp (Arcos_55.dae, subido 58 cm) manda; lo que no trae sale del plano de regularización (hoja 01/04, 1:100).
   conf 'modelo' = del SketchUp; 'plano' = del plano; 'estimado' = interpretado; 'supuesto' = lo puse yo, a confirmar. */

export const META = {"nombre":"Arcos 4264","version":"0.5.0","fecha":"2026-10-15","resumen":"Casa de Arcos 4264 (Núñez, CABA) armada de tu SketchUp (Arcos_55.dae); lo que el SketchUp no trae (medianeras, tabiques, subsuelo) sale del plano de regularización.","ejes":"Costados (convención de Maxi, 15/10): fachada E, jardín O, medianera S (x 0, a la izquierda mirando desde Arcos) y medianera N (x 865). x: 0 en el eje medianero S, crece hacia el N. y: 0 en el fondo del lote, hacia Arcos (L.M. en y 45,16). z: sobre el ±0,00 del plano (vereda).","planta":{"vb":{"x":-400,"y":2000,"w":1700,"h":2700},"casa":{"cx":432,"cy":3400,"w":1300,"h":2400},"lote":{"cx":432,"cy":2258,"w":1300,"h":4900},"ejesExt":{"x0":-260,"x1":1100,"y0":-100,"y1":4700},"ghost":"PB","nivelesOrden":["SS","PB","EP","P1","P2","TZ","TE"],"spec":"casa <b>8,65 × 15,78</b> · lote <b>8,65 × 45,16</b> · 5 niveles"}};

export const NIVELES = {"SS":{"nombre":"Subsuelo","z":-198,"conf":"plano"},"PB":{"nombre":"Planta baja","z":72,"conf":"modelo","nota":"El estar hundido, a +0,19."},"EP":{"nombre":"Entrepiso","z":339,"conf":"modelo","nota":"Escritorio."},"P1":{"nombre":"Primer piso","z":409,"conf":"modelo"},"P2":{"nombre":"Segundo piso","z":607,"conf":"modelo","nota":"Dormitorio O y baño de 2P, bajo el techo de chapa."},"TZ":{"nombre":"Terraza","z":734,"conf":"modelo","nota":"Con el vestidor al mismo nivel."},"TE":{"nombre":"Techos","z":0}};

/* Ejes: 'v' = vertical en planta (x fijo), 'h' = horizontal (y fijo). */
export const EJES = [
  {"id":"1","dir":"v","pos":0,"nota":"Eje medianero S (a la izquierda mirando desde Arcos)"},
  {"id":"2","dir":"v","pos":865,"nota":"Eje medianero N · frente 8,65"},
  {"id":"A","dir":"h","pos":4516,"nota":"Línea municipal (Arcos)"},
  {"id":"B","dir":"h","pos":4216,"nota":"Retiro de frente obligatorio, 3,00"},
  {"id":"C","dir":"h","pos":3909,"nota":"Fachada E (cara exterior), 6,07 de la L.M."},
  {"id":"D","dir":"h","pos":3084,"nota":"Fin del bloque del frente · arranque del bloque del fondo"},
  {"id":"E","dir":"h","pos":2351,"nota":"Contrafrente O (ventanal al jardín)"},
  {"id":"F","dir":"h","pos":600,"nota":"Retiro de fondo obligatorio, 6,00"},
  {"id":"G","dir":"h","pos":0,"nota":"Fondo del lote (45,16)"},
];

/* Muros: eje a→b, espesor e. z0 = base (si falta, el nivel); top = tope absoluto (número, o [en a, en b] si es inclinado). niveles = otros niveles donde se ve en la planta. */
export const MUROS = [
  {"id":"M-01","nivel":"PB","a":[0,3909],"b":[0,3085],"e":30,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"plano","nombre":"Medianera S, bloque del frente","z0":0,"top":914,"niveles":["PB","P1","TZ"],"nota":"Eje medianero, 0,30. Arriba de la terraza sigue como «muro H 1,80 E 0,15» (dibujado de 0,30 hasta +9,37)."},
  {"id":"M-02","nivel":"PB","a":[865,3909],"b":[865,3085],"e":30,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"plano","nombre":"Medianera N, bloque del frente","z0":-198,"top":914,"niveles":["SS","PB","P1","TZ"],"nota":"Del lado del subsuelo baja hasta −1,98. Arriba de la terraza, 1,80."},
  {"id":"M-03","nivel":"PB","a":[0,3085],"b":[0,2351],"e":30,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"plano","nombre":"Medianera S, bloque del fondo","z0":0,"top":[1012.4,933.1],"niveles":["PB","EP","P2"],"nota":"Hasta el techo de chapa (12 %)."},
  {"id":"M-04","nivel":"PB","a":[865,3085],"b":[865,2351],"e":30,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"plano","nombre":"Medianera N, bloque del fondo","z0":-198,"top":[1012.4,933.1],"niveles":["SS","PB","EP","P1","P2"],"nota":"Del lado de la escalera baja hasta el subsuelo (−1,98) hasta yd 16,48."},
  {"id":"M-05","nivel":"PB","a":[0,4516],"b":[0,3909],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Medianera S, jardín del frente","z0":0,"top":200,"nota":"«Muro H 2,00 E 0,30»."},
  {"id":"M-06","nivel":"PB","a":[865,4516],"b":[865,3909],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Medianera N, jardín del frente","z0":-198,"top":200,"niveles":["SS","PB"],"nota":"«Muro H 2,00 E 0,30». Contiene la escalera descubierta al subsuelo."},
  {"id":"M-07","nivel":"PB","a":[0,2351],"b":[0,15],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Medianera S, jardín del fondo","z0":57,"top":357,"nota":"«Muro H 3,00 E 0,30». El plano dibuja el fondo acortado; el largo sale del croquis (45,16)."},
  {"id":"M-08","nivel":"PB","a":[865,2351],"b":[865,15],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Medianera N, jardín del fondo","z0":57,"top":357,"nota":"«Muro H 3,00 E 0,30»."},
  {"id":"M-09","nivel":"PB","a":[-15,0],"b":[880,0],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Muro del fondo del lote","z0":57,"top":357,"nota":"«Muro H 3,00 E 0,30». Retiro de fondo obligatorio: 6,00."},
  {"id":"M-11","nivel":"PB","a":[12,3901.5],"b":[888,3901.5],"e":15,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"modelo","nombre":"Fachada E","z0":41,"top":742,"niveles":["PB","P1","TZ"],"lbl":"abajo","nota":"SketchUp: cara a 6,07 de la L.M. (el plano la pone a 6,29), de +0,41 a +7,42; arriba sigue la pantalla de listones de la terraza."},
  {"id":"M-12","nivel":"PB","a":[15,2351],"b":[850,2351],"e":12,"tipo":"vidrio","carga":false,"estado":"existente","conf":"modelo","nombre":"Ventanal del contrafrente O","z0":72,"top":914,"niveles":["PB","EP","P2"],"nota":"SketchUp: tres filas de paños repartidos (+0,81 a +4,92, +5,06 a +6,15 y +6,18 a +9,14). La carpintería con todos sus paños está en «Detalle del SketchUp».","modulos":4,"travesanos":[492,615]},
  {"id":"M-20","nivel":"SS","a":[312.5,3857],"b":[312.5,3068],"e":30,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"plano","nombre":"Subsuelo: muro S","top":54},
  {"id":"M-21","nivel":"SS","a":[297.6,3083],"b":[760,3083],"e":30,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"plano","nombre":"Subsuelo: muro del fondo","top":54},
  {"id":"M-22","nivel":"SS","a":[297.6,3872],"b":[850,3872],"e":30,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"plano","nombre":"Subsuelo: muro del frente","top":54,"lbl":"abajo"},
  {"id":"M-23","nivel":"SS","a":[745,3068],"b":[745,2883],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Subsuelo: muro de la escalera","top":54},
  {"id":"M-24","nivel":"SS","a":[729.9,2883],"b":[850,2883],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Subsuelo: muro al pie de la escalera","top":54},
  {"id":"M-25","nivel":"SS","a":[745,4216],"b":[745,3887],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"supuesto","nombre":"Muro de contención de la escalera descubierta","z0":-198,"top":0,"nota":"La planta dibuja la escalera entre 7,45 y 8,50; el muro que la contiene del lado del jardín no está acotado."},
  {"id":"M-30","nivel":"PB","a":[15,3451.6],"b":[205,3451.6],"e":10,"tipo":"tabique","carga":false,"estado":"existente","conf":"estimado","nombre":"Toilette: pared al comedor","top":302,"nota":"Video 4838 (s7–s10): la caja del baño y el depósito termina en un borde a ~2,30 sobre el piso, no llega a la losa."},
  {"id":"M-31","nivel":"PB","a":[15,3281.5],"b":[205,3281.5],"e":10,"tipo":"tabique","carga":false,"estado":"existente","conf":"estimado","nombre":"Toilette / depósito","top":302,"nota":"Video 4838 (s7–s10): la caja del baño y el depósito termina en un borde a ~2,30 sobre el piso, no llega a la losa."},
  {"id":"M-32","nivel":"PB","a":[15,3071.5],"b":[205,3071.5],"e":10,"tipo":"tabique","carga":false,"estado":"existente","conf":"estimado","nombre":"Depósito: pared a la cocina","top":302,"nota":"Video 4838 (s7–s10): la caja termina a ~2,30 sobre el piso."},
  {"id":"M-33","nivel":"PB","a":[200,3457],"b":[200,3067],"e":10,"tipo":"tabique","carga":false,"estado":"existente","conf":"estimado","nombre":"Toilette y depósito: pared al comedor","top":302,"nota":"Video 4838 (s7–s10): la caja del baño y el depósito termina en un borde a ~2,30 sobre el piso, no llega a la losa."},
  {"id":"M-40","nivel":"EP","a":[15,3084],"b":[435,3084],"e":10,"tipo":"tabique","carga":false,"estado":"existente","conf":"plano","nombre":"Baño de 1P: pared al entrepiso","top":716,"niveles":["EP","P1"],"nota":"Divide el baño de 1P del entrepiso: arranca en el entrepiso."},
  {"id":"M-41","nivel":"P1","a":[426.5,3894],"b":[426.5,3079],"e":15,"tipo":"tabique","carga":false,"estado":"existente","conf":"plano","nombre":"Cuarto SE y baño de 1P: pared al palier","top":716},
  {"id":"M-42","nivel":"P1","a":[434,3452],"b":[850,3452],"e":12,"tipo":"tabique","carga":false,"estado":"existente","conf":"plano","nombre":"Cuarto NE: pared al palier","top":716},
  {"id":"M-43","nivel":"P1","a":[15,3288],"b":[325,3288],"e":11,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Cuarto SE / baño de 1P","top":716,"nota":"Dibujado como «muro sin permiso». Entre 3,25 y 4,19 queda un paso sin pared: ¿es así?"},
  {"id":"M-44","nivel":"P1","a":[412,3996],"b":[822,3996],"e":6,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"modelo","nombre":"Balcón: frente","z0":409,"top":471,"lbl":"abajo","nota":"SketchUp: 4,10 × 0,90, con frente de +3,83 a +4,71 (0,62 sobre el piso del balcón). El plano pide baranda de 1,00 (D-04)."},
  {"id":"M-45","nivel":"P1","a":[819,3993],"b":[819,3909],"e":6,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"modelo","nombre":"Balcón: costado N","z0":409,"top":471},
  {"id":"M-46","nivel":"P1","a":[415,3993],"b":[415,3909],"e":6,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"modelo","nombre":"Balcón: costado S","z0":409,"top":471},
  {"id":"M-50","nivel":"P2","a":[15,3085],"b":[850,3085],"e":12,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"modelo","nombre":"Bloque del fondo: frente a la terraza","top":1012.4,"niveles":["P2","TZ"],"nota":"SketchUp: muro bajo de +6,07 a +7,42 del lado del dormitorio y vidriado arriba; sube hasta el techo."},
  {"id":"M-51","nivel":"P2","a":[650,3069],"b":[650,2351],"e":15,"tipo":"tabique","carga":false,"estado":"existente","conf":"plano","nombre":"Dormitorio O: pared a la escalera y al baño","top":[995.6,918.1]},
  {"id":"M-52","nivel":"P2","a":[658,2711.5],"b":[850,2711.5],"e":15,"tipo":"tabique","carga":false,"estado":"existente","conf":"plano","nombre":"Baño de 2P: pared a la escalera","top":957.0},
  {"id":"M-53","nivel":"TZ","a":[213,3653],"b":[213,3091],"e":20,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"modelo","nombre":"Vestidor: pared a la terraza","z0":734,"top":1092,"nota":"SketchUp: caja de 2,26 × 5,62 hasta +10,92; arriba, el tanque de agua."},
  {"id":"M-54","nivel":"TZ","a":[15,3643],"b":[223,3643],"e":20,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"modelo","nombre":"Vestidor: frente","z0":734,"top":1092},
  {"id":"M-55","nivel":"TZ","a":[0,3653],"b":[0,3091],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"modelo","nombre":"Vestidor: medianera","z0":914,"top":1092,"nota":"La medianera sube con la caja del vestidor."},
];

/* Aberturas: en el muro `muro`, a `d` cm del punto a, ancho w, alto h, antepecho s (cm sobre la base del muro). */
export const ABERTURAS = [
  {"id":"P-03","muro":"M-11","d":36,"w":280,"h":212,"s":35,"tipo":"puerta","estado":"existente","conf":"modelo","nombre":"Entrada (puerta y paño fijo)","nota":"SketchUp: 2,80 de ancho, de +0,76 a +2,88."},
  {"id":"V-01","muro":"M-11","d":552,"w":188,"h":114,"s":139,"tipo":"ventana","estado":"existente","conf":"modelo","nombre":"Ventana del comedor","nota":"SketchUp: de +1,80 a +2,94."},
  {"id":"V-02","muro":"M-11","d":118,"w":128,"h":102,"s":463,"tipo":"ventana","estado":"existente","conf":"modelo","nombre":"Ventana del cuarto SE","nota":"SketchUp: de +5,04 a +6,06."},
  {"id":"V-03","muro":"M-11","d":552,"w":176,"h":188,"s":377,"tipo":"puerta","estado":"existente","conf":"modelo","nombre":"Puerta balcón del cuarto NE","nota":"SketchUp: de +4,18 a +6,06, sale al balcón."},
  {"id":"V-04","muro":"M-22","d":132.5,"w":156.5,"h":90,"s":100,"tipo":"ventana","estado":"existente","conf":"supuesto","nombre":"Ventana del subsuelo al frente","nota":"La planta la marca (4,30 a 5,87) pero no hay alto en ningún corte: antepecho 1,00 y alto 0,90 supuestos. Da a tierra salvo que el frente esté hundido como en tu SketchUp (D-01, D-05)."},
  {"id":"P-04","muro":"M-22","d":464.4,"w":84,"h":200,"s":0,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta del subsuelo a la escalera descubierta","nota":"0,85. El corte A-A la muestra de −1,98 a ~0,00."},
  {"id":"P-05","muro":"M-30","d":90,"w":90,"h":200,"s":0,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta del toilette"},
  {"id":"P-06","muro":"M-32","d":90,"w":90,"h":200,"s":0,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta del depósito"},
  {"id":"V-07","muro":"M-40","d":95,"w":220,"h":120,"s":170,"tipo":"ventana","estado":"existente","conf":"estimado","nombre":"Ventana interior del baño de 1P al entrepiso","nota":"Video 4839 (s34–s35): desde el baño se ve el entrepiso y el ventanal. Posición y alto estimados del video."},
  {"id":"P-07","muro":"M-41","d":451,"w":80,"h":200,"s":0,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta del cuarto SE desde el palier"},
  {"id":"P-14","muro":"M-41","d":118,"w":200,"h":210,"s":0,"tipo":"vano","estado":"existente","conf":"estimado","nombre":"Arcada entre los cuartos SE y NE","nota":"Maxi (15/10): otra arcada, como la de M-42. 2,00 de ancho y 2,10 de alto, centrada en el tramo de M-41 entre los dos cuartos: ancho y posición supuestos."},
  {"id":"P-08","muro":"M-41","d":712,"w":80,"h":200,"s":0,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta del baño de 1P","nota":"El hueco va de 13,30 a 14,18; la hoja de ~0,80."},
  {"id":"P-09","muro":"M-42","d":107,"w":200,"h":210,"s":0,"tipo":"vano","estado":"existente","conf":"estimado","nombre":"Vano para puerta granero del cuarto NE","nota":"Maxi (15/10): vano de 2,00 para puerta granero, en lugar de la puerta de 0,89 del plano. Fotos F39-12 a F39-22: sin hoja todavía, con el riel arriba. Posición estimada de las fotos, centrado con la ventana del balcón; quedan 1,07 y 1,09 de pared a los costados. Alto 2,10 supuesto."},
  {"id":"P-10","muro":"M-50","d":85,"w":89,"h":200,"s":127,"tipo":"puerta","estado":"existente","conf":"modelo","nombre":"Puerta del vestidor","nota":"Arriba de la escalerita E-06."},
  {"id":"V-05","muro":"M-50","d":184,"w":426,"h":214,"s":135,"tipo":"ventana","estado":"existente","conf":"modelo","nombre":"Ventana del dormitorio O a la terraza","nota":"SketchUp: de +7,42 a +9,56, sobre el muro bajo."},
  {"id":"P-11","muro":"M-50","d":625,"w":192,"h":221,"s":126,"tipo":"puerta","estado":"existente","conf":"modelo","nombre":"Puerta y paño a la terraza","nota":"SketchUp: de +7,33 a +9,54, al final de la E-05."},
  {"id":"P-12","muro":"M-51","d":245,"w":90,"h":200,"s":0,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta del dormitorio O"},
  {"id":"P-13","muro":"M-51","d":391,"w":90,"h":200,"s":0,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta del baño de 2P"},
];

/* Locales: polígono (cm), nivel, nombre. El id guarda el código B1…B14 del balance de superficies. */
export const LOCALES = [
  {"id":"L-B1","nivel":"SS","nombre":"Sótano","poly":[[327.5,3857],[850,3857],[850,3098],[327.5,3098]],"conf":"plano","nota":"Balance: 7,59 × 5,22 = 39,61 m², a −1,98."},
  {"id":"L-B4","nivel":"PB","nombre":"Living","poly":[[15,3894],[850,3894],[850,3067],[205,3067],[205,3457],[15,3457]],"conf":"estimado","nota":"Planta abierta con la cocina y el estar (112 m² entre los tres según el balance). Los límites entre ellos son míos."},
  {"id":"L-B3","nivel":"PB","nombre":"Cocina","poly":[[15,3067],[315,3067],[315,2351],[15,2351]],"conf":"estimado","nota":"Mesada contra la medianera S e isla de 0,80 × 2,00 (planta)."},
  {"id":"L-B2","nivel":"PB","nombre":"Estar hundido","poly":[[315,3067],[760,3067],[760,2865],[850,2865],[850,2351],[315,2351]],"conf":"estimado","nota":"Con el estar hundido (LO-03) y doble altura hasta la losa de 2P."},
  {"id":"L-B5","nivel":"PB","nombre":"Toilette","poly":[[15,3446.5],[195,3446.5],[195,3286.5],[15,3286.5]],"conf":"plano","nota":"Balance: 1,80 × 1,60."},
  {"id":"L-B6","nivel":"PB","nombre":"Depósito","poly":[[15,3276.5],[195,3276.5],[195,3076.5],[15,3076.5]],"conf":"plano","nota":"Balance: 1,80 × 2,00."},
  {"id":"L-B7","nivel":"EP","nombre":"Escritorio (entrepiso)","poly":[[15,3079],[659,3079],[659,2858],[315,2858],[315,2366],[15,2366]],"conf":"estimado","nota":"En L: franja de 2,50 junto a la escalera (Maxi) y franja de 3,00 sobre la cocina hasta el ventanal (video y plano), a +3,39."},
  {"id":"L-B8","nivel":"P1","nombre":"Baño de 1P","poly":[[15,3283],[419,3283],[419,3089],[15,3089]],"conf":"plano","nota":"Balance: 4,08 × 1,89."},
  {"id":"L-B9","nivel":"P1","nombre":"Palier de 1P","poly":[[434,3446],[850,3446],[850,3089],[434,3089]],"conf":"plano","nota":"Balance: 4,13 × 3,56."},
  {"id":"L-B10","nivel":"P1","nombre":"Cuarto SE","poly":[[15,3894],[419,3894],[419,3294],[15,3294]],"conf":"plano","nota":"Balance: 4,08 × 5,69 (con el placard)."},
  {"id":"L-B11","nivel":"P1","nombre":"Cuarto NE","poly":[[434,3894],[850,3894],[850,3458],[434,3458]],"conf":"plano","nota":"Balance: 4,13 × 4,02."},
  {"id":"L-BAL","nivel":"P1","nombre":"Balcón E","poly":[[418,3993],[816,3993],[816,3909],[418,3909]],"conf":"modelo"},
  {"id":"L-B12","nivel":"P2","nombre":"Baño de 2P","poly":[[658,2704],[850,2704],[850,2351],[658,2351]],"conf":"plano","nota":"Balance: 1,92 × 3,15."},
  {"id":"L-B13","nivel":"P2","nombre":"Dormitorio O (2P)","poly":[[15,3079],[643,3079],[643,2351],[15,2351]],"conf":"modelo","nota":"A +6,07 (SketchUp)."},
  {"id":"L-B14","nivel":"TZ","nombre":"Vestidor","poly":[[15,3633],[203,3633],[203,3091],[15,3091]],"conf":"modelo","nota":"SketchUp: a +7,34, al nivel de la terraza."},
  {"id":"L-TZ","nivel":"TZ","nombre":"Terraza","poly":[[223,3894],[850,3894],[850,3091],[223,3091]],"conf":"modelo","nota":"A +7,34 (SketchUp), con pantalla de listones y pérgola sobre la escalera (ver «Detalle del SketchUp»)."},
];

/* Losas: z = cara superior, e = espesor, huecos = polígonos. */
export const LOSAS = [
  {"id":"LO-01","nivel":"SS","nombre":"Piso del subsuelo","z":-198,"e":12,"poly":[[327.5,3857],[850,3857],[850,2868],[760,2868],[760,3068],[327.5,3068]],"conf":"plano"},
  {"id":"LO-02","nivel":"PB","nombre":"Losa de planta baja","z":72,"e":15,"poly":[[15,3887],[850,3887],[850,3193],[760,3193],[760,2872],[386,2872],[386,2419],[831,2419],[831,2865],[850,2865],[850,2331],[15,2331]],"conf":"modelo","nota":"SketchUp: de 6,29 a 21,85 de la L.M., con la escalera al subsuelo y el estar hundido recortados del contorno. 15 de espesor, como el plano (Maxi, 15/10). Terminación: el piso de tablas cubre toda la planta baja (nota de Maxi en SU-11, 15/10)."},
  {"id":"LO-03","nivel":"PB","nombre":"Piso del estar hundido","z":19,"e":10,"poly":[[386,2872],[831,2872],[831,2419],[386,2419]],"conf":"modelo","nota":"SketchUp: 4,45 × 4,53 a +0,19 (0,53 más bajo). El plano lo da de 3,80 × 3,50 a +0,22."},
  {"id":"LO-04","nivel":"EP","nombre":"Entrepiso (escritorio)","z":339,"e":18,"poly":[[15,3108],[659,3108],[659,2858],[15,2858]],"conf":"medido","nota":"Maxi (nota 15/10): 2,50 de fondo, no 6,92. Ancho del SketchUp (de la medianera S a la escalera, 6,31), a +3,39. Lo pegué al frente del bloque, junto a la escalera; detrás queda la doble altura sobre el estar hundido."},
  {"id":"LO-13","nivel":"EP","nombre":"Entrepiso sobre la cocina","z":339,"e":20,"poly":[[15,2858],[315,2858],[315,2366],[15,2366]],"conf":"estimado","nota":"Video 4838 (s7, s12–s14): tirantes de madera a la vista sobre la cocina hasta el ventanal, con un poste de madera oscura en la punta. El plano lo dibuja igual (3,00 de ancho, escritorio)."},
  {"id":"LO-11","nivel":"EP","nombre":"Descanso de la escalera y paso al entrepiso","z":339,"e":15,"poly":[[659,3009],[738,3009],[738,2825],[659,2825]],"conf":"modelo","nota":"Parte del entrepiso junto a la E-02, entre el escritorio y la E-03. El borde queda a 0,20 de la zanca ZE, como en el diseño de la escalera (11/10)."},
  {"id":"LO-12","nivel":"EP","nombre":"Giro de la E-02: compensadas C1 y C2","z":321.2,"e":5,"poly":[[758,2917],[850,2917],[850,2825],[758,2825]],"conf":"estimado","nota":"Ya no es un descanso: dos compensadas de 45° (C1 a +2,99 y C2 a +3,21) cortadas de un panel de tablas diagonales, y la tabla de llegada TL al entrepiso. Diseño de la conversación «Diseño escalera con descanso» (11/10); en el 3D está pieza por pieza (E2-…)."},
  {"id":"LO-05","nivel":"P1","nombre":"Losa del primer piso","z":409,"e":18,"poly":[[15,3887],[850,3887],[850,3084],[15,3084]],"conf":"modelo"},
  {"id":"LO-06","nivel":"P1","nombre":"Balcón","z":409,"e":26,"poly":[[412,3999],[822,3999],[822,3909],[412,3909]],"conf":"modelo","nota":"SketchUp: 4,10 × 0,90."},
  {"id":"LO-07","nivel":"P2","nombre":"Losa del segundo piso","z":607,"e":18,"poly":[[15,3084],[850,3084],[850,2351],[15,2351]],"huecos":[[[760,3084],[850,3084],[850,2834],[760,2834]]],"conf":"modelo"},
  {"id":"LO-08","nivel":"TZ","nombre":"Losa de la terraza","z":734,"e":32,"poly":[[15,3894],[850,3894],[850,3091],[15,3091]],"huecos":[[[246,3233],[346,3233],[346,3133],[246,3133]],[[542,3327],[644,3327],[644,3227],[542,3227]]],"conf":"modelo","nota":"SketchUp: +7,34. Las claraboyas siguen la posición del plano."},
  {"id":"LO-10","nivel":"PB","nombre":"Galería del contrafrente","z":72,"e":15,"poly":[[15,2331],[850,2331],[850,2266],[15,2266]],"conf":"plano","nota":"«0,90» más allá de la carpintería, a +0,72."},
];

export const CLARABOYAS = [
  {"id":"CL-1","nivel":"TZ","nombre":"Claraboya sobre el baño de 1P","poly":[[246,3233],[346,3233],[346,3133],[246,3133]],"z":759,"conf":"plano","nota":"1,00 × 1,00, del plano."},
  {"id":"CL-2","nivel":"TZ","nombre":"Claraboya sobre el palier de 1P","poly":[[542,3327],[644,3327],[644,3227],[542,3227]],"z":759,"conf":"plano","nota":"1,00 × 1,00, del plano."},
];

export const ESTRUCTURA = [
  {"id":"C-01","tipo":"columna","nivel":"PB","pos":[406,3447],"sec":"20×20","z":[72,389],"conf":"plano","estado":"existente","nombre":"Columna del comedor","nota":"Planta baja, en la línea de la viga (yd 10,69)."},
  {"id":"C-02","tipo":"columna","nivel":"PB","pos":[25,2567],"sec":"20×20","z":[72,589],"conf":"plano","estado":"existente","nombre":"Pilastra S del estar"},
  {"id":"C-03","tipo":"columna","nivel":"PB","pos":[838.5,2567],"sec":"20×20","z":[72,589],"conf":"plano","estado":"existente","nombre":"Pilastra N del estar"},
  {"id":"C-04","tipo":"columna","nivel":"P1","pos":[678,3079],"sec":"20×20","z":[339,589],"conf":"plano","estado":"existente","nombre":"Columna de la escalera","nota":"En el borde del palier de 1P."},
  {"id":"C-05","tipo":"columna","nivel":"PB","pos":[300,2436],"sec":"30×30","z":[72,319],"conf":"estimado","estado":"existente","nombre":"Poste de madera oscura","nota":"Video 4838 (s12–s14): poste de madera maciza oscura bajo la punta del entrepiso, cerca del ventanal. Posición estimada del video."},
  {"id":"VG-1","tipo":"viga","nivel":"PB","a":[15,3447],"b":[850,3447],"sec":"20×40","z":389,"conf":"supuesto","estado":"existente","nombre":"Viga del comedor","nota":"La planta la marca con línea de trazos; la sección es supuesta."},
];

/* Escaleras rectas: x = [izq, der]; y = [primera alzada, última alzada]; z = [salida, llegada]; n = alzadas. */
export const ESCALERAS = [
  {"id":"E-01","nivel":"SS","x":[763,850],"y":[3255,2865],"z":[-198,72],"n":15,"nombre":"Escalera del subsuelo a planta baja","conf":"modelo","estado":"existente","poly":[[763,3255],[850,3255],[850,2865],[763,2865]],"sube":"-y","nota":"SketchUp hasta −1,19; el tramo de abajo y el subsuelo no están en el SketchUp (plano). 15 alzadas de 18,0 y pedadas de 27,9,"},
  {"id":"E-02","nivel":"PB","x":[758,850],"y":[3205,2917],"z":[72,285.6],"n":12,"nombre":"Escalera de planta baja al entrepiso","conf":"estimado","estado":"existente","poly":[[758,3205],[850,3205],[850,2917],[758,2917]],"sube":"-y","nota":"Tramo recto de 12 pedadas abiertas de 24 entre zancas; sigue con el giro LO-12 (C1, C2) y la llegada al entrepiso: 15 alzadas de 17,8 en total. 12 alzadas de 17,8 y pedadas de 26,2,"},
  {"id":"E-03","nivel":"EP","x":[653,738],"y":[3009,3084],"z":[339,409],"n":4,"nombre":"Escalera del entrepiso al primer piso","conf":"modelo","estado":"existente","poly":[[653,3084],[738,3084],[738,3009],[653,3009]],"sube":"+y","nota":"SketchUp: sube hacia el frente, al palier de 1P. 4 alzadas de 17,5 y pedadas de 25,0,"},
  {"id":"E-04","nivel":"P1","x":[760,850],"y":[3084,2834],"z":[409,607],"n":11,"nombre":"Escalera del primer piso al segundo","conf":"modelo","estado":"existente","poly":[[760,3084],[850,3084],[850,2834],[760,2834]],"sube":"-y","nota":"SketchUp: sube hacia el fondo, sobre la E-02. 11 alzadas de 18,0 y pedadas de 25,0,"},
  {"id":"E-05","nivel":"P2","x":[646,736],"y":[2909,3084],"z":[607,734],"n":8,"nombre":"Escalera del segundo piso a la terraza","conf":"modelo","estado":"existente","poly":[[646,3084],[736,3084],[736,2909],[646,2909]],"sube":"+y","nota":"SketchUp: sube hacia el frente hasta la puerta P-11. 8 alzadas de 15,9 y pedadas de 25,0,"},
  {"id":"E-06","nivel":"P2","x":[100,189],"y":[2972,3070],"z":[607,734],"n":7,"nombre":"Escalerita al vestidor","conf":"modelo","estado":"existente","poly":[[100,3070],[189,3070],[189,2972],[100,2972]],"sube":"+y","nota":"SketchUp: del dormitorio a la puerta del vestidor; empinada. 7 alzadas de 18,1 y pedadas de 16,3,"},
  {"id":"E-07","nivel":"PB","x":[760,850],"y":[4216,3978.2],"z":[0,-198],"n":10,"nombre":"Escalera descubierta al subsuelo","conf":"plano","estado":"existente","poly":[[760,4216],[850,4216],[850,3978.2],[760,3978.2]],"sube":"-y","exterior":true,"nota":"Baja desde el jardín del frente (±0,00) a la puerta del subsuelo. Planta: 9 pedadas de 3,00 a 5,38. 10 alzadas de 19,8 y pedadas de 26,4,"},
];

export const BARANDAS = [
  {"id":"BA-1","nivel":"EP","nombre":"Baranda del entrepiso sobre el vacío","pts":[[659,2825],[659,2858],[315,2858],[315,2366]],"z":339,"h":100,"tipo":"madera","conf":"estimado","nota":"Baranda de madera sobre la doble altura (video 4839 s1–s5)."},
  {"id":"BA-2","nivel":"PB","nombre":"Baranda de la escalera E-02 (R1 y R4)","pts":[[748,3205],[748,2917],[850,2820],[659,2820]],"z":72,"h":90,"tipo":"madera","conf":"estimado","nota":"Madera + cables de acero, del diseño del 11/10: R1 a lo largo del tramo y R4 en el fondo del giro, hasta la BA-1. En el 3D está pieza por pieza (E2-…)."},
  {"id":"BA-3","nivel":"P1","nombre":"Baranda de la escalera E-04","pts":[[755,3084],[755,2834]],"z":409,"h":100,"tipo":"madera","sigue":"E-04","conf":"plano","nota":"«Baranda de escalera H 1,00 madera»."},
  {"id":"BA-4","nivel":"P2","nombre":"Baranda del hueco de la escalera en 2P","pts":[[755,2834],[755,3069]],"z":607,"h":100,"tipo":"madera","conf":"supuesto","nota":"Protege el hueco de la E-04 desde el descanso de 2P."},
  {"id":"BA-5","nivel":"P2","nombre":"Baranda de la escalerita E-06","pts":[[189,2972],[189,3070]],"z":607,"h":100,"tipo":"madera","sigue":"E-06","conf":"supuesto"},
];

export const DECK = [];

/* Techos: polígono en planta; z = [cara superior en el borde alto, en el borde bajo]; baja = hacia dónde. */
export const TECHOS = [
  {"id":"T-01","poly":[[-36,3091],[876,3091],[876,2330],[-36,2330]],"baja":"−y","pend":"10,8 %","mat":"chapa acanalada","z":[1013,930.8],"e":15,"estado":"existente","conf":"modelo","nombre":"Techo de chapa del bloque del fondo","nota":"SketchUp: de +10,13 junto al frente del bloque a +9,31 sobre el ventanal (10,8 %). El plano lo da al 12 % con alero de 1,00."},
  {"id":"T-02","poly":[[-15,3653],[223,3653],[223,3091],[-15,3091]],"baja":"−y","pend":"0 %","mat":"losa","z":[1092,1092],"e":12,"estado":"existente","conf":"modelo","nombre":"Techo del vestidor","nota":"SketchUp: plano a +10,92, con el tanque de agua encima."},
];

export const CHIMENEAS = [];

export const IMPLANTACION = [
  {"id":"J-2","tipo":"jardin","nombre":"Jardín del fondo","poly":[[15,2266],[850,2266],[850,15],[15,15]],"z":57,"conf":"plano","estado":"existente","nota":"Suelo absorbente a +0,57. Largo según el croquis (D-03)."},
  {"id":"J-3","tipo":"vereda","nombre":"Vereda de Arcos","poly":[[-200,4971],[1065,4971],[1065,4516],[-200,4516]],"z":0,"conf":"plano","estado":"existente","nota":"Ancho de vereda 4,55; calle de 17,32."},
];

/* Cotas generales de la planta. */
export const COTAS = [
  {"a":[0,4576],"b":[865,4576],"off":0,"txt":"8,65"},
  {"a":[-60,4516],"b":[-60,3909],"off":0,"txt":"6,07"},
  {"a":[-60,3909],"b":[-60,3085],"off":0,"txt":"8,24"},
  {"a":[-60,3085],"b":[-60,2351],"off":0,"txt":"7,34"},
  {"a":[-160,4516],"b":[-160,0],"off":0,"txt":"45,16"},
];

/* Dudas numeradas: respondé por número. ref = elementos que cambian con la respuesta. */
export const DUDAS = [
  {"id":"D-01","ref":["M-01","M-02","M-03","M-04","M-41","M-42","M-43","M-30","M-31","M-32","M-33"],"q":"Tu SketchUp no trae medianeras ni la mayoría de los tabiques (seguramente estaban en etiquetas ocultas al exportar). Esos muros siguen saliendo del plano. ¿Me lo exportás de nuevo con todas las etiquetas visibles?"},
  {"id":"D-02","ref":["L-B1","E-01","E-07","M-20","M-21","M-22"],"q":"El subsuelo no está en el SketchUp: lo dejé como en el plano (−1,98, con la escalera descubierta E-07 desde el frente). En tu SketchUp, en ese lugar del jardín hay unos escalones que bajan apenas a −0,19. ¿Existe el subsuelo y cómo se entra?"},
  {"id":"D-03","ref":["J-2","M-07","M-08","M-09"],"q":"El fondo del lote: usé 45,16 del croquis (23,3 m de jardín detrás del ventanal). ¿Está bien?"},
  {"id":"D-04","ref":["M-44","M-45","M-46","LO-06"],"q":"El balcón: en el SketchUp tiene un frente de sólo 0,62 sobre el piso (+3,83 a +4,71). El plano pide baranda de 1,00. ¿Es una jardinera, o falta la baranda?"},
  {"id":"D-06","ref":["CL-1","CL-2"],"q":"Las claraboyas de la terraza no están en el SketchUp; las dejé donde las pone el plano. ¿Existen?"},
  {"id":"D-07","ref":["T-01"],"q":"El techo de chapa del SketchUp baja 10,8 % (de +10,13 a +9,31) y termina sobre el ventanal, sin alero; el plano pide 12 % y alero de 1,00. ¿Cuál es?"},
  {"id":"D-08","ref":["C-05","LO-13"],"q":"El poste de madera oscura junto al ventanal (video 4838): lo puse en x 3,00, a 0,85 del ventanal, de 30 × 30. ¿Dónde está exactamente y qué sección tiene?"},
  {"id":"D-09","ref":["M-40","L-B9"],"q":"Video 4839 (s6–s11): desde el entrepiso se ven dos aberturas grandes hacia 1P, separadas por un pilar, con la escalerita E-03 subiendo por una. ¿Dónde están y cuánto miden?"},
  {"id":"D-11","ref":["E-02","LO-12","LO-11"],"q":"La E-02 con el giro del diseño del 11/10 (12 pedadas rectas, C1, C2 y la tabla de llegada) son 15 alzadas. Del piso de PB (+0,72) al entrepiso (+3,39, del SketchUp) dan 17,8 cada una; con las 17,5 del diseño el entrepiso quedaría a +3,345. ¿Cuánto mide del piso terminado de PB al piso del entrepiso? ¿Y a qué distancia de la zanca está el borde del entrepiso (puse 0,20)?"},
  {"id":"D-10","ref":["T-01"],"q":"En el video del 2P el techo tiene cabriadas metálicas reticuladas a la vista; tu SketchUp sólo trae la chapa y unas correas. ¿Cuántas cabriadas hay y cada cuánto?"},
];

/* Fotos de obra: un fotograma cada 2 segundos de tus videos (15/10/2026). Las notas de cada una van en la base, como las de las piezas. */
export const VIDEO = [
  {"id":"F38-00","video":"IMG_4838","t":0,"img":"4838_00"},
  {"id":"F38-02","video":"IMG_4838","t":2,"img":"4838_02"},
  {"id":"F38-04","video":"IMG_4838","t":4,"img":"4838_04"},
  {"id":"F38-06","video":"IMG_4838","t":6,"img":"4838_06"},
  {"id":"F38-08","video":"IMG_4838","t":8,"img":"4838_08"},
  {"id":"F38-10","video":"IMG_4838","t":10,"img":"4838_10"},
  {"id":"F38-12","video":"IMG_4838","t":12,"img":"4838_12"},
  {"id":"F38-14","video":"IMG_4838","t":14,"img":"4838_14"},
  {"id":"F38-16","video":"IMG_4838","t":16,"img":"4838_16"},
  {"id":"F38-18","video":"IMG_4838","t":18,"img":"4838_18"},
  {"id":"F38-20","video":"IMG_4838","t":20,"img":"4838_20"},
  {"id":"F38-22","video":"IMG_4838","t":22,"img":"4838_22"},
  {"id":"F38-24","video":"IMG_4838","t":24,"img":"4838_24"},
  {"id":"F38-26","video":"IMG_4838","t":26,"img":"4838_26"},
  {"id":"F38-28","video":"IMG_4838","t":28,"img":"4838_28"},
  {"id":"F38-30","video":"IMG_4838","t":30,"img":"4838_30"},
  {"id":"F38-32","video":"IMG_4838","t":32,"img":"4838_32"},
  {"id":"F39-00","video":"IMG_4839","t":0,"img":"4839_00"},
  {"id":"F39-02","video":"IMG_4839","t":2,"img":"4839_02"},
  {"id":"F39-04","video":"IMG_4839","t":4,"img":"4839_04"},
  {"id":"F39-06","video":"IMG_4839","t":6,"img":"4839_06"},
  {"id":"F39-08","video":"IMG_4839","t":8,"img":"4839_08"},
  {"id":"F39-10","video":"IMG_4839","t":10,"img":"4839_10"},
  {"id":"F39-12","video":"IMG_4839","t":12,"img":"4839_12"},
  {"id":"F39-14","video":"IMG_4839","t":14,"img":"4839_14"},
  {"id":"F39-16","video":"IMG_4839","t":16,"img":"4839_16"},
  {"id":"F39-18","video":"IMG_4839","t":18,"img":"4839_18"},
  {"id":"F39-20","video":"IMG_4839","t":20,"img":"4839_20"},
  {"id":"F39-22","video":"IMG_4839","t":22,"img":"4839_22"},
  {"id":"F39-24","video":"IMG_4839","t":24,"img":"4839_24"},
  {"id":"F39-26","video":"IMG_4839","t":26,"img":"4839_26"},
  {"id":"F39-28","video":"IMG_4839","t":28,"img":"4839_28"},
  {"id":"F39-30","video":"IMG_4839","t":30,"img":"4839_30"},
  {"id":"F39-32","video":"IMG_4839","t":32,"img":"4839_32"},
  {"id":"F39-34","video":"IMG_4839","t":34,"img":"4839_34"},
  {"id":"F39-36","video":"IMG_4839","t":36,"img":"4839_36"},
  {"id":"F40-00","video":"IMG_4840","t":0,"img":"4840_00"},
  {"id":"F40-02","video":"IMG_4840","t":2,"img":"4840_02"},
  {"id":"F40-04","video":"IMG_4840","t":4,"img":"4840_04"},
  {"id":"F40-06","video":"IMG_4840","t":6,"img":"4840_06"},
  {"id":"F40-08","video":"IMG_4840","t":8,"img":"4840_08"},
  {"id":"F40-10","video":"IMG_4840","t":10,"img":"4840_10"},
  {"id":"F40-12","video":"IMG_4840","t":12,"img":"4840_12"},
  {"id":"F40-14","video":"IMG_4840","t":14,"img":"4840_14"},
  {"id":"F40-16","video":"IMG_4840","t":16,"img":"4840_16"},
  {"id":"F40-18","video":"IMG_4840","t":18,"img":"4840_18"},
  {"id":"F40-20","video":"IMG_4840","t":20,"img":"4840_20"},
  {"id":"F40-22","video":"IMG_4840","t":22,"img":"4840_22"},
  {"id":"F40-24","video":"IMG_4840","t":24,"img":"4840_24"},
  {"id":"F40-26","video":"IMG_4840","t":26,"img":"4840_26"},
  {"id":"F40-28","video":"IMG_4840","t":28,"img":"4840_28"},
  {"id":"F40-30","video":"IMG_4840","t":30,"img":"4840_30"},
  {"id":"F40-32","video":"IMG_4840","t":32,"img":"4840_32"},
  {"id":"F40-34","video":"IMG_4840","t":34,"img":"4840_34"},
  {"id":"F40-36","video":"IMG_4840","t":36,"img":"4840_36"},
  {"id":"F40-38","video":"IMG_4840","t":38,"img":"4840_38"},
  {"id":"F40-40","video":"IMG_4840","t":40,"img":"4840_40"},
  {"id":"F40-42","video":"IMG_4840","t":42,"img":"4840_42"},
  {"id":"F40-44","video":"IMG_4840","t":44,"img":"4840_44"},
  {"id":"F40-46","video":"IMG_4840","t":46,"img":"4840_46"},
  {"id":"F40-48","video":"IMG_4840","t":48,"img":"4840_48"},
  {"id":"F40-50","video":"IMG_4840","t":50,"img":"4840_50"},
];

export const CAMBIOS = [
  {"fecha":"2026-10-15","v":"0.5.0","txt":"Costados con nombre: fachada E, jardín O, medianeras S (izquierda mirando desde Arcos) y N. Ambientes con nombre (Living, Cocina, Estar hundido, Cuarto SE, Cuarto NE, Dormitorio O…; los códigos B quedan en las notas). Piso de tablones de 20 transversales (de medianera a medianera) en PB, 1P y 2P. Arcada de 2,00 entre los dos cuartos de 1P, en M-41 (P-14). LO-02 de 15, como el plano, con el escalón del estar hundido cerrado."},
  {"fecha":"2026-10-15","v":"0.4.1","txt":"M-42: la puerta de 0,89 (P-09) pasa a ser un vano de 2,00 para puerta granero, como en las fotos F39-12 a F39-22; posición estimada, centrado con la ventana del balcón."},
  {"fecha":"2026-10-15","v":"0.4.0","txt":"Tus notas: LO-02 sin los triángulos sueltos (el hueco de la escalera tocaba el borde de la losa); el piso de tablas cubre toda la planta baja (SU-11); el sótano se ve: el suelo tiene un hueco sobre el subsuelo y la escalera descubierta (M-22). La E-02 al detalle con el diseño del 11/10 («Escalera al entrepiso»): tramo recto, giro con las compensadas C1 y C2, tabla de llegada, estructura (PA, VD1, VF, VW, V4, V5) y baranda de madera y cables (R1, R4). El descanso LO-12 pasa a ser ese giro y LO-11 queda a 0,20 de la zanca. Nueva duda D-11 sobre la altura. Pestaña «Fotos»: 62 fotogramas de tus videos (uno cada 2 s), cada uno con su nota."},
  {"fecha":"2026-10-15","v":"0.3.1","txt":"Vistas: «Guardar vista actual» ahora pide el nombre y la vista guardada aparece en la lista (antes se guardaba sin aviso y no se veía). La lista muestra también las vistas fijas; ⟳ actualiza, × borra."},
  {"fecha":"2026-10-15","v":"0.3.0","txt":"Lo que muestran tus videos de obra: entrepiso de madera en L (franja de 2,50 junto a la escalera y franja de 3,00 sobre la cocina hasta el ventanal, con baranda), poste de madera oscura bajo su punta, caja del baño y el depósito de PB hasta ~2,30, ventana interior del baño de 1P al entrepiso, chapa sinusoidal con su estructura del SketchUp en lugar del techo liso. Tres dudas nuevas (D-08 a D-10)."},
  {"fecha":"2026-10-15","v":"0.2.2","txt":"Borrar ya no es un ícono de la barra: está en el inspector, con «Borrar pieza» y, si la pieza tiene varias partes, «Borrar sólo esta parte» (la que tocaste). Se deshace con Ctrl/⌘ Z."},
  {"fecha":"2026-10-15","v":"0.2.1","txt":"Tu nota en LO-04: el entrepiso pasa a 2,50 de fondo (era 6,92), pegado al frente del bloque del fondo junto a la escalera; vuelve la doble altura sobre el estar hundido. Baranda sobre el borde nuevo."},
  {"fecha":"2026-10-15","v":"0.2.0","txt":"La casa pasa a salir de tu SketchUp: niveles (entrepiso +3,39, 1P +4,09, 2P +6,07, terraza +7,34), fachada con sus aberturas (entrada de 2,80, puerta balcón), balcón, entrepiso grande, estar hundido, escaleras, vestidor con tanque, techo al 10,8 % y ventanal. Lo que el SketchUp no trae (medianeras, tabiques, subsuelo, claraboyas) sigue del plano. Nueva capa «Detalle del SketchUp»: ventanal repartido, pantalla de listones y pérgola de la terraza, jardín del frente en pendiente, cerco, cocina y baños."},
  {"fecha":"2026-10-15","v":"0.1.0","txt":"Primera versión de Arcos 4264 desde el plano de regularización (hoja 01/04, escala 1:100): subsuelo, planta baja con estar hundido, entrepiso, primer piso, segundo piso, terraza y vestidor; techo de chapa al 12 %. Escaleras ubicadas con tu SketchUp. Tu SketchUp va como calco (gris) en 3D y en planta."},
];

