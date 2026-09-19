"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftRight, LoaderCircle, RotateCcw } from "lucide-react";
import type { GitHubRepo, GitHubUser } from "@/types/github";
import { compactNumber, summarizeRepositories } from "@/lib/analytics";
import { Tabs, TextInput } from "@/components/ui";

type CompareType = "developer" | "repository";
type DevData = { user: GitHubUser; repositories: GitHubRepo[] };
type RepoData = {
  repository: GitHubRepo;
  contributors: unknown[];
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

  function syncUrl(t: CompareType, sideA: string, sideB: string) {
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
  }

  async function runWith(t: CompareType, sideA: string, sideB: string, force: boolean) {
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
  }

  useEffect(() => {
    const fromOwnWrite = ownUrl.current === searchParams.toString();
    ownUrl.current = "";
    const nextType: CompareType =
      searchParams.get("type") === "repository" ? "repository" : "developer";
    const nextA = searchParams.get("a") ?? "";
    const nextB = searchParams.get("b") ?? "";
    // keep the editable inputs in sync with the URL (external store) after navigation
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setType(nextType);
    setA(nextA);
    setB(nextB);
    if (fromOwnWrite) return;
    if (nextA.trim() && nextB.trim()) void runWith(nextType, nextA, nextB, false);
    else setData(emptyResult);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
    <div>
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
    return (
      <div className="mt-10">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            [first, sa],
            [second, sb],
          ].map(([entry, summary]) => {
            const d = entry as DevData;
            const s = summary as ReturnType<typeof summarizeRepositories>;
            return (
              <CompareCard key={d.user.login} side={d.user.login === second.user.login ? "B" : "A"} onRefresh={onRun} onSwap={onSwap}>
                <CardHeader title={d.user.name || d.user.login} subtitle={`@${d.user.login}`} />
                <Metric label="Followers" value={compactNumber(d.user.followers || 0)} />
                <Metric label="Repositories" value={d.user.public_repos || 0} />
                <Metric label="Total stars" value={compactNumber(s.totalStars)} />
                <Metric label="Total forks" value={compactNumber(s.totalForks)} />
                <FooterRow>
                  Primary language:{" "}
                  <b>{s.languages[0]?.name || "—"}</b>
                </FooterRow>
              </CompareCard>
            );
          })}
        </div>
        <p className="mt-6 text-xs text-ink3">
          Both scores reflect live GitHub data. DevHub never declares a winner —
          keep the judgment human.
        </p>
      </div>
    );
  }

  const [first, second] = data as [RepoData, RepoData];
  return (
    <div className="mt-10">
      <div className="grid gap-4 md:grid-cols-2">
        {[first, second].map((d) => (
          <CompareCard
            key={d.repository.full_name}
            side={d.repository.full_name === second.repository.full_name ? "B" : "A"}
            onRefresh={onRun}
            onSwap={onSwap}
          >
            <CardHeader
              title={d.repository.full_name ?? d.repository.name}
              subtitle={d.repository.description ?? ""}
            />
            <Metric label="Stars" value={compactNumber(d.repository.stargazers_count)} />
            <Metric label="Forks" value={compactNumber(d.repository.forks_count)} />
            <Metric label="Issues" value={compactNumber(d.repository.open_issues_count || 0)} />
            <Metric label="Contributors" value={d.contributors.length} />
            <FooterRow>
              Language: <b>{d.repository.language || "—"}</b> · License:{" "}
              <b>{d.repository.license?.name || "—"}</b>
            </FooterRow>
          </CompareCard>
        ))}
      </div>
      <p className="mt-6 text-xs text-ink3">
        Factual GitHub metrics, side by side. DevHub never declares a winner.
      </p>
    </div>
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
    <section className="card-surface p-6">
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

function CardHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold tracking-tight text-ink">{title}</h3>
      {subtitle && <p className="mt-1 truncate text-sm text-ink3">{subtitle}</p>}
    </div>
  );
}

const Metric = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex items-center justify-between border-t border-line py-3">
    <span className="text-xs uppercase tracking-wider text-ink3">{label}</span>
    <span className="font-semibold tabular-nums text-ink">{value}</span>
  </div>
);

const FooterRow = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-4 text-sm text-ink3">{children}</p>
);