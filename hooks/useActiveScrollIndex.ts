"use client";

import { useEffect, useState, type RefObject } from "react";

export function useActiveScrollIndex(
  refs: RefObject<(HTMLElement | null)[]>,
  triggerY: number,
): number {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let rafId = 0;

    const update = () => {
      rafId = 0;
      let next = 0;
      refs.current?.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= triggerY) next = i;
      });
      setActiveIndex((prev) => (prev === next ? prev : next));
    };

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("lenis-scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("lenis-scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [refs, triggerY]);

  return activeIndex;
}
