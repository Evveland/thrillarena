// POST /api/admin/grade  { matchId, homeScore, awayScore }
// Manual result entry — grades predictions for one match immediately.
const requireAdmin = require("./_auth");

const SB_URL = "https://zlslbgtuvjswkeeamxvb.supabase.co";

function sbH(key) {
  return { "apikey": key, "Authorization": `Bearer ${key}`, "Content-Type": "application/json", "Prefer": "return=representation" };
}
async function sbGet(path, key) {
  const r = await fetch(`${SB_URL}${path}`, { headers: sbH(key) });
  const t = await r.text();
  try { return JSON.parse(t); } catch { return []; }
}
async function sbPatch(path, key, body) {
  const r = await fetch(`${SB_URL}${path}`, { method: "PATCH", headers: sbH(key), body: JSON.stringify(body) });
  return r.ok;
}
async function sbRpc(fn, key, params = {}) {
  await fetch(`${SB_URL}/rest/v1/rpc/${fn}`, {
    method: "POST", headers: sbH(key), body: JSON.stringify(params),
  });
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")    return res.status(405).end();
  if (!requireAdmin(req, res))  return;

  const KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!KEY) return res.status(500).json({ error: "SUPABASE_SERVICE_KEY not set" });

  const { matchId, homeScore, awayScore } = req.body || {};
  if (!matchId || homeScore == null || awayScore == null) {
    return res.status(400).json({ error: "matchId, homeScore, awayScore required" });
  }

  const now = new Date().toISOString();
  const log = [];

  // Fetch the match
  const matches = await sbGet(`/rest/v1/matches?external_id=eq.${matchId}&select=*`, KEY);
  const match = matches[0];
  if (!match) return res.status(404).json({ error: `Match not found: ${matchId}` });

  // Update match
  await sbPatch(`/rest/v1/matches?id=eq.${match.id}`, KEY, {
    home_score: homeScore, away_score: awayScore,
    result_status: "graded", graded_at: now,
  });
  log.push(`Updated ${matchId}: ${match.home_team} ${homeScore}-${awayScore} ${match.away_team}`);

  // Grade predictions
  const preds = await sbGet(
    `/rest/v1/predictions?match_id=eq.${match.id}&select=id,user_id,prediction_value,confidence`,
    KEY
  );

  let correct = 0, incorrect = 0;
  for (const pred of preds) {
    let isCorrect;
    if (homeScore > awayScore) {
      isCorrect = pred.prediction_value === match.home_team;
    } else if (awayScore > homeScore) {
      isCorrect = pred.prediction_value === match.away_team;
    } else {
      isCorrect = pred.prediction_value === "draw";
    }

    const status = isCorrect ? "correct" : "incorrect";
    await sbPatch(`/rest/v1/predictions?id=eq.${pred.id}`, KEY, {
      result_status: status, is_correct: isCorrect, graded_at: now,
    });

    if (isCorrect) {
      await sbRpc("award_prediction_tickets", KEY, { p_prediction_id: pred.id });
      correct++;
      log.push(`  ✓ @${pred.user_id.slice(0,8)} → ${pred.prediction_value} correct`);
    } else {
      incorrect++;
      log.push(`  ✗ @${pred.user_id.slice(0,8)} → ${pred.prediction_value} incorrect`);
    }
  }

  log.push(`Graded ${preds.length} predictions: ${correct} correct, ${incorrect} incorrect`);
  return res.json({ ok: true, log, correct, incorrect, total: preds.length });
};
