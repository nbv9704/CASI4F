// client/src/app/game/higherlower/page.js
"use client";

import RequireAuth from "@/components/RequireAuth";
import { useCallback, useEffect, useMemo, useState } from "react";
import useApi from "@/hooks/useApi";
import { useUser } from "@/context/UserContext";
import useExperienceSync from "@/hooks/useExperienceSync";
import { toast } from "react-hot-toast";
import SoloGameLayout from "@/components/solo/SoloGameLayout";
import SoloCard from "@/components/solo/SoloCard";
import { formatCoins } from "@/utils/format";

function HigherLowerPage() {
  const { post } = useApi();
  const { balance, updateBalance } = useUser();
  const syncExperience = useExperienceSync();

  const [betAmount, setBetAmount] = useState(1);
  const [currentNumber, setCurrentNumber] = useState(10);
  const [nextNumber, setNextNumber] = useState(null);
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState([]);
  const [guessing, setGuessing] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Load initial state from server
  const loadState = useCallback(async () => {
    try {
      const data = await post("/game/higherlower/state");
      if (data.lastNumber !== undefined) {
        setCurrentNumber(data.lastNumber);
      }
      if (data.streak !== undefined) {
        setStreak(data.streak);
      }
    } catch (err) {
      console.error("Failed to load Higher/Lower state:", err);
    }
  }, [post]);

  useEffect(() => {
    void loadState();
  }, [loadState]);

  const handleGuess = async (guess) => {
    if (betAmount <= 0) {
      toast.error("Bet must be > 0");
      return;
    }

    setGuessing(true);
    setShowResult(false);

    try {
      const data = await post("/game/higherlower", { betAmount, guess });

      // Animate number reveal
      setTimeout(() => {
        setNextNumber(data.result);
        setShowResult(true);
        updateBalance(data.balance);
        syncExperience(data);

        if (data.tie) {
          toast(`🤝 It's a tie! Both were ${data.initial}`, { icon: "ℹ️" });
          setStreak(0);
          setHistory((prev) =>
            [...prev, { from: data.initial, to: data.result, guess, outcome: "tie" }].slice(-10)
          );
        } else if (data.win) {
          toast.success(`🎉 Correct! ${data.initial} → ${data.result}`);
          setStreak(data.streak);
          setHistory((prev) =>
            [...prev, { from: data.initial, to: data.result, guess, outcome: "win" }].slice(-10)
          );
        } else {
          toast.error(`😢 Wrong! ${data.initial} → ${data.result}`);
          setStreak(0);
          setHistory((prev) =>
            [...prev, { from: data.initial, to: data.result, guess, outcome: "lose" }].slice(-10)
          );
        }

        // Prepare for next round
        setTimeout(() => {
          setCurrentNumber(data.result);
          setNextNumber(null);
          setShowResult(false);
          setGuessing(false);
        }, 2000);
      }, 1500);
    } catch (err) {
      setGuessing(false);
      setShowResult(false);
      // Error toast handled by useApi
    }
  };

  const effectiveMultiplier = useMemo(() => (0.5 + streak * 0.5).toFixed(1), [streak]);

  const headerStats = useMemo(
    () => [
      {
        label: "Wallet balance",
        value: `${formatCoins(balance)} coins`,
      },
      {
        label: "Live number",
        value: currentNumber,
      },
      {
        label: "Win streak",
        value: streak,
        hint: streak > 0 ? `${effectiveMultiplier}x multiplier` : "Build a streak to boost rewards",
      },
      {
        label: "Recent rounds",
        value: history.length,
        hint: "Showing the last 10 outcomes",
      },
    ],
    [balance, currentNumber, streak, effectiveMultiplier, history.length]
  );

  return (
    <SoloGameLayout
      title="⬆️⬇️ Higher or Lower"
      subtitle="Predict whether the next draw lands higher or lower. String together perfect calls to climb the multiplier ladder."
      accent="Solo challenge"
      stats={headerStats}
    >
      {streak > 0 ? (
        <SoloCard className="border-amber-400/30 bg-amber-500/10 text-center text-white shadow-lg shadow-amber-500/20">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">Streak hot</p>
          <div className="mt-3 text-3xl font-semibold">
            🔥 {streak} win streak
          </div>
          <p className="mt-1 text-sm text-white/70">Current multiplier {effectiveMultiplier}x</p>
        </SoloCard>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        <SoloCard className="space-y-6">
          <header className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Number reveal</p>
              <h2 className="text-lg font-semibold text-white">Target the right trend</h2>
            </div>
            {guessing ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-500/20 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-sky-100">
                Resolving guess
              </span>
            ) : null}
          </header>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-600/80 via-purple-600/80 to-blue-500/80 p-6 text-center shadow-inner shadow-indigo-900/60">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Current</p>
              <p className="mt-3 text-6xl font-semibold text-white" suppressHydrationWarning>
                {currentNumber}
              </p>
            </div>
            <div
              className={`rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/80 via-teal-500/80 to-cyan-500/80 p-6 text-center shadow-inner shadow-emerald-900/50 ${
                showResult ? "animate-pulse" : ""
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Next</p>
              <p className="mt-3 text-6xl font-semibold text-white" suppressHydrationWarning>
                {showResult && nextNumber !== null ? nextNumber : "?"}
              </p>
            </div>
          </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50" htmlFor="hl-bet">
                Bet amount
              </label>
              <input
                id="hl-bet"
                type="number"
                min="1"
                value={betAmount}
                onChange={(e) => setBetAmount(+e.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-lg font-semibold text-white outline-none transition focus:border-sky-400 focus:bg-black/60 focus:text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={guessing}
              />
              <p className="text-xs text-white/40">
                Wins pay out with a base 1.5x multiplier plus streak bonuses.
              </p>
            </div>

              <div className="grid gap-3">
                <button
                  onClick={() => handleGuess("higher")}
                  disabled={guessing}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500/80 via-teal-500/80 to-cyan-500/80 px-4 py-4 text-lg font-semibold uppercase tracking-[0.25em] text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  ⬆️ Higher
                </button>
                <button
                  onClick={() => handleGuess("lower")}
                  disabled={guessing}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-400/40 bg-gradient-to-r from-rose-500/80 via-red-500/80 to-orange-500/80 px-4 py-4 text-lg font-semibold uppercase tracking-[0.25em] text-white shadow-lg shadow-rose-500/30 transition hover:shadow-rose-500/50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  ⬇️ Lower
                </button>
              </div>
          </div>

          {guessing ? (
            <p className="text-center text-sm font-semibold text-white/70">🎲 Revealing next number...</p>
          ) : null}
        </SoloCard>

        <div className="space-y-6">
          <SoloCard className="space-y-4">
            <header className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Round summary</p>
              <h2 className="text-lg font-semibold text-white">Session snapshot</h2>
            </header>
            <div className="space-y-3 text-sm text-white/70">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span>Total staking</span>
                <span className="font-semibold text-white" suppressHydrationWarning>
                  {formatCoins(betAmount)} coins
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span>Multiplier</span>
                <span className="font-semibold text-amber-200" suppressHydrationWarning>
                  {effectiveMultiplier}x
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span>Recent trend</span>
                <span className="font-semibold text-white">
                  {history.length === 0 ? "—" : history[history.length - 1].outcome}
                </span>
              </div>
            </div>
          </SoloCard>

          {history.length > 0 ? (
            <SoloCard className="space-y-4">
              <header className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Recent history</p>
                  <h2 className="text-lg font-semibold text-white">Last {history.length} calls</h2>
                </div>
              </header>
              <div className="space-y-3">
                {[...history]
                  .slice(-5)
                  .reverse()
                  .map((entry, index) => (
                    <div
                      key={`${entry.from}-${entry.to}-${index}`}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
                        entry.outcome === "win"
                          ? "border-emerald-400/40 bg-emerald-500/15"
                          : entry.outcome === "lose"
                          ? "border-rose-400/40 bg-rose-500/15"
                          : "border-white/10 bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3 text-white">
                        <span className="text-lg font-semibold" suppressHydrationWarning>
                          {entry.from}
                        </span>
                        <span>{entry.guess === "higher" ? "⬆️" : "⬇️"}</span>
                        <span className="text-lg font-semibold" suppressHydrationWarning>
                          {entry.to}
                        </span>
                      </div>
                      <span className="text-base">
                        {entry.outcome === "win" ? "✅" : entry.outcome === "lose" ? "❌" : "🤝"}
                      </span>
                    </div>
                  ))}
              </div>
            </SoloCard>
          ) : null}
        </div>
      </div>

      <SoloCard className="space-y-3">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">How to play</p>
          <h2 className="text-lg font-semibold text-white">Core rules</h2>
        </header>
        <ul className="space-y-2 text-sm text-white/70">
          <li>Numbers range from 1 to 20 with equal odds.</li>
          <li>Correct calls pay out 1.5x with +0.5x added for every consecutive win.</li>
          <li>Draws return your stake but reset the streak.</li>
          <li>Maintain focus — one wrong call drops the multiplier to baseline.</li>
        </ul>
      </SoloCard>
    </SoloGameLayout>
  );
}

export default RequireAuth(HigherLowerPage);