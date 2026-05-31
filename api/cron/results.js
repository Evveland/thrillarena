// Match Results Agent
// Runs on a schedule (configured in vercel.json) and whenever called manually.
// 1. Fetches live/finished match results from football-data.org
// 2. Updates matches table with scores
// 3. Grades predictions (correct / incorrect)
// 4. Awards raffle tickets via award_prediction_tickets()
//
// Required Vercel env vars:
//   FOOTBALL_DATA_API_KEY  — free at https://www.football-data.org/client/register
//   SUPABASE_SERVICE_KEY   — already set
//   CRON_SECRET            — any string, protects the endpoint
//
// Manual trigger: POST /api/cron/results  { secret: "<CRON_SECRET>" }
// Or GET with header Authorization: Bearer <CRON_SECRET>

const SB_URL = "https://zlslbgtuvjswkeeamxvb.supabase.co";
// WC 2026 competition ID on football-data.org
const WC_COMPETITION = "WC";
const FD_BASE = "https://api.football-data.org/v4";

// ── Supabase REST helpers ────────────────────────────────────
function sbH(key) {
  return { "apikey": key, "Authorization": `Bearer ${key}`, "Content-Type": "application/json", "Prefer": "return=representation" };
}
async function sbGet(path, key) {
  const r = await fetch(`${SB_URL}${path}`, { headers: sbH(key) });
  const t = await r.text();
  try { return JSON.parse(t); } catch { return []; }
}
async function sbPatch(path, key, body) {
  await fetch(`${SB_URL}${path}`, { method: "PATCH", headers: sbH(key), body: JSON.stringify(body) });
}
async function sbRpc(fn, key, params = {}) {
  const r = await fetch(`${SB_URL}/rest/v1/rpc/${fn}`, {
    method: "POST", headers: sbH(key), body: JSON.stringify(params),
  });
  return r.ok;
}

// ── Normalize team name → match our DB's short codes ────────
// football-data.org uses full names; our DB stores short codes (e.g. MEX, BRA)
function normalizeTeam(name = "") {
  const MAP = {
    "Mexico": "MEX", "South Africa": "RSA", "Republic of Korea": "KOR", "Czechia": "CZE",
    "Canada": "CAN", "Bosnia and Herzegovina": "BIH", "Qatar": "QAT", "Switzerland": "SUI",
    "USA": "USA", "United States": "USA", "Paraguay": "PAR", "Brazil": "BRA",
    "Morocco": "MAR", "Haiti": "HAI", "Scotland": "SCO", "Germany": "GER",
    "Curacao": "CUW", "Netherlands": "NED", "Japan": "JPN", "Ivory Coast": "CIV",
    "Ecuador": "ECU", "Sweden": "SWE", "Tunisia": "TUN", "Spain": "ESP",
    "Cape Verde": "CPV", "Belgium": "BEL", "Egypt": "EGY", "Saudi Arabia": "KSA",
    "Uruguay": "URU", "Iran": "IRN", "New Zealand": "NZL", "France": "FRA",
    "Senegal": "SEN", "Iraq": "IRQ", "Norway": "NOR", "Argentina": "ARG",
    "Algeria": "ALG", "Austria": "AUT", "Portugal": "POR", "DR Congo": "COD",
    "England": "ENG", "Croatia": "CRO", "Ghana": "GHA", "Panama": "PAN",
    "Uzbekistan": "UZB", "Colombia": "COL", "Turkey": "TUR", "Australia": "AUS",
    "Jordan": "JOR", "Korea Republic": "KOR",
  };
  return MAP[name] || name.slice(0, 3).toUpperCase();
}

// ── Determine match result for a given prediction ────────────
function gradeOutcome(homeScore, awayScore, predValue, homeTeam, awayTeam) {
  if (homeScore > awayScore) {
    return predValue === homeTeam ? "correct" : "incorrect";
  } else if (awayScore > homeScore) {
    return predValue === awayTeam ? "correct" : "incorrect";
  } else {
    // Draw
    return predValue === "draw" ? "correct" : "incorrect";
  }
}

