// ─── Icons (SVG, monoline) ────────────────────────────────
const Icon = ({ name, size = 22, color = "currentColor", stroke = 2 }) => {
  const paths = {
    home:        <><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z" /></>,
    bracket:     <><path d="M4 6h5l3 6m0 0l3-6h5M4 18h5l3-6m6 6h-5" /></>,
    bolt:        <><path d="M13 3L4 14h6l-1 7 9-11h-6z" /></>,
    trophy:      <><path d="M8 4h8v3a4 4 0 0 1-8 0V4z" /><path d="M5 4h3v3a4 4 0 0 1-4-4M19 4h-3v3a4 4 0 0 0 4-4M9 14h6M10 14v4H8v2h8v-2h-2v-4" /></>,
    user:        <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></>,
    plus:        <><path d="M12 5v14M5 12h14" /></>,
    check:       <><path d="M5 12l5 5L20 7" /></>,
    x:           <><path d="M6 6l12 12M18 6L6 18" /></>,
    chevron:     <><path d="M9 6l6 6-6 6" /></>,
    chevronL:    <><path d="M15 6l-6 6 6 6" /></>,
    chevronDown: <><path d="M6 9l6 6 6-6" /></>,
    play:        <><path d="M7 4v16l13-8z" /></>,
    people:      <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20c0-3 3-5 6-5s6 2 6 5M14 20c0-2 2-3 4-3s4 1 4 3" /></>,
    telegram:    <><path d="M21 4L2 12l6 2 2 6 3-4 5 4z" /></>,
    wallet:      <><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 9h12a3 3 0 0 1 0 6H3" /><circle cx="16" cy="12" r="1" fill={color} stroke="none" /></>,
    wheel:       <><circle cx="12" cy="12" r="9" /><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" /></>,
    target:      <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill={color} stroke="none" /></>,
    medal:       <><circle cx="12" cy="14" r="6" /><path d="M9 3l3 5 3-5M9 14l3 2 3-2" /></>,
    flame:       <><path d="M12 3c0 4-5 5-5 10a5 5 0 0 0 10 0c0-2-1-3-2-4 0 2-1 3-2 3 0-4 3-5-1-9z" /></>,
    star:        <><path d="M12 3l2.7 5.7 6.3.9-4.5 4.4 1 6.3L12 17.3 6.5 20.3l1-6.3L3 9.6l6.3-.9z" /></>,
    arrow:       <><path d="M5 12h14M13 5l7 7-7 7" /></>,
    settings:    <><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4.9a7 7 0 0 0-2.1-1.2L14 3h-4l-.4 2.5a7 7 0 0 0-2.1 1.2l-2.4-.9-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-.9a7 7 0 0 0 2.1 1.2L10 21h4l.4-2.5a7 7 0 0 0 2.1-1.2l2.4.9 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z" /></>,
    lock:        <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
    info:        <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.1" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {paths[name] || null}
    </svg>
  );
};

// ─── Thrill logo mark ─────────────────────────────────────
const ThrillMark = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="30" fill="#5DEDA5" />
    <path d="M32 12 C24 24 18 30 18 38 a5 5 0 0 0 9 3.5 L25.5 48 h13 l-1.5 -6.5 a5 5 0 0 0 9 -3.5 c0-8-6-14-14-26z"
      fill="#0A0E1C"/>
  </svg>
);

// ─── Thrill wordmark ──────────────────────────────────────
const ThrillWordmark = ({ size = 48, color = "#FFFFFF" }) => (
  <div style={{
    fontFamily: "var(--display)",
    fontSize: size,
    lineHeight: 0.9,
    letterSpacing: "-0.02em",
    color,
    fontStretch: "condensed",
    textTransform: "lowercase",
  }}>thrill</div>
);

