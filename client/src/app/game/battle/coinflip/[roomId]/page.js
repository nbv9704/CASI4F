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
import CoinflipBattlePanel from "@/components/battle/coinflip/CoinflipBattlePanel";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-600 via-orange-600 to-red-600 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Room Header */}
        <RoomHeader
          room={room}
          isOwner={isOwner}
          onInvite={doInvite}
          onLeave={doLeave}
          onDelete={doDelete}
          inviting={inviting}
          leaving={leaving}
        />

        {/* Players Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {Array.from({ length: maxPlayers }).map((_, i) => {
            const p = players[i];
            return (
              <PlayerSlot
                key={i}
                slotIndex={i}
                player={p}
                avatar={getAvatar(p)}
                displayName={getDisplayName(p)}
                gameType="coinflip"
                roomStatus={room.status}
                myId={myId}
              />
            );
          })}
        </div>

        <CoinflipBattlePanel room={room} me={me} />

        {/* Game Content */}
        {room.status === "waiting" && (
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
        )}

        {room.status === "active" && (
          <CoinflipAnimation
            room={room}
            metadata={metadata}
            isRevealing={Boolean(metadata.pendingCoin) || flipping}
          />
        )}

        {room.status === "finished" && (
          <div className="mt-8 space-y-8">
            <GameResult
              room={room}
              metadata={metadata}
              finalFace={metadata?.flipResult || null}
              getFlipResult={(md) => md?.flipResult || md?.pendingCoin?.result || null}
              winners={room.winnerUserId ? [String(room.winnerUserId)] : []}
              pot={Number(room.betAmount || 0) * (room.players?.length || 0)}
              nameById={(uid) => getDisplayName(room.players?.find((p) => String(p.userId) === String(uid)))}
              avatarById={(uid) => getAvatar(room.players?.find((p) => String(p.userId) === String(uid)))}
            />

            <div className="text-center">
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
        gameType="coinflip"
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
