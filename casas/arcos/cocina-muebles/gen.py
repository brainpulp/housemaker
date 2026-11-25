#!/usr/bin/env python3
# Cocina de Arcos: diagrama para el carpintero + despiece (Maxi 20/11/2026), con el mismo formato que la de Carhué
# (casas/carhue/cocina-muebles). Medidas del escenario A de la cocina (casas/arcos/equipamiento-arcos.js, versión 0.10.45):
# mesada de 3,92 = 4 columnas de 93,75 + bandejero de 17, columna del horno de 60, alacena sobre la heladera, alacenas altas
# de 2,11 (con bandejero de 30) y 1,81, estante, y el bloque de la isla de 1,60 × 0,70 con 2 columnas de 76.
# Materiales: los de la tabla de Compras de Obras (arcos-01…29).
# Maxi 25/11: columna del horno de 60 (versión 0.10.56), módulo de basura en la columna 2 (cajón finito + extraíble con 3 tachos),
# cajas del mueble en melamina blanca (adentro claro; cerrado sólo se ven los frentes) y los costados que quedan a la vista con
# terminación del frente: petiribí en la punta de la mesada, melamina negra texturada en la punta de las alacenas.
# Maxi 25/11 (más tarde): la torre del horno va toda en melamina negra texturada (frentes y lateral a la vista), no en petiribí.
# Uso: python3 gen.py <salida.json>   → secciones HTML y CSV para armar.py
import json, math, html, sys
E = html.escape
c = lambda x: (f'{x:.2f}'.rstrip('0').rstrip('.')).replace('.', ',')

# ---------- medidas del modelo (cm) ----------
H_CAJ, ZOC, D_CAJ = 77.0, 10.0, 60.0           # mesada: caja de 10 a 87, fondo 60 + frente 2
MODS = [93.75] * 4                              # columnas de la mesada, del lado de la columna del horno hacia el ventanal
BAND = 17.0                                     # bandejero bajo mesada, en la punta del ventanal
PUERTA_IDX = 2                                  # la 3.ª columna va bajo la bacha: dos puertas con estante
TACHO_IDX = 1                                   # la 2.ª, pegada a la bacha del lado de la heladera: cajón finito arriba y extraíble de basura abajo (Maxi 25/11)
ROWS = [36.19, 25.41, 15.40]                    # 47 / 33 / 20 % de 77
COL_W, COL_D, COL_H = 60.0, 62.0, 228.0         # columna del horno (caja de 10 a 228)
ALH_W, ALH_D, ALH_H, ALH_Z = 75.0, 62.0, 38.0, 190.0   # alacena sobre la heladera
AL_D, AL_H, AL_Z = 35.0, 78.0, 150.0            # alacenas altas
AL_PUERTAS = [90.5] * 4; AL_BAND = 30.0
I_W, I_H, I_D = 76.0, 76.0, 64.0                # isla: columnas de cajones (de 10 a 86), fondo de la caja
I_ROWS = [35.72, 25.08, 15.20]
J = 0.4

def mm(x): return int(round(x * 10))
piezas = []
def add(g, pieza, cant, L, A, esp, mat, canto='', nota=''):
    piezas.append(dict(g=g, pieza=pieza, cant=cant, L=L, A=A, esp=esp, mat=mat, canto=canto, nota=nota))
PET = 'Petiribí macizo'; NEGT = 'Melamina negra texturada 18'; NEG = 'Melamina negra 18'; MEL15 = 'Melamina blanca 18'; FIB = 'Fibroplus 3'
col = lambda i: f'columna {i+1}'

# ---------- frentes ----------
for i, W in enumerate(MODS):
    w = mm(W - J)
    if i == PUERTA_IDX:
        add('Frentes', f'Puerta, {col(i)} (bacha)', 2, mm(H_CAJ - J), mm(W / 2 - J), 20, PET, '', 'veta vertical; 2 bisagras cazoleta cada una, hacia afuera')
        continue
    if i == TACHO_IDX:
        add('Frentes', f'Cajón arriba, {col(i)} (basura)', 1, w, mm(ROWS[2] - J), 20, PET, '', '')
        add('Frentes', f'Extraíble de basura, {col(i)}', 1, w, mm(ROWS[0] + ROWS[1] - J), 20, PET, '', 'saca 3 tachos sueltos')
        continue
    for r, n in zip(ROWS, ['abajo', 'medio', 'arriba']):
        add('Frentes', f'Cajón {n}, {col(i)}', 1, w, mm(r - J), 20, PET, '', '')
add('Frentes', 'Bandejero bajo mesada (17)', 1, mm(H_CAJ - J), mm(BAND - J), 18, NEG, '4 cantos', 'sale entero con las bandejas')
add('Frentes', 'Columna del horno: cajón abajo', 1, mm(COL_W - J), mm(41 - J), 18, NEGT, '4 cantos', '')
add('Frentes', 'Columna del horno: cajón arriba', 1, mm(COL_W - J), mm(28 - J), 18, NEGT, '4 cantos', '')
add('Frentes', 'Columna del horno: puerta arriba', 1, mm(COL_H - 142 - J), mm(COL_W - J), 18, NEGT, '4 cantos', '2 bisagras cazoleta')
add('Frentes', 'Alacena sobre la heladera: puerta', 1, mm(ALH_W - J), mm(ALH_H - J), 20, PET, '', '2 bisagras cazoleta')
for k, W in enumerate(AL_PUERTAS):
    add('Frentes', f'Alacena alta: puerta {k+1}', 1, mm(W - J), mm(AL_H - J), 18, NEGT, '4 cantos', 'se abre hacia arriba con brazo')
