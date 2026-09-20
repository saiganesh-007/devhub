const fs = require("fs");
const path = require("path");

const root = process.cwd();

const files = [
  "src/components/ui.tsx",
  "src/components/compare-experience.tsx",
  "src/components/language-chart.tsx",
  "src/components/repo-language-chart.tsx",
  "src/components/repository-content.tsx",
];

const backupDir = path.join(
  root,
  "merge-fix-backup-" + Date.now()
);

fs.mkdirSync(backupDir, { recursive: true });

for (const relative of files) {
  const src = path.join(root, relative);

  if (!fs.existsSync(src)) {
    throw new Error("Missing file: " + relative);
  }

  fs.copyFileSync(
    src,
    path.join(backupDir, path.basename(relative))
  );
}

console.log("Backup created:", backupDir);

function read(relative) {
  return fs
    .readFileSync(path.join(root, relative), "utf8")
    .replace(/\r\n/g, "\n");
}

function write(relative, text) {
  fs.writeFileSync(
    path.join(root, relative),
    text,
    "utf8"
  );
}

/* =========================================================
   1. ui.tsx
   ExternalLink must support className
   ========================================================= */

{
  const file = "src/components/ui.tsx";
  let text = read(file);

  const startMarker =
    "export function ExternalLink({";

  const endMarker =
    "export function Empty({";

  const start = text.indexOf(startMarker);
  const end = text.indexOf(endMarker);

  if (start === -1 || end === -1 || end <= start) {
    throw new Error(
      "Could not find ExternalLink in ui.tsx"
    );
  }

  const replacement = `export function ExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex items-center gap-1 text-ink2 transition-colors hover:text-brand1",
        className,
      )}
    >
      {children}
      <ArrowUpRight size={14} aria-hidden="true" />
    </a>
  );
}

`;

  text =
    text.slice(0, start) +
    replacement +
    text.slice(end);

  write(file, text);

  console.log("Fixed:", file);
}

/* =========================================================
   2. compare-experience.tsx
   Fix tuple type inference
   ========================================================= */

{
  const file =
    "src/components/compare-experience.tsx";

  let text = read(file);

  const oldBlock = `          {[
            [first, sa, langA, "A"],
            [second, sb, langB, "B"],
          ].map(([entry, summary, langs, sideLabel]) => {`;

  const newBlock = `          {([
            [first, sa, langA, "A"],
            [second, sb, langB, "B"],
          ] as const).map(([entry, summary, langs, sideLabel]) => {`;

  if (!text.includes(oldBlock)) {
    throw new Error(
      "Could not find developer comparison map"
    );
  }

  text = text.replace(oldBlock, newBlock);

  text = text.replace(
    "            const d = entry as DevData;",
    "            const d = entry;"
  );

  text = text.replace(
    "            const s = summary as ReturnType<typeof summarizeRepositories>;",
    "            const s = summary;"
  );

  write(file, text);

  console.log("Fixed:", file);
}

/* =========================================================
   3. Recharts label typing
   ========================================================= */

const chartFiles = [
  "src/components/language-chart.tsx",
  "src/components/repo-language-chart.tsx",
];

for (const file of chartFiles) {
  let text = read(file);

  if (!text.includes("PieLabelRenderProps")) {
    if (text.includes('"use client";')) {
      text = text.replace(
        '"use client";',
        '"use client";\n\nimport type { PieLabelRenderProps } from "recharts";'
      );
    } else {
      text =
        'import type { PieLabelRenderProps } from "recharts";\n' +
        text;
    }
  }

  const labelRegex =
    /  const renderCustomizedLabel = [\s\S]*?\n  };\n\n(?=  return \()/;

  const replacement = `  const renderCustomizedLabel = (
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

`;

  if (!labelRegex.test(text)) {
    throw new Error(
      "Could not find chart label function in " +
        file
    );
  }

  text = text.replace(
    labelRegex,
    replacement
  );

  write(file, text);

  console.log("Fixed:", file);
}

/* =========================================================
   4. repository-content.tsx
   ========================================================= */

{
  const file =
    "src/components/repository-content.tsx";

  let text = read(file);

  // Missing React hook
  if (
    !text.includes(
      'import { useState } from "react";'
    )
  ) {
    text = text.replace(
      'import Image from "next/image";',
      'import Image from "next/image";\nimport { useState } from "react";'
    );
  }

  // Missing Repository field
  if (
    !text.includes("  visibility?: string;")
  ) {
    text = text.replace(
      "  description?: string | null;",
      "  description?: string | null;\n  visibility?: string;"
    );
  }

  // Fix breadcrumb
  text = text.replace(
    '{repository.owner?.login || "unknown"} / repository',
    '{repository.owner?.login || "unknown"} / {repository.name}'
  );

  // Optional string fields need safe fallbacks.
  // These fix props expecting a definite string.

  if (
    !text.includes(
      "(repository.full_name ?? repository.name)"
    )
  ) {
    text = text.replaceAll(
      "repository.full_name",
      "(repository.full_name ?? repository.name)"
    );
  }

  if (
    !text.includes(
      '(repository.html_url ?? "#")'
    )
  ) {
    text = text.replaceAll(
      "repository.html_url",
      '(repository.html_url ?? "#")'
    );
  }

  if (
    !text.includes(
      '(repository.owner?.avatar_url ?? "/brand/devhub-logo.png")'
    )
  ) {
    text = text.replaceAll(
      "repository.owner?.avatar_url",
      '(repository.owner?.avatar_url ?? "/brand/devhub-logo.png")'
    );
  }

  if (
    !text.includes(
      '(repository.owner?.html_url ?? "#")'
    )
  ) {
    text = text.replaceAll(
      "repository.owner?.html_url",
      '(repository.owner?.html_url ?? "#")'
    );
  }

  if (
    !text.includes(
      '(repository.owner?.login ?? "unknown")'
    )
  ) {
    text = text.replaceAll(
      "repository.owner?.login",
      '(repository.owner?.login ?? "unknown")'
    );
  }

  if (
    !text.includes(
      '(repository.default_branch ?? "main")'
    )
  ) {
    text = text.replaceAll(
      "repository.default_branch",
      '(repository.default_branch ?? "main")'
    );
  }

  if (
    !text.includes(
      "(repository.created_at ?? repository.updated_at)"
    )
  ) {
    text = text.replaceAll(
      "repository.created_at",
      "(repository.created_at ?? repository.updated_at)"
    );
  }

  if (
    !text.includes(
      "(repository.pushed_at ?? repository.updated_at)"
    )
  ) {
    text = text.replaceAll(
      "repository.pushed_at",
      "(repository.pushed_at ?? repository.updated_at)"
    );
  }

  write(file, text);

  console.log("Fixed:", file);
}

console.log("");
console.log("==============================");
console.log("DevHub product merge patched.");
console.log("==============================");
console.log("");
