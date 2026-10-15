/* Arcos 4264 (Núñez, CABA) — modelo de datos de la casa. Única fuente de verdad: el visor dibuja todo a partir de esto.
   Unidades: cm. x: 0 en el eje medianero izquierdo mirando desde Arcos, crece hacia la derecha (medianera derecha en 865).
   y: 0 en el fondo del lote, crece hacia Arcos; la línea municipal está en y 4516 (lote de 45,16 según el croquis).
   z: sobre el ±0,00 del plano (vereda). En el visor 3D: X = x, Y = z, Z = y.
   v0.1: geometría tomada del plano de regularización (hoja 01/04, 1:100). conf 'plano' = sale del plano;
   'modelo' = de tu SketchUp (Arcos_55.dae); 'estimado' = interpretado; 'supuesto' = lo puse yo, a confirmar. */

export const META = {"nombre":"Arcos 4264","version":"0.1.0","fecha":"2026-10-15","resumen":"Casa de Arcos 4264 (Núñez, CABA) armada del plano de regularización (EX-2024-29919671-GCABA-DGROC, hoja 01/04) a escala 1:100, con tu SketchUp como calco.","ejes":"x: 0 en el eje medianero izquierdo (mirando desde Arcos), hacia la derecha. y: 0 en el fondo del lote, hacia Arcos (L.M. en y 45,16). z: sobre el ±0,00 del plano (vereda).","planta":{"vb":{"x":-400,"y":2000,"w":1700,"h":2700},"ejesExt":{"x0":-260,"x1":1100,"y0":-100,"y1":4700},"ghost":"PB","nivelesOrden":["SS","PB","EP","P1","P2","TZ","TE"],"casa":{"cx":432,"cy":3400,"w":1300,"h":2400},"lote":{"cx":432,"cy":2258,"w":1300,"h":4900},"spec":"casa <b>8,65 × 15,13</b> · lote <b>8,65 × 45,16</b> · 5 niveles"}};

export const NIVELES = {"SS":{"nombre":"Subsuelo","z":-198,"conf":"plano"},"PB":{"nombre":"Planta baja","z":72,"conf":"plano","nota":"El estar hundido, a +0,22."},"EP":{"nombre":"Entrepiso","z":329,"conf":"plano","nota":"Escritorio B7, sobre la cocina."},"P1":{"nombre":"Primer piso","z":417,"conf":"plano"},"P2":{"nombre":"Segundo piso","z":613,"conf":"plano","nota":"Dormitorio B13 y baño B12, bajo el techo de chapa."},"TZ":{"nombre":"Terraza","z":757,"conf":"plano","nota":"Vestidor B14 a +7,65."},"TE":{"nombre":"Techos","z":0}};

/* Ejes: 'v' = vertical en planta (x fijo), 'h' = horizontal (y fijo). */
export const EJES = [
  {"id":"1","dir":"v","pos":0,"nota":"Eje medianero izquierdo (mirando desde Arcos)"},
  {"id":"2","dir":"v","pos":865,"nota":"Eje medianero derecho · frente 8,65"},
  {"id":"A","dir":"h","pos":4516,"nota":"Línea municipal (Arcos)"},
  {"id":"B","dir":"h","pos":4216,"nota":"Retiro de frente obligatorio, 3,00"},
  {"id":"C","dir":"h","pos":3886.6,"nota":"Fachada (cara exterior), 6,29 de la L.M."},
  {"id":"D","dir":"h","pos":3084,"nota":"Fin del bloque del frente · arranque del bloque del fondo"},
  {"id":"E","dir":"h","pos":2374,"nota":"Contrafrente (ventanal)"},
  {"id":"F","dir":"h","pos":600,"nota":"Retiro de fondo obligatorio, 6,00"},
  {"id":"G","dir":"h","pos":0,"nota":"Fondo del lote (45,16)"},
];

