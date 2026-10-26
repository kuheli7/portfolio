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

      <nav aria-label="On this page" className="sticky top-[4.5rem] z-20 mt-8 overflow-x-auto rounded-full bg-bg/70 py-1.5 backdrop-blur">
        <ul className="flex gap-2 text-sm font-semibold whitespace-nowrap">
          {JUMPS.map(([id, label]) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className="inline-block rounded-full border border-line px-3 py-1 text-muted transition-colors hover:border-accent hover:text-accent"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-6">
        <ProjectMedia media={project.media} sizes="(min-width: 896px) 848px, 100vw" eager />
      </div>

      <Section id="problem" title="The problem">
        <p className="text-lg leading-relaxed text-muted">{project.problem}</p>
      </Section>

      <Section id="how" title="How it works">
        <Flow steps={project.approach} />
      </Section>

      <Section id="results" title={project.resultsTitle ?? "Results"}>
        <BulletList items={project.results} />
      </Section>

      <Section id="limits" title="Limits and what’s not proven yet">
        <BulletList items={project.limits} />
      </Section>

      <Section id="stack" title="Built with">
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
          className="group max-w-sm rounded-2xl border border-line bg-surface/60 p-4 transition-colors hover:border-accent"
        >
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
            Next case study <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
          </span>
          <span className="mt-1 block font-display text-xl font-semibold">{next.name}</span>
          <span className="mt-1 block text-sm leading-snug text-muted">{next.tagline}</span>
        </Link>
      </nav>
    </article>
  );
}

const JUMPS = [
  ["problem", "Problem"],
  ["how", "How it works"],
  ["results", "Results"],
  ["limits", "Limits"],
  ["stack", "Built with"],
] as const;

// Steps as a flow: a one-line chain to skim, then each step on a line that connects it to the next.
function Flow({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <>
      <ol aria-hidden="true" className="mb-8 flex flex-wrap items-center gap-x-1.5 gap-y-2 text-sm font-semibold">
        {steps.map((step, i) => (
          <li key={step.title} className="flex items-center gap-1.5">
            <span className="rounded-full border border-accent/50 bg-accent/10 px-3 py-1 text-accent">{step.title}</span>
            {i < steps.length - 1 && <span className="text-muted">→</span>}
          </li>
        ))}
      </ol>
      <ol className="relative space-y-4 before:absolute before:top-4 before:bottom-4 before:left-[1.05rem] before:w-0.5 before:bg-line">
        {steps.map((step, i) => (
          <li key={step.title} className="relative flex gap-4">
            <span
              aria-hidden="true"
              className="relative z-10 grid size-9 shrink-0 place-items-center rounded-full bg-accent-bg font-display text-base font-semibold text-accent-ink ring-4 ring-bg"
            >
              {i + 1}
            </span>
            <div className="flex-1 rounded-2xl border border-line bg-surface/60 p-4 transition-colors hover:border-accent/60">
              <p className="font-display text-lg font-semibold">{step.title}</p>
              <p className="mt-1.5 leading-relaxed text-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mt-14 scroll-mt-32">
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
