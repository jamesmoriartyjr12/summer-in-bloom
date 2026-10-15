"use client";

import { useEffect, type Ref } from "react";
import { useReducedMotion } from "framer-motion";
import DnaCarousel, { scrollHelix } from "../dna-carousel/DnaCarousel";

/**
 * Frames 187:181 and 210:404, on a 1920×1080 stage.
 * Scroll carries the row in. Frame 227:34 is the rest of every card.
 * Frame 227:222 is the hover and the focus of a card.
 * On the helix the stage and the category sit centered above the name in front.
 * They stay ink chips. They wipe in left to right, and wipe back when that company leaves the front.
 * The photograph stays clear of those words.
 */
const HOVER_MS = 560;
const NAME_AT = { start: 0, span: 280 } as const;
const WIPE_AT = { start: 0, span: 480 } as const;
const MEDIA_EASE = [0.22, 1, 0.36, 1] as const;

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
};

const shot = (file: string) => `/Bloom%20Portfolio%20Images/${file}`;

const ROW: Card[] = [
  { id: "orion", name: "Orion", stage: "Seed", category: "Longevity", image: "/companies/orion.png", ink: false },
  { id: "jamie", name: "Jamie Ai", stage: "Seed", category: "Creator", image: shot("Jamie_Large.png"), ink: false },
  { id: "meridian", name: "Meridian", stage: "Seed", category: "Payments", image: shot("Meridian_Large.png"), ink: false },
  { id: "sunny", name: "Sunny Benefits", stage: "Series A", category: "Fintech", image: shot("Sunny_Large.png"), ink: false },
  {
    id: "collectible",
    name: "Collectible",
    stage: "Seed",
    category: "Consumer",
    image: "/companies/watchcheck.png",
    crop: { height: "119.75%", width: "129.98%", left: "-0.02%", top: "-19.75%" },
    ink: false,
  },
  { id: "feno", name: "Feno", stage: "Seed", category: "Longevity", image: "/companies/feno.png", ink: true },
  { id: "milly", name: "Milly", stage: "Seed", category: "Fintech", image: "/companies/milly.jpg", ink: true },
  { id: "tee", name: "TeeCommerce", stage: "Acquired", category: "Commerce", image: shot("TeeCommerce_Large.png"), ink: false },
  {
    id: "outer",
    name: "OuterProduct",
    stage: "Seed",
    category: "Deeptech",
    image: "/companies/outerproduct.jpg",
    crop: { height: "100%", width: "285.01%", left: "-92.51%", top: "0" },
    ink: false,
  },
  { id: "fanfix", name: "FanFix", stage: "Growth", category: "Creator", image: shot("FanFix_Large.png"), ink: false },
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

type FilmPose = { root: HTMLElement; t: number; vw: number; vh: number; lead: number };

let live = false;
let pose: FilmPose | null = null;
let pointerId: string | null = null;
let focusId: string | null = null;
let hoverRaf = 0;

/** One clock per card, so leaving for the next card still plays the close. */
type CardRun = {
  from: number;
  to: number;
  start: number;
  span: number;
};

const runs = new Map<string, CardRun>();

function restRun(): CardRun {
  return { from: 0, to: 0, start: 0, span: HOVER_MS };
}

function runFor(id: string) {
  let run = runs.get(id);
  if (!run) {
    run = restRun();
    runs.set(id, run);
  }
  return run;
}

/** Linear clock, 0 at rest and 1 open. Leaving runs the same span backward. */
function clockOf(run: CardRun, now: number) {
  const p = Math.min(1, (now - run.start) / run.span);
  return run.from + (run.to - run.from) * p;
}

/** Ease the beat in the direction of travel, so the close is as readable as the open. */
function beat(run: CardRun, clock: number, start: number, span: number, ease: readonly [number, number, number, number]) {
  const local = Math.min(1, Math.max(0, (clock * HOVER_MS - start) / span));
  if (run.to < run.from) return 1 - bezier(ease, 1 - local);
  return bezier(ease, local);
}

function runBusy(run: CardRun, now: number) {
  const clock = clockOf(run, now);
  return run.to === 1 ? clock < 0.999 : clock > 0.001;
}

function paintPose(now?: number) {
  if (!live || !pose) return;
  paint(pose.root, pose.t, pose.vw, pose.vh, now ?? performance.now(), pose.lead);
}

function activeId() {
  return pointerId ?? focusId;
}

function kick() {
  cancelAnimationFrame(hoverRaf);
  const step = (time: number) => {
    paintPose(time);
    let busy = false;
    for (const run of runs.values()) {
      if (runBusy(run, time)) busy = true;
    }
    if (busy) hoverRaf = requestAnimationFrame(step);
  };
  hoverRaf = requestAnimationFrame(step);
}

function setHover(id: string | null) {
  if (!live) return;
  const now = performance.now();
  for (const [cardId, run] of runs) {
    if (cardId === id) continue;
    const clock = clockOf(run, now);
    if (run.to === 0 && clock <= 0.001) continue;
    if (run.to === 0) continue;
    run.from = clock;
    run.to = 0;
    run.start = now;
    run.span = HOVER_MS;
  }
  if (id) {
    const run = runFor(id);
    const clock = clockOf(run, now);
    if (!(run.to === 1 && clock > 0.001)) {
      const atRest = clock <= 0.001;
      run.from = atRest ? 0 : clock;
      run.to = 1;
      run.start = now;
      run.span = HOVER_MS;
    }
  }
  kick();
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
/** Room between cards. Four still fill the screen, with this gutter. */
const CARD_GAP = 24;

/** Cards stay at this size. `t` 0 holds the row off the right. `t` 1 brings the last card in. */
export function filmFrame(t: number, vw: number, vh: number) {
  const clamped = Math.max(0, Math.min(1, t));
  const gap = Math.min(CARD_GAP, vw * 0.02);
  const cardW = (vw - (VISIBLE - 1) * gap) / VISIBLE;
  const cardH = cardW * (CARD_H / CARD_W);
  const rowW = cardW * CARDS.length + gap * (CARDS.length - 1);
  const rowX = vw - rowW * clamped;
  const rowY = Math.max(0, (vh - cardH) / 2);
  return { cardW, cardH, gap, rowX, rowY, rowW };
}

/** Places along the helix from the card in front. Matches the carousel step. */
const HELIX_CARD = 0.252;
/** Open space between cards, so the photographs do not cover one another. */
const HELIX_GAP = 0.06;
const HELIX_STEP = HELIX_CARD + HELIX_GAP;
/** How far the helix reaches above and below its centre, as a fraction of width.
 *  High enough that the real cards fit, so the top is never cut off. */
const HELIX_ABOVE = 0.28;
const HELIX_BELOW = 0.26;
const NAME_BAND = 168;

/** Fits the helix in view and sits it just above the names. */
function seatHelix(root: HTMLElement) {
  const dna = root.querySelector<HTMLElement>(".dna--fill");
  const stage = root.querySelector<HTMLElement>(".dna__stage");
  if (!dna || !stage) return;
  const width = dna.clientWidth;
  const height = dna.clientHeight;
  if (!width || !height) return;
  const above = HELIX_ABOVE * width;
  const below = HELIX_BELOW * width;
  const topPad = 8;
  const bottomGap = 8;
  const limit = height - NAME_BAND - bottomGap;
  const available = Math.max(1, limit - topPad);
  const scale = Math.min(1, available / (above + below));
  const shift = limit - height / 2 - below * scale;
  const next = `translateY(${shift.toFixed(2)}px) scale(${scale.toFixed(4)})`;
  if (stage.style.transform !== next) stage.style.transform = next;
}

/** `t` 0 holds the row off the right. `t` 1 is the row at full viewport width. */
export function placeFilm(root: HTMLElement, t: number, vw: number, vh: number, lead = 0) {
  live = true;
  pose = { root, t, vw, vh, lead };
  if (root.dataset.helix === "1") scrollHelix(t, lead);
  paint(root, t, vw, vh, performance.now(), lead);
}

function paintFaceSolid(face: HTMLElement, color: string) {
  face.style.backgroundImage = "none";
  face.style.backgroundClip = "border-box";
  face.style.webkitBackgroundClip = "border-box";
  face.style.color = color;
  face.style.webkitTextFillColor = color;
}

/** Left chip, then right chip. The clock runs backward on close, so this retraces. */
function labelLocal(clock: number, index: number) {
  const span = WIPE_AT.span / 2;
  const start = WIPE_AT.start + index * span;
  return Math.min(1, Math.max(0, (clock * HOVER_MS - start) / span));
}

function paintChip(chip: HTMLElement, amount: number) {
  const local = Math.min(1, Math.max(0, amount));
  const chipBox = chip.getBoundingClientRect();
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

/** The ink chip wipes in. The type stays paper. */
function paintWord(word: HTMLElement, amount: number) {
  const local = Math.min(1, Math.max(0, amount));
  word.style.color = "#FAF6EC";
  word.style.backgroundColor = "#070E18";
  word.style.clipPath = `inset(0 ${(1 - local) * 100}% 0 0)`;
}

function paintMenuLine(root: HTMLElement, now: number) {
  for (const line of root.querySelectorAll<HTMLElement>("[data-film='menu-line']")) {
    const id = line.dataset.filmLine;
    if (!id) continue;
    const run = runs.get(id);
    const clock = run ? clockOf(run, now) : 0;
    const moving = clock > 0.001;
    const stage = line.querySelector<HTMLElement>("[data-film='year']");
    const category = line.querySelector<HTMLElement>("[data-film='roles']");
    if (stage) paintWord(stage, moving ? labelLocal(clock, 0) : 0);
    if (category) paintWord(category, moving ? labelLocal(clock, 1) : 0);
  }
}

function paintChips(root: HTMLElement, now: number) {
  for (const card of root.querySelectorAll<HTMLElement>("[data-film-card]")) {
    const spec = CARDS.find((item) => item.id === card.dataset.filmCard);
    if (!spec) continue;
    const run = runs.get(spec.id);
    const clock = run ? clockOf(run, now) : 0;
    const moving = clock > 0.001;
    const year = card.querySelector<HTMLElement>("[data-film='year']");
    const roles = card.querySelector<HTMLElement>("[data-film='roles']");
    if (year) paintChip(year, moving ? labelLocal(clock, 0) : 0);
    if (roles) paintChip(roles, moving ? labelLocal(clock, 1) : 0);
  }
}

/** The company under the pointer. Scroll still owns who is in front. */
let menuPointer: number | null = null;
/** The name that carries the stage and the category. */
let menuFront: number | null = null;

export function pointMenu(index: number | null) {
  if (menuPointer === index) return;
  menuPointer = index;
  if (!pose || pose.root.dataset.helix !== "1") return;
  placeMenu(pose.root, pose.t, pose.lead, true);
}

function syncFront(pos: number) {
  const front = Math.round(Math.max(0, Math.min(CARDS.length - 1, pos)));
  if (menuFront === front) return;
  menuFront = front;
  setHover(CARDS[front]?.id ?? null);
}

function placeMenu(root: HTMLElement, t: number, lead = 0, animateNames = false) {
  const menu = root.querySelector<HTMLElement>("[data-film='menu']");
  const track = root.querySelector<HTMLElement>("[data-film='menu-track']");
  if (!menu || !track) return;
  const items = [...track.querySelectorAll<HTMLElement>("[data-film='menu-item']")];
  const names = items
    .map((item) => item.querySelector<HTMLElement>("[data-film='menu-name']"))
    .filter((el): el is HTMLElement => el != null);
  if (!items.length || names.length !== items.length) return;
  const pos = Math.max(0, Math.min(1, t)) * (names.length - 1);
  const centers = items.map((el) => el.offsetLeft + el.offsetWidth / 2);
  const index = Math.min(names.length - 1, Math.floor(pos));
  const next = Math.min(names.length - 1, index + 1);
  const mix = pos - index;
  const center = centers[index] * (1 - mix) + centers[next] * mix;
  const shift = lead * HELIX_STEP * root.clientWidth;
  track.style.transform = `translate3d(${menu.clientWidth / 2 - center + shift}px, 0, 0)`;
  const ink = [27, 27, 27];
  const mute = [229, 221, 203];
  const snap = "color 200ms cubic-bezier(0.2, 0.8, 0.2, 1)";
  names.forEach((el, i) => {
    const away = i === menuPointer ? 0 : Math.min(1, Math.abs(i - pos));
    const rgb = ink.map((channel, k) => Math.round(channel + (mute[k] - channel) * away));
    el.style.transition = animateNames ? snap : "none";
    el.style.color = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  });
  syncFront(pos);
}

function paint(root: HTMLElement, t: number, vw: number, vh: number, now: number, lead = 0) {
  if (root.dataset.helix === "1") {
    placeMenu(root, t, lead);
    paintMenuLine(root, now);
    seatHelix(root);
    return;
  }
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
    const run = runs.get(spec.id);
    const clock = run ? clockOf(run, now) : 0;
    const moving = clock > 0.001;
    const nameT = run && moving ? beat(run, clock, NAME_AT.start, NAME_AT.span, MEDIA_EASE) : 0;
    card.style.width = `${frame.cardW}px`;
    card.style.height = `${frame.cardH}px`;
    card.style.opacity = "1";
    card.style.zIndex = run && run.to === 1 ? "2" : "1";
    card.style.boxShadow = moving ? `0 ${47 * s}px ${67.4 * s}px rgba(68,53,15,${0.3 * nameT})` : "none";
    pin(card, frame.rowX + index * (frame.cardW + frame.gap), frame.rowY - 20 * s * nameT);

    const pad = card.querySelector<HTMLElement>("[data-film='pad']");
    if (pad) pad.style.padding = `${40 * s}px`;
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
      paintChip(year, moving ? labelLocal(clock, 0) : 0);
    }
    if (roles) {
      roles.style.paddingLeft = chipPad;
      roles.style.paddingRight = chipPad;
      paintChip(roles, moving ? labelLocal(clock, 1) : 0);
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
  menuFront = null;
  runs.clear();
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

function CardFace({ card, helix }: { card: Card; helix?: boolean }) {
  return (
    <article
      data-film-card={card.id}
      tabIndex={helix ? -1 : 0}
      className={helix ? "relative h-full w-full overflow-hidden outline-none" : "relative overflow-hidden rounded-[4px] bg-white outline-none"}
      style={helix ? { containerType: "inline-size" } : undefined}
              onPointerEnter={(event) => {
                if (helix || event.pointerType === "touch") return;
                pointerId = card.id;
                setHover(activeId());
              }}
              onPointerLeave={(event) => {
                if (helix || event.pointerType === "touch") return;
                if (pointerId === card.id) pointerId = null;
                setHover(activeId());
              }}
              onFocus={() => {
                if (helix) return;
                focusId = card.id;
                setHover(activeId());
              }}
              onBlur={() => {
                if (helix) return;
                if (focusId === card.id) focusId = null;
                setHover(activeId());
              }}
              onClick={() => {
                if (helix) return;
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
              {helix ? null : (
              <div
                data-film="pad"
                className="pointer-events-none relative flex h-full flex-col justify-between p-10"
              >
                <div
                  data-film="labels"
                  className="flex items-end justify-between p-0 font-normal uppercase leading-[1.4] text-[#FAF6EC]"
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
                  <p
                    data-film="name"
                    className="leading-none"
                    style={{ fontFamily: SANS, fontSize: 48, color: card.ink ? "#070F18" : "#FAF6EC" }}
                  >
                    {card.name}
                  </p>
                </div>
              </div>
              )}
            </article>
  );
}

export function CompaniesFilm({ rootRef }: { rootRef: Ref<HTMLDivElement> }) {
  const reduce = useReducedMotion();
  useEffect(() => {
    return () => {
      live = false;
      cancelAnimationFrame(hoverRaf);
    };
  }, []);

  if (!reduce) {
    return (
      <div ref={rootRef} data-helix="1" className="invisible absolute inset-0 z-40 overflow-hidden text-ink">
        <DnaCarousel
          className="dna--fill"
          items={CARDS}
          renderItem={(card) => <CardFace card={card} helix />}
          preset="paper"
          theme={{ background: "transparent", card: "transparent" }}
          radius={4}
          gap={HELIX_GAP}
          autoplay={false}
          wheel={false}
          keyboard={false}
          grabCursor={false}
          scrollDriven
          inactiveOpacity={1}
          onHover={pointMenu}
          label="Companies"
        />
        <div data-film="menu" className="pointer-events-none absolute inset-x-0 bottom-0 z-50 h-[168px] overflow-hidden">
          <div
            data-film="menu-track"
            className="absolute bottom-[42px] left-0 flex w-max items-end"
            style={{
              gap: "2.4em",
              width: "max-content",
              fontFamily: SANS,
              fontSize: "clamp(32px, 3.125vw, 60px)",
              background: "transparent",
            }}
          >
            {CARDS.map((card) => (
              <span key={card.id} data-film="menu-item" className="relative m-0 shrink-0" style={{ flexShrink: 0 }}>
                <p
                  data-film="menu-name"
                  className="m-0 whitespace-nowrap leading-none"
                  style={{ color: "#e5ddcb", whiteSpace: "nowrap" }}
                >
                  {card.name}
                </p>
                <span
                  data-film="menu-line"
                  data-film-line={card.id}
                  className="absolute flex uppercase"
                  style={{
                    left: "50%",
                    bottom: "100%",
                    transform: "translateX(-50%)",
                    marginBottom: 10,
                    gap: 8,
                    fontFamily: MONO,
                    fontSize: 14,
                    fontWeight: 500,
                    letterSpacing: "0.04em",
                    lineHeight: 1.4,
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    data-film="year"
                    style={{
                      display: "inline-block",
                      backgroundColor: "#070E18",
                      color: "#FAF6EC",
                      paddingLeft: 8,
                      paddingRight: 8,
                      clipPath: "inset(0 100% 0 0)",
                    }}
                  >
                    {card.stage}
                  </span>
                  <span
                    data-film="roles"
                    style={{
                      display: "inline-block",
                      backgroundColor: "#070E18",
                      color: "#FAF6EC",
                      paddingLeft: 8,
                      paddingRight: 8,
                      clipPath: "inset(0 100% 0 0)",
                    }}
                  >
                    {card.category}
                  </span>
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="invisible absolute inset-0 z-40 overflow-hidden text-ink">
      <div data-film="stage" className="relative h-full">
        <div data-film="row">
          {CARDS.map((card) => (
            <CardFace key={card.id} card={card} />
          ))}
        </div>
      </div>
    </div>
  );
}
