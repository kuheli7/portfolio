import type { Metadata, Viewport } from "next";
import { Caveat, Fredoka, Nunito } from "next/font/google";
import { EasterEggs } from "@/components/EasterEggs";
import { RevealObserver } from "@/components/RevealObserver";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { VoiceDemo } from "@/components/VoiceDemo";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

// Handwriting, only for the little pen notes
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

// Social preview images need absolute URLs. Vercel sets the production domain; locally it's the dev server.
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Kuheli Begum · Software developer",
    template: "%s · Kuheli Begum",
  },
  description:
    "Kuheli Begum is an MCA student at CHRIST University, Bengaluru, building full-stack, cloud and AI projects: CostLens, VoiceNav, CreditLens and more.",
  openGraph: {
    type: "website",
    siteName: "Kuheli Begum",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: "#16122b",
};

// Runs before first paint so a saved light theme doesn't flash dark first.
const themeScript = `try{if(localStorage.getItem("theme")==="light")document.documentElement.dataset.theme="light"}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${fredoka.variable} ${nunito.variable} ${caveat.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#main"
          className="sr-only z-50 rounded-full bg-accent-bg px-4 py-2 font-semibold text-accent-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <RevealObserver />
        <EasterEggs />
        <VoiceDemo />
      </body>
    </html>
  );
}
