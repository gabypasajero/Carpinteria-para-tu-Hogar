"""Consolida crudo.json en precios_reales.json: mejor opción por tienda, referencia, rango y confianza."""
import json
import re
import statistics

from filtrar import candidatos, d, norm
from items import I

# Ajustes finos de reglas detectados al revisar los resultados.
EXTRA_EXC = {
    'mel15': [r'\b1c\b'], 'mel18': [r'\b1c\b'],
    'protdeck': [r'auto|automovil|talla'],
    'circular': [r'combo|\+|set|ingletadora|caladora'],
    'taladro': [r'sierra|combo|\+ ?sierra|impacto|kit .*(lijadora|esmeril)'],
    'tdeck': [r'volcanita'],
    'escuadra': [r'plegable|dewalt|300 ?mm|metalica 300'],
    'soporte': [r'repisa c/'],
    'osb9': [r'60[.,]6|perimetral|cierre'], 'escuadra': [r'plegable|dewalt|300 ?mm|tarugo'], 'tdeck': [r'volcanita', r'candado'], 'escuadrac': [r'tarugo|plana|nervio|uds|refuerzo'], 'huincha': [r'costurer'],
    'martillo': [r'broca|sds|tapicer|rompedor|demoledor|electric'], 'pistolacal': [r'boquilla|puntera|inalambric|solo|\bli\b'],
    'caladora': [r'\+|combo|kit'], 'lijadora': [r'\+|combo|ingletadora|kit'], 'router': [r'\+|combo'],
    'ingletadora': [r'\+|combo|circular'],
}
EXTRA_INC = {
    'huincha': [r'(?<![\d.,])5 ?(m|mt|metros)\b'],
    'ingletadora': [r'10 ?("|pulg|\'\')|254'],
    'machi': [r'(3/4|1) ?x ?[45]'],
}
for it in I:
    it['inc'] += EXTRA_INC.get(it['id'], [])
for it in I:
    it['exc'] += EXTRA_EXC.get(it['id'], [])

# Formato «hogar»: envase máximo razonable para quien arma un mueble (no cajas de obra).
MAX_ENVASE = {'t4x40': 200, 't4x50': 200, 't35x16': 200, 'tvolc': 500, 'tarugo8': 100, 'clavo1': 1, 'clavo2': 2.5, 'clavo3': 2.5, 'clavo4': 2.5,
              'bisagra': 10, 'tirador': 4, 'soporte': 50, 'escuadra': 10, 'perno': 20, 'tapacanto': 50, 'cintamuro': 90, 'brocas': 20}
# Precio mínimo creíble (descarta accesorios que calzan con el nombre).
PISO = {'taladro': 25000, 'circular': 30000, 'caladora': 18000, 'ingletadora': 80000, 'lijadora': 18000, 'router': 30000,
        'escuadrac': 2500, 'martillo': 2500, 'huincha': 1500, 'nivel': 3000, 'forstner': 3000, 'prensa': 3000}

MARCAS_PRO = r'makita|dewalt|bosch|milwaukee|stanley|metabo|hitachi|hikoki|ryobi|einhell|black ?\+? ?decker|skil'


def envase(nombre, unidad):
    """Cantidad que trae el producto según su nombre (unidades o kg)."""
    n = norm(nombre)
    m = re.search(r'(\d+)\s*(unidades|unidad|unds|uds|und|un\b|u\b|piezas|pzas)', n)
    if m:
        return int(m.group(1)), 'u'
    if re.search(r'rueda|garrucha', n):
        m = re.search(r'(\d+)\s*(unidades|uds|und)', n)
        return (int(m.group(1)) if m else 1), 'u'
    if 'ciento' in (unidad or '').lower():
        return 100, 'u'
    m = re.search(r'(\d+(?:[.,]\d+)?)\s*(kg|kilo)', n)
    if m:
        return float(m.group(1).replace(',', '.')), 'kg'
    m = re.search(r'(\d+)\s*gr?\b', n)
    if m and 'clavo' in n:
        return int(m.group(1)) / 1000, 'kg'
    m = re.search(r'(\d+(?:[.,]\d+)?)\s*(m|mt|mts|metros)\b', n)
    if m and ('tapacanto' in n or 'cinta' in n):
        return float(m.group(1).replace(',', '.')), 'm'
    if re.search(r'\bpar\b', n) or 'par' == (unidad or '').lower():
        return 2, 'u'
    return 1, 'u'


