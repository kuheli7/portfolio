"use client";

import { useEffect, useState } from "react";

type Egg = "mango" | "grapes";

const WORDS: Egg[] = ["mango", "grapes"];
let greeted = false;

// Type "mango" or "grapes" anywhere outside a text field. Purely for fun; the page doesn't change.
export function EasterEggs() {
  const [egg, setEgg] = useState<{ kind: Egg; key: number } | null>(null);

  useEffect(() => {
    if (!greeted) {
      greeted = true;
      console.log(
        "%cHi, fellow developer!%c\nThe source is at https://github.com/kuheli7/portfolio\nPsst: try typing “mango” or “grapes” anywhere on the page.",
        "font: 600 16px/1.6 system-ui; color: #f6cf6a",
        "font: 13px/1.6 system-ui",
      );
    }

    let typed = "";
    let timer = 0;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return;
      if (target?.closest("input, textarea, select, [contenteditable=''], [contenteditable='true']")) return;
      typed = (typed + event.key.toLowerCase()).slice(-6);
      const word = WORDS.find((w) => typed.endsWith(w));
      if (!word) return;
      typed = "";
      setEgg({ kind: word, key: Date.now() });
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setEgg(null), 3400);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <p role="status" className="sr-only">
        {egg?.kind === "mango" ? "A mango rolls past." : egg?.kind === "grapes" ? "A bunch of grapes drops in." : ""}
      </p>
      {egg?.kind === "mango" && (
        <div key={egg.key} aria-hidden="true" className="pointer-events-none fixed inset-x-0 bottom-3 z-50">
          <Mango className="egg-roll size-16" />
        </div>
      )}
      {egg?.kind === "grapes" && (
        <div key={egg.key} aria-hidden="true" className="pointer-events-none fixed right-6 bottom-6 z-50">
          <Grapes className="egg-drop size-20" />
        </div>
      )}
    </>
  );
}

function Mango({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className}>
      <defs>
        <radialGradient id="egg-mango" cx=".35" cy=".35" r=".8">
          <stop offset="0" stopColor="#ffe08a" />
          <stop offset=".55" stopColor="#f7b733" />
          <stop offset="1" stopColor="#ef7d3c" />
        </radialGradient>
      </defs>
      <path d="M12 38c0-15 11-26 25-26 9 0 15 6 15 15 0 16-14 31-28 31-8 0-12-7-12-20Z" fill="url(#egg-mango)" />
      <ellipse cx="25" cy="27" rx="5" ry="3" fill="#fff" opacity=".45" transform="rotate(-35 25 27)" />
      <path d="M37 12c-1-3-2-5-4-7" stroke="#6b4a2b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M37 11c3-6 10-8 16-6-2 6-9 9-16 6Z" fill="#5fa65a" />
    </svg>
  );
}

function Grapes({ className }: { className?: string }) {
  const berries: [number, number][] = [
    [24, 26], [34, 26], [44, 26],
    [29, 35], [39, 35],
    [24, 44], [34, 44], [44, 44],
    [29, 53], [39, 53],
    [34, 61],
  ];
  return (
    <svg viewBox="0 0 68 72" className={className}>
      <path d="M34 20c0-6 2-11 6-14" stroke="#6b4a2b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M38 12c5-7 14-8 20-4-4 6-12 9-20 4Z" fill="#5fa65a" />
      {berries.map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r="6.5" fill="#8a5cc7" />
          <circle cx={cx - 2} cy={cy - 2.2} r="1.8" fill="#fff" opacity=".5" />
        </g>
      ))}
    </svg>
  );
}
