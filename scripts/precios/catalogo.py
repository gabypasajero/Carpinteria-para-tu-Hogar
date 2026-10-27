"""Catálogo de proyectos de carpintería para la app (Etapa 1 de la investigación).

Cada proyecto lista: parámetros editables, piezas (descripción paramétrica), materiales y herrajes
(ids de precios_reales.json), herramientas, reglas técnicas con su fuente, permiso y motor de la app.

Motores:
  caja         muebles de tablero (melamina, MDF, terciado): el motor actual de la app.
  liston       estructuras de listones de pino: el motor actual (como la banca).
  exterior     estructuras exteriores con apoyos al suelo (deck, pérgola): requiere módulo nuevo de apoyos y grillas.
  entramado    tabiques, muros y recintos con pies derechos y placas: requiere módulo nuevo por m² y distanciamientos.
"""
import json

# Fuentes (se citan por clave en cada regla).
F = {
    'camas': ('Falabella: tamaños de camas en Chile', 'https://www.falabella.com/falabella-cl/page/como-elegir-el-tamano-de-cama-ideal'),
    'cfr1513': ('16 CFR 1513 (CPSC, EE.UU.): requisitos de camarotes, ed. 2023', 'https://www.govinfo.gov/content/pkg/CFR-2023-title16-vol2/pdf/CFR-2023-title16-vol2-part1513.pdf'),
    'oguc': ('OGUC (texto vigente BCN, incl. D.10 de 2026): arts. 1.1.2, 4.2.7, 5.1.2, 5.1.4', 'https://www.bcn.cl/leychile/navegar?idNorma=8201'),
    'arauco_deck': ('Arauco: Recomendaciones Deck (PDF)', 'https://arauco-qas.arauco.com/chile/wp-content/uploads/sites/14/2018/03/RECOMENDACIONES-DECK-.pdf'),
    'vesto': ('Arauco: Ficha técnica Melamina Vesto Chile', 'https://arauco.com/chile/wp-content/uploads/sites/14/2018/10/2172_FICHA_WEB_MELAMINA_VESTO_CHILE_10Sep_18_E01.pdf'),
    'volcan': ('Volcán: Ficha técnica Volcanita ST 2025', 'https://volcan.cl/wp-content/uploads/2022/03/FT-VOLCANITA-ST_2025-V1.pdf'),
    'lp_osb': ('LP Chile: Ficha OSB', 'https://lpchile.cl/wp-content/uploads/2017/01/20241028-Ficha-OSB-Pais.pdf'),
    'modulor': ('Modulor: escuadrías de madera en Chile (NCh1198)', 'https://modulor.cl/materiales/madera/'),
    'sagulator': ('Woodbin Sagulator: flecha admisible en repisas', 'https://woodbin.com/calcs/sagulator/'),
    'woodweb': ('WoodWeb: luces libres de repisas (experiencia de talleres)', 'https://woodweb.com/knowledge_base/Free_Span_Limits_of_Cabinet_Shelving.html'),
    'cocina': ('Obramat / Planner 5D / HomeCenter / Lider: medidas de muebles de cocina', 'https://www.obramat.es/asesoramiento-profesional/consejos-y-guias-de-instalacion/recomendaciones-pro/guia-de-medidas-para-crear-una-cocina-funcional-y-espaciosa.html'),
    'closet': ('Planner 5D: medidas de vestidores y clósets', 'https://planner5d.com/blog/es/vestidor-a-medida/'),
    'ergonomia': ('Chócale: altura de mesa de comedor y silla', 'https://chocale.cl/2026/09/como-combinar-mesas-y-sillas-de-comedor-diferentes/'),
    'nch819': ('Madera UC: madera impregnada y NCh 819 (riesgos R1–R4)', 'https://madera.uc.cl/images/Ciclo_de_vida_de_la_madera/madera-impregnada.pdf'),
    'sofa': ('Medidas generales de sofás (fuente divulgativa, confianza baja)', 'https://todosloshechos.es/cual-es-la-altura-maxima-de-un-sofa'),
    'sodimac_fichas': ('Fichas de producto Sodimac (medidas reales de pino)', 'https://www.sodimac.cl'),
}

P = []


def proyecto(id, nombre, cat, dif, motor, prioridad, params, piezas, materiales, herrajes, herramientas, reglas=(), permiso=None, estado='propuesto', nota=None):
    P.append(dict(id=id, nombre=nombre, categoria=cat, dificultad=dif, motor=motor, prioridad=prioridad, estado=estado,
                  parametros=params, piezas=piezas, materiales=materiales, herrajes=herrajes,
                  herramientas=herramientas, reglas=[{'texto': t, 'fuente': f} for t, f in reglas], permiso=permiso, nota=nota))


