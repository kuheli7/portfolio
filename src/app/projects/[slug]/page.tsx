import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hostOf } from "@/components/Frames";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { ProjectMedia } from "@/components/ProjectMedia";
import { CodeLink, LiveLink, TagList } from "@/components/ui";
import { caseStudies, getCaseStudy } from "@/data/projects";

// Render unknown slugs completely before responding, so notFound() can still send a real 404 status.
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return caseStudies.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getCaseStudy(slug);
  if (!project) return {};
  return {
    title: project.name,
    description: project.tagline,
    // Page-level openGraph replaces the layout's, including the preview image, so the shared fields are repeated here.
    openGraph: {
      type: "article",
      siteName: "Kuheli Begum",
      locale: "en_IN",
      title: `${project.name} · Kuheli Begum`,
      description: project.tagline,
      images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Kuheli Begum, full-stack developer" }],
    },
  };
}

const backLink = "group inline-flex items-center gap-0.5 text-accent underline-offset-4 hover:underline";

export default async function CaseStudyPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getCaseStudy(slug);
  if (!project) notFound();

  const next = caseStudies[(caseStudies.indexOf(project) + 1) % caseStudies.length];
  const gradient = `text-gradient grad-${project.accent}`;

  return (
    <article className="pb-24">
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <Link href="/#work" className={`${backLink} text-sm`}>
          <ChevronLeftIcon className="mt-px text-[0.85em] transition-transform group-hover:-translate-x-0.5" /> All
          projects
        </Link>
      </div>

      <header className="mx-auto max-w-4xl px-4 pt-10 text-center sm:px-6 sm:pt-16">
        <p className="rise text-sm font-semibold text-muted sm:text-base" style={order(0)}>
          {project.kind} · {project.period}
        </p>
        <h1 className="rise mt-2 text-5xl font-semibold tracking-[-0.035em] sm:text-7xl" style={order(1)}>
          {project.name}
        </h1>
        <p
          className={`rise ${gradient} mx-auto mt-4 max-w-3xl pb-1 text-2xl leading-tight font-semibold tracking-[-0.02em] sm:text-4xl`}
          style={order(2)}
        >
          {project.tagline}
        </p>
        <p className="rise mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl" style={order(3)}>
          {project.summary}
        </p>
        <div className="rise mt-7 flex flex-wrap justify-center gap-x-7 gap-y-3 text-lg" style={order(4)}>
          <CodeLink href={project.code} name={project.name} />
          {project.live && <LiveLink href={project.live} name={project.name} />}
        </div>
        {project.liveNote && <p className="mt-3 text-sm text-muted">{project.liveNote}</p>}
      </header>

      <div className="rise mx-auto mt-14 max-w-5xl px-4 sm:mt-16 sm:px-6" style={order(5)}>
        <ProjectMedia media={project.media} address={project.live ? hostOf(project.live) : undefined} />
      </div>

      {project.stats.length > 0 && (
        <dl data-reveal="children" className="mx-auto mt-16 grid max-w-5xl gap-10 px-4 text-center sm:grid-cols-3 sm:gap-8 sm:px-6">
          {project.stats.map((stat, i) => (
            <div key={stat.label} style={order(i)} className="flex flex-col-reverse">
              <dt className="mx-auto mt-2 max-w-[16rem] text-sm leading-snug text-muted sm:text-base">{stat.label}</dt>
              <dd className={`${gradient} self-center text-4xl font-semibold tracking-[-0.03em] sm:text-5xl`}>
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {project.status && <p className="mx-auto mt-10 max-w-2xl px-4 text-center text-muted">{project.status}</p>}

      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Section title="The problem.">
          <p className="text-xl leading-relaxed text-muted sm:text-2xl sm:leading-relaxed">{project.problem}</p>
        </Section>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Section title="How it works.">
          <ol data-reveal="children" className="grid gap-4 sm:grid-cols-2">
            {project.approach.map((step, i) => (
              <li key={step.title} style={order(i % 2)} className="rounded-3xl bg-bg-alt p-6 sm:p-8">
                <span aria-hidden="true" className={`${gradient} text-2xl font-semibold tracking-tight`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </Section>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Section title={`${project.resultsTitle ?? "Results"}.`}>
          <BulletList items={project.results} />
        </Section>

        <Section title="Limits and what’s not proven yet.">
          <BulletList items={project.limits} />
        </Section>

        <Section title="Built with.">
          <TagList tags={project.stack} />
        </Section>

        <nav
          aria-label="More case studies"
          className="mt-20 flex flex-wrap justify-between gap-4 border-t border-line pt-8 text-lg"
        >
          <Link href="/#work" className={backLink}>
            <ChevronLeftIcon className="mt-px text-[0.85em] transition-transform group-hover:-translate-x-0.5" /> All
            projects
          </Link>
          <Link href={`/projects/${next.slug}`} className={backLink}>
            Next: {next.name}
            <ChevronRightIcon className="mt-px text-[0.85em] transition-transform group-hover:translate-x-0.5" />
          </Link>
        </nav>
      </div>
    </article>
  );
}

// Staggers entrance animations (.rise and data-reveal="children" in globals.css).
function order(i: number) {
  return { "--i": i } as CSSProperties;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-20 sm:mt-28">
      <h2 data-reveal className="mb-6 text-3xl font-semibold tracking-[-0.025em] sm:text-5xl">
        {title}
      </h2>
      <div data-reveal>{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-lg leading-relaxed text-muted">
          <span aria-hidden="true" className="mt-3 size-1.5 shrink-0 rounded-full bg-muted" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
