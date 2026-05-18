"use client";

import { useEffect, useState } from "react";
import Lenis from "lenis";
import { LenisContext } from "./LenisContext";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const instance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // Lenis often drives scroll without firing native `window` scroll events every
    // frame; listeners on `lenis-scroll` can stay in sync (e.g. FundThesis).
    const onLenisScroll = (l: { scroll: number }) => {
      window.dispatchEvent(new CustomEvent("lenis-scroll", { detail: { scroll: l.scroll } }));
    };
    instance.on("scroll", onLenisScroll);

    let rafId: number;
    function raf(time: number) {
      instance.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    setLenis(instance);

    return () => {
      cancelAnimationFrame(rafId);
      instance.off("scroll", onLenisScroll);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
