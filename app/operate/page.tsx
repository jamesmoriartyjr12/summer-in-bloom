import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listDeals } from "@/lib/operate/deals";
import { termLabel } from "@/lib/operate/pricing";
import { createDealAction } from "./actions";

export const dynamic = "force-dynamic";

const pageStyle = {
  maxWidth: 720,
  margin: "0 auto",
  padding: "72px 24px",
} as const;

const inputStyle = {
  font: "inherit",
  color: "inherit",
  background: "transparent",
  border: "1px solid rgba(7, 15, 24, 0.3)",
  padding: "8px 10px",
  minWidth: 240,
} as const;

export default async function OperatePage({
  searchParams,
}: {
  searchParams: { error?: string | string[] };
}) {
  const session = await auth();
  if (!session) redirect("/operate/sign-in");

  if (!process.env.DATABASE_URL) {
    return (
      <main style={pageStyle}>
        <p>Operate needs a database.</p>
      </main>
    );
  }

  const deals = await listDeals();

  return (
    <main style={pageStyle}>
      <h1 style={{ margin: 0, fontSize: 32, fontWeight: 500 }}>Operate</h1>
      {searchParams.error === "company" ? <p>Enter a company name.</p> : null}

      <form
        action={createDealAction}
        style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "32px 0 40px" }}
      >
        <label style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span>New deal</span>
          <input name="companyName" required placeholder="Company name" style={inputStyle} />
        </label>
        <button
          type="submit"
          style={{
            font: "inherit",
            color: "#FAF6EC",
            background: "#070F18",
            border: 0,
            padding: "8px 16px",
            cursor: "pointer",
          }}
        >
          Create
        </button>
      </form>

      {deals.length === 0 ? (
        <p>No deals yet.</p>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {deals.map((deal) => (
            <li
              key={deal.id}
              style={{ borderBottom: "1px solid rgba(7, 15, 24, 0.14)", padding: "16px 0" }}
            >
              <Link
                href={`/operate/${deal.id}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 24,
                  flexWrap: "wrap",
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                <span>
                  <strong style={{ fontWeight: 600 }}>{deal.companyName}</strong>
                  {deal.contactName ? <span> · {deal.contactName}</span> : null}
                </span>
                <span style={{ opacity: 0.6 }}>{termLabel(deal.termLength)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
