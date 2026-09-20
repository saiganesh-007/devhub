"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftRight, LoaderCircle, RotateCcw, GitCommit, Tag, CalendarDays } from "lucide-react";
import type { GitHubRepo, GitHubUser, Contributor } from "@/types/github";
import { compactNumber, formatDate, summarizeRepositories, languagePercentages } from "@/lib/analytics";
import { Tabs, TextInput } from "@/components/ui";
import { RepoLanguageChart } from "@/components/repo-language-chart";
import { LanguageChart } from "@/components/language-chart";

type CompareType = "developer" | "repository";
type DevData = { user: GitHubUser; repositories: GitHubRepo[] };
type RepoData = {
  repository: GitHubRepo;
  contributors: Contributor[];
  languages: Record<string, number>;
};

const emptyResult: [DevData | RepoData, DevData | RepoData] | null = null;

export function CompareExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [type, setType] = useState<CompareType>("developer");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [data, setData] = useState<[DevData | RepoData, DevData | RepoData] | null>(emptyResult);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const ownUrl = useRef("");
  const lastRan = useRef("");
  const isInitialRender = useRef(true);

  const syncUrl = useCallback((t: CompareType, sideA: string, sideB: string) => {
    const cleanA = sideA.trim();
    const cleanB = sideB.trim();
    if (!cleanA && !cleanB) {
      ownUrl.current = "";
      router.replace("/compare", { scroll: false });
      return;
    }
    const query = new URLSearchParams({ type: t });
    if (cleanA) query.set("a", cleanA);
    if (cleanB) query.set("b", cleanB);
    const qs = query.toString();
    ownUrl.current = qs;
    router.replace(`/compare?${qs}`, { scroll: false });
  }, [router]);

  const runWith = useCallback(async (t: CompareType, sideA: string, sideB: string, force: boolean) => {
    const signature = `${t}|${sideA.trim()}|${sideB.trim()}`;
    if (!force && lastRan.current === signature) return;
    lastRan.current = signature;
    setLoading(true);
    setError("");
    setData(emptyResult);
    try {
      const paths = [sideA.trim(), sideB.trim()].map((value) =>
        t === "developer"
          ? `/api/github/users/${encodeURIComponent(value)}`
          : (() => {
              const [o, r] = value.split("/");
              return `/api/github/repositories/${encodeURIComponent(o || "")}/${encodeURIComponent(r || "")}`;
            })(),
      );
      const result = await Promise.all(
        paths.map(async (path) => {
          const res = await fetch(path);
          const body = await res.json();
          if (!res.ok)
            throw new Error(body.error?.message || "Comparison failed");
          return body.data as DevData | RepoData;
        }),
      );
      setData(result as [DevData | RepoData, DevData | RepoData]);
      syncUrl(t, sideA, sideB);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Comparison failed");
    } finally {
      setLoading(false);
    }
  }, [syncUrl]);

  useEffect(() => {
    let cancelled = false;
    const initial = isInitialRender.current;
    isInitialRender.current = false;
    const fromOwnWrite = !initial && ownUrl.current === searchParams.toString();
    ownUrl.current = "";
    const nextType: CompareType =
      searchParams.get("type") === "repository" ? "repository" : "developer";
    const nextA = searchParams.get("a") ?? "";
    const nextB = searchParams.get("b") ?? "";

    queueMicrotask(() => {
      if (cancelled) return;
      setType(nextType);
      setA(nextA);
      setB(nextB);
      if (fromOwnWrite) return;
      if (nextA.trim() && nextB.trim()) {
        void runWith(nextType, nextA, nextB, false);
      } else {
        setData(emptyResult);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [searchParams, runWith]);

  function run() {
    void runWith(type, a, b, true);
  }

  function clear() {
    setA("");
    setB("");
    setData(emptyResult);
    setError("");
    lastRan.current = "";
    syncUrl(type, "", "");
  }

  function swap() {
    setA(b);
    setB(a);
    setData(emptyResult);
    setError("");
    syncUrl(type, b, a);
  }

  function switchType(next: CompareType) {
    setType(next);
    setData(emptyResult);
    setError("");
    syncUrl(next, a, b);
  }

  return (
    <div className="compare-workbench">
      <Tabs
        label="Comparison type"
        value={type}
        onChange={switchType}
        options={[
          { value: "developer", label: "Developers" },
          { value: "repository", label: "Repositories" },
        ]}
      />

      <div className="mt-6 grid items-end gap-3 md:grid-cols-[1fr_auto_1fr]">
        <TextInput
          label={`First ${type}`}
          value={a}
          onChange={setA}
          autoComplete="off"
          spellCheck={false}
          placeholder={type === "developer" ? "torvalds" : "facebook/react"}
        />

        <div className="flex items-center justify-center gap-2 pb-2">
          <button
            type="button"
            onClick={swap}
            aria-label="Swap sides"
            className="btn-icon"
          >
            <ArrowLeftRight size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={clear}
            aria-label="Reset comparison"
            className="btn-icon"
          >
            <RotateCcw size={15} aria-hidden="true" />
          </button>
        </div>

        <TextInput
          label={`Second ${type}`}
          value={b}
          onChange={setB}
          autoComplete="off"
          spellCheck={false}
          placeholder={type === "developer" ? "gaearon" : "vuejs/core"}
        />
      </div>

      <button
        type="button"
        onClick={run}
        disabled={loading || !a.trim() || !b.trim()}
        className="btn btn-primary mt-5 w-full sm:w-auto"
      >
        {loading && <LoaderCircle size={15} className="animate-spin" />}
        {loading ? "Comparing signals…" : "Compare"}
      </button>

      {error && (
        <p className="mt-4 rounded-xl border border-err/30 bg-err/5 px-4 py-3 text-sm text-err" role="alert">
          {error}
        </p>
      )}

      {!data && !loading && !error && <div className="comparison-empty"><span className="text-metadata">Two perspectives. One view.</span><h2>Add two {type === "developer" ? "developers" : "repositories"} to begin.</h2><p>Align public metrics, technology, and activity. Use the differences to inform your own judgment.</p></div>}
      {loading && <div className="comparison-loading" role="status" aria-label="Loading comparison"><div className="skeleton h-48" /><div className="skeleton h-48" /></div>}
      {data && !loading && (
        <Results type={type} data={data} onRun={run} onSwap={swap} />
      )}
    </div>
  );
}

function Results({
  type,
  data,
  onRun,
  onSwap,
}: {
  type: CompareType;
  data: [DevData | RepoData, DevData | RepoData];
  onRun: () => void;
  onSwap: () => void;
}) {
  if (type === "developer") {
    const [first, second] = data as [DevData, DevData];
    const sa = summarizeRepositories(first.repositories);
    const sb = summarizeRepositories(second.repositories);
    const langA = languagePercentages(
      first.repositories.reduce<Record<string, number>>((acc, repo) => {
        if (repo.language) acc[repo.language] = (acc[repo.language] || 0) + (repo.size || 0);
        return acc;
      }, {}),
    );
    const langB = languagePercentages(
      second.repositories.reduce<Record<string, number>>((acc, repo) => {
        if (repo.language) acc[repo.language] = (acc[repo.language] || 0) + (repo.size || 0);
        return acc;
      }, {}),
    );

    return (
      <div className="mt-10 space-y-10">
        <div className="grid gap-6 md:grid-cols-2">
          {([
            [first, sa, langA, "A"],
            [second, sb, langB, "B"],
          ] as const).map(([entry, summary, langs, sideLabel]) => {
            const d = entry;
            const s = summary;
            return (
              <CompareCard key={d.user.login} side={sideLabel} onRefresh={onRun} onSwap={onSwap}>
                <CardHeader
                  title={d.user.name || d.user.login}
                  subtitle={`@${d.user.login}`}
                  avatar={d.user.avatar_url}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Metric label="Followers" value={compactNumber(d.user.followers || 0)} />
                  <Metric label="Following" value={compactNumber(d.user.following || 0)} />
                  <Metric label="Repositories" value={d.user.public_repos || 0} />
                  <Metric label="Total Stars" value={compactNumber(s.totalStars)} />
                  <Metric label="Total Forks" value={compactNumber(s.totalForks)} />
                  <Metric label="Joined" value={formatDate(d.user.created_at)} />
                </div>
                <FooterRow>
                  Primary language: <b>{s.languages[0]?.name || "—"}</b>
                </FooterRow>
                {langs.length > 0 && (
                  <div className="mt-6">
                    <p className="text-metadata mb-3">Language Distribution</p>
                    <LanguageChart data={langs} />
                  </div>
                )}
              </CompareCard>
            );
          })}
        </div>
        <p className="text-xs text-ink3 text-center">
          Both profiles reflect live GitHub data. DevHub never declares a winner —
          keep the judgment human.
        </p>
      </div>
    );
  }

  const [first, second] = data as [RepoData, RepoData];
  const langDistA = Object.entries(first.languages)
    .map(([name, bytes]) => ({ name, bytes, value: 0 }))
    .sort((a, b) => b.bytes - a.bytes);
  const totalA = langDistA.reduce((sum, d) => sum + d.bytes, 0);
  const langDistAWithPct = langDistA.map((d) => ({
    ...d,
    value: totalA > 0 ? Math.round((d.bytes / totalA) * 1000) / 10 : 0,
  }));

  const langDistB = Object.entries(second.languages)
    .map(([name, bytes]) => ({ name, bytes, value: 0 }))
    .sort((a, b) => b.bytes - a.bytes);
  const totalB = langDistB.reduce((sum, d) => sum + d.bytes, 0);
  const langDistBWithPct = langDistB.map((d) => ({
    ...d,
    value: totalB > 0 ? Math.round((d.bytes / totalB) * 1000) / 10 : 0,
  }));


  return (
    <div className="mt-10 space-y-10">
      <div className="grid gap-6 md:grid-cols-2">
        {[first, second].map((d, idx) => (
          <CompareCard
            key={d.repository.full_name}
            side={idx === 0 ? "A" : "B"}
            onRefresh={onRun}
            onSwap={onSwap}
          >
            <CardHeader
              title={d.repository.full_name ?? d.repository.name}
              subtitle={d.repository.description ?? ""}
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Metric label="Stars" value={compactNumber(d.repository.stargazers_count)} />
              <Metric label="Forks" value={compactNumber(d.repository.forks_count)} />
              <Metric label="Watchers" value={compactNumber(d.repository.watchers_count || 0)} />
              <Metric label="Issues" value={compactNumber(d.repository.open_issues_count || 0)} />
              <Metric label="Contributors" value={d.contributors.length} />
              <Metric label="Size" value={`${compactNumber(d.repository.size || 0)} KB`} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ink3">
              {d.repository.language && (
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded bg-brand1" />
                  {d.repository.language}
                </span>
              )}
              {d.repository.license && (
                <span className="flex items-center gap-1">
                  <Tag size={12} />
                  {d.repository.license.name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <CalendarDays size={12} />
                Updated {formatDate(d.repository.updated_at)}
              </span>
              <span className="flex items-center gap-1">
                <GitCommit size={12} />
                {d.repository.default_branch}
              </span>
            </div>
            {langDistAWithPct.length > 0 && idx === 0 && (
              <div className="mt-6">
                <p className="text-metadata mb-3">Language Distribution</p>
                <RepoLanguageChart data={langDistAWithPct} />
              </div>
            )}
            {langDistBWithPct.length > 0 && idx === 1 && (
              <div className="mt-6">
                <p className="text-metadata mb-3">Language Distribution</p>
                <RepoLanguageChart data={langDistBWithPct} />
              </div>
            )}
          </CompareCard>
        ))}
      </div>

      <section>
        <h2 className="text-section-title mb-4">Metric Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="pb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink3 w-48">Metric</th>
                <th className="pb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink3 text-right">Side A</th>
                <th className="pb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink3 text-right pl-8">Side B</th>
                <th className="pb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink3 text-right pl-8">Difference</th>
              </tr>
            </thead>
            <tbody>
              <ComparisonRow
                label="Stars"
                a={first.repository.stargazers_count}
                b={second.repository.stargazers_count}
              />
              <ComparisonRow
                label="Forks"
                a={first.repository.forks_count}
                b={second.repository.forks_count}
              />
              <ComparisonRow
                label="Watchers"
                a={first.repository.watchers_count || 0}
                b={second.repository.watchers_count || 0}
              />
              <ComparisonRow
                label="Open Issues"
                a={first.repository.open_issues_count || 0}
                b={second.repository.open_issues_count || 0}
              />
              <ComparisonRow
                label="Contributors"
                a={first.contributors.length}
                b={second.contributors.length}
              />
              <ComparisonRow
                label="Size (KB)"
                a={first.repository.size || 0}
                b={second.repository.size || 0}
              />
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-ink3 text-center">
        Factual GitHub metrics, side by side. DevHub never declares a winner.
      </p>
    </div>
  );
}

function ComparisonRow({ label, a, b }: { label: string; a: number; b: number }) {
  const diff = a - b;
  const diffPct = a !== 0 ? Math.round((diff / a) * 100) : 0;
  return (
    <tr className="border-b border-line/50">
      <td className="py-3 font-medium text-ink">{label}</td>
      <td className="py-3 font-mono tabular-nums text-ink text-right">{compactNumber(a)}</td>
      <td className="py-3 font-mono tabular-nums text-ink text-right pl-8">{compactNumber(b)}</td>
      <td className="py-3 font-mono tabular-nums text-right pl-8">
        <span className="text-ink2">
          {diff >= 0 ? "+" : ""}{compactNumber(diff)} ({diffPct >= 0 ? "+" : ""}{diffPct}%)
        </span>
      </td>
    </tr>
  );
}

function CompareCard({
  children,
  side,
  onRefresh,
  onSwap,
}: {
  children: React.ReactNode;
  side: "A" | "B";
  onRefresh: () => void;
  onSwap: () => void;
}) {
  return (
    <section className="compare-column card-surface p-6">
      <div className="mb-5 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink3">
          Side {side}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onSwap}
            aria-label="Swap this side with the other"
            className="btn-icon"
          >
            <ArrowLeftRight size={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onRefresh}
            aria-label="Refresh this comparison"
            className="btn-icon"
          >
            <RotateCcw size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
      {children}
    </section>
  );
}

function CardHeader({ title, subtitle, avatar }: { title: string; subtitle: string; avatar?: string }) {
  return (
    <div className="mb-6">
      {avatar && (
        <div className="mb-4">
          <Image
            src={avatar}
            alt=""
            width={80}
            height={80}
            className="size-20 rounded-2xl ring-1 ring-line object-cover"
          />
        </div>
      )}
      <h3 className="text-xl font-semibold tracking-tight text-ink">{title}</h3>
      {subtitle && <p className="mt-1 truncate text-sm text-ink3">{subtitle}</p>}
    </div>
  );
}

const Metric = ({ label, value }: { label: string; value: string | number }) => (
  <div className="card-surface card-surface--metric p-4">
    <p className="text-metadata">{label}</p>
    <p className="text-statistic mt-1">{value}</p>
  </div>
);

const FooterRow = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-4 text-sm text-ink3">{children}</p>
);
