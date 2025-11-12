// client/src/components/LoadingState.jsx
"use client";

import { Loader2 } from "lucide-react";

export default function LoadingState({
  message = "Loading...",
  detail,
  fullscreen = true,
  icon: Icon = Loader2,
  className = "",
}) {
  const containerClasses = fullscreen
    ? "min-h-[60vh]"
    : "min-h-0";

  return (
    <div className={`${containerClasses} flex w-full items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-6 py-6 text-center shadow-2xl shadow-purple-500/10 backdrop-blur">
        <Icon className="h-10 w-10 animate-spin text-violet-300" />
        <p className="text-sm font-medium text-white/80">
          {message}
        </p>
        {detail ? <p className="max-w-sm text-xs text-white/50">{detail}</p> : null}
      </div>
    </div>
  );
}
