#!/usr/bin/env python3
# Genera la página «Cocina de Carhué: muebles» (diagrama para el carpintero + despiece) desde las medidas del modelo (escenario E, 20/11/2026).
import json, math, html

# ---------- medidas del modelo (cm) ----------
H_CAJ = 77.0      # alto de la caja de la mesada (de 10 a 87)
ZOC = 10.0        # zócalo
D_CAJ = 60.0      # fondo de la caja (sin frente)
MODS = [46.0, 80.0, 92.83, 92.83, 92.83]   # columnas, desde el rincón hacia la heladera
SUP = 4.0         # suplemento de rincón
ROWS = [36.19, 25.41, 15.40]  # paso de filas: abajo, medio, arriba (47 / 33 / 20 %)
BACHA_IDX = 1     # la columna de 80 va bajo la bacha farm
# península
P_W, P_H, P_D = 90.0, 76.0, 64.0   # módulo de cajones (de 10 a 86)
P_FALSO = 14.0
P_ROWS = [37.2, 24.8]              # abajo, arriba (60 / 40 % de 62)
J = 0.4           # junta entre frentes (cm), 2 mm por lado

def mm(x): return int(round(x * 10))

piezas = []  # dict: grupo, cod, pieza, cant, L, A, esp, mat, canto, nota
def add(g, pieza, cant, L, A, esp, mat, canto='', nota=''):
    piezas.append(dict(g=g, pieza=pieza, cant=cant, L=L, A=A, esp=esp, mat=mat, canto=canto, nota=nota))

ROBLE = 'Roble macizo'; MEL18 = 'Melamina blanca 18'; MEL15 = 'Melamina blanca 15'; FIB = 'Fibroplus blanco 3'; NEG = 'Melamina negra 18'

# ---------- frentes ----------
nom_mod = lambda i: 'columna {} ({})'.format(i+1, ('%.1f' % MODS[i]).rstrip('0').rstrip('.').replace('.', ','))
for i, W in enumerate(MODS):
    w = mm(W - J)
    if i == BACHA_IDX:
        add('Frentes', f'Cajón abajo, {nom_mod(i)}', 1, w, mm(ROWS[0] - J), 20, ROBLE, '', 'uñero fresado arriba')
        add('Frentes', f'Cajón medio, {nom_mod(i)}', 1, w, mm(ROWS[1] - 5.6 - J), 20, ROBLE, '', 'bajo el frente de la bacha farm; uñero fresado')
    else:
        for r, n in zip(ROWS, ['abajo', 'medio', 'arriba']):
            add('Frentes', f'Cajón {n}, {nom_mod(i)}', 1, w, mm(r - J), 20, ROBLE, '', 'uñero fresado arriba')
add('Frentes', 'Suplemento de rincón (mesada)', 1, mm(SUP), mm(H_CAJ - J), 20, ROBLE, '', 'fijo, entre la península y la col. 1')
add('Frentes', 'Frente fijo bajo el anafe (península)', 1, mm(P_W - J), mm(P_FALSO - J), 20, ROBLE, '', 'fijo; detrás va la caja del anafe y el gas')
add('Frentes', 'Cajón arriba (península)', 1, mm(P_W - J), mm(P_ROWS[1] - J), 20, ROBLE, '', 'uñero fresado arriba')
add('Frentes', 'Cajón de ollas abajo (península)', 1, mm(P_W - J), mm(P_ROWS[0] - J), 20, ROBLE, '', 'uñero fresado arriba')

# ---------- cajoneras (cajas del mueble) ----------
for i, W in enumerate(MODS):
    t = f'Cajonera {nom_mod(i)}'
    add('Cajoneras', f'{t}: lateral', 2, mm(H_CAJ), mm(D_CAJ - .3), 18, MEL18, '1 largo (adelante)')
    add('Cajoneras', f'{t}: piso', 1, mm(W - 3.6), mm(D_CAJ - .3), 18, MEL18, '1 largo')
    add('Cajoneras', f'{t}: travesaño arriba', 2, mm(W - 3.6), 100, 18, MEL18, '1 largo')
    add('Cajoneras', f'{t}: fondo', 1, mm(W - .4), mm(H_CAJ - .4), 3, FIB, '', 'clavado y encolado atrás')
t = 'Cajonera península (90)'
add('Cajoneras', f'{t}: lateral', 2, mm(P_H), mm(P_D - .3), 18, MEL18, '1 largo (adelante)')
add('Cajoneras', f'{t}: piso', 1, mm(P_W - 3.6), mm(P_D - .3), 18, MEL18, '1 largo')
add('Cajoneras', f'{t}: travesaño arriba', 2, mm(P_W - 3.6), 100, 18, MEL18, '1 largo')
add('Cajoneras', f'{t}: fondo', 1, mm(P_W - .4), mm(P_H - .4), 3, FIB, '', 'clavado y encolado atrás')

