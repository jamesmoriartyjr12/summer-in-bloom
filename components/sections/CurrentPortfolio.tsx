"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Section } from "../Section";
import { SectionContent } from "../SectionContent";
import { PORTFOLIO } from "@/content/portfolio";
import { ARTICLES } from "@/content/news";

const STAGE_STYLES: Record<string, { bg: string; text: string }> = {
  Growth: { bg: "bg-lime", text: "text-black" },
  "Series A": { bg: "bg-ink", text: "text-chalk" },
};
const DEFAULT_STAGE_STYLE = { bg: "bg-orange", text: "text-black" };

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
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
      <SectionContent left={<StickyImage activeIndex={hoveredIndex ?? activeIndex} />}>
        <div className="flex flex-col gap-[80px] desktop:gap-[64px]">
          {VISIBLE_PORTFOLIO.map((company, i) => (
            <div
              key={company.name}
              ref={(el) => { companyRefs.current[i] = el; }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="flex flex-col"
            >
              <div className="desktop:hidden aspect-[4/3] w-full overflow-hidden bg-beige relative mb-[48px]">
                <Image src={company.imageLarge} alt={company.name} fill className="object-cover" unoptimized />
                <div className="absolute top-[24px] left-[24px] backdrop-blur-[7.5px] bg-[rgba(235,235,235,0.1)] flex items-center px-[12px] py-[6px] rounded-full">
                  <p className="text-[12px] font-medium leading-[1.35] uppercase text-[#ebebeb] whitespace-nowrap">Markup</p>
                </div>
              </div>
              <div className="desktop:pt-[32px] pt-0">
                <h3 className="font-display text-h3 leading-none tracking-[-1.28px] text-balance">
                  {company.name}
                </h3>
              </div>
              <div className="flex items-center flex-wrap gap-[8px] pt-[16px] pb-[20px]">
                <div className={`${STAGE_STYLES[company.stage]?.bg ?? DEFAULT_STAGE_STYLE.bg} ${STAGE_STYLES[company.stage]?.text ?? DEFAULT_STAGE_STYLE.text} inline-flex items-center px-[12px] py-[6px] rounded-full w-fit shrink-0`}>
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
              {(() => {
                const article = ARTICLES.find((a) => a.company === company.name);
                if (!article) {
                  return (
                    <div className="pb-[28px] border-b border-beige">
                      <p className="font-display text-h5 leading-tight tracking-[-0.48px] text-balance">{company.description}</p>
                    </div>
                  );
                }
                return (
                  <div className="flex flex-col desktop:flex-row desktop:items-end gap-[16px] desktop:gap-[24px] pb-[28px] border-b border-beige">
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
                      <span className="text-[12px] font-medium leading-[1.35] uppercase text-black group-hover:text-chalk transition-colors motion-reduce:transition-none">{article.publication}</span>
                      <span className="w-0 ml-0 group-hover:w-[10px] group-hover:ml-[8px] overflow-hidden transition-[width,margin-left] duration-200 motion-reduce:transition-none flex items-center justify-end shrink-0">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="text-black group-hover:text-chalk transition-colors motion-reduce:transition-none shrink-0">
                          <path d="M2.5 7.5L7.5 2.5M7.5 2.5H3.5M7.5 2.5V6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
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
