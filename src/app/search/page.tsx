import { Suspense } from "react";
import type { Metadata } from "next";
import { AppShell, RateBadge } from "@/components/shell";
import { PageHeader } from "@/components/ui";
import { SearchExperience } from "@/components/search-experience";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <AppShell section="Search">
      <div className="mb-10 space-y-5">
        <RateBadge />
        <PageHeader
          title="Search the open-source world."
          description="Find developers and repositories, then inspect what the numbers mean."
        />
      </div>
      <Suspense fallback={<div className="skeleton h-40" />}>
        <SearchExperience />
      </Suspense>
    </AppShell>
  );
}