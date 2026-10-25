import Link from "next/link";
import { caseStudies, type CaseStudy } from "@/data/projects";
import { ArrowRightIcon } from "./icons";
import { ProjectMedia } from "./ProjectMedia";
import { CodeLink, LiveLink, SectionHeading, TagList } from "./ui";

export function FeaturedWork() {
  return (
    <section aria-labelledby="work-title" id="work" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
      <SectionHeading id="work-title" eyebrow="Selected work" title="Things I’ve built recently">
        Four projects I can talk about for an hour each. Every number below comes with how it was measured, including
        the parts that aren’t finished yet.
      </SectionHeading>
      <div data-reveal="children" className="grid gap-10">
        {caseStudies.map((project, i) => (
          <FeaturedCard key={project.slug} project={project} flip={i % 2 === 1} />
        ))}
      </div>
    </section>
  );
}

function FeaturedCard({ project, flip }: { project: CaseStudy; flip: boolean }) {
  const titleId = `${project.slug}-title`;
  // A diagram needs the text that introduces it, so on small screens it goes below the text.
  const diagram = project.media.kind === "voicenav";
  const mediaOrder = diagram ? (flip ? "order-last" : "order-last lg:order-none") : flip ? "lg:order-last" : undefined;
  return (
    <article
      aria-labelledby={titleId}
      className="grid items-center gap-6 rounded-3xl border border-line bg-surface/50 p-4 sm:p-6 lg:grid-cols-2 lg:gap-10 lg:p-8"
    >
      <div className={mediaOrder}>
        <ProjectMedia media={project.media} />
      </div>
      <div>
        <p className="text-sm font-semibold text-accent">
          {project.kind} · {project.period}
        </p>
        <h3 id={titleId} className="mt-1 font-display text-3xl font-semibold">
          {project.name}
        </h3>
        <p className="mt-2 text-lg font-semibold text-fg/90">{project.tagline}</p>
        <p className="mt-3 leading-relaxed text-muted">{project.summary}</p>

        {project.stats.length > 0 && (
          <dl className="mt-5 grid gap-2.5 sm:grid-cols-3">
            {project.stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse rounded-2xl bg-surface-2/70 p-3">
                <dt className="mt-1 text-xs leading-snug text-muted">{stat.label}</dt>
                <dd className="font-display text-xl font-semibold text-accent">{stat.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {project.highlights && (
          <ul className="mt-5 flex flex-wrap gap-2">
            {project.highlights.map((item) => (
              <li key={item} className="rounded-full bg-surface-2/70 px-3 py-1 text-sm font-semibold text-accent">
                {item}
              </li>
            ))}
          </ul>
        )}
        {project.status && <p className="mt-3 text-sm text-muted italic">{project.status}</p>}

        <div className="mt-5">
          <TagList tags={project.stack} />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-accent-bg px-4 py-1.5 text-sm font-semibold text-accent-ink transition-transform hover:-translate-y-0.5"
          >
            Read the case study <ArrowRightIcon />
          </Link>
          <CodeLink href={project.code} name={project.name} />
          {project.live && <LiveLink href={project.live} name={project.name} />}
        </div>
        {project.liveNote && <p className="mt-2 text-xs text-muted">{project.liveNote}</p>}
      </div>
    </article>
  );
}