add('Frentes', 'Alacena alta: bandejero (30)', 1, mm(AL_H - J), mm(AL_BAND - J), 18, NEGT, '4 cantos', 'sale entero con las bandejas')
for k in range(2):
    for r, n in zip(I_ROWS, ['abajo', 'medio', 'arriba']):
        add('Frentes', f'Isla: cajón {n}, columna {k+1}', 1, mm(I_W - J), mm(r - J), 20, PET, '', '')
add('Frentes', 'Estante de pared (3,92)', 1, 3920, 150, 20, PET, '', 'a 1,30 del piso, bajo las alacenas')

# ---------- cajoneras (cajas del mueble) ----------
CANTO = ' (color a definir: blanco o negro)'
def cajonera(t, W, H, D, estante=False, techo=False, nota='', vista=None):
    # vista = (material, espesor, dónde): un lateral queda a la vista y va con la terminación del frente (Maxi 25/11)
    nb = 2 - (1 if vista else 0)
    add('Cajoneras', f'{t}: lateral', nb, mm(H), mm(D - .3), 18, MEL15, '1 largo (adelante)', nota)
    if vista:
        m, e, donde = vista
        add('Cajoneras', f'{t}: lateral a la vista ({donde})', 1, mm(H), mm(D - .3), e, m, '' if m == PET else '1 largo (adelante)', 'terminación como los frentes')
    add('Cajoneras', f'{t}: piso', 1, mm(W - 3.6), mm(D - .3), 18, MEL15, '1 largo')
    if techo: add('Cajoneras', f'{t}: techo', 1, mm(W - 3.6), mm(D - .3), 18, MEL15, '1 largo')
    else: add('Cajoneras', f'{t}: travesaño arriba', 2, mm(W - 3.6), 100, 18, MEL15, '1 largo')
    add('Cajoneras', f'{t}: fondo', 1, mm(W - .4), mm(H - .4), 3, FIB, '', 'clavado y encolado atrás')
    if estante: add('Cajoneras', f'{t}: estante', 1, mm(W - 3.8), mm(D - .3 - 2.5), 18, MEL15, '1 largo', 'regulable, sobre 4 soportes')
for i, W in enumerate(MODS):
    cajonera(f'Mesada, {col(i)}', W, H_CAJ, D_CAJ, estante=(i == PUERTA_IDX), nota='recorte atrás para el desagüe' if i == PUERTA_IDX else '')
cajonera('Mesada, bandejero (17)', BAND, H_CAJ, D_CAJ, vista=(PET, 20, 'punta del ventanal'))
cajonera('Columna del horno (60)', COL_W, COL_H - 10, COL_D - 2, techo=True, nota='alto 2,18 sobre zócalo de 10', vista=(NEGT, 18, 'lado de la mesada'))
add('Cajoneras', 'Columna del horno: estantes que enmarcan el horno', 2, mm(COL_W - 3.6), mm(COL_D - 2 - .3), 18, MEL15, '1 largo', 'fijos, a 0,79 y 1,40 del piso; hueco libre de 56 × 59')
cajonera('Alacena sobre la heladera (75)', ALH_W, ALH_H, ALH_D - 2, techo=True)
for k, W in enumerate(AL_PUERTAS):
    cajonera(f'Alacena alta {k+1}', W, AL_H, AL_D - 2, estante=True, techo=True)
cajonera('Alacena alta, bandejero (30)', AL_BAND, AL_H, AL_D - 2, techo=True, vista=(NEGT, 18, 'punta del ventanal'))
for k in range(2):
    cajonera(f'Isla, columna {k+1}', I_W, I_H, I_D)

# ---------- cajas de los cajones ----------
def caja(nombre, ancho, fondo, alto, nota='', piso=(3, FIB)):
    add('Cajas de cajón', f'{nombre}: lateral', 2, fondo, alto, 18, MEL15, '1 largo (arriba)', nota)
    add('Cajas de cajón', f'{nombre}: frente y contrafrente', 2, ancho - 36, alto, 18, MEL15, '1 largo (arriba)', nota)
    add('Cajas de cajón', f'{nombre}: piso', 1, ancho, fondo, piso[0], piso[1], '' if piso[1] == FIB else '1 largo', 'clavado y encolado abajo' if piso[1] == FIB else 'entre los laterales, atornillado')
for i, W in enumerate(MODS):
    if i == PUERTA_IDX: continue
    if i == TACHO_IDX:
        caja(f'Caja arriba, {col(i)}', mm(W - 3.6 - 2.6), 450, 90)
        caja(f'Extraíble de basura, {col(i)}', mm(W - 3.6 - 2.6), 450, 180, 'caja baja para los tachos', piso=(18, MEL15))
        continue
    for alto, n in [(240, 'abajo'), (190, 'medio'), (90, 'arriba')]:
        caja(f'Caja {n}, {col(i)}', mm(W - 3.6 - 2.6), 450, alto)
