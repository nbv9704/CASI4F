// client/src/components/battle/room/ResultDisplay.jsx
"use client";

export default function ResultDisplay({
  room,
  dice,
  md,
  isRevealing,
  getFlipResult,
  winners,
  pot,
  nameById,
  avatarById
}) {
  return (
    <div className="relative z-10 mt-6 rounded-3xl bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 backdrop-blur-sm border border-green-500/20 shadow-2xl p-8 space-y-6">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none rounded-3xl"></div>
      <div className="relative z-10">
        <div className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span>🏆</span>
          <span>Game Result</span>
        </div>

        <div className="flex items-center gap-8">
          <div
            className={
              room.game === "dice"
                ? `w-32 h-32 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl border-4 border-white/30 shadow-2xl flex items-center justify-center text-5xl font-bold`
                : `w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-4 border-white/30 shadow-2xl flex items-center justify-center text-4xl font-bold ${
                    isRevealing ? "animate-flip" : ""
                  }`
            }
            style={room.game === "dice" ? { perspective: "800px" } : undefined}
          >
            {room.game === "dice"
              ? (dice?.result?.max ?? "?")
              : !isRevealing && (getFlipResult(md) === 'heads' ? '🪙' : getFlipResult(md) === 'tails' ? '🎯' : '?')}
          </div>

          <div className="space-y-4">
            {(Array.isArray(winners) && winners.length > 0) && (
              <div className="space-y-2">
                <div className="text-sm text-green-200/70 font-medium">
                  Winner{winners.length > 1 ? 's' : ''}
                </div>
                <div className="flex items-center flex-wrap gap-3">
                  {winners.map((wid) => {
                    const name = nameById(wid);
                    const ava = avatarById(wid);
                    return (
                      <div key={wid} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                        {ava && (
                          <img
                            src={ava}
                            alt={name}
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-yellow-400/50"
                          />
                        )}
                        <span className="text-lg font-bold text-yellow-200">{name}</span>
                        <span className="text-xl">👑</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <span className="text-green-200/70">Total Pot:</span>
              <span className="text-2xl font-bold text-white">{pot} 💰</span>
            </div>
          </div>
        </div>

        {room.game === "dice" && Array.isArray(dice?.rolls) && (
          <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/20">
            <div className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>🎲</span>
              <span>All Rolls</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {dice.rolls.map((r, i) => {
                const name = nameById(r.userId);
                const show = (typeof r.value === "number") ? r.value : "-";
                const isWin = (dice?.result?.winners || []).includes(String(r.userId));
                return (
                  <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl ${
                    isWin ? 'bg-green-500/20 border border-green-500/30' : 'bg-gray-500/10 border border-gray-500/20'
                  }`}>
                    <span className="font-semibold text-white">{name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-purple-200">{show}</span>
                      {isWin && <span className="text-xl">✅</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
