import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRightIcon } from "./icons";

export function SectionHeading({ id, title, children }: { id: string; title: string; children?: ReactNode }) {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
      <h2 id={id} data-reveal className="text-4xl font-semibold tracking-[-0.025em] sm:text-6xl">
        {title}
      </h2>
      {children && (
        <p data-reveal className="mt-4 text-lg leading-relaxed text-muted sm:text-xl">
          {children}
        </p>
      )}
    </div>
  );
}

export function TagList({ tags, label = "Built with" }: { tags: string[]; label?: string }) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li key={tag} className="rounded-full bg-surface px-3 py-1 text-sm text-muted ring-1 ring-line">
          {tag}
        </li>
      ))}
    </ul>
  );
}

const textLink = "group inline-flex items-center gap-0.5 text-accent underline-offset-4 hover:underline";
const chevron = <ChevronRightIcon className="mt-px text-[0.85em] transition-transform group-hover:translate-x-0.5" />;

// Apple-style text link: blue, with a small chevron. `hidden` is extra context for screen readers.
export function ChevronLink({ href, children, hidden }: { href: string; children: ReactNode; hidden?: string }) {
  const content = (
    <>
      {children}
      {hidden && <span className="sr-only"> {hidden}</span>}
      {chevron}
    </>
  );
  return href.startsWith("/") ? (
    <Link href={href} className={textLink}>
      {content}
    </Link>
  ) : (
    <a href={href} className={textLink}>
      {content}
    </a>
  );
}

export function CodeLink({ href, name }: { href: string; name: string }) {
  return (
    <ChevronLink href={href} hidden={`for ${name} on GitHub`}>
      Code
    </ChevronLink>
  );
}

export function LiveLink({ href, name, label = "Live demo" }: { href: string; name: string; label?: string }) {
  return (
    <ChevronLink href={href} hidden={`of ${name}`}>
      {label}
    </ChevronLink>
  );
}

export const buttonClass =
  "inline-flex items-center gap-2 rounded-full bg-accent-bg px-5 py-2.5 font-medium text-accent-ink transition hover:brightness-110 active:scale-[0.98]";
