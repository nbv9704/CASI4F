// client/src/app/game/coinflip/page.js
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

function CoinflipPage() {
  const [betAmount, setBetAmount] = useState(10);
  const [side, setSide] = useState("heads");
  const [result, setResult] = useState(null);
  const [isFlipping, setIsFlipping] = useState(false);

  const { post } = useApi();
  const { balance, updateBalance } = useUser();
  const syncExperience = useExperienceSync();

  const handleFlip = async (e) => {
    e.preventDefault();
    if (betAmount <= 0) {
      toast.error("Bet must be > 0");
      return;
    }
    setIsFlipping(true);
    setResult(null);

    try {
      const data = await post("/game/coinflip", { betAmount, side });

      setTimeout(() => {
        setResult({
          result: data.result,
          win: data.win,
          payout: data.payout,
          balance: data.balance,
        });
        updateBalance(data.balance);
        syncExperience(data);
        setIsFlipping(false);

        if (data.win) {
          toast.success(`🎉 You win! The coin showed ${data.result}`);
        } else {
          toast.error(`😢 You lose. The coin showed ${data.result}`);
        }
      }, 1500);
    } catch (err) {
      toast.error(err.message || "Flip failed");
      setIsFlipping(false);
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
        label: "Chosen side",
        value: side.toUpperCase(),
      },
      {
        label: "Last result",
        value: result ? result.result.toUpperCase() : "—",
        hint: result ? (result.win ? "Win" : "Loss") : undefined,
      },
    ],
    [balance, betAmount, side, result]
  );

  const sideButton = (value, icon) => {
    const active = side === value;
    return (
      <button
        type="button"
        onClick={() => setSide(value)}
        disabled={isFlipping}
        className={`rounded-2xl border px-6 py-6 text-center transition ${
          active
            ? "border-amber-400/40 bg-amber-500/20 shadow-lg shadow-amber-500/20"
            : "border-white/10 bg-white/5 hover:border-white/30"
        }`}
      >
        <div className="text-5xl" aria-hidden="true">
          {icon}
        </div>
        <div className="mt-3 text-sm font-semibold uppercase tracking-[0.3em] text-white">
          {value}
        </div>
      </button>
    );
  };

  return (
    <SoloGameLayout
      title="🪙 Coinflip"
      subtitle="Choose heads or tails, commit your wager, then see where the coin lands."
      accent="Solo challenge"
      stats={headerStats}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <SoloCard className="flex flex-col items-center gap-6">
          <header className="w-full text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Coin state</p>
            <h2 className="text-lg font-semibold text-white">Watch the coin settle on its fate</h2>
          </header>

          <div
            className={`flex h-44 w-44 items-center justify-center rounded-full border border-amber-400/40 bg-gradient-to-br from-amber-400 via-amber-500 to-rose-500 text-5xl shadow-lg shadow-amber-500/40 ${
              isFlipping ? "animate-spin" : ""
            }`}
            aria-live="polite"
          >
            {isFlipping
              ? "?"
              : result?.result === "heads"
              ? "👑"
              : result?.result === "tails"
              ? "⚡"
              : "🪙"}
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
            {isFlipping ? "Coin flipping..." : result ? result.result.toUpperCase() : "Ready"}
          </p>
        </SoloCard>

        <div className="space-y-6">
          <SoloCard>
            <form onSubmit={handleFlip} className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50" htmlFor="coinflip-bet">
                  Bet amount
                </label>
                <input
                  id="coinflip-bet"
                  type="number"
                  min="1"
                  value={betAmount}
                  onChange={(e) => setBetAmount(+e.target.value)}
                  className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-lg font-semibold text-white outline-none transition focus:border-amber-400 focus:bg-black/60 focus:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isFlipping}
                />
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Choose your side</p>
                <div className="grid grid-cols-2 gap-4">
                  {sideButton("heads", "👑")}
                  {sideButton("tails", "⚡")}
                </div>
              </div>

              <button
                type="submit"
                disabled={isFlipping}
                className="inline-flex w-full items-center justify-center rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-300 via-amber-400 to-rose-400 px-5 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-gray-900 shadow-lg shadow-amber-500/30 transition hover:shadow-amber-500/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isFlipping ? "Flipping..." : "Flip coin"}
              </button>
            </form>
          </SoloCard>

          {result && !isFlipping ? (
            <SoloCard className="space-y-4">
              <header className="space-y-1 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Outcome</p>
                <h2 className="text-lg font-semibold text-white">{result.win ? "Victory" : "House win"}</h2>
              </header>
              <div className={`rounded-3xl border px-6 py-6 text-center shadow-inner ${
                result.win ? "border-emerald-400/40 bg-emerald-500/20" : "border-rose-400/40 bg-rose-500/20"
              }`}>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                  Coin landed on
                </p>
                <p className="mt-2 text-5xl" aria-live="polite">
                  {result.result === "heads" ? "👑" : "⚡"}
                </p>
                <p className="mt-4 text-2xl font-semibold text-white">
                  {result.win ? `+${formatCoins(result.payout)}` : `-${formatCoins(betAmount)}`} coins
                </p>
              </div>
            </SoloCard>
          ) : null}

          <SoloCard className="space-y-4">
            <header className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">How to play</p>
              <h2 className="text-lg font-semibold text-white">Fair flips, even odds</h2>
            </header>
            <ul className="space-y-2 text-sm text-white/70">
              <li>Choose heads (👑) or tails (⚡).</li>
              <li>Set your stake and lock in the flip.</li>
              <li>Correct call returns <span className="text-amber-200">2x</span> your bet.</li>
              <li>Every result is provably fair and verifiable.</li>
            </ul>
          </SoloCard>
        </div>
      </div>
    </SoloGameLayout>
  );
}

export default RequireAuth(CoinflipPage);
