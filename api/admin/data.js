// GET /api/admin/data?section=kpis|users|raffles|predictions
// Proxies to Supabase SECURITY DEFINER functions using the service role key.
const requireAdmin = require("./_auth");
const { createClient } = require("@supabase/supabase-js");

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

module.exports = async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req, res)) return;

  const db = createClient(
    process.env.SUPABASE_URL      || "https://zlslbgtuvjswkeeamxvb.supabase.co",
    process.env.SUPABASE_SERVICE_KEY,
    { auth: { persistSession: false } }
  );

  const { section, search = "", offset = "0", limit = "50" } = req.query;

  try {
    if (req.method === "GET") {
      if (section === "kpis") {
        const { data, error } = await db.rpc("admin_kpis");
        if (error) throw error;
        return res.json(data);
      }
      if (section === "users") {
        const { data, error } = await db.rpc("admin_users", {
          p_search: search, p_offset: parseInt(offset), p_limit: parseInt(limit),
        });
        if (error) throw error;
        return res.json(data);
      }
      if (section === "raffles") {
        const { data, error } = await db.rpc("admin_raffles");
        if (error) throw error;
        return res.json(data || []);
      }
      if (section === "predictions") {
        const { data, error } = await db.rpc("admin_predictions");
        if (error) throw error;
        return res.json(data);
      }
      return res.status(400).json({ error: "Unknown section" });
    }

    // PATCH /api/admin/data?section=users  { id, ...fields }
    if (req.method === "PATCH" && section === "users") {
      const { id, ...fields } = req.body || {};
      if (!id) return res.status(400).json({ error: "id required" });
      const { error } = await db.from("users").update(fields).eq("id", id);
      if (error) throw error;
      return res.json({ ok: true });
    }

    // DELETE /api/admin/data?section=users&id=<uuid>
    if (req.method === "DELETE" && section === "users") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "id required" });
      await db.from("raffle_winners").delete().eq("user_id", id);
      await db.from("ticket_ledger").delete().eq("user_id", id);
      await db.from("energy_ledger").delete().eq("user_id", id);
      await db.from("predictions").delete().eq("user_id", id);
      await db.from("user_boosts").delete().eq("user_id", id);
      await db.from("deposits").delete().eq("user_id", id);
      await db.from("thrill_tasks").delete().eq("user_id", id);
      await db.from("users").delete().eq("id", id);
      return res.json({ ok: true });
    }

    return res.status(405).end();
  } catch (e) {
    console.error("[admin/data]", e);
    return res.status(500).json({ error: e.message });
  }
};
