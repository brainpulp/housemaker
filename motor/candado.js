/* Candado de las partes que se mueven: hojas corredizas, proyectantes, lucarnas, puertas (Maxi 15/10).
   Al mover una parte, o al tocarla, aparece por unos segundos un botón 🔒/🔓 junto a ella. Bloqueada no se mueve: arrastrar sobre ella orbita la cámara
   y un toque la elige como cualquier pieza. Los candados se guardan en la base del artifact (estado/candados) y en este navegador.
   Uso desde la casa: if(visor.candado.bloqueada(id)){visor.candado.mostrar(id,punto3D);return;} */
import * as N from './nombres.js';

const LOCK='<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
const OPEN='<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/></svg>';

export function initCandado(visor,{segundos=5}={}){
  const T=visor.THREE,stage=document.querySelector('#modo-3d .stage')||document.body;
  let L=new Set(),db=null;
  try{L=new Set(JSON.parse(localStorage.getItem('housemaker-candados')||'[]'));}catch(e){}
  const guardar=()=>{const ids=[...L].sort();try{localStorage.setItem('housemaker-candados',JSON.stringify(ids));}catch(e){}
    if(db)db.collection('estado').doc('candados').set({ids,ts:new Date().toISOString()}).catch(()=>{});};
  N.getDb().then(d=>{db=d;if(!d)return;d.collection('estado').doc('candados').onSnapshot(x=>{if(!x.exists)return;const ids=(x.data()||{}).ids;if(Array.isArray(ids)){L=new Set(ids);pintar();}},()=>{});});

  const st=document.createElement('style');st.textContent=`#candado{position:absolute;z-index:8;transform:translate(-50%,-130%);display:flex;align-items:center;gap:5px;padding:4px 8px 4px 6px;
    background:var(--panel,#fff);color:var(--ink,#222);border:1px solid var(--rule,#ccc);border-radius:999px;box-shadow:0 3px 10px rgba(0,0,0,.18);font:12px/1 var(--f-mono,monospace);cursor:pointer;user-select:none;transition:opacity .25s}
    #candado[hidden]{display:none}#candado.lk{background:var(--ink,#222);color:var(--panel,#fff)}#candado.fade{opacity:0}`;document.head.appendChild(st);
  const el=document.createElement('button');el.id='candado';el.type='button';el.hidden=true;stage.appendChild(el);
  let cur=null,punto=new T.Vector3(),hasta=0,sobre=false;
  function pintar(){if(!cur)return;const lk=L.has(cur);el.classList.toggle('lk',lk);el.innerHTML=`${lk?LOCK:OPEN}<span>${cur}</span>`;el.title=lk?'Bloqueada: tocá para que se pueda mover':'Se puede mover: tocá para bloquearla';}
  el.addEventListener('pointerdown',e=>e.stopPropagation());
  el.addEventListener('click',e=>{e.stopPropagation();if(!cur)return;if(L.has(cur))L.delete(cur);else L.add(cur);guardar();pintar();hasta=performance.now()+segundos*1000;});
  el.addEventListener('pointerenter',()=>{sobre=true;});el.addEventListener('pointerleave',()=>{sobre=false;hasta=performance.now()+1500;});
  const v=new T.Vector3();
  (function loop(){requestAnimationFrame(loop);if(!cur||el.hidden)return;const now=performance.now();if(!sobre&&now>hasta){el.hidden=true;cur=null;return;}
    el.classList.toggle('fade',!sobre&&hasta-now<400);v.copy(punto).project(visor.camera);if(v.z>1){el.style.visibility='hidden';return;}el.style.visibility='';
    const r=visor.renderer.domElement.getBoundingClientRect(),s=stage.getBoundingClientRect();el.style.left=(r.left-s.left+(v.x+1)/2*r.width)+'px';el.style.top=(r.top-s.top+(1-v.y)/2*r.height)+'px';})();

  const api={bloqueada:id=>L.has(id),
    mostrar(id,p){cur=id;if(p)punto.copy(p);hasta=performance.now()+segundos*1000;el.hidden=false;el.classList.remove('fade');pintar();window.__despertar&&window.__despertar();},
    get ids(){return [...L];}};
  visor.candado=api;return api;
}
