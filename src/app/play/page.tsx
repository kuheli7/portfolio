import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Constellations } from "@/components/Constellations";
import { ArrowLeftIcon, ArrowRightIcon, MicIcon } from "@/components/icons";
import { VoiceDemoButton } from "@/components/VoiceDemo";

export const metadata: Metadata = {
  title: "Play",
  description:
    "Small things to play with on Kuheli Begum’s site: join stars into pictures, and steer the site by voice with a mini VoiceNav.",
};

const tryThese = [
  ["“scroll down a little”", "the same phrases the extension knows"],
  ["“open CostLens”", "jumps to the case study"],
  ["“take me to education”", "finds the right section"],
  ["“keep scrolling”, then “stop”", "hands-free reading"],
  ["“neeche scroll karo”", "Hinglish works too"],
  ["“dark mode and then open VoiceNav”", "two steps at once"],
];

export default function PlayPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-accent"
      >
        <ArrowLeftIcon /> Back to the homepage
      </Link>
      <header className="max-w-3xl">
        <p className="mb-2 font-display text-sm font-medium tracking-wider text-accent uppercase">Play</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">A few things to poke at</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Small experiments that grew out of my projects and my evenings. Nothing here is graded, so press anything.
        </p>
      </header>

      <section aria-labelledby="sky-title" className="mt-12 rounded-3xl border border-line bg-surface/50 p-5 sm:p-8">
        <div className="max-w-3xl">
          <p className="font-display text-sm font-medium tracking-wider text-accent uppercase">Star pictures</p>
          <h2 id="sky-title" className="mt-2 font-display text-3xl font-semibold">
            Join the stars
          </h2>
          <p className="mt-3 leading-relaxed text-muted">
            Each picture hides something I like. Follow the faint dotted lines to find it, or pick free draw and make
            your own.
          </p>
        </div>
        <div className="mx-auto mt-6 max-w-4xl">
          <Constellations />
        </div>
      </section>

      <section
        aria-labelledby="voice-title"
        className="mt-12 grid gap-8 rounded-3xl border border-line bg-surface/50 p-5 sm:p-8 lg:grid-cols-[1.2fr_1fr]"
      >
        <div>
          <p className="font-display text-sm font-medium tracking-wider text-accent uppercase">VoiceNav, on this site</p>
          <h2 id="voice-title" className="mt-2 font-display text-3xl font-semibold">
            Steer this site with your voice
          </h2>
          <div className="mt-3 space-y-3 leading-relaxed text-muted">
            <p>
              VoiceNav is a browser extension I built for moving around the web by voice. This is a small version of it
              that only knows this site. It runs the same command parser as the real extension, so the phrases in the
              list all work.
            </p>
            <p>
              The full extension also handles tabs, forms and searching, and anything the rules don’t recognise goes to
              a small AI model running on your own computer. No voice in your browser? Type instead. It works the same
              way.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <VoiceDemoButton className="inline-flex items-center gap-2 rounded-full bg-accent-bg px-5 py-2 font-semibold text-accent-ink transition-transform hover:-translate-y-0.5">
              <MicIcon /> Start talking
            </VoiceDemoButton>
            <Link
              href="/projects/voicenav"
              className="inline-flex items-center gap-1.5 font-semibold text-accent underline-offset-4 hover:underline"
            >
              How VoiceNav works <ArrowRightIcon />
            </Link>
          </div>
        </div>
        <div className="relative rounded-2xl bg-surface-2/60 p-5">
          <Image
            src="/media/lumi-curious.svg"
            alt=""
            width={72}
            height={72}
            className="absolute -top-7 right-4 size-16 rotate-6"
          />
          <h3 className="font-display text-lg font-semibold">Try saying</h3>
          <ul className="mt-3 space-y-2.5">
            {tryThese.map(([phrase, note]) => (
              <li key={phrase}>
                <span className="font-semibold">{phrase}</span>
                <span className="block text-sm text-muted">{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
