"use client";

import { useState, type ReactNode } from "react";
import { greetingParts, type LetterBlock } from "@/lib/operate/blocks";
import { formatPercent } from "@/lib/operate/equity";
import {
  formatDollars,
  letterTerm,
  stepIndex,
  type ClientTerm,
  type EquityOption,
  type LetterDeal,
  type LetterPackage,
  type LetterTerm,
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
.operate-letter__block--greeting + .operate-letter__block--equity,
.operate-letter__block--greeting + .operate-letter__block--term {
  margin-top: 24px;
}
.operate-letter__block--equity + .operate-letter__block--term {
  margin-top: 20px;
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
.operate-letter__term {
  margin: 0;
  font-size: 18px;
  line-height: 1.4;
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
.operate-letter__packages {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.operate-letter__row {
  display: block;
  width: 100%;
  margin: 0;
  padding: 20px 10px;
  border: 0;
  border-bottom: 1px solid rgba(7, 15, 24, 0.14);
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  outline: none;
  box-sizing: border-box;
  appearance: none;
}
button.operate-letter__row {
  cursor: pointer;
}
.operate-letter__row--selected,
button.operate-letter__row:focus-visible {
  outline: 2px solid #070F18;
  outline-offset: 3px;
}
.operate-letter__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  column-gap: 32px;
  row-gap: 8px;
  align-items: end;
  width: 100%;
}
.operate-letter__grid--equity {
  grid-template-columns: minmax(0, 1fr) auto auto auto;
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
  margin: 28px 0 0;
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
  .operate-letter__grid,
  .operate-letter__grid--equity {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
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

export function equitySentence(option: EquityOption | undefined, months: number): string | null {
  if (!option || option.equityPerHourCents <= 0) return null;
  const ownership = option.ownershipPercent === null ? "" : `, for ${formatPercent(option.ownershipPercent)} of the company`;
  return `${formatDollars(option.equityPerHourCents)}/hour (${formatDollars(option.equityPerWeekCents)}/week) goes toward equity: ${formatDollars(option.equityTotalCents)} over ${months} months${ownership}.`;
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

function PackageRow({
  pkg,
  option,
  withEquity,
  mode,
  selected,
  onSelect,
  rate,
}: {
  pkg: LetterPackage;
  option: EquityOption;
  withEquity: boolean;
  mode: "customer" | "preview";
  selected: boolean;
  onSelect?: (packageId: string) => void;
  rate?: ReactNode;
}) {
  const className = selected
    ? "operate-letter__row operate-letter__row--selected"
    : "operate-letter__row";
  const body = (
    <span className={withEquity ? "operate-letter__grid operate-letter__grid--equity" : "operate-letter__grid"}>
      <span className="operate-letter__offer">
        <span className="operate-letter__service">{pkg.serviceName}</span>
        <span className="operate-letter__hours">{pkg.hoursPerWeek} / week</span>
      </span>
      <span className="operate-letter__figure">
        <span className="operate-letter__figure-label">Rate</span>
        {rate ?? <Figures equityEnabled={withEquity} listCents={pkg.listRateCents} cashCents={option.cashRateCents} />}
      </span>
      <span className="operate-letter__figure">
        <span className="operate-letter__figure-label">Weekly</span>
        <Figures equityEnabled={withEquity} listCents={pkg.weeklyListCents} cashCents={option.weeklyCashCents} />
      </span>
      {withEquity ? (
        <span className="operate-letter__figure">
          <span className="operate-letter__figure-label">Equity</span>
          <span className="operate-letter__primary">
            {option.equityTotalCents > 0 ? formatDollars(option.equityTotalCents) : "—"}
          </span>
          {option.ownershipPercent !== null ? (
            <span className="operate-letter__percent">{formatPercent(option.ownershipPercent)}</span>
          ) : null}
        </span>
      ) : null}
    </span>
  );

  if (mode === "customer") {
    return (
      <button type="button" className={className} aria-pressed={selected} onClick={() => onSelect?.(pkg.id)}>
        {body}
      </button>
    );
  }

  return <div className={className}>{body}</div>;
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

export function TermView({
  deal,
  term,
  onTerm,
}: {
  deal: LetterDeal;
  term: ClientTerm;
  onTerm: (term: ClientTerm) => void;
}) {
  if (deal.terms.length > 1) {
    return (
      <LetterToggle
        label="Term"
        options={deal.terms.map((item) => ({ value: item.term, label: item.label }))}
        value={term}
        onChange={onTerm}
      />
    );
  }
  return <p className="operate-letter__term">{deal.terms[0]?.label}</p>;
}

type Payment = "cash" | "equity";

const PAYMENT_OPTIONS: { value: Payment; label: string }[] = [
  { value: "cash", label: "All cash" },
  { value: "equity", label: "Cash and equity" },
];

// The first decision: pay all cash, or move part of each hour into equity.
export function EquityView({
  term,
  step,
  onStep,
}: {
  term: LetterTerm | undefined;
  step: number;
  onStep: (stepCents: number) => void;
}) {
  const steps = term?.steps.filter((value) => value > 0) ?? [];
  if (steps.length === 0) return null;
  const current = term ? term.steps[stepIndex(term.steps, step)]! : 0;
  return (
    <div className="operate-letter__choice">
      <LetterToggle
        label="Payment"
        options={PAYMENT_OPTIONS}
        value={current > 0 ? "equity" : "cash"}
        onChange={(payment) => onStep(payment === "cash" ? 0 : (steps[0] ?? 0))}
      />
      {current > 0 ? (
        <div className="operate-letter__steps" role="radiogroup" aria-label="Per hour into equity">
          <span className="operate-letter__figure-label">Per hour into equity</span>
          {steps.map((value) => (
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

function chosenTerm(deal: LetterDeal): ClientTerm | undefined {
  return deal.selectedTerm ?? deal.terms[0]?.term;
}

export function OffersView({
  deal,
  term,
  step,
  mode,
  onSelect,
  renderRate,
}: {
  deal: LetterDeal;
  term: ClientTerm;
  step: number;
  mode: "customer" | "preview";
  onSelect?: (packageId: string) => void;
  renderRate?: (pkg: LetterPackage, option: EquityOption, index: number) => ReactNode;
}) {
  const current = letterTerm(deal, term);
  const packages = current?.packages ?? [];
  const index = current ? stepIndex(current.steps, step) : 0;
  const withEquity = (current?.steps[index] ?? 0) > 0;
  const chosenHere =
    current !== undefined &&
    chosenTerm(deal) === current.term &&
    stepIndex(current.steps, deal.selectedEquityCents) === index;
  const quoted = (chosenHere ? packages.find((pkg) => pkg.id === deal.selectedPackageId) : undefined) ?? packages[0];
  const sentence = withEquity && current ? equitySentence(quoted?.options[index], current.months) : null;
  return (
    <>
      <div className="operate-letter__packages">
        {packages.map((pkg, i) => (
          <PackageRow
            key={pkg.id}
            pkg={pkg}
            option={pkg.options[index]!}
            withEquity={withEquity}
            mode={mode}
            selected={chosenHere && pkg.id === deal.selectedPackageId}
            onSelect={onSelect}
            rate={renderRate?.(pkg, pkg.options[index]!, i)}
          />
        ))}
      </div>
      {sentence ? <p className="operate-letter__equity">{sentence}</p> : null}
    </>
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

export function DealLetter({
  deal,
  mode,
  onSelect,
}: {
  deal: LetterDeal;
  mode: "customer" | "preview";
  onSelect?: (packageId: string, term: ClientTerm, equityCents: number) => void;
}) {
  const [term, setTerm] = useState<ClientTerm>(() => letterTerm(deal, deal.selectedTerm)?.term ?? "six-month");
  const [step, setStep] = useState(deal.selectedEquityCents);
  const current = letterTerm(deal, term);
  const stepCents = current ? (current.steps[stepIndex(current.steps, step)] ?? 0) : 0;
  return (
    <LetterFrame companyName={deal.companyName} companyLogoUrl={deal.companyLogoUrl}>
      {deal.blocks.map((block) => (
        <section key={block.id} className={blockClassName(block)}>
          {block.type === "greeting" ? <GreetingView text={block.text} companyName={deal.companyName} /> : null}
          {block.type === "equity" ? <EquityView term={current} step={step} onStep={setStep} /> : null}
          {block.type === "term" ? <TermView deal={deal} term={term} onTerm={setTerm} /> : null}
          {block.type === "offers" ? (
            <OffersView
              deal={deal}
              term={term}
              step={step}
              mode={mode}
              onSelect={(packageId) => onSelect?.(packageId, term, stepCents)}
            />
          ) : null}
          {block.type === "divider" ? <hr className="operate-letter__divider" /> : null}
        </section>
      ))}
    </LetterFrame>
  );
}
