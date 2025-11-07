// components/battle/BlackjackDiceDisplay.jsx
"use client";

import DiceFace from "../DiceFace";

function formatCoins(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  try {
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(numeric);
  } catch {
    return numeric;
  }
}

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
  const meta = metadata ?? room?.metadata ?? {};
  const bjd = meta?.blackjackDice;
  if (!bjd) return null;

  const myPlayerData = bjd.players?.find(p => String(p.userId) === String(myId));
  const isMyTurn = !myPlayerData?.busted && !myPlayerData?.standing;
  const phase = bjd.phase || 'playing';
  const winners = bjd.winners || [];

  const getDiceDisplay = (dice) => {
    return dice.map((d, idx) => (
      <DiceFace key={idx} value={d} size="sm" />
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

  const resolveWinnerInfo = (winnerId) => {
    if (!winnerId) return { displayName: "Unknown", avatar: null };
    const players = Array.isArray(room?.players) ? room.players : [];
    const playerEntry = players.find((entry) => String(entry?.userId) === String(winnerId)) ||
      bjd.players?.find((entry) => String(entry?.userId) === String(winnerId));
    const displayName = nameById?.(winnerId) || playerEntry?.user?.displayName || playerEntry?.username || playerEntry?.user?.username || `Player ${players.findIndex((entry) => String(entry?.userId) === String(winnerId)) + 1}`;
    const avatar = avatarById?.(winnerId) || playerEntry?.user?.avatar || playerEntry?.avatar || null;
    return { displayName, avatar };
  };

  const participantCount = Array.isArray(room?.players)
    ? room.players.filter(Boolean).length
    : Array.isArray(bjd.players)
      ? bjd.players.filter(Boolean).length
      : 0;
  const totalPotRaw = Number(room?.betAmount || 0) * participantCount;
  const totalPot = Number.isFinite(totalPotRaw) ? totalPotRaw : 0;

  return (
    <div className="space-y-6">
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
        <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/15 px-5 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200">
                Winner{winners.length > 1 ? 's' : ''}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                {winners.map((winnerId) => {
                  const { displayName, avatar } = resolveWinnerInfo(winnerId);
                  const initials = displayName?.[0]?.toUpperCase?.() || '?';
                  return (
                    <div
                      key={winnerId}
                      className="flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-black/30 px-4 py-2 text-white shadow-inner"
                    >
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={displayName}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-400"
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/30 text-lg font-semibold text-emerald-100">
                          {initials}
                        </span>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-white line-clamp-1">{displayName}</p>
                        <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Victory confirmed</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 px-5 py-6 text-white lg:ml-6 lg:w-60">
              <div className="flex flex-col items-center text-center leading-tight">
                <span className="text-xs uppercase tracking-[0.35em] text-white/60">Prize pool</span>
                <span className="text-3xl font-semibold text-emerald-200">+{formatCoins(totalPot)}</span>
                <span className="text-xs text-white/50">coins distributed to winners</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
