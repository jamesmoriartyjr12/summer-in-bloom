import type { LetterBlock } from "./blocks";

export type TermLength = "six-month" | "one-year" | "multi-year";

export type ClientTerm = "six-month" | "one-year";

export const CLIENT_TERMS: readonly ClientTerm[] = ["six-month", "one-year"];

export function isClientTerm(value: string): value is ClientTerm {
  return value === "six-month" || value === "one-year";
}

// A deal offers one term, or both so the client can pick.
export type TermOffer = ClientTerm | "both";

export function isTermOffer(value: string): value is TermOffer {
  return value === "both" || isClientTerm(value);
}

export function offeredTerms(offer: TermOffer): ClientTerm[] {
  return offer === "both" ? [...CLIENT_TERMS] : [offer];
}

export function quotedTerm(offer: TermOffer, selected: ClientTerm | null): ClientTerm {
  const terms = offeredTerms(offer);
  return selected !== null && terms.includes(selected) ? selected : terms[0]!;
}

// The pricing sheet: each 40 hours a week past the first takes $10 off the base rate,
// and the twelve-month term takes another $20 off.
export const SHEET_HOURS = [40, 80, 120] as const;
export const SHEET_SERVICE = "Design Engineering";
export const HOURS_STEP = 40;
export const STEP_DISCOUNT_CENTS = 1000;
export const LONG_TERM_DISCOUNT_CENTS = 2000;

function hourSteps(hoursPerWeek: number): number {
  return Math.max(0, Math.ceil(hoursPerWeek / HOURS_STEP) - 1);
}

export function longTermCents(sixMonthCents: number): number {
  return Math.max(0, sixMonthCents - LONG_TERM_DISCOUNT_CENTS);
}

export function sheetRateCents(baseCents: number, hoursPerWeek: number, term: ClientTerm): number {
  const sixMonth = Math.max(0, baseCents - hourSteps(hoursPerWeek) * STEP_DISCOUNT_CENTS);
  return term === "one-year" ? longTermCents(sixMonth) : sixMonth;
}

export function baseRateCents(offers: { hoursPerWeek: number; listRateCents: number; sortOrder: number }[]): number | null {
  const first = [...offers].sort((left, right) => left.sortOrder - right.sortOrder)[0];
  if (!first) return null;
  return first.listRateCents + hourSteps(first.hoursPerWeek) * STEP_DISCOUNT_CENTS;
}

export function sheetOffers(baseCents: number): OfferRate[] {
  return SHEET_HOURS.map((hoursPerWeek, sortOrder) => {
    const sixMonth = sheetRateCents(baseCents, hoursPerWeek, "six-month");
    const oneYear = sheetRateCents(baseCents, hoursPerWeek, "one-year");
    return {
      serviceName: SHEET_SERVICE,
      hoursPerWeek,
      listRateCents: sixMonth,
      cashRateCents: sixMonth,
      yearListRateCents: oneYear,
      yearCashRateCents: oneYear,
      sortOrder,
    };
  });
}

export function termLabel(term: TermLength): string {
  if (term === "six-month") return "Six months";
  if (term === "one-year") return "One year";
  return "Multi-year";
}

export function weeklyAmountCents(hoursPerWeek: number, rateCents: number): number {
  return hoursPerWeek * rateCents;
}

export function termMonths(term: TermLength): number | null {
  if (term === "six-month") return 6;
  if (term === "one-year") return 12;
  return null;
}

// A multi-year deal has no fixed length yet, so it has no contract value.
export function termWeeks(term: TermLength): number | null {
  if (term === "six-month") return 26;
  if (term === "one-year") return 52;
  return null;
}

export function contractValueCents(hoursPerWeek: number, rateCents: number, term: TermLength): number | null {
  const weeks = termWeeks(term);
  return weeks === null ? null : weeklyAmountCents(hoursPerWeek, rateCents) * weeks;
}

export function equityValueCents(
  hoursPerWeek: number,
  listRateCents: number,
  cashRateCents: number,
  term: TermLength,
): number | null {
  const weeks = termWeeks(term);
  return weeks === null ? null : equityPerWeekCents(hoursPerWeek, listRateCents, cashRateCents) * weeks;
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

export type LetterTerm = {
  term: ClientTerm;
  label: string;
  packages: LetterPackage[];
};

export type LetterDeal = {
  blocks: LetterBlock[];
  companyName: string;
  companyLogoUrl: string | null;
  contactName: string;
  avatarUrl: string | null;
  equityEnabled: boolean;
  terms: LetterTerm[];
  selectedPackageId: string | null;
  selectedTerm: ClientTerm | null;
};

export function letterTerm(deal: LetterDeal, term: ClientTerm | null): LetterTerm | undefined {
  return deal.terms.find((item) => item.term === term) ?? deal.terms[0];
}

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

// `listRateCents` and `cashRateCents` are the six-month rates; the `year` pair is twelve months.
export type OfferRate = {
  serviceName: string;
  hoursPerWeek: number;
  listRateCents: number;
  cashRateCents: number;
  yearListRateCents: number;
  yearCashRateCents: number;
  sortOrder: number;
};

export type TermPrice = { listRateCents: number; cashRateCents: number };

export function offerPrice(
  offer: { listRateCents: number; cashRateCents: number; yearListRateCents: number; yearCashRateCents: number },
  term: ClientTerm,
): TermPrice {
  return term === "one-year"
    ? { listRateCents: offer.yearListRateCents, cashRateCents: offer.yearCashRateCents }
    : { listRateCents: offer.listRateCents, cashRateCents: offer.cashRateCents };
}

// A missing twelve-month price follows the sheet from the six-month one.
export type RateOverride = {
  sortOrder: number;
  listRateCents: number;
  cashRateCents: number;
  yearListRateCents: number | null;
  yearCashRateCents: number | null;
};

// Every deal shows the same offers. An override replaces the price for one customer
// and leaves the hours and service on the company card.
export function billableHourCents(
  listRateCents: number,
  cashRateCents: number,
  equityEnabled: boolean,
): number {
  return equityEnabled ? cashRateCents : listRateCents;
}

export function averageBillableCents(
  deals: {
    equityEnabled: boolean;
    offers: { listRateCents: number; cashRateCents: number }[];
  }[],
): number | null {
  const rates = deals.flatMap((deal) =>
    deal.offers.map((offer) =>
      billableHourCents(offer.listRateCents, offer.cashRateCents, deal.equityEnabled),
    ),
  );
  if (rates.length === 0) return null;
  const total = rates.reduce((sum, rate) => sum + rate, 0);
  return Math.round(total / rates.length);
}

export function cascadeOffers(base: OfferRate[], overrides: RateOverride[] | null): OfferRate[] {
  return base.map((offer) => {
    if (!overrides) return offer;
    const custom = overrides.find((row) => row.sortOrder === offer.sortOrder);
    if (!custom) return offer;
    return {
      ...offer,
      listRateCents: custom.listRateCents,
      cashRateCents: custom.cashRateCents,
      yearListRateCents: custom.yearListRateCents ?? longTermCents(custom.listRateCents),
      yearCashRateCents: custom.yearCashRateCents ?? longTermCents(custom.cashRateCents),
    };
  });
}
