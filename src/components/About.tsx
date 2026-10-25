import type { CSSProperties } from "react";
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
  { title: "2nd place, UI/UX Design Competition", place: "Revelations", when: "2026" },
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

const statement =
  "Economics still shows up in what I build: cost attribution, credit risk, sales data, and a habit of checking that the numbers actually add up.";

export function About() {
  return (
    <section aria-labelledby="about-title" id="about" className="px-4 py-24 sm:px-6 sm:py-32">
      <SectionHeading id="about-title" title="From economics to software." />
      <div className="mx-auto max-w-4xl">
        <WordReveal text={statement} />
        <p data-reveal className="mt-8 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
          After a B.A. and an M.A. in Economics at Visva-Bharati University, I moved to an MCA at CHRIST University in
          Bengaluru, where I’m now in my final year.
        </p>
      </div>

      <div className="mx-auto mt-20 max-w-6xl sm:mt-28">
        <h3 data-reveal className="text-center text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
          Tools I use.
        </h3>
        <dl data-reveal="children" className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill, i) => (
            <div key={skill.group} style={{ "--i": i % 3 } as CSSProperties} className="rounded-3xl bg-bg-alt p-6">
              <dt className="text-lg font-semibold">{skill.group}</dt>
              <dd className="mt-1 leading-relaxed text-muted">{skill.items}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Masonry columns, so the short lists fill in beside the long ones. */}
      <div className="mx-auto mt-5 max-w-6xl gap-5 md:columns-2">
        <Timeline title="Experience" entries={experience} />
        <Timeline title="Education" entries={education} />
        <Timeline title="Awards" entries={awards} />
        <Timeline title="Certifications" entries={certifications} />
        <Timeline title="Leadership" entries={leadership} />
      </div>
    </section>
  );
}

// A statement whose words brighten in turn as it scrolls up (.word-reveal in globals.css).
// Screen readers get the sentence in one piece; the per-word spans are visual only.
function WordReveal({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <p className="word-reveal text-3xl leading-tight font-semibold tracking-[-0.02em] sm:text-5xl">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => {
          const from = 10 + (32 * i) / words.length;
          return (
            <span key={i} className="word" style={{ "--from": `${from}%`, "--to": `${from + 8}%` } as CSSProperties}>
              {word}{" "}
            </span>
          );
        })}
      </span>
    </p>
  );
}

function Timeline({ title, entries }: { title: string; entries: Entry[] }) {
  return (
    <div data-reveal className="mb-5 break-inside-avoid rounded-3xl bg-bg-alt p-6 sm:p-8">
      <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
      <ul className="mt-4 divide-y divide-line">
        {entries.map((entry) => (
          <li key={entry.title} className="py-3 first:pt-0 last:pb-0">
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
