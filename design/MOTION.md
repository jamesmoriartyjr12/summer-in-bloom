# Motion reference

The creative director reads this before commenting on motion. It records the Motion install already running on Double Dutch Auctions, so Bloom reviews use the same craft.

Bloom's feel still comes from Kayla's motion plan and Marco's samples. Double Dutch's auction character stays on that site: live red prices, the countdown reel, and the acquire press.

## Install

Double Dutch (repo `dutchy`, https://doubledutchauctions.com) runs:

- `motion` `^13.2.0`, imported from `motion/react`
- Motion+ as `motion-plus`, resolved to `npm:@motionplus/core`
- A private registry in `.npmrc`: `@motionplus:registry=https://api.motion.dev/npm/`, authenticated with the `MOTION_TOKEN` environment variable

`MOTION_TOKEN` is a secret on the cloud agent environment, GitHub Actions, and Vercel (Production, Preview, and Development). The token is never committed.

Summer in Bloom still depends on `framer-motion` 11. Nav, portfolio rows, and the sticky image import from that package. A move to `motion/react` is a reviewed change. The two packages are not installed together.

Motion+ is installed only when a reviewed change needs a component the free package does not include. `AnimateNumber` is the one Double Dutch uses, and only for live auction figures. The Motion+ `Cursor` is banned there and stays banned here.

## How Double Dutch is built

| Layer | Where it lives |
| --- | --- |
| Language | `MOTION.md` |
| Tokens | `src/lib/motion.ts` |
| Primitives | `src/components/motion/` |
| Scenes | One owner each: hero snap, home-to-grid, lot dual-pane, countdown reel |

Tokens:

| Token | Value | Use |
| --- | --- | --- |
| `duration.snap` | 200ms | Header swaps, chrome |
| `duration.enter` | 360ms | Fade-up enters |
| `duration.scene` | 480ms | Hero slide snap |
| `duration.press` | 120ms | Press, via the press spring |
| `ease.ui` | `0.2, 0.8, 0.2, 1` | Labels, CTAs |
| `ease.media` | `0.22, 1, 0.36, 1` | Media and scrim, opacity only |
| `spring.digit` | stiffness 520, damping 34, mass 0.45 | Countdown reel |
| `spring.price` | stiffness 380, damping 32, mass 0.55 | Live price |
| `spring.press` | stiffness 600, damping 28, mass 0.4 | Press scale 0.98 |
| `stagger.labels` | 50ms | Sibling labels |
| `stagger.tiles` | 60ms | Tiles |
| `stagger.section` | 80ms | Sections |
| `distance.enterY` | 12px | Max enter travel |
| `distance.punchY` | 8px | Display type |

Primitives, used before any new wrapper:

- `FadeUp` — enter or in-view. `punch` shortens travel. `settle` is opacity only, for artwork and photography.
- `StaggerChildren` / `StaggerItem` — sibling labels. `snap` uses the 200ms chrome beat. `soft` is opacity only so travel stays a single 12px.
- `Press` — tap scale on a CTA group. No hover lift.
- `SectionReveal` — below-fold enter, once. It does not own scroll physics.
- `TextRise` — clipped type rise. Word, four-word prose, or one line. Travel is the line box.
- `LiveNumber` — Motion+ `AnimateNumber` with `spring.price`. Reduced motion renders the formatted number with no digit spin. Countdown digits stay in `Countdown` and are not replaced by `AnimateNumber`.

## What a review holds

- Timings come from tokens. A one-off duration needs a reason in the pull request.
- Enter travel stays inside 8–16px.
- Artwork and photography settle with opacity. They do not stagger, scale, or parallax against the frame.
- Each transition has one owner. A second slide system beside an existing snap or handoff is a conflict.
- The first viewport carries a few intentional beats, not a stack of entrances.
- `useReducedMotion()` means opacity-only or instant. Transforms do not keep running. Layout and handoff still work.
- No custom cursor, hover lift, card shadow, or decorative float.
- Long ambient loops stay off UI chrome.

## Header travel

The bar leaving the page is not a chrome snap. `duration.snap` stays 200ms for color and the phone mark. The bar's own move uses the header travel tokens.

Downscroll on its own does not move the bar, on a phone or on a desktop. The bar leaves when the locked word `companies` in the opening line reaches 40px from the bottom of the bar. It returns on the same ease when that word drops back below the line.

| Token | Value | Rule |
| --- | --- | --- |
| `distance.headerClearance` | 40px | From the bottom edge of the bar to the top of `companies`. The edge is the bar's layout height, so the leaving transform does not move the line. |
| `duration.header` | 650ms | The whole trip off or back. |
| `ease.header` | `0.22, 1, 0.36, 1` | Leaves with the word, then settles. No fade. No overshoot. The return retargets the same ease from wherever the bar is. |
| Reduced motion | duration 0 | The bar appears or disappears in place. Transforms do not keep running. |

A spring from rest was measured here and spends the first fifth of a second almost still, then rushes. `ease.header` starts the move as the word crosses the line.

`components/TopNav.tsx` imports these values from `lib/motion.ts`. A second duration on the header is a break.

## What Bloom still decides

Kayla names what moves, when, and what it should feel like. Marco's samples are references for a reviewed implementation. Hero and Team are still open. Changing timing, or swapping `framer-motion` for `motion`, waits for a creative-director comment and for James to merge.
