// ─── HOW TO WIN — CURRENT MECHANICS ──────────────────────
const HowToWinModal = ({ onClose }) => (
  <div className="modal" onClick={onClose} data-screen-label="how-to-win">
    <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: "94%" }}>
      <div className="modal-handle" />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
        <div>
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
        background: "radial-gradient(80% 60% at 100% 0%, rgba(93,237,165,0.18), transparent 60%), linear-gradient(135deg, #1A2038, #131829)",
        border: "1px solid rgba(93,237,165,0.28)",
      }}>
        <div className="eyebrow" style={{ color: "var(--teal)", marginBottom: 8 }}>1 · Tickets, not points</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 6, lineHeight: 1.35 }}>
          Every prize is a <span style={{ color: "var(--teal)" }}>raffle</span>.
        </div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.6 }}>
          You don't need to be the best predictor — just earn enough raffle tickets to have a shot. Predict matches correctly to earn tickets. The more tickets you hold in a pool when it closes, the better your odds of being drawn as a winner.
        </div>
      </div>

      {/* §2 — Energy & predictions */}
      <div className="eyebrow muted" style={{ marginBottom: 8 }}>2 · Energy powers your predictions</div>
      <div style={{
        background: "rgba(0,0,0,0.20)", border: "1px solid var(--line-soft)",
        borderRadius: 14, overflow: "hidden", marginBottom: 16,
      }}>
        {[
          { icon: <BoltIcon size={14} color="#FF9F1C" />, bg: "rgba(255,159,28,0.12)", border: "rgba(255,159,28,0.35)",
            label: "Each prediction costs", value: "−10 ⚡", valueColor: "var(--orange)" },
          { icon: <Icon name="people" size={14} color="#FF9F1C" />, bg: "rgba(255,159,28,0.12)", border: "rgba(255,159,28,0.35)",
            label: "Invite a friend", sub: "They join → you earn", value: "+30 ⚡", valueColor: "var(--orange)" },
          { icon: <BoltIcon size={14} color="#FF9F1C" />, bg: "rgba(255,159,28,0.08)", border: "rgba(255,159,28,0.2)",
            label: "Register on Thrill", sub: "One-time bonus", value: "+30 ⚡", valueColor: "var(--orange)" },
          { icon: <Icon name="telegram" size={14} color="#22D3EE" />, bg: "rgba(34,211,238,0.1)", border: "rgba(34,211,238,0.25)",
            label: "Join channel + connect wallet", sub: "+10 ⚡ each · one-time", value: "+20 ⚡", valueColor: "#22D3EE" },
          { icon: <Icon name="wheel" size={14} color="#FFD60A" />, bg: "rgba(255,214,10,0.1)", border: "rgba(255,214,10,0.25)",
            label: "Daily spin wheel", sub: "Once every 24 hours", value: "1–50 ⚡", valueColor: "var(--gold)" },
        ].map((r, i, arr) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "11px 14px",
            borderBottom: i < arr.length - 1 ? "1px solid var(--line-soft)" : "none",
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: r.bg, border: `1px solid ${r.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{r.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{r.label}</div>
              {r.sub && <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 2 }}>{r.sub}</div>}
            </div>
            <div className="num" style={{ fontFamily: "var(--display)", fontSize: 15, color: r.valueColor, whiteSpace: "nowrap" }}>
              {r.value}
            </div>
          </div>
        ))}
      </div>

      {/* §3 — Confidence → tickets */}
      <div className="eyebrow muted" style={{ marginBottom: 8 }}>3 · Confidence multiplies your tickets</div>
      <div style={{
        padding: "14px 16px", marginBottom: 16,
        borderRadius: 14,
        background: "rgba(93,237,165,0.07)", border: "1px solid rgba(93,237,165,0.25)",
      }}>
        <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.55, marginBottom: 12 }}>
          When you make a prediction, slide the confidence bar to bet on your pick. If you're correct, your confidence level determines how many tickets you earn:
        </div>
        <div style={{
          background: "rgba(0,0,0,0.25)", borderRadius: 10, overflow: "hidden",
          border: "1px solid var(--line-soft)",
        }}>
          {[
            { range: "50–64%", label: "Low", tickets: 1, color: "var(--text-faint)" },
            { range: "65–79%", label: "Medium", tickets: 2, color: "var(--teal)" },
            { range: "80–100%", label: "High", tickets: 3, color: "var(--teal)" },
          ].map((t, i, arr) => (
            <div key={t.range} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
              borderBottom: i < arr.length - 1 ? "1px solid var(--line-soft)" : "none",
            }}>
              <div className="num" style={{ fontFamily: "var(--display)", fontSize: 14, color: t.color, width: 60 }}>{t.range}</div>
              <div style={{ flex: 1, fontSize: 12, color: "var(--text-dim)" }}>{t.label} confidence</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <TicketGlyph size={13} color={t.tickets > 1 ? "var(--teal)" : "var(--text-faint)"} />
                <span className="num" style={{ fontFamily: "var(--display)", fontSize: 16, color: t.tickets > 1 ? "var(--teal)" : "var(--text-faint)" }}>
                  ×{t.tickets}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 8, lineHeight: 1.5 }}>
          Wrong prediction = 0 tickets regardless of confidence. No penalty.
        </div>
      </div>

      {/* §4 — Deposit boost */}
      <div style={{
        padding: "14px 16px", marginBottom: 16,
        borderRadius: 14,
        background: "rgba(255,77,103,0.07)", border: "1px dashed rgba(255,77,103,0.30)",
      }}>
        <div className="eyebrow" style={{ color: "#FF4D67", marginBottom: 8 }}>4 · Deposits multiply every ticket</div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.55, marginBottom: 10 }}>
          Deposit on Thrill Casino to unlock a multiplier that applies to <b style={{ color: "var(--text)" }}>every correct prediction</b> for the rest of the campaign.
        </div>
        <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 10, overflow: "hidden", border: "1px solid var(--line-soft)" }}>
          {BOOST_TIERS.filter(t => t.min > 0).map((t, i, arr) => (
            <div key={t.label} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
              borderBottom: i < arr.length - 1 ? "1px solid var(--line-soft)" : "none",
            }}>
              <span className="num" style={{ fontFamily: "var(--display)", fontSize: 13, color: t.color, width: 40 }}>${t.min}</span>
              <span style={{ flex: 1, fontSize: 11, color: "var(--text-dim)" }}>deposit unlocks</span>
              <span className="num" style={{ fontFamily: "var(--display)", fontSize: 14, color: t.color, whiteSpace: "nowrap" }}>{t.label} per ticket</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 8 }}>
          Example: correct pick at 80% confidence + $20 deposit = <b className="num" style={{ color: "var(--text)" }}>3 × 5 = 15 tickets</b>
        </div>
      </div>

      {/* §5 — Seven raffles */}
      <div className="eyebrow muted" style={{ marginBottom: 8 }}>5 · Seven raffles · $20,000 total</div>
      <div style={{
        background: "rgba(0,0,0,0.20)", border: "1px solid var(--line-soft)",
        borderRadius: 14, overflow: "hidden", marginBottom: 16,
      }}>
        {POOL_LAYERS.map((p, i, arr) => (
          <div key={p.key} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
            borderBottom: i < arr.length - 1 ? "1px solid var(--line-soft)" : "none",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: `${p.color}22`, border: `1px solid ${p.color}55`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--display)", fontSize: 13, color: p.color,
            }}>{p.short[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{p.label}</div>
              <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 2 }}>
                {p.units * p.winnersPerUnit} winners · {p.units} {p.unitLabel}{p.units === 1 ? "" : "s"}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="num" style={{ fontFamily: "var(--display)", fontSize: 15, color: p.color }}>${p.totalBudget.toLocaleString()}</div>
              <div style={{ fontSize: 9, color: "var(--text-faint)", letterSpacing: "0.06em" }}>USDT</div>
            </div>
          </div>
        ))}
      </div>

      {/* §6 — Payout */}
      <div style={{
        padding: "12px 14px", marginBottom: 18,
        borderRadius: 12,
        background: "rgba(93,237,165,0.06)", border: "1px solid rgba(93,237,165,0.22)",
        fontSize: 12, color: "var(--text-dim)", lineHeight: 1.6,
      }}>
        <b style={{ color: "var(--teal)" }}>6 · Getting paid</b>
        <br/>
        Daily winners drawn the next morning. Group raffles draw at the end of the group stage. Knockout raffles draw after each round advances. The <b style={{ color: "var(--text)" }}>Final Mega Raffle</b> draws on <span className="num" style={{ color: "var(--text)" }}>Jul 19</span>.
        Prizes land straight in your <b style={{ color: "var(--teal)" }}>TON wallet</b> — connect one before the campaign ends.
      </div>

      <div style={{ fontSize: 11, color: "var(--text-faint)", textAlign: "center", lineHeight: 1.5, paddingBottom: 4 }}>
        All draws use a stored seed hash + public ticket list — fully auditable.
      </div>

      <button className="btn btn-primary" onClick={onClose} style={{ marginTop: 16 }}>Got it</button>
    </div>
  </div>
);

Object.assign(window, { HowToWinModal });
