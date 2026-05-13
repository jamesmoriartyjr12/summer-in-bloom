"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
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

type SectionState = {
  activeId: SectionId;
  theme: SectionTheme;
  setActive: (id: SectionId, theme: SectionTheme) => void;
};

const SectionContext = createContext<SectionState | null>(null);

export function SectionProvider({ children }: { children: React.ReactNode }) {
  const [active, setActiveState] = useState<{
    id: SectionId;
    theme: SectionTheme;
  }>({ id: "hero", theme: "dark" });

  const setActive = useCallback((id: SectionId, theme: SectionTheme) => {
    setActiveState((prev) =>
      prev.id === id && prev.theme === theme ? prev : { id, theme }
    );
  }, []);

  const value = useMemo<SectionState>(
    () => ({ activeId: active.id, theme: active.theme, setActive }),
    [active.id, active.theme, setActive]
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
