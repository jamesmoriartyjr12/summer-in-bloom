"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import {
  createDeal,
  getDeal,
  listBaseRates,
  saveBaseRate,
  saveDeal,
  type DealDraft,
  type DealRecord,
  type PackageDraft,
} from "@/lib/operate/deals";
import { contactFullName, readLinkedInProfile } from "@/lib/operate/linkedin";
import { companyWebsiteUrl } from "@/lib/operate/website";
import { parseBlocks } from "@/lib/operate/blocks";
import { cascadeOffers, isTermOffer, type OfferRate } from "@/lib/operate/pricing";
import { isEquityBasis, isValuationBasis } from "@/lib/operate/equity";

type SaveResult = { ok: true; notice?: string } | { ok: false; error: string };

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

// Staff set the list rate. The cash rate comes from the client's equity choice and the floor.
function readPackage(formData: FormData, index: number): PackageDraft {
  const key = `package${index}`;
  const id = text(formData, `${key}Id`);
  const listRateCents = dollarsToCents(text(formData, `${key}ListRate`)) ?? 0;
  const yearListRateCents = dollarsToCents(text(formData, `${key}YearListRate`)) ?? 0;
  return {
    ...(id ? { id } : {}),
    serviceName: "",
    hoursPerWeek: 0,
    enabled: true,
    listRateCents,
    cashRateCents: listRateCents,
    yearListRateCents,
    yearCashRateCents: yearListRateCents,
    sortOrder: index,
  };
}

function parseDraft(formData: FormData, base: OfferRate[]): DealDraft | { error: string } {
  const termOffer = text(formData, "termOffer");
  if (!isTermOffer(termOffer)) return { error: "Term length is not valid." };

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

  const valuationBasis = text(formData, "valuationBasis") || "post";
  if (!isValuationBasis(valuationBasis)) return { error: "Valuation must be pre-money or post-money." };
  const equityBasisRaw = text(formData, "equityBasis");
  const equityBasis = equityBasisRaw === "" ? null : isEquityBasis(equityBasisRaw) ? equityBasisRaw : undefined;
  if (equityBasis === undefined) return { error: "Equity basis is not valid." };
  const multiplierRaw = text(formData, "equityMultiplier").trim();
  const equityMultiplierTenths = multiplierRaw === "" ? null : Math.round(Number(multiplierRaw) * 10);
  if (equityMultiplierTenths !== null && !(equityMultiplierTenths > 0)) {
    return { error: "The multiplier must be more than zero." };
  }
  const cashFloorCents = dollarsToCents(text(formData, "cashFloorDollars"));
  if (cashFloorCents !== null && (!Number.isInteger(cashFloorCents) || cashFloorCents < 0)) {
    return { error: "The cash floor must be zero or more." };
  }

  const websiteRaw = text(formData, "companyUrl");
  const companyUrl = companyWebsiteUrl(websiteRaw);
  if (websiteRaw.trim() !== "" && companyUrl === null) {
    return { error: "Company website must be a web address, like amplifier.health." };
  }

  let letterBlocks: unknown = null;
  try {
    letterBlocks = JSON.parse(text(formData, "letterBlocks") || "null");
  } catch {
    return { error: "The letter blocks could not be read." };
  }

  const packages: PackageDraft[] = base.map((offer) => readPackage(formData, offer.sortOrder));

  return {
    companyName: text(formData, "companyName"),
    contactName: text(formData, "contactName"),
    contactRole: text(formData, "contactRole"),
    linkedinUrl: text(formData, "linkedinUrl").trim() || null,
    avatarUrl: null,
    companyLogoUrl: null,
    companyUrl,
    letterBlocks: parseBlocks(letterBlocks),
    equityEnabled: formData.get("equityEnabled") === "on",
    ratesOverridden: formData.get("ratesOverridden") === "on",
    termOffer,
    round: text(formData, "round"),
    valuationDollars,
    valuationBasis,
    equityBasis,
    equityMultiplierTenths,
    cashFloorCents,
    hourlyCostCents,
    packages,
  };
}

