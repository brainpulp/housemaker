# Deuda: lo que falta para que el motor sea de cualquier casa

Hoy una casa nueva se arma copiando `casas/carhue` y reescribiendo `modelo.js` y `casa.js`. Para que alcance con escribir `modelo.js`, hay que resolver lo siguiente, en este orden:

1. **Sacar los datos de la casa que viven en el motor y pasarlos a `casas/<casa>/`:**
   - `equipamiento.js`: `AMB` (ambientes, vistas y escenarios de muebles) y `AMB_ORDEN`.
   - `luminarias.js`: `escLuces`, los escenarios de luz por ambiente.
   - `calefaccion.js`: `escCal`, los escenarios de calor por ambiente.
   - `noche.js`: el lugar por defecto (Ing. Maschwitz) y la tabla de lugares.
   - `termica.js`: `CLIMA` (medias mensuales del lugar) y los valores U por defecto.
   - `tours.js`: los recorridos y vuelos (puntos fijos de Carhué).
   - `equipamiento.js`: las migraciones `MIG` y `MUT`, que son de Carhué.

   Lo más simple es que cada módulo reciba sus datos en el `init(visor, datos)` y que `casa.js` se los pase.
2. **Separar `casa.js` en armador genérico + piezas especiales:** muros, aberturas, losas, techos por polígono, cabios y escalera, todo a partir de tablas.
3. **Piezas especiales como catálogo configurable por datos:** lucarna (4 tipos), dormer (simple, corrido o de una agua), corrediza tipo granero, proyectante, barn door M-43 con poleas, cercha vidriada, deck elevado con trampolín. Hoy están escritas a mano para sus ids.
4. **Importar un calco:** cargar un .glb, .dae u .obj de SketchUp u Onshape como referencia (hoy `calco-glb.js` es de Carhué) y herramientas para tomar medidas del calco.
5. **Quitar prefijos `carhue-`** de las claves de `localStorage`. No molestan, porque cada artifact tiene su propio origen, pero confunden.
6. **Cortes, vistas y aislar ambientes al motor:** hoy viven en `casas/carhue/casa.js`; tienen que pasar a un módulo del motor que reciba los locales de la casa.
