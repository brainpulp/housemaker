/* Pestaña «Video»: el chequeo sistemático del modelo contra el video, escena por escena (VIDEO en modelo-carhue.js). */
import * as M from './modelo.js';
const EST={ok:'coincide',no:'no coincide',duda:'no lo entiendo'};
export function videoHTML(){const n={ok:0,no:0,duda:0};M.VIDEO.forEach(v=>n[v.est]++);
  return `<p class="intro">Recorrí el video entero (154 s) de a 2 segundos y lo comparé escena por escena (VID-xx); después hice lo mismo con tus fotos (FOT-xx). <b>${n.ok} coinciden</b>, <b>${n.no} no coinciden</b>, <b>${n.duda} no las entiendo</b>. Contestame por código (VID-xx). La foto es el fotograma del segundo indicado.</p>`+
    M.VIDEO.map(v=>`<div class="vid" data-id="${v.id}"><img src="vid/${v.img?v.img:"t_"+v.t}.jpg" alt="" loading="lazy"><div><span class="code">${v.id}</span> <span class="muted">${v.img?v.tt:"seg. "+v.tt}</span><span class="est ${v.est}">${EST[v.est]}</span><h4>${v.titulo}</h4><p class="ve">${v.ve}</p><p class="mo">${v.modelo}</p><div class="refs">${v.ref.join(' · ')}</div></div></div>`).join('');}
export function renderVideo(el,onPick){el.innerHTML=videoHTML();
  if(onPick)el.querySelectorAll('.vid').forEach(r=>r.addEventListener('click',e=>{const c=e.target.closest('.pt');if(c)return;onPick(r.dataset.id);}));}
