/* Intersecciones (guía de diseño 10, «Mirar las intersecciones»): dos cosas no ocupan el mismo lugar.
   Abre la casa en el navegador y, para cada pieza «cosa» (artefactos, muebles, estructura, mampostería, placas…),
   prueba cada una de sus cajas (achicada 1 cm, para que apoyar o tocar no cuente) contra los triángulos de todas las demás
   piezas: muros, losas, vidrios, escaleras y las otras cosas. Lo que se cruza se lista: es un error, salvo los encuentros
   constructivos que se esperan (una viga dentro de su losa, una columna que entra en el muro, un cabio sobre su viga…).
   Uso: URL=http://localhost:8765/<casa>/_prueba.html node herramientas/pruebas/intersecciones.mjs [--todo]
   Sale con código 1 si hay cruces. --todo lista también los encuentros esperados. */
import { chromium } from 'playwright';
const todo = process.argv.includes('--todo');
const b = await chromium.launch({ ...(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 900, height: 600 } });
p.on('pageerror', e => console.log('PE ' + e.message));
await p.goto(process.env.URL + '#3d', { waitUntil: 'networkidle', timeout: 300000 }); await p.waitForTimeout(6000);
const r = await p.evaluate(async () => {
  let DUDAS = []; try { DUDAS = (await import(new URL('modelo.js', location.href).href)).DUDAS || []; } catch (e) {}
  const base = x => x.replace(/[a-z]+$/, ''), duda = (a, b2) => (DUDAS.find(d => (d.ref || []).includes(base(a)) && (d.ref || []).includes(base(b2))) || {}).id;
  const v = window.__visor, T = v.THREE;
  /* qué se prueba como «cosa» y qué encuentros entre categorías son constructivos (se esperan) */
  const COSA = new Set(['artefacto', 'mueble', 'placa', 'mamposteria', 'col', 'viga', 'madera', 'zanca', 'herreria', 'poste']);
  const IGNORAR = /^(calco|cota|guia|pasto|vereda|terreno)/;
  const ESPERADO = [['viga', 'losa'], ['viga', 'muro'], ['viga', 'medianera'], ['viga', 'tabique'], ['viga', 'viga'], ['col', 'viga'], ['col', 'losa'], ['col', 'muro'], ['col', 'medianera'],
    ['madera', 'madera'], ['madera', 'viga'], ['madera', 'muro'], ['madera', 'medianera'], ['herreria', 'viga'], ['herreria', 'madera'], ['herreria', 'losa'], ['zanca', 'losa'], ['zanca', 'piso'], ['zanca', 'escalera'], ['zanca', 'escext'],
    ['col', 'tabique'], ['madera', 'escalera'], ...['viga', 'col', 'zanca', 'madera', 'herreria', 'poste'].flatMap(c => ['tabla1', 'tabla2', 'tabla3', 'piso'].map(t => [c, t]))];
  const ENC = (window.__encastres || []), encastre = (a, b2) => ENC.find(([x, y]) => (a.startsWith(x) && b2.startsWith(y)) || (a.startsWith(y) && b2.startsWith(x)));
  const esperado = (a, c) => ESPERADO.some(([x, y]) => (a === x && c === y) || (a === y && c === x));
  const parts = v.parts.filter(q => q.geos && !IGNORAR.test(q.cat || '') && !v.isHidden(q.id));
  /* triángulos de todas las piezas, en una grilla de 50 cm */
  const C = 50, grid = new Map(), tris = [], key = (i, j, k) => i + ',' + j + ',' + k;
  for (const q of parts) { const m = q.grp && q.grp.matrixWorld ? (q.grp.updateMatrixWorld(true), q.grp.matrixWorld) : null;
    for (const g of q.geos) { const pa = g.getAttribute && g.getAttribute('position'); if (!pa) continue; const ix = g.index ? g.index.array : null, n = ix ? ix.length : pa.count;
      const V = i => { const w = new T.Vector3(pa.getX(i), pa.getY(i), pa.getZ(i)); return m ? w.applyMatrix4(m) : w; };
      for (let t = 0; t < n; t += 3) { const a = V(ix ? ix[t] : t), bb = V(ix ? ix[t + 1] : t + 1), c = V(ix ? ix[t + 2] : t + 2);
        const id = tris.length; tris.push({ a, b: bb, c, q });
        const lo = [Math.min(a.x, bb.x, c.x), Math.min(a.y, bb.y, c.y), Math.min(a.z, bb.z, c.z)], hi = [Math.max(a.x, bb.x, c.x), Math.max(a.y, bb.y, c.y), Math.max(a.z, bb.z, c.z)];
        for (let i = Math.floor(lo[0] / C); i <= Math.floor(hi[0] / C); i++) for (let j = Math.floor(lo[1] / C); j <= Math.floor(hi[1] / C); j++) for (let k = Math.floor(lo[2] / C); k <= Math.floor(hi[2] / C); k++) { const K = key(i, j, k); if (!grid.has(K)) grid.set(K, []); grid.get(K).push(id); } } } }
  /* (prueba de caja reemplazada por la de sólidos convexos, abajo) */
  const triBox = (cen, h, A, B, Cc) => { const v0 = A.clone().sub(cen), v1 = B.clone().sub(cen), v2 = Cc.clone().sub(cen), e = [v1.clone().sub(v0), v2.clone().sub(v1), v0.clone().sub(v2)], ax = [new T.Vector3(1, 0, 0), new T.Vector3(0, 1, 0), new T.Vector3(0, 0, 1)];
    const sep = L => { if (L.lengthSq() < 1e-12) return false; const p0 = v0.dot(L), p1 = v1.dot(L), p2 = v2.dot(L), rr = h.x * Math.abs(L.x) + h.y * Math.abs(L.y) + h.z * Math.abs(L.z); return Math.min(p0, p1, p2) > rr || Math.max(p0, p1, p2) < -rr; };
    for (const u of ax) for (const ed of e) if (sep(u.clone().cross(ed))) return false;
    for (const u of ax) if (sep(u)) return false;
    return !sep(e[0].clone().cross(e[1])); };
  /* cada geometría de una «cosa» se toma como un sólido convexo (cajas, prismas, cilindros), achicado 1 cm hacia su centro,
     y se prueba contra los triángulos vecinos por separación de ejes: normales de sus caras, normal del triángulo y productos de aristas */
  /* una pieza puede venir fundida en una sola geometría (varias luces, todos los cabios): se separa en trozos conexos */
  const trozos = (g, m) => { const pa = g.getAttribute('position'), ix = g.index ? g.index.array : null, n = ix ? ix.length : pa.count, V = [];
    for (let i = 0; i < pa.count; i++) { const w = new T.Vector3(pa.getX(i), pa.getY(i), pa.getZ(i)); V.push(m ? w.applyMatrix4(m) : w); }
    const id = new Map(), par = [], f = a => { while (par[a] !== a) a = par[a] = par[par[a]]; return a; }, k = w => Math.round(w.x * 10) + ',' + Math.round(w.y * 10) + ',' + Math.round(w.z * 10);
    const vid = i => { const K = k(V[i]); if (!id.has(K)) { id.set(K, par.length); par.push(par.length); } return id.get(K); };
    const T3 = []; for (let t = 0; t < n; t += 3) { const a = vid(ix ? ix[t] : t), b2 = vid(ix ? ix[t + 1] : t + 1), c = vid(ix ? ix[t + 2] : t + 2); par[f(a)] = f(b2); par[f(b2)] = f(c); T3.push([ix ? ix[t] : t, ix ? ix[t + 1] : t + 1, ix ? ix[t + 2] : t + 2, a]); }
    const G = new Map(); for (const [i0, i1, i2, a] of T3) { const r = f(a); if (!G.has(r)) G.set(r, []); G.get(r).push(V[i0], V[i1], V[i2]); }
    return [...G.values()]; };
  const convexo = tri => { const P0 = tri;
    const c = P0.reduce((a, b2) => a.add(b2), new T.Vector3()).multiplyScalar(1 / P0.length);
    const enc = (a, b2) => { const d = a - b2; return Math.abs(d) > 1.2 ? a - Math.sign(d) : b2; };   /* cada vértice 1 cm hacia adentro en cada eje */
    const P = P0.map(w => new T.Vector3(enc(w.x, c.x), enc(w.y, c.y), enc(w.z, c.z)));
    const n = P0.length, N = [], E = [];
    const addDir = (arr, d) => { if (d.lengthSq() < 1e-8) return; d.normalize(); if (!arr.some(u => Math.abs(u.dot(d)) > .9999)) arr.push(d); };
    for (let t = 0; t < n; t += 3) { const a = P0[t], b2 = P0[t + 1], cc = P0[t + 2];
      const e1 = b2.clone().sub(a), e2 = cc.clone().sub(a); addDir(N, e1.clone().cross(e2)); addDir(E, e1); addDir(E, e2); addDir(E, cc.clone().sub(b2)); }
    const bx = new T.Box3().setFromPoints(P);
    /* ¿es convexo? (todos los vértices del lado de adentro de cada cara); si no, se prueba triángulo contra triángulo */
    let conv = true; const dc = []; for (let t = 0; t < n && conv; t += 3) { const a = P0[t], nn = P0[t + 1].clone().sub(a).cross(P0[t + 2].clone().sub(a)); if (nn.lengthSq() < 1e-8) continue; nn.normalize(); const d0 = nn.dot(a);
      let pos = 0, neg = 0; for (const w of P0) { const d = nn.dot(w) - d0; if (d > .5) pos++; else if (d < -.5) neg++; } if (pos && neg) conv = false; }
    return { P, N, E, bx, conv, tris: P0 }; };
  /* triángulo contra triángulo, con 0,5 cm de tolerancia: apoyar o tocar no cuenta */
  const triTri = (A, B) => { const ea = [A[1].clone().sub(A[0]), A[2].clone().sub(A[1]), A[0].clone().sub(A[2])], eb = [B[1].clone().sub(B[0]), B[2].clone().sub(B[1]), B[0].clone().sub(B[2])];
    const ejes = [ea[0].clone().cross(ea[1]), eb[0].clone().cross(eb[1])]; for (const x of ea) for (const y of eb) ejes.push(x.clone().cross(y));
    for (const L of ejes) { if (L.lengthSq() < 1e-10) continue; L.normalize(); const [a0, a1] = proj(A, L), [b0, b1] = proj(B, L);
      /* un triángulo plano proyecta un punto sobre su normal: ahí se pide que el otro lo cruce de verdad (más de 0,5 de cada lado) */
      if (a1 - a0 < 1e-6) { if (!(b0 < a0 - .5 && b1 > a0 + .5)) return false; continue; }
      if (b1 - b0 < 1e-6) { if (!(a0 < b0 - .5 && a1 > b0 + .5)) return false; continue; }
      if (Math.min(a1, b1) - Math.max(a0, b0) < .5) return false; }
    return true; };
  const proj = (pts, L) => { let lo = 1e18, hi = -1e18; for (const w of pts) { const d = w.dot(L); if (d < lo) lo = d; if (d > hi) hi = d; } return [lo, hi]; };
  const choca = (S, A, B, Cc) => { const tri = [A, B, Cc], te = [B.clone().sub(A), Cc.clone().sub(B), A.clone().sub(Cc)];
    const ejes = [...S.N, te[0].clone().cross(te[1])]; for (const e of S.E) for (const f of te) ejes.push(e.clone().cross(f));
    for (const L of ejes) { if (L.lengthSq() < 1e-10) continue; const [a0, a1] = proj(S.P, L), [b0, b1] = proj(tri, L); if (a1 < b0 || b1 < a0) return false; }
    return true; };
  const out = new Map();
  for (const q of parts) { if (!COSA.has(q.cat)) continue; const m = q.grp && q.grp.matrixWorld ? q.grp.matrixWorld : null;
    for (const g of q.geos) for (const tr of (g.getAttribute && g.getAttribute('position') ? trozos(g, m) : [])) { const S = convexo(tr), bx = S.bx; if (bx.isEmpty()) continue; const seen = new Set();
      for (let i = Math.floor(bx.min.x / C); i <= Math.floor(bx.max.x / C); i++) for (let j = Math.floor(bx.min.y / C); j <= Math.floor(bx.max.y / C); j++) for (let k = Math.floor(bx.min.z / C); k <= Math.floor(bx.max.z / C); k++)
        for (const id of grid.get(key(i, j, k)) || []) { if (seen.has(id)) continue; seen.add(id); const t = tris[id]; if (t.q === q) continue;
          const K = [q.id, t.q.id].sort().join(' × '); if (out.has(K)) continue;
          const tb = new T.Box3().setFromPoints([t.a, t.b, t.c]); if (!tb.intersectsBox(bx)) continue;
          const hit = S.conv && S.E.length <= 24 ? choca(S, t.a, t.b, t.c) :   /* con muchas aristas (cilindros) la separación por caras no alcanza: triángulo contra triángulo */ (() => { for (let u = 0; u < S.tris.length; u += 3) if (triTri([S.tris[u], S.tris[u + 1], S.tris[u + 2]], [t.a, t.b, t.c])) return true; return false; })();
          if (hit) { const cz = (Math.max(bx.min.y, tb.min.y) + Math.min(bx.max.y, tb.max.y)) / 2; out.set(K, { a: q.id, ca: q.cat, b: t.q.id, cb: t.q.cat, z: Math.round(cz), esperado: esperado(q.cat, t.q.cat) || !!encastre(q.id, t.q.id), duda: duda(q.id, t.q.id) }); } } } }
  return [...out.values()];
});
const buenos = r.filter(x => x.esperado), pend = r.filter(x => !x.esperado && x.duda), malos = r.filter(x => !x.esperado && !x.duda);
console.log(`intersecciones: ${malos.length} cruces, ${pend.length} pendientes de una duda, ${buenos.length} encuentros constructivos esperados`);
for (const x of malos) console.log(`  ✗ ${x.a} (${x.ca}) se mete en ${x.b} (${x.cb}), a +${(x.z / 100).toFixed(2)}`);
for (const x of pend) console.log(`  ? ${x.a} (${x.ca}) se mete en ${x.b} (${x.cb}), a +${(x.z / 100).toFixed(2)} (pregunta ${x.duda})`);
if (todo) for (const x of buenos) console.log(`  · ${x.a} (${x.ca}) en ${x.b} (${x.cb})`);
await b.close();
process.exit(malos.length ? 1 : 0);
