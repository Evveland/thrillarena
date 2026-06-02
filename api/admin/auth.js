// POST /api/admin/auth  { password }  → 200 { token } or 401
// Issues a time-limited signed JWT — never returns the raw ADMIN_SECRET.
const crypto = require("crypto");

const CORS = {
  "Access-Control-Allow-Origin":  process.env.ADMIN_ORIGIN || "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const TOKEN_TTL_SEC = 8 * 3600; // 8-hour session

// Minimal HS256 JWT (no external dependency)
function signJWT(payload, secret) {
  const header  = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body    = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig     = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

module.exports = function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const secret = process.env.ADMIN_SECRET;
  if (!secret) return res.status(500).json({ error: "ADMIN_SECRET not set" });

  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: "password required" });

  // Timing-safe comparison
  const secretBuf   = Buffer.from(secret);
  const passwordBuf = Buffer.from(password);
  const match =
    secretBuf.length === passwordBuf.length &&
    crypto.timingSafeEqual(secretBuf, passwordBuf);

  if (!match) return res.status(401).json({ error: "Wrong password" });

  const now   = Math.floor(Date.now() / 1000);
  const token = signJWT({ iat: now, exp: now + TOKEN_TTL_SEC, sub: "admin" }, secret);
  return res.status(200).json({ token, expiresAt: (now + TOKEN_TTL_SEC) * 1000 });
};
