/* Prueba del editor de octet truss (casas/octet): la página carga, el panel Octet se abre, y agregar, quitar, mover y deshacer hacen lo que dicen.
   Uso: bash herramientas/armar.sh octet --prueba; python3 -m http.server 8765 --directory dist &
        URL=http://localhost:8765/octet/_prueba.html CHROMIUM=<headless_shell> node herramientas/pruebas/octet.mjs [carpeta de capturas] */
import { chromium } from 'playwright';
const OUT = process.argv[2];
const b = await chromium.launch({ ...(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1300, height: 800 } }); const errs = []; p.on('pageerror', e => errs.push('PE ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/TUNNEL|fonts|favicon|404/.test(m.text())) errs.push('C ' + m.text().slice(0, 200)); });
await p.goto(process.env.URL || 'http://localhost:8765/octet/_prueba.html', { waitUntil: 'networkidle', timeout: 120000 });
await p.evaluate(() => { localStorage.setItem('carhue-calidad', 'minimo'); localStorage.removeItem('octet-modelos'); localStorage.removeItem('octet-cur'); }); await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(6000);
const st = () => p.evaluate(() => ({ ok: window.__ok3d, parts: window.__visor.parts.length, oct: window.__octet && window.__octet.abierto, nodos: Object.keys(window.__octet.modelo.nodos).length, tubos: window.__octet.modelo.struts.length }));
const enPantalla = id => p.evaluate(id => { const v = window.__visor; const pp = v.parts.find(x => x.id === id); if (!pp) return null; const c = pp.bb.getCenter(new v.THREE.Vector3()); c.project(v.camera); const r = v.renderer.domElement.getBoundingClientRect(); return [r.left + (c.x + 1) / 2 * r.width, r.top + (1 - c.y) / 2 * r.height]; }, id);
let ok = true; const check = (c, t) => { console.log((c ? 'ok  ' : 'MAL ') + t); if (!c) ok = false; };
const s0 = await st(); check(s0.ok && s0.oct && s0.nodos === 20 && s0.tubos === 57, `carga: ${JSON.stringify(s0)}`);
if (OUT) await p.screenshot({ path: OUT + '/octet-1.png' });
/* agregar: tocar el nodo 0,0,2 (está bajo el vidrio) y después el primer fantasma */
await p.evaluate(() => window.__octet.setTool('agregar')); const pn = await enPantalla('N:0,0,2'); await p.mouse.click(pn[0], pn[1]); await p.waitForTimeout(400);
const nf = await p.evaluate(() => window.__visor.scene.getObjectByName('octet-fantasmas').children.length); check(nf === 18, `fantasmas del nodo 0,0,2 (9 direcciones libres × tubo y punta): ${nf}`);
const pg = await p.evaluate(() => { const v = window.__visor; const g = v.scene.getObjectByName('octet-fantasmas'); const sp = g.children.find(c => c.geometry.type === 'SphereGeometry'); const c = sp.position.clone(); c.project(v.camera); const r = v.renderer.domElement.getBoundingClientRect(); return [r.left + (c.x + 1) / 2 * r.width, r.top + (1 - c.y) / 2 * r.height, sp.userData.oct]; });
await p.mouse.click(pg[0], pg[1]); await p.waitForTimeout(500); const s1 = await st(); check(s1.tubos === 58 && s1.nodos === 21, `agregar: ${JSON.stringify(s1)}`);
if (OUT) await p.screenshot({ path: OUT + '/octet-2.png' });
/* quitar ese tubo */
await p.evaluate(() => window.__octet.setTool('quitar')); const ps = await enPantalla('S:' + [pg[2].a, pg[2].b].sort().join('|')); check(!!ps, 'el tubo nuevo es una pieza'); if (ps) { await p.mouse.click(ps[0], ps[1]); await p.waitForTimeout(500); }
const s2 = await st(); check(s2.tubos === 57 && s2.nodos === 20, `quitar: ${JSON.stringify(s2)}`);
/* mover todo dos capas arriba y deshacer */
await p.evaluate(() => { window.__octet.setTool('mover'); document.getElementById('octSelTodo').click(); document.querySelector('[data-mv="0,0,2"]').click(); }); await p.waitForTimeout(500);
const k0 = await p.evaluate(() => Object.keys(window.__octet.modelo.nodos).every(k => +k.split(',')[2] >= 2)); check(k0, 'mover: todos los nodos dos capas más arriba');
await p.evaluate(() => document.getElementById('octUndo').click()); await p.waitForTimeout(400);
const k1 = await p.evaluate(() => Object.keys(window.__octet.modelo.nodos).some(k => +k.split(',')[2] === 0)); check(k1, 'deshacer: vuelve a la capa 0');
/* bloque y vaciar */
await p.evaluate(() => { document.getElementById('octBx').value = 2; document.getElementById('octBz').value = 2; document.getElementById('octBc').value = 2; document.getElementById('octBloque').click(); }); await p.waitForTimeout(500);
const s3 = await st(); check(s3.nodos > 20, `bloque agregado: ${JSON.stringify(s3)}`);
if (OUT) { await p.evaluate(() => { window.__octet.setTool(''); document.getElementById('q-etq').click(); }); await p.waitForTimeout(600); await p.screenshot({ path: OUT + '/octet-3.png' }); }
console.log(errs.length ? errs.join('\n') : 'sin errores de consola'); if (errs.length) ok = false;
await b.close(); process.exit(ok ? 0 : 1);
