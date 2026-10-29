"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ExternalLink, Link2, Lock, Plus, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { blockClassName, GreetingView, LetterFrame, OffersView } from "@/components/operate/DealLetter";
import {
  BLOCK_TYPES,
  blockLabel,
  canAddBlock,
  greetingForEditing,
  greetingFromEditing,
  moveBlock,
  newBlock,
  type BlockType,
  type LetterBlock,
} from "@/lib/operate/blocks";
import { termLabel, toLetterPackage, type LetterDeal, type TermLength } from "@/lib/operate/pricing";
import { createDealAction, lookupLinkedInAction, saveDealAction } from "@/app/operate/actions";

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
  ratesOverridden: boolean;
  baseRates: { serviceName: string; hoursPerWeek: number; listRateCents: number; cashRateCents: number }[];
  termLength: TermLength;
  round: string;
  valuationDollars: string;
  hourlyCostCents: number | null;
  selectedPackageId: string | null;
  packages: {
    id: string;
    serviceName: string;
    hoursPerWeek: number;
    enabled: boolean;
    listRateCents: number;
    cashRateCents: number;
  }[];
};

type PackageFields = {
  id: string;
  enabled: boolean;
  serviceName: string;
  hours: string;
  listRate: string;
  cashRate: string;
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
  ratesOverridden: boolean;
  termLength: TermLength;
  round: string;
  valuationDollars: string;
  hourlyCostDollars: string;
  packages: [PackageFields, PackageFields];
};

const TERMS: TermLength[] = ["six-month", "one-year", "multi-year"];

function centsToDollars(cents: number): string {
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
}

function dollarsToCents(raw: string): number {
  const cents = Math.round(Number(raw.replace(/[$,\s]/g, "")) * 100);
  return Number.isFinite(cents) ? cents : 0;
}

function packageFields(pkg: EditorDeal["packages"][number] | undefined, hours: number): PackageFields {
  if (!pkg) {
    return { id: "", enabled: true, serviceName: "", hours: String(hours), listRate: "", cashRate: "" };
  }
  return {
    id: pkg.id,
    enabled: pkg.enabled,
    serviceName: pkg.serviceName,
    hours: String(pkg.hoursPerWeek),
    listRate: centsToDollars(pkg.listRateCents),
    cashRate: centsToDollars(pkg.cashRateCents),
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
    ratesOverridden: deal.ratesOverridden,
    termLength: deal.termLength,
    round: deal.round,
    valuationDollars: deal.valuationDollars,
    hourlyCostDollars: deal.hourlyCostCents === null ? "" : centsToDollars(deal.hourlyCostCents),
    packages: [packageFields(deal.packages[0], 40), packageFields(deal.packages[1], 80)],
  };
}

function rowId(row: PackageFields, index: number): string {
  return row.id || `new-${index}`;
}

function previewLetter(fields: Fields, blocks: LetterBlock[], selectedPackageId: string | null): LetterDeal {
  const hours = (raw: string) => {
    const value = Number(raw);
    return Number.isInteger(value) && value > 0 ? value : 0;
  };
  const rows = fields.packages.filter((row) => row.enabled);
  return {
    blocks,
    companyName: fields.companyName,
    companyLogoUrl: fields.companyLogoUrl,
    contactName: fields.contactName,
    avatarUrl: fields.avatarUrl,
    termLabel: termLabel(fields.termLength),
    equityEnabled: fields.equityEnabled,
    packages: rows.map((row, index) =>
      toLetterPackage({
        id: rowId(row, index),
        serviceName: row.serviceName,
        hoursPerWeek: hours(row.hours),
        listRateCents: dollarsToCents(row.listRate),
        cashRateCents: dollarsToCents(row.cashRate),
      }),
    ),
    selectedPackageId: rows.some((row) => row.id !== "" && row.id === selectedPackageId) ? selectedPackageId : null,
  };
}

