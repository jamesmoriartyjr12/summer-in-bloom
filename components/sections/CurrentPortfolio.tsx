"use client";

import { useRef, useState } from "react";
import { PORTFOLIO } from "@/content/portfolio";
import { Section } from "../Section";
import { SectionContent } from "../SectionContent";
import { useActiveScrollIndex } from "@/hooks/useActiveScrollIndex";
import { PortfolioCompanyRow } from "./portfolio/PortfolioCompanyRow";
import { PortfolioStickyImage } from "./portfolio/PortfolioStickyImage";
import { PORTFOLIO_LAYOUT_MAX_WIDTH, STICKY_IMAGE_ZONE, STICKY_IMAGE_WIDTH } from "./portfolio/types";

const VISIBLE_PORTFOLIO = PORTFOLIO.filter((c) => !c.hidden);

export function CurrentPortfolio() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const companyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeIndex = useActiveScrollIndex(companyRefs, STICKY_IMAGE_ZONE);
  const displayIndex = hoveredIndex ?? activeIndex;
  const displayCompany = VISIBLE_PORTFOLIO[displayIndex];

  return (
    <Section
      id="current-portfolio"
      theme="light"
      className="relative z-10 bg-chalk text-black pt-[200px] pb-[96px]"
    >
      <SectionContent
        leftColumnWidth={STICKY_IMAGE_WIDTH}
        maxWidth={PORTFOLIO_LAYOUT_MAX_WIDTH}
        left={
          <PortfolioStickyImage
            company={displayCompany}
            index={displayIndex}
          />
        }
      >
        <div className="flex flex-col gap-[80px] desktop:gap-[64px]">
          {VISIBLE_PORTFOLIO.map((company, i) => (
            <PortfolioCompanyRow
              key={company.name}
              registerRef={(el) => {
                companyRefs.current[i] = el;
              }}
              company={company}
              index={i}
              isActive={displayIndex === i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </div>
      </SectionContent>
    </Section>
  );
}
