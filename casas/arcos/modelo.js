/* Arcos 4264 (Núñez, CABA) — modelo de datos de la casa. Única fuente de verdad: el visor dibuja todo a partir de esto.
   Unidades: cm. x: 0 en el eje medianero izquierdo mirando desde Arcos, crece hacia la derecha (medianera derecha en 865).
   y: 0 en el fondo del lote, crece hacia Arcos; la línea municipal está en y 4516 (lote de 45,16 según el croquis).
   z: sobre el ±0,00 del plano (vereda). En el visor 3D: X = x, Y = z, Z = y.
   v0.2: lo que trae tu SketchUp (Arcos_55.dae, subido 58 cm) manda; lo que no trae sale del plano de regularización (hoja 01/04, 1:100).
   conf 'modelo' = del SketchUp; 'plano' = del plano; 'estimado' = interpretado; 'supuesto' = lo puse yo, a confirmar. */

export const META = {"nombre":"Arcos 4264","version":"0.10.13","fecha":"2026-10-20","resumen":"Casa de Arcos 4264 (Núñez, CABA) armada de tu SketchUp (Arcos_55.dae); lo que el SketchUp no trae (medianeras, tabiques, subsuelo) sale del plano de regularización.","ejes":"Costados (convención de Maxi, 15/10): fachada E, jardín O, medianera S (x 0, a la izquierda mirando desde Arcos) y medianera N (x 865). x: 0 en el eje medianero S, crece hacia el N. y: 0 en el fondo del lote, hacia Arcos (L.M. en y 45,16). z: sobre el ±0,00 del plano (vereda).","planta":{"vb":{"x":-400,"y":2000,"w":1700,"h":2700},"casa":{"cx":432,"cy":3400,"w":1300,"h":2400},"lote":{"cx":432,"cy":2258,"w":1300,"h":4900},"ejesExt":{"x0":-260,"x1":1100,"y0":-100,"y1":4700},"ghost":"PB","nivelesOrden":["SS","PB","EP","P1","P2","TZ","TE"],"spec":"casa <b>8,65 × 15,78</b> · lote <b>8,65 × 45,16</b> · 5 niveles"}};

