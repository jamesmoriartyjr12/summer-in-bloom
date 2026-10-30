import { notFound } from "next/navigation";
import { dealToLetter, getDealByToken } from "@/lib/operate/deals";
import { CustomerLetter } from "./customer-letter";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
  title: "Bloom",
};

export default async function CustomerDealPage({ params }: { params: { token: string } }) {
  if (!process.env.DATABASE_URL) notFound();

  const deal = await getDealByToken(params.token);
  if (!deal) notFound();

  return <CustomerLetter token={params.token} deal={dealToLetter(deal)} />;
}
