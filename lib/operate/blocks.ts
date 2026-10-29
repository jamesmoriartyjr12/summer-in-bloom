export type LetterBlock =
  | { id: string; type: "greeting"; text: string }
  | { id: string; type: "term" }
  | { id: string; type: "offers" }
  | { id: string; type: "divider" };

export type BlockType = LetterBlock["type"];

export const COMPANY_TOKEN = "{company}";
export const DEFAULT_GREETING = `Hello ${COMPANY_TOKEN}, so nice to see you again.`;
export const BLOCK_TYPES: BlockType[] = ["greeting", "term", "offers", "divider"];
const SINGLE: BlockType[] = ["greeting", "term", "offers"];
const MAX_BLOCKS = 24;
const MAX_GREETING = 280;

export function blockLabel(type: BlockType): string {
  if (type === "greeting") return "Greeting";
  if (type === "term") return "Term";
  if (type === "offers") return "Offers";
  return "Divider";
}

export function isSingleBlock(type: BlockType): boolean {
  return SINGLE.includes(type);
}

export function canAddBlock(blocks: LetterBlock[], type: BlockType): boolean {
  if (blocks.length >= MAX_BLOCKS) return false;
  return !isSingleBlock(type) || !blocks.some((block) => block.type === type);
}

export function newBlock(type: BlockType, id: string): LetterBlock {
  if (type === "greeting") return { id, type, text: DEFAULT_GREETING };
  return { id, type };
}

export function defaultBlocks(): LetterBlock[] {
  return [newBlock("greeting", "greeting"), newBlock("term", "term"), newBlock("offers", "offers")];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Stored blocks come from the browser, so anything unreadable falls back to the default letter.
export function parseBlocks(value: unknown): LetterBlock[] {
  if (!Array.isArray(value)) return defaultBlocks();
  const blocks: LetterBlock[] = [];
  const ids = new Set<string>();
  for (const item of value.slice(0, MAX_BLOCKS)) {
    if (!isRecord(item) || typeof item.id !== "string" || item.id === "" || item.id.length > 64) continue;
    if (ids.has(item.id)) continue;
    const type = item.type;
    if (type !== "greeting" && type !== "term" && type !== "offers" && type !== "divider") continue;
    if (isSingleBlock(type) && blocks.some((block) => block.type === type)) continue;
    ids.add(item.id);
    if (type === "greeting") {
      const text = typeof item.text === "string" ? item.text.slice(0, MAX_GREETING) : DEFAULT_GREETING;
      blocks.push({ id: item.id, type, text });
    } else {
      blocks.push({ id: item.id, type });
    }
  }
  return blocks;
}

export function moveBlock(blocks: LetterBlock[], index: number, offset: -1 | 1): LetterBlock[] {
  const target = index + offset;
  if (index < 0 || index >= blocks.length || target < 0 || target >= blocks.length) return blocks;
  const next = [...blocks];
  const [moved] = next.splice(index, 1);
  next.splice(target, 0, moved);
  return next;
}

export function greetingParts(text: string, companyName: string): { text: string; company: boolean }[] {
  const parts: { text: string; company: boolean }[] = [];
  text.split(COMPANY_TOKEN).forEach((piece, index) => {
    if (index > 0) parts.push({ text: companyName, company: true });
    if (piece) parts.push({ text: piece, company: false });
  });
  return parts;
}

// The editor shows the real company name; the stored text keeps the token so a rename carries through.
export function greetingForEditing(text: string, companyName: string): string {
  return companyName.trim() === "" ? text : text.split(COMPANY_TOKEN).join(companyName);
}

export function greetingFromEditing(text: string, companyName: string): string {
  const name = companyName.trim();
  return name === "" ? text : text.split(name).join(COMPANY_TOKEN);
}
