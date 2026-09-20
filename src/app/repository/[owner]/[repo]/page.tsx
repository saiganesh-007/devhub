import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell";
import { RecentViewBeacon } from "@/components/recent-view-beacon";
import { RepositoryContent } from "@/components/repository-content";
import { GitHubError, getLanguages, getContributors, getActivity, getLatestRelease, getReadme, getRepo } from "@/lib/github/client";
import { optionalRequest } from "@/lib/github/settle";

export default async function RepoPage({ params }: { params: Promise<{ owner: string; repo: string }> }) {
  const { owner, repo } = await params;
  let repository, languages, contributors, activity, readme, release;
  try {
    [repository, languages, contributors, activity, readme, release] = await Promise.all([
      getRepo(owner, repo),
      optionalRequest(getLanguages(owner, repo), {}),
      optionalRequest(getContributors(owner, repo), []),
      optionalRequest(getActivity(owner, repo), []),
      optionalRequest(getReadme(owner, repo), null),
      optionalRequest(getLatestRelease(owner, repo), null),
    ]);
  } catch (e) {
    if (e instanceof GitHubError && e.status === 404) notFound();
    throw e;
  }

  return (
    <AppShell section="Repository">
      <RecentViewBeacon
        type="repository"
        identifier={repository.full_name || `${owner}/${repo}`}
        metadata={{ name: repository.full_name, description: repository.description, language: repository.language }}
      />

      <RepositoryContent
        repository={repository}
        languages={languages}
        contributors={contributors}
        activity={activity}
        readme={readme?.encoding === "base64" && readme.size <= 200_000 ? Buffer.from(readme.content.replace(/\n/g, ""), "base64").toString("utf8").slice(0, 40_000) : null}
        release={release}
      />
    </AppShell>
  );
}
