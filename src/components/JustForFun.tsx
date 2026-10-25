import Image from "next/image";
import { LiveLink } from "./ui";

// Lumi's one home on the homepage.
export function JustForFun() {
  return (
    <section aria-labelledby="fun-title" className="bg-bg-alt px-4 py-24 sm:px-6 sm:py-28">
      <div className="mx-auto grid max-w-5xl items-center gap-8 text-center md:grid-cols-[auto_1fr] md:gap-14 md:text-left">
        <Image
          data-reveal
          src="/media/lumi-happy.svg"
          alt="Lumi the baby moth, smiling"
          width={282}
          height={282}
          className="mx-auto size-48 sm:size-60"
        />
        <div data-reveal>
          <p className="text-sm font-semibold text-muted sm:text-base">Just for fun</p>
          <h2 id="fun-title" className="mt-2 text-4xl font-semibold tracking-[-0.025em] sm:text-5xl">
            Lumi’s Night Shift
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Lumi is a marshmallow-sized baby moth who starts a new hobby every night and never finishes any. I built
            their homepage for the haX.baby hackathon in October 2026, with a chat, a 3D attic, a mini-game and a
            guestbook.
          </p>
          <div className="mt-5 text-lg">
            <LiveLink href="https://kuheli7.github.io/lumi-baby-moth/" name="Lumi’s Night Shift" label="Say hi to Lumi" />
          </div>
        </div>
      </div>
    </section>
  );
}
