"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  motion,
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
  hold: MotionValue<number>;
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
  const hold = useTransform(scrollY, (y) => Math.min(y, viewport() * INTRO));

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <OpeningContext.Provider value={{ active: ready && reduce === false, scale, reveal, hold }}>
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
  const { active, reveal, hold: holdY } = useOpening();
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
        y: hold ? holdY : 0,
        pointerEvents: open ? "auto" : "none",
      }}
    >
      {children}
    </motion.div>
  );
}

export function GlyphIntro() {
  const reduce = useReducedMotion();
  const { active, scale } = useOpening();
  const { scrollY } = useScroll();
  const [ready, setReady] = useState(false);
  const [pin, setPin] = useState({ released: false, top: 0 });

  useEffect(() => {
    setReady(true);
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    if (!active) return;
    const end = window.innerHeight * INTRO;
    const released = y >= end;
    setPin((prev) => (prev.released === released ? prev : { released, top: end }));
  });

  const still = ready && reduce === true;
  const play = ready && reduce === false;
  const heroClass = !active ? styles.hero : pin.released ? styles.heroReleased : styles.heroPinned;

  return (
    <>
      <div className={heroClass} style={active && pin.released ? { top: pin.top } : undefined}>
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
      </div>
      {active ? <div className={styles.heroSpacer} aria-hidden="true" /> : null}
    </>
  );
}
