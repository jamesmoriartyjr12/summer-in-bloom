export type TermLength = "six-month" | "one-year" | "multi-year";

export type ClientTerm = "six-month" | "one-year";

export function isClientTerm(value: string): value is ClientTerm {
  return value === "six-month" || value === "one-year";
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

export type TermRates = {
  listRateCents: number;
  cashRateCents: number;
  weeklyListCents: number;
  weeklyCashCents: number;
  equityPerHourCents: number;
  equityPerWeekCents: number;
};

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
  companyLogoUrl: string | null;
  contactName: string;
  avatarUrl: string | null;
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

export type OfferRate = {
  serviceName: string;
  hoursPerWeek: number;
  listRateCents: number;
  cashRateCents: number;
  sortOrder: number;
};

export type RateOverride = {
  sortOrder: number;
  listRateCents: number;
  cashRateCents: number;
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
    };
  });
}

export function packageRates(
  pkg: {
    hoursPerWeek: number;
    sixMonthListRateCents: number;
    sixMonthCashRateCents: number;
    oneYearListRateCents: number;
    oneYearCashRateCents: number;
  },
  term: ClientTerm,
): TermRates {
  const listRateCents = term === "one-year" ? pkg.oneYearListRateCents : pkg.sixMonthListRateCents;
  const cashRateCents = term === "one-year" ? pkg.oneYearCashRateCents : pkg.sixMonthCashRateCents;
  return {
    listRateCents,
    cashRateCents,
    weeklyListCents: weeklyAmountCents(pkg.hoursPerWeek, listRateCents),
    weeklyCashCents: weeklyAmountCents(pkg.hoursPerWeek, cashRateCents),
    equityPerHourCents: equityPerHourCents(listRateCents, cashRateCents),
    equityPerWeekCents: equityPerWeekCents(pkg.hoursPerWeek, listRateCents, cashRateCents),
  };
}
