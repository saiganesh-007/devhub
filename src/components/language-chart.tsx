"use client";

import type { PieLabelRenderProps } from "recharts";

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
import { LanguageSignals } from "@/components/language-signals";

interface LanguageData {
  name: string;
  value: number;
  bytes: number;
}

interface LanguageChartProps {
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

export function LanguageBarChart({ data, className }: LanguageChartProps) {
  const topLanguages = data.slice(0, 8).reverse();
  
  return (
    <div className={cn("h-64", className)}>
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
            width={100}
            tick={{ fontSize: 12, fill: "var(--ink-2)", fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="value"
            radius={[0, 4, 4, 0]}
            maxBarSize={28}
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

export function LanguagePieChart({ data, className }: LanguageChartProps) {
  const topLanguages = data.slice(0, 6);
  const otherValue = data.slice(6).reduce((sum, d) => sum + d.value, 0);
  const chartData = otherValue > 0 ? [...topLanguages, { name: "Other", value: otherValue, bytes: 0 }] : topLanguages;

  const renderCustomizedLabel = (
    props: PieLabelRenderProps
  ) => {
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      percent,
    } = props;

    if (
      typeof cx !== "number" ||
      typeof cy !== "number" ||
      typeof midAngle !== "number" ||
      typeof innerRadius !== "number" ||
      typeof outerRadius !== "number" ||
      typeof percent !== "number" ||
      percent < 0.05
    ) {
      return null;
    }

    const radius =
      innerRadius +
      (outerRadius - innerRadius) * 0.5;

    const x =
      cx +
      radius *
        Math.cos(
          -midAngle * (Math.PI / 180)
        );

    const y =
      cy +
      radius *
        Math.sin(
          -midAngle * (Math.PI / 180)
        );

    const name = String(
      (
        props as PieLabelRenderProps & {
          name?: unknown;
        }
      ).name ?? ""
    );

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
        {name} ({(percent * 100).toFixed(1)}%)
      </text>
    );
  };

  return (
    <div className={cn("h-64", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
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

export function LanguageChart({ data, className }: LanguageChartProps) {
  return <LanguageSignals data={data} className={className} />;
}

export function LanguageChartDetailed({ data, className }: LanguageChartProps) {
  if (data.length === 0) return null;
  return (
    <div className={cn("space-y-4", className)}>
      <LanguageBarChart data={data} />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {data.slice(0, 10).map((lang, i) => (
          <div key={lang.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="size-2.5 rounded shrink-0"
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
