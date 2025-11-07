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

const ALLOWED_COLORS = ["red", "orange", "yellow", "green", "blue"];
const COLOR_THEMES = {
  red: "border-rose-400/40 bg-rose-500/30",
  orange: "border-orange-400/40 bg-orange-500/30",
  yellow: "border-amber-400/40 bg-amber-500/30",
  green: "border-emerald-400/40 bg-emerald-500/30",
  blue: "border-sky-400/40 bg-sky-500/30",
};

const NUMBER_MULTIPLIERS = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16 };
const COLOR_MULTIPLIERS = { 0: 0, 1: 0.5, 2: 1, 3: 2, 4: 4, 5: 8 };

function LuckyFivePage() {
  const { post } = useApi();
  const { balance, updateBalance } = useUser();
  const syncExperience = useExperienceSync();

  const [betAmount, setBetAmount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedNumbers, setSelectedNumbers] = useState([0, 5, 10, 15, 20]);
  const [selectedColors, setSelectedColors] = useState(["red", "orange", "yellow", "green", "blue"]);
  const [result, setResult] = useState(null);

  const handleNumberChange = (index, value) => {
    const num = parseInt(value, 10);
    const clamped = Number.isNaN(num) ? 0 : Math.min(Math.max(num, 0), 30);
    setSelectedNumbers((prev) => {
      const next = [...prev];
      next[index] = clamped;
      return next;
    });
  };

  const handleColorChange = (index, color) => {
    setSelectedColors((prev) => {
      const next = [...prev];
      next[index] = color;
      return next;
    });
  };

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
    setResult(null);

    try {
      const res = await post("/game/luckyfive", {
        betAmount,
        numbers: selectedNumbers,
        colors: selectedColors,
      });

      setResult(res);
      updateBalance(res.balance);
      syncExperience(res);

      if (res.win) {
        toast.success(`You won ${res.payouts?.totalPayout ?? 0} coins!`);
      } else {
        toast.error(`You lost ${betAmount} coins`);
      }
    } catch (err) {
      toast.error(err.message || "Failed to play");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPick = () => {
    const nums = [];
    while (nums.length < 5) {
      const n = Math.floor(Math.random() * 31);
      if (!nums.includes(n)) nums.push(n);
    }
    setSelectedNumbers(nums);

    const cols = Array.from({ length: 5 }, () => ALLOWED_COLORS[Math.floor(Math.random() * ALLOWED_COLORS.length)]);
    setSelectedColors(cols);
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
        label: "Number picks",
        value: selectedNumbers.join(", "),
      },
      {
        label: "Last outcome",
        value: result ? (result.win ? "Win" : "Loss") : "—",
        hint: result ? `${result.matches?.numberMatches ?? 0} number / ${result.matches?.colorMatches ?? 0} color` : undefined,
      },
    ],
    [balance, betAmount, selectedNumbers, result]
  );

  const resultNumbers = result?.result?.numbers ?? [];
  const resultColors = result?.result?.colors ?? [];

  return (
    <SoloGameLayout
      title="🎰 Lucky Five"
      subtitle="Lock in five numbers and five colors, then see how many match the draw."
      accent="Solo challenge"
      stats={headerStats}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <SoloCard className="space-y-6">
          <header className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Selections</p>
            <h2 className="text-lg font-semibold text-white">Tune your five lucky picks</h2>
          </header>

          <div className="grid gap-4 md:grid-cols-5">
            {selectedNumbers.map((num, index) => (
              <div key={`number-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">Number {index + 1}</p>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={num}
                  onChange={(event) => handleNumberChange(index, event.target.value)}
                  className="mt-3 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-center text-lg font-semibold text-white outline-none transition focus:border-violet-400 focus:bg-black/60"
                  disabled={loading}
                />
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            {selectedColors.map((color, index) => (
              <div key={`color-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">Color {index + 1}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {ALLOWED_COLORS.map((entry) => {
                    const active = selectedColors[index] === entry;
                    return (
                      <button
                        key={entry}
                        type="button"
                        onClick={() => handleColorChange(index, entry)}
                        disabled={loading}
                        className={`h-8 w-8 rounded-full border transition ${
                          active ? "ring-2 ring-white" : "ring-0"
                        } ${COLOR_THEMES[entry]}`}
                        title={entry}
                      />
                    );
                  })}
                </div>
                <div className={`mt-4 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white ${COLOR_THEMES[color]}`}>
                  {color}
                </div>
              </div>
            ))}
          </div>
        </SoloCard>

        <div className="space-y-6">
          <SoloCard className="space-y-5">
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50" htmlFor="luckyfive-bet">
                Bet amount
              </label>
              <input
                id="luckyfive-bet"
                type="number"
                min="1"
                value={betAmount}
                onChange={(event) => setBetAmount(+event.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-lg font-semibold text-white outline-none transition focus:border-violet-400 focus:bg-black/60 focus:text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <button
                type="button"
                onClick={handleQuickPick}
                disabled={loading}
                className="inline-flex flex-1 items-center justify-center rounded-2xl border border-violet-400/40 bg-violet-500/20 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:border-violet-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Quick pick
              </button>
              <button
                type="button"
                onClick={handlePlay}
                disabled={loading}
                className="inline-flex flex-1 items-center justify-center rounded-2xl border border-emerald-400/40 bg-gradient-to-r from-emerald-400 via-emerald-500 to-sky-500 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-gray-900 shadow-lg shadow-emerald-500/25 transition hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Playing..." : "Play"}
              </button>
            </div>
          </SoloCard>

          {result ? (
            <SoloCard className="space-y-6">
              <header className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Outcome</p>
                <h2 className="text-lg font-semibold text-white">Draw highlights</h2>
              </header>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">Drawn numbers</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {resultNumbers.map((number, index) => {
                      const matched = selectedNumbers.includes(number);
                      return (
                        <div
                          key={`result-number-${index}`}
                          className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-xl font-semibold text-white ${
                            matched ? "border-emerald-400/60 bg-emerald-500/30" : "border-white/10 bg-white/5"
                          }`}
                        >
                          {number}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">Drawn colors</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {resultColors.map((color, index) => {
                      const matched = selectedColors[index] === color;
                      return (
                        <div
                          key={`result-color-${index}`}
                          className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-xs font-semibold uppercase tracking-[0.2em] text-white ${
                            COLOR_THEMES[color]
                          } ${matched ? "ring-2 ring-white" : "ring-0"}`}
                        >
                          {color}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-sky-400/30 bg-sky-500/15 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">Number matches</p>
                  <p className="mt-2 text-3xl font-semibold text-white" suppressHydrationWarning>
                    {result.matches?.numberMatches ?? 0}/5
                  </p>
                  <p className="text-sm text-white/60">Multiplier {NUMBER_MULTIPLIERS[result.matches?.numberMatches ?? 0]}x</p>
                </div>
                <div className="rounded-2xl border border-violet-400/30 bg-violet-500/15 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">Color matches</p>
                  <p className="mt-2 text-3xl font-semibold text-white" suppressHydrationWarning>
                    {result.matches?.colorMatches ?? 0}/5
                  </p>
                  <p className="text-sm text-white/60">Multiplier {COLOR_MULTIPLIERS[result.matches?.colorMatches ?? 0]}x</p>
                </div>
              </div>

              <div className={`rounded-3xl border px-6 py-6 text-center shadow-inner ${
                result.win ? "border-emerald-400/40 bg-emerald-500/20" : "border-rose-400/40 bg-rose-500/20"
              }`}>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
                  Total result
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {result.win
                    ? `+${formatCoins(result.payouts?.totalPayout ?? 0)}`
                    : `-${formatCoins(betAmount)}`} coins
                </p>
                <p className="mt-2 text-xs text-white/70">
                  Numbers: +{formatCoins(result.payouts?.payoutNumber ?? 0)} · Colors: +{formatCoins(result.payouts?.payoutColor ?? 0)}
                </p>
              </div>
            </SoloCard>
          ) : null}

          <SoloCard className="space-y-4">
            <header className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Payout multipliers</p>
              <h2 className="text-lg font-semibold text-white">Know the odds before you play</h2>
            </header>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4 text-sm text-white/70">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Number matches</p>
                <div className="mt-3 space-y-2">
                  {Object.entries(NUMBER_MULTIPLIERS).map(([matches, multiplier]) => (
                    <div key={`num-mult-${matches}`} className="flex items-center justify-between">
                      <span>{matches} matches</span>
                      <span className="text-amber-200 font-semibold">{multiplier}x</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-4 text-sm text-white/70">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Color matches</p>
                <div className="mt-3 space-y-2">
                  {Object.entries(COLOR_MULTIPLIERS).map(([matches, multiplier]) => (
                    <div key={`color-mult-${matches}`} className="flex items-center justify-between">
                      <span>{matches} matches</span>
                      <span className="text-amber-200 font-semibold">{multiplier}x</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SoloCard>
        </div>
      </div>
    </SoloGameLayout>
  );
}

export default RequireAuth(LuckyFivePage);
