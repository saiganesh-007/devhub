"use client";

import Image from "next/image";
import { useState } from "react";
import { BookOpen, ExternalLink as ExternalLinkIcon, GitCommit, Tag } from "lucide-react";
import { Button, Card, ExternalLink, Metric, SectionTitle, Tabs } from "@/components/ui";
import { SaveButton } from "@/components/save-button";
import { compactNumber, formatDate } from "@/lib/analytics";
import { RepoLanguageChart } from "@/components/repo-language-chart";

interface Repository {
  id?: number;
  name: string;
  full_name?: string;
  owner?: { login: string; avatar_url: string; html_url: string };
  html_url?: string;
  description?: string | null;
  visibility?: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count?: number;
  open_issues_count?: number;
  subscribers_count?: number;
  language: string | null;
  license?: { name: string } | null;
  default_branch?: string;
  size?: number;
  created_at?: string;
  updated_at: string;
  pushed_at?: string;
  topics?: string[];
}

interface Contributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

interface CommitActivity {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: { name: string; date: string };
  };
  author: { login: string; avatar_url: string; html_url: string } | null;
}

interface Props {
  repository: Repository;
  languages: Record<string, number>;
  contributors: Contributor[];
  activity: CommitActivity[];
}

export function RepositoryContent({ repository, languages, contributors, activity }: Props) {
  const distribution = Object.entries(languages)
    .map(([name, bytes]) => ({ name, bytes, value: 0 }))
    .sort((a, b) => b.bytes - a.bytes);
  
  const totalBytes = distribution.reduce((sum, d) => sum + d.bytes, 0);
  const distributionWithPct = distribution.map((d) => ({
    ...d,
    value: totalBytes > 0 ? Math.round((d.bytes / totalBytes) * 1000) / 10 : 0,
  }));

  const [activeTab, setActiveTab] = useState<"overview" | "languages" | "contributors" | "activity">("overview");

  return (
    <div className="repository-report">
      {/* Repository Header */}
      <div className="repository-hero mt-5 flex flex-col gap-6 border-b border-line pb-12 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1 min-w-0">
          <p className="font-mono text-xs text-ink3">{(repository.owner?.login ?? "unknown") || "unknown"} / {repository.name}</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-.04em] text-ink">{repository.name}</h1>
          {repository.description && (
            <p className="mt-4 max-w-3xl text-base leading-7 text-ink2">{repository.description}</p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-ink3">
            {repository.visibility && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-line bg-panel font-mono text-[10px]">
                {repository.visibility === "private" ? "🔒" : "🌐"} {repository.visibility}
              </span>
            )}
            {(repository.default_branch ?? "main") && (
              <span className="flex items-center gap-1.5 font-mono text-[10px]">
                <Tag size={12} />
                {(repository.default_branch ?? "main")}
              </span>
            )}
            <span className="flex items-center gap-1.5 font-mono text-[10px]">
              <BookOpen size={12} />
              {compactNumber(repository.size || 0)} KB
            </span>
            {repository.license && (
              <span className="flex items-center gap-1.5 font-mono text-[10px]">
                ⚖ {repository.license.name}
              </span>
            )}
            <ExternalLink href={(repository.html_url ?? "#")} className="flex items-center gap-1.5">
              <ExternalLinkIcon size={14} />
              View on GitHub
            </ExternalLink>
          </div>

          {repository.topics && repository.topics.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {repository.topics.slice(0, 8).map((topic) => (
                <span key={topic} className="border border-line px-2.5 py-1 font-mono text-[9px] text-ink3">
                  {topic}
                </span>
              ))}
              {repository.topics.length > 8 && (
                <span className="font-mono text-[9px] text-ink3">+{repository.topics.length - 8}</span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 lg:flex-row">
          <SaveButton
            kind="repositories"
            payload={{
              github_repo_id: repository.id || 0,
              owner: (repository.owner?.login ?? "unknown") || "",
              repo_name: repository.name,
              full_name: (repository.full_name ?? repository.name) || `${(repository.owner?.login ?? "unknown")}/${repository.name}`,
              description: repository.description,
              stars: repository.stargazers_count,
              language: repository.language,
            }}
          />
          <Button
            href={`/compare?type=repository&a=${(repository.owner?.login ?? "unknown")}/${repository.name}`}
            variant="secondary"
          >
            Compare
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="signal-strip mt-10 grid grid-cols-2 border-y border-line py-6 md:grid-cols-3 lg:grid-cols-6">
        <Metric label="Stars" value={compactNumber(repository.stargazers_count)} />
        <Metric label="Forks" value={compactNumber(repository.forks_count)} />
        <Metric label="Watchers" value={repository.subscribers_count == null ? "—" : compactNumber(repository.subscribers_count)} />
        <Metric label="Issues" value={compactNumber(repository.open_issues_count || 0)} />
        <Metric label="Size" value={`${compactNumber(repository.size || 0)} KB`} />
        <Metric label="License" value={repository.license?.name || "—"} />
      </div>

      {/* Tabs Navigation */}
      <Tabs
        label="Repository sections"
        value={activeTab}
        onChange={setActiveTab}
        options={[
          { value: "overview", label: "Overview" },
          { value: "languages", label: "Languages" },
          { value: "contributors", label: "Contributors" },
          { value: "activity", label: "Activity" },
        ]}
        className="mt-10 mb-6"
      />

      {/* Tab Panels */}
      <div className="space-y-10">
        {/* Overview Tab */}
        <section id="overview" hidden={activeTab !== "overview"}>
          <SectionTitle eyebrow="Repository Intelligence" title="Overview" />
          <div className="repository-overview grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,.7fr)]">
            <Card variant="repository">
              <div className="space-y-4">
                <div>
                  <p className="text-metadata">Primary Language</p>
                  <p className="text-statistic mt-1 text-base">{repository.language || "—"}</p>
                </div>
                <div>
                  <p className="text-metadata">Default Branch</p>
                  <p className="text-statistic mt-1 text-base font-mono">{(repository.default_branch ?? "main") || "—"}</p>
                </div>
                <div>
                  <p className="text-metadata">Created</p>
                  <p className="text-statistic mt-1 text-base">{formatDate((repository.created_at ?? repository.updated_at))}</p>
                </div>
                <div>
                  <p className="text-metadata">Last Updated</p>
                  <p className="text-statistic mt-1 text-base">{formatDate(repository.updated_at)}</p>
                </div>
                <div>
                  <p className="text-metadata">Last Pushed</p>
                  <p className="text-statistic mt-1 text-base">{formatDate((repository.pushed_at ?? repository.updated_at))}</p>
                </div>
              </div>
            </Card>

            <Card variant="repository">
              <p className="text-metadata mb-4">Topics</p>
              {repository.topics && repository.topics.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {repository.topics.map((topic) => (
                    <span
                      key={topic}
                      className="border border-line px-3 py-1 rounded-full font-mono text-[10px] text-ink3"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-ink3">No topics assigned.</p>
              )}
            </Card>
          </div>
        </section>

        {/* Languages Tab */}
        <section id="languages" hidden={activeTab !== "languages"}>
          <SectionTitle eyebrow="Language Analytics" title="Technology Composition" />
          <Card variant="repository">
            {distributionWithPct.length > 0 ? (
              <RepoLanguageChart data={distributionWithPct} />
            ) : (
              <div className="text-center py-12">
                <p className="text-ink3">No language data available for this repository.</p>
              </div>
            )}
          </Card>
        </section>

        {/* Contributors Tab */}
        <section id="contributors" hidden={activeTab !== "contributors"}>
          <SectionTitle eyebrow="Contributors" title="Core Contributors" action={
            contributors.length > 9 && (
              <ExternalLink
                href={(repository.html_url ?? "#") || `https://github.com/${(repository.owner?.login ?? "unknown")}/${repository.name}`}
                className="text-sm"
              >
                View all {contributors.length} on GitHub
              </ExternalLink>
          )} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {contributors.slice(0, 15).map((person) => (
              <article key={person.login} className="card-surface p-4 text-center hover:border-brand1/30 transition-colors">
                <a href={person.html_url} target="_blank" rel="noreferrer" className="block">
                  <Image
                    src={person.avatar_url}
                    alt=""
                    width={48}
                    height={48}
                    className="mx-auto size-12 rounded-full border border-line"
                  />
                  <p className="mt-3 truncate font-medium text-ink">{person.login}</p>
                  <p className="mt-1 font-mono text-[10px] text-ink3">
                    {compactNumber(person.contributions)} contributions
                  </p>
                </a>
              </article>
            ))}
            {contributors.length === 0 && (
              <div className="col-span-full card-surface card-surface--empty py-12">
                <p className="text-body-secondary">No contributor data available.</p>
              </div>
            )}
          </div>
        </section>

        {/* Activity Tab */}
        <section id="activity" hidden={activeTab !== "activity"}>
          <SectionTitle eyebrow="Activity" title="Recent Commits" action={
            <ExternalLink href={(repository.html_url ?? "#") || `https://github.com/${(repository.owner?.login ?? "unknown")}/${repository.name}`}>
              View on GitHub
            </ExternalLink>
          } />
          <div className="border border-line rounded-2xl overflow-hidden">
            {activity.length > 0 ? (
              activity.map((item) => (
                <a
                  key={item.sha}
                  href={item.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 border-b border-line last:border-0 p-4 hover:bg-panel-hover transition-colors"
                >
                  <GitCommit size={18} className="text-brand1 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink">
                      {item.commit.message.split("\n")[0]}
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-ink3">
                      {item.commit.author.name} · {formatDate(item.commit.author.date)}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-ink3 shrink-0">
                    {item.sha.slice(0, 7)}
                  </span>
                </a>
              ))
            ) : (
              <div className="card-surface card-surface--empty py-12 text-center">
                <p className="text-body-secondary">No recent commit activity.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
