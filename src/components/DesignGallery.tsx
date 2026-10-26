import { designSites } from "@/data/projects";
import { CodeLink, LiveLink, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";
import { ScrollPreview } from "./ScrollPreview";

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
            {/* The preview is a link to the live site. "Visit site" below does the same for keyboards and screen readers,
                so this one is hidden from both. The animation only plays while it is on screen. */}
            <a
              href={site.live}
              tabIndex={-1}
              aria-hidden="true"
              className="group relative mb-6 block overflow-hidden rounded-xl border border-line transition-colors hover:border-accent"
            >
              <ScrollPreview
                still={site.desktop.src}
                animated={site.scroll}
                width={site.desktop.width}
                height={site.desktop.height}
              />
              <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-full bg-[#1b1535]/85 px-3 py-1 text-xs font-semibold text-[#fef7ed] opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 max-md:opacity-100">
                Open live site <span aria-hidden="true">↗</span>
              </span>
            </a>
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
