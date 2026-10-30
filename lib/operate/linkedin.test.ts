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
    assert.equal(profile?.company, "");
    assert.equal(profile?.avatarUrl, "https://media.licdn.com/dms/image/v2/photo.jpg?e=1&v=beta");
    assert.equal(profile?.companyLogoUrl, null);
  });

  it("reads the role, company, and company logo from the public page", () => {
    const html = `
      <meta property="og:title" content="Bill Gates - Chair | LinkedIn" />
      <meta property="og:description" content="Experience: Somewhere Else · Education: Harvard" />
      <meta property="og:image" content="https://media.licdn.com/dms/image/v2/photo.jpg?e=1&amp;v=beta" />
      <h1 class="top-card-layout__title">Bill Gates</h1>
      <h2 class="top-card-layout__headline">Chair, Gates Foundation</h2>
      <div data-section="currentPositionsDetails">
        <div data-delayed-url="https://media.licdn.com/dms/image/v2/logo.png?e=1&amp;v=beta"></div>
        <span class="top-card-link__description">Gates Foundation</span>
      </div>
      <div data-section="educationsDetails"></div>
    `;
    const profile = parseLinkedInHtml(html);
    assert.equal(profile?.headline, "Chair, Gates Foundation");
    assert.equal(profile?.company, "Gates Foundation");
    assert.equal(profile?.companyLogoUrl, "https://media.licdn.com/dms/image/v2/logo.png?e=1&v=beta");
  });
});