export const NIVELES = {"SS":{"nombre":"Subsuelo","z":-198,"conf":"plano"},"PB":{"nombre":"Planta baja","z":72,"conf":"plano","nota":"El estar hundido, a +0,22."},"EP":{"nombre":"Entrepiso","z":329,"conf":"plano","nota":"Escritorio."},"P1":{"nombre":"Primer piso","z":417,"conf":"plano"},"P2":{"nombre":"Segundo piso","z":613,"conf":"plano","nota":"Dormitorio O y baño de 2P, bajo el techo de chapa."},"TZ":{"nombre":"Terraza","z":757,"conf":"plano","nota":"Con el vestidor al mismo nivel."},"TE":{"nombre":"Techos","z":0}};

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
  {"id":"M-01","nivel":"PB","a":[0,3909],"b":[0,3085],"e":30,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"plano","nombre":"Medianera S, bloque del frente","z0":0,"top":937,"niveles":["PB","P1","TZ"],"nota":"Eje medianero, 0,30. Arriba de la terraza sigue como «muro H 1,80 E 0,15» (dibujado de 0,30 hasta +9,37)."},
  {"id":"M-02","nivel":"PB","a":[865,3909],"b":[865,3085],"e":30,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"plano","nombre":"Medianera N, bloque del frente","z0":-198,"top":937,"niveles":["SS","PB","P1","TZ"],"nota":"Del lado del subsuelo baja hasta −1,98. Arriba de la terraza, 1,80."},
  {"id":"M-03","nivel":"PB","a":[0,3085],"b":[0,2351],"e":30,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"plano","nombre":"Medianera S, bloque del fondo","z0":0,"top":[1008.3,920.2],"niveles":["PB","EP","P2"],"nota":"Hasta el techo de chapa (12 %)."},
  {"id":"M-04","nivel":"PB","a":[865,3085],"b":[865,2351],"e":30,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"plano","nombre":"Medianera N, bloque del fondo","z0":-198,"top":[1008.3,920.2],"niveles":["SS","PB","EP","P1","P2"],"nota":"Del lado de la escalera baja hasta el subsuelo (−1,98) hasta yd 16,48."},
  {"id":"M-05","nivel":"PB","a":[0,4516],"b":[0,3909],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Medianera S, jardín del frente","z0":0,"top":200,"nota":"«Muro H 2,00 E 0,30»."},
  {"id":"M-06","nivel":"PB","a":[865,4516],"b":[865,3909],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Medianera N, jardín del frente","z0":-198,"top":200,"niveles":["SS","PB"],"nota":"«Muro H 2,00 E 0,30». Contiene la escalera descubierta al subsuelo."},
  {"id":"M-07","nivel":"PB","a":[0,2351],"b":[0,15],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Medianera S, jardín del fondo","z0":57,"top":357,"nota":"«Muro H 3,00 E 0,30». El plano dibuja el fondo acortado; el largo sale del croquis (45,16)."},
  {"id":"M-08","nivel":"PB","a":[865,2351],"b":[865,15],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Medianera N, jardín del fondo","z0":57,"top":357,"nota":"«Muro H 3,00 E 0,30»."},
  {"id":"M-09","nivel":"PB","a":[-15,0],"b":[880,0],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Muro del fondo del lote","z0":57,"top":357,"nota":"«Muro H 3,00 E 0,30». Retiro de fondo obligatorio: 6,00."},
  {"id":"M-11","nivel":"PB","a":[12,3901.5],"b":[888,3901.5],"e":15,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"modelo","nombre":"Fachada E","z0":41,"top":765,"niveles":["PB","P1","TZ"],"lbl":"abajo","nota":"SketchUp: cara a 6,07 de la L.M. (el plano la pone a 6,29), de +0,41 a +7,42; arriba sigue la pantalla de listones de la terraza."},
  {"id":"M-12","nivel":"PB","a":[15,2351],"b":[850,2351],"e":12,"tipo":"vidrio","carga":false,"estado":"existente","conf":"modelo","nombre":"Ventanal del contrafrente O","z0":72,"top":905.2,"niveles":["PB","EP","P2"],"nota":"SketchUp: tres filas de paños repartidos (+0,81 a +4,92, +5,06 a +6,15 y +6,18 a +9,14). La carpintería con todos sus paños está en «Detalle del SketchUp».","modulos":4,"travesanos":[492,615]},
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
  {"id":"M-40","nivel":"P1","a":[15,3084],"b":[435,3084],"e":10,"tipo":"tabique","carga":false,"estado":"existente","conf":"plano","nombre":"Baño de 1P: pared al fondo","top":613,"niveles":["P1"],"nota":"Plano: pared del baño B8 sobre el borde de la losa de 1P (que vuela 0,55 detrás de V301). Apoya en la losa, no en el entrepiso de madera; arriba recibe el borde de la losa del 2P y el muro M-50."},
  {"id":"M-47","nivel":"P1","a":[435,3084],"b":[656,3084],"e":15,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"medido","nombre":"Palier de 1P: muro al entrepiso","top":613,"niveles":["P1"],"nota":"Foto de Maxi (16/10, desde el palier de 1P): sigue la pared del baño hasta la columna CN4, con un vano cuadrado sobre el entrepiso. Apoya en el voladizo de la losa de 1P y lleva el borde de la losa del 2P (la franja de 0,30 del plano de estructura)."},
  {"id":"M-41","nivel":"P1","a":[426.5,3894],"b":[426.5,3079],"e":15,"tipo":"tabique","carga":false,"estado":"existente","conf":"plano","nombre":"Cuarto SE y baño de 1P: pared al palier","top":739},
  {"id":"M-42","nivel":"P1","a":[434,3452],"b":[850,3452],"e":12,"tipo":"tabique","carga":false,"estado":"existente","conf":"plano","nombre":"Cuarto NE: pared al palier","top":739},
  {"id":"M-43","nivel":"P1","a":[15,3288],"b":[325,3288],"e":11,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Cuarto SE / baño de 1P","top":739,"nota":"Dibujado como «muro sin permiso». Entre 3,25 y 4,19 queda un paso sin pared: ¿es así?"},
  {"id":"M-50","nivel":"P2","a":[15,3085],"b":[850,3085],"e":12,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"modelo","nombre":"Bloque del fondo: frente a la terraza","top":1008.3,"niveles":["P2","TZ"],"nota":"SketchUp: muro bajo de +6,07 a +7,42 del lado del dormitorio y vidriado arriba; sube hasta el techo."},
  {"id":"M-51","nivel":"P2","a":[650,3069],"b":[650,2351],"e":15,"tipo":"tabique","carga":false,"estado":"existente","conf":"plano","nombre":"Dormitorio O: pared a la escalera y al baño","top":[991.4,905.2]},
  {"id":"M-52","nivel":"P2","a":[658,2711.5],"b":[850,2711.5],"e":15,"tipo":"tabique","carga":false,"estado":"existente","conf":"plano","nombre":"Baño de 2P: pared a la escalera","top":948.5},
  {"id":"M-53","nivel":"TZ","a":[213,3653],"b":[213,3091],"e":20,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"modelo","nombre":"Vestidor: pared a la terraza","z0":757,"top":1064,"nota":"SketchUp: caja de 2,26 × 5,62 hasta +10,92; arriba, el tanque de agua."},
  {"id":"M-54","nivel":"TZ","a":[15,3643],"b":[223,3643],"e":20,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"modelo","nombre":"Vestidor: frente","z0":757,"top":1064},
  {"id":"M-55","nivel":"TZ","a":[0,3653],"b":[0,3091],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"modelo","nombre":"Vestidor: medianera","z0":937,"top":1064,"nota":"La medianera sube con la caja del vestidor."},
];

/* Aberturas: en el muro `muro`, a `d` cm del punto a, ancho w, alto h, antepecho s (cm sobre la base del muro). */
export const ABERTURAS = [
  {"id":"P-03","muro":"M-11","d":36,"w":280,"h":212,"s":35,"tipo":"puerta","estado":"existente","conf":"modelo","nombre":"Entrada (puerta y paño fijo)","nota":"SketchUp: 2,80 de ancho, de +0,76 a +2,88."},
  {"id":"V-01","muro":"M-11","d":552,"w":188,"h":114,"s":139,"tipo":"ventana","estado":"existente","conf":"modelo","nombre":"Ventana del comedor","nota":"SketchUp: de +1,80 a +2,94."},
  {"id":"V-02","muro":"M-11","d":118,"w":128,"h":102,"s":471,"tipo":"ventana","estado":"existente","conf":"modelo","nombre":"Ventana del cuarto SE","nota":"SketchUp: de +5,04 a +6,06."},
  {"id":"V-03","muro":"M-11","d":552,"w":176,"h":188,"s":385,"tipo":"puerta","estado":"existente","conf":"modelo","nombre":"Puerta balcón del cuarto NE","nota":"SketchUp: de +4,18 a +6,06, sale al balcón."},
  {"id":"V-04","muro":"M-22","d":132.5,"w":156.5,"h":90,"s":100,"tipo":"ventana","estado":"existente","conf":"supuesto","nombre":"Ventana del subsuelo al frente","nota":"La planta la marca (4,30 a 5,87) pero no hay alto en ningún corte: antepecho 1,00 y alto 0,90 supuestos. Da a tierra salvo que el frente esté hundido como en tu SketchUp (D-01, D-05)."},
  {"id":"P-04","muro":"M-22","d":464.4,"w":84,"h":200,"s":0,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta del subsuelo a la escalera descubierta","nota":"0,85. El corte A-A la muestra de −1,98 a ~0,00."},
  {"id":"P-05","muro":"M-30","d":90,"w":90,"h":200,"s":0,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta del toilette"},
  {"id":"P-06","muro":"M-32","d":90,"w":90,"h":200,"s":0,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta del depósito"},
  {"id":"P-15","muro":"M-47","d":0,"w":211,"h":130,"s":0,"tipo":"vano","estado":"existente","conf":"estimado","nombre":"Vano cuadrado del palier de 1P al entrepiso","nota":"Foto de Maxi (16/10): de la pared del baño a la columna CN4 (2,09 del plano) y desde el piso; el alto, 1,30, sale de la proporción en la foto.","dintel":false},
  {"id":"P-07","muro":"M-41","d":451,"w":80,"h":200,"s":0,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta del cuarto SE desde el palier"},
  {"id":"P-14","muro":"M-41","d":118,"w":200,"h":210,"s":0,"tipo":"vano","estado":"existente","conf":"estimado","nombre":"Arcada entre los cuartos SE y NE","nota":"Maxi (15/10): otra arcada, como la de M-42. 2,00 de ancho y 2,10 de alto, centrada en el tramo de M-41 entre los dos cuartos: ancho y posición supuestos."},
  {"id":"P-08","muro":"M-41","d":712,"w":80,"h":200,"s":0,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta del baño de 1P","nota":"El hueco va de 13,30 a 14,18; la hoja de ~0,80."},
  {"id":"P-09","muro":"M-42","d":107,"w":200,"h":210,"s":0,"tipo":"vano","estado":"existente","conf":"estimado","nombre":"Vano para puerta granero del cuarto NE","nota":"Maxi (15/10): vano de 2,00 para puerta granero, en lugar de la puerta de 0,89 del plano. Fotos F39-12 a F39-22: sin hoja todavía, con el riel arriba. Posición estimada de las fotos, centrado con la ventana del balcón; quedan 1,07 y 1,09 de pared a los costados. Alto 2,10 supuesto."},
  {"id":"P-10","muro":"M-50","d":85,"w":89,"h":200,"s":127,"tipo":"puerta","estado":"existente","conf":"modelo","nombre":"Puerta del vestidor","nota":"Arriba de la escalerita E-06."},
  {"id":"V-05","muro":"M-50","d":184,"w":426,"h":214,"s":135,"tipo":"ventana","estado":"existente","conf":"modelo","nombre":"Ventana del dormitorio O a la terraza","nota":"SketchUp: de +7,42 a +9,56, sobre el muro bajo."},
  {"id":"P-11","muro":"M-50","d":625,"w":192,"h":221,"s":144,"tipo":"puerta","estado":"existente","conf":"modelo","nombre":"Puerta y paño a la terraza","nota":"SketchUp: de +7,33 a +9,54, al final de la E-05."},
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
  {"id":"L-B13","nivel":"P2","nombre":"Dormitorio O (2P)","poly":[[15,3079],[643,3079],[643,2351],[15,2351]],"conf":"modelo","nota":"A +6,13 (plano)."},
  {"id":"L-B14","nivel":"TZ","nombre":"Vestidor","poly":[[15,3633],[203,3633],[203,3091],[15,3091]],"conf":"modelo","nota":"A +7,57, al nivel de la terraza (plano)."},
  {"id":"L-TZ","nivel":"TZ","nombre":"Terraza","poly":[[223,3894],[850,3894],[850,3091],[223,3091]],"conf":"modelo","nota":"A +7,57 (plano), con pantalla de listones y pérgola sobre la escalera (ver «Detalle del SketchUp»)."},
];

/* Losas: z = cara superior, e = espesor, huecos = polígonos. */
export const LOSAS = [
  {"id":"LO-01","nivel":"SS","nombre":"Piso del subsuelo","z":-198,"e":12,"poly":[[327.5,3857],[850,3857],[850,2868],[760,2868],[760,3068],[327.5,3068]],"conf":"plano"},
  {"id":"LO-02","nivel":"PB","nombre":"Losa de planta baja","z":72,"e":15,"poly":[[15,3887],[850,3887],[850,3193],[760,3193],[760,2872],[386,2872],[386,2419],[831,2419],[831,2865],[850,2865],[850,2331],[15,2331]],"conf":"modelo","nota":"SketchUp: de 6,29 a 21,85 de la L.M., con la escalera al subsuelo y el estar hundido recortados del contorno. 15 de espesor, como el plano (Maxi, 15/10). Terminación: el piso de tablas cubre toda la planta baja (nota de Maxi en SU-11, 15/10)."},
  {"id":"LO-03","nivel":"PB","nombre":"Piso del estar hundido","z":22,"e":10,"poly":[[386,2872],[831,2872],[831,2419],[386,2419]],"conf":"modelo","nota":"SketchUp: 4,45 × 4,53 a +0,19 (0,53 más bajo). El plano lo da de 3,80 × 3,50 a +0,22."},
  {"id":"LO-04","nivel":"EP","nombre":"Entrepiso (escritorio)","z":329,"e":3,"poly":[[15,3074],[666,3074],[666,2824],[15,2824]],"conf":"plano","cabios":{"dir":"y","sec":"4,5×13,5","sep":45},"nota":"2,50 de fondo (Maxi, 15/10). Plano de estructura (hoja 3, nivel +3,29): entrepiso de madera colgado. Tablas de 3 clavadas directo sobre cabios de 135 × 45 mm de canto cada ~0,45, que van de la viga de madera del frente (VE-1) a la del fondo (VE-2); las vigas cuelgan de tensores Ø16 (T2 a T5) de las vigas del 2P y empotran en la medianera S. Ancho hasta la columna CN4 (6,52 del plano)."},
  {"id":"LO-13","nivel":"EP","nombre":"Entrepiso sobre la cocina","z":329,"e":3,"poly":[[15,2824],[315,2824],[315,2392],[15,2392]],"conf":"plano","cabios":{"dir":"x","sec":"4,5×13,5","sep":45},"nota":"Plano de estructura (+3,29): cabios de 135 × 45 de la medianera S a la viga VE-3, que cuelga del tensor T1 y llega a VE-2 (T2). En la punta, el poste de madera oscura del video 4838 (C-05). El plano de arquitectura lo dibuja igual (3,00 de ancho, hasta el ventanal)."},
  {"id":"LO-11","nivel":"EP","nombre":"Descanso de la escalera y paso al entrepiso","z":329,"e":3,"poly":[[666,3074],[738,3074],[738,2825],[666,2825]],"conf":"estimado","cabios":{"dir":"y","sec":"4,5×13,5","sep":36},"nota":"Parte del entrepiso entre el escritorio y la E-02, bajo la E-03: las mismas vigas VE-1 y VE-2 siguen hasta acá. La E-03 arranca y apoya sobre este piso."},
  {"id":"LO-12","nivel":"EP","nombre":"Giro de la E-02: compensadas C1 y C2","z":311.9,"e":5,"poly":[[758,2917],[850,2917],[850,2825],[758,2825]],"conf":"estimado","nota":"Ya no es un descanso: dos compensadas de 45° (C1 a +2,99 y C2 a +3,21) cortadas de un panel de tablas diagonales, y la tabla de llegada TL al entrepiso. Diseño de la conversación «Diseño escalera con descanso» (11/10); en el 3D está pieza por pieza (E2-…)."},
  {"id":"LO-05","nivel":"P1","nombre":"Losa del primer piso","z":417,"e":18,"poly":[[15,3887],[850,3887],[850,3084],[666,3084],[666,3064],[15,3064]],"conf":"plano","nota":"Plano de estructura (+4,17): losas L2 a L6 sobre las vigas V301 (25 × 60, borde del bloque del frente), V302 (20 × 70) y V303. Detrás de V301 la losa vuela 0,55 hasta la columna CN4, que nace acá."},
  {"id":"LO-06","nivel":"P1","nombre":"Balcón","z":417,"e":26,"poly":[[822,3909],[822,3999],[502.0,3999.0],[478.7,3995.9],[457.0,3986.9],[438.4,3972.6],[424.1,3954.0],[415.1,3932.3],[412.0,3909.0]],"conf":"medido","nota":"SketchUp: 4,10 × 0,90. Foto de la fachada (15/10): la punta S es redondeada (radio 0,90) y la baranda es de caños horizontales de 1,00 (LO-06b)."},
  {"id":"LO-07","nivel":"P2","nombre":"Losa del segundo piso","z":613,"e":18,"poly":[[15,3084],[850,3084],[850,2392],[15,2392]],"huecos":[[[754,3084],[850,3084],[850,2834],[754,2834]]],"conf":"modelo"},
  {"id":"LO-08","nivel":"TZ","nombre":"Losa de la terraza","z":757,"e":32,"poly":[[15,3894],[850,3894],[850,3084],[15,3084]],"huecos":[[[246,3233],[346,3233],[346,3133],[246,3133]],[[542,3327],[644,3327],[644,3227],[542,3227]]],"conf":"modelo","nota":"+7,57 (plano). Las claraboyas siguen la posición del plano."},
  {"id":"LO-10","nivel":"PB","nombre":"Galería del contrafrente","z":72,"e":15,"poly":[[15,2331],[850,2331],[850,2266],[15,2266]],"conf":"plano","nota":"«0,90» más allá de la carpintería, a +0,72."},
];

export const CLARABOYAS = [
  {"id":"CL-1","nivel":"TZ","nombre":"Claraboya sobre el baño de 1P","poly":[[246,3233],[346,3233],[346,3133],[246,3133]],"z":782,"conf":"plano","nota":"1,00 × 1,00, del plano."},
  {"id":"CL-2","nivel":"TZ","nombre":"Claraboya sobre el palier de 1P","poly":[[542,3327],[644,3327],[644,3227],[542,3227]],"z":782,"conf":"plano","nota":"1,00 × 1,00, del plano."},
];

export const ESTRUCTURA = [
  {"id":"C-01","tipo":"columna","nivel":"PB","pos":[406,3447],"sec":"20×20","z":[72,347],"conf":"plano","estado":"existente","nombre":"CE1 · Columna del comedor","nota":"Plano: CE1, recibe V302 (20 × 70) y V303. Nace en el subsuelo (CE1 26 × 25 bajo +0,72)."},
  {"id":"C-06","tipo":"columna","nivel":"PB","pos":[25,3447],"sec":"20×20","z":[72,347],"conf":"plano","estado":"existente","nombre":"CN3 · Columna S del comedor","nota":"Plano: CN3, en la medianera S, recibe V302."},
  {"id":"C-07","tipo":"columna","nivel":"PB","pos":[2.5,3151],"sec":"25×20","z":[0,357],"conf":"plano","estado":"existente","nombre":"CN1 · Columna S del borde del bloque","nota":"Plano: CN1 20 × 25, embutida en la medianera S desde la fundación; recibe V301."},
  {"id":"C-08","tipo":"columna","nivel":"PB","pos":[862.5,3151],"sec":"25×20","z":[0,357],"conf":"plano","estado":"existente","nombre":"CN1 · Columna N del borde del bloque","nota":"Plano: CN1 20 × 25, embutida en la medianera N desde la fundación (la E-02 corre pegada a la medianera); recibe V301."},
  {"id":"V-301","tipo":"viga","nivel":"P1","a":[0,3151],"b":[865,3151],"sec":"25×60","z":417,"conf":"plano","estado":"existente","nombre":"V301 · Viga del borde del bloque del frente","nota":"Plano: 25 × 60, de CN1 a CN1. Detrás vuela 0,55 la losa hasta CN4."},
  {"id":"V-302","tipo":"viga","nivel":"P1","a":[15,3447],"b":[416,3447],"sec":"20×70","z":417,"conf":"plano","estado":"existente","nombre":"V302 · Viga del comedor (S)","nota":"Plano: 20 × 70, de CN3 a CE1."},
  {"id":"V-303","tipo":"viga","nivel":"P1","a":[396,3447],"b":[850,3447],"sec":"15×30","z":417,"conf":"plano","estado":"existente","nombre":"V303 · Viga del comedor (N)","nota":"Plano: 15 × 30, de CE1 a la medianera N."},
  {"id":"V-307","tipo":"viga","nivel":"P1","a":[236,3138.5],"b":[236,3437],"sec":"15×30","z":417,"conf":"plano","estado":"existente","nombre":"V307 · Viga de 1P entre L2 y L4","nota":"Plano: 15 × 30, de V301 a V302."},
  {"id":"V-309","tipo":"viga","nivel":"P1","a":[464,3138.5],"b":[464,3437],"sec":"15×30","z":417,"conf":"plano","estado":"existente","nombre":"V309 · Viga de 1P entre L4 y L3","nota":"Plano: 15 × 30, de V301 a V302."},
  {"id":"V-308","tipo":"viga","nivel":"P1","a":[340,3457],"b":[340,3887],"sec":"15×30","z":417,"conf":"plano","estado":"existente","nombre":"V308 · Viga de 1P entre L5 y L6","nota":"Plano: 15 × 30, de V302 a la fachada."},
  {"id":"C-04","tipo":"columna","nivel":"P1","pos":[656,3074],"sec":"20×20","z":[417,595],"conf":"plano","estado":"existente","nombre":"CN4 · Columna de la escalera","nota":"Plano de estructura: nace en la losa de 1P (+4,17), en el voladizo detrás de V301, y lleva el borde de la losa del 2P junto con el muro M-47. Plano de 1P: queda entre el palier B9 y la E-03, que pasa al lado sin tocarla."},
  {"id":"V-401","tipo":"viga","nivel":"P2","a":[0,2403],"b":[865,2403],"sec":"20×60","z":613,"conf":"plano","estado":"existente","nombre":"V401 · Viga del contrafrente del 2P","nota":"Plano de estructura (+6,13): viga de hormigón de 20 × 60 a todo el ancho, en el borde del 2P sobre el ventanal; apoya en CNA1 y CNA2 y recibe V408 y V410. Va por dentro del ventanal: desde +5,1 el vidrio se inclina hacia adentro y con su marco llega a 23,91 del lote a la altura de la viga."},
  {"id":"C-09","tipo":"columna","nivel":"PB","pos":[0,2403],"sec":"20×20","z":[0,553],"conf":"plano","estado":"existente","nombre":"CNA1 · Columna S del contrafrente","nota":"Plano: CNA1, embutida en la medianera S (afuera estaría contra el marco del ventanal y atravesaría el entrepiso); recibe V401."},
  {"id":"C-10","tipo":"columna","nivel":"PB","pos":[865,2403],"sec":"20×20","z":[0,553],"conf":"plano","estado":"existente","nombre":"CNA2 · Columna N del contrafrente","nota":"Plano: CNA2, embutida en la medianera N; recibe V401."},
  {"id":"V-410","tipo":"viga","nivel":"P2","a":[313,2413],"b":[313,3074],"sec":"15×30","z":613,"conf":"plano","estado":"existente","nombre":"V410 · Viga del 2P sobre el entrepiso","nota":"Plano (+6,13): 15 × 30. De ella cuelgan los tensores T1, T2 y T4."},
  {"id":"V-408","tipo":"viga","nivel":"P2","a":[648,2413],"b":[648,3074],"sec":"15×30","z":613,"conf":"plano","estado":"existente","nombre":"V408 · Viga del 2P junto a la escalera","nota":"Plano (+6,13): 15 × 30, de V401 al muro M-47. De ella cuelgan los tensores T3 y T5."},
  {"id":"VE-1","tipo":"viga","nivel":"EP","a":[0,3060],"b":[738,3060],"sec":"4×24","z":326,"conf":"plano","estado":"existente","nombre":"VE-1 · Viga de madera del frente del entrepiso","nota":"Plano (+3,29): viga de madera 240 × 40. Empotra en la medianera S y cuelga de T4 y T5. Queda justo detrás del voladizo de la losa de 1P, para que los tensores no la atraviesen; las tablas vuelan 0,12 por delante.","cat":"madera"},
  {"id":"VE-2","tipo":"viga","nivel":"EP","a":[0,2826],"b":[662,2826],"sec":"4×24","z":326,"conf":"plano","estado":"existente","nombre":"VE-2 · Viga de madera del fondo del entrepiso","nota":"Plano (+3,29): viga de madera 240 × 40. Empotra en la medianera S y cuelga de T2 y T3. Termina antes del poste PE4 de la E-02, que toma ese borde.","cat":"madera"},
  {"id":"VE-3","tipo":"viga","nivel":"EP","a":[313,2824],"b":[313,2392],"sec":"4×24","z":326,"conf":"plano","estado":"existente","nombre":"VE-3 · Viga de madera del ala sobre la cocina","nota":"Plano (+3,29): viga de madera 240 × 40. Cuelga de T1, apoya en VE-2 y en la punta en el poste C-05.","cat":"madera"},
  {"id":"T-1","tipo":"tensor","nivel":"EP","pos":[313,2600],"sec":"Ø1,6","z":[302,583],"conf":"plano","estado":"existente","nombre":"Tensor T1 del entrepiso","nota":"Plano de estructura (+3,29 y +6,13): barra Ø16 que cuelga la viga de madera del entrepiso de la viga de hormigón del 2P."},
  {"id":"T-2","tipo":"tensor","nivel":"EP","pos":[313,2826],"sec":"Ø1,6","z":[302,583],"conf":"plano","estado":"existente","nombre":"Tensor T2 del entrepiso","nota":"Plano de estructura (+3,29 y +6,13): barra Ø16 que cuelga la viga de madera del entrepiso de la viga de hormigón del 2P."},
  {"id":"T-3","tipo":"tensor","nivel":"EP","pos":[648,2826],"sec":"Ø1,6","z":[302,583],"conf":"plano","estado":"existente","nombre":"Tensor T3 del entrepiso","nota":"Plano de estructura (+3,29 y +6,13): barra Ø16 que cuelga la viga de madera del entrepiso de la viga de hormigón del 2P."},
  {"id":"T-4","tipo":"tensor","nivel":"EP","pos":[313,3060],"sec":"Ø1,6","z":[302,583],"conf":"plano","estado":"existente","nombre":"Tensor T4 del entrepiso","nota":"Plano de estructura (+3,29 y +6,13): barra Ø16 que cuelga la viga de madera del entrepiso de la viga de hormigón del 2P."},
  {"id":"T-5","tipo":"tensor","nivel":"EP","pos":[648,3060],"sec":"Ø1,6","z":[302,583],"conf":"plano","estado":"existente","nombre":"Tensor T5 del entrepiso","nota":"Plano de estructura (+3,29 y +6,13): barra Ø16 que cuelga la viga de madera del entrepiso de la viga de hormigón del 2P."},
  {"id":"C-05","tipo":"columna","nivel":"PB","pos":[313,2407],"sec":"30×30","z":[72,302],"conf":"medido","estado":"existente","nombre":"Poste de madera oscura","nota":"Video 4838 (s12–s14): poste de madera maciza oscura bajo la punta del entrepiso, cerca del ventanal. No está en el plano de estructura: recibe la punta de VE-3.","cat":"madera"},
];

/* Escaleras rectas: x = [izq, der]; y = [primera alzada, última alzada]; z = [salida, llegada]; n = alzadas. */
export const ESCALERAS = [
  {"id":"E-01","nivel":"SS","x":[763,850],"y":[3255,2865],"z":[-198,72],"n":16,"nombre":"Escalera del subsuelo a planta baja","conf":"modelo","estado":"existente","poly":[[763,3255],[850,3255],[850,2865],[763,2865]],"sube":"-y","nota":"SketchUp hasta −1,19; el tramo de abajo y el subsuelo no están en el SketchUp (plano). 16 alzadas de 16,9 y pedadas de 26,0,"},
  {"llega":"LO-12","id":"E-02","nivel":"PB","x":[758,850],"y":[3205,2917],"z":[72,277.6],"n":12,"nombre":"Escalera de planta baja al entrepiso","conf":"estimado","estado":"existente","poly":[[758,3205],[850,3205],[850,2917],[758,2917]],"sube":"-y","nota":"Tramo recto de 12 pedadas abiertas de 24 entre zancas; sigue con el giro LO-12 (C1, C2) y la llegada al entrepiso: 15 alzadas de 17,1 en total (de +0,72 a +3,29, plano). 12 alzadas de 17,1 y pedadas de 26,2,"},
  {"id":"E-03","nivel":"EP","x":[668,738],"y":[2988,3084],"z":[329,417],"n":5,"nombre":"Escalera del entrepiso al primer piso","conf":"plano","estado":"existente","poly":[[668,3084],[738,3084],[738,2988],[668,2988]],"sube":"+y","nota":"Plano 1P: tramo junto a la columna CN4 (sin tocarla); queda de 0,70 y no de 0,90 porque del otro lado está la baranda R1 de la E-02, sube hacia el frente al palier B9. Arranca sobre LO-11 y la cabeza de las zancas apoya en el borde de la losa de 1P. 5 alzadas de 17,6 y pedadas de 24,0,"},
  {"id":"E-04","nivel":"P1","x":[760,850],"y":[3084,2834],"z":[417,613],"n":11,"nombre":"Escalera del primer piso al segundo","conf":"modelo","estado":"existente","poly":[[760,3084],[850,3084],[850,2834],[760,2834]],"sube":"-y","nota":"SketchUp: sube hacia el fondo, sobre la E-02. 11 alzadas de 17,8 y pedadas de 25,0,"},
  {"id":"E-05","nivel":"P2","x":[658,748],"y":[2909,3079],"z":[613,757],"n":11,"nombre":"Escalera del segundo piso a la terraza","conf":"modelo","estado":"existente","poly":[[658,3079],[748,3079],[748,2909],[658,2909]],"sube":"+y","nota":"Sube hacia el frente hasta la puerta P-11. 11 escalones (Maxi, foto del 16/10; antes 10). Con los niveles del plano (+6,13 a +7,57) dan alzadas de 13: está por confirmar. 11 alzadas de 13,1 y pedadas de 17,0,"},
  {"id":"E-06","nivel":"P2","x":[100,189],"y":[2972,3079],"z":[613,757],"n":8,"nombre":"Escalerita al vestidor","conf":"modelo","estado":"existente","poly":[[100,3079],[189,3079],[189,2972],[100,2972]],"sube":"+y","nota":"SketchUp: del dormitorio a la puerta del vestidor; empinada. 8 alzadas de 18,0 y pedadas de 15,3,"},
  {"id":"E-07","nivel":"PB","x":[760,850],"y":[4216,3978.2],"z":[0,-198],"n":10,"nombre":"Escalera descubierta al subsuelo","conf":"plano","estado":"existente","poly":[[760,4216],[850,4216],[850,3978.2],[760,3978.2]],"sube":"-y","exterior":true,"nota":"Baja desde el jardín del frente (±0,00) a la puerta del subsuelo. Planta: 9 pedadas de 3,00 a 5,38. 10 alzadas de 19,8 y pedadas de 26,4,"},
];

export const BARANDAS = [
  {"id":"BA-1","nivel":"EP","nombre":"Baranda del entrepiso sobre el vacío","pts":[[650,2824],[315,2824],[315,2392]],"z":329,"h":100,"tipo":"madera","conf":"estimado","nota":"Baranda de madera sobre la doble altura (video 4839 s1–s5)."},
  {"id":"BA-2","nivel":"PB","nombre":"Baranda de la escalera E-02 (R1 y R4)","pts":[[748,3205],[748,2917],[850,2820],[659,2820]],"z":72,"h":90,"tipo":"madera","conf":"estimado","nota":"Madera + cables de acero, del diseño del 11/10: R1 a lo largo del tramo y R4 en el fondo del giro, hasta la BA-1. En el 3D está pieza por pieza (E2-…)."},
  {"id":"BA-3","nivel":"P1","nombre":"Baranda de la escalera E-04","pts":[[757.5,3084],[757.5,2834]],"z":417,"h":100,"tipo":"madera","sigue":"E-04","conf":"plano","nota":"«Baranda de escalera H 1,00 madera»."},
  {"id":"BA-4","nivel":"P2","nombre":"Baranda del hueco de la escalera en 2P","pts":[[755,2834],[755,3069]],"z":613,"h":100,"tipo":"madera","conf":"supuesto","nota":"Protege el hueco de la E-04 desde el descanso de 2P."},
  {"id":"BA-5","nivel":"P2","nombre":"Baranda de la escalerita E-06","pts":[[192,2972],[192,3074]],"z":613,"h":100,"tipo":"madera","sigue":"E-06","conf":"supuesto"},
];

export const DECK = [];

/* Techos: polígono en planta; z = [cara superior en el borde alto, en el borde bajo]; baja = hacia dónde. */
export const TECHOS = [
  {"id":"T-01","poly":[[-36,3091],[876,3091],[876,2330],[-36,2330]],"baja":"−y","pend":"12 %","mat":"chapa acanalada","z":[1009,917.7],"e":15,"estado":"existente","conf":"modelo","nombre":"Techo de chapa del bloque del fondo","nota":"SketchUp: de +10,13 junto al frente del bloque a +9,31 sobre el ventanal (10,8 %). El plano lo da al 12 % con alero de 1,00."},
  {"id":"T-02","poly":[[-15,3653],[223,3653],[223,3091],[-15,3091]],"baja":"−y","pend":"0 %","mat":"losa","z":[1064,1064],"e":12,"estado":"existente","conf":"modelo","nombre":"Techo del vestidor","nota":"SketchUp: plano a +10,92, con el tanque de agua encima."},
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
  {"id":"D-02","ref":["L-B1","E-01","E-07","M-20","M-21","M-22","SU-04"],"q":"El subsuelo no está en el SketchUp: lo dejé como en el plano (−1,98, con la escalera descubierta E-07 desde el frente). En tu SketchUp, en ese lugar del jardín hay unos escalones que bajan apenas a −0,19. ¿Existe el subsuelo y cómo se entra?"},
  {"id":"D-03","ref":["J-2","M-07","M-08","M-09"],"q":"El fondo del lote: usé 45,16 del croquis (23,3 m de jardín detrás del ventanal). ¿Está bien?"},
  {"id":"D-06","ref":["CL-1","CL-2"],"q":"Las claraboyas de la terraza no están en el SketchUp; las dejé donde las pone el plano. ¿Existen?"},
  {"id":"D-08","ref":["C-05","LO-13"],"q":"El poste de madera oscura junto al ventanal no está en el plano de estructura: lo puse bajo la punta de la viga VE-3, de 30 × 30. ¿Está ahí y es de esa sección?"},
  {"id":"D-12","ref":["LO-04","VE-1","VE-2"],"q":"Los cabios del entrepiso: el plano dice 135 × 45 (como los del techo, 120 × 40, que van de canto). Los puse de canto: 4,5 de ancho y 13,5 de alto. Me dijiste 14 de ancho: ¿van planos (14 × 4,5) o de canto?"},
  {"id":"D-13","ref":["M-50","E-04","E-05"],"q":"El muro M-50 (frente del bloque del fondo hacia la terraza, del SketchUp) cruza todo el ancho a +6,13, pero entre x 7,60 y la medianera N abajo está el hueco de la E-04: ahí no tiene dónde apoyar, y una viga a esa altura dejaría 1,66 de paso al arrancar la E-04. El plano de estructura (+6,13) sólo marca borde de 0,30 hasta la columna CN4. ¿Cómo es ese tramo: el muro arranca más arriba con un dintel, o no hay muro sobre la escalera?"},
  {"id":"D-14","ref":["E-01","M-24"],"q":"La E-01 (del subsuelo a PB, del SketchUp) llega a +0,72 junto al estar hundido (+0,22): el plano de PB no la dibuja. ¿Dónde sale exactamente la escalera del subsuelo en planta baja?"},
  {"id":"D-15","ref":["LO-13","LO-13c","SU-05"],"q":"En tu SketchUp, dentro del grupo de la cocina, hay un volumen de madera clara de 2,22 × 0,67 (x 0,18 a 2,40, a 24,6 del fondo del lote) que va de +3,16 hasta el techo: atraviesa el entrepiso sobre la cocina. ¿Qué es (biblioteca, placard, conducto de la campana) y dónde está? Si es un mueble sobre el entrepiso, arranca arriba de las tablas."},
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
  {"fecha":"2026-10-20","v":"0.10.13","txt":"M-51 (pared entre el dormitorio O y el baño de 2P): la punta ya no atraviesa el ventanal; se corta en diagonal siguiendo la inclinación del vidrio (Maxi)."},
  {"fecha":"2026-10-20","v":"0.10.12","txt":"Marcos del ventanal del contrafrente (todo el ventanal O, con sus hojas) en gris oscuro casi negro (Maxi). Las ventanas de 2P a la terraza quedan como estaban."},
  {"fecha":"2026-10-20","v":"0.10.11","txt":"Interruptor «Mover: sí / no» arriba a la derecha, como en Carhué. Las hojas del ventanal O se corren arrastrándolas y las persianas de la fachada se suben o bajan arrastrándolas; con «Mover: no» (o el candado de la hoja) no se mueven y arrastrar orbita."},
  {"fecha":"2026-10-19","v":"0.10.10","txt":"Versión del motor a la vista: abajo, junto a los fps, dice «motor» y el commit del último cambio del motor con que se armó la casa (motor compartido)."},
  {"fecha":"2026-10-19","v":"0.10.9","txt":"Selección de vértices, aristas y caras: con el filtro activo el toque ya no elige la pieza entera, y avisa cuando no hay vértice o arista cerca (motor compartido)."},
  {"fecha":"2026-10-19","v":"0.10.8","txt":"Capas: tocar afuera del panel lo cierra (motor compartido)."},
  {"fecha":"2026-10-18","v":"0.10.7","txt":"Piso de tablas de PB: sobre el estar hundido quedaban tablas volando a +0,72 encima de las del estar (+0,22). El recorte de cada tabla contra la losa no respetaba la muesca del estar; ahora se recorta bien. Motor al día: visor3d.js y marcas.js no se habían publicado en Arcos."},
  {"fecha":"2026-10-18","v":"0.10.6","txt":"La bañadera del 2P seguía asomando: la cara del ventanal se medía con los vértices de los vidrios, y a la altura de la bañadera no hay ninguno (los paños son planos entre filas de marcos), así que no la corría. Ahora se corta el ventanal con un plano a cada altura: la bañadera arranca a 24,0 del lote, detrás del vidrio. La prueba de intersecciones tampoco lo veía (un vidrio plano contra una cara contaba como «tocar»); corregida."},
  {"fecha":"2026-10-18","v":"0.10.5","txt":"Intersecciones (tu nota): la bañadera del 2P quedaba mitad afuera del ventanal, que desde +5,1 se inclina hacia adentro; ahora arranca donde el vidrio deja lugar a su altura, y el cajón de placa también. La viga V401 (hormigón 20 × 60 del plano de estructura, borde del 2P sobre el ventanal) y el borde de la losa del 2P pasan por dentro del vidrio. Prueba nueva intersecciones.mjs y guía 10 «Mirar las intersecciones»."},
  {"fecha":"2026-10-18","v":"0.10.4","txt":"Filtro de selección siempre a la vista: Objeto · Vértice · Arista · Cara."},
  {"fecha":"2026-10-18","v":"0.10.3","txt":"Motor: selección de vértices, aristas y caras como en un CAD (en la barra, dentro de «Seleccionar»), con filtro, resaltado al pasar el mouse y Shift para sumar; con dos elegidos da distancia o ángulo."},
  {"fecha":"2026-10-17","v":"0.10.2","txt":"Baño de 2P como en la obra (tu foto y tus respuestas): bañadera de mampostería a lo ancho contra el ventanal O con escalón y cajón de placa verde arriba, inodoro y bidet contra la pared de la escalera (E), bacha de apoyo sobre mesada de caño contra la medianera N. Se saca el baño del SketchUp (ducha y mampara contra el ventanal)."},
  {"fecha":"2026-10-16","v":"0.10.1","txt":"Tus fotos del 16/10: la escalera a la terraza tiene 11 escalones; entre el baño de 1P y la columna CN4 hay un muro con un vano cuadrado al entrepiso (M-47, P-15), que lleva el borde del 2P (se va la viga VF y la baranda supuesta BA-6). La puerta P-11 queda al nivel de la terraza."},
  {"fecha":"2026-10-16","v":"0.10.0","txt":"Las medidas pasan a salir del plano (corte A-A), no del SketchUp: entrepiso +3,29, 1P +4,17, 2P +6,13, terraza +7,57, estar hundido +0,22, techo al 12 % con 3,81 libres sobre el 2P y volumen del vestidor 3,07 sobre la terraza. Escaleras recalculadas: E-02 15 alzadas de 17,1, E-03 5, E-04 11, E-05 10 (Maxi), E-06 8, E-01 16. Las zancas apoyan en el piso y en el borde de arriba (E-04z flotaba). Estructura según el plano de estructura (hoja 3): columnas CN1, CN3, CE1, CN4, CNA1 y CNA2 y vigas V301, V302, V303, V307, V308, V309, V401, V408 y V410, cada una apoyada en lo que el plano dice. CN4 (la columna gris de la escalera) ya no flota: nace en la losa de 1P, pasa al lado de la E-03 y lleva el borde del 2P. El entrepiso es de madera y cuelga: tablas de 3 clavadas directo sobre cabios de 135 × 45 de canto, vigas de madera VE-1 a VE-3 y cinco tensores Ø16 (T1 a T5) desde las vigas del 2P; el poste de las fotos toma la punta. La E-03 pasa a 0,80 de ancho entre CN4 y la E-02 y arranca sobre el piso. Prueba nueva apoyos.mjs: nada flota ni atraviesa. Las hojas del ventanal O y las persianas ya se mueven desde el panel de la pieza (antes el control no aparecía). Los grupos del SketchUp que quedan se suben a los niveles del plano; el techo es el del plano."},
  {"fecha":"2026-10-16","v":"0.9.1","txt":"Comparación foto contra modelo, desde el mismo punto de vista: tirantes de madera a la vista bajo el entrepiso (F38-02 a F38-14) y cielorrasos menos oscuros de día (luz de relleno desde abajo)."},
  {"fecha":"2026-10-16","v":"0.9.0","txt":"Se mueven: las hojas del ventanal O de tu SketchUp, separadas sin rehacerlas (las cuatro corredizas de la PB, las dos del medio arriba y la ventilación del baño de 2P), y las persianas de la fachada E, que se enrollan. Tocá la pieza y usá «Correr» o «Persiana» en el panel; queda guardado en tu navegador."},
  {"fecha":"2026-10-16","v":"0.8.1","txt":"Vuelve el ventanal O de tu SketchUp tal cual (con sus paños de 1 × 1); se borra el que había rehecho, que estaba mal."},
  {"fecha":"2026-10-16","v":"0.8.0","txt":"Recorrido de todas las fotos: la fila alta del ventanal O va inclinada hacia adentro, como en el SketchUp y en F40-16; dinteles de hierro con antióxido sobre las dos arcadas de 1P (F39-20 a F39-22). Lo demás que muestran las fotos ya estaba (columna y viga del living, poste de madera, entrepiso y barandas, vanos de 1P, persianas, baño y ventanal de 2P); lo que no se puede resolver con las fotos quedó en las dudas."},
  {"fecha":"2026-10-15","v":"0.7.1","txt":"Ventanal del contrafrente O paño por paño: abajo cuatro hojas altas corredizas, al medio una fila de fijos, arriba las dos del medio corredizas y las de los costados fijas, y una ventilación corrediza chica en el baño de 2P (VO-…). Se saca la ventana interior V-07 del baño de 1P."},
  {"fecha":"2026-10-15","v":"0.7.0","txt":"Fachada E como en tu foto: revoque blanco, persianas de enrollar cerradas en las tres ventanas, entrada de dos hojas con tablillas, buña sobre la PB y cornisa bajo la terraza, balcón con la punta S redondeada y baranda de caños (contesta D-04), baranda de caños en la terraza y cerco al frente con pilares blancos, portón de malla negro y muro bajo con baranda. Se va el cerco de listones del SketchUp."},
  {"fecha":"2026-10-15","v":"0.6.0","txt":"Luces: downlights en todos los ambientes (grilla de ~3,30, al cielorraso de cada uno), aplique en el balcón E y proyectores a los dos jardines: tres en la fachada E hacia el jardín del frente, tres bajo la losa de 2P hacia el jardín O y tres en las medianeras a lo largo del jardín O. Interiores del atardecer a las 23:30, exteriores hasta la 01:00. Se ven moviendo el reloj de abajo a la noche."},
  {"fecha":"2026-10-15","v":"0.5.2","txt":"Zancas de todas las escaleras de madera (antes negras)."},
  {"fecha":"2026-10-15","v":"0.5.1","txt":"La página abre siempre de día (13 h de hoy). Antes tomaba la hora real y de noche se veía todo oscuro, porque esta casa todavía no tiene luces cargadas. El reloj de abajo sigue sirviendo para ver la noche."},
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

