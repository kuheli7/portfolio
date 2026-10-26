import type { CSSProperties } from "react";
import { profile } from "@/data/profile";
import { CodeCard } from "./CodeCard";
import { PenCircle } from "./Doodles";
import { ArrowDownIcon, FileIcon, GitHubIcon, LinkedInIcon, MailIcon } from "./icons";
import { lumiHeroSvg } from "./lumi-hero-svg";
import { LumiDrift } from "./LumiDrift";

const socials = [
  { href: profile.github, label: "GitHub", Icon: GitHubIcon },
  { href: profile.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
  { href: `mailto:${profile.email}`, label: "Email", Icon: MailIcon },
];

// Fixed spots so the server and browser draw the same sky. [left %, top %, size px, colour]
const stars: [number, number, number, string][] = [
  [6, 18, 2, "#ffe7a0"],
  [14, 72, 1.5, "#fef7ed"],
  [22, 34, 1, "#fef7ed"],
  [31, 9, 2, "#f6cf6a"],
  [38, 88, 1.5, "#e7cef6"],
  [45, 52, 1, "#fef7ed"],
  [52, 14, 1.5, "#fef7ed"],
  [58, 78, 2, "#ffe7a0"],
  [64, 36, 1, "#e7cef6"],
  [70, 6, 1.5, "#fef7ed"],
  [76, 62, 2.5, "#f6cf6a"],
  [83, 24, 1, "#fef7ed"],
  [88, 84, 1.5, "#e7cef6"],
  [93, 44, 2, "#ffe7a0"],
  [97, 12, 1, "#fef7ed"],
  [3, 50, 1.5, "#e7cef6"],
];

const rise = (i: number) => ({ "--i": i }) as CSSProperties;

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 light:hidden">
        {stars.map(([left, top, size, colour], i) => (
          <span
            key={i}
            className="sky-star"
            style={{ left: `${left}%`, top: `${top}%`, "--s": `${size}px`, "--c": colour, "--i": i } as CSSProperties}
          />
        ))}
      </div>
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-20 sm:px-6 md:pt-20 md:pb-24 lg:grid-cols-[1fr_auto]">
        <div>
          <p
            className="rise mb-5 inline-flex rounded-full border border-line bg-surface/60 px-3 py-1 text-sm font-semibold text-muted"
            style={rise(0)}
          >
            MCA student · CHRIST University, Bengaluru
          </p>
          <h1 id="hero-title" className="rise font-display text-5xl font-semibold tracking-tight sm:text-6xl" style={rise(1)}>
            Hi, I’m <span className="text-accent">Kuheli</span>.
          </h1>
          <p className="rise mt-4 font-display text-2xl text-fg/90 sm:text-3xl" style={rise(2)}>
            I build useful things, then make them a little delightful.
          </p>
          <p className="rise mt-6 max-w-2xl text-lg leading-relaxed text-muted" style={rise(3)}>
            Full-stack developer working across cloud, data and AI. I like problems where the answer has to be
            right: an AWS bill explained to the cent, a spoken command that clicks the right button, a credit score
            that shows its reasons. Open to <PenCircle>full-stack and SDE roles</PenCircle>.
          </p>
          <div className="rise mt-8 flex flex-wrap items-center gap-3" style={rise(4)}>
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

        <div className="mx-auto w-full max-w-[25rem] lg:mx-0 lg:w-[25rem]">
          <CodeCard className="rise rotate-[1.5deg]" style={rise(3)} />
          <figure className="rise relative -mt-9 flex items-end gap-3 pl-2 sm:-ml-16 sm:pl-0" style={rise(5)}>
            <LumiDrift className="relative size-40 shrink-0 sm:size-44">
              <div aria-hidden="true" className="absolute inset-4 rounded-full bg-haze/40 blur-2xl" />
              <div className="lumi-hero relative size-full" dangerouslySetInnerHTML={{ __html: lumiHeroSvg }} />
            </LumiDrift>
            <figcaption className="mb-3 max-w-[13rem] text-sm text-muted">
              <span className="light:hidden">This is Lumi. They keep me company on late-night builds.</span>
              <span className="hidden light:inline">
                This is Lumi, napping while the sun’s up. Switch to dark mode and their lantern comes on.
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
