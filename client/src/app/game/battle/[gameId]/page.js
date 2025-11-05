// client/src/app/game/battle/[gameId]/page.js
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Plus,
  RefreshCw,
  Shield,
  Swords,
} from "lucide-react";

import RequireAuth from '@/components/RequireAuth'
import { GAMES } from "@/data/games";
import { useLocale } from "@/context/LocaleContext";
import useApi from "@/hooks/useApi";

const ALLOWED_SIDES = [4, 6, 8, 10, 12, 20];
const STATUS_STYLES = {
  waiting: 'bg-amber-100 text-amber-700 dark:bg-amber-400/25 dark:text-amber-100',
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/25 dark:text-emerald-100',
  finished: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-600/40 dark:text-neutral-200',
};

function BattleGameRoomsPage() {
  const api = useApi();
  const router = useRouter();
  const { t } = useLocale();
  const { gameId } = useParams();

  const gameConfig = useMemo(() => GAMES.find((g) => g.id === gameId), [gameId]);
  const localizedGameName = useMemo(() => {
    if (!gameConfig) return gameId;
    const key = `games.entries.${gameConfig.id}.name`;
    const value = t(key);
    return typeof value === "string" && value !== key ? value : gameConfig.name;
  }, [gameConfig, gameId, t]);

  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [betAmount, setBetAmount] = useState(gameConfig?.minBet || 0);
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [joinId, setJoinId] = useState("");
  const [hostSide, setHostSide] = useState("heads");
  const [diceSides, setDiceSides] = useState(6);

  async function fetchRooms() {
    try {
      setLoadingRooms(true);
      const list = await api.get(`/pvp/rooms?game=${encodeURIComponent(gameId)}`);
      setRooms(Array.isArray(list) ? list : []);
    } catch {
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  }

  useEffect(() => {
    setBetAmount(gameConfig?.minBet || 0);
    setMaxPlayers(gameId === "coinflip" ? 2 : 2);
    setHostSide("heads");
    setDiceSides(6);
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, gameConfig?.minBet]);

  async function createRoom() {
    if (creating) return;
    try {
      setCreating(true);
      const body =
        gameId === "coinflip"
          ? { game: gameId, betAmount, hostSide }
          : { game: gameId, betAmount, maxPlayers, ...(gameId === "dice" ? { diceSides } : {}) };

      const room = await api.post("/pvp/create", body);
      if (!room?.roomId) {
        await fetchRooms();
        return;
      }

      setShowCreate(false);
      router.push(`/game/battle/${gameId}/${room.roomId}`);
    } catch {
      await fetchRooms();
    } finally {
      setCreating(false);
    }
  }

  async function joinById() {
    if (!joinId) return;
    try {
      await api.post(`/pvp/join/${joinId}`);
      router.push(`/game/battle/${gameId}/${joinId}`);
    } catch {
      // handled by useApi toast layer
    }
  }

  return (
    <main className="min-h-screen text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-24 pt-12 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/80 p-8 shadow-lg shadow-black/20">
          <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-indigo-500/25 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-20 right-0 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" aria-hidden="true" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200">
                <Swords className="h-3.5 w-3.5" aria-hidden="true" />
                {t('games.battleRooms.headerAccent')}
              </span>
              <h1 className="mt-4 text-3xl font-semibold text-white lg:text-4xl">
                {t('games.battleRooms.title', { name: localizedGameName })}
              </h1>
              <p className="mt-3 text-sm text-slate-300 lg:text-base">
                {t('games.battleRooms.subtitle')}
              </p>
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.25em] text-slate-500">
                {t('games.battleRooms.helper')}
              </p>
            </div>

            <Link
              href="/game/battle"
              className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/70 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-indigo-500/60 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t('games.common.back')}
            </Link>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-3xl border border-slate-800/80 bg-slate-950/70 p-5 shadow-lg shadow-black/15">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={fetchRooms}
                className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/80 px-4 py-2 text-sm font-semibold text-slate-200 shadow-sm transition hover:border-indigo-500/60 hover:text-white"
                type="button"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                {t('games.battleRooms.refresh')}
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:opacity-95"
                type="button"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                {t('games.battleRooms.createButton')}
              </button>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="relative flex-1 sm:min-w-[260px]">
                <Shield className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                <input
                  value={joinId}
                  onChange={(event) => setJoinId(event.target.value.trim())}
                  placeholder={t('games.battleRooms.joinPlaceholder')}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 py-2 pl-10 pr-4 text-sm text-slate-100 shadow-inner shadow-black/40 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  aria-label={t('games.battleRooms.joinPlaceholder')}
                />
              </label>
              <button
                onClick={joinById}
                disabled={!joinId}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm font-semibold text-slate-200 shadow-sm transition hover:border-indigo-500/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
              >
                {t('games.battleRooms.joinButton')}
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loadingRooms &&
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`s-${index}`}
                className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6 text-slate-400 shadow-lg shadow-black/10"
              >
                <div className="flex flex-col gap-3">
                  <div className="h-5 rounded-full bg-slate-700/60" />
                  <div className="h-8 rounded-2xl bg-slate-700/60" />
                  <div className="h-4 rounded-full bg-slate-700/40" />
                  <div className="h-4 rounded-full bg-slate-700/40" />
                  <div className="h-12 rounded-2xl bg-slate-700/50" />
                </div>
              </div>
            ))}

          {rooms.map((room) => {
            const host = Array.isArray(room.players) && room.players.length ? room.players[0] : null;
            const isFull = room.players?.length >= room.maxPlayers;
            const statusKey = room.status?.toLowerCase?.() || 'waiting';
            const statusLabel = t(`games.battleRooms.status.${statusKey}`);

            return (
              <div
                key={room.roomId}
                className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/70 p-6 text-slate-200 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-indigo-500/30 via-transparent to-transparent" aria-hidden="true" />
                <div className="relative flex items-center justify-between">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[statusKey] || STATUS_STYLES.waiting}`}>
                    {statusLabel}
                  </span>
                  <span className="font-mono text-sm text-slate-400">
                    {t('games.battleRooms.labels.roomId')}: {room.roomId.slice(0, 8)}
                  </span>
                </div>

                <div className="relative mt-5 space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>{t('games.battleRooms.labels.bet')}</span>
                    <span className="font-semibold text-white">{room.betAmount}</span>
                  </div>

                  {room.game === "dice" && room?.metadata?.dice?.sides && (
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>{t('games.battleRooms.labels.dice')}</span>
                      <span className="font-semibold text-white">d{room.metadata.dice.sides}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>{t('games.battleRooms.labels.players')}</span>
                    <span className={`font-semibold ${isFull ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {room.players?.length}/{room.maxPlayers}
                    </span>
                  </div>

                  {room.game === "coinflip" && host?.side && (
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>{t('games.battleRooms.labels.hostSide')}</span>
                      <span className="font-semibold text-white">
                        {host.side === 'heads'
                          ? t('games.battleRooms.modal.sideHeads')
                          : t('games.battleRooms.modal.sideTails')}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={async () => {
                    try {
                      await api.post(`/pvp/${room.roomId}/join`);
                      router.push(`/game/battle/${gameId}/${room.roomId}`);
                    } catch {
                      /* handled by useApi */
                    }
                  }}
                  disabled={isFull || room.status !== 'waiting'}
                  className="relative mt-6 w-full rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-800"
                  type="button"
                >
                  {isFull
                    ? t('games.battleRooms.joinStates.full')
                    : room.status === 'active'
                    ? t('games.battleRooms.joinStates.active')
                    : t('games.battleRooms.joinStates.waiting')}
                </button>
              </div>
            );
          })}

          {!loadingRooms && !rooms.length && (
            <div className="col-span-full flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-800/70 bg-slate-950/70 py-20 text-center text-slate-400">
              <div className="rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 p-4 text-4xl text-white">
                <Swords className="h-8 w-8" aria-hidden="true" />
              </div>
              <p className="text-lg font-semibold text-white/90">{t('games.battleRooms.emptyTitle')}</p>
              <p className="max-w-md text-sm text-slate-400">{t('games.battleRooms.emptyDescription')}</p>
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:opacity-95"
                type="button"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                {t('games.battleRooms.emptyAction')}
              </button>
            </div>
          )}
        </section>

        {showCreate && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
            onClick={() => setShowCreate(false)}
          >
            <div
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/95 p-6 shadow-2xl shadow-black/40"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="absolute -top-32 right-0 h-56 w-56 rounded-full bg-indigo-500/25 blur-3xl" aria-hidden="true" />
              <div className="relative flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-indigo-500/15 p-2">
                    <Swords className="h-5 w-5 text-indigo-300" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    {t('games.battleRooms.modal.title')}
                  </h2>
                </div>

                <div className="space-y-4">
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-300">
                    {t('games.battleRooms.modal.betLabel')}
                    <input
                      type="number"
                      min={gameConfig?.minBet || 0}
                      value={betAmount}
                      onChange={(event) => setBetAmount(Number.parseFloat(event.target.value || '0'))}
                      className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-2 text-slate-100 shadow-inner shadow-black/30 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      placeholder={t('games.battleRooms.modal.betPlaceholder')}
                    />
                  </label>

                  {gameId === 'coinflip' ? (
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-slate-300">
                        {t('games.battleRooms.modal.sideLabel')}
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {['heads', 'tails'].map((side) => (
                          <button
                            key={side}
                            onClick={() => setHostSide(side)}
                            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                              hostSide === side
                                ? 'border-indigo-500 bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg'
                                : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-indigo-500/60 hover:text-white'
                            }`}
                            type="button"
                          >
                            {side === 'heads'
                              ? t('games.battleRooms.modal.sideHeads')
                              : t('games.battleRooms.modal.sideTails')}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <label className="flex flex-col gap-2 text-sm font-medium text-slate-300">
                        {t('games.battleRooms.modal.maxPlayersLabel')}
                        <input
                          type="number"
                          min={2}
                          max={6}
                          value={maxPlayers}
                          onChange={(event) => setMaxPlayers(Number.parseInt(event.target.value || '2', 10))}
                          className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-2 text-slate-100 shadow-inner shadow-black/30 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                        />
                      </label>

                      {gameId === 'dice' && (
                        <div className="space-y-2">
                          <span className="text-sm font-medium text-slate-300">
                            {t('games.battleRooms.modal.diceLabel')}
                          </span>
                          <div className="grid grid-cols-3 gap-2">
                            {ALLOWED_SIDES.map((sides) => (
                              <button
                                key={sides}
                                onClick={() => setDiceSides(sides)}
                                className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                                  diceSides === sides
                                    ? 'border-indigo-500 bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg'
                                    : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-indigo-500/60 hover:text-white'
                                }`}
                                type="button"
                              >
                                d{sides}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowCreate(false)}
                    className="rounded-2xl border border-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-indigo-500/60 hover:text-white"
                    type="button"
                  >
                    {t('games.battleRooms.modal.cancel')}
                  </button>
                  <button
                    onClick={createRoom}
                    disabled={creating}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                    type="button"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('games.battleRooms.modal.creating')}
                      </>
                    ) : (
                      t('games.battleRooms.modal.confirm')
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
export default RequireAuth(BattleGameRoomsPage);