BASICAS = ['huincha', 'escuadrac', 'taladro', 'brocas', 'martillo']
MUEBLE = BASICAS + ['pistolacal']
CORTE_LISTON = ['serrucho', 'ingletadora', 'circular']

# ---------------------------------------------------------------- Dormitorio
proyecto('cama', 'Cama base con respaldo (1 plaza a super king)', 'dormitorio', 2, 'liston', 1,
         ['tamaño (1 plaza, 1½, 2 plazas, queen, king, super king)', 'alto del somier (cm)', 'alto del respaldo (cm)', 'con o sin cajones'],
         ['4 patas 2x3 o 2x4', '2 largueros 1x6 o 2x6', '2 cabeceras 1x6', 'listones de somier 1x3 cada 7 cm', 'travesaño central con pata (desde 2 plazas)', 'respaldo de tablas o terciado'],
         ['pc2x3', 'pc2x4', 'pc1x6', 'pc1x3', 'terc15'], ['t4x50', 'escuadra', 'perno', 'cola'], BASICAS + CORTE_LISTON + ['lijadora', 'prensa'],
         [('Medidas de colchón: 1 plaza 90×190, 1½ 105×190, 2 plazas 150×190, queen 160×200, king 180×200, super king 200×200 cm', 'camas'),
          ('Desde 150 cm de ancho agregar travesaño central con pata al piso', 'woodweb')])
proyecto('camarote', 'Camarote (litera) 1 plaza', 'dormitorio', 3, 'liston', 1,
         ['tamaño de colchón', 'alto entre camas (cm)', 'escalera lateral o frontal'],
         ['4 pilares 2x4', 'largueros y cabeceras 2x6 por nivel', 'somieres de listones 1x3', 'barandas continuas 1x4 en ambos lados del nivel superior', 'escalera con peldaños 1x4'],
         ['pc2x4', 'pc2x6', 'pc1x4', 'pc1x3'], ['perno', 't4x50', 'escuadra', 'cola'], BASICAS + CORTE_LISTON + ['lijadora', 'prensa', 'nivel'],
         [('Baranda del nivel superior: su borde al menos 130 mm (5") sobre el colchón; dos barandas, la del lado del muro continua', 'cfr1513'),
          ('Ninguna abertura de la estructura del nivel superior puede dejar pasar una esfera de 230 mm (9")', 'cfr1513'),
          ('La app debe fijar el grosor máximo de colchón para garantizar la altura de baranda', 'cfr1513')],
         nota='Proyecto de riesgo: incluir advertencia y prohibir su uso por menores de 6 años en el nivel superior.')
proyecto('cama_alta', 'Cama alta con escritorio debajo (loft)', 'dormitorio', 3, 'liston', 2,
         ['tamaño de colchón', 'alto libre bajo la cama (cm)', 'ancho del escritorio'],
         ['estructura de camarote sin cama inferior', 'cubierta de escritorio en terciado o melamina', 'baranda perimetral y escalera'],
         ['pc2x4', 'pc2x6', 'pc1x4', 'terc18'], ['perno', 't4x50', 'escuadra'], BASICAS + CORTE_LISTON + ['lijadora', 'nivel'],
         [('Mismas reglas de baranda que el camarote', 'cfr1513'), ('Escritorio a 73–76 cm de alto', 'ergonomia')])
proyecto('cama_nido', 'Cama con cajones bajo el somier', 'dormitorio', 2, 'caja', 2,
         ['tamaño de colchón', 'número de cajones (2–4)'], ['cajonera de melamina bajo el somier', 'cajones sobre correderas o ruedas', 'somier de terciado o listones'],
         ['mel18', 'hdf3', 'terc12', 'pc1x3'], ['corr45', 'rueda', 't4x40', 'tirador', 'tapacanto'], MUEBLE + ['circular'],
         [('Medidas de colchón estándar en Chile', 'camas')])
proyecto('velador', 'Velador con cajones', 'dormitorio', 2, 'caja', 1, ['ancho', 'alto', 'fondo', 'cajones (1–3)'],
         ['laterales, base, cubierta, zócalo', 'respaldo HDF 3 mm', 'cajas de cajón y frentes'], ['mel15', 'hdf3'],
         ['corr35', 'corr45', 'tirador', 't4x40', 't35x16', 'clavo1', 'tapacanto'], MUEBLE, estado='en_app')
proyecto('comoda', 'Cómoda / cajonera', 'dormitorio', 2, 'caja', 1, ['ancho', 'alto', 'fondo', 'columnas (1–2)', 'cajones por columna'],
         ['cuerpo de melamina 15/18 mm', 'cajones con fondo HDF', 'cubierta 18 mm'], ['mel15', 'mel18', 'hdf3'],
         ['corr45', 'tirador', 't4x40', 't35x16', 'clavo1', 'tapacanto'], MUEBLE,
         [('Más de 1 m de alto: fijar al muro (riesgo de volcamiento)', 'oguc')])
