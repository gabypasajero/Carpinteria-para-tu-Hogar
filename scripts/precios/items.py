# Ítems a cotizar. «inc»: todas las expresiones deben calzar con el nombre (sin tildes, minúsculas);
# «exc»: ninguna debe calzar. «q»: búsquedas a lanzar en cada tienda.
I = []


def item(id, nombre, cat, q, inc, exc=(), unidad='unidad'):
    I.append(dict(id=id, nombre=nombre, cat=cat, q=q if isinstance(q, list) else [q], inc=list(inc), exc=list(exc), unidad=unidad))


T = 'tablero'
# --- Tableros ---
item('mel15', 'Melamina blanca 15 mm', T, ['melamina blanca 15 mm', 'melamina 15 mm blanco'], [r'melamina', r'\b15 ?mm', r'blanc', r'(183|1[.,]83|152|1[.,]52|122|1[.,]22|120|1[.,]2\b|215|2[.,]15)\s*x\s*(250|2[.,]5|244|2[.,]44|240|2[.,]4)|(250|244|240)\s*x\s*(183|152|122|120)'], [r'canto|tapacanto|repisa|mueble|cajon|tablero de|dimensionad|organizador|cubierta|corte|2da'], 'plancha')
item('mel18', 'Melamina blanca 18 mm', T, ['melamina blanca 18 mm', 'melamina 18 mm blanco'], [r'melamina', r'\b18 ?mm', r'blanc', r'(183|1[.,]83|152|1[.,]52|122|1[.,]22|120|1[.,]2\b|215|2[.,]15)\s*x\s*(250|2[.,]5|244|2[.,]44|240|2[.,]4)|(250|244|240)\s*x\s*(183|152|122|120)'], [r'canto|tapacanto|repisa|mueble|cajon|dimensionad|organizador|cubierta|corte|2da'], 'plancha')
item('mel18c', 'Melamina color madera 18 mm', T, ['melamina 18 mm roble', 'melamina 18 mm'], [r'melamina', r'\b18 ?mm', r'roble|nogal|cerezo|teka|haya|coigue|olmo|carvalo|tabaco|cedro'], [r'canto|tapacanto|repisa|mueble|dimensionad'], 'plancha')
item('hdf3', 'Trupán / HDF / MDF 3 mm', T, ['trupan 3 mm', 'hdf 3 mm', 'mdf 3 mm', 'mdf desnudo 3 mm', 'mdf natural 3 mm 152x244'], [r'(trupan|hdf|mdf|durolac|hardboard)', r'\b3 ?mm', r'(183|1[.,]83|152|1[.,]52|122|1[.,]22|120|1[.,]2\b|215|2[.,]15)\s*x\s*(250|2[.,]5|244|2[.,]44|240|2[.,]4)|(250|244|240)\s*x\s*(183|152|122|120)'], [r'1[0-9] ?mm|melamina|corte|cuadro|decorativ'], 'plancha')
item('mdf9', 'MDF 9 mm crudo', T, ['mdf 9 mm', 'trupan 9 mm', 'mdf natural 9 mm 152x244', 'mdf desnudo 9 mm'], [r'(mdf|trupan)', r'\b9 ?mm', r'(183|1[.,]83|152|1[.,]52|122|1[.,]22|120|1[.,]2\b|215|2[.,]15)\s*x\s*(250|2[.,]5|244|2[.,]44|240|2[.,]4)|(250|244|240)\s*x\s*(183|152|122|120)'], [r'melamina|ranurado|ripado|melasek|corte|junquillo|moldura'], 'plancha')
item('mdf15', 'MDF 15 mm crudo', T, ['mdf 15 mm', 'trupan 15 mm'], [r'(mdf|trupan)', r'\b15 ?mm', r'(183|1[.,]83|152|1[.,]52|122|1[.,]22|120|1[.,]2\b|215|2[.,]15)\s*x\s*(250|2[.,]5|244|2[.,]44|240|2[.,]4)|(250|244|240)\s*x\s*(183|152|122|120)'], [r'melamina|ranurado|ripado|melasek|corte|moldura|guia'], 'plancha')
item('mdf18', 'MDF 18 mm crudo', T, ['mdf 18 mm', 'trupan 18 mm'], [r'(mdf|trupan)', r'\b18 ?mm', r'(183|1[.,]83|152|1[.,]52|122|1[.,]22|120|1[.,]2\b|215|2[.,]15)\s*x\s*(250|2[.,]5|244|2[.,]44|240|2[.,]4)|(250|244|240)\s*x\s*(183|152|122|120)'], [r'melamina|ranurado|ripado|melasek|corte|moldura|brillo|matte'], 'plancha')
item('terc12', 'Terciado (contrachapado) 12 mm', T, ['terciado 12 mm', 'plancha terciado 12mm'], [r'terciado|contrachapado', r'\b12 ?mm'], [r'moldaje|fenolico|ranurado'], 'plancha')
item('terc15', 'Terciado (contrachapado) 15 mm', T, ['terciado 15 mm'], [r'terciado|contrachapado', r'\b15 ?mm'], [r'moldaje|fenolico|ranurado'], 'plancha')
item('terc18', 'Terciado (contrachapado) 18 mm', T, ['terciado 18 mm'], [r'terciado|contrachapado', r'\b18 ?mm'], [r'moldaje|fenolico|ranurado'], 'plancha')
item('osb9', 'OSB 9,5 mm', T, ['osb 9,5 mm', 'osb 9.5 mm', 'osb 9 mm'], [r'osb', r'\b9([.,]5)? ?mm'], [r'colonial|siding|smart'], 'plancha')
item('osb11', 'OSB 11,1 mm', T, ['osb 11,1 mm', 'osb 11 mm'], [r'osb', r'\b11([.,]1)? ?mm'], [r'colonial|siding|smart'], 'plancha')
item('osb15', 'OSB 15 mm', T, ['osb 15 mm', 'osb 15,1 mm'], [r'osb', r'\b15([.,]1)? ?mm'], [r'colonial|siding|smart'], 'plancha')
item('volc10', 'Yeso cartón (volcanita) 10 mm ST', T, ['volcanita 10 mm', 'yeso carton 10 mm', 'yeso carton borde rebajado 10 mm 120x240'], [r'volcanita|yeso ?carton|gyplac|knauf', r'\b10 ?mm', r'120 ?x ?240|1[.,]2 ?x ?2[.,]4'], [r'tarugo|reparacion|\brh\b|\brf\b|humed|fuego|perfil|tornillo|cinta|masilla|pasta'], 'plancha')
item('volc15', 'Yeso cartón (volcanita) 15 mm ST', T, ['volcanita 15 mm', 'yeso carton 15 mm', 'yeso carton 15 mm 120x240', 'yeso carton borde rebajado 15 mm'], [r'volcanita|yeso ?carton|gyplac|knauf', r'\b15 ?mm', r'120 ?x ?240|1[.,]2 ?x ?2[.,]4'], [r'tarugo|reparacion|\brh\b|\brf\b|humed|fuego|perfil|tornillo|cinta|masilla|pasta'], 'plancha')

