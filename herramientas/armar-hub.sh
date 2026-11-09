#!/usr/bin/env bash
# Arma dist/housemaker: UN artifact con todas las casas (Maxi 8/11). Estructura:
#   index.html      la cáscara (hub/index.html): índice de casas y cargador de cada una (?casa=carhue)
#   casas.json      lista de casas (META de cada modelo.js), archivos de cada casa, archivos del motor y el import map de three
#   motor/          el motor, UNA sola vez (los archivos pesados —personas, muebles, eztree— no se repiten por casa)
#   <casa>/         sólo lo propio de la casa (lo que hay en casas/<casa>/ más lo que genera su armar-extra.sh) y pagina.html (su HTML tal cual)
# Las casas importan './visor3d.js' como siempre; el import map que arma la cáscara manda esas rutas a motor/ y las que el motor
# importa de la casa (./modelo.js, ./video.js, ./calco-glb.js) a la carpeta de la casa. Uso: bash herramientas/armar-hub.sh [casa ...]
set -euo pipefail
cd "$(dirname "$0")/.."
CASAS=${*:-"carhue arcos cocinas octet malabrigo catalogo laboratorio"}
OUT=dist/housemaker
rm -rf "$OUT"; mkdir -p "$OUT/motor"
cp -r motor/. "$OUT/motor/"; rm -f "$OUT/motor/_clipper.js"
MC=$(git log -1 --format=%h -- motor 2>/dev/null || echo "?"); MF=$(git log -1 --format=%cd --date=format:%d/%m/%Y -- motor 2>/dev/null || echo "")
printf "export const MOTOR = { commit: '%s', fecha: '%s' };\n" "$MC" "$MF" > "$OUT/motor/motor-version.js"
cp hub/index.html "$OUT/index.html"
for c in $CASAS; do
  bash herramientas/armar.sh "$c" >/dev/null            # dist/<casa> completo (corre su armar-extra.sh)
  mkdir -p "$OUT/$c"
  # de dist/<casa> van los archivos que NO son del motor (los de la casa y los generados), menos la página de prueba y lo del CDN local
  (cd "dist/$c" && find . -type f ! -name '_prueba.html' ! -name '_clipper.js' ! -name 'ARTIFACT.md' ! -name 'motor-version.js' ! -name '*.sh' ! -path './_three/*' | while read -r f; do
     f=${f#./}; [ -e "../../motor/$f" ] && continue; mkdir -p "../../$OUT/$c/$(dirname "$f")"; cp "$f" "../../$OUT/$c/$f"; done)
  mv "$OUT/$c/$c.html" "$OUT/$c/pagina.html"
done
node - "$OUT" "$MC" "$MF" $CASAS <<'JS'
const fs=require('fs'),path=require('path');const [OUT,MC,MF,...CASAS]=process.argv.slice(2);
const motor=fs.readdirSync(path.join(OUT,'motor')).filter(f=>f.endsWith('.js'));
(async()=>{const casas=[];
  for(const c of CASAS){const dir=path.join(OUT,c);const archivos=fs.readdirSync(dir).filter(f=>fs.statSync(path.join(dir,f)).isFile());
    let META={};try{const m=await import(path.resolve(dir,'modelo.js'));META=m.META||{};}catch(e){/* catálogo y laboratorio no tienen modelo */}
    const html=fs.readFileSync(path.join(dir,'pagina.html'),'utf8');const t=/<title>([^<]*)<\/title>/.exec(html);
    const RES={octet:'Editor de estructuras de tubos y nodos (octet truss): la mesa de vidrio y sus modelos guardados.',catalogo:'Todas las piezas del motor, por familia, con sus parámetros: para copiarlas a un escenario.',laboratorio:'Banco para limpiar y ajustar los modelos 3D antes de que entren a una casa.'};
    casas.push({id:c,nombre:META.nombre||(t?t[1]:c),resumen:META.resumen||RES[c]||'',version:META.version||'',fecha:META.fecha||'',archivos});}
  const imports={"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"};
  fs.writeFileSync(path.join(OUT,'casas.json'),JSON.stringify({motorCommit:MC,motorFecha:MF,imports,motor,casas},null,1));
  console.log('casas.json:',casas.map(c=>c.id+' ('+c.archivos.length+' archivos)').join(', '));})();
JS
echo "armado $OUT: $(find "$OUT" -type f | wc -l) archivos, $(du -sm "$OUT" | cut -f1) MB"
