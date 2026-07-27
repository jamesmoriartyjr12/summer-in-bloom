"use client";

import { useRef, useState } from "react";
import { Section } from "../Section";
import { useActiveScrollIndex } from "@/hooks/useActiveScrollIndex";
import { PortfolioBackgroundImage } from "./portfolio/PortfolioBackgroundImage";
import { PortfolioCompanyRow } from "./portfolio/PortfolioCompanyRow";
import {
  PANEL_MIN_HEIGHT,
  PORTFOLIO_CONTENT_INSET,
  TRIGGER_Y,
  type PortfolioCompany,
} from "./portfolio/types";

const BASE = "/Bloom%20Portfolio%20Images/";

const PORTFOLIO: PortfolioCompany[] = [
  {
    name: "Jamie Ai",
    stage: "Seed",
    tags: ["AI"],
    description: "Creating better content, driving bigger sales",
    imageSmall: `${BASE}Jamie_Small.png`,
    imageLarge: `${BASE}Jamie_Large.png`,
  },
  {
    name: "Meridian",
    stage: "Seed",
    tags: ["Payments", "B2B"],
    description: "Connecting banks worldwide to instant local payments",
    imageSmall: `${BASE}Meridian_Small.png`,
    imageLarge: `${BASE}Meridian_Large.png`,
  },
  {
    name: "Collectible",
    stage: "Seed",
    tags: ["Consumer", "Luxury"],
    description: "Luxury watch care reimagined with trusted precision",
    imageSmall: `${BASE}WatchCheck_Small.png`,
    imageLarge: `${BASE}WatchCheck_Large.png`,
  },
  {
    name: "Sunny Benefits",
    stage: "Seed",
    tags: ["Consumer", "Health Tech"],
    description: "VIP healthcare experience for members and employees",
    imageSmall: `${BASE}Sunny_Small.png`,
    imageLarge: `${BASE}Sunny_Large.png`,
  },
  {
    name: "Feno Labs",
    stage: "Seed",
    tags: ["Health Tech"],
    description: "One-line description coming soon",
    imageSmall: `${BASE}Feno_Small.png`,
    imageLarge: `${BASE}Feno_Large.png`,
  },
  {
    name: "OuterProduct",
    stage: "Seed",
    tags: ["B2B", "AI"],
    description: "AI analytics that turn any data into smarter decisions",
    imageSmall: `${BASE}OuterProduct_Small.png`,
    imageLarge: `${BASE}OuterProduct_Large.png`,
  },
  {
    name: "TeeCommerce",
    stage: "Seed",
    tags: ["B2B", "Ecommerce"],
    description: "Digital Pro Shops grows from 6M - 12M in a year",
    imageSmall: `${BASE}TeeCommerce_Small.png`,
    imageLarge: `${BASE}TeeCommerce_Large.png`,
  },
  {
    name: "Milly Books",
    stage: "Seed",
    tags: ["Marketplace"],
    description: "One-line description coming soon",
    imageSmall: `${BASE}Milly_Small.png`,
    imageLarge: `${BASE}Milly_Large.png`,
  },
  {
    name: "Orion",
    stage: "Series A",
    tags: ["Consumer", "Health"],
    description: "Personalized sleep system boosting deep sleep & REM",
    imageSmall: `${BASE}Orion_Small.png`,
    imageLarge: `${BASE}Orion_Large.png`,
  },
  {
    name: "FanFix",
    stage: "Growth",
    tags: ["Consumer", "Creator"],
    description: "Monetize exclusive posts, chats and fan access",
    imageSmall: `${BASE}FanFix_Small.png`,
    imageLarge: `${BASE}FanFix_Large.png`,
  },
];

const VISIBLE_PORTFOLIO = PORTFOLIO.filter((c) => !c.hidden);

export function CurrentPortfolio() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const companyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeIndex = useActiveScrollIndex(companyRefs, TRIGGER_Y);
  const displayIndex = hoveredIndex ?? activeIndex;
  const displayCompany = VISIBLE_PORTFOLIO[displayIndex];

  return (
    <Section
      id="current-portfolio"
      theme="light"
      className="relative z-10 bg-chalk text-black pt-[200px] pb-0 desktop:pb-[96px]"
    >
      {/* Desktop: full-bleed background with content scrolling over it */}
      <div className={`hidden desktop:grid grid-cols-1 ${PORTFOLIO_CONTENT_INSET}`}>
        <div className="col-start-1 row-start-1 row-end-[-1] sticky top-[96px] h-[calc(100vh-96px)] self-start z-0 overflow-hidden relative">
          <PortfolioBackgroundImage
            company={displayCompany}
            index={displayIndex}
          />
          {/* Readability gradient — content sits on the right */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, rgba(0,0,0,0.08) 0%, rgba(235,235,235,0.15) 42%, rgba(235,235,235,0.88) 62%, rgba(235,235,235,0.96) 100%)",
            }}
          />
        </div>

        {VISIBLE_PORTFOLIO.map((company, i) => (
          <div
            key={company.name}
            ref={(el) => {
              companyRefs.current[i] = el;
            }}
            className="col-start-1 z-10 flex items-end justify-end snap-start"
            style={{ minHeight: PANEL_MIN_HEIGHT }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="w-full max-w-[560px] xl:max-w-[640px] pb-[10vh] pt-[32px]">
              <PortfolioCompanyRow
                company={company}
                index={i}
                isActive={displayIndex === i}
                variant="overlay"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Mobile / tablet: stacked list with inline images */}
      <div className={`desktop:hidden ${PORTFOLIO_CONTENT_INSET} pb-[96px]`}>
        <div className="flex flex-col gap-[80px]">
          {VISIBLE_PORTFOLIO.map((company, i) => (
            <PortfolioCompanyRow
              key={company.name}
              registerRef={(el) => {
                companyRefs.current[i] = el;
              }}
              company={company}
              index={i}
              isActive={displayIndex === i}
              variant="stacked"
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
