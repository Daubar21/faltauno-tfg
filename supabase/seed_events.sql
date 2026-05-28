-- ============================================================
-- SEED: Eventos de junio 2026 para FaltaUno
-- Pegar en: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================
-- IDs de deportes: Futbol7=1, Padel=2, Baloncesto=3, Running=4,
-- VoleyPlaya=5, FutbolSala=6, Futbol11=7, Tenis=8, Golf=9,
-- Natacion=10, Ciclismo=11

INSERT INTO events
  (sport_id, title, event_date, event_time, city, address, lat, lng,
   level, gender, min_age, max_age, total_places, current_participants, status)
VALUES

-- ── LAS ROZAS (10 eventos) ─────────────────────────────────────────────
(1,  'Fútbol 7 Ciudad Deportiva Las Rozas',   '2026-06-07', '18:00', 'Las Rozas', 'Ciudad Deportiva Las Rozas, C/ de la Dehesa s/n',          40.4929, -3.8706, 'Intermedio',   'Mixto',     18, 50, 14, 6,  'open'),
(2,  'Pádel matutino Las Rozas',              '2026-06-10', '09:00', 'Las Rozas', 'Club de Pádel Las Rozas, Av. de la Industria',             40.5012, -3.8734, 'Principiante', 'Mixto',     16, 60,  4, 3,  'open'),
(4,  'Running por Monte Rozas',               '2026-06-14', '08:00', 'Las Rozas', 'Monte de las Rozas, Las Rozas de Madrid',                  40.4781, -3.8952, 'Intermedio',   'Mixto',     18, 55, 20, 9,  'open'),
(8,  'Tenis en Las Rozas Club',               '2026-06-03', '17:00', 'Las Rozas', 'Club de Tenis Las Rozas, C/ Pinos 12',                     40.4867, -3.8823, 'Avanzado',     'Masculino', 20, 45,  4, 2,  'open'),
(3,  'Baloncesto 3x3 Las Rozas',              '2026-06-17', '19:00', 'Las Rozas', 'Pista Polideportiva Las Rozas Norte',                      40.5035, -3.8680, 'Intermedio',   'Mixto',     16, 40,  6, 4,  'open'),
(6,  'Fútbol Sala Las Rozas noche',           '2026-06-21', '21:00', 'Las Rozas', 'Pabellón Municipal Las Rozas, C/ Arroyo del Monte',        40.4945, -3.8760, 'Principiante', 'Mixto',     18, 45, 10, 3,  'open'),
(11, 'Ruta ciclista por Las Rozas',           '2026-06-28', '07:30', 'Las Rozas', 'Salida: Parking El Pinar, Las Rozas',                      40.4860, -3.8810, 'Intermedio',   'Mixto',     18, 60, 15, 7,  'open'),
(2,  'Pádel tarde Las Rozas (femenino)',      '2026-06-05', '18:30', 'Las Rozas', 'Pistas de Pádel Municipales Las Rozas',                    40.4920, -3.8695, 'Intermedio',   'Femenino',  18, 55,  4, 1,  'open'),
(7,  'Fútbol 11 Las Rozas domingo',           '2026-06-15', '11:00', 'Las Rozas', 'Campo Municipal Las Rozas, Av. del Deporte',               40.4955, -3.8771, 'Avanzado',     'Masculino', 20, 40, 22, 14, 'open'),
(4,  'Running matinal Las Rozas',             '2026-06-22', '08:00', 'Las Rozas', 'Parque El Pinar, Las Rozas de Madrid',                     40.4990, -3.8750, 'Principiante', 'Mixto',     16, 65, 25, 11, 'open'),

