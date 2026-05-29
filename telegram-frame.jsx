// Telegram Mini-App frame
// A clean phone-shaped container with a minimal Telegram-style header
// (back arrow + bot name + close), no status bar, no home indicator.

function TelegramFrame({ children }) {
  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      position: "relative",
      background: "#0A0E1C",
      fontFamily: "system-ui, -apple-system, sans-serif",
      overflow: "hidden",
    }}>
      {children}
    </div>
  );
}

Object.assign(window, { TelegramFrame });
