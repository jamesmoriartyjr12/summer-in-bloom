"use client";

import { useState } from "react";
import { formatDollars } from "@/lib/operate/pricing";
import { saveBaseRatesAction } from "./actions";

type Rate = {
  serviceName: string;
  hoursPerWeek: number;
  listRateCents: number;
  cashRateCents: number;
  sortOrder: number;
};

function centsToInput(cents: number): string {
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
}

const css = `
.baseline { margin: 28px 0 8px; border: 1px solid rgba(7, 15, 24, 0.18); }
.baseline__open {
  display: block; width: 100%; padding: 16px 18px; border: 0; background: transparent;
  color: inherit; font: inherit; text-align: left; cursor: pointer;
}
.baseline__open:hover { background: rgba(7, 15, 24, 0.03); }
.baseline__label { display: block; margin-bottom: 10px; font-size: 14px; font-weight: 600; }
.baseline__line { display: grid; grid-template-columns: 1fr 5.5em 5.5em; gap: 16px; align-items: baseline; font-size: 15px; }
.baseline__line span:not(:first-child) { text-align: right; font-variant-numeric: tabular-nums; }
.baseline__line--head { margin-bottom: 4px; font-size: 12px; opacity: 0.6; }
.baseline__form { padding: 16px 18px 18px; }
.baseline__row { display: grid; grid-template-columns: 1.3fr 0.7fr 0.8fr 0.8fr; gap: 8px; margin-bottom: 12px; }
.baseline__row label { display: grid; gap: 4px; font-size: 13px; }
.baseline__row input {
  box-sizing: border-box; width: 100%; min-width: 0; padding: 8px 10px; font: inherit; color: inherit;
  background: transparent; border: 1px solid rgba(7, 15, 24, 0.3);
}
.baseline__actions { display: flex; gap: 8px; align-items: center; }
.baseline__actions button, .baseline__cancel {
  font: inherit; padding: 8px 16px; cursor: pointer; border: 0;
}
.baseline__save { color: #FAF6EC; background: #070F18; }
.baseline__cancel { color: inherit; background: transparent; }
.baseline__notice { margin: 0 0 12px; font-size: 14px; color: #FA4C1F; }
`;

export function BaselineRate({ rates, notice }: { rates: Rate[]; notice: string }) {
  const [editing, setEditing] = useState(notice !== "");

  if (!editing) {
    return (
      <div className="baseline">
        <style>{css}</style>
        <button type="button" className="baseline__open" onClick={() => setEditing(true)}>
          <span className="baseline__label">Baseline</span>
          <span className="baseline__line baseline__line--head">
            <span />
            <span>List</span>
            <span>Cash</span>
          </span>
          {rates.map((rate) => (
            <span key={rate.sortOrder} className="baseline__line">
              <span>{rate.hoursPerWeek} hrs/week</span>
              <span>{formatDollars(rate.listRateCents)}</span>
              <span>{formatDollars(rate.cashRateCents)}</span>
            </span>
          ))}
        </button>
      </div>
    );
  }

  return (
    <div className="baseline">
      <style>{css}</style>
      <form action={saveBaseRatesAction} className="baseline__form">
        <span className="baseline__label">Baseline</span>
        {notice ? <p className="baseline__notice">{notice}</p> : null}
        {rates.map((rate) => (
          <div key={rate.sortOrder} className="baseline__row">
            <label>
              <span>Service</span>
              <input name={`offer${rate.sortOrder}Service`} defaultValue={rate.serviceName} required />
            </label>
            <label>
              <span>Hours / week</span>
              <input
                name={`offer${rate.sortOrder}Hours`}
                type="number"
                min={1}
                step={1}
                defaultValue={rate.hoursPerWeek}
                required
              />
            </label>
            <label>
              <span>List ($/hr)</span>
              <input
                name={`offer${rate.sortOrder}List`}
                inputMode="decimal"
                defaultValue={centsToInput(rate.listRateCents)}
                required
              />
            </label>
            <label>
              <span>Cash ($/hr)</span>
              <input
                name={`offer${rate.sortOrder}Cash`}
                inputMode="decimal"
                defaultValue={centsToInput(rate.cashRateCents)}
                required
              />
            </label>
          </div>
        ))}
        <div className="baseline__actions">
          <button type="submit" className="baseline__save">
            Save
          </button>
          <button type="button" className="baseline__cancel" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
