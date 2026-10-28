"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition, type FormEvent } from "react";
import { DealLetter } from "@/components/operate/DealLetter";
import {
  termLabel,
  toLetterPackage,
  type LetterDeal,
  type TermLength,
} from "@/lib/operate/pricing";
import { lookupLinkedInAction, saveDealAction } from "../actions";

export type EditorDeal = {
  id: string;
  token: string;
  companyName: string;
  contactName: string;
  contactRole: string;
  linkedinUrl: string;
  avatarUrl: string | null;
  equityEnabled: boolean;
  termLength: TermLength;
  round: string;
  valuationDollars: string;
  hourlyCostCents: number | null;
  selectedPackageId: string | null;
  packages: {
    id: string;
    serviceName: string;
    hoursPerWeek: number;
    enabled: boolean;
    listRateCents: number;
    cashRateCents: number;
  }[];
};

type PackageFields = {
  id: string;
  enabled: boolean;
  serviceName: string;
  hours: string;
  listRate: string;
  cashRate: string;
};

type Fields = {
  companyName: string;
  contactName: string;
  contactRole: string;
  linkedinUrl: string;
  avatarUrl: string | null;
  equityEnabled: boolean;
  termLength: TermLength;
  round: string;
  valuationDollars: string;
  hourlyCostDollars: string;
  packages: [PackageFields, PackageFields];
};

const TERMS: TermLength[] = ["six-month", "one-year", "multi-year"];

function centsToDollars(cents: number): string {
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
}

function dollarsToCents(raw: string): number {
  const cents = Math.round(Number(raw.replace(/[$,\s]/g, "")) * 100);
  return Number.isFinite(cents) ? cents : 0;
}

function packageFields(pkg: EditorDeal["packages"][number] | undefined, hours: number): PackageFields {
  if (!pkg) {
    return { id: "", enabled: true, serviceName: "", hours: String(hours), listRate: "", cashRate: "" };
  }
  return {
    id: pkg.id,
    enabled: pkg.enabled,
    serviceName: pkg.serviceName,
    hours: String(pkg.hoursPerWeek),
    listRate: centsToDollars(pkg.listRateCents),
    cashRate: centsToDollars(pkg.cashRateCents),
  };
}

function initialFields(deal: EditorDeal): Fields {
  return {
    companyName: deal.companyName,
    contactName: deal.contactName,
    contactRole: deal.contactRole,
    linkedinUrl: deal.linkedinUrl,
    avatarUrl: deal.avatarUrl,
    equityEnabled: deal.equityEnabled,
    termLength: deal.termLength,
    round: deal.round,
    valuationDollars: deal.valuationDollars,
    hourlyCostDollars: deal.hourlyCostCents === null ? "" : centsToDollars(deal.hourlyCostCents),
    packages: [packageFields(deal.packages[0], 40), packageFields(deal.packages[1], 80)],
  };
}

function isDroppedRow(row: PackageFields, index: number): boolean {
  return (
    index > 0 &&
    row.serviceName.trim() === "" &&
    row.listRate.trim() === "" &&
    row.cashRate.trim() === ""
  );
}

function previewLetter(fields: Fields, selectedPackageId: string | null): LetterDeal {
  const rows = fields.packages
    .map((row, index) => ({ row, index }))
    .filter(({ row, index }) => row.enabled && !isDroppedRow(row, index));
  const hours = (raw: string) => {
    const value = Number(raw);
    return Number.isInteger(value) && value > 0 ? value : 0;
  };
  return {
    companyName: fields.companyName,
    contactName: fields.contactName,
    avatarUrl: fields.avatarUrl,
    termLabel: termLabel(fields.termLength),
    equityEnabled: fields.equityEnabled,
    packages: rows.map(({ row, index }) =>
      toLetterPackage({
        id: row.id || `new-${index}`,
        serviceName: row.serviceName,
        hoursPerWeek: hours(row.hours),
        listRateCents: dollarsToCents(row.listRate),
        cashRateCents: dollarsToCents(row.cashRate),
      }),
    ),
    selectedPackageId: rows.some(({ row }) => row.id !== "" && row.id === selectedPackageId)
      ? selectedPackageId
      : null,
  };
}

