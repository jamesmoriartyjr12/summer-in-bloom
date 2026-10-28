"use client";

import { formatDollars, type LetterDeal, type LetterPackage } from "@/lib/operate/pricing";

const letterStyles = `
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
  height: 64px;
  padding: 0 24px;
  background: #FAF6EC;
  border-bottom: 1px solid rgba(7, 15, 24, 0.12);
}
.operate-letter__brand {
  display: block;
  height: 22px;
  width: auto;
}
.operate-letter__logo {
  display: block;
  height: 32px;
  width: auto;
  max-width: 140px;
  object-fit: contain;
}
.operate-letter__identity {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.operate-letter__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center 18%;
  flex: none;
}
.operate-letter__avatar--initials {
  display: grid;
  place-items: center;
  background: #070F18;
  color: #FAF6EC;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.operate-letter__recipient {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
  white-space: nowrap;
}
.operate-letter__wordmark {
  position: absolute;
  z-index: 0;
  top: 10%;
  left: 50%;
  width: min(1100px, 88vw);
  height: auto;
  transform: translateX(-50%);
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
  margin: 18px 0 0;
  font-size: 18px;
  line-height: 1.4;
}
.operate-letter__packages {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 56px;
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
  grid-template-columns: minmax(0, 1.4fr) auto auto auto;
  column-gap: 32px;
  row-gap: 8px;
  align-items: end;
  width: 100%;
}
.operate-letter__service {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.3;
}
.operate-letter__hours {
  font-size: 16px;
  line-height: 1.4;
  white-space: nowrap;
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
  .operate-letter__service,
  .operate-letter__hours {
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

function equitySentence(equityEnabled: boolean, pkg: LetterPackage | undefined): string | null {
  if (!equityEnabled || !pkg) return null;
  if (pkg.equityPerHourCents > 0) {
    return `The ${formatDollars(pkg.equityPerHourCents)}/hour discount (${formatDollars(pkg.equityPerWeekCents)}/week) is applied as in-kind consideration toward an equity position.`;
  }
  if (pkg.equityPerHourCents === 0) return "Equity is part of this arrangement.";
  return null;
}

function Figures({
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
}: {
  pkg: LetterPackage;
  mode: "customer" | "preview";
  equityEnabled: boolean;
  selected: boolean;
  onSelect?: (packageId: string) => void;
}) {
  const className = selected
    ? "operate-letter__row operate-letter__row--selected"
    : "operate-letter__row";
  const body = (
    <span className="operate-letter__grid">
      <span className="operate-letter__service">{pkg.serviceName}</span>
      <span className="operate-letter__hours">{pkg.hoursPerWeek} / week</span>
      <span className="operate-letter__figure">
        <span className="operate-letter__figure-label">Rate</span>
        <Figures
          equityEnabled={equityEnabled}
          listCents={pkg.listRateCents}
          cashCents={pkg.cashRateCents}
        />
      </span>
      <span className="operate-letter__figure">
        <span className="operate-letter__figure-label">Weekly</span>
        <Figures
          equityEnabled={equityEnabled}
          listCents={pkg.weeklyListCents}
          cashCents={pkg.weeklyCashCents}
        />
      </span>
    </span>
  );

  if (mode === "customer") {
    return (
      <button
        type="button"
        className={className}
        aria-pressed={selected}
        onClick={() => onSelect?.(pkg.id)}
      >
        {body}
      </button>
    );
  }

  return <div className={className}>{body}</div>;
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
  const quoted =
    deal.packages.find((pkg) => pkg.id === deal.selectedPackageId) ?? deal.packages[0];
  const sentence = equitySentence(deal.equityEnabled, quoted);

  const recipient = deal.contactName.trim();
  const initials = recipient
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <article className="operate-letter">
      <style>{letterStyles}</style>
      <header className="operate-letter__header">
        {deal.companyLogoUrl ? (
          <img className="operate-letter__logo" src={deal.companyLogoUrl} alt={deal.companyName} />
        ) : (
          <img className="operate-letter__brand" src="/bloom-mark.svg" alt="Bloom" />
        )}
        {recipient ? (
          <div className="operate-letter__identity">
            {deal.avatarUrl ? (
              <img className="operate-letter__avatar" src={deal.avatarUrl} alt="" />
            ) : (
              <span className="operate-letter__avatar operate-letter__avatar--initials" aria-hidden>
                {initials}
              </span>
            )}
            <p className="operate-letter__recipient">{recipient}</p>
          </div>
        ) : null}
      </header>
      <img
        className="operate-letter__wordmark"
        src="/bloom-wordmark.svg"
        alt=""
        aria-hidden
        draggable={false}
      />
      <div className="operate-letter__sheet">
        <h1 className="operate-letter__greeting">
          Hello <span className="operate-letter__company">{deal.companyName}</span>, so nice to see you again.
        </h1>
        <p className="operate-letter__term">{deal.termLabel}</p>
        <div className="operate-letter__packages">
          {deal.packages.map((pkg) => (
            <PackageRow
              key={pkg.id}
              pkg={pkg}
              mode={mode}
              equityEnabled={deal.equityEnabled}
              selected={pkg.id === deal.selectedPackageId}
              onSelect={onSelect}
            />
          ))}
        </div>
        {sentence ? <p className="operate-letter__equity">{sentence}</p> : null}
        <footer className="operate-letter__footer">
          <img className="operate-letter__mark" src="/bloom-mark.svg" alt="Bloom" />
          <p className="operate-letter__address">james@bloomventures.com</p>
        </footer>
      </div>
    </article>
  );
}