-- ── MADRID (8 eventos) ────────────────────────────────────────────────
(2,  'Pádel en el Retiro',                   '2026-06-06', '10:00', 'Madrid', 'Club de Pádel Retiro, Av. de Menéndez Pelayo 45',             40.4153, -3.6844, 'Intermedio',   'Mixto',     18, 55,  4, 2,  'open'),
(3,  'Baloncesto Parque Norte Madrid',        '2026-06-08', '19:00', 'Madrid', 'Pistas Parque Norte, C/ Bravo Murillo',                       40.4703, -3.6843, 'Intermedio',   'Mixto',     16, 40, 10, 5,  'open'),
(1,  'Fútbol 7 Ciudad Universitaria',        '2026-06-11', '18:30', 'Madrid', 'Campos de Fútbol Ciudad Universitaria',                       40.4458, -3.7240, 'Avanzado',     'Masculino', 20, 40, 14, 10, 'open'),
(4,  'Running Parque del Oeste Madrid',      '2026-06-13', '09:00', 'Madrid', 'Entrada principal Parque del Oeste',                          40.4297, -3.7270, 'Principiante', 'Mixto',     18, 60, 30, 12, 'open'),
(5,  'Vóley playa Madrid Río',               '2026-06-20', '17:00', 'Madrid', 'Playa de Madrid Río, Paseo de la Chopera',                    40.4058, -3.7196, 'Principiante', 'Mixto',     16, 45, 12, 8,  'open'),
(8,  'Tenis Club Puerta de Hierro',          '2026-06-25', '10:00', 'Madrid', 'Real Club de Tenis Puerta de Hierro',                         40.4553, -3.7539, 'Avanzado',     'Mixto',     20, 50,  4, 1,  'open'),
(6,  'Fútbol Sala Vallecas',                 '2026-06-09', '20:00', 'Madrid', 'Pabellón Vallecas, C/ Payaso Fofó s/n',                       40.3769, -3.6489, 'Intermedio',   'Masculino', 18, 40, 10, 7,  'open'),
(10, 'Natación Club Canal Madrid',           '2026-06-16', '07:00', 'Madrid', 'Club Natación Canal, C/ Juan Vigón s/n',                      40.4607, -3.6870, 'Intermedio',   'Mixto',     16, 55, 20, 13, 'open'),

-- ── BARCELONA (6 eventos) ─────────────────────────────────────────────
(2,  'Pádel en la Barceloneta',              '2026-06-04', '09:30', 'Barcelona', 'Club de Pádel Barceloneta, Passeig Marítim 10',            41.3797,  2.1896, 'Principiante', 'Mixto',     16, 60,  4, 2,  'open'),
(1,  'Fútbol 7 Montjuïc',                   '2026-06-07', '18:00', 'Barcelona', 'Camps Esportius Montjuïc, Barcelona',                      41.3641,  2.1580, 'Intermedio',   'Masculino', 18, 40, 14, 8,  'open'),
(4,  'Running trail Tibidabo',               '2026-06-12', '08:30', 'Barcelona', 'Inici carretera Tibidabo, Barcelona',                      41.4218,  2.1189, 'Avanzado',     'Mixto',     20, 50, 25, 16, 'open'),
(3,  'Baloncesto Poble Sec Barcelona',       '2026-06-18', '19:30', 'Barcelona', 'Poliesportiu Aiguajoc, C/ Padilla 40',                     41.3726,  2.1589, 'Intermedio',   'Mixto',     16, 40, 10, 6,  'open'),
(5,  'Vóley playa Barceloneta',              '2026-06-23', '17:00', 'Barcelona', 'Playa de la Barceloneta, Barcelona',                       41.3777,  2.1930, 'Principiante', 'Mixto',     16, 50, 12, 4,  'open'),
(8,  'Tenis Club La Salut Barcelona',        '2026-06-27', '10:00', 'Barcelona', 'Club Tenis La Salut, Av. Tibidabo 45',                     41.4101,  2.1399, 'Avanzado',     'Mixto',     18, 55,  4, 3,  'open'),

-- ── VALENCIA (5 eventos) ──────────────────────────────────────────────
(2,  'Pádel Valencia Norte',                 '2026-06-05', '18:00', 'Valencia', 'Club de Pádel Valencia Norte, Av. del Cid 10',              39.4802, -0.4012, 'Intermedio',   'Mixto',     18, 55,  4, 2,  'open'),
(7,  'Fútbol 11 zona Mestalla',              '2026-06-14', '11:00', 'Valencia', 'Campos Ciudad del Fútbol, Valencia',                        39.4752, -0.3588, 'Intermedio',   'Masculino', 18, 40, 22, 16, 'open'),
(4,  'Running Jardines del Turia',           '2026-06-19', '08:00', 'Valencia', 'Jardines del Turia, entrada Palau de la Música',            39.4741, -0.3773, 'Principiante', 'Mixto',     16, 65, 30, 14, 'open'),
(10, 'Natación Piscina Municipal Valencia',  '2026-06-24', '07:30', 'Valencia', 'Piscina Municipal Nazaret, Valencia',                       39.4549, -0.3509, 'Intermedio',   'Mixto',     16, 55, 15, 9,  'open'),
(3,  'Baloncesto La Petxina Valencia',       '2026-06-29', '19:00', 'Valencia', 'Poliesportiu La Petxina, C/ Guillem de Castro',             39.4760, -0.3868, 'Intermedio',   'Mixto',     16, 45, 10, 5,  'open'),

