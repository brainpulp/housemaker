import { chromium } from 'playwright';
const b=await chromium.launch({...(process.env.CHROMIUM?{executablePath:process.env.CHROMIUM}:{}),args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:400,height:300}});p.on('pageerror',e=>console.log('PE '+e.message));
await p.addInitScript(()=>{try{localStorage.setItem('carhue-calidad','minimo');}catch(e){}});
await p.goto((process.env.URL||'http://localhost:8765/carhue/_prueba.html')+'#3d',{waitUntil:'networkidle',timeout:120000});await p.waitForTimeout(6000);
for(const d of (process.argv[2]||'0').split(',')){
console.log('== dormers',d,await p.evaluate(async d=>{const v=window.__visor,T=v.THREE;v.setParams({dormers:d,techos:true,ep:true});await new Promise(r=>setTimeout(r,3000));
  const roof=[];for(const q of v.parts){if(q.grp.visible===false)continue;if(!(q.group==='Techos'||/^(DM-|LU-|CAB|CU-|LIM|T-0|COS|CER|CR-)/.test(q.id)))continue;q.grp.traverse(o=>{if(o.isMesh)roof.push(o);});}
  const own=new Map();for(const q of v.parts)q.grp.traverse(o=>{if(o.isMesh)own.set(o,q.id);});
  const rc=new T.Raycaster();const out=[];
  for(const k of ['mue','luz']){const ES=v.equip.escenarios(k);for(const a in ES){const prev=ES[a].activo;for(const e of Object.keys(ES[a].esc)){v.equip.setActivo(k,a,e);await new Promise(r=>setTimeout(r,200));
    const TY={};for(const m of v.equip.items(k))TY[m.id]=m.t;const eq=v.scene.getObjectByName('equipamiento');
    for(const g of eq.children){if(!g.visible||g.userData.capa!==k||g.userData.amb!==a)continue;const bb=new T.Box3().setFromObject(g);if(bb.isEmpty())continue;
      let worst=null;const ms=[];g.traverse(o=>{if(o.isMesh&&!o.isSprite)ms.push(o);});const vv=new T.Vector3();
      for(const mm of ms){mm.updateMatrixWorld(true);const pa=mm.geometry.attributes.position;const st=Math.max(1,Math.floor(pa.count/150));for(let i=0;i<pa.count;i+=st){vv.fromBufferAttribute(pa,i).applyMatrix4(mm.matrixWorld);
        rc.set(new T.Vector3(vv.x,3000,vv.z),new T.Vector3(0,-1,0));rc.far=6000;const h=rc.intersectObjects(roof,false)[0];if(h&&vv.y>h.point.y+.5){const pen=vv.y-h.point.y;if(!worst||pen>worst.pen)worst={pen,who:own.get(h.object)};}}}
      if(g.userData.zBaja)out.push(`  (bajado ${g.userData.zBaja} cm) ${k} ${a}/${e} ${TY[g.userData.item]||g.userData.item}`);
      if(worst&&worst.pen>.5)out.push(`${k} ${a}/${e} ${TY[g.userData.item]||g.userData.item} x${Math.round((bb.min.x+bb.max.x)/2)} y${Math.round((bb.min.z+bb.max.z)/2)} entra ${Math.round(worst.pen)} en ${worst.who}`);}}
    v.equip.setActivo(k,a,prev);}}
  return '\n'+out.join('\n');},d));}
await b.close();
