# Cotizador de precios (Sodimac, Easy, Imperial)

Vuelve a cotizar todos los materiales, herrajes y herramientas del catálogo.

```bash
cd scripts/precios
python3 recolectar.py      # ~8 min: consulta las tres tiendas y guarda crudo.json
python3 consolidar.py      # aplica las reglas y genera precios_reales.json
python3 filtrar.py mel15   # (opcional) muestra los candidatos de un ítem para revisar reglas
python3 catalogo.py        # regenera catalogo_proyectos.json y valida que todo tenga precio
```

- `items.py`: qué se cotiza y las reglas para comparar productos equivalentes (`inc` / `exc`).
- `tiendas.py`: lectores de cada tienda. Imperial se consulta con `curl` y de a una búsqueda (bloquea ráfagas).
- `consolidar.py`: formato hogar (`MAX_ENVASE`), precio mínimo creíble (`PISO`) y gamas de herramientas.
- `supl.py`: búsquedas complementarias sin repetir todo.

Requiere Python 3 y `curl`. Copia los resultados a `docs/investigacion/` con la fecha y carga en Supabase las tablas `carpinteria.precios_tiendas`, `carpinteria.herramientas_gamas` y `carpinteria.precios`.