const css = `
.operate-editor { display: grid; grid-template-columns: minmax(320px, 440px) minmax(0, 1fr); align-items: start; }
.operate-editor__form { padding: 32px 24px 64px; }
.operate-editor__preview { position: sticky; top: 0; height: 100vh; overflow: auto; border-left: 1px solid rgba(7, 15, 24, 0.14); }
.operate-editor__preview-bar { display: flex; justify-content: space-between; gap: 16px; align-items: baseline; padding: 16px 24px; border-bottom: 1px solid rgba(7, 15, 24, 0.14); font-size: 14px; }
.operate-editor__preview-bar a { color: inherit; }
.operate-editor h1 { margin: 12px 0 24px; font-size: 28px; font-weight: 500; }
.operate-editor fieldset { margin: 0 0 24px; padding: 0; border: 0; min-width: 0; }
.operate-editor legend { padding: 0; margin-bottom: 8px; font-weight: 600; }
.operate-editor label { display: block; margin-bottom: 12px; font-size: 14px; }
.operate-editor label > span { display: block; margin-bottom: 4px; }
.operate-editor .operate-editor__note { display: block; margin-top: 2px; font-size: 12px; opacity: 0.6; }
.operate-editor input[type="text"], .operate-editor input[type="number"], .operate-editor select {
  box-sizing: border-box; width: 100%; padding: 8px 10px; font: inherit; color: inherit;
  background: transparent; border: 1px solid rgba(7, 15, 24, 0.3);
}
.operate-editor .operate-editor__check { display: flex; gap: 8px; align-items: center; }
.operate-editor .operate-editor__check > span { margin: 0; }
.operate-editor .operate-editor__pair { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.operate-editor .operate-editor__staff { padding: 12px; border: 1px dashed rgba(7, 15, 24, 0.4); }
.operate-editor button { font: inherit; padding: 8px 16px; cursor: pointer; color: #FAF6EC; background: #070F18; border: 0; }
.operate-editor button[disabled] { opacity: 0.5; cursor: default; }
.operate-editor .operate-editor__link { display: flex; gap: 8px; align-items: center; }
.operate-editor .operate-editor__link input { flex: 1; }
@media (max-width: 900px) {
  .operate-editor { grid-template-columns: minmax(0, 1fr); }
  .operate-editor__preview { position: static; height: auto; border-left: 0; border-top: 1px solid rgba(7, 15, 24, 0.14); }
}
`;

function PackageRow({
  index,
  row,
  onChange,
}: {
  index: number;
  row: PackageFields;
  onChange: (next: PackageFields) => void;
}) {
  const key = `package${index}`;
  return (
    <fieldset>
      <legend>{index === 0 ? "Package 1" : "Package 2 (leave empty to drop)"}</legend>
      <input type="hidden" name={`${key}Id`} value={row.id} />
      <label className="operate-editor__check">
        <input
          type="checkbox"
          name={`${key}Enabled`}
          checked={row.enabled}
          onChange={(event) => onChange({ ...row, enabled: event.target.checked })}
        />
        <span>Shown in the letter</span>
      </label>
      <label>
        <span>Service name</span>
        <input
          type="text"
          name={`${key}ServiceName`}
          value={row.serviceName}
          onChange={(event) => onChange({ ...row, serviceName: event.target.value })}
        />
      </label>
      <div className="operate-editor__pair">
        <label>
          <span>Hours / week</span>
          <input
            type="number"
            min={1}
            step={1}
            name={`${key}Hours`}
            value={row.hours}
            onChange={(event) => onChange({ ...row, hours: event.target.value })}
          />
        </label>
        <label>
          <span>List rate ($/hr)</span>
          <input
            type="text"
            inputMode="decimal"
            name={`${key}ListRate`}
            value={row.listRate}
            onChange={(event) => onChange({ ...row, listRate: event.target.value })}
          />
        </label>
        <label>
          <span>Cash rate ($/hr)</span>
          <input
            type="text"
            inputMode="decimal"
            name={`${key}CashRate`}
            value={row.cashRate}
            onChange={(event) => onChange({ ...row, cashRate: event.target.value })}
          />
        </label>
      </div>
    </fieldset>
  );
}

