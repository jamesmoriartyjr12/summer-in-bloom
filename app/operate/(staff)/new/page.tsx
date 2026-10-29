import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { defaultBlocks } from "@/lib/operate/blocks";
import { listBaseRates } from "@/lib/operate/deals";
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
    hourlyCostCents: null,
    selectedPackageId: null,
    selectedTerm: null,
    packages: baseRates.map((rate) => ({
      id: "",
      serviceName: rate.serviceName,
      hoursPerWeek: rate.hoursPerWeek,
      enabled: true,
      listRateCents: rate.listRateCents,
      cashRateCents: rate.cashRateCents,
      yearListRateCents: rate.yearListRateCents,
      yearCashRateCents: rate.yearCashRateCents,
    })),
  };

  return <Editor deal={blank} />;
}
