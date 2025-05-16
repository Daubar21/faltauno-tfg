-- Migration 009: elimina todos los eventos existentes y los recrea con las
-- imágenes predeterminadas de Unsplash definidas en SPORT_IMAGES (eventImages.js).
-- ~70 eventos repartidos por toda España (Madrid, Barcelona, Valencia, Sevilla,
-- Bilbao, Zaragoza, Málaga, Alicante, Murcia, Granada, Valladolid, Vigo,
-- San Sebastián, Palma de Mallorca).

DELETE FROM swipe_history;
DELETE FROM event_participants;
DELETE FROM events;

DO $$
DECLARE
  v_futbol7   INTEGER;
  v_futsal    INTEGER;
  v_futbol11  INTEGER;
  v_padel     INTEGER;
  v_tenis     INTEGER;
  v_basket    INTEGER;
  v_running   INTEGER;
  v_voley     INTEGER;
  v_natacion  INTEGER;
  v_ciclismo  INTEGER;
  v_golf      INTEGER;
BEGIN
  SELECT id INTO v_futbol7   FROM sports WHERE name = 'Futbol 7';
  SELECT id INTO v_futsal    FROM sports WHERE name = 'Futbol Sala';
  SELECT id INTO v_futbol11  FROM sports WHERE name = 'Futbol 11';
  SELECT id INTO v_padel     FROM sports WHERE name = 'Padel';
  SELECT id INTO v_tenis     FROM sports WHERE name = 'Tenis';
  SELECT id INTO v_basket    FROM sports WHERE name = 'Baloncesto';
  SELECT id INTO v_running   FROM sports WHERE name = 'Running';
  SELECT id INTO v_voley     FROM sports WHERE name = 'Voley Playa';
  SELECT id INTO v_natacion  FROM sports WHERE name = 'Natacion';
  SELECT id INTO v_ciclismo  FROM sports WHERE name = 'Ciclismo';
  SELECT id INTO v_golf      FROM sports WHERE name = 'Golf';

  INSERT INTO events
    (sport_id, title, event_date, event_time, city, address, lat, lng,
     level, min_age, max_age, gender, total_places, current_participants,
     status, directions, image_url)
  VALUES

  -- ══════════════════════════════════════════════════════════════════════════
  -- FÚTBOL 7
  -- ══════════════════════════════════════════════════════════════════════════
  (v_futbol7, 'Fútbol 7 Aficionados Tarde',
   CURRENT_DATE+3,  '18:30', 'Madrid',    'Campo Municipal Vicálvaro, Av. de Arcentales',
   40.3970, -3.6100, 'Principiante', 18, 55, 'Mixto',     14, 0, 'open',
   'Hierba artificial, vestuarios disponibles. Buen ambiente sin presión.',
   'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=700&q=75'),

  (v_futbol7, 'Partido 7v7 Nivel Medio',
   CURRENT_DATE+8,  '20:30', 'Madrid',    'Ciudad Deportiva La Almudena, Av. de Entrevías',
   40.4050, -3.6350, 'Intermedio',   20, 40, 'Masculino', 14, 0, 'open',
   'Aparcamiento gratuito. Traer equipación oscura.',
   'https://plus.unsplash.com/premium_photo-1661826732309-af9cab19a951?auto=format&fit=crop&w=700&q=75'),

  (v_futbol7, 'Fútbol 7 Competitivo Noche',
   CURRENT_DATE+15, '21:00', 'Madrid',    'C. de Bravo Murillo 200, Tetuán',
   40.4530, -3.7020, 'Avanzado',     20, 38, 'Masculino', 14, 0, 'open',
   'Iluminación LED, pista cubierta. Se juega en serio.',
   'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=700&q=75'),

  (v_futbol7, 'Fútbol 7 Mixto Diagonal',
   CURRENT_DATE+5,  '19:00', 'Barcelona', 'Camp Municipal Nou Barris, Pl. de Llucmajor',
   41.4360,  2.1810, 'Intermedio',   20, 45, 'Mixto',     14, 0, 'open',
   'Hierba artificial. Metros: Roquetes (L3). Acceso libre.',
   'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=700&q=75'),

  (v_futbol7, 'Fútbol 7 Amistoso Valencia',
   CURRENT_DATE+11, '19:30', 'Valencia',  'Ciudad Deportiva de Paterna, Av. dels Esports',
   39.5190, -0.4430, 'Principiante', 18, 50, 'Mixto',     14, 0, 'open',
   'Parking gratuito. Campos de hierba artificial de calidad.',
   'https://plus.unsplash.com/premium_photo-1661826732309-af9cab19a951?auto=format&fit=crop&w=700&q=75'),

  (v_futbol7, 'Partido Fútbol 7 Sevilla',
   CURRENT_DATE+18, '20:00', 'Sevilla',   'Polideportivo San Pablo, Av. de San Lázaro',
   37.4010, -5.9600, 'Intermedio',   20, 40, 'Masculino', 14, 0, 'open',
   'Instalación municipal cubierta. Vestuarios incluidos.',
   'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=700&q=75'),

  (v_futbol7, 'Fútbol 7 Derio',
   CURRENT_DATE+9,  '20:00', 'Bilbao',    'Polideportivo Municipal Derio, C. Elexalde',
   43.2960, -2.8820, 'Principiante', 18, 50, 'Mixto',     14, 0, 'open',
   'Pista cubierta. Bus: línea 3625 hasta Derio.',
   'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=700&q=75'),

  (v_futbol7, 'Fútbol 7 Zaragoza Dominical',
   CURRENT_DATE+20, '10:30', 'Zaragoza',  'Polideportivo Miralbueno, C. de Muel',
   41.6300, -0.9650, 'Intermedio',   20, 45, 'Masculino', 14, 0, 'open',
   'Hierba artificial de última generación. Parking amplio.',
   'https://plus.unsplash.com/premium_photo-1661826732309-af9cab19a951?auto=format&fit=crop&w=700&q=75'),

  -- ══════════════════════════════════════════════════════════════════════════
  -- FÚTBOL SALA
  -- ══════════════════════════════════════════════════════════════════════════
  (v_futsal, 'Futsal Mixto Principiantes',
   CURRENT_DATE+5,  '19:00', 'Madrid',    'Centro Deportivo Moscardó, C. de Moscardó',
   40.4010, -3.7010, 'Principiante', 16, 60, 'Mixto',     10, 0, 'open',
   'Pista cubierta climatizada. Nadie se queda fuera.',
   'https://images.unsplash.com/photo-1587384474964-3a06ce1ce699?auto=format&fit=crop&w=700&q=75'),

  (v_futsal, 'Fútbol Sala Mixto Lunes',
   CURRENT_DATE+10, '21:00', 'Madrid',    'Polideportivo La Elipa, Av. de la Paz',
   40.4280, -3.6420, 'Intermedio',   18, 45, 'Mixto',     10, 0, 'open',
   'Pista interior con vestuarios. Partido semanal.',
   'https://images.unsplash.com/photo-1630420598913-44208d36f9af?auto=format&fit=crop&w=700&q=75'),

  (v_futsal, 'Futsal Liga Avanzado',
   CURRENT_DATE+19, '20:30', 'Madrid',    'Pabellón Municipal Vallecas, Av. de la Albufera',
   40.3800, -3.6640, 'Avanzado',     20, 38, 'Masculino', 10, 0, 'open',
   'Competición oficial. Traer equipación y zapatillas de sala.',
   'https://images.unsplash.com/photo-1676444920926-c8a084ec4003?auto=format&fit=crop&w=700&q=75'),

  (v_futsal, 'Futsal Palau Sant Jordi',
   CURRENT_DATE+7,  '21:00', 'Barcelona', 'Pavelló Olímpic de Badalona, Av. Alfons XIII',
   41.4500,  2.2430, 'Intermedio',   18, 45, 'Masculino', 10, 0, 'open',
   'Pista parqué. Metro: Badalona L2. Vestuarios modernos.',
   'https://images.unsplash.com/photo-1587384474964-3a06ce1ce699?auto=format&fit=crop&w=700&q=75'),

  (v_futsal, 'Futsal Valencia Noche',
   CURRENT_DATE+14, '21:30', 'Valencia',  'Polideportivo Benicalap, C. de Músico Magenti',
   39.4920, -0.3900, 'Principiante', 18, 50, 'Mixto',     10, 0, 'open',
   'Pista cubierta. Parking en la calle. Ambiente muy bueno.',
   'https://images.unsplash.com/photo-1630420598913-44208d36f9af?auto=format&fit=crop&w=700&q=75'),

  (v_futsal, 'Futsal Bilbao Indoor',
   CURRENT_DATE+22, '20:00', 'Bilbao',    'Polideportivo Miribilla, Paseo Miribilla',
   43.2520, -2.9180, 'Avanzado',     20, 40, 'Masculino', 10, 0, 'open',
   'Pabellón cubierto de alta calidad. Nivel exigente.',
   'https://images.unsplash.com/photo-1676444920926-c8a084ec4003?auto=format&fit=crop&w=700&q=75'),

  (v_futsal, 'Futsal Málaga Tarde',
   CURRENT_DATE+12, '19:30', 'Málaga',    'Polideportivo El Torcal, C. Héroe de Sostoa',
   36.7200, -4.4350, 'Intermedio',   18, 45, 'Mixto',     10, 0, 'open',
   'Instalación climatizada. Acceso en Metro: Atarazanas.',
   'https://images.unsplash.com/photo-1587384474964-3a06ce1ce699?auto=format&fit=crop&w=700&q=75'),

  -- ══════════════════════════════════════════════════════════════════════════
  -- FÚTBOL 11
  -- ══════════════════════════════════════════════════════════════════════════
  (v_futbol11, 'Fútbol 11 Amateur Domingo',
   CURRENT_DATE+7,  '10:00', 'Madrid',    'Ciudad Universitaria, Av. Complutense s/n',
   40.4440, -3.7290, 'Principiante', 18, 55, 'Mixto',     22, 0, 'open',
   'Césped natural. Buen rollo, sin presión. Concentración 30 min antes.',
   'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=700&q=75'),

  (v_futbol11, 'Partido Fútbol 11 Sábado',
   CURRENT_DATE+14, '11:00', 'Madrid',    'Campo de Carabanchel, Av. de Oporto 60',
   40.3850, -3.7420, 'Intermedio',   20, 45, 'Masculino', 22, 0, 'open',
   'Árbitro incluido. Traer equipación de color claro u oscuro.',
   'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=700&q=75'),

  (v_futbol11, 'Fútbol 11 Competición',
   CURRENT_DATE+21, '10:30', 'Madrid',    'Campo San Blas, C. de Arcos de Jalón',
   40.4200, -3.6200, 'Avanzado',     22, 40, 'Masculino', 22, 0, 'open',
   'Liga local. Compromiso y regularidad imprescindibles.',
   'https://plus.unsplash.com/premium_photo-1661826732309-af9cab19a951?auto=format&fit=crop&w=700&q=75'),

  (v_futbol11, 'Fútbol 11 Camp Nou Area',
   CURRENT_DATE+6,  '11:00', 'Barcelona', 'Camp Municipal Narcís Sala, C. de la Conreria',
   41.4200,  2.1960, 'Intermedio',   20, 45, 'Masculino', 22, 0, 'open',
   'Césped artificial. Metro: Mundet (L3). Vestuarios disponibles.',
   'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=700&q=75'),

  (v_futbol11, 'Fútbol 11 Sevilla Dominical',
   CURRENT_DATE+19, '10:00', 'Sevilla',   'Ciudad Deportiva Isla Mágica, Av. de los Descubrimientos',
   37.4060, -6.0020, 'Principiante', 18, 55, 'Mixto',     22, 0, 'open',
   'Campos de cesped sintético. Aparcamiento gratuito.',
   'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=700&q=75'),

  (v_futbol11, 'Fútbol 11 Valladolid',
   CURRENT_DATE+27, '11:00', 'Valladolid','Campo de Fútbol Pinar de Jalón, Ctra. de Burgos',
   41.6720, -4.7100, 'Avanzado',     22, 42, 'Masculino', 22, 0, 'open',
   'Liga amateur vallisoletana. Nivel competitivo real.',
   'https://plus.unsplash.com/premium_photo-1661826732309-af9cab19a951?auto=format&fit=crop&w=700&q=75'),

  (v_futbol11, 'Fútbol 11 Zaragoza',
   CURRENT_DATE+10, '10:30', 'Zaragoza',  'Ciudad Deportiva de Zaragoza, C. de Guillermo Pérez',
   41.6590, -0.9170, 'Intermedio',   20, 45, 'Masculino', 22, 0, 'open',
   'Campos de césped artificial. Parking gratuito.',
   'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=700&q=75'),

  -- ══════════════════════════════════════════════════════════════════════════
  -- PÁDEL
  -- ══════════════════════════════════════════════════════════════════════════
  (v_padel, 'Pádel Iniciación Mañana',
   CURRENT_DATE+2,  '10:00', 'Madrid',    'Club Top Pádel 20, Av. de Burgos 117',
   40.4850, -3.6650, 'Principiante', 16, 60, 'Mixto',      4, 0, 'open',
   'Monitor disponible. Raquetas prestadas. Duchas incluidas.',
   'https://images.unsplash.com/photo-1613870930431-a09c7139eb33?auto=format&fit=crop&w=700&q=75'),

  (v_padel, 'Pádel Femenino Tarde',
   CURRENT_DATE+9,  '19:00', 'Madrid',    'Club de Pádel Arturo Soria, C. de Arturo Soria 4',
   40.4600, -3.6720, 'Intermedio',   22, 50, 'Femenino',   4, 0, 'open',
   'Pistas cubiertas con luz. Bar y vestuarios.',
   'https://images.unsplash.com/photo-1612534847738-b3af9bc31f0c?auto=format&fit=crop&w=700&q=75'),

  (v_padel, 'Pádel Avanzado Competición',
   CURRENT_DATE+16, '20:00', 'Madrid',    'Pádel Indoor Moncloa, C. del Pintor Murillo',
   40.4360, -3.7180, 'Avanzado',     25, 45, 'Masculino',  4, 0, 'open',
   'Nivel alto exigido. Traer raqueta propia.',
   'https://images.unsplash.com/photo-1646649853703-7645147474ba?auto=format&fit=crop&w=700&q=75'),

  (v_padel, 'Pádel Mixto Barcelona',
   CURRENT_DATE+4,  '18:00', 'Barcelona', 'World Padel Tour, C. de Londres 80',
   41.3880,  2.1550, 'Intermedio',   20, 50, 'Mixto',      4, 0, 'open',
   'Pistas indoor de competición. Metro: Hospital Clínic (L5).',
   'https://images.unsplash.com/photo-1613870930431-a09c7139eb33?auto=format&fit=crop&w=700&q=75'),

  (v_padel, 'Pádel Málaga Costa Sol',
   CURRENT_DATE+11, '10:00', 'Málaga',    'Mijas Pádel Club, Urbanización La Cala',
   36.6080, -4.7150, 'Principiante', 18, 60, 'Mixto',      4, 0, 'open',
   'Pistas al aire libre con vistas al mar. Muy buenas instalaciones.',
   'https://images.unsplash.com/photo-1612534847738-b3af9bc31f0c?auto=format&fit=crop&w=700&q=75'),

  (v_padel, 'Pádel Femenino Alicante',
   CURRENT_DATE+18, '11:00', 'Alicante',  'Club Pádel Alicante, Av. de Denia 72',
   38.3720, -0.4660, 'Intermedio',   20, 50, 'Femenino',   4, 0, 'open',
   'Pistas cubiertas. Gran ambiente femenino. Parkng gratuito.',
   'https://images.unsplash.com/photo-1646649853703-7645147474ba?auto=format&fit=crop&w=700&q=75'),

  (v_padel, 'Pádel Avanzado Bilbao',
   CURRENT_DATE+25, '19:30', 'Bilbao',    'Pádel Indoor Bilbao, C. de Autonomía 52',
   43.2670, -2.9450, 'Avanzado',     22, 45, 'Masculino',  4, 0, 'open',
   'Pistas de cristal. Liga vasca de pádel. Muy buen nivel.',
   'https://images.unsplash.com/photo-1613870930431-a09c7139eb33?auto=format&fit=crop&w=700&q=75'),

  (v_padel, 'Pádel Mixto Valencia',
   CURRENT_DATE+6,  '17:00', 'Valencia',  'Valencia Pádel Indoor, C. de La Safor 12',
   39.4780, -0.3870, 'Principiante', 18, 55, 'Mixto',      4, 0, 'open',
   'Pistas cubiertas. Monitor disponible para principiantes.',
   'https://images.unsplash.com/photo-1612534847738-b3af9bc31f0c?auto=format&fit=crop&w=700&q=75'),

  -- ══════════════════════════════════════════════════════════════════════════
  -- TENIS
  -- ══════════════════════════════════════════════════════════════════════════
  (v_tenis, 'Tenis para Principiantes',
   CURRENT_DATE+4,  '10:00', 'Madrid',    'Club de Tenis El Olivar, C. de Valdebernardo',
   40.4050, -3.6380, 'Principiante', 16, 65, 'Mixto',      2, 0, 'open',
   'Profesor disponible. Raquetas prestadas. Ideal para empezar.',
   'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=700&q=75'),

  (v_tenis, 'Tenis Dobles Femenino',
   CURRENT_DATE+12, '11:00', 'Madrid',    'Real Club de Tenis La Moraleja, Av. de Europa',
   40.4900, -3.6380, 'Intermedio',   20, 50, 'Femenino',   4, 0, 'open',
   'Pistas de tierra batida. Dobles. Ambiente relajado.',
   'https://images.unsplash.com/flagged/photo-1576972405668-2d020a01cbfa?auto=format&fit=crop&w=700&q=75'),

  (v_tenis, 'Tenis Avanzado Tarde',
   CURRENT_DATE+20, '18:00', 'Madrid',    'Parque Deportivo Puerta de Hierro',
   40.4550, -3.7420, 'Avanzado',     22, 45, 'Masculino',  2, 0, 'open',
   'Pistas de hierba. Competición amistosa de alto nivel.',
   'https://images.unsplash.com/photo-1516742720271-6ae39cbc5bd1?auto=format&fit=crop&w=700&q=75'),

  (v_tenis, 'Tenis Mixto Barcelona',
   CURRENT_DATE+8,  '10:30', 'Barcelona', 'Real Club de Tenis del Turó, C. de Ganduxer',
   41.4050,  2.1350, 'Intermedio',   20, 55, 'Mixto',      4, 0, 'open',
   'Club histórico de Barcelona. Tierra batida de calidad.',
   'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=700&q=75'),

  (v_tenis, 'Tenis Donostia Verano',
   CURRENT_DATE+17, '11:00', 'San Sebastián','Real Club de Tenis de San Sebastián, Ategorrieta',
   43.3250, -1.9640, 'Principiante', 18, 65, 'Mixto',      2, 0, 'open',
   'Club con vistas al mar. Pistas de tierra batida exteriores.',
   'https://images.unsplash.com/flagged/photo-1576972405668-2d020a01cbfa?auto=format&fit=crop&w=700&q=75'),

  (v_tenis, 'Tenis Avanzado Valencia',
   CURRENT_DATE+24, '18:30', 'Valencia',  'Club de Tenis Valencia, Av. de Pío XII',
   39.4820, -0.3620, 'Avanzado',     22, 45, 'Masculino',  2, 0, 'open',
   'Pistas de cemento. Competición local. Nivel exigente.',
   'https://images.unsplash.com/photo-1516742720271-6ae39cbc5bd1?auto=format&fit=crop&w=700&q=75'),

  (v_tenis, 'Tenis Palma Mañana',
   CURRENT_DATE+13, '09:30', 'Palma de Mallorca','Club de Tenis Príncipes de España, Palma',
   39.5850,  2.6590, 'Intermedio',   20, 55, 'Mixto',      4, 0, 'open',
   'Pistas al aire libre con vistas. Club con restaurante.',
   'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=700&q=75'),

  -- ══════════════════════════════════════════════════════════════════════════
  -- BALONCESTO
  -- ══════════════════════════════════════════════════════════════════════════
  (v_basket, 'Basket 3x3 Fin de Semana',
   CURRENT_DATE+3,  '11:00', 'Madrid',    'Parque del Retiro, Pista entrada Alcalá',
   40.4153, -3.6843, 'Principiante', 16, 40, 'Mixto',      6, 0, 'open',
   'Pista al aire libre. Todos los niveles bienvenidos.',
   'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=700&q=75'),

  (v_basket, 'Baloncesto 5x5 Femenino',
   CURRENT_DATE+9,  '19:00', 'Madrid',    'Polideportivo Moscardó, C. de Moscardó',
   40.4010, -3.7010, 'Intermedio',   18, 40, 'Femenino',  10, 0, 'open',
   'Pista cubierta climatizada. Gran ambiente.',
   'https://images.unsplash.com/photo-1627627256672-027a4613d028?auto=format&fit=crop&w=700&q=75'),

  (v_basket, 'Basket Liga Avanzado',
   CURRENT_DATE+16, '20:00', 'Madrid',    'Polideportivo Hortaleza, C. de Silvano',
   40.4720, -3.6400, 'Avanzado',     20, 40, 'Masculino', 10, 0, 'open',
   'Liga local. Traer zapatillas de pista.',
   'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=700&q=75'),

  (v_basket, 'Basket 5x5 Gracia',
   CURRENT_DATE+6,  '20:30', 'Barcelona', 'Pavelló Municipal de Gracia, C. de Perill',
   41.4050,  2.1530, 'Intermedio',   18, 40, 'Masculino', 10, 0, 'open',
   'Pista cubierta. Metro: Diagonal (L3/L5). Nivel medio-alto.',
   'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=700&q=75'),

  (v_basket, 'Basket Bilbao 3x3',
   CURRENT_DATE+12, '18:00', 'Bilbao',    'Polideportivo Basarrate, Av. de Basarrate',
   43.2780, -2.9100, 'Principiante', 16, 45, 'Mixto',      6, 0, 'open',
   'Pista exterior cubierta. Acceso metro: Basarrate (L2).',
   'https://images.unsplash.com/photo-1627627256672-027a4613d028?auto=format&fit=crop&w=700&q=75'),

  (v_basket, 'Basket Valencia ACB Amateur',
   CURRENT_DATE+21, '20:30', 'Valencia',  'Pabellón Fuente de San Luis, Av. de Giorgeta',
   39.4640, -0.3770, 'Avanzado',     20, 40, 'Masculino', 10, 0, 'open',
   'Pabellón cubierto. Nivel alto, dinámica de equipo real.',
   'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=700&q=75'),

  (v_basket, 'Basket Mixto Sevilla',
   CURRENT_DATE+8,  '19:00', 'Sevilla',   'Polideportivo San Pablo, Av. de San Lázaro',
   37.4010, -5.9600, 'Intermedio',   18, 45, 'Mixto',     10, 0, 'open',
   'Pista cubierta bien mantenida. Buen rollo garantizado.',
   'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=700&q=75'),

  -- ══════════════════════════════════════════════════════════════════════════
  -- RUNNING
  -- ══════════════════════════════════════════════════════════════════════════
  (v_running, 'Running Matutino Retiro',
   CURRENT_DATE+2,  '08:00', 'Madrid',    'Parque del Retiro, entrada Alcalá',
   40.4153, -3.6843, 'Principiante', 16, 60, 'Mixto',     20, 0, 'open',
   'Quedada en la fuente de la entrada Alcalá. Ritmo suave.',
   'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=700&q=75'),

  (v_running, 'Carrera 10K Popular',
   CURRENT_DATE+9,  '08:30', 'Madrid',    'Paseo de la Castellana frente al Bernabéu',
   40.4530, -3.6920, 'Intermedio',   18, 55, 'Mixto',     30, 0, 'open',
   'Salida puntual. Ritmo 5:30 min/km. Llevar hidratación.',
   'https://images.unsplash.com/photo-1590333748338-d629e4564ad9?auto=format&fit=crop&w=700&q=75'),

  (v_running, 'Ruta Nocturna Casa de Campo',
   CURRENT_DATE+17, '21:00', 'Madrid',    'Casa de Campo, Aparcamiento Los Pinos',
   40.4100, -3.7450, 'Avanzado',     20, 45, 'Masculino', 15, 0, 'open',
   '12 km. Linterna frontal obligatoria. Ritmo rápido.',
   'https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=700&q=75'),

  (v_running, 'Running Barceloneta Amanecer',
   CURRENT_DATE+5,  '07:30', 'Barcelona', 'Playa de la Barceloneta, Passeig Marítim',
   41.3782,  2.1925, 'Principiante', 18, 60, 'Mixto',     25, 0, 'open',
   'Ruta por el Passeig Marítim. 8 km ida y vuelta. Ritmo libre.',
   'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=700&q=75'),

  (v_running, 'Ruta Parque Guadalquivir',
   CURRENT_DATE+12, '08:00', 'Sevilla',   'Parque del Alamillo, acceso Puerta Sur',
   37.4280, -5.9900, 'Intermedio',   18, 55, 'Femenino',  20, 0, 'open',
   'Ruta de 10 km por el parque. Sombra toda la ruta.',
   'https://images.unsplash.com/photo-1590333748338-d629e4564ad9?auto=format&fit=crop&w=700&q=75'),

  (v_running, 'Running Malagueta Costa',
   CURRENT_DATE+19, '08:00', 'Málaga',    'Paseo Marítimo Pablo Ruiz Picasso',
   36.7200, -4.4050, 'Principiante', 16, 65, 'Mixto',     30, 0, 'open',
   'Ruta costera de 8 km. Preciosas vistas al mar.',
   'https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=700&q=75'),

  (v_running, 'Trail Running Vigo Rías',
   CURRENT_DATE+28, '09:00', 'Vigo',      'Parque Natural Baixa Limia, acceso Vigo',
   42.2220, -8.7350, 'Avanzado',     20, 50, 'Mixto',     15, 0, 'open',
   'Trail de 18 km por las Rías Baixas. Imprescindible calzado trail.',
   'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=700&q=75'),

  (v_running, 'Running Valencia Turia',
   CURRENT_DATE+7,  '08:00', 'Valencia',  'Jardín del Turia, Pont de Campanar',
   39.4800, -0.3980, 'Intermedio',   18, 55, 'Mixto',     25, 0, 'open',
   'Ruta por el jardín del Turia, 12 km sin semáforos.',
   'https://images.unsplash.com/photo-1590333748338-d629e4564ad9?auto=format&fit=crop&w=700&q=75'),

  -- ══════════════════════════════════════════════════════════════════════════
  -- VÓLEY PLAYA
  -- ══════════════════════════════════════════════════════════════════════════
  (v_voley, 'Vóley Playa Recreativo Madrid',
   CURRENT_DATE+5,  '17:00', 'Madrid',    'Arena Madrid, C. del Príncipe de Vergara 2',
   40.4320, -3.6780, 'Principiante', 18, 55, 'Mixto',      8, 0, 'open',
   'Arena sintética de calidad. Monitor disponible.',
   'https://images.unsplash.com/photo-1592656094267-764a45160876?auto=format&fit=crop&w=700&q=75'),

  (v_voley, 'Vóley Playa Femenino Madrid',
   CURRENT_DATE+11, '18:00', 'Madrid',    'Polideportivo Mar de Cristal, C. de Mateo Inurria',
   40.4750, -3.6200, 'Intermedio',   20, 45, 'Femenino',   8, 0, 'open',
   'Arena sintética premium. Vestuarios modernos.',
   'https://plus.unsplash.com/premium_photo-1708696216326-0317bac37b82?auto=format&fit=crop&w=700&q=75'),

  (v_voley, 'Torneo Vóley 4v4 Madrid',
   CURRENT_DATE+22, '16:00', 'Madrid',    'Playa de Madrid, Casa de Campo',
   40.4100, -3.7450, 'Avanzado',     20, 45, 'Mixto',     16, 0, 'open',
   'Torneo 4v4. Árbitro incluido. Traer equipo formado.',
   'https://images.unsplash.com/photo-1553005746-9245ba190489?auto=format&fit=crop&w=700&q=75'),

  (v_voley, 'Vóley Barceloneta',
   CURRENT_DATE+4,  '17:30', 'Barcelona', 'Playa de la Barceloneta, Pistas de Vóley',
   41.3780,  2.1940, 'Intermedio',   18, 45, 'Mixto',      8, 0, 'open',
   'Pistas de arena natural. Reserva plaza con antelación.',
   'https://images.unsplash.com/photo-1592656094267-764a45160876?auto=format&fit=crop&w=700&q=75'),

  (v_voley, 'Vóley Playa Malvarrosa',
   CURRENT_DATE+10, '18:00', 'Valencia',  'Playa de la Malvarrosa, Zona Deportiva',
   39.4779, -0.3266, 'Principiante', 18, 55, 'Mixto',      8, 0, 'open',
   'Arena natural. Muy buen ambiente. Abierto a todos los niveles.',
   'https://plus.unsplash.com/premium_photo-1708696216326-0317bac37b82?auto=format&fit=crop&w=700&q=75'),

  (v_voley, 'Torneo Vóley Playa Málaga',
   CURRENT_DATE+16, '16:00', 'Málaga',    'Playa de la Malagueta, Paseo Marítimo',
   36.7196, -4.4109, 'Avanzado',     20, 45, 'Mixto',     16, 0, 'open',
   'Torneo oficial en playa natural. Equipos de 4. Gran ambiente.',
   'https://images.unsplash.com/photo-1553005746-9245ba190489?auto=format&fit=crop&w=700&q=75'),

  (v_voley, 'Vóley Playa Alicante',
   CURRENT_DATE+23, '17:00', 'Alicante',  'Playa del Postiguet, Zona Deportiva Municipal',
   38.3510, -0.4790, 'Intermedio',   20, 50, 'Femenino',   8, 0, 'open',
   'Playa urbana con redes fijas. Buen ambiente femenino.',
   'https://images.unsplash.com/photo-1592656094267-764a45160876?auto=format&fit=crop&w=700&q=75'),

  (v_voley, 'Vóley Playa Palma',
   CURRENT_DATE+30, '17:30', 'Palma de Mallorca', 'Playa de Can Pere Antoni, Passeig Marítim',
   39.5680,  2.6370, 'Principiante', 18, 55, 'Mixto',      8, 0, 'open',
   'Playa preciosa con redes. Todos los niveles bienvenidos.',
   'https://plus.unsplash.com/premium_photo-1708696216326-0317bac37b82?auto=format&fit=crop&w=700&q=75'),

  -- ══════════════════════════════════════════════════════════════════════════
  -- NATACIÓN
  -- ══════════════════════════════════════════════════════════════════════════
  (v_natacion, 'Natación Principiantes Mañana',
   CURRENT_DATE+2,  '07:00', 'Madrid',    'Piscina Municipal La Latina, C. de la Paloma',
   40.4050, -3.7150, 'Principiante', 16, 65, 'Mixto',     15, 0, 'open',
   'Carril lento disponible. Traer gorro y gafas.',
   'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=700&q=75'),

  (v_natacion, 'Natación Femenino Intermedias',
   CURRENT_DATE+10, '07:30', 'Madrid',    'Piscina Olímpica Vallehermoso, C. de Martín de los Heros',
   40.4380, -3.7200, 'Intermedio',   18, 55, 'Femenino',  12, 0, 'open',
   'Carril exclusivo para el grupo. Mínimo 1 km por sesión.',
   'https://images.unsplash.com/photo-1560090995-01632a28895b?auto=format&fit=crop&w=700&q=75'),

  (v_natacion, 'Entrenamiento Natación Avanzado',
   CURRENT_DATE+18, '07:00', 'Madrid',    'Piscina Municipal Chamartín, C. de Bolivia',
   40.4650, -3.6810, 'Avanzado',     18, 45, 'Masculino', 10, 0, 'open',
   'Entrenamiento técnico con series. Mínimo 2 km por sesión.',
   'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=700&q=75'),

  (v_natacion, 'Natación Piscina Bernat Picornell',
   CURRENT_DATE+6,  '07:30', 'Barcelona', 'Piscines Bernat Picornell, Av. de l''Estadi',
   41.3660,  2.1500, 'Principiante', 18, 65, 'Mixto',     15, 0, 'open',
   'Piscina olímpica. Metro: Espanya (L1/L3). Gorro obligatorio.',
   'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=700&q=75'),

  (v_natacion, 'Natación Valencia Piscina Ayora',
   CURRENT_DATE+15, '08:00', 'Valencia',  'Piscina Municipal Ayora, C. de Segorbe',
   39.4740, -0.3550, 'Intermedio',   18, 55, 'Femenino',  12, 0, 'open',
   'Piscina climatizada. Vestuarios modernos. Carril reservado.',
   'https://images.unsplash.com/photo-1560090995-01632a28895b?auto=format&fit=crop&w=700&q=75'),

  (v_natacion, 'Natación Murcia Avanzado',
   CURRENT_DATE+24, '07:00', 'Murcia',    'Piscina de Atletismo de Murcia, Av. Infante Juan Manuel',
   37.9840, -1.1250, 'Avanzado',     20, 45, 'Masculino', 10, 0, 'open',
   'Piscina de 50 m. Entrenamiento técnico de alto nivel.',
   'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=700&q=75'),

  (v_natacion, 'Natación Sevilla Polideportivo',
   CURRENT_DATE+13, '08:00', 'Sevilla',   'Piscina Municipal Los Bermejales, C. de Hytasa',
   37.3720, -5.9970, 'Principiante', 16, 60, 'Mixto',     15, 0, 'open',
   'Piscina cubierta. Ambiente muy tranquilo y acogedor.',
   'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=700&q=75'),

  -- ══════════════════════════════════════════════════════════════════════════
  -- CICLISMO
  -- ══════════════════════════════════════════════════════════════════════════
  (v_ciclismo, 'Ruta Ciclista Principiantes',
   CURRENT_DATE+4,  '08:00', 'Madrid',    'Casa de Campo, Aparcamiento Los Pinos',
   40.4100, -3.7450, 'Principiante', 16, 65, 'Mixto',     20, 0, 'open',
   'Ruta de 25 km por carril bici. Ritmo suave.',
   'https://images.unsplash.com/photo-1681295692638-97ace05f56b4?auto=format&fit=crop&w=700&q=75'),

  (v_ciclismo, 'Ruta MTB Intermedia',
   CURRENT_DATE+13, '09:00', 'Madrid',    'Bosque de El Pardo, entrada principal',
   40.5050, -3.7500, 'Intermedio',   20, 50, 'Masculino', 15, 0, 'open',
   'MTB por senderos del Pardo. Bicicleta de montaña obligatoria.',
   'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=700&q=75'),

  (v_ciclismo, 'Ruta Cicloturista de Montaña',
   CURRENT_DATE+22, '07:30', 'Madrid',    'Salida: Puerto de Navacerrada',
   40.7800, -4.0100, 'Avanzado',     22, 50, 'Mixto',     12, 0, 'open',
   '80 km con 1.200 m desnivel. Bici de carretera imprescindible.',
   'https://images.unsplash.com/photo-1631276893368-554b60393efb?auto=format&fit=crop&w=700&q=75'),

  (v_ciclismo, 'Vuelta Bilbao en Bici',
   CURRENT_DATE+8,  '09:00', 'Bilbao',    'Parque de Doña Casilda, entrada principal',
   43.2630, -2.9500, 'Principiante', 18, 60, 'Mixto',     20, 0, 'open',
   'Ruta urbana de 30 km por la ría. Bici urbana o carretera.',
   'https://images.unsplash.com/photo-1681295692638-97ace05f56b4?auto=format&fit=crop&w=700&q=75'),

  (v_ciclismo, 'Cicloturista Costa Brava',
   CURRENT_DATE+16, '08:30', 'Barcelona', 'Carretera de les Aigues, entrada Vallvidrera',
   41.4090,  2.0960, 'Intermedio',   20, 55, 'Mixto',     15, 0, 'open',
   '40 km con vistas al mar y Tibidabo. Bici carretera o gravel.',
   'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=700&q=75'),

  (v_ciclismo, 'Ruta Sierra Nevada',
   CURRENT_DATE+25, '07:00', 'Granada',   'Salida: Prado Llano, Sierra Nevada',
   37.0960, -3.4020, 'Avanzado',     22, 48, 'Masculino', 10, 0, 'open',
   '60 km con 1.500 m desnivel por Sierra Nevada. Solo road bikes.',
   'https://images.unsplash.com/photo-1631276893368-554b60393efb?auto=format&fit=crop&w=700&q=75'),

  (v_ciclismo, 'Paseo Ciclista Valencia Turia',
   CURRENT_DATE+10, '09:00', 'Valencia',  'Jardín del Turia, Pont de Fusta',
   39.4760, -0.3580, 'Principiante', 16, 65, 'Femenino',  20, 0, 'open',
   'Ruta de 20 km por el río Turia. Ideal para ciclistas tranquilas.',
   'https://images.unsplash.com/photo-1681295692638-97ace05f56b4?auto=format&fit=crop&w=700&q=75'),

  (v_ciclismo, 'Cicloturista Vías Verdes Murcia',
   CURRENT_DATE+31, '08:30', 'Murcia',    'Vía Verde del Noroeste, estación de Murcia',
   37.9920, -1.1340, 'Intermedio',   18, 55, 'Mixto',     18, 0, 'open',
   '35 km por antigua vía del tren reconvertida. Apta para todas las bicis.',
   'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=700&q=75'),

  -- ══════════════════════════════════════════════════════════════════════════
  -- GOLF
  -- ══════════════════════════════════════════════════════════════════════════
  (v_golf, 'Golf Iniciación con Monitor',
   CURRENT_DATE+6,  '09:00', 'Madrid',    'Club de Golf La Herrería, El Escorial',
   40.5900, -4.1400, 'Principiante', 18, 70, 'Mixto',      4, 0, 'open',
   'Incluye alquiler de palos y bola. Instructor presente.',
   'https://plus.unsplash.com/premium_photo-1679710943658-1565004c00ac?auto=format&fit=crop&w=700&q=75'),

  (v_golf, 'Golf Intermedio 9 Hoyos',
   CURRENT_DATE+15, '10:00', 'Madrid',    'Real Club de Golf La Moraleja, Alcobendas',
   40.4900, -3.6380, 'Intermedio',   25, 65, 'Masculino',  4, 0, 'open',
   'Jugamos los primeros 9 hoyos. Hándicap mínimo 36.',
   'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=700&q=75'),

  (v_golf, 'Torneo Golf Friendly Stableford',
   CURRENT_DATE+26, '09:30', 'Madrid',    'Club de Golf Retamares, Alcorcón',
   40.3600, -3.8250, 'Avanzado',     25, 65, 'Mixto',      8, 0, 'open',
   'Torneo Stableford. Hándicap máximo 28. Premiamos los 3 primeros.',
   'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=700&q=75'),

  (v_golf, 'Golf Costa del Sol',
   CURRENT_DATE+9,  '09:00', 'Málaga',    'Club de Golf Aloha, Marbella',
   36.5050, -4.9540, 'Intermedio',   25, 70, 'Mixto',      4, 0, 'open',
   'Campo de 18 hoyos con vistas al mar. Alquiler de palos disponible.',
   'https://plus.unsplash.com/premium_photo-1679710943658-1565004c00ac?auto=format&fit=crop&w=700&q=75'),

  (v_golf, 'Golf Palma Iniciación',
   CURRENT_DATE+18, '09:30', 'Palma de Mallorca', 'Club de Golf Son Antem, Llucmajor',
   39.4830,  2.8910, 'Principiante', 20, 70, 'Masculino',  4, 0, 'open',
   'Campo espectacular. Monitor en castellano. Palos de alquiler incluidos.',
   'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=700&q=75'),

  (v_golf, 'Torneo Golf Sevilla',
   CURRENT_DATE+30, '09:00', 'Sevilla',   'Real Betis Balompié Golf, Bormujos',
   37.3760, -6.0680, 'Avanzado',     25, 65, 'Mixto',      8, 0, 'open',
   'Torneo en campo de 18 hoyos. Experiencia mínima recomendada.',
   'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=700&q=75');

