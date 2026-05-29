// ─── LEADERBOARD ──────────────────────────────────────────
const LeaderboardScreen = ({ state, actions }) => {
  const [scope, setScope] = React.useState("global");
  const podium = LEADERBOARD.slice(0, 3);
  const TICKETS_BY_KEY = {
    daily:  state.dailyTickets || 0,
    group:  state.groupTickets || 0,
    r32:    state.r32Tickets   || 0,
    r16:    state.r16Tickets   || 0,
    qf:     state.qfTickets    || 0,
    sf:     state.sfTickets    || 0,
    final:  state.finalTickets || 0,
  };
  const totalTickets = Object.values(TICKETS_BY_KEY).reduce((a, b) => a + b, 0);

  return (
    <>
      <ScreenHeader
        eyebrow="XP rankings · social board"
        title="Leaderboard"
        right={<StatusPills energy={state.energy} tokens={state.tokens}
          boost={state.boost} onBoostClick={actions.openBoostHub} />}
      />

      {/* scope toggle */}
      <div style={{ padding: "0 20px 16px" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          background: "var(--card)", border: "1px solid var(--line-soft)",
          borderRadius: 12, padding: 4, gap: 2,
        }}>
          {["global", "friends", "country"].map(s => {
            const active = s === scope;
            return (
              <button key={s} className="btn" onClick={() => setScope(s)}
                style={{
                  height: 34, borderRadius: 9,
                  background: active ? "var(--teal)" : "transparent",
                  color: active ? "#0A0E1C" : "var(--text-dim)",
                  fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                }}>
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ GLOBAL VIEW ═══ */}
      {scope === "global" && <>
      {/* ─── PRIZE POOL HEADER ─────────────────────────── */}
      <div style={{ padding: "0 20px 14px" }}>
        <div style={{
          padding: "16px 20px",
          borderRadius: 18,
          background: `
            radial-gradient(120% 80% at 100% 0%, rgba(93,237,165,0.22), transparent 60%),
            linear-gradient(135deg, #232844, #1A2038)`,
          border: "1px solid rgba(93,237,165,0.3)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div className="eyebrow" style={{ color: "var(--teal)", marginBottom: 4, whiteSpace: "nowrap" }}>Prize pool</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <div className="h-xl token-shimmer num">20,000</div>
              <div style={{ fontFamily: "var(--display)", fontSize: 16, color: "var(--teal)" }}>USDT</div>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 4, whiteSpace: "nowrap" }}>Payout Jul 19 · TON wallet</div>
          </div>
          <TokenCoin size={56} />
        </div>
      </div>

      {/* ─── YOUR RAFFLE STACK ────────────────────────── */}
      <div style={{ padding: "0 20px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <div className="eyebrow">Your raffle stack</div>
          <button className="btn" onClick={() => actions.openHowToWin()}
            style={{ fontSize: 11, color: "var(--teal)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
            How to win <Icon name="info" size={13} />
          </button>
        </div>
        <div className="card" style={{ padding: 4 }}>
          {POOL_LAYERS.map((p, i) => {
            const tickets = TICKETS_BY_KEY[p.key] ?? 0;
            const has = tickets > 0;
            return (
              <div key={p.key} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "11px 14px",
                borderBottom: i < POOL_LAYERS.length - 1 ? "1px solid var(--line-soft)" : "none",
                background: has ? `linear-gradient(90deg, ${p.color}10, transparent 60%)` : "transparent",
                borderRadius: has ? 12 : 0,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  background: `${p.color}22`,
                  border: `1px solid ${p.color}55`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--display)", fontSize: 13, color: p.color,
                }}>{p.short[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{p.label}</div>
                  <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 2, letterSpacing: "0.04em" }}>
                    Pool <span className="num">${p.totalBudget.toLocaleString()}</span> · {p.units * p.winnersPerUnit} winner slots
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "3px 8px", borderRadius: 999,
                    background: has ? `${p.color}22` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${has ? p.color + "66" : "var(--line-soft)"}`,
                  }}>
                    <TicketGlyph size={11} color={has ? p.color : "var(--text-faint)"} />
                    <span className="num" style={{
                      fontFamily: "var(--display)", fontSize: 14,
                      color: has ? p.color : "var(--text-faint)",
                    }}>{tickets}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{
          marginTop: 10, padding: "10px 12px", borderRadius: 10,
          background: "rgba(93,237,165,0.06)",
          border: "1px dashed rgba(93,237,165,0.20)",
          fontSize: 11, color: "var(--text-dim)", lineHeight: 1.45,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <TicketGlyph size={13} color="var(--teal)" />
          <span>
            <b className="num" style={{ color: "var(--text)" }}>{totalTickets}</b> tickets total ·
            ranking below is XP for bragging rights — winners are drawn by raffle.
          </span>
        </div>
      </div>

      {/* podium */}
      <div style={{ padding: "8px 20px 16px" }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Live podium</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr 1fr", gap: 8, alignItems: "end" }}>
          <PodiumStep user={podium[1]} place={2} height={120} color="#C0C0C0" />
          <PodiumStep user={podium[0]} place={1} height={150} color="#FFD60A" />
          <PodiumStep user={podium[2]} place={3} height={100} color="#CD7F32" />
        </div>
      </div>

      {/* full list */}
      <div style={{ padding: "0 20px" }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Rank · 4 → 10</div>
        <div className="card" style={{ padding: 4 }}>
          {LEADERBOARD.slice(3).map((u, i, arr) => (
            <div key={u.rank} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 14px",
              borderBottom: i < arr.length - 1 ? "1px solid var(--line-soft)" : "none",
              background: u.you ? "linear-gradient(90deg, rgba(93,237,165,0.12), rgba(93,237,165,0.02))" : "transparent",
              borderRadius: u.you ? 14 : 0,
            }}>
              <div className="num" style={{ width: 22, color: "var(--text-faint)", fontWeight: 700, fontSize: 13 }}>
                {u.rank}
              </div>
              <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                background: u.color, color: "#0A0E1C",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--display)", fontSize: 16,
                border: u.you ? "2px solid var(--teal)" : "none",
              }}>{u.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 14, fontWeight: 700,
                  color: u.you ? "var(--teal)" : "var(--text)",
                  display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap",
                }}>
                  <span>{u.name}</span>
                  <MultiplierBadge mult={u.mult} />
                  {u.you && <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 999, background: "rgba(93,237,165,0.2)", color: "var(--teal)", letterSpacing: "0.06em" }}>YOU</span>}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>
                  {u.score >= 1200 ? "🔥 Hot streak" : "Climbing"}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="num" style={{ fontFamily: "var(--display)", fontSize: 18 }}>
                  {u.score.toLocaleString()}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-faint)", letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 2 }}>
                  pts
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </>}

      {/* ═══ FRIENDS VIEW ═══ */}
      {scope === "friends" && <FriendsView state={state} actions={actions} onOpenScoring={() => actions.openHowToWin()} />}

      {/* ═══ COUNTRY VIEW ═══ */}
      {scope === "country" && <CountryView state={state} actions={actions} onOpenScoring={() => actions.openHowToWin()} />}
    </>
  );
};

// ─── FRIENDS LEADERBOARD ──────────────────────────────────
const FriendsView = ({ state, actions, onOpenScoring }) => {
  const you = FRIENDS.find(f => f.you);
  const ahead = FRIENDS.filter(f => f.score > (you?.score || 0));
  const behind = FRIENDS.filter(f => f.score < (you?.score || 0));

  return (
    <>
      {/* Friends summary card */}
      <div style={{ padding: "0 20px 14px" }}>
        <div style={{
          padding: "18px 20px",
          borderRadius: 22,
          background: `
            radial-gradient(120% 80% at 100% 0%, rgba(93,237,165,0.22), transparent 60%),
            linear-gradient(135deg, #232844, #1A2038)`,
          border: "1px solid rgba(93,237,165,0.3)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div className="eyebrow" style={{ color: "var(--teal)", marginBottom: 4, whiteSpace: "nowrap" }}>Among friends</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <div className="h-xl num">#{you?.rank ?? "—"}</div>
                <div style={{ fontSize: 13, color: "var(--text-faint)" }}>of {FRIENDS.length}</div>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 4, whiteSpace: "nowrap" }}>
                {ahead.length === 0 ? "🥇 You're leading" : `${ahead.length} ahead · ${behind.length} chasing`}
              </div>
            </div>

            {/* invite CTA */}
            <button className="btn" onClick={() => actions.goto("tasks")} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              padding: "10px 14px", borderRadius: 14,
              background: "rgba(255,159,28,0.14)",
              border: "1px solid rgba(255,159,28,0.35)",
              color: "var(--orange)",
            }}>
              <Icon name="plus" size={20} color="var(--orange)" stroke={2.5} />
              <span style={{ fontSize: 9, letterSpacing: "0.1em", fontWeight: 700, textTransform: "uppercase" }}>Invite</span>
            </button>
          </div>

          {/* Per-friend bonus reminder */}
          <div style={{
            display: "flex", gap: 10, alignItems: "center",
            padding: "10px 12px",
            background: "rgba(0,0,0,0.18)",
            border: "1px dashed rgba(255,159,28,0.25)",
            borderRadius: 10,
            fontSize: 11, color: "var(--text-dim)",
          }}>
            <BoltIcon size={14} color="#FF9F1C" />
            <span><b style={{ color: "var(--orange)" }}>+30 ⚡</b> energy for each friend you bring in</span>
          </div>
        </div>
      </div>

      {/* Heading + scoring link */}
      <div style={{ padding: "0 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div className="eyebrow">Friend rankings</div>
        <button className="btn" onClick={onOpenScoring}
          style={{ fontSize: 11, color: "var(--teal)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
          How to win <Icon name="info" size={13} />
        </button>
      </div>

      {/* Friends list */}
      <div style={{ padding: "0 20px 14px" }}>
        <div className="card" style={{ padding: 4 }}>
          {FRIENDS.map((f, i) => (
            <div key={f.name} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 14px",
              borderBottom: i < FRIENDS.length - 1 ? "1px solid var(--line-soft)" : "none",
              background: f.you ? "linear-gradient(90deg, rgba(93,237,165,0.14), rgba(93,237,165,0.02))" : "transparent",
              borderRadius: f.you ? 14 : 0,
              border: f.you ? "1px solid rgba(93,237,165,0.4)" : "none",
            }}>
              <div className="num" style={{ width: 22, color: f.rank <= 3 ? "var(--gold)" : "var(--text-faint)", fontWeight: 700, fontSize: 13 }}>
                {f.rank}
              </div>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 12,
                  background: f.color, color: "#0A0E1C",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--display)", fontSize: 18,
                  border: f.you ? "2px solid var(--teal)" : "none",
                }}>{f.avatar}</div>
                {/* online dot */}
                <div style={{
                  position: "absolute", right: -2, bottom: -2,
                  width: 12, height: 12, borderRadius: "50%",
                  background: f.online ? "#5DEDA5" : "#3A4159",
                  border: "2px solid #131829",
                }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: f.you ? "var(--teal)" : "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                  <MultiplierBadge mult={f.mult} />
                  {f.you && (
                    <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 999, background: "var(--teal)", color: "#0A0E1C", letterSpacing: "0.08em", fontWeight: 800, flexShrink: 0 }}>YOU</span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="flag" style={{ fontSize: 12, lineHeight: 1 }}>{TEAMS[f.country]?.flag || ""}</span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {f.online ? "Online · " : ""}{f.relation || "you"}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="num" style={{ fontFamily: "var(--display)", fontSize: 18 }}>
                  {f.score.toLocaleString()}
                </div>
                <div style={{ fontSize: 9, color: "var(--text-faint)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2, fontWeight: 700 }}>pts</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Big invite CTA */}
      <div style={{ padding: "0 20px 8px" }}>
        <button className="btn" onClick={() => actions.goto("tasks")} style={{
          width: "100%", padding: "14px 16px",
          borderRadius: 16,
          background: "linear-gradient(135deg, rgba(255,159,28,0.20), rgba(255,77,103,0.10))",
          border: "1px dashed rgba(255,159,28,0.35)",
          display: "flex", alignItems: "center", gap: 14, textAlign: "left",
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: "rgba(255,159,28,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="people" size={22} color="var(--orange)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Bring more friends → climb faster</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Both you and your invitee earn ⚡30 on signup.</div>
          </div>
          <Icon name="arrow" size={18} color="var(--orange)" stroke={2.5} />
        </button>
      </div>
    </>
  );
};

// ─── COUNTRY LEADERBOARD ──────────────────────────────────
const CountryView = ({ state, actions, onOpenScoring }) => {
  const sorted = [...COUNTRIES].sort((a, b) => b.totalScore - a.totalScore);
  const yourCountryIdx = sorted.findIndex(c => c.code === YOUR_COUNTRY);
  const yourCountry = sorted[yourCountryIdx];
  const yourRank = yourCountryIdx + 1;

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return (
    <>
      {/* Your country header */}
      <div style={{ padding: "0 20px 14px" }}>
        <div style={{
          padding: "18px 20px",
          borderRadius: 22,
          background: `
            radial-gradient(120% 80% at 100% 0%, rgba(93,237,165,0.22), transparent 60%),
            linear-gradient(135deg, #232844, #1A2038)`,
          border: "1px solid rgba(93,237,165,0.3)",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div className="flag" style={{ fontSize: 56, lineHeight: 1 }}>{yourCountry.flag}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eyebrow" style={{ color: "var(--teal)", marginBottom: 4 }}>You're playing for</div>
            <div className="h-lg" style={{ marginBottom: 6 }}>{yourCountry.name}</div>
            <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--text-faint)" }}>
              <span>Rank <b className="num" style={{ color: "var(--teal)" }}>#{yourRank}</b></span>
              <span>·</span>
              <span><b className="num" style={{ color: "var(--text)" }}>{yourCountry.players.toLocaleString()}</b> players</span>
            </div>
          </div>
        </div>
      </div>

      {/* Heading + scoring link */}
      <div style={{ padding: "0 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div className="eyebrow">Top nations</div>
        <button className="btn" onClick={onOpenScoring}
          style={{ fontSize: 11, color: "var(--teal)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
          How to win <Icon name="info" size={13} />
        </button>
      </div>

      {/* Top 3 medal cards */}
      <div style={{ padding: "0 20px 14px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {top3.map((c, i) => {
          const colors = ["#FFD60A", "#C0C0C0", "#CD7F32"];
          const isYou = c.code === YOUR_COUNTRY;
          return (
            <div key={c.code} style={{
              padding: "14px 8px", borderRadius: 16,
              background: isYou ? "rgba(93,237,165,0.08)" : "var(--card)",
              border: `1px solid ${isYou ? "rgba(93,237,165,0.4)" : `${colors[i]}55`}`,
              textAlign: "center",
              position: "relative",
            }}>
              <div style={{
                position: "absolute", top: 8, right: 8,
                fontFamily: "var(--display)", fontSize: 11,
                color: colors[i], letterSpacing: "0.04em",
              }}>{i + 1}</div>
              {isYou && (
                <div style={{
                  position: "absolute", top: 8, left: 8,
                  fontSize: 8, padding: "2px 5px", borderRadius: 999,
                  background: "var(--teal)", color: "#0A0E1C",
                  letterSpacing: "0.08em", fontWeight: 800,
                }}>YOU</div>
              )}
              <div className="flag" style={{ fontSize: 30, lineHeight: 1, marginBottom: 8, marginTop: 8 }}>{c.flag}</div>
              <div style={{
                fontSize: 11, fontWeight: 800, marginBottom: 4,
                color: isYou ? "var(--teal)" : "var(--text)",
              }}>{c.code}</div>
              <div className="num" style={{ fontFamily: "var(--display)", fontSize: 14, color: colors[i] }}>
                {(c.totalScore / 1e6).toFixed(1)}M
              </div>
              <div style={{ fontSize: 9, color: "var(--text-faint)", letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 2, fontWeight: 700 }}>
                pts total
              </div>
            </div>
          );
        })}
      </div>

      {/* Full country list */}
      <div style={{ padding: "0 20px 14px" }}>
        <div className="card" style={{ padding: 4 }}>
          {rest.map((c, i) => {
            const rank = i + 4;
            const isYou = c.code === YOUR_COUNTRY;
            const pctOfLeader = c.totalScore / sorted[0].totalScore;
            return (
              <div key={c.code} style={{
                padding: "12px 14px",
                borderBottom: i < rest.length - 1 ? "1px solid var(--line-soft)" : "none",
                background: isYou ? "linear-gradient(90deg, rgba(93,237,165,0.14), rgba(93,237,165,0.02))" : "transparent",
                borderRadius: isYou ? 14 : 0,
                border: isYou ? "1px solid rgba(93,237,165,0.4)" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="num" style={{ width: 18, color: "var(--text-faint)", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{rank}</div>
                  <div className="flag" style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{c.flag}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: isYou ? "var(--teal)" : "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                      {isYou && (
                        <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 999, background: "var(--teal)", color: "#0A0E1C", letterSpacing: "0.08em", fontWeight: 800, flexShrink: 0 }}>YOU</span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <span className="num">{c.players.toLocaleString()}</span> · avg <span className="num">{c.avgScore.toLocaleString()}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div className="num" style={{ fontFamily: "var(--display)", fontSize: 15 }}>
                      {(c.totalScore / 1e6).toFixed(1)}M
                    </div>
                    <div style={{ fontSize: 9, color: "var(--text-faint)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2, fontWeight: 700 }}>pts</div>
                  </div>
                </div>
                {/* progress bar vs leader */}
                <div style={{ marginTop: 8, marginLeft: 28, height: 3, background: "rgba(255,255,255,0.04)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${pctOfLeader * 100}%`,
                    background: isYou ? "var(--teal)" : "rgba(255,255,255,0.18)",
                    borderRadius: 2,
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

// ─── SCORING BREAKDOWN SHEET ──────────────────────────────
const ScoringSheet = ({ onClose }) => {
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div className="eyebrow" style={{ whiteSpace: "nowrap" }}>How you win</div>
            <div className="h-lg" style={{ marginTop: 4 }}>Score → Rank → USDT</div>
          </div>
          <button className="btn" onClick={onClose} style={{
            width: 36, height: 36, borderRadius: 999,
            background: "var(--card)", border: "1px solid var(--line-soft)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Icon name="x" size={18} color="var(--text-dim)" />
          </button>
        </div>

        {/* 3-step flow */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
          <FlowStep n="1" title="Predict every match"
            body="Pick the winner for all 104 matches across 6 stages. First 2 picks are free, then ⚡10 each." />
          <FlowStep n="2" title="Earn points per correct pick"
            body="Points scale with stage — later rounds are worth more. Underdog calls earn bonus." />
          <FlowStep n="3" title="Climb tiers & win USDT"
            body="Your final score sets your rank. Each rank tier earns a fixed slice of the 20,000 USDT pool, paid out Jul 19 to your TON wallet." />
        </div>

        {/* Scoring table */}
        <div className="eyebrow" style={{ marginBottom: 8 }}>Points per correct pick</div>
        <div className="card" style={{ padding: 4, marginBottom: 18 }}>
          {SCORING.map((row, i) => (
            <div key={row.stage} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 14px",
              borderBottom: i < SCORING.length - 1 ? "1px solid var(--line-soft)" : "none",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: "linear-gradient(135deg, rgba(93,237,165,0.18), rgba(93,237,165,0.04))",
                border: "1px solid rgba(93,237,165,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--display)", fontSize: 13, color: "var(--teal)",
                letterSpacing: "0.04em",
              }}>{STAGES.find(s => s.key === row.stage)?.short || ""}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{row.label}</div>
                <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>{row.bonus}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="num" style={{
                  fontFamily: "var(--display)", fontSize: 18, color: "var(--teal)",
                }}>+{row.pts}</div>
                <div style={{ fontSize: 9, color: "var(--text-faint)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2, fontWeight: 700 }}>pts</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tiebreaker tip */}
        <div className="card" style={{
          padding: "14px 16px",
          background: "rgba(255,159,28,0.05)",
          border: "1px dashed rgba(255,159,28,0.25)",
          display: "flex", gap: 12, alignItems: "flex-start",
          marginBottom: 18,
        }}>
          <Icon name="info" size={16} color="var(--orange)" />
          <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5 }}>
            <b style={{ color: "var(--text)" }}>Champion tiebreaker:</b> lock the eventual winner before the QF for a <b style={{ color: "var(--orange)" }}>2× multiplier</b> on your total.
          </div>
        </div>

        <button className="btn btn-primary" onClick={onClose}>Got it</button>
      </div>
    </div>
  );
};

const FlowStep = ({ n, title, body }) => (
  <div style={{
    display: "flex", gap: 14, alignItems: "flex-start",
    padding: "14px 16px",
    background: "var(--card)",
    border: "1px solid var(--line-soft)",
    borderRadius: 16,
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: 10, flexShrink: 0,
      background: "var(--teal)", color: "#0A0E1C",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--display)", fontSize: 16,
    }}>{n}</div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.45 }}>{body}</div>
    </div>
  </div>
);

const PodiumStep = ({ user, place, height, color }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{
      width: 56, height: 56, borderRadius: 16, margin: "0 auto 8px",
      background: user.color, color: "#0A0E1C",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--display)", fontSize: 26,
      border: `2px solid ${color}`,
      boxShadow: `0 6px 16px ${color}55`,
    }}>{user.avatar}</div>
    <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 2, color: "var(--text)" }}>{user.name}</div>
    <div className="num" style={{ fontFamily: "var(--display)", fontSize: 14, color: color, marginBottom: 4 }}>
      {user.score.toLocaleString()}
    </div>
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 8, minHeight: 14 }}>
      <MultiplierBadge mult={user.mult || 1} />
    </div>
    <div style={{
      height, borderRadius: "12px 12px 0 0",
      background: `linear-gradient(180deg, ${color} 0%, ${color}40 100%)`,
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      paddingTop: 12,
      fontFamily: "var(--display)", fontSize: 32,
      color: "#0A0E1C",
      position: "relative",
      boxShadow: `inset 0 -8px 0 rgba(0,0,0,0.15)`,
    }}>
      {place}
    </div>
  </div>
);

// ─── PROFILE / WALLET ─────────────────────────────────────
const ProfileScreen = ({ state, actions }) => {
  const { energy, tokens, predictions, wallet, channelJoined, invitesSent, notifPrefs } = state;
  const totalPicks = Object.keys(predictions).length;
  const accuracy = totalPicks > 0 ? 100 : 0;
  const isConnected = !!wallet;

  return (
    <>
      <ScreenHeader
        eyebrow="Profile · Wallet"
        title="@you"
        right={
          <button className="btn"
            onClick={() => actions.goto && actions.openWalletConnect && null}
            style={{
              width: 40, height: 40, borderRadius: 999,
              background: "var(--card)", border: "1px solid var(--line-soft)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
            <Icon name="settings" size={20} color="var(--text-dim)" />
          </button>
        }
      />

      {/* identity */}
      <div style={{ padding: "0 20px 16px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 22,
          background: "linear-gradient(135deg, var(--teal), var(--teal-d))",
          color: "#0A0E1C",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--display)", fontSize: 36,
          boxShadow: "0 8px 24px var(--teal-glow)",
        }}>Y</div>
        <div style={{ flex: 1 }}>
          <div className="h-md">Rookie predictor</div>
          <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>Telegram · Joined Jun 2026</div>
          <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
            <span className="chip teal">🔥 Day 3</span>
            <span className="chip">Rank #8</span>
          </div>
        </div>
      </div>

      {/* wallet */}
      <div style={{ padding: "0 20px 16px" }}>
        {isConnected ? (
          <div style={{
            borderRadius: 22, overflow: "hidden",
            background: `
              radial-gradient(120% 80% at 100% 0%, rgba(93,237,165,0.22), transparent 60%),
              radial-gradient(60% 60% at 0% 100%, rgba(255,159,28,0.10), transparent 60%),
              linear-gradient(135deg, #232844, #131829)`,
            border: "1px solid rgba(93,237,165,0.3)",
            padding: 22,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div className="eyebrow" style={{ color: "var(--teal)", whiteSpace: "nowrap" }}>USDT Wallet</div>
              <div className="chip" style={{ background: "rgba(93,237,165,0.12)", border: "1px solid rgba(93,237,165,0.3)", color: "var(--teal)" }}>
                <Icon name="check" size={11} stroke={3} /> {wallet.name}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
              <div className="h-big token-shimmer num">{tokens.toLocaleString()}</div>
              <div style={{ fontFamily: "var(--display)", fontSize: 18, color: "var(--teal)" }}>USDT</div>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 10 }}>
              Reserved · Payout: <span className="num" style={{ color: "var(--teal)" }}>Jul 19</span>
            </div>
            {/* TON address chip */}
            <div style={{
              marginBottom: 16, padding: "6px 10px",
              background: "rgba(0,0,0,0.3)", border: "1px solid var(--line-soft)",
              borderRadius: 10, display: "flex", alignItems: "center", gap: 8,
              fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-dim)",
            }}>
              <div style={{ width: 6, height: 6, borderRadius: 999, background: "var(--teal)" }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }} className="num">
                {wallet.address.slice(0, 6)}…{wallet.address.slice(-6)}
              </span>
              <span style={{ fontSize: 9, letterSpacing: "0.08em", color: "var(--text-faint)" }}>TON</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }}>Send</button>
              <button className="btn btn-ghost" style={{ flex: 1 }}>Withdraw</button>
              <button className="btn btn-ghost" style={{ flex: 1, color: "var(--teal)", borderColor: "rgba(93,237,165,0.4)" }}>Stake</button>
            </div>
          </div>
        ) : (
          // ── NOT CONNECTED — call to action ──
          <button className="btn" onClick={actions.openWalletConnect} style={{
            width: "100%", textAlign: "left", padding: 0,
            borderRadius: 22, overflow: "hidden",
            background: `
              radial-gradient(120% 80% at 100% 0%, rgba(255,214,10,0.18), transparent 60%),
              linear-gradient(135deg, #232844, #131829)`,
            border: "1px dashed rgba(255,214,10,0.35)",
          }}>
            <div style={{ padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div className="eyebrow" style={{ color: "var(--gold)", whiteSpace: "nowrap", marginBottom: 6 }}>⚠ Wallet not linked</div>
                  <div className="h-md" style={{ marginBottom: 6 }}>Connect TON to claim your prize</div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.45 }}>
                    Your <b style={{ color: "var(--text)" }}>{tokens.toLocaleString()} USDT</b> is reserved.
                    Without a wallet, the Jul 19 payout cannot reach you.
                  </div>
                </div>
                <div style={{
                  width: 56, height: 56, flexShrink: 0,
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #0098EA, #0078C2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff">
                    <path d="M5 6 L19 6 L12 20 Z" />
                  </svg>
                </div>
              </div>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 14px", borderRadius: 12,
                background: "rgba(255,159,28,0.12)",
                border: "1px solid rgba(255,159,28,0.3)",
                color: "var(--orange)",
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                  Connect now <Icon name="arrow" size={14} color="var(--orange)" stroke={2.5} />
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--display)", fontSize: 16 }}>
                  +50 <BoltIcon size={14} color="var(--orange)" />
                </span>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Account links — channel, notifications, invites */}
      <div style={{ padding: "0 20px 16px" }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Account & alerts</div>
        <div className="card" style={{ padding: 4 }}>
          <AccountRow
            icon="telegram" iconColor="#2AABEE"
            title="Telegram channel"
            sub={channelJoined ? "✓ Joined @thrill_arena" : "Not joined — verify to earn ⚡20"}
            status={channelJoined ? "on" : "off"}
            onClick={() => !channelJoined && actions.doTask("channel")}
            border={false}
          />
          <AccountRow
            icon="bolt" iconColor="#FFD60A"
            title="Push notifications"
            sub={notifPrefs.enabled
              ? `On · ${[notifPrefs.kickoff && "kickoff", notifPrefs.results && "results", notifPrefs.rank && "ranks"].filter(Boolean).join(" · ") || "all off"}`
              : "Off — turn on match reminders"}
            status={notifPrefs.enabled ? "on" : "action"}
            onClick={actions.openNotifyOptIn}
          />
          <AccountRow
            icon="people" iconColor="var(--orange)"
            title="Invite friends"
            sub={invitesSent > 0 ? `${invitesSent} sent · +${invitesSent * 30} ⚡ pending` : "Earn ⚡30 each — share your link"}
            status={invitesSent > 0 ? "on" : "action"}
            onClick={actions.openInvite}
            isLast
          />
        </div>
      </div>

      {/* stats grid */}
      <div style={{ padding: "0 20px 16px" }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Your tournament</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <StatBig label="Picks made" value={`${totalPicks}/104`} sub="6 stages · 48 teams" />
          <StatBig label="Accuracy" value={`${accuracy}%`} sub={`${totalPicks} correct`} accent="var(--teal)" />
          <StatBig label="Points" value="2,080" sub="+100 last pick" accent="var(--orange)" />
          <StatBig label="Best streak" value="3" sub="games in a row" />
        </div>
      </div>

      {/* recent picks */}
      <div style={{ padding: "0 20px" }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Recent activity</div>
        <div className="card" style={{ padding: 4 }}>
          {[
            { kind: "pick", text: "Locked Argentina vs Mexico", value: "FREE", time: "2m ago" },
            { kind: "earn", text: "Joined Telegram channel", value: "+20 ⚡", time: "8m ago" },
            { kind: "earn", text: "Daily spin reward", value: "+10 ⚡", time: "1h ago" },
            { kind: "airdrop", text: "Welcome bonus USDT", value: "+125", time: "1d ago" },
          ].map((a, i, arr) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 14px",
              borderBottom: i < arr.length - 1 ? "1px solid var(--line-soft)" : "none",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                background: a.kind === "pick" ? "rgba(93,237,165,0.15)" : a.kind === "earn" ? "rgba(255,159,28,0.15)" : "rgba(255,214,10,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {a.kind === "pick" && <Icon name="target" size={16} color="var(--teal)" />}
                {a.kind === "earn" && <BoltIcon size={16} color="#FF9F1C" />}
                {a.kind === "airdrop" && <TokenCoin size={18} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{a.text}</div>
                <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>{a.time}</div>
              </div>
              <div className="num" style={{
                fontFamily: "var(--display)", fontSize: 15,
                color: a.kind === "pick" ? "var(--teal)" : a.kind === "earn" ? "var(--orange)" : "var(--gold)",
              }}>{a.value}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const StatBig = ({ label, value, sub, accent = "var(--text)" }) => (
  <div className="card" style={{ padding: 14 }}>
    <div style={{ fontSize: 10, color: "var(--text-faint)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>{label}</div>
    <div className="h-lg num" style={{ color: accent, marginBottom: 4 }}>{value}</div>
    <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{sub}</div>
  </div>
);

// Row used in Profile › Account & alerts
const AccountRow = ({ icon, iconColor, title, sub, status, onClick, isLast }) => {
  const isOn = status === "on";
  return (
    <button className="btn" onClick={onClick} style={{
      width: "100%", textAlign: "left",
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 14px",
      background: "transparent",
      borderBottom: isLast ? "none" : "1px solid var(--line-soft)",
      borderRadius: 0,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: `${iconColor}1A`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name={icon} size={18} color={iconColor} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 11, color: isOn ? "var(--teal)" : "var(--text-faint)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</div>
      </div>
      {isOn ? (
        <div style={{
          padding: "3px 8px", borderRadius: 999,
          background: "rgba(93,237,165,0.14)",
          border: "1px solid rgba(93,237,165,0.35)",
          color: "var(--teal)",
          fontSize: 10, fontWeight: 800, letterSpacing: "0.08em",
        }}>ON</div>
      ) : (
        <Icon name="chevron" size={16} color="var(--text-faint)" />
      )}
    </button>
  );
};

Object.assign(window, { LeaderboardScreen, ProfileScreen, FriendsView, CountryView });
