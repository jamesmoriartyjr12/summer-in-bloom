"use client";

import { Section } from "../Section";
import { SectionContent } from "../SectionContent";

type PipelineCompany = {
  name: string;
  tag: string;
  targetAllocation: string;
  targetValuation: string;
  description: string;
};

const PIPELINE: PipelineCompany[] = [
  {
    name: "TeeCommerce",
    tag: "Ecomm",
    targetAllocation: "$100k",
    targetValuation: "$10M",
    description:
      "Tee Commerce is a technologically enabled golf marketplace penetrating the worlds most prestigious golf clubs to have a premium ecommerce channel with premium products. Tee Commerce is currently doing $6M annually in revenue with a small team, and is targeting $10M this year.",
  },
];

export function Pipeline() {
  return (
    <Section
      id="pipeline"
      theme="light"
      className="relative z-10 bg-chalk text-black pt-[96px] pb-[200px]"
    >
      <SectionContent
        flushRight
        left={
          <div className="sticky top-[96px] h-[400px] overflow-hidden bg-beige relative">
            <div className="absolute bottom-[24px] left-[24px] bg-chalk rounded-[8px] w-[48px] h-[48px]" />
          </div>
        }
      >
        <div className="flex flex-col">
          <p className="text-l2 font-medium uppercase">Pipeline</p>
          {PIPELINE.map((company) => (
            <div key={company.name}>
              <div className="flex items-start justify-between pt-[48px] pb-[24px] pr-[48px]">
                <p className="font-display text-h4 leading-none tracking-[-0.64px]">
                  {company.name}
                </p>
                <div className="bg-[rgba(196,195,182,0.5)] flex items-center px-[12px] py-[6px] rounded-full shrink-0">
                  <p className="text-[12px] font-medium leading-[1.35] uppercase">
                    {company.tag}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-[12px] py-[24px] border-b border-beige">
                <p className="text-p2">Target Allocation</p>
                <p className="font-display text-h5 leading-none tracking-[-0.48px]">
                  {company.targetAllocation}
                </p>
              </div>
              <div className="flex flex-col gap-[12px] py-[24px] border-b border-beige">
                <p className="text-p2">Target Valuation</p>
                <p className="font-display text-h5 leading-none tracking-[-0.48px]">
                  {company.targetValuation}
                </p>
              </div>
              <p className="text-p1 pt-[24px] pr-[48px]">{company.description}</p>
            </div>
          ))}
        </div>
      </SectionContent>
    </Section>
  );
}
