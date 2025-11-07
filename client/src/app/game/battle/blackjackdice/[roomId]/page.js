// client/src/app/game/battle/blackjackdice/[roomId]/page.js
"use client";

import { use, useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBattleRoom } from "@/hooks/useBattleRoom";
import { useBattleSocket } from "@/hooks/useBattleSocket";
import useApi from "@/hooks/useApi";
import RoomHeader from "@/components/battle/RoomHeader";
import PlayerSlot from "@/components/battle/PlayerSlot";
import WaitingControls from "@/components/battle/WaitingControls";
import BlackjackDiceDisplay from "@/components/battle/BlackjackDiceDisplay";
import VerifyFairnessModal from "@/components/VerifyFairnessModal";
import PromptDialog from "@/components/PromptDialog";
import ConfirmDialog from "@/components/ConfirmDialog";

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

export default function BlackjackDiceRoomPage({ params }) {
  const router = useRouter();
  const api = useApi();
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
    nameById,
    avatarById,
  } = useBattleRoom(roomId, "blackjackdice");

  const [hitting, setHitting] = useState(false);
  const [standing, setStanding] = useState(false);
  const hittingLockRef = useRef(false);
  const standingLockRef = useRef(false);

  // Socket handlers - use useCallback to prevent re-creation
  const socketHandlers = useMemo(() => ({
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
      if (updatedRoom?.players?.some((p) => !p?.user)) {
        fetchRoom();
      }
    },
    onRoomFinished: async (updatedRoom) => {
      setRoom((prev) => mergeRoomState(updatedRoom, prev));
      await fetchUser();
      if (updatedRoom?.players?.some((p) => !p?.user)) {
        fetchRoom();
      }
    },
    onRoomDeleted: () => {
      router.push("/game/battle/blackjackdice");
    },
  }), [setRoom, fetchRoom, fetchUser, finishedToastShownRef, router]);

  useBattleSocket(roomId, socketHandlers);

  // Game actions
  async function doHit() {
    if (hittingLockRef.current) return;
    if (hitting || standing) return;
    if (!room || room.status !== "active") return;

    hittingLockRef.current = true;
    setHitting(true);

    try {
      await api.post(`/pvp/${roomId}/hit`);
      await fetchRoom();
      await fetchUser();
      
      // 2s delay
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (err) {
      console.error("Hit error:", err);
    } finally {
      setHitting(false);
      hittingLockRef.current = false;
    }
  }

  async function doStand() {
    if (standingLockRef.current) return;
    if (hitting || standing) return;
    if (!room || room.status !== "active") return;

    standingLockRef.current = true;
    setStanding(true);

    try {
      await api.post(`/pvp/${roomId}/stand`);
      await fetchRoom();
      await fetchUser();
    } catch (err) {
      console.error("Stand error:", err);
    } finally {
      setStanding(false);
      standingLockRef.current = false;
    }
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0b14] text-slate-100">
        <div>Loading...</div>
      </div>
    );
  }

  const players = room.players || [];
  const maxPlayers = room.maxPlayers || 4;
  const metadata = room.metadata?.blackjackDice || {};
  const hasSidebar = room.status === "waiting";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0d0b14] text-slate-100">
      <div
        className="pointer-events-none absolute -left-28 top-0 h-72 w-72 rounded-full bg-rose-500/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-[-80px] right-[-120px] h-80 w-80 rounded-full bg-fuchsia-500/25 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-20 pt-12 lg:px-8">
        <RoomHeader
          room={room}
          onVerifyClick={() => setVerifyOpen(true)}
        />

        <section className="rounded-3xl border border-white/10 bg-white/5 shadow-lg shadow-black/30 backdrop-blur">
          <div className="px-6 py-8">
            <header className="mb-4 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
              <span>Participants</span>
              <span>{players.length}/{maxPlayers}</span>
            </header>
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
              {Array.from({ length: maxPlayers }).map((_, i) => {
                const p = players[i];
                return (
                  <div key={i} className="flex justify-center">
                    <PlayerSlot
                      slotIndex={i}
                      player={p}
                      avatar={p ? avatarById(p.userId) : null}
                      displayName={p ? nameById(p.userId) : null}
                      gameType="blackjackdice"
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
                Waiting for players to join and ready up. As soon as play begins, the blackjack dice board appears here.
              </div>
            )}

            {room.status === "active" && (
              <BlackjackDiceDisplay
                room={room}
                myId={myId}
                nameById={nameById}
                avatarById={avatarById}
                onHit={doHit}
                onStand={doStand}
                hitting={hitting}
                standing={standing}
              />
            )}

            {room.status === "finished" && (
              <div className="space-y-6">
                <BlackjackDiceDisplay
                  room={room}
                  myId={myId}
                  nameById={nameById}
                  avatarById={avatarById}
                  onHit={doHit}
                  onStand={doStand}
                  hitting={hitting}
                  standing={standing}
                />

                <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-sm text-white/70">
                  <p className="mb-2 text-base font-semibold text-white">Round complete</p>
                  <p className="mb-2">
                    Curious how the dealer drew? Open the fairness control in the header to review the seed reveal, shuffle order, and every die that was queued before each reveal step.
                  </p>
                  <p>
                    You\'ll find the same proof attached to this battle in history, so auditing future disputes stays quick and transparent.
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
                onInvite={doInvite}
                onLeave={doLeave}
                onDelete={doDelete}
                readying={readying}
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
        gameType="blackjackdice"
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
