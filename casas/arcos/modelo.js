/* Arcos 4264 (Núñez, CABA) — modelo de datos de la casa. Única fuente de verdad: el visor dibuja todo a partir de esto.
   Unidades: cm. x: 0 en el eje medianero izquierdo mirando desde Arcos, crece hacia la derecha (medianera derecha en 865).
   y: 0 en el fondo del lote, crece hacia Arcos; la línea municipal está en y 4516 (lote de 45,16 según el croquis).
   z: sobre el ±0,00 del plano (vereda). En el visor 3D: X = x, Y = z, Z = y.
   v0.2: lo que trae tu SketchUp (Arcos_55.dae, subido 58 cm) manda; lo que no trae sale del plano de regularización (hoja 01/04, 1:100).
   conf 'modelo' = del SketchUp; 'plano' = del plano; 'estimado' = interpretado; 'supuesto' = lo puse yo, a confirmar. */

export const META = {"nombre":"Arcos 4264","version":"0.3.1","fecha":"2026-10-15","resumen":"Casa de Arcos 4264 (Núñez, CABA) armada de tu SketchUp (Arcos_55.dae); lo que el SketchUp no trae (medianeras, tabiques, subsuelo) sale del plano de regularización.","ejes":"x: 0 en el eje medianero izquierdo (mirando desde Arcos), hacia la derecha. y: 0 en el fondo del lote, hacia Arcos (L.M. en y 45,16). z: sobre el ±0,00 del plano (vereda).","planta":{"vb":{"x":-400,"y":2000,"w":1700,"h":2700},"casa":{"cx":432,"cy":3400,"w":1300,"h":2400},"lote":{"cx":432,"cy":2258,"w":1300,"h":4900},"ejesExt":{"x0":-260,"x1":1100,"y0":-100,"y1":4700},"ghost":"PB","nivelesOrden":["SS","PB","EP","P1","P2","TZ","TE"],"spec":"casa <b>8,65 × 15,78</b> · lote <b>8,65 × 45,16</b> · 5 niveles"}};

export const NIVELES = {"SS":{"nombre":"Subsuelo","z":-198,"conf":"plano"},"PB":{"nombre":"Planta baja","z":72,"conf":"modelo","nota":"El estar hundido, a +0,19."},"EP":{"nombre":"Entrepiso","z":339,"conf":"modelo","nota":"Escritorio B7."},"P1":{"nombre":"Primer piso","z":409,"conf":"modelo"},"P2":{"nombre":"Segundo piso","z":607,"conf":"modelo","nota":"Dormitorio B13 y baño B12, bajo el techo de chapa."},"TZ":{"nombre":"Terraza","z":734,"conf":"modelo","nota":"Con el vestidor B14 al mismo nivel."},"TE":{"nombre":"Techos","z":0}};

/* Ejes: 'v' = vertical en planta (x fijo), 'h' = horizontal (y fijo). */
export const EJES = [
  {"id":"1","dir":"v","pos":0,"nota":"Eje medianero izquierdo (mirando desde Arcos)"},
  {"id":"2","dir":"v","pos":865,"nota":"Eje medianero derecho · frente 8,65"},
  {"id":"A","dir":"h","pos":4516,"nota":"Línea municipal (Arcos)"},
  {"id":"B","dir":"h","pos":4216,"nota":"Retiro de frente obligatorio, 3,00"},
  {"id":"C","dir":"h","pos":3909,"nota":"Fachada (cara exterior), 6,07 de la L.M."},
  {"id":"D","dir":"h","pos":3084,"nota":"Fin del bloque del frente · arranque del bloque del fondo"},
  {"id":"E","dir":"h","pos":2351,"nota":"Contrafrente (ventanal)"},
  {"id":"F","dir":"h","pos":600,"nota":"Retiro de fondo obligatorio, 6,00"},
  {"id":"G","dir":"h","pos":0,"nota":"Fondo del lote (45,16)"},
];

