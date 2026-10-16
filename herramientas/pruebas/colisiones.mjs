/* Colisiones de muebles: contra muros, columnas, escaleras, hogares y aberturas, y entre muebles del mismo ambiente (escenario activo).
   Uso: URL=http://localhost:8765/<casa>/_prueba.html node herramientas/pruebas/colisiones.mjs [tolerancia cm] */
import { chromium } from 'playwright';
const tol=+(process.argv[2]||2);
const b=await chromium.launch({...(process.env.CHROMIUM?{executablePath:process.env.CHROMIUM}:{}),args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:900,height:600}});p.on('pageerror',e=>console.log('PE '+e.message));
await p.addInitScript(()=>{try{localStorage.setItem('carhue-calidad','minimo');}catch(e){}});
await p.goto(process.env.URL,{waitUntil:'networkidle',timeout:120000});await p.waitForTimeout(7000);
const r=await p.evaluate(tol=>{const v=window.__visor,T=v.THREE;const eq=v.scene.getObjectByName('equipamiento');const out=[];
  const fijos=[];for(const q of v.parts){if(!q.grp||q.grp.visible===false)continue;if(!/^(M-|C-|HOG|ESC|SAL|CH-|TAB|P-|V-|VE-|H-|PV-|COL|MES|LAV)/.test(q.id))continue;
    q.grp.traverse(o=>{if(!o.isMesh||!o.visible)return;const m=o.material;if(m&&m.transparent&&m.opacity<.3)return;const bb=new T.Box3().setFromObject(o);if(!bb.isEmpty())fijos.push({id:q.id,bb});});}
  const items=v.equip.items('mue');const muebles=[];
  for(const g of eq.children){const id=g.userData.item;const it=items.find(m=>m.id===id);if(!it||!g.visible)continue;if(/alfombra/i.test(it.t))continue;
    const bbs=[];g.updateMatrixWorld(true);/* muebles de modelo 3D: cuentan sus cajas de planta (invisibles), no la caja entera del modelo, que en una L tapa el hueco */const ph=[];g.traverse(o=>{if(o.isMesh&&o.userData.ph)ph.push(o);});if(ph.length)for(const o of ph){const bb=new T.Box3().setFromObject(o);if(!bb.isEmpty())bbs.push(bb);}else g.traverse(o=>{if(o.isMesh&&!o.isSprite){const bb=new T.Box3().setFromObject(o);if(!bb.isEmpty())bbs.push(bb);}});muebles.push({it,bbs});}
  const solapa=(a,b)=>{const i=a.clone().intersect(b);if(i.isEmpty())return 0;const s=i.getSize(new T.Vector3());return Math.min(s.x,s.y,s.z);};
  for(const M of muebles){const hits={};for(const bb of M.bbs)for(const f of fijos){const d=solapa(bb,f.bb);if(d>tol)hits[f.id]=Math.max(hits[f.id]||0,d);}
    for(const [id,d] of Object.entries(hits))out.push(`${M.it.amb} · ${M.it.t} (${M.it.id}) en ${(M.it.x/100).toFixed(2)},${(M.it.y/100).toFixed(2)} ↔ ${id}: ${d.toFixed(0)} cm`);}
  for(let i=0;i<muebles.length;i++)for(let j=i+1;j<muebles.length;j++){const A=muebles[i],B=muebles[j];if(A.it.amb!==B.it.amb)continue;let d=0;for(const a of A.bbs)for(const bb of B.bbs)d=Math.max(d,solapa(a,bb));
    if(d>tol)out.push(`${A.it.amb} · ${A.it.t} (${A.it.id}) ↔ ${B.it.t} (${B.it.id}): ${d.toFixed(0)} cm`);}
  return out;},tol);
console.log(r.length?r.join('\n'):'sin colisiones');await b.close();
