# Engineering

One lead owns this map. James merges. Simon comments before a change to layout, motion timing, type, color, imagery, or voice. Mia keeps the schedule and the owners.

The page is one route. Next.js 14, React 18, TypeScript, Tailwind. Scroll is Lenis. Motion on the page is `framer-motion` 11. The Motion install to match is written in `design/MOTION.md`. Switching packages is a reviewed change. There is no server and no database. Do not add one for its own sake.

## Where the page lives

`app/page.tsx` renders the sections in this order: Hero, Studio, Thesis, Fund Details, Team, Portfolio, Join us. The section components are in `components/sections/`. Hero is the featured opening: a load-time slit, then scroll carries one display line into the companies list. Team is `AboutUs`. Portfolio is `CurrentPortfolio`. Join us is `Contact`.

Copy and portfolio data that can change without a layout decision live in `content/`. The night steward may edit those files. The lead does not hide a layout change in there.

Navigation is `components/TopNav.tsx` and `components/SideNav.tsx`. Type tokens are in `tailwind.config.ts`. Both are ask-first.

Images and video already in the repo live in `public/`. A new video file is ask-first.

## The lanes

The lead holds all five. One pull request, one lane, unless James asks for more.

- Speed. Images, the build, and what the preview has to load. Measure before changing the loading of a section.
- Content pipeline. `content/`, the build, and the preview. No new route until there is a form or an API James has asked for.
- Page components. The section files render. They do not invent a new section order.
- Breakpoints. The page has to hold together on a phone and on a desktop. A breakpoint change that moves the layout waits for Simon.
- Motion implementation. Read `design/MOTION.md` first. Samples from Marco are references. Kayla owns the plan. Timing does not change in an unattended edit.

## How a change moves

The lead opens a pull request. When the diff touches layout, motion, type, color, imagery, or voice, Simon opens the Vercel preview on that pull request and comments on what the page shows. Mia names the owner and what is waiting. James merges.

Checks on the pull request are lint, `tsc --noEmit`, and `next build`. Locally those are `npm run lint`, `npm run typecheck`, and `npm run build`. The preview is the Vercel deploy for that pull request. Production deploys from `main`. The live domain is a separate decision.

Whether the agents are awake stays with Mia. She names it when someone asks. She does not take over the lead, Simon, or the four automations.

## Working several sections

`main` is the only integration branch. Each section gets its own branch, its own checkout, and its own pull request. This folder is one checkout. A second chat in it shares the same files.

James types `/mia` in the Cursor chat he is already in, before he opens another section and before he merges. That chat answers as Mia. She looks at the open pull requests and answers with one of four words: open it, wait, update from `main`, or merge. She names the pull request and what is waiting. She does not merge, she does not tell anyone to force-push, and she does not send him to Slack.

She says merge when the checks are green, Simon has commented from the Vercel preview on a change to layout, motion, type, color, imagery, or voice, and the pull request does not share files with another open one. Independent sections can merge in any order.

Shared files go first. Those are `tailwind.config.ts`, `components/TopNav.tsx`, `components/SideNav.tsx`, `app/page.tsx`, and `components/WavesBackground.tsx`. Thesis and Team both use the waves file, so one chat owns it. After a merge, the other open pull requests update from `main` before the next merge.

Production updates from `main` on the Vercel app. The live domain stays on the current public site.
