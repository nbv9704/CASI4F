// client/src/components/battle/coinflip/CoinflipBattlePanel.jsx
'use client';

import { useMemo } from 'react';
import { Award, Coins, Shield, Sparkles, Trophy } from 'lucide-react';
import ServerCountdown from '../../ServerCountdown';

const STATUS_COPY = {
  waiting: 'Waiting for all players to ready up. The battle will start automatically.',
  active: 'The coin is in the air! Stay sharp for the reveal.',
  finished: 'Round complete. Review the outcome and fairness details below.',
};

export default function CoinflipBattlePanel({ room, me }) {
  const md = room?.metadata || {};
  const seedHash = md.serverSeedHash || null;
  const seedReveal = md.serverSeedReveal || null;
  const pending = md.pendingCoin || null;
  const revealAt = pending?.revealAt || null;

  const players = Array.isArray(room?.players) ? room.players : [];
  const myId = me?.id ? String(me.id) : null;
  const winnerId = useMemo(() => {
    if (room?.winnerUserId !== undefined && room?.winnerUserId !== null) {
      return String(room.winnerUserId);
    }
    if (pending?.winnerUserId !== undefined && pending?.winnerUserId !== null) {
      return String(pending.winnerUserId);
    }
    return null;
  }, [pending?.winnerUserId, room?.winnerUserId]);

  const nameOf = (uid) => {
    const player = players.find((entry) => String(entry?.userId) === String(uid));
    return (
      player?.user?.displayName ||
      player?.user?.username ||
      `User ${String(uid || '').slice(-6)}`
    );
  };

  const derivedFace = useMemo(() => {
    if (!winnerId) return null;
    const player = players.find((entry) => String(entry?.userId) === String(winnerId));
    return player?.side || null;
  }, [players, winnerId]);

  const resultUpper = useMemo(() => {
    if (room?.status !== 'finished') {
      return pending?.result ? String(pending.result).toUpperCase() : '-';
    }
    const face = md.flipResult || derivedFace;
    return face ? String(face).toUpperCase() : '-';
  }, [derivedFace, md.flipResult, pending?.result, room?.status]);

  const mySide = useMemo(() => {
    const entry = players.find((player) => String(player?.userId) === myId);
    return entry?.side || null;
  }, [players, myId]);

  const pot = useMemo(() => {
    const bet = Number(room?.betAmount || 0);
    const participants = players.filter(Boolean).length;
    const total = bet * participants;
    if (!Number.isFinite(total)) return bet;
    try {
      return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(total);
    } catch {
      return total;
    }
  }, [players, room?.betAmount]);

  const statusCopy = STATUS_COPY[String(room?.status || 'waiting').toLowerCase()] || STATUS_COPY.waiting;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-amber-400/25 bg-amber-500/10 shadow-lg shadow-black/30 backdrop-blur">
      <div
        className="absolute inset-0 bg-gradient-to-br from-amber-400/15 via-transparent to-orange-500/15"
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-6 px-6 py-6">
        <header className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-amber-100">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Match overview
          </span>
          <h2 className="text-xl font-semibold text-white">Coinflip showdown</h2>
          <p className="text-sm text-amber-50/80">Keep track of the pot, your side, and server fairness in real time.</p>
        </header>

        <dl className="grid gap-4 sm:grid-cols-2">
          <InfoTile
            icon={Coins}
            label="Total pot"
            value={`${pot} coins`}
          />
          <InfoTile
            icon={Award}
            label="Your side"
            value={mySide ? mySide.toUpperCase() : 'Assigned on join'}
          />
          <InfoTile
            icon={Trophy}
            label="Winner"
            value={
              winnerId
                ? String(winnerId) === String(myId)
                  ? 'You'
                  : nameOf(winnerId)
                : 'Pending'
            }
          />
          <InfoTile
            icon={Shield}
            label="Server seed hash"
            value={seedHash || 'Available once the match begins'}
            isMonospace
          />
        </dl>

        {seedReveal && (
          <div className="rounded-2xl border border-white/15 bg-black/25 p-4 text-xs text-amber-100/80">
            <span className="font-semibold text-amber-100">Seed reveal:</span>
            <span className="ml-2 break-all font-mono text-amber-50/90">{seedReveal}</span>
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-amber-50/80">
          {room?.status === 'active' && pending ? (
            <span className="inline-flex items-center gap-2">
              The coin reveals in
              <ServerCountdown
                serverNow={room.serverNow}
                target={revealAt}
                className="font-semibold text-amber-100"
              />
            </span>
          ) : (
            statusCopy
          )}
        </div>

        {room?.status === 'finished' && (
          <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-50">
            Result: <span className="font-semibold">{resultUpper}</span>
          </div>
        )}
      </div>
    </section>
  );
}

function InfoTile({ icon: Icon, label, value, isMonospace }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
      <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-amber-300/30 bg-amber-400/10 text-amber-100">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-100/70">{label}</dt>
        <dd className={isMonospace ? 'text-sm font-mono text-amber-50/90 break-all' : 'text-sm text-amber-50'}>
          {value || '—'}
        </dd>
      </div>
    </div>
  );
}
