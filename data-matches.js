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
  m("g-A-1", "A", 1, "2026-06-11", "MEX", "RSA", "AZTECA", { local: "12:00", mex: "12:00", arg: "16:00", esp: "21:00" }),
  m("g-A-2", "A", 1, "2026-06-12", "KOR", "CZE", "GDL", { local: "19:00", mex: "19:00", arg: "22:00", esp: "04:00+1" }),

  m("g-B-1", "B", 1, "2026-06-12", "CAN", "BIH", "TOR", { local: "14:00", mex: "12:00", arg: "16:00", esp: "21:00" }),
  m("g-D-1", "D", 1, "2026-06-13", "USA", "PAR", "LA", { local: "18:00", mex: "19:00", arg: "22:00", esp: "03:00+1" }),

  m("g-B-2", "B", 1, "2026-06-13", "QAT", "SUI", "SF", { local: "12:00", mex: "13:00", arg: "16:00", esp: "21:00" }),
  m("g-C-1", "C", 1, "2026-06-14", "BRA", "MAR", "NYNJ", { local: "15:00", mex: "16:00", arg: "19:00", esp: "00:00+1" }),
  m("g-D-2", "D", 1, "2026-06-14", "AUS", "TUR", "BC", { local: "21:00", mex: "22:00", arg: "01:00+1", esp: "06:00+1" }),
  m("g-C-2", "C", 1, "2026-06-14", "HAI", "SCO", "BOS", { local: "18:00", mex: "19:00", arg: "22:00", esp: "03:00+1" }),

  m("g-E-1", "E", 1, "2026-06-15", "GER", "CUW", "HOU", { local: "11:00", mex: "11:00", arg: "14:00", esp: "19:00" }),
  m("g-F-1", "F", 1, "2026-06-14", "NED", "JPN", "DAL", { local: "14:00", mex: "14:00", arg: "17:00", esp: "22:00" }),
  m("g-E-2", "E", 1, "2026-06-14", "CIV", "ECU", "PHI", { local: "18:00", mex: "17:00", arg: "20:00", esp: "01:00+1" }),
  m("g-F-2", "F", 1, "2026-06-15", "SWE", "TUN", "MTY", { local: "20:00", mex: "20:00", arg: "23:00", esp: "04:00+1" }),

  m("g-H-1", "H", 1, "2026-06-15", "ESP", "CPV", "ATL", { local: "11:00", mex: "10:00", arg: "13:00", esp: "18:00" }),
  m("g-G-1", "G", 1, "2026-06-15", "BEL", "EGY", "SEA", { local: "13:00", mex: "13:00", arg: "16:00", esp: "21:00" }),
  m("g-H-2", "H", 1, "2026-06-16", "KSA", "URU", "MIA", { local: "17:00", mex: "16:00", arg: "19:00", esp: "00:00+1" }),
  m("g-G-2", "G", 1, "2026-06-16", "IRN", "NZL", "LA", { local: "18:00", mex: "19:00", arg: "22:00", esp: "03:00+1" }),

  m("g-I-1", "I", 1, "2026-06-16", "FRA", "SEN", "NYNJ", { local: "12:00", mex: "13:00", arg: "16:00", esp: "21:00" }),
  m("g-I-2", "I", 1, "2026-06-17", "IRQ", "NOR", "BOS", { local: "15:00", mex: "16:00", arg: "19:00", esp: "00:00+1" }),
  m("g-J-1", "J", 1, "2026-06-17", "ARG", "ALG", "KC", { local: "19:00", mex: "19:00", arg: "22:00", esp: "03:00+1" }),
  m("g-J-2", "J", 1, "2026-06-17", "AUT", "JOR", "SF", { local: "21:00", mex: "22:00", arg: "01:00+1", esp: "06:00+1" }),

  m("g-K-1", "K", 1, "2026-06-17", "POR", "COD", "HOU", { local: "11:00", mex: "11:00", arg: "14:00", esp: "19:00" }),
  m("g-L-1", "L", 1, "2026-06-17", "ENG", "CRO", "DAL", { local: "14:00", mex: "14:00", arg: "17:00", esp: "22:00" }),
  m("g-L-2", "L", 1, "2026-06-17", "GHA", "PAN", "TOR", { local: "18:00", mex: "17:00", arg: "20:00", esp: "01:00+1" }),
  m("g-K-2", "K", 1, "2026-06-18", "UZB", "COL", "AZTECA", { local: "20:00", mex: "20:00", arg: "23:00", esp: "04:00+1" }),

  // ─── MATCHDAY 2 ─────────────────────────────────────────
  m("g-A-3", "A", 2, "2026-06-18", "CZE", "RSA", "ATL", { local: "11:00", mex: "10:00", arg: "13:00", esp: "18:00" }),
  m("g-B-3", "B", 2, "2026-06-18", "SUI", "BIH", "LA", { local: "13:00", mex: "13:00", arg: "16:00", esp: "21:00" }),
  m("g-B-4", "B", 2, "2026-06-19", "CAN", "QAT", "BC", { local: "16:00", mex: "16:00", arg: "19:00", esp: "00:00+1" }),
  m("g-A-4", "A", 2, "2026-06-19", "MEX", "KOR", "BANORTE", { local: "19:00", mex: "19:00", arg: "22:00", esp: "03:00+1" }),

  m("g-C-3", "C", 2, "2026-06-20", "SCO", "MAR", "BOS", { local: "15:00", mex: "16:00", arg: "19:00", esp: "00:00+1" }),
  m("g-D-3", "D", 2, "2026-06-19", "USA", "AUS", "SEA", { local: "13:00", mex: "13:00", arg: "16:00", esp: "21:00" }),
  m("g-C-4", "C", 2, "2026-06-20", "BRA", "HAI", "PHI", { local: "20:00", mex: "19:00", arg: "22:00", esp: "03:00+1" }),
  m("g-D-4", "D", 2, "2026-06-20", "TUR", "PAR", "SF", { local: "21:00", mex: "22:00", arg: "01:00+1", esp: "06:00+1" }),

  m("g-F-3", "F", 2, "2026-06-20", "NED", "SWE", "HOU", { local: "11:00", mex: "11:00", arg: "14:00", esp: "19:00" }),
  m("g-E-3", "E", 2, "2026-06-20", "GER", "CIV", "TOR", { local: "15:00", mex: "14:00", arg: "17:00", esp: "22:00" }),
  m("g-E-4", "E", 2, "2026-06-21", "ECU", "CUW", "KC", { local: "18:00", mex: "18:00", arg: "21:00", esp: "02:00+1" }),
  m("g-F-4", "F", 2, "2026-06-20", "TUN", "JPN", "MTY", { local: "22:00", mex: "22:00", arg: "01:00+1", esp: "06:00+1" }),

  m("g-H-3", "H", 2, "2026-06-21", "ESP", "KSA", "ATL", { local: "11:00", mex: "10:00", arg: "13:00", esp: "18:00" }),
  m("g-G-3", "G", 2, "2026-06-21", "BEL", "IRN", "LA", { local: "13:00", mex: "13:00", arg: "16:00", esp: "21:00" }),
  m("g-H-4", "H", 2, "2026-06-22", "URU", "CPV", "MIA", { local: "17:00", mex: "16:00", arg: "19:00", esp: "00:00+1" }),
  m("g-G-4", "G", 2, "2026-06-22", "NZL", "EGY", "BC", { local: "19:00", mex: "19:00", arg: "22:00", esp: "03:00+1" }),

  m("g-I-3", "I", 2, "2026-06-22", "FRA", "IRQ", "PHI", { local: "15:00", mex: "15:00", arg: "18:00", esp: "23:00" }),
  m("g-J-3", "J", 2, "2026-06-22", "ARG", "AUT", "DAL", { local: "11:00", mex: "11:00", arg: "14:00", esp: "19:00" }),
  m("g-I-4", "I", 2, "2026-06-23", "NOR", "SEN", "NYNJ", { local: "17:00", mex: "18:00", arg: "21:00", esp: "02:00+1" }),
  m("g-J-4", "J", 2, "2026-06-23", "JOR", "ALG", "SF", { local: "20:00", mex: "21:00", arg: "00:00+1", esp: "05:00+1" }),

  m("g-K-3", "K", 2, "2026-06-23", "POR", "UZB", "HOU", { local: "11:00", mex: "11:00", arg: "14:00", esp: "19:00" }),
  m("g-L-3", "L", 2, "2026-06-23", "ENG", "GHA", "BOS", { local: "13:00", mex: "14:00", arg: "17:00", esp: "22:00" }),
  m("g-L-4", "L", 2, "2026-06-23", "PAN", "CRO", "TOR", { local: "18:00", mex: "17:00", arg: "20:00", esp: "01:00+1" }),
  m("g-K-4", "K", 2, "2026-06-24", "COL", "COD", "GDL", { local: "20:00", mex: "20:00", arg: "23:00", esp: "04:00+1" }),

  // ─── MATCHDAY 3 ─────────────────────────────────────────
  m("g-A-5", "A", 3, "2026-06-25", "CZE", "MEX", "AZTECA", { local: "19:00", mex: "19:00", arg: "22:00", esp: "03:00+1" }),
  m("g-A-6", "A", 3, "2026-06-25", "RSA", "KOR", "MTY", { local: "19:00", mex: "19:00", arg: "22:00", esp: "03:00+1" }),
  m("g-B-5", "B", 3, "2026-06-24", "SUI", "CAN", "BC", { local: "13:00", mex: "13:00", arg: "16:00", esp: "21:00" }),
  m("g-B-6", "B", 3, "2026-06-24", "BIH", "QAT", "SEA", { local: "13:00", mex: "13:00", arg: "16:00", esp: "21:00" }),
  m("g-C-5", "C", 3, "2026-06-25", "SCO", "BRA", "MIA", { local: "16:00", mex: "16:00", arg: "19:00", esp: "00:00+1" }),
  m("g-C-6", "C", 3, "2026-06-25", "MAR", "HAI", "ATL", { local: "17:00", mex: "16:00", arg: "19:00", esp: "00:00+1" }),

  m("g-E-5", "E", 3, "2026-06-25", "ECU", "GER", "NYNJ", { local: "13:00", mex: "14:00", arg: "17:00", esp: "22:00" }),
  m("g-E-6", "E", 3, "2026-06-25", "CUW", "CIV", "PHI", { local: "15:00", mex: "14:00", arg: "17:00", esp: "22:00" }),
  m("g-D-5", "D", 3, "2026-06-26", "TUR", "USA", "LA", { local: "19:00", mex: "20:00", arg: "23:00", esp: "04:00+1" }),
  m("g-D-6", "D", 3, "2026-06-26", "PAR", "AUS", "SF", { local: "20:00", mex: "20:00", arg: "23:00", esp: "04:00+1" }),
  m("g-F-5", "F", 3, "2026-06-26", "TUN", "NED", "KC", { local: "17:00", mex: "17:00", arg: "20:00", esp: "01:00+1" }),
  m("g-F-6", "F", 3, "2026-06-26", "JPN", "SWE", "DAL", { local: "17:00", mex: "17:00", arg: "20:00", esp: "01:00+1" }),

  m("g-H-5", "H", 3, "2026-06-27", "URU", "ESP", "GDL", { local: "18:00", mex: "18:00", arg: "21:00", esp: "02:00+1" }),
  m("g-H-6", "H", 3, "2026-06-27", "CPV", "KSA", "HOU", { local: "20:00", mex: "20:00", arg: "21:00", esp: "02:00+1" }),
  m("g-G-5", "G", 3, "2026-06-27", "NZL", "BEL", "BC", { local: "21:00", mex: "21:00", arg: "00:00+1", esp: "05:00+1" }),
  m("g-G-6", "G", 3, "2026-06-27", "EGY", "IRN", "SEA", { local: "21:00", mex: "21:00", arg: "00:00+1", esp: "05:00+1" }),
  m("g-I-5", "I", 3, "2026-06-26", "NOR", "FRA", "BOS", { local: "13:00", mex: "13:00", arg: "16:00", esp: "21:00" }),
  m("g-I-6", "I", 3, "2026-06-26", "SEN", "IRQ", "TOR", { local: "13:00", mex: "13:00", arg: "16:00", esp: "21:00" }),

  m("g-J-5", "J", 3, "2026-06-28", "JOR", "ARG", "DAL", { local: "20:00", mex: "20:00", arg: "23:00", esp: "04:00+1" }),
  m("g-J-6", "J", 3, "2026-06-28", "ALG", "AUT", "KC", { local: "20:00", mex: "20:00", arg: "23:00", esp: "04:00+1" }),
  m("g-K-5", "K", 3, "2026-06-28", "COL", "POR", "MIA", { local: "18:30", mex: "17:30", arg: "20:30", esp: "01:30+1" }),
  m("g-K-6", "K", 3, "2026-06-28", "COD", "UZB", "ATL", { local: "18:30", mex: "17:30", arg: "20:30", esp: "01:30+1" }),
  m("g-L-5", "L", 3, "2026-06-27", "PAN", "ENG", "NYNJ", { local: "15:00", mex: "15:00", arg: "18:00", esp: "23:00" }),
  m("g-L-6", "L", 3, "2026-06-27", "CRO", "GHA", "PHI", { local: "15:00", mex: "15:00", arg: "18:00", esp: "23:00" }),
];

Object.assign(window, { VENUES, groupMatches });
