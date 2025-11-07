"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import DiceFace from "@/components/DiceFace";
import RequireAuth from "@/components/RequireAuth";
import SoloCard from "@/components/solo/SoloCard";
import SoloGameLayout from "@/components/solo/SoloGameLayout";
import { useUser } from "@/context/UserContext";
import useApi from "@/hooks/useApi";
import useExperienceSync from "@/hooks/useExperienceSync";
import { formatCoins } from "@/utils/format";

const renderDice = (value, size = "md") => {
  if (value >= 1 && value <= 6) {
    return <DiceFace value={value} size={size} />;
  }

  return <span className="text-4xl font-bold text-white">{value}</span>;
};

function BlackjackDicePage() {
  const { post } = useApi();
  const { balance, updateBalance } = useUser();
  const syncExperience = useExperienceSync();

  const [betAmount, setBetAmount] = useState(10);
  const [activeBet, setActiveBet] = useState(null);
  const [state, setState] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [hasPendingGame, setHasPendingGame] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState(null);

  const checkGame = useCallback(async () => {
    try {
      const data = await post("/game/blackjackdice/check");
      if (data.active) {
        setHasPendingGame(true);
        setState({
          playerDice: data.state.playerDice,
          playerSum: data.state.playerSum,
          dealerVisible: data.state.dealerVisible,
          dealerDice: null,
          dealerSum: null,
          outcome: null,
          payout: null,
          balance: data.state.balance,
          betAmount: null,
        });
        setIsActive(false);
      }
    } catch (error) {
      console.error(error);
    }
  }, [post]);

  useEffect(() => {
    void checkGame();
  }, [checkGame]);

  const handleStart = async (event) => {
    event.preventDefault();

    if (betAmount <= 0) {
      toast.error("Bet amount must be positive");
      return;
    }

    if (balance < betAmount) {
      toast.error("Insufficient balance");
      return;
    }

    setProcessing(true);
    setProcessingAction("start");

    try {
      const data = await post("/game/blackjackdice/start", { betAmount });
      setState({
        playerDice: data.playerDice,
        playerSum: data.playerSum,
        dealerVisible: data.dealerVisible,
        dealerDice: null,
        dealerSum: null,
        outcome: null,
        payout: null,
        balance: data.balance,
        betAmount,
      });
      updateBalance(data.balance);
      setActiveBet(betAmount);
      setIsActive(true);
      setHasPendingGame(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
      setProcessingAction(null);
    }
  };

  const handleResume = async () => {
    setProcessing(true);
    setProcessingAction("resume");

    try {
      const data = await post("/game/blackjackdice/resume");
      setState({
        playerDice: data.playerDice,
        playerSum: data.playerSum,
        dealerVisible: data.dealerVisible,
        dealerDice: null,
        dealerSum: null,
        outcome: null,
        payout: null,
        balance: data.balance,
        betAmount: activeBet,
      });
      updateBalance(data.balance);
      setIsActive(true);
      setHasPendingGame(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
      setProcessingAction(null);
    }
  };

  const handleAbandon = async () => {
    setProcessing(true);
    setProcessingAction("abandon");

    try {
      await post("/game/blackjackdice/abandon");
      toast("Game abandoned");
      setHasPendingGame(false);
      setState(null);
      setActiveBet(null);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
      setProcessingAction(null);
    }
  };

  const handleHit = async () => {
    setProcessing(true);
    setProcessingAction("hit");

    try {
      const data = await post("/game/blackjackdice/hit");

      if (data.outcome) {
        setState((previous) => {
          if (!previous) return previous;
          return {
            ...previous,
            playerDice: data.playerDice,
            playerSum: data.playerSum,
            dealerDice: data.dealerDice,
            dealerSum: data.dealerSum,
            outcome: data.outcome,
            payout: data.payout,
            balance: data.balance,
          };
        });
        updateBalance(data.balance);
        syncExperience(data);
        setIsActive(false);

        if (data.outcome === "win") {
          toast.success(`🎉 You win! Payout: ${data.payout}`);
        } else if (data.outcome === "lose") {
          toast.error("😢 You lose.");
        } else if (data.outcome === "tie") {
          toast(`😐 It's a tie. Refund: ${data.payout}`, { icon: "ℹ️" });
        }
      } else {
        setState((previous) => {
          if (!previous) return previous;
          return {
            ...previous,
            playerDice: data.playerDice,
            playerSum: data.playerSum,
            dealerVisible: data.dealerVisible,
            balance: data.balance,
          };
        });
        updateBalance(data.balance);
        syncExperience(data);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
      setProcessingAction(null);
    }
  };

  const handleStand = async () => {
    setProcessing(true);
    setProcessingAction("stand");

    try {
      const data = await post("/game/blackjackdice/stand");
      setState((previous) => {
        if (!previous) return previous;
        return {
          ...previous,
          playerDice: data.playerDice,
          playerSum: data.playerSum,
          dealerDice: data.dealerDice,
          dealerSum: data.dealerSum,
          outcome: data.outcome,
          payout: data.payout,
          balance: data.balance,
        };
      });
      updateBalance(data.balance);
      syncExperience(data);
      setIsActive(false);

      if (data.outcome === "win") {
        toast.success(`🎉 You win! Payout: ${data.payout}`);
      } else if (data.outcome === "lose") {
        toast.error("😢 You lose.");
      } else if (data.outcome === "tie") {
        toast(`😐 It's a tie. Refund: ${data.payout}`, { icon: "ℹ️" });
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
      setProcessingAction(null);
    }
  };

  const dealerToShow = !isActive && state?.dealerDice ? state.dealerDice : state?.dealerVisible ?? [];

  const headerStats = useMemo(() => {
    const currentBet = state?.betAmount ?? activeBet;
    let dealerValue = "Awaiting game";
    let dealerHint;

    if (state) {
      if (!isActive && state.dealerSum != null) {
        dealerValue = `${state.dealerSum}`;
      } else {
        const revealed = (state.dealerVisible ?? []).filter(Boolean).length;
        dealerValue = `${revealed} revealed`;
      }

      if (state.outcome) {
        dealerHint = state.outcome === "win" ? "Win" : state.outcome === "lose" ? "Loss" : "Tie";
      }
    }

    return [
      {
        label: "Wallet balance",
        value: `${formatCoins(balance)} coins`,
      },
      {
        label: "Current bet",
        value: currentBet != null ? `${formatCoins(currentBet)} coins` : "—",
        hint: hasPendingGame ? "Pending game" : undefined,
      },
      {
        label: "Player total",
        value: state ? `${state.playerSum}` : "Awaiting game",
      },
      {
        label: "Dealer",
        value: dealerValue,
        hint: dealerHint,
      },
    ];
  }, [balance, activeBet, state, isActive, hasPendingGame]);

  return (
    <SoloGameLayout
      title="🃏 Blackjack Dice"
      subtitle="Hit or stand to get closer to 21 than the dealer without busting."
      accent="Solo challenge"
      stats={headerStats}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <div className="space-y-6">
          <SoloCard className="space-y-6">
            <header className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Your hand</p>
                <h2 className="text-lg font-semibold text-white">Player total</h2>
              </div>
              <div className="text-2xl font-semibold text-emerald-300">
                {state ? state.playerSum : "—"}
              </div>
            </header>

            <div className="flex flex-wrap gap-3">
              {state ? (
                state.playerDice.map((die, index) => (
                  <div key={`player-die-${index}`} className="flex h-20 w-20 items-center justify-center">
                    {renderDice(die, "lg")}
                  </div>
                ))
              ) : (
                Array.from({ length: 2 }).map((_, index) => (
                  <div
                    key={`player-placeholder-${index}`}
                    className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-3xl text-white/40"
                  >
                    🎲
                  </div>
                ))
              )}
            </div>
          </SoloCard>

          <SoloCard className="space-y-6">
            <header className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Dealer hand</p>
                <h2 className="text-lg font-semibold text-white">What the house shows</h2>
              </div>
              <div className="text-2xl font-semibold text-rose-300">
                {!isActive && state?.dealerSum != null ? state.dealerSum : "?"}
              </div>
            </header>

            <div className="flex flex-wrap gap-3">
              {dealerToShow.length > 0
                ? dealerToShow.map((die, index) => (
                    die === null ? (
                      <div
                        key={`dealer-hidden-${index}`}
                        className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-3xl text-white/60"
                      >
                        ❓
                      </div>
                    ) : (
                      <div key={`dealer-die-${index}`} className="flex h-20 w-20 items-center justify-center">
                        {renderDice(die, "lg")}
                      </div>
                    )
                  ))
                : Array.from({ length: 2 }).map((_, index) => (
                    <div
                      key={`dealer-placeholder-${index}`}
                      className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-3xl text-white/40"
                    >
                      🎲
                    </div>
                  ))}
            </div>
          </SoloCard>

          {!isActive && state?.outcome ? (
            <SoloCard
              className={`space-y-3 text-center ${
                state.outcome === "win"
                  ? "border border-emerald-400/40 bg-emerald-500/20"
                  : state.outcome === "lose"
                  ? "border border-rose-400/40 bg-rose-500/20"
                  : "border border-white/20 bg-white/10"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
                Round complete
              </p>
              <p className="text-2xl font-semibold text-white">
                {state.outcome === "win"
                  ? "🎉 You win!"
                  : state.outcome === "lose"
                  ? "😢 You lose"
                  : "🤝 Tie"}
              </p>
              <p className="text-3xl font-semibold text-white">
                {state.outcome === "win"
                  ? `+${formatCoins(state.payout ?? 0)}`
                  : state.outcome === "lose"
                  ? `-${formatCoins(state.betAmount ?? betAmount)}`
                  : formatCoins(state.payout ?? 0)}
                {" "}coins
              </p>
            </SoloCard>
          ) : null}
        </div>

        <div className="space-y-6">
          {!isActive && !hasPendingGame ? (
            <SoloCard>
              <form className="space-y-4" onSubmit={handleStart}>
                <div className="space-y-2">
                  <label
                    className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50"
                    htmlFor="blackjackdice-bet"
                  >
                    Bet amount
                  </label>
                  <input
                    id="blackjackdice-bet"
                    type="number"
                    min="1"
                    value={betAmount}
                    onChange={(event) => setBetAmount(+event.target.value)}
                    className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-lg font-semibold text-white outline-none transition focus:border-emerald-400 focus:bg-black/60 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={processing}
                  />
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-emerald-400/40 bg-gradient-to-r from-emerald-400 via-emerald-500 to-amber-500 px-4 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-gray-900 shadow-lg shadow-emerald-500/25 transition hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {processingAction === "start" ? "Starting..." : "Start game"}
                </button>
              </form>
            </SoloCard>
          ) : null}

          {!isActive && hasPendingGame ? (
            <SoloCard className="space-y-4 text-center">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200">Pending game</p>
                <h2 className="text-lg font-semibold text-white">Continue or abandon your previous round</h2>
                <p className="text-sm text-white/70">We saved the table for you—pick up where you left off.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleResume}
                  disabled={processing}
                  className="rounded-2xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100 transition hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {processingAction === "resume" ? "Resuming..." : "Continue"}
                </button>
                <button
                  type="button"
                  onClick={handleAbandon}
                  disabled={processing}
                  className="rounded-2xl border border-rose-400/40 bg-rose-500/20 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-rose-100 transition hover:bg-rose-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {processingAction === "abandon" ? "Abandoning..." : "Abandon"}
                </button>
              </div>
            </SoloCard>
          ) : null}

          {isActive ? (
            <SoloCard className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Choose your move</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleHit}
                  disabled={processing}
                  className="rounded-2xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-6 text-lg font-semibold uppercase tracking-[0.2em] text-emerald-100 transition hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {processingAction === "hit" ? "Rolling..." : "🎲 Hit"}
                </button>
                <button
                  type="button"
                  onClick={handleStand}
                  disabled={processing}
                  className="rounded-2xl border border-amber-400/40 bg-amber-500/20 px-4 py-6 text-lg font-semibold uppercase tracking-[0.2em] text-amber-100 transition hover:bg-amber-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {processingAction === "stand" ? "Settling..." : "✋ Stand"}
                </button>
              </div>
            </SoloCard>
          ) : null}

          <SoloCard className="space-y-3 text-sm text-white/70">
            <header className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">How to play</p>
              <h2 className="text-lg font-semibold text-white">Rules refresher</h2>
            </header>
            <ul className="space-y-2">
              <li><span className="font-semibold text-white">Goal:</span> Reach 21 or get closer than the dealer without busting.</li>
              <li><span className="font-semibold text-white">Hit:</span> Roll another die to add to your total.</li>
              <li><span className="font-semibold text-white">Stand:</span> Lock your total and let the dealer finish.</li>
              <li><span className="font-semibold text-white">Dealer rule:</span> Dealer rolls until 17 or higher.</li>
              <li><span className="font-semibold text-white">Outcome:</span> Win pays 2x, tie refunds your bet, bust loses it.</li>
            </ul>
          </SoloCard>
        </div>
      </div>
    </SoloGameLayout>
  );
}

export default RequireAuth(BlackjackDicePage);
