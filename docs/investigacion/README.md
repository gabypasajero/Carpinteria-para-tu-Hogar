# Investigación Connan — catálogo de proyectos y precios reales (26-10-2026)

Dos etapas: **(1)** qué proyectos de carpintería puede ofrecer la app, con su despiece, materiales, herramientas, normas y permisos; **(2)** precios reales de cada material y herramienta en tiendas chilenas.

| Archivo | Contenido |
| --- | --- |
| [`catalogo-proyectos.json`](catalogo-proyectos.json) | 54 proyectos en 9 categorías, con parámetros, piezas, materiales, herrajes, herramientas, reglas técnicas con fuente, permiso y motor de la app |
| [`precios-2026-10-26.json`](precios-2026-10-26.json) | 79 ítems × 3 tiendas: mejor opción en formato hogar, rango, confianza y 3 gamas por herramienta |
| [`precios-2026-10-26.csv`](precios-2026-10-26.csv) | Lo mismo en planilla (Excel, separador `;`) |
| [`../../scripts/precios/`](../../scripts/precios/) | Recolector reproducible: volver a cotizar es correr dos comandos |

En Supabase (esquema aislado `carpinteria`): `catalogo_proyectos`, `precios_tiendas` (193 filas), `herramientas_gamas` (48) y `precios` (los 20 que usa la app, ahora con producto, enlace y envase).

## Veredicto

- **La app puede crecer de 5 a 54 proyectos**, pero no todos con el motor actual: 42 caben en los motores existentes (muebles de tablero y de listones) y 12 requieren dos módulos nuevos: estructuras exteriores con apoyos (deck, pérgola, casita) y entramados por m² (tabique, bodega, habitación).
- **Los precios referenciales del código estaban inflados**: con precios reales el presupuesto de 4 de los 5 proyectos baja entre 9 % y 33 %.
- **Había un error de formato**: en Chile la melamina se vende en **1,83 × 2,50 m** (Masisa, Arauco Vesto) y el MDF/trupán en 1,52 × 2,44 m; la app asumía 2,44 × 1,83 para todo. Ya está corregido, y el respaldo del closet grande se divide en dos piezas porque entero no cabía en una plancha real.

## Etapa 1 — Catálogo de proyectos

| Categoría | Proyectos | En la app |
| --- | --- | --- |
| Dormitorio | cama (1 plaza a super king), camarote, cama alta con escritorio, cama con cajones, velador, cómoda, closet, closet abierto, respaldo, zapatero, tocador | velador, closet |
| Living | mueble TV, mesa de centro, mesa lateral, repisa librero, repisa flotante, sofá de madera, revestimiento ranurado | mueble TV, repisa |
| Cocina y comedor | mesa de comedor, banca, silla, mueble base, mueble aéreo, despensa, isla, especiero | banca |
| Baño | vanitorio, repisa sobre WC, toallero | — |
| Oficina | escritorio, escritorio plegable, estantería de pino, banco de trabajo | — |
| Infantil | casita de juego, mesa y sillas, baúl, cama Montessori, torre de aprendizaje | — |
| Organización | perchero con banca, mueble de lavadero, panel de herramientas | — |
| Exterior | deck, pérgola, jardinera, mesa de picnic, silla Adirondack, casa de perro, leñera, cerco, bodega | — |
| Construcción | tabique de volcanita, revestimiento machihembrado, habitación (ampliación), altillo | — |

**Prioridad 1 sugerida (alta demanda y motor existente):** cama, camarote, cómoda, mesa de centro, repisa flotante, mesa de comedor, mueble base y aéreo de cocina, escritorio, estantería, banco de trabajo, jardinera, mesa de picnic. Luego deck, pérgola y tabique, que necesitan los módulos nuevos.

**Descartados a propósito:** cunas (normas muy estrictas y riesgo alto) y escaleras estructurales (requieren cálculo).

### Reglas técnicas confirmadas (con fuente)

