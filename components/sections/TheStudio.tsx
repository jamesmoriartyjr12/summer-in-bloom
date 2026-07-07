"use client";

import Image from "next/image";
import { Section } from "../Section";
import { SectionContent } from "../SectionContent";

const STUDIO_STATS = [
  { value: "1.6M Deployed" },
  { value: "10 Investments" },
  { value: "8 Markups" },
];

const STUDIO_IMAGE_SMALL = "/studio-small.png";
const STUDIO_IMAGE_LARGE = "/studio-large.png";

export function TheStudio() {
  return (
    <Section
      id="the-studio"
      theme="light"
      className="relative z-10 bg-chalk text-black py-[200px]"
    >
      <div className="flex flex-col gap-[48px] desktop:gap-[96px]">
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

        <SectionContent
          flushRight
          left={
            <div className="sticky top-[96px] h-[400px] overflow-hidden relative">
              <Image
                src={STUDIO_IMAGE_SMALL}
                alt=""
                fill
                sizes="336px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>
          }
        >
          <div className="flex flex-col">
            <div className="desktop:hidden aspect-[4/3] w-full overflow-hidden relative mb-[48px]">
              <Image
                src={STUDIO_IMAGE_LARGE}
                alt=""
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>

            <div className="flex flex-col mt-[48px]">
              {STUDIO_STATS.map((stat) => (
                <div
                  key={stat.value}
                  className="flex items-center py-[40px] border-b border-beige w-full pr-[48px]"
                >
                  <p className="font-display text-h4 leading-none tracking-[-0.64px]">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </SectionContent>
      </div>
    </Section>
  );
}
