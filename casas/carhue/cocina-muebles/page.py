#!/usr/bin/env python3
import json, html, os
D = json.load(open(os.environ.get('DESP', '/tmp/desp') + '/data.json'))
E = html.escape
c = lambda x: (f'{x:.1f}'.rstrip('0').rstrip('.')).replace('.', ',')

# ---------- dibujos (SVG en cm) ----------
FS=[1.0]
def dim_h(x0, x1, y, txt, up=True, size=7):
    size=size*FS[0]
    t = y - 2.5 if up else y + 7.5
    return (f'<line class="d" x1="{x0}" y1="{y}" x2="{x1}" y2="{y}"/>'
            f'<line class="d" x1="{x0}" y1="{y-3}" x2="{x0}" y2="{y+3}"/><line class="d" x1="{x1}" y1="{y-3}" x2="{x1}" y2="{y+3}"/>'
            f'<text class="dt" x="{(x0+x1)/2}" y="{t}" font-size="{size}" text-anchor="middle">{txt}</text>')
def dim_v(x, y0, y1, txt, left=True, size=7):
    size=size*FS[0]
    tx = x - 3 if left else x + 3
    anc = 'end' if left else 'start'
    return (f'<line class="d" x1="{x}" y1="{y0}" x2="{x}" y2="{y1}"/>'
            f'<line class="d" x1="{x-3}" y1="{y0}" x2="{x+3}" y2="{y0}"/><line class="d" x1="{x-3}" y1="{y1}" x2="{x+3}" y2="{y1}"/>'
            f'<text class="dt" x="{tx}" y="{(y0+y1)/2+2.4}" font-size="{size}" text-anchor="{anc}">{txt}</text>')
def rect(x, y, w, h, cls): return f'<rect class="{cls}" x="{x}" y="{y}" width="{w}" height="{h}"/>'
def label(x, y, t, size=7, cls='lb', anc='middle'): size=size*FS[0]; return f'<text class="{cls}" x="{x}" y="{y}" font-size="{size}" text-anchor="{anc}">{t}</text>'

MODS = [46.0, 80.0, 92.83, 92.83, 92.83]

def planta():
    # mirando hacia la pared de las ventanas desde la cocina: la pared arriba, el rincón a la izquierda.
    # u: cm desde la cara de atrás del bloque de la península; v: cm desde la pared, hacia la cocina
    s = []
    s.append(rect(-95, -12, 650, 12, 'wall'))
    s.append(label(230, -4, 'PARED DE LAS VENTANAS', 6, 'lbw'))
    # mesa de madera (no es del carpintero): L
    s.append('<path class="ghost" d="M -80 0 L 0 0 L 0 155.5 L 70 155.5 L 70 255.5 L -80 255.5 Z"/>')
    s.append(label(-5, 215, 'mesa de madera', 6, 'lbg'))
    s.append(label(-5, 223, '(no incluida)', 5.5, 'lbg'))
    # bloque de la península: laterales de chapa
    s.append(rect(0, 0, 70, 155.5, 'steel'))
    s.append(rect(4, 0, 66, 151.5, 'paper'))
    s.append(rect(4, 0, 64, 61.5, 'dead'))
    s.append(label(36, 28, 'rincón', 6, 'lbg')); s.append(label(36, 36, 'sin uso', 6, 'lbg'))
    s.append(rect(4, 61.5, 64, 90, 'box'))
    s.append(rect(68, 61.5, 2, 90, 'front'))
    s.append(label(36, 104, 'horno', 6.5)); s.append(label(36, 112, '(en obra)', 6.5))  # Maxi 26/11
    s.append('<path class="arrow" d="M 74 106.5 L 86 106.5 M 82 103 L 86 106.5 L 82 110"/>')
    # mesada
    x = 74.0
    s.append(rect(70, 60, 4, 2, 'front'))
    for i, W in enumerate(MODS):
        s.append(rect(x, 0, W, 60, 'box')); s.append(rect(x, 60, W, 2, 'front'))
        s.append(label(x + W/2, 34, f'{i+1}', 9, 'num'))
        x += W
    s.append('<rect class="sink" x="120" y="6" width="80" height="50" rx="4"/>')
    s.append(label(160, 50, 'bacha', 5.5, 'lbg'))
    s.append('<path class="arrow" d="M 280 66 L 280 78 M 276.5 74 L 280 78 L 283.5 74"/>')
    # heladera
    s.append(rect(478.5, 0, 65, 65, 'ghost')); s.append(label(511, 36, 'heladera', 6, 'lbg'))
    # cotas
    xs = [74.0]
    for W in MODS: xs.append(xs[-1] + W)
    for a, b in zip(xs, xs[1:]): s.append(dim_h(a, b, 92, c(b - a), False))
    s.append(dim_h(70, 478.5, 112, f'{c(408.5)} (cajoneras + suplemento de 4)', False))
    s.append(dim_h(70, 74, 82, '4', False, 5))
    s.append(dim_v(560, 0, 62, '62', False))
    s.append(dim_v(-92, 0, 155.5, '160', True))
    s.append(dim_v(-60, 61.5, 151.5, '90', True))
    s.append(dim_h(0, 70, 268, '70', False))
    return f'<svg viewBox="-125 -20 720 300" role="img" aria-label="Planta de la cocina con medidas">{"".join(s)}</svg>'

