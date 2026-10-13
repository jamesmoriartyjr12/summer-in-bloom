"use client";

import { useEffect, type Ref } from "react";

/**
 * Frames 187:181 and 210:404, on a 1920×1080 stage.
 * Scroll carries the row in. Frame 227:34 is the rest of every card.
 * Frame 227:222 is the hover and the focus of a card.
 * The name rises, then the line springs in, and the labels wipe left to right.
 * Leaving plays that scene backward over the same span.
 * The wipe is one scene, on one layer of type. Paper sits under a white chip, so the ink cannot edge it.
 * The line spring is slow enough for the overshoot to read. design/MOTION.md.
 */
const HOVER_MS = 560;
const NAME_AT = { start: 0, span: 280 } as const;
const LINE_AT = { start: 80, span: 320 } as const;
const WIPE_AT = { start: 0, span: 480 } as const;
const MEDIA_EASE = [0.22, 1, 0.36, 1] as const;
const UI_EASE = [0.2, 0.8, 0.2, 1] as const;
/** Design pixels. A little past punchY so the overshoot is visible. */
const LINE_FROM = 16;
const LINE_SPRING = { stiffness: 160, damping: 8, mass: 0.7 } as const;

const CARD_W = 476;
const CARD_H = 740;

type Card = {
  id: string;
  name: string;
  stage: string;
  category: string;
  image: string;
  /** Frame 227:222. The photograph sits up and slightly wide of the card. */
  crop?: { height: string; width: string; left: string; top: string };
  ink: boolean;
  detail?: string;
};

const shot = (file: string) => `/Bloom%20Portfolio%20Images/${file}`;

const ROW: Card[] = [
  { id: "orion", name: "Orion", stage: "Seed", category: "Longevity", image: "/companies/orion.png", ink: false, detail: "An AI sleep system for deeper nights." },
  { id: "jamie", name: "Jamie Ai", stage: "Seed", category: "Creator", image: shot("Jamie_Large.png"), ink: false, detail: "Audience data, turned into content worth making." },
  { id: "meridian", name: "Meridian", stage: "Seed", category: "Payments", image: shot("Meridian_Large.png"), ink: false, detail: "Instant payments for banks, wallets, and neobanks." },
  { id: "sunny", name: "Sunny Benefits", stage: "Series A", category: "Fintech", image: shot("Sunny_Large.png"), ink: false, detail: "Every health benefit, in one member experience." },
  {
    id: "collectible",
    name: "Collectible",
    stage: "Seed",
    category: "Consumer",
    image: "/companies/watchcheck.png",
    crop: { height: "119.75%", width: "129.98%", left: "-0.02%", top: "-19.75%" },
    ink: false,
    detail: "The service layer for luxury watches.",
  },
  { id: "feno", name: "Feno", stage: "Seed", category: "Longevity", image: "/companies/feno.png", ink: true, detail: "Preventative dental care, powered by AI." },
  { id: "milly", name: "Milly", stage: "Seed", category: "Fintech", image: "/companies/milly.jpg", ink: true, detail: "Where insurance agencies change hands." },
  { id: "tee", name: "TeeCommerce", stage: "Acquired", category: "Commerce", image: shot("TeeCommerce_Large.png"), ink: false, detail: "Pro shops for the clubs that set the standard." },
  { id: "outer", name: "OuterProduct", stage: "Seed", category: "Deeptech", image: shot("OuterProduct_Large.png"), ink: false, detail: "Any dataset, turned into a decision." },
  { id: "fanfix", name: "FanFix", stage: "Growth", category: "Creator", image: shot("FanFix_Large.png"), ink: false, detail: "Creators get paid for exclusive access." },
];

const CARDS: Card[] = ROW;

const MONO = "var(--font-jetbrains), ui-monospace, monospace";
const SANS = "var(--font-archivo), sans-serif";

