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
  return {
    x: u * p.step,
    y: s * (p.sway * Math.cos(th / 2) + p.helixSpread * sn),
    z: p.depth * c,
    rx: p.tilt * sn,
    ry: s * p.rotation * c,
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

/** The page scroll writes this. `t` 0 is the first card. `t` 1 is the last. */
let scrollHelixTo: ((t: number) => void) | null = null;

export function scrollHelix(t: number) {
  scrollHelixTo?.(t);
}

type ImageItem = { src: string; alt?: string };

type Motion = {
  pos: number;
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
  };

  const motion = useRef<Motion | null>(null);
  if (!motion.current) {
    motion.current = {
      pos: startIndex,
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
    const paint = () => {
      const p = props.current;
      if (!p) return;
      const cards = cardRefs.current;
      const S = p.slots;
      const c = p.colours;
      for (let k = 0; k < S; k++) {
        const el = cards[k];
        if (!el) continue;
        const u = wrap(k - m.pos, S);
        /* Nothing sits to the left of the company in front. The ones still
           ahead stay on the right. A card that has passed is out. */
        if (u < -0.85 || Math.abs(u) > p.reach + 1) {
          if (el.style.visibility !== "hidden") el.style.visibility = "hidden";
          continue;
        }
        const q = place(u, k % 2 ? -1 : 1, p);
        el.style.visibility = "";
        el.style.transform =
          `translate3d(${f(q.x * 100, 4)}cqw, ${f(q.y * 100, 4)}cqw, ${f(q.z * 100, 4)}cqw) ` +
          `rotateX(${f(q.rx)}deg) rotateY(${f(q.ry)}deg) rotateZ(${f(q.rz)}deg) scale(${f(q.scale, 4)})`;
        el.style.opacity = String(f(q.opacity));
        el.style.zIndex = String(1000 - Math.round(q.away * 10));

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
        el.style.filter = parts.join(" ");
      }

      const active = p.n ? (((Math.round(m.pos) % S) + S) % S) % p.n : -1;
      if (active !== m.active) {
        m.active = active;
        cards.forEach((el, k) => el?.setAttribute("aria-hidden", p.n && k % p.n === active ? "false" : "true"));
        p.onChange?.(active);
      }
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

      if (m.dirty || m.pos !== before) {
        m.dirty = false;
        paint();
      }
    };

    if (scrollDriven) {
      scrollHelixTo = (t: number) => {
        const p = props.current;
        if (!p?.n) return;
        m.pos = Math.max(0, Math.min(1, t)) * Math.max(0, p.n - 1);
        m.vel = 0;
        m.target = null;
        m.drift = 0;
        paint();
      };
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
                {renderItem ? (
                  renderItem(item, k % n)
                ) : (
                  <img src={image.src} alt={image.alt ?? ""} draggable={false} decoding="async" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
