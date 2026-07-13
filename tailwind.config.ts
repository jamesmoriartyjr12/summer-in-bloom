import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        mobile: "600px",
        desktop: "1100px",
      },
      colors: {
        chalk: {
          DEFAULT: "#EBEBEB",
          25: "rgba(235, 235, 235, 0.25)",
        },
        taupe: "#777169",
        beige: "#C4C3B6",
        orange: "#FA4C1F",
        lime: "#D8FF34",
      },
      fontFamily: {
        // Display serif — BIZ UDPMincho (loaded via next/font)
        display: ["var(--font-display)", "serif"],
        // Body sans — Helvetica Neue with sensible fallbacks
        sans: [
          '"Helvetica Neue"',
          "Helvetica",
          "Arial",
          "system-ui",
          "sans-serif",
        ],
      },
      fontSize: {
        // Pulled directly from the Figma type styles
        h1: ["200px", { lineHeight: "0.95", letterSpacing: "-4px" }],
        h2: ["80px", { lineHeight: "1", letterSpacing: "-1.6px" }],
        h3: ["64px", { lineHeight: "1", letterSpacing: "-1.28px" }],
        h4: ["32px", { lineHeight: "1", letterSpacing: "-0.64px" }],
        h5: ["24px", { lineHeight: "1", letterSpacing: "-0.48px" }],
        l1: ["20px", { lineHeight: "1.2" }],
        l2: ["14px", { lineHeight: "1.35" }],
        p1: ["16px", { lineHeight: "1.5" }],
        p2: ["14px", { lineHeight: "1.35" }],
      },
    },
  },
  plugins: [],
};

export default config;
