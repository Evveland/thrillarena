// Aggregate WC2026 schedule + supporting data (tasks, leaderboards, prizes)

// ─── STAGES summary ──────────────────────────────────────
const STAGES = [
  { key: "groups", label: "First Stage",   short: "Groups", matches: groupMatches, count: groupMatches.length },
  { key: "r32",    label: "Round of 32",   short: "R32",    matches: R32, count: R32.length },
  { key: "r16",    label: "Round of 16",   short: "R16",    matches: R16, count: R16.length },
  { key: "qf",     label: "Quarterfinals", short: "QF",     matches: QF,  count: QF.length },
  { key: "sf",     label: "Semifinals",    short: "SF",     matches: SF,  count: SF.length },
  { key: "final",  label: "Final",         short: "Final",  matches: FINAL, count: FINAL.length },
];

const ALL_MATCHES = [...groupMatches, ...R32, ...R16, ...QF, ...SF, ...THIRD, ...FINAL];

// ─── TASKS ────────────────────────────────────────────────
const TASKS = [
  { id: "spin",             title: "Daily Spin",             sub: "Spin to earn up to ⚡50",         reward: "1–50 ⚡",    cooldown: "Ready", type: "spin",             primary: true, icon: "wheel"    },
  { id: "invite",           title: "Invite a friend",        sub: "0 of 5 invited",                  reward: "+30 ⚡ each",cooldown: "Open",  type: "invite",                         icon: "people"   },
  { id: "thrill_register",  title: "Register on Thrill",     sub: "Create your free casino account", reward: "+30 ⚡",     cooldown: "Once",  type: "thrill_register",                icon: "bolt"     },
  { id: "channel",          title: "Join Telegram channel",  sub: "@thrill_arena",                   reward: "+10 ⚡",     cooldown: "Once",  type: "channel",                        icon: "telegram" },
  { id: "wallet",           title: "Connect TON wallet",     sub: "Required for USDT payout",        reward: "+10 ⚡",     cooldown: "Once",  type: "wallet",                         icon: "wallet"   },
];

// ─── LEADERBOARDS ─────────────────────────────────────────
// Populated at runtime from Supabase via SupaDB.loadLeaderboard()
const LEADERBOARD = [];
const FRIENDS     = [];
const COUNTRIES   = [];
const YOUR_COUNTRY = null;

// ─── SPIN WHEEL ───────────────────────────────────────────
const WHEEL_SEGMENTS = [
  { label: "+5",  energy: 5,  color: "#5DEDA5" },
  { label: "+1",  energy: 1,  color: "#1A2038" },
  { label: "+10", energy: 10, color: "#FF9F1C" },
  { label: "TRY", energy: 0,  color: "#232844" },
  { label: "+25", energy: 25, color: "#FF4D67" },
  { label: "+2",  energy: 2,  color: "#1A2038" },
  { label: "+50", energy: 50, color: "#FFD60A" },
  { label: "+5",  energy: 5,  color: "#5DEDA5" },
];

// ─── PRIZE STRUCTURE ──────────────────────────────────────
// 20,000 USDT total pool. Every prize is now a TICKET-BASED RAFFLE —
// see POOL_LAYERS in data-prizes.js. The old rank-tier system (Top 500,
// Top 100, Top 10, …) has been retired; boosts no longer gate eligibility,
// they multiply the tickets you earn into the raffles.
const PRIZE_POOL_TOTAL = 20000;
const PRIZE_POOL_CURRENCY = "USDT";

// Empty stub kept for any legacy reference. Raffle prize structure lives
// in POOL_LAYERS (data-prizes.js).
const PRIZE_TIERS = [];

// ─── BOOST / TICKET MULTIPLIER LADDER ─────────────────────
// Deposit tiers in USD. The multiplier applies to TICKETS earned from
// correct predictions and tasks. More tickets = better raffle odds.
// Latest deposit defines your tier; boost persists across the campaign.
const BOOST_TIERS = [
  { min: 0,   mult: 1,   label: "1x",   unlockLabel: "Base · 1 ticket per action", color: "#5A6480" },
  { min: 10,  mult: 2,   label: "2x",   unlockLabel: "2 tickets per action",       color: "#5DEDA5" },
  { min: 20,  mult: 5,   label: "5x",   unlockLabel: "5 tickets per action",       color: "#22D3EE" },
  { min: 50,  mult: 10,  label: "10x",  unlockLabel: "10 tickets per action",      color: "#A78BFA" },
  { min: 200, mult: 50,  label: "50x",  unlockLabel: "50 tickets per action",      color: "#FF9F1C" },
  { min: 500, mult: 100, label: "100x", unlockLabel: "100 tickets per action",     color: "#FF4D67" },
];

// Quick deposit buttons (one per ladder tier).
const QUICK_DEPOSIT_AMOUNTS = [10, 20, 50, 200, 500];

// Decay removed — boost stays active for the rest of the campaign.
const BOOST_DECAY_RATE = 0;

