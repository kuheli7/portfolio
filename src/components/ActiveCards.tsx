"use client";

import { useEffect } from "react";

// On a touch screen there is no hover, so the project card nearest the middle of the screen takes the glow instead.
// It only sets data-live on the cards; the CSS decides whether to show it.
export function ActiveCards() {
  useEffect(() => {
    const cards = [...document.querySelectorAll<HTMLElement>(".project-card")];
    if (!cards.length) return;
    const near = new Set<HTMLElement>();
    let live: HTMLElement | null = null;

    const pick = () => {
      const middle = window.innerHeight / 2;
      let best: HTMLElement | null = null;
      let gap = Infinity;
      for (const card of near) {
        const box = card.getBoundingClientRect();
        const away = Math.abs(box.top + box.height / 2 - middle);
        if (away < gap) {
          gap = away;
          best = card;
        }
      }
      if (best === live) return;
      live?.removeAttribute("data-live");
      best?.setAttribute("data-live", "");
      live = best;
    };

    // A thin band across the middle of the screen: a card is "near" while any part of it is inside the band
    const observer = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          if (isIntersecting) near.add(target as HTMLElement);
          else near.delete(target as HTMLElement);
        }
        pick();
      },
      { rootMargin: "-40% 0px -40% 0px" },
    );
    cards.forEach((card) => observer.observe(card));
    return () => {
      observer.disconnect();
      live?.removeAttribute("data-live");
    };
  }, []);

  return null;
}
