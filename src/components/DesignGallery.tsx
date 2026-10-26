import { designSites } from "@/data/projects";
import { CodeLink, LiveLink, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";

export function DesignGallery() {
  return (
    <section aria-labelledby="design-title" id="design" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
      <SectionHeading id="design-title" eyebrow="Design work" title="Websites for small food businesses">
        Mobile-first sites for three fictional brands, made to show local cafés and sweet shops what their own site
        could look like. Ordering hands off to WhatsApp, so there’s no backend and nothing to pay for.
      </SectionHeading>
      <Reveal as="ul" kind="children" className="grid gap-8 md:grid-cols-3">
        {designSites.map((site) => (
          <li key={site.name} className="flex flex-col">
            {/* A plain img keeps the animation (the image optimiser would flatten it). Reduced-motion visitors get the still. */}
            <picture>
              <source media="(prefers-reduced-motion: reduce)" srcSet={site.desktop.src} />
              <img
                src={site.scroll}
                alt={`${site.name} home page, scrolling through the menu and sections`}
                width={720}
                height={450}
                loading="lazy"
                decoding="async"
                className="mb-6 aspect-[16/10] w-full rounded-xl border border-line object-cover object-top"
              />
            </picture>
            <h3 className="font-display text-2xl font-semibold">{site.name}</h3>
            <p className="text-sm font-semibold text-accent">{site.tagline}</p>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{site.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <LiveLink href={site.live} name={site.name} label="Visit site" />
              <CodeLink href={site.code} name={site.name} />
            </div>
          </li>
        ))}
      </Reveal>
    </section>
  );
}
