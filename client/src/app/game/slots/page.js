"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";

import RequireAuth from "@/components/RequireAuth";
import SoloCard from "@/components/solo/SoloCard";
import SoloGameLayout from "@/components/solo/SoloGameLayout";
import { useUser } from "@/context/UserContext";
import useApi from "@/hooks/useApi";
import useExperienceSync from "@/hooks/useExperienceSync";
import { formatCoins } from "@/utils/format";

const SYMBOLS = [
  { name: "cherry", emoji: "🍒", multiplier: 1.25 },
  { name: "lemon", emoji: "🍋", multiplier: 1.5 },
  { name: "watermelon", emoji: "🍉", multiplier: 2 },
  { name: "heart", emoji: "❤️", multiplier: 3 },
  { name: "bell", emoji: "🔔", multiplier: 4 },
  { name: "diamond", emoji: "💎", multiplier: 5 },
  { name: "seven", emoji: "7️⃣", multiplier: 8 },
  { name: "horseshoe", emoji: "🐴", multiplier: 10 },
  { name: "money", emoji: "💰", multiplier: 20 },
];

function SlotsPage() {
  const { post } = useApi();
  const { balance, updateBalance } = useUser();
  const syncExperience = useExperienceSync();

  const [betAmount, setBetAmount] = useState(1);
  const [spinning, setSpinning] = useState(false);
  const [grid, setGrid] = useState([
    [SYMBOLS[0], SYMBOLS[1], SYMBOLS[2]],
    [SYMBOLS[3], SYMBOLS[4], SYMBOLS[5]],
    [SYMBOLS[6], SYMBOLS[7], SYMBOLS[8]],
  ]);
  const [result, setResult] = useState(null);
  const spinTimeoutRef = useRef(null);

  const headerStats = useMemo(() => {
    const outcomeLabel = result ? (result.win ? "Win" : "Loss") : "Awaiting spin";
    const multiplier = result?.totalMultiplier ? `${result.totalMultiplier}x` : "—";
    const lineHint = result?.winningLines?.length
      ? `${result.winningLines.length} line${result.winningLines.length > 1 ? "s" : ""}`
      : undefined;

    return [
      {
        label: "Wallet balance",
        value: `${formatCoins(balance)} coins`,
      },
      {
        label: "Bet amount",
        value: `${formatCoins(betAmount)} coins`,
      },
      {
        label: "Last result",
        value: outcomeLabel,
        hint: result ? `${formatCoins(result.payout ?? 0)} coins` : undefined,
      },
      {
        label: "Best multiplier",
        value: multiplier,
        hint: lineHint,
      },
    ];
  }, [balance, betAmount, result]);

  const handleSpin = async (event) => {
    event.preventDefault();

    if (betAmount <= 0) {
      toast.error("Bet must be positive");
      return;
    }

    if (balance < betAmount) {
      toast.error("Insufficient balance");
      return;
    }

    setSpinning(true);
    setResult(null);

    if (spinTimeoutRef.current) {
      clearTimeout(spinTimeoutRef.current);
      spinTimeoutRef.current = null;
    }

    try {
      const data = await post("/game/slots", { betAmount });

      const timeout = setTimeout(() => {
        const serverGrid = data.grid ?? [];
        const parsedGrid = serverGrid.map((row) =>
          row.map((emoji) => SYMBOLS.find((symbol) => symbol.emoji === emoji) ?? SYMBOLS[0])
        );

        setGrid(parsedGrid);
        setResult(data);
        updateBalance(data.balance);
        syncExperience(data);
        setSpinning(false);
        spinTimeoutRef.current = null;

        if (data.win) {
          toast.success(`🎉 You win! ${data.totalMultiplier}x - Payout: ${data.payout}`);
        } else {
          toast.error("😢 No winning lines this time");
        }
      }, 2000);

      spinTimeoutRef.current = timeout;
    } catch (error) {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
        spinTimeoutRef.current = null;
      }
      setSpinning(false);
    }
  };

  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
        spinTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <SoloGameLayout
      title="🎰 Slots"
      subtitle="Spin the neon reels and chase eight different win lines."
      accent="Solo challenge"
      stats={headerStats}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <SoloCard className="space-y-6">
          <header className="space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">Reel display</p>
            <h2 className="text-lg font-semibold text-white">Match symbols across rows, columns, or diagonals</h2>
          </header>

          <div className="rounded-3xl border border-amber-400/40 bg-gradient-to-br from-amber-500/20 via-rose-500/10 to-violet-500/20 p-6 shadow-xl shadow-amber-500/20">
            <div className="grid grid-cols-3 gap-4">
              {grid.map((row, rowIndex) =>
                row.map((symbol, columnIndex) => (
                  <div
                    key={`slot-cell-${rowIndex}-${columnIndex}`}
                    className={`flex h-28 items-center justify-center rounded-2xl border border-white/10 bg-black/40 text-6xl shadow-lg shadow-black/40 transition ${
                      spinning ? "animate-bounce" : ""
                    }`}
                    style={{
                      animationDelay: `${columnIndex * 0.15}s`,
                      filter: spinning ? "blur(4px)" : "none",
                    }}
                  >
                    {spinning ? "❓" : symbol.emoji}
                  </div>
                ))
              )}
            </div>
          </div>

          {result && !spinning ? (
            <div
              className={`rounded-3xl border px-6 py-6 text-center shadow-inner ${
                result.win ? "border-amber-400/40 bg-amber-500/20" : "border-white/15 bg-white/10"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">Round summary</p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {result.win ? "🎊 Jackpot!" : "😢 No win"}
              </p>
              <p className={`mt-2 text-2xl font-semibold ${result.win ? "text-emerald-200" : "text-white/60"}`}>
                {result.win ? `+${formatCoins(result.payout ?? 0)}` : `-${formatCoins(betAmount)}`} coins
              </p>
              {result.win ? (
                <p className="mt-2 text-sm text-amber-200">
                  Total multiplier {result.totalMultiplier}x · {result.winningLines?.length ?? 0} winning line
                  {result.winningLines && result.winningLines.length !== 1 ? "s" : ""}
                </p>
              ) : null}
            </div>
          ) : null}

          {!result && !spinning ? (
            <p className="text-center text-sm text-white/60">
              Spin to see winnings and collect bright payouts.
            </p>
          ) : null}
        </SoloCard>

        <div className="space-y-6">
          <SoloCard className="space-y-6">
            <form className="space-y-6" onSubmit={handleSpin}>
              <div className="space-y-2">
                <label
                  className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50"
                  htmlFor="slots-bet"
                >
                  Bet amount
                </label>
                <input
                  id="slots-bet"
                  type="number"
                  min="1"
                  value={betAmount}
                  onChange={(event) => setBetAmount(+event.target.value)}
                  className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-lg font-semibold text-white outline-none transition focus:border-amber-400 focus:bg-black/60 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={spinning}
                />
              </div>

              <button
                type="submit"
                disabled={spinning}
                className="inline-flex w-full items-center justify-center rounded-2xl border border-rose-400/40 bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500 px-4 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-gray-900 shadow-lg shadow-rose-500/25 transition hover:shadow-rose-500/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {spinning ? "Spinning..." : "Spin now"}
              </button>
            </form>
          </SoloCard>

          <SoloCard className="space-y-4">
            <header className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Paytable</p>
              <h2 className="text-lg font-semibold text-white">Three-of-a-kind rewards</h2>
            </header>
            <div className="grid grid-cols-2 gap-3 text-sm text-white/70 md:grid-cols-3">
              {SYMBOLS.map((symbol) => (
                <div
                  key={symbol.name}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <span className="text-3xl">{symbol.emoji}</span>
                  <span className="font-semibold text-amber-200">{symbol.multiplier}x</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm text-white/70">
              <p>• Win across 3 rows, 3 columns, or 2 diagonals — 8 lines total.</p>
              <p>• Multiple winning lines stack to boost your total payout.</p>
              <p>• Keep an eye out for the 💰 symbol for the biggest rewards.</p>
            </div>
          </SoloCard>
        </div>
      </div>
    </SoloGameLayout>
  );
}

export default RequireAuth(SlotsPage);