import { profile } from "@/data/profile";
import { MailIcon } from "./icons";
import { ChevronLink, buttonClass } from "./ui";

export function Contact() {
  return (
    <section aria-labelledby="contact-title" id="contact" className="tone-dark px-4 py-28 text-center sm:px-6 sm:py-40">
      <h2
        id="contact-title"
        data-reveal
        className="text-gradient grad-hero mx-auto w-fit pb-2 text-6xl font-semibold tracking-[-0.04em] sm:text-8xl"
      >
        Say hello.
      </h2>
      <p data-reveal className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
        I’m open to full-stack and SDE roles from 2027, and happy to talk about cloud, data or AI work. Email is the
        quickest way to reach me.
      </p>
      <div data-reveal>
        <a href={`mailto:${profile.email}`} className={`${buttonClass} mt-9 max-w-full px-6 py-3 break-all sm:text-lg`}>
          <MailIcon className="shrink-0" /> {profile.email}
        </a>
        <div className="mt-6 flex justify-center gap-x-8 text-lg">
          <ChevronLink href={profile.linkedin}>LinkedIn</ChevronLink>
          <ChevronLink href={profile.github}>GitHub</ChevronLink>
        </div>
      </div>
    </section>
  );
}