export function Editor({ deal }: { deal: EditorDeal }) {
  const [fields, setFields] = useState<Fields>(() => initialFields(deal));
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const letter = useMemo(
    () => previewLetter(fields, deal.selectedPackageId),
    [fields, deal.selectedPackageId],
  );
  const link = `${origin}/operate/d/${deal.token}`;

  function patch(next: Partial<Fields>) {
    setFields((current) => ({ ...current, ...next }));
    setMessage(null);
  }

  function patchPackage(index: 0 | 1, next: PackageFields) {
    const rows: [PackageFields, PackageFields] = [fields.packages[0], fields.packages[1]];
    rows[index] = next;
    patch({ packages: rows });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      try {
        const result = await saveDealAction(deal.id, formData);
        setMessage(result.ok ? { ok: true, text: "Saved." } : { ok: false, text: result.error });
      } catch {
        setMessage({ ok: false, text: "Could not save. Sign in again and retry." });
      }
    });
  }

  async function onLinkedInBlur() {
    const raw = fields.linkedinUrl.trim();
    if (!raw) {
      patch({ avatarUrl: null });
      return;
    }
    const result = await lookupLinkedInAction(raw);
    if (!result.ok) {
      setMessage({ ok: false, text: result.error });
      return;
    }
    patch({
      contactName: result.name,
      avatarUrl: result.avatarUrl,
      ...(fields.contactRole.trim() === "" && result.headline ? { contactRole: result.headline } : {}),
    });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="operate-editor">
      <style>{css}</style>
      <form className="operate-editor__form" onSubmit={onSubmit}>
        <Link href="/operate" style={{ color: "inherit", fontSize: 14 }}>
          All deals
        </Link>
        <h1>{fields.companyName || "Deal"}</h1>

        <fieldset>
          <legend>Private link</legend>
          <div className="operate-editor__link">
            <input type="text" readOnly value={origin ? link : ""} aria-label="Private link" />
            <button type="button" onClick={copyLink} disabled={!origin}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 14 }}>
            <a href={`/operate/d/${deal.token}`} target="_blank" rel="noreferrer" style={{ color: "inherit" }}>
              Open the client page
            </a>
          </p>
        </fieldset>

        <fieldset>
          <legend>Letter</legend>
          <label>
            <span>Company name</span>
            <input
              type="text"
              name="companyName"
              required
              value={fields.companyName}
              onChange={(event) => patch({ companyName: event.target.value })}
            />
          </label>
          <label>
            <span>LinkedIn</span>
            <input
              type="url"
              name="linkedinUrl"
              placeholder="https://www.linkedin.com/in/…"
              value={fields.linkedinUrl}
              onChange={(event) => patch({ linkedinUrl: event.target.value })}
              onBlur={() => void onLinkedInBlur()}
            />
            <small className="operate-editor__note">The name and photo come from this page.</small>
          </label>
          <label>
            <span>Contact name</span>
            <input
              type="text"
              name="contactName"
              value={fields.contactName}
              onChange={(event) => patch({ contactName: event.target.value })}
            />
          </label>
          <label>
            <span>Contact role</span>
            <input
              type="text"
              name="contactRole"
              value={fields.contactRole}
              onChange={(event) => patch({ contactRole: event.target.value })}
            />
          </label>
          <label>
            <span>Term</span>
            <select
              name="termLength"
              value={fields.termLength}
              onChange={(event) => patch({ termLength: event.target.value as TermLength })}
            >
              {TERMS.map((term) => (
                <option key={term} value={term}>
                  {termLabel(term)}
                </option>
              ))}
            </select>
          </label>
          <label className="operate-editor__check">
            <input
              type="checkbox"
              name="equityEnabled"
              checked={fields.equityEnabled}
              onChange={(event) => patch({ equityEnabled: event.target.checked })}
            />
            <span>Equity arrangement</span>
          </label>
        </fieldset>

        <PackageRow index={0} row={fields.packages[0]} onChange={(next) => patchPackage(0, next)} />
        <PackageRow index={1} row={fields.packages[1]} onChange={(next) => patchPackage(1, next)} />

        <fieldset className="operate-editor__staff">
          <legend>Staff only</legend>
          <label>
            <span>Round</span>
            <input
              type="text"
              name="round"
              value={fields.round}
              onChange={(event) => patch({ round: event.target.value })}
            />
            <small className="operate-editor__note">Not shown to the customer.</small>
          </label>
          <label>
            <span>Valuation ($, whole dollars)</span>
            <input
              type="text"
              inputMode="numeric"
              name="valuationDollars"
              value={fields.valuationDollars}
              onChange={(event) => patch({ valuationDollars: event.target.value })}
            />
            <small className="operate-editor__note">Not shown to the customer.</small>
          </label>
          <label>
            <span>Hourly cost ($)</span>
            <input
              type="text"
              inputMode="decimal"
              name="hourlyCostDollars"
              value={fields.hourlyCostDollars}
              onChange={(event) => patch({ hourlyCostDollars: event.target.value })}
            />
            <small className="operate-editor__note">Not shown to the customer.</small>
          </label>
        </fieldset>

        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <button type="submit" disabled={pending}>
            {pending ? "Saving" : "Save"}
          </button>
          {message ? (
            <span role="status" style={{ color: message.ok ? "inherit" : "#FA4C1F" }}>
              {message.text}
            </span>
          ) : null}
        </div>
      </form>

      <div className="operate-editor__preview">
        <div className="operate-editor__preview-bar">
          <span>Client letter</span>
          <a href={`/operate/d/${deal.token}`} target="_blank" rel="noreferrer">
            Open the client page
          </a>
        </div>
        <DealLetter deal={letter} mode="preview" />
      </div>
    </div>
  );
}
