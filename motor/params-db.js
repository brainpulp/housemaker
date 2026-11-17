/* Variantes de diseño persistentes (Maxi 16/11: «que abra siempre con la última usada»).
   Las variables que cumplen `guardar` (por defecto, todas menos las del grupo «Ver») se guardan en la base del artifact
   (estado/params, que la cáscara ya separa por casa) y se aplican al abrir, en cualquier dispositivo. El navegador las guarda además en localStorage (visor3d). */
import * as N from './nombres.js';
export function initParamsDb(visor, { params, guardar = q => (q.group || '') !== 'Ver', doc = 'params' } = {}) {
  const ids = new Set((params || []).filter(guardar).map(q => q.id)), sub = P => Object.fromEntries(Object.entries(P).filter(([k]) => ids.has(k)));
  let db = null, aplicado = false;
  const previo = visor.onParam;
  visor.onParam = P => { if (previo) try { previo(P); } catch (e) {} if (db && aplicado) db.doc('estado/' + doc).set({ p: sub(P), ts: new Date().toISOString() }).catch(() => {}); };
  N.getDb().then(d => { db = d; if (!d) { aplicado = true; return; }
    d.collection('estado').onSnapshot(snap => { const x = snap.docs.find(q => q.id === doc && q.exists); aplicado = true; if (!x) return; const b = (x.data() || {}).p || {};
      const cur = sub(visor.params); if (Object.keys(b).every(k => String(b[k]) === String(cur[k]))) return; visor.setParams(b); }, () => { aplicado = true; }); });
}
