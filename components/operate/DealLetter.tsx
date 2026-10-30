"use client";

import { useState, type ReactNode } from "react";
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
.operate-letter__wordmark {
  display: block;
  width: min(1100px, 88%);
  height: auto;
  margin: clamp(40px, 6vh, 72px) auto 0;
  opacity: 0.1;
  filter: brightness(0);
  pointer-events: none;
  user-select: none;
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
.operate-letter__block--greeting + .operate-letter__block--equity {
  margin-top: 24px;
}
.operate-letter__block--equity + .operate-letter__block--offers,
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
.operate-letter__terms {
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  border: 1px solid rgba(7, 15, 24, 0.2);
  border-radius: 999px;
}
.operate-letter__term-option {
  margin: 0;
  padding: 8px 18px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: rgba(7, 15, 24, 0.7);
  font: inherit;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.2;
  cursor: pointer;
  appearance: none;
  transition: background-color 150ms ease, color 150ms ease;
}
.operate-letter__term-option:hover {
  color: #070F18;
}
.operate-letter__term-option[aria-checked="true"],
.operate-letter__term-option[aria-pressed="true"] {
  background: #070F18;
  color: #FAF6EC;
}
.operate-letter__choice {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
}
.operate-letter__steps {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.operate-letter__step {
  margin: 0;
  padding: 6px 14px;
  border: 1px solid rgba(7, 15, 24, 0.2);
  border-radius: 999px;
  background: transparent;
  color: rgba(7, 15, 24, 0.7);
  font: inherit;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  appearance: none;
  transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease;
}
.operate-letter__step:hover {
  border-color: #070F18;
  color: #070F18;
}
.operate-letter__step[aria-checked="true"] {
  border-color: #070F18;
  background: #070F18;
  color: #FAF6EC;
}
.operate-letter__step:focus-visible,
.operate-letter__term-option:focus-visible {
  outline: 2px solid #070F18;
  outline-offset: 3px;
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
.operate-letter__row {
  display: block;
  padding: 20px 10px;
  border-bottom: 1px solid rgba(7, 15, 24, 0.14);
}
.operate-letter__totals {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px 32px;
  padding: 18px 10px 0;
}
.operate-letter__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  column-gap: 32px;
  row-gap: 8px;
  align-items: end;
  width: 100%;
}
.operate-letter__offer {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.operate-letter__service {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.3;
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
.operate-letter__equity {
  display: block;
  margin: 16px 10px 0;
  max-width: 40rem;
  font-size: 16px;
  line-height: 1.45;
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
  .operate-letter__grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
  .operate-letter__option {
    padding: 20px 14px 18px;
  }
  .operate-letter__totals {
    justify-content: flex-start;
  }
  .operate-letter__offer {
    grid-column: 1 / -1;
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

export function equitySentence(option: BundleOption | undefined, months: number): string | null {
  if (!option || option.equityPerWeekCents <= 0) return null;
  const ownership = option.ownershipPercent === null ? "" : `, for ${formatPercent(option.ownershipPercent)} of the company`;
  return `${formatDollars(option.equityPerWeekCents)}/week goes toward equity: ${formatDollars(option.equityTotalCents)} over ${months} months${ownership}.`;
}

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

function Figure({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="operate-letter__figure">
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
  return (
    <span className="operate-letter__row">
      <span className="operate-letter__grid">
        {name ?? (
          <span className="operate-letter__offer">
            <span className="operate-letter__service">{line.serviceName}</span>
            <span className="operate-letter__hours">{line.hoursPerWeek} / week</span>
          </span>
        )}
        <Figure label="Rate">
          {rate ?? <Figures equityEnabled={withEquity} listCents={line.listRateCents} cashCents={option.cashRateCents} />}
        </Figure>
        <Figure label="Weekly">
          <Figures equityEnabled={withEquity} listCents={line.weeklyListCents} cashCents={option.weeklyCashCents} />
        </Figure>
      </span>
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

export function LetterToggle<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="operate-letter__terms">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          className="operate-letter__term-option"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

type Payment = "cash" | "equity";

const PAYMENT_OPTIONS: { value: Payment; label: string }[] = [
  { value: "cash", label: "All cash" },
  { value: "equity", label: "Cash and equity" },
];

// The first decision: pay all cash, or move part of each hour into equity.
export function EquityView({
  steps,
  step,
  onStep,
}: {
  steps: number[];
  step: number;
  onStep: (stepCents: number) => void;
}) {
  const offered = steps.filter((value) => value > 0);
  if (offered.length === 0) return null;
  const current = steps[stepIndex(steps, step)] ?? 0;
  return (
    <div className="operate-letter__choice">
      <LetterToggle
        label="Payment"
        options={PAYMENT_OPTIONS}
        value={current > 0 ? "equity" : "cash"}
        onChange={(payment) => onStep(payment === "cash" ? 0 : (offered[0] ?? 0))}
      />
      {current > 0 ? (
        <div className="operate-letter__steps" role="radiogroup" aria-label="Per hour into equity">
          <span className="operate-letter__figure-label">Per hour into equity</span>
          {offered.map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={value === current}
              className="operate-letter__step"
              onClick={() => onStep(value)}
            >
              {formatDollars(value)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function termDates(term: LetterTerm): string {
  return `${term.weeks} weeks · ${formatDate(term.startDate)} – ${formatDate(term.endDate)}`;
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
}: {
  term: LetterTerm;
  index: number;
  withEquity: boolean;
  mode: "customer" | "preview";
  selected: boolean;
  onSelect?: (term: ClientTerm) => void;
  renderName?: (line: LetterLine, index: number, term: LetterTerm) => ReactNode;
  renderRate?: (line: LetterLine, option: LineOption, term: LetterTerm, index: number) => ReactNode;
}) {
  const bundle = term.options[index];
  const sentence = withEquity ? equitySentence(bundle, term.months) : null;
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
      {bundle ? (
        <span className="operate-letter__totals">
          {term.lines.length > 1 ? (
            <Figure label="Weekly total">
              <Figures equityEnabled={withEquity} listCents={bundle.weeklyListCents} cashCents={bundle.weeklyCashCents} />
            </Figure>
          ) : null}
          <Figure label={`Over ${term.weeks} weeks`}>
            <span className="operate-letter__primary">{formatDollars(bundle.totalCashCents)}</span>
          </Figure>
          {withEquity ? (
            <Figure label="Equity">
              <span className="operate-letter__primary">
                {bundle.equityTotalCents > 0 ? formatDollars(bundle.equityTotalCents) : "—"}
              </span>
              {bundle.ownershipPercent !== null ? (
                <span className="operate-letter__percent">{formatPercent(bundle.ownershipPercent)}</span>
              ) : null}
            </Figure>
          ) : null}
        </span>
      ) : null}
      {sentence ? <span className="operate-letter__equity">{sentence}</span> : null}
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

export function OffersView({
  deal,
  step,
  mode,
  onSelect,
  renderName,
  renderRate,
}: {
  deal: LetterDeal;
  step: number;
  mode: "customer" | "preview";
  onSelect?: (term: ClientTerm) => void;
  renderName?: (line: LetterLine, index: number, term: LetterTerm) => ReactNode;
  renderRate?: (line: LetterLine, option: LineOption, term: LetterTerm, index: number) => ReactNode;
}) {
  const index = stepIndex(deal.steps, step);
  const withEquity = (deal.steps[index] ?? 0) > 0;
  const chosenHere = stepIndex(deal.steps, deal.selectedEquityCents) === index;
  return (
    <div className="operate-letter__options">
      {deal.terms.map((term) => (
        <TermOption
          key={term.term}
          term={term}
          index={index}
          withEquity={withEquity}
          mode={mode}
          selected={chosenHere && deal.selectedTerm === term.term}
          onSelect={onSelect}
          renderName={renderName}
          renderRate={renderRate}
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
      <img className="operate-letter__wordmark" src="/bloom-wordmark.svg" alt="" aria-hidden draggable={false} />
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

function showsToClient(block: LetterBlock, deal: LetterDeal): boolean {
  if (block.type === "equity") return deal.steps.some((step) => step > 0);
  return true;
}

export function DealLetter({
  deal,
  mode,
  onSelect,
}: {
  deal: LetterDeal;
  mode: "customer" | "preview";
  onSelect?: (term: ClientTerm, equityCents: number) => void;
}) {
  const [step, setStep] = useState(deal.selectedEquityCents);
  const stepCents = deal.steps[stepIndex(deal.steps, step)] ?? 0;
  return (
    <LetterFrame companyName={deal.companyName} companyLogoUrl={deal.companyLogoUrl}>
      {deal.blocks
        .filter((block) => showsToClient(block, deal))
        .map((block) => (
          <section key={block.id} className={blockClassName(block)}>
            {block.type === "greeting" ? <GreetingView text={block.text} companyName={deal.companyName} /> : null}
            {block.type === "equity" ? <EquityView steps={deal.steps} step={step} onStep={setStep} /> : null}
            {block.type === "offers" ? (
              <OffersView deal={deal} step={step} mode={mode} onSelect={(term) => onSelect?.(term, stepCents)} />
            ) : null}
            {block.type === "divider" ? <hr className="operate-letter__divider" /> : null}
          </section>
        ))}
    </LetterFrame>
  );
}