def alzado_mesada():
    # vista de frente, desde la cocina: el rincón a la izquierda. y hacia abajo desde la tapa (0 = piso → y = 100 − h)
    Y = lambda h: 100 - h
    s = []
    s.append(rect(66, Y(100), 420, 10, 'steelL'))  # zócalo plegado contra la pared
    s.append(rect(66, Y(90), 416, 3, 'steel'))     # tapa
    s.append(label(270, Y(92.5) + 1.8, 'mesada de acero (no incluida)', 5, 'lbw'))
    s.append(rect(78, Y(10), 400, 10, 'zoc'))
    s.append(rect(70, Y(87), 4, 77, 'frontF'))
    x = 74.0
    for i, W in enumerate(MODS):
        if i == 0:
            s.append(rect(x + .2, Y(87) + .2, W - .4, 77 - .4, 'frontF'))
            s.append(f'<line class="unero" x1="{x+W/2-8}" y1="{Y(85.6)}" x2="{x+W/2+8}" y2="{Y(85.6)}"/>')
            s.append(label(x + W/2, Y(28), '1', 9, 'num')); s.append(label(x + W/2, Y(60), 'tacho', 5, 'lbg')); s.append(label(x + W/2, Y(53), 'extraíble', 4.5, 'lbg'))
            x += W; continue
        if i == 1:
            rows = [(10, 46.19), (46.19, 65.6)]
            s.append('<rect class="sinkF" x="{}" y="{}" width="80" height="24"/>'.format(x, Y(90)))
            s.append(label(x + 40, Y(78) + 2, 'frente de la bacha', 5, 'lbg'))
        else:
            rows = [(10, 46.19), (46.19, 71.6), (71.6, 87)]
        for a, b in rows:
            s.append(rect(x + .2, Y(b) + .2, W - .4, b - a - .4, 'frontF'))
            s.append(f'<line class="unero" x1="{x+W/2-8}" y1="{Y(b)+1.6}" x2="{x+W/2+8}" y2="{Y(b)+1.6}"/>')
        s.append(label(x + W/2, Y(28), f'{i+1}', 9, 'num'))
        x += W
    # cotas
    xs = [74.0]
    for W in MODS: xs.append(xs[-1] + W)
    for a, b in zip(xs, xs[1:]): s.append(dim_h(a, b, Y(-8), c(b - a), False))
    s.append(dim_v(490, Y(10), Y(0), '10', False)); s.append(dim_v(490, Y(46.19), Y(10), '36,2', False))
    s.append(dim_v(490, Y(71.6), Y(46.19), '25,4', False)); s.append(dim_v(490, Y(87), Y(71.6), '15,4', False))
    s.append(dim_v(520, Y(87), Y(0), '87', False)); s.append(dim_v(540, Y(90), Y(0), '90', False))
    s.append(dim_v(124, Y(65.6), Y(46.19), '19,4', False, 6))
    return f'<svg viewBox="35 -6 535 130" role="img" aria-label="Vista de frente de la mesada">{"".join(s)}</svg>'

