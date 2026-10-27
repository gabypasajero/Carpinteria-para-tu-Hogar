"""Recolector de precios públicos de tiendas chilenas (Sodimac, Easy, Imperial).

Cada función devuelve una lista de dicts:
  tienda, sku, nombre, marca, precio (CLP, precio normal), oferta (CLP o None), unidad, url, stock
"""
import json
import re
import time
import urllib.parse
import urllib.request

UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'


def _curl(url, timeout=40):
    """Imperial rechaza la huella TLS de urllib (error 520); curl pasa."""
    import subprocess
    for i in range(3):
        r = subprocess.run(['curl', '-sS', '-m', str(timeout), '-A', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130 Safari/537.36', url], capture_output=True, text=True)
        if r.returncode == 0 and r.stdout.startswith('{'):
            return r.stdout
        time.sleep(3 * (i + 1))
    print('  error curl', url[:90])
    return None


def _get(url, timeout=40, intentos=3):
    for i in range(intentos):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept-Language': 'es-CL'})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read().decode('utf-8', 'replace')
        except Exception as e:  # noqa: BLE001
            if i == intentos - 1:
                print('  error', url[:90], e)
                return None
            time.sleep(2 * (i + 1))


def sodimac(q):
    txt = _get('https://www.sodimac.cl/s/search/v1/socl?' + urllib.parse.urlencode({'q': q, 'page': 1}))
    if not txt:
        return []
    try:
        res = json.loads(txt)['data']['results']
    except Exception:  # noqa: BLE001
        return []
    out = []
    for r in res:
        precios = {p['type']: p for p in r.get('prices', [])}
        normal = precios.get('NORMAL') or next(iter(precios.values()), None)
        oferta = None
        for tipo in ('INTERNET', 'EVENT', 'CMR'):
            if tipo in precios and precios[tipo].get('priceWithoutFormatting'):
                v = precios[tipo]['priceWithoutFormatting']
                oferta = v if oferta is None else min(oferta, v)
        if not normal:
            continue
        out.append({
            'tienda': 'Sodimac',
            'sku': r['skuId'],
            'nombre': r['displayName'],
            'marca': r.get('brand', ''),
            'precio': normal['priceWithoutFormatting'],
            'oferta': oferta,
            'unidad': normal.get('unit', ''),
            'url': f"https://www.sodimac.cl/sodimac-cl/product/{r['skuId']}",
            'stock': None,
            'atributos': {h['key']: h['value'] for h in r.get('highlights', [])},
        })
    return out


def easy(q):
    h = _get('https://www.easy.cl/search/' + urllib.parse.quote(q.replace('/', ' '), safe=''))
    if not h:
        return []
    m = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', h, re.S)
    if not m:
        return []
    try:
        lista = json.loads(m.group(1))['props']['pageProps']['serverProductsResponse']['productList']
    except Exception:  # noqa: BLE001
        return []
    out = []
    for p in lista:
        pr = p.get('prices') or {}
        if not pr.get('normalPrice'):
            continue
        out.append({
            'tienda': 'Easy',
            'sku': p['sku'],
            'nombre': p['productName'],
            'marca': p.get('brand', ''),
            'precio': pr['normalPrice'],
            'oferta': pr.get('offerPrice'),
            'unidad': '',
            'url': 'https://www.easy.cl/' + p['linkText'],
            'stock': p.get('availableQuantity'),
            'atributos': {s['name']: ', '.join(s['values']) for s in p.get('specifications', []) if len(', '.join(s['values'])) < 80},
        })
    return out


def imperial(q, desde=0):
    txt = _curl('https://www.imperial.cl/ccstoreui/v1/search?' + urllib.parse.urlencode({'Ntt': q, 'Nrpp': 48, 'No': desde}))
    if not txt:
        return []
    try:
        recs = json.loads(txt)['resultsList']['records']
    except Exception:  # noqa: BLE001
        return []
    out = []
    for r in recs:
        a = r['records'][0]['attributes']
        g = lambda k: (a.get(k) or [''])[0]  # noqa: E731
        lista = float(g('sku.listPrice') or 0)
        activo = float(g('sku.activePrice') or 0)
        if not lista and not activo:
            continue
        out.append({
            'tienda': 'Imperial',
            'sku': g('sku.repositoryId'),
            'nombre': g('product.displayName'),
            'marca': g('product.brand'),
            'precio': round(lista or activo),
            'oferta': round(activo) if activo and lista and activo < lista else None,
            'unidad': g('product.unidadPrincipalImperial'),
            'url': 'https://www.imperial.cl' + g('product.route'),
            'stock': g('sku.availabilityStatus'),
            'atributos': {k.split('.')[1].replace('Imperial', ''): g(k) for k in ('product.largoImperial', 'product.anchoImperial', 'product.espesorImperial') if g(k)},
        })
    return out


TIENDAS = {'Sodimac': sodimac, 'Easy': easy, 'Imperial': imperial}
