// client/src/components/battle/room/DiceControls.jsx
"use client";

import ServerCountdown from "@/components/ServerCountdown";

export default function DiceControls({
  room,
  md,
  rolling,
  pendingValue,
  getRollFor,
  myId,
  curUserId,
  dicePending,
  rollDisabledBool,
  rollDisabled,
  onRoll
}) {
  const currentPlayerName = curUserId
    ? room.players?.find((p) => String(p.userId) === String(curUserId))?.user?.username ||
      String(curUserId).slice(-6)
    : "-";

  const pendingDisplay = pendingValue ?? (getRollFor(myId) === "-" ? "?" : getRollFor(myId));
  const displayRoll = rolling ? "🎲" : pendingDisplay;
  const isNumericRoll = !rolling && Number.isFinite(Number(displayRoll));

  return (
    <div className="relative z-10 mt-6 rounded-3xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-red-500/10 backdrop-blur-sm border border-purple-500/20 shadow-2xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div
            className={`w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl border-4 border-white/20 shadow-2xl flex items-center justify-center ${
              isNumericRoll ? "text-5xl font-extrabold" : "text-2xl font-bold uppercase tracking-wide"
            } ${rolling ? "animate-dice-roll-3d" : ""}`}
            style={{ perspective: "800px" }}
          >
            {displayRoll}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-purple-200/70">Current Turn:</span>
              <span className="text-lg font-bold text-white">
                {currentPlayerName}
              </span>
            </div>
            {dicePending && (
              <div className="flex flex-col gap-1 text-xs text-pink-200/70">
                <div className="flex items-center gap-2">
                  <span>🔮 Reveal in</span>
                  <ServerCountdown
                    serverNow={room.serverNow}
                    target={md?.pending?.revealAt}
                    className="font-bold text-pink-300"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span>⏭️ Next turn in</span>
                  <ServerCountdown
                    serverNow={room.serverNow}
                    target={md?.pending?.advanceAt}
                    className="font-bold text-pink-300"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 hover:border-yellow-400/50 text-yellow-200 hover:text-white text-lg font-bold transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={onRoll}
          disabled={rollDisabledBool}
          title={rollDisabled || "Roll your dice!"}
        >
          <span className="relative z-10">
            {rolling ? "🎲 Rolling..." : "🎲 Roll Dice"}
          </span>
        </button>
      </div>
    </div>
  );
}
