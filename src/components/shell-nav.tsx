"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  Compass,
  Database,
  GitCompareArrows,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";

export const primaryNav = [
  ["Explore", "/dashboard", Compass],
  ["Developers", "/search?type=developers", Users],
  ["Repositories", "/search?type=repositories", Database],
  ["Insights", "/insights", Sparkles],
  ["Saved", "/favourites", Bookmark],
  ["Compare", "/compare", GitCompareArrows],
] as const;

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main Navigation" className="flex items-center gap-1 sm:gap-2">
      {primaryNav.map(([label, href, Icon]) => {
        const clean = href.split("?")[0];
        const active =
          clean === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === clean || pathname.startsWith(`${clean}/`);

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`group relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors duration-180 whitespace-nowrap ${
              active
                ? "bg-[rgba(134,31,61,0.07)] text-[var(--brand)]"
                : "text-ink2 hover:bg-panel hover:text-ink"
            }`}
          >
            <Icon
              size={14}
              strokeWidth={active ? 2.2 : 1.8}
              aria-hidden="true"
              className={active ? "text-[var(--brand)]" : "text-ink3 group-hover:text-ink"}
            />
            <span className="whitespace-nowrap">{label}</span>
            {active && (
              <span
                aria-hidden="true"
                className="size-1 rounded-full bg-[var(--brand)]"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function NavList({
  label = "Primary",
  onNavigate,
}: {
  variant?: "drawer" | "bottom";
  label?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const allItems = [
    ["Explore", "/dashboard", Compass] as const,
    ["Developers", "/search?type=developers", Users] as const,
    ["Repositories", "/search?type=repositories", Database] as const,
    ["Insights", "/insights", Sparkles] as const,
    ["Saved", "/favourites", Bookmark] as const,
    ["Compare", "/compare", GitCompareArrows] as const,
    ["Settings", "/settings", Settings] as const,
  ];

  return (
    <nav className="flex flex-col gap-1" aria-label={label}>
      {allItems.map(([itemLabel, href, Icon]) => {
        const clean = href.split("?")[0];
        const active =
          clean === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === clean || pathname.startsWith(`${clean}/`);

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition-colors duration-180 whitespace-nowrap ${
              active
                ? "border-line bg-[rgba(134,31,61,0.07)] text-[var(--brand)]"
                : "border-transparent text-ink2 hover:border-line hover:bg-panel hover:text-ink"
            }`}
          >
            <Icon
              size={16}
              aria-hidden="true"
              className={active ? "text-[var(--brand)]" : "text-ink3"}
            />
            <span className="whitespace-nowrap">{itemLabel}</span>
            {active && (
              <span
                className="ml-auto size-1.5 rounded-full bg-[var(--brand)]"
                aria-hidden="true"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
