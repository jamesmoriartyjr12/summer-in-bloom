"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Section } from "../Section";
import {
  HEADLINE_MEASURE,
  PROSE_MEASURE,
  SECTION_INSET_X,
  SECTION_PY,
} from "@/lib/sectionLayout";

const STUDIO_IMAGE_SMALL = "/studio-small.png";

const STATS = [
  { value: "1.6M", label: "Deployed" },
  { value: "10", label: "Investments" },
  { value: "8", label: "Markups" },
];

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

function StudioIntro() {
  return (
    <>
      <p className="text-l2 font-medium uppercase mb-[24px]">
        The Studio • Execution Meets Capital
      </p>
      <h2
        className={`font-display text-h2 leading-none tracking-[-1.6px] ${HEADLINE_MEASURE}`}
      >
        We don&apos;t write checks and wait.
      </h2>
      <p className={`text-p1 ${PROSE_MEASURE} mt-[24px]`}>
        We build, scale, and distribute companies into category leaders with
        forward deployed design engineers, and growth marketers.
      </p>
    </>
  );
}

function StudioStats() {
  return (
    <div className="flex flex-col w-full">
      {STATS.map((stat) => (
        <div key={stat.label} className="border-t border-black/20 py-[20px]">
          <p className="font-display text-h3 leading-none tracking-[-1.28px]">
            {stat.value}
          </p>
          <p className="text-p2 mt-[8px] text-taupe uppercase">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

function StudioPhoto({ className }: { className?: string }) {
  return (
    <div
      className={`w-full max-w-[336px] aspect-[336/400] overflow-hidden relative ${className ?? ""}`}
    >
      <Image src={STUDIO_IMAGE_SMALL} alt="" fill sizes="(max-width: 1099px) 100vw, 336px" className="object-cover" />
      <div className="absolute inset-0 bg-black/10" />
    </div>
  );
}

/** Stacked layout for viewports below the scroll-choreography breakpoint. */
function TheStudioStatic() {
  return (
    <Section
      id="the-studio"
      theme="light"
      className={`relative z-10 bg-chalk text-black ${SECTION_PY}`}
    >
      <div className={`flex flex-col gap-[64px] ${SECTION_INSET_X}`}>
        <StudioIntro />
        <div className="flex flex-col gap-[48px] mobile:flex-row mobile:items-end mobile:gap-[48px]">
          <StudioPhoto className="shrink-0" />
          <div className="flex-1 min-w-0">
            <StudioStats />
          </div>
        </div>
      </div>
    </Section>
  );
}

/** Scroll-driven sticky layout for wide viewports. */
function TheStudioScroll() {
  const outerRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(outerRef);

  const headlineP = Math.min(1, progress / 0.25);
  const headlineY = (1 - headlineP) * 100;

  const photoP = Math.min(1, Math.max(0, (progress - 0.25) / 0.25));
  const photoY = (1 - photoP) * 100;

  const statsP = Math.min(1, Math.max(0, (progress - 0.5) / 0.2));
  const statsY = (1 - statsP) * 100;

  return (
    <div ref={outerRef} className="relative h-[300vh]">
      <Section
        id="the-studio"
        theme="light"
        className="sticky top-0 h-screen bg-chalk text-black overflow-hidden"
      >
        <div
          className={`absolute left-0 right-[48px] ${SECTION_INSET_X}`}
          style={{
            top: "100px",
            transform: `translateY(${headlineY}vh)`,
          }}
        >
          <StudioIntro />
        </div>

        <div
          className={`absolute left-0 right-0 ${SECTION_INSET_X}`}
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

        {/* Stats: photo-indent + photo-width + 48px gap; right edge matches content gutter */}
        <div
          className="absolute desktop:left-[632px] xl:left-[704px] right-[48px] flex flex-col"
          style={{ bottom: "100px" }}
        >
          {STATS.map((stat) => (
            <div
              key={stat.label}
              style={{ transform: `translateY(${statsY}vh)` }}
            >
              <div className="border-t border-black/20 py-[20px]">
                <p className="font-display text-h3 leading-none tracking-[-1.28px]">
                  {stat.value}
                </p>
                <p className="text-p2 mt-[8px] text-taupe uppercase">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

export function TheStudio() {
  const [useScrollLayout, setUseScrollLayout] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1100px)");
    const update = () => setUseScrollLayout(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return useScrollLayout ? <TheStudioScroll /> : <TheStudioStatic />;
}
