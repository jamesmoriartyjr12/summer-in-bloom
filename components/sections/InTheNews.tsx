"use client";

import Image from "next/image";
import { Section } from "../Section";
import { ARTICLES } from "@/content/news";

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
