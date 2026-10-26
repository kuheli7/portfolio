export type Stat = { value: string; label: string };

export type Media =
  | { kind: "image"; src: string; width: number; height: number; alt: string }
  | { kind: "video"; src: string; poster: string; width: number; height: number; label: string }
  | { kind: "voicenav" };

export type CaseStudy = {
  slug: string;
  name: string;
  kind: string;
  period: string;
  tagline: string;
  summary: string;
  stats: Stat[];
  highlights?: string[];
  status?: string;
  stack: string[];
  code: string;
  live?: string;
  liveNote?: string;
  media: Media;
  problem: string;
  approach: { title: string; body: string }[];
  resultsTitle?: string;
  results: string[];
  limits: string[];
};

export type SmallProject = {
  name: string;
  kind: string;
  summary: string;
  stack: string[];
  code: string;
  live?: string;
  liveNote?: string;
  media?: Extract<Media, { kind: "video" }>;
};

export type DesignSite = {
  name: string;
  tagline: string;
  summary: string;
  live: string;
  code: string;
  desktop: { src: string; width: number; height: number };
  // A short looping scroll of the site (animated WebP, 720x450). The still `desktop` shot is the reduced-motion fallback.
  scroll: string;
};

const RENDER_NOTE = "Hosted on a free Render instance, so the first load can take about 30 seconds.";

