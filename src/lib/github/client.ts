import "server-only";
import type { Contributor, GitHubRepo, GitHubUser, RateLimit, SearchResult } from "@/types/github";

export class GitHubError extends Error { constructor(message:string, public status:number, public rateLimit?:RateLimit){ super(message); } }
function clampPerPage(value:number){ if(!Number.isFinite(value)) return 12; return Math.max(5,Math.min(30,Math.floor(value))); }
async function github<T>(path:string, revalidate=300):Promise<T>{
  try {
    const response=await fetch(`https://api.github.com${path}`,{headers:{Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28",...(process.env.GITHUB_TOKEN?{Authorization:`Bearer ${process.env.GITHUB_TOKEN}`}:{})},next:{revalidate},signal:AbortSignal.timeout(12_000)});
    const rateLimit={limit:Number(response.headers.get("x-ratelimit-limit")||0),remaining:Number(response.headers.get("x-ratelimit-remaining")||0),reset:Number(response.headers.get("x-ratelimit-reset")||0)};
    if(!response.ok){ const body=await response.json().catch(()=>({message:"GitHub is unavailable"})) as {message?:string}; throw new GitHubError(response.status===403&&rateLimit.remaining===0?"GitHub API rate limit reached. Try again after the reset window.":body.message||"GitHub request failed",response.status,rateLimit); }
    return response.json() as Promise<T>;
  } catch(error){ if(error instanceof GitHubError) throw error; throw new GitHubError("Could not reach GitHub. Check your connection and retry.",503); }
}
export const searchUsers=(q:string,page=1,perPage=12)=>github<SearchResult<GitHubUser>>(`/search/users?q=${encodeURIComponent(q)}&per_page=${clampPerPage(perPage)}&page=${page}`,60);
export const getUser=(username:string)=>github<GitHubUser>(`/users/${encodeURIComponent(username)}`);
export const getUserRepos=(username:string)=>github<GitHubRepo[]>(`/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100`);
export const searchRepos=(q:string,page=1,perPage=12)=>github<SearchResult<GitHubRepo>>(`/search/repositories?q=${encodeURIComponent(q)}&sort=stars&per_page=${clampPerPage(perPage)}&page=${page}`,60);
export const getRepo=(owner:string,repo:string)=>github<GitHubRepo>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
export const getLanguages=(owner:string,repo:string)=>github<Record<string,number>>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`);
export const getContributors=(owner:string,repo:string)=>github<Contributor[]>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contributors?per_page=12`);
export const getActivity=(owner:string,repo:string)=>github<Array<{sha:string;html_url:string;commit:{message:string;author:{name:string;date:string}};author:GitHubUser|null}>>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?per_page=8`,120);
