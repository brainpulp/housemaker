/* Render 3D de una cocina (o cualquier vista) con lo guardado en la base, para las hojas del carpintero (Maxi 20/11/2026).
   Uso: CHROMIUM=… node herramientas/render-cocina.mjs <url de _prueba.html> <db.json {coleccion:{doc:datos}}> <salida.png> '{"p":[x,y,z],"t":[x,y,z],"w":1600,"h":1000,"fov":50}'
   Coordenadas 3D: X = x, Y = z (alto), Z = y. Opciones: dpr, fov, luz (false = sin luz realista), ocultar (ids de muebles). Cámaras del 21/11 (luz realista, sin sillas): Arcos p [360,235,2430] t [40,160,2800] fov 58, ocultar cocina_10…12 y 16…19; Carhué p [2290,170,140] t [1860,95,-200] fov 52, ocultar m280…m284 (con carhue_equipamiento de la base). */
import { chromium } from 'playwright';
import fs from 'fs';
const [url, dbjson, out, cam] = process.argv.slice(2);
const DB = JSON.parse(fs.readFileSync(dbjson, 'utf8')); // {coleccion: {doc: data}}
const C = JSON.parse(cam); // {p:[x,y,z], t:[x,y,z], w,h, fov}
const b = await chromium.launch({ executablePath: process.env.CHROMIUM, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: C.w || 1600, height: C.h || 1000 }, deviceScaleFactor: C.dpr || 1 });
await p.addInitScript(([DB, C]) => {
  try { localStorage.setItem('carhue-calidad', 'alto'); localStorage.setItem('carhue-luz', C.luz === false ? '0' : '1'); localStorage.setItem('carhue-mue-ocultos', JSON.stringify(C.ocultar || [])); } catch (e) {}
  const snap = d => ({ exists: !!d, data: () => d, id: '' });
  const docRef = (c, id) => ({ onSnapshot(cb) { setTimeout(() => cb(snap((DB[c] || {})[id])), 0); return () => {}; }, get: async () => snap((DB[c] || {})[id]), set: async () => {}, update: async () => {}, delete: async () => {} });
  const db = { collection: c => ({ doc: id => docRef(c, id), onSnapshot(cb) { setTimeout(() => cb({ docs: Object.entries(DB[c] || {}).map(([k, v]) => ({ id: k, exists: true, data: () => v })) }), 0); return () => {}; }, get: async () => ({ docs: [] }) }),
    doc: path => { const [c, id] = path.split('/'); return docRef(c, id); } };
  window.claude = { use: async k => k === 'db' ? db : null };
}, [DB, C]);
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(url + '#3d', { waitUntil: 'networkidle', timeout: 300000 });
await p.waitForTimeout(3000);
await p.evaluate(() => window.__setModo && window.__setModo('3d'));
await p.waitForFunction(() => window.__visor, null, { timeout: 300000 });
await p.waitForTimeout(14000);
await p.evaluate(C => { const V = window.__visor; if (C.params) V.setParams && V.setParams(C.params); if (C.hide) for (const id of C.hide) V.setHidden && V.setHidden(id, true); }, C);
await p.waitForTimeout(4000);
await p.evaluate(C => { const V = window.__visor; if (C.fov) V.camera.fov = C.fov; V.camera.position.set(...C.p); V.controls.target.set(...C.t); V.camera.updateProjectionMatrix(); V.controls.update(); document.querySelectorAll('.label,.edge,[class*="lbl"]').forEach(e => e.style.display = 'none'); }, C);
await p.waitForTimeout(3000);
await p.evaluate(() => { const V = window.__visor; if (V.luzReal && !(V.luzSol && V.luzSol.on)) V.luzReal(true); });
await p.waitForTimeout(6000);
const data = await p.evaluate(() => { const V = window.__visor; if (V.renderHook) V.renderHook(); else V.renderer.render(V.scene, V.camera); return V.renderer.domElement.toDataURL('image/png'); });
fs.writeFileSync(out, Buffer.from(data.split(',')[1], 'base64'));
console.log(errs.slice(0, 5).join('\n') || 'ok');
await b.close();
