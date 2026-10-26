"use client";

import { createElement, useEffect, useState, type HTMLAttributes, type ReactNode } from "react";

// A block that fades up the first time it scrolls into view. Nothing is hidden until JavaScript has checked where
// the block is, so the page reads fine without it, and blocks already on screen never blink out and back.
// React owns the attribute that hides it, so the server HTML and the hydrated page always agree.

type Props = HTMLAttributes<HTMLElement> & {
  as?: "div" | "ul" | "article";
  // "" fades the block, "children" staggers its children, "line" draws a timeline, "card" slides a project card in
  kind?: "" | "children" | "line" | "card";
  children: ReactNode;
};

export function Reveal({ as = "div", kind = "", children, ...rest }: Props) {
  const [el, setEl] = useState<HTMLElement | null>(null);
  const [state, setState] = useState<"idle" | "wait" | "shown">("idle");

  useEffect(() => {
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) observer.disconnect();
        setState((s) => (s === "shown" || entry.isIntersecting ? "shown" : "wait"));
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [el]);

  return createElement(as, { ...rest, ref: setEl, "data-reveal": kind, "data-wait": state === "wait" ? "" : undefined }, children);
}
