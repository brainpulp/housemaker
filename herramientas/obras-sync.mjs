/* Lleva el cómputo de las cocinas (computo.mjs) a la tabla de Compras de la página Obras (Maxi 13/11/2026).
   - Cada fila listada en obras-computo.json toma del modelo sus medidas y, si corresponde, la cantidad. Material, opciones, precios,
     estado, nota y tarea son de Maxi y no se tocan.
   - Si una pieza mapeada ya no está en el modelo, la fila no se borra: se marca con «modeloAviso».
   - Las piezas de cocina del modelo que no tienen fila (ni están en noCompra) generan una fila nueva en estado «dudoso».
   No escribe en la base: deja en --out un archivo por documento y escrituras.json para ArtifactData batch (hay que poner if_version
   con la versión de cada documento, que da el listado de ArtifactData).

   Uso: node herramientas/obras-sync.mjs --computo <computo.json> --compras <carpeta con los .json de la colección compras> --out <carpeta> [--hoy AAAA-MM-DD] */
import fs from 'fs';
import path from 'path';

const a = process.argv.slice(2), arg = k => a.includes(k) ? a[a.indexOf(k) + 1] : null;
const COMP = JSON.parse(fs.readFileSync(arg('--computo'), 'utf8'));
const MAPA = JSON.parse(fs.readFileSync(new URL('./obras-computo.json', import.meta.url), 'utf8'));
const DIR = arg('--compras'), OUT = arg('--out'), HOY = arg('--hoy') || new Date().toISOString().slice(0, 10);
fs.mkdirSync(OUT, { recursive: true });

const m = cm => (cm / 100).toFixed(2).replace('.', ',');
const n1 = x => Math.round(x * 10) / 10;
const sum = (ps, f) => ps.reduce((s, p) => s + (f(p) || 0), 0);
const cajCount = p => p.cajones || 0, putCount = p => p.puertas || 0;

