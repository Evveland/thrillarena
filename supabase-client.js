// ─── Supabase client + Telegram auth + CRUD helpers ──────
// Loaded before app.jsx. Exposes window.SupaDB.
(function () {
  const SUPABASE_URL = "https://zlslbgtuvjswkeeamxvb.supabase.co";
  const SUPABASE_KEY = "sb_publishable_xD8EAe55mT6H6lALeAJSCQ_dZzzrNni";

  const { createClient } = window.supabase;
  const db = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, storageKey: "ta-session", autoRefreshToken: false },
  });

  // ── Match UUID lookup ─────────────────────────────────────
  const matchUUIDs = {};

  async function loadMatchUUIDs() {
    const { data } = await db.from("matches").select("id, external_id");
    if (data) data.forEach(m => { matchUUIDs[m.external_id] = m.id; });
  }

  function matchUUID(externalId) {
    return matchUUIDs[externalId] || null;
  }

  // ── Auth ─────────────────────────────────────────────────
  // Returns { userId, telegramId, username, displayName, jwt }
  async function authenticateWithTelegram() {
    const initData = window.Telegram?.WebApp?.initData;

    // ── Production path: verify with server ──────────────
    if (initData) {
      const res = await fetch("/api/auth/telegram", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ initData }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`Telegram auth failed: ${err.error || res.status}`);
      }

      const data = await res.json();
      // Set the verified JWT as the Supabase session
      await db.auth.setSession({ access_token: data.jwt, refresh_token: data.jwt });
      return data;
    }

    // ── Dev / browser fallback: anonymous auth ────────────
    console.warn("[SupaDB] No Telegram initData — using anonymous auth (dev mode)");
    const { data: { session }, error } = await db.auth.getSession();
    if (session) {
      return {
        userId:      session.user.id,
        telegramId:  null,
        username:    null,
        displayName: "Dev User",
      };
    }
    const { data: anonData, error: anonErr } = await db.auth.signInAnonymously();
    if (anonErr) throw anonErr;
    return {
      userId:      anonData.user.id,
      telegramId:  null,
      username:    null,
      displayName: "Dev User",
    };
  }

  // ── User init ─────────────────────────────────────────────
  // Authenticates, then upserts the user row keyed by the
  // deterministic UUID. Returns the full user row.
  async function initUser() {
    const auth = await authenticateWithTelegram();

    const { data, error } = await db
      .from("users")
      .upsert(
        {
          id:           auth.userId,
          telegram_id:  auth.telegramId || -(Math.abs(parseInt(auth.userId.replace(/-/g,"").slice(0,8),16))),
          username:     auth.username    || null,
          display_name: auth.displayName || null,
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (error) {
      console.warn("[SupaDB] user upsert error:", error.message);
      return { id: auth.userId, telegram_id: auth.telegramId, energy_balance: 5 };
    }
    return data;
  }

  // ── Load user state ───────────────────────────────────────
  async function loadUserState(userId) {
    const [predsRes, boostsRes, depositsRes] = await Promise.all([
      db.from("predictions")
        .select("match_id, prediction_value, result_status, is_correct")
        .eq("user_id", userId),
      db.from("user_boosts")
        .select("trigger, multiplier")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("multiplier", { ascending: false })
        .limit(1),
      db.from("deposits")
        .select("deposit_number, amount, currency")
        .eq("user_id", userId)
        .order("deposit_number", { ascending: true }),
    ]);

    const predsMap = {};
    if (predsRes.data) {
      const uuidToExt = {};
      Object.entries(matchUUIDs).forEach(([ext, uuid]) => { uuidToExt[uuid] = ext; });
      predsRes.data.forEach(p => {
        const ext = uuidToExt[p.match_id];
        if (ext) predsMap[ext] = p.prediction_value;
      });
    }

    const topBoost         = boostsRes.data?.[0];
    const lifetimeDeposited = (depositsRes.data || []).reduce((s, d) => s + Number(d.amount), 0);

    return {
      predictions:      predsMap,
      multiplier:       topBoost ? topBoost.multiplier : 1,
      lifetimeDeposited,
      depositCount:     depositsRes.data?.length || 0,
    };
  }

  // ── Write prediction ──────────────────────────────────────
  async function savePrediction(userId, matchExternalId, predictionValue, energyCost) {
    const matchId = matchUUID(matchExternalId);
    if (!matchId) { console.warn("[SupaDB] no UUID for match:", matchExternalId); return; }
    await db.from("predictions").upsert(
      { user_id: userId, match_id: matchId, prediction_value: predictionValue, energy_cost: energyCost },
      { onConflict: "user_id,match_id" }
    );
  }

  // ── Write energy ledger + update balance ──────────────────
  async function recordEnergy(userId, actionType, delta, balanceAfter, opts = {}) {
    await Promise.all([
      db.from("energy_ledger").insert({
        user_id:              userId,
        action_type:          actionType,
        delta,
        balance_after:        balanceAfter,
        related_user_id:      opts.relatedUserId      || null,
        notes:                opts.notes              || null,
      }),
      db.from("users").update({ energy_balance: balanceAfter }).eq("id", userId),
    ]);
  }

  // ── Write deposit + boost ─────────────────────────────────
  async function saveDeposit(userId, depositNumber, amount, currency, multiplier) {
    const trigger =
      depositNumber === 1 ? "first_deposit"  :
      depositNumber === 2 ? "second_deposit" :
                            "third_deposit";
    await Promise.all([
      db.from("deposits").upsert(
        { user_id: userId, deposit_number: depositNumber, amount, currency },
        { onConflict: "user_id,deposit_number" }
      ),
      db.from("user_boosts")
        .update({ is_active: false })
        .eq("user_id", userId)
        .then(() =>
          db.from("user_boosts").insert({
            user_id:    userId,
            trigger,
            multiplier,
            is_active:  true,
          })
        ),
    ]);
  }

  // ── Write Thrill task ─────────────────────────────────────
  async function saveTask(userId, taskType) {
    await db.from("thrill_tasks").insert({
      user_id:     userId,
      task_type:   taskType,
      status:      "completed",
      verified_at: new Date().toISOString(),
    });
  }

  window.SupaDB = {
    db,
    initUser,
    loadMatchUUIDs,
    matchUUID,
    loadUserState,
    savePrediction,
    recordEnergy,
    saveDeposit,
    saveTask,
  };
})();
