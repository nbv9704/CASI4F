// client/src/components/VerifyFairnessModal.jsx
"use client";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { ShieldCheck, Copy, Check, AlertTriangle, Hash, Key, Database, Layers } from "lucide-react";
import useApi from "@/hooks/useApi";

export default function VerifyFairnessModal({ roomId, gameData = null, open, onClose, onOpenChange }) {
  const { get } = useApi();

  // Giữ ref ổn định cho get() để tránh loop useEffect
  const getRef = useRef(get);
  useEffect(() => { getRef.current = get; }, [get]);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState("");
  const backdropRef = useRef(null);

  const resolvedRoomId = useMemo(() => {
    if (roomId) return roomId;
    if (gameData && typeof gameData === 'object') {
      return gameData.roomId || gameData._id || null;
    }
    return null;
  }, [roomId, gameData]);

  useEffect(() => { onOpenChange?.(!!open); }, [open, onOpenChange]);

  // Khoá scroll nền
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Load dữ liệu khi mở
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    (async () => {
      try {
        if (!resolvedRoomId) {
          setData(gameData || null);
          setError(gameData ? '' : 'Missing room identifier');
          return;
        }
        setLoading(true);
        setError('');
        const res = await getRef.current(`/pvp/${resolvedRoomId}/verify`);
        if (!cancelled) setData(res || null);
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || 'Fetch verify data failed');
          setData(gameData || null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [open, resolvedRoomId, gameData]);

  // Trap focus + Esc
  const onKeyDown = useCallback((e) => {
    if (!open) return;
    if (e.key === 'Escape') {
      onClose?.();
      onOpenChange?.(false);
    }
    if (e.key === 'Tab') {
      const list = backdropRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!list || !list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }, [open, onClose, onOpenChange]);

  const handleCopy = useCallback(async (key, payload) => {
    try {
      const text = typeof payload === "string" ? payload : JSON.stringify(payload ?? {}, null, 2);
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1500);
    } catch {}
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Verify Fairness">
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/50"
        onMouseDown={(e) => { if (e.target === e.currentTarget) { onClose?.(); onOpenChange?.(false); } }}
        onKeyDown={onKeyDown}
        tabIndex={-1}
      >
        <div className="absolute inset-0 flex items-center justify-center p-4" onMouseDown={(e) => e.stopPropagation()}>
          <div className="relative w-full max-w-2xl md:max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#0d1226] text-slate-100 shadow-2xl shadow-black/40">
            <div className="absolute -right-10 -top-14 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden="true" />
            <div className="absolute -left-16 bottom-[-120px] h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" aria-hidden="true" />

            <div className="relative flex max-h-[85vh] flex-col">
              <button
                type="button"
                onClick={() => { onClose?.(); onOpenChange?.(false); }}
                className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-white/70 transition hover:border-white/30 hover:text-white"
              >
                Close
              </button>

              <div className="flex flex-col gap-6 overflow-y-auto px-6 py-6 sm:px-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-500/20 text-emerald-200">
                    <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Transparency snapshot</p>
                    <h2 className="text-xl font-semibold text-white">Verify Fairness</h2>
                  </div>
                </div>

                {loading && (
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-300 border-r-transparent" aria-hidden="true" />
                    Fetching verification data…
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                    {error}
                  </div>
                )}

                {!loading && !error && data && (
                  <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <DetailCard
                        icon={Database}
                        label="Game"
                        value={data.game || "-"}
                      />
                      <DetailCard
                        icon={Layers}
                        label="Nonce start"
                        value={typeof data.nonceStart === "number" ? data.nonceStart : "-"}
                      />
                    </div>

                    <div className="grid gap-4">
                      <CopyRow
                        icon={Hash}
                        label="Server seed commit"
                        value={data.serverSeedHash}
                        copied={copiedKey === "serverHash"}
                        onCopy={() => handleCopy("serverHash", data.serverSeedHash)}
                      />

                      {data.serverSeedReveal && (
                        <CopyRow
                          icon={Hash}
                          label="Server seed reveal"
                          value={data.serverSeedReveal}
                          copied={copiedKey === "serverReveal"}
                          onCopy={() => handleCopy("serverReveal", data.serverSeedReveal)}
                        />
                      )}

                      <CopyRow
                        icon={Key}
                        label="Client seed"
                        value={data.clientSeed}
                        copied={copiedKey === "clientSeed"}
                        onCopy={() => handleCopy("clientSeed", data.clientSeed)}
                      />
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">Full payload</p>
                          <p className="text-xs text-white/60">Cross-check this JSON with your own verifier.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy("raw", data)}
                          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:border-emerald-300 hover:text-white"
                        >
                          {copiedKey === "raw" ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                          {copiedKey === "raw" ? "Copied" : "Copy JSON"}
                        </button>
                      </div>
                      <div className="max-h-56 overflow-auto rounded-2xl bg-black/30 p-3 text-xs text-emerald-100">
                        <pre className="whitespace-pre-wrap break-words">
{JSON.stringify(data, null, 2)}
                        </pre>
                      </div>
                    </div>

                    <footer className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
                      Compare these values with the match history entry or plug them into your own verifier to ensure the revealed server seed matches the committed hash.
                    </footer>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-white/70">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">{label}</p>
        <p className="truncate text-sm font-semibold text-white">{value ?? "-"}</p>
      </div>
    </div>
  );
}

function CopyRow({ icon: Icon, label, value, onCopy, copied }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-2 rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Icon className="h-4 w-4 text-emerald-300" aria-hidden="true" />
          {label}
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs font-semibold text-white/70 transition hover:border-emerald-300 hover:text-white"
        >
          {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="break-words rounded-2xl bg-black/25 px-3 py-3 text-xs text-white/80">{value}</p>
    </div>
  );
}
