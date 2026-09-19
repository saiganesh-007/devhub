"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import type { ThemePreference } from "@/lib/theme";
import { cn } from "@/lib/utils";

const themeOptions: {
  value: ThemePreference;
  label: string;
  hint: string;
  Icon: typeof Sun;
}[] = [
  { value: "light", label: "Light", hint: "Bright surfaces, dark text", Icon: Sun },
  { value: "dark", label: "Dark", hint: "Deep graphite surfaces", Icon: Moon },
  { value: "system", label: "System", hint: "Follow the operating system", Icon: Monitor },
];

export function ThemeControl({ className = "" }: { className?: string }) {
  const { preference, resolved, setPreference } = useTheme();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    menuRef.current
      ?.querySelector<HTMLButtonElement>('[aria-checked="true"]')
      ?.focus();

    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        trigger?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open ]);

  function onMenuKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (
      event.key !== "ArrowDown" &&
      event.key !== "ArrowUp" &&
      event.key !== "Home" &&
      event.key !== "End"
    ) {
      return;
    }

    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitemradio"]',
      ) ?? [],
    );
    if (!items.length) return;
    event.preventDefault();
    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      event.key === "ArrowDown"
        ? (current + 1) % items.length
        : event.key === "ArrowUp"
          ? (current - 1 + items.length) % items.length
          : event.key === "Home"
            ? 0
            : items.length - 1;
    items[next]?.focus();
  }

  const active = themeOptions.find((option) => option.value === preference) ?? {
    value: "system" as ThemePreference,
    label: "System",
    hint: "Follow the operating system",
    Icon: Monitor,
  };
  const ActiveIcon = active.Icon;

  return (
    <div ref={menuRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Theme: ${active.label}. Currently showing ${resolved} mode. Activate to change the theme.`}
        title={`Theme: ${active.label}`}
        onClick={() => setOpen((value) => !value)}
        className="btn-icon"
      >
        <ActiveIcon size={17} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Color theme"
          data-menu
          onKeyDown={onMenuKeyDown}
          className="menu-popover absolute right-0 z-50 mt-2 w-64"
        >
          {themeOptions.map(({ value, label, hint, Icon }) => {
            const selected = preference === value;
            return (
              <button
                key={value}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => {
                  setPreference(value);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                className="menu-item"
              >
                <Icon size={16} aria-hidden="true" className="shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-ink">{label}</span>
                  <span className="block truncate text-xs text-ink3">{hint}</span>
                </span>
                {selected && (
                  <Check size={15} aria-hidden="true" className="shrink-0 text-brand1" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}