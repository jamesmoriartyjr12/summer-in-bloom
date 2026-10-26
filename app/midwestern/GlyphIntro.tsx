"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Image from "next/image";
import styles from "./manifesto.module.css";

/** Scroll that shrinks the film, as a share of the viewport. */
const SHRINK = 0.28;
/** Scroll by which the bar and the letter have arrived. */
const INTRO = 0.52;
/** Opening size. Scroll brings it back to the frame. */
const OPEN = 1.22;

type OpeningValue = {
  active: boolean;
  scale: MotionValue<number>;
  reveal: MotionValue<number>;
  /** How far the film has followed the scroll. Caps once the letter is free. */
  hold: MotionValue<number>;
  /** Pulls the letter back up by the part of the hold that is not used yet. */
  shift: MotionValue<number>;
};

const OpeningContext = createContext<OpeningValue | null>(null);

function useOpening() {
  const value = useContext(OpeningContext);
  if (!value) throw new Error("Opening");
  return value;
}

function viewport() {
  return typeof window === "undefined" ? 800 : window.innerHeight;
}

export function Opening({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  const { scrollY } = useScroll();
  const introMax = useMotionValue(0);
  const scale = useTransform(scrollY, (y) => {
    const end = viewport() * SHRINK;
    const t = Math.min(1, Math.max(0, y / end));
    return OPEN - t * (OPEN - 1);
  });
  const reveal = useTransform(scrollY, (y) => {
    const height = viewport();
    const start = height * SHRINK;
    const end = height * INTRO;
    return Math.min(1, Math.max(0, (y - start) / (end - start)));
  });
  const hold = useTransform([scrollY, introMax], ([y, max]: number[]) => Math.min(y, max));
  // The letter is laid out one intro lower. This pulls it back until that gap is used,
  // so the page height stays put when the film opens again on the way up.
  const shift = useTransform([scrollY, introMax], ([y, max]: number[]) => Math.min(y, max) - max);

  useEffect(() => {
    setReady(true);
  }, []);

  useLayoutEffect(() => {
    const page = document.querySelector(`.${styles.page}`);
    if (!(page instanceof HTMLElement)) return;
    const apply = () => {
      const next = ready && reduce === false ? window.innerHeight * INTRO : 0;
      introMax.set(next);
      page.style.setProperty("--intro-hold", `${next}px`);
    };
    apply();
    window.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("resize", apply);
      page.style.removeProperty("--intro-hold");
    };
  }, [introMax, ready, reduce]);

  return (
    <OpeningContext.Provider value={{ active: ready && reduce === false, scale, reveal, hold, shift }}>
      {children}
    </OpeningContext.Provider>
  );
}

/** The bar and the letter stay out until the film has shrunk. */
export function Reveal({
  className,
  children,
  hold = false,
}: {
  className?: string;
  children: React.ReactNode;
  hold?: boolean;
}) {
  const { active, reveal, shift } = useOpening();
  const [open, setOpen] = useState(false);

  useMotionValueEvent(reveal, "change", (value) => {
    setOpen(value > 0.04);
  });

  useEffect(() => {
    setOpen(reveal.get() > 0.04);
  }, [reveal]);

  if (!active) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      style={{
        opacity: reveal,
        y: hold ? shift : 0,
        pointerEvents: open ? "auto" : "none",
      }}
    >
      {children}
    </motion.div>
  );
}

export function GlyphIntro() {
  const reduce = useReducedMotion();
  const { active, scale, hold } = useOpening();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const still = ready && reduce === true;
  const play = ready && reduce === false;

  return (
    <>
      <motion.div className={active ? styles.heroFilm : styles.hero} style={active ? { y: hold } : undefined}>
        <motion.div className={styles.mediaFrame} style={active ? { scale } : undefined}>
          <Image
            className={styles.media}
            src={still ? "/manifesto/glyph-still.jpg" : "/manifesto/glyph-poster.jpg"}
            alt="Bloom glyph"
            fill
            priority
            sizes="100vw"
          />
          {play ? (
            <video
              className={styles.media}
              autoPlay
              muted
              playsInline
              preload="auto"
              poster="/manifesto/glyph-poster.jpg"
              aria-label="Bloom glyph animation"
            >
              <source src="/manifesto/bloom-glyph.mp4" type="video/mp4" />
            </video>
          ) : null}
        </motion.div>
      </motion.div>
      {active ? <div className={styles.heroSpacer} aria-hidden="true" /> : null}
    </>
  );
}
