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

function ease(p: number, start: number, end: number) {
  return Math.max(0, Math.min(1, (p - start) / (end - start)));
}

export function TheStudio() {
  const outerRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(outerRef);

  // Each phase: 0→1 within its window
  const headlineIn = ease(progress, 0.00, 0.18); // headline + subhead
  const photoIn    = ease(progress, 0.18, 0.35); // photo
  const stat0      = ease(progress, 0.35, 0.52); // first stat
  const stat1      = ease(progress, 0.46, 0.63); // second stat (overlaps slightly)
  const stat2      = ease(progress, 0.57, 0.74); // third stat
  const exitP      = ease(progress, 0.78, 1.00); // all exit upward together

  // Translate: 0 = final position, 1 = starts 80px below
  const ty = (p: number) => `${(1 - p) * 80}px`;

  return (
    <div ref={outerRef} className="relative h-[400vh]">
      <Section
        id="the-studio"
        theme="light"
        className="sticky top-0 h-screen bg-chalk text-black overflow-hidden"
      >
        {/* Entire composition — exits upward together */}
        <div
          className="absolute inset-0 flex flex-col justify-between
            pt-[120px] pb-[100px]
            pl-[76px] mobile:pl-[200px] desktop:pl-[248px] xl:pl-[320px] pr-[48px]"
          style={{ transform: `translateY(${exitP * -100}vh)` }}
        >

          {/* TOP: Headline + Subhead */}
          <div
            className="flex flex-col gap-[24px]"
            style={{ transform: `translateY(${ty(headlineIn)})` }}
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

          {/* BOTTOM: Photo + Stats, bottom-aligned */}
          <div className="flex gap-[48px] items-end">

            {/* Photo slides in */}
            <div
              className="max-[1099px]:hidden w-[336px] shrink-0 overflow-hidden relative"
              style={{
                height: "clamp(240px, 35vh, 400px)",
                transform: `translateY(${ty(photoIn)})`,
              }}
            >
              <Image src={STUDIO_IMAGE_SMALL} alt="" fill sizes="336px" className="object-cover" />
              <div className="absolute inset-0 bg-black/10" />
            </div>

            {/* Stats — each row slides in individually, bottom-aligned with photo */}
            <div
              className="flex-1 pr-[96px] flex flex-col justify-end max-[1099px]:hidden"
              style={{ height: "clamp(240px, 35vh, 400px)" }}
            >
              {[stat0, stat1, stat2].map((p, i) => (
                <div
                  key={STUDIO_STATS[i].value}
                  className="flex items-center py-[32px] border-b border-beige"
                  style={{ transform: `translateY(${ty(p)})` }}
                >
                  <p className="font-display text-h4 leading-none tracking-[-0.64px]">
                    {STUDIO_STATS[i].value}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </Section>
    </div>
  );
}
