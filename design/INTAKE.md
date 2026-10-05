# Design intake

Production images live in `public/` under stable names. Copy and press links live in `content/`. Layout and motion stay in `components/`.

## Marco — visual design

The brand system is `design/BRAND.md`. The brand hub is the written system. The Figma explorations file is the website sample set. Do not commit Figma MCP or `figma.com` asset URLs. Those links expire. Export the asset and add it under `public/` with a stable filename, then point the component or content file at that path.

Motion samples stay outside the repo. They are large, and they are references. Send the sample with a note that names the section and the moment it refers to. Implementing that motion is a reviewed change, not an unattended edit.

## Kayla — video, graphics, and motion planning

Each delivery names:

- Filename, saved with a stable name under `public/` (images) or shared outside the repo (video masters and motion samples)
- Poster frame, if it is video
- Aspect ratio
- Where it plays (section id: `hero`, `the-studio`, `fund-thesis`, `fund-details-2`, `about-us`, `current-portfolio`, `contact`)
- The motion plan in a few sentences: what moves, when, and what it should feel like

Current production video files are `public/summer-bloom-hero.webm` and `public/waves-video.webm`. Replace those only in a reviewed pull request.

## Images already in the repo

- `public/Bloom Portfolio Images/` — company stills referenced from `content/portfolio.ts`
- `public/Press Images/` — article stills referenced from `content/news.ts`
- `public/Portraits/` — portraits
- `public/fund-details-small.png`, `public/fund-details-large.png`
- `public/studio-small.png`, `public/studio-large.png`
- `public/bloom-logo-white.svg`

Keep filenames stable once a content file points at them. Renaming an image means updating the content path in the same pull request.
