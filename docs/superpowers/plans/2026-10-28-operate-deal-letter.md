# Operate deal letter implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Staff at Bloom can open a private deal letter that shows a customer the pricing packages, the equity arrangement, and the term length.

**Architecture:** `/operate` is a new route group on the existing Next.js 14 app. Google sign-in guards the staff pages. A random token guards the customer letter. Postgres stores the deal. A pure pricing module computes weekly amounts. The public scrolling page is not part of this work.

**Tech Stack:** Next.js 14.2, React 18, TypeScript, Tailwind, Auth.js (`next-auth@5`), Drizzle ORM, Neon serverless Postgres, `tsx` for unit tests.

## Global Constraints

- Branch `operate`, cut from `main`, in its own checkout. One lead. One pull request.
- Simon comments before merge. The letter is layout, type, and color.
- Do not edit `tailwind.config.ts`, `components/TopNav.tsx`, `components/SideNav.tsx`, `app/page.tsx`, or `components/WavesBackground.tsx`.
- Do not use Lenis or `framer-motion` on the letter.
- Paper `#FAF6EC`, orange `#FA4C1F`, ink `#070F18`. Body and greeting use Archivo (`var(--font-archivo)`).
- Money is integer cents. Weekly list is `hoursPerWeek * listRateCents`. Weekly cash is `hoursPerWeek * cashRateCents`.
- Equity on: cash rate is less than or equal to the list rate. The gap is in-kind equity.
- Equity off: the letter shows the list rate only.
- `next build` succeeds without `DATABASE_URL` and without Google credentials.
- HubSpot, DocuSign, scope lines, terms, and the signature block are out of this pull request.
- Only `@bloomventures.com` Google accounts enter `/operate`.
- The customer route is `/operate/d/[token]`, `noindex`, and it never redirects to Google.

---

### Task 1: Pricing math

**Files:**
- Create: `lib/operate/pricing.ts`
- Create: `lib/operate/pricing.test.ts`
- Modify: `package.json`
- Test: `lib/operate/pricing.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `type TermLength = "six-month" | "one-year" | "multi-year"`
  - `termLabel(term: TermLength): string`
  - `weeklyAmountCents(hoursPerWeek: number, rateCents: number): number`
  - `equityPerHourCents(listRateCents: number, cashRateCents: number): number`
  - `equityPerWeekCents(hoursPerWeek: number, listRateCents: number, cashRateCents: number): number`
  - `type PackageInput = { serviceName: string; hoursPerWeek: number; enabled: boolean; listRateCents: number; cashRateCents: number; equityEnabled: boolean }`
  - `validatePackage(input: PackageInput): string | null` — `null` means valid
  - `type LetterPackage = { id: string; serviceName: string; hoursPerWeek: number; listRateCents: number; cashRateCents: number; weeklyListCents: number; weeklyCashCents: number; equityPerHourCents: number; equityPerWeekCents: number }`
  - `type LetterDeal = { companyName: string; termLabel: string; equityEnabled: boolean; packages: LetterPackage[]; selectedPackageId: string | null }`
  - `toLetterPackage(pkg: { id: string; serviceName: string; hoursPerWeek: number; listRateCents: number; cashRateCents: number }): LetterPackage`
  - `formatDollars(cents: number): string`

- [ ] **Step 1: Add the test script**

In `package.json`, add a devDependency and a script. Install with npm.

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit",
  "test": "tsx --test lib/operate/pricing.test.ts"
}
```

```bash
npm install --save-dev tsx
```

- [ ] **Step 2: Write the failing test**

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  equityPerHourCents,
  equityPerWeekCents,
  formatDollars,
  termLabel,
  toLetterPackage,
  validatePackage,
  weeklyAmountCents,
} from "./pricing";

