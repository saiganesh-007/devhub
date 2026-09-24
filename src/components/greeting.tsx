"use client";

import { useEffect, useState } from "react";

function partOfDay(hour: number): string {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 22) return "Good evening";
  return "Good night";
}

/**
 * Technical workspace headline with client-side day-part resolution.
 */
export function ResearchGreeting({ name }: { name: string }) {
  const [part, setPart] = useState<string>("Good evening");

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setPart(partOfDay(new Date().getHours()));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const firstName = name.split(/\s+/).filter(Boolean)[0] ?? "Explorer";

  return (
    <h1 className="db-hero__title">
      {part}, {firstName}.
    </h1>
  );
}

/**
 * Legacy greeting component preserved for backwards compatibility.
 */
export function Greeting({
  name,
  saved,
  recent,
}: {
  name: string;
  saved: number;
  recent: number;
}) {
  const [part, setPart] = useState<string | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setPart(partOfDay(new Date().getHours()));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const firstName = name.split(/\s+/).filter(Boolean)[0] ?? "Explorer";

  return (
    <>
      <h1 className="db-intro__title">
        {part ?? "Welcome"}, {firstName}.
      </h1>
      <p className="db-intro__sub">
        {saved > 0 || recent > 0 ? (
          <>
            Your research workspace — {saved} saved signal
            {saved === 1 ? "" : "s"} · {recent} recent view
            {recent === 1 ? "" : "s"}.
          </>
        ) : (
          <>Start with a search — your research trail builds here.</>
        )}
      </p>
    </>
  );
}