/* cada campo: piezas → { medidas, cant? } */
const CAMPOS = {
  tapa: (ps, f, C) => { const p = ps[0], t = p.tapa, h = t.huecos.length ? t.huecos : (f.bacha && C.piezas[f.bacha] ? [{ L: C.piezas[f.bacha].L }] : []);
    return { medidas: `${m(t.L)} × ${m(t.D)}` + (t.zocalo ? `, con zócalo plegado de ${m(t.zocalo)} contra la pared` : '') + h.map(x => `, hueco para bacha ${m(x.L)}${x.D ? ' × ' + m(x.D) : ''}`).join(''), cant: t.m2 }; },
  tapaBloque: ps => ({ medidas: `${m(ps[0].tapaBloque.L)} × ${m(ps[0].tapaBloque.D)}`, cant: ps[0].tapaBloque.m2 }),
  laterales: ps => { const l = ps[0].laterales; return { medidas: `${l.lados.map(m).join(' + ')} × ${m(l.alto)} de alto`, cant: l.m2 }; },
  frentesCajones: ps => ({ medidas: (new Set(ps[0].anchosCaj || [])).size > 1 ? `${ps[0].columnasCaj} columnas (${ps[0].anchosCaj.map(m).join(' · ')}) × ${ps[0].filas} cajones` : `${ps[0].columnasCaj} columnas de ${m(ps[0].anchoCaj)} × ${ps[0].filas} cajones`, cant: ps[0].cajones }),
  cajasCajones: ps => { const p = ps[0], w = p.t === 'mesada' ? p.anchoCaj : p.anchoCol, va = p.t === 'mesada' && (new Set(p.anchosCaj || [])).size > 1; return { medidas: `${p.cajones} cajas${p.falso ? ' de ollas' : ''} de ${va ? p.anchosCaj.map(x => '~' + m(x - 4)).join(' · ') : '~' + m(w - 4)} de ancho, ${m(p.fondoCajon)} de fondo`, cant: p.cajones }; },
  panelCiego: ps => ({ medidas: `${m(ps[0].ciego)} × ${m(ps[0].frenteH)}`, cant: ps[0].ciego ? 1 : 0 }),
  frentesBloque: ps => { const p = ps[0]; const partes = [`${p.cajones} cajones${p.falso ? ' de ollas' : ''} de ~${m(p.anchoCol)}`];
    if (p.falso) partes.push(`tira fija de ${m(p.falso)} bajo el anafe`); if (p.ciego) partes.push(`panel fijo de ${m(p.ciego)} del lado de la mesada`);
    return p.falso || p.ciego ? { medidas: partes.join(' + ') } : { medidas: `${p.columnas} columnas × ${p.filas} cajones`, cant: p.cajones }; },
  frentesJuego: ps => ({ medidas: `${ps[0].columnas} columnas × ${ps[0].filas} cajones` }),
  carcasas: ps => { const n = sum(ps, p => p.modulos); return { medidas: `${n} módulos`, cant: n }; },
  guias: ps => ({ medidas: `largo 45 cm, ${sum(ps, cajCount)} cajones`, cant: sum(ps, cajCount) }),
  tiradores: ps => { const c = sum(ps, cajCount), u = sum(ps, putCount); return { medidas: [c ? `${c} cajones` : '', u ? `${u} puertas` : ''].filter(Boolean).join(' + '), cant: c + u }; },
  mesaIsla: ps => ({ medidas: `${m(ps[0].mesa.L)} × ${m(ps[0].mesa.D)} menos el bloque`, cant: ps[0].mesa.m2 }),
  timon: ps => ({ medidas: `timón ${m(ps[0].timon.L)} × ${m(ps[0].timon.H)}, ½″` }),
  puertaTablero: ps => ({ medidas: `${m(ps[0].L)} × ${m(ps[0].H)}, separada ${m(ps[0].caja)} de la pared` }),
  campana: ps => ({ medidas: `isla, ${m(ps[0].L)} × ${m(ps[0].D)}` }),
  ancho: ps => ({ medidas: `${m(ps[0].L)} de ancho` }),
  LxD: ps => ({ medidas: `${m(ps[0].L)} × ${m(ps[0].D)}` }),
  LxDxH: ps => ({ medidas: `${m(ps[0].L)} × ${m(ps[0].D)} × ${m(ps[0].H)}` }),
  bancos: ps => ({ medidas: [...new Set(ps.map(p => m(p.L)))].join(' y '), cant: ps.length }),
  cuenta: (ps, f) => ({ medidas: f.medidas || '', cant: ps.length }),
  bachaFarm: ps => ({ medidas: `farm ${m(ps[0].L)} × ${m(ps[0].D)}` }),
  bacha: ps => ({ medidas: `bajo mesada ${m(ps[0].L)}` }),
  anafe: ps => ({ medidas: `${ps[0].n} hornallas` }),
  modulo: ps => ({ medidas: `${m(ps[0].L)} × ${m(ps[0].D)}`, cant: ps[0].modulos }),
  puertas: ps => ({ medidas: `${ps[0].puertas} de ${m(ps[0].anchoPuerta)} × ${m(ps[0].frenteH)}`, cant: ps[0].puertas }),
  bisagras: ps => ({ medidas: `${sum(ps, putCount)} puertas, 2 por puerta`, cant: sum(ps, putCount) * 2 }),
  bandejero: ps => ({ medidas: `${m(ps[0].bandejero)} × ${m(ps[0].frenteH)}`, cant: ps[0].bandejero ? 1 : 0 }),
  puertasAlacena: ps => { const n = sum(ps, putCount); return { medidas: `${n} de ~${m(ps[0].anchoPuerta)} × ${m(ps[0].H)}, proyectables`, cant: n }; },
  bandejeroAlacena: ps => ({ medidas: `${m(ps[0].bandejero)} × ${m(ps[0].H)}`, cant: ps[0].bandejero ? 1 : 0 }),
  brazos: ps => { const n = sum(ps, putCount); return { medidas: `${n} puertas`, cant: n }; },
  led: ps => { const L = sum(ps, p => p.led); return { medidas: `${m(L)} m`, cant: Math.ceil(L / 100) }; },
  revestimiento: ps => ({ medidas: `${m(ps[0].L)} × ${m(ps[0].H)}`, cant: n1(ps[0].L * ps[0].H / 1e4) }),
  estante: ps => ({ medidas: `${m(ps[0].L)} × ${m(ps[0].D)} × ${ps[0].e} cm, a ${m(ps[0].z)}` }),
  columna: ps => ({ medidas: `${m(ps[0].L)} × ${m(ps[0].D)} × ${m(ps[0].H)}, ${ps[0].cajones} cajones${ps[0].puertas ? ' + puerta' : ''}` }),
};
/* tipos que se compran: si aparece una pieza de estos sin fila, se agrega */
const NOMBRE = { mesada: 'Mesada (nueva en el modelo)', islaMesa: 'Isla con mesa (nueva en el modelo)', isla: 'Isla (nueva en el modelo)', alacena: 'Alacena (nueva en el modelo)', columna: 'Columna (nueva en el modelo)', revestimiento: 'Revestimiento (nuevo en el modelo)', estante: 'Estante (nuevo en el modelo)', salpicadero: 'Salpicadero (nuevo en el modelo)', campanaIsla: 'Campana (nueva en el modelo)', anafe: 'Anafe (nuevo en el modelo)', bacha: 'Bacha (nueva en el modelo)', bachaFarm: 'Bacha farm (nueva en el modelo)', heladera: 'Heladera (nueva en el modelo)', mesa: 'Mesa (nueva en el modelo)', mesaMaciza: 'Mesa (nueva en el modelo)', mesaComedor: 'Mesa (nueva en el modelo)', bancoTabla: 'Banco (nuevo en el modelo)', sillaCover: 'Sillas (nuevas en el modelo)' };

const filas = {};
for (const f of fs.readdirSync(DIR)) if (f.endsWith('.json')) { let d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); d = d.data || d; filas[f.slice(0, -5)] = d; }

