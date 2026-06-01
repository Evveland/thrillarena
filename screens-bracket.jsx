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
        right={<StatusPills energy={state.energy}
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
// Team code → IANA timezone
const TEAM_TZ = {
  MEX:"America/Mexico_City", RSA:"Africa/Johannesburg", KOR:"Asia/Seoul",
  CZE:"Europe/Prague",       CAN:"America/Toronto",     BIH:"Europe/Sarajevo",
  USA:"America/New_York",    PAR:"America/Asuncion",    QAT:"Asia/Qatar",
  SUI:"Europe/Zurich",       BRA:"America/Sao_Paulo",   MAR:"Africa/Casablanca",
  HAI:"America/Port-au-Prince", SCO:"Europe/London",    GER:"Europe/Berlin",
  CUW:"America/Curacao",     NED:"Europe/Amsterdam",    JPN:"Asia/Tokyo",
  CIV:"Africa/Abidjan",      ECU:"America/Guayaquil",   SWE:"Europe/Stockholm",
  TUN:"Africa/Tunis",        ESP:"Europe/Madrid",        CPV:"Atlantic/Cape_Verde",
  BEL:"Europe/Brussels",     EGY:"Africa/Cairo",         KSA:"Asia/Riyadh",
  URU:"America/Montevideo",  IRN:"Asia/Tehran",           NZL:"Pacific/Auckland",
  FRA:"Europe/Paris",        SEN:"Africa/Dakar",          IRQ:"Asia/Baghdad",
  NOR:"Europe/Oslo",         ARG:"America/Argentina/Buenos_Aires",
  ALG:"Africa/Algiers",      AUT:"Europe/Vienna",         JOR:"Asia/Amman",
  POR:"Europe/Lisbon",       COD:"Africa/Kinshasa",       ENG:"Europe/London",
  CRO:"Europe/Zagreb",       GHA:"Africa/Accra",          PAN:"America/Panama",
  UZB:"Asia/Tashkent",       COL:"America/Bogota",        TUR:"Europe/Istanbul",
  AUS:"Australia/Sydney",    ITA:"Europe/Rome",            NGA:"Africa/Lagos",
};

// Venue → IANA timezone (for the LOCAL label)
const VENUE_TZ = {
  AZTECA:"America/Mexico_City", BANORTE:"America/Mexico_City",
  GDL:"America/Mexico_City",    MTY:"America/Mexico_City",
  ATL:"America/New_York",       BOS:"America/New_York",
  MIA:"America/New_York",       NYNJ:"America/New_York",
  PHI:"America/New_York",       TOR:"America/Toronto",
  DAL:"America/Chicago",        HOU:"America/Chicago",
  KC:"America/Chicago",         LA:"America/Los_Angeles",
  SF:"America/Los_Angeles",     SEA:"America/Los_Angeles",
  BC:"America/Vancouver",
};

// Format a Date in a given IANA timezone as "HH:MM"
function fmtInTZ(date, tz) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit", minute: "2-digit", timeZone: tz, hour12: false,
    }).format(date);
  } catch { return "—"; }
}

