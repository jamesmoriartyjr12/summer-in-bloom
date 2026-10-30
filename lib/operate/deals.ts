import crypto from "node:crypto";
import { asc, eq, gte, inArray } from "drizzle-orm";
import { getDb } from "./db";
import {
  baseRateCents,
  buildLetterTerms,
  isClientTerm,
  isTermOffer,
  longTermCents,
  MAX_LINES,
  offeredTerms,
  SHEET_SERVICE,
  sheetLine,
  sheetOffers,
  validateLine,
  type ClientTerm,
  type EquitySettings,
  type LetterDeal,
  type OfferRate,
  type ServiceLine,
  type TermOffer,
} from "./pricing";
import { parseBlocks, type LetterBlock } from "./blocks";
import { isIsoDate, nextMonday } from "./dates";
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
  startDate: string | null;
  round: string | null;
  valuationDollars: bigint | null;
  valuationBasis: ValuationBasis;
  equityBasis: EquityBasis | null;
  equityMultiplier: number;
  cashFloorCents: number;
  hourlyCostCents: number | null;
  selectedTerm: ClientTerm | null;
  selectedEquityCents: number;
  hubspotContactId: string | null;
  hubspotDealId: string | null;
  baseCents: number;
  lines: ServiceLine[];
};

export type LineDraft = Omit<ServiceLine, "id"> & { id?: string };

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
  startDate: string | null;
  round: string | null;
  valuationDollars: bigint | null;
  valuationBasis: ValuationBasis;
  equityBasis: EquityBasis | null;
  equityMultiplierTenths: number | null;
  cashFloorCents: number | null;
  hourlyCostCents: number | null;
  lines: LineDraft[];
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

const DEFAULT_BASE_CENTS = 20000;

export function defaultLine(baseCents: number, id: string): ServiceLine {
  return sheetLine(baseCents, { id, serviceName: SHEET_SERVICE, hoursPerWeek: 40 });
}

// The bundle is the deal's enabled rows. Without custom rates, each line follows the sheet for its hours.
function dealLines(rows: PackageRow[], ratesOverridden: boolean, baseCents: number): ServiceLine[] {
  const lines = rows
    .filter((row) => row.enabled)
    .sort((left, right) => left.sortOrder - right.sortOrder || left.id.localeCompare(right.id))
    .map((row): ServiceLine => {
      const line = { id: row.id, serviceName: row.serviceName, hoursPerWeek: row.hoursPerWeek };
      if (!ratesOverridden) return sheetLine(baseCents, line);
      return {
        ...line,
        listRateCents: row.listRateCents,
        yearListRateCents: row.yearListRateCents ?? longTermCents(row.listRateCents),
      };
    });
  return lines.length > 0 ? lines : [defaultLine(baseCents, crypto.randomUUID())];
}

function toDealRecord(deal: DealRow, rows: PackageRow[], baseCents: number): DealRecord {
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
    startDate: deal.startDate,
    round: deal.round,
    valuationDollars: deal.valuationDollars,
    valuationBasis: isValuationBasis(deal.valuationBasis) ? deal.valuationBasis : "post",
    equityBasis: deal.equityBasis !== null && isEquityBasis(deal.equityBasis) ? deal.equityBasis : null,
    equityMultiplier: multiplierFromColumn(deal.equityMultiplierTenths),
    cashFloorCents: deal.cashFloorCents ?? MIN_CASH_RATE_CENTS,
    hourlyCostCents: deal.hourlyCostCents,
    selectedTerm: selectedTermFromColumn(deal.selectedTerm),
    selectedEquityCents: deal.selectedEquityCents ?? 0,
    hubspotContactId: deal.hubspotContactId,
    hubspotDealId: deal.hubspotDealId,
    baseCents,
    lines: dealLines(rows, deal.ratesOverridden, baseCents),
  };
}

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

export async function currentBaseCents(): Promise<number> {
  return baseRateCents(await listBaseRates()) ?? DEFAULT_BASE_CENTS;
}

// One base rate builds the whole sheet. Deals without custom rates read their prices from it.
export async function saveBaseRate(
  baseCents: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!Number.isInteger(baseCents) || baseCents <= 0) {
    return { ok: false, error: "The base rate must be more than zero." };
  }
  const offers = sheetOffers(baseCents);
  const db = getDb();
  const existing = await db.select().from(baseRates).orderBy(asc(baseRates.sortOrder));
  await db.transaction(async (tx) => {
    for (const offer of offers) {
      const current = existing.find((row) => row.sortOrder === offer.sortOrder);
      const values = baseRow(offer);
      if (current) {
        await tx.update(baseRates).set(values).where(eq(baseRates.id, current.id));
      } else {
        await tx.insert(baseRates).values(values);
      }
    }
    await tx.delete(baseRates).where(gte(baseRates.sortOrder, offers.length));
  });
  return { ok: true };
}

async function readDeal(where: ReturnType<typeof eq>): Promise<DealRecord | null> {
  const db = getDb();
  const [deal] = await db.select().from(deals).where(where).limit(1);
  if (!deal) return null;
  const rows = await db.select().from(packages).where(eq(packages.dealId, deal.id));
  return toDealRecord(deal, rows, await currentBaseCents());
}

function draftError(input: DealDraft): string | null {
  if (input.companyName.trim() === "") return "Company name is required.";
  if (!isTermOffer(input.termOffer)) return "Term length is not valid.";
  if (input.startDate !== null && !isIsoDate(input.startDate)) return "The start date is not a real day.";
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
  if (input.lines.length === 0) return "Add at least one service.";
  if (input.lines.length > MAX_LINES) return `A deal can have up to ${MAX_LINES} services.`;
  for (const line of input.lines) {
    const error = validateLine(line);
    if (error) return error;
  }
  return null;
}

