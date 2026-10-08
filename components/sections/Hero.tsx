"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { PORTFOLIO } from "@/content/portfolio";
import { Section } from "../Section";

const LINE = "Purposely designed to create great company.";
const INVEST = "We invest in emerging companies with ambitious ideas.";

const GLYPH_AT: number[] = [];
{
  let count = 0;
  for (const char of LINE) GLYPH_AT.push(char === " " ? -1 : count++);
}
const GLYPH_COUNT = GLYPH_AT.reduce((n, at) => (at >= 0 ? n + 1 : n), 0);

/**
 * Measured from the header reference (1920×1080, 8s).
 * Letters open upward from the baseline. A new letter starts every 200ms.
 * The line eases into a cruise and holds at 8s, when "company." is on screen.
 */
const GLYPH_DELAY_S = 0.1;
const GLYPH_STAGGER_S = 0.2;
const GLYPH_REVEAL_S = 0.4;
const TRAVEL_RAMP_S = 0.5;
const TRAVEL_END_S = 8;
const TRAVEL_PX_PER_S = 570;
const DESIGN_FONT = 197.56;
const START_X = 0.376;

/** Flower loader. The field starts as a small box on this center line. */
const AUTO_OPEN_MS = 1100;
const REVEAL_PORTION = 0.42;
const LINE_PORTION = 0.7;
const HANDOFF_PORTION = 0.82;
const FRAME_W = 1920;
const FRAME_H = 1080;
const SLIT_Y = 533;
const SLIT_H = 15;
const BOX_W = 120;

const DISPLAY_STACK = "var(--font-manifold), sans-serif";
const COMPANIES = PORTFOLIO.filter((company) => !company.hidden);

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 2);
}

function clamp01(t: number) {
  return Math.max(0, Math.min(1, t));
}

/** Distance traveled after a half-second ease into the cruise speed. */
function travelPx(seconds: number, speed: number) {
  const t = Math.max(0, Math.min(seconds, TRAVEL_END_S));
  const ramp = TRAVEL_RAMP_S;
  if (t <= ramp) return (0.5 * speed * t * t) / ramp;
  return 0.5 * speed * ramp + speed * (t - ramp);
}

