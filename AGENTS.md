# AGENTS.md

## Cursor Cloud specific instructions

This is a single-service, frontend-only project: **Summer in Bloom**, a scroll-driven Next.js 14 (App Router) + TypeScript marketing landing page for the Bloom Ventures fund. There is no backend, API, database, auth, or environment variables. The only runtime service is the Next.js app.

### Running the app
- Dev server: `npm run dev` → serves at http://localhost:3000 (Next.js default port).
- Production build/run: `npm run build` then `npm start`.
- Dependencies are installed automatically by the startup update script (`npm install`), so you normally do not need to reinstall.

### Lint / build / test
- `npm run lint` (`next lint`) is **not usable non-interactively**: the repo has no ESLint config committed, so the command drops into an interactive "How would you like to configure ESLint?" prompt and never runs. Do not rely on it in automation unless an ESLint config is added to the repo first.
- There is no automated test suite (no Jest/Vitest/Playwright config or test files).
- `npm run build` works for validating a production build.

### Notes / gotchas
- Some section background images are loaded from temporary Figma-hosted URLs (see `next.config.js` `remotePatterns` and the README "TODO before production"). These can expire, so a section background occasionally 404s; this does not break the app or the dev server.
- The hero expects an optional `public/hero.mp4` video that is not committed; its absence is expected and non-fatal.
- Core functionality to verify visually: scrolling reveals sections (Hero → Fund Details → Fund Thesis → Team → Portfolio) with a theme-aware sticky side navigation whose active dot updates on scroll, and clicking a side-nav item smooth-scrolls to that section.
