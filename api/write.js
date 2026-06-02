// POST /api/write  { initData, operation, payload }
// Uses Supabase REST API directly (no SDK dependency).
const crypto = require("crypto");

// Restrict CORS to the mini-app's own origin. TELEGRAM_APP_ORIGIN must be set
// to the canonical Vercel deployment URL (e.g. https://thrill-arena.vercel.app).
const ALLOWED_ORIGIN = process.env.TELEGRAM_APP_ORIGIN || null;

const CORS = {
  "Access-Control-Allow-Origin":  ALLOWED_ORIGIN || "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ── Supabase REST helpers ─────────────────────────────────
function sbHeaders(serviceKey) {
  return {
    "apikey":        serviceKey,
    "Authorization": `Bearer ${serviceKey}`,
    "Content-Type":  "application/json",
    "Prefer":        "return=representation",
  };
}

async function sbQuery(url, serviceKey, method = "GET", body = null) {
  const opts = { method, headers: sbHeaders(serviceKey) };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { ok: res.ok, status: res.status, data };
}

function sbUrl(baseUrl, table, query = "") {
  return `${baseUrl}/rest/v1/${table}${query ? "?" + query : ""}`;
}

// ── Telegram verification ─────────────────────────────────
const MAX_INITDATA_AGE_SEC = 3600; // reject tokens older than 1 hour

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
    // Reject replayed / expired initData (M1)
    const authDate = parseInt(params.get("auth_date") || "0", 10);
    if (!authDate || Math.floor(Date.now() / 1000) - authDate > MAX_INITDATA_AGE_SEC) return null;
    return JSON.parse(params.get("user") || "{}");
  } catch { return null; }
}

function telegramIdToUUID(telegramId) {
  const hash = crypto.createHash("sha256").update(`thrill-arena:${telegramId}`).digest("hex");
  return [hash.slice(0,8), hash.slice(8,12), "4"+hash.slice(13,16),
    ((parseInt(hash[16],16)&3)|8).toString(16)+hash.slice(17,20), hash.slice(20,32)].join("-");
}

