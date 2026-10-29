import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import { listDashboard, type DashboardDeal } from "@/lib/operate/deals";
import {
  averageBillableCents,
  billableHourCents,
  contractValueCents,
  equityValueCents,
  formatDollars,
  termLabel,
  termMonths,
  type OfferRate,
} from "@/lib/operate/pricing";
import { DealAvatar } from "./deal-avatar";
import { DealDashboard } from "./dashboard";

export const dynamic = "force-dynamic";

const SORTS = ["company", "hours", "length", "rate", "equity", "value"] as const;
type Sort = (typeof SORTS)[number];
type Direction = "asc" | "desc";

const COLUMNS = "md:grid md:grid-cols-[minmax(0,1fr)_5.5rem_7rem_7rem_8.5rem_8.5rem] md:gap-6";

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function isSort(value: string): value is Sort {
  return (SORTS as readonly string[]).includes(value);
}

type PipelineRow = {
  deal: DashboardDeal;
  quoted: OfferRate | null;
  months: number | null;
  rateCents: number | null;
  valueCents: number | null;
  equityCents: number | null;
};

function toRow(deal: DashboardDeal): PipelineRow {
  const quoted = deal.offers.find((offer) => offer.sortOrder === deal.selectedSortOrder) ?? deal.offers[0] ?? null;
  const months = termMonths(deal.termLength);
  if (!quoted) return { deal, quoted, months, rateCents: null, valueCents: null, equityCents: null };
  const rate = billableHourCents(quoted.listRateCents, quoted.cashRateCents, deal.equityEnabled);
  return {
    deal,
    quoted,
    months,
    rateCents: rate,
    valueCents: contractValueCents(quoted.hoursPerWeek, rate, deal.termLength),
    equityCents: deal.equityEnabled
      ? equityValueCents(quoted.hoursPerWeek, quoted.listRateCents, quoted.cashRateCents, deal.termLength)
      : null,
  };
}

function sortKey(row: PipelineRow, sort: Exclude<Sort, "company">): number | null {
  if (sort === "hours") return row.quoted?.hoursPerWeek ?? null;
  if (sort === "length") return row.months;
  if (sort === "rate") return row.rateCents;
  if (sort === "equity") return row.equityCents;
  return row.valueCents;
}

function Money({ cents }: { cents: number | null }) {
  if (cents === null) return <span className="text-right text-muted-foreground">—</span>;
  return <span className="text-right text-base font-medium tabular-nums">{formatDollars(cents)}</span>;
}

function Rate({ cents, custom }: { cents: number | null; custom: boolean }) {
  if (cents === null) return <span className="text-right text-muted-foreground">—</span>;
  return (
    <span className="grid justify-items-end gap-0.5 text-right tabular-nums">
      <span>{formatDollars(cents)}/hr</span>
      {custom ? <span className="operate-label text-[10px] text-orange">Custom</span> : null}
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
      {rows.length === 0 ? (
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
          </div>
          <ItemGroup className="mt-3 gap-3">
            {rows.map(({ deal, quoted, months, rateCents, valueCents, equityCents }) => (
              <Item
                key={deal.id}
                variant="outline"
                className={`relative items-center bg-card transition-colors focus-within:border-orange hover:border-orange ${COLUMNS}`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <ItemMedia>
                    <DealAvatar companyName={deal.companyName} logoUrl={deal.companyLogoUrl} size="lg" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="w-full text-base">
                      <Link
                        href={`/operate/${deal.id}`}
                        className="truncate after:absolute after:inset-0 focus-visible:outline-none"
                      >
                        {deal.companyName}
                      </Link>
                    </ItemTitle>
                    <ItemDescription className="line-clamp-1">
                      {[deal.contactName, deal.contactRole].filter(Boolean).join(" · ") || "No contact yet"}
                    </ItemDescription>
                  </ItemContent>
                </div>
                <span className="text-right tabular-nums">{quoted ? quoted.hoursPerWeek : "—"}</span>
                <span className="tabular-nums">{months === null ? termLabel(deal.termLength) : `${months} months`}</span>
                <Rate cents={rateCents} custom={deal.ratesOverridden} />
                <Money cents={equityCents} />
                <Money cents={valueCents} />
              </Item>
            ))}
          </ItemGroup>
        </>
      )}
    </main>
  );
}