proyecto('closet', 'Closet dos puertas', 'dormitorio', 3, 'caja', 1, ['ancho', 'alto', 'fondo', 'repisas'],
         ['laterales, techo, base, división', 'repisas, maletero y barra', 'puertas con bisagras cazoleta'], ['mel15', 'hdf3'],
         ['bisagra', 'barra', 'soporte', 'tirador', 't4x40', 'clavo1', 'tapacanto'], MUEBLE + ['forstner', 'nivel'],
         [('Fondo para colgar 55–60 cm', 'closet'), ('Barra a 160–170 cm para ropa larga; 90–110 cm para camisas en doble barra', 'closet')], estado='en_app')
proyecto('closet_abierto', 'Closet abierto modular (vestidor)', 'dormitorio', 2, 'caja', 2, ['ancho total', 'alto', 'módulos (repisas, barra, cajones)'],
         ['módulos verticales de melamina', 'repisas regulables', 'barras de colgar', 'cajonera opcional'], ['mel18', 'hdf3'],
         ['barra', 'soporte', 'corr45', 't4x40', 'tapacanto'], MUEBLE, [('Fondo 55–60 cm para colgar', 'closet')])
proyecto('respaldo', 'Respaldo de cama (cabecera) de muro', 'dormitorio', 1, 'caja', 2, ['tamaño de cama', 'alto', 'estilo (liso, ranurado, tablas)'],
         ['panel de terciado o MDF', 'listones de pino de bastidor', 'colgadores al muro'], ['terc15', 'mdf15', 'pc1x3'], ['t4x40', 'escuadra'], BASICAS + ['caladora', 'lijadora'],
         [('Ancho = ancho del colchón + 10 a 20 cm', 'camas')])
proyecto('zapatero', 'Zapatero', 'dormitorio', 1, 'caja', 2, ['ancho', 'alto', 'fondo', 'niveles'], ['laterales', 'repisas inclinadas o rectas', 'respaldo'],
         ['mel15', 'hdf3'], ['t4x40', 'clavo1', 'tapacanto'], MUEBLE)
proyecto('tocador', 'Tocador / peinador con espejo', 'dormitorio', 2, 'caja', 3, ['ancho', 'alto', 'cajones'], ['cubierta 18 mm', 'cajonera', 'marco de espejo'],
         ['mel18', 'hdf3'], ['corr35', 'tirador', 't4x40', 'tapacanto'], MUEBLE, [('Cubierta a 73–76 cm', 'ergonomia')])

# ---------------------------------------------------------------- Living
proyecto('mueble_tv', 'Mueble TV', 'living', 2, 'caja', 1, ['ancho', 'alto', 'fondo'], ['cuerpo, divisiones, repisas', 'puertas'], ['mel18c', 'hdf3'],
         ['bisagra', 'tirador', 'soporte', 't4x40', 't35x16', 'clavo1', 'tapacanto'], MUEBLE + ['forstner'], estado='en_app')
proyecto('mesa_centro', 'Mesa de centro', 'living', 1, 'liston', 1, ['largo', 'ancho', 'alto', 'con repisa inferior'],
         ['cubierta de tablas 1x5 o terciado', '4 patas 2x2 o 2x3', 'faldones 1x4', 'repisa inferior opcional'], ['pc1x5', 'pc2x3', 'pc1x4', 'terc18'],
         ['t4x50', 'cola', 'lija120', 'barniz'], BASICAS + CORTE_LISTON + ['lijadora', 'prensa'], [('Alto similar al asiento del sofá: ~45 cm', 'sofa')])
proyecto('mesa_lateral', 'Mesa lateral / arrimo', 'living', 1, 'liston', 2, ['largo', 'ancho', 'alto'], ['cubierta', 'patas', 'faldones'],
         ['pc1x5', 'pc2x2', 'pc1x4'], ['t4x50', 'cola', 'lija120', 'barniz'], BASICAS + CORTE_LISTON + ['lijadora'])
proyecto('repisa', 'Repisa librero', 'living', 1, 'caja', 1, ['ancho', 'alto', 'fondo', 'repisas'], ['laterales, base, techo', 'repisas regulables', 'respaldo'],
         ['mel15', 'hdf3'], ['soporte', 't4x40', 'clavo1', 'tapacanto'], MUEBLE,
         [('Repisas de 15–18 mm de más de ~80 cm se flectan con libros: limitar luz o reforzar canto frontal', 'woodweb'),
          ('Flecha admisible orientativa: 0,02" por pie de luz (≈1,7 mm por metro)', 'sagulator')], estado='en_app')
