import Image from "next/image";
import Link from "next/link";
import { profile } from "@/data/profile";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/#work", label: "Work", wide: false },
  { href: "/play", label: "Play", wide: false },
  { href: "/#about", label: "About", wide: true },
  { href: "/#contact", label: "Contact", wide: true },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-md">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center gap-1 px-4 sm:gap-2 sm:px-6">
        <Link href="/" className="mr-auto flex items-center gap-2 rounded-full font-display text-lg font-semibold">
          <Image src="/media/lumi.svg" alt="" width={34} height={34} loading="eager" />
          Kuheli
        </Link>
        <ul className="flex items-center text-sm font-semibold">
          {links.map((link) => (
            <li key={link.href} className={link.wide ? "hidden sm:block" : undefined}>
              <Link href={link.href} className="rounded-full px-3 py-2 text-muted transition-colors hover:text-fg">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <a
          href={profile.resume}
          target="_blank"
          rel="noopener"
          className="rounded-full border border-line px-3.5 py-1.5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
        >
          Resume
        </a>
        <ThemeToggle />
      </nav>
    </header>
  );
}
