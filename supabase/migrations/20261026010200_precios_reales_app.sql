-- Precios que usa la app, con el producto de referencia (26-10-2026).
insert into carpinteria.precios (id, precio, tienda, producto, url, envase, unidad_venta, actualizado) values
('mel15',36550,'Sodimac, Easy e Imperial','Melamina Blanco 15 mm 183x250 cm','https://www.sodimac.cl/sodimac-cl/product/571539',1,'plancha','2026-10-26T06:48:08.903252+00:00'),
('mel18',55150,'Sodimac e Imperial','Melamina Cerezo 18 mm 183x250 cm','https://www.sodimac.cl/sodimac-cl/product/548930X',1,'plancha','2026-10-26T06:48:08.903252+00:00'),
('hdf3',8320,'Sodimac e Imperial','MDF Desnudo Natural 3 mm 152x244 cm','https://www.sodimac.cl/sodimac-cl/product/160717',1,'plancha','2026-10-26T06:48:08.903252+00:00'),
('pino1x4',2640,'Sodimac, Easy e Imperial','Pino seco cepillado premium 1x4 3,2 m','https://www.easy.cl/pino-seco-cepillado-premium-1x4-32-m-192589/p',1,'pieza 3,2 m','2026-10-26T06:48:08.903252+00:00'),
('pino2x2',2630,'Sodimac, Easy e Imperial','Pino seco cepillado premium 2x2 3,2 m','https://www.easy.cl/pino-seco-cepillado-premium-2x2-32-m-192599/p',1,'pieza 3,2 m','2026-10-26T06:48:08.903252+00:00'),
('tornillo4x40',3450,'Easy','Tornillo multiuso 4 x 40 mm (N°8 x 1 1/2'''') 144 unidades Imporper','https://www.easy.cl/tornillo-multiuso-4-x-40-mm-n8-x-1-12-144-unidades-imporper-238462/p',144,'caja 144 u','2026-10-26T06:48:08.903252+00:00'),
('tornillo4x50',1290,'Imperial','Tornillo aglomerado 4 x 50 bolsa 100un khor','https://www.imperial.cl/fijaciones-para-maderas/tornillo-aglomerado-4-x-50-bolsa-100un-khor/product/149970',100,'bolsa 100 u','2026-10-26T06:48:08.903252+00:00'),
('tornillo35x16',1890,'Easy','Tornillo madera aglomerada 3,5x16 mm 144 unidades Mamut','https://www.easy.cl/tornillo-madera-aglomerada-35x16-mm-144-unidades-mamut-144552/p',144,'caja 144 u','2026-10-26T06:48:08.903252+00:00'),
('tarugo8',2990,'Imperial','Tarugo madera 8x45mm 100uds','https://www.imperial.cl/conectores-para-madera/tarugo-madera-8x45mm-100uds/product/75997',100,'bolsa 100 u','2026-10-26T06:48:08.903252+00:00'),
('soporteRepisa',1490,'Imperial','Soporte repisa fijo blanco 50uds','https://www.imperial.cl/accesorios-muebles/soporte-repisa-fijo-blanco-50uds/product/137182',50,'bolsa 50 u','2026-10-26T06:48:08.903252+00:00'),
('bisagraCazoleta',2990,'Imperial','Bisagra recta 35 mm 10 unidades sin tornillos','https://www.imperial.cl/bisagras-muebles/bisagra-recta-35-mm-10-unidades-sin-tornillos/product/126433',10,'bolsa 10 u','2026-10-26T06:48:08.903252+00:00'),
('corredera350',4690,'Sodimac','Corredera telescópica para cajón 350 mm','https://www.sodimac.cl/sodimac-cl/product/270238X',1,'juego','2026-10-26T06:48:08.903252+00:00'),
('corredera450',5190,'Imperial','Corredera telescópica TL 450 mm','https://www.imperial.cl/correderas-telesc%C3%B3picas/corredera-telesc%C3%B3pica-tl-450-mm/product/85089',1,'juego','2026-10-26T06:48:08.903252+00:00'),
('tirador',750,'Sodimac','Manilla 96 mm cromo mate','https://www.sodimac.cl/sodimac-cl/product/3256189',1,'unidad','2026-10-26T06:48:08.903252+00:00'),
('barraCloset',5600,'Sodimac','Barra para clóset estándar 1 m café','https://www.sodimac.cl/sodimac-cl/product/544086',1,'unidad','2026-10-26T06:48:08.903252+00:00'),
('tapacanto',3190,'Sodimac','Tapacanto PVC blanco 22x0,45 mm Ro 25 mt','https://www.sodimac.cl/sodimac-cl/product/5477921',25,'rollo 25 m','2026-10-26T06:48:08.903252+00:00'),
('cola',3990,'Easy e Imperial','Cola fría 250 gr Multiuso con pincel','https://www.easy.cl/cola-fria-250-gr-multiuso-con-pincel-1080326/p',1,'frasco','2026-10-26T06:48:08.903252+00:00'),
('lija',250,'Sodimac y Easy','Lija para madera 9"x11'''' grano 120','https://www.sodimac.cl/sodimac-cl/product/759651',1,'pliego','2026-10-26T06:48:08.903252+00:00'),
('barniz',7490,'Sodimac','Barniz Marino Brillante 0.25 galón(es) Castaño','https://www.sodimac.cl/sodimac-cl/product/7676417',1,'tarro','2026-10-26T06:48:08.903252+00:00'),
('clavo1',2373,'Sodimac','Clavo corriente 1" bolsa 1/2 kg','https://www.sodimac.cl/sodimac-cl/product/296171',500,'bolsa ½ kg','2026-10-26T06:48:08.903252+00:00')
on conflict (id) do update set precio = excluded.precio, tienda = excluded.tienda, producto = excluded.producto, url = excluded.url, envase = excluded.envase, unidad_venta = excluded.unidad_venta, actualizado = excluded.actualizado;
