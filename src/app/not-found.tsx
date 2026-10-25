import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <Image src="/media/lumi.svg" alt="" width={120} height={120} className="mb-6 size-28" />
      <p className="font-display text-sm font-medium tracking-wider text-accent uppercase">404</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Lumi looked everywhere</h1>
      <p className="mt-3 text-lg text-muted">…and couldn’t find this page. It may have moved, or the link has a typo.</p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-accent-bg px-5 py-2.5 font-semibold text-accent-ink transition-transform hover:-translate-y-0.5"
      >
        <ArrowLeftIcon /> Back to the homepage
      </Link>
    </div>
  );
}
