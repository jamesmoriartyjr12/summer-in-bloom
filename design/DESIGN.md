# Website design

This is the living design of the site. Tweak it whenever a direction changes. The brand system in `design/BRAND.md` stays put. This file moves.

The creative director reviews every pull request against this file, the brand system, `design/MOTION.md`, and the notebook in `design/NOTEBOOK.md`. James waits for that comment before merging visual, motion, or voice changes. The creative director may open a pull request that only edits this file and the notebook. It does not restyle the page.

## How to tweak

Add a dated note at the top of the log. If the decision changes what the page should be, update Current direction in the same edit. Keep old log lines.

A pull request that changes layout, motion, type, color, imagery, or voice updates this file in that same pull request.

## Current direction

One scrolling page, in this order: Hero, Studio, Thesis, Fund Details, Team, Portfolio, Join us. There is no standalone News section. Press links sit on the portfolio rows, from `content/news.ts`.

The opening is one scene. A slit of the flower field opens on load. The display line is “Purposely designed to create great companies.” “Purposely” plays in on its own, the whole word on screen. Scroll plays the rest of the line: each letter opens upward from the baseline and the line travels left. Under the line, the invest note stays on “purposely,” the design list on “designed,” the build list on “create,” and investing on “companies.” As `companies` comes into view, the flower field travels left. It reaches 80.64% off, the shift measured on frame `187:34`, then keeps going until the field is fully out of view and Paper is the ground. The word is `companies.` It slides to the rest in frame `227:182`, left at `-1107` on the 1920 stage, so the tail of the word stays on the left. Letters and notes turn Ink once they cross onto that Paper. “Trusted by ambitious…” is two lines. It slides in on the investing line and pushes that block out before the cards move. The cards keep the size of four across the screen. Scroll moves through all eight, and vertical scrolling starts once the last card is in. Hovering or focusing a card lifts it into frame `227:222`. The line and the mark come in, the labels turn ink, and the other cards ease to 70% opacity. WatchCheck carries that line. Feno, Milly, and Orion lift with it, and their lines wait. The portfolio section later still reads from `content/portfolio.ts`. Studio through Join us stay after it. Manifold Extended Heavy is the display face for this scene, loaded from `fonts/manifold-extended/`. Archivo and JetBrains Mono for this scene load from `fonts/` as well. The rest of the page stays on Mincho and Helvetica.

The header is the explorations bar. The Bloom wordmark sits on the left, and on a phone it transitions into the Bloom mark. On the right, in JetBrains Mono Medium at 16px, uppercase: Studio, Companies, Fund One, and the viewer's city and local time. It takes its color from the field underneath: Paper type and a Paper mark on a dark field, Ink type and an Orange mark on a light field. The bar stays through downscroll. It travels off, on the header travel in `design/MOTION.md` — 650ms, ease `0.22, 1, 0.36, 1` — when the word `company` comes within 40px of the bottom of the bar, on a phone and on a desktop. It returns on that same ease once the word drops back below the line. Color and the phone mark stay on the 200ms chrome ease. Studio, Companies, and Fund One are underlined. Studio scrolls to the studio, Companies to the portfolio, and Fund One to fund details. Contact stays on the join-us section at the bottom. The side list remains Studio, Thesis, Fund Details, Team, Portfolio, Join us.

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

### 2026-10-09 — A card opens on hover

The row still scrolls at full size. Hover and focus use frame `227:222`: the card lifts, the labels turn ink, and the line and the mark come in. The move takes 480ms on the media ease. Reduced motion shows the line in place. WatchCheck carries the line. The other three wait for copy.

### 2026-10-08 — The eight cards keep their size

Each card stays the width of a four-across row. Scroll travels through the eight, and the page moves on after the last card is in view.

### 2026-10-08 — The artwork row is eight across

The row is WatchCheck, Feno, Milly, and Orion, then that same four again. It still scales from the right until the eight cards span the screen, and the page scrolls on after that.

### 2026-10-08 — The artwork scales across, then the page scrolls

The cards grow from the right until the row is the full width of the screen. The hero stays pinned for that horizontal scale. Vertical scrolling starts after the row is complete.

