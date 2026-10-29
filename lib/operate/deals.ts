import crypto from "node:crypto";
import { and, asc, eq, gte, inArray } from "drizzle-orm";
import { getDb } from "./db";
import {
  buildLetterTerm,
  cascadeOffers,
  isClientTerm,
  isTermOffer,
  longTermCents,
  offeredTerms,
  offerPrice,
  sheetOffers,
  validatePackage,
  type ClientTerm,
  type EquitySettings,
  type LetterDeal,
  type OfferRate,
  type TermOffer,
} from "./pricing";
import { parseBlocks, type LetterBlock } from "./blocks";
import {
  DEFAULT_MULTIPLIER,
  defaultEquityBasis,
  isEquityBasis,
  isValuationBasis,
  MIN_CASH_RATE_CENTS,
  type EquityBasis,
  type ValuationBasis,
} from "./equity";
import { baseRates, deals, packages } from "./schema";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type DealPackage = {
  id: string;
  dealId: string;
  serviceName: string;
  hoursPerWeek: number;
  enabled: boolean;
  listRateCents: number;
  cashRateCents: number;
  yearListRateCents: number;
  yearCashRateCents: number;
  sortOrder: number;
};

export type DealRecord = {
  id: string;
  token: string;
  companyName: string;
  contactName: string;
  contactRole: string;
  linkedinUrl: string | null;
  avatarUrl: string | null;
  companyLogoUrl: string | null;
  companyUrl: string | null;
  letterBlocks: LetterBlock[];
  equityEnabled: boolean;
  ratesOverridden: boolean;
  termOffer: TermOffer;
  round: string | null;
  valuationDollars: bigint | null;
  valuationBasis: ValuationBasis;
  equityBasis: EquityBasis | null;
  equityMultiplier: number;
  cashFloorCents: number;
  hourlyCostCents: number | null;
  selectedPackageId: string | null;
  selectedTerm: ClientTerm | null;
  selectedEquityCents: number;
  hubspotContactId: string | null;
  hubspotDealId: string | null;
  packages: DealPackage[];
};

export type PackageDraft = {
  id?: string;
  serviceName: string;
  hoursPerWeek: number;
  enabled: boolean;
  listRateCents: number;
  cashRateCents: number;
  yearListRateCents: number;
  yearCashRateCents: number;
  sortOrder: number;
};

export type DealDraft = {
  companyName: string;
  contactName: string;
  contactRole: string;
  linkedinUrl: string | null;
  avatarUrl: string | null;
  companyLogoUrl: string | null;
  companyUrl: string | null;
  letterBlocks: LetterBlock[];
  equityEnabled: boolean;
  ratesOverridden: boolean;
  termOffer: TermOffer;
  round: string | null;
  valuationDollars: bigint | null;
  valuationBasis: ValuationBasis;
  equityBasis: EquityBasis | null;
  equityMultiplierTenths: number | null;
  cashFloorCents: number | null;
  hourlyCostCents: number | null;
  packages: PackageDraft[];
};

export type DealListItem = {
  id: string;
  token: string;
  companyName: string;
  contactName: string;
  contactRole: string;
  companyLogoUrl: string | null;
  companyUrl: string | null;
  linkedinUrl: string | null;
  avatarUrl: string | null;
  termOffer: TermOffer;
  selectedTerm: ClientTerm | null;
  ratesOverridden: boolean;
};

type DealRow = typeof deals.$inferSelect;
type PackageRow = typeof packages.$inferSelect;

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

// Multi-year is no longer offered; those deals read as twelve months.
function offerFromColumn(value: string): TermOffer {
  if (isTermOffer(value)) return value;
  if (value === "multi-year") return "one-year";
  throw new Error(`Unknown term length "${value}".`);
}

function selectedTermFromColumn(value: string | null): ClientTerm | null {
  return value !== null && isClientTerm(value) ? value : null;
}

function multiplierFromColumn(tenths: number | null): number {
  return tenths === null || tenths <= 0 ? DEFAULT_MULTIPLIER : tenths / 10;
}

