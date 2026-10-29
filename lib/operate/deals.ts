import crypto from "node:crypto";
import { and, asc, eq, inArray } from "drizzle-orm";
import { getDb } from "./db";
import {
  cascadeOffers,
  termLabel,
  toLetterPackage,
  validatePackage,
  type LetterDeal,
  type OfferRate,
  type TermLength,
} from "./pricing";
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
  equityEnabled: boolean;
  ratesOverridden: boolean;
  termLength: TermLength;
  round: string | null;
  valuationDollars: bigint | null;
  hourlyCostCents: number | null;
  selectedPackageId: string | null;
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
  sortOrder: number;
};

export type DealDraft = {
  companyName: string;
  contactName: string;
  contactRole: string;
  linkedinUrl: string | null;
  avatarUrl: string | null;
  companyLogoUrl: string | null;
  equityEnabled: boolean;
  ratesOverridden: boolean;
  termLength: TermLength;
  round: string | null;
  valuationDollars: bigint | null;
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
  avatarUrl: string | null;
  termLength: TermLength;
  ratesOverridden: boolean;
};

type DealRow = typeof deals.$inferSelect;
type PackageRow = typeof packages.$inferSelect;

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function isTermLength(value: string): value is TermLength {
  return value === "six-month" || value === "one-year" || value === "multi-year";
}

function termFromColumn(value: string): TermLength {
  if (!isTermLength(value)) throw new Error(`Unknown term length "${value}".`);
  return value;
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
    equityEnabled: deal.equityEnabled,
    ratesOverridden: deal.ratesOverridden,
    termLength: termFromColumn(deal.termLength),
    round: deal.round,
    valuationDollars: deal.valuationDollars,
    hourlyCostCents: deal.hourlyCostCents,
    selectedPackageId: deal.selectedPackageId,
    hubspotContactId: deal.hubspotContactId,
    hubspotDealId: deal.hubspotDealId,
    packages: rows.map(toPackage),
  };
}

const DEFAULT_OFFERS: OfferRate[] = [
  {
    serviceName: "Design Engineering",
    hoursPerWeek: 40,
    listRateCents: 0,
    cashRateCents: 0,
    sortOrder: 0,
  },
  {
    serviceName: "Design Engineering",
    hoursPerWeek: 80,
    listRateCents: 0,
    cashRateCents: 0,
    sortOrder: 1,
  },
];

function toOffer(row: typeof baseRates.$inferSelect): OfferRate {
  return {
    serviceName: row.serviceName,
    hoursPerWeek: row.hoursPerWeek,
    listRateCents: row.listRateCents,
    cashRateCents: row.cashRateCents,
    sortOrder: row.sortOrder,
  };
}

export async function listBaseRates(): Promise<OfferRate[]> {
  const db = getDb();
  const rows = await db.select().from(baseRates).orderBy(asc(baseRates.sortOrder), asc(baseRates.id));
  if (rows.length > 0) return rows.map(toOffer);
  await db.insert(baseRates).values(DEFAULT_OFFERS);
  return DEFAULT_OFFERS;
}

export async function saveBaseRates(
  offers: OfferRate[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (offers.length === 0) return { ok: false, error: "Add at least one offer." };
  for (const offer of offers) {
    if (offer.serviceName.trim() === "") return { ok: false, error: "Service name is required." };
    if (!Number.isInteger(offer.hoursPerWeek) || offer.hoursPerWeek < 1) {
      return { ok: false, error: "Hours per week must be a positive whole number." };
    }
    if (!Number.isInteger(offer.listRateCents) || offer.listRateCents < 0) {
      return { ok: false, error: "List rate must be zero or more." };
    }
    if (!Number.isInteger(offer.cashRateCents) || offer.cashRateCents < 0) {
      return { ok: false, error: "Cash rate must be zero or more." };
    }
    if (offer.cashRateCents > offer.listRateCents) {
      return { ok: false, error: "Cash rate cannot exceed the list rate." };
    }
  }

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
      const values = {
        serviceName: offer.serviceName.trim(),
        hoursPerWeek: offer.hoursPerWeek,
        listRateCents: offer.listRateCents,
        cashRateCents: offer.cashRateCents,
        sortOrder: offer.sortOrder,
      };
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
          .set({ listRateCents: values.listRateCents, cashRateCents: values.cashRateCents })
          .where(and(eq(packages.sortOrder, offer.sortOrder), inArray(packages.dealId, standardIds)));
      }
    }
  });
  return { ok: true };
}

