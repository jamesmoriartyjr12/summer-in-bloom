"use client";

import type { ReactNode } from "react";
import { greetingParts, type LetterBlock } from "@/lib/operate/blocks";
import { formatDate } from "@/lib/operate/dates";
import { formatPercent } from "@/lib/operate/equity";
import {
  formatDollars,
  stepIndex,
  type BundleOption,
  type ClientTerm,
  type LetterDeal,
  type LetterLine,
  type LetterTerm,
  type LineOption,
} from "@/lib/operate/pricing";

export const letterStyles = `
.operate-letter {
  position: relative;
  min-height: 100vh;
  background: #FAF6EC;
  color: #070F18;
  font-family: var(--font-archivo), sans-serif;
}
.operate-letter__header {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 96px;
  padding: 0 24px;
  background: #FAF6EC;
  border-bottom: 1px solid rgba(7, 15, 24, 0.12);
}
.operate-letter--canvas .operate-letter__header {
  position: static;
}
.operate-letter--canvas .operate-letter__sheet {
  padding-left: 80px;
  padding-right: 48px;
}
.operate-letter__logo {
  display: block;
  height: 32px;
  width: auto;
  max-width: 140px;
  object-fit: contain;
}
.operate-letter__sheet {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-height: 100vh;
  max-width: 840px;
  margin: 0 auto;
  padding: clamp(40px, 6vh, 72px) clamp(24px, 4vw, 48px) 48px;
}
.operate-letter__block + .operate-letter__block {
  margin-top: 48px;
}
.operate-letter__block--greeting + .operate-letter__block--offers {
  margin-top: 32px;
}
.operate-letter__greeting {
  margin: 0;
  max-width: 16em;
  font-family: inherit;
  font-weight: 500;
  font-size: clamp(34px, 4.8vw, 56px);
  line-height: 1.18;
  letter-spacing: -0.02em;
}
.operate-letter__company {
  color: #FA4C1F;
}
.operate-letter__divider {
  margin: 0;
  border: 0;
  border-top: 1px solid rgba(7, 15, 24, 0.14);
}
.operate-letter__options {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.operate-letter__option {
  display: block;
  width: 100%;
  margin: 0;
  padding: 24px 24px 22px;
  border: 1px solid rgba(7, 15, 24, 0.16);
  border-radius: 6px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  box-sizing: border-box;
  appearance: none;
  container: operate-option / inline-size;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
button.operate-letter__option {
  cursor: pointer;
}
button.operate-letter__option:hover {
  border-color: rgba(7, 15, 24, 0.5);
}
.operate-letter__option--selected,
button.operate-letter__option--selected:hover {
  border-color: #070F18;
  box-shadow: inset 0 0 0 1px #070F18;
}
button.operate-letter__option:focus-visible {
  outline: 2px solid #070F18;
  outline-offset: 3px;
}
.operate-letter__option-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px 24px;
  padding: 0 10px 18px;
  border-bottom: 1px solid rgba(7, 15, 24, 0.14);
}
.operate-letter__option-title {
  display: inline-flex;
  align-items: baseline;
  gap: 14px;
}
.operate-letter__option-term {
  font-size: 26px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.01em;
}
.operate-letter__mono {
  font-family: var(--font-jetbrains), ui-monospace, monospace;
  font-size: 12px;
  line-height: 1.4;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(7, 15, 24, 0.6);
}
.operate-letter__picked {
  color: #FA4C1F;
}
.operate-letter__table {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  column-gap: 32px;
}
.operate-letter__table--equity {
  grid-template-columns: minmax(0, 1fr) auto auto auto;
}
.operate-letter__row,
.operate-letter__totals {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
  row-gap: 8px;
  align-items: end;
}
.operate-letter__row {
  padding: 20px 10px;
  border-bottom: 1px solid rgba(7, 15, 24, 0.14);
}
.operate-letter__totals {
  padding: 18px 10px 0;
}
.operate-letter__add {
  grid-column: 1 / -1;
  display: flex;
  padding: 14px 10px;
  border-bottom: 1px solid rgba(7, 15, 24, 0.14);
}
.operate-letter__total-weekly,
.operate-letter__total-over {
  grid-column: -2;
}
.operate-letter__total-equity {
  grid-column: -3;
}
.operate-letter__offer {
  display: contents;
}
.operate-letter__offer > .operate-letter__service {
  grid-column: 1 / -2;
  grid-row: 1;
  min-width: 0;
}
.operate-letter__offer > .operate-letter__hours {
  grid-column: -2;
  grid-row: 1;
  justify-self: end;
  white-space: nowrap;
}
.operate-letter__offer > .operate-letter__description {
  grid-column: 1 / -1;
  grid-row: 2;
}
.operate-letter__row > .operate-letter__figure {
  grid-row: 2;
}
.operate-letter__row--described > .operate-letter__figure {
  grid-row: 3;
  margin-top: 8px;
}
.operate-letter__row > .operate-letter__figure--rate {
  grid-column: 2;
}
.operate-letter__row > .operate-letter__figure--cash {
  grid-column: 3;
}
.operate-letter__row > .operate-letter__figure--weekly {
  grid-column: -2;
}
.operate-letter__service {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.3;
}
.operate-letter__description {
  max-width: 40rem;
  font-size: 15px;
  line-height: 1.45;
  color: rgba(7, 15, 24, 0.7);
}
.operate-letter__hours {
  font-size: 16px;
  line-height: 1.4;
  color: rgba(7, 15, 24, 0.7);
}
.operate-letter__figure {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
.operate-letter__figure--start {
  align-items: flex-start;
}
.operate-letter__percent {
  font-size: 14px;
  color: rgba(7, 15, 24, 0.7);
  font-variant-numeric: tabular-nums;
}
.operate-letter__figure-label {
  font-size: 13px;
  line-height: 1.3;
  color: rgba(7, 15, 24, 0.55);
}
.operate-letter__pair {
  display: inline-flex;
  align-items: baseline;
  gap: 10px;
  font-variant-numeric: tabular-nums;
}
.operate-letter__struck {
  color: rgba(7, 15, 24, 0.45);
  font-weight: 400;
  text-decoration: line-through;
}
.operate-letter__primary {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.operate-letter__footer {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: auto;
  padding-top: 72px;
}
.operate-letter__mark {
  display: block;
  width: 60px;
  height: 60px;
}
.operate-letter__address {
  margin: 0;
  font-size: 16px;
  line-height: 1.4;
}
@media (max-width: 700px) {
  .operate-letter__option {
    padding: 20px 14px 18px;
  }
}
@container operate-option (max-width: 640px) {
  .operate-letter__table,
  .operate-letter__table--equity {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
  .operate-letter__totals > * {
    grid-column: auto;
  }
  .operate-letter__offer > .operate-letter__service {
    grid-column: 1 / -1;
  }
  .operate-letter__offer > .operate-letter__hours {
    grid-column: 1 / -1;
    grid-row: 2;
    justify-self: start;
  }
  .operate-letter__offer > .operate-letter__description {
    grid-row: 3;
  }
  .operate-letter__row > .operate-letter__figure {
    grid-row: auto;
    grid-column: auto;
  }
  .operate-letter__figure {
    align-items: flex-start;
  }
  .operate-letter__pair {
    flex-direction: column;
    align-items: flex-start;
  }
}
`;

