/* Pestaña «Fotos»: todavía no hay fotos propias de esta escena. Las de referencia de la cocina de Carhué están en la carpeta «muebles para housemaker» de la compu de Maxi. */
import * as M from './modelo.js';
export function videoHTML(){return M.VIDEO.length?'':'<p class="intro">Todavía no hay fotos cargadas en esta escena. Cuando las mandes, las ato a la cocina que corresponda.</p>';}
export function renderVideo(el){el.innerHTML=videoHTML();}
