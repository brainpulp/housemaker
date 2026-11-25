#!/usr/bin/env python3
# Cocina de Arcos: lista de corte de placas para pedir presupuesto a un cortero (Sólido), Maxi 25/11/2026.
# Sale del despiece de gen.py: sólo placas (melamina negra, negra texturada, blanca y fibroplus). El petiribí macizo
# no va: lo hace el carpintero (Maxi 25/11). Una fila por medida, con cantos por lado (L1 L2 = lados del largo,
# A1 A2 = lados del ancho) y su color. En la texturada el largo va en el sentido de la veta (vertical en el mueble).
# Las piezas de la alacena sobre la heladera dependen de la heladera (supuesta 0,75 × 1,90 × 0,70) y van marcadas.
# Uso: python3 gen.py /tmp/cm/arcos.json && python3 corte.py /tmp/cm/arcos.json <carpeta de salida>
import json, sys, csv, math, html, os, re
from collections import OrderedDict
E = html.escape
d = json.load(open(sys.argv[1])); out = sys.argv[2]
hdr, rows = d['csv'][0], d['csv'][1:]
ix = {h: i for i, h in enumerate(hdr)}

MATS = OrderedDict([
    ('Melamina negra 18',          dict(cod='N', nombre='Melamina negra lisa 18 mm', canto='Negro', veta='No (se puede rotar)', placa=(2750, 1830))),
    ('Melamina negra texturada 18', dict(cod='T', nombre='Melamina negra texturada 18 mm', canto='Negro', veta='Sí: el largo va en el sentido de la veta', placa=(2750, 1830))),
    ('Melamina blanca 18',         dict(cod='B', nombre='Melamina blanca 18 mm', canto='Blanco', veta='No (se puede rotar)', placa=(2750, 1830))),
    ('Fibroplus 3',                dict(cod='F', nombre='Fibroplus 3 mm', canto='', veta='No (se puede rotar)', placa=(2600, 1830))),
])
# en la texturada, cuál de las dos medidas es la vertical (veta): todas las piezas texturadas tienen el alto como
# primera medida salvo los frentes de la columna del horno y la puerta de la alacena sobre la heladera, que son anchos
VERT_SEGUNDA = ('Columna del horno: cajón abajo', 'Columna del horno: cajón arriba', 'Alacena sobre la heladera: puerta',
                'Alacena alta: puerta')

def lados(canto):
    c = (canto or '').lower()
    if c.startswith('4 cantos'): return ['L1', 'L2', 'A1', 'A2']
    if c.startswith('1 largo'): return ['L1']
    if c.startswith('2 largos'): return ['L1', 'L2']
    if c.strip(): raise SystemExit('canto no reconocido: ' + canto)
    return []

def dep_heladera(nombre): return 'heladera' in nombre.lower()

piezas = []
for r in rows:
    mat = r[ix['Material']]
    if mat not in MATS: continue            # el petiribí macizo va al carpintero
    nombre, cant, L, A, esp, canto, nota = r[ix['Pieza']], int(r[ix['Cant']]), int(r[ix['Largo mm']]), int(r[ix['Ancho mm']]), int(r[ix['Esp mm']]), r[ix['Tapacanto']], r[ix['Nota']]
    ls = lados(canto)
    if mat == 'Melamina negra texturada 18' and nombre.startswith(VERT_SEGUNDA):
        L, A = A, L                          # el largo pasa a ser el alto (veta vertical)
        ls = [{'L1': 'A1', 'L2': 'A2', 'A1': 'L1', 'A2': 'L2'}[x] for x in ls]
    if mat == 'Melamina negra texturada 18':
        pass
    elif L < A and ls in (['L1'],):         # en las lisas, que el largo sea la medida mayor y el canto siga al lado que corresponde
        L, A = A, L; ls = ['A1']
    elif L < A and not ls:
        L, A = A, L
    color = MATS[mat]['nombre']
    if mat == 'Fibroplus 3':                 # fondos de los muebles en negro (cajas negras); pisos de los cajones en blanco (cajas blancas)
        color = 'Fibroplus 3 mm negro' if r[ix['Grupo']] == 'Cajoneras' else 'Fibroplus 3 mm blanco'
    nb = 'lleva 2 bisagras cazoleta' if 'bisagras cazoleta' in nota else ('se abre hacia arriba con brazo' if 'hacia arriba' in nota else '')
    piezas.append(dict(color=color, nb=nb, mat=mat, nombre=nombre, cant=cant, L=L, A=A, esp=esp, lados=tuple(sorted(ls)), nota=nota, dep=dep_heladera(nombre)))