caja('Caja abajo, columna del horno', mm(COL_W - 3.6 - 2.6), 450, 280)
caja('Caja arriba, columna del horno', mm(COL_W - 3.6 - 2.6), 450, 180)
for k in range(2):
    for alto, n in [(240, 'abajo'), (180, 'medio'), (90, 'arriba')]:
        caja(f'Caja {n}, isla columna {k+1}', mm(I_W - 3.6 - 2.6), 500, alto)

# ---------- zócalo ----------
L_MES = sum(MODS) + BAND
add('Zócalo', 'Zócalo de la mesada y la columna', 2, mm((L_MES + COL_W) / 2), 100, 18, NEG, '1 largo', 'rehundido 8 cm; va con clips a las patas')
add('Zócalo', 'Zócalo de la isla', 1, mm(2 * I_W), 100, 18, NEG, '1 largo', 'rehundido 8 cm, entre las chapas del bloque')

# ---------- petiribí: tablas empalmadas ----------
for p in piezas:
    if p['mat'] != PET: continue
    vert = 'veta vertical' in p['nota']
    across = p['A']
    n = max(1, math.ceil(across / 210)); p['tablas'] = n
    p['nota'] = (f'{n} tablas encoladas de canto' if n > 1 else '1 tabla') + ('; ' + p['nota'] if p['nota'] else '')

# ---------- herrajes ----------
n_caj_m = 3 * (len(MODS) - 1) - 1   # el módulo de basura tiene cajón + extraíble
herr = [
    ('Guías telescópicas de extracción total con cierre suave, 450 mm', n_caj_m + 2, 'par', f'{n_caj_m} de la mesada (con el extraíble de basura) y 2 de la columna del horno. En Compras: genéricas; para los cajones de 0,94 cargados conviene Häfele 45 kg (como en Carhué). Las cajas del despiece van con 13 mm por lado'),
    ('Guías telescópicas de extracción total con cierre suave, 500 mm', 6, 'par', 'isla'),
    ('Bisagras cazoleta 35 mm, cierre suave', 8, 'u', 'bacha (4), puerta de la columna (2), alacena de la heladera (2)'),
    ('Brazos para puerta proyectable hacia arriba (Häfele Free Flap o Blum Aventos)', 4, 'juego', 'alacenas altas, puertas de 0,90 × 0,78'),
    ('Herraje de bandejero extraíble 15 cm, bajo mesada', 1, 'u', 'con 2 o 3 bandejas de alambre'),
    ('Tachos de basura sueltos para el extraíble', 3, 'u', 'entran parados en la caja baja de la columna 2'),
    ('Herraje de bandejero extraíble 30 cm, alacena', 1, 'u', 'con bandejas de alambre'),
    ('Soportes de estante', 4 + 4 * len(AL_PUERTAS), 'u', 'bajo la bacha y en las alacenas altas'),
    ('Patas regulables de 10 cm para zócalo', 4 * (len(MODS) + 1 + 1 + 2), 'u', '4 por mueble de piso'),
    ('Clips de zócalo', 12, 'u', ''),
    ('Ménsulas o riel de colgar para alacenas', 1, 'juego', 'a criterio del carpintero'),
]

# ---------- totales ----------
tot = {}
for p in piezas:
    k = (p['mat'], p['esp']); tot[k] = tot.get(k, 0) + p['cant'] * p['L'] * p['A'] / 1e6
PLACA = {NEG: (2.75, 1.83), NEGT: (2.75, 1.83), MEL15: (2.75, 1.83), FIB: (2.60, 1.83)}
tot_rows = []
for (mat, esp), m2 in sorted(tot.items()):
    if mat in PLACA:
        a = PLACA[mat][0] * PLACA[mat][1]; n = math.ceil(m2 / (a * .8))
        tot_rows.append((mat, esp, round(m2, 2), f'{n} placa{"s" if n > 1 else ""} de {PLACA[mat][0]:.2f} × {PLACA[mat][1]:.2f}'.replace('.', ',') + ' (con 20 % de desperdicio)'))
    else:
        ml = sum(p['cant'] * p.get('tablas', 1) * p['L'] for p in piezas if p['mat'] == mat) / 1000 * 1.15
        tot_rows.append((mat, esp, round(m2, 2), f'unos {ml:.0f} m lineales de tabla de 21 cm de ancho cepillada (≈ 25 mm en bruto), con 15 % de despunte'))
n_caj = n_caj_m - 1 + 2 + 6   # cajones, sin contar el extraíble de basura

# ---------- dibujos ----------
FS = [1.0]
def dim_h(x0, x1, y, txt, up=True, size=7):
    size *= FS[0]; t = y - 2.5 if up else y + 7.5
    return (f'<line class="d" x1="{x0}" y1="{y}" x2="{x1}" y2="{y}"/><line class="d" x1="{x0}" y1="{y-3}" x2="{x0}" y2="{y+3}"/><line class="d" x1="{x1}" y1="{y-3}" x2="{x1}" y2="{y+3}"/>'
            f'<text class="dt" x="{(x0+x1)/2}" y="{t}" font-size="{size}" text-anchor="middle">{txt}</text>')
def dim_v(x, y0, y1, txt, left=True, size=7):
    size *= FS[0]; tx = x - 3 if left else x + 3; anc = 'end' if left else 'start'
    return (f'<line class="d" x1="{x}" y1="{y0}" x2="{x}" y2="{y1}"/><line class="d" x1="{x-3}" y1="{y0}" x2="{x+3}" y2="{y0}"/><line class="d" x1="{x-3}" y1="{y1}" x2="{x+3}" y2="{y1}"/>'
            f'<text class="dt" x="{tx}" y="{(y0+y1)/2+2.4}" font-size="{size}" text-anchor="{anc}">{txt}</text>')
