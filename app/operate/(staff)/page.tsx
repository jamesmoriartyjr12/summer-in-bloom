import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listDashboard } from "@/lib/operate/deals";
import { averageBillableCents, termLabel } from "@/lib/operate/pricing";
import { createDealAction } from "@/app/operate/actions";
import { DealDashboard, RateBadge } from "./dashboard";

export const dynamic = "force-dynamic";

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function OperatePage({
  searchParams,
}: {
  searchParams: { error?: string | string[]; message?: string | string[] };
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

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="operate-label text-muted-foreground">Operate</p>
      <h1 className="mt-2 text-4xl font-medium tracking-tight">Deals</h1>
      {error === "company" ? <p className="mt-4 text-sm text-orange">Enter a company name.</p> : null}

      <DealDashboard
        rates={rates}
        billableCents={billableCents}
        dealCount={deals.length}
        notice={notice}
      />

      <form action={createDealAction} className="mt-10 flex flex-wrap items-center gap-3">
        <label className="flex flex-wrap items-center gap-3 text-sm">
          <span>New deal</span>
          <Input name="companyName" required placeholder="Company name" className="w-60" />
        </label>
        <Button type="submit">Create</Button>
      </form>

      {deals.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">No deals yet.</p>
      ) : (
        <ul className="mt-8 border-t border-border">
          {deals.map((deal) => (
            <li key={deal.id} className="flex flex-wrap items-baseline justify-between gap-4 border-b border-border py-4">
              <Link href={`/operate/${deal.id}`} className="text-lg font-medium hover:text-orange">
                {deal.companyName}
                {deal.contactName ? (
                  <span className="font-normal text-muted-foreground"> · {deal.contactName}</span>
                ) : null}
              </Link>
              <span className="flex items-center gap-4 text-sm">
                <RateBadge custom={deal.ratesOverridden} />
                <span className="text-muted-foreground">{termLabel(deal.termLength)}</span>
                <a href={`/operate/d/${deal.token}`} target="_blank" rel="noreferrer" className="hover:text-orange">
                  Client page
                </a>
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
