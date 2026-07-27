"use client";

import { useRef, useState } from "react";
import { Section } from "../Section";
import { SectionContent } from "../SectionContent";
import { useActiveScrollIndex } from "@/hooks/useActiveScrollIndex";
import { PortfolioCompanyRow } from "./portfolio/PortfolioCompanyRow";
import { PortfolioStickyImage } from "./portfolio/PortfolioStickyImage";
import { STICKY_IMAGE_ZONE, STICKY_IMAGE_WIDTH, type PortfolioCompany } from "./portfolio/types";

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