M = 'madera'
for sec, n in [('1x2', 'pino cepillado 1x2'), ('1x3', 'pino cepillado 1x3'), ('1x4', 'pino cepillado 1x4'), ('1x5', 'pino cepillado 1x5'), ('1x6', 'pino cepillado 1x6'),
               ('2x2', 'pino cepillado 2x2'), ('2x3', 'pino cepillado 2x3'), ('2x4', 'pino cepillado 2x4'), ('2x6', 'pino cepillado 2x6')]:
    a, b = sec.split('x')
    item(f'pc{sec}', f'Pino cepillado {sec}" 3,2 m', M, [n + ' 3,2 m', n], [r'pino', r'cepillad', rf'\b{a} ?x ?{b}(?![\d,.])'], [r'impregnad|machihembr|moldura|deck|oregon'], 'pieza')
for sec in ['2x3', '2x4']:
    a, b = sec.split('x')
    item(f'pd{sec}', f'Pino dimensionado seco {sec}" (tabiquería)', M, [f'pino dimensionado {sec}', f'pino bruto {sec}', f'pino seco {sec}'], [r'pino', r'dimensionad|bruto|seco', rf'\b{a} ?x ?{b}(?![\d,.])'], [r'impregnad|cepillad|machihembr|verde'], 'pieza')
