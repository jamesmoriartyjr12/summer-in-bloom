"use client";

import Image from "next/image";
import { Section } from "../Section";

// Temporary asset from Figma — swap to local /public asset for production
const THESIS_IMAGE =
  "https://www.figma.com/api/mcp/asset/521a7fb1-19ac-44f8-b155-ad13ccbaffeb";

export function FundThesis() {
  return (
    <Section
      id="fund-thesis"
      theme="dark"
      className="relative text-chalk py-[96px] overflow-hidden"
    >
      {/* Background image */}
      <Image
        src={THESIS_IMAGE}
        alt=""
        fill
        sizes="100vw"
        className="object-cover -z-10"
        unoptimized
      />

      {/* Blurred gradient overlay — this hides any low-res artifacts */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 backdrop-blur-[15px]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.2) 26.5%, rgba(0,0,0,0.75) 108.3%)",
        }}
      />

      {/* Content — right-aligned column, with 200px reserved on left for side nav */}
      <div className="flex justify-end pr-[48px] pl-[200px]">
        <div className="flex flex-col gap-[48px] w-[600px]">
          <p className="text-l2 font-medium uppercase">Fund thesis</p>
          <h3 className="font-display text-h3 max-w-[500px] leading-none tracking-[-1.28px]">
            Backed by the track record and reputation of Bloom.
          </h3>
          <div className="flex flex-col gap-[24px] text-p1">
            <p>
              Our integrated performance driven Product Studio with a track
              record of building early stage companies into category leaders.
            </p>
            <p>
              Bloom has deployed roughly $1.2M in cash and services in the last
              three years to prove the thesis that our studio&rsquo;s reputation
              for growing big businesses gives our LPs unfettered access to
              dealflow they wouldn&rsquo;t be able to get with traditional
              venture firms.
            </p>
            <p>
              Bloom&rsquo;s mission is to invest and advise bold founders and
              early teams at the hardest stages of their business. Through our
              studio we have the ability to execute an enhanced diligence
              process into founding teams, and the success of a business in an
              intimate co-founder like setting.
            </p>
            <p>
              Bloom has a strategic advantage with allocation, timing, and
              oftentimes terms.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
