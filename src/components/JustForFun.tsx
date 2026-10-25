import Image from "next/image";
import { LiveLink } from "./ui";

export function JustForFun() {
  return (
    <section aria-labelledby="fun-title" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="grid items-center gap-8 overflow-hidden rounded-3xl border border-line bg-[linear-gradient(160deg,#2c2358,#1b1535)] p-5 text-[#fef7ed] sm:p-8 lg:grid-cols-[1.3fr_1fr]">
        <Image
          src="/media/lumi-night-shift.webp"
          alt="Lumi’s Night Shift: the tiny moth who starts a new hobby every night"
          width={1200}
          height={540}
          sizes="(min-width: 1024px) 620px, 100vw"
          className="h-auto w-full rounded-2xl"
        />
        <div>
          <p className="font-display text-sm font-medium tracking-wider text-[#f6cf6a] uppercase">Just for fun</p>
          <h2 id="fun-title" className="mt-2 font-display text-3xl font-semibold">
            Lumi’s Night Shift
          </h2>
          <p className="mt-3 leading-relaxed text-[#d9d0ee]">
            Lumi is a marshmallow-sized baby moth who starts a new hobby every night and never finishes any. I built
            their homepage for the haX.baby hackathon in October 2026, with a chat, a 3D attic, a mini-game and a
            guestbook.
          </p>
          <div className="mt-5 [&_a]:outline-[#f6cf6a] [&_a]:border-white/20 [&_a]:text-[#fef7ed] [&_a:hover]:border-[#f6cf6a] [&_a:hover]:text-[#f6cf6a]">
            <LiveLink href="https://kuheli7.github.io/lumi-baby-moth/" name="Lumi’s Night Shift" label="Say hi to Lumi" />
          </div>
        </div>
      </div>
    </section>
  );
}
