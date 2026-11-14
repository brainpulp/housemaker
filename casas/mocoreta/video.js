/* Pestaña «Fotos»: todavía no hay fotos de Mocoretá cargadas. Cuando Maxi las mande, van acá. */
import * as M from './modelo.js';
export function videoHTML(){return M.VIDEO.length?'':'<p class="intro">Todavía no hay fotos de Mocoretá cargadas.</p>';}
export function renderVideo(el){el.innerHTML=videoHTML();}
