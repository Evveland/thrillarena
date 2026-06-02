// Shared auth helper — verifies a signed JWT issued by /api/admin/auth
const crypto = require("crypto");

function base64urlDecode(str) {
  return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

module.exports = function requireAdmin(req, res) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) { res.status(500).json({ error: "ADMIN_SECRET not configured" }); return false; }

  const auth = (req.headers["authorization"] || "").trim();
  if (!auth.startsWith("Bearer ")) { res.status(401).json({ error: "Unauthorized" }); return false; }

  const token = auth.slice(7);
  const parts = token.split(".");
  if (parts.length !== 3) { res.status(401).json({ error: "Unauthorized" }); return false; }

  const [header, body, sig] = parts;

  // Verify signature (timing-safe)
  const expected = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  const sigBuf  = base64urlDecode(sig);
  const expBuf  = Buffer.from(expected, "base64url");
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    res.status(401).json({ error: "Unauthorized" }); return false;
  }

  // Verify expiry
  let payload;
  try { payload = JSON.parse(base64urlDecode(body).toString()); }
  catch { res.status(401).json({ error: "Unauthorized" }); return false; }

  if (!payload.exp || Math.floor(Date.now() / 1000) > payload.exp) {
    res.status(401).json({ error: "Token expired" }); return false;
  }

  return true;
};
