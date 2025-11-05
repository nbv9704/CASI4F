// components/battle/GameResult.jsx
"use client";

export default function GameResult({ 
  room, 
  dice, 
  metadata,
  isRevealing,
  finalFace,
  getFlipResult,
  winners,
  pot,
  nameById,
  avatarById
}) {
  if (room.status !== "finished") return null;

  const safeGetFlipResult = typeof getFlipResult === "function" ? getFlipResult : () => null;
  const safeNameById = typeof nameById === "function" ? nameById : () => "";
  const safeAvatarById = typeof avatarById === "function" ? avatarById : () => "";
  const safeWinners = Array.isArray(winners) ? winners : [];

  const diceMax = dice?.result?.max ?? "?";
  const flip = safeGetFlipResult(metadata);
  const coinResultText = typeof flip === "string" && flip.length
    ? flip.toUpperCase()
    : finalFace || "?";
  const hasWinners = safeWinners.length > 0;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
      {/* Result Display */}
      <div className="flex flex-col items-center mb-6">
        {room.game === "dice" ? (
          <div className="w-32 h-32 bg-white rounded-xl shadow-2xl flex items-center justify-center text-7xl font-bold border-4 border-gray-300">
            {diceMax}
          </div>
        ) : (
          <div className={`w-40 h-40 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-8 border-yellow-200 shadow-2xl flex items-center justify-center text-6xl ${
            isRevealing ? 'animate-spin' : ''
          }`}>
            {coinResultText === "HEADS" ? "H" : coinResultText === "TAILS" ? "T" : "💰"}
          </div>
        )}
        <div className="mt-4 text-white text-2xl font-bold">
          {room.game === "dice" ? `Rolled: ${diceMax}` : coinResultText}
        </div>
      </div>

      {/* Winner Announcement */}
      {hasWinners && (
        <div className="text-center p-6 rounded-lg bg-green-500/30 mb-4">
          <p className="text-white text-lg font-semibold mb-3">🎉 WINNER{safeWinners.length > 1 ? "S" : ""}!</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {safeWinners.map((wid) => {
              const name = safeNameById(wid);
              const ava = safeAvatarById(wid);
              return (
                <div key={wid} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                  {ava && (
                    <img
                      src={ava}
                      alt={name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-yellow-400 shadow-lg"
                    />
                  )}
                  <span className="text-yellow-400 font-bold text-xl">{name}</span>
                </div>
              );
            })}
          </div>
          <p className="text-white text-4xl font-bold mt-4">
            +{pot} coins
          </p>
        </div>
      )}

      {/* Dice Rolls Detail */}
      {room.game === "dice" && Array.isArray(dice?.rolls) && (
        <div className="bg-white/10 rounded-lg p-4">
          <div className="font-semibold mb-3 text-white text-lg">All Rolls:</div>
          <div className="space-y-2">
            {dice.rolls.map((r, i) => {
              const name = safeNameById(r.userId);
              const show = typeof r.value === "number" ? r.value : "-";
              const isWin = (dice?.result?.winners || []).includes(String(r.userId));
              return (
                <div 
                  key={i} 
                  className={`flex items-center justify-between p-2 rounded ${
                    isWin ? "bg-green-500/20" : "bg-white/5"
                  }`}
                >
                  <span className={isWin ? "text-green-400 font-bold" : "text-gray-300"}>
                    {name}
                  </span>
                  <span className={isWin ? "text-green-400 font-bold text-xl" : "text-white text-lg"}>
                    {show} {isWin && "✅"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