// Supported deposit currencies. `rate` = how many of the unit = $1 USD.
// `chain` is for display (TON for USDT-jetton; ETH-network for ETH/USDC; BTC own; BSC for BNB).
const DEPOSIT_CURRENCIES = [
  { code: "USDT", name: "Tether",        chain: "TON",    color: "#26A17B", rate: 1.00,      decimals: 2 },
  { code: "USDC", name: "USD Coin",      chain: "ETH",    color: "#2775CA", rate: 1.00,      decimals: 2 },
  { code: "BTC",  name: "Bitcoin",       chain: "BTC",    color: "#F7931A", rate: 0.0000095, decimals: 8 },
  { code: "ETH",  name: "Ethereum",      chain: "ETH",    color: "#627EEA", rate: 0.00026,   decimals: 6 },
  { code: "BNB",  name: "BNB",           chain: "BSC",    color: "#F3BA2F", rate: 0.0015,    decimals: 5 },
];

// Helper: which boost tier you're in given lifetime USD deposited
function boostTierFor(amountUSD) {
  let t = BOOST_TIERS[0];
  for (const tier of BOOST_TIERS) if (amountUSD >= tier.min) t = tier;
  return t;
}

// Helper: current multiplier — boost no longer decays, so this just
// returns the raw tier mult. Signature preserved for compatibility.
function currentMultiplier(tier /*, stagesDecayed, decayRate */) {
  return tier.mult;
}

// Retired — there are no rank caps anymore. Returns a label-only stub
// describing the user's current ticket multiplier so any legacy copy
// that still calls this falls back cleanly.
function rankCapForMult(mult) {
  return {
    label: `${fmtMult(mult)} tickets per action`,
    amount: 0, rank: "", requiredMult: 1,
  };
}

// Format multiplier — integer when whole, two decimals otherwise.
function fmtMult(m) {
  return m % 1 === 0 ? `${m}x` : `${m.toFixed(2)}x`;
}

const SCORING = [
  { stage: "groups", label: "First Stage",   pts: 10,  bonus: "+5 exact score" },
  { stage: "r32",    label: "Round of 32",   pts: 25,  bonus: "+10 underdog" },
  { stage: "r16",    label: "Round of 16",   pts: 50,  bonus: "+15 underdog" },
  { stage: "qf",     label: "Quarterfinals", pts: 100, bonus: "+25 underdog" },
  { stage: "sf",     label: "Semifinals",    pts: 200, bonus: "+50 underdog" },
  { stage: "final",  label: "Final",         pts: 500, bonus: "+100 exact score" },
];

// Retired — rank-based projections replaced by ticket-raffle model.
function projectReward() { return null; }

// ─── Helpers ──────────────────────────────────────────────
// Find a team by its short code, OR treat "1A" / "W·R32-1" / etc. as a slot placeholder.
function teamOrSlot(codeOrSlot) {
  if (TEAMS[codeOrSlot]) return { resolved: true, ...TEAMS[codeOrSlot] };
  return { resolved: false, slot: codeOrSlot };
}

// Format a date "2026-06-11" → "JUN 11"
function fmtDate(iso) {
  if (!iso) return "TBD";
  const d = new Date(iso + "T12:00:00Z");
  return d.toLocaleDateString("en", { month: "short", day: "2-digit", timeZone: "UTC" }).toUpperCase();
}

// Helpers: build a Thrill match-betting URL from two team short codes.
// Slug pattern: thrill.com/sports/soccer/international/world-cup/{home-slug}-{away-slug}
// The actual Thrill URLs include a long match ID at the end — to use them,
// set the `bet` field on a match in data-matches.js / data-knockout.js with the full URL.
function thrillBettingURL(homeCode, awayCode) {
  const h = TEAMS[homeCode];
  const a = TEAMS[awayCode];
  if (!h || !a) return "https://thrill.com/sports/soccer/international/world-cup";
  const slug = (s) => s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `https://thrill.com/sports/soccer/international/world-cup/${slug(h.name)}-${slug(a.name)}`;
}

function matchBettingURL(match) {
  if (match.bet) return match.bet;
  if (typeof match.home !== "string" || typeof match.away !== "string") return null;
  if (!TEAMS[match.home] || !TEAMS[match.away]) return null;
  return thrillBettingURL(match.home, match.away);
}

Object.assign(window, {
  STAGES, ALL_MATCHES, TASKS, LEADERBOARD, FRIENDS, COUNTRIES, YOUR_COUNTRY,
  WHEEL_SEGMENTS, PRIZE_TIERS, PRIZE_POOL_TOTAL, PRIZE_POOL_CURRENCY,
  BOOST_TIERS, QUICK_DEPOSIT_AMOUNTS, BOOST_DECAY_RATE, DEPOSIT_CURRENCIES,
  boostTierFor, currentMultiplier, rankCapForMult, fmtMult,
  SCORING, projectReward, teamOrSlot, fmtDate,
  thrillBettingURL, matchBettingURL,
});
