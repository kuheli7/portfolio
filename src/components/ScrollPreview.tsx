"use client";

import { useEffect, useRef, useState } from "react";

type Props = { still: string; animated: string; width: number; height: number };

// The still shot always sits underneath. The looping scroll is only mounted while the preview is on screen, so a
// preview you can't see isn't animating, and it starts from the top each time you reach it. Reduced motion keeps the still.
export function ScrollPreview({ still, animated, width, height }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setPlaying(entry.isIntersecting);
        if (!entry.isIntersecting) setReady(false);
      },
      // Only the middle of the screen counts, so on a phone just the preview you are looking at plays
      { rootMargin: "-30% 0px -30% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={box} className="relative aspect-[16/10] w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={still}
        alt=""
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full object-cover object-top"
      />
      {playing && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={animated}
          alt=""
          width={720}
          height={450}
          decoding="async"
          onLoad={() => setReady(true)}
          className={`absolute inset-0 size-full object-cover object-top transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}
