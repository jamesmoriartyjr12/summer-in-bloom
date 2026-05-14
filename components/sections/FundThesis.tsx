"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import { Section } from "../Section";
import { SectionContent } from "../SectionContent";
import { useSection } from "../SectionContext";

const ENTER_FADE_PX = 96;
const EXIT_FADE_PX = 96;
const REST_Y = 304;
const TRACK_ID = "fund-thesis-track";
const THESIS_IMAGE = "/fund-thesis-BG.png";

const PARAGRAPHS = [
  "Our integrated performance driven Product Studio with a track record of building early stage companies into category leaders.",
  "Bloom has deployed roughly $1.2M in cash and services in the last three years to prove the thesis that our studio's reputation for growing big businesses gives our LPs unfettered access to dealflow they wouldn't be able to get with traditional venture firms.",
  "Bloom's mission is to invest and advise bold founders and early teams at the hardest stages of their business. Through our studio we have the ability to execute an enhanced diligence process into founding teams, and the success of a business in an intimate co-founder like setting.",
  "Bloom has a strategic advantage with allocation, timing, and oftentimes terms.",
];

function readScrollY() {
  return window.scrollY ?? document.documentElement.scrollTop ?? 0;
}

export function FundThesis() {
  const { updateTheme, fundThesisOpacity } = useSection();

  const enterOpacity = useMotionValue(0);
  const exitOpacity = useMotionValue(1);
  const textY = useMotionValue(0);
  const sectionDocTop = useRef(0);
  const maxScroll = useRef(0);
  const slidePx = useRef(300);
  const lastParaRef = useRef<HTMLParagraphElement | null>(null);
  const [wrapperHeight, setWrapperHeight] = useState(0);

  const imageOpacity = useTransform(
    [enterOpacity, exitOpacity],
    ([enter, exit]: number[]) => Math.min(enter as number, exit as number)
  );
  const textColor = useTransform(imageOpacity, [0, 1], ["#000000", "#EBEBEB"]);

  useMotionValueEvent(imageOpacity, "change", (v) => {
    updateTheme("fund-thesis", v >= 0.04 ? "dark" : "light");
    fundThesisOpacity.set(v);
  });

  useEffect(() => {
    const measure = () => {
      const track = document.getElementById(TRACK_ID);
      const section = document.getElementById("fund-thesis");
      if (!track || !section) return;

      const trackRect = track.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      sectionDocTop.current = trackRect.top + readScrollY();
      slidePx.current = Math.max(200, vh - REST_Y);

      const lastPara = lastParaRef.current;
      if (lastPara) {
        const lastParaRect = lastPara.getBoundingClientRect();
        const lastParaTopFromSection = lastParaRect.top - sectionRect.top;
        maxScroll.current = Math.max(0, lastParaTopFromSection + REST_Y - 0.2 * vh);
      } else {
        maxScroll.current = Math.max(0, PARAGRAPHS.length * 160 + vh * 0.35);
      }

      setWrapperHeight(vh + ENTER_FADE_PX + slidePx.current + maxScroll.current + EXIT_FADE_PX);
    };

    const applyScroll = (scrollYOverride?: number) => {
      const y = typeof scrollYOverride === "number" ? scrollYOverride : readScrollY();
      const scrolled = y - sectionDocTop.current;
      const SLIDE = slidePx.current;

      enterOpacity.set(Math.max(0, Math.min(1, scrolled / ENTER_FADE_PX)));

      if (scrolled <= ENTER_FADE_PX) {
        textY.set(window.innerHeight);
      } else if (scrolled <= ENTER_FADE_PX + SLIDE) {
        const t = (scrolled - ENTER_FADE_PX) / SLIDE;
        textY.set(window.innerHeight + (REST_Y - window.innerHeight) * t);
      } else {
        textY.set(REST_Y - (scrolled - ENTER_FADE_PX - SLIDE));
      }

      const scrollAfterSlide = Math.max(0, scrolled - ENTER_FADE_PX - SLIDE);
      exitOpacity.set(
        1 - Math.max(0, Math.min(1, (scrollAfterSlide - maxScroll.current) / EXIT_FADE_PX))
      );
    };

    const onScroll = () => applyScroll();
    const onLenisScroll = (e: Event) => {
      const d = (e as CustomEvent<{ scroll?: number }>).detail;
      applyScroll(typeof d?.scroll === "number" ? d.scroll : undefined);
    };

    const onResize = () => {
      measure();
      applyScroll();
    };

    measure();
    applyScroll();
    queueMicrotask(() => {
      measure();
      applyScroll();
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("lenis-scroll", onLenisScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("lenis-scroll", onLenisScroll);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div id={TRACK_ID} className="bg-chalk" style={{ height: wrapperHeight || "200vh" }}>
      <Section
        id="fund-thesis"
        theme="light"
        className="sticky top-0 h-screen overflow-hidden relative z-20 isolate"
      >
        <div className="absolute inset-0 z-0 bg-chalk pointer-events-none" aria-hidden />
        <motion.div
          style={{ opacity: imageOpacity }}
          className="absolute inset-0 z-[1] pointer-events-none"
          aria-hidden
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
            className="absolute inset-0 backdrop-blur-[15px]"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.2) 26.5%, rgba(0,0,0,0.75) 108.3%)",
            }}
          />
        </motion.div>
        <motion.div
          style={{ y: textY, color: textColor }}
          className="absolute top-0 left-0 right-0 z-10 pt-[96px]"
        >
          <SectionContent>
            <div className="flex flex-col gap-[48px]">
              <p className="text-l2 font-medium uppercase">Fund thesis</p>
              <h3 className="font-display text-h3 leading-none tracking-[-1.28px]">
                Backed by the track record and reputation of Bloom.
              </h3>
              <div className="flex flex-col gap-[24px] text-p1">
                {PARAGRAPHS.map((text, i) => (
                  <p key={i} ref={i === PARAGRAPHS.length - 1 ? lastParaRef : undefined}>
                    {text}
                  </p>
                ))}
              </div>
            </div>
          </SectionContent>
        </motion.div>
      </Section>
    </div>
  );
}
