"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { ChevronUp } from "lucide-react";
import { sowPage } from "@/content/operate-contracts";
import { formatPercent } from "@/lib/operate/equity";
import { formatDollars, letterTerm, stepIndex, type LetterDeal } from "@/lib/operate/pricing";
import { termDates } from "./DealLetter";

// The receipt sits beside the 840px letter only when the margin can hold it; narrower, it folds into a bar.
const BESIDE_LETTER = "(min-width: 1448px)";

const receiptStyles = `
.operate-receipt {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 20;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 288px;
  max-height: calc(100vh - 48px);
  background: #FAF6EC;
  border: 1px solid #070F18;
  border-radius: 6px;
  box-shadow: 0 16px 40px rgba(7, 15, 24, 0.14);
  color: #070F18;
  font-family: var(--font-archivo), sans-serif;
}
.operate-receipt__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 14px 18px;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
}
button.operate-receipt__head {
  cursor: pointer;
}
.operate-receipt[data-open="false"] {
  width: auto;
}
.operate-receipt[data-open="false"] .operate-receipt__head {
  white-space: nowrap;
}
button.operate-receipt__head:focus-visible {
  outline: 2px solid #070F18;
  outline-offset: -4px;
  border-radius: 6px;
}
.operate-receipt__head-total {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}
.operate-receipt__chevron {
  width: 16px;
  height: 16px;
}
.operate-receipt[data-open="true"] .operate-receipt__chevron {
  transform: rotate(180deg);
}
.operate-receipt__body {
  overflow-y: auto;
  padding: 0 18px 18px;
}
.operate-receipt__term {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: 12px;
  border-bottom: 1px dashed rgba(7, 15, 24, 0.3);
}
.operate-receipt__term-label {
  font-size: 20px;
  font-weight: 500;
  line-height: 1.3;
}
.operate-receipt__ledger {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 0;
  border-bottom: 1px dashed rgba(7, 15, 24, 0.3);
}
.operate-receipt__row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 13px;
  line-height: 1.4;
}
.operate-receipt__row-label {
  color: rgba(7, 15, 24, 0.7);
}
.operate-receipt__leader {
  flex: 1;
  min-width: 12px;
  border-bottom: 1px dotted rgba(7, 15, 24, 0.35);
}
.operate-receipt__value {
  display: flex;
  gap: 6px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.operate-receipt__value s {
  color: rgba(7, 15, 24, 0.45);
}
.operate-receipt__service {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.operate-receipt__service-name {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
}
.operate-receipt__row--total {
  font-size: 15px;
  font-weight: 500;
}
.operate-receipt__row--total .operate-receipt__row-label {
  color: #070F18;
}
.operate-receipt__docs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding-top: 14px;
}
.operate-receipt__doc {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
}
.operate-receipt__page {
  display: block;
  box-sizing: border-box;
  width: 100%;
  aspect-ratio: 612 / 791;
  border: 1px solid rgba(7, 15, 24, 0.15);
  border-radius: 2px;
  background: #FAF6EC;
  object-fit: cover;
}
.operate-receipt__page--drawn {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 10px 8px;
  overflow: hidden;
}
.operate-receipt__page-title {
  font-size: 7px;
  font-weight: 500;
  line-height: 1.2;
}
.operate-receipt__page-sub {
  margin-bottom: 4px;
  font-size: 5px;
  line-height: 1.2;
  color: rgba(7, 15, 24, 0.6);
}
.operate-receipt__page-rule {
  height: 1px;
  margin-bottom: 4px;
  background: rgba(7, 15, 24, 0.2);
}
.operate-receipt__page-line {
  height: 2px;
  border-radius: 1px;
  background: rgba(7, 15, 24, 0.14);
}
.operate-receipt__page-gap {
  height: 4px;
}
.operate-receipt__page-mark {
  position: absolute;
  left: 8px;
  bottom: 8px;
  width: 6px;
  height: 6px;
  background: #FA4C1F;
}
.operate-receipt__note {
  margin: 12px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: rgba(7, 15, 24, 0.6);
}
@media (max-width: 640px) {
  .operate-receipt,
  .operate-receipt[data-open="false"] {
    left: 12px;
    right: 12px;
    bottom: 12px;
    width: auto;
    max-height: calc(100vh - 24px);
  }
}
`;

