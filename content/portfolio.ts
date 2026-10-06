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
    description: "Full-mouth smartbrush with a built-in oral scanner",
    imageSmall: img("Feno_Small.png", "v=4"),
    imageLarge: img("Feno_Large.png", "v=4"),
    imageFit: "centered",
  },
  {
    name: "OuterProduct",
    stage: "Seed",
    tags: ["B2B", "AI"],
    description: "AI analytics that turn any data into smarter decisions",
    imageSmall: img("OuterProduct_Small.png", "v=6"),
    imageLarge: img("OuterProduct_Large.png", "v=6"),
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
    description: "Marketplace to buy and sell insurance books of business",
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
