"use client";

import { useEffect } from "react";

export function RecentViewBeacon({ type, identifier, metadata }: {
  type: "developer" | "repository";
  identifier: string;
  metadata: Record<string, unknown>;
}) {
  const metadataKey = JSON.stringify(metadata);
  useEffect(() => {
    // Respect the Privacy → Save recent views preference (default on).
    try {
      const raw = window.localStorage.getItem("devhub:privacy");
      if (raw) {
        const parsed = JSON.parse(raw) as { saveRecentViews?: boolean };
        if (parsed.saveRecentViews === false) return;
      }
    } catch {
      // Fall through and record.
    }
    const controller = new AbortController();
    void fetch("/api/recent-views", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ entity_type: type, entity_identifier: identifier, metadata: JSON.parse(metadataKey) }),
      signal: controller.signal,
    }).catch(() => undefined);
    return () => controller.abort();
  }, [identifier, metadataKey, type]);
  return null;
}
