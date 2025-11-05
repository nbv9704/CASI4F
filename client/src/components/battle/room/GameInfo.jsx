// client/src/components/battle/room/GameInfo.jsx
"use client";

export default function GameInfo({ room, dice, md, onVerifyClick }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500/10 via-red-500/10 to-yellow-500/10 backdrop-blur-sm border border-orange-500/20 shadow-2xl p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none"></div>
      <div className="relative z-10 flex items-center justify-between">
        <div className="space-y-2">
          <div className="text-sm text-orange-200/70 font-medium">🎮 Game</div>
          <div className="text-2xl font-bold text-white capitalize">{room.game}</div>
          <div className="flex items-center gap-2 text-yellow-200">
            <span className="text-lg">💰</span>
            <span className="text-lg font-semibold">{room.betAmount}</span>
          </div>
          {room.game === "dice" && dice?.sides && (
            <div className="flex items-center gap-2 text-orange-200 text-sm mt-2">
              <span>🎲</span>
              <span className="font-medium">d{dice.sides}</span>
            </div>
          )}
        </div>
        <div className="text-right space-y-3">
          <div>
            <div className="text-sm text-orange-200/70 font-medium mb-1">Status</div>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
              room.status === 'waiting' ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30' :
              room.status === 'active' ? 'bg-green-500/20 text-green-200 border border-green-500/30' :
              'bg-gray-500/20 text-gray-200 border border-gray-500/30'
            }`}>
              {room.status === 'waiting' ? '⏳' : room.status === 'active' ? '⚔️' : '🏁'}
              <span className="capitalize">{room.status}</span>
            </div>
          </div>
          {md?.serverSeedHash && room.status !== "finished" && (
            <div className="text-xs text-orange-200/50 truncate max-w-[200px]">
              🔒 {md.serverSeedHash.slice(0, 16)}...
            </div>
          )}
          <button
            onClick={onVerifyClick}
            className="group relative px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-400/50 text-purple-200 hover:text-white text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20"
            title="Verify fairness"
          >
            <span className="relative z-10">🛡️ Verify Fairness</span>
          </button>
        </div>
      </div>
    </div>
  );
}
