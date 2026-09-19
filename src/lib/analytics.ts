import type { GitHubRepo } from "@/types/github";

export function languagePercentages(languages: Record<string, number>) {
  const total = Object.values(languages).reduce((sum, value) => sum + value, 0);
  if (!total) return [];
  return Object.entries(languages).map(([name, bytes]) => ({ name, bytes, value: Math.round((bytes / total) * 1000) / 10 })).sort((a,b)=>b.bytes-a.bytes);
}

export function summarizeRepositories(repos: Pick<GitHubRepo,"name"|"stargazers_count"|"forks_count"|"language"|"updated_at">[]) {
  const counts = repos.reduce<Record<string,number>>((acc, repo) => { if(repo.language) acc[repo.language]=(acc[repo.language]||0)+1; return acc; }, {});
  return {
    totalStars: repos.reduce((sum, repo)=>sum+repo.stargazers_count,0),
    totalForks: repos.reduce((sum, repo)=>sum+repo.forks_count,0),
    mostStarred: [...repos].sort((a,b)=>b.stargazers_count-a.stargazers_count)[0] ?? null,
    languages: languagePercentages(counts),
  };
}

export const compactNumber = (value:number) => new Intl.NumberFormat("en", { notation:"compact", maximumFractionDigits:1 }).format(value);
export const formatDate = (value?:string) => value ? new Intl.DateTimeFormat("en",{dateStyle:"medium"}).format(new Date(value)) : "—";

