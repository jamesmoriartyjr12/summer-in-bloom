# Summer in Bloom

The Bloom site: a single scrolling page for the studio, the fund, the portfolio, and press. Preview deploys live on Vercel. bloomgrowthagency.com stays on the current public site until a later cutover.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** with design tokens from Figma
- **Framer Motion** for nav transitions
- **Lenis** for smooth scroll
- **BIZ UDPMincho** loaded via `next/font/google` (self-hosted at build time)

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Page

`app/page.tsx` composes the sections in order:

1. Hero
2. Studio
3. Thesis
4. Fund Details
5. Team
6. Portfolio
7. Join us

Top nav and side nav sit outside the section flow. Each `<Section>` registers itself with `SectionContext`. The side nav reads the active section to mark the current item and to switch between light and dark themes.

## What to edit

| Change | Where |
| --- | --- |
| Portfolio companies | `content/portfolio.ts` |
| Press articles | `content/news.ts` |
| Website direction | `design/DESIGN.md` |
| Layout and motion | `components/sections/` |
| New images and video | `public/`, following `design/INTAKE.md` |

Do not commit Figma asset URLs. Export the file into `public/` and reference that path.

## How changes ship

James merges. Before he opens another section or presses merge, he types `/mia` in the Cursor chat he is already in. That chat answers as Mia, from `docs/engineering.md` and the open pull requests. Agents may open pull requests. They do not merge, and they do not change the production domain.

The rules for unattended edits are in `AGENTS.md`. The case study of how it was built is in `docs/how-this-was-built.md`. Meeting notes live in `docs/meetings.md`. The brand system is in `design/BRAND.md`. The living website direction is in `design/DESIGN.md`. The creative director's notebook is in `design/NOTEBOOK.md`. Marco's visual source is the brand hub plus the Figma website explorations. Kayla's video, graphics, and motion notes follow `design/INTAKE.md`.

The project coordinator runs the work and partners with the creative director. In `#bloom-web-2026`, the team can mention Mia or Simon, the creative director, and get a short reply from that person. One lead engineer owns the build. The map is in `docs/engineering.md`. Every pull request goes through the creative director before it is merged. That review comments on the pull request. A weekday pass studies one reference, writes what it learned in `design/NOTEBOOK.md`, and, when the direction should change, opens a pull request that edits only that notebook and `design/DESIGN.md`.

Pull requests run lint, `tsc --noEmit`, and `next build` in GitHub Actions. Vercel posts a preview URL on the pull request. Production deploys only from `main`.

## Scripts

```bash
npm run dev
npm run lint
npx tsc --noEmit
npm run build
```