# juntar medidas iguales (mismo material, medida y cantos; las de la heladera aparte)
grup = OrderedDict()
for p in piezas:
    k = (p['mat'], p['L'], p['A'], p['esp'], p['lados'], p['dep'], p['color'], p['nb'])
    g = grup.setdefault(k, dict(p, cant=0, nombres=[]))
    g['cant'] += p['cant']; g['nombres'].append((p['nombre'], p['cant']))

def nums(ns):
    ns = sorted(set(ns))
    if len(ns) > 2 and ns == list(range(ns[0], ns[-1] + 1)): return f'{ns[0]} a {ns[-1]}'
    return ', '.join(map(str, ns[:-1])) + ' y ' + str(ns[-1]) if len(ns) > 1 else str(ns[0])
PLUR = [('columna #', 'columnas #'), ('Alacena alta #', 'Alacenas altas #'), ('puerta #', 'puertas #')]
def desc(nombres):
    grupos = OrderedDict()
    for n, c in nombres:
        m = re.search(r'(?<![(\d])\d+(?![\d)])', n)
        k = (n[:m.start()] + '#' + n[m.end():]) if m else n
        g = grupos.setdefault(k, dict(ns=[], c=c)); 
        if m: g['ns'].append(int(m.group()))
    out = []
    for k, g in grupos.items():
        t = k
        if g['ns']:
            if len(set(g['ns'])) > 1:
                for a, b in PLUR: t = t.replace(a, b)
            t = t.replace('#', nums(g['ns']))
        out.append(t + (f' ({g["c"]} c/u)' if g['c'] > 1 and len(g['ns']) > 1 else ''))
    return '; '.join(out)

filas = []
for mat, m in MATS.items():
    gs = [g for k, g in grup.items() if k[0] == mat]
    gs.sort(key=lambda g: (g['dep'], g['color'], -g['L'], -g['A']))
    for i, g in enumerate(gs, 1):
        filas.append(dict(id=f"{m['cod']}{i}", mat=mat, cant=g['cant'], L=g['L'], A=g['A'], esp=g['esp'],
                          color=g['color'], nb=g['nb'], veta=('Sí' if mat == 'Melamina negra texturada 18' else ''),
                          L1=m['canto'] if 'L1' in g['lados'] else '', L2=m['canto'] if 'L2' in g['lados'] else '',
                          A1=m['canto'] if 'A1' in g['lados'] else '', A2=m['canto'] if 'A2' in g['lados'] else '',
                          desc=desc(g['nombres']), dep=g['dep']))

# totales por placa (material y color: el fibroplus va en negro y en blanco)
tot = OrderedDict()
for mat, m in MATS.items():
    for color in OrderedDict.fromkeys(f['color'] for f in filas if f['mat'] == mat):
        fs = [f for f in filas if f['mat'] == mat and f['color'] == color]
        m2 = sum(f['cant'] * f['L'] * f['A'] for f in fs) / 1e6
        pw, ph = m['placa']; placas = math.ceil(m2 * 1.2 / (pw * ph / 1e6))
        canto_m = sum(f['cant'] * ((f['L'] if f['L1'] else 0) + (f['L'] if f['L2'] else 0) + (f['A'] if f['A1'] else 0) + (f['A'] if f['A2'] else 0)) for f in fs) / 1000
        tot[color] = dict(m2=m2, placas=placas, placa=m['placa'], canto_m=canto_m, canto=m['canto'], n=sum(f['cant'] for f in fs), filas=len(fs))