proyecto('repisa_flotante', 'Repisa flotante de muro', 'living', 1, 'caja', 1, ['largo', 'fondo', 'espesor visible'],
         ['caja hueca de MDF/terciado', 'bastidor oculto de pino atornillado al muro'], ['mdf15', 'pc1x2', 'pc2x2'], ['t4x50', 'cola'], BASICAS + ['circular', 'lijadora', 'nivel'],
         [('Anclar el bastidor a pies derechos o con tarugos adecuados al muro', 'volcan')])
proyecto('sofa_2x4', 'Sofá / sillón de madera (interior o terraza)', 'living', 2, 'liston', 2, ['largo (plazas)', 'fondo de asiento', 'alto de asiento'],
         ['estructura 2x4 y 2x6', 'asiento de tablas 1x4 o terciado', 'respaldo inclinado', 'cojines de espuma (aparte)'], ['pc2x4', 'pc2x6', 'pc1x4', 'terc15'],
         ['t4x50', 'tdeck', 'cola', 'lija120', 'barniz'], BASICAS + CORTE_LISTON + ['lijadora', 'prensa'],
         [('Asiento 41–44 cm de alto; 2 plazas 140–180 cm, 3 plazas 180–240 cm (confianza baja: fuente divulgativa)', 'sofa')])
proyecto('panel_ranurado', 'Revestimiento de muro ranurado o de listones', 'living', 1, 'entramado', 2, ['ancho del muro', 'alto', 'separación de listones'],
         ['listones 1x2 sobre fondo de MDF pintado', 'o paneles ranurados'], ['pc1x2', 'mdf9'], ['t4x40', 'cola', 'tvolc'], BASICAS + ['ingletadora', 'nivel', 'pistolacal'])

# ---------------------------------------------------------------- Comedor y cocina
proyecto('mesa_comedor', 'Mesa de comedor de pino', 'cocina', 2, 'liston', 1, ['largo (4–10 personas)', 'ancho', 'alto'],
         ['cubierta de tablas 2x6 o 1x6 encoladas', '4 patas 2x4 o 4x4 laminadas', 'faldones 1x4', 'travesaños'], ['pc2x6', 'pc1x6', 'pc2x4', 'pc1x4'],
         ['t4x50', 'cola', 'lija120', 'barniz'], BASICAS + CORTE_LISTON + ['lijadora', 'prensa'], [('Alto de mesa 75–76 cm con sillas de 45–48 cm', 'ergonomia')])
proyecto('banca', 'Banca de pino', 'cocina', 1, 'liston', 1, ['largo', 'alto', 'fondo'], ['patas 2x2', 'travesaños 1x4', 'tablas de asiento 1x4'],
         ['pc2x2', 'pc1x4'], ['t4x50', 'cola', 'lija120', 'barniz'], BASICAS + CORTE_LISTON + ['lijadora'], [('Asiento a 45–48 cm', 'ergonomia')], estado='en_app')
proyecto('silla', 'Silla de comedor', 'cocina', 3, 'liston', 3, ['alto de asiento', 'ancho'], ['patas traseras con respaldo', 'patas delanteras', 'travesaños', 'asiento'],
         ['pc2x2', 'pc1x4', 'terc12'], ['t4x50', 'tarugo8', 'cola', 'lija120', 'barniz'], BASICAS + ['ingletadora', 'caladora', 'lijadora', 'prensa'],
         [('Asiento a 45–48 cm', 'ergonomia')], nota='Uniones angulares exigentes: recomendable solo con ingletadora y prensas.')
proyecto('cocina_base', 'Mueble base de cocina (módulo)', 'cocina', 2, 'caja', 1, ['ancho (60/80/100/120)', 'puertas o cajones'],
         ['laterales, base, travesaños', 'zócalo', 'puertas o cajones', 'cubierta aparte (postformado o cuarzo)'], ['mel18', 'hdf3'],
         ['bisagra', 'corr45', 'tirador', 't4x40', 't35x16', 'tapacanto'], MUEBLE + ['forstner', 'nivel'],
         [('Altura de cubierta 85–95 cm (≈90), fondo 60 cm', 'cocina'), ('Anchos estándar de módulos en Chile: 60, 80, 100 y 120 cm', 'cocina')])
proyecto('cocina_aereo', 'Mueble aéreo de cocina (módulo)', 'cocina', 2, 'caja', 1, ['ancho', 'alto (60/70)', 'puertas'], ['cuerpo', 'repisa', 'puertas', 'colgador'],
         ['mel15', 'hdf3'], ['bisagra', 'soporte', 'tirador', 't4x40', 'tapacanto'], MUEBLE + ['forstner', 'nivel'],
         [('Fondo 30–35 cm; base a 45–60 cm sobre la cubierta', 'cocina')])
