"use client";

import Image from "next/image";
import { Section } from "../Section";

const BASE = "/Press%20Images/";

type Article = {
  publication: string;
  headline: string;
  image: string;
};

const ARTICLES: Article[] = [
  {
    publication: "Publication",
    headline: "Lorem ipsum dolor sit amet consectetur. Diam eleifend integer donec sed porttitor volutpat.",
    image: `${BASE}Orion_Article.png`,
  },
  {
    publication: "Publication",
    headline: "Lorem ipsum dolor sit amet consectetur. Diam eleifend integer donec sed porttitor volutpat.",
    image: `${BASE}FanFix_Article.png`,
  },
  {
    publication: "Publication",
    headline: "Lorem ipsum dolor sit amet consectetur. Diam eleifend integer donec sed porttitor volutpat.",
    image: `${BASE}Meridian_Article.png`,
  },
  {
    publication: "Publication",
    headline: "Lorem ipsum dolor sit amet consectetur. Diam eleifend integer donec sed porttitor volutpat.",
    image: `${BASE}WatchCheck_Article.png`,
  },
];

export function InTheNews() {
  return (
    <Section
      id="in-the-news"
      theme="light"
      className="relative z-10 bg-chalk text-black pt-[200px] pb-[96px]"
    >
      <div className="flex flex-col gap-[96px] pl-[76px] mobile:pl-[200px] desktop:pl-[248px] xl:pl-[320px] pr-[24px] mobile:pr-[48px]">
        <h2 className="font-display text-h2 leading-none tracking-[-1.6px] max-w-[800px]">
          Our portfolio companies are making waves
        </h2>

        <div className="flex flex-col">
          {ARTICLES.map((article, i) => (
            <div
              key={i}
              className={`flex flex-col mobile:flex-row mobile:items-start desktop:items-center gap-[48px] mobile:gap-[24px] desktop:gap-[48px] border-b border-beige pr-[0] mobile:pr-[48px] ${i === 0 ? "pb-[48px]" : "py-[48px]"}`}
            >
              <div className="-mr-[24px] w-[calc(100%+24px)] mobile:mr-0 mobile:w-[200px] desktop:w-[336px] aspect-[14/9] shrink-0 bg-beige relative overflow-hidden">
                <Image src={article.image} alt={article.publication} fill className="object-cover" unoptimized />
              </div>
              <div className="flex flex-col gap-[32px] flex-1 min-w-0">
                <p className="text-l2 font-medium uppercase">{article.publication}</p>
                <p className="font-display text-h4 leading-none tracking-[-0.64px]">
                  {article.headline}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
