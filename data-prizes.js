// ─── PRIZE POOLS — revised $20,000 structure ─────────────
// Total campaign budget: $20,000 USDT — every pool is a ticket-based raffle.
//
// HOW WINNING WORKS — TICKETS, NOT POINTS
//   Users earn TICKETS by acting in the mini-app and on Thrill (predictions,
//   visits, tasks, registration, deposits). Each pool draws winners by raffle
//   weighted by tickets. Boosts MULTIPLY the tickets you earn (2x → 100x).
//
// SEVEN RAFFLE LAYERS — 58 raffles total · 290 winners:
//
//   1. DAILY     17 game days   × 5 winners ×  $80 = 85 winners · $6,800 (34.0%)
//   2. GROUP     10 groups      × 5 winners ×  $60 = 50 winners · $3,000 (15.0%)
//   3. R32       16 fixtures    × 5 winners ×  $20 = 80 winners · $1,600 ( 8.0%)
//   4. R16        8 fixtures    × 5 winners ×  $40 = 40 winners · $1,600 ( 8.0%)
//   5. QUARTERS   4 fixtures    × 5 winners ×  $60 = 20 winners · $1,200 ( 6.0%)
//   6. SEMIS      2 fixtures    × 5 winners ×  $80 = 10 winners ·   $800 ( 4.0%)
//   7. FINAL      1 fixture     × 5 winners × $1k =   5 winners · $5,000 (25.0%)
//
//   GRAND TOTAL · 290 winners across 58 raffles · $20,000

const POOL_LAYERS = [
  {
    key: "daily",
    short: "Daily",
    label: "Daily Raffle",
    scope: "per-day",
    unitLabel: "game day",
    units: 17,
    winnersPerUnit: 5,
    perUnitBudget: 400,
    totalBudget: 6800,
    pct: 34.0,
    color: "#FF9F1C",
    glow: "rgba(255,159,28,0.22)",
    hook: "Drive daily return visits",
    description: "5 winners drawn from the daily ticket pool · $80 each.",
    payouts: [
      { method: "raffle", rank: "Daily raffle", slots: 5, prize: 80 },
    ],
  },
  {
    key: "group",
    short: "Group",
    label: "Group Raffles",
    scope: "per-group",
    unitLabel: "group",
    units: 10,
    winnersPerUnit: 5,
    perUnitBudget: 300,
    totalBudget: 3000,
    pct: 15.0,
    color: "#22D3EE",
    glow: "rgba(34,211,238,0.22)",
    hook: "One raffle per group · 5 winners each",
    description: "5 raffle winners per group · $60 each · weighted by your tickets.",
    payouts: [
      { method: "raffle", rank: "Group raffle", slots: 5, prize: 60 },
    ],
  },
  {
    key: "r32",
    short: "R32",
    label: "Round of 32",
    scope: "per-fixture",
    unitLabel: "fixture",
    units: 16,
    winnersPerUnit: 5,
    perUnitBudget: 100,
    totalBudget: 1600,
    pct: 8.0,
    color: "#FFD60A",
    glow: "rgba(255,214,10,0.22)",
    hook: "Knockouts begin — stakes rise per match",
    description: "5 raffle winners per knockout fixture · $20 each.",
    payouts: [
      { method: "raffle", rank: "Fixture raffle", slots: 5, prize: 20 },
    ],
  },
  {
    key: "r16",
    short: "R16",
    label: "Round of 16",
    scope: "per-fixture",
    unitLabel: "fixture",
    units: 8,
    winnersPerUnit: 5,
    perUnitBudget: 200,
    totalBudget: 1600,
    pct: 8.0,
    color: "#A78BFA",
    glow: "rgba(167,139,250,0.22)",
    hook: "Fewer fixtures · bigger prizes",
    description: "5 raffle winners per fixture · $40 each.",
    payouts: [
      { method: "raffle", rank: "Fixture raffle", slots: 5, prize: 40 },
    ],
  },
  {
    key: "qf",
    short: "QF",
    label: "Quarterfinals",
    scope: "per-fixture",
    unitLabel: "fixture",
    units: 4,
    winnersPerUnit: 5,
    perUnitBudget: 300,
    totalBudget: 1200,
    pct: 6.0,
    color: "#FF4D67",
    glow: "rgba(255,77,103,0.22)",
    hook: "Final 8 — every match matters",
    description: "5 raffle winners per quarterfinal · $60 each.",
    payouts: [
      { method: "raffle", rank: "Fixture raffle", slots: 5, prize: 60 },
    ],
  },
  {
    key: "sf",
    short: "SF",
    label: "Semifinals",
    scope: "per-fixture",
    unitLabel: "fixture",
    units: 2,
    winnersPerUnit: 5,
    perUnitBudget: 400,
    totalBudget: 800,
    pct: 4.0,
    color: "#F472B6",
    glow: "rgba(244,114,182,0.22)",
    hook: "Two matches decide the finalists",
    description: "5 raffle winners per semifinal · $80 each.",
    payouts: [
      { method: "raffle", rank: "Fixture raffle", slots: 5, prize: 80 },
    ],
  },
  {
    key: "final",
    short: "Final",
    label: "Final Mega Raffle",
    scope: "per-fixture",
    unitLabel: "fixture",
    units: 1,
    winnersPerUnit: 5,
    perUnitBudget: 5000,
    totalBudget: 5000,
    pct: 25.0,
    color: "#5DEDA5",
    glow: "rgba(93,237,165,0.28)",
    hook: "The hero prize of the campaign",
    description: "5 raffle winners draw $1,000 each from the Final ticket pool.",
    payouts: [
      { method: "raffle",     rank: "Grand prize", slots: 4, prize: 1000 },
      { method: "vip_raffle", rank: "VIP raffle",  slots: 1, prize: 1000 },
    ],
  },
];

