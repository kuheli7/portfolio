import type { ReactNode } from "react";

// A plain browser window around a screenshot or demo, with the site's address in the title bar.
export function BrowserFrame({ address, children }: { address?: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl bg-surface shadow-(--shadow) ring-1 ring-line sm:rounded-2xl">
      <div aria-hidden="true" className="flex h-7 items-center gap-1.5 border-b border-line px-3 sm:h-9 sm:px-4">
        <span className="size-2 rounded-full bg-[#ff5f57] sm:size-2.5" />
        <span className="size-2 rounded-full bg-[#febc2e] sm:size-2.5" />
        <span className="size-2 rounded-full bg-[#28c840] sm:size-2.5" />
        {address && (
          <span className="mx-auto max-w-[60%] truncate rounded-md bg-bg px-3 py-0.5 text-[10px] text-muted sm:text-xs">
            {address}
          </span>
        )}
        {/* Balances the dots so the address sits in the middle. */}
        <span className="w-8 sm:w-10" />
      </div>
      {children}
    </div>
  );
}

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[2.2rem] bg-[#1d1d1f] p-[6px] shadow-(--shadow) ring-1 ring-[#424245]">
      <div className="overflow-hidden rounded-[1.8rem] bg-black">{children}</div>
    </div>
  );
}

export function hostOf(url: string) {
  return new URL(url).hostname;
}
