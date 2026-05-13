# Summer in Bloom

First three sections of the Bloom Ventures fund intro: Hero, Fund Details, Fund Thesis.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** with design tokens from Figma
- **Framer Motion** for the side nav transitions
- **Lenis** for smooth scroll
- **BIZ UDPMincho** loaded via `next/font/google` (self-hosted at build time)

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Project structure

```
app/
  layout.tsx          # Font loading, metadata
  page.tsx            # Page composition
  globals.css         # Base styles + Lenis CSS
components/
  LenisProvider.tsx   # Smooth scroll setup
  SectionContext.tsx  # Tracks active section + theme
  Section.tsx         # Section wrapper with IntersectionObserver
  SideNav.tsx         # Persistent sticky nav, theme-aware
  sections/
    Hero.tsx
    FundDetails.tsx
    FundThesis.tsx
tailwind.config.ts    # Design tokens
```

## How the side nav works

The side nav is a single persistent element rendered outside the section flow. It's hidden over the hero and fades in once the Fund Details section enters the viewport.

Each `<Section>` registers itself with the `SectionContext` via an `IntersectionObserver`. The observer fires when a section's center crosses the middle of the viewport. The context tracks the active section's `id` and `theme` (`light` | `dark`), and the side nav reads from that to:

- Update which dot is filled
- Smoothly transition text and dot colors between light and dark themes

Click handlers on each nav item use `scrollIntoView({ behavior: "smooth" })` which Lenis intercepts and applies its own easing to.

## TODO before production

1. **Hero video** — drop your video file into `public/hero.mp4` (and an optional poster at `public/hero-poster.jpg`). The `<video>` tag is already wired up. If you'd prefer an embed (Vimeo/Cloudflare Stream) instead, swap the `<video>` block in `components/sections/Hero.tsx` for an iframe.

2. **Background image for Fund Thesis** — currently pulled from a Figma temp URL (expires in 7 days). Download the source asset, drop it in `public/`, and update the `THESIS_IMAGE` constant. Same for `DETAILS_IMAGE` in `FundDetails.tsx`.

3. **Responsive rules** — desktop only so far. Need to define breakpoints and how the side nav, type sizes, and image layouts adapt on tablet / mobile.

4. **Additional sections** — Pipeline, Current Portfolio, Contact. The `Section` + `SectionContext` plumbing is ready; just add them to `app/page.tsx` and they'll register with the side nav automatically.
