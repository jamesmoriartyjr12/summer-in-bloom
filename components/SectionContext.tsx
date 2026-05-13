"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type SectionTheme = "light" | "dark";

export type SectionId =
  | "hero"
  | "fund-details"
  | "fund-thesis"
  | "pipeline"
  | "current-portfolio"
  | "contact";

type SectionEntry = { element: HTMLElement; theme: SectionTheme };

type SectionState = {
  activeId: SectionId;
  theme: SectionTheme;
  registerSection: (
    id: SectionId,
    el: HTMLElement | null,
    theme: SectionTheme
  ) => void;
  updateTheme: (id: SectionId, theme: SectionTheme) => void;
};

// A section becomes active when its top edge crosses within 48px of the viewport top.
const OFFSET = 48;

const SectionContext = createContext<SectionState | null>(null);

export function SectionProvider({ children }: { children: React.ReactNode }) {
  const [active, setActiveState] = useState<{
    id: SectionId;
    theme: SectionTheme;
  }>({ id: "hero", theme: "dark" });

  const sectionsRef = useRef<Map<SectionId, SectionEntry>>(new Map());

  const registerSection = useCallback(
    (id: SectionId, el: HTMLElement | null, theme: SectionTheme) => {
      if (el) {
        sectionsRef.current.set(id, { element: el, theme });
      } else {
        sectionsRef.current.delete(id);
      }
    },
    []
  );

  const updateTheme = useCallback((id: SectionId, theme: SectionTheme) => {
    const entry = sectionsRef.current.get(id);
    if (entry) sectionsRef.current.set(id, { ...entry, theme });
    setActiveState((prev) => (prev.id === id ? { id, theme } : prev));
  }, []);

  useEffect(() => {
    const onScroll = () => {
      // Default to hero when no other section has reached the threshold.
      let next: { id: SectionId; theme: SectionTheme } = {
        id: "hero",
        theme: "dark",
      };

      // Iterate in insertion order (top → bottom). The last section whose
      // top edge is at or above the OFFSET line wins.
      for (const [id, { element, theme }] of sectionsRef.current) {
        if (id === "hero") continue;
        if (element.getBoundingClientRect().top <= OFFSET) {
          next = { id, theme };
        }
      }

      setActiveState((prev) => (prev.id === next.id ? prev : next));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // set correct state on mount
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const value = useMemo<SectionState>(
    () => ({ activeId: active.id, theme: active.theme, registerSection, updateTheme }),
    [active.id, active.theme, registerSection, updateTheme]
  );

  return (
    <SectionContext.Provider value={value}>{children}</SectionContext.Provider>
  );
}

export function useSection() {
  const ctx = useContext(SectionContext);
  if (!ctx) throw new Error("useSection must be used within SectionProvider");
  return ctx;
}
