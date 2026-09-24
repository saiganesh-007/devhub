import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand";
import { AuthMascot } from "@/components/auth-mascot";
import "@/app/workspace.css";

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
    <main className="auth-workspace relative flex min-h-dvh flex-col overflow-hidden bg-bg0 text-ink">
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
        <Logo size={60} />
        <Link
          href="/"
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink3 transition-colors hover:text-ink"
        >
          Back to home
        </Link>
      </header>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_28rem] lg:px-10">
        <section className="hidden max-w-xl lg:block" aria-label="DevHub authentication overview">
          <p className="section-label">Developer intelligence / private workspace</p>
          <h2 className="mt-5 text-5xl font-semibold tracking-[-0.05em] text-ink xl:text-6xl">
            Follow the signal.<br />Keep the context.
          </h2>
          <p className="mt-6 max-w-lg text-base leading-7 text-ink2">
            Move from GitHub activity to a focused workspace for developer research,
            repository intelligence, factual comparison, and saved collections.
          </p>
          <dl className="mt-10 grid grid-cols-3 border-y border-line py-5">
            <div><dt className="text-metadata">Search</dt><dd className="mt-2 text-sm text-ink">People + code</dd></div>
            <div><dt className="text-metadata">Compare</dt><dd className="mt-2 text-sm text-ink">Aligned signals</dd></div>
            <div><dt className="text-metadata">Save</dt><dd className="mt-2 text-sm text-ink">Private context</dd></div>
          </dl>
        </section>
        <div className="w-full max-w-md justify-self-center lg:justify-self-end">
          <div className="auth-panel p-7 sm:p-10">
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