function blankToNull(value: string | null): string | null {
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function toPackage(row: PackageRow): DealPackage {
  return {
    id: row.id,
    dealId: row.dealId,
    serviceName: row.serviceName,
    hoursPerWeek: row.hoursPerWeek,
    enabled: row.enabled,
    listRateCents: row.listRateCents,
    cashRateCents: row.cashRateCents,
    yearListRateCents: row.yearListRateCents ?? longTermCents(row.listRateCents),
    yearCashRateCents: row.yearCashRateCents ?? longTermCents(row.cashRateCents),
    sortOrder: row.sortOrder,
  };
}

function toDealRecord(deal: DealRow, rows: PackageRow[]): DealRecord {
  return {
    id: deal.id,
    token: deal.token,
    companyName: deal.companyName,
    contactName: deal.contactName,
    contactRole: deal.contactRole,
    linkedinUrl: deal.linkedinUrl,
    avatarUrl: deal.avatarUrl,
    companyLogoUrl: deal.companyLogoUrl,
    companyUrl: deal.companyUrl,
    letterBlocks: parseBlocks(deal.letterBlocks),
    equityEnabled: deal.equityEnabled,
    ratesOverridden: deal.ratesOverridden,
    termOffer: offerFromColumn(deal.termLength),
    round: deal.round,
    valuationDollars: deal.valuationDollars,
    valuationBasis: isValuationBasis(deal.valuationBasis) ? deal.valuationBasis : "post",
    equityBasis: deal.equityBasis !== null && isEquityBasis(deal.equityBasis) ? deal.equityBasis : null,
    equityMultiplier: multiplierFromColumn(deal.equityMultiplierTenths),
    cashFloorCents: deal.cashFloorCents ?? MIN_CASH_RATE_CENTS,
    hourlyCostCents: deal.hourlyCostCents,
    selectedPackageId: deal.selectedPackageId,
    selectedTerm: selectedTermFromColumn(deal.selectedTerm),
    selectedEquityCents: deal.selectedEquityCents ?? 0,
    hubspotContactId: deal.hubspotContactId,
    hubspotDealId: deal.hubspotDealId,
    packages: rows.map(toPackage),
  };
}

const DEFAULT_BASE_CENTS = 20000;

function toOffer(row: typeof baseRates.$inferSelect): OfferRate {
  return {
    serviceName: row.serviceName,
    hoursPerWeek: row.hoursPerWeek,
    listRateCents: row.listRateCents,
    cashRateCents: row.cashRateCents,
    yearListRateCents: longTermCents(row.listRateCents),
    yearCashRateCents: longTermCents(row.cashRateCents),
    sortOrder: row.sortOrder,
  };
}

function baseRow(offer: OfferRate) {
  return {
    serviceName: offer.serviceName,
    hoursPerWeek: offer.hoursPerWeek,
    listRateCents: offer.listRateCents,
    cashRateCents: offer.cashRateCents,
    sortOrder: offer.sortOrder,
  };
}

export async function listBaseRates(): Promise<OfferRate[]> {
  const db = getDb();
  const rows = await db.select().from(baseRates).orderBy(asc(baseRates.sortOrder), asc(baseRates.id));
  if (rows.length > 0) return rows.map(toOffer);
  const offers = sheetOffers(DEFAULT_BASE_CENTS);
  await db.insert(baseRates).values(offers.map(baseRow));
  return offers;
}

// One base rate builds the whole sheet. Deals without custom rates follow it.
export async function saveBaseRate(
  baseCents: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!Number.isInteger(baseCents) || baseCents <= 0) {
    return { ok: false, error: "The base rate must be more than zero." };
  }
  const offers = sheetOffers(baseCents);
  const db = getDb();
  const existing = await db.select().from(baseRates).orderBy(asc(baseRates.sortOrder));
  const standardDeals = await db
    .select({ id: deals.id })
    .from(deals)
    .where(eq(deals.ratesOverridden, false));
  const standardIds = standardDeals.map((row) => row.id);

  await db.transaction(async (tx) => {
    for (const offer of offers) {
      const current = existing.find((row) => row.sortOrder === offer.sortOrder);
      const values = baseRow(offer);
      if (current) {
        await tx.update(baseRates).set(values).where(eq(baseRates.id, current.id));
      } else {
        await tx.insert(baseRates).values(values);
      }
      await tx
        .update(packages)
        .set({ serviceName: values.serviceName, hoursPerWeek: values.hoursPerWeek, enabled: true })
        .where(eq(packages.sortOrder, offer.sortOrder));
      if (standardIds.length > 0) {
        await tx
          .update(packages)
          .set({
            listRateCents: values.listRateCents,
            cashRateCents: values.cashRateCents,
            yearListRateCents: null,
            yearCashRateCents: null,
          })
          .where(and(eq(packages.sortOrder, offer.sortOrder), inArray(packages.dealId, standardIds)));
      }
    }
    await tx.delete(baseRates).where(gte(baseRates.sortOrder, offers.length));
  });
  return { ok: true };
}

