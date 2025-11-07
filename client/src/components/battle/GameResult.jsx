// components/battle/GameResult.jsx
"use client";

function formatCoins(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return value ?? "0";
  }
  try {
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(numeric);
  } catch {
    return numeric;
  }
}

export default function GameResult({
  room,
  dice,
  metadata,
  isRevealing,
  finalFace,
  getFlipResult,
  winners,
  pot,
  nameById,
  avatarById,
}) {
  if (room.status !== "finished") return null;

  const safeGetFlipResult = typeof getFlipResult === "function" ? getFlipResult : () => null;
  const safeNameById = typeof nameById === "function" ? nameById : () => "";
  const safeAvatarById = typeof avatarById === "function" ? avatarById : () => "";
  const safeWinners = Array.isArray(winners) ? winners : [];

  const isDiceGame = room.game === "dice";
  const diceWinningValue = dice?.result?.max ?? dice?.result?.value ?? "-";
  const flip = safeGetFlipResult(metadata);
  const coinResultText = typeof flip === "string" && flip.length
    ? flip.toUpperCase()
    : finalFace || "?";
  const displayValue = isDiceGame ? diceWinningValue : coinResultText;
  const resultLabel = isDiceGame ? "Highest roll" : "Outcome";
  const hasWinners = safeWinners.length > 0;
  const formattedPot = formatCoins(pot ?? 0);
  const diceWinners = Array.isArray(dice?.result?.winners) ? dice.result.winners.map(String) : [];

  const rolls = Array.isArray(dice?.rolls) ? dice.rolls : [];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-6 py-6 shadow-lg shadow-black/30">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-emerald-400/15 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-[-120px] right-[-90px] h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" aria-hidden="true" />

      <div className="relative space-y-6">
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div
              className={`flex h-28 w-28 items-center justify-center rounded-3xl border-2 border-white/10 bg-black/25 text-white shadow-lg shadow-black/40 ${
                  isDiceGame
                    ? "text-5xl font-extrabold"
                    : "text-2xl font-bold uppercase tracking-wide"
              } ${
                !isDiceGame && isRevealing ? "animate-[spin_2s_linear_infinite]" : ""
              }`}
            >
              {displayValue}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">{resultLabel}</p>
              <h3 className="text-2xl font-semibold text-white">
                {isDiceGame ? `Rolled: ${displayValue}` : displayValue}
              </h3>
              {isDiceGame ? (
                <p className="text-sm text-white/60">Top roll takes the pot. Fairness proof is available above.</p>
              ) : (
                <p className="text-sm text-white/60">Final coin state locked. Fairness proof is available above.</p>
              )}
            </div>
          </div>
        </header>

        {hasWinners && (
          <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/15 px-5 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200">
                  Winner{safeWinners.length > 1 ? "s" : ""}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  {safeWinners.map((wid) => {
                    const winnerName = safeNameById(wid) || "Unknown";
                    const winnerAvatar = safeAvatarById(wid);
                    const initials = winnerName?.[0]?.toUpperCase?.() || "?";
                    return (
                      <div
                        key={wid}
                        className="flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-black/30 px-4 py-2 text-white shadow-inner"
                      >
                        {winnerAvatar ? (
                          <img
                            src={winnerAvatar}
                            alt={winnerName}
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-400"
                          />
                        ) : (
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/30 text-lg font-semibold text-emerald-100">
                            {initials}
                          </span>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-white">{winnerName}</p>
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
                  <span className="text-3xl font-semibold text-emerald-200">+{formattedPot}</span>
                  <span className="text-xs text-white/50">coins distributed to winners</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
