/* Cómputo de las cocinas (Maxi 13/11/2026: «integrar con el resto de las obras»): lee cada cocina como la ve la página —lo guardado
   en la base manda; si no hay nada guardado, el escenario del código— y saca de cada pieza lo que hace falta para comprar:
   tapas en m², cajones, puertas, módulos, medidas. Las cuentas siguen a las de motor/muebles.js (módulos, bandejero, rincón ciego,
   frente falso bajo el anafe); si el motor cambia cómo reparte los módulos, cambiar también acá.

   Uso: node herramientas/computo.mjs [--db <carpeta>] [--casa carhue|arcos|mocoreta]
     --db: carpeta con lo guardado, como la deja ArtifactData get con out_dir (<carpeta>/<colección>/<doc>.json).
   Sale un JSON: { carhue: { fuente, escenario, piezas: { <id>: {...} } }, ... } */
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

export const FUENTES = {
  carhue: { mod: 'casas/carhue/equipamiento-carhue.js', fn: 'equipCarhue', amb: 'cocina', doc: ['carhue_equipamiento', 'cocina'], modelo: 'carhue' },
  arcos: { mod: 'casas/arcos/equipamiento-arcos.js', fn: 'equipArcos', amb: 'cocina', doc: ['arcos_equipamiento', 'cocina'], modelo: 'arcos' },
  /* Mocoretá no tiene casa modelada: su cocina vive en la escena de las tres cocinas */
  mocoreta: { mod: 'casas/cocinas/equipamiento-cocinas.js', fn: 'equipCocinas', amb: 'mocoreta', doc: ['cocinas_equipamiento', 'mocoreta'], modelo: 'cocinas' },
};

const m = cm => (cm / 100).toFixed(2).replace('.', ',');           /* 72.4 → «0,72» */
const m2 = (a, b) => Math.round(a * b / 1e3) / 10;                  /* cm × cm → m² con un decimal */

/* ---------- piezas: lo que se compra de cada una ---------- */
function mesada(p) {
  const L = p.L ?? 240, D = p.D ?? 62, H = p.H ?? 90, filas = p.filas ?? 3, band = p.band || 0, cie = p.ciego || 0, pu = p.puertas || [];
  const resto = L - band - cie, n = Math.max(1, Math.round(resto / (p.mod || 76)));
  const mods = []; if (p.mods && p.mods.length) { const t = p.mods.reduce((a, b) => a + b, 0); for (const w of p.mods) mods.push({ w: w * resto / t, tipo: 'caj' }); } /* Maxi 13/11: anchos a mano */ else for (let i = 0; i < n; i++) mods.push({ w: resto / n, tipo: 'caj' });
  if (band > 0) { if ((p.bandLado || 1) < 0) mods.unshift({ w: band, tipo: 'band' }); else mods.push({ w: band, tipo: 'band' }); }
  if (cie > 0) { if ((p.ciegoLado || 1) < 0) mods.unshift({ w: cie, tipo: 'ciego' }); else mods.push({ w: cie, tipo: 'ciego' }); }
  mods.forEach((x, i) => { if (x.tipo === 'caj' && pu.includes(i)) x.tipo = 'pu'; });
  const caj = mods.filter(x => x.tipo === 'caj'), pus = mods.filter(x => x.tipo === 'pu');
  const tapaL = L + (p.tapaMas || 0), tapaD = p.tapaD || D + 1, zoc = p.zocalo || 0, frenteH = H - 13;
  return {
    t: 'mesada', L, D, H, tapa: { L: tapaL, D: tapaD, zocalo: zoc, m2: m2(tapaL, tapaD + zoc), huecos: (p.huecos || []).map(h => ({ L: h[1], D: h[2] })) },
    columnasCaj: caj.length, anchoCaj: caj.length ? caj[0].w : 0, anchosCaj: caj.map(c => Math.round(c.w * 10) / 10), filas, cajones: caj.length * filas,
    modPuertas: pus.length, anchoPuerta: pus.length ? pus[0].w / 2 : 0, puertas: pus.length * 2, frenteH,
    bandejero: band, ciego: cie, modulos: mods.filter(x => x.tipo !== 'ciego').length, fondoCajon: D - 17,
  };
}
function islaMesa(p) {
  const L = p.L ?? 380, D = p.D ?? 120, Lb = p.Lb ?? 160, Db = p.Db ?? 70, H = p.H ?? 75, Hb = p.Hb ?? 90, filas = p.filas ?? 3, cie = p.ciego || 0, falso = p.falso || 0;
  const ancho = Lb - 8 - cie, cols = Math.max(1, Math.round(ancho / (p.mod || 76))), filC = falso ? 2 : filas;
  return {
    t: 'islaMesa', L, D, Lb, Db, H, Hb, tapaBloque: { L: Lb, D: Db, m2: m2(Lb, Db) },
    laterales: { lados: [Db, Db, Lb], alto: Hb - 4, m2: m2(Db + Db + Lb, Hb - 4) },
    columnas: cols, anchoCol: ancho / cols, filas: filC, cajones: cols * filC, falso, ciego: cie, modulos: cols,
    mesa: { L, D, m2: Math.round((L * D - Lb * Db) / 1e3) / 10 }, timon: { L: 50, H }, fondoCajon: Db - 17,
  };
}
function isla(p) {
  const L = p.L ?? 200, D = p.D ?? 90, filas = p.filas ?? 3, cols = Math.max(1, Math.round((L - 8) / (p.mod || 76)));
  return { t: 'isla', L, D, columnas: cols, anchoCol: (L - 8) / cols, filas, cajones: cols * filas, modulos: cols };
}
function alacena(p) {
  const L = p.L ?? 120, D = p.D ?? 35, H = p.H ?? 70, band = p.band || 0, n = Math.max(1, Math.round((L - band) / 90));
  return { t: 'alacena', L, D, H, puertas: n, anchoPuerta: (L - band) / n, bandejero: band, led: p.led !== false ? L : 0 };
}
function columna(p) { const L = p.L ?? 60, D = p.D ?? 60, H = p.H ?? 220; return { t: 'columna', L, D, H, cajones: 2, puertas: H - 142 > 20 ? 1 : 0 }; }
const simple = (t, p, def) => Object.assign({ t }, def, p);
export function pieza(it) {
  const p = it.p || {};
  switch (it.t) {
    case 'mesada': return mesada(p);
    case 'islaMesa': return islaMesa(p);
    case 'isla': return isla(p);
    case 'alacena': return Object.assign(alacena(p), { z: it.z ?? 150 });
    case 'columna': return columna(p);
    case 'revestimiento': return simple('revestimiento', p, { L: 200, H: 60, e: 1.5, mat: 'acero' });
    case 'estante': return Object.assign(simple('estante', p, { L: 200, D: 15, e: 2 }), { z: it.z ?? 130 });
    case 'salpicadero': return simple('salpicadero', p, { L: 200, H: 10, caja: 0 });
    case 'campanaIsla': return simple('campanaIsla', p, { L: 90, D: 60 });
    case 'anafe': return simple('anafe', p, { L: 60, D: 52, n: 4 });
    case 'bacha': return simple('bacha', p, { L: 80 });
    case 'bachaFarm': return simple('bachaFarm', p, { L: 80, D: 50 });
    case 'heladera': return simple('heladera', p, { L: 70, D: 70, H: 190 });
    default: return simple(it.t, p, {});
  }
}

