"use client";

import { useEffect } from "react";

import {
  recordLocalHistory,
} from "@/lib/workspace";

type Props = {
  type: "developer" | "repository";
  identifier: string;
  metadata: Record<string, unknown>;
};

export function RecentViewBeacon({
  type,
  identifier,
  metadata,
}: Props) {
  const metadataKey =
    JSON.stringify(metadata);

  useEffect(() => {
    const stableMetadata =
      JSON.parse(
        metadataKey
      ) as Record<string, unknown>;

    recordLocalHistory({
      kind: "view",
      entityType: type,
      identifier,
      label:
        typeof stableMetadata.name ===
        "string"
          ? stableMetadata.name
          : identifier,
      metadata: stableMetadata,
    });

    /*
     * This is a non-critical history beacon.
     *
     * Do not abort it during navigation.
     * keepalive lets the browser finish the request
     * even when the page is transitioning.
     */
    void fetch("/api/recent-views", {
      method: "POST",
      headers: {
        "content-type":
          "application/json",
      },
      body: JSON.stringify({
        entity_type: type,
        entity_identifier:
          identifier,
        metadata: stableMetadata,
      }),
      keepalive: true,
    }).catch(() => {
      // Recent-view persistence must never
      // crash the product experience.
    });
  }, [
    identifier,
    metadataKey,
    type,
  ]);

  return null;
}