export function Figures({
  equityEnabled,
  listCents,
  cashCents,
}: {
  equityEnabled: boolean;
  listCents: number;
  cashCents: number;
}) {
  if (!equityEnabled || cashCents >= listCents) {
    return <span className="operate-letter__primary">{formatDollars(listCents)}</span>;
  }

  return (
    <span className="operate-letter__pair">
      <span className="operate-letter__struck">{formatDollars(listCents)}</span>
      <span className="operate-letter__primary">{formatDollars(cashCents)}</span>
    </span>
  );
}

function Figure({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <span className={className ? `operate-letter__figure ${className}` : "operate-letter__figure"}>
      <span className="operate-letter__figure-label">{label}</span>
      {children}
    </span>
  );
}

function LineRow({
  line,
  option,
  withEquity,
  name,
  rate,
}: {
  line: LetterLine;
  option: LineOption;
  withEquity: boolean;
  name?: ReactNode;
  rate?: ReactNode;
}) {
  const reduced = withEquity && option.cashRateCents < line.listRateCents;
  const listRate = rate ?? <span className="operate-letter__primary">{formatDollars(line.listRateCents)}</span>;
  return (
    <span className={line.description ? "operate-letter__row operate-letter__row--described" : "operate-letter__row"}>
      {name ?? (
        <span className="operate-letter__offer">
          <span className="operate-letter__service">{line.serviceName}</span>
          <span className="operate-letter__hours">{line.hoursPerWeek} / week</span>
          {line.description ? <span className="operate-letter__description">{line.description}</span> : null}
        </span>
      )}
      <Figure label="Rate" className="operate-letter__figure--rate">
        {reduced ? <span className="operate-letter__struck">{listRate}</span> : listRate}
      </Figure>
      {withEquity ? (
        <Figure label="w/ Investment" className="operate-letter__figure--start operate-letter__figure--cash">
          <span className="operate-letter__primary">{formatDollars(option.cashRateCents)}</span>
        </Figure>
      ) : null}
      <Figure label="Weekly Billables" className="operate-letter__figure--weekly">
        <Figures equityEnabled={withEquity} listCents={line.weeklyListCents} cashCents={option.weeklyCashCents} />
      </Figure>
    </span>
  );
}

