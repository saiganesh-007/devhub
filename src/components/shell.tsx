import type { ReactNode } from "react";
import Link from "next/link";
import { CatMark } from "@/components/brand";
import { AuthStatus } from "@/components/auth-status";
import { GlobalShortcuts } from "@/components/global-shortcuts";
import { GlobalSearch } from "@/components/global-search";
import { MobileHeader } from "@/components/mobile-nav";
import { NavLinks } from "@/components/shell-nav";
import { WorkspaceChrome } from "@/components/workspace-chrome";
import "@/app/workspace.css";

export async function AppShell({
  children,
  section,
  wide = false,
  layout = "command",
  userName = "",
  userEmail = "",
  avatarUrl = null,
  providerUrl = null,
}: {
  children: ReactNode;
  section?: string;
  wide?: boolean;
  /** "workspace" renders the dashboard sidebar layout; everything else keeps the command bar. */
  layout?: "command" | "workspace";
  userName?: string;
  userEmail?: string;
  avatarUrl?: string | null;
  providerUrl?: string | null;
}) {
  if (layout === "workspace") {
    return (
      <div className="workspace min-h-dvh bg-background text-foreground" data-section={section}>
        <WorkspaceChrome
          userName={userName}
          userEmail={userEmail}
          userMenu={<AuthStatus />}
          avatarUrl={avatarUrl}
          providerUrl={providerUrl}
        >
          {children}
        </WorkspaceChrome>
      </div>
    );
  }
  return (
    <div
      className="workspace min-h-dvh bg-background text-foreground"
      data-section={section}
    >
      <a className="workspace-skip" href="#workspace-content">
        Skip to content
      </a>
      <GlobalShortcuts />

      <header className="workspace-command-bar sticky top-0 z-40 w-full">
        <div className="workspace-shell-inner mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-5 sm:gap-7">
            <Link
              href="/dashboard"
              aria-label="DevHub workspace home"
              className="workspace-brand group flex shrink-0 items-center gap-2.5 rounded-full border border-line bg-panel/40 px-2.5 py-1.5"
            >
              <CatMark
                size={32}
                className="transition-transform duration-180 group-hover:scale-105"
              />
              <span className="font-mono text-[12px] font-bold tracking-[0.16em] uppercase text-ink">
                DevHub
              </span>
            </Link>

            <nav className="workspace-main-nav hidden min-w-0 items-center gap-1 lg:flex">
              <NavLinks />
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden min-w-0 flex-1 sm:block sm:max-w-105">
              <GlobalSearch placeholder="Search devs, repos, languages" />
            </div>

            <div className="flex items-center">
              <AuthStatus />
            </div>

            <MobileHeader account={<AuthStatus />} section={section} />
          </div>
        </div>
      </header>

      {/* Centered Content Container */}
      <div className="workspace-body w-full">
        <main
          id="workspace-content"
          tabIndex={-1}
          className={`app-main mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 ${
            wide ? "max-w-[1280px]" : "max-w-[1240px]"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export function RateBadge() {
  return (
    <span className="badge-signal inline-flex items-center gap-1.5 rounded-full border border-line bg-panel px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink3">
      <span className="size-1.5 rounded-full bg-[var(--brand)]" />
      Live GitHub Data
    </span>
  );
}
