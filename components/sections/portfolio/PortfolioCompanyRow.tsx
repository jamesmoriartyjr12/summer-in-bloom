"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ARTICLES } from "../InTheNews";
import { PortfolioImage } from "./PortfolioImage";
import {
  DEFAULT_STAGE_STYLE,
  PORTFOLIO_IMAGE_EASE,
  SPOTLIGHT_INACTIVE_OPACITY_DESKTOP,
  SPOTLIGHT_INACTIVE_OPACITY_MOBILE,
  STAGE_STYLES,
  type PortfolioCompany,
} from "./types";

type PortfolioCompanyRowProps = {
  company: PortfolioCompany;
  index: number;
  isActive: boolean;
  registerRef: (el: HTMLDivElement | null) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

const revealVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function PortfolioCompanyRow({
  company,
  index,
  isActive,
  registerRef,
  onMouseEnter,
  onMouseLeave,
}: PortfolioCompanyRowProps) {
  const reduceMotion = useReducedMotion();
  const rowRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(rowRef, { once: true, margin: "-10% 0px" });
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1100px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const inactiveOpacity = isDesktop
    ? SPOTLIGHT_INACTIVE_OPACITY_DESKTOP
    : SPOTLIGHT_INACTIVE_OPACITY_MOBILE;

  const shouldReveal = reduceMotion || inView;
  const staggerBase = index * 0.06;

  const article = ARTICLES.find((a) => a.company === company.name);

  return (
    <motion.div
      ref={(el) => {
        rowRef.current = el;
        registerRef(el);
      }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="flex flex-col"
        animate={{
          opacity: reduceMotion ? 1 : isActive ? 1 : inactiveOpacity,
          y: reduceMotion ? 0 : isActive ? 0 : 2,
        }}
        transition={{ duration: reduceMotion ? 0 : 0.3 }}
      >
        <motion.div
          className="desktop:hidden aspect-[4/3] w-full overflow-hidden bg-beige relative mb-[48px]"
          initial={reduceMotion ? false : { opacity: 0, scale: 1.03 }}
          animate={
            shouldReveal
              ? { opacity: 1, scale: 1 }
              : { opacity: 0, scale: 1.03 }
          }
          transition={{
            duration: reduceMotion ? 0 : 0.5,
            ease: PORTFOLIO_IMAGE_EASE,
          }}
        >
          <PortfolioImage
            src={company.imageLarge}
            alt={company.name}
            sizes="100vw"
            fit={company.imageFit ?? "default"}
          />
        </motion.div>

        <motion.div
          className="desktop:pt-[32px] pt-0"
          variants={revealVariants}
          initial={reduceMotion ? false : "hidden"}
          animate={shouldReveal ? "visible" : "hidden"}
          transition={{
            duration: reduceMotion ? 0 : 0.5,
            delay: reduceMotion ? 0 : staggerBase,
            ease: PORTFOLIO_IMAGE_EASE,
          }}
        >
          <h3 className="font-display text-h3 leading-none tracking-[-1.28px] text-balance">
            {company.name}
          </h3>
        </motion.div>

        <motion.div
          className="flex items-center flex-wrap gap-[8px] pt-[16px] pb-[20px]"
          variants={revealVariants}
          initial={reduceMotion ? false : "hidden"}
          animate={shouldReveal ? "visible" : "hidden"}
          transition={{
            duration: reduceMotion ? 0 : 0.5,
            delay: reduceMotion ? 0 : staggerBase + 0.06,
            ease: PORTFOLIO_IMAGE_EASE,
          }}
        >
          <div
            className={`${STAGE_STYLES[company.stage]?.bg ?? DEFAULT_STAGE_STYLE.bg} ${STAGE_STYLES[company.stage]?.text ?? DEFAULT_STAGE_STYLE.text} inline-flex items-center px-[12px] py-[6px] rounded-full w-fit shrink-0`}
          >
            <p className="text-[12px] font-medium leading-[1.35] uppercase">
              {company.stage}
            </p>
          </div>
          {company.tags.map((tag) => (
            <div
              key={tag}
              className="bg-[rgba(196,195,182,0.5)] flex items-center px-[12px] py-[6px] rounded-full shrink-0"
            >
              <p className="text-[12px] font-medium leading-[1.35] uppercase">{tag}</p>
            </div>
          ))}
        </motion.div>

        {!article ? (
          <motion.div
            className="pb-[28px] border-b border-beige"
            variants={revealVariants}
            initial={reduceMotion ? false : "hidden"}
            animate={shouldReveal ? "visible" : "hidden"}
            transition={{
              duration: reduceMotion ? 0 : 0.5,
              delay: reduceMotion ? 0 : staggerBase + 0.12,
              ease: PORTFOLIO_IMAGE_EASE,
            }}
          >
            <p className="font-display text-h5 leading-tight tracking-[-0.48px] text-balance">
              {company.description}
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="flex flex-col desktop:flex-row desktop:items-end gap-[16px] desktop:gap-[24px] pb-[28px] border-b border-beige"
            variants={revealVariants}
            initial={reduceMotion ? false : "hidden"}
            animate={shouldReveal ? "visible" : "hidden"}
            transition={{
              duration: reduceMotion ? 0 : 0.5,
              delay: reduceMotion ? 0 : staggerBase + 0.12,
              ease: PORTFOLIO_IMAGE_EASE,
            }}
          >
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-h5 leading-tight tracking-[-0.48px] underline-offset-4 decoration-[1.5px] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-chalk rounded-sm flex-1 min-w-0"
            >
              {article.headline}
            </a>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group border border-black hover:bg-black transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-chalk self-start desktop:self-auto shrink-0 flex items-center px-[16px] py-[8px] rounded-lg"
            >
              <span className="text-[12px] font-medium leading-[1.35] uppercase text-black group-hover:text-chalk transition-colors motion-reduce:transition-none">
                {article.publication}
              </span>
              <span className="w-0 ml-0 group-hover:w-[10px] group-hover:ml-[8px] overflow-hidden transition-[width,margin-left] duration-200 motion-reduce:transition-none flex items-center justify-end shrink-0">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="text-black group-hover:text-chalk transition-colors motion-reduce:transition-none shrink-0"
                >
                  <path
                    d="M2.5 7.5L7.5 2.5M7.5 2.5H3.5M7.5 2.5V6.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </a>
          </motion.div>
        )}
      </motion.div>
    );
}
