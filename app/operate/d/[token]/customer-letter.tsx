"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DealLetter } from "@/components/operate/DealLetter";
import type { LetterDeal } from "@/lib/operate/pricing";

const errorStyle = {
  margin: 0,
  padding: "20px 24px 0",
  color: "#070F18",
  fontFamily: "var(--font-archivo), sans-serif",
  fontSize: 16,
  lineHeight: 1.4,
  textAlign: "center",
} as const;

export function CustomerLetter({ token, deal }: { token: string; deal: LetterDeal }) {
  const router = useRouter();
  const [selectedPackageId, setSelectedPackageId] = useState(deal.selectedPackageId);
  const [error, setError] = useState<string | null>(null);
  const selectedRef = useRef(deal.selectedPackageId);
  const requestRef = useRef(0);

  async function onSelect(packageId: string) {
    const request = ++requestRef.current;
    const previous = selectedRef.current;
    selectedRef.current = packageId;
    setSelectedPackageId(packageId);
    setError(null);

    try {
      const response = await fetch(`/operate/d/${token}/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      // A slower response for a package the customer has left is ignored.
      if (requestRef.current !== request || selectedRef.current !== packageId) return;
      if (!response.ok) throw new Error("select failed");
      router.refresh();
    } catch {
      if (requestRef.current !== request || selectedRef.current !== packageId) return;
      selectedRef.current = previous;
      setSelectedPackageId(previous);
      setError("Could not save that choice.");
    }
  }

  return (
    <>
      {error ? (
        <p role="alert" style={errorStyle}>
          {error}
        </p>
      ) : null}
      <DealLetter
        deal={{ ...deal, selectedPackageId }}
        mode="customer"
        onSelect={onSelect}
      />
    </>
  );
}
