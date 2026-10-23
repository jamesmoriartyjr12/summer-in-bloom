"use client";

import { useEffect } from "react";
import styles from "./manifesto.module.css";

const GROUND = "#faf8f4";

export function PageGround({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const body = document.body;
    const previous = body.style.background;
    body.style.background = GROUND;
    return () => {
      body.style.background = previous;
    };
  }, []);

  return <div className={styles.page}>{children}</div>;
}
