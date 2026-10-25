import Link from "next/link";
import { profile } from "@/data/profile";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/#work", label: "Work", wide: false },
  { href: "/#about", label: "About", wide: true },
  { href: "/#contact", label: "Contact", wide: true },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-xl backdrop-saturate-150">
      <nav aria-label="Main" className="mx-auto flex h-12 max-w-5xl items-center gap-1 px-4 text-sm sm:gap-3 sm:px-6">
        <Link href="/" className="mr-auto font-semibold tracking-tight">
          Kuheli Begum
        </Link>
        <ul className="flex items-center">
          {links.map((link) => (
            <li key={link.href} className={link.wide ? "hidden sm:block" : undefined}>
              <Link href={link.href} className="px-2.5 py-2 text-fg/80 transition-colors hover:text-fg">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <a
          href={profile.resume}
          target="_blank"
          rel="noopener"
          className="rounded-full bg-accent-bg px-3 py-1 text-xs font-medium text-accent-ink transition hover:brightness-110"
        >
          Resume
        </a>
        <ThemeToggle />
      </nav>
    </header>
  );
}
