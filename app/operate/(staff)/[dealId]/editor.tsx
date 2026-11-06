"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { ArrowDown, ArrowUp, Check, ChevronDown, ExternalLink, Link2, Lock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  blockClassName,
  GreetingView,
  IntroView,
  LetterFrame,
  MessageView,
  OffersView,
  PartiesView,
  ToParty,
} from "@/components/operate/DealLetter";
import {
  BLOCK_TYPES,
  blockLabel,
  canAddBlock,
  greetingForEditing,
  greetingFromEditing,
  messageParagraphs,
  moveBlock,
  newBlock,
  type BlockType,
  type LetterBlock,
} from "@/lib/operate/blocks";
import {
  defaultEquityBasis,
  DEFAULT_MULTIPLIER,
  EQUITY_BASES,
  equityBasisLabel,
  formatPercent,
  isEquityBasis,
  MIN_CASH_RATE_CENTS,
  type EquityBasis,
  type ValuationBasis,
} from "@/lib/operate/equity";
import {
  buildLetterTerms,
  CLIENT_TERMS,
  formatDollars,
  dealStepCents,
  MAX_LINES,
  SHEET_HOURS,
  SHEET_SERVICE,
  sheetLine,
  termFloorCents,
  termLabel,
  offeredTerms,
  type ClientTerm,
  type LetterDeal,
  type LetterLine,
  type LetterTerm,
  type ServiceLine,
  type TermOffer,
} from "@/lib/operate/pricing";
import { isIsoDate } from "@/lib/operate/dates";
import { contactFullName } from "@/lib/operate/linkedin";
import { createDealAction, lookupLinkedInAction, saveDealAction } from "@/app/operate/actions";
import { HEADER_ACTIONS_ID } from "../shell";
import { OPERATE_SERVICES } from "@/content/operate-services";
import { approvedService, serviceDescription } from "@/lib/operate/services";

// A deal with an empty id and token has not been saved yet.
export type EditorDeal = {
  id: string;
  token: string;
  companyName: string;
  contactName: string;
  contactRole: string;
  linkedinUrl: string;
  avatarUrl: string | null;
  companyLogoUrl: string | null;
  companyUrl: string;
  letterBlocks: LetterBlock[];
  equityEnabled: boolean;
  baseCents: number;
  termOffer: TermOffer;
  startDate: string;
  round: string;
  valuationDollars: string;
  valuationBasis: ValuationBasis;
  equityBasis: EquityBasis | null;
  equityMultiplier: number;
  cashFloorCents: number;
  hourlyCostCents: number | null;
  selectedTerm: ClientTerm | null;
  selectedEquityCents: number;
  packageRequestedAt?: string | null;
  lines: ServiceLine[];
};

function requestedOn(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" });
}

// `key` stays put for React while `id` is empty until the line is saved.
type LineFields = {
  key: string;
  id: string;
  serviceName: string;
  hours: string;
};

type Fields = {
  companyName: string;
  contactName: string;
  contactRole: string;
  linkedinUrl: string;
  avatarUrl: string | null;
  companyLogoUrl: string | null;
  companyUrl: string;
  equityEnabled: boolean;
  termOffer: TermOffer;
  startDate: string;
  round: string;
  valuationDollars: string;
  valuationBasis: ValuationBasis;
  equityBasis: EquityBasis | "";
  equityMultiplier: string;
  cashFloorDollars: string;
  hourlyCostDollars: string;
  equityCents: number;
  lines: LineFields[];
};

function centsToDollars(cents: number): string {
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
}

function dollarsToCents(raw: string): number {
  const cents = Math.round(Number(raw.replace(/[$,\s]/g, "")) * 100);
  return Number.isFinite(cents) ? cents : 0;
}

function hoursValue(raw: string): number {
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : 0;
}

function lineFields(line: ServiceLine): LineFields {
  return {
    key: line.id,
    id: line.id,
    serviceName: line.serviceName,
    hours: String(line.hoursPerWeek),
  };
}

