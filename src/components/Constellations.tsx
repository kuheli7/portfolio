"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { HandControl, type HandPoint } from "@/components/HandControl";
import { backgroundStars, constellations, freeStars, type Star } from "@/data/constellations";

// Join the stars into pictures. Works with a mouse (click star to star, or drag), touch, and the keyboard
// (arrows move between stars, Enter joins). Sound is off until the visitor turns it on.

const FREE = constellations.length;
// C major pentatonic, so any run of joins sounds pleasant
const NOTES = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760, 2093];
// How far, in screen pixels, a pointer can be from a star and still pick it. The nearest star wins, so these can
// be generous: trackpad clicks and a hand in front of a camera both land a little off.
const SNAP: Record<string, number> = { mouse: 40, pen: 40, touch: 44, hand: 60 };
const DIRECTIONS: Record<string, [number, number]> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
};

type Line = [number, number];
type Wrong = { id: number; a: number; b: number };
type Drag = { from: number; fresh: boolean; moved: boolean; x: number; y: number };
type SkyPoint = Star & { unit: number };
type Pointer = Star & { aim: number | null };

// "the music note", but just "Lumi’s lantern"
const inSentence = (name: string) => (name.startsWith("Lumi") ? name : `the ${name.toLowerCase()}`);
const pairKey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);

