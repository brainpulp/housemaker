/* Mocoretá · columna de elevación — detalle de una columna del sistema para subir y bajar la casa (par 6, norte, con el motor de la fila).
   Maxi 20/11: «husillo a tracción, perfiles finos, un 3D de detalle para el ingeniero, no esquemático».
   Disposición: columna doble de 2 UPN 140 con ranura; el husillo cuelga del cabezal (tracción); el gato va afuera de los perfiles, bajo las vigas del deck;
   la ménsula que lleva la casa pasa por la ranura. Coordenadas en cm: x hacia afuera (0 = cara de la columna vieja), y arriba (0 = terreno), z a lo largo de la fila. */
import * as THREE from 'three';
import { createVisor, geo } from './visor3d.js';
import { initSenalar } from './senalar.js';
import { initToolbar } from './toolbar.js';
import { initAristas } from './aristas.js';
import { initArrastre } from './arrastre.js';
import { initMedir } from './medir.js';
import { initVistasUI } from './vistasui.js';
import { initVistas } from './vistas.js';
import { initViewCube } from './viewcube.js';
import * as M from './modelo.js';
import { initMarcas } from './marcas.js';
import { initRealismo } from './realismo.js';
import { initLuz } from './luz.js';
import { initNoche } from './noche.js';
import { initCalidad } from './calidad.js';
import { initInspector } from './inspector.js';
import { initSidebar } from './sidebar.js';

const { box, rod, prism, box8 } = geo;
const B = (x0, x1, y0, y1, z0, z1) => box(Math.min(x0, x1), Math.max(x0, x1), Math.min(y0, y1), Math.max(y0, y1), Math.min(z0, z1), Math.max(z0, z1));
const f2 = cm => (cm / 100).toFixed(2).replace('.', ',');
const mm = cm => Math.round(cm * 10);

/* ---------- medidas (cm) ---------- */
const CARRERA = 143, PISO0 = 147;                      /* piso a 1,47 del terreno (hoy) y 2,90 arriba del todo */
const COL = 15, VP = { b: 15, h: 30 }, VT = { b: 7, h: 25 }, VD = { b: 4.5, h: 29.5 }, TAB = 2.5;
const GAP = 2;                                         /* madera → perfiles */
const U = { h: 14, b: 6, tw: .7, tf: 1.0 };            /* UPN 140: 140 × 60, alma 7, ala 10 (aprox., sin radios) */
const RAN = 2;                                         /* media ranura: 4 cm entre almas */
const X0 = GAP, X1 = GAP + U.h;                        /* los perfiles ocupan x 2 → 16 */
const H = 300;                                         /* largo de los perfiles: de la placa base al cabezal */
const XS = 22, ZS = 0;                                 /* eje del husillo: 22 cm afuera de la madera */
const RS = 2;                                          /* Tr 40 × 7: Ø 40, núcleo Ø 32,5 */
const WX = XS + 6.3;                                   /* eje del sinfín del gato: 63 mm entre ejes */
const PIN = [0, 71.5, 143];                            /* posiciones de reposo (cm subidos) */
const PDECK = [10, 14.5];                              /* tablas de la viga doble del deck, a cada lado (z) */

const params = [
  { id: 'subida', label: 'Subir y bajar: cuánto subió la casa', type: 'number', slider: true, min: 0, max: CARRERA, step: 1, unit: ' cm', value: 0, quick: true, group: 'Maniobra',
    anim: { vel: [1, 40, 10], unidad: 'cm/s', botones: ['Bajar', 'Subir'], nota: 'La real es 2,5 cm por minuto: 57 minutos de marcha para subir 1,43 m.' },
    help: 'De 0 (piso a 1,47, como hoy) a 143 cm (piso a 2,90). Lo fijo: dado, placa, columna doble, cabezal, husillo. Lo que sube: la madera, la ménsula, el gato, los ejes, el motor y el deck.' },
  { id: 'madera', label: 'Madera de la casa', type: 'check', value: true, quick: true, group: 'Ver' },
  { id: 'deck', label: 'Tablones del deck', type: 'check', value: false, quick: true, group: 'Ver', help: 'Apagados de entrada para ver la ménsula y el gato desde arriba.' },
  { id: 'cotas', label: 'Cotas', type: 'check', value: true, quick: true, group: 'Ver' },
];

