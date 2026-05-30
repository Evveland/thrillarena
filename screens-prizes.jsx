// ─── PRIZE POOL UI ──────────────────────────────────────
// Implements the 4-layer daily/group/weekly/final pool model. Daily pool
// is the dopamine loop driver: it appears on Home, gates the user with
// 3 unlock actions, and rewards a return visit with a "you won yesterday"
// confetti modal.

// Confetti dots (cheap, no lib)
const Confetti = () => {
  const colors = ["#5DEDA5", "#FF9F1C", "#FFD60A", "#FF4D67", "#22D3EE", "#A78BFA"];
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 800,
    duration: 1800 + Math.random() * 1600,
    color: colors[i % colors.length],
    size: 6 + Math.random() * 6,
    rot: Math.random() * 360,
  }));
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {pieces.map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${p.left}%`, top: -20,
          width: p.size, height: p.size,
          background: p.color, borderRadius: 2,
          transform: `rotate(${p.rot}deg)`,
          animation: `confettiFall ${p.duration}ms ${p.delay}ms ease-in forwards`,
        }} />
      ))}
      <style>{`@keyframes confettiFall {
        to { transform: translateY(900px) rotate(720deg); opacity: 0; }
      }`}</style>
    </div>
  );
};

// Tiny ticket icon (used in chips + progress dots)
const TicketGlyph = ({ size = 16, color = "#FF9F1C" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/>
    <path d="M10 6v12" strokeDasharray="2 2"/>
  </svg>
);

// ─── DAILY POOL CARD — HOME HERO ───────────────────────
// The dopamine loop driver. Shows today's pool, 3 unlock gates, your
// raffle tickets, the countdown, and a "winners just paid" social bar.
const DailyPoolCard = ({ state, actions, todayMatchCount = 0, todayPredictedCount = 0 }) => {
  const dynamicMin = Math.max(1, Math.min(todayMatchCount, 3));
  const prog = dailyUnlockProgress(state.dailyActions, dynamicMin);
  const tickets = state.dailyTickets || 0;
  const eligible = prog.eligible;

  return (
    <div style={{ padding: "0 20px" }}>
      <button
        className="btn"
        onClick={() => actions.goto("pools")}
        style={{
          width: "100%", textAlign: "left", padding: 0,
          borderRadius: 24, overflow: "hidden",
          background: `
            radial-gradient(120% 70% at 100% 0%, rgba(255,159,28,0.32), transparent 60%),
            radial-gradient(100% 70% at 0% 100%, rgba(255,77,103,0.18), transparent 60%),
            linear-gradient(165deg, #2A1A1F 0%, #1A1428 100%)`,
          border: `1px solid ${eligible ? "rgba(93,237,165,0.45)" : "rgba(255,159,28,0.4)"}`,
          position: "relative",
        }}
      >
        {/* tape stripe */}
        <div style={{
          position: "absolute", top: 12, right: -28, transform: "rotate(35deg)",
          background: eligible ? "var(--teal)" : "var(--orange)",
          color: "#0A0E1C", padding: "3px 36px",
          fontFamily: "var(--display)", fontSize: 11, letterSpacing: "0.12em",
        }}>{eligible ? "ENTERED" : "TODAY"}</div>

        {/* main body */}
        <div style={{ padding: "18px 20px 14px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div className="eyebrow" style={{ color: "var(--orange)", marginBottom: 6, whiteSpace: "nowrap" }}>
                ⚡ Daily Matchday Pool
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <div className="h-big num" style={{ fontSize: 44, color: "var(--gold)" }}>
                  6,800
                </div>
                <div style={{ fontFamily: "var(--display)", fontSize: 14, color: "var(--orange)" }}>USDT</div>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4, whiteSpace: "nowrap" }}>
                {TODAY_POOL.matches > 0
                  ? <>{TODAY_POOL.dateLabel} · <b className="num" style={{ color: "var(--text)" }}>5 winner slots</b> drawn today</>
                  : <>First matches <b style={{ color: "var(--text)" }}>Jun 11</b> · first draw <b style={{ color: "var(--gold)" }}>Jun 12</b></>
                }
              </div>
            </div>

            {/* countdown ring — hide before tournament starts */}
            {TODAY_POOL.matches > 0 && <CountdownRing hours={TODAY_POOL.closesInHours} />}
          </div>

          {/* progress gates */}
          <UnlockGates prog={prog} />

          {/* tickets earned strip */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginTop: 14, padding: "8px 12px",
            borderRadius: 12,
            background: eligible ? "rgba(93,237,165,0.10)" : "rgba(255,159,28,0.06)",
            border: `1px dashed ${eligible ? "rgba(93,237,165,0.35)" : "rgba(255,159,28,0.25)"}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <TicketGlyph size={16} color={eligible ? "var(--teal)" : "var(--orange)"} />
              <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
                <b style={{ color: eligible ? "var(--teal)" : "var(--orange)" }} className="num">{tickets}</b>
                {" "}raffle ticket{tickets === 1 ? "" : "s"}
              </span>
            </div>
            <span style={{ fontSize: 11, color: "var(--text-faint)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              cap {TICKET_CAPS.daily}
            </span>
          </div>
        </div>

        {/* footer — winners ticker */}
        <WinnerTicker />
      </button>
    </div>
  );
};

const CountdownRing = ({ hours = 7 }) => {
  const pct = Math.max(0, Math.min(1, (24 - hours) / 24));
  const r = 22, c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
        <circle cx="28" cy="28" r={r} fill="none" stroke="var(--orange)" strokeWidth="4"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round"
          transform="rotate(-90 28 28)"
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", lineHeight: 1,
      }}>
        <div className="num" style={{ fontFamily: "var(--display)", fontSize: 18, color: "var(--gold)" }}>{hours}h</div>
        <div style={{ fontSize: 8, color: "var(--text-faint)", letterSpacing: "0.1em", textTransform: "uppercase" }}>left</div>
      </div>
    </div>
  );
};

// Unlock gate: predictions only — count driven by actual scheduled matches
const UnlockGates = ({ prog }) => {
  const done  = prog.preds;
  const need  = prog.u.minPredictions;
  const ratio = need > 0 ? Math.min(1, done / need) : 0;
  const ok    = done >= need && need > 0;

  if (need === 0) return (
    <div style={{ fontSize: 11, color: "var(--text-faint)", padding: "4px 0 8px" }}>
      No matches today · first matches Jun 11
    </div>
  );

  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: ok ? "var(--teal)" : "var(--text-dim)", display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
          {ok && <Icon name="check" size={12} color="var(--teal)" stroke={3} />}
          Predict today's matches
        </span>
        <span className="num" style={{ fontSize: 11, fontFamily: "var(--display)", color: ok ? "var(--teal)" : "var(--text)", letterSpacing: "0.04em" }}>
          {done}/{need}
        </span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${ratio * 100}%`,
          background: ok ? "linear-gradient(90deg, var(--teal), #C8FFE0)" : "linear-gradient(90deg, var(--orange), var(--gold))",
          transition: "width 0.3s ease",
        }} />
      </div>
    </div>
  );
};

