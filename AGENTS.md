# Agent contract

This file is the contract for every chat session and cloud automation on this repo.

## Who decides what

James merges. He is the only person who merges to `main` or changes the production domain.

Marco owns visual design. His Figma file is the visual source of truth. Motion samples he sends are references for a later, reviewed implementation. They are not code to copy and they are not a ticket to change timing on their own.

Kayla owns video, graphics, and the motion plan: what moves, when it moves, and what it should feel like. Asset handoff rules live in `design/INTAKE.md`.

## Safe to change in an unattended pull request

- Files under `content/`
- Alt text
- A broken local image path, when the file already exists in `public/`
- A dead press URL, when the replacement is the same article at a new address
- Lint and type errors that do not change layout, motion, or copy meaning

Open one pull request for the night. If nothing on this list is wrong, open a short GitHub issue instead of an empty pull request.

## Ask first

Do not open an unattended pull request for any of these:

- Section layout, scroll behavior, or motion timing
- Nav behavior
- Type styles in `tailwind.config.ts`
- New sections or new routes
- Video files in `public/`
- Dependency upgrades
- GitHub Actions, Vercel settings, or DNS

## Never

- Merge a pull request
- Force-push
- Edit Vercel project settings or DNS
- Point bloomgrowthagency.com at this project

Preview deploys are the working surface. Domain cutover is a separate decision.
