"use client";

import { useRef, useEffect, useState } from "react";
import { Section } from "../Section";

const LINES = [
  "We built this fund",
  "to give our LPs exposure to the success of our studio,",
  "where we work side by side with early-stage companies",
  "and guide them through hypergrowth.",
];

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

  const getOpacity = (i: number) => {
    const step = 0.65 / LINES.length;
    const start = i * step;
    const end = start + 0.12;
    if (progress > 0.85) {
      return Math.max(0, 1 - (progress - 0.85) / 0.15);
    }
    return Math.min(1, Math.max(0, (progress - start) / (end - start)));
  };

  const getY = (i: number) => {
    const step = 0.65 / LINES.length;
    return progress < i * step ? 14 : 0;
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
          <p className="text-p1 max-w-[448px]">
            {LINES.map((line, i) => (
              <span
                key={i}
                className="block"
                style={{
                  opacity: getOpacity(i),
                  transform: `translateY(${getY(i)}px)`,
                  transition: "opacity 0.5s ease, transform 0.5s ease",
                }}
              >
                {line}
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
