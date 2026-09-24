"use client";

import { useEffect, useState } from "react";

function formatDateLine(now: Date): string {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(now);
}

function formatTimeLine(now: Date): string {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(now);
}

/**
 * Live local date + clock for the dashboard header.
 * Uses the browser's local timezone and ticks every second.
 */
export function DashboardClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!now) {
    return (
      <div className="dash-date" aria-live="off">
        <span className="dash-date-day">—</span>
        <span className="dash-date-time">—</span>
      </div>
    );
  }

  return (
    <div className="dash-date" aria-label="Current local date and time">
      <span className="dash-date-day">{formatDateLine(now)}</span>
      <span className="dash-date-time" aria-live="off">
        {formatTimeLine(now)}
      </span>
    </div>
  );
}
