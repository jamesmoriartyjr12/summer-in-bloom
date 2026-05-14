"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { Section } from "../Section";
import { SectionContent } from "../SectionContent";
import { useSection } from "../SectionContext";

const THESIS_IMAGE = "/fund-thesis-BG.png";
const ENTER_FADE_PX = 96;
const EXIT_FADE_PX = 96;

const PARAGRAPHS = [
  "Our integrated performance driven Product Studio with a track record of building early stage companies into category leaders.",
  "Bloom has deployed roughly $1.2M in cash and services in the last three years to prove the thesis that our studio’s reputation for growing big businesses gives our LPs unfettered access to dealflow they wouldn’t be able to get with traditional venture firms.",
  "Bloom’s mission is to invest and advise bold founders and early teams at the hardest stages of their business. Through our studio we have the ability to execute an enhanced diligence process into founding teams, and the success of a business in an intimate co-founder like setting.",
  "Bloom has a strategic advantage with allocation, timing, and oftentimes terms.",
];

export function FundThesis() {
  const { updateTheme } = useSection();

  const { scrollY } = useScroll();
  const enterOpacity = useMotionValue(0);
  const exitOpacity = useMotionValue(1);
  const sectionDocTop = useRef(0);
  const pipelineDocTop = useRef(Infinity);

  useEffect(() => {
    const measure = () => {
      const section = document.getElementById("fund-thesis");
      if (section) {
        sectionDocTop.current = section.getBoundingClientRect().top + window.scrollY;
      }
      const pipeline = document.getElementById("pipeline");
      if (pipeline) {
        pipelineDocTop.current = pipeline.getBoundingClientRect().top + window.scrollY;
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    // Fade in once the section top reaches the viewport top
    const enterT = (y - sectionDocTop.current) / ENTER_FADE_PX;
    enterOpacity.set(Math.max(0, Math.min(1, enterT)));

    // Fade out finishing exactly when Pipeline's top hits the viewport bottom
    const pipelineFromBottom = pipelineDocTop.current - y - window.innerHeight;
    const exitT = (EXIT_FADE_PX - pipelineFromBottom) / EXIT_FADE_PX;
    exitOpacity.set(1 - Math.max(0, Math.min(1, exitT)));
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
      className="relative bg-chalk"
    >
      {/* Background only — sticky, pins to viewport top once section reaches it */}
      <div className="sticky top-0 h-screen overflow-hidden pointer-events-none">
        <motion.div style={{ opacity: imageOpacity }} className="absolute inset-0">
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
      </div>

      {/* Text — normal flow, pulled up to overlay the sticky background */}
      <motion.div
        style={{ color: textColor, opacity: imageOpacity }}
        className="relative z-10 -mt-[100vh] py-[360px]"
      >
        <SectionContent>
          <div className="flex flex-col gap-[48px]">
            <p className="text-l2 font-medium uppercase">Fund thesis</p>
            <h3 className="font-display text-h3 leading-none tracking-[-1.28px]">
              Backed by the track record and reputation of Bloom.
            </h3>
            <div className="flex flex-col gap-[24px] text-p1">
              {PARAGRAPHS.map((text, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -20% 0px" }}
                  transition={{ duration: 0.55, delay: i * 0.07, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {text}
                </motion.p>
              ))}
            </div>
          </div>
        </SectionContent>
      </motion.div>
    </Section>
  );
}
