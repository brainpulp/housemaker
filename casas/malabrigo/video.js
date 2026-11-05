/* Pestaña «Fotos»: todavía no hay fotos del terreno ni de la zona. Cuando el amigo de Maxi las mande, van acá. */
import * as M from './modelo.js';
export function videoHTML(){return M.VIDEO.length?'':'<p class="intro">Todavía no hay fotos del terreno. Cuando las manden, las cargo acá.</p>';}
export function renderVideo(el){el.innerHTML=videoHTML();}
