import { SectionHeading } from "./ui";

const skills = [
  { group: "Languages", items: "Java, Python, JavaScript, TypeScript, C" },
  { group: "Front end", items: "React, Next.js, Tailwind CSS, HTML, CSS" },
  { group: "Back end", items: "Node.js, Express, FastAPI, Flask, REST APIs" },
  { group: "Data and AI", items: "pandas, scikit-learn, LightGBM, SHAP, Ollama (local LLMs)" },
  { group: "Databases", items: "PostgreSQL, MongoDB, MySQL" },
  { group: "Cloud and tools", items: "AWS (Lambda, S3), Docker, GitHub Actions, Git" },
];

type Entry = { title: string; place: string; when: string; detail?: string };

const experience: Entry[] = [
  { title: "Back End Developer Intern", place: "Springer Capital · remote, part-time", when: "Oct 2026 – present" },
];

const education: Entry[] = [
  {
    title: "Master of Computer Applications (MCA)",
    place: "CHRIST (Deemed to be University), Bengaluru",
    when: "2025 – 2027",
    detail: "CGPA 9.2 / 10 so far",
  },
  {
    title: "M.A. Economics",
    place: "Visva-Bharati University, West Bengal",
    when: "2023 – 2025",
    detail: "CGPA 8.8 / 10 · 2nd rank in the department",
  },
  {
    title: "B.A. (Honours) Economics",
    place: "Visva-Bharati University, West Bengal",
    when: "2020 – 2023",
    detail: "CGPA 8.4 / 10 · 3rd rank in the department",
  },
];

const awards: Entry[] = [
  { title: "2nd place, UI/UX Design Competition", place: "Revelations 2026", when: "2026" },
  {
    title: "3rd place, Coding and Debugging Competition",
    place: "SHELLS 2026, Kristu Jayanti (Deemed to be University)",
    when: "Feb 2026",
  },
];

const certifications: Entry[] = [
  { title: "AWS Academy Graduate: Cloud Foundations", place: "AWS Academy", when: "2026" },
  { title: "Programming in Java", place: "NPTEL", when: "2025" },
  { title: "Data Analytics with Python", place: "NPTEL", when: "2025" },
  { title: "Intermediate Object-Oriented Programming in Python", place: "DataCamp", when: "2025" },
];

const leadership: Entry[] = [
  { title: "Class Representative, MCA", place: "CHRIST (Deemed to be University)", when: "Aug 2025 – Sep 2026" },
  { title: "Documentation Volunteer", place: "Gateways 2025, CHRIST (Deemed to be University)", when: "2025" },
  { title: "Event Coordinator, Alumni Meet", place: "Visva-Bharati University", when: "2024" },
];

export function About() {
  return (
    <section aria-labelledby="about-title" id="about" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
      <SectionHeading id="about-title" eyebrow="About" title="From economics to software" />
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-4 text-lg leading-relaxed text-muted">
          <p>
            I came to software from economics. After a B.A. and an M.A. in Economics at Visva-Bharati University, I
            moved to an MCA at CHRIST University in Bengaluru, where I’m now in my final year.
          </p>
          <p>
            Economics still shows up in what I build: cost attribution, credit risk, sales data, and a habit of
            checking that the numbers actually add up. The rest of the time I’m making small things a little more fun,
            which is how Lumi happened.
          </p>
          <h3 className="pt-4 font-display text-xl font-semibold text-fg">Tools I use</h3>
          <dl className="grid gap-3 text-base sm:grid-cols-2">
            {skills.map((skill) => (
              <div key={skill.group} className="rounded-2xl border border-line bg-surface/50 p-4">
                <dt className="font-semibold text-fg">{skill.group}</dt>
                <dd className="mt-1 text-sm">{skill.items}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="space-y-8">
          <Timeline title="Experience" entries={experience} />
          <Timeline title="Education" entries={education} />
          <Timeline title="Awards" entries={awards} />
          <Timeline title="Certifications" entries={certifications} />
          <Timeline title="Leadership" entries={leadership} />
        </div>
      </div>
    </section>
  );
}

function Timeline({ title, entries }: { title: string; entries: Entry[] }) {
  return (
    <div>
      <h3 className="mb-3 font-display text-xl font-semibold">{title}</h3>
      <ul className="space-y-3 border-l-2 border-line pl-5">
        {entries.map((entry) => (
          <li key={entry.title} className="relative">
            <span aria-hidden="true" className="absolute top-2 -left-[1.6rem] size-2.5 rounded-full bg-accent-bg" />
            <p className="font-semibold">{entry.title}</p>
            <p className="text-sm text-muted">
              {entry.place} · {entry.when}
            </p>
            {entry.detail && <p className="text-sm text-muted">{entry.detail}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
