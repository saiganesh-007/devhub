import Image from "next/image";
import Link from "next/link";
import { Code2 } from "lucide-react";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-[13px] font-bold tracking-[.1em] text-white" aria-label="DevHub home">
      <span className="relative grid size-7 place-items-center overflow-hidden rounded-md border border-sky-400/35 bg-sky-400/10 shadow-[0_0_12px_rgba(56,189,248,0.2)]">
        <Image
          src="/brand/devhub-logo.png"
          alt="DevHub cat"
          width={56}
          height={56}
          priority={false}
          style={{ objectFit: "cover", objectPosition: "8% 50%", transform: "scale(2.6)", transformOrigin: "22% 50%" }}
        />
      </span>
      DEVHUB
    </Link>
  );
}

/** Official DevHub cat mark isolated from the full wordmark artwork.
 *  Uses the canonical PNG and crops to the cat (left ~30%) so the full
 *  wordmark is never squeezed into tiny icon containers. */
export function DevhubCatMark({ size = 32, priority = false }: { size?: number; priority?: boolean }) {
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
        style={{ objectFit: "cover", objectPosition: "12% 50%", transform: "scale(1.02)" }}
      />
    </span>
  );
}

export function LogoFallback() {
  return (
    <span className="grid size-7 place-items-center rounded-md border border-sky-400/35 bg-sky-400/10 text-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.2)]">
      <Code2 size={15} />
    </span>
  );
}
