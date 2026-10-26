"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { profile } from "@/data/profile";
import type { Command } from "@/lib/voicenav/parser";
import type { Route } from "@/lib/voicenav/site";
import { CloseIcon, MicIcon } from "./icons";

// A small, browser-only version of VoiceNav for this site. It runs the real extension's command parser
// (copied into src/lib/voicenav), plus a site layer that knows this site's sections, projects and links,
// then acts on the page. Anything the full extension needs a browser extension or the local AI model for
// gets a short note instead.

export const OPEN_EVENT = "voicenav:open";

type Site = typeof import("@/lib/voicenav/site");
let sitePromise: Promise<Site> | undefined;
const loadSite = () => (sitePromise ??= import("@/lib/voicenav/site"));

type Alternative = { transcript: string };
type RecognitionResult = ArrayLike<Alternative> & { isFinal: boolean };
type Recognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: { resultIndex: number; results: ArrayLike<RecognitionResult> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function getRecognition() {
  const w = window as unknown as {
    SpeechRecognition?: new () => Recognition;
    webkitSpeechRecognition?: new () => Recognition;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

const NO_VOICE =
  "Voice isn’t available in this browser. Try Chrome or Edge, or type a command below. It works the same way.";
const NEEDS_EXTENSION =
  "That one needs the full extension, which also handles tabs, searching, forms and reading pages aloud. Here I can scroll, jump around the site, open projects and switch the theme.";
const LOOSER =
  "The full extension works out looser wording with a small AI model that runs on your computer.";

const EXAMPLES = [
  "scroll down a little",
  "next project",
  "open CostLens",
  "MindCare code",
  "take me to education",
  "keep scrolling",
  "light mode",
  "neeche scroll karo",
  "help",
];

// What to offer when nothing matches and there is no near miss
const STARTERS = ["scroll down a little", "open CostLens", "help"];

const HELP = [
  "“scroll down”, “up a little”, “half a page down”, “once more”",
  "“go to the top”, “next project”, “previous section”",
  "“open CostLens”, “find MindCare”, “MindCare code”",
  "“take me to education”, “contact”, “open GitHub”",
  "“keep scrolling”, then “faster” or “stop”",
  "“dark mode”, “pause the video”, “go back”, “close”",
  "“open my story”, “next page”, “play a game”",
  "Two at once: “scroll down and then open VoiceNav”. Hinglish too: “neeche scroll karo”",
];

type SiteAction = Extract<Route, { kind: "theme" | "page" | "resume" | "help" | "close" }>;

const SPEEDS: Record<string, number> = { slow: 70, medium: 150, fast: 320 };

type Link = { label: string; href: string };
type Reply = {
  text: string;
  resume?: boolean;
  help?: boolean;
  closed?: boolean;
  // links shown in the panel; a voice command can't open a new tab by itself, but a tap can
  links?: Link[];
  // phrases to try instead, shown as buttons
  suggest?: string[];
  // nothing matched: the chain stops here
  unknown?: boolean;
};
type Auto = { dir: number; speed: number; pos: number; last: number; raf: number };

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const onHome = () => window.location.pathname === "/";

function setTheme(to: "dark" | "light" | "toggle") {
  const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
  const next = to === "toggle" ? (current === "light" ? "dark" : "light") : to;
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {
    // storage can be blocked; the theme still changes for this visit
  }
  return { next, same: next === current };
}

function flash(el: HTMLElement) {
  el.classList.remove("voice-flash");
  void el.offsetWidth;
  el.classList.add("voice-flash");
  window.setTimeout(() => el.classList.remove("voice-flash"), 1600);
}

export function VoiceDemo() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [voice, setVoice] = useState(true);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [reply, setReply] = useState<Reply | null>(null);
  const [input, setInput] = useState("");
  const [autoOn, setAutoOn] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const recRef = useRef<Recognition | null>(null);
  const autoRef = useRef<Auto | null>(null);
  // "again", "a bit more": whatever scrolled or stepped last, ready to be done once more
  const shownRef = useRef<HTMLElement | null>(null);
  const repeatRef = useRef<((amount?: number) => Reply) | null>(null);

  function stopAuto() {
    if (autoRef.current) cancelAnimationFrame(autoRef.current.raf);
    autoRef.current = null;
    setAutoOn(false);
  }

  function startAuto(dir: number, speed: number) {
    stopAuto();
    const state: Auto = { dir, speed, pos: window.scrollY, last: 0, raf: 0 };
    const tick = (now: number) => {
      if (state.last) {
        state.pos += (state.dir * state.speed * (now - state.last)) / 1000;
        window.scrollTo({ top: state.pos, behavior: "instant" });
      }
      state.last = now;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if ((state.dir > 0 && state.pos >= max) || (state.dir < 0 && state.pos <= 0)) {
        stopAuto();
        setReply({ text: state.dir > 0 ? "That’s the bottom of the page." : "Back at the top." });
        return;
      }
      state.raf = requestAnimationFrame(tick);
    };
    state.raf = requestAnimationFrame(tick);
    autoRef.current = state;
    setAutoOn(true);
  }

  // Scrolling by hand takes over from auto-scroll
  useEffect(() => {
    if (!autoOn) return;
    const takeOver = () => stopAuto();
    window.addEventListener("wheel", takeOver, { passive: true });
    window.addEventListener("touchstart", takeOver, { passive: true });
    return () => {
      window.removeEventListener("wheel", takeOver);
      window.removeEventListener("touchstart", takeOver);
    };
  }, [autoOn]);

  // Opened from any "Try it" button on the site
  useEffect(() => {
    const show = () => {
      openerRef.current = document.activeElement as HTMLElement | null;
      setVoice(Boolean(getRecognition()));
      setOpen(true);
      void loadSite();
      window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 0);
    };
    window.addEventListener(OPEN_EVENT, show);
    return () => window.removeEventListener(OPEN_EVENT, show);
  }, []);

  // Stop the microphone and any scrolling if the panel goes away
  useEffect(
    () => () => {
      recRef.current?.abort();
      if (autoRef.current) cancelAnimationFrame(autoRef.current.raf);
    },
    [],
  );

  function close() {
    recRef.current?.abort();
    recRef.current = null;
    setListening(false);
    stopAuto();
    setOpen(false);
    const opener = openerRef.current;
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  }

  function goToSection(id: string, label: string): string {
    if (!onHome()) {
      router.push(id === "top" ? "/" : `/#${id}`);
      return `Heading to ${label} on the homepage.`;
    }
    if (id === "top") {
      window.scrollTo({ top: 0 });
      return "Up to the top.";
    }
    const el = document.getElementById(id);
    if (!el) return `I couldn’t find ${label} here.`;
    el.scrollIntoView({ block: "start" });
    return `Here’s ${label}.`;
  }

  // The email link goes with the Contact section, so there is something to tap when the page can't copy it
  function sectionReply(id: string, label: string): Reply {
    const text = goToSection(id, label);
    return id === "contact" ? { text, links: [{ label: profile.email, href: `mailto:${profile.email}` }] } : { text };
  }

  function openCase(slug: string, name: string): string {
    router.push(`/projects/${slug}`);
    return `Opening the ${name} case study.`;
  }

  // A home section or a case study, named on its own ("education") or after "open" / "go to"
  function goToPlace(s: Site, text: string): Reply | null {
    const place = s.lookupPlace(text);
    if (place?.kind === "section") return sectionReply(place.id, place.label);
    if (place?.kind === "case") return { text: openCase(place.slug, place.name) };
    return null;
  }

  // ---- looking at the page ----

  function visibleNodes(selector: string) {
    const panel = panelRef.current;
    return [...document.querySelectorAll<HTMLElement>(selector)].filter(
      (el) => !panel?.contains(el) && el.getClientRects().length > 0,
    );
  }

  const labelOf = (el: HTMLElement) => (el.getAttribute("aria-label") ?? el.textContent ?? "").replace(/\s+/g, " ").trim();
  const isHeading = (el: HTMLElement) => /^H[23]$/.test(el.tagName);

  // Headings, links and buttons by name: exact first, then headings (so "MindCare" finds the card, not its
  // GitHub link), then anything. With the spaces taken out, "mind care" still finds "MindCare".
  function findTarget(s: Site, raw: string, headingsOnly = false): HTMLElement | null {
    const text = s.nameOf(s.bare(raw));
    if (text.length < 2) return null;
    const words = new RegExp(`\\b${text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
    const squashed = text.replace(/ /g, "");
    const nodes = visibleNodes(headingsOnly ? "h2, h3" : "h2, h3, a, button, summary");
    const name = (el: HTMLElement) => s.nameOf(labelOf(el));
    return (
      nodes.find((el) => name(el) === text) ??
      nodes.find((el) => isHeading(el) && words.test(name(el))) ??
      nodes.find((el) => words.test(name(el))) ??
      (squashed.length >= 4 ? nodes.find((el) => isHeading(el) && name(el).replace(/ /g, "").includes(squashed)) : undefined) ??
      null
    );
  }

  // Off the homepage the thing may live there, so go and look
  async function findOnHome(s: Site, text: string, headingsOnly = false) {
    let el = findTarget(s, text, headingsOnly);
    if (el || onHome()) return el;
    router.push("/");
    for (let i = 0; i < 30 && !el; i++) {
      await wait(100);
      if (onHome()) el = findTarget(s, text, headingsOnly);
    }
    return el;
  }

  // Bring it into view and flash it. Headings stand for their whole card.
  function reveal(el: HTMLElement) {
    const card = isHeading(el) ? (el.closest<HTMLElement>("article, li") ?? el) : el;
    card.scrollIntoView({ block: "center" });
    flash(card);
    return card;
  }

  function pageNames() {
    const seen = new Set<string>();
    return visibleNodes("h2, h3")
      .map(labelOf)
      .filter((n) => n.length >= 3 && n.length <= 40 && !seen.has(n.toLowerCase()) && seen.add(n.toLowerCase()));
  }

  // Nothing matched. Offer near misses, or a few things that do work, and never run a guess on its own.
  function lost(s: Site, raw: string, searched: boolean): Reply {
    const guesses = s.suggest(raw, pageNames());
    if (guesses.length)
      return {
        text: searched ? `I couldn’t find “${raw}” here. Did you mean:` : "Not sure about that one. Did you mean:",
        suggest: guesses,
        unknown: true,
      };
    return {
      text: searched
        ? `I couldn’t find “${raw}” on this page. Try one of these:`
        : "That’s outside my small demo vocabulary. Try one of these:",
      suggest: STARTERS,
      unknown: true,
    };
  }

  // "open X", "click X", "go to X": a place on the site, or something visible on the page
  async function clickText(s: Site, raw: string): Promise<Reply> {
    const text = s.bare(raw);
    if (!text) return { text: "What should I click? Try “open CostLens”." };
    const place = goToPlace(s, text);
    if (place) return place;
    const target = text.length < 3 ? null : await findOnHome(s, text);
    if (!target) return lost(s, raw, true);

    const label = labelOf(target);
    reveal(target);
    if (isHeading(target)) return { text: `Here’s ${label}.` };
    // A voice command has no tap behind it, so the browser blocks links that open elsewhere. Offer those as a tap.
    const href = target.getAttribute("href") ?? "";
    if (target.tagName === "A" && !href.startsWith("/") && !href.startsWith("#"))
      return { text: `Here’s “${label}”. Tap to open.`, links: [{ label, href }] };
    target.click();
    return { text: `Clicked “${label}”.` };
  }

  // "find MindCare", "scroll to the contact": bring it into view without clicking
  async function find(s: Site, text: string): Promise<Reply> {
    const place = s.lookupPlace(text);
    if (place?.kind === "section") return sectionReply(place.id, place.label);
    const el = await findOnHome(s, text);
    if (!el) return place?.kind === "case" ? { text: openCase(place.slug, place.name) } : lost(s, text, true);
    reveal(el);
    return { text: `Here’s ${labelOf(el)}.` };
  }

  // "MindCare code", "live demo of Sales Pulse": the link is shown to tap, since voice can't open a new tab
  async function cardLink(s: Site, of: string, what: "code" | "live"): Promise<Reply> {
    const heading = await findOnHome(s, of, true);
    const card = heading?.closest<HTMLElement>("article, li");
    if (!heading || !card) return lost(s, of, true);
    reveal(heading);
    const name = labelOf(heading);
    const links = [...card.querySelectorAll<HTMLAnchorElement>("a")];
    const pick =
      what === "code"
        ? links.find((a) => /^code\b/i.test(labelOf(a)) || /github\.com/.test(a.href))
        : links.find((a) => /^live\b/i.test(labelOf(a)));
    const noun = what === "code" ? "code" : "live demo";
    if (!pick) {
      return {
        text:
          what === "code"
            ? `I can’t see a code link on ${name}.`
            : `${name} doesn’t have a live demo link. Say “${name} code” for the code instead.`,
      };
    }
    return {
      text: `Here’s the ${noun} for ${name}. Tap to open.`,
      links: [{ label: `Open the ${noun} for ${name}`, href: pick.href }],
    };
  }

  // ---- moving about ----

  function scrollPage(sign: 1 | -1, amount: number): Reply {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (sign > 0 && window.scrollY >= max - 2) return { text: "That’s the bottom of the page." };
    if (sign < 0 && window.scrollY <= 2) return { text: "You’re already at the top." };
    window.scrollBy({ top: sign * amount * window.innerHeight, behavior: reducedMotion() ? "auto" : "smooth" });
    const how = amount <= 0.3 ? " a little" : amount >= 1.5 ? " a lot" : "";
    return { text: `Scrolling ${sign > 0 ? "down" : "up"}${how}.` };
  }

  // Home sections in page order, with the very top first
  function stepSection(s: Site, dir: 1 | -1): Reply {
    if (!onHome()) return { text: "I can step through sections on the homepage. Say “go home” first." };
    const marks = [
      { id: "top", label: "the top", top: 0 },
      ...s.SECTION_ORDER.flatMap((id) => {
        const el = document.getElementById(id);
        return el ? [{ id, label: s.SECTION_LABEL[id], top: el.getBoundingClientRect().top + window.scrollY }] : [];
      }),
    ];
    const here = window.scrollY + window.innerHeight * 0.35;
    let current = 0;
    marks.forEach((m, i) => {
      if (m.top <= here) current = i;
    });
    const to = marks[current + dir];
    if (!to) return { text: dir > 0 ? "That’s the last section." : "You’re at the top." };
    return sectionReply(to.id, to.label);
  }

  // Project cards in page order, measured from the middle of the screen
  function stepProject(dir: 1 | -1): Reply | null {
    const cards = visibleNodes(".project-card");
    const mid = window.innerHeight / 2;
    const offset = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.top + r.height / 2 - mid;
    };
    // Cards on one row sit at the same height, so carry on from the card shown last while it is still on screen.
    // Otherwise go by position; the header makes a card just shown sit a little below the middle.
    const last = shownRef.current;
    const onScreen = last && cards.includes(last) && Math.abs(offset(last)) < window.innerHeight / 2;
    const to = onScreen
      ? cards[cards.indexOf(last) + dir]
      : dir > 0
        ? cards.find((c) => offset(c) > 100)
        : [...cards].reverse().find((c) => offset(c) < -100);
    if (!to) return null;
    shownRef.current = to;
    const heading = to.querySelector<HTMLElement>("h2, h3");
    reveal(heading ?? to);
    return { text: `Here’s ${heading ? labelOf(heading) : "the next project"}.` };
  }

  function stepPage(dir: 1 | -1): Reply {
    const path = window.location.pathname;
    if (path === "/story") {
      const nav = document.querySelector('nav[aria-label="Story pages"]');
      if (!nav) {
        const start = visibleNodes("button").find((b) => /^start reading/i.test(labelOf(b)));
        if (dir > 0 && start) {
          start.click();
          return { text: "Opening the book." };
        }
        return { text: "You’re on the cover." };
      }
      const button = [...nav.querySelectorAll<HTMLElement>("button")].find((b) =>
        dir > 0 ? /^next\b/i.test(labelOf(b)) : /^back\b/i.test(labelOf(b)),
      );
      if (!button || button.getAttribute("aria-disabled"))
        return { text: dir > 0 ? "That’s the last page." : "This is the first page." };
      button.click();
      return { text: dir > 0 ? "Turning to the next page." : "Back one page." };
    }
    if (path.startsWith("/projects/")) {
      if (dir < 0) return { text: "Say “all projects” to go back to the list." };
      const next = [...document.querySelectorAll<HTMLElement>('nav[aria-label="More case studies"] a')].find((a) =>
        /^next/i.test(labelOf(a)),
      );
      if (!next) return { text: "That’s the last case study." };
      next.click();
      return { text: `Going to ${labelOf(next).replace(/^next:?\s*/i, "")}.` };
    }
    return scrollPage(dir, 0.8);
  }

  // A plain "next": a project while you're among the projects, a section elsewhere, a page in the story
  function stepAny(s: Site, dir: 1 | -1): Reply {
    const path = window.location.pathname;
    if (path === "/story" || path.startsWith("/projects/")) return stepPage(dir);
    if (path !== "/") return { text: "There’s nothing to step through on this page." };
    const mid = window.innerHeight / 2;
    const inProjects = ["work", "more"].some((id) => {
      const r = document.getElementById(id)?.getBoundingClientRect();
      return r !== undefined && r.top <= mid && r.bottom >= mid;
    });
    return (inProjects ? stepProject(dir) : null) ?? stepSection(s, dir);
  }

  function demoVideo(kind: "play" | "pause"): Reply {
    const mid = window.innerHeight / 2;
    const gap = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return Math.abs(r.top + r.height / 2 - mid);
    };
    const nearest = (label: string) => visibleNodes(`button[aria-label="${label}"]`).sort((a, b) => gap(a) - gap(b))[0];
    if (kind === "pause") {
      const button = nearest("Pause demo");
      if (!button || gap(button) > window.innerHeight) return { text: "Nothing’s moving right now." };
      button.click();
      return { text: "Paused the demo video." };
    }
    const button = nearest("Play demo");
    if (!button)
      return { text: nearest("Pause demo") ? "The demo videos are already playing." : "I don’t see a video on this page." };
    button.scrollIntoView({ block: "center" });
    button.click();
    return { text: "Playing the demo video." };
  }

  function runSite(action: SiteAction): Reply {
    switch (action.kind) {
      case "theme": {
        const { next, same } = setTheme(action.to);
        if (same) return { text: `It’s already ${next} mode.` };
        return { text: next === "dark" ? "Dark mode on. Lumi’s lantern is lit." : "Light mode on." };
      }
      case "page":
        if (window.location.pathname === action.href) {
          if (action.href === "/") window.scrollTo({ top: 0 });
          return { text: action.href === "/" ? "You’re on the homepage. Back to the top." : "You’re already here." };
        }
        router.push(action.href);
        return { text: `Going to ${action.label}.` };
      case "resume":
        return { text: "Here’s my resume. It opens in a new tab.", resume: true };
      case "help":
        return { text: "Here are some things you can say:", help: true };
      case "close":
        close();
        return { text: "", closed: true };
    }
  }

  async function runCommand(s: Site, cmd: Command): Promise<Reply> {
    const auto = autoRef.current;
    const behavior: ScrollBehavior = reducedMotion() ? "auto" : "smooth";
    switch (cmd.type) {
      case "scroll": {
        if (cmd.dir === "left" || cmd.dir === "right") return { text: "This site doesn’t scroll sideways." };
        const sign = cmd.dir === "up" ? -1 : 1;
        const amount = cmd.amount ?? 0.8;
        repeatRef.current = (again) => scrollPage(sign, again ?? amount);
        return scrollPage(sign, amount);
      }
      case "scrollEdge":
        window.scrollTo({ top: cmd.to === "top" ? 0 : document.documentElement.scrollHeight, behavior });
        return { text: cmd.to === "top" ? "Up to the top." : "All the way down." };
      case "autoScroll":
        startAuto(cmd.dir === "up" ? -1 : 1, SPEEDS[cmd.speed ?? "medium"] ?? SPEEDS.medium);
        return { text: "Scrolling on its own. Say “faster”, “slower” or “stop”, or scroll yourself to take over." };
      case "scrollSpeed":
        if (!auto) return { text: "Nothing’s scrolling right now. Try “keep scrolling” first." };
        auto.speed = Math.min(800, Math.max(30, auto.speed * (cmd.faster ? 1.6 : 0.6)));
        return { text: cmd.faster ? "A bit faster." : "A bit slower." };
      case "stopScroll":
      case "halt":
        if (!auto) return { text: "Nothing’s moving right now." };
        stopAuto();
        return { text: "Stopped." };
      case "media":
        // "stop" and "pause" parse as media commands; on this site they mean auto-scroll, or a demo video
        if (auto && (cmd.kind === "pause" || cmd.kind === "stop")) {
          stopAuto();
          return { text: "Stopped." };
        }
        if (cmd.kind === "pause" || cmd.kind === "stop") return demoVideo("pause");
        if (cmd.kind === "play") return demoVideo("play");
        return { text: "That one’s for sound. The full extension does it on sites like YouTube." };
      case "nav":
        if (cmd.to === "back") {
          window.history.back();
          return { text: "Going back." };
        }
        if (cmd.to === "forward") {
          window.history.forward();
          return { text: "Going forward." };
        }
        return { text: "I’ll skip reloading here, or this panel would close. The full extension can do it." };
      case "clickText":
        return clickText(s, String(cmd.text ?? ""));
      case "help":
        return runSite({ kind: "help" });
      default:
        return { text: NEEDS_EXTENSION };
    }
  }

  async function act(s: Site, step: string): Promise<Reply> {
    const r = s.route(step);
    switch (r.kind) {
      case "theme":
      case "page":
      case "resume":
      case "help":
      case "close":
        return runSite(r);
      case "say":
        return { text: r.text };
      case "profile":
        return r.which === "github"
          ? { text: "Here’s my GitHub. Tap to open.", links: [{ label: "Open GitHub", href: profile.github }] }
          : { text: "Here’s my LinkedIn. Tap to open.", links: [{ label: "Open LinkedIn", href: profile.linkedin }] };
      case "section":
        return sectionReply(r.id, r.label);
      case "case":
        return { text: openCase(r.slug, r.name) };
      case "again": {
        const again = repeatRef.current;
        return again ? again(r.amount) : { text: "There’s nothing to repeat yet. Try “scroll down” first." };
      }
      case "step": {
        const go = (): Reply =>
          r.what === "section"
            ? stepSection(s, r.dir)
            : r.what === "page"
              ? stepPage(r.dir)
              : r.what === "project"
                ? (stepProject(r.dir) ?? { text: r.dir > 0 ? "That was the last project." : "That’s the first project." })
                : stepAny(s, r.dir);
        repeatRef.current = go;
        return go();
      }
      case "pageNo": {
        if (window.location.pathname !== "/story") return { text: "Page numbers work in the story. Say “open my story”." };
        const dot = document.querySelector<HTMLElement>(`nav[aria-label="Story pages"] button[aria-label^="Page ${r.n}:"]`);
        if (!dot) return { text: `There’s no page ${r.n}.` };
        dot.click();
        return { text: `Page ${r.n}.` };
      }
      case "find":
        return find(s, r.text);
      case "cardLink":
        return cardLink(s, r.of, r.what);
      case "click":
        return clickText(s, r.text);
      case "cmd":
        return runCommand(s, r.cmd);
      case "unknown": {
        // a bare name, like "mindcare" or "mind care", is a heading to jump to
        const name = s.bare(s.normalize(step));
        const el = name.length >= 3 && name.split(" ").length <= 5 ? await findOnHome(s, name, true) : null;
        if (el) {
          reveal(el);
          return { text: `Here’s ${labelOf(el)}.` };
        }
        return lost(s, step, false);
      }
    }
  }

  async function run(said: string) {
    const raw = said.trim();
    if (!raw) return;
    setHeard(raw);
    const s = await loadSite();
    const afterWake = s.stripWake(raw);
    if (afterWake === "") {
      setReply({ text: "Hi! What should I do?" });
      return;
    }
    const english = s.toEnglish(afterWake ?? raw);
    const understood = (step: string) => s.route(step).kind !== "unknown";
    // The parser only chains its own commands, so "dark mode and then open CostLens" is split here
    const parts = english.split(/\s+(?:and then|and|then)\s+/);
    const steps = s.splitChain(english) ?? (parts.length > 1 && parts.every(understood) ? parts : [english]);
    const replies: Reply[] = [];
    for (let i = 0; i < steps.length; i++) {
      // give a page change or a smooth scroll time to land before the next step
      if (i > 0) await wait(900);
      const result = await act(s, steps[i]);
      if (result.closed) return;
      replies.push(result);
      setReply({
        text: replies.map((r) => r.text).join(" "),
        resume: replies.some((r) => r.resume),
        help: replies.some((r) => r.help),
        links: replies.flatMap((r) => r.links ?? []),
        suggest: result.suggest,
        unknown: result.unknown,
      });
      if (result.unknown) break;
    }
  }

  function listen() {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const Rec = getRecognition();
    if (!Rec) {
      setVoice(false);
      return;
    }
    const rec = new Rec();
    rec.lang = "en-IN";
    rec.interimResults = true;
    rec.maxAlternatives = 3;
    rec.continuous = false;
    rec.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const alts = Array.from({ length: result.length }, (_, k) => result[k].transcript);
          void loadSite().then((s) => run(s.bestAlternative(alts)));
        } else {
          interim += result[0].transcript;
        }
      }
      if (interim) setHeard(interim);
    };
    rec.onerror = (event) => {
      if (event.error === "aborted") return;
      if (event.error === "network" || event.error === "language-not-supported") setVoice(false);
      else if (event.error === "not-allowed" || event.error === "service-not-allowed")
        setReply({ text: "The microphone is turned off for this site. You can type a command below instead." });
      else if (event.error === "no-speech") setReply({ text: "I didn’t hear anything. Tap the mic and try again." });
      else if (event.error === "audio-capture")
        setReply({ text: "I couldn’t find a microphone. You can type a command below instead." });
      else setReply({ text: "Something went wrong with the microphone. Typing works too." });
    };
    rec.onend = () => {
      if (recRef.current === rec) recRef.current = null;
      setListening(false);
    };
    recRef.current = rec;
    setHeard("");
    setReply(null);
    try {
      rec.start();
      setListening(true);
    } catch {
      setVoice(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const text = input;
    setInput("");
    void run(text);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.stopPropagation();
      close();
    }
  }

  if (!open) return null;

  return (
    <section
      ref={panelRef}
      role="dialog"
      aria-labelledby="voice-panel-title"
      onKeyDown={onKeyDown}
      className="voice-panel fixed inset-x-3 bottom-3 z-50 max-h-[calc(100dvh-5.5rem)] overflow-y-auto rounded-3xl border border-line bg-surface p-4 shadow-2xl shadow-black/40 sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-[23rem]"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-display text-xs font-medium tracking-wider text-accent uppercase">Try VoiceNav</p>
          <h2 id="voice-panel-title" className="font-display text-xl font-semibold">
            Move around by voice
          </h2>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Close VoiceNav"
          className="grid size-9 shrink-0 place-items-center rounded-full text-lg text-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          <CloseIcon />
        </button>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        In this demo your browser turns speech into text. The real extension does it all on your own computer.
      </p>

      {voice ? (
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={listen}
            aria-pressed={listening}
            className={`grid size-14 shrink-0 place-items-center rounded-full text-2xl transition-colors ${
              listening ? "bg-surface-2 ring-2 ring-accent" : "bg-accent-bg text-accent-ink hover:brightness-105"
            }`}
          >
            {listening ? (
              <Image src="/media/lumi-curious.svg" alt="" width={48} height={48} className="voice-listen size-12" />
            ) : (
              <MicIcon />
            )}
            <span className="sr-only">{listening ? "Stop listening" : "Start listening"}</span>
          </button>
          <p className="text-sm text-muted">
            {listening ? (
              <span className="font-semibold text-fg">Listening… say a command.</span>
            ) : (
              "Tap the mic and say something like “scroll down” or “open CostLens”."
            )}
          </p>
        </div>
      ) : (
        <p className="mt-4 rounded-2xl bg-surface-2/70 p-3 text-sm leading-relaxed">{NO_VOICE}</p>
      )}

      <div aria-live="polite" className="mt-3 space-y-1 text-sm empty:hidden">
        {heard && (
          <p className="text-muted">
            Heard: <span className="font-semibold text-fg">“{heard}”</span>
          </p>
        )}
        {reply?.text && <p className="leading-relaxed">{reply.text}</p>}
        {reply?.resume && (
          <a
            href={profile.resume}
            target="_blank"
            rel="noopener"
            className="inline-block font-semibold text-accent underline underline-offset-4"
          >
            Open the resume (PDF)
          </a>
        )}
        {reply?.links?.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target={link.href.startsWith("mailto:") ? undefined : "_blank"}
            rel="noopener"
            className="block font-semibold text-accent underline underline-offset-4"
          >
            {link.label}
          </a>
        ))}
        {reply?.suggest && (
          <ul aria-label="Suggestions" className="flex flex-wrap gap-1.5 pt-1">
            {reply.suggest.map((phrase) => (
              <li key={phrase}>
                <button
                  type="button"
                  onClick={() => void run(phrase)}
                  className="rounded-full border border-accent px-2.5 py-1 text-xs font-semibold text-accent transition-colors hover:bg-accent-bg hover:text-accent-ink"
                >
                  {phrase}
                </button>
              </li>
            ))}
          </ul>
        )}
        {reply?.unknown && <p className="text-xs leading-relaxed text-muted">{LOOSER}</p>}
        {reply?.help && (
          <ul className="list-disc space-y-0.5 pl-5 text-muted">
            {HELP.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}
      </div>

      {autoOn && (
        <button
          type="button"
          onClick={stopAuto}
          className="mt-3 rounded-full border border-accent px-3.5 py-1.5 text-sm font-semibold text-accent"
        >
          Stop scrolling
        </button>
      )}

      <form onSubmit={submit} className="mt-4 flex gap-2">
        <label htmlFor="voice-panel-input" className="sr-only">
          Type a command
        </label>
        <input
          ref={inputRef}
          id="voice-panel-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type a command"
          autoComplete="off"
          enterKeyHint="go"
          className="min-w-0 flex-1 rounded-full border border-line bg-bg px-4 py-2 text-sm placeholder:text-muted focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-full bg-accent-bg px-4 py-2 text-sm font-semibold text-accent-ink hover:brightness-105"
        >
          Go
        </button>
      </form>
      <ul aria-label="Examples" className="mt-3 flex flex-wrap gap-1.5">
        {EXAMPLES.map((example) => (
          <li key={example}>
            <button
              type="button"
              onClick={() => void run(example)}
              className="rounded-full border border-line px-2.5 py-1 text-xs font-semibold text-muted transition-colors hover:border-accent hover:text-accent"
            >
              {example}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Any button that opens the panel
export function VoiceDemoButton({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))} className={className}>
      {children}
    </button>
  );
}
