"use client";

import Image from "next/image";
import { Section } from "../Section";

const BASE = "/Press%20Images/";

export type Article = {
  publication: string;
  headline: string;
  image?: string;
  company: string;
  url: string;
};

export const ARTICLES: Article[] = [
  {
    publication: "Forbes",
    headline: "Golf Course Service Provider Launches Pro Shops Into Omnichannel Orbit",
    company: "TeeCommerce",
    url: "https://www.forbes.com/sites/mikedojc/2023/09/19/golf-course-service-provider-launches-pro-shops-into-omnichannel-orbit/",
  },
  {
    publication: "Forbes",
    headline: "This Under 30 Raised $18 Million To Make Sleeping Cool—Literally",
    image: `${BASE}Orion_Article.png`,
    company: "Orion",
    url: "https://www.forbes.com/sites/alexyork/2025/11/14/this-under-30-raised-18-million-to-make-sleeping-cool-literally/",
  },
  {
    publication: "Forbes",
    headline: "Inside The $100 Million Membership Platform For Gen Z Creators",
    image: `${BASE}FanFix_Article.png`,
    company: "FanFix",
    url: "https://www.forbes.com/sites/ianshepherd/2024/08/19/inside-the-100-million-membership-platform-for-gen-z-creators/",
  },
  {
    publication: "Yahoo Finance",
    headline: "GCash launches new service for dollar transfers to Filipino users",
    company: "Meridian",
    url: "https://finance.yahoo.com/news/gcash-launches-dollar-transfers-filipino-094348264.html",
  },
  {
    publication: "The New York Times",
    headline: "Does Your Watch Need Care? This Website Wants to Help.",
    image: `${BASE}WatchCheck_Article.png`,
    company: "WatchCheck",
    url: "https://www.nytimes.com/2024/11/07/fashion/watchcheck-repair-and-service-app.html",
  },
];

export function InTheNews() {
  return (
    <Section
      id="in-the-news"
      theme="light"
      className="relative z-10 bg-chalk text-black pt-[200px] pb-[96px]"
    >
      <div className="flex flex-col gap-[96px] pl-[76px] mobile:pl-[200px] desktop:pl-[248px] xl:pl-[320px] pr-[76px] mobile:pr-[200px] desktop:pr-[248px] xl:pr-[320px]">
        <h2 className="font-display text-h2 leading-none tracking-[-1.6px] max-w-[800px]">
          Our portfolio companies are making waves
        </h2>

        <div className="flex flex-col">
          {ARTICLES.map((article, i) => (
            <div
              key={i}
              className={`flex flex-col desktop:flex-row desktop:items-center gap-[48px] desktop:gap-[48px] border-b border-beige ${i === 0 ? "pb-[48px]" : "py-[48px]"}`}
            >
              {article.image && (
                <div className="w-full desktop:w-[336px] shrink-0 aspect-[14/9] bg-beige relative overflow-hidden">
                  <Image src={article.image} alt={article.publication} fill className="object-cover" unoptimized />
                </div>
              )}
              <div className="flex flex-col gap-[32px] flex-1 min-w-0">
                <p className="text-l2 font-medium uppercase">{article.publication}</p>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display text-h4 leading-tight tracking-[-0.64px] underline-offset-4 decoration-[1.5px] hover:underline"
                >
                  {article.headline}
                </a>
                <div className="bg-[rgba(196,195,182,0.5)] self-start flex items-center px-[12px] py-[6px] rounded-full">
                  <p className="text-[12px] font-medium leading-[1.35] uppercase">{article.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
