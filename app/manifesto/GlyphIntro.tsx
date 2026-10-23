"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import Image from "next/image";
import styles from "./manifesto.module.css";

export function GlyphIntro() {
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const showStill = !ready || reduce !== false;

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
        >
          <source src="/manifesto/bloom-glyph.mp4" type="video/mp4" />
        </video>
      )}
    </div>
  );
}
