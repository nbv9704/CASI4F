"use client";

import { useId, memo } from "react";

const pipLayouts = {
  1: [
    { x: 50, y: 50 }
  ],
  2: [
    { x: 30, y: 30 },
    { x: 70, y: 70 }
  ],
  3: [
    { x: 30, y: 30 },
    { x: 50, y: 50 },
    { x: 70, y: 70 }
  ],
  4: [
    { x: 30, y: 30 },
    { x: 70, y: 30 },
    { x: 30, y: 70 },
    { x: 70, y: 70 }
  ],
  5: [
    { x: 30, y: 30 },
    { x: 70, y: 30 },
    { x: 50, y: 50 },
    { x: 30, y: 70 },
    { x: 70, y: 70 }
  ],
  6: [
    { x: 30, y: 30 },
    { x: 70, y: 30 },
    { x: 30, y: 50 },
    { x: 70, y: 50 },
    { x: 30, y: 70 },
    { x: 70, y: 70 }
  ]
};

const gradientByValue = {
  1: ["#f97316", "#fb7185"],
  2: ["#38bdf8", "#6366f1"],
  3: ["#ec4899", "#f472b6"],
  4: ["#14b8a6", "#0ea5e9"],
  5: ["#facc15", "#f97316"],
  6: ["#22c55e", "#16a34a"],
  default: ["#38bdf8", "#6366f1"]
};

const sizeClasses = {
  xs: "w-10 h-10",
  sm: "w-12 h-12",
  md: "w-16 h-16",
  lg: "w-20 h-20",
  xl: "w-24 h-24",
  "2xl": "w-32 h-32"
};

function DiceFace({ value = 1, size = "sm", className = "", pipColor = "#ffffff", strokeColor = "rgba(15,23,42,0.35)" }) {
  const clampedValue = Math.min(Math.max(Math.round(value), 1), 6);
  const layout = pipLayouts[clampedValue] ?? pipLayouts[1];
  const [start, end] = gradientByValue[clampedValue] ?? gradientByValue.default;
  const rawId = useId();
  const gradientId = `${rawId.replace(/:/g, "")}-dice-gradient`;
  const sizeClass = sizeClasses[size] ?? sizeClasses.sm;
  const combinedClassName = `${sizeClass} rounded-3xl drop-shadow-xl ${className}`.trim();

  return (
    <svg
      viewBox="0 0 100 100"
      className={combinedClassName}
      role="img"
      aria-label={`Dice showing ${clampedValue}`}
      focusable="false"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={start} />
          <stop offset="100%" stopColor={end} />
        </linearGradient>
      </defs>

      <rect
        x="8"
        y="8"
        width="84"
        height="84"
        rx="18"
        fill={`url(#${gradientId})`}
        stroke={strokeColor}
        strokeWidth="4"
      />

      {layout.map((pip, index) => (
        <circle key={index} cx={pip.x} cy={pip.y} r="8" fill={pipColor} />
      ))}
    </svg>
  );
}

export default memo(DiceFace);
