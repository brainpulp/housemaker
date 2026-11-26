# Cocina de Carhué: muebles (diagrama + despiece)

Página publicada: https://claude.ai/artifact/SLXfWvDJuVMAwdyqUZSrTC (20/11/2026).
`DESP=/tmp/desp python3 gen.py && DESP=/tmp/desp python3 page.py` (DESP es la carpeta de trabajo; copiar ahí `plantilla.html` antes). Medidas tomadas del escenario E de la cocina (mesada m273 con mods [46, 80, 92.83×3], península m277).
Desde el 26/11/2026 (Maxi) bajo el anafe de la península va el horno empotrado y ese mueble se hace en obra: `HORNO = True` en gen.py lo saca del despiece. Diferencia con el modelo: la columna de 0,80 bajo la bacha farm lleva 2 cajones (el modelo dibuja 3). La columna 1 es el tacho extraíble (Maxi 25/11; antes, puerta con estante). Frentes de madera maciza que pone Maxi, empalmando tablas de 20–25 cm.

**Desde el 20/11/2026 la página tiene también la cocina de Arcos** (pestañas Carhué / Arcos y un render 3D de cada una). Si se regenera Carhué con `page.py`, pasarla después por `casas/arcos/cocina-muebles/armar.py` (ver su README) para no perder Arcos ni los renders.
