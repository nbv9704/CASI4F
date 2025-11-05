// client/src/app/game/battle/dice/[roomId]/page.js
"use client";

import { use, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useBattleRoom } from "@/hooks/useBattleRoom";
import { useBattleSocket } from "@/hooks/useBattleSocket";
import useApi from "@/hooks/useApi";
import RoomHeader from "@/components/battle/RoomHeader";
import PlayerSlot from "@/components/battle/PlayerSlot";
import WaitingControls from "@/components/battle/WaitingControls";
import DiceControls from "@/components/battle/DiceControls";
import GameResult from "@/components/battle/GameResult";
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

export default function DiceRoomPage({ params }) {
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
    getDisplayName,
    getAvatar,
    nameById,
    avatarById,
  } = useBattleRoom(roomId, "dice");

  const [rolling, setRolling] = useState(false);
  const rollingLockRef = useRef(false);

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
      
      // Auto-roll animation
      setRolling(true);
      setTimeout(() => {
        setRolling(false);
      }, 2000);

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
      router.push("/game/battle/dice");
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
  const maxPlayers = room.maxPlayers || 4;
  const metadata = room.metadata || {};
  const dice = metadata.dice || {};
  const diceRolls = Array.isArray(dice.rolls) ? dice.rolls : [];
  const rollMap = new Map(
    diceRolls.map((r) => [String(r.userId), typeof r.value === "number" ? r.value : null])
  );
  const pending = metadata.pending || null;
  const turnOrder = Array.isArray(metadata.turnOrder) ? metadata.turnOrder : [];
  const currentIdx = typeof metadata.currentTurnIndex === "number" ? metadata.currentTurnIndex : 0;
  const currentTurnUserId = pending?.userId || turnOrder[currentIdx] || null;
  const myIdStr = myId ? String(myId) : null;
  const pendingIsMine = pending && myIdStr && String(pending.userId) === myIdStr;
  const suppressMyRoll = Boolean(pendingIsMine);
  const myRoll = diceRolls.find((r) => myIdStr && String(r.userId) === myIdStr) || null;
  const alreadyRolled = Boolean(myRoll);
  const myRollDisplayValue = myRoll ? myRoll.value : "-";
  const isMyTurn = currentTurnUserId && myIdStr && String(currentTurnUserId) === myIdStr;

  let rollDisabledReason = "";
  if (room.status !== "active") {
    rollDisabledReason = "Game is not active";
  } else if (!myPlayer) {
    rollDisabledReason = "You are not in this room";
  } else if (pending && !pendingIsMine) {
    rollDisabledReason = "Waiting for another player";
  } else if (pendingIsMine) {
    rollDisabledReason = "Reveal in progress";
  } else if (!isMyTurn) {
    rollDisabledReason = "Wait for your turn";
  } else if (alreadyRolled) {
    rollDisabledReason = "You have already rolled";
  } else if (rolling) {
    rollDisabledReason = "Rolling...";
  }

  const rollDisabledBool = Boolean(rollDisabledReason);
  const rollDisabledTitle = rollDisabledReason || "Roll your dice!";

  const doRoll = async () => {
    if (rollingLockRef.current || rollDisabledBool) return;
    if (!api) return;

    try {
      rollingLockRef.current = true;
      setRolling(true);
      const requestId = crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
      const updatedRoom = await api.post(`/pvp/${roomId}/roll`, { requestId });
      if (updatedRoom) {
        setRoom((prev) => mergeRoomState(updatedRoom, prev));
      }
    } catch (err) {
      console.error("Roll error:", err);
    } finally {
      rollingLockRef.current = false;
      setTimeout(() => setRolling(false), 800);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-900 to-teal-900 text-white p-4">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: maxPlayers }).map((_, i) => {
            const p = players[i];
            const userId = p ? String(p.userId) : null;
            const rollValue = userId
              ? rollMap.has(userId)
                ? rollMap.get(userId)
                : "-"
              : "-";
            const isTurn = userId && currentTurnUserId && String(currentTurnUserId) === userId;
            return (
              <PlayerSlot
                key={i}
                slotIndex={i}
                player={p}
                avatar={getAvatar(p)}
                displayName={getDisplayName(p)}
                gameType="dice"
                roomStatus={room.status}
                myId={myId}
                rollValue={rollValue}
                suppressMyRoll={suppressMyRoll}
                isCurrentTurn={Boolean(isTurn)}
              />
            );
          })}
        </div>

        {/* Game Content */}
        {room.status === "waiting" && (
          <WaitingControls
            room={room}
            dice={dice}
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
          <DiceControls
            room={room}
            metadata={metadata}
            rolling={rolling}
            pendingValue={pending?.value}
            dicePending={Boolean(pending)}
            currentUserId={currentTurnUserId ? String(currentTurnUserId) : null}
            myRollValue={myRollDisplayValue}
            rollDisabled={rollDisabledTitle}
            rollDisabledBool={rollDisabledBool}
            onRoll={doRoll}
          />
        )}

        {room.status === "finished" && (
          <div className="mt-8">
            <GameResult
              room={room}
              myId={myId}
              dice={dice}
              nameById={nameById}
              avatarById={avatarById}
              metadata={metadata}
              getFlipResult={() => null}
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
        gameType="dice"
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