function initialFields(deal: EditorDeal): Fields {
  return {
    companyName: deal.companyName,
    contactName: deal.contactName,
    contactRole: deal.contactRole,
    linkedinUrl: deal.linkedinUrl,
    avatarUrl: deal.avatarUrl,
    companyLogoUrl: deal.companyLogoUrl,
    companyUrl: deal.companyUrl,
    equityEnabled: deal.equityEnabled,
    termOffer: deal.termOffer,
    startDate: deal.startDate,
    round: deal.round,
    valuationDollars: deal.valuationDollars,
    valuationBasis: deal.valuationBasis,
    equityBasis: deal.equityBasis ?? "",
    equityMultiplier: String(deal.equityMultiplier),
    cashFloorDollars: centsToDollars(deal.cashFloorCents),
    hourlyCostDollars: deal.hourlyCostCents === null ? "" : centsToDollars(deal.hourlyCostCents),
    equityCents: deal.selectedEquityCents,
    lines: deal.lines.map(lineFields),
  };
}

function floorCents(fields: Fields): number {
  return fields.cashFloorDollars.trim() === "" ? MIN_CASH_RATE_CENTS : dollarsToCents(fields.cashFloorDollars);
}

function resolvedBasis(fields: Fields): EquityBasis {
  return fields.equityBasis === "" ? defaultEquityBasis(fields.round) : fields.equityBasis;
}

// Each line follows the pricing sheet for its hours.
function previewLines(fields: Fields, baseCents: number): ServiceLine[] {
  return fields.lines.map((row) =>
    sheetLine(baseCents, {
      id: row.key,
      serviceName: row.serviceName,
      description: serviceDescription(row.serviceName),
      hoursPerWeek: hoursValue(row.hours),
    }),
  );
}

function previewLetter(
  fields: Fields,
  blocks: LetterBlock[],
  selectedTerm: ClientTerm | null,
  baseCents: number,
  fallbackStart: string,
): LetterDeal {
  const valuation = Number(fields.valuationDollars.replace(/[$,\s]/g, ""));
  const multiplier = Number(fields.equityMultiplier);
  const settings = {
    equityEnabled: fields.equityEnabled,
    floorCents: floorCents(fields),
    ownership: {
      valuationDollars: fields.valuationDollars.trim() !== "" && valuation > 0 ? valuation : null,
      valuationBasis: fields.valuationBasis,
      equityBasis: resolvedBasis(fields),
      multiplier: multiplier > 0 ? multiplier : DEFAULT_MULTIPLIER,
    },
  };
  const built = buildLetterTerms(
    offeredTerms(fields.termOffer),
    previewLines(fields, baseCents),
    settings,
    isIsoDate(fields.startDate) ? fields.startDate : fallbackStart,
  );
  return {
    blocks,
    companyName: fields.companyName,
    companyLogoUrl: fields.companyLogoUrl,
    contactName: fields.contactName,
    contactFullName: contactFullName(fields.contactName, fields.linkedinUrl),
    contactRole: fields.contactRole,
    avatarUrl: fields.avatarUrl,
    equityEnabled: fields.equityEnabled,
    steps: built.steps,
    terms: built.terms,
    selectedTerm,
    selectedEquityCents: dealStepCents(built.steps, fields.equityCents, fields.equityEnabled),
  };
}

function toFormData(fields: Fields, blocks: LetterBlock[]): FormData {
  const data = new FormData();
  data.set("companyName", fields.companyName);
  data.set("contactName", fields.contactName);
  data.set("contactRole", fields.contactRole);
  data.set("linkedinUrl", fields.linkedinUrl);
  data.set("companyUrl", fields.companyUrl);
  data.set("termOffer", fields.termOffer);
  data.set("startDate", fields.startDate);
  data.set("round", fields.round);
  data.set("valuationDollars", fields.valuationDollars);
  data.set("valuationBasis", fields.valuationBasis);
  data.set("equityBasis", fields.equityBasis);
  data.set("equityMultiplier", fields.equityMultiplier);
  data.set("cashFloorDollars", fields.cashFloorDollars);
  data.set("hourlyCostDollars", fields.hourlyCostDollars);
  data.set("equityCents", String(fields.equityCents));
  if (fields.equityEnabled) data.set("equityEnabled", "on");
  data.set("lineCount", String(fields.lines.length));
  fields.lines.forEach((row, index) => {
    data.set(`line${index}Id`, row.id);
    data.set(`line${index}Name`, row.serviceName);
    data.set(`line${index}Hours`, row.hours);
  });
  data.set("letterBlocks", JSON.stringify(blocks));
  return data;
}

