/* Vistas: lista de vistas fijas y guardadas (ir, ⟳ actualizar, × borrar) más «Guardar vista actual».
   La dibuja la barra de herramientas en su desplegable; por debajo usa el desplegable oculto #vistasSel y su lógica. */
export function initVistasUI(){
  const sel=document.getElementById('vistasSel');if(!sel)return null;
  const fire=v=>{sel.value=v;sel.dispatchEvent(new Event('change',{bubbles:true}));};
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function html(){const groups=[...sel.querySelectorAll('optgroup')];let h='';
    for(const g of groups){const ops=[...g.querySelectorAll('option')];h+=`<div class="fyg">${esc(g.label)}</div>`;
      h+=ops.length?ops.map(o=>`<div class="fyi"><button class="fyb" data-v="${esc(o.value)}">${esc(o.textContent)}</button>${o.value.startsWith('__')?'':`<button class="fyx" data-upd="${esc(o.value)}" data-tip="Actualizar «${esc(o.textContent)}»|Toma la cámara, cortes y capas de ahora; conserva el nombre">⟳</button><button class="fyx" data-del="${esc(o.value)}" data-tip="Borrar «${esc(o.textContent)}»">×</button>`}</div>`).join(''):'<div class="fye">Ninguna todavía.</div>';}
    return h+`<div class="fysep"></div><button class="fyb fyacc" data-save>＋ Guardar vista actual…</button>`;}
  function renderInto(el,close){el.innerHTML=html();el.onclick=e=>{const t=e.target.closest('[data-v],[data-upd],[data-del],[data-save]');if(!t)return;close&&close();
      if(t.dataset.v!==undefined)fire(t.dataset.v);else if(t.dataset.upd!==undefined){sel.dataset.cur=t.dataset.upd;fire('__upd');}
      else if(t.dataset.del!==undefined){sel.dataset.cur=t.dataset.del;fire('__del');}else fire('__save');};}
  return {renderInto};
}
