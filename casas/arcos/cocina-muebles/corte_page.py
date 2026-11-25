#!/usr/bin/env python3
# Página para el cortero (Sólido) con la lista de corte de corte.py. Uso: python3 corte_page.py <corte.json> <index.html>
import json, sys, html
E = html.escape
d = json.load(open(sys.argv[1])); filas, tot = d['filas'], d['tot']
c = lambda x, n=2: f'{x:,.{n}f}'.replace(',', 'X').replace('.', ',').replace('X', '.')
SW = {'Melamina negra lisa 18 mm': ('#16171a', '#2a2c31', 'Lisa'), 'Melamina negra texturada 18 mm': ('#1d1e22', 'url(#tx)', 'Texturada, con veta'),
      'Melamina blanca 18 mm': ('#f4f3ef', '#ffffff', 'Cajas de los cajones'), 'Fibroplus 3 mm negro': ('#25262a', '#33353a', 'Fondos de los muebles'),
      'Fibroplus 3 mm blanco': ('#e9e7e0', '#f6f5f1', 'Pisos de los cajones')}

def glifo(f):
    # rectángulo con los lados que llevan canto marcados en grueso (L = lados horizontales del dibujo)
    on = lambda k: f['L' + k[1]] if k[0] == 'L' else f['A' + k[1]]
    s = lambda k: 'var(--canto)' if (f[k] if k in f else '') else 'var(--line)'
    w = lambda k: 4 if f[k] else 1.2
    return (f'<svg class="g" viewBox="0 0 44 28" role="img" aria-label="cantos">'
            f'<rect x="4" y="4" width="36" height="20" fill="var(--chip)"/>'
            f'<line x1="4" y1="4" x2="40" y2="4" stroke="{s("L1")}" stroke-width="{w("L1")}"/>'
            f'<line x1="4" y1="24" x2="40" y2="24" stroke="{s("L2")}" stroke-width="{w("L2")}"/>'
            f'<line x1="4" y1="4" x2="4" y2="24" stroke="{s("A1")}" stroke-width="{w("A1")}"/>'
            f'<line x1="40" y1="4" x2="40" y2="24" stroke="{s("A2")}" stroke-width="{w("A2")}"/></svg>')

def cantos_txt(f):
    ls = [k for k in ('L1', 'L2', 'A1', 'A2') if f[k]]
    if not ls: return 'sin canto'
    col = f[ls[0]].lower()
    return ('4 lados' if len(ls) == 4 else ' + '.join(ls)) + ' · ' + col

hero = []
for i, (k, t) in enumerate(tot.items()):
    a, b, lab = SW[k]
    hero.append(f'''<div class="sw"><svg viewBox="0 0 120 70" aria-hidden="true"><defs><pattern id="tx" width="4" height="70" patternUnits="userSpaceOnUse"><rect width="4" height="70" fill="#202125"/><rect width="1" height="70" fill="#2c2e33"/></pattern></defs>
<polygon points="10,22 92,22 110,8 28,8" fill="{b}"/><polygon points="10,22 92,22 92,{30 if '18' in k else 25} 10,{30 if '18' in k else 25}" fill="{a}"/><polygon points="92,22 110,8 110,{16 if '18' in k else 11} 92,{30 if '18' in k else 25}" fill="{a}" opacity=".8"/></svg>
<b>{E(k)}</b><span>{E(lab)}</span><span class="n">{t["n"]} piezas · {c(t["m2"])} m²</span><span class="n">≈ {t["placas"]} placa{"s" if t["placas"] > 1 else ""} de {t["placa"][0]} × {t["placa"][1]}</span>{f'<span class="n">canto {E(t["canto"].lower())}: {c(t["canto_m"],1)} m</span>' if t["canto_m"] else ''}</div>''')

