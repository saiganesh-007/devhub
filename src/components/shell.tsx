import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandLockup } from "@/components/brand";
import { AuthStatus } from "@/components/auth-status";
import { ThemeControl } from "@/components/theme/theme-toggle";
import { MobileHeader } from "@/components/mobile-nav";
import { NavList } from "@/components/shell-nav";
import { FavouritesProvider } from "@/components/favourites-provider";
import { GlobalSearch } from "@/components/global-search";
import "@/app/workspace.css";

export async function AppShell({
  children,
  section,
  wide = false,
}: {
  children: ReactNode;
  section?: string;
  wide?: boolean;
}) {
  return (
    <FavouritesProvider>
    <div className="workspace min-h-dvh bg-background text-foreground" data-section={section}>
      <a className="workspace-skip" href="#workspace-content">Skip to content</a>
      <aside
        aria-label="Application sidebar"
        className="workspace-sidebar fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line lg:flex"
      >
        <div className="flex h-16 items-center border-b border-line px-5">
          <Link href="/" aria-label="DevHub home">
            <BrandLockup />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <p className="text-metadata px-3 pb-3">Workspace</p>
          <NavList variant="sidebar" />
        </div>
        <div className="workspace-sidebar-note"><span className="text-metadata">Open source, in context</span><p>People. Repositories.<br />The signals between them.</p><Link href="/search">Start exploring <ArrowRight size={14} /></Link></div>
      </aside>

      <div className="workspace-body lg:pl-64">
        <MobileHeader account={<AuthStatus />} section={section} />
        <header className="sticky top-0 z-30 hidden border-b border-line bg-background/85 backdrop-blur-xl lg:block">
          <div className="mx-auto flex h-16 w-full max-w-[88rem] items-center gap-4 px-6">
            <nav aria-label="Breadcrumb" className="hidden min-w-0 xl:block">
              <ol className="flex min-w-0 items-center gap-2 text-sm">
                <li className="shrink-0 text-ink3">DevHub</li>
                {section && (
                  <>
                    <li aria-hidden="true" className="text-ink3">
                      /
                    </li>
                    <li aria-current="page" className="truncate font-medium text-ink">
                      {section}
                    </li>
                  </>
                )}
              </ol>
            </nav>
            <div className="flex min-w-0 flex-1 justify-center">
              <GlobalSearch />
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-3">
              <AuthStatus />
              <ThemeControl />
            </div>
          </div>
        </header>
        <main id="workspace-content" tabIndex={-1} className={`app-main ${wide ? "max-w-[88rem]" : ""}`}>
          {children}
        </main>
      </div>

      <div
        aria-label="Primary"
        className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-line bg-surface-1/95 p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-elevated backdrop-blur lg:hidden"
      >
        <NavList variant="bottom" label="Primary" />
      </div>
    </div>
    </FavouritesProvider>
  );
}

export function RateBadge() {
  return <span className="badge-dot">Live GitHub data</span>;
}
