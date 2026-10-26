import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";
import { StoryBook } from "@/components/StoryBook";

export const metadata: Metadata = {
  title: "My story",
  description:
    "How Kuheli Begum went from economics at Visva-Bharati to an MCA at CHRIST University, building real things, and a baby moth called Lumi.",
};

export default function StoryPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/#about"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-accent"
      >
        <ArrowLeftIcon /> Back to the homepage
      </Link>
      <h1 className="sr-only">My story</h1>
      <StoryBook />
    </div>
  );
}
