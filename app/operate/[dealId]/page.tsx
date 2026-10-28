import Link from "next/link";
import { notFound } from "next/navigation";
import { getDeal } from "@/lib/operate/deals";
import { Editor, type EditorDeal } from "./editor";

export const dynamic = "force-dynamic";

export default async function DealEditorPage({ params }: { params: { dealId: string } }) {
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
    equityEnabled: deal.equityEnabled,
    termLength: deal.termLength,
    round: deal.round ?? "",
    valuationDollars: deal.valuationDollars === null ? "" : deal.valuationDollars.toString(),
    hourlyCostCents: deal.hourlyCostCents,
    selectedPackageId: deal.selectedPackageId,
    packages: deal.packages
      .slice()
      .sort((left, right) => left.sortOrder - right.sortOrder || left.id.localeCompare(right.id))
      .map((pkg) => ({
        id: pkg.id,
        serviceName: pkg.serviceName,
        hoursPerWeek: pkg.hoursPerWeek,
        enabled: pkg.enabled,
        listRateCents: pkg.listRateCents,
        cashRateCents: pkg.cashRateCents,
      })),
  };

  return <Editor deal={editorDeal} />;
}
