import Link from "next/link";
import { Code2 } from "lucide-react";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-[13px] font-bold tracking-[.1em] text-white">
      <span className="grid size-7 place-items-center rounded-md border border-sky-400/35 bg-sky-400/10 text-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.2)]">
        <Code2 size={15} />
      </span>
      DEVHUB
    </Link>
  );
}
