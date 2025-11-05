// components/battle/WaitingControls.jsx
"use client";

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
  const allReady = room.players?.length >= 2 && room.players.every(p => p.ready);
  const isMyPlayerReady = myPlayer?.ready || false;
  const hasEnoughPlayers = room.players?.length >= 2;
  
  // Owner can only ready when all other players are ready
  // Non-owner can ready anytime when there are enough players
  const otherPlayers = room.players?.filter(p => String(p.userId) !== String(myPlayer?.userId)) || [];
  const allOthersReady = otherPlayers.length > 0 && otherPlayers.every(p => p.ready);
  
  const readyDisabled = readying || isMyPlayerReady || !hasEnoughPlayers || (isOwner && !allOthersReady);

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
      {/* Game Info */}
      <div className="mb-4 text-center">
        <div className="text-gray-300 text-sm mb-1">Playing</div>
        <div className="text-white font-bold text-xl">
          {room.game === "coinflip" && "💰 Coinflip"}
          {room.game === "dice" && `🎲 Dice (d${dice?.sides || 6})`}
          {room.game === "dicepoker" && "🎲 Dice Poker"}
          {room.game === "blackjackdice" && "🃏 Blackjack Dice"}
        </div>
        {room.game === "coinflip" && myPlayer?.side && (
          <div className="mt-2 inline-block px-3 py-1 bg-yellow-500/20 rounded-lg">
            <span className="text-gray-300 text-sm">Your side: </span>
            <span className="text-yellow-400 font-bold">
              {myPlayer.side === "heads" ? "H HEADS" : "T TAILS"}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Ready Button - Same for all players */}
        <button 
          className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-bold text-lg transition-colors"
          onClick={onReady} 
          disabled={readyDisabled}
          title={
            !hasEnoughPlayers 
              ? "Need at least 2 players" 
              : isMyPlayerReady 
                ? "You are ready" 
                : isOwner && !allOthersReady
                  ? "Wait for all other players to ready first"
                  : "Click to ready up"
          }
        >
          {readying ? "⏳ GETTING READY..." : isMyPlayerReady ? "✅ READY!" : "✅ READY UP"}
        </button>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
            onClick={onInvite} 
            disabled={inviting}
          >
            {inviting ? "⏳" : "📩 Invite"}
          </button>
          
          {isOwner ? (
            <button 
              className="px-4 py-2 bg-red-600/80 hover:bg-red-700 border border-red-500/50 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
              onClick={onDelete} 
              disabled={deleting}
            >
              {deleting ? "⏳" : "❌ Delete"}
            </button>
          ) : (
            <button 
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
              onClick={onLeave} 
              disabled={leaving}
            >
              {leaving ? "⏳" : "� Leave"}
            </button>
          )}
        </div>
      </div>

      {/* Status Message */}
      {allReady ? (
        <div className="mt-4 text-center text-green-400 text-sm font-semibold animate-pulse">
          🎮 All players ready! Starting in 3 seconds...
        </div>
      ) : room.players?.length < 2 ? (
        <div className="mt-4 text-center text-yellow-400 text-sm">
          ⏳ Waiting for other players to join...
        </div>
      ) : (
        <div className="mt-4 text-center text-gray-400 text-sm">
          Waiting for all players to ready up... ({room.players?.filter(p => p.ready).length || 0}/{room.players?.length || 0} ready)
        </div>
      )}
    </div>
  );
}
