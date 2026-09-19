"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Sector,
} from "recharts";
import { cn } from "@/lib/utils";

interface LanguageData {
  name: string;
  value: number;
  bytes: number;
}

interface RepoLanguageChartProps {
  data: LanguageData[];
  className?: string;
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--brand-1)",
  "var(--brand-2)",
  "var(--brand-3)",
];

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string; payload: LanguageData }> }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-line bg-panel px-3 py-2 text-xs text-ink">
      <span className="font-medium">{item.payload.name}</span>
      <span className="mx-2 text-ink3">{item.value.toFixed(1)}%</span>
      <span className="font-mono text-ink3">{compactNumber(item.payload.bytes)} bytes</span>
    </div>
  );
}

function compactNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function RepoLanguageBarChart({ data, className }: RepoLanguageChartProps) {
  const topLanguages = data.slice(0, 10).reverse();
  
  return (
    <div className={cn("h-72", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={topLanguages}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <XAxis type="number" hide dataKey="value" />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fontSize: 12, fill: "var(--ink-2)", fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="value"
            radius={[0, 4, 4, 0]}
            maxBarSize={32}
          >
            {topLanguages.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RepoLanguagePieChart({ data, className }: RepoLanguageChartProps) {
  const topLanguages = data.slice(0, 7);
  const otherValue = data.slice(7).reduce((sum, d) => sum + d.value, 0);
  const chartData = otherValue > 0 ? [...topLanguages, { name: "Other", value: otherValue, bytes: 0 }] : topLanguages;

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: { cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number; name: string }) => {
    if (percent < 0.05) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
    return (
      <text
        x={x}
        y={y}
        fill="var(--ink)"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={11}
        fontWeight={500}
      >
        {name} {percent * 100 >= 1 ? `(${percent * 100}toFixed(1)}%)` : ""}
      </text>
    );
  };

  return (
    <div className={cn("h-72", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            label={renderCustomizedLabel}
            labelLine={false}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
            <Sector fill="transparent" />
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RepoLanguageChart({ data, className }: RepoLanguageChartProps) {
  if (data.length === 0) return null;
  return (
    <div className={cn("space-y-6", className)}>
      <RepoLanguageBarChart data={data} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.slice(0, 12).map((lang, i) => (
          <div key={lang.name} className="flex items-center justify-between text-sm p-3 rounded-lg border border-line bg-panel/50">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="size-3 rounded shrink-0"
                style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
              />
              <span className="font-medium text-ink truncate">{lang.name}</span>
            </div>
            <div className="flex items-center gap-4 text-ink3 shrink-0">
              <span className="font-mono tabular-nums">{lang.value.toFixed(1)}%</span>
              <span className="font-mono hidden sm:inline">{compactNumber(lang.bytes)} bytes</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}