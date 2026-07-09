"use client";

import Image from "next/image";
import { Section } from "../Section";
import { SectionContent } from "../SectionContent";

const FUND_DETAILS = [
  { label: "Fund raise", value: "$10,000,000" },
  { label: "Minimum check size", value: "$100,000" },
  { label: "Fund opens", value: "July 2026" },
  { label: "Management fees", value: "2%" },
  { label: "Fund carry", value: "20%" },
];

const DETAILS_IMAGE_SMALL = "/fund-details-small.png";
const DETAILS_IMAGE_LARGE = "/fund-details-large.png";

export function FundDetails({ id = "fund-details" as const }: { id?: "fund-details" | "fund-details-2" }) {
  return (
    <Section
      id={id}
      theme="light"
      className="relative z-10 bg-chalk text-black py-[200px]"
    >
      <div className="flex flex-col gap-[48px] desktop:gap-[96px]">
        {/* Title — starts at image edge, spans both columns */}
        <div className="pl-[76px] mobile:pl-[200px] desktop:pl-[248px] xl:pl-[320px] pr-[76px] mobile:pr-[200px] desktop:pr-[248px] xl:pr-[320px]">
          <h2 className="font-display text-h2 leading-none tracking-[-1.6px] max-w-[850px]">
            Led by proven operators.
          </h2>
        </div>

        {/* Image + metric list */}
        <SectionContent
          left={
            <div className="sticky top-[96px] h-[400px] overflow-hidden">
              <Image
                src={DETAILS_IMAGE_SMALL}
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
            {/* Mobile image — hidden on desktop where sticky left column takes over */}
            <div className="desktop:hidden aspect-[4/3] w-full overflow-hidden relative mb-[48px]">
              <Image
                src={DETAILS_IMAGE_LARGE}
                alt=""
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>

            <p className="text-l2 font-medium uppercase">Fund details</p>
            {FUND_DETAILS.map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-[12px] py-[40px] border-b border-beige w-full"
              >
                <p className="text-p2">{row.label}</p>
                <p className="font-display text-h4 leading-none tracking-[-0.64px]">
                  {row.value}
                </p>
              </div>
            ))}
          </div>
        </SectionContent>
      </div>
    </Section>
  );
}