export function GreetingView({ text, companyName }: { text: string; companyName: string }) {
  return (
    <h1 className="operate-letter__greeting">
      {greetingParts(text, companyName).map((part, index) =>
        part.company ? (
          <span key={index} className="operate-letter__company">
            {part.text}
          </span>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </h1>
  );
}

export function termDates(term: LetterTerm): string {
  return `${formatDate(term.startDate)} – ${formatDate(term.endDate)}`;
}

// One term is one whole offer: every service line, priced for that term.
function TermOption({
  term,
  index,
  withEquity,
  mode,
  selected,
  onSelect,
  renderName,
  renderRate,
  renderAddLine,
}: {
  term: LetterTerm;
  index: number;
  withEquity: boolean;
  mode: "customer" | "preview";
  selected: boolean;
  onSelect?: (term: ClientTerm) => void;
  renderName?: (line: LetterLine, index: number, term: LetterTerm) => ReactNode;
  renderRate?: (line: LetterLine, option: LineOption, term: LetterTerm, index: number) => ReactNode;
  renderAddLine?: (term: LetterTerm) => ReactNode;
}) {
  const addLine = renderAddLine?.(term);
  const bundle = term.options[index];
  const className = selected ? "operate-letter__option operate-letter__option--selected" : "operate-letter__option";
  const body = (
    <>
      <span className="operate-letter__option-head">
        <span className="operate-letter__option-title">
          <span className="operate-letter__option-term">{term.label}</span>
          {selected ? <span className="operate-letter__mono operate-letter__picked">Selected</span> : null}
        </span>
        <span className="operate-letter__mono">{termDates(term)}</span>
      </span>
      <span className={withEquity ? "operate-letter__table operate-letter__table--equity" : "operate-letter__table"}>
        {term.lines.map((line, i) => (
          <LineRow
            key={line.id}
            line={line}
            option={line.options[index]!}
            withEquity={withEquity}
            name={renderName?.(line, i, term)}
            rate={renderRate?.(line, line.options[index]!, term, i)}
          />
        ))}
        {addLine ? <span className="operate-letter__add">{addLine}</span> : null}
        {bundle ? (
          <span className="operate-letter__totals">
            {term.lines.length > 1 ? (
              <Figure label="Weekly total" className="operate-letter__total-weekly">
                <Figures equityEnabled={withEquity} listCents={bundle.weeklyListCents} cashCents={bundle.weeklyCashCents} />
              </Figure>
            ) : null}
            {withEquity ? (
              <Figure label="Total Investment" className="operate-letter__figure--start operate-letter__total-equity">
                <span className="operate-letter__primary">
                  {bundle.equityTotalCents > 0 ? formatDollars(bundle.equityTotalCents) : "—"}
                </span>
                {bundle.ownershipPercent !== null ? (
                  <span className="operate-letter__percent">{formatPercent(bundle.ownershipPercent)}</span>
                ) : null}
              </Figure>
            ) : null}
            <Figure label="Total Billable" className="operate-letter__total-over">
              <Figures equityEnabled={withEquity} listCents={bundle.totalListCents} cashCents={bundle.totalCashCents} />
            </Figure>
          </span>
        ) : null}
      </span>
    </>
  );

  if (mode === "customer") {
    return (
      <button type="button" className={className} aria-pressed={selected} onClick={() => onSelect?.(term.term)}>
        {body}
      </button>
    );
  }
  return <div className={className}>{body}</div>;
}

// Every term is priced at the equity amount staff set on the deal.
export function OffersView({
  deal,
  mode,
  onSelect,
  renderName,
  renderRate,
  renderAddLine,
}: {
  deal: LetterDeal;
  mode: "customer" | "preview";
  onSelect?: (term: ClientTerm) => void;
  renderName?: (line: LetterLine, index: number, term: LetterTerm) => ReactNode;
  renderRate?: (line: LetterLine, option: LineOption, term: LetterTerm, index: number) => ReactNode;
  renderAddLine?: (term: LetterTerm) => ReactNode;
}) {
  const index = stepIndex(deal.steps, deal.selectedEquityCents);
  const withEquity = (deal.steps[index] ?? 0) > 0;
  return (
    <div className="operate-letter__options">
      {deal.terms.map((term) => (
        <TermOption
          key={term.term}
          term={term}
          index={index}
          withEquity={withEquity}
          mode={mode}
          selected={deal.selectedTerm === term.term}
          onSelect={onSelect}
          renderName={renderName}
          renderRate={renderRate}
          renderAddLine={renderAddLine}
        />
      ))}
    </div>
  );
}

export function blockClassName(block: LetterBlock): string {
  return `operate-letter__block operate-letter__block--${block.type}`;
}

export function LetterFrame({
  companyName,
  companyLogoUrl,
  canvas = false,
  children,
}: {
  companyName: string;
  companyLogoUrl: string | null;
  canvas?: boolean;
  children: ReactNode;
}) {
  return (
    <article className={canvas ? "operate-letter operate-letter--canvas" : "operate-letter"}>
      <style>{letterStyles}</style>
      {companyLogoUrl ? (
        <header className="operate-letter__header">
          <img className="operate-letter__logo" src={companyLogoUrl} alt={companyName} />
        </header>
      ) : null}
      <div className="operate-letter__sheet">
        {children}
        <footer className="operate-letter__footer">
          <img className="operate-letter__mark" src="/bloom-mark.svg" alt="Bloom" />
          <p className="operate-letter__address">james@bloomventures.com</p>
        </footer>
      </div>
    </article>
  );
}

export function DealLetter({
  deal,
  mode,
  onSelect,
}: {
  deal: LetterDeal;
  mode: "customer" | "preview";
  onSelect?: (term: ClientTerm) => void;
}) {
  return (
    <LetterFrame companyName={deal.companyName} companyLogoUrl={deal.companyLogoUrl}>
      {deal.blocks.map((block) => (
        <section key={block.id} className={blockClassName(block)}>
          {block.type === "greeting" ? <GreetingView text={block.text} companyName={deal.companyName} /> : null}
          {block.type === "offers" ? <OffersView deal={deal} mode={mode} onSelect={onSelect} /> : null}
          {block.type === "divider" ? <hr className="operate-letter__divider" /> : null}
        </section>
      ))}
    </LetterFrame>
  );
}