def rect(x, y, w, h, cls): return f'<rect class="{cls}" x="{x}" y="{y}" width="{w}" height="{h}"/>'
def label(x, y, t, size=7, cls='lb', anc='middle'): size *= FS[0]; return f'<text class="{cls}" x="{x}" y="{y}" font-size="{size}" text-anchor="{anc}">{t}</text>'

# u: cm desde el borde de la heladera del lado del depósito (este) hacia el ventanal; mirando a la medianera sur
U_COL = 75.5; U_MES = U_COL + COL_W   # la columna a 0,5 de la heladera; la mesada pegada a la columna
XS = [U_MES]
for W in MODS: XS.append(XS[-1] + W)
U_BAND1 = XS[-1] + BAND   # 527,5
U_BACHA = U_BAND1 - 158   # eje de la bacha a 1,58 de la punta del ventanal

def planta():
    s = []
    s.append(rect(-20, -12, 580, 12, 'wall')); s.append(label(270, -4, 'MEDIANERA SUR', 6, 'lbw'))
    s.append(rect(0, 0, 75, 70, 'ghost')); s.append(label(37.5, 38, 'heladera', 6, 'lbg'))
    s.append(rect(U_COL, 0, COL_W, 60, 'box')); s.append(rect(U_COL, 60, COL_W, 2, 'front')); s.append(label(U_COL + COL_W / 2, 34, 'horno', 6, 'lbg'))
    for i, W in enumerate(MODS):
        s.append(rect(XS[i], 0, W, 60, 'box')); s.append(rect(XS[i], 60, W, 2, 'front')); s.append(label(XS[i] + W / 2, 34, f'{i+1}', 9, 'num'))
    s.append(rect(XS[-1], 0, BAND, 60, 'box')); s.append(rect(XS[-1], 60, BAND, 2, 'frontN')); s.append(label(XS[-1] + BAND / 2, 34, 'B', 7, 'num'))
    s.append('<rect class="sink" x="{}" y="8" width="70" height="44" rx="4"/>'.format(U_BACHA - 35)); s.append(label(U_BACHA, 48, 'bacha', 5.5, 'lbg'))
    s.append('<path class="arrow" d="M 180 66 L 180 78 M 176.5 74 L 180 78 L 183.5 74"/>')
    # isla: bloque de 160 × 70 (chapa en los costados y atrás), mesa de madera en L
    v0 = 167.0
    s.append('<path class="ghost" d="M 234.5 {a} L 374.5 {a} L 374.5 {b} L 74.5 {b} L 74.5 {c} L 234.5 {c} Z"/>'.format(a=v0, b=v0 + 120, c=v0 + 70))
    s.append(label(300, v0 + 100, 'mesa de madera (no incluida)', 6, 'lbg'))
    s.append(rect(74.5, v0, 160, 70, 'steel')); s.append(rect(78.5, v0, 152, 66, 'paper'))
    s.append(rect(78.5, v0 + 2, 76, 64, 'box')); s.append(rect(154.5, v0 + 2, 76, 64, 'box'))
    s.append(rect(78.5, v0, 152, 2, 'front'))
    s.append(label(116.5, v0 + 38, 'I1', 8, 'num')); s.append(label(192.5, v0 + 38, 'I2', 8, 'num'))
    s.append('<path class="arrow" d="M 154.5 {0} L 154.5 {1} M 151 {2} L 154.5 {1} L 158 {2}"/>'.format(v0 - 2, v0 - 14, v0 - 10))
    s.append(label(154.5, v0 - 18, 'cajones hacia la mesada', 5.5, 'lbg'))
    # cotas
    s.append(dim_h(0, 75, 92, '75', False)); s.append(dim_h(U_COL, U_MES, 92, c(COL_W), False))
    for a, b in zip(XS, XS[1:]): s.append(dim_h(a, b, 92, c(b - a), False))
    s.append(dim_h(XS[-1], U_BAND1, 82, '17', False, 5))
    s.append(dim_h(U_MES, U_BAND1, 112, '392 (mesada)', False))
    s.append(dim_v(545, 0, 62, '62', False))
    s.append(dim_v(545, 62, v0, '105 pasillo', False))
    s.append(dim_v(545, v0, v0 + 70, '70', False))
    s.append(dim_h(74.5, 234.5, v0 + 140, '160 (bloque)', False))
    s.append(dim_h(78.5, 154.5, v0 + 128, '76', False, 5)); s.append(dim_h(154.5, 230.5, v0 + 128, '76', False, 5))
    return f'<svg viewBox="-35 -20 640 335" role="img" aria-label="Planta de la cocina de Arcos con medidas">{"".join(s)}</svg>'

