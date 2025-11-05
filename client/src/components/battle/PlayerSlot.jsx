// components/battle/PlayerSlot.jsx
"use client";

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
  const showRoll = gameType === "dice" && player;
  const actualRoll = isCurrent && suppressMyRoll ? "-" : rollValue;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 relative hover:bg-white/15 transition-all border border-white/20">
      {avatar && (
        <img
          src={avatar}
          alt="avatar"
          className="w-12 h-12 rounded-full absolute top-3 right-3 object-cover ring-2 ring-yellow-400/50 shadow-lg"
        />
      )}
      
      <div className="text-xs text-gray-400 font-semibold mb-2">PLAYER {slotIndex + 1}</div>
      
      {player ? (
        <>
          <div className="font-bold text-lg break-all pr-14 text-white mb-2">
            {displayName}
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            {player.ready ? (
              <span className="px-2 py-1 bg-green-500/30 text-green-400 text-xs font-bold rounded">
                ✓ READY
              </span>
            ) : (
              <span className="px-2 py-1 bg-yellow-500/30 text-yellow-400 text-xs font-bold rounded">
                WAITING
              </span>
            )}
            {isCurrent && (
              <span className="px-2 py-1 bg-blue-500/30 text-blue-400 text-xs font-bold rounded">
                YOU
              </span>
            )}
          </div>

          {gameType === "coinflip" && player.side && (
            <div className="text-sm bg-white/10 rounded px-2 py-1 inline-block">
              <span className="text-gray-300">Side: </span>
              <span className="text-yellow-400 font-bold">
                {player.side === "heads" ? "H HEADS" : "T TAILS"}
              </span>
            </div>
          )}

          {showRoll && (
            <div className="text-sm bg-white/10 rounded px-2 py-1 inline-block">
              <span className="text-gray-300">Roll: </span>
              <span className="text-cyan-400 font-bold text-lg">{actualRoll}</span>
              {roomStatus === "active" && isCurrentTurn && (
                <span className="text-green-400 ml-2 font-semibold">← TURN</span>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-4">
          <div className="text-4xl mb-2 opacity-30">👤</div>
          <div className="text-gray-500 italic">Waiting for player...</div>
        </div>
      )}
    </div>
  );
}
