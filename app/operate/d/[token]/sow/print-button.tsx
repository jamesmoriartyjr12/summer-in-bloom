"use client";

import { Download } from "lucide-react";

export function PrintButton() {
  return (
    <button type="button" className="operate-sow__button operate-sow__button--primary" onClick={() => window.print()}>
      <Download className="size-4" aria-hidden="true" />
      Download PDF
    </button>
  );
}
