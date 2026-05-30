// ─── MISSING FEATURES — WALLET / CHANNEL / INVITE / NOTIFICATIONS ─────

// ─── 1. TON WALLET CONNECT MODAL ──────────────────────────
// Mocks the TonConnect SDK flow: wallet picker → QR/deeplink → success.
// Address shown is deterministic so it survives reload via tweak replay.

const TON_WALLETS = [
  { id: "tonkeeper",  name: "Tonkeeper",     tag: "Most popular", color: "#0098EA", glyph: "T", recommended: true },
  { id: "mytonwallet", name: "MyTonWallet", tag: "Browser ext.", color: "#31B8E5", glyph: "M" },
  { id: "tonhub",     name: "Tonhub",        tag: "Mobile",       color: "#3179FF", glyph: "H" },
  { id: "openmask",   name: "OpenMask",      tag: "Chrome ext.",  color: "#F6BC4D", glyph: "O" },
];

const MOCK_WALLET_ADDRESS = "UQAv7K2gZyM3pNzqXr8tFh4WjQfL9bRcKVa2cP0nT5sYg3Rz";

const WalletConnectModal = ({ onClose, onConnected }) => {
  const [step, setStep] = React.useState("pick"); // pick → connecting → success → error
  const [wallet, setWallet] = React.useState(null);

  const pick = (w) => {
    setWallet(w);
    setStep("connecting");
  };

  const fakeApprove = () => setStep("success");

  const finish = () => {
    onConnected(wallet, MOCK_WALLET_ADDRESS);
    onClose();
  };

  return (
    <div className="modal" onClick={onClose} data-screen-label="wallet-connect">
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: "90%" }}>
        <div className="modal-handle" />

        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <TonConnectLogo size={28} />
            <div style={{ minWidth: 0 }}>
              <div className="eyebrow" style={{ color: "var(--teal)" }}>TON Connect</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2, whiteSpace: "nowrap" }}>
                {step === "pick" && "Choose a wallet"}
                {step === "connecting" && `Connecting to ${wallet?.name}`}
                {step === "success" && "Wallet connected"}
              </div>
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

        {/* STEP: PICK ─────────────────────────────── */}
        {step === "pick" && (
          <>
            <div style={{
              padding: "12px 14px", marginBottom: 14,
              background: "rgba(93,237,165,0.06)",
              border: "1px dashed rgba(93,237,165,0.25)",
              borderRadius: 14,
              display: "flex", alignItems: "flex-start", gap: 10,
            }}>
              <TokenCoin size={22} />
              <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5 }}>
                Required for the <b style={{ color: "var(--teal)" }}>20,000 USDT prize payout on Jul 19</b>. Your share lands directly in this wallet.
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {TON_WALLETS.map(w => (
                <button key={w.id} className="btn" onClick={() => pick(w)} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 14px", textAlign: "left",
                  background: "var(--card)", border: "1px solid var(--line-soft)",
                  borderRadius: 14,
                  position: "relative",
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: w.color, color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--display)", fontSize: 22,
                    boxShadow: `0 4px 12px ${w.color}33`,
                  }}>{w.glyph}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                      {w.name}
                      {w.recommended && (
                        <span style={{
                          fontSize: 9, padding: "2px 6px", borderRadius: 999,
                          background: "var(--teal)", color: "#0A0E1C",
                          letterSpacing: "0.08em", fontWeight: 800,
                        }}>POPULAR</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>{w.tag}</div>
                  </div>
                  <Icon name="chevron" size={18} color="var(--text-faint)" />
                </button>
              ))}
            </div>

            <div style={{
              marginTop: 16, fontSize: 11, color: "var(--text-faint)",
              textAlign: "center", lineHeight: 1.5,
            }}>
              Don't have a wallet? <span style={{ color: "var(--teal)", fontWeight: 700 }}>Get Tonkeeper →</span>
            </div>
          </>
        )}

        {/* STEP: CONNECTING ──────────────────────── */}
        {step === "connecting" && wallet && (
          <>
            <div style={{
              padding: "20px",
              background: "var(--card)",
              border: "1px solid var(--line-soft)",
              borderRadius: 18,
              marginBottom: 14,
              textAlign: "center",
            }}>
              <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 14 }}>
                Scan with <b style={{ color: "var(--text)" }}>{wallet.name}</b> or tap below to open
              </div>
              <QRPlaceholder color={wallet.color} />
              <div className="num" style={{
                marginTop: 14, padding: "8px 12px",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid var(--line-soft)",
                borderRadius: 10,
                fontFamily: "var(--mono)", fontSize: 11,
                color: "var(--text-faint)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                tc://connect?v=2&id=ta_{wallet.id}_a7k2x
              </div>
            </div>

            <button className="btn" onClick={fakeApprove} style={{
              width: "100%", padding: "14px 16px",
              background: wallet.color, color: "#fff",
              borderRadius: 14, fontSize: 14, fontWeight: 700,
              letterSpacing: "0.04em",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              marginBottom: 8,
              boxShadow: `0 6px 16px ${wallet.color}55`,
            }}>
              <Icon name="arrow" size={16} color="#fff" stroke={2.5} />
              Open {wallet.name}
            </button>

            <button className="btn btn-ghost" onClick={() => setStep("pick")} style={{ width: "100%" }}>
              Choose another wallet
            </button>

            <div style={{
              marginTop: 14, padding: "10px 12px",
              background: "rgba(255,159,28,0.06)",
              border: "1px dashed rgba(255,159,28,0.25)",
              borderRadius: 10,
              fontSize: 11, color: "var(--text-dim)", lineHeight: 1.5,
              display: "flex", gap: 8, alignItems: "flex-start",
            }}>
              <div style={{ width: 14, height: 14, borderRadius: 999, border: "2px solid var(--orange)", borderTopColor: "transparent", animation: "spin 0.9s linear infinite", flexShrink: 0, marginTop: 1 }} />
              <span>Waiting for approval in {wallet.name}…</span>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        )}

        {/* STEP: SUCCESS ─────────────────────────── */}
        {step === "success" && wallet && (
          <>
            <div style={{
              padding: "24px 20px",
              background: `
                radial-gradient(80% 60% at 50% 0%, rgba(93,237,165,0.2), transparent 70%),
                linear-gradient(180deg, #1A2038, #131829)`,
              border: "1px solid rgba(93,237,165,0.4)",
              borderRadius: 18,
              marginBottom: 14,
              textAlign: "center",
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 999, margin: "0 auto 14px",
                background: "var(--teal)", color: "#0A0E1C",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name="check" size={36} stroke={3} />
              </div>
              <div className="h-md" style={{ marginBottom: 6 }}>Connected</div>
              <div className="num" style={{
                padding: "8px 12px", margin: "0 auto",
                maxWidth: 280,
                background: "rgba(0,0,0,0.3)",
                border: "1px solid var(--line-soft)",
                borderRadius: 10,
                fontFamily: "var(--mono)", fontSize: 11,
                color: "var(--text-dim)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {MOCK_WALLET_ADDRESS.slice(0, 6)}…{MOCK_WALLET_ADDRESS.slice(-6)}
              </div>

              <div style={{
                marginTop: 16, padding: "10px 14px",
                background: "rgba(255,159,28,0.12)",
                border: "1px solid rgba(255,159,28,0.3)",
                borderRadius: 12,
                display: "inline-flex", alignItems: "center", gap: 8,
              }}>
                <BoltIcon size={18} color="#FF9F1C" />
                <span style={{ fontFamily: "var(--display)", fontSize: 18, color: "var(--orange)" }}>+50 ENERGY</span>
              </div>
            </div>

            <button className="btn btn-primary" onClick={finish}>
              Continue
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// QR code visual mock (deterministic SVG noise)
const QRPlaceholder = ({ color = "#0098EA" }) => {
  // deterministic pattern: 21×21 grid, hash-based fill
  const N = 21;
  const cells = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      // simple LCG hash for repeatable pattern
      const h = (x * 73 + y * 151 + x * y * 11) % 7;
      if (h < 3) cells.push({ x, y });
    }
  }
  // mandatory corner markers
  const corners = [[0, 0], [N - 7, 0], [0, N - 7]];

  return (
    <div style={{
      width: 168, height: 168, margin: "0 auto",
      background: "#fff",
      borderRadius: 12,
      padding: 10,
      position: "relative",
    }}>
      <svg viewBox={`0 0 ${N} ${N}`} width="100%" height="100%">
        {cells.map((c, i) => (
          <rect key={i} x={c.x} y={c.y} width="1" height="1" fill="#0A0E1C" />
        ))}
        {corners.map(([cx, cy], i) => (
          <g key={i}>
            <rect x={cx} y={cy} width="7" height="7" fill="#fff" />
            <rect x={cx} y={cy} width="7" height="7" fill="none" stroke="#0A0E1C" strokeWidth="1" />
            <rect x={cx + 2} y={cy + 2} width="3" height="3" fill="#0A0E1C" />
          </g>
        ))}
      </svg>
      {/* center brand badge */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        transform: "translate(-50%, -50%)",
        width: 36, height: 36, borderRadius: 8,
        background: color,
        display: "flex", alignItems: "center", justifyContent: "center",
        border: "3px solid #fff",
      }}>
        <TonGlyph size={20} color="#fff" />
      </div>
    </div>
  );
};

// TON diamond glyph
const TonGlyph = ({ size = 24, color = "#0098EA" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M5 6 L19 6 L12 20 Z M5 6 L12 12 L19 6 M12 12 L12 20" stroke={color} strokeWidth="1.5" fill="none" />
    <path d="M5 6 L19 6 L12 20 Z" fill={color} opacity="0.2" />
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
const REFERRAL_CODE = "ref_y_a7k2x";
const REFERRAL_LINK = `t.me/ThrillArenaBot?start=${REFERRAL_CODE}`;

const SHARE_CONTACTS = [
  { name: "Diego",   handle: "@diegokicks",   color: "#A78BFA", glyph: "D", online: true },
  { name: "Sam",     handle: "@pixelpenalty", color: "#22D3EE", glyph: "S", online: true },
  { name: "Ana",     handle: "@goalden_era",  color: "#FFD60A", glyph: "A", online: false },
  { name: "Mateo",   handle: "@chip_shot",    color: "#F472B6", glyph: "M", online: true },
  { name: "Rey",     handle: "@rabona_rey",   color: "#FF9F1C", glyph: "R", online: false },
  { name: "Iris",    handle: "@offside.io",   color: "#10B981", glyph: "I", online: true },
  { name: "Caleb",   handle: "@cleansheet",   color: "#F97316", glyph: "C", online: false },
  { name: "Priya",   handle: "@nutmeg_pri",   color: "#22D3EE", glyph: "P", online: true },
];

const InviteShareModal = ({ onClose, onSent }) => {
  const [selected, setSelected] = React.useState({});
  const [copied, setCopied] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const toggle = (h) => setSelected(s => ({ ...s, [h]: !s[h] }));
  const count = Object.values(selected).filter(Boolean).length;

  const copy = () => {
    // navigator.clipboard exists in Telegram WebApp; fall back silently in iframe
    try { navigator.clipboard?.writeText(`https://${REFERRAL_LINK}`); } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const send = () => {
    if (count === 0) return;
    setSent(true);
    setTimeout(() => { onSent(count); onClose(); }, 1400);
  };

  return (
    <div className="modal" onClick={onClose} data-screen-label="invite-share">
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: "92%" }}>
        <div className="modal-handle" />

        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, gap: 12 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="eyebrow" style={{ color: "var(--orange)", marginBottom: 8, whiteSpace: "nowrap" }}>Bring friends</div>
            <div className="h-lg">Invite to Thrill</div>
          </div>
          <button className="btn" onClick={onClose} style={{
            width: 36, height: 36, borderRadius: 999, flexShrink: 0,
            background: "var(--card)", border: "1px solid var(--line-soft)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="x" size={18} color="var(--text-dim)" />
          </button>
        </div>

        {!sent ? (
          <>
            {/* Reward summary */}
            <div style={{
              padding: "14px 16px", marginBottom: 14,
              borderRadius: 14,
              background: `
                radial-gradient(120% 80% at 100% 0%, rgba(255,159,28,0.2), transparent 60%),
                linear-gradient(135deg, #232844, #1A2038)`,
              border: "1px solid rgba(255,159,28,0.3)",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: "rgba(255,159,28,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name="people" size={22} color="var(--orange)" />
              </div>
              <div style={{ flex: 1, minWidth: 0, fontSize: 12, color: "var(--text-dim)", lineHeight: 1.45 }}>
                Both you and each friend get <b style={{ color: "var(--orange)", fontFamily: "var(--display)" }}>+20 ⚡</b> as soon as they join.
              </div>
            </div>

            {/* Referral link */}
            <div className="eyebrow" style={{ marginBottom: 8 }}>Your invite link</div>
            <div style={{
              display: "flex", gap: 8, marginBottom: 16,
            }}>
              <div className="num" style={{
                flex: 1, minWidth: 0,
                padding: "12px 14px",
                background: "var(--card)",
                border: "1px solid var(--line-soft)",
                borderRadius: 12,
                fontFamily: "var(--mono)", fontSize: 12,
                color: "var(--text)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                display: "flex", alignItems: "center",
              }}>{REFERRAL_LINK}</div>
              <button className="btn" onClick={copy} style={{
                padding: "0 16px", flexShrink: 0,
                background: copied ? "var(--teal)" : "var(--card)",
                color: copied ? "#0A0E1C" : "var(--teal)",
                border: `1px solid ${copied ? "var(--teal)" : "rgba(93,237,165,0.4)"}`,
                borderRadius: 12, fontSize: 12, fontWeight: 700,
                letterSpacing: "0.06em", textTransform: "uppercase",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                {copied ? <><Icon name="check" size={14} stroke={3} /> Copied</> : "Copy"}
              </button>
            </div>

            {/* Telegram contacts */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
              <div className="eyebrow">Send to Telegram contacts</div>
              <div style={{ fontSize: 10, color: "var(--text-faint)", letterSpacing: "0.06em" }}>
                {count > 0 ? `${count} selected` : "Tap to select"}
              </div>
            </div>

            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 6,
              maxHeight: 220, overflowY: "auto",
              padding: 4,
              marginBottom: 14,
              background: "rgba(0,0,0,0.18)",
              border: "1px solid var(--line-soft)",
              borderRadius: 12,
            }}>
              {SHARE_CONTACTS.map(c => {
                const sel = !!selected[c.handle];
                return (
                  <button key={c.handle} className="btn" onClick={() => toggle(c.handle)} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 10px",
                    background: sel ? "rgba(93,237,165,0.12)" : "transparent",
                    border: `1px solid ${sel ? "rgba(93,237,165,0.4)" : "transparent"}`,
                    borderRadius: 10,
                    textAlign: "left",
                  }}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 999,
                        background: c.color, color: "#0A0E1C",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "var(--display)", fontSize: 13,
                      }}>{c.glyph}</div>
                      {c.online && (
                        <div style={{
                          position: "absolute", right: -1, bottom: -1,
                          width: 9, height: 9, borderRadius: "50%",
                          background: "#5DEDA5", border: "2px solid #131829",
                        }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: sel ? "var(--teal)" : "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
                      <div style={{ fontSize: 9, color: "var(--text-faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.handle}</div>
                    </div>
                    {sel && <Icon name="check" size={14} color="var(--teal)" stroke={3} />}
                  </button>
                );
              })}
            </div>

            <button className="btn btn-primary" disabled={count === 0} onClick={send}
              style={{ opacity: count === 0 ? 0.5 : 1 }}>
              {count === 0 ? "Pick contacts to invite" : `Send ${count} invite${count > 1 ? "s" : ""} →`}
            </button>

            <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-faint)", textAlign: "center" }}>
              or share to a chat outside Telegram via the link above
            </div>
          </>
        ) : (
          // SENT SUCCESS
          <div style={{
            padding: "32px 20px",
            background: `
              radial-gradient(80% 60% at 50% 0%, rgba(255,159,28,0.18), transparent 70%),
              var(--card)`,
            border: "1px solid rgba(255,159,28,0.3)",
            borderRadius: 18,
            textAlign: "center",
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 999, margin: "0 auto 14px",
              background: "var(--orange)", color: "#0A0E1C",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon name="people" size={32} stroke={2.5} />
            </div>
            <div className="h-md" style={{ marginBottom: 6 }}>Invites on their way</div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 14, lineHeight: 1.5 }}>
              {count} friend{count > 1 ? "s" : ""} will get a Telegram message with your link.
              You'll earn <b style={{ color: "var(--orange)", fontFamily: "var(--display)" }}>⚡20 each</b> as soon as they join.
            </div>
            <div className="num" style={{
              padding: "6px 12px", display: "inline-block",
              background: "rgba(255,159,28,0.12)",
              border: "1px solid rgba(255,159,28,0.3)",
              borderRadius: 999,
              fontFamily: "var(--display)", fontSize: 14, color: "var(--orange)",
            }}>Pending: +{count * 30} ⚡</div>
          </div>
        )}
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
