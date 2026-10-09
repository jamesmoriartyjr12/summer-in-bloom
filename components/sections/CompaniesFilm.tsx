"use client";

import { useEffect, type Ref } from "react";

/**
 * Frames 187:181 and 210:404, on a 1920×1080 stage.
 * Scroll carries the row in. Frame 227:182 is the hover of a card.
 * The hover uses the scene duration and the media ease from design/MOTION.md.
 */
const HOVER_MS = 480;
const HOVER_EASE = [0.22, 1, 0.36, 1] as const;

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

const CARDS: Card[] = [...ROW, ...ROW.map((card) => ({ ...card, id: `${card.id}-2` }))];

const MONO = "var(--font-jetbrains), ui-monospace, monospace";
const SANS = "var(--font-archivo), sans-serif";

function easeMedia(t: number) {
  const [x1, y1, x2, y2] = HOVER_EASE;
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (u: number) => ((ax * u + bx) * u + cx) * u;
  const sampleY = (u: number) => ((ay * u + by) * u + cy) * u;
  const sampleDX = (u: number) => (3 * ax * u + 2 * bx) * u + cx;
  let u = t;
  for (let i = 0; i < 6; i++) {
    const slope = sampleDX(u);
    if (Math.abs(slope) < 1e-6) break;
    u = Math.min(1, Math.max(0, u - (sampleX(u) - t) / slope));
  }
  return sampleY(u);
}

type FilmPose = { root: HTMLElement; t: number; vw: number; vh: number };

let live = false;
let pose: FilmPose | null = null;
let shownId: string | null = null;
let hoverFrom = 0;
let hoverTo = 0;
let hoverStart = 0;
let hoverRaf = 0;

function hoverAmount(now = performance.now()) {
  const p = Math.min(1, (now - hoverStart) / HOVER_MS);
  return hoverFrom + (hoverTo - hoverFrom) * easeMedia(p);
}

function paintPose(now?: number) {
  if (!live || !pose) return;
  paint(pose.root, pose.t, pose.vw, pose.vh, hoverAmount(now));
}

function setHover(id: string | null) {
  if (!live) return;
  const now = performance.now();
  if (id && id !== shownId) {
    shownId = id;
    hoverFrom = 0;
    hoverTo = 1;
  } else if (!id) {
    if (hoverTo === 0) return;
    hoverFrom = hoverAmount(now);
    hoverTo = 0;
  } else {
    return;
  }
  hoverStart = now;
  cancelAnimationFrame(hoverRaf);
  const step = (time: number) => {
    paintPose(time);
    if (time - hoverStart < HOVER_MS) hoverRaf = requestAnimationFrame(step);
  };
  hoverRaf = requestAnimationFrame(step);
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
  live = true;
  pose = { root, t, vw, vh };
  paint(root, t, vw, vh, hoverAmount());
}

function paint(root: HTMLElement, t: number, vw: number, vh: number, amount: number) {
  const nodes = readNodes(root);
  if (!nodes) return;
  const frame = filmFrame(t, vw, vh);
  const s = frame.cardW / CARD_W;
  const stage = root.querySelector<HTMLElement>("[data-film='stage']");
  if (stage) {
    stage.style.position = "absolute";
    stage.style.inset = "0";
    stage.style.height = "100%";
    stage.style.display = "block";
  }

  nodes.cards.forEach((card, index) => {
    const spec = CARDS[index];
    const open = spec.id === shownId ? amount : 0;
    card.style.width = `${frame.cardW}px`;
    card.style.height = `${frame.cardH}px`;
    card.style.opacity = String(shownId && spec.id !== shownId ? 1 - 0.3 * amount : 1);
    card.style.zIndex = open > 0 ? "2" : "1";
    card.style.boxShadow = open > 0 ? `0 ${47 * s}px ${67.4 * s}px rgba(68,53,15,${0.3 * open})` : "none";
    pin(card, frame.rowX + index * frame.cardW, frame.rowY - 20 * s * open);

    const detail = card.querySelector<HTMLElement>("[data-film='detail']");
    if (detail) {
      detail.style.overflow = "hidden";
      detail.style.opacity = String(open);
      detail.style.marginTop = `${16 * s * open}px`;
      if (open <= 0) {
        detail.style.maxHeight = "0px";
      } else {
        detail.style.maxHeight = "none";
        const full = detail.scrollHeight;
        detail.style.maxHeight = `${full * open}px`;
      }
      const copy = detail.querySelector("p");
      if (copy) copy.style.fontSize = `${16 * s}px`;
      const logos = detail.querySelector("img");
      if (logos) {
        logos.style.height = `${23 * s}px`;
        logos.style.width = `${60.5 * s}px`;
        logos.style.marginTop = `${16 * s}px`;
      }
    }
    const note = card.querySelector<HTMLElement>("[data-film='note']");
    if (note) {
      const left = 387 + (40 - 387) * open;
      const top = 103 + (95 - 103) * open;
      const width = 39.436 + (396 - 39.436) * open;
      const height = 39.141 + (394.043 - 39.141) * open;
      note.style.opacity = "1";
      note.style.left = `${left * s}px`;
      note.style.top = `${top * s}px`;
      note.style.width = `${width * s}px`;
      note.style.height = `${height * s}px`;
    }
    const labels = card.querySelector<HTMLElement>("[data-film='labels']");
    if (labels) {
      labels.style.fontSize = `${14 * s}px`;
      labels.style.color = spec.detail && open > 0.5 ? "#070F18" : spec.ink ? "#070F18" : "#FAF6EC";
    }
    const name = card.querySelector<HTMLElement>("[data-film='name']");
    if (name) name.style.fontSize = `${48 * s}px`;
  });
}

/** Reduced motion renders the settled row in normal flow. */
export function restFilm(root: HTMLElement) {
  live = false;
  cancelAnimationFrame(hoverRaf);
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
    if (detail) {
      detail.style.opacity = "1";
      detail.style.maxHeight = "none";
      detail.style.marginTop = "16px";
    }
    const note = card.querySelector<HTMLElement>("[data-film='note']");
    if (note) note.style.opacity = "1";
  }
}

export function CompaniesFilm({ rootRef }: { rootRef: Ref<HTMLDivElement> }) {
  useEffect(() => {
    return () => {
      live = false;
      cancelAnimationFrame(hoverRaf);
    };
  }, []);

  return (
    <div ref={rootRef} className="invisible absolute inset-0 z-40 overflow-hidden text-ink">
      <div data-film="stage" className="relative h-full">
        <div data-film="row">
          {CARDS.map((card) => (
            <article
              key={card.id}
              data-film-card={card.id}
              tabIndex={0}
              className="overflow-hidden rounded-[4px] bg-white outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              onPointerEnter={(event) => {
                if (event.pointerType === "touch") return;
                setHover(card.id);
              }}
              onPointerLeave={(event) => {
                if (event.pointerType === "touch") return;
                setHover(null);
              }}
              onFocus={() => setHover(card.id)}
              onBlur={() => setHover(null)}
              onClick={() => {
                if (window.matchMedia("(hover: hover)").matches) return;
                setHover(shownId === card.id && hoverTo === 1 ? null : card.id);
              }}
            >
              <img src={card.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
              {card.detail ? (
                <img
                  data-film="note"
                  src="/companies/watchcheck-note.svg"
                  alt=""
                  className="pointer-events-none absolute opacity-0"
                />
              ) : null}
              <div className="pointer-events-none relative flex h-full flex-col justify-between p-6 mobile:p-10">
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
                    <div data-film="detail" className="max-h-0 overflow-hidden opacity-0">
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
