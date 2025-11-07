"use client";

import { useEffect, useMemo, useState } from "react";
import DiceFace from "./DiceFace";

export default function RevealingDiceFaces({
  dice = [],
  size = "sm",
  delay = 150,
  className = "",
  faceClassName = "",
  faceWrapperClassName = "",
  visibleClassName = "opacity-100 scale-100 translate-y-0",
  hiddenClassName = "opacity-0 scale-90 translate-y-1",
  visibleCount: controlledVisibleCount = null,
  containerClassName = "flex items-center justify-center gap-2"
}) {
  const [autoVisibleCount, setAutoVisibleCount] = useState(0);

  const diceKey = useMemo(() => {
    if (!Array.isArray(dice)) return "";
    return `${dice.length}-${dice.map((value, index) => `${index}:${value}`).join("|")}`;
  }, [dice]);

  const isControlled = typeof controlledVisibleCount === "number";
  const effectiveVisibleCount = isControlled
    ? Math.max(0, controlledVisibleCount)
    : autoVisibleCount;

  useEffect(() => {
    if (isControlled) {
      return () => {};
    }

    if (!Array.isArray(dice) || dice.length === 0) {
      setAutoVisibleCount(0);
      return;
    }

    setAutoVisibleCount(0);
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setAutoVisibleCount(current);
      if (current >= dice.length) {
        clearInterval(interval);
      }
    }, delay);

    return () => {
      clearInterval(interval);
    };
  }, [diceKey, dice, delay, isControlled]);

  const containerClass = `${containerClassName} ${className}`.trim();
  const baseWrapperClass = "flex items-center justify-center transition-all duration-200";

  return (
    <div className={containerClass}>
      {Array.isArray(dice) && dice.map((value, idx) => (
        <div
          key={`${idx}-${value}`}
          className={`${baseWrapperClass} ${faceWrapperClassName} ${idx < effectiveVisibleCount ? visibleClassName : hiddenClassName}`.trim()}
        >
          <DiceFace value={value} size={size} className={faceClassName} />
        </div>
      ))}
    </div>
  );
}
