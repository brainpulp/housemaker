/* E-02 al detalle: tramo recto existente, giro de 90° a la izquierda con dos compensadas (C1, C2) cortadas de un mismo
   panel de tablas diagonales, tabla de llegada al entrepiso y baranda (R1 en el tramo, R4 en el fondo del giro).
   Es el diseño de la conversación «Diseño escalera con descanso» (artifact «Escalera al entrepiso», 11/10/2026), adaptado a Arcos.
   Ejes propios de la escalera: x a lo largo del tramo (sube hacia +x, 0 en la primera contrahuella), y altura sobre el piso de PB,
   z de costado (0 = cara interior de la zanca libre, 92 = pared). casa.js los pasa a los ejes de la casa. */
export const DISENOS = [
  { id: 'madera', name: 'Madera clásica', mat: 'wood', fill: { type: 'bars', mat: 'wood', along: 3.8, across: 3.8 }, bot: { mat: 'wood', w: 5, h: 5, off: 5 }, cap: Infinity, fix: 'balaustres 1½″×1½″ con espiga Ø12 encolada en el pasamanos y en el travesaño' },
  { id: 'hierro_madera', name: 'Madera + barrotes de hierro', mat: 'wood', fill: { type: 'round', mat: 'steel', r: 0.8 }, bot: { mat: 'wood', w: 5, h: 5, off: 5 }, cap: Infinity, fix: 'barrotes redondo Ø16 metidos 2 cm en agujeros ciegos del pasamanos y del travesaño, con una gota de epoxi' },
  { id: 'cables', name: 'Madera + cables de acero', mat: 'wood', fill: { type: 'cables', mat: 'inox', r: 0.2, spacer: 100 }, bot: null, cap: Infinity, fix: 'cables inox Ø4 con tensores en los postes de remate y bujes en los intermedios' },
  { id: 'hierro', name: 'Toda en hierro', mat: 'steel', fill: { type: 'flat', mat: 'steel', along: 0.48, across: 3.2 }, bot: { mat: 'steel', w: 0.95, h: 3.8, off: 5 }, cap: Infinity, fix: 'barrotes planchuela 1¼″×3/16″ soldados al pasamanos y a la planchuela inferior' },
  { id: 'listones', name: 'Listones verticales', mat: 'wood', fill: { type: 'bars', mat: 'wood2', along: 5, across: 2.5 }, bot: { mat: 'wood', w: 5, h: 5, off: 5 }, cap: Infinity, fix: 'listones 1″×2″ con 2 tornillos 4×50 al travesaño y al pasamanos' },
  { id: 'vidrio', name: 'Vidrio laminado', mat: 'wood', fill: { type: 'panel', mat: 'glass', t: 1.0 }, bot: null, cap: 120, fix: 'vidrio laminado 5+5 con 4 pinzas inox por paño y burletes de goma' },
];
const POSTS = { wood: [10, '4″×4″'], steel: [6, 'tubo 60×60×2'] };
const RAILS = { wood: { w: 9.5, h: 4.5, l: '2″×4″ (9,5×4,5)' }, steel: { D: 4.83, l: 'caño Ø1½″ (48 mm)' } };
const FIX = { M: 15750, e: 35, l: '2 bulones M12 a 35' };
const FW = { wood: 80, steel: 1400 };

