# Website design

This is the living design of the site. Tweak it whenever a direction changes. The brand system in `design/BRAND.md` stays put. This file moves.

The creative director reviews every pull request against this file, the brand system, `design/MOTION.md`, and the notebook in `design/NOTEBOOK.md`. James waits for that comment before merging visual, motion, or voice changes. The creative director may open a pull request that only edits this file and the notebook. It does not restyle the page.

## How to tweak

Add a dated note at the top of the log. If the decision changes what the page should be, update Current direction in the same edit. Keep old log lines.

A pull request that changes layout, motion, type, color, imagery, or voice updates this file in that same pull request.

## Current direction

One scrolling page, in this order: Hero, Studio, Thesis, Fund Details, Team, Portfolio, Join us. There is no standalone News section. Press links sit on the portfolio rows, from `content/news.ts`.

The opening is one scene. A slit of the flower field opens on load. The display line is “Purposely designed to create great companies.” “Purposely” plays in on its own, the whole word on screen. Scroll plays the rest of the line: each letter opens upward from the baseline and the line travels left. Under the line, the invest note stays on “purposely,” the design list on “designed,” the build list on “create,” and investing on “companies.” As `companies` comes into view, the flower field travels left. It reaches 80.64% off, the shift measured on frame `187:34`, then keeps going until the field is fully out of view and Paper is the ground. The word is `companies.` It keeps scrolling left through the subtext and does not hold. Letters and notes turn Ink once they cross onto that Paper. “Trusted by ambitious…” is two lines. It comes in with `companies.` and sits just short of the word’s right edge. The two keep moving together. The first card stays in the center of the browser on a desktop and moves with `companies.` After the last card, the row travels off to the left and the studio rises to meet it. A card leans on the way in and faces the screen once it is in front. The companies beside it are there while it is in front. They do not wait for it to leave. The run is a carousel: it starts at the first company and ends at the last, and a company that has left the frame does not come back around. The cards do not fade. The ten cards wind on two strands. The focused card sits large and sharp at the front. Neighbours sit to either side until they leave the frame. The neighbours climb and fall against each other, stay at full color, and do not cover one another. When the scroll is still, the card under the cursor turns toward the pointer and comes forward. The name under the pointer goes to ink, on the 200ms chrome snap, and the company in front stays ink. The photograph drifts about 12px inside the frame while the pointer holds it, and that drift is quiet while the page is scrolling. While the row is scrolling, the still drags against the frame by at most 8px, and it settles back to center when the scroll stops. The name and the bubbles sit as one unit, centered on the company in front. The stage color follows the round, in the palette hex with nothing mixed in. Seed is Lime `#D8FF34`, and its category is Ink `#070F18`. Acquired, Series A, and Growth are Ink, and their category is Lime. Orange is not on the bubbles. In front, each swipes to a fill of that color. Lime keeps ink type. Ink takes paper type. They swipe back to the stroke when that company leaves. The other names stay a single word. The turn springs, and it holds as the pointer crosses the ground between cards. The others stay where the helix put them. Scrolling eases the turn back onto the helix. While the carousel is in view, a 16px ink square takes the place of the pointer, including while the page scrolls. Over a card, that company’s line is a block of a few lines, set beside the square. The type is white or black, whichever stays legible on the ground behind it. Between cards the block leaves and the square stays. A click scrolls to the nearest company in the portfolio, and that card presses to 0.98 for 120ms. When the carousel leaves, the system pointer returns. Scroll turns the helix. The first card is in front when the row arrives, and the last card is in front when the scroll through the companies finishes. At rest each card is the photograph. The name is not on the card. It sits in a row along the bottom, one line per company, with open space between the names. The names are locked to the bottom. The cards stay above that row, and they do not pass under the type. There is no ground behind the names. The company in front is ink, and the others are the light type. Scroll moves that row with the helix. The stage and the category are not on the card. The helix stays fully in view, and the cards sit just above the names. The order can change. The portfolio section later still reads from `content/portfolio.ts`. Studio through Join us stay after it. Manifold Extended Heavy is the display face for this scene, loaded from `fonts/manifold-extended/`. Archivo and JetBrains Mono for this scene load from `fonts/` as well. The rest of the page stays on Mincho and Helvetica.

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

