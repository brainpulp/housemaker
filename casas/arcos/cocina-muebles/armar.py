#!/usr/bin/env python3
# Junta en una sola página las cocinas de Carhué y de Arcos (Maxi 20/11/2026: «a los carpinteros les tengo que mostrar todo»).
# Entrada: la página de Carhué tal como la deja casas/carhue/cocina-muebles/page.py (o la publicada), y el JSON de gen.py de Arcos.
# Agrega: pestañas Carhué / Arcos, un render 3D de cada cocina (render-carhue.jpg, render-arcos.jpg, publicados junto a la página)
# y las hojas de Arcos. Uso: python3 armar.py <carhue.html> <arcos.json> <salida.html>
import json, re, sys
src, aj, out = sys.argv[1:4]
s = open(src).read(); A = json.load(open(aj))
assert 'v-ar-carpintero' not in s, 'la página ya tiene Arcos: partir de la de Carhué sola'
s = s.replace('<title>Cocina de Carhué: muebles</title>', '<title>Cocinas de Carhué y Arcos: muebles</title>', 1)
s = s.replace('<p class="eyebrow">Carhué · Ingeniero Maschwitz</p>', '<p class="eyebrow" id="eyebrow">Carhué · Ingeniero Maschwitz</p>', 1)
s = s.replace('<h1>Cocina: muebles bajo mesada</h1>', '<h1 id="titulo">Cocina: muebles bajo mesada</h1>', 1)
nav_old = re.search(r'<nav class="tabs" aria-label="Hojas">.*?</nav>', s, re.S).group(0)
nav_new = ('<nav class="tabs kit" aria-label="Cocina"><a href="#carpintero" data-kit="ch">Carhué</a><a href="#ar-carpintero" data-kit="ar">Arcos</a></nav>\n'
           '  <nav class="tabs sub" aria-label="Hojas"><a href="#carpintero" data-tab="carpintero">Para el carpintero</a><a href="#despiece" data-tab="despiece">Despiece</a></nav>')
s = s.replace(nav_old, nav_new, 1)
css = ('nav.tabs.kit{margin-bottom:0;border-bottom:none}nav.tabs.kit a{font-size:17px;padding:10px 18px}nav.tabs.kit a[aria-current="page"]{background:var(--ink);color:var(--sheet);border-color:var(--ink)}'
       'nav.tabs.sub{margin-top:10px}.render img{display:block;width:100%;height:auto;border-radius:3px;border:1px solid var(--rule)}'
       'svg .frontN{fill:var(--zoc);stroke:var(--ink);stroke-width:.6px;vector-effect:non-scaling-stroke}svg .numw{font-family:var(--f-head);font-weight:600;fill:#d9dde0}'
       'svg .stone{fill:#2a2d30;stroke:var(--ink);stroke-width:.6px;vector-effect:non-scaling-stroke}svg .inox{fill:var(--steel-soft);stroke:var(--muted);stroke-width:.6px;vector-effect:non-scaling-stroke}'
       'svg .oven{fill:#1d2024;stroke:var(--ink);stroke-width:.6px;vector-effect:non-scaling-stroke}\n</style>')
s = s.replace('</style>\n\n<div class="wrap">', css + '\n\n<div class="wrap">', 1)
render = lambda f, alt: (f'<div class="sheet render"><figure><figcaption><span>Render 3D del modelo</span><span>orientativo</span></figcaption>'
                         f'<img src="{f}" alt="{alt}" loading="lazy" width="1600" height="1000"></figure></div>')
# render de Carhué después de «Qué hay que hacer»
i = s.index('<section id="v-carpintero"'); j = s.index('</div>', s.index('</p>', s.index('class="excl"', i))) + len('</div>')
s = s[:j] + '\n\n      ' + render('render-carhue.jpg', 'Render 3D de la cocina de Carhué') + s[j:]
ar = A['html'].replace('{RENDER_AR}', render('render-arcos.jpg', 'Render 3D de la cocina de Arcos'))
k = s.index('</main>'); s = s[:k] + ar + '\n  ' + s[k:]
# script: cuatro hojas y copiar de las dos cocinas
sc = re.search(r'<script>\n\(function\(\)\{\n  const CSV=.*?\n\}\)\(\);\n</script>', s, re.S).group(0)
csv_ch = re.search(r'const CSV=(.*?);\n', sc, re.S).group(1)
nuevo = '''<script>
(function(){
  const CSV={ch:%s,ar:%s};
  const HEAD={ch:['Carhué · Ingeniero Maschwitz','Cocina: muebles bajo mesada'],ar:['Arcos 4264 · Núñez','Cocina: muebles, alacenas e isla']};
  const views=[...document.querySelectorAll('[data-view]')],tabs=[...document.querySelectorAll('[data-tab]')],kits=[...document.querySelectorAll('[data-kit]')];
  function show(){let h=(location.hash||'').replace('#','');const k=h.startsWith('ar')?'ar':'ch';const hoja=h.endsWith('despiece')?'despiece':'carpintero';const v=(k==='ar'?'ar-':'')+hoja;
    views.forEach(s=>{s.hidden=s.dataset.view!==v;});
    tabs.forEach(a=>{a.href='#'+(k==='ar'?'ar-':'')+a.dataset.tab;if(a.dataset.tab===hoja)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    kits.forEach(a=>{if(a.dataset.kit===k)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    document.getElementById('eyebrow').textContent=HEAD[k][0];document.getElementById('titulo').textContent=HEAD[k][1];}
  window.addEventListener('hashchange',show);show();
  const tsv=rows=>rows.map(r=>r.map(x=>String(x).replace(/\\t|\\n/g,' ')).join('\\t')).join('\\n');
  function copy(btn,text,ok){const msg=btn.closest('.sheet').querySelector('.ok');const done=()=>{if(msg){msg.textContent=ok;setTimeout(()=>{msg.textContent='';},2500);}};
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(done,()=>fallback(text,done,msg));}else fallback(text,done,msg);}
  function fallback(text,done,msg){const t=document.createElement('textarea');t.value=text;t.setAttribute('readonly','');t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();
    try{document.execCommand('copy');done();}catch(e){if(msg)msg.textContent='No se pudo copiar: seleccioná la tabla y copiala a mano.';}t.remove();}
  const ca=document.getElementById('copyAll');if(ca){ca.dataset.csv='ch';ca.classList.add('copyAll');}
  document.querySelectorAll('button.copyAll').forEach(b=>b.addEventListener('click',()=>copy(b,tsv(CSV[b.dataset.csv]),'Copiado: pegalo en una planilla.')));
  document.querySelectorAll('button[data-copy]').forEach(b=>b.addEventListener('click',()=>{let g=b.dataset.copy,k='ch';if(g.startsWith('ar:')){k='ar';g=g.slice(3);}
    const C=CSV[k];copy(b,tsv([C[0],...C.slice(1).filter(r=>r[0]===g)]),'Copiada la tabla «'+g+'».');}));
})();
</script>''' % (csv_ch, json.dumps(A['csv'], ensure_ascii=False).replace('</', '<\\/'))
s = s.replace(sc, nuevo, 1)
open(out, 'w').write(s)
print('ok', len(s))