for sec in ['2x2', '2x3', '2x4', '2x6', '4x4']:
    a, b = sec.split('x')
    item(f'pi{sec}', f'Pino impregnado {sec}" 3,2 m', M, [f'pino impregnado {sec}', f'impregnado {sec}', f'pino impregnado {sec[0]} x {sec[2]}'], [r'impregnad', rf'\b{a} ?x ?{b}(?![\d,.])'], [r'machihembr|moldura|tornillo|polin|estructural'], 'pieza')
item('deck', 'Tabla de deck pino impregnado', M, ['deck pino impregnado', 'tabla deck madera', 'deck pino', 'deck impregnado 1x4', 'deck 1 1/2 x 5'], [r'deck', r'pino|madera|impregnad'], [r'tornillo|aceite|protector|pintura|baldosa|modular|wpc|compuesto|sintetic|clip'], 'pieza')
item('machi', 'Machihembrado pino 1x4/1x5', M, ['machihembrado pino', 'tabla machihembrada pino'], [r'machihembr', r'pino'], [r'piso|vinilico|laminado'], 'pieza')
item('polin', 'Polín impregnado 4-5" 2,4 m', M, ['polin impregnado'], [r'polin', r'impregnad'], [], 'pieza')

H = 'herraje'
item('t4x40', 'Tornillo aglomerado 4×40 mm (caja)', H, ['tornillo aglomerado 4x40', 'tornillo 4 x 40 mm', 'tornillo madera 8 x 1 1/2', 'tornillo aglomerado 8 x 1 1/2'], [r'tornillo', r'\b4 ?x ?40\b|\b8 ?x ?1 ?1/2'], [r'drywall|volcanita|techo|hex|autoperforante|tarugo'], 'caja')
item('t4x50', 'Tornillo madera 4×50 mm (caja)', H, ['tornillo madera 4x50', 'tornillo 4 x 50 mm', 'tornillo madera 8 x 2', 'tornillo aglomerado 8 x 2'], [r'tornillo', r'\b4 ?x ?50\b|\b8 ?x ?2 ?"'], [r'drywall|volcanita|techo|hex|autoperforante|tarugo'], 'caja')
item('t35x16', 'Tornillo 3,5×16 mm (herrajes)', H, ['tornillo 3,5x16', 'tornillo 3.5 x 16'], [r'tornillo', r'3[.,]5 ?x ?16'], [r'drywall|techo'], 'caja')
item('tvolc', 'Tornillo volcanita 6×1 1/4" (caja)', H, ['tornillo volcanita 6 x 1 1/4', 'tornillo drywall 6x1 1/4'], [r'tornillo', r'volcanita|drywall|yeso', r'1[ -]?1/4|1,1/4|32 ?mm'], [r'metal|punta broca'], 'caja')
item('tdeck', 'Tornillo exterior zincado/galvanizado 8×3" (deck, estructuras)', H, ['tornillo zincado madera 8 x 3', 'turbo screw zincado', 'tornillo madera 8x3 zincado', 'tornillo galvanizado madera 3'], [r'tornillo', r'zincad|galvaniz|turbo', r'8 ?x ?3\b|8 ?x ?3"|6[.,]0 ?x ?(75|80|90|100)|3 ?1/2|x ?3"'], [r'volcanita|drywall|techo|autoperf|hexagonal|neopren|lancero'], 'caja')
item('confirmat', 'Tornillo confirmat 7×50', H, ['tornillo confirmat', 'confirmat'], [r'confirmat'], [r'broca'], 'caja')
item('tarugo8', 'Tarugo de madera 8 mm', H, ['tarugo madera 8 mm', 'tarugo estriado 8'], [r'tarugo', r'madera|estriad', r'\b8 ?mm|8 ?x'], [r'plastic|nylon|fischer|ladrillo|muro'], 'bolsa')
item('clavo1', 'Clavo puntilla 1" (respaldos)', H, ['clavo corriente 1', 'puntilla 1 pulgada', 'clavo 1 pulgada'], [r'clavo|puntilla', r'(?<![/\d])1 ?("|pulg)'], [r'helicoidal|techo|concreto|galvaniz|escuadra|1/2|1/4|cobre'], 'kg')
item('clavo2', 'Clavo corriente 2"', H, ['clavo corriente 2', 'clavo 2 pulgadas'], [r'clavo', r'(?<![/\d])2 ?("|pulg)'], [r'helicoidal|techo|concreto|cabeza perdida|galvaniz|escuadra|1/2'], 'kg')
item('clavo3', 'Clavo corriente 3"', H, ['clavo corriente 3', 'clavo 3 pulgadas'], [r'clavo', r'(?<![/\d])3 ?("|pulg)'], [r'helicoidal|techo|concreto|galvaniz|escuadra|1/2'], 'kg')
item('clavo4', 'Clavo corriente 4"', H, ['clavo corriente 4', 'clavo 4 pulgadas'], [r'clavo', r'(?<![/\d])4 ?("|pulg)'], [r'helicoidal|techo|concreto|galvaniz|escuadra|1/2'], 'kg')
item('bisagra', 'Bisagra cazoleta 35 mm recta', H, ['bisagra cazoleta 35 mm', 'bisagra recta 35mm'], [r'bisagra', r'35'], [r'curva|semi|piston|vidrio|esquin'], 'unidad')
item('corr35', 'Corredera telescópica 35 cm (par)', H, ['corredera telescopica 35 cm', 'corredera 350 mm'], [r'corredera', r'telescop', r'\b35 ?cm|\b350 ?mm'], [r'push|oculta|cierre suave|soft'], 'par')
item('corr45', 'Corredera telescópica 45 cm (par)', H, ['corredera telescopica 45 cm', 'corredera 450 mm'], [r'corredera', r'telescop', r'\b45 ?cm|\b450 ?mm'], [r'push|oculta|cierre suave|soft'], 'par')
item('tirador', 'Tirador metálico 96 mm', H, ['tirador 96 mm', 'manilla mueble 96 mm'], [r'tirador|manilla', r'\b96'], [], 'unidad')
item('soporte', 'Soporte de repisa (pin)', H, ['soporte repisa 5 mm', 'soporte repisa pin'], [r'soporte', r'repisa'], [r'escuadra|vidrio|cristal|flotante|riel|cremallera|ménsula|mensula|industrial|abatible|provenza|lateral|repisa soporte'], 'bolsa')
item('barra', 'Barra de closet', H, ['barra closet', 'tubo closet ovalado'], [r'barra|tubo', r'closet|colgar'], [r'organizador|zapatero|soporte'], 'unidad')
item('escuadra', 'Escuadra metálica 3"', H, ['escuadra metalica 3', 'escuadra refuerzo madera'], [r'escuadra'], [r'carpinter|aluminio|medir|falsa|nivel|regla|repisa|clavo|tornillo|triangular|silla'], 'unidad')
item('perno', 'Perno coche 3/8 × 4"', H, ['perno coche 3/8 x 4', 'perno coche 3/8'], [r'perno', r'coche', r'3/8'], [], 'unidad')
item('basepilar', 'Base/anclaje pilar 4×4', H, ['base pilar 4x4', 'anclaje pilar madera'], [r'base|anclaje|soporte', r'pilar|poste', r'4 ?x ?4|90'], [], 'unidad')
item('rueda', 'Rueda/garrucha con freno 50 mm', H, ['rueda con freno 50 mm mueble', 'garrucha 50 mm freno'], [r'rueda|garrucha', r'freno'], [r'silla|bicicleta|carro de|maleta'], 'unidad')

