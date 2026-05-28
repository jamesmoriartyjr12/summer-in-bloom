"use client";

import { Section } from "../Section";
import { SectionContent } from "../SectionContent";

const PARAGRAPHS = [
  "Our integrated performance driven Product Studio with a track record of building early stage companies into category leaders.",
  "Bloom has deployed roughly $1.2M in cash and services in the last three years to prove the thesis that our studio's reputation for growing big businesses gives our LPs unfettered access to dealflow they wouldn't be able to get with traditional venture firms.",
  "Bloom's mission is to invest and advise bold founders and early teams at the hardest stages of their business. Through our studio we have the ability to execute an enhanced diligence process into founding teams, and the success of a business in an intimate co-founder like setting.",
  "Bloom has a strategic advantage with allocation, timing, and oftentimes terms.",
];

export function FundThesis() {
  return (
    <Section
      id="fund-thesis"
      theme="dark"
      className="relative z-20 text-chalk py-[200px] overflow-hidden"
    >
      <div className="absolute inset-0 z-0" aria-hidden>
        <video
          src="/waves-video.webm"
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/35" />
      </div>
      <SectionContent flushRight className="relative z-10 pr-[24px] mobile:pr-[48px]">
        <div className="flex flex-col gap-[48px]">
          <p className="text-l2 font-medium uppercase">Fund thesis</p>
          <h3 className="font-display text-h3 leading-none tracking-[-1.28px]">
            Backed by the track record and reputation of Bloom.
          </h3>
          <div className="flex flex-col gap-[24px] text-p1">
            {PARAGRAPHS.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
          </div>
        </div>
      </SectionContent>
    </Section>
  );
}