export const caseStudies: CaseStudy[] = [
  {
    slug: "costlens",
    name: "CostLens",
    kind: "Cloud · AWS cost analysis",
    period: "Oct 2026 – present",
    tagline: "Explains why an AWS bill changed, down to the resource and the CloudTrail event.",
    summary:
      "Every morning it finds the service, resource and CloudTrail event behind a cost change and explains it in plain English on Slack. A deterministic engine computes every number; the LLM only writes sentences, and a validator rejects anything it invents.",
    stats: [
      { value: "240/240", label: "injected incidents traced to the right root cause" },
      { value: "To the cent", label: "usage vs price split, checked by property tests" },
      { value: "720/720", label: "invented facts caught by the validator, per test tier" },
    ],
    status: "Results are on synthetic billing data. Not yet run against a live AWS account.",
    stack: ["Python", "FastAPI", "AWS Lambda", "EventBridge", "CloudTrail", "React", "Slack", "Hypothesis"],
    code: "https://github.com/kuheli7/costLens",
    media: {
      kind: "image",
      src: "/media/costlens.webp",
      width: 1280,
      height: 800,
      alt: "The CostLens dashboard, running on synthetic demo data, showing a daily cost change broken down by cause",
    },
    problem:
      "AWS Cost Explorer can tell you that EC2 went up. It can't tell you which instance, who launched it, or whether you're paying for more hours or a higher price per hour. CostLens answers that every morning, read-only, inside your own AWS account, and lists idle resources with the money they waste.",
    approach: [
      {
        title: "Usage vs price, split exactly",
        body: "Every cost line is usage × unit price, so a change splits into (q1 − q0) × p0 for usage plus (p1 − p0) × q1 for price. Money is kept in integer cents, baselines are exact fractions and rounding uses largest-remainder allocation, so the parts always add up to the total change. Hypothesis property tests check this on random inputs.",
      },
      {
        title: "Drill down to the resource",
        body: "The engine picks the dimension where the fewest values explain the change (service, region, usage type, team tag, Auto Scaling group, resource) and recurses into it. CloudTrail adds who launched what, and when. Five new instances in one group are reported as that group with its top contributors, not as five separate causes.",
      },
      {
        title: "Numbers the LLM can't invent",
        body: "The writer (Claude, or a plain template) only turns a fact sheet into sentences. A validator rejects any number, resource ID, date or name that isn't in the fact sheet. Text that fails is retried once, then replaced by the template.",
      },
      {
        title: "Waste rules that never act",
        body: "Six read-only rules flag idle EC2 instances, oversized Auto Scaling groups, unattached EBS volumes and Elastic IPs, stopped instances still paying for storage, and idle NAT gateways or load balancers. Each comes with the evidence, the monthly saving and a fix command as text. Nothing is ever executed.",
      },
      {
        title: "Serverless pipeline",
        body: "EventBridge triggers an ingest Lambda that loads the Cost and Usage Report (CUR 2.0, Parquet). A digest Lambda builds the baseline, attribution, CloudTrail context and waste findings, writes and validates the summary, and posts it to Slack.",
      },
    ],
    results: [
      "An evaluation harness injects a labelled incident into a fresh 90-day synthetic account and runs the real pipeline: six incident kinds (Auto Scaling scale-out, a new large instance, a NAT traffic spike, a rate change, a new service and a data-transfer spike), 10 seeds and two incident ages, so 120 incidents per tier.",
      "The correct root cause was named in 120/120 incidents in both the standard tier (3% noise) and the hard tier (8% noise, half-size incidents).",
      "The cause's amount was within 10% of the true added cost in 120/120 standard and 96/120 hard incidents.",
      "The validator caught 720/720 invented facts in each tier, and 0 of 300 ordinary days were wrongly flagged.",
    ],
    limits: [
      "It has been built and tested against mocked AWS (moto), recorded fixtures and synthetic data. It has not yet run against a live AWS account.",
      "I designed both the incidents and the data generator, so 100% means the engine does what it was designed to do on clean, labelled cases. It is not a claim about accuracy on a real bill with savings plans, shared resources and tag drift.",
      "In the hard tier the dollar amount drifts when noise is high, and two similar-sized incidents at once can swap rank (the larger one was ranked first in 20 of 30).",
      "Out of scope: deleting anything automatically, clouds other than AWS, and Reserved Instance or Savings Plan advice.",
    ],
  },
  {
    slug: "voicenav",
    name: "VoiceNav",
    kind: "Accessibility · Browser extension + local AI",
    period: "Oct 2026 – present",
    tagline: "Hands-free browsing by voice: say “open the cheapest one” and it clicks the right link.",
    summary:
      "A Chrome and Edge extension for people who can’t easily use a mouse or keyboard. Rules handle the common phrases, code does the counting, and a small local LLM picks only from the labels actually on the page. No cloud, no API cost.",
    stats: [
      { value: "64% → 94%", label: "command accuracy on a 50-command dev set" },
      { value: "82%", label: "on 28 held-out commands it was never tuned on" },
      { value: "72/74", label: "checks passed on 14 popular Indian websites" },
    ],
    stack: ["JavaScript", "Chrome extension (MV3)", "Python", "FastAPI", "Ollama", "Qwen2.5-3B", "Whisper", "Playwright"],
    code: "https://github.com/kuheli7/VoiceNav",
    media: { kind: "voicenav" },
    problem:
      "Voice control in the browser usually means memorising exact phrases or reading out link numbers. VoiceNav lets you speak naturally (“open the second result”, “sabse sasta wala kholo”) and works on any site, because it reads the same accessibility names a screen reader uses instead of site-specific selectors.",
    approach: [
      {
        title: "Rules first, LLM last",
        body: "Most commands are fixed phrases that a rule-based parser handles instantly and for free. Only what the rules can’t handle reaches the model.",
      },
      {
        title: "Code does the counting",
        body: "A 3B model is bad at “second” and “cheapest”, so a resolver works those out from the element list and the prices found next to each result. On Amazon and YouTube it counts whole result cards, including ones below the fold.",
      },
      {
        title: "The model copies a label, not a number",
        body: "The JSON schema’s enum is built from the labels on the current page, so the model can’t name an element that doesn’t exist. Switching from numeric IDs to this was the biggest single accuracy gain.",
      },
      {
        title: "Never trust the model",
        body: "A validator drops unknown targets and typed text containing words the user didn’t say. Anything labelled like buy now, pay, delete or log out needs a spoken “yes” first.",
      },
      {
        title: "Local, and bilingual",
        body: "The FastAPI backend binds to 127.0.0.1 and runs Qwen2.5-3B through Ollama; an optional offline mode uses Whisper for speech. It understands English, Hindi and Hinglish, in Devanagari or romanised spellings.",
      },
    ],
    results: [
      "Accuracy on a 50-command dev set went from 64% (v1, where the model returned a numeric ID) to 94% (v3.1, resolver plus LLM), with a median response of 0.9 s on a laptop CPU.",
      "On 28 held-out commands written after the design was fixed and never tuned on, it scores 82%.",
      "It passed 72 of 74 checks on 14 popular Indian sites, including Amazon, Flipkart, Myntra, IRCTC, Zomato and Wikipedia (logged out, typed commands, nothing bought or sent).",
      "788 unit tests, plus browser tests that load the real extension into Chromium.",
    ],
    limits: [
      "The dev set guided the design, so 94% is optimistic; 82% on held-out commands is the fairer number. Both sets are small and use mock page layouts.",
      "Chrome’s speech service needs internet. The offline Whisper mode was tested with a synthetic voice, not a person, and Hindi was tested with typed text.",
      "Chromium only (Chrome and Edge). Firefox lacks the speech API and Brave blocks Chrome’s speech service.",
      "“Cheapest” reads prices shown near each link, so it may not work on sites that put prices elsewhere.",
    ],
  },
  {
    slug: "creditlens",
    name: "CreditLens",
    kind: "Data and ML · Credit risk",
    period: "Sep 2026",
    tagline: "Credit risk scoring that shows its reasons, with readable policy rules and plain-English questions.",
    summary:
      "A LightGBM model scores loan applicants from the Home Credit dataset, SHAP explains each decision, and a natural-language tool turns questions about the portfolio into checked SQL. FastAPI backend, plain JavaScript front end, shipped in Docker.",
    stats: [
      { value: "0.233", label: "holdout PR-AUC, against a 0.081 no-skill baseline" },
      { value: "0.728", label: "holdout ROC-AUC" },
      { value: "144", label: "engineered features from 122 raw columns" },
    ],
    stack: ["Python", "FastAPI", "LightGBM", "SHAP", "Groq", "SQLite", "Chart.js", "Docker"],
    code: "https://github.com/kuheli7/credit-risk-platform",
    live: "https://creditlens-credit-risk-platform.onrender.com/?page=scoring",
    liveNote: RENDER_NOTE,
    media: {
      kind: "video",
      src: "/media/creditlens.mp4",
      poster: "/media/creditlens-poster.webp",
      width: 800,
      height: 500,
      label: "CreditLens demo: loading a historical applicant, scoring them, then reading the decision and the SHAP chart that explains it",
    },
    problem:
      "A credit model that only outputs a score is hard to trust or act on. Defaults are also rare, about 8% of applicants, so a model that predicts “no default” for everyone is 92% accurate and completely useless.",
    approach: [
      {
        title: "Built for the imbalance",
        body: "LightGBM with scale_pos_weight set to 11.5 to match the 11.5 : 1 class ratio, optimised for PR-AUC rather than accuracy, with stratified 5-fold cross-validation.",
      },
      {
        title: "Every score explained",
        body: "SHAP TreeExplainer shows which features pushed each applicant’s risk up or down. You can also look up any historical applicant by ID and compare the prediction with what actually happened.",
      },
      {
        title: "Rules a policy team can read",
        body: "The platform derives readable credit rules from the model’s behaviour, so an underwriter sees rules alongside the score rather than a number alone.",
      },
      {
        title: "Questions in plain English",
        body: "Groq turns a question into SQL. A guard rejects multiple statements and checks the query against the schema with SQLite’s query planner before it runs, so a bad query returns an error instead of a made-up answer.",
      },
    ],
    results: [
      "Holdout ROC-AUC 0.728 and PR-AUC 0.233, against a no-skill PR-AUC of 0.081. The 5-fold cross-validation means were 0.730 and 0.226.",
      "The best F1 threshold is 0.385 rather than the default 0.5, which matters with this much imbalance.",
      "Five sample portfolio questions were checked end to end through Groq, SQLite and the summariser, from default rate by income type to the riskiest occupations.",
    ],
    limits: [
      "A PR-AUC of 0.233 is about 2.9 times the baseline, but at any useful recall there are still many false positives, so the score supports a decision rather than making it.",
      "The risk form uses a curated set of fields rather than every raw Home Credit column.",
      "Production use would need versioned policy approval, calibration monitoring and a fairness check by cohort, which aren’t built yet.",
    ],
  },
  {
    slug: "policy-tree-editor",
    name: "Policy Tree Editor",
    kind: "Frontend · Visual editor",
    period: "Oct 2026",
    tagline: "A drag-and-drop editor for compliance policy trees that won’t let you build a broken one.",
    summary:
      "Compliance officers build rule trees (root, rule, condition, action) on a canvas, edit properties in a slide-over inspector, validate, auto-layout and import or export JSON. Strict TypeScript, React Flow, and one Zustand store that enforces the tree rules.",
    stats: [],
    highlights: ["Cycle and orphan checks", "Undo and redo", "Auto-layout", "zod-checked JSON import", "Dark mode"],
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "React Flow", "Zustand", "dagre", "zod"],
    code: "https://github.com/kuheli7/tree-editor",
    live: "https://tree-editor-glynac.vercel.app/tree",
    media: {
      kind: "video",
      src: "/media/tree-editor.mp4",
      poster: "/media/tree-editor-poster.webp",
      width: 800,
      height: 500,
      label: "Policy Tree Editor demo: opening a node’s properties, searching nodes, adding a node from a template, auto-layout and dark mode",
    },
    problem:
      "Compliance policies are trees of rules, conditions and actions. Editing them as raw JSON is error-prone, and a visual editor only helps if it stops you from making a tree that can’t be evaluated: two roots, orphaned nodes or loops.",
    approach: [
      {
        title: "One store owns the tree",
        body: "React Flow runs in controlled mode, so every change goes through Zustand store actions. That is the one place the rules are enforced: a single root, no self-links, re-parenting replaces the old link, and a link that would create a cycle is refused with a message explaining why.",
      },
      {
        title: "Undo that feels right",
        body: "Undo and redo use snapshots, and typing in the inspector or dragging a node is merged into a single step instead of one per keystroke.",
      },
      {
        title: "Tree logic outside React",
        body: "Validation, auto-layout (dagre) and serialisation are plain TypeScript modules. JSON import is validated with zod before it reaches the store.",
      },
      {
        title: "The small things",
        body: "Search highlighting, a mini-map, keyboard shortcuts, dark and light themes, saving to localStorage, and a phone layout where the sidebar becomes a drawer.",
      },
    ],
    resultsTitle: "What it handles",
    results: [
      "A palette of node templates you drag onto the canvas, with click-to-add as a fallback.",
      "A validation panel that lists orphans and circular references.",
      "Keyboard shortcuts: / to search, Ctrl+D to duplicate, Del to delete, Esc to deselect, Ctrl+Z and Ctrl+Shift+Z to undo and redo.",
      "A strict-mode TypeScript build, deployed on Vercel.",
    ],
    limits: [
      "Front end only: trees are saved in the browser, not on a server.",
      "Validation checks the structure (one root, no orphans, no cycles), not whether a policy’s conditions make sense.",
    ],
  },
];