const gutterButton =
  "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30";

const blockShell =
  "group/block relative rounded-sm outline outline-1 outline-offset-[12px] outline-transparent transition-[outline-color] hover:outline-foreground/15 focus-within:outline-foreground/25";

const chip =
  "operate-label inline-flex h-7 shrink-0 items-center whitespace-nowrap gap-1.5 rounded-full border border-border bg-background px-3 text-[11px] transition-colors hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function AddBlockMenu({
  blocks,
  onAdd,
  label,
}: {
  blocks: LetterBlock[];
  onAdd: (type: BlockType) => void;
  label: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className="flex size-7 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:border-orange hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:border-orange data-[state=open]:text-orange"
        >
          <Plus aria-hidden="true" className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        {BLOCK_TYPES.map((type) => (
          <DropdownMenuItem key={type} disabled={!canAddBlock(blocks, type)} onSelect={() => onAdd(type)}>
            {blockLabel(type)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AddServiceMenu({
  label,
  disabled,
  onAdd,
}: {
  label: string;
  disabled: boolean;
  onAdd: (serviceName: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={label}
          disabled={disabled}
          className={`${chip} text-muted-foreground disabled:opacity-40`}
        >
          <Plus aria-hidden="true" className="size-3.5" />
          Add service
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        {OPERATE_SERVICES.map((service) => (
          <DropdownMenuItem key={service.name} onSelect={() => onAdd(service.name)} className="items-start">
            <span className="grid gap-0.5">
              <span className="font-medium">{service.name}</span>
              <span className="line-clamp-2 text-xs text-muted-foreground">{service.description}</span>
            </span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onAdd(SHEET_SERVICE)}>Blank service</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EquityMenu({
  enabled,
  steps,
  terms,
  selectedCents,
  floorCents,
  onChange,
}: {
  enabled: boolean;
  steps: number[];
  terms: LetterTerm[];
  selectedCents: number;
  floorCents: number;
  onChange: (next: { equityEnabled: boolean; equityCents?: number }) => void;
}) {
  const on = enabled && selectedCents > 0;
  const offered = steps.filter((step) => step > 0);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`${chip} tabular-nums ${enabled ? "border-orange text-orange" : "text-muted-foreground"}`}
        >
          Equity {on ? `${formatDollars(selectedCents)}/hr` : enabled ? "on" : "off"}
          <ChevronDown aria-hidden="true" className="size-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuItem onSelect={() => onChange({ equityEnabled: false })}>
          <Check aria-hidden="true" className={enabled ? "invisible" : undefined} />
          No equity
        </DropdownMenuItem>
        {offered.length > 0 ? (
          <div className="flex items-baseline justify-between gap-3 px-2 pb-1 pt-2 pl-8">
            <span className="operate-label text-[10px] text-muted-foreground">Into equity</span>
            <span className="operate-label text-[10px] text-muted-foreground">Total Investment</span>
          </div>
        ) : null}
        {offered.map((step) => {
          const index = steps.indexOf(step);
          return (
            <DropdownMenuItem
              key={step}
              onSelect={() => onChange({ equityEnabled: true, equityCents: step })}
              className="items-start tabular-nums"
            >
              <Check aria-hidden="true" className={on && step === selectedCents ? "mt-0.5" : "invisible mt-0.5"} />
              <span className="flex flex-1 items-start justify-between gap-3">
                <span>{formatDollars(step)}/hr</span>
                <span className="grid justify-items-end gap-0.5">
                  {terms.map((term) => {
                    const bundle = term.options[index];
                    if (!bundle) return null;
                    return (
                      <span key={term.term} className="flex items-baseline gap-2">
                        {terms.length > 1 ? (
                          <span className="operate-label text-[10px] text-muted-foreground">{term.label}</span>
                        ) : null}
                        <span className="font-medium">{formatDollars(bundle.equityTotalCents)}</span>
                        {bundle.ownershipPercent !== null ? (
                          <span className="text-xs text-muted-foreground">{formatPercent(bundle.ownershipPercent)}</span>
                        ) : null}
                      </span>
                    );
                  })}
                </span>
              </span>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <p className="px-2 py-1.5 text-xs text-muted-foreground">
          {offered.length > 0 ? "Cash never drops below " : "No room above the cash floor: "}
          {terms
            .map((term) => `${formatDollars(termFloorCents(floorCents, term.term))}/hr for ${term.label.toLowerCase()}`)
            .join(", ")}
          .
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function GreetingEditor({
  text,
  companyName,
  onChange,
}: {
  text: string;
  companyName: string;
  onChange: (text: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);
  const value = greetingForEditing(text, companyName);

  useLayoutEffect(() => {
    const node = area.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${node.scrollHeight}px`;
  }, [editing, value]);

  if (!editing) {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label="Edit the greeting"
        className="cursor-text focus-visible:outline-none"
        onClick={() => setEditing(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setEditing(true);
          }
        }}
      >
        <GreetingView text={text} companyName={companyName} />
      </div>
    );
  }

  return (
    <textarea
      ref={area}
      autoFocus
      rows={1}
      aria-label="Greeting"
      className="operate-letter__greeting block w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-inherit outline-none"
      value={value}
      onChange={(event) => onChange(greetingFromEditing(event.target.value, companyName))}
      onBlur={() => setEditing(false)}
      onKeyDown={(event) => {
        if (event.key === "Escape" || (event.key === "Enter" && !event.shiftKey)) {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
    />
  );
}

function MessageEditor({
  text,
  companyName,
  onChange,
}: {
  text: string;
  companyName: string;
  onChange: (text: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);
  const value = greetingForEditing(text, companyName);
  const empty = messageParagraphs(text, companyName).length === 0;

  useLayoutEffect(() => {
    const node = area.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${node.scrollHeight}px`;
  }, [editing, value]);

  if (!editing) {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label="Edit the message"
        className="cursor-text focus-visible:outline-none"
        onClick={() => setEditing(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setEditing(true);
          }
        }}
      >
        {empty ? (
          <p className="operate-letter__message text-muted-foreground">
            Write the scope of work for this deal. It stays off the client&rsquo;s letter until it has words.
          </p>
        ) : (
          <MessageView text={text} companyName={companyName} />
        )}
      </div>
    );
  }

  return (
    <textarea
      ref={area}
      autoFocus
      rows={3}
      aria-label="Message"
      placeholder="Write the scope of work for this deal."
      className="operate-letter__message block w-full resize-none overflow-hidden border-0 bg-transparent p-0 outline-none"
      value={value}
      onChange={(event) => onChange(greetingFromEditing(event.target.value, companyName))}
      onBlur={() => setEditing(false)}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
    />
  );
}

function GrowingText({
  value,
  label,
  placeholder,
  className,
  onChange,
}: {
  value: string;
  label: string;
  placeholder: string;
  className: string;
  onChange: (value: string) => void;
}) {
  const area = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const node = area.current;
    if (!node) return;
    const fit = () => {
      node.style.height = "auto";
      node.style.height = `${node.scrollHeight}px`;
    };
    fit();
    let width = node.clientWidth;
    const observer = new ResizeObserver(() => {
      if (node.clientWidth === width) return;
      width = node.clientWidth;
      fit();
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);

  return (
    <textarea
      ref={area}
      rows={1}
      aria-label={label}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value.replace(/\s*\n\s*/g, " "))}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
      className={`${className} block w-full min-w-0 resize-none overflow-hidden border-0 border-b border-dashed border-transparent bg-transparent p-0 outline-none hover:border-foreground/30 focus:border-orange`}
    />
  );
}

function Field({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="operate-label text-[11px] text-muted-foreground">{label}</span>
      {children}
      {note ? <span className="text-xs text-muted-foreground">{note}</span> : null}
    </label>
  );
}

export function Editor({ deal }: { deal: EditorDeal }) {
  const router = useRouter();
  const isNew = deal.id === "";
  const [fields, setFields] = useState<Fields>(() => initialFields(deal));
  const [blocks, setBlocks] = useState<LetterBlock[]>(deal.letterBlocks);
  const [saved, setSaved] = useState(() => JSON.stringify([initialFields(deal), deal.letterBlocks]));
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const offered = offeredTerms(fields.termOffer);

  useEffect(() => {
    setOrigin(window.location.origin);
    setSlot(document.getElementById(HEADER_ACTIONS_ID));
  }, []);

  const letter = useMemo(
    () => previewLetter(fields, blocks, deal.selectedTerm, deal.baseCents, deal.startDate),
    [fields, blocks, deal.selectedTerm, deal.baseCents, deal.startDate],
  );
  const equityOptions = useMemo(
    () =>
      fields.equityEnabled
        ? letter
        : previewLetter({ ...fields, equityEnabled: true }, blocks, deal.selectedTerm, deal.baseCents, deal.startDate),
    [letter, fields, blocks, deal.selectedTerm, deal.baseCents, deal.startDate],
  );
  const floor = floorCents(fields);
  const dirty = JSON.stringify([fields, blocks]) !== saved;
  const link = `${origin}/operate/d/${deal.token}`;

  function patch(next: Partial<Fields>) {
    setFields((current) => ({ ...current, ...next }));
    setMessage(null);
  }

  function patchBlocks(next: LetterBlock[]) {
    setBlocks(next);
    setMessage(null);
  }

  function patchLine(index: number, next: Partial<LineFields>) {
    setFields((current) => ({
      ...current,
      lines: current.lines.map((row, i) => (i === index ? { ...row, ...next } : row)),
    }));
    setMessage(null);
  }

  function addLine(serviceName: string) {
    if (fields.lines.length >= MAX_LINES) return;
    const key = crypto.randomUUID();
    patch({
      lines: [...fields.lines, { key, id: "", serviceName, hours: "40" }],
    });
  }

  function removeLine(index: number) {
    if (fields.lines.length <= 1) return;
    patch({ lines: fields.lines.filter((_, i) => i !== index) });
  }

  // Each term switches on or off on its own; one always stays on.
  function toggleTerm(term: ClientTerm) {
    const on = new Set(offered);
    if (on.has(term)) {
      if (on.size === 1) return;
      on.delete(term);
    } else {
      on.add(term);
    }
    const next = CLIENT_TERMS.filter((item) => on.has(item));
    patch({ termOffer: next.length === 2 ? "both" : next[0]! });
  }

  function addBlock(type: BlockType, at: number) {
    if (!canAddBlock(blocks, type)) return;
    const next = [...blocks];
    next.splice(at, 0, newBlock(type, crypto.randomUUID()));
    patchBlocks(next);
  }

  function save() {
    if (fields.companyName.trim() === "") {
      setMessage({ ok: false, text: "Add the company name in Details." });
      return;
    }
    const data = toFormData(fields, blocks);
    const snapshot = JSON.stringify([fields, blocks]);
    startTransition(async () => {
      try {
        if (isNew) {
          const created = await createDealAction(data);
          if (created.ok) {
            router.push(`/operate/${created.id}`);
            return;
          }
          setMessage({ ok: false, text: created.error });
          return;
        }
        const result = await saveDealAction(deal.id, data);
        if (result.ok) {
          setSaved(snapshot);
          setMessage({ ok: true, text: result.notice ?? "Saved." });
          router.refresh();
        } else {
          setMessage({ ok: false, text: result.error });
        }
      } catch {
        setMessage({ ok: false, text: "Could not save. Sign in again and retry." });
      }
    });
  }

  async function onLinkedInBlur() {
    const raw = fields.linkedinUrl.trim();
    if (!raw) {
      patch({ avatarUrl: null, companyLogoUrl: null });
      return;
    }
    const result = await lookupLinkedInAction(raw);
    if (!result.ok) {
      setMessage({ ok: false, text: result.error });
      return;
    }
    if (result.limited) {
      patch({ contactName: fields.contactName.trim() === "" ? result.name : fields.contactName });
      setMessage({ ok: true, text: "LinkedIn is not showing a public profile. The name comes from the link." });
      return;
    }
    patch({
      contactName: result.name,
      contactRole: result.headline || fields.contactRole,
      companyName: result.company || fields.companyName,
      avatarUrl: result.avatarUrl,
      companyLogoUrl: result.companyLogoUrl,
    });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function renderLineName(line: LetterLine, index: number, term: LetterTerm) {
    const row = fields.lines[index];
    if (!row) return undefined;
    const where = `${row.serviceName || "service"}, ${term.label.toLowerCase()}`;
    const approved = approvedService(row.serviceName);
    return (
      <span className="operate-letter__offer">
        {approved ? (
          <span className="operate-letter__service">{approved.name}</span>
        ) : (
          <GrowingText
            label={`Service name, line ${index + 1}, ${term.label.toLowerCase()}`}
            value={row.serviceName}
            placeholder="Service"
            className="operate-letter__service text-inherit"
            onChange={(serviceName) => patchLine(index, { serviceName })}
          />
        )}
        <span className="operate-letter__hours flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`Hours per week, ${where}: ${row.hours}`}
                className="h-6 border-0 border-b border-dashed border-foreground/40 bg-transparent p-0 tabular-nums text-inherit outline-none focus-visible:border-orange data-[state=open]:border-orange"
              >
                {row.hours}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-36">
              {SHEET_HOURS.map((hours) => (
                <DropdownMenuItem
                  key={hours}
                  onSelect={() => patchLine(index, { hours: String(hours) })}
                  className="tabular-nums"
                >
                  <Check aria-hidden="true" className={row.hours === String(hours) ? undefined : "invisible"} />
                  {hours} hrs / week
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          hrs / week
          {fields.lines.length > 1 ? (
            <button
              type="button"
              aria-label={`Remove ${where}`}
              onClick={() => removeLine(index)}
              className="ml-2 flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Trash2 aria-hidden="true" className="size-3.5" />
            </button>
          ) : null}
        </span>
        {approved ? <span className="operate-letter__description">{approved.description}</span> : null}
      </span>
    );
  }

  const clientParty = (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Client details"
          className="operate-letter__party rounded-sm text-left outline-dashed outline-1 outline-offset-8 outline-transparent transition-[outline-color] hover:outline-foreground/30 focus-visible:outline-orange"
        >
          <ToParty
            companyName={fields.companyName}
            contactName={contactFullName(fields.contactName, fields.linkedinUrl)}
            contactRole={fields.contactRole}
            editable
          />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="grid w-96 gap-3">
        <Field label="LinkedIn" note="Name, role, company, and logos come from the public page.">
          <Input
            type="url"
            placeholder="https://www.linkedin.com/in/…"
            value={fields.linkedinUrl}
            onChange={(event) => patch({ linkedinUrl: event.target.value })}
            onBlur={() => void onLinkedInBlur()}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Contact name">
            <Input value={fields.contactName} onChange={(event) => patch({ contactName: event.target.value })} />
          </Field>
          <Field label="Contact role">
            <Input value={fields.contactRole} onChange={(event) => patch({ contactRole: event.target.value })} />
          </Field>
        </div>
        <Field label="Company">
          <Input required value={fields.companyName} onChange={(event) => patch({ companyName: event.target.value })} />
        </Field>
        <Field label="Company website" note="The company name in the pipeline opens this.">
          <Input
            inputMode="url"
            placeholder="amplifier.health"
            value={fields.companyUrl}
            onChange={(event) => patch({ companyUrl: event.target.value })}
          />
        </Field>
      </PopoverContent>
    </Popover>
  );
  const parties = (
    <PartiesView
      companyName={fields.companyName}
      contactName={fields.contactName}
      contactRole={fields.contactRole}
      to={clientParty}
    />
  );

  function renderBlock(block: LetterBlock) {
    if (block.type === "greeting") {
      return (
        <IntroView
          greeting={
            <GreetingEditor
              text={block.text}
              companyName={fields.companyName}
              onChange={(text) => patchBlocks(blocks.map((item) => (item.id === block.id ? { ...block, text } : item)))}
            />
          }
          parties={parties}
        />
      );
    }
    if (block.type === "message") {
      return (
        <MessageEditor
          text={block.text}
          companyName={fields.companyName}
          onChange={(text) => patchBlocks(blocks.map((item) => (item.id === block.id ? { ...block, text } : item)))}
        />
      );
    }
    if (block.type === "offers") {
      return (
        <OffersView
          deal={letter}
          mode="preview"
          renderName={(line, index, term) => renderLineName(line, index, term)}
          renderAddLine={(term) => (
            <AddServiceMenu
              label={`Add service, ${term.label.toLowerCase()}`}
              disabled={fields.lines.length >= MAX_LINES}
              onAdd={addLine}
            />
          )}
        />
      );
    }
    return <hr className="operate-letter__divider" />;
  }

  const toolbar = (
    <>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 border-dashed" aria-label="Staff only">
              <Lock aria-hidden="true" className="size-4" />
              <span className="hidden lg:inline">Staff only</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="grid w-96 gap-3">
            <p className="text-xs text-muted-foreground">Not shown to the client. Ownership percentages are.</p>
            <Field label="Round">
              <Input value={fields.round} onChange={(event) => patch({ round: event.target.value })} />
            </Field>
            <Field label="Valuation ($, whole dollars)" note="Ownership shows on the letter once there is a valuation.">
              <Input
                inputMode="numeric"
                value={fields.valuationDollars}
                onChange={(event) => patch({ valuationDollars: event.target.value })}
              />
            </Field>
            <div role="group" aria-label="Valuation basis" className="flex gap-2">
              {(["pre", "post"] as const).map((basis) => (
                <button
                  key={basis}
                  type="button"
                  aria-pressed={fields.valuationBasis === basis}
                  onClick={() => patch({ valuationBasis: basis })}
                  className={`${chip} ${fields.valuationBasis === basis ? "border-foreground text-foreground" : "text-muted-foreground"}`}
                >
                  {basis === "pre" ? "Pre-money" : "Post-money"}
                </button>
              ))}
            </div>
            <Field
              label="Equity basis"
              note={resolvedBasis(fields) === "percent" ? "Ownership rounds up to a whole percent." : undefined}
            >
              <select
                value={fields.equityBasis}
                onChange={(event) => {
                  const value = event.target.value;
                  patch({ equityBasis: isEquityBasis(value) ? value : "" });
                }}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">From the round: {equityBasisLabel(defaultEquityBasis(fields.round))}</option>
                {EQUITY_BASES.map((basis) => (
                  <option key={basis} value={basis}>
                    {equityBasisLabel(basis)}
                  </option>
                ))}
              </select>
            </Field>
            {resolvedBasis(fields) === "multiplier" ? (
              <Field label="Multiplier (×)" note="Each equity dollar counts this many times toward ownership.">
                <Input
                  inputMode="decimal"
                  value={fields.equityMultiplier}
                  onChange={(event) => patch({ equityMultiplier: event.target.value })}
                />
              </Field>
            ) : null}
            <Field label="Cash floor ($/hr)" note="For six months. One year can go $20 under it.">
              <Input
                inputMode="decimal"
                value={fields.cashFloorDollars}
                onChange={(event) => patch({ cashFloorDollars: event.target.value })}
              />
            </Field>
            {floor < MIN_CASH_RATE_CENTS ? (
              <p role="alert" className="text-xs text-orange">
                Under Bloom&rsquo;s {formatDollars(MIN_CASH_RATE_CENTS)}/hr floor. Keep this for deals James has approved.
              </p>
            ) : null}
            <Field label="Hourly cost ($)">
              <Input
                inputMode="decimal"
                value={fields.hourlyCostDollars}
                onChange={(event) => patch({ hourlyCostDollars: event.target.value })}
              />
            </Field>
          </PopoverContent>
        </Popover>

        <div className="ml-auto flex items-center gap-3">
          {message ? (
            <span
              role="status"
              className={`max-w-[18rem] truncate text-sm ${message.ok ? "text-muted-foreground" : "text-orange"}`}
              title={message.text}
            >
              {message.text}
            </span>
          ) : dirty ? (
            <span className="hidden text-sm text-muted-foreground md:inline">Unsaved changes</span>
          ) : deal.packageRequestedAt ? (
            <span className="hidden text-sm text-muted-foreground md:inline">
              Package requested {requestedOn(deal.packageRequestedAt)}
            </span>
          ) : null}
          <div className="flex items-center gap-2">
            {isNew ? null : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="size-9 px-0"
                  aria-label={copied ? "Copied" : "Copy link"}
                  title={copied ? "Copied" : "Copy link"}
                  onClick={() => void copyLink()}
                  disabled={!origin}
                >
                  {copied ? (
                    <Check aria-hidden="true" className="size-4" />
                  ) : (
                    <Link2 aria-hidden="true" className="size-4" />
                  )}
                </Button>
                <Button asChild variant="outline" size="sm" className="size-9 px-0">
                  <a
                    href={`/operate/d/${deal.token}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Open as client"
                    title="Open as client"
                  >
                    <ExternalLink aria-hidden="true" className="size-4" />
                  </a>
                </Button>
              </>
            )}
            <Button size="sm" onClick={save} disabled={pending || (!isNew && !dirty)}>
              {pending ? "Saving" : isNew ? "Create deal" : "Save"}
            </Button>
          </div>
        </div>
    </>
  );

  return (
    <div className="min-h-full">
      {slot ? createPortal(<>{toolbar}</>, slot) : null}
      <div className="sticky top-12 z-10 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border bg-background/95 px-4 py-2 backdrop-blur">
        <div className="flex flex-1 basis-0">
          <label className="flex shrink-0 items-center gap-2 whitespace-nowrap">
            <span className="operate-label text-[11px] text-muted-foreground">Starts</span>
            <input
              type="date"
              required
              value={fields.startDate}
              onChange={(event) => patch({ startDate: event.target.value })}
              onClick={(event) => {
                try {
                  event.currentTarget.showPicker();
                } catch {
                  // Some frames block the picker; the date can still be typed.
                }
              }}
              className="h-7 cursor-pointer rounded-md border-0 bg-transparent px-1.5 text-sm tabular-nums transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-calendar-picker-indicator]:hidden"
            />
          </label>
        </div>
        <div role="group" aria-label="Terms offered" className="flex shrink-0 gap-1.5">
          {CLIENT_TERMS.map((term) => {
            const on = offered.includes(term);
            return (
              <button
                key={term}
                type="button"
                aria-pressed={on}
                onClick={() => toggleTerm(term)}
                className={`${chip} ${on ? "border-foreground bg-foreground text-background hover:border-foreground" : "text-muted-foreground"}`}
              >
                {termLabel(term)}
              </button>
            );
          })}
        </div>
        <div className="flex flex-1 basis-0 items-center justify-end gap-1.5">
          <EquityMenu
            enabled={fields.equityEnabled}
            steps={equityOptions.steps}
            terms={equityOptions.terms}
            selectedCents={letter.selectedEquityCents}
            floorCents={floor}
            onChange={patch}
          />
        </div>
      </div>

      <LetterFrame companyName={fields.companyName} companyLogoUrl={fields.companyLogoUrl} canvas>
        {blocks.some((block) => block.type === "greeting") ? null : (
          <section className="operate-letter__block">
            <IntroView parties={parties} />
          </section>
        )}
        {blocks.length === 0 ? (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <AddBlockMenu blocks={blocks} onAdd={(type) => addBlock(type, 0)} label="Add a block" />
            The letter is empty. Add a block.
          </div>
        ) : null}
        {blocks.map((block, index) => (
          <section key={block.id} className={`${blockClassName(block)} ${blockShell}`}>
            <div className="absolute -left-14 top-0 flex flex-col gap-0.5 opacity-0 transition-opacity group-hover/block:opacity-100 group-focus-within/block:opacity-100">
              <button
                type="button"
                className={gutterButton}
                aria-label={`Move ${blockLabel(block.type)} up`}
                disabled={index === 0}
                onClick={() => patchBlocks(moveBlock(blocks, index, -1))}
              >
                <ArrowUp aria-hidden="true" className="size-4" />
              </button>
              <button
                type="button"
                className={gutterButton}
                aria-label={`Move ${blockLabel(block.type)} down`}
                disabled={index === blocks.length - 1}
                onClick={() => patchBlocks(moveBlock(blocks, index, 1))}
              >
                <ArrowDown aria-hidden="true" className="size-4" />
              </button>
              <button
                type="button"
                className={gutterButton}
                aria-label={`Remove ${blockLabel(block.type)}`}
                onClick={() => patchBlocks(blocks.filter((item) => item.id !== block.id))}
              >
                <Trash2 aria-hidden="true" className="size-4" />
              </button>
            </div>
            {renderBlock(block)}
            <div className="absolute -bottom-[38px] left-1/2 z-10 -translate-x-1/2 opacity-0 transition-opacity group-hover/block:opacity-100 group-focus-within/block:opacity-100 has-[[data-state=open]]:opacity-100">
              <AddBlockMenu
                blocks={blocks}
                onAdd={(type) => addBlock(type, index + 1)}
                label={`Add a block after ${blockLabel(block.type)}`}
              />
            </div>
          </section>
        ))}
      </LetterFrame>
    </div>
  );
}

