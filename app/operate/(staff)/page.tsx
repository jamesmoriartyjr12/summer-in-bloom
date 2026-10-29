import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowDown, ArrowUp } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import { listDashboard, type DashboardDeal } from "@/lib/operate/deals";
import {
  averageBillableCents,
  billableHourCents,
  contractValueCents,
  formatDollars,
  termLabel,
  termWeeks,
} from "@/lib/operate/pricing";
import { createDealAction } from "@/app/operate/actions";
import { DealAvatar } from "./deal-avatar";
import { DealDashboard, RateBadge } from "./dashboard";

export const dynamic = "force-dynamic";

const SORTS = ["company", "hours", "length", "value"] as const;
type Sort = (typeof SORTS)[number];
type Direction = "asc" | "desc";

const COLUMNS = "md:grid md:grid-cols-[minmax(0,1fr)_6.5rem_7rem_9rem_6.5rem_8rem] md:gap-6";

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function isSort(value: string): value is Sort {
  return (SORTS as readonly string[]).includes(value);
}

type PipelineRow = {
  deal: DashboardDeal;
  hoursPerWeek: number | null;
  weeks: number | null;
  valueCents: number | null;
};

function toRow(deal: DashboardDeal): PipelineRow {
  const quoted = deal.offers.find((offer) => offer.sortOrder === deal.selectedSortOrder) ?? deal.offers[0];
  if (!quoted) return { deal, hoursPerWeek: null, weeks: termWeeks(deal.termLength), valueCents: null };
  const rate = billableHourCents(quoted.listRateCents, quoted.cashRateCents, deal.equityEnabled);
  return {
    deal,
    hoursPerWeek: quoted.hoursPerWeek,
    weeks: termWeeks(deal.termLength),
    valueCents: contractValueCents(quoted.hoursPerWeek, rate, deal.termLength),
  };
}

function sortKey(row: PipelineRow, sort: Exclude<Sort, "company">): number | null {
  if (sort === "hours") return row.hoursPerWeek;
  if (sort === "length") return row.weeks;
  return row.valueCents;
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
  const billableCents = averageBillableCents(deals);
  const requested = one(searchParams.sort);
  const sort: Sort = isSort(requested) ? requested : "company";
  const direction: Direction = one(searchParams.dir) === "desc" ? "desc" : "asc";
  const rows = sortRows(deals.map(toRow), sort, direction);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="operate-label text-muted-foreground">Operate</p>
          <h1 className="mt-2 text-4xl font-medium tracking-tight">Deals</h1>
        </div>
        <form action={createDealAction} className="flex items-center gap-2">
          <label htmlFor="new-deal-company" className="sr-only">
            Company name
          </label>
          <Input id="new-deal-company" name="companyName" required placeholder="Company name" className="w-60" />
          <Button type="submit">Add deal</Button>
        </form>
      </div>
      {error === "company" ? <p className="mt-4 text-right text-sm text-orange">Enter a company name.</p> : null}

      <DealDashboard
        rates={rates}
        billableCents={billableCents}
        dealCount={deals.length}
        notice={notice}
      />

      <p className="operate-label mt-12 text-muted-foreground">Pipeline</p>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No deals yet.</p>
      ) : (
        <>
          <div className={`mt-4 hidden px-4 ${COLUMNS}`}>
            <SortHeader column="company" label="Company" sort={sort} direction={direction} />
            <SortHeader column="hours" label="Hrs/week" sort={sort} direction={direction} align="right" />
            <SortHeader column="length" label="Length" sort={sort} direction={direction} />
            <SortHeader column="value" label="Value" sort={sort} direction={direction} align="right" />
            <span className="operate-label text-muted-foreground">Rates</span>
            <span aria-hidden="true" />
          </div>
          <ItemGroup className="mt-3 gap-3">
            {rows.map(({ deal, hoursPerWeek, valueCents }) => (
              <Item
                key={deal.id}
                variant="outline"
                className={`relative items-center bg-card transition-colors hover:border-orange ${COLUMNS}`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <ItemMedia>
                    <DealAvatar companyName={deal.companyName} logoUrl={deal.companyLogoUrl} size="lg" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="text-base">
                      <Link href={`/operate/${deal.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
                        {deal.companyName}
                      </Link>
                    </ItemTitle>
                    <ItemDescription className="line-clamp-1">
                      {[deal.contactName, deal.contactRole].filter(Boolean).join(" · ") || "No contact yet"}
                    </ItemDescription>
                  </ItemContent>
                </div>
                <span className="text-right tabular-nums">{hoursPerWeek === null ? "—" : hoursPerWeek}</span>
                <span className="operate-label text-muted-foreground">{termLabel(deal.termLength)}</span>
                <span className="text-right text-base font-medium tabular-nums">
                  {valueCents === null ? "—" : formatDollars(valueCents)}
                </span>
                <span>
                  <RateBadge custom={deal.ratesOverridden} />
                </span>
                <Button asChild variant="outline" size="sm" className="relative z-10 justify-self-end">
                  <a href={`/operate/d/${deal.token}`} target="_blank" rel="noreferrer">
                    Client page
                  </a>
                </Button>
              </Item>
            ))}
          </ItemGroup>
        </>
      )}
    </main>
  );
}
