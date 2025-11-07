"use client";

import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import useApi from "@/hooks/useApi";
import { useUser } from "@/context/UserContext";
import useExperienceSync from "@/hooks/useExperienceSync";
import RequireAuth from "@/components/RequireAuth";
import SoloGameLayout from "@/components/solo/SoloGameLayout";
import SoloCard from "@/components/solo/SoloCard";
import { formatCoins } from "@/utils/format";

const ROWS = 15
const COLS = 15
const MINE_COUNT = 40
const MAX_PICKS = 10

const MULTIPLIERS = [0, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];

function MinesPage() {
  const { post } = useApi();
  const { balance, updateBalance } = useUser();
  const syncExperience = useExperienceSync();

  const [betAmount, setBetAmount] = useState(10);
  const [gameActive, setGameActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [picks, setPicks] = useState([]);
  const [revealedTiles, setRevealedTiles] = useState({});
  const [currentMultiplier, setCurrentMultiplier] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);

  const handleStart = async () => {
    if (betAmount <= 0) {
      toast.error("Bet amount must be positive");
      return;
    }
    if (balance < betAmount) {
      toast.error("Insufficient balance");
      return;
    }

    setLoading(true);
    try {
      await post("/game/mines/start", { betAmount });

      setGameActive(true);
      setGameEnded(false);
      setPicks([]);
      setRevealedTiles({});
      setCurrentMultiplier(0);
      toast.success("Game started! Pick safe tiles");
    } catch (err) {
      toast.error(err.message || "Failed to start game");
    } finally {
      setLoading(false);
    }
  };

  const handlePick = async (row, col) => {
    if (!gameActive || gameEnded || loading) return;

    const tileKey = `${row}-${col}`;
    if (revealedTiles[tileKey]) return; // Already picked

    if (picks.length >= MAX_PICKS) {
      toast.error("Maximum picks reached! Please cashout");
      return;
    }

    setLoading(true);
    try {
      // Convert row, col to index (0-224)
      const index = row * COLS + col;
      const res = await post("/game/mines/pick", { index });

      setPicks((prev) => [...prev, { row, col }]);
      setRevealedTiles((prev) => ({
        ...prev,
        [tileKey]: res.safe || res.mined === false ? "safe" : "mine",
      }));

      if (res.mined === true) {
        // Hit a mine! Game over
        setGameActive(false);
        setGameEnded(true);
        updateBalance(res.balance);
        syncExperience(res);
        toast.error(`💣 BOOM! You hit a mine. Lost ${betAmount} coins`);
      } else if (res.win === true) {
        // Completed all picks! Won
        setGameActive(false);
        setGameEnded(true);
        setCurrentMultiplier(res.multiplier);
        updateBalance(res.balance);
        syncExperience(res);
        toast.success(
          `🎉 Cleared ${res.pickCount} picks! Won ${res.payout} coins (${res.multiplier}x)`
        );
      } else {
        // Safe pick, continue game
        setCurrentMultiplier(res.multiplier);
        toast.success(`💎 Safe! Multiplier: ${res.multiplier}x`, { duration: 1800 });
      }
    } catch (err) {
      toast.error(err.message || "Failed to pick tile");
    } finally {
      setLoading(false);
    }
  };

  const handleCashout = async () => {
    if (!gameActive || picks.length === 0) {
      toast.error("No picks to cashout");
      return;
    }

    setLoading(true);
    try {
      const res = await post("/game/mines/cashout", {});

      setGameActive(false);
      setGameEnded(true);
      updateBalance(res.balance);
      syncExperience(res);
      toast.success(`Cashed out! Won ${res.payout} coins (${res.multiplier}x)`);
    } catch (err) {
      toast.error(err.message || "Failed to cashout");
    } finally {
      setLoading(false);
    }
  };

  const renderTile = (row, col) => {
    const tileKey = `${row}-${col}`;
    const revealed = revealedTiles[tileKey];

    if (revealed === 'mine') {
      return (
        <div className="flex h-full w-full items-center justify-center rounded-xl border border-rose-500/60 bg-rose-600/60 text-2xl shadow-inner shadow-rose-900/40">
          💣
        </div>
      );
    }

    if (revealed === 'safe') {
      return (
        <div className="flex h-full w-full items-center justify-center rounded-xl border border-emerald-500/50 bg-emerald-500/40 text-xl text-white shadow-inner shadow-emerald-900/30">
          💎
        </div>
      );
    }

    return (
      <button
        onClick={() => handlePick(row, col)}
        disabled={!gameActive || gameEnded || loading}
        className="flex h-full w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white/70 transition hover:border-sky-400/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        ?
      </button>
    );
  };

  const potentialWin = Math.floor(betAmount * currentMultiplier) || 0;

  const headerStats = useMemo(() => {
    const progress = gameActive
      ? `${picks.length}/${MAX_PICKS} picks`
      : gameEnded
      ? "Round complete"
      : "Awaiting start";

    const multiplierDisplay = currentMultiplier > 0 ? `${currentMultiplier.toFixed(2)}x` : "—";

    return [
      {
        label: "Wallet balance",
        value: `${formatCoins(balance)} coins`,
      },
      {
        label: "Grid size",
        value: `${ROWS} × ${COLS}`,
        hint: `${MINE_COUNT} hidden mines`,
      },
      {
        label: "Progress",
        value: progress,
        hint: gameActive ? "Cash out before the mine!" : undefined,
      },
      {
        label: "Current multiplier",
        value: multiplierDisplay,
        hint: gameActive && picks.length > 0 ? `Potential ${formatCoins(potentialWin)} coins` : undefined,
      },
    ];
  }, [balance, gameActive, gameEnded, picks.length, potentialWin]);

  return (
    <SoloGameLayout
      title="💣 Mines"
      subtitle={`Find safe tiles, dodge all ${MINE_COUNT} mines, and decide whether to push for the ${MAX_PICKS} pick streak or bank your winnings early.`}
      accent="Solo challenge"
      stats={headerStats}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div className="space-y-6">
          <SoloCard className="space-y-5">
            <header className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Stake setup</p>
              <h2 className="text-lg font-semibold text-white">Choose your bet</h2>
              <p className="text-sm text-white/60">
                Pick a stake and secure a session before uncovering the first tile.
              </p>
            </header>

            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50" htmlFor="mines-bet">
                Bet amount
              </label>
              <input
                id="mines-bet"
                type="number"
                min="1"
                value={betAmount}
                onChange={(e) => setBetAmount(+e.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-lg font-semibold text-white outline-none transition focus:border-sky-400 focus:bg-black/60 focus:text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={gameActive || loading}
              />
            </div>

            {!gameActive ? (
              <button
                onClick={handleStart}
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500/80 via-teal-500/80 to-cyan-500/80 px-5 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Starting..." : "Start run"}
              </button>
            ) : (
              <p className="text-sm text-emerald-200/80">Round active — reveal tiles or cash out.</p>
            )}
          </SoloCard>

          <SoloCard className="space-y-5">
            <header className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Run status</p>
              <h2 className="text-lg font-semibold text-white">Live progression</h2>
            </header>

            <div className="space-y-3 text-sm text-white/70">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span>Picks secured</span>
                <span className="text-base font-semibold text-white">{picks.length} / {MAX_PICKS}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span>Multiplier</span>
                <span className="text-base font-semibold text-amber-200" suppressHydrationWarning>
                  {currentMultiplier.toFixed(2)}x
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span>Potential win</span>
                <span className="text-base font-semibold text-emerald-200" suppressHydrationWarning>
                  {formatCoins(potentialWin)} coins
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCashout}
                disabled={loading || !gameActive || picks.length === 0}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-500/80 via-orange-500/80 to-rose-500/80 px-5 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-white shadow-lg shadow-amber-500/20 transition hover:shadow-amber-500/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Processing..." : "Cash out"}
              </button>
              <p className="text-xs text-white/40">
                Cashing out keeps your streak rewards. One mine ends the round instantly.
              </p>
            </div>
          </SoloCard>

          <SoloCard className="space-y-4">
            <header className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Reference</p>
              <h2 className="text-lg font-semibold text-white">Multiplier ladder</h2>
            </header>

            <div className="space-y-1">
              {MULTIPLIERS.map((mult, idx) => {
                const isActive = picks.length === idx && gameActive;
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-2 text-sm transition ${
                      isActive
                        ? "border-amber-400/60 bg-amber-500/20 text-amber-100 shadow-inner shadow-amber-900/30"
                        : "border-white/10 bg-white/5 text-white/70"
                    }`}
                  >
                    <span>{idx} picks</span>
                    <span className="font-semibold" suppressHydrationWarning>
                      {mult}x
                    </span>
                  </div>
                );
              })}
            </div>
          </SoloCard>
        </div>

        <SoloCard className="space-y-6" padding="px-6 py-6" >
          <header className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Minefield</p>
              <h2 className="text-lg font-semibold text-white">Reveal safe tiles</h2>
            </div>
            {gameEnded ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white/60">
                Round finished
              </span>
            ) : gameActive ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-500/20 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-sky-100">
                Session live
              </span>
            ) : null}
          </header>

          <div
            className="grid gap-1.5 rounded-3xl border border-white/10 bg-black/40 p-3 shadow-inner shadow-black/40"
            style={{
              gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: ROWS * COLS }).map((_, idx) => {
              const row = Math.floor(idx / COLS);
              const col = idx % COLS;
              return (
                <div key={idx} className="aspect-square">
                  {renderTile(row, col)}
                </div>
              );
            })}
          </div>

          {gameEnded ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-sm text-white/60">
                Round settled. Tweak your stake or dive straight back in.
              </p>
              <button
                onClick={() => {
                  setGameActive(false);
                  setGameEnded(false);
                  setPicks([]);
                  setRevealedTiles({});
                  setCurrentMultiplier(0);
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-sky-400/40 bg-gradient-to-r from-sky-500/70 via-indigo-500/70 to-violet-500/70 px-5 py-2 text-sm font-semibold uppercase tracking-[0.28em] text-white transition hover:shadow-lg hover:shadow-sky-500/30"
              >
                Play again
              </button>
            </div>
          ) : null}
        </SoloCard>
      </div>

      <SoloCard className="space-y-4">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">How it works</p>
          <h2 className="text-lg font-semibold text-white">Round structure</h2>
        </header>
        <ul className="space-y-2 text-sm text-white/70">
          <li>Set your stake and start a new run to populate the minefield.</li>
          <li>
            Each safe tile adds to your streak and increases the multiplier while the {MINE_COUNT} hidden mines stay armed.
          </li>
          <li>You can reveal up to {MAX_PICKS} tiles — higher streaks unlock better payouts.</li>
          <li>Cash out at any moment to lock in the current multiplier and payout.</li>
          <li>Triggering a mine ends the round immediately and forfeits the stake.</li>
        </ul>
      </SoloCard>
    </SoloGameLayout>
  );
}

export default RequireAuth(MinesPage);
