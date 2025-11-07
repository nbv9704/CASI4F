// components/battle/PlayerSlot.jsx
"use client";

import { CheckCircle2, Clock3, Dice5, UserRound } from "lucide-react";

const IMAGE_PROTOCOL_REGEX = /^(https?:|data:|blob:)/i;

export default function PlayerSlot({
  slotIndex,
  player,
  avatar,
  displayName,
  isCurrentTurn,
  gameType,
  roomStatus,
  // Dice specific
  rollValue,
  suppressMyRoll,
  myId,
}) {
  const isCurrent = player && String(player.userId) === String(myId);
  const showRoll = gameType === "dice" && Boolean(player);
  const actualRoll = isCurrent && suppressMyRoll ? "-" : rollValue;
  const rollDisplay = actualRoll === undefined || actualRoll === null ? "-" : actualRoll;
  const hasAvatarImage = typeof avatar === "string" && IMAGE_PROTOCOL_REGEX.test(avatar);
  const initials = (displayName || "?").slice(0, 2).toUpperCase();

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30 transition duration-300 hover:border-amber-400/60 hover:shadow-amber-500/20">
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(253,224,71,0.15), transparent 55%)",
        }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-white/50">
              Player {slotIndex + 1}
            </span>
            <p className={`mt-2 text-lg font-semibold ${player ? "text-white" : "text-white/60"}`}>
              {player ? displayName : "Waiting for challenger"}
            </p>
          </div>

          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/10 shadow-inner shadow-black/40">
            {player ? (
              hasAvatarImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatar}
                  alt={displayName || "Player avatar"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-base font-semibold text-white">
                  {initials}
                </div>
              )
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white/40">
                <UserRound className="h-5 w-5" aria-hidden="true" />
              </div>
            )}
          </div>
        </div>

        {player ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em]">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${player.ready ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-100" : "border-amber-400/40 bg-amber-500/20 text-amber-100"}`}
              >
                {player.ready ? (
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {player.ready ? "READY" : "WAITING"}
              </span>

            </div>

            {gameType === "coinflip" && player.side && (
              <div className="flex items-center gap-3 rounded-xl border border-amber-400/30 bg-amber-500/15 px-4 py-3 text-sm text-amber-100">
                <CoinsIcon aria-hidden="true" />
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-[0.3em] text-amber-200/70">Chosen side</span>
                  <span className="text-base font-semibold text-amber-50">
                    {player.side === "heads" ? "Heads" : "Tails"}
                  </span>
                </div>
              </div>
            )}

            {showRoll && (
              <div className="flex items-center gap-3 rounded-xl border border-cyan-400/30 bg-cyan-500/15 px-4 py-3 text-sm text-cyan-100">
                <Dice5 className="h-4 w-4" aria-hidden="true" />
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Roll</span>
                  <span className="text-lg font-semibold text-cyan-50">{rollDisplay}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/15 bg-black/20 py-8 text-center">
            <UserRound className="h-10 w-10 text-white/35" aria-hidden="true" />
            <p className="text-sm text-white/60">Slot is open. Invite a friend to join.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CoinsIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      {...props}
    >
      <path
        d="M4 7C4 5.34315 8.47715 4 14 4C19.5228 4 24 5.34315 24 7C24 8.65685 19.5228 10 14 10C8.47715 10 4 8.65685 4 7Z"
        fill="currentColor"
        opacity="0.6"
      />
      <path
        d="M4 12C4 10.3431 8.47715 9 14 9C19.5228 9 24 10.3431 24 12C24 13.6569 19.5228 15 14 15C8.47715 15 4 13.6569 4 12Z"
        fill="currentColor"
        opacity="0.75"
      />
      <path
        d="M4 17C4 15.3431 8.47715 14 14 14C19.5228 14 24 15.3431 24 17C24 18.6569 19.5228 20 14 20C8.47715 20 4 18.6569 4 17Z"
        fill="currentColor"
      />
    </svg>
  );
}
