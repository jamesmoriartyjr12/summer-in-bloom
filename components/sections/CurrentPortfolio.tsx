"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Section } from "../Section";
import { SectionContent } from "../SectionContent";

type PortfolioCompany = {
  name: string;
  stage: string;
  tags: string[];
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
    imageSmall: `${BASE}TeeCommerce_Small.png`,
    imageLarge: `${BASE}TeeCommerce_Large.png`,
  },
  {
    name: "OuterProduct",
    stage: "Seed",
    tags: ["Consumer"],
    imageSmall: `${BASE}OuterProduct_Small.png`,
    imageLarge: `${BASE}OuterProduct_Large.png`,
  },
  {
    name: "FanFix",
    stage: "Post-Acquisition Growth",
    tags: ["Consumer", "Money"],
    imageSmall: `${BASE}FanFix_Small.png`,
    imageLarge: `${BASE}FanFix_Large.png`,
  },
  {
    name: "Orion",
    stage: "Seed",
    tags: ["Consumer", "Health"],
    imageSmall: `${BASE}Orion_Small.png`,
    imageLarge: `${BASE}Orion_Large.png`,
  },
  {
    name: "WatchCheck",
    stage: "Seed",
    tags: ["Consumer"],
    imageSmall: `${BASE}WatchCheck_Small.png`,
    imageLarge: `${BASE}WatchCheck_Large.png`,
  },
  {
    name: "Meridian",
    stage: "Seed",
    tags: ["Money"],
    imageSmall: `${BASE}Meridian_Small.png`,
    imageLarge: `${BASE}Meridian_Large.png`,
  },
  {
    name: "Jamie Ai",
    stage: "Seed",
    tags: ["AI"],
    imageSmall: `${BASE}Jamie_Small.png`,
    imageLarge: `${BASE}Jamie_Large.png`,
  },
  {
    name: "Sunny Benefits",
    stage: "Seed",
    tags: ["Health", "Money"],
    imageSmall: `${BASE}Sunny_Small.png`,
    imageLarge: `${BASE}Sunny_Large.png`,
  },
  {
    name: "Milly Books",
    stage: "Seed",
    tags: ["Marketplace"],
    imageSmall: `${BASE}Milly_Small.png`,
    imageLarge: `${BASE}Milly_Large.png`,
  },
  {
    name: "Feno Labs",
    stage: "Seed",
    tags: ["AI Healthcare", "Dental Tech"],
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
              {i === 0 && (
                <p className="text-l2 font-medium uppercase mb-[48px] desktop:mb-0">Current Portfolio</p>
              )}
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
              <div className="flex flex-col desktop:flex-row desktop:items-center desktop:justify-between gap-[12px] py-[24px] border-b border-beige">
                <div className="flex flex-col gap-[12px]">
                  <p className="text-p2">Stage</p>
                  <div className="bg-orange text-black inline-flex items-center px-[16px] py-[8px] rounded-full w-fit">
                    <p className="font-display text-h5 leading-none tracking-[-0.48px]">
                      {company.stage}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-[12px] desktop:items-end">
                  <p className="text-p2">Vertical</p>
                  <div className="flex items-center gap-[8px] desktop:justify-end">
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
              </div>
            </div>
          ))}
        </div>
      </SectionContent>
    </Section>
  );
}
