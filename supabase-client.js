// ─── Supabase client + auth + CRUD helpers ──────────────
// Auth strategy (in order of preference):
//  1. Server-verified JWT via /api/auth/telegram (requires SUPABASE_JWT_SECRET in Vercel)
//  2. Supabase anonymous sign-in (requires "Allow anonymous sign-ins" in Supabase Dashboard)
//  3. Device-local UUID stored in localStorage (always works, no persistence across devices)
(function () {
  const SUPABASE_URL  = "https://zlslbgtuvjswkeeamxvb.supabase.co";
  const SUPABASE_ANON = "sb_publishable_xD8EAe55mT6H6lALeAJSCQ_dZzzrNni";
  const { createClient } = window.supabase;

  // persistSession: true so the anon session UUID survives page reloads
  let db = createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { persistSession: true, storageKey: "ta-session", autoRefreshToken: true },
  });

  function makeAuthClient(jwt) {
    return createClient(SUPABASE_URL, SUPABASE_ANON, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
      auth:   { persistSession: false, autoRefreshToken: false },
    });
  }

  // ── Match UUID lookup (public read — no auth needed) ──
  const matchUUIDs = {};

  async function loadMatchUUIDs() {
    const { data, error } = await db.from("matches").select("id, external_id");
    if (error) console.warn("[SupaDB] loadMatchUUIDs:", error.message);
    if (data)  data.forEach(m => { matchUUIDs[m.external_id] = m.id; });
    console.log("[SupaDB] loaded", Object.keys(matchUUIDs).length, "match UUIDs");
  }

  function matchUUID(externalId) { return matchUUIDs[externalId] || null; }

  // ── Auth flow ─────────────────────────────────────────
  async function authenticateWithTelegram() {
    const initData = window.Telegram?.WebApp?.initData;

    // ── Path 1: server-verified JWT ──────────────────────
    if (initData) {
      try {
        const res  = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData }),
        });
        if (res.ok) {
          const data = await res.json();
          db = makeAuthClient(data.jwt);
          if (window.SupaDB) window.SupaDB.db = db;
          console.log("[SupaDB] server JWT auth OK — telegram:", data.telegramId);
          return data;
        }
        const err = await res.json().catch(() => ({}));
        console.warn("[SupaDB] server auth failed:", err.error, "— falling back to anon");
      } catch (e) {
        console.warn("[SupaDB] /api/auth/telegram unreachable:", e.message, "— falling back");
      }
    }

    // ── Path 2: Supabase anonymous sign-in ───────────────
    try {
      // Reuse existing session from localStorage if valid
      const { data: existing } = await db.auth.getSession();
      if (existing?.session?.user) {
        const u = existing.session.user;
        const tg = window.Telegram?.WebApp?.initDataUnsafe?.user || {};
        console.log("[SupaDB] reusing anon session:", u.id);
        return {
          userId: u.id, telegramId: tg.id ? Number(tg.id) : null,
          username: tg.username || null, displayName: tg.first_name || null,
          referredBy: null,
        };
      }

      const { data: anon, error: anonErr } = await db.auth.signInAnonymously();
      if (!anonErr && anon?.user) {
        const tg = window.Telegram?.WebApp?.initDataUnsafe?.user || {};
        db = makeAuthClient(anon.session.access_token);
        if (window.SupaDB) window.SupaDB.db = db;
        console.log("[SupaDB] anonymous auth OK:", anon.user.id);
        return {
          userId: anon.user.id, telegramId: tg.id ? Number(tg.id) : null,
          username: tg.username || null, displayName: tg.first_name || null,
          referredBy: null,
        };
      }
      console.warn("[SupaDB] anon sign-in failed:", anonErr?.message);
    } catch (e) {
      console.warn("[SupaDB] anon auth error:", e.message);
    }

    // ── Path 3: device-local UUID (last resort) ───────────
    // No server, no Supabase auth — writes will be blocked by RLS.
    // User can still use the app UI; data won't persist until auth is fixed.
    let devId = localStorage.getItem("ta_dev_uuid");
    if (!devId) {
      devId = crypto.randomUUID?.() || "dev-" + Math.random().toString(36).slice(2);
      localStorage.setItem("ta_dev_uuid", devId);
    }
    const tg = window.Telegram?.WebApp?.initDataUnsafe?.user || {};
    console.warn("[SupaDB] using local UUID — writes will NOT persist (fix auth config)");
    return {
      userId: devId, telegramId: tg.id ? Number(tg.id) : null,
      username: tg.username || null, displayName: tg.first_name || null,
      referredBy: null,
    };
  }

  // ── User init ─────────────────────────────────────────
  async function initUser() {
    const auth = await authenticateWithTelegram();
    const telegramId = auth.telegramId
      ?? -(Math.abs(parseInt((auth.userId || "0").replace(/-/g,"").slice(0,8), 16)));

    // Try INSERT (new user). On conflict by id → UPDATE name fields only.
    const { data: inserted, error: insertErr } = await db
      .from("users")
      .insert({
        id:           auth.userId,
        telegram_id:  telegramId,
        username:     auth.username    ?? null,
        display_name: auth.displayName ?? null,
        referred_by:  auth.referredBy  ?? null,
      })
      .select().single();

    if (!insertErr) {
      console.log("[SupaDB] new user created:", auth.userId);
      return inserted;
    }

    // Conflict — user already exists, update display name
    if (insertErr.code === "23505" || insertErr.code === "42501" ||
        insertErr.message?.includes("duplicate") || insertErr.message?.includes("violates")) {
      const { data, error } = await db
        .from("users")
        .update({ username: auth.username ?? null, display_name: auth.displayName ?? null })
        .eq("id", auth.userId)
        .select().single();
      if (!error) { console.log("[SupaDB] returning user updated"); return data; }
      console.warn("[SupaDB] user update error:", error.message);
    } else {
      console.warn("[SupaDB] user insert error:", insertErr.message, "code:", insertErr.code);
    }

    return { id: auth.userId, telegram_id: telegramId, energy_balance: 20 };
  }

  // ── Load user state ───────────────────────────────────
  async function loadUserState(userId) {
    const [predsRes, boostsRes, depositsRes] = await Promise.all([
      db.from("predictions").select("match_id,prediction_value,result_status,is_correct").eq("user_id", userId),
      db.from("user_boosts").select("trigger,multiplier").eq("user_id", userId).eq("is_active", true).order("multiplier", { ascending: false }).limit(1),
      db.from("deposits").select("deposit_number,amount,currency").eq("user_id", userId).order("deposit_number", { ascending: true }),
    ]);

    if (predsRes.error)    console.warn("[SupaDB] predictions:", predsRes.error.message);
    if (boostsRes.error)   console.warn("[SupaDB] boosts:",      boostsRes.error.message);
    if (depositsRes.error) console.warn("[SupaDB] deposits:",    depositsRes.error.message);

    const uuidToExt = Object.fromEntries(Object.entries(matchUUIDs).map(([e, id]) => [id, e]));
    const predsMap  = {};
    (predsRes.data || []).forEach(p => { const e = uuidToExt[p.match_id]; if (e) predsMap[e] = p.prediction_value; });

    const topBoost = boostsRes.data?.[0];
    const lifetimeDeposited = (depositsRes.data || []).reduce((s, d) => s + Number(d.amount), 0);
    return { predictions: predsMap, multiplier: topBoost?.multiplier ?? 1, lifetimeDeposited, depositCount: depositsRes.data?.length ?? 0 };
  }

  // ── Write helpers ─────────────────────────────────────
  async function savePrediction(userId, matchExternalId, predictionValue, energyCost) {
    const matchId = matchUUID(matchExternalId);
    if (!matchId) { console.warn("[SupaDB] unknown match:", matchExternalId); return; }
    const { error } = await db.from("predictions").upsert(
      { user_id: userId, match_id: matchId, prediction_value: predictionValue, energy_cost: energyCost },
      { onConflict: "user_id,match_id" }
    );
    if (error) console.warn("[SupaDB] savePrediction:", error.message);
    else console.log("[SupaDB] prediction saved:", matchExternalId, predictionValue);
  }

  async function recordEnergy(userId, actionType, delta, balanceAfter, opts = {}) {
    const [l, u] = await Promise.all([
      db.from("energy_ledger").insert({ user_id: userId, action_type: actionType, delta, balance_after: balanceAfter, related_user_id: opts.relatedUserId ?? null, notes: opts.notes ?? null }),
      db.from("users").update({ energy_balance: balanceAfter }).eq("id", userId),
    ]);
    if (l.error) console.warn("[SupaDB] energy_ledger:", l.error.message);
    if (u.error) console.warn("[SupaDB] energy update:", u.error.message);
  }

  async function saveDeposit(userId, depositNumber, amount, currency, multiplier) {
    const trigger = depositNumber === 1 ? "first_deposit" : depositNumber === 2 ? "second_deposit" : "third_deposit";
    await db.from("deposits").upsert({ user_id: userId, deposit_number: depositNumber, amount, currency }, { onConflict: "user_id,deposit_number" });
    await db.from("user_boosts").update({ is_active: false }).eq("user_id", userId);
    const { error } = await db.from("user_boosts").insert({ user_id: userId, trigger, multiplier, is_active: true });
    if (error) console.warn("[SupaDB] saveBoost:", error.message);
  }

  async function saveTask(userId, taskType) {
    const { error } = await db.from("thrill_tasks").insert({ user_id: userId, task_type: taskType, status: "completed", verified_at: new Date().toISOString() });
    if (error) console.warn("[SupaDB] saveTask:", error.message);
  }

  async function saveWalletAddress(userId, address, walletName) {
    const { error } = await db.from("users").update({ wallet_address: address, wallet_name: walletName ?? null }).eq("id", userId);
    if (error) console.warn("[SupaDB] saveWallet:", error.message);
  }

  async function loadLeaderboard(limit = 50) {
    const { data, error } = await db.rpc("get_leaderboard", { limit_count: limit });
    if (error) console.warn("[SupaDB] leaderboard:", error.message);
    return data || [];
  }

  async function getReferralCount(userId) {
    const { data, error } = await db.rpc("get_referral_count", { p_user_id: userId });
    if (error) console.warn("[SupaDB] referral count:", error.message);
    return Number(data?.[0]?.referral_count ?? 0);
  }

  window.SupaDB = {
    get db() { return db; },
    initUser, loadMatchUUIDs, matchUUID, loadUserState,
    savePrediction, recordEnergy, saveDeposit, saveTask,
    saveWalletAddress, loadLeaderboard, getReferralCount,
  };
})();
