"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SectionId } from "./SectionContext";
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

const CHROME_EASE = [0.2, 0.8, 0.2, 1] as const;
const SCROLL_DELTA = 12;
const WORDMARK = { width: 123.081, height: 19.0445, src: "/bloom-wordmark.svg" };
const MARK = { width: 25.8644 * 1.2, height: 25.8646 * 1.2, src: "/bloom-mark.svg" };
const COMPACT_QUERY = "(max-width: 599px)";

function logoMask(color: string, asset: { width: number; height: number; src: string }) {
  return {
    display: "block",
    width: asset.width,
    height: asset.height,
    backgroundColor: color,
    transition: "background-color 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
    WebkitMaskImage: `url(${asset.src})`,
    maskImage: `url(${asset.src})`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "left top",
    maskPosition: "left top",
    WebkitMaskSize: `${asset.width}px ${asset.height}px`,
    maskSize: `${asset.width}px ${asset.height}px`,
  } as const;
}

function readScrollY(event?: Event): number {
  if (event instanceof CustomEvent && typeof event.detail?.scroll === "number") {
    return event.detail.scroll;
  }
  return window.scrollY;
}

function surfaceUnderNav(): "light" | "dark" {
  const x = window.innerWidth / 2;
  const stack = document.elementsFromPoint(x, 32);
  for (let i = 0; i < stack.length; i++) {
    const node = stack[i];
    if (!(node instanceof HTMLElement)) continue;
    const themed = node.closest<HTMLElement>("[data-nav-theme]");
    if (!themed) continue;
    return themed.dataset.navTheme === "light" ? "light" : "dark";
  }
  return "dark";
}

function formatClock(date: Date, timeZone?: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${value("timeZoneName")} ${value("hour")}:${value("minute")} ${value("dayPeriod").toUpperCase()}`;
}

function viewerClock(date: Date): string {
  try {
    const local = formatClock(date);
    if (local.trim()) return local;
  } catch {
    // The browser has no local zone.
  }
  return formatClock(date, "America/New_York");
}

export function TopNav() {
  const lenis = useLenis();
  const reduce = useReducedMotion();
  const [clock, setClock] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);
  const [onLight, setOnLight] = useState(false);
  const [compact, setCompact] = useState(false);
  const [logoMotion, setLogoMotion] = useState(false);
  const lastY = useRef(0);
  const latestY = useRef(0);
  const accumulated = useRef(0);
  const headerRef = useRef<HTMLElement>(null);

  const labelColor = onLight ? "#070F18" : "#FAF6EC";
  const markColor = onLight ? "#FA4C1F" : "#FAF6EC";

  useEffect(() => {
    const el = headerRef.current;
    if (el) el.inert = !visible;
  }, [visible]);

  useLayoutEffect(() => {
    const query = window.matchMedia(COMPACT_QUERY);
    const apply = () => setCompact(query.matches);
    apply();
    const frame = window.requestAnimationFrame(() => setLogoMotion(true));
    query.addEventListener("change", apply);
    return () => {
      window.cancelAnimationFrame(frame);
      query.removeEventListener("change", apply);
    };
  }, []);

  useEffect(() => {
    const tick = () => setClock(viewerClock(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let frame = 0;

    const update = (event?: Event) => {
      latestY.current = readScrollY(event);
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const y = latestY.current;
        const delta = y - lastY.current;
        lastY.current = y;

        const surface = surfaceUnderNav();
        setOnLight((prev) => (prev === (surface === "light") ? prev : surface === "light"));

        if (y < SCROLL_DELTA) {
          accumulated.current = 0;
          setVisible(true);
          return;
        }

        accumulated.current += delta;
        if (accumulated.current > SCROLL_DELTA) {
          accumulated.current = 0;
          setVisible(false);
        } else if (accumulated.current < -SCROLL_DELTA) {
          accumulated.current = 0;
          setVisible(true);
        }
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("lenis-scroll", update);
    window.addEventListener("resize", update);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("lenis-scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const labelStyle = {
    fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
    color: labelColor,
    transition: "color 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
  };

  const go = (id: SectionId) => {
    lenis?.scrollTo(`#${id}`, { duration: scrollDuration(id) });
  };

  const chrome = reduce || !logoMotion ? { duration: 0 } : { duration: 0.2, ease: CHROME_EASE };
  const logo = compact ? MARK : WORDMARK;

  return (
    <motion.header
      ref={headerRef}
      animate={{ y: visible ? "0%" : "-100%" }}
      transition={reduce ? { duration: 0 } : { duration: 0.2, ease: CHROME_EASE }}
      aria-hidden={!visible}
      style={{ willChange: "transform" }}
      className={`fixed inset-x-0 top-0 z-[100] flex items-start justify-between gap-[16px] p-[16px] mobile:p-[24px] desktop:p-[48px] ${
        visible ? "pointer-events-none [&_button]:pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <motion.button
        type="button"
        layout
        onClick={() => lenis?.scrollTo(0)}
        transition={chrome}
        className="shrink-0 cursor-pointer"
        aria-label="Bloom"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={logo.src}
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={chrome}
            style={logoMask(markColor, logo)}
          />
        </AnimatePresence>
      </motion.button>

      <motion.nav
        layout
        transition={chrome}
        aria-label="Primary"
        className="flex flex-col items-end gap-[16px] min-[700px]:flex-row min-[700px]:items-start min-[700px]:gap-[32px] desktop:gap-[80px]"
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
      </motion.nav>
    </motion.header>
  );
}