C = 'consumible'
item('tapacanto', 'Tapacanto PVC 22 mm blanco', C, ['tapacanto pvc 22 mm blanco', 'tapacanto blanco 22', 'tapacanto blanco', 'cubrecanto blanco 22 mm', 'tapacanto melamina blanco'], [r'tapacanto|cubrecanto', r'\b2[12]', r'blanc'], [r'recortador|cuchillo|366'], 'rollo/metro')
item('cola', 'Cola fría / adhesivo carpintero', C, ['cola fria', 'adhesivo carpintero madera'], [r'cola|adhesivo', r'fria|carpinter|madera', r'2[25]0 ?g|1/4|0[.,]25|250'], [r'contacto|silicona|instantane|epox|spray|escolar|pritt|lavable'], 'unidad')
item('lija120', 'Lija para madera grano 120', C, ['lija madera grano 120', 'lija 120'], [r'lija', r'\b120\b'], [r'disco|velcro|orbital|banda|esponja'], 'unidad')
item('barniz', 'Barniz marino', C, ['barniz marino'], [r'barniz', r'marino'], [r'spray|aerosol'], 'tarro')
item('protdeck', 'Protector/aceite para deck', C, ['protector deck', 'aceite deck madera', 'protector madera exterior', 'aceite para deck', 'tinte deck'], [r'deck|terraza|exterior|piso', r'protector|aceite|tinte|lasur|impregnante'], [r'tornillo|tabla|barniz'], 'tarro')
item('cintamuro', 'Cinta para juntas de volcanita', C, ['cinta junta volcanita', 'huincha juntura yeso carton'], [r'cinta|huincha', r'junt|volcanita|drywall|yeso'], [r'aislante|embalaje|doble contacto|pintor'], 'rollo')
item('pastamuro', 'Pasta para muro (volcanita)', C, ['pasta muro', 'masilla volcanita'], [r'pasta|masilla', r'muro|volcanita|junta|yeso'], [r'madera|automotriz'], 'tineta')
item('lanamin', 'Lana mineral/vidrio rollo (tabique)', C, ['lana mineral rollo', 'lana de vidrio rollo'], [r'lana', r'mineral|vidrio'], [r'guante|mascara'], 'rollo')

