import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand";
import { AuthMascot } from "@/components/auth-mascot";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="relative flex min-h-dvh flex-col bg-bg0 text-ink">
      <div
        aria-hidden="true"
        className="auth-grid pointer-events-none absolute inset-0 opacity-40"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-1/4 h-[26rem] w-[26rem] rounded-full bg-brand1/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 bottom-1/4 h-[22rem] w-[22rem] rounded-full bg-brand2/10 blur-3xl"
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <Logo />
        <Link
          href="/"
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink3 transition-colors hover:text-ink"
        >
          Back to home
        </Link>
      </header>

      <div className="relative z-10 flex flex-1 items-center justify-center px-5 py-8">
        <div className="w-full max-w-md">
          <div className="card-surface rounded-2xl p-7 shadow-2xl sm:p-10">
            <AuthMascot />
            <p className="section-label mt-6 text-center">{eyebrow}</p>
            <h1 className="mt-3 text-center text-3xl font-semibold tracking-[-0.03em] text-ink">
              {title}
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-6 text-ink3">
              {description}
            </p>
            {children}
          </div>
        </div>
      </div>

      <p className="relative z-10 pb-6 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-ink3">
        GitHub data · interpreted with context
      </p>
    </main>
  );
}