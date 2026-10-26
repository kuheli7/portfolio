// What the mini VoiceNav does with a phrase, worked out without touching the page. VoiceDemo carries each answer out.
// Keeping the decision apart from the page means every phrase can be checked from a plain script.
//
// Order: this site's own commands, then "move/go/up/down" style variations of scrolling and stepping, then the
// extension's real parser, then a bare place name, and last a "did you mean" guess. The parser itself is untouched.

import { normalize, parse, type Command } from "./parser.js";

export { bestAlternative, normalize, splitChain, stripWake, toEnglish } from "./parser.js";

export type Route =
  | { kind: "theme"; to: "dark" | "light" | "toggle" }
  | { kind: "page"; href: string; label: string }
  | { kind: "section"; id: string; label: string }
  | { kind: "case"; slug: string; name: string }
  | { kind: "profile"; which: "github" | "linkedin" }
  | { kind: "say"; text: string }
  | { kind: "resume" | "help" | "close" }
  // "a bit more", "again": scroll the way the last scroll went
  | { kind: "again"; amount?: number }
  // "next project", "previous section", "next page" (the story book)
  | { kind: "step"; what: "section" | "project" | "page" | "either"; dir: 1 | -1 }
  | { kind: "pageNo"; n: number }
  // "find MindCare", "scroll to CostLens": bring it into view without clicking or leaving the page
  | { kind: "find"; text: string }
  // "MindCare code", "live demo of Sales Pulse"
  | { kind: "cardLink"; of: string; what: "code" | "live" }
  | { kind: "click"; text: string }
  | { kind: "cmd"; cmd: Command }
  | { kind: "unknown"; suggestions: string[] };

// Home page sections in the order they appear, with the words people use for them. The text has already been
// through bare(), so "my", "her", "the" and "section" are gone.
const SECTIONS: [RegExp, string, string][] = [
  [/^(more( projects)?|smaller builds?|other projects)$/, "more", "More projects"],
  [/^(work|projects?|portfolio|selected work|featured( work)?|case stud(y|ies))$/, "work", "Selected work"],
  [/^(design( work)?|designs|websites|cafes?|café sites|gallery|design gallery)$/, "design", "Design work"],
  [/^((just )?for fun|fun|lumi|lumis? night shift|night shift)$/, "fun", "Just for fun"],
  [
    /^(about( me| you| kuheli| yourself)?|who (is|are) (kuheli|she|you)|(tell me|more) about( kuheli| yourself| you)?|what (does|do) (she|you) do|introduce yourself|bio|background|education|experience|skills|tools|awards|certifications|leadership|internships?|timeline)$/,
    "about",
    "About",
  ],
  [
    /^(contact( me| kuheli| info| details)?|email( address| me)?|copy email( address)?|send (me )?(an )?email|mail( me)?|get in touch|hire( me)?|reach( out| me)?|socials?|how (can|do) i (contact|reach|email|get in touch with)( you| kuheli)?)$/,
    "contact",
    "Contact",
  ],
  [/^(top|intro|start|hero)$/, "top", "the top"],
];

export const SECTION_LABEL: Record<string, string> = {
  work: "Selected work",
  more: "More projects",
  design: "Design work",
  fun: "Just for fun",
  about: "About",
  contact: "Contact",
};
export const SECTION_ORDER = ["work", "more", "design", "fun", "about", "contact"];

const CASE_STUDIES: [RegExp, string, string][] = [
  [/^(cost ?lens|costless)$/, "costlens", "CostLens"],
  [/^(voice ?nav|voice navigation|voicenet)$/, "voicenav", "VoiceNav"],
  [/^(credit ?lens|credit less)$/, "creditlens", "CreditLens"],
  [/^(policy ?tree( editor)?|tree editor)$/, "policy-tree-editor", "Policy Tree Editor"],
];

// "open the MindCare section" and "go to my education" boil down to the name on its own
export const bare = (text: string) =>
  text
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/\b(the|my|your|her|their|section|part|area|bit|page)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function lookupPlace(text: string): Route | null {
  const t = bare(text);
  for (const [re, id, label] of SECTIONS) if (re.test(t)) return { kind: "section", id, label };
  for (const [re, slug, name] of CASE_STUDIES) if (re.test(t)) return { kind: "case", slug, name };
  return null;
}

