// components/battle/BlackjackDiceDisplay.jsx
"use client";

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export default function BlackjackDiceDisplay({ 
  room, 
  metadata, 
  myId,
  nameById, 
  avatarById,
  onHit,
  onStand,
  hitting,
  standing
}) {
  const bjd = metadata?.blackjackDice;
  if (!bjd) return null;

  const myPlayerData = bjd.players?.find(p => String(p.userId) === String(myId));
  const isMyTurn = !myPlayerData?.busted && !myPlayerData?.standing;
  const phase = bjd.phase || 'playing';
  const winners = bjd.winners || [];

  const getDiceDisplay = (dice) => {
    return dice.map((d, idx) => (
      <div
        key={idx}
        className="w-12 h-12 bg-white rounded-lg shadow-xl flex items-center justify-center text-3xl font-bold"
      >
        {DICE_FACES[d - 1]}
      </div>
    ));
  };

  const getStatusColor = (player) => {
    if (player.busted) return 'text-red-400';
    if (player.standing) return 'text-blue-400';
    return 'text-yellow-400';
  };

  const getStatusText = (player) => {
    if (player.busted) return 'BUSTED';
    if (player.standing) return 'STANDING';
    return 'PLAYING';
  };

  return (
    <div className="space-y-4">
      {/* Players Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {bjd.players.map((player) => {
          const isMe = String(player.userId) === String(myId);
          const isWinner = winners.includes(String(player.userId));
          const borderColor = isWinner ? 'border-green-500 border-4' : isMe ? 'border-yellow-500 border-2' : 'border-white/20 border';
          
          return (
            <div
              key={player.userId}
              className={`bg-white/10 backdrop-blur-sm rounded-lg p-4 ${borderColor}`}
            >
              {/* Player Info */}
              <div className="flex items-center gap-2 mb-3">
                {avatarById(player.userId) && (
                  <img
                    src={avatarById(player.userId)}
                    alt="avatar"
                    className={`w-8 h-8 rounded-full ring-2 ${isMe ? 'ring-yellow-400' : 'ring-white/30'}`}
                  />
                )}
                <div className="flex-1">
                  <div className="text-white font-bold">
                    {nameById(player.userId)}
                    {isMe && <span className="ml-2 text-yellow-400 text-sm">YOU</span>}
                  </div>
                  <div className={`text-sm font-semibold ${getStatusColor(player)}`}>
                    {getStatusText(player)}
                  </div>
                </div>
                {isWinner && (
                  <div className="text-2xl">🏆</div>
                )}
              </div>

              {/* Dice Display */}
              <div className="flex justify-center gap-2 mb-3">
                {getDiceDisplay(player.dice)}
              </div>

              {/* Sum */}
              <div className="text-center">
                <div className={`text-2xl font-bold ${player.busted ? 'text-red-400' : 'text-white'}`}>
                  {player.sum}
                </div>
              </div>

              {/* Controls (only for current player) */}
              {isMe && isMyTurn && phase === 'playing' && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={onHit}
                    disabled={hitting || standing || player.sum >= 21}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors"
                  >
                    {hitting ? '⏳' : '➕ HIT'}
                  </button>
                  <button
                    onClick={onStand}
                    disabled={hitting || standing}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors"
                  >
                    {standing ? '⏳' : '✋ STAND'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Winner Announcement */}
      {phase === 'finished' && winners.length > 0 && (
        <div className="bg-green-500/30 backdrop-blur-sm rounded-lg p-6 text-center border-2 border-green-500">
          <div className="text-3xl font-bold text-green-400 mb-2">
            🏆 {winners.length === 1 ? 'WINNER!' : 'TIE!'}
          </div>
          <div className="text-white text-xl mb-2">
            {winners.map((wId) => nameById(wId)).join(' & ')}
          </div>
          {winners.length === 1 ? (
            <div className="text-green-300 mt-2">
              💰 Winner takes all: <span className="font-bold">{room.betAmount * room.players.length} coins</span>
            </div>
          ) : (
            <div className="text-yellow-300 mt-2">
              Split pot: <span className="font-bold">{Math.floor((room.betAmount * room.players.length) / winners.length)} coins each</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
