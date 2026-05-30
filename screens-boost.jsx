// ─── DEPOSIT / BOOST MECHANIC ─────────────────────────────
// Numeric multiplier (1.25x → 5x cap) earned by depositing into the casino.
// Stackable, decays per stage, gates prize tier eligibility.

// ─── CURRENCY ICONS ───────────────────────────────────────
const CurrencyIcon = ({ code, size = 28 }) => {
  const cur = DEPOSIT_CURRENCIES.find(c => c.code === code);
  const color = cur?.color || "#888";
  const glyphs = {
    USDT: <text x="12" y="16.5" textAnchor="middle" style={{ fontFamily: "Arial Black, sans-serif", fontSize: 9, fill: "#fff", fontWeight: 900 }}>₮</text>,
    USDC: <text x="12" y="16.5" textAnchor="middle" style={{ fontFamily: "Arial Black, sans-serif", fontSize: 7, fill: "#fff", fontWeight: 900 }}>USDC</text>,
    BTC:  <text x="12" y="16.5" textAnchor="middle" style={{ fontFamily: "Arial Black, sans-serif", fontSize: 11, fill: "#fff", fontWeight: 900 }}>₿</text>,
    ETH:  <g><path d="M12 4 L7 12 L12 14 L17 12 Z" fill="#fff" /><path d="M12 15 L7 13 L12 20 L17 13 Z" fill="#fff" opacity="0.7" /></g>,
    BNB:  <g><path d="M12 6 L15 9 L12 12 L9 9 Z M12 12 L15 15 L12 18 L9 15 Z M9 12 L6 9 L9 6 L12 9 Z M15 6 L18 9 L15 12 L12 9 Z" fill="#fff" /></g>,
  };
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
      boxShadow: `0 0 0 1px rgba(0,0,0,0.2)`,
    }}>
      <svg width={size} height={size} viewBox="0 0 24 24">
        {glyphs[code]}
      </svg>
    </div>
  );
};

// ─── MULTIPLIER CHIP — persistent header pill ────────────
const MultiplierChip = ({ mult, decaying, onClick, size = "md" }) => {
  const tier = boostTierFor(0); // base
  // pick color by ticket multiplier
  const color = mult >= 100 ? "#FF4D67"
    : mult >= 50 ? "#FF9F1C"
    : mult >= 10 ? "#A78BFA"
    : mult >= 5  ? "#22D3EE"
    : mult >= 2  ? "#5DEDA5"
    : "#5A6480";
  const active = mult > 1.001;
  const small = size === "sm";

  return (
    <button className="btn" onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: small ? 4 : 6,
      padding: small ? "3px 8px" : "5px 12px 5px 10px",
      borderRadius: 999,
      background: active ? `${color}1F` : "rgba(255,255,255,0.04)",
      border: `1px solid ${active ? `${color}66` : "var(--line-soft)"}`,
      color: active ? color : "var(--text-faint)",
      fontFamily: "var(--display)",
      fontSize: small ? 11 : 13,
      letterSpacing: "0.02em",
      lineHeight: 1,
      whiteSpace: "nowrap",
      position: "relative",
      animation: active && !decaying ? "boostPulse 2.4s ease-in-out infinite" : "none",
    }}>
      {/* flame/lightning glyph */}
      <svg width={small ? 11 : 13} height={small ? 11 : 13} viewBox="0 0 24 24" fill={active ? color : "currentColor"}>
        <path d="M13 2 L4 14 H10 L9 22 L20 9 H13 L15 2 Z" />
      </svg>
      <span className="num">{fmtMult(mult)}</span>
      {decaying && active && (
        <span style={{
          width: 5, height: 5, borderRadius: 999,
          background: "var(--orange)",
          boxShadow: "0 0 6px var(--orange)",
          marginLeft: 2,
        }} />
      )}
    </button>
  );
};

