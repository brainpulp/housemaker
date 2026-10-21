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
# versión del motor: commit del último cambio en motor/ (con «+local» si hay cambios sin commitear); la muestra el visor 3D junto a los fps
MC=$(git log -1 --format=%h -- motor 2>/dev/null || echo "?"); MF=$(git log -1 --format=%cd --date=format:%d/%m/%Y -- motor 2>/dev/null || echo "")
[ -n "$(git status --porcelain motor 2>/dev/null)" ] && MC="$MC+local"
printf "export const MOTOR = { commit: '%s', fecha: '%s' };\n" "$MC" "$MF" > "$OUT/motor-version.js"
if [ "${2:-}" = "--prueba" ]; then
  HTML=$(ls "$OUT"/*.html | grep -v _prueba | head -1)
  [ -d node_modules/three ] || npm i --no-save three@0.160.0 >/dev/null
  ln -sfn "$(pwd)/node_modules/three" "$OUT/_three"
  sed -e 's#https://cdn.jsdelivr.net/npm/three@0.160.0/#./_three/#g' -e 's#https://cdn.jsdelivr.net/npm/clipper-lib@6.4.2/clipper.js#./_clipper.js#g' "$HTML" > "$OUT/_prueba.html"   # sin CDN: three y Clipper locales
fi
echo "listo: $OUT ($(ls "$OUT" | wc -l) archivos)"
