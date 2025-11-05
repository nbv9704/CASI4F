// components/battle/DicePokerDisplay.jsx
"use client";

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

const HAND_COLORS = {
  'Five of a Kind': 'text-purple-400',
  'Four of a Kind': 'text-pink-400',
  'Full House': 'text-red-400',
  'Straight': 'text-orange-400',
  'Three of a Kind': 'text-yellow-400',
  'Two Pair': 'text-green-400',
  'One Pair': 'text-blue-400',
  'High Card': 'text-gray-400'
};

export default function DicePokerDisplay({ room, metadata, nameById, avatarById }) {
  const rolls = metadata?.dicePoker?.rolls || [];
  const winners = metadata?.dicePoker?.winners || [];
  
  if (rolls.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">🎲</div>
        <div className="text-white text-xl font-bold">Rolling dice...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rolls.map((roll) => {
          const isWinner = winners.includes(String(roll.userId));
          const borderColor = isWinner ? 'border-green-500 border-4' : 'border-white/20 border-2';
          
          return (
            <div
              key={roll.userId}
              className={`bg-white/10 backdrop-blur-sm rounded-lg p-4 ${borderColor}`}
            >
              {/* Player Info */}
              <div className="flex items-center gap-2 mb-3">
                {avatarById(roll.userId) && (
                  <img
                    src={avatarById(roll.userId)}
                    alt="avatar"
                    className="w-8 h-8 rounded-full ring-2 ring-yellow-400"
                  />
                )}
                <div className="flex-1">
                  <div className="text-white font-bold">{nameById(roll.userId)}</div>
                  {isWinner && (
                    <div className="text-green-400 text-sm font-semibold">WINNER! 🏆</div>
                  )}
                </div>
              </div>

              {/* Dice Display */}
              <div className="flex justify-center gap-2 mb-3">
                {roll.dice.map((die, idx) => (
                  <div
                    key={idx}
                    className="w-12 h-12 bg-white rounded-lg shadow-xl flex items-center justify-center text-3xl font-bold"
                  >
                    {DICE_FACES[die - 1]}
                  </div>
                ))}
              </div>

              {/* Hand Info */}
              <div className="text-center">
                <div className={`text-lg font-bold ${HAND_COLORS[roll.hand]}`}>
                  {roll.hand}
                </div>
                <div className="text-gray-300 text-sm">
                  Sum: {roll.sum} • x{roll.multiplier}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Winner Announcement */}
      {winners.length > 0 && (
        <div className="bg-green-500/30 backdrop-blur-sm rounded-lg p-6 text-center border-2 border-green-500">
          <div className="text-3xl font-bold text-green-400 mb-2">
            {winners.length === 1 ? '🏆 WINNER!' : '🏆 TIE!'}
          </div>
          <div className="text-white text-xl">
            {winners.map((wId) => nameById(wId)).join(' & ')}
          </div>
          <div className="text-green-300 mt-2">
            Pot: {room.betAmount * room.players.length} coins
          </div>
        </div>
      )}
    </div>
  );
}
