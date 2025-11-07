// client/src/components/solo/SoloCard.jsx
"use client";

export default function SoloCard({ className = "", padding = "px-6 py-6", children }) {
  const base = "relative rounded-3xl border border-white/10 bg-white/5 shadow-lg shadow-black/30 backdrop-blur";
  const composed = `${base} ${padding} ${className}`.trim();
  return <section className={composed}>{children}</section>;
}
