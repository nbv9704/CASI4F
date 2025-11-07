// client/src/components/battle/room/CoinflipReveal.jsx
"use client";

import ServerCountdown from "@/components/ServerCountdown";

export default function CoinflipReveal({ room, md, isRevealing }) {
  return (
    <div className="relative z-10 mt-6 rounded-3xl bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 backdrop-blur-sm border border-yellow-500/20 shadow-2xl p-8">
      <div className="flex items-center justify-center gap-8">
        <div
          className={`w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-4 border-white/30 shadow-2xl flex items-center justify-center text-2xl font-bold uppercase tracking-wide ${
            isRevealing ? "animate-flip" : "animate-pulse"
          }`}
        >
          🪙
        </div>
        <div className="space-y-3">
          <div className="text-2xl font-bold text-white">Flipping Coin...</div>
          <div className="flex items-center gap-2 text-yellow-200">
            <span className="text-lg">⏱️</span>
            <span className="text-sm">Reveal in</span>
            <ServerCountdown
              serverNow={room.serverNow}
              target={md?.pendingCoin?.revealAt}
              className="text-lg font-bold text-yellow-300"
            />
          </div>
          <div className="text-sm text-orange-200/70">The coin is spinning in the air...</div>
        </div>
      </div>
    </div>
  );
}
