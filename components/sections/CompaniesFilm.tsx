"use client";

import type { Ref } from "react";

/**
 * Frames 187:181, 210:404, and 227:182, on a 1920×1080 stage.
 * Scroll plays the first into the second, then settles on the third.
 */
const SPLIT = 0.78;

const CARD_W = 476;
const CARD_H = 740;

type Spot = { x: number; y: number; opacity: number };

type Card = {
  id: string;
  name: string;
  year: string;
  roles: string[];
  image: string;
  ink: boolean;
  detail?: string;
  a: Spot;
  b: Spot;
  c: Spot;
};

const ROW: Card[] = [
  {
    id: "watchcheck",
    name: "WatchCheck",
    year: "2023",
    roles: ["studio", "invested", "seed"],
    image: "/companies/watchcheck.png",
    ink: false,
    detail: "A platform that makes luxury watch service safer, smarter, and more transparent.",
    a: { x: 1468, y: 205, opacity: 1 },
    b: { x: 236, y: 205, opacity: 1 },
    c: { x: 236, y: 185, opacity: 1 },
  },
  {
    id: "feno",
    name: "Feno",
    year: "2026",
    roles: ["studio"],
    image: "/companies/feno.png",
    ink: true,
    a: { x: 2056, y: 205, opacity: 0.7 },
    b: { x: 728, y: 205, opacity: 1 },
    c: { x: 748, y: 205, opacity: 0.7 },
  },
  {
    id: "milly",
    name: "Milly",
    year: "2026",
    roles: ["studio"],
    image: "/companies/milly.jpg",
    ink: true,
    a: { x: 2649, y: 205, opacity: 0.4 },
    b: { x: 1220, y: 205, opacity: 1 },
    c: { x: 1248, y: 205, opacity: 0.7 },
  },
  {
    id: "orion",
    name: "Orion",
    year: "2026",
    roles: ["studio"],
    image: "/companies/orion.png",
    ink: false,
    a: { x: 3313, y: 205, opacity: 0.2 },
    b: { x: 1712, y: 205, opacity: 1 },
    c: { x: 1752, y: 205, opacity: 0.7 },
  },
];

const CARDS: Card[] = [...ROW, ...ROW.map((card) => ({ ...card, id: `${card.id}-2`, detail: undefined }))];

const MONO = "var(--font-jetbrains), ui-monospace, monospace";
const SANS = "var(--font-archivo), sans-serif";

function settleOf(t: number) {
  if (t <= SPLIT) return 0;
  return (t - SPLIT) / (1 - SPLIT);
}

type FilmNodes = {
  cards: HTMLElement[];
};

const cache = new WeakMap<HTMLElement, FilmNodes>();

function readNodes(root: HTMLElement): FilmNodes | null {
  const cards = [...root.querySelectorAll<HTMLElement>("[data-film-card]")];
  if (cards.length !== CARDS.length) return null;
  const cached = cache.get(root);
  if (cached && cached.cards.length === cards.length) return cached;
  const nodes = { cards };
  cache.set(root, nodes);
  return nodes;
}