// Live "winner just paid" rotating banner — social proof for return visits
const WinnerTicker = () => {
  const winners = TODAY_POOL.recentWinners;
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    if (!winners.length) return;
    const t = setInterval(() => setI(n => (n + 1) % winners.length), 2400);
    return () => clearInterval(t);
  }, [winners.length]);

  // Pre-launch: no winners yet
  if (!winners.length) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "9px 16px",
        background: "rgba(0,0,0,0.30)",
        borderTop: "1px solid var(--line-soft)",
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: 3, flexShrink: 0,
          background: "var(--teal)", boxShadow: "0 0 8px var(--teal-glow)",
          animation: "boostPulse 1.4s ease-in-out infinite",
        }} />
        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
          First winners announced <b style={{ color: "var(--gold)" }}>Jun 12</b> · predict now to enter
        </span>
      </div>
    );
  }

  const w = winners[i];
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "9px 16px",
      background: "rgba(0,0,0,0.30)",
      borderTop: "1px solid var(--line-soft)",
      gap: 10, overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <span style={{
          width: 6, height: 6, borderRadius: 3, flexShrink: 0,
          background: "var(--teal)", boxShadow: "0 0 8px var(--teal-glow)",
          animation: "boostPulse 1.4s ease-in-out infinite",
        }} />
        <div key={i} style={{
          fontSize: 11, color: "var(--text-dim)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          animation: "tickerSlide 0.4s ease",
        }}>
          <b style={{ color: "var(--text)" }}>{w.name}</b> won <b className="num" style={{ color: "var(--gold)" }}>${w.amount}</b> · {METHOD_TOKENS[w.method]?.label || w.method}
        </div>
      </div>
      <span style={{ fontSize: 10, color: "var(--text-faint)", flexShrink: 0, whiteSpace: "nowrap" }}>{w.time}</span>
      <style>{`@keyframes tickerSlide { from { opacity: 0; transform: translateX(8px); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
};

// ─── POOLS SCREEN — all 4 layers stacked ───────────────────
const PoolsScreen = ({ state, actions }) => {
  const [openKey, setOpenKey] = React.useState("daily");
  // Wire today's match count from static schedule
  const todayMatches = (typeof ALL_MATCHES !== "undefined" ? ALL_MATCHES : [])
    .filter(m => m.date === TODAY_POOL.date && !m.tbd);
  const dynamicMin = Math.max(1, Math.min(todayMatches.length, 3));
  const prog = dailyUnlockProgress(state.dailyActions, dynamicMin);
  return (
    <>
      <ScreenHeader
        eyebrow="Prize pools"
        title="Win every day"
        right={<StatusPills energy={state.energy}
          boost={state.boost} onBoostClick={actions.openBoostHub} />}
      />

      {/* Pool totals strip */}
      <div style={{ padding: "0 20px 14px" }}>
        <div style={{
          padding: "14px 18px",
          borderRadius: 18,
          background: `radial-gradient(120% 80% at 0% 0%, rgba(93,237,165,0.20), transparent 60%), linear-gradient(135deg, #1A2038, #131829)`,
          border: "1px solid var(--line)",
        }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
            <div className="eyebrow" style={{ color: "var(--teal)" }}>Total campaign pool</div>
            <div className="h-md token-shimmer num">20,000 USDT</div>
          </div>
          <div style={{ display: "flex", height: 12, borderRadius: 6, overflow: "hidden", border: "1px solid var(--line-soft)" }}>
            {POOL_LAYERS.map(p => (
              <div key={p.key} title={`${p.short} ${p.pct}%`} style={{
                width: `${p.pct}%`, background: p.color, opacity: 0.85,
                borderRight: "1px solid #0A0E1C",
              }} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10, color: "var(--text-faint)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {POOL_LAYERS.map(p => (
              <span key={p.key} style={{ color: p.color }}>{p.short} {p.pct}%</span>
            ))}
          </div>
          {/* How to win link */}
          <button className="btn" onClick={() => actions.openHowToWin && actions.openHowToWin()} style={{
            width: "100%", marginTop: 12, padding: "10px 12px",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
            borderRadius: 10,
            background: "rgba(93,237,165,0.06)",
            border: "1px dashed rgba(93,237,165,0.30)",
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-dim)" }}>
              <Icon name="info" size={14} color="var(--teal)" />
              How does winning work?
            </span>
            <span style={{
              fontSize: 10, color: "var(--teal)", fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase",
              display: "flex", alignItems: "center", gap: 4,
            }}>Explainer <Icon name="arrow" size={11} stroke={2.5} color="var(--teal)" /></span>
          </button>
        </div>
      </div>

      {/* Pool cards */}
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {POOL_LAYERS.map(p => (
          <PoolRow
            key={p.key} pool={p}
            open={openKey === p.key}
            onToggle={() => setOpenKey(openKey === p.key ? null : p.key)}
            state={state} actions={actions}
            prog={p.key === "daily" ? prog : null}
          />
        ))}
      </div>

      {/* Ticket caps + fairness footer */}
      <div style={{ padding: "20px" }}>
        <div className="card" style={{
          padding: "14px 16px",
          background: "rgba(93,237,165,0.04)",
          border: "1px dashed rgba(93,237,165,0.22)",
          fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5,
          display: "flex", gap: 12, alignItems: "flex-start",
        }}>
          <Icon name="info" size={16} color="var(--teal)" />
          <div>
            <b style={{ color: "var(--text)" }}>Provably fair.</b>{" "}
            Raffle winners are drawn from a seeded RNG and the full ticket list + seed hash are published after each pool closes. Tickets capped per pool to prevent farming.
          </div>
        </div>
      </div>
    </>
  );
};

