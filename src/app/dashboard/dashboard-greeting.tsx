"use client";

import { useEffect, useState } from "react";

export function partOfDay(hour: number): string {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 22) return "Good evening";
  return "Good night";
}

/** Day-part greeting resolved on the client to avoid hydration mismatch. */
export function DashboardGreeting({ name }: { name: string }) {
  const [part, setPart] = useState("Good evening");

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setPart(partOfDay(new Date().getHours()));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const firstName = name.split(/\s+/).filter(Boolean)[0] ?? "Explorer";

  return (
    <h1 className="dash-title">
      {part}, <span className="dash-title-name">{firstName}</span>
    </h1>
  );
}