function pin(el: HTMLElement, x: number, y: number) {
  el.style.position = "absolute";
  el.style.left = "0";
  el.style.top = "0";
  el.style.margin = "0";
  el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

/** How many cards fit across the screen. The rest of the row is scrolled into view. */
const VISIBLE = ROW.length;

/** Cards stay at this size. `t` 0 holds the row off the right. `t` 1 brings the last card in. */
export function filmFrame(t: number, vw: number, vh: number) {
  const clamped = Math.max(0, Math.min(1, t));
  const cardW = vw / VISIBLE;
  const cardH = cardW * (CARD_H / CARD_W);
  const rowW = cardW * CARDS.length;
  const rowX = vw - rowW * clamped;
  const rowY = Math.max(0, (vh - cardH) / 2);
  return { cardW, cardH, rowX, rowY, rowW };
}

/** `t` 0 holds the row off the right. `t` 1 is the row at full viewport width. */
export function placeFilm(root: HTMLElement, t: number, vw: number, vh: number) {
  const nodes = readNodes(root);
  if (!nodes) return;
  const frame = filmFrame(t, vw, vh);
  const s = frame.cardW / CARD_W;
  const settle = settleOf(t);
  const stage = root.querySelector<HTMLElement>("[data-film='stage']");
  if (stage) {
    stage.style.position = "absolute";
    stage.style.inset = "0";
    stage.style.height = "100%";
    stage.style.display = "block";
  }

  nodes.cards.forEach((card, index) => {
    const spec = CARDS[index];
    card.style.width = `${frame.cardW}px`;
    card.style.height = `${frame.cardH}px`;
    card.style.opacity = "1";
    card.style.zIndex = spec.detail && settle > 0 ? "2" : "1";
    card.style.boxShadow =
      spec.detail && settle > 0 ? `0 ${47 * s}px ${67.4 * s}px rgba(68,53,15,${0.3 * settle})` : "none";
    pin(card, frame.rowX + index * frame.cardW, frame.rowY);

    const detail = card.querySelector<HTMLElement>("[data-film='detail']");
    if (detail) detail.style.opacity = String(settle);
    const note = card.querySelector<HTMLElement>("[data-film='note']");
    if (note) {
      note.style.opacity = String(settle);
      note.style.width = `${396 * s}px`;
      note.style.left = `${40 * s}px`;
      note.style.top = `${95 * s}px`;
    }
    const labels = card.querySelector<HTMLElement>("[data-film='labels']");
    if (labels) {
      labels.style.fontSize = `${14 * s}px`;
      labels.style.color = spec.detail && settle > 0.5 ? "#070F18" : spec.ink ? "#070F18" : "#FAF6EC";
    }
    const name = card.querySelector<HTMLElement>("[data-film='name']");
    if (name) name.style.fontSize = `${48 * s}px`;
  });
}

/** Reduced motion renders the settled row in normal flow. */
export function restFilm(root: HTMLElement) {
  const nodes = readNodes(root);
  if (!nodes) return;
  const stage = root.querySelector<HTMLElement>("[data-film='stage']");
  if (stage) {
    stage.style.position = "relative";
    stage.style.inset = "auto";
    stage.style.height = "auto";
    stage.style.display = "flex";
    stage.style.flexDirection = "column";
    stage.style.gap = "1.5rem";
    stage.style.padding = "6rem 1.5rem 3rem";
  }
  for (const el of nodes.cards) {
    el.style.position = "relative";
    el.style.transform = "none";
    el.style.left = "auto";
    el.style.top = "auto";
    el.style.opacity = "1";
    el.style.boxShadow = "none";
  }
  const row = root.querySelector<HTMLElement>("[data-film='row']");
  if (row) {
    row.style.display = "flex";
    row.style.flexWrap = "wrap";
    row.style.gap = "1rem";
  }
  for (const card of nodes.cards) {
    card.style.width = "min(476px, 100%)";
    card.style.height = "auto";
    card.style.aspectRatio = "476 / 740";
    const detail = card.querySelector<HTMLElement>("[data-film='detail']");
    if (detail) detail.style.opacity = "1";
  }
}

export function CompaniesFilm({ rootRef }: { rootRef: Ref<HTMLDivElement> }) {
  return (
    <div ref={rootRef} className="invisible absolute inset-0 z-40 overflow-hidden text-ink">
      <div data-film="stage" className="relative h-full">
        <div data-film="row">
          {CARDS.map((card) => (
            <article key={card.id} data-film-card={card.id} className="overflow-hidden rounded-[4px] bg-white">
              <img src={card.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
              {card.detail ? (
                <img
                  data-film="note"
                  src="/companies/watchcheck-note.svg"
                  alt=""
                  className="pointer-events-none absolute opacity-0"
                />
              ) : null}
              <div className="relative flex h-full flex-col justify-between p-6 mobile:p-10">
                <div
                  data-film="labels"
                  className="flex items-start justify-between uppercase leading-[1.4]"
                  style={{ fontFamily: MONO, color: card.ink ? "#070F18" : "#FAF6EC" }}
                >
                  <span>{card.year}</span>
                  <span className="flex gap-4">
                    {card.roles.map((role) => (
                      <span key={role}>{role}</span>
                    ))}
                  </span>
                </div>
                <div style={{ color: card.ink ? "#070F18" : "#FAF6EC" }}>
                  <p data-film="name" className="leading-none" style={{ fontFamily: SANS, fontSize: 48 }}>
                    {card.name}
                  </p>
                  {card.detail ? (
                    <div data-film="detail" className="mt-2 opacity-0">
                      <p className="max-w-[396px] text-[16px] leading-none" style={{ fontFamily: SANS }}>
                        {card.detail}
                      </p>
                      <img src="/companies/press-logos.svg" alt="" className="mt-4 h-6 w-16" />
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
