-- ============================================================
-- Migración 003: Fotos correctas por deporte + más eventos
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Limpiar datos anteriores (seed duplicado de schema.sql + 001)
--    CASCADE elimina event_participants y swipe_history relacionados
DELETE FROM events;

-- 2. Insertar ~90 eventos con imágenes correctas por deporte
DO $$
DECLARE
  v_futbol   INTEGER;
  v_futsal   INTEGER;
  v_fut11    INTEGER;
  v_padel    INTEGER;
  v_tenis    INTEGER;
  v_basket   INTEGER;
  v_running  INTEGER;
  v_voley    INTEGER;
  v_natacion INTEGER;
  v_cicl     INTEGER;
  v_golf     INTEGER;

  -- ── Imágenes por deporte (verificadas, una por una) ──────────────────
  -- FÚTBOL: hierba, jugadores, balón
  img_fut1  TEXT := 'https://images.unsplash.com/photo-1551958219-acbc595d5646?auto=format&fit=crop&w=800&q=80';
  img_fut2  TEXT := 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80';
  img_fut3  TEXT := 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=800&q=80';

  -- FÚTBOL SALA: pabellón cubierto
  img_fs1   TEXT := 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=80';
  img_fs2   TEXT := 'https://images.unsplash.com/photo-1607453998774-d533f65dac99?auto=format&fit=crop&w=800&q=80';

  -- PÁDEL: pista de pádel con paredes de cristal (≠ tenis)
  img_pad1  TEXT := 'https://images.unsplash.com/photo-1594734415741-d02aabb76d70?auto=format&fit=crop&w=800&q=80';
  img_pad2  TEXT := 'https://images.unsplash.com/photo-1611251486360-b0b2a46fe1ae?auto=format&fit=crop&w=800&q=80';
  img_pad3  TEXT := 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80';

  -- TENIS: pista exterior, jugador con raqueta
  img_ten1  TEXT := 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80';
  img_ten2  TEXT := 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80';
  img_ten3  TEXT := 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=800&q=80';

  -- BALONCESTO: canasta, jugadores en pista
  img_bas1  TEXT := 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80';
  img_bas2  TEXT := 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=800&q=80';
  img_bas3  TEXT := 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=800&q=80';

  -- RUNNING: corredores en parque/ciudad
  img_run1  TEXT := 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80';
  img_run2  TEXT := 'https://images.unsplash.com/photo-1502904550040-7534597429ae?auto=format&fit=crop&w=800&q=80';
  img_run3  TEXT := 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&w=800&q=80';

  -- VÓLEY PLAYA: arena, red, jugadores en playa
  img_vol1  TEXT := 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80';
  img_vol2  TEXT := 'https://images.unsplash.com/photo-1591117207239-788bf8de6c3b?auto=format&fit=crop&w=800&q=80';
  img_vol3  TEXT := 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=800&q=80';

  -- NATACIÓN: piscina, carriles, nadadores
  img_nat1  TEXT := 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80';
  img_nat2  TEXT := 'https://images.unsplash.com/photo-1560090995-01632a28895b?auto=format&fit=crop&w=800&q=80';
  img_nat3  TEXT := 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=800&q=80';

  -- CICLISMO: ciclistas en carretera/montaña
  img_cic1  TEXT := 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80';
  img_cic2  TEXT := 'https://images.unsplash.com/photo-1534155571944-bdc4afaa42df?auto=format&fit=crop&w=800&q=80';
  img_cic3  TEXT := 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80';

  -- GOLF: campo de golf, hoyo, jugador
  img_gol1  TEXT := 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=800&q=80';
  img_gol2  TEXT := 'https://images.unsplash.com/photo-1599507593548-0187ac4043f4?auto=format&fit=crop&w=800&q=80';
  img_gol3  TEXT := 'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=800&q=80';

