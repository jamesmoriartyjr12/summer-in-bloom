import * as React from "react";
import { cn } from "@/lib/utils";

function Badge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("operate-label inline-flex items-center border border-border px-2 py-1", className)} {...props} />;
}

export { Badge };
