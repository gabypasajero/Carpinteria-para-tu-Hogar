# Carpintería para tu hogar

Carpintería general para mueblistas y dueñ@s de hogar. Planos a tu medida, al estilo Woodsense, pensados para Chile: la persona elige un mueble, ingresa sus medidas y obtiene:

- **Visor 3D** con cada pieza identificada por letra (A, B, C…), vista explotada y armado por pasos.
- **Lista de corte** con largo, ancho, espesor, cantidad y metros de tapacanto por pieza.
- **Materiales y costo** con precios referenciales en CLP (Sodimac, Easy, Imperial), editables y guardados en el navegador.
- **Plano de cortes** optimizado para planchas de 244×183 cm y listones de 3,2 m (descuenta 4 mm por corte y respeta la veta).
- **Guía paso a paso** con herramientas, consejos y la escena 3D de cada paso.
- **PDF descargable** con todo lo anterior.
- **«¿No quieres hacerlo tú?»**: envía el diseño como solicitud de cotización a De Todito Outlet o a Muebles y Hogar Molina.

Proyectos incluidos: repisa librero, velador con cajones, banca de pino, mueble TV y closet de dos puertas.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # pruebas del motor (geometría, despiece, optimizador, costos)
npm run build      # chequeo de tipos + build de producción
```

Copia `.env.example` a `.env.local` para activar Supabase (inicio de sesión, diseños en la nube y solicitudes de cotización) y los WhatsApp de las tiendas. Sin esas variables la app funciona completa en modo local.

### Supabase

Aplica `supabase/migrations/20261026000000_inicial.sql` en el proyecto nuevo. Crea:

- `disenos`: diseños guardados por cada persona (RLS: cada una ve solo los suyos).
- `solicitudes`: pedidos «¿No quieres hacerlo tú?». Cualquiera puede crear y nadie puede leer desde la app pública; las tiendas las revisan en el panel de Supabase (más adelante, en un panel propio).

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
