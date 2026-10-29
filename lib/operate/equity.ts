// Cash never drops under the floor unless staff lower it on the deal.
export const MIN_CASH_RATE_CENTS = 15000;
export const EQUITY_STEP_CENTS = 1000;
export const DEFAULT_MULTIPLIER = 2;

export type EquityBasis = "dollar" | "multiplier" | "percent";
export type ValuationBasis = "pre" | "post";

export const EQUITY_BASES: readonly EquityBasis[] = ["dollar", "multiplier", "percent"];

export function isEquityBasis(value: string): value is EquityBasis {
  return value === "dollar" || value === "multiplier" || value === "percent";
}

export function isValuationBasis(value: string): value is ValuationBasis {
  return value === "pre" || value === "post";
}

export function equityBasisLabel(basis: EquityBasis): string {
  if (basis === "dollar") return "Dollar for dollar";
  if (basis === "multiplier") return "Multiplier";
  return "Whole percentage";
}

// Earlier companies get a multiplier; Series A and later trade dollar for dollar.
export function defaultEquityBasis(round: string | null): EquityBasis {
  if (round && /pre-?seed|seed|angel|friends/i.test(round)) return "multiplier";
  return "dollar";
}

export function cashRateAt(listRateCents: number, stepCents: number, floorCents: number): number {
  if (listRateCents <= floorCents) return listRateCents;
  return Math.max(floorCents, listRateCents - stepCents);
}

// Steps run in $10 an hour, up to what the most expensive offer can move above the floor.
export function equitySteps(listRatesCents: number[], floorCents: number): number[] {
  const room = Math.max(0, ...listRatesCents.map((rate) => rate - floorCents));
  const steps = [0];
  for (let step = EQUITY_STEP_CENTS; step <= room; step += EQUITY_STEP_CENTS) steps.push(step);
  return steps;
}

export type OwnershipTerms = {
  valuationDollars: number | null;
  valuationBasis: ValuationBasis;
  equityBasis: EquityBasis;
  multiplier: number;
};

// The percentage of the company the equity dollars buy, to two places.
export function ownershipPercent(equityCents: number | null, terms: OwnershipTerms): number | null {
  if (equityCents === null || equityCents <= 0) return null;
  if (terms.valuationDollars === null || terms.valuationDollars <= 0) return null;
  const invested = equityCents / 100;
  const postMoney = terms.valuationBasis === "pre" ? terms.valuationDollars + invested : terms.valuationDollars;
  const credited = terms.equityBasis === "multiplier" ? invested * terms.multiplier : invested;
  const percent = (credited / postMoney) * 100;
  if (terms.equityBasis === "percent") return Math.max(1, Math.ceil(percent));
  return Math.round(percent * 100) / 100;
}

export function formatPercent(percent: number): string {
  return `${percent.toLocaleString("en-US", { maximumFractionDigits: 2 })}%`;
}
