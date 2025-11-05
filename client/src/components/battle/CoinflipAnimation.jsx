// components/battle/CoinflipAnimation.jsx
"use client";
import ServerCountdown from "@/components/ServerCountdown";

export default function CoinflipAnimation({ 
  room, 
  metadata, 
  isRevealing 
}) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 mb-6">
      <div className="flex flex-col items-center">
        <div
          className={`w-40 h-40 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-8 border-yellow-200 shadow-2xl flex items-center justify-center text-6xl font-bold text-white ${
            isRevealing ? 'animate-spin' : ''
          }`}
        >
          💰
        </div>
        <div className="mt-4 text-white text-2xl font-bold">
          Flipping...
        </div>
        <div className="mt-2 text-gray-300">
          Reveal in{" "}
          <ServerCountdown
            serverNow={room.serverNow}
            target={metadata?.pendingCoin?.revealAt}
            className="font-semibold text-yellow-400"
          />
        </div>
      </div>
    </div>
  );
}
