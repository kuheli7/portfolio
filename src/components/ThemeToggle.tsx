"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "./icons";

// The theme lives on <html data-theme>, set before paint by the script in layout.tsx.
// Reading it through useSyncExternalStore keeps aria-pressed in sync without a hydration mismatch.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

const isLight = () => document.documentElement.dataset.theme === "light";
const isLightOnServer = () => false;

export function ThemeToggle() {
  const light = useSyncExternalStore(subscribe, isLight, isLightOnServer);

  function toggle() {
    const next = isLight() ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // storage can be blocked; the theme still changes for this visit
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Light theme"
      aria-pressed={light}
      title="Switch light and dark theme"
      className="grid size-10 place-items-center rounded-full text-lg text-muted transition-colors hover:bg-surface hover:text-fg"
    >
      {/* Icons swap with CSS so the first paint is right even before React hydrates. */}
      <MoonIcon className="light:hidden" />
      <SunIcon className="hidden light:block" />
    </button>
  );
}