secs = []
for k, t in tot.items():
    fs = [f for f in filas if f['color'] == k]
    rows = ''.join(
        f'<tr class="{"dep" if f["dep"] else ""}"><td class="id">{E(f["id"])}</td><td class="r">{f["cant"]}</td><td class="r">{f["L"]}</td><td class="r">{f["A"]}</td><td class="r">{f["esp"]}</td>'
        f'<td>{"sí" if f["veta"] else "—"}</td><td class="ct">{glifo(f) if any(f[x] for x in ("L1","L2","A1","A2")) else ""}<span>{E(cantos_txt(f))}</span></td>'
        f'<td>{E(f["desc"])}{(" <em>" + E(f["nb"]) + "</em>") if f["nb"] else ""}{" <strong>Medida provisoria: depende de la heladera</strong>" if f["dep"] else ""}</td></tr>'
        for f in fs)
    secs.append(f'''<section class="band mat" id="{E(fs[0]["id"][0].lower())}{"n" if "negro" in k and k.startswith("Fib") else ""}">
<h2>{E(k)}</h2><p class="sub">{t["n"]} piezas en {t["filas"]} medidas · {c(t["m2"])} m² netos{f" · canto {E(t['canto'].lower())} {c(t['canto_m'],1)} m" if t["canto_m"] else " · sin canto"}</p>
<div class="scroll"><table class="stack"><thead><tr><th>ID</th><th class="r">Cant.</th><th class="r">Largo</th><th class="r">Ancho</th><th class="r">Esp.</th><th>Veta</th><th>Cantos</th><th>Pieza</th></tr></thead><tbody>{rows}</tbody></table></div></section>''')

COLS = d['COLS']
tsv = '\t'.join(COLS) + '\n' + '\n'.join('\t'.join(str(x) for x in [f['id'], f['cant'], f['L'], f['A'], f['esp'], f['color'], f['veta'], f['L1'], f['L2'], f['A1'], f['A2'], f['desc'], f['nb'], 'Sí: depende de la heladera' if f['dep'] else '']) for f in filas)
ndep = sum(f['cant'] for f in filas if f['dep'])

