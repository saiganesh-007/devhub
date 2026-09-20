export type GitHubErrorCode = "GITHUB_UNAUTHORIZED" | "NOT_FOUND" | "RATE_LIMITED" | "GITHUB_UNAVAILABLE" | "GITHUB_ERROR";
export function githubErrorCode(status: number, remaining = 1): GitHubErrorCode {
  if (status === 401) return "GITHUB_UNAUTHORIZED";
  if (status === 404) return "NOT_FOUND";
  if (status === 429 || (status === 403 && remaining === 0)) return "RATE_LIMITED";
  if (status >= 500) return "GITHUB_UNAVAILABLE";
  return "GITHUB_ERROR";
}
export function shouldRetryGitHub(status: number, attempt: number) {
  return status >= 500 && status <= 599 && attempt < 1;
}
