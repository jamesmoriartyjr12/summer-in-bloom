import type { LetterBlock } from "./blocks";
import { termEndDate } from "./dates";
import { cashRateAt, equitySteps, ownershipPercent, type OwnershipTerms } from "./equity";

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

export function billableHourCents(
  listRateCents: number,
  cashRateCents: number,
  equityEnabled: boolean,
): number {
  return equityEnabled ? cashRateCents : listRateCents;
}

export function averageCents(values: (number | null)[]): number | null {
  const known = values.filter((value): value is number => value !== null);
  if (known.length === 0) return null;
  return Math.round(known.reduce((sum, value) => sum + value, 0) / known.length);
}

// A deal sells one bundle of service lines. Each line has a six-month and a twelve-month rate.
export type ServiceLine = {
  id: string;
  serviceName: string;
  hoursPerWeek: number;
  listRateCents: number;
  yearListRateCents: number;
};

export const MAX_LINES = 12;

export function lineRateCents(line: { listRateCents: number; yearListRateCents: number }, term: ClientTerm): number {
  return term === "one-year" ? line.yearListRateCents : line.listRateCents;
}

export function sheetLine(
  baseCents: number,
  line: { id: string; serviceName: string; hoursPerWeek: number },
): ServiceLine {
  return {
    ...line,
    listRateCents: sheetRateCents(baseCents, line.hoursPerWeek, "six-month"),
    yearListRateCents: sheetRateCents(baseCents, line.hoursPerWeek, "one-year"),
  };
}

export function validateLine(line: Omit<ServiceLine, "id">): string | null {
  if (line.serviceName.trim() === "") return "Every service needs a name.";
  if (!Number.isInteger(line.hoursPerWeek) || line.hoursPerWeek < 1) {
    return "Hours per week must be a positive whole number.";
  }
  for (const rate of [line.listRateCents, line.yearListRateCents]) {
    if (!Number.isInteger(rate) || rate <= 0) return "Every rate must be more than zero.";
  }
  return null;
}

export type BundleQuote = {
  stepCents: number;
  hoursPerWeek: number;
  weeklyListCents: number;
  weeklyCashCents: number;
  totalCashCents: number;
  equityPerWeekCents: number;
  equityTotalCents: number;
};

export function bundleQuote(
  lines: { hoursPerWeek: number; listRateCents: number }[],
  weeks: number,
  stepCents: number,
  floorCents: number,
): BundleQuote {
  let hoursPerWeek = 0;
  let weeklyListCents = 0;
  let weeklyCashCents = 0;
  for (const line of lines) {
    hoursPerWeek += line.hoursPerWeek;
    weeklyListCents += weeklyAmountCents(line.hoursPerWeek, line.listRateCents);
    weeklyCashCents += weeklyAmountCents(line.hoursPerWeek, cashRateAt(line.listRateCents, stepCents, floorCents));
  }
  const equityPerWeek = weeklyListCents - weeklyCashCents;
  return {
    stepCents,
    hoursPerWeek,
    weeklyListCents,
    weeklyCashCents,
    totalCashCents: weeklyCashCents * weeks,
    equityPerWeekCents: equityPerWeek,
    equityTotalCents: equityPerWeek * weeks,
  };
}

// One option per equity step on the deal, in the same order as `LetterDeal.steps`.
export type LineOption = {
  stepCents: number;
  cashRateCents: number;
  weeklyCashCents: number;
};

export type LetterLine = {
  id: string;
  serviceName: string;
  hoursPerWeek: number;
  listRateCents: number;
  weeklyListCents: number;
  options: LineOption[];
};

export type BundleOption = BundleQuote & { ownershipPercent: number | null };

export type LetterTerm = {
  term: ClientTerm;
  label: string;
  months: number;
  weeks: number;
  startDate: string;
  endDate: string;
  lines: LetterLine[];
  options: BundleOption[];
};

export type LetterDeal = {
  blocks: LetterBlock[];
  companyName: string;
  companyLogoUrl: string | null;
  contactName: string;
  avatarUrl: string | null;
  equityEnabled: boolean;
  steps: number[];
  terms: LetterTerm[];
  selectedTerm: ClientTerm | null;
  selectedEquityCents: number;
};

export function letterTerm(deal: LetterDeal, term: ClientTerm | null): LetterTerm | undefined {
  return deal.terms.find((item) => item.term === term);
}

// A step past what this deal allows falls back to the largest one it has.
export function stepIndex(steps: number[], stepCents: number): number {
  let index = 0;
  steps.forEach((step, i) => {
    if (step <= stepCents) index = i;
  });
  return index;
}

export type EquitySettings = {
  equityEnabled: boolean;
  floorCents: number;
  ownership: OwnershipTerms;
};

export function buildLetterTerms(
  terms: ClientTerm[],
  lines: ServiceLine[],
  settings: EquitySettings,
  startDate: string,
): { steps: number[]; terms: LetterTerm[] } {
  const steps = settings.equityEnabled
    ? equitySteps(
        terms.flatMap((term) => lines.map((line) => lineRateCents(line, term))),
        settings.floorCents,
      )
    : [0];
  return {
    steps,
    terms: terms.map((term) => {
      const weeks = termWeeks(term) ?? 0;
      const priced = lines.map((line) => ({ ...line, listRateCents: lineRateCents(line, term) }));
      return {
        term,
        label: termLabel(term),
        months: termMonths(term) ?? 0,
        weeks,
        startDate,
        endDate: termEndDate(startDate, weeks),
        lines: priced.map((line) => ({
          id: line.id,
          serviceName: line.serviceName,
          hoursPerWeek: line.hoursPerWeek,
          listRateCents: line.listRateCents,
          weeklyListCents: weeklyAmountCents(line.hoursPerWeek, line.listRateCents),
          options: steps.map((stepCents) => {
            const cashRateCents = cashRateAt(line.listRateCents, stepCents, settings.floorCents);
            return { stepCents, cashRateCents, weeklyCashCents: weeklyAmountCents(line.hoursPerWeek, cashRateCents) };
          }),
        })),
        options: steps.map((stepCents) => {
          const quote = bundleQuote(priced, weeks, stepCents, settings.floorCents);
          return { ...quote, ownershipPercent: ownershipPercent(quote.equityTotalCents, settings.ownership) };
        }),
      };
    }),
  };
}

// The base rate sheet on the dashboard. `listRateCents` is six months; the `year` pair is twelve.
export type OfferRate = {
  serviceName: string;
  hoursPerWeek: number;
  listRateCents: number;
  cashRateCents: number;
  yearListRateCents: number;
  yearCashRateCents: number;
  sortOrder: number;
};
