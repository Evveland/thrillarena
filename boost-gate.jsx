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

  // Live raffle odds
  const [odds, setOdds] = React.useState(null);
  React.useEffect(() => {
    if (!window.SupaDB || !state.dbUser?.id) return;
    // Determine which daily raffle applies to this match
    const raffleKey = match?.date
      ? `daily_${match.date.replace(/-/g, "_")}`
      : "final_mega";
    window.SupaDB.db
      .rpc("get_raffle_odds", { p_user_id: state.dbUser.id, p_raffle_key: raffleKey })
      .then(({ data }) => { if (data) setOdds(data); });
  }, [matchId, state.dbUser?.id]);

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

        {/* Odds comparison panel */}
        <OddsPanel
          odds={odds}
          currentMult={currentMult}
          projectedMult={projectedMult}
          projectedTierColor={projectedTier.color}
          hasCurrent={hasCurrent}
        />

        {/* Footer note */}
        <div style={{
          marginTop: 10, padding: "10px 12px",
          background: "rgba(255,255,255,0.025)",
          border: "1px dashed rgba(255,255,255,0.08)",
          borderRadius: 10,
          fontSize: 11, color: "var(--text-faint)", lineHeight: 1.45,
          display: "flex", gap: 8, alignItems: "flex-start",
        }}>
          <Icon name="info" size={12} color="var(--text-faint)" />
          <span>Boost persists for the rest of the campaign — once you reach a tier, every correct prediction drops multiplied tickets into the raffles.</span>
        </div>
      </div>
    </div>
  );
};

// ─── Odds comparison panel ────────────────────────────────
const OddsPanel = ({ odds, currentMult, projectedMult, projectedTierColor, hasCurrent }) => {
  if (!odds) return null;

  const totalTickets = Number(odds.total_tickets) || 0;
  const userTickets  = Number(odds.user_tickets)  || 0;
  const entrants     = Number(odds.entrants)       || 0;

  // Projected tickets from ONE correct prediction at each multiplier
  const ticketsBase   = 1; // one correct prediction
  const userCurrent   = userTickets + ticketsBase * currentMult;
  const userBoosted   = userTickets + ticketsBase * projectedMult;
  const poolWithBase  = totalTickets + ticketsBase * currentMult;
  const poolWithBoost = totalTickets + ticketsBase * projectedMult;

  const oddsBase   = poolWithBase  > 0 ? (userCurrent  / poolWithBase  * 100) : 0;
  const oddsBoosted = poolWithBoost > 0 ? (userBoosted / poolWithBoost * 100) : 0;
  const improvement = oddsBase > 0 ? (oddsBoosted / oddsBase).toFixed(1) : projectedMult;

  const fmtOdds = (pct) => {
    if (pct >= 1)     return pct.toFixed(1) + "%";
    if (pct >= 0.01)  return pct.toFixed(2) + "%";
    if (pct === 0)    return "< 0.01%";
    return "1 in " + Math.round(1 / (pct / 100)).toLocaleString();
  };

  const boost = projectedMult;
  const extraTickets = ticketsBase * boost - ticketsBase * currentMult;

  return (
    <div style={{
      marginTop: 14, padding: "14px 16px", borderRadius: 14,
      background: `linear-gradient(135deg, ${projectedTierColor}0D, rgba(255,255,255,0.02))`,
      border: `1px solid ${projectedTierColor}44`,
    }}>
      <div className="eyebrow" style={{ color: projectedTierColor, marginBottom: 10 }}>
        📊 Your odds in today's raffle
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 10, marginBottom: 10 }}>
        {/* Without boost */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "var(--text-faint)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {hasCurrent ? "Current" : "Without boost"}
          </div>
          <div className="num" style={{ fontFamily: "var(--display)", fontSize: 20, color: "var(--text-dim)" }}>
            {fmtOdds(oddsBase)}
          </div>
          <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 2 }}>
            {Math.round(userCurrent)} ticket{Math.round(userCurrent) !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Arrow + improvement */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            padding: "4px 8px", borderRadius: 8,
            background: projectedTierColor + "22",
            border: "1px solid " + projectedTierColor + "55",
            fontSize: 11, fontWeight: 800, color: projectedTierColor,
            fontFamily: "var(--display)",
          }}>
            {improvement}×
          </div>
          <div style={{ fontSize: 18, color: projectedTierColor, marginTop: 4 }}>→</div>
        </div>

        {/* With boost */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: projectedTierColor, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
            With {fmtMult(boost)} boost
          </div>
          <div className="num" style={{ fontFamily: "var(--display)", fontSize: 20, color: projectedTierColor }}>
            {fmtOdds(oddsBoosted)}
          </div>
          <div style={{ fontSize: 10, color: projectedTierColor, marginTop: 2, opacity: 0.8 }}>
            {Math.round(userBoosted)} ticket{Math.round(userBoosted) !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Context line */}
      <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.5, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 8 }}>
        {entrants > 0
          ? <>Pool has <b className="num" style={{ color: "var(--text)" }}>{totalTickets.toLocaleString()}</b> tickets from <b className="num" style={{ color: "var(--text)" }}>{entrants}</b> players. {extraTickets > 0 ? <>A deposit adds <b style={{ color: projectedTierColor }} className="num">+{Math.round(extraTickets)}</b> tickets per correct pick — putting you ahead of most unboosted players.</> : "You already have a boost active."}</>
          : <>Be among the first to predict — early entrants face less competition for the prize pool.</>}
      </div>
    </div>
  );
};

Object.assign(window, { BoostGate });
