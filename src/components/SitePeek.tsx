"use client";

import { useRef, useState } from "react";

// A "Peek inside" button that opens a live preview of a café site in a dialog. The page loads only after
// the click, so the gallery stays light, and the visitor can flip between phone and desktop widths.

type Props = { name: string; href: string };

export function SitePeek({ name, href }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(true);

  function show() {
    setOpen(true);
    dialog.current?.showModal();
  }

  const tab = (active: boolean) =>
    `rounded-full px-3 py-1 text-sm font-semibold transition-colors ${
      active ? "bg-accent-bg text-accent-ink" : "text-muted hover:text-fg"
    }`;

  return (
    <>
      <button
        type="button"
        onClick={show}
        className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
      >
        Peek inside<span className="sr-only"> {name}</span>
      </button>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        aria-label={`Preview of ${name}`}
        className="m-auto max-h-[92vh] w-[min(94vw,72rem)] rounded-3xl border border-line bg-surface p-0 text-fg backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <p className="font-display text-lg font-semibold">{name}</p>
          <div className="flex items-center gap-1 rounded-full bg-surface-2 p-1">
            <button type="button" aria-pressed={phone} onClick={() => setPhone(true)} className={tab(phone)}>
              Phone
            </button>
            <button type="button" aria-pressed={!phone} onClick={() => setPhone(false)} className={tab(!phone)}>
              Desktop
            </button>
          </div>
          <div className="flex items-center gap-2">
            <a href={href} className="text-sm font-semibold text-accent underline-offset-4 hover:underline">
              Open full site
            </a>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="rounded-full px-3 py-1 text-sm font-semibold text-muted hover:text-fg"
            >
              Close
            </button>
          </div>
        </div>
        <div className="flex justify-center overflow-auto bg-surface-2/60 p-4">
          {open && (
            <iframe
              key={phone ? "phone" : "desktop"}
              src={href}
              title={`${name}, live preview`}
              loading="lazy"
              className={`h-[70vh] rounded-2xl border border-line bg-white ${phone ? "w-[390px] max-w-full" : "w-full"}`}
            />
          )}
        </div>
        <p className="px-4 pb-3 text-center text-xs text-muted">
          A fictional design preview. Ordering hands off to WhatsApp.
        </p>
      </dialog>
    </>
  );
}