// ─── TODAY'S POOL ──────────────────────────────────────
// Today is Jun 13 — Matchday 3 of the group stage. Drives the Home hero.
const TODAY_POOL = {
  date: "2026-06-13",
  dateLabel: "Fri · Jun 13",
  matchdayLabel: "Matchday 3",
  closesInHours: 7,
  closesAtLabel: "23:59 UTC",
  matches: 4,
  stageOfDay: "group",
  // One Daily raffle today — $400 budget, 5 winners at $80 each.
  dailySlot: 400,
  combinedTotal: 400,
  winnersTotal: 5,
  // unlock GATES
  unlock: {
    minPredictions: 3,
    minThrillVisits: 1,
    minThrillTasks: 1,
  },
  // Yesterday's reveal (the dopamine moment on return) — pure raffle outcome
  yesterday: {
    dateLabel: "Thu · Jun 12",
    youWon: true,
    prizeAmount: 80,             // matches the daily raffle slot prize
    method: "raffle",
    yourTickets: 4,
    totalTickets: 18420,
    totalWinners: 5,             // 5 daily-pool winners
    fixtureWinnersToday: 5,
    winProbability: 0.00109,     // 4/18420 — surfaced as "1 in 921"
    poolKey: "daily",
  },
  // Live "winners just paid" feed
  recentWinners: [
    { name: "@goalden_era",  amount: 80,   method: "raffle",     country: "BRA", time: "2m ago", scope: "daily raffle"   },
    { name: "@pixelpenalty", amount: 60,   method: "raffle",     country: "USA", time: "3m ago", scope: "group D raffle" },
    { name: "@chip_shot",    amount: 80,   method: "raffle",     country: "ENG", time: "5m ago", scope: "daily raffle"   },
    { name: "@nutmeg_king",  amount: 60,   method: "raffle",     country: "NED", time: "6m ago", scope: "group B raffle" },
    { name: "@diegokicks",   amount: 60,   method: "raffle",     country: "ARG", time: "9m ago", scope: "group J raffle" },
  ],
};

// Total winner counts (for headline copy)
const TOTAL_WINNERS = POOL_LAYERS.reduce(
  (acc, p) => acc + p.units * p.winnersPerUnit, 0
);

// Ticket / scoring rules per spec §7 — used for the unlock progress UI.
// Action → XP → tickets exchange table. A correct match prediction
// settles to +1 ticket — but that ticket counts toward TWO pools at
// once: the Daily raffle for that game day AND the round's raffle
// (group / r32 / r16 / qf / sf / final). Group-outcome picks add 3
// tickets to the Group pool. Thrill registration adds tickets to Daily
// and the Final mega-pool. First deposit unlocks the VIP slot in the Final.
const TICKET_RULES = [
  { action: "Make a prediction",          xp: 10,   tickets: 0,  pools: [],                  note: "Counts toward daily unlock" },
  { action: "Correct match prediction",   xp: 50,   tickets: 1,  pools: ["daily", "{stage}"],note: "+1 to Daily AND the round's raffle" },
  { action: "Correct group outcome",      xp: 150,  tickets: 3,  pools: ["group"],           note: "Predict who advances from a group" },
  { action: "Visit Thrill betting page",  xp: 25,   tickets: 0,  pools: [],                  note: "Counts toward daily unlock" },
  { action: "Complete a Thrill task",     xp: 100,  tickets: 1,  pools: ["daily"],           note: "Bonus daily raffle entry" },
  { action: "Register on Thrill",         xp: 500,  tickets: 5,  pools: ["daily", "final"],  note: "Validated postback" },
  { action: "First deposit on Thrill",    xp: 1500, tickets: 15, pools: ["final"],           note: "Unlocks VIP slot in Final" },
];

const TICKET_CAPS = {
  daily: 12,
  group: 25,
  r32: 25,
  r16: 25,
  qf: 30,
  sf: 40,
  final: 100,
};

// ─── Helpers ────────────────────────────────────────────
function poolByKey(k) { return POOL_LAYERS.find(p => p.key === k); }

// Compute pool unlock progress given the user's daily-pool action counts.
function dailyUnlockProgress(s) {
  const u = TODAY_POOL.unlock;
  const preds = Math.min(s.predictions || 0, u.minPredictions);
  const visits = Math.min(s.thrillVisits || 0, u.minThrillVisits);
  const tasks = Math.min(s.thrillTasks || 0, u.minThrillTasks);
  const total = u.minPredictions + u.minThrillVisits + u.minThrillTasks;
  const done  = preds + visits + tasks;
  const ratio = done / total;
  const eligible = preds === u.minPredictions
                && visits === u.minThrillVisits
                && tasks === u.minThrillTasks;
  return { preds, visits, tasks, total, done, ratio, eligible, u };
}

// Selection-method styling tokens
const METHOD_TOKENS = {
  top_score:         { label: "Top score",   color: "#5DEDA5", icon: "trophy" },
  raffle:            { label: "Raffle",      color: "#FF9F1C", icon: "wheel"  },
  task_bonus_raffle: { label: "Task bonus",  color: "#FFD60A", icon: "bolt"   },
  vip_raffle:        { label: "VIP raffle",  color: "#FF4D67", icon: "star"   },
};

Object.assign(window, {
  POOL_LAYERS, TODAY_POOL, TICKET_RULES, TICKET_CAPS, METHOD_TOKENS,
  TOTAL_WINNERS,
  poolByKey, dailyUnlockProgress,
});