const escrituras = [], informe = { actualizadas: [], sinCambios: [], avisos: [], nuevas: [] };
const usadas = {};
for (const [id, f] of Object.entries(MAPA.filas)) {
  const casa = id.split('-')[0], C = COMP[casa], fila = filas[id];
  if (!C || !fila) { informe.avisos.push(`${id}: ${!fila ? 'no está en Compras' : 'no hay cómputo de ' + casa}`); continue; }
  usadas[casa] = usadas[casa] || new Set();
  const ps = []; let falta = [];
  for (const sel of f.piezas) {
    if (sel.startsWith('t:')) { const t = sel.slice(2); Object.values(C.piezas).filter(p => p.t === t).forEach(p => { ps.push(p); usadas[casa].add(p.id); }); usadas[casa].add(sel); }
    else if (C.piezas[sel]) { ps.push(C.piezas[sel]); usadas[casa].add(sel); } else falta.push(sel);
  }
  if (f.bacha) usadas[casa].add(f.bacha);
  const sello = { piezas: f.piezas, campo: f.campo, modelo: C.modelo, escenario: C.escenario, fecha: HOY };
  if (falta.length || !ps.length) {
    const aviso = `Ya no está en el modelo 3D (${falta.join(', ') || f.piezas.join(', ')}) al ${HOY}`;
    if (!(fila.modeloAviso || '').startsWith('Ya no está en el modelo 3D')) { escrituras.push({ id, data: { modeloAviso: aviso, modelo: sello } }); informe.avisos.push(`${id} «${fila.que}»: ${aviso}`); }
    continue;
  }
  const r = CAMPOS[f.campo](ps, f, C), medidas = r.medidas + (f.extra ? ', ' + f.extra : '');
  const patch = {};
  if (medidas !== fila.medidas) patch.medidas = medidas;
  if (r.cant != null && +r.cant !== +fila.cant) patch.cant = r.cant;
  if (fila.modeloAviso) patch.modeloAviso = { __delete__: true };
  const cambio = Object.keys(patch).filter(k => k !== 'modeloAviso');
  if (cambio.length || !fila.modelo || fila.modelo.campo !== f.campo || JSON.stringify(fila.modelo.piezas) !== JSON.stringify(f.piezas) || fila.modeloAviso) {
    patch.modelo = sello; escrituras.push({ id, data: patch });
    if (cambio.length) informe.actualizadas.push(`${id} «${fila.que}»: ` + cambio.map(k => `${k} ${JSON.stringify(fila[k])} → ${JSON.stringify(patch[k])}`).join('; '));
    else informe.sinCambios.push(id + ' (sólo el sello del modelo)');
  } else informe.sinCambios.push(id);
}
/* piezas nuevas */
for (const [casa, C] of Object.entries(COMP)) {
  const no = new Set(MAPA.noCompra[casa] || []), us = usadas[casa] || new Set(), ord = Math.max(0, ...Object.values(filas).filter(r => r.proyecto === casa).map(r => r.orden || 0));
  const porTipo = {};
  for (const p of Object.values(C.piezas)) { if (!NOMBRE[p.t] || us.has(p.id) || no.has(p.id) || no.has('t:' + p.t) || (p.t === 'sillaCover' && us.has('t:sillaCover'))) continue; (porTipo[p.t] = porTipo[p.t] || []).push(p); }
  let k = 0;
  for (const [t, ps] of Object.entries(porTipo)) for (const p of (t === 'sillaCover' ? [ps[0]] : ps)) {
    k++; const id = `${casa}-m${p.id.replace(/[^A-Za-z0-9]/g, '')}`;
    if (filas[id]) continue;
    const dims = ['L', 'D', 'H'].filter(x => p[x] != null && typeof p[x] === 'number').map(x => m(p[x])).join(' × ');
    const sello = { piezas: t === 'sillaCover' ? ['t:sillaCover'] : [p.id], campo: t === 'sillaCover' ? 'cuenta' : 'nueva', modelo: C.modelo, escenario: C.escenario, fecha: HOY };
    escrituras.push({ id, nueva: true, data: { proyecto: casa, rubro: 'Cocina', que: NOMBRE[t], medidas: dims, cant: t === 'sillaCover' ? ps.length : 1, unidad: 'u', material: '', opciones: [], precios: {}, precio: null, moneda: 'ARS', estado: 'dudoso', nota: `Apareció en el modelo 3D el ${fecha(HOY)}: falta ponerle nombre, material y precio`, orden: ord + 10 * k, modelo: sello, ts: new Date().toISOString() } });
    informe.nuevas.push(`${id}: ${NOMBRE[t]} ${dims}`);
  }
}
function fecha(d) { const [y, mm, dd] = d.split('-'); return `${+dd}/${+mm}/${y}`; }

for (const e of escrituras) fs.writeFileSync(path.join(OUT, e.id + '.json'), JSON.stringify(e.data, null, 1));
fs.writeFileSync(path.join(OUT, 'escrituras.json'), JSON.stringify(escrituras.map(e => ({ op: e.nueva ? 'set' : 'update', collection: 'compras', doc_id: e.id, file_path: path.resolve(OUT, e.id + '.json') })), null, 1));
console.log(JSON.stringify(informe, null, 1));
