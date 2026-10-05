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
| Layout and motion | `components/sections/` |
| New images and video | `public/`, following `design/INTAKE.md` |

Do not commit Figma asset URLs. Export the file into `public/` and reference that path.

## How changes ship

James merges. Agents may open pull requests. They do not merge, and they do not change the production domain.

The rules for unattended edits are in `AGENTS.md`. The brand system is in `design/BRAND.md`. Marco's visual source is the brand hub plus the Figma website explorations. Kayla's video, graphics, and motion notes follow `design/INTAKE.md`.

A weekday creative-director review reads the preview against the brand file and posts a review. It does not change the site.

Pull requests run lint, `tsc --noEmit`, and `next build` in GitHub Actions. Vercel posts a preview URL on the pull request. Production deploys only from `main`.

## Scripts

```bash
npm run dev
npm run lint
npx tsc --noEmit
npm run build
```
