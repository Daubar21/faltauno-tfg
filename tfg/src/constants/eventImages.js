// Imágenes de Unsplash predefinidas por deporte — se usan en el selector de imagen
// de CreateEventPanel para que el usuario pueda elegir una foto para su evento.
// La función U() construye la URL completa a partir del ID de Unsplash.
const U = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=700&q=75`
const PLUS = (id) => `https://plus.unsplash.com/premium_photo-${id}?auto=format&fit=crop&w=700&q=75`
const FLAGGED = (id) => `https://images.unsplash.com/flagged/photo-${id}?auto=format&fit=crop&w=700&q=75`

export const SPORT_IMAGES = {
  'Futbol 7': [
    U('1551958219-acbc608c6377'),
    PLUS('1661826732309-af9cab19a951'),
    U('1574629810360-7efbbe195018'),
  ],
  'Futbol Sala': [
    U('1587384474964-3a06ce1ce699'),
    U('1630420598913-44208d36f9af'),
    U('1676444920926-c8a084ec4003'),
  ],
  'Futbol 11': [
    U('1574629810360-7efbbe195018'),
    U('1551958219-acbc608c6377'),
    PLUS('1661826732309-af9cab19a951'),
  ],
  Padel: [
    U('1613870930431-a09c7139eb33'),
    U('1612534847738-b3af9bc31f0c'),
    U('1646649853703-7645147474ba'),
  ],
  Tenis: [
    U('1554068865-24cecd4e34b8'),
    FLAGGED('1576972405668-2d020a01cbfa'),
    U('1516742720271-6ae39cbc5bd1'),
  ],
  Baloncesto: [
    U('1546519638-68e109498ffc'),
    U('1627627256672-027a4613d028'),
    U('1519861531473-9200262188bf'),
  ],
  Running: [
    U('1552674605-db6ffd4facb5'),
    U('1590333748338-d629e4564ad9'),
    U('1486218119243-13883505764c'),
  ],
  'Voley Playa': [
    U('1592656094267-764a45160876'),
    PLUS('1708696216326-0317bac37b82'),
    U('1553005746-9245ba190489'),
  ],
  Golf: [
    PLUS('1679710943658-1565004c00ac'),
    U('1535131749006-b7f58c99034b'),
    U('1587174486073-ae5e5cff23aa'),
  ],
  Natacion: [
    U('1530549387789-4c1017266635'),
    U('1560090995-01632a28895b'),
    U('1519315901367-f34ff9154487'),
  ],
  Ciclismo: [
    U('1681295692638-97ace05f56b4'),
    U('1541625602330-2277a4c46182'),
    U('1631276893368-554b60393efb'),
  ],
}

export function getFirstSportImage(sportName) {
  const imgs = SPORT_IMAGES[sportName]
  return imgs?.[0] ?? SPORT_IMAGES['Futbol 7'][0]
}
