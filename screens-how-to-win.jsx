// ─── HOW TO WIN — RAFFLE EXPLAINER MODAL ─────────────────
// Replaces the old "rank → tier prize" projection target. Walks the user
// through the ticket-raffle model: how to earn tickets, which pools they
// feed, what the prize draws look like, and how to maximize odds.
//
// Hooked up to the "How to win" footer link in ProjectionCard, plus the
// chevron tile on the Prize Pools screen and a Tweaks shortcut.

const HowToWinModal = ({ onClose }) => {
  return (
    <div className="modal" onClick={onClose} data-screen-label="how-to-win">
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: "94%" }}>
        <div className="modal-handle" />

        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          gap: 12, marginBottom: 18,
        }}>
          <div style={{ minWidth: 0 }}>
            <div className="eyebrow" style={{ color: "var(--teal)" }}>The mechanic</div>
            <div className="h-lg" style={{ marginTop: 4 }}>How to win</div>
          </div>
          <button className="btn" onClick={onClose} style={{
            width: 36, height: 36, borderRadius: 999, flexShrink: 0,
            background: "var(--card)", border: "1px solid var(--line-soft)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="x" size={18} color="var(--text-dim)" />
          </button>
        </div>

        {/* §1 — The big idea */}
        <div style={{
          padding: "16px 18px", marginBottom: 16,
          borderRadius: 18,
          background: `radial-gradient(80% 60% at 100% 0%, rgba(93,237,165,0.18), transparent 60%), linear-gradient(135deg, #1A2038, #131829)`,
          border: "1px solid rgba(93,237,165,0.28)",
        }}>
          <div className="eyebrow" style={{ color: "var(--teal)", marginBottom: 8 }}>1 · Tickets, not points</div>
          <div style={{ fontSize: 14, color: "var(--text)", fontWeight: 600, marginBottom: 6, lineHeight: 1.35 }}>
            Every prize is a <span style={{ color: "var(--teal)" }}>raffle</span>.
          </div>
          <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.55 }}>
            You don't need to be a top scorer. Predict matches and complete Thrill tasks → earn XP → XP converts to raffle tickets. The more tickets you hold in a pool, the better your odds when its draw closes.
          </div>
        </div>

        {/* §2 — Earn tickets table */}
        <div className="eyebrow muted" style={{ marginBottom: 8 }}>2 · Earn tickets</div>
        <div style={{
          background: "rgba(0,0,0,0.20)",
          border: "1px solid var(--line-soft)",
          borderRadius: 14, overflow: "hidden", marginBottom: 18,
        }}>
          {TICKET_RULES.map((r, i) => {
            const last = i === TICKET_RULES.length - 1;
            const noTickets = r.tickets === 0;
            return (
              <div key={r.action} style={{
                display: "grid", gridTemplateColumns: "auto 1fr auto",
                alignItems: "center", gap: 10, padding: "10px 14px",
                borderBottom: last ? "none" : "1px solid var(--line-soft)",
                opacity: noTickets ? 0.7 : 1,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: noTickets ? "rgba(255,255,255,0.04)" : "rgba(93,237,165,0.10)",
                  border: `1px solid ${noTickets ? "var(--line-soft)" : "rgba(93,237,165,0.3)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {noTickets
                    ? <Icon name="info" size={12} color="var(--text-faint)" />
                    : <TicketGlyph size={12} color="var(--teal)" />}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", lineHeight: 1.3 }}>{r.action}</div>
                  <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 2, lineHeight: 1.3 }}>
                    <span className="num">{r.xp} XP</span> · {r.note}
                  </div>
                </div>
                <div className="num" style={{
                  fontFamily: "var(--display)", fontSize: 16, whiteSpace: "nowrap",
                  color: noTickets ? "var(--text-faint)" : "var(--teal)",
                }}>
                  {noTickets ? "—" : `+${r.tickets}`}
                </div>
              </div>
            );
          })}
        </div>

        {/* §3 — Same action, multiple pools */}
        <div style={{
          padding: "14px 16px", marginBottom: 14,
          borderRadius: 14,
          background: "rgba(255,159,28,0.08)",
          border: "1px dashed rgba(255,159,28,0.30)",
        }}>
          <div className="eyebrow" style={{ color: "var(--orange)", marginBottom: 6 }}>3 · One pick · two raffles</div>
          <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.55 }}>
            A correct prediction on a group match drops a ticket into <b style={{ color: "var(--orange)" }}>BOTH</b> the Daily raffle for that game day <b style={{ color: "var(--orange)" }}>AND</b> the Group raffle.
            The same is true for every knockout round — your knockout pick feeds Daily + that round's raffle.
            <br/><br/>
            <b style={{ color: "var(--text)" }}>Predict all 12 group brackets correctly?</b> Your tickets stack across the Daily and Group raffles at the same time.
          </div>
        </div>

        {/* §3.5 — Ticket multiplier from deposits (Boost) */}
        <div style={{
          padding: "14px 16px", marginBottom: 18,
          borderRadius: 14,
          background: "rgba(255,77,103,0.08)",
          border: "1px dashed rgba(255,77,103,0.30)",
        }}>
          <div className="eyebrow" style={{ color: "#FF4D67", marginBottom: 8 }}>3.5 · Multiply your tickets — Boost</div>
          <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.55, marginBottom: 10 }}>
            Depositing on Thrill unlocks a <b style={{ color: "#FF4D67" }}>ticket multiplier</b> that applies to every action you do for the rest of the campaign — more tickets = better raffle odds across every pool.
          </div>
          <div style={{
            background: "rgba(0,0,0,0.25)",
            border: "1px solid var(--line-soft)",
            borderRadius: 10, overflow: "hidden",
          }}>
            {BOOST_TIERS.filter(t => t.min > 0).map((t, i, arr) => (
              <div key={t.label} style={{
                display: "grid", gridTemplateColumns: "auto 1fr auto",
                alignItems: "center", gap: 10, padding: "8px 12px",
                borderBottom: i < arr.length - 1 ? "1px solid var(--line-soft)" : "none",
              }}>
                <span className="num" style={{ fontFamily: "var(--display)", fontSize: 13, color: t.color, width: 36 }}>
                  ${t.min}
                </span>
                <span style={{ fontSize: 11, color: "var(--text-dim)" }}>deposit</span>
                <span className="num" style={{ fontFamily: "var(--display)", fontSize: 14, color: t.color, whiteSpace: "nowrap" }}>
                  {t.label} tickets
                </span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 8, lineHeight: 1.5 }}>
            Example: 6 correct picks in a day + <b style={{ color: "#FF4D67" }}>$500</b> deposit = <b className="num" style={{ color: "var(--text)" }}>600</b> tickets in the Daily raffle.
          </div>
        </div>

        {/* §4 — The seven raffles */}
        <div className="eyebrow muted" style={{ marginBottom: 8 }}>4 · Seven raffles · $20,000 total</div>
        <div style={{
          background: "rgba(0,0,0,0.20)",
          border: "1px solid var(--line-soft)",
          borderRadius: 14, overflow: "hidden", marginBottom: 18,
        }}>
          {POOL_LAYERS.map((p, i) => {
            const last = i === POOL_LAYERS.length - 1;
            const totalSlots = p.payouts.reduce((s, x) => s + x.slots, 0) * p.units;
            return (
              <div key={p.key} style={{
                display: "grid", gridTemplateColumns: "auto 1fr auto",
                alignItems: "center", gap: 12, padding: "10px 14px",
                borderBottom: last ? "none" : "1px solid var(--line-soft)",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: `${p.color}22`,
                  border: `1px solid ${p.color}55`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--display)", fontSize: 13, color: p.color,
                }}>{p.short[0]}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", lineHeight: 1.3 }}>{p.label}</div>
                  <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 2, lineHeight: 1.3 }}>
                    <span className="num">{totalSlots}</span> winner{totalSlots === 1 ? "" : "s"} across {p.units} {p.unitLabel}{p.units === 1 ? "" : "s"}
                  </div>
                </div>
                <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  <div className="num" style={{ fontFamily: "var(--display)", fontSize: 15, color: p.color, lineHeight: 1 }}>
                    ${p.totalBudget.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 9, color: "var(--text-faint)", marginTop: 2, letterSpacing: "0.06em" }}>USDT</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* §5 — Daily unlock */}
        <div className="eyebrow muted" style={{ marginBottom: 8 }}>5 · Unlock today's pool</div>
        <div style={{
          padding: "12px 14px", marginBottom: 16,
          borderRadius: 12,
          background: "rgba(34,211,238,0.06)",
          border: "1px solid rgba(34,211,238,0.20)",
          display: "flex", flexDirection: "column", gap: 6,
        }}>
          <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5 }}>
            Each game day, your tickets only enter the Daily raffle if you also complete the daily checklist:
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
            {[
              { n: TODAY_POOL.unlock.minPredictions, label: "prediction" },
              { n: TODAY_POOL.unlock.minThrillVisits, label: "Thrill betting page visit" },
              { n: TODAY_POOL.unlock.minThrillTasks, label: "Thrill task" },
            ].map((g, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text)" }}>
                <span style={{
                  width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                  background: "rgba(34,211,238,0.15)", border: "1px solid rgba(34,211,238,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700, color: "#22D3EE",
                  fontFamily: "var(--display)",
                }} className="num">{g.n}</span>
                <span>{g.label}{g.n === 1 ? "" : "s"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* §6 — When you win */}
        <div className="eyebrow muted" style={{ marginBottom: 8 }}>6 · If your ticket is drawn</div>
        <div style={{
          padding: "12px 14px", marginBottom: 18,
          borderRadius: 12,
          background: "rgba(93,237,165,0.06)",
          border: "1px solid rgba(93,237,165,0.22)",
          fontSize: 12, color: "var(--text-dim)", lineHeight: 1.55,
        }}>
          Daily winners are drawn at 00:00 UTC the following day. Round-stage raffles draw when the bracket advances. The Final Mega Raffle draws on <b style={{ color: "var(--text)" }} className="num">Jul 19</b>.
          Prizes route straight to your <b style={{ color: "var(--teal)" }}>TON wallet</b> — connect one before the campaign closes to avoid reissue delays.
        </div>

        {/* Fairness footer */}
        <div style={{
          fontSize: 11, color: "var(--text-faint)", lineHeight: 1.5,
          textAlign: "center", padding: "0 16px 4px",
        }}>
          All draws are reproducible from a stored seed hash + ticket list. Anti-fraud caps apply per pool — see the prize-pool rules for details.
        </div>

        <button className="btn btn-primary" onClick={onClose} style={{ marginTop: 16 }}>
          Got it
        </button>
      </div>
    </div>
  );
};

Object.assign(window, { HowToWinModal });
