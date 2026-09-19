export interface GitHubUser { login:string; id:number; avatar_url:string; html_url:string; name?:string|null; bio?:string|null; company?:string|null; location?:string|null; blog?:string|null; followers?:number; following?:number; public_repos?:number; created_at?:string }
export interface GitHubRepo { id?:number; name:string; full_name?:string; owner?:GitHubUser; html_url?:string; description?:string|null; stargazers_count:number; forks_count:number; watchers_count?:number; open_issues_count?:number; subscribers_count?:number; language:string|null; license?:{name:string}|null; default_branch?:string; size?:number; created_at?:string; updated_at:string; pushed_at?:string; topics?:string[] }
export interface Contributor { login:string; avatar_url:string; html_url:string; contributions:number }
export interface SearchResult<T> { total_count:number; items:T[] }
export interface RateLimit { limit:number; remaining:number; reset:number }