describe("amplifier pricing", () => {
  it("prices 40 hours at $190 and $150", () => {
    assert.equal(weeklyAmountCents(40, 19000), 760000);
    assert.equal(weeklyAmountCents(40, 15000), 600000);
    assert.equal(equityPerHourCents(19000, 15000), 4000);
    assert.equal(equityPerWeekCents(40, 19000, 15000), 160000);
    assert.equal(formatDollars(760000), "$7,600");
    assert.equal(formatDollars(4000), "$40");
  });

  it("names the term", () => {
    assert.equal(termLabel("six-month"), "Six months");
    assert.equal(termLabel("one-year"), "One year");
    assert.equal(termLabel("multi-year"), "Multi-year");
  });

  it("rejects a cash rate above the list rate when equity is on", () => {
    const error = validatePackage({
      serviceName: "Design Engineering",
      hoursPerWeek: 40,
      enabled: true,
      listRateCents: 15000,
      cashRateCents: 19000,
      equityEnabled: true,
    });
    assert.equal(error, "Cash rate cannot exceed the list rate.");
  });

  it("allows a cash rate above the list rate when equity is off", () => {
    const error = validatePackage({
      serviceName: "Design Engineering",
      hoursPerWeek: 80,
      enabled: true,
      listRateCents: 15000,
      cashRateCents: 19000,
      equityEnabled: false,
    });
    assert.equal(error, null);
  });

  it("builds the letter package", () => {
    const row = toLetterPackage({
      id: "pkg-40",
      serviceName: "Design Engineering",
      hoursPerWeek: 40,
      listRateCents: 19000,
      cashRateCents: 15000,
    });
    assert.equal(row.weeklyListCents, 760000);
    assert.equal(row.weeklyCashCents, 600000);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL because `lib/operate/pricing.ts` does not exist.

- [ ] **Step 4: Write the implementation**

```ts
export type TermLength = "six-month" | "one-year" | "multi-year";

export function termLabel(term: TermLength): string {
  if (term === "six-month") return "Six months";
  if (term === "one-year") return "One year";
  return "Multi-year";
}

export function weeklyAmountCents(hoursPerWeek: number, rateCents: number): number {
  return hoursPerWeek * rateCents;
}

export function equityPerHourCents(listRateCents: number, cashRateCents: number): number {
  return listRateCents - cashRateCents;
}

export function equityPerWeekCents(
  hoursPerWeek: number,
  listRateCents: number,
  cashRateCents: number,
): number {
  return hoursPerWeek * (listRateCents - cashRateCents);
}

export function formatDollars(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const absolute = Math.abs(cents);
  const dollars = Math.trunc(absolute / 100);
  const remainder = absolute % 100;
  const formatted = dollars.toLocaleString("en-US");
  if (remainder === 0) return `${sign}$${formatted}`;
  return `${sign}$${formatted}.${String(remainder).padStart(2, "0")}`;
}

export type PackageInput = {
  serviceName: string;
  hoursPerWeek: number;
  enabled: boolean;
  listRateCents: number;
  cashRateCents: number;
  equityEnabled: boolean;
};

export function validatePackage(input: PackageInput): string | null {
  if (input.serviceName.trim() === "") return "Service name is required.";
  if (!Number.isInteger(input.hoursPerWeek) || input.hoursPerWeek < 1) {
    return "Hours per week must be a positive whole number.";
  }
  if (!Number.isInteger(input.listRateCents) || input.listRateCents < 0) {
    return "List rate must be zero or more.";
  }
  if (!Number.isInteger(input.cashRateCents) || input.cashRateCents < 0) {
    return "Cash rate must be zero or more.";
  }
  if (input.equityEnabled && input.cashRateCents > input.listRateCents) {
    return "Cash rate cannot exceed the list rate.";
  }
  return null;
}

export type LetterPackage = {
  id: string;
  serviceName: string;
  hoursPerWeek: number;
  listRateCents: number;
  cashRateCents: number;
  weeklyListCents: number;
  weeklyCashCents: number;
  equityPerHourCents: number;
  equityPerWeekCents: number;
};

export type LetterDeal = {
  companyName: string;
  termLabel: string;
  equityEnabled: boolean;
  packages: LetterPackage[];
  selectedPackageId: string | null;
};

export function toLetterPackage(pkg: {
  id: string;
  serviceName: string;
  hoursPerWeek: number;
  listRateCents: number;
  cashRateCents: number;
}): LetterPackage {
  return {
    id: pkg.id,
    serviceName: pkg.serviceName,
    hoursPerWeek: pkg.hoursPerWeek,
    listRateCents: pkg.listRateCents,
    cashRateCents: pkg.cashRateCents,
    weeklyListCents: weeklyAmountCents(pkg.hoursPerWeek, pkg.listRateCents),
    weeklyCashCents: weeklyAmountCents(pkg.hoursPerWeek, pkg.cashRateCents),
    equityPerHourCents: equityPerHourCents(pkg.listRateCents, pkg.cashRateCents),
    equityPerWeekCents: equityPerWeekCents(pkg.hoursPerWeek, pkg.listRateCents, pkg.cashRateCents),
  };
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json lib/operate/pricing.ts lib/operate/pricing.test.ts
git commit -m "$(cat <<'EOF'
Add the deal letter pricing math.

EOF
)"
```

---

### Task 2: Database

**Files:**
- Create: `lib/operate/schema.ts`
- Create: `lib/operate/db.ts`
- Create: `lib/operate/deals.ts`
- Modify: `package.json`
- Test: `npm run typecheck`

**Interfaces:**
- Consumes: `TermLength`, `validatePackage`, `toLetterPackage`, `termLabel`, `LetterDeal` from `lib/operate/pricing.ts`
- Produces:
  - `getDb(): Db`
  - `listDeals(): Promise<DealListItem[]>`
  - `getDeal(id: string): Promise<DealRecord | null>`
  - `getDealByToken(token: string): Promise<DealRecord | null>`
  - `createDeal(input: { companyName: string }): Promise<DealRecord>`
  - `saveDeal(id: string, input: DealDraft): Promise<{ ok: true } | { ok: false; error: string }>`
  - `selectPackage(token: string, packageId: string): Promise<{ ok: true } | { ok: false; error: string }>`
  - `dealToLetter(deal: DealRecord): LetterDeal`

A `DealRecord` includes the deal columns and `packages`. A `DealDraft` is the editable fields: company, contact name, contact role, equity flag, term, round, valuation dollars, hourly cost cents, and the package rows.

- [ ] **Step 1: Install the database client**

```bash
npm install drizzle-orm @neondatabase/serverless
npm install --save-dev drizzle-kit
```

- [ ] **Step 2: Write the schema**

`lib/operate/schema.ts`:

```ts
import { boolean, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const deals = pgTable("deals", {
  id: uuid("id").primaryKey().defaultRandom(),
  token: text("token").notNull().unique(),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull().default(""),
  contactRole: text("contact_role").notNull().default(""),
  equityEnabled: boolean("equity_enabled").notNull().default(false),
  termLength: text("term_length").notNull().default("six-month"),
  round: text("round"),
  valuationDollars: bigint("valuation_dollars", { mode: "bigint" }),
  hourlyCostCents: integer("hourly_cost_cents"),
  selectedPackageId: uuid("selected_package_id"),
  hubspotContactId: text("hubspot_contact_id"),
  hubspotDealId: text("hubspot_deal_id"),
});

export const packages = pgTable("packages", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealId: uuid("deal_id").notNull().references(() => deals.id, { onDelete: "cascade" }),
  serviceName: text("service_name").notNull(),
  hoursPerWeek: integer("hours_per_week").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  listRateCents: integer("list_rate_cents").notNull(),
  cashRateCents: integer("cash_rate_cents").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});
```

- [ ] **Step 3: Write a lazy client**

`lib/operate/db.ts` must not connect at import time.

```ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  const sql = neon(url);
  return drizzle(sql, { schema });
}
```

- [ ] **Step 4: Write deal reads and writes**

`lib/operate/deals.ts` uses `crypto.randomBytes(32).toString("base64url")` for the token. `createDeal` inserts the company and two disabled-until-edited packages are not implied: start with one enabled package, service name "Design Engineering", 40 hours, list rate 0, cash rate 0. The editor can add the 80-hour row.

`saveDeal` runs `validatePackage` for every row and rejects the whole save on the first error. It replaces the package rows for that deal inside the application sequence: delete packages for the deal, insert the submitted rows, update the deal. If the selected package id is no longer an enabled row, clear it.

`selectPackage` loads by token, finds an enabled package with that id, and sets `selectedPackageId`. Missing token or missing package returns `{ ok: false, error: "Package not found." }`.

`dealToLetter` keeps only enabled packages, ordered by `sortOrder`, and fills `LetterDeal` through `toLetterPackage` and `termLabel`.

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json lib/operate/schema.ts lib/operate/db.ts lib/operate/deals.ts
git commit -m "$(cat <<'EOF'
Store deals and packages for the operate letter.

EOF
)"
```

Apply the schema to the Neon database James provides:

```bash
npx drizzle-kit push
```

`drizzle.config.ts` reads `DATABASE_URL` and points `schema` at `./lib/operate/schema.ts`. Do not run this in CI.

---

### Task 3: Google gate

**Files:**
- Create: `auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `middleware.ts`
- Create: `app/operate/sign-in/page.tsx`
- Create: `app/operate/layout.tsx`
- Modify: `package.json`

**Interfaces:**
- Consumes: nothing from Task 2
- Produces: `auth`, `signIn`, `signOut` from `auth.ts`. Middleware allows `/operate/sign-in` and `/operate/d/*` without a session.

- [ ] **Step 1: Install Auth.js**

```bash
npm install next-auth@5
```

- [ ] **Step 2: Write the auth module**

```ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: { signIn: "/operate/sign-in" },
  callbacks: {
    signIn({ profile }) {
      const email = profile?.email ?? "";
      return email.toLowerCase().endsWith("@bloomventures.com");
    },
  },
});
```

```ts
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

- [ ] **Step 3: Write the middleware**

```ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const path = req.nextUrl.pathname;
  if (path.startsWith("/operate/d/") || path === "/operate/sign-in") return NextResponse.next();
  if (!path.startsWith("/operate")) return NextResponse.next();
  if (req.auth) return NextResponse.next();
  const signInUrl = new URL("/operate/sign-in", req.nextUrl.origin);
  return NextResponse.redirect(signInUrl);
});

export const config = {
  matcher: ["/operate/:path*"],
};
```

- [ ] **Step 4: Write the sign-in page and the operate layout**

The layout sets the ground to `#FAF6EC`, the text to `#070F18`, and the font to `var(--font-archivo)`. It does not render `TopNav`, `SideNav`, or `LenisProvider`.

The sign-in page is a server component with a form that calls `signIn("google")`. Copy: "Sign in with Google to open Operate."

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: PASS without `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, or `AUTH_GOOGLE_SECRET`.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json auth.ts middleware.ts app/api/auth app/operate/layout.tsx app/operate/sign-in/page.tsx
git commit -m "$(cat <<'EOF'
Gate Operate with Google and leave the customer link open.

EOF
)"
```

---

### Task 4: The letter

**Files:**
- Create: `components/operate/DealLetter.tsx`
- Test: `npm run typecheck`

**Interfaces:**
- Consumes: `LetterDeal` from `lib/operate/pricing.ts`, `formatDollars`
- Produces: `DealLetter({ deal, mode, onSelect }: { deal: LetterDeal; mode: "customer" | "preview"; onSelect?: (packageId: string) => void })`

- [ ] **Step 1: Write the component**

`"use client"`. One scroll.

Greeting: `Hello ` then the company name in `#FA4C1F`, then `, so nice to see you again.`

Term label under the greeting.

Each package is a button when `mode` is `"customer"`, and a div when `mode` is `"preview"`. The selected id gets a visible mark (a 2px ink outline).

Equity on: list rate and weekly list use `line-through` and a muted ink. Cash rate and weekly cash are the primary figures. Under the rows, one sentence:

`The {formatDollars(equityPerHourCents)}/hour discount ({formatDollars(equityPerWeekCents)}/week) is applied as in-kind consideration toward an equity position.`

Use the selected package for that sentence. If none is selected, use the first package.

Equity off: show `formatDollars(listRateCents)` and `formatDollars(weeklyListCents)` only. Do not render the equity sentence.

Hours render as `{hours} / week`.

The wordmark is an `img` with `src="/bloom-wordmark.svg"`, large, ink at low opacity, behind the content, `aria-hidden`. The footer is the mark `src="/bloom-mark.svg"` at its natural size and the text `james@bloomventures.com`.

Selecting a customer row `fetch`es `POST` to `/operate/d/${token}/select` is not this component's job. The customer page passes an `onSelect(packageId)` prop. Add that prop as optional. In customer mode, clicking calls `onSelect`.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add components/operate/DealLetter.tsx
git commit -m "$(cat <<'EOF'
Render the deal letter as a selectable price page.

EOF
)"
```

---

### Task 5: Staff editor

**Files:**
- Create: `app/operate/page.tsx`
- Create: `app/operate/actions.ts`
- Create: `app/operate/[dealId]/page.tsx`
- Create: `app/operate/[dealId]/editor.tsx`

**Interfaces:**
- Consumes: `listDeals`, `getDeal`, `createDeal`, `saveDeal`, `dealToLetter`, `DealLetter`
- Produces: the staff list and the editor screen

- [ ] **Step 1: Write server actions**

`app/operate/actions.ts` is `"use server"`. `auth()` must return a session or the action throws. `createDealAction` reads `companyName` from form data, calls `createDeal`, and redirects to `/operate/${id}`. `saveDealAction` parses the form into a `DealDraft` and calls `saveDeal`. Rates in the form are dollar strings; multiply by 100 and round to integer cents before validation.

The form can post two package rows for this use case, 40 hours and 80 hours. Each row has enabled, service name, hours, list rate, and cash rate. An empty second row is dropped.

- [ ] **Step 2: Write the list**

`app/operate/page.tsx` lists company name and term label, links to the editor, and includes the create form. If `DATABASE_URL` is missing, render "Operate needs a database." and do not call `getDb`.

- [ ] **Step 3: Write the editor**

The page loads the deal. The client editor holds the draft and renders `DealLetter` in `preview` mode beside the fields. Staff-only fields are round, valuation in dollars, and hourly cost in dollars. They are labeled as not shown to the customer. Saving posts the server action. The private link is shown as `{origin}/operate/d/{token}` with a copy button.

- [ ] **Step 4: Typecheck and build**

Run: `npm run typecheck && npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/operate/page.tsx app/operate/actions.ts app/operate/[dealId]/page.tsx app/operate/[dealId]/editor.tsx
git commit -m "$(cat <<'EOF'
Let Bloom edit a deal and see the letter update.

