import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  averageCents,
  baseRateCents,
  billableHourCents,
  buildLetterTerms,
  bundleQuote,
  contractValueCents,
  equityPerHourCents,
  equityPerWeekCents,
  equityValueCents,
  formatDollars,
  offeredTerms,
  quotedTerm,
  sheetLine,
  sheetOffers,
  sheetRateCents,
  termLabel,
  termMonths,
  termWeeks,
  validateLine,
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

  it("values a contract over its term", () => {
    assert.equal(termWeeks("six-month"), 26);
    assert.equal(termWeeks("one-year"), 52);
    assert.equal(termWeeks("multi-year"), null);
    assert.equal(termMonths("six-month"), 6);
    assert.equal(termMonths("one-year"), 12);
    assert.equal(termMonths("multi-year"), null);
    assert.equal(contractValueCents(40, 15000, "six-month"), 15600000);
    assert.equal(contractValueCents(80, 15000, "one-year"), 62400000);
    assert.equal(contractValueCents(40, 15000, "multi-year"), null);
    assert.equal(equityValueCents(80, 19000, 15000, "one-year"), 16640000);
    assert.equal(equityValueCents(80, 19000, 15000, "multi-year"), null);
  });

  it("names the term", () => {
    assert.equal(termLabel("six-month"), "Six months");
    assert.equal(termLabel("one-year"), "One year");
    assert.equal(termLabel("multi-year"), "Multi-year");
  });

  it("checks every service line", () => {
    const line = { serviceName: "Design Engineering", hoursPerWeek: 40, listRateCents: 20000, yearListRateCents: 18000 };
    assert.equal(validateLine(line), null);
    assert.equal(validateLine({ ...line, serviceName: " " }), "Every service needs a name.");
    assert.equal(validateLine({ ...line, hoursPerWeek: 0 }), "Hours per week must be a positive whole number.");
    assert.equal(validateLine({ ...line, yearListRateCents: 0 }), "Every rate must be more than zero.");
  });

  it("averages the billable rate across deals", () => {
    assert.equal(billableHourCents(19000, 15000, false), 19000);
    assert.equal(billableHourCents(19000, 15000, true), 15000);
    assert.equal(averageCents([15000, 12000, null]), 13500);
    assert.equal(averageCents([]), null);
  });

  it("adds a bundle up line by line, each held at the floor", () => {
    const lines = [
      { hoursPerWeek: 40, listRateCents: 18000 },
      { hoursPerWeek: 80, listRateCents: 16000 },
    ];
    const quote = bundleQuote(lines, 52, 3000, 15000);
    assert.equal(quote.hoursPerWeek, 120);
    assert.equal(quote.weeklyListCents, 40 * 18000 + 80 * 16000);
    assert.equal(quote.weeklyCashCents, 40 * 15000 + 80 * 15000);
    assert.equal(quote.equityPerWeekCents, 40 * 3000 + 80 * 1000);
    assert.equal(quote.equityTotalCents, (40 * 3000 + 80 * 1000) * 52);
    assert.equal(quote.totalCashCents, 120 * 15000 * 52);
  });

  it("prices each term as its own block, with dates", () => {
    const line = sheetLine(20000, { id: "a", serviceName: "Design Engineering", hoursPerWeek: 80 });
    assert.equal(line.listRateCents, 19000);
    assert.equal(line.yearListRateCents, 17000);
    const settings = {
      equityEnabled: true,
      floorCents: 15000,
      ownership: { valuationDollars: 10_000_000, valuationBasis: "post", equityBasis: "dollar", multiplier: 2 },
    } as const;
    const built = buildLetterTerms(["six-month", "one-year"], [line], settings, "2026-11-02");
    assert.deepEqual(built.steps, [0, 1000, 2000, 3000, 4000]);
    const [six, year] = built.terms;
    assert.equal(six?.endDate, "2027-04-30");
    assert.equal(year?.endDate, "2027-10-29");
    assert.equal(six?.options[3]?.weeklyCashCents, 80 * 16000);
    assert.equal(year?.options[3]?.weeklyCashCents, 80 * 15000);
    assert.equal(year?.options[4]?.weeklyCashCents, 80 * 15000);
    assert.equal(year?.options[3]?.equityTotalCents, 80 * 2000 * 52);
    assert.equal(year?.options[3]?.ownershipPercent, 0.83);
    const cash = buildLetterTerms(["one-year"], [line], { ...settings, equityEnabled: false }, "2026-11-02");
    assert.deepEqual(cash.steps, [0]);
  });

  it("builds the pricing sheet from the base rate", () => {
    assert.equal(sheetRateCents(20000, 40, "six-month"), 20000);
    assert.equal(sheetRateCents(20000, 80, "six-month"), 19000);
    assert.equal(sheetRateCents(20000, 120, "six-month"), 18000);
    assert.equal(sheetRateCents(20000, 40, "one-year"), 18000);
    assert.equal(sheetRateCents(20000, 80, "one-year"), 17000);
    assert.equal(sheetRateCents(20000, 120, "one-year"), 16000);
    const sheet = sheetOffers(20000);
    assert.deepEqual(
      sheet.map((offer) => [offer.hoursPerWeek, offer.listRateCents, offer.yearListRateCents]),
      [
        [40, 20000, 18000],
        [80, 19000, 17000],
        [120, 18000, 16000],
      ],
    );
    assert.equal(baseRateCents(sheet), 20000);
    assert.equal(baseRateCents([]), null);
  });

  it("picks the term the client is looking at", () => {
    assert.deepEqual(offeredTerms("both"), ["six-month", "one-year"]);
    assert.deepEqual(offeredTerms("one-year"), ["one-year"]);
    assert.equal(quotedTerm("both", null), "six-month");
    assert.equal(quotedTerm("both", "one-year"), "one-year");
    assert.equal(quotedTerm("six-month", "one-year"), "six-month");
  });
});
