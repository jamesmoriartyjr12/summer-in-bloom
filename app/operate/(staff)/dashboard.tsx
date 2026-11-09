"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  baseRateCents,
  CLIENT_TERMS,
  formatDollars,
  sheetRateCents,
  termMonths,
  type OfferRate,
} from "@/lib/operate/pricing";
import { saveBaseRateAction } from "@/app/operate/actions";

function centsToInput(cents: number): string {
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
}

function money(cents: number | null): string {
  return cents === null ? "—" : formatDollars(cents);
}

function inputToCents(raw: string): number | null {
  const cents = Math.round(Number(raw.replace(/[$,\s]/g, "")) * 100);
  return raw.trim() !== "" && Number.isFinite(cents) && cents > 0 ? cents : null;
}

export function DealDashboard({
  rates,
  billableCents,
  dealCount,
  notice,
}: {
  rates: OfferRate[];
  billableCents: number | null;
  dealCount: number;
  notice: string;
}) {
  const [open, setOpen] = useState(notice !== "");
  const base = baseRateCents(rates);
  const [draft, setDraft] = useState(base === null ? "" : centsToInput(base));
  const draftCents = inputToCents(draft);

  return (
    <>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Card className="h-full p-5 transition-colors group-hover:border-orange">
            <span className="operate-label text-muted-foreground">Baseline</span>
            <p className="mt-4 text-4xl font-medium tracking-tight tabular-nums">{money(base)}</p>
            <span className="mt-4 block text-sm text-muted-foreground">Per hour · Click to change</span>
          </Card>
        </button>

        <Card className="p-5">
          <span className="operate-label text-muted-foreground">Avg billable</span>
          <p className="mt-4 text-4xl font-medium tracking-tight text-orange tabular-nums">
            {money(billableCents)}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            {dealCount === 1 ? "Across 1 deal" : `Across ${dealCount} deals`}
          </p>
        </Card>

        <Card className="p-5">
          <span className="operate-label text-muted-foreground">Deals</span>
          <p className="mt-4 text-4xl font-medium tracking-tight tabular-nums">{dealCount}</p>
          <p className="mt-4 text-sm text-muted-foreground">Open</p>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Baseline</DialogTitle>
          </DialogHeader>
          <form action={saveBaseRateAction} className="grid gap-5">
            {notice ? <p className="text-sm text-orange">{notice}</p> : null}
            <label className="grid gap-1.5 text-sm">
              <span className="operate-label text-muted-foreground">Base rate, per hour</span>
              <Input
                name="baseRate"
                inputMode="decimal"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                required
              />
              <span className="text-xs text-muted-foreground">
                Each 40 hours a week past the first takes $10 off. Twelve months takes $20 off.
              </span>
            </label>
            <table className="w-full text-sm tabular-nums">
              <thead>
                <tr className="operate-label text-[11px] text-muted-foreground">
                  <th className="pb-2 text-left font-normal">Hours / week</th>
                  {CLIENT_TERMS.map((term) => (
                    <th key={term} className="pb-2 text-right font-normal">
                      {termMonths(term)} months
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rates.map((rate) => (
                  <tr key={rate.sortOrder} className="border-t border-border">
                    <td className="py-2">{rate.hoursPerWeek}</td>
                    {CLIENT_TERMS.map((term) => (
                      <td key={term} className="py-2 text-right">
                        {draftCents === null ? "—" : `${formatDollars(sheetRateCents(draftCents, rate.hoursPerWeek, term))}/hr`}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex gap-2">
              <Button type="submit">Save</Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}