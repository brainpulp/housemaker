/* Ediciones de Maxi sobre el modelo: borrar, mover y estirar piezas desde la página.
   Se guardan en la base del artifact (colección «ediciones», un documento por código) y se aplican
   encima de modelo-carhue.js cada vez que carga: la planta y el 3D las muestran, y yo las leo para
   pasarlas al modelo «en limpio». Sin base, quedan en este navegador. */
import * as M from './modelo.js';
import * as N from './nombres.js';

const ARR=['MUROS','ABERTURAS','LOCALES','ESTRUCTURA','TECHOS','CHIMENEAS','IMPLANTACION','DECK'];
const ORIG={};for(const k of ARR)ORIG[k]=JSON.parse(JSON.stringify(M[k]));
export const E={};            // id -> {borrado, mov:{x,y,z}, set:{...}}
const subs=new Set();let db=null;
export const onChange=fn=>{subs.add(fn);return()=>subs.delete(fn);};
const fire=()=>{for(const f of subs){try{f();}catch(e){console.error(e);}}};

/* piezas cuyo dibujo sale de sus datos (a, b, pos, poly, box): se editan en los datos.
   El resto (techos, cabios, cerchas armadas a mano) se mueve como bloque en el 3D. */
export function enDatos(id){const f=find(id);if(!f)return false;const d=f.d;
  if(f.k==='MUROS'||f.k==='ABERTURAS'||f.k==='LOCALES'||f.k==='DECK'||f.k==='IMPLANTACION')return true;
  if(f.k==='ESTRUCTURA')return d.tipo==='columna';
  if(f.k==='CHIMENEAS')return true;if(f.k==='TECHOS'&&/^LU-/.test(id))return true;return false;}
export function find(id){for(const k of ARR){const d=M[k].find(o=>o.id===id);if(d)return {k,d};}return null;}
export function findOrig(id){for(const k of ARR){const d=ORIG[k].find(o=>o.id===id);if(d)return {k,d};}return null;}

const sh=(p,dx,dy)=>[p[0]+dx,p[1]+dy];
function apply(){
  for(const k of ARR){M[k].length=0;for(const o of JSON.parse(JSON.stringify(ORIG[k])))M[k].push(o);}
  for(const [id,e] of Object.entries(E)){const f=find(id);if(!f)continue;const d=f.d;
    if(e.borrado){const i=M[f.k].indexOf(d);if(i>=0)M[f.k].splice(i,1);continue;}
    if(e.set)Object.assign(d,e.set);
    if(e.mov&&enDatos(id)){const {x=0,y=0,z=0}=e.mov;
      if(f.k==='ABERTURAS'){const w=M.MUROS.find(m=>m.id===d.muro);if(w){const horiz=Math.abs(w.b[0]-w.a[0])>=Math.abs(w.b[1]-w.a[1]);d.d=(d.d||0)+(horiz?x:y);}if(z)d.s=Math.max(0,(d.s||0)+z);}
      else{if(d.a)d.a=sh(d.a,x,y);if(d.b)d.b=sh(d.b,x,y);if(d.pos)d.pos=sh(d.pos,x,y);if(d.poly)d.poly=d.poly.map(p=>sh(p,x,y));
        if(d.box)d.box=[d.box[0]+x,d.box[1]+x,d.box[2]+z,d.box[3]+z,d.box[4]+y,d.box[5]+y];
        if(f.k==='MUROS'){for(const a of M.ABERTURAS.filter(a=>a.muro===id)){/* las aberturas viajan con el muro (d es relativo) */}}}}}}

function local(){try{localStorage.setItem('carhue-ediciones',JSON.stringify(E));}catch(e){}}
try{Object.assign(E,JSON.parse(localStorage.getItem('carhue-ediciones')||'{}'));}catch(e){}
apply();

/* historial para deshacer (Ctrl/Cmd+Z): guarda cómo estaba cada pieza antes de cada cambio */
const HIST=[],PEND={};const snap=id=>E[id]?JSON.parse(JSON.stringify(E[id])):null;
export const puedeDeshacer=()=>HIST.length>0;
export async function undo(){const h=HIST.pop();if(!h)return null;if(h.prev){E[h.id]=h.prev;apply();local();fire();if(db){try{await db.doc('ediciones/'+h.id).set(h.prev);}catch(e){}}}else{delete E[h.id];apply();local();fire();if(db){try{await db.doc('ediciones/'+h.id).delete();}catch(e){}}}return h.id;}
export async function editar(id,patch,persist=true){if(!persist){if(!(id in PEND))PEND[id]=snap(id);}else{HIST.push({id,prev:(id in PEND)?PEND[id]:snap(id)});delete PEND[id];if(HIST.length>200)HIST.shift();}
  const e={...(E[id]||{})};
  if(patch.borrado!=null)e.borrado=patch.borrado;
  if(patch.mov){const m=e.mov||{x:0,y:0,z:0};e.mov={x:Math.round((m.x||0)+(patch.mov.x||0)),y:Math.round((m.y||0)+(patch.mov.y||0)),z:Math.round((m.z||0)+(patch.mov.z||0))};}
  if(patch.set)e.set={...(e.set||{}),...patch.set};
  if(patch.caras)e.caras=patch.caras;
  if(patch.quitar)e.quitar=[...new Set([...(e.quitar||[]),...patch.quitar])];
  e.ts=new Date().toISOString();E[id]=e;apply();if(!persist){fire();return false;}local();fire();
  if(db){try{await db.doc('ediciones/'+id).set(e);return true;}catch(err){console.warn('ediciones',err);}}return false;}
export async function deshacer(id){HIST.push({id,prev:snap(id)});delete E[id];apply();local();fire();if(db){try{await db.doc('ediciones/'+id).delete();}catch(e){}}}
export const lista=()=>Object.entries(E).map(([id,e])=>({id,...e}));

N.getDb().then(d=>{db=d;if(!d)return;d.collection('ediciones').onSnapshot(snap=>{const R={};snap.docs.forEach(x=>{if(x.exists)R[x.id]=x.data();});
  for(const k of Object.keys(E))delete E[k];Object.assign(E,R);apply();local();fire();},()=>{});});
