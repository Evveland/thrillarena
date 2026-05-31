// Shared auth helper — checks Authorization header against ADMIN_SECRET env var
module.exports = function requireAdmin(req, res) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) { res.status(500).json({ error: "ADMIN_SECRET not configured" }); return false; }
  const auth = req.headers["authorization"] || "";
  if (auth !== `Bearer ${secret}`) { res.status(401).json({ error: "Unauthorized" }); return false; }
  return true;
};
