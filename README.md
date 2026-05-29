# Thrill Arena — Telegram Mini-App

World Cup 2026 bracket-prediction mini-app, sponsored by Thrill.com.

## Deploy to Vercel

1. Upload this folder (or push to a GitHub repo)
2. Import the project in Vercel — no framework preset needed, it's plain static HTML
3. Deploy. That's it.

Vercel will serve `index.html` at the root and the rest of the files (JSX, CSS, data) as static assets.

## Local preview

Any static server works:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then open `http://localhost:3000` (or whichever port).

## What's inside

- `index.html` — entry, loads everything
- `styles.css` — tokens + base styles (Thrill palette)
- `data.js` — boost tiers, prize tiers (legacy), scoring rules, leaderboard mock
- `data-teams.js` — 48 teams (flags, colors, group assignments)
- `data-matches.js` — 104 matches across 6 stages
- `data-knockout.js` — bracket structure
- `data-prizes.js` — 7 raffle pools, ticket rules, daily unlock
- `telegram-frame.jsx` — Telegram mini-app device chrome
- `tweaks-panel.jsx` — in-app tweak controls
- `ui.jsx` — icons, logo marks, shared components
- `screens-home.jsx` — onboarding + home dashboard
- `screens-bracket.jsx` — groups + bracket + predict modal
- `screens-prizes.jsx` — prize pools panel + daily reveal modal
- `screens-tasks.jsx` — tasks hub + spin-wheel casino
- `screens-social.jsx` — leaderboard + profile/wallet
- `screens-flows.jsx` — wallet, channel, invite, notification flows
- `screens-boost.jsx` — boost hub + Thrill deposit handoff
- `screens-how-to-win.jsx` — explainer modal for the ticket-raffle model
- `boost-gate.jsx` — free-vs-boost pre-prediction gate
- `app.jsx` — root, state, navigation, tweaks wiring
