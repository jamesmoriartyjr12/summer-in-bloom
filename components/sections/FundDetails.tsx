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

const DETAILS_IMAGE = "/fund-details-large.png";
const WAVES_VIDEO = "/waves-video.webm";

export function FundDetails({ id = "fund-details" as const }: { id?: "fund-details" | "fund-details-2" }) {
  return (
    <Section
      id={id}
      theme="dark"
      className="relative z-10 text-chalk py-[200px] overflow-hidden"
    >
      <div className="absolute inset-0 z-0" aria-hidden>
        <video
          src={WAVES_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/35" />
      </div>

      <SectionContent className="relative z-10">
        <div className="flex flex-col gap-[48px] desktop:gap-[96px]">
          <h2 className="font-display text-h2 leading-none tracking-[-1.6px] max-w-[850px]">
            Led by proven operators.
          </h2>

          <div className="aspect-[4/3] w-full overflow-hidden relative">
            <Image
              src={DETAILS_IMAGE}
              alt=""
              fill
              sizes="(max-width: 1099px) 100vw, 896px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>

          <div className="flex flex-col">
            <p className="text-l2 font-medium uppercase">Fund details</p>
            {FUND_DETAILS.map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-[12px] py-[40px] border-b border-chalk-25 w-full"
              >
                <p className="text-p2">{row.label}</p>
                <p className="font-display text-h4 leading-none tracking-[-0.64px]">
                  {row.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </SectionContent>
    </Section>
  );
}
