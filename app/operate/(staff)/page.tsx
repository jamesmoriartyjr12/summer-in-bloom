import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import { listDashboard, type DashboardDeal } from "@/lib/operate/deals";
import { contactFullName } from "@/lib/operate/linkedin";
import {
  averageCents,
  bundleQuote,
  formatDollars,
  lineRateCents,
  quotedTerm,
  termMonths,
  termWeeks,
  type ClientTerm,
} from "@/lib/operate/pricing";
import { DealAvatar } from "./deal-avatar";
import { DealMenu } from "./deal-menu";
import { DealDashboard } from "./dashboard";

export const dynamic = "force-dynamic";

const SORTS = ["company", "hours", "length", "rate", "equity", "value"] as const;
type Sort = (typeof SORTS)[number];
type Direction = "asc" | "desc";

const COLUMNS = "md:grid md:grid-cols-[minmax(0,1fr)_4.5rem_6rem_5.5rem_7rem_7rem_2rem] md:gap-4";

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function isSort(value: string): value is Sort {
  return (SORTS as readonly string[]).includes(value);
}

type PipelineRow = {
  deal: DashboardDeal;
  term: ClientTerm;
  hours: number | null;
  months: number | null;
  rateCents: number | null;
  valueCents: number | null;
  equityCents: number | null;
};

// Until the client chooses, a deal is valued on its first term, all cash.
function dealTerm(deal: DashboardDeal): ClientTerm {
  return quotedTerm(deal.termOffer, deal.selectedTerm);
}

// The billable rate is the bundle's cash per hour: what the client is billed, across every line.
function toRow(deal: DashboardDeal): PipelineRow {
  const term = dealTerm(deal);
  const months = termMonths(term);
  const quote = bundleQuote(
    deal.lines.map((line) => ({ hoursPerWeek: line.hoursPerWeek, listRateCents: lineRateCents(line, term) })),
    termWeeks(term) ?? 0,
    deal.equityEnabled ? deal.selectedEquityCents : 0,
    deal.cashFloorCents,
  );
  if (quote.hoursPerWeek === 0) {
    return { deal, term, hours: null, months, rateCents: null, valueCents: null, equityCents: null };
  }
  return {
    deal,
    term,
    hours: quote.hoursPerWeek,
    months,
    rateCents: Math.round(quote.weeklyCashCents / quote.hoursPerWeek),
    valueCents: quote.totalCashCents,
    equityCents: deal.equityEnabled ? quote.equityTotalCents : null,
  };
}

function sortKey(row: PipelineRow, sort: Exclude<Sort, "company">): number | null {
  if (sort === "hours") return row.hours;
  if (sort === "length") return row.months;
  if (sort === "rate") return row.rateCents;
  if (sort === "equity") return row.equityCents;
  return row.valueCents;
}

function OutLink({ href, children }: { href: string | null; children: React.ReactNode }) {
  if (!href) return <span className="truncate">{children}</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="relative z-10 truncate underline-offset-4 hover:text-orange hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </a>
  );
}

function Contact({ deal }: { deal: DashboardDeal }) {
  const name = contactFullName(deal.contactName, deal.linkedinUrl);
  if (!name && !deal.contactRole) return <ItemDescription className="line-clamp-1">No contact yet</ItemDescription>;
  return (
    <ItemDescription className="line-clamp-1">
      {name ? <OutLink href={deal.linkedinUrl}>{name}</OutLink> : null}
      {name && deal.contactRole ? " · " : null}
      {deal.contactRole}
    </ItemDescription>
  );
}

function Money({ cents, suffix = "" }: { cents: number | null; suffix?: string }) {
  if (cents === null) return <span className="text-right text-muted-foreground">—</span>;
  return (
    <span className="text-right tabular-nums">
      {formatDollars(cents)}
      {suffix}
    </span>
  );
}

function sortRows(rows: PipelineRow[], sort: Sort, direction: Direction): PipelineRow[] {
  const sign = direction === "asc" ? 1 : -1;
  return [...rows].sort((left, right) => {
    if (sort === "company") return sign * left.deal.companyName.localeCompare(right.deal.companyName);
    const a = sortKey(left, sort);
    const b = sortKey(right, sort);
    if (a === null && b === null) return left.deal.companyName.localeCompare(right.deal.companyName);
    if (a === null) return 1;
    if (b === null) return -1;
    return sign * (a - b) || left.deal.companyName.localeCompare(right.deal.companyName);
  });
}