export function Hero() {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const photoFillRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lineRef = useRef<HTMLHeadingElement>(null);
  const ruleRef = useRef<HTMLSpanElement>(null);
  const charsRef = useRef<Array<HTMLSpanElement | null>>([]);
  const metaRef = useRef<HTMLDivElement>(null);
  const estRef = useRef<HTMLParagraphElement>(null);
  const bostonRef = useRef<HTMLParagraphElement>(null);
  const metaMarkRef = useRef<HTMLImageElement>(null);
  const companiesRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const frame = frameRef.current;
    const photo = photoRef.current;
    const photoFill = photoFillRef.current;
    const video = videoRef.current;
    const line = lineRef.current;
    const rule = ruleRef.current;
    const meta = metaRef.current;
    const est = estRef.current;
    const boston = bostonRef.current;
    const mark = metaMarkRef.current;
    const companies = companiesRef.current;
    const stack = stackRef.current;
    const index = indexRef.current;
    const chars = charsRef.current.filter((span): span is HTMLSpanElement => span !== null);
    if (!track || !frame || !photo || !photoFill || !line || !meta || !est || !boston || !mark || !companies || !stack || chars.length !== LINE.length) return;

    if (reduce) {
      track.style.height = "auto";
      frame.style.position = "relative";
      frame.style.height = "auto";
      photo.style.position = "relative";
      photo.style.left = "0";
      photo.style.top = "0";
      photo.style.width = "100%";
      photo.style.height = "100vh";
      photo.style.clipPath = "none";
      photoFill.style.top = "0";
      photoFill.style.left = "0";
      photoFill.style.width = "100%";
      photoFill.style.height = "100%";
      if (video) video.pause();
      line.style.position = "relative";
      line.style.top = "auto";
      line.style.transform = "none";
      line.style.whiteSpace = "normal";
      line.style.maxWidth = "16ch";
      line.style.padding = "7rem 1.5rem 0";
      line.style.opacity = "1";
      for (const span of chars) span.style.clipPath = "none";
      meta.style.position = "relative";
      meta.style.top = "auto";
      meta.style.opacity = "1";
      meta.style.transform = "none";
      est.style.opacity = "1";
      boston.style.opacity = "1";
      mark.style.clipPath = "none";
      companies.style.position = "relative";
      companies.style.opacity = "1";
      companies.style.visibility = "visible";
      stack.style.transform = "none";
      if (index) index.style.display = "none";
      return;
    }

    let raf = 0;
    let running = true;
    const start = performance.now();

    const scrollProgress = () => {
      const rect = track.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return 0;
      return Math.max(0, Math.min(1, -rect.top / scrollable));
    };

    let glyphTop = 0;
    let glyphH = 0;
    let boxH = 0;
    const measureGlyph = () => {
      const probe = chars.find((span, i) => LINE[i] !== " " && span.firstChild);
      if (!probe || !probe.firstChild) return;
      const previous = probe.style.clipPath;
      probe.style.clipPath = "none";
      const range = document.createRange();
      range.setStart(probe.firstChild, 0);
      range.setEnd(probe.firstChild, probe.firstChild.textContent?.length || 1);
      const ink = range.getBoundingClientRect();
      const box = probe.getBoundingClientRect();
      probe.style.clipPath = previous;
      if (ink.height <= 0 || box.height <= 0) return;
      glyphTop = ink.top - box.top;
      glyphH = ink.height;
      boxH = box.height;
    };

    const apply = (elapsed: number, progress: number) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const fontSize = parseFloat(getComputedStyle(line).fontSize) || DESIGN_FONT;
      const open = clamp01(elapsed / (AUTO_OPEN_MS / 1000));
      const handoff = clamp01((progress - LINE_PORTION) / (HANDOFF_PORTION - LINE_PORTION));
      const fade = 1 - handoff;

      const sx = vw / FRAME_W;
      const sy = vh / FRAME_H;
      const boxHOpen = SLIT_H * sy;
      const centerY = (SLIT_Y + SLIT_H / 2) * sy;
      const startW = BOX_W * sx;
      const reveal = easeOut(clamp01(open / REVEAL_PORTION));
      const scaleT = easeOut(clamp01((open - REVEAL_PORTION) / (1 - REVEAL_PORTION)));
      const revealedW = startW + (vw - startW) * reveal;
      const windowH = boxHOpen + (vh - boxHOpen) * scaleT;
      const windowTop = centerY - windowH / 2;
      const wipe = handoff * revealedW;
      photo.style.left = "0px";
      photo.style.top = `${windowTop}px`;
      photo.style.width = `${Math.max(0, revealedW - wipe)}px`;
      photo.style.height = `${windowH}px`;
      photo.style.clipPath = "none";
      // The header reference is type on ink. The flower slit cuts through the letters.
      photo.style.visibility = "hidden";
      photoFill.style.left = "0px";
      photoFill.style.top = `${-windowTop}px`;
      photoFill.style.width = `${vw}px`;
      photoFill.style.height = `${vh}px`;

      if (glyphH <= 0) measureGlyph();
      // Letter widths on this face are wider than the reference frame, so the
      // cruise is the speed that brings the end of the line to the right edge
      // as "company." finishes, at 7.4s.
      const arrive = 7.4;
      const factor = 0.5 * TRAVEL_RAMP_S + (arrive - TRAVEL_RAMP_S);
      const lineWidth = line.scrollWidth;
      const startXpx = vw * START_X;
      const speed = lineWidth > 0 ? (startXpx - (vw * 1.04 - lineWidth)) / factor : TRAVEL_PX_PER_S * (fontSize / DESIGN_FONT);
      const x = startXpx - travelPx(elapsed, speed);
      const glyphCenter = glyphTop + glyphH / 2;
      const lineTop = vh * (531 / FRAME_H) - glyphCenter;
      line.style.top = `${lineTop}px`;
      line.style.transform = `translate3d(${x}px,0,0)`;
      line.style.opacity = String(fade);

      const scale = fontSize / DESIGN_FONT;
      meta.style.top = `${lineTop + glyphTop + glyphH + 28 * scale}px`;
      meta.style.transform = `translate3d(${x}px,0,0)`;
      meta.style.opacity = String(fade);
      meta.style.setProperty("--hero-s", String(scale));
      est.style.opacity = String(easeOut(clamp01((elapsed - 0.18) / 0.22)));
      boston.style.opacity = String(easeOut(clamp01((elapsed - 0.38) / 0.22)));
      const markP = easeOut(clamp01((elapsed - 0.55) / 0.4));
      mark.style.clipPath = `inset(0 ${(1 - markP) * 100}% 0 0)`;

      const bottomInset = Math.max(0, boxH - glyphTop - glyphH);
      for (let i = 0; i < chars.length; i++) {
        const at = GLYPH_AT[i];
        if (at < 0 || glyphH <= 0) {
          chars[i].style.clipPath = "none";
          continue;
        }
        const p = easeOut(clamp01((elapsed - GLYPH_DELAY_S - at * GLYPH_STAGGER_S) / GLYPH_REVEAL_S));
        const top = glyphTop + (1 - p) * glyphH;
        chars[i].style.clipPath = `inset(${top}px 0 ${bottomInset}px 0)`;
      }

      companies.style.opacity = String(handoff);
      companies.style.visibility = handoff > 0.02 ? "visible" : "hidden";
      const extra = Math.max(0, stack.scrollHeight - (stack.parentElement?.clientHeight || vh));
      const listT = clamp01((progress - HANDOFF_PORTION) / (1 - HANDOFF_PORTION));
      stack.style.transform = `translate3d(0, ${-extra * listT}px, 0)`;

      if (index) index.style.opacity = String(clamp01(elapsed / 0.4) * fade);
      if (rule) rule.style.transform = `scaleX(${0.2 + 0.8 * clamp01(elapsed / TRAVEL_END_S)})`;
    };

    const frameTick = (now: number) => {
      if (!running) return;
      const elapsed = (now - start) / 1000;
      apply(elapsed, scrollProgress());
      if (elapsed < TRAVEL_END_S) raf = requestAnimationFrame(frameTick);
    };
    raf = requestAnimationFrame(frameTick);

    const onScroll = () => {
      if (!running) return;
      apply(Math.min(TRAVEL_END_S, (performance.now() - start) / 1000), scrollProgress());
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("lenis-scroll", onScroll);
    window.addEventListener("resize", onScroll);
    document.fonts.ready.then(() => {
      if (!running) return;
      glyphH = 0;
      apply(Math.min(TRAVEL_END_S, (performance.now() - start) / 1000), scrollProgress());
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
            className="absolute overflow-hidden"
            style={{
              left: 0,
              top: "calc(100vh * 533 / 1080)",
              width: "calc(100vw * 120 / 1920)",
              height: "calc(100vh * 15 / 1080)",
            }}
          >
            <div
              ref={photoFillRef}
              className="absolute"
              style={{
                left: 0,
                top: "calc(100vh * -533 / 1080)",
                width: "100vw",
                height: "100vh",
              }}
            >
              <video
                ref={videoRef}
                src="/hero-flowers.webm"
                poster="/hero-flowers.png"
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>

          <h1
            ref={lineRef}
            className="pointer-events-none absolute left-0 z-30 whitespace-nowrap uppercase leading-none tracking-[-0.04em] text-[clamp(64px,10.3vw,198px)]"
            style={{
              fontFamily: DISPLAY_STACK,
              fontWeight: 800,
              fontSynthesis: "none",
              top: "42vh",
              transform: "translate3d(37.6vw, 0, 0)",
            }}
          >
            {LINE.split("").map((char, i) => (
              <span
                key={i}
                ref={(node) => {
                  charsRef.current[i] = node;
                }}
                className="inline-block"
                style={{ clipPath: char === " " ? "none" : "inset(100% 0 0 0)" }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h1>

          <div
            ref={metaRef}
            className="pointer-events-none absolute left-0 z-30 flex flex-col items-start uppercase leading-[1.2]"
            style={{
              top: "58vh",
              transform: "translate3d(37.6vw, 0, 0)",
              width: "calc(1197px * var(--hero-s))",
              gap: "calc(28px * var(--hero-s))",
              fontSize: "calc(24px * var(--hero-s))",
              fontFamily: "var(--font-archivo), sans-serif",
              ["--hero-s" as string]: 0.5,
            }}
          >
            <div className="flex w-full flex-col items-start gap-2 mobile:flex-row mobile:items-start mobile:justify-between mobile:gap-6">
              <p style={{ maxWidth: "calc(444px * var(--hero-s))" }}>{INVEST}</p>
              <p ref={estRef} className="shrink-0 whitespace-nowrap" style={{ opacity: 0 }}>
                est. 2020
              </p>
              <p ref={bostonRef} className="shrink-0 whitespace-nowrap" style={{ opacity: 0 }}>
                Boston, Massachusetts, u.s.a.
              </p>
            </div>
            <img
              ref={metaMarkRef}
              src="/hero-meta-mark.svg"
              alt=""
              style={{
                width: "calc(200.4px * var(--hero-s))",
                height: "calc(39.8px * var(--hero-s))",
                clipPath: "inset(0 100% 0 0)",
              }}
            />
          </div>

          <p
            ref={indexRef}
            className="absolute bottom-8 left-6 z-30 flex items-center gap-2 uppercase text-[16px] mobile:left-12"
            style={{ fontFamily: "var(--font-jetbrains), ui-monospace, monospace", opacity: 0 }}
          >
            <span>01</span>
            <span className="relative block h-[2px] w-[118px] bg-white/40">
              <span ref={ruleRef} className="absolute inset-y-0 left-0 w-full origin-left bg-white" style={{ transform: "scaleX(0.2)" }} />
            </span>
          </p>

          <div ref={companiesRef} className="invisible absolute inset-0 z-20 overflow-hidden bg-ink">
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
                      <span className="text-[clamp(28px,2.5vw,40px)] leading-none" style={{ fontFamily: "var(--font-archivo), sans-serif" }}>
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
