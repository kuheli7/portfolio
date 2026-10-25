import Link from "next/link";
import type { CSSProperties } from "react";
import { caseStudies, type CaseStudy } from "@/data/projects";
import { hostOf } from "./Frames";
import { ProjectMedia } from "./ProjectMedia";
import { CodeLink, LiveLink, SectionHeading, buttonClass } from "./ui";

export function FeaturedWork() {
  return (
    <section aria-labelledby="work-title" id="work">
      <div className="px-4 pt-8 sm:px-6 sm:pt-12">
        <SectionHeading id="work-title" title="Selected work.">
          Four projects I can talk about for an hour each. Every number comes with how it was measured, including the
          parts that aren’t finished yet.
        </SectionHeading>
      </div>
      {caseStudies.map((project, i) => (
        <Feature key={project.slug} project={project} dark={i % 2 === 1} />
      ))}
    </section>
  );
}

// One full-width panel per project, alternating light grey and black like a product page.
function Feature({ project, dark }: { project: CaseStudy; dark: boolean }) {
  const titleId = `${project.slug}-title`;
  const gradient = `text-gradient grad-${project.accent}`;
  return (
    <article aria-labelledby={titleId} className={`overflow-hidden py-20 sm:py-28 ${dark ? "tone-dark" : "bg-bg-alt"}`}>
      <header className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <p data-reveal className="text-sm font-semibold text-muted sm:text-base">
          {project.kind} · {project.period}
        </p>
        <h3 id={titleId} data-reveal className="mt-2 text-5xl font-semibold tracking-[-0.035em] sm:text-7xl">
          {project.name}
        </h3>
        <p
          data-reveal
          className={`${gradient} mx-auto mt-4 max-w-3xl pb-1 text-2xl leading-tight font-semibold tracking-[-0.02em] sm:text-4xl`}
        >
          {project.tagline}
        </p>
        <div data-reveal className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-4 text-lg">
          <Link href={`/projects/${project.slug}`} className={buttonClass}>
            Read the case study<span className="sr-only"> of {project.name}</span>
          </Link>
          <CodeLink href={project.code} name={project.name} />
          {project.live && <LiveLink href={project.live} name={project.name} />}
        </div>
        {project.liveNote && <p className="mt-3 text-sm text-muted">{project.liveNote}</p>}
      </header>

      <div data-reveal className="mx-auto mt-14 max-w-5xl px-4 sm:mt-16 sm:px-6">
        <div className="zoom-in">
          <ProjectMedia media={project.media} address={project.live ? hostOf(project.live) : undefined} />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
        {project.stats.length > 0 && (
          <dl data-reveal="children" className="mt-14 grid gap-10 sm:mt-16 sm:grid-cols-3 sm:gap-8">
            {project.stats.map((stat, i) => (
              <div key={stat.label} style={{ "--i": i } as CSSProperties} className="flex flex-col-reverse">
                <dt className="mx-auto mt-2 max-w-[16rem] text-sm leading-snug text-muted sm:text-base">{stat.label}</dt>
                <dd className={`${gradient} self-center text-4xl font-semibold tracking-[-0.03em] sm:text-5xl`}>
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
        {project.highlights && (
          <ul data-reveal="children" className="mt-14 flex flex-wrap justify-center gap-2.5 sm:mt-16">
            {project.highlights.map((item, i) => (
              <li
                key={item}
                style={{ "--i": i } as CSSProperties}
                className="rounded-full bg-surface px-4 py-2 text-sm font-medium ring-1 ring-line sm:text-base"
              >
                {item}
              </li>
            ))}
          </ul>
        )}
        {project.status && <p className="mt-10 text-sm text-muted">{project.status}</p>}
        <p className="mx-auto mt-4 max-w-2xl text-sm text-muted">
          <span className="sr-only">Built with: </span>
          {project.stack.join(" · ")}
        </p>
      </div>
    </article>
  );
}