function SortHeader({
  column,
  label,
  sort,
  direction,
  align = "left",
}: {
  column: Sort;
  label: string;
  sort: Sort;
  direction: Direction;
  align?: "left" | "right";
}) {
  const active = column === sort;
  const next: Direction = active && direction === "asc" ? "desc" : "asc";
  const Arrow = direction === "asc" ? ArrowUp : ArrowDown;
  return (
    <Link
      href={`/operate?sort=${column}&dir=${next}`}
      scroll={false}
      aria-label={`Sort by ${label.toLowerCase()}, ${next === "asc" ? "ascending" : "descending"}`}
      className={`operate-label flex items-center gap-1.5 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        align === "right" ? "justify-end" : ""
      } ${active ? "text-foreground" : "text-muted-foreground"}`}
    >
      {label}
      {active ? <Arrow aria-hidden="true" className="size-3" /> : null}
    </Link>
  );
}

export default async function OperatePage({
  searchParams,
}: {
  searchParams: {
    error?: string | string[];
    message?: string | string[];
    sort?: string | string[];
    dir?: string | string[];
  };
}) {
  const session = await auth();
  if (!session) redirect("/operate/sign-in");

  if (!process.env.DATABASE_URL) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p>Operate needs a database.</p>
      </main>
    );
  }

  const { rates, deals } = await listDashboard();
  const error = one(searchParams.error);
  const notice = error === "rates" ? one(searchParams.message) : "";
  const rows = deals.map(toRow);
  const billableCents = averageCents(rows.map((row) => row.rateCents));
  const requested = one(searchParams.sort);
  const sort: Sort = isSort(requested) ? requested : "company";
  const direction: Direction = one(searchParams.dir) === "desc" ? "desc" : "asc";
  const sorted = sortRows(rows, sort, direction);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="operate-label text-muted-foreground">Operate</p>
          <h1 className="mt-2 text-4xl font-medium tracking-tight">Deals</h1>
        </div>
        <Button asChild>
          <Link href="/operate/new">
            <Plus aria-hidden="true" className="size-4" />
            Add deal
          </Link>
        </Button>
      </div>

      <DealDashboard
        rates={rates}
        billableCents={billableCents}
        dealCount={deals.length}
        notice={notice}
      />

      <p className="operate-label mt-12 text-muted-foreground">Pipeline</p>
      {sorted.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No deals yet.</p>
      ) : (
        <>
          <div className={`mt-4 hidden px-4 ${COLUMNS}`}>
            <SortHeader column="company" label="Company" sort={sort} direction={direction} />
            <SortHeader column="hours" label="Hrs/week" sort={sort} direction={direction} align="right" />
            <SortHeader column="length" label="Length" sort={sort} direction={direction} />
            <SortHeader column="rate" label="Rate" sort={sort} direction={direction} align="right" />
            <SortHeader column="equity" label="Equity" sort={sort} direction={direction} align="right" />
            <SortHeader column="value" label="Value" sort={sort} direction={direction} align="right" />
            <span aria-hidden="true" />
          </div>
          <ItemGroup className="mt-3 gap-3">
            {sorted.map(({ deal, hours, months, rateCents, valueCents, equityCents }) => (
              <Item
                key={deal.id}
                variant="outline"
                className={`relative items-center bg-card transition-colors focus-within:border-orange hover:border-orange ${COLUMNS}`}
              >
                <Link
                  href={`/operate/${deal.id}`}
                  aria-label={`Open ${deal.companyName}`}
                  className="absolute inset-0 rounded-lg focus-visible:outline-none"
                />
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <ItemMedia>
                    <DealAvatar companyName={deal.companyName} logoUrl={deal.companyLogoUrl} size="lg" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="w-full">
                      <OutLink href={deal.companyUrl}>{deal.companyName}</OutLink>
                    </ItemTitle>
                    <Contact deal={deal} />
                  </ItemContent>
                </div>
                <span className="text-right tabular-nums">{hours ?? "—"}</span>
                <span className="tabular-nums">{months === null ? "—" : `${months} months`}</span>
                <Money cents={rateCents} suffix="/hr" />
                <Money cents={equityCents} />
                <Money cents={valueCents} />
                <DealMenu dealId={deal.id} token={deal.token} companyName={deal.companyName} />
              </Item>
            ))}
          </ItemGroup>
        </>
      )}
    </main>
  );
}