-- ── SEVILLA (5 eventos) ───────────────────────────────────────────────
(1,  'Fútbol 7 Parque Alcosa Sevilla',       '2026-06-06', '19:00', 'Sevilla', 'Parque Deportivo Alcosa, Sevilla',                           37.3921, -5.9513, 'Principiante', 'Mixto',     18, 50, 14, 7,  'open'),
(2,  'Pádel Club Sevilla',                   '2026-06-13', '10:00', 'Sevilla', 'Club de Pádel Sevilla Este, C/ Luis Montoto',                37.3805, -5.9600, 'Intermedio',   'Mixto',     18, 55,  4, 2,  'open'),
(4,  'Running Parque María Luisa',           '2026-06-20', '08:00', 'Sevilla', 'Entrada principal Parque de María Luisa',                    37.3769, -5.9892, 'Principiante', 'Mixto',     16, 65, 25, 10, 'open'),
(9,  'Golf Real Club Sevilla',               '2026-06-27', '09:00', 'Sevilla', 'Real Club de Golf de Sevilla, Ctra. de Utrera',              37.3234, -5.9431, 'Avanzado',     'Mixto',     20, 65,  8, 3,  'open'),
(5,  'Vóley playa Sevilla',                  '2026-06-08', '11:00', 'Sevilla', 'Playa fluvial Isla Mágica, Sevilla',                         37.4001, -6.0010, 'Principiante', 'Mixto',     16, 45, 12, 6,  'open'),

-- ── BILBAO (3 eventos) ────────────────────────────────────────────────
(1,  'Fútbol 7 Bilbao',                      '2026-06-08', '18:30', 'Bilbao', 'Campos de Fútbol San Mamés, Bilbao',                          43.2639, -2.9493, 'Intermedio',   'Masculino', 18, 40, 14, 9,  'open'),
(11, 'Ruta ciclista Bizkaia',                '2026-06-15', '08:00', 'Bilbao', 'Salida: Plaza Moyua, Bilbao',                                 43.2630, -2.9340, 'Avanzado',     'Mixto',     20, 55, 20, 12, 'open'),
(10, 'Natación Bilbao Miribilla',            '2026-06-22', '07:00', 'Bilbao', 'Piscina Municipal Miribilla, Bilbao',                         43.2558, -2.9214, 'Intermedio',   'Mixto',     16, 55, 15, 8,  'open'),

-- ── ZARAGOZA (3 eventos) ──────────────────────────────────────────────
(2,  'Pádel Zaragoza',                       '2026-06-09', '18:00', 'Zaragoza', 'Club de Pádel Zaragoza, Av. de Goya 10',                   41.6511, -0.8816, 'Intermedio',   'Mixto',     18, 55,  4, 3,  'open'),
(3,  'Baloncesto Zaragoza',                  '2026-06-16', '19:30', 'Zaragoza', 'Pabellón Municipal Siglo XXI, Zaragoza',                   41.6488, -0.8891, 'Intermedio',   'Mixto',     16, 45, 10, 4,  'open'),
(4,  'Running orilla del Ebro Zaragoza',     '2026-06-23', '08:30', 'Zaragoza', 'Paseo del Ebro, junto al Puente de Piedra',                41.6580, -0.8789, 'Principiante', 'Mixto',     16, 65, 30, 11, 'open'),

-- ── MÁLAGA (3 eventos) ────────────────────────────────────────────────
(5,  'Vóley playa Málaga La Malagueta',      '2026-06-10', '11:00', 'Málaga', 'Playa La Malagueta, Málaga',                                  36.7159, -4.4101, 'Principiante', 'Mixto',     16, 50, 12, 5,  'open'),
(8,  'Tenis Club Málaga',                    '2026-06-17', '10:00', 'Málaga', 'Real Club de Tenis Málaga, Av. del Pinar',                    36.7268, -4.4380, 'Avanzado',     'Mixto',     18, 55,  4, 2,  'open'),
(6,  'Fútbol Sala Málaga',                   '2026-06-24', '20:00', 'Málaga', 'Pabellón de los Guindos, Málaga',                             36.7104, -4.4292, 'Intermedio',   'Masculino', 18, 40, 10, 6,  'open'),

-- ── MURCIA (2 eventos) ────────────────────────────────────────────────
(2,  'Pádel Murcia',                         '2026-06-11', '18:00', 'Murcia', 'Club de Pádel Murcia, Av. de la Fama 10',                    37.9830, -1.1265, 'Principiante', 'Mixto',     16, 60,  4, 1,  'open'),
(1,  'Fútbol 7 Murcia',                      '2026-06-18', '19:00', 'Murcia', 'Ciudad Deportiva de Murcia, Av. Miguel de Cervantes',         37.9922, -1.1307, 'Intermedio',   'Mixto',     18, 45, 14, 8,  'open'),

