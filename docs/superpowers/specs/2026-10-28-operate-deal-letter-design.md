# Operate deal letter

Date: 28 October 2026

This is the first slice of Bloom's quoting and contracting system. It gives a customer a private page that shows the pricing packages, the equity arrangement, and the term length for their deal. Staff prepare that page. The page uses the treatment of the Amplifier Health scope in Figma file `vg2i0fsDiOcQiPtV3NYDBU` (frames AH 16–AH 20) and behaves as a digital page.

## What this version does

- Staff sign in with Google at `/operate`. Only `@bloomventures.com` accounts enter.
- Staff create a deal and edit its offer.
- Each deal has a private link, `/operate/d/` plus a long random token. The customer does not sign in.
- The customer page shows the company, the term length, and the packages Bloom turned on.
- The customer selects one package. That choice is saved.
- With equity on, each package shows the list rate struck through, the cash rate, the weekly amounts, and the in-kind equity gap.
- With equity off, each package shows the list rate only.
- The staff editor shows the same letter, live, as the fields change.

## What this version does not do

- Scope-of-work lines, terms, signature blocks, invoices, or overage billing.
- DocuSign.
- HubSpot reads or writes. The deal keeps two empty ids for a later match.
- A pricing formula. Round, valuation, and Bloom's hourly cost are stored for the team. They do not calculate the rate.
- Magic links. The private token is the customer's door. Magic link is a later upgrade.
- Any change to the public scrolling page.

## Team

One lead owns this pull request. The branch is `operate`, cut from `main`, in its own checkout. It does not share files with the open section pull requests.

Simon comments before merge. The letter is layout, type, and color. The Figma frames are the visual reference for treatment. They are not a pixel copy of five printed sheets.

Marco's Figma file remains the visual source. Kayla has no motion in this work. The letter does not use Lenis or `framer-motion`.

Mia's note: the owner is the lead. Merge waits on Simon. James merges.

These files stay untouched:

- `tailwind.config.ts`
- `components/TopNav.tsx`
- `components/SideNav.tsx`
- `app/page.tsx`
- `components/WavesBackground.tsx`

The public page still has no database of its own. `/operate` is the part that has one. `next build` must succeed without `DATABASE_URL` and without Google credentials, so the public preview keeps deploying.

## Surfaces

`/operate` is the staff list of deals. `/operate/[dealId]` is the editor. Both require a Google session whose email ends with `@bloomventures.com`.

`/operate/d/[token]` is the customer letter. It does not ask for Google. It sends `noindex`. The homepage does not link to it.

The letter has its own layout. It does not mount the marketing header, the side nav, or smooth scroll.

## The letter

One scroll. The company name is set in orange inside the greeting: "Hello {company}, so nice to see you again." The rest of the greeting is ink. The ground is Paper `#FAF6EC`. Orange is the existing token `#FA4C1F`. Ink is `#070F18`. Body type is Archivo, already loaded. The greeting uses Archivo as well. No new font file. No edit to `tailwind.config.ts`.

The contact name and role are staff-editor fields. They identify the deal on the staff list. They do not appear on the letter.

Under the greeting, the page shows the term length in words: Six months, One year, or Multi-year.

The packages Bloom turned on are rows. A row shows the service name, the hours per week, the rate, and the weekly amount. The customer selects a row. The selected row is marked. Choosing a row saves immediately and does not reload the whole site. Hours, term, and equity stay as Bloom set them.

With equity on, the list rate and the weekly list amount are struck through. The cash rate and the weekly cash amount are the figures that remain. When the cash rate is lower, one line states the gap: the per-hour difference and the per-week difference, as in-kind consideration toward equity. When the two rates are equal, the line reads "Equity is part of this arrangement."

With equity off, the row shows the list rate and the weekly list amount. There is no strike and no equity line.

A faint Bloom wordmark sits in the page, using `public/bloom-wordmark.svg`. The footer uses `public/bloom-mark.svg` and the studio address `james@bloomventures.com`. These assets are already in the repo. The footer address is fixed in this version.

The staff editor places the fields and this same letter on one screen. Edits to the company, the term, the equity switch, and the package rates update the letter on that screen.

## Record

Rates and money are integer cents.

A deal stores:

- `id`
- `token`, url-safe, at least 32 bytes of randomness, shown again in the editor so Bloom can copy the link
- `companyName`
- `contactName`
- `contactRole`
- `equityEnabled`
- `termLength`: `six-month`, `one-year`, or `multi-year`
- `round`, optional, staff only
- `valuationDollars`, optional whole dollars, staff only. Stored as a bigint so a large round still fits.
- `hourlyCostCents`, optional, staff only
- `selectedPackageId`, optional
- `hubspotContactId`, optional, unused
- `hubspotDealId`, optional, unused

A package stores:

- `id`
- `dealId`
- `serviceName`
- `hoursPerWeek`, positive integer
- `enabled`
- `listRateCents`, zero or greater
- `cashRateCents`, zero or greater
- `sortOrder`

When equity is on, `cashRateCents` is less than or equal to `listRateCents`.

Weekly list amount is `hoursPerWeek * listRateCents`. Weekly cash amount is `hoursPerWeek * cashRateCents`. The equity gap per hour is `listRateCents - cashRateCents`. The equity gap per week is `hoursPerWeek * (listRateCents - cashRateCents)`. These numbers are computed when rendering. They are not stored.

The Amplifier Health reference, used as the test case for the math: 40 hours, list `$190` (`19000` cents), cash `$150` (`15000` cents). Weekly list `$7,600`. Weekly cash `$6,000`. Gap `$40` an hour and `$1,600` a week. This version does not seed that company unless a person creates the deal.

## Access and failure

An unknown token returns 404. A package that is off, or that belongs to another deal, cannot be selected. A missing company name, a non-positive hour count, a negative rate, or a cash rate above the list rate while equity is on is rejected and the deal is left unchanged.

A signed-out visit to `/operate` goes to the Google sign-in screen. An account outside `@bloomventures.com` is refused. The customer route never redirects to Google.

The token is the secret. It is not written into the public page, the sitemap, or client logs.

## Data flow

Postgres holds the deals. Server code is the only reader and writer. The customer page loads the deal by token, renders the letter, and posts the selected package id back to that same token. The staff list and editor load and save by deal id, behind the session.

The database client connects on first use. Importing it during `next build` does not open a connection.

## Tests

The pricing functions have unit tests for the Amplifier numbers, for equity off, for a zero gap, and for a rejected negative result when the cash rate exceeds the list rate. The build checks remain `npm run lint`, `npm run typecheck`, and `npm run build`.

## Later, not in this pull request

HubSpot sync, DocuSign, scope and terms pages, signature, magic-link sign-in, and a formula that prices a deal from round, valuation, and cost.
