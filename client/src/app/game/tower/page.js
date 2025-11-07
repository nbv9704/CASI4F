"use client";

import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import RequireAuth from "@/components/RequireAuth";
import SoloCard from "@/components/solo/SoloCard";
import SoloGameLayout from "@/components/solo/SoloGameLayout";
import { useUser } from "@/context/UserContext";
import useExperienceSync from "@/hooks/useExperienceSync";
import useApi from "@/hooks/useApi";
import { formatCoins } from "@/utils/format";

const MAX_LEVEL = 15;
const SUCCESS_PROB = 0.5;

const LEVEL_MULTIPLIERS = [
  1, 1.5, 2, 2.5, 3, 4, 5, 6.5, 8, 10,
  13, 16, 20, 30, 40, 50,
];

function TowerPage() {
  const { post } = useApi();
  const { balance, updateBalance } = useUser();
  const syncExperience = useExperienceSync();

  const [betAmount, setBetAmount] = useState(10);
  const [gameActive, setGameActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [lastSummary, setLastSummary] = useState(null);

  const currentMultiplier = LEVEL_MULTIPLIERS[currentLevel] ?? LEVEL_MULTIPLIERS[0];
  const potentialWin = Math.floor(betAmount * currentMultiplier);

  const headerStats = useMemo(
    () => [
      {
        label: "Wallet balance",
        value: `${formatCoins(balance)} coins`,
      },
      {
        label: "Bet amount",
        value: `${formatCoins(betAmount)} coins`,
      },
      {
        label: "Level",
        value: `${currentLevel}/${MAX_LEVEL}`,
        hint: `${formatCoins(potentialWin)} coins at current step`,
      },
      {
        label: "Status",
        value: gameActive ? "In progress" : gameEnded ? "Finished" : "Idle",
        hint: `${Math.round(SUCCESS_PROB * 100)}% ascend success`,
      },
    ],
    [balance, betAmount, currentLevel, gameActive, gameEnded, potentialWin]
  );

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
      await post("/game/tower/start", { betAmount });
      setGameActive(true);
      setGameEnded(false);
      setCurrentLevel(0);
      setLastSummary(null);
      toast.success("Game started! Climb the tower.");
    } catch (err) {
      toast.error(err.message || "Failed to start game");
    } finally {
      setLoading(false);
    }
  };

  const handleAscend = async () => {
    if (!gameActive || currentLevel >= MAX_LEVEL) return;

    setLoading(true);
    try {
      const res = await post("/game/tower/ascend", {});

      if (res.win === false) {
        setGameActive(false);
        setGameEnded(true);
        setCurrentLevel(res.level ?? currentLevel);
        updateBalance(res.balance);
        syncExperience(res);
        setLastSummary({
          status: "bust",
          level: res.bustedLevel ?? currentLevel + 1,
          multiplier: res.multiplier ?? LEVEL_MULTIPLIERS[currentLevel],
          payout: -betAmount,
        });
        toast.error(`💥 Busted at level ${res.bustedLevel ?? currentLevel + 1}! Lost ${betAmount} coins.`);
      } else if (res.win === true) {
        setGameActive(false);
        setGameEnded(true);
        setCurrentLevel(res.level);
        updateBalance(res.balance);
        syncExperience(res);
        setLastSummary({
          status: "max",
          level: res.level,
          multiplier: res.multiplier,
          payout: res.payout,
        });
        toast.success(`🎉 Reached level ${res.level}! Won ${res.payout} coins (${res.multiplier}x).`);
      } else if (res.success === true) {
        setCurrentLevel(res.level);
        setLastSummary({
          status: "progress",
          level: res.level,
          multiplier: res.multiplier,
          payout: Math.floor(betAmount * res.multiplier),
        });
        toast.success(`Level ${res.level}! Multiplier: ${res.multiplier}x`, { duration: 2000 });
      }
    } catch (err) {
      toast.error(err.message || "Failed to ascend");
      setGameActive(false);
      setGameEnded(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCashout = async () => {
    if (!gameActive || currentLevel === 0) {
      toast.error("No progress to cash out");
      return;
    }

    setLoading(true);
    try {
      const res = await post("/game/tower/cashout", {});
      setGameActive(false);
      setGameEnded(true);
      setCurrentLevel(res.level);
      updateBalance(res.balance);
      syncExperience(res);
      setLastSummary({
        status: "cashout",
        level: res.level,
        multiplier: res.multiplier,
        payout: res.payout,
      });
      toast.success(`Cashed out at level ${res.level}! Won ${res.payout} coins (${res.multiplier}x).`);
    } catch (err) {
      toast.error(err.message || "Failed to cash out");
    } finally {
      setLoading(false);
    }
  };

  const resetGameState = () => {
    setGameActive(false);
    setGameEnded(false);
    setCurrentLevel(0);
    setLastSummary(null);
  };

  return (
    <SoloGameLayout
      title="🏰 Tower"
      subtitle={`Climb up to ${MAX_LEVEL} floors, banking a ${Math.round(SUCCESS_PROB * 100)}% success chance on each jump.`}
      accent="Solo challenge"
      stats={headerStats}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="space-y-6">
          <SoloCard className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50" htmlFor="tower-bet">
                Bet amount
              </label>
              <input
                id="tower-bet"
                type="number"
                min="1"
                value={betAmount}
                onChange={(event) => setBetAmount(+event.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-lg font-semibold text-white outline-none transition focus:border-violet-400 focus:bg-black/60 focus:text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={gameActive || loading}
              />
            </div>

            <div className="grid gap-3 text-sm text-white/70">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="uppercase tracking-[0.25em]">Level</span>
                <span className="text-white font-semibold">{currentLevel} / {MAX_LEVEL}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="uppercase tracking-[0.25em]">Multiplier</span>
                <span className="text-amber-200 font-semibold">{currentMultiplier}x</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="uppercase tracking-[0.25em]">Potential win</span>
                <span className="text-emerald-200 font-semibold">{formatCoins(potentialWin)} coins</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="uppercase tracking-[0.25em]">Success rate</span>
                <span className="text-sky-200 font-semibold">{Math.round(SUCCESS_PROB * 100)}%</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {!gameActive ? (
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-2xl border border-emerald-400/40 bg-gradient-to-r from-emerald-400 via-emerald-500 to-sky-500 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-gray-900 shadow-lg shadow-emerald-500/25 transition hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
                >
                  {loading ? "Starting..." : "Start game"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAscend}
                  disabled={loading || currentLevel >= MAX_LEVEL}
                  className="inline-flex items-center justify-center rounded-2xl border border-sky-400/40 bg-sky-500/20 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:border-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Resolving" : currentLevel >= MAX_LEVEL ? "Max level" : "Ascend"}
                </button>
              )}

              <button
                type="button"
                onClick={handleCashout}
                disabled={!gameActive || currentLevel === 0 || loading}
                className="inline-flex items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-500/20 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:border-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Processing" : "Cash out"}
              </button>

              <button
                type="button"
                onClick={resetGameState}
                disabled={gameActive}
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Reset
              </button>
            </div>
          </SoloCard>

          {lastSummary ? (
            <SoloCard className="space-y-4">
              <header className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Last outcome</p>
                <h2 className="text-lg font-semibold text-white">
                  {lastSummary.status === "bust"
                    ? "Busted"
                    : lastSummary.status === "cashout"
                    ? "Cashed out"
                    : lastSummary.status === "max"
                    ? "Tower conquered"
                    : "Progress update"}
                </h2>
              </header>
              <div className={`rounded-3xl border px-6 py-6 text-center shadow-inner ${
                lastSummary.status === "bust"
                  ? "border-rose-400/40 bg-rose-500/20"
                  : "border-emerald-400/40 bg-emerald-500/20"
              }`}>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
                  Level {lastSummary.level}
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  Multiplier {lastSummary.multiplier ?? LEVEL_MULTIPLIERS[lastSummary.level] ?? 1}x
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {lastSummary.payout >= 0 ? "+" : ""}{formatCoins(lastSummary.payout)} coins
                </p>
              </div>
            </SoloCard>
          ) : null}

          <SoloCard className="space-y-4">
            <header className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Level multipliers</p>
              <h2 className="text-lg font-semibold text-white">Plan your climb</h2>
            </header>
            <div className="grid max-h-72 gap-2 overflow-y-auto pr-2 text-sm text-white/70">
              {LEVEL_MULTIPLIERS.map((multiplier, level) => {
                const active = gameActive && currentLevel === level;
                const cleared = gameActive && currentLevel > level;
                return (
                  <div
                    key={`level-${level}`}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition ${
                      active
                        ? "border-amber-400/50 bg-amber-500/20 shadow-lg shadow-amber-500/20"
                        : cleared
                        ? "border-emerald-400/40 bg-emerald-500/15"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <span className="font-semibold text-white">Level {level}</span>
                    <span className="text-amber-200 font-semibold">{multiplier}x</span>
                  </div>
                );
              })}
            </div>
          </SoloCard>
        </div>

        <SoloCard className="flex flex-col justify-between space-y-6">
          <header className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Tower map</p>
            <h2 className="text-lg font-semibold text-white">Visualize your climb</h2>
          </header>
          <div className="flex flex-col-reverse gap-3">
            {LEVEL_MULTIPLIERS.map((multiplier, level) => {
              const active = gameActive && currentLevel === level;
              const cleared = gameActive && currentLevel > level;
              const next = gameActive && currentLevel === level - 1;
              return (
                <div
                  key={`tower-level-${level}`}
                  className={`relative overflow-hidden rounded-3xl border px-5 py-4 transition ${
                    active
                      ? "border-amber-400/60 bg-amber-500/20 shadow-lg shadow-amber-500/20"
                      : cleared
                      ? "border-emerald-400/40 bg-emerald-500/15"
                      : next
                      ? "border-sky-400/40 bg-sky-500/15"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-white">Level {level}</span>
                      {cleared ? <span aria-hidden="true">✅</span> : null}
                      {active ? <span className="animate-bounce" aria-hidden="true">🧗</span> : null}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-amber-200">{multiplier}x</p>
                      {(active || cleared) ? (
                        <p className="text-xs text-white/60">{formatCoins(Math.floor(betAmount * multiplier))} coins</p>
                      ) : null}
                    </div>
                  </div>
                  {level === MAX_LEVEL ? (
                    <div className="absolute -top-6 right-6 text-2xl" aria-hidden="true">
                      👑
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </SoloCard>
      </div>

      <SoloCard className="mt-6 space-y-3 text-sm text-white/70">
        <header className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">How to play</p>
          <h2 className="text-lg font-semibold text-white">Climb carefully, bank wisely</h2>
        </header>
        <ul className="space-y-2">
          <li>Set your bet and start to initiate a new climb.</li>
          <li>Each ascend has a {Math.round(SUCCESS_PROB * 100)}% chance to succeed and boosts your multiplier.</li>
          <li>Cash out anytime after clearing at least one level to secure your winnings.</li>
          <li>Fail an ascend and the tower collapses — your bet is lost.</li>
          <li>Reach floor {MAX_LEVEL} to capture the {LEVEL_MULTIPLIERS[MAX_LEVEL]}x crown payout.</li>
        </ul>
      </SoloCard>
    </SoloGameLayout>
  );
}

export default RequireAuth(TowerPage);
