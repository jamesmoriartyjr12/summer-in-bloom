"use client";

import Image from "next/image";
import { Section } from "../Section";

const FUND_DETAILS = [
  { label: "Fund raise", value: "$10,000,000" },
  { label: "Minimum check size", value: "$100,000" },
  { label: "Fund opens", value: "July 2026" },
  { label: "Management fees", value: "2%" },
  { label: "Fund carry", value: "20%" },
];

// Temporary asset from Figma — swap to local /public asset for production
const DETAILS_IMAGE =
  "https://www.figma.com/api/mcp/asset/e0d04282-eb25-4fc4-baf0-b9a2d98c8ecf";

export function FundDetails() {
  return (
    <Section
      id="fund-details"
      theme="light"
      className="relative z-10 bg-chalk text-black py-[96px]"
    >
      {/* 200px left gutter reserved for the persistent side nav */}
      <div className="flex gap-[48px] items-start pl-[200px]">
        <div className="flex flex-col gap-[48px] w-[1032px]">
          {/* Title */}
          <div className="flex items-center pr-[48px]">
            <h2 className="font-display text-h2 max-w-[800px] leading-none tracking-[-1.6px]">
              A venture-style partner led by proven operators.
            </h2>
          </div>

          {/* Row: image + metric list */}
          <div className="flex gap-[48px] items-start">
            {/* Motion-blur image, fixed aspect */}
            <div className="sticky top-[96px] w-[336px] h-[400px] shrink-0 overflow-hidden">
              <Image
                src={DETAILS_IMAGE}
                alt=""
                fill
                sizes="336px"
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>

            {/* Metric list */}
            <div className="flex flex-col flex-1 min-w-0">
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
          </div>
        </div>
      </div>
    </Section>
  );
}
