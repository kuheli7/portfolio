"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CopyIcon } from "./icons";

type Status = "idle" | "copied" | "failed";

// Copies the address and shows a small toast with a happy Lumi.
export function CopyEmail({ email, className = "" }: { email: string; className?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const timer = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus("idle"), 2800);
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className={`inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 font-semibold transition-colors hover:border-accent hover:text-accent ${className}`}
      >
        <CopyIcon /> Copy email
      </button>
      <div
        role="status"
        className={`fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-line bg-surface py-2 pr-5 pl-2 text-left shadow-2xl shadow-black/30 transition-[opacity,translate] duration-300 ${
          status === "idle" ? "pointer-events-none translate-y-4 opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        {status === "copied" && (
          <>
            <Image src="/media/lumi-happy.svg" alt="" width={56} height={56} className="size-14" />
            <span>
              <strong className="block font-display text-lg">Copied!</strong>
              <span className="text-sm text-muted">Lumi’s very pleased about it.</span>
            </span>
          </>
        )}
        {status === "failed" && <span className="py-2 pl-3 text-sm">Couldn’t copy here. The address is {email}.</span>}
      </div>
    </>
  );
}
