import { chromium } from 'playwright';
const b=await chromium.launch({...(process.env.CHROMIUM?{executablePath:process.env.CHROMIUM}:{}),args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:600,height:400}});await p.addInitScript(()=>{try{localStorage.setItem('carhue-lucarnas',JSON.stringify({'LU-1':100,'LU-2':100,'LU-4':100}));localStorage.setItem('carhue-calidad','minimo');}catch(e){}});p.on('pageerror',e=>console.log('PE '+e.message));
await p.goto((process.env.URL||'http://localhost:8765/carhue/_prueba.html')+'#3d',{waitUntil:'networkidle',timeout:120000});await p.waitForTimeout(6000);
for(const d of ['0','j','c']){console.log(d,await p.evaluate(async d=>{const v=window.__visor,T=v.THREE;v.setParams({dormers:d,luTipo:'4'});await new Promise(r=>setTimeout(r,2500));
  const bb=q=>new T.Box3().setFromObject(q.grp);const P=v.parts.filter(q=>q.grp.visible!==false);const A=P.filter(q=>/^(LU-|DM-)/.test(q.id));const o=[];
  for(let i=0;i<A.length;i++)for(let j=i+1;j<A.length;j++){const a=A[i],b2=A[j];if(a.id.slice(0,4)===b2.id.slice(0,4))continue;const x=bb(a).intersect(bb(b2));if(!x.isEmpty()){const s=x.getSize(new T.Vector3());if(s.x>2&&s.y>2&&s.z>2)o.push(a.id+'×'+b2.id);}}
  const eq=v.scene.getObjectByName('equipamiento');for(const g of eq.children){if(g.userData.capa!=='luz'||!g.visible)continue;const gb=new T.Box3().setFromObject(g);for(const q of P){if(!/^(DM-|LU-|T-0|CAB)/.test(q.id))continue;const x=gb.clone().intersect(bb(q));if(!x.isEmpty()){const s=x.getSize(new T.Vector3());if(s.x>1&&s.y>1&&s.z>1&&/^(DM|LU)/.test(q.id))o.push(g.userData.item+'×'+q.id);}}}
  const lus=P.filter(q=>/^LU-\d$/.test(q.id)).map(q=>q.id);const bbs=P.filter(q=>/^LU-\d[mb]$/.test(q.id)).map(q=>{const b=bb(q);return q.id+' x'+Math.round(b.min.x)+'..'+Math.round(b.max.x);}).join(' ');return bbs+' | LU visibles '+lus.join(',')+' | choques: '+(o.join(' ')||'ninguno');},d));}
await b.close();
