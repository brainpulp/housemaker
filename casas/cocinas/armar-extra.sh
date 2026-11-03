#!/usr/bin/env bash
# Lo corre herramientas/armar.sh después de copiar motor + casa a dist/cocinas: las fuentes pasan a ser copias reales de los modelos
# de Carhué y Arcos (en el repo son re-exportaciones relativas, que el artifact no puede resolver).
set -euo pipefail
OUT="$1"
cp casas/carhue/modelo.js "$OUT/fuente-carhue.js"
cp casas/arcos/modelo.js "$OUT/fuente-arcos.js"
