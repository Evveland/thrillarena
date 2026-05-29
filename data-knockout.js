// WC2026 knockout schedule — venues/dates are scheduled but participating teams are TBD.
// Each knockout match references slots like "1A" (Group A winner), "2B" (Group B runner-up), etc.
// After R32, everything (date, venue, teams) is TBD.

// Build a TBD team placeholder
const TBD = (label) => ({ tbd: true, label });

// R32: 16 matches, Jun 28 – Jul 3, real venues/dates per FIFA plan
const R32 = [
  { id: "r32-1",  stage: "r32", date: "2026-06-28", home: "1A", away: "2C", venue: "AZTECA", times: { local: "12:00", mex: "12:00", arg: "15:00", esp: "20:00" } },
  { id: "r32-2",  stage: "r32", date: "2026-06-28", home: "1B", away: "2D", venue: "TOR",    times: { local: "14:00", mex: "12:00", arg: "15:00", esp: "20:00" } },
  { id: "r32-3",  stage: "r32", date: "2026-06-28", home: "1C", away: "2A", venue: "PHI",    times: { local: "18:00", mex: "17:00", arg: "20:00", esp: "01:00+1" } },
  { id: "r32-4",  stage: "r32", date: "2026-06-28", home: "1D", away: "2B", venue: "LA",     times: { local: "21:00", mex: "20:00", arg: "23:00", esp: "04:00+1" } },

  { id: "r32-5",  stage: "r32", date: "2026-06-29", home: "1E", away: "2G", venue: "DAL",    times: { local: "11:00", mex: "11:00", arg: "14:00", esp: "19:00" } },
  { id: "r32-6",  stage: "r32", date: "2026-06-29", home: "1F", away: "2H", venue: "ATL",    times: { local: "14:00", mex: "13:00", arg: "16:00", esp: "21:00" } },
  { id: "r32-7",  stage: "r32", date: "2026-06-29", home: "1G", away: "2E", venue: "SEA",    times: { local: "13:00", mex: "13:00", arg: "16:00", esp: "21:00" } },
  { id: "r32-8",  stage: "r32", date: "2026-06-29", home: "1H", away: "2F", venue: "MIA",    times: { local: "18:00", mex: "17:00", arg: "20:00", esp: "01:00+1" } },

  { id: "r32-9",  stage: "r32", date: "2026-06-30", home: "1I", away: "2K", venue: "NYNJ",   times: { local: "12:00", mex: "13:00", arg: "16:00", esp: "21:00" } },
  { id: "r32-10", stage: "r32", date: "2026-06-30", home: "1J", away: "2L", venue: "KC",     times: { local: "15:00", mex: "15:00", arg: "18:00", esp: "23:00" } },
  { id: "r32-11", stage: "r32", date: "2026-06-30", home: "1K", away: "2I", venue: "GDL",    times: { local: "18:00", mex: "18:00", arg: "21:00", esp: "02:00+1" } },
  { id: "r32-12", stage: "r32", date: "2026-06-30", home: "1L", away: "2J", venue: "BC",     times: { local: "19:00", mex: "19:00", arg: "22:00", esp: "03:00+1" } },

  // Third-place runners-up slots (3X = 3rd place of some group, qualifier)
  { id: "r32-13", stage: "r32", date: "2026-07-01", home: "3A", away: "3F", venue: "MTY",    times: { local: "19:00", mex: "19:00", arg: "22:00", esp: "03:00+1" } },
  { id: "r32-14", stage: "r32", date: "2026-07-01", home: "3B", away: "3E", venue: "HOU",    times: { local: "17:00", mex: "17:00", arg: "20:00", esp: "01:00+1" } },
  { id: "r32-15", stage: "r32", date: "2026-07-02", home: "3C", away: "3H", venue: "SF",     times: { local: "16:00", mex: "17:00", arg: "20:00", esp: "01:00+1" } },
  { id: "r32-16", stage: "r32", date: "2026-07-02", home: "3D", away: "3G", venue: "BOS",    times: { local: "18:00", mex: "19:00", arg: "22:00", esp: "03:00+1" } },
];

// R16, QF, SF, FINAL — all TBD
const tbdMatch = (id, stage, slotA, slotB) => ({
  id, stage, date: null, home: slotA, away: slotB, venue: null, times: null, tbd: true,
});

const R16 = [
  tbdMatch("r16-1", "r16", "W·R32-1", "W·R32-2"),
  tbdMatch("r16-2", "r16", "W·R32-3", "W·R32-4"),
  tbdMatch("r16-3", "r16", "W·R32-5", "W·R32-6"),
  tbdMatch("r16-4", "r16", "W·R32-7", "W·R32-8"),
  tbdMatch("r16-5", "r16", "W·R32-9", "W·R32-10"),
  tbdMatch("r16-6", "r16", "W·R32-11", "W·R32-12"),
  tbdMatch("r16-7", "r16", "W·R32-13", "W·R32-14"),
  tbdMatch("r16-8", "r16", "W·R32-15", "W·R32-16"),
];

const QF = [
  tbdMatch("qf-1", "qf", "W·R16-1", "W·R16-2"),
  tbdMatch("qf-2", "qf", "W·R16-3", "W·R16-4"),
  tbdMatch("qf-3", "qf", "W·R16-5", "W·R16-6"),
  tbdMatch("qf-4", "qf", "W·R16-7", "W·R16-8"),
];

const SF = [
  tbdMatch("sf-1", "sf", "W·QF-1", "W·QF-2"),
  tbdMatch("sf-2", "sf", "W·QF-3", "W·QF-4"),
];

const THIRD = [
  tbdMatch("third-1", "third", "L·SF-1", "L·SF-2"),
];

const FINAL = [
  tbdMatch("final-1", "final", "W·SF-1", "W·SF-2"),
];

Object.assign(window, { TBD, R32, R16, QF, SF, THIRD, FINAL });