HT = 'herramienta'
item('taladro', 'Taladro atornillador inalámbrico', HT, ['taladro atornillador inalambrico', 'atornillador inalambrico 20v'], [r'taladro|atornillador', r'inalambric|bateria|\b1[28] ?v|\b20 ?v'], [r'broca|punta|bateria sola|cargador$|soporte|percutor sds|impacto 1/2|sin bateria|\b[48] ?v\b|usb'], 'unidad')
item('circular', 'Sierra circular 7 1/4"', HT, ['sierra circular 7 1/4', 'sierra circular 185 mm'], [r'sierra', r'circular'], [r'disco|hoja|riel|guia|mesa|banco|inalambric'], 'unidad')
item('caladora', 'Sierra caladora', HT, ['sierra caladora'], [r'caladora'], [r'hoja|set de|repuesto'], 'unidad')
item('ingletadora', 'Sierra ingletadora 10"', HT, ['sierra ingletadora 10', 'ingleteadora 10'], [r'ingle'], [r'disco|hoja|mesa|soporte|manual'], 'unidad')
item('lijadora', 'Lijadora orbital', HT, ['lijadora orbital'], [r'lijadora', r'orbital|roto'], [r'lija |disco|velcro|pliego'], 'unidad')
item('router', 'Router / rebajadora', HT, ['rebajadora router', 'fresadora madera router', 'fresadora electrica', 'rebajadora electrica'], [r'router|rebajadora|fresadora|tupi', r'\d{3,4} ?w|electric|inalambric'], [r'fresas|broca|wifi|repisa|cabezal|mesa|base de'], 'unidad')
item('huincha', 'Huincha de medir 5 m', HT, ['huincha de medir 5 m', 'huincha 5 metros'], [r'huincha|cinta metrica|flexometro', r'\b5 ?m'], [r'laser|digital'], 'unidad')
item('escuadrac', 'Escuadra de carpintero', HT, ['escuadra carpintero', 'escuadra de carpinteria'], [r'escuadra'], [r'metalica 3|refuerzo|zincada|angulo de refuerzo'], 'unidad')
item('nivel', 'Nivel de burbuja 60 cm', HT, ['nivel de burbuja 60 cm', 'nivel aluminio 60'], [r'nivel', r'\b60|24 ?"', r'aluminio|burbuja|profesional'], [r'laser|lavaplatos|agua|zapater|repisa'], 'unidad')
item('prensa', 'Prensa sargento', HT, ['prensa sargento', 'prensa tipo f'], [r'prensa', r'sargento|tipo f|barra'], [r'banco|hidraulic|esquina'], 'unidad')
item('brocas', 'Set brocas para madera', HT, ['set brocas madera', 'juego brocas madera'], [r'broca', r'madera', r'set|juego|kit'], [r'forstner|paleta|copa|sierra copa'], 'set')
item('forstner', 'Broca Forstner 35 mm (bisagras)', HT, ['broca forstner 35 mm', 'broca bisagra 35'], [r'broca|fresa', r'forstner|bisagra|cazoleta', r'35'], [], 'unidad')
item('kreg', 'Plantilla de agujeros ocultos (pocket hole)', HT, ['kreg pocket hole', 'plantilla tornillo oculto', 'kreg', 'guia pocket hole'], [r'kreg|pocket|oculto|guia de agujeros|plantilla de perforacion'], [], 'unidad')
item('martillo', 'Martillo carpintero', HT, ['martillo carpintero'], [r'martillo'], [r'goma|demoledor|electric|perforador|rotomartillo|bola'], 'unidad')
item('serrucho', 'Serrucho carpintero', HT, ['serrucho carpintero'], [r'serrucho'], [r'costilla|podar|jardin|ingletadora'], 'unidad')
item('formon', 'Set de formones', HT, ['set formones', 'formon madera'], [r'formon'], [], 'unidad')
item('pistolacal', 'Pistola calafateo', HT, ['pistola calafateo', 'pistola silicona calafatear'], [r'pistola', r'calafat|silicon|cartucho'], [r'calor|caliente|barra|clavadora|pintar|neumatica'], 'unidad')

