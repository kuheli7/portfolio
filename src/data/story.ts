// The /story storybook, one entry per page. Keep it to things that are true and public.

export const someday = [
  { wish: "blue, blue oceans", place: "the Andamans" },
  { wish: "quiet, quiet mountains", place: "Ladakh" },
  { wish: "cherry blossoms", place: "Kyoto" },
];

export type Doodle = "chart" | "pin" | "brackets" | "lantern" | "brush" | "plane";

export type StoryLink = { label: string; href: string; note: string };

export type StoryPage = {
  id: string;
  kicker: string;
  title: string;
  body: string[];
  links?: StoryLink[];
  doodle: Doodle;
};

export const storyPages: StoryPage[] = [
  {
    id: "economics",
    kicker: "Chapter 1",
    title: "It started with economics",
    body: [
      "I studied Economics at Visva-Bharati University in West Bengal: a B.A. from 2020 to 2023, where I finished 3rd in my department, and then an M.A. from 2023 to 2025, where I finished 2nd.",
      "The part I kept is a habit of checking that the numbers actually add up. It still shows up in almost everything I build.",
    ],
    doodle: "chart",
  },
  {
    id: "bengaluru",
    kicker: "Chapter 2",
    title: "Then, Bengaluru",
    body: [
      "In 2025 I moved to Bengaluru for an MCA at CHRIST University. My CGPA is 9.2 so far.",
      "Why I switched is a longer story. I’ll tell it if you ask.",
    ],
    doodle: "pin",
  },
  {
    id: "building",
    kicker: "Chapter 3",
    title: "Building real things",
    body: [
      "Since then I’ve been building things that have to be right, not just look right.",
      "Along the way I won 2nd place in the UI/UX Design Competition at Revelations and 3rd in the Coding and Debugging Competition at SHELLS 2026. Since October 2026 I’ve also been a Back End Developer Intern at Springer Capital.",
    ],
    links: [
      { label: "CostLens", href: "/projects/costlens", note: "explains an AWS bill down to the cent, on synthetic billing data" },
      { label: "VoiceNav", href: "/projects/voicenav", note: "browse the web by voice, fully local on your own computer" },
      { label: "CreditLens", href: "/projects/creditlens", note: "a credit score that shows its reasons" },
      { label: "Policy Tree Editor", href: "/projects/policy-tree-editor", note: "compliance rules as a drag-and-drop tree" },
    ],
    doodle: "brackets",
  },
  {
    id: "lumi",
    kicker: "Chapter 4",
    title: "Then came Lumi",
    body: [
      "Lumi is a baby moth who starts a new hobby every night and never finishes any. Lumi’s personality comes from my pile of half-finished hobbies: beads, art, a guitar I played for a little while.",
      "I built Lumi’s Night Shift for the haX.baby hackathon in October 2026. They’ve kept me company on late-night builds ever since.",
    ],
    links: [{ label: "Lumi’s Night Shift", href: "https://kuheli7.github.io/lumi-baby-moth/", note: "say hi to Lumi" }],
    doodle: "lantern",
  },
  {
    id: "off-the-clock",
    kicker: "Chapter 5",
    title: "Off the clock",
    body: [
      "When I’m not coding, I draw and listen to music.",
      "Someday I’d like to see blue, blue oceans in the Andamans; quiet, quiet mountains in Ladakh; and cherry blossoms in Kyoto.",
      "Mango or grapes? Depends on the mood.",
    ],
    doodle: "brush",
  },
  {
    id: "next",
    kicker: "Chapter 6",
    title: "What’s next",
    body: [
      "My MCA wraps up in 2027, and I’m looking for full-stack and SDE roles.",
      "If you’d like the longer story, or just want to talk about something I built, my inbox is open.",
    ],
    doodle: "plane",
  },
];