os.makedirs(out, exist_ok=True)
base = os.path.join(out, 'arcos-cocina-corte-placas')
COLS = ['ID', 'Cant', 'Largo mm', 'Ancho mm', 'Esp mm', 'Material y color', 'Veta', 'Canto L1', 'Canto L2', 'Canto A1', 'Canto A2', 'Pieza', 'Nota', 'Medida provisoria']
def fila(f): return [f['id'], f['cant'], f['L'], f['A'], f['esp'], f['color'], f['veta'], f['L1'], f['L2'], f['A1'], f['A2'], f['desc'], f['nb'],
                     'Sí: depende de la heladera' if f['dep'] else '']
with open(base + '.csv', 'w', newline='', encoding='utf-8-sig') as fh:
    w = csv.writer(fh, delimiter=';'); w.writerow(COLS)
    for f in filas: w.writerow(fila(f))

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
wb = Workbook(); ws = wb.active; ws.title = 'Corte'
ws.append(['Cocina de Arcos: lista de corte de placas'])
ws['A1'].font = Font(bold=True, size=14)
ws.append(['Medidas finales en mm, con el canto incluido. Largo × ancho; en la texturada el largo va en el sentido de la veta (vertical en el mueble). '
           'L1 y L2 son los dos lados del largo; A1 y A2, los dos del ancho. Canto PVC 0,45 mm del color de la placa. Veta «Sí»: no rotar la pieza en la placa.'])
ws.append(['Las filas en amarillo son de la alacena sobre la heladera: medida provisoria, para una heladera de 0,75 × 1,90 × 0,70 m. Se confirman cuando esté la heladera.'])
ws.append([])
hdr_row = ws.max_row + 1
ws.append(COLS)
for c in ws[hdr_row]: c.font = Font(bold=True, color='FFFFFF'); c.fill = PatternFill('solid', fgColor='333333'); c.alignment = Alignment(wrap_text=True, vertical='center')
amar = PatternFill('solid', fgColor='FFF2B3'); grisf = PatternFill('solid', fgColor='E6E6E6')
for mat in tot:
    ws.append([mat]); r = ws.max_row
    ws.cell(r, 1).font = Font(bold=True); 
    for col in range(1, len(COLS) + 1): ws.cell(r, col).fill = grisf
    for f in filas:
        if f['color'] != mat: continue
        ws.append(fila(f))
        if f['dep']:
            for col in range(1, len(COLS) + 1): ws.cell(ws.max_row, col).fill = amar
ws.append([])
ws.append(['Resumen por material']); ws.cell(ws.max_row, 1).font = Font(bold=True)
ws.append(['Material', 'Piezas', 'm² netos', 'Placas aprox. (+20 %)', 'Medida de placa', 'Canto (m, sin desperdicio)'])
for c in ws[ws.max_row]: c.font = Font(bold=True)
for mat, t in tot.items():
    ws.append([mat, t['n'], round(t['m2'], 2), t['placas'], f"{t['placa'][0]} × {t['placa'][1]}", round(t['canto_m'], 1) if t['canto_m'] else ''])
widths = [6, 6, 10, 10, 7, 28, 6, 9, 9, 9, 9, 60, 22, 22]
for i, wdt in enumerate(widths): ws.column_dimensions[chr(65 + i)].width = wdt
for row in ws.iter_rows(min_row=hdr_row + 1):
    for c in row: c.alignment = Alignment(wrap_text=True, vertical='top')
ws.freeze_panes = ws.cell(hdr_row + 1, 1)
wb.save(base + '.xlsx')

json.dump(dict(filas=filas, tot={k: v for k, v in tot.items()}, COLS=COLS), open(base + '.json', 'w'), ensure_ascii=False, indent=0)
print(len(filas), 'filas'); [print(k, v) for k, v in tot.items()]
