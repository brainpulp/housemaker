/* Pestaña «Video»: todavía no hay video ni fotos de Arcos. Cuando lleguen, se cargan en VIDEO (modelo.js) como en Carhué. */
import * as M from './modelo.js';
export function videoHTML(){return M.VIDEO.length?'':'<p class="intro">Todavía no hay video ni fotos de esta casa. Cuando los mandes, los recorro escena por escena y los comparo con el modelo, como en Carhué.</p>';}
export function renderVideo(el){el.innerHTML=videoHTML();}
