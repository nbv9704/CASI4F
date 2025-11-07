"use client";

import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import RequireAuth from "@/components/RequireAuth";
import SoloCard from "@/components/solo/SoloCard";
import SoloGameLayout from "@/components/solo/SoloGameLayout";
import RevealingDiceFaces from "@/components/RevealingDiceFaces";
import { useUser } from "@/context/UserContext";
import useExperienceSync from "@/hooks/useExperienceSync";
import useApi from "@/hooks/useApi";
import { formatCoins } from "@/utils/format";

const HAND_MULTIPLIERS = {
  "Five of a Kind": 20,
  "Four of a Kind": 10,
  "Full House": 8,
  Straight: 5,
  "Three of a Kind": 3,
  "Two Pair": 2,
  "One Pair": 1,
  "High Card": 0,
};

function DicePokerPage() {
  const { post } = useApi();
  const { balance, updateBalance } = useUser();
  const syncExperience = useExperienceSync();

  const [betAmount, setBetAmount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [rolling, setRolling] = useState(false);

  const handlePlay = async () => {
    if (betAmount <= 0) {
      toast.error("Bet amount must be positive");
      return;
    }
    if (balance < betAmount) {
      toast.error("Insufficient balance");
      return;
    }

    setLoading(true);
    setRolling(true);
    setResult(null);
    setTimeout(() => setRolling(false), 1000);

    try {
      const res = await post("/game/dicepoker", { betAmount });
      setResult(res);
      updateBalance(res.balance);
      syncExperience(res);

      if (res.win) {
        toast.success(`${res.hand}! You won ${res.payout} coins!`);
      } else {
        toast.error(`${res.hand}. You lost ${betAmount} coins`);
      }
    } catch (err) {
      toast.error(err.message || "Failed to play");
      setRolling(false);
    } finally {
      setLoading(false);
    }
  };

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
        label: "Last hand",
        value: result?.hand ?? "—",
        hint: result ? `${result.multiplier}x` : undefined,
      },
      {
        label: "Outcome",
        value: result ? (result.win ? "Win" : "Loss") : "Awaiting roll",
        hint: result ? `${formatCoins(result.payout ?? 0)} coins` : undefined,
      },
    ],
    [balance, betAmount, result]
  );

  return (
    <SoloGameLayout
      title="🎲 Dice Poker"
      subtitle="Roll five dice and chase classic poker hands for escalating multipliers."
      accent="Solo challenge"
      stats={headerStats}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <SoloCard className="space-y-6">
          <header className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Your roll</p>
            <h2 className="text-lg font-semibold text-white">Build the strongest hand</h2>
          </header>
          <div className="flex flex-col items-center gap-4">
            {result ? (
              <RevealingDiceFaces
                dice={result.dice}
                size="xl"
                delay={180}
                className="flex gap-4"
                faceWrapperClassName={`${rolling ? "animate-bounce" : "hover:scale-105"} h-20 w-20 rounded-2xl border border-white/15 bg-white/10 shadow-lg transition`}
                faceClassName="drop-shadow-xl"
              />
            ) : (
              <div className="flex gap-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={`placeholder-die-${index}`}
                    className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-3xl"
                  >
                    🎲
                  </div>
                ))}
              </div>
            )}

            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Hand</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {result?.hand ?? "Awaiting roll"}
              </p>
              {result ? (
                <p className="mt-1 text-sm text-amber-200">Multiplier {result.multiplier}x</p>
              ) : null}
            </div>

            {result ? (
              <div className={`w-full rounded-3xl border px-6 py-6 text-center shadow-inner ${
                result.win ? "border-emerald-400/40 bg-emerald-500/20" : "border-rose-400/40 bg-rose-500/20"
              }`}>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
                  {result.win ? "You hit a winner" : "No winner"}
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {result.win ? `+${formatCoins(result.payout ?? 0)}` : "0"} coins
                </p>
                {result.win ? (
                  <p className="mt-1 text-xs text-white/70">
                    {formatCoins(betAmount)} × {result.multiplier} = {formatCoins(result.payout ?? 0)}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </SoloCard>

        <div className="space-y-6">
          <SoloCard className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50" htmlFor="dicepoker-bet">
                Bet amount
              </label>
              <input
                id="dicepoker-bet"
                type="number"
                min="1"
                value={betAmount}
                onChange={(event) => setBetAmount(+event.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-lg font-semibold text-white outline-none transition focus:border-amber-400 focus:bg-black/60 focus:text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
              />
            </div>

            <button
              type="button"
              onClick={handlePlay}
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-2xl border border-emerald-400/40 bg-gradient-to-r from-emerald-400 via-emerald-500 to-rose-500 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-gray-900 shadow-lg shadow-emerald-500/25 transition hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Rolling" : "Roll dice"}
            </button>
          </SoloCard>

          <SoloCard className="space-y-4">
            <header className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Hand rankings</p>
              <h2 className="text-lg font-semibold text-white">Know the payouts</h2>
            </header>
            <div className="space-y-2 text-sm text-white/70">
              {Object.entries(HAND_MULTIPLIERS)
                .sort((a, b) => b[1] - a[1])
                .map(([hand, multiplier]) => (
                  <div
                    key={hand}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition ${
                      result?.hand === hand ? "border-amber-400/40 bg-amber-500/20" : "border-white/10 bg-white/5"
                    }`}
                  >
                    <span className="font-semibold text-white">{hand}</span>
                    <span className={`font-semibold ${multiplier > 0 ? "text-amber-200" : "text-white/40"}`}>
                      {multiplier > 0 ? `${multiplier}x` : "No win"}
                    </span>
                  </div>
                ))}
            </div>
          </SoloCard>

          <SoloCard className="space-y-3 text-sm text-white/70">
            <header className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Hand guide</p>
              <h2 className="text-lg font-semibold text-white">Quick refresher</h2>
            </header>
            <ul className="space-y-2">
              <li><span className="font-semibold text-white">Five of a Kind:</span> All five dice identical.</li>
              <li><span className="font-semibold text-white">Four of a Kind:</span> Four dice show the same number.</li>
              <li><span className="font-semibold text-white">Full House:</span> Three of one number plus a pair.</li>
              <li><span className="font-semibold text-white">Straight:</span> Five in sequence (1-5 or 2-6).</li>
              <li><span className="font-semibold text-white">Three of a Kind:</span> Any three matching dice.</li>
              <li><span className="font-semibold text-white">Two Pair:</span> Two different pairs.</li>
              <li><span className="font-semibold text-white">One Pair:</span> Single matching pair.</li>
              <li><span className="font-semibold text-white">High Card:</span> No combinations — no win.</li>
            </ul>
          </SoloCard>
        </div>
      </div>
    </SoloGameLayout>
  );
}

export default RequireAuth(DicePokerPage);
