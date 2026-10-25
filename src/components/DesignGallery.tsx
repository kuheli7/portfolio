import type { CSSProperties } from "react";
import { designSites } from "@/data/projects";
import { DemoVideo } from "./DemoVideo";
import { PhoneFrame } from "./Frames";
import { CodeLink, LiveLink, SectionHeading } from "./ui";

export function DesignGallery() {
  return (
    <section aria-labelledby="design-title" className="tone-dark overflow-hidden py-24 sm:py-32">
      <div className="px-4 sm:px-6">
        <SectionHeading id="design-title" title="Websites for small food businesses.">
          Mobile-first sites for three fictional brands, made to show local cafés and sweet shops what their own site
          could look like. Ordering hands off to WhatsApp, so there’s no backend and nothing to pay for.
        </SectionHeading>
      </div>
      {/*
        On phones the three sites scroll sideways, narrow enough that the next one peeks in; from md up they sit
        in a row. `relative` keeps the screen-reader-only link text (absolutely positioned) inside the scroller
        instead of widening the page.
      */}
      <ul
        data-reveal="children"
        className="relative mx-auto flex max-w-6xl snap-x snap-mandatory gap-4 overflow-x-auto px-[max(1rem,calc(50vw-min(8rem,37.5vw)))] pb-4 md:grid md:grid-cols-3 md:gap-10 md:overflow-visible md:px-6"
      >
        {designSites.map((site, i) => (
          <li
            key={site.name}
            style={{ "--i": i } as CSSProperties}
            className="flex w-[16rem] max-w-[75vw] shrink-0 snap-center flex-col items-center text-center md:w-auto md:max-w-none"
          >
            <div className="w-full max-w-[17rem]">
              <PhoneFrame>
                <DemoVideo {...site.video} />
              </PhoneFrame>
            </div>
            <h3 className="mt-8 text-2xl font-semibold tracking-tight">{site.name}</h3>
            <p className="mt-1 font-medium text-muted">{site.tagline}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">{site.summary}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
              <LiveLink href={site.live} name={site.name} label="Visit site" />
              <CodeLink href={site.code} name={site.name} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
