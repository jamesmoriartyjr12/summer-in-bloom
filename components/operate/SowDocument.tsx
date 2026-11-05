import type { ReactNode } from "react";
import { OPERATE_SENDER } from "@/content/operate-sender";
import { DEFAULT_GREETING, greetingParts, messageParagraphs } from "@/lib/operate/blocks";
import { formatDollars, letterTerm, stepIndex, type LetterDeal } from "@/lib/operate/pricing";

// Sizes are in points: a Bloom Contracts page is 612 × 791 in Figma, one point per pixel on US Letter.
const sowStyles = `
.operate-sow {
  min-height: 100vh;
  padding: 72px 16px 48px;
  background: #E9E3D5;
  color: #070F18;
  font-family: var(--font-archivo), sans-serif;
}
.operate-sow__toolbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 56px;
  padding: 0 24px;
  background: #FAF6EC;
  border-bottom: 1px solid rgba(7, 15, 24, 0.12);
}
.operate-sow__toolbar-title {
  font-family: var(--font-jetbrains), ui-monospace, monospace;
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(7, 15, 24, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.operate-sow__toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.operate-sow__button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 16px;
  border: 1px solid #070F18;
  border-radius: 999px;
  background: transparent;
  color: #070F18;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
}
.operate-sow__button--primary {
  border-color: #FA4C1F;
  background: #FA4C1F;
}
.operate-sow__button:focus-visible {
  outline: 2px solid #070F18;
  outline-offset: 2px;
}
.operate-sow__page {
  position: relative;
  box-sizing: border-box;
  width: 612pt;
  min-height: 791pt;
  margin: 0 auto 24px;
  padding: 40pt 40pt 64pt;
  overflow: hidden;
  background: #FAF6EC;
  box-shadow: 0 8px 32px rgba(7, 15, 24, 0.12);
}
.operate-sow__intro {
  display: grid;
  grid-template-columns: 280pt 1fr;
  column-gap: 52pt;
  align-items: center;
}
.operate-sow__greeting {
  margin: 0;
  font-size: 31pt;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.01em;
}
.operate-sow__company {
  color: #FA4C1F;
  text-decoration: underline;
  text-decoration-thickness: 1.5pt;
  text-underline-offset: 4pt;
}
.operate-sow__parties {
  display: grid;
  gap: 24pt;
  text-align: right;
}
.operate-sow__party {
  display: flex;
  flex-direction: column;
  gap: 1pt;
}
.operate-sow__label {
  font-family: var(--font-jetbrains), ui-monospace, monospace;
  font-size: 7pt;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(7, 15, 24, 0.6);
}
.operate-sow__party-name {
  margin-top: 6pt;
  font-size: 13pt;
  font-weight: 500;
}
.operate-sow__party-line {
  font-size: 8pt;
  line-height: 1.4;
  color: rgba(7, 15, 24, 0.75);
}
.operate-sow__message {
  display: grid;
  gap: 10pt;
  margin-top: 32pt;
  font-size: 8.5pt;
  line-height: 1.6;
}
.operate-sow__message p {
  margin: 0;
}
.operate-sow__dates {
  display: inline-block;
  margin-top: 24pt;
  padding: 10pt 12pt;
  background: #EFE6D2;
  font-size: 10pt;
}
.operate-sow__table {
  width: 100%;
  margin-top: 20pt;
  border-collapse: collapse;
  font-size: 10pt;
}
.operate-sow__table th {
  padding: 0 0 8pt;
  border-bottom: 1pt solid #070F18;
  font-size: 7.5pt;
  font-weight: 400;
  letter-spacing: 0.04em;
  text-align: left;
  text-transform: uppercase;
}
.operate-sow__table td {
  padding: 14pt 0;
  border-bottom: 0.75pt solid rgba(7, 15, 24, 0.15);
  vertical-align: top;
}
.operate-sow__table .operate-sow__num {
  text-align: right;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.operate-sow__service {
  font-weight: 500;
}
.operate-sow__description {
  display: block;
  max-width: 200pt;
  margin-top: 4pt;
  font-size: 8pt;
  font-weight: 400;
  line-height: 1.5;
  color: rgba(7, 15, 24, 0.7);
}
.operate-sow__table tfoot td {
  padding: 12pt 0 0;
  border-bottom: 0;
}
.operate-sow__table tfoot tr:first-child td {
  border-top: 1pt solid #070F18;
}
.operate-sow__struck {
  margin-right: 6pt;
  color: rgba(7, 15, 24, 0.45);
  text-decoration: line-through;
}
.operate-sow__note {
  margin: 20pt 0 0;
  font-size: 8.5pt;
  line-height: 1.6;
}
.operate-sow__watermark {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -28pt;
  font-size: 150pt;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.04em;
  text-align: center;
  color: rgba(7, 15, 24, 0.035);
  pointer-events: none;
}
.operate-sow__footer {
  position: absolute;
  left: 40pt;
  bottom: 24pt;
  display: flex;
  align-items: center;
  gap: 16pt;
  font-size: 8pt;
}
.operate-sow__mark {
  width: 20pt;
  height: 20pt;
}
.operate-sow__heading {
  margin: 0;
  font-size: 18pt;
  font-weight: 400;
}
.operate-sow__thanks {
  margin: 8pt 0 0;
  max-width: 280pt;
  font-size: 8.5pt;
  line-height: 1.6;
}
.operate-sow__signatures {
  margin-top: 80pt;
}
.operate-sow__submitted {
  margin: 0;
  font-size: 10pt;
  font-weight: 500;
}
.operate-sow__witness {
  margin: 8pt 0 0;
  max-width: 280pt;
  font-size: 8.5pt;
  line-height: 1.5;
}
.operate-sow__sign-row {
  display: grid;
  grid-template-columns: 320pt 1fr;
  column-gap: 24pt;
  margin-top: 56pt;
}
.operate-sow__sign {
  padding-top: 8pt;
  border-top: 1pt solid #070F18;
  font-size: 8pt;
}
@media print {
  @page {
    size: letter;
    margin: 0;
  }
  .operate-sow {
    min-height: 0;
    padding: 0;
    background: #FAF6EC;
  }
  .operate-sow__toolbar {
    display: none;
  }
  .operate-sow__page {
    margin: 0;
    box-shadow: none;
    break-after: page;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .operate-sow__page:last-child {
    break-after: auto;
  }
}
`;

function longDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function Footer() {
  return (
    <footer className="operate-sow__footer">
      <img className="operate-sow__mark" src="/bloom-mark.svg" alt="Bloom" />
      <span>james@bloomventures.com</span>
    </footer>
  );
}

function Money({ listCents, cashCents, suffix }: { listCents: number; cashCents: number; suffix?: string }) {
  return (
    <>
      {cashCents < listCents ? <span className="operate-sow__struck">{formatDollars(listCents)}</span> : null}
      {formatDollars(cashCents)}
      {suffix}
    </>
  );
}

export function sowTitle(deal: LetterDeal): string {
  return `${deal.companyName} — Statement of Work`;
}

// The SOW for the term the client chose, laid out as the Bloom Contracts pages: services, then signatures.
export function SowDocument({ deal, toolbar }: { deal: LetterDeal; toolbar: ReactNode }) {
  const term = letterTerm(deal, deal.selectedTerm);
  if (!term) return null;
  const index = stepIndex(deal.steps, deal.selectedEquityCents);
  const withEquity = (deal.steps[index] ?? 0) > 0;
  const bundle = term.options[index];
  const greeting = deal.blocks.find((block) => block.type === "greeting");
  const message = deal.blocks.find((block) => block.type === "message");
  const paragraphs = message?.type === "message" ? messageParagraphs(message.text, deal.companyName) : [];
  const discounts = new Set(term.lines.map((line) => line.listRateCents - line.options[index]!.cashRateCents));
  const perHour = discounts.size === 1 ? `${formatDollars([...discounts][0]!)}/hour ` : "";

  return (
    <div className="operate-sow">
      <style>{sowStyles}</style>
      <div className="operate-sow__toolbar">{toolbar}</div>

      <section className="operate-sow__page">
        <div className="operate-sow__intro">
          <h1 className="operate-sow__greeting">
            {greetingParts(greeting?.type === "greeting" ? greeting.text : DEFAULT_GREETING, deal.companyName).map(
              (part, i) =>
                part.company ? (
                  <span key={i} className="operate-sow__company">
                    {part.text}
                  </span>
                ) : (
                  <span key={i}>{part.text}</span>
                ),
            )}
          </h1>
          <div className="operate-sow__parties">
            <div className="operate-sow__party">
              <span className="operate-sow__label">To — Client</span>
              <span className="operate-sow__party-name">{deal.companyName}</span>
              {deal.contactFullName ? <span className="operate-sow__party-line">{deal.contactFullName}</span> : null}
              {deal.contactRole ? <span className="operate-sow__party-line">{deal.contactRole}</span> : null}
            </div>
            <div className="operate-sow__party">
              <span className="operate-sow__label">From</span>
              <span className="operate-sow__party-name">{OPERATE_SENDER.company}</span>
              {OPERATE_SENDER.lines.map((line) => (
                <span key={line} className="operate-sow__party-line">
                  {line}
                </span>
              ))}
            </div>
          </div>
        </div>

        {paragraphs.length > 0 ? (
          <div className="operate-sow__message">
            {paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        ) : null}

        <div className="operate-sow__dates">
          {longDate(term.startDate)} - {longDate(term.endDate)}
        </div>

        <table className="operate-sow__table">
          <thead>
            <tr>
              <th>Services</th>
              <th className="operate-sow__num">Qty</th>
              <th className="operate-sow__num">Rate</th>
              <th className="operate-sow__num">Amount</th>
            </tr>
          </thead>
          <tbody>
            {term.lines.map((line) => {
              const option = line.options[index]!;
              return (
                <tr key={line.id}>
                  <td className="operate-sow__service">
                    {line.serviceName}
                    {line.description ? <span className="operate-sow__description">{line.description}</span> : null}
                  </td>
                  <td className="operate-sow__num">{line.hoursPerWeek} / week</td>
                  <td className="operate-sow__num">
                    <Money listCents={line.listRateCents} cashCents={option.cashRateCents} suffix="/ hour" />
                  </td>
                  <td className="operate-sow__num">
                    <Money listCents={line.weeklyListCents} cashCents={option.weeklyCashCents} />
                  </td>
                </tr>
              );
            })}
          </tbody>
          {bundle ? (
            <tfoot>
              <tr>
                <td colSpan={3}>Weekly Billables</td>
                <td className="operate-sow__num">
                  <Money listCents={bundle.weeklyListCents} cashCents={bundle.weeklyCashCents} />
                </td>
              </tr>
              <tr>
                <td colSpan={3}>Total Billable, {term.weeks} weeks</td>
                <td className="operate-sow__num">
                  <Money listCents={bundle.totalListCents} cashCents={bundle.totalCashCents} />
                </td>
              </tr>
            </tfoot>
          ) : null}
        </table>

        {withEquity && bundle && bundle.equityPerWeekCents > 0 ? (
          <p className="operate-sow__note">
            The {perHour}discount ({formatDollars(bundle.equityPerWeekCents)}/week) is applied as in-kind consideration
            toward an equity position in {deal.companyName}, as defined in the Equity Addendum.
          </p>
        ) : null}

        <div className="operate-sow__watermark" aria-hidden="true">
          BLOOM
        </div>
        <Footer />
      </section>

      <section className="operate-sow__page">
        <h2 className="operate-sow__heading">{deal.companyName}</h2>
        <p className="operate-sow__thanks">
          Thank you for the opportunity to work together. If you have any questions about this SOW please contact us at
          any time.
        </p>
        <div className="operate-sow__signatures">
          <p className="operate-sow__submitted">Submitted by: James Moriarty Jr.</p>
          <p className="operate-sow__witness">
            In witness whereof, the parties hereto have executed this Agreement as of the day and year first below
            written.
          </p>
          <div className="operate-sow__sign-row">
            <span className="operate-sow__sign">{deal.companyName} - Authorized Signatory</span>
            <span className="operate-sow__sign">Date</span>
          </div>
          <div className="operate-sow__sign-row">
            <span className="operate-sow__sign">Bloom Growth Agency - James Moriarty Jr.</span>
            <span className="operate-sow__sign">Date</span>
          </div>
        </div>
        <Footer />
      </section>
    </div>
  );
}
