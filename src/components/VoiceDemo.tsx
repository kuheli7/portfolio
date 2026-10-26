"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { profile } from "@/data/profile";
import type { Command } from "@/lib/voicenav/parser";
import { CloseIcon, MicIcon } from "./icons";

// A small, browser-only version of VoiceNav for this site. It runs the real extension's command parser
// (copied into src/lib/voicenav), then acts on the page. Anything the full extension needs a browser
// extension or the local AI model for gets a short note instead.

export const OPEN_EVENT = "voicenav:open";

type Parser = typeof import("@/lib/voicenav/parser");
let parserPromise: Promise<Parser> | undefined;
const loadParser = () => (parserPromise ??= import("@/lib/voicenav/parser"));

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
const NOT_UNDERSTOOD =
  "I don’t know that one. In the full extension, a small AI model running on your computer would work out what you meant.";
const NEEDS_EXTENSION =
  "That one needs the full extension, which also handles tabs, searching, forms and reading pages aloud. Here I can scroll, jump around the site, open projects and switch the theme.";

const EXAMPLES = ["scroll down", "open CostLens", "take me to education", "keep scrolling", "light mode", "neeche scroll karo", "help"];

const HELP = [
  "“scroll down”, “scroll up a little”, “go to the top”",
  "“keep scrolling”, then “faster” or “stop”",
  "“show me the work”, “take me to education”, “contact”",
  "“open CostLens”, “open my story”, “let’s play”",
  "“dark mode”, “light mode”, “go back”, “close”",
  "Two at once: “scroll down and then open VoiceNav”",
  "Hinglish too: “neeche scroll karo”",
];

// Home page sections, in the words people are likely to use for them
const SECTIONS: [RegExp, string, string][] = [
  [/^(more( projects)?|smaller builds?|other projects)$/, "more", "More projects"],
  [/^(work|projects?|selected work|featured( work)?|case stud(y|ies))$/, "work", "Selected work"],
  [/^(design( work)?|designs|websites|cafes?|café sites)$/, "design", "Design work"],
  [/^(just for fun|fun|lumi|lumis? night shift)$/, "fun", "Just for fun"],
  [/^(about( me| you| her| them)?|education|experience|skills|tools|awards|certifications|leadership)$/, "about", "About"],
  [/^(contact( me)?|email|mail|get in touch|hire( me)?)$/, "contact", "Contact"],
  [/^(top|intro|start)$/, "top", "the top"],
];

const CASE_STUDIES: [RegExp, string, string][] = [
  [/^(cost ?lens|costless)$/, "costlens", "CostLens"],
  [/^(voice ?nav|voice navigation|voicenet)$/, "voicenav", "VoiceNav"],
  [/^(credit ?lens|credit less)$/, "creditlens", "CreditLens"],
  [/^(policy ?tree( editor)?|tree editor)$/, "policy-tree-editor", "Policy Tree Editor"],
];

type SiteAction =
  | { kind: "theme"; to: "dark" | "light" | "toggle" }
  | { kind: "page"; href: string; label: string }
  | { kind: "resume" | "help" | "close" };

