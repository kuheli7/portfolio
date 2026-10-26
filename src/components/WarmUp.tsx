"use client";

import { useEffect } from "react";

// The demos on free Render instances sleep when idle and take about 30 seconds to wake. Once the homepage has settled,
// ping each one so it is already waking by the time someone clicks. no-cors because the reply doesn't matter, only the request.
export function WarmUp({ urls }: { urls: string[] }) {
  useEffect(() => {
    // Skip when the visitor has asked to save data
    if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return;
    try {
      if (sessionStorage.getItem("warmed")) return;
    } catch {
      // Storage blocked: still ping, it's harmless
    }
    const timer = window.setTimeout(() => {
      // Marked only when the pings go out, so a cancelled timer (strict mode, quick navigation) doesn't use up the visit
      try {
        sessionStorage.setItem("warmed", "1");
      } catch {}
      for (const url of urls) fetch(url, { mode: "no-cors", cache: "no-store", keepalive: true }).catch(() => {});
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [urls]);

  return null;
}
