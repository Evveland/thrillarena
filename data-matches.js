// WC2026 group-stage matches — official schedule
// Each match has times in 4 zones: LOCAL (host stadium), MEX (CDMX), ARG (Buenos Aires), ESP (Madrid)
// Times are 24h. If a zone is on the next day, suffix +1.

// Host stadiums (the calendar shows the venue inline)
const VENUES = {
  AZTECA:     { name: "Estadio Azteca",        city: "Mexico City",   country: "MEX", tz: "MEX" },
  BANORTE:    { name: "Estadio Banorte",       city: "México, DF",    country: "MEX", tz: "MEX" },
  GDL:        { name: "Estadio Guadalajara",   city: "Guadalajara",   country: "MEX", tz: "MEX" },
  MTY:        { name: "Estadio Monterrey",     city: "Monterrey",     country: "MEX", tz: "MEX" },
  ATL:        { name: "Atlanta Stadium",       city: "Atlanta",       country: "USA", tz: "ET"  },
  BOS:        { name: "Boston Stadium",        city: "Boston",        country: "USA", tz: "ET"  },
  MIA:        { name: "Miami Stadium",         city: "Miami",         country: "USA", tz: "ET"  },
  NYNJ:       { name: "NY/NJ Stadium",         city: "East Rutherford", country: "USA", tz: "ET" },
  PHI:        { name: "Philadelphia Stadium",  city: "Philadelphia",  country: "USA", tz: "ET"  },
  DAL:        { name: "Dallas Stadium",        city: "Arlington",     country: "USA", tz: "CT"  },
  HOU:        { name: "Houston Stadium",       city: "Houston",       country: "USA", tz: "CT"  },
  KC:         { name: "Kansas City Stadium",   city: "Kansas City",   country: "USA", tz: "CT"  },
  LA:         { name: "Los Angeles Stadium",   city: "Inglewood",     country: "USA", tz: "PT"  },
  SF:         { name: "SF Bay Area Stadium",   city: "Santa Clara",   country: "USA", tz: "PT"  },
  SEA:        { name: "Seattle Stadium",       city: "Seattle",       country: "USA", tz: "PT"  },
  TOR:        { name: "Toronto Stadium",       city: "Toronto",       country: "CAN", tz: "ET"  },
  BC:         { name: "BC Place Vancouver",    city: "Vancouver",     country: "CAN", tz: "PT"  },
};

// Helper: build a match — group key, date (YYYY-MM-DD), times {local, mex, arg, esp}, teams, venue, matchday
// `bet` is the Thrill match-betting URL. If null, a slug-based URL is generated automatically.
const m = (id, group, matchday, date, home, away, venue, times, bet = null) => ({
  id, stage: "groups", group, matchday, date, home, away, venue, times, bet,
});