# Búsquedas amplias para Imperial (su buscador exige todas las palabras); el resultado se filtra con las reglas de cada ítem.
IMPERIAL_Q = ['melamina', 'melamina blanca', 'melamina 18', 'mdf', 'trupan', 'hdf', 'terciado', 'osb', 'yeso carton', 'volcanita',
              'pino cepillado', 'pino dimensionado', 'pino impregnado', 'impregnado', 'polin', 'deck', 'machihembrado',
              'tornillo', 'tornillo aglomerado', 'tornillo aglomerado 4 x 40', 'tornillo aglomerado 4 x 50', 'tornillo aglomerado 3.5', 'tornillo aglomerado bolsa 100', 'tornillo volcanita', 'tornillo deck', 'confirmat', 'tarugo', 'clavo',
              'bisagra', 'corredera', 'tirador', 'soporte repisa', 'barra closet', 'escuadra', 'perno coche', 'base poste', 'rueda',
              'tapacanto', 'cola fria', 'lija', 'barniz', 'protector madera', 'cinta junta', 'pasta muro', 'lana mineral', 'lana vidrio',
              'taladro', 'atornillador', 'sierra circular', 'caladora', 'ingleteadora', 'lijadora', 'fresadora', 'rebajadora', 'huincha',
              'nivel', 'prensa', 'broca madera', 'broca forstner', 'kreg', 'martillo', 'serrucho', 'formon', 'pistola calafatear']