| Tema | Regla | Confianza | Fuente |
| --- | --- | --- | --- |
| Permisos | Tabiques no soportantes dentro de vivienda, cierros, obras de mantención y «elementos exteriores sobrepuestos sin cimientos»: **sin permiso** (art. 5.1.2) | ✅ texto oficial | OGUC, BCN |
| Permisos | Ampliaciones **hasta 100 m²** son «obra menor»: permiso DOM con arquitecto, plano 1:50 y especificaciones, plazo 15 días (arts. 1.1.2 y 5.1.4) | ✅ texto oficial | OGUC, BCN |
| Permisos | El texto vigente del 5.1.2 **ya no menciona «cobertizos»** (resúmenes en internet aún lo dicen): una bodega de jardín se trata como ampliación | ✅ texto oficial / ❗ contradice a Modulor | OGUC, BCN |
| Barandas | Bordes a más de 1 m del suelo: baranda ≥ **0,95 m**, resiste **50 kg/m**, sin huecos que dejen pasar una esfera de **12,5 cm**; en escaleras ≥ 0,85 m (art. 4.2.7) | ✅ texto oficial | OGUC, BCN |
| Escaleras | Huella ≥ **28 cm**, contrahuella **13–18 cm** (vías de evacuación) | ✅ texto oficial | OGUC, BCN |
| Camarotes | Baranda superior ≥ **130 mm** sobre el colchón, dos barandas (la del muro continua), ninguna abertura que deje pasar una esfera de **230 mm** | ✅ texto oficial (norma de EE.UU.; Chile no tiene una propia pública) | 16 CFR 1513 |
| Deck | Apoyos de las tablas cada **≤ 41 cm**, junta **≥ 5 mm**, voladizo ≤ 30 cm, tornillo galvanizado 3½", protector con tinte (no barniz) | ⚠️ una fuente (fabricante) | Arauco |
| Tabiques | Pies derechos a **40 o 60 cm**, cadenetas cada **60 cm**, tornillo 6×1¼" | ⚠️ fabricante | Volcán |
| Melamina | Formato **2,50 × 1,83 m** (15–18 mm), sierra de 60 dientes, perforar antes de atornillar, sellar todos los cantos | ✅ ficha + 3 tiendas | Arauco Vesto |
| Camas | 1 plaza 90×190 · 1½ 105×190 · 2 plazas 150×190 · queen 160×200 · king 180×200 · super king 200×200 cm | ⚠️ retail; varía por fabricante | Falabella |
| Medidas reales de pino | 1x2 = 19×41 · 1x4 = 19×90 · 2x2 = 41×41 · 2x3 = 41×65 · 2x4 = 41×90 mm (cepillado); impregnado 2x4 = 48×98; deck 1½x5 = 38×123 | ✅ fichas de producto | Sodimac |
| Cocina | Cubierta 85–95 cm, fondo base 60 cm, aéreo 30–35 cm; anchos 60/80/100/120 cm | ⚠️ guías de retail | Obramat, Lider |
| Ergonomía | Mesa 75–76 cm con sillas de 45–48 cm; escritorio 73–76 cm | ⚠️ divulgativa | Chócale |
| Repisas | Más de ~80 cm en 15–18 mm se flectan con carga: limitar o reforzar el canto | ⚠️ experiencia de talleres | WoodWeb, Sagulator |
| Exterior | Madera impregnada según riesgo NCh 819: R3 sobre suelo, R4 en contacto con suelo | ⚠️ secundaria | Madera UC |

## Etapa 2 — Precios reales

**Método.** Se consultaron los buscadores públicos de **Sodimac** (API JSON), **Easy** (datos de la página) e **Imperial** (API Endeca) el 26-10-2026, 79 ítems, ~7.600 resultados. Cada ítem tiene reglas para comparar productos equivalentes (espesor, formato, sección, envase de hogar). Precios en CLP con IVA, precio normal; las ofertas se guardan aparte. En Easy el precio es el de la zona por defecto.

**Confianza:** 38 ítems ✅ confirmados (2–3 tiendas dentro de ±30 %), 34 variables (2–3 tiendas con diferencias por marca o envase), 4 con una sola tienda, 3 sin datos.

### Tableros (plancha)

| Ítem | Sodimac | Easy | Imperial |
| --- | ---: | ---: | ---: |
| Melamina blanca 15 mm (183×250) | 36.550 | 36.550 | 36.550 (Vesto) · 35.490 (Swed 183×244) |
| Melamina blanca 18 mm | 48.990 | 48.990 | 46.310 |
| Melamina color madera 18 mm | 52.990 | — | 57.300 |
| MDF 3 mm (152×244) | 9.290 | — | 7.340 |
| MDF 18 mm | 38.990 (152×244) | — | 24.390 (122×244) |
| Terciado estructural 15 mm | 19.850 | 19.850 | — |
| OSB 11,1 mm | 14.590 | 14.590 | — |
| Volcanita 10 mm (120×240) | 7.100 | 6.450 | — |