### 2026-10-16 — The carousel stays centered

On a desktop the companies carousel stays in the center of the browser. It moves with the word `companies.`

### 2026-10-16 — The carousel follows companies

The empty hold after `companies.` is gone. The first card comes in a gutter to the right of the word, and the row starts once that card is in front.

### 2026-10-16 — Trusted comes in with companies

The trusted line enters while `companies.` is still on screen. Its right edge sits just short of the word, and the two keep moving together.

### 2026-10-16 — Companies does not hold for the subtext

The word `companies` keeps scrolling while the investing line comes in. There is no rest hold.

### 2026-10-16 — The cards meet the line, then leave

The first card comes in from the right on the scroll that takes the trusted line off, and it stays a gutter to the right of that line until the card is in front. The line does not walk away and leave empty ground. After the last card, the row travels off to the left as the studio rises into the space the scene leaves.

### 2026-10-15 — The line is a block

The company line wraps into a block beside the square, instead of one line under the marker. The type is white or black, chosen against the ground behind the words.

### 2026-10-15 — The line sits beside the square

The square stays 16px. The company line is a paragraph revealed beside it, not type set inside the square. The lines are the ones on the portfolio rows.

### 2026-10-15 — The square reveals the line

The pointer on the carousel is a 17px ink square. Over a card it opens, and that company’s line is revealed in paper. The lines are the ones already on the portfolio rows. Between cards it closes to the square.

### 2026-10-15 — The circle carries the company

Over a card, the white circle widens and shows that company’s name in Archivo, in ink. Between cards it is the empty circle. The arrow is gone.

### 2026-10-15 — The arrow follows the pointer

The press arrow inside the circle turns to the direction the pointer is traveling through the carousel. It holds that heading when the pointer stops. It still starts pointing down, at the 1.2px weight.

### 2026-10-15 — The circle stays through the scroll

While the carousel is in view, the circle stays on the pointer, including while the page scrolls. The stroke is gone. The arrow is the press arrow, turned down, at the 1.2px weight.

### 2026-10-15 — The circle covers the carousel

The circle is 72px, white, with an ink arrow pointing down. It is the pointer anywhere in the carousel, not only on a card. A click goes to the nearest company in the portfolio. It still leaves while the page scrolls.

### 2026-10-15 — An ink circle takes the pointer

On a card, while the scroll is still, a 37px ink circle with a paper arrow replaces the pointer. The arrow points down. A click scrolls to that company in the portfolio. The card presses to 0.98 for 120ms. The circle leaves while the page scrolls.

### 2026-10-15 — The still drags while the row scrolls

The lag follows the scroll. While the helix is moving, the photograph drags against the frame by at most 8px, then settles back to center when the scroll stops. The pointer drift stays, and it is quiet while the page is scrolling.

### 2026-10-15 — The still lags the frame

As a card travels the helix, the photograph shifts inside the clip by at most 8px, the other way from the travel. It is centered when that card is in front. The pointer drift stays, and it is quiet while the page is scrolling.

### 2026-10-15 — Orange leaves the bubbles

Seed stays Lime. The category on a Seed company is Ink. Acquired, Series A, and Growth are Ink, and their category is Lime.

### 2026-10-15 — Seed is Lime, Acquired is Ink

The stage hexes are the palette, unmixed. Seed is Lime `#D8FF34`. Acquired is Ink `#070F18`. Series A and Growth stay Orange `#FA4C1F`. The category takes the other accent.

### 2026-10-15 — The bubbles take Orange and Lime

The stage is Orange. The category is Lime. In front, each swipes to a fill of its own color. The stage type goes paper on the fill. The category type stays ink, so it reads on the lime. They swipe back to the stroke when that company leaves.

### 2026-10-15 — The name and the bubbles center on the card

The name and the bubbles are one unit, centered on the company in front. The bubbles rest as an ink stroke. In front they swipe to a fill of Ink, paper type, and swipe back to the stroke when that company leaves.

