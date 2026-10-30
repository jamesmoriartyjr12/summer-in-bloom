import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { dealStartDate, getDeal } from "@/lib/operate/deals";
import { Editor, type EditorDeal } from "./editor";

export const dynamic = "force-dynamic";

export default async function DealEditorPage({ params }: { params: { dealId: string } }) {
  const session = await auth();
  if (!session) redirect("/operate/sign-in");

  if (!process.env.DATABASE_URL) {
    return (
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "72px 24px" }}>
        <p>Operate needs a database.</p>
        <p>
          <Link href="/operate" style={{ color: "inherit" }}>
            All deals
          </Link>
        </p>
      </main>
    );
  }

  const deal = await getDeal(params.dealId);
  if (!deal) notFound();

  const editorDeal: EditorDeal = {
    id: deal.id,
    token: deal.token,
    companyName: deal.companyName,
    contactName: deal.contactName,
    contactRole: deal.contactRole,
    linkedinUrl: deal.linkedinUrl ?? "",
    avatarUrl: deal.avatarUrl,
    companyLogoUrl: deal.companyLogoUrl,
    companyUrl: deal.companyUrl ?? "",
    letterBlocks: deal.letterBlocks,
    equityEnabled: deal.equityEnabled,
    ratesOverridden: deal.ratesOverridden,
    baseCents: deal.baseCents,
    termOffer: deal.termOffer,
    startDate: dealStartDate(deal),
    round: deal.round ?? "",
    valuationDollars: deal.valuationDollars === null ? "" : deal.valuationDollars.toString(),
    valuationBasis: deal.valuationBasis,
    equityBasis: deal.equityBasis,
    equityMultiplier: deal.equityMultiplier,
    cashFloorCents: deal.cashFloorCents,
    hourlyCostCents: deal.hourlyCostCents,
    selectedTerm: deal.selectedTerm,
    selectedEquityCents: deal.selectedEquityCents,
    lines: deal.lines,
  };

  return <Editor deal={editorDeal} />;
}
