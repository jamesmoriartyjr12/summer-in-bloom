"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Section } from "../Section";

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

export function TheStudio() {
  const outerRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(outerRef);

  // Phase 1: headline scrolls in (0 → 0.4), then holds
  const headlineP = Math.min(1, progress / 0.4);
  const headlineY = (1 - headlineP) * 100;

  // Phase 2: photo scrolls in after headline locks (0.4 → 0.65), then holds
  const photoP = Math.min(1, Math.max(0, (progress - 0.4) / 0.25));
  const photoY = (1 - photoP) * 100;

  return (
    <div ref={outerRef} className="relative h-[300vh]">
      <Section
        id="the-studio"
        theme="light"
        className="sticky top-0 h-screen bg-chalk text-black overflow-hidden"
      >
        {/* Headline + subhead — rests 100px from top */}
        <div
          className="absolute left-0 right-[48px] pl-[76px] mobile:pl-[200px] desktop:pl-[248px] xl:pl-[320px]"
          style={{
            top: "100px",
            transform: `translateY(${headlineY}vh)`,
          }}
        >
          <p className="text-l2 font-medium uppercase mb-[24px]">The Studio • Execution Meets Capital</p>
          <h2 className="font-display text-h2 leading-none tracking-[-1.6px] max-w-[850px]">
            We don&apos;t write checks and wait.
          </h2>
          <p className="text-p1 max-w-[520px] mt-[24px]">
            We build, scale, and distribute companies into category leaders
            with forward deployed design engineers, and growth marketers.
          </p>
        </div>
        {/* Photo — slides in after headline locks, rests 100px from bottom */}
        <div
          className="absolute left-0 right-0 pl-[76px] mobile:pl-[200px] desktop:pl-[248px] xl:pl-[320px] max-[1099px]:hidden"
          style={{
            bottom: "100px",
            transform: `translateY(${photoY}vh)`,
          }}
        >
          <div className="w-[336px] h-[400px] overflow-hidden relative">
            <Image src={STUDIO_IMAGE_SMALL} alt="" fill sizes="336px" className="object-cover" />
            <div className="absolute inset-0 bg-black/10" />
          </div>
        </div>

      </Section>
    </div>
  );
}