### 2026-10-15 — The labels are bubbles beside the name

The stage and the category sit beside the name in front. Each one is an ink bubble, a 2px ring on the paper, type in ink. They wipe in and wipe back when that company leaves the front.

### 2026-10-15 — The labels sit above the name

The stage and the category are centered above the name in front. They stay ink chips, paper type. They wipe in and wipe back when that company leaves the front.

### 2026-10-15 — The stage and category sit under the name

The words leave the photograph. The company in front carries them, one line under its name, ink on the paper, with no chip. The line wipes in, stage then category, and wipes back when that company leaves the front. The other names stay a single word.

### 2026-10-15 — The labels wipe again

The card under the pointer plays the label wipe. The photograph drifts inside the frame, about 12px, the other way from the lean. The ink edge is gone.

### 2026-10-15 — The name answers, and the card has an edge

The company under the pointer goes to ink in the bottom row, on the 200ms chrome snap, and returns to the light type on leaving. Scroll still decides who is in front. A 2px ink edge sits on the side turning away, off the photograph, so it reads on the paper ground.

### 2026-10-15 — The turn is stronger

The card under the cursor leans further toward the pointer and steps further forward. The spring is a little quicker. The hit box still stays on the helix.

### 2026-10-15 — The turn stays with the pointer

The card under the cursor springs toward it. The hit box stays on the helix, so the turn does not throw the pointer off the card. Crossing the ground between cards does not drop the turn. Scrolling eases it back. The labels do not wipe.

### 2026-10-15 — A still helix follows the cursor

When the scroll is still, the card under the pointer turns toward it. The other cards stay on the helix. The moment the page scrolls, every card returns to the helix.

### 2026-10-15 — The cards stay apart

Neighbouring photographs do not cover one another. There is open space between the cards, so they do not blend.

### 2026-10-15 — Every card stays full color

A card that is not in front does not fade. Every company stays at full color.

### 2026-10-15 — The helix sits lower, fully in view

The cards are not cut off at the top. The group sits just above the names. The labels are larger again.

### 2026-10-15 — The chips sit at the bottom

The stage and the category sit along the bottom of the card. The type is a fifth larger.

### 2026-10-15 — The shadow finishes above the names

The card shadow fades out on the paper. It is not cut off along the top of the name row.

### 2026-10-15 — The first card meets the line

The first company comes in on the scroll that takes the word and the trusted line off the left. It stays just to their right, so the handoff is not a span of empty ground.

### 2026-10-14 — The names stay clear of the cards

The name row is locked to the bottom. The cards sit above it. A card does not scroll under the type.

### 2026-10-14 — The companies ahead stay in view

While the first company is in front, the ones still ahead are already in the line. They do not appear only after it leaves.

### 2026-10-14 — The companies run as a carousel

The helix does not loop. It starts on the first company and ends on the last. A company that has passed does not return from the other side.

### 2026-10-14 — The first card arrives alone

The first company comes in by itself. Once the scroll leaves it, the helix shows the companies on either side.

### 2026-10-14 — The card in front faces the screen

A card leans on the way in, the same way the ones beside it do, and it is square once it reaches the centre.

### 2026-10-14 — The cards scroll in

The cards travel in from the right on the same scroll that takes the trusted line off the left. They do not fade on.

### 2026-10-14 — Nothing sits to the left of the card in front

The company in front is in the centre. The ones still ahead sit to the right. A card that has passed does not stay on the left.

### 2026-10-14 — The word and the line leave

The tail of `companies.` and the trusted line travel off the left together. The first card comes in after both are gone.

### 2026-10-14 — The word arrives before the first card

`companies.` reaches its rest, and the line under it finishes arriving, before the first company comes in.

### 2026-10-14 — The name row has no ground

The cards run to the bottom of the frame. The names sit on that scene, with more space between them.

### 2026-10-14 — Each name is one line

Jamie Ai, Sunny Benefits, and the other two-word names stay on a single line in the bottom row. The row is wider than the screen and scrolls.

### 2026-10-14 — The names sit along the bottom

