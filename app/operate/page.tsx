import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listBaseRates, listDeals } from "@/lib/operate/deals";
import { termLabel } from "@/lib/operate/pricing";
import { createDealAction, saveBaseRatesAction } from "./actions";

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

const fieldStyle = {
  ...inputStyle,
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
} as const;

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function centsToInput(cents: number): string {
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
}

export default async function OperatePage({
  searchParams,
}: {
  searchParams: { error?: string | string[]; message?: string | string[]; saved?: string | string[] };
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

  const [deals, rates] = await Promise.all([listDeals(), listBaseRates()]);
  const error = one(searchParams.error);
  const notice = error === "rates" ? one(searchParams.message) : "";

  return (
    <main style={pageStyle}>
      <h1 style={{ margin: 0, fontSize: 32, fontWeight: 500 }}>Operate</h1>
      {error === "company" ? <p>Enter a company name.</p> : null}
      {notice ? <p>{notice}</p> : null}
      {one(searchParams.saved) === "rates" ? <p>Company rates saved. Deals without a custom price use them.</p> : null}

      <form action={saveBaseRatesAction} style={{ margin: "32px 0" }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 600 }}>Company rates</h2>
        <p style={{ margin: "0 0 16px", fontSize: 14 }}>
          Every deal uses these offers. A customer can override the price.
        </p>
        {rates.map((rate) => (
          <div
            key={rate.sortOrder}
            style={{ display: "grid", gap: 8, gridTemplateColumns: "1.4fr 0.7fr 0.8fr 0.8fr", marginBottom: 12 }}
          >
            <label style={{ display: "grid", gap: 4, fontSize: 14 }}>
              <span>Service</span>
              <input
                name={`offer${rate.sortOrder}Service`}
                defaultValue={rate.serviceName}
                required
                style={fieldStyle}
              />
            </label>
            <label style={{ display: "grid", gap: 4, fontSize: 14 }}>
              <span>Hours / week</span>
              <input
                name={`offer${rate.sortOrder}Hours`}
                type="number"
                min={1}
                step={1}
                defaultValue={rate.hoursPerWeek}
                required
                style={fieldStyle}
              />
            </label>
            <label style={{ display: "grid", gap: 4, fontSize: 14 }}>
              <span>List ($/hr)</span>
              <input
                name={`offer${rate.sortOrder}List`}
                inputMode="decimal"
                defaultValue={centsToInput(rate.listRateCents)}
                required
                style={fieldStyle}
              />
            </label>
            <label style={{ display: "grid", gap: 4, fontSize: 14 }}>
              <span>Cash ($/hr)</span>
              <input
                name={`offer${rate.sortOrder}Cash`}
                inputMode="decimal"
                defaultValue={centsToInput(rate.cashRateCents)}
                required
                style={fieldStyle}
              />
            </label>
          </div>
        ))}
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
          Save rates
        </button>
      </form>

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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 24,
                  flexWrap: "wrap",
                  alignItems: "baseline",
                }}
              >
                <Link href={`/operate/${deal.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                  <strong style={{ fontWeight: 600 }}>{deal.companyName}</strong>
                  {deal.contactName ? <span> · {deal.contactName}</span> : null}
                </Link>
                <span style={{ display: "flex", gap: 16, alignItems: "baseline" }}>
                  <a
                    href={`/operate/d/${deal.token}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "inherit" }}
                  >
                    Client page
                  </a>
                  <span style={{ opacity: 0.6 }}>
                    {deal.ratesOverridden ? "Custom rates" : "Company rates"}
                  </span>
                  <span style={{ opacity: 0.6 }}>{termLabel(deal.termLength)}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
