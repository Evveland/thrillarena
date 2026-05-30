// ─── ROOT APP ─────────────────────────────────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primary": "#5DEDA5",
  "accent": "#FF9F1C",
  "energyPerPick": 10,
  "freePicks": 0,
  "tokenName": "USDT",
  "startingEnergy": 20,
  "boostFirstFlow": true
}/*EDITMODE-END*/;

const DEFAULT_NOTIF_PREFS = {
  enabled: false,
  kickoff: true,
  results: true,
  daily: false,
  rank: true,
};

const DEFAULT_BOOST = {
  lifetimeDeposited: 0,
  stagesSinceDeposit: 0,
  currentStageIdx: 0, // 0=groups, 1=r32, ..., 5=final
  deposits: [],
};

// ── Prize-pool state (per Dev Spec §6 — unlock gates) ─────
// `dailyActions` tracks today's pool unlock progress.
// Tickets are raffle entries earned via Thrill actions (capped per pool).
// One correct prediction = +1 ticket in Daily AND +1 ticket in the round's
// raffle. So per-pool counts can each climb independently.
const DEFAULT_POOL_STATE = {
  dailyActions: { predictions: 0, thrillVisits: 0, thrillTasks: 0 },
  dailyTickets:  0,
  groupTickets:  2,   // mock: 2 correct group picks earlier this week
  r32Tickets:    0,
  r16Tickets:    0,
  qfTickets:     0,
  sfTickets:     0,
  finalTickets:  5,   // mock: tickets from Thrill registration
  // Legacy — referenced by older copy paths; safe to keep.
  weeklyTickets: 4,
  // "Yesterday you won" reveal — fired once on return to drive return visits.
  showDailyReveal: true,
  // Toast queue for "+1 ticket" feedback.
  ticketToast: null,
};