The company name is off the card. A row of names sits along the bottom, and scroll keeps the company in front in ink while the others stay in the light type.

### 2026-10-13 — Scroll turns the helix

The helix does not drift or drag. The same scroll that used to carry the row now brings each card to the front, first to last.

### 2026-10-13 — The cards wind

The company cards sit on two strands of a helix instead of a flat row. One card is sharp at the front. The others lean, climb, and blur away. Drag, a horizontal wheel, the arrow keys, or a click brings another card forward. The page still scrolls on a vertical wheel.

### 2026-10-13 — OuterProduct’s photograph

The card uses the marble still from frame `311:445`, cropped the way that frame crops it. The name stays paper on the dark ground.

### 2026-10-13 — The lines under the names are gone

A card shows the photograph, the stage, the category, and the name. The one-line placeholder does not come in on hover.

### 2026-10-13 — The close follows the card you leave

Moving from one card to the next plays the same reverse as leaving the row. The card you left returns its labels to ink while the next card opens.

### 2026-10-13 — Space between the cards

Four cards still fill the screen. Each one has 24px of the ground between it and the next.

### 2026-10-13 — The close plays the open backward

Leaving a card runs the same 560ms scene in reverse. The name, the line, and the label wipe each ease on the way out. The labels return to ink across the chip, right chip then left, over the same span as the way in. While a label is turning paper, the chip’s ground is paper, so the white side has no ink edge.

### 2026-10-13 — Placeholder lines under the names

Each card carries one line from the fund memo. Orion, Jamie Ai, Meridian, Sunny Benefits, Collectible, Feno, Milly, TeeCommerce, OuterProduct, FanFix. OuterProduct’s memo still says it needs to be written, so that line is a stand-in. The lines can be replaced.

### 2026-10-13 — A label has room on each side

Each stage chip and each category chip has 8px on the left and 8px on the right, so the type sits inside the chip.

### 2026-10-13 — A label has 4px on each side

Each stage chip and each category chip has 4px on the left and 4px on the right.

### 2026-10-13 — The left chip is the stage

The year is gone. Each card carries the stage on the left and one category on the right: Orion, Jamie Ai, Meridian, Sunny Benefits, Collectible, Feno, Milly, TeeCommerce, OuterProduct, FanFix. Four still fit across. The order is the list as sent, and it can be rearranged.

### 2026-10-13 — A white chip has no edge

Once a label has wiped to paper, the fill is a solid chip. The ink stop is gone, so it does not leave a stroke around the white.

### 2026-10-13 — A resting card stays solid

Hover and focus open one card. The cards that are not open keep their opacity. They do not ease back.

### 2026-10-13 — The wipe has one layer of type

The label change is a single line of type. The chip and the letters swap along the same edge, so the black chip does not outline the white one. The wipe takes the 480ms scene. The line spring is slower, so the small overshoot has time to settle.

### 2026-10-13 — The labels wipe, and the line springs

The hover stays quick. The label chips wipe from left to right: paper type on ink becomes ink type on paper. The year finishes before the roles, because the wipe crosses the row. The line under the name springs in from 16px with a small overshoot, then settles. Leaving plays the wipe backward and springs the line back out.

### 2026-10-13 — The hover is immediate

The order stays: the name moves up, the line and the mark come in, the chips turn paper and the labels turn ink. Those beats overlap inside the 120ms press, so the card does not wait on a scene duration. Leaving plays the same span backward.

### 2026-10-13 — The name rises before the line

Frame `227:222`. On hover the name moves up and leaves room. The line and the mark then come in. After that, the ink chips turn paper and the label type turns ink. The rise and the line each take 480ms on the media ease. The label color takes the 200ms chrome snap. Leaving the card plays that order backward.

### 2026-10-13 — A card rests on ink chips

Frame `227:34` is the rest of every company card. The year is its own ink chip. The roles share one ink chip, with 16px between the words. The type on those chips is paper. The name stays paper on a dark photograph and ink on a light one. The arrow in that frame is on the card, at the opacity saved in the file. Hover still opens into frame `227:222`.

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
