// ─── Supabase client + auth + CRUD helpers ────────────────
// Loaded before app.jsx. Exposes window.SupaDB.
(function () {
  const SUPABASE_URL = "https://zlslbgtuvjswkeeamxvb.supabase.co";
  const SUPABASE_KEY = "sb_publishable_xD8EAe55mT6H6lALeAJSCQ_dZzzrNni";

  const { createClient } = window.supabase;
  const db = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, storageKey: "ta-session" },
  });

  // ── Match UUID lookup (external_id → uuid) ───────────────
  // Populated on init from the matches table.
  const matchUUIDs = {};

  async function loadMatchUUIDs() {
    const { data } = await db.from("matches").select("id, external_id");
    if (data) data.forEach(m => { matchUUIDs[m.external_id] = m.id; });
  }

  function matchUUID(externalId) {
    return matchUUIDs[externalId] || null;
  }

  // ── Auth ─────────────────────────────────────────────────
  async function ensureSession() {
    const { data: { session } } = await db.auth.getSession();
    if (session) return session;
    const { data, error } = await db.auth.signInAnonymously();
    if (error) throw error;
    return data.session;
  }

  // ── User init ─────────────────────────────────────────────
  // Returns the user row from the `users` table.
  async function initUser() {
    await ensureSession();
    const { data: { user } } = await db.auth.getUser();
    const tg = window.Telegram?.WebApp?.initDataUnsafe?.user || {};
    // Fallback telegram_id for dev environments (negative = won't clash with real IDs)
    const telegramId = tg.id ? Number(tg.id) : -Math.abs(parseInt(user.id.replace(/-/g, "").slice(0, 8), 16));

    const { data, error } = await db
      .from("users")
      .upsert(
        {
          id: user.id,
          telegram_id: telegramId,
          username: tg.username || null,
          display_name: tg.first_name || null,
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (error) {
      // Return a minimal object so the app still boots
      console.warn("[SupaDB] user upsert error:", error.message);
      return { id: user.id, telegram_id: telegramId, energy_balance: 30 };
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

    // Build predictions map { externalMatchId: teamCode }
    const predsMap = {};
    if (predsRes.data) {
      // Reverse-look up external_id from uuid
      const uuidToExt = {};
      Object.entries(matchUUIDs).forEach(([ext, uuid]) => { uuidToExt[uuid] = ext; });
      predsRes.data.forEach(p => {
        const ext = uuidToExt[p.match_id];
        if (ext) predsMap[ext] = p.prediction_value;
      });
    }

    // Highest active multiplier
    const topBoost = boostsRes.data?.[0];

    // Lifetime deposited
    const lifetimeDeposited = (depositsRes.data || []).reduce((s, d) => s + Number(d.amount), 0);

    return {
      predictions: predsMap,
      multiplier: topBoost ? topBoost.multiplier : 1,
      lifetimeDeposited,
      depositCount: depositsRes.data?.length || 0,
    };
  }

  // ── Write prediction ──────────────────────────────────────
  async function savePrediction(userId, matchExternalId, predictionValue, energyCost) {
    const matchId = matchUUID(matchExternalId);
    if (!matchId) {
      console.warn("[SupaDB] no UUID for match:", matchExternalId);
      return;
    }
    await db.from("predictions").upsert(
      { user_id: userId, match_id: matchId, prediction_value: predictionValue, energy_cost: energyCost },
      { onConflict: "user_id,match_id" }
    );
  }

  // ── Write energy ledger + update balance ──────────────────
  async function recordEnergy(userId, actionType, delta, balanceAfter, opts = {}) {
    await Promise.all([
      db.from("energy_ledger").insert({
        user_id: userId,
        action_type: actionType,
        delta,
        balance_after: balanceAfter,
        related_user_id: opts.relatedUserId || null,
        notes: opts.notes || null,
      }),
      db.from("users").update({ energy_balance: balanceAfter }).eq("id", userId),
    ]);
  }

  // ── Write deposit + boost ─────────────────────────────────
  async function saveDeposit(userId, depositNumber, amount, currency, multiplier) {
    const trigger =
      depositNumber === 1 ? "first_deposit" :
      depositNumber === 2 ? "second_deposit" :
      depositNumber >= 3  ? "third_deposit"  : "first_deposit";

    await Promise.all([
      db.from("deposits").upsert(
        { user_id: userId, deposit_number: depositNumber, amount, currency },
        { onConflict: "user_id,deposit_number" }
      ),
      // Deactivate old boosts, then insert new
      db.from("user_boosts")
        .update({ is_active: false })
        .eq("user_id", userId)
        .then(() =>
          db.from("user_boosts").insert({
            user_id: userId,
            trigger,
            multiplier,
            is_active: true,
          })
        ),
    ]);
  }

  // ── Write Thrill task completion ──────────────────────────
  async function saveTask(userId, taskType) {
    await db.from("thrill_tasks").insert({
      user_id: userId,
      task_type: taskType,
      status: "completed",
      verified_at: new Date().toISOString(),
    });
  }

  // Expose globally
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