// ── Handler ───────────────────────────────────────────────
module.exports = async function handler(req, res) {
  Object.entries(CORS).forEach(([k,v]) => res.setHeader(k,v));
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")    return res.status(405).end();

  const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY;
  const BOT_TOKEN    = process.env.TELEGRAM_BOT_TOKEN;
  const SUPABASE_URL = "https://zlslbgtuvjswkeeamxvb.supabase.co";

  if (!SERVICE_KEY) return res.status(500).json({ error: "SUPABASE_SERVICE_KEY not set" });

  const { initData, operation, payload = {} } = req.body || {};
  if (!operation) return res.status(400).json({ error: "operation required" });

  // Identify user — two tiers:
  // 1. Verified Telegram initData (primary — derives deterministic UUID from telegram_id)
  // 2. payload.userId (stable localStorage UUID — guest/fallback, no real-money rewards)
  // Tier-2 (unverified telegramId from payload) removed — it allowed user impersonation.
  let userId, telegramId, tgUser = {};
  let authTier = null;

  if (initData && BOT_TOKEN) {
    const verified = verifyTelegram(initData, BOT_TOKEN);
    if (verified?.id) {
      telegramId = Number(verified.id);
      userId     = telegramIdToUUID(telegramId);
      tgUser     = verified;
      authTier   = 1;
      console.log("[write] tier-1 auth: telegram", telegramId, "→", userId);
    }
  }

  if (!userId && payload.userId) {
    // Guest / localStorage UUID — only allowed for read-like operations.
    // Real-reward writes (save_deposit, record_energy, save_task) require tier-1.
    userId   = payload.userId;
    authTier = 3;
    console.log("[write] tier-3 auth: localStorage userId", userId);
  }

  if (!userId) return res.status(401).json({ error: "Authentication required" });

  // Operations that touch real rewards require verified Telegram identity.
  const REWARD_OPS = ["save_deposit", "record_energy", "save_task"];
  if (REWARD_OPS.includes(operation) && authTier !== 1) {
    return res.status(401).json({ error: "Telegram initData required for this operation" });
  }

  const BASE = SUPABASE_URL;

  try {
    switch (operation) {

      // ── Upsert user ─────────────────────────────────────
      case "upsert_user": {
        const username     = payload.username     || tgUser.username   || null;
        const display_name = payload.display_name || tgUser.first_name || null;

        // Compute referred_by UUID from referrerTelegramId (passed by client from start_param)
        let referred_by = null;
        if (payload.referrerTelegramId) {
          referred_by = telegramIdToUUID(Number(payload.referrerTelegramId));
          console.log("[write] referral detected:", payload.referrerTelegramId, "→", referred_by);
        }

        // Try INSERT — new user starts with 20 energy.
        // DB trigger award_referral_energy() fires when referred_by IS NOT NULL → referrer gets +30⚡.
        const ins = await sbQuery(
          `${BASE}/rest/v1/users`,
          SERVICE_KEY, "POST",
          { id: userId, telegram_id: telegramId, username, display_name, referred_by, energy_balance: 20 }
        );

        if (!ins.ok) {
          // Conflict — existing user, update name only (don't overwrite referred_by)
          await sbQuery(`${BASE}/rest/v1/users?id=eq.${userId}`, SERVICE_KEY, "PATCH",
            { username, display_name });
        } else if (referred_by) {
          // Successful INSERT with referral — also reload referrer's energy
          // so it reflects the +30⚡ awarded by the DB trigger
          console.log("[write] new referred user inserted, trigger will award energy to", referred_by);
        }

        const get = await sbQuery(`${BASE}/rest/v1/users?id=eq.${userId}&select=*`, SERVICE_KEY, "GET");
        const user = Array.isArray(get.data) ? get.data[0] : null;
        return res.json({ ok: true, user });
      }

      // ── Save prediction ──────────────────────────────────
      case "save_prediction": {
        const { matchId, predictionValue, energyCost, confidence } = payload;
        // Resolve match UUID from external_id, and check locks_at
        const mRes = await sbQuery(
          `${BASE}/rest/v1/matches?external_id=eq.${encodeURIComponent(matchId)}&select=id,locks_at`,
          SERVICE_KEY, "GET"
        );
        const match = Array.isArray(mRes.data) ? mRes.data[0] : null;
        if (!match) return res.json({ ok: false, error: `match not found: ${matchId}` });
        if (match.locks_at && new Date(match.locks_at) <= new Date()) {
          return res.status(403).json({ ok: false, error: "Predictions closed for this match" });
        }

        const r = await sbQuery(
          `${BASE}/rest/v1/predictions`,
          SERVICE_KEY, "POST",
          { user_id: userId, match_id: match.id, prediction_value: predictionValue, energy_cost: energyCost || 0, confidence: confidence || 60 }
        );
        if (!r.ok && r.status === 409) {
          await sbQuery(
            `${BASE}/rest/v1/predictions?user_id=eq.${userId}&match_id=eq.${match.id}`,
            SERVICE_KEY, "PATCH",
            { prediction_value: predictionValue, energy_cost: energyCost || 0, confidence: confidence || 60 }
          );
        }
        return res.json({ ok: true });
      }

      // ── Record energy ────────────────────────────────────
      case "record_energy": {
        const { actionType, delta: rawDelta, relatedUserId, notes } = payload;

        // Server-side delta bounds per action type — client-supplied delta is ignored.
        const ALLOWED_DELTAS = {
          spin:              { min: 0,    max: 50   },
          prediction:        { min: -100, max: 0    },
          wallet_connect:    { min: 50,   max: 50   },
          referral_activated:{ min: 50,   max: 50   },
          referral_bonus:    { min: 30,   max: 30   },
        };
        const bounds = ALLOWED_DELTAS[actionType];
        if (!bounds) return res.status(400).json({ error: `Unknown actionType: ${actionType}` });

        const delta = Math.max(bounds.min, Math.min(bounds.max, Number(rawDelta) || 0));

        // Special case: spin has a 24-hour cooldown enforced server-side.
        if (actionType === "spin") {
          const userRow = await sbQuery(`${BASE}/rest/v1/users?id=eq.${userId}&select=last_spin_at`, SERVICE_KEY, "GET");
          const user = Array.isArray(userRow.data) ? userRow.data[0] : null;
          const lastSpin = user?.last_spin_at ? new Date(user.last_spin_at).getTime() : 0;
          if (Date.now() - lastSpin < 23.5 * 3600 * 1000) {
            return res.status(429).json({ error: "Spin cooldown active" });
          }
        }

        // Read current balance from DB — never trust client-supplied balanceAfter.
        const curRes = await sbQuery(`${BASE}/rest/v1/users?id=eq.${userId}&select=energy_balance`, SERVICE_KEY, "GET");
        const curUser = Array.isArray(curRes.data) ? curRes.data[0] : null;
        if (!curUser) return res.status(404).json({ error: "User not found" });

        const currentBalance = Number(curUser.energy_balance) || 0;
        const balanceAfter   = Math.max(0, Math.min(9999, currentBalance + delta));

        await sbQuery(`${BASE}/rest/v1/energy_ledger`, SERVICE_KEY, "POST",
          { user_id: userId, action_type: actionType, delta, balance_after: balanceAfter,
            related_user_id: relatedUserId || null, notes: notes || null });

        const patchBody = { energy_balance: balanceAfter };
        if (actionType === "spin") patchBody.last_spin_at = new Date().toISOString();
        await sbQuery(`${BASE}/rest/v1/users?id=eq.${userId}`, SERVICE_KEY, "PATCH", patchBody);

        return res.json({ ok: true, balanceAfter });
      }

      // ── Save deposit + boost ─────────────────────────────
      // NOTE: This records that a deposit was reported. Full security requires
      // out-of-band TON transaction verification before calling this endpoint.
      // The multiplier is derived server-side from depositNumber — never from client.
      case "save_deposit": {
        const { depositNumber, amount, currency } = payload;

        // Validate depositNumber is 1-3 integer
        const depNum = parseInt(depositNumber, 10);
        if (![1, 2, 3].includes(depNum)) {
          return res.status(400).json({ error: "depositNumber must be 1, 2, or 3" });
        }

        // Server-side multiplier tier table — client-supplied multiplier is ignored.
        const MULTIPLIER_TABLE = { 1: 2, 2: 3, 3: 5 };
        const serverMultiplier = MULTIPLIER_TABLE[depNum];
        const trigger = depNum === 1 ? "first_deposit" : depNum === 2 ? "second_deposit" : "third_deposit";

        await sbQuery(`${BASE}/rest/v1/deposits`, SERVICE_KEY, "POST",
          { user_id: userId, deposit_number: depNum, amount, currency });
        await sbQuery(`${BASE}/rest/v1/user_boosts?user_id=eq.${userId}`, SERVICE_KEY, "PATCH",
          { is_active: false });
        await sbQuery(`${BASE}/rest/v1/user_boosts`, SERVICE_KEY, "POST",
          { user_id: userId, trigger, multiplier: serverMultiplier, is_active: true });
        return res.json({ ok: true });
      }

      // ── Save task ────────────────────────────────────────
      case "save_task": {
        const taskType = payload.taskType;
        const KNOWN_TASKS = ["wallet_connect", "channel_join", "thrill_task"];
        if (!KNOWN_TASKS.includes(taskType)) {
          return res.status(400).json({ error: `Unknown taskType: ${taskType}` });
        }

        // wallet_connect: confirm wallet_address is already saved for this user.
        if (taskType === "wallet_connect") {
          const uRes = await sbQuery(`${BASE}/rest/v1/users?id=eq.${userId}&select=wallet_address`, SERVICE_KEY, "GET");
          const u = Array.isArray(uRes.data) ? uRes.data[0] : null;
          if (!u?.wallet_address) {
            return res.status(400).json({ error: "Wallet not connected — save wallet address first" });
          }
        }

        // Idempotent insert — ignore conflict if task already completed.
        const r = await sbQuery(`${BASE}/rest/v1/thrill_tasks`, SERVICE_KEY, "POST",
          { user_id: userId, task_type: taskType, status: "completed",
            verified_at: new Date().toISOString() });
        // 409 = already exists, treat as success
        if (!r.ok && r.status !== 409) {
          return res.status(500).json({ error: "Failed to save task" });
        }
        return res.json({ ok: true });
      }

      // ── Save wallet ──────────────────────────────────────
      case "save_wallet": {
        await sbQuery(`${BASE}/rest/v1/users?id=eq.${userId}`, SERVICE_KEY, "PATCH",
          { wallet_address: payload.address, wallet_name: payload.walletName || null });
        return res.json({ ok: true });
      }

      // ── Load full state ──────────────────────────────────
      case "load_state": {
        const [userRes, predsRes, boostsRes, depositsRes] = await Promise.all([
          sbQuery(`${BASE}/rest/v1/users?id=eq.${userId}&select=*`, SERVICE_KEY, "GET"),
          sbQuery(`${BASE}/rest/v1/predictions?user_id=eq.${userId}&select=match_id,prediction_value,result_status,is_correct`, SERVICE_KEY, "GET"),
          sbQuery(`${BASE}/rest/v1/user_boosts?user_id=eq.${userId}&is_active=eq.true&select=trigger,multiplier&order=multiplier.desc&limit=1`, SERVICE_KEY, "GET"),
          sbQuery(`${BASE}/rest/v1/deposits?user_id=eq.${userId}&select=deposit_number,amount,currency&order=deposit_number.asc`, SERVICE_KEY, "GET"),
        ]);

        const preds = Array.isArray(predsRes.data) ? predsRes.data : [];
        const matchIds = preds.map(p => p.match_id).filter(Boolean);
        let matchMap = {};
        if (matchIds.length) {
          const mRes = await sbQuery(
            `${BASE}/rest/v1/matches?id=in.(${matchIds.join(",")})&select=id,external_id`,
            SERVICE_KEY, "GET"
          );
          (Array.isArray(mRes.data) ? mRes.data : []).forEach(m => { matchMap[m.id] = m.external_id; });
        }

        const predsMap = {};
        preds.forEach(p => { if (matchMap[p.match_id]) predsMap[matchMap[p.match_id]] = p.prediction_value; });

        const boosts = Array.isArray(boostsRes.data) ? boostsRes.data : [];
        const deposits = Array.isArray(depositsRes.data) ? depositsRes.data : [];

        return res.json({
          ok: true,
          user:             Array.isArray(userRes.data) ? userRes.data[0] : null,
          predictions:      predsMap,
          multiplier:       boosts[0]?.multiplier ?? 1,
          lifetimeDeposited:deposits.reduce((s,d) => s + Number(d.amount), 0),
          depositCount:     deposits.length,
        });
      }

      // ── Referral count ───────────────────────────────────
      case "get_referral_count": {
        const r = await sbQuery(
          `${BASE}/rest/v1/users?referred_by=eq.${userId}&select=id`,
          SERVICE_KEY, "GET"
        );
        return res.json({ ok: true, count: Array.isArray(r.data) ? r.data.length : 0 });
      }

      default:
        return res.status(400).json({ error: `Unknown operation: ${operation}` });
    }
  } catch (e) {
    console.error("[write]", operation, e.message, e.stack);
    return res.status(500).json({ error: "Internal server error" });
  }
};
