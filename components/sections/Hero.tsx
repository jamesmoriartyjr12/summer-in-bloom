"use client";

import { useRef, useEffect, useState } from "react";
import { Section } from "../Section";

const TEXT =
  "We built this fund to give our LPs exposure to the success of our studio, where we work side by side with early-stage companies and guide them through hypergrowth.";
const WORDS = TEXT.split(" ");

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

  const getWordOpacity = (index: number) => {
    // Reveal words across the first 75% of scroll
    const revealEnd = 0.75;
    const wordFraction = index / WORDS.length;
    const cursor = progress / revealEnd;

    // Fade everything out near the end
    if (progress > 0.85) {
      return Math.max(0, 1 - (progress - 0.85) / 0.15);
    }

    const ahead = cursor - wordFraction;
    if (ahead >= 0.08) return 1;
    if (ahead >= 0) return ahead / 0.08;
    return 0;
  };

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
          <p className="text-[24px] leading-[1.5] max-w-[520px]">
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
          <div className="flex items-end justify-between">
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
