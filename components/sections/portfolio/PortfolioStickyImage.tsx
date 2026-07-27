"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PORTFOLIO_IMAGE_EASE, STICKY_IMAGE_HEIGHT, STICKY_IMAGE_TOP, STICKY_IMAGE_WIDTH, type PortfolioCompany } from "./types";

type PortfolioStickyImageProps = {
  company: PortfolioCompany;
  index: number;
};

export function PortfolioStickyImage({ company, index }: PortfolioStickyImageProps) {
  const reduceMotion = useReducedMotion();
  const direction = index % 2 === 0 ? 1 : -1;

  return (
    <div
      className="sticky overflow-hidden bg-beige relative will-change-transform"
      style={{ top: STICKY_IMAGE_TOP, height: STICKY_IMAGE_HEIGHT }}
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={company.name}
          className="absolute inset-0"
          initial={
            reduceMotion
              ? false
              : { opacity: 0, scale: 1.04, y: direction * 12 }
          }
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={
            reduceMotion
              ? { opacity: 1 }
              : { opacity: 0, scale: 1.02, y: -direction * 8 }
          }
          transition={{
            duration: reduceMotion ? 0 : 0.45,
            ease: PORTFOLIO_IMAGE_EASE,
          }}
        >
          <Image
            src={company.imageSmall}
            alt={company.name}
            fill
            className="object-cover"
            sizes={`${STICKY_IMAGE_WIDTH}px`}
            unoptimized
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