/* P: { N alzadas, R alzada, G pedada, zF borde del entrepiso (z), LR4 largo de R4 desde la pared, design } */
export function escaleraGiro(geo, P) {
  const { THREE, prism, box, rod, box8, quad, clip, minus, extent, f1, f0 } = geo;
  const R = P.R, G = P.G, k = R / G, TH = 5, NOSE = 1, EXP = 2.5, SD = 30;
  const cosT = G / Math.hypot(G, R), VDp = SD / cosT, o = 2.5 * Math.SQRT2, S2 = Math.SQRT1_2;
  const N = P.N, Ns = N - 3, Xc = Ns * G, yC1 = (N - 2) * R, yC2 = (N - 1) * R, yD = N * R, uC1 = yC1 - TH, uC2 = yC2 - TH, uD = yD - TH, zF = P.zF;
  const yN = x => R + k * (x + 1);
  const D = DISENOS.find(d => d.id === P.design) || DISENOS[2], M = D.mat;
  const [s, sLbl] = POSTS[M], RL = RAILS[M], fx = FIX, q = 0.51, s2 = s / 2, railH = M === 'steel' ? RL.D : RL.h;
  const parts = []; const Pt = (id, name, cat, geos, info) => parts.push({ id, name, cat, geos: [].concat(geos), info });

  /* tramo recto */
  const stringerPoly = (tr, sHigh) => { const t0 = tr[0]; const top = x => t0.yt - EXP + k * (x - t0.sf), bot = x => top(x) - VDp; const pts = [[sHigh, bot(sHigh)], [sHigh, top(sHigh)]];
    for (let i = tr.length - 1; i >= 0; i--) { const t = tr[i]; pts.push([t.sf + EXP / k, t.yt], [t.sb, t.yt], [t.sb, t.yu], [t.sf, t.yu]); if (i > 0) pts.push([t.sf, t.yt - EXP]); }
    pts.push([t0.sf, 0], [t0.sf + (VDp - (t0.yt - EXP)) / k, 0]); return pts; };
  const stringerPlain = (tr, sHigh) => { const t0 = tr[0]; const top = x => t0.yt - EXP + k * (x - t0.sf), bot = x => top(x) - VDp; return [[sHigh, bot(sHigh)], [sHigh, top(sHigh)], [t0.sf, top(t0.sf)], [t0.sf, 0], [t0.sf + (VDp - (t0.yt - EXP)) / k, 0]]; };
  const tr = []; for (let i = 1; i <= Ns; i++) tr.push({ sf: (i - 1) * G - NOSE, sb: i * G, yu: i * R - TH, yt: i * R });
  Pt('ZE', 'ZE · Zanca del lado libre', 'zanca', [prism(stringerPlain(tr, Xc + 1.5), -5, -1.5, 'XY'), prism(stringerPoly(tr, Xc + 1.5), -1.5, 0, 'XY')], { fn: 'Zanca del lado del entrepiso. Arriba se corta a plomo y entra 1,5 en el poste PA.', sec: '2″×12″ (≈5×30), a verificar', med: `remate a plomo a ${f1(Xc + 1.5)} del pie`, u: 'U1' });
  Pt('ZI', 'ZI · Zanca contra la medianera', 'zanca', [prism(stringerPoly(tr, Xc), 87, 88.5, 'XY'), prism(stringerPlain(tr, Xc), 88.5, 92, 'XY')], { fn: 'Zanca contra la medianera; arriba queda en línea con VW.', sec: '2″×12″ (≈5×30), a verificar', med: `remate a plomo a ${f1(Xc)} del pie`, u: 'U1' });
  Pt('TE', `Pedadas del tramo recto (${Ns})`, 'escalera', tr.map(t => box(t.sf, t.sb, t.yu, t.yt, -1.5, 88.5)), { fn: `Tramo recto: ${Ns} pedadas abiertas entre las zancas.`, sec: '2″ × 25, 90 de largo', med: `${Ns} alzadas de ${f1(R)} y pedadas de ${f1(G)}` });

  /* estructura del giro */
  Pt('PA', 'PA · Poste del giro', 'poste', box(Xc, Xc + 10, 2, uD, -10, 0), { fn: 'Poste en el ángulo interior del giro. Recibe ZE, V5, V4, VD1 y el taco TA al entrepiso; la tabla de llegada apoya encima.', sec: '4″×4″ (10×10)', med: `${f1(uD - 2)} (de +2 a +${f1(uD)} sobre PB)`, u: 'U1 · U2 · U8' });
  Pt('VD1', 'VD1 · Viga de llegada', 'viga', box(Xc + 10, Xc + 87, uD - 30, uD, -5, 0), { fn: 'Su cara hacia el giro es la última contrahuella, de C2 al entrepiso. Lleva L2 y el borde de la tabla de llegada.', sec: '2″×12″ (5×30)', med: '80 (77 libre + caja de 1,5 en PA y en VF)', u: 'U2' });
  Pt('TA', 'TA · Taco de PA al entrepiso', 'viga', box(Xc, Xc + 5, uD - 19, uD, zF, -10), { fn: 'Ata la cabeza de PA a la viga de borde del entrepiso y apoya la tabla de llegada.', sec: '2″×8″ (5×19)', med: `${f1(-10 - zF)}. Perno en PA y estribo HE al entrepiso`, u: 'U2' });
  Pt('VF', 'VF · Viga de fondo', 'viga', box(Xc + 87, Xc + 92, uD - 30, uD, zF, 92), { fn: 'Del entrepiso a la medianera. Lleva el borde de C2 (con L3) y la punta de la tabla de llegada.', sec: '2″×12″ (5×30)', med: `${f1(92 - zF)}. Estribo en el entrepiso y escuadra en la pared`, u: 'U2 · U3' });
  Pt('VW', 'VW · Viga de pared', 'viga', box(Xc, Xc + 87, uC1 - 19, uC1, 87, 92), { fn: 'Anclada a la medianera. Lleva el borde de C1.', sec: '2″×8″ (5×19)', med: `87. Canto superior +${f1(uC1)} sobre PB`, u: 'U3' });
  Pt('V5', 'V5 · Viga de frente de C1', 'viga', box(Xc, Xc + 5, uC1 - 19, uC1, 0, 87), { fn: 'Lleva la nariz de C1, donde terminan sus tablas diagonales.', sec: '2″×8″ (5×19)', med: `88,5. Canto superior +${f1(uC1)} sobre PB`, u: 'U3' });
  let d = [[Xc - 30, -30 - o], [Xc + 120, 120 - o], [Xc + 120, 120 + o], [Xc - 30, -30 + o]]; d = clip(d, 0, 1, 0); d = clip(d, -1, 0, Xc + 87); d = clip(d, 0, -1, 87); d = clip(d, 1, 0, -Xc);
  const dLen = extent(d, [S2, S2]).L;
  Pt('V4', 'V4 · Diagonal (contrahuella estructural)', 'diag', [prism(clip(d, 1, 0, -(Xc + 5)), uC2 - 19, uC2, 'XZ'), prism(clip(d, -1, 0, Xc + 5), uC1, uC2, 'XZ')], { fn: 'Lleva la nariz de C2 y, en su otra cara, el listón L1 de C1. Se rebaja y apoya sobre V5; en la esquina de la medianera calza entre VW y VF.', sec: '2″×8″ (5×19)', med: `${f1(dLen)} de punta a punta`, u: 'U3' });
  let l1 = [[Xc - 30, -30 + o], [Xc + 120, 120 + o], [Xc + 120, 120 + o + 5 * Math.SQRT2], [Xc - 30, -30 + o + 5 * Math.SQRT2]]; l1 = clip(l1, 1, 0, -(Xc + 5)); l1 = clip(l1, 0, -1, 87);
  Pt('L1', 'L1 · Listón de C1', 'liston', prism(l1, uC1 - 5, uC1, 'XZ'), { fn: 'En la cara de V4 que mira a C1.', sec: '2″×2″', med: `${f1(extent(l1, [S2, S2]).L)}, puntas a 45°`, u: 'U3' });
  Pt('L2', 'L2 · Listón de C2 (frente)', 'liston', box(Xc + 10, Xc + 87, uC2 - 5, uC2, 0, 5), { fn: 'En VD1; lleva el borde de C2.', sec: '2″×2″', med: '77', u: 'U3' });
  Pt('L3', 'L3 · Listón de C2 (fondo)', 'liston', box(Xc + 82, Xc + 87, uC2 - 5, uC2, 5, 75), { fn: 'En VF; lleva el borde exterior de C2.', sec: '2″×2″', med: '70', u: 'U3' });

  /* compensadas y llegada */
  let c1 = [[Xc - NOSE, 0], [Xc + 92, 0], [Xc + 92, 92], [Xc - NOSE, 92]]; c1 = clip(c1, -1, 1, Xc - o);
  let c2 = [[Xc, 0], [Xc + 87, 0], [Xc + 87, 87], [Xc, 87]]; c2 = clip(c2, 1, -1, -Xc + o + Math.SQRT2);
  const sMin = -(2.5 + NOSE), stp = (87 * S2 - sMin) / 3; const strip = (poly, a, b) => { let qq = clip(poly, S2, -S2, -Xc * S2 - a); qq = clip(qq, -S2, S2, Xc * S2 + b); return qq; };
  const c1S = [[sMin - stp, -2.5], [sMin - 2 * stp, sMin - stp], [sMin - 3 * stp, sMin - 2 * stp]].map(([a, b]) => strip(c1, a, b)).filter(qq => qq.length > 2);
  const c2S = [0, 1, 2].map(i => strip(c2, sMin + i * stp, sMin + (i + 1) * stp)).filter(qq => qq.length > 2);
  const c1B = []; c1S.forEach(qq => { let r = [qq]; try { r = minus(qq, [[Xc - NOSE, Xc, 87, 92]]); } catch (e) {} r.forEach(x => c1B.push(x)); });
  Pt('C1', `C1 · Compensada baja (+${f1(72 + yC1)})`, 'c1', c1B.map(qq => prism(qq, uC1, yC1, 'XZ')), { fn: 'Mitad del panel cuadrado. Apoya en V5, VW y L1.', sec: 'Tablas de 2″, veta paralela a la diagonal', med: `3 tablas de ${f1(stp)}; ${c1S.map(qq => { const e = extent(qq, [S2, S2]); return f0(e.L) + '×' + f0(e.W); }).join(' · ')}`, u: 'U4' });
  Pt('C2', `C2 · Compensada alta (+${f1(72 + yC2)})`, 'c2', c2S.map(qq => prism(qq, uC2, yC2, 'XZ')), { fn: 'La otra mitad del panel. Apoya en L2, L3 y V4.', sec: 'Tablas de 2″, veta paralela a la diagonal', med: `3 tablas de ${f1(stp)}; ${c2S.map(qq => { const e = extent(qq, [S2, S2]); return f0(e.L) + '×' + f0(e.W); }).join(' · ')}`, u: 'U4' });
  Pt('TL', `TL · Tabla de llegada (+${f1(72 + yD)})`, 'deck', [[zF, -10], [-10, 1]].map(([a, b]) => box(Xc, Xc + 92, uD, yD, a, b)), { fn: 'Cierra la franja entre C2 y el borde del entrepiso, a nivel del piso: desde C2 se sube una alzada y se pisa el entrepiso. La de adelante vuela 1 como nariz.', sec: `2 tablas 2″ × ${f1((1 - zF) / 2)}`, med: '92, a tope con el piso del entrepiso', u: 'U5' });

  /* herrajes */
  Pt('HB', 'HB · Herraje de base de PA', 'herraje', [box(Xc - 1, Xc + 11, 0, 0.6, -11, 1), box(Xc + 1, Xc + 9, 0, 14, 0, 0.5), box(Xc + 1, Xc + 9, 0, 14, -10.5, -10)], { fn: 'Herraje en U que separa PA 2 cm del piso.', sec: 'Chapa 3/16″', med: 'Base 12×12, alas de 14; 2 brocas Ø10', u: 'U8' });
  Pt('HW', 'HW · Escuadra de pared de VF', 'herraje', [box(Xc + 86, Xc + 93, uD - 34, uD - 33.5, 82, 92), box(Xc + 86, Xc + 93, uD - 34, uD - 24, 91.5, 92)], { fn: 'Recibe la punta de VF en la medianera.', sec: 'Ángulo 3″×3/8″', med: '2 varillas químicas M12', u: 'U2' });
  Pt('HE', 'HE · Estribos al entrepiso', 'herraje', [box(Xc + 86.5, Xc + 92.5, uD - 30, uD, zF - 0.5, zF), box(Xc - 0.5, Xc + 5.5, uD - 19, uD, zF - 0.5, zF)], { fn: 'Cuelgan VF y TA de la viga de borde del entrepiso.', sec: 'Chapa 3/16″ plegada', med: '4 bulones M10 cada uno', u: 'U2' });
  Pt('HM', 'HM · Ménsula de esquina de V4', 'herraje', box(Xc + 80, Xc + 87, uC1 - 20, uC1 - 19.5, 80, 87), { fn: 'Apoyo de la punta de V4 en la esquina de la medianera.', sec: 'Chapa 3/16″', med: '2 brocas químicas Ø10', u: 'U3' });

  /* baranda: R1 a lo largo del tramo, R4 en el fondo del giro (de la medianera hasta donde sigue la BA-1) */
  const Wp = M === 'wood' ? s ** 3 / 6 : (s ** 4 - (s - 0.4) ** 4) / (6 * s), Wr = M === 'wood' ? RL.h * RL.w ** 2 / 6 : Math.PI * (RL.D ** 4 - (RL.D - 0.4) ** 4) / (32 * RL.D);
  const Mp = Math.min(FW[M] * Wp, fx.M), sRail = Math.sqrt(8 * FW[M] * Wr / q);
  const sMaxFor = Hh => Math.min(Mp / (q * Hh), sRail, D.cap);
  const H1 = 90, HL = 100, gap = 10, topL = yD + HL;
  const runs = [{ id: 'R1', name: 'R1 · Tramo', a: [s2 + 0.5, -5 - s2], b: [Xc - s2, -5 - s2], n: [0, 0, 1], H: H1, base: u => yN(s2 + 0.5 + u), start: 'P0', end: 'PR', bot: u => yN(s2 + 0.5 + u) - 8 - fx.e },
    { id: 'R4', name: 'R4 · Fondo del giro', a: [Xc + 92 + s2, 92], b: [Xc + 92 + s2, 92 - P.LR4 + s2], n: [1, 0, 0], H: HL, base: () => yD, start: 'wall', end: 'PE4', bot: () => uD - 30, botY: yC2 + 5 }];
  const P3 = (r, u, yy, off = 0) => { const L2 = Math.hypot(r.b[0] - r.a[0], r.b[1] - r.a[1]), hx = (r.b[0] - r.a[0]) / L2, hz = (r.b[1] - r.a[1]) / L2; return [r.a[0] + hx * u + r.n[0] * off, yy, r.a[1] + hz * u + r.n[2] * off]; };
  const runBox = (r, u0, u1, lo, hi, w) => box8([P3(r, u0, lo(u0), -w / 2), P3(r, u1, lo(u1), -w / 2), P3(r, u1, lo(u1), w / 2), P3(r, u0, lo(u0), w / 2), P3(r, u0, hi(u0), -w / 2), P3(r, u1, hi(u1), -w / 2), P3(r, u1, hi(u1), w / 2), P3(r, u0, hi(u0), w / 2)]);
  const RW = M === 'wood' ? RL.w : RL.D, OV = 5;
  for (const r of runs) { r.Lh = Math.hypot(r.b[0] - r.a[0], r.b[1] - r.a[1]);
    if (r.id === 'R1') { r.top = u => r.base(u) + r.H; r.pts = [-s2 - OV, r.Lh + s2 + OV]; } else { r.top = () => topL; r.pts = [0, r.Lh + s2 + OV]; } }
  const under = (r, u) => r.top(u) - railH;
  const newel = { P0: { run: 0, u: 0, y0: 0, name: 'P0 · Poste de arranque', fn: 'Arranque de R1. Llega al piso con herraje y se bulona al pie de ZE.' },
    PR: { run: 0, u: runs[0].Lh, y0: yN(Xc) - 40, name: 'PR · Poste de remate de R1', fn: 'Remate de R1 en el giro, abulonado a PA y a ZE.' },
    PE4: { run: 1, u: runs[1].Lh, y0: uD - 30, name: 'PE4 · Poste de remate de R4', fn: 'Remate de R4 donde sigue la baranda del entrepiso (BA-1), abulonado a la viga de borde.' } };
  const pc = M === 'steel' ? 'steel' : 'wood';
  for (const [id, nw] of Object.entries(newel)) { const r = runs[nw.run];
    const g = M === 'wood' ? runBox(r, nw.u - s2, nw.u + s2, () => nw.y0, u => under(r, u), s) : (() => { const c = P3(r, nw.u, 0); return box(c[0] - s2, c[0] + s2, nw.y0, under(r, nw.u) + 0.5, c[2] - s2, c[2] + s2); })();
    Pt(id, nw.name, pc, g, { fn: nw.fn + ' Termina debajo del pasamanos, que pasa corrido por encima.', sec: sLbl, med: f1(under(r, nw.u) - nw.y0), u: 'U6 · U7' }); }
  for (const r of runs) {
    const Lr = r.id === 'R1' ? r.Lh / cosT : r.Lh, nb = Math.max(1, Math.ceil(Lr / sMaxFor(r.H) - 1e-6));
    const sup = [0]; for (let i = 1; i < nb; i++) sup.push(r.Lh * i / nb); sup.push(r.Lh);
    const rg = []; let rlen = 0;
    for (let i = 0; i < r.pts.length - 1; i++) { const u0 = r.pts[i], u1 = r.pts[i + 1];
      if (M === 'steel') { const A = P3(r, u0, r.top(u0) - railH / 2), B = P3(r, u1, r.top(u1) - railH / 2); rg.push(rod(A, B, railH / 2, 18)); rlen += Math.hypot(B[0] - A[0], B[1] - A[1], B[2] - A[2]); }
      else { rg.push(runBox(r, u0, u1, u => r.top(u) - RL.h, r.top, RL.w)); rlen += Math.hypot(u1 - u0, r.top(u1) - r.top(u0)); } }
    Pt(r.id + 't', 'Pasamanos ' + r.name, pc, rg, { fn: `A ${r.H} sobre ${r.id === 'R1' ? 'la línea de narices' : 'el piso'}, corrido por encima de todos los postes.${r.start === 'wall' ? ' Arranca en la medianera con brida.' : ''}`, sec: RL.l, med: f1(rlen), u: 'U7' });
    const pg = []; for (let i = 1; i < sup.length - 1; i++) { const u = sup[i], yb = r.bot(u);
      if (M === 'wood') pg.push(runBox(r, u - s2, u + s2, () => yb, uu => under(r, uu), s)); else { const c = P3(r, u, 0); pg.push(box(c[0] - s2, c[0] + s2, yb, under(r, u) + 0.5, c[2] - s2, c[2] + s2)); } }
    if (pg.length) Pt(r.id + 'pi', 'Postes intermedios ' + r.name, pc, pg, { fn: `${pg.length}, cada ${f1(Lr / nb)}: los mínimos que pide el cálculo (carga 0,5 kN/m). Bulonados con ${fx.l}.`, sec: sLbl, med: '', u: 'U6' });
    const bays = []; for (let i = 0; i < sup.length - 1; i++) bays.push([i === 0 ? (r.start === 'wall' ? 0 : sup[0] + s2) : sup[i] + s2, sup[i + 1] - s2]);
    const botY = u => r.botY != null ? r.botY : r.base(u) + (D.bot ? D.bot.off : 5), botTop = u => botY(u) + (D.bot ? D.bot.h : 0), und = u => under(r, u);
    if (D.bot) Pt(r.id + 'b', 'Travesaño inferior ' + r.name, D.bot.mat === 'steel' ? 'steel' : 'wood', bays.map(([a2, b2]) => runBox(r, a2 - (M === 'wood' ? 1.5 : 0), b2 + (M === 'wood' ? 1.5 : 0), botY, botTop, D.bot.w)), { fn: 'Entre postes, 5 sobre la línea de narices o el piso.', sec: `${f1(D.bot.w)}×${f1(D.bot.h)}`, med: '', u: 'U7' });
    const F = D.fill, fg = [];
    if (['bars', 'round', 'flat'].includes(F.type)) { const al = F.type === 'round' ? 1.6 : F.along, ac = F.type === 'round' ? 1.6 : F.across;
      for (const [a2, b2] of bays) { const W = b2 - a2, n = Math.max(1, Math.ceil((W - gap) / (al + gap))), cl = (W - n * al) / (n + 1);
        for (let j = 0; j < n; j++) { const u = a2 + cl + al / 2 + j * (al + cl), y0 = botTop(u), y1 = und(u), c = P3(r, u, 0);
          if (F.type === 'round') fg.push(rod([c[0], y0 - 2, c[2]], [c[0], y1 + 2, c[2]], F.r, 10));
          else { const dx = Math.abs((r.b[0] - r.a[0]) / r.Lh) * al / 2 + Math.abs(r.n[0]) * ac / 2, dz = Math.abs((r.b[1] - r.a[1]) / r.Lh) * al / 2 + Math.abs(r.n[2]) * ac / 2; fg.push(box(c[0] - dx, c[0] + dx, y0, y1, c[2] - dz, c[2] + dz)); } } } }
    else if (F.type === 'cables') { const n = Math.floor((r.H - railH - 8) / gap) + 1, ua = r.start === 'wall' ? 0 : s2, ub = r.Lh - s2;
      for (let j = 0; j < n; j++) { const off = 8 + j * gap, yb = u => (r.botY != null ? r.botY - 5 : r.base(u)) + off; fg.push(rod(P3(r, ua, yb(ua)), P3(r, ub, yb(ub)), F.r, 6)); }
      const sp = []; for (const [a2, b2] of bays) { const W = b2 - a2, k2 = Math.ceil(W / F.spacer) - 1; for (let j = 1; j <= k2; j++) { const u = a2 + W * j / (k2 + 1), c = P3(r, u, 0); sp.push(rod([c[0], (r.botY != null ? r.botY - 5 : r.base(u)) + 5, c[2]], [c[0], und(u), c[2]], 0.6, 8)); } }
      if (sp.length) Pt(r.id + 's', 'Separadores de cable ' + r.name, 'inox', sp, { fn: 'Varilla inox Ø12 que mantiene la separación de los cables entre postes. No lleva carga.', sec: 'Ø12 inox', med: `${sp.length}, cada ≤${F.spacer}`, u: 'U7' }); }
    else if (F.type === 'panel') for (const [a2, b2] of bays) { const gg = 1.5, lo = u => (D.bot ? botTop(u) : r.base(u) + 5) + gg, hi = u => und(u) - gg;
      fg.push(quad([P3(r, a2 + gg, lo(a2 + gg)), P3(r, b2 - gg, lo(b2 - gg)), P3(r, b2 - gg, hi(b2 - gg)), P3(r, a2 + gg, hi(a2 + gg))], F.t, r.n)); }
    if (fg.length) Pt(r.id + 'f', 'Relleno ' + r.name, F.mat, fg, { fn: D.fix[0].toUpperCase() + D.fix.slice(1) + '.', sec: D.name, med: `luz ≤ ${gap}`, u: 'U7' });
  }
  return { parts, Xc, yC1, yC2, yD };
}
