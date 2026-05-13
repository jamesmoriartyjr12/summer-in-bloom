import type { Metadata } from "next";
import { BIZ_UDPMincho } from "next/font/google";
import "./globals.css";

// BIZ UDPMincho is the display serif from the Figma design.
// next/font fetches it at build time and self-hosts it — no runtime CSS request.
const bizUDPMincho = BIZ_UDPMincho({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const metadata: Metadata = {
  title: "Summer in Bloom — Bloom Ventures",
  description:
    "A venture-style partner led by proven operators. Bloom Ventures, July 2026.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={bizUDPMincho.variable}>
      <body>{children}</body>
    </html>
  );
}
