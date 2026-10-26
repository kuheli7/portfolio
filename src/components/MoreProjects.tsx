import { smallProjects, type SmallProject } from "@/data/projects";
import { DemoVideo } from "./DemoVideo";
import { CodeLink, LiveLink, SectionHeading, TagList } from "./ui";
import { Reveal } from "./Reveal";

export function MoreProjects() {
  return (
    <section aria-labelledby="more-title" id="more" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
      <SectionHeading id="more-title" eyebrow="More projects" title="Smaller builds, same care" />
      <Reveal as="ul" kind="children" className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {smallProjects.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </Reveal>
    </section>
  );
}

function ProjectCard({ project }: { project: SmallProject }) {
  // The one card with a demo spans the full row, with the video beside the text on wide screens.
  const wide = Boolean(project.media);
  return (
    <li
      className={`project-card flex flex-col gap-5 rounded-3xl border border-line bg-surface/50 p-5 ${
        wide ? "md:col-span-2 lg:col-span-4 lg:grid lg:grid-cols-2 lg:items-center lg:gap-8 lg:p-6" : ""
      }`}
    >
      {project.media && (
        <div className="overflow-hidden rounded-2xl border border-line">
          <DemoVideo {...project.media} />
        </div>
      )}
      <div className="flex flex-1 flex-col">
        <p className="text-sm font-semibold text-accent">{project.kind}</p>
        <h3 className="mt-1 font-display text-2xl font-semibold">{project.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{project.summary}</p>
        <div className="mt-4">
          <TagList tags={project.stack} />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <CodeLink href={project.code} name={project.name} />
          {project.live && <LiveLink href={project.live} name={project.name} label="Live" />}
        </div>
        {project.liveNote && <p className="mt-2 text-xs text-muted">{project.liveNote}</p>}
      </div>
    </li>
  );
}
