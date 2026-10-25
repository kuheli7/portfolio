import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";
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
      images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Kuheli Begum, software developer, with Lumi the baby moth" }],
    },
  };
}

export default async function CaseStudyPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getCaseStudy(slug);
  if (!project) notFound();

  const next = caseStudies[(caseStudies.indexOf(project) + 1) % caseStudies.length];

  return (
    <article className="mx-auto max-w-4xl px-4 pt-10 pb-20 sm:px-6">
      <Link
        href="/#work"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-accent"
      >
        <ArrowLeftIcon /> All projects
      </Link>

      <header className="mt-8">
        <p className="text-sm font-semibold text-accent">
          {project.kind} · {project.period}
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">{project.name}</h1>
        <p className="mt-4 text-xl leading-snug font-semibold text-fg/90">{project.tagline}</p>
        <p className="mt-4 text-lg leading-relaxed text-muted">{project.summary}</p>

        {project.stats.length > 0 && (
          <dl className="mt-6 grid gap-3 sm:grid-cols-3">
            {project.stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse rounded-2xl border border-line bg-surface/60 p-4">
                <dt className="mt-1 text-sm leading-snug text-muted">{stat.label}</dt>
                <dd className="font-display text-2xl font-semibold text-accent">{stat.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {project.status && <p className="mt-4 text-muted italic">{project.status}</p>}

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <CodeLink href={project.code} name={project.name} />
          {project.live && <LiveLink href={project.live} name={project.name} />}
        </div>
        {project.liveNote && <p className="mt-2 text-xs text-muted">{project.liveNote}</p>}
      </header>

      <div className="mt-10">
        <ProjectMedia media={project.media} sizes="(min-width: 896px) 848px, 100vw" eager />
      </div>

      <Section title="The problem">
        <p className="text-lg leading-relaxed text-muted">{project.problem}</p>
      </Section>

      <Section title="How it works">
        <ol className="grid gap-4 sm:grid-cols-2">
          {project.approach.map((step, i) => (
            <li key={step.title} className="rounded-2xl border border-line bg-surface/50 p-5">
              <p className="flex items-center gap-3 font-display text-lg font-semibold">
                <span
                  aria-hidden="true"
                  className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-bg text-sm text-accent-ink"
                >
                  {i + 1}
                </span>
                {step.title}
              </p>
              <p className="mt-2 leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title={project.resultsTitle ?? "Results"}>
        <BulletList items={project.results} />
      </Section>

      <Section title="Limits and what’s not proven yet">
        <BulletList items={project.limits} />
      </Section>

      <Section title="Built with">
        <TagList tags={project.stack} />
      </Section>

      <nav aria-label="More case studies" className="mt-16 flex flex-wrap justify-between gap-4 border-t border-line pt-8">
        <Link
          href="/#work"
          className="inline-flex items-center gap-1.5 font-semibold text-muted transition-colors hover:text-accent"
        >
          <ArrowLeftIcon /> All projects
        </Link>
        <Link
          href={`/projects/${next.slug}`}
          className="inline-flex items-center gap-1.5 font-semibold text-accent transition-transform hover:translate-x-0.5"
        >
          Next: {next.name} <ArrowRightIcon />
        </Link>
      </nav>
    </article>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-14">
      <h2 className="mb-5 font-display text-2xl font-semibold sm:text-3xl">{title}</h2>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 leading-relaxed text-muted">
          <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent-bg" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