function presentOffers(base: OfferRate[], rows: PackageRow[], ratesOverridden: boolean): PackageRow[] {
  const overrides = ratesOverridden
    ? rows.map((row) => ({
        sortOrder: row.sortOrder,
        listRateCents: row.listRateCents,
        cashRateCents: row.cashRateCents,
        yearListRateCents: row.yearListRateCents,
        yearCashRateCents: row.yearCashRateCents,
      }))
    : null;
  const offers = cascadeOffers(base, overrides);
  return offers.map((offer) => {
    const existing = rows.find((row) => row.sortOrder === offer.sortOrder);
    return {
      id: existing?.id ?? crypto.randomUUID(),
      dealId: existing?.dealId ?? rows[0]?.dealId ?? "",
      serviceName: offer.serviceName,
      hoursPerWeek: offer.hoursPerWeek,
      enabled: true,
      listRateCents: offer.listRateCents,
      cashRateCents: offer.cashRateCents,
      yearListRateCents: offer.yearListRateCents,
      yearCashRateCents: offer.yearCashRateCents,
      sortOrder: offer.sortOrder,
    };
  });
}

async function ensureOfferRows(dealId: string, base: OfferRate[], rows: PackageRow[]): Promise<PackageRow[]> {
  const missing = base.filter((offer) => !rows.some((row) => row.sortOrder === offer.sortOrder));
  if (missing.length === 0) return rows;
  const db = getDb();
  const inserted = await db
    .insert(packages)
    .values(
      missing.map((offer) => ({
        id: crypto.randomUUID(),
        dealId,
        serviceName: offer.serviceName,
        hoursPerWeek: offer.hoursPerWeek,
        enabled: true,
        listRateCents: offer.listRateCents,
        cashRateCents: offer.cashRateCents,
        sortOrder: offer.sortOrder,
      })),
    )
    .returning();
  return [...rows, ...inserted];
}

async function readDeal(where: ReturnType<typeof eq>): Promise<DealRecord | null> {
  const db = getDb();
  const [deal] = await db.select().from(deals).where(where).limit(1);
  if (!deal) return null;
  const base = await listBaseRates();
  const stored = await db
    .select()
    .from(packages)
    .where(eq(packages.dealId, deal.id))
    .orderBy(asc(packages.sortOrder), asc(packages.id));
  const rows = await ensureOfferRows(deal.id, base, stored);
  return toDealRecord(deal, presentOffers(base, rows, deal.ratesOverridden));
}

function draftError(input: DealDraft): string | null {
  if (input.companyName.trim() === "") return "Company name is required.";
  if (!isTermOffer(input.termOffer)) return "Term length is not valid.";
  if (input.valuationDollars !== null && typeof input.valuationDollars !== "bigint") {
    return "Valuation must be whole dollars.";
  }
  if (input.hourlyCostCents !== null && !Number.isInteger(input.hourlyCostCents)) {
    return "Hourly cost must be a whole number of cents.";
  }
  if (!isValuationBasis(input.valuationBasis)) return "Valuation must be pre-money or post-money.";
  if (input.equityBasis !== null && !isEquityBasis(input.equityBasis)) return "Equity basis is not valid.";
  if (
    input.equityMultiplierTenths !== null &&
    (!Number.isInteger(input.equityMultiplierTenths) || input.equityMultiplierTenths <= 0)
  ) {
    return "The multiplier must be more than zero.";
  }
  if (input.cashFloorCents !== null && (!Number.isInteger(input.cashFloorCents) || input.cashFloorCents < 0)) {
    return "The cash floor must be zero or more.";
  }
  const seen = new Set<string>();
  for (const pkg of input.packages) {
    for (const term of offeredTerms(input.termOffer)) {
      const error = validatePackage({
        serviceName: pkg.serviceName,
        hoursPerWeek: pkg.hoursPerWeek,
        enabled: pkg.enabled,
        ...offerPrice(pkg, term),
        equityEnabled: input.equityEnabled,
      });
      if (error) return error;
    }
    if (!Number.isInteger(pkg.sortOrder)) return "Sort order must be a whole number.";
    if (!pkg.id) continue;
    if (!isUuid(pkg.id) || seen.has(pkg.id)) return "Package not found.";
    seen.add(pkg.id);
  }
  return null;
}

