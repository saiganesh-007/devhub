"use client";

import { Check } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import type { ThemePreference } from "@/lib/theme";
import { cn } from "@/lib/utils";

const options: { value: ThemePreference; label: string; hint: string }[] = [
  { value: "light", label: "Light", hint: "Bright, paper-like surfaces" },
  { value: "dark", label: "Dark", hint: "Deep space navy, easier on the eyes" },
  { value: "system", label: "System", hint: "Follow your OS preference" },
];

export function ThemeSettings() {
  const { preference, setPreference } = useTheme();

  return (
    <div role="radiogroup" aria-label="Color theme" className="grid gap-3 sm:grid-cols-3">
      {options.map((option) => {
        const active = preference === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setPreference(option.value)}
            className={cn(
              "card-surface flex flex-col items-start gap-2 p-4 text-left transition-all",
              active
                ? "border-brand1/60 ring-2 ring-brand1/25"
                : "hover:border-line2",
            )}
          >
            <span className="flex w-full items-center justify-between">
              <span className="text-sm font-semibold text-ink">{option.label}</span>
              {active && <Check size={16} className="text-brand1" />}
            </span>
            <span className="text-xs leading-5 text-ink3">{option.hint}</span>
          </button>
        );
      })}
    </div>
  );
}