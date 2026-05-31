// POST /api/admin/auth  { password }  → 200 or 401
module.exports = function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const secret = process.env.ADMIN_SECRET;
  if (!secret) return res.status(500).json({ error: "ADMIN_SECRET not set" });
  const { password } = req.body || {};
  if (password === secret) return res.status(200).json({ token: secret });
  return res.status(401).json({ error: "Wrong password" });
};
