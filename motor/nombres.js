/* Nombres propios de las piezas: Maxi puede renombrar cualquier elemento (y dejarle una nota).
   Se guardan en la base de datos del artifact (colección «nombres», un documento por código),
   así quedan para todos los que abran la página y Claude los lee en la próxima conversación.
   Sin base disponible (vista previa, visitante sin permiso) todo sigue funcionando, solo que no se guarda. */
const ALIAS={};const subs=new Set();let db=null,ready=false,canWrite=null;let resolveDb;export const getDb=()=>dbPromise;const dbPromise=new Promise(r=>{resolveDb=r;});
export const alias=id=>ALIAS[id]?ALIAS[id].alias||'':'';
export const nota=id=>ALIAS[id]?ALIAS[id].nota||'':'';
export const etiqueta=id=>alias(id)?`${id} · ${alias(id)}`:id;
export const onChange=fn=>{subs.add(fn);if(ready)fn();return()=>subs.delete(fn);};
export const estado=()=>({ready,canWrite,db:!!db});
const fire=()=>{for(const fn of subs){try{fn();}catch(e){console.error(e);}}};
(async()=>{
  try{db=await (window.claude&&window.claude.use?window.claude.use('db'):Promise.resolve(null));}catch(e){db=null;}
  resolveDb(db);
  if(!db){ready=true;fire();return;}
  try{const u=await window.claude.use('user');canWrite=u?await u.can('data.write'):null;}catch(e){canWrite=null;}
  db.collection('nombres').onSnapshot(snap=>{for(const k of Object.keys(ALIAS))delete ALIAS[k];snap.docs.forEach(d=>{if(d.exists)ALIAS[d.id]=d.data();});ready=true;fire();},
    err=>{console.warn('nombres',err);ready=true;fire();});
})();
export async function guardar(id,{alias:a,nota:n}){
  const data={alias:(a||'').trim().slice(0,80),nota:(n||'').trim().slice(0,500),ts:new Date().toISOString()};
  ALIAS[id]=data;fire();
  if(!db)return {ok:false,motivo:'Sin base de datos en esta vista: el nombre vale solo hasta que recargues.'};
  try{if(!data.alias&&!data.nota)await db.doc('nombres/'+id).delete();else await db.doc('nombres/'+id).set(data);return {ok:true};}
  catch(e){return {ok:false,motivo:e&&e.code==='invalid_argument'?'No tenés permiso de escritura en esta página.':'No se pudo guardar ('+(e&&e.code||'error')+').'};}
}
/* bloque de edición para el panel de selección */
export function editorHTML(id){const a=alias(id),n=nota(id);
  return `<div class="ren" data-ren="${id}"><div class="k">Tu nombre para ${id}</div><div class="renrow"><input type="text" id="ren-alias-${id}" value="${a.replace(/"/g,'&quot;')}" placeholder="p. ej. pared del fondo" maxlength="80"><button class="btn" data-ren-save="${id}">Guardar</button></div><input type="text" id="ren-nota-${id}" value="${n.replace(/"/g,'&quot;')}" placeholder="Nota (opcional): «es más alta», «no existe», «va vidrio»…" maxlength="500"><div class="renmsg" id="ren-msg-${id}"></div></div>`;}
export function bindEditor(rootEl,after){
  rootEl.addEventListener('click',async e=>{const b=e.target.closest('[data-ren-save]');if(!b)return;const id=b.dataset.renSave;const a=rootEl.querySelector('#ren-alias-'+CSS.escape(id)),n=rootEl.querySelector('#ren-nota-'+CSS.escape(id));
    const r=await guardar(id,{alias:a&&a.value,nota:n&&n.value});const m=rootEl.querySelector('#ren-msg-'+CSS.escape(id));if(m)m.textContent=r.ok?'Guardado.':r.motivo;after&&after(id);});
  rootEl.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id&&e.target.id.startsWith('ren-')){const id=e.target.id.replace(/^ren-(alias|nota)-/,'');const b=rootEl.querySelector(`[data-ren-save="${id}"]`);b&&b.click();}});
}
