import type { Doodle } from "@/data/story";

// Little pen drawings for each story page. They draw themselves in using the .scribble styles in globals.css.
const paths: Record<Doodle, string[]> = {
  // a bar chart with a tick
  chart: ["M14 86 H 92", "M24 84 V 60", "M40 84 V 44", "M56 84 V 52", "M72 84 V 30", "M66 20 L 74 28 L 90 10"],
  // a map pin over a wavy road
  pin: [
    "M50 62 C 34 44, 30 36, 30 30 C 30 18, 40 10, 50 10 C 60 10, 70 18, 70 30 C 70 36, 66 44, 50 62 Z",
    "M50 24 C 56 24, 56 34, 50 34 C 44 34, 44 24, 50 24",
    "M10 80 C 28 70, 40 90, 58 80 C 74 72, 82 84, 92 78",
  ],
  // code brackets with a slash
  brackets: ["M32 22 L 12 50 L 32 78", "M68 22 L 88 50 L 68 78", "M58 18 L 42 82"],
  // a little lantern with rays
  lantern: [
    "M50 8 V 18",
    "M38 18 H 62 L 66 26 H 34 Z",
    "M36 26 C 30 40, 30 60, 36 74 H 64 C 70 60, 70 40, 64 26",
    "M40 74 H 60 V 82 H 40 Z",
    "M18 46 H 8",
    "M82 46 H 92",
    "M22 24 L 15 17",
    "M78 24 L 85 17",
  ],
  // a paintbrush and a music note
  brush: [
    "M14 82 C 14 72, 22 66, 30 70 C 34 76, 28 86, 14 82 Z",
    "M30 70 L 58 34",
    "M62 64 V 20 L 88 14 V 56",
    "M62 64 C 62 72, 50 72, 50 66 C 50 60, 60 58, 62 64",
    "M88 56 C 88 64, 76 64, 76 58 C 76 52, 86 50, 88 56",
  ],
  // a paper plane with a looping trail
  plane: [
    "M88 14 L 40 40 L 56 46 L 62 64 Z",
    "M56 46 L 88 14",
    "M40 40 C 26 46, 30 62, 22 66 C 14 70, 10 60, 18 58 C 26 56, 22 80, 10 88",
  ],
};

export function StoryDoodle({ kind, className = "" }: { kind: Doodle; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className={`scribble overflow-visible ${className}`}
    >
      {paths[kind].map((d, i) => (
        <path key={d} d={d} pathLength={1} style={{ animationDelay: `${0.35 + i * 0.18}s` }} />
      ))}
    </svg>
  );
}