export async function saveBaseRateAction(formData: FormData): Promise<void> {
  await requireSession();
  const result = await saveBaseRate(dollarsToCents(text(formData, "baseRate")) ?? -1);
  revalidatePath("/operate");
  if (!result.ok) redirect(`/operate?error=rates&message=${encodeURIComponent(result.error)}`);
  redirect("/operate?saved=rates");
}

async function completeDraft(
  formData: FormData,
  existing: DealRecord | null,
): Promise<{ draft: DealDraft; notice?: string } | { ok: false; error: string }> {
  const base = await listBaseRates();
  const draft = parseDraft(formData, base);
  if ("error" in draft) return { ok: false, error: draft.error };
  let notice: string | undefined;
  if (draft.linkedinUrl) {
    const profile = await readLinkedInProfile(draft.linkedinUrl);
    if (!profile.ok) return profile;
    draft.linkedinUrl = profile.url;
    if (profile.limited) {
      draft.contactName = contactFullName(draft.contactName, profile.url);
      const sameLink = existing?.linkedinUrl === profile.url;
      draft.avatarUrl = sameLink ? (existing?.avatarUrl ?? null) : null;
      draft.companyLogoUrl = sameLink ? (existing?.companyLogoUrl ?? null) : null;
      notice = "Saved. LinkedIn is not showing a public profile, so the name comes from the link.";
    } else {
      draft.contactName = profile.profile.name;
      draft.avatarUrl = profile.profile.avatarUrl;
      draft.companyLogoUrl = profile.profile.companyLogoUrl;
      if (profile.profile.headline) draft.contactRole = profile.profile.headline;
      if (profile.profile.company) draft.companyName = profile.profile.company;
    }
  }
  const offers = cascadeOffers(
    base,
    draft.ratesOverridden
      ? draft.packages.map((pkg) => ({
          sortOrder: pkg.sortOrder,
          listRateCents: pkg.listRateCents,
          cashRateCents: pkg.cashRateCents,
          yearListRateCents: pkg.yearListRateCents,
          yearCashRateCents: pkg.yearCashRateCents,
        }))
      : null,
  );
  draft.packages = offers.map((offer) => {
    const current = draft.packages.find((pkg) => pkg.sortOrder === offer.sortOrder);
    return {
      ...(current?.id ? { id: current.id } : {}),
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
  return { draft, notice };
}

export async function createDealAction(
  formData: FormData,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await requireSession();
  const completed = await completeDraft(formData, null);
  if (!("draft" in completed)) return completed;
  const result = await createDeal(completed.draft);
  if (result.ok) revalidatePath("/operate");
  return result;
}

export async function lookupLinkedInAction(raw: string): Promise<
  | {
      ok: true;
      name: string;
      headline: string;
      company: string;
      avatarUrl: string | null;
      companyLogoUrl: string | null;
      limited: boolean;
    }
  | { ok: false; error: string }
> {
  await requireSession();
  const result = await readLinkedInProfile(raw);
  if (!result.ok) return result;
  return {
    ok: true,
    name: result.profile.name,
    headline: result.profile.headline,
    company: result.profile.company,
    avatarUrl: result.profile.avatarUrl,
    companyLogoUrl: result.profile.companyLogoUrl,
    limited: result.limited,
  };
}

export async function saveDealAction(dealId: string, formData: FormData): Promise<SaveResult> {
  await requireSession();
  const completed = await completeDraft(formData, await getDeal(dealId));
  if (!("draft" in completed)) return completed;
  const { draft, notice } = completed;
  const result = await saveDeal(dealId, draft);
  if (result.ok) {
    revalidatePath("/operate");
    revalidatePath(`/operate/${dealId}`);
    if (notice) return { ok: true, notice };
  }
  return result;
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/operate/sign-in" });
}