export type DashboardDeal = DealListItem & {
  equityEnabled: boolean;
  offers: OfferRate[];
  selectedSortOrder: number | null;
  selectedEquityCents: number;
  cashFloorCents: number;
};

export async function listDashboard(): Promise<{ rates: OfferRate[]; deals: DashboardDeal[] }> {
  const db = getDb();
  const rates = await listBaseRates();
  const rows = await db
    .select({
      id: deals.id,
      token: deals.token,
      companyName: deals.companyName,
      contactName: deals.contactName,
      contactRole: deals.contactRole,
      companyLogoUrl: deals.companyLogoUrl,
      companyUrl: deals.companyUrl,
      linkedinUrl: deals.linkedinUrl,
      avatarUrl: deals.avatarUrl,
      termLength: deals.termLength,
      selectedTerm: deals.selectedTerm,
      ratesOverridden: deals.ratesOverridden,
      equityEnabled: deals.equityEnabled,
      selectedPackageId: deals.selectedPackageId,
      selectedEquityCents: deals.selectedEquityCents,
      cashFloorCents: deals.cashFloorCents,
    })
    .from(deals)
    .orderBy(asc(deals.companyName), asc(deals.id));
  const ids = rows.map((row) => row.id);
  const offerRows =
    ids.length === 0 ? [] : await db.select().from(packages).where(inArray(packages.dealId, ids));

  return {
    rates,
    deals: rows.map((row) => {
      const mine = offerRows.filter((pkg) => pkg.dealId === row.id);
      return {
        id: row.id,
        token: row.token,
        companyName: row.companyName,
        contactName: row.contactName,
        contactRole: row.contactRole,
        companyLogoUrl: row.companyLogoUrl,
        companyUrl: row.companyUrl,
        linkedinUrl: row.linkedinUrl,
        avatarUrl: row.avatarUrl,
        termOffer: offerFromColumn(row.termLength),
        selectedTerm: selectedTermFromColumn(row.selectedTerm),
        ratesOverridden: row.ratesOverridden,
        equityEnabled: row.equityEnabled,
        offers: cascadeOffers(
          rates,
          row.ratesOverridden
            ? mine.map((pkg) => ({
                sortOrder: pkg.sortOrder,
                listRateCents: pkg.listRateCents,
                cashRateCents: pkg.cashRateCents,
                yearListRateCents: pkg.yearListRateCents,
                yearCashRateCents: pkg.yearCashRateCents,
              }))
            : null,
        ),
        selectedSortOrder: mine.find((pkg) => pkg.id === row.selectedPackageId)?.sortOrder ?? null,
        selectedEquityCents: row.selectedEquityCents ?? 0,
        cashFloorCents: row.cashFloorCents ?? MIN_CASH_RATE_CENTS,
      };
    }),
  };
}

