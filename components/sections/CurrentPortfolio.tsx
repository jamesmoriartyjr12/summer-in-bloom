"use client";

import { Section } from "../Section";
import { SectionContent } from "../SectionContent";

type CompanyMetric = {
  label: string;
  value: string;
};

type PortfolioCompany = {
  name: string;
  tags: string[];
  metrics: CompanyMetric[];
  description: string;
};

const PORTFOLIO: PortfolioCompany[] = [
  {
    name: "Orion",
    tags: ["Consumer", "Health"],
    metrics: [
      { label: "Stage", value: "Seed" },
      { label: "Investment", value: "$45,000" },
      { label: "Valuation at Investment", value: "$50M Pre-Seed" },
      { label: "Mark Ups", value: "17.2M Seed at 70M Valuation" },
    ],
    description:
      "Orion is a sleep wellness company that uses temperature control to optimize sleep quality. The Orion Sleep System's dual-zone mattress cover heats or cools based on biometric feedback, encouraging deeper sleep and fewer interruptions.",
  },
  {
    name: "FanFix",
    tags: ["Consumer", "Money"],
    metrics: [
      { label: "Stage", value: "Post-Acquisition Growth" },
      { label: "Investment", value: "$40,000 Post-Acquisition" },
      { label: "Valuation at Investment", value: "$150M Post" },
    ],
    description:
      "FanFix is a subscription platform driving the $100B+ creator economy, enabling Gen Z creators to monetize exclusive content. Now in a post-acquisition growth phase, FanFix reports 15M users and aims for $1B in creator payouts by 2027.",
  },
  {
    name: "WatchCheck",
    tags: ["Consumer"],
    metrics: [
      { label: "Advisory", value: "2.5%" },
      { label: "Investment", value: "$50k Pre-seed" },
      { label: "Pre-seed Valuation", value: "$10M Post" },
      { label: "Bridge Valuation", value: "$25M Post" },
      { label: "Seed Valuation", value: "$30M Post" },
    ],
    description:
      "WatchCheck provides the digital and physical infrastructure to power best-in-class servicing software for luxury timepieces. Aided by an exclusive partnership with Sotheby's, WatchCheck is on track to disrupt the most integral and archaic infrastructure in the world's roughly $50B pre-owned watch industry.",
  },
  {
    name: "Meridian",
    tags: ["Money"],
    metrics: [
      { label: "Ownership", value: "1.45%" },
      { label: "Investment", value: "$10k Pre-seed" },
      { label: "Pre-seed Valuation", value: "$20M" },
      { label: "Seed Valuation", value: "$70m" },
      { label: "Targeting Bridge to A", value: "$200M" },
    ],
    description:
      "Meridian is an instant payments network that provides novel payments infrastructure to major wallets, financial institutions, telecoms, and neo-banks around the world. Founded by serial entrepreneur Will Haering and Bradley Riss, the former Chief Commercial Officer of Checkout.com, the network powers instant payments access for 93m people across the United States, Philippines, and Mexico.",
  },
  {
    name: "Milly",
    tags: ["Marketplace"],
    metrics: [
      { label: "Ownership", value: "1.6%" },
      { label: "Investment", value: "$50k Pre-seed 5m" },
      { label: "Seed", value: "Raising at $8m" },
    ],
    description:
      "Milly is a transactional marketplace platform engineered to simplify the M&A process for independent insurance agencies. The platform handles the entire transaction journey, from listing and discovery to due diligence and closing.",
  },
  {
    name: "Jamie",
    tags: ["AI"],
    metrics: [
      { label: "Ownership", value: "2.75%" },
      { label: "Investment", value: "$25,000 at $2.5M Post, $10,000 at $6.6M Post" },
      { label: "Angel Round Valuation", value: "$6.6M Post" },
      { label: "Pre-seed Valuation", value: "$10M Post" },
    ],
    description:
      "Jamie is the solution to content-market fit for media teams. Jamie automates pre-production by turning audience data and internet trends into real-time insights, actionable content suggestions, and production materials.",
  },
  {
    name: "Sunny Benefits",
    tags: ["Health", "Money"],
    metrics: [
      { label: "Ownership", value: "0.15%" },
      { label: "Seed Valuation", value: "$36M Post" },
      { label: "Bridge to Series A", value: "$6M at $70M Cap" },
    ],
    description:
      "At the crossroads of consumer engagement and fintech, Sunny helps health plans and large employer groups deliver a streamlined experience to members and employees. The platform allows users to manage and maximize their benefits through a single, intuitive interface. The company's Series A is in progress, and currently oversubscribed.",
  },
  {
    name: "Feno Labs",
    tags: ["AI Healthcare", "Dental Tech"],
    metrics: [
      { label: "Ownership", value: "Convertible Note (20% Discount)" },
      { label: "Investment", value: "$96,720 Convertible Note" },
      { label: "Structure", value: "15% of annual services converted into equity" },
      { label: "Qualified Financing Trigger", value: "$5M+ round" },
    ],
    description:
      "Feno Labs is building an AI-powered oral health platform and connected ecosystem designed to improve preventative dental care, diagnostics, and patient engagement through hardware, software, and data-driven workflows.",
  },
];

function CompanyImagePlaceholder() {
  return (
    <div className="sticky top-[96px] h-[400px] overflow-hidden bg-beige relative">
      <div className="absolute bottom-[24px] left-[24px] bg-chalk rounded-[8px] w-[48px] h-[48px]" />
    </div>
  );
}

export function CurrentPortfolio() {
  return (
    <Section
      id="current-portfolio"
      theme="light"
      className="relative z-10 bg-chalk text-black pt-[200px] pb-[96px]"
    >
      <div className="flex flex-col gap-[400px]">
        {PORTFOLIO.map((company, i) => (
          <SectionContent key={company.name} flushRight left={<CompanyImagePlaceholder />}>
            <div className="flex flex-col">
              {i === 0 && (
                <p className="text-l2 font-medium uppercase">Current Portfolio</p>
              )}
              <div className="flex items-start justify-between pt-[48px] pb-[24px] pr-[48px]">
                <p className="font-display text-h4 leading-none tracking-[-0.64px]">
                  {company.name}
                </p>
                <div className="flex items-center gap-[8px] shrink-0">
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
              {company.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="flex flex-col gap-[12px] py-[24px] border-b border-beige"
                >
                  <p className="text-p2">{metric.label}</p>
                  <p className="font-display text-h5 leading-none tracking-[-0.48px]">
                    {metric.value}
                  </p>
                </div>
              ))}
              <p className="text-p1 pt-[24px] pr-[48px]">{company.description}</p>
            </div>
          </SectionContent>
        ))}
      </div>
    </Section>
  );
}