def alzado():
    Y = lambda h: 240 - h
    s = []
    s.append(rect(0, Y(190), 75, 190, 'ghost')); s.append(label(37.5, Y(100), 'heladera', 6, 'lbg'))
    # alacena sobre la heladera
    s.append(rect(0.2, Y(228) + .2, 75 - .4, 38 - .4, 'frontF'))
    # columna del horno
    x = U_COL
    for a, b in [(10, 51), (51, 79)]:
        s.append(rect(x + .2, Y(b) + .2, COL_W - .4, b - a - .4, 'frontN')); s.append(f'<line class="unero" x1="{x+COL_W/2-8}" y1="{Y(b)+2}" x2="{x+COL_W/2+8}" y2="{Y(b)+2}"/>')
    s.append(rect(x + 3, Y(139.5), COL_W - 6, 58.5, 'oven')); s.append(label(x + COL_W / 2, Y(108), 'horno 60', 5.5, 'lbw'))
    s.append(rect(x + .2, Y(228) + .2, COL_W - .4, 86 - .4, 'frontN')); s.append(label(x + COL_W / 2, Y(190), 'C', 8, 'numw'))
    s.append(rect(x, Y(10), COL_W, 10, 'zoc'))
    # inox y estante
    s.append(rect(U_MES, Y(150), 392, 60, 'inox')); s.append(label(U_MES + 196, Y(142), 'revestimiento de inox (no incluido)', 5, 'lbg'))
    s.append(rect(U_MES, Y(132), 392, 2, 'front')); s.append(label(U_MES + 392 - 2, Y(133.5), 'estante 15 de fondo', 5, 'lbg', 'end'))
    # alacenas altas
    xa = U_MES
    for k, W in enumerate(AL_PUERTAS):
        s.append(rect(xa + .2, Y(228) + .2, W - .4, 78 - .4, 'frontN')); s.append(label(xa + W / 2, Y(185), f'A{k+1}', 8, 'numw')); xa += W
    s.append(rect(xa + .2, Y(228) + .2, AL_BAND - .4, 78 - .4, 'frontN')); s.append(label(xa + AL_BAND / 2, Y(185), 'B', 7, 'numw'))
    # mesada
    s.append(rect(U_MES, Y(90), 392, 3, 'stone')); s.append(label(U_MES + 196, Y(91.5) + 1.8, 'granito (no incluido)', 4.5, 'lbw'))
    s.append(rect(U_MES + 4, Y(10), 392 - 4, 10, 'zoc'))
    for i, W in enumerate(MODS):
        x = XS[i]
        if i == PUERTA_IDX:
            for a in (x, x + W / 2):
                s.append(rect(a + .2, Y(87) + .2, W / 2 - .4, 77 - .4, 'frontF'))
            s.append(f'<line class="unero" x1="{x+W/2-2}" y1="{Y(70)}" x2="{x+W/2-2}" y2="{Y(80)}"/><line class="unero" x1="{x+W/2+2}" y1="{Y(70)}" x2="{x+W/2+2}" y2="{Y(80)}"/>')
            s.append(f'<line class="ghost" x1="{x+1}" y1="{Y(48.5)}" x2="{x+W-1}" y2="{Y(48.5)}"/>')
            s.append('<rect class="sinkF" x="{}" y="{}" width="70" height="18"/>'.format(x + W / 2 - 35, Y(87)))
        elif i == TACHO_IDX:
            for a, b in [(10, 10 + ROWS[0] + ROWS[1]), (10 + ROWS[0] + ROWS[1], 87)]:
                s.append(rect(x + .2, Y(b) + .2, W - .4, b - a - .4, 'frontF')); s.append(f'<line class="unero" x1="{x+W/2-8}" y1="{Y(b)+2}" x2="{x+W/2+8}" y2="{Y(b)+2}"/>')
            s.append(label(x + W / 2, Y(45), 'basura', 5.5, 'lbg'))
        else:
            acc = 10
            for r in ROWS:
                s.append(rect(x + .2, Y(acc + r) + .2, W - .4, r - .4, 'frontF')); s.append(f'<line class="unero" x1="{x+W/2-8}" y1="{Y(acc+r)+2}" x2="{x+W/2+8}" y2="{Y(acc+r)+2}"/>'); acc += r
        s.append(label(x + W / 2, Y(30), f'{i+1}', 9, 'num'))
    s.append(rect(XS[-1] + .2, Y(87) + .2, BAND - .4, 77 - .4, 'frontN'))
    # cotas
    for a, b in zip(XS, XS[1:]): s.append(dim_h(a, b, Y(-8), c(b - a), False))
    s.append(dim_h(XS[-1], U_BAND1, Y(-18), '17', False, 5)); s.append(dim_h(0, 75, Y(-8), '75', False)); s.append(dim_h(U_COL, U_MES, Y(-8), c(COL_W), False))
    xa = U_MES; ax = [xa]
    for W in AL_PUERTAS + [AL_BAND]: ax.append(ax[-1] + W)
    for a, b in zip(ax, ax[1:]): s.append(dim_h(a, b, Y(236), c(b - a), True))
    X = U_BAND1 + 8
    s.append(dim_v(X, Y(10), Y(0), '10', False)); s.append(dim_v(X, Y(46.19), Y(10), '36,2', False)); s.append(dim_v(X, Y(71.6), Y(46.19), '25,4', False)); s.append(dim_v(X, Y(87), Y(71.6), '15,4', False))
    s.append(dim_v(X + 30, Y(90), Y(0), '90', False)); s.append(dim_v(X + 30, Y(130), Y(90), '40', False)); s.append(dim_v(X + 30, Y(150), Y(130), '20', False)); s.append(dim_v(X + 30, Y(228), Y(150), '78', False))
    s.append(dim_v(X + 58, Y(228), Y(0), '228', False))
    s.append(dim_v(-6, Y(228), Y(190), '38', True)); s.append(dim_v(-6, Y(51), Y(10), '41', True)); s.append(dim_v(-6, Y(79), Y(51), '28', True)); s.append(dim_v(-6, Y(228), Y(142), '86', True))
    return f'<svg viewBox="-40 -6 680 270" role="img" aria-label="Vista de frente de la pared de la cocina de Arcos">{"".join(s)}</svg>'

