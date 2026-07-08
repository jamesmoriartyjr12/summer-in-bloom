"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Section } from "../Section";

const STUDIO_STATS = [
  { value: "1.6M Deployed" },
  { value: "10 Investments" },
  { value: "8 Markups" },
];

const STUDIO_IMAGE_SMALL = "/studio-small.png";
const STUDIO_IMAGE_LARGE = "/studio-large.png";

function useScrollProgress(ref: React.RefObject<HTMLDivElement | null>) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const { top, height } = el.getBoundingClientRect();
      const scrollable = height - window.innerHeight;
      if (scrollable <= 0) return;
      setProgress(Math.max(0, Math.min(1, -top / scrollable)));
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [ref]);
  return progress;
}

// Maps global progress into a 0→1 value within a sub-window
function w(p: number, start: number, end: number) {
  return Math.max(0, Math.min(1, (p - start) / (end - start)));
}

export function TheStudio() {
  const outerRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(outerRef);

  // Phase 1: headline + subhead slide in (0 → 0.15)
  const headlineIn = w(progress, 0.00, 0.15);
  // Phase 2: photo slides in (0.15 → 0.30)
  const photoIn    = w(progress, 0.15, 0.30);
  // Phase 3: stats scroll in one by one (0.30 → 0.65)
  const statsIn    = w(progress, 0.30, 0.65);
  // Phase 4: all exit together (0.70 → 1.00)
  const exitP      = w(progress, 0.70, 1.00);

  const headlineY  = (1 - headlineIn) * 80;
  const photoY     = (1 - photoIn) * 60;

  // Each stat row slides in from 80px below, staggered
  const statY = (i: number) => {
    const p = w(statsIn, i * 0.28, i * 0.28 + 0.72);
    return (1 - p) * 80;
  };

  // Exit: entire composition slides up off screen
  const exitY = `${exitP * -100}vh`;

  return (
    // Outer div creates scroll space; Section is the full-screen sticky panel
    <div ref={outerRef} className="relative h-[400vh]">
      <Section
        id="the-studio"
        theme="light"
        className="sticky top-0 h-screen bg-chalk text-black overflow-hidden flex flex-col"
      >
        <div
          className="flex-1 flex flex-col pt-[120px] pb-[100px] pl-[76px] mobile:pl-[200px] desktop:pl-[248px] xl:pl-[320px] pr-[48px]"
          style={{ transform: `translateY(${exitY})` }}
        >

          {/* Phase 1: Label + Headline + Subhead */}
          <div
            className="flex flex-col gap-[24px]"
            style={{ transform: `translateY(${headlineY}px)` }}
          >
            <p className="text-l2 font-medium uppercase">The Studio • Execution Meets Capital</p>
            <h2 className="font-display text-h2 leading-none tracking-[-1.6px] max-w-[850px]">
              We don&apos;t write checks and wait.
            </h2>
            <p className="text-p1 max-w-[520px]">
              We build, scale, and distribute companies into category leaders
              with forward deployed design engineers, and growth marketers.
            </p>
          </div>

          {/* Phase 2 + 3: Photo (slides in) + Stats (lock to photo bottom, scroll in) */}
          <div
            className="flex gap-[48px] items-end mt-auto"
            style={{ transform: `translateY(${photoY}px)` }}
          >
            {/* Photo */}
            <div className="max-[1099px]:hidden w-[336px] h-[400px] shrink-0 overflow-hidden relative">
              <Image src={STUDIO_IMAGE_SMALL} alt="" fill sizes="336px" className="object-cover" />
              <div className="absolute inset-0 bg-black/10" />
            </div>

            {/* Stats — h-[400px] so their bottom aligns with photo bottom */}
            <div className="flex-1 flex flex-col justify-end h-[400px] pr-[96px] max-[1099px]:h-auto">
              {STUDIO_STATS.map((stat, i) => (
                <div
                  key={stat.value}
                  className="flex items-center py-[40px] border-b border-beige"
                  style={{ transform: `translateY(${statY(i)}px)` }}
                >
                  <p className="font-display text-h4 leading-none tracking-[-0.64px]">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile layout */}
          <div className="desktop:hidden mt-[48px]">
            <div className="aspect-[4/3] w-full overflow-hidden relative mb-[48px]">
              <Image src={STUDIO_IMAGE_LARGE} alt="" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/10" />
            </div>
            {STUDIO_STATS.map((stat) => (
              <div key={stat.value} className="flex items-center py-[40px] border-b border-beige">
                <p className="font-display text-h4 leading-none tracking-[-0.64px]">{stat.value}</p>
              </div>
            ))}
          </div>

        </div>
      </Section>
    </div>
  );
}
