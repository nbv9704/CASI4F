// components/battle/DiceControls.jsx
"use client";
import ServerCountdown from "@/components/ServerCountdown";

export default function DiceControls({
  room,
  metadata,
  rolling,
  pendingValue,
  dicePending,
  currentUserId,
  myRollValue,
  rollDisabled,
  rollDisabledBool,
  onRoll,
}) {
  const currentPlayer = currentUserId 
    ? room.players?.find(p => String(p.userId) === String(currentUserId))
    : null;
  
  const currentPlayerName = currentPlayer?.user?.username || String(currentUserId).slice(-6) || "-";

  const diceDisplay = rolling 
    ? "?" 
    : (pendingValue ?? (myRollValue === "-" ? "?" : myRollValue));

  const diceNumberColor = rolling ? "text-yellow-200" : "text-blue-800";

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
      {/* Current Turn Info */}
      <div className="text-center mb-4">
        <div className="text-gray-300 text-sm">Current Turn:</div>
        <div className="text-white text-xl font-bold">{currentPlayerName}</div>
      </div>

      {/* Dice Display */}
      <div className="flex flex-col items-center mb-6">
        <div
          className={`w-32 h-32 bg-white rounded-xl shadow-2xl flex items-center justify-center text-7xl font-bold border-4 border-gray-300 ${
            rolling ? "animate-bounce" : ""
          }`}
        >
          <span className={diceNumberColor}>{diceDisplay}</span>
        </div>
        <div className="mt-4 text-white text-2xl font-bold">
          {rolling ? "Rolling..." : dicePending ? "Pending..." : "Ready!"}
        </div>
        
        {dicePending && (
          <div className="mt-2 text-sm text-gray-300 space-y-1">
            <div>
              Reveal in{" "}
              <span className="text-yellow-400 font-semibold">
                <ServerCountdown
                  serverNow={room.serverNow}
                  target={metadata?.pending?.revealAt}
                />
              </span>
            </div>
            <div>
              Next turn in{" "}
              <span className="text-cyan-400 font-semibold">
                <ServerCountdown
                  serverNow={room.serverNow}
                  target={metadata?.pending?.advanceAt}
                />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Roll Button */}
      <button
        className="w-full px-8 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-bold text-xl transition-colors"
        onClick={onRoll}
        disabled={rollDisabledBool}
        title={rollDisabled || "Roll your dice!"}
      >
        {rolling ? "ROLLING..." : "ROLL DICE"}
      </button>
    </div>
  );
}
