import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addDays, formatDate, isIsoDate, nextMonday, termEndDate } from "./dates";

describe("dates", () => {
  it("starts on the next Monday", () => {
    assert.equal(nextMonday(new Date("2026-10-29T21:30:00Z")), "2026-11-02");
    assert.equal(nextMonday(new Date("2026-11-02T09:00:00Z")), "2026-11-09");
    assert.equal(nextMonday(new Date("2026-11-01T09:00:00Z")), "2026-11-02");
  });

  it("ends the term on its last day", () => {
    assert.equal(termEndDate("2026-11-02", 26), "2027-05-02");
    assert.equal(termEndDate("2026-11-02", 52), "2027-10-31");
    assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  });

  it("reads only real calendar days", () => {
    assert.equal(isIsoDate("2026-11-02"), true);
    assert.equal(isIsoDate("2026-02-30"), false);
    assert.equal(isIsoDate("Nov 2"), false);
  });

  it("writes the date the way the letter shows it", () => {
    assert.equal(formatDate("2026-11-02"), "Nov 2, 2026");
  });
});
