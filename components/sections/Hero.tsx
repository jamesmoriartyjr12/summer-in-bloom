"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { PORTFOLIO } from "@/content/portfolio";
import { Section } from "../Section";

const LINE = "Purposely designed to build and scale companies.";
const LOCK_AT = LINE.toLowerCase().indexOf("companies");
const LOCK_END = LOCK_AT + "companies.".length;
const INVEST = "We invest in emerging companies with ambitious ideas.";

const DESIGN_OPTIONS = [
  "product design",
  "Branding identity design",
  "user experience",
  "3D & motion",
  "ux strategy",
];
const BUILD_OPTIONS = [
  "web & development",
  "integrations",
  "devops & architecture",
  "product analytics",
];
const SCALE_OPTIONS = ["investing"];

function BeatOptions({ word, items }: { word: string; items: string[] }) {
  return (
    <div
      data-word={word}
      className="absolute left-0 top-0 flex items-start uppercase leading-[1.2]"
      style={{ gap: "calc(28px * var(--hero-s))" }}
    >
      <img
        src="/hero-beat-mark.svg"
        alt=""
        style={{ width: "calc(53.95px * var(--hero-s))", height: "calc(28.69px * var(--hero-s))" }}
      />
      <div
        className="flex flex-col justify-between"
        style={{ fontFamily: "var(--font-jetbrains), ui-monospace, monospace", fontSize: "calc(14px * var(--hero-s))" }}
      >
        {items.map((_, index) => (
          <p key={index}>(O{index + 1})</p>
        ))}
      </div>
      <div
        className="flex flex-col whitespace-nowrap"
        style={{
          fontFamily: "var(--font-archivo), sans-serif",
          fontSize: "calc(24px * var(--hero-s))",
          gap: "calc(4px * var(--hero-s))",
        }}
      >
        {items.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
    </div>
  );
}

/** Kayla owns this. The explorations file has no keyframes. */
const AUTO_OPEN_MS = 1100;
/** Share of the track used to travel the line. Kayla owns the distance. */
const LINE_PORTION = 0.7;
const HANDOFF_PORTION = 0.82;

const DISPLAY_STACK = "var(--font-manifold), sans-serif";

const COMPANIES = PORTFOLIO.filter((company) => !company.hidden);

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Scroll frame 43:652. The sentence is centered on this cubic, then a 162px
 * band at y=440 cuts through the glyphs. Design size is 1920×1080.
 */
const PATH_FONT = 197.5609588623047;
const FRAME_W = 1920;
const BAND_H = 162;
const BAND_CENTER_NUDGE = 19;
const LOCK_X = 372;
/** Where the viewport's left edge sits on the curve, already into the bend. */
const GATE_D = 2400;
type Cubic = [number, number][];
type PathSample = { x: number; y: number; angle: number };
type PathRun = { cubic: Cubic; length: number; point: (distance: number) => PathSample };

function buildPath(cubic: Cubic): PathRun {
  const point = (t: number, axis: 0 | 1) => {
    const u = 1 - t;
    return (
      u * u * u * cubic[0][axis] +
      3 * u * u * t * cubic[1][axis] +
      3 * u * t * t * cubic[2][axis] +
      t * t * t * cubic[3][axis]
    );
  };
  const tangent = (t: number, axis: 0 | 1) => {
    const u = 1 - t;
    return (
      3 * u * u * (cubic[1][axis] - cubic[0][axis]) +
      6 * u * t * (cubic[2][axis] - cubic[1][axis]) +
      3 * t * t * (cubic[3][axis] - cubic[2][axis])
    );
  };
  const steps = 500;
  const table = [{ t: 0, len: 0 }];
  let length = 0;
  let prevX = point(0, 0);
  let prevY = point(0, 1);
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = point(t, 0);
    const y = point(t, 1);
    length += Math.hypot(x - prevX, y - prevY);
    table.push({ t, len: length });
    prevX = x;
    prevY = y;
  }
  const sample = (distance: number): PathSample => {
    const angleAt = (t: number) => Math.atan2(tangent(t, 1), tangent(t, 0));
    if (distance <= 0) {
      const angle = angleAt(0);
      return {
        x: cubic[0][0] + Math.cos(angle) * distance,
        y: cubic[0][1] + Math.sin(angle) * distance,
        angle: (angle * 180) / Math.PI,
      };
    }
    if (distance >= length) {
      const angle = angleAt(1);
      const over = distance - length;
      return {
        x: cubic[3][0] + Math.cos(angle) * over,
        y: cubic[3][1] + Math.sin(angle) * over,
        angle: (angle * 180) / Math.PI,
      };
    }
    let lo = 0;
    let hi = table.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (table[mid].len < distance) lo = mid + 1;
      else hi = mid;
    }
    const b = table[lo];
    const a = table[Math.max(0, lo - 1)];
    const span = b.len - a.len;
    const t = span === 0 ? b.t : a.t + ((distance - a.len) / span) * (b.t - a.t);
    const angle = angleAt(t);
    return { x: point(t, 0), y: point(t, 1), angle: (angle * 180) / Math.PI };
  };
  return { cubic, length, point: sample };
}

