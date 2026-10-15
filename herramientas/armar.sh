#!/usr/bin/env bash
# Arma dist/<casa>/: carpeta plana (motor + casa) lista para publicar como artifact o para probar.
#   bash herramientas/armar.sh carhue           → dist/carhue
#   bash herramientas/armar.sh carhue --prueba  → además dist/carhue/_prueba.html que usa three local (node_modules), para las pruebas sin CDN
set -euo pipefail
cd "$(dirname "$0")/.."
CASA="${1:?nombre de la casa (carpeta en casas/)}"
[ -d "casas/$CASA" ] || { echo "no existe casas/$CASA"; exit 1; }
OUT="dist/$CASA"; rm -rf "$OUT"; mkdir -p "$OUT"
cp -r motor/. "$OUT/"
cp -r "casas/$CASA/." "$OUT/"      # lo de la casa pisa al motor si hay nombres iguales
if [ "${2:-}" = "--prueba" ]; then
  HTML=$(ls "$OUT"/*.html | grep -v _prueba | head -1)
  [ -d node_modules/three ] || npm i --no-save three@0.160.0 >/dev/null
  ln -sfn "$(pwd)/node_modules/three" "$OUT/_three"
  sed 's#https://cdn.jsdelivr.net/npm/three@0.160.0/#./_three/#g' "$HTML" > "$OUT/_prueba.html"
fi
echo "listo: $OUT ($(ls "$OUT" | wc -l) archivos)"
