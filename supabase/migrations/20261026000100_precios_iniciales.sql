-- Precios referenciales iniciales (editables en carpinteria.precios)
insert into carpinteria.precios (id, precio, tienda) values
  ('mel15', 39990, 'Imperial'),
  ('mel18', 47990, 'Imperial'),
  ('hdf3', 12990, 'Sodimac'),
  ('pino1x4', 4290, 'Sodimac'),
  ('pino2x2', 3790, 'Easy'),
  ('tornillo4x40', 3490, 'Sodimac'),
  ('tornillo4x50', 3990, 'Sodimac'),
  ('tornillo35x16', 2490, 'Easy'),
  ('tarugo8', 1990, 'Easy'),
  ('clavo1', 1590, 'Sodimac'),
  ('soporteRepisa', 1990, 'Imperial'),
  ('bisagraCazoleta', 2490, 'Imperial'),
  ('corredera350', 6990, 'Imperial'),
  ('corredera450', 8490, 'Imperial'),
  ('tirador', 1990, 'Imperial'),
  ('barraCloset', 5990, 'Sodimac'),
  ('tapacanto', 290, 'Imperial'),
  ('cola', 2990, 'Easy'),
  ('lija', 690, 'Easy'),
  ('barniz', 9990, 'Sodimac')
on conflict (id) do nothing;