const SENTENCE = buildPath([
  [0, 13.760767936706543],
  [1774, 13.760780334472656],
  [2688, -138.3201904296875],
  [5599, 568.6798706054688],
]);
export function Hero() {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLImageElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLHeadingElement>(null);
  const ruleRef = useRef<HTMLSpanElement>(null);
  const charsRef = useRef<Array<HTMLSpanElement | null>>([]);
  const metaRef = useRef<HTMLDivElement>(null);
  const metaMarkRef = useRef<HTMLImageElement>(null);
  const beatsRef = useRef<HTMLDivElement>(null);
  const companiesRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const frame = frameRef.current;
    const photo = photoRef.current;
    const mark = markRef.current;
    const band = bandRef.current;
    const line = lineRef.current;
    const rule = ruleRef.current;
    const meta = metaRef.current;
    const beats = beatsRef.current;
    const companies = companiesRef.current;
    const stack = stackRef.current;
    const index = indexRef.current;
    const chars = charsRef.current.filter((span): span is HTMLSpanElement => span !== null);
    if (!track || !frame || !photo || !band || !line || !meta || !beats || !companies || !stack || chars.length !== LINE.length) return;

    if (reduce) {
      track.style.height = "auto";
      frame.style.position = "relative";
      frame.style.height = "auto";
      photo.style.position = "relative";
      photo.style.height = "100vh";
      photo.style.clipPath = "none";
      if (mark) mark.style.display = "none";
      band.style.position = "relative";
      band.style.top = "auto";
      band.style.height = "auto";
      band.style.overflow = "visible";
      line.style.position = "relative";
      line.style.height = "auto";
      line.style.whiteSpace = "normal";
      line.style.maxWidth = "16ch";
      line.style.padding = "7rem 1.5rem 0";
      for (const span of chars) {
        span.style.position = "static";
        span.style.transform = "none";
        span.style.opacity = "1";
      }
      meta.style.position = "relative";
      meta.style.opacity = "1";
      meta.style.transform = "none";
      beats.style.position = "relative";
      beats.style.opacity = "1";
      beats.style.top = "auto";
      for (const beat of beats.querySelectorAll<HTMLElement>("[data-word]")) {
        beat.style.position = "relative";
        beat.style.transform = "none";
      }
      companies.style.position = "relative";
      companies.style.opacity = "1";
      companies.style.visibility = "visible";
      stack.style.transform = "none";
      if (index) index.style.display = "none";
      return;
    }

    let auto = 0;
    let raf = 0;
    let running = true;
    const start = performance.now();

    const scrollProgress = () => {
      const rect = track.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return 0;
      return Math.max(0, Math.min(1, -rect.top / scrollable));
    };

    let measured: { fontSize: number; offsets: number[]; total: number } | null = null;
    const charX = new Float64Array(LINE.length);
    const charY = new Float64Array(LINE.length);
    const charAngle = new Float64Array(LINE.length);
    const measure = (fontSize: number) => {
      if (measured && measured.fontSize === fontSize) return measured;
      const tracking = fontSize * -0.04;
      const wordGap = fontSize * 0.32;
      const offsets: number[] = [];
      let total = 0;
      for (let i = 0; i < chars.length; i++) {
        offsets.push(total);
        total += chars[i].offsetWidth + tracking + (LINE[i] === " " ? wordGap : 0);
      }
      measured = { fontSize, offsets, total };
      return measured;
    };

    const apply = (open: number, progress: number) => {
      const vw = window.innerWidth;
      const openE = easeOut(Math.max(0, Math.min(1, open)));
      const handoff = Math.max(
        0,
        Math.min(1, (progress - LINE_PORTION) / (HANDOFF_PORTION - LINE_PORTION))
      );
      const lineT = Math.max(0, Math.min(1, progress / LINE_PORTION));
      const fontSize = parseFloat(getComputedStyle(line).fontSize) || PATH_FONT;
      const layout = measure(fontSize);
      const offsets = layout.offsets;
      const total = layout.total;
      const wordStart = offsets[LOCK_AT] ?? 0;
      const pathScale = fontSize / PATH_FONT;
      const bandH = BAND_H * pathScale;
      const vh = window.innerHeight;
      const bandTop = vh / 2 - bandH / 2 - BAND_CENTER_NUDGE * pathScale;
      band.style.top = `${bandTop}px`;

      const wordWidth = total - wordStart;
      const restLeft = Math.min((LOCK_X / FRAME_W) * vw, vw - wordWidth - 24);
      const restInk = bandH - Math.max(12, fontSize * 0.48);
      const arc = fontSize * 0.85;
      band.style.height = `${bandH}px`;
      band.style.overflow = "visible";
      band.style.clipPath = "inset(-100vh 0 0 0)";
      const openRemaining = wordStart - restLeft + 48;
      const enterRemaining = openRemaining + vw + 320;
      const remaining =
        openE < 1
          ? enterRemaining + (openRemaining - enterRemaining) * openE
          : openRemaining * (1 - lineT);

      photo.style.clipPath =
        handoff > 0 ? `inset(0 ${handoff * 100}% 0 0)` : `inset(${(1 - openE) * 46}% 0 ${(1 - openE) * 46}% 0)`;

      if (mark) mark.style.opacity = String(1 - openE);
      const lineLeft = restLeft - wordStart + remaining;
      const locked = openE >= 1 && lineT >= 1;
      // One curve across the whole viewport. The left is the shallow part of that same path.
      const span = vw * 0.95;
      const shift = vw * 0.35;
      const tAt = (x: number) => (x + shift) / span;
      const dropAt = (t: number) => arc * t * t;
      const baseDrop = dropAt(tAt(0));
      const at = (x: number) => {
        const t = tAt(x);
        const slope = (2 * arc * t) / span;
        return {
          y: restInk + dropAt(t) - baseDrop,
          angle: (Math.atan(slope) * 180) / Math.PI,
        };
      };
      let cursor = 0;
      while (cursor < LINE.length) {
        if (LINE[cursor] === " ") {
          cursor += 1;
          continue;
        }
        const start = cursor;
        let end = cursor;
        while (end < LINE.length && LINE[end] !== " ") end += 1;
        const last = Math.min(LINE.length, end + 1);
        const endAlong = last < offsets.length ? offsets[last] : total;
        const centerAlong = (offsets[start] + endAlong) * 0.5;
        const centerX = lineLeft + centerAlong;
        const pose = at(centerX);
        let baseline = pose.y;
        let angle = pose.angle;
        if (locked && start >= LOCK_AT) {
          baseline += (restInk - baseline) * handoff;
          angle *= 1 - handoff;
        }
        const rad = (angle * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        for (let i = start; i < last; i++) {
          const dx = offsets[i] - centerAlong;
          charX[i] = centerX + dx * cos;
          charY[i] = baseline + dx * sin;
          charAngle[i] = angle;
        }
        cursor = last;
      }
      if (beats) {
        const phone = vw < 600;
        const beatScale = phone ? Math.max(pathScale, 0.58) : pathScale;
        beats.style.top = `${bandTop + bandH + (phone ? 20 : 36 * pathScale)}px`;
        beats.style.opacity = String(openE * (1 - handoff));
        beats.style.setProperty("--hero-s", String(beatScale));
        const lockX = phone ? 24 : 48;
        const gap = phone ? 16 : 36 * pathScale;
        if (meta) {
          meta.style.width = phone
            ? `${Math.max(180, vw - lockX - 20)}px`
            : "calc(1197px * var(--hero-s))";
        }
        const places = [...beats.querySelectorAll<HTMLElement>("[data-word]")].map((beat) => {
          const at = LINE.toLowerCase().indexOf(beat.dataset.word ?? "");
          return { beat, x: charX[at] ?? 0, width: Math.max(beat.offsetWidth, 1) };
        });
        let holder = -1;
        for (let i = 0; i < places.length; i++) {
          if (places[i].x <= lockX) holder = i;
          else break;
        }
        const leaving = holder >= 0 ? places[holder + 1] : undefined;
        const edge = holder >= 0 ? lockX + places[holder].width + gap : lockX;
        const replacing = Boolean(leaving && leaving.x < edge);
        const travel = replacing && leaving ? edge - leaving.x : 0;
        const fade = Math.max(1, edge - lockX);
        const gone = Math.max(0, Math.min(1, travel / fade));
        const leave = gone * gone;
        for (let i = 0; i < places.length; i++) {
          const { beat, x } = places[i];
          beat.style.transition = "none";
          beat.style.zIndex = i === holder + 1 ? "2" : "1";
          if (holder >= 0 && i === holder && replacing) {
            beat.style.opacity = String(1 - leave);
            beat.style.transform = `translate3d(${lockX - travel}px, 0, 0)`;
          } else if (holder >= 0 && i === holder) {
            beat.style.opacity = "1";
            beat.style.transform = `translate3d(${lockX}px, 0, 0)`;
          } else if (i > holder) {
            beat.style.opacity = "1";
            beat.style.transform = `translate3d(${x}px, 0, 0)`;
          } else {
            beat.style.opacity = "0";
            beat.style.transform = `translate3d(${x}px, 0, 0)`;
          }
        }
      }

      for (let i = 0; i < chars.length; i++) {
        const span = chars[i];
        const isLock = i >= LOCK_AT && i < LOCK_END;
        const baseline = charY[i];
        const drop = baseline - restInk;
        const onPath = drop <= arc ? 1 : Math.max(0, 1 - (drop - arc) / (fontSize * 0.55));
        const opacity = locked && isLock ? 1 : locked ? (1 - handoff) * onPath : onPath;
        span.style.transformOrigin = "0% 100%";
        span.style.transform = `translate(${charX[i]}px, ${baseline - fontSize}px) rotate(${charAngle[i]}deg)`;
        span.style.opacity = String(Math.max(0, opacity));
      }
      if (rule) rule.style.transform = `scaleX(${0.2 + 0.75 * Math.max(lineT, handoff)})`;

      companies.style.opacity = String(handoff);
      companies.style.visibility = handoff > 0.02 ? "visible" : "hidden";

      const extra = Math.max(0, stack.scrollHeight - (stack.parentElement?.clientHeight || window.innerHeight));
      const listT = Math.max(
        0,
        Math.min(1, (progress - HANDOFF_PORTION) / (1 - HANDOFF_PORTION))
      );
      stack.style.transform = `translate3d(0, ${-extra * listT}px, 0)`;

      const indexLabel = index?.querySelector("span");
      if (indexLabel) indexLabel.textContent = handoff > 0.5 ? "02" : "01";
    };

    const frameTick = (now: number) => {
      if (!running) return;
      auto = Math.min(1, (now - start) / AUTO_OPEN_MS);
      apply(auto, scrollProgress());
      if (auto < 1) raf = requestAnimationFrame(frameTick);
    };
    raf = requestAnimationFrame(frameTick);

    const onScroll = () => {
      if (auto < 1) return;
      apply(1, scrollProgress());
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("lenis-scroll", onScroll);
    window.addEventListener("resize", onScroll);
    document.fonts.ready.then(() => {
      if (!running) return;
      measured = null;
      apply(Math.min(1, (performance.now() - start) / AUTO_OPEN_MS), scrollProgress());
    });

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("lenis-scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduce]);

  return (
    <div ref={trackRef} className="relative h-[560vh]">
      <div ref={frameRef} className="sticky top-0 z-0 h-screen overflow-hidden bg-ink text-[#FAF6EC]">
        <Section id="hero" theme="dark" className="relative h-full">
          <div
            ref={photoRef}
            className="absolute inset-0"
            style={{ clipPath: "inset(46% 0 46% 0)" }}
          >
            <Image
              src="/hero-flowers.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>

          <img
            ref={markRef}
            src="/bloom-logo-white.svg"
            alt=""
            className="pointer-events-none absolute right-[12%] top-1/2 z-10 h-6 w-auto -translate-y-1/2"
          />

          <div
            ref={bandRef}
            className="pointer-events-none absolute left-0 right-0 z-30"
            style={{ clipPath: "inset(-100vh 0 0 0)" }}
          >
            <h1
              ref={lineRef}
              className="absolute inset-0 uppercase leading-none tracking-[-0.04em] text-[clamp(72px,10.3vw,188px)]"
              style={{
                fontFamily: DISPLAY_STACK,
                fontWeight: 800,
              }}
            >
              {LINE.split("").map((char, i) => (
                <span
                  key={i}
                  ref={(node) => {
                    charsRef.current[i] = node;
                  }}
                  className="absolute left-0 top-0 inline-block"
                  style={{ transformOrigin: "0% 100%", transform: "translate3d(110vw, 0, 0)" }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </h1>
          </div>

          <div
            ref={beatsRef}
            className="pointer-events-none absolute left-0 z-10 text-[#FAF6EC]"
            style={{ opacity: 0, ["--hero-s" as string]: 0.5 }}
          >
            <div
              ref={metaRef}
              data-word="purposely"
              className="absolute left-0 top-0 flex flex-col items-start uppercase leading-[1.2]"
              style={{
                width: "calc(1197px * var(--hero-s))",
                gap: "calc(36px * var(--hero-s))",
                fontSize: "calc(24px * var(--hero-s))",
                fontFamily: "var(--font-archivo), sans-serif",
              }}
            >
              <div className="flex w-full flex-col items-start gap-2 mobile:flex-row mobile:justify-between mobile:gap-6">
                <p style={{ maxWidth: "calc(444px * var(--hero-s))" }}>{INVEST}</p>
                <p className="shrink-0 whitespace-nowrap">est. 2020</p>
                <p className="shrink-0 whitespace-nowrap">Boston, Massachusetts, u.s.a.</p>
              </div>
              <img
                ref={metaMarkRef}
                src="/hero-meta-mark.svg"
                alt=""
                style={{ width: "calc(200.4px * var(--hero-s))", height: "calc(39.8px * var(--hero-s))" }}
              />
            </div>
            <BeatOptions word="designed" items={DESIGN_OPTIONS} />
            <BeatOptions word="build" items={BUILD_OPTIONS} />
            <BeatOptions word="scale" items={SCALE_OPTIONS} />
          </div>

          <p
            ref={indexRef}
            className="absolute bottom-8 left-6 z-30 flex items-center gap-2 uppercase text-[16px] mobile:left-12"
            style={{ fontFamily: "var(--font-jetbrains), ui-monospace, monospace" }}
          >
            <span>01</span>
            <span className="relative block h-[2px] w-[118px] bg-white/40">
              <span ref={ruleRef} className="absolute inset-y-0 left-0 w-full origin-left bg-white" style={{ transform: "scaleX(0.2)" }} />
            </span>
          </p>

          <div
            ref={companiesRef}
            className="invisible absolute inset-0 z-20 overflow-hidden bg-ink"
          >
            <div className="absolute inset-x-0 bottom-0 top-[62%] overflow-hidden">
            <div ref={stackRef}>
              <div
                className="mt-10 flex items-baseline justify-between px-6 uppercase text-[14px] leading-[1.4] mobile:px-12"
                style={{ fontFamily: "var(--font-jetbrains), ui-monospace, monospace" }}
              >
                <span>( Selected work )</span>
                <span>( Our role )</span>
              </div>
              <ul className="mt-2 border-t border-[#ddd]/10">
                {COMPANIES.map((company) => (
                  <li
                    key={company.name}
                    className="flex min-h-[88px] items-center justify-between gap-6 border-b border-[#ddd]/10 px-6 py-6 mobile:min-h-[120px] mobile:px-12 mobile:py-8"
                  >
                    <span
                      className="text-[clamp(28px,2.5vw,40px)] leading-none"
                      style={{ fontFamily: "var(--font-archivo), sans-serif" }}
                    >
                      {company.name}
                    </span>
                    <span
                      className="shrink-0 uppercase text-[14px] leading-[1.4]"
                      style={{ fontFamily: "var(--font-jetbrains), ui-monospace, monospace" }}
                    >
                      {company.stage}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
