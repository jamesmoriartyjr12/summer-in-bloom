"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useSection } from "./SectionContext";

const THESIS_IMAGE = "/fund-thesis-BG.png";

export function FundThesisBackground() {
  const { fundThesisOpacity } = useSection();
  return (
    <motion.div
      style={{ opacity: fundThesisOpacity }}
      className="fixed inset-0 pointer-events-none z-0"
    >
      <Image
        src={THESIS_IMAGE}
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
        unoptimized
      />
      <div
        aria-hidden
        className="absolute inset-0 backdrop-blur-[15px]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.2) 26.5%, rgba(0,0,0,0.75) 108.3%)",
        }}
      />
    </motion.div>
  );
}
