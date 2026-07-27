"use client";

import { useEffect, useState, type RefObject } from "react";

export type ScrollZone = {
  top: number;
  bottom: number;
};

/**
 * Returns the index of the row that best aligns with a viewport zone
 * (e.g. the sticky image band). Uses the zone midpoint as an anchor so
 * image swaps track each row's actual scroll height, including gaps.
 */
export function useActiveScrollIndex(
  refs: RefObject<(HTMLElement | null)[]>,
  zone: ScrollZone,
): number {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let rafId = 0;

    const update = () => {
      rafId = 0;
      const anchor = zone.top + (zone.bottom - zone.top) / 2;

      let contained = -1;
      let lastPassed = 0;

      refs.current?.forEach((el, i) => {
        if (!el) return;
        const { top, bottom } = el.getBoundingClientRect();
        if (top <= anchor && bottom > anchor) contained = i;
        if (top <= anchor) lastPassed = i;
      });

      const next = contained >= 0 ? contained : lastPassed;
      setActiveIndex((prev) => (prev === next ? prev : next));
    };

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("lenis-scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("lenis-scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [refs, zone.top, zone.bottom]);

  return activeIndex;
}
