# Referencias de interiores (Maxi, 14/10/2026)

Vienen de la carpeta «muebles para housemaker», en la compu de Maxi: 11 imágenes de WhatsApp. Son una referencia general de interiores, no sólo de muebles. No están copiadas en el repo; acá queda el lenguaje que se saca de ellas y qué del catálogo lo representa.

## Lenguaje

- **Bajo y horizontal:** sofás y camas sobre tarimas de madera maciza que sobresalen, mesas ratonas bajas de tablones.
- **Materiales:**
  - madera maciza cálida, de rústica a nogal;
  - lino crudo y gris;
  - yute;
  - piedra o pizarra oscura en paredes de baño y cocina;
  - azulejo artesanal verde oscuro con junta clara;
  - metal negro mate en grifería, marcos y luminarias.
- **Luz:**
  - cálida y baja;
  - faroles de papel (esferas) colgando;
  - colgantes lineales finos;
  - tiras LED escondidas bajo muebles flotantes y detrás de espejos;
  - apliques con globo de vidrio en el baño.
- **Cocina:** bajo mesada negro mate, alacenas y columnas de madera, salpicadero de pizarra.
- **Baño:** vanitorio de madera flotante, bachas de apoyo (negras o de piedra), grifería de pared negra, espejos con marco negro, ducha con mampara y piso de listones de madera.
- **Comedor:** mesa maciza de tapa gruesa sobre dos patas panel, sillas de respaldo curvo.
- **Dormitorio:** cama baja sobre tarima con cabecero de listones verticales, mesas de luz integradas, apliques a los lados.

## Catálogo de muebles reutilizable

Los muebles viven en `motor/muebles.js` (`catalogoMuebles(THREE)` y `MATERIALES`), sin nada de Carhué: sirven para cualquier casa. `casas/catalogo/catalogo.html` los muestra todos con sus parámetros y da el JSON para pegar en un escenario (`{t, x, y, r, p}`). Una pieza nueva va en `muebles.js` con `n`, `cat` (familia), `p` (parámetros en cm) y `g(p)`; mantener las claves y parámetros de las piezas existentes para no romper escenarios guardados.

Desde el 16/10/2026 los muebles principales son modelos 3D reales (`motor/modelos.js`): Maxi rechazó los geométricos. Para sumar uno: buscar en Objaverse (Hugging Face `allenai/objaverse`, metadatos y LVIS), descartar lo antiguo, rústico, de cuero o de juego, mostrarle a Maxi una hoja con opciones y, con lo elegido, pasar el GLB a metal/rugosidad (`gltf-transform metalrough`, three no lee spec/gloss), comprimirlo (`optimize --texture-compress webp --texture-size 1024 --compress meshopt`), guardarlo en base64 como `motor/mueble-<clave>.js` y agregarlo a `MODELOS` con autor y uid (licencia CC BY: el autor tiene que figurar). El frente va hacia +z; si el modelo viene girado, se corrige antes de exportar.

## En el catálogo (motor/muebles.js y motor/luminarias.js)

| Pieza | Código |
|---|---|
| Sofá bajo sobre plataforma (recto o en L) | `sofaPlat` |
| Sofá modular de lino | `sofaMod` |
| Mesa ratona de tablones | `ratonaTab` |
| Mesa ratona redonda baja | `ratonaBaja` |
| Taburete tronco | `taburete` |
| Alfombra de yute | `alfombraYute` |
| Cama baja sobre tarima con cabecero de listones | `camaPlat` |
| Mesa maciza | `mesaMaciza` |
| Silla de respaldo curvo | `sillaCurva` |
| Vanitorio de madera flotante con bacha de apoyo, LED abajo y espejos con marco negro | `vanitorioMad` |
| Farol de papel | `farol` |
| Colgante tubo vertical | `tubo` |
| Aplique con globo de vidrio | `apliqueGlobo` |

**Materiales nuevos:** `madRust`, `madClara`, `pizarra`, `yute`, `ledCalido`.

**Escenarios de ejemplo en Carhué:** living «D · Bajo y cálido (referencias)» y comedor «C · Mesa maciza (referencias)».
