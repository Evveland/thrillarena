// Vercel serverless function — /api/auth/telegram
// Receives Telegram initData, verifies the HMAC signature, and returns
// a Supabase-compatible JWT signed with SUPABASE_JWT_SECRET.
//
// Required env vars (set in Vercel project settings):
//   TELEGRAM_BOT_TOKEN   — from @BotFather
//   SUPABASE_JWT_SECRET  — from Supabase Dashboard → Project Settings → API → JWT Secret

const crypto = require("crypto");

// ── Helpers ───────────────────────────────────────────────

function base64url(buf) {
  return buf.toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function signJWT(payload, secret) {
  const header = base64url(Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const body   = base64url(Buffer.from(JSON.stringify(payload)));
  const sig    = crypto.createHmac("sha256", Buffer.from(secret, "utf8"))
    .update(`${header}.${body}`)
    .digest();
  return `${header}.${body}.${base64url(sig)}`;
}

// Derive a deterministic UUID (v4 format) from a Telegram user ID.
// Same telegram_id → same UUID on every device, forever.
function telegramIdToUUID(telegramId) {
  const hash = crypto
    .createHash("sha256")
    .update(`thrill-arena:${telegramId}`)
    .digest("hex");
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    "4" + hash.slice(13, 16),
    ((parseInt(hash[16], 16) & 3) | 8).toString(16) + hash.slice(17, 20),
    hash.slice(20, 32),
  ].join("-");
}

// Verify Telegram's HMAC-SHA256 initData signature.
function verifyTelegramInitData(initData, botToken) {
  const params = new URLSearchParams(initData);
  const hash   = params.get("hash");
  if (!hash) return false;

  params.delete("hash");
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const expectedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedHash, "hex"),
    Buffer.from(hash, "hex")
  );
}

// ── Handler ───────────────────────────────────────────────

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")    return res.status(405).json({ error: "Method not allowed" });

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

  if (!BOT_TOKEN || !JWT_SECRET) {
    console.error("[telegram-auth] Missing env vars");
    return res.status(500).json({ error: "Server misconfigured" });
  }

  const { initData } = req.body || {};
  if (!initData) {
    return res.status(400).json({ error: "initData required" });
  }

  // Verify the Telegram signature
  if (!verifyTelegramInitData(initData, BOT_TOKEN)) {
    return res.status(401).json({ error: "Invalid Telegram signature" });
  }

  // Parse user from initData
  const params = new URLSearchParams(initData);
  let tgUser;
  try {
    tgUser = JSON.parse(params.get("user") || "{}");
  } catch {
    return res.status(400).json({ error: "Could not parse user" });
  }

  if (!tgUser.id) {
    return res.status(400).json({ error: "No user id in initData" });
  }

  const telegramId = Number(tgUser.id);
  const userId     = telegramIdToUUID(telegramId);
  const now        = Math.floor(Date.now() / 1000);

  // Sign a Supabase JWT — auth.uid() in RLS returns `sub`
  const jwt = signJWT(
    {
      iss:          "supabase",
      sub:          userId,
      role:         "authenticated",
      aud:          "authenticated",
      iat:          now,
      exp:          now + 60 * 60 * 24 * 7, // 7 days
      telegram_id:  telegramId,
      username:     tgUser.username    || null,
      display_name: tgUser.first_name  || null,
    },
    JWT_SECRET
  );

  return res.status(200).json({
    jwt,
    userId,
    telegramId,
    username:    tgUser.username    || null,
    displayName: tgUser.first_name  || null,
  });
};
