// ─── ONBOARDING ────────────────────────────────────────────
const Onboarding = ({ onStart }) => {
  const [step, setStep] = React.useState(0);
  const slides = [
    {
      eyebrow: "World Cup 2026 Edition",
      title: "Predict every\nmatch.",
      body: "From the First Stage to the Final — every correct call drops raffle tickets into the $20,000 USDT prize pool. 290 winners across 58 raffles.",
      art: "logo",
    },
    {
      eyebrow: "Energy → Picks",
      title: "Invite friends,\nkeep predicting.",
      body: "Each prediction costs ⚡10 energy. You start with 20 ⚡ — enough for 2 picks. Invite friends for +30 ⚡ each, or register on Thrill for a one-time +30 ⚡ bonus.",
      art: "bolt",
    },
    {
      eyebrow: "USDT Prize Pool",
      title: "Win real\nmoney.",
      body: "Every prize is a ticket raffle — daily through the Final. Deposit to multiply your tickets up to 100x. Prizes drop straight to your TON wallet.",
      art: "coin",
    },
  ];
  const s = slides[step];

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 200,
      display: "flex", flexDirection: "column",
      background: `
        radial-gradient(60% 40% at 50% 25%, rgba(93,237,165,0.22), transparent 70%),
        radial-gradient(70% 50% at 80% 90%, rgba(255,159,28,0.14), transparent 70%),
        linear-gradient(180deg, #131829 0%, #0A0E1C 100%)`,
      padding: "32px 28px 36px",
    }}>
      {/* skip */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn" style={{ color: "var(--text-faint)", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em" }}
          onClick={onStart}>SKIP →</button>
      </div>

      {/* art — small fixed height so copy always fits */}
      <div style={{ flex: "0 0 auto", height: "28vh", maxHeight: 200, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        {s.art === "logo" && (
          <div style={{ position: "relative", textAlign: "center" }}>
            <div style={{
              position: "absolute", inset: -20, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(93,237,165,0.35), transparent 65%)",
              filter: "blur(18px)",
            }} />
            <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <ThrillWordmark size={56} />
              <ThrillMark size={62} />
              <div style={{
                fontFamily: "var(--display)",
                fontSize: 20,
                letterSpacing: "0.08em",
                color: "#5DEDA5",
                textTransform: "uppercase",
              }}>Arena</div>
            </div>
          </div>
        )}
        {s.art === "bolt" && (
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", inset: -20, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,159,28,0.4), transparent 65%)",
              filter: "blur(16px)",
            }} />
            <svg width="90" height="110" viewBox="0 0 180 220">
              <defs>
                <linearGradient id="boltGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#FFE76E" />
                  <stop offset="1" stopColor="#FF9F1C" />
                </linearGradient>
              </defs>
              <path d="M110 10 L40 120 H85 L70 210 L140 100 H95 Z"
                fill="url(#boltGrad)" stroke="#0A0E1C" strokeWidth="3" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
        {s.art === "coin" && (
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", inset: -20, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(93,237,165,0.4), transparent 65%)",
              filter: "blur(18px)",
            }} />
            <svg width="120" height="120" viewBox="0 0 200 200">
              <defs>
                <linearGradient id="bigCoin" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#9DFFD5" />
                  <stop offset="0.5" stopColor="#5DEDA5" />
                  <stop offset="1" stopColor="#3FCB85" />
                </linearGradient>
              </defs>
              <circle cx="100" cy="100" r="86" fill="url(#bigCoin)" stroke="#0A0E1C" strokeWidth="4"/>
              <circle cx="100" cy="100" r="70" fill="none" stroke="#0A0E1C" strokeWidth="2" opacity="0.35"/>
              <text x="100" y="116" textAnchor="middle"
                style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 64, fill: '#0A0E1C', letterSpacing: '0.04em' }}>USDT</text>
            </svg>
          </div>
        )}
      </div>

      {/* copy — flex so it fills remaining space; scrolls if text is long */}
      <div style={{ flex: 1, overflowY: "auto", paddingTop: 4 }}>
        <div className="eyebrow" style={{ color: "var(--orange)", marginBottom: 12 }}>{s.eyebrow}</div>
        <div className="h-big" style={{ marginBottom: 14, whiteSpace: "pre-line", fontSize: 44 }}>{s.title}</div>
        <div style={{ color: "var(--text-dim)", fontSize: 15, lineHeight: 1.5, maxWidth: 340 }}>
          {s.body}
        </div>
      </div>

      {/* dots + CTA — always pinned at bottom */}
      <div style={{ paddingTop: 16, flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
          {slides.map((_, i) => (
            <div key={i} style={{
              height: 4, flex: 1, borderRadius: 2,
              background: i === step ? "var(--teal)" : "rgba(255,255,255,0.10)",
              transition: "background 0.2s",
            }} />
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => {
          if (step < slides.length - 1) setStep(step + 1);
          else onStart();
        }}>
          {step < slides.length - 1 ? "Continue" : "Enter the Arena"} →
        </button>
        <div style={{ marginTop: 14, textAlign: "center", fontSize: 11, color: "var(--text-faint)", letterSpacing: "0.06em" }}>
          Powered by <span style={{ color: "var(--teal)", fontWeight: 700 }}>Thrill.com</span>
        </div>
      </div>
    </div>
  );
};

// ─── HOME ─────────────────────────────────────────────────
const HomeScreen = ({ state, actions }) => {
  const { energy, tokens, predictions, freePicksLeft, energyPerPick } = state;
  const nextMatch = ALL_MATCHES.find(m => !predictions[m.id]) || ALL_MATCHES[0];
  const home = TEAMS[nextMatch.home], away = TEAMS[nextMatch.away];
  const totalPicks = Object.keys(predictions).length;
  const correctCount = Math.floor(totalPicks * 0.65); // mock

  return (
    <>
      {/* header */}
      <div style={{ padding: "10px 20px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {(() => {
          // Prefer DB user; fall back to Telegram initDataUnsafe while loading
          const tg = window.Telegram?.WebApp?.initDataUnsafe?.user;
          const username    = state.dbUser?.username    || tg?.username    || null;
          const displayName = state.dbUser?.display_name|| tg?.first_name  || null;
          const label       = username ? `@${username}` : (displayName || "@you");
          const initial     = (displayName || username || "Y")[0].toUpperCase();
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: "var(--teal)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#0A0E1C", fontFamily: "var(--display)", fontSize: 18,
              }}>{initial}</div>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-faint)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Welcome back</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
              </div>
            </div>
          );
        })()}
        <StatusPills energy={energy} tokens={tokens}
          boost={state.boost} onBoostClick={actions.openBoostHub} />
      </div>

      {/* ─── DAILY MATCHDAY POOL (dopamine loop driver) ─── */}
      <DailyPoolCard state={state} actions={actions} />

      <div style={{ height: 20 }} />

      {/* hero — next match */}
      <div style={{ padding: "0 20px" }}>
        <div style={{
          position: "relative",
          borderRadius: 28,
          padding: 22,
          background: `
            radial-gradient(140% 90% at 0% 0%, rgba(93,237,165,0.22), transparent 60%),
            radial-gradient(120% 80% at 100% 100%, rgba(255,77,103,0.18), transparent 60%),
            linear-gradient(180deg, #1A2038 0%, #131829 100%)`,
          border: "1px solid var(--line)",
          overflow: "hidden",
        }}>
          {/* stadium light streaks */}
          <div style={{
            position: "absolute", top: 0, left: "30%", width: 2, height: "100%",
            background: "linear-gradient(180deg, transparent, var(--teal-glow), transparent)",
          }} />
          <div style={{
            position: "absolute", top: 0, right: "25%", width: 2, height: "100%",
            background: "linear-gradient(180deg, transparent, rgba(255,159,28,0.4), transparent)",
          }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 10 }}>
            <div className="eyebrow" style={{ whiteSpace: "nowrap" }}>Next match · {STAGES.find(s => s.key === nextMatch.stage)?.short || ""}{nextMatch.group ? ` ${nextMatch.group}` : ""}</div>
            <div className="chip teal num">{fmtDate(nextMatch.date)}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ textAlign: "center" }}>
              <div className="flag" style={{ fontSize: 56, lineHeight: 1, marginBottom: 8 }}>{home.flag}</div>
              <div className="h-md">{home.short || home.code}</div>
              <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>{home.name}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="h-lg" style={{ color: "var(--text-faint)" }}>VS</div>
              {nextMatch.odds && (
                <div className="num" style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 4 }}>
                  {Number(nextMatch.odds?.[0] ?? 0).toFixed(2)} / {Number(nextMatch.odds?.[1] ?? 0).toFixed(2)}
                </div>
              )}
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="flag" style={{ fontSize: 56, lineHeight: 1, marginBottom: 8 }}>{away.flag}</div>
              <div className="h-md">{away.short || away.code}</div>
              <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>{away.name}</div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, fontSize: 12, color: "var(--text-dim)", gap: 12 }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📍 {VENUES[nextMatch.venue]?.name || "TBD"}</span>
            <span className="num" style={{ flexShrink: 0 }}>⏱ {nextMatch.times?.local || "TBD"}</span>
          </div>

          <div style={{ fontSize: 12, color: "var(--text-faint)", textAlign: "center", paddingTop: 4 }}>
            Each pick costs <b style={{ color: "var(--orange)" }}>⚡10</b> · Invite friends for +30 ⚡ each
          </div>
        </div>
      </div>

      {/* stats strip */}
      <div style={{ padding: "20px 20px 0", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <StatTile label="Picks" value={`${totalPicks}/${ALL_MATCHES.length}`} />
        <StatTile label="Correct" value={correctCount} accent="var(--teal)" />
        <StatTile label="Rank" value="#8" accent="var(--orange)" />
      </div>

      {/* ─── PROJECTED REWARD CARD ───────────────────── */}
      <div style={{ padding: "20px 20px 0" }}>
        <ProjectionCard rank={8} score={2080} userMult={state.boost.multiplier}
          onView={() => actions.goto("leaderboard")}
          onBoost={() => actions.openBoostHub()}
          onHowToWin={() => actions.openHowToWin()} />
      </div>

      {/* shortcut row */}
      <div style={{ padding: "20px 20px 0" }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Quick actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <QuickCard
            tone="orange"
            title="Earn energy"
            sub="4 tasks ready"
            icon={<BoltIcon size={20} color="#FF9F1C" />}
            onClick={() => actions.goto("tasks")}
          />
          <QuickCard
            tone="teal"
            title="Bracket"
            sub={`${ALL_MATCHES.length - totalPicks} picks open`}
            icon={<Icon name="bracket" size={20} color="var(--teal)" />}
            onClick={() => actions.goto("bracket")}
          />
        </div>
      </div>

      {/* ─── STICKY PREDICT CTA ── always above the nav bar ── */}
      <div style={{
        position: "sticky", bottom: 0, zIndex: 10,
        padding: "12px 20px 12px",
        background: "linear-gradient(to top, #0A0E1C 70%, transparent)",
      }}>
        <button className="btn btn-primary" onClick={() => actions.openPredict(nextMatch.id)}
          style={{ width: "100%", fontSize: 16 }}>
          {predictions[nextMatch.id] ? `Change Pick · ${nextMatch.home} vs ${nextMatch.away}` : "Make Prediction"}
        </button>
      </div>

      {/* mini leaderboard */}
      <div style={{ padding: "0 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10, gap: 10 }}>
          <div className="eyebrow" style={{ whiteSpace: "nowrap" }}>Live leaderboard</div>
          <button className="btn" onClick={() => actions.goto("leaderboard")}
            style={{ fontSize: 11, color: "var(--teal)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            All →
          </button>
        </div>
        <div className="card" style={{ padding: 4 }}>
          {LEADERBOARD.slice(0, 4).map((u, i) => (
            <div key={u.rank} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 14px",
              borderBottom: i < 3 ? "1px solid var(--line-soft)" : "none",
              background: u.you ? "rgba(93,237,165,0.07)" : "transparent",
              borderRadius: u.you ? 14 : 0,
            }}>
              <div className="num" style={{ width: 18, color: u.rank <= 3 ? "var(--gold)" : "var(--text-faint)", fontWeight: 700, fontSize: 13 }}>
                {u.rank}
              </div>
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: u.color, color: "#0A0E1C",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--display)", fontSize: 14,
              }}>{u.avatar}</div>
              <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: u.you ? "var(--teal)" : "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</span>
                <MultiplierBadge mult={u.mult} />
              </div>
              <div className="num" style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                {u.score.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const StatTile = ({ label, value, accent = "var(--text)" }) => (
  <div className="card" style={{ padding: "12px 14px" }}>
    <div style={{ fontSize: 10, color: "var(--text-faint)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
    <div className="h-lg num" style={{ color: accent }}>{value}</div>
  </div>
);

// ─── BOOST STATUS CARD ──────────────────────────────────
// Replaces the legacy rank-based prize projection. Shows the user's
// current ticket multiplier and the next ladder rung they can unlock.
const ProjectionCard = ({ rank, score, userMult = 1, onView, onBoost, onHowToWin }) => {
  // Lift the user's current boost tier off the multiplier.
  const currentTier = BOOST_TIERS.reduce(
    (best, t) => (t.mult <= userMult + 0.0001 ? t : best),
    BOOST_TIERS[0]
  );
  const nextTier = BOOST_TIERS.find(t => t.mult > currentTier.mult);
  const maxed = !nextTier;
  const tierIdx = BOOST_TIERS.indexOf(currentTier);
  const ladderProgress = (tierIdx + (maxed ? 1 : 0)) / (BOOST_TIERS.length - 1);

  const accent = currentTier.color;
  const accentGlow = `${currentTier.color}22`;
  const accentBorder = `${currentTier.color}55`;

  return (
    <button className="btn" onClick={onBoost} style={{
      width: "100%", textAlign: "left", padding: 0,
      borderRadius: 22, overflow: "hidden",
      background: `
        radial-gradient(120% 80% at 100% 0%, ${accentGlow}, transparent 60%),
        radial-gradient(80% 60% at 0% 100%, rgba(255,77,103,0.08), transparent 60%),
        linear-gradient(135deg, #1A2038, #131829)`,
      border: `1px solid ${accentBorder}`,
    }}>
      <div style={{ padding: "18px 20px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
          <div style={{ minWidth: 0 }}>
            <div className="eyebrow" style={{ color: accent, marginBottom: 6, whiteSpace: "nowrap" }}>
              Your ticket multiplier
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <div className="h-big num" style={{ fontSize: 56, color: accent, textShadow: `0 0 20px ${accent}55` }}>
                {userMult}
              </div>
              <div style={{ fontFamily: "var(--display)", fontSize: 22, color: accent, opacity: 0.7 }}>x</div>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              <b style={{ color: "var(--text)" }} className="num">{userMult}</b> ticket{userMult === 1 ? "" : "s"} per correct pick · per Thrill action
            </div>
          </div>

          {/* boost glyph */}
          <div style={{
            width: 52, height: 52, flexShrink: 0,
            borderRadius: 14,
            background: `linear-gradient(135deg, ${accent}33, rgba(255,255,255,0.05))`,
            border: `1px solid ${accent}66`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill={accent}>
              <path d="M13 2 L4 14 H10 L9 22 L20 9 H13 L15 2 Z" />
            </svg>
          </div>
        </div>

        {/* Climb-to-next OR maxed indicator */}
        {maxed ? (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px",
            borderRadius: 12,
            background: `${accent}10`,
            border: `1px dashed ${accent}55`,
          }}>
            <Icon name="check" size={14} color={accent} stroke={2.5} />
            <div style={{ flex: 1, minWidth: 0, fontSize: 11, color: "var(--text-dim)", lineHeight: 1.4 }}>
              <b style={{ color: accent }}>Maxed at 100x</b> · every action drops <b className="num" style={{ color: "var(--text)" }}>100</b> tickets into the raffle.
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, fontSize: 11, gap: 8 }}>
              <span style={{ color: "var(--text-dim)", whiteSpace: "nowrap" }}>
                Climb to <b style={{ color: nextTier.color }} className="num">{nextTier.label}</b>
              </span>
              <span className="num" style={{ color: "var(--orange)", fontWeight: 700, whiteSpace: "nowrap" }}>
                Deposit ${nextTier.min} → <span style={{ color: nextTier.color }}>{nextTier.mult} tix / action</span>
              </span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${Math.max(8, ladderProgress * 100)}%`,
                background: `linear-gradient(90deg, ${accent}, ${nextTier.color})`,
                borderRadius: 3,
              }} />
            </div>
          </div>
        )}
      </div>

      {/* footer strip */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "10px 20px",
        background: "rgba(0,0,0,0.18)",
        borderTop: "1px solid var(--line-soft)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="info" size={14} color="var(--text-faint)" />
          <span style={{ fontSize: 11, color: "var(--text-faint)", letterSpacing: "0.02em" }}>
            Pool · <b className="num" style={{ color: "var(--text-dim)" }}>20,000</b> USDT · <b className="num" style={{ color: "var(--text-dim)" }}>58</b> raffles · <b className="num" style={{ color: "var(--text-dim)" }}>290</b> total winners
          </span>
        </div>
        <span onClick={(e) => { e.stopPropagation(); onHowToWin && onHowToWin(); }}
          style={{
            fontSize: 11, color: "var(--teal)", fontWeight: 700,
            letterSpacing: "0.08em", textTransform: "uppercase",
            display: "flex", alignItems: "center", gap: 4,
            cursor: "pointer", padding: "4px 6px", margin: "-4px -6px",
            borderRadius: 6,
          }}>How to win <Icon name="arrow" size={12} stroke={2.5} /></span>
      </div>
    </button>
  );
};

const QuickCard = ({ tone, title, sub, icon, onClick }) => {
  const bg = tone === "orange"
    ? "linear-gradient(135deg, rgba(255,159,28,0.18), rgba(255,159,28,0.04))"
    : "linear-gradient(135deg, rgba(93,237,165,0.18), rgba(93,237,165,0.04))";
  const border = tone === "orange" ? "rgba(255,159,28,0.3)" : "rgba(93,237,165,0.3)";
  return (
    <button className="btn" onClick={onClick} style={{
      background: bg, border: `1px solid ${border}`,
      borderRadius: 18, padding: 14, textAlign: "left",
    }}>
      <div style={{ marginBottom: 24 }}>{icon}</div>
      <div className="h-md" style={{ marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.04em" }}>{sub}</div>
    </button>
  );
};

Object.assign(window, { Onboarding, HomeScreen });
