"use client";

import { useEffect, useState } from "react";
import { SectionId, useSection } from "./SectionContext";
import { useLenis } from "./LenisContext";

type NavLink = {
  id: SectionId;
  label: string;
};

const LINKS: NavLink[] = [
  { id: "the-studio", label: "Studio" },
  { id: "current-portfolio", label: "Companies" },
  { id: "fund-details-2", label: "Fund One" },
];

function scrollDuration(id: SectionId): number {
  const el = document.getElementById(id);
  const distance = el ? Math.abs(el.getBoundingClientRect().top) : 0;
  return Math.min(0.6 + distance / 2500, 1.4);
}

function formatBerlinClock(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${value("timeZoneName")} ${value("hour")}:${value("minute")} ${value("dayPeriod").toUpperCase()}`;
}

export function TopNav() {
  const { theme } = useSection();
  const lenis = useLenis();
  const [clock, setClock] = useState<string | null>(null);
  const isDark = theme === "dark";
  const labelColor = isDark ? "#FAF6EC" : "#070F18";
  const markColor = isDark ? "#FAF6EC" : "#FA4C1F";

  useEffect(() => {
    const tick = () => setClock(formatBerlinClock(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const labelStyle = {
    fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
    color: labelColor,
    transition: "color 0.3s ease",
  };

  const go = (id: SectionId) => {
    lenis?.scrollTo(`#${id}`, { duration: scrollDuration(id) });
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex items-start justify-between gap-[16px] p-[16px] mobile:p-[24px] desktop:p-[48px]">
      <button
        type="button"
        onClick={() => lenis?.scrollTo(0)}
        className="pointer-events-auto shrink-0 cursor-pointer"
        aria-label="Bloom"
      >
        <span
          aria-hidden
          style={{
            display: "block",
            width: 123.081,
            height: 19.0445,
            backgroundColor: markColor,
            transition: "background-color 0.3s ease",
            WebkitMaskImage: "url(/bloom-wordmark.svg)",
            maskImage: "url(/bloom-wordmark.svg)",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskSize: "123.081px 19.0445px",
            maskSize: "123.081px 19.0445px",
          }}
        />
      </button>

      <nav
        aria-label="Primary"
        className="pointer-events-auto flex flex-col items-end gap-[16px] min-[700px]:flex-row min-[700px]:items-start min-[700px]:gap-[32px] desktop:gap-[80px]"
      >
        <div className="flex flex-col items-end gap-[16px] min-[700px]:items-start">
          {LINKS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.id)}
              className="cursor-pointer whitespace-nowrap text-right text-[16px] font-medium uppercase leading-none underline decoration-solid underline-offset-[0.12em] min-[700px]:text-left"
              style={labelStyle}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p
          className="min-w-[13ch] whitespace-nowrap text-right text-[16px] font-medium uppercase leading-none min-[700px]:text-left"
          style={labelStyle}
        >
          {clock ?? "\u00a0"}
        </p>
        <button
          type="button"
          onClick={() => go("contact")}
          className="cursor-pointer whitespace-nowrap text-[16px] font-medium uppercase leading-none underline decoration-solid underline-offset-[0.12em]"
          style={labelStyle}
        >
          Contact
        </button>
      </nav>
    </header>
  );
}
