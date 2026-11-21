/* Aristas (Maxi 21/11: «quiero una manera de renderizar que ponga de manifiesto más claramente las aristas; con el rendering que usás se confunde todo»).
   Tres modos, en el panel Vistas → Dibujo:
   - normal:  como siempre;
   - aristas: el mismo render con las aristas de todas las piezas en trazo oscuro;
   - técnico: caras claras sin texturas ni sombras arrojadas (cada material, aclarado hacia el blanco a partir de su tono medio) y aristas negras.
   Las aristas salen de EdgesGeometry (sólo donde dos caras forman más de 20°: no dibuja las diagonales de los triángulos).
   Se rehacen cada vez que el visor rearma las piezas. El modo se guarda en este navegador. */
import * as THREE from 'three';

export function initAristas(visor) {
  const { scene, renderer } = visor;
  const KEY = 'hm-aristas';
  let modo = 'normal'; try { modo = localStorage.getItem(KEY) || 'normal'; } catch (e) {}
  const LM = new THREE.LineBasicMaterial({ color: 0x1b1b1b, transparent: true, opacity: .85 }), LC = new THREE.LineBasicMaterial({ color: 0xb8b8b8, transparent: true, opacity: .9 });
  /* sobre una pieza muy oscura (acero negro), en «aristas» el trazo va claro para que se vea */
  const lum = c => .2126 * c.r + .7152 * c.g + .0722 * c.b;
  const EG = new Map();   /* geometría → aristas (se reusan entre rearmes si la geometría es la misma) */
  const MEDIO = new Map();/* textura → color medio */
  const lineas = [], tocados = new Set();
  let last = null, sombras = null;

  const medio = t => {
    if (MEDIO.has(t)) return MEDIO.get(t);
    let c = new THREE.Color(0xcccccc);
    try { const im = t.image, cv = document.createElement('canvas'); cv.width = cv.height = 1; const x = cv.getContext('2d'); x.drawImage(im, 0, 0, 1, 1); const d = x.getImageData(0, 0, 1, 1).data; c = new THREE.Color().setRGB(d[0] / 255, d[1] / 255, d[2] / 255, THREE.SRGBColorSpace); } catch (e) {}
    MEDIO.set(t, c); return c;
  };
  const mats = o => [].concat(o.material).filter(Boolean);

  function quitar() {
    for (const l of lineas) { l.parent && l.parent.remove(l); }
    lineas.length = 0;
    for (const m of tocados) { const u = m.userData.ar0; if (!u) continue; m.map = u.map; m.color.copy(u.color); m.polygonOffset = u.po; m.needsUpdate = true; delete m.userData.ar0; }
    tocados.clear();
    if (sombras !== null) { renderer.shadowMap.enabled = sombras; sombras = null; scene.traverse(o => { if (o.material) for (const m of mats(o)) m.needsUpdate = true; }); }
  }

  function poner() {
    quitar(); if (modo === 'normal') return;
    for (const p of visor.parts || []) {
      if (!p.grp || p.cat === 'glass') continue;
      p.grp.traverse(o => {
        if (!o.isMesh || o.isInstancedMesh || !o.geometry || o.userData.noPick) return;
        const ms = mats(o); if (!ms.some(m => m.opacity > .3)) return;
        let e = EG.get(o.geometry); if (!e) { try { e = new THREE.EdgesGeometry(o.geometry, 20); } catch (err) { return; } EG.set(o.geometry, e); }
        const m0 = ms[0], osc = modo === 'aristas' && lum(m0.map ? medio(m0.map).clone().multiply(m0.color) : m0.color) < .04;
        const l = new THREE.LineSegments(e, osc ? LC : LM); l.userData.noPick = true; l.raycast = () => {}; l.renderOrder = 2; o.add(l); lineas.push(l);
        for (const m of ms) {
          if (tocados.has(m)) continue; tocados.add(m);
          m.userData.ar0 = { map: m.map, color: m.color.clone(), po: m.polygonOffset };
          m.polygonOffset = true; m.polygonOffsetFactor = 1; m.polygonOffsetUnits = 1;
          if (modo === 'tecnico') { const base = m.map ? medio(m.map).clone().multiply(m.color) : m.color.clone(); m.map = null; m.color.copy(base.lerp(new THREE.Color(0xffffff), .4)); }
          m.needsUpdate = true;
        }
      });
    }
    if (modo === 'tecnico') { sombras = renderer.shadowMap.enabled; renderer.shadowMap.enabled = false; scene.traverse(o => { if (o.material) for (const m of mats(o)) m.needsUpdate = true; }); }
    window.__despertar && window.__despertar();
  }

  function set(m) { modo = m; try { localStorage.setItem(KEY, m); } catch (e) {} last = null; pintarUI(); }
  /* después del rearme (y de que realismo decore las piezas nuevas), vuelvo a poner las aristas */
  (function loop() { requestAnimationFrame(loop); if (visor.parts !== last) { last = visor.parts; try { poner(); } catch (e) { console.error('aristas', e); } } })();

  /* el control: en el panel Vistas, debajo de Lente */
  let seg = null;
  function pintarUI() { if (seg) seg.querySelectorAll('[data-ar]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.ar === modo))); }
  const t = setInterval(() => {
    const body = document.querySelector('#vistasPanel .cpbody'); if (!body) return; clearInterval(t);
    const d = document.createElement('div');
    d.innerHTML = '<div class="cpg">Dibujo</div><div class="cpseg" id="cpAristas">'
      + [['normal', 'Normal', 'Como siempre'], ['aristas', 'Aristas', 'El mismo render con las aristas marcadas'], ['tecnico', 'Técnico', 'Caras claras, sin texturas ni sombras, y aristas negras']]
        .map(([k, n, tip]) => `<button type="button" data-ar="${k}" data-tip="${n}|${tip}">${n}</button>`).join('') + '</div>';
    const lente = body.querySelector('#cpLente'); if (lente && lente.parentElement === body.firstElementChild) lente.after(d); else body.insertBefore(d, body.children[1] || null);
    seg = d.querySelector('#cpAristas'); seg.addEventListener('click', e => { const b = e.target.closest('[data-ar]'); if (b) set(b.dataset.ar); }); pintarUI();
  }, 300);
  setTimeout(() => clearInterval(t), 20000);
  visor.aristas = { set, modo: () => modo };
}
