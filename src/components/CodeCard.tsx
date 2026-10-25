import type { CSSProperties } from "react";

// Token kinds: c comment, k keyword, s string, f function call, p punctuation, plain text otherwise.
type Token = [kind: "c" | "k" | "s" | "f" | "p" | "", text: string];

const colours: Record<Token[0], string> = {
  c: "text-[#8f84b8]",
  k: "text-[#f6cf6a]",
  s: "text-[#9fe3d6]",
  f: "text-[#f29aac]",
  p: "text-[#e7cef6]",
  "": "",
};

const list = (items: string[]): Token[] => [
  ["p", "["],
  ...items.flatMap((item, i): Token[] => [["s", `"${item}"`], ...(i < items.length - 1 ? [["p", ", "] as Token] : [])]),
  ["p", "]"],
];

const lines: Token[][] = [
  [["c", "// hello from Bengaluru"]],
  [["k", "const"], ["", " kuheli "], ["p", "= {"]],
  [["", "  role: "], ["s", '"full-stack developer"'], ["p", ","]],
  [["", "  focus: "], ...list(["cloud", "data", "AI"]), ["p", ","]],
  [["", "  now: "], ["s", '"intern @ Springer Capital"'], ["p", ","]],
  [["", "  studying: "], ["s", '"MCA @ CHRIST University"'], ["p", ","]],
  [["c", "  // some unfinished"]],
  [["", "  sideQuests: "], ...list(["drawing", "guitar", "beads"]), ["p", ","]],
  [["", "  snack: mood.good "], ["k", "?"], ["s", ' "mango" '], ["k", ":"], ["s", ' "grapes"'], ["p", ","]],
  [["", "  openTo: "], ["s", '"SDE roles from 2027"'], ["p", ","]],
  [["p", "};"]],
  [["f", "hire"], ["p", "("], ["", "kuheli"], ["p", ");"], ["c", " // great idea"]],
];

export function CodeCard({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      role="img"
      aria-label="A code card that types itself out: Kuheli is a full-stack developer focused on cloud, data and AI, an intern at Springer Capital, studying for an MCA at CHRIST University, and open to SDE roles from 2027."
      style={style}
      className={`overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(160deg,#2c2358,#1b1535)] text-[#fef7ed] shadow-2xl shadow-black/25 ${className}`}
    >
      <div className="flex items-center gap-1.5 bg-[#221c44] px-4 pt-3">
        <i className="size-2.5 rounded-full bg-[#f29aac]" />
        <i className="size-2.5 rounded-full bg-[#f6cf6a]" />
        <i className="size-2.5 rounded-full bg-[#a99be6]" />
        <span className="ml-3 rounded-t-lg bg-[#2c2358] px-3 py-1.5 font-mono text-xs text-[#c3b8de]">kuheli.ts</span>
      </div>
      <pre aria-hidden="true" className="overflow-hidden px-4 pt-4 pb-9 font-mono text-[11px] leading-[1.75] sm:px-5 sm:text-[13px]">
        {lines.map((tokens, n) => (
          <span key={n} className="code-line" style={{ "--n": n } as CSSProperties}>
            {tokens.map(([kind, text], i) => (
              <span key={i} className={colours[kind] || undefined}>
                {text}
              </span>
            ))}
            {n === lines.length - 1 && (
              <>
                {" "}
                <i className="caret" />
              </>
            )}
          </span>
        ))}
      </pre>
    </div>
  );
}
