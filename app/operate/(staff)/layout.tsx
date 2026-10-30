import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listDeals } from "@/lib/operate/deals";
import { OperateShell } from "./shell";

export const dynamic = "force-dynamic";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/operate/sign-in");

  let deals: Awaited<ReturnType<typeof listDeals>> = [];
  if (process.env.DATABASE_URL) {
    try {
      deals = await listDeals();
    } catch {
      deals = [];
    }
  }
  const email = session.user?.email ?? "";

  return (
    <OperateShell deals={deals} email={email}>
      {children}
    </OperateShell>
  );
}
