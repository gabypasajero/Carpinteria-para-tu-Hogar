"""Búsquedas complementarias que se agregan a crudo.json sin repetir todo."""
import json, sys, time
from items import I, IMPERIAL_Q
from tiendas import easy, imperial, sodimac
d = json.load(open('crudo.json'))
ids = sys.argv[1].split(',')
qi = sys.argv[2].split('|') if len(sys.argv) > 2 and sys.argv[2] else []
for it in I:
    if it['id'] in ids:
        for q in it['q']:
            for f in (sodimac, easy):
                d['resultados'].setdefault(it['id'], []).extend(dict(r, consulta=q) for r in f(q))
for q in qi:
    d['resultados']['_imperial'].extend(dict(r, consulta=q) for r in imperial(q))
    time.sleep(1.2)
json.dump(d, open('crudo.json', 'w'), ensure_ascii=False)
print('ok')
