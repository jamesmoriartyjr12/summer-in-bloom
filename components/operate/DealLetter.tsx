"use client";

import type { ReactNode } from "react";
import { greetingParts, type LetterBlock } from "@/lib/operate/blocks";
import { formatDollars, type LetterDeal, type LetterPackage } from "@/lib/operate/pricing";

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
.operate-letter__brand {
  display: block;
  width: 60px;
  height: 60px;
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
.operate-letter__block--greeting + .operate-letter__block--term {
  margin-top: 18px;
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
  .operate-letter__grid {
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

export function equitySentence(equityEnabled: boolean, pkg: LetterPackage | undefined): string | null {
  if (!equityEnabled || !pkg) return null;
  if (pkg.equityPerHourCents > 0) {
    return `The ${formatDollars(pkg.equityPerHourCents)}/hour discount (${formatDollars(pkg.equityPerWeekCents)}/week) is applied as in-kind consideration toward an equity position.`;
  }
  if (pkg.equityPerHourCents === 0) return "Equity is part of this arrangement.";
  return null;
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
  if (!equityEnabled) {
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
  mode,
  equityEnabled,
  selected,
  onSelect,
  rate,
}: {
  pkg: LetterPackage;
  mode: "customer" | "preview";
  equityEnabled: boolean;
  selected: boolean;
  onSelect?: (packageId: string) => void;
  rate?: ReactNode;
}) {
  const className = selected
    ? "operate-letter__row operate-letter__row--selected"
    : "operate-letter__row";
  const body = (
    <span className="operate-letter__grid">
      <span className="operate-letter__offer">
        <span className="operate-letter__service">{pkg.serviceName}</span>
        <span className="operate-letter__hours">{pkg.hoursPerWeek} / week</span>
      </span>
      <span className="operate-letter__figure">
        <span className="operate-letter__figure-label">Rate</span>
        {rate ?? (
          <Figures equityEnabled={equityEnabled} listCents={pkg.listRateCents} cashCents={pkg.cashRateCents} />
        )}
      </span>
      <span className="operate-letter__figure">
        <span className="operate-letter__figure-label">Weekly</span>
        <Figures equityEnabled={equityEnabled} listCents={pkg.weeklyListCents} cashCents={pkg.weeklyCashCents} />
      </span>
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

export function OffersView({
  deal,
  mode,
  onSelect,
  renderRate,
}: {
  deal: LetterDeal;
  mode: "customer" | "preview";
  onSelect?: (packageId: string) => void;
  renderRate?: (pkg: LetterPackage, index: number) => ReactNode;
}) {
  const quoted = deal.packages.find((pkg) => pkg.id === deal.selectedPackageId) ?? deal.packages[0];
  const sentence = equitySentence(deal.equityEnabled, quoted);
  return (
    <>
      <div className="operate-letter__packages">
        {deal.packages.map((pkg, index) => (
          <PackageRow
            key={pkg.id}
            pkg={pkg}
            mode={mode}
            equityEnabled={deal.equityEnabled}
            selected={pkg.id === deal.selectedPackageId}
            onSelect={onSelect}
            rate={renderRate?.(pkg, index)}
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
      <header className="operate-letter__header">
        {companyLogoUrl ? (
          <img className="operate-letter__logo" src={companyLogoUrl} alt={companyName} />
        ) : (
          <img className="operate-letter__brand" src="/bloom-mark.svg" alt="Bloom" />
        )}
      </header>
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
  onSelect?: (packageId: string) => void;
}) {
  return (
    <LetterFrame companyName={deal.companyName} companyLogoUrl={deal.companyLogoUrl}>
      {deal.blocks.map((block) => (
        <section key={block.id} className={blockClassName(block)}>
          {block.type === "greeting" ? <GreetingView text={block.text} companyName={deal.companyName} /> : null}
          {block.type === "term" ? <p className="operate-letter__term">{deal.termLabel}</p> : null}
          {block.type === "offers" ? <OffersView deal={deal} mode={mode} onSelect={onSelect} /> : null}
          {block.type === "divider" ? <hr className="operate-letter__divider" /> : null}
        </section>
      ))}
    </LetterFrame>
  );
}
