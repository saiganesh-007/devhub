import { cn } from "@/lib/utils";

export interface LanguageSignal { name: string; value: number; bytes: number }
export function LanguageSignals({ data, className }: { data: LanguageSignal[]; className?: string }) {
  const entries = data.filter(item => Number.isFinite(item.value) && item.value > 0);
  const visible = entries.slice(0, 8);
  const remainder = entries.slice(8).reduce((sum, item) => sum + item.value, 0);
  const rows = remainder ? [...visible, { name: "Other", value: remainder, bytes: 0 }] : visible;
  if (!rows.length) return <p className="text-sm text-ink3">No language data available.</p>;
  return <div className={cn("language-signals", className)} aria-label="Language distribution">
    {rows.map((item, index) => <div className="language-signal" key={item.name}>
      <div><span>{item.name}</span><span className="language-signal-value">{item.value.toFixed(1)}%</span></div>
      <div className="language-signal-track" aria-hidden="true"><span style={{ width: `${Math.min(100, item.value)}%`, backgroundColor: `var(--chart-${index % 5 + 1})` }} /></div>
    </div>)}
  </div>;
}
