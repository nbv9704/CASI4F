// client/src/app/game/roulette/page.js
"use client";

import RequireAuth from "@/components/RequireAuth";
import { useMemo, useState } from "react";
import useApi from "@/hooks/useApi";
import { useUser } from "@/context/UserContext";
import useExperienceSync from "@/hooks/useExperienceSync";
import { toast } from "react-hot-toast";
import SoloGameLayout from "@/components/solo/SoloGameLayout";
import SoloCard from "@/components/solo/SoloCard";
import { formatCoins } from "@/utils/format";

// Số trên bánh xe (European style: 0-36)
const WHEEL_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

// Màu sắc (0 = green, odd = red, even = black)
const getColor = (num) => {
  if (num === 0) return "green";
  return num % 2 === 0 ? "black" : "red";
};

// Ranges cho betting
const RANGES = ["1-9", "10-18", "19-27", "28-36"];

function RoulettePage() {
  const { post } = useApi();
  const { balance, updateBalance } = useUser();
  const syncExperience = useExperienceSync();

  const [betAmount, setBetAmount] = useState(5);
  const [betType, setBetType] = useState("color"); // 'zero' | 'range' | 'color' | 'number'
  const [betValue, setBetValue] = useState("red"); // red/black | range | number

  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [spinDegrees, setSpinDegrees] = useState(0);

  const handleSpin = async (e) => {
    e.preventDefault();

    if (betAmount <= 0) {
      toast.error("Bet must be > 0");
      return;
    }

    // Validate betValue
    if (betType === 'range' && !RANGES.includes(betValue)) {
      toast.error("Invalid range");
      return;
    }
    if (betType === 'color' && !['red', 'black'].includes(betValue)) {
      toast.error("Invalid color");
      return;
    }
    if (betType === 'number') {
      const num = parseInt(betValue);
      if (Number.isNaN(num) || num < 0 || num > 36) {
        toast.error("Number must be 0-36");
        return;
      }
    }

    setSpinning(true);
    setResult(null);

    try {
      const data = await post("/game/roulette", {
        betAmount,
        betType,
        betValue: betType === "number" ? parseInt(betValue) : betValue,
      });

      // Animation: spin wheel
      const resultNum = data.result?.number;
      const idx = WHEEL_NUMBERS.indexOf(resultNum);
      const segmentDeg = 360 / WHEEL_NUMBERS.length;
      const targetDeg = idx * segmentDeg;

      // Spin 5 full rotations + target position
      const finalDeg = 360 * 5 + targetDeg;
      setSpinDegrees(finalDeg);

      setTimeout(() => {
        setResult(data.result);
        updateBalance(data.balance);
        syncExperience(data);
        setSpinning(false);

        if (data.win) {
          toast.success(`🎉 You win! ${data.result.number} (${data.result.color})`);
        } else {
          toast.error(`😢 You lose. ${data.result.number} (${data.result.color})`);
        }
      }, 3000); // Match animation duration
    } catch (err) {
      setSpinning(false);
      // Error toast handled by useApi
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
        label: "Bet type",
        value: betType.toUpperCase(),
        hint: betType === "number" ? `Number ${betValue}` : betValue,
      },
      {
        label: "Last result",
        value: result ? `${result.number} ${result.color}` : "—",
      },
    ],
    [balance, betAmount, betType, betValue, result]
  );

  const colorClass = result?.color === "red" ? "text-rose-200" : result?.color === "black" ? "text-slate-100" : "text-emerald-200";

  const renderBetTypeButton = (type, label, accent) => {
    const active = betType === type;
    const baseClass = "rounded-2xl border px-4 py-4 text-sm font-semibold transition";
    const activeClass = "border-sky-400/50 bg-sky-500/20 shadow-lg shadow-sky-500/20";
    const inactiveClass = "border-white/10 bg-white/5 hover:border-white/30";

    return (
      <button
        type="button"
        onClick={() => {
          setBetType(type);
          if (type === "zero") setBetValue("0");
          if (type === "color") setBetValue("red");
          if (type === "range") setBetValue("1-9");
          if (type === "number") setBetValue("7");
        }}
        className={`${baseClass} ${active ? activeClass : inactiveClass}`}
        disabled={spinning}
      >
        <div className="text-xs uppercase tracking-[0.25em] text-white/50">{label}</div>
        <div className="mt-2 text-base font-semibold text-white">{accent}</div>
      </button>
    );
  };

  return (
    <SoloGameLayout
      title="🎡 Roulette"
      subtitle="Place your bet, commit to a pocket, and let the wheel decide the final landing spot."
      accent="Solo challenge"
      stats={headerStats}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <SoloCard className="flex flex-col items-center gap-6">
          <header className="w-full text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Wheel</p>
            <h2 className="text-lg font-semibold text-white">Spin to reveal the winning pocket</h2>
          </header>

          <div className="relative h-72 w-72">
            <svg
              viewBox="0 0 200 200"
              className={`h-full w-full ${spinning ? "animate-wheel-spin" : ""}`}
              style={{
                transform: `rotate(${spinDegrees}deg)`,
                transition: spinning ? "transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
              }}
            >
              {WHEEL_NUMBERS.map((num, idx) => {
                const angle = (idx * 360) / WHEEL_NUMBERS.length;
                const color = getColor(num);
                const fillColor =
                  color === "green" ? "#10b981" : color === "red" ? "#ef4444" : "#1f2937";

                return (
                  <g key={idx} transform={`rotate(${angle} 100 100)`}>
                    <path
                      d="M 100 100 L 100 10 A 90 90 0 0 1 109.7 10.5 Z"
                      fill={fillColor}
                      stroke="white"
                      strokeWidth="0.5"
                    />
                    <text
                      x="100"
                      y="25"
                      textAnchor="middle"
                      fill="white"
                      fontSize="8"
                      fontWeight="bold"
                    >
                      {num}
                    </text>
                  </g>
                );
              })}
              <circle cx="100" cy="100" r="20" fill="#fbbf24" stroke="white" strokeWidth="2" />
            </svg>

            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-2">
              <div className="h-0 w-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-amber-400" />
            </div>
          </div>

          <p className="text-sm text-white/60" suppressHydrationWarning>
            {spinning ? "Wheel in motion..." : "Lock in your bet then spin the wheel."}
          </p>
        </SoloCard>

        <div className="space-y-6">
          {result && !spinning ? (
            <SoloCard className="space-y-3">
              <header className="space-y-1 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Outcome</p>
                <h2 className="text-lg font-semibold text-white">{result.payout > 0 ? "Winner" : "House win"}</h2>
              </header>
              <div className={`rounded-3xl border ${result.payout > 0 ? "border-emerald-400/40 bg-emerald-500/20" : "border-rose-400/40 bg-rose-500/20"} px-6 py-6 text-center shadow-inner`}>
                <div className={`text-6xl font-semibold ${colorClass}`} suppressHydrationWarning>
                  {result.number}
                </div>
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
                  {result.color}
                </p>
                <p className="mt-4 text-2xl font-semibold text-white">
                  {result.payout > 0 ? `+${formatCoins(result.payout)}` : `-${formatCoins(betAmount)}`} coins
                </p>
              </div>
            </SoloCard>
          ) : null}

          <SoloCard>
            <form onSubmit={handleSpin} className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50" htmlFor="roulette-bet">
                  Bet amount
                </label>
                <input
                  id="roulette-bet"
                  type="number"
                  min="1"
                  value={betAmount}
                  onChange={(e) => setBetAmount(+e.target.value)}
                  className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-lg font-semibold text-white outline-none transition focus:border-sky-400 focus:bg-black/60 focus:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={spinning}
                />
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Bet type</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {renderBetTypeButton("zero", "Zero", "16x")}
                  {renderBetTypeButton("color", "Color", "2x")}
                  {renderBetTypeButton("range", "Range", "4x")}
                  {renderBetTypeButton("number", "Number", "36x")}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Select outcome</p>
                {betType === "color" ? (
                  <div className="grid grid-cols-2 gap-3">
                    {["red", "black"].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setBetValue(color)}
                        className={`rounded-2xl border px-6 py-6 text-lg font-semibold uppercase tracking-[0.25em] ${
                          betValue === color
                            ? "border-sky-400/50 bg-sky-500/20"
                            : "border-white/10 bg-white/5"
                        }`}
                        disabled={spinning}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                ) : null}

                {betType === "range" ? (
                  <div className="grid grid-cols-2 gap-3">
                    {RANGES.map((range) => (
                      <button
                        key={range}
                        type="button"
                        onClick={() => setBetValue(range)}
                        className={`rounded-2xl border px-4 py-4 text-sm font-semibold ${
                          betValue === range
                            ? "border-sky-400/50 bg-sky-500/20"
                            : "border-white/10 bg-white/5"
                        }`}
                        disabled={spinning}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                ) : null}

                {betType === "number" ? (
                  <div className="space-y-3">
                    <input
                      type="number"
                      min="0"
                      max="36"
                      value={betValue}
                      onChange={(e) => setBetValue(e.target.value)}
                      className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-lg font-semibold text-white outline-none transition focus:border-sky-400 focus:bg-black/60 focus:text-white"
                      placeholder="Enter number (0-36)"
                      disabled={spinning}
                    />
                    <div className="grid grid-cols-6 gap-1">
                      {Array.from({ length: 37 }).map((_, i) => {
                        const cellColor = getColor(i);
                        const active = betValue === String(i);
                        const base = "rounded-lg border p-2 text-xs font-semibold transition";
                        const palette =
                          cellColor === "green"
                            ? "border-emerald-400/50 bg-emerald-500/30"
                            : cellColor === "red"
                            ? "border-rose-400/50 bg-rose-500/30"
                            : "border-white/10 bg-white/10";
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setBetValue(String(i))}
                            className={`${base} ${palette} ${active ? "ring-2 ring-sky-300" : ""}`}
                            disabled={spinning}
                          >
                            {i}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {betType === "zero" ? (
                  <div className="rounded-3xl border border-emerald-400/40 bg-emerald-500/20 px-6 py-6 text-center">
                    <p className="text-5xl font-semibold text-emerald-200">0</p>
                    <p className="mt-2 text-sm font-semibold uppercase tracking-[0.3em] text-white/70">Green pocket</p>
                    <p className="mt-2 text-base font-semibold text-white">16x multiplier</p>
                  </div>
                ) : null}
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 px-5 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-gray-900 shadow-lg shadow-amber-500/30 transition hover:shadow-amber-500/50 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={spinning}
              >
                {spinning ? "Spinning..." : "Spin"}
              </button>
            </form>
          </SoloCard>
        </div>
      </div>
    </SoloGameLayout>
  );
}

export default RequireAuth(RoulettePage);