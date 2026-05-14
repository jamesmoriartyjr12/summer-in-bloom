"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // Lenis often drives scroll without firing native `window` scroll events every
    // frame; listeners on `lenis-scroll` can stay in sync (e.g. FundThesis).
    const onLenisScroll = (l: { scroll: number }) => {
      window.dispatchEvent(new CustomEvent("lenis-scroll", { detail: { scroll: l.scroll } }));
    };
    lenis.on("scroll", onLenisScroll);

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.off("scroll", onLenisScroll);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
