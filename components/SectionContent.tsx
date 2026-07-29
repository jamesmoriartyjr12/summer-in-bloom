import { ReactNode } from "react";
import { SECTION_INSET_X } from "@/lib/sectionLayout";

type SectionContentProps = {
  left?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Width of the optional left column in px (default 336). */
  leftColumnWidth?: number;
  /** Breakpoint at which the left column appears (default desktop / 1100px). */
  leftColumnFrom?: "desktop" | "xl";
};

const LEFT_COL_HIDDEN: Record<NonNullable<SectionContentProps["leftColumnFrom"]>, string> = {
  desktop: "max-[1099px]:hidden",
  xl: "max-[1279px]:hidden",
};

export function SectionContent({
  left,
  children,
  className,
  leftColumnWidth = 336,
  leftColumnFrom = "desktop",
}: SectionContentProps) {
  return (
    <div className={`flex gap-[48px] items-start ${SECTION_INSET_X} ${className ?? ""}`}>
      {left && (
        <div
          className={`shrink-0 self-stretch ${LEFT_COL_HIDDEN[leftColumnFrom]}`}
          style={{ width: leftColumnWidth }}
        >
          {left}
        </div>
      )}

      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