BEGIN
  SELECT id INTO v_futbol   FROM sports WHERE name = 'Futbol 7';
  SELECT id INTO v_futsal   FROM sports WHERE name = 'Futbol Sala';
  SELECT id INTO v_fut11    FROM sports WHERE name = 'Futbol 11';
  SELECT id INTO v_padel    FROM sports WHERE name = 'Padel';
  SELECT id INTO v_tenis    FROM sports WHERE name = 'Tenis';
  SELECT id INTO v_basket   FROM sports WHERE name = 'Baloncesto';
  SELECT id INTO v_running  FROM sports WHERE name = 'Running';
  SELECT id INTO v_voley    FROM sports WHERE name = 'Voley Playa';
  SELECT id INTO v_natacion FROM sports WHERE name = 'Natacion';
  SELECT id INTO v_cicl     FROM sports WHERE name = 'Ciclismo';
  SELECT id INTO v_golf     FROM sports WHERE name = 'Golf';

  INSERT INTO events
    (sport_id, title, event_date, event_time, city, address, lat, lng,
     level, min_age, max_age, gender, total_places, status, directions, image_url)
  VALUES

  -- ══════════════════════════════════════════════════════════════
  -- FÚTBOL 7  (8 eventos · Madrid + Barcelona + Valencia)
  -- ══════════════════════════════════════════════════════════════
  (v_futbol, 'Fútbol 7 Tarde Relajado',
   CURRENT_DATE+2,  '19:00', 'Madrid',    'Campo Municipal Vicálvaro',
   40.3970,-3.6100, 'Principiante', 18,50, 'Mixto',     14,'open',
   'Vestuarios disponibles. Hierba artificial.',           img_fut1),

  (v_futbol, 'Partido Fútbol 7 Amigos',
   CURRENT_DATE+5,  '20:00', 'Madrid',    'Ciudad Deportiva La Almudena',
   40.4050,-3.6350, 'Intermedio',   20,45, 'Masculino', 14,'open',
   'Aparcamiento gratuito junto al campo.',                img_fut2),

  (v_futbol, 'Fútbol 7 Mixto Barrio',
   CURRENT_DATE+9,  '11:00', 'Madrid',    'C. de Francos Rodríguez 40, Tetuán',
   40.4580,-3.7100, 'Principiante', 16,55, 'Mixto',     14,'open',
   'Instalación cubierta, acceso libre.',                  img_fut3),

  (v_futbol, 'Fútbol 7 Competición Sábado',
   CURRENT_DATE+14, '17:30', 'Madrid',    'C. Silvano 77, Hortaleza',
   40.4650,-3.6450, 'Avanzado',     22,40, 'Masculino', 14,'open',
   'Liga de barrio, puntos en juego.',                     img_fut1),

  (v_futbol, 'Fútbol 7 Noche Viernes',
   CURRENT_DATE+20, '22:00', 'Madrid',    'C. de Bravo Murillo 200',
   40.4530,-3.7020, 'Intermedio',   20,38, 'Masculino', 14,'open',
   'Iluminación LED. Pista cubierta.',                     img_fut2),

  (v_futbol, 'Fútbol 7 Diagonal',
   CURRENT_DATE+4,  '20:30', 'Barcelona', 'Av. Diagonal 640, Barcelona',
   41.3917, 2.1200, 'Intermedio',   18,40, 'Masculino', 14,'open',
   'Hierba artificial, vestuarios incluidos.',             img_fut3),

  (v_futbol, 'Fútbol 7 Mixto Gràcia',
   CURRENT_DATE+11, '19:00', 'Barcelona', 'C. de la Indústria 58, Gràcia',
   41.4050, 2.1580, 'Principiante', 16,50, 'Mixto',     14,'open',
   'Pista municipal. Duchas disponibles.',                 img_fut1),

  (v_futbol, 'Fútbol 7 Verano Valencia',
   CURRENT_DATE+8,  '20:00', 'Valencia',  'Av. de Blasco Ibáñez 15, Valencia',
   39.4775,-0.3503, 'Intermedio',   18,45, 'Mixto',     14,'open',
   'Campo al aire libre cerca del puerto.',                img_fut2),

  -- ══════════════════════════════════════════════════════════════
  -- FÚTBOL SALA  (6 eventos · Madrid + Sevilla)
  -- ══════════════════════════════════════════════════════════════
  (v_futsal, 'Futsal Mixto Lunes',
   CURRENT_DATE+3,  '21:00', 'Madrid',    'Polideportivo La Elipa, Av. de la Paz',
   40.4280,-3.6420, 'Intermedio',   18,45, 'Mixto',     10,'open',
   'Pista cubierta climatizada. Vestuarios incluidos.',    img_fs1),

  (v_futsal, 'Futsal Principiantes Tarde',
   CURRENT_DATE+10, '19:30', 'Madrid',    'Centro Deportivo Moscardó, Arganzuela',
   40.4010,-3.7010, 'Principiante', 16,60, 'Mixto',     10,'open',
   'Entramos en grupo. Nadie se queda fuera.',             img_fs2),

  (v_futsal, 'Fútbol Sala Liga Avanzado',
   CURRENT_DATE+21, '20:30', 'Madrid',    'Pabellón Municipal Vallecas',
   40.3800,-3.6640, 'Avanzado',     20,38, 'Masculino', 10,'open',
   'Competición oficial. Traer equipación.',               img_fs1),

  (v_futsal, 'Futsal Femenino Tarde',
   CURRENT_DATE+7,  '19:00', 'Madrid',    'Polideportivo Vallehermoso',
   40.4380,-3.7200, 'Principiante', 16,45, 'Femenino',  10,'open',
   'Grupo de chicas. Buen ambiente.',                      img_fs2),

  (v_futsal, 'Futsal Nocturno Sevilla',
   CURRENT_DATE+6,  '21:30', 'Sevilla',   'C. Luis Montoto 55, Sevilla',
   37.3780,-5.9750, 'Intermedio',   20,40, 'Masculino', 10,'open',
   'Pabellón cubierto. Aparcamiento gratuito.',            img_fs1),

  (v_futsal, 'Futsal Mixto Barcelona',
   CURRENT_DATE+13, '20:00', 'Barcelona', 'Carrer de Pallars 100, Poblenou',
   41.3990, 2.1950, 'Principiante', 16,55, 'Mixto',     10,'open',
   'Pista cubierta en el Poblenou.',                       img_fs2),

  -- ══════════════════════════════════════════════════════════════
  -- FÚTBOL 11  (5 eventos · Madrid + Barcelona)
  -- ══════════════════════════════════════════════════════════════
  (v_fut11,  'Partido Fútbol 11 Domingo',
   CURRENT_DATE+6,  '10:00', 'Madrid',    'Ciudad Universitaria, Av. Complutense',
   40.4440,-3.7290, 'Intermedio',   18,40, 'Masculino', 22,'open',
   'Césped natural. Concentración 30 min antes.',          img_fut1),

  (v_fut11,  'Fútbol 11 Amateur Sábado',
   CURRENT_DATE+15, '11:00', 'Madrid',    'Campo de Carabanchel, Av. de Oporto',
   40.3850,-3.7420, 'Principiante', 18,55, 'Mixto',     22,'open',
   'Buen ambiente, sin presión. Árbitro incluido.',        img_fut2),

  (v_fut11,  'Fútbol 11 Veteranos',
   CURRENT_DATE+22, '09:30', 'Madrid',    'C. Silvano 77, Hortaleza',
   40.4650,-3.6450, 'Principiante', 35,60, 'Masculino', 22,'open',
   'Liga veteranos. Ritmo tranquilo.',                     img_fut3),

  (v_fut11,  'Fútbol 11 Sant Andreu',
   CURRENT_DATE+8,  '10:00', 'Barcelona', 'Camp de Futbol de Sant Andreu',
   41.4310, 2.1880, 'Intermedio',   18,40, 'Masculino', 22,'open',
   'Césped artificial. Aparcamiento libre los domingos.',  img_fut1),

  (v_fut11,  'Fútbol 11 Torneo Verano',
   CURRENT_DATE+30, '09:00', 'Valencia',  'Poliesportiu Benicalap, Valencia',
   39.4900,-0.3950, 'Avanzado',     20,40, 'Masculino', 22,'open',
   'Torneo de verano. Trae tu equipo o únete libre.',      img_fut2),

  -- ══════════════════════════════════════════════════════════════
  -- PÁDEL  (9 eventos · Madrid + Barcelona + Málaga)
  -- Imágenes específicas de pista de pádel (paredes de cristal)
  -- ══════════════════════════════════════════════════════════════
  (v_padel,  'Pádel Mix Nivel Medio',
   CURRENT_DATE+1,  '10:00', 'Madrid',    'Av. de la Paz 45, Madrid',
   40.4200,-3.6850, 'Intermedio',   20,45, 'Mixto',      4,'open',
   'Pistas cubiertas, aparcamiento gratuito.',             img_pad1),

  (v_padel,  'Pádel Matutino Femenino',
   CURRENT_DATE+4,  '08:30', 'Madrid',    'Club de Pádel Arturo Soria',
   40.4600,-3.6720, 'Principiante', 18,55, 'Femenino',   4,'open',
   'Monitor disponible para principiantes.',               img_pad2),

  (v_padel,  'Pádel Avanzado Noche',
   CURRENT_DATE+12, '20:00', 'Madrid',    'Pádel Indoor Moncloa',
   40.4360,-3.7180, 'Avanzado',     25,45, 'Masculino',  4,'open',
   'Partido de alta competencia. Traer raqueta propia.',   img_pad3),

  (v_padel,  'Pádel Dobles Mixtos',
   CURRENT_DATE+18, '10:30', 'Madrid',    'Instalación WPT Pozuelo',
   40.4350,-3.8190, 'Intermedio',   22,48, 'Mixto',      4,'open',
   'Aparcamiento amplio. Bar en el club.',                 img_pad1),

  (v_padel,  'Pádel Casual Femenino',
   CURRENT_DATE+25, '18:00', 'Madrid',    'Club Top Pádel 20, Av. de Burgos',
   40.4850,-3.6650, 'Principiante', 18,55, 'Femenino',   4,'open',
   'Pistas cubiertas con luz. Duchas incluidas.',          img_pad2),

  (v_padel,  'Pádel Nocturno Intermedio',
   CURRENT_DATE+32, '21:00', 'Madrid',    'WorldPadel Center, Alcobendas',
   40.5330,-3.6440, 'Intermedio',   22,45, 'Masculino',  4,'open',
   'Club con bar. Parking gratuito.',                      img_pad3),

  (v_padel,  'Pádel Club Sarrià',
   CURRENT_DATE+3,  '09:00', 'Barcelona', 'Club de Pàdel Sarrià, Barcelona',
   41.3950, 2.1160, 'Intermedio',   20,50, 'Mixto',      4,'open',
   'Pistas al aire libre. Ambiente muy bueno.',            img_pad1),

  (v_padel,  'Pádel Málaga Costa',
   CURRENT_DATE+9,  '10:00', 'Málaga',    'Club Pádel Málaga Costa, Málaga',
   36.7200,-4.4200, 'Principiante', 16,60, 'Mixto',      4,'open',
   'Cerca del mar. Pistas cubiertas.',                     img_pad2),

  (v_padel,  'Torneo Pádel Bilbao',
   CURRENT_DATE+28, '10:00', 'Bilbao',    'Club Deportivo Indautxu, Bilbao',
   43.2650,-2.9420, 'Avanzado',     22,50, 'Mixto',      8,'open',
   'Torneo por parejas. Inscripción gratuita.',            img_pad3),

  -- ══════════════════════════════════════════════════════════════
  -- TENIS  (7 eventos · Madrid + Barcelona + Valencia)
  -- ══════════════════════════════════════════════════════════════
  (v_tenis,  'Tenis Principiantes Mañana',
   CURRENT_DATE+4,  '10:00', 'Madrid',    'Club de Tenis El Olivar, Moratalaz',
   40.4050,-3.6380, 'Principiante', 16,65, 'Mixto',      2,'open',
   'Profesor disponible. Raquetas prestadas si necesitas.',img_ten1),

  (v_tenis,  'Tenis Femenino Tierra Batida',
   CURRENT_DATE+11, '12:00', 'Madrid',    'Real Club de Tenis La Moraleja',
   40.4900,-3.6380, 'Intermedio',   18,50, 'Femenino',   2,'open',
   'Pistas de tierra batida. Reservar con antelación.',    img_ten2),

  (v_tenis,  'Tenis Avanzado Tarde',
   CURRENT_DATE+17, '18:00', 'Madrid',    'Parque Deportivo Puerta de Hierro',
   40.4550,-3.7420, 'Avanzado',     22,45, 'Masculino',  2,'open',
   'Pistas de hierba. Competición amistosa.',              img_ten3),

  (v_tenis,  'Tenis Dobles Dominguero',
   CURRENT_DATE+23, '09:00', 'Madrid',    'Club Deportivo Chamartín',
   40.4720,-3.6780, 'Principiante', 20,60, 'Mixto',      4,'open',
   'Ambiente muy tranquilo. Perfecto para recomenzar.',    img_ten1),

  (v_tenis,  'Tenis Club Turó Barcelona',
   CURRENT_DATE+5,  '10:30', 'Barcelona', 'Club de Tenis Turó, Barcelona',
   41.3980, 2.1510, 'Intermedio',   18,50, 'Mixto',      2,'open',
   'Pistas de tierra batida en el Eixample.',              img_ten2),

  (v_tenis,  'Tenis Nocturno Valencia',
   CURRENT_DATE+16, '20:00', 'Valencia',  'Club de Tenis Valencia, Av. Uruguay',
   39.4750,-0.3720, 'Avanzado',     20,45, 'Masculino',  2,'open',
   'Pistas iluminadas. Reserva tu cancha.',                img_ten3),

  (v_tenis,  'Tenis Mixto Sevilla',
   CURRENT_DATE+24, '09:30', 'Sevilla',   'Club de Tenis Real de la Exposición',
   37.3800,-5.9920, 'Principiante', 18,60, 'Mixto',      4,'open',
   'Pistas cubiertas. Entrenador opcional.',               img_ten1),

  -- ══════════════════════════════════════════════════════════════
  -- BALONCESTO  (8 eventos · Madrid + Barcelona + Bilbao)
  -- ══════════════════════════════════════════════════════════════
  (v_basket, 'Basket 3x3 Fin de Semana',
   CURRENT_DATE+3,  '11:00', 'Madrid',    'Parque del Retiro, Pista Sur',
   40.4153,-3.6843, 'Principiante', 16,35, 'Mixto',      6,'open',
   'Pista al aire libre junto a la entrada principal.',    img_bas1),

  (v_basket, 'Basket Avanzado Liga Barrio',
   CURRENT_DATE+10, '20:00', 'Madrid',    'Polideportivo Hortaleza',
   40.4720,-3.6400, 'Avanzado',     20,40, 'Masculino', 10,'open',
   'Pabellón cerrado, traer zapatillas de pista.',         img_bas2),

  (v_basket, 'Basket 5x5 Juvenil',
   CURRENT_DATE+14, '17:00', 'Madrid',    'IES Ramiro de Maeztu',
   40.4460,-3.6930, 'Principiante', 16,25, 'Mixto',     10,'open',
   'Patio del instituto, acceso por la puerta lateral.',   img_bas3),

  (v_basket, 'Basket 3x3 Femenino',
   CURRENT_DATE+7,  '19:00', 'Madrid',    'Polideportivo Moscardó, Arganzuela',
   40.4010,-3.7010, 'Intermedio',   16,40, 'Femenino',   6,'open',
   'Pista interior, ambiente genial.',                     img_bas1),

  (v_basket, 'Basket Callejero Domingo',
   CURRENT_DATE+19, '10:00', 'Madrid',    'Cancha del Retiro, Parque del Buen Retiro',
   40.4153,-3.6843, 'Principiante', 16,45, 'Mixto',     10,'open',
   'Pista al aire libre. Ambiente muy familiar.',          img_bas2),

  (v_basket, 'Basket Eixample Tarde',
   CURRENT_DATE+5,  '19:30', 'Barcelona', 'Carrer del Consell de Cent 363',
   41.3906, 2.1650, 'Intermedio',   18,40, 'Mixto',     10,'open',
   'Polideportivo municipal del Eixample.',                img_bas3),

  (v_basket, 'Basket 3x3 Gràcia',
   CURRENT_DATE+12, '18:00', 'Barcelona', 'Plaça del Diamant, Gràcia',
   41.4025, 2.1570, 'Principiante', 16,35, 'Mixto',      6,'open',
   'Cancha al aire libre, ambiente relajado.',             img_bas1),

  (v_basket, 'Basket Bilbao 5x5',
   CURRENT_DATE+26, '20:30', 'Bilbao',    'Polideportivo Miribilla, Bilbao',
   43.2570,-2.9270, 'Intermedio',   18,45, 'Masculino', 10,'open',
   'Pabellón municipal, vestuarios incluidos.',            img_bas2),

  -- ══════════════════════════════════════════════════════════════
  -- RUNNING  (8 eventos · Madrid + Barcelona + Valencia + Sevilla)
  -- ══════════════════════════════════════════════════════════════
  (v_running,'Running Matutino Retiro',
   CURRENT_DATE+2,  '08:00', 'Madrid',    'Parque de El Retiro, Entrada Alcalá',
   40.4153,-3.6843, 'Principiante', 16,60, 'Mixto',     20,'open',
   'Quedada en la fuente de la entrada Alcalá.',           img_run1),

  (v_running,'Running Femenino Amanecer',
   CURRENT_DATE+5,  '07:30', 'Madrid',    'Parque del Buen Retiro, Puerta Ibiza',
   40.4153,-3.6843, 'Principiante', 16,60, 'Femenino',  20,'open',
   'Quedada junto a la fuente de Ibiza. Ritmo suave.',     img_run2),

  (v_running,'Carrera 10K Popular',
   CURRENT_DATE+13, '08:30', 'Madrid',    'Paseo de la Castellana, frente al Palacio',
   40.4530,-3.6920, 'Intermedio',   18,55, 'Mixto',     30,'open',
   'Salida frente al Palacio de los Deportes.',            img_run3),

  (v_running,'Trail Running Casa de Campo',
   CURRENT_DATE+20, '09:00', 'Madrid',    'Casa de Campo, Aparcamiento Principal',
   40.4100,-3.7450, 'Avanzado',     20,45, 'Mixto',     20,'open',
   'Llevar linterna frontal. 12 km aproximados.',          img_run1),

  (v_running,'Running Técnico Intermedios',
   CURRENT_DATE+27, '08:00', 'Madrid',    'Estadio Atletismo Vallehermoso',
   40.4380,-3.7200, 'Intermedio',   18,55, 'Masculino', 15,'open',
   'Sesión con trabajo de cadencia y zancada.',            img_run2),

  (v_running,'Running Matinal Collserola',
   CURRENT_DATE+4,  '08:00', 'Barcelona', 'Parc de Collserola, Entrada Vallvidrera',
   41.4120, 2.1000, 'Intermedio',   18,55, 'Mixto',     25,'open',
   '10 km de trail suave. Vista al mar.',                  img_run3),

  (v_running,'Carrera Popular Valencia',
   CURRENT_DATE+18, '09:00', 'Valencia',  'Paseo de la Alameda, Valencia',
   39.4750,-0.3550, 'Principiante', 16,70, 'Mixto',     50,'open',
   'Carrera popular. Inscripción gratuita en el acto.',    img_run1),

  (v_running,'Running Solidario Sevilla',
   CURRENT_DATE+35, '09:00', 'Sevilla',   'Parque de María Luisa, Sevilla',
   37.3750,-5.9900, 'Principiante', 16,70, 'Mixto',     50,'open',
   'Carrera benéfica. Inscripción libre.',                 img_run2),

  -- ══════════════════════════════════════════════════════════════
  -- VÓLEY PLAYA  (7 eventos · Madrid + Barcelona + Valencia + Málaga)
  -- ══════════════════════════════════════════════════════════════
  (v_voley,  'Vóley Playa Recreativo Madrid',
   CURRENT_DATE+5,  '17:00', 'Madrid',    'Arena Madrid, C. del Príncipe de Vergara',
   40.4320,-3.6780, 'Principiante', 18,50, 'Mixto',      8,'open',
   'Arena sintética, trae tu propia botella de agua.',     img_vol1),

  (v_voley,  'Vóley Playa Femenino Tarde',
   CURRENT_DATE+9,  '12:00', 'Madrid',    'Polideportivo Mar de Cristal',
   40.4750,-3.6200, 'Intermedio',   18,45, 'Femenino',   8,'open',
   'Arena sintética de calidad, vestuarios modernos.',     img_vol2),

  (v_voley,  'Torneo Vóley 4v4 Madrid',
   CURRENT_DATE+24, '10:00', 'Madrid',    'Playa de Madrid, Casa de Campo',
   40.4100,-3.7450, 'Avanzado',     20,45, 'Mixto',     16,'open',
   'Formato torneo 4v4. Traer equipo formado.',            img_vol3),

  (v_voley,  'Vóley Playa Barceloneta',
   CURRENT_DATE+3,  '18:00', 'Barcelona', 'Playa de la Barceloneta, Barcelona',
   41.3795, 2.1908, 'Intermedio',   18,45, 'Mixto',      8,'open',
   'En la arena de la Barceloneta. Llegar puntual.',       img_vol1),

  (v_voley,  'Vóley Amanecer Valencia',
   CURRENT_DATE+7,  '08:30', 'Valencia',  'Playa de la Malvarrosa, Valencia',
   39.4800,-0.3220, 'Principiante', 16,50, 'Mixto',      8,'open',
   'Grupo matinal en la playa. Ambiente tranquilo.',       img_vol2),

  (v_voley,  'Vóley Playa Málaga',
   CURRENT_DATE+11, '18:00', 'Málaga',    'Playa de la Malagueta, Málaga',
   36.7200,-4.4050, 'Intermedio',   18,45, 'Mixto',      8,'open',
   'En la arena de La Malagueta. Se junta buena gente.',   img_vol3),

  (v_voley,  'Vóley Nocturno Principiantes',
   CURRENT_DATE+29, '21:00', 'Madrid',    'Polideportivo La Elipa, Av. de la Paz',
   40.4280,-3.6420, 'Principiante', 16,55, 'Mixto',      8,'open',
   'Pista cubierta con luz. Monitor disponible.',          img_vol1),

  -- ══════════════════════════════════════════════════════════════
  -- NATACIÓN  (7 eventos · Madrid + Barcelona + Sevilla)
  -- ══════════════════════════════════════════════════════════════
  (v_natacion,'Natación Principiantes Mañana',
   CURRENT_DATE+2,  '07:00', 'Madrid',    'Piscina Municipal La Latina',
   40.4050,-3.7150, 'Principiante', 16,65, 'Mixto',     15,'open',
   'Carril lento disponible. Traer gorro y gafas.',        img_nat1),

  (v_natacion,'Natación Femenino Intermedias',
   CURRENT_DATE+8,  '07:30', 'Madrid',    'Piscina Olímpica Vallehermoso',
   40.4380,-3.7200, 'Intermedio',   18,55, 'Femenino',  12,'open',
   'Carril exclusivo. Mínimo 1 km por sesión.',            img_nat2),

  (v_natacion,'Natación Avanzado Competición',
   CURRENT_DATE+15, '07:00', 'Madrid',    'Piscina Municipal Chamartín',
   40.4650,-3.6810, 'Avanzado',     18,45, 'Masculino', 10,'open',
   'Entrenamiento técnico. 2 km mínimo de experiencia.',   img_nat3),

  (v_natacion,'Natación Familiar Fin de Semana',
   CURRENT_DATE+22, '10:00', 'Madrid',    'Piscina del Canal, Av. de Filipinas',
   40.4450,-3.7110, 'Principiante', 16,70, 'Mixto',     20,'open',
   'Piscina exterior en verano. Zona de baño libre.',      img_nat1),

  (v_natacion,'Natación Piscina Bernat Picornell',
   CURRENT_DATE+6,  '08:00', 'Barcelona', 'Piscina Bernat Picornell, Montjuïc',
   41.3660, 2.1510, 'Intermedio',   18,55, 'Mixto',     15,'open',
   'Piscina olímpica en Montjuïc. Impresionante.',         img_nat2),

  (v_natacion,'Natación Nervión Bilbao',
   CURRENT_DATE+16, '07:30', 'Bilbao',    'Polideportivo Deusto, Bilbao',
   43.2710,-2.9500, 'Principiante', 16,60, 'Mixto',     12,'open',
   'Piscina municipal. Carril libre disponible.',          img_nat3),

  (v_natacion,'Natación Sevilla Acuático',
   CURRENT_DATE+19, '08:00', 'Sevilla',   'Centro Acuático Municipal, Sevilla',
   37.3850,-5.9800, 'Avanzado',     18,45, 'Masculino', 10,'open',
   'Entrenamiento de alta intensidad. Gafas y gorro obligatorio.', img_nat1),

  -- ══════════════════════════════════════════════════════════════
  -- CICLISMO  (7 eventos · Madrid + Barcelona + Valencia)
  -- ══════════════════════════════════════════════════════════════
  (v_cicl,   'Ruta Ciclista Principiantes',
   CURRENT_DATE+4,  '08:00', 'Madrid',    'Casa de Campo, Aparcamiento Los Pinos',
   40.4100,-3.7450, 'Principiante', 16,65, 'Mixto',     20,'open',
   'Ruta de 25 km por carril bici. Ritmo suave.',          img_cic1),

  (v_cicl,   'Ruta MTB Intermedia Pardo',
   CURRENT_DATE+13, '09:00', 'Madrid',    'Bosque de El Pardo, Entrada Norte',
   40.5050,-3.7500, 'Intermedio',   20,50, 'Masculino', 15,'open',
   'MTB por senderos. Bicicleta de montaña obligatoria.',  img_cic2),

  (v_cicl,   'Cicloturista Puerto Navacerrada',
   CURRENT_DATE+25, '07:30', 'Madrid',    'Salida: Puerto de Navacerrada',
   40.7800,-4.0100, 'Avanzado',     22,45, 'Mixto',     12,'open',
   '80 km con 1200 m de desnivel. Bici de carretera imprescindible.', img_cic3),

  (v_cicl,   'Paseo Ciclista Familiar',
   CURRENT_DATE+28, '10:00', 'Madrid',    'Parque Juan Carlos I, Entrada Sur',
   40.4670,-3.6060, 'Principiante', 16,70, 'Femenino',  18,'open',
   'Carril bici del parque. 15 km tranquilos.',            img_cic1),

  (v_cicl,   'Ruta Ciclista Maresme',
   CURRENT_DATE+7,  '08:30', 'Barcelona', 'Paseo Marítimo de la Barceloneta',
   41.3795, 2.1908, 'Intermedio',   20,50, 'Mixto',     20,'open',
   'Ruta costera por el Maresme. 45 km A/R.',              img_cic2),

  (v_cicl,   'MTB Collserola Avanzado',
   CURRENT_DATE+21, '09:00', 'Barcelona', 'Parc de Collserola, Aparcamiento Vallvidrera',
   41.4120, 2.1000, 'Avanzado',     20,50, 'Masculino', 12,'open',
   'Senderos técnicos de Collserola. Experiencia requerida.', img_cic3),

  (v_cicl,   'Cicloturista Valencia Albufera',
   CURRENT_DATE+17, '08:00', 'Valencia',  'Av. del Puerto, Valencia',
   39.4600,-0.3340, 'Principiante', 16,60, 'Mixto',     18,'open',
   'Ruta tranquila hasta la Albufera. 30 km.',             img_cic1),

  -- ══════════════════════════════════════════════════════════════
  -- GOLF  (5 eventos · Madrid + Barcelona)
  -- ══════════════════════════════════════════════════════════════
  (v_golf,   'Golf Iniciación Mañana',
   CURRENT_DATE+6,  '09:00', 'Madrid',    'Club de Golf La Herrería, El Escorial',
   40.5900,-4.1400, 'Principiante', 18,70, 'Mixto',      4,'open',
   'Incluye alquiler de palos y bola. Instructor presente.', img_gol1),

  (v_golf,   'Golf Intermedio 9 Hoyos',
   CURRENT_DATE+16, '10:00', 'Madrid',    'Real Club de Golf La Moraleja',
   40.4900,-3.6380, 'Intermedio',   25,65, 'Masculino',  4,'open',
   'Campo de 18 hoyos. Jugamos los primeros 9.',           img_gol2),

  (v_golf,   'Torneo Golf Friendly',
   CURRENT_DATE+27, '09:30', 'Madrid',    'Club de Golf Retamares, Alcorcón',
   40.3600,-3.8250, 'Avanzado',     25,65, 'Mixto',      8,'open',
   'Torneo Stableford. Hándicap máximo 28.',               img_gol3),

  (v_golf,   'Golf Matinal Pitch & Putt',
   CURRENT_DATE+10, '09:00', 'Madrid',    'Pitch & Putt Retiro, Madrid',
   40.4130,-3.6870, 'Principiante', 18,70, 'Mixto',      4,'open',
   'Formato corto, ideal para aprender. Palos incluidos.', img_gol1),

  (v_golf,   'Golf Club Terramar',
   CURRENT_DATE+22, '10:00', 'Barcelona', 'Club de Golf Terramar, Sitges',
   41.2370, 1.7980, 'Intermedio',   22,65, 'Mixto',      4,'open',
   'Campo con vistas al Mediterráneo. Alquiler de palos disponible.', img_gol2);

END $$;