export async function listDeals(): Promise<DealListItem[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: deals.id,
      token: deals.token,
      companyName: deals.companyName,
      contactName: deals.contactName,
      contactRole: deals.contactRole,
      companyLogoUrl: deals.companyLogoUrl,
      companyUrl: deals.companyUrl,
      linkedinUrl: deals.linkedinUrl,
      avatarUrl: deals.avatarUrl,
      termLength: deals.termLength,
      selectedTerm: deals.selectedTerm,
      ratesOverridden: deals.ratesOverridden,
    })
    .from(deals)
    .orderBy(asc(deals.companyName), asc(deals.id));
  return rows.map((row) => ({
    id: row.id,
    token: row.token,
    companyName: row.companyName,
    contactName: row.contactName,
    contactRole: row.contactRole,
    companyLogoUrl: row.companyLogoUrl,
    companyUrl: row.companyUrl,
    linkedinUrl: row.linkedinUrl,
    avatarUrl: row.avatarUrl,
    termOffer: offerFromColumn(row.termLength),
    selectedTerm: selectedTermFromColumn(row.selectedTerm),
    ratesOverridden: row.ratesOverridden,
  }));
}

export async function getDeal(id: string): Promise<DealRecord | null> {
  if (!isUuid(id)) return null;
  return readDeal(eq(deals.id, id));
}

export async function getDealByToken(token: string): Promise<DealRecord | null> {
  return readDeal(eq(deals.token, token));
}

export async function createDeal(
  input: DealDraft,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const error = draftError(input);
  if (error) return { ok: false, error };
  const db = getDb();
  const id = crypto.randomUUID();
  const token = crypto.randomBytes(32).toString("base64url");
  await db.transaction(async (tx) => {
    await tx.insert(deals).values({
      id,
      token,
      companyName: input.companyName.trim(),
      contactName: input.contactName,
      contactRole: input.contactRole,
      linkedinUrl: blankToNull(input.linkedinUrl),
      avatarUrl: input.avatarUrl,
      companyLogoUrl: input.companyLogoUrl,
      companyUrl: input.companyUrl,
      letterBlocks: input.letterBlocks,
      equityEnabled: input.equityEnabled,
      ratesOverridden: input.ratesOverridden,
      termLength: input.termOffer,
      round: blankToNull(input.round),
      valuationDollars: input.valuationDollars,
      valuationBasis: input.valuationBasis,
      equityBasis: input.equityBasis,
      equityMultiplierTenths: input.equityMultiplierTenths,
      cashFloorCents: input.cashFloorCents,
      hourlyCostCents: input.hourlyCostCents,
    });
    if (input.packages.length > 0) {
      await tx.insert(packages).values(
        input.packages.map((pkg) => ({
          id: crypto.randomUUID(),
          dealId: id,
          serviceName: pkg.serviceName,
          hoursPerWeek: pkg.hoursPerWeek,
          enabled: pkg.enabled,
          listRateCents: pkg.listRateCents,
          cashRateCents: pkg.cashRateCents,
          yearListRateCents: pkg.yearListRateCents,
          yearCashRateCents: pkg.yearCashRateCents,
          sortOrder: pkg.sortOrder,
        })),
      );
    }
  });
  return { ok: true, id };
}