export function Constellations() {
  const [mode, setMode] = useState(0);
  const [lines, setLines] = useState<Line[]>([]);
  const [wrong, setWrong] = useState<Wrong[]>([]);
  const [anchor, setAnchor] = useState<number | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [cursor, setCursor] = useState<number | null>(null);
  const [pointer, setPointer] = useState<Pointer | null>(null);
  const [focused, setFocused] = useState(false);
  const [done, setDone] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [sound, setSound] = useState(false);
  const [hand, setHand] = useState<HandPoint | null>(null);
  const handSeen = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const timers = useRef<number[]>([]);
  const drag = useRef<Drag | null>(null);
  const wrongId = useRef(0);

  const shape = mode < FREE ? constellations[mode] : null;
  const stars = shape ? shape.stars : freeStars;
  const targets = useMemo(() => new Set(shape?.lines.map(([a, b]) => pairKey(a, b))), [shape]);
  const drawn = new Set(lines.map(([a, b]) => pairKey(a, b)));
  const complete = shape !== null && drawn.size === shape.lines.length;

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((t) => window.clearTimeout(t));
      void audioRef.current?.close();
    };
  }, []);

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms));
  }

  function ping(freq: number, delay = 0) {
    const ctx = audioRef.current;
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.14, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.85);
  }

  function toggleSound() {
    if (!sound && !audioRef.current) {
      const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
      const Ctx = w.AudioContext ?? w.webkitAudioContext;
      if (!Ctx) return;
      audioRef.current = new Ctx();
    }
    if (!sound) {
      void audioRef.current?.resume();
      ping(NOTES[4]);
    }
    setSound(!sound);
  }

  // Screen point to sky coordinates, and how many sky units one screen pixel is
  function toSky(clientX: number, clientY: number) {
    const svg = svgRef.current;
    const matrix = svg?.getScreenCTM();
    if (!svg || !matrix) return null;
    const p = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse());
    return { x: p.x, y: p.y, unit: 800 / svg.getBoundingClientRect().width };
  }

  function starAt(p: SkyPoint, pixels: number) {
    let best: number | null = null;
    let bestDistance = pixels * p.unit;
    stars.forEach((s, i) => {
      const d = Math.hypot(s.x - p.x, s.y - p.y);
      if (d <= bestDistance) {
        best = i;
        bestDistance = d;
      }
    });
    return best;
  }

  function describe(i: number) {
    const base = `Star ${i + 1} of ${stars.length}`;
    if (!shape) return `${base}.`;
    const left = shape.lines.filter(([a, b]) => (a === i || b === i) && !drawn.has(pairKey(a, b))).length;
    return left === 0 ? `${base}, all its lines are done.` : `${base}, needs ${left} more line${left === 1 ? "" : "s"}.`;
  }

  function hold(i: number) {
    setAnchor(i);
    setCursor(i);
    setMessage(`Holding star ${i + 1}. Now pick the star to join it to.`);
  }

  function letGo() {
    setAnchor(null);
    setMessage("Let go of the star.");
  }

  // Join star i to the held star (or to where a drag started), then hold i so the next join carries on from there
  function join(i: number, from = anchor) {
    if (from === null) return hold(i);
    if (from === i) return;
    const key = pairKey(from, i);
    setCursor(i);
    if (drawn.has(key)) {
      setAnchor(i);
      setMessage(`Those two are already joined. Holding star ${i + 1}.`);
      return;
    }
    if (shape && !targets.has(key)) {
      const id = ++wrongId.current;
      setWrong((w) => [...w, { id, a: from, b: i }]);
      later(() => setWrong((w) => w.filter((x) => x.id !== id)), 900);
      setAnchor(from);
      setMessage(`Not quite. Stars ${from + 1} and ${i + 1} aren’t joined in this picture. Still holding star ${from + 1}.`);
      return;
    }
    const next: Line[] = [...lines, [from, i]];
    setLines(next);
    if (sound) ping(NOTES[(next.length - 1) % NOTES.length]);
    if (shape && next.length === shape.lines.length) {
      setAnchor(null);
      setDone((d) => (d.includes(shape.key) ? d : [...d, shape.key]));
      setMessage(`You made ${inSentence(shape.name)}! ${shape.fact}`);
      if (sound) [0, 2, 4, 5].forEach((n, k) => ping(NOTES[n + 2], 0.25 + k * 0.12));
      return;
    }
    setAnchor(i);
    setMessage(
      shape
        ? `Joined. ${next.length} of ${shape.lines.length} lines. Holding star ${i + 1}.`
        : `Joined. ${next.length} line${next.length === 1 ? "" : "s"} so far. Holding star ${i + 1}.`,
    );
  }

  function undo() {
    if (!lines.length) return setMessage("Nothing to undo.");
    const last = lines[lines.length - 1];
    setLines(lines.slice(0, -1));
    setAnchor(last[0]);
    setCursor(last[0]);
    setMessage(`Took back the last line. Holding star ${last[0] + 1}.`);
  }

  function reset(to = mode) {
    setMode(to);
    setLines([]);
    setWrong([]);
    setAnchor(null);
    setCursor(null);
    setPointer(null);
    const next = constellations[to];
    setMessage(
      next
        ? `${next.name}: ${next.stars.length} stars and ${next.lines.length} lines to find. The faint dotted lines are hints.`
        : `Free drawing: ${freeStars.length} stars, join any of them.`,
    );
  }

  // The nearest star roughly in the arrow's direction
  function nearestToward(from: number, [dx, dy]: [number, number]) {
    const o = stars[from];
    let best: number | null = null;
    let bestScore = Infinity;
    stars.forEach((s, i) => {
      if (i === from) return;
      const vx = s.x - o.x;
      const vy = s.y - o.y;
      const along = vx * dx + vy * dy;
      const across = Math.abs(vx * dy - vy * dx);
      if (along <= 0 || across > along * 1.6) return;
      const score = along + across * 2;
      if (score < bestScore) {
        best = i;
        bestScore = score;
      }
    });
    return best;
  }

  function onKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    const dir = DIRECTIONS[event.key];
    if (dir) {
      event.preventDefault();
      const from = cursor ?? anchor;
      const to = from === null ? 0 : nearestToward(from, dir);
      if (to === null) return setMessage("No more stars that way.");
      setCursor(to);
      setMessage(describe(to));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (cursor === null) {
        setCursor(0);
        setMessage(describe(0));
      } else if (anchor === cursor) letGo();
      else join(cursor);
    } else if (event.key === "Backspace") {
      event.preventDefault();
      undo();
    } else if (event.key === "Escape" && anchor !== null) {
      event.preventDefault();
      letGo();
    }
  }

  // Where the pointer is, and which star a press there would pick, so the sky can ring it before the click
  function point(p: SkyPoint, pixels: number) {
    setPointer({ x: p.x, y: p.y, aim: starAt(p, pixels) });
  }

  // Shared by the mouse, touch and the camera hand: press on a star, move, and let go
  function press(p: SkyPoint, pixels: number) {
    const s = starAt(p, pixels);
    point(p, pixels);
    // A near miss keeps the held star, so an imprecise click doesn't lose your place
    if (s === null) {
      drag.current = null;
      return false;
    }
    drag.current = { from: s, fresh: anchor === null, moved: false, x: p.x, y: p.y };
    setDragFrom(s);
    if (anchor === null) hold(s);
    return true;
  }

  function move(p: SkyPoint, pixels: number) {
    point(p, pixels);
    const d = drag.current;
    if (d && Math.hypot(p.x - d.x, p.y - d.y) > 8 * p.unit) d.moved = true;
  }

  function release(p: SkyPoint, pixels: number) {
    const d = drag.current;
    drag.current = null;
    setDragFrom(null);
    if (!d) return;
    const s = starAt(p, pixels);
    // A drag joins where it started to where it ends. A tap joins the held star to the tapped one,
    // and tapping the held star again lets go of it. A trackpad click often slides a few pixels, so a "drag"
    // that ends on the star it started from still counts as a tap.
    if (d.moved && s !== null && s !== d.from) join(s, d.from);
    else if (d.moved && s === null) return;
    else if (!d.fresh) {
      if (d.from === anchor) letGo();
      else join(d.from);
    }
  }

  function onPointerDown(event: PointerEvent<SVGSVGElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const p = toSky(event.clientX, event.clientY);
    if (p && press(p, SNAP[event.pointerType] ?? SNAP.mouse)) event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<SVGSVGElement>) {
    if (event.pointerType !== "mouse" && !drag.current) return;
    const p = toSky(event.clientX, event.clientY);
    if (p) move(p, SNAP[event.pointerType] ?? SNAP.mouse);
  }

  function onPointerUp(event: PointerEvent<SVGSVGElement>) {
    const p = toSky(event.clientX, event.clientY);
    if (p) release(p, SNAP[event.pointerType] ?? SNAP.mouse);
    if (event.pointerType !== "mouse") setPointer(null);
  }

  function onHand(point: HandPoint | null, pinch: "start" | "end" | null) {
    const svg = svgRef.current;
    if (!point || !svg) {
      drag.current = null;
      setDragFrom(null);
      setHand(null);
      // Only clear the pointer the hand set, not the mouse's
      if (handSeen.current) setPointer(null);
      handSeen.current = false;
      return;
    }
    const p = { x: point.x * 800, y: point.y * 500, unit: 800 / svg.getBoundingClientRect().width };
    handSeen.current = true;
    setHand(point);
    if (pinch === "start") press(p, SNAP.hand);
    else if (pinch === "end") release(p, SNAP.hand);
    else move(p, SNAP.hand);
  }

  const start = dragFrom ?? anchor;
  const held = start === null ? null : stars[start];
  const aim = pointer?.aim ?? null;
  // While holding a star, a dashed line follows the pointer (snapping to the star it would pick), or points at
  // the keyboard cursor
  const previewEnd = !held
    ? null
    : pointer
      ? aim !== null && aim !== start
        ? stars[aim]
        : pointer
      : focused && cursor !== null && cursor !== anchor
        ? stars[cursor]
        : null;
  const name = shape ? shape.name : "Free drawing";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <ul aria-label="Pictures" className="flex flex-wrap gap-2">
          {[...constellations.map((c) => c.name), "Free draw"].map((label, i) => {
            const finished = i < FREE && done.includes(constellations[i].key);
            return (
              <li key={label}>
                <button
                  type="button"
                  aria-pressed={mode === i}
                  onClick={() => reset(i)}
                  className={`rounded-full border px-3 py-1 text-sm font-semibold transition-colors ${
                    mode === i
                      ? "border-accent bg-accent-bg text-accent-ink"
                      : "border-line text-muted hover:border-accent hover:text-accent"
                  }`}
                >
                  {label}
                  {finished && <span aria-label=", finished"> ★</span>}
                </button>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          aria-pressed={sound}
          onClick={toggleSound}
          className="ml-auto rounded-full border border-line px-3 py-1 text-sm font-semibold text-muted transition-colors hover:border-accent hover:text-accent"
        >
          Sound {sound ? "on" : "off"}
        </button>
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 800 500"
        role="application"
        tabIndex={0}
        aria-label={`Star sky: ${name}`}
        aria-describedby="sky-help"
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          drag.current = null;
          setDragFrom(null);
          setPointer(null);
        }}
        onPointerLeave={(event) => event.pointerType === "mouse" && setPointer(null)}
        className="sky mt-4 block h-auto w-full touch-none rounded-3xl select-none"
      >
        <defs>
          <radialGradient id="sky-bg" cx="0.5" cy="0.15" r="0.95">
            <stop offset="0" stopColor="#3a2f6e" />
            <stop offset="0.55" stopColor="#1f1840" />
            <stop offset="1" stopColor="#120e26" />
          </radialGradient>
          <radialGradient id="sky-flame">
            <stop offset="0" stopColor="#fff3c4" />
            <stop offset="0.35" stopColor="#f6cf6a" stopOpacity="0.85" />
            <stop offset="1" stopColor="#f6cf6a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="800" height="500" fill="url(#sky-bg)" />
        {backgroundStars.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#fef7ed"
            opacity={0.55}
            className="sky-dot"
            style={{ "--i": s.i } as CSSProperties}
          />
        ))}

        {shape?.lines
          .filter(([a, b]) => !drawn.has(pairKey(a, b)))
          .map(([a, b]) => {
            // The hints leading on from the held star are brighter, so it's clear where to go next
            const next = start !== null && (a === start || b === start);
            return (
              <line
                key={pairKey(a, b)}
                x1={stars[a].x}
                y1={stars[a].y}
                x2={stars[b].x}
                y2={stars[b].y}
                stroke={next ? "#f6cf6a" : "#c3b8de"}
                strokeOpacity={next ? 0.75 : 0.32}
                strokeWidth={next ? 2.5 : 1.5}
                strokeDasharray="1.5 9"
                strokeLinecap="round"
              />
            );
          })}

        {shape?.glow && complete && (
          <circle cx={shape.glow.x} cy={shape.glow.y} r="70" fill="url(#sky-flame)" className="sky-flame" />
        )}

        {lines.map(([a, b]) => (
          <line
            key={pairKey(a, b)}
            x1={stars[a].x}
            y1={stars[a].y}
            x2={stars[b].x}
            y2={stars[b].y}
            pathLength={1}
            stroke="#f6cf6a"
            strokeWidth="3"
            strokeLinecap="round"
            className={`star-line ${complete ? "star-line-done" : ""}`}
          />
        ))}
        {wrong.map((w) => (
          <line
            key={w.id}
            x1={stars[w.a].x}
            y1={stars[w.a].y}
            x2={stars[w.b].x}
            y2={stars[w.b].y}
            stroke="#f0a3b5"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="star-wrong"
          />
        ))}
        {held && previewEnd && (
          <line
            x1={held.x}
            y1={held.y}
            x2={previewEnd.x}
            y2={previewEnd.y}
            stroke="#f6cf6a"
            strokeOpacity="0.6"
            strokeWidth="2"
            strokeDasharray="6 7"
            strokeLinecap="round"
            pointerEvents="none"
          />
        )}

        {stars.map((s, i) => (
          <g key={`${mode}-${i}`}>
            {i === anchor && (
              <circle cx={s.x} cy={s.y} r="17" fill="none" stroke="#f6cf6a" strokeWidth="2.5" className="star-held" />
            )}
            {i === aim && i !== start && (
              <circle cx={s.x} cy={s.y} r="19" fill="#fef7ed" fillOpacity="0.12" stroke="#fef7ed" strokeOpacity="0.7" strokeWidth="2" />
            )}
            {focused && i === cursor && i !== anchor && i !== aim && (
              <circle cx={s.x} cy={s.y} r="17" fill="none" stroke="#fef7ed" strokeWidth="2" strokeDasharray="4 4" />
            )}
            <circle cx={s.x} cy={s.y} r="14" fill="#f6cf6a" opacity="0.16" />
            <circle cx={s.x} cy={s.y} r="5.5" fill="#fef7ed" />
          </g>
        ))}
        {hand && pointer && (
          <circle
            cx={pointer.x}
            cy={pointer.y}
            r={hand.pinched ? 8 : 15}
            fill={hand.pinched ? "#f6cf6a" : "none"}
            stroke="#f6cf6a"
            strokeWidth="2.5"
            pointerEvents="none"
          />
        )}
      </svg>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <p className="font-semibold">
          {shape ? `${drawn.size} of ${shape.lines.length} lines` : `${lines.length} line${lines.length === 1 ? "" : "s"}`}
        </p>
        <button type="button" onClick={undo} className="font-semibold text-muted hover:text-accent">
          Undo
        </button>
        <button type="button" onClick={() => reset()} className="font-semibold text-muted hover:text-accent">
          Start over
        </button>
      </div>
      <p className="mt-2 text-sm text-muted">Click star to star, or use the arrow keys and Enter.</p>
      <p id="sky-help" className="sr-only">
        Click a star, then the next one, or drag from star to star. On a keyboard: arrow keys move between stars, Enter
        joins, Backspace undoes, and Esc lets go.
      </p>
      <p aria-live="polite" className="sr-only">
        {message}
      </p>

      {complete && shape && (
        <div className="star-done mt-5 flex items-center gap-4 rounded-2xl border border-line bg-surface-2/70 p-4">
          <Image src="/media/lumi-starry.svg" alt="" width={80} height={80} className="star-pop size-16 shrink-0 sm:size-20" />
          <div>
            <p className="font-display text-lg font-semibold">You made {inSentence(shape.name)}!</p>
            <p className="mt-0.5 text-muted">{shape.fact}</p>
            <button
              type="button"
              onClick={() => reset((mode + 1) % (FREE + 1))}
              className="mt-2 text-sm font-semibold text-accent underline-offset-4 hover:underline"
            >
              {mode + 1 < FREE ? `Next: ${constellations[mode + 1].name}` : "Try free drawing"} →
            </button>
          </div>
        </div>
      )}
      <HandControl onHand={onHand} />
    </div>
  );
}