# ---------- cajas de los cajones ----------
# ancho exterior = luz interior de la cajonera (W − 3,6) − 2,6 de guías (12,5–13 mm por lado)
def caja(nombre, ancho, fondo, alto, nota=''):
    add('Cajas de cajón', f'{nombre}: lateral', 2, fondo, alto, 15, MEL15, '1 largo (arriba)', nota)
    add('Cajas de cajón', f'{nombre}: frente y contrafrente', 2, ancho - 30, alto, 15, MEL15, '1 largo (arriba)', nota)
    add('Cajas de cajón', f'{nombre}: piso', 1, ancho, fondo, 3, FIB, '', 'clavado y encolado abajo')
FONDO_M, FONDO_P = 450, 500
for i, W in enumerate(MODS):
    a = mm(W - 3.6 - 2.6)
    if i == BACHA_IDX:
        caja(f'Caja abajo, {nom_mod(i)}', a, FONDO_M, 240, 'recorte en U atrás para el desagüe (medir con el sifón)')
        caja(f'Caja medio, {nom_mod(i)}', a, FONDO_M, 130, 'recorte en U atrás para el desagüe (medir con el sifón)')
    else:
        for alto, n in [(240, 'abajo'), (190, 'medio'), (90, 'arriba')]:
            caja(f'Caja {n}, {nom_mod(i)}', a, FONDO_M, alto)
a = mm(P_W - 3.6 - 2.6)
caja('Caja de ollas abajo (península)', a, FONDO_P, 240)
caja('Caja arriba (península)', a, FONDO_P, 180)

# ---------- zócalo ----------
L_MES = sum(MODS) + SUP
add('Zócalo', 'Zócalo de la mesada (en 2 tramos)', 2, mm(L_MES / 2), 100, 18, NEG, '1 largo', 'rehundido 8 cm; va con clips a las patas')
add('Zócalo', 'Zócalo de la península', 1, mm(P_W), 100, 18, NEG, '1 largo', 'rehundido 8 cm')

# ---------- herrajes ----------
n_caj_m = sum(2 if i == BACHA_IDX else 3 for i in range(len(MODS)))
herr = [
    ('Guías telescópicas extracción total, cierre suave, 45 cm', n_caj_m, 'par', 'mesada; para los cajones de 0,93 que carguen ollas, de 45 kg o más'),
    ('Guías telescópicas extracción total, cierre suave, 50 cm', 2, 'par', 'península'),
    ('Patas regulables de 10 cm para zócalo', 4 * (len(MODS) + 1), 'u', '4 por cajonera'),
    ('Clips de zócalo', 12, 'u', ''),
    ('Tornillos de unión / minifix para cajoneras', 1, 'juego', 'a criterio del carpintero'),
]

# ---------- totales por material ----------
tot = {}
for p in piezas:
    k = (p['mat'], p['esp'])
    tot[k] = tot.get(k, 0) + p['cant'] * p['L'] * p['A'] / 1e6
PLACA = {MEL18: (2.75, 1.83), MEL15: (2.75, 1.83), FIB: (2.60, 1.83), NEG: (2.75, 1.83)}
tot_rows = []
for (mat, esp), m2 in sorted(tot.items()):
    if mat in PLACA:
        a = PLACA[mat][0] * PLACA[mat][1]
        placas = math.ceil(m2 / (a * .8))
        tot_rows.append((mat, esp, round(m2, 2), f'{placas} placa{"s" if placas > 1 else ""} de {PLACA[mat][0]:.2f} × {PLACA[mat][1]:.2f}'.replace('.', ',') + ' (con 20 % de desperdicio)'))
    else:
        tot_rows.append((mat, esp, round(m2, 2), f'{m2*1.25:.2f} m² con 25 % de desperdicio'.replace('.', ',')))

n_caj_total = n_caj_m + 2
resumen = dict(L_MES=L_MES, n_caj_m=n_caj_m, n_caj_total=n_caj_total, n_frentes=sum(p['cant'] for p in piezas if p['g'] == 'Frentes'))
json.dump(dict(piezas=piezas, herr=herr, tot=tot_rows, resumen=resumen), open('/tmp/claude-0/-home-claude/9c8c0de3-7246-56bd-a7b2-5beeea377371/scratchpad/desp/data.json', 'w'), ensure_ascii=False, indent=1)
print(resumen, len(piezas))
for r in tot_rows: print(r)
