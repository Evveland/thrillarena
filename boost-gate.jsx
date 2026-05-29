// ─── BOOST GATE — "Two Doors" pre-prediction screen ──────────
// Tap a match → this gate appears → user chooses Free pick or Boosted pick.
// Free → goes straight to PredictModal.
// Boost → opens DepositModal with selected amount; on success, PredictModal opens.
//
// Variant B from the proposal — explicit two-path UI.

const BoostGate = ({ matchId, state, actions, onClose }) => {
  const match = ALL_MATCHES.find(m => m.id === matchId);
  if (!match) return null;

  const home = teamOrSlot(match.home);
  const away = teamOrSlot(match.away);
  const stage = STAGES.find(s => s.key === match.stage);
  const stageLabel = stage?.label || "Match";
  const groupLabel = match.group ? ` · Group ${match.group}` : "";

  // current multiplier (could be > 1 if user already boosted earlier)
  const currentMult = state.boost.multiplier;
  const hasCurrent = currentMult > 1.001;
  const currentTier = state.boost.tier;

  // local ladder selection
  const [amount, setAmount] = React.useState(20);
  const projectedTier = boostTierFor(state.boost.lifetimeDeposited + amount);
  const projectedMult = projectedTier.mult;

  const ladderAmounts = QUICK_DEPOSIT_AMOUNTS; // [10, 20, 50, 200, 500]

  return (
    <div className="modal" onClick={onClose} data-screen-label="boost-gate">
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: "94%" }}>
        <div className="modal-handle" />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div className="eyebrow" style={{ color: "var(--orange)" }}>Predict {home.short || "TBD"} vs {away.short || "TBD"}</div>
            <div className="h-lg" style={{ marginTop: 4 }}>How do you play?</div>
          </div>
          <button className="btn" onClick={onClose} style={{
            width: 36, height: 36, borderRadius: 999, flexShrink: 0,
            background: "var(--card)", border: "1px solid var(--line-soft)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="x" size={18} color="var(--text-dim)" />
          </button>
        </div>

        {/* Match preview strip */}
        <div style={{
          padding: "12px 14px",
          background: "var(--card)",
          border: "1px solid var(--line-soft)",
          borderRadius: 14,
          marginBottom: 18,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div className="flag" style={{ fontSize: 32, lineHeight: 1, flexShrink: 0 }}>
            {home.flag || "🏳️"}
          </div>
          <div style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
            <div className="eyebrow" style={{ fontSize: 9, marginBottom: 2 }}>
              {stageLabel}{groupLabel}
            </div>
            <div style={{ fontFamily: "var(--display)", fontSize: 18, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
              {home.short || "?"} <span style={{ color: "var(--text-faint)" }}>vs</span> {away.short || "?"}
            </div>
            <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 2 }}>
              {fmtDate(match.date)}{match.venue ? ` · ${VENUES[match.venue]?.city || ""}` : ""}
            </div>
          </div>
          <div className="flag" style={{ fontSize: 32, lineHeight: 1, flexShrink: 0 }}>
            {away.flag || "🏳️"}
          </div>
        </div>

        {/* TWO PATHS — Free vs Boosted */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* ─── FREE PICK CARD ─────────────────────── */}
          <button className="btn" onClick={() => actions.confirmFreePick(matchId)} style={{
            padding: "16px 16px",
            background: hasCurrent
              ? `linear-gradient(135deg, ${currentTier.color}14, transparent)`
              : "var(--card)",
            border: hasCurrent
              ? `1px solid ${currentTier.color}55`
              : "1px solid var(--line-soft)",
            borderRadius: 18,
            textAlign: "left",
            display: "flex", alignItems: "center", gap: 14,
            width: "100%",
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: hasCurrent ? `${currentTier.color}26` : "rgba(255,255,255,0.06)",
              border: hasCurrent ? `1px solid ${currentTier.color}55` : "1px solid var(--line-soft)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--display)", fontSize: 17,
              color: hasCurrent ? currentTier.color : "var(--text-dim)",
              textShadow: hasCurrent ? `0 0 12px ${currentTier.color}55` : "none",
            }} className="num">
              {fmtMult(currentMult)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>
                {hasCurrent ? "Use current boost" : "Pick for free"}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-faint)", lineHeight: 1.4 }}>
                {hasCurrent
                  ? <>Drops <b style={{ color: currentTier.color }} className="num">{currentMult}</b> ticket{currentMult === 1 ? "" : "s"} into the matching raffle</>
                  : <>Drops <b style={{ color: "var(--text-dim)" }} className="num">1</b> ticket into the matching raffle</>}
              </div>
            </div>
            <Icon name="chevron" size={18} color="var(--text-faint)" />
          </button>

          {/* ─── BOOSTED PICK CARD ──────────────────── */}
          <div style={{
            padding: "16px",
            background: `radial-gradient(80% 80% at 100% 0%, ${projectedTier.color}22, transparent 70%), linear-gradient(180deg, ${projectedTier.color}14, transparent)`,
            border: `1.5px solid ${projectedTier.color}88`,
            borderRadius: 18,
            position: "relative",
          }}>
            <div style={{
              position: "absolute", top: -10, right: 14,
              padding: "3px 9px", borderRadius: 999,
              background: projectedTier.color, color: "#0A0E1C",
              fontSize: 9, fontWeight: 800, letterSpacing: "0.08em",
            }}>RECOMMENDED</div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                background: `${projectedTier.color}33`,
                border: `1px solid ${projectedTier.color}66`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--display)", fontSize: 17, color: projectedTier.color,
                textShadow: `0 0 12px ${projectedTier.color}66`,
              }} className="num">
                {fmtMult(projectedMult)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>
                  Boost your tickets
                </div>
                <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.4 }}>
                  Every action drops <b style={{ color: projectedTier.color }} className="num">{projectedMult}</b> ticket{projectedMult === 1 ? "" : "s"} into the matching raffle pool
                </div>
              </div>
            </div>

            {/* Amount ladder */}
            <div style={{ marginBottom: 12 }}>
              <div className="eyebrow" style={{ marginBottom: 6, fontSize: 9 }}>Amount</div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${ladderAmounts.length}, 1fr)`, gap: 6 }}>
                {ladderAmounts.map(amt => {
                  const tier = boostTierFor(state.boost.lifetimeDeposited + amt);
                  const sel = amount === amt;
                  return (
                    <button key={amt} className="btn" onClick={() => setAmount(amt)} style={{
                      padding: "10px 4px 8px",
                      background: sel ? `linear-gradient(180deg, ${tier.color}33, ${tier.color}10)` : "rgba(255,255,255,0.04)",
                      border: `1px solid ${sel ? `${tier.color}88` : "var(--line-soft)"}`,
                      borderRadius: 10,
                      textAlign: "center",
                    }}>
                      <div className="num" style={{
                        fontFamily: "var(--display)", fontSize: 16,
                        color: sel ? tier.color : "var(--text)",
                        lineHeight: 1,
                      }}>
                        ${amt}
                      </div>
                      <div className="num" style={{
                        fontSize: 10, marginTop: 3,
                        color: sel ? tier.color : "var(--text-faint)",
                        fontFamily: "var(--display)",
                      }}>
                        {fmtMult(tier.mult)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button className="btn btn-primary" onClick={() => actions.chooseBoostThenPick(matchId, amount)} style={{
              background: `linear-gradient(135deg, ${projectedTier.color}, ${projectedTier.color}DD)`,
              boxShadow: `0 6px 18px ${projectedTier.color}55`,
              color: "#0A0E1C",
            }}>
              Deposit & Boost Tickets →
            </button>
          </div>
        </div>

        {/* Footer note */}
        <div style={{
          marginTop: 14, padding: "10px 12px",
          background: "rgba(255,255,255,0.025)",
          border: "1px dashed rgba(255,255,255,0.08)",
          borderRadius: 10,
          fontSize: 11, color: "var(--text-faint)", lineHeight: 1.45,
          display: "flex", gap: 8, alignItems: "flex-start",
        }}>
          <Icon name="info" size={12} color="var(--text-faint)" />
          <span>Boost persists for the rest of the campaign — once you reach a tier, every action keeps dropping multiplied tickets into the raffles.</span>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { BoostGate });
