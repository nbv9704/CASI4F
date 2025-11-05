// components/battle/RoomHeader.jsx
"use client";

import { useRouter } from "next/navigation";

export default function RoomHeader({ room, dice, metadata, onVerifyClick }) {
  const router = useRouter();
  const getStatusColor = (status) => {
    switch (status) {
      case "waiting": return "text-yellow-400";
      case "active": return "text-green-400";
      case "finished": return "text-gray-400";
      default: return "text-blue-400";
    }
  };

  const getGameInfo = (game) => {
    switch (game) {
      case "coinflip":
        return { emoji: "💰", title: "Coinflip" };
      case "dice":
        return { emoji: "🎲", title: "Dice Game" };
      case "dicepoker":
        return { emoji: "🎲", title: "Dice Poker" };
      case "blackjackdice":
        return { emoji: "🃏", title: "Blackjack Dice" };
      default:
        return { emoji: "🎮", title: "Battle Game" };
    }
  };

  const gameInfo = getGameInfo(room.game);
  const gameEmoji = gameInfo.emoji;
  const gameTitle = gameInfo.title;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
      {/* Back Button */}
      <button
        onClick={() => router.push(`/game/battle/${room.game}`)}
        className="mb-4 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-semibold transition-all inline-flex items-center gap-2"
      >
        ← Back
      </button>
      
      <div className="flex items-center justify-between">
        {/* Left: Game Info */}
        <div>
          <div className="text-sm text-gray-400 mb-1">Battle Mode</div>
          <div className="font-bold text-3xl text-white mb-2">
            {gameEmoji} {gameTitle}
          </div>
          <div className="text-gray-300">
            Bet: <span className="text-yellow-400 font-bold text-lg">{room.betAmount}</span> coins
          </div>
          {room.game === "dice" && dice?.sides && (
            <div className="text-gray-300 mt-1">
              Type: <span className="text-cyan-400 font-semibold">d{dice.sides}</span>
            </div>
          )}
        </div>

        {/* Right: Status & Verify */}
        <div className="text-right">
          <div className="text-sm text-gray-400 mb-1">Status</div>
          <div className={`font-bold text-2xl capitalize ${getStatusColor(room.status)} mb-3`}>
            {room.status}
          </div>
          
          <button
            onClick={onVerifyClick}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 hover:border-yellow-400 transition-all text-gray-300 hover:text-yellow-400 text-sm font-semibold"
            title="Verify fairness"
          >
            ✅ Verify Fairness
          </button>
        </div>
      </div>
    </div>
  );
}
