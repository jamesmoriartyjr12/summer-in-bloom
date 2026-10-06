# Website design

This is the living design of the site. Tweak it whenever a direction changes. The brand system in `design/BRAND.md` stays put. This file moves.

The creative director reviews every pull request against this file, the brand system, `design/MOTION.md`, and the notebook in `design/NOTEBOOK.md`. James waits for that comment before merging visual, motion, or voice changes. The creative director may open a pull request that only edits this file and the notebook. It does not restyle the page.

## How to tweak

Add a dated note at the top of the log. If the decision changes what the page should be, update Current direction in the same edit. Keep old log lines.

A pull request that changes layout, motion, type, color, imagery, or voice updates this file in that same pull request.

## Current direction

One scrolling page, in this order: Hero, Studio, Thesis, Fund Details, Team, Portfolio, Join us. There is no standalone News section. Press links sit on the portfolio rows, from `content/news.ts`.

The opening is one scene. A slit of the flower field opens on load, then one display line — “Purposely designed to build and scale companies.” — travels on the scroll frame’s text path, inside a band that cuts through the letters, until `companies` is in place. That word stays. The companies list replaces the field around it. The list reads from `content/portfolio.ts`. Studio through Join us stay after it. The site nav stays the six labels. Kayla still owns the auto duration and the scroll distance. Manifold Extended Heavy is the display face for this scene, loaded from `fonts/manifold-extended/`. Archivo and JetBrains Mono for this scene load from `fonts/` as well. The rest of the page stays on Mincho and Helvetica.

The side nav labels are Studio, Thesis, Fund Details, Team, Portfolio, Join us.

Type on the page today is BIZ UDPMincho for display and Helvetica Neue for body, on a chalk field (`#EBEBEB`). The brand system wants Manifold Extended Heavy headlines in all caps, Archivo for body and links, JetBrains Mono for labels, and Paper (`#FAF6EC`) as the light surface. Do not switch the type or the field in an unattended change. A move toward that system is a reviewed design change, recorded here first.

Orange `#FA4C1F` and lime `#D8FF34` already match the brand. Ink is `#070F18` in the Figma explorations and on the site, and `#070E18` on the brand hub. Leave both on record until James picks one.

Portfolio is a sticky image beside the company rows. Feno uses centered framing. Waves video plays on the Team section.

Photography direction is motion-blurred nature or urban, plus Bloom Object stills and turntables delivered by Marco and Kayla. Agents do not generate those and drop them in.

Voice for any new line: "Create great company." Direct, confident, warm, sharp.

## Open

- Which ink hex is the one we ship.
- When the page moves from Mincho and Helvetica on chalk to Manifold, Archivo, JetBrains Mono, and Paper.
- How Kayla's motion plan and Marco's samples land on Hero and Team without changing timing in an unattended edit.

## Motion

Reviews use `design/MOTION.md`. That file is the Motion install from Double Dutch Auctions: `motion/react`, shared duration and spring tokens, and the primitives `FadeUp`, `Press`, `SectionReveal`, and `TextRise`. Bloom still runs `framer-motion` 11. Switching packages is a reviewed change. Double Dutch's auction character stays on that site.

## Log

### 2026-10-05 — Featured opening

The first scene to build is the header that rolls into the companies list. Loader, then an auto open, then a scroll-linked line. The display line is “Purposely designed to build and scale companies.” Timing stays with Kayla. The orange deck under Companies stays out of this pass.

### 2026-10-05 — Case study

`docs/how-this-was-built.md` is a case study in the brand voice, directed as a creative-director piece. The story is how the studio kept a person in the loop. It is not a new page on the site.

### 2026-10-05 — Notebook

The creative director keeps a working memory in `design/NOTEBOOK.md` and adds to it on every review and every weekday study. Page direction still moves only in this file.

### 2026-10-05 — Motion install

The creative director now reads `design/MOTION.md` before a motion comment. The reference is the Double Dutch install (`motion` 13, Motion+ for live numbers only, tokens in `src/lib/motion.ts`). Bloom's page does not take on that auction character.

### 2026-10-05

Started this file so website direction can be tweaked without rewriting the brand system. The creative director reads every pull request, and also reviews the preview on weekday mornings. Press stays on the portfolio rows. The News section stays off the page.
