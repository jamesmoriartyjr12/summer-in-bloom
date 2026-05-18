"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useSection } from "./SectionContext";
import { useLenis } from "./LenisContext";

export function TopNav() {
  const { activeId, theme } = useSection();
  const lenis = useLenis();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setVisible(current < lastScrollY.current || current < 10);
      lastScrollY.current = current;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const variantClass =
    activeId === "hero"
      ? "border-b border-chalk-25 text-chalk"
      : theme === "dark"
      ? "text-chalk backdrop-blur-[5px] bg-[rgba(235,235,235,0.05)]"
      : "text-black backdrop-blur-[5px] bg-[rgba(235,235,235,0.05)]";

  return (
    <motion.header
      animate={{ y: visible ? 0 : "-100%" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-[24px] mobile:px-[48px] py-[24px] text-l1 uppercase ${variantClass}`}
    >
      <button
        type="button"
        onClick={() => lenis?.scrollTo(0)}
        className="cursor-pointer uppercase"
      >
        Bloom Ventures
      </button>
      <span>July 2026</span>
    </motion.header>
  );
}