/* ---------- la cocina de cada casa, como la ve la página ---------- */
export async function cocina(casa, dbDir) {
  const F = FUENTES[casa];
  let items = null, fuente = 'código', escenario = null;
  const f = dbDir && path.join(dbDir, F.doc[0], F.doc[1] + '.json');
  if (f && fs.existsSync(f)) {
    let d = JSON.parse(fs.readFileSync(f, 'utf8')); d = d.data || d;
    if (d.esc && d.esc[d.activo]) { items = d.esc[d.activo].items; escenario = d.activo + ' · ' + (d.esc[d.activo].nombre || ''); fuente = 'base'; }
  }
  if (!items) {
    const mod = await import(pathToFileURL(path.resolve(F.mod)).href);
    let uid = 1; const it = (t, x, y, r, p = {}, z) => ({ id: 'm' + (uid++), t, x, y, r, p, ...(z != null ? { z } : {}) });
    const itA = a => { let n = 1; return (t, x, y, r, p = {}, z) => ({ id: a + '_' + (n++), t, x: Math.round(x), y: Math.round(y), r, p, ...(z != null ? { z } : {}) }); };
    const R = mod[F.fn]({ it, itA, mover: x => x, SILLAS: () => [], MESA3: () => [], PISO: 0 });
    const A = R.AMB[F.amb], e = A.esc(), act = A.activo && e[A.activo] ? A.activo : Object.keys(e)[0];
    items = e[act].items; escenario = act + ' · ' + e[act].nombre;
  }
  const piezas = {};
  for (const it of items) piezas[it.id] = Object.assign({ id: it.id, z: it.z }, pieza(it));
  return { casa, modelo: F.modelo, fuente, escenario, piezas };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const a = process.argv.slice(2), dbDir = a.includes('--db') ? a[a.indexOf('--db') + 1] : null, una = a.includes('--casa') ? a[a.indexOf('--casa') + 1] : null;
  const out = {};
  for (const c of una ? [una] : Object.keys(FUENTES)) out[c] = await cocina(c, dbDir);
  console.log(JSON.stringify(out, null, 1));
}
export { m, m2 };
