"use client";

import { useEffect, useRef } from "react";
import { SectionId, SectionTheme, useSection } from "./SectionContext";

type SectionProps = {
  id: SectionId;
  theme: SectionTheme;
  className?: string;
  children: React.ReactNode;
};

export function Section({ id, theme, className, children }: SectionProps) {
  const ref = useRef<HTMLElement | null>(null);
  const { registerSection } = useSection();

  useEffect(() => {
    registerSection(id, ref.current, theme);
    return () => registerSection(id, null, theme);
  }, [id, theme, registerSection]);

  return (
    <section ref={ref} id={id} className={className}>
      {children}
    </section>
  );
}