proyecto('despensa', 'Despensa / alacena alta', 'cocina', 2, 'caja', 2, ['ancho', 'alto', 'fondo', 'repisas'], ['cuerpo alto', 'repisas regulables', 'puertas'],
         ['mel18', 'hdf3'], ['bisagra', 'soporte', 'tirador', 't4x40', 'tapacanto'], MUEBLE + ['forstner'], [('Fijar al muro', 'oguc')])
proyecto('isla', 'Isla o desayunador', 'cocina', 2, 'caja', 3, ['largo', 'ancho', 'alto (90 o barra 105)'], ['módulos base', 'cubierta con voladizo', 'pies de apoyo'],
         ['mel18', 'pc2x2'], ['bisagra', 'tirador', 't4x40', 'tapacanto'], MUEBLE, [('Cubierta a ~90 cm', 'cocina')])
proyecto('especiero', 'Especiero / repisa de cocina', 'cocina', 1, 'liston', 2, ['ancho', 'alto', 'niveles'], ['laterales 1x4', 'repisas 1x3', 'topes'], ['pc1x4', 'pc1x3'],
         ['t4x40', 'cola', 'lija120'], BASICAS + ['serrucho', 'lijadora'])

# ---------------------------------------------------------------- Baño
proyecto('vanitorio', 'Mueble vanitorio', 'baño', 2, 'caja', 2, ['ancho', 'alto', 'fondo', 'puertas o cajones'], ['cuerpo con perforación para desagüe', 'puertas', 'patas o zócalo'],
         ['mel18', 'hdf3'], ['bisagra', 'tirador', 't4x40', 'tapacanto'], MUEBLE + ['forstner', 'caladora'],
         [('Melamina es de uso interior: sellar todos los cantos y no apoyar el tablero directo en el piso húmedo', 'vesto')])
proyecto('repisa_wc', 'Repisa sobre WC', 'baño', 1, 'caja', 2, ['ancho', 'alto', 'niveles'], ['laterales altos', 'repisas'], ['mel15'], ['t4x40', 'tapacanto'], MUEBLE,
         [('Sellar cantos por humedad', 'vesto')])
proyecto('toallero', 'Toallero escalera', 'baño', 1, 'liston', 3, ['alto', 'ancho', 'peldaños'], ['2 largueros 1x3', 'peldaños 1x2 o tarugo'], ['pc1x3', 'pc1x2'],
         ['t4x40', 'tarugo8', 'cola', 'barniz'], BASICAS + ['serrucho', 'lijadora'])

# ---------------------------------------------------------------- Oficina y estudio
proyecto('escritorio', 'Escritorio', 'oficina', 1, 'caja', 1, ['largo', 'fondo', 'alto', 'con cajonera'], ['cubierta 18 mm', 'laterales o patas', 'faldón trasero', 'cajonera opcional'],
         ['mel18', 'hdf3'], ['corr45', 'tirador', 't4x40', 'tapacanto'], MUEBLE, [('Alto 73–76 cm', 'ergonomia')])
proyecto('escritorio_muro', 'Escritorio plegable de muro', 'oficina', 2, 'caja', 2, ['ancho', 'fondo'], ['caja de muro', 'tapa abatible', 'patas plegables o cadenas'],
         ['terc15', 'pc2x2'], ['bisagra', 'escuadra', 't4x40'], MUEBLE + ['nivel'], [('Alto de trabajo 73–76 cm', 'ergonomia')])
proyecto('estanteria', 'Estantería modular de pino', 'oficina', 1, 'liston', 1, ['ancho', 'alto', 'fondo', 'niveles'], ['pilares 2x2', 'repisas 1x6', 'diagonales'],
         ['pc2x2', 'pc1x6', 'pc1x2'], ['t4x50', 'escuadra'], BASICAS + CORTE_LISTON, [('Más de 1,5 m: fijar al muro', 'oguc')])
proyecto('banco_trabajo', 'Banco de trabajo (taller)', 'oficina', 2, 'liston', 1, ['largo', 'ancho', 'alto'], ['patas 2x4', 'bastidores 2x4', 'cubierta terciado 18', 'repisa inferior OSB'],
         ['pc2x4', 'terc18', 'osb15'], ['t4x50', 'perno', 'cola'], BASICAS + CORTE_LISTON + ['nivel'], [('Alto típico 85–95 cm según usuario', 'cocina')])

# ---------------------------------------------------------------- Infantil
proyecto('casita_juego', 'Casita de juego infantil (exterior)', 'infantil', 3, 'exterior', 2, ['largo', 'ancho', 'alto', 'con terraza'],
         ['piso de OSB o tablas sobre polines', 'muros de entramado 2x2 o 2x3 con machihembrado', 'techo de dos aguas', 'barandas'],
         ['pi2x3', 'pi2x2', 'machi', 'osb11', 'polin'], ['tdeck', 'clavo3', 'escuadra', 'protdeck'], BASICAS + CORTE_LISTON + ['nivel', 'caladora'],
         [('Juegos infantiles en áreas verdes figuran entre las obras sin permiso (art. 5.1.2 n.° 11); en predio privado consultar DOM', 'oguc'),
          ('Si la terraza supera 1 m de altura: baranda ≥ 0,95 m, sin huecos de más de 12,5 cm', 'oguc'),
          ('Madera en exterior: impregnada para riesgo R3 (R4 si toca suelo)', 'nch819')])
