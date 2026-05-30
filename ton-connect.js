// ─── TON Connect integration ──────────────────────────────
// Initialises a single TonConnectUI instance shared across the app.
// Exposes window.ThrillTonConnect with connect / disconnect / status helpers.
//
// The manifest must be publicly reachable at:
//   https://project-cu6be.vercel.app/tonconnect-manifest.json
//
// CDN: @tonconnect/ui  (loaded before this file in index.html)
//   window.TonConnectUI is the constructor after that script loads.

(function () {
  // Defer until DOM is ready (TonConnectUI needs document.body)
  function init() {
    if (typeof window.TonConnectUI === "undefined") {
      console.warn("[TonConnect] SDK not loaded");
      return;
    }

    const ui = new window.TonConnectUI({
      manifestUrl: "https://project-cu6be.vercel.app/tonconnect-manifest.json",
      // Don't render TonConnect's own button — we drive the UI ourselves
      buttonRootId: null,
    });

    // ── Status helpers ──────────────────────────────────────
    function isConnected() {
      return !!ui.wallet;
    }

    function getAddress() {
      if (!ui.wallet) return null;
      // Convert raw bytes address to user-friendly format if needed
      return ui.wallet.account?.address ?? null;
    }

    function getWalletName() {
      return ui.wallet?.device?.appName ?? ui.wallet?.name ?? null;
    }

    // ── Open wallet picker and connect ─────────────────────
    // Returns a promise that resolves with { address, walletName }
    // when the user approves, or rejects on cancel/error.
    async function connect() {
      // If already connected, return existing wallet
      if (isConnected()) {
        return { address: getAddress(), walletName: getWalletName() };
      }
      return new Promise((resolve, reject) => {
        // Listen for the first connection
        const unsub = ui.onStatusChange((wallet) => {
          if (wallet) {
            unsub();
            resolve({
              address:    wallet.account?.address    ?? null,
              walletName: wallet.device?.appName     ?? "TON Wallet",
            });
          }
        });

        // Open the TonConnect modal (handles wallet list, QR, deep-links)
        ui.openModal().catch((err) => {
          unsub();
          reject(err);
        });
      });
    }

    async function disconnect() {
      await ui.disconnect();
    }

    // ── Subscribe to status changes ────────────────────────
    function onStatusChange(cb) {
      return ui.onStatusChange(cb);
    }

    window.ThrillTonConnect = { connect, disconnect, isConnected, getAddress, getWalletName, onStatusChange };
    console.log("[TonConnect] ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