END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- Participantes simulados para dar realismo al deck de swipe.
-- Se actualiza current_participants y status (full cuando se alcanza el aforo).
-- Los eventos no incluidos aquí quedan con 0 participantes (recién publicados).
-- ══════════════════════════════════════════════════════════════════════════════
UPDATE events AS e
SET
  current_participants = v.cnt,
  status               = CASE WHEN v.cnt >= e.total_places THEN 'full' ELSE 'open' END
FROM (VALUES
  -- FÚTBOL 7
  ('Fútbol 7 Aficionados Tarde'::text,        8::integer),
  ('Partido 7v7 Nivel Medio',                12),
  ('Fútbol 7 Competitivo Noche',             14),  -- full
  ('Fútbol 7 Mixto Diagonal',                 6),
  ('Fútbol 7 Amistoso Valencia',              3),
  ('Partido Fútbol 7 Sevilla',               11),
  ('Fútbol 7 Derio',                          4),

  -- FÚTBOL SALA
  ('Futsal Mixto Principiantes',              5),
  ('Fútbol Sala Mixto Lunes',                10),  -- full
  ('Futsal Liga Avanzado',                    7),
  ('Futsal Palau Sant Jordi',                 8),
  ('Futsal Valencia Noche',                   2),
  ('Futsal Bilbao Indoor',                   10),  -- full
  ('Futsal Málaga Tarde',                     4),

  -- FÚTBOL 11
  ('Fútbol 11 Amateur Domingo',              14),
  ('Partido Fútbol 11 Sábado',              20),
  ('Fútbol 11 Camp Nou Area',               16),
  ('Fútbol 11 Sevilla Dominical',            8),
  ('Fútbol 11 Valladolid',                  22),  -- full
  ('Fútbol 11 Zaragoza',                    10),

  -- PÁDEL
  ('Pádel Iniciación Mañana',                2),
  ('Pádel Femenino Tarde',                   4),  -- full
  ('Pádel Avanzado Competición',             3),
  ('Pádel Mixto Barcelona',                  4),  -- full
  ('Pádel Málaga Costa Sol',                 1),
  ('Pádel Femenino Alicante',                2),
  ('Pádel Avanzado Bilbao',                  4),  -- full

  -- TENIS
  ('Tenis para Principiantes',               1),
  ('Tenis Dobles Femenino',                  3),
  ('Tenis Avanzado Tarde',                   2),  -- full
  ('Tenis Mixto Barcelona',                  2),
  ('Tenis Avanzado Valencia',                2),  -- full
  ('Tenis Palma Mañana',                     1),

  -- BALONCESTO
  ('Basket 3x3 Fin de Semana',               4),
  ('Baloncesto 5x5 Femenino',                8),
  ('Basket Liga Avanzado',                  10),  -- full
  ('Basket 5x5 Gracia',                      6),
  ('Basket Bilbao 3x3',                      3),
  ('Basket Valencia ACB Amateur',            9),
  ('Basket Mixto Sevilla',                   5),

  -- RUNNING
  ('Running Matutino Retiro',               12),
  ('Carrera 10K Popular',                   22),
  ('Ruta Nocturna Casa de Campo',           15),  -- full
  ('Running Barceloneta Amanecer',          10),
  ('Ruta Parque Guadalquivir',               7),
  ('Running Malagueta Costa',                5),
  ('Trail Running Vigo Rías',                3),
  ('Running Valencia Turia',                18),

  -- VÓLEY PLAYA
  ('Vóley Playa Recreativo Madrid',          5),
  ('Vóley Playa Femenino Madrid',            8),  -- full
  ('Torneo Vóley 4v4 Madrid',              12),
  ('Vóley Barceloneta',                      7),
  ('Vóley Playa Malvarrosa',                 3),
  ('Torneo Vóley Playa Málaga',            16),  -- full
  ('Vóley Playa Alicante',                   6),
  ('Vóley Playa Palma',                      2),

  -- NATACIÓN
  ('Natación Principiantes Mañana',          9),
  ('Natación Femenino Intermedias',         11),
  ('Entrenamiento Natación Avanzado',       10),  -- full
  ('Natación Piscina Bernat Picornell',      6),
  ('Natación Valencia Piscina Ayora',        8),
  ('Natación Murcia Avanzado',               4),
  ('Natación Sevilla Polideportivo',         3),

  -- CICLISMO
  ('Ruta Ciclista Principiantes',           14),
  ('Ruta MTB Intermedia',                   12),
  ('Vuelta Bilbao en Bici',                  8),
  ('Cicloturista Costa Brava',              11),
  ('Ruta Sierra Nevada',                    10),  -- full
  ('Paseo Ciclista Valencia Turia',          5),
  ('Cicloturista Vías Verdes Murcia',        7),

  -- GOLF
  ('Golf Iniciación con Monitor',            2),
  ('Golf Intermedio 9 Hoyos',               4),  -- full
  ('Torneo Golf Friendly Stableford',        6),
  ('Golf Costa del Sol',                     3),
  ('Golf Palma Iniciación',                  1),
  ('Torneo Golf Sevilla',                    8)   -- full
) AS v(title, cnt)
WHERE e.title = v.title;
