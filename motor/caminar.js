/* Teclado y «caminar hasta acá» del visor 3D (Maxi 07/11/2026). Es igual para todas las casas.
   · W A S D: avanzar, retroceder y costados; Q / E: bajar y subir; flechas: girar la vista; Shift: rápido.
   · W tocada (sin mantener): prende o apaga «caminar hasta acá». Con el modo prendido, cada clic es un destino.
     Si la cámara está en el aire, primero aterriza cerca del destino; después camina hasta ahí con los ojos a 1,70 m.
     Se apaga con W otra vez, con Esc o eligiendo otra herramienta. W mantenida sigue avanzando como siempre.
   · Camina en línea recta: no esquiva paredes ni busca la escalera. */
import * as THREE from 'three';

const OJOS = 170, VEL = 160, TAP = 220, MARGEN = 45;

export function initCaminar(visor, { activo = () => true } = {}) {
  const V = THREE.Vector3, el = visor.renderer.domElement;
  const despertar = () => { window.__despertar && window.__despertar(); };
  const busy = t => t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
  const api = { on: false, alPrender: null, alCambiar: null };
  let anim = null, marca = null;

  /* ---------- piso debajo de un punto ---------- */
  const rc = new THREE.Raycaster(), ABAJO = new V(0, -1, 0), _n = new V(), _m = new THREE.Matrix3();
  function mallas() {
    const ms = [], vis = ob => { for (let o = ob; o; o = o.parent) if (!o.visible) return false; return true; };
    visor.scene.traverse(ob => { if (!ob.isMesh || ob.userData.noCaminar || !ob.material) return; const m = Array.isArray(ob.material) ? ob.material[0] : ob.material;
      if (m.visible === false || (m.transparent && m.opacity < .5) || m.colorWrite === false) return; if (vis(ob)) ms.push(ob); });
    return ms;
  }
  const cortado = p => { const cps = visor.renderer.clippingPlanes || []; return cps.some(pl => pl.distanceToPoint(p) < 0); };
  const normal = h => { if (!h.face) return null; _m.getNormalMatrix(h.object.matrixWorld); return _n.copy(h.face.normal).applyMatrix3(_m).normalize(); };
  function pisoBajo(p, ms) {
    rc.set(new V(p.x, p.y + 20, p.z), ABAJO); rc.far = 1e5;
    for (const h of rc.intersectObjects(ms, false)) { if (cortado(h.point)) continue; const n = normal(h); if (n && n.y > .6) return h.point.y; }
    return 0;
  }

  /* ---------- destino a partir del clic ---------- */
  function destino(hit, ray) {
    const ms = mallas(), dir = ray.ray.direction, hd = new V(dir.x, 0, dir.z);
    if (!hit) { const g = ray.ray.intersectPlane(new THREE.Plane(new V(0, 1, 0), 0), new V()); return g ? { p: g, ms } : null; }
    const n = normal(hit);
    if (n && n.y > .6) return { p: hit.point.clone(), ms };
    /* pared, mueble o cielorraso: me paro un poco antes, en el piso que haya ahí */
    if (hd.lengthSq() < 1e-6) return { p: hit.point.clone(), ms };
    const q = hit.point.clone().sub(hd.normalize().multiplyScalar(MARGEN));
    q.y = pisoBajo(new V(q.x, Math.min(q.y, visor.camera.position.y), q.z), ms);
    return { p: q, ms };
  }

  /* ---------- animación ---------- */
  const suave = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  function ponerMarca(p) {
    if (!marca) { marca = new THREE.Mesh(new THREE.RingGeometry(14, 20, 32), new THREE.MeshBasicMaterial({ color: 0xe0662d, transparent: true, opacity: .9, depthTest: false, side: THREE.DoubleSide }));
      marca.rotation.x = -Math.PI / 2; marca.renderOrder = 999; marca.userData.noCaminar = true; visor.scene.add(marca); }
    marca.position.set(p.x, p.y + 1, p.z); marca.visible = true;
  }
  const sacarMarca = () => { if (marca) marca.visible = false; };
  function cancelar() { if (anim) { anim = null; sacarMarca(); } }

  function ir(hit, ray) {
    const d = destino(hit, ray); if (!d) return;
    const cam = visor.camera, tg = visor.controls.target, E = d.p.clone(); E.y += OJOS;
    const piso = pisoBajo(cam.position, d.ms), aereo = cam.position.y - piso > OJOS + 90;
    const fases = [], hd = new V(E.x - cam.position.x, 0, E.z - cam.position.z), dist = hd.length();
    if (dist < 1 && !aereo) return;
    if (dist > 1) hd.normalize(); else hd.set(tg.x - cam.position.x, 0, tg.z - cam.position.z).normalize();
    let desde = cam.position.clone();
    if (aereo) {
      /* aterriza en el nivel del destino, un poco antes, mirando hacia él */
      const L = E.clone().sub(hd.clone().multiplyScalar(Math.min(500, dist * .6)));
      const t = Math.max(1200, Math.min(3200, desde.distanceTo(L) / 2.5));
      fases.push({ a: desde, b: L, ma: tg.clone(), mb: L.clone().add(hd.clone().multiplyScalar(100)), t });
      desde = L;
    } else {
      /* gira hacia el destino antes de arrancar */
      const mb = desde.clone().add(hd.clone().multiplyScalar(100)); mb.y = desde.y;
      fases.push({ a: desde, b: desde.clone(), ma: tg.clone(), mb, t: 350 });
    }
    const largo = new V(E.x - desde.x, 0, E.z - desde.z).length();
    if (largo > 1) fases.push({ a: desde.clone(), b: E, mira: hd.clone(), t: largo / VEL * 1000 + 300 });
    ponerMarca(d.p); anim = { fases, i: 0, t0: performance.now() }; despertar();
  }

  function paso(t) {
    const f = anim.fases[anim.i], u = Math.min(1, (t - anim.t0) / f.t), k = suave(u), cam = visor.camera, tg = visor.controls.target;
    cam.position.lerpVectors(f.a, f.b, k);
    if (f.mira) tg.copy(cam.position).add(f.mira.clone().multiplyScalar(100));
    else tg.lerpVectors(f.ma, f.mb, k);
    visor.controls.update(); despertar();
    if (u >= 1) { anim.i++; anim.t0 = t; if (anim.i >= anim.fases.length) { anim = null; sacarMarca(); } }
  }

  /* ---------- prender / apagar ---------- */
  function set(on) {
    on = !!on; if (on === api.on) return; api.on = on;
    if (on && api.alPrender) api.alPrender();
    if (!on) cancelar();
    el.style.cursor = on ? 'crosshair' : '';
    api.alCambiar && api.alCambiar(on);
  }
  api.set = set; api.toggle = () => set(!api.on); api.cancelar = cancelar;

  { const prev = visor.pick; visor.pick = (h, r) => { if (api.on && activo()) { ir(h, r); return true; } return prev ? prev(h, r) : false; }; }
  el.addEventListener('pointerdown', cancelar); el.addEventListener('wheel', cancelar, { passive: true });

  /* ---------- teclado ---------- */
  const keys = new Set(), K = ['w', 'a', 's', 'd', 'q', 'e', 'arrowleft', 'arrowright', 'arrowup', 'arrowdown'];
  let wAbajo = null, wSola = true;
  addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    if (k === 'escape' && api.on) { set(false); return; }
    if (!activo() || busy(e.target) || e.metaKey || e.ctrlKey || e.altKey || !K.includes(k)) return;
    e.preventDefault(); despertar(); if (e.shiftKey) keys.add('shift');
    if (k === 'w') { if (!e.repeat && wAbajo == null) { wAbajo = e.timeStamp || performance.now(); wSola = keys.size === 0 || (keys.size === 1 && keys.has('shift')); } return; }
    wSola = false; keys.add(k); cancelar();
  });
  addEventListener('keyup', e => {
    const k = e.key.toLowerCase(); if (!e.shiftKey) keys.delete('shift');
    if (k === 'w') { const toque = wAbajo != null && !keys.has('w') && wSola && (e.timeStamp || performance.now()) - wAbajo <= TAP; wAbajo = null; keys.delete('w'); if (toque && activo()) set(!api.on); return; }
    keys.delete(k);
  });
  addEventListener('blur', () => { keys.clear(); wAbajo = null; });

  const VT = visor.velTeclado || [120, 1500];  /* cm/s mín. y máx. de WASD; Octet (una mesa) usa menos */
  let last = performance.now(); const f = new V(), r = new V(), up = new V(0, 1, 0), d = new V();
  const tick = t => {
    const dt = Math.min(.05, (t - last) / 1000); last = t;
    if (wAbajo != null && !keys.has('w') && t - wAbajo > TAP) { keys.add('w'); cancelar(); }
    if (anim) paso(t);
    else if (keys.size && !(keys.size === 1 && keys.has('shift'))) {
      despertar(); const cam = visor.camera, tg = visor.controls.target, sp = Math.max(VT[0], Math.min(VT[1], cam.position.distanceTo(tg) * .5)) * dt;
      f.copy(tg).sub(cam.position).normalize(); r.crossVectors(f, up); if (r.lengthSq() < 1e-6) r.set(1, 0, 0); r.normalize(); d.set(0, 0, 0);
      if (keys.has('w')) d.add(f); if (keys.has('s')) d.sub(f); if (keys.has('d')) d.add(r); if (keys.has('a')) d.sub(r); if (keys.has('e')) d.y += 1; if (keys.has('q')) d.y -= 1;
      const sh = keys.has('shift'); if (sh && keys.has('arrowup')) d.y += 1; if (sh && keys.has('arrowdown')) d.y -= 1;
      if (d.lengthSq()) { d.normalize().multiplyScalar(sp); cam.position.add(d); tg.add(d); }
      const yaw = ((keys.has('arrowleft') ? 1 : 0) - (keys.has('arrowright') ? 1 : 0)) * 1.4 * dt, pit = sh ? 0 : ((keys.has('arrowup') ? 1 : 0) - (keys.has('arrowdown') ? 1 : 0)) * 1.0 * dt;
      if (yaw || pit) { const v = tg.clone().sub(cam.position); if (yaw) v.applyAxisAngle(up, yaw); if (pit) { const ax = new V().crossVectors(v, up).normalize(); const nv = v.clone().applyAxisAngle(ax, pit); if (Math.abs(Math.asin(nv.clone().normalize().y)) < 1.45) v.copy(nv); } tg.copy(cam.position).add(v); }
      visor.controls.update();
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  visor.caminar = api;
  return api;
}
