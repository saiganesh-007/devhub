import Image from "next/image";
import Link from "next/link";
import { Code2 } from "lucide-react";

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
    <span
      className={`chip-light relative grid place-items-center overflow-hidden rounded-md border border-sky-400/35 bg-sky-400/10 shadow-[0_0_12px_rgba(56,189,248,0.2)] ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Image
        src="/brand/devhub-logo.png"
        alt=""
        width={Math.round(size * 3)}
        height={Math.round(size * 3)}
        draggable={false}
        className="select-none"
        style={{
          objectFit: "cover",
          objectPosition: "8% 50%",
          transform: "scale(2.6)",
          transformOrigin: "22% 50%",
        }}
      />
    </span>
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
      <span className="relative block aspect-[2172/724] h-7">
        <Image
          src="/brand/devhub-logo.png"
          alt="DevHub"
          fill
          sizes="96px"
          className="object-contain"
          priority
        />
      </span>
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
}: {
  href?: string;
  className?: string;
  wordmark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label="DevHub home"
    >
      <CatMark
        size={34}
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
    <span
      aria-hidden="true"
      style={{
        display: "inline-grid",
        placeItems: "center",
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: "hidden",
        flex: "none",
      }}
    >
      <Image
        src="/brand/devhub-logo.png"
        alt=""
        width={Math.round(size * 3.4)}
        height={Math.round(size * 3.4)}
        priority={priority}
        draggable={false}
        style={{
          objectFit: "cover",
          objectPosition: "12% 50%",
          transform: "scale(1.02)",
        }}
      />
    </span>
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
    <span
      className="devhub-cat-badge"
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
    >
      <Image
        src="/brand/devhub-logo.png"
        alt=""
        width={256}
        height={256}
        priority={priority}
        draggable={false}
      />
    </span>
  );
}

/**
 * Fallback mark when artwork cannot/should not be used.
 */
export function LogoFallback() {
  return (
    <span className="grid size-7 place-items-center rounded-md border border-sky-400/35 bg-sky-400/10 text-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.2)]">
      <Code2 size={15} />
    </span>
  );
}