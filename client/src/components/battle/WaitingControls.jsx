// components/battle/WaitingControls.jsx
"use client";

import {
  CheckCircle2,
  Loader2,
  LogOut,
  Trash2,
  UserPlus2,
  UsersRound,
} from "lucide-react";

export default function WaitingControls({
  room,
  dice,
  myPlayer,
  isOwner,
  // Handlers
  onInvite,
  onReady,
  onLeave,
  onDelete,
  // Loading states
  inviting,
  readying,
  leaving,
  deleting,
}) {
  const players = Array.isArray(room.players) ? room.players : [];
  const readyCount = players.filter((player) => player?.ready).length;
  const hasEnoughPlayers = players.length >= 2;
  const isMyPlayerReady = Boolean(myPlayer?.ready);
  const otherPlayers = players.filter(
    (player) => String(player?.userId) !== String(myPlayer?.userId)
  );
  const allOthersReady = otherPlayers.length > 0 && otherPlayers.every((player) => player?.ready);

  const readyDisabled =
    readying ||
    isMyPlayerReady ||
    !hasEnoughPlayers ||
    (isOwner && !allOthersReady);

  let readyTooltip = "Click to ready up";
  if (!hasEnoughPlayers) {
    readyTooltip = "Need at least 2 players";
  } else if (isMyPlayerReady) {
    readyTooltip = "You are already ready";
  } else if (isOwner && !allOthersReady) {
    readyTooltip = "Wait until all players are ready";
  } else if (readying) {
    readyTooltip = "Confirming...";
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-lg shadow-black/30 backdrop-blur">
      <div
        className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-amber-500/10"
        aria-hidden="true"
      />
      <div className="relative flex flex-col gap-6 px-6 py-6">
        <header className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
              Ready check
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/60">
              <UsersRound className="h-3.5 w-3.5" aria-hidden="true" />
              {readyCount}/{players.length || 0} ready
            </span>
          </div>
          <h2 className="text-lg font-semibold text-white">
            {room.game === "coinflip" && "Coinflip lobby"}
            {room.game === "dice" && `Dice lobby (d${dice?.sides || 6})`}
            {room.game === "dicepoker" && "Dice poker lobby"}
            {room.game === "blackjackdice" && "Blackjack dice lobby"}
          </h2>
          {room.game === "coinflip" && myPlayer?.side && (
            <p className="text-sm text-amber-100/80">
              Your coin side: <span className="font-semibold uppercase">{myPlayer.side}</span>
            </p>
          )}
        </header>

        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={onReady}
            disabled={readyDisabled}
            title={readyTooltip}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {readying ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            )}
            {readying ? "Getting ready..." : isMyPlayerReady ? "You are ready" : "Ready up"}
          </button>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onInvite}
              disabled={Boolean(inviting)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {inviting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <UserPlus2 className="h-4 w-4" aria-hidden="true" />
              )}
              {inviting ? "Sending invite" : "Invite"}
            </button>

            {isOwner ? (
              <button
                type="button"
                onClick={onDelete}
                disabled={Boolean(deleting)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-500/20 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:border-rose-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                )}
                {deleting ? "Removing" : "Delete"}
              </button>
            ) : (
              <button
                type="button"
                onClick={onLeave}
                disabled={Boolean(leaving)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {leaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                )}
                {leaving ? "Leaving" : "Leave"}
              </button>
            )}
          </div>
        </div>

        <footer className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
          {players.length < 2 && (
            <span>Waiting for another player to join...</span>
          )}
          {players.length >= 2 && !allOthersReady && !isMyPlayerReady && (
            <span>Ready up when you are set. The host will auto-start once everyone confirms.</span>
          )}
          {players.length >= 2 && isMyPlayerReady && !allOthersReady && (
            <span>Great! You are ready. {isOwner ? "Start will trigger when everyone else confirms." : "Waiting on the remaining players."}</span>
          )}
          {players.length >= 2 && allOthersReady && !isOwner && !isMyPlayerReady && (
            <span>Everyone is ready. Hit ready to begin!</span>
          )}
          {players.length >= 2 && allOthersReady && isOwner && !isMyPlayerReady && (
            <span>All challengers confirmed. Hit ready to launch the battle.</span>
          )}
          {players.length >= 2 && allOthersReady && isMyPlayerReady && (
            <span className="font-semibold text-emerald-200">All players ready! Starting in 3 seconds…</span>
          )}
        </footer>
      </div>
    </section>
  );
}
