"use client";

import Image from "next/image";
import { Section } from "../Section";
import { SectionContent } from "../SectionContent";

const STUDIO_STATS = [
  { value: "11 companies" },
  { value: "9 markups" },
  { value: "3.0x MOIC" },
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
          <p className="text-l2 font-medium uppercase">The Studio • Where Execution Meets Capital</p>
          <h2 className="font-display text-h2 leading-none tracking-[-1.6px] max-w-[850px]">
            Execution meets Capital. Where category defining leaders are born.
          </h2>
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

            <div className="flex flex-col gap-[24px] pr-[48px]">
              <p className="text-l2 font-medium uppercase">How we work</p>
              <p className="text-p1">
                Our team designed and built category-defining products at
                DraftKings, Chime Bank, Indeed, Manulife/John Hancock and
                Meetup. We now deploy that operating expertise directly into
                portfolio companies.
              </p>
              <p className="text-p1">
                We don&apos;t write checks and wait. We build, scale, and
                distribute product alongside founders. We forward deploy design
                engineers and growth teams into companies to build, scale and
                distribute product.
              </p>
            </div>

            <div className="flex flex-col mt-[48px]">
              <p className="text-l2 font-medium uppercase">Over 3 years</p>
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

            <div className="mt-[48px] pr-[48px]">
              <p className="text-p1">
                We invest $1.3M average, now valued at $3.9M. Companies with
                product-market fit need execution horsepower, not more capital.
                We become that operating layer, a hired gun embedded in the
                business.
              </p>
            </div>
          </div>
        </SectionContent>
      </div>
    </Section>
  );
}
