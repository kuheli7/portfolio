import Image from "next/image";
import { profile } from "@/data/profile";
import { CopyEmail } from "./CopyEmail";
import { PenArrow } from "./Doodles";
import { GitHubIcon, LinkedInIcon, MailIcon } from "./icons";
import { Reveal } from "./Reveal";

export function Contact() {
  return (
    <section aria-labelledby="contact-title" id="contact" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-10 pb-24 sm:px-6">
      <Reveal
        className="relative overflow-hidden rounded-3xl border border-line bg-surface/60 px-5 py-12 text-center sm:px-10"
      >
        <Image src="/media/lumi.svg" alt="" width={96} height={96} className="mx-auto mb-4 size-20" />
        <h2 id="contact-title" className="font-display text-3xl font-semibold sm:text-4xl">
          Say hello
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-lg text-muted">
          I’m open to full-stack and SDE roles, and happy to talk about cloud, data or AI work. Email is the quickest
          way to reach me, and I’m glad to talk through timing.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex max-w-full items-center gap-2 rounded-full bg-accent-bg px-5 py-3 font-semibold break-all text-accent-ink transition-transform hover:-translate-y-0.5 sm:text-lg"
          >
            <MailIcon className="shrink-0" /> {profile.email}
          </a>
          <span className="relative">
            <CopyEmail email={profile.email} className="py-3" />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-full ml-1 hidden w-52 -translate-y-full items-start lg:flex"
            >
              <PenArrow className="h-9 w-16 shrink-0 -scale-x-100" delay="0.6s" />
              <span className="-mt-3 -rotate-6 font-hand text-xl leading-tight whitespace-nowrap text-accent">
                one click, no typos
              </span>
            </span>
          </span>
        </div>
        <div className="mt-5 flex justify-center gap-3">
          <a
            href={profile.linkedin}
            className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 font-semibold transition-colors hover:border-accent hover:text-accent"
          >
            <LinkedInIcon /> LinkedIn
          </a>
          <a
            href={profile.github}
            className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 font-semibold transition-colors hover:border-accent hover:text-accent"
          >
            <GitHubIcon /> GitHub
          </a>
        </div>
      </Reveal>
    </section>
  );
}
