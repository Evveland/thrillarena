// POST /api/admin/broadcast  { message, userIds? }
// Sends a Telegram message to all users (or a subset) via the bot API.
const requireAdmin = require("./_auth");
const { createClient } = require("@supabase/supabase-js");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();
  if (!requireAdmin(req, res)) return;

  const { message, userIds } = req.body || {};
  if (!message) return res.status(400).json({ error: "message required" });

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  if (!BOT_TOKEN) return res.status(500).json({ error: "TELEGRAM_BOT_TOKEN not set" });

  const db = createClient(
    process.env.SUPABASE_URL || "https://zlslbgtuvjswkeeamxvb.supabase.co",
    process.env.SUPABASE_SERVICE_KEY,
    { auth: { persistSession: false } }
  );

  // Get telegram_ids to message
  let query = db.from("users").select("telegram_id").gt("telegram_id", 0);
  if (userIds?.length) query = query.in("id", userIds);
  const { data: users, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  let sent = 0, failed = 0;
  for (const u of users || []) {
    try {
      const r = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: u.telegram_id, text: message, parse_mode: "Markdown" }),
        }
      );
      if (r.ok) sent++; else failed++;
    } catch { failed++; }
  }

  return res.json({ sent, failed, total: (users || []).length });
};
