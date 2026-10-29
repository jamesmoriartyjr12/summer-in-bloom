"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatDollars } from "@/lib/operate/pricing";
import { saveBaseRatesAction } from "@/app/operate/actions";

type Rate = {
  serviceName: string;
  hoursPerWeek: number;
  listRateCents: number;
  cashRateCents: number;
  sortOrder: number;
};

function centsToInput(cents: number): string {
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
}

function money(cents: number | null): string {
  return cents === null ? "—" : formatDollars(cents);
}

// Offers can carry different list rates; show a range rather than hide one.
function baselineLabel(rates: Rate[]): string {
  if (rates.length === 0) return "—";
  const list = rates.map((rate) => rate.listRateCents);
  const low = Math.min(...list);
  const high = Math.max(...list);
  return low === high ? formatDollars(low) : `${formatDollars(low)}–${formatDollars(high)}`;
}

export function DealDashboard({
  rates,
  billableCents,
  dealCount,
  notice,
}: {
  rates: Rate[];
  billableCents: number | null;
  dealCount: number;
  notice: string;
}) {
  const [open, setOpen] = useState(notice !== "");

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
            <p className="mt-4 text-4xl font-medium tracking-tight tabular-nums">{baselineLabel(rates)}</p>
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
          <form action={saveBaseRatesAction} className="grid gap-4">
            {notice ? <p className="text-sm text-orange">{notice}</p> : null}
            {rates.map((rate) => (
              <div key={rate.sortOrder} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <label className="grid gap-1 text-sm sm:col-span-1">
                  <span className="operate-label text-muted-foreground">Service</span>
                  <Input name={`offer${rate.sortOrder}Service`} defaultValue={rate.serviceName} required />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="operate-label text-muted-foreground">Hours</span>
                  <Input
                    name={`offer${rate.sortOrder}Hours`}
                    type="number"
                    min={1}
                    step={1}
                    defaultValue={rate.hoursPerWeek}
                    required
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="operate-label text-muted-foreground">List</span>
                  <Input
                    name={`offer${rate.sortOrder}List`}
                    inputMode="decimal"
                    defaultValue={centsToInput(rate.listRateCents)}
                    required
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="operate-label text-muted-foreground">Cash</span>
                  <Input
                    name={`offer${rate.sortOrder}Cash`}
                    inputMode="decimal"
                    defaultValue={centsToInput(rate.cashRateCents)}
                    required
                  />
                </label>
              </div>
            ))}
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