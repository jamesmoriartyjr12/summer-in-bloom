"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./manifesto.module.css";

function usePrefersReducedMotion(): boolean | null {
  const [reduce, setReduce] = useState<boolean | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduce;
}

export function GlyphIntro() {
  const reduce = usePrefersReducedMotion();
  const [cue, setCue] = useState(false);

  useEffect(() => {
    if (reduce) setCue(true);
  }, [reduce]);

  useEffect(() => {
    if (reduce !== false) return;
    const timer = window.setTimeout(() => setCue(true), 10500);
    return () => window.clearTimeout(timer);
  }, [reduce]);

  const showStill = reduce !== false;

  return (
    <div className={styles.hero}>
      {showStill ? (
        <Image
          className={styles.media}
          src={reduce ? "/manifesto/glyph-still.jpg" : "/manifesto/glyph-poster.jpg"}
          alt="Bloom glyph"
          fill
          priority
          sizes="100vw"
        />
      ) : (
        <video
          className={styles.media}
          autoPlay
          muted
          playsInline
          preload="auto"
          poster="/manifesto/glyph-poster.jpg"
          aria-label="Bloom glyph animation"
          onEnded={() => setCue(true)}
        >
          <source src="/manifesto/bloom-glyph.mp4" type="video/mp4" />
        </video>
      )}
      <p className={cue ? `${styles.cue} ${styles.cueShow}` : styles.cue}>Scroll</p>
    </div>
  );
}
