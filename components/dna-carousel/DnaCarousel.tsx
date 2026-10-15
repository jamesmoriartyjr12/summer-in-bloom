"use client";

import { useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from "react";
import presets, { type DnaColours, type DnaPreset } from "./presets";
import "./DnaCarousel.css";

const DEG = Math.PI / 180;
const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const f = (n: number, d = 3) => Math.round(n * 10 ** d) / 10 ** d;

type PlaceProps = {
  step: number;
  curve: number;
  depth: number;
  helixSpread: number;
  sway: number;
  rotation: number;
  tilt: number;
  roll: number;
  activeScale: number;
  inactiveScale: number;
  depthScale: number;
  blur: number;
  inactiveOpacity: number;
};

/**
 * Where a card sits on the helix, given `u` — how many places it is from the
 * focused one (fractional while moving) — and `s`, which strand it rides.
 *
 * Everything hangs off one phase, `θ = curve · u`. Depth is `cos θ`, so the
 * focused card is nearest and the helix recedes a quarter-turn either side.
 * The two strands are the same curve with opposite sign on everything that
 * has a handedness — vertical offset, yaw, roll — so neighbours lean and climb
 * against each other, and the pair reads as a twisted ladder rather than a
 * row. Pitch has no handedness, so both strands share it.
 *
 * Vertical position carries a second, half-frequency term (`sway`). On its own
 * the main term would put every other card at the same height; the slow term
 * breaks that so the strands wind rather than zig-zag.
 *
 * Focus falls off as `|u|³` inside one place of the centre: flat at the top so
 * the focused card holds its state for a moment before it starts to fade, then
 * quickly. Blur keeps growing linearly past that, so depth of field deepens
 * with distance.
 */
function place(u: number, s: number, p: PlaceProps) {
  const th = u * p.curve;
  const c = Math.cos(th);
  const sn = Math.sin(th);
  const away = Math.abs(u);
  const a = Math.min(1, away);
  const fade = a * a * a;
  const near = 1 - fade;

  const rest = p.inactiveScale * (1 + p.depthScale * c);
  /* Lean with distance from the front, and none at the front, so the card
     in the middle faces the screen. */
  const lean = Math.max(-1, Math.min(1, u));
  return {
    x: u * p.step,
    y: s * (p.sway * Math.cos(th / 2) + p.helixSpread * sn),
    z: p.depth * c,
    rx: p.tilt * sn,
    ry: s * p.rotation * lean,
    rz: s * p.roll * sn,
    scale: rest + (p.activeScale - rest) * (1 - a ** 2.4),
    opacity: 1 - (1 - p.inactiveOpacity) * fade,
    blur: p.blur * away * fade,
    near,
    away,
  };
}

/** Wraps `v` into [-m/2, m/2) — the loop, centred on the focused card. */
const wrap = (v: number, m: number) => ((((v + m / 2) % m) + m) % m) - m / 2;

/** How far the photograph can shift inside the frame before the edge shows.
 * A crop already hangs past the clip. A cover image has the slack object-fit leaves. */
function stillRoom(still: HTMLImageElement, photo: HTMLElement) {
  const w = photo.clientWidth;
  const h = photo.clientHeight;
  const key = `${w}x${h}x${still.naturalWidth}`;
  if (still.dataset.slackKey === key && still.dataset.slackL) {
    return {
      l: Number(still.dataset.slackL),
      r: Number(still.dataset.slackR),
      t: Number(still.dataset.slackT),
      b: Number(still.dataset.slackB),
      crop: still.dataset.crop === "1",
    };
  }
  const crop = Boolean(still.style.width);
  const pct = (v: string) => (v.endsWith("%") ? parseFloat(v) / 100 : 0);
  let l = 0;
  let r = 0;
  let t = 0;
  let b = 0;
  if (crop && w && h) {
    const left = pct(still.style.left);
    const top = pct(still.style.top);
    const width = still.style.width.endsWith("%") ? parseFloat(still.style.width) / 100 : 1;
    const height = still.style.height.endsWith("%") ? parseFloat(still.style.height) / 100 : 1;
    l = Math.max(0, -left * w);
    r = Math.max(0, (left + width - 1) * w);
    t = Math.max(0, -top * h);
    b = Math.max(0, (top + height - 1) * h);
  } else if (still.naturalWidth && still.naturalHeight && w && h) {
    const scale = Math.max(w / still.naturalWidth, h / still.naturalHeight);
    l = r = Math.max(0, (still.naturalWidth * scale - w) / 2);
    t = b = Math.max(0, (still.naturalHeight * scale - h) / 2);
  }
  still.dataset.slackKey = key;
  still.dataset.crop = crop ? "1" : "0";
  still.dataset.slackL = String(l);
  still.dataset.slackR = String(r);
  still.dataset.slackT = String(t);
  still.dataset.slackB = String(b);
  return { l, r, t, b, crop };
}

/** The page scroll writes this. `t` 0 is the first card. `t` 1 is the last.
 * `lead` holds the first card that many places to the right of centre. */
let scrollHelixTo: ((t: number, lead?: number) => void) | null = null;

export function scrollHelix(t: number, lead = 0) {
  scrollHelixTo?.(t, lead);
}

type ImageItem = { src: string; alt?: string };

type Motion = {
  pos: number;
  lead: number;
  vel: number;
  target: number | null;
  drift: number;
  idleAt: number;
  dirty: boolean;
  active: number;
};

type LoopProps = PlaceProps & {
  rgbSplit: number;
  shadow: boolean;
  shadowStrength: number;
  dragSensitivity: number;
  inertia: number;
  snapStrength: number;
  autoplay: boolean;
  autoplaySpeed: number;
  resumeDelay: number;
  wheel: boolean | "horizontal";
  keyboard: boolean;
  scrollDriven: boolean;
  reach: number;
  slots: number;
  n: number;
  colours: DnaColours;
  onChange?: (index: number) => void;
  onHover?: (index: number | null) => void;
};

export default function DnaCarousel<T>({
  items = [] as T[],
  renderItem,
  preset = "linen",
  theme,
  label = "Image carousel",

  /* --- layout. Lengths are fractions of the component's width, so the helix
     holds its proportions at any size. ----------------------------------- */
  imageWidth = 0.252,
  imageHeight = 0.354,
  /* Space between neighbours along the axis. Negative overlaps them, which
     is what lets the helix read as one continuous strand. */
  gap = -0.057,
  radius = 14,
  /* Width over height of the whole component. */
  aspect = 1.556,

  /* --- 3D motion --------------------------------------------------------- */
  /* How far the helix swings toward and away from the viewer. */
  depth = 0.121,
  /* Degrees the helix turns per card. 90 would put every other card exactly
     edge-on to the axis; a little less keeps the neighbours leaning in. */
  curve = 86.4,
  /* How far apart the two strands climb and fall. */
  helixSpread = 0.039,
  /* The slow second wave on vertical position — see `place`. */
  sway = 0.032,
  perspective = 0.786,
  /* Degrees of yaw at the front and back of each turn. */
  rotation = 32,
  /* Degrees of pitch and roll at the sides of each turn. */
  tilt = 3.5,
  roll = 10,

  /* --- image effects ------------------------------------------------------ */
  activeScale = 1,
  inactiveScale = 0.73,
  /* Cards at the front of a turn are this much larger than those at the
     back, on top of what perspective already gives. */
  depthScale = 0.06,
  /* px of blur per card of distance from the focus. */
  blur = 1.25,
  /* Offset of the red/blue fringes as a multiple of the blur. 0 turns it off. */
  rgbSplit = 1,
  inactiveOpacity = 0.42,
  shadow = true,
  shadowStrength = 0.35,

  /* --- interaction -------------------------------------------------------- */
  dragSensitivity = 1,
  /* Seconds of glide after a throw. 0 stops dead and snaps. */
  inertia = 0.32,
  /* Stiffness of the pull onto the nearest card. */
  snapStrength = 1,
  autoplay = true,
  /* Cards per second. Autoplay is a continuous drift, not a step. */
  autoplaySpeed = 0.1,
  /* Seconds after an interaction before autoplay picks back up. */
  resumeDelay = 1.6,
  /* Mouse-wheel and trackpad navigation. `true` takes both axes, which stops
     the page scrolling while the pointer is over the carousel; 'horizontal'
     leaves vertical wheel to the page. */
  wheel = true,
  keyboard = true,
  grabCursor = true,
  /* The page scroll owns the position. Drag, wheel, keys, and drift stay off. */
  scrollDriven = false,
  startIndex = 0,
  onChange,
  onHover,

  className = "",
  style,
}: {
  items?: T[];
  renderItem?: (item: T, index: number) => ReactNode;
  preset?: DnaPreset;
  theme?: Partial<DnaColours>;
  label?: string;
  imageWidth?: number;
  imageHeight?: number;
  gap?: number;
  radius?: number | string;
  aspect?: number;
  depth?: number;
  curve?: number;
  helixSpread?: number;
  sway?: number;
  perspective?: number;
  rotation?: number;
  tilt?: number;
  roll?: number;
  activeScale?: number;
  inactiveScale?: number;
  depthScale?: number;
  blur?: number;
  rgbSplit?: number;
  inactiveOpacity?: number;
  shadow?: boolean;
  shadowStrength?: number;
  dragSensitivity?: number;
  inertia?: number;
  snapStrength?: number;
  autoplay?: boolean;
  autoplaySpeed?: number;
  resumeDelay?: number;
  wheel?: boolean | "horizontal";
  keyboard?: boolean;
  grabCursor?: boolean;
  scrollDriven?: boolean;
  startIndex?: number;
  onChange?: (index: number) => void;
  onHover?: (index: number | null) => void;
  className?: string;
  style?: CSSProperties;
}) {
  const list = useMemo(() => items.filter(Boolean), [items]);
  const n = list.length;
  const step = imageWidth + gap;

  /* How many places either side of the focus can be on screen at once. The
     loop has to be longer than twice that, or the wrap point comes into view
     and a card jumps across the frame. Every length is a fraction of width,
     so this never needs the component's actual size. */
  const reach = step > 0 ? (0.5 + imageWidth * 0.6) / step : 4;
  const slots = useMemo(() => {
    if (!n) return 0;
    let m = n * Math.ceil((2 * Math.ceil(reach) + 2) / n);
    /* The strands alternate by slot, so an odd loop would put two cards of
       the same strand side by side at the seam. */
    if (m % 2) m *= 2;
    return m;
  }, [n, reach]);

  const colours = { ...(presets[preset] || presets.linen), ...theme };

  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

  /* Live props for the frame loop. Changing any of them must never restart
     the motion, so the loop reads them from here. */
  const props = useRef<LoopProps | null>(null);
  props.current = {
    step,
    curve: curve * DEG,
    depth,
    helixSpread,
    sway,
    rotation,
    tilt,
    roll,
    activeScale,
    inactiveScale,
    depthScale,
    blur,
    rgbSplit,
    inactiveOpacity,
    shadow,
    shadowStrength,
    dragSensitivity,
    inertia,
    snapStrength,
    autoplay,
    autoplaySpeed,
    resumeDelay,
    wheel,
    keyboard,
    scrollDriven,
    reach,
    slots,
    n,
    colours,
    onChange,
    onHover,
  };

  const motion = useRef<Motion | null>(null);
  if (!motion.current) {
    motion.current = {
      pos: startIndex,
      lead: 0,
      vel: 0,
      target: null,
      drift: 0,
      idleAt: -Infinity,
      dirty: true,
      active: -1,
    };
  }

  /* A change in slot count re-lays every card, even if nothing is moving. */
  useEffect(() => {
    if (motion.current) motion.current.dirty = true;
  }, [slots, step, curve, depth, helixSpread, sway, rotation, tilt, roll,
    activeScale, inactiveScale, depthScale, blur, rgbSplit, inactiveOpacity,
    shadow, shadowStrength, preset, theme]);

  useEffect(() => {
    const root = rootRef.current;
    const m = motion.current;
    if (!root || !m) return undefined;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    let raf = 0;
    let last = performance.now();

    /* --- drag ------------------------------------------------------------ */
    let drag: {
      id: number;
      x: number;
      y: number;
      pos: number;
      width: number;
      moved: boolean;
      card: HTMLElement | null;
    } | null = null;
    const history: Array<[number, number]> = [];

    const now = () => performance.now() / 1000;

    /* The face springs toward the pointer. The hit box does not turn, so the
       pointer cannot fall off the card. Scroll eases the spring back to rest. */
    const HOVER_DEG = 22;
    const HOVER_Z = 5.2;
    const tiltX: number[] = [];
    const tiltY: number[] = [];
    const tiltVX: number[] = [];
    const tiltVY: number[] = [];
    const hover = { slot: -1, tx: 0, ty: 0, movedAt: 0, allow: 1, sent: null as number | null };
    /* The photograph drags against the frame while the helix is moving, then
       eases back. Eight pixels is the cap. */
    const slip = { x: 0, pos: 0, at: 0, movedAt: 0 };
    const pointer = { x: 0, y: 0, on: false };

    const onHoverMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.on = true;
      m.dirty = true;
    };

    const onHoverOut = (e: PointerEvent) => {
      if (e.relatedTarget) return;
      pointer.on = false;
      hover.slot = -1;
      m.dirty = true;
    };
    const settleTo = (target: number) => {
      m.target = target;
      m.idleAt = now();
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      drag = {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        pos: m.pos,
        width: root.clientWidth || 1,
        moved: false,
        card: (e.target as HTMLElement | null)?.closest?.("[data-slot]") ?? null,
      };
      m.target = null;
      m.vel = 0;
      m.drift = 0;
      history.length = 0;
      history.push([now(), m.pos]);
    };

    const onMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved) {
        if (Math.hypot(dx, e.clientY - drag.y) < 4) return;
        /* Capture only once this is clearly a drag — capturing on down would
           swallow the click that focuses a card. */
        drag.moved = true;
        root.setPointerCapture?.(e.pointerId);
        root.classList.add("is-dragging");
      }
      const p = props.current;
      if (!p) return;
      m.pos = drag.pos - (dx / (drag.width * p.step)) * p.dragSensitivity;
      m.dirty = true;
      const t = now();
      history.push([t, m.pos]);
      while (history.length > 2 && t - history[0][0] > 0.1) history.shift();
    };

    const onUp = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const p = props.current;
      if (!p) return;
      root.classList.remove("is-dragging");
      if (drag.moved) {
        const t = now();
        const [t0, p0] = history[0];
        const v = t - t0 > 0.005 ? (m.pos - p0) / (t - t0) : 0;
        m.vel = clamp(v, -12, 12);
        /* Momentum and snapping in one: aim for where the throw would coast
           to, rounded to a card, and let the spring carry the velocity. */
        settleTo(Math.round(m.pos + m.vel * p.inertia));
      } else if (drag.card) {
        const k = Number(drag.card.dataset.slot);
        settleTo(Math.round(m.pos + wrap(k - m.pos, p.slots)));
      } else {
        settleTo(Math.round(m.pos));
      }
      drag = null;
    };

    /* --- wheel ------------------------------------------------------------ */
    let wheelTimer = 0;
    const onWheel = (e: WheelEvent) => {
      const p = props.current;
      if (!p || !p.wheel) return;
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (!horizontal && p.wheel === "horizontal") return;
      e.preventDefault();
      const scale = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? root.clientWidth : 1;
      const delta = (horizontal ? e.deltaX : e.deltaY) * scale;
      const base = m.target ?? m.pos;
      m.target = base + (delta / ((root.clientWidth || 1) * p.step)) * 0.6 * p.dragSensitivity;
      m.idleAt = now();
      m.drift = 0;
      /* Hold the fractional target while the wheel is still turning, then
         land on the nearest card once it stops. */
      clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => settleTo(Math.round(m.target ?? m.pos)), 140);
    };

    /* --- keyboard --------------------------------------------------------- */
    const onKey = (e: KeyboardEvent) => {
      const p = props.current;
      if (!p?.keyboard) return;
      const dir =
        e.key === "ArrowRight" || e.key === "ArrowDown" ? 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1
        : 0;
      if (!dir) return;
      e.preventDefault();
      m.drift = 0;
      settleTo(Math.round(m.target ?? m.pos) + dir);
    };

    /* --- frame ------------------------------------------------------------ */
    const stepSlip = () => {
      const tNow = performance.now();
      const dt = Math.min(0.05, Math.max(1 / 120, slip.at ? (tNow - slip.at) / 1000 : 1 / 60));
      slip.at = tNow;
      const dPos = m.pos - slip.pos;
      slip.pos = m.pos;
      const moving = Math.abs(dPos) > 0.0004;
      if (moving) {
        slip.movedAt = tNow;
        /* Scrolling forward moves the cards left, so the still shifts the other way.
           Any real movement takes the full 8px, so the drag reads while the row travels. */
        const target = Math.sign(dPos) * 8;
        slip.x += (target - slip.x) * 0.45;
        return;
      }
      if (tNow - slip.movedAt < 50) return;
      slip.x += (0 - slip.x) * (1 - Math.exp(-dt / 0.28));
      if (Math.abs(slip.x) < 0.05) slip.x = 0;
    };

    const paint = () => {
      const p = props.current;
      if (!p) return;
      stepSlip();
      const cards = cardRefs.current;
      const S = p.slots;
      const c = p.colours;
      /* Scroll lays the companies out in order and stops at the last one.
         The drag mode still wraps, so a thrown card can come back around. */
      const linear = p.scrollDriven;
      for (let k = 0; k < S; k++) {
        const el = cards[k];
        if (!el) continue;
        if (linear && k >= p.n) {
          if (el.style.visibility !== "hidden") el.style.visibility = "hidden";
          continue;
        }
        const base = linear ? k - m.pos : wrap(k - m.pos, S);
        const u = base + m.lead;
        /* Companies still ahead stay in the line while the first card is in
           front. Nothing sits before the first, and nothing returns after the last. */
        const out = Math.abs(base) > p.reach + 1 || Math.abs(u) > p.reach + 1;
        if (out) {
          if (el.style.visibility !== "hidden") el.style.visibility = "hidden";
          continue;
        }
        const q = place(u, k % 2 ? -1 : 1, p);
        const hx = tiltX[k] || 0;
        const hy = tiltY[k] || 0;
        const held = Math.min(1, Math.hypot(hx, hy));
        el.style.visibility = "";
        el.style.transform =
          `translate3d(${f(q.x * 100, 4)}cqw, ${f(q.y * 100, 4)}cqw, ${f(q.z * 100, 4)}cqw) ` +
          `rotateX(${f(q.rx)}deg) rotateY(${f(q.ry)}deg) rotateZ(${f(q.rz)}deg) scale(${f(q.scale, 4)})`;
        el.style.opacity = String(f(q.opacity));
        el.style.zIndex = String(1000 - Math.round(q.away * 10) + (held > 0.04 ? 80 : 0));
        const face = el.children[0] as HTMLElement | undefined;
        const turn = held < 0.001
          ? ""
          : `translateZ(${f(held * HOVER_Z, 3)}cqw) rotateX(${f(hy * HOVER_DEG)}deg) rotateY(${f(-hx * HOVER_DEG)}deg)`;
        if (face) face.style.transform = turn;

        const parts = [];
        if (q.blur > 0.01) {
          parts.push(`blur(${f(q.blur)}px)`);
          const o = f(q.blur * p.rgbSplit);
          if (o > 0.01) {
            parts.push(`drop-shadow(${c.splitA} ${-o}px 0 0)`, `drop-shadow(${c.splitB} ${o}px 0 0)`);
          }
        }
        if (p.shadow) {
          parts.push(
            `drop-shadow(rgba(${c.shadow}, ${p.shadowStrength}) 0 ${f(8 + 10 * q.near, 2)}px ${f(18 + 15 * q.near, 2)}px)`,
          );
        }
        const photo = face?.querySelector<HTMLElement>(".dna__photo");
        if (photo) photo.style.filter = parts.join(" ");
        const still = photo?.querySelector<HTMLImageElement>("img:not([data-film='arrow'])");
        if (still && photo) {
          /* While the row scrolls, the still drags against the frame, up to 8px,
             then settles centered. The pointer drift sits on top, and it is already
             quiet while the scroll eases the turn off. The shift stays inside the
             picture that is already there. */
          const px = held < 0.02 ? 0 : -hx * 12;
          const py = held < 0.02 ? 0 : -hy * 12;
          const room = stillRoom(still, photo);
          const x = Math.max(-room.r, Math.min(room.l, slip.x + px));
          const y = Math.max(-room.b, Math.min(room.t, py));
          const quiet = Math.abs(x) < 0.05 && Math.abs(y) < 0.05;
          if (room.crop) {
            still.style.objectPosition = "";
            still.style.translate = quiet ? "" : `${f(x, 2)}px ${f(y, 2)}px`;
          } else {
            still.style.translate = "";
            still.style.objectPosition = quiet
              ? ""
              : `calc(50% + ${f(x, 2)}px) calc(50% + ${f(y, 2)}px)`;
          }
        }
        if (face) face.style.filter = "";
        el.style.filter = "";
      }

      const active = p.n
        ? linear
          ? Math.max(0, Math.min(p.n - 1, Math.round(m.pos)))
          : (((Math.round(m.pos) % S) + S) % S) % p.n
        : -1;
      if (active !== m.active) {
        m.active = active;
        cards.forEach((el, k) => el?.setAttribute("aria-hidden", p.n && k % p.n === active ? "false" : "true"));
        p.onChange?.(active);
      }
    };

    /* Which card the pointer is on, using the helix hit box rather than the
       turned face. A card already held keeps the pointer across a short gap. */
    const aimPointer = (rootEl: HTMLElement, reduced: boolean) => {
      if (reduced || !pointer.on) {
        hover.slot = -1;
        return;
      }
      const parent = rootEl.parentElement;
      if (parent && parent.style.visibility === "hidden") {
        hover.slot = -1;
        return;
      }
      const measure = (slot: number) => {
        const el = cardRefs.current[slot];
        const hit = el?.children[1] as HTMLElement | undefined;
        if (!el || el.style.visibility === "hidden" || !hit) return null;
        const r = hit.getBoundingClientRect();
        if (r.width < 8 || r.height < 8) return null;
        return {
          nx: (pointer.x - (r.left + r.width / 2)) / (r.width / 2),
          ny: (pointer.y - (r.top + r.height / 2)) / (r.height / 2),
        };
      };
      const under = document.elementFromPoint(pointer.x, pointer.y);
      const card = under?.closest?.("[data-slot]") as HTMLElement | null;
      const direct = card && rootEl.contains(card) && card.style.visibility !== "hidden"
        ? Number(card.dataset.slot)
        : -1;
      if (direct >= 0) {
        const at = measure(direct);
        if (!at) return;
        hover.slot = direct;
        hover.tx = clamp(at.nx, -1, 1);
        hover.ty = clamp(at.ny, -1, 1);
        return;
      }
      if (hover.slot >= 0) {
        const at = measure(hover.slot);
        if (at) {
          const outside = Math.max(Math.min(1.8, Math.abs(at.nx)), Math.min(1.8, Math.abs(at.ny)));
          const fall = outside <= 1 ? 1 : Math.max(0, 1 - (outside - 1) / 0.55);
          if (fall > 0) {
            hover.tx = clamp(at.nx, -1, 1) * fall;
            hover.ty = clamp(at.ny, -1, 1) * fall;
            return;
          }
        }
      }
      hover.slot = -1;
    };

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      /* Clamp so a backgrounded tab does not resume with one huge step. */
      const dt = Math.min(1 / 30, (t - last) / 1000);
      last = t;
      const p = props.current;
      if (!p?.slots) return;
      const before = m.pos;

      if (!drag) {
        if (m.target != null) {
          /* A slightly underdamped spring — enough give that a snap lands
             rather than stops, not enough to visibly bounce. */
          const k = 60 * p.snapStrength;
          const damp = 2 * Math.sqrt(k) * 0.92;
          m.vel += (k * (m.target - m.pos) - damp * m.vel) * dt;
          m.pos += m.vel * dt;
          if (Math.abs(m.target - m.pos) < 1e-4 && Math.abs(m.vel) < 1e-3) {
            m.pos = m.target;
            m.vel = 0;
            m.target = null;
            m.idleAt = now();
          }
        } else if (!p.scrollDriven && p.autoplay && !reduce.matches && now() - m.idleAt > p.resumeDelay) {
          /* Ease the drift in instead of starting at full speed. */
          m.drift += (p.autoplaySpeed - m.drift) * (1 - Math.exp(-dt / 0.8));
          m.pos += m.drift * dt;
        }
      }

      /* Keep the number small without ever moving a card: shifting by a
         whole loop leaves every `wrap(k - pos)` where it was. */
      const S = p.slots;
      if (Math.abs(m.pos) > S * 50) {
        const shift = Math.round(m.pos / S) * S;
        m.pos -= shift;
        if (m.target != null) m.target -= shift;
      }

      aimPointer(root, reduce.matches);
      const scrolling = performance.now() - hover.movedAt < 180;
      const allowTarget = scrolling || reduce.matches ? 0 : 1;
      hover.allow += (allowTarget - hover.allow) * (1 - Math.exp(-dt / 0.18));
      const kSpring = 420;
      const damp = 2 * Math.sqrt(kSpring) * 1.05;
      const count = cardRefs.current.length;
      let tilting = false;
      for (let k = 0; k < count; k++) {
        const wantX = k === hover.slot ? hover.tx * hover.allow : 0;
        const wantY = k === hover.slot ? hover.ty * hover.allow : 0;
        let x = tiltX[k] || 0;
        let y = tiltY[k] || 0;
        let vx = tiltVX[k] || 0;
        let vy = tiltVY[k] || 0;
        vx += (kSpring * (wantX - x) - damp * vx) * dt;
        vy += (kSpring * (wantY - y) - damp * vy) * dt;
        x += vx * dt;
        y += vy * dt;
        if (Math.abs(wantX) < 1e-3 && Math.abs(x) < 0.004 && Math.abs(vx) < 0.02) {
          x = 0;
          vx = 0;
        }
        if (Math.abs(wantY) < 1e-3 && Math.abs(y) < 0.004 && Math.abs(vy) < 0.02) {
          y = 0;
          vy = 0;
        }
        tiltX[k] = x;
        tiltY[k] = y;
        tiltVX[k] = vx;
        tiltVY[k] = vy;
        if (x !== 0 || y !== 0) tilting = true;
      }
      if (tilting || hover.slot >= 0) m.dirty = true;

      const pointed = hover.slot >= 0 ? hover.slot % p.n : null;
      if (pointed !== hover.sent) {
        hover.sent = pointed;
        p.onHover?.(pointed);
      }

      if (m.dirty || m.pos !== before || Math.abs(slip.x) > 0.05) {
        m.dirty = false;
        paint();
        if (Math.abs(slip.x) > 0.05) m.dirty = true;
      }
    };

    if (scrollDriven) {
      scrollHelixTo = (t: number, lead = 0) => {
        const p = props.current;
        if (!p?.n) return;
        const next = Math.max(0, Math.min(1, t)) * Math.max(0, p.n - 1);
        const nextLead = Math.max(0, lead);
        const delta = Math.abs(next - m.pos) + Math.abs(nextLead - m.lead) * 0.25;
        if (delta > 0.0015) hover.movedAt = performance.now();
        m.pos = next;
        m.lead = nextLead;
        m.vel = 0;
        m.target = null;
        m.drift = 0;
        paint();
      };
      window.addEventListener("pointermove", onHoverMove, { passive: true });
      document.addEventListener("pointerout", onHoverOut);
    } else {
      root.addEventListener("pointerdown", onDown);
      root.addEventListener("pointermove", onMove);
      root.addEventListener("pointerup", onUp);
      root.addEventListener("pointercancel", onUp);
      root.addEventListener("wheel", onWheel, { passive: false });
      root.addEventListener("keydown", onKey);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(wheelTimer);
      if (scrollHelixTo) scrollHelixTo = null;
      window.removeEventListener("pointermove", onHoverMove);
      document.removeEventListener("pointerout", onHoverOut);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onUp);
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("keydown", onKey);
    };
  }, []);

  const vars = {
    "--dna-aspect": aspect,
    "--dna-card-w": imageWidth,
    "--dna-card-h": imageHeight,
    "--dna-radius": typeof radius === "number" ? `${radius}px` : radius,
    "--dna-perspective": perspective,
    "--dna-bg": colours.background,
    "--dna-card": colours.card,
    "--dna-focus": colours.focus,
    ...style,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={`dna ${grabCursor ? "dna--grab" : ""} ${className}`.trim()}
      style={vars}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={keyboard ? 0 : undefined}
    >
      <div className="dna__viewport">
        <div className="dna__stage">
          {Array.from({ length: slots }, (_, k) => {
            const item = list[k % n];
            const image = item as ImageItem;
            return (
              <div
                key={k}
                ref={(el) => {
                  cardRefs.current[k] = el;
                }}
                className="dna__card"
                data-slot={k}
              >
                <div className="dna__face">
                  <div className="dna__photo">
                    {renderItem ? (
                      renderItem(item, k % n)
                    ) : (
                      <img src={image.src} alt={image.alt ?? ""} draggable={false} decoding="async" />
                    )}
                  </div>
                </div>
                <div className="dna__hit" data-hit="" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
