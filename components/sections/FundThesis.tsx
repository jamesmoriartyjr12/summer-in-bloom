"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { Section } from "../Section";
import { SectionContent } from "../SectionContent";
import { useSection } from "../SectionContext";

const THESIS_IMAGE = "/fund-thesis-BG.png";

export function FundThesis() {
  const { updateTheme } = useSection();
  const bgRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: bgRef,
    offset: ["start start", "end start"],
  });
  const imageOpacity = useTransform(scrollYProgress, [0, 0.08], [0, 1]);
  const textColor = useTransform(scrollYProgress, [0, 0.08], ["#000000", "#EBEBEB"]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    updateTheme("fund-thesis", v >= 0.04 ? "dark" : "light");
  });

  return (
    <Section
      id="fund-thesis"
      theme="light"
      className="relative bg-chalk py-[192px] overflow-hidden"
    >
      {/* Background fades in as section top reaches the viewport top */}
      <motion.div
        ref={bgRef}
        style={{ opacity: imageOpacity }}
        className="absolute inset-0"
      >
        <Image
          src={THESIS_IMAGE}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          unoptimized
        />
        <div
          aria-hidden
          className="absolute inset-0 backdrop-blur-[15px]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.2) 26.5%, rgba(0,0,0,0.75) 108.3%)",
          }}
        />
      </motion.div>

      {/* Content — text color transitions from black to chalk with the background */}
      <motion.div style={{ color: textColor }} className="relative z-10">
        <SectionContent>
        <div className="flex flex-col gap-[48px]">
          <p className="text-l2 font-medium uppercase">Fund thesis</p>
          <h3 className="font-display text-h3 leading-none tracking-[-1.28px]">
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
        </SectionContent>
      </motion.div>
    </Section>
  );
}