proyecto('mesa_infantil', 'Mesa y sillas infantiles', 'infantil', 1, 'liston', 2, ['edad (alto de mesa 45–55)'], ['cubierta terciado', 'patas 2x2', 'sillas simples'],
         ['terc15', 'pc2x2', 'pc1x3'], ['t4x50', 'cola', 'lija120'], BASICAS + ['serrucho', 'lijadora'], nota='Cantos redondeados y pintura no tóxica.')
proyecto('baul', 'Baúl / juguetero', 'infantil', 1, 'caja', 2, ['largo', 'ancho', 'alto'], ['caja de terciado', 'tapa con bisagras con freno'],
         ['terc12', 'pc1x2'], ['t4x40', 'cola'], BASICAS + ['circular', 'lijadora'], nota='Usar bisagra con retenedor de tapa (evita golpes).')
proyecto('cama_montessori', 'Cama casita Montessori (a ras de piso)', 'infantil', 2, 'liston', 2, ['tamaño de colchón'], ['marco de casita 2x2', 'base a ras de piso'],
         ['pc2x2', 'pc1x4'], ['t4x50', 'cola', 'lija120'], BASICAS + CORTE_LISTON + ['lijadora'], [('Colchón 1 plaza 90×190', 'camas')])
proyecto('torre_aprendizaje', 'Torre de aprendizaje', 'infantil', 2, 'caja', 3, ['alto de plataforma'], ['laterales de terciado', 'plataforma regulable', 'barandas'],
         ['terc18'], ['t4x40', 'cola'], BASICAS + ['caladora', 'lijadora'], nota='Producto de seguridad infantil: recomendar diseño probado y advertencias.')

# ---------------------------------------------------------------- Organización
proyecto('perchero', 'Perchero con banca de entrada', 'organización', 1, 'liston', 2, ['ancho', 'alto'], ['banca', 'panel con colgadores', 'repisa superior'],
         ['pc1x4', 'pc2x2', 'terc15'], ['t4x50', 'cola'], BASICAS + CORTE_LISTON + ['lijadora'])
proyecto('lavadero', 'Mueble de lavadero sobre lavadora', 'organización', 1, 'caja', 2, ['ancho', 'alto', 'fondo'], ['laterales altos', 'repisas', 'puertas opcionales'],
         ['mel18', 'hdf3'], ['bisagra', 'soporte', 't4x40', 'tapacanto'], MUEBLE, [('Sellar cantos: zona húmeda', 'vesto')])
proyecto('panel_herramientas', 'Panel organizador de herramientas', 'organización', 1, 'caja', 3, ['ancho', 'alto'], ['panel de terciado/OSB', 'listones separadores', 'colgadores'],
         ['terc12', 'pc1x2'], ['t4x50'], BASICAS + ['nivel'])

# ---------------------------------------------------------------- Exterior y jardín
proyecto('deck', 'Deck / terraza de madera', 'exterior', 2, 'exterior', 1, ['largo', 'ancho', 'altura sobre el suelo', 'dirección de tablas'],
         ['apoyos: poyos de hormigón o polines', 'vigas 2x6 impregnadas', 'travesaños cada ≤ 41 cm', 'tablas de deck 1½x5 con junta ≥ 5 mm', 'baranda si supera 1 m de altura'],
         ['deck', 'pi2x6', 'pi2x4', 'polin'], ['tdeck', 'basepilar', 'protdeck'], BASICAS + ['circular', 'ingletadora', 'nivel'],
         [('Distancia máxima entre apoyos de las tablas: 41 cm', 'arauco_deck'), ('Separación entre tablas ≥ 5 mm; tablas sin volar más de 30 cm del último apoyo', 'arauco_deck'),
          ('Tornillos galvanizados 3½": 2 en los extremos, 1–2 en apoyos intermedios', 'arauco_deck'), ('No usar barnices que forman película; usar protector con tinte', 'arauco_deck'),
          ('Si queda a más de 1 m del suelo: baranda ≥ 0,95 m que resista 50 kg/m, sin huecos de más de 12,5 cm', 'oguc'),
          ('Madera impregnada R3 (sobre el suelo) o R4 (contacto con suelo) según NCh 819', 'nch819')],
         permiso='Deck apoyado sin cimientos: «elemento exterior sobrepuesto» sin permiso (5.1.2 n.° 2). Si lleva fundaciones o es una terraza elevada que amplía superficie: consultar DOM.')
