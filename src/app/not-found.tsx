import Image from "next/image";
import Link from "next/link";
import { buttonClass } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32">
      <Image
        src="/media/lumi-curious.svg"
        alt="Lumi the baby moth, looking puzzled"
        width={282}
        height={282}
        className="mb-4 size-44"
      />
      <p className="text-sm font-semibold text-muted">404</p>
      <h1 className="mt-2 text-5xl font-semibold tracking-[-0.03em]">Lumi looked everywhere.</h1>
      <p className="mt-4 text-lg text-muted">…and couldn’t find this page. It may have moved, or the link has a typo.</p>
      <Link href="/" className={`${buttonClass} mt-8`}>
        Back to the homepage
      </Link>
    </div>
  );
}
