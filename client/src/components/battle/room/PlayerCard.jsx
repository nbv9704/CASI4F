// client/src/components/battle/room/PlayerCard.jsx
"use client";

export default function PlayerCard({ 
  player, 
  slotIndex, 
  isCurrentTurn, 
  isWinner,
  gameType,
  gameStatus,
  getRollFor,
  myId,
  suppressMyRoll,
  getDisplayName,
  getAvatar
}) {
  const p = player;
  const avatar = p ? getAvatar(p) : null;

  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 ${
      p ? 'bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm border-2 border-blue-500/30 shadow-xl' : 
      'bg-gradient-to-br from-gray-500/5 to-gray-600/5 backdrop-blur-sm border-2 border-dashed border-gray-500/20'
    } ${isWinner ? 'ring-4 ring-yellow-400/50 shadow-2xl shadow-yellow-500/20' : ''}`}>
      {isWinner && (
        <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          👑 WINNER
        </div>
      )}
      {avatar && (
        <img
          src={avatar}
          alt="avatar"
          className="w-12 h-12 rounded-full absolute top-3 right-3 object-cover ring-4 ring-white/20 shadow-lg"
        />
      )}
      <div className="text-xs font-medium text-blue-200/70 mb-2">
        🎯 Slot {slotIndex + 1}
      </div>
      {p ? (
        <>
          <div className="mt-1 text-lg font-bold text-white break-all pr-14 mb-3">
            {getDisplayName(p)}
          </div>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
            p.ready ? 'bg-green-500/20 text-green-200 border border-green-500/30' : 
            'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30'
          }`}>
            {p.ready ? '✅' : '⏳'}
            <span>{p.ready ? 'Ready' : 'Not Ready'}</span>
          </div>

          {gameType === "coinflip" && p.side && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="text-orange-200/70">Side:</span>
              <span className={`px-3 py-1 rounded-lg font-bold ${
                p.side === 'heads' ? 'bg-blue-500/20 text-blue-200 border border-blue-500/30' :
                'bg-red-500/20 text-red-200 border border-red-500/30'
              }`}>
                {p.side === 'heads' ? '🪙 HEADS' : '🎯 TAILS'}
              </span>
            </div>
          )}

          {gameType === "dice" && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="text-orange-200/70">Roll:</span>
              <span className="px-3 py-1 rounded-lg font-bold bg-purple-500/20 text-purple-200 border border-purple-500/30">
                🎲 {String(p.userId) === String(myId) && suppressMyRoll ? "?" : getRollFor(p.userId)}
              </span>
              {gameStatus === "active" && isCurrentTurn && (
                <span className="ml-1 text-yellow-300 animate-pulse">← Your Turn</span>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="mt-1 text-gray-400/70 text-center py-4">
          <div className="text-3xl mb-2">👤</div>
          <div className="text-sm">Waiting for player...</div>
        </div>
      )}
    </div>
  );
}
