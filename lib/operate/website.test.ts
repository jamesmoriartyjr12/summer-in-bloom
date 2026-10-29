import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { contactFullName } from "./linkedin";
import { companyWebsiteUrl } from "./website";

describe("company website", () => {
  it("adds https to a bare domain", () => {
    assert.equal(companyWebsiteUrl("amplifier.health"), "https://amplifier.health/");
    assert.equal(companyWebsiteUrl(" https://amplifier.health/about "), "https://amplifier.health/about");
  });

  it("refuses anything that is not a web address", () => {
    assert.equal(companyWebsiteUrl(""), null);
    assert.equal(companyWebsiteUrl("javascript:alert(1)"), null);
    assert.equal(companyWebsiteUrl("amplifier"), null);
  });
});

describe("contact name", () => {
  const link = "https://www.linkedin.com/in/jeremy-barber";

  it("fills a first name out from the profile link", () => {
    assert.equal(contactFullName("Jeremy", link), "Jeremy Barber");
    assert.equal(contactFullName("", link), "Jeremy Barber");
  });

  it("keeps a typed full name or a different name", () => {
    assert.equal(contactFullName("Jeremy B. Barber", link), "Jeremy B. Barber");
    assert.equal(contactFullName("Jer", link), "Jer");
    assert.equal(contactFullName("Jeremy", null), "Jeremy");
  });
});
