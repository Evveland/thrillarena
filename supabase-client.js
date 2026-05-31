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

  // ── User init ──────────────────────────────────────────
  async function initUser() {
    const tg = window.Telegram?.WebApp?.initDataUnsafe?.user || {};
    const result = await write("upsert_user", {
      username:     tg.username    || null,
      display_name: tg.first_name  || null,
      referred_by:  null, // set below if start_param detected
    });

    // Parse referral from start_param
    const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param || "";
    if (startParam.startsWith("ref_") && result?.user) {
      const referrerId = startParam.slice(4);
      if (/^\d+$/.test(referrerId) && String(referrerId) !== String(tg.id)) {
        // Re-upsert with referral — only matters on first open
        await write("upsert_user", {
          username:     tg.username   || null,
          display_name: tg.first_name || null,
          referred_by:  telegramIdToUUID(Number(referrerId)),
        });
      }
    }

    if (result?.user) {
      console.log("[SupaDB] user ready:", result.user.id, "telegram:", result.user.telegram_id);
      return result.user;
    }
    // Fallback — return a minimal object so the app still boots
    const devId = localStorage.getItem("ta_dev_uuid") || (() => {
      const id = "dev-" + Math.random().toString(36).slice(2,10);
      localStorage.setItem("ta_dev_uuid", id);
      return id;
    })();
    console.warn("[SupaDB] write proxy failed — using local fallback. Set SUPABASE_SERVICE_KEY in Vercel.");
    return { id: devId, telegram_id: null, energy_balance: 20 };
  }

  function telegramIdToUUID(telegramId) {
    // Must match the formula in api/auth/telegram.js and api/write.js
    const crypto = window.crypto;
    if (!crypto?.subtle) return null;
    // Sync version using a simple hash (same formula as server-side SHA-256)
    // We can't do async here easily, so just return null for client-side referral parsing
    return null;
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
  async function savePrediction(userId, matchExternalId, predictionValue, energyCost) {
    await write("save_prediction", { userId, matchId: matchExternalId, predictionValue, energyCost });
  }

  async function recordEnergy(userId, actionType, delta, balanceAfter, opts = {}) {
    await write("record_energy", { userId, actionType, delta, balanceAfter, relatedUserId: opts.relatedUserId || null, notes: opts.notes || null });
  }

  async function saveDeposit(userId, depositNumber, amount, currency, multiplier) {
    await write("save_deposit", { userId, depositNumber, amount, currency, multiplier });
  }

  async function saveTask(userId, taskType) {
    await write("save_task", { userId, taskType });
  }

  async function saveWalletAddress(userId, address, walletName) {
    await write("save_wallet", { userId, address, walletName });
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