### Madera (pieza 3,2 m)

| Ítem | Sodimac | Easy | Imperial |
| --- | ---: | ---: | ---: |
| Pino cepillado 1x4 | 2.650 | 2.640 | 2.640 |
| Pino cepillado 2x2 | 2.650 | 2.630 | 2.630 |
| Pino cepillado 2x4 | 5.290 | 5.250 | 5.250 |
| Pino cepillado 2x6 | 8.290 | 8.290 | 7.990 |
| Pino impregnado 2x4 | 6.295 | 5.890 | 6.480 |
| Pino dimensionado 2x3 (tabique) | 3.675 | 2.770 | 2.660 |
| Tabla deck 1½x5 | 6.490 | — | 7.370 |

### Herrajes (formato hogar)

| Ítem | Sodimac | Easy | Imperial |
| --- | ---: | ---: | ---: |
| Bisagra cazoleta 35 mm | 1.790 (par) | 1.790 (par) | 2.990 (10 u) |
| Corredera telescópica 35 cm | 4.690 | 5.090 | 3.990 |
| Corredera telescópica 45 cm | 4.990 | 5.690 | 5.190 |
| Tirador 96 mm | 750 | 650 | 890 |
| Tornillo aglomerado 4×50 | — | 4.990 (144 u) | 1.290 (100 u) |
| Tapacanto PVC blanco 22 mm | 3.190 (25 m) | 2.250 (10 m) | — |
| Cola fría 250 g | 4.790 | 3.990 | 3.990 |

### Herramientas (tres gamas)

| Herramienta | Económica | Media | Premium |
| --- | --- | --- | --- |
| Taladro atornillador | $54.900 Einhell 18V (Easy) | $139.990 Bosch 12V 2 bat. (Easy) | $189.990 DeWalt 20V 2 bat. (Sodimac) |
| Sierra circular 7¼" | $39.493 Black+Decker (Sodimac) | $107.196 Ubermann | $130.790 Makita |
| Sierra caladora | $26.990 Lumax (Easy) | $89.990 Einhell | $109.990 DeWalt |
| Ingletadora 10" | $199.990 Total (Imperial) | $340.190 Stanley | $424.750 Bosch |
| Lijadora orbital | $26.054 Black+Decker (Imperial) | $62.300 Total | $66.560 Bosch |
| Broca Forstner 35 mm | $4.490 Total (Easy) | $10.990 KWB | $12.990 Makita |
| Prensa sargento | $4.990 Robust (Easy) | $14.990 KWB | $53.990 Total 1 m |

Todos los enlaces, SKU y alternativas están en el JSON/CSV y en `carpinteria.precios_tiendas`.

### Hallazgos de mercado

- **Las grandes tiendas igualan precios** en tableros y pino (diferencias de $0 a $300): el valor para el cliente no está en «dónde es más barato» sino en **cuánto comprar** (optimización de cortes) y en el **dimensionado**.
- **Imperial es claramente más barata en herrajes de mueblería** (bisagras, correderas, tornillos en bolsa de 100, soportes) y en MDF crudo (hasta 37 % menos); Sodimac/Easy compiten en tableros, pino y herramientas.
- **Planchas casi vacías:** en el mueble TV la segunda plancha de melamina queda usada al 1,9 %. Ofrecer «media plancha» o dimensionado ahorra plata real y es un argumento de venta.

## Evidencia en contra y matices

- Modulor y otros resúmenes dicen que los «cobertizos ligeros» no requieren permiso; el **texto vigente de la OGUC (con D.10 de 2026) ya no lo dice**. Se siguió el texto oficial.
- La norma de camarotes usada es de EE.UU. (16 CFR 1513); la europea EN 747-1:2024 es de pago y no se pudo leer. No se encontró norma chilena pública.
- Las medidas de queen varían entre fabricantes (150×190 vs 160×200).
- Las fuentes de medidas de sofás son divulgativas (confianza baja).
- Las correderas se venden como «C/U» o «unidad» pero suelen ser el juego (par): **a confirmar en tienda**.
- El clavo se vende por kilo; los ~500 clavos por ½ kg son una estimación.

## Vacíos

