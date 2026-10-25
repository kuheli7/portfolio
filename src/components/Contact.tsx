import Image from "next/image";
import { profile } from "@/data/profile";
import { GitHubIcon, LinkedInIcon, MailIcon } from "./icons";

export function Contact() {
  return (
    <section aria-labelledby="contact-title" id="contact" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-10 pb-24 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-line bg-surface/60 px-5 py-12 text-center sm:px-10">
        <Image src="/media/lumi.svg" alt="" width={96} height={96} className="mx-auto mb-4 size-20" />
        <h2 id="contact-title" className="font-display text-3xl font-semibold sm:text-4xl">
          Say hello
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-lg text-muted">
          I’m open to full-stack and SDE roles from 2027, and happy to talk about cloud, data or AI work. Email is the
          quickest way to reach me.
        </p>
        <a
          href={`mailto:${profile.email}`}
          className="mt-6 inline-flex max-w-full items-center gap-2 rounded-full bg-accent-bg px-5 py-3 font-semibold break-all text-accent-ink transition-transform hover:-translate-y-0.5 sm:text-lg"
        >
          <MailIcon className="shrink-0" /> {profile.email}
        </a>
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
      </div>
    </section>
  );
}