// ─── Trophy logo mark ─────────────────────────────────────
const TrophyLogo = ({ size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
    <defs>
      <linearGradient id="trGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFD60A" />
        <stop offset="1" stopColor="#FF9F1C" />
      </linearGradient>
    </defs>
    {/* base */}
    <rect x="22" y="62" width="36" height="8" rx="2" fill="#232844" />
    <rect x="28" y="54" width="24" height="10" rx="2" fill="#1A2038" stroke="url(#trGrad)" strokeWidth="1.5" />
    {/* handles */}
    <path d="M18 18 Q8 22 12 36 Q14 44 24 46" stroke="url(#trGrad)" strokeWidth="4" fill="none" strokeLinecap="round"/>
    <path d="M62 18 Q72 22 68 36 Q66 44 56 46" stroke="url(#trGrad)" strokeWidth="4" fill="none" strokeLinecap="round"/>
    {/* cup */}
    <path d="M16 10 H64 V32 Q64 54 40 54 Q16 54 16 32 Z" fill="url(#trGrad)" stroke="#0A0E1C" strokeWidth="2"/>
    {/* globe seams */}
    <ellipse cx="40" cy="32" rx="14" ry="6" stroke="#0A0E1C" strokeWidth="1.5" fill="none" opacity="0.4"/>
    <path d="M40 18 V46 M28 22 Q40 28 52 22 M28 42 Q40 36 52 42" stroke="#0A0E1C" strokeWidth="1.5" fill="none" opacity="0.4"/>
  </svg>
);

// ─── Energy bolt SVG (used in chips, etc) ────────────────
const BoltIcon = ({ size = 16, color = "#FF9F1C" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M13 3L4 14h6l-1 7 9-11h-6z" />
  </svg>
);

// ─── $THRILL token coin ─────────────────────────────────────
const TokenCoin = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <defs>
      <linearGradient id="cg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#9DFFD5" />
        <stop offset="1" stopColor="#3FCB85" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#cg)" stroke="#0A0E1C" strokeWidth="1.5" />
    {/* spade glyph */}
    <path d="M12 6 C9 9.5 7 11.5 7 14 a2.2 2.2 0 0 0 3.6 1.5 L10.2 17 h3.6 l-0.4 -1.5 a2.2 2.2 0 0 0 3.6 -1.5 c0 -2.5 -2 -4.5 -5 -8z"
      fill="#0A0E1C" />
  </svg>
);

// ─── Flag chip ────────────────────────────────────────────
const FlagBadge = ({ team, size = 36 }) => {
  if (!team) return null;
  return (
    <div style={{
      width: size, height: size, borderRadius: 8, overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
      fontSize: size * 0.7, lineHeight: 1, flexShrink: 0,
    }} className="flag">
      <span>{team.flag}</span>
    </div>
  );
};

// ─── Status pill (top-right header) ───────────────────────
const StatusPills = ({ energy, tokens, boost = null, onBoostClick }) => (
  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
    {boost && (
      <MultiplierChip mult={boost.multiplier}
        decaying={boost.stagesSinceDeposit > 0}
        onClick={onBoostClick} size="sm" />
    )}
    <div className="chip energy num">
      <BoltIcon size={13} color="#FF9F1C" />
      <span>{energy}</span>
    </div>
    <div className="chip token num">
      <TokenCoin size={13} />
      <span>{tokens.toLocaleString()}</span>
    </div>
  </div>
);

// ─── Screen header ────────────────────────────────────────
const ScreenHeader = ({ title, eyebrow, right }) => (
  <>
    {right && (
      <div style={{ padding: "10px 20px 0", display: "flex", justifyContent: "flex-end" }}>
        {right}
      </div>
    )}
    <div style={{ padding: "10px 20px 18px" }}>
      {eyebrow && <div className="eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</div>}
      <div className="h-xl">{title}</div>
    </div>
  </>
);

Object.assign(window, {
  Icon, TrophyLogo, BoltIcon, TokenCoin, FlagBadge, StatusPills, ScreenHeader,
  ThrillMark, ThrillWordmark,
});
