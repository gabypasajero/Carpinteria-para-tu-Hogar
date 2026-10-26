"""Filtra crudo.json con las reglas de items.py y muestra los candidatos por ítem y tienda."""
import json
import re
import sys
import unicodedata

from items import I

d = json.load(open('crudo.json'))


def norm(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()
    return s.replace('”', '"').replace('“', '"').replace("''", '"')


def calza(it, nombre):
    n = norm(nombre)
    return all(re.search(p, n) for p in it['inc']) and not any(re.search(p, n) for p in it['exc'])


def candidatos(it):
    vistos = {}
    for r in d['resultados'].get(it['id'], []) + d['resultados'].get('_imperial', []):
        if calza(it, r['nombre']):
            vistos[(r['tienda'], r['sku'])] = r
    return list(vistos.values())


if __name__ == '__main__':
    filtro = sys.argv[1:] or None
    for it in I:
        if filtro and it['id'] not in filtro:
            continue
        c = candidatos(it)
        print(f"\n## {it['id']} — {it['nombre']}  ({len(c)} candidatos)")
        for t in ('Sodimac', 'Easy', 'Imperial'):
            cs = sorted([x for x in c if x['tienda'] == t], key=lambda x: x['oferta'] or x['precio'])[:4]
            for x in cs:
                of = f" oferta {x['oferta']}" if x['oferta'] else ''
                print(f"  {t:8} {x['precio']:>8}{of:>16}  {x['nombre'][:80]} [{x['marca'][:12]}] {x['unidad']}")
