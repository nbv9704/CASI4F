// components/battle/RoomHeader.jsx
"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Coins,
  Copy,
  Check,
  Hash,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

const STATUS_STYLES = {
  waiting: "border-amber-400/40 bg-amber-500/15 text-amber-100",
  active: "border-emerald-400/40 bg-emerald-500/15 text-emerald-100",
  finished: "border-slate-500/45 bg-slate-600/30 text-slate-100",
  default: "border-indigo-400/40 bg-indigo-500/20 text-indigo-100",
};

function formatCoins(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return value;
  }
  try {
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 2,
    }).format(numeric);
  } catch {
    return numeric;
  }
}

function getGameInfo(game) {
  switch (game) {
    case "coinflip":
      return { emoji: "💰", title: "Coinflip" };
    case "dice":
      return { emoji: "🎲", title: "Dice Game" };
    case "dicepoker":
      return { emoji: "🎲", title: "Dice Poker" };
    case "blackjackdice":
      return { emoji: "🃏", title: "Blackjack Dice" };
    default:
      return { emoji: "🎮", title: "Battle Game" };
  }
}

export default function RoomHeader({
  room,
  dice,
  onVerifyClick,
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  const { emoji, title } = getGameInfo(room?.game);
  const players = Array.isArray(room?.players) ? room.players : [];
  const joinedCount = useMemo(
    () => players.filter(Boolean).length,
    [players]
  );

  const maxPlayers = room?.maxPlayers || Math.max(players.length, 2);
  const roomCode =
    room?.roomId || room?.code || room?.shortId || room?._id || room?.id || "";
  const statusKey = String(room?.status || "waiting").toLowerCase();
  const statusStyles = STATUS_STYLES[statusKey] || STATUS_STYLES.default;
  const StatusChipIcon = useMemo(() => {
    if (statusKey === "active") return CheckCircle2;
    if (statusKey === "finished") return CheckCircle2;
    return Clock3;
  }, [statusKey]);
  const canVerify = statusKey === "finished";

  const handleBack = () => {
    router.push(`/game/battle/${room?.game || ""}`);
  };

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleVerify = () => {
    if (!canVerify) return;
    if (typeof onVerifyClick === "function") {
      onVerifyClick();
    }
  };

  const handleCopyRoomId = async () => {
    if (!roomCode) return;
    try {
      await navigator.clipboard.writeText(String(roomCode));
      setCopied(true);
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error("Copy room id failed:", err);
    }
  };

  const betAmount = formatCoins(room?.betAmount ?? 0);
  return (
  <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-lg shadow-black/30 backdrop-blur">
      <div
        className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5"
        aria-hidden="true"
      />
      <div
        className="absolute -right-12 -top-12 h-52 w-52 rounded-full bg-white/15 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative flex flex-col gap-6 px-6 py-7 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to lobby
          </button>

          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <button
              type="button"
              onClick={handleVerify}
              disabled={!canVerify}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300 hover:text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-white/50"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              {canVerify ? "Verify fairness" : "Awaiting result"}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/60">
              Battle room
            </div>
            <div className="flex items-center gap-3 text-white">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl">
                {emoji}
              </span>
              <div>
                <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
                {room?.game === "dice" && dice?.sides ? (
                  <p className="text-sm text-white/70">Playing with a d{dice.sides} set</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="lg:flex lg:justify-end">
            <div className="grid w-full gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4 lg:text-sm">
              <div className="flex min-h-[92px] flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-white/80">
                <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.35em] text-white/50">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-400/15 text-indigo-200">
                    <Hash className="h-4 w-4" aria-hidden="true" />
                  </span>
                  Room ID
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <span className="text-center">{roomCode || "—"}</span>
                  <button
                    type="button"
                    onClick={handleCopyRoomId}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white/70 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!roomCode}
                    aria-label="Copy room ID"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex min-h-[92px] flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-white/80">
                <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.35em] text-white/50">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400/15 text-amber-200">
                    <Coins className="h-4 w-4" aria-hidden="true" />
                  </span>
                  Bet
                </div>
                <span className="text-sm font-semibold text-white">{betAmount}</span>
              </div>

              <div className="flex min-h-[92px] flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-white/80">
                <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.35em] text-white/50">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-400/15 text-sky-200">
                    <UsersRound className="h-4 w-4" aria-hidden="true" />
                  </span>
                  Players
                </div>
                <span className="text-sm font-semibold text-white">
                  {joinedCount}/{maxPlayers}
                </span>
              </div>

              <div className="flex min-h-[92px] flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-white/80">
                <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.35em] text-white/50">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-400/15 text-purple-200">
                    <Clock3 className="h-4 w-4" aria-hidden="true" />
                  </span>
                  Status
                </div>
                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] ${statusStyles}`}>
                  <StatusChipIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  {statusKey.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