// Site-only commands, checked before the parser so "dark mode" or "go home" never reach it
const SITE: [RegExp, SiteAction][] = [
  [/^((switch|change|go) to |turn on |use |go )?(the )?(dark|night)( mode| theme)?$|^lights? off$/, { kind: "theme", to: "dark" }],
  [/^((switch|change|go) to |turn on |use |go )?(the )?(light|day)( mode| theme)?$|^lights? on$/, { kind: "theme", to: "light" }],
  [/^(switch|change|toggle|flip) (the )?(theme|mode|colou?rs)$/, { kind: "theme", to: "toggle" }],
  [/^((go|take me|back)( to)? )?(the )?home( ?page)?$|^go back home$/, { kind: "page", href: "/", label: "the homepage" }],
  [/^(open |go to |take me to |show me |let'?s |i want to )?(the )?(play|games?|constellations?|play page)$/, { kind: "page", href: "/play", label: "Play" }],
  [/^(open |go to |take me to |show me |read |tell me )?(the |my |your |her |their )?(story|story ?book)$/, { kind: "page", href: "/story", label: "the story" }],
  [/\b(resume|résumé|cv)\b/, { kind: "resume" }],
  [/^(help|what can i (say|do)|commands)$/, { kind: "help" }],
  [/^(close|close (this|the panel|voice ?nav)|bye|goodbye|exit|dismiss|that'?s all)$/, { kind: "close" }],
];

const SPEEDS: Record<string, number> = { slow: 70, medium: 150, fast: 320 };

type Reply = { text: string; resume?: boolean; help?: boolean };
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
      void loadParser();
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

  // A home section or a case study, named on its own ("education") or after "open" / "go to"
  function goToPlace(text: string): string | null {
    for (const [re, id, label] of SECTIONS) if (re.test(text)) return goToSection(id, label);
    for (const [re, slug, name] of CASE_STUDIES) {
      if (re.test(text)) {
        router.push(`/projects/${slug}`);
        return `Opening the ${name} case study.`;
      }
    }
    return null;
  }

  // "open X", "click X", "go to X": a place on the site, or something visible on the page
  function clickText(raw: string): string {
    const text = raw
      .toLowerCase()
      .replace(/\b(the|my|your|her|their|section|part|area|bit|page)\b/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) return NOT_UNDERSTOOD;
    const place = goToPlace(text);
    if (place) return place;
    if (text.length < 3) return `I couldn’t find “${raw}” on this page.`;

    const panel = panelRef.current;
    const words = new RegExp(`\\b${text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
    const visible = [...document.querySelectorAll<HTMLElement>("h2, h3, a, button, summary")].filter(
      (el) => !panel?.contains(el) && el.getClientRects().length > 0,
    );
    const name = (el: HTMLElement) =>
      (el.getAttribute("aria-label") ?? el.textContent ?? "").toLowerCase().replace(/\s+/g, " ").trim();
    // Exact names first, then headings (so "MindCare" finds the card, not its GitHub link), then anything else
    const target =
      visible.find((el) => name(el) === text) ??
      visible.find((el) => /^H[23]$/.test(el.tagName) && words.test(name(el))) ??
      visible.find((el) => words.test(name(el)));
    if (!target) return `I couldn’t find “${raw}” on this page.`;

    const label = target.textContent?.trim() || raw;
    if (/^H[23]$/.test(target.tagName)) {
      const card = target.closest<HTMLElement>("article, li") ?? target;
      card.scrollIntoView({ block: "center" });
      flash(card);
      return `Here’s ${label}.`;
    }
    target.scrollIntoView({ block: "center" });
    flash(target);
    target.click();
    return `Clicked “${label}”.`;
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
        return { text: "" };
    }
  }

  function runCommand(cmd: Command): Reply {
    const auto = autoRef.current;
    const behavior: ScrollBehavior = reducedMotion() ? "auto" : "smooth";
    switch (cmd.type) {
      case "scroll": {
        if (cmd.dir === "left" || cmd.dir === "right") return { text: "This site doesn’t scroll sideways." };
        const sign = cmd.dir === "up" ? -1 : 1;
        window.scrollBy({ top: sign * (cmd.amount ?? 0.8) * window.innerHeight, behavior });
        return { text: cmd.dir === "up" ? "Scrolling up." : "Scrolling down." };
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
        // "stop" and "pause" parse as media commands; on this site they mean auto-scroll
        if (auto && (cmd.kind === "pause" || cmd.kind === "stop")) {
          stopAuto();
          return { text: "Stopped." };
        }
        if (cmd.kind === "pause" || cmd.kind === "stop") return { text: "Nothing’s moving right now." };
        return { text: "That one’s for videos and music. The full extension does it on sites like YouTube." };
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
        return { text: clickText(String(cmd.text ?? "")) };
      case "help":
        return runSite({ kind: "help" });
      default:
        return { text: NEEDS_EXTENSION };
    }
  }

  async function run(said: string) {
    const raw = said.trim();
    if (!raw) return;
    setHeard(raw);
    const p = await loadParser();
    const afterWake = p.stripWake(raw);
    if (afterWake === "") {
      setReply({ text: "Hi! What should I do?" });
      return;
    }
    const english = p.toEnglish(afterWake ?? raw);
    const understood = (step: string) => {
      const t = p.normalize(step);
      return SITE.some(([re]) => re.test(t)) || p.parse(step) !== null;
    };
    // The parser only chains its own commands, so "dark mode and then open CostLens" is split here
    const parts = english.split(/\s+(?:and then|and|then)\s+/);
    const steps = p.splitChain(english) ?? (parts.length > 1 && parts.every(understood) ? parts : [english]);
    const replies: Reply[] = [];
    for (let i = 0; i < steps.length; i++) {
      // give a page change or a smooth scroll time to land before the next step
      if (i > 0) await wait(900);
      const t = p.normalize(steps[i]);
      const site = SITE.find(([re]) => re.test(t))?.[1];
      let result: Reply;
      if (site) {
        result = runSite(site);
        if (site.kind === "close") return;
      } else {
        const cmd = p.parse(steps[i]);
        result = cmd ? runCommand(cmd) : { text: goToPlace(t) ?? NOT_UNDERSTOOD };
      }
      replies.push(result);
      setReply({
        text: replies.map((r) => r.text).join(" "),
        resume: replies.some((r) => r.resume),
        help: replies.some((r) => r.help),
      });
      if (result.text === NOT_UNDERSTOOD) break;
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
          void loadParser().then((p) => run(p.bestAlternative(alts)));
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