/* Muros: eje a→b, espesor e. z0 = base (si falta, el nivel); top = tope absoluto (número, o [en a, en b] si es inclinado). niveles = otros niveles donde se ve en la planta. */
export const MUROS = [
  {"id":"M-01","nivel":"PB","a":[0,3886.6],"b":[0,3084],"e":30,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"plano","nombre":"Medianera izquierda, bloque del frente","z0":0,"top":937,"niveles":["PB","P1","TZ"],"nota":"Eje medianero, 0,30. Arriba de la terraza sigue como «muro H 1,80 E 0,15» (dibujado de 0,30 hasta +9,37)."},
  {"id":"M-02","nivel":"PB","a":[865,3886.6],"b":[865,3084],"e":30,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"plano","nombre":"Medianera derecha, bloque del frente","z0":-198,"top":937,"niveles":["SS","PB","P1","TZ"],"nota":"Del lado del subsuelo baja hasta −1,98. Arriba de la terraza, 1,80."},
  {"id":"M-03","nivel":"PB","a":[0,3084],"b":[0,2374],"e":30,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"plano","nombre":"Medianera izquierda, bloque del fondo","z0":0,"top":[995.0,909.8],"niveles":["PB","EP","P2"],"nota":"Hasta el techo de chapa (12 %)."},
  {"id":"M-04","nivel":"PB","a":[865,3084],"b":[865,2374],"e":30,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"plano","nombre":"Medianera derecha, bloque del fondo","z0":-198,"top":[995.0,909.8],"niveles":["SS","PB","EP","P1","P2"],"nota":"Del lado de la escalera baja hasta el subsuelo (−1,98) hasta yd 16,48."},
  {"id":"M-05","nivel":"PB","a":[0,4516],"b":[0,3886.6],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Medianera izquierda, jardín del frente","z0":0,"top":200,"nota":"«Muro H 2,00 E 0,30»."},
  {"id":"M-06","nivel":"PB","a":[865,4516],"b":[865,3886.6],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Medianera derecha, jardín del frente","z0":-198,"top":200,"niveles":["SS","PB"],"nota":"«Muro H 2,00 E 0,30». Contiene la escalera descubierta al subsuelo."},
  {"id":"M-07","nivel":"PB","a":[0,2374],"b":[0,15],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Medianera izquierda, jardín del fondo","z0":57,"top":357,"nota":"«Muro H 3,00 E 0,30». El plano dibuja el fondo acortado; el largo sale del croquis (45,16)."},
  {"id":"M-08","nivel":"PB","a":[865,2374],"b":[865,15],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Medianera derecha, jardín del fondo","z0":57,"top":357,"nota":"«Muro H 3,00 E 0,30»."},
  {"id":"M-09","nivel":"PB","a":[-15,0],"b":[880,0],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Muro del fondo del lote","z0":57,"top":357,"nota":"«Muro H 3,00 E 0,30». Retiro de fondo obligatorio: 6,00."},
  {"id":"M-10","nivel":"PB","a":[15,4508.5],"b":[850,4508.5],"e":15,"tipo":"cerco","carga":false,"estado":"existente","conf":"modelo","nombre":"Cerco sobre la línea municipal","z0":0,"top":270,"nota":"El plano no da la altura: tomé 2,70 de tu SketchUp («cerco_vereda»)."},
  {"id":"M-11","nivel":"PB","a":[15,3871.5],"b":[850,3871.5],"e":30,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"plano","nombre":"Fachada","z0":0,"top":857,"niveles":["PB","P1","TZ"],"lbl":"abajo","nota":"Revestimiento plástico. Remata en la baranda de la terraza («muro H 1,00»), a +8,57."},
  {"id":"M-12","nivel":"PB","a":[15,2374],"b":[850,2374],"e":12,"tipo":"vidrio","carga":false,"estado":"existente","conf":"plano","nombre":"Ventanal del contrafrente","z0":72,"top":843,"niveles":["PB","EP","P2"],"nota":"Carpintería de aluminio de piso a techo: 4 módulos de ~2,09, travesaños a +4,85 y +6,06/+6,25 (vista del contrafrente)."},
  {"id":"M-13","nivel":"PB","a":[15,2374],"b":[850,2374],"e":20,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Faja sobre el ventanal","z0":843,"top":909.8,"niveles":["P2"],"nota":"Entre el ventanal (+8,43) y el techo."},
  {"id":"M-20","nivel":"SS","a":[312.5,3857],"b":[312.5,3068],"e":30,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"plano","nombre":"Subsuelo: muro izquierdo","top":54},
  {"id":"M-21","nivel":"SS","a":[297.6,3083],"b":[760,3083],"e":30,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"plano","nombre":"Subsuelo: muro del fondo","top":54},
  {"id":"M-22","nivel":"SS","a":[297.6,3872],"b":[850,3872],"e":30,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"plano","nombre":"Subsuelo: muro del frente","top":54,"lbl":"abajo"},
  {"id":"M-23","nivel":"SS","a":[745,3068],"b":[745,2883],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Subsuelo: muro de la escalera","top":54},
  {"id":"M-24","nivel":"SS","a":[729.9,2883],"b":[850,2883],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Subsuelo: muro al pie de la escalera","top":54},
  {"id":"M-25","nivel":"SS","a":[745,4216],"b":[745,3887],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"supuesto","nombre":"Muro de contención de la escalera descubierta","z0":-198,"top":0,"nota":"La planta dibuja la escalera entre 7,45 y 8,50; el muro que la contiene del lado del jardín no está acotado."},
  {"id":"M-30","nivel":"PB","a":[15,3451.6],"b":[205,3451.6],"e":10,"tipo":"tabique","carga":false,"estado":"existente","conf":"plano","nombre":"Baño B5: pared al comedor","top":399},
  {"id":"M-31","nivel":"PB","a":[15,3281.5],"b":[205,3281.5],"e":10,"tipo":"tabique","carga":false,"estado":"existente","conf":"plano","nombre":"Baño B5 / depósito B6","top":399},
  {"id":"M-32","nivel":"PB","a":[15,3071.5],"b":[205,3071.5],"e":10,"tipo":"tabique","carga":false,"estado":"existente","conf":"plano","nombre":"Depósito B6: pared a la cocina","top":311},
  {"id":"M-33","nivel":"PB","a":[200,3457],"b":[200,3067],"e":10,"tipo":"tabique","carga":false,"estado":"existente","conf":"plano","nombre":"Baño B5 y depósito B6: pared al comedor","top":399},
  {"id":"M-40","nivel":"EP","a":[15,3084],"b":[435,3084],"e":10,"tipo":"tabique","carga":false,"estado":"existente","conf":"plano","nombre":"Baño B8: pared al escritorio","top":739,"niveles":["EP","P1"],"nota":"Divide el baño de 1P (+4,17) del escritorio del entrepiso (+3,29): arranca en el entrepiso."},
  {"id":"M-41","nivel":"P1","a":[426.5,3857],"b":[426.5,3079],"e":15,"tipo":"tabique","carga":false,"estado":"existente","conf":"plano","nombre":"Dormitorio B10 y baño B8: pared al palier","top":739},
  {"id":"M-42","nivel":"P1","a":[434,3452],"b":[850,3452],"e":12,"tipo":"tabique","carga":false,"estado":"existente","conf":"plano","nombre":"Dormitorio B11: pared al palier","top":739},
  {"id":"M-43","nivel":"P1","a":[15,3288],"b":[325,3288],"e":11,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Dormitorio B10 / baño B8","top":739,"nota":"Dibujado como «muro sin permiso». Entre 3,25 y 4,19 queda un paso sin pared: ¿es así? (D-11)"},
  {"id":"M-44","nivel":"P1","a":[466,3989],"b":[782,3989],"e":20,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Balcón: baranda de mampostería","z0":417,"top":517,"lbl":"abajo","nota":"«Baranda de mampostería H 1,00 E 0,15»."},
  {"id":"M-45","nivel":"P1","a":[772,3979],"b":[772,3886.6],"e":20,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Balcón: baranda derecha","z0":417,"top":517},
  {"id":"M-46","nivel":"P1","a":[474,3979],"b":[474,3886.6],"e":15,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"supuesto","nombre":"Balcón: baranda izquierda","z0":417,"top":517,"nota":"La planta dibuja este lado con línea fina; la supuse de mampostería como la del frente."},
  {"id":"M-50","nivel":"P2","a":[15,3084],"b":[850,3084],"e":30,"tipo":"ladrillo","carga":true,"estado":"existente","conf":"plano","nombre":"Bloque del fondo: frente a la terraza","top":1020,"niveles":["P2","TZ"],"nota":"Revestimiento plástico. Sube hasta +10,20 (2,63 sobre la terraza, corte B-B)."},
  {"id":"M-51","nivel":"P2","a":[650,3069],"b":[650,2374],"e":15,"tipo":"tabique","carga":false,"estado":"existente","conf":"plano","nombre":"Dormitorio B13: pared a la escalera y al baño","top":[978.2,894.8]},
  {"id":"M-52","nivel":"P2","a":[658,2711.5],"b":[850,2711.5],"e":15,"tipo":"tabique","carga":false,"estado":"existente","conf":"plano","nombre":"Baño B12: pared a la escalera","top":935.3},
  {"id":"M-53","nivel":"TZ","a":[198,3458],"b":[198,3084],"e":20,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Vestidor B14: pared a la terraza","z0":757,"top":[1064,1017.25],"nota":"Caja de revestimiento plástico hasta +10,64 (3,07 sobre la terraza)."},
  {"id":"M-54","nivel":"TZ","a":[15,3446.5],"b":[208,3446.5],"e":20,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Vestidor B14: frente","z0":757,"top":1064},
  {"id":"M-55","nivel":"TZ","a":[0,3458],"b":[0,3084],"e":30,"tipo":"ladrillo","carga":false,"estado":"existente","conf":"plano","nombre":"Vestidor B14: medianera","z0":937,"top":[1064,1017.25],"nota":"La medianera sube con la caja del vestidor."},
];

/* Aberturas: en el muro `muro`, a `d` cm del punto a, ancho w, alto h, antepecho s (cm sobre la base del muro). */
export const ABERTURAS = [
  {"id":"P-01","muro":"M-10","d":98,"w":190,"h":270,"s":0,"tipo":"portón","estado":"existente","conf":"plano","nombre":"Portón doble de entrada","nota":"1,90 de ancho."},
  {"id":"P-02","muro":"M-10","d":708,"w":100,"h":270,"s":0,"tipo":"portón","estado":"existente","conf":"plano","nombre":"Portón a la escalera descubierta","nota":"1,00 de ancho."},
  {"id":"P-03","muro":"M-11","d":98,"w":185,"h":198,"s":72,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta de entrada (chapa doblada, dos hojas)","nota":"Planta: 1,85 entre 1,13 y 2,98. Alto de la vista: +0,72 a +2,70."},
  {"id":"V-01","muro":"M-11","d":426.7,"w":276.0,"h":93,"s":176,"tipo":"ventana","estado":"existente","conf":"plano","nombre":"Ventana del comedor","nota":"Ancho de la planta (4,42 a 7,18). La vista del frente la dibuja más a la derecha (4,85 a 7,85): ver D-07. Alto de la vista: +1,76 a +2,69."},
  {"id":"V-02","muro":"M-11","d":73,"w":240,"h":101,"s":515,"tipo":"ventana","estado":"existente","conf":"plano","nombre":"Ventana del dormitorio B10","nota":"Vista: +5,15 a +6,16."},
  {"id":"V-03","muro":"M-11","d":524,"w":190,"h":100,"s":514,"tipo":"ventana","estado":"existente","conf":"plano","nombre":"Ventana del dormitorio B11 al balcón","nota":"Vista: +5,14 a +6,14, sobre la baranda del balcón. ¿Cómo se sale al balcón? (D-04)"},
  {"id":"V-04","muro":"M-22","d":132.5,"w":156.5,"h":90,"s":100,"tipo":"ventana","estado":"existente","conf":"supuesto","nombre":"Ventana del subsuelo al frente","nota":"La planta la marca (4,30 a 5,87) pero no hay alto en ningún corte: antepecho 1,00 y alto 0,90 supuestos. Da a tierra salvo que el frente esté hundido como en tu SketchUp (D-01, D-05)."},
  {"id":"P-04","muro":"M-22","d":464.4,"w":84,"h":200,"s":0,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta del subsuelo a la escalera descubierta","nota":"0,85. El corte A-A la muestra de −1,98 a ~0,00."},
  {"id":"P-05","muro":"M-30","d":90,"w":90,"h":200,"s":0,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta del baño B5"},
  {"id":"P-06","muro":"M-32","d":90,"w":90,"h":200,"s":0,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta del depósito B6"},
  {"id":"P-07","muro":"M-41","d":414,"w":80,"h":200,"s":0,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta del dormitorio B10"},
  {"id":"P-08","muro":"M-41","d":675,"w":80,"h":200,"s":0,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta del baño B8","nota":"El hueco va de 13,30 a 14,18; la hoja de ~0,80."},
  {"id":"P-09","muro":"M-42","d":0,"w":89,"h":200,"s":0,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta del dormitorio B11"},
  {"id":"P-10","muro":"M-50","d":0,"w":95,"h":200,"s":152,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta del vestidor B14","nota":"Desde el descanso de la escalerita (+7,65)."},
  {"id":"V-05","muro":"M-50","d":196,"w":432,"h":130,"s":244,"tipo":"ventana","estado":"existente","conf":"plano","nombre":"Ventana alta del dormitorio B13 a la terraza","nota":"Vista del frente: +8,57 a +9,87 (1,00 sobre la terraza; 2,44 sobre el piso del dormitorio)."},
  {"id":"P-11","muro":"M-50","d":647,"w":95,"h":200,"s":144,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta a la terraza","nota":"Planta. La vista del frente dibuja una ventana corrida de 6,61 a 8,51 (D-08)."},
  {"id":"V-06","muro":"M-50","d":742,"w":93,"h":130,"s":244,"tipo":"ventana","estado":"existente","conf":"plano","nombre":"Ventana alta de la escalera a la terraza","nota":"Vista del frente: +8,57 a +9,87."},
  {"id":"P-12","muro":"M-51","d":245,"w":90,"h":200,"s":0,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta del dormitorio B13"},
  {"id":"P-13","muro":"M-51","d":391,"w":90,"h":200,"s":0,"tipo":"puerta","estado":"existente","conf":"plano","nombre":"Puerta del baño B12"},
];

/* Locales: polígono (cm), nivel, uso. Códigos B1…B14 del balance de superficies. */
export const LOCALES = [
  {"id":"L-B1","nivel":"SS","nombre":"Depósito de herramientas B1","poly":[[327.5,3857],[850,3857],[850,3098],[327.5,3098]],"conf":"plano","nota":"Balance: 7,59 × 5,22 = 39,61 m², a −1,98."},
  {"id":"L-B4","nivel":"PB","nombre":"Living comedor B4","poly":[[15,3857],[850,3857],[850,3067],[205,3067],[205,3457],[15,3457]],"conf":"estimado","nota":"Planta abierta con la cocina y el estar (112 m² entre los tres según el balance). Los límites entre ellos son míos."},
  {"id":"L-B3","nivel":"PB","nombre":"Cocina B3","poly":[[15,3067],[315,3067],[315,2374],[15,2374]],"conf":"estimado","nota":"Mesada contra la medianera izquierda e isla de 0,80 × 2,00 (planta)."},
  {"id":"L-B2","nivel":"PB","nombre":"Estar B2","poly":[[315,3067],[760,3067],[760,2865],[850,2865],[850,2374],[315,2374]],"conf":"estimado","nota":"Con el estar hundido (LO-03) y doble altura hasta la losa de 2P."},
  {"id":"L-B5","nivel":"PB","nombre":"Baño B5","poly":[[15,3446.5],[195,3446.5],[195,3286.5],[15,3286.5]],"conf":"plano","nota":"Balance: 1,80 × 1,60."},
  {"id":"L-B6","nivel":"PB","nombre":"Depósito B6","poly":[[15,3276.5],[195,3276.5],[195,3076.5],[15,3076.5]],"conf":"plano","nota":"Balance: 1,80 × 2,00."},
  {"id":"L-B7","nivel":"EP","nombre":"Escritorio B7","poly":[[15,3079],[760,3079],[760,2784],[315,2784],[315,2374],[15,2374]],"conf":"plano","nota":"Balance: 48,00 m², a +3,29."},
  {"id":"L-B8","nivel":"P1","nombre":"Baño B8","poly":[[15,3283],[419,3283],[419,3089],[15,3089]],"conf":"plano","nota":"Balance: 4,08 × 1,89."},
  {"id":"L-B9","nivel":"P1","nombre":"Palier B9","poly":[[434,3446],[850,3446],[850,3089],[434,3089]],"conf":"plano","nota":"Balance: 4,13 × 3,56."},
  {"id":"L-B10","nivel":"P1","nombre":"Dormitorio B10","poly":[[15,3857],[419,3857],[419,3294],[15,3294]],"conf":"plano","nota":"Balance: 4,08 × 5,69 (con el placard)."},
  {"id":"L-B11","nivel":"P1","nombre":"Dormitorio B11","poly":[[434,3857],[850,3857],[850,3458],[434,3458]],"conf":"plano","nota":"Balance: 4,13 × 4,02."},
  {"id":"L-BAL","nivel":"P1","nombre":"Balcón","poly":[[474,3979],[772,3979],[772,3886.6],[474,3886.6]],"conf":"plano"},
  {"id":"L-B12","nivel":"P2","nombre":"Baño B12","poly":[[658,2704],[850,2704],[850,2374],[658,2374]],"conf":"plano","nota":"Balance: 1,92 × 3,15."},
  {"id":"L-B13","nivel":"P2","nombre":"Dormitorio B13","poly":[[15,3069],[643,3069],[643,2374],[15,2374]],"conf":"plano","nota":"Balance: 34 m², a +6,13."},
  {"id":"L-B14","nivel":"TZ","nombre":"Vestidor B14","poly":[[15,3435],[188,3435],[188,3099],[15,3099]],"conf":"plano","nota":"Balance: 1,76 × 3,36, a +7,65."},
  {"id":"L-TZ","nivel":"TZ","nombre":"Terraza accesible","poly":[[208,3857],[850,3857],[850,3099],[208,3099]],"conf":"plano","nota":"A +7,57, con baranda de 1,00 al frente y muros de 1,80 a los costados."},
];

/* Losas: z = cara superior, e = espesor, huecos = polígonos. */
export const LOSAS = [
  {"id":"LO-01","nivel":"SS","nombre":"Piso del subsuelo","z":-198,"e":12,"poly":[[327.5,3857],[850,3857],[850,2868],[760,2868],[760,3068],[327.5,3068]],"conf":"plano"},
  {"id":"LO-02","nivel":"PB","nombre":"Losa de planta baja","z":72,"e":18,"poly":[[15,3857],[850,3857],[850,2374],[15,2374]],"huecos":[[[760,3193],[850,3193],[850,2865],[760,2865]],[[409,2764],[789,2764],[789,2418],[409,2418]]],"conf":"plano","nota":"Sobre el subsuelo es losa; el resto, contrapiso. Huecos: la escalera al subsuelo y el estar hundido."},
  {"id":"LO-03","nivel":"PB","nombre":"Estar hundido B2","z":22,"e":10,"poly":[[409,2764],[789,2764],[789,2418],[409,2418]],"conf":"plano","nota":"3,80 × 3,50 a +0,22 (0,50 más bajo que el resto), a 3,94 de la medianera izquierda."},
  {"id":"LO-04","nivel":"EP","nombre":"Entrepiso (escritorio B7)","z":329,"e":18,"poly":[[15,3084],[760,3084],[760,2918],[850,2918],[850,2784],[315,2784],[315,2374],[15,2374]],"conf":"plano","nota":"El vacío de 5,35 × 4,10 sobre el estar queda abierto hasta la losa de 2P (doble altura)."},
  {"id":"LO-05","nivel":"P1","nombre":"Losa del primer piso","z":417,"e":20,"poly":[[15,3857],[850,3857],[850,3084],[15,3084]],"conf":"plano"},
  {"id":"LO-06","nivel":"P1","nombre":"Balcón","z":417,"e":15,"poly":[[466,3999],[782,3999],[782,3886.6],[466,3886.6]],"conf":"plano","nota":"3,16 × 1,12, en voladizo."},
  {"id":"LO-07","nivel":"P2","nombre":"Losa del segundo piso","z":613,"e":18,"poly":[[15,3069],[850,3069],[850,2374],[15,2374]],"huecos":[[[760,3069],[850,3069],[850,2834],[760,2834]]],"conf":"plano"},
  {"id":"LO-08","nivel":"TZ","nombre":"Losa de la terraza","z":757,"e":18,"poly":[[15,3857],[850,3857],[850,3084],[15,3084]],"huecos":[[[246,3233],[346,3233],[346,3133],[246,3133]],[[542,3327],[644,3327],[644,3227],[542,3227]]],"conf":"plano","nota":"Con dos claraboyas sobre el palier y el baño de 1P."},
  {"id":"LO-09","nivel":"TZ","nombre":"Piso del vestidor B14","z":765,"e":8,"poly":[[15,3435],[188,3435],[188,3084],[15,3084]],"conf":"plano"},
  {"id":"LO-10","nivel":"PB","nombre":"Galería del contrafrente","z":72,"e":15,"poly":[[15,2374],[850,2374],[850,2266],[15,2266]],"conf":"plano","nota":"«0,90» más allá de la carpintería, a +0,72."},
];

export const CLARABOYAS = [
  {"id":"CL-1","nivel":"TZ","nombre":"Claraboya sobre el baño B8","poly":[[246,3233],[346,3233],[346,3133],[246,3133]],"z":782,"conf":"plano","nota":"1,00 × 1,00."},
  {"id":"CL-2","nivel":"TZ","nombre":"Claraboya sobre el palier B9","poly":[[542,3327],[644,3327],[644,3227],[542,3227]],"z":782,"conf":"plano","nota":"1,00 × 1,00."},
];

export const ESTRUCTURA = [
  {"id":"C-01","tipo":"columna","nivel":"PB","pos":[406,3447],"sec":"20×20","z":[72,397],"conf":"plano","estado":"existente","nombre":"Columna del comedor","nota":"Planta baja, en la línea de la viga (yd 10,69)."},
  {"id":"C-02","tipo":"columna","nivel":"PB","pos":[25,2567],"sec":"20×20","z":[72,595],"conf":"plano","estado":"existente","nombre":"Pilastra izquierda del estar"},
  {"id":"C-03","tipo":"columna","nivel":"PB","pos":[838.5,2567],"sec":"20×20","z":[72,595],"conf":"plano","estado":"existente","nombre":"Pilastra derecha del estar"},
  {"id":"C-04","tipo":"columna","nivel":"P1","pos":[678,3079],"sec":"20×20","z":[329,595],"conf":"plano","estado":"existente","nombre":"Columna de la escalera","nota":"En el borde del palier de 1P."},
  {"id":"VG-1","tipo":"viga","nivel":"PB","a":[15,3447],"b":[850,3447],"sec":"20×40","z":397,"conf":"supuesto","estado":"existente","nombre":"Viga del comedor","nota":"La planta la marca con línea de trazos; la sección es supuesta."},
];

/* Escaleras rectas: x = [izq, der]; y = [primera alzada, última alzada]; z = [salida, llegada]; n = alzadas. */
export const ESCALERAS = [
  {"id":"E-01","nivel":"SS","x":[763,850],"y":[3255,2865],"z":[-198,72],"n":15,"nombre":"Escalera del subsuelo a planta baja","conf":"modelo","estado":"existente","poly":[[763,3255],[850,3255],[850,2865],[763,2865]],"sube":"-y","nota":"Posición de tu SketchUp; alturas del plano. 15 alzadas de 18,0 y pedadas de 27,9,"},
  {"id":"E-02","nivel":"PB","x":[760,850],"y":[3193,2918],"z":[72,329],"n":12,"nombre":"Escalera de planta baja al entrepiso","conf":"modelo","estado":"existente","poly":[[760,3193],[850,3193],[850,2918],[760,2918]],"sube":"-y","nota":"Pedadas de tu SketchUp (25). Con los niveles del plano las alzadas dan 21,4; en el SketchUp son de 18 (D-02). 12 alzadas de 21,4 y pedadas de 25,0,"},
  {"id":"E-03","nivel":"EP","x":[667,752],"y":[3009,3109],"z":[329,417],"n":5,"nombre":"Escalera del entrepiso al primer piso","conf":"modelo","estado":"existente","poly":[[667,3109],[752,3109],[752,3009],[667,3009]],"sube":"+y","nota":"Sube hacia el frente, al palier B9. 5 alzadas de 17,6 y pedadas de 25,0,"},
  {"id":"E-04","nivel":"P1","x":[760,850],"y":[3109,2834],"z":[417,613],"n":12,"nombre":"Escalera del primer piso al segundo","conf":"modelo","estado":"existente","poly":[[760,3109],[850,3109],[850,2834],[760,2834]],"sube":"-y","nota":"Sube hacia el fondo, sobre la E-02. 12 alzadas de 16,3 y pedadas de 25,0,"},
  {"id":"E-05","nivel":"P2","x":[658,748],"y":[2869,3044],"z":[613,757],"n":8,"nombre":"Escalera del segundo piso a la terraza","conf":"plano","estado":"existente","poly":[[658,3044],[748,3044],[748,2869],[658,2869]],"sube":"+y","nota":"Planta: pedadas de 14,73 a 16,29. Llega a la puerta P-11. 8 alzadas de 18,0 y pedadas de 25,0,"},
  {"id":"E-06","nivel":"P2","x":[15,101],"y":[2823,2979],"z":[613,765],"n":7,"nombre":"Escalerita al vestidor B14","conf":"plano","estado":"existente","poly":[[15,2979],[101,2979],[101,2823],[15,2823]],"sube":"+y","nota":"Planta: 6 pedadas de 15,37 a 16,93. 7 alzadas de 21,7 y pedadas de 26,0,"},
  {"id":"E-07","nivel":"PB","x":[760,850],"y":[4216,3978.2],"z":[0,-198],"n":10,"nombre":"Escalera descubierta al subsuelo","conf":"plano","estado":"existente","poly":[[760,4216],[850,4216],[850,3978.2],[760,3978.2]],"sube":"-y","exterior":true,"nota":"Baja desde el jardín del frente (±0,00) a la puerta del subsuelo. Planta: 9 pedadas de 3,00 a 5,38. 10 alzadas de 19,8 y pedadas de 26,4,"},
];

export const BARANDAS = [
  {"id":"BA-1","nivel":"EP","nombre":"Baranda del entrepiso sobre el vacío","pts":[[315,2374],[315,2784],[850,2784]],"z":329,"h":100,"tipo":"metal","conf":"plano","nota":"«Baranda metálica H 1,00 E 0,05»."},
  {"id":"BA-2","nivel":"PB","nombre":"Baranda de la escalera E-02","pts":[[755,3226],[755,2918]],"z":72,"h":100,"tipo":"madera","sigue":"E-02","conf":"plano","nota":"«Baranda de escalera H 1,00 madera E 0,05»."},
  {"id":"BA-3","nivel":"P1","nombre":"Baranda de la escalera E-04","pts":[[755,3084],[755,2834]],"z":417,"h":100,"tipo":"madera","sigue":"E-04","conf":"plano","nota":"«Baranda de escalera H 1,00 madera»."},
  {"id":"BA-4","nivel":"P2","nombre":"Baranda del hueco de la escalera en 2P","pts":[[755,2834],[755,3069]],"z":613,"h":100,"tipo":"madera","conf":"supuesto","nota":"Protege el hueco de la E-04 desde el descanso de 2P."},
  {"id":"BA-5","nivel":"P2","nombre":"Baranda de la escalerita E-06","pts":[[101,2823],[101,2979]],"z":613,"h":100,"tipo":"madera","sigue":"E-06","conf":"plano"},
];

export const DECK = [];

/* Techos: polígono en planta; z = [cara superior en el borde alto, en el borde bajo]; baja = hacia dónde. */
export const TECHOS = [
  {"id":"T-01","poly":[[-15,3084],[880,3084],[880,2216],[-15,2216]],"baja":"−y","pend":"12 %","mat":"chapa acanalada","z":[995,890.8],"e":15,"estado":"existente","conf":"plano","nombre":"Techo de chapa del bloque del fondo","nota":"Chapa acanalada sobre estructura metálica, pendiente 12 %. +9,95 junto al frente del bloque (yd 14,32) y +8,91 en el alero (1,58 más allá del ventanal; el plano marca «1,00» desde la carpintería)."},
  {"id":"T-02","poly":[[-15,3458],[208,3458],[208,3084],[-15,3084]],"baja":"−y","pend":"12 %","mat":"chapa","z":[1064,1017.25],"e":12,"estado":"existente","conf":"plano","nombre":"Techo del vestidor B14","nota":"De +10,64 a +10,17 (corte A-A)."},
];

export const CHIMENEAS = [];

export const IMPLANTACION = [
  {"id":"J-1","tipo":"jardin","nombre":"Jardín del frente","poly":[[15,4501],[850,4501],[850,3886.6],[15,3886.6]],"z":0,"conf":"plano","estado":"existente","nota":"Suelo absorbente a ±0,00 según el plano. En tu SketchUp hay un patio hundido a −2,09 (D-01)."},
  {"id":"J-2","tipo":"jardin","nombre":"Jardín del fondo","poly":[[15,2266],[850,2266],[850,15],[15,15]],"z":57,"conf":"plano","estado":"existente","nota":"Suelo absorbente a +0,57. Largo según el croquis (D-03)."},
  {"id":"J-3","tipo":"vereda","nombre":"Vereda de Arcos","poly":[[-200,4971],[1065,4971],[1065,4516],[-200,4516]],"z":0,"conf":"plano","estado":"existente","nota":"Ancho de vereda 4,55; calle de 17,32."},
];

/* Cotas generales de la planta. */
export const COTAS = [
  {"a":[0,4576],"b":[865,4576],"off":0,"txt":"8,65"},
  {"a":[-60,4516],"b":[-60,3886.6],"off":0,"txt":"6,29"},
  {"a":[-60,3886.6],"b":[-60,3084],"off":0,"txt":"8,03"},
  {"a":[-60,3084],"b":[-60,2374],"off":0,"txt":"7,10"},
  {"a":[-160,4516],"b":[-160,0],"off":0,"txt":"45,16"},
  {"a":[15,4006.6],"b":[850,4006.6],"off":0,"txt":"8,35","niveles":["PB","P1","TZ"]},
];

/* Dudas numeradas: respondé por número. ref = elementos que cambian con la respuesta. */
export const DUDAS = [
  {"id":"D-01","ref":["J-1","V-04","E-07"],"q":"El jardín del frente: el plano lo dibuja a ±0,00 con sólo la escalera descubierta (E-07) que baja al subsuelo; tu SketchUp tiene un patio hundido a −2,09 entre x 3,9 y 7,8. ¿Cuál es el real? Si es el del SketchUp, lo dibujo como patio inglés frente a la ventana del subsuelo."},
  {"id":"D-02","ref":["E-01","E-02","E-03","E-04","E-05","LO-04","LO-05","LO-07","LO-08"],"q":"Niveles: el plano dice entrepiso +3,29, 1P +4,17, 2P +6,13 y terraza +7,57; tu SketchUp (con su PB en +0,72) da +3,39, +4,09, +6,07 y +7,34. Con los del plano las alzadas de la E-02 dan 21 cm; en el SketchUp son de 18. ¿Cuáles valen?"},
  {"id":"D-03","ref":["J-2","M-07","M-08","M-09"],"q":"El fondo del lote: el plano dibuja el jardín acortado (dice «24,00» de la carpintería al retiro y «6,00» de retiro, 30 m), pero el croquis da 45,16 de lote: con la casa hasta 21,42, quedan 23,74 de jardín. Usé el croquis. ¿Está bien?"},
  {"id":"D-04","ref":["V-03","LO-06","M-44"],"q":"El balcón de 1P: la vista del frente dibuja la abertura V-03 con antepecho (+5,14, justo sobre la baranda). ¿Es una puerta balcón o una ventana? Si no, ¿cómo se sale al balcón?"},
  {"id":"D-05","ref":["V-04"],"q":"La ventana del subsuelo (V-04, 4,30 a 5,87): ¿qué alto tiene y a qué da?"},
  {"id":"D-06","ref":["E-07"],"q":"En la planta baja, al lado de la escalera descubierta, hay una cota «+3,20» que no encaja con nada (la escalera baja al subsuelo). ¿Qué es?"},
  {"id":"D-07","ref":["V-01"],"q":"La ventana del comedor: la planta la pone entre 4,42 y 7,18 y la vista del frente entre 4,85 y 7,85. Usé la planta. ¿Cuál es?"},
  {"id":"D-08","ref":["P-11","V-06"],"q":"Frente del bloque del fondo hacia la terraza: la planta tiene puerta (6,62 a 7,57) y ventana; la vista del frente, una ventana corrida de 6,61 a 8,51 a +8,57. Usé la planta. ¿Cómo es?"},
  {"id":"D-09","ref":["M-10","P-01","P-02"],"q":"Cerco sobre la línea municipal: el plano no le da altura; usé 2,70 de tu SketchUp. ¿Es de rejas, de tablas, de mampostería?"},
  {"id":"D-10","ref":["E-02","E-03","E-04"],"q":"Escaleras: tomé las posiciones de tu SketchUp (la del plano no se entiende sola). E-02 sube al entrepiso por la derecha, E-03 sigue al palier de 1P y E-04 sube a 2P encima de la E-02, con ~1,90 libres sobre el descanso. ¿Es así?"},
  {"id":"D-11","ref":["M-43","L-B8","L-B10"],"q":"En 1P, entre el baño B8 y el dormitorio B10, la pared llega hasta x 3,25 y queda un paso hasta x 4,19. ¿Hay algo ahí (placard, puerta)?"},
  {"id":"D-12","ref":["LO-04","L-B7"],"q":"El entrepiso: en el plano es el escritorio B7 (3,00 de ancho junto al vacío); en tu SketchUp ocupa casi todo el ancho. ¿Cuál es?"},
];

export const VIDEO = [];

export const CAMBIOS = [
  {"fecha":"2026-10-15","v":"0.1.0","txt":"Primera versión de Arcos 4264 desde el plano de regularización (hoja 01/04, escala 1:100): subsuelo, planta baja con estar hundido, entrepiso, primer piso, segundo piso, terraza y vestidor; techo de chapa al 12 %. Escaleras ubicadas con tu SketchUp. Tu SketchUp va como calco (gris) en 3D y en planta."},
];