-- ── ALICANTE (3 eventos) ──────────────────────────────────────────────
(5,  'Vóley playa Alicante Postiguet',       '2026-06-12', '11:00', 'Alicante', 'Playa del Postiguet, Alicante',                            38.3469, -0.4795, 'Principiante', 'Mixto',     16, 50, 12, 7,  'open'),
(4,  'Running Alicante Explanada',           '2026-06-25', '08:00', 'Alicante', 'Explanada de España, Alicante',                             38.3452, -0.4810, 'Principiante', 'Mixto',     16, 65, 25, 9,  'open'),
(9,  'Golf Club Alicante',                   '2026-06-19', '09:00', 'Alicante', 'Golf Club Alicante, Av. Locutor Vicente Hipólito',           38.3709, -0.5071, 'Intermedio',   'Mixto',     18, 65,  8, 4,  'open'),

-- ── GRANADA (2 eventos) ───────────────────────────────────────────────
(7,  'Fútbol 11 Granada',                    '2026-06-13', '11:00', 'Granada', 'Ciudad Deportiva Granada, Av. del Fútbol Club',              37.1901, -3.6083, 'Intermedio',   'Masculino', 18, 40, 22, 15, 'open'),
(11, 'Ciclismo Sierra Nevada',               '2026-06-26', '07:00', 'Granada', 'Salida: Plaza del Triunfo, Granada',                         37.1773, -3.5986, 'Avanzado',     'Mixto',     20, 55, 20, 13, 'open'),

-- ── A CORUÑA (2 eventos) ──────────────────────────────────────────────
(1,  'Fútbol 7 A Coruña',                    '2026-06-07', '18:00', 'A Coruña', 'Campo de Fútbol Riazor, A Coruña',                         43.3671, -8.4180, 'Intermedio',   'Mixto',     18, 45, 14, 8,  'open'),
(4,  'Running frente marítimo A Coruña',     '2026-06-28', '09:00', 'A Coruña', 'Paseo Marítimo, inicio Torre de Hércules',                  43.3860, -8.4025, 'Principiante', 'Mixto',     16, 65, 30, 14, 'open'),

-- ── PALMA DE MALLORCA (3 eventos) ────────────────────────────────────
(8,  'Tenis Club Palma de Mallorca',         '2026-06-14', '10:00', 'Palma', 'Club de Tenis Mallorca, Av. Joan Miró 10',                    39.5696,  2.6502, 'Avanzado',     'Mixto',     18, 55,  4, 2,  'open'),
(5,  'Vóley playa Mallorca Can Pere Antoni', '2026-06-21', '11:00', 'Palma', 'Playa Can Pere Antoni, Palma de Mallorca',                    39.5569,  2.6281, 'Principiante', 'Mixto',     16, 50, 12, 6,  'open'),
(11, 'Ciclismo Mallorca Serra de Tramuntana','2026-06-29', '07:00', 'Palma', 'Salida: Parc de la Mar, Palma',                               39.5683,  2.6489, 'Avanzado',     'Mixto',     20, 55, 15, 9,  'open'),

-- ── VALLADOLID (2 eventos) ────────────────────────────────────────────
(2,  'Pádel Valladolid',                     '2026-06-11', '19:00', 'Valladolid', 'Club de Pádel Valladolid, Av. de Zamora 5',              41.6523, -4.7245, 'Principiante', 'Mixto',     16, 60,  4, 2,  'open'),
(6,  'Fútbol Sala Valladolid',               '2026-06-25', '20:30', 'Valladolid', 'Pabellón Pisuerga, Valladolid',                          41.6487, -4.7312, 'Intermedio',   'Mixto',     18, 45, 10, 5,  'open'),

-- ── SAN SEBASTIÁN (2 eventos) ─────────────────────────────────────────
(4,  'Running playa La Concha',              '2026-06-16', '08:00', 'San Sebastián', 'Paseo de la Concha, San Sebastián',                   43.3183, -2.0005, 'Intermedio',   'Mixto',     18, 60, 25, 10, 'open'),
(2,  'Pádel San Sebastián Ondarreta',        '2026-06-30', '10:00', 'San Sebastián', 'Club de Pádel Ondarreta, San Sebastián',              43.3133, -2.0091, 'Principiante', 'Mixto',     16, 60,  4, 1,  'open');
