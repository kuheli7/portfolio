// Star pictures for the /play sky. Coordinates are in the sky's 800 × 500 viewBox and never change,
// so the server and the browser always draw the same sky.

export type Star = { x: number; y: number };

export type Constellation = {
  key: string;
  name: string;
  stars: Star[];
  // pairs of star indexes that make the picture
  lines: [number, number][];
  fact: string;
  // a star that lights up when the picture is finished (Lumi's lantern flame)
  glow?: Star;
};

export const constellations: Constellation[] = [
  {
    key: "mango",
    name: "Mango",
    stars: [
      { x: 473, y: 132 },
      { x: 533, y: 192 },
      { x: 537, y: 276 },
      { x: 486, y: 355 },
      { x: 412, y: 403 },
      { x: 334, y: 420 },
      { x: 305, y: 353 },
      { x: 294, y: 265 },
      { x: 322, y: 176 },
      { x: 389, y: 124 },
      { x: 483, y: 86 },
      { x: 559, y: 66 },
      { x: 529, y: 108 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 8],
      [8, 9],
      [9, 0],
      [0, 10],
      [10, 11],
      [11, 12],
      [12, 10],
    ],
    fact: "A mango: my favourite fruit, when the mood is right.",
  },
  {
    key: "grapes",
    name: "Grapes",
    stars: [
      { x: 410, y: 92 },
      { x: 320, y: 175 },
      { x: 410, y: 175 },
      { x: 500, y: 175 },
      { x: 365, y: 265 },
      { x: 455, y: 265 },
      { x: 410, y: 355 },
      { x: 492, y: 62 },
    ],
    lines: [
      [0, 2],
      [1, 2],
      [2, 3],
      [1, 4],
      [2, 4],
      [2, 5],
      [3, 5],
      [4, 5],
      [4, 6],
      [5, 6],
      [0, 7],
    ],
    fact: "Grapes, the other favourite. Mango or grapes? Depends on the mood.",
  },
  {
    key: "paintbrush",
    name: "Paintbrush",
    stars: [
      { x: 238, y: 428 },
      { x: 252, y: 346 },
      { x: 322, y: 412 },
      { x: 296, y: 306 },
      { x: 362, y: 366 },
      { x: 574, y: 104 },
    ],
    lines: [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 4],
      [3, 4],
      [3, 5],
      [4, 5],
    ],
    fact: "A paintbrush. I draw when I’m not coding.",
  },
  {
    key: "music",
    name: "Music note",
    stars: [
      { x: 292, y: 388 },
      { x: 334, y: 356 },
      { x: 378, y: 378 },
      { x: 336, y: 414 },
      { x: 378, y: 132 },
      { x: 452, y: 186 },
      { x: 440, y: 254 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [2, 4],
      [4, 5],
      [5, 6],
    ],
    fact: "A music note. I listen to music while I work, and I played the guitar for a little while.",
  },
  {
    key: "lantern",
    name: "Lumi’s lantern",
    stars: [
      { x: 400, y: 66 },
      { x: 362, y: 108 },
      { x: 438, y: 108 },
      { x: 334, y: 152 },
      { x: 466, y: 152 },
      { x: 352, y: 336 },
      { x: 448, y: 336 },
      { x: 400, y: 384 },
    ],
    lines: [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 4],
      [3, 4],
      [3, 5],
      [4, 6],
      [5, 6],
      [5, 7],
      [6, 7],
    ],
    glow: { x: 400, y: 246 },
    fact: "Lumi’s lantern. They keep me company on late-night builds.",
  },
];

// Free drawing: a loose field of stars, no right answer
export const freeStars: Star[] = [
  { x: 92, y: 88 },
  { x: 186, y: 150 },
  { x: 142, y: 262 },
  { x: 228, y: 352 },
  { x: 96, y: 420 },
  { x: 300, y: 72 },
  { x: 330, y: 214 },
  { x: 362, y: 430 },
  { x: 430, y: 140 },
  { x: 452, y: 300 },
  { x: 520, y: 62 },
  { x: 548, y: 222 },
  { x: 506, y: 404 },
  { x: 622, y: 136 },
  { x: 640, y: 318 },
  { x: 700, y: 60 },
  { x: 724, y: 214 },
  { x: 712, y: 430 },
  { x: 600, y: 470 },
  { x: 252, y: 470 },
];

// Dim background stars. A tiny seeded generator, run once when the module loads, keeps them identical everywhere.
function backdrop(count: number) {
  let seed = 7;
  const next = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: count }, () => ({
    x: Math.round(next() * 800),
    y: Math.round(next() * 500),
    r: 0.6 + next() * 1.1,
    i: Math.round(next() * 12),
  }));
}

export const backgroundStars = backdrop(80);