function subscribeBeside(onChange: () => void) {
  const query = window.matchMedia(BESIDE_LETTER);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useBesideLetter(): boolean {
  return useSyncExternalStore(
    subscribeBeside,
    () => window.matchMedia(BESIDE_LETTER).matches,
    () => false,
  );
}

function Row({ label, children, total = false }: { label: ReactNode; children: ReactNode; total?: boolean }) {
  return (
    <div className={total ? "operate-receipt__row operate-receipt__row--total" : "operate-receipt__row"}>
      <span className="operate-receipt__row-label">{label}</span>
      <span className="operate-receipt__leader" aria-hidden="true" />
      <span className="operate-receipt__value">{children}</span>
    </div>
  );
}

function Amount({ listCents, cashCents }: { listCents: number; cashCents: number }) {
  return (
    <>
      {cashCents < listCents ? <s>{formatDollars(listCents)}</s> : null}
      <span>{formatDollars(cashCents)}</span>
    </>
  );
}

const PAGE_LINES = [92, 100, 96, 70, 0, 100, 88, 94, 60, 0, 98, 90, 76];

function DrawnPage({ title, companyName }: { title: string; companyName: string }) {
  return (
    <span className="operate-receipt__page operate-receipt__page--drawn" aria-hidden="true">
      <span className="operate-receipt__page-title">{title}</span>
      <span className="operate-receipt__page-sub">{companyName ? `${companyName} & Bloom` : "Bloom"}</span>
      <span className="operate-receipt__page-rule" />
      {PAGE_LINES.map((width, index) =>
        width === 0 ? (
          <span key={index} className="operate-receipt__page-gap" />
        ) : (
          <span key={index} className="operate-receipt__page-line" style={{ width: `${width}%` }} />
        ),
      )}
      <span className="operate-receipt__page-mark" />
    </span>
  );
}

// A checkout review of the term the client picked: the ledger, then the SOW and MSA drawn up from it.
export function Receipt({ deal }: { deal: LetterDeal }) {
  const beside = useBesideLetter();
  const [opened, setOpened] = useState(false);
  const term = letterTerm(deal, deal.selectedTerm);
  if (!term) return null;

  const index = stepIndex(deal.steps, deal.selectedEquityCents);
  const withEquity = (deal.steps[index] ?? 0) > 0;
  const bundle = term.options[index];
  const open = beside || opened;
  const sow = sowPage(deal.companyName, term.term);
  const total = bundle ? formatDollars(bundle.totalCashCents) : null;

  const headContent = (
    <>
      <span className="operate-letter__mono">Your selection</span>
      <span className="operate-receipt__head-total">
        {open ? null : (
          <span>
            {term.label}
            {total ? ` · ${total}` : null}
          </span>
        )}
        {beside ? null : <ChevronUp className="operate-receipt__chevron" aria-hidden="true" />}
      </span>
    </>
  );

  return (
    <aside className="operate-receipt" data-open={open} aria-label="Your selection">
      <style>{receiptStyles}</style>
      {beside ? (
        <div className="operate-receipt__head">{headContent}</div>
      ) : (
        <button
          type="button"
          className="operate-receipt__head"
          aria-expanded={open}
          onClick={() => setOpened((value) => !value)}
        >
          {headContent}
        </button>
      )}
      {open ? (
        <div className="operate-receipt__body">
          <div className="operate-receipt__term">
            <span className="operate-receipt__term-label">{term.label}</span>
            <span className="operate-letter__mono">{termDates(term)}</span>
          </div>
          <div className="operate-receipt__ledger">
            {term.lines.map((line) => {
              const option = line.options[index]!;
              return (
                <div key={line.id} className="operate-receipt__service">
                  <span className="operate-receipt__service-name">{line.serviceName}</span>
                  <Row label={`${line.hoursPerWeek} hrs × ${formatDollars(option.cashRateCents)}`}>
                    <Amount listCents={line.weeklyListCents} cashCents={option.weeklyCashCents} />
                    <span className="operate-receipt__row-label">/ wk</span>
                  </Row>
                </div>
              );
            })}
          </div>
          {bundle ? (
            <div className="operate-receipt__ledger">
              {term.lines.length > 1 ? (
                <Row label="Weekly billables">
                  <Amount listCents={bundle.weeklyListCents} cashCents={bundle.weeklyCashCents} />
                </Row>
              ) : null}
              <Row label="Weeks">{term.weeks}</Row>
              {withEquity && bundle.equityTotalCents > 0 ? (
                <Row label="Total investment">
                  <span>{formatDollars(bundle.equityTotalCents)}</span>
                  {bundle.ownershipPercent !== null ? (
                    <span className="operate-receipt__row-label">{formatPercent(bundle.ownershipPercent)}</span>
                  ) : null}
                </Row>
              ) : null}
              <Row label="Total billable" total>
                <Amount listCents={bundle.totalListCents} cashCents={bundle.totalCashCents} />
              </Row>
            </div>
          ) : null}
          <div className="operate-receipt__docs">
            <figure className="operate-receipt__doc">
              {sow ? (
                <img className="operate-receipt__page" src={sow} alt={`${term.label} SOW, first page`} />
              ) : (
                <DrawnPage title="Statement of Work" companyName={deal.companyName} />
              )}
              <figcaption className="operate-letter__mono">SOW</figcaption>
            </figure>
            <figure className="operate-receipt__doc">
              <DrawnPage title="Master Services Agreement" companyName={deal.companyName} />
              <figcaption className="operate-letter__mono">MSA</figcaption>
            </figure>
          </div>
          <p className="operate-receipt__note">Your SOW and MSA are drawn up from this selection.</p>
        </div>
      ) : null}
    </aside>
  );
}
