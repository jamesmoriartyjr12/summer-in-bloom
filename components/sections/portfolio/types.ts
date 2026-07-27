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

// Full-bleed desktop panels: sticky top + viewport-height steps
export const PANEL_STICKY_TOP = 96;
export const PANEL_MIN_HEIGHT = "calc(100vh - 96px)";
// Activate company when its panel crosses this viewport line
export const TRIGGER_Y = 120;

export const SPOTLIGHT_INACTIVE_OPACITY_DESKTOP = 0.4;
export const SPOTLIGHT_INACTIVE_OPACITY_MOBILE = 0.65;

export const PORTFOLIO_IMAGE_EASE = [0.22, 1, 0.36, 1] as const;

// Shared horizontal padding (mirrors SectionContent)
export const PORTFOLIO_CONTENT_INSET =
  "pl-[76px] mobile:pl-[200px] desktop:pl-[248px] xl:pl-[320px] pr-[76px] mobile:pr-[200px] desktop:pr-[248px] xl:pr-[320px]";
