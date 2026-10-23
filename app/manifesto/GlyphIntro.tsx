"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { chromeSnap } from "@/lib/motion";
import styles from "./manifesto.module.css";

/** The glyph film is 10.04s. That length is the film, not a UI token. */
const FILM_MS = 10040;

export function GlyphIntro() {
  const reduce = useReducedMotion();
  const [cue, setCue] = useState(false);

  useEffect(() => {
    if (reduce) setCue(true);
  }, [reduce]);

  useEffect(() => {
    if (reduce !== false) return;
    const timer = window.setTimeout(() => setCue(true), FILM_MS);
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
      <motion.p
        className={styles.cue}
        initial={false}
        animate={{ opacity: cue ? 1 : 0 }}
        transition={{
          duration: reduce === false ? chromeSnap.duration : 0,
          ease: chromeSnap.ease,
        }}
      >
        Scroll
      </motion.p>
    </div>
  );
}
