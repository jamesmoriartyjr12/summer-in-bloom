"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { Section } from "../Section";
import { SectionContent } from "../SectionContent";
import { useSection } from "../SectionContext";

const ENTER_FADE_PX = 96;
const EXIT_FADE_PX = 96;
// textY that places the "Fund thesis" label at 400px from viewport top.
// Text div is absolute top-0 with pt-[96px], so label natural pos = 96px.
// To sit at 400px: textY = 400 - 96 = 304.
const REST_Y = 304;

const PARAGRAPHS = [
  "Our integrated performance driven Product Studio with a track record of building early stage companies into category leaders.",
  "Bloom has deployed roughly $1.2M in cash and services in the last three years to prove the thesis that our studio's reputation for growing big businesses gives our LPs unfettered access to dealflow they wouldn't be able to get with traditional venture firms.",
  "Bloom's mission is to invest and advise bold founders and early teams at the hardest stages of their business. Through our studio we have the ability to execute an enhanced diligence process into founding teams, and the success of a business in an intimate co-founder like setting.",
  "Bloom has a strategic advantage with allocation, timing, and oftentimes terms.",
];

export function FundThesis() {
  const { updateTheme, fundThesisOpacity } = useSection();

  const { scrollY } = useScroll();
  const enterOpacity = useMotionValue(0);
  const exitOpacity = useMotionValue(1);
  const textY = useMotionValue(0);
  const sectionDocTop = useRef(0);
  const maxScroll = useRef(0);
  // Slide distance matches travel distance for a 1:1 scroll-to-movement feel.
  const slidePx = useRef(300);
  const lastParaRef = useRef<HTMLElement | null>(null);
  const [wrapperHeight, setWrapperHeight] = useState(0);

  useEffect(() => {
    const measure = () => {
      const section = document.getElementById("fund-thesis");
      const lastPara = lastParaRef.current;
      if (!section || !lastPara) return;

      const sectionRect = section.getBoundingClientRect();
      const lastParaRect = lastPara.getBoundingClientRect();
      const vh = window.innerHeight;

      sectionDocTop.current = sectionRect.top + window.scrollY;

      // 1:1 slide: text travels from viewport bottom to REST_Y over the same pixel count.
      slidePx.current = Math.max(200, vh - REST_Y);

      // Last para's top relative to section top — layout-stable at any scroll position.
      const lastParaTopFromSection = lastParaRect.top - sectionRect.top;
      // Phase-3 scroll needed to bring last para's top to 20% from viewport top.
      maxScroll.current = Math.max(0, lastParaTopFromSection + REST_Y - 0.2 * vh);

      setWrapperHeight(vh + ENTER_FADE_PX + slidePx.current + maxScroll.current + EXIT_FADE_PX);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    const scrolled = y - sectionDocTop.current;
    const SLIDE = slidePx.current;

    // Phase 1 — BG fades in, text waits below viewport.
    enterOpacity.set(Math.max(0, Math.min(1, scrolled / ENTER_FADE_PX)));

    if (scrolled <= ENTER_FADE_PX) {
      textY.set(window.innerHeight);
    } else if (scrolled <= ENTER_FADE_PX + SLIDE) {
      // Phase 2 — Text slides up from viewport bottom to REST_Y.
      const t = (scrolled - ENTER_FADE_PX) / SLIDE;
      textY.set(window.innerHeight + (REST_Y - window.innerHeight) * t);
    } else {
      // Phase 3 — Text scrolls upward from REST_Y.
      textY.set(REST_Y - (scrolled - ENTER_FADE_PX - SLIDE));
    }

    // Exit fade — begins when last para reaches the trigger in Phase 3.
    const scrollAfterSlide = Math.max(0, scrolled - ENTER_FADE_PX - SLIDE);
    exitOpacity.set(
      1 - Math.max(0, Math.min(1, (scrollAfterSlide - maxScroll.current) / EXIT_FADE_PX))
    );
  });

  const imageOpacity = useTransform(
    [enterOpacity, exitOpacity],
    ([enter, exit]: number[]) => Math.min(enter as number, exit as number)
  );
  const textColor = useTransform(imageOpacity, [0, 1], ["#000000", "#EBEBEB"]);

  useMotionValueEvent(imageOpacity, "change", (v) => {
    updateTheme("fund-thesis", v >= 0.04 ? "dark" : "light");
    fundThesisOpacity.set(v);
  });

  return (
    <div style={{ height: wrapperHeight || "200vh" }}>
      <Section
        id="fund-thesis"
        theme="light"
        className="sticky top-0 h-screen overflow-hidden relative z-20"
      >
        {/* Text — slides in from below viewport once BG is fully visible */}
        <motion.div
          style={{ y: textY, color: textColor, opacity: imageOpacity }}
          className="absolute top-0 left-0 right-0 pt-[96px] z-10"
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
                    ref={i === PARAGRAPHS.length - 1 ? lastParaRef : undefined}
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
    </div>
  );
}
