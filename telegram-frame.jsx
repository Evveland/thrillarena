// Telegram Mini-App frame
// A clean phone-shaped container with a minimal Telegram-style header
// (back arrow + bot name + close), no status bar, no home indicator.

function TelegramFrame({ children, width = 402, height = 820, title = "Thrill Arena" }) {
  return (
    <div style={{
      width, height,
      borderRadius: 36,
      overflow: "hidden",
      position: "relative",
      background: "#0A0E1C",
      boxShadow: "0 40px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)",
      fontFamily: "system-ui, -apple-system, sans-serif",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Telegram top bar */}
      <div style={{
        position: "relative",
        zIndex: 50,
        height: 52,
        flexShrink: 0,
        padding: "0 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(10, 14, 28, 0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}>
        {/* back chevron */}
        <button style={{
          background: "none", border: 0, padding: 0, cursor: "pointer",
          color: "#5DEDA5", display: "flex", alignItems: "center", gap: 4,
          fontSize: 15, fontWeight: 500,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>

        {/* title cluster */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "#5DEDA5",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {/* tiny spade */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#0A0E1C">
              <path d="M12 2 C7 9 4 12 4 16 a4 4 0 0 0 6.5 3.1 L9.5 22 h5 l-1-2.9 A4 4 0 0 0 20 16 c0-4-3-7-8-14z"/>
            </svg>
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, lineHeight: 1.1 }}>{title}</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, lineHeight: 1.1, marginTop: 2 }}>mini app · by Thrill</div>
          </div>
        </div>

        {/* close (×) */}
        <button style={{
          background: "none", border: 0, padding: 0, cursor: "pointer",
          color: "rgba(255,255,255,0.7)",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      {/* content fills remainder */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}

Object.assign(window, { TelegramFrame });
