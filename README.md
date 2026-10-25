# Kuheli Begum · Portfolio

My personal site: the projects I've built, how each one works, and how to reach me. The design takes its cues
from Apple's product pages: big type, plenty of white space, and the work shown in motion.

![Preview of the portfolio](src/app/opengraph-image.png)

## What's on it

- **Featured work:** CostLens, VoiceNav, CreditLens and Policy Tree Editor, each with its own case-study page
  (problem, approach, results and limits).
- **More projects:** MindCare, Sales Pulse, HubSpot Deals ETL, Highway Delite and DSA Revision Tracker.
- **Design work:** three mobile-first sites for small food businesses (Gulab & Co., Sip & Sage, Brew & Bounce).
- **Just for fun:** Lumi's Night Shift.
- About, education, awards, and contact links.

## Built with

- [Next.js 16](https://nextjs.org) (App Router, static prerendering) and TypeScript
- [Tailwind CSS 4](https://tailwindcss.com)
- Inter through `next/font`

## Details

- **Light and dark themes.** The site follows your system setting, and the toggle remembers your choice. A small
  inline script applies it before the first paint, so the page doesn't flash.
- **Motion:** sections fade up once as they scroll into view, and the hero and statement text respond to scrolling
  in browsers that support scroll-driven animations. All of it is switched off when the system asks for reduced
  motion.
- **Demo videos** are short, muted, compressed MP4s. They only play while on screen, never play when the
  system asks for reduced motion, and stay paused once you pause them.
- **Accessibility:** a skip link, visible focus rings, labelled controls, and colour pairs that meet WCAG AA
  contrast in both themes.
- **Content lives in data files**, so updating the site rarely means touching a component:
  - `src/data/profile.ts`: name, email and social links
  - `src/data/projects.ts`: case studies, smaller projects and design sites

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

```bash
npm run lint    # ESLint
npm run build   # production build
npm start       # serve the production build
```

## Project layout

```
src/
  app/                 routes, layout, global styles, icons and the social preview image
    projects/[slug]/   case-study pages
  components/          page sections and shared UI
  data/                profile and project content
public/
  media/               demo videos, screenshots and the Lumi stickers
  resume/              resume PDF
```
