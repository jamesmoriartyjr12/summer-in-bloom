import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addDays, formatDate, isIsoDate, nearestFriday, nextMonday, termEndDate } from "./dates";

describe("dates", () => {
  it("starts on the next Monday", () => {
    assert.equal(nextMonday(new Date("2026-10-29T21:30:00Z")), "2026-11-02");
    assert.equal(nextMonday(new Date("2026-11-02T09:00:00Z")), "2026-11-09");
    assert.equal(nextMonday(new Date("2026-11-01T09:00:00Z")), "2026-11-02");
  });

  it("ends the term on the nearest Friday", () => {
    assert.equal(termEndDate("2026-11-02", 26), "2027-04-30");
    assert.equal(termEndDate("2026-11-02", 52), "2027-10-29");
    assert.equal(termEndDate("2026-11-16", 52), "2027-11-12");
    assert.equal(nearestFriday("2027-11-08"), "2027-11-05");
    assert.equal(nearestFriday("2027-11-09"), "2027-11-12");
    assert.equal(nearestFriday("2027-11-12"), "2027-11-12");
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
