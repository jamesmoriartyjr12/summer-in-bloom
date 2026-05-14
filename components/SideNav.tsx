"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
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

function scrollTo(id: SectionId) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function SideNav() {
  const { activeId, theme } = useSection();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [vh, setVh] = useState(800);

  useEffect(() => {
    const measure = () => {
      setVh(window.innerHeight);
      const mobile = window.innerWidth < 600;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(false);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Push page content left when mobile nav is open
  useEffect(() => {
    document.documentElement.classList.toggle("mobile-nav-open", isOpen);
    return () => document.documentElement.classList.remove("mobile-nav-open");
  }, [isOpen]);

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, vh], [vh, 0], { clamp: true });

  const isDark = theme === "dark";
  const activeColor = isDark ? "#EBEBEB" : "#000000";
  const inactiveColor = isDark ? "rgba(235,235,235,0.25)" : "#777169";

  return (
    <>
      {/* Desktop side nav — visible at 600px+ */}
      <motion.nav
        aria-label="Section navigation"
        style={{ y }}
        className="max-[599px]:hidden fixed left-0 top-[96px] z-50 px-[16px] w-[200px]"
      >
        <ul className="flex flex-col gap-[8px]">
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === activeId;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => scrollTo(item.id)}
                  className="flex items-center gap-[24px] py-[8px] w-full text-left"
                >
                  <motion.span
                    aria-hidden
                    animate={{
                      backgroundColor: isActive ? activeColor : "transparent",
                      borderColor: isActive ? activeColor : "transparent",
                    }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="block w-[8px] h-[8px] rounded-full border shrink-0"
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

      {/* Mobile hamburger + panel — only rendered below 600px */}
      {isMobile && <div>
        {/* Hamburger / X button */}
        <motion.button
          type="button"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsOpen((v) => !v)}
          style={{ y, color: isDark ? "#EBEBEB" : "#000000" }}
          className="fixed left-[16px] top-[96px] z-50 p-[8px]"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.svg
                key="close"
                initial={{ opacity: 0, rotate: -45 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 45 }}
                transition={{ duration: 0.2 }}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M2 2L14 14M14 2L2 14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </motion.svg>
            ) : (
              <motion.svg
                key="menu"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                width="20"
                height="14"
                viewBox="0 0 20 14"
                fill="none"
              >
                <path
                  d="M0 1H20M0 7H20M0 13H20"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Slide-in nav panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.nav
              aria-label="Section navigation"
              initial={{ x: -200 }}
              animate={{ x: 0 }}
              exit={{ x: -200 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed left-0 top-[136px] w-[200px] z-40 px-[16px] py-[8px]"
            >
              <ul className="flex flex-col gap-[8px]">
                {NAV_ITEMS.map((item) => {
                  const isActive = item.id === activeId;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          scrollTo(item.id);
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-[24px] py-[8px] w-full text-left"
                      >
                        <span
                          className="block w-[8px] h-[8px] rounded-full border shrink-0"
                          style={{
                            borderWidth: 1,
                            backgroundColor: isActive ? activeColor : "transparent",
                            borderColor: isActive ? activeColor : "transparent",
                          }}
                        />
                        <span
                          className="text-l2 whitespace-nowrap"
                          style={{ color: isActive ? activeColor : inactiveColor }}
                        >
                          {item.label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>}
    </>
  );
}
