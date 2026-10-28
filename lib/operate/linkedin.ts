export type LinkedInProfile = {
  name: string;
  headline: string;
  company: string;
  avatarUrl: string | null;
  companyLogoUrl: string | null;
};

const SLUG = /^\/in\/([A-Za-z0-9\-_%]+)\/?$/;

export function nameFromLinkedInSlug(slug: string): string {
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    decoded = slug;
  }
  const parts = decoded.split("-").filter((part) => part.length > 0 && !/^\d+$/.test(part));
  return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export function linkedInProfileUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (host !== "linkedin.com") return null;
  const match = url.pathname.match(SLUG);
  if (!match?.[1]) return null;
  return `https://www.linkedin.com/in/${match[1]}`;
}

function decode(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function plain(value: string): string {
  return decode(value.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function licdnImage(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(decode(raw));
    if (url.protocol === "https:" && url.hostname === "media.licdn.com") return url.toString();
  } catch {
    return null;
  }
  return null;
}

function elementText(html: string, tag: string, classFragment: string): string | null {
  const pattern = new RegExp(
    `<${tag}[^>]*class=["'][^"']*${classFragment}[^"']*["'][^>]*>([\\s\\S]*?)</${tag}>`,
    "i",
  );
  const found = html.match(pattern);
  if (!found?.[1]) return null;
  const text = plain(found[1]);
  return text || null;
}

function currentCompany(html: string): { name: string; logoUrl: string | null } | null {
  const start = html.indexOf('data-section="currentPositionsDetails"');
  if (start < 0) return null;
  const next = html.indexOf('data-section="', start + 20);
  const block = html.slice(start, next > start ? next : start + 2500);
  const name = plain(block.match(/top-card-link__description[^>]*>([\s\S]*?)<\/span>/i)?.[1] ?? "");
  if (!name) return null;
  const logo = block.match(/data-delayed-url=["']([^"']+)["']/i)?.[1] ?? null;
  return { name, logoUrl: licdnImage(logo) };
}

function companyFromDescription(html: string): string {
  const description = meta(html, "og:description") ?? "";
  const found = description.match(/Experience:\s*([^·|]+)/i);
  return found?.[1]?.trim() ?? "";
}

function meta(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`property=["']${property}["'][^>]*content=["']([^"']*)["']`, "i"),
    new RegExp(`content=["']([^"']*)["'][^>]*property=["']${property}["']`, "i"),
  ];
  for (const pattern of patterns) {
    const found = html.match(pattern);
    if (found?.[1]) return decode(found[1]).trim();
  }
  return null;
}

export function parseLinkedInHtml(html: string): LinkedInProfile | null {
  const title = meta(html, "og:title");
  const withoutSite = title?.replace(/\s*\|\s*LinkedIn\s*$/i, "").trim() ?? "";
  const [namePart, ...rest] = withoutSite.split(" - ");
  const name = elementText(html, "h1", "top-card-layout__title") ?? namePart?.trim() ?? "";
  if (!name) return null;
  const headline =
    elementText(html, "h2", "top-card-layout__headline") ?? rest.join(" - ").trim();
  const position = currentCompany(html);
  return {
    name,
    headline,
    company: position?.name || companyFromDescription(html),
    avatarUrl: licdnImage(meta(html, "og:image")),
    companyLogoUrl: position?.logoUrl ?? null,
  };
}

function slugFromProfileUrl(url: string): string {
  return new URL(url).pathname.split("/").filter(Boolean)[1] ?? "";
}

export async function readLinkedInProfile(
  raw: string,
): Promise<
  { ok: true; profile: LinkedInProfile; url: string; limited: boolean } | { ok: false; error: string }
> {
  const url = linkedInProfileUrl(raw);
  if (!url) return { ok: false, error: "Use a linkedin.com/in profile link." };

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return { ok: false, error: "Could not open that LinkedIn page." };
  }

  const html = await response.text();
  const profile = response.ok ? parseLinkedInHtml(html) : null;
  if (profile) return { ok: true, profile, url, limited: false };

  const name = nameFromLinkedInSlug(slugFromProfileUrl(url));
  if (!name) return { ok: false, error: "That LinkedIn page did not include a name." };
  return {
    ok: true,
    profile: { name, headline: "", company: "", avatarUrl: null, companyLogoUrl: null },
    url,
    limited: true,
  };
}