def alzado_isla():
    FS[0] = .62; Y = lambda h: 100 - h; s = []
    s.append(rect(0, Y(90), 4, 90, 'steel')); s.append(rect(156, Y(90), 4, 90, 'steel')); s.append(rect(0, Y(90), 160, 4, 'stone'))
    s.append(label(80, Y(87.5) + 1, 'granito con anafe (no incluido)', 4.6, 'lbw'))
    s.append(rect(4, Y(10), 152, 10, 'zoc'))
    for k in range(2):
        x = 4 + 76 * k; acc = 10
        for r in I_ROWS:
            s.append(rect(x + .2, Y(acc + r) + .2, 75.6, r - .4, 'frontF')); s.append(f'<line class="unero" x1="{x+30}" y1="{Y(acc+r)+2}" x2="{x+46}" y2="{Y(acc+r)+2}"/>'); acc += r
        s.append(label(x + 38, Y(28), f'I{k+1}', 8, 'num'))
    s.append(dim_h(4, 80, Y(-8), '76', False)); s.append(dim_h(80, 156, Y(-8), '76', False)); s.append(dim_h(0, 160, Y(-20), '160', False))
    s.append(dim_v(166, Y(10), Y(0), '10', False)); s.append(dim_v(166, Y(45.72), Y(10), '35,7', False)); s.append(dim_v(166, Y(70.8), Y(45.72), '25,1', False)); s.append(dim_v(166, Y(86), Y(70.8), '15,2', False))
    s.append(dim_v(190, Y(90), Y(0), '90', False))
    FS[0] = 1.0
    return f'<svg viewBox="-10 -6 230 140" role="img" aria-label="Vista de frente del bloque de la isla">{"".join(s)}</svg>'

def corte():
    FS[0] = .7; Y = lambda h: 240 - h; s = []
    s.append(rect(-10, Y(240), 10, 240, 'wall'))
    s.append(rect(0, Y(150), .8, 60, 'inox'))
    s.append(rect(0, Y(90), 63, 3, 'stone'))
    s.append(rect(0, Y(87), 60, 77, 'box')); s.append(rect(60, Y(87), 2, 77, 'frontF'))
    s.append(rect(0, Y(10), 54, 10, 'paper')); s.append(rect(52.2, Y(10), 1.8, 10, 'zoc'))
    for xx in (8, 46): s.append(rect(xx - 1.5, Y(10), 3, 10, 'leg'))
    s.append(rect(13.5, Y(36), 45, 24, 'drawer'))
    s.append(rect(0, Y(132), 15, 2, 'front'))
    s.append(rect(0, Y(228), 33, 78, 'box')); s.append(rect(33, Y(228), 2, 78, 'frontN'))
    s.append(dim_h(0, 60, Y(-6), '60', False)); s.append(dim_h(0, 35, Y(232), '35', True)); s.append(dim_h(0, 15, Y(120), '15', False, 5))
    s.append(dim_v(-16, Y(10), Y(0), '10', True)); s.append(dim_v(-16, Y(87), Y(10), '77', True)); s.append(dim_v(-16, Y(228), Y(150), '78', True)); s.append(dim_v(-30, Y(150), Y(0), '150', True))
    s.append(label(68, Y(88.5), 'granito', 5, 'lbg', 'start')); s.append(label(66, Y(50), 'frente 20 mm', 5, 'lbg', 'start'))
    s.append(label(40, Y(190), 'alacena, puerta proyectable', 5, 'lbg', 'start')); s.append(label(20, Y(128), 'estante', 5, 'lbg', 'start'))
    s.append(label(4, Y(120), 'inox', 5, 'lbg', 'start'))
    FS[0] = 1.0
    return f'<svg viewBox="-55 -6 200 260" role="img" aria-label="Corte por la mesada y las alacenas">{"".join(s)}</svg>'

def tabla(grupo):
    rows = [p for p in piezas if p['g'] == grupo]
    tr = ''.join(f'<tr><td>{E(p["pieza"])}</td><td class="n">{p["cant"]}</td><td class="n">{p["L"]}</td><td class="n">{p["A"]}</td><td class="n">{p["esp"]}</td><td>{E(p["mat"])}</td><td>{E(p["canto"])}</td><td class="nota">{E(p["nota"])}</td></tr>' for p in rows)
    return (f'<div class="tw"><table data-g="{E(grupo)}"><thead><tr><th>Pieza</th><th class="n">Cant.</th><th class="n">Largo</th><th class="n">Ancho</th><th class="n">Esp.</th><th>Material</th><th>Tapacanto</th><th>Nota</th></tr></thead>'
            f'<tbody>{tr}</tbody><tfoot><tr><td>Total</td><td class="n">{sum(p["cant"] for p in rows)}</td><td colspan="6"></td></tr></tfoot></table></div>')
