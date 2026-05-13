"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SectionId, useSection } from "./SectionContext";

type NavItem = {
  id: SectionId;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: "fund-details", label: "Fund Details" },
  { id: "fund-thesis", label: "Fund Thesis" },
  { id: "pipeline", label: "Pipeline" },
  { id: "current-portfolio", label: "Current Porfolio" },
  { id: "contact", label: "Contact" },
];

const TOP = 96;

export function SideNav() {
  const { activeId, theme } = useSection();
  const [vh, setVh] = useState(800);

  useEffect(() => {
    setVh(window.innerHeight);
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const { scrollY } = useScroll();

  const y = useTransform(scrollY, [0, vh], [vh, 0], { clamp: true });

  const isDark = theme === "dark";
  const activeColor = isDark ? "#EBEBEB" : "#000000";
  const inactiveColor = isDark ? "rgba(235,235,235,0.25)" : "#777169";

  return (
    <motion.nav
      aria-label="Section navigation"
      style={{ y }}
      className="fixed left-0 top-[96px] z-50 px-[16px] w-[200px]"
    >
      <ul className="flex flex-col gap-[8px]">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === activeId;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById(item.id);
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center gap-[24px] py-[8px] w-full text-left"
              >
                <motion.span
                  aria-hidden
                  animate={{
                    backgroundColor: isActive ? activeColor : "transparent",
                    borderColor: isActive ? activeColor : "transparent",
                  }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="block w-[8px] h-[8px] rounded-full border"
                  style={{ borderWidth: 1 }}
                />
                <motion.span
                  animate={{ color: isActive ? activeColor : inactiveColor }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="text-l2 whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              </button>
            </li>
          );
        })}
      </ul>
    </motion.nav>
  );
}
