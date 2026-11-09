import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  cashRateAt,
  defaultEquityBasis,
  equitySteps,
  formatPercent,
  MIN_CASH_RATE_CENTS,
  ownershipPercent,
} from "./equity";

describe("equity", () => {
  it("never takes cash under the floor", () => {
    assert.equal(cashRateAt(20000, 3000, MIN_CASH_RATE_CENTS), 17000);
    assert.equal(cashRateAt(16000, 3000, MIN_CASH_RATE_CENTS), 15000);
    assert.equal(cashRateAt(14000, 3000, MIN_CASH_RATE_CENTS), 14000);
    assert.equal(cashRateAt(20000, 8000, 10000), 12000);
  });

  it("offers $10 steps up to the floor", () => {
    assert.deepEqual(equitySteps([20000, 19000, 18000], MIN_CASH_RATE_CENTS), [0, 1000, 2000, 3000, 4000, 5000]);
    assert.deepEqual(equitySteps([16000], MIN_CASH_RATE_CENTS), [0, 1000]);
    assert.deepEqual(equitySteps([15000], MIN_CASH_RATE_CENTS), [0]);
  });

  it("defaults the basis from the round", () => {
    assert.equal(defaultEquityBasis("Seed"), "multiplier");
    assert.equal(defaultEquityBasis("Pre-seed"), "multiplier");
    assert.equal(defaultEquityBasis("Series A"), "dollar");
    assert.equal(defaultEquityBasis(null), "dollar");
  });

  it("works out ownership from the valuation", () => {
    const post = { valuationDollars: 10_000_000, valuationBasis: "post", equityBasis: "dollar", multiplier: 2 } as const;
    assert.equal(ownershipPercent(12_480_000, post), 1.25);
    assert.equal(ownershipPercent(12_480_000, { ...post, equityBasis: "multiplier" }), 2.5);
    assert.equal(ownershipPercent(12_480_000, { ...post, equityBasis: "percent" }), 2);
    assert.equal(ownershipPercent(12_480_000, { ...post, valuationBasis: "pre" }), 1.23);
    assert.equal(ownershipPercent(12_480_000, { ...post, valuationDollars: null }), null);
    assert.equal(ownershipPercent(0, post), null);
    assert.equal(formatPercent(1.25), "1.25%");
    assert.equal(formatPercent(2), "2%");
  });
});
