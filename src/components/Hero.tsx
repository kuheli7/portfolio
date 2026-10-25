import Image from "next/image";
import type { CSSProperties } from "react";
import { profile } from "@/data/profile";
import { designSites, smallProjects } from "@/data/projects";
import { BrowserFrame, PhoneFrame, hostOf } from "./Frames";
import { ChevronRightIcon, GitHubIcon, LinkedInIcon, MailIcon } from "./icons";
import { buttonClass } from "./ui";

const socials = [
  { href: profile.github, label: "GitHub", Icon: GitHubIcon },
  { href: profile.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
  { href: `mailto:${profile.email}`, label: "Email", Icon: MailIcon },
];

// Staggers the hero's entrance animation (.rise in globals.css).
const order = (i: number) => ({ "--i": i }) as CSSProperties;

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="overflow-hidden pt-14 pb-24 text-center sm:pt-24 sm:pb-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <p className="rise text-base font-semibold text-muted sm:text-lg" style={order(0)}>
          MCA student · CHRIST University, Bengaluru
        </p>
        <h1
          id="hero-title"
          className="rise mt-3 text-6xl font-semibold tracking-[-0.035em] sm:text-8xl"
          style={order(1)}
        >
          Hi, I’m Kuheli.
        </h1>
        <p
          className="rise text-gradient grad-hero mx-auto mt-4 max-w-3xl pb-1 text-3xl leading-tight font-semibold tracking-[-0.02em] sm:text-5xl"
          style={order(2)}
        >
          I build useful things, then make them a little delightful.
        </p>
        <p className="rise mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl" style={order(3)}>
          Full-stack developer across cloud, data and AI, drawn to problems where the answer has to be right. Open to
          full-stack and SDE roles from 2027.
        </p>
        <div className="rise mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-4" style={order(4)}>
          <a href="#work" className={`${buttonClass} px-6 py-3 text-lg`}>
            See my work
          </a>
          <a
            href={profile.resume}
            target="_blank"
            rel="noopener"
            className="group inline-flex items-center gap-0.5 text-lg text-accent underline-offset-4 hover:underline"
          >
            Resume (PDF)
            <ChevronRightIcon className="mt-px text-[0.85em] transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
        <ul className="rise mt-6 flex justify-center gap-1" style={order(5)}>
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
      <Stage />
    </section>
  );
}

// A dashboard and two phone sites, as a preview of the work further down.
function Stage() {
  const dashboard = smallProjects.find((project) => project.name === "Sales Pulse");
  const [gulab, sip] = designSites;
  if (!dashboard?.media || !dashboard.live) return null;
  return (
    <div className="rise relative mx-auto mt-14 max-w-5xl px-6 sm:mt-20 sm:px-16" style={order(6)}>
      <div className="stage-window">
        <BrowserFrame address={hostOf(dashboard.live)}>
          <Image
            src={dashboard.media.poster}
            alt="Sales Pulse, a sales dashboard with monthly, product line and country charts"
            width={dashboard.media.width}
            height={dashboard.media.height}
            sizes="(min-width: 1024px) 832px, 90vw"
            preload
            className="h-auto w-full"
          />
        </BrowserFrame>
      </div>
      {[
        { site: sip, side: "stage-left left-0 sm:left-2" },
        { site: gulab, side: "stage-right right-0 sm:right-2" },
      ].map(({ site, side }) => (
        <div key={site.name} className={`absolute -bottom-10 w-[22%] sm:-bottom-14 sm:w-[19%] ${side}`}>
          <PhoneFrame>
            <Image
              src={site.screenshot.src}
              alt={`${site.name} on a phone`}
              width={site.screenshot.width}
              height={site.screenshot.height}
              sizes="(min-width: 1024px) 190px, 22vw"
              className="aspect-[9/19.5] h-auto w-full object-cover object-top"
            />
          </PhoneFrame>
        </div>
      ))}
    </div>
  );
}
