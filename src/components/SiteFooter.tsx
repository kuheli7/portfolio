import { profile } from "@/data/profile";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© 2026 {profile.name}. Lumi says goodnight.</p>
        <p>
          Built with Next.js and Tailwind CSS.{" "}
          <a href={profile.source} className="font-semibold text-accent underline-offset-4 hover:underline">
            View the source
          </a>
        </p>
      </div>
    </footer>
  );
}
