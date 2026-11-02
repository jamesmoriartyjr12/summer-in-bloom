export type OperateService = {
  name: string;
  description: string;
};

// Services staff can add to a deal letter, with their descriptions from the Bloom Contracts file.
export const OPERATE_SERVICES: OperateService[] = [
  {
    name: "Product Strategy, Product Design",
    description:
      "Deliver product strategy and design weekly, aligning priorities, turning insights into roadmaps and refined UI. Each week brings new artifacts, validation, and iteration.",
  },
  {
    name: "Brand, Web, Creative Design",
    description:
      "Deliver brand and creative weekly, shaping the narrative and visual identity. Each week provides new explorations and refinements toward a cohesive, launch-ready brand.",
  },
];
