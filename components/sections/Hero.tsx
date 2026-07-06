"use client";

import { useRef, useEffect, useState } from "react";
import { Section } from "../Section";

const TEXT =
  "We built this fund to give our LPs exposure to the success of our studio, where we work side by side with early-stage companies and guide them through hypergrowth.";
const WORDS = TEXT.split(" ");

const PARA_END   = 0.60;
const HEAD_START = 0.60;
const HEAD_FULL  = 0.72;
const EXIT_START = 0.82;

function useScrollProgress(ref: React.RefObject<HTMLDivElement | null>) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const { top, height } = el.getBoundingClientRect();
      const scrollable = height - window.innerHeight;
      setProgress(Math.max(0, Math.min(1, -top / scrollable)));
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [ref]);
  return progress;
}

export function Hero() {
  const outerRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(outerRef);

  // 0 → 1 during the exit window
  const exitP = Math.max(0, Math.min(1, (progress - EXIT_START) / (1 - EXIT_START)));
  const exitOpacity = 1 - exitP;

  // Para exits faster (more parallax lift)
  const paraExitY  = exitP * -100;
  // Headline exits slower (stays a beat longer)
  const headExitY  = exitP * -50;

  const getWordOpacity = (index: number) => {
    const wordFraction = index / WORDS.length;
    const cursor = progress / PARA_END;
    const ahead = cursor - wordFraction;
    if (ahead >= 0.08) return 1;
    if (ahead >= 0) return ahead / 0.08;
    return 0;
  };

  const headlineOpacity = progress < HEAD_START
    ? 0
    : Math.min(1, (progress - HEAD_START) / (HEAD_FULL - HEAD_START));

  const headlineEntryY = progress < HEAD_START
    ? 40
    : Math.max(0, 40 * (1 - (progress - HEAD_START) / (HEAD_FULL - HEAD_START)));

  return (
    <div ref={outerRef} className="relative h-[300vh]">
      <Section
        id="hero"
        theme="dark"
        className="sticky top-0 z-0 flex flex-col text-chalk overflow-hidden h-screen desktop:min-h-[716px] bg-black"
      >
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          poster="/hero-poster.jpg"
        >
          <source src="/summer-bloom-hero.webm" type="video/webm" />
        </video>

        <div className="relative z-10 flex-1" />

        <div className="relative z-10 flex flex-col gap-[96px] p-[24px] mobile:p-[48px]">

          {/* Paragraph — exits upward faster */}
          <p
            className="text-[24px] leading-[1.5] max-w-[520px]"
            style={{
              opacity: exitOpacity,
              transform: `translateY(${paraExitY}px)`,
              transition: "opacity 0.1s linear, transform 0.1s linear",
            }}
          >
            {WORDS.map((word, i) => (
              <span
                key={i}
                style={{
                  opacity: getWordOpacity(i),
                  transition: "opacity 0.15s ease",
                  display: "inline",
                }}
              >
                {i > 0 ? " " : ""}{word}
              </span>
            ))}
          </p>

          {/* Headline — enters after text, exits upward slower */}
          <div
            className="flex items-end justify-between"
            style={{
              opacity: headlineOpacity * exitOpacity,
              transform: `translateY(${headlineEntryY + headExitY}px)`,
              transition: "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <h1 className="font-display text-[clamp(60px,18vw,200px)] leading-[0.95] tracking-[-4px]">
              Summer<br /> in Bloom
            </h1>
            <span className="font-display text-l1 pb-[6px]">Flagship Fund One</span>
          </div>

        </div>
      </Section>
    </div>
  );
}