/* hexágono en planta (tuercas): s = entre caras */
const hexXZ = (x, z, s, y0, y1) => { const R = s / Math.sqrt(3); return prism([...Array(6)].map((_, i) => [x + R * Math.cos(i * Math.PI / 3), z + R * Math.sin(i * Math.PI / 3)]), y0, y1); };
/* hexágono con eje z (cabezas de bulón pasante) */
const hexZ = (x, y, s, z0, z1) => { const R = s / Math.sqrt(3); return prism([...Array(6)].map((_, i) => [x + R * Math.cos(i * Math.PI / 3), y + R * Math.sin(i * Math.PI / 3)]), z0, z1, 'XY'); };
/* UPN con la abertura hacia +z (s=1) o −z (s=−1): alma junto a la ranura */
const upn = (s, y0, y1) => { const a = s * RAN, w = s * (RAN + U.tw), e = s * (RAN + U.b);
  return prism([[X0, a], [X1, a], [X1, e], [X1 - U.tf, e], [X1 - U.tf, w], [X0 + U.tf, w], [X0 + U.tf, e], [X0, e]], y0, y1); };
/* husillo con rosca (núcleo + filetes cada 7 mm) */
const husillo = (y0, y1) => { const g = [rod([XS, y0, ZS], [XS, y1, ZS], 1.625, 18)]; for (let y = y0 + .2; y < y1 - .4; y += .7) g.push(rod([XS, y, ZS], [XS, y + .35, ZS], RS, 18)); return g; };

