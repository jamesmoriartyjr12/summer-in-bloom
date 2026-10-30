import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { defaultBlocks } from "@/lib/operate/blocks";
import { currentBaseCents, dealStartDate, defaultLine } from "@/lib/operate/deals";
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

  const baseCents = await currentBaseCents();
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
    baseCents,
    termOffer: "both",
    startDate: dealStartDate({ startDate: null }),
    round: "",
    valuationDollars: "",
    valuationBasis: "post",
    equityBasis: null,
    equityMultiplier: DEFAULT_MULTIPLIER,
    cashFloorCents: MIN_CASH_RATE_CENTS,
    hourlyCostCents: null,
    selectedTerm: null,
    selectedEquityCents: 0,
    lines: [defaultLine(baseCents, "")],
  };

  return <Editor deal={blank} />;
}
