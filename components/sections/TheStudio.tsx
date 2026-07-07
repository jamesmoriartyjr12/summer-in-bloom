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

export function TheStudio() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(scrollRef);

  const IN_END    = 0.25;
  const OUT_START = 0.75;

  // Purely scroll-driven — translate only, no opacity
  const translateY =
    progress < IN_END    ? 200 * (1 - progress / IN_END) :
    progress > OUT_START ? -200 * (progress - OUT_START) / (1 - OUT_START) :
    0;

  // Sticky top: centered in viewport, but never closer than 100px to the bottom
  // clamp(96px, 50vh - 200px, 100vh - 500px)
  const stickyTop = "clamp(96px, calc(50vh - 200px), calc(100vh - 500px))";

  return (
    <Section
      id="the-studio"
      theme="light"
      className="relative z-10 bg-chalk text-black pt-[200px] pb-[200px]"
    >
      {/* Headline block */}
      <div className="pl-[76px] mobile:pl-[200px] desktop:pl-[248px] xl:pl-[320px] pr-[24px] mobile:pr-[48px] flex flex-col gap-[24px] pb-[96px]">
        <p className="text-l2 font-medium uppercase">The Studio • Execution Meets Capital</p>
        <h2 className="font-display text-h2 leading-none tracking-[-1.6px] max-w-[850px]">
          We don&apos;t write checks and wait.
        </h2>
        <p className="text-p1 max-w-[520px]">
          We build, scale, and distribute companies into category leaders
          with forward deployed design engineers, and growth marketers.
        </p>
      </div>

      {/* Scroll container — 200vh creates space for in/out animation */}
      <div
        ref={scrollRef}
        className="relative h-[200vh] pl-[76px] mobile:pl-[200px] desktop:pl-[248px] xl:pl-[320px] flex gap-[48px] items-start"
      >
        {/* Desktop: sticky image, centered, never within 100px of bottom */}
        <div
          className="max-[1099px]:hidden w-[336px] h-[400px] shrink-0 overflow-hidden relative"
          style={{ position: "sticky", top: stickyTop }}
        >
          <Image src={STUDIO_IMAGE_SMALL} alt="" fill sizes="336px" className="object-cover" />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Desktop: stats — sticky at same height, scroll-driven translate only */}
        <div
          className="max-[1099px]:hidden flex-1 h-[400px] pr-[96px] overflow-hidden"
          style={{ position: "sticky", top: stickyTop }}
        >
        <div
          className="flex flex-col justify-center h-full"
          style={{ transform: `translateY(${translateY}px)` }}
        >
          {STUDIO_STATS.map((stat) => (
            <div key={stat.value} className="flex items-center py-[40px] border-b border-beige">
              <p className="font-display text-h4 leading-none tracking-[-0.64px]">{stat.value}</p>
            </div>
          ))}
        </div>
        </div>

        {/* Mobile: image + stats, no animation */}
        <div className="desktop:hidden flex flex-col w-full pr-[24px]">
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
  );
}