/* Muros: eje a→b, espesor e. z0 = base (si falta, el nivel); top = tope absoluto (número, o [en a, en b] si es inclinado). niveles = otros niveles donde se ve en la planta. */
export const MUROS = [
  {"id":"M-01","nivel":"PB","a":[0,3909],"b":[0,3085],"e":30,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"plano","nombre":"Medianera izquierda, bloque del frente","z0":0,"top":914,"niveles":["PB","P1","TZ"],"nota":"Eje medianero, 0,30. Arriba de la terraza sigue como «muro H 1,80 E 0,15» (dibujado de 0,30 hasta +9,37)."},
  {"id":"M-02","nivel":"PB","a":[865,3909],"b":[865,3085],"e":30,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"plano","nombre":"Medianera derecha, bloque del frente","z0":-198,"top":914,"niveles":["SS","PB","P1","TZ"],"nota":"Del lado del subsuelo baja hasta −1,98. Arriba de la terraza, 1,80."},
  {"id":"M-03","nivel":"PB","a":[0,3085],"b":[0,2351],"e":30,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"plano","nombre":"Medianera izquierda, bloque del fondo","z0":0,"top":[1012.4,933.1],"niveles":["PB","EP","P2"],"nota":"Hasta el techo de chapa (12 %)."},
  {"id":"M-04","nivel":"PB","a":[865,3085],"b":[865,2351],"e":30,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"plano","nombre":"Medianera derecha, bloque del fondo","z0":-198,"top":[1012.4,933.1],"niveles":["SS","PB","EP","P1","P2"],"nota":"Del lado de la escalera baja hasta el subsuelo (−1,98) hasta yd 16,48."},
  {"id":"M-05","nivel":"PB","a":[0,4516],"b":[0,3909],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Medianera izquierda, jardín del frente","z0":0,"top":200,"nota":"«Muro H 2,00 E 0,30»."},
  {"id":"M-06","nivel":"PB","a":[865,4516],"b":[865,3909],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Medianera derecha, jardín del frente","z0":-198,"top":200,"niveles":["SS","PB"],"nota":"«Muro H 2,00 E 0,30». Contiene la escalera descubierta al subsuelo."},
  {"id":"M-07","nivel":"PB","a":[0,2351],"b":[0,15],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Medianera izquierda, jardín del fondo","z0":57,"top":357,"nota":"«Muro H 3,00 E 0,30». El plano dibuja el fondo acortado; el largo sale del croquis (45,16)."},
  {"id":"M-08","nivel":"PB","a":[865,2351],"b":[865,15],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Medianera derecha, jardín del fondo","z0":57,"top":357,"nota":"«Muro H 3,00 E 0,30»."},
  {"id":"M-09","nivel":"PB","a":[-15,0],"b":[880,0],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Muro del fondo del lote","z0":57,"top":357,"nota":"«Muro H 3,00 E 0,30». Retiro de fondo obligatorio: 6,00."},
  {"id":"M-11","nivel":"PB","a":[12,3901.5],"b":[888,3901.5],"e":15,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"modelo","nombre":"Fachada","z0":41,"top":742,"niveles":["PB","P1","TZ"],"lbl":"abajo","nota":"SketchUp: cara a 6,07 de la L.M. (el plano la pone a 6,29), de +0,41 a +7,42; arriba sigue la pantalla de listones de la terraza."},
  {"id":"M-12","nivel":"PB","a":[15,2351],"b":[850,2351],"e":12,"tipo":"vidrio","carga":false,"estado":"existente","conf":"modelo","nombre":"Ventanal del contrafrente","z0":72,"top":914,"niveles":["PB","EP","P2"],"nota":"SketchUp: tres filas de paños repartidos (+0,81 a +4,92, +5,06 a +6,15 y +6,18 a +9,14). La carpintería con todos sus paños está en «Detalle del SketchUp».","modulos":4,"travesanos":[492,615]},
  {"id":"M-20","nivel":"SS","a":[312.5,3857],"b":[312.5,3068],"e":30,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"plano","nombre":"Subsuelo: muro izquierdo","top":54},
  {"id":"M-21","nivel":"SS","a":[297.6,3083],"b":[760,3083],"e":30,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"plano","nombre":"Subsuelo: muro del fondo","top":54},
  {"id":"M-22","nivel":"SS","a":[297.6,3872],"b":[850,3872],"e":30,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"plano","nombre":"Subsuelo: muro del frente","top":54,"lbl":"abajo"},
  {"id":"M-23","nivel":"SS","a":[745,3068],"b":[745,2883],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Subsuelo: muro de la escalera","top":54},
  {"id":"M-24","nivel":"SS","a":[729.9,2883],"b":[850,2883],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Subsuelo: muro al pie de la escalera","top":54},
  {"id":"M-25","nivel":"SS","a":[745,4216],"b":[745,3887],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"supuesto","nombre":"Muro de contención de la escalera descubierta","z0":-198,"top":0,"nota":"La planta dibuja la escalera entre 7,45 y 8,50; el muro que la contiene del lado del jardín no está acotado."},
  {"id":"M-30","nivel":"PB","a":[15,3451.6],"b":[205,3451.6],"e":10,"tipo":"tabique","carga":false,"estado":"existente","conf":"estimado","nombre":"Baño B5: pared al comedor","top":302,"nota":"Video 4838 (s7–s10): la caja del baño y el depósito termina en un borde a ~2,30 sobre el piso, no llega a la losa."},
  {"id":"M-31","nivel":"PB","a":[15,3281.5],"b":[205,3281.5],"e":10,"tipo":"tabique","carga":false,"estado":"existente","conf":"estimado","nombre":"Baño B5 / depósito B6","top":302,"nota":"Video 4838 (s7–s10): la caja del baño y el depósito termina en un borde a ~2,30 sobre el piso, no llega a la losa."},
  {"id":"M-32","nivel":"PB","a":[15,3071.5],"b":[205,3071.5],"e":10,"tipo":"tabique","carga":false,"estado":"existente","conf":"estimado","nombre":"Depósito B6: pared a la cocina","top":302,"nota":"Video 4838 (s7–s10): la caja termina a ~2,30 sobre el piso."},
  {"id":"M-33","nivel":"PB","a":[200,3457],"b":[200,3067],"e":10,"tipo":"tabique","carga":false,"estado":"existente","conf":"estimado","nombre":"Baño B5 y depósito B6: pared al comedor","top":302,"nota":"Video 4838 (s7–s10): la caja del baño y el depósito termina en un borde a ~2,30 sobre el piso, no llega a la losa."},
  {"id":"M-40","nivel":"EP","a":[15,3084],"b":[435,3084],"e":10,"tipo":"tabique","carga":false,"estado":"existente","conf":"plano","nombre":"Baño B8: pared al entrepiso","top":716,"niveles":["EP","P1"],"nota":"Divide el baño de 1P del entrepiso: arranca en el entrepiso."},
  {"id":"M-41","nivel":"P1","a":[426.5,3894],"b":[426.5,3079],"e":15,"tipo":"tabique","carga":false,"estado":"existente","conf":"plano","nombre":"Dormitorio B10 y baño B8: pared al palier","top":716},
  {"id":"M-42","nivel":"P1","a":[434,3452],"b":[850,3452],"e":12,"tipo":"tabique","carga":false,"estado":"existente","conf":"plano","nombre":"Dormitorio B11: pared al palier","top":716},
  {"id":"M-43","nivel":"P1","a":[15,3288],"b":[325,3288],"e":11,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Dormitorio B10 / baño B8","top":716,"nota":"Dibujado como «muro sin permiso». Entre 3,25 y 4,19 queda un paso sin pared: ¿es así? (D-11)"},
  {"id":"M-44","nivel":"P1","a":[412,3996],"b":[822,3996],"e":6,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"modelo","nombre":"Balcón: frente","z0":409,"top":471,"lbl":"abajo","nota":"SketchUp: 4,10 × 0,90, con frente de +3,83 a +4,71 (0,62 sobre el piso del balcón). El plano pide baranda de 1,00 (D-04)."},
  {"id":"M-45","nivel":"P1","a":[819,3993],"b":[819,3909],"e":6,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"modelo","nombre":"Balcón: costado derecho","z0":409,"top":471},
  {"id":"M-46","nivel":"P1","a":[415,3993],"b":[415,3909],"e":6,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"modelo","nombre":"Balcón: costado izquierdo","z0":409,"top":471},
  {"id":"M-50","nivel":"P2","a":[15,3085],"b":[850,3085],"e":12,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"modelo","nombre":"Bloque del fondo: frente a la terraza","top":1012.4,"niveles":["P2","TZ"],"nota":"SketchUp: muro bajo de +6,07 a +7,42 del lado del dormitorio y vidriado arriba; sube hasta el techo."},
  {"id":"M-51","nivel":"P2","a":[650,3069],"b":[650,2351],"e":15,"tipo":"tabique","carga":false,"estado":"existente","conf":"plano","nombre":"Dormitorio B13: pared a la escalera y al baño","top":[995.6,918.1]},
  {"id":"M-52","nivel":"P2","a":[658,2711.5],"b":[850,2711.5],"e":15,"tipo":"tabique","carga":false,"estado":"existente","conf":"plano","nombre":"Baño B12: pared a la escalera","top":957.0},
  {"id":"M-53","nivel":"TZ","a":[213,3653],"b":[213,3091],"e":20,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"modelo","nombre":"Vestidor B14: pared a la terraza","z0":734,"top":1092,"nota":"SketchUp: caja de 2,26 × 5,62 hasta +10,92; arriba, el tanque de agua."},
  {"id":"M-54","nivel":"TZ","a":[15,3643],"b":[223,3643],"e":20,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"modelo","nombre":"Vestidor B14: frente","z0":734,"top":1092},
  {"id":"M-55","nivel":"TZ","a":[0,3653],"b":[0,3091],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"modelo","nombre":"Vestidor B14: medianera","z0":914,"top":1092,"nota":"La medianera sube con la caja del vestidor."},
];

/* Aberturas: en el muro `muro`, a `d` cm del punto a, ancho w, alto h, antepecho s (cm sobre la base del muro). */
export const ABERTURAS = [
  {"id":"P-03","muro":"M-11","d":36,"w":280,"h":212,"s":35,"tipo":"puerta","estado":"existente","conf":"modelo","nombre":"Entrada (puerta y paño fijo)","nota":"SketchUp: 2,80 de ancho, de +0,76 a +2,88."},
  {"id":"V-01","muro":"M-11","d":552,"w":188,"h":114,"s":139,"tipo":"ventana","estado":"existente","conf":"modelo","nombre":"Ventana del comedor","nota":"SketchUp: de +1,80 a +2,94."},
  {"id":"V-02","muro":"M-11","d":118,"w":128,"h":102,"s":463,"tipo":"ventana","estado":"existente","conf":"modelo","nombre":"Ventana del dormitorio B10","nota":"SketchUp: de +5,04 a +6,06."},
  {"id":"V-03","muro":"M-11","d":552,"w":176,"h":188,"s":377,"tipo":"puerta","estado":"existente","conf":"modelo","nombre":"Puerta balcón del dormitorio B11","nota":"SketchUp: de +4,18 a +6,06, sale al balcón."},
  {"id":"V-04","muro":"M-22","d":132.5,"w":156.5,"h":90,"s":100,"tipo":"ventana","estado":"existente","conf":"supuesto","nombre":"Ventana del subsuelo al frente","nota":"La planta la marca (4,30 a 5,87) pero no hay alto en ningún corte: antepecho 1,00 y alto 0,90 supuestos. Da a tierra salvo que el frente esté hundido como en tu SketchUp (D-01, D-05)."},
  {"id":"P-04","muro":"M-22","d":464.4,"w":84,"h":200,"s":0,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta del subsuelo a la escalera descubierta","nota":"0,85. El corte A-A la muestra de −1,98 a ~0,00."},
  {"id":"P-05","muro":"M-30","d":90,"w":90,"h":200,"s":0,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta del baño B5"},
  {"id":"P-06","muro":"M-32","d":90,"w":90,"h":200,"s":0,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta del depósito B6"},
  {"id":"V-07","muro":"M-40","d":95,"w":220,"h":120,"s":170,"tipo":"ventana","estado":"existente","conf":"estimado","nombre":"Ventana interior del baño B8 al entrepiso","nota":"Video 4839 (s34–s35): desde el baño se ve el entrepiso y el ventanal. Posición y alto estimados del video."},
  {"id":"P-07","muro":"M-41","d":451,"w":80,"h":200,"s":0,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta del dormitorio B10"},
  {"id":"P-08","muro":"M-41","d":712,"w":80,"h":200,"s":0,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta del baño B8","nota":"El hueco va de 13,30 a 14,18; la hoja de ~0,80."},
  {"id":"P-09","muro":"M-42","d":0,"w":89,"h":200,"s":0,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta del dormitorio B11"},
  {"id":"P-10","muro":"M-50","d":85,"w":89,"h":200,"s":127,"tipo":"puerta","estado":"existente","conf":"modelo","nombre":"Puerta del vestidor B14","nota":"Arriba de la escalerita E-06."},
  {"id":"V-05","muro":"M-50","d":184,"w":426,"h":214,"s":135,"tipo":"ventana","estado":"existente","conf":"modelo","nombre":"Ventana del dormitorio B13 a la terraza","nota":"SketchUp: de +7,42 a +9,56, sobre el muro bajo."},
  {"id":"P-11","muro":"M-50","d":625,"w":192,"h":221,"s":126,"tipo":"puerta","estado":"existente","conf":"modelo","nombre":"Puerta y paño a la terraza","nota":"SketchUp: de +7,33 a +9,54, al final de la E-05."},
  {"id":"P-12","muro":"M-51","d":245,"w":90,"h":200,"s":0,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta del dormitorio B13"},
  {"id":"P-13","muro":"M-51","d":391,"w":90,"h":200,"s":0,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta del baño B12"},
];

/* Locales: polígono (cm), nivel, uso. Códigos B1…B14 del balance de superficies. */
export const LOCALES = [
  {"id":"L-B1","nivel":"SS","nombre":"Depósito de herramientas B1","poly":[[327.5,3857],[850,3857],[850,3098],[327.5,3098]],"conf":"plano","nota":"Balance: 7,59 × 5,22 = 39,61 m², a −1,98."},
  {"id":"L-B4","nivel":"PB","nombre":"Living comedor B4","poly":[[15,3894],[850,3894],[850,3067],[205,3067],[205,3457],[15,3457]],"conf":"estimado","nota":"Planta abierta con la cocina y el estar (112 m² entre los tres según el balance). Los límites entre ellos son míos."},
  {"id":"L-B3","nivel":"PB","nombre":"Cocina B3","poly":[[15,3067],[315,3067],[315,2351],[15,2351]],"conf":"estimado","nota":"Mesada contra la medianera izquierda e isla de 0,80 × 2,00 (planta)."},
  {"id":"L-B2","nivel":"PB","nombre":"Estar B2","poly":[[315,3067],[760,3067],[760,2865],[850,2865],[850,2351],[315,2351]],"conf":"estimado","nota":"Con el estar hundido (LO-03) y doble altura hasta la losa de 2P."},
  {"id":"L-B5","nivel":"PB","nombre":"Baño B5","poly":[[15,3446.5],[195,3446.5],[195,3286.5],[15,3286.5]],"conf":"plano","nota":"Balance: 1,80 × 1,60."},
  {"id":"L-B6","nivel":"PB","nombre":"Depósito B6","poly":[[15,3276.5],[195,3276.5],[195,3076.5],[15,3076.5]],"conf":"plano","nota":"Balance: 1,80 × 2,00."},
  {"id":"L-B7","nivel":"EP","nombre":"Escritorio B7","poly":[[15,3079],[659,3079],[659,2858],[315,2858],[315,2366],[15,2366]],"conf":"estimado","nota":"En L: franja de 2,50 junto a la escalera (Maxi) y franja de 3,00 sobre la cocina hasta el ventanal (video y plano), a +3,39."},
  {"id":"L-B8","nivel":"P1","nombre":"Baño B8","poly":[[15,3283],[419,3283],[419,3089],[15,3089]],"conf":"plano","nota":"Balance: 4,08 × 1,89."},
  {"id":"L-B9","nivel":"P1","nombre":"Palier B9","poly":[[434,3446],[850,3446],[850,3089],[434,3089]],"conf":"plano","nota":"Balance: 4,13 × 3,56."},
  {"id":"L-B10","nivel":"P1","nombre":"Dormitorio B10","poly":[[15,3894],[419,3894],[419,3294],[15,3294]],"conf":"plano","nota":"Balance: 4,08 × 5,69 (con el placard)."},
  {"id":"L-B11","nivel":"P1","nombre":"Dormitorio B11","poly":[[434,3894],[850,3894],[850,3458],[434,3458]],"conf":"plano","nota":"Balance: 4,13 × 4,02."},
  {"id":"L-BAL","nivel":"P1","nombre":"Balcón","poly":[[418,3993],[816,3993],[816,3909],[418,3909]],"conf":"modelo"},
  {"id":"L-B12","nivel":"P2","nombre":"Baño B12","poly":[[658,2704],[850,2704],[850,2351],[658,2351]],"conf":"plano","nota":"Balance: 1,92 × 3,15."},
  {"id":"L-B13","nivel":"P2","nombre":"Dormitorio B13","poly":[[15,3079],[643,3079],[643,2351],[15,2351]],"conf":"modelo","nota":"A +6,07 (SketchUp)."},
  {"id":"L-B14","nivel":"TZ","nombre":"Vestidor B14","poly":[[15,3633],[203,3633],[203,3091],[15,3091]],"conf":"modelo","nota":"SketchUp: a +7,34, al nivel de la terraza."},
  {"id":"L-TZ","nivel":"TZ","nombre":"Terraza accesible","poly":[[223,3894],[850,3894],[850,3091],[223,3091]],"conf":"modelo","nota":"A +7,34 (SketchUp), con pantalla de listones y pérgola sobre la escalera (ver «Detalle del SketchUp»)."},
];

/* Losas: z = cara superior, e = espesor, huecos = polígonos. */
export const LOSAS = [
  {"id":"LO-01","nivel":"SS","nombre":"Piso del subsuelo","z":-198,"e":12,"poly":[[327.5,3857],[850,3857],[850,2868],[760,2868],[760,3068],[327.5,3068]],"conf":"plano"},
  {"id":"LO-02","nivel":"PB","nombre":"Losa de planta baja","z":72,"e":18,"poly":[[15,3887],[850,3887],[850,2331],[15,2331]],"huecos":[[[760,3193],[850,3193],[850,2865],[760,2865]],[[386,2872],[831,2872],[831,2419],[386,2419]]],"conf":"modelo","nota":"SketchUp: de 6,29 a 21,85 de la L.M. Huecos: la escalera al subsuelo y el estar hundido."},
  {"id":"LO-03","nivel":"PB","nombre":"Estar hundido B2","z":19,"e":10,"poly":[[386,2872],[831,2872],[831,2419],[386,2419]],"conf":"modelo","nota":"SketchUp: 4,45 × 4,53 a +0,19 (0,53 más bajo). El plano lo da de 3,80 × 3,50 a +0,22."},
  {"id":"LO-04","nivel":"EP","nombre":"Entrepiso (escritorio B7)","z":339,"e":18,"poly":[[15,3108],[659,3108],[659,2858],[15,2858]],"conf":"medido","nota":"Maxi (nota 15/10): 2,50 de fondo, no 6,92. Ancho del SketchUp (de la medianera izquierda a la escalera, 6,31), a +3,39. Lo pegué al frente del bloque, junto a la escalera; detrás queda la doble altura sobre el estar hundido."},
  {"id":"LO-13","nivel":"EP","nombre":"Entrepiso sobre la cocina","z":339,"e":20,"poly":[[15,2858],[315,2858],[315,2366],[15,2366]],"conf":"estimado","nota":"Video 4838 (s7, s12–s14): tirantes de madera a la vista sobre la cocina hasta el ventanal, con un poste de madera oscura en la punta. El plano lo dibuja igual (3,00 de ancho, escritorio B7)."},
  {"id":"LO-11","nivel":"EP","nombre":"Descanso de la escalera y paso al entrepiso","z":339,"e":15,"poly":[[659,3009],[759,3009],[759,2829],[659,2829]],"conf":"modelo","nota":"SketchUp: plataforma a +3,39 entre el entrepiso y la E-03."},
  {"id":"LO-12","nivel":"EP","nombre":"Descanso de la E-02","z":322,"e":15,"poly":[[645,2918],[850,2918],[850,2825],[645,2825]],"conf":"modelo","nota":"SketchUp: +3,22, un escalón abajo del entrepiso."},
  {"id":"LO-05","nivel":"P1","nombre":"Losa del primer piso","z":409,"e":18,"poly":[[15,3887],[850,3887],[850,3084],[15,3084]],"conf":"modelo"},
  {"id":"LO-06","nivel":"P1","nombre":"Balcón","z":409,"e":26,"poly":[[412,3999],[822,3999],[822,3909],[412,3909]],"conf":"modelo","nota":"SketchUp: 4,10 × 0,90."},
  {"id":"LO-07","nivel":"P2","nombre":"Losa del segundo piso","z":607,"e":18,"poly":[[15,3084],[850,3084],[850,2351],[15,2351]],"huecos":[[[760,3084],[850,3084],[850,2834],[760,2834]]],"conf":"modelo"},
  {"id":"LO-08","nivel":"TZ","nombre":"Losa de la terraza","z":734,"e":32,"poly":[[15,3894],[850,3894],[850,3091],[15,3091]],"huecos":[[[246,3233],[346,3233],[346,3133],[246,3133]],[[542,3327],[644,3327],[644,3227],[542,3227]]],"conf":"modelo","nota":"SketchUp: +7,34. Las claraboyas siguen la posición del plano."},
  {"id":"LO-10","nivel":"PB","nombre":"Galería del contrafrente","z":72,"e":15,"poly":[[15,2331],[850,2331],[850,2266],[15,2266]],"conf":"plano","nota":"«0,90» más allá de la carpintería, a +0,72."},
];

export const CLARABOYAS = [
  {"id":"CL-1","nivel":"TZ","nombre":"Claraboya sobre el baño B8","poly":[[246,3233],[346,3233],[346,3133],[246,3133]],"z":759,"conf":"plano","nota":"1,00 × 1,00, del plano."},
  {"id":"CL-2","nivel":"TZ","nombre":"Claraboya sobre el palier B9","poly":[[542,3327],[644,3327],[644,3227],[542,3227]],"z":759,"conf":"plano","nota":"1,00 × 1,00, del plano."},
];

export const ESTRUCTURA = [
  {"id":"C-01","tipo":"columna","nivel":"PB","pos":[406,3447],"sec":"20×20","z":[72,389],"conf":"plano","estado":"existente","nombre":"Columna del comedor","nota":"Planta baja, en la línea de la viga (yd 10,69)."},
  {"id":"C-02","tipo":"columna","nivel":"PB","pos":[25,2567],"sec":"20×20","z":[72,589],"conf":"plano","estado":"existente","nombre":"Pilastra izquierda del estar"},
  {"id":"C-03","tipo":"columna","nivel":"PB","pos":[838.5,2567],"sec":"20×20","z":[72,589],"conf":"plano","estado":"existente","nombre":"Pilastra derecha del estar"},
  {"id":"C-04","tipo":"columna","nivel":"P1","pos":[678,3079],"sec":"20×20","z":[339,589],"conf":"plano","estado":"existente","nombre":"Columna de la escalera","nota":"En el borde del palier de 1P."},
  {"id":"C-05","tipo":"columna","nivel":"PB","pos":[300,2436],"sec":"30×30","z":[72,319],"conf":"estimado","estado":"existente","nombre":"Poste de madera oscura","nota":"Video 4838 (s12–s14): poste de madera maciza oscura bajo la punta del entrepiso, cerca del ventanal. Posición estimada del video."},
  {"id":"VG-1","tipo":"viga","nivel":"PB","a":[15,3447],"b":[850,3447],"sec":"20×40","z":389,"conf":"supuesto","estado":"existente","nombre":"Viga del comedor","nota":"La planta la marca con línea de trazos; la sección es supuesta."},
];

/* Escaleras rectas: x = [izq, der]; y = [primera alzada, última alzada]; z = [salida, llegada]; n = alzadas. */
export const ESCALERAS = [
  {"id":"E-01","nivel":"SS","x":[763,850],"y":[3255,2865],"z":[-198,72],"n":15,"nombre":"Escalera del subsuelo a planta baja","conf":"modelo","estado":"existente","poly":[[763,3255],[850,3255],[850,2865],[763,2865]],"sube":"-y","nota":"SketchUp hasta −1,19; el tramo de abajo y el subsuelo no están en el SketchUp (plano). 15 alzadas de 18,0 y pedadas de 27,9,"},
  {"id":"E-02","nivel":"PB","x":[759,849],"y":[3218,2918],"z":[72,322],"n":13,"nombre":"Escalera de planta baja al entrepiso","conf":"modelo","estado":"existente","poly":[[759,3218],[849,3218],[849,2918],[759,2918]],"sube":"-y","nota":"SketchUp: 12 pedadas de 25 hasta el descanso de +3,22. 13 alzadas de 19,2 y pedadas de 25,0,"},
  {"id":"E-03","nivel":"EP","x":[667,752],"y":[3009,3084],"z":[339,409],"n":4,"nombre":"Escalera del entrepiso al primer piso","conf":"modelo","estado":"existente","poly":[[667,3084],[752,3084],[752,3009],[667,3009]],"sube":"+y","nota":"SketchUp: sube hacia el frente, al palier B9. 4 alzadas de 17,5 y pedadas de 25,0,"},
  {"id":"E-04","nivel":"P1","x":[760,850],"y":[3084,2834],"z":[409,607],"n":11,"nombre":"Escalera del primer piso al segundo","conf":"modelo","estado":"existente","poly":[[760,3084],[850,3084],[850,2834],[760,2834]],"sube":"-y","nota":"SketchUp: sube hacia el fondo, sobre la E-02. 11 alzadas de 18,0 y pedadas de 25,0,"},
  {"id":"E-05","nivel":"P2","x":[646,736],"y":[2909,3084],"z":[607,734],"n":8,"nombre":"Escalera del segundo piso a la terraza","conf":"modelo","estado":"existente","poly":[[646,3084],[736,3084],[736,2909],[646,2909]],"sube":"+y","nota":"SketchUp: sube hacia el frente hasta la puerta P-11. 8 alzadas de 15,9 y pedadas de 25,0,"},
  {"id":"E-06","nivel":"P2","x":[100,189],"y":[2972,3070],"z":[607,734],"n":7,"nombre":"Escalerita al vestidor B14","conf":"modelo","estado":"existente","poly":[[100,3070],[189,3070],[189,2972],[100,2972]],"sube":"+y","nota":"SketchUp: del dormitorio a la puerta del vestidor; empinada. 7 alzadas de 18,1 y pedadas de 16,3,"},
  {"id":"E-07","nivel":"PB","x":[760,850],"y":[4216,3978.2],"z":[0,-198],"n":10,"nombre":"Escalera descubierta al subsuelo","conf":"plano","estado":"existente","poly":[[760,4216],[850,4216],[850,3978.2],[760,3978.2]],"sube":"-y","exterior":true,"nota":"Baja desde el jardín del frente (±0,00) a la puerta del subsuelo. Planta: 9 pedadas de 3,00 a 5,38. 10 alzadas de 19,8 y pedadas de 26,4,"},
];

export const BARANDAS = [
  {"id":"BA-1","nivel":"EP","nombre":"Baranda del entrepiso sobre el vacío","pts":[[659,2825],[659,2858],[315,2858],[315,2366]],"z":339,"h":100,"tipo":"madera","conf":"estimado","nota":"Baranda de madera sobre la doble altura (video 4839 s1–s5)."},
  {"id":"BA-2","nivel":"PB","nombre":"Baranda de la escalera E-02","pts":[[755,3226],[755,2918]],"z":72,"h":100,"tipo":"madera","sigue":"E-02","conf":"plano","nota":"«Baranda de escalera H 1,00 madera E 0,05»."},
  {"id":"BA-3","nivel":"P1","nombre":"Baranda de la escalera E-04","pts":[[755,3084],[755,2834]],"z":409,"h":100,"tipo":"madera","sigue":"E-04","conf":"plano","nota":"«Baranda de escalera H 1,00 madera»."},
  {"id":"BA-4","nivel":"P2","nombre":"Baranda del hueco de la escalera en 2P","pts":[[755,2834],[755,3069]],"z":607,"h":100,"tipo":"madera","conf":"supuesto","nota":"Protege el hueco de la E-04 desde el descanso de 2P."},
  {"id":"BA-5","nivel":"P2","nombre":"Baranda de la escalerita E-06","pts":[[189,2972],[189,3070]],"z":607,"h":100,"tipo":"madera","sigue":"E-06","conf":"supuesto"},
];

export const DECK = [];

/* Techos: polígono en planta; z = [cara superior en el borde alto, en el borde bajo]; baja = hacia dónde. */
export const TECHOS = [
  {"id":"T-01","poly":[[-36,3091],[876,3091],[876,2330],[-36,2330]],"baja":"−y","pend":"10,8 %","mat":"chapa acanalada","z":[1013,930.8],"e":15,"estado":"existente","conf":"modelo","nombre":"Techo de chapa del bloque del fondo","nota":"SketchUp: de +10,13 junto al frente del bloque a +9,31 sobre el ventanal (10,8 %). El plano lo da al 12 % con alero de 1,00."},
  {"id":"T-02","poly":[[-15,3653],[223,3653],[223,3091],[-15,3091]],"baja":"−y","pend":"0 %","mat":"losa","z":[1092,1092],"e":12,"estado":"existente","conf":"modelo","nombre":"Techo del vestidor B14","nota":"SketchUp: plano a +10,92, con el tanque de agua encima."},
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
  {"id":"D-10","ref":["T-01"],"q":"En el video del 2P el techo tiene cabriadas metálicas reticuladas a la vista; tu SketchUp sólo trae la chapa y unas correas. ¿Cuántas cabriadas hay y cada cuánto?"},
];

export const VIDEO = [];

export const CAMBIOS = [
  {"fecha":"2026-10-15","v":"0.3.1","txt":"Vistas: «Guardar vista actual» ahora pide el nombre y la vista guardada aparece en la lista (antes se guardaba sin aviso y no se veía). La lista muestra también las vistas fijas; ⟳ actualiza, × borra."},
  {"fecha":"2026-10-15","v":"0.3.0","txt":"Lo que muestran tus videos de obra: entrepiso de madera en L (franja de 2,50 junto a la escalera y franja de 3,00 sobre la cocina hasta el ventanal, con baranda), poste de madera oscura bajo su punta, caja del baño y el depósito de PB hasta ~2,30, ventana interior del baño de 1P al entrepiso, chapa sinusoidal con su estructura del SketchUp en lugar del techo liso. Tres dudas nuevas (D-08 a D-10)."},
  {"fecha":"2026-10-15","v":"0.2.2","txt":"Borrar ya no es un ícono de la barra: está en el inspector, con «Borrar pieza» y, si la pieza tiene varias partes, «Borrar sólo esta parte» (la que tocaste). Se deshace con Ctrl/⌘ Z."},
  {"fecha":"2026-10-15","v":"0.2.1","txt":"Tu nota en LO-04: el entrepiso pasa a 2,50 de fondo (era 6,92), pegado al frente del bloque del fondo junto a la escalera; vuelve la doble altura sobre el estar hundido. Baranda sobre el borde nuevo."},
  {"fecha":"2026-10-15","v":"0.2.0","txt":"La casa pasa a salir de tu SketchUp: niveles (entrepiso +3,39, 1P +4,09, 2P +6,07, terraza +7,34), fachada con sus aberturas (entrada de 2,80, puerta balcón), balcón, entrepiso grande, estar hundido, escaleras, vestidor con tanque, techo al 10,8 % y ventanal. Lo que el SketchUp no trae (medianeras, tabiques, subsuelo, claraboyas) sigue del plano. Nueva capa «Detalle del SketchUp»: ventanal repartido, pantalla de listones y pérgola de la terraza, jardín del frente en pendiente, cerco, cocina y baños."},
  {"fecha":"2026-10-15","v":"0.1.0","txt":"Primera versión de Arcos 4264 desde el plano de regularización (hoja 01/04, escala 1:100): subsuelo, planta baja con estar hundido, entrepiso, primer piso, segundo piso, terraza y vestidor; techo de chapa al 12 %. Escaleras ubicadas con tu SketchUp. Tu SketchUp va como calco (gris) en 3D y en planta."},
];

