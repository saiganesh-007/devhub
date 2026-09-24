import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Code2 } from "lucide-react";

/**
 * Single source of truth for the DevHub mark used everywhere EXCEPT the
 * loading page. The loader keeps its own artwork untouched.
 * Exact source file: `design-references/newlogo.png`, copied byte-for-byte
 * to `/brand/devhub-logo.png`. Artwork is used exactly as provided: no
 * recolor, crop, or distortion — always `object-fit: contain` at 1:1.
 */
export const DEVHUB_MARK_SRC = "/brand/devhub-logo.png";

/**
 * Canonical shared DevHub logo. All non-loader branding delegates to this
 * component so the artwork has exactly one markup source.
 */
export function DevHubLogo({
  size = 36,
  className = "",
  style,
  priority = false,
  label = "DevHub",
}: {
  size?: number;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
  label?: string;
}) {
  return (
    <span
      className={`relative grid place-items-center overflow-hidden ${className}`}
      style={{ width: size, height: size, ...style }}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label || undefined}
    >
      <Image
        src={DEVHUB_MARK_SRC}
        alt=""
        width={Math.round(size * 2)}
        height={Math.round(size * 2)}
        priority={priority}
        draggable={false}
        className="h-full w-full select-none object-contain"
      />
    </span>
  );
}

/**
 * Small DevHub cat mark.
 * Kept as a visual element only so it can safely be used
 * inside Logo without creating nested <a> tags.
 */
export function CatMark({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <DevHubLogo
      size={size}
      label=""
      className={`chip-light rounded-md border border-line bg-surface-1 ${className}`}
    />
  );
}

/**
 * Existing app/dashboard brand lockup.
 */
export function BrandLockup({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-xl border border-line bg-brand-tile p-1.5 shadow-soft ${className}`}
    >
      <DevHubLogo size={28} label="DevHub" priority className="rounded-lg" />
    </span>
  );
}

/**
 * Existing auth-page / general DevHub logo.
 */
export function Logo({
  href = "/",
  className = "",
  wordmark = true,
  size = 34,
}: {
  href?: string;
  className?: string;
  wordmark?: boolean;
  size?: number;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label="DevHub home"
    >
      <CatMark
        size={size}
        className="transition-transform group-hover:scale-105"
      />

      {wordmark && (
        <span className="font-mono text-[13px] font-bold uppercase tracking-[0.14em] text-ink">
          DevHub
        </span>
      )}
    </Link>
  );
}

/**
 * Cat-only artwork used by the landing experience.
 */
export function DevhubCatMark({
  size = 32,
  priority = false,
}: {
  size?: number;
  priority?: boolean;
}) {
  return (
    <DevHubLogo
      size={size}
      label=""
      priority={priority}
      style={{ borderRadius: size / 2, flex: "none" }}
    />
  );
}

/**
 * Bright cat badge for dark landing-page surfaces.
 */
export function DevhubCatBadge({
  size = 32,
  priority = false,
}: {
  size?: number;
  priority?: boolean;
}) {
  return (
    <DevHubLogo
      size={size}
      label=""
      priority={priority}
      className="devhub-cat-badge"
      style={{ borderRadius: size / 2 }}
    />
  );
}

/**
 * Fallback mark when artwork cannot/should not be used.
 */
export function LogoFallback() {
  return (
    <span className="grid size-7 place-items-center rounded-md border border-line bg-surface-1 text-primary shadow-none">
      <Code2 size={15} />
    </span>
  );
}
