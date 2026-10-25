"use client";

import { useSyncExternalStore } from "react";

const clock = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});
const hourIn = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "numeric", hourCycle: "h23" });

// Ticks every 20 seconds; the snapshot is a string, so React only re-renders when the minute changes.
function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 20_000);
  return () => window.clearInterval(id);
}

function snapshot() {
  const now = new Date();
  return `${clock.format(now).toLowerCase()}|${hourIn.format(now)}`;
}

// The time is only known in the browser, so the server renders nothing here.
const serverSnapshot = () => null;

function lumiAt(hour: number) {
  if (hour >= 19 || hour < 5) return "Lumi’s lantern is probably on.";
  if (hour < 11) return "Lumi is probably still asleep.";
  if (hour < 17) return "Lumi is napping until dark.";
  return "Lumi is just waking up.";
}

export function LocalTime() {
  const value = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  if (!value) return null;
  const [time, hour] = value.split("|");
  return (
    <p>
      It’s {time} in Bengaluru. {lumiAt(Number(hour))}
    </p>
  );
}
