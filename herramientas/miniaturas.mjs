// Miniaturas y ficha de cada casa para el índice de housemaker (Maxi 22/11: «que el listado de proyectos sea una lista con un thumbnail y algo útil»).
// Abre la página de prueba de cada casa, saca una foto del 3D (casas/<casa>/miniatura.jpg) y anota cuántas piezas tiene (casas/<casa>/ficha.json).
// Uso: bash herramientas/armar.sh <casa> --prueba (para cada una), servir dist en :8765 y
//      CHROMIUM=… node herramientas/miniaturas.mjs [casa …]
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const CASAS = process.argv.slice(2).length ? process.argv.slice(2) : ['carhue', 'arcos', 'mocoreta', 'columna', 'cocinas', 'octet', 'catalogo'];
const BASE = process.env.BASE || 'http://localhost:8765';
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
for (const c of CASAS) {
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } });
  await pg.addInitScript(() => { try { localStorage.setItem('carhue-calidad', 'liviano'); } catch (e) {} });
  const url = fs.existsSync(`dist/${c}/_prueba.html`) ? `${BASE}/${c}/_prueba.html` : `${BASE}/${c}/${c}.html`;
  try {
    await pg.goto(url, { timeout: 120000 });
    await pg.waitForFunction('window.__ok3d', null, { timeout: 240000 }).catch(() => {});
    await pg.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === '3D'); b && b.click(); });
    await pg.waitForTimeout(5000);
    const piezas = await pg.evaluate(() => (window.__visor && window.__visor.parts || []).length);
    /* para la miniatura: sin la interfaz encima y, en las casas, sin árboles ni muebles (tapan la casa) */
    await pg.addStyleTag({ content: 'body *{visibility:hidden!important} canvas{visibility:visible!important}' });
    if (piezas) await pg.evaluate(() => { const v = window.__visor, k = new Set(); for (const p of v.parts) p.grp && p.grp.traverse(o => k.add(o));
      v.scene.traverse(o => { if ((o.isMesh || o.isInstancedMesh) && !k.has(o)) { o.geometry.computeBoundingBox && o.geometry.computeBoundingBox(); const b = o.geometry.boundingBox; if (!b || b.max.x - b.min.x < 4000) o.visible = false; } });
      window.__despertar && window.__despertar(); });
    await pg.waitForTimeout(2500);
    const cv = pg.locator('canvas').first();
    const out = path.join('casas', c, 'miniatura.jpg');
    const bb = (await cv.count()) ? await cv.boundingBox() : null;   /* recorte del canvas con la foto de la página: en las casas pesadas, la foto del elemento se pasa de tiempo */
    await pg.screenshot({ path: out, type: 'jpeg', quality: 72, timeout: 180000, ...(bb ? { clip: bb } : {}) });
    fs.writeFileSync(path.join('casas', c, 'ficha.json'), JSON.stringify({ piezas, generada: new Date().toISOString().slice(0, 10) }) + '\n');
    console.log(c, 'ok', piezas, 'piezas');
  } catch (e) { console.log(c, 'falló:', e.message.split('\n')[0]); }
  await pg.close();
}
await b.close();
