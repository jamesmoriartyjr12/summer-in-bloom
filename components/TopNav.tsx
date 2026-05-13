"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useSection } from "./SectionContext";

export function TopNav() {
  const { activeId } = useSection();
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
      : activeId === "fund-thesis"
      ? "text-chalk backdrop-blur-[5px] bg-[rgba(235,235,235,0.05)]"
      : "text-black backdrop-blur-[5px] bg-[rgba(235,235,235,0.05)]";

  return (
    <motion.header
      animate={{ y: visible ? 0 : "-100%" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-[48px] py-[24px] text-l1 uppercase ${variantClass}`}
    >
      <span>Bloom Ventures</span>
      <span>July 2026</span>
    </motion.header>
  );
}