// ─── COMPACT MULTIPLIER BADGE — leaderboard rows ─────────
const MultiplierBadge = ({ mult, you = false }) => {
  if (mult <= 1.001) return null;
  const color = mult >= 100 ? "#FF4D67"
    : mult >= 50 ? "#FF9F1C"
    : mult >= 10 ? "#A78BFA"
    : mult >= 5  ? "#22D3EE"
    : "#5DEDA5";
  return (
    <div className="num" style={{
      display: "inline-flex", alignItems: "center", gap: 2,
      padding: "1px 6px",
      borderRadius: 999,
      background: `${color}1A`,
      border: `1px solid ${color}55`,
      color,
      fontFamily: "var(--display)",
      fontSize: 10, letterSpacing: "0.02em", lineHeight: 1.3,
      whiteSpace: "nowrap",
    }}>
      <svg width="8" height="8" viewBox="0 0 24 24" fill={color}>
        <path d="M13 2 L4 14 H10 L9 22 L20 9 H13 L15 2 Z" />
      </svg>
      {fmtMult(mult)}
    </div>
  );
};

// ─── BOOST HUB SCREEN ─────────────────────────────────────
const BoostHubScreen = ({ state, actions, onClose }) => {
  const { boost } = state;
  const { lifetimeDeposited, multiplier, tier, deposits } = boost;
  const nextTier = BOOST_TIERS.find(t => t.mult > tier.mult);

  return (
    <div className="overlay" style={{
      background: `
        radial-gradient(80% 50% at 50% 0%, ${tier.color}1F, transparent 70%),
        radial-gradient(60% 60% at 50% 100%, rgba(255,77,103,0.12), transparent 70%),
        linear-gradient(180deg, #131829 0%, #0A0E1C 100%)`,
      overflowY: "auto",
    }} data-screen-label="boost-hub">

      {/* Top bar */}
      <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button className="btn" onClick={onClose} style={{
          width: 40, height: 40, borderRadius: 999,
          background: "var(--card)", border: "1px solid var(--line-soft)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name="chevronL" size={20} />
        </button>
        <div className="eyebrow" style={{ color: tier.color, whiteSpace: "nowrap" }}>★ Boost</div>
        <div className="chip energy num" style={{ minWidth: 56 }}>
          <BoltIcon size={13} color="#FF9F1C" />
          <span>{state.energy}</span>
        </div>
      </div>

      {/* Current multiplier — huge */}
      <div style={{ padding: "8px 20px 20px", textAlign: "center" }}>
        <div className="eyebrow" style={{ color: "var(--text-faint)", marginBottom: 8 }}>Your ticket multiplier</div>
        <div style={{
          display: "inline-flex", alignItems: "baseline", justifyContent: "center", gap: 4,
          padding: "16px 24px",
          background: `radial-gradient(80% 80% at 50% 50%, ${tier.color}22, transparent 80%)`,
          borderRadius: 32,
          position: "relative",
        }}>
          <div style={{
            fontFamily: "var(--display)", fontSize: 88,
            lineHeight: 0.9, letterSpacing: "-0.02em",
            color: tier.color,
            textShadow: `0 0 30px ${tier.color}66`,
          }} className="num">
            {multiplier}
          </div>
          <div style={{
            fontFamily: "var(--display)", fontSize: 44,
            color: tier.color, opacity: 0.7,
          }}>x</div>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 6, lineHeight: 1.5, maxWidth: 300, margin: "6px auto 0" }}>
          Every correct pick and every Thrill action drops{" "}
          <b style={{ color: tier.color, fontFamily: "var(--display)" }} className="num">{multiplier}</b>{" "}
          ticket{multiplier === 1 ? "" : "s"} into the matching raffle pool.
        </div>
      </div>

      {/* Tickets-per-action card */}
      <div style={{ padding: "0 20px 16px" }}>
        <div style={{
          padding: "14px 16px",
          borderRadius: 16,
          background: `linear-gradient(135deg, ${tier.color}1A, transparent)`,
          border: `1px solid ${tier.color}55`,
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: `${tier.color}22`,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `1px solid ${tier.color}55`,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={tier.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/>
              <path d="M10 6v12" strokeDasharray="2 2"/>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eyebrow" style={{ color: tier.color, marginBottom: 2 }}>Tickets per action</div>
            <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.4 }}>
              Predict 6 matches in a day with <b className="num" style={{ color: tier.color }}>{multiplier}x</b>{" "}
              → <b className="num" style={{ color: "var(--text)" }}>{multiplier * 6}</b> tickets toward the Daily raffle.
            </div>
          </div>
        </div>
      </div>

      {/* Boost ladder — climb visualization */}
      <div style={{ padding: "0 20px 16px" }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Boost ladder</div>
        <div className="card" style={{ padding: 4 }}>
          {BOOST_TIERS.map((t, i) => {
            const isYou = t === tier;
            const isUnlocked = lifetimeDeposited >= t.min;
            const isNext = t === nextTier;
            return (
              <div key={t.label} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px",
                borderBottom: i < BOOST_TIERS.length - 1 ? "1px solid var(--line-soft)" : "none",
                background: isYou ? `linear-gradient(90deg, ${t.color}22, transparent)` : "transparent",
                border: isYou ? `1px solid ${t.color}55` : "none",
                borderRadius: isYou ? 12 : 0,
              }}>
                <div style={{
                  width: 50, flexShrink: 0,
                  fontFamily: "var(--display)", fontSize: 18,
                  color: isUnlocked ? t.color : "var(--text-faint)",
                  opacity: isUnlocked ? 1 : 0.5,
                  textAlign: "center",
                }} className="num">
                  {t.label}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: isUnlocked ? "var(--text)" : "var(--text-faint)", display: "flex", alignItems: "center", gap: 6 }}>
                    {t.unlockLabel}
                    {isYou && (
                      <span style={{
                        fontSize: 9, padding: "2px 6px", borderRadius: 999,
                        background: t.color, color: "#0A0E1C",
                        letterSpacing: "0.08em", fontWeight: 800,
                      }}>YOU</span>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 2 }}>
                    {t.min === 0 ? "Free — no deposit needed" : `Deposit $${t.min}+ total`}
                  </div>
                </div>
                {isNext && !isUnlocked && (
                  <div style={{
                    padding: "3px 8px", borderRadius: 999,
                    background: `${t.color}1A`, border: `1px solid ${t.color}55`,
                    color: t.color, fontSize: 9, fontWeight: 700,
                    letterSpacing: "0.08em",
                  }}>NEXT</div>
                )}
                {isUnlocked && !isYou && (
                  <Icon name="check" size={14} color={t.color} stroke={2.5} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick deposit CTAs */}
      <div style={{ padding: "0 20px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <div className="eyebrow">Top up boost</div>
          <div style={{ fontSize: 10, color: "var(--text-faint)", letterSpacing: "0.06em" }}>
            via Thrill Casino
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 10 }}>
          {QUICK_DEPOSIT_AMOUNTS.map(amt => {
            const tierAt = boostTierFor(lifetimeDeposited + amt);
            const willBe = tierAt.mult;
            const isLeap = tierAt.mult > tier.mult;
            return (
              <button key={amt} className="btn" onClick={() => actions.openDeposit(amt)} style={{
                padding: "10px 4px",
                background: isLeap ? `linear-gradient(180deg, ${tierAt.color}22, transparent)` : "var(--card)",
                border: `1px solid ${isLeap ? `${tierAt.color}55` : "var(--line-soft)"}`,
                borderRadius: 12,
                textAlign: "center",
              }}>
                <div className="num" style={{ fontFamily: "var(--display)", fontSize: 16, color: isLeap ? tierAt.color : "var(--text)" }}>
                  ${amt}
                </div>
                <div className="num" style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 2 }}>
                  → {fmtMult(willBe)}
                </div>
              </button>
            );
          })}
        </div>

        <button className="btn btn-primary" onClick={() => actions.openDeposit(null)}>
          Custom amount →
        </button>
      </div>

      {/* History */}
      {deposits.length > 0 && (
        <div style={{ padding: "0 20px 24px" }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Deposit history</div>
          <div className="card" style={{ padding: 4 }}>
            {deposits.slice(-5).reverse().map((d, i) => (
              <div key={d.ts} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px",
                borderBottom: i < Math.min(deposits.length, 5) - 1 ? "1px solid var(--line-soft)" : "none",
              }}>
                <CurrencyIcon code={d.currency} size={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }} className="num">
                    {d.cryptoAmount} {d.currency}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 2 }}>
                    {d.stageLabel} · ${d.usdAmount} → {d.newMult.toFixed(2)}x
                  </div>
                </div>
                <Icon name="check" size={14} color="var(--teal)" stroke={2.5} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ padding: "0 20px 24px" }}>
        <div className="card" style={{
          padding: "12px 14px",
          background: "rgba(255,159,28,0.05)",
          border: "1px dashed rgba(255,159,28,0.25)",
          fontSize: 11, color: "var(--text-dim)", lineHeight: 1.5,
          display: "flex", gap: 10, alignItems: "flex-start",
        }}>
          <Icon name="info" size={14} color="var(--orange)" />
          <div>
            Deposits stack to your lifetime total — the highest tier you've
            reached stays active for the rest of the campaign. Top up to
            jump to the next ladder rung.
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── DEPOSIT MODAL — Thrill handoff ─────────────────────
// Deposits happen on thrill.com, not in the mini-app. This panel previews
// the boost the user will unlock, opens the Thrill sportsbook in a new tab,
// and (for prototype demo continuity) simulates the postback so the success
// state can be shown after the user returns.
const THRILL_DEPOSIT_URL = "https://thrill.com/sports";
const DepositModal = ({ state, actions, presetAmount, onClose }) => {
  const [step, setStep] = React.useState("amount"); // amount → waiting → success
  const [usdAmount, setUsdAmount] = React.useState(presetAmount || 20);
  const [confirmedDeposit, setConfirmedDeposit] = React.useState(null);

  const tierAt = boostTierFor(state.boost.lifetimeDeposited + usdAmount);
  const willBe = tierAt.mult;
  const willLeap = tierAt.mult > state.boost.tier.mult;

  // 1) Open Thrill in a new tab. 2) Show a "we're waiting on Thrill" state.
  // Prototype-only: provide a "I've completed my deposit" simulator so the
  // success state and any pending predict flow can resolve.
  const handoffToThrill = () => {
    try { window.open(THRILL_DEPOSIT_URL, "_blank", "noopener,noreferrer"); }
    catch (e) { /* popup blocked — link below still works */ }
    setStep("waiting");
  };

  const simulateConfirmed = () => {
    const deposit = actions.makeDeposit({
      currency: "USDT",       // placeholder — actual currency picked on Thrill
      cryptoAmount: usdAmount.toFixed(2),
      usdAmount,
    });
    setConfirmedDeposit(deposit);
    setStep("success");
  };

  return (
    <div className="modal" onClick={onClose} data-screen-label="deposit">
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: "92%" }}>
        <div className="modal-handle" />

        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div className="eyebrow" style={{ color: tierAt.color }}>Deposit on Thrill</div>
            <div className="h-lg" style={{ marginTop: 4 }}>
              {step === "success" ? "Confirmed"
               : step === "waiting" ? "Continue on Thrill"
               : "Pick boost amount"}
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

        {/* STEP: AMOUNT */}
        {step === "amount" && (
          <>
            {/* current → projected multiplier */}
            <div style={{
              padding: "16px 18px", marginBottom: 14,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${tierAt.color}1F, transparent)`,
              border: `1px solid ${tierAt.color}44`,
              display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between",
            }}>
              <div style={{ textAlign: "center", flex: 1 }}>
                <div className="eyebrow" style={{ marginBottom: 4 }}>Now</div>
                <div className="num" style={{ fontFamily: "var(--display)", fontSize: 22, color: "var(--text-dim)" }}>
                  {fmtMult(state.boost.multiplier)}
                </div>
              </div>
              <Icon name="arrow" size={20} color={tierAt.color} stroke={2.5} />
              <div style={{ textAlign: "center", flex: 1 }}>
                <div className="eyebrow" style={{ marginBottom: 4, color: tierAt.color }}>After</div>
                <div className="num" style={{ fontFamily: "var(--display)", fontSize: 30, color: tierAt.color, textShadow: `0 0 12px ${tierAt.color}66` }}>
                  {fmtMult(willBe)}
                </div>
              </div>
            </div>

            {/* Amount selector */}
            <div className="eyebrow" style={{ marginBottom: 8 }}>Amount (USD)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 12 }}>
              {QUICK_DEPOSIT_AMOUNTS.map(a => {
                const sel = a === usdAmount;
                return (
                  <button key={a} className="btn" onClick={() => setUsdAmount(a)} style={{
                    padding: "10px 4px",
                    background: sel ? "var(--teal)" : "var(--card)",
                    color: sel ? "#0A0E1C" : "var(--text)",
                    border: `1px solid ${sel ? "var(--teal)" : "var(--line-soft)"}`,
                    borderRadius: 10,
                    fontFamily: "var(--display)", fontSize: 16,
                  }} className="num">
                    ${a}
                  </button>
                );
              })}
            </div>

            {/* Custom slider */}
            <div style={{
              padding: "12px 14px",
              background: "var(--card)",
              border: "1px solid var(--line-soft)",
              borderRadius: 12,
              marginBottom: 14,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: "var(--text-faint)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Custom</div>
                <div className="num" style={{ fontFamily: "var(--display)", fontSize: 20, color: "var(--teal)" }}>
                  ${usdAmount}
                </div>
              </div>
              <input type="range" min="5" max="1000" step="5"
                value={usdAmount}
                onChange={e => setUsdAmount(+e.target.value)}
                style={{ width: "100%", accentColor: "var(--teal)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-faint)", marginTop: 4 }}>
                <span>$5</span><span>$500+</span>
              </div>
            </div>

            {/* Thrill handoff explanation */}
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "12px 14px", marginBottom: 14,
              background: "rgba(255,159,28,0.08)",
              border: "1px solid rgba(255,159,28,0.30)",
              borderRadius: 12,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: "var(--orange)", color: "#0A0E1C",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name="bolt" size={18} stroke={2.5} />
              </div>
              <div style={{ minWidth: 0, fontSize: 11, color: "var(--text-dim)", lineHeight: 1.45 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>
                  Deposits happen on Thrill.com
                </div>
                You'll finish the deposit in the sportsbook — pick currency, complete payment.
                Your <b className="num" style={{ color: tierAt.color }}>{fmtMult(willBe)}</b> ticket multiplier activates automatically when the deposit clears.
              </div>
            </div>

            <button className="btn btn-primary" onClick={handoffToThrill} disabled={usdAmount < 5} style={{ whiteSpace: "nowrap" }}>
              Continue to Thrill →
            </button>
            <div style={{ fontSize: 10, color: "var(--text-faint)", textAlign: "center", marginTop: 10, lineHeight: 1.5 }}>
              Opens <span className="num" style={{ color: "var(--text-dim)" }}>thrill.com/sports</span> in a new tab · You stay logged in
            </div>
          </>
        )}

        {/* STEP: WAITING — handed off, waiting on Thrill postback */}
        {step === "waiting" && (
          <>
            <div style={{
              padding: "28px 20px",
              background: `radial-gradient(80% 60% at 50% 0%, ${tierAt.color}1A, transparent 70%), var(--card)`,
              border: `1px solid ${tierAt.color}55`,
              borderRadius: 18,
              marginBottom: 14,
              textAlign: "center",
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 999, margin: "0 auto 14px",
                border: `4px solid ${tierAt.color}33`, borderTopColor: tierAt.color,
                animation: "spin 0.9s linear infinite",
              }} />
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
                Waiting for Thrill…
              </div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5, maxWidth: 280, margin: "0 auto" }}>
                Complete your <b style={{ color: "var(--text)" }} className="num">${usdAmount}</b> deposit on
                {" "}<span className="num" style={{ color: "var(--teal)" }}>thrill.com/sports</span>.
                Your <b style={{ color: tierAt.color }} className="num">{fmtMult(willBe)}</b> ticket multiplier
                activates here as soon as the transaction settles.
              </div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>

            <button className="btn btn-primary" onClick={simulateConfirmed}>
              I've completed my deposit
            </button>
            <button className="btn" onClick={handoffToThrill} style={{
              width: "100%", marginTop: 8, padding: "10px 14px",
              background: "transparent", border: "1px solid var(--line-soft)",
              color: "var(--text-dim)", fontSize: 12,
            }}>
              Re-open Thrill →
            </button>
            <div style={{ fontSize: 10, color: "var(--text-faint)", textAlign: "center", marginTop: 10, lineHeight: 1.5 }}>
              Demo only — production fires on Thrill's deposit postback
            </div>
          </>
        )}

        {/* STEP: SUCCESS */}
        {step === "success" && confirmedDeposit && (
          <>
            <div style={{
              padding: "24px 20px",
              background: `
                radial-gradient(80% 60% at 50% 0%, ${tierAt.color}22, transparent 70%),
                var(--card)`,
              border: `1px solid ${tierAt.color}55`,
              borderRadius: 18,
              marginBottom: 14,
              textAlign: "center",
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 999, margin: "0 auto 14px",
                background: tierAt.color, color: "#0A0E1C",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name="check" size={36} stroke={3} />
              </div>

              <div className="eyebrow" style={{ color: tierAt.color, marginBottom: 4 }}>Ticket boost activated</div>
              <div style={{
                fontFamily: "var(--display)", fontSize: 64, lineHeight: 0.95,
                color: tierAt.color, textShadow: `0 0 24px ${tierAt.color}66`,
              }} className="num">
                {fmtMult(confirmedDeposit.newMult)}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 8, lineHeight: 1.45 }}>
                <span className="num">${confirmedDeposit.usdAmount}</span> confirmed on Thrill.
                Every pick and action now drops{" "}
                <b style={{ color: tierAt.color }} className="num">{confirmedDeposit.newMult}</b> ticket{confirmedDeposit.newMult === 1 ? "" : "s"} into the matching raffle.
              </div>
            </div>

            <button className="btn btn-primary" onClick={onClose}>
              Back to picks
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ─── BOOST CTA INSIDE PICK MODAL — "boost this pick" ─────
// Inline component drawn inside PredictModal.
const BoostThisPickInline = ({ state, actions }) => {
  const m = state.boost.multiplier;
  const tier = state.boost.tier;
  const color = m >= 100 ? "#FF4D67"
    : m >= 50 ? "#FF9F1C"
    : m >= 10 ? "#A78BFA"
    : m >= 5  ? "#22D3EE"
    : m >= 2  ? "#5DEDA5"
    : "#5A6480";
  const nextTier = BOOST_TIERS.find(t => t.mult > tier.mult);
  return (
    <button className="btn" onClick={() => actions.openBoostHub()} style={{
      width: "100%", textAlign: "left",
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 14px",
      background: `linear-gradient(135deg, ${color}1A, transparent)`,
      border: `1px solid ${color}44`,
      borderRadius: 14,
      marginBottom: 12,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: `${color}22`,
        display: "flex", alignItems: "center", justifyContent: "center",
        border: `1px solid ${color}55`,
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill={color}>
          <path d="M13 2 L4 14 H10 L9 22 L20 9 H13 L15 2 Z" />
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color, display: "flex", alignItems: "center", gap: 6 }}>
          Ticket multiplier <span className="num" style={{ fontFamily: "var(--display)", fontSize: 16 }}>{fmtMult(m)}</span>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {nextTier
            ? <>Boost to <b style={{ color: nextTier.color }} className="num">{nextTier.label}</b> · {nextTier.unlockLabel}</>
            : <>Maxed out · 100 tickets per action</>}
        </div>
      </div>
      {nextTier && (
        <div style={{
          padding: "5px 9px", borderRadius: 10, flexShrink: 0,
          background: nextTier.color, color: "#0A0E1C",
          fontSize: 10, fontWeight: 800, letterSpacing: "0.06em",
        }}>BOOST</div>
      )}
    </button>
  );
};

// ─── LOW-ENERGY DEPOSIT PROMPT — inline on Tasks ────────
const LowEnergyDepositCard = ({ state, actions }) => {
  if (state.energy > 20) return null;
  return (
    <div style={{ padding: "0 20px 12px" }}>
      <button className="btn" onClick={() => actions.openInvite()} style={{
        width: "100%", textAlign: "left", padding: 0,
        borderRadius: 18, overflow: "hidden",
        background: `
          radial-gradient(120% 80% at 100% 0%, rgba(255,159,28,0.22), transparent 60%),
          linear-gradient(135deg, #2A1F18, #1A1626)`,
        border: "1px solid rgba(255,159,28,0.4)",
      }}>
        <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: "rgba(255,159,28,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#FF9F1C">
              <path d="M13 2 L4 14 H10 L9 22 L20 9 H13 L15 2 Z" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eyebrow" style={{ color: "var(--orange)", marginBottom: 2 }}>Running low on energy</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Invite friends to keep predicting</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>
              +20 ⚡ per friend · 1 invite = 2 more picks
            </div>
          </div>
          <Icon name="arrow" size={20} color="var(--orange)" stroke={2.5} />
        </div>
      </button>
    </div>
  );
};

Object.assign(window, {
  CurrencyIcon, MultiplierChip, MultiplierBadge,
  BoostHubScreen, DepositModal,
  BoostThisPickInline, LowEnergyDepositCard,
});
