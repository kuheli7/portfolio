// `tag` marks where the work happens, so the chart can be skimmed by colour alone.
const steps = [
  { title: "You say", body: "“open the cheapest one”", tag: "voice" },
  { title: "Rules parser", body: "Common phrases, handled instantly with no AI", tag: "code" },
  { title: "Page scan", body: "Names every link and button the way a screen reader does", tag: "code" },
  { title: "Resolver", body: "Code works out “second” and “cheapest”", tag: "code" },
  { title: "Local LLM", body: "Qwen2.5-3B picks a label that is on the page, only if the rules couldn’t", tag: "ai" },
  { title: "Validate, then click", body: "“Buy”, “pay” and “delete” wait for a spoken yes", tag: "safe" },
] as const;

// On wide screens the steps snake: 1, 2, 3 left to right, then down and back leftwards through 4, 5, 6, so the bottom row
// reads 6, 5, 4 from the left and the arrows show the way. On phones it is one column, 1 to 6. The list order is always 1 to 6.
const wide = [
  { cell: "sm:col-start-1 sm:row-start-1", arrow: "sm:top-1/2 sm:-right-3.5 sm:-translate-y-1/2", glyph: "→" },
  { cell: "sm:col-start-2 sm:row-start-1", arrow: "sm:top-1/2 sm:-right-3.5 sm:-translate-y-1/2", glyph: "→" },
  { cell: "sm:col-start-3 sm:row-start-1", arrow: "sm:-bottom-3.5 sm:left-1/2 sm:-translate-x-1/2", glyph: "↓" },
  { cell: "sm:col-start-3 sm:row-start-2", arrow: "sm:top-1/2 sm:-left-3.5 sm:-translate-y-1/2", glyph: "←" },
  { cell: "sm:col-start-2 sm:row-start-2", arrow: "sm:top-1/2 sm:-left-3.5 sm:-translate-y-1/2", glyph: "←" },
  { cell: "sm:col-start-1 sm:row-start-2", arrow: "", glyph: "" },
];

const tags = {
  voice: { label: "Voice", dot: "bg-[#f29aac]" },
  code: { label: "Plain code", dot: "bg-[#9fe3d6]" },
  ai: { label: "Local AI", dot: "bg-[#a99be6]" },
  safe: { label: "Safety check", dot: "bg-[#f6cf6a]" },
};

// Stands in for a screenshot: real-site captures show personal account details.
export function VoiceNavPipeline() {
  return (
    <figure className="bg-[linear-gradient(160deg,#2c2358,#1b1535)] p-5 text-[#fef7ed] sm:p-6">
      <figcaption className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <span className="font-display text-sm tracking-wide text-[#f6cf6a] uppercase">How a command travels</span>
        <span aria-hidden="true" className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#d9d0ee]">
          {Object.values(tags).map((t) => (
            <span key={t.label} className="flex items-center gap-1.5">
              <i className={`size-2 rounded-full ${t.dot}`} /> {t.label}
            </span>
          ))}
        </span>
      </figcaption>
      <ol className="grid gap-2 sm:grid-cols-3">
        {steps.map((step, i) => (
          <li key={step.title} className={`relative flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3 ${wide[i].cell}`}>
            <span
              aria-hidden="true"
              className={`grid size-7 shrink-0 place-items-center rounded-full font-display text-sm font-semibold text-[#1b1535] ${tags[step.tag].dot}`}
            >
              {i + 1}
            </span>
            <span>
              <span className="block font-semibold">{step.title}</span>
              <span className="block text-sm text-[#d9d0ee]">{step.body}</span>
            </span>
            {i < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={`absolute z-10 text-[#f6cf6a] max-sm:-bottom-3.5 max-sm:left-1/2 max-sm:-translate-x-1/2 ${wide[i].arrow}`}
              >
                <span className="sm:hidden">↓</span>
                <span className="max-sm:hidden">{wide[i].glyph}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </figure>
  );
}