// Single pool row — expandable, shows payout table when open
const PoolRow = ({ pool, open, onToggle, state, prog, actions }) => {
  const total = pool.totalBudget || 0;
  const isDaily = pool.key === "daily";
  const eligible = isDaily ? prog?.eligible : null;
  const userTickets = state[`${pool.key}Tickets`] || 0;
  const cap = TICKET_CAPS[pool.key] ?? "—";

  // ── Wire match data from static schedule ─────────────────
  // Count scheduled matches relevant to this pool
  const stageMap = { r32: "r32", r16: "r16", qf: "qf", sf: "sf", final: "final", group: "groups" };
  const stageKey  = stageMap[pool.key];
  const poolMatches = stageKey
    ? ALL_MATCHES.filter(m => m.stage === stageKey && !m.tbd)
    : [];
  const firstMatchDate = poolMatches.length
    ? fmtDate(poolMatches.slice().sort((a,b) => (a.date||"").localeCompare(b.date||""))[0].date)
    : null;
  const lastMatchDate = poolMatches.length
    ? fmtDate(poolMatches.slice().sort((a,b) => (b.date||"").localeCompare(a.date||""))[0].date)
    : null;

  // Pool-specific subtitle
  const subtitle = {
    daily:   TODAY_POOL.matches > 0
               ? `${TODAY_POOL.matches} matches today · closes ${TODAY_POOL.closesInHours}h`
               : `First draw Jun 12 · predict now to enter`,
    group:   `${ALL_MATCHES.filter(m=>m.stage==="groups").length} group matches · Jun 11 – Jun 28`,
    r32:     `${poolMatches.length} fixtures · Jun 28 – Jul 2`,
    r16:     `${poolMatches.length} fixtures · Jul 10 – Jul 13`,
    qf:      `${poolMatches.length} fixtures · Jul 14 – Jul 15`,
    sf:      `${poolMatches.length} fixtures · Jul 16 – Jul 17`,
    final:   `5 winners × $1,000 each · Final · Jul 19`,
  }[pool.key] || `${pool.units} ${pool.unitLabel}s`;

  return (
    <div style={{
      borderRadius: 18, overflow: "hidden",
      background: `linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))`,
      border: `1px solid ${open ? pool.color + "55" : "var(--line-soft)"}`,
    }}>
      <button className="btn" onClick={onToggle} style={{
        width: "100%", textAlign: "left", padding: "14px 16px",
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: `${pool.color}22`,
          border: `1px solid ${pool.color}55`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--display)", fontSize: 18, color: pool.color,
        }}>{pool.short[0]}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{pool.label}</span>
            {eligible === true && (
              <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "rgba(93,237,165,0.2)", color: "var(--teal)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>Entered</span>
            )}
            {eligible === false && (
              <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "rgba(255,159,28,0.2)", color: "var(--orange)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>Locked</span>
            )}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{subtitle}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div className="num" style={{ fontFamily: "var(--display)", fontSize: 22, color: pool.color, lineHeight: 1 }}>
            {total.toLocaleString()}
          </div>
          <div style={{ fontSize: 10, color: "var(--text-faint)", letterSpacing: "0.06em", marginTop: 3 }}>USDT</div>
        </div>
      </button>

      {open && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--line-soft)" }}>
          {/* Daily: show unlock gates inline */}
          {isDaily && (
            <div style={{ paddingTop: 12 }}>
              <div className="eyebrow muted" style={{ marginBottom: 8 }}>Your progress today</div>
              <UnlockGates prog={prog} />
            </div>
          )}

          {/* Ticket count */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            margin: "12px 0", padding: "8px 12px",
            borderRadius: 10,
            background: `${pool.color}10`,
            border: `1px dashed ${pool.color}40`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <TicketGlyph size={14} color={pool.color} />
              <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
                Your tickets · <b className="num" style={{ color: pool.color }}>{userTickets}</b>
              </span>
            </div>
            <span style={{ fontSize: 10, color: "var(--text-faint)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              cap {cap}
            </span>
          </div>

          {/* Prize per winner — flat raffle, no top-score skew */}
          <div className="eyebrow muted" style={{ marginBottom: 8 }}>Prize draw</div>
          <div style={{
            background: "rgba(0,0,0,0.18)", border: "1px solid var(--line-soft)",
            borderRadius: 12, overflow: "hidden",
          }}>
            {pool.payouts.map((p, i) => {
              const tok = METHOD_TOKENS[p.method] || METHOD_TOKENS.raffle;
              return (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "auto 1fr auto",
                  alignItems: "center", gap: 10, padding: "10px 12px",
                  borderBottom: i < pool.payouts.length - 1 ? "1px solid var(--line-soft)" : "none",
                }}>
                  <span style={{
                    fontSize: 9, padding: "2px 6px", borderRadius: 4,
                    background: `${tok.color}1F`, color: tok.color,
                    letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700,
                  }}>{tok.label}</span>
                  <span style={{ fontSize: 12, color: "var(--text)", fontWeight: 600 }}>
                    {p.slots} winner{p.slots === 1 ? "" : "s"} <span style={{ color: "var(--text-faint)", fontWeight: 400 }}>· {p.rank}</span>
                  </span>
                  <span className="num" style={{ fontFamily: "var(--display)", fontSize: 16, color: pool.color, whiteSpace: "nowrap" }}>
                    ${p.prize.toLocaleString()} <span style={{ fontSize: 10, color: "var(--text-faint)" }}>ea</span>
                  </span>
                </div>
              );
            })}
          </div>

          {/* How to earn tickets — confidence tiers */}
          <div className="eyebrow muted" style={{ marginTop: 14, marginBottom: 8 }}>How to earn tickets here</div>
          <div style={{
            background: "rgba(0,0,0,0.18)", border: "1px solid var(--line-soft)",
            borderRadius: 12, overflow: "hidden",
          }}>
            {[
              { conf: "50–64%", label: "Low confidence",    tickets: 1 },
              { conf: "65–79%", label: "Medium confidence", tickets: 2 },
              { conf: "80–100%", label: "High confidence",  tickets: 3 },
            ].map((r, i, arr) => {
              const boost = state.boost?.multiplier || 1;
              const effective = r.tickets * boost;
              return (
                <div key={r.conf} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  borderBottom: i < arr.length - 1 ? "1px solid var(--line-soft)" : "none",
                }}>
                  <TicketGlyph size={14} color={pool.color} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: "var(--text)", fontWeight: 600 }}>
                      Correct prediction · {r.conf}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 1 }}>{r.label}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className="num" style={{ fontFamily: "var(--display)", fontSize: 14, color: pool.color, whiteSpace: "nowrap" }}>
                      ×{r.tickets}
                    </span>
                    {boost > 1 && (
                      <div style={{ fontSize: 9, color: "var(--orange)", marginTop: 1, whiteSpace: "nowrap" }}>
                        = {effective} with {fmtMult(boost)} boost
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Boost upsell if no boost */}
          {(state.boost?.multiplier || 1) <= 1 && (
            <button className="btn" onClick={() => actions.openBoostHub && actions.openBoostHub()} style={{
              width: "100%", marginTop: 8, padding: "9px 12px",
              background: "rgba(255,77,103,0.08)", border: "1px dashed rgba(255,77,103,0.3)",
              borderRadius: 10, fontSize: 11, color: "var(--text-dim)", lineHeight: 1.4,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ color: "#FF4D67", fontWeight: 700 }}>Deposit on Thrill →</span>
              <span>multiply every ticket up to ×100</span>
            </button>
          )}

          {/* Hook copy */}
          <div style={{ marginTop: 12, fontSize: 11, color: "var(--text-faint)", lineHeight: 1.5 }}>
            {pool.key === "daily" && <><b style={{ color: pool.color }}>Drive daily return visits.</b> Every matchday is a fresh raffle. Correct picks from that day feed the draw — predict more matches to stack tickets.</>}
            {pool.key === "group" && <><b style={{ color: pool.color }}>One raffle per group.</b> Correct predictions for matches within a group earn tickets into that group's $300 raffle. 10 groups · 5 winners each.</>}
            {pool.key === "r32"   && <><b style={{ color: pool.color }}>Knockouts begin.</b> Correct R32 predictions earn tickets into the $1,600 pool. Draw runs after the round closes.</>}
            {pool.key === "r16"   && <><b style={{ color: pool.color }}>Fewer fixtures, bigger prizes.</b> Round of 16 correct picks earn tickets. $200 per fixture, 5 winners each.</>}
            {pool.key === "qf"    && <><b style={{ color: pool.color }}>Final 8.</b> 4 quarterfinal fixtures, $300 each, 5 winners per fixture.</>}
            {pool.key === "sf"    && <><b style={{ color: pool.color }}>Two matches, ten winners.</b> $400 per semifinal, 5 winners each, drawn after both semis complete.</>}
            {pool.key === "final" && <><b style={{ color: pool.color }}>The hero prize.</b> 5 raffle winners draw $1,000 each on Jul 19. Deposit on Thrill to multiply your ticket count up to ×100.</>}
          </div>

          {/* Matches in this pool — wired to schedule data */}
          {poolMatches.length > 0 && pool.key !== "daily" && (
            <div style={{ marginTop: 14 }}>
              <div className="eyebrow muted" style={{ marginBottom: 8 }}>
                Matches in this pool ({poolMatches.length})
              </div>
              <div style={{
                background: "rgba(0,0,0,0.18)", border: "1px solid var(--line-soft)",
                borderRadius: 12, overflow: "hidden", maxHeight: 220, overflowY: "auto",
              }}>
                {poolMatches.slice(0, 12).map((m, i, arr) => {
                  const h = TEAMS[m.home], a = TEAMS[m.away];
                  const pick = state.predictions?.[m.id];
                  return (
                    <div key={m.id} style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                      borderBottom: i < Math.min(arr.length,12) - 1 ? "1px solid var(--line-soft)" : "none",
                      background: pick ? "rgba(93,237,165,0.04)" : "transparent",
                    }}>
                      <span style={{ fontSize: 10, color: "var(--text-faint)", width: 42, flexShrink: 0 }} className="num">
                        {fmtDate(m.date)}
                      </span>
                      <span className="flag" style={{ fontSize: 16 }}>{h?.flag || "🏳"}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, flex: 1, color: "var(--text-dim)" }}>
                        {h?.short || m.home} vs {a?.short || m.away}
                      </span>
                      <span className="flag" style={{ fontSize: 16 }}>{a?.flag || "🏳"}</span>
                      {pick
                        ? <span style={{ fontSize: 10, color: "var(--teal)", fontWeight: 700, flexShrink: 0 }}>✓ {pick}</span>
                        : <span style={{ fontSize: 10, color: "var(--text-faint)", flexShrink: 0 }}>–</span>
                      }
                    </div>
                  );
                })}
                {poolMatches.length > 12 && (
                  <div style={{ padding: "8px 12px", fontSize: 11, color: "var(--text-faint)", textAlign: "center" }}>
                    +{poolMatches.length - 12} more matches
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Current ticket-earn paths — confidence mechanic replaces the XP/task system.
// Each correct prediction earns 1–3 base tickets × active boost multiplier.
function ticketEarnPathsFor(poolKey) {
  return [
    { action: "Correct prediction · 50–64% confidence", note: "Low confidence",           tickets: 1 },
    { action: "Correct prediction · 65–79% confidence", note: "Medium confidence",         tickets: 2 },
    { action: "Correct prediction · 80–100% confidence", note: "High confidence — bold call", tickets: 3 },
  ];
}

// ─── YESTERDAY WIN REVEAL — the dopamine moment ────────
// Shown once on return visit (next session after a pool closes).
// Two flavors: WON or DIDN'T WIN — both pivot to "today's pool is open".
const DailyRewardModal = ({ data, onClose, onSeeToday }) => {
  // ── Pre-launch: no draws have happened yet ────────────────
  if (data.preLaunch) {
    return (
      <div className="overlay" style={{
        background: "radial-gradient(80% 60% at 50% 30%, rgba(93,237,165,0.18), transparent 70%), linear-gradient(180deg, #0D1A24 0%, #0A0E1C 100%)",
        zIndex: 400, padding: "32px 24px",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ display: "flex", justifyContent: "flex-end", position: "relative", zIndex: 2 }}>
          <button className="btn" onClick={onClose} style={{
            width: 36, height: 36, borderRadius: 999,
            background: "rgba(255,255,255,0.08)", border: "1px solid var(--line-soft)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="x" size={16} />
          </button>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 2 }}>
          {/* Trophy icon */}
          <div style={{
            width: 80, height: 80, borderRadius: "50%", marginBottom: 24,
            background: "radial-gradient(circle, rgba(93,237,165,0.2), rgba(93,237,165,0.05))",
            border: "1px solid rgba(93,237,165,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 21h8M12 17v4M7 4H4a2 2 0 0 0-2 2v1c0 2.2 1.5 4 3.5 4.5M17 4h3a2 2 0 0 1 2 2v1c0 2.2-1.5 4-3.5 4.5"/>
              <path d="M7 4a5 5 0 0 0 10 0H7z"/>
            </svg>
          </div>

          <div className="eyebrow" style={{ color: "var(--teal)", marginBottom: 12 }}>$20,000 USDT prize pool</div>
          <div className="h-big" style={{ fontSize: 28, marginBottom: 16, lineHeight: 1.15 }}>
            First prizes on{"\n"}
            <span style={{ color: "var(--teal)" }}>{data.firstDrawLabel}</span>
          </div>
          <div style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 28 }}>
            Matches kick off <b style={{ color: "var(--text)" }}>Jun 11</b>. Winners from Day 1 are announced the next morning. Predict today to stack your raffle tickets before the first draw.
          </div>

          {/* Prize ladder teaser */}
          <div style={{
            width: "100%",
            borderRadius: 18,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--line-soft)",
            overflow: "hidden", marginBottom: 28,
          }}>
            {[
              { label: "Daily raffles",   prize: "$80",    color: "#FF9F1C", sub: "17 draws · 5 winners each" },
              { label: "Group raffles",   prize: "$60",    color: "#22D3EE", sub: "10 groups · drawn at stage end" },
              { label: "Final Mega",      prize: "$1,000", color: "#5DEDA5", sub: "5 winners × $1,000 each · Jul 19" },
            ].map((row, i, arr) => (
              <div key={row.label} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom: i < arr.length - 1 ? "1px solid var(--line-soft)" : "none",
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{row.label}</div>
                  <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>{row.sub}</div>
                </div>
                <div className="num" style={{ fontFamily: "var(--display)", fontSize: 20, color: row.color }}>
                  {row.prize}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" onClick={onSeeToday} style={{ position: "relative", zIndex: 2 }}>
          Start predicting →
        </button>
      </div>
    );
  }

  // ── Post-draw: won or lost ────────────────────────────────
  const won = data.youWon;
  return (
    <div className="overlay" style={{
      background: won
        ? "radial-gradient(80% 60% at 50% 30%, rgba(93,237,165,0.30), transparent 70%), linear-gradient(180deg, #0E1A14 0%, #0A0E1C 100%)"
        : "radial-gradient(80% 60% at 50% 30%, rgba(255,159,28,0.20), transparent 70%), linear-gradient(180deg, #1A1428 0%, #0A0E1C 100%)",
      zIndex: 400, padding: "32px 24px",
      display: "flex", flexDirection: "column",
    }}>
      {won && <Confetti />}

      <div style={{ display: "flex", justifyContent: "flex-end", position: "relative", zIndex: 2 }}>
        <button className="btn" onClick={onClose} style={{
          width: 36, height: 36, borderRadius: 999,
          background: "rgba(255,255,255,0.08)", border: "1px solid var(--line-soft)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name="x" size={16} />
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center", position: "relative", zIndex: 2 }}>
        <div className="eyebrow" style={{ color: won ? "var(--teal)" : "var(--orange)", marginBottom: 14, justifyContent: "center", display: "flex" }}>
          ⚡ {data.dateLabel} · Daily pool closed
        </div>

        {won ? (
          <>
            <div className="h-big" style={{ fontSize: 28, marginBottom: 18, color: "var(--text)" }}>
              You won
            </div>
            <div style={{
              display: "inline-flex", alignItems: "baseline", justifyContent: "center", gap: 12,
              padding: "16px 32px", marginBottom: 22,
              borderRadius: 24,
              background: "linear-gradient(135deg, rgba(93,237,165,0.20), rgba(255,214,10,0.10))",
              border: "1px solid rgba(93,237,165,0.4)",
              boxShadow: "0 8px 32px rgba(93,237,165,0.25)",
              alignSelf: "center",
            }}>
              <div className="token-shimmer num" style={{ fontFamily: "var(--display)", fontSize: 72, lineHeight: 0.9 }}>
                ${data.prizeAmount}
              </div>
              <div style={{ fontFamily: "var(--display)", fontSize: 18, color: "var(--teal)" }}>USDT</div>
            </div>
            <div style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 22, lineHeight: 1.5 }}>
              Drawn from <b className="num" style={{ color: "var(--text)" }}>{data.totalTickets.toLocaleString()}</b> tickets —
              <br/>your <b style={{ color: "var(--orange)" }} className="num">{data.yourTickets} tickets</b> hit the {METHOD_TOKENS[data.method].label.toLowerCase()} draw.
            </div>
          </>
        ) : (
          <>
            <div className="h-big" style={{ fontSize: 28, marginBottom: 12, color: "var(--text)" }}>
              So close.
            </div>
            <div style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 22, lineHeight: 1.5, maxWidth: 320, alignSelf: "center" }}>
              Your <b className="num" style={{ color: "var(--orange)" }}>{data.yourTickets} tickets</b> entered yesterday's draw of
              {" "}<b className="num">{data.totalTickets.toLocaleString()}</b> — five winners drawn, you weren't one of them this time.
            </div>
            <div style={{
              display: "flex", justifyContent: "center", gap: 24, marginBottom: 22,
              padding: "16px 24px",
              borderRadius: 18,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--line-soft)",
              alignSelf: "center",
            }}>
              <Stat label="Your tickets" value={data.yourTickets} accent="var(--orange)" />
              <Stat label="Total tickets" value={data.totalTickets.toLocaleString()} />
              <Stat label="Winners" value={data.totalWinners} accent="var(--teal)" />
            </div>
          </>
        )}

        <div style={{
          padding: "14px 18px", borderRadius: 14,
          background: "rgba(255,159,28,0.08)",
          border: "1px solid rgba(255,159,28,0.3)",
          maxWidth: 340, alignSelf: "center",
          textAlign: "left", display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: "var(--orange)", color: "#0A0E1C",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="bolt" size={20} stroke={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Today's pool is live</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
              <b className="num" style={{ color: "var(--gold)" }}>$6,800</b> · closes in {TODAY_POOL.closesInHours}h · {TODAY_POOL.matches} matches
            </div>
          </div>
        </div>
      </div>

      <button className="btn btn-primary" onClick={onSeeToday} style={{ position: "relative", zIndex: 2 }}>
        {won ? "Claim & enter today's pool" : "Enter today's pool"} →
      </button>
    </div>
  );
};

const Stat = ({ label, value, accent = "var(--text)" }) => (
  <div style={{ textAlign: "center" }}>
    <div className="num" style={{ fontFamily: "var(--display)", fontSize: 20, color: accent, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 10, color: "var(--text-faint)", letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 4 }}>{label}</div>
  </div>
);

// ─── TICKET EARNED TOAST ───────────────────────────────
// Small bottom-card animation: "+1 ticket" when a Thrill action lands.
const TicketEarnedToast = ({ tickets, action, onDismiss }) => {
  React.useEffect(() => {
    const t = setTimeout(onDismiss, 2800);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, bottom: 96,
      display: "flex", justifyContent: "center", pointerEvents: "none",
      zIndex: 300,
      animation: "pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 18px",
        borderRadius: 999,
        background: "linear-gradient(135deg, #1A2038, #232844)",
        border: "1px solid rgba(255,159,28,0.5)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 24px rgba(255,159,28,0.3)",
      }}>
        <TicketGlyph size={18} color="var(--orange)" />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
            +{tickets} raffle ticket{tickets > 1 ? "s" : ""}
          </div>
          <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{action}</div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, {
  DailyPoolCard, PoolsScreen, DailyRewardModal, TicketEarnedToast,
  TicketGlyph, Confetti,
});
