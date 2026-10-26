"""Genera los datos que usa la app a partir de la investigación de precios.

Salida:
  src/data/precios.json        precio de referencia de cada material y herraje (lo usa el cálculo de costos)
  src/data/investigacion.json  fuentes, herramientas en tres gamas y precio en cada tienda (lo usa la ficha)
  ../../supabase/precios_app.sql  mismo precio de referencia para carpinteria.precios

Uso (desde scripts/precios):  python3 generar_app.py ../../docs/investigacion/precios-2026-10-26.json [crudo.json]
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
precios = json.load(open(sys.argv[1]))
crudo = json.load(open(sys.argv[2]))['resultados'] if len(sys.argv) > 2 else {}
catalogo = json.load(open(RAIZ / 'docs/investigacion/catalogo-proyectos.json'))
FECHA = precios['fecha_consulta']


def norm(s):
    return unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()


def formato(nombre):
    """Formato de plancha en mm [largo, ancho] leído del nombre del producto."""
    n = norm(nombre).replace(',', '.')
    m = re.search(r'(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)', n)
    if not m:
        return None
    a, b = (float(v) for v in m.groups())
    a, b = (v * 1000 if v < 10 else v * 10 if v < 1000 else v for v in (a, b))
    return [round(max(a, b)), round(min(a, b))]


# Conversión del envase de la tienda a la unidad en que la app cuenta el uso.
CLAVOS_POR_KG = {'clavo1': 1000, 'clavo2': 300, 'clavo3': 130, 'clavo4': 70}  # estimación
RENDIMIENTO_M2_POR_LITRO = 4  # protector de deck, dos manos (estimación)


def litros(nombre):
    n = norm(nombre).replace(',', '.')
    if m := re.search(r'(\d+(?:\.\d+)?)\s*(lt|litro|l)\b', n):
        return float(m.group(1))
    if m := re.search(r'(\d+(?:\.\d+)?)\s*ml', n):
        return float(m.group(1)) / 1000
    if '1/4' in n or '0.25 gal' in n:
        return 0.946
    if re.search(r'\b1 ?gal', n):
        return 3.785
    return 1


def envase_app(iid, v):
    nombre = v['nombre']
    if iid in CLAVOS_POR_KG:
        kg = v['envase'] if v['unidad_envase'] == 'kg' else (0.5 if '1/2 kg' in nombre else 1)
        return round(kg * CLAVOS_POR_KG[iid]), f'bolsa {str(kg).replace(".", ",")} kg'
    if iid == 'lanamin':
        m = re.search(r'(\d+(?:[.,]\d+)?)\s*m2', norm(nombre)) or re.search(r'1[.,]2\s*x\s*(\d+)', norm(nombre))
        m2 = float(m.group(1).replace(',', '.')) * (1.2 if 'm2' not in m.group(0) else 1)
        return round(m2, 1), f'rollo {str(round(m2, 1)).replace(".", ",")} m²'
    if iid == 'protdeck':
        lt = litros(nombre)
        return round(lt * RENDIMIENTO_M2_POR_LITRO, 1), f'envase {str(round(lt, 2)).replace(".", ",")} L'
    if iid == 'pastamuro':
        return 1, 'bolsa 1 kg'
    if v['unidad_envase'] == 'm':
        return v['envase'], f'rollo {int(v["envase"])} m'
    if v['envase'] > 1:
        return v['envase'], f'{int(v["envase"])} u'
    return 1, 'unidad'


# Elección manual cuando el más barato no es el que conviene mostrar (p. ej., tirador de color llamativo).
PREFERIR = {'tirador': 'Sodimac'}
UNIDAD_VENTA = {'corr35': 'juego (par)', 'corr45': 'juego (par)'}

ref = {}
for e in precios['items']:
    pt = e['por_tienda']
    if not pt:
        continue
    if e['id'] in PREFERIR and PREFERIR[e['id']] in pt:
        t = PREFERIR[e['id']]
    elif e['id'] == 'protdeck':
        t = min(pt, key=lambda k: pt[k]['precio'] / litros(pt[k]['nombre']))
    elif e['cat'] in ('herraje', 'consumible'):
        t = min(pt, key=lambda k: pt[k]['precio_unitario'])
    else:
        t = min(pt, key=lambda k: pt[k]['precio'])
    v = pt[t]
    iguales = [k for k in pt if abs(pt[k]['precio'] - v['precio']) <= v['precio'] * 0.01 and pt[k]['envase'] == v['envase']]
    tienda = ' · '.join(iguales) if len(iguales) > 1 else t
    r = {'nombre': e['nombre'], 'precio': v['precio'], 'tienda': tienda, 'producto': v['nombre'], 'url': v['url']}
    if e['cat'] == 'tablero':
        r['formato'] = formato(v['nombre'])
        r['unidadVenta'] = 'plancha'
        r['envase'] = 1
    elif e['cat'] == 'madera':
        r['unidadVenta'] = 'pieza'
        r['envase'] = 1
    elif e['cat'] in ('herraje', 'consumible'):
        r['envase'], r['unidadVenta'] = envase_app(e['id'], v)
        r['unidadVenta'] = UNIDAD_VENTA.get(e['id'], r['unidadVenta'])
    else:
        continue  # herramientas: van a investigacion.json
    ref[e['id']] = r

# Polín 4–5" (pilares de deck y pérgola): no era un ítem del estudio; se toma de las mismas búsquedas.
for r in crudo.get('polin', []) + crudo.get('_imperial', []):
    if re.search(r'polin impregnado.*4 a (4 1/2|5)', norm(r['nombre'])):
        actual = ref.get('polin45')
        if not actual or r['precio'] < actual['precio']:
            ref['polin45'] = {'nombre': 'Polín impregnado 4–5" 2,4 m', 'precio': r['precio'], 'tienda': r['tienda'], 'producto': r['nombre'],
                              'url': r['url'], 'unidadVenta': 'pieza', 'envase': 1}

json.dump({'fecha': FECHA, 'items': ref}, open(RAIZ / 'src/data/precios.json', 'w'), ensure_ascii=False, indent=1)

# Ficha: fuentes, herramientas en tres gamas y el mejor precio de cada ítem en cada tienda.
herramientas = {}
tiendas = {}
for e in precios['items']:
    if e.get('niveles'):
        herramientas[e['id']] = {'nombre': e['nombre'], 'gamas': {g: {k: v[k] for k in ('tienda', 'nombre', 'marca', 'precio', 'oferta', 'url')} for g, v in e['niveles'].items()}}
    if e['por_tienda'] and e['cat'] != 'herramienta':
        tiendas[e['id']] = sorted(({'tienda': t, 'producto': v['nombre'], 'precio': v['precio'], 'oferta': v['oferta'], 'url': v['url']} for t, v in e['por_tienda'].items()),
                                  key=lambda x: x['precio'])
investigacion = {'fecha': FECHA, 'fuentes': catalogo['fuentes'], 'herramientas': herramientas, 'tiendas': tiendas, 'descartados': catalogo['descartados']}
json.dump(investigacion, open(RAIZ / 'src/data/investigacion.json', 'w'), ensure_ascii=False, separators=(',', ':'))

# Ficha técnica de cada proyecto (categoría, herramientas, reglas con fuente, permiso y nota).
fichas = {p['id']: {k: p[k] for k in ('categoria', 'dificultad', 'herramientas', 'reglas', 'permiso', 'nota')} for p in catalogo['proyectos']}
json.dump(fichas, open(RAIZ / 'src/data/fichas.json', 'w'), ensure_ascii=False, indent=1)


def q(v):
    return 'null' if v is None else ("'" + str(v).replace("'", "''") + "'" if isinstance(v, str) else str(v))


filas = [f"({q(i)},{r['precio']},{q(r['tienda'])},{q(r['producto'])},{q(r['url'])},{r['envase']},{q(r['unidadVenta'])},'{FECHA}')" for i, r in ref.items()]
sql = ('insert into carpinteria.precios (id, precio, tienda, producto, url, envase, unidad_venta, actualizado) values\n' + ',\n'.join(filas) +
       '\non conflict (id) do update set precio = excluded.precio, tienda = excluded.tienda, producto = excluded.producto, url = excluded.url, '
       'envase = excluded.envase, unidad_venta = excluded.unidad_venta, actualizado = excluded.actualizado;\n')
(RAIZ / 'supabase/precios_app.sql').write_text(sql)
print(len(ref), 'precios;', len(herramientas), 'herramientas;', len(tiendas), 'ítems con tiendas')
