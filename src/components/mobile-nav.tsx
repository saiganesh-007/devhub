"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { BrandLockup } from "@/components/brand";
import { NavList } from "@/components/shell-nav";
import { ThemeControl } from "@/components/theme/theme-toggle";

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MobileHeader({
  account,
  section,
}: {
  account?: ReactNode;
  section?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
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
      trigger?.focus();
    };
  }, [open ]);

  return (
    <>
      <header className="relative z-40 lg:hidden">
        <div className="flex h-16 items-center justify-between gap-3 border-b border-line bg-bg0/90 px-4 backdrop-blur-xl sm:px-6">
          <Link href="/" aria-label="DevHub home">
            <BrandLockup />
          </Link>
          <button
            ref={triggerRef}
            type="button"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label="Open navigation menu"
            onClick={() => setOpen(true)}
            className="btn-icon"
          >
            <Menu size={18} aria-hidden="true" />
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            data-backdrop
            aria-label="Close navigation menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-black/55 backdrop-blur-sm"
          />
          <div
            ref={panelRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Application navigation"
            data-drawer-panel
            className="absolute inset-y-0 left-0 flex w-[19rem] max-w-[86vw] flex-col border-r border-line bg-surface-1 shadow-elevated"
          >
            <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line px-4">
              <BrandLockup />
              <button
                ref={closeRef}
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setOpen(false)}
                className="btn-icon"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-5">
              {section && (
                <p className="text-metadata px-3 pb-3">{section}</p>
              )}
              <NavList
                variant="drawer"
                label="Application"
                onNavigate={() => setOpen(false)}
              />
            </div>

            <div className="space-y-3 border-t border-line p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-caption">Appearance</span>
                <ThemeControl />
              </div>
              {account}
            </div>
          </div>
        </div>
      )}
    </>
  );
}