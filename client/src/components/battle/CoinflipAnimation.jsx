// components/battle/CoinflipAnimation.jsx
"use client";

import { Coins } from "lucide-react";
import ServerCountdown from "@/components/ServerCountdown";

export default function CoinflipAnimation({ room, metadata, isRevealing }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-amber-400/25 bg-amber-500/10 shadow-lg shadow-black/30 backdrop-blur">
      <div
        className="absolute inset-0 bg-gradient-to-b from-amber-400/20 via-transparent to-rose-500/20"
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center gap-4 px-6 py-10 text-center">
        <div
          className={`flex h-44 w-44 items-center justify-center rounded-full border border-amber-200/40 bg-amber-300/20 text-amber-50 shadow-xl shadow-amber-500/30 ${
            isRevealing ? "animate-[spin_1.8s_ease-in-out_infinite]" : ""
          }`}
        >
          <Coins className="h-16 w-16" aria-hidden="true" />
        </div>
        <div className="text-2xl font-semibold text-white">Flipping the coin…</div>
        <div className="text-sm text-amber-100/80">
          Reveal in
          <span className="ml-2 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-sm font-semibold text-amber-50">
            <ServerCountdown
              serverNow={room.serverNow}
              target={metadata?.pendingCoin?.revealAt}
              className="font-semibold"
            />
          </span>
        </div>
      </div>
    </section>
  );
}