proyecto('pergola', 'Pérgola de madera', 'exterior', 3, 'exterior', 1, ['largo', 'ancho', 'alto', 'separación de vigas'],
         ['pilares 4x4 (polín o pilar) con base metálica', 'vigas maestras 2x6', 'vigas secundarias 2x4 o 2x3', 'diagonales de arriostre'],
         ['polin', 'pi2x6', 'pi2x4', 'pi2x3'], ['basepilar', 'perno', 'tdeck', 'protdeck'], BASICAS + ['circular', 'ingletadora', 'nivel'],
         [('Madera exterior impregnada (R3; R4 en contacto con suelo)', 'nch819'), ('Pilar 4x4 cepillado ≈ 89×89 mm reales', 'sodimac_fichas')],
         permiso='Con fundaciones o cubierta cerrada suele requerir permiso: consultar DOM (art. 5.1.2 solo exime elementos sin cimientos).',
         nota='Luces de vigas no tienen tabla chilena pública para hogar: limitar luces conservadoras o derivar a calculista.')
proyecto('jardinera', 'Jardinera / huerto elevado', 'exterior', 1, 'liston', 1, ['largo', 'ancho', 'alto'], ['postes esquineros 2x2', 'tablas laterales 1x6 impregnadas', 'fondo de malla o abierto'],
         ['pi2x2', 'pc1x6'], ['tdeck', 'protdeck'], BASICAS + ['serrucho', 'circular'], [('Usar madera impregnada para contacto con tierra (R4)', 'nch819')])
proyecto('mesa_picnic', 'Mesa de picnic con bancas', 'exterior', 2, 'liston', 1, ['largo', 'puestos'], ['patas en X 2x6', 'cubierta y bancas de tablas 2x6', 'travesaños y diagonales'],
         ['pi2x6', 'pi2x4'], ['perno', 'tdeck', 'protdeck'], BASICAS + CORTE_LISTON, [('Mesa ~75 cm, bancas ~45 cm', 'ergonomia')])
proyecto('adirondack', 'Silla Adirondack', 'exterior', 2, 'liston', 2, ['ancho de asiento'], ['patas y brazos 1x6', 'asiento y respaldo de tablas 1x4', 'cortes curvos'],
         ['pc1x6', 'pc1x4'], ['tdeck', 'barniz'], BASICAS + ['caladora', 'lijadora'])
proyecto('casa_perro', 'Casa de perro', 'exterior', 2, 'exterior', 2, ['tamaño del perro (S/M/L)'], ['piso elevado', 'muros OSB o machihembrado', 'techo de dos aguas'],
         ['pi2x2', 'osb11', 'machi'], ['clavo2', 'tdeck', 'protdeck'], BASICAS + ['circular', 'caladora'])
proyecto('lenera', 'Leñera / compostera', 'exterior', 1, 'exterior', 2, ['largo', 'alto', 'fondo'], ['marcos de 2x3 impregnado', 'tablas con separación', 'techo simple'],
         ['pi2x3', 'pi2x2', 'pc1x4'], ['tdeck', 'clavo3'], BASICAS + CORTE_LISTON)
proyecto('cerco', 'Cerco / reja de madera', 'exterior', 2, 'exterior', 2, ['largo', 'alto', 'separación de postes'], ['postes polín impregnado', 'soleras 2x3', 'tablas verticales u horizontales'],
         ['polin', 'pi2x3', 'pc1x4'], ['tdeck', 'clavo3', 'protdeck'], BASICAS + ['circular', 'nivel'],
         permiso='Cierros: sin permiso (5.1.2 n.° 3) pero deben cumplir altura y transparencia del Plan Regulador Comunal.')
proyecto('bodega', 'Bodega / cobertizo de jardín', 'exterior', 3, 'entramado', 2, ['largo', 'ancho', 'alto', 'tipo de techo'],
         ['piso de OSB sobre vigas impregnadas', 'muros de entramado 2x3 a 40/60 cm', 'revestimiento OSB + siding o machihembrado', 'techo y cubierta', 'puerta'],
         ['pi2x4', 'pd2x3', 'osb11', 'machi', 'polin'], ['clavo3', 'clavo4', 'tdeck', 'escuadra'], BASICAS + CORTE_LISTON + ['nivel'],
         [('Pies derechos cada 40 o 60 cm, cadenetas cada 60 cm', 'volcan'), ('Pino dimensionado 2x3 real ≈ 48×73 mm (verde) / 41×65 mm (cepillado)', 'sodimac_fichas')],
         permiso='Agrega superficie: «obra menor» (ampliación hasta 100 m²) con permiso DOM, arquitecto y plano 1:50 (arts. 1.1.2 y 5.1.4). El texto vigente del 5.1.2 ya no exime «cobertizos».')

