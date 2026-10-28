"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createDeal, saveDeal, type DealDraft, type PackageDraft } from "@/lib/operate/deals";
import { readLinkedInProfile } from "@/lib/operate/linkedin";
import type { TermLength } from "@/lib/operate/pricing";

type SaveResult = { ok: true } | { ok: false; error: string };

async function requireSession(): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("Not signed in.");
}

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function dollarsText(raw: string): string {
  return raw.replace(/[$,\s]/g, "");
}

// Dollar strings become integer cents. Empty input is `null`; unreadable input is NaN
// so the pricing validation reports it.
function dollarsToCents(raw: string): number | null {
  const clean = dollarsText(raw);
  if (clean === "") return null;
  return Math.round(Number(clean) * 100);
}

function isTermLength(value: string): value is TermLength {
  return value === "six-month" || value === "one-year" || value === "multi-year";
}

function readPackage(formData: FormData, index: number): PackageDraft | "dropped" {
  const key = `package${index}`;
  const serviceName = text(formData, `${key}ServiceName`);
  const listRaw = text(formData, `${key}ListRate`);
  const cashRaw = text(formData, `${key}CashRate`);
  const isEmptyRow =
    serviceName.trim() === "" && dollarsText(listRaw) === "" && dollarsText(cashRaw) === "";
  if (index > 0 && isEmptyRow) return "dropped";

  const id = text(formData, `${key}Id`);
  return {
    ...(id ? { id } : {}),
    serviceName,
    hoursPerWeek: Number(text(formData, `${key}Hours`)),
    enabled: formData.get(`${key}Enabled`) === "on",
    listRateCents: dollarsToCents(listRaw) ?? 0,
    cashRateCents: dollarsToCents(cashRaw) ?? 0,
    sortOrder: index,
  };
}

function parseDraft(formData: FormData): DealDraft | { error: string } {
  const termLength = text(formData, "termLength");
  if (!isTermLength(termLength)) return { error: "Term length is not valid." };

  const valuationRaw = dollarsText(text(formData, "valuationDollars"));
  let valuationDollars: bigint | null = null;
  if (valuationRaw !== "") {
    const whole = Number(valuationRaw);
    if (!Number.isInteger(whole) || whole < 0) {
      return { error: "Valuation must be whole dollars." };
    }
    valuationDollars = BigInt(whole);
  }

  const hourlyCostCents = dollarsToCents(text(formData, "hourlyCostDollars"));
  if (hourlyCostCents !== null && (!Number.isInteger(hourlyCostCents) || hourlyCostCents < 0)) {
    return { error: "Hourly cost must be zero or more." };
  }

  const packages: PackageDraft[] = [];
  for (const index of [0, 1]) {
    const row = readPackage(formData, index);
    if (row !== "dropped") packages.push(row);
  }

  return {
    companyName: text(formData, "companyName"),
    contactName: text(formData, "contactName"),
    contactRole: text(formData, "contactRole"),
    linkedinUrl: text(formData, "linkedinUrl").trim() || null,
    avatarUrl: null,
    equityEnabled: formData.get("equityEnabled") === "on",
    termLength,
    round: text(formData, "round"),
    valuationDollars,
    hourlyCostCents,
    packages,
  };
}

export async function createDealAction(formData: FormData): Promise<void> {
  await requireSession();
  const companyName = text(formData, "companyName").trim();
  if (companyName === "") redirect("/operate?error=company");
  const deal = await createDeal({ companyName });
  revalidatePath("/operate");
  redirect(`/operate/${deal.id}`);
}

export async function lookupLinkedInAction(
  raw: string,
): Promise<{ ok: true; name: string; headline: string; avatarUrl: string | null } | { ok: false; error: string }> {
  await requireSession();
  const result = await readLinkedInProfile(raw);
  if (!result.ok) return result;
  return {
    ok: true,
    name: result.profile.name,
    headline: result.profile.headline,
    avatarUrl: result.profile.avatarUrl,
  };
}

export async function saveDealAction(dealId: string, formData: FormData): Promise<SaveResult> {
  await requireSession();
  const draft = parseDraft(formData);
  if ("error" in draft) return { ok: false, error: draft.error };
  if (draft.linkedinUrl) {
    const profile = await readLinkedInProfile(draft.linkedinUrl);
    if (!profile.ok) return profile;
    draft.linkedinUrl = profile.url;
    draft.contactName = profile.profile.name;
    draft.avatarUrl = profile.profile.avatarUrl;
    if (draft.contactRole.trim() === "" && profile.profile.headline) {
      draft.contactRole = profile.profile.headline;
    }
  }
  const result = await saveDeal(dealId, draft);
  if (result.ok) {
    revalidatePath("/operate");
    revalidatePath(`/operate/${dealId}`);
  }
  return result;
}