grupos = [('Frentes', 'Petiribí macizo de 20 mm en cajones, puertas de la bacha y alacena de la heladera; melamina negra texturada en la torre del horno, las alacenas altas y los bandejeros. Juntas de 2 mm.'),
          ('Cajoneras', 'Cajas del mueble en melamina blanca de 18 mm, una por módulo (Maxi 25/11: cerrado sólo se ven los frentes y adentro queda claro); las de piso sobre patas regulables. Fondo de fibroplus de 3 mm. Los costados que quedan a la vista van como los frentes: petiribí en la punta de la mesada, melamina negra texturada en el costado de la columna y en la punta de las alacenas. Color del tapacanto: a definir, blanco o negro.'),
          ('Cajas de cajón', 'Laterales, frente y contrafrente de melamina blanca de 18 mm (Maxi 23/11); piso de fibroplus de 3 mm. El ancho ya descuenta 13 mm por lado para las guías.'),
          ('Zócalo', 'Melamina negra de 18 mm, 10 cm de alto, rehundido 8 cm del frente.')]
desp = ''.join(f'<section class="grp"><h3>{E(g)}</h3><p class="mut">{E(t)}</p>{tabla(g)}<button class="copy" data-copy="ar:{E(g)}" type="button">Copiar tabla</button></section>' for g, t in grupos)
herr_html = ''.join(f'<tr><td>{E(a)}</td><td class="n">{b}</td><td>{E(u)}</td><td class="nota">{E(n)}</td></tr>' for a, b, u, n in herr)
tots = ''.join(f'<tr><td>{E(m)}</td><td class="n">{e}</td><td class="n">{str(a).replace(".", ",")}</td><td>{E(t)}</td></tr>' for m, e, a, t in tot_rows)
csv_rows = [['Grupo', 'Pieza', 'Cant', 'Largo mm', 'Ancho mm', 'Esp mm', 'Material', 'Tapacanto', 'Nota']] + [[p['g'], p['pieza'], p['cant'], p['L'], p['A'], p['esp'], p['mat'], p['canto'], p['nota']] for p in piezas]

