// client/src/hooks/useBattleSocket.js
"use client";

import { useEffect, useRef } from "react";
import useSocket from "./useSocket";
import { useUser } from "../context/UserContext";
import { toast } from "react-hot-toast";

/**
 * Shared hook for battle room socket management
 * Handles socket connection and common events
 */
export function useBattleSocket(roomId, handlers = {}) {
  const { user } = useUser();
  const socket = useSocket(user?.id);
  
  const finishedToastShownRef = useRef(false);
  
  // Use refs for handlers to avoid re-registering listeners
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!socket || !roomId) return;

    // Join room channel - send roomId as string, not object
    socket.emit("pvp:joinRoomChannel", roomId);

    // Room updated
    function handleUpdated(data) {
      // Server sends { room, serverNow }, check room.roomId
      if (data.room?.roomId === roomId) {
        handlersRef.current.onRoomUpdated?.(data.room);
      }
    }

    // Room started
    function handleStarted(data) {
      // Server sends { room, serverNow }, check room.roomId
      if (data.room?.roomId === roomId) {
        handlersRef.current.onRoomStarted?.(data.room);
        toast.success("Game started!");
      }
    }

    // Room finished
    function handleFinished(data) {
      // Server sends { room, serverNow }, check room.roomId
      if (data.room?.roomId === roomId) {
        handlersRef.current.onRoomFinished?.(data.room);
        if (!finishedToastShownRef.current) {
          toast.success("Game finished!");
          finishedToastShownRef.current = true;
        }
      }
    }

    // Room deleted
    function handleDeleted(data) {
      // Server sends { roomId }, check directly
      if (data.roomId === roomId) {
        handlersRef.current.onRoomDeleted?.();
        toast.error("Room has been deleted");
      }
    }

    // Notification
    function handleNotification(data) {
      handlersRef.current.onNotification?.(data);
    }

    socket.on("pvp:roomUpdated", handleUpdated);
    socket.on("pvp:roomStarted", handleStarted);
    socket.on("pvp:roomFinished", handleFinished);
    socket.on("pvp:roomDeleted", handleDeleted);
    socket.on("notification", handleNotification);

    return () => {
      // Leave room channel when unmounting
      socket.emit("pvp:leaveRoomChannel", roomId);
      
      socket.off("pvp:roomUpdated", handleUpdated);
      socket.off("pvp:roomStarted", handleStarted);
      socket.off("pvp:roomFinished", handleFinished);
      socket.off("pvp:roomDeleted", handleDeleted);
      socket.off("notification", handleNotification);
    };
  }, [socket, roomId]);

  return {
    socket,
    finishedToastShownRef,
  };
}
