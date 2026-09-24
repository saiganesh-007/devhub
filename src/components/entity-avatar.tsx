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
 * GitHub avatar with an initials fallback. `src` is always a real
 * avatar URL (stored metadata) or the deterministic github.com/{login}.png
 * redirect — never invented imagery. Plain <img> keeps external avatar
 * hosts working without touching the image optimizer config.
 */
export function EntityAvatar({
  src,
  name,
  size = 40,
  rounded = "full",
}: {
  src: string | null | undefined;
  name: string;
  size?: number;
  rounded?: "full" | "lg";
}) {
  const [failed, setFailed] = useState(false);
  const radius = rounded === "full" ? "50%" : "10px";

  return (
    <span
      aria-hidden="true"
      className="entity-avatar"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        fontSize: Math.max(10, Math.round(size * 0.32)),
      }}
    >
      {!failed && src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          draggable={false}
          onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: radius }}
        />
      ) : (
        <span className="entity-avatar__fallback">{initialsOf(name)}</span>
      )}
    </span>
  );
}
