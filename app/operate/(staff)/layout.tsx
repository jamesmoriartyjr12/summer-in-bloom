import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listDeals } from "@/lib/operate/deals";
import { OperateShell } from "./shell";

export const dynamic = "force-dynamic";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/operate/sign-in");

  const deals = process.env.DATABASE_URL ? await listDeals() : [];
  const email = session.user?.email ?? "";

  return (
    <OperateShell deals={deals} email={email}>
      {children}
    </OperateShell>
  );
}
