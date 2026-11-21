/* Render 3D de una cocina (o cualquier vista) con lo guardado en la base, para las hojas del carpintero (Maxi 20/11/2026).
   Uso: CHROMIUM=… node herramientas/render-cocina.mjs <url de _prueba.html> <db.json {coleccion:{doc:datos}}> <salida.png> '{"p":[x,y,z],"t":[x,y,z],"w":1600,"h":1000,"fov":50}'
   Coordenadas 3D: X = x, Y = z (alto), Z = y. Cámaras usadas el 20/11: Arcos p [640,271,2460] t [120,151,2770]; Carhué p [2230,175,230] t [1870,85,-260], fov 50 (con carhue_equipamiento de la base). */
import { chromium } from 'playwright';
import fs from 'fs';
const [url, dbjson, out, cam] = process.argv.slice(2);
const DB = JSON.parse(fs.readFileSync(dbjson, 'utf8')); // {coleccion: {doc: data}}
const C = JSON.parse(cam); // {p:[x,y,z], t:[x,y,z], w,h, fov}
const b = await chromium.launch({ executablePath: process.env.CHROMIUM, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: C.w || 1600, height: C.h || 1000 }, deviceScaleFactor: 1 });
await p.addInitScript(DB => {
  try { localStorage.setItem('carhue-sol', JSON.stringify({ min: 780, fecha: '2026-10-15' })); } catch (e) {}
  const snap = d => ({ exists: !!d, data: () => d, id: '' });
  const docRef = (c, id) => ({ onSnapshot(cb) { setTimeout(() => cb(snap((DB[c] || {})[id])), 0); return () => {}; }, get: async () => snap((DB[c] || {})[id]), set: async () => {}, update: async () => {}, delete: async () => {} });
  const db = { collection: c => ({ doc: id => docRef(c, id), onSnapshot(cb) { setTimeout(() => cb({ docs: Object.entries(DB[c] || {}).map(([k, v]) => ({ id: k, exists: true, data: () => v })) }), 0); return () => {}; }, get: async () => ({ docs: [] }) }),
    doc: path => { const [c, id] = path.split('/'); return docRef(c, id); } };
  window.claude = { use: async k => k === 'db' ? db : null };
}, DB);
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
const data = await p.evaluate(() => { const V = window.__visor; V.renderer.render(V.scene, V.camera); return V.renderer.domElement.toDataURL('image/png'); });
fs.writeFileSync(out, Buffer.from(data.split(',')[1], 'base64'));
console.log(errs.slice(0, 5).join('\n') || 'ok');
await b.close();
