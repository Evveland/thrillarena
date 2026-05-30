// ─── Supabase client + Telegram auth + CRUD helpers ──────
// Exposes window.SupaDB. Auth flow:
//   1. POST initData to /api/auth/telegram (HMAC verified server-side)
//   2. Receive deterministic JWT signed with SUPABASE_JWT_SECRET
//   3. Recreate Supabase client with JWT in Authorization header
//      → auth.uid() in RLS = deterministic UUID from telegram_id
(function () {
  const SUPABASE_URL = "https://zlslbgtuvjswkeeamxvb.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_xD8EAe55mT6H6lALeAJSCQ_dZzzrNni";
  const { createClient } = window.supabase;

  // ── Client — starts anonymous, replaced after auth ───────
  // Using `let` so we can swap to an authenticated client after login.
  // All CRUD helpers close over `db` and will automatically use the
  // authenticated version once `authenticateWithTelegram` runs.
  let db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  function makeAuthenticatedClient(jwt) {
    // Do NOT use supabase.auth.setSession() — in Supabase JS v2 that
    // method makes a network call to validate the refresh_token, which
    // fails for custom JWTs. Instead, bake the JWT directly into the
    // Authorization header. Supabase verifies it against the JWT secret
    // server-side, so auth.uid() and RLS policies work correctly.
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
      auth:   { persistSession: false, autoRefreshToken: false },
    });
  }

  // ── Match UUID lookup ─────────────────────────────────────
  // Matches are publicly readable — no auth needed.
  const matchUUIDs = {};

  async function loadMatchUUIDs() {
    const { data, error } = await db.from("matches").select("id, external_id");
    if (error) console.warn("[SupaDB] loadMatchUUIDs error:", error.message);
    if (data)  data.forEach(m => { matchUUIDs[m.external_id] = m.id; });
  }

  function matchUUID(externalId) {
    return matchUUIDs[externalId] || null;
  }

  // ── Auth ─────────────────────────────────────────────────
  async function authenticateWithTelegram() {
    const initData = window.Telegram?.WebApp?.initData;

    // ── Production: verify initData with server ───────────
    if (initData) {
      let res, data;
      try {
        res  = await fetch("/api/auth/telegram", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ initData }),
        });
        data = await res.json();
      } catch (e) {
        console.error("[SupaDB] fetch /api/auth/telegram failed:", e);
        throw e;
      }

      if (!res.ok) {
        console.error("[SupaDB] auth error:", data?.error, "status:", res.status);
        throw new Error(data?.error || `Auth failed ${res.status}`);
      }

      // Swap to authenticated client — all subsequent calls carry the JWT
      db = makeAuthenticatedClient(data.jwt);
      if (window.SupaDB) window.SupaDB.db = db;

      console.log("[SupaDB] authenticated as telegram user", data.telegramId, "→ uuid", data.userId);
      return data;
    }

    // ── Dev fallback: anonymous auth ──────────────────────
    console.warn("[SupaDB] No Telegram initData — anonymous auth (dev mode)");
    const { data: existing } = await db.auth.getSession();
    if (existing?.session) {
      return { userId: existing.session.user.id, telegramId: null, username: null, displayName: "Dev User" };
    }
    const { data: anon, error: anonErr } = await db.auth.signInAnonymously();
    if (anonErr) throw anonErr;
    db = makeAuthenticatedClient(anon.session.access_token);
    if (window.SupaDB) window.SupaDB.db = db;
    return { userId: anon.user.id, telegramId: null, username: null, displayName: "Dev User" };
  }

  // ── User init ─────────────────────────────────────────────
  // First-time users: INSERT with referred_by (triggers referral energy).
  // Returning users: UPDATE only name fields — never overwrite referred_by.
  async function initUser() {
    const auth = await authenticateWithTelegram();
    const telegramId = auth.telegramId
      ?? -(Math.abs(parseInt(auth.userId.replace(/-/g, "").slice(0, 8), 16)));

    // Try INSERT first (new user)
    const { data: inserted, error: insertErr } = await db
      .from("users")
      .insert({
        id:           auth.userId,
        telegram_id:  telegramId,
        username:     auth.username    ?? null,
        display_name: auth.displayName ?? null,
        referred_by:  auth.referredBy  ?? null,  // triggers energy award on referrer
      })
      .select()
      .single();

    if (!insertErr) {
      console.log("[SupaDB] new user created, referredBy:", auth.referredBy);
      return inserted;
    }

    // User already exists → update name fields only
    const { data, error } = await db
      .from("users")
      .update({ username: auth.username ?? null, display_name: auth.displayName ?? null })
      .eq("id", auth.userId)
      .select()
      .single();

    if (error) {
      console.warn("[SupaDB] user update error:", error.message);
      return { id: auth.userId, telegram_id: telegramId, energy_balance: 20 };
    }
    return data;
  }

  // ── Referral count ────────────────────────────────────────
  async function getReferralCount(userId) {
    const { data, error } = await db.rpc("get_referral_count", { p_user_id: userId });
    if (error) console.warn("[SupaDB] referral count:", error.message);
    return Number(data?.[0]?.referral_count ?? 0);
  }

  // ── Load user state ───────────────────────────────────────
  async function loadUserState(userId) {
    const [predsRes, boostsRes, depositsRes] = await Promise.all([
      db.from("predictions")
        .select("match_id, prediction_value, result_status, is_correct")
        .eq("user_id", userId),
      db.from("user_boosts")
        .select("trigger, multiplier")
        .eq("user_id", userId).eq("is_active", true)
        .order("multiplier", { ascending: false }).limit(1),
      db.from("deposits")
        .select("deposit_number, amount, currency")
        .eq("user_id", userId)
        .order("deposit_number", { ascending: true }),
    ]);

    if (predsRes.error)   console.warn("[SupaDB] predictions load:", predsRes.error.message);
    if (boostsRes.error)  console.warn("[SupaDB] boosts load:",      boostsRes.error.message);
    if (depositsRes.error)console.warn("[SupaDB] deposits load:",    depositsRes.error.message);

    const uuidToExt = Object.fromEntries(Object.entries(matchUUIDs).map(([ext, id]) => [id, ext]));
    const predsMap  = {};
    (predsRes.data || []).forEach(p => {
      const ext = uuidToExt[p.match_id];
      if (ext) predsMap[ext] = p.prediction_value;
    });

    const topBoost          = boostsRes.data?.[0];
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
    if (!matchId) { console.warn("[SupaDB] unknown match:", matchExternalId); return; }
    const { error } = await db.from("predictions").upsert(
      { user_id: userId, match_id: matchId, prediction_value: predictionValue, energy_cost: energyCost },
      { onConflict: "user_id,match_id" }
    );
    if (error) console.warn("[SupaDB] savePrediction error:", error.message);
  }

  // ── Write energy ledger + update balance ──────────────────
  async function recordEnergy(userId, actionType, delta, balanceAfter, opts = {}) {
    const [ledgerRes, userRes] = await Promise.all([
      db.from("energy_ledger").insert({
        user_id: userId, action_type: actionType,
        delta, balance_after: balanceAfter,
        related_user_id: opts.relatedUserId ?? null,
        notes:           opts.notes         ?? null,
      }),
      db.from("users").update({ energy_balance: balanceAfter }).eq("id", userId),
    ]);
    if (ledgerRes.error) console.warn("[SupaDB] energy_ledger:", ledgerRes.error.message);
    if (userRes.error)   console.warn("[SupaDB] energy update:", userRes.error.message);
  }

  // ── Write deposit + boost ─────────────────────────────────
  async function saveDeposit(userId, depositNumber, amount, currency, multiplier) {
    const trigger = depositNumber === 1 ? "first_deposit"
                  : depositNumber === 2 ? "second_deposit"
                  :                       "third_deposit";
    await db.from("deposits").upsert(
      { user_id: userId, deposit_number: depositNumber, amount, currency },
      { onConflict: "user_id,deposit_number" }
    );
    await db.from("user_boosts").update({ is_active: false }).eq("user_id", userId);
    const { error } = await db.from("user_boosts").insert({
      user_id: userId, trigger, multiplier, is_active: true,
    });
    if (error) console.warn("[SupaDB] saveBoost:", error.message);
  }

  // ── Save wallet address ───────────────────────────────────
  async function saveWalletAddress(userId, address, walletName) {
    const { error } = await db.from("users").update({
      wallet_address: address,
      wallet_name:    walletName ?? null,
    }).eq("id", userId);
    if (error) console.warn("[SupaDB] saveWalletAddress:", error.message);
  }

  // ── Write Thrill task ─────────────────────────────────────
  async function saveTask(userId, taskType) {
    const { error } = await db.from("thrill_tasks").insert({
      user_id: userId, task_type: taskType,
      status: "completed", verified_at: new Date().toISOString(),
    });
    if (error) console.warn("[SupaDB] saveTask:", error.message);
  }

  // ── Leaderboard ───────────────────────────────────────────
  async function loadLeaderboard(limit = 50) {
    const { data, error } = await db.rpc("get_leaderboard", { limit_count: limit });
    if (error) console.warn("[SupaDB] leaderboard:", error.message);
    return data || [];
  }

  window.SupaDB = {
    get db() { return db; },
    initUser,
    loadMatchUUIDs,
    matchUUID,
    loadUserState,
    savePrediction,
    recordEnergy,
    saveDeposit,
    saveTask,
    loadLeaderboard,
    getReferralCount,
    saveWalletAddress,
  };
})();