function build(p) {
  const s = +p.subida || 0, FL = PISO0 + s, parts = [];
  window.__terreno = { t: 0, c: 0 }; window.__cajas = {};
  const Pt = (id, name, cat, geos, info, group) => { geos = [].concat(geos).filter(Boolean); if (!geos.length) return; (window.__cajas = window.__cajas || {})[id] = geos.map(g => { g.computeBoundingBox(); return g.boundingBox.clone(); }); parts.push({ id, name: `${id} · ${name}`, cat, geos, info, group, opt: { dedupeAll: true } }); };
  const FIJO = 'Fijo (no se mueve)', SUBE = 'Sube con la casa', MAD = 'Madera existente';

  /* ===== fijo ===== */
  Pt('C-01', 'Dado de hormigón', 'hormigon', [B(-1, 49, -100, 0, -25, 25)],
    { fn: 'Cimiento propio de la columna nueva, junto al de la columna vieja (que no está dibujado). H-21, armadura según cálculo. Las brocas de la placa se cuelan con el dado.', sec: '0,50 × 0,50 × 1,00', med: 'cara de arriba a ras del terreno' }, FIJO);
  Pt('C-02', 'Placa base y brocas', 'negro', [B(0.5, 30, 0, 2.5, -14, 14), ...[[5, -11], [5, 11], [26, -11], [26, 11]].flatMap(([x, z]) => [rod([x, -40, z], [x, 6.5, z], .8, 10), hexXZ(x, z, 2.4, 2.5, 3.8), rod([x, 2.5, z], [x, 2.8, z], 1.5, 12)]),
    ...[[-1, 1]].flatMap(() => [B(X0, X1, 2.5, 12, -8.4, -8), B(X0, X1, 2.5, 12, 8, 8.4)])],
    { fn: 'Placa de 295 × 280 × 25 soldada al pie de los dos UPN, con dos cartelas de 6 mm. Cuatro brocas M16 coladas con el dado (40 cm de anclaje), tuerca y arandela. Lechada de nivelación debajo.', sec: 'placa 295 × 280 × 25 · 4 brocas M16', med: 'de x 0,5 a 30' }, FIJO);
  Pt('C-03', 'Columna doble: 2 UPN 140 con ranura', 'acero', [upn(1, 2.5, H), upn(-1, 2.5, H),
    ...PIN.flatMap(q => [-1, 1].map(sg => rod([9, PISO0 - 60 + q, sg * RAN], [9, PISO0 - 60 + q, sg * (RAN + U.tw + .01)], 1.7, 14)))],
    { fn: `Dos UPN 140 enfrentados por el alma, con 4 cm de ranura entre almas, a ${GAP} cm de la madera. Por la ranura pasa la ménsula que lleva la casa; el gato y el husillo quedan afuera de los perfiles, así que el eje de fila no tiene que atravesar la columna. Los agujeros de Ø 34 en las almas son para el perno de traba, uno por posición de reposo (abajo, al medio y arriba). Peso: 2 × 16 kg/m = 32 kg/m (el HEB 180 pesaba 51).`, sec: '2 × UPN 140 (140 × 60 × 7 × 10)', med: `alto ${f2(H)} · ranura 40 mm · a ${mm(GAP)} mm de la madera` }, FIJO);
  const TOP = H + 2.5;
  Pt('C-04', 'Cabezal y cartelas', 'negro', [B(X0, 30, TOP, TOP + 3, -8.4, 8.4), B(X1, 28, TOP - 12, TOP, -4.6, -3.6), B(X1, 28, TOP - 12, TOP, 3.6, 4.6), B(X0, X1, TOP - 12, TOP, -RAN, RAN)],
    { fn: 'Placa de 30 mm soldada a la cabeza de los dos UPN, que vuela 14 cm hacia afuera para tomar el husillo. Dos cartelas de 10 mm bajo el vuelo y un taco en la ranura que ata los dos perfiles arriba. Por acá pasa toda la carga de la columna durante la maniobra (hasta 35 kN): el husillo tira de esta placa.', sec: 'placa 280 × 168 × 30 · cartelas 10 mm', med: `cara de arriba a ${f2(TOP + 3)}` }, FIJO);
  Pt('C-21', 'Chapones de la ranura', 'negro', [[15, 27], [45, 57], [262, 274]].map(([a, b]) => B(X0, X1, a, b, -RAN, RAN)),
    { fn: 'Maxi 22/11: chapones (presillas de 12 mm, de a dos, una en cada boca de la ranura) soldados al ras de los perfiles, que hermanan los dos UPN. Sólo pueden ir donde no pasa la ménsula: abajo de 0,70 y arriba de 2,60 (más el taco del cabezal). Al ras, para que las abrazaderas pasen por encima. Entre 0,70 y 2,60 los dos UPN van sueltos (D-C2).', sec: '2 presillas de 120 × 40 × 12 por posición', med: 'a 0,15, 0,45 y 2,62 del terreno' }, FIJO);
  Pt('C-05', 'Husillo Tr 40 × 7 (a tracción)', 'inox', husillo(PISO0 - 62, TOP + 9),
    { fn: 'Husillo de rosca trapecial Tr 40 × 7, acero C45, colgado del cabezal y libre abajo. No gira y trabaja a tracción en toda la carrera: del gato para arriba está tirado, del gato para abajo no carga. Con 35 kN la tensión en el núcleo (Ø 32,5) es de 42 MPa. La rosca se frena sola (ángulo de 3,5°).', sec: 'Tr 40 × 7 · C45', med: `de ${f2(PISO0 - 62)} a ${f2(TOP + 9)}: ${f2(TOP + 9 - PISO0 + 62)}` }, FIJO);
  Pt('C-06', 'Arandela esférica, tuerca y contratuerca', 'negro', [rod([XS, TOP + 3, ZS], [XS, TOP + 4.2, ZS], 4.2, 20), hexXZ(XS, ZS, 6.5, TOP + 4.2, TOP + 7.4), hexXZ(XS, ZS, 6.5, TOP + 7.6, TOP + 9.2)],
    { fn: 'El husillo cuelga del cabezal con arandela esférica (deja que se alinee solo con el gato), tuerca Tr 40 × 7 y contratuerca. Si el extremo se mecaniza a rosca métrica M36, las tuercas son comunes.', sec: 'Tr 40 × 7 (o M36 si se mecaniza)' }, FIJO);
  Pt('C-07', 'Tuerca de tope', 'negro', [hexXZ(XS, ZS, 6.5, PISO0 - 62, PISO0 - 59)],
    { fn: 'Tuerca al pie del husillo: si algo falla abajo, el gato no puede salirse del husillo.', sec: 'Tr 40 × 7' }, FIJO);

  /* ===== lo que sube con la casa ===== */
  const yJ = FL - 34;                                  /* cara de arriba del gato = cara de abajo del asiento */
  const yW = yJ - 6.5;                                 /* eje del sinfín */
  Pt('C-08', 'Gato de husillo de 50 kN (SWL5)', 'gato', [
      B(XS - 5.5, XS + 10, yJ - 13, yJ, -8, 8),                       /* caja */
      rod([XS, yJ - 16, ZS], [XS, yJ, ZS], 3.25, 20),                 /* cubo de la tuerca (D 65) */
      rod([WX, yW, -10.6], [WX, yW, 10.6], 3.6, 18),                  /* alojamientos del sinfín */
      rod([WX, yW, -15.6], [WX, yW, 15.6], 1, 14),                    /* eje de entrada Ø 20 pasante */
      ...[-1, 1].map(sg => B(WX - .3, WX + .3, yW + 1, yW + 1.6, sg * 11, sg * 15.5))],   /* chavetas */
    { fn: 'Gato de sinfín y corona con la tuerca de bronce dentro de la corona: al girar el sinfín, la tuerca gira y la caja trepa por el husillo fijo. Va abulonado debajo del asiento de la ménsula, afuera de los perfiles y debajo de las vigas del deck. Eje de entrada pasante a los dos lados: de un lado viene el eje de fila, del otro sigue. Relación lenta (24:1 en el SWL5, 0,29 mm por vuelta; 28:1 en los europeos, 0,25 mm). <b>Envolvente a confirmar con el plano del proveedor (D-C1).</b>', sec: 'SWL5 · 50 kN · Tr 40 × 7', med: `caja 155 × 160 × 130 aprox. · eje de entrada Ø 20 a ${mm(WX - XS)} mm del husillo` }, SUBE);
  const yM0 = FL - 75, yM1 = yJ;                      /* alto de la ménsula */
  Pt('C-09', 'Ménsula del gato', 'negro', [
      B(-15, 0, yM0, yM1, 7.5, 8.7), B(-15, 0, yM0, yM1, -8.7, -7.5),            /* cachetes */
      B(0, 1.2, yM0, yM1, -8.7, 8.7),                                            /* placa frontal, en los 2 cm */
      B(1.2, 18, yM0, yM1, -1, 1),                                           /* alma: pasa por la ranura */
      B(X1 + .5, XS + 13, yJ, yJ + 2, -11, 11),                                  /* asiento */
      B(X1 + .5, XS + 11, yJ - 0, yJ + 2, -11, 11),
      ...[-1, 1].map(sg => box8([[18, yJ + 2, sg * 4.5], [XS + 11, yJ + 2, sg * 4.5], [XS + 11, yJ + 2, sg * 5.5], [18, yJ + 2, sg * 5.5], [18, yJ + 10, sg * 4.5], [19.5, yJ + 10, sg * 4.5], [19.5, yJ + 10, sg * 5.5], [18, yJ + 10, sg * 5.5]])),
      B(1.2, X1 + .5, yJ, yJ + 2, -1, 1)],
    { fn: 'Lleva la casa. Cachetes de 12 mm a los dos lados de la columna vieja, unidos por una placa frontal de 12 mm que entra en los 2 cm entre la madera y los perfiles; de ella sale un alma de 20 mm que pasa por la ranura de la columna doble y termina en el asiento del gato, afuera. El gato queda 29,5 cm afuera del eje de la columna vieja: durante la maniobra la ménsula le pasa a la madera unos 10 kN·m (D-C3). El asiento queda justo debajo de las vigas del deck.', sec: 'chapas de 12 y 20 mm · A-36', med: `alto ${f2(yM1 - yM0)} · asiento a ${f2(FL - yJ)} bajo el piso` }, SUBE);
  Pt('C-10', 'Bulones pasantes de la ménsula', 'negro', [[-7.5, FL - 40], [-7.5, FL - 55], [-7.5, FL - 70]].flatMap(([x, y]) => [rod([x, y, -10], [x, y, 10], 1, 12), hexZ(x, y, 3, 8.7, 10), hexZ(x, y, 3, -10, -8.7)]),
    { fn: 'Tres bulones M20 grado 8.8 que atraviesan la columna vieja de lado a lado y aprietan los cachetes. Arandelas grandes contra la chapa. Verificar aplastamiento en la madera dura (D-C3).', sec: '3 × M20 × 200, 8.8' }, SUBE);
  Pt('C-11', 'Guías de UHMW de la ranura', 'uhmw', [-1, 1].map(sg => B(X0 + 1.5, X1 - 1.5, yM0 + 3, yM1 - 3, sg * 1, sg * 1.8)),
    { fn: 'Tiras de polietileno de ultra alto peso molecular de 8 mm pegadas y atornilladas al alma de la ménsula: deslizan contra las almas de los UPN y guían la casa a lo largo de la fila.', sec: 'UHMW 8 mm' }, SUBE);
  const ABR = [FL - 128, FL - 83, FL - 31.9];
  Pt('C-12', 'Abrazaderas', 'negro', ABR.flatMap((y, i) => { const h = i === 2 ? 4.7 : 6, x0 = i === 2 ? -15 : -16; return [B(x0, X1 + 1.6, y, y + h, 8.8, 9.8), B(x0, X1 + 1.6, y, y + h, -9.8, -8.8), B(X1 + .6, X1 + 1.6, y, y + h, -9.8, 9.8), ...(i === 2 ? [rod([-7.5, y + h / 2, -11], [-7.5, y + h / 2, 11], .8, 10)] : [B(-16, -15, y, y + h, -9.8, 9.8)])]; }),
    { fn: 'Tres bandas de planchuela de 3″ × 3/8″ que abrazan la columna vieja (abulonadas a ella) y la columna doble, con patines de UHMW contra el acero. Toman el empuje del viento entre la casa y la columna, a lo ancho de la casa. La de arriba va justo debajo de la viga perimetral y encima del asiento del gato; como por detrás de la columna vieja pasa la viga transversal, no la rodea: se toma con un bulón pasante M16.', sec: 'planchuela 76 × 9,5', med: 'a ' + ABR.map(y => f2(FL - y)).join(', ') + ' bajo el piso' }, SUBE);
  Pt('C-13', 'Patines de UHMW', 'uhmw', ABR.flatMap((y, i) => { const h = i === 2 ? 4.7 : 6; return [B(X1 + .1, X1 + .6, y + .5, y + h - .5, -7, 7), B(X0 + 1, X1 - 1, y + .5, y + h - .5, 8.1, 8.8), B(X0 + 1, X1 - 1, y + .5, y + h - .5, -8.8, -8.1)]; }),
    { fn: 'Patines de 5–7 mm entre las abrazaderas y las alas de los UPN: el acero de la casa nunca roza el de la columna.', sec: 'UHMW 12 mm rebajado' }, SUBE);
  const yP = FL - 60;
  Pt('C-14', 'Perno de traba', 'inox', [rod([9, yP, -(RAN + U.tw + 1.2)], [9, yP, RAN + U.tw + 1.2], 1.6, 16), rod([9, yP, RAN + U.tw + 1.2], [9, yP, RAN + U.tw + 2], 2.4, 16), rod([9, yP, -(RAN + U.tw + 1.6)], [9, yP, -(RAN + U.tw + 1.2)], 2, 12)],
    { fn: 'En reposo la casa no cuelga del gato: un perno de Ø 32 atraviesa las dos almas de los UPN y el alma de la ménsula, a doble corte. Se pone y se saca a mano desde el lado abierto de los UPN. Tres posiciones: abajo, al medio y arriba.', sec: 'Ø 32 · acero 1045', med: `a ${f2(FL - yP)} bajo el piso` }, SUBE);
  /* ejes de fila: a cada lado, acople L110, tubo, y del lado este el motorreductor del par 6 */
  const acople = (z0) => [rod([WX, yW, z0], [WX, yW, z0 + 4.27], 4.2, 20), rod([WX, yW, z0 + 4.27], [WX, yW, z0 + 6.45], 4.15, 20), rod([WX, yW, z0 + 6.45], [WX, yW, z0 + 10.72], 4.2, 20)];
  Pt('C-15', 'Acoples elásticos L110', 'acople', [...acople(13), ...acople(-23.72), ...acople(48), ...acople(72)],
    { fn: 'Acople de mandíbulas con araña: una maza en el eje del gato, otra en la punta del eje de fila, y la araña en el medio. Araña de uretano (134 N·m); la de goma común da 89,5 N·m y no alcanza el par del motor (107 N·m). Absorbe 1 o 2 mm de desalineación.', sec: 'L110 · Ø 84 × 107', med: '4 en esta columna' }, SUBE);
  const tubo = (z0, z1) => [rod([WX, yW, z0], [WX, yW, z1], 2.54, 18), rod([WX, yW, z0 - 4], [WX, yW, z0], 1.25, 12), rod([WX, yW, z1], [WX, yW, z1 + 4], 1.25, 12)];
  Pt('C-16', 'Ejes de fila', 'inox', [...tubo(24, 47.5), ...tubo(82.7, 200), ...tubo(-200, -24), rod([WX, yW, 54.5], [WX, yW, 76.2], 1.25, 12)],
    { fn: 'Caño estructural de 2″ × 3,2 mm con puntas macizas torneadas de Ø 25 soldadas, que entran en los acoples. Va inmediatamente debajo del deck, a 40 cm bajo el piso, por afuera de los perfiles, y viaja con la casa: nunca corta el paso. Corta acá a 2 m: sigue hasta la columna vecina (4 m).', sec: 'Ø 50,8 × 3,2 · puntas Ø 25', med: `a ${f2(FL - yW)} bajo el piso` }, SUBE);
  const zG = 60, oy = yW - 6.3;                        /* motorreductor: salida hueca en el eje, motor 63 mm más abajo, hacia afuera */
  Pt('C-17', 'Motorreductor del par 6 (1,5 kW)', 'motor', [B(WX - 6, WX + 13, oy - 6, yW + 5.5, zG, zG + 11.2), rod([WX, yW, zG - .6], [WX, yW, zG + 11.8], 4.5, 20),
      rod([WX + 13, oy, zG + 5.6], [WX + 15, oy, zG + 5.6], 7, 24), rod([WX + 15, oy, zG + 5.6], [WX + 46, oy, zG + 5.6], 8.75, 28), B(WX + 22, WX + 32, oy + 8.5, oy + 13, zG + 1, zG + 10)],
    { fn: 'NMRV063 de sinfín y corona 1:15 con eje de salida hueco Ø 25 montado sobre el eje de fila, y motor trifásico IEC 90L de 1,5 kW (2 HP) en brida B14, 100 rpm y 107 N·m a la salida. Un variador lo hace arrancar y parar en rampa. Cuelga del eje y lo frena un brazo de reacción contra el asiento. Viaja con la casa; se alimenta con cable flexible. Envolvente aproximada (D-C4).', sec: 'NMRV063 1:15 + IEC 90L 1,5 kW', med: 'motor Ø 175 × 310 aprox.' }, SUBE);
  Pt('C-18', 'Brazo de reacción', 'negro', [B(WX + 2, WX + 6, yW + 5.5, yJ + 2, zG + 4.6, zG + 6.6), B(X1 + .5, XS + 13, yJ, yJ + 2, 11, zG + 6.6)],
    { fn: 'Impide que el motorreductor gire alrededor del eje: una planchuela con buje de goma, tomada a una prolongación del asiento de la ménsula.', sec: 'planchuela 40 × 20' }, SUBE);
  Pt('C-19', 'Jabalcón', 'negro', [box8([[-15, FL - 97, -2.5], [-15, FL - 92, -2.5], [-15, FL - 92, 2.5], [-15, FL - 97, 2.5], [-70, FL - 29, -2.5], [-65, FL - 29, -2.5], [-65, FL - 29, 2.5], [-70, FL - 29, 2.5]]), B(-16.2, -15, FL - 108, FL - 84, -6, 6), B(-78, -58, FL - 28, FL - 27, -6, 6)],
    { fn: 'Tubo de 50 × 50 × 3,2 del tramo de columna vieja que cuelga bajo el piso a la viga transversal, 65 cm hacia adentro, con placas abulonadas en las dos puntas. Triangula el tramo colgante y además toma parte del momento que la ménsula le pasa a la madera.', sec: 'tubo 50 × 50 × 3,2' }, SUBE);
  Pt('C-20', 'Herraje de nudo', 'negro', [B(0, .8, FL - 22, FL + 3, -7.5, 7.5), ...[FL - 15, FL - 5].flatMap(y => [rod([-15.5, y, -5], [1.4, y, -5], .8, 10), rod([-15.5, y, 5], [1.4, y, 5], .8, 10)])],
    { fn: 'Unión nueva y conocida entre la columna vieja y las vigas (la de hace 55 años no se conoce): planchuela de 150 × 250 × 8 al frente de la columna con bulones pasantes a la viga perimetral.', sec: 'planchuela 150 × 250 × 8 · 4 bulones M16' }, SUBE);

  /* ===== madera de la casa (sube) ===== */
  if (p.madera) {
    Pt('M-01', 'Columna vieja (cortada al ras del terreno)', 'madera', [B(-COL, 0, s, FL + 60, -COL / 2, COL / 2)],
      { fn: 'Columna de virapitá (caña fístola) u otra madera dura de 15 × 15. Se corta al ras del terreno y sube con la casa: el tramo de abajo queda colgando de las vigas, por eso el jabalcón y el herraje. Se dibuja hasta 60 cm sobre el piso.', sec: '15 × 15, madera dura' }, MAD);
    Pt('M-02', 'Viga perimetral del piso', 'madera', [B(-COL, 0, FL - 27, FL + 3, -120, 120)], { fn: 'Viga perimetral del piso, 15 × 30, sobresale 3 cm sobre el piso. Se dibuja un tramo.', sec: '15 × 30' }, MAD);
    Pt('M-03', 'Viga transversal de piso', 'madera', [B(-110, -COL, FL - 27, FL - 2, -VT.b / 2, VT.b / 2)], { fn: 'Viga transversal del par, 7 × 25. Recibe el jabalcón.', sec: '7 × 25' }, MAD);
    Pt('M-04', 'Vigas dobles del deck', 'madera2', [-1, 1].map(sg => B(0, 130, FL - TAB - VD.h, FL - TAB, sg * PDECK[0], sg * PDECK[1])),
      { fn: 'Viga doble de 2″ × 12″ en pinza a cada lado de la columna. Con el sistema se abren 2,5 cm para que la columna doble pase entre las dos tablas. Debajo de ellas va el asiento del gato.', sec: '2 × 4,5 × 29,5' }, MAD);
  }
  if (p.deck) { const T = []; for (let x = .5; x < 130; x += 14.8) { const x1 = Math.min(x + 14, 130); if (x < 30) { T.push(B(x, x1, FL - TAB, FL, -60, -10.5), B(x, x1, FL - TAB, FL, 10.5, 60)); } else T.push(B(x, x1, FL - TAB, FL, -60, 60)); }
    Pt('M-05', 'Tablones del deck', 'deck', T, { fn: 'Tablones de 2″ del deck, con el hueco por donde pasan la columna doble y el husillo.', sec: '14 × 2,5' }, MAD); }

  const panes = { ayuda: `<h3>Qué es</h3><p>El detalle de <b>una</b> columna del sistema para subir y bajar Mocoretá: la del par 6 del lado norte, que además lleva el motor de la fila. Las otras 13 son iguales sin el motor. Es para el ingeniero: las piezas están a medida de catálogo o de predimensionado; lo dudoso está en la lista de abajo.</p>
    <h3>Cómo funciona</h3><ul><li>Lo fijo: dado, placa, columna doble de 2 UPN 140, cabezal y husillo. El husillo cuelga del cabezal y <b>trabaja a tracción</b>.</li><li>Lo que sube: la madera, la ménsula (pasa por la ranura de 4 cm de la columna), el gato (afuera de los perfiles, bajo el deck), los ejes de fila y el motor.</li><li>El eje de fila gira, el sinfín de cada gato hace girar su tuerca y el gato trepa por el husillo llevando la casa.</li><li>En reposo, el perno de traba toma la casa a doble corte en las almas de los UPN.</li></ul>
    <p>Subir y bajar: menú de variantes, «Maniobra». Tocá una pieza para ver su ficha.</p>
    <h3>Supuestos</h3><ul>${M.DUDAS.map(d => `<li><b>${d.id}</b> ${d.q}</li>`).join('')}</ul>` };
  const spec = `<span>v<b>${M.META.version}</b> · ${M.META.fecha}</span><span><b>Par 6 norte</b></span><span>piso a ${f2(FL)}</span><span>columna 2 × UPN 140</span><span>husillo Tr 40 × 7 a tracción</span><span>${M.DUDAS.length} supuestos</span><span>cotas en m</span>`;
  const c = [10, 150, 0];
  return { parts, panes, spec, joints: [], steps: [], defaultView: 'iso',
    selIntro: '<div class="k">Selección</div><h2>Tocá una pieza</h2><p style="margin:0;color:var(--muted);font-size:13px">Cada pieza tiene su ficha: qué es, sección y medidas.</p>',
    views: { iso: { label: 'Iso', p: [250, 290, 270], t: [10, 130, 0] }, gato: { label: 'Gato', p: [95, FL + 30, 75], t: [20, FL - 45, 5] }, frente: { label: 'Frente', p: [320, 150, 0], t: c }, lado: { label: 'Lado', p: [10, 150, 340], t: c }, planta: { label: 'Planta', p: [10, 520, .1], t: [10, 0, 0] }, abajo: { label: 'Desde abajo', p: [120, 30, 120], t: [15, FL - 40, 0] } },
    dims: ({ tag }) => { if (!p.cotas) return;
      tag(`${mm(GAP)} mm madera–columna`, [1, FL - 90, -12], 'edge');
      tag('ranura 40', [9, H - 20, 0], 'edge');
      tag(`husillo a ${mm(XS)} mm de la madera`, [XS, FL + 25, 6], 'edge');
      tag(`piso ${f2(FL)}`, [-15, FL + 3, -14], 'edge');
      tag(`cabezal ${f2(TOP + 3)}`, [25, TOP + 6, 0], 'edge');
      tag(`eje de fila a ${f2(FL - yW)} bajo el piso`, [WX, yW - 6, 30], 'edge');
      tag(`asiento del gato ${f2(FL - yJ)} bajo el piso`, [XS + 13, yJ + 4, 12], 'edge'); } };
}

