import Image from "next/image";
import { profile } from "@/data/profile";
import { ArrowDownIcon, FileIcon, GitHubIcon, LinkedInIcon, MailIcon } from "./icons";

const socials = [
  { href: profile.github, label: "GitHub", Icon: GitHubIcon },
  { href: profile.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
  { href: `mailto:${profile.email}`, label: "Email", Icon: MailIcon },
];

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      <div aria-hidden="true" className="stars pointer-events-none absolute inset-0 light:hidden" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pt-14 pb-20 sm:px-6 md:grid-cols-[1fr_auto] md:pt-24 md:pb-28">
        <div>
          <p className="mb-5 inline-flex rounded-full border border-line bg-surface/60 px-3 py-1 text-sm font-semibold text-muted">
            MCA student · CHRIST University, Bengaluru
          </p>
          <h1 id="hero-title" className="font-display text-5xl font-semibold tracking-tight sm:text-6xl">
            Hi, I’m <span className="text-accent">Kuheli</span>.
          </h1>
          <p className="mt-4 font-display text-2xl text-fg/90 sm:text-3xl">
            I build useful things, then make them a little delightful.
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Full-stack developer working across cloud, data and AI. I like problems where the answer has to be
            right: an AWS bill explained to the cent, a spoken command that clicks the right button, a credit score
            that shows its reasons. Open to full-stack and SDE roles from 2027.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#work"
              className="inline-flex items-center gap-2 rounded-full bg-accent-bg px-5 py-3 font-semibold text-accent-ink transition-transform hover:-translate-y-0.5"
            >
              See my work <ArrowDownIcon />
            </a>
            <a
              href={profile.resume}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-5 py-3 font-semibold transition-colors hover:border-accent hover:text-accent"
            >
              <FileIcon /> Resume (PDF)
            </a>
            <ul className="flex items-center gap-1 sm:ml-2">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    aria-label={label}
                    title={label}
                    className="grid size-11 place-items-center rounded-full text-xl text-muted transition-colors hover:bg-surface hover:text-fg"
                  >
                    <Icon />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <figure className="mx-auto flex flex-col items-center md:mx-0">
          <div className="relative">
            <div aria-hidden="true" className="absolute inset-4 rounded-full bg-haze/40 blur-2xl" />
            <Image
              src="/media/lumi.svg"
              alt="Lumi the baby moth, floating in a round patch of night sky"
              width={220}
              height={220}
              loading="eager"
              className="relative size-44 sm:size-56"
            />
          </div>
          <figcaption className="mt-3 max-w-[15rem] text-center text-sm text-muted">
            This is Lumi. They keep me company on late-night builds.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
