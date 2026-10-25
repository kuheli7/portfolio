import type { CSSProperties } from "react";

const steps = [
  { title: "You say", body: "“open the cheapest one”" },
  { title: "Rules parser", body: "Common phrases, handled instantly with no AI" },
  { title: "Page scan", body: "Names every link and button the way a screen reader does" },
  { title: "Resolver", body: "Code works out “second” and “cheapest”" },
  { title: "Local LLM", body: "Qwen2.5-3B picks a label that is on the page" },
  { title: "Validate, then click", body: "“Buy”, “pay” and “delete” wait for a spoken yes" },
];

// Stands in for a screenshot: real-site captures show personal account details.
// The steps appear one after another, in the order a command travels through them.
export function VoiceNavPipeline() {
  return (
    <figure className="rounded-3xl bg-surface p-4 ring-1 ring-line sm:p-8">
      <figcaption className="mb-5 text-center text-sm font-semibold text-muted sm:text-base">
        How a spoken command travels
      </figcaption>
      <ol data-reveal="children" className="grid gap-3 text-left sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, i) => (
          <li key={step.title} style={{ "--i": i } as CSSProperties} className="rounded-2xl bg-surface-2 p-4 sm:p-5">
            <span aria-hidden="true" className="text-gradient grad-pink text-2xl font-semibold tracking-tight">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="mt-2 block font-semibold">{step.title}</span>
            <span className="mt-1 block text-sm leading-relaxed text-muted">{step.body}</span>
          </li>
        ))}
      </ol>
    </figure>
  );
}
