import { ReactNode } from "react";

// Universal content wrapper for non-hero sections.
//
// Layout rules:
//   - 200px reserved on the left for the side nav
//   - 48px gap between nav and the left column (desktop only)
//   - Left column: 336px fixed, hidden below 900px
//   - Right column: flex-1, expands to fill remaining width
//
// Pass `left` to populate the left column. Omit it and the column
// still renders as a spacer on desktop, keeping the right column
// aligned consistently across rows.

type SectionContentProps = {
  left?: ReactNode;
  children: ReactNode;
  className?: string;
  flushRight?: boolean; // remove right padding so content extends to the page edge
};

export function SectionContent({
  left,
  children,
  className,
  flushRight = false,
}: SectionContentProps) {
  return (
    <div
      className={`flex gap-[48px] items-start pl-[200px] desktop:pl-[248px] xl:pl-[320px] ${flushRight ? "" : "pr-[48px]"} ${className ?? ""}`}
    >
      {/* Left column — 336px on desktop, invisible spacer when empty */}
      <div className="w-[336px] shrink-0 self-stretch max-[899px]:hidden" aria-hidden={!left}>
        {left}
      </div>

      {/* Right column — fills remaining width */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
