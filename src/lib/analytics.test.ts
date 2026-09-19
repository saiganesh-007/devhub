import assert from "node:assert/strict";
import test from "node:test";
import { languagePercentages, summarizeRepositories } from "./analytics.ts";

test("languagePercentages converts bytes to rounded factual shares", () => {
  assert.deepEqual(languagePercentages({ TypeScript: 700, Python: 300 }), [
    { name: "TypeScript", value: 70, bytes: 700 },
    { name: "Python", value: 30, bytes: 300 },
  ]);
});

test("languagePercentages handles an empty response", () => {
  assert.deepEqual(languagePercentages({}), []);
});

test("summarizeRepositories aggregates stars forks and languages", () => {
  const repos = [
    { name: "one", stargazers_count: 8, forks_count: 2, language: "TypeScript", updated_at: "2026-01-01" },
    { name: "two", stargazers_count: 3, forks_count: 4, language: "Python", updated_at: "2026-02-01" },
  ];
  assert.deepEqual(summarizeRepositories(repos), {
    totalStars: 11,
    totalForks: 6,
    mostStarred: repos[0],
    languages: [
      { name: "TypeScript", value: 50, bytes: 1 },
      { name: "Python", value: 50, bytes: 1 },
    ],
  });
});
