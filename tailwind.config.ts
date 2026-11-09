import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

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
        ink: "#070F18",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
  plugins: [tailwindcssAnimate],
};

export default config;
