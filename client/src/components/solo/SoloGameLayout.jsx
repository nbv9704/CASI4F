// client/src/components/solo/SoloGameLayout.jsx
"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-4 shadow-inner shadow-black/20 backdrop-blur-sm">
      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-white/50">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-white" suppressHydrationWarning>
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-white/40" suppressHydrationWarning>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export default function SoloGameLayout({
  title,
  subtitle,
  accent,
  icon: Icon,
  backHref = "/game/solo",
  backLabel = "Back",
  actions,
  stats = [],
  children,
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0d0b14] text-slate-100">
      <div
        className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 right-[-120px] h-80 w-80 rounded-full bg-violet-500/20 blur-3xl"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[120px]" aria-hidden="true" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-20 pt-12 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-lg shadow-black/30 backdrop-blur">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-slate-900/30" aria-hidden="true" />
          <div className="relative flex flex-col gap-6 px-6 py-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-4">
              {accent ? (
                <span className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 bg-white/10 px-4 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.32em] text-white/60">
                  {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                  {accent}
                </span>
              ) : null}
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold text-white lg:text-4xl" suppressHydrationWarning>
                  {title}
                </h1>
                {subtitle ? (
                  <p className="max-w-2xl text-sm text-white/70 lg:text-base" suppressHydrationWarning>
                    {subtitle}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-3 text-sm lg:items-end">
              {actions}
              <Link
                href={backHref}
                className="inline-flex items-center gap-2 self-end rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-white/70 transition hover:border-white/40 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {backLabel}
              </Link>
            </div>
          </div>

          {stats.length > 0 ? (
            <div className="relative border-t border-white/5 px-6 py-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                  <StatCard
                    key={`${item.label}-${item.value}`}
                    label={item.label}
                    value={item.value}
                    hint={item.hint}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </section>

        {children}
      </div>
    </div>
  );
}
