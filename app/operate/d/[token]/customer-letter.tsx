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

type Choice = { term: ClientTerm | null; equityCents: number };

export function CustomerLetter({ token, deal }: { token: string; deal: LetterDeal }) {
  const router = useRouter();
  const [choice, setChoice] = useState<Choice>({
    term: deal.selectedTerm,
    equityCents: deal.selectedEquityCents,
  });
  const [error, setError] = useState<string | null>(null);
  const choiceRef = useRef(choice);
  const requestRef = useRef(0);

  async function onSelect(term: ClientTerm, equityCents: number) {
    const request = ++requestRef.current;
    const previous = choiceRef.current;
    const next = { term, equityCents };
    choiceRef.current = next;
    setChoice(next);
    setError(null);

    try {
      const response = await fetch(`/operate/d/${token}/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      // A slower response for a choice the customer has left is ignored.
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
        deal={{
          ...deal,
          selectedTerm: choice.term,
          selectedEquityCents: choice.equityCents,
        }}
        mode="customer"
        onSelect={onSelect}
      />
    </>
  );
}
