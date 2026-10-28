import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  equityPerHourCents,
  equityPerWeekCents,
  formatDollars,
  termLabel,
  toLetterPackage,
  validatePackage,
  weeklyAmountCents,
} from "./pricing";

describe("amplifier pricing", () => {
  it("prices 40 hours at $190 and $150", () => {
    assert.equal(weeklyAmountCents(40, 19000), 760000);
    assert.equal(weeklyAmountCents(40, 15000), 600000);
    assert.equal(equityPerHourCents(19000, 15000), 4000);
    assert.equal(equityPerWeekCents(40, 19000, 15000), 160000);
    assert.equal(formatDollars(760000), "$7,600");
    assert.equal(formatDollars(4000), "$40");
  });

  it("names the term", () => {
    assert.equal(termLabel("six-month"), "Six months");
    assert.equal(termLabel("one-year"), "One year");
    assert.equal(termLabel("multi-year"), "Multi-year");
  });

  it("rejects a cash rate above the list rate when equity is on", () => {
    const error = validatePackage({
      serviceName: "Design Engineering",
      hoursPerWeek: 40,
      enabled: true,
      listRateCents: 15000,
      cashRateCents: 19000,
      equityEnabled: true,
    });
    assert.equal(error, "Cash rate cannot exceed the list rate.");
  });

  it("allows a cash rate above the list rate when equity is off", () => {
    const error = validatePackage({
      serviceName: "Design Engineering",
      hoursPerWeek: 80,
      enabled: true,
      listRateCents: 15000,
      cashRateCents: 19000,
      equityEnabled: false,
    });
    assert.equal(error, null);
  });

  it("builds the letter package", () => {
    const row = toLetterPackage({
      id: "pkg-40",
      serviceName: "Design Engineering",
      hoursPerWeek: 40,
      listRateCents: 19000,
      cashRateCents: 15000,
    });
    assert.equal(row.weeklyListCents, 760000);
    assert.equal(row.weeklyCashCents, 600000);
  });
});
