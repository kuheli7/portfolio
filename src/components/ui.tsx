import type { ReactNode } from "react";
import { ExternalIcon, GitHubIcon } from "./icons";

export function SectionHeading({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div data-reveal="" className="mb-10 max-w-3xl">
      <p className="mb-2 font-display text-sm font-medium tracking-wider text-accent uppercase">{eyebrow}</p>
      <h2 id={id} className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {children && <div className="mt-4 text-lg leading-relaxed text-muted">{children}</div>}
    </div>
  );
}

export function TagList({ tags, label = "Built with" }: { tags: string[]; label?: string }) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <li key={tag} className="rounded-full border border-line px-2.5 py-0.5 text-xs font-semibold text-muted">
          {tag}
        </li>
      ))}
    </ul>
  );
}

const linkClass =
  "inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent";

export function CodeLink({ href, name }: { href: string; name: string }) {
  return (
    <a href={href} className={linkClass}>
      <GitHubIcon /> Code<span className="sr-only"> for {name} on GitHub</span>
    </a>
  );
}

export function LiveLink({ href, name, label = "Live demo" }: { href: string; name: string; label?: string }) {
  return (
    <a href={href} className={linkClass}>
      <ExternalIcon /> {label}
      <span className="sr-only"> of {name}</span>
    </a>
  );
}
