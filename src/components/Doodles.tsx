import type { CSSProperties, ReactNode } from "react";

// Pen marks drawn over the page. Each path uses pathLength="1" so the draw-in animation in globals.css works for any shape.

export function PenCircle({ children, delay = "1.8s" }: { children: ReactNode; delay?: string }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 50"
        preserveAspectRatio="none"
        className="scribble pointer-events-none absolute -top-[15%] -left-[8%] h-[130%] w-[118%] sm:-left-[12%] sm:w-[124%] overflow-visible"
        style={{ "--d": delay } as CSSProperties}
      >
        <path pathLength={1} d="M3 18 C 12 2, 70 1, 92 8 C 106 14, 103 38, 82 44 C 58 50, 12 50, 3 36 C -2 26, 2 12, 40 3" />
      </svg>
    </span>
  );
}

export function PenArrow({ className = "", delay = "0.4s" }: { className?: string; delay?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 70"
      className={`scribble pointer-events-none overflow-visible ${className}`}
      style={{ "--d": delay } as CSSProperties}
    >
      <path pathLength={1} d="M6 10 C 30 4, 58 12, 70 30 C 80 45, 92 54, 110 56" />
      <path pathLength={1} d="M96 46 L 111 56 L 95 64" />
    </svg>
  );
}
