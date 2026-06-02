// GET  /api/admin/data?section=kpis|users|raffles|predictions
// PATCH /api/admin/data?section=users   body: { id, ...fields }
// DELETE /api/admin/data?section=users&id=<uuid>
// Uses Supabase REST API directly (no SDK).
const requireAdmin = require("./_auth");

const CORS = {
  "Access-Control-Allow-Origin":  process.env.ADMIN_ORIGIN || "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const SB_URL = "https://zlslbgtuvjswkeeamxvb.supabase.co";

function sbHeaders(key) {
  return { "apikey": key, "Authorization": `Bearer ${key}`, "Content-Type": "application/json", "Prefer": "return=representation" };
}

async function sb(path, key, method = "GET", body = null) {
  const opts = { method, headers: sbHeaders(key) };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${SB_URL}${path}`, opts);
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
  catch { return { ok: res.ok, status: res.status, data: text }; }
}

async function rpc(fn, key, params = {}) {
  const res = await fetch(`${SB_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: sbHeaders(key),
    body: JSON.stringify(params),
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return null; }
}

module.exports = async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req, res)) return;

  const KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!KEY) return res.status(500).json({ error: "SUPABASE_SERVICE_KEY not set" });

  const { section, search = "", offset = "0", limit = "50", id } = req.query;

  try {
    // ── GET ────────────────────────────────────────────────
    if (req.method === "GET") {

      if (section === "kpis") {
        const data = await rpc("admin_kpis", KEY);
        return res.json(data || {});
      }

      if (section === "users") {
        const data = await rpc("admin_users", KEY, {
          p_search: search, p_offset: parseInt(offset), p_limit: parseInt(limit),
        });
        return res.json(data || { total: 0, rows: [] });
      }

      if (section === "raffles") {
        const data = await rpc("admin_raffles", KEY);
        return res.json(data || []);
      }

      if (section === "predictions") {
        const data = await rpc("admin_predictions", KEY);
        return res.json(data || {});
      }

      if (section === "fixtures") {
        const data = await rpc("admin_fixtures", KEY);
        return res.json(data || { matches: [], count: 0 });
      }

      return res.status(400).json({ error: "Unknown section" });
    }

    // ── PATCH (update user) ────────────────────────────────
    if (req.method === "PATCH" && section === "users") {
      const { id: uid, ...incoming } = req.body || {};
      if (!uid) return res.status(400).json({ error: "id required" });

      // Allowlist editable fields — prevents arbitrary column injection.
      const ALLOWED_FIELDS = ["display_name", "username", "is_flagged", "flagged_reason"];
      const fields = Object.fromEntries(
        Object.entries(incoming).filter(([k]) => ALLOWED_FIELDS.includes(k))
      );
      if (!Object.keys(fields).length) {
        return res.status(400).json({ error: "No valid fields to update" });
      }

      const r = await sb(`/rest/v1/users?id=eq.${uid}`, KEY, "PATCH", fields);
      if (!r.ok) return res.status(500).json({ error: "Update failed" });
      return res.json({ ok: true });
    }

    // ── DELETE (delete user + cascade) ────────────────────
    if (req.method === "DELETE" && section === "users") {
      if (!id) return res.status(400).json({ error: "id required" });
      // Delete in FK order
      for (const table of ["raffle_winners","ticket_ledger","energy_ledger","predictions","user_boosts","deposits","thrill_tasks"]) {
        await sb(`/rest/v1/${table}?user_id=eq.${id}`, KEY, "DELETE");
      }
      await sb(`/rest/v1/users?id=eq.${id}`, KEY, "DELETE");
      return res.json({ ok: true });
    }

    return res.status(405).end();
  } catch (e) {
    console.error("[admin/data]", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};
