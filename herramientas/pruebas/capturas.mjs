/* Capturas de una casa para revisar a ojo: la planta de cada nivel y el 3D desde cada vista fija (y con cortes).
   Uso: URL=http://localhost:8765/<casa>/_prueba.html node herramientas/pruebas/capturas.mjs <carpeta> [vistas 3D separadas por coma] [cortes separados por coma]
   Escribe planta-<nivel>.png y 3d-<vista>[-c<corte>].png en <carpeta> y lista los errores de la consola. */
import { chromium } from 'playwright';
import fs from 'fs';
const out = process.argv[2] || '.'; fs.mkdirSync(out, { recursive: true });
const V3 = (process.argv[3] || '').split(',').filter(Boolean);
const CORTES = (process.argv[4] || '').split(',').filter(Boolean);
const b = await chromium.launch({ ...(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
/* de día (13 h), para que se vea: el sol lo guarda noche.js en este navegador */
await p.addInitScript(() => { try { localStorage.setItem('carhue-sol', JSON.stringify({ min: 780, fecha: '2026-10-15' })); } catch (e) {} });
const errs = [];
p.on('pageerror', e => errs.push('PE ' + e.message));
p.on('console', m => { if (m.type() === 'error' && !/TUNNEL|fonts|ERR_|404/.test(m.text())) errs.push('C ' + m.text().slice(0, 300)); });
await p.goto(process.env.URL, { waitUntil: 'networkidle', timeout: 300000 });
await p.waitForTimeout(3000);
/* planta: un nivel por botón */
const niveles = await p.$$eval('#modo-planta [data-nivel]', bs => bs.map(b => b.dataset.nivel));
await p.evaluate(() => window.__setModo && window.__setModo('planta'));
for (const n of niveles) {
  await p.click(`#modo-planta [data-nivel="${n}"]`); await p.waitForTimeout(400);
  await p.screenshot({ path: `${out}/planta-${n}.png` });
}
/* 3D */
await p.evaluate(() => window.__setModo && window.__setModo('3d'));
await p.waitForFunction(() => window.__ok3d, null, { timeout: 300000 }).catch(() => errs.push('3D no terminó de arrancar'));
await p.waitForTimeout(4000);
const vistas = V3.length ? V3 : await p.$$eval('#viewbar [data-view]', bs => bs.map(b => b.dataset.view));
for (const v of vistas) {
  for (const c of ['', ...CORTES]) {
    await p.evaluate(c => { const V = window.__visor; if (!V) return; V.params.corte = c || '0'; const s = document.getElementById('q-corte') || document.getElementById('v-corte'); if (s) { s.value = c || '0'; s.dispatchEvent(new Event('change', { bubbles: true })); } }, c);
    await p.click(`#viewbar [data-view="${v}"]`).catch(() => {}); await p.waitForTimeout(2500);
    await p.screenshot({ path: `${out}/3d-${v}${c ? '-c' + c : ''}.png` });
  }
}
console.log('niveles:', niveles.join(' '), '· vistas:', vistas.join(' '));
console.log(errs.length ? errs.join('\n') : 'sin errores en la consola');
await b.close();
