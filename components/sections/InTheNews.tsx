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
    publication: "Yahoo Finance",
    headline: "Fanfix Surpasses $300 Million Paid Out to Creators",
    company: "FanFix",
    url: "https://finance.yahoo.com/small-business/articles/fanfix-surpasses-300-million-paid-130600213.html",
  },
  {
    publication: "Yahoo Finance",
    headline: "GCash launches new service for dollar transfers to Filipino users",
    company: "Meridian",
    url: "https://finance.yahoo.com/news/gcash-launches-dollar-transfers-filipino-094348264.html",
  },
  {
    publication: "Forbes",
    headline: "Need Servicing for your luxury watch? WatchCheck repairs more than 200 brands.",
    company: "Collectible",
    url: "https://www.forbes.com/sites/robertanaas/2024/11/19/need-servicing-for-your-fine-watch-meet-the-watchcheckcom-platform/",
  },
  {
    publication: "The Verge",
    headline: "A toothbrush with AI, a camera, and a subscription.",
    company: "Feno Labs",
    url: "https://www.theverge.com/gadgets/609541/feno-ai-toothbrush",
  },
  {
    publication: "Yahoo Finance",
    headline: "Sunny Collaborates with Visa to Enhance and Expand Health Benefits Payments",
    company: "Sunny Benefits",
    url: "https://finance.yahoo.com/news/sunny-collaborates-visa-enhance-expand-131700588.html",
  },
  {
    publication: "Science",
    headline: "Toward universal steering and monitoring of AI models",
    company: "OuterProduct",
    url: "https://www.science.org/eprint/7VNDJKEZGK3PAKTBJZK9/full?activationRedirect=/doi/full/10.1126/science.aea6792",
  },
  {
    publication: "Coverager",
    headline: "Eat Cake rebrands to Milly Books",
    company: "Milly Books",
    url: "https://coverager.com/eat-cake-rebrands-to-milly-books/",
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