function toFormData(fields: Fields, blocks: LetterBlock[]): FormData {
  const data = new FormData();
  data.set("companyName", fields.companyName);
  data.set("contactName", fields.contactName);
  data.set("contactRole", fields.contactRole);
  data.set("linkedinUrl", fields.linkedinUrl);
  data.set("companyUrl", fields.companyUrl);
  data.set("termLength", fields.termLength);
  data.set("round", fields.round);
  data.set("valuationDollars", fields.valuationDollars);
  data.set("hourlyCostDollars", fields.hourlyCostDollars);
  if (fields.equityEnabled) data.set("equityEnabled", "on");
  if (fields.ratesOverridden) data.set("ratesOverridden", "on");
  fields.packages.forEach((row, index) => {
    data.set(`package${index}Id`, row.id);
    data.set(`package${index}ListRate`, row.listRate);
    data.set(`package${index}CashRate`, row.cashRate);
  });
  data.set("letterBlocks", JSON.stringify(blocks));
  return data;
}

const gutterButton =
  "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30";

const blockShell =
  "group/block relative rounded-sm outline outline-1 outline-offset-[12px] outline-transparent transition-[outline-color] hover:outline-foreground/15 focus-within:outline-foreground/25";

const chip =
  "operate-label inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-[11px] transition-colors hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

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

