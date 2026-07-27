"use client";

import { useRef, useState } from "react";
import { Section } from "../Section";
import { SectionContent } from "../SectionContent";
import { useActiveScrollIndex } from "@/hooks/useActiveScrollIndex";
import { PortfolioCompanyRow } from "./portfolio/PortfolioCompanyRow";
import { PortfolioStickyImage } from "./portfolio/PortfolioStickyImage";
import { STICKY_IMAGE_ZONE, STICKY_IMAGE_WIDTH, type PortfolioCompany } from "./portfolio/types";

const BASE = "/Bloom%20Portfolio%20Images/";
const IMAGE_VERSION = "v=3";
const img = (file: string) => `${BASE}${file}?${IMAGE_VERSION}`;

const PORTFOLIO: PortfolioCompany[] = [
  {
    name: "Jamie Ai",
    stage: "Seed",
    tags: ["AI"],
    description: "Creating better content, driving bigger sales",
    imageSmall: img("Jamie_Small.png"),
    imageLarge: img("Jamie_Large.png"),
  },
  {
    name: "Meridian",
    stage: "Seed",
    tags: ["Payments", "B2B"],
    description: "Connecting banks worldwide to instant local payments",
    imageSmall: img("Meridian_Small.png"),
    imageLarge: img("Meridian_Large.png"),
  },
  {
    name: "Collectible",
    stage: "Seed",
    tags: ["Consumer", "Luxury"],
    description: "Luxury watch care reimagined with trusted precision",
    imageSmall: img("WatchCheck_Small.png"),
    imageLarge: img("WatchCheck_Large.png"),
  },
  {
    name: "Sunny Benefits",
    stage: "Seed",
    tags: ["Consumer", "Health Tech"],
    description: "VIP healthcare experience for members and employees",
    imageSmall: img("Sunny_Small.png"),
    imageLarge: img("Sunny_Large.png"),
  },
  {
    name: "Feno Labs",
    stage: "Seed",
    tags: ["Health Tech"],
    description: "One-line description coming soon",
    imageSmall: img("Feno_Small.png"),
    imageLarge: img("Feno_Large.png"),
  },
  {
    name: "OuterProduct",
    stage: "Seed",
    tags: ["B2B", "AI"],
    description: "AI analytics that turn any data into smarter decisions",
    imageSmall: img("OuterProduct_Small.png"),
    imageLarge: img("OuterProduct_Large.png"),
  },
  {
    name: "TeeCommerce",
    stage: "Seed",
    tags: ["B2B", "Ecommerce"],
    description: "Digital Pro Shops grows from 6M - 12M in a year",
    imageSmall: img("TeeCommerce_Small.png"),
    imageLarge: img("TeeCommerce_Large.png"),
  },
  {
    name: "Milly Books",
    stage: "Seed",
    tags: ["Marketplace"],
    description: "One-line description coming soon",
    imageSmall: img("Milly_Small.png"),
    imageLarge: img("Milly_Large.png"),
  },
  {
    name: "Orion",
    stage: "Series A",
    tags: ["Consumer", "Health"],
    description: "Personalized sleep system boosting deep sleep & REM",
    imageSmall: img("Orion_Small.png"),
    imageLarge: img("Orion_Large.png"),
  },
  {
    name: "FanFix",
    stage: "Growth",
    tags: ["Consumer", "Creator"],
    description: "Monetize exclusive posts, chats and fan access",
    imageSmall: img("FanFix_Small.png"),
    imageLarge: img("FanFix_Large.png"),
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