const TZRow = ({ times, dense, homeCode, awayCode, venue, matchDate }) => {
  if (!times) return null;

  // Build the UTC Date from local time + venue timezone
  let matchUTC = null;
  const venueTZ = VENUE_TZ[venue] || "America/New_York";
  if (matchDate && times.local) {
    try {
      const [h, m] = times.local.split(":").map(Number);
      // Parse the date in the venue's local timezone
      const str = `${matchDate}T${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:00`;
      const localDate = new Date(new Intl.DateTimeFormat("en-CA", {
        timeZone: venueTZ, year:"numeric", month:"2-digit", day:"2-digit",
        hour:"2-digit", minute:"2-digit", second:"2-digit", hour12: false,
      }).format(new Date(str)).replace(/(\d{4})\/(\d{2})\/(\d{2})/, "$1-$2-$3").replace(",",""));
      // Simpler: use offset from local time string directly
      matchUTC = new Date(`${matchDate}T${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:00`);
    } catch {}
  }

  // Determine which zones to show: LOCAL + home country + away country
  const homeTZ = homeCode ? TEAM_TZ[homeCode] : null;
  const awayTZ = awayCode ? TEAM_TZ[awayCode] : null;
  const homeLabel = homeCode || "HOME";
  const awayLabel = awayCode || "AWAY";

  // Build display rows — always show LOCAL; add home/away if different from local
  const rows = [{ label: "LOCAL", time: times.local, isLocal: true }];

  if (matchUTC && homeTZ && homeTZ !== venueTZ) {
    rows.push({ label: homeLabel, time: fmtInTZ(matchUTC, homeTZ) });
  } else if (times.mex && homeCode === "MEX") {
    rows.push({ label: "MEX", time: times.mex });
  }

  if (matchUTC && awayTZ && awayTZ !== venueTZ && awayTZ !== homeTZ) {
    rows.push({ label: awayLabel, time: fmtInTZ(matchUTC, awayTZ) });
  } else if (!rows[1] && times.arg) {
    rows.push({ label: "ARG", time: times.arg });
  }

  // Always cap at 4 columns; fill with ESP if < 4
  if (rows.length < 4 && times.esp) rows.push({ label: "ESP", time: times.esp });
  if (rows.length < 4 && times.arg && rows.every(r => r.label !== "ARG")) rows.push({ label: "ARG", time: times.arg });

  const cols = Math.min(rows.length, 4);

  return (
    <div style={{
      display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 6, marginTop: dense ? 8 : 10,
    }}>
      {rows.slice(0, 4).map((r) => (
        <div key={r.label} style={{
          background: "rgba(0,0,0,0.18)", borderRadius: 8,
          padding: dense ? "5px 6px" : "6px 8px",
          textAlign: "center", border: "1px solid var(--line-soft)",
        }}>
          <div style={{ fontSize: 9, color: "var(--text-faint)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, marginBottom: 1 }}>
            {r.label}
          </div>
          <div className="num" style={{
            fontFamily: "var(--display)", fontSize: dense ? 12 : 13,
            color: r.isLocal ? "var(--teal)" : "var(--text)", letterSpacing: "0.01em",
          }}>{r.time}</div>
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
      {match.times ? <TZRow times={match.times} dense={dense} homeCode={match.home} awayCode={match.away} venue={match.venue} matchDate={match.date} /> : (
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
  const [odds, setOdds] = React.useState(null);
  const [oddsLoading, setOddsLoading] = React.useState(true);

  // Fetch live odds + AI suggestion when modal opens
  React.useEffect(() => {
    if (!matchId) return;
    setOddsLoading(true);
    fetch(`/api/odds?matchId=${matchId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setOdds(data); setOddsLoading(false); })
      .catch(() => setOddsLoading(false));
  }, [matchId]);
  const stageLabel = STAGES.find(s => s.key === match.stage)?.label || "Match";
  const venue = match.venue ? VENUES[match.venue] : null;

  const isFree = freePicksLeft > 0 || !!currentPick;
  // Energy cost scales with confidence tier: ×1=10⚡, ×2=15⚡, ×3=20⚡
  const confidenceTier   = confidence < 65 ? 1 : confidence < 80 ? 2 : 3;
  const tierEnergyCost   = confidenceTier === 1 ? 10 : confidenceTier === 2 ? 15 : 20;
  const cost             = isFree ? 0 : tierEnergyCost;
  const canConfirm = pick && home.resolved && away.resolved && (isFree || energy >= cost);

  // Confidence → base ticket yield for this prediction
  const confidenceTickets = confidenceTier;
  const boostMult = state.boost?.multiplier || 1;
  const effectiveTickets = confidenceTickets * boostMult;

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
            <TZRow times={match.times} homeCode={match.home} awayCode={match.away} venue={match.venue} matchDate={match.date} />
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

        {/* ── AI Odds Panel ─────────────────────────────── */}
        {(home.resolved && away.resolved) && (
          <div style={{ marginBottom: 16 }}>
            {oddsLoading ? (
              <div style={{ padding: "12px 14px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid var(--line-soft)", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid var(--teal)", borderTopColor: "transparent", animation: "spin 0.9s linear infinite" }} />
                <span style={{ fontSize: 12, color: "var(--text-faint)" }}>Fetching live odds…</span>
              </div>
            ) : odds?.odds_home ? (
              <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(93,237,165,0.25)", background: "rgba(93,237,165,0.04)" }}>
                {/* Odds table */}
                <div style={{ padding: "10px 14px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Live odds · {odds.bookmaker || "bookmaker"}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--teal)" }}>⚡ AI Pick</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: odds.odds_draw ? "1fr 1fr 1fr" : "1fr 1fr", gap: 1, background: "var(--line-soft)", margin: "0 14px 10px" }}>
                  {[
                    { label: home.short || match?.home, odds: odds.odds_home, team: match?.home },
                    ...(odds.odds_draw ? [{ label: "Draw", odds: odds.odds_draw, team: "draw" }] : []),
                    { label: away.short || match?.away, odds: odds.odds_away, team: match?.away },
                  ].map((o, i) => {
                    const prob = Math.round((1 / o.odds) * 100);
                    const isBest = (!odds.odds_draw && o.odds === Math.min(odds.odds_home, odds.odds_away)) ||
                      (odds.odds_draw && o.odds === Math.min(odds.odds_home, odds.odds_draw, odds.odds_away));
                    return (
                      <button key={i} className="btn" onClick={() => {
                        setPick(o.team === "draw" ? "draw" : o.team);
                        if (odds.suggested_confidence) setConfidence(odds.suggested_confidence);
                      }} style={{
                        padding: "8px 6px", textAlign: "center",
                        background: isBest ? "rgba(93,237,165,0.12)" : "rgba(255,255,255,0.02)",
                        border: "none", cursor: "pointer",
                      }}>
                        <div style={{ fontSize: 11, color: isBest ? "var(--teal)" : "var(--text-faint)", marginBottom: 2, fontWeight: 700 }}>{o.label}</div>
                        <div style={{ fontFamily: "var(--display)", fontSize: 18, color: isBest ? "var(--teal)" : "var(--text)" }} className="num">{o.odds?.toFixed(2)}</div>
                        <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{prob}%</div>
                      </button>
                    );
                  })}
                </div>
                {/* AI suggestion */}
                {odds.suggestion && (
                  <div style={{ padding: "8px 14px 12px", fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5, borderTop: "1px solid var(--line-soft)" }}>
                    <span style={{ color: "var(--teal)", fontWeight: 700 }}>⚡ </span>
                    {odds.suggestion}
                    {odds.suggested_confidence && (
                      <button className="btn" onClick={() => setConfidence(odds.suggested_confidence)} style={{
                        marginLeft: 8, padding: "2px 8px", fontSize: 10, borderRadius: 6,
                        background: "rgba(93,237,165,0.15)", border: "1px solid rgba(93,237,165,0.3)",
                        color: "var(--teal)", fontWeight: 700,
                      }}>
                        Apply {odds.suggested_confidence}%
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : odds?.source === "no_key" || odds?.source === "unavailable" ? (
              <div style={{ padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid var(--line-soft)", fontSize: 11, color: "var(--text-faint)" }}>
                Odds unavailable for this match · set your confidence manually
              </div>
            ) : null}
          </div>
        )}

        {/* Confidence */}
        {(home.resolved && away.resolved) && (
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 2 }}>Confidence</div>
                <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
                  Affects raffle tickets if correct
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="num" style={{ fontFamily: "var(--display)", fontSize: 22 }}>{confidence}%</div>
                <div style={{ fontSize: 10, color: "var(--text-faint)", letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 2 }}>
                  {confidence < 65 ? "Low" : confidence < 80 ? "Medium" : "High"}
                </div>
              </div>
            </div>
            <input type="range" min="50" max="100" value={confidence}
              onChange={e => setConfidence(+e.target.value)}
              style={{
                width: "100%", appearance: "none", height: 6, borderRadius: 3,
                background: `linear-gradient(90deg, var(--teal) ${(confidence - 50) * 2}%, rgba(255,255,255,0.1) ${(confidence - 50) * 2}%)`,
                outline: "none", marginBottom: 12,
              }} />
            {/* Ticket tier chips */}
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { label: "50–64%", tickets: 1, energy: 10,  active: confidence < 65 },
                { label: "65–79%", tickets: 2, energy: 15,  active: confidence >= 65 && confidence < 80 },
                { label: "80–100%", tickets: 3, energy: 20, active: confidence >= 80 },
              ].map(tier => (
                <div key={tier.label} style={{
                  flex: 1, padding: "6px 8px", borderRadius: 10, textAlign: "center",
                  background: tier.active ? "rgba(93,237,165,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${tier.active ? "rgba(93,237,165,0.5)" : "var(--line-soft)"}`,
                  transition: "all 0.15s",
                }}>
                  <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "var(--display)", color: tier.active ? "var(--teal)" : "var(--text-faint)" }}>
                    ×{tier.tickets}
                  </div>
                  <div style={{ fontSize: 10, color: tier.active ? "var(--orange)" : "var(--text-faint)", letterSpacing: "0.04em", marginTop: 1, fontWeight: 700 }}>
                    {tier.energy}⚡
                  </div>
                  <div style={{ fontSize: 9, color: tier.active ? "var(--teal)" : "var(--text-faint)", letterSpacing: "0.04em", marginTop: 1 }}>
                    {tier.label}
                  </div>
                </div>
              ))}
            </div>
            {boostMult > 1 && (
              <div style={{ marginTop: 8, fontSize: 11, color: "var(--orange)" }}>
                With your {fmtMult(boostMult)} boost → <b>{effectiveTickets} tickets</b> if correct
              </div>
            )}
          </div>
        )}

        {/* Cost summary */}
        {(home.resolved && away.resolved) && (
          <div className="card" style={{ padding: "14px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, color: "var(--text-faint)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, marginBottom: 4, whiteSpace: "nowrap" }}>
                {currentPick ? "Changing pick" : "Cost"}
              </div>
              <div className="h-md num" style={{ color: isFree ? "var(--teal)" : "var(--orange)", whiteSpace: "nowrap" }}>
                {isFree ? "FREE" : `−${cost} ⚡`}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 4 }}>Balance</div>
              <div className="num" style={{ fontFamily: "var(--display)", fontSize: 18, color: energy >= cost ? "var(--text)" : "#FF4D67", display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                <BoltIcon size={14} color="#FF9F1C" /> {energy}
              </div>
            </div>
          </div>
        )}

        {!state.boostFirstFlow && <BoostThisPickInline state={state} actions={actions} />}

        <button
          className="btn btn-primary"
          disabled={!canConfirm}
          onClick={() => actions.confirmPick(matchId, pick, cost, confidence)}
        >
          {!home.resolved || !away.resolved ? "Awaiting matchup"
            : pick ? `Lock in ${pick} · +${effectiveTickets} ticket${effectiveTickets !== 1 ? "s" : ""} if correct`
            : "Pick a team"}
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

      </div>
    </div>
  );
};

// ─── RESULT (post-pick celebration) ───────────────────────
const PickResultModal = ({ teamCode, matchId, confidence, effectiveTickets, freeUsed, state, actions, onClose }) => {
  const team = Object.values(TEAMS).find(t => t.short === teamCode);
  const match = ALL_MATCHES.find(m => m.id === matchId);
  const [sentiment, setSentiment] = React.useState(null);

  // Load live sentiment for this match
  React.useEffect(() => {
    if (!matchId || !window.SupaDB) return;
    window.SupaDB.db.rpc("get_match_sentiment", { p_external_id: matchId })
      .then(({ data }) => { if (data) setSentiment(data); });
  }, [matchId]);

  if (!team) return null;

  const conf        = confidence || 60;
  const tix         = effectiveTickets || 1;
  const confLabel   = conf >= 80 ? "High" : conf >= 65 ? "Medium" : "Low";
  const confColor   = conf >= 80 ? "var(--teal)" : conf >= 65 ? "var(--orange)" : "var(--text-faint)";

  // Sentiment breakdown
  const total     = Number(sentiment?.total  || 0);
  const picks     = sentiment?.picks || {};
  const homePicks = Number(picks[match?.home] || 0);
  const awayPicks = Number(picks[match?.away] || 0);
  const drawPicks = Number(picks["draw"]      || 0);
  const myPct     = total > 0 ? Math.round((Number(picks[teamCode] || 0) / total) * 100) : null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ textAlign: "center", paddingBottom: 28 }}>
        <div className="modal-handle" />

        {/* Flag circle */}
        <div style={{ position: "relative", margin: "10px auto 18px", width: 120, height: 120 }}>
          <div style={{
            position: "absolute", inset: -30, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(93,237,165,0.5), transparent 60%)",
            filter: "blur(18px)",
          }} />
          <div style={{
            position: "relative", width: "100%", height: "100%",
            borderRadius: "50%", background: "linear-gradient(135deg, var(--teal), #3fcb85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 12px 36px var(--teal-glow)",
          }}>
            <div className="flag" style={{ fontSize: 60, lineHeight: 1 }}>{team.flag}</div>
          </div>
        </div>

        <div className="eyebrow" style={{ marginBottom: 8, color: "var(--teal)" }}>Pick locked ✓</div>
        <div className="h-big" style={{ marginBottom: 10, fontSize: 52 }}>{team.short}<br/>FTW</div>
        <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 20, padding: "0 16px", lineHeight: 1.5 }}>
          You called <b style={{ color: "var(--text)" }}>{team.name}</b> to win.
          Result after the final whistle.
        </div>

        {/* Ticket reward */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
          padding: "14px 20px", marginBottom: 14,
          borderRadius: 16,
          background: "rgba(93,237,165,0.08)",
          border: "1px solid rgba(93,237,165,0.25)",
          marginLeft: 4, marginRight: 4,
        }}>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>If correct</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <TicketGlyph size={18} color="var(--teal)" />
              <span className="num" style={{ fontFamily: "var(--display)", fontSize: 28, color: "var(--teal)", lineHeight: 1 }}>+{tix}</span>
              <span style={{ fontSize: 13, color: "var(--text-dim)" }}>ticket{tix !== 1 ? "s" : ""}</span>
            </div>
          </div>
          <div style={{ width: 1, height: 36, background: "var(--line-soft)" }} />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Confidence</div>
            <div style={{ fontFamily: "var(--display)", fontSize: 20, color: confColor }}>{conf}%</div>
            <div style={{ fontSize: 10, color: confColor, marginTop: 2 }}>{confLabel}</div>
          </div>
        </div>

        {/* Live sentiment */}
        {total > 0 && match ? (
          <div style={{
            padding: "12px 14px", marginBottom: 14, borderRadius: 14,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--line-soft)",
            marginLeft: 4, marginRight: 4,
          }}>
            <div style={{ fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
              Audience sentiment · {total} pick{total !== 1 ? "s" : ""}
            </div>
            {/* Bar */}
            <div style={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", marginBottom: 8, gap: 1 }}>
              {[
                { team: match.home, val: homePicks, color: "#5deda5" },
                { team: "draw",     val: drawPicks, color: "#ffd60a" },
                { team: match.away, val: awayPicks, color: "#ff4d67" },
              ].filter(s => s.val > 0).map((s, i) => (
                <div key={i} style={{
                  flex: s.val, background: teamCode === s.team ? s.color : s.color + "66",
                  transition: "flex 0.4s ease",
                }} />
              ))}
            </div>
            {/* Labels */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span style={{ color: teamCode === match.home ? "var(--teal)" : "var(--text-faint)" }}>
                {match.home} {total > 0 ? Math.round(homePicks/total*100) : 0}%
              </span>
              {drawPicks > 0 && (
                <span style={{ color: "var(--text-faint)" }}>Draw {Math.round(drawPicks/total*100)}%</span>
              )}
              <span style={{ color: teamCode === match.away ? "var(--teal)" : "var(--text-faint)" }}>
                {match.away} {total > 0 ? Math.round(awayPicks/total*100) : 0}%
              </span>
            </div>
            {myPct !== null && (
              <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-dim)" }}>
                {myPct > 50
                  ? `✦ You're with the majority — ${myPct}% picked ${teamCode}`
                  : myPct > 0
                  ? `✦ Contrarian pick — only ${myPct}% agree with you`
                  : `✦ First pick for ${teamCode}`}
              </div>
            )}
          </div>
        ) : total === 0 && sentiment ? (
          <div style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 14 }}>
            ✦ You're the first to predict this match
          </div>
        ) : null}

        {/* Boost upsell for unboosted users */}
        {(state?.boost?.multiplier || 1) <= 1 && tix < 3 && (
          <button className="btn" onClick={() => { onClose(); state?.actions?.openBoostHub?.(); }}
            style={{
              width: "calc(100% - 8px)", marginBottom: 8, padding: "12px 16px",
              background: "rgba(255,77,103,0.08)", border: "1px solid rgba(255,77,103,0.3)",
              borderRadius: 14, display: "flex", alignItems: "center", gap: 10,
              textAlign: "left",
            }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#FF4D67", marginBottom: 2 }}>
                Boost would have earned {tix * 5}× more tickets
              </div>
              <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
                A $20 deposit turns {tix} ticket{tix !== 1 ? "s" : ""} → {tix * 5} tickets per correct pick
              </div>
            </div>
            <span style={{ fontSize: 11, color: "#FF4D67", fontWeight: 700, whiteSpace: "nowrap" }}>
              Deposit →
            </span>
          </button>
        )}

        <button className="btn btn-primary" onClick={onClose} style={{ width: "calc(100% - 8px)" }}>Done</button>
      </div>
    </div>
  );
};

Object.assign(window, { BracketScreen, PredictModal, PickResultModal });
