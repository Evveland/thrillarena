// GET /api/odds?matchId=g-A-1
// Returns live betting odds for a match + an AI-generated suggestion.
//
// Required Vercel env vars:
//   ODDS_API_KEY        — free at https://the-odds-api.com
//   ANTHROPIC_API_KEY   — for the Claude suggestion
//   SUPABASE_SERVICE_KEY — already set
//
// Caches results in Supabase match_odds table (1-hour TTL).

const crypto = require("crypto");

const SB_URL = "https://zlslbgtuvjswkeeamxvb.supabase.co";
const ODDS_SPORT = "soccer_fifa_world_cup_2026";
const CACHE_TTL_MINUTES = 60;

function sbH(key) {
  return { "apikey": key, "Authorization": `Bearer ${key}`, "Content-Type": "application/json", "Prefer": "return=representation" };
}
async function sbGet(path, key) {
  const r = await fetch(`${SB_URL}${path}`, { headers: sbH(key) });
  const t = await r.text();
  try { return JSON.parse(t); } catch { return null; }
}
async function sbUpsert(table, key, row) {
  await fetch(`${SB_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: { ...sbH(key), "Prefer": "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(row),
  });
}

// Convert decimal odds to implied probability %
function impliedProb(decimal) {
  return decimal > 0 ? Math.round((1 / decimal) * 100) : 0;
}

// Map implied probability to confidence tier
function probToConfidence(prob) {
  if (prob >= 60) return 85;   // Strong favorite → High (×3 tickets, 20⚡)
  if (prob >= 48) return 72;   // Moderate → Medium (×2 tickets, 15⚡)
  return 57;                    // Underdog/even → Low (×1 ticket, 10⚡)
}

// Generate suggestion via Claude
async function generateSuggestion(homeTeam, awayTeam, oddsHome, oddsDraw, oddsAway, anthropicKey) {
  if (!anthropicKey) return null;

  const probH = impliedProb(oddsHome);
  const probD = impliedProb(oddsDraw);
  const probA = impliedProb(oddsAway);

  const prompt = `You are a concise sports betting advisor for a World Cup prediction game.

Match: ${homeTeam} vs ${awayTeam}
Bookmaker odds (decimal):
  ${homeTeam} win: ${oddsHome} (${probH}% implied chance)
  Draw: ${oddsDraw} (${probD}% implied chance)
  ${awayTeam} win: ${oddsAway} (${probA}% implied chance)

In the game, correct predictions earn raffle tickets:
  Low confidence (50-64%) → 1 ticket, costs 10 energy
  Medium confidence (65-79%) → 2 tickets, costs 15 energy
  High confidence (80-100%) → 3 tickets, costs 20 energy

Give a 1-2 sentence recommendation: which outcome to predict and what confidence level to use, with brief reasoning. Be direct and specific. Do not mention the game mechanics — just say what to pick and why.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 120,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.content?.[0]?.text?.trim() || null;
  } catch { return null; }
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "public, max-age=300"); // 5-min browser cache
  if (req.method === "OPTIONS") return res.status(200).end();

  const { matchId } = req.query;
  if (!matchId) return res.status(400).json({ error: "matchId required" });

  const SERVICE_KEY   = process.env.SUPABASE_SERVICE_KEY;
  const ODDS_KEY      = process.env.ODDS_API_KEY;
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

  if (!SERVICE_KEY) return res.status(500).json({ error: "SUPABASE_SERVICE_KEY not set" });

  // ── Check cache ────────────────────────────────────────────
  const cached = await sbGet(
    `/rest/v1/match_odds?external_id=eq.${matchId}&select=*`,
    SERVICE_KEY
  );

  if (Array.isArray(cached) && cached[0]) {
    const row = cached[0];
    const ageMin = (Date.now() - new Date(row.fetched_at).getTime()) / 60000;
    if (ageMin < CACHE_TTL_MINUTES) {
      return res.json({ source: "cache", ...row });
    }
  }

  // ── Fetch from The Odds API ────────────────────────────────
  if (!ODDS_KEY) {
    // No API key — return empty so UI shows fallback
    return res.json({ source: "no_key", external_id: matchId });
  }

  let oddsData = null;
  try {
    const oddsRes = await fetch(
      `https://api.the-odds-api.com/v4/sports/${ODDS_SPORT}/odds/?apiKey=${ODDS_KEY}&regions=eu,uk&markets=h2h&oddsFormat=decimal`,
      { headers: { "Accept": "application/json" } }
    );

    if (oddsRes.ok) {
      const matches = await oddsRes.json();
      // Find this match by comparing team names to our external_id parts
      // matchId format: g-A-1 → home/away in DB
      // Try to match by looking up from Supabase match record
      const matchRec = await sbGet(
        `/rest/v1/matches?external_id=eq.${matchId}&select=home_team,away_team`,
        SERVICE_KEY
      );
      const dbMatch = Array.isArray(matchRec) ? matchRec[0] : null;

      if (dbMatch && Array.isArray(matches)) {
        const homeCode = dbMatch.home_team?.toUpperCase();
        const awayCode = dbMatch.away_team?.toUpperCase();

        // Match by team name similarity
        for (const m of matches) {
          const mHome = m.home_team?.toUpperCase();
          const mAway = m.away_team?.toUpperCase();
          if (mHome?.includes(homeCode) || homeCode?.includes(mHome?.slice(0,3)) ||
              mAway?.includes(awayCode) || awayCode?.includes(mAway?.slice(0,3))) {
            const bk = m.bookmakers?.[0];
            const h2h = bk?.markets?.find(mk => mk.key === "h2h");
            if (h2h) {
              const outcomes = h2h.outcomes || [];
              const homeOdds = outcomes.find(o => o.name?.includes(m.home_team?.split(" ").pop()))?.price;
              const awayOdds = outcomes.find(o => o.name?.includes(m.away_team?.split(" ").pop()))?.price;
              const drawOdds = outcomes.find(o => o.name === "Draw")?.price;

              if (homeOdds && awayOdds) {
                oddsData = {
                  home_team: dbMatch.home_team,
                  away_team: dbMatch.away_team,
                  odds_home: homeOdds,
                  odds_draw: drawOdds || null,
                  odds_away: awayOdds,
                  bookmaker: bk.title || bk.key,
                };
              }
              break;
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn("[odds] fetch error:", e.message);
  }

  // ── Fallback: compute from match data if no odds found ─────
  if (!oddsData) {
    const matchRec = await sbGet(
      `/rest/v1/matches?external_id=eq.${matchId}&select=home_team,away_team`,
      SERVICE_KEY
    );
    const dbMatch = Array.isArray(matchRec) ? matchRec[0] : null;
    if (!dbMatch) return res.json({ source: "no_match", external_id: matchId });
    // Return empty odds so UI shows "odds unavailable"
    return res.json({ source: "unavailable", external_id: matchId, home_team: dbMatch.home_team, away_team: dbMatch.away_team });
  }

  // ── Determine best pick + confidence from odds ────────────
  const probH = impliedProb(oddsData.odds_home);
  const probD = impliedProb(oddsData.odds_draw || 99);
  const probA = impliedProb(oddsData.odds_away);

  let suggestedPick, suggestedProb;
  if (probH >= probA && probH >= probD) { suggestedPick = oddsData.home_team; suggestedProb = probH; }
  else if (probA >= probH && probA >= probD) { suggestedPick = oddsData.away_team; suggestedProb = probA; }
  else { suggestedPick = "draw"; suggestedProb = probD; }

  const suggestedConfidence = probToConfidence(suggestedProb);

  // ── Generate AI suggestion ─────────────────────────────────
  const suggestion = await generateSuggestion(
    oddsData.home_team, oddsData.away_team,
    oddsData.odds_home, oddsData.odds_draw || 3.5, oddsData.odds_away,
    ANTHROPIC_KEY
  );

  // ── Cache in Supabase ──────────────────────────────────────
  const row = {
    external_id:          matchId,
    home_team:            oddsData.home_team,
    away_team:            oddsData.away_team,
    odds_home:            oddsData.odds_home,
    odds_draw:            oddsData.odds_draw,
    odds_away:            oddsData.odds_away,
    bookmaker:            oddsData.bookmaker,
    suggestion:           suggestion,
    suggested_confidence: suggestedConfidence,
    fetched_at:           new Date().toISOString(),
  };
  await sbUpsert("match_odds", SERVICE_KEY, row);

  return res.json({ source: "live", ...row });
};
