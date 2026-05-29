// FIFA World Cup 2026 — Official schedule
// 48 teams, 12 groups of 4, 72 group matches → 32 advance → R32 → ... → Final
// Hosts: USA, Canada, Mexico • Jun 11 – Jul 19, 2026

// ─── TEAMS (48 confirmed) ──────────────────────────────────
const TEAMS = {
  // Hosts
  MEX: { name: "Mexico",          flag: "🇲🇽", short: "MEX" },
  USA: { name: "United States",   flag: "🇺🇸", short: "USA" },
  CAN: { name: "Canada",          flag: "🇨🇦", short: "CAN" },

  // South America (CONMEBOL)
  ARG: { name: "Argentina",       flag: "🇦🇷", short: "ARG" },
  BRA: { name: "Brazil",          flag: "🇧🇷", short: "BRA" },
  URU: { name: "Uruguay",         flag: "🇺🇾", short: "URU" },
  COL: { name: "Colombia",        flag: "🇨🇴", short: "COL" },
  ECU: { name: "Ecuador",         flag: "🇪🇨", short: "ECU" },
  PAR: { name: "Paraguay",        flag: "🇵🇾", short: "PAR" },

  // Europe (UEFA)
  FRA: { name: "France",          flag: "🇫🇷", short: "FRA" },
  ENG: { name: "England",         flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", short: "ENG" },
  ESP: { name: "Spain",           flag: "🇪🇸", short: "ESP" },
  GER: { name: "Germany",         flag: "🇩🇪", short: "GER" },
  POR: { name: "Portugal",        flag: "🇵🇹", short: "POR" },
  NED: { name: "Netherlands",     flag: "🇳🇱", short: "NED" },
  BEL: { name: "Belgium",         flag: "🇧🇪", short: "BEL" },
  CRO: { name: "Croatia",         flag: "🇭🇷", short: "CRO" },
  SUI: { name: "Switzerland",     flag: "🇨🇭", short: "SUI" },
  AUT: { name: "Austria",         flag: "🇦🇹", short: "AUT" },
  NOR: { name: "Norway",          flag: "🇳🇴", short: "NOR" },
  SCO: { name: "Scotland",        flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", short: "SCO" },
  CZE: { name: "Czech Republic",  flag: "🇨🇿", short: "CZE" },
  SWE: { name: "Sweden",          flag: "🇸🇪", short: "SWE" },
  TUR: { name: "Türkiye",         flag: "🇹🇷", short: "TUR" },
  BIH: { name: "Bosnia & Herz.",  flag: "🇧🇦", short: "BIH" },

  // Africa (CAF)
  MAR: { name: "Morocco",         flag: "🇲🇦", short: "MAR" },
  SEN: { name: "Senegal",         flag: "🇸🇳", short: "SEN" },
  EGY: { name: "Egypt",           flag: "🇪🇬", short: "EGY" },
  ALG: { name: "Algeria",         flag: "🇩🇿", short: "ALG" },
  CIV: { name: "Côte d'Ivoire",   flag: "🇨🇮", short: "CIV" },
  GHA: { name: "Ghana",           flag: "🇬🇭", short: "GHA" },
  CPV: { name: "Cape Verde",      flag: "🇨🇻", short: "CPV" },
  TUN: { name: "Tunisia",         flag: "🇹🇳", short: "TUN" },
  RSA: { name: "South Africa",    flag: "🇿🇦", short: "RSA" },
  COD: { name: "DR Congo",        flag: "🇨🇩", short: "COD" },

  // Asia (AFC)
  JPN: { name: "Japan",           flag: "🇯🇵", short: "JPN" },
  KOR: { name: "South Korea",     flag: "🇰🇷", short: "KOR" },
  IRN: { name: "Iran",            flag: "🇮🇷", short: "IRN" },
  AUS: { name: "Australia",       flag: "🇦🇺", short: "AUS" },
  KSA: { name: "Saudi Arabia",    flag: "🇸🇦", short: "KSA" },
  QAT: { name: "Qatar",           flag: "🇶🇦", short: "QAT" },
  UZB: { name: "Uzbekistan",      flag: "🇺🇿", short: "UZB" },
  JOR: { name: "Jordan",          flag: "🇯🇴", short: "JOR" },
  IRQ: { name: "Iraq",            flag: "🇮🇶", short: "IRQ" },

  // CONCACAF (minus hosts)
  PAN: { name: "Panama",          flag: "🇵🇦", short: "PAN" },
  HAI: { name: "Haiti",           flag: "🇭🇹", short: "HAI" },
  CUW: { name: "Curaçao",         flag: "🇨🇼", short: "CUW" },

  // OFC
  NZL: { name: "New Zealand",     flag: "🇳🇿", short: "NZL" },
};

// ─── GROUPS (official) ────────────────────────────────────
const GROUPS = {
  A: ["MEX", "RSA", "CZE", "KOR"],
  B: ["CAN", "BIH", "SUI", "QAT"],
  C: ["BRA", "MAR", "HAI", "SCO"],
  D: ["USA", "PAR", "TUR", "AUS"],
  E: ["GER", "CUW", "CIV", "ECU"],
  F: ["NED", "JPN", "SWE", "TUN"],
  G: ["BEL", "EGY", "IRN", "NZL"],
  H: ["ESP", "CPV", "KSA", "URU"],
  I: ["FRA", "SEN", "IRQ", "NOR"],
  J: ["ARG", "ALG", "AUT", "JOR"],
  K: ["POR", "COD", "UZB", "COL"],
  L: ["ENG", "CRO", "GHA", "PAN"],
};

Object.assign(window, { TEAMS, GROUPS });
