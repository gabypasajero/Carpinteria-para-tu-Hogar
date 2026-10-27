"""Lanza las búsquedas en cada tienda y guarda todo en crudo.json (con fecha de consulta)."""
import datetime
import json
import sys
import time
from concurrent.futures import ThreadPoolExecutor

from items import I, IMPERIAL_Q
from tiendas import easy, imperial, sodimac

fecha = datetime.datetime.now(datetime.timezone.utc).isoformat()
trabajos = [(it['id'], t, q) for it in I for q in it['q'] for t in ('Sodimac', 'Easy')]
FN = {'Sodimac': sodimac, 'Easy': easy}
print(len(trabajos), 'búsquedas Sodimac/Easy;', len(IMPERIAL_Q), 'búsquedas Imperial')


def correr(tr):
    iid, t, q = tr
    time.sleep(0.2)
    return iid, t, q, FN[t](q)


crudo = {}
with ThreadPoolExecutor(max_workers=6) as ex:
    for iid, t, q, res in ex.map(correr, trabajos):
        crudo.setdefault(iid, []).extend(dict(r, consulta=q) for r in res)

# Imperial: de a una consulta, con pausa, para no gatillar su protección.
imp = []
for n, q in enumerate(IMPERIAL_Q):
    for desde in (0, 48):
        res = imperial(q, desde)
        imp.extend(dict(r, consulta=q) for r in res)
        time.sleep(1.2)
        if len(res) < 48:
            break
    print('imperial', n, q, len(imp), file=sys.stderr)
crudo['_imperial'] = imp
json.dump({'fecha': fecha, 'resultados': crudo}, open('crudo.json', 'w'), ensure_ascii=False)
print('ok', sum(len(v) for v in crudo.values()), 'filas;', len(imp), 'de Imperial')
