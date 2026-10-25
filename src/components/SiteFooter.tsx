import { profile } from "@/data/profile";

export function SiteFooter() {
  return (
    <footer className="bg-bg-alt text-xs text-muted">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© 2026 {profile.name}</p>
        <p>
          Built with Next.js and Tailwind CSS.{" "}
          <a href={profile.source} className="text-accent underline-offset-4 hover:underline">
            View the source
          </a>
        </p>
      </div>
    </footer>
  );
}
