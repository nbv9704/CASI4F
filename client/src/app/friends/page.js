"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Loader2,
  MessageSquareText,
  Search,
  UserMinus,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";

import RequireAuth from "@/components/RequireAuth";
import LoadingState from "@/components/LoadingState";
import { useLocale } from "@/context/LocaleContext";
import { useUser } from "@/context/UserContext";
import { SOCKET_EVENTS } from "@/constants/socketEvents";
import useFriendsApi from "@/hooks/useFriendsApi";
import useSocket from "@/hooks/useSocket";

const MESSAGE_PAGE_SIZE = 30;

function getInitial(username) {
  if (!username) return "?";
  return username.charAt(0).toUpperCase();
}

const passthroughLoader = ({ src }) => src;

function buildAvatar(user) {
  if (user?.avatar) {
    return (
      <Image
        src={user.avatar}
        alt={user.username || "avatar"}
        width={36}
        height={36}
        className="h-9 w-9 rounded-full object-cover"
        loader={passthroughLoader}
        unoptimized
      />
    );
  }
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/30 text-sm font-semibold text-indigo-200">
      {getInitial(user?.username)}
    </div>
  );
}

function FriendsPage() {
  const { t, locale } = useLocale();
  const { user } = useUser();
  const { fetchFriends, sendRequest, respondRequest, removeFriend, fetchMessages, sendMessage } =
    useFriendsApi();

  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const [friendsError, setFriendsError] = useState("");

  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [requestInput, setRequestInput] = useState("");
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [pendingActions, setPendingActions] = useState({});

  const [messagesState, setMessagesState] = useState({});
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const messagesEndRef = useRef(null);

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale || "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    [locale],
  );

  const markActionPending = useCallback((id, flag) => {
    setPendingActions((prev) => {
      if (!id) return prev;
      if (flag) {
        return { ...prev, [id]: true };
      }
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const loadFriends = useCallback(async () => {
    setIsLoadingFriends(true);
    setFriendsError("");
    try {
      const res = await fetchFriends();
      const nextFriends = Array.isArray(res?.friends) ? res.friends : [];
      const incoming = Array.isArray(res?.requests?.incoming) ? res.requests.incoming : [];
      const outgoing = Array.isArray(res?.requests?.outgoing) ? res.requests.outgoing : [];

      setFriends(nextFriends);
      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);

      setMessagesState((prev) => {
        const allowed = new Set(nextFriends.map((item) => item?.user?.id));
        if (!allowed.size) return {};
        const next = {};
        Object.entries(prev).forEach(([key, value]) => {
          if (allowed.has(key)) next[key] = value;
        });
        return next;
      });

      setSelectedFriendId((prev) => {
        if (prev && nextFriends.some((f) => f?.user?.id === prev)) {
          return prev;
        }
        return nextFriends[0]?.user?.id || null;
      });
    } catch (err) {
      setFriends([]);
      setIncomingRequests([]);
      setOutgoingRequests([]);
      setSelectedFriendId(null);
      setMessagesState({});
      const fallback = err?.__payload?.message || t("friends.errors.load");
      setFriendsError(fallback);
    } finally {
      setIsLoadingFriends(false);
    }
  }, [fetchFriends, t]);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  const selectedFriend = useMemo(
    () => friends.find((item) => item?.user?.id === selectedFriendId) || null,
    [friends, selectedFriendId],
  );

  const conversation = useMemo(() => {
    if (!selectedFriendId) return null;
    return messagesState[selectedFriendId] || null;
  }, [messagesState, selectedFriendId]);

  const conversationMessages = conversation?.messages || [];

  useEffect(() => {
    if (!selectedFriendId || conversation) return;
    let canceled = false;
    setMessagesError("");
    setMessagesLoading(true);

    fetchMessages(selectedFriendId, { limit: MESSAGE_PAGE_SIZE })
      .then((res) => {
        if (canceled) return;
        const messages = Array.isArray(res?.messages) ? res.messages : [];
        const hasMore = Boolean(res?.hasMore);
        setMessagesState((prev) => {
          const current = prev[selectedFriendId];
          if (current) {
            const existingIds = new Set(current.messages.map((m) => m.id));
            const incomingMsgs = messages.filter((m) => !existingIds.has(m.id));
            return {
              ...prev,
              [selectedFriendId]: {
                messages: [...current.messages, ...incomingMsgs],
                hasMore: current.hasMore || hasMore,
                cursor: (incomingMsgs[0] && incomingMsgs[0].id) || current.cursor || (messages[0] && messages[0].id) || null,
              },
            };
          }
          return {
            ...prev,
            [selectedFriendId]: {
              messages,
              hasMore,
              cursor: messages.length ? messages[0].id : null,
            },
          };
        });
      })
      .catch((err) => {
        if (canceled) return;
        const fallback = err?.__payload?.message || t("friends.chat.loadError");
        setMessagesError(fallback);
      })
      .finally(() => {
        if (!canceled) setMessagesLoading(false);
      });

    return () => {
      canceled = true;
    };
  }, [fetchMessages, selectedFriendId, conversation, t]);

  useEffect(() => {
    if (!selectedFriendId) return;
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [selectedFriendId, conversationMessages.length]);

  const filteredFriends = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return friends;
    return friends.filter((item) =>
      item?.user?.username?.toLowerCase()?.includes(term),
    );
  }, [friends, searchTerm]);

  const handleSendRequest = useCallback(
    async (event) => {
      event.preventDefault();
      const trimmed = requestInput.trim();
      if (!trimmed) return;
      setIsSendingRequest(true);
      try {
        const res = await sendRequest({ username: trimmed });
        if (res?.status === "accepted") {
          toast.success(t("friends.toasts.requestAccepted"));
        } else {
          toast.success(t("friends.toasts.requestSent"));
        }
        setRequestInput("");
        await loadFriends();
      } catch {
        /* error handled globally by useApi */
      } finally {
        setIsSendingRequest(false);
      }
    },
    [requestInput, sendRequest, t, loadFriends],
  );

  const handleRespond = useCallback(
    async (friendshipId, action) => {
      if (!friendshipId) return;
      markActionPending(friendshipId, true);
      try {
        await respondRequest(friendshipId, action);
        if (action === "accept") {
          toast.success(t("friends.toasts.requestAccepted"));
        } else {
          toast.success(t("friends.toasts.requestCanceled"));
        }
        await loadFriends();
      } catch {
        /* error handled by useApi */
      } finally {
        markActionPending(friendshipId, false);
      }
    },
    [respondRequest, t, loadFriends, markActionPending],
  );

  const handleCancelOutgoing = useCallback(
    async (friendshipId) => {
      if (!friendshipId) return;
      markActionPending(friendshipId, true);
      try {
        await removeFriend(friendshipId);
        toast.success(t("friends.toasts.requestCanceled"));
        await loadFriends();
      } catch {
        /* error handled by useApi */
      } finally {
        markActionPending(friendshipId, false);
      }
    },
    [removeFriend, t, loadFriends, markActionPending],
  );

  const handleRemoveFriend = useCallback(
    async (friendshipId) => {
      if (!friendshipId) return;
      markActionPending(friendshipId, true);
      try {
        await removeFriend(friendshipId);
        toast.success(t("friends.toasts.friendRemoved"));
        await loadFriends();
      } catch {
        /* error handled by useApi */
      } finally {
        markActionPending(friendshipId, false);
      }
    },
    [removeFriend, t, loadFriends, markActionPending],
  );

  const handleSelectFriend = useCallback((friendId) => {
    setSelectedFriendId(friendId);
    setMessagesError("");
  }, []);

  const handleLoadOlderMessages = useCallback(async () => {
    if (!selectedFriendId) return;
    const current = messagesState[selectedFriendId];
    const cursor = current?.cursor;
    if (!cursor) return;
    setMessagesLoading(true);
    try {
      const res = await fetchMessages(selectedFriendId, { limit: MESSAGE_PAGE_SIZE, cursor });
      const nextMessages = Array.isArray(res?.messages) ? res.messages : [];
      const hasMore = Boolean(res?.hasMore);
      setMessagesState((prev) => {
        const existing = prev[selectedFriendId] || { messages: [], hasMore: false, cursor: null };
        const existingIds = new Set(existing.messages.map((msg) => msg.id));
        const filtered = nextMessages.filter((msg) => !existingIds.has(msg.id));
        return {
          ...prev,
          [selectedFriendId]: {
            messages: [...filtered, ...existing.messages],
            hasMore: hasMore,
            cursor: filtered.length ? filtered[0].id : existing.cursor,
          },
        };
      });
    } catch (err) {
      const fallback = err?.__payload?.message || t("friends.chat.loadError");
      setMessagesError(fallback);
    } finally {
      setMessagesLoading(false);
    }
  }, [selectedFriendId, messagesState, fetchMessages, t]);

  const handleSendMessage = useCallback(async () => {
    if (!selectedFriendId) return;
    const trimmed = messageInput.trim();
    if (!trimmed) return;
    setIsSendingMessage(true);
    try {
      const res = await sendMessage(selectedFriendId, trimmed);
      const message = res?.message;
      if (message) {
        setMessagesState((prev) => {
          const current = prev[selectedFriendId] || { messages: [], hasMore: false, cursor: null };
          if (current.messages.some((msg) => msg.id === message.id)) {
            return prev;
          }
          return {
            ...prev,
            [selectedFriendId]: {
              ...current,
              messages: [...current.messages, message],
            },
          };
        });
      }
      setMessageInput("");
    } catch (err) {
      const payloadMessage = err?.__payload?.message;
      if (!payloadMessage) {
        toast.error(t("friends.toasts.messageFailed"));
      }
    } finally {
      setIsSendingMessage(false);
    }
  }, [selectedFriendId, messageInput, sendMessage, t]);

  const handleIncomingMessage = useCallback(
    (payload) => {
      if (!payload) return;
      const sender = payload.sender;
      const recipient = payload.recipient;
      const currentUserId = user?.id;
      if (!currentUserId) return;
      const otherId = sender === currentUserId ? recipient : sender;
      if (!otherId) return;

      setMessagesState((prev) => {
        const existing = prev[otherId] || { messages: [], hasMore: false, cursor: null };
        if (existing.messages.some((msg) => msg.id === payload.id)) {
          return prev;
        }
        return {
          ...prev,
          [otherId]: {
            ...existing,
            messages: [...existing.messages, payload],
          },
        };
      });
    },
    [user?.id],
  );

  const handleFriendEvent = useCallback(() => {
    loadFriends();
  }, [loadFriends]);

  const socketHandlers = useMemo(() => ({
    events: {
      [SOCKET_EVENTS.SOCIAL.FRIEND_REQUEST]: handleFriendEvent,
      [SOCKET_EVENTS.SOCIAL.FRIEND_UPDATE]: handleFriendEvent,
      [SOCKET_EVENTS.SOCIAL.FRIEND_REMOVED]: handleFriendEvent,
      [SOCKET_EVENTS.SOCIAL.CHAT_MESSAGE]: handleIncomingMessage,
    },
  }), [handleFriendEvent, handleIncomingMessage]);

  useSocket(user?.id, socketHandlers);

  const isFriendsEmpty = !isLoadingFriends && friends.length === 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%)]" />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-200/40 bg-sky-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-sky-200">
            <MessageSquareText className="h-4 w-4" aria-hidden="true" />
            {t("friends.header.accent")}
          </span>
          <h1 className="mt-4 text-3xl font-semibold text-white lg:text-4xl">
            {t("friends.header.title")}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-indigo-100/80 lg:text-base">
            {t("friends.header.subtitle")}
          </p>
        </section>

        <div className="mt-10 grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-sky-500/10">
              <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">
                {t("friends.addForm.label")}
              </h2>
              <p className="mt-2 text-xs text-slate-400">{t("friends.addForm.helper")}</p>
              <form className="mt-4 space-y-3" onSubmit={handleSendRequest}>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                  <UserPlus className="h-4 w-4 text-sky-200" aria-hidden="true" />
                  <input
                    type="text"
                    value={requestInput}
                    onChange={(event) => setRequestInput(event.target.value)}
                    placeholder={t("friends.addForm.placeholder")}
                    className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:from-sky-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSendingRequest}
                >
                  {isSendingRequest ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : null}
                  {t("friends.addForm.button")}
                </button>
              </form>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/75 p-6 shadow-xl shadow-sky-500/10">
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">
                {t("friends.requests.incoming")}
              </h3>
              <div className="mt-4 space-y-3">
                {incomingRequests.length === 0 ? (
                  <p className="text-xs text-slate-500">{t("friends.requests.emptyIncoming")}</p>
                ) : (
                  incomingRequests.map((request) => (
                    <div
                      key={request.friendshipId}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-3"
                    >
                      <div className="flex items-center gap-3">
                        {buildAvatar(request.user)}
                        <div>
                          <p className="text-sm font-medium text-white">{request.user?.username}</p>
                          <p className="text-xs text-slate-400">
                            {t("friends.status.pending")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRespond(request.friendshipId, "accept")}
                          className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/30 disabled:opacity-60"
                          disabled={Boolean(pendingActions[request.friendshipId])}
                        >
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          {t("friends.requests.accept")}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRespond(request.friendshipId, "reject")}
                          className="inline-flex items-center gap-1 rounded-xl bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/30 disabled:opacity-60"
                          disabled={Boolean(pendingActions[request.friendshipId])}
                        >
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                          {t("friends.requests.reject")}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">
                {t("friends.requests.outgoing")}
              </h3>
              <div className="mt-4 space-y-3">
                {outgoingRequests.length === 0 ? (
                  <p className="text-xs text-slate-500">{t("friends.requests.emptyOutgoing")}</p>
                ) : (
                  outgoingRequests.map((request) => (
                    <div
                      key={request.friendshipId}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-3"
                    >
                      <div className="flex items-center gap-3">
                        {buildAvatar(request.user)}
                        <div>
                          <p className="text-sm font-medium text-white">{request.user?.username}</p>
                          <p className="text-xs text-slate-400">
                            {t("friends.status.pending")}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCancelOutgoing(request.friendshipId)}
                        className="inline-flex items-center gap-1 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/20 disabled:opacity-60"
                        disabled={Boolean(pendingActions[request.friendshipId])}
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                        {t("friends.requests.cancel")}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-sky-500/10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">
                    {t("friends.list.heading")}
                  </h3>
                  {friendsError ? (
                    <p className="mt-2 text-xs text-rose-300">{friendsError}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  <Search className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder={t("friends.list.searchPlaceholder")}
                    className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {isLoadingFriends ? (
                  <LoadingState fullscreen={false} message={t("loading.general", "Loading…")} className="py-8" />
                ) : filteredFriends.length === 0 ? (
                  <p className="rounded-2xl bg-white/5 px-4 py-6 text-xs text-slate-500">
                          {isFriendsEmpty ? t("friends.list.empty") : t("friends.list.emptySearch")}
                  </p>
                ) : (
                  filteredFriends.map((friend) => {
                    const friendId = friend?.user?.id;
                    const isActive = friendId === selectedFriendId;
                    return (
                      <div
                        key={friend.friendshipId}
                        className={`group flex items-center gap-3 rounded-2xl border px-3 py-3 transition ${
                          isActive
                            ? "border-sky-400 bg-sky-500/20"
                            : "border-white/5 bg-white/5 hover:border-sky-400/40 hover:bg-sky-500/10"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectFriend(friendId)}
                          className="flex flex-1 items-center gap-3 text-left"
                        >
                          {buildAvatar(friend.user)}
                          <div>
                            <p className="text-sm font-medium text-white">{friend.user?.username}</p>
                            <p className="flex items-center gap-2 text-xs text-slate-400">
                              <span
                                className={`h-2 w-2 rounded-full ${friend.online ? "bg-emerald-400" : "bg-slate-500"}`}
                                aria-hidden="true"
                              />
                              {friend.online ? t("friends.list.online") : t("friends.list.offline")}
                            </p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFriend(friend.friendshipId)}
                          className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-slate-200 transition hover:border-rose-400/50 hover:bg-rose-500/20"
                          disabled={Boolean(pendingActions[friend.friendshipId])}
                        >
                          <UserMinus className="h-3.5 w-3.5" aria-hidden="true" />
                          {t("friends.list.remove")}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </aside>

          <section className="flex h-full flex-col rounded-3xl border border-white/10 bg-slate-950/85 shadow-2xl shadow-indigo-500/20">
            <div className="flex items-center justify-between gap-4 border-b border-white/5 px-6 py-5">
              {selectedFriend ? (
                <div className="flex items-center gap-4">
                  {buildAvatar(selectedFriend.user)}
                  <div>
                    <p className="text-lg font-semibold text-white">{selectedFriend.user?.username}</p>
                    <p className="flex items-center gap-2 text-xs text-slate-400">
                      <span
                        className={`h-2 w-2 rounded-full ${selectedFriend.online ? "bg-emerald-400" : "bg-slate-500"}`}
                        aria-hidden="true"
                      />
                      {selectedFriend.online ? t("friends.list.online") : t("friends.list.offline")}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">{t("friends.chat.selectPrompt")}</p>
              )}
            </div>

            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="relative flex-1 overflow-y-auto px-6 py-6">
                {messagesLoading && conversationMessages.length === 0 ? (
                  <LoadingState
                    fullscreen={false}
                    message={t("friends.chat.loading")}
                    className="py-10"
                  />
                ) : messagesError ? (
                  <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {messagesError}
                  </div>
                ) : !selectedFriend ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    {t("friends.chat.selectPrompt")}
                  </div>
                ) : conversationMessages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    {t("friends.chat.empty")}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {conversation?.hasMore ? (
                      <button
                        type="button"
                        onClick={handleLoadOlderMessages}
                        className="mx-auto mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-200 transition hover:border-sky-400/40 hover:bg-sky-500/10"
                        disabled={messagesLoading}
                      >
                        {messagesLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                        ) : null}
                        {messagesLoading
                          ? t("friends.chat.loading")
                          : t("friends.chat.loadPrevious")}
                      </button>
                    ) : null}
                    {conversationMessages.map((message) => {
                      const isOwn = message.sender === user?.id;
                      return (
                        <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`${
                              isOwn
                                ? "rounded-2xl bg-indigo-500/90 px-4 py-2 text-sm text-white shadow-lg shadow-indigo-500/40"
                                : "rounded-2xl bg-white/10 px-4 py-2 text-sm text-slate-100"
                            }`}
                          >
                            <p>{message.body}</p>
                            <p className={`mt-1 text-[10px] ${isOwn ? "text-indigo-100/80" : "text-slate-400"}`}>
                              {message.createdAt ? timeFormatter.format(new Date(message.createdAt)) : ""}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="border-t border-white/5 px-6 py-5">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(event) => setMessageInput(event.target.value)}
                    placeholder={t("friends.chat.placeholder")}
                    className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none disabled:opacity-60"
                    disabled={!selectedFriend || isSendingMessage}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-400 hover:to-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!selectedFriend || isSendingMessage || !messageInput.trim()}
                  >
                    {isSendingMessage ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <MessageSquareText className="h-4 w-4" aria-hidden="true" />
                    )}
                    {t("friends.chat.send")}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default RequireAuth(FriendsPage);
