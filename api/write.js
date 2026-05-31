// POST /api/write  { initData, operation, payload }
// Server-side write proxy using the service role key.
// Validates the Telegram initData signature, then writes to Supabase
// using the service role — no client-side JWT auth needed.
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function verifyTelegram(initData, botToken) {
  try {
    const params = new URLSearchParams(initData);
    const hash   = params.get("hash");
    if (!hash) return null;
    params.delete("hash");
    const str = Array.from(params.entries()).sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => `${k}=${v}`).join("\n");
    const key  = crypto.createHmac("sha256","WebAppData").update(botToken).digest();
    const exp  = crypto.createHmac("sha256",key).update(str).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(exp,"hex"), Buffer.from(hash,"hex"))) return null;
    const userParam = params.get("user");
    return userParam ? JSON.parse(userParam) : {};
  } catch { return null; }
}

function telegramIdToUUID(telegramId) {
  const hash = crypto.createHash("sha256").update(`thrill-arena:${telegramId}`).digest("hex");
  return [hash.slice(0,8), hash.slice(8,12), "4"+hash.slice(13,16),
    ((parseInt(hash[16],16)&3)|8).toString(16)+hash.slice(17,20), hash.slice(20,32)].join("-");
}

module.exports = async function handler(req, res) {
  Object.entries(CORS).forEach(([k,v]) => res.setHeader(k,v));
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")    return res.status(405).end();

  const BOT_TOKEN    = process.env.TELEGRAM_BOT_TOKEN;
  const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY;
  const SUPABASE_URL = process.env.SUPABASE_URL || "https://zlslbgtuvjswkeeamxvb.supabase.co";

  if (!SERVICE_KEY) return res.status(500).json({ error: "SUPABASE_SERVICE_KEY not set" });

  const { initData, operation, payload } = req.body || {};
  if (!operation || !payload) return res.status(400).json({ error: "operation and payload required" });

  // Identify the user
  let userId, telegramId;
  if (initData && BOT_TOKEN) {
    const tgUser = verifyTelegram(initData, BOT_TOKEN);
    if (tgUser && tgUser.id) {
      telegramId = Number(tgUser.id);
      userId     = telegramIdToUUID(telegramId);
    }
  }
  // Fallback: accept a userId directly for dev/anonymous sessions
  if (!userId) {
    userId     = payload.userId || null;
    telegramId = payload.telegramId || null;
  }
  if (!userId) return res.status(400).json({ error: "Cannot identify user" });

  const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  try {
    switch (operation) {

      case "upsert_user": {
        const { username, display_name, referred_by } = payload;
        // Try insert first (new user — triggers referral energy award)
        const { error: ie } = await db.from("users").insert({
          id: userId, telegram_id: telegramId,
          username: username || null, display_name: display_name || null,
          referred_by: referred_by || null,
        });
        if (ie && (ie.code === "23505" || ie.message?.includes("duplicate"))) {
          await db.from("users").update({ username: username||null, display_name: display_name||null }).eq("id", userId);
        }
        const { data: user } = await db.from("users").select("*").eq("id", userId).single();
        return res.json({ ok: true, user });
      }

      case "save_prediction": {
        const { matchId, predictionValue, energyCost } = payload;
        // Look up match UUID from external_id
        const { data: match } = await db.from("matches").select("id").eq("external_id", matchId).single();
        if (!match) return res.json({ ok: false, error: "match not found: " + matchId });
        const { error } = await db.from("predictions").upsert(
          { user_id: userId, match_id: match.id, prediction_value: predictionValue, energy_cost: energyCost || 0 },
          { onConflict: "user_id,match_id" }
        );
        if (error) return res.json({ ok: false, error: error.message });
        return res.json({ ok: true });
      }

      case "record_energy": {
        const { actionType, delta, balanceAfter, relatedUserId, notes } = payload;
        await db.from("energy_ledger").insert({ user_id: userId, action_type: actionType, delta, balance_after: balanceAfter, related_user_id: relatedUserId||null, notes: notes||null });
        await db.from("users").update({ energy_balance: balanceAfter }).eq("id", userId);
        return res.json({ ok: true });
      }

      case "save_deposit": {
        const { depositNumber, amount, currency, multiplier } = payload;
        const trigger = depositNumber === 1 ? "first_deposit" : depositNumber === 2 ? "second_deposit" : "third_deposit";
        await db.from("deposits").upsert({ user_id: userId, deposit_number: depositNumber, amount, currency }, { onConflict: "user_id,deposit_number" });
        await db.from("user_boosts").update({ is_active: false }).eq("user_id", userId);
        await db.from("user_boosts").insert({ user_id: userId, trigger, multiplier, is_active: true });
        return res.json({ ok: true });
      }

      case "save_task": {
        const { taskType } = payload;
        await db.from("thrill_tasks").insert({ user_id: userId, task_type: taskType, status: "completed", verified_at: new Date().toISOString() });
        return res.json({ ok: true });
      }

      case "save_wallet": {
        const { address, walletName } = payload;
        await db.from("users").update({ wallet_address: address, wallet_name: walletName||null }).eq("id", userId);
        return res.json({ ok: true });
      }

      case "load_state": {
        const [userRes, predsRes, boostsRes, depositsRes] = await Promise.all([
          db.from("users").select("*").eq("id", userId).single(),
          db.from("predictions").select("match_id,prediction_value,result_status,is_correct").eq("user_id", userId),
          db.from("user_boosts").select("trigger,multiplier").eq("user_id", userId).eq("is_active", true).order("multiplier", { ascending: false }).limit(1),
          db.from("deposits").select("deposit_number,amount,currency").eq("user_id", userId).order("deposit_number"),
        ]);
        // Get match external_ids for prediction map
        const matchIds = (predsRes.data || []).map(p => p.match_id);
        let matchMap = {};
        if (matchIds.length) {
          const { data: matches } = await db.from("matches").select("id,external_id").in("id", matchIds);
          (matches || []).forEach(m => { matchMap[m.id] = m.external_id; });
        }
        const predsMap = {};
        (predsRes.data || []).forEach(p => { if (matchMap[p.match_id]) predsMap[matchMap[p.match_id]] = p.prediction_value; });
        return res.json({
          ok: true,
          user: userRes.data,
          predictions: predsMap,
          multiplier: boostsRes.data?.[0]?.multiplier ?? 1,
          lifetimeDeposited: (depositsRes.data||[]).reduce((s,d) => s+Number(d.amount),0),
          depositCount: depositsRes.data?.length ?? 0,
        });
      }

      case "get_referral_count": {
        const { data } = await db.from("users").select("id", { count: "exact", head: true }).eq("referred_by", userId);
        return res.json({ ok: true, count: data?.length ?? 0 });
      }

      default:
        return res.status(400).json({ error: "Unknown operation: " + operation });
    }
  } catch (e) {
    console.error("[write]", operation, e);
    return res.status(500).json({ error: e.message });
  }
};
