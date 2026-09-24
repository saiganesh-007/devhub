"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { CompareCombobox } from "@/components/global-search";

/**
 * Compact compare entry with autocomplete: both sides must be real
 * picked repositories. Builds a real /compare URL and navigates there.
 * CompareExperience owns the actual comparison.
 */
export function CompareMiniForm() {
  const router = useRouter();
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  function keyOf(value: string): string {
    const clean = value.trim().toLowerCase();
    return clean ? `repo:${clean}` : "";
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const cleanA = a.trim();
    const cleanB = b.trim();
    if (!cleanA || !cleanB) return;
    if (cleanA.toLowerCase() === cleanB.toLowerCase()) return;
    const params = new URLSearchParams({ type: "repository" });
    params.set("a", cleanA);
    params.set("b", cleanB);
    router.push(`/compare?${params.toString()}`);
  }

  const duplicate =
    a.trim() !== "" && a.trim().toLowerCase() === b.trim().toLowerCase();
  const ready = a.trim() !== "" && b.trim() !== "" && !duplicate;

  return (
    <form className="dash-compare-form dash-compare-form--combo" onSubmit={onSubmit}>
      <CompareCombobox
        kind="repository"
        label="First repository"
        value={a}
        onTextChange={setA}
        onPick={(s) => {
          if (s.kind === "repository") setA(s.full_name);
        }}
        placeholder="Search repository (e.g. vercel/next.js)"
        excludeKey={keyOf(b) || undefined}
      />
      <CompareCombobox
        kind="repository"
        label="Second repository"
        value={b}
        onTextChange={setB}
        onPick={(s) => {
          if (s.kind === "repository") setB(s.full_name);
        }}
        placeholder="Search repository (e.g. supabase/supabase)"
        excludeKey={keyOf(a) || undefined}
      />
      <button type="submit" className="dash-compare-go" disabled={!ready}>
        Compare <ArrowRight size={13} aria-hidden="true" />
      </button>
    </form>
  );
}
