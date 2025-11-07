// components/battle/DicePokerDisplay.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import RevealingDiceFaces from "../RevealingDiceFaces";

const HAND_COLORS = {
  'Five of a Kind': 'text-purple-400',
  'Four of a Kind': 'text-pink-400',
  'Full House': 'text-red-400',
  'Straight': 'text-orange-400',
  'Three of a Kind': 'text-yellow-400',
  'Two Pair': 'text-green-400',
  'One Pair': 'text-blue-400',
  'High Card': 'text-gray-400'
};

function formatCoins(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  try {
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(numeric);
  } catch {
    return numeric;
  }
}

export default function DicePokerDisplay({ room, metadata, nameById }) {
  const rolls = metadata?.dicePoker?.rolls || [];
  const winners = metadata?.dicePoker?.winners || [];
  const [visibleDiceCount, setVisibleDiceCount] = useState(0);
  const [showFinalResults, setShowFinalResults] = useState(false);

  const revealKey = useMemo(() => {
    if (!rolls.length) return "";
    return rolls
      .map((roll) => {
        const diceValues = Array.isArray(roll?.dice) ? roll.dice.join(",") : "";
        return `${roll?.userId ?? "?"}:${diceValues}`;
      })
      .join("|");
  }, [rolls]);

  const maxDiceCount = useMemo(() => {
    if (!rolls.length) return 0;
    return rolls.reduce((max, roll) => {
      const length = Array.isArray(roll?.dice) ? roll.dice.length : 0;
      return Math.max(max, length);
    }, 0);
  }, [rolls]);

  const winnerLabels = useMemo(() => (
    Array.isArray(winners)
      ? winners
          .map((winnerId) => {
            const friendlyName = typeof nameById === "function" ? nameById(winnerId) : null;
            if (friendlyName && friendlyName !== "-") {
              return friendlyName;
            }
            const slotIndex = Array.isArray(room?.players)
              ? room.players.findIndex((player) => player && String(player.userId) === String(winnerId))
              : -1;
            return slotIndex >= 0 ? `Player ${slotIndex + 1}` : null;
          })
          .filter(Boolean)
      : []
  ), [room?.players, winners, nameById]);

  useEffect(() => {
    if (!rolls.length || maxDiceCount === 0) {
      setVisibleDiceCount(0);
      setShowFinalResults(false);
      return;
    }

    setVisibleDiceCount(0);
    setShowFinalResults(false);

    let cancelled = false;
    let current = 0;
    const timers = [];

    const revealNext = () => {
      if (cancelled) return;
      current += 1;
      setVisibleDiceCount(current);
      if (current >= maxDiceCount) {
        setShowFinalResults(true);
      } else {
        timers.push(setTimeout(revealNext, 3000));
      }
    };

    timers.push(setTimeout(revealNext, 100));

    return () => {
      cancelled = true;
      timers.forEach((timerId) => clearTimeout(timerId));
    };
  }, [revealKey, rolls.length, maxDiceCount]);
  
  if (rolls.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">🎲</div>
        <div className="text-white text-xl font-bold">Rolling dice...</div>
      </div>
    );
  }

  const resolveWinnerInfo = (winnerId) => {
    const friendlyName = typeof nameById === "function" ? nameById(winnerId) : null;
    const players = Array.isArray(room?.players) ? room.players : [];
    const playerEntry = players.find((entry) => String(entry?.userId) === String(winnerId)) || null;
    const displayName = friendlyName || playerEntry?.user?.displayName || playerEntry?.username || playerEntry?.user?.username || `Player ${players.findIndex((entry) => String(entry?.userId) === String(winnerId)) + 1}`;
    const avatar = playerEntry?.user?.avatar || playerEntry?.avatar || null;
    return { displayName, avatar };
  };

  const participantCount = Array.isArray(room?.players) ? room.players.filter(Boolean).length : 0;
  const totalPotRaw = Number(room?.betAmount || 0) * participantCount;
  const totalPot = Number.isFinite(totalPotRaw) ? totalPotRaw : 0;
  const splitValue = winners.length > 0 ? totalPot / winners.length : 0;

  return (
    <section className="w-full rounded-3xl border border-white/10 bg-white/5 shadow-lg shadow-black/30 backdrop-blur">
      <div className="w-full space-y-6 px-6 py-8">
        <header className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
          <span>Results</span>
        </header>
        
        {/* Results Grid */}
        <div className="flex flex-wrap justify-center gap-4">
          {rolls.map((roll) => {
          const isWinner = showFinalResults && winners.includes(String(roll.userId));
          const borderState = isWinner ? "border-emerald-400/80 ring-2 ring-emerald-400/25" : "border-white/15";
          const slotIndex = Array.isArray(room?.players)
            ? room.players.findIndex((player) => player && String(player.userId) === String(roll.userId))
            : -1;
          const playerLabel = slotIndex >= 0 ? `Player ${slotIndex + 1}` : "Player";
          const totalDice = Array.isArray(roll.dice) ? roll.dice.length : 0;
          const revealCount = Math.min(visibleDiceCount, totalDice);
          const partialSum = revealCount > 0 && Array.isArray(roll.dice)
            ? roll.dice.slice(0, revealCount).reduce((sum, value) => {
                const numeric = Number(value);
                return Number.isFinite(numeric) ? sum + numeric : sum;
              }, 0)
            : 0;
          const isRevealComplete = showFinalResults && revealCount === totalDice && totalDice > 0;
          
          return (
            <div
              key={roll.userId}
              className={`flex h-full w-full max-w-[280px] flex-col items-center gap-4 rounded-2xl border bg-white/5 p-5 text-center shadow-lg shadow-black/30 backdrop-blur min-h-[240px] ${borderState}`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/50">
                  {playerLabel}
                </span>
                {isWinner ? (
                  <span className="text-emerald-300 text-sm font-semibold">WINNER! 🏆</span>
                ) : (
                  <span className="h-4" aria-hidden="true" />
                )}
              </div>

              {/* Dice Display */}
              <RevealingDiceFaces
                dice={roll.dice}
                size="md"
                containerClassName="flex w-full justify-center flex-wrap gap-3"
                faceWrapperClassName="aspect-square w-[3.75rem] rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm flex items-center justify-center"
                faceClassName="shadow-lg"
                visibleClassName="opacity-100 scale-100"
                hiddenClassName="opacity-0 scale-95"
                visibleCount={revealCount}
              />

              {/* Hand Info */}
              <div className="space-y-1">
                {isRevealComplete ? (
                  <div className={`text-lg font-bold ${HAND_COLORS[roll.hand]}`}>
                    {roll.hand}
                  </div>
                ) : (
                  <div className="text-sm font-semibold uppercase tracking-[0.3em] text-white/40">
                    Revealing
                  </div>
                )}
                <div className="text-gray-300 text-sm">
                  Sum: {revealCount > 0 ? partialSum : "—"}
                  {isRevealComplete ? ` • x${roll.multiplier}` : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Winner Announcement */}
      {showFinalResults && winners.length > 0 && (
        <div className="mt-6 rounded-3xl border border-emerald-400/30 bg-emerald-500/15 px-5 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200">
                Winner{winners.length > 1 ? 's' : ''}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                {winners.map((winnerId, index) => {
                  const { displayName, avatar } = resolveWinnerInfo(winnerId);
                  const initials = displayName?.[0]?.toUpperCase?.() || '?';
                  const label = winnerLabels[index] || displayName;
                  return (
                    <div
                      key={winnerId}
                      className="flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-black/30 px-4 py-2 text-white shadow-inner"
                    >
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={displayName}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-400"
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/30 text-lg font-semibold text-emerald-100">
                          {initials}
                        </span>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-white line-clamp-1">{label}</p>
                        <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Victory confirmed</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {winners.length > 1 && (
                <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-black/25 px-4 py-3 text-sm text-emerald-100">
                  Split pot: {formatCoins(splitValue)} coins each
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 px-5 py-6 text-white lg:ml-6 lg:w-60">
              <div className="flex flex-col items-center text-center leading-tight">
                <span className="text-xs uppercase tracking-[0.35em] text-white/60">Prize pool</span>
                <span className="text-3xl font-semibold text-emerald-200">+{formatCoins(totalPot)}</span>
                <span className="text-xs text-white/50">coins distributed to winners</span>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </section>
  );
}
