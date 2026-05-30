// ─── MISSING FEATURES — WALLET / CHANNEL / INVITE / NOTIFICATIONS ─────

// ─── 1. TON WALLET CONNECT MODAL ──────────────────────────
// Mocks the TonConnect SDK flow: wallet picker → QR/deeplink → success.
// Address shown is deterministic so it survives reload via tweak replay.

const WalletConnectModal = ({ onClose, onConnected }) => {
  const [step, setStep]       = React.useState("idle"); // idle | connecting | success | error
  const [address, setAddress] = React.useState(null);
  const [walletName, setWalletName] = React.useState(null);
  const [errMsg, setErrMsg]   = React.useState(null);

  const startConnect = async () => {
    if (!window.ThrillTonConnect) {
      setErrMsg("TON Connect not loaded. Please refresh and try again.");
      setStep("error");
      return;
    }
    setStep("connecting");
    setErrMsg(null);
    try {
      const result = await window.ThrillTonConnect.connect();
      setAddress(result.address);
      setWalletName(result.walletName || "TON Wallet");
      setStep("success");
    } catch (e) {
      console.error("[TonConnect] error:", e);
      // User likely just closed the modal — go back to idle
      setStep("idle");
    }
  };

  const finish = () => {
    if (address) onConnected(walletName, address);
    onClose();
  };

  // Short display version of a TON address
  const shortAddr = (a) => a ? `${a.slice(0, 6)}…${a.slice(-6)}` : "";

  return (
    <div className="modal" onClick={step === "idle" ? onClose : undefined} data-screen-label="wallet-connect">
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: "90%" }}>
        <div className="modal-handle" />

        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TonConnectLogo size={28} />
            <div>
              <div className="eyebrow" style={{ color: "var(--teal)" }}>TON Connect</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>
                {step === "idle"       && "Connect wallet"}
                {step === "connecting" && "Waiting for approval…"}
                {step === "success"    && "Wallet connected ✓"}
                {step === "error"      && "Connection failed"}
              </div>
            </div>
          </div>
          {(step === "idle" || step === "error") && (
            <button className="btn" onClick={onClose} style={{
              width: 36, height: 36, borderRadius: 999, flexShrink: 0,
              background: "var(--card)", border: "1px solid var(--line-soft)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon name="x" size={18} color="var(--text-dim)" />
            </button>
          )}
        </div>

        {/* IDLE — explain + CTA */}
        {step === "idle" && (
          <>
            <div style={{
              padding: "12px 14px", marginBottom: 20,
              background: "rgba(93,237,165,0.06)", border: "1px dashed rgba(93,237,165,0.25)",
              borderRadius: 14, display: "flex", alignItems: "flex-start", gap: 10,
            }}>
              <TokenCoin size={22} />
              <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5 }}>
                Required for the <b style={{ color: "var(--teal)" }}>$20,000 USDT prize payout on Jul 19</b>.
                Winners are paid directly to their TON wallet.
              </div>
            </div>

            <button className="btn btn-primary" onClick={startConnect}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 15 }}>
              <TonConnectLogo size={22} />
              Connect with TON Connect
            </button>

            <div style={{ marginTop: 12, fontSize: 11, color: "var(--text-faint)", textAlign: "center", lineHeight: 1.5 }}>
              Supports Tonkeeper, MyTonWallet, Tonhub and all TON Connect wallets.
              <br/>Don't have one?{" "}
              <a href="https://tonkeeper.com" target="_blank" rel="noopener noreferrer"
                style={{ color: "var(--teal)", fontWeight: 700, textDecoration: "none" }}>
                Get Tonkeeper →
              </a>
            </div>
          </>
        )}

        {/* CONNECTING — waiting spinner */}
        {step === "connecting" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%", margin: "0 auto 20px",
              background: "rgba(0,152,234,0.15)", border: "1px solid rgba(0,152,234,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative",
            }}>
              <TonConnectLogo size={36} />
              {/* spinner ring */}
              <div style={{
                position: "absolute", inset: -4, borderRadius: "50%",
                border: "2px solid transparent",
                borderTopColor: "#0098EA",
                animation: "spin 1s linear infinite",
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6 }}>
              The TON Connect wallet picker has opened.
              <br/>Approve the connection in your wallet app.
            </div>
            <button className="btn" onClick={() => setStep("idle")} style={{
              marginTop: 20, color: "var(--text-faint)", fontSize: 12,
            }}>
              Cancel
            </button>
          </div>
        )}

        {/* SUCCESS */}
        {step === "success" && (
          <>
            <div style={{
              padding: "24px 20px", marginBottom: 16,
              background: "radial-gradient(80% 60% at 50% 0%, rgba(93,237,165,0.2), transparent 70%), linear-gradient(180deg, #1A2038, #131829)",
              border: "1px solid rgba(93,237,165,0.4)", borderRadius: 18, textAlign: "center",
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 999, margin: "0 auto 14px",
                background: "var(--teal)", color: "#0A0E1C",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name="check" size={36} stroke={3} />
              </div>
              <div className="h-md" style={{ marginBottom: 8 }}>Connected</div>
              <div className="num" style={{
                padding: "8px 14px", display: "inline-block",
                background: "rgba(0,0,0,0.3)", border: "1px solid var(--line-soft)",
                borderRadius: 10, fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-dim)",
              }}>
                {shortAddr(address)}
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-dim)" }}>
                via <b style={{ color: "var(--text)" }}>{walletName}</b>
              </div>
              <div style={{
                marginTop: 16, padding: "10px 14px",
                background: "rgba(255,159,28,0.12)", border: "1px solid rgba(255,159,28,0.3)",
                borderRadius: 12, display: "inline-flex", alignItems: "center", gap: 8,
              }}>
                <BoltIcon size={18} color="#FF9F1C" />
                <span style={{ fontFamily: "var(--display)", fontSize: 18, color: "var(--orange)" }}>+10 ENERGY</span>
              </div>
            </div>
            <button className="btn btn-primary" onClick={finish}>Continue</button>
          </>
        )}

        {/* ERROR */}
        {step === "error" && (
          <>
            <div style={{
              padding: "16px", marginBottom: 16, borderRadius: 14,
              background: "rgba(255,77,103,0.08)", border: "1px solid rgba(255,77,103,0.3)",
              fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5,
            }}>
              {errMsg || "Could not connect wallet. Please try again."}
            </div>
            <button className="btn btn-primary" onClick={() => setStep("idle")} style={{ width: "100%" }}>
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const TonGlyph = ({ size = 24, color = "#0098EA" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
    <path d="M5 6 L19 6 L12 20 Z M5 6 L12 12 L19 6" />
  </svg>
);

const TonConnectLogo = ({ size = 28 }) => (
  <div style={{
    width: size, height: size, borderRadius: 8,
    background: "linear-gradient(135deg, #0098EA, #0078C2)",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  }}>
    <TonGlyph size={size * 0.6} color="#fff" />
  </div>
);

// ─── 2. TELEGRAM CHANNEL VERIFY MODAL ────────────────────
const ChannelVerifyModal = ({ onClose, onVerified }) => {
  const [step, setStep] = React.useState("intro"); // intro → opened → checking → verified | failed
  const [opened, setOpened] = React.useState(false);

  const openChannel = () => {
    setOpened(true);
    setStep("opened");
  };

  const verify = () => {
    setStep("checking");
    setTimeout(() => {
      // First attempt always fails if user hasn't "opened" — but our flow forces opened first.
      // Realistic: 1.6s API delay.
      setStep("verified");
    }, 1600);
  };

  const finish = () => {
    onVerified();
    onClose();
  };

  return (
    <div className="modal" onClick={onClose} data-screen-label="channel-verify">
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "linear-gradient(135deg, #2AABEE, #229ED9)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Icon name="telegram" size={16} color="#fff" stroke={0} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="eyebrow" style={{ color: "#2AABEE" }}>Telegram</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>Join @thrill_arena</div>
            </div>
          </div>
          <button className="btn" onClick={onClose} style={{
            width: 36, height: 36, borderRadius: 999, flexShrink: 0,
            background: "var(--card)", border: "1px solid var(--line-soft)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="x" size={18} color="var(--text-dim)" />
          </button>
        </div>

        {/* Channel preview card */}
        <div style={{
          padding: "16px 16px",
          background: "var(--card)",
          border: "1px solid var(--line-soft)",
          borderRadius: 16,
          marginBottom: 14,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 999, flexShrink: 0,
            background: "linear-gradient(135deg, var(--teal), var(--teal-d))",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid rgba(93,237,165,0.4)",
          }}>
            <ThrillMark size={32} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
              Thrill Arena
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#2AABEE" style={{ flexShrink: 0 }}>
                <path d="M12 2L9 5 4 4l1 5-3 3 3 3-1 5 5-1 3 3 3-3 5 1-1-5 3-3-3-3 1-5-5 1z" />
                <path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>
              Official channel · <span className="num">142,830</span> subs
            </div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 6, lineHeight: 1.4 }}>
              Match reminders, airdrop news, weekly winners.
            </div>
          </div>
        </div>

        {/* Reward chip */}
        <div style={{
          display: "flex", justifyContent: "center", marginBottom: 16,
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "8px 14px",
            background: "rgba(255,159,28,0.12)",
            border: "1px solid rgba(255,159,28,0.3)",
            borderRadius: 999,
            whiteSpace: "nowrap",
          }}>
            <BoltIcon size={14} color="#FF9F1C" />
            <span style={{ fontFamily: "var(--display)", fontSize: 15, color: "var(--orange)" }}>+20</span>
            <span style={{ fontSize: 10, color: "var(--text-faint)", letterSpacing: "0.06em", textTransform: "uppercase" }}>energy on verify</span>
          </div>
        </div>

        {/* STEP: INTRO */}
        {step === "intro" && (
          <>
            <button className="btn" onClick={openChannel} style={{
              width: "100%", padding: "14px 16px",
              background: "linear-gradient(135deg, #2AABEE, #229ED9)", color: "#fff",
              borderRadius: 14, fontSize: 14, fontWeight: 700,
              letterSpacing: "0.04em",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              marginBottom: 8,
              boxShadow: "0 6px 16px rgba(42,171,238,0.4)",
            }}>
              <Icon name="telegram" size={16} color="#fff" />
              Open channel in Telegram
            </button>
            <button className="btn btn-ghost" onClick={onClose} style={{ width: "100%" }}>
              Not now
            </button>
          </>
        )}

        {/* STEP: OPENED — back from Telegram, ready to verify */}
        {step === "opened" && (
          <>
            <div style={{
              padding: "12px 14px", marginBottom: 12,
              background: "rgba(42,171,238,0.06)",
              border: "1px solid rgba(42,171,238,0.25)",
              borderRadius: 12,
              fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5,
              display: "flex", gap: 10, alignItems: "flex-start",
            }}>
              <Icon name="info" size={14} color="#2AABEE" />
              <div>Tap <b style={{ color: "var(--text)" }}>Join</b> in Telegram, then come back here to verify.</div>
            </div>

            <button className="btn btn-primary" onClick={verify} style={{ marginBottom: 8 }}>
              I've joined — verify
            </button>
            <button className="btn btn-ghost" onClick={() => setStep("intro")} style={{ width: "100%" }}>
              Open channel again
            </button>
          </>
        )}

        {/* STEP: CHECKING */}
        {step === "checking" && (
          <div style={{
            padding: "28px 20px",
            background: "var(--card)",
            border: "1px solid var(--line-soft)",
            borderRadius: 16,
            textAlign: "center",
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 999, margin: "0 auto 14px",
              border: "4px solid rgba(42,171,238,0.2)", borderTopColor: "#2AABEE",
              animation: "spin 0.9s linear infinite",
            }} />
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Checking membership…</div>
            <div style={{ fontSize: 12, color: "var(--text-faint)" }}>Asking Telegram Bot API</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* STEP: VERIFIED */}
        {step === "verified" && (
          <>
            <div style={{
              padding: "20px",
              background: `
                radial-gradient(80% 60% at 50% 0%, rgba(93,237,165,0.18), transparent 70%),
                var(--card)`,
              border: "1px solid rgba(93,237,165,0.4)",
              borderRadius: 16,
              marginBottom: 12,
              textAlign: "center",
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 999, margin: "0 auto 10px",
                background: "var(--teal)", color: "#0A0E1C",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name="check" size={28} stroke={3} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Membership verified</div>
              <div style={{ fontSize: 12, color: "var(--text-dim)" }}>You'll get match alerts on this channel</div>
            </div>
            <button className="btn btn-primary" onClick={finish}>
              Claim ⚡20
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ─── 3. INVITE / SHARE MODAL ─────────────────────────────
// Referral code derived from the real Telegram user ID at runtime.
// Falls back to a hash of the anonymous session ID in dev/browser mode.
function getReferralCode() {
  const tgId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  if (tgId) return `ref_${tgId}`;
  // Dev fallback — stable across reloads via localStorage
  let devCode = localStorage.getItem("ta_dev_ref");
  if (!devCode) {
    devCode = `ref_dev_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem("ta_dev_ref", devCode);
  }
  return devCode;
}

const InviteShareModal = ({ onClose, onSent }) => {
  const [copied, setCopied]   = React.useState(false);
  const [shared, setShared]   = React.useState(false);

  const refCode   = getReferralCode();
  const inviteUrl = `https://t.me/thrillarena_bot?start=${refCode}`;
  const shareText = encodeURIComponent("⚽ Join me on Thrill Arena — predict WC 2026 matches and win from a $20,000 USDT prize pool!");
  const shareUrl  = `https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${shareText}`;

  const copy = () => {
    try { navigator.clipboard?.writeText(inviteUrl); } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Opens Telegram's native contact/chat picker
  const shareViaTelegram = () => {
    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, "_blank");
    }
    // Award energy after share action — mark as shared
    setShared(true);
    setTimeout(() => { onSent(1); onClose(); }, 1200);
  };

  return (
    <div className="modal" onClick={onClose} data-screen-label="invite-share">
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ paddingBottom: 28 }}>
        <div className="modal-handle" />

        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 12 }}>
          <div>
            <div className="eyebrow" style={{ color: "var(--orange)", marginBottom: 8 }}>Bring friends</div>
            <div className="h-lg">Invite to Thrill Arena</div>
          </div>
          <button className="btn" onClick={onClose} style={{
            width: 36, height: 36, borderRadius: 999, flexShrink: 0,
            background: "var(--card)", border: "1px solid var(--line-soft)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="x" size={18} color="var(--text-dim)" />
          </button>
        </div>

        {/* Reward summary */}
        <div style={{
          padding: "14px 16px", marginBottom: 20,
          borderRadius: 14,
          background: "linear-gradient(135deg, rgba(255,159,28,0.12), rgba(255,159,28,0.04))",
          border: "1px solid rgba(255,159,28,0.3)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <BoltIcon size={28} color="var(--orange)" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>
                +<span className="num" style={{ color: "var(--orange)", fontFamily: "var(--display)" }}>30 ⚡</span> when your friend opens the app
              </div>
              <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                Energy is credited automatically — no action needed
              </div>
            </div>
          </div>
          {/* Pending counter */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 12px", borderRadius: 10,
            background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,159,28,0.2)",
            fontSize: 12, color: "var(--text-dim)",
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--orange)", animation: "boostPulse 1.4s ease-in-out infinite" }} />
            <span>
              <b className="num" style={{ color: "var(--orange)" }}>0</b> friends joined so far · energy credited instantly on their first open
            </span>
          </div>
        </div>

        {/* Primary CTA — native Telegram share sheet */}
        <button
          className="btn btn-primary"
          onClick={shareViaTelegram}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 10, marginBottom: 12, fontSize: 15,
          }}
        >
          {/* Telegram paper-plane icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/>
          </svg>
          Share via Telegram
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, height: 1, background: "var(--line-soft)" }} />
          <div style={{ fontSize: 11, color: "var(--text-faint)", letterSpacing: "0.06em" }}>OR COPY LINK</div>
          <div style={{ flex: 1, height: 1, background: "var(--line-soft)" }} />
        </div>

        {/* Referral link */}
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <div style={{
            flex: 1, minWidth: 0,
            padding: "12px 14px",
            background: "var(--card)",
            border: "1px solid var(--line-soft)",
            borderRadius: 12,
            fontFamily: "var(--mono)", fontSize: 11,
            color: "var(--text-dim)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            display: "flex", alignItems: "center",
          }}>
            {inviteUrl.replace("https://", "")}
          </div>
          <button className="btn" onClick={copy} style={{
            padding: "0 16px", flexShrink: 0,
            background: copied ? "var(--teal)" : "var(--card)",
            color: copied ? "#0A0E1C" : "var(--teal)",
            border: `1px solid ${copied ? "var(--teal)" : "rgba(93,237,165,0.4)"}`,
            borderRadius: 12, fontSize: 12, fontWeight: 700,
            letterSpacing: "0.06em", textTransform: "uppercase",
            display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
          }}>
            {copied ? <><Icon name="check" size={14} stroke={3} /> Copied!</> : "Copy"}
          </button>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-faint)", textAlign: "center" }}>
          Paste anywhere — WhatsApp, email, or any chat
        </div>
      </div>
    </div>
  );
};

// ─── 4. NOTIFICATIONS OPT-IN MODAL ───────────────────────
const NotifyOptInModal = ({ onClose, onEnable, prefs }) => {
  const [local, setLocal] = React.useState(prefs);

  const save = () => {
    onEnable(local);
    onClose();
  };

  return (
    <div className="modal" onClick={onClose} data-screen-label="notify-optin">
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div className="eyebrow" style={{ color: "#2AABEE" }}>Telegram notifications</div>
            <div className="h-lg" style={{ marginTop: 4 }}>Never miss a kickoff</div>
          </div>
          <button className="btn" onClick={onClose} style={{
            width: 36, height: 36, borderRadius: 999, flexShrink: 0,
            background: "var(--card)", border: "1px solid var(--line-soft)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="x" size={18} color="var(--text-dim)" />
          </button>
        </div>

        <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5, marginBottom: 16 }}>
          We'll DM you from <b style={{ color: "var(--text)" }}>@thrill_arena_bot</b>. You can turn each off any time.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          <NotifyToggleRow
            icon="bracket" color="var(--teal)"
            title="Match kickoff alerts"
            sub="1 hour before any match you've picked"
            value={local.kickoff}
            onChange={(v) => setLocal(p => ({ ...p, kickoff: v }))}
          />
          <NotifyToggleRow
            icon="check" color="var(--orange)"
            title="Final whistle results"
            sub="Did your pick win? Points instantly"
            value={local.results}
            onChange={(v) => setLocal(p => ({ ...p, results: v }))}
          />
          <NotifyToggleRow
            icon="bolt" color="#FFD60A"
            title="Daily energy ready"
            sub="When your spin & ad refresh"
            value={local.daily}
            onChange={(v) => setLocal(p => ({ ...p, daily: v }))}
          />
          <NotifyToggleRow
            icon="trophy" color="#A78BFA"
            title="Leaderboard movements"
            sub="When someone passes you"
            value={local.rank}
            onChange={(v) => setLocal(p => ({ ...p, rank: v }))}
          />
        </div>

        <button className="btn btn-primary" onClick={save}>
          Enable & continue
        </button>
        <button className="btn btn-ghost" onClick={onClose} style={{ width: "100%", marginTop: 8 }}>
          Maybe later
        </button>
      </div>
    </div>
  );
};

const NotifyToggleRow = ({ icon, color, title, sub, value, onChange }) => (
  <button className="btn" onClick={() => onChange(!value)} style={{
    display: "flex", alignItems: "center", gap: 12,
    padding: "12px 14px", textAlign: "left",
    background: "var(--card)", border: `1px solid ${value ? "rgba(93,237,165,0.3)" : "var(--line-soft)"}`,
    borderRadius: 14,
  }}>
    <div style={{
      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
      background: `${color}1A`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Icon name={icon} size={20} color={color} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{sub}</div>
    </div>
    {/* iOS-style switch */}
    <div style={{
      width: 40, height: 24, borderRadius: 999,
      background: value ? "var(--teal)" : "rgba(255,255,255,0.12)",
      position: "relative", transition: "background 0.2s",
      flexShrink: 0,
    }}>
      <div style={{
        position: "absolute", top: 2, left: value ? 18 : 2,
        width: 20, height: 20, borderRadius: 999,
        background: "#fff",
        transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
      }} />
    </div>
  </button>
);

// ─── 5. PUSH-STYLE NOTIFICATION TOAST ────────────────────
// Drops in from the top of the device frame like an iOS/Android push.
const NotificationToast = ({ notification, onDismiss, onTap }) => {
  React.useEffect(() => {
    const t = setTimeout(onDismiss, 5400);
    return () => clearTimeout(t);
  }, [notification, onDismiss]);

  if (!notification) return null;

  return (
    <div
      onClick={onTap}
      style={{
        position: "absolute", top: 10, left: 10, right: 10,
        zIndex: 500,
        padding: "10px 12px",
        background: "rgba(20, 24, 40, 0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        display: "flex", alignItems: "flex-start", gap: 10,
        boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
        animation: "toastIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
        cursor: "pointer",
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
        background: "linear-gradient(135deg, #2AABEE, #229ED9)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name="telegram" size={20} color="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {notification.title}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", flexShrink: 0 }}>now</div>
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 2, lineHeight: 1.35 }}>
          {notification.body}
        </div>
      </div>
      <style>{`
        @keyframes toastIn {
          from { transform: translateY(-120%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

Object.assign(window, {
  WalletConnectModal, ChannelVerifyModal, InviteShareModal,
  NotifyOptInModal, NotificationToast, MOCK_WALLET_ADDRESS,
});
