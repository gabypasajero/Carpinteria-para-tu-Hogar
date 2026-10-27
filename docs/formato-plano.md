# Plano para cotizar (`carpinteria-plano`, versión 1)

Cada vez que alguien pide una cotización desde la app (botón **Contactar a De Todito Outlet** o **¿No quieres hacerlo tú?**),
el diseño viaja completo en la columna `plano` de `carpinteria.solicitudes`. Con plan Pro, la persona también puede
descargarlo como archivo `.plano.json`. Así el diseñador 3D de la mueblería puede leerlo y armar el presupuesto
sin volver a dibujar el mueble.

Todas las medidas van en milímetros. Los precios van en pesos chilenos, con IVA.

```jsonc
{
  "formato": "carpinteria-plano",
  "version": 1,
  "creado": "2026-10-27T12:00:00.000Z",
  "nombre": "Cómoda cajonera",
  "proyecto": "comoda",              // id del catálogo, o "libre" si lo diseñó la persona
  "enlace": "https://carpinteria-para-tu-hogar.vercel.app/proyecto/comoda?ancho=800",
  "medidas": { "ancho": 800, "alto": 900, "fondo": 450 },
  "costoMateriales": 98000,          // solo materiales, referencia Sodimac/Easy/Imperial
  "cortes": [                        // lista de corte agrupada (una fila por letra)
    {
      "letra": "A", "nombre": "Costado", "material": "mel18", "materialNombre": "Melamina blanca 18 mm",
      "tipo": "plancha", "cantidad": 2, "largo": 900, "ancho": 450, "espesor": 18,
      "veta": false, "tapacantoLados": { "largos": 1, "anchos": 0 }, "nota": "opcional"
    }
  ],
  "herrajes": [ { "id": "corredera45", "nombre": "Corredera telescópica 45 cm", "cantidad": 4, "unidad": "u" } ],
  "piezas": [                        // cada pieza ubicada en 3D, para reconstruir el modelo
    { "letra": "A", "nombre": "Costado", "material": "mel18", "size": [18, 900, 450], "pos": [9, 450, 225], "rot": [0, 0, 0] }
  ]
}
```

## Cómo reconstruir el 3D

- `size` es el tamaño de la caja de la pieza en sus ejes: **x** = ancho, **y** = alto, **z** = fondo.
- `pos` es el centro de la pieza. El piso está en `y = 0` y el muro en `z = 0`.
- `rot` (opcional) es el giro en radianes sobre x, y, z (orden XYZ). Solo lo traen piezas inclinadas.

## Cómo leer la lista de corte

- `tapacantoLados` dice cuántos lados largos y cuántos lados anchos de cada pieza llevan tapacanto.
  Es lo mismo que la planilla de dimensionado que descarga la persona.
- Si `veta` es `true`, la pieza no se puede rotar en la plancha.
- Los listones (`tipo: "liston"`) tienen `largo` y la sección del material. Se cortan aparte.

## Dónde verlo

En Supabase: Table Editor → esquema `carpinteria` → tabla `solicitudes` → columna `plano`.
La fila `PRUEBA-CLAUDE` se mantiene para probar.
