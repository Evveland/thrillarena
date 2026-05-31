// ─── Supabase client ─────────────────────────────────────
// All writes go through /api/write (Vercel, uses service role key).
// Reads use the anon client directly (public data like matches,
// leaderboard, and the user's own rows after write succeeds).
(function () {
  const SUPABASE_URL  = "https://zlslbgtuvjswkeeamxvb.supabase.co";
  const SUPABASE_ANON = "sb_publishable_xD8EAe55mT6H6lALeAJSCQ_dZzzrNni";
  const { createClient } = window.supabase;

  const db = createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // ── Match UUID lookup (public read, no auth) ───────────
  const matchUUIDs = {};

  async function loadMatchUUIDs() {
    const { data, error } = await db.from("matches").select("id, external_id");
    if (error) console.warn("[SupaDB] loadMatchUUIDs:", error.message);
    if (data)  data.forEach(m => { matchUUIDs[m.external_id] = m.id; });
    console.log("[SupaDB] loaded", Object.keys(matchUUIDs).length, "match UUIDs");
  }

  function matchUUID(externalId) { return matchUUIDs[externalId] || null; }

  // ── Write proxy ────────────────────────────────────────
  // Always uses the Vercel /api/write endpoint (service role, validated initData).
  async function write(operation, payload) {
    const initData = window.Telegram?.WebApp?.initData || "";
    try {
      const res = await fetch("/api/write", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ initData, operation, payload }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        console.warn("[SupaDB] write error:", operation, data?.error);
        return null;
      }
      return data;
    } catch (e) {
      console.warn("[SupaDB] write fetch error:", operation, e.message);
      return null;
    }
  }

  // ── Stable local user ID (fallback when initData verification fails) ──
  function getLocalUserId() {
    let id = localStorage.getItem("ta_user_id");
    if (!id) {
      id = (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : "u-" + Math.random().toString(36).slice(2, 18);
      localStorage.setItem("ta_user_id", id);
    }
    return id;
  }

  // ── User init ──────────────────────────────────────────
  async function initUser() {
    const tg      = window.Telegram?.WebApp?.initDataUnsafe?.user || {};
    const localId = getLocalUserId();
    const tgId    = tg.id ? Number(tg.id) : null;

    // Parse referral BEFORE the first write so the server can set
    // referred_by on INSERT and trigger the energy award to the referrer.
    const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param || "";
    let referrerTelegramId = null;
    if (startParam.startsWith("ref_")) {
      const rid = Number(startParam.slice(4));
      if (!isNaN(rid) && rid > 0 && rid !== tgId) {
        referrerTelegramId = rid;
        console.log("[SupaDB] referred by telegram_id:", rid);
      }
    }

    const result = await write("upsert_user", {
      userId:             localId,
      telegramId:         tgId,
      username:           tg.username   || null,
      display_name:       tg.first_name || null,
      referrerTelegramId,   // server computes referred_by UUID & awards energy
    });

    if (result?.user) {
      console.log("[SupaDB] user ready:", result.user.id, "telegram:", result.user.telegram_id);
      return result.user;
    }
    const devId = localStorage.getItem("ta_dev_uuid") || (() => {
      const id = "dev-" + Math.random().toString(36).slice(2, 10);
      localStorage.setItem("ta_dev_uuid", id);
      return id;
    })();
    console.warn("[SupaDB] write proxy failed — using local fallback.");
    return { id: devId, telegram_id: null, energy_balance: 20 };
  }

  // ── Load state (via proxy — uses service role for reads too) ───
  async function loadUserState(userId) {
    const result = await write("load_state", { userId });
    if (!result) return { predictions: {}, multiplier: 1, lifetimeDeposited: 0, depositCount: 0 };
    return {
      predictions:      result.predictions || {},
      multiplier:       result.multiplier  || 1,
      lifetimeDeposited:result.lifetimeDeposited || 0,
      depositCount:     result.depositCount || 0,
    };
  }

  // ── Write helpers (all proxied) ────────────────────────
  async function savePrediction(userId, matchExternalId, predictionValue, energyCost, confidence) {
    const r = await write("save_prediction", { userId, telegramId: getTelegramId(), matchId: matchExternalId, predictionValue, energyCost, confidence: confidence || 60 });
    if (!r) console.warn("[SupaDB] prediction NOT saved — check /api/write logs");
  }

  async function recordEnergy(userId, actionType, delta, balanceAfter, opts = {}) {
    await write("record_energy", { userId, telegramId: getTelegramId(), actionType, delta, balanceAfter, relatedUserId: opts.relatedUserId || null, notes: opts.notes || null });
  }

  async function saveDeposit(userId, depositNumber, amount, currency, multiplier) {
    await write("save_deposit", { userId, telegramId: getTelegramId(), depositNumber, amount, currency, multiplier });
  }

  async function saveTask(userId, taskType) {
    await write("save_task", { userId, telegramId: getTelegramId(), taskType });
  }

  async function saveWalletAddress(userId, address, walletName) {
    await write("save_wallet", { userId, telegramId: getTelegramId(), address, walletName });
  }

  function getTelegramId() {
    const tg = window.Telegram?.WebApp?.initDataUnsafe?.user;
    return tg?.id ? Number(tg.id) : null;
  }

  // ── Leaderboard (public SECURITY DEFINER RPC) ─────────
  async function loadLeaderboard(limit = 50) {
    const { data, error } = await db.rpc("get_leaderboard", { limit_count: limit });
    if (error) console.warn("[SupaDB] leaderboard:", error.message);
    return data || [];
  }

  async function getReferralCount(userId) {
    const result = await write("get_referral_count", { userId });
    return result?.count || 0;
  }

  window.SupaDB = {
    db,
    initUser, loadMatchUUIDs, matchUUID, loadUserState,
    savePrediction, recordEnergy, saveDeposit, saveTask,
    saveWalletAddress, loadLeaderboard, getReferralCount,
  };
})();
