// client/src/components/battle/room/WaitingControls.jsx
"use client";

export default function WaitingControls({
  room,
  dice,
  myPlayer,
  isOwner,
  inviting,
  leaving,
  readying,
  deleting,
  starting,
  onInvite,
  onLeave,
  onReady,
  onDelete,
  onStart,
  canStart
}) {
  return (
    <>
      <div className="relative z-10 mt-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm border border-indigo-500/20 p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-white">
              <span className="text-xl">
                {room.game === "dice" ? "🎲" : "🪙"}
              </span>
              <span className="text-lg font-bold">
                {room.game === "dice"
                  ? `Dice (d${dice?.sides || 6})`
                  : "Coinflip"}
              </span>
            </div>
            {room.game === "coinflip" && myPlayer?.side && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-indigo-200/70">Your side:</span>
                <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                  myPlayer.side === 'heads' ? 'bg-blue-500/20 text-blue-200 border border-blue-500/30' :
                  'bg-red-500/20 text-red-200 border border-red-500/30'
                }`}>
                  {myPlayer.side === 'heads' ? '🪙 HEADS' : '🎯 TAILS'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-wrap gap-3 mt-6">
        <button 
          className="group relative px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 hover:border-blue-400/50 text-blue-200 hover:text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed" 
          onClick={onInvite} 
          disabled={inviting}
        >
          <span className="relative z-10">
            {inviting ? "⏳ Inviting..." : "📧 Invite Player"}
          </span>
        </button>

        {!isOwner && (
          <>
            <button 
              className="group relative px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 hover:border-red-400/50 text-red-200 hover:text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={onLeave} 
              disabled={leaving}
            >
              <span className="relative z-10">
                {leaving ? "⏳ Leaving..." : "🚪 Leave Room"}
              </span>
            </button>
            <button 
              className="group relative px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 hover:border-green-400/50 text-green-200 hover:text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={onReady} 
              disabled={readying}
            >
              <span className="relative z-10">
                {readying ? "⏳ Ready..." : "✅ Ready"}
              </span>
            </button>
          </>
        )}

        {isOwner && (
          <>
            <button 
              className="group relative px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 hover:border-red-400/50 text-red-200 hover:text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={onDelete} 
              disabled={deleting}
            >
              <span className="relative z-10">
                {deleting ? "⏳ Deleting..." : "🗑️ Delete Room"}
              </span>
            </button>
            <button
              className="group relative px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 hover:border-yellow-400/50 text-yellow-200 hover:text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={onStart}
              disabled={!canStart || starting}
              title="All participants must be Ready (min 2 players)"
            >
              <span className="relative z-10">
                {starting ? "⏳ Starting..." : "🚀 Start Game"}
              </span>
            </button>
          </>
        )}
      </div>
    </>
  );
}
