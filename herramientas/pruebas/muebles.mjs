/* Muebles: que ningún mueble de ningún escenario se meta en el edificio (paredes, columnas, escaleras, losas, artefactos del SketchUp).
   Para cada escenario (A, B, C…) lo pone activo en todos los ambientes y prueba la caja de cada mueble (achicada 2 cm de costado y
   5 cm desde el piso, para no contar el apoyo) contra los triángulos de las piezas de la casa.
   Uso: URL=http://localhost:8765/<casa>/_prueba.html CHROMIUM=… node herramientas/pruebas/muebles.mjs   (sale con 1 si hay choques) */
import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: process.env.CHROMIUM, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 800, height: 600 } }); const err = []; p.on('pageerror', e => err.push(e.message));
await p.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('carhue-calidad', 'minimo'); } catch (e) {} });
await p.goto(process.env.URL + '#3d', { waitUntil: 'networkidle', timeout: 300000 }); await p.waitForTimeout(12000);
const r = await p.evaluate(async () => { const v = window.__visor, T = v.THREE; if (!v.equip) return { sin: true };
  const ST = v.equip.ST.mue, letras = [...new Set(Object.values(ST).flatMap(s => Object.keys(s.esc)))].sort(), out = {};
  const tri = new T.Triangle(), a = new T.Vector3(), b = new T.Vector3(), c = new T.Vector3();
  const partes = []; for (const q of v.parts) { if (!q.grp.visible) continue; q.grp.updateMatrixWorld(true); q.grp.traverse(o => { if (o.isMesh) partes.push([q.id, o, new T.Box3().setFromObject(o)]); }); }
  for (const L of letras) { for (const a2 in ST) { if (ST[a2].esc[L]) ST[a2].activo = L; } v.equip.rearmar(); await new Promise(r => setTimeout(r, 800));
    const G = v.scene.getObjectByName('equipamiento'), malos = [];
    for (const g of G.children) { if (!g.userData.item || g.userData.capa !== 'mue' || g.visible === false) continue; const bb = new T.Box3().setFromObject(g); if (bb.isEmpty()) continue;
      bb.min.x += 2; bb.min.z += 2; bb.max.x -= 2; bb.max.z -= 2; bb.min.y += 5; bb.max.y -= 1; const hit = new Set();
      for (const [id, o, pb] of partes) { if (!pb.intersectsBox(bb)) continue; const P = o.geometry.attributes.position, I = o.geometry.index, n = I ? I.count : P.count;
        for (let i = 0; i < n; i += 3) { a.fromBufferAttribute(P, I ? I.getX(i) : i).applyMatrix4(o.matrixWorld); b.fromBufferAttribute(P, I ? I.getX(i + 1) : i + 1).applyMatrix4(o.matrixWorld); c.fromBufferAttribute(P, I ? I.getX(i + 2) : i + 2).applyMatrix4(o.matrixWorld);
          tri.set(a, b, c); if (tri.getArea() > .5 && bb.intersectsTriangle(tri)) { hit.add(id); break; } } }
      if (hit.size) malos.push(`${g.userData.amb}/${g.userData.item} → ${[...hit].join(', ')}`); }
    out[L] = { n: G.children.filter(g => g.userData.item && g.userData.capa === 'mue' && g.visible !== false).length, malos }; }
  return out; });
await b.close();
if (r.sin) { console.log('muebles: la casa no tiene equipamiento'); process.exit(0); }
let tot = 0; for (const [L, { n, malos }] of Object.entries(r)) { console.log(`muebles, escenario ${L}: ${n} muebles, ${malos.length} choques`); for (const m of malos) console.log('  ✗ ' + m); tot += malos.length; }
if (err.length) console.log('errores de la página:', err.slice(0, 3));
process.exit(tot || err.length ? 1 : 0);