# ---------------------------------------------------------------- Construcción interior
proyecto('tabique', 'Tabique divisorio interior (volcanita sobre pino)', 'construcción', 2, 'entramado', 1, ['largo', 'alto', 'con puerta', 'aislación'],
         ['solera inferior y superior 2x3', 'pies derechos 2x3 cada 40/60 cm', 'cadenetas cada 60 cm', 'volcanita 10/15 mm por ambas caras', 'lana mineral opcional'],
         ['pd2x3', 'volc10', 'volc15', 'lanamin'], ['tvolc', 'clavo4', 'cintamuro', 'pastamuro'], BASICAS + ['circular', 'nivel'],
         [('Pies derechos a 40 o 60 cm; cadenetas cada 60 cm', 'volcan'), ('Tornillo autoavellanante 6×1¼" en estructura de madera', 'volcan'),
          ('Tabique 2x3: pino C16 y humedad ≤ 18 %', 'modulor')],
         permiso='Tabique no soportante dentro de vivienda: sin permiso y sin expediente (art. 5.1.2 n.° 1).')
proyecto('muro_revestido', 'Revestimiento de muro con machihembrado', 'construcción', 1, 'entramado', 2, ['largo', 'alto', 'orientación'],
         ['listones 1x2 o 2x2 de enlistonado cada 40–60 cm', 'tablas machihembradas 3/4x4', 'guardapolvo y cornisa'], ['pc1x2', 'machi'], ['clavo2', 'cola'], BASICAS + ['ingletadora', 'nivel'],
         permiso='Revestimiento interior: obra no estructural, sin permiso (5.1.2 n.° 1).')
proyecto('habitacion', 'Habitación de madera (ampliación)', 'construcción', 3, 'entramado', 3, ['largo', 'ancho', 'alto', 'ventanas y puerta'],
         ['radier o piso sobre poyos', 'muros de entramado 2x4 con OSB estructural', 'aislación y barrera de humedad', 'revestimiento interior volcanita', 'techumbre', 'instalaciones'],
         ['pd2x4', 'pi2x4', 'osb11', 'volc15', 'lanamin'], ['clavo3', 'clavo4', 'tvolc', 'escuadra', 'perno'], BASICAS + CORTE_LISTON + ['nivel'],
         [('Pies derechos estructurales 2x4 grado C24; tabiquería no estructural C16', 'modulor'), ('Pies derechos a 40/60 cm', 'volcan')],
         permiso='Ampliación hasta 100 m²: «obra menor» con permiso DOM, arquitecto, plano 1:50 y especificaciones (arts. 1.1.2 y 5.1.4). Sin permiso los derechos tienen recargo.',
         nota='La app puede entregar el despiece y el presupuesto, pero el proyecto debe firmarlo un arquitecto. Oportunidad: derivar a profesionales y tiendas.')
proyecto('altillo', 'Altillo / mezanine interior', 'construcción', 3, 'entramado', 3, ['largo', 'ancho', 'altura'], ['vigas 2x6 o 2x8', 'piso terciado/OSB 18', 'baranda', 'escalera'],
         ['pc2x6', 'terc18', 'osb15'], ['perno', 'escuadra', 't4x50'], BASICAS + CORTE_LISTON + ['nivel'],
         [('Baranda ≥ 0,95 m que resista 50 kg/m; en escaleras ≥ 0,85 m', 'oguc'), ('Peldaños: huella ≥ 28 cm y contrahuella 13–18 cm (vías de evacuación)', 'oguc')],
         permiso='Agrega superficie y es estructural: requiere permiso y cálculo.', nota='Recomendado solo como cotización a profesional.')

# Proyectos descartados a propósito
DESCARTADOS = [
    ('Cunas', 'Normas obligatorias muy estrictas (en EE.UU. 16 CFR 1219/1220) y alto riesgo para bebés: no ofrecer planos caseros.'),
    ('Escaleras estructurales de vivienda', 'Exigen cálculo y cumplir OGUC 4.2.7 (huella, contrahuella, barandas): derivar a profesional.'),
]

json.dump({'proyectos': P, 'fuentes': {k: {'titulo': t, 'url': u} for k, (t, u) in F.items()}, 'descartados': DESCARTADOS},
          open('catalogo_proyectos.json', 'w'), ensure_ascii=False, indent=1)
from collections import Counter
print(len(P), 'proyectos', Counter(p['categoria'] for p in P), Counter(p['motor'] for p in P), Counter(p['estado'] for p in P))
# Comprobación: todos los ids de materiales/herrajes/herramientas existen en el estudio de precios.
precios = {e['id'] for e in json.load(open('precios_reales.json'))['items']}
faltan = {x for p in P for x in p['materiales'] + p['herrajes'] + p['herramientas'] if x not in precios}
print('ids sin precio:', faltan)
