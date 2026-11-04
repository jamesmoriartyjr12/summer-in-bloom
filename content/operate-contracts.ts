import type { ClientTerm } from "@/lib/operate/pricing";

// First pages of a client's SOW, exported small from the Bloom Contracts Figma file so the text stays unreadable.
// A client without pages here gets a drawn page on the receipt.
const SOW_PAGES: Record<string, Record<ClientTerm, string>> = {
  "Amplifier Health": {
    "six-month": "/operate/contracts/amplifier-health-sow-six-month.png",
    "one-year": "/operate/contracts/amplifier-health-sow-one-year.png",
  },
};

export function sowPage(companyName: string, term: ClientTerm): string | null {
  return SOW_PAGES[companyName.trim()]?.[term] ?? null;
}
