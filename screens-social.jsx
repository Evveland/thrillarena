// ─── LEADERBOARD ──────────────────────────────────────────
const LeaderboardScreen = ({ state, actions }) => {
  const [scope, setScope] = React.useState("global");
  // Use live data from Supabase (loaded in app.jsx, passed via state)
  const liveBoard  = state.leaderboard || [];
  const podium     = liveBoard.slice(0, 3);
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
        right={<StatusPills energy={state.energy}
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

      {/* Live rankings */}
      <div style={{ padding: "0 20px" }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          {liveBoard.length > 0 ? `Top ${liveBoard.length} players` : "Rankings"}
        </div>

        {liveBoard.length === 0 ? (
          /* ── Empty state – day 1 ── */
          <div style={{
            padding: "32px 20px", textAlign: "center",
            borderRadius: 18, background: "rgba(255,255,255,0.03)",
            border: "1px dashed var(--line-soft)",
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🏆</div>
            <div className="h-md" style={{ marginBottom: 8 }}>No rankings yet</div>
            <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5, maxWidth: 260, margin: "0 auto 20px" }}>
              Be the first to predict! Rankings appear once players start making picks.
            </div>
            <button className="btn btn-primary" onClick={() => actions.goto("bracket")}
              style={{ fontSize: 13 }}>
              Start predicting →
            </button>
          </div>
        ) : (
          <div className="card" style={{ padding: 4 }}>
            {liveBoard.map((u, i, arr) => {
              const isYou = state.dbUser?.id === u.id;
              const initial = (u.display_name || u.username || "?")[0].toUpperCase();
              const avatarColors = ["#FF9F1C","#FF4D67","#5DEDA5","#A78BFA","#22D3EE","#FFD60A","#F472B6","#10B981"];
              const color = avatarColors[i % avatarColors.length];
              return (
                <div key={u.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px",
                  borderBottom: i < arr.length - 1 ? "1px solid var(--line-soft)" : "none",
                  background: isYou ? "linear-gradient(90deg, rgba(93,237,165,0.12), rgba(93,237,165,0.02))" : "transparent",
                  borderRadius: isYou ? 14 : 0,
                }}>
                  <div className="num" style={{ width: 22, color: Number(u.rank) <= 3 ? "var(--gold)" : "var(--text-faint)", fontWeight: 700, fontSize: 13 }}>
                    {u.rank}
                  </div>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: color, color: "#0A0E1C",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--display)", fontSize: 16,
                    border: isYou ? "2px solid var(--teal)" : "none",
                  }}>{initial}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: isYou ? "var(--teal)" : "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {u.username ? `@${u.username}` : (u.display_name || "Player")}
                      </span>
                      {isYou && <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 999, background: "rgba(93,237,165,0.2)", color: "var(--teal)", letterSpacing: "0.06em", flexShrink: 0 }}>YOU</span>}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>
                      {u.total_predictions} pick{u.total_predictions !== 1 ? "s" : ""} made
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                      <TicketGlyph size={13} color="var(--orange)" />
                      <span className="num" style={{ fontFamily: "var(--display)", fontSize: 18, color: "var(--orange)" }}>
                        {Number(u.total_tickets).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-faint)", letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 2 }}>
                      tickets
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
  const { energy, predictions, wallet, channelJoined, invitesSent, notifPrefs } = state;
  const totalPicks   = Object.keys(predictions || {}).length;
  const isConnected  = !!wallet;

  // Real user data
  const tg           = window.Telegram?.WebApp?.initDataUnsafe?.user || {};
  const username     = state.dbUser?.username    || tg.username    || null;
  const displayName  = state.dbUser?.display_name|| tg.first_name  || "Predictor";
  const label        = username ? `@${username}` : displayName;
  const initial      = (displayName || username || "?")[0].toUpperCase();
  const joinedDate   = state.dbUser?.created_at
    ? new Date(state.dbUser.created_at).toLocaleDateString("en", { month: "short", year: "numeric" })
    : "Jun 2026";

  // Stats from leaderboard
  const myEntry      = (state.leaderboard || []).find(u => u.id === state.dbUser?.id);
  const myRank       = myEntry ? `#${myEntry.rank}` : "—";
  const myTickets    = myEntry ? Number(myEntry.total_tickets) : 0;
  const myCorrect    = myEntry ? Number(myEntry.correct_predictions || 0) : 0;
  const accuracy     = totalPicks > 0 && myCorrect > 0
    ? Math.round((myCorrect / totalPicks) * 100) : 0;

  return (
    <>
      <ScreenHeader
        eyebrow="My Profile"
        title={label}
        right={
          <button className="btn" onClick={actions.openNotifyOptIn} style={{
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
          background: "linear-gradient(135deg, var(--teal), #3fcb85)",
          color: "#0A0E1C",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--display)", fontSize: 36,
          boxShadow: "0 8px 24px var(--teal-glow)",
        }}>{initial}</div>
        <div style={{ flex: 1 }}>
          <div className="h-md">{displayName}</div>
          <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>Joined {joinedDate}</div>
          <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {myRank !== "—" && <span className="chip teal">Rank {myRank}</span>}
            <span className="chip">{energy} ⚡</span>
            {state.dbUser?.telegram_id && (
              <span className="chip" style={{ fontSize: 10, color: "var(--text-faint)" }}>
                ID {state.dbUser.telegram_id}
              </span>
            )}
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
              <div className="h-big token-shimmer num">{myTickets.toLocaleString()}</div>
              <div style={{ fontFamily: "var(--display)", fontSize: 18, color: "var(--teal)" }}>tickets</div>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 10 }}>
              Total raffle tickets · Payout date: <span className="num" style={{ color: "var(--teal)" }}>Jul 19</span>
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
            <a
              href="https://thrill.com/deposit"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none", width: "100%" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2 L4 14 H10 L9 22 L20 9 H13 L15 2 Z" fill="currentColor" strokeWidth="0"/>
              </svg>
              Deposit on Thrill — multiply your tickets
            </a>
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
                    Connect your TON wallet to receive prize payouts on Jul 19.
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
          <StatBig label="Picks made" value={`${totalPicks}/${ALL_MATCHES.length}`} sub="6 stages" />
          <StatBig label="Accuracy" value={accuracy > 0 ? `${accuracy}%` : "—"} sub={`${myCorrect} correct`} accent="var(--teal)" />
          <StatBig label="Tickets" value={myTickets.toLocaleString()} sub="across all raffles" accent="var(--orange)" />
          <StatBig label="Referrals" value={invitesSent || 0} sub={`+${(invitesSent || 0) * 30} ⚡ earned`} />
        </div>
      </div>

      {/* boost status */}
      {state.boost?.multiplier > 1 && (
        <div style={{ padding: "0 20px 16px" }}>
          <button className="btn" onClick={actions.openBoostHub} style={{
            width: "100%", textAlign: "left", padding: "14px 16px",
            borderRadius: 16, background: "rgba(255,77,103,0.08)",
            border: "1px solid rgba(255,77,103,0.3)", display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{ flex: 1 }}>
              <div className="eyebrow" style={{ color: "#FF4D67", marginBottom: 4 }}>Active boost</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{fmtMult(state.boost.multiplier)} ticket multiplier</div>
              <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>Applies to every correct prediction</div>
            </div>
            <div style={{ fontFamily: "var(--display)", fontSize: 28, color: "#FF4D67" }}>{fmtMult(state.boost.multiplier)}</div>
          </button>
        </div>
      )}
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
