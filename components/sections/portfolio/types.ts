export type PortfolioCompany = {
  name: string;
  stage: string;
  tags: string[];
  description: string;
  imageSmall: string;
  imageLarge: string;
  hidden?: boolean;
  /** Use centered framing when logo crop would offset the subject (e.g. Feno). */
  imageFit?: "default" | "centered";
};

export const STAGE_STYLES: Record<string, { bg: string; text: string }> = {
  Growth: { bg: "bg-lime", text: "text-black" },
  "Series A": { bg: "bg-ink", text: "text-chalk" },
};

export const DEFAULT_STAGE_STYLE = { bg: "bg-orange", text: "text-black" };

// Sticky image geometry — zone drives scroll-sync anchor at vertical center
export const STICKY_IMAGE_TOP = 96;
export const STICKY_IMAGE_HEIGHT = 520;
export const STICKY_IMAGE_WIDTH = 448;
export const STICKY_IMAGE_ZONE = {
  top: STICKY_IMAGE_TOP,
  bottom: STICKY_IMAGE_TOP + STICKY_IMAGE_HEIGHT,
} as const;

export const SPOTLIGHT_INACTIVE_OPACITY_DESKTOP = 0.4;
export const SPOTLIGHT_INACTIVE_OPACITY_MOBILE = 0.65;

export const PORTFOLIO_IMAGE_EASE = [0.22, 1, 0.36, 1] as const;
