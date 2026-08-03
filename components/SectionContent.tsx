import { ReactNode } from "react";

// Universal content wrapper for non-hero sections.
//
// Layout rules:
//   - Left inset reserves side-nav space (200px at mobile+, 248/320 at desktop/xl)
//   - Right inset is a fixed 24px content gutter
//   - Optional left column (336px default) hidden below 1100px
//
// Pass `left` to populate the left column and reserve its space.

type SectionContentProps = {
  left?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Width of the optional left column in px (default 336). */
  leftColumnWidth?: number;
};

export function SectionContent({
  left,
  children,
  className,
  leftColumnWidth = 336,
}: SectionContentProps) {
  return (
    <div
      className={`flex gap-[48px] items-start pl-[76px] mobile:pl-[200px] desktop:pl-[248px] xl:pl-[320px] pr-[24px] ${className ?? ""}`}
    >
      {left && (
        <div
          className="shrink-0 self-stretch max-[1099px]:hidden"
          style={{ width: leftColumnWidth }}
        >
          {left}
        </div>
      )}

      {/* Right column — fills remaining width */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
