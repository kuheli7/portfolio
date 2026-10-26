"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { profile } from "@/data/profile";
import { storyPages } from "@/data/story";
import { ArrowLeftIcon, ArrowRightIcon, MailIcon } from "./icons";
import { StoryDoodle } from "./StoryDoodle";

const titles = ["Kuheli, so far", ...storyPages.map((page) => page.title)];
const total = titles.length;

const buttonClass =
  "inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 font-semibold transition-colors hover:border-accent hover:text-accent aria-disabled:pointer-events-none aria-disabled:opacity-35";

// Every page is in the HTML; only the open one is shown. Arrow keys, swipes, the buttons and the dots all turn pages.
export function StoryBook() {
  const [index, setIndex] = useState(0);
  const [turn, setTurn] = useState<"next" | "prev" | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const swipe = useRef<{ x: number; y: number } | null>(null);

  function go(to: number) {
    if (to < 0 || to >= total || to === index) return;
    setTurn(to > index ? "next" : "prev");
    setIndex(to);
    setAnnouncement(`Page ${to + 1} of ${total}: ${titles[to]}`);
  }

  // Kept in refs so the key listener always sees the latest page without re-subscribing.
  const goRef = useRef(go);
  const indexRef = useRef(index);
  useEffect(() => {
    goRef.current = go;
    indexRef.current = index;
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable=''], [contenteditable='true']")) return;
      if (event.key === "ArrowRight") goRef.current(indexRef.current + 1);
      else if (event.key === "ArrowLeft") goRef.current(indexRef.current - 1);
      else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="overflow-x-clip">
      <section
        aria-label="Kuheli’s story, a picture book"
        aria-roledescription="book"
        className="book relative touch-pan-y"
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse") swipe.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerUp={(event) => {
          const start = swipe.current;
          swipe.current = null;
          if (!start) return;
          const dx = event.clientX - start.x;
          const dy = event.clientY - start.y;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
        }}
        onPointerCancel={() => {
          swipe.current = null;
        }}
      >
        <div className="book-paper relative overflow-hidden rounded-[1.75rem] border border-line bg-surface sm:min-h-[31rem]">
          <Cover open={index === 0} turn={turn} onStart={() => go(1)} />
          {storyPages.map((page, i) => {
            const open = index === i + 1;
            const last = i === storyPages.length - 1;
            return (
              <article
                key={page.id}
                hidden={!open}
                aria-labelledby={`story-${page.id}`}
                className={`story-page relative min-h-[27rem] px-6 pt-9 pb-12 sm:min-h-[31rem] sm:pt-11 sm:pr-12 sm:pl-16 ${open && turn ? `turn-${turn}` : ""}`}
              >
                <div className="grid gap-6 sm:grid-cols-[1fr_auto]">
                  <div>
                    <p className="font-hand text-2xl text-accent">{page.kicker}</p>
                    <h2 id={`story-${page.id}`} className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
                      {page.title}
                    </h2>
                    <div className="mt-5 max-w-xl space-y-4 text-lg leading-relaxed text-muted">
                      {page.body.map((text) => (
                        <p key={text}>{text}</p>
                      ))}
                    </div>
                    {page.links && (
                      <ul className="mt-5 max-w-xl space-y-2">
                        {page.links.map((link) => (
                          <li key={link.href} className="flex gap-2">
                            <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent-bg" />
                            <span>
                              <StoryLinkTo href={link.href}>{link.label}</StoryLinkTo>
                              <span className="text-muted">: {link.note}</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {last && <TheEnd onAgain={() => go(0)} />}
                  </div>
                  {open && <StoryDoodle kind={page.doodle} className="hidden size-28 sm:block" />}
                </div>
                <p aria-hidden="true" className="absolute right-6 bottom-3 font-hand text-lg text-muted">
                  {i + 2} / {total}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <nav aria-label="Story pages" className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-disabled={index === 0 || undefined}
          className={buttonClass}
        >
          <ArrowLeftIcon /> <span className="sr-only sm:not-sr-only">Back</span>
        </button>
        <ol className="flex justify-center sm:gap-1">
          {titles.map((title, i) => (
            <li key={title}>
              <button
                type="button"
                onClick={() => go(i)}
                aria-label={`Page ${i + 1}: ${title}`}
                aria-current={i === index ? "step" : undefined}
                className="group grid size-7 place-items-center rounded-full"
              >
                <span
                  className={`block rounded-full transition-all ${
                    i === index ? "h-2.5 w-5 bg-accent-bg" : "size-2.5 bg-line group-hover:bg-muted"
                  }`}
                />
              </button>
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-disabled={index === total - 1 || undefined}
          className={buttonClass}
        >
          <span className="sr-only sm:not-sr-only">Next</span> <ArrowRightIcon />
        </button>
      </nav>
      <p className="mt-3 text-center text-sm text-muted">
        <span className="hidden sm:inline">Tip: your arrow keys turn the pages too.</span>
        <span className="sm:hidden">Tip: you can swipe to turn the pages.</span>
      </p>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}

function Cover({ open, turn, onStart }: { open: boolean; turn: "next" | "prev" | null; onStart: () => void }) {
  return (
    <article
      hidden={!open}
      aria-labelledby="story-cover"
      className={`story-page relative grid min-h-[27rem] place-items-center px-6 py-12 text-center sm:min-h-[31rem] ${open && turn ? `turn-${turn}` : ""}`}
    >
      <div>
        <Image
          src="/media/lumi-peek.svg"
          alt="Lumi the baby moth, peeking out"
          width={200}
          height={200}
          className="mx-auto size-40"
          loading="eager"
        />
        <p className="mt-4 font-hand text-2xl text-accent">a short story</p>
        <h2 id="story-cover" className="mt-1 font-display text-4xl font-semibold sm:text-5xl">
          {titles[0]}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-lg text-muted">
          Six little chapters about how I got here, from economics to software, with a baby moth along the way.
        </p>
        <button
          type="button"
          onClick={onStart}
          className="mt-7 inline-flex items-center gap-1.5 rounded-full bg-accent-bg px-5 py-2.5 font-semibold text-accent-ink transition-transform hover:-translate-y-0.5"
        >
          Start reading <ArrowRightIcon />
        </button>
      </div>
    </article>
  );
}

function TheEnd({ onAgain }: { onAgain: () => void }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
      <Image
        src="/media/lumi-proud.svg"
        alt="Lumi the baby moth, looking proud"
        width={140}
        height={140}
        className="size-28"
      />
      <div>
        <p className="font-hand text-3xl text-accent">The end, for now.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-accent-bg px-4 py-2 font-semibold text-accent-ink transition-transform hover:-translate-y-0.5"
          >
            <MailIcon /> Email me
          </a>
          <button type="button" onClick={onAgain} className={buttonClass}>
            Read it again
          </button>
          <Link href="/" className={buttonClass}>
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}

function StoryLinkTo({ href, children }: { href: string; children: string }) {
  const className = "font-semibold text-fg underline decoration-accent decoration-2 underline-offset-4 hover:text-accent";
  return href.startsWith("/") ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
