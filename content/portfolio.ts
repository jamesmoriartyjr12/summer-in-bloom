import type { PortfolioCompany } from "@/components/sections/portfolio/types";

const BASE = "/Bloom%20Portfolio%20Images/";
const IMAGE_VERSION = "v=3";
const img = (file: string, version = IMAGE_VERSION) => `${BASE}${file}?${version}`;

export type { PortfolioCompany };

export const PORTFOLIO: PortfolioCompany[] = [
  {
    name: "Jamie Ai",
    stage: "Seed",
    tags: ["AI"],
    description: "Audience data, turned into content worth making.",
    imageSmall: img("Jamie_Small.png"),
    imageLarge: img("Jamie_Large.png"),
  },
  {
    name: "Meridian",
    stage: "Seed",
    tags: ["Payments", "B2B"],
    description: "Instant payments for banks, wallets, and neobanks.",
    imageSmall: img("Meridian_Small.png"),
    imageLarge: img("Meridian_Large.png"),
  },
  {
    name: "Collectible",
    stage: "Seed",
    tags: ["Consumer", "Luxury"],
    description: "The service layer for luxury watches.",
    imageSmall: img("WatchCheck_Small.png"),
    imageLarge: img("WatchCheck_Large.png"),
  },
  {
    name: "Sunny Benefits",
    stage: "Seed",
    tags: ["Consumer", "Health Tech"],
    description: "Every health benefit, in one member experience.",
    imageSmall: img("Sunny_Small.png"),
    imageLarge: img("Sunny_Large.png"),
  },
  {
    name: "Feno Labs",
    stage: "Seed",
    tags: ["Health Tech"],
    description: "Preventative dental care, powered by AI.",
    imageSmall: img("Feno_Small.png", "v=4"),
    imageLarge: img("Feno_Large.png", "v=4"),
    imageFit: "centered",
  },
  {
    name: "OuterProduct",
    stage: "Seed",
    tags: ["B2B", "AI"],
    description: "Any dataset, turned into a decision.",
    imageSmall: img("OuterProduct_Small.png", "v=6"),
    imageLarge: img("OuterProduct_Large.png", "v=6"),
  },
  {
    name: "TeeCommerce",
    stage: "Seed",
    tags: ["B2B", "Ecommerce"],
    description: "Pro shops for the clubs that set the standard.",
    imageSmall: img("TeeCommerce_Small.png"),
    imageLarge: img("TeeCommerce_Large.png"),
  },
  {
    name: "Milly Books",
    stage: "Seed",
    tags: ["Marketplace"],
    description: "Where insurance agencies change hands.",
    imageSmall: img("Milly_Small.png"),
    imageLarge: img("Milly_Large.png"),
  },
  {
    name: "Orion",
    stage: "Series A",
    tags: ["Consumer", "Health"],
    description: "An AI sleep system for deeper nights.",
    imageSmall: img("Orion_Small.png"),
    imageLarge: img("Orion_Large.png"),
  },
  {
    name: "FanFix",
    stage: "Growth",
    tags: ["Consumer", "Creator"],
    description: "Creators get paid for exclusive access.",
    imageSmall: img("FanFix_Small.png"),
    imageLarge: img("FanFix_Large.png"),
  },
];