EOF
)"
```

---

### Task 6: Customer link

**Files:**
- Create: `app/operate/d/[token]/page.tsx`
- Create: `app/operate/d/[token]/select/route.ts`

**Interfaces:**
- Consumes: `getDealByToken`, `selectPackage`, `dealToLetter`, `DealLetter`
- Produces: the public-by-token letter and the selection endpoint

- [ ] **Step 1: Write the page**

Server component. `getDealByToken` miss calls `notFound()`. Metadata:

```ts
export const metadata = {
  robots: { index: false, follow: false },
  title: "Bloom",
};
```

Render `DealLetter` in customer mode. Pass `onSelect` from a small client wrapper that posts `{ packageId }` to `/operate/d/${token}/select` and routes a refresh with `router.refresh()` on success.

- [ ] **Step 2: Write the selection route**

`POST` reads JSON `{ packageId: string }`. Calls `selectPackage`. Returns 404 when the result is not ok. Returns 200 `{ ok: true }` when it is.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add app/operate/d
git commit -m "$(cat <<'EOF'
Open a customer's deal letter from a private link.

EOF
)"
```

---

### Task 7: Map and checks

**Files:**
- Modify: `docs/engineering.md`

- [ ] **Step 1: Record the exception**

Under "The page is one route", add this paragraph after the sentence that says there is no server and no database:

```markdown
`/operate` is the exception James asked for on 28 October 2026. It has a Postgres database and Google sign-in for `@bloomventures.com`. The public page does not use that database. The customer letter lives at `/operate/d/[token]`.
```

- [ ] **Step 2: Run the checks**

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Expected: all four pass. `npm run build` passes with the four operate env vars unset.

- [ ] **Step 3: Commit**

```bash
git add docs/engineering.md
git commit -m "$(cat <<'EOF'
Record that Operate is the one route with a database.

EOF
)"
```

Open the pull request against `main`. The description names Simon as the reviewer for layout, type, and color, and states that HubSpot, DocuSign, the scope, and the terms are not in this pull request.
