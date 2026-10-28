import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { linkedInProfileUrl, nameFromLinkedInSlug, parseLinkedInHtml } from "./linkedin";

describe("linkedin profile", () => {
  it("accepts a profile link and drops the rest", () => {
    assert.equal(
      linkedInProfileUrl("https://www.linkedin.com/in/billgates/?trk=public"),
      "https://www.linkedin.com/in/billgates",
    );
    assert.equal(linkedInProfileUrl("https://example.com/in/billgates"), null);
  });

  it("reads a name from a private profile link", () => {
    assert.equal(nameFromLinkedInSlug("jeremy-barber"), "Jeremy Barber");
    assert.equal(nameFromLinkedInSlug("jeremy-barber-101833146"), "Jeremy Barber");
  });

  it("reads the name and photo from the public page", () => {
    const html = `
      <meta property="og:title" content="Bill Gates - Chair, Gates Foundation | LinkedIn" />
      <meta property="og:image" content="https://media.licdn.com/dms/image/v2/photo.jpg?e=1&amp;v=beta" />
    `;
    const profile = parseLinkedInHtml(html);
    assert.equal(profile?.name, "Bill Gates");
    assert.equal(profile?.headline, "Chair, Gates Foundation");
    assert.equal(profile?.avatarUrl, "https://media.licdn.com/dms/image/v2/photo.jpg?e=1&v=beta");
  });
});
