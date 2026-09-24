export function normalizeGithubOwnerQuery(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  const owner = value.replace(/^@/, "").replace(/^user:/i, "").trim();
  if (!owner || /[\s/]/.test(owner)) return null;
  if (!/^[a-zA-Z0-9-]{1,39}$/.test(owner)) return null;
  return owner;
}