// ── Main handler ─────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  // Auth: accept GET (Vercel cron uses Authorization header) or POST with secret
  const CRON_SECRET   = process.env.CRON_SECRET;
  const SERVICE_KEY   = process.env.SUPABASE_SERVICE_KEY;
  const FD_KEY        = process.env.FOOTBALL_DATA_API_KEY;

  if (!SERVICE_KEY) return res.status(500).json({ error: "SUPABASE_SERVICE_KEY not set" });

  // Validate secret (skip check if CRON_SECRET is not configured — dev mode)
  if (CRON_SECRET) {
    const authHeader = req.headers["authorization"] || "";
    const bodySecret = req.body?.secret || "";
    if (authHeader !== `Bearer ${CRON_SECRET}` && bodySecret !== CRON_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  const log = [];
  const now = new Date().toISOString();
  log.push(`[${now}] Results agent started`);

  try {
    // ── Step 1: Get our pending matches from DB ──────────────
    const dbMatches = await sbGet(
      `/rest/v1/matches?result_status=eq.pending&select=id,external_id,home_team,away_team,stage,scheduled_at,campaign_id`,
      SERVICE_KEY
    );
    log.push(`Found ${dbMatches.length} pending matches in DB`);
    if (!dbMatches.length) {
      return res.json({ ok: true, log, updated: 0, graded: 0 });
    }

    // ── Step 2: Fetch finished matches from football-data.org ─
    let apiMatches = [];
    if (FD_KEY) {
      try {
        const fdRes = await fetch(`${FD_BASE}/competitions/${WC_COMPETITION}/matches?status=FINISHED`, {
          headers: { "X-Auth-Token": FD_KEY },
        });
        if (fdRes.ok) {
          const fdData = await fdRes.json();
          apiMatches = fdData.matches || [];
          log.push(`Fetched ${apiMatches.length} finished matches from football-data.org`);
        } else {
          log.push(`football-data.org error: ${fdRes.status} ${await fdRes.text()}`);
        }
      } catch (e) {
        log.push(`football-data.org fetch failed: ${e.message}`);
      }
    } else {
      log.push("FOOTBALL_DATA_API_KEY not set — skipping API fetch (manual results only)");
    }

    // ── Step 3: Match API results to our DB matches ──────────
    let updatedMatches = 0, gradedPredictions = 0;

    for (const apiMatch of apiMatches) {
      const apiHome = normalizeTeam(apiMatch.homeTeam?.name || apiMatch.homeTeam?.shortName);
      const apiAway = normalizeTeam(apiMatch.awayTeam?.name || apiMatch.awayTeam?.shortName);
      const homeScore = apiMatch.score?.fullTime?.home;
      const awayScore = apiMatch.score?.fullTime?.away;

      if (homeScore == null || awayScore == null) continue;

      // Find corresponding DB match by team names
      const dbMatch = dbMatches.find(m =>
        (m.home_team === apiHome || m.away_team === apiHome) &&
        (m.home_team === apiAway || m.away_team === apiAway)
      );
      if (!dbMatch) continue;

      log.push(`Updating ${dbMatch.external_id}: ${apiHome} ${homeScore}-${awayScore} ${apiAway}`);

      // Update match with score
      await sbPatch(
        `/rest/v1/matches?id=eq.${dbMatch.id}`,
        SERVICE_KEY,
        { home_score: homeScore, away_score: awayScore, result_status: "graded", graded_at: now }
      );
      updatedMatches++;

      // ── Step 4: Grade predictions for this match ──────────
      const preds = await sbGet(
        `/rest/v1/predictions?match_id=eq.${dbMatch.id}&result_status=eq.pending&select=id,user_id,prediction_value,confidence`,
        SERVICE_KEY
      );

      for (const pred of preds) {
        const outcome = gradeOutcome(homeScore, awayScore, pred.prediction_value, dbMatch.home_team, dbMatch.away_team);
        const isCorrect = outcome === "correct";

        // Update prediction
        await sbPatch(
          `/rest/v1/predictions?id=eq.${pred.id}`,
          SERVICE_KEY,
          { result_status: outcome, is_correct: isCorrect, graded_at: now }
        );

        // Award tickets if correct
        if (isCorrect) {
          await sbRpc("award_prediction_tickets", SERVICE_KEY, { p_prediction_id: pred.id });
          gradedPredictions++;
          log.push(`  ✓ ${pred.user_id.slice(0,8)} picked ${pred.prediction_value} — correct! tickets awarded`);
        } else {
          log.push(`  ✗ ${pred.user_id.slice(0,8)} picked ${pred.prediction_value} — incorrect`);
        }
      }
    }

    log.push(`Done: ${updatedMatches} matches updated, ${gradedPredictions} correct predictions ticketed`);
    return res.json({ ok: true, log, updated: updatedMatches, graded: gradedPredictions });

  } catch (e) {
    log.push(`ERROR: ${e.message}`);
    console.error("[results-agent]", e);
    return res.status(500).json({ ok: false, log, error: e.message });
  }
};
