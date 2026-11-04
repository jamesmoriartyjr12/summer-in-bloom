export type OperateService = {
  name: string;
  description: string;
};

// Services staff can add to a deal letter, with descriptions approved by James. The first two come from the Bloom Contracts file.
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
  {
    name: "Embedded Design Engineering",
    description:
      "Deliver design engineering weekly, building production-ready interfaces and components from the design system. Each week ships new code, reviewed and refined alongside your team.",
  },
];