function bezier(ease: readonly [number, number, number, number], t: number) {
  const [x1, y1, x2, y2] = ease;
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
let pointerId: string | null = null;
let focusId: string | null = null;
let hoverFrom = 0;
let hoverTo = 0;
let hoverStart = 0;
let hoverSpan = HOVER_MS;
let hoverRaf = 0;
let lineY = LINE_FROM;
let lineV = 0;
let lineTarget = LINE_FROM;
let springAt = 0;

function lineSettled() {
  return Math.abs(lineY - lineTarget) < 0.2 && Math.abs(lineV) < 0.2;
}

function stepLine(now: number) {
  if (lineSettled()) {
    lineY = lineTarget;
    lineV = 0;
    springAt = now;
    return;
  }
  const dt = springAt ? Math.min(0.032, (now - springAt) / 1000) : 0.016;
  springAt = now;
  const { stiffness, damping, mass } = LINE_SPRING;
  lineV += ((-stiffness * (lineY - lineTarget) - damping * lineV) / mass) * dt;
  lineY += lineV * dt;
}

/** Linear clock, 0 at rest and 1 open. Leaving runs the same span backward. */
function hoverClock(now = performance.now()) {
  const p = Math.min(1, (now - hoverStart) / hoverSpan);
  return hoverFrom + (hoverTo - hoverFrom) * p;
}

/** Ease the beat in the direction of travel, so the close is as readable as the open. */
function beat(clock: number, start: number, span: number, ease: readonly [number, number, number, number]) {
  const local = Math.min(1, Math.max(0, (clock * HOVER_MS - start) / span));
  if (hoverTo < hoverFrom) return 1 - bezier(ease, 1 - local);
  return bezier(ease, local);
}

function paintPose(now?: number) {
  if (!live || !pose) return;
  paint(pose.root, pose.t, pose.vw, pose.vh, hoverClock(now));
}

function activeId() {
  return pointerId ?? focusId;
}

function setHover(id: string | null) {
  if (!live) return;
  const now = performance.now();
  if (id && (id !== shownId || hoverTo === 0)) {
    const card = CARDS.find((item) => item.id === id);
    if (id !== shownId) {
      shownId = id;
      hoverFrom = 0;
      hoverTo = 1;
      if (card?.detail) {
        lineTarget = 0;
        lineY = LINE_FROM;
        lineV = 0;
        springAt = now;
      }
    } else {
      hoverFrom = hoverClock(now);
      hoverTo = 1;
      if (card?.detail) lineTarget = 0;
    }
  } else if (!id) {
    if (hoverTo === 0) return;
    hoverFrom = hoverClock(now);
    hoverTo = 0;
    lineTarget = LINE_FROM;
  } else {
    return;
  }
  hoverSpan = HOVER_MS;
  hoverStart = now;
  cancelAnimationFrame(hoverRaf);
  const step = (time: number) => {
    paintPose(time);
    const closingDone = hoverTo === 0 && time - hoverStart >= hoverSpan && lineSettled();
    if (closingDone) {
      shownId = null;
      return;
    }
    if (time - hoverStart < hoverSpan || !lineSettled()) hoverRaf = requestAnimationFrame(step);
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

/** Four cards fit across the screen. The rest of the row is scrolled into view. */
const VISIBLE = 4;

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
  paint(root, t, vw, vh, hoverClock());
}

function paintFaceSolid(face: HTMLElement, color: string) {
  face.style.backgroundImage = "none";
  face.style.backgroundClip = "border-box";
  face.style.webkitBackgroundClip = "border-box";
  face.style.color = color;
  face.style.webkitTextFillColor = color;
}

function paintChip(chip: HTMLElement, progress: number) {
  const row = chip.parentElement;
  const rowBox = row?.getBoundingClientRect();
  const chipBox = chip.getBoundingClientRect();
  const width = rowBox?.width || 1;
  const start = rowBox ? (chipBox.left - rowBox.left) / width : 0;
  const end = rowBox ? (chipBox.right - rowBox.left) / width : 1;
  const local = Math.min(1, Math.max(0, (progress - start) / Math.max(0.001, end - start)));
  const faces = [...chip.querySelectorAll<HTMLElement>("[data-film='face']")];
  chip.style.border = "0";
  chip.style.outline = "none";
  chip.style.boxShadow = "none";
  if (local <= 0) {
    chip.style.backgroundImage = "none";
    chip.style.backgroundColor = "#070E18";
    faces.forEach((face) => paintFaceSolid(face, "#FAF6EC"));
    return;
  }
  if (local >= 1) {
    chip.style.backgroundImage = "none";
    chip.style.backgroundColor = "#FAF6EC";
    faces.forEach((face) => paintFaceSolid(face, "#070E18"));
    return;
  }
  const at = `${local * 100}%`;
  // Paper sits under the wipe, so a white edge cannot pick up the ink.
  chip.style.backgroundColor = "#FAF6EC";
  chip.style.backgroundImage = `linear-gradient(90deg, transparent ${at}, #070E18 ${at})`;
  chip.style.backgroundRepeat = "no-repeat";
  chip.style.backgroundSize = "100% 100%";
  chip.style.backgroundOrigin = "border-box";
  chip.style.backgroundClip = "border-box";
  faces.forEach((face) => {
    const box = face.getBoundingClientRect();
    face.style.backgroundImage = `linear-gradient(90deg, #070E18 ${at}, #FAF6EC ${at})`;
    face.style.backgroundSize = `${chipBox.width}px 100%`;
    face.style.backgroundRepeat = "no-repeat";
    face.style.backgroundPosition = `${-(box.left - chipBox.left)}px 0`;
    face.style.webkitBackgroundClip = "text";
    face.style.backgroundClip = "text";
    face.style.color = "#070E18";
    face.style.webkitTextFillColor = "transparent";
    face.style.webkitTextStroke = "0";
    face.style.textShadow = "none";
  });
}

function paint(root: HTMLElement, t: number, vw: number, vh: number, clock: number) {
  const nodes = readNodes(root);
  if (!nodes) return;
  stepLine(performance.now());
  const frame = filmFrame(t, vw, vh);
  const s = frame.cardW / CARD_W;
  const shown = CARDS.find((card) => card.id === shownId);
  const nameT = shown ? beat(clock, NAME_AT.start, NAME_AT.span, MEDIA_EASE) : 0;
  const lineT = shown?.detail ? beat(clock, LINE_AT.start, LINE_AT.span, MEDIA_EASE) : 0;
  const wipeT = shown ? beat(clock, WIPE_AT.start, WIPE_AT.span, UI_EASE) : 0;
  const stage = root.querySelector<HTMLElement>("[data-film='stage']");
  if (stage) {
    stage.style.position = "absolute";
    stage.style.inset = "0";
    stage.style.height = "100%";
    stage.style.display = "block";
  }

  nodes.cards.forEach((card, index) => {
    const spec = CARDS[index];
    const open = spec.id === shownId;
    card.style.width = `${frame.cardW}px`;
    card.style.height = `${frame.cardH}px`;
    card.style.opacity = "1";
    card.style.zIndex = open && nameT > 0 ? "2" : "1";
    card.style.boxShadow = open ? `0 ${47 * s}px ${67.4 * s}px rgba(68,53,15,${0.3 * nameT})` : "none";
    pin(card, frame.rowX + index * frame.cardW, frame.rowY - 20 * s * (open ? nameT : 0));

    const pad = card.querySelector<HTMLElement>("[data-film='pad']");
    if (pad) pad.style.padding = `${40 * s}px`;
    const detail = card.querySelector<HTMLElement>("[data-film='detail']");
    if (detail) {
      const rise = open ? nameT : 0;
      detail.style.overflow = "visible";
      detail.style.opacity = String(open ? lineT : 0);
      detail.style.marginTop = `${16 * s * rise}px`;
      detail.style.gap = `${16 * s}px`;
      if (rise <= 0) {
        detail.style.maxHeight = "0px";
      } else {
        detail.style.maxHeight = "none";
        const full = detail.scrollHeight;
        detail.style.maxHeight = `${full * rise}px`;
      }
      const line = detail.querySelector("p");
      if (line) {
        line.style.fontSize = `${16 * s}px`;
        line.style.width = `${396 * s}px`;
        line.style.lineHeight = "1";
        line.style.color = spec.ink ? "#070F18" : "#FAF6EC";
        line.style.transformOrigin = "left center";
        const stretch = 1 - (lineY / LINE_FROM) * 0.06;
        line.style.transform = open ? `translate3d(0, ${lineY * s}px, 0) scale(${stretch})` : "none";
      }
      const mark = detail.querySelector("img");
      if (mark) {
        mark.style.width = `${23 * s}px`;
        mark.style.height = `${23 * s}px`;
      }
    }
    const labels = card.querySelector<HTMLElement>("[data-film='labels']");
    if (labels) {
      labels.style.fontSize = `${14 * s}px`;
      labels.style.color = "#FAF6EC";
    }
    const roles = card.querySelector<HTMLElement>("[data-film='roles']");
    if (roles) roles.style.gap = `${16 * s}px`;
    const year = card.querySelector<HTMLElement>("[data-film='year']");
    const chipPad = "8px";
    if (year) {
      year.style.paddingLeft = chipPad;
      year.style.paddingRight = chipPad;
      paintChip(year, open ? wipeT : 0);
    }
    if (roles) {
      roles.style.paddingLeft = chipPad;
      roles.style.paddingRight = chipPad;
      paintChip(roles, open ? wipeT : 0);
    }
    const arrow = card.querySelector<HTMLElement>("[data-film='arrow']");
    if (arrow) {
      arrow.style.left = `${387 * s}px`;
      arrow.style.top = `${103 * s}px`;
      arrow.style.width = `${39.436 * s}px`;
      arrow.style.height = `${39.141 * s}px`;
    }
    const name = card.querySelector<HTMLElement>("[data-film='name']");
    if (name) {
      name.style.fontSize = `${48 * s}px`;
      name.style.width = `${396 * s}px`;
      name.style.lineHeight = "1";
      name.style.color = spec.ink ? "#070F18" : "#FAF6EC";
    }
  });
}

/** Reduced motion renders the settled row in normal flow. */
export function restFilm(root: HTMLElement) {
  live = false;
  pointerId = null;
  focusId = null;
  lineY = LINE_FROM;
  lineV = 0;
  lineTarget = LINE_FROM;
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
      detail.style.gap = "16px";
      const line = detail.querySelector("p");
      if (line) line.style.transform = "none";
      card.querySelectorAll<HTMLElement>("[data-film='year'], [data-film='roles']").forEach((chip) => {
        chip.style.backgroundImage = "none";
        chip.style.backgroundColor = "#FAF6EC";
        chip.querySelectorAll<HTMLElement>("[data-film='face']").forEach((face) => {
          face.style.backgroundImage = "none";
          face.style.backgroundClip = "border-box";
          face.style.webkitBackgroundClip = "border-box";
          face.style.color = "#070E18";
          face.style.webkitTextFillColor = "#070E18";
        });
      });
    }
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
              className="relative overflow-hidden rounded-[4px] bg-white outline-none"
              onPointerEnter={(event) => {
                if (event.pointerType === "touch") return;
                pointerId = card.id;
                setHover(activeId());
              }}
              onPointerLeave={(event) => {
                if (event.pointerType === "touch") return;
                if (pointerId === card.id) pointerId = null;
                setHover(activeId());
              }}
              onFocus={() => {
                focusId = card.id;
                setHover(activeId());
              }}
              onBlur={() => {
                if (focusId === card.id) focusId = null;
                setHover(activeId());
              }}
              onClick={() => {
                if (window.matchMedia("(hover: hover)").matches) return;
                focusId = focusId === card.id ? null : card.id;
                setHover(activeId());
              }}
            >
              <img
                src={card.image}
                alt=""
                className={card.crop ? "absolute max-w-none" : "absolute inset-0 h-full w-full object-cover"}
                style={card.crop}
              />
              <img
                data-film="arrow"
                src="/companies/card-arrow.svg"
                alt=""
                width={32}
                height={32}
                className="pointer-events-none absolute max-w-none"
              />
              <div data-film="pad" className="pointer-events-none relative flex h-full flex-col justify-between p-10">
                <div
                  data-film="labels"
                  className="flex items-start justify-between font-normal uppercase leading-[1.4] text-[#FAF6EC]"
                  style={{ fontFamily: MONO }}
                >
                  <span data-film="year" className="inline-flex shrink-0 bg-[#070E18]" style={{ paddingLeft: 8, paddingRight: 8 }}>
                    <span data-film="face">{card.stage}</span>
                  </span>
                  <span data-film="roles" className="inline-flex shrink-0 bg-[#070E18]" style={{ paddingLeft: 8, paddingRight: 8 }}>
                    <span data-film="face">{card.category}</span>
                  </span>
                </div>
                <div data-film="stack" className="flex flex-col items-start">
                  <p data-film="name" className="leading-none" style={{ fontFamily: SANS, fontSize: 48, color: card.ink ? "#070F18" : "#FAF6EC" }}>
                    {card.name}
                  </p>
                  {card.detail ? (
                    <div data-film="detail" className="flex max-h-0 flex-col items-start opacity-0">
                      <p className="leading-none" style={{ fontFamily: SANS, color: card.ink ? "#070F18" : "#FAF6EC" }}>
                        {card.detail}
                      </p>
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