page = f'''<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cocina Arcos: corte de placas</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@700&family=Red+Hat+Text:wght@400;500;700&display=swap" rel="stylesheet">
<style>
/* VOICE: orden de corte de taller, clara y sobria, para que el cortero cotice sin preguntar
   IDEA: la hoja de pedido que se pega en el banco de la seccionadora
   PICTURE: las placas apiladas de cada material, con piezas, m² y canto
   COLOUR and TYPE: oxford blue de banda, blanco, magenta sólo para lo provisorio; Red Hat Display + Text
   LAYOUT: banda de título con las placas, notas de corte, una tabla por placa */
:root{{color-scheme:light dark;--bg:light-dark(#ffffff,#070f26);--ink:light-dark(#0b1f4b,#e8ecf6);--soft:light-dark(#4a5878,#a9b4cc);--band:#0b1f4b;--line:light-dark(#c9cfdc,#3a4766);--chip:light-dark(#eef1f6,#142247);--canto:light-dark(#0b1f4b,#ffffff);--acc:#e0115f;--dep:light-dark(#fff0f5,#3a0d22)}}
:root[data-theme=light]{{color-scheme:light}}:root[data-theme=dark]{{color-scheme:dark}}
*{{box-sizing:border-box;min-width:0}}
body{{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 "Red Hat Text",system-ui,sans-serif;overflow-x:clip}}
.band{{padding:clamp(24px,4vw,56px) max(5vw,16px)}}
header.band{{background:var(--band);color:#fff}}
h1{{font:700 clamp(30px,5vw,48px)/1.05 "Red Hat Display",sans-serif;margin:0 0 10px;text-wrap:balance;max-width:1240px}}
h2{{font:700 26px/1.1 "Red Hat Display",sans-serif;margin:0 0 4px}}
.lead{{max-width:68ch;margin:0;color:#d5dcef}}
.sws{{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:14px;margin-top:28px;max-width:1240px}}
.sw{{background:#132a5e;border-radius:6px;padding:12px 14px 14px;display:flex;flex-direction:column;gap:2px}}
.sw svg{{width:100%;height:auto;max-height:90px}}.sw b{{font-weight:700}}.sw span{{color:#c4cde4;font-size:14px}}.sw .n{{font-variant-numeric:tabular-nums}}
.notas{{max-width:1240px;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px 32px;margin:0;padding:0;list-style:none}}
.notas li{{border-top:1px solid var(--line);padding-top:8px}}.notas b{{display:block}}
.dep-k{{display:inline-block;width:12px;height:12px;background:var(--acc);border-radius:2px;vertical-align:-1px;margin-right:6px}}
.mat{{max-width:calc(1240px + 10vw);border-top:1px solid var(--line)}}.sub{{color:var(--soft);margin:0 0 14px}}
.scroll{{overflow-x:auto}}table{{border-collapse:collapse;width:100%;font-size:15px}}
th{{text-align:left;font-weight:500;color:var(--soft);border-bottom:2px solid var(--ink);padding:6px 10px 6px 0;white-space:nowrap}}
td{{border-bottom:1px solid var(--line);padding:7px 10px 7px 0;vertical-align:top}}
.r{{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}}td.id{{font-weight:700;white-space:nowrap}}
td.ct{{white-space:nowrap}}td.ct span{{color:var(--soft);font-size:14px}}.g{{width:40px;height:26px;vertical-align:middle;margin-right:6px}}
td em{{font-style:normal;color:var(--soft)}}td strong{{display:block;color:var(--acc);font-weight:700;font-size:14px}}
tr.dep td{{background:var(--dep)}}tr.dep td:first-child{{box-shadow:inset 4px 0 var(--acc);padding-left:8px}}
.tools{{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-top:18px}}
button{{font:500 16px "Red Hat Text",sans-serif;min-height:44px;padding:0 18px;border-radius:6px;border:1px solid var(--ink);background:var(--ink);color:var(--bg);cursor:pointer}}
button:focus-visible{{outline:3px solid var(--acc);outline-offset:2px}}#ok{{color:var(--soft)}}
footer{{color:var(--soft);font-size:14px}}
@media(max-width:600px){{table{{font-size:13px}}.stack thead{{display:none}}.stack tr{{display:grid;padding-block:10px;border-bottom:1px solid var(--line)}}.stack td{{display:flow-root;border:0;padding:3px 0;padding-inline-start:6.5em;text-align:start;white-space:normal}}.stack td::before{{content:attr(data-l);float:inline-start;width:6em;margin-inline-start:-6.5em;color:var(--soft)}}.stack td:empty{{display:none}}tr.dep td:first-child{{box-shadow:none;padding-left:6.5em}}}}
</style><script>new MutationObserver(()=>{{for(const c of document.querySelectorAll('.stack td:not([data-l])')){{let i=0,p=c;while(p=p.previousElementSibling)i+=p.colSpan;c.dataset.l=c.closest('table').rows[0].cells[i]?.textContent||''}}}}).observe(document,{{childList:true,subtree:true}})</script></head><body>
<header class="band"><h1>Cocina Arcos: lista de corte de placas</h1>
<p class="lead">Pedido de presupuesto de corte y canteado. {len(filas)} medidas, {sum(f["cant"] for f in filas)} piezas, en cinco placas distintas. La madera maciza no está incluida.</p>
<div class="sws">{"".join(hero)}</div></header>
<section class="band"><ul class="notas">
<li><b>Medidas</b>Finales, en milímetros: largo × ancho × espesor. El canto de 0,45 mm no se descuenta.</li>
<li><b>Veta</b>Sólo la texturada: el largo va en el sentido de la veta, vertical en el mueble. No rotar esas piezas. Las lisas y el fibroplus se pueden rotar.</li>
<li><b>Cantos</b>PVC 0,45 mm del color de la placa: negro en las negras, blanco en la blanca. L1 y L2 son los dos lados del largo; A1 y A2, los del ancho. En el dibujo, el trazo grueso es el lado con canto.</li>
<li><b><i class="dep-k"></i>Medidas provisorias</b>Las {ndep} piezas de la alacena sobre la heladera (marcadas en rosa) son para una heladera de 0,75 × 1,90 × 0,70 m. Se confirman cuando esté definida.</li>
</ul>
<div class="tools"><button id="cp" type="button">Copiar la tabla para Excel</button><span id="ok" role="status"></span></div></section>
{"".join(secs)}
<footer class="band">Las cantidades de placa son estimadas con un 20 % de desperdicio; el optimizado lo hace el cortero.</footer>
<textarea id="tsv" hidden>{E(tsv)}</textarea>
<script>{{const b=document.getElementById('cp'),o=document.getElementById('ok');b.addEventListener('click',async()=>{{try{{await navigator.clipboard.writeText(document.getElementById('tsv').value);o.textContent='Copiada: pegala en una planilla.'}}catch(e){{o.textContent='No se pudo copiar desde acá.'}}}})}}</script>
</body></html>'''
open(sys.argv[2], 'w').write(page)
print('ok', len(page))