### 2026-10-08 — Companies rests, and the field is gone

The headline is `companies.` Frame `227:182` is the rest: the word sits at left `-1107`, the flower field is fully off, and Paper is the ground. Trusted by slides in from the right. The pill and the triangle travel above the type, and the cards cover that line.

### 2026-10-08 — The pill stays off the type

Investing leaves the slot before the trusted line appears. The pill and the triangle come in with that line, after the word is gone.

### 2026-10-08 — Trusted enters like the other notes

Investing holds the slot under `company`. “Trusted by ambitious…” comes in from the right, and investing slides out and fades only as that line reaches the slot. The two notes do not sit together under the word.

### 2026-10-08 — Company stays, and trusted replaces investing

The word `company` parks at the note inset and stays the only headline. “Trusted by ambitious…” comes into that same slot with the note swap that investing used, while the cards keep traveling. The film no longer draws a second `COMPANIES.`

### 2026-10-08 — The companies film

The ink list at the end of the opening is replaced by the card film. Frames `187:181`, `210:404`, and `227:182`. `COMPANIES.` and the cards travel left together until the row is packed, then WatchCheck lifts, the note and the press marks come in, and Feno, Milly, and Orion ease back and dim. Paper stays underneath. The cards are WatchCheck, Feno, Milly, and Orion, from those frames.

### 2026-10-08 — The field leaves with company

Frame `187:34`. The flower field stays full while the line is still crossing “designed.” Once `company` enters from the right, the field travels left with that word. At the end of the word’s travel it sits 80.64% of the viewport off the left edge, and Paper shows in the space it leaves. Letters and notes turn Ink once they cross onto that Paper, and stay Paper while they are still on the field. Reduced motion leaves the field in place.

### 2026-10-08 — The header line opens from the baseline

The flower field and the explorations bar stay. “Purposely” plays in until the whole word is on screen. Scroll continues straight into “designed”: the line eases off together, and the next note fades in with its first letter. The notes stay hooked to purposely, designed, create, and company.

### 2026-10-07 — Top navigation

The header matches the explorations bar. Bloom wordmark on the left. On the right: Studio, Companies, Fund One, and the viewer's city and local time. Type is JetBrains Mono Medium, 16px, uppercase. The names are underlined. The side list is unchanged. The bar stays until `company` reaches 40px from the bottom of the bar, then travels on the 650ms header ease.

### 2026-10-07 — Companies sits on the grid

Once `companies` has locked, its left edge is the same inset as the company rows.

### 2026-10-06 — The field stirs

The opening background is a breeze made from `public/hero-flowers.png`, saved as `public/hero-flowers.webm`. The photograph stays the one from the explorations. The still is the poster. The box still reveals from the left and then fills the viewport.

### 2026-10-06 — The field opens

The flower field starts as a small box. It reveals from left to right, then scales up until the photograph fills the viewport.

### 2026-10-06 — The display face loads

The opening line is Manifold Extended CF Heavy, the file in `fonts/manifold-extended/`. The preview was dropping that face: the fallback name Arial Black was minified to `Arial #000`, the font declaration was thrown out, and the line inherited Helvetica. The fallback is a generic sans now, and the line does not synthesize a bold.

### 2026-10-06 — Above the cut

The line sits higher above the bottom crop, so more of the word on the left stays readable. The path still drops through that edge on the right.

### 2026-10-06 — One path

The mask cuts only the bottom of the line. The whole sentence stays on one curve. The left of the viewport is the shallow part of that curve, and the drop steepens toward the right. A word takes the tangent at its center, so its letters turn together.

### 2026-10-06 — Marco on the opening

Marco looked at the opening on 6 October. The headline has to be Manifold Extended CF, the very extended face. The mask was clipping the tops of the letters, and the type was too small for the curve to read. The line is larger so the letters clearly rise on the path. The tops sit inside the band. The drop below the band still cuts.

### 2026-10-06 — Phone opening

James asked for mobile first on 25 September. On a phone the notes under the line were scaling with the display face until they could not be read. They now hold a readable size, and the invest line stacks. The footer studies and the WatchCheck case-study frames from 2 October stay explorations.

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
