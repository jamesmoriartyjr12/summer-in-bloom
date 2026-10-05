"use client";

import { Section } from "../Section";
import { SectionContent } from "../SectionContent";

const FUND_DETAILS = [
  { label: "Fund raise", value: "$10,000,000" },
  { label: "Minimum check size", value: "$100,000" },
  { label: "Fund opens", value: "July 2026" },
  { label: "Management fees", value: "2%" },
  { label: "Fund carry", value: "20%" },
];

export function FundDetails({ id = "fund-details" as const }: { id?: "fund-details" | "fund-details-2" }) {
  return (
    <Section
      id={id}
      theme="light"
      className="relative z-10 bg-chalk text-black py-[200px]"
    >
      <SectionContent>
        <div className="flex flex-col gap-[48px] desktop:gap-[96px]">
          <h2 className="font-display text-h2 leading-none tracking-[-1.6px] max-w-[850px]">
            Led by proven operators.
          </h2>

          <div className="flex flex-col">
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
      </SectionContent>
    </Section>
  );
}
