"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Node {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

interface Edge {
  from: number;
  to: number;
}

// Fixed deterministic layout for consistent, quiet graph structure
const INITIAL_NODES: Node[] = [
  { id: 0, x: 8, y: 22, vx: 0, vy: 0, r: 2.5 },
  { id: 1, x: 18, y: 48, vx: 0, vy: 0, r: 2 },
  { id: 2, x: 26, y: 15, vx: 0, vy: 0, r: 3 },
  { id: 3, x: 38, y: 35, vx: 0, vy: 0, r: 2 },
  { id: 4, x: 50, y: 12, vx: 0, vy: 0, r: 3 },
  { id: 5, x: 62, y: 40, vx: 0, vy: 0, r: 2.5 },
  { id: 6, x: 74, y: 20, vx: 0, vy: 0, r: 3 },
  { id: 7, x: 84, y: 55, vx: 0, vy: 0, r: 2 },
  { id: 8, x: 92, y: 28, vx: 0, vy: 0, r: 2.5 },
  { id: 9, x: 14, y: 82, vx: 0, vy: 0, r: 2 },
  { id: 10, x: 32, y: 72, vx: 0, vy: 0, r: 2.5 },
  { id: 11, x: 48, y: 88, vx: 0, vy: 0, r: 2 },
  { id: 12, x: 68, y: 78, vx: 0, vy: 0, r: 2.5 },
  { id: 13, x: 88, y: 82, vx: 0, vy: 0, r: 2 },
];

const EDGES: Edge[] = [
  { from: 0, to: 1 },
  { from: 0, to: 2 },
  { from: 1, to: 3 },
  { from: 2, to: 3 },
  { from: 2, to: 4 },
  { from: 3, to: 5 },
  { from: 4, to: 5 },
  { from: 4, to: 6 },
  { from: 5, to: 6 },
  { from: 6, to: 7 },
  { from: 6, to: 8 },
  { from: 7, to: 8 },
  { from: 1, to: 9 },
  { from: 9, to: 10 },
  { from: 3, to: 10 },
  { from: 10, to: 11 },
  { from: 5, to: 12 },
  { from: 11, to: 12 },
  { from: 7, to: 13 },
  { from: 12, to: 13 },
];

export function SignalNetworkBg() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offsets, setOffsets] = useState<{ dx: number; dy: number }[]>(
    INITIAL_NODES.map(() => ({ dx: 0, dy: 0 })),
  );

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Mouse coordinates in percentage (0 to 100)
    const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
    const mouseY = ((e.clientY - rect.top) / rect.height) * 100;

    const nextOffsets = INITIAL_NODES.map((node) => {
      const dist = Math.hypot(node.x - mouseX, node.y - mouseY);
      // Only react if within ~30% distance
      if (dist < 30) {
        const factor = (1 - dist / 30) * 2.2; // max ~2.2px shift
        const angle = Math.atan2(node.y - mouseY, node.x - mouseX);
        return {
          dx: Math.cos(angle) * factor,
          dy: Math.sin(angle) * factor,
        };
      }
      return { dx: 0, dy: 0 };
    });

    setOffsets(nextOffsets);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setOffsets(INITIAL_NODES.map(() => ({ dx: 0, dy: 0 })));
  }, []);

  useEffect(() => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    parent.addEventListener("mousemove", handleMouseMove);
    parent.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      parent.removeEventListener("mousemove", handleMouseMove);
      parent.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 select-none overflow-hidden"
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full opacity-[0.045]"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Graph edges */}
        {EDGES.map((edge, i) => {
          const n1 = INITIAL_NODES[edge.from];
          const n2 = INITIAL_NODES[edge.to];
          const o1 = offsets[edge.from] || { dx: 0, dy: 0 };
          const o2 = offsets[edge.to] || { dx: 0, dy: 0 };
          return (
            <line
              key={`edge-${i}`}
              x1={`${n1.x + o1.dx}%`}
              y1={`${n1.y + o1.dy}%`}
              x2={`${n2.x + o2.dx}%`}
              y2={`${n2.y + o2.dy}%`}
              stroke="var(--brand, #861f3d)"
              strokeWidth="0.35"
              strokeDasharray="1.5 1"
            />
          );
        })}

        {/* Graph nodes */}
        {INITIAL_NODES.map((node, i) => {
          const off = offsets[i] || { dx: 0, dy: 0 };
          return (
            <g key={`node-${node.id}`}>
              <circle
                cx={`${node.x + off.dx}%`}
                cy={`${node.y + off.dy}%`}
                r={node.r * 0.4}
                fill="var(--brand, #861f3d)"
              />
              <circle
                cx={`${node.x + off.dx}%`}
                cy={`${node.y + off.dy}%`}
                r={node.r * 0.8}
                fill="none"
                stroke="var(--brand, #861f3d)"
                strokeWidth="0.25"
                opacity="0.6"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