// All group matches in chronological order
const groupMatches = [
  // ─── MATCHDAY 1 ─────────────────────────────────────────
  m("g-A-1", "A", 1, "2026-06-11", "MEX", "RSA", "AZTECA", { local: "12:00", mex: "12:00", arg: "16:00", esp: "21:00" }, "https://thrill.com/sports/soccer/international/world-cup/mexico-south-africa-2609320505374814252"),
  m("g-A-2", "A", 1, "2026-06-12", "KOR", "CZE", "GDL", { local: "19:00", mex: "19:00", arg: "22:00", esp: "04:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/republic-of-korea-czechia-2650917574275112966"),

  m("g-B-1", "B", 1, "2026-06-12", "CAN", "BIH", "TOR", { local: "14:00", mex: "12:00", arg: "16:00", esp: "21:00" }, "https://thrill.com/sports/soccer/international/world-cup/canada-bosnia--herzegovina-2650890768432107541"),
  m("g-D-1", "D", 1, "2026-06-13", "USA", "PAR", "LA", { local: "18:00", mex: "19:00", arg: "22:00", esp: "03:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/usa-paraguay-2609320505374814254"),

  m("g-B-2", "B", 1, "2026-06-13", "QAT", "SUI", "SF", { local: "12:00", mex: "13:00", arg: "16:00", esp: "21:00" }, "https://thrill.com/sports/soccer/international/world-cup/qatar-switzerland-2609320505374814257"),
  m("g-C-1", "C", 1, "2026-06-14", "BRA", "MAR", "NYNJ", { local: "15:00", mex: "16:00", arg: "19:00", esp: "00:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/brazil-morocco-2609327863110971392"),
  m("g-D-2", "D", 1, "2026-06-14", "AUS", "TUR", "BC", { local: "21:00", mex: "22:00", arg: "01:00+1", esp: "06:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/australia-turkiye-2650890768432107544"),
  m("g-C-2", "C", 1, "2026-06-14", "HAI", "SCO", "BOS", { local: "18:00", mex: "19:00", arg: "22:00", esp: "03:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/haiti-scotland-2609320505374814256"),

  m("g-E-1", "E", 1, "2026-06-15", "GER", "CUW", "HOU", { local: "11:00", mex: "11:00", arg: "14:00", esp: "19:00" }, "https://thrill.com/sports/soccer/international/world-cup/germany-curacao-2609327863110971393"),
  m("g-F-1", "F", 1, "2026-06-14", "NED", "JPN", "DAL", { local: "14:00", mex: "14:00", arg: "17:00", esp: "22:00" }, "https://thrill.com/sports/soccer/international/world-cup/netherlands-japan-2609327863110971395"),
  m("g-E-2", "E", 1, "2026-06-14", "CIV", "ECU", "PHI", { local: "18:00", mex: "17:00", arg: "20:00", esp: "01:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/ivory-coast-ecuador-2609327863110971396"),
  m("g-F-2", "F", 1, "2026-06-15", "SWE", "TUN", "MTY", { local: "20:00", mex: "20:00", arg: "23:00", esp: "04:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/sweden-tunisia-2650890768432107543"),

  m("g-H-1", "H", 1, "2026-06-15", "ESP", "CPV", "ATL", { local: "11:00", mex: "10:00", arg: "13:00", esp: "18:00" }, "https://thrill.com/sports/soccer/international/world-cup/spain-cape-verde-2609327863110971398"),
  m("g-G-1", "G", 1, "2026-06-15", "BEL", "EGY", "SEA", { local: "13:00", mex: "13:00", arg: "16:00", esp: "21:00" }, "https://thrill.com/sports/soccer/international/world-cup/belgium-egypt-2609327863110971399"),
  m("g-H-2", "H", 1, "2026-06-16", "KSA", "URU", "MIA", { local: "17:00", mex: "16:00", arg: "19:00", esp: "00:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/saudi-arabia-uruguay-2609327863110971400"),
  m("g-G-2", "G", 1, "2026-06-16", "IRN", "NZL", "LA", { local: "18:00", mex: "19:00", arg: "22:00", esp: "03:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/iran-new-zealand-2609327863110971401"),

  m("g-I-1", "I", 1, "2026-06-16", "FRA", "SEN", "NYNJ", { local: "12:00", mex: "13:00", arg: "16:00", esp: "21:00" }, "https://thrill.com/sports/soccer/international/world-cup/france-senegal-2609327863110971403"),
  m("g-I-2", "I", 1, "2026-06-17", "IRQ", "NOR", "BOS", { local: "15:00", mex: "16:00", arg: "19:00", esp: "00:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/iraq-norway-2651430368640638977"),
  m("g-J-1", "J", 1, "2026-06-17", "ARG", "ALG", "KC", { local: "19:00", mex: "19:00", arg: "22:00", esp: "03:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/argentina-algeria-2609327863110971404"),
  m("g-J-2", "J", 1, "2026-06-17", "AUT", "JOR", "SF", { local: "21:00", mex: "22:00", arg: "01:00+1", esp: "06:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/austria-jordan-2609327863110971402"),

  m("g-K-1", "K", 1, "2026-06-17", "POR", "COD", "HOU", { local: "11:00", mex: "11:00", arg: "14:00", esp: "19:00" }, "https://thrill.com/sports/soccer/international/world-cup/portugal-dr-congo-2651430368640638978"),
  m("g-L-1", "L", 1, "2026-06-17", "ENG", "CRO", "DAL", { local: "14:00", mex: "14:00", arg: "17:00", esp: "22:00" }, "https://thrill.com/sports/soccer/international/world-cup/england-croatia-2609327863110971406"),
  m("g-L-2", "L", 1, "2026-06-17", "GHA", "PAN", "TOR", { local: "18:00", mex: "17:00", arg: "20:00", esp: "01:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/ghana-panama-2609327863110971408"),
  m("g-K-2", "K", 1, "2026-06-18", "UZB", "COL", "AZTECA", { local: "20:00", mex: "20:00", arg: "23:00", esp: "04:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/uzbekistan-colombia-2609327863110971405"),

  // ─── MATCHDAY 2 ─────────────────────────────────────────
  m("g-A-3", "A", 2, "2026-06-18", "CZE", "RSA", "ATL", { local: "11:00", mex: "10:00", arg: "13:00", esp: "18:00" }, "https://thrill.com/sports/soccer/international/world-cup/czechia-south-africa-2654387909456695299"),
  m("g-B-3", "B", 2, "2026-06-18", "SUI", "BIH", "LA", { local: "13:00", mex: "13:00", arg: "16:00", esp: "21:00" }, "https://thrill.com/sports/soccer/international/world-cup/switzerland-bosnia--herzegovina-2654390112233852950"),
  m("g-B-4", "B", 2, "2026-06-19", "CAN", "QAT", "BC", { local: "16:00", mex: "16:00", arg: "19:00", esp: "00:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/canada-qatar-2654390112233852956"),
  m("g-A-4", "A", 2, "2026-06-19", "MEX", "KOR", "BANORTE", { local: "19:00", mex: "19:00", arg: "22:00", esp: "03:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/mexico-republic-of-korea-2654387909456695310"),

  m("g-C-3", "C", 2, "2026-06-20", "SCO", "MAR", "BOS", { local: "15:00", mex: "16:00", arg: "19:00", esp: "00:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/scotland-morocco-2654392292143665152"),
  m("g-D-3", "D", 2, "2026-06-19", "USA", "AUS", "SEA", { local: "13:00", mex: "13:00", arg: "16:00", esp: "21:00" }, "https://thrill.com/sports/soccer/international/world-cup/usa-australia-2654392292143665172"),
  m("g-C-4", "C", 2, "2026-06-20", "BRA", "HAI", "PHI", { local: "20:00", mex: "19:00", arg: "22:00", esp: "03:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/brazil-haiti-2654392292143665153"),
  m("g-D-4", "D", 2, "2026-06-20", "TUR", "PAR", "SF", { local: "21:00", mex: "22:00", arg: "01:00+1", esp: "06:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/turkiye-paraguay-2654392292143665176"),

  m("g-F-3", "F", 2, "2026-06-20", "NED", "SWE", "HOU", { local: "11:00", mex: "11:00", arg: "14:00", esp: "19:00" }, "https://thrill.com/sports/soccer/international/world-cup/netherlands-sweden-2654392292143665197"),
  m("g-E-3", "E", 2, "2026-06-20", "GER", "CIV", "TOR", { local: "15:00", mex: "14:00", arg: "17:00", esp: "22:00" }, "https://thrill.com/sports/soccer/international/world-cup/germany-ivory-coast-2654392292143665186"),
  m("g-E-4", "E", 2, "2026-06-21", "ECU", "CUW", "KC", { local: "18:00", mex: "18:00", arg: "21:00", esp: "02:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/ecuador-curacao-2654392292143665189"),
  m("g-F-4", "F", 2, "2026-06-20", "TUN", "JPN", "MTY", { local: "22:00", mex: "22:00", arg: "01:00+1", esp: "06:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/tunisia-japan-2654394185444110343"),

  m("g-H-3", "H", 2, "2026-06-21", "ESP", "KSA", "ATL", { local: "11:00", mex: "10:00", arg: "13:00", esp: "18:00" }, "https://thrill.com/sports/soccer/international/world-cup/spain-saudi-arabia-2654395498756182020"),
  m("g-G-3", "G", 2, "2026-06-21", "BEL", "IRN", "LA", { local: "13:00", mex: "13:00", arg: "16:00", esp: "21:00" }, "https://thrill.com/sports/soccer/international/world-cup/belgium-iran-2654394185444110347"),
  m("g-H-4", "H", 2, "2026-06-22", "URU", "CPV", "MIA", { local: "17:00", mex: "16:00", arg: "19:00", esp: "00:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/uruguay-cape-verde-2654395498756182024"),
  m("g-G-4", "G", 2, "2026-06-22", "NZL", "EGY", "BC", { local: "19:00", mex: "19:00", arg: "22:00", esp: "03:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/new-zealand-egypt-2654394185444110351"),

  m("g-I-3", "I", 2, "2026-06-22", "FRA", "IRQ", "PHI", { local: "15:00", mex: "15:00", arg: "18:00", esp: "23:00" }, "https://thrill.com/sports/soccer/international/world-cup/france-iraq-2654395498756182026"),
  m("g-J-3", "J", 2, "2026-06-22", "ARG", "AUT", "DAL", { local: "11:00", mex: "11:00", arg: "14:00", esp: "19:00" }, "https://thrill.com/sports/soccer/international/world-cup/argentina-austria-2654395498756182034"),
  m("g-I-4", "I", 2, "2026-06-23", "NOR", "SEN", "NYNJ", { local: "17:00", mex: "18:00", arg: "21:00", esp: "02:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/norway-senegal-2654395498756182028"),
  m("g-J-4", "J", 2, "2026-06-23", "JOR", "ALG", "SF", { local: "20:00", mex: "21:00", arg: "00:00+1", esp: "05:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/jordan-algeria-2654395498756182038"),

  m("g-K-3", "K", 2, "2026-06-23", "POR", "UZB", "HOU", { local: "11:00", mex: "11:00", arg: "14:00", esp: "19:00" }, "https://thrill.com/sports/soccer/international/world-cup/portugal-uzbekistan-2654395498756182041"),
  m("g-L-3", "L", 2, "2026-06-23", "ENG", "GHA", "BOS", { local: "13:00", mex: "14:00", arg: "17:00", esp: "22:00" }, "https://thrill.com/sports/soccer/international/world-cup/england-ghana-2654395498756182049"),
  m("g-L-4", "L", 2, "2026-06-23", "PAN", "CRO", "TOR", { local: "18:00", mex: "17:00", arg: "20:00", esp: "01:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/panama-croatia-2654395498756182052"),
  m("g-K-4", "K", 2, "2026-06-24", "COL", "COD", "GDL", { local: "20:00", mex: "20:00", arg: "23:00", esp: "04:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/colombia-dr-congo-2654395498756182042"),

  // ─── MATCHDAY 3 ─────────────────────────────────────────
  m("g-A-5", "A", 3, "2026-06-25", "CZE", "MEX", "AZTECA", { local: "19:00", mex: "19:00", arg: "22:00", esp: "03:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/czechia-mexico-2654408805349203968"),
  m("g-A-6", "A", 3, "2026-06-25", "RSA", "KOR", "MTY", { local: "19:00", mex: "19:00", arg: "22:00", esp: "03:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/south-africa-republic-of-korea-2654408805349203983"),
  m("g-B-5", "B", 3, "2026-06-24", "SUI", "CAN", "BC", { local: "13:00", mex: "13:00", arg: "16:00", esp: "21:00" }, "https://thrill.com/sports/soccer/international/world-cup/switzerland-canada-2654408805349204015"),
  m("g-B-6", "B", 3, "2026-06-24", "BIH", "QAT", "SEA", { local: "13:00", mex: "13:00", arg: "16:00", esp: "21:00" }, "https://thrill.com/sports/soccer/international/world-cup/bosnia--herzegovina-qatar-2654408805349204008"),
  m("g-C-5", "C", 3, "2026-06-25", "SCO", "BRA", "MIA", { local: "16:00", mex: "16:00", arg: "19:00", esp: "00:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/scotland-brazil-2654395498756182053"),
  m("g-C-6", "C", 3, "2026-06-25", "MAR", "HAI", "ATL", { local: "17:00", mex: "16:00", arg: "19:00", esp: "00:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/morocco-haiti-2654424160721313799"),

  m("g-E-5", "E", 3, "2026-06-25", "ECU", "GER", "NYNJ", { local: "13:00", mex: "14:00", arg: "17:00", esp: "22:00" }, "https://thrill.com/sports/soccer/international/world-cup/ecuador-germany-2654425224531021841"),
  m("g-E-6", "E", 3, "2026-06-25", "CUW", "CIV", "PHI", { local: "15:00", mex: "14:00", arg: "17:00", esp: "22:00" }, "https://thrill.com/sports/soccer/international/world-cup/curacao-ivory-coast-2654425224531021840"),
  m("g-D-5", "D", 3, "2026-06-26", "TUR", "USA", "LA", { local: "19:00", mex: "20:00", arg: "23:00", esp: "04:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/turkiye-usa-2654424704957423665"),
  m("g-D-6", "D", 3, "2026-06-26", "PAR", "AUS", "SF", { local: "20:00", mex: "20:00", arg: "23:00", esp: "04:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/paraguay-australia-2654424704957423664"),
  m("g-F-5", "F", 3, "2026-06-26", "TUN", "NED", "KC", { local: "17:00", mex: "17:00", arg: "20:00", esp: "01:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/tunisia-netherlands-2654426068370460674"),
  m("g-F-6", "F", 3, "2026-06-26", "JPN", "SWE", "DAL", { local: "17:00", mex: "17:00", arg: "20:00", esp: "01:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/japan-sweden-2654426068370460673"),

  m("g-H-5", "H", 3, "2026-06-27", "URU", "ESP", "GDL", { local: "18:00", mex: "18:00", arg: "21:00", esp: "02:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/uruguay-spain-2654426068370460694"),
  m("g-H-6", "H", 3, "2026-06-27", "CPV", "KSA", "HOU", { local: "20:00", mex: "20:00", arg: "21:00", esp: "02:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/cape-verde-saudi-arabia-2654426068370460693"),
  m("g-G-5", "G", 3, "2026-06-27", "NZL", "BEL", "BC", { local: "21:00", mex: "21:00", arg: "00:00+1", esp: "05:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/new-zealand-belgium-2654426068370460689"),
  m("g-G-6", "G", 3, "2026-06-27", "EGY", "IRN", "SEA", { local: "21:00", mex: "21:00", arg: "00:00+1", esp: "05:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/egypt-iran-2654426068370460688"),
  m("g-I-5", "I", 3, "2026-06-26", "NOR", "FRA", "BOS", { local: "13:00", mex: "13:00", arg: "16:00", esp: "21:00" }, "https://thrill.com/sports/soccer/international/world-cup/norway-france-2654426068370460715"),
  m("g-I-6", "I", 3, "2026-06-26", "SEN", "IRQ", "TOR", { local: "13:00", mex: "13:00", arg: "16:00", esp: "21:00" }, "https://thrill.com/sports/soccer/international/world-cup/senegal-iraq-2654426068370460719"),

  m("g-J-5", "J", 3, "2026-06-28", "JOR", "ARG", "DAL", { local: "20:00", mex: "20:00", arg: "23:00", esp: "04:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/jordan-argentina-2654427383414788102"),
  m("g-J-6", "J", 3, "2026-06-28", "ALG", "AUT", "KC", { local: "20:00", mex: "20:00", arg: "23:00", esp: "04:00+1" }, "https://thrill.com/sports/soccer/international/world-cup/algeria-austria-2654427383414788101"),
  m("g-K-5", "K", 3, "2026-06-28", "COL", "POR", "MIA", { local: "18:30", mex: "17:30", arg: "20:30", esp: "01:30+1" }, "https://thrill.com/sports/soccer/international/world-cup/colombia-portugal-2654427383414788111"),
  m("g-K-6", "K", 3, "2026-06-28", "COD", "UZB", "ATL", { local: "18:30", mex: "17:30", arg: "20:30", esp: "01:30+1" }, "https://thrill.com/sports/soccer/international/world-cup/dr-congo-uzbekistan-2654427383414788113"),
  m("g-L-5", "L", 3, "2026-06-27", "PAN", "ENG", "NYNJ", { local: "15:00", mex: "15:00", arg: "18:00", esp: "23:00" }, "https://thrill.com/sports/soccer/international/world-cup/panama-england-2654427383414788121"),
  m("g-L-6", "L", 3, "2026-06-27", "CRO", "GHA", "PHI", { local: "15:00", mex: "15:00", arg: "18:00", esp: "23:00" }, "https://thrill.com/sports/soccer/international/world-cup/croatia-ghana-2654427383414788120"),
];

Object.assign(window, { VENUES, groupMatches });
