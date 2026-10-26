import { profile } from "@/data/profile";
import { someday } from "@/data/story";
import { LocalTime } from "./LocalTime";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 text-sm text-muted sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 {profile.name}. Lumi says goodnight.</p>
          <p>
            Built with Next.js and Tailwind CSS.{" "}
            <a href={profile.source} className="font-semibold text-accent underline-offset-4 hover:underline">
              View the source
            </a>
          </p>
        </div>
        <div className="flex flex-col gap-2 border-t border-dashed border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="someday flex flex-wrap items-center gap-x-2 gap-y-1">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="plane size-4 shrink-0 text-accent">
              <path
                d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-semibold text-fg">Someday:</span>
            {someday.map((item, i) => (
              <span key={item.place}>
                {item.wish} <span className="opacity-70">({item.place})</span>
                {i < someday.length - 1 && <span aria-hidden="true"> ·</span>}
              </span>
            ))}
          </p>
          <LocalTime />
        </div>
      </div>
    </footer>
  );
}
