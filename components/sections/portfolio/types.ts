export type PortfolioCompany = {
  name: string;
  stage: string;
  tags: string[];
  description: string;
  imageSmall: string;
  imageLarge: string;
  hidden?: boolean;
};

export const STAGE_STYLES: Record<string, { bg: string; text: string }> = {
  Growth: { bg: "bg-lime", text: "text-black" },
  "Series A": { bg: "bg-ink", text: "text-chalk" },
};

export const DEFAULT_STAGE_STYLE = { bg: "bg-orange", text: "text-black" };

// Bottom edge of the sticky image = sticky top (96) + image height (400)
export const TRIGGER_Y = 496;

export const SPOTLIGHT_INACTIVE_OPACITY_DESKTOP = 0.4;
export const SPOTLIGHT_INACTIVE_OPACITY_MOBILE = 0.65;

export const PORTFOLIO_IMAGE_EASE = [0.22, 1, 0.36, 1] as const;
