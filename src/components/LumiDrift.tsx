"use client";

import { useEffect, useRef, type ReactNode } from "react";

const REACH = 14; // the furthest Lumi drifts, in pixels

// Lumi leans a little toward the cursor, easing there slowly. Mouse and trackpad only, and never with reduced motion.
export function LumiDrift({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let frame = 0;

    const step = () => {
      x += (targetX - x) * 0.06;
      y += (targetY - y) * 0.06;
      el.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;
      frame = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.05 ? requestAnimationFrame(step) : 0;
    };
    const start = () => {
      if (!frame) frame = requestAnimationFrame(step);
    };
    const onMove = (event: PointerEvent) => {
      const box = el.getBoundingClientRect();
      const dx = event.clientX - (box.left + box.width / 2);
      const dy = event.clientY - (box.top + box.height / 2);
      const distance = Math.hypot(dx, dy) || 1;
      const pull = Math.min(1, distance / 500);
      targetX = (dx / distance) * REACH * pull;
      targetY = (dy / distance) * REACH * pull;
      start();
    };
    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      start();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      el.style.translate = "";
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