def alzado_peninsula():
    # Maxi 26/11: bajo el anafe va el horno empotrable de 0,60; el mueble que lo rodea se hace en obra (no entra en el despiece)
    FS[0]=.62
    Y = lambda h: 100 - h
    s = []
    s.append(rect(0, Y(90), 4, 90, 'steel')); s.append(rect(94, Y(90), 4, 90, 'steel'))
    s.append(rect(0, Y(90), 98, 4, 'steel'))
    s.append(label(49, Y(87.5) + 1, 'chapa (no incluida)', 4.6, 'lbw'))
    s.append('<path class="ghost" d="M 4 100 L 94 100 L 94 14 L 4 14 Z"/>')
    s.append(f'<rect x="15" y="{Y(72)}" width="60" height="60" fill="#1d1d1f" stroke="#000" stroke-width=".4"/>')
    s.append(f'<rect x="19" y="{Y(66)}" width="52" height="38" fill="#3a3a3c"/>')
    s.append(f'<line x1="23" y1="{Y(69)}" x2="67" y2="{Y(69)}" stroke="#bbb" stroke-width="1.2"/>')
    s.append(f'<text x="45" y="{Y(44)}" font-size="{6*.62}" fill="#fff" text-anchor="middle">horno 60</text>')
    s.append(label(49, Y(79) + 2, 'en obra (anafe y gas detrás)', 4.8, 'lbg'))
    s.append(label(9.5, Y(40), 'obra', 4, 'lbg')); s.append(label(84.5, Y(40), 'obra', 4, 'lbg'))
    s.append(dim_h(4, 15, Y(-8), '11', False)); s.append(dim_h(15, 75, Y(-8), '60', False)); s.append(dim_h(75, 94, Y(-8), '19', False))
    s.append(dim_v(104, Y(12), Y(0), '12', False)); s.append(dim_v(104, Y(72), Y(12), '60', False))
    s.append(dim_v(104, Y(86), Y(72), '14', False))
    s.append(dim_v(128, Y(90), Y(0), '90', False))
    FS[0]=1.0
    return f'<svg viewBox="-10 -6 160 130" role="img" aria-label="Vista de frente de la península: horno bajo el anafe">{"".join(s)}</svg>'

def corte():
    FS[0]=.7
    # corte por un módulo de la mesada: la pared a la izquierda, el frente a la derecha
    Y = lambda h: 100 - h
    s = []
    s.append(rect(-10, Y(100), 10, 100, 'wall'))
    s.append(rect(0, Y(100), .8, 10, 'steelL'))
    s.append(rect(0, Y(90), 63, 3, 'steel'))
    s.append(rect(0, Y(87), 60, 77, 'box'))
    s.append(rect(60, Y(87), 2, 77, 'frontF'))
    s.append(rect(0, Y(10), 54, 10, 'paper')); s.append(rect(52.2, Y(10), 1.8, 10, 'zoc'))
    for xx in (8, 46): s.append(rect(xx - 1.5, Y(10), 3, 10, 'leg'))
    # caja de cajón de abajo
    s.append(rect(13.5, Y(36), 45, 24, 'drawer'))
    s.append(label(36, Y(24), 'caja 45', 5.5, 'lbg'))
    s.append(dim_h(0, 60, Y(-6), '60', False)); s.append(dim_h(60, 62, Y(-14), '2', False, 5))
    s.append(dim_v(-16, Y(10), Y(0), '10', True)); s.append(dim_v(-16, Y(87), Y(10), '77', True))
    s.append(dim_h(54, 62, Y(4) + 1, '8', True, 5))
    s.append(label(74, Y(88.5), 'tapa', 5, 'lbg', 'start'))
    s.append(label(66, Y(50), 'frente 20 mm', 5, 'lbg', 'start'))
    s.append(label(66, Y(-3), 'zócalo rehundido', 5, 'lbg', 'start'))
    FS[0]=1.0
    return f'<svg viewBox="-40 -6 170 130" role="img" aria-label="Corte por la mesada">{"".join(s)}</svg>'

