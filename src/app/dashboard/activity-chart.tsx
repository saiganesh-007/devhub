"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";

export type ViewPoint = {
  at: string;
  type: "developer" | "repository";
  /** Raw entity identifier, e.g. "@login" or "owner/repo". */
  id: string;
};

export type SavePoint = {
  at: string;
  label: string;
  kind: "developer" | "repository";
};

const RANGES = [
  { days: 7, label: "7D" },
  { days: 30, label: "30D" },
  { days: 90, label: "90D" },
  { days: 365, label: "1Y" },
] as const;

const W = 680;
const H = 250;
const PAD_L = 30;
const PAD_R = 10;
const PAD_T = 12;
const PAD_B = 28;

const VIEWS_COLOR = "#861f3d";
const SAVES_COLOR = "#b14a67";
const GRID_COLOR = "rgba(23,20,22,.055)";
const GUIDE_COLOR = "rgba(23,20,22,.20)";

type Day = {
  date: Date;
  label: string;
  views: number;
  saves: number;
  viewEvents: string[];
  saveEvents: string[];
};

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function shortLabel(date: Date): string {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

function monthLabel(date: Date): string {
  return new Intl.DateTimeFormat("en", { month: "short" }).format(date);
}

function viewEventLabel(type: ViewPoint["type"], identifier: string): string {
  const clean = identifier.replace(/^@/, "").replace(/^\//, "");
  return type === "developer" ? `@${clean}` : clean;
}

/**
 * Compact factual line chart built only from real DevHub activity:
 * recent views + saved favorites. No invented signals.
 */
export function ActivityChart({
  points,
  saves = [],
}: {
  points: ViewPoint[];
  saves?: SavePoint[];
}) {
  const [days, setDays] = useState<number>(30);
  const [hover, setHover] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const rangeLabel = days === 365 ? "1Y" : `${days}D`;

  const model = useMemo(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    const start = new Date(now);
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const bucket: Day[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      bucket.push({
        date: d,
        label: days === 365 ? monthLabel(d) : shortLabel(d),
        views: 0,
        saves: 0,
        viewEvents: [],
        saveEvents: [],
      });
    }
    const index = new Map<string, number>();
    bucket.forEach((d, i) => {
      if (!index.has(dayKey(d.date))) index.set(dayKey(d.date), i);
    });

    for (const p of points) {
      const t = new Date(p.at).getTime();
      if (Number.isNaN(t)) continue;
      const i = index.get(dayKey(new Date(t)));
      if (i === undefined) continue;
      bucket[i].views += 1;
      if (bucket[i].viewEvents.length < 4) {
        bucket[i].viewEvents.push(viewEventLabel(p.type, p.id));
      }
    }
    for (const s of saves) {
      const t = new Date(s.at).getTime();
      if (Number.isNaN(t)) continue;
      const i = index.get(dayKey(new Date(t)));
      if (i === undefined) continue;
      bucket[i].saves += 1;
      if (bucket[i].saveEvents.length < 4) bucket[i].saveEvents.push(s.label);
    }

    const totalViews = bucket.reduce((sum, d) => sum + d.views, 0);
    const totalSaves = bucket.reduce((sum, d) => sum + d.saves, 0);
    const drawViews = totalViews > 0;
    const drawSaves = totalSaves > 0;

    const peak = Math.max(0, ...bucket.map((d) => Math.max(d.views, d.saves)));
    const step = Math.max(1, Math.ceil(peak / 3));
    const ticks = [0, step, step * 2, step * 3];
    const niceMax = step * 3;

    const plotW = W - PAD_L - PAD_R;
    const plotH = H - PAD_T - PAD_B;
    const x = (i: number) => PAD_L + (days === 1 ? plotW / 2 : (i / (days - 1)) * plotW);
    const y = (v: number) => PAD_T + plotH - (niceMax === 0 ? 0 : (v / niceMax) * plotH);
    const line = (pick: (d: Day) => number) =>
      bucket.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(pick(d)).toFixed(1)}`).join(" ");

    // X tick selection per range.
    const tickIdx: number[] = [];
    if (days === 7) {
      for (let i = 0; i < days; i++) tickIdx.push(i);
    } else if (days === 30) {
      for (let i = 0; i < days; i += 5) tickIdx.push(i);
      if (tickIdx[tickIdx.length - 1] !== days - 1) tickIdx.push(days - 1);
    } else if (days === 90) {
      for (let i = 0; i < days; i += 15) tickIdx.push(i);
      if (tickIdx[tickIdx.length - 1] !== days - 1) tickIdx.push(days - 1);
    } else {
      bucket.forEach((d, i) => {
        if (d.date.getDate() === 1) tickIdx.push(i);
      });
      if (tickIdx.length === 0) tickIdx.push(0);
    }

    return { bucket, totalViews, totalSaves, drawViews, drawSaves, ticks, x, y, line, tickIdx };
  }, [points, saves, days]);

  function onMove(event: React.MouseEvent) {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const svgX = ((event.clientX - rect.left) / rect.width) * W;
    const plotW = W - PAD_L - PAD_R;
    const idx = Math.round(((svgX - PAD_L) / plotW) * (model.bucket.length - 1));
    setHover(Math.max(0, Math.min(model.bucket.length - 1, idx)));
  }

  const hoverDay = hover !== null ? model.bucket[hover] : null;
  const listedEvents = hoverDay
    ? [
        ...hoverDay.viewEvents.slice(0, 3).map((e) => `Viewed ${e}`),
        ...hoverDay.saveEvents.slice(0, 2).map((e) => `Saved ${e}`),
      ].slice(0, 4)
    : [];

  const plotW = W - PAD_L - PAD_R;
  const hoverFracX =
    hover !== null && model.bucket.length > 1
      ? (PAD_L + (hover / (model.bucket.length - 1)) * plotW) / W
      : 0.5;
  const hoverLeftPct = Math.max(14, Math.min(86, hoverFracX * 100));
  const hoverTopValue = hoverDay ? Math.max(hoverDay.views, hoverDay.saves) : 0;
  const hoverTopPx = model.y(hoverTopValue);
  const tipBelow = hoverTopPx < 84;

  return (
    <div className="signal">
      <div className="signal-head">
        <div>
          <h2 id="signal-activity">Signal activity</h2>
          <p>Activity across your recent DevHub research.</p>
        </div>
        <div className="dash-range" role="group" aria-label="Activity range">
          {RANGES.map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => {
                setDays(r.days);
                setHover(null);
              }}
              aria-pressed={days === r.days}
              className={`dash-range-btn${days === r.days ? " is-active" : ""}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="signal-stats" aria-label={`Totals for the last ${rangeLabel}`}>
        <span className="signal-stat">
          <b>{model.totalViews}</b> views
        </span>
        <span className="signal-stat">
          <b>{model.totalSaves}</b> saves
        </span>
        <span className="signal-stat">
          <b>0</b> comparisons
        </span>
        <span className="signal-legend" aria-hidden="true">
          {model.drawViews && (
            <span>
              <i style={{ background: VIEWS_COLOR }} /> Views
            </span>
          )}
          {model.drawSaves && (
            <span>
              <i style={{ background: SAVES_COLOR }} /> Saves
            </span>
          )}
        </span>
      </div>

      <hr className="signal-divider" />

      {model.totalViews + model.totalSaves === 0 ? (
        <div className="signal-empty">
          <strong>No activity in this period.</strong>
          <p>Explore developers and repositories to start building your signal history.</p>
          <Link href="/search" className="dash-empty-link">
            Explore →
          </Link>
        </div>
      ) : (
        <div
          ref={wrapRef}
          className="signal-chart"
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="signal-svg"
            role="img"
            aria-label={`Signal activity, last ${rangeLabel}: ${model.totalViews} views, ${model.totalSaves} saves.`}
          >
            {model.ticks.map((v) => (
              <g key={v}>
                <line
                  x1={PAD_L}
                  x2={W - PAD_R}
                  y1={model.y(v)}
                  y2={model.y(v)}
                  stroke={GRID_COLOR}
                  strokeWidth={1}
                />
                <text x={PAD_L - 7} y={model.y(v) + 3.5} textAnchor="end" className="signal-grid-label">
                  {v}
                </text>
              </g>
            ))}
            {model.drawSaves && (
              <path
                d={model.line((d) => d.saves)}
                fill="none"
                stroke={SAVES_COLOR}
                strokeWidth={1.75}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}
            {model.drawViews && (
              <path
                d={model.line((d) => d.views)}
                fill="none"
                stroke={VIEWS_COLOR}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}
            {model.tickIdx.map((i, n) => (
              <text
                key={i}
                x={model.x(i)}
                y={H - 8}
                textAnchor="middle"
                className={`signal-tick${n % 2 === 1 ? " signal-tick--alt" : ""}`}
              >
                {model.bucket[i]?.label}
              </text>
            ))}
            {hoverDay && hover !== null && (
              <g aria-hidden="true">
                <line
                  x1={model.x(hover)}
                  x2={model.x(hover)}
                  y1={PAD_T}
                  y2={H - PAD_B}
                  stroke={GUIDE_COLOR}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
                {model.drawSaves && (
                  <circle
                    cx={model.x(hover)}
                    cy={model.y(hoverDay.saves)}
                    r={3.5}
                    fill="#ffffff"
                    stroke={SAVES_COLOR}
                    strokeWidth={2}
                  />
                )}
                {model.drawViews && (
                  <circle
                    cx={model.x(hover)}
                    cy={model.y(hoverDay.views)}
                    r={3.5}
                    fill="#ffffff"
                    stroke={VIEWS_COLOR}
                    strokeWidth={2}
                  />
                )}
              </g>
            )}
          </svg>

          {hoverDay && hover !== null && (
            <div
              className="signal-tip"
              aria-hidden="true"
              style={{
                left: `${hoverLeftPct}%`,
                top: tipBelow ? `${((hoverTopPx + 14) / H) * 100}%` : undefined,
                bottom: tipBelow ? undefined : `${((H - hoverTopPx + 14) / H) * 100}%`,
                transform: "translateX(-50%)",
              }}
            >
              <p className="signal-tip-date">{shortLabel(hoverDay.date)}</p>
              <div className="signal-tip-row">
                <span>Views</span>
                <b>{hoverDay.views}</b>
              </div>
              <div className="signal-tip-row">
                <span>Saved</span>
                <b>{hoverDay.saves}</b>
              </div>
              <div className="signal-tip-row">
                <span>Compared</span>
                <b>0</b>
              </div>
              {listedEvents.length > 0 && (
                <div className="signal-tip-events">
                  {listedEvents.map((e) => (
                    <span key={e}>{e}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
