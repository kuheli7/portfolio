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
        className="scribble pointer-events-none absolute -top-[30%] -left-[13%] h-[160%] w-[126%] overflow-visible"
        style={{ "--d": delay } as CSSProperties}
      >
        <path pathLength={1} d="M14 33 C 6 16, 44 5, 76 9 C 98 12, 99 33, 78 42 C 56 50, 14 47, 7 32 C 3 22, 22 11, 42 9" />
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
