"use client";

import { useRouter } from "next/navigation";
import { DealLetter } from "@/components/operate/DealLetter";
import type { LetterDeal } from "@/lib/operate/pricing";

export function CustomerLetter({ token, deal }: { token: string; deal: LetterDeal }) {
  const router = useRouter();

  async function onSelect(packageId: string) {
    const response = await fetch(`/operate/d/${token}/select`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageId }),
    });
    if (response.ok) router.refresh();
  }

  return <DealLetter deal={deal} mode="customer" onSelect={onSelect} />;
}
