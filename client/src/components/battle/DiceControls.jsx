// components/battle/DiceControls.jsx
"use client";
import ServerCountdown from "@/components/ServerCountdown";

export default function DiceControls({
  room,
  metadata,
  rolling,
  currentTurnLabel,
  isMyTurn,
  myRollValue,
  pendingIsMine,
  rollDisabled,
  rollDisabledBool,
  pending,
  revealCountdown,
  onRoll,
}) {
  const resolvedPending = pending ?? metadata?.pending ?? null;
  const dicePending = Boolean(resolvedPending);
  const hasResult = typeof myRollValue === "number";
  const isMyPending = Boolean(pendingIsMine);
  const revealTarget = revealCountdown ?? resolvedPending?.revealAt;
  const showRevealCountdown = Boolean(dicePending && revealTarget && !rolling && !hasResult);

  let displayRoll;
  if (rolling) {
    displayRoll = "🎲";
  } else if (showRevealCountdown) {
    displayRoll = (
      <div className="flex flex-col items-center justify-center gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white">
        <span>Reveal</span>
        <ServerCountdown
          serverNow={room.serverNow}
          target={revealTarget}
          className="text-base font-bold text-amber-100"
        />
      </div>
    );
  } else if (hasResult) {
    displayRoll = myRollValue;
  } else {
    displayRoll = "X";
  }

  const isNumericRoll = typeof displayRoll === "number";
  const isCountdown = showRevealCountdown;
  const turnLabel = currentTurnLabel ? `${currentTurnLabel}${isMyTurn ? " (Bạn)" : ""}` : "-";

  let statusLine = "Ready to roll";
  if (rolling) statusLine = "Rolling...";
  else if (isMyPending && dicePending) statusLine = "Awaiting reveal...";
  else if (dicePending) statusLine = "Waiting for other players";
  else if (hasResult) statusLine = "Roll locked";

  const buttonLabel = rolling ? "Rolling..." : "Roll dice";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-5 py-6 shadow-lg shadow-black/30">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5" aria-hidden="true" />
      <div className="relative flex flex-col gap-5">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">Current turn</p>
            <p className="text-lg font-semibold text-white">{turnLabel}</p>
          </div>
          {dicePending && (
            <span className="inline-flex items-center rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-amber-100">
              Reveal pending
            </span>
          )}
        </header>

        <div className="flex flex-col items-center gap-3">
          <div
            className={`w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl border-4 border-white/20 shadow-2xl flex items-center justify-center ${
              isNumericRoll
                ? "text-5xl font-extrabold"
                : isCountdown
                  ? ""
                  : "text-2xl font-bold uppercase tracking-wide"
            } ${rolling ? "animate-dice-roll-3d" : ""}`}
            style={{ perspective: "800px" }}
          >
            {displayRoll}
          </div>
          <span className="text-sm font-semibold text-white/70">{statusLine}</span>

          {dicePending && (
            <div className="flex flex-col items-center gap-1 text-xs text-white/60">
              <span className="flex items-center gap-2">
                Reveal in
                <ServerCountdown
                  serverNow={room.serverNow}
                  target={revealTarget}
                  className="font-semibold text-amber-100"
                />
              </span>
              <span className="flex items-center gap-2">
                Next turn in
                <ServerCountdown
                  serverNow={room.serverNow}
                  target={resolvedPending?.advanceAt}
                  className="font-semibold text-sky-100"
                />
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="inline-flex w-full items-center justify-center rounded-2xl border border-indigo-400/30 bg-indigo-500/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-indigo-300 hover:text-white disabled:cursor-not-allowed disabled:border-white/15 disabled:bg-white/10 disabled:text-white/50"
          onClick={onRoll}
          disabled={rollDisabledBool}
          title={rollDisabled || "Roll your dice!"}
        >
          {buttonLabel}
        </button>

        {rollDisabledBool && !rolling && rollDisabled && (
          <p className="text-xs text-white/50">{rollDisabled}</p>
        )}
      </div>
    </section>
  );
}
