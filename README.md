# Carpintería para tu hogar

Carpintería general para mueblistas y dueñ@s de hogar. Planos a tu medida, al estilo Woodsense, pensados para Chile: la persona elige un mueble, ingresa sus medidas y obtiene:

- **Visor 3D** con cada pieza identificada por letra (A, B, C…), vista explotada y armado por pasos.
- **Lista de corte** con largo, ancho, espesor, cantidad y metros de tapacanto por pieza.
- **Materiales y costo** con precios referenciales en CLP (Sodimac, Easy, Imperial), editables y guardados en el navegador.
- **Plano de cortes** optimizado para planchas de 244×183 cm y listones de 3,2 m (descuenta 4 mm por corte y respeta la veta).
- **Guía paso a paso** con herramientas, consejos y la escena 3D de cada paso.
- **PDF descargable** con todo lo anterior, más un recuadro «¿Prefieres que te lo hagan?» con las tiendas que fabrican.
- **Planilla para dimensionar** (CSV para Excel) con medidas en mm, veta y lados con tapacanto, lista para pedir el corte en tienda.
- **Comparador «hazlo tú vs. que te lo hagan»**: costo de materiales frente al precio estimado de fabricación.
- **«¿No quieres hacerlo tú?»**: envía el diseño como solicitud de cotización a De Todito Outlet o a Muebles y Hogar Molina.

Proyectos incluidos: repisa librero, velador con cajones, banca de pino, mueble TV y closet de dos puertas.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # pruebas del motor (geometría, despiece, optimizador, costos)
npm run build      # chequeo de tipos + build de producción
```

Copia `.env.example` a `.env.local` para activar Supabase (inicio de sesión, diseños en la nube, solicitudes de cotización, tiendas y precios). Sin esas variables la app funciona completa en modo local con los valores del código.

### Supabase

Por ahora la app vive en el esquema aislado **`carpinteria`** dentro del proyecto de Supabase de la organización (plan gratis: máximo 2 proyectos). No comparte tablas con nada más; la app accede solo por las funciones `public.carpinteria_*` (SECURITY INVOKER, con RLS), así que no hace falta publicar el esquema en la API.

| Tabla | Para qué | Quién edita |
| --- | --- | --- |
| `carpinteria.tiendas` | Tiendas que fabrican, su WhatsApp (formato `569XXXXXXXX`) y el factor de precio de fabricación | Tú, desde el Table Editor |
| `carpinteria.precios` | Precio de cada material y herraje (reemplaza al del código sin volver a publicar) | Tú, desde el Table Editor |
| `carpinteria.solicitudes` | Pedidos «¿No quieres hacerlo tú?» con estado (`nueva`, `contactada`, `cotizada`, `vendida`, `descartada`) | Las tiendas, desde el panel |
| `carpinteria.disenos` | Diseños guardados por cada persona (cada una ve solo los suyos) | La app |

Las migraciones están en `supabase/migrations/`.

**Datos de prueba:** siempre se deja al menos un registro para probar. En `carpinteria.solicitudes` está la solicitud con nombre `PRUEBA-CLAUDE` (comuna `Prueba`); no es un pedido real y no se borra.

**Migrar a un proyecto propio (al pasar a Pro):** crea el proyecto, aplica las migraciones de `supabase/migrations/` en orden, copia los datos de las cuatro tablas (`pg_dump --schema=carpinteria --data-only`) y cambia `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en Vercel. Las cuentas de usuario (`auth.users`) se exportan aparte; los diseños apuntan a ellas por `user_id`.

En *Authentication → URL Configuration* agrega el dominio de Vercel como URL de redirección para el enlace mágico.

### Vercel

Proyecto Vite estándar (`npm run build`, salida `dist`). `vercel.json` redirige todas las rutas a `index.html`.

## Cómo agregar un proyecto

Cada mueble es una plantilla paramétrica en `src/projects/`:

```ts
export const miMueble: ProyectoDef = {
  id, nombre, descripcion, categoria, plan, dificultad, horas, herramientas,
  params: [{ id: 'ancho', label: 'Ancho', unidad: 'cm', min, max, step, default }],
  construir(params) {
    // pieza(clave, nombre, material, [xMin, yMin, zMin], [xMax, yMax, zMax], paso, { canto, veta })
    return { piezas, herrajes, pasos, exterior, avisos }
  },
}
```

- Medidas internas en **milímetros**; ejes x = ancho, y = alto, z = fondo (0 = muro).
- Las piezas con la misma `clave` reciben la misma letra y deben medir lo mismo.
- `paso` indica en qué paso de la guía se instala la pieza.
- Agrégalo a `PROYECTOS` en `src/projects/index.ts`. Las pruebas recorren cada proyecto en sus medidas mínimas, máximas y por defecto, y verifican que las piezas no se atraviesen, queden dentro del mueble y quepan en las planchas.

Materiales, herrajes y precios están en `src/core/catalogo.ts`.

## Estructura

```
src/core/       tipos, catálogo y precios, despiece por letras, optimizador de cortes, costos
src/projects/   plantillas paramétricas de cada mueble
src/components/ visor 3D, miniaturas, tablas, plano de cortes, guía, cotización
src/pages/      catálogo, configurador, mis proyectos, ingresar
src/lib/        Supabase, PDF, cálculo
```

## Próximas etapas (según el plan)

- **3. Cobro**: plan gratis/Pro con Mercado Pago o Flow (los proyectos ya traen `plan: 'gratis' | 'pro'`).
- **4. Lanzamiento**: PWA instalable y dominio propio.
- **5. Crecimiento**: más proyectos cada mes, panel de pedidos para las tiendas, plan carpintero.
