"use client";

import { useEffect, useRef } from "react";
import { SectionId, SectionTheme, useSection } from "./SectionContext";

type SectionProps = {
  id: SectionId;
  theme: SectionTheme;
  className?: string;
  children: React.ReactNode;
};

/**
 * Wraps a page section and registers it with the global SectionContext
 * so the persistent side nav knows when it's in view and what theme to use.
 *
 * The observer fires when a section's center crosses the viewport center —
 * this prevents the active state from flickering between adjacent sections.
 */
export function Section({ id, theme, className, children }: SectionProps) {
  const ref = useRef<HTMLElement | null>(null);
  const { setActive } = useSection();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(id, theme);
          }
        }
      },
      {
        // Trigger when the section's center is in the middle band of the viewport
        rootMargin: "-40% 0px -40% 0px",
        threshold: 0,
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [id, theme, setActive]);

  return (
    <section ref={ref} id={id} className={className}>
      {children}
    </section>
  );
}
