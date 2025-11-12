// client/src/components/ConfirmDialog.jsx
'use client';
import { useEffect, useRef, useCallback, useId, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, ShieldAlert, ShieldCheck } from 'lucide-react';

const toneStyles = {
  default: {
    iconWrapper: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    accent: 'from-blue-500/15 via-blue-500/5 to-transparent',
    confirmButton:
      'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30 hover:from-blue-400 hover:to-indigo-400 focus-visible:outline-blue-500',
  },
  danger: {
    iconWrapper: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    accent: 'from-rose-500/18 via-rose-500/6 to-transparent',
    confirmButton:
      'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-lg shadow-rose-500/30 hover:from-rose-400 hover:to-red-400 focus-visible:outline-rose-500',
  },
};

export default function ConfirmDialog({
  open,
  title = 'Confirm',
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  onOpenChange,        // (nextOpen:boolean) => void
  loading = false,
  variant,             // 'danger' | undefined
  icon,
}) {
  const backdropRef = useRef(null);
  const panelRef = useRef(null);
  const lastActiveRef = useRef(null);

  // IDs cho a11y
  const titleId = useId();
  const descId  = useId();

  // Ghi nhớ phần tử hiện tại để trả focus khi đóng
  useEffect(() => {
    if (open) {
      lastActiveRef.current = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    } else {
      // trả focus về opener khi đóng
      lastActiveRef.current?.focus?.();
      lastActiveRef.current = null;
    }
  }, [open]);

  // Khoá scroll nền khi mở
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Focus phần tử đầu tiên khi mở
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      // ưu tiên nút confirm, sau đó tới nút cancel
      const focusables = backdropRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables && focusables.length > 0) {
        (focusables[0] instanceof HTMLElement) && focusables[0].focus();
      } else {
        panelRef.current?.focus?.();
      }
    }, 0);
    return () => clearTimeout(t);
  }, [open]);

  // Trap focus + Esc
  const onKeyDown = useCallback((e) => {
    if (!open) return;

    if (e.key === 'Escape') {
      if (loading) return; // khi loading không cho đóng
      onCancel?.();
      onOpenChange?.(false);
      return;
    }

    if (e.key === 'Tab') {
      const list = backdropRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const nodes = list ? Array.from(list) : [];
      if (!nodes.length) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      // Nếu đang ở ngoài panel (hiếm), đẩy vào panel
      if (!backdropRef.current?.contains(document.activeElement)) {
        e.preventDefault();
        (first instanceof HTMLElement) && first.focus();
        return;
      }

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          (last instanceof HTMLElement) && last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          (first instanceof HTMLElement) && first.focus();
        }
      }
    }
  }, [open, loading, onCancel, onOpenChange]);

  const toneKey = variant === 'danger' ? 'danger' : 'default';
  const styles = toneStyles[toneKey];
  const IconComponent = useMemo(() => icon || (toneKey === 'danger' ? ShieldAlert : ShieldCheck), [icon, toneKey]);

  if (!open) return null;

  return createPortal(
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
      aria-busy={loading ? 'true' : 'false'}
      onKeyDown={onKeyDown}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          if (loading) return; // chặn đóng khi loading
          onCancel?.();
          onOpenChange?.(false);
        }
      }}
    >
      <div
        ref={panelRef}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/30 bg-white/98 p-6 text-slate-900 shadow-[0_30px_60px_-32px_rgba(15,23,42,0.75)] outline-none transition dark:border-white/8 dark:bg-slate-950/92 dark:text-white dark:shadow-[0_30px_60px_-28px_rgba(2,6,23,0.85)]"
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${styles.accent}`} aria-hidden="true" />
        <div className="relative flex flex-col gap-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200/40 bg-white/95 shadow-sm dark:border-white/12 dark:bg-white/10" aria-hidden="true">
            <div className={`flex h-full w-full items-center justify-center rounded-2xl ${styles.iconWrapper}`}>
              <IconComponent className="h-6 w-6" />
            </div>
          </div>

          <header className="flex flex-col gap-2 text-center">
            <h2 className="text-lg font-semibold tracking-tight" id={titleId}>
              {title}
            </h2>
            {description && (
              <div className="text-sm text-slate-600 dark:text-white/70" id={descId}>
                {typeof description === 'string' ? <p>{description}</p> : description}
              </div>
            )}
          </header>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200/40 bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15"
              onClick={() => {
                if (loading) return;
                onCancel?.();
                onOpenChange?.(false);
              }}
              disabled={loading}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${styles.confirmButton}`}
              onClick={() => {
                if (loading) return;
                onConfirm?.();
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{confirmText}</span>
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
