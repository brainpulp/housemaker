/* Catálogo de muebles: arma todas las piezas con sus valores por defecto y saca una captura. Uso: URL=http://localhost:8765/catalogo/_prueba.html node herramientas/pruebas/catalogo.mjs <carpeta> */
import { chromium } from 'playwright';
const b=await chromium.launch({...(process.env.CHROMIUM?{executablePath:process.env.CHROMIUM}:{}),args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/TUNNEL|fonts|ERR_/.test(m.text()))errs.push(m.text());});
await p.goto(process.env.URL,{waitUntil:'networkidle',timeout:120000});await p.waitForTimeout(3000);
console.log('piezas',await p.evaluate(()=>window.__cat&&window.__cat.n));console.log(errs.join('\n')||'sin errores');
await p.screenshot({path:(process.argv[2]||'.')+'/catalogo.png',fullPage:true});await b.close();