const COL_ = { acero: '#8d9399', negro: '#3a3d40', inox: '#c9ced3', gato: '#46525e', acople: '#c45a1c', motor: '#2b6e9e', uhmw: '#eef0ea', madera: '#8b6a4d', madera2: '#9a7a5c', deck: '#a8865f', hormigon: '#b9b6ae' };
const root = document.getElementById('modo-3d');
const visor = createVisor({ model: { params, build }, colors: COL_, lift: {}, root, radial: 0, far: 20000 });
{ const l = new THREE.DirectionalLight(0xfff6ec, .35); l.position.set(300, -1000, 500); visor.scene.add(l); }
const VI = initVistas(visor, { M, root, pref: 'columna', rango: { x: [-120, 140], y: [-100, 320], z: [-200, 200] }, params: ['subida', 'madera', 'deck', 'cotas'], dirAmb: [.55, .85] });
visor.velTeclado = [40, 600];
const stage = document.querySelector('#modo-3d .stage');
try { initMarcas(visor, stage); } catch (e) { console.error('marcas', e); }
try { initRealismo(visor, { piedra: [], ladrillo: [], blanco: [], cats: { hormigon: ['cemento', 150] }, suelo: 'pasto', tintes: { madera: '#ad9c8c' } }); } catch (e) { console.error('realismo', e); }
try { initLuz(visor); } catch (e) { console.error('luz', e); }
try { initCalidad(visor); } catch (e) { console.error('calidad', e); }
try { initNoche(visor, { lugar: 'Ing. Maschwitz', lat: -34.381, lon: -58.741, tz: -3, norte: 0, inicioDia: true, max: 32 }); } catch (e) { console.error('noche', e); }
try { initSenalar(visor, stage); } catch (e) { console.error('senalar', e); }
try { initMedir(visor, stage); } catch (e) { console.error('medir', e); }
{ let vu = null; try { vu = initVistasUI(); } catch (e) { console.error('vistas', e); }
  try { initToolbar(stage, visor, { vistas: vu, zonas: [{ id: 'maniobra', nombre: 'Maniobra: subir y bajar', piezas: /^C-(08|09|17)$/, params: ['subida'], label: {}, vista: { p: [150, 260, 170], t: [10, 120, 0] } }, { id: 'ver', nombre: 'Qué se ve', piezas: /^M-0\d$/, params: ['madera', 'deck', 'cotas'], label: {} }] }); } catch (e) { console.error('toolbar', e); } }
try { initAristas(visor, { modo: 'tecnico' }); /* Maxi 21/11: el detalle para el ingeniero arranca en dibujo técnico */ } catch (e) { console.error('aristas', e); }
try { initArrastre(visor, [{ param: 'subida', piezas: /^(C-(0[89]|1\d|20)|M-0\d)$/ }]); /* Maxi 21/11: agarrar el mecanismo y arrastrarlo hacia arriba o abajo sube y baja la casa */ } catch (e) { console.error('arrastre', e); }
try { initViewCube(visor); } catch (e) { console.error('viewcube', e); }
try { initInspector(visor); } catch (e) { console.error('inspector', e); }
try { initSidebar(visor); } catch (e) { console.error('sidebar', e); }
window.__encastres = [['M-01', 'C-10'], ['M-01', 'C-12'], ['M-01', 'C-20'], ['M-02', 'C-20']];   /* bulones pasantes a la madera: buscados */
window.__ok3d = true;