export const smallProjects: SmallProject[] = [
  {
    name: "MindCare",
    kind: "Team project · Full stack",
    summary:
      "A mental well-being platform for students, with assessments for stress, anxiety, depression, burnout and sleep, and separate student and admin views. I worked on the assessment flows, JWT authentication with bcrypt-hashed passwords, and the REST APIs.",
    stack: ["React", "Node.js", "Express", "MongoDB", "JWT"],
    code: "https://github.com/kuheli7/MindCare",
    live: "https://mindcaree.netlify.app/",
    media: {
      kind: "video",
      src: "/media/mindcare.mp4",
      poster: "/media/mindcare-poster.webp",
      width: 800,
      height: 500,
      label: "MindCare demo: the home page and the list of assessments for stress, anxiety, depression, burnout and sleep",
    },
  },
  {
    name: "Sales Pulse",
    kind: "Dashboard",
    summary:
      "A sales dashboard for 2022 to 2024, built with Atomic Design. An API route aggregates 2,823 Kaggle order lines into bar, line and donut charts, with a threshold filter and like-for-like year-on-year KPIs. (The data is from 2003 to 2005, with dates shifted by 19 years.)",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Recharts"],
    code: "https://github.com/kuheli7/sales-pulse",
    live: "https://sales-pulse-dash-board.vercel.app/dashboard",
  },
  {
    name: "HubSpot Deals ETL",
    kind: "Backend · Data pipeline",
    summary:
      "A Flask-RESTX service that pulls HubSpot CRM deals into PostgreSQL with dlt. Scans checkpoint as they go, so they can pause, resume and recover after a crash without skipping data. Tokens are encrypted at rest, and a rate limiter stays inside HubSpot’s limits. Tested against a HubSpot API mock with fault injection.",
    stack: ["Python", "Flask-RESTX", "dlt", "PostgreSQL", "Docker"],
    code: "https://github.com/kuheli7/hubspot-deals-etl",
  },
  {
    name: "Highway Delite",
    kind: "Full stack · Travel booking",
    summary:
      "Browse and search travel experiences, pick a date and time slot, apply a promo code and get a confirmation email. Bookings are atomic, so the same slot can’t be double-booked.",
    stack: ["React", "TypeScript", "Vite", "Node.js", "Express", "MongoDB"],
    code: "https://github.com/kuheli7/travel-booking-app",
    live: "https://travel-booking-app-1-qe62.onrender.com",
    liveNote: RENDER_NOTE,
  },
  {
    name: "DSA Revision Tracker",
    kind: "Full stack",
    summary: "Tracks daily DSA practice, revision progress and solved problems, with a Node.js and MongoDB backend.",
    stack: ["JavaScript", "Node.js", "Express", "MongoDB"],
    code: "https://github.com/kuheli7/DSA-Revision-Tracker",
    live: "https://dsa-revision-tracker-gamma.vercel.app",
    liveNote: "The backend is on a free Render instance, so the first request can take about 30 seconds.",
  },
];