function RateInput({ value, label, onChange }: { value: string; label: string; onChange: (value: string) => void }) {
  return (
    <span className="inline-flex items-baseline font-semibold tabular-nums">
      $
      <input
        type="text"
        inputMode="decimal"
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-16 border-0 border-b border-dashed border-foreground/40 bg-transparent p-0 text-right font-semibold tabular-nums text-inherit outline-none focus:border-orange"
      />
    </span>
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

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const letter = useMemo(
    () => previewLetter(fields, blocks, deal.selectedPackageId),
    [fields, blocks, deal.selectedPackageId],
  );
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

  function patchPackage(index: number, next: Partial<PackageFields>) {
    setFields((current) => {
      const rows: [PackageFields, PackageFields] = [current.packages[0], current.packages[1]];
      rows[index] = { ...rows[index], ...next };
      return { ...current, packages: rows };
    });
    setMessage(null);
  }

  function setCustomRates(on: boolean) {
    if (on) {
      patch({ ratesOverridden: true });
      return;
    }
    const packages = fields.packages.map((row, index) => {
      const base = deal.baseRates[index];
      if (!base) return row;
      return {
        ...row,
        serviceName: base.serviceName,
        hours: String(base.hoursPerWeek),
        listRate: centsToDollars(base.listRateCents),
        cashRate: centsToDollars(base.cashRateCents),
      };
    }) as [PackageFields, PackageFields];
    patch({ ratesOverridden: false, packages });
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

  function renderBlock(block: LetterBlock) {
    if (block.type === "greeting") {
      return (
        <GreetingEditor
          text={block.text}
          companyName={fields.companyName}
          onChange={(text) => patchBlocks(blocks.map((item) => (item.id === block.id ? { ...block, text } : item)))}
        />
      );
    }
    if (block.type === "term") {
      return (
        <label className="relative inline-flex items-center">
          <span className="sr-only">Term</span>
          <select
            value={fields.termLength}
            onChange={(event) => patch({ termLength: event.target.value as TermLength })}
            className="operate-letter__term cursor-pointer appearance-none border-0 border-b border-dashed border-foreground/30 bg-transparent py-0 pl-0 pr-6 text-inherit outline-none focus:border-orange"
          >
            {TERMS.map((term) => (
              <option key={term} value={term}>
                {termLabel(term)}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-0 size-4 text-muted-foreground" />
        </label>
      );
    }
    if (block.type === "offers") {
      return (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={fields.ratesOverridden}
              onClick={() => setCustomRates(!fields.ratesOverridden)}
              className={`${chip} ${fields.ratesOverridden ? "border-orange text-orange" : "text-muted-foreground"}`}
            >
              Custom rates {fields.ratesOverridden ? "on" : "off"}
            </button>
            <button
              type="button"
              aria-pressed={fields.equityEnabled}
              onClick={() => patch({ equityEnabled: !fields.equityEnabled })}
              className={`${chip} ${fields.equityEnabled ? "border-orange text-orange" : "text-muted-foreground"}`}
            >
              Equity {fields.equityEnabled ? "on" : "off"}
            </button>
          </div>
          <OffersView
            deal={letter}
            mode="preview"
            renderRate={(pkg) => {
              if (!fields.ratesOverridden) return undefined;
              const index = fields.packages.findIndex((row, i) => rowId(row, i) === pkg.id);
              if (index < 0) return undefined;
              const row = fields.packages[index];
              const name = `${row.hours} hours`;
              return (
                <span className="operate-letter__pair">
                  {fields.equityEnabled ? (
                    <>
                      <span className="operate-letter__struck">
                        <RateInput value={row.listRate} label={`List rate, ${name}`} onChange={(listRate) => patchPackage(index, { listRate })} />
                      </span>
                      <RateInput value={row.cashRate} label={`Cash rate, ${name}`} onChange={(cashRate) => patchPackage(index, { cashRate })} />
                    </>
                  ) : (
                    <RateInput value={row.listRate} label={`Rate, ${name}`} onChange={(listRate) => patchPackage(index, { listRate })} />
                  )}
                </span>
              );
            }}
          />
          {!fields.ratesOverridden ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Baseline rates. Turn on custom rates to change them for this deal.
            </p>
          ) : null}
        </>
      );
    }
    return <hr className="operate-letter__divider" />;
  }

  return (
    <div className="min-h-full">
      <div className="sticky top-12 z-10 flex flex-wrap items-center gap-2 border-b border-border bg-background/95 px-4 py-2 backdrop-blur">
        <Link href="/operate" className="operate-label mr-2 text-[11px] text-muted-foreground hover:text-foreground">
          All deals
        </Link>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <UserRound aria-hidden="true" className="size-4" />
              Details
            </Button>
          </PopoverTrigger>
          <PopoverContent className="grid w-96 gap-3">
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

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 border-dashed">
              <Lock aria-hidden="true" className="size-4" />
              Staff only
            </Button>
          </PopoverTrigger>
          <PopoverContent className="grid gap-3">
            <p className="text-xs text-muted-foreground">Not shown to the client.</p>
            <Field label="Round">
              <Input value={fields.round} onChange={(event) => patch({ round: event.target.value })} />
            </Field>
            <Field label="Valuation ($, whole dollars)">
              <Input
                inputMode="numeric"
                value={fields.valuationDollars}
                onChange={(event) => patch({ valuationDollars: event.target.value })}
              />
            </Field>
            <Field label="Hourly cost ($)">
              <Input
                inputMode="decimal"
                value={fields.hourlyCostDollars}
                onChange={(event) => patch({ hourlyCostDollars: event.target.value })}
              />
            </Field>
          </PopoverContent>
        </Popover>

        {isNew ? null : (
          <>
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => void copyLink()} disabled={!origin}>
              <Link2 aria-hidden="true" className="size-4" />
              {copied ? "Copied" : "Copy link"}
            </Button>
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <a href={`/operate/d/${deal.token}`} target="_blank" rel="noreferrer">
                <ExternalLink aria-hidden="true" className="size-4" />
                Open as client
              </a>
            </Button>
          </>
        )}

        <div className="ml-auto flex items-center gap-3">
          {message ? (
            <span role="status" className={`text-sm ${message.ok ? "text-muted-foreground" : "text-orange"}`}>
              {message.text}
            </span>
          ) : dirty ? (
            <span className="text-sm text-muted-foreground">Unsaved changes</span>
          ) : null}
          <Button size="sm" onClick={save} disabled={pending || (!isNew && !dirty)}>
            {pending ? "Saving" : isNew ? "Create deal" : "Save"}
          </Button>
        </div>
      </div>

      <LetterFrame companyName={fields.companyName} companyLogoUrl={fields.companyLogoUrl} canvas>
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

