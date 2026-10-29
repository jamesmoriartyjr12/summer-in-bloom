import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { defaultBlocks } from "@/lib/operate/blocks";
import { listBaseRates } from "@/lib/operate/deals";
import { DEFAULT_MULTIPLIER, MIN_CASH_RATE_CENTS } from "@/lib/operate/equity";
import { Editor, type EditorDeal } from "../[dealId]/editor";

export const dynamic = "force-dynamic";

export default async function NewDealPage() {
  const session = await auth();
  if (!session) redirect("/operate/sign-in");

  if (!process.env.DATABASE_URL) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p>Operate needs a database.</p>
      </main>
    );
  }

  const baseRates = await listBaseRates();
  const blank: EditorDeal = {
    id: "",
    token: "",
    companyName: "",
    contactName: "",
    contactRole: "",
    linkedinUrl: "",
    avatarUrl: null,
    companyLogoUrl: null,
    companyUrl: "",
    letterBlocks: defaultBlocks(),
    equityEnabled: false,
    ratesOverridden: false,
    baseRates,
    termOffer: "both",
    round: "",
    valuationDollars: "",
    valuationBasis: "post",
    equityBasis: null,
    equityMultiplier: DEFAULT_MULTIPLIER,
    cashFloorCents: MIN_CASH_RATE_CENTS,
    hourlyCostCents: null,
    selectedPackageId: null,
    selectedTerm: null,
    selectedEquityCents: 0,
    packages: baseRates.map((rate) => ({
      id: "",
      serviceName: rate.serviceName,
      hoursPerWeek: rate.hoursPerWeek,
      enabled: true,
      listRateCents: rate.listRateCents,
      yearListRateCents: rate.yearListRateCents,
    })),
  };

  return <Editor deal={blank} />;
}
