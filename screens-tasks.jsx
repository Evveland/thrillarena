// ─── TASKS HUB ────────────────────────────────────────────
const TasksScreen = ({ state, actions }) => {
  const { energy, tokens, tasksDone } = state;
  return (
    <>
      <ScreenHeader
        eyebrow="Earn energy"
        title="Tasks Hub"
        right={<StatusPills energy={energy} tokens={tokens}
          boost={state.boost} onBoostClick={actions.openBoostHub} />}
      />

      {/* energy meter */}
      <LowEnergyDepositCard state={state} actions={actions} />
      <div style={{ padding: "0 20px 16px" }}>
        <div style={{
          borderRadius: 22,
          padding: "20px 22px",
          background: `
            radial-gradient(120% 80% at 0% 0%, rgba(255,159,28,0.25), transparent 60%),
            linear-gradient(180deg, #1A2038 0%, #131829 100%)`,
          border: "1px solid rgba(255,159,28,0.3)",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
            <div>
              <div className="eyebrow" style={{ color: "var(--orange)", marginBottom: 8 }}>Your energy</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <BoltIcon size={36} color="#FF9F1C" />
                <div className="h-big num">{energy}</div>
                <div style={{ fontSize: 14, color: "var(--text-faint)", marginLeft: 4 }}>/ 200</div>
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.04em" }}>
              <div style={{ fontWeight: 700, color: "var(--orange)", fontFamily: "var(--display)", fontSize: 16, marginBottom: 2 }}>−10/PICK</div>
              <div>after free picks</div>
            </div>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${Math.min(100, (energy / 200) * 100)}%`,
              background: "linear-gradient(90deg, var(--orange), var(--gold))",
              borderRadius: 4,
              boxShadow: "0 0 12px rgba(255,159,28,0.6)",
            }} />
          </div>
        </div>
      </div>

      {/* feature: daily spin */}
      <div style={{ padding: "0 20px 12px" }}>
        <button className="btn" onClick={() => actions.openCasino()} style={{
          width: "100%", textAlign: "left", padding: 0,
          borderRadius: 22, overflow: "hidden",
          background: `
            radial-gradient(60% 80% at 100% 50%, rgba(255,77,103,0.4), transparent 60%),
            radial-gradient(70% 100% at 0% 0%, rgba(93,237,165,0.3), transparent 60%),
            linear-gradient(135deg, #232844 0%, #1A2038 100%)`,
          border: "1px solid var(--line)",
          position: "relative",
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "18px 22px", gap: 14,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="eyebrow" style={{ color: "var(--gold)", marginBottom: 8 }}>★ Featured</div>
              <div className="h-lg" style={{ marginBottom: 6 }}>Daily Spin</div>
              <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 12 }}>Spin to win up to ⚡50</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--teal)", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                Play now <Icon name="arrow" size={14} stroke={2.5} />
              </div>
            </div>
            <div style={{ position: "relative", width: 96, height: 96, flexShrink: 0 }}>
              <MiniWheel />
            </div>
          </div>
        </button>
      </div>

      {/* tasks list */}
      <div style={{ padding: "8px 20px 0" }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>More ways to earn</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {TASKS.slice(1).map(t => {
            // Dynamic subline based on flow state
            let sub = t.sub;
            if (t.id === "wallet" && state.wallet) {
              sub = `${state.wallet.name} · ${state.wallet.address.slice(0,4)}…${state.wallet.address.slice(-4)}`;
            } else if (t.id === "channel" && state.channelJoined) {
              sub = "✓ Joined @thrill_arena";
            } else if (t.id === "invite") {
              sub = `${state.invitesSent} of 5 invited`;
            }
            return (
              <TaskRow
                key={t.id} task={{ ...t, sub }}
                done={tasksDone[t.id]}
                onClick={() => actions.doTask(t.id)}
              />
            );
          })}
        </div>
      </div>

      {/* tip */}
      <div style={{ padding: "20px 20px 0" }}>
        <div className="card" style={{
          padding: "14px 16px",
          background: "rgba(93,237,165,0.05)",
          border: "1px dashed rgba(93,237,165,0.25)",
          fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5,
          display: "flex", gap: 12, alignItems: "flex-start",
        }}>
          <Icon name="info" size={16} color="var(--teal)" />
          <div>
            Energy regenerates <b style={{ color: "var(--teal)" }}>+1 every 30 min</b> automatically.
            Top up faster by inviting friends — both of you get rewarded.
          </div>
        </div>
      </div>
    </>
  );
};

const TaskRow = ({ task, done, onClick }) => {
  const iconMap = {
    play: "play", people: "people", telegram: "telegram", wallet: "wallet",
  };
  const colorMap = {
    ad: "#A78BFA", invite: "#FF9F1C", channel: "#22D3EE", wallet: "#FFD60A",
  };
  const color = colorMap[task.id] || "var(--teal)";

  return (
    <button className="btn" onClick={done ? undefined : onClick} disabled={done} style={{
      width: "100%", textAlign: "left",
      display: "flex", alignItems: "center", gap: 14,
      padding: "14px 16px",
      background: done ? "rgba(93,237,165,0.06)" : "var(--card)",
      border: `1px solid ${done ? "rgba(93,237,165,0.25)" : "var(--line-soft)"}`,
      borderRadius: 16,
      opacity: done ? 0.7 : 1,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: done ? "rgba(93,237,165,0.15)" : `${color}1A`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {done
          ? <Icon name="check" size={22} color="var(--teal)" stroke={2.5} />
          : <Icon name={iconMap[task.icon] || "bolt"} size={22} color={color} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{task.title}</div>
        <div style={{ fontSize: 12, color: "var(--text-faint)" }}>{task.sub}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div className="num" style={{
          fontFamily: "var(--display)", fontSize: 18,
          color: done ? "var(--text-faint)" : "var(--orange)",
          lineHeight: 1, whiteSpace: "nowrap", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4,
        }}>{task.reward.replace(/⚡/g, "").trim()} <BoltIcon size={14} color={done ? "rgba(245,247,242,0.38)" : "#FF9F1C"} /></div>
        <div style={{ fontSize: 10, color: "var(--text-faint)", letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 6 }}>
          {done ? "Claimed" : task.cooldown}
        </div>
      </div>
    </button>
  );
};

// Tiny static wheel preview
const MiniWheel = () => {
  const segs = WHEEL_SEGMENTS;
  const cx = 50, cy = 50, r = 44;
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <circle cx={cx} cy={cy} r={r + 2} fill="#0A0E1C" />
      {segs.map((s, i) => {
        const a1 = (i / segs.length) * 2 * Math.PI - Math.PI / 2;
        const a2 = ((i + 1) / segs.length) * 2 * Math.PI - Math.PI / 2;
        const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
        const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
        return (
          <path key={i}
            d={`M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2} Z`}
            fill={s.color} stroke="#0A0E1C" strokeWidth="0.8" />
        );
      })}
      <circle cx={cx} cy={cy} r="10" fill="#0A0E1C" stroke="#FFD60A" strokeWidth="1.5" />
      {/* pointer */}
      <path d="M50 4 L46 12 L54 12 Z" fill="#FFD60A" />
    </svg>
  );
};

// ─── CASINO MINI-GAME — SPIN WHEEL ────────────────────────
const CasinoScreen = ({ state, actions, onClose }) => {
  const [spinning, setSpinning] = React.useState(false);
  const [result, setResult] = React.useState(null); // segment index
  const [angle, setAngle] = React.useState(0);

  const spin = () => {
    if (spinning) return;
    const seg = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const segAngle = 360 / WHEEL_SEGMENTS.length;
    const target = 360 * 5 + (360 - (seg * segAngle + segAngle / 2));
    setAngle(target);
    setSpinning(true);
    setTimeout(() => {
      setSpinning(false);
      setResult(seg);
    }, 3800);
  };

  const claim = () => {
    if (result == null) return;
    const reward = WHEEL_SEGMENTS[result].energy;
    actions.addEnergy(reward);
    onClose();
  };

  return (
    <div className="overlay" style={{
      background: `
        radial-gradient(80% 60% at 50% 20%, rgba(255,77,103,0.25), transparent 70%),
        radial-gradient(60% 60% at 50% 100%, rgba(93,237,165,0.18), transparent 70%),
        linear-gradient(180deg, #131829 0%, #0A0E1C 100%)`,
    }}>
      {/* top bar */}
      <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button className="btn" onClick={onClose} style={{
          width: 40, height: 40, borderRadius: 999,
          background: "var(--card)", border: "1px solid var(--line-soft)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name="chevronL" size={20} />
        </button>
        <div className="eyebrow" style={{ color: "var(--gold)", whiteSpace: "nowrap" }}>★ Daily Spin</div>
        <div className="chip energy num">
          <BoltIcon size={13} color="#FF9F1C" />
          <span>{state.energy}</span>
        </div>
      </div>

      {/* wheel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 20px", minHeight: 0 }}>
        <div className="h-xl" style={{ textAlign: "center", marginBottom: 10, lineHeight: 1, whiteSpace: "nowrap" }}>
          {result == null ? "Spin to win" : (WHEEL_SEGMENTS[result].energy > 0 ? "You won!" : "So close...")}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 24, textAlign: "center", maxWidth: 280 }}>
          {result == null
            ? "One free spin every 24 hours"
            : WHEEL_SEGMENTS[result].energy > 0
              ? `+${WHEEL_SEGMENTS[result].energy} energy added to your wallet`
              : "Better luck tomorrow"}
        </div>

        <div style={{ position: "relative", width: 300, height: 300, marginBottom: 30 }}>
          {/* outer glow */}
          <div style={{
            position: "absolute", inset: -20, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,214,10,0.3), transparent 70%)",
            filter: "blur(20px)",
          }} />
          {/* wheel */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            transform: `rotate(${angle}deg)`,
            transition: spinning
              ? "transform 3.6s cubic-bezier(0.17, 0.67, 0.21, 1)"
              : "none",
          }}>
            <BigWheel />
          </div>
          {/* center hub */}
          <div style={{
            position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
            width: 60, height: 60, borderRadius: "50%",
            background: "linear-gradient(135deg, #FFD60A, #FF9F1C)",
            border: "4px solid #0A0E1C",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(255,214,10,0.4)",
            zIndex: 2,
          }}>
            <BoltIcon size={26} color="#0A0E1C" />
          </div>
          {/* pointer */}
          <div style={{
            position: "absolute", left: "50%", top: -8, transform: "translateX(-50%)",
            width: 0, height: 0,
            borderLeft: "16px solid transparent",
            borderRight: "16px solid transparent",
            borderTop: "26px solid #FFD60A",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
            zIndex: 3,
          }} />
        </div>

        {result == null ? (
          <button className="btn btn-primary" disabled={spinning} onClick={spin} style={{ width: "100%", maxWidth: 280 }}>
            {spinning ? "Spinning..." : "Spin the wheel"}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={claim} style={{ width: "100%", maxWidth: 280 }}>
            {WHEEL_SEGMENTS[result].energy > 0 ? `Claim ⚡${WHEEL_SEGMENTS[result].energy}` : "Try again tomorrow"}
          </button>
        )}
      </div>
    </div>
  );
};

const BigWheel = () => {
  const segs = WHEEL_SEGMENTS;
  const cx = 150, cy = 150, r = 144;
  return (
    <svg viewBox="0 0 300 300" width="100%" height="100%">
      <circle cx={cx} cy={cy} r={r + 6} fill="#0A0E1C" stroke="#FFD60A" strokeWidth="2" />
      {segs.map((s, i) => {
        const a1 = (i / segs.length) * 2 * Math.PI - Math.PI / 2;
        const a2 = ((i + 1) / segs.length) * 2 * Math.PI - Math.PI / 2;
        const midA = (a1 + a2) / 2;
        const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
        const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
        const tx = cx + (r - 30) * Math.cos(midA);
        const ty = cy + (r - 30) * Math.sin(midA);
        const rot = (midA * 180) / Math.PI + 90;
        return (
          <g key={i}>
            <path
              d={`M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2} Z`}
              fill={s.color}
              stroke="#0A0E1C"
              strokeWidth="1.5"
            />
            <text
              x={tx} y={ty}
              transform={`rotate(${rot}, ${tx}, ${ty})`}
              textAnchor="middle"
              style={{
                fontFamily: "Anton, Impact, sans-serif",
                fontSize: 22,
                fill: s.energy >= 25 ? "#0A0E1C" : "#fff",
                letterSpacing: "0.04em",
              }}
            >{s.label}</text>
          </g>
        );
      })}
    </svg>
  );
};

Object.assign(window, { TasksScreen, CasinoScreen });
