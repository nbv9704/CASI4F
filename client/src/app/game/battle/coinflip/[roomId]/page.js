// client/src/app/game/battle/coinflip/[roomId]/page.js
"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useBattleRoom } from "@/hooks/useBattleRoom";
import { useBattleSocket } from "@/hooks/useBattleSocket";
import RoomHeader from "@/components/battle/RoomHeader";
import PlayerSlot from "@/components/battle/PlayerSlot";
import WaitingControls from "@/components/battle/WaitingControls";
import CoinflipAnimation from "@/components/battle/CoinflipAnimation";
import VerifyFairnessModal from "@/components/VerifyFairnessModal";
import PromptDialog from "@/components/PromptDialog";
import ConfirmDialog from "@/components/ConfirmDialog";
import GameResult from "@/components/battle/GameResult";

function mergeRoomState(nextRoom, prevRoom) {
  if (!nextRoom) return nextRoom;
  if (!prevRoom) return nextRoom;

  const merged = { ...prevRoom, ...nextRoom };
  const nextPlayers = Array.isArray(nextRoom.players) ? nextRoom.players : [];
  const prevPlayers = Array.isArray(prevRoom.players) ? prevRoom.players : [];

  merged.players = nextPlayers.map((player) => {
    if (!player) return player;

    const prevMatch = prevPlayers.find(
      (p) => p && String(p.userId) === String(player.userId)
    );

    if (!player.user && prevMatch?.user) {
      return { ...player, user: prevMatch.user };
    }

    return player;
  });

  return merged;
}

export default function CoinflipRoomPage({ params }) {
  const router = useRouter();
  const { roomId } = use(params);

  const {
    room,
    me,
    myId,
    myPlayer,
    isOwner,
    inviting,
    readying,
    leaving,
    deleting,
    verifyOpen,
    inviteOpen,
    confirmDeleteOpen,
    finishedToastShownRef,
    setRoom,
    setVerifyOpen,
    setInviteOpen,
    setConfirmDeleteOpen,
    fetchRoom,
    doReady,
    doInvite,
    handleInviteSubmit,
    doLeave,
    doDelete,
    handleConfirmDelete,
    fetchUser,
    getDisplayName,
    getAvatar,
  } = useBattleRoom(roomId, "coinflip");

  const [flipping, setFlipping] = useState(false);

  // Socket handlers
  const socketHandlers = {
    onRoomUpdated: (updatedRoom) => {
      setRoom((prev) => mergeRoomState(updatedRoom, prev));
      if (updatedRoom?.players?.some((p) => !p?.user)) {
        fetchRoom();
      }
    },
    onRoomStarted: async (updatedRoom) => {
      setRoom((prev) => mergeRoomState(updatedRoom, prev));
      await fetchUser();
      finishedToastShownRef.current = false;
      
      // Auto-flip animation
      setFlipping(true);
      setTimeout(() => {
        setFlipping(false);
      }, 2000);

      if (updatedRoom?.players?.some((p) => !p?.user)) {
        fetchRoom();
      }
    },
    onRoomFinished: async (updatedRoom) => {
      setFlipping(false);
      setRoom((prev) => mergeRoomState(updatedRoom, prev));
      await fetchUser();
      if (updatedRoom?.players?.some((p) => !p?.user)) {
        fetchRoom();
      }
    },
    onRoomDeleted: () => {
      router.push("/game/battle/coinflip");
    },
  };

  useBattleSocket(roomId, socketHandlers);

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const players = room.players || [];
  const maxPlayers = room.maxPlayers || 2;
  const metadata = room.metadata || {};
  const hasSidebar = room.status === "waiting";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0d0b14] text-slate-100">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-0 right-[-120px] h-80 w-80 rounded-full bg-rose-500/25 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-20 pt-12 lg:px-8">
        <RoomHeader
          room={room}
          onVerifyClick={() => setVerifyOpen(true)}
          dice={metadata?.dice}
        />

        <section className="rounded-3xl border border-white/10 bg-white/5 shadow-lg shadow-black/30 backdrop-blur">
          <div className="px-6 py-8">
            <header className="mb-4 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
              <span>Participants</span>
              <span>{players.length}/{maxPlayers}</span>
            </header>
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
              {Array.from({ length: maxPlayers }).map((_, index) => {
                const player = players[index];
                return (
                  <div key={index} className="flex justify-center">
                    <PlayerSlot
                      slotIndex={index}
                      player={player}
                      avatar={getAvatar(player)}
                      displayName={getDisplayName(player)}
                      gameType="coinflip"
                      roomStatus={room.status}
                      myId={myId}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className={`grid gap-6 ${hasSidebar ? "lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]" : ""}`}>
          <div className={`space-y-6 ${hasSidebar ? "" : "lg:max-w-3xl lg:mx-auto"}`}>
            {room.status === "waiting" && (
              <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-6 text-sm text-white/70">
                Waiting for challengers to join and ready up. Once everyone confirms, the showdown panel will appear here.
              </div>
            )}

            {room.status === "active" && (
              <CoinflipAnimation
                room={room}
                metadata={metadata}
                isRevealing={Boolean(metadata.pendingCoin) || flipping}
              />
            )}

            {room.status === "finished" && (
              <div className="space-y-6">
                <GameResult
                  room={room}
                  metadata={metadata}
                  finalFace={metadata?.flipResult || null}
                  getFlipResult={(md) => md?.flipResult || md?.pendingCoin?.result || null}
                  winners={room.winnerUserId ? [String(room.winnerUserId)] : []}
                  pot={Number(room.betAmount || 0) * (room.players?.length || 0)}
                  nameById={(uid) => {
                    const participant = room.players?.find(
                      (entry) => entry && String(entry.userId) === String(uid)
                    );
                    return getDisplayName(participant);
                  }}
                  avatarById={(uid) => {
                    const participant = room.players?.find(
                      (entry) => entry && String(entry.userId) === String(uid)
                    );
                    return getAvatar(participant);
                  }}
                />

                <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-sm text-white/70">
                  <p className="mb-2 text-base font-semibold text-white">Round complete</p>
                  <p className="mb-2">
                    Need to double-check the flip? Use the fairness control in the header to inspect the server seed, reveal signature, and the commit that locked each player\'s side before reveal.
                  </p>
                  <p>
                    You can also open this match from battle history later on to review the same proof and replay the animation.
                  </p>
                </div>
              </div>
            )}
          </div>

          {hasSidebar && (
            <aside className="space-y-6">
              <WaitingControls
                room={room}
                myPlayer={myPlayer}
                isOwner={isOwner}
                onReady={doReady}
                readying={readying}
                onInvite={doInvite}
                onLeave={doLeave}
                onDelete={doDelete}
                inviting={inviting}
                leaving={leaving}
                deleting={deleting}
              />
            </aside>
          )}
        </section>
      </div>

      <VerifyFairnessModal
        open={verifyOpen}
        onClose={() => setVerifyOpen(false)}
        onOpenChange={setVerifyOpen}
        gameType="coinflip"
        gameData={room}
        roomId={room?.roomId}
      />

      <PromptDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onConfirm={handleInviteSubmit}
        onCancel={() => setInviteOpen(false)}
        title="Invite Player"
        description="Enter the user ID to invite:"
        placeholder="User ID"
        confirmText="Send Invite"
        loading={inviting}
        required
      />

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
        title="Delete Room?"
        description="Are you sure you want to delete this room? This action cannot be undone."
        confirmText="Delete"
        loading={deleting}
        variant="danger"
      />
    </div>
  );
}
