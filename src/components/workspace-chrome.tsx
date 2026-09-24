"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  Compass,
  Database,
  GitCompareArrows,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { CatMark } from "@/components/brand";
import { GlobalShortcuts } from "@/components/global-shortcuts";
import { GlobalSearch } from "@/components/global-search";
import { MobileMenuDrawer } from "@/components/mobile-nav";
import { UserAvatar } from "@/components/user-avatar";

type NavItem = {
  label: string;
  href: string;
  Icon: typeof Users;
  exact?: boolean;
};

const PRIMARY_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard, exact: true },
  { label: "Explore", href: "/search", Icon: Compass, exact: true },
  { label: "Insights", href: "/insights", Icon: Sparkles },
  { label: "Compare", href: "/compare", Icon: GitCompareArrows },
  { label: "Saved", href: "/favourites", Icon: Bookmark },
];

const INTELLIGENCE_NAV: NavItem[] = [
  { label: "Developers", href: "/search?type=developers", Icon: Users },
  { label: "Repositories", href: "/search?type=repositories", Icon: Database },
];

const SETTINGS_NAV: NavItem[] = [{ label: "Settings", href: "/settings", Icon: Settings }];

function isActive(pathname: string, item: NavItem): boolean {
  const cleanHref = item.href.split("?")[0];
  if (item.exact) return pathname === cleanHref;
  if (item.href.includes("?")) return pathname === cleanHref;
  return pathname === cleanHref || pathname.startsWith(`${cleanHref}/`);
}

function NavGroup({
  title,
  items,
  collapsed,
  onNavigate,
}: {
  title: string;
  items: NavItem[];
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <div className="ws-nav-group">
      {!collapsed && (
        <p className="ws-nav-title" aria-hidden="true">
          {title}
        </p>
      )}
      <ul className="ws-nav-list">
        {items.map(({ label, href, Icon, exact }) => {
          const active = isActive(pathname, { label, href, Icon, exact });
          return (
            <li key={`${title}-${label}`}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                title={collapsed ? label : undefined}
                className={`ws-nav-link${active ? " is-active" : ""}${collapsed ? " is-collapsed" : ""}`}
              >
                <Icon size={16} aria-hidden="true" />
                {!collapsed && <span>{label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Dashboard workspace chrome: fixed sidebar + top bar + mobile drawer.
 * Only used by the dashboard route; every other page keeps the default
 * command-bar shell untouched.
 */
export function WorkspaceChrome({
  children,
  userName,
  userEmail,
  userMenu,
  avatarUrl,
  providerUrl,
}: {
  children: ReactNode;
  userName: string;
  userEmail: string;
  userMenu: ReactNode;
  avatarUrl?: string | null;
  providerUrl?: string | null;
}) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem("devhub:ws-collapsed") === "1";
    } catch {
      return false;
    }
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  function toggleCollapsed() {
    setCollapsed((value) => {
      try {
        window.localStorage.setItem("devhub:ws-collapsed", value ? "0" : "1");
      } catch {
        // Best effort.
      }
      return !value;
    });
  }

  return (
    <div className={`ws${collapsed ? " is-collapsed" : ""}`}>
      <a className="workspace-skip" href="#workspace-content">
        Skip to content
      </a>
      <GlobalShortcuts />

      <aside className="ws-side" aria-label="Workspace">
        <div className="ws-side-head">
          <button
            type="button"
            onClick={toggleCollapsed}
            className="ws-icon-btn"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
          {!collapsed && (
            <Link href="/dashboard" className="ws-brand" aria-label="DevHub dashboard">
              <CatMark size={30} />
              <span className="ws-brand-text">
                <span className="ws-brand-name">DevHub</span>
                <span className="ws-brand-tag">Open-source intelligence</span>
              </span>
            </Link>
          )}
        </div>

        <nav className="ws-nav" aria-label="Workspace">
          <NavGroup title="Primary" items={PRIMARY_NAV} collapsed={collapsed} />
          <NavGroup title="Intelligence" items={INTELLIGENCE_NAV} collapsed={collapsed} />
          <NavGroup title="Settings" items={SETTINGS_NAV} collapsed={collapsed} />
        </nav>

        <div className="ws-side-foot">
          {collapsed ? (
            <UserAvatar name={userName} src={avatarUrl} providerSrc={providerUrl} size={34} />
          ) : (
            <div className="ws-account">{userMenu}</div>
          )}
        </div>
      </aside>

      <div className="ws-main">
        <header className="ws-top">
          <button
            type="button"
            className="ws-icon-btn ws-menu-btn"
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <Menu size={16} aria-hidden="true" />
          </button>
          <div className="ws-search-wrap">
            <GlobalSearch />
          </div>
          <div className="ws-user">
            <div className="ws-user-text">
              <span className="ws-user-name">{userName}</span>
              {userEmail && <span className="ws-user-email">{userEmail}</span>}
            </div>
            {userMenu}
          </div>
        </header>

        <main id="workspace-content" tabIndex={-1} className="ws-content">
          {children}
        </main>
      </div>

      <MobileMenuDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} account={userMenu} />
    </div>
  );
}