function presentOffers(base: OfferRate[], rows: PackageRow[], ratesOverridden: boolean): PackageRow[] {
  const overrides = ratesOverridden
    ? rows.map((row) => ({
        sortOrder: row.sortOrder,
        listRateCents: row.listRateCents,
        cashRateCents: row.cashRateCents,
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
  if (!isTermLength(input.termLength)) return "Term length is not valid.";
  if (input.valuationDollars !== null && typeof input.valuationDollars !== "bigint") {
    return "Valuation must be whole dollars.";
  }
  if (input.hourlyCostCents !== null && !Number.isInteger(input.hourlyCostCents)) {
    return "Hourly cost must be a whole number of cents.";
  }
  const seen = new Set<string>();
  for (const pkg of input.packages) {
    const error = validatePackage({
      serviceName: pkg.serviceName,
      hoursPerWeek: pkg.hoursPerWeek,
      enabled: pkg.enabled,
      listRateCents: pkg.listRateCents,
      cashRateCents: pkg.cashRateCents,
      equityEnabled: input.equityEnabled,
    });
    if (error) return error;
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
      avatarUrl: deals.avatarUrl,
      termLength: deals.termLength,
      ratesOverridden: deals.ratesOverridden,
      equityEnabled: deals.equityEnabled,
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
        avatarUrl: row.avatarUrl,
        termLength: termFromColumn(row.termLength),
        ratesOverridden: row.ratesOverridden,
        equityEnabled: row.equityEnabled,
        offers: cascadeOffers(
          rates,
          row.ratesOverridden
            ? mine.map((pkg) => ({
                sortOrder: pkg.sortOrder,
                listRateCents: pkg.listRateCents,
                cashRateCents: pkg.cashRateCents,
              }))
            : null,
        ),
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
      avatarUrl: deals.avatarUrl,
      termLength: deals.termLength,
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
    avatarUrl: row.avatarUrl,
    termLength: termFromColumn(row.termLength),
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

export async function createDeal(input: { companyName: string }): Promise<DealRecord> {
  const companyName = input.companyName.trim();
  if (companyName === "") throw new Error("Company name is required.");
  const db = getDb();
  const base = await listBaseRates();
  const id = crypto.randomUUID();
  const token = crypto.randomBytes(32).toString("base64url");
  const offerRows = base.map((offer) => ({
    id: crypto.randomUUID(),
    dealId: id,
    serviceName: offer.serviceName,
    hoursPerWeek: offer.hoursPerWeek,
    enabled: true,
    listRateCents: offer.listRateCents,
    cashRateCents: offer.cashRateCents,
    sortOrder: offer.sortOrder,
  }));
  const record: DealRecord = {
    id,
    token,
    companyName,
    contactName: "",
    contactRole: "",
    linkedinUrl: null,
    avatarUrl: null,
    companyLogoUrl: null,
    equityEnabled: false,
    ratesOverridden: false,
    termLength: "six-month",
    round: null,
    valuationDollars: null,
    hourlyCostCents: null,
    selectedPackageId: null,
    hubspotContactId: null,
    hubspotDealId: null,
    packages: offerRows,
  };
  await db.transaction(async (tx) => {
    await tx.insert(deals).values({ id, token, companyName, ratesOverridden: false });
    await tx.insert(packages).values(offerRows);
  });
  return record;
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
  const selectedPackageId =
    existing.selectedPackageId !== null && enabledIds.has(existing.selectedPackageId)
      ? existing.selectedPackageId
      : null;

  const db = getDb();
  const dealUpdate = {
    companyName: input.companyName.trim(),
    contactName: input.contactName,
    contactRole: input.contactRole,
    linkedinUrl: blankToNull(input.linkedinUrl),
    avatarUrl: input.avatarUrl,
    companyLogoUrl: input.companyLogoUrl,
    equityEnabled: input.equityEnabled,
    ratesOverridden: input.ratesOverridden,
    termLength: input.termLength,
    round: blankToNull(input.round),
    valuationDollars: input.valuationDollars,
    hourlyCostCents: input.hourlyCostCents,
    selectedPackageId,
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
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isUuid(packageId)) return { ok: false, error: "Package not found." };
  const deal = await getDealByToken(token);
  if (!deal) return { ok: false, error: "Package not found." };
  const match = deal.packages.find((pkg) => pkg.id === packageId && pkg.enabled);
  if (!match) return { ok: false, error: "Package not found." };
  const db = getDb();
  await db.update(deals).set({ selectedPackageId: packageId }).where(eq(deals.id, deal.id));
  return { ok: true };
}

export function dealToLetter(deal: DealRecord): LetterDeal {
  const visible = deal.packages
    .filter((pkg) => pkg.enabled)
    .sort((left, right) => left.sortOrder - right.sortOrder || left.id.localeCompare(right.id));
  return {
    companyName: deal.companyName,
    companyLogoUrl: deal.companyLogoUrl,
    contactName: deal.contactName,
    avatarUrl: deal.avatarUrl,
    termLabel: termLabel(deal.termLength),
    equityEnabled: deal.equityEnabled,
    packages: visible.map((pkg) => toLetterPackage(pkg)),
    selectedPackageId: deal.selectedPackageId,
  };
}
