"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PORTFOLIO_IMAGE_EASE, type PortfolioCompany } from "./types";

type PortfolioStickyImageProps = {
  company: PortfolioCompany;
  index: number;
};

export function PortfolioStickyImage({ company, index }: PortfolioStickyImageProps) {
  const reduceMotion = useReducedMotion();
  const direction = index % 2 === 0 ? 1 : -1;

  return (
    <div className="sticky top-[96px] h-[400px] overflow-hidden bg-beige relative will-change-transform">
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
            unoptimized
          />
          <div className="absolute bottom-[24px] right-[24px] backdrop-blur-[7.5px] bg-[rgba(235,235,235,0.1)] flex items-center px-[12px] py-[6px] rounded-full">
            <p className="text-[12px] font-medium leading-[1.35] uppercase text-[#ebebeb] whitespace-nowrap">
              Markup
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
