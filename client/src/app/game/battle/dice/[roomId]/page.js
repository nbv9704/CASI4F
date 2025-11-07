// client/src/app/game/battle/dice/[roomId]/page.js
"use client";

import { use, useState, useRef, useEffect } from "react";
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
import { Dice6 } from "lucide-react";

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

  const metadata = room?.metadata || {};
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
  const pendingIsMine = Boolean(pending && myIdStr && String(pending.userId) === myIdStr);
  const suppressMyRoll = pendingIsMine;

  useEffect(() => {
    if (pendingIsMine) {
      setRolling(true);
    } else if (!rollingLockRef.current) {
      setRolling(false);
    }
  }, [pendingIsMine]);
  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const players = room.players || [];
  const maxPlayers = room.maxPlayers || 4;
  const myRoll = diceRolls.find((r) => myIdStr && String(r.userId) === myIdStr) || null;
  const myRollValue = typeof myRoll?.value === "number" ? myRoll.value : null;
  const alreadyRolled = Boolean(myRoll);
  const myRollDisplayValue = myRoll ? myRoll.value : "-";
  const isMyTurn = currentTurnUserId && myIdStr && String(currentTurnUserId) === myIdStr;
  const currentTurnLabel = currentTurnUserId
    ? nameById(String(currentTurnUserId)) || "TBD"
    : "TBD";
  const hasSidebar = room.status === "waiting" || room.status === "active";
  const activePlayers = players.filter(Boolean);
  const rolledCount = diceRolls.filter((r) => typeof r?.value === "number").length;
  const totalPlayers = activePlayers.length || players.length || 0;
  const baseBetAmountNum = Number(room?.betAmount ?? 0);
  const computedPot = Number.isFinite(baseBetAmountNum) ? baseBetAmountNum * totalPlayers : 0;
  const roomPotRaw = room?.totalPot ?? room?.pot;
  const resolvedPot = (() => {
    const numeric = Number(roomPotRaw);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : computedPot;
  })();
  const winnerIds = Array.isArray(dice?.result?.winners)
    ? dice.result.winners.map((id) => String(id))
    : [];

  let statusMessage = "Keep an eye on the timeline while every player locks their roll.";
  if (pending && pending.userId) {
    statusMessage = "Server is revealing the latest roll. Results will appear momentarily.";
  } else if (isMyTurn && !alreadyRolled) {
    statusMessage = "It is your turn—use the roll controls on the right when you are ready.";
  } else if (alreadyRolled && !pending) {
    statusMessage = "Your roll is locked in. Waiting for the remaining players to finish.";
  }

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
      setRolling(false);
    } finally {
      rollingLockRef.current = false;
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0d0b14] text-slate-100">
      <div
        className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 right-[-120px] h-80 w-80 rounded-full bg-cyan-500/25 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-20 pt-12 lg:px-8">
        <RoomHeader
          room={room}
          dice={dice}
          onVerifyClick={() => setVerifyOpen(true)}
        />

        <section className="rounded-3xl border border-white/10 bg-white/5 shadow-lg shadow-black/30 backdrop-blur">
          <div className="px-6 py-8">
            <header className="mb-4 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
              <span>Participants</span>
              <span>{activePlayers.length}/{maxPlayers}</span>
            </header>
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
              {Array.from({ length: maxPlayers }).map((_, i) => {
                const p = players[i];
                const userId = p ? String(p.userId) : null;
                const rollValue = userId
                  ? rollMap.has(userId)
                    ? rollMap.get(userId)
                    : "-"
                  : "-";
                const isTurn =
                  userId && currentTurnUserId && String(currentTurnUserId) === userId;
                return (
                  <div key={i} className="flex justify-center">
                    <PlayerSlot
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
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section
          className={`grid gap-6 ${
            hasSidebar ? "lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]" : ""
          }`}
        >
          <div className="space-y-6">
            {room.status === "waiting" && (
              <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-6 text-sm text-white/70">
                Waiting for challengers to join and ready up. When the room starts, turn order and results will appear here.
              </div>
            )}

            {room.status === "active" && (
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-6 py-6 shadow-lg shadow-black/30">
                <div className="pointer-events-none absolute -top-24 left-0 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden="true" />
                <div className="pointer-events-none absolute -bottom-24 right-0 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl" aria-hidden="true" />

                <div className="relative grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 text-white">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-white/70">
                        <Dice6 className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">Round status</p>
                        <p className="text-lg font-semibold">{currentTurnLabel} {isMyTurn ? "(Bạn)" : ""}</p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-3xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white">
                        <p className="text-[0.65rem] uppercase tracking-[0.35em] text-white/50">Rolls locked</p>
                        <p className="text-xl font-semibold">{rolledCount}/{totalPlayers}</p>
                      </div>

                      <div className="rounded-3xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white">
                        <p className="text-[0.65rem] uppercase tracking-[0.35em] text-white/50">Your roll</p>
                        <p className="text-xl font-semibold">{myRollDisplayValue}</p>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-black/25 px-4 py-4 text-sm text-white/70">
                      {statusMessage}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">Turn timeline</p>
                      <span className="text-xs text-white/50">{activePlayers.length} players</span>
                    </div>
                    <div className="space-y-2">
                      {activePlayers.map((player, idx) => {
                        const userId = player ? String(player.userId) : null;
                        const rollValue = userId ? rollMap.get(userId) : null;
                        const hasRolled = typeof rollValue === "number";
                        const isTurn = userId && currentTurnUserId && String(currentTurnUserId) === userId;
                        const isPendingReveal = userId && pending && String(pending.userId) === userId;
                        const isMe = userId && myIdStr && userId === myIdStr;

                        let statusKey = "waiting";
                        if (isPendingReveal) statusKey = "revealing";
                        else if (hasRolled) statusKey = "rolled";
                        else if (isTurn) statusKey = "current";

                        let statusLabel = "Waiting";
                        if (statusKey === "rolled") statusLabel = "Rolled";
                        if (statusKey === "revealing") statusLabel = "Revealing";
                        if (statusKey === "current") statusLabel = isMe ? "Your turn" : "Rolling";

                        let rowClass = "border-white/10 bg-white/5";
                        if (statusKey === "rolled") rowClass = "border-emerald-400/40 bg-emerald-500/15";
                        if (statusKey === "current") rowClass = "border-indigo-400/40 bg-indigo-500/15";
                        if (statusKey === "revealing") rowClass = "border-amber-400/40 bg-amber-500/15";

                        const playerName = player ? getDisplayName(player) : userId ? nameById(userId) : `Player ${idx + 1}`;

                        return (
                          <div
                            key={userId || idx}
                            className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-sm text-white transition ${rowClass} ${isMe ? "shadow-[0_0_20px_rgba(59,130,246,0.35)]" : ""}`}
                          >
                            <div className="flex flex-col">
                              <span className="text-xs uppercase tracking-[0.3em] text-white/50">Player {idx + 1}</span>
                              <span className="text-sm font-semibold text-white">{playerName}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] ${
                                  statusKey === "rolled"
                                    ? "border border-emerald-300/60 bg-emerald-500/20 text-emerald-100"
                                    : statusKey === "revealing"
                                    ? "border border-amber-300/60 bg-amber-500/20 text-amber-100"
                                    : statusKey === "current"
                                    ? "border border-indigo-300/60 bg-indigo-500/20 text-indigo-100"
                                    : "border border-white/15 bg-black/30 text-white/60"
                                }`}
                              >
                                {statusLabel}
                              </span>
                              <span className="text-lg font-semibold text-white">
                                {hasRolled ? rollValue : "—"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {room.status === "finished" && (
              <div className="space-y-6">
                <GameResult
                  room={room}
                  myId={myId}
                  dice={dice}
                  nameById={nameById}
                  avatarById={avatarById}
                  metadata={metadata}
                  getFlipResult={() => null}
                  winners={winnerIds}
                  pot={resolvedPot}
                />

                <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-sm text-white/70">
                  <p className="mb-2 text-base font-semibold text-white">Round complete</p>
                  <p className="mb-2">
                    Review the fairness proof any time using the verify control in the header. It shows the server seed, client commits, and the nonce used for the final roll order.
                  </p>
                  <p>
                    Need the log later? Head to match history and open this battle to inspect the same verification data.
                  </p>
                </div>
              </div>
            )}
          </div>

          {hasSidebar && (
            <aside className="space-y-6">
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
                  currentTurnLabel={currentTurnLabel}
                  isMyTurn={isMyTurn}
                  myRollValue={myRollValue}
                  pendingIsMine={pendingIsMine}
                  rollDisabled={rollDisabledTitle}
                  rollDisabledBool={rollDisabledBool}
                  pending={pending}
                  revealCountdown={pending?.revealAt}
                  onRoll={doRoll}
                />
              )}
            </aside>
          )}
        </section>
      </div>

      <VerifyFairnessModal
        open={verifyOpen}
        onClose={() => setVerifyOpen(false)}
        onOpenChange={setVerifyOpen}
        gameType="dice"
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
