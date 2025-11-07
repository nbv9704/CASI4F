// client/src/hooks/useBattleRoom.js
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import useApi from "./useApi";
import { useUser } from "../context/UserContext";
import { toast } from "react-hot-toast";

/**
 * Shared hook for battle room state management
 * Handles room fetching, socket events, and common actions
 */
export function useBattleRoom(roomId, gameType) {
  const router = useRouter();
  const api = useApi();
  const { fetchUser } = useUser();

  const [room, setRoom] = useState(null);
  const [me, setMe] = useState(null);
  const [inviting, setInviting] = useState(false);
  const [readying, setReadying] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const finishedToastShownRef = useRef(false);
  const startCountdownRef = useRef(null);
  const apiRef = useRef(api);
  
  useEffect(() => {
    apiRef.current = api;
  }, [api]);

  useEffect(() => {
    return () => {
      if (startCountdownRef.current) {
        clearInterval(startCountdownRef.current);
        startCountdownRef.current = null;
      }
    };
  }, []);

  // Fetch current user
  useEffect(() => {
    if (!api) return;
    async function load() {
      try {
        const data = await api.get("/auth/me");
        setMe(data);
      } catch {}
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch room data
  const fetchRoom = useCallback(async () => {
    if (!apiRef.current) return null;
    try {
      const data = await apiRef.current.get(`/pvp/${roomId}`);
      setRoom(data);
      return data;
    } catch (err) {
      console.error("Failed to fetch room:", err);
      return null;
    }
  }, [roomId]);

  // Initial fetch
  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  // Common actions
  async function doReady() {
    if (readying || !apiRef.current) return;
    setReadying(true);
    try {
      await apiRef.current.post(`/pvp/${roomId}/ready`, { ready: true });
      const d = await fetchRoom();

      // Auto-start countdown if all ready
      if (d && d.players?.length >= 2) {
        const allReady = d.players.every((p) => p.ready);

        if (!allReady || d.status !== "waiting") {
          if (startCountdownRef.current) {
            clearInterval(startCountdownRef.current);
            startCountdownRef.current = null;
          }
          return;
        }

        const toastId = `pvp-start-${roomId}`;
        let counter = 3;

        toast.success(`All players ready! Starting in ${counter}s...`, { id: toastId });

        if (startCountdownRef.current) {
          clearInterval(startCountdownRef.current);
          startCountdownRef.current = null;
        }

        const startGame = async () => {
          try {
            const requestId = crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
            await apiRef.current.post(`/pvp/${roomId}/start`, { requestId });
            await fetchRoom();
            await fetchUser();
            finishedToastShownRef.current = false;
          } catch (err) {
            console.error("Auto-start failed:", err?.__payload || err);
          }
        };

        startCountdownRef.current = setInterval(() => {
          counter -= 1;
          if (counter > 0) {
            toast.success(`All players ready! Starting in ${counter}s...`, { id: toastId });
          } else {
            clearInterval(startCountdownRef.current);
            startCountdownRef.current = null;
            toast.success("Battle starting now!", { id: toastId });
            void startGame();
          }
        }, 1000);
      }
    } catch (err) {
      console.error("Ready action failed:", err?.__payload || err);
      // useApi already showed a toast, so just exit early
      return;
    } finally {
      setReadying(false);
    }
  }

  async function doInvite() {
    setInviteOpen(true);
  }

  async function handleInviteSubmit(targetUserId) {
    if (!targetUserId || !apiRef.current) return;
    
    setInviting(true);
    try {
      await apiRef.current.post(`/pvp/${roomId}/invite`, { targetUserId });
      toast.success("Invitation sent!");
      setInviteOpen(false);
    } catch (e) {
      const code = e?.code || e?.data?.code;
      const status = e?.status || e?.data?.status;
      const msg = e?.message || "";
      if (status === 404 || code === "USER_NOT_FOUND" || /User not found/i.test(msg)) {
        toast.error("User not found");
        return;
      }
      toast.error(msg || "Failed to invite");
    } finally {
      setInviting(false);
    }
  }

  async function doLeave() {
    if (leaving || !apiRef.current) return;
    try {
      setLeaving(true);
      await apiRef.current.post(`/pvp/${roomId}/leave`);
      router.push(`/game/battle/${gameType || room?.game || ""}`);
    } catch {
    } finally {
      setLeaving(false);
    }
  }

  function doDelete() {
    setConfirmDeleteOpen(true);
  }

  async function handleConfirmDelete() {
    if (deleting || !apiRef.current) return;
    try {
      setDeleting(true);
      await apiRef.current.del(`/pvp/${roomId}`);
      router.push(`/game/battle/${gameType || room?.game || ""}`);
    } finally {
      setDeleting(false);
      setConfirmDeleteOpen(false);
    }
  }

  // Utilities
  const myId = me?.id || me?._id; // API /auth/me returns "id", not "_id"
  const myPlayer = room?.players?.find((p) => String(p.userId) === String(myId));
  const createdBy = room?.createdBy;

  useEffect(() => {
    if (!apiRef.current || !roomId || !room || !myId) return;
    if (room.status !== "waiting") return;
    const players = Array.isArray(room.players) ? room.players : [];
    const isMember = players.some(
      (player) => player && String(player.userId) === String(myId)
    );
    if (isMember) return;
    if (players.length >= (room.maxPlayers || players.length)) return;

    let cancelled = false;
    (async () => {
      try {
        await apiRef.current.post(`/pvp/${roomId}/join`, {});
        if (!cancelled) {
          await fetchRoom();
        }
      } catch (err) {
        console.error("Auto-join failed:", err?.__payload || err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [roomId, room, myId, fetchRoom]);

  // Check isOwner by comparing with createdBy
  const isOwner = useMemo(() => {
    if (!createdBy || !myId) {
      console.log('[useBattleRoom] isOwner FALSE - missing data:', {
        hasRoom: !!room,
        createdBy,
        hasMe: !!me,
        myId,
      });
      return false;
    }
    const result = String(createdBy) === String(myId);
    console.log('[useBattleRoom] isOwner calculation:', {
      createdBy,
      createdByType: typeof createdBy,
      myId,
      myIdType: typeof myId,
      stringComparison: `"${String(createdBy)}" === "${String(myId)}"`,
      result,
    });
    return result;
  }, [createdBy, myId, me, room]);

  const getDisplayName = (player) => {
    if (!player) return "";
    const user = player.user || {};
    return (
      user.displayName ||
      user.username ||
      user.name ||
      player.nickname ||
      (player.userId ? `User ${String(player.userId).slice(-6)}` : "")
    );
  };

  const getAvatar = (player) => {
    if (!player) return "";
    const user = player.user || {};
    return user.avatar || player.avatar || "😊";
  };

  const getPlayerById = (uid) => room?.players?.find((p) => String(p.userId) === String(uid));
  const nameById = (uid) => getDisplayName(getPlayerById(uid));
  const avatarById = (uid) => getAvatar(getPlayerById(uid));

  return {
    // State
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
    
    // Setters
    setRoom,
    setVerifyOpen,
    setInviteOpen,
    setConfirmDeleteOpen,
    
    // Actions
    fetchRoom,
    doReady,
    doInvite,
    handleInviteSubmit,
    doLeave,
    doDelete,
    handleConfirmDelete,
    fetchUser,
    
    // Utilities
    getDisplayName,
    getAvatar,
    nameById,
    avatarById,
  };
}