# ---------- tablas ----------
def tabla(grupo):
    rows = [p for p in D['piezas'] if p['g'] == grupo]
    tr = ''.join(f'<tr><td>{E(p["pieza"])}</td><td class="n">{p["cant"]}</td><td class="n">{p["L"]}</td><td class="n">{p["A"]}</td><td class="n">{p["esp"]}</td><td>{E(p["mat"])}</td><td>{E(p["canto"])}</td><td class="nota">{E(p["nota"])}</td></tr>' for p in rows)
    tot = sum(p['cant'] for p in rows)
    return (f'<div class="tw"><table data-g="{E(grupo)}"><thead><tr><th>Pieza</th><th class="n">Cant.</th><th class="n">Largo</th><th class="n">Ancho</th><th class="n">Esp.</th><th>Material</th><th>Tapacanto</th><th>Nota</th></tr></thead>'
            f'<tbody>{tr}</tbody><tfoot><tr><td>Total</td><td class="n">{tot}</td><td colspan="6"></td></tr></tfoot></table></div>')

grupos = [('Frentes', 'Madera maciza de 20 mm que pone Maxi: tablas cepilladas y encoladas de canto hasta el ancho de cada frente. Juntas de 2 mm entre frentes. Uñero fresado en el canto de arriba, sin tiradores.'),
          ('Cajoneras', 'Cajas del mueble en melamina blanca de 18 mm, una por columna, sobre patas regulables. Fondo de fibroplus de 3 mm.'),
          ('Cajas de cajón', 'Laterales, frente y contrafrente de melamina blanca de 15 mm; piso de fibroplus de 3 mm. El ancho ya descuenta 13 mm por lado para las guías.'),
          ('Zócalo', 'Melamina negra de 18 mm, 10 cm de alto, rehundido 8 cm del frente.')]
desp = ''.join(f'<section class="grp"><h3>{E(g)}</h3><p class="mut">{E(t)}</p>{tabla(g)}<button class="copy" data-copy="{E(g)}" type="button">Copiar tabla</button></section>' for g, t in grupos)
herr = ''.join(f'<tr><td>{E(a)}</td><td class="n">{b}</td><td>{E(u)}</td><td class="nota">{E(n)}</td></tr>' for a, b, u, n in D['herr'])
tots = ''.join(f'<tr><td>{E(m)}</td><td class="n">{e}</td><td class="n">{str(a).replace(".", ",")}</td><td>{E(t)}</td></tr>' for m, e, a, t in D['tot'])
R = D['resumen']
csv_rows = [['Grupo', 'Pieza', 'Cant', 'Largo mm', 'Ancho mm', 'Esp mm', 'Material', 'Tapacanto', 'Nota']] + [[p['g'], p['pieza'], p['cant'], p['L'], p['A'], p['esp'], p['mat'], p['canto'], p['nota']] for p in D['piezas']]

page = open(os.environ.get('DESP', '/tmp/desp') + '/plantilla.html').read()
for k, v in {'{{PLANTA}}': planta(), '{{ALZ_M}}': alzado_mesada(), '{{ALZ_P}}': alzado_peninsula(), '{{CORTE}}': corte(),
             '{{DESP}}': desp, '{{HERR}}': herr, '{{TOTS}}': tots, '{{NCAJ}}': str(R['n_caj_total']), '{{NCAJM}}': str(R['n_caj_m']),
             '{{CSV}}': json.dumps(csv_rows, ensure_ascii=False).replace('</', '<\\/')}.items():
    page = page.replace(k, v)
open(os.environ.get('DESP', '/tmp/desp') + '/cocina-carhue-muebles.html', 'w').write(page)
print('ok', len(page))
