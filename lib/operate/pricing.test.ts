import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  equityPerHourCents,
  equityPerWeekCents,
  formatDollars,
  termLabel,
  averageBillableCents,
  billableHourCents,
  cascadeOffers,
  contractValueCents,
  equityValueCents,
  baseRateCents,
  offeredTerms,
  offerPrice,
  quotedTerm,
  sheetOffers,
  sheetRateCents,
  termMonths,
  termWeeks,
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

  it("averages the billable rate across deals", () => {
    assert.equal(billableHourCents(19000, 15000, false), 19000);
    assert.equal(billableHourCents(19000, 15000, true), 15000);
    assert.equal(
      averageBillableCents([
        {
          equityEnabled: true,
          offers: [
            { listRateCents: 19000, cashRateCents: 15000 },
            { listRateCents: 16000, cashRateCents: 12000 },
          ],
        },
      ]),
      13500,
    );
    assert.equal(averageBillableCents([]), null);
  });

  it("keeps the same offers on every deal", () => {
    const base = [
      {
        serviceName: "Design Engineering",
        hoursPerWeek: 40,
        listRateCents: 19000,
        cashRateCents: 15000,
        yearListRateCents: 17000,
        yearCashRateCents: 13000,
        sortOrder: 0,
      },
      {
        serviceName: "Design Engineering",
        hoursPerWeek: 80,
        listRateCents: 16000,
        cashRateCents: 12000,
        yearListRateCents: 14000,
        yearCashRateCents: 10000,
        sortOrder: 1,
      },
    ];
    assert.deepEqual(cascadeOffers(base, null), base);
    const custom = cascadeOffers(base, [
      { sortOrder: 0, listRateCents: 17000, cashRateCents: 14000, yearListRateCents: null, yearCashRateCents: 11000 },
    ]);
    assert.equal(custom[0]?.hoursPerWeek, 40);
    assert.equal(custom[0]?.listRateCents, 17000);
    assert.equal(custom[0]?.yearListRateCents, 15000);
    assert.equal(custom[0]?.yearCashRateCents, 11000);
    assert.equal(custom[1]?.listRateCents, 16000);
    assert.equal(custom[1]?.serviceName, "Design Engineering");
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

  it("prices the term the client is looking at", () => {
    assert.deepEqual(offeredTerms("both"), ["six-month", "one-year"]);
    assert.deepEqual(offeredTerms("one-year"), ["one-year"]);
    assert.equal(quotedTerm("both", null), "six-month");
    assert.equal(quotedTerm("both", "one-year"), "one-year");
    assert.equal(quotedTerm("six-month", "one-year"), "six-month");
    const offer = { listRateCents: 20000, cashRateCents: 16000, yearListRateCents: 18000, yearCashRateCents: 14000 };
    assert.deepEqual(offerPrice(offer, "six-month"), { listRateCents: 20000, cashRateCents: 16000 });
    assert.deepEqual(offerPrice(offer, "one-year"), { listRateCents: 18000, cashRateCents: 14000 });
  });
});