export async function saveDeal(
  id: string,
  input: DealDraft,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const error = draftError(input);
  if (error) return { ok: false, error };
  if (!isUuid(id)) return { ok: false, error: "Deal not found." };

  const existing = await getDeal(id);
  if (!existing) return { ok: false, error: "Deal not found." };

  const knownIds = new Set(existing.packages.map((pkg) => pkg.id));
  for (const pkg of input.packages) {
    if (pkg.id && !knownIds.has(pkg.id)) return { ok: false, error: "Package not found." };
  }

  const enabledIds = new Set<string>();
  for (const pkg of input.packages) {
    if (pkg.enabled && pkg.id) enabledIds.add(pkg.id);
  }
  // A choice made on a term that is no longer offered is cleared with it.
  const termKept =
    existing.selectedTerm === null || offeredTerms(input.termOffer).includes(existing.selectedTerm);
  const packageKept = existing.selectedPackageId !== null && enabledIds.has(existing.selectedPackageId);
  const selectedPackageId = termKept && packageKept ? existing.selectedPackageId : null;
  const selectedTerm = selectedPackageId === null ? null : existing.selectedTerm;
  const selectedEquityCents = selectedPackageId === null || !input.equityEnabled ? null : existing.selectedEquityCents;

  const db = getDb();
  const dealUpdate = {
    companyName: input.companyName.trim(),
    contactName: input.contactName,
    contactRole: input.contactRole,
    linkedinUrl: blankToNull(input.linkedinUrl),
    avatarUrl: input.avatarUrl,
    companyLogoUrl: input.companyLogoUrl,
    companyUrl: input.companyUrl,
    letterBlocks: input.letterBlocks,
    equityEnabled: input.equityEnabled,
    ratesOverridden: input.ratesOverridden,
    termLength: input.termOffer,
    round: blankToNull(input.round),
    valuationDollars: input.valuationDollars,
    valuationBasis: input.valuationBasis,
    equityBasis: input.equityBasis,
    equityMultiplierTenths: input.equityMultiplierTenths,
    cashFloorCents: input.cashFloorCents,
    hourlyCostCents: input.hourlyCostCents,
    selectedPackageId,
    selectedTerm,
    selectedEquityCents,
  };
  await db.transaction(async (tx) => {
    await tx.delete(packages).where(eq(packages.dealId, id));
    if (input.packages.length > 0) {
      await tx.insert(packages).values(
        input.packages.map((pkg) => ({
          ...(pkg.id ? { id: pkg.id } : {}),
          dealId: id,
          serviceName: pkg.serviceName,
          hoursPerWeek: pkg.hoursPerWeek,
          enabled: pkg.enabled,
          listRateCents: pkg.listRateCents,
          cashRateCents: pkg.cashRateCents,
          yearListRateCents: pkg.yearListRateCents,
          yearCashRateCents: pkg.yearCashRateCents,
          sortOrder: pkg.sortOrder,
        })),
      );
    }
    await tx.update(deals).set(dealUpdate).where(eq(deals.id, id));
  });
  return { ok: true };
}

export async function selectPackage(
  token: string,
  packageId: string,
  term: string,
  equityCents: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isUuid(packageId) || !isClientTerm(term)) return { ok: false, error: "Package not found." };
  const deal = await getDealByToken(token);
  if (!deal) return { ok: false, error: "Package not found." };
  const match = deal.packages.find((pkg) => pkg.id === packageId && pkg.enabled);
  const offered = dealToLetter(deal).terms.find((item) => item.term === term);
  if (!match || !offered) return { ok: false, error: "Package not found." };
  if (!offered.steps.includes(equityCents)) return { ok: false, error: "That equity amount is not offered." };
  const db = getDb();
  await db
    .update(deals)
    .set({ selectedPackageId: packageId, selectedTerm: term, selectedEquityCents: equityCents })
    .where(eq(deals.id, deal.id));
  return { ok: true };
}

export function dealEquitySettings(deal: {
  equityEnabled: boolean;
  cashFloorCents: number;
  valuationDollars: bigint | null;
  valuationBasis: ValuationBasis;
  equityBasis: EquityBasis | null;
  equityMultiplier: number;
  round: string | null;
}): EquitySettings {
  return {
    equityEnabled: deal.equityEnabled,
    floorCents: deal.cashFloorCents,
    ownership: {
      valuationDollars: deal.valuationDollars === null ? null : Number(deal.valuationDollars),
      valuationBasis: deal.valuationBasis,
      equityBasis: deal.equityBasis ?? defaultEquityBasis(deal.round),
      multiplier: deal.equityMultiplier,
    },
  };
}

export function dealToLetter(deal: DealRecord): LetterDeal {
  const visible = deal.packages
    .filter((pkg) => pkg.enabled)
    .sort((left, right) => left.sortOrder - right.sortOrder || left.id.localeCompare(right.id));
  return {
    blocks: deal.letterBlocks,
    companyName: deal.companyName,
    companyLogoUrl: deal.companyLogoUrl,
    contactName: deal.contactName,
    avatarUrl: deal.avatarUrl,
    equityEnabled: deal.equityEnabled,
    terms: offeredTerms(deal.termOffer).map((term) =>
      buildLetterTerm(
        term,
        visible.map((pkg) => ({ ...pkg, listRateCents: offerPrice(pkg, term).listRateCents })),
        dealEquitySettings(deal),
      ),
    ),
    selectedPackageId: deal.selectedPackageId,
    selectedTerm: deal.selectedTerm,
    selectedEquityCents: deal.equityEnabled ? deal.selectedEquityCents : 0,
  };
}
