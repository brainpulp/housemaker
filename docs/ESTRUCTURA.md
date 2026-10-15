# Motor de cálculo estructural (diseño y prototipo)

Hoy, 14/10/2026, existe un prototipo que funciona sobre las vigas de acero (`motor/estructura.js`). Sirve para diseñar cómo se usa el motor antes de extenderlo a madera, columnas y entrepisos. Es **orientativo**: no reemplaza el cálculo firmado.

## Cómo funciona

```
barras  → apoyos → cargas → combinaciones → solver → esfuerzos → verificación → % de uso
```

1. **Barras.**
   - **De dónde salen:** se toman del modelo (`ESTRUCTURA`). Hoy entran las `viga` cuya sección dice «perfil» o «acero».
   - **Datos de cada una:** largo, eje, sección (catálogo IPE por ahora), acero (F-24 o F-36).
2. **Apoyos.**
   - **Automáticos:** las columnas que caen sobre el eje (±15 cm).
   - **Agregados:** los que pone la casa o el usuario, marcados como *supuesto*.
3. **Cargas.**
   - **Peso propio** del perfil.
   - **D:** peso del techo en kN/m², por ancho tributario.
   - **Lr:** sobrecarga de techo según CIRSOC 101 (base ASCE 7). Son 0,96 kN/m², reducidos según el área tributaria hasta un mínimo de 0,58.
4. **Combinaciones.**
   - **Resistencia:** CIRSOC 301 (LRFD), 1,4 D y 1,2 D + 1,6 Lr.
   - **Servicio:** D + Lr y Lr sola.
5. **Solver.** Viga continua por rigidez directa (Euler-Bernoulli, 2 grados de libertad por nodo, nodos cada 10 cm o menos). Si tiene menos de dos apoyos, detecta el mecanismo. Lo verifiqué contra casos cerrados: simplemente apoyada (M = wL²/8, flecha = 5wL⁴/384EI) y dos tramos iguales (reacciones 3/8 · 5/4 · 3/8 wL).
6. **Verificación.**
   - **Flexión:** φMn = 0,9 · Fy · Zx. Supone sección compacta y arriostrada por los cabios, sin pandeo lateral-torsional.
   - **Corte:** φVn = 0,9 · 0,6 · Fy · h · tw.
   - **Flecha por tramo:** L/250 con D + Lr y L/300 con Lr. Los voladizos se miden con 2 Lv. Las puntas de menos de 30 cm no cuentan.
7. **Uso.** Es el máximo de flexión, corte y flecha, y define el color en el 3D: verde hasta 60 %, después amarillo, rojo por encima de 100 %.

## Interfaz

- **Botón:** en la barra de herramientas está el ícono de la viga.
- **Sección «Estructura» en la barra derecha:**
  - Lista de barras con su barra de uso. Tocar una la elige, y elegirla en el 3D también la elige acá.
  - Datos editables (sección, acero, ancho tributario, D) con una etiqueta *supuesto* hasta que se confirman.
  - Apoyos: × quita uno agregado, «＋ apoyo» agrega uno en el medio del tramo más largo.
  - Tabla pedido / resiste / uso.
  - Diagramas de momento, corte y flecha con los apoyos dibujados.
  - Reacciones de resistencia y de servicio, que son la carga que baja a cada columna.
- **Mapa de uso en el 3D:** colorea las barras calculadas.
- **Persistencia:** colección `estructura` de la base del artifact (un documento por barra) y `localStorage` como respaldo.

## Lo que sigue

1. **Madera** (CIRSOC 601): cabios, tirantes, correas y vigas. Hace falta especie, clase y escuadría.
2. **Columnas:** compresión con pandeo. Reciben la reacción de las vigas que apoyan en ellas.
3. **Bajada de cargas:** cabios → vigas → columnas → fundaciones, encadenando reacciones como cargas puntuales.
4. **Viento** (CIRSOC 102) y nieve donde corresponda.
5. **Perfiles W reales** (catálogo del proveedor) y secciones a medida.
6. **Pandeo lateral-torsional** con la distancia real entre arriostramientos.
7. **Informe imprimible** por barra.
