// ─── BRACKET ─────────────────────────────────────────────
const BracketScreen = ({ state, actions }) => {
  const { predictions } = state;
  const [activeStage, setActiveStage] = React.useState("groups");
  const stage = STAGES.find(s => s.key === activeStage);

  return (
    <>
      <ScreenHeader
        eyebrow="WC 2026 · 48 teams"
        title="The Bracket"
        right={<StatusPills energy={state.energy} tokens={state.tokens}
          boost={state.boost} onBoostClick={actions.openBoostHub} />}
      />

      {/* stage tabs (scrollable) */}
      <div style={{ padding: "0 14px 14px", overflowX: "auto", marginBottom: 4 }}>
        <div style={{ display: "flex", gap: 6, padding: "0 6px" }}>
          {STAGES.map(s => {
            const active = s.key === activeStage;
            const predictedInStage = s.matches.filter(m => predictions[m.id]).length;
            return (
              <button key={s.key} className="btn"
                onClick={() => setActiveStage(s.key)}
                style={{
                  height: 38, padding: "0 14px", borderRadius: 999,
                  background: active ? "var(--teal)" : "var(--card)",
                  color: active ? "#0A0E1C" : "var(--text-dim)",
                  border: active ? "1px solid var(--teal)" : "1px solid var(--line-soft)",
                  fontFamily: "var(--display)", fontSize: 13,
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  display: "flex", alignItems: "center", gap: 8,
                  flexShrink: 0,
                }}>
                <span>{s.short}</span>
                <span style={{
                  fontSize: 10, fontFamily: "var(--body)", fontWeight: 700,
                  padding: "2px 7px", borderRadius: 999,
                  background: active ? "rgba(10,14,28,0.18)" : "rgba(255,255,255,0.08)",
                  color: active ? "#0A0E1C" : "var(--text-dim)",
                }}>{predictedInStage}/{s.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* mini bracket tree */}
      <div style={{ padding: "0 20px 14px" }}>
        <MiniTree predictions={predictions} activeStage={activeStage} onSelect={setActiveStage} />
      </div>

      {/* content */}
      {activeStage === "groups" ? (
        <GroupsView predictions={predictions} actions={actions} />
      ) : (
        <KnockoutView stage={stage} predictions={predictions} actions={actions} />
      )}
    </>
  );
};

// ─── MINI TREE (visual progress dots) ──────────────────────
const MiniTree = ({ predictions, activeStage, onSelect }) => {
  const stages = STAGES;
  return (
    <div style={{
      background: "var(--card)", border: "1px solid var(--line-soft)",
      borderRadius: 16, padding: "14px 16px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {stages.map((s, i) => {
          const done = s.matches.filter(m => predictions[m.id]).length;
          const total = s.matches.length;
          const pct = total > 0 ? done / total : 0;
          const active = s.key === activeStage;
          const isFinal = s.key === "final";
          return (
            <React.Fragment key={s.key}>
              <button className="btn"
                onClick={() => onSelect(s.key)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  padding: 0,
                }}>
                <div style={{
                  width: isFinal ? 28 : 22, height: isFinal ? 28 : 22, borderRadius: "50%",
                  background: isFinal
                    ? "linear-gradient(135deg, #FFD60A, #FF9F1C)"
                    : (pct === 1 ? "var(--teal)" : "transparent"),
                  border: `2px solid ${
                    isFinal ? "#FFD60A"
                    : (active ? "var(--teal)"
                    : pct > 0 ? "var(--teal)"
                    : "rgba(255,255,255,0.15)")}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 800, color: pct === 1 ? "#0A0E1C" : "var(--text-dim)",
                  boxShadow: active ? "0 0 0 4px rgba(93,237,165,0.18)" : "none",
                  transition: "all 0.2s",
                }}>{done}</div>
                <div style={{
                  fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700,
                  color: active ? "var(--text)" : "var(--text-faint)",
                }}>{s.short}</div>
              </button>
              {i < stages.length - 1 && (
                <div style={{
                  flex: 1, height: 2, margin: "0 4px",
                  background: pct === 1 ? "var(--teal)" : "rgba(255,255,255,0.1)",
                  marginBottom: 18,
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// ─── GROUPS VIEW ─────────────────────────────────────────
const GroupsView = ({ predictions, actions }) => {
  const [expanded, setExpanded] = React.useState("A");
  return (
    <div style={{ padding: "0 14px", display: "flex", flexDirection: "column", gap: 10 }}>
      {Object.entries(GROUPS).map(([gKey, teamCodes]) => {
        const matches = groupMatches.filter(m => m.group === gKey);
        const isOpen = expanded === gKey;
        const predictedCount = matches.filter(m => predictions[m.id]).length;
        return (
          <div key={gKey} style={{
            background: "var(--card)",
            border: "1px solid var(--line-soft)",
            borderRadius: 18,
            overflow: "hidden",
          }}>
            <button className="btn"
              onClick={() => setExpanded(isOpen ? null : gKey)}
              style={{
                width: "100%", textAlign: "left", padding: "14px 16px",
                display: "flex", alignItems: "center", gap: 12,
              }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: "linear-gradient(135deg, rgba(93,237,165,0.2), rgba(93,237,165,0.06))",
                border: "1px solid rgba(93,237,165,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--display)", fontSize: 22, color: "var(--teal)",
              }}>{gKey}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: "var(--text-faint)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>
                  Group {gKey}
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {teamCodes.map(c => (
                    <div key={c} className="flag" style={{ fontSize: 18, lineHeight: 1 }}>{TEAMS[c]?.flag}</div>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="num" style={{ fontFamily: "var(--display)", fontSize: 16, color: predictedCount === 6 ? "var(--teal)" : "var(--text)" }}>
                  {predictedCount}<span style={{ color: "var(--text-faint)", fontSize: 13 }}>/6</span>
                </div>
                <div style={{ fontSize: 9, color: "var(--text-faint)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, marginTop: 2 }}>picks</div>
              </div>
              <Icon name={isOpen ? "chevronDown" : "chevron"} size={16} color="var(--text-faint)" />
            </button>

            {isOpen && (
              <div style={{ padding: "0 14px 14px" }}>
                {/* standings table */}
                <div style={{ background: "rgba(0,0,0,0.18)", borderRadius: 12, padding: "10px 12px", marginBottom: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "18px 1fr 24px 24px 24px 32px", gap: 6, fontSize: 9, color: "var(--text-faint)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>
                    <span>#</span><span>Team</span><span style={{ textAlign: "center" }}>P</span><span style={{ textAlign: "center" }}>W</span><span style={{ textAlign: "center" }}>D</span><span style={{ textAlign: "right" }}>Pts</span>
                  </div>
                  {teamCodes.map((c, i) => (
                    <div key={c} style={{
                      display: "grid", gridTemplateColumns: "18px 1fr 24px 24px 24px 32px", gap: 6,
                      alignItems: "center",
                      padding: "6px 0",
                      borderTop: i > 0 ? "1px solid var(--line-soft)" : "none",
                      fontSize: 12,
                    }}>
                      <span className="num" style={{ color: i < 2 ? "var(--teal)" : "var(--text-faint)", fontWeight: 700 }}>{i + 1}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                        <span className="flag" style={{ fontSize: 14, lineHeight: 1, flexShrink: 0 }}>{TEAMS[c]?.flag}</span>
                        <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{TEAMS[c]?.short}</span>
                      </div>
                      <span className="num" style={{ textAlign: "center", color: "var(--text-dim)" }}>0</span>
                      <span className="num" style={{ textAlign: "center", color: "var(--text-dim)" }}>0</span>
                      <span className="num" style={{ textAlign: "center", color: "var(--text-dim)" }}>0</span>
                      <span className="num" style={{ textAlign: "right", fontFamily: "var(--display)", fontSize: 14 }}>0</span>
                    </div>
                  ))}
                </div>

                {/* matches by matchday */}
                {[1, 2, 3].map(md => {
                  const mdMatches = matches.filter(m => m.matchday === md);
                  return (
                    <div key={md} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 10, color: "var(--text-faint)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>
                        Matchday {md}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {mdMatches.map(m => (
                          <MatchCard key={m.id} match={m} pick={predictions[m.id]}
                            onPredict={() => actions.openPredict(m.id)} dense />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── KNOCKOUT VIEW (list per round) ──────────────────────
const KnockoutView = ({ stage, predictions, actions }) => {
  return (
    <div style={{ padding: "0 14px", display: "flex", flexDirection: "column", gap: 10 }}>
      {stage.key !== "groups" && (
        <div className="card" style={{
          padding: "14px 16px",
          background: "rgba(255,255,255,0.025)",
          border: "1px dashed rgba(255,255,255,0.12)",
          display: "flex", gap: 12, alignItems: "flex-start",
        }}>
          <Icon name="lock" size={18} color="var(--text-faint)" />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{stage.label} matchups · TBD</div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.45 }}>
              {stage.key === "r32"
                ? <>R32 dates and venues are confirmed, but participating teams depend on group standings. Predictions open after the First Stage finishes.</>
                : <>Matchups, venues and kickoff times are <b style={{ color: "var(--text)" }}>TBD</b> until earlier rounds resolve.</>}
            </div>
          </div>
        </div>
      )}

      {stage.matches.map((match, i) => (
        <MatchCard
          key={match.id}
          match={match}
          pick={predictions[match.id]}
          onPredict={() => actions.openPredict(match.id)}
          index={i}
        />
      ))}
    </div>
  );
};

// ─── Time-zone chip row ──────────────────────────────────
const TZRow = ({ times, dense }) => {
  if (!times) return null;
  const labels = [
    ["local", "LOCAL"],
    ["mex",   "MEX"],
    ["arg",   "ARG"],
    ["esp",   "ESP"],
  ];
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
      gap: 6,
      marginTop: dense ? 8 : 10,
    }}>
      {labels.map(([k, l]) => (
        <div key={k} style={{
          background: "rgba(0,0,0,0.18)",
          borderRadius: 8,
          padding: dense ? "5px 6px" : "6px 8px",
          textAlign: "center",
          border: "1px solid var(--line-soft)",
        }}>
          <div style={{
            fontSize: 9, color: "var(--text-faint)",
            letterSpacing: "0.1em", textTransform: "uppercase",
            fontWeight: 700, marginBottom: 1,
          }}>{l}</div>
          <div className="num" style={{
            fontFamily: "var(--display)", fontSize: dense ? 12 : 13,
            color: k === "local" ? "var(--teal)" : "var(--text)",
            letterSpacing: "0.01em",
          }}>{times[k]}</div>
        </div>
      ))}
    </div>
  );
};

// ─── TeamCell — handles both real teams and TBD slots ────
const TeamCell = ({ slot, picked, side = "home" }) => {
  const t = teamOrSlot(slot);
  if (!t.resolved) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 12px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.02)",
        border: "1px dashed rgba(255,255,255,0.12)",
        opacity: 0.7,
      }}>
        <div style={{
          width: 26, height: 26, borderRadius: 8, flexShrink: 0,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name="lock" size={12} color="var(--text-faint)" />
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="h-md" style={{ fontSize: 13, color: "var(--text-dim)" }}>TBD</div>
          <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 2, letterSpacing: "0.04em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.slot}</div>
        </div>
      </div>
    );
  }
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 12px",
      borderRadius: 12,
      background: picked ? "rgba(93,237,165,0.15)" : "rgba(255,255,255,0.03)",
      border: picked ? "1px solid var(--teal)" : "1px solid transparent",
    }}>
      <div className="flag" style={{ fontSize: 26, lineHeight: 1 }}>{t.flag}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="h-md" style={{ fontSize: 15 }}>{t.short}</div>
        <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
      </div>
    </div>
  );
};

// ─── MATCH CARD (unified for groups + knockouts) ─────────
const MatchCard = ({ match, pick, onPredict, index, dense }) => {
  const home = teamOrSlot(match.home);
  const away = teamOrSlot(match.away);
  const teamsResolved = home.resolved && away.resolved;
  const isTBD = !!match.tbd || (!match.date && !match.venue);
  const cantPredict = isTBD || !teamsResolved;
  const isPicked = !!pick;
  const venue = match.venue ? VENUES[match.venue] : null;
  const stageInfo = STAGES.find(s => s.key === match.stage);

  return (
    <div style={{
      background: isPicked
        ? "linear-gradient(180deg, rgba(93,237,165,0.10), rgba(93,237,165,0.02))"
        : "var(--card)",
      border: `1px solid ${isPicked ? "rgba(93,237,165,0.35)" : "var(--line-soft)"}`,
      borderRadius: 16, padding: dense ? 12 : 14,
      opacity: isTBD ? 0.85 : 1,
    }}>
      {/* header — match meta */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: dense ? 10 : 12, gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: "var(--text-faint)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, minWidth: 0 }}>
          <span style={{ whiteSpace: "nowrap" }}>
            {match.group ? `Group ${match.group} · MD${match.matchday}` : (stageInfo?.short || "")}
          </span>
          <span style={{ color: "rgba(255,255,255,0.18)" }}>·</span>
          <span style={{ whiteSpace: "nowrap", color: match.date ? "var(--text-dim)" : "var(--text-faint)" }}>{fmtDate(match.date)}</span>
        </div>
        {isPicked && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--teal)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", flexShrink: 0 }}>
            <Icon name="check" size={13} stroke={2.5} /> LOCKED
          </div>
        )}
      </div>

      {/* teams */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <TeamCell slot={match.home} picked={pick === (home.resolved ? home.short : null)} />
        <TeamCell slot={match.away} picked={pick === (away.resolved ? away.short : null)} />
      </div>

      {/* venue */}
      {venue ? (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          marginTop: dense ? 10 : 12,
          fontSize: 11, color: "var(--text-dim)",
        }}>
          <Icon name="target" size={12} color="var(--text-faint)" />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            <b style={{ color: "var(--text)" }}>{venue.name}</b>
            <span style={{ color: "var(--text-faint)" }}> · {venue.city}, {venue.country}</span>
          </span>
        </div>
      ) : (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          marginTop: dense ? 10 : 12,
          fontSize: 11, color: "var(--text-faint)",
        }}>
          <Icon name="target" size={12} color="var(--text-faint)" />
          <span>Venue · <b style={{ color: "var(--text-dim)" }}>TBD</b></span>
        </div>
      )}

      {/* times in 4 timezones */}
      {match.times ? <TZRow times={match.times} dense={dense} /> : (
        <div style={{
          marginTop: dense ? 8 : 10,
          padding: "8px 10px",
          background: "rgba(0,0,0,0.18)",
          border: "1px dashed rgba(255,255,255,0.10)",
          borderRadius: 8,
          fontSize: 11, color: "var(--text-faint)",
          textAlign: "center", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700,
        }}>
          Kickoff times · TBD
        </div>
      )}

      {/* CTA — Predict + Bet stacked */}
      <button className="btn" onClick={onPredict} disabled={cantPredict}
        style={{
          marginTop: dense ? 10 : 12, width: "100%", height: 36, borderRadius: 10,
          background: cantPredict ? "rgba(255,255,255,0.03)" : (isPicked ? "transparent" : "rgba(93,237,165,0.12)"),
          border: cantPredict ? "1px dashed rgba(255,255,255,0.10)"
            : (isPicked ? "1px solid var(--line-soft)" : "1px solid rgba(93,237,165,0.3)"),
          color: cantPredict ? "var(--text-faint)" : (isPicked ? "var(--text-dim)" : "var(--teal)"),
          fontFamily: "var(--display)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase",
          cursor: cantPredict ? "not-allowed" : "pointer",
        }}>
        {cantPredict
          ? (isTBD ? "Awaiting earlier rounds" : "Teams locked — Predict later")
          : (isPicked ? "Change pick" : "Predict winner →")}
      </button>

      {/* External bet link — only show when matchup is known */}
      {teamsResolved && !isTBD && (
        <a
          href={matchBettingURL(match)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => { e.stopPropagation(); window.__recordThrillVisit?.(); }}
          style={{
            marginTop: 6,
            width: "100%", height: 32, borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            background: "linear-gradient(135deg, rgba(255,159,28,0.14), rgba(255,77,103,0.10))",
            border: "1px solid rgba(255,159,28,0.3)",
            color: "var(--orange)",
            fontFamily: "var(--display)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase",
            textDecoration: "none",
          }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12c2 4 5 7 9 7s7-3 9-7c-2-4-5-7-9-7s-7 3-9 7z" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
          Bet on Thrill <Icon name="arrow" size={11} stroke={2.5} />
        </a>
      )}
    </div>
  );
};

// ─── PREDICT MODAL ────────────────────────────────────────
const PredictModal = ({ matchId, state, actions, onClose }) => {
  const match = ALL_MATCHES.find(m => m.id === matchId);
  if (!match) return null;
  const home = teamOrSlot(match.home), away = teamOrSlot(match.away);
  const { predictions, energy, freePicksLeft, energyPerPick } = state;
  const currentPick = predictions[matchId];
  const [pick, setPick] = React.useState(currentPick || null);
  const [confidence, setConfidence] = React.useState(60);
  const stageLabel = STAGES.find(s => s.key === match.stage)?.label || "Match";
  const venue = match.venue ? VENUES[match.venue] : null;

  const isFree = freePicksLeft > 0 || !!currentPick;
  const cost = isFree ? 0 : energyPerPick;
  const canConfirm = pick && home.resolved && away.resolved && (isFree || energy >= cost);

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div className="eyebrow" style={{ whiteSpace: "nowrap" }}>{stageLabel}{match.group ? ` · Group ${match.group}` : ""}</div>
            <div className="h-lg" style={{ marginTop: 4 }}>
              {home.resolved ? home.short : "TBD"} vs {away.resolved ? away.short : "TBD"}
            </div>
          </div>
          <button className="btn" onClick={onClose} style={{
            width: 36, height: 36, borderRadius: 999,
            background: "var(--card)", border: "1px solid var(--line-soft)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Icon name="x" size={18} color="var(--text-dim)" />
          </button>
        </div>

        {/* date + venue strip */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12, fontSize: 12, color: "var(--text-dim)", flexWrap: "wrap" }}>
          <div className="chip"><span className="num">{fmtDate(match.date)}</span></div>
          {venue && <div className="chip">{venue.name}</div>}
          {venue && <div className="chip">{venue.city}, {venue.country}</div>}
        </div>

        {/* Times across zones */}
        {match.times && (
          <div style={{ marginBottom: 18 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Kickoff times</div>
            <TZRow times={match.times} />
          </div>
        )}

        {/* Team picks (only if resolved) */}
        {(home.resolved && away.resolved) ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
            {[home, away].map((t) => {
              const selected = pick === t.short;
              return (
                <button key={t.short} className="btn" onClick={() => setPick(t.short)} style={{
                  padding: "20px 14px",
                  borderRadius: 18,
                  background: selected
                    ? "linear-gradient(180deg, rgba(93,237,165,0.22), rgba(93,237,165,0.06))"
                    : "var(--card)",
                  border: `2px solid ${selected ? "var(--teal)" : "var(--line-soft)"}`,
                  boxShadow: selected ? "0 8px 24px var(--teal-glow)" : "none",
                  transition: "all 0.15s",
                  textAlign: "center",
                }}>
                  <div className="flag" style={{ fontSize: 56, lineHeight: 1, marginBottom: 10 }}>{t.flag}</div>
                  <div className="h-md">{t.short}</div>
                  <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 4 }}>{t.name}</div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="card" style={{
            padding: "22px 18px", marginBottom: 18,
            display: "flex", gap: 12, alignItems: "center",
            background: "rgba(255,255,255,0.025)",
            border: "1px dashed rgba(255,255,255,0.12)",
          }}>
            <Icon name="lock" size={22} color="var(--text-faint)" />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Teams to be determined</div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.4 }}>
                This match depends on results from <b style={{ color: "var(--text)" }}>{home.slot}</b> and <b style={{ color: "var(--text)" }}>{away.slot}</b>. Predictions open once those are locked in.
              </div>
            </div>
          </div>
        )}

        {/* Confidence */}
        {(home.resolved && away.resolved) && (
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div className="eyebrow">Confidence boost</div>
              <div className="num" style={{ fontFamily: "var(--display)", fontSize: 18 }}>{confidence}%</div>
            </div>
            <input type="range" min="50" max="100" value={confidence}
              onChange={e => setConfidence(+e.target.value)}
              style={{
                width: "100%", appearance: "none", height: 6, borderRadius: 3,
                background: `linear-gradient(90deg, var(--teal) ${(confidence - 50) * 2}%, rgba(255,255,255,0.1) ${(confidence - 50) * 2}%)`,
                outline: "none",
              }} />
            <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 8, lineHeight: 1.4 }}>
              Higher confidence = bigger point multiplier if you win.
            </div>
          </div>
        )}

        {/* Cost summary */}
        {(home.resolved && away.resolved) && (
          <div className="card" style={{ padding: "14px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, color: "var(--text-faint)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, marginBottom: 4, whiteSpace: "nowrap" }}>
                {isFree ? (currentPick ? "Changing pick" : "Free pick") : "Cost"}
              </div>
              <div className="h-md num" style={{ color: isFree ? "var(--teal)" : "var(--orange)", whiteSpace: "nowrap" }}>
                {isFree ? "FREE" : `−${cost} ⚡`}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 4 }}>Balance</div>
              <div className="num" style={{ fontFamily: "var(--display)", fontSize: 18, color: energy >= cost ? "var(--text)" : "var(--red)", display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                <BoltIcon size={14} color="#FF9F1C" /> {energy}
              </div>
            </div>
          </div>
        )}

        {!state.boostFirstFlow && <BoostThisPickInline state={state} actions={actions} />}

        <button
          className="btn btn-primary"
          disabled={!canConfirm}
          onClick={() => actions.confirmPick(matchId, pick, cost)}
        >
          {!home.resolved || !away.resolved ? "Awaiting matchup" : (pick ? `Lock in ${pick}` : "Pick a team")}
        </button>

        {/* External Thrill betting CTA */}
        {home.resolved && away.resolved && (
          <a
            href={matchBettingURL(match)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => window.__recordThrillVisit?.()}
            style={{
              marginTop: 10, width: "100%", height: 48, borderRadius: 14,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: "linear-gradient(135deg, rgba(255,159,28,0.18), rgba(255,77,103,0.12))",
              border: "1px solid rgba(255,159,28,0.35)",
              color: "var(--orange)",
              fontFamily: "var(--display)", fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase",
              textDecoration: "none",
            }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12c2 4 5 7 9 7s7-3 9-7c-2-4-5-7-9-7s-7 3-9 7z" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
            Place a real bet on Thrill <Icon name="arrow" size={14} stroke={2.5} />
          </a>
        )}

        {!isFree && (home.resolved && away.resolved) && energy < cost && (
          <button className="btn" onClick={() => actions.goto("tasks", { closeModal: true })} style={{
            marginTop: 10, width: "100%", height: 44,
            color: "var(--orange)", fontSize: 13, fontWeight: 700,
            letterSpacing: "0.06em", textTransform: "uppercase",
          }}>
            ⚡ Earn more energy →
          </button>
        )}
      </div>
    </div>
  );
};

// ─── RESULT (post-pick celebration) ───────────────────────
const PickResultModal = ({ teamCode, freeUsed, onClose }) => {
  const team = Object.values(TEAMS).find(t => t.short === teamCode);
  if (!team) return null;
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ textAlign: "center", paddingBottom: 28 }}>
        <div className="modal-handle" />

        <div style={{ position: "relative", margin: "10px auto 18px", width: 130, height: 130 }}>
          <div style={{
            position: "absolute", inset: -30, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(93,237,165,0.5), transparent 60%)",
            filter: "blur(18px)",
          }} />
          <div style={{
            position: "relative", width: "100%", height: "100%",
            borderRadius: "50%", background: "linear-gradient(135deg, var(--teal), var(--teal-d))",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 12px 36px var(--teal-glow)",
          }}>
            <div className="flag" style={{ fontSize: 64, lineHeight: 1 }}>{team.flag}</div>
          </div>
        </div>

        <div className="eyebrow" style={{ marginBottom: 8 }}>Pick locked</div>
        <div className="h-big" style={{ marginBottom: 12 }}>{team.short}<br/>FTW</div>
        <div style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 22, padding: "0 12px" }}>
          You called <b style={{ color: "var(--text)" }}>{team.name}</b> to win.
          {freeUsed ? " Free pick used." : ""} You'll see the result after the final whistle.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontSize: 10, color: "var(--text-faint)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>If correct</div>
            <div className="h-md num" style={{ color: "var(--teal)" }}>+100 PTS</div>
          </div>
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontSize: 10, color: "var(--text-faint)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Streak bonus</div>
            <div className="h-md num token-shimmer">+15</div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={onClose}>Done</button>
      </div>
    </div>
  );
};

Object.assign(window, { BracketScreen, PredictModal, PickResultModal });