export const designSites: DesignSite[] = [
  {
    name: "Gulab & Co.",
    tagline: "Handmade mithai",
    summary: "A sweet shop site where customers build a festive dabba (gift box) and send the order on WhatsApp.",
    live: "https://gulab-and-co-sweet.vercel.app",
    code: "https://github.com/kuheli7/Gulab-and-Co",
    desktop: { src: "/media/gulab-desktop.webp", width: 1200, height: 633 },
    scroll: "/media/gulab-scroll.webp",
  },
  {
    name: "Sip & Sage",
    tagline: "Slow coffee, good company",
    summary: "A calm, photo-led café menu with a cart, per-table QR codes and a dark or light theme.",
    live: "https://sip-and-sage-cafe.vercel.app",
    code: "https://github.com/kuheli7/sip-and-sage-cafe",
    desktop: { src: "/media/sip-desktop.webp", width: 1200, height: 750 },
    scroll: "/media/sip-scroll.webp",
  },
  {
    name: "Brew & Bounce",
    tagline: "Big coffee. Bigger moods.",
    summary: "A playful café with chunky shadows, coupons and a WhatsApp hand-off that types out the whole order.",
    live: "https://brew-and-bounce.vercel.app",
    code: "https://github.com/kuheli7/brew-and-bounce",
    desktop: { src: "/media/brew-desktop.webp", width: 1200, height: 750 },
    scroll: "/media/brew-scroll.webp",
  },
];

export function getCaseStudy(slug: string) {
  return caseStudies.find((project) => project.slug === slug);
}
