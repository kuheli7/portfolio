import Image from "next/image";
import { designSites } from "@/data/projects";
import { CodeLink, LiveLink, SectionHeading } from "./ui";

export function DesignGallery() {
  return (
    <section aria-labelledby="design-title" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading id="design-title" eyebrow="Design work" title="Websites for small food businesses">
        Mobile-first sites for three fictional brands, made to show local cafés and sweet shops what their own site
        could look like. Ordering hands off to WhatsApp, so there’s no backend and nothing to pay for.
      </SectionHeading>
      <ul className="grid gap-8 md:grid-cols-3">
        {designSites.map((site) => (
          <li key={site.name} className="flex flex-col">
            <div className="relative mb-8 mr-4">
              <Image
                src={site.desktop.src}
                alt={`${site.name} home page on a desktop screen`}
                width={site.desktop.width}
                height={site.desktop.height}
                sizes="(min-width: 768px) 360px, 100vw"
                className="aspect-[16/10] w-full rounded-xl border border-line object-cover object-top"
              />
              <Image
                src={site.mobile.src}
                alt={`${site.name} home page on a phone`}
                width={site.mobile.width}
                height={site.mobile.height}
                sizes="120px"
                className="absolute -right-4 -bottom-8 aspect-[9/19] w-[28%] rounded-2xl border-4 border-bg object-cover object-top shadow-xl"
              />
            </div>
            <h3 className="font-display text-2xl font-semibold">{site.name}</h3>
            <p className="text-sm font-semibold text-accent">{site.tagline}</p>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{site.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <LiveLink href={site.live} name={site.name} label="Visit site" />
              <CodeLink href={site.code} name={site.name} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
