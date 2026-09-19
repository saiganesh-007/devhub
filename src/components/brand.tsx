import Image from "next/image";
import Link from "next/link";

export function CatMark({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`chip-light ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Image
        src="/brand/cat-mark.png"
        alt=""
        width={size}
        height={size}
        className="h-full w-full select-none object-cover"
        draggable={false}
      />
    </span>
  );
}

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
      <CatMark size={34} className="transition-transform group-hover:scale-105" />
      {wordmark && (
        <span className="font-mono text-[13px] font-bold uppercase tracking-[0.14em] text-ink">
          DevHub
        </span>
      )}
    </Link>
  );
}