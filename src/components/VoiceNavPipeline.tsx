const steps = [
  { title: "You say", body: "“open the cheapest one”" },
  { title: "Rules parser", body: "Common phrases, handled instantly with no AI" },
  { title: "Page scan", body: "Names every link and button the way a screen reader does" },
  { title: "Resolver", body: "Code works out “second” and “cheapest”" },
  { title: "Local LLM", body: "Qwen2.5-3B picks a label that is on the page" },
  { title: "Validate, then click", body: "“Buy”, “pay” and “delete” wait for a spoken yes" },
];

// Stands in for a screenshot: real-site captures show personal account details.
export function VoiceNavPipeline() {
  return (
    <figure className="bg-[linear-gradient(160deg,#2c2358,#1b1535)] p-5 text-[#fef7ed] sm:p-6">
      <figcaption className="mb-4 font-display text-sm tracking-wide text-[#f6cf6a] uppercase">
        How a command travels
      </figcaption>
      <ol className="grid gap-2.5 sm:grid-cols-2">
        {steps.map((step, i) => (
          <li key={step.title} className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
            <span
              aria-hidden="true"
              className="grid size-7 shrink-0 place-items-center rounded-full bg-[#f6cf6a] font-display text-sm font-semibold text-[#1b1535]"
            >
              {i + 1}
            </span>
            <span>
              <span className="block font-semibold">{step.title}</span>
              <span className="block text-sm text-[#d9d0ee]">{step.body}</span>
            </span>
          </li>
        ))}
      </ol>
    </figure>
  );
}
