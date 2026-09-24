"use client";

import { useState } from "react";

function initialsOf(name: string): string {
  return name
    .replace(/^@/, "")
    .split(/[\s/_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Resolve the single user avatar source used across the authenticated app.
 * Order: explicit avatar_url -> provider image -> initials fallback.
 */
export function resolveUserAvatar(
  avatarUrl: string | null | undefined,
  providerUrl: string | null | undefined,
): string | null {
  if (typeof avatarUrl === "string" && avatarUrl.trim() !== "") return avatarUrl;
  if (typeof providerUrl === "string" && providerUrl.trim() !== "") return providerUrl;
  return null;
}

/**
 * ONE shared account-identity avatar. Use everywhere the signed-in user's
 * photo appears (navbar, sidebar, dropdown, settings) so resolution logic
 * never diverges. Plain <img> keeps storage + provider hosts working
 * without touching the image optimizer config.
 */
export function UserAvatar({
  name,
  src,
  providerSrc,
  size = 40,
  label,
}: {
  name: string;
  src: string | null | undefined;
  providerSrc?: string | null | undefined;
  size?: number;
  /** Accessible label; defaults to decorative when omitted. */
  label?: string;
}) {
  const [failed, setFailed] = useState(false);
  const resolved = resolveUserAvatar(src, providerSrc);
  const showImage = !failed && resolved !== null;

  return (
    <span
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      className="grid shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-gradient-to-br from-brand1 to-brand2 font-bold text-primary-foreground"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, Math.round(size * 0.32)),
      }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolved}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          draggable={false}
          onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <span aria-hidden="true">{initialsOf(name) || "?"}</span>
      )}
    </span>
  );
}
