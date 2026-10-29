"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function DealAvatar({
  companyName,
  logoUrl,
  size = "default",
  className,
}: {
  companyName: string;
  logoUrl: string | null;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  return (
    <Avatar size={size} className={cn("rounded-sm", className)}>
      {logoUrl ? <AvatarImage alt="" src={logoUrl} className="bg-white object-contain" /> : null}
      <AvatarFallback className="rounded-sm bg-orange font-medium text-[#FAF6EC]">
        {companyName.slice(0, 1).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