salida = {'fecha_consulta': d['fecha'], 'items': []}
for it in I:
    c = candidatos(it)
    for x in c:
        x['envase'], x['unidad_envase'] = envase(x['nombre'], x['unidad'])
        x['precio_unitario'] = x['precio'] / x['envase'] if x['envase'] else x['precio']
    if it['id'] in MAX_ENVASE:
        c = [x for x in c if x['envase'] <= MAX_ENVASE[it['id']]]
    if it['id'] in PISO:
        c = [x for x in c if x['precio'] >= PISO[it['id']]]
    por_tienda = {}
    for t in ('Sodimac', 'Easy', 'Imperial'):
        cs = [x for x in c if x['tienda'] == t]
        if not cs:
            continue
        # Para herrajes por envase se compara precio por unidad; para el resto, precio normal.
        clave = (lambda x: x['precio_unitario']) if it['cat'] in ('herraje', 'consumible') and it['id'] not in ('barniz', 'cola', 'protdeck', 'pastamuro', 'lanamin', 'lija120') else (lambda x: x['precio'])
        mejor = min(cs, key=clave)
        por_tienda[t] = {k: mejor[k] for k in ('sku', 'nombre', 'marca', 'precio', 'oferta', 'unidad', 'url', 'envase', 'unidad_envase', 'precio_unitario')}
        por_tienda[t]['alternativas'] = len(cs)

    entrada = {k: it[k] for k in ('id', 'nombre', 'cat', 'unidad')}
    entrada['por_tienda'] = por_tienda
    if it['cat'] == 'herramienta' and c:
        ordenados = sorted(c, key=lambda x: x['precio'])
        pro = [x for x in ordenados if re.search(MARCAS_PRO, norm(x['nombre'] + ' ' + x['marca']))]
        eco = ordenados[0]
        medio = ordenados[len(ordenados) // 2]
        premium = pro[len(pro) // 2] if pro else ordenados[-1]
        entrada['niveles'] = {n: {k: x[k] for k in ('tienda', 'nombre', 'marca', 'precio', 'oferta', 'url')} for n, x in (('economica', eco), ('media', medio), ('premium', premium))}
    if por_tienda:
        precios = [v['precio_unitario'] if it['cat'] in ('herraje',) else v['precio'] for v in por_tienda.values()]
        ref_t = min(por_tienda, key=lambda t: por_tienda[t]['precio'])
        entrada['referencia'] = {'tienda': ref_t, 'precio': por_tienda[ref_t]['precio'], 'url': por_tienda[ref_t]['url'], 'nombre': por_tienda[ref_t]['nombre'],
                                 'envase': por_tienda[ref_t]['envase'], 'unidad_envase': por_tienda[ref_t]['unidad_envase']}
        lo, hi = min(precios), max(precios)
        entrada['rango'] = [lo, hi]
        if len(por_tienda) >= 2 and hi <= lo * 1.3:
            entrada['confianza'] = 'confirmado'
        elif len(por_tienda) >= 2:
            entrada['confianza'] = 'variable'
        else:
            entrada['confianza'] = 'una_fuente'
    else:
        entrada['confianza'] = 'sin_datos'
    salida['items'].append(entrada)

json.dump(salida, open('precios_reales.json', 'w'), ensure_ascii=False, indent=1)
from collections import Counter
print(Counter(e['confianza'] for e in salida['items']))
for e in salida['items']:
    r = e.get('referencia')
    pt = '  '.join(f"{t[:3]} {v['precio']}" + (f"/{v['envase']}{v['unidad_envase']}" if v['envase'] != 1 else '') for t, v in e['por_tienda'].items())
    print(f"{e['id']:12} {e['confianza']:11} {pt}")
