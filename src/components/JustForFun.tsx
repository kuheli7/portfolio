import Image from "next/image";
import Link from "next/link";
import { LiveLink } from "./ui";
import { Reveal } from "./Reveal";

const LUMI_URL = "https://kuheli7.github.io/lumi-baby-moth/";

export function JustForFun() {
  return (
    <section aria-labelledby="fun-title" id="fun" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
      <Reveal
        className="relative grid items-center gap-8 overflow-hidden hover:shadow-[0_0_0_2px_#f6cf6a,0_20px_50px_-20px_rgb(246_207_106/0.35)] rounded-3xl border border-line bg-[linear-gradient(160deg,#2c2358,#1b1535)] p-5 text-[#fef7ed] sm:p-8 lg:grid-cols-[1.3fr_1fr]"
      >
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
            {/* The after: layer stretches this link over the whole card, so a click anywhere opens Lumi's site. */}
            <a
              href={LUMI_URL}
              className="outline-[#f6cf6a] after:absolute after:inset-0 after:z-0 after:rounded-3xl after:content-['']"
            >
              Lumi’s Night Shift
            </a>
          </h2>
          <p className="mt-3 leading-relaxed text-[#d9d0ee]">
            Lumi is a marshmallow-sized baby moth who starts a new hobby every night and never finishes any. I built
            their homepage for the haX.baby hackathon in October 2026, with a chat, a 3D attic, a mini-game and a
            guestbook.
          </p>
          <div className="relative z-10 mt-5 [&_a]:outline-[#f6cf6a] [&_a]:border-white/20 [&_a]:text-[#fef7ed] [&_a:hover]:border-[#f6cf6a] [&_a:hover]:text-[#f6cf6a]">
            <LiveLink href={LUMI_URL} name="Lumi’s Night Shift" label="Say hi to Lumi" />
          </div>
          <p className="relative z-10 mt-4 text-sm text-[#d9d0ee]">
            Want to play here too?{" "}
            <Link href="/play" className="font-semibold text-[#f6cf6a] underline-offset-4 hover:underline">
              Join the stars into pictures, or steer this site with your voice
            </Link>
            .
          </p>
        </div>
      </Reveal>
    </section>
  );
}
