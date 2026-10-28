import crypto from "node:crypto";
import { asc, eq } from "drizzle-orm";
import { getDb } from "./db";
import {
  termLabel,
  toLetterPackage,
  validatePackage,
  type LetterDeal,
  type TermLength,
} from "./pricing";
import { deals, packages } from "./schema";

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
  equityEnabled: boolean;
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
  equityEnabled: boolean;
  termLength: TermLength;
  round: string | null;
  valuationDollars: bigint | null;
  hourlyCostCents: number | null;
  packages: PackageDraft[];
};

export type DealListItem = {
  id: string;
  companyName: string;
  contactName: string;
  contactRole: string;
  termLength: TermLength;
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
    equityEnabled: deal.equityEnabled,
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

async function readDeal(where: ReturnType<typeof eq>): Promise<DealRecord | null> {
  const db = getDb();
  const [deal] = await db.select().from(deals).where(where).limit(1);
  if (!deal) return null;
  const rows = await db
    .select()
    .from(packages)
    .where(eq(packages.dealId, deal.id))
    .orderBy(asc(packages.sortOrder), asc(packages.id));
  return toDealRecord(deal, rows);
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

export async function listDeals(): Promise<DealListItem[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: deals.id,
      companyName: deals.companyName,
      contactName: deals.contactName,
      contactRole: deals.contactRole,
      termLength: deals.termLength,
    })
    .from(deals)
    .orderBy(asc(deals.companyName), asc(deals.id));
  return rows.map((row) => ({
    id: row.id,
    companyName: row.companyName,
    contactName: row.contactName,
    contactRole: row.contactRole,
    termLength: termFromColumn(row.termLength),
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
  const id = crypto.randomUUID();
  const packageId = crypto.randomUUID();
  const token = crypto.randomBytes(32).toString("base64url");
  const record: DealRecord = {
    id,
    token,
    companyName,
    contactName: "",
    contactRole: "",
    equityEnabled: false,
    termLength: "six-month",
    round: null,
    valuationDollars: null,
    hourlyCostCents: null,
    selectedPackageId: null,
    hubspotContactId: null,
    hubspotDealId: null,
    packages: [
      {
        id: packageId,
        dealId: id,
        serviceName: "Design Engineering",
        hoursPerWeek: 40,
        enabled: true,
        listRateCents: 0,
        cashRateCents: 0,
        sortOrder: 0,
      },
    ],
  };
  const pkg = record.packages[0];
  if (!pkg) throw new Error("Could not create the package.");
  await db.transaction(async (tx) => {
    await tx.insert(deals).values({ id, token, companyName });
    await tx.insert(packages).values(pkg);
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
    equityEnabled: input.equityEnabled,
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
    termLabel: termLabel(deal.termLength),
    equityEnabled: deal.equityEnabled,
    packages: visible.map((pkg) => toLetterPackage(pkg)),
    selectedPackageId: deal.selectedPackageId,
  };
}
