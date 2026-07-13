"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Section } from "../Section";
import { SectionContent } from "../SectionContent";
import { ARTICLES } from "./InTheNews";

type PortfolioCompany = {
  name: string;
  stage: string;
  tags: string[];
  description: string;
  imageSmall: string;
  imageLarge: string;
  hidden?: boolean;
};

const BASE = "/Bloom%20Portfolio%20Images/";

const PORTFOLIO: PortfolioCompany[] = [
  {
    name: "TeeCommerce",
    stage: "Seed",
    tags: ["Ecomm"],
    description: "Digital pro shops for clubs with zero inventory risk",
    imageSmall: `${BASE}TeeCommerce_Small.png`,
    imageLarge: `${BASE}TeeCommerce_Large.png`,
  },
  {
    name: "OuterProduct",
    stage: "Seed",
    tags: ["Consumer"],
    description: "AI analytics that turn any data into smarter decisions",
    imageSmall: `${BASE}OuterProduct_Small.png`,
    imageLarge: `${BASE}OuterProduct_Large.png`,
  },
  {
    name: "FanFix",
    stage: "Growth",
    tags: ["Consumer", "Money"],
    description: "Monetize exclusive posts, chats and fan access",
    imageSmall: `${BASE}FanFix_Small.png`,
    imageLarge: `${BASE}FanFix_Large.png`,
  },
  {
    name: "Orion",
    stage: "Seed",
    tags: ["Consumer", "Health"],
    description: "Personalized sleep system boosting deep sleep & REM",
    imageSmall: `${BASE}Orion_Small.png`,
    imageLarge: `${BASE}Orion_Large.png`,
  },
  {
    name: "WatchCheck",
    stage: "Seed",
    tags: ["Consumer"],
    description: "Luxury watch care reimagined with trusted precision",
    imageSmall: `${BASE}WatchCheck_Small.png`,
    imageLarge: `${BASE}WatchCheck_Large.png`,
  },
  {
    name: "Meridian",
    stage: "Seed",
    tags: ["Money"],
    description: "Connecting banks worldwide to instant local payments",
    imageSmall: `${BASE}Meridian_Small.png`,
    imageLarge: `${BASE}Meridian_Large.png`,
  },
  {
    name: "Jamie Ai",
    stage: "Seed",
    tags: ["AI"],
    description: "Creating better content, driving bigger sales",
    imageSmall: `${BASE}Jamie_Small.png`,
    imageLarge: `${BASE}Jamie_Large.png`,
  },
  {
    name: "Sunny Benefits",
    stage: "Seed",
    tags: ["Health", "Money"],
    description: "VIP healthcare experience for members and employees",
    imageSmall: `${BASE}Sunny_Small.png`,
    imageLarge: `${BASE}Sunny_Large.png`,
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
    name: "Feno Labs",
    stage: "Seed",
    tags: ["AI Healthcare", "Dental Tech"],
    description: "One-line description coming soon",
    imageSmall: `${BASE}Feno_Small.png`,
    imageLarge: `${BASE}Feno_Large.png`,
  },
];

const VISIBLE_PORTFOLIO = PORTFOLIO.filter((c) => !c.hidden);

// Bottom edge of the sticky image = sticky top (96) + image height (400)
const TRIGGER_Y = 496;

function StickyImage({ activeIndex }: { activeIndex: number }) {
  const company = VISIBLE_PORTFOLIO[activeIndex];
  return (
    <div className="sticky top-[96px] h-[400px] overflow-hidden bg-beige relative">
      <Image src={company.imageSmall} alt={company.name} fill className="object-cover" unoptimized />
      <div className="absolute bottom-[24px] right-[24px] backdrop-blur-[7.5px] bg-[rgba(235,235,235,0.1)] flex items-center px-[12px] py-[6px] rounded-full">
        <p className="text-[12px] font-medium leading-[1.35] uppercase text-[#ebebeb] whitespace-nowrap">Markup</p>
      </div>
    </div>
  );
}

export function CurrentPortfolio() {
  const [activeIndex, setActiveIndex] = useState(0);
  const companyRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const onScroll = () => {
      let next = 0;
      companyRefs.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= TRIGGER_Y) next = i;
      });
      setActiveIndex(next);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Section
      id="current-portfolio"
      theme="light"
      className="relative z-10 bg-chalk text-black pt-[200px] pb-[96px]"
    >
      <SectionContent left={<StickyImage activeIndex={activeIndex} />}>
        <div className="flex flex-col gap-[96px] desktop:gap-[24px]">
          {VISIBLE_PORTFOLIO.map((company, i) => (
            <div
              key={company.name}
              ref={(el) => { companyRefs.current[i] = el; }}
              className="flex flex-col"
            >
              <div className="desktop:hidden aspect-[4/3] w-full overflow-hidden bg-beige relative mb-[48px]">
                <Image src={company.imageLarge} alt={company.name} fill className="object-cover" unoptimized />
                <div className="absolute top-[24px] left-[24px] backdrop-blur-[7.5px] bg-[rgba(235,235,235,0.1)] flex items-center px-[12px] py-[6px] rounded-full">
                  <p className="text-[12px] font-medium leading-[1.35] uppercase text-[#ebebeb] whitespace-nowrap">Markup</p>
                </div>
              </div>
              <div className="desktop:pt-[48px] pt-0 pb-[24px]">
                <p className="font-display text-h3 leading-none tracking-[-1.28px]">
                  {company.name}
                </p>
              </div>
              <div className="flex flex-col desktop:flex-row desktop:items-start gap-[24px] desktop:gap-[48px] py-[24px] border-b border-beige">
                <div className="flex flex-col gap-[12px] flex-1 min-w-0">
                  <p className="text-p2">Description</p>
                  <p className="text-p1">{company.description}</p>
                </div>
                <div className="flex items-center gap-[8px] shrink-0">
                  <div className="bg-orange text-black inline-flex items-center px-[12px] py-[6px] rounded-full w-fit shrink-0">
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
                </div>
              </div>
              {(() => {
                const article = ARTICLES.find((a) => a.company === company.name);
                if (!article) return null;
                return (
                  <div className="flex flex-col gap-[12px] py-[24px] border-b border-beige">
                    <p className="text-p2">In the News</p>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-display text-h5 leading-tight tracking-[-0.48px] underline-offset-4 decoration-[1.5px] hover:underline"
                    >
                      {article.publication}: {article.headline}
                    </a>
                  </div>
                );
              })()}
            </div>
          ))}
        </div>
      </SectionContent>
    </Section>
  );
}