| Vacío | Por qué | Cómo cerrarlo |
| --- | --- | --- |
| Construmart | Muestra «sin stock» y pide elegir tienda para ver precios | Repetir con navegador eligiendo sucursal |
| MTS | Bloquea consultas automáticas (Cloudflare) | Cotizar manualmente o pedir lista de precios |
| Chilemat | Red de ferreterías sin tienda en línea | Contactar ferreterías asociadas |
| Pino impregnado 4x4, tornillo confirmat, plantilla Kreg | No los venden en línea Sodimac, Easy ni Imperial | Distribuidoras de herrajes, Mercado Libre (su API bloquea consultas sin autorización) |
| Luces de vigas para pérgola/deck en pino radiata | No hay tabla chilena pública para hogar | Calculista o NCh 1198; limitar luces en la app |
| Precio de fabricación de De Todito y Molina | Es información interna | Pedirles su factor real y cargarlo en `carpinteria.tiendas` |

## Recomendación y siguientes pasos

1. **Implementar primero los 13 proyectos de prioridad 1 con los motores actuales** (cama, camarote, cómoda, cocina, escritorio, mesas, estantería, jardinera, picnic).
2. **Construir el módulo «exterior»** (deck y pérgola: apoyos, vigas, tablas con junta) y el **módulo «entramado»** (tabique por m², pies derechos a 40/60, placas 120×240), porque abren los proyectos de mayor ticket.
3. **Repetir la cotización cada mes** con `scripts/precios` y publicar la fecha de actualización en la app.
4. **Agregar «comprar dimensionado» y «media plancha»** cuando una plancha queda poco usada.
5. **Proyectos con permiso (bodega, habitación, altillo):** la app entrega despiece y presupuesto y deriva a arquitecto/tienda; es un canal de venta, no un plano para construir sin permiso.

## Fuentes

- OGUC, texto vigente: [BCN LeyChile, idNorma 8201](https://www.bcn.cl/leychile/navegar?idNorma=8201) — arts. 1.1.2, 4.2.7, 5.1.2, 5.1.4 (consultado 26-10-2026)
- [16 CFR 1513, ed. 2023 (govinfo)](https://www.govinfo.gov/content/pkg/CFR-2023-title16-vol2/pdf/CFR-2023-title16-vol2-part1513.pdf)
- [Arauco — Recomendaciones Deck](https://arauco-qas.arauco.com/chile/wp-content/uploads/sites/14/2018/03/RECOMENDACIONES-DECK-.pdf)
- [Arauco — Ficha Melamina Vesto Chile](https://arauco.com/chile/wp-content/uploads/sites/14/2018/10/2172_FICHA_WEB_MELAMINA_VESTO_CHILE_10Sep_18_E01.pdf)
- [Volcán — Ficha Volcanita ST 2025](https://volcan.cl/wp-content/uploads/2022/03/FT-VOLCANITA-ST_2025-V1.pdf)
- [LP Chile — Ficha OSB](https://lpchile.cl/wp-content/uploads/2017/01/20241028-Ficha-OSB-Pais.pdf)
- [Modulor — escuadrías de madera](https://modulor.cl/materiales/madera/)
- [Falabella — tamaños de camas](https://www.falabella.com/falabella-cl/page/como-elegir-el-tamano-de-cama-ideal)
- [Madera UC — madera impregnada (NCh 819)](https://madera.uc.cl/images/Ciclo_de_vida_de_la_madera/madera-impregnada.pdf)
- [WoodWeb — luces de repisas](https://woodweb.com/knowledge_base/Free_Span_Limits_of_Cabinet_Shelving.html) · [Sagulator](https://woodbin.com/calcs/sagulator/)
- [Obramat — medidas de cocina](https://www.obramat.es/asesoramiento-profesional/consejos-y-guias-de-instalacion/recomendaciones-pro/guia-de-medidas-para-crear-una-cocina-funcional-y-espaciosa.html) · [Planner 5D — vestidores](https://planner5d.com/blog/es/vestidor-a-medida/) · [Chócale — mesas y sillas](https://chocale.cl/2026/09/como-combinar-mesas-y-sillas-de-comedor-diferentes/)
- Tiendas (26-10-2026): [sodimac.cl](https://www.sodimac.cl), [easy.cl](https://www.easy.cl), [imperial.cl](https://www.imperial.cl); enlace de cada producto en el CSV.