// Names are compared with "&" spelled out and punctuation gone, so "brew and bounce" finds "Brew & Bounce"
export const nameOf = (text: string) =>
  text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// ---------------------------------------------------------------------------------------------------------------
// Fixed replies and site commands

const SAY: [RegExp, string][] = [
  [/^(hi|hello|hey|hey there|hi there|hola|namaste|yo|good (morning|afternoon|evening))$/, "Hi! What should I do?"],
  [
    /^(thanks|thank you|thanks a lot|thank you so much|thx|cheers|great|nice|cool|awesome|amazing|perfect|wow|ok|okay|good|well done|love it|that'?s (great|cool|nice))$/,
    "Glad that worked. What next?",
  ],
  [
    /^(who|what) are you$|^what is this( thing)?$|^what'?s this$|^what (is|does) (voice ?nav|this do)$|^how does this work$/,
    "I’m a mini VoiceNav. I steer this site: scrolling, jumping to a project, switching the theme. Say “help” to see more.",
  ],
  [
    /^zoom( in| out)?$|^(make|set) (the )?(text|font|page|letters|words) (bigger|larger|smaller|a bit bigger)$|^(increase|decrease|reduce) (the )?(text|font|zoom)( size)?$|^(bigger|smaller|larger) text$|^(text|font) size$/,
    "Zoom is a browser setting: press Ctrl (or ⌘) with + or −. The full extension can do it by voice.",
  ],
  [
    /^(volume (up|down)|turn (the )?(volume|sound|audio) (up|down|on|off)|louder|quieter|(sound|audio|sounds) (on|off))$/,
    "This site only makes a sound in the star game, and that has its own switch. The full extension controls volume on any site.",
  ],
  [/^(scroll |go |move )?(left|right)$/, "This site doesn’t scroll sideways."],
];

const THEME: [RegExp, "dark" | "light" | "toggle"][] = [
  [
    /^((switch|change|go|turn) (it )?to |turn on |use |go |make it |set (it )?to )?(dark|night)( mode| theme)?$|^lights? off$|^(it'?s )?too bright$|^(it )?hurts my eyes$/,
    "dark",
  ],
  [
    /^((switch|change|go|turn) (it )?to |turn on |use |go |make it |set (it )?to )?(light|day|bright)( mode| theme)?$|^lights? on$|^(it'?s )?too dark$/,
    "light",
  ],
  [/^(switch|change|toggle|flip) (the )?(theme|mode|colou?rs|dark mode|light mode)$/, "toggle"],
];

const PAGES: [RegExp, string, string][] = [
  [/^((go|take me|back)( to)? )?(the )?(home( ?page)?|main page|front page|landing page)$|^go back home$/, "/", "the homepage"],
  [
    /^(?:(?:open|go to|take me to|show me|let'?s|lets|i want to|i wanna|can i|could i) )?(?:play )?(?:a |the |some |with the |with )?(?:play|games?|constellations?|star games?|star sky|stars|play page)$|^join the stars$|^make a constellation$/,
    "/play",
    "Play",
  ],
  [
    /^(open |go to |take me to |show me |read |tell me )?(the |my |your |her |their |life )?(story|story ?book|picture book|journey)$/,
    "/story",
    "the story",
  ],
];

// ---------------------------------------------------------------------------------------------------------------
// Scrolling, however it's said

const SMALL = new Set(["little", "bit", "slightly", "slight", "tiny", "small", "touch", "notch", "abit", "lil"]);
const BIG = new Set(["lot", "lots", "much", "far", "long", "big", "huge"]);
const MOVE = new Set([
  "scroll",
  "move",
  "go",
  "slide",
  "head",
  "travel",
  "drag",
  "take",
  "bring",
  "get",
  "jump",
  "skip",
  "pull",
  "push",
  "nudge",
  "swipe",
]);
const FILLER = new Set([
  "a",
  "an",
  "the",
  "by",
  "to",
  "just",
  "me",
  "it",
  "us",
  "of",
  "some",
  "more",
  "again",
  "once",
  "twice",
  "thrice",
  "time",
  "times",
  "page",
  "pages",
  "screen",
  "screens",
  "further",
  "farther",
  "ahead",
  "on",
  "along",
  "back",
  "half",
  "one",
  "two",
  "three",
  "four",
  "five",
]);
const COUNTS: Record<string, number> = { twice: 2, thrice: 3, two: 2, three: 3, four: 4, five: 5 };

const EDGE_WORDS = new Set([
  ...MOVE,
  "all",
  "way",
  "right",
  "straight",
  "very",
  "to",
  "at",
  "of",
  "this",
  "page",
  "site",
  "website",
  "screen",
  "homepage",
  "again",
  "the",
  "back",
  "up",
  "down",
  "from",
  "me",
]);
const TOP = new Set(["top", "start", "beginning"]);
const BOTTOM = new Set(["bottom", "end", "footer"]);

// "move down a bit", "go a little up", "up", "scroll up twice", "half a page down", "a bit more", "all the way down"
function motion(t: string): Route | null {
  const words = t.split(" ");

  // top or bottom
  if (words.every((w) => EDGE_WORDS.has(w) || TOP.has(w) || BOTTOM.has(w))) {
    const top = words.some((w) => TOP.has(w));
    const bottom = words.some((w) => BOTTOM.has(w));
    const allTheWay = words.includes("all") && words.includes("way");
    if (top !== bottom) return { kind: "cmd", cmd: { type: "scrollEdge", to: top ? "top" : "bottom" } };
    if (!top && !bottom && allTheWay) {
      const up = words.includes("up");
      if (up !== words.includes("down")) return { kind: "cmd", cmd: { type: "scrollEdge", to: up ? "top" : "bottom" } };
    }
  }

  // a nudge up or down
  const known = (w: string) =>
    MOVE.has(w) || FILLER.has(w) || SMALL.has(w) || BIG.has(w) || /^(up|down)(wards?)?$/.test(w) || /^\d+$/.test(w);
  if (!words.every(known)) return null;
  const up = words.some((w) => /^up(wards?)?$/.test(w));
  const down = words.some((w) => /^down(wards?)?$/.test(w));
  if (up && down) return null;

  const small = words.some((w) => SMALL.has(w));
  const big = words.some((w) => BIG.has(w));
  let times = 1;
  for (const w of words) {
    if (/^\d+$/.test(w)) times = Math.min(5, Math.max(1, Number(w)));
    else if (w in COUNTS && words.includes("times") || w === "twice" || w === "thrice") times = COUNTS[w] ?? times;
  }
  const amount = (small ? 0.3 : big ? 1.5 : words.includes("half") ? 0.5 : 0.8) * times;

  if (up || down) return { kind: "cmd", cmd: { type: "scroll", dir: up ? "up" : "down", amount } };

  // no direction: "a bit more", "again", "one more time", or just "scroll"
  if (words.length === 1 && words[0] === "more") return null; // on its own, "more" is the More projects section
  if (words.includes("more") || words.includes("again")) return { kind: "again", amount: small ? 0.3 : undefined };
  if (words.includes("scroll")) return { kind: "cmd", cmd: { type: "scroll", dir: "down", amount } };
  return null;
}

// "next project", "previous section", "next page", "turn the page"
const STEP =
  /^(?:(?:go|move|jump|skip|take me|show me|show|bring me|scroll|head|get)(?: on)?(?: to)? )?(?:the )?(next|following|previous|prev)(?: (one|section|project|card|part|page|chapter|thing))?$/;
const TURN = /^(?:turn|flip)(?: to)?(?: the)? (next |previous )?page$|^continue reading$/;
const PAGE_NO = /^(?:go to |open |turn to |show |jump to )?(?:the )?page (\d+|one|two|three|four|five|six|seven)$/;
const NUMBER: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7 };

function stepping(t: string): Route | null {
  const turn = t.match(TURN);
  if (turn) return { kind: "step", what: "page", dir: turn[1]?.startsWith("previous") ? -1 : 1 };
  const no = t.match(PAGE_NO);
  if (no) return { kind: "pageNo", n: NUMBER[no[1]] ?? Number(no[1]) };
  const m = t.match(STEP);
  if (!m) return null;
  const dir = m[1] === "next" || m[1] === "following" ? 1 : -1;
  const what = m[2];
  if (what === "section" || what === "part") return { kind: "step", what: "section", dir };
  if (what === "project" || what === "card") return { kind: "step", what: "project", dir };
  if (what === "page" || what === "chapter") return { kind: "step", what: "page", dir };
  return { kind: "step", what: "either", dir };
}

// ---------------------------------------------------------------------------------------------------------------
// Finding and opening things by name

const LEADING_VERB = /^(?:(?:open up|open|show me|show|view|click|see|go to|take me to|visit|press|tap|launch) )+/;
const DETERMINERS = /^(?:(?:the|my|her|their|your|his|this|that|its|a) )+/;
const LINK_WORDS = "code|source(?: code)?|git ?hub|repo(?:sitory)?|live(?: demo| site| version| link)?|demo|website|deployed(?: site)?";
const LINK_OF = new RegExp(`^(${LINK_WORDS}) (?:for|of|on|from|in) (.+)$`);
const LINK_POSS = new RegExp(`^(.+?)(?:'s| s)? (${LINK_WORDS})$`);
const FIND = /^(?:scroll (?:down |up )?to|jump to|find|locate|look for|where is|where s|where are|where can i find|get me to|bring me to) (.+)$/;
const PLACE_VERB =
  /^(?:please )?(?:(?:go|head|jump|navigate|move|scroll)(?: up| down)? to|take me to|take me|bring me to|bring up|show me|show|open up|open|see|let me see|i want to see|i would like to see|display|visit|view|check out|get to) /;

const subjectOf = (raw: string) => {
  let s = raw.replace(LEADING_VERB, "").replace(DETERMINERS, "").trim();
  s = s.replace(/\b(project|card|section)$/, "").trim();
  return /^(code|source|live|demo|repo|github|it|this|that|one|link|button|open|show|view|click|go|take)$/.test(s) || s.length < 2 ? "" : s;
};

function cardLink(t: string): Route | null {
  const rest = t.replace(LEADING_VERB, "").replace(DETERMINERS, "");
  const make = (what: string, of: string): Route | null => {
    const subject = subjectOf(of);
    if (!subject) return null;
    return { kind: "cardLink", of: subject, what: /^(code|source|git|repo)/.test(what) ? "code" : "live" };
  };
  const a = rest.match(LINK_OF);
  if (a) return make(a[1], a[2]);
  const b = rest.match(LINK_POSS);
  if (b) return make(b[2], b[1]);
  return null;
}

// ---------------------------------------------------------------------------------------------------------------
// "Did you mean": a guess to offer, never to run

export const CANON = [
  "scroll down",
  "scroll up a little",
  "go to the top",
  "go to the bottom",
  "keep scrolling",
  "next project",
  "next section",
  "open CostLens",
  "open VoiceNav",
  "open CreditLens",
  "open Policy Tree Editor",
  "show me the work",
  "more projects",
  "design work",
  "just for fun",
  "about",
  "contact",
  "open my story",
  "play a game",
  "dark mode",
  "light mode",
  "go back",
  "download resume",
  "open GitHub",
  "open LinkedIn",
  "help",
  "open MindCare",
  "open Sales Pulse",
  "open HubSpot Deals ETL",
  "open DSA Revision Tracker",
  "open Gulab & Co",
  "open Sip & Sage",
  "open Brew & Bounce",
  "open Lumi’s Night Shift",
];

const NOISE = new Set(["the", "a", "an", "to", "me", "my", "her", "please", "of", "and", "can", "you"]);

function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const keep = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = keep;
    }
  }
  return row[b.length];
}

function similarity(said: string, command: string) {
  const a = nameOf(said).split(" ").filter((w) => w && !NOISE.has(w));
  const b = nameOf(command).split(" ").filter((w) => w && !NOISE.has(w));
  if (!a.length || !b.length) return 0;
  // Words that are close enough count as the same word, so "scrol dwn" still matches "scroll down"
  const close = (x: string, y: string) => distance(x, y) <= (Math.max(x.length, y.length) >= 8 ? 2 : x.length >= 4 && y.length >= 4 ? 1 : 0);
  const left = [...b];
  let hits = 0;
  for (const w of a) {
    const at = left.findIndex((x) => close(w, x));
    if (at >= 0) {
      hits++;
      left.splice(at, 1);
    }
  }
  const words = (2 * hits) / (a.length + b.length);
  // And with the spaces taken out, so "mind care" lines up with "MindCare"
  const x = a.join("");
  const y = b.join("");
  const joined = 1 - distance(x, y) / Math.max(x.length, y.length);
  return Math.max(words, joined);
}

// Up to three phrases that look like what was said. `names` are things on the page, offered as "open <name>".
export function suggest(said: string, names: string[] = []): string[] {
  const seen = new Set<string>();
  const pool = [...CANON, ...names.map((name) => `open ${name}`)].filter((phrase) => {
    const key = nameOf(phrase);
    return !seen.has(key) && seen.add(key);
  });
  return pool
    .map((phrase) => ({ phrase, score: similarity(said, phrase) }))
    .filter((c) => c.score >= 0.6)
    .sort((p, q) => q.score - p.score)
    .slice(0, 3)
    .map((c) => c.phrase);
}

// ---------------------------------------------------------------------------------------------------------------

// Words people put in front of a request that mean nothing to the site
const LEAD = /^(?:(?:hey|ok|okay|so|um|uh|now|kindly|can you|could you|would you|will you|can u|please|i want to|i wanna|i would like to|i'?d like to|i need to|let me|let us|let'?s|lets|you can|go ahead and|try to) )+/;
const TRAIL = / (?:for me|right now|now|please|thanks|thank you|okay|ok)$/;

export function route(step: string): Route {
  const t = normalize(step).replace(LEAD, "").replace(TRAIL, "").trim();

  for (const [re, text] of SAY) if (re.test(t)) return { kind: "say", text };
  for (const [re, to] of THEME) if (re.test(t)) return { kind: "theme", to };
  for (const [re, href, label] of PAGES) if (re.test(t)) return { kind: "page", href, label };
  if (/\b(resume|résumé|cv)\b/.test(t) && !/scroll/.test(t)) return { kind: "resume" };
  if (/^(help|what can i (say|do)|commands)$/.test(t)) return { kind: "help" };
  if (/^(close|close (this|the panel|voice ?nav)|bye|goodbye|exit|dismiss|that'?s all)$/.test(t)) return { kind: "close" };

  const profile = t.match(/^(?:(?:open|go to|show|show me|take me to|visit|view|see) )?(?:the |my |her |your |their )?(git ?hub|linked ?in)(?: profile| page| account| link)?$/);
  if (profile) return { kind: "profile", which: profile[1].startsWith("git") ? "github" : "linkedin" };
  if (/^(start reading|begin reading|start the (story|book)|open the book)$/.test(t)) return { kind: "click", text: "start reading" };

  const stepped = stepping(t);
  if (stepped) return stepped;
  const moved = motion(t);
  if (moved) return moved;
  const link = cardLink(t);
  if (link) return link;
  const find = t.match(FIND);
  if (find) {
    const text = nameOf(find[1].replace(DETERMINERS, "")).replace(/\b(project|card|section)$/, "").trim();
    if (text) return { kind: "find", text };
  }

  const cmd = parse(t);
  if (cmd) {
    // "show me skills" parses as a click on the word, but it is really a place on this site
    const place = cmd.type === "clickText" && cmd.text ? lookupPlace(cmd.text) : null;
    return place ?? { kind: "cmd", cmd };
  }

  const place = lookupPlace(t) ?? lookupPlace(t.replace(PLACE_VERB, ""));
  if (place) return place;
  return { kind: "unknown", suggestions: suggest(t) };
}
