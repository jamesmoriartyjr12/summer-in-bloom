import { ReactNode } from "react";

// Universal content wrapper for non-hero sections.
//
// Layout rules:
//   - 200px reserved on the left for the side nav
//   - 48px gap between nav and the left column (desktop only)
//   - Left column: 336px fixed, hidden below 900px
//   - Right column: flex-1, expands to fill remaining width
//   - Right inset mirrors the left inset at every breakpoint, so content
//     sits on a symmetric grid
//
// Pass `left` to populate the left column and reserve its space.

type SectionContentProps = {
  left?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function SectionContent({
  left,
  children,
  className,
}: SectionContentProps) {
  return (
    <div
      className={`flex gap-[48px] items-start pl-[76px] mobile:pl-[200px] desktop:pl-[248px] xl:pl-[320px] pr-[76px] mobile:pr-[200px] desktop:pr-[248px] xl:pr-[320px] ${className ?? ""}`}
    >
      {left && (
        <div className="w-[336px] shrink-0 self-stretch max-[1099px]:hidden">
          {left}
        </div>
      )}

      {/* Right column — fills remaining width */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
