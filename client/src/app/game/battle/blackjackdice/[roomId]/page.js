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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const players = room.players || [];
  const maxPlayers = room.maxPlayers || 4;
  const metadata = room.metadata?.blackjackDice || {};
  const phase = metadata.phase || "waiting";

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Room Header */}
        <RoomHeader
          room={room}
          onVerifyClick={() => setVerifyOpen(true)}
        />

        {/* Players Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: maxPlayers }).map((_, i) => {
            const p = players[i];
            return (
              <PlayerSlot
                key={i}
                slotIndex={i}
                player={p}
                avatar={p ? avatarById(p.userId) : null}
                displayName={p ? nameById(p.userId) : null}
                gameType="blackjackdice"
                roomStatus={room.status}
                myId={myId}
              />
            );
          })}
        </div>

        {/* Game Content */}
        {room.status === "waiting" && (
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
          <div className="mt-8">
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
            
            <div className="mt-8 text-center">
              <button
                onClick={() => setVerifyOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition"
              >
                ⚙️ Verify Fairness
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <VerifyFairnessModal
        isOpen={verifyOpen}
        onClose={() => setVerifyOpen(false)}
        gameType="blackjackdice"
        gameData={room}
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
