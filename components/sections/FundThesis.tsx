"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { Section } from "../Section";
import { SectionContent } from "../SectionContent";
import { useSection } from "../SectionContext";

const THESIS_IMAGE = "/fund-thesis-BG.png";
const EXIT_FADE_PX = 96;

export function FundThesis() {
  const { updateTheme } = useSection();
  const bgRef = useRef<HTMLDivElement>(null);

  // Entry: fade in as section top reaches the viewport top
  const { scrollYProgress: enterProgress } = useScroll({
    target: bgRef,
    offset: ["start start", "end start"],
  });
  const enterOpacity = useTransform(enterProgress, [0, 0.08, 1], [0, 1, 1]);

  // Exit: fade out when Pipeline is 48px from the bottom of the side nav
  const { scrollY } = useScroll();
  const exitOpacity = useMotionValue(1);
  const pipelineDocTop = useRef(Infinity);
  const fadeStartViewportY = useRef(400);

  useEffect(() => {
    const measure = () => {
      const pipeline = document.getElementById("pipeline");
      if (pipeline) {
        pipelineDocTop.current =
          pipeline.getBoundingClientRect().top + window.scrollY;
      }
      const sideNav = document.querySelector("nav");
      if (sideNav) {
        // side nav is fixed at top-[96px]; offsetHeight gives its content height
        fadeStartViewportY.current = 96 + sideNav.offsetHeight + 48;
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    const pipelineViewportTop = pipelineDocTop.current - y;
    const t = (fadeStartViewportY.current - pipelineViewportTop) / EXIT_FADE_PX;
    exitOpacity.set(1 - Math.max(0, Math.min(1, t)));
  });

  const imageOpacity = useTransform(
    [enterOpacity, exitOpacity],
    ([enter, exit]: number[]) => Math.min(enter as number, exit as number)
  );
  const textColor = useTransform(imageOpacity, [0, 1], ["#000000", "#EBEBEB"]);

  useMotionValueEvent(imageOpacity, "change", (v) => {
    updateTheme("fund-thesis", v >= 0.04 ? "dark" : "light");
  });

  return (
    <Section
      id="fund-thesis"
      theme="light"
      className="relative bg-chalk py-[192px] overflow-hidden"
    >
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
