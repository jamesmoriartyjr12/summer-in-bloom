import { ReactNode } from "react";

// Universal content wrapper for non-hero sections.
//
// Layout rules:
//   - Left inset reserves side-nav space (200px at mobile+, 248/320 at desktop/xl)
//   - Right inset is a fixed 24px viewport gutter
//   - Optional left column (336px default) hidden below 1100px
//   - Optional maxWidth caps the inner content row on large screens
//
// Pass `left` to populate the left column and reserve its space.

type SectionContentProps = {
  left?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Width of the optional left column in px (default 336). */
  leftColumnWidth?: number;
  /** Optional max width in px for the inner content row on large screens. */
  maxWidth?: number;
};

export function SectionContent({
  left,
  children,
  className,
  leftColumnWidth = 336,
  maxWidth,
}: SectionContentProps) {
  return (
    <div
      className={`pl-[76px] mobile:pl-[200px] desktop:pl-[248px] xl:pl-[320px] pr-[24px] ${className ?? ""}`}
    >
      <div
        className="flex w-full gap-[48px] items-start"
        style={maxWidth ? { maxWidth } : undefined}
      >
        {left && (
          <div
            className="shrink-0 self-stretch max-[1099px]:hidden"
            style={{ width: leftColumnWidth }}
          >
            {left}
          </div>
        )}

        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
