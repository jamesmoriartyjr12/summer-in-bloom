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
  const statsRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(statsRef);

  const IN_END = 0.25;
  const OUT_START = 0.75;

  const opacity =
    progress < IN_END
      ? progress / IN_END
      : progress > OUT_START
      ? 1 - (progress - OUT_START) / (1 - OUT_START)
      : 1;

  const translateY =
    progress < IN_END
      ? 80 * (1 - progress / IN_END)
      : progress > OUT_START
      ? (-80 * (progress - OUT_START)) / (1 - OUT_START)
      : 0;

  return (
    <Section
      id="the-studio"
      theme="light"
      className="relative z-10 bg-chalk text-black pt-[200px]"
    >
      <div className="flex flex-col gap-[48px] desktop:gap-[96px]">

        {/* Label + headline + subhead */}
        <div className="pl-[76px] mobile:pl-[200px] desktop:pl-[248px] xl:pl-[320px] pr-[24px] mobile:pr-[48px] flex flex-col gap-[24px]">
          <p className="text-l2 font-medium uppercase">The Studio • Execution Meets Capital</p>
          <h2 className="font-display text-h2 leading-none tracking-[-1.6px] max-w-[850px]">
            We don&apos;t write checks and wait.
          </h2>
          <p className="text-p1 max-w-[520px]">
            We build, scale, and distribute companies into category leaders
            with forward deployed design engineers, and growth marketers.
          </p>
        </div>

        {/* Parallax stats block — creates scroll space */}
        <div ref={statsRef} className="relative h-[200vh]">
          <div className="sticky top-0 h-screen flex items-stretch pl-[76px] mobile:pl-[200px] desktop:pl-[248px] xl:pl-[320px]">

            {/* Image — fills the sticky column */}
            <div className="w-[336px] shrink-0 max-[1099px]:hidden overflow-hidden relative">
              <Image
                src={STUDIO_IMAGE_SMALL}
                alt=""
                fill
                sizes="336px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>

            {/* Stats — animate in and out against the sticky image */}
            <div
              className="flex-1 flex flex-col justify-center pl-[48px] pr-[96px]"
              style={{
                opacity,
                transform: `translateY(${translateY}px)`,
                transition: "opacity 0.05s linear, transform 0.05s linear",
              }}
            >
              {/* Mobile image */}
              <div className="desktop:hidden aspect-[4/3] w-full overflow-hidden relative mb-[48px]">
                <Image src={STUDIO_IMAGE_LARGE} alt="" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/10" />
              </div>

              {STUDIO_STATS.map((stat) => (
                <div
                  key={stat.value}
                  className="flex items-center py-[40px] border-b border-beige"
                >
                  <p className="font-display text-h4 leading-none tracking-[-0.64px]">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </Section>
  );
}
