// client/src/components/NotificationBell.jsx
'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import useApi from '../hooks/useApi';
import useSocket from '../hooks/useSocket';
import { useUser } from '../context/UserContext';
import { useRouter } from 'next/navigation';
import { useLocale } from '../context/LocaleContext';

function dedupeById(list) {
  const seen = new Set();
  const out = [];
  for (const n of list) {
    const id = n?._id || n?.id;
    if (!id || !seen.has(id)) {
      if (id) seen.add(id);
      out.push(n);
    }
  }
  return out;
}

export default function NotificationBell() {
  const router = useRouter();
  const { user } = useUser();
  const { get, patch, post } = useApi();
  const { t, locale } = useLocale();

  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const [isRefreshing, setIsRefreshing]   = useState(false);

  const bellRef = useRef(null);
  const mountedRef = useRef(false);
  const inflightRef = useRef(false);

  // 🔒 Cố định các hàm API để tránh đổi identity mỗi render
  const getRef = useRef(get);
  const patchRef = useRef(patch);
  const postRef = useRef(post);
  useEffect(() => { getRef.current = get; }, [get]);
  useEffect(() => { patchRef.current = patch; }, [patch]);
  useEffect(() => { postRef.current = post; }, [post]);

  // Guard mounted
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    if (inflightRef.current) return; // chặn spam/loop
    inflightRef.current = true;
    try {
      setIsRefreshing(true);
      const res = await getRef.current(`/notification?limit=100&ts=${Date.now()}`);
      const serverList = Array.isArray(res.notifications) ? res.notifications : [];
      setNotifications(prev => dedupeById([...serverList, ...prev]));
    } catch {
      // giữ nguyên danh sách cũ nếu lỗi
    } finally {
      inflightRef.current = false;
      if (mountedRef.current) setIsRefreshing(false);
    }
  }, [user]);

  // Initial fetch khi user thay đổi (⚠️ chỉ phụ thuộc user để tránh loop)
  useEffect(() => {
    if (user) fetchNotifications();
    else setNotifications([]);
  }, [user, fetchNotifications]);

  // Prefetch trang /notifications khi mở dropdown → điều hướng mượt hơn
  useEffect(() => {
    if (dropdownOpen) router.prefetch('/notifications');
  }, [dropdownOpen, router]);

  // Real-time incoming notifications (dedupe)
  useSocket(user?.id, notif => {
    if (!notif) return;
    setNotifications(prev => dedupeById([notif, ...prev]));
  });

  // Close dropdown on outside click
  useEffect(() => {
    function onClick(e) {
      if (!dropdownOpen) return;
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [dropdownOpen]);

  // Close with Escape
  useEffect(() => {
    function onKey(e) {
      if (!dropdownOpen) return;
      if (e.key === 'Escape') setDropdownOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [dropdownOpen]);

  const markAsRead = useCallback(async (id) => {
    try {
      await patchRef.current(`/notification/${id}/read`);
      setNotifications(ns => ns.map(n => (n._id === id ? { ...n, read: true } : n)));
    } catch {
      // no-op
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n?.read);
    if (unread.length === 0) return;
    await Promise.all(
      unread.map((n) => patchRef.current(`/notification/${n._id}/read`).catch(() => null))
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [notifications]);

  const onItemClick = useCallback(async (n) => {
    if (!n) return;

    // Mark read (best-effort)
    await markAsRead(n._id);

    // Extract roomId & path from metadata/link
    const roomId = n?.metadata?.roomId || (typeof n?.link === 'string' ? n.link.split('/').pop() : undefined);
    const path = n?.metadata?.path || n?.link || (roomId ? `/game/battle/room/${roomId}` : null);

    if (roomId) {
      try {
        // Auto-join before redirect (ignore errors like "already in room")
        await postRef.current(`/pvp/${roomId}/join`, {});
      } catch {}
    }

    if (path) {
      router.push(path);
      setDropdownOpen(false);
    }
  }, [markAsRead, router]);

  const unreadCount = useMemo(
    () => notifications.reduce((acc, n) => (n?.read ? acc : acc + 1), 0),
    [notifications]
  );
  const unreadBadge = unreadCount > 99 ? '99+' : unreadCount || null;
  const recent7 = useMemo(() => notifications.slice(0, 7), [notifications]);
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale || 'en-US', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [locale]
  );

  return (
    <div className="relative" ref={bellRef}>
      <button
        onClick={() => setDropdownOpen(o => !o)}
        aria-label={t('notifications.dropdown.ariaButton')}
        aria-expanded={dropdownOpen}
        aria-haspopup="menu"
        className="group relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white transition hover:border-indigo-400/60 hover:bg-indigo-500/20"
        type="button"
      >
        <Bell className="h-5 w-5 text-white/80 group-hover:text-white" />
        {unreadBadge && (
          <span
            aria-label={t('notifications.dropdown.ariaBadge', { count: unreadCount })}
            className="absolute -top-1 -right-1 min-w-[20px] rounded-full bg-gradient-to-r from-pink-500 to-red-500 px-1 text-[11px] font-semibold text-white shadow-lg"
          >
            {unreadBadge}
          </span>
        )}
      </button>

      {dropdownOpen && (
        <div
          role="menu"
          aria-label={t('notifications.dropdown.ariaButton')}
          className="absolute right-0 mt-3 w-80 rounded-3xl border border-white/10 bg-slate-950/95 p-4 text-white shadow-2xl shadow-indigo-500/20 backdrop-blur z-50"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-200">
              {t('notifications.dropdown.title')}
            </h3>
            {unreadBadge && (
              <span className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-white">
                {t('notifications.list.unreadBadge')}
              </span>
            )}
          </div>
          <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {recent7.length === 0 ? (
              <li className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-white/60">
                {t('notifications.dropdown.empty')}
              </li>
            ) : (
              recent7.map(n => (
                <li key={n._id || n.id}>
                  <button
                    type="button"
                    onClick={() => onItemClick(n)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition hover:border-indigo-400/60 hover:bg-indigo-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
                      n.read ? 'border-white/10 bg-white/5 text-white/70' : 'border-indigo-400/40 bg-indigo-500/20 text-white'
                    }`}
                    title={n?.metadata?.path || ''}
                    role="menuitem"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onItemClick(n);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <p className="text-sm leading-snug">{n.message}</p>
                        <span className="text-[11px] text-white/60">
                          {t('notifications.list.timestamp', {
                            time: n?.createdAt ? dateFormatter.format(new Date(n.createdAt)) : '',
                          })}
                        </span>
                      </div>
                      {!n.read && (
                        <span className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                          {t('notifications.list.unreadBadge')}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))
            )}
          </ul>
          <div className="pt-2 flex items-center justify-between gap-2">
            <button
              onClick={markAllAsRead}
              disabled={notifications.length === 0 || unreadCount === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-indigo-400/50 hover:text-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
            >
              {t('notifications.dropdown.markAll')}
            </button>
            <button
              onClick={fetchNotifications}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-indigo-400/50 hover:text-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>{t('notifications.dropdown.refreshing')}</span>
                </>
              ) : (
                <span>{t('notifications.dropdown.refresh')}</span>
              )}
            </button>
            <button
              onClick={() => { setDropdownOpen(false); router.push('/notifications'); }}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-indigo-400/50 hover:text-indigo-100"
              type="button"
            >
              {t('notifications.dropdown.viewAll')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
