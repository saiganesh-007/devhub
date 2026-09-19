import { Suspense } from "react";
import type { Metadata } from "next";
import { AppShell, RateBadge } from "@/components/shell";
import { PageHeader } from "@/components/ui";
import { CompareExperience } from "@/components/compare-experience";

export const metadata: Metadata = { title: "Compare" };

export default function ComparePage() {
  return (
    <AppShell section="Compare">
      <div className="space-y-5">
        <RateBadge />
        <PageHeader
          title="Compare the signals."
          description="Side-by-side factual GitHub metrics. DevHub never declares a winner or invents a quality score."
        />
      </div>
      <div className="mt-10">
        <Suspense fallback={<div className="skeleton h-40" />}>
          <CompareExperience />
        </Suspense>
      </div>
    </AppShell>
  );
}