function lineRows(dealId: string, lines: LineDraft[], knownIds: Set<string>) {
  const used = new Set<string>();
  return lines.map((line, sortOrder) => {
    const id = line.id && knownIds.has(line.id) && !used.has(line.id) ? line.id : crypto.randomUUID();
    used.add(id);
    return {
      id,
      dealId,
      serviceName: line.serviceName.trim(),
      hoursPerWeek: line.hoursPerWeek,
      enabled: true,
      listRateCents: line.listRateCents,
      cashRateCents: line.listRateCents,
      yearListRateCents: line.yearListRateCents,
      yearCashRateCents: line.yearListRateCents,
      sortOrder,
    };
  });
}

export type DashboardDeal = DealListItem & {
  equityEnabled: boolean;
  lines: ServiceLine[];
  selectedEquityCents: number;
  cashFloorCents: number;
};

export async function listDashboard(): Promise<{ rates: OfferRate[]; deals: DashboardDeal[] }> {
  const db = getDb();
  const rates = await listBaseRates();
  const baseCents = baseRateCents(rates) ?? DEFAULT_BASE_CENTS;
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
      selectedEquityCents: deals.selectedEquityCents,
      cashFloorCents: deals.cashFloorCents,
    })
    .from(deals)
    .orderBy(asc(deals.companyName), asc(deals.id));
  const ids = rows.map((row) => row.id);
  const lineRowsFound =
    ids.length === 0 ? [] : await db.select().from(packages).where(inArray(packages.dealId, ids));

  return {
    rates,
    deals: rows.map((row) => ({
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
      lines: dealLines(
        lineRowsFound.filter((pkg) => pkg.dealId === row.id),
        row.ratesOverridden,
        baseCents,
      ),
      selectedEquityCents: row.selectedEquityCents ?? 0,
      cashFloorCents: row.cashFloorCents ?? MIN_CASH_RATE_CENTS,
    })),
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
      startDate: input.startDate,
      round: blankToNull(input.round),
      valuationDollars: input.valuationDollars,
      valuationBasis: input.valuationBasis,
      equityBasis: input.equityBasis,
      equityMultiplierTenths: input.equityMultiplierTenths,
      cashFloorCents: input.cashFloorCents,
      hourlyCostCents: input.hourlyCostCents,
    });
    await tx.insert(packages).values(lineRows(id, input.lines, new Set()));
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

  const db = getDb();
  const [existing] = await db
    .select({ selectedTerm: deals.selectedTerm, selectedEquityCents: deals.selectedEquityCents })
    .from(deals)
    .where(eq(deals.id, id))
    .limit(1);
  if (!existing) return { ok: false, error: "Deal not found." };
  const stored = await db.select({ id: packages.id }).from(packages).where(eq(packages.dealId, id));
  const knownIds = new Set(stored.map((row) => row.id));

  // A choice made on a term that is no longer offered is cleared with it.
  const chosen = selectedTermFromColumn(existing.selectedTerm);
  const selectedTerm = chosen !== null && offeredTerms(input.termOffer).includes(chosen) ? chosen : null;
  const selectedEquityCents = selectedTerm === null || !input.equityEnabled ? null : existing.selectedEquityCents;

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
    startDate: input.startDate,
    round: blankToNull(input.round),
    valuationDollars: input.valuationDollars,
    valuationBasis: input.valuationBasis,
    equityBasis: input.equityBasis,
    equityMultiplierTenths: input.equityMultiplierTenths,
    cashFloorCents: input.cashFloorCents,
    hourlyCostCents: input.hourlyCostCents,
    selectedPackageId: null,
    selectedTerm,
    selectedEquityCents,
  };
  await db.transaction(async (tx) => {
    await tx.delete(packages).where(eq(packages.dealId, id));
    await tx.insert(packages).values(lineRows(id, input.lines, knownIds));
    await tx.update(deals).set(dealUpdate).where(eq(deals.id, id));
  });
  return { ok: true };
}

// The client picks a whole term block, with how much of each hour goes into equity.
export async function selectTerm(
  token: string,
  term: string,
  equityCents: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isClientTerm(term)) return { ok: false, error: "That term is not offered." };
  const deal = await getDealByToken(token);
  if (!deal) return { ok: false, error: "That term is not offered." };
  const letter = dealToLetter(deal);
  if (!letter.terms.some((item) => item.term === term)) return { ok: false, error: "That term is not offered." };
  if (!letter.steps.includes(equityCents)) return { ok: false, error: "That equity amount is not offered." };
  const db = getDb();
  await db
    .update(deals)
    .set({ selectedPackageId: null, selectedTerm: term, selectedEquityCents: equityCents })
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

// Until staff set a start date, the letter starts on the next Monday.
export function dealStartDate(deal: { startDate: string | null }, now = new Date()): string {
  return deal.startDate ?? nextMonday(now);
}

export function dealToLetter(deal: DealRecord): LetterDeal {
  const built = buildLetterTerms(
    offeredTerms(deal.termOffer),
    deal.lines,
    dealEquitySettings(deal),
    dealStartDate(deal),
  );
  return {
    blocks: deal.letterBlocks,
    companyName: deal.companyName,
    companyLogoUrl: deal.companyLogoUrl,
    contactName: deal.contactName,
    avatarUrl: deal.avatarUrl,
    equityEnabled: deal.equityEnabled,
    steps: built.steps,
    terms: built.terms,
    selectedTerm: deal.selectedTerm,
    selectedEquityCents: deal.equityEnabled ? deal.selectedEquityCents : 0,
  };
}
