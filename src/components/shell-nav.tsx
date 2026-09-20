"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GitCompareArrows,
  Heart,
  LayoutDashboard,
  Search,
  Settings,
} from "lucide-react";

export const primaryNav = [
  ["Overview", "/dashboard", LayoutDashboard],
  ["Search", "/search", Search],
  ["Compare", "/compare", GitCompareArrows],
  ["Saved", "/favourites", Heart],
] as const;

export function NavList({
  variant = "sidebar",
  label = "Primary",
  onNavigate,
}: {
  variant?: "sidebar" | "bottom" | "drawer";
  label?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  if (variant === "bottom") {
    return (
      <nav aria-label={label} className="flex w-full items-center justify-around">
        {primaryNav.map(([itemLabel, href, Icon]) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-label={itemLabel}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={`flex min-h-14 min-w-16 flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 ${active ? "text-brand1" : "text-ink3 hover:text-ink"}`}
            >
              <Icon size={18} strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
              <span className="text-[9px] font-semibold uppercase tracking-[0.12em]">
                {itemLabel}
              </span>
            </Link>
          );
        })}
      </nav>
    );
  }

  const items = (
    [...primaryNav, ["Settings", "/settings", Settings]]
  ) as typeof primaryNav;

  return (
    <nav className="flex flex-col gap-1" aria-label={label}>
      {items.map(([itemLabel, href, Icon]) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "border-line bg-panel text-ink shadow-soft"
                : "border-transparent text-ink3 hover:border-line hover:bg-panel hover:text-ink"
            }`}
          >
            <Icon size={17} aria-hidden="true" className={active ? "text-brand1" : ""} />
            {itemLabel}
            {active && (
              <span className="ml-auto size-1.5 rounded-full bg-brand1" aria-hidden="true" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