function computeBoostView(boostState, decayRate) {
  const tier = boostTierFor(boostState.lifetimeDeposited);
  const multiplier = currentMultiplier(tier, boostState.stagesSinceDeposit, decayRate);
  return { ...boostState, tier, multiplier, decayRate };
}

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const decayRate = BOOST_DECAY_RATE;

  // Apply CSS vars from tweaks
  React.useEffect(() => {
    document.documentElement.style.setProperty("--teal", tweaks.primary);
    document.documentElement.style.setProperty("--orange", tweaks.accent);
  }, [tweaks.primary, tweaks.accent]);

  // Expose pool action recorders globally so deeply-nested links ("Bet on
  // Thrill" anchors inside bracket match cards) can fire them without
  // threading actions through every component. Defined further below,
  // after `boost` is in scope — see the useEffect after state setup.

  // App state
  const [screen, setScreen] = React.useState("onboarding");
  const [modal, setModal] = React.useState(null);
  const [energy, setEnergy] = React.useState(tweaks.startingEnergy);
  const [tokens, setTokens] = React.useState(125);
  const [predictions, setPredictions] = React.useState({});
  const [picksMade, setPicksMade] = React.useState(0);
  const [tasksDone, setTasksDone] = React.useState({});

  // ── Supabase user ─────────────────────────────────────
  const [dbUser, setDbUser] = React.useState(null);

  React.useEffect(() => {
    if (!window.SupaDB) return;
    (async () => {
      try {
        await SupaDB.loadMatchUUIDs();
        const user = await SupaDB.initUser();
        console.log("[App] user initialised:", user?.id, "telegram:", user?.telegram_id);
        setDbUser(user);
        const saved = await SupaDB.loadUserState(user.id);
        if (saved.predictions && Object.keys(saved.predictions).length > 0) {
          setPredictions(saved.predictions);
          setPicksMade(Object.keys(saved.predictions).length);
        }
        if (user.energy_balance != null && user.energy_balance !== 30) {
          setEnergy(user.energy_balance);
        }
        if (saved.lifetimeDeposited > 0) {
          setBoostRaw(b => ({
            ...b,
            lifetimeDeposited: saved.lifetimeDeposited,
            deposits: Array.from({ length: saved.depositCount }, (_, i) => ({
              ts: Date.now(), currency: "USDT", cryptoAmount: 0,
              usdAmount: 0, depositNumber: i + 1,
            })),
          }));
        }
      } catch (e) {
        console.warn("[Supabase] init error:", e);
      }
    })();
  }, []);

  // ── Missing-feature state ─────────────────────────────
  const [wallet, setWallet] = React.useState(null); // { name, address } once connected
  const [channelJoined, setChannelJoined] = React.useState(false);
  const [invitesSent, setInvitesSent] = React.useState(0);
  const [notifPrefs, setNotifPrefs] = React.useState(DEFAULT_NOTIF_PREFS);
  const [notification, setNotification] = React.useState(null);
  const [notifyPrompted, setNotifyPrompted] = React.useState(false);

  // ── Prize pool state ──────────────────────────────────
  const [poolState, setPoolState] = React.useState(DEFAULT_POOL_STATE);

  // ── Boost / deposit state ─────────────────────────────
  const [boostRaw, setBoostRaw] = React.useState(DEFAULT_BOOST);
  const boost = React.useMemo(
    () => computeBoostView(boostRaw, decayRate),
    [boostRaw, decayRate]
  );

  // ── Boost-first flow continuation: when the gate routes the user
  // through the deposit modal, this remembers which match to predict next.
  const [pendingPredictMatchId, setPendingPredictMatchId] = React.useState(null);

  const freePicksLeft = Math.max(0, tweaks.freePicks - picksMade);
  const energyPerPick = tweaks.energyPerPick;

  // re-sync energy when tweak changes (only if onboarding)
  React.useEffect(() => {
    if (screen === "onboarding") setEnergy(tweaks.startingEnergy);
  }, [tweaks.startingEnergy, screen]);

  // Expose pool action recorders globally so deeply-nested links ("Bet on
  // Thrill" anchors inside bracket match cards) can fire them without
  // threading actions through every component.
  React.useEffect(() => {
    window.__recordThrillVisit = () => {
      const mult = boost.multiplier || 1;
      const ticketsAwarded = 1 * mult;
      setPoolState(ps => ({
        ...ps,
        dailyActions: { ...ps.dailyActions, thrillVisits: ps.dailyActions.thrillVisits + 1 },
        dailyTickets: ps.dailyTickets + ticketsAwarded,
        ticketToast: { tickets: ticketsAwarded, action: "Visited Thrill betting page", _ts: Date.now() },
      }));
    };
    return () => { delete window.__recordThrillVisit; };
  }, [boost.multiplier]);

  // Helper: push a Telegram-style notification toast
  const pushNotification = React.useCallback((notif) => {
    setNotification({ ...notif, _ts: Date.now() });
  }, []);

  const actions = {
    goto: (s, opts = {}) => {
      if (opts.closeModal) setModal(null);
      setScreen(s);
    },
    // Entry point for any match tap.
    // If energy is 0 and no existing pick, gate with out-of-energy prompt first.
    openPredict: (matchId) => {
      const hasExistingPick = !!predictions[matchId];
      if (!hasExistingPick && energy <= 0) {
        setModal({ type: "out-of-energy" });
        return;
      }
      if (tweaks.boostFirstFlow && !hasExistingPick) {
        setModal({ type: "boost-gate", matchId });
      } else {
        setModal({ type: "predict", matchId });
      }
    },

    // Gate → "Pick free": close gate, open predict modal with no boost change.
    confirmFreePick: (matchId) => {
      setModal({ type: "predict", matchId });
    },

    // Gate → "Boost then pick": open deposit modal; on success the deposit
    // modal's onClose handler (in App render below) forwards to the predict
    // modal because `pendingPredictMatchId` is set.
    chooseBoostThenPick: (matchId, amount) => {
      setPendingPredictMatchId(matchId);
      setModal({ type: "deposit", presetAmount: amount });
    },
    confirmPick: (matchId, teamCode, cost, confidence = 60) => {
      const wasNew = !predictions[matchId];
      setPredictions(p => ({ ...p, [matchId]: teamCode }));
      if (wasNew) {
        const isFree = freePicksLeft > 0;
        if (isFree) setPicksMade(n => n + 1);
        else {
          setEnergy(e => e - cost);
          setPicksMade(n => n + 1);
        }
        // ── Confidence → base ticket tiers ─────────────────────────
        // 50–64% = ×1, 65–79% = ×2, 80–100% = ×3
        const confidenceBase = confidence < 65 ? 1 : confidence < 80 ? 2 : 3;
        const ticketsAwarded = confidenceBase * boost.multiplier;
        setPoolState(ps => ({
          ...ps,
          dailyActions: { ...ps.dailyActions, predictions: ps.dailyActions.predictions + 1 },
          dailyTickets: ps.dailyTickets + ticketsAwarded,
          ticketToast: { tickets: ticketsAwarded, action: `Prediction locked in at ${confidence}% confidence`, _ts: Date.now() },
        }));
        // ── Persist to Supabase ───────────────────────────────────
        if (window.SupaDB && dbUser) {
          const energyCost = isFree ? 0 : cost;
          SupaDB.savePrediction(dbUser.id, matchId, teamCode, energyCost);
          if (!isFree) {
            const newBal = Math.max(0, energy - cost);
            SupaDB.recordEnergy(dbUser.id, "prediction_submitted", -cost, newBal);
          }
        }
      }
      setModal({ type: "result", teamCode, freeUsed: wasNew && freePicksLeft > 0 });

      // After the FIRST pick, prompt for notifications (re-engagement hook).
      if (wasNew && !notifyPrompted && !notifPrefs.enabled) {
        setNotifyPrompted(true);
        setTimeout(() => setModal({ type: "notify" }), 1400);
      }
    },
    addEnergy: (n) => setEnergy(e => Math.min(200, e + n)),
    addTokens: (n) => setTokens(t => t + n),

    // Tasks router — opens the right modal per task type.
    doTask: (id) => {
      if (tasksDone[id]) return;
      const task = TASKS.find(t => t.id === id);
      if (!task) return;

      // Route by task type → flow modal
      if (task.type === "wallet")           return setModal({ type: "wallet" });
      if (task.type === "channel")          return setModal({ type: "channel" });
      if (task.type === "invite")           return setModal({ type: "invite" });
      if (task.type === "spin")             return setModal({ type: "casino" });
      if (task.type === "thrill_register")  return setModal({ type: "thrill-register" });

      // Default: instant reward
      const m = task.reward.match(/(\d+)/);
      const amount = m ? +m[1] : 5;
      setTasksDone(t => ({ ...t, [id]: true }));
      setEnergy(e => Math.min(9999, e + amount));
      actions.recordThrillTaskCompleted();
    },

    // ── Prize-pool action recorders ──────────────────────
    // Called from prediction confirms, Thrill betting-page visits, and tasks.
    // The user's BOOST tier multiplies the base ticket grant — e.g. a $500
    // depositor (100x) gets 100 tickets per action instead of 1.
    recordThrillVisit: () => {
      const ticketsAwarded = 1 * boost.multiplier;
      setPoolState(ps => ({
        ...ps,
        dailyActions: { ...ps.dailyActions, thrillVisits: ps.dailyActions.thrillVisits + 1 },
        dailyTickets: ps.dailyTickets + ticketsAwarded,
        ticketToast: { tickets: ticketsAwarded, action: "Visited Thrill betting page", _ts: Date.now() },
      }));
    },
    recordThrillTaskCompleted: () => {
      const ticketsAwarded = 1 * boost.multiplier;
      setPoolState(ps => ({
        ...ps,
        dailyActions: { ...ps.dailyActions, thrillTasks: ps.dailyActions.thrillTasks + 1 },
        dailyTickets: ps.dailyTickets + ticketsAwarded,
        ticketToast: { tickets: ticketsAwarded, action: "Completed a Thrill task", _ts: Date.now() },
      }));
      if (window.SupaDB && dbUser) {
        SupaDB.saveTask(dbUser.id, "thrill_task");
      }
    },
    dismissTicketToast: () => setPoolState(ps => ({ ...ps, ticketToast: null })),
    dismissDailyReveal: () => setPoolState(ps => ({ ...ps, showDailyReveal: false })),

    // Wallet connect callback (from WalletConnectModal)
    connectWallet: (w, address) => {
      setWallet({ name: w.name, id: w.id, address });
      setTasksDone(t => ({ ...t, wallet: true }));
      setEnergy(e => Math.min(9999, e + 10));
      // celebratory push
      setTimeout(() => pushNotification({
        title: "TON wallet linked",
        body: `Your USDT prize on Jul 19 will land in ${address.slice(0, 6)}…${address.slice(-4)}.`,
        kind: "wallet",
      }), 600);
    },

    // Channel verify callback
    verifyChannel: () => {
      setChannelJoined(true);
      setTasksDone(t => ({ ...t, channel: true }));
      setEnergy(e => Math.min(9999, e + 10));
    },

    // Invites sent — +30 ⚡ per friend who opens the link
    addInvites: (count) => {
      setInvitesSent(n => n + count);
      if (count > 0) {
        setTasksDone(t => ({ ...t, invite: true }));
        const gained = count * 30;
        setEnergy(e => Math.min(9999, e + gained));
        if (window.SupaDB && dbUser) {
          SupaDB.recordEnergy(dbUser.id, "invite_opened", gained, energy + gained);
        }
      }
      pushNotification({
        title: `${count} invite${count > 1 ? "s" : ""} sent · +${count * 30} ⚡`,
        body: `Each friend who joins gives you +30 ⚡ — enough for 3 more predictions.`,
        kind: "invite",
      });
    },

    // Notification prefs
    enableNotifications: (prefs) => {
      setNotifPrefs({ ...prefs, enabled: true });
      pushNotification({
        title: "Notifications on",
        body: "We'll DM you before every match you've picked. Tap settings in Profile to tune.",
        kind: "system",
      });
    },

    // Toast actions
    dismissNotification: () => setNotification(null),
    tapNotification: () => {
      const n = notification;
      setNotification(null);
      if (!n) return;
      if (n.kind === "match") { setScreen("bracket"); }
      else if (n.kind === "wallet") { setScreen("profile"); }
      else if (n.kind === "invite") { setScreen("leaderboard"); }
    },

    // Debug / tweaks
    triggerKickoffNotification: () => {
      const picked = Object.entries(predictions);
      const next = picked.length > 0
        ? ALL_MATCHES.find(m => predictions[m.id])
        : ALL_MATCHES[0];
      if (!next) return;
      const home = TEAMS[next.home], away = TEAMS[next.away];
      const homeName = home?.short || home?.code || "TBD";
      const awayName = away?.short || away?.code || "TBD";
      pushNotification({
        title: "⚽ Kickoff in 1 hour",
        body: `${homeName} vs ${awayName} starts soon — your pick is locked.`,
        kind: "match",
      });
    },

    openCasino: () => setModal({ type: "casino" }),
    openWalletConnect: () => setModal({ type: "wallet" }),
    openInvite: () => setModal({ type: "invite" }),
    openNotifyOptIn: () => setModal({ type: "notify" }),
    openChannelVerify: () => setModal({ type: "channel" }),
    openHowToWin: () => setModal({ type: "how-to-win" }),

    // ── Boost / deposit actions ─────────────────────
    openBoostHub: () => setModal({ type: "boost-hub" }),
    openDeposit: (presetAmount = null) => setModal({ type: "deposit", presetAmount }),

    makeDeposit: ({ currency, cryptoAmount, usdAmount }) => {
      const newTotal = boost.lifetimeDeposited + usdAmount;
      const newTier = boostTierFor(newTotal);
      const stage = STAGES[boost.currentStageIdx] || STAGES[0];
      const deposit = {
        ts: Date.now(),
        currency, cryptoAmount, usdAmount,
        stageKey: stage.key,
        stageLabel: stage.short,
        newMult: newTier.mult,
      };
      setBoostRaw(b => ({
        ...b,
        lifetimeDeposited: newTotal,
        stagesSinceDeposit: 0, // reset decay
        deposits: [...b.deposits, deposit],
      }));
      // ── Persist deposit + boost to Supabase ──────────────
      if (window.SupaDB && dbUser) {
        const depositNumber = (boostRaw.deposits?.length || 0) + 1;
        SupaDB.saveDeposit(dbUser.id, depositNumber, usdAmount, currency, newTier.mult);
      }
      // toast
      setTimeout(() => pushNotification({
        title: `Boost activated · ${fmtMult(newTier.mult)}`,
        body: `${cryptoAmount} ${currency} received. Every action now drops ${newTier.mult} ticket${newTier.mult === 1 ? "" : "s"} into the raffles.`,
        kind: "boost",
      }), 400);
      return deposit;
    },

    advanceStage: () => {
      setBoostRaw(b => {
        const next = Math.min(STAGES.length - 1, b.currentStageIdx + 1);
        if (next === b.currentStageIdx) return b;
        return {
          ...b,
          currentStageIdx: next,
          stagesSinceDeposit: b.stagesSinceDeposit + 1,
        };
      });
    },

    rewindStage: () => {
      setBoostRaw(b => ({
        ...b,
        currentStageIdx: Math.max(0, b.currentStageIdx - 1),
        stagesSinceDeposit: Math.max(0, b.stagesSinceDeposit - 1),
      }));
    },

    resetBoost: () => setBoostRaw(DEFAULT_BOOST),

    closeModal: () => setModal(null),
  };

  const state = {
    energy, tokens, predictions, freePicksLeft, energyPerPick, tasksDone,
    wallet, channelJoined, invitesSent, notifPrefs, boost, dbUser,
    boostFirstFlow: tweaks.boostFirstFlow,
    // Prize-pool slice — one ticket count per raffle layer
    dailyActions: poolState.dailyActions,
    dailyTickets: poolState.dailyTickets,
    groupTickets: poolState.groupTickets,
    r32Tickets:   poolState.r32Tickets,
    r16Tickets:   poolState.r16Tickets,
    qfTickets:    poolState.qfTickets,
    sfTickets:    poolState.sfTickets,
    finalTickets: poolState.finalTickets,
    weeklyTickets: poolState.weeklyTickets,
  };

  const screenEl = (() => {
    switch (screen) {
      case "home": return <HomeScreen state={state} actions={actions} />;
      case "bracket": return <BracketScreen state={state} actions={actions} />;
      case "tasks": return <TasksScreen state={state} actions={actions} />;
      case "leaderboard": return <LeaderboardScreen state={state} actions={actions} />;
      case "profile": return <ProfileScreen state={state} actions={actions} />;
      case "pools": return <PoolsScreen state={state} actions={actions} />;
      default: return null;
    }
  })();

  const navItems = [
    { key: "home", icon: "home", label: "Home" },
    { key: "bracket", icon: "bracket", label: "Bracket" },
    { key: "pools", icon: "trophy", label: "Pools" },
    { key: "tasks", icon: "bolt", label: "Earn" },
    { key: "profile", icon: "user", label: "Profile" },
  ];

  return (
    <div className="app" data-screen-label={screen}>
      {/* main screen */}
      {screen !== "onboarding" && (
        <div className="app-content">
          {screenEl}
        </div>
      )}

      {/* bottom nav (hidden on onboarding) */}
      {screen !== "onboarding" && !modal && (
        <div className="nav" data-screen-label="bottom-nav">
          {navItems.map(it => (
            <button key={it.key} className={`nav-item ${screen === it.key ? "active" : ""}`}
              onClick={() => setScreen(it.key)}>
              <Icon name={it.icon} size={20} stroke={2} />
              <div className="nav-label">{it.label}</div>
            </button>
          ))}
        </div>
      )}

      {/* onboarding */}
      {screen === "onboarding" && (
        <Onboarding onStart={() => setScreen("home")} />
      )}

      {/* ── Push-style notification toast (sits above everything) ── */}
      {notification && (
        <NotificationToast
          notification={notification}
          onDismiss={actions.dismissNotification}
          onTap={actions.tapNotification}
        />
      )}

      {/* ── "+1 ticket" toast (Thrill action feedback) ── */}
      {poolState.ticketToast && (
        <TicketEarnedToast
          key={poolState.ticketToast._ts}
          tickets={poolState.ticketToast.tickets}
          action={poolState.ticketToast.action}
          onDismiss={actions.dismissTicketToast}
        />
      )}

      {/* ── Yesterday's daily-pool reveal (dopamine moment on return) ── */}
      {screen !== "onboarding" && poolState.showDailyReveal && !modal && (
        <DailyRewardModal
          data={TODAY_POOL.yesterday}
          onClose={actions.dismissDailyReveal}
          onSeeToday={() => { actions.dismissDailyReveal(); setScreen("home"); }}
        />
      )}

      {/* modals */}
      {modal?.type === "predict" && (
        <PredictModal
          matchId={modal.matchId} state={state} actions={actions}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "result" && (
        <PickResultModal teamCode={modal.teamCode} freeUsed={modal.freeUsed}
          onClose={() => setModal(null)} />
      )}
      {modal?.type === "casino" && (
        <CasinoScreen state={state} actions={actions} onClose={() => setModal(null)} />
      )}
      {modal?.type === "wallet" && (
        <WalletConnectModal
          onClose={() => setModal(null)}
          onConnected={actions.connectWallet}
        />
      )}
      {modal?.type === "channel" && (
        <ChannelVerifyModal
          onClose={() => setModal(null)}
          onVerified={actions.verifyChannel}
        />
      )}
      {modal?.type === "invite" && (
        <InviteShareModal
          onClose={() => setModal(null)}
          onSent={actions.addInvites}
        />
      )}
      {modal?.type === "notify" && (
        <NotifyOptInModal
          prefs={notifPrefs}
          onClose={() => setModal(null)}
          onEnable={actions.enableNotifications}
        />
      )}
      {modal?.type === "boost-hub" && (
        <BoostHubScreen
          state={state} actions={actions}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "deposit" && (
        <DepositModal
          state={state} actions={actions}
          presetAmount={modal.presetAmount}
          onClose={() => {
            // If a match was waiting to be predicted after this deposit
            // (boost-first flow), forward to the predict modal instead of
            // dismissing the user back to the bracket.
            if (pendingPredictMatchId) {
              const matchId = pendingPredictMatchId;
              setPendingPredictMatchId(null);
              setModal({ type: "predict", matchId });
            } else {
              setModal(null);
            }
          }}
        />
      )}
      {modal?.type === "boost-gate" && (
        <BoostGate
          matchId={modal.matchId}
          state={state} actions={actions}
          onClose={() => { setPendingPredictMatchId(null); setModal(null); }}
        />
      )}
      {modal?.type === "how-to-win" && (
        <HowToWinModal onClose={() => setModal(null)} />
      )}
      {modal?.type === "out-of-energy" && (
        <OutOfEnergyModal state={state} actions={actions} onClose={() => setModal(null)} />
      )}
      {modal?.type === "thrill-register" && (
        <ThrillRegisterModal
          done={tasksDone["thrill_register"]}
          onClose={() => setModal(null)}
          onClaim={() => {
            setTasksDone(t => ({ ...t, thrill_register: true }));
            setEnergy(e => Math.min(9999, e + 30));
            if (window.SupaDB && dbUser) {
              SupaDB.saveTask(dbUser.id, "thrill_registration");
              SupaDB.recordEnergy(dbUser.id, "referral_activated", 30, energy + 30, { notes: "thrill_register" });
            }
            setModal(null);
            pushNotification({ title: "Registered on Thrill · +30 ⚡", body: "3 more predictions unlocked. Good luck!", kind: "boost" });
          }}
        />
      )}

      {/* Tweaks panel (always rendered — manages its own open state via host protocol) */}
      <TweaksPanel>
        <TweakSection label="Prize pools (daily loop)">
          <TweakButton label="Show 'You won yesterday' reveal"
            onClick={() => setPoolState(ps => ({ ...ps, showDailyReveal: true }))} />
          <TweakButton label="Toggle yesterday: won / lost"
            onClick={() => {
              TODAY_POOL.yesterday.youWon = !TODAY_POOL.yesterday.youWon;
              setPoolState(ps => ({ ...ps, showDailyReveal: true }));
            }} />
          <TweakButton label="+1 prediction toward unlock"
            onClick={() => setPoolState(ps => ({
              ...ps,
              dailyActions: { ...ps.dailyActions, predictions: ps.dailyActions.predictions + 1 },
            }))} />
          <TweakButton label="Fire Thrill visit (+1 ticket)"
            onClick={() => window.__recordThrillVisit?.()} />
          <TweakButton label="Fire Thrill task complete (+1 ticket)"
            onClick={actions.recordThrillTaskCompleted} />
          <TweakButton label="Force-unlock daily pool"
            onClick={() => setPoolState(ps => ({
              ...ps,
              dailyActions: {
                predictions: TODAY_POOL.unlock.minPredictions,
                thrillVisits: TODAY_POOL.unlock.minThrillVisits,
                thrillTasks: TODAY_POOL.unlock.minThrillTasks,
              },
              dailyTickets: Math.max(ps.dailyTickets, 6),
            }))} />
          <TweakButton label="Reset pool progress"
            onClick={() => setPoolState(DEFAULT_POOL_STATE)} />
          <TweakButton label="Open Pools screen"
            onClick={() => setScreen("pools")} />
          <TweakButton label="Open Leaderboard"
            onClick={() => setScreen("leaderboard")} />
        </TweakSection>
        <TweakSection label="Energy economy">
          <TweakSlider label="Free picks" value={tweaks.freePicks}
            min={1} max={5} step={1}
            onChange={v => setTweak("freePicks", v)} />
          <TweakSlider label="Cost per pick" value={tweaks.energyPerPick}
            min={1} max={50} step={1} unit="⚡"
            onChange={v => setTweak("energyPerPick", v)} />
          <TweakSlider label="Starting energy" value={tweaks.startingEnergy}
            min={0} max={100} step={5}
            onChange={v => setTweak("startingEnergy", v)} />
        </TweakSection>
        <TweakSection label="Theme">
          <TweakColor label="Primary"
            value={tweaks.primary}
            options={["#5DEDA5", "#39FF14", "#22D3EE", "#A78BFA", "#FFD60A"]}
            onChange={v => setTweak("primary", v)} />
          <TweakColor label="Accent"
            value={tweaks.accent}
            options={["#FF9F1C", "#FF4D67", "#FFD60A", "#F472B6", "#22D3EE"]}
            onChange={v => setTweak("accent", v)} />
        </TweakSection>
        <TweakSection label="Boost mechanic">
          <TweakToggle label="Boost-first flow"
            value={tweaks.boostFirstFlow}
            onChange={v => setTweak("boostFirstFlow", v)} />
          <TweakButton label="Open Boost Hub"
            onClick={() => setModal({ type: "boost-hub" })} />
          <TweakButton label="Quick deposit $20"
            onClick={() => setModal({ type: "deposit", presetAmount: 20 })} />
          <TweakButton label="Quick deposit $500 (max)"
            onClick={() => setModal({ type: "deposit", presetAmount: 500 })} />
          <TweakButton label={`Advance stage → ${STAGES[Math.min(STAGES.length-1, boost.currentStageIdx+1)]?.short || "Final"}`}
            onClick={actions.advanceStage} />
          <TweakButton label="Rewind stage"
            onClick={actions.rewindStage} />
          <TweakButton label="Reset boost"
            onClick={actions.resetBoost} />
        </TweakSection>
        <TweakSection label="New flows">
          <TweakButton label="Connect TON wallet"
            onClick={() => setModal({ type: "wallet" })} />
          <TweakButton label="Verify Telegram channel"
            onClick={() => setModal({ type: "channel" })} />
          <TweakButton label="Open invite share sheet"
            onClick={() => setModal({ type: "invite" })} />
          <TweakButton label="Notification settings"
            onClick={() => setModal({ type: "notify" })} />
          <TweakButton label="Fire kickoff push"
            onClick={actions.triggerKickoffNotification} />
          <TweakButton label="Reset flow state"
            onClick={() => {
              setWallet(null); setChannelJoined(false); setInvitesSent(0);
              setNotifPrefs(DEFAULT_NOTIF_PREFS); setNotifyPrompted(false);
              setTasksDone(t => {
                const { wallet, channel, invite, ...rest } = t;
                return rest;
              });
            }} />
        </TweakSection>
        <TweakSection label="Quick jump">
          <TweakButton label="Replay onboarding"
            onClick={() => { setScreen("onboarding"); setPredictions({}); setPicksMade(0); setTasksDone({}); }} />
          <TweakButton label="Open casino spin"
            onClick={() => { setScreen("tasks"); setTimeout(() => setModal({ type: "casino" }), 50); }} />
          <TweakButton label="Reset picks"
            onClick={() => { setPredictions({}); setPicksMade(0); }} />
          <TweakButton label="Drain energy"
            onClick={() => setEnergy(3)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

// mount
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <TelegramFrame>
    <App />
  </TelegramFrame>
);
