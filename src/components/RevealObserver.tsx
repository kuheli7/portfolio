"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Sections marked data-reveal fade up the first time they scroll into view.
// Nothing is hidden until this runs, so the page reads fine without JavaScript or with reduced motion.
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: no-preference)").matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.shown = "";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    for (const el of document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-shown])")) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) el.dataset.shown = "";
      else observer.observe(el);
    }
    document.documentElement.classList.add("reveal-ready");
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
