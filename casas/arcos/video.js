/* Pestaña «Fotos»: un fotograma cada 2 s de los videos de obra (VIDEO en modelo.js), cada uno con su nota.
   Las notas se guardan en la base (colección «nombres», con el código de la foto), igual que las de las piezas: Claude las lee y las procesa. */
import * as M from './modelo.js';
import * as N from './nombres.js';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const CSS = `<style>.fotos .ft{border-top:1px solid var(--rule);padding:8px 0}.fotos .ft img{width:100%;height:auto;border-radius:3px;display:block;cursor:zoom-in}
.fotos .ft.grande img{cursor:zoom-out}.fotos .fh{display:flex;gap:8px;align-items:baseline;margin:4px 0}.fotos .code{font-family:var(--f-mono);font-size:11.5px;color:var(--accent);font-weight:500}
.fotos .t{font-family:var(--f-mono);font-size:11px;color:var(--muted)}.fotos textarea{width:100%;box-sizing:border-box;font:inherit;font-size:12.5px;min-height:34px;resize:vertical;border:1px solid var(--rule);border-radius:3px;padding:4px 6px;background:var(--panel);color:var(--ink)}
.fotos .ok{font-size:11px;color:var(--muted);min-height:14px}.fotos .ft.connota textarea{border-color:var(--accent)}@media(min-width:700px){.fotos .ft:not(.grande) img{max-width:340px}}</style>`;
export function videoHTML() {
  const n = M.VIDEO.filter(v => N.nota(v.id)).length;
  return CSS + `<div class="fotos"><p class="intro">Un fotograma cada 2 segundos de tus videos de obra (${M.VIDEO.length} fotos). Escribí lo que quieras en cada una y tocá fuera del cuadro o Enter: se guarda en la base y yo lo leo. Tocá la foto para agrandarla. <b>${n}</b> con nota.</p>` +
    M.VIDEO.map(v => { const nt = N.nota(v.id); return `<div class="ft${nt ? ' connota' : ''}" data-foto="${v.id}"><img src="fotos/${v.img}.jpg" alt="${v.video}, segundo ${v.t}" loading="lazy">
      <div class="fh"><span class="code">${v.id}</span><span class="t">${v.video} · ${v.t} s</span></div>
      <textarea data-fnota="${v.id}" maxlength="500" placeholder="Nota sobre esta foto…">${esc(nt)}</textarea><div class="ok" data-fok="${v.id}"></div></div>`; }).join('') + '</div>';
}
async function guardar(ta) { const id = ta.dataset.fnota, val = ta.value.trim(); if (val === N.nota(id)) return;
  const ok = document.querySelectorAll(`[data-fok="${id}"]`); ok.forEach(o => o.textContent = 'Guardando…');
  const r = await N.guardar(id, { alias: N.alias(id), nota: val }); ok.forEach(o => o.textContent = r.ok ? 'Guardado.' : r.motivo);
  document.querySelectorAll(`[data-foto="${id}"]`).forEach(f => f.classList.toggle('connota', !!val)); }
let unido = false;
function unir() { if (unido) return; unido = true;
  document.addEventListener('focusout', e => { if (e.target.matches && e.target.matches('textarea[data-fnota]')) guardar(e.target); });
  document.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && e.target.matches && e.target.matches('textarea[data-fnota]')) { e.preventDefault(); e.target.blur(); } });
  document.addEventListener('click', e => { const im = e.target.closest && e.target.closest('.fotos .ft img'); if (im) im.parentElement.classList.toggle('grande'); });
  /* cuando llegan las notas de la base, se completan los cuadros que no estás editando */
  N.onChange(() => document.querySelectorAll('textarea[data-fnota]').forEach(ta => { if (document.activeElement !== ta) { const n = N.nota(ta.dataset.fnota); if (ta.value !== n) ta.value = n; ta.closest('.ft').classList.toggle('connota', !!n); } }));
}
export function renderVideo(el) { if (!el) return; el.innerHTML = videoHTML(); unir(); }
unir();
