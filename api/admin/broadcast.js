// POST /api/admin/broadcast  { message, userIds? }
const requireAdmin = require("./_auth");

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const SB_URL = "https://zlslbgtuvjswkeeamxvb.supabase.co";

module.exports = async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")    return res.status(405).end();
  if (!requireAdmin(req, res))  return;

  const { message, userIds } = req.body || {};
  if (!message) return res.status(400).json({ error: "message required" });

  const BOT_TOKEN   = process.env.TELEGRAM_BOT_TOKEN;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!BOT_TOKEN)   return res.status(500).json({ error: "TELEGRAM_BOT_TOKEN not set" });
  if (!SERVICE_KEY) return res.status(500).json({ error: "SUPABASE_SERVICE_KEY not set" });

  // Fetch telegram_ids
  let url = `${SB_URL}/rest/v1/users?telegram_id=gt.0&select=telegram_id`;
  if (userIds?.length) url += `&id=in.(${userIds.join(",")})`;
  const r = await fetch(url, {
    headers: { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}` },
  });
  const users = await r.json();

  let sent = 0, failed = 0;
  for (const u of users || []) {
    try {
      const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: u.telegram_id, text: message, parse_mode: "Markdown" }),
      });
      if (r.ok) sent++; else failed++;
    } catch { failed++; }
  }
  return res.json({ sent, failed, total: (users || []).length });
};
