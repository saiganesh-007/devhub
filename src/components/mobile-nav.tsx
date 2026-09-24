"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { Menu, X, Search } from "lucide-react";
import { CatMark } from "@/components/brand";
import { NavList } from "@/components/shell-nav";

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MobileMenuDrawer({
  open,
  onClose,
  account,
  section,
}: {
  open: boolean;
  onClose: () => void;
  account?: ReactNode;
  section?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;
      const focusables = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
      ).filter((element) => element.offsetParent !== null);
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        data-backdrop
        aria-label="Close navigation menu"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/65 backdrop-blur-sm transition-opacity"
      />
      <div
        ref={panelRef}
        id="mobile-navigation"
        role="dialog"
        aria-modal="true"
        aria-label="Application navigation"
        className="absolute inset-y-0 right-0 flex w-[19rem] max-w-[86vw] flex-col border-l border-line bg-surface-1 shadow-2xl"
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line px-5">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-2.5"
            aria-label="DevHub dashboard"
          >
            <CatMark size={28} />
            <span className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-ink">
              DevHub
            </span>
          </Link>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close navigation menu"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-md border border-line bg-panel text-ink2 transition-colors hover:text-ink"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Quick search shortcut in drawer */}
        <div className="p-3">
          <Link
            href="/search"
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-lg border border-line bg-panel px-3 py-2 text-xs text-ink3 transition-colors hover:border-line2 hover:text-ink"
          >
            <Search size={14} className="text-[var(--brand)]" />
            <span>Search developers or repos...</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          {section && (
            <p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--brand)]">
              ● {section}
            </p>
          )}
          <NavList variant="drawer" label="Application" onNavigate={onClose} />
        </div>

        <div className="space-y-3 border-t border-line p-4">
          {account}
        </div>
      </div>
    </div>
  );
}

export function MobileHeader({
  account,
  section,
}: {
  account?: ReactNode;
  section?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2 md:hidden">
        <Link
          href="/search"
          aria-label="Search developers and repositories"
          className="grid size-8 place-items-center rounded-lg border border-line bg-panel text-ink3 transition-colors hover:text-ink"
        >
          <Search size={15} aria-hidden="true" />
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label="Open navigation menu"
          onClick={() => setOpen(true)}
          className="grid size-8 place-items-center rounded-lg border border-line bg-panel text-ink3 transition-colors hover:text-ink"
        >
          <Menu size={16} aria-hidden="true" />
        </button>
      </div>

      <MobileMenuDrawer
        open={open}
        onClose={() => setOpen(false)}
        account={account}
        section={section}
      />
    </>
  );
}