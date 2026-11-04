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

export function CustomerLetter({ token, deal }: { token: string; deal: LetterDeal }) {
  const router = useRouter();
  const [term, setTerm] = useState<ClientTerm | null>(deal.selectedTerm);
  const [error, setError] = useState<string | null>(null);
  const termRef = useRef(term);
  const requestRef = useRef(0);

  async function onSelect(next: ClientTerm) {
    const request = ++requestRef.current;
    const previous = termRef.current;
    termRef.current = next;
    setTerm(next);
    setError(null);

    try {
      const response = await fetch(`/operate/d/${token}/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: next }),
      });
      // A slower response for a choice the customer has left is ignored.
      if (requestRef.current !== request || termRef.current !== next) return;
      if (!response.ok) throw new Error("select failed");
      router.refresh();
    } catch {
      if (requestRef.current !== request || termRef.current !== next) return;
      termRef.current = previous;
      setTerm(previous);
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
      <DealLetter deal={{ ...deal, selectedTerm: term }} mode="customer" onSelect={onSelect} />
    </>
  );
}
