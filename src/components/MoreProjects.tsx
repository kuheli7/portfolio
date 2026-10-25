import type { CSSProperties } from "react";
import { smallProjects, type SmallProject } from "@/data/projects";
import { DemoVideo } from "./DemoVideo";
import { BrowserFrame, hostOf } from "./Frames";
import { CodeLink, LiveLink, SectionHeading } from "./ui";

export function MoreProjects() {
  return (
    <section aria-labelledby="more-title" className="px-4 py-24 sm:px-6 sm:py-32">
      <SectionHeading id="more-title" title="Smaller builds, same care." />
      <ul data-reveal="children" className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-6">
        {smallProjects.map((project, i) => (
          <ProjectCard key={project.name} project={project} index={i} />
        ))}
      </ul>
    </section>
  );
}

// Projects with a demo take half a row; the rest share a row in threes.
function ProjectCard({ project, index }: { project: SmallProject; index: number }) {
  const wide = Boolean(project.media);
  return (
    <li
      style={{ "--i": index % 3 } as CSSProperties}
      className={`group flex flex-col overflow-hidden rounded-3xl bg-bg-alt p-6 sm:p-8 ${wide ? "lg:col-span-3" : "lg:col-span-2"}`}
    >
      <p className="text-sm font-semibold text-muted">{project.kind}</p>
      <h3 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{project.name}</h3>
      <p className="mt-3 flex-1 leading-relaxed text-muted">{project.summary}</p>
      <p className="mt-4 text-sm text-muted">
        <span className="sr-only">Built with: </span>
        {project.stack.join(" · ")}
      </p>
      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
        <CodeLink href={project.code} name={project.name} />
        {project.live && <LiveLink href={project.live} name={project.name} label="Live site" />}
      </div>
      {project.liveNote && <p className="mt-2 text-xs text-muted">{project.liveNote}</p>}
      {project.media && (
        <div className="mt-8 transition-transform duration-500 ease-out group-hover:scale-[1.015]">
          <BrowserFrame address={project.live ? hostOf(project.live) : undefined}>
            <DemoVideo {...project.media} />
          </BrowserFrame>
        </div>
      )}
    </li>
  );
}