carp = f'''
    <section id="v-ar-carpintero" data-view="ar-carpintero" hidden>
      <div class="sheet">
        <h2>Qué hay que hacer</h2>
        <div class="scope">
          <div class="item">
            <b>Mesada contra la medianera</b>
            <div class="big">3,92 m</div>
            <ul>
              <li>4 columnas de 0,94 (93,75) y un bandejero de 0,17 en la punta del ventanal</li>
              <li>Columnas 1 y 4: 3 cajones cada una. Columna 2, la de la basura: cajón finito arriba y abajo un extraíble con 3 tachos sueltos. Columna 3, bajo la bacha: 2 puertas con estante y recorte atrás para el desagüe</li>
              <li>Caja de 0,77 de alto sobre zócalo de 0,10 (0,87 sin la tapa); 0,62 de fondo con el frente</li>
            </ul>
          </div>
          <div class="item">
            <b>Columna del horno y alacena de la heladera</b>
            <div class="big">0,60 + 0,75 m</div>
            <ul>
              <li>Columna de 0,60 × 0,62 × 2,28: 2 cajones abajo (0,41 y 0,28), nicho del horno de 56 × 59 libres y puerta arriba de 0,86</li>
              <li>Alacena de 0,75 × 0,62 × 0,38 sobre la heladera, de 1,90 a 2,28, con una puerta</li>
            </ul>
          </div>
          <div class="item">
            <b>Alacenas altas y estante</b>
            <div class="big">3,92 m</div>
            <ul>
              <li>4 puertas de 0,90 que se abren hacia arriba, más un bandejero vertical de 0,30; 0,35 de fondo, de 1,50 a 2,28</li>
              <li>Estante de petiribí de 3,92 × 0,15 a 1,30</li>
            </ul>
          </div>
          <div class="item">
            <b>Isla (bajo el anafe)</b>
            <div class="big">1,52 m</div>
            <ul>
              <li>2 cajoneras de 0,76, 0,76 de alto y 0,64 de fondo, con 3 cajones cada una, del lado de la mesada</li>
              <li>Van adentro de un bloque de chapa que hace el herrero, con tapa de granito</li>
            </ul>
          </div>
          <div class="item">
            <b>En total</b>
            <div class="big">{n_caj} cajones + 1 extraíble + 5 puertas + 4 alacenas</div>
            <ul>
              <li>Frentes de petiribí macizo de 20 mm (cajones, puertas bajas y alacena de la heladera); torre del horno, alacenas altas y bandejeros en melamina negra texturada</li>
              <li>Cajas del mueble en melamina blanca (cerrado sólo se ven los frentes); los costados que quedan a la vista van como los frentes: petiribí en la punta de la mesada, negro texturado en la columna y en la punta de las alacenas</li>
              <li>Cajones de melamina blanca con guías telescópicas de cierre suave</li>
              <li>Zócalo negro rehundido, sobre patas regulables</li>
            </ul>
          </div>
        </div>
        <p class="excl">No incluye: tapas de granito, revestimiento de inox, chapa del bloque de la isla, bacha, anafe, campana, horno, la mesa de nogal de la isla ni la mesita y los bancos del desayuno.</p>
      </div>
      {{RENDER_AR}}
      <div class="sheet">
        <figure>
          <figcaption><span>Planta · mirando hacia la medianera sur</span><span>cm</span></figcaption>
          <div class="dw">{planta()}</div>
          <div class="legend"><span><i style="background:var(--sheet)"></i>mueble</span><span><i style="background:var(--oak)"></i>frentes</span><span><i style="background:var(--steel)"></i>chapa (herrero)</span><span>→ lado de los cajones</span></div>
        </figure>
      </div>
      <div class="sheet">
        <figure>
          <figcaption><span>Pared de la cocina · vista de frente</span><span>cm</span></figcaption>
          <div class="dw">{alzado()}</div>
          <div class="legend"><span><i style="background:var(--oak-soft)"></i>petiribí</span><span><i style="background:var(--zoc)"></i>melamina negra texturada / zócalo negro</span></div>
        </figure>
        <p class="mut" style="margin-top:10px">1 a 4 son las columnas de la mesada, B los bandejeros, C la columna del horno y A1 a A4 las alacenas altas, como en el despiece. Las alturas son las de cada fila de cajones; el frente es 4 mm más chico por las juntas.</p>
      </div>
      <div class="two">
        <div class="sheet">
          <figure>
            <figcaption><span>Isla · vista de frente, desde la mesada</span><span>cm</span></figcaption>
            <div class="dw sm">{alzado_isla()}</div>
          </figure>
        </div>
        <div class="sheet">
          <figure>
            <figcaption><span>Corte por la mesada y las alacenas</span><span>cm</span></figcaption>
            <div class="dw sm">{corte()}</div>
          </figure>
        </div>
      </div>
      <div class="sheet">
        <h2>A definir antes de cortar</h2>
        <ul>
          <li><b>Tapacanto de la melamina blanca:</b> blanco o negro, a definir.</li>
          <li><b>Piso de las alacenas altas:</b> se ve desde abajo; con la caja blanca queda blanco (el perfil LED va embutido ahí).</li>
          <li><b>Bajo el anafe:</b> el cajón de arriba de la isla queda debajo del anafe de 5 hornallas. En Carhué ahí va un frente fijo de 0,14 y dos cajones; acá habría que hacer lo mismo o confirmar que el anafe deja lugar.</li>
          <li><b>Tiradores:</b> en el modelo son barras negras; en Carhué es uñero fresado.</li>
        </ul>
      </div>
      <div class="sheet">
        <h2>Materiales</h2>
        <dl class="spec">
          <div><dt>Frentes bajos y alacena de la heladera</dt><dd>petiribí macizo 20 mm</dd></div>
          <div><dt>Alacenas altas y bandejeros</dt><dd>melamina negra texturada 18 mm</dd></div>
          <div><dt>Juntas entre frentes</dt><dd>2 mm</dd></div>
          <div><dt>Cajas del mueble</dt><dd>melamina blanca 18 mm; tapacanto blanco o negro, a definir</dd></div>
          <div><dt>Costados a la vista</dt><dd>como los frentes: petiribí 20 mm abajo, melamina negra texturada en la columna y en las alacenas</dd></div>
          <div><dt>Fondos</dt><dd>fibroplus 3 mm</dd></div>
          <div><dt>Cajas de cajón</dt><dd>melamina blanca 18 mm</dd></div>
          <div><dt>Guías mesada y columna</dt><dd>telescópicas 450 mm, cierre suave</dd></div>
          <div><dt>Guías isla</dt><dd>telescópicas 500 mm, cierre suave</dd></div>
          <div><dt>Alacenas altas</dt><dd>brazos para puerta proyectable</dd></div>
          <div><dt>Bisagras</dt><dd>cazoleta 35 mm, cierre suave</dd></div>
          <div><dt>Zócalo</dt><dd>melamina negra 18 mm, 10 cm</dd></div>
        </dl>
      </div>
    </section>'''
despi = f'''
    <section id="v-ar-despiece" data-view="ar-despiece" hidden>
      <div class="sheet">
        <h2>Despiece · Arcos</h2>
        <p>Medidas de corte en milímetros: largo × ancho × espesor. En los frentes de madera, el largo va en el sentido de la veta: horizontal en los cajones y vertical en las puertas. La nota de cada frente de petiribí dice cuántas tablas hay que empalmar, contando tablas de unos 21 cm de ancho ya cepilladas. Tapacanto de 0,45 mm en los cantos que se indican.</p>
        <div class="row"><button type="button" class="copyAll" data-csv="ar">Copiar todo el despiece (para planilla)</button><span class="ok copyMsg" aria-live="polite"></span></div>
        {desp}
        <section class="grp">
          <h3>Herrajes</h3>
          <div class="tw"><table style="min-width:560px"><thead><tr><th>Herraje</th><th class="n">Cant.</th><th>Unidad</th><th>Nota</th></tr></thead><tbody>{herr_html}</tbody></table></div>
        </section>
        <section class="grp">
          <h3>Total por material</h3>
          <div class="tw"><table style="min-width:560px"><thead><tr><th>Material</th><th class="n">Esp. mm</th><th class="n">m² netos</th><th>Para pedir</th></tr></thead><tbody>{tots}</tbody></table></div>
        </section>
      </div>
    </section>'''
json.dump(dict(html=carp + despi, csv=csv_rows, n_caj=n_caj, n_piezas=len(piezas)), open(sys.argv[1], 'w'), ensure_ascii=False)
print('ok', n_caj, len(piezas))
for r in tot_rows: print(r)
