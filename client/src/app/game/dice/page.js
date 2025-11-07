"use client";

import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import RequireAuth from "@/components/RequireAuth";
import SoloCard from "@/components/solo/SoloCard";
import SoloGameLayout from "@/components/solo/SoloGameLayout";
import DiceFace from "@/components/DiceFace";
import { useUser } from "@/context/UserContext";
import useExperienceSync from "@/hooks/useExperienceSync";
import useApi from "@/hooks/useApi";
import { formatCoins } from "@/utils/format";

const ALLOWED_SIDES = [4, 6, 8, 10, 12, 20];
const MULTIPLIERS = { 4: 2, 6: 3, 8: 4, 10: 5, 12: 6, 20: 10 };

function DicePage() {
  const [betAmount, setBetAmount] = useState(10);
  const [sides, setSides] = useState(6);
  const [guess, setGuess] = useState(3);
  const [result, setResult] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const { post } = useApi();
  const { balance, updateBalance } = useUser();
  const syncExperience = useExperienceSync();

  const handleRoll = async () => {
    if (betAmount <= 0) {
      toast.error("Bet must be > 0");
      return;
    }
    if (guess < 1 || guess > sides) {
      toast.error(`Guess must be 1..${sides}`);
      return;
    }

    setIsRolling(true);
    setResult(null);

    setTimeout(async () => {
      try {
        const data = await post("/game/dice", { betAmount, sides, guess });
        setResult({
          result: data.result,
          win: data.win,
          payout: data.payout,
          balance: data.balance,
          sides: data.sides,
        });
        updateBalance(data.balance);
        syncExperience(data);
        if (data.win) {
          toast.success(`🎉 You win! Rolled ${data.result} on d${data.sides}`);
        } else {
          toast.error(`😢 You lose. Rolled ${data.result} on d${data.sides}`);
        }
      } catch (err) {
        toast.error(err.message || "Roll failed");
      } finally {
        setIsRolling(false);
      }
    }, 1000);
  };

  const renderDice = (value) => {
    if (sides === 6 && value >= 1 && value <= 6) {
      return <DiceFace value={value} size="2xl" className="h-full w-full" />;
    }
    return <span className="text-6xl font-bold text-slate-900">{value}</span>;
  };

  const renderIdleDice = () => {
    if (sides === 6) {
      return <DiceFace value={3} size="2xl" className="h-full w-full" />;
    }
    return <span className="text-6xl">🎲</span>;
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
        label: "Dice",
        value: `d${sides}`,
        hint: `${MULTIPLIERS[sides]}x payout`,
      },
      {
        label: "Guess",
        value: guess,
        hint: result ? `Result ${result.result}` : "Awaiting roll",
      },
    ],
    [balance, betAmount, sides, guess, result]
  );

  return (
    <SoloGameLayout
      title="🎲 Dice Game"
      subtitle="Pick your die, choose a face, and wager on the roll."
      accent="Solo challenge"
      stats={headerStats}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <SoloCard className="flex flex-col items-center gap-6">
          <header className="w-full text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Dice outcome</p>
            <h2 className="text-lg font-semibold text-white">Watch the roll unfold</h2>
          </header>

          <div
            className={`flex h-32 w-32 items-center justify-center rounded-3xl border border-sky-400/40 bg-white text-6xl font-semibold text-slate-900 shadow-lg shadow-sky-500/20 ${
              isRolling ? "animate-bounce" : ""
            }`}
          >
            {isRolling ? "?" : result ? renderDice(result.result) : renderIdleDice()}
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
            {isRolling ? "Rolling" : result ? `Rolled ${result.result}` : "Ready"}
          </p>
        </SoloCard>

        <div className="space-y-6">
          <SoloCard className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50" htmlFor="dice-bet">
                Bet amount
              </label>
              <input
                id="dice-bet"
                type="number"
                min="1"
                value={betAmount}
                onChange={(event) => setBetAmount(+event.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-lg font-semibold text-white outline-none transition focus:border-sky-400 focus:bg-black/60 focus:text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isRolling}
              />
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Dice type</p>
              <div className="grid grid-cols-3 gap-3">
                {ALLOWED_SIDES.map((value) => {
                  const active = sides === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setSides(value);
                        if (guess > value) setGuess(1);
                      }}
                      disabled={isRolling}
                      className={`rounded-2xl border px-4 py-4 text-sm font-semibold transition ${
                        active
                          ? "border-sky-400/50 bg-sky-500/20 shadow-lg shadow-sky-500/20"
                          : "border-white/10 bg-white/5 hover:border-white/30"
                      }`}
                    >
                      <span className="block text-base font-semibold text-white">d{value}</span>
                      <span className="text-xs uppercase tracking-[0.3em] text-white/60">{MULTIPLIERS[value]}x</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50" htmlFor="dice-guess">
                Guess (1 - {sides})
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="dice-guess"
                  type="number"
                  min="1"
                  max={sides}
                  value={guess}
                  onChange={(event) => setGuess(+event.target.value)}
                  className="flex-1 rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-lg font-semibold text-white outline-none transition focus:border-sky-400 focus:bg-black/60 focus:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isRolling}
                />
                <button
                  type="button"
                  onClick={handleRoll}
                  disabled={isRolling}
                  className="inline-flex items-center justify-center rounded-2xl border border-emerald-400/40 bg-gradient-to-r from-emerald-400 via-emerald-500 to-sky-500 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-gray-900 shadow-lg shadow-emerald-500/25 transition hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isRolling ? "Rolling" : "Roll dice"}
                </button>
              </div>
            </div>
          </SoloCard>

          {result && !isRolling ? (
            <SoloCard className="space-y-4">
              <header className="space-y-1 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Outcome</p>
                <h2 className="text-lg font-semibold text-white">{result.win ? "Winner" : "House win"}</h2>
              </header>
              <div className={`rounded-3xl border px-6 py-6 text-center shadow-inner ${
                result.win ? "border-emerald-400/40 bg-emerald-500/20" : "border-rose-400/40 bg-rose-500/20"
              }`}>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
                  You guessed {guess} · rolled {result.result}
                </p>
                <p className="mt-4 text-3xl font-semibold text-white">
                  {result.win ? `+${formatCoins(result.payout)}` : `-${formatCoins(betAmount)}`} coins
                </p>
              </div>
            </SoloCard>
          ) : null}

          <SoloCard className="space-y-4">
            <header className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Multiplier table</p>
              <h2 className="text-lg font-semibold text-white">Understand the odds</h2>
            </header>
            <div className="grid grid-cols-2 gap-3 text-sm text-white/70 md:grid-cols-3">
              {ALLOWED_SIDES.map((value) => (
                <div
                  key={`mult-${value}`}
                  className={`rounded-2xl border px-4 py-3 transition ${
                    sides === value ? "border-sky-400/40 bg-sky-500/15" : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">d{value}</span>
                    <span className="text-amber-200 font-semibold">{MULTIPLIERS[value]}x</span>
                  </div>
                  <p className="mt-1 text-xs text-white/60">1 in {value} chance</p>
                </div>
              ))}
            </div>
            <ul className="space-y-2 text-sm text-white/60">
              <li>Choose a die between d4 and d20.</li>
              <li>Higher sides mean bigger payouts but tougher odds.</li>
              <li>Match the exact roll to receive the multiplier.</li>
            </ul>
          </SoloCard>
        </div>
      </div>
    </SoloGameLayout>
  );
}

export default RequireAuth(DicePage);
