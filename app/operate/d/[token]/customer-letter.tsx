"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DealLetter } from "@/components/operate/DealLetter";
import type { ClientTerm, LetterDeal } from "@/lib/operate/pricing";

const errorStyle = {
  margin: 0,
  padding: "20px 24px 0",
  color: "#070F18",
  fontFamily: "var(--font-archivo), sans-serif",
  fontSize: 16,
  lineHeight: 1.4,
  textAlign: "center",
} as const;

type Choice = { packageId: string | null; term: ClientTerm | null };

export function CustomerLetter({ token, deal }: { token: string; deal: LetterDeal }) {
  const router = useRouter();
  const [choice, setChoice] = useState<Choice>({ packageId: deal.selectedPackageId, term: deal.selectedTerm });
  const [error, setError] = useState<string | null>(null);
  const choiceRef = useRef(choice);
  const requestRef = useRef(0);

  async function onSelect(packageId: string, term: ClientTerm) {
    const request = ++requestRef.current;
    const previous = choiceRef.current;
    const next = { packageId, term };
    choiceRef.current = next;
    setChoice(next);
    setError(null);

    try {
      const response = await fetch(`/operate/d/${token}/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      // A slower response for a package the customer has left is ignored.
      if (requestRef.current !== request || choiceRef.current !== next) return;
      if (!response.ok) throw new Error("select failed");
      router.refresh();
    } catch {
      if (requestRef.current !== request || choiceRef.current !== next) return;
      choiceRef.current = previous;
      setChoice(previous);
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
        deal={{ ...deal, selectedPackageId: choice.packageId, selectedTerm: choice.term }}
        mode="customer"
        onSelect={onSelect}
      />
    </>
  );
}
