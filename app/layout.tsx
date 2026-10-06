import type { Metadata } from "next";
import { BIZ_UDPMincho } from "next/font/google";
import localFont from "next/font/local";
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

const manifold = localFont({
  src: "../fonts/manifold-extended/ManifoldExtendedCF-Heavy.otf",
  weight: "800",
  style: "normal",
  variable: "--font-manifold",
  display: "swap",
  fallback: ["Arial Black", "sans-serif"],
});

const archivo = localFont({
  src: [
    { path: "../fonts/archivo/Archivo-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/archivo/Archivo-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/archivo/Archivo-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/archivo/Archivo-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-archivo",
  display: "swap",
});

const jetbrains = localFont({
  src: [
    { path: "../fonts/jetbrains-mono/JetBrainsMono-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/jetbrains-mono/JetBrainsMono-Medium.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-jetbrains",
  display: "swap",
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
    <html lang="en" className={`${bizUDPMincho.variable} ${manifold.variable} ${archivo.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}
