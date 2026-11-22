/* Variantes de diseño persistentes (Maxi 16/11: «que abra siempre con la última usada»).
   Las variables que cumplen `guardar` (por defecto, todas menos las del grupo «Ver») se guardan en la base del artifact
   (estado/params, que la cáscara ya separa por casa) y se aplican al abrir, en cualquier dispositivo. El navegador las guarda además en localStorage (visor3d). */
import * as N from './nombres.js';
/* migraciones (Maxi 22/11, Mocoretá: «¿no te había dicho ya que quiero que el deck dé toda la vuelta?»): cuando una decisión de Maxi cambia el valor
   de fábrica de una opción, lo guardado de antes lo seguía tapando. Cada migración { id, set } se aplica UNA vez por casa (queda anotada en la base,
   junto a las opciones, y en el navegador): después él puede volver a cambiarla. */
export function initParamsDb(visor, { params, guardar = q => (q.group || '') !== 'Ver', doc = 'params', migraciones = [] } = {}) {
  const ids = new Set((params || []).filter(guardar).map(q => q.id)), sub = P => Object.fromEntries(Object.entries(P).filter(([k]) => ids.has(k)));
  let db = null, aplicado = false; const hechas = new Set();
  try { JSON.parse(localStorage.getItem('params-mig') || '[]').forEach(h => hechas.add(h)); } catch (e) {}
  const anotar = () => { try { localStorage.setItem('params-mig', JSON.stringify([...hechas])); } catch (e) {} };
  const migrar = () => { const pend = migraciones.filter(m => !hechas.has(m.id)); if (!pend.length) return; pend.forEach(m => hechas.add(m.id)); anotar(); visor.setParams(Object.assign({}, ...pend.map(m => m.set))); };
  const previo = visor.onParam;
  visor.onParam = P => { if (previo) try { previo(P); } catch (e) {} if (db && aplicado) db.doc('estado/' + doc).set({ p: sub(P), mig: [...hechas], ts: new Date().toISOString() }).catch(() => {}); };
  N.getDb().then(d => { db = d; if (!d) { aplicado = true; migrar(); return; }
    d.collection('estado').onSnapshot(snap => { const x = snap.docs.find(q => q.id === doc && q.exists); aplicado = true; if (!x) { migrar(); return; } const dat = x.data() || {}, b = dat.p || {};
      (dat.mig || []).forEach(h => hechas.add(h)); anotar();
      const cur = sub(visor.params); if (!Object.keys(b).every(k => String(b[k]) === String(cur[k]))) visor.setParams(b); migrar(); }, () => { aplicado = true; migrar(); }); }).catch(() => { aplicado = true; migrar(); });
}
