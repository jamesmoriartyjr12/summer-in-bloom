"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { PORTFOLIO } from "@/content/portfolio";
import { Section } from "../Section";

const LINE = "Purposely designed to create great company.";
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

const GLYPH_AT: number[] = [];
{
  let count = 0;
  for (const char of LINE) GLYPH_AT.push(char === " " ? -1 : count++);
}

/**
 * Measured from the header reference, then played by scroll.
 * Letters open upward from the baseline. A new letter starts every 200ms of that timeline.
 */
const GLYPH_DELAY_S = 0.1;
const GLYPH_STAGGER_S = 0.2;
const GLYPH_REVEAL_S = 0.4;
/** At rest the first letter is already opening, so the screen is not empty. */
const REST_ELAPSED_S = 0.32;
const TRAVEL_RAMP_S = 0.5;
const TRAVEL_END_S = 8;
const TRAVEL_PX_PER_S = 570;
const DESIGN_FONT = 197.56;
const START_X = 0.376;

/** Share of the track used to travel the line. The rest hands off to the companies list. */
const LINE_PORTION = 0.7;
const HANDOFF_PORTION = 0.82;
const FRAME_H = 1080;

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
  const beatsRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
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
    const companies = companiesRef.current;
    const stack = stackRef.current;
    const index = indexRef.current;
    const beats = beatsRef.current;
    const chars = charsRef.current.filter((span): span is HTMLSpanElement => span !== null);
    if (!track || !frame || !photo || !photoFill || !line || !beats || !meta || !companies || !stack || chars.length !== LINE.length) return;

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
      beats.style.position = "relative";
      beats.style.opacity = "1";
      beats.style.top = "auto";
      for (const beat of beats.querySelectorAll<HTMLElement>("[data-word]")) {
        beat.style.position = "relative";
        beat.style.transform = "none";
        beat.style.opacity = "1";
      }
      meta.style.position = "relative";
      meta.style.opacity = "1";
      meta.style.transform = "none";
      companies.style.position = "relative";
      companies.style.opacity = "1";
      companies.style.visibility = "visible";
      stack.style.transform = "none";
      if (index) index.style.display = "none";
      return;
    }

    let running = true;

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

    const apply = (progress: number) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const fontSize = parseFloat(getComputedStyle(line).fontSize) || DESIGN_FONT;
      const handoff = clamp01((progress - LINE_PORTION) / (HANDOFF_PORTION - LINE_PORTION));
      const fade = 1 - handoff;
      const elapsed =
        REST_ELAPSED_S + clamp01(progress / LINE_PORTION) * (TRAVEL_END_S - REST_ELAPSED_S);
      photo.style.visibility = "hidden";

      if (glyphH <= 0) measureGlyph();
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

      const charX = new Float64Array(chars.length);
      let cursor = x;
      for (let i = 0; i < chars.length; i++) {
        charX[i] = cursor;
        cursor += chars[i].offsetWidth;
      }

      const scale = fontSize / DESIGN_FONT;
      const phone = vw < 600;
      beats.style.top = `${lineTop + glyphTop + glyphH + (phone ? 20 : 28 * scale)}px`;
      beats.style.opacity = String(fade);
      beats.style.setProperty("--hero-s", String(phone ? Math.max(scale, 0.58) : scale));
      const lockX = phone ? 24 : 48;
      const gap = phone ? 16 : 36 * scale;
      meta.style.width = phone ? `${Math.max(180, vw - lockX - 20)}px` : "calc(1197px * var(--hero-s))";
      const places = [...beats.querySelectorAll<HTMLElement>("[data-word]")].map((beat) => {
        const at = LINE.toLowerCase().indexOf(beat.dataset.word ?? "");
        return { beat, x: at >= 0 ? charX[at] ?? 0 : vw, width: Math.max(beat.offsetWidth, 1) };
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
      const span = Math.max(1, edge - lockX);
      const leave = Math.pow(Math.max(0, Math.min(1, travel / span)), 2);
      for (let i = 0; i < places.length; i++) {
        const { beat, x: wordX } = places[i];
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
          beat.style.transform = `translate3d(${wordX}px, 0, 0)`;
        } else {
          beat.style.opacity = "0";
          beat.style.transform = `translate3d(${wordX}px, 0, 0)`;
        }
      }

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

    const onScroll = () => {
      if (!running) return;
      apply(scrollProgress());
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("lenis-scroll", onScroll);
    window.addEventListener("resize", onScroll);
    document.fonts.ready.then(() => {
      if (!running) return;
      glyphH = 0;
      apply(scrollProgress());
    });
    apply(scrollProgress());

    return () => {
      running = false;
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
            ref={beatsRef}
            className="pointer-events-none absolute left-0 z-30 text-[#FAF6EC]"
            style={{ opacity: 0, top: "58vh", ["--hero-s" as string]: 0.5 }}
          >
            <div
              ref={metaRef}
              data-word="purposely"
              className="absolute left-0 top-0 flex flex-col items-start uppercase leading-[1.2]"
              style={{
                width: "calc(1197px * var(--hero-s))",
                gap: "calc(28px * var(--hero-s))",
                fontSize: "calc(24px * var(--hero-s))",
                fontFamily: "var(--font-archivo), sans-serif",
              }}
            >
              <div className="flex w-full flex-col items-start gap-2 mobile:flex-row mobile:items-start mobile:justify-between mobile:gap-6">
                <p style={{ maxWidth: "calc(444px * var(--hero-s))" }}>{INVEST}</p>
                <p className="shrink-0 whitespace-nowrap">est. 2020</p>
                <p className="shrink-0 whitespace-nowrap">Boston, Massachusetts, u.s.a.</p>
              </div>
              <img
                src="/hero-meta-mark.svg"
                alt=""
                style={{ width: "calc(200.4px * var(--hero-s))", height: "calc(39.8px * var(--hero-s))" }}
              />
            </div>
            <BeatOptions word="designed" items={DESIGN_OPTIONS} />
            <BeatOptions word="create" items={BUILD_OPTIONS} />
            <BeatOptions word="company" items={SCALE_OPTIONS} />
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
