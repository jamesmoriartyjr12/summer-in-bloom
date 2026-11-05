import { notFound } from "next/navigation";
import { SowDocument, sowTitle } from "@/components/operate/SowDocument";
import { dealToLetter, getDealByToken } from "@/lib/operate/deals";
import { PrintButton } from "./print-button";

export const dynamic = "force-dynamic";

async function letterForToken(token: string) {
  if (!process.env.DATABASE_URL) return null;
  const deal = await getDealByToken(token);
  if (!deal || !deal.selectedTerm) return null;
  return dealToLetter(deal);
}

export async function generateMetadata({ params }: { params: { token: string } }) {
  const letter = await letterForToken(params.token);
  return {
    robots: { index: false, follow: false },
    title: letter ? sowTitle(letter) : "Bloom",
  };
}

export default async function SowPage({ params }: { params: { token: string } }) {
  const letter = await letterForToken(params.token);
  if (!letter) notFound();

  return (
    <SowDocument
      deal={letter}
      toolbar={
        <>
          <span className="operate-sow__toolbar-title">{sowTitle(letter)}</span>
          <span className="operate-sow__toolbar-actions">
            <a className="operate-sow__button" href={`/operate/d/${params.token}`}>
              Back to the letter
            </a>
            <PrintButton />
          </span>
        </>
      }
    />
  );
